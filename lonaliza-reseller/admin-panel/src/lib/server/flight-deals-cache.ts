import { promises as fs } from "fs";
import path from "path";
import { getServerEnv } from "@/lib/server/env-store";

function parseEnvFile(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

async function readHotelEngineEnv(): Promise<Record<string, string>> {
  try {
    const file = path.join(process.cwd(), "hotel-engine", ".env");
    const raw = await fs.readFile(file, "utf8");
    return parseEnvFile(raw);
  } catch {
    return {};
  }
}

/** 4 refreshes/day. Stale entries may still be served. */
export const FLIGHT_DEALS_TTL_MS = 6 * 60 * 60 * 1000;
export const FLIGHT_DEALS_STALE_MS = 24 * 60 * 60 * 1000;
export const FLIGHT_DEALS_REDIS_PREFIX = "lonaliza:flights:deals:";

const FILE_DIR = path.join(process.cwd(), ".data", "flights-deals-cache");

type Envelope<T> = { at: number; value: T };

export type FlightDealsCacheHit<T> = {
  value: T;
  at: number;
  fresh: boolean;
};

let redisClient: import("ioredis").default | null = null;
let redisFailedAt = 0;

function safeKey(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

function fileFor(key: string): string {
  return path.join(FILE_DIR, `${safeKey(key).replace(/:/g, "_")}.json`);
}

async function redisHostPort(): Promise<{ host: string; port: number; password?: string }> {
  const hotel = await readHotelEngineEnv();
  const host =
    (await getServerEnv("REDIS_HOST")).trim() ||
    process.env.REDIS_HOST?.trim() ||
    hotel.REDIS_HOST?.trim() ||
    "127.0.0.1";
  const port = Number(
    (await getServerEnv("REDIS_PORT")).trim() ||
      process.env.REDIS_PORT ||
      hotel.REDIS_PORT ||
      6380
  );
  const password =
    (await getServerEnv("REDIS_PASSWORD")).trim() ||
    process.env.REDIS_PASSWORD?.trim() ||
    hotel.REDIS_PASSWORD?.trim() ||
    undefined;
  return {
    host,
    port: Number.isFinite(port) ? port : 6380,
    password: password || undefined,
  };
}

async function getRedis(): Promise<import("ioredis").default | null> {
  if (redisClient) return redisClient;
  if (Date.now() - redisFailedAt < 30_000) return null;
  try {
    const Redis = (await import("ioredis")).default;
    const cfg = await redisHostPort();
    const client = new Redis({
      host: cfg.host,
      port: cfg.port,
      password: cfg.password,
      keyPrefix: FLIGHT_DEALS_REDIS_PREFIX,
      connectTimeout: 2500,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    client.on("error", () => {
      /* file cache remains the fallback */
    });
    await client.connect();
    redisClient = client;
    return client;
  } catch {
    redisFailedAt = Date.now();
    return null;
  }
}

async function readFileEnvelope<T>(key: string): Promise<Envelope<T> | null> {
  try {
    const raw = await fs.readFile(fileFor(key), "utf8");
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (!parsed || typeof parsed !== "object" || parsed.value == null) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeFileEnvelope<T>(key: string, envelope: Envelope<T>): Promise<void> {
  try {
    await fs.mkdir(FILE_DIR, { recursive: true });
    await fs.writeFile(fileFor(key), JSON.stringify(envelope), { mode: 0o600 });
  } catch {
    /* disk optional */
  }
}

function classify<T>(envelope: Envelope<T> | null, allowExpired: boolean): FlightDealsCacheHit<T> | null {
  if (!envelope || envelope.value == null) return null;
  const age = Date.now() - Number(envelope.at || 0);
  if (!Number.isFinite(age) || age < 0) return null;
  if (age <= FLIGHT_DEALS_TTL_MS) {
    return { value: envelope.value, at: envelope.at, fresh: true };
  }
  if (allowExpired && age <= FLIGHT_DEALS_STALE_MS) {
    return { value: envelope.value, at: envelope.at, fresh: false };
  }
  return null;
}

export async function readFlightDealsCache<T>(
  key: string,
  opts?: { allowExpired?: boolean }
): Promise<FlightDealsCacheHit<T> | null> {
  const allowExpired = opts?.allowExpired !== false;
  const redis = await getRedis();
  if (redis) {
    try {
      const raw = await redis.get(safeKey(key));
      if (raw) {
        const parsed = JSON.parse(raw) as Envelope<T>;
        const hit = classify(parsed, allowExpired);
        if (hit) return hit;
      }
    } catch {
      /* fall through to file */
    }
  }
  return classify(await readFileEnvelope<T>(key), allowExpired);
}

export async function writeFlightDealsCache<T>(key: string, value: T): Promise<void> {
  const envelope: Envelope<T> = { at: Date.now(), value };
  const redis = await getRedis();
  if (redis) {
    try {
      const ttlSec = Math.ceil(FLIGHT_DEALS_STALE_MS / 1000);
      await redis.set(safeKey(key), JSON.stringify(envelope), "EX", ttlSec);
    } catch {
      /* file still written */
    }
  }
  await writeFileEnvelope(key, envelope);
}
