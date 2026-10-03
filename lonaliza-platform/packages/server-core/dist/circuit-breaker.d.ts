export type CircuitState = "closed" | "open" | "half_open";
export type CircuitBreakerOptions = {
    failureThreshold: number;
    resetTimeoutMs: number;
    name: string;
};
type CircuitRecord = {
    state: CircuitState;
    failures: number;
    openedAt: number;
    lastError?: string;
};
export declare function circuitBreakerStatus(name: string): CircuitRecord;
export declare function withCircuitBreaker<T>(options: CircuitBreakerOptions, fn: () => Promise<T>): Promise<T>;
export declare function resetCircuitBreakerForTests(name?: string): void;
export {};
