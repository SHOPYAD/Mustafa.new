import type { PlannerStopKind } from "@/types/planner";
import {
  cachedNearbyPlaces,
  nearbyCacheKey,
  readNearbyPack,
  writeNearbyPack,
} from "./poi-warehouse";

const UA = "LonalizaPlanner/1.0 (https://lonaliza.com)";

export type NearbyCategory = "attractions" | "food" | "shopping" | "hotels";

const RADIUS: Record<NearbyCategory, number> = {
  attractions: 22000,
  food: 2800,
  shopping: 4500,
  hotels: 6000,
};

function filters(cat: NearbyCategory): string {
  if (cat === "food") {
    return `nwr["amenity"~"restaurant|cafe|fast_food"](around:RADIUS,LAT,LNG);`;
  }
  if (cat === "shopping") {
    return `nwr["shop"~"mall|department_store|clothes|gift|souvenir"](around:RADIUS,LAT,LNG);
nwr["tourism"="yes"]["shop"](around:RADIUS,LAT,LNG);`;
  }
  if (cat === "hotels") {
    return `nwr["tourism"~"hotel|guest_house|hostel"](around:RADIUS,LAT,LNG);`;
  }
  return `nwr["tourism"~"attraction|museum|gallery|viewpoint|theme_park|zoo"](around:RADIUS,LAT,LNG);
nwr["historic"~"monument|castle|palace|ruins"](around:RADIUS,LAT,LNG);
nwr["wikipedia"]["tourism"](around:RADIUS,LAT,LNG);`;
}

function kindOf(cat: NearbyCategory): PlannerStopKind {
  if (cat === "food") return "food";
  if (cat === "shopping") return "shopping";
  if (cat === "hotels") return "hotel";
  return "attraction";
}

async function harvestNearbyPois(lat: number, lng: number, category: NearbyCategory) {
  const radius = RADIUS[category];
  const body = `[out:json][timeout:14];
(${filters(category).replaceAll("RADIUS", String(radius)).replaceAll("LAT", String(lat)).replaceAll("LNG", String(lng))}
);
out center 40;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
      body: `data=${encodeURIComponent(body)}`,
      next: { revalidate: 1800 },
    });
    const json = (await res.json()) as {
      elements?: Array<{
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }>;
    };
    const seen = new Set<string>();
    const out = [];
    for (const el of json.elements || []) {
      const tags = el.tags || {};
      const titleEn = tags["name:en"] || tags.name || "";
      const titleAr = tags["name:ar"] || titleEn;
      const plat = el.lat ?? el.center?.lat;
      const plng = el.lon ?? el.center?.lon;
      if (!titleEn || plat == null || plng == null) continue;
      const key = titleEn.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        titleEn,
        titleAr,
        lat: plat,
        lng: plng,
        kind: kindOf(category),
        hours: tags.opening_hours,
        wiki: tags.wikipedia,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function fetchNearbyPois(lat: number, lng: number, category: NearbyCategory) {
  const key = nearbyCacheKey(lat, lng, category);
  const pack = await readNearbyPack(key);
  const cached = cachedNearbyPlaces<Awaited<ReturnType<typeof harvestNearbyPois>>[number]>(pack);
  if (cached?.length) return cached;

  const live = await harvestNearbyPois(lat, lng, category);
  if (live.length) {
    await writeNearbyPack({
      key,
      lat,
      lng,
      category,
      fetchedAt: new Date().toISOString(),
      places: live,
    });
    return live;
  }
  return pack?.places || [];
}
