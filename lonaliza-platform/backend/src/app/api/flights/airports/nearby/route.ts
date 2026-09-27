import { NextRequest } from "next/server";
import { nearbyLocalAirport } from "@/lib/server/airports-db";
import { PUBLIC_FLIGHT_EMPTY } from "@/lib/server/flights-engine";
import { flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return flightsJson(
      { ok: false, provider: "local", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const hit = await nearbyLocalAirport(lat, lng, req.nextUrl.searchParams.get("locale"));
  return flightsJson({
    ok: true,
    provider: "local",
    nearby: hit ? { current: hit } : {},
    airports: hit ? [hit] : [],
  });
}
