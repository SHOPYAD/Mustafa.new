/**
 * Local IATA airport index — reads `.data/airports` only.
 * Autocomplete and nearby never call RapidAPI / Sky Scrapper.
 */

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import {
  foldSearchText,
  hasArabicScript,
  overlayAirportRecord,
  searchQueryVariants,
} from "@/lib/flights/airport-i18n-overlay";
import { applyMappedEntity, ensureSkyEntityMap } from "@/lib/server/sky-entity-ids";

export type AirportLocale = "ar" | "en" | "tr";

export type StoredAirport = {
  iata: string;
  icao: string;
  city: string;
  cityCode: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  type: string;
  nameEn: string;
  nameAr: string;
  nameTr: string;
  cityEn: string;
  cityAr: string;
  cityTr: string;
  countryEn: string;
  countryAr: string;
  countryTr: string;
  aliases: string[];
};

export type StoredCity = {
  cityCode: string;
  countryCode: string;
  cityEn: string;
  cityAr: string;
  cityTr: string;
  countryEn: string;
  countryAr: string;
  countryTr: string;
  lat: number;
  lon: number;
  aliases: string[];
  airports: string[];
};

export type AirportPickDto = {
  skyId: string;
  entityId: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  kind: "city" | "airport";
};

export type AirportsMeta = {
  source: string;
  sourceUrls?: string[];
  importedAt: string;
  airportCount: number;
  cityCount: number;
};

type Index = {
  airports: StoredAirport[];
  cities: StoredCity[];
  byIata: Map<string, StoredAirport>;
  byCity: Map<string, StoredCity>;
  meta: AirportsMeta;
};

const DATA_DIR = path.join(process.cwd(), ".data", "airports");
const SEED_AIRPORTS: StoredAirport[] = [
  seed("IST", "LTFM", "Istanbul", "ISTA", "TR", 41.2753, 28.7519, "large_airport", "Istanbul Airport", "مطار إسطنبول", "İstanbul Havalimanı", "إسطنبول", "İstanbul"),
  seed("SAW", "LTFJ", "Istanbul", "ISTA", "TR", 40.8986, 29.3092, "large_airport", "Sabiha Gokcen", "مطار صبيحة كوكجن", "Sabiha Gökçen Havalimanı", "إسطنبول", "İstanbul"),
  seed("ESB", "LTAC", "Ankara", "ESB", "TR", 40.1281, 32.9951, "large_airport", "Esenboga", "مطار إيسنبوغا", "Esenboğa Havalimanı", "أنقرة", "Ankara"),
  seed("AYT", "LTAI", "Antalya", "AYT", "TR", 36.8987, 30.8005, "large_airport", "Antalya Airport", "مطار أنطاليا", "Antalya Havalimanı", "أنطاليا", "Antalya"),
  seed("ADB", "LTBJ", "Izmir", "ADB", "TR", 38.2924, 27.157, "large_airport", "Adnan Menderes", "مطار عدنان مندريس", "Adnan Menderes Havalimanı", "إزمير", "İzmir"),
  seed("DXB", "OMDB", "Dubai", "DXB", "AE", 25.2532, 55.3657, "large_airport", "Dubai International", "مطار دبي الدولي", "Dubai Uluslararası Havalimanı", "دبي", "Dubai"),
  seed("AUH", "OMAA", "Abu Dhabi", "AUH", "AE", 24.433, 54.6511, "large_airport", "Zayed International", "مطار زايد الدولي", "Zayed Uluslararası Havalimanı", "أبوظبي", "Abu Dabi"),
  seed("DOH", "OTHH", "Doha", "DOH", "QA", 25.2731, 51.6081, "large_airport", "Hamad International", "مطار حمد الدولي", "Hamad Uluslararası Havalimanı", "الدوحة", "Doha"),
  seed("JED", "OEJN", "Jeddah", "JED", "SA", 21.6796, 39.1565, "large_airport", "King Abdulaziz", "مطار الملك عبدالعزيز", "Kral Abdülaziz Havalimanı", "جدة", "Cidde"),
  seed("RUH", "OERK", "Riyadh", "RUH", "SA", 24.9576, 46.6988, "large_airport", "King Khalid", "مطار الملك خالد", "Kral Halid Havalimanı", "الرياض", "Riyad"),
  seed("CAI", "HECA", "Cairo", "CAI", "EG", 30.1219, 31.4056, "large_airport", "Cairo International", "مطار القاهرة الدولي", "Kahire Uluslararası Havalimanı", "القاهرة", "Kahire"),
  seed("LHR", "EGLL", "London", "LOND", "GB", 51.4706, -0.4619, "large_airport", "Heathrow", "مطار هيثرو", "Heathrow Havalimanı", "لندن", "Londra"),
];

