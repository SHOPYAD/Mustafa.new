import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_FLIGHT_EMPTY, runFlightSearch } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { ttlGet, ttlSet } from "@/lib/server/ttl-cache";
import { cacheGet } from "../../../../../../packages/server-core/src/distributed-cache";
import {
  enqueueFlightSearchJob,
  flightSearchCacheKeyFromQuery,
} from "@/lib/server/search-jobs";
import { withBulkhead } from "../../../../../../packages/server-core/src/bulkhead";
import { withCircuitBreaker } from "../../../../../../packages/server-core/src/circuit-breaker";

export const runtime = "nodejs";

function asyncSearchEnabled(): boolean {
  const v = (process.env.FLIGHT_SEARCH_ASYNC || "1").trim().toLowerCase();
  return v !== "0" && v !== "false";
}

export async function GET(req: NextRequest) {
  const limited = await rateLimit(`flights-search:${clientIp(req)}`, 40, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const search = req.nextUrl.search;
  const cacheKey = `flights:v11:${search}`;
  const cacheKeyHash = flightSearchCacheKeyFromQuery(search);

  const redisCached = await cacheGet<Record<string, unknown>>(`flights:v11:${cacheKeyHash}`);
  if (redisCached) return flightsJson(redisCached);

  const cached = ttlGet<Record<string, unknown>>(cacheKey);
  if (cached) return flightsJson(cached);

  const q = req.nextUrl.searchParams;
  const originSkyId = (q.get("originSkyId") || q.get("origin") || "").trim().toUpperCase();
  const destinationSkyId = (q.get("destinationSkyId") || q.get("destination") || "").trim().toUpperCase();
  let originEntityId = (q.get("originEntityId") || "").trim();
  let destinationEntityId = (q.get("destinationEntityId") || "").trim();
  const date = (q.get("date") || q.get("departureDate") || "").trim();

  if (!originSkyId || !destinationSkyId || !date) {
    return flightsJson(
      {
        ok: false,
        provider: "live",
        error: PUBLIC_FLIGHT_EMPTY,
        errorCode: "search_failed",
      },
      400
    );
  }

  if (!originEntityId || !destinationEntityId) {
    try {
      const { lookupSkyEntity, ensureSkyEntityMap } = await import("@/lib/server/sky-entity-ids");
      await ensureSkyEntityMap();
      originEntityId = originEntityId || lookupSkyEntity(originSkyId)?.entityId || `ent_${originSkyId}`;
      destinationEntityId =
        destinationEntityId || lookupSkyEntity(destinationSkyId)?.entityId || `ent_${destinationSkyId}`;
    } catch {
      originEntityId = originEntityId || `ent_${originSkyId}`;
      destinationEntityId = destinationEntityId || `ent_${destinationSkyId}`;
    }
  }

  const input = {
    originSkyId,
    destinationSkyId,
    originEntityId,
    destinationEntityId,
    date,
    returnDate: q.get("returnDate") || undefined,
    adults: Number(q.get("adults") || 1),
    childrens: Number(q.get("childrens") || q.get("children") || 0),
    infants: Number(q.get("infants") || 0),
    cabinClass: q.get("cabinClass") || undefined,
    sortBy: q.get("sortBy") || undefined,
    currency: q.get("currency") || undefined,
    market: q.get("market") || undefined,
    countryCode: q.get("countryCode") || undefined,
  };

  if (asyncSearchEnabled() && q.get("sync") !== "1") {
    const { jobId } = await enqueueFlightSearchJob(search, input);
    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        jobId,
        pollUrl: `/api/flights/search/status?jobId=${encodeURIComponent(jobId)}`,
      },
      { status: 202, headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await withBulkhead(
    { name: "flight-provider", maxConcurrent: Number(process.env.FLIGHT_SEARCH_CONCURRENCY || 12) },
    () =>
      withCircuitBreaker(
        {
          name: "flight-provider",
          failureThreshold: Number(process.env.FLIGHT_CIRCUIT_FAILURES || 5),
          resetTimeoutMs: Number(process.env.FLIGHT_CIRCUIT_RESET_MS || 60_000),
        },
        () => runFlightSearch(input)
      )
  );

  if (!result.ok) return flightsFailJson(result.errorCode);

  const { session } = result;
  const payload = {
    ok: true,
    provider: "live",
    sessionId: session.sessionId,
    status: session.status,
    itineraries: session.itineraries,
    currency: session.currency,
    empty: session.itineraries.length === 0,
    error: session.itineraries.length === 0 ? PUBLIC_FLIGHT_EMPTY : undefined,
    errorCode: session.itineraries.length === 0 ? "zero_results" : undefined,
  };
  ttlSet(cacheKey, payload, 2 * 60 * 1000);
  return flightsJson(payload);
}
