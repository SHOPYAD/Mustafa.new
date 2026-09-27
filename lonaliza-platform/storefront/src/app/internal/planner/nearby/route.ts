import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyPois, type NearbyCategory } from "@/lib/planner/nearby-overpass";
import { wikiSummary } from "@/lib/planner/wiki-summary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    lat?: number;
    lng?: number;
    category?: NearbyCategory;
  };
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const category = body.category || "attractions";
  if (!lat || !lng) return NextResponse.json({ ok: false, places: [] }, { status: 400 });
  const raw = await fetchNearbyPois(lat, lng, category);
  const top = raw.slice(0, 40);
  const places = await Promise.all(
    top.map(async (p, i) => {
      const wiki = i < 8 && p.wiki ? await wikiSummary(p.wiki.replace(/^[a-z]+:/, ""), "en") : {};
      return {
        ...p,
        image: wiki.image,
        detailEn: wiki.description,
      };
    })
  );
  return NextResponse.json({ ok: true, places });
}
