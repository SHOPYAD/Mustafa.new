import { describe, expect, it } from "vitest";
import {
  rateLimit,
  rateLimitPublicStatic,
  rateLimitSearch,
  rateLimitSensitive,
  resetRateLimitForTests,
} from "@/lib/server/rate-limit";

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

  it("enforces tier thresholds correctly", async () => {
    resetRateLimitForTests();
    const req = new Request("http://localhost/api/test", {
      headers: { "x-real-ip": "198.51.100.42" },
    });

    const staticCheck = await rateLimitPublicStatic(req, "test-static");
    expect(staticCheck.ok).toBe(true);
    expect(staticCheck.remaining).toBe(119);

    const searchCheck = await rateLimitSearch(req, "test-hotels");
    expect(searchCheck.ok).toBe(true);
    expect(searchCheck.remaining).toBe(29);

    const sensitiveCheck = await rateLimitSensitive(req, "test-auth");
    expect(sensitiveCheck.ok).toBe(true);
    expect(sensitiveCheck.remaining).toBe(9);
  });
});
