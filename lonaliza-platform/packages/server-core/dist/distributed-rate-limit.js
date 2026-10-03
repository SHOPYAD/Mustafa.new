import { Redis } from "ioredis";
import { redisConfigFromEnv } from "./redis-config";
const memoryBuckets = new Map();
const MAX_MEMORY_KEYS = 20_000;
let sharedClient = null;
let redisFailedAt = 0;
async function getRedis() {
    if (sharedClient)
        return sharedClient;
    if (Date.now() - redisFailedAt < 30_000)
        return null;
    try {
        const cfg = redisConfigFromEnv("lonaliza:ratelimit:");
        const client = new Redis({
            host: cfg.host,
            port: cfg.port,
            password: cfg.password,
            keyPrefix: cfg.keyPrefix,
            connectTimeout: 2500,
            maxRetriesPerRequest: 1,
            lazyConnect: true,
        });
        await client.connect();
        sharedClient = client;
        return client;
    }
    catch {
        redisFailedAt = Date.now();
        return null;
    }
}
function memoryRateLimit(key, limit, windowMs) {
    const now = Date.now();
    let bucket = memoryBuckets.get(key);
    if (!bucket) {
        if (memoryBuckets.size > MAX_MEMORY_KEYS) {
            const oldest = memoryBuckets.keys().next().value;
            if (oldest)
                memoryBuckets.delete(oldest);
        }
        bucket = { hits: [] };
        memoryBuckets.set(key, bucket);
    }
    const cutoff = now - windowMs;
    bucket.hits = bucket.hits.filter((t) => t > cutoff);
    if (bucket.hits.length >= limit) {
        const retryAfterMs = (bucket.hits[0] || now) + windowMs - now;
        return {
            ok: false,
            retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
            remaining: 0,
            backend: "memory",
        };
    }
    bucket.hits.push(now);
    return {
        ok: true,
        retryAfterSec: 0,
        remaining: Math.max(0, limit - bucket.hits.length),
        backend: "memory",
    };
}
/** Sliding window rate limit with Redis; falls back to in-process Map. */
export async function distributedRateLimit(key, limit, windowMs) {
    const redis = await getRedis();
    if (!redis)
        return memoryRateLimit(key, limit, windowMs);
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    const redisKey = `sw:${key}:${windowSec}`;
    try {
        const count = await redis.incr(redisKey);
        if (count === 1)
            await redis.expire(redisKey, windowSec);
        if (count > limit) {
            const ttl = await redis.ttl(redisKey);
            return {
                ok: false,
                retryAfterSec: Math.max(1, ttl),
                remaining: 0,
                backend: "redis",
            };
        }
        return {
            ok: true,
            retryAfterSec: 0,
            remaining: Math.max(0, limit - count),
            backend: "redis",
        };
    }
    catch {
        redisFailedAt = Date.now();
        return memoryRateLimit(key, limit, windowMs);
    }
}
export function resetRateLimitMemoryForTests() {
    memoryBuckets.clear();
}
