import { NextRequest, NextResponse } from "next/server";
import { calculateOsrmRoute } from "@/lib/planner/osrm";
import type { PlannerTransportMode } from "@/types/planner";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    coordinates?: Array<[number, number]>;
    points?: Array<{ lat: number; lng: number }>;
    mode?: PlannerTransportMode | "all";
    modes?: PlannerTransportMode[];
  };
  const points =
    body.points ||
    (body.coordinates || []).map(([lng, lat]) => ({ lat, lng }));
  if (points.length < 2) return NextResponse.json({ ok: false, error: "need_two_points" }, { status: 400 });

  const pairModes = body.modes?.length
    ? body.modes
    : points.slice(0, -1).map(() => (body.mode && body.mode !== "all" ? body.mode : "drive"));

  const mixed = pairModes.some((m, i) => i > 0 && m !== pairModes[0]);
  if (mixed) {
    const legs = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const mode = pairModes[i] || "drive";
      const segment = await calculateOsrmRoute([points[i], points[i + 1]], mode);
      const leg = segment?.legs[0];
      if (!leg) continue;
      legs.push({
        durationMinutes: leg.minutes,
        distanceKm: leg.km.toFixed(1),
        midpoint: leg.midpoint,
        polyline: leg.polyline,
        mode,
        estimated: Boolean(leg.estimated) || mode === "transit" || mode === "line",
      });
    }
    if (!legs.length) return NextResponse.json({ ok: false, error: "route_failed" }, { status: 502 });
    return NextResponse.json({ ok: true, legs });
  }

  const route = await calculateOsrmRoute(points, pairModes[0] || "drive");
  if (!route) return NextResponse.json({ ok: false, error: "route_failed" }, { status: 502 });
  return NextResponse.json({
    ok: true,
    geojson: route.geojson,
    legs: route.legs.map((l, i) => {
      const mode = pairModes[i] || pairModes[0] || "drive";
      return {
        durationMinutes: l.minutes,
        distanceKm: l.km.toFixed(1),
        midpoint: l.midpoint,
        polyline: l.polyline,
        mode,
        estimated: Boolean(l.estimated) || mode === "transit" || mode === "line",
      };
    }),
  });
}
