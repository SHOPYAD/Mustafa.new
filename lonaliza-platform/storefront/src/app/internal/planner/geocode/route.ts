import { NextRequest, NextResponse } from "next/server";
import { cityCenter } from "@/lib/planner/catalog";
import { nominatimSearch } from "@/lib/planner/nominatim";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { q?: string };
  const q = String(body.q || "").trim();
  if (!q) return NextResponse.json({ ok: false, places: [] });

  const hits = await nominatimSearch(q, 6);
  if (hits.length) {
    return NextResponse.json({
      ok: true,
      places: hits.map((r) => ({ label: r.label, lat: r.lat, lng: r.lng })),
    });
  }

  const known = /istanbul|إسطنبول|antalya|أنطاليا|trabzon|طرابزون|cappadocia|كابادوكيا|riyadh|الرياض/i.test(q);
  if (!known) return NextResponse.json({ ok: true, places: [] });
  const center = cityCenter(q);
  return NextResponse.json({
    ok: true,
    places: [{ label: q, lat: center.lat, lng: center.lng }],
  });
}
