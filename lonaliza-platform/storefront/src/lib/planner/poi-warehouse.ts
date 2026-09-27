import fs from "fs/promises";
import path from "path";
import type { PlannerStopKind } from "@/types/planner";
import { createLru } from "./lru";

export type WarehousePoi = {
  titleAr: string;
  titleEn: string;
  detailAr?: string;
  detailEn?: string;
  lat: number;
  lng: number;
  kind: PlannerStopKind;
  image?: string;
  hours?: string;
  rating?: number;
  reviews?: number;
  free?: boolean;
  popularity?: number;
  source: "wikidata" | "wikipedia" | "osm" | "wikivoyage" | "catalog" | "google_places" | "google_places_live";
};

export type CityPoiPack = {
  cityKey: string;
  city: string;
  lat: number;
  lng: number;
  fetchedAt: string;
  sources: string[];
  pois: WarehousePoi[];
};

export type NearbyPack = {
  key: string;
  lat: number;
  lng: number;
  category: string;
  fetchedAt: string;
  places: Array<{
    titleEn: string;
    titleAr: string;
    lat: number;
    lng: number;
    kind: PlannerStopKind;
    hours?: string;
    wiki?: string;
    image?: string;
    detailEn?: string;
  }>;
};

const CITY_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const NEARBY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_CITY_POIS = 8;
const MIN_NEARBY = 4;

const ALIAS: Array<[RegExp, string]> = [
  [/istanbul|إسطنبول|اسطنبول|sultanahmet|fatih|taksim/, "istanbul"],
  [/antalya|أنطاليا|انطاليا|belek|kemer|alanya/, "antalya"],
  [/trabzon|طرابزون|uzungol|sumela|sera/, "trabzon"],
  [/cappadocia|كابادوكيا|goreme|göreme|nevsehir/, "cappadocia"],
  [/riyadh|الرياض/, "riyadh"],
  [/paris|باريس/, "paris"],
  [/london|لندن/, "london"],
  [/cairo|القاهرة|قاهرة/, "cairo"],
  [/dubai|دبي/, "dubai"],
  [/rome|روما/, "rome"],
  [/barcelona|برشلونة|برشلونه/, "barcelona"],
  [/madrid|مدريد/, "madrid"],
  [/vienna|فيينا/, "vienna"],
  [/prague|براغ|prague/, "prague"],
  [/amsterdam|أمستردام|امستردام/, "amsterdam"],
  [/berlin|برلين/, "berlin"],
  [/moscow|موسكو/, "moscow"],
  [/jeddah|جدة/, "jeddah"],
  [/mecca|makkah|مكة/, "makkah"],
  [/medina|المدينة/, "madinah"],
  [/ankara|أنقرة|انقرة/, "ankara"],
  [/izmir|إزمير|ازمير/, "izmir"],
  [/bodrum|بودروم/, "bodrum"],
  [/tangier|tanger|طنجة|طنجه/, "tangier"],
  [/casablanca|الدار البيضاء|دار البيضاء/, "casablanca"],
  [/bangkok|بانكوك/, "bangkok"],
  [/tokyo|طوكيو/, "tokyo"],
  [/new york|نيويورك/, "new-york"],
];

const COUNTRY_NOISE =
  /\b(turkey|turkiye|türkiye|france|egypt|saudi|arabia|ksa|uae|united kingdom|england|spain|italy|germany|greece|austria|netherlands|russia|japan|thailand|usa|uk|تركيا|فرنسا|مصر|السعودية|الإمارات|بريطانيا|إسبانيا|ايطاليا|ألمانيا)\b/gi;

const memCity = createLru<CityPoiPack>(80, CITY_TTL_MS);
const memNearby = createLru<NearbyPack>(200, NEARBY_TTL_MS);
const inflight = new Map<string, Promise<WarehousePoi[]>>();

function dataRoot(): string {
  return path.join(process.cwd(), ".data", "planner");
}

function cityFile(key: string): string {
  return path.join(dataRoot(), "pois", `${key}.json`);
}

function nearbyFile(key: string): string {
  return path.join(dataRoot(), "nearby", `${key}.json`);
}

