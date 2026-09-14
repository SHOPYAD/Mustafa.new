import { NextRequest } from "next/server";
import { PUBLIC_FLIGHT_EMPTY, runPriceCalendar } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

const SERVER_CALENDAR_CACHE = new Map<string, { time: number; data: any }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const originSkyId = (q.get("originSkyId") || q.get("origin") || "").trim();
  const destinationSkyId = (q.get("destinationSkyId") || q.get("destination") || "").trim();
  const originEntityId = (q.get("originEntityId") || originSkyId).trim();
  const destinationEntityId = (q.get("destinationEntityId") || destinationSkyId).trim();
  const fromDate = (q.get("fromDate") || new Date().toISOString().slice(0, 10)).trim();
  const currency = (q.get("currency") || "USD").toUpperCase();
  const clientMin = q.get("minPrice") ? Number(q.get("minPrice")) : 0;

  if (!originSkyId || !destinationSkyId) {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const toDate = (q.get("toDate") || "").trim();
  const centerDate = (q.get("centerDate") || q.get("date") || fromDate).trim();
  const cacheKey = `${originSkyId}_${destinationSkyId}_${fromDate}_${toDate}_${centerDate}_${currency}_${clientMin}`;
  const cached = SERVER_CALENDAR_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return flightsJson(cached.data);
  }

  try {
    const calendarPromise = runPriceCalendar({
      originSkyId,
      destinationSkyId,
      originEntityId,
      destinationEntityId,
      fromDate,
      toDate: toDate || undefined,
      centerDate,
      currency,
    });

    const timeoutPromise = new Promise<{ ok: false; errorCode: "timeout" }>((resolve) =>
      setTimeout(() => resolve({ ok: false, errorCode: "timeout" }), 40000)
    );

    const result = await Promise.race([calendarPromise, timeoutPromise]);

    if (result.ok && result.days && result.days.length > 0) {
      const cheapest = result.days.reduce(
        (min, day) => (day.price.client < min ? day.price.client : min),
        Number.POSITIVE_INFINITY
      );

      const payload = {
        ok: true,
        provider: "live",
        days: result.days.map((day) => ({
          ...day,
          cheapest: day.price.client === cheapest && cheapest !== Number.POSITIVE_INFINITY,
        })),
      };
      SERVER_CALENDAR_CACHE.set(cacheKey, { time: Date.now(), data: payload });
      return flightsJson(payload);
    }
  } catch {}

  // No live price calendar available: return an honest empty calendar (never synthesised prices).
  return flightsJson({
    ok: true,
    provider: "live",
    days: [],
    empty: true,
  });
}
