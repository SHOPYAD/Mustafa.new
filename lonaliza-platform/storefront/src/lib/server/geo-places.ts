import fs from "fs";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { Locale } from "@/lib/i18n/types";
import type { GeoPlaceHit } from "@/lib/hotel-search";
import { searchLocations } from "@/lib/server/travel-advisor";
import { WORLD_CITIES_MASTER } from "@/lib/geo/world-cities-data";

export type GeoPlaceRecord = {
  id: string;
  place_key?: string;
  country_code: string;
  country_name_en?: string;
  country_name_ar?: string;
  country_name_tr?: string;
  city_name_en: string;
  city_name_ar?: string;
  city_name_tr?: string;
  admin1?: string;
  lat?: number;
  lng?: number;
  population?: number;
  tripadvisor_geo_id?: string;
  search_tokens?: string;
};

const TURKEY_FALLBACK: GeoPlaceRecord[] = [
  { id: "fb-ist", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Istanbul", city_name_ar: "إسطنبول", city_name_tr: "İstanbul", admin1: "Istanbul", population: 15460000, tripadvisor_geo_id: "293974" },
  { id: "fb-ayt", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Antalya", city_name_ar: "أنطاليا", city_name_tr: "Antalya", admin1: "Antalya", population: 1344000, tripadvisor_geo_id: "297962" },
  { id: "fb-ank", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Ankara", city_name_ar: "أنقرة", city_name_tr: "Ankara", admin1: "Ankara", population: 5747000, tripadvisor_geo_id: "298656" },
  { id: "fb-izm", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Izmir", city_name_ar: "إزمير", city_name_tr: "İzmir", admin1: "İzmir", population: 4479000, tripadvisor_geo_id: "298006" },
  { id: "fb-bod", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Bodrum", city_name_ar: "بودروم", city_name_tr: "Bodrum", admin1: "Muğla", population: 192000, tripadvisor_geo_id: "298666" },
  { id: "fb-cap", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Cappadocia", city_name_ar: "كابادوكيا", city_name_tr: "Kapadokya", admin1: "Nevşehir", population: 35000, tripadvisor_geo_id: "297982" },
  { id: "fb-trz", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Trabzon", city_name_ar: "طرابزون", city_name_tr: "Trabzon", admin1: "Trabzon", population: 824000, tripadvisor_geo_id: "298035" },
  { id: "fb-aln", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Alanya", city_name_ar: "ألانيا", city_name_tr: "Alanya", admin1: "Antalya", population: 364000, tripadvisor_geo_id: "298962" },
  { id: "fb-blk", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Belek", city_name_ar: "بيلك", city_name_tr: "Belek", admin1: "Antalya", population: 8000, tripadvisor_geo_id: "609082" },
  { id: "fb-sde", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Side", city_name_ar: "سيدي", city_name_tr: "Side", admin1: "Antalya", population: 12000, tripadvisor_geo_id: "298964" },
  { id: "fb-mar", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Marmaris", city_name_ar: "مرمريس", city_name_tr: "Marmaris", admin1: "Muğla", population: 95800, tripadvisor_geo_id: "298663" },
  { id: "fb-fet", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Fethiye", city_name_ar: "فتحية", city_name_tr: "Fethiye", admin1: "Muğla", population: 167000, tripadvisor_geo_id: "298658" },
  { id: "fb-kus", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Kusadasi", city_name_ar: "كوشاداسي", city_name_tr: "Kuşadası", admin1: "Aydın", population: 113000, tripadvisor_geo_id: "298031" },
  { id: "fb-brs", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Bursa", city_name_ar: "بورصة", city_name_tr: "Bursa", admin1: "Bursa", population: 3140000, tripadvisor_geo_id: "297977" },
  { id: "fb-sul", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Sultanahmet", city_name_ar: "السلطان أحمد", city_name_tr: "Sultanahmet", admin1: "Istanbul", population: 15000, tripadvisor_geo_id: "293974" },
  { id: "fb-tks", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Taksim", city_name_ar: "تقسيم", city_name_tr: "Taksim", admin1: "Istanbul", population: 20000, tripadvisor_geo_id: "293974" },
];

const CURATED_WORLD_RECORDS: GeoPlaceRecord[] = WORLD_CITIES_MASTER.map((item) => ({
  id: item.id,
  country_code: item.countryCode,
  country_name_en: item.countryNameEn,
  country_name_ar: item.countryNameAr,
  country_name_tr: item.countryNameTr,
  city_name_en: item.cityNameEn,
  city_name_ar: item.cityNameAr,
  city_name_tr: item.cityNameTr,
  admin1: item.admin1,
  population: item.population || 500000,
  tripadvisor_geo_id: item.tripadvisorGeoId,
  search_tokens: [
    item.cityNameEn,
    item.cityNameAr,
    item.cityNameTr,
    item.countryNameEn,
    item.countryNameAr,
    item.countryNameTr,
    ...(item.aliases || []),
  ].join(" "),
}));

let airportCitiesCache: GeoPlaceRecord[] | null = null;
function getAirportCities(): GeoPlaceRecord[] {
  if (airportCitiesCache) return airportCitiesCache;
  try {
    const filePath = path.join(process.cwd(), ".data/airports/cities.json");
    if (fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (Array.isArray(raw)) {
        airportCitiesCache = raw.map((c: any) => ({
          id: `city-${c.cityCode || c.cityEn}`,
          country_code: c.countryCode || "",
          country_name_en: c.countryEn || "",
          country_name_ar: c.countryAr || "",
          country_name_tr: c.countryTr || "",
          city_name_en: c.cityEn || "",
          city_name_ar: c.cityAr || "",
          city_name_tr: c.cityTr || "",
          lat: c.lat,
          lng: c.lon,
          population: 150000,
          search_tokens: [c.cityEn, c.cityAr, c.cityTr, c.countryEn, c.countryAr, ...(c.aliases || [])].filter(Boolean).join(" "),
        }));
        return airportCitiesCache;
      }
    }
  } catch (err) {
    console.error("Failed to load .data/airports/cities.json:", err);
  }
  return [];
}

let staticCatalogCache: GeoPlaceRecord[] | null = null;
export function getAllStaticRecords(): GeoPlaceRecord[] {
  if (staticCatalogCache) return staticCatalogCache;
  const map = new Map<string, GeoPlaceRecord>();
  // 1. First add curated world records (highest priority)
  for (const rec of CURATED_WORLD_RECORDS) {
    const key = `${rec.country_code}_${(rec.city_name_en || "").toLowerCase()}`;
    map.set(key, rec);
  }
  // 2. Add Turkey fallback
  for (const rec of TURKEY_FALLBACK) {
    const key = `${rec.country_code}_${(rec.city_name_en || "").toLowerCase()}`;
    if (!map.has(key)) map.set(key, rec);
  }
  // 3. Airport cities fill gaps only. Never overwrite curated rows with airport pins.
  for (const rec of getAirportCities()) {
    const key = `${rec.country_code}_${(rec.city_name_en || "").toLowerCase()}`;
    if (map.has(key)) continue;
    map.set(key, rec);
  }
  staticCatalogCache = Array.from(map.values());
  return staticCatalogCache;
}

function sanitizeQuery(raw: string): string {
  return raw.replace(/["'\\]/g, "").trim().slice(0, 80);
}

function pickCity(rec: GeoPlaceRecord, lang: Locale): string {
  if (lang === "ar") return rec.city_name_ar || rec.city_name_en;
  if (lang === "tr") return rec.city_name_tr || rec.city_name_en;
  return rec.city_name_en;
}

function pickCountry(rec: GeoPlaceRecord, lang: Locale): string {
  if (lang === "ar") return rec.country_name_ar || rec.country_name_en || rec.country_code;
  if (lang === "tr") return rec.country_name_tr || rec.country_name_en || rec.country_code;
  return rec.country_name_en || rec.country_code;
}

function tokensOf(rec: GeoPlaceRecord): string {
  return [
    rec.search_tokens,
    rec.city_name_en,
    rec.city_name_ar,
    rec.city_name_tr,
    rec.country_name_en,
    rec.country_name_ar,
    rec.country_name_tr,
    rec.country_code,
    rec.admin1,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scorePlace(rec: GeoPlaceRecord, q: string, lang: Locale): number {
  const city = pickCity(rec, lang).toLowerCase();
  const en = (rec.city_name_en || "").toLowerCase();
  const ar = (rec.city_name_ar || "").toLowerCase();
  const tr = (rec.city_name_tr || "").toLowerCase();
  const tokens = tokensOf(rec);
  let score = Math.log10((rec.population || 0) + 10);

  // Exact matches
  if (city === q || en === q || ar === q || tr === q) score += 50;
  // Prefix matches
  else if (city.startsWith(q) || en.startsWith(q) || ar.startsWith(q) || tr.startsWith(q)) score += 25;
  // Word tokens prefix match
  else if (tokens.split(/\s+/).some((t) => t === q)) score += 20;
  else if (tokens.split(/\s+/).some((t) => t.startsWith(q))) score += 12;
  // Substring match
  else if (city.includes(q) || en.includes(q) || ar.includes(q) || tr.includes(q)) score += 8;
  else if (tokens.includes(q)) score += 4;
  else return 0; // Does not match at all

  return score;
}

function toHit(rec: GeoPlaceRecord, lang: Locale): GeoPlaceHit {
  return {
    id: rec.id,
    city: pickCity(rec, lang),
    country: pickCountry(rec, lang),
    countryCode: rec.country_code,
    admin1: rec.admin1 || "",
    geoId: rec.tripadvisor_geo_id || "",
    population: rec.population || 0,
    lat: rec.lat,
    lng: rec.lng,
  };
}

function rankRecords(records: GeoPlaceRecord[], q: string, lang: Locale): GeoPlaceHit[] {
  return records
    .map((rec) => ({ rec, score: scorePlace(rec, q, lang) }))
    .filter((row) => row.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((row) => toHit(row.rec, lang));
}

export async function searchGeoPlaces(rawQuery: string, lang: Locale): Promise<GeoPlaceHit[]> {
  const q = sanitizeQuery(rawQuery).toLowerCase();
  if (!q) return [];

  const allStatic = getAllStaticRecords();
  const staticHits = rankRecords(allStatic, q, lang);

  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return staticHits;
    const safe = q.replace(/%/g, "");
    const cityFilter = `city_name_en ~ "${safe}" || city_name_ar ~ "${safe}" || city_name_tr ~ "${safe}" || search_tokens ~ "${safe}"`;
    const pbHits = await pb.collection("geo_places").getList<GeoPlaceRecord>(1, 40, {
      filter: cityFilter,
      sort: "-population",
    }).catch(() => null);

    const seen = new Set<string>();
    const items: GeoPlaceRecord[] = [];
    for (const rec of [...allStatic.filter((r) => tokensOf(r).includes(q)), ...(pbHits?.items || [])]) {
      const key = `${rec.country_code}_${(rec.city_name_en || "").toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(rec);
    }
    const merged = rankRecords(items.length ? items : allStatic, q, lang);
    return merged.length ? merged : staticHits;
  } catch {
    return staticHits;
  }
}

export async function findPlaceByQuery(rawQuery: string): Promise<GeoPlaceRecord | null> {
  const q = sanitizeQuery(rawQuery);
  if (!q) return null;
  const needle = q.toLowerCase();
  const allStatic = getAllStaticRecords();

  const exactStatics = allStatic.filter(
    (r) =>
      r.city_name_en.toLowerCase() === needle ||
      (r.city_name_ar || "").toLowerCase() === needle ||
      (r.city_name_tr || "").toLowerCase() === needle
  );
  if (exactStatics.length) {
    const curated = exactStatics.find((r) => r.tripadvisor_geo_id || r.id.startsWith("geo-") || r.id.startsWith("fb-"));
    return curated || exactStatics.find((r) => r.lat && r.lng) || exactStatics[0];
  }

  const staticPrefix = allStatic.find((r) => tokensOf(r).includes(needle));
  if (staticPrefix?.tripadvisor_geo_id) return staticPrefix;

  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      const rows = await pb.collection("geo_places").getList<GeoPlaceRecord>(1, 20, {
        filter: `search_tokens ~ "${needle.replace(/%/g, "")}" || city_name_en ~ "${needle.replace(/%/g, "")}"`,
        sort: "-population",
      });
      const exact = (rows.items || []).find(
        (r) =>
          r.city_name_en.toLowerCase() === needle ||
          (r.city_name_ar || "").toLowerCase() === needle ||
          (r.city_name_tr || "").toLowerCase() === needle
      );
      if (exact) return exact;
      if (rows.items?.[0]) return rows.items[0];
    } catch {
      /* fallback */
    }
  }

  return staticPrefix || null;
}

export async function cacheTripadvisorGeoId(recordId: string, geoId: string): Promise<void> {
  if (!recordId || !geoId || recordId.startsWith("fb-") || recordId.startsWith("geo-")) return;
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  try {
    await pb.collection("geo_places").update(recordId, { tripadvisor_geo_id: geoId });
  } catch {
    /* ignore cache write */
  }
}

export async function resolvePlaceGeoId(input: {
  geoId?: string;
  query?: string;
}): Promise<string> {
  const existing = (input.geoId || "").trim();
  if (existing) return existing;
  const q = (input.query || "").trim();
  const place = await findPlaceByQuery(q || "Istanbul");
  if (place?.tripadvisor_geo_id) return place.tripadvisor_geo_id;

  const locs = await searchLocations(place?.city_name_en || q || "Istanbul");
  const geoId = locs[0]?.geoId || "";
  if (geoId && place?.id) await cacheTripadvisorGeoId(place.id, geoId);
  return geoId;
}