export function foldCityName(raw: string): string {
  return String(raw || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(COUNTRY_NOISE, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

export function warehouseCityKey(city: string, lat?: number, lng?: number): string {
  const folded = foldCityName(city);
  for (const [re, key] of ALIAS) {
    if (re.test(folded) || re.test(city)) return key;
  }
  const slug = folded
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join("-")
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, "");
  if (slug.length >= 2) return slug;
  const plat = Number(lat);
  const plng = Number(lng);
  if (plat && plng) return `geo-${plat.toFixed(2)}-${plng.toFixed(2)}`;
  return "";
}

export function nearbyCacheKey(lat: number, lng: number, category: string): string {
  return `${lat.toFixed(3)}_${lng.toFixed(3)}_${category}`;
}

function isFresh(iso: string, ttl: number): boolean {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return false;
  return Date.now() - at < ttl;
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value), "utf8");
  await fs.rename(tmp, file);
}

export async function readCityPack(cityKey: string): Promise<CityPoiPack | null> {
  if (!cityKey) return null;
  const hit = memCity.get(cityKey);
  if (hit) return hit;
  const pack = await readJson<CityPoiPack>(cityFile(cityKey));
  if (!pack?.pois?.length) return null;
  memCity.set(cityKey, pack);
  return pack;
}

export async function writeCityPack(pack: CityPoiPack): Promise<void> {
  if (!pack.cityKey || !pack.pois.length) return;
  memCity.set(pack.cityKey, pack);
  await writeJson(cityFile(pack.cityKey), pack);
}

export function cityPackQuality(pois: WarehousePoi[]): { images: number; named: number } {
  return {
    images: pois.filter((p) => Boolean(p.image)).length,
    named: pois.filter((p) => (p.popularity || 0) >= 8 || Boolean(p.detailEn || p.detailAr)).length,
  };
}

export function cachedCityPois(pack: CityPoiPack | null): WarehousePoi[] | null {
  if (!pack) return null;
  if (pack.pois.length < MIN_CITY_POIS) return null;
  if (!isFresh(pack.fetchedAt, CITY_TTL_MS)) return null;
  const q = cityPackQuality(pack.pois);
  if (q.images < 3 && q.named < 5) return null;
  return pack.pois;
}

export async function readNearbyPack(key: string): Promise<NearbyPack | null> {
  if (!key) return null;
  const hit = memNearby.get(key);
  if (hit) return hit;
  const pack = await readJson<NearbyPack>(nearbyFile(key));
  if (!pack?.places?.length) return null;
  memNearby.set(key, pack);
  return pack;
}

export async function writeNearbyPack(pack: NearbyPack): Promise<void> {
  if (!pack.key || !pack.places.length) return;
  memNearby.set(pack.key, pack);
  await writeJson(nearbyFile(pack.key), pack);
}

export function cachedNearbyPlaces<T extends { titleEn: string }>(pack: NearbyPack | null): T[] | null {
  if (!pack) return null;
  if (pack.places.length < MIN_NEARBY) return null;
  if (!isFresh(pack.fetchedAt, NEARBY_TTL_MS)) return null;
  return pack.places as unknown as T[];
}

export async function withCityHarvest(
  cityKey: string,
  harvest: () => Promise<WarehousePoi[]>
): Promise<WarehousePoi[]> {
  const existing = inflight.get(cityKey);
  if (existing) return existing;
  const job = harvest().finally(() => inflight.delete(cityKey));
  inflight.set(cityKey, job);
  return job;
}

export async function listWarehouseCities(): Promise<Array<{ cityKey: string; count: number; fetchedAt: string; city: string }>> {
  try {
    const dir = path.join(dataRoot(), "pois");
    const files = await fs.readdir(dir);
    const rows = [];
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      const pack = await readJson<CityPoiPack>(path.join(dir, file));
      if (!pack) continue;
      rows.push({
        cityKey: pack.cityKey,
        city: pack.city,
        count: pack.pois?.length || 0,
        fetchedAt: pack.fetchedAt,
      });
    }
    return rows.sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}
