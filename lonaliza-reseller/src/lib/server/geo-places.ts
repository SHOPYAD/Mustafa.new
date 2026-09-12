import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { Locale } from "@/lib/i18n/types";
import type { GeoPlaceHit } from "@/lib/hotel-search";
import { searchLocations } from "@/lib/server/travel-advisor";

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

const FALLBACK: GeoPlaceRecord[] = [
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
  { id: "fb-gzt", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Gaziantep", city_name_ar: "غازي عنتاب", city_name_tr: "Gaziantep", admin1: "Gaziantep", population: 2130000, tripadvisor_geo_id: "298007" },
  { id: "fb-mrd", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Mardin", city_name_ar: "ماردين", city_name_tr: "Mardin", admin1: "Mardin", population: 870000, tripadvisor_geo_id: "298032" },
  { id: "fb-van", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Van", city_name_ar: "وان", city_name_tr: "Van", admin1: "Van", population: 525000, tripadvisor_geo_id: "298038" },
  { id: "fb-sul", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Sultanahmet", city_name_ar: "السلطان أحمد", city_name_tr: "Sultanahmet", admin1: "Istanbul", population: 15000, tripadvisor_geo_id: "293974" },
  { id: "fb-tks", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Taksim", city_name_ar: "تقسيم", city_name_tr: "Taksim", admin1: "Istanbul", population: 20000, tripadvisor_geo_id: "293974" },
  { id: "fb-arn", country_code: "TR", country_name_en: "Turkey", country_name_ar: "تركيا", country_name_tr: "Türkiye", city_name_en: "Arnavutkoy", city_name_ar: "أرنافوت كوي", city_name_tr: "Arnavutköy", admin1: "Istanbul", population: 30000, tripadvisor_geo_id: "293974" },
  { id: "fb-dxb", country_code: "AE", country_name_en: "United Arab Emirates", country_name_ar: "الإمارات", country_name_tr: "Birleşik Arap Emirlikleri", city_name_en: "Dubai", city_name_ar: "دبي", city_name_tr: "Dubai", population: 3331000, tripadvisor_geo_id: "295424" },
  { id: "fb-par", country_code: "FR", country_name_en: "France", country_name_ar: "فرنسا", country_name_tr: "Fransa", city_name_en: "Paris", city_name_ar: "باريس", city_name_tr: "Paris", population: 2161000, tripadvisor_geo_id: "187147" },
  { id: "fb-lon", country_code: "GB", country_name_en: "United Kingdom", country_name_ar: "بريطانيا", country_name_tr: "Birleşik Krallık", city_name_en: "London", city_name_ar: "لندن", city_name_tr: "Londra", population: 8982000, tripadvisor_geo_id: "186338" },
  { id: "fb-nha", country_code: "VN", country_name_en: "Vietnam", country_name_ar: "فيتنام", country_name_tr: "Vietnam", city_name_en: "Nha Trang", city_name_ar: "نها ترانغ", city_name_tr: "Nha Trang", population: 422000, tripadvisor_geo_id: "293926" },
];

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
  const tokens = tokensOf(rec);
  let score = Math.log10((rec.population || 0) + 10);
  if (rec.country_code === "TR") score += 2.8;
  if (city === q || en === q) score += 8;
  else if (city.startsWith(q) || en.startsWith(q)) score += 4.5;
  else if (tokens.split(/\s+/).some((t) => t.startsWith(q))) score += 3.2;
  else if (city.includes(q) || en.includes(q) || tokens.includes(q)) score += 1.4;
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
  };
}

function rankRecords(records: GeoPlaceRecord[], q: string, lang: Locale): GeoPlaceHit[] {
  return records
    .map((rec) => ({ rec, score: scorePlace(rec, q, lang) }))
    .filter((row) => row.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((row) => toHit(row.rec, lang));
}

function fallbackSearch(q: string, lang: Locale): GeoPlaceHit[] {
  const needle = q.toLowerCase();
  const matched = FALLBACK.filter((rec) => tokensOf(rec).includes(needle));
  return rankRecords(matched.length ? matched : FALLBACK, needle, lang);
}

export async function searchGeoPlaces(rawQuery: string, lang: Locale): Promise<GeoPlaceHit[]> {
  const q = sanitizeQuery(rawQuery).toLowerCase();
  if (!q) return [];

  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return fallbackSearch(q, lang);
    const safe = q.replace(/%/g, "");
    const cityFilter = `city_name_en ~ "${safe}" || city_name_ar ~ "${safe}" || city_name_tr ~ "${safe}"`;
    const [prefixLike, turkeyHits] = await Promise.all([
      pb.collection("geo_places").getList<GeoPlaceRecord>(1, 60, {
        filter: cityFilter,
        sort: "-population",
      }),
      pb.collection("geo_places").getList<GeoPlaceRecord>(1, 40, {
        filter: `country_code = "TR" && (${cityFilter})`,
        sort: "-population",
      }),
    ]);
    const seen = new Set<string>();
    const items: GeoPlaceRecord[] = [];
    for (const rec of [...(turkeyHits.items || []), ...(prefixLike.items || [])]) {
      if (seen.has(rec.id)) continue;
      seen.add(rec.id);
      items.push(rec);
    }
    if (!items.length) return fallbackSearch(q, lang);
    return rankRecords(items, q, lang);
  } catch {
    return fallbackSearch(q, lang);
  }
}

export async function findPlaceByQuery(rawQuery: string): Promise<GeoPlaceRecord | null> {
  const q = sanitizeQuery(rawQuery);
  if (!q) return null;
  const pb = await tryCreateAdminPocketBase();
  const needle = q.toLowerCase();
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
  return (
    FALLBACK.find(
      (r) =>
        r.city_name_en.toLowerCase() === needle ||
        (r.city_name_ar || "").toLowerCase() === needle ||
        (r.city_name_tr || "").toLowerCase() === needle ||
        tokensOf(r).includes(needle)
    ) || null
  );
}

export async function cacheTripadvisorGeoId(recordId: string, geoId: string): Promise<void> {
  if (!recordId || !geoId || recordId.startsWith("fb-")) return;
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
