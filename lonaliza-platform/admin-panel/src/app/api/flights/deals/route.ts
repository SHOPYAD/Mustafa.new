import { NextResponse } from "next/server";
import { getHomepageFlightDeals } from "@/lib/server/flight-deals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getHomepageFlightDeals();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=21600",
    },
  });
}
