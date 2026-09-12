import { promises as fs } from "fs";
import path from "path";
import { convertAmount, normalizeCurrencyCode } from "@/lib/currency";

/** Official iyzico Checkout Form currencies (docs 28 Aug 2026). */
export const IYZICO_CURRENCIES = ["TRY", "USD", "EUR", "GBP", "NOK", "CHF"] as const;
export type IyzicoCurrency = (typeof IYZICO_CURRENCIES)[number];

export const FX_CACHE_TTL_MS = 12 * 60 * 1000;

const CACHE_FILE = path.join(process.cwd(), ".data", "iyzico-fx-cache.json");
const TABLE_FILE = path.join(process.cwd(), ".data", "fx-usd-table.json");

export type SpotRate = {
  rate: number;
  source: string;
  at: string;
  stale?: boolean;
};

export type UsdRateTable = {
  base: "USD";
  rates: Record<string, number>;
  source: string;
  at: string;
  expiresAt: number;
  stale?: boolean;
  error?: string;
};

type CacheFile = {
  pairs: Record<string, SpotRate & { expiresAt: number }>;
};

const memory = new Map<string, SpotRate & { expiresAt: number }>();
let tableMemory: UsdRateTable | null = null;

function pairKey(from: string, to: string): string {
  return `${from}_${to}`;
}

export function isOfficialIyzicoCurrency(code: string): code is IyzicoCurrency {
  return (IYZICO_CURRENCIES as readonly string[]).includes(code.toUpperCase());
}

function validRate(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function pickRates(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, number> = {};
  for (const [code, raw] of Object.entries(value as Record<string, unknown>)) {
    const rate = validRate(raw);
    const iso = normalizeCurrencyCode(code);
    if (rate && /^[A-Z]{3}$/.test(iso)) out[iso] = rate;
  }
  return out;
}

async function readDiskCache(): Promise<CacheFile> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as CacheFile;
    if (parsed && parsed.pairs && typeof parsed.pairs === "object") return parsed;
  } catch {
    /* missing or corrupt cache */
  }
  return { pairs: {} };
}

async function writeDiskCache(file: CacheFile): Promise<void> {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(file, null, 2), { mode: 0o600 });
}

async function cached(from: string, to: string): Promise<SpotRate | null> {
  const key = pairKey(from, to);
  const now = Date.now();
  const mem = memory.get(key);
  if (mem && mem.expiresAt > now) return mem;
  const disk = await readDiskCache();
  const row = disk.pairs[key];
  if (row && row.expiresAt > now && validRate(row.rate)) {
    memory.set(key, row);
    return row;
  }
  return null;
}

async function staleCached(from: string, to: string): Promise<SpotRate | null> {
  const key = pairKey(from, to);
  const mem = memory.get(key);
  if (mem && validRate(mem.rate)) {
    return { rate: mem.rate, source: mem.source, at: mem.at, stale: true };
  }
  const disk = await readDiskCache();
  const row = disk.pairs[key];
  if (row && validRate(row.rate)) {
    memory.set(key, row);
    return { rate: row.rate, source: row.source, at: row.at, stale: true };
  }
  return null;
}

