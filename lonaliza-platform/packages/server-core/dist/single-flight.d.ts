/**
 * Production-grade SingleFlight Concurrency Coalescer (Request Deduplication)
 * Prevents Cache Stampedes, Thundering Herds, and GDS/Supplier Quota Exhaustion.
 */
export interface SingleFlightStats {
    inFlight: number;
    totalExecutions: number;
    coalescedHits: number;
    errors: number;
}
export interface SingleFlightOptions {
    /** Post-resolution short-term memoization window in milliseconds (default: 0) */
    ttlMs?: number;
}
export declare class SingleFlight<T = any> {
    private inFlight;
    private recentResults;
    private stats;
    /**
     * Executes fn only once per key among all concurrent callers.
     * If a call for `key` is already in flight, returns the existing Promise.
     * If a recent result exists within options.ttlMs, returns it immediately.
     */
    do(key: string, fn: () => Promise<T>, options?: SingleFlightOptions): Promise<T>;
    getStats(): SingleFlightStats;
    resetForTests(): void;
}
/** Pre-instantiated domain coalescers */
export declare const hotelSearchFlight: SingleFlight<any>;
export declare const flightSearchFlight: SingleFlight<any>;
export declare const transferSearchFlight: SingleFlight<any>;
