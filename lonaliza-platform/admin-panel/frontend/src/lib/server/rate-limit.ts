import { NextResponse } from "next/server";
import { distributedRateLimit, resetRateLimitMemoryForTests } from "../../../../../packages/server-core/src/distributed-rate-limit";

export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim() || "";
  if (real) return real.slice(0, 64);
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim() || "";
  return (first || "unknown").slice(0, 64);
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; retryAfterSec: number; remaining: number }> {
  const result = await distributedRateLimit(key, limit, windowMs);
  return {
    ok: result.ok,
    retryAfterSec: result.retryAfterSec,
    remaining: result.remaining,
  };
}

export function rateLimitResponse(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "Cache-Control": "no-store",
      },
    }
  );
}

export function resetRateLimitForTests(): void {
  resetRateLimitMemoryForTests();
}
