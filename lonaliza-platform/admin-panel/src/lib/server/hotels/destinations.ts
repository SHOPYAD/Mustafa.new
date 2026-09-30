/**
 * Destination resolution for hotel suppliers.
 *
 * Every supplier keys destinations differently:
 *   - Hotelbeds  → its own destination code (e.g. Antalya = "ANT", Istanbul = "IST", Paris = "PAR")
 *                  obtained from Content API `/locations/destinations` (cached on disk, refreshed monthly).
 *   - RateHawk   → numeric `region_id` from `search/multicomplete/` (cached on disk).
 *   - Travelport → IATA city code OR geo coordinates (Stays `SearchByGeoLocation`).
 *   - Seeru      → city code + name.
 *
 * The airport IATA code that earlier code used everywhere was wrong for Hotelbeds
 * (AYT ≠ ANT) and produced near-empty result sets. This module never guesses:
 * when a code is unknown we fall back to a geo-radius search where the supplier supports it.
 */

import { promises as fs } from "fs";
import path from "path";
import { findPlaceByQuery, type GeoPlaceRecord } from "@/lib/server/geo-places";
import { hotelbedsContentRequest } from "@/lib/providers/adapters/hotelbeds/hotelbedsClient";
import { ratehawkPostJson } from "@/lib/providers/adapters/ratehawk/ratehawkClient";
import { recordSupplierCall, supplyLogger } from "./telemetry";
import { cacheGet, cacheSet } from "./cache";

export interface ResolvedDestination {
  /** Canonical English city name. */
  nameEn: string;
  nameAr: string;
  countryCode: string;
  lat: number | null;
  lng: number | null;
  /** IATA city / airport code when known (Travelport, Seeru). */
  iata: string | null;
  /** Hotelbeds destination code (Content API) when known. */
  hotelbedsCode: string | null;
  /** RateHawk region id when known. */
  ratehawkRegionId: number | null;
  /** geo_places record id if resolved from our DB. */
  geoPlaceId: string | null;
  /** Search radius in km recommended for geo searches. */
  radiusKm: number;
}

const DATA_DIR = path.join(process.cwd(), ".data", "hotels");
const HB_DEST_FILE = path.join(DATA_DIR, "hotelbeds-destinations.json");
const RH_REGION_FILE = path.join(DATA_DIR, "ratehawk-regions.json");
const HB_TTL_MS = 30 * 24 * 3600 * 1000;

type HotelbedsDestination = {
  code: string;
  name: string;
  countryCode: string;
  zones?: Array<{ zoneCode: number; name: string }>;
};

type HotelbedsDestFile = {
  fetchedAt: Record<string, string>; // countryCode → ISO
  destinations: HotelbedsDestination[];
};

type RateHawkRegionFile = Record<string, { id: number; name: string; countryCode: string; at: string }>;

/* --------------------------- IATA hints --------------------------- */
/* Only used for Travelport SearchByCity / Seeru. Real hotel content never depends on these. */
const IATA_BY_CITY: Record<string, string> = {
  istanbul: "IST",
  antalya: "AYT",
  trabzon: "TZX",
  izmir: "ADB",
  bodrum: "BJV",
  ankara: "ESB",
  cappadocia: "NAV",
  nevsehir: "NAV",
  bursa: "YEI",
  dalaman: "DLM",
  fethiye: "DLM",
  marmaris: "DLM",
  alanya: "GZP",
  kusadasi: "ADB",
  dubai: "DXB",
  "abu dhabi": "AUH",
  riyadh: "RUH",
  jeddah: "JED",
  medina: "MED",
  mecca: "QCA",
  makkah: "QCA",
  cairo: "CAI",
  london: "LON",
  paris: "PAR",
  nice: "NCE",
  lyon: "LYS",
  doha: "DOH",
  kuwait: "KWI",
  manama: "BAH",
  muscat: "MCT",
  amman: "AMM",
  beirut: "BEY",
  madrid: "MAD",
  barcelona: "BCN",
  rome: "ROM",
  milan: "MIL",
  vienna: "VIE",
  "kuala lumpur": "KUL",
  bangkok: "BKK",
  "nha trang": "CXR",
  baku: "BAK",
  tbilisi: "TBS",
  sarajevo: "SJJ",
  "sharm el sheikh": "SSH",
  casablanca: "CAS",
  marrakech: "RAK",
};

