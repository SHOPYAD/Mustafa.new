import { resolveAutomationRedisConfig } from "@/lib/server/automation/redis";
import { PUBLISH_REDIS_PREFIX } from "./constants";

export type PublishRedisConfig = {
  host: string;
  port: number;
  password?: string;
  prefix: string;
};

/**
 * Same Redis host as automation/hotel (typically 127.0.0.1:6380)
 * with a DISTINCT key prefix so hotel cache keys are never overwritten.
 */
export async function resolvePublishRedisConfig(): Promise<PublishRedisConfig> {
  const base = await resolveAutomationRedisConfig();
  return {
    host: base.host,
    port: base.port,
    password: base.password,
    prefix: PUBLISH_REDIS_PREFIX,
  };
}

export async function pingPublishRedis(): Promise<{
  ok: boolean;
  host: string;
  port: number;
  error?: string;
}> {
  const cfg = await resolvePublishRedisConfig();
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