async function store(from: string, to: string, spot: SpotRate): Promise<void> {
  const key = pairKey(from, to);
  const row = { ...spot, stale: false, expiresAt: Date.now() + FX_CACHE_TTL_MS };
  memory.set(key, row);
  const disk = await readDiskCache();
  disk.pairs[key] = row;
  await writeDiskCache(disk).catch(() => {
    /* memory cache still works */
  });
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

/** ECB daily rates via Frankfurter (no API key). */
async function frankfurter(from: string, to: string): Promise<SpotRate | null> {
  const data = await fetchJson(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
  if (!data) return null;
  const rates = data.rates && typeof data.rates === "object" ? (data.rates as Record<string, unknown>) : {};
  const rate = validRate(rates[to]);
  if (!rate) return null;
  return { rate, source: "frankfurter.app", at: new Date().toISOString() };
}

/** Fallback open exchange rates (no API key). */
async function openErApi(from: string, to: string): Promise<SpotRate | null> {
  const data = await fetchJson(`https://open.er-api.com/v6/latest/${from}`);
  if (!data || String(data.result || "") !== "success") return null;
  const rates = data.rates && typeof data.rates === "object" ? (data.rates as Record<string, unknown>) : {};
  const rate = validRate(rates[to]);
  if (!rate) return null;
  return { rate, source: "open.er-api.com", at: new Date().toISOString() };
}

async function frankfurterUsdTable(): Promise<{ rates: Record<string, number>; source: string } | null> {
  const data = await fetchJson("https://api.frankfurter.app/latest?from=USD");
  if (!data) return null;
  const rates = pickRates(data.rates);
  if (!Object.keys(rates).length) return null;
  rates.USD = 1;
  return { rates, source: "frankfurter.app" };
}

async function openErUsdTable(): Promise<{ rates: Record<string, number>; source: string } | null> {
  const data = await fetchJson("https://open.er-api.com/v6/latest/USD");
  if (!data || String(data.result || "") !== "success") return null;
  const rates = pickRates(data.rates);
  if (!Object.keys(rates).length) return null;
  rates.USD = 1;
  return { rates, source: "open.er-api.com" };
}

async function readTableDisk(): Promise<UsdRateTable | null> {
  try {
    const raw = await fs.readFile(TABLE_FILE, "utf8");
    const parsed = JSON.parse(raw) as UsdRateTable;
    if (parsed?.base === "USD" && parsed.rates && typeof parsed.rates === "object") {
      return parsed;
    }
  } catch {
    /* missing */
  }
  return null;
}

async function writeTableDisk(table: UsdRateTable): Promise<void> {
  await fs.mkdir(path.dirname(TABLE_FILE), { recursive: true });
  await fs.writeFile(TABLE_FILE, JSON.stringify(table, null, 2), { mode: 0o600 });
}

function tableFresh(table: UsdRateTable | null): boolean {
  return Boolean(table && table.expiresAt > Date.now() && table.rates.USD === 1);
}

function spotFromTable(table: UsdRateTable, from: string, to: string): SpotRate | null {
  const fromRate = validRate(table.rates[from]);
  const toRate = validRate(table.rates[to]);
  if (!fromRate || !toRate) return null;
  return {
    rate: convertAmount(1, fromRate, toRate),
    source: table.source,
    at: table.at,
    stale: table.stale,
  };
}

export async function getUsdRateTable(opts?: { refresh?: boolean }): Promise<UsdRateTable> {
  const now = Date.now();
  if (tableFresh(tableMemory)) return tableMemory as UsdRateTable;
  const disk = await readTableDisk();
  if (tableFresh(disk)) {
    tableMemory = disk;
    return disk as UsdRateTable;
  }
  if (opts?.refresh === false) {
    if (tableMemory) return { ...tableMemory, stale: true };
    if (disk) return { ...disk, stale: true };
    return {
      base: "USD",
      rates: { USD: 1 },
      source: "identity",
      at: new Date().toISOString(),
      expiresAt: now + 30_000,
      stale: true,
    };
  }

  const sources: string[] = [];
  let merged: Record<string, number> = { USD: 1 };
  let lastError = "";

  try {
    const openEr = await openErUsdTable();
    if (openEr) {
      merged = { ...merged, ...openEr.rates };
      sources.push(openEr.source);
    }
  } catch {
    lastError = "fx_open_er_failed";
  }

  try {
    const frank = await frankfurterUsdTable();
    if (frank) {
      merged = { ...merged, ...frank.rates };
      sources.push(frank.source);
    }
  } catch {
    lastError = "fx_frankfurter_failed";
  }

  if (Object.keys(merged).length > 1) {
    const table: UsdRateTable = {
      base: "USD",
      rates: merged,
      source: sources.join("+") || "live",
      at: new Date().toISOString(),
      expiresAt: now + FX_CACHE_TTL_MS,
      stale: false,
    };
    tableMemory = table;
    await writeTableDisk(table).catch(() => {
      /* memory still works */
    });
    return table;
  }

  const stale = tableMemory || disk;
  if (stale && validRate(stale.rates.USD)) {
    const kept: UsdRateTable = { ...stale, stale: true, error: lastError || "fx_unavailable" };
    tableMemory = kept;
    return kept;
  }

  return {
    base: "USD",
    rates: { USD: 1 },
    source: "unavailable",
    at: new Date().toISOString(),
    expiresAt: now + 30_000,
    stale: true,
    error: lastError || "fx_unavailable",
  };
}

export async function getSpotRate(fromRaw: string, toRaw: string): Promise<SpotRate> {
  const from = normalizeCurrencyCode(fromRaw);
  const to = normalizeCurrencyCode(toRaw);
  if (from === to) {
    return { rate: 1, source: "identity", at: new Date().toISOString() };
  }
  const hit = await cached(from, to);
  if (hit) return hit;

  const table = await getUsdRateTable();
  const fromTable = spotFromTable(table, from, to);
  if (fromTable && !fromTable.stale) {
    await store(from, to, fromTable);
    return fromTable;
  }

  try {
    const primary = await frankfurter(from, to);
    if (primary) {
      await store(from, to, primary);
      return primary;
    }
  } catch {
    /* try fallback */
  }
  try {
    const fallback = await openErApi(from, to);
    if (fallback) {
      await store(from, to, fallback);
      return fallback;
    }
  } catch {
    /* try stale */
  }

  if (fromTable) return fromTable;
  const stale = await staleCached(from, to);
  if (stale) return stale;
  throw new Error(table.error || "fx_unavailable");
}

export async function getSpotRateSafe(fromRaw: string, toRaw: string): Promise<SpotRate> {
  try {
    return await getSpotRate(fromRaw, toRaw);
  } catch {
    return {
      rate: 1,
      source: "unavailable",
      at: new Date().toISOString(),
      stale: true,
    };
  }
}