function seed(
  iata: string,
  icao: string,
  cityEn: string,
  cityCode: string,
  countryCode: string,
  lat: number,
  lon: number,
  type: string,
  nameEn: string,
  nameAr: string,
  nameTr: string,
  cityAr: string,
  cityTr: string
): StoredAirport {
  const country =
    countryCode === "TR"
      ? { en: "Turkey", ar: "تركيا", tr: "Türkiye" }
      : countryCode === "AE"
        ? { en: "United Arab Emirates", ar: "الإمارات", tr: "Birleşik Arap Emirlikleri" }
        : countryCode === "QA"
          ? { en: "Qatar", ar: "قطر", tr: "Katar" }
          : countryCode === "SA"
            ? { en: "Saudi Arabia", ar: "السعودية", tr: "Suudi Arabistan" }
            : countryCode === "EG"
              ? { en: "Egypt", ar: "مصر", tr: "Mısır" }
              : { en: "United Kingdom", ar: "المملكة المتحدة", tr: "Birleşik Krallık" };
  return {
    iata,
    icao,
    city: cityEn,
    cityCode,
    country: country.en,
    countryCode,
    lat,
    lon,
    type,
    nameEn,
    nameAr,
    nameTr,
    cityEn,
    cityAr,
    cityTr,
    countryEn: country.en,
    countryAr: country.ar,
    countryTr: country.tr,
    aliases: [iata, cityEn, cityAr, cityTr],
  };
}

function citiesFromAirports(airports: StoredAirport[]): StoredCity[] {
  const groups = new Map<string, StoredAirport[]>();
  for (const row of airports) {
    const key = `${row.countryCode}:${row.cityCode}`;
    const list = groups.get(key) || [];
    list.push(row);
    groups.set(key, list);
  }
  return Array.from(groups.values()).map((rows) => {
    const primary = rows[0];
    return {
      cityCode: primary.cityCode,
      countryCode: primary.countryCode,
      cityEn: primary.cityEn,
      cityAr: primary.cityAr,
      cityTr: primary.cityTr,
      countryEn: primary.countryEn,
      countryAr: primary.countryAr,
      countryTr: primary.countryTr,
      lat: primary.lat,
      lon: primary.lon,
      aliases: [...new Set(rows.flatMap((r) => r.aliases))],
      airports: rows.map((r) => r.iata),
    };
  });
}

function buildIndex(airports: StoredAirport[], cities: StoredCity[], meta: AirportsMeta): Index {
  return {
    airports,
    cities,
    byIata: new Map(airports.map((row) => [row.iata, row])),
    byCity: new Map(cities.map((row) => [row.cityCode, row])),
    meta,
  };
}

let cached: Index | null = null;
let loadPromise: Promise<Index> | null = null;

