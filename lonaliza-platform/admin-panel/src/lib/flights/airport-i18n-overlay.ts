/**
 * Multilingual airport/city overlay used by autocomplete and the import pipeline.
 * Merges AIRPORT_DICTIONARY + WORLD_CITIES_MASTER onto OurAirports Latin records
 * so Arabic, Turkish, transliterations, and IATA codes resolve without per-city hacks.
 */

import { WORLD_CITIES_MASTER } from "@/lib/geo/world-cities-data";
import { AIRPORT_DICTIONARY } from "@/lib/flights/airport-dictionary";

export type AirportI18nOverlay = {
  cityEn?: string;
  cityAr?: string;
  cityTr?: string;
  nameEn?: string;
  nameAr?: string;
  nameTr?: string;
  aliases: string[];
};

const IATA_RE = /^[A-Z]{3}$/;

export function foldSearchText(value: string): string {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/[إأآاٱ]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .trim();
}

export function hasArabicScript(value: string): boolean {
  return /[\u0600-\u06ff]/.test(value || "");
}

export function searchQueryVariants(query: string): string[] {
  const q = foldSearchText(query);
  if (!q) return [];
  const out = new Set<string>([q]);
  const compact = q.replace(/\s+/g, "");
  if (compact && compact !== q) out.add(compact);
  if (q.startsWith("ال") && q.length > 3) {
    const bare = q.slice(2);
    out.add(bare);
    const bareCompact = bare.replace(/\s+/g, "");
    if (bareCompact) out.add(bareCompact);
  }
  return [...out];
}

function unique(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = String(raw || "").trim();
    if (!value) continue;
    const key = foldSearchText(value) || value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function mergeOverlay(base: AirportI18nOverlay | undefined, extra: AirportI18nOverlay): AirportI18nOverlay {
  if (!base) {
    return { ...extra, aliases: unique(extra.aliases) };
  }
  return {
    cityEn: base.cityEn || extra.cityEn,
    cityAr: base.cityAr || extra.cityAr,
    cityTr: base.cityTr || extra.cityTr,
    nameEn: base.nameEn || extra.nameEn,
    nameAr: base.nameAr || extra.nameAr,
    nameTr: base.nameTr || extra.nameTr,
    aliases: unique([...base.aliases, ...extra.aliases, extra.cityEn, extra.cityAr, extra.cityTr, extra.nameEn, extra.nameAr, extra.nameTr]),
  };
}

type Index = {
  byIata: Map<string, AirportI18nOverlay>;
  byCity: Map<string, AirportI18nOverlay>;
};

let cachedIndex: Index | null = null;

function rememberIata(index: Index, iata: string, overlay: AirportI18nOverlay) {
  const code = iata.toUpperCase();
  if (!IATA_RE.test(code)) return;
  index.byIata.set(code, mergeOverlay(index.byIata.get(code), overlay));
}

function rememberCity(index: Index, countryCode: string, name: string, overlay: AirportI18nOverlay) {
  const folded = foldSearchText(name);
  if (!folded || IATA_RE.test(folded.toUpperCase())) return;
  index.byCity.set(folded, mergeOverlay(index.byCity.get(folded), overlay));
  const cc = String(countryCode || "").toUpperCase();
  if (cc) index.byCity.set(`${cc}:${folded}`, mergeOverlay(index.byCity.get(`${cc}:${folded}`), overlay));
}

function buildIndex(): Index {
  const index: Index = { byIata: new Map(), byCity: new Map() };

  for (const row of Object.values(AIRPORT_DICTIONARY)) {
    const overlay: AirportI18nOverlay = {
      cityEn: row.cityEn,
      cityAr: row.cityAr,
      cityTr: row.cityTr,
      nameEn: row.nameEn,
      nameAr: row.nameAr,
      nameTr: row.nameTr,
      aliases: unique([row.cityEn, row.cityAr, row.cityTr, row.cityFr, row.nameEn, row.nameAr, row.nameTr, row.nameFr, row.iata]),
    };
    rememberIata(index, row.iata, overlay);
    rememberCity(index, "", row.cityEn, overlay);
    rememberCity(index, "", row.cityAr, overlay);
    rememberCity(index, "", row.cityTr, overlay);
    rememberCity(index, "", row.cityFr, overlay);
  }

  for (const city of WORLD_CITIES_MASTER) {
    const iataCodes = (city.aliases || []).filter((alias) => IATA_RE.test(alias.toUpperCase()));
    const overlay: AirportI18nOverlay = {
      cityEn: city.cityNameEn,
      cityAr: city.cityNameAr,
      cityTr: city.cityNameTr,
      aliases: unique([
        city.cityNameEn,
        city.cityNameAr,
        city.cityNameTr,
        ...(city.aliases || []),
        ...iataCodes,
      ]),
    };
    for (const iata of iataCodes) rememberIata(index, iata, overlay);
    rememberCity(index, city.countryCode, city.cityNameEn, overlay);
    rememberCity(index, city.countryCode, city.cityNameAr, overlay);
    rememberCity(index, city.countryCode, city.cityNameTr, overlay);
    for (const alias of city.aliases || []) {
      rememberCity(index, city.countryCode, alias, overlay);
    }
  }

  return index;
}

function getIndex(): Index {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

export function resolveAirportI18n(input: {
  iata?: string;
  cityCode?: string;
  cityEn?: string;
  countryCode?: string;
}): AirportI18nOverlay | null {
  const index = getIndex();
  const iata = String(input.iata || "").toUpperCase();
  const cityCode = String(input.cityCode || "").toUpperCase();
  let overlay = index.byIata.get(iata) || index.byIata.get(cityCode);

  const cityFold = foldSearchText(input.cityEn || "");
  const country = String(input.countryCode || "").toUpperCase();
  const cityHit =
    (country && cityFold ? index.byCity.get(`${country}:${cityFold}`) : undefined) ||
    (cityFold ? index.byCity.get(cityFold) : undefined);
  if (cityHit) overlay = mergeOverlay(overlay, cityHit);

  if (!overlay) return null;
  if (!overlay.cityAr && !overlay.aliases.length) return null;
  return overlay;
}

export function overlayAirportRecord<T extends {
  iata?: string;
  cityCode?: string;
  cityEn: string;
  cityAr: string;
  cityTr: string;
  countryCode: string;
  nameEn?: string;
  nameAr?: string;
  nameTr?: string;
  aliases: string[];
}>(row: T): T {
  const extra = resolveAirportI18n(row);
  if (!extra) return row;
  return {
    ...row,
    cityAr: !hasArabicScript(row.cityAr) && extra.cityAr ? extra.cityAr : row.cityAr,
    cityTr: row.cityTr === row.cityEn && extra.cityTr ? extra.cityTr : row.cityTr,
    nameAr: row.nameAr && !hasArabicScript(row.nameAr) && extra.nameAr ? extra.nameAr : row.nameAr,
    nameTr: row.nameTr && row.nameTr === row.nameEn && extra.nameTr ? extra.nameTr : row.nameTr,
    aliases: unique([
      ...row.aliases,
      ...extra.aliases,
      extra.cityEn,
      extra.cityAr,
      extra.cityTr,
      extra.nameEn,
      extra.nameAr,
      extra.nameTr,
    ]),
  };
}
