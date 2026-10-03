import { describe, expect, it } from "vitest";
import { rateLimit, resetRateLimitForTests } from "@/lib/server/rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit then blocks", async () => {
    resetRateLimitForTests();
    const key = `test-${Date.now()}`;
    expect((await rateLimit(key, 2, 60_000)).ok).toBe(true);
    expect((await rateLimit(key, 2, 60_000)).ok).toBe(true);
    const blocked = await rateLimit(key, 2, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
