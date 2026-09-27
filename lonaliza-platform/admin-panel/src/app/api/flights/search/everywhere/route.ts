import { NextRequest } from "next/server";
import { PUBLIC_FLIGHT_EMPTY, runEverywhereSearch } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const originSkyId = (q.get("originSkyId") || "").trim();
  const originEntityId = (q.get("originEntityId") || "").trim();
  if (!originSkyId || !originEntityId) {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const result = await runEverywhereSearch({
    originSkyId,
    originEntityId,
    travelDate: q.get("travelDate") || undefined,
    currency: q.get("currency") || undefined,
    market: q.get("market") || undefined,
    countryCode: q.get("countryCode") || undefined,
  });
  if (!result.ok) return flightsFailJson(result.errorCode);

  return flightsJson({
    ok: true,
    provider: "live",
    destinations: result.destinations,
    empty: result.destinations.length === 0,
    error: result.destinations.length === 0 ? PUBLIC_FLIGHT_EMPTY : undefined,
  });
}
