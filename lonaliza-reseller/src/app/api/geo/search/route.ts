import { NextRequest, NextResponse } from "next/server";
import { searchGeoPlaces } from "@/lib/server/geo-places";
import type { Locale } from "@/lib/i18n/types";

export const runtime = "nodejs";

function localeOf(raw: string): Locale {
  if (raw === "en" || raw === "tr" || raw === "ar") return raw;
  return "ar";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const lang = localeOf(searchParams.get("lang")?.trim() || "ar");
    const places = q ? await searchGeoPlaces(q, lang) : [];
    return NextResponse.json({ ok: true, places });
  } catch {
    return NextResponse.json({ ok: false, places: [], error: "geo_search_failed" });
  }
}
