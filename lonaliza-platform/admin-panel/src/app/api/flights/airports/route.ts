import { NextRequest } from "next/server";
import { searchLocalAirports } from "@/lib/server/airports-db";
import { flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const query = (req.nextUrl.searchParams.get("query") || "").trim();
  if (!query) {
    return flightsJson({ ok: true, provider: "local", airports: [] });
  }

  const airports = await searchLocalAirports(query, req.nextUrl.searchParams.get("locale"));
  return flightsJson({
    ok: true,
    provider: "local",
    airports,
    empty: airports.length === 0,
  });
}
