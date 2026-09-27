import { NextRequest } from "next/server";
import { quotePaidBaggage } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limited = rateLimit(`flights-ancillary:${clientIp(req)}`, 30, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return flightsJson({ ok: false, errorCode: "search_failed" }, 400);
  }

  const sessionId = String(body.sessionId || "").trim();
  const itineraryId = String(body.itineraryId || "").trim();
  if (!sessionId || !itineraryId) {
    return flightsJson({ ok: false, errorCode: "search_failed" }, 400);
  }

  const result = await quotePaidBaggage({
    sessionId,
    itineraryId,
    fareId: body.fareId ? String(body.fareId) : undefined,
    adults: Number(body.adults || 1),
    children: Number(body.children || body.childrens || 0),
    infants: Number(body.infants || 0),
    currency: body.currency ? String(body.currency) : undefined,
  });

  if (!result.ok) return flightsFailJson(result.errorCode);
  return flightsJson({ ok: true, options: result.options });
}
