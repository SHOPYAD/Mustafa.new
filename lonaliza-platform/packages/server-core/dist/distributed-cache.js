import { Redis } from "ioredis";
import { redisConfigFromEnv } from "./redis-config";
const memory = new Map();
let cacheClient = null;
let cacheFailedAt = 0;
async function getRedis() {
    if (cacheClient)
        return cacheClient;
    if (Date.now() - cacheFailedAt < 30_000)
        return null;
    try {
        const cfg = redisConfigFromEnv("lonaliza:cache:");
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
        cacheClient = client;
        return client;
    }
    catch {
        cacheFailedAt = Date.now();
        return null;
    }
}
export async function cacheGet(key) {
    const redis = await getRedis();
    if (redis) {
        try {
            const raw = await redis.get(key);
            if (raw)
                return JSON.parse(raw);
        }
        catch {
            cacheFailedAt = Date.now();
        }
    }
    const entry = memory.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
        if (entry)
            memory.delete(key);
        return undefined;
    }
    return JSON.parse(entry.value);
}
export async function cacheSet(key, value, ttlMs) {
    const payload = JSON.stringify(value);
    const redis = await getRedis();
    if (redis) {
        try {
            const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
            await redis.set(key, payload, "EX", ttlSec);
            return;
        }
        catch {
            cacheFailedAt = Date.now();
        }
    }
    memory.set(key, { value: payload, expiresAt: Date.now() + ttlMs });
}
export function resetCacheMemoryForTests() {
    memory.clear();
}
