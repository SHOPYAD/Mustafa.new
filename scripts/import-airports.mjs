#!/usr/bin/env node
/**
 * Import commercial IATA airports from OurAirports (public CSV).
 * Writes `.data/airports/` — no RapidAPI / Sky Scrapper calls.
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, ".data", "airports");
const I18N_PATH = path.join(ROOT, "src", "data", "airport-i18n.json");
const SOURCE = {
  name: "OurAirports",
  airportsUrl: "https://davidmegginson.github.io/ourairports-data/airports.csv",
  countriesUrl: "https://davidmegginson.github.io/ourairports-data/countries.csv",
};

function fold(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/[إأآا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .trim();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((item) => item.trim())) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    if (row.some((item) => item.trim())) rows.push(row);
  }
  return rows;
}

function csvObjects(text) {
  const rows = parseCsv(text);
  const header = (rows.shift() || []).map((h) => h.trim());
  return rows.map((cols) => {
    const rec = {};
    header.forEach((key, i) => {
      rec[key] = cols[i] || "";
    });
    return rec;
  });
}

async function download(url) {
  const res = await fetch(url, { headers: { Accept: "text/csv,*/*" } });
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  return res.text();
}

const METRO_BY_IATA = {
  IST: { cityCode: "ISTA", cityEn: "Istanbul" },
  SAW: { cityCode: "ISTA", cityEn: "Istanbul" },
  ISL: { cityCode: "ISTA", cityEn: "Istanbul" },
  LHR: { cityCode: "LOND", cityEn: "London" },
  LGW: { cityCode: "LOND", cityEn: "London" },
  STN: { cityCode: "LOND", cityEn: "London" },
  LCY: { cityCode: "LOND", cityEn: "London" },
  LTN: { cityCode: "LOND", cityEn: "London" },
  CDG: { cityCode: "PARI", cityEn: "Paris" },
  ORY: { cityCode: "PARI", cityEn: "Paris" },
  BVA: { cityCode: "PARI", cityEn: "Paris" },
  JFK: { cityCode: "NYCA", cityEn: "New York" },
  EWR: { cityCode: "NYCA", cityEn: "New York" },
  LGA: { cityCode: "NYCA", cityEn: "New York" },
  FCO: { cityCode: "ROME", cityEn: "Rome" },
  CIA: { cityCode: "ROME", cityEn: "Rome" },
  MXP: { cityCode: "MILA", cityEn: "Milan" },
  LIN: { cityCode: "MILA", cityEn: "Milan" },
  BGY: { cityCode: "MILA", cityEn: "Milan" },
  BER: { cityCode: "BERL", cityEn: "Berlin" },
  SXF: { cityCode: "BERL", cityEn: "Berlin" },
  TXL: { cityCode: "BERL", cityEn: "Berlin" },
  NRT: { cityCode: "TYOA", cityEn: "Tokyo" },
  HND: { cityCode: "TYOA", cityEn: "Tokyo" },
  IAD: { cityCode: "WASA", cityEn: "Washington" },
  DCA: { cityCode: "WASA", cityEn: "Washington" },
  BWI: { cityCode: "WASA", cityEn: "Washington" },
};

function pickCityI18n(i18n, cityEn, countryCode, iata) {
  const metro = METRO_BY_IATA[iata];
  const key = fold(metro?.cityEn || cityEn);
  const byIata = i18n.iata?.[iata] || i18n.iata?.[String(iata || "").toUpperCase()];
  let hit = byIata || i18n.cities[key];
  if (!hit && i18n.cities) {
    for (const [cityKey, row] of Object.entries(i18n.cities)) {
      const names = [cityKey, row.en, ...(row.aliases || [])].map(fold).filter(Boolean);
      if (!names.includes(key)) continue;
      if (row.country && row.country !== countryCode && !metro) continue;
      hit = row;
      break;
    }
  }
  if (!hit) return metro ? { ...metro, ar: cityEn, tr: cityEn, aliases: [] } : null;
  if (hit.country && hit.country !== countryCode && !metro && !byIata) return null;
  return {
    ...hit,
    cityCode: metro?.cityCode || hit.cityCode,
    en: hit.en || metro?.cityEn || cityEn,
    aliases: [...new Set([...(hit.aliases || []), metro?.cityEn, cityEn].filter(Boolean))],
  };
}

function typeRank(type) {
  if (type === "large_airport") return 3;
  if (type === "medium_airport") return 2;
  return 1;
}

const CLOSED_IATA = new Set(["ISL", "SXF", "TXL"]);

