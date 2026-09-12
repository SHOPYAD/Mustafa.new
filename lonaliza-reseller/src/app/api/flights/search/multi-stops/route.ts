import { NextRequest } from "next/server";
import { encodeLegs, PUBLIC_FLIGHT_EMPTY, runMultiStopsSearch } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const legs = encodeLegs(q.get("legs"));
  if (!legs || legs === "[]") {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const result = await runMultiStopsSearch({
    legs,
    adults: Number(q.get("adults") || 1),
    cabinClass: q.get("cabinClass") || undefined,
    currency: q.get("currency") || undefined,
  });
  if (!result.ok) return flightsFailJson(result.errorCode);

  return flightsJson({
    ok: true,
    provider: "live",
    sessionId: result.session.sessionId,
    status: result.session.status,
    itineraries: result.session.itineraries,
    currency: result.session.currency,
  });
}
