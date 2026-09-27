/**
 * Guest currencies — catalog is static; only enabled codes persist.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  CURRENCY_CATALOG,
  DEFAULT_ENABLED_CURRENCY_CODES,
  findCatalogCurrency,
} from "@/data/currency-catalog";
import { isIsoCurrencyCode, normalizeCurrencyCode } from "@/lib/currency";
import type { CurrenciesSettings, SiteCurrency } from "@/types/currency";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "currencies.json");

type StoreFile = {
  defaultCode: string;
  liveFxEnabled: boolean;
  enabledCodes: string[];
};

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-currencies.json");
  }
  return STORE_FILE;
}

export const DEFAULT_CURRENCIES: SiteCurrency[] = CURRENCY_CATALOG.map((row) => ({
  ...row,
  enabled: (DEFAULT_ENABLED_CURRENCY_CODES as readonly string[]).includes(row.code),
}));

export const DEFAULT_CURRENCIES_SETTINGS: CurrenciesSettings = {
  defaultCode: "USD",
  liveFxEnabled: true,
  currencies: DEFAULT_CURRENCIES,
};

function knownCode(code: string): boolean {
  return Boolean(findCatalogCurrency(code));
}

function uniqueCodes(codes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of codes) {
    const code = normalizeCurrencyCode(raw);
    if (!isIsoCurrencyCode(code) || !knownCode(code) || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }
  return out;
}

function mergeCatalog(enabledCodes: string[]): SiteCurrency[] {
  const enabled = new Set(enabledCodes);
  return CURRENCY_CATALOG.map((row) => ({ ...row, enabled: enabled.has(row.code) }));
}

function toSettings(store: StoreFile): CurrenciesSettings {
  const enabledCodes = uniqueCodes(store.enabledCodes);
  const currencies = mergeCatalog(enabledCodes.length ? enabledCodes : [...DEFAULT_ENABLED_CURRENCY_CODES]);
  const enabled = currencies.filter((c) => c.enabled);
  const defaultCode = normalizeCurrencyCode(store.defaultCode);
  const defaultOk = enabled.some((c) => c.code === defaultCode);
  return {
    defaultCode: defaultOk ? defaultCode : enabled[0]?.code || "USD",
    liveFxEnabled: store.liveFxEnabled,
    currencies,
  };
}

function fromLegacy(raw: Record<string, unknown>): StoreFile {
  const incoming = Array.isArray(raw.currencies) ? raw.currencies : [];
  const enabledFromRows = incoming
    .map((row) => {
      const rec = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      const code = normalizeCurrencyCode(rec.code);
      const enabled = rec.enabled === undefined ? true : Boolean(rec.enabled);
      return enabled ? code : "";
    })
    .filter(Boolean);
  const enabledCodes = uniqueCodes(
    Array.isArray(raw.enabledCodes)
      ? (raw.enabledCodes as unknown[]).map((c) => String(c))
      : enabledFromRows.length
        ? enabledFromRows
        : [...DEFAULT_ENABLED_CURRENCY_CODES]
  );
  return {
    defaultCode: normalizeCurrencyCode(raw.defaultCode) || "USD",
    liveFxEnabled: raw.liveFxEnabled === undefined ? true : Boolean(raw.liveFxEnabled),
    enabledCodes,
  };
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    return fromLegacy(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return {
      defaultCode: "USD",
      liveFxEnabled: true,
      enabledCodes: [...DEFAULT_ENABLED_CURRENCY_CODES],
    };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await ensureDir();
  await fs.writeFile(getStoreFile(), JSON.stringify(store, null, 2), { mode: 0o600 });
}

export async function getCurrenciesSettings(): Promise<CurrenciesSettings> {
  return toSettings(await readStore());
}

export async function saveCurrenciesSettings(
  patch: Partial<CurrenciesSettings> & { enabledCodes?: string[] }
): Promise<CurrenciesSettings> {
  const current = await readStore();
  const fromRows = Array.isArray(patch.currencies)
    ? patch.currencies.filter((c) => c.enabled).map((c) => c.code)
    : null;
  const enabledCodes = uniqueCodes(
    patch.enabledCodes || fromRows || current.enabledCodes
  );
  const next: StoreFile = {
    defaultCode: patch.defaultCode ?? current.defaultCode,
    liveFxEnabled: patch.liveFxEnabled === undefined ? current.liveFxEnabled : Boolean(patch.liveFxEnabled),
    enabledCodes: enabledCodes.length ? enabledCodes : [...DEFAULT_ENABLED_CURRENCY_CODES],
  };
  await writeStore(next);
  return toSettings(next);
}

export async function setCurrencyEnabled(codeRaw: string, enabled: boolean): Promise<CurrenciesSettings> {
  const code = normalizeCurrencyCode(codeRaw);
  if (!knownCode(code)) throw new Error("unknown_currency");
  const current = await readStore();
  const set = new Set(uniqueCodes(current.enabledCodes));
  if (enabled) set.add(code);
  else set.delete(code);
  if (!set.size) set.add("USD");
  return saveCurrenciesSettings({
    defaultCode: !enabled && current.defaultCode === code ? "USD" : current.defaultCode,
    liveFxEnabled: current.liveFxEnabled,
    enabledCodes: Array.from(set),
  });
}