/* Arabic aliases so `findPlaceByQuery` gets an English needle when PocketBase is offline. */
const AR_ALIASES: Record<string, string> = {
  "إسطنبول": "Istanbul",
  "اسطنبول": "Istanbul",
  "أنطاليا": "Antalya",
  "انطاليا": "Antalya",
  "طرابزون": "Trabzon",
  "إزمير": "Izmir",
  "ازمير": "Izmir",
  "بودروم": "Bodrum",
  "كابادوكيا": "Cappadocia",
  "بورصة": "Bursa",
  "بورصه": "Bursa",
  "دبي": "Dubai",
  "الرياض": "Riyadh",
  "جدة": "Jeddah",
  "المدينة المنورة": "Medina",
  "المدينة": "Medina",
  "مكة": "Mecca",
  "القاهرة": "Cairo",
  "لندن": "London",
  "باريس": "Paris",
  "الدوحة": "Doha",
  "الكويت": "Kuwait",
  "المنامة": "Manama",
  "مسقط": "Muscat",
  "عمان": "Amman",
  "بيروت": "Beirut",
  "مدريد": "Madrid",
  "برشلونة": "Barcelona",
  "روما": "Rome",
  "ميلانو": "Milan",
  "فيينا": "Vienna",
  "كوالالمبور": "Kuala Lumpur",
  "بانكوك": "Bangkok",
  "باكو": "Baku",
  "تبليسي": "Tbilisi",
  "سراييفو": "Sarajevo",
  "شرم الشيخ": "Sharm El Sheikh",
};

function normalizeQuery(raw: string): string {
  const q = String(raw || "").trim();
  if (!q) return "";
  const alias = AR_ALIASES[q] || AR_ALIASES[q.replace(/^ال/, "")] || null;
  return alias || q;
}

