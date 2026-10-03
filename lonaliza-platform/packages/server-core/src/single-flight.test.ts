import { describe, it, expect, beforeEach, vi } from "vitest";
import { SingleFlight } from "./single-flight";

describe("SingleFlight Request Deduplication Engine", () => {
  let flight: SingleFlight;

  beforeEach(() => {
    flight = new SingleFlight();
  });

  it("coalesces 50 concurrent calls into exactly 1 origin execution", async () => {
    let callCount = 0;
    const mockFetcher = vi.fn(async () => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { destination: "Istanbul", hotelsCount: 42 };
    });

    const requests = Array.from({ length: 50 }, () =>
      flight.do("hotels:ist:2026-11-01", mockFetcher)
    );

    const results = await Promise.all(requests);

    expect(callCount).toBe(1);
    expect(mockFetcher).toHaveBeenCalledTimes(1);
    results.forEach((res) => {
      expect(res).toEqual({ destination: "Istanbul", hotelsCount: 42 });
    });

    const stats = flight.getStats();
    expect(stats.totalExecutions).toBe(1);
    expect(stats.coalescedHits).toBe(49);
    expect(stats.inFlight).toBe(0);
  });

  it("propagates origin failure to all concurrent waiters without uncaught crashes", async () => {
    let attempts = 0;
    const failingFetcher = vi.fn(async () => {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 30));
      throw new Error("GDS Rate Limit Exceeded");
    });

    const requests = Array.from({ length: 10 }, () =>
      flight.do("flights:ist-dxb:2026-11-01", failingFetcher).catch((err) => err.message)
    );

    const outcomes = await Promise.all(requests);

    expect(attempts).toBe(1);
    expect(outcomes).toHaveLength(10);
    outcomes.forEach((msg) => {
      expect(msg).toBe("GDS Rate Limit Exceeded");
    });

    const stats = flight.getStats();
    expect(stats.errors).toBe(1);
    expect(stats.inFlight).toBe(0);
  });

  it("serves immediate follow-ups from grace window when ttlMs is specified", async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { timestamp: Date.now() };
    };

    // First call executes origin
    const first = await flight.do("quick-query", fetcher, { ttlMs: 1000 });
    expect(callCount).toBe(1);

    // Second call within 1000ms hits TTL cache
    const second = await flight.do("quick-query", fetcher, { ttlMs: 1000 });
    expect(callCount).toBe(1);
    expect(second).toEqual(first);

    // Call with different key executes origin
    await flight.do("other-query", fetcher, { ttlMs: 1000 });
    expect(callCount).toBe(2);
  });
});
