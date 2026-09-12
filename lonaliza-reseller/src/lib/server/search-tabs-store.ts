/**
 * Server source of truth for public search-tab visibility + order.
 * localStorage alone hid tabs on the admin desktop browser but not on phones.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  defaultSearchTabOrder,
  defaultSearchTabVisibility,
  SEARCH_TAB_KEYS,
  type SearchTabKey,
  type SearchTabVisibility,
} from "@/data/search-tabs";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "search-tabs.json");

export type SearchTabsConfig = {
  visibility: SearchTabVisibility;
  order: SearchTabKey[];
  updatedAt: string | null;
};

function isServerlessHosting(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-search-tabs.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function isSearchTabKey(value: unknown): value is SearchTabKey {
  return typeof value === "string" && SEARCH_TAB_KEYS.includes(value as SearchTabKey);
}

function normalizeVisibility(raw: unknown): SearchTabVisibility {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next = { ...defaultSearchTabVisibility };
  for (const key of SEARCH_TAB_KEYS) {
    const value = rec[key];
    if (value === false || value === 0 || value === "false" || value === "0") {
      next[key] = false;
    } else if (value === true || value === 1 || value === "true" || value === "1") {
      next[key] = true;
    }
  }
  return next;
}

function normalizeOrder(raw: unknown): SearchTabKey[] {
  if (!Array.isArray(raw)) return [...defaultSearchTabOrder];
  const seen = new Set<SearchTabKey>();
  const ordered: SearchTabKey[] = [];
  for (const item of raw) {
    if (isSearchTabKey(item) && !seen.has(item)) {
      seen.add(item);
      ordered.push(item);
    }
  }
  for (const key of SEARCH_TAB_KEYS) {
    if (!seen.has(key)) ordered.push(key);
  }
  return ordered;
}

export function defaultSearchTabsConfig(): SearchTabsConfig {
  return {
    visibility: { ...defaultSearchTabVisibility },
    order: [...defaultSearchTabOrder],
    updatedAt: null,
  };
}

function sanitize(raw: unknown): SearchTabsConfig {
  if (!raw || typeof raw !== "object") return defaultSearchTabsConfig();
  const rec = raw as Record<string, unknown>;
  return {
    visibility: normalizeVisibility(rec.visibility),
    order: normalizeOrder(rec.order),
    updatedAt: typeof rec.updatedAt === "string" && rec.updatedAt ? rec.updatedAt : null,
  };
}

export async function getSearchTabsConfig(): Promise<SearchTabsConfig> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    return sanitize(JSON.parse(raw));
  } catch {
    return defaultSearchTabsConfig();
  }
}

export async function saveSearchTabsConfig(input: {
  visibility?: SearchTabVisibility;
  order?: SearchTabKey[];
}): Promise<SearchTabsConfig> {
  const current = await getSearchTabsConfig();
  const next: SearchTabsConfig = {
    visibility: normalizeVisibility(input.visibility ?? current.visibility),
    order: normalizeOrder(input.order ?? current.order),
    updatedAt: new Date().toISOString(),
  };
  await ensureDir();
  await fs.writeFile(getStoreFile(), JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function resetSearchTabsConfig(): Promise<SearchTabsConfig> {
  const next: SearchTabsConfig = {
    ...defaultSearchTabsConfig(),
    updatedAt: new Date().toISOString(),
  };
  await ensureDir();
  await fs.writeFile(getStoreFile(), JSON.stringify(next, null, 2), "utf8");
  return next;
}
