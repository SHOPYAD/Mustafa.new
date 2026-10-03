import { cacheGet, cacheSet } from "../../../../packages/server-core/src/distributed-cache";

/** Redis-backed TTL cache with in-memory fallback (shared across instances when Redis is up). */
export async function ttlGetDistributed<T>(key: string): Promise<T | undefined> {
  return cacheGet<T>(key);
}

export async function ttlSetDistributed<T>(key: string, value: T, ttlMs: number): Promise<T> {
  await cacheSet(key, value, ttlMs);
  return value;
}
