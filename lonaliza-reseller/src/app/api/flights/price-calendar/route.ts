import { NextRequest } from "next/server";
import { PUBLIC_FLIGHT_EMPTY, runPriceCalendar } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const originSkyId = (q.get("originSkyId") || "").trim();
  const destinationSkyId = (q.get("destinationSkyId") || "").trim();
  const originEntityId = (q.get("originEntityId") || "").trim();
  const destinationEntityId = (q.get("destinationEntityId") || "").trim();
  const fromDate = (q.get("fromDate") || "").trim();
  if (!originSkyId || !destinationSkyId || !originEntityId || !destinationEntityId || !fromDate) {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const result = await runPriceCalendar({
    originSkyId,
    destinationSkyId,
    originEntityId,
    destinationEntityId,
    fromDate,
    toDate: q.get("toDate") || undefined,
    currency: q.get("currency") || undefined,
  });
  if (!result.ok) return flightsFailJson(result.errorCode);

  const cheapest = result.days.reduce(
    (min, day) => (day.price.client < min ? day.price.client : min),
    Number.POSITIVE_INFINITY
  );

  return flightsJson({
    ok: true,
    provider: "live",
    days: result.days.map((day) => ({
      ...day,
      cheapest: day.price.client === cheapest && cheapest !== Number.POSITIVE_INFINITY,
    })),
  });
}