function seedIndex(): Index {
  const overlaid = overlayIndexRecords(SEED_AIRPORTS, citiesFromAirports(SEED_AIRPORTS));
  return buildIndex(overlaid.airports, overlaid.cities, {
    source: "seed",
    importedAt: "",
    airportCount: overlaid.airports.length,
    cityCount: overlaid.cities.length,
  });
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function overlayIndexRecords(airports: StoredAirport[], cities: StoredCity[]): {
  airports: StoredAirport[];
  cities: StoredCity[];
} {
  const nextAirports = airports.map((row) => overlayAirportRecord(row));
  const byIata = new Map(nextAirports.map((row) => [row.iata, row]));
  const nextCities = cities.map((city) => {
    const overlaid = overlayAirportRecord({
      ...city,
      iata: city.cityCode,
    });
    const primary = byIata.get(city.airports[0] || "");
    return {
      ...overlaid,
      aliases: [...new Set([
        ...overlaid.aliases,
        ...city.airports.flatMap((iata) => byIata.get(iata)?.aliases || []),
        primary?.cityAr,
        primary?.cityEn,
        primary?.cityTr,
      ].filter(Boolean) as string[])],
      cityAr: overlaid.cityAr || primary?.cityAr || city.cityAr,
      cityTr: overlaid.cityTr || primary?.cityTr || city.cityTr,
    };
  });
  return { airports: nextAirports, cities: nextCities };
}

async function loadIndex(): Promise<Index> {
  const airports = await readJson<StoredAirport[]>("airports.json");
  const cities = await readJson<StoredCity[]>("cities.json");
  const meta = await readJson<AirportsMeta>("meta.json");
  if (!airports?.length) return seedIndex();
  const overlaid = overlayIndexRecords(airports, cities?.length ? cities : citiesFromAirports(airports));
  return buildIndex(
    overlaid.airports,
    overlaid.cities,
    meta || {
      source: "local",
      importedAt: "",
      airportCount: airports.length,
      cityCount: cities?.length || 0,
    }
  );
}

export async function getAirportsIndex(): Promise<Index> {
  if (cached) return cached;
  if (!loadPromise) {
    loadPromise = loadIndex()
      .then((idx) => {
        cached = idx;
        return idx;
      })
      .finally(() => {
        loadPromise = null;
      });
  }
  return loadPromise;
}

export function invalidateAirportsIndex() {
  cached = null;
}

export async function getAirportsMeta(): Promise<AirportsMeta> {
  const idx = await getAirportsIndex();
  return idx.meta;
}

export function localeOfAirport(raw?: string | null): AirportLocale {
  const value = String(raw || "").toLowerCase();
  if (value.startsWith("ar")) return "ar";
  if (value.startsWith("tr")) return "tr";
  return "en";
}

export function foldAirportText(value: string): string {
  return foldSearchText(value);
}

function localizedAirport(row: StoredAirport, locale: AirportLocale): AirportPickDto {
  const name = locale === "ar" ? row.nameAr : locale === "tr" ? row.nameTr : row.nameEn;
  const city = locale === "ar" ? row.cityAr : locale === "tr" ? row.cityTr : row.cityEn;
  const country = locale === "ar" ? row.countryAr : locale === "tr" ? row.countryTr : row.countryEn;
  return {
    skyId: row.iata,
    entityId: `loc-a-${row.iata}`,
    iata: row.iata,
    name,
    city,
    country,
    kind: "airport",
  };
}

function localizedCity(row: StoredCity, locale: AirportLocale): AirportPickDto {
  const city = locale === "ar" ? row.cityAr : locale === "tr" ? row.cityTr : row.cityEn;
  const country = locale === "ar" ? row.countryAr : locale === "tr" ? row.countryTr : row.countryEn;
  return {
    skyId: row.cityCode,
    entityId: `loc-c-${row.cityCode}`,
    iata: row.cityCode,
    name: city,
    city,
    country,
    kind: "city",
  };
}

function haystacks(row: StoredAirport | StoredCity): string[] {
  if ("iata" in row) {
    return [
      row.iata,
      row.icao,
      row.cityCode,
      row.nameEn,
      row.nameAr,
      row.nameTr,
      row.cityEn,
      row.cityAr,
      row.cityTr,
      row.countryEn,
      row.countryAr,
      row.countryTr,
      ...row.aliases,
    ].map(foldAirportText);
  }
  return [
    row.cityCode,
    row.cityEn,
    row.cityAr,
    row.cityTr,
    row.countryEn,
    row.countryAr,
    row.countryTr,
    ...row.aliases,
  ].map(foldAirportText);
}

function scoreText(query: string, texts: string[]): number {
  const variants = searchQueryVariants(query);
  if (!variants.length) return 0;
  let best = 0;
  const arabic = hasArabicScript(query);
  const containMin = arabic ? 2 : 4;
  for (const q of variants) {
    for (const raw of texts) {
      if (!raw) continue;
      const text = raw.replace(/\binternational\b/g, " ").replace(/\s+/g, " ").trim();
      if (!text) continue;
      const compactText = text.replace(/\s+/g, "");
      if (text === q || compactText === q) {
        best = Math.max(best, 1000);
        continue;
      }
      if (text.startsWith(q) || compactText.startsWith(q)) {
        best = Math.max(best, 780);
        continue;
      }
      const words = text.split(" ");
      if (words.some((word) => word === q)) {
        best = Math.max(best, 720);
        continue;
      }
      if (words.some((word) => word.startsWith(q) && q.length >= 2)) {
        best = Math.max(best, 640);
        continue;
      }
      if (q.length >= containMin && (text.includes(q) || compactText.includes(q))) {
        best = Math.max(best, 360);
      }
    }
  }
  return best;
}

function typeBoost(type: string): number {
  if (type === "large_airport") return 40;
  if (type === "medium_airport") return 15;
  return 0;
}

export async function searchLocalAirports(query: string, localeRaw?: string | null): Promise<AirportPickDto[]> {
  const q = foldAirportText(query);
  if (q.length < 2) return [];
  const locale = localeOfAirport(localeRaw);
  const [idx] = await Promise.all([getAirportsIndex(), ensureSkyEntityMap()]);
  const compact = q.replace(/\s+/g, "");

  const scoredAirports: Array<{ row: StoredAirport; score: number }> = [];
  for (const row of idx.airports) {
    const texts = haystacks(row);
    let score = scoreText(q, texts);
    if (compact.length === 3 && row.iata.toLowerCase() === compact) score = Math.max(score, 1200);
    if (row.cityCode.toLowerCase().startsWith(compact)) score = Math.max(score, 900);
    if (score <= 0) continue;
    scoredAirports.push({ row, score: score + typeBoost(row.type) });
  }
  scoredAirports.sort((a, b) => b.score - a.score);

  const cityScores = new Map<string, number>();
  for (const city of idx.cities) {
    let score = scoreText(q, haystacks(city));
    if (city.cityCode.toLowerCase().startsWith(compact)) score = Math.max(score, 920);
    if (score > 0) cityScores.set(city.cityCode, score);
  }
  for (const item of scoredAirports) {
    const prev = cityScores.get(item.row.cityCode) || 0;
    cityScores.set(item.row.cityCode, Math.max(prev, item.score));
  }

  const out: AirportPickDto[] = [];
  const seen = new Set<string>();
  const push = (hit: AirportPickDto) => {
    const key = `${hit.kind}:${hit.iata}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(hit);
  };

  const strong = scoredAirports.filter((item) => item.score >= 640);
  const pool = strong.length ? strong : scoredAirports.slice(0, 16);
  const topCities = [...cityScores.entries()]
    .filter(([, score]) => (strong.length ? score >= 640 : score > 0))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  for (const [code] of topCities) {
    const city = idx.byCity.get(code);
    if (!city) continue;
    if (city.airports.length > 1) push(localizedCity(city, locale));
    for (const iata of city.airports) {
      const airport = idx.byIata.get(iata);
      if (airport) push(localizedAirport(airport, locale));
    }
  }

  for (const item of pool) {
    if (out.length >= 20) break;
    push(localizedAirport(item.row, locale));
  }
  return out.slice(0, 20).map((hit) => applyMappedEntity(hit));
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function nearbyLocalAirport(
  lat: number,
  lon: number,
  localeRaw?: string | null
): Promise<AirportPickDto | null> {
  const locale = localeOfAirport(localeRaw);
  const [idx] = await Promise.all([getAirportsIndex(), ensureSkyEntityMap()]);
  const PRIMARY = new Set(["IST", "LHR", "CDG", "JFK", "DXB", "FRA", "AMS", "MAD", "FCO", "DOH"]);
  let best: { row: StoredAirport; km: number } | null = null;
  for (const row of idx.airports) {
    if (!Number.isFinite(row.lat) || !Number.isFinite(row.lon)) continue;
    if (row.type !== "large_airport" && row.type !== "medium_airport") continue;
    const km = haversineKm(lat, lon, row.lat, row.lon);
    if (!best || km < best.km) best = { row, km };
  }
  if (best) {
    const primary = idx.airports.find(
      (row) =>
        row.cityCode === best.row.cityCode &&
        PRIMARY.has(row.iata) &&
        haversineKm(lat, lon, row.lat, row.lon) < 80
    );
    if (primary) return applyMappedEntity(localizedAirport(primary, locale));
    return applyMappedEntity(localizedAirport(best.row, locale));
  }
  return null;
}

export async function runAirportsImport(): Promise<AirportsMeta> {
  const script = path.join(process.cwd(), "scripts", "import-airports.mjs");
  const result = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
  if (result.code !== 0) {
    throw new Error("airport import failed");
  }
  invalidateAirportsIndex();
  const meta = await readJson<AirportsMeta>("meta.json");
  if (!meta) throw new Error("airport import wrote no meta");
  return meta;
}

export const KNOWN_CITY_AIRPORTS: Record<string, string[]> = {
  ISTA: ["IST", "SAW"],
  IST: ["IST", "SAW"],
  SAW: ["SAW", "IST"],
  LOND: ["LHR", "LGW", "STN", "LTN"],
  LON: ["LHR", "LGW", "STN", "LTN"],
  PARI: ["CDG", "ORY", "BVA"],
  PAR: ["CDG", "ORY", "BVA"],
  NYCA: ["JFK", "EWR", "LGA"],
  NYC: ["JFK", "EWR", "LGA"],
  MILA: ["MXP", "LIN", "BGY"],
  MIL: ["MXP", "LIN", "BGY"],
  TYOA: ["HND", "NRT"],
  TYO: ["HND", "NRT"],
  MOSC: ["SVO", "DME", "VKO"],
  MOW: ["SVO", "DME", "VKO"],
  DUBA: ["DXB", "DWC"],
  DXB: ["DXB", "DWC"],
  RIYA: ["RUH"],
  RUH: ["RUH"],
  JEDD: ["JED"],
  JED: ["JED"],
  MEDI: ["MED"],
  MED: ["MED"],
  DAMM: ["DMM"],
  DMM: ["DMM"],
  CAIR: ["CAI"],
  CAI: ["CAI"],
  DOHA: ["DOH"],
  DOH: ["DOH"],
  KUWA: ["KWI"],
  KWI: ["KWI"],
  AMMA: ["AMM"],
  AMM: ["AMM"],
  TRAB: ["TZX"],
  TZX: ["TZX"],
  ANTA: ["AYT"],
  AYT: ["AYT"],
  IZMI: ["ADB"],
  ADB: ["ADB"],
  ANKA: ["ESB"],
  ESB: ["ESB"],
  BODR: ["BJV"],
  BJV: ["BJV"],
  DALA: ["DLM"],
  DLM: ["DLM"],
  ROME: ["FCO", "CIA"],
  ROM: ["FCO", "CIA"],
  BERL: ["BER"],
  BER: ["BER"],
  MADR: ["MAD"],
  MAD: ["MAD"],
  BARC: ["BCN"],
  BCN: ["BCN"],
  AMST: ["AMS"],
  AMS: ["AMS"],
  VIEN: ["VIE"],
  VIE: ["VIE"],
  BEIR: ["BEY"],
  BEY: ["BEY"],
  CASA: ["CMN"],
  CMN: ["CMN"],
};

export async function resolveAirportsForCode(code?: string | null): Promise<string[]> {
  const clean = String(code || "")
    .trim()
    .toUpperCase()
    .replace(/^LOC-[AC]-/i, "");
  if (!clean) return [];

  if (KNOWN_CITY_AIRPORTS[clean]) {
    return [...KNOWN_CITY_AIRPORTS[clean]];
  }

  try {
    const idx = await getAirportsIndex();
    const airport = idx.byIata.get(clean);
    if (airport) return [airport.iata];

    const city = idx.byCity.get(clean);
    if (city && Array.isArray(city.airports) && city.airports.length > 0) {
      return [...city.airports];
    }
  } catch {
    /* fallback to heuristics below */
  }

  if (clean.length === 3) return [clean];

  if (clean.length === 4) {
    return [clean.slice(0, 3)];
  }

  return [clean.slice(0, 3) || clean];
}
