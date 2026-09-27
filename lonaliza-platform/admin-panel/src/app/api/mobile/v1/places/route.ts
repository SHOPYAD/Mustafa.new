import { NextRequest, NextResponse } from "next/server";
import { searchLocalAirports } from "@/lib/server/airports-db";
import { searchGeoPlaces } from "@/lib/server/geo-places";
import { SeeruRideAdapter } from "@/lib/providers/adapters/seeru/seeruRideAdapter";

export const runtime = "nodejs";

const rideAdapter = new SeeruRideAdapter();

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || req.nextUrl.searchParams.get("query") || "").trim();
  const type = (req.nextUrl.searchParams.get("type") || "hotels").toLowerCase();
  const lang = req.nextUrl.searchParams.get("lang") || req.nextUrl.searchParams.get("locale") || "ar";

  if (q.length < 2) {
    return NextResponse.json({ ok: true, places: [], locations: [], airports: [] });
  }

  if (type === "airports" || type === "flights") {
    const airports = await searchLocalAirports(q, lang);
    const grouped = new Map<
      string,
      { kind: string; name: string; country: string; countryCode: string; airports: Array<Record<string, string>> }
    >();
    for (const hit of airports) {
      const key = hit.city || hit.iata || hit.skyId;
      if (!grouped.has(key)) {
        grouped.set(key, {
          kind: "city",
          name: hit.city || hit.name,
          country: hit.country,
          countryCode: "",
          airports: [],
        });
      }
      grouped.get(key)!.airports.push({
        iata: hit.skyId || hit.iata,
        name: hit.name,
        nameAr: hit.name,
        city: hit.city,
        country: hit.country,
        countryCode: "",
      });
    }
    return NextResponse.json({ ok: true, locations: [...grouped.values()], airports });
  }

  if (type === "transfers" || type === "transfer") {
    const locations = await rideAdapter.searchLocations(q, undefined, lang);
    return NextResponse.json({ ok: true, locations });
  }

  const hits = await searchGeoPlaces(q, lang === "en" || lang === "tr" ? lang : "ar");
  const places = hits.map((place) => ({
    place_id: place.geoId || place.id,
    display_name: [place.city, place.admin1, place.country].filter(Boolean).join(", "),
    name: place.city,
    address: {
      city: place.city,
      country: place.country,
      country_code: place.countryCode?.toLowerCase(),
    },
    destId: place.geoId || place.id,
  }));
  return NextResponse.json({ ok: true, places });
}
