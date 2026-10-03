import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_FLIGHT_EMPTY, runFlightSearch, type PublicFlightItinerary } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toMobileOffers(itineraries: PublicFlightItinerary[]) {
  return itineraries.map((row) => ({
    id: row.id,
    pricing: {
      total: row.price.client,
      baseFare: row.price.base,
      taxes: row.price.taxes,
      currency: row.price.currency,
    },
    itineraries: row.legs.map((leg, index) => ({
      direction: index === 0 ? "outbound" : "return",
      durationMinutes: leg.durationMinutes,
      stops: leg.stopCount,
      segments: leg.segments.map((segment) => ({
        marketingAirlineCode: segment.airlineCode,
        flightNumber: segment.flightNumber,
        departure: {
          airportCode: segment.origin?.displayCode || segment.origin?.skyId || "",
          dateTime: segment.departure,
          cityName: segment.origin?.city,
          terminal: segment.origin?.terminal,
        },
        arrival: {
          airportCode: segment.destination?.displayCode || segment.destination?.skyId || "",
          dateTime: segment.arrival,
          cityName: segment.destination?.city,
          terminal: segment.destination?.terminal,
        },
      })),
    })),
  }));
}

export async function GET(req: NextRequest) {
  const channels = await getChannelServices();
  if (!appEnabledKeys(channels).includes("flight")) {
    return NextResponse.json({ ok: true, offers: [], itineraries: [], empty: true }, { status: 200 });
  }

  const limited = await rateLimit(`mobile-flights-search:${clientIp(req)}`, 40, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const q = req.nextUrl.searchParams;
  const originSkyId = (q.get("originSkyId") || q.get("origin") || q.get("originCode") || "").trim().toUpperCase().split(",")[0];
  const destinationSkyId = (q.get("destinationSkyId") || q.get("destination") || q.get("destinationCode") || "").trim().toUpperCase().split(",")[0];
  let originEntityId = (q.get("originEntityId") || "").trim();
  let destinationEntityId = (q.get("destinationEntityId") || "").trim();
  const date = (q.get("date") || q.get("departureDate") || "").trim();

  if (!originSkyId || !destinationSkyId || !date) {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed", offers: [] },
      400
    );
  }

  if (!originEntityId || !destinationEntityId) {
    try {
      const { lookupSkyEntity, ensureSkyEntityMap } = await import("@/lib/server/sky-entity-ids");
      await ensureSkyEntityMap();
      originEntityId = originEntityId || lookupSkyEntity(originSkyId)?.entityId || `ent_${originSkyId}`;
      destinationEntityId = destinationEntityId || lookupSkyEntity(destinationSkyId)?.entityId || `ent_${destinationSkyId}`;
    } catch {
      originEntityId = originEntityId || `ent_${originSkyId}`;
      destinationEntityId = destinationEntityId || `ent_${destinationSkyId}`;
    }
  }

  const result = await runFlightSearch({
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
  });

  if (!result.ok) return flightsFailJson(result.errorCode);

  const { session } = result;
  const offers = toMobileOffers(session.itineraries);
  return flightsJson({
    ok: true,
    provider: "live",
    sessionId: session.sessionId,
    status: session.status,
    itineraries: session.itineraries,
    offers,
    source: "lonaliza",
    meta: { totalResults: offers.length, searchDurationMs: 0, traceId: session.sessionId },
    currency: session.currency,
    empty: session.itineraries.length === 0,
  });
}
