import { NextRequest, NextResponse } from "next/server";
import { calculateOsrmRoute } from "@/lib/planner/osrm";
import type { PlannerTransportMode } from "@/types/planner";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    from?: { lat: number; lng: number };
    to?: { lat: number; lng: number };
    mode?: PlannerTransportMode;
  };
  const from = body.from;
  const to = body.to;
  const mode = body.mode || "walk";
  if (!from || !to) return NextResponse.json({ ok: false });
  const route = await calculateOsrmRoute([from, to], mode);
  const leg = route?.legs[0];
  if (!leg) return NextResponse.json({ ok: false });
  return NextResponse.json({
    ok: true,
    km: leg.km,
    minutes: leg.minutes,
    polyline: leg.polyline,
    midpoint: leg.midpoint,
    mode,
  });
}
