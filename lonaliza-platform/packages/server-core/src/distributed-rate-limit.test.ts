import { describe, expect, it } from "vitest";
import { distributedRateLimit, resetRateLimitMemoryForTests } from "./distributed-rate-limit.js";

describe("distributedRateLimit memory fallback", () => {
  it("allows under limit", async () => {
    resetRateLimitMemoryForTests();
    process.env.REDIS_PORT = "6399";
    const r = await distributedRateLimit("test-key", 3, 60_000);
    expect(r.ok).toBe(true);
    expect(r.backend).toBe("memory");
  });
});
