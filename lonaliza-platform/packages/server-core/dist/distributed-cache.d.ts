export declare function cacheGet<T>(key: string): Promise<T | undefined>;
export declare function cacheSet<T>(key: string, value: T, ttlMs: number): Promise<void>;
export declare function resetCacheMemoryForTests(): void;
