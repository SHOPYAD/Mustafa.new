import { NextRequest, NextResponse } from "next/server";
import { nominatimSearch } from "@/lib/planner/nominatim";
import { wikiSummary } from "@/lib/planner/wiki-summary";
import { uid } from "@/lib/planner/geo";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; city?: string };
  const name = String(body.name || "").trim();
  const city = String(body.city || "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });

  const q = city ? `${name} ${city}` : name;
  const geo = await nominatimSearch(q, 1);
  const place = geo[0];
  const [en, ar] = await Promise.all([wikiSummary(name, "en"), wikiSummary(name, "ar")]);

  return NextResponse.json({
    ok: Boolean(place || en.image || en.description),
    place: {
      id: uid("res"),
      name,
      lat: place?.lat || 0,
      lng: place?.lng || 0,
      address: place?.address || place?.label || "",
      image: en.image || ar.image,
      description: ar.description || en.description || "",
      descriptionEn: en.description || "",
      titleEn: en.title || name,
      titleAr: ar.title || name,
    },
  });
}
