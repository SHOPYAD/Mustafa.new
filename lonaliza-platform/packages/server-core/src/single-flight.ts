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

export class SingleFlight<T = any> {
  private inFlight = new Map<string, Promise<T>>();
  private recentResults = new Map<string, { value: T; expiresAt: number }>();
  private stats: SingleFlightStats = {
    inFlight: 0,
    totalExecutions: 0,
    coalescedHits: 0,
    errors: 0,
  };

  /**
   * Executes fn only once per key among all concurrent callers.
   * If a call for `key` is already in flight, returns the existing Promise.
   * If a recent result exists within options.ttlMs, returns it immediately.
   */
  async do(
    key: string,
    fn: () => Promise<T>,
    options?: SingleFlightOptions
  ): Promise<T> {
    const ttlMs = options?.ttlMs ?? 0;
    const now = Date.now();

    // 1. Check short-term memoized result if TTL configured
    if (ttlMs > 0) {
      const cached = this.recentResults.get(key);
      if (cached && cached.expiresAt > now) {
        this.stats.coalescedHits++;
        return cached.value;
      }
    }

    // 2. Check active in-flight execution
    const active = this.inFlight.get(key);
    if (active) {
      this.stats.coalescedHits++;
      return active;
    }

    // 3. Initiate origin execution
    this.stats.totalExecutions++;
    this.stats.inFlight++;

    const promise = (async () => {
      try {
        const result = await fn();
        if (ttlMs > 0) {
          this.recentResults.set(key, {
            value: result,
            expiresAt: Date.now() + ttlMs,
          });
          // Prune older entries if map grows too large
          if (this.recentResults.size > 5000) {
            const first = this.recentResults.keys().next().value;
            if (first) this.recentResults.delete(first);
          }
        }
        return result;
      } catch (err) {
        this.stats.errors++;
        throw err;
      } finally {
        this.inFlight.delete(key);
        this.stats.inFlight = Math.max(0, this.stats.inFlight - 1);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  getStats(): SingleFlightStats {
    return { ...this.stats, inFlight: this.inFlight.size };
  }

  resetForTests(): void {
    this.inFlight.clear();
    this.recentResults.clear();
    this.stats = { inFlight: 0, totalExecutions: 0, coalescedHits: 0, errors: 0 };
  }
}

/** Pre-instantiated domain coalescers */
export const hotelSearchFlight = new SingleFlight<any>();
export const flightSearchFlight = new SingleFlight<any>();
export const transferSearchFlight = new SingleFlight<any>();
