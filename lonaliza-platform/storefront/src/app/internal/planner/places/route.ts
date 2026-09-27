import { NextRequest, NextResponse } from "next/server";
import { resolveDestinationCenter } from "@/lib/planner/live-places";
import { searchGeoPlaces } from "@/lib/server/geo-places";
import type { Locale } from "@/lib/i18n/types";

export const runtime = "nodejs";

function localeOf(raw: string): Locale {
  if (raw === "en" || raw === "tr" || raw === "fr") return raw;
  return "ar";
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const lang = localeOf(req.nextUrl.searchParams.get("lang") || "ar");
  if (q.length < 2) return NextResponse.json({ ok: true, places: [] });

  const hits = await searchGeoPlaces(q, lang).catch(() => []);
  const places = [];
  for (const hit of hits.slice(0, 10)) {
    let lat = Number(hit.lat) || 0;
    let lng = Number(hit.lng) || 0;
    if (!lat || !lng) {
      const center = await resolveDestinationCenter(`${hit.city} ${hit.country}`).catch(() => null);
      lat = center?.lat || 0;
      lng = center?.lng || 0;
    }
    places.push({
      label: [hit.city, hit.country].filter(Boolean).join(" — "),
      city: hit.city,
      country: hit.country,
      lat,
      lng,
    });
  }

  return NextResponse.json({ ok: true, places });
}
