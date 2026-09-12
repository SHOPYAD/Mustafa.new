/**
 * Local airline logo index — reads `.data/airlines` only.
 */

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { HOMEPAGE_AIRLINES } from "@/data/partner-logo-catalog";

export type StoredAirline = {
  iata: string;
  icao: string;
  name: string;
  country: string;
  logoUrl: string;
  aliases: string[];
};

export type AirlinesMeta = {
  source: string;
  sourceUrls?: string[];
  importedAt: string;
  airlineCount: number;
};

type Index = {
  airlines: StoredAirline[];
  byIata: Map<string, StoredAirline>;
  byIcao: Map<string, StoredAirline>;
  byName: Map<string, StoredAirline>;
  meta: AirlinesMeta;
};

const DATA_DIR = path.join(process.cwd(), ".data", "airlines");
const KIWI_CDN = "https://images.kiwi.com/airlines/64";

/** Sky Scrapper sometimes returns non-IATA marketing codes. */
const CODE_ALIASES: Record<string, string> = {
  H9: "PC",
  "^5": "F3",
  FAD: "F3",
  PGT: "PC",
  KNE: "XY",
};

/* Agent B: public homepage content — 100+ real carriers for sliders + flight lookup */
const SEED_AIRLINES: StoredAirline[] = HOMEPAGE_AIRLINES.map((row) =>
  seed(row.iata, row.icao, row.name, row.country)
);

function seed(iata: string, icao: string, name: string, country: string): StoredAirline {
  return {
    iata,
    icao,
    name,
    country,
    logoUrl: `${KIWI_CDN}/${iata}.png`,
    aliases: [foldAirlineText(name), foldAirlineText(name).replace(/\s+airlines?$/, "")],
  };
}

function buildIndex(airlines: StoredAirline[], meta: AirlinesMeta): Index {
  const byIata = new Map<string, StoredAirline>();
  const byIcao = new Map<string, StoredAirline>();
  const byName = new Map<string, StoredAirline>();
  for (const row of airlines) {
    byIata.set(row.iata.toUpperCase(), row);
    if (row.icao) byIcao.set(row.icao.toUpperCase(), row);
    byName.set(foldAirlineText(row.name), row);
    for (const alias of row.aliases) {
      if (alias) byName.set(alias, row);
    }
  }
  return { airlines, byIata, byIcao, byName, meta };
}

let cached: Index | null = null;
let loadPromise: Promise<Index> | null = null;

function seedIndex(): Index {
  return buildIndex(SEED_AIRLINES, {
    source: "seed",
    importedAt: "",
    airlineCount: SEED_AIRLINES.length,
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

async function persistSeed(index: Index) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, "airlines.json"), JSON.stringify(index.airlines, null, 2));
    await fs.writeFile(
      path.join(DATA_DIR, "meta.json"),
      JSON.stringify({ ...index.meta, importedAt: index.meta.importedAt || new Date().toISOString() }, null, 2)
    );
  } catch {
    /* keep serving seed if disk is read-only */
  }
}

async function loadIndex(): Promise<Index> {
  const airlines = await readJson<StoredAirline[]>("airlines.json");
  const meta = await readJson<AirlinesMeta>("meta.json");
  if (!airlines?.length) {
    const seeded = seedIndex();
    await persistSeed(seeded);
    return seeded;
  }
  return buildIndex(airlines, meta || {
    source: "local",
    importedAt: "",
    airlineCount: airlines.length,
  });
}

/** Curated 100+ carriers for the public homepage sliders. */
export async function getHomepageAirlines(): Promise<StoredAirline[]> {
  const idx = await getAirlinesIndex();
  const rows = HOMEPAGE_AIRLINES.map((row) => {
    const found = idx.byIata.get(row.iata.toUpperCase());
    if (found) return found;
    return seed(row.iata, row.icao, row.name, row.country);
  });
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, "homepage-showcase.json"), JSON.stringify(rows, null, 2));
  } catch {
    /* ignore */
  }
  return rows;
}

export async function getAirlinesIndex(): Promise<Index> {
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

export function invalidateAirlinesIndex() {
  cached = null;
}

export async function getAirlinesMeta(): Promise<AirlinesMeta> {
  const idx = await getAirlinesIndex();
  return idx.meta;
}

export function foldAirlineText(value: string): string {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function kiwiAirlineLogo(iata: string): string {
  const code = String(iata || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{2,3}$/.test(code)) return "";
  return `${KIWI_CDN}/${code}.png`;
}

export function resolveAirlineCode(code?: string | null): string {
  const raw = String(code || "").trim().toUpperCase();
  if (!raw) return "";
  return CODE_ALIASES[raw] || raw;
}

export async function lookupAirline(code?: string | null, name?: string | null): Promise<StoredAirline | null> {
  const idx = await getAirlinesIndex();
  const normalized = resolveAirlineCode(code);
  if (normalized && idx.byIata.has(normalized)) return idx.byIata.get(normalized)!;
  if (normalized && idx.byIcao.has(normalized)) return idx.byIcao.get(normalized)!;
  const folded = foldAirlineText(name || "");
  if (folded && idx.byName.has(folded)) return idx.byName.get(folded)!;
  if (normalized && /^[A-Z0-9]{2,3}$/.test(normalized)) {
    return {
      iata: normalized,
      icao: "",
      name: String(name || normalized).trim(),
      country: "",
      logoUrl: kiwiAirlineLogo(normalized),
      aliases: [],
    };
  }
  return null;
}

export async function searchAirlines(query: string, limit = 40): Promise<StoredAirline[]> {
  const idx = await getAirlinesIndex();
  const q = foldAirlineText(query);
  if (!q) return idx.airlines.slice(0, limit);
  const hits: StoredAirline[] = [];
  for (const row of idx.airlines) {
    if (
      row.iata.toLowerCase().includes(q) ||
      row.icao.toLowerCase().includes(q) ||
      foldAirlineText(row.name).includes(q) ||
      row.aliases.some((alias) => alias.includes(q))
    ) {
      hits.push(row);
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

export async function runAirlinesImport(): Promise<AirlinesMeta> {
  const script = path.join(process.cwd(), "scripts", "import-airlines.mjs");
  const result = await new Promise<{ code: number }>((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1 }));
  });
  if (result.code !== 0) throw new Error("airline import failed");
  invalidateAirlinesIndex();
  const meta = await readJson<AirlinesMeta>("meta.json");
  if (!meta) throw new Error("airline import wrote no meta");
  return meta;
}
