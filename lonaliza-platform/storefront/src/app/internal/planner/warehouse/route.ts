import { NextRequest, NextResponse } from "next/server";
import {
  listWarehouseCities,
  readCityPack,
  warehouseCityKey,
} from "@/lib/planner/poi-warehouse";
import { resolveDestinationCenter } from "@/lib/planner/live-places";
import { fetchWorldPois } from "@/lib/planner/world-pois";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const q = String(req.nextUrl.searchParams.get("q") || "").trim();
  const cities = await listWarehouseCities();
  if (!q) {
    return NextResponse.json({ ok: true, cities, count: cities.length });
  }
  const center = await resolveDestinationCenter(q);
  const cityKey = warehouseCityKey(q, center.lat, center.lng) || warehouseCityKey(center.labelEn, center.lat, center.lng);
  const pack = cityKey ? await readCityPack(cityKey) : null;
  return NextResponse.json({
    ok: true,
    cityKey,
    cached: Boolean(pack?.pois?.length),
    count: pack?.pois?.length || 0,
    fetchedAt: pack?.fetchedAt || null,
    sources: pack?.sources || [],
    sample: (pack?.pois || []).slice(0, 8).map((p) => ({
      titleEn: p.titleEn,
      titleAr: p.titleAr,
      image: Boolean(p.image),
      source: p.source,
    })),
    cities,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { q?: string; lat?: number; lng?: number };
  const q = String(body.q || "").trim();
  if (!q) return NextResponse.json({ ok: false, error: "q_required" }, { status: 400 });
  const center =
    body.lat && body.lng
      ? { lat: Number(body.lat), lng: Number(body.lng), labelEn: q, labelAr: q }
      : await resolveDestinationCenter(q);
  const pois = await fetchWorldPois({ city: center.labelEn || q, lat: center.lat, lng: center.lng });
  const cityKey = warehouseCityKey(center.labelEn || q, center.lat, center.lng);
  return NextResponse.json({
    ok: true,
    cityKey,
    lat: center.lat,
    lng: center.lng,
    count: pois.length,
    fromWarehouse: true,
    sample: pois.slice(0, 12).map((p) => ({
      titleEn: p.titleEn,
      titleAr: p.titleAr,
      image: p.image || "",
      source: p.source,
      lat: p.lat,
      lng: p.lng,
    })),
  });
}