function slug(s: string): string {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/* ------------------------- Hotelbeds table ------------------------- */

async function readHbFile(): Promise<HotelbedsDestFile> {
  try {
    const raw = await fs.readFile(HB_DEST_FILE, "utf8");
    const parsed = JSON.parse(raw) as HotelbedsDestFile;
    if (parsed && Array.isArray(parsed.destinations)) return parsed;
  } catch {
    /* first run */
  }
  return { fetchedAt: {}, destinations: [] };
}

async function writeHbFile(file: HotelbedsDestFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(HB_DEST_FILE, JSON.stringify(file), { mode: 0o600 });
}

/**
 * Loads all Hotelbeds destinations for a country from the Content API and caches on disk.
 * One request per country per 30 days — well within the 50 req/day test quota.
 */
export async function ensureHotelbedsDestinations(countryCode: string): Promise<HotelbedsDestination[]> {
  const cc = String(countryCode || "").toUpperCase();
  if (!cc) return [];
  const file = await readHbFile();
  const fetchedAt = file.fetchedAt[cc] ? Date.parse(file.fetchedAt[cc]) : 0;
  const cached = file.destinations.filter((d) => d.countryCode === cc);
  if (cached.length && Date.now() - fetchedAt < HB_TTL_MS) return cached;

  const started = Date.now();
  const all: HotelbedsDestination[] = [];
  let from = 1;
  const pageSize = 500;
  try {
    for (let page = 0; page < 6; page++) {
      const to = from + pageSize - 1;
      const res = await hotelbedsContentRequest<any>(
        `/locations/destinations?fields=all&language=ENG&countryCodes=${cc}&from=${from}&to=${to}&useSecondaryLanguage=false`,
        { timeoutMs: 12_000 }
      );
      if (!res.ok) throw new Error(res.error || "destinations request failed");
      const list: any[] = Array.isArray(res.data?.destinations) ? res.data.destinations : [];
      for (const d of list) {
        all.push({
          code: String(d.code || "").toUpperCase(),
          name: String(d.name?.content || d.name || "").trim(),
          countryCode: String(d.countryCode || d.isoCode || cc).toUpperCase(),
          zones: Array.isArray(d.zones)
            ? d.zones.map((z: any) => ({ zoneCode: Number(z.zoneCode), name: String(z.name || "") }))
            : [],
        });
      }
      const total = Number(res.data?.total || 0);
      if (list.length < pageSize || (total && to >= total)) break;
      from = to + 1;
    }
    recordSupplierCall({ supplier: "hotelbeds", kind: "content", ok: true, latencyMs: Date.now() - started, count: all.length, meta: { op: "destinations", cc } });
  } catch (err) {
    recordSupplierCall({ supplier: "hotelbeds", kind: "content", ok: false, latencyMs: Date.now() - started, error: String(err), meta: { op: "destinations", cc } });
    if (cached.length) return cached;
    return [];
  }

  if (all.length) {
    const others = file.destinations.filter((d) => d.countryCode !== cc);
    file.destinations = [...others, ...all];
    file.fetchedAt[cc] = new Date().toISOString();
    await writeHbFile(file).catch((e) => supplyLogger.warn({ err: String(e) }, "hb destinations write failed"));
  }
  return all;
}

export async function resolveHotelbedsDestinationCode(
  cityNameEn: string,
  countryCode: string
): Promise<string | null> {
  const list = await ensureHotelbedsDestinations(countryCode);
  if (!list.length) return null;
  const target = slug(cityNameEn);
  if (!target) return null;
  // exact name
  let hit = list.find((d) => slug(d.name) === target);
  if (hit) return hit.code;
  // destination name contains city or vice-versa (e.g. "Antalya" ⊂ "Antalya - Lara")
  hit = list.find((d) => slug(d.name).includes(target) || target.includes(slug(d.name)));
  if (hit) return hit.code;
  // zone match (e.g. "Belek" is a zone of ANT)
  hit = list.find((d) => (d.zones || []).some((z) => slug(z.name) === target || slug(z.name).includes(target)));
  if (hit) return hit.code;
  return null;
}

/* -------------------------- RateHawk regions -------------------------- */

async function readRhFile(): Promise<RateHawkRegionFile> {
  try {
    const raw = await fs.readFile(RH_REGION_FILE, "utf8");
    return JSON.parse(raw) as RateHawkRegionFile;
  } catch {
    return {};
  }
}

export async function resolveRateHawkRegionId(cityNameEn: string, countryCode: string): Promise<number | null> {
  const key = `${slug(cityNameEn)}|${countryCode.toUpperCase()}`;
  const file = await readRhFile();
  if (file[key]?.id) return file[key].id;

  const started = Date.now();
  try {
    const multi = await ratehawkPostJson<any>("search/multicomplete/", { query: cityNameEn, language: "en" });
    const regions: any[] = Array.isArray(multi?.data?.regions) ? multi.data.regions : [];
    const wantCc = countryCode.toUpperCase();
    const target = slug(cityNameEn);
    const ranked = regions
      .filter((r) => r && typeof r.id === "number")
      .map((r) => {
        let score = 0;
        const cc = String(r.country_code || "").toUpperCase();
        const type = String(r.type || "").toLowerCase();
        if (cc === wantCc) score += 5;
        if (type === "city") score += 3;
        else if (type === "province (state)" || type === "province") score += 1;
        if (slug(r.name) === target) score += 4;
        else if (slug(r.name).includes(target)) score += 2;
        return { r, score };
      })
      .sort((a, b) => b.score - a.score);
    const best = ranked[0]?.r;
    recordSupplierCall({ supplier: "ratehawk", kind: "content", ok: true, latencyMs: Date.now() - started, count: regions.length, meta: { op: "multicomplete", q: cityNameEn } });
    if (!best) return null;
    file[key] = { id: Number(best.id), name: String(best.name || cityNameEn), countryCode: String(best.country_code || wantCc), at: new Date().toISOString() };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(RH_REGION_FILE, JSON.stringify(file), { mode: 0o600 }).catch(() => undefined);
    return Number(best.id);
  } catch (err) {
    recordSupplierCall({ supplier: "ratehawk", kind: "content", ok: false, latencyMs: Date.now() - started, error: String(err), meta: { op: "multicomplete", q: cityNameEn } });
    return null;
  }
}

/* ------------------------------ Unified ------------------------------ */

/** Hotelbeds destination codes already stored for France: PAR, NCE, LYS. */
export function franceHotelSupplierKey(rawQuery: string): { nameEn: string; iata: "PAR" | "NCE" | "LYS" } | null {
  const text = ` ${slug(rawQuery)} `;
  if (/\b(texas|usa|united states)\b/.test(text)) return null;
  if (/\bparis\b/.test(text) || /\bpar\b/.test(text)) return { nameEn: "Paris", iata: "PAR" };
  if (/\bnice\b/.test(text) || /\bnce\b/.test(text)) return { nameEn: "Nice", iata: "NCE" };
  if (/\blyon\b/.test(text) || /\blys\b/.test(text)) return { nameEn: "Lyon", iata: "LYS" };
  return null;
}

let airportCoordCache: Map<string, { lat: number; lng: number }> | null = null;

function airportCoords(iata: string): { lat: number; lng: number } | null {
  if (!airportCoordCache) {
    airportCoordCache = new Map();
    try {
      const filePath = path.join(process.cwd(), ".data/airports/cities.json");
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Array<{ cityCode?: string; countryCode?: string; lat?: number; lon?: number }>;
      for (const row of raw) {
        const code = String(row.cityCode || "").toUpperCase();
        if (row.countryCode === "FR" && code && typeof row.lat === "number" && typeof row.lon === "number") {
          airportCoordCache.set(code, { lat: row.lat, lng: row.lon });
        }
      }
    } catch {
      /* airports file is optional */
    }
  }
  return airportCoordCache.get(iata) || null;
}

function placeToBase(place: GeoPlaceRecord | null, fallbackName: string): Omit<ResolvedDestination, "hotelbedsCode" | "ratehawkRegionId"> {
  const nameEn = place?.city_name_en || fallbackName;
  const iata = IATA_BY_CITY[slug(nameEn)] || null;
  const lat = typeof place?.lat === "number" && Number.isFinite(place.lat) ? place.lat : null;
  const lng = typeof place?.lng === "number" && Number.isFinite(place.lng) ? place.lng : null;
  const population = place?.population || 0;
  return {
    nameEn,
    nameAr: place?.city_name_ar || fallbackName,
    countryCode: (place?.country_code || "").toUpperCase(),
    lat,
    lng,
    iata,
    geoPlaceId: place?.id || null,
    radiusKm: population > 3_000_000 ? 35 : population > 500_000 ? 25 : 15,
  };
}

/**
 * Resolves a free-text destination into supplier-specific keys.
 * Supplier lookups that need network calls are done in parallel and cached.
 */
export async function resolveDestination(
  rawQuery: string,
  opts: { needHotelbeds?: boolean; needRateHawk?: boolean } = {}
): Promise<ResolvedDestination> {
  const query = normalizeQuery(rawQuery) || "Istanbul";
  const cacheKey = `dest:v2:${slug(query)}:${opts.needHotelbeds ? 1 : 0}${opts.needRateHawk ? 1 : 0}`;
  const cached = await cacheGet<ResolvedDestination>(cacheKey);
  if (cached) return cached;

  const cityToken = query.split(",")[0]?.trim() || query;
  const place = await findPlaceByQuery(cityToken).catch(() => null);
  const base = placeToBase(place, cityToken);
  const france = franceHotelSupplierKey(query);
  if (france && (base.countryCode === "FR" || base.countryCode === "" || /france/i.test(query))) {
    base.nameEn = france.nameEn;
    base.countryCode = "FR";
    base.iata = france.iata;
    if (base.lat == null || base.lng == null) {
      const coords = airportCoords(france.iata);
      if (coords) {
        base.lat = coords.lat;
        base.lng = coords.lng;
      }
    }
  }
  const cc = base.countryCode;

  let [hotelbedsCode, ratehawkRegionId] = await Promise.all([
    opts.needHotelbeds && cc ? resolveHotelbedsDestinationCode(base.nameEn, cc) : Promise.resolve(null),
    opts.needRateHawk ? resolveRateHawkRegionId(base.nameEn, cc || "") : Promise.resolve(null),
  ]);
  if (!hotelbedsCode && france && cc === "FR") {
    const listed = await ensureHotelbedsDestinations("FR");
    hotelbedsCode = listed.find((row) => row.code === france.iata)?.code || null;
  }

  const out: ResolvedDestination = { ...base, hotelbedsCode, ratehawkRegionId };
  // Missing supplier keys are cached for a short time only so a transient failure self-heals.
  const complete = (!opts.needHotelbeds || hotelbedsCode) && (!opts.needRateHawk || ratehawkRegionId);
  await cacheSet(cacheKey, out, complete ? 6 * 3600 : 120);
  return out;
}
