import { NextRequest, NextResponse } from "next/server";
import { optimizeOsrmTrip } from "@/lib/planner/osrm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    coordinates?: Array<[number, number]>;
    points?: Array<{ lat: number; lng: number }>;
    roundtrip?: boolean;
  };
  const points =
    body.points ||
    (body.coordinates || []).map(([lng, lat]) => ({ lat, lng }));
  if (points.length < 2) return NextResponse.json({ ok: false, error: "need_two_points" }, { status: 400 });
  const result = await optimizeOsrmTrip(points, { roundtrip: body.roundtrip !== false });
  if (!result) return NextResponse.json({ ok: false, error: "optimize_failed" }, { status: 502 });
  return NextResponse.json({
    ok: true,
    optimizedIndices: result.optimizedIndices,
    geojson: result.route.geojson,
    legs: result.route.legs.map((l) => ({
      durationMinutes: l.minutes,
      distanceKm: l.km.toFixed(1),
      midpoint: l.midpoint,
      polyline: l.polyline,
    })),
  });
}
