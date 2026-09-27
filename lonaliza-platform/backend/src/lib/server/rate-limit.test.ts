import { describe, expect, it } from "vitest";
import { rateLimit, resetRateLimitForTests } from "@/lib/server/rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    resetRateLimitForTests();
    const key = `test-${Date.now()}`;
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    const blocked = rateLimit(key, 2, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