function keepAirport(row) {
  const iata = String(row.iata_code || "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(iata)) return false;
  if (CLOSED_IATA.has(iata)) return false;
  const type = String(row.type || "");
  const name = String(row.name || "").toLowerCase();
  if (type === "closed" || type === "heliport" || type === "balloonport") return false;
  if (/\bclosed\b/.test(name)) return false;
  if (type === "large_airport" || type === "medium_airport") return true;
  return String(row.scheduled_service || "").toLowerCase() === "yes";
}

const NAME_BY_IATA = {
  IST: { en: "Istanbul Airport", ar: "مطار إسطنبول", tr: "İstanbul Havalimanı" },
  SAW: { en: "Sabiha Gokcen", ar: "مطار صبيحة كوكجن", tr: "Sabiha Gökçen Havalimanı" },
  ESB: { en: "Esenboga", ar: "مطار إيسنبوغا", tr: "Esenboğa Havalimanı" },
  AYT: { en: "Antalya Airport", ar: "مطار أنطاليا", tr: "Antalya Havalimanı" },
  ADB: { en: "Adnan Menderes", ar: "مطار عدنان مندريس", tr: "Adnan Menderes Havalimanı" },
  DXB: { en: "Dubai International", ar: "مطار دبي الدولي", tr: "Dubai Uluslararası Havalimanı" },
  AUH: { en: "Zayed International", ar: "مطار زايد الدولي", tr: "Zayed Uluslararası Havalimanı" },
  DOH: { en: "Hamad International", ar: "مطار حمد الدولي", tr: "Hamad Uluslararası Havalimanı" },
  JED: { en: "King Abdulaziz", ar: "مطار الملك عبدالعزيز", tr: "Kral Abdülaziz Havalimanı" },
  RUH: { en: "King Khalid", ar: "مطار الملك خالد", tr: "Kral Halid Havalimanı" },
  CAI: { en: "Cairo International", ar: "مطار القاهرة الدولي", tr: "Kahire Uluslararası Havalimanı" },
  LHR: { en: "Heathrow", ar: "مطار هيثرو", tr: "Heathrow Havalimanı" },
};

function airportNameI18n(nameEn, city, iata) {
  const named = NAME_BY_IATA[iata];
  if (named) return named;
  const lower = nameEn.toLowerCase();
  if (city) {
    if (/international/.test(lower)) {
      return {
        en: nameEn,
        ar: `مطار ${city.ar} الدولي`,
        tr: `${city.tr} Havalimanı`,
      };
    }
    return {
      en: nameEn,
      ar: `مطار ${city.ar}`,
      tr: `${city.tr} Havalimanı`,
    };
  }
  return { en: nameEn, tr: nameEn, ar: nameEn };
}

async function importAirports() {
  const i18n = JSON.parse(await fs.readFile(I18N_PATH, "utf8"));
  const [airportsCsv, countriesCsv] = await Promise.all([
    download(SOURCE.airportsUrl),
    download(SOURCE.countriesUrl),
  ]);

  const countryEn = {};
  for (const row of csvObjects(countriesCsv)) {
    const code = String(row.code || "").trim().toUpperCase();
    if (code) countryEn[code] = String(row.name || code).trim();
  }

  const airports = [];
  const seenIata = new Set();
  for (const row of csvObjects(airportsCsv)) {
    if (!keepAirport(row)) continue;
    const iata = String(row.iata_code).trim().toUpperCase();
    if (seenIata.has(iata)) continue;
    seenIata.add(iata);
    const countryCode = String(row.iso_country || "").trim().toUpperCase();
    const cityEn = String(row.municipality || "").trim() || String(row.name || iata).trim();
    const nameEn = String(row.name || "").trim() || `${cityEn} Airport`;
    const countryDict = i18n.countries[countryCode];
    const cityDict = pickCityI18n(i18n, cityEn, countryCode, iata);
    const names = airportNameI18n(nameEn, cityDict, iata);
    const keywords = String(row.keywords || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    airports.push({
      iata,
      icao: String(row.icao_code || row.ident || "").trim().toUpperCase(),
      city: cityEn,
      cityCode: cityDict?.cityCode || iata,
      country: countryDict?.en || countryEn[countryCode] || countryCode,
      countryCode,
      lat: Number(row.latitude_deg) || 0,
      lon: Number(row.longitude_deg) || 0,
      type: String(row.type || "medium_airport"),
      nameEn: names.en || nameEn,
      nameAr: names.ar,
      nameTr: names.tr,
      cityEn: cityDict?.en || cityEn,
      cityAr: cityDict?.ar || cityEn,
      cityTr: cityDict?.tr || cityEn,
      countryEn: countryDict?.en || countryEn[countryCode] || countryCode,
      countryAr: countryDict?.ar || countryEn[countryCode] || countryCode,
      countryTr: countryDict?.tr || countryEn[countryCode] || countryCode,
      aliases: [...new Set([...(cityDict?.aliases || []), ...keywords, iata, cityEn])],
    });
  }

  const groups = new Map();
  for (const row of airports) {
    const key = `${row.countryCode}:${row.cityCode || fold(row.cityEn)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const cities = [];
  for (const [key, rows] of groups) {
    rows.sort((a, b) => typeRank(b.type) - typeRank(a.type));
    const primary = rows[0];
    const cityCode =
      rows.find((r) => r.cityCode && r.cityCode !== r.iata)?.cityCode ||
      (rows.length > 1 ? `${primary.iata}A`.slice(0, 4) : primary.iata);
    for (const row of rows) row.cityCode = cityCode;
    cities.push({
      cityCode,
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
    });
    void key;
  }

  airports.sort((a, b) => a.iata.localeCompare(b.iata));
  cities.sort((a, b) => a.cityCode.localeCompare(b.cityCode));

  const meta = {
    source: SOURCE.name,
    sourceUrls: [SOURCE.airportsUrl, SOURCE.countriesUrl],
    importedAt: new Date().toISOString(),
    airportCount: airports.length,
    cityCount: cities.length,
  };

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, "airports.json"), JSON.stringify(airports));
  await fs.writeFile(path.join(OUT_DIR, "cities.json"), JSON.stringify(cities));
  await fs.writeFile(path.join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2));
  return meta;
}

const meta = await importAirports();
console.log(
  JSON.stringify({
    ok: true,
    source: meta.source,
    airportCount: meta.airportCount,
    cityCount: meta.cityCount,
    importedAt: meta.importedAt,
  })
);
