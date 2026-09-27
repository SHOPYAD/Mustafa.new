import { NextRequest } from "next/server";
import { encodeLegs, PUBLIC_FLIGHT_EMPTY, runFlightDetails } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const itineraryId = (q.get("itineraryId") || "").trim();
  const legs = encodeLegs(q.get("legs"));
  if (!itineraryId || !legs || legs === "[]") {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const result = await runFlightDetails({
    itineraryId,
    legs,
    sessionId: q.get("sessionId") || undefined,
    currency: q.get("currency") || undefined,
    market: q.get("market") || undefined,
    countryCode: q.get("countryCode") || undefined,
    quotedClient: q.get("quotedPrice") ? Number(q.get("quotedPrice")) : undefined,
  });
  if (!result.ok) return flightsFailJson(result.errorCode);

  return flightsJson({
    ok: true,
    provider: "live",
    itinerary: result.itinerary,
    details: result.details,
    price: result.price,
    fareChanged: Boolean(result.price.fareChanged),
  });
}
