import { NextRequest, NextResponse } from "next/server";
import { SeeruRideAdapter } from "@/lib/providers/adapters/seeru/seeruRideAdapter";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

const rideAdapter = new SeeruRideAdapter();

export async function GET(req: NextRequest) {
  const limited = rateLimit(`transfers-loc:${clientIp(req)}`, 60, 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const country = searchParams.get("country") || undefined;
  const lang = searchParams.get("lang") || "ar";

  if (!q || q.length < 2) {
    return NextResponse.json({ ok: true, locations: [] });
  }

  try {
    const locations = await rideAdapter.searchLocations(q, country, lang);
    return NextResponse.json({ ok: true, locations });
  } catch (err: any) {
    console.error("[TransfersLocationsAPI Error]:", err);
    return NextResponse.json({ ok: false, error: err.message, locations: [] }, { status: 500 });
  }
}
