import { NextRequest } from "next/server";
import { encodeLegs, runFlightDetails } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

/**
 * Sky Scrapper has no seats endpoint. We never invent an upstream path.
 * If getFlightDetails already includes seat/cabin info, it is passed through.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const itineraryId = (q.get("itineraryId") || "").trim();
  const legs = encodeLegs(q.get("legs"));

  if (!itineraryId) {
    return flightsJson({
      ok: true,
      provider: "live",
      available: false,
      seats: [],
      reason: "not_supported",
    });
  }

  if (legs && legs !== "[]") {
    const details = await runFlightDetails({
      itineraryId,
      legs,
      sessionId: q.get("sessionId") || undefined,
      currency: q.get("currency") || undefined,
      market: q.get("market") || undefined,
      countryCode: q.get("countryCode") || undefined,
    });
    if (!details.ok) return flightsFailJson(details.errorCode);
    const payload = details.details;
    const seats =
      (payload.seats as unknown) ||
      (payload.seatMap as unknown) ||
      (payload.cabinSeats as unknown) ||
      [];
    return flightsJson({
      ok: true,
      provider: "live",
      available: Array.isArray(seats) && seats.length > 0,
      seats: Array.isArray(seats) ? seats : [],
      reason: Array.isArray(seats) && seats.length > 0 ? undefined : "not_supported",
    });
  }

  return flightsJson({
    ok: true,
    provider: "live",
    available: false,
    seats: [],
    reason: "not_supported",
  });
}
