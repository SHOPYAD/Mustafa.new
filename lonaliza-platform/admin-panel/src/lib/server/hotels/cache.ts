/**
 * Hotels cache — Redis (127.0.0.1:6380, prefix `lonaliza:hotels:`) with an
 * in-memory fallback so search sessions and quotes survive when Redis is down.
 */

import { resolveAutomationRedisConfig } from "@/lib/server/automation/redis";
import { supplyLogger } from "./telemetry";

export const HOTELS_REDIS_PREFIX = "lonaliza:hotels:";

type RedisClient = import("ioredis").default;

let client: RedisClient | null = null;
let clientFailedAt = 0;
const memory = new Map<string, { value: string; exp: number }>();

async function getRedis(): Promise<RedisClient | null> {
  if (client) return client;
  // Back off for 30s after a failed connection attempt.
  if (clientFailedAt && Date.now() - clientFailedAt < 30_000) return null;
  try {
    const cfg = await resolveAutomationRedisConfig();
    const Redis = (await import("ioredis")).default;
    const c = new Redis({
      host: cfg.host,
      port: cfg.port,
      password: cfg.password,
      keyPrefix: HOTELS_REDIS_PREFIX,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    c.on("error", (err) => {
      supplyLogger.debug({ err: err.message }, "hotels redis error");
    });
    await c.connect();
    client = c;
    return client;
  } catch (err) {
    clientFailedAt = Date.now();
    supplyLogger.warn({ err: String(err) }, "hotels redis unavailable, using memory cache");
    return null;
  }
}

function memoryGc(): void {
  if (memory.size < 5000) return;
  const now = Date.now();
  for (const [k, v] of memory) if (v.exp <= now) memory.delete(k);
  if (memory.size > 5000) {
    const first = memory.keys().next().value;
    if (first) memory.delete(first);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = await getRedis();
  if (r) {
    try {
      const raw = await r.get(key);
      if (raw) return JSON.parse(raw) as T;
      return null;
    } catch {
      /* fall through to memory */
    }
  }
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.exp <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return JSON.parse(hit.value) as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSec: number): Promise<void> {
  const raw = JSON.stringify(value);
  const r = await getRedis();
  if (r) {
    try {
      await r.set(key, raw, "EX", Math.max(1, Math.round(ttlSec)));
      return;
    } catch {
      /* fall through */
    }
  }
  memoryGc();
  memory.set(key, { value: raw, exp: Date.now() + ttlSec * 1000 });
}

/**
 * Acquire a short-lived lock (SET NX). Returns true when this caller owns the lock. Used to make
 * supplier bookings idempotent when the payment callback and webhook race each other.
 */
export async function cacheLock(key: string, ttlSec: number): Promise<boolean> {
  const r = await getRedis();
  if (r) {
    try {
      const res = await r.set(key, "1", "EX", Math.max(1, Math.round(ttlSec)), "NX");
      return res === "OK";
    } catch {
      /* fall through */
    }
  }
  const hit = memory.get(key);
  if (hit && hit.exp > Date.now()) return false;
  memory.set(key, { value: "1", exp: Date.now() + ttlSec * 1000 });
  return true;
}

export async function cacheDel(key: string): Promise<void> {
  const r = await getRedis();
  if (r) {
    try {
      await r.del(key);
    } catch {
      /* ignore */
    }
  }
  memory.delete(key);
}

export async function cacheHealth(): Promise<{ ok: boolean; backend: "redis" | "memory"; error?: string }> {
  const r = await getRedis();
  if (!r) return { ok: true, backend: "memory", error: "redis unavailable" };
  try {
    const pong = await r.ping();
    return { ok: pong === "PONG", backend: "redis" };
  } catch (err) {
    return { ok: false, backend: "redis", error: String(err) };
  }
}
