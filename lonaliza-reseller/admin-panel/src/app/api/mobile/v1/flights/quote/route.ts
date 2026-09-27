import { NextRequest } from "next/server";
import { runFlightDetails } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const channels = await getChannelServices();
  if (!appEnabledKeys(channels).includes("flight")) {
    return flightsJson({ ok: false, error: "service_disabled" }, 404);
  }

  const q = req.nextUrl.searchParams;
  const itineraryId = (q.get("itineraryId") || q.get("offerCacheId") || "").trim();
  if (!itineraryId) {
    return flightsJson({ ok: false, error: "itinerary_required" }, 400);
  }

  const quoted = q.get("quotedPrice") ? Number(q.get("quotedPrice")) : undefined;
  const result = await runFlightDetails({
    itineraryId,
    legs: q.get("legs") || "",
    sessionId: q.get("sessionId") || undefined,
    currency: q.get("currency") || undefined,
    quotedClient: Number.isFinite(quoted) ? quoted : undefined,
  });

  if (!result.ok) return flightsFailJson(result.errorCode);

  const verified = result.price.client;
  const cached = Number.isFinite(quoted) ? Number(quoted) : verified;
  return flightsJson({
    ok: true,
    cachedTotal: cached,
    verifiedTotal: verified,
    changed: Math.abs(verified - cached) > 0.5,
    bookable: true,
    currency: result.price.currency,
    source: "lonaliza",
  });
}
