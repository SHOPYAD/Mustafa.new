export type RateLimitResult = {
    ok: boolean;
    retryAfterSec: number;
    remaining: number;
    backend: "redis" | "memory";
};
/** Sliding window rate limit with Redis; falls back to in-process Map. */
export declare function distributedRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
export declare function resetRateLimitMemoryForTests(): void;
