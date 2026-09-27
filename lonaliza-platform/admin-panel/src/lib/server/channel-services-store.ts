import { promises as fs } from "fs";
import path from "path";
import {
  defaultSearchTabVisibility,
  SEARCH_TAB_KEYS,
  type SearchTabKey,
  type SearchTabVisibility,
} from "@/data/search-tabs";
import {
  defaultNavOrder,
  defaultNavVisibility,
  NAV_PLACEMENTS,
  NAV_SERVICE_KEYS,
  type NavServiceKey,
  type NavVisibility,
} from "@/data/nav-visibility";
import { getSearchTabsConfig } from "@/lib/server/search-tabs-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "channel-services.json");

export type ChannelServicesConfig = {
  websiteEnabled: SearchTabVisibility;
  appEnabled: SearchTabVisibility;
  order: SearchTabKey[];
  navVisibility: NavVisibility;
  navOrder: NavServiceKey[];
  updatedAt: string | null;
};

function getStoreFile(): string {
  if (process.env.CHANNEL_SERVICES_STORE_FILE) {
    return process.env.CHANNEL_SERVICES_STORE_FILE;
  }
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null) {
    return path.join("/tmp", "alrayyan-channel-services.json");
  }
  return STORE_FILE;
}

function normalizeFlags(raw: unknown, fallback: SearchTabVisibility): SearchTabVisibility {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next = { ...fallback };
  for (const key of SEARCH_TAB_KEYS) {
    const value = rec[key];
    if (value === false || value === 0 || value === "false" || value === "0") next[key] = false;
    else if (value === true || value === 1 || value === "true" || value === "1") next[key] = true;
  }
  return next;
}

export function defaultChannelFlags(): SearchTabVisibility {
  return { ...defaultSearchTabVisibility };
}

function normalizeNav(raw: unknown, fallback: NavVisibility): NavVisibility {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next = { ...fallback };
  for (const key of NAV_SERVICE_KEYS) {
    const value = rec[key];
    if (typeof value === "string" && NAV_PLACEMENTS.includes(value as NavVisibility[NavServiceKey])) {
      next[key] = value as NavVisibility[NavServiceKey];
    }
  }
  return next;
}

function normalizeNavOrder(raw: unknown): NavServiceKey[] {
  if (!Array.isArray(raw)) return [...defaultNavOrder];
  const seen = new Set<NavServiceKey>();
  const ordered: NavServiceKey[] = [];
  for (const item of raw) {
    if (typeof item === "string" && NAV_SERVICE_KEYS.includes(item as NavServiceKey) && !seen.has(item as NavServiceKey)) {
      seen.add(item as NavServiceKey);
      ordered.push(item as NavServiceKey);
    }
  }
  for (const key of NAV_SERVICE_KEYS) {
    if (!seen.has(key)) ordered.push(key);
  }
  return ordered;
}

export function appEnabledKeys(config: ChannelServicesConfig): SearchTabKey[] {
  return config.order.filter((key) => config.appEnabled[key]);
}

export async function defaultChannelServices(): Promise<ChannelServicesConfig> {
  const tabs = await getSearchTabsConfig();
  return {
    websiteEnabled: { ...tabs.visibility },
    appEnabled: { ...tabs.visibility },
    order: [...tabs.order],
    navVisibility: { ...defaultNavVisibility },
    navOrder: [...defaultNavOrder],
    updatedAt: null,
  };
}

async function readRaw(): Promise<ChannelServicesConfig | null> {
  try {
    const raw = JSON.parse(await fs.readFile(getStoreFile(), "utf8"));
    if (!raw || typeof raw !== "object") return null;
    const rec = raw as Record<string, unknown>;
    const fallback = await defaultChannelServices();
    return {
      websiteEnabled: normalizeFlags(rec.websiteEnabled, fallback.websiteEnabled),
      appEnabled: normalizeFlags(rec.appEnabled, fallback.appEnabled),
      order: fallback.order,
      navVisibility: normalizeNav(rec.navVisibility, fallback.navVisibility),
      navOrder: normalizeNavOrder(rec.navOrder),
      updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : null,
    };
  } catch {
    return null;
  }
}

export async function getChannelServices(): Promise<ChannelServicesConfig> {
  return (await readRaw()) ?? (await defaultChannelServices());
}

export async function saveChannelServices(input: {
  websiteEnabled?: Partial<SearchTabVisibility>;
  appEnabled?: Partial<SearchTabVisibility>;
  order?: SearchTabKey[];
  navVisibility?: Partial<NavVisibility>;
  navOrder?: NavServiceKey[];
}): Promise<ChannelServicesConfig> {
  const current = await getChannelServices();
  const next: ChannelServicesConfig = {
    websiteEnabled: normalizeFlags(input.websiteEnabled ?? current.websiteEnabled, current.websiteEnabled),
    appEnabled: normalizeFlags(input.appEnabled ?? current.appEnabled, current.appEnabled),
    order: input.order?.length ? input.order : current.order,
    navVisibility: normalizeNav(input.navVisibility ?? current.navVisibility, current.navVisibility),
    navOrder: input.navOrder?.length ? normalizeNavOrder(input.navOrder) : current.navOrder,
    updatedAt: new Date().toISOString(),
  };
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
  await fs.writeFile(getStoreFile(), JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function resetAppChannel(): Promise<ChannelServicesConfig> {
  const current = await getChannelServices();
  return saveChannelServices({
    websiteEnabled: current.websiteEnabled,
    appEnabled: { ...current.websiteEnabled },
    order: current.order,
  });
}
