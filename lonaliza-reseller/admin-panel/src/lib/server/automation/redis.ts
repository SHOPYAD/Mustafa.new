import { promises as fs } from "fs";
import path from "path";
import { getServerEnv } from "@/lib/server/env-store";

export const AUTOMATION_REDIS_PREFIX = "lonaliza:automation:";
export const AUTOMATION_QUEUE_NAME = "lonaliza-automation";

export type AutomationRedisConfig = {
  host: string;
  port: number;
  password?: string;
  prefix: string;
};

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

/**
 * Reuse the existing hotel Redis (127.0.0.1:6380) with a dedicated key prefix.
 * Never logs the password.
 */
export async function resolveAutomationRedisConfig(): Promise<AutomationRedisConfig> {
  const hotel = await readHotelEngineEnv();
  const host =
    (await getServerEnv("AUTOMATION_REDIS_HOST")).trim() ||
    process.env.AUTOMATION_REDIS_HOST?.trim() ||
    process.env.REDIS_HOST?.trim() ||
    hotel.REDIS_HOST?.trim() ||
    "127.0.0.1";
  const port = Number(
    (await getServerEnv("AUTOMATION_REDIS_PORT")).trim() ||
      process.env.AUTOMATION_REDIS_PORT ||
      process.env.REDIS_PORT ||
      hotel.REDIS_PORT ||
      6380
  );
  const password =
    (await getServerEnv("AUTOMATION_REDIS_PASSWORD")).trim() ||
    process.env.AUTOMATION_REDIS_PASSWORD?.trim() ||
    process.env.REDIS_PASSWORD?.trim() ||
    hotel.REDIS_PASSWORD?.trim() ||
    undefined;
  return {
    host,
    port: Number.isFinite(port) ? port : 6380,
    password: password || undefined,
    prefix: AUTOMATION_REDIS_PREFIX,
  };
}

export async function pingAutomationRedis(): Promise<{ ok: boolean; host: string; port: number; error?: string }> {
  const cfg = await resolveAutomationRedisConfig();
  try {
    const Redis = (await import("ioredis")).default;
    const client = new Redis({
      host: cfg.host,
      port: cfg.port,
      password: cfg.password,
      keyPrefix: cfg.prefix,
      connectTimeout: 2500,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    await client.connect();
    const pong = await client.ping();
    await client.quit();
    return { ok: pong === "PONG", host: cfg.host, port: cfg.port };
  } catch (error) {
    return {
      ok: false,
      host: cfg.host,
      port: cfg.port,
      error: error instanceof Error ? error.message : "Redis unavailable",
    };
  }
}
