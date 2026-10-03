export type BulkheadOptions = {
    name: string;
    maxConcurrent: number;
};
export declare function withBulkhead<T>(options: BulkheadOptions, fn: () => Promise<T>): Promise<T>;
export declare function resetBulkheadForTests(name?: string): void;
