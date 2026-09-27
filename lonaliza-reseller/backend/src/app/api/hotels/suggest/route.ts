import { NextRequest, NextResponse } from "next/server";
import { searchGeoPlaces } from "@/lib/server/geo-places";
import type { Locale } from "@/lib/i18n/types";
import { contentPb } from "@/lib/server/hotels/content-store";
import { bookingEndpointEnabled } from "@/lib/hotels-runtime";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { searchHotelDestination } from "@/lib/server/hotel-rooms-provider";
import type { HotelSuggestHit } from "@/lib/hotel-search";
import { ttlGet, ttlSet } from "@/lib/server/ttl-cache";

export const runtime = "nodejs";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const langRaw = req.nextUrl.searchParams.get("lang") || "ar";
  const lang: Locale = langRaw === "en" || langRaw === "tr" ? langRaw : "ar";
  if (q.length < 2) return NextResponse.json({ ok: true, cities: [], hotels: [] });

  const cacheKey = `hotel-suggest:${lang}:${q.toLowerCase()}`;
  const cached = ttlGet<{ ok: true; cities: HotelSuggestHit[]; hotels: HotelSuggestHit[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const cities: HotelSuggestHit[] = [];
  try {
    const places = await searchGeoPlaces(q, lang);
    for (const place of places.slice(0, 6)) {
      cities.push({
        kind: "city",
        id: place.geoId || place.id,
        name: place.city,
        city: place.city,
        country: place.country,
      });
    }
  } catch {
    /* optional */
  }

  const hotels: HotelSuggestHit[] = [];
  const seen = new Set<string>();
  const pb = await contentPb();
  if (pb) {
    const needle = q.replace(/"/g, "").slice(0, 80);
    try {
      const rows = await pb.collection("hotel_masters").getList(1, 8, {
        filter: `name ~ "${needle}" || nameAr ~ "${needle}" || city ~ "${needle}"`,
        fields: "masterId,name,city,countryCode",
      });
      for (const row of rows.items) {
        const rec = row as unknown as { masterId?: string; name?: string; city?: string; countryCode?: string };
        const name = String(rec.name || "").trim();
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());
        hotels.push({
          kind: "hotel",
          id: String(rec.masterId || name),
          name,
          city: String(rec.city || ""),
          country: String(rec.countryCode || ""),
          hotelKey: String(rec.masterId || ""),
        });
      }
    } catch {
      /* collection may be empty */
    }
  }

  const runtime = await getHotelsRuntime();
  if (q.length >= 3 && bookingEndpointEnabled(runtime, "searchDestination")) {
    try {
      const dest = await searchHotelDestination({ query: q, languagecode: lang === "ar" ? "ar" : lang === "tr" ? "tr" : "en-us" });
      if (dest.ok) {
        const root = asRecord(dest.payload);
        const data = asRecord(root?.data) || root;
        const bags = [root?.data, data?.destinations, data?.result, data?.items].filter(Array.isArray) as unknown[][];
        for (const bag of bags) {
          for (const item of bag) {
            const rec = asRecord(item);
            if (!rec) continue;
            const destType = pickString(rec.dest_type, rec.destType, rec.type, rec.search_type).toLowerCase();
            if (!/hotel|property|ho/.test(destType)) continue;
            const name = pickString(rec.label, rec.name, rec.hotel_name, rec.title);
            const city = pickString(rec.city_name, rec.city, rec.cc1);
            const id = pickString(rec.dest_id, rec.hotel_id, rec.id);
            if (!name || seen.has(name.toLowerCase())) continue;
            seen.add(name.toLowerCase());
            hotels.push({
              kind: "hotel",
              id: id || name,
              name,
              city,
              country: pickString(rec.country, rec.cc1),
              bookingHotelId: /^\d+$/.test(id) ? id : undefined,
              hotelKey: id,
            });
            if (hotels.length >= 8) break;
          }
          if (hotels.length >= 8) break;
        }
      }
    } catch {
      /* RapidAPI optional */
    }
  }

  const payload = { ok: true as const, cities, hotels: hotels.slice(0, 8) };
  ttlSet(cacheKey, payload, 24 * 60 * 60 * 1000);
  return NextResponse.json(payload);
}
