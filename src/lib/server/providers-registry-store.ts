/**
 * Coming-soon provider credentials — `.data/providers/registry.json` (mode 0600).
 * Live Air Scraper / Travelpayouts / hotel-engine stay in their existing stores.
 * Secrets are never logged.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  PROVIDER_IDS,
  type CatalogProviderId,
  type ProviderRuntimeState,
  type ProvidersRegistryFile,
} from "@/lib/providers/types";
import { getCatalogProvider } from "@/lib/providers/catalog";

const DATA_DIR = path.join(process.cwd(), ".data", "providers");
const STORE_FILE = path.join(DATA_DIR, "registry.json");

function emptyState(): ProviderRuntimeState {
  return { enabled: false, fields: {} };
}

function sanitizeState(
  id: CatalogProviderId,
  raw: unknown
): ProviderRuntimeState {
  const def = getCatalogProvider(id);
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const fieldsIn = rec.fields && typeof rec.fields === "object" ? rec.fields : {};
  const fields: Record<string, string> = {};
  for (const field of def.fields) {
    const value = (fieldsIn as Record<string, unknown>)[field.key];
    if (typeof value === "string" && value.trim()) {
      fields[field.key] = value;
    }
  }
  return {
    enabled: def.integration === "coming_soon" ? rec.enabled === true : Boolean(rec.enabled),
    fields,
  };
}

function emptyRegistry(): ProvidersRegistryFile {
  const providers: ProvidersRegistryFile["providers"] = {};
  for (const id of PROVIDER_IDS) {
    const def = getCatalogProvider(id);
    if (def.integration === "coming_soon") {
      providers[id] = emptyState();
    }
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
        const def = getCatalogProvider(id);
        if (def.integration !== "coming_soon") continue;
        next.providers[id] = sanitizeState(id, parsed.providers[id]);
      }
    }
    next.updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : next.updatedAt;
    return next;
  } catch {
    return emptyRegistry();
  }
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

export async function saveProviderRuntime(
  id: CatalogProviderId,
  patch: { enabled?: boolean; fields?: Record<string, string> }
): Promise<ProviderRuntimeState> {
  const def = getCatalogProvider(id);
  if (def.integration !== "coming_soon") {
    throw new Error("Live providers are stored in their existing settings files.");
  }
  const registry = await getProvidersRegistry();
  const current = registry.providers[id] || emptyState();
  const nextFields = { ...current.fields };
  if (patch.fields) {
    for (const field of def.fields) {
      if (!(field.key in patch.fields)) continue;
      const raw = String(patch.fields[field.key] ?? "");
      if (!raw.trim()) {
        delete nextFields[field.key];
        continue;
      }
      nextFields[field.key] = raw;
    }
  }
  const next: ProviderRuntimeState = {
    enabled: typeof patch.enabled === "boolean" ? patch.enabled : current.enabled,
    fields: nextFields,
  };
  registry.providers[id] = next;
  registry.updatedAt = new Date().toISOString();
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(registry, null, 2), { mode: 0o600 });
  cached = { at: Date.now(), value: registry };
  return next;
}

export function providerHasRequiredFields(
  id: CatalogProviderId,
  fields: Record<string, string>
): boolean {
  const def = getCatalogProvider(id);
  return def.fields.filter((item) => item.required).every((item) => Boolean(fields[item.key]?.trim()));
}
