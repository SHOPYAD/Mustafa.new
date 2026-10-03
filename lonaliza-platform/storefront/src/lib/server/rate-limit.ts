import { NextResponse } from "next/server";
import { distributedRateLimit, resetRateLimitMemoryForTests } from "../../../../packages/server-core/src/distributed-rate-limit";

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

export const RATE_LIMIT_TIERS = {
  PUBLIC_STATIC: { limit: 120, windowMs: 60_000 },
  SEARCH_ENGINE: { limit: 30, windowMs: 60_000 },
  SENSITIVE_ENDPOINT: { limit: 10, windowMs: 60_000 },
} as const;

export async function rateLimitPublicStatic(req: Request, keyPrefix = "public-static") {
  const ip = clientIp(req);
  return rateLimit(`${keyPrefix}:${ip}`, RATE_LIMIT_TIERS.PUBLIC_STATIC.limit, RATE_LIMIT_TIERS.PUBLIC_STATIC.windowMs);
}

export async function rateLimitSearch(req: Request, category = "general") {
  const ip = clientIp(req);
  return rateLimit(`search:${category}:${ip}`, RATE_LIMIT_TIERS.SEARCH_ENGINE.limit, RATE_LIMIT_TIERS.SEARCH_ENGINE.windowMs);
}

export async function rateLimitSensitive(req: Request, action = "action") {
  const ip = clientIp(req);
  return rateLimit(`sensitive:${action}:${ip}`, RATE_LIMIT_TIERS.SENSITIVE_ENDPOINT.limit, RATE_LIMIT_TIERS.SENSITIVE_ENDPOINT.windowMs);
}

/** Test helper — not used in production routes. */
export function resetRateLimitForTests(): void {
  resetRateLimitMemoryForTests();
}

