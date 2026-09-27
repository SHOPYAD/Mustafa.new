import { NextResponse } from "next/server";

type Bucket = {
  hits: number[];
};

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 20_000;

function prune(now: number, windowMs: number, bucket: Bucket): void {
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((t) => t > cutoff);
}

export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim() || "";
  if (real) return real.slice(0, 64);
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim() || "";
  return (first || "unknown").slice(0, 64);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number; remaining: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size > MAX_KEYS) {
      const oldest = buckets.keys().next().value;
      if (oldest) buckets.delete(oldest);
    }
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  prune(now, windowMs, bucket);
  if (bucket.hits.length >= limit) {
    const retryAfterMs = (bucket.hits[0] || now) + windowMs - now;
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      remaining: 0,
    };
  }
  bucket.hits.push(now);
  return {
    ok: true,
    retryAfterSec: 0,
    remaining: Math.max(0, limit - bucket.hits.length),
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

/** Test helper — not used in production routes. */
export function resetRateLimitForTests(): void {
  buckets.clear();
}
