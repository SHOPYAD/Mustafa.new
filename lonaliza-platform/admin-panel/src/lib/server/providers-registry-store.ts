/**
 * Provider registry — `.data/providers/registry.json` (mode 0600).
 * Persists mode + customLogo for every id.
 * Coming-soon: hard-locked for enable/fields; logo-only updates allowed.
 * Live credentials stay in existing env / runtime stores.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  COMING_SOON_LOCKED_AR,
  PROVIDER_IDS,
  isProviderMode,
  type CatalogProviderId,
  type ProviderMode,
  type ProviderRuntimeState,
  type ProvidersRegistryFile,
} from "@/lib/providers/types";
import { getCatalogProvider } from "@/lib/providers/catalog";

const DATA_DIR = path.join(process.cwd(), ".data", "providers");
const STORE_FILE = path.join(DATA_DIR, "registry.json");

function emptyState(): ProviderRuntimeState {
  return { enabled: false, mode: "sandbox", customLogo: null, fields: {} };
}

function sanitizeCustomLogo(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  const pathOnly = value.split("?")[0].split("#")[0];
  // Catalog defaults + legacy public paths
  if (pathOnly.startsWith("/providers/")) return value;
  // Runtime uploads (Next production does not serve post-build public/ files)
  if (pathOnly.startsWith("/uploads/providers/")) return value;
  if (pathOnly.startsWith("/api/branding/file")) return value;
  if (/^https?:\/\//i.test(pathOnly)) return value;
  return null;
}

function sanitizeState(id: CatalogProviderId, raw: unknown): ProviderRuntimeState {
  const def = getCatalogProvider(id);
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const mode: ProviderMode = isProviderMode(rec.mode) ? rec.mode : "sandbox";
  const customLogo = sanitizeCustomLogo(rec.customLogo);

  if (def.integration === "coming_soon") {
    return { enabled: false, mode, customLogo, fields: {} };
  }

  const fields = rec.fields && typeof rec.fields === "object" ? (rec.fields as Record<string, string>) : {};
  const enabled = Boolean(rec.enabled);
  return { enabled, mode, customLogo, fields };
}

function emptyRegistry(): ProvidersRegistryFile {
  const providers: ProvidersRegistryFile["providers"] = {};
  for (const id of PROVIDER_IDS) {
    providers[id] = emptyState();
  }
  return { updatedAt: new Date().toISOString(), providers };
}

let cached: { at: number; value: ProvidersRegistryFile } | null = null;

async function readFile(): Promise<ProvidersRegistryFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as ProvidersRegistryFile;
    const next = emptyRegistry();
    if (parsed?.providers && typeof parsed.providers === "object") {
      for (const id of PROVIDER_IDS) {
        const stored = parsed.providers[id];
        if (!stored) continue;
        next.providers[id] = sanitizeState(id, stored);
      }
    }
    next.updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : next.updatedAt;
    return next;
  } catch {
    return emptyRegistry();
  }
}

async function writeRegistry(registry: ProvidersRegistryFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(registry, null, 2), { mode: 0o600 });
  cached = { at: Date.now(), value: registry };
}

export async function getProvidersRegistry(): Promise<ProvidersRegistryFile> {
  if (cached && Date.now() - cached.at < 1500) return cached.value;
  const value = await readFile();
  cached = { at: Date.now(), value };
  return value;
}

export async function getProviderRuntime(id: CatalogProviderId): Promise<ProviderRuntimeState> {
  const registry = await getProvidersRegistry();
  return registry.providers[id] || emptyState();
}

export async function getProviderMode(id: CatalogProviderId): Promise<ProviderMode> {
  const runtime = await getProviderRuntime(id);
  return runtime.mode;
}

export async function saveProviderMode(
  id: CatalogProviderId,
  mode: ProviderMode
): Promise<ProviderMode> {
  const def = getCatalogProvider(id);
  if (def.integration === "coming_soon") {
    throw Object.assign(new Error(COMING_SOON_LOCKED_AR), { status: 403 });
  }
  const registry = await getProvidersRegistry();
  const current = registry.providers[id] || emptyState();
  registry.providers[id] = {
    ...current,
    enabled: false,
    mode,
  };
  registry.updatedAt = new Date().toISOString();
  await writeRegistry(registry);
  return mode;
}

/** Logo-only patch — allowed for live and coming-soon. */
export async function saveProviderLogo(
  id: CatalogProviderId,
  customLogo: string | null
): Promise<ProviderRuntimeState> {
  const logo = customLogo === null ? null : sanitizeCustomLogo(customLogo);
  if (customLogo !== null && logo === null) {
    throw Object.assign(new Error("رابط الشعار غير صالح"), { status: 400 });
  }
  const registry = await getProvidersRegistry();
  const current = registry.providers[id] || emptyState();
  const def = getCatalogProvider(id);
  const next: ProviderRuntimeState = {
    ...current,
    enabled: def.integration === "coming_soon" ? false : current.enabled,
    customLogo: logo,
  };
  registry.providers[id] = next;
  registry.updatedAt = new Date().toISOString();
  await writeRegistry(registry);
  return next;
}

export async function saveProviderRuntime(
  id: CatalogProviderId,
  patch: {
    enabled?: boolean;
    fields?: Record<string, string>;
    mode?: ProviderMode;
    customLogo?: string | null;
  }
): Promise<ProviderRuntimeState> {
  const def = getCatalogProvider(id);
  const logoOnly =
    patch.customLogo !== undefined &&
    patch.enabled === undefined &&
    patch.fields === undefined &&
    patch.mode === undefined;

  if (logoOnly) {
    return saveProviderLogo(id, patch.customLogo ?? null);
  }

  if (def.integration === "coming_soon") {
    throw Object.assign(new Error(COMING_SOON_LOCKED_AR), { status: 403 });
  }

  const registry = await getProvidersRegistry();
  const current = registry.providers[id] || emptyState();
  const next: ProviderRuntimeState = {
    ...current,
    enabled: typeof patch.enabled === "boolean" ? patch.enabled : current.enabled,
    mode: patch.mode && isProviderMode(patch.mode) ? patch.mode : current.mode,
    customLogo: patch.customLogo !== undefined ? sanitizeCustomLogo(patch.customLogo) : current.customLogo,
    fields: patch.fields ? { ...current.fields, ...patch.fields } : current.fields,
  };
  registry.providers[id] = next;
  registry.updatedAt = new Date().toISOString();
  await writeRegistry(registry);
  return next;
}

export function providerHasRequiredFields(
  id: CatalogProviderId,
  fields: Record<string, string>
): boolean {
  const def = getCatalogProvider(id);
  return def.fields.filter((item) => item.required).every((item) => Boolean(fields[item.key]?.trim()));
}
