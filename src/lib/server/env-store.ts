/**
 * Server-only secrets / env persistence.
 * Source of truth: `.data/server-env.json` (gitignored), also merged into `.env.local`.
 * Runtime: process.env first, then file overlay (applied into process.env on load/save).
 */

import { promises as fs } from "fs";
import path from "path";

const ENV_LOCAL_FILE = path.join(process.cwd(), ".env.local");

/** Vercel/serverless: filesystem is read-only except `/tmp`. */
function isServerlessHosting(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-server-env.json");
  }
  return path.join(process.cwd(), ".data", "server-env.json");
}

/** Keys that may be written from the admin panel. */
export const MANAGED_ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_ADMIN_EMAILS",
  "NEXT_PUBLIC_ADMIN_USERNAME",
  "NEXT_PUBLIC_ADMIN_PASSWORD",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "ADMIN_SETUP_SECRET",
  "PB_ADMIN_ALLOW_IPS",
  "NEXT_PUBLIC_GSC_VERIFICATION",
  "NEXT_PUBLIC_GA_ID",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_LABEL",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
  "NEXT_PUBLIC_GSC_ENABLED",
  "NEXT_PUBLIC_GA_ENABLED",
  "NEXT_PUBLIC_GTM_ENABLED",
  "NEXT_PUBLIC_GOOGLE_ADS_ENABLED",
  "NEXT_PUBLIC_META_PIXEL_ENABLED",
  "NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED",
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_FLIGHTS_PROVIDER",
  "NEXT_PUBLIC_TRAVELPAYOUTS_MARKER",
  "NEXT_PUBLIC_TRAVELPAYOUTS_TRS",
  "NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN",
  "NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN",
  "NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT",
  "NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT",
  "NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE",
  "NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY",
  "NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR",
  "NEXT_PUBLIC_TRANSFERS_PROVIDER",
  "NEXT_PUBLIC_TRANSFERS_TP_MARKER",
  "NEXT_PUBLIC_TRANSFERS_TP_TRS",
  "NEXT_PUBLIC_TRANSFERS_TP_LOCALE",
  "NEXT_PUBLIC_TRANSFERS_TP_CURRENCY",
  "NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID",
  "NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID",
  "NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME",
  "NEXT_PUBLIC_TRANSFERS_TP_HEADER",
  "NEXT_PUBLIC_TRANSFERS_TP_FLAGS",
  "NEXT_PUBLIC_TRANSFERS_TP_SCRIPT",
  "NEXT_PUBLIC_CARS_PROVIDER",
  "NEXT_PUBLIC_CARS_TP_MARKER",
  "NEXT_PUBLIC_CARS_TP_TRS",
  "NEXT_PUBLIC_CARS_TP_LOCALE",
  "NEXT_PUBLIC_CARS_TP_COUNTRY",
  "NEXT_PUBLIC_CARS_TP_CITY",
  "NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID",
  "NEXT_PUBLIC_CARS_TP_PROMO_ID",
  "NEXT_PUBLIC_CARS_TP_SCRIPT",
  "NEXT_PUBLIC_HOTELS_PROVIDER",
  "RAPIDAPI_KEY",
  "RAPIDAPI_TRAVEL_ADVISOR_HOST",
  "RAPIDAPI_ROOMS_HOST",
  "RAPIDAPI_ROOMS_KEY",
  "BOOKING_COM_HOST",
  "BOOKING_COM_RAPIDAPI_KEY",
  "NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER",
  "HOTEL_ENGINE_URL",
  "HOTEL_ENGINE_TOKEN",
  "SKY_SCRAPPER_RAPIDAPI_KEY",
  "SKY_SCRAPPER_HOST",
  "POCKETBASE_URL",
  "POCKETBASE_ADMIN_EMAIL",
  "POCKETBASE_ADMIN_PASSWORD",
  "POCKETBASE_GOOGLE_CLIENT_ID",
  "POCKETBASE_GOOGLE_CLIENT_SECRET",
  "POCKETBASE_GOOGLE_ENABLED",
  "PAYMENTS_IYZICO_ENABLED",
  "PAYMENTS_WHATSAPP_BANK_LINK_ENABLED",
  "IYZICO_MODE",
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  "IYZICO_BASE_URL",
  "PAYMENTS_WHATSAPP_NUMBER",
  "POCKETBASE_SMTP_PASSWORD",
  "EMAIL_CRON_SECRET",
  "AUTOMATION_CRON_SECRET",
  "PEXELS_API_KEY",
  "UNSPLASH_ACCESS_KEY",
  "WHATSAPP_CLOUD_PHONE_NUMBER_ID",
  "WHATSAPP_CLOUD_ACCESS_TOKEN",
  "WHATSAPP_CLOUD_WABA_ID",
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_GRAPH_VERSION",
  "WHATSAPP_OTP_TEMPLATE",
  "WHATSAPP_TRANSACTIONAL_TEMPLATE",
  "WHATSAPP_MARKETING_TEMPLATE",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_DEFAULT_CHAT_ID",
  "COMMS_OTP_ENABLED",
  "META_APP_ID",
  "META_APP_SECRET",
  "META_GRAPH_VERSION",
  "GOOGLE_YOUTUBE_CLIENT_ID",
  "GOOGLE_YOUTUBE_CLIENT_SECRET",
  "TIKTOK_CLIENT_KEY",
  "TIKTOK_CLIENT_SECRET",
  "X_CLIENT_ID",
  "X_CLIENT_SECRET",
  "TWITTER_CLIENT_ID",
  "TWITTER_CLIENT_SECRET",
  "SOCIAL_OAUTH_STATE_SECRET",
  "DEPLOYMENT_ROLE",
  "LICENSE_KEY",
  "LICENSE_ORIGIN",
  "LICENSE_SIGNING_KEY",
  "GOOGLE_PLACES_API_KEY",
  "GOOGLE_MAPS_API_KEY",
  "ADMIN_DIGEST_EMAIL",
  "ADMIN_EMAIL",
] as const;

export type ManagedEnvKey = (typeof MANAGED_ENV_KEYS)[number];

export const SECRET_ENV_KEYS = new Set<string>([
  "ADMIN_SETUP_SECRET",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "NEXT_PUBLIC_ADMIN_PASSWORD",
  "GEMINI_API_KEY",
  "RAPIDAPI_KEY",
  "RAPIDAPI_ROOMS_KEY",
  "BOOKING_COM_RAPIDAPI_KEY",
  "HOTEL_ENGINE_TOKEN",
  "SKY_SCRAPPER_RAPIDAPI_KEY",
  "POCKETBASE_ADMIN_PASSWORD",
  "POCKETBASE_GOOGLE_CLIENT_SECRET",
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  "POCKETBASE_SMTP_PASSWORD",
  "EMAIL_CRON_SECRET",
  "AUTOMATION_CRON_SECRET",
  "PEXELS_API_KEY",
  "UNSPLASH_ACCESS_KEY",
  "WHATSAPP_CLOUD_ACCESS_TOKEN",
  "WHATSAPP_VERIFY_TOKEN",
  "TELEGRAM_BOT_TOKEN",
  "META_APP_SECRET",
  "GOOGLE_YOUTUBE_CLIENT_SECRET",
  "TIKTOK_CLIENT_SECRET",
  "X_CLIENT_SECRET",
  "TWITTER_CLIENT_SECRET",
  "SOCIAL_OAUTH_STATE_SECRET",
  "LICENSE_KEY",
  "LICENSE_SIGNING_KEY",
  "GOOGLE_PLACES_API_KEY",
  "GOOGLE_MAPS_API_KEY",
]);

type StoreFile = {
  values: Record<string, string>;
  updatedAt?: string;
};

let fileCache: Record<string, string> | null = null;
let loadPromise: Promise<Record<string, string>> | null = null;

async function ensureStoreDir() {
  const storeFile = getStoreFile();
  await fs.mkdir(path.dirname(storeFile), { recursive: true });
}

function applyOverlayToProcessEnv(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    const trimmed = String(value).trim();
    // Overlay fills gaps and refreshes managed keys so admin saves apply
    // without an OS-level process restart (same Node process).
    if (trimmed) {
      process.env[key] = trimmed;
    }
  }
}

async function readStoreFile(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    const values = parsed.values && typeof parsed.values === "object"
      ? parsed.values
      : {};
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (typeof v === "string" && v.trim()) cleaned[k] = v.trim();
    }
    return cleaned;
  } catch {
    return {};
  }
}

/** Load (or return cached) server-env overlay and apply to process.env. */
export async function loadServerEnvOverlay(): Promise<Record<string, string>> {
  if (fileCache) return fileCache;
  if (!loadPromise) {
    loadPromise = (async () => {
      const values = await readStoreFile();
      fileCache = values;
      applyOverlayToProcessEnv(values);
      return values;
    })().finally(() => {
      loadPromise = null;
    });
  }
  return loadPromise;
}

/** Invalidate cache after writes. */
export function invalidateServerEnvCache() {
  fileCache = null;
}

/**
 * Resolve a single key: load persisted overlay onto process.env, then read.
 * File values win for keys present in the store (admin saves apply without OS restart).
 * Hosting/OS env still applies for keys not in the store.
 */
export async function getServerEnv(key: string): Promise<string> {
  const overlay = await loadServerEnvOverlay();
  const fromFile = (overlay[key] || "").trim();
  if (fromFile) return fromFile;
  return (process.env[key] || "").trim();
}

/** All managed keys resolved (file overlay wins when set, else process.env). */
export async function getServerEnvMap(
  keys: readonly string[] = MANAGED_ENV_KEYS
): Promise<Record<string, string>> {
  const overlay = await loadServerEnvOverlay();
  const out: Record<string, string> = {};
  for (const key of keys) {
    const fromFile = (overlay[key] || "").trim();
    out[key] = fromFile || (process.env[key] || "").trim();
  }
  return out;
}

function escapeEnvValue(value: string): string {
  if (/[\s#"'$\\]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

/** Merge keys into `.env.local` without wiping unrelated entries. */
export async function mergeEnvLocalFile(
  updates: Record<string, string>
): Promise<void> {
  let content = "";
  try {
    content = await fs.readFile(ENV_LOCAL_FILE, "utf8");
  } catch {
    content = "";
  }

  const lines = content.length ? content.split(/\r?\n/) : [];
  const keys = new Set(Object.keys(updates));
  const out: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (m && keys.has(m[1])) {
      const key = m[1];
      if (!seen.has(key)) {
        const val = updates[key];
        if (val !== undefined && String(val).trim() !== "") {
          out.push(`${key}=${escapeEnvValue(String(val).trim())}`);
        }
        // empty string → drop the line (clear)
        seen.add(key);
      }
      continue;
    }
    out.push(line);
  }

  for (const key of keys) {
    if (seen.has(key)) continue;
    const val = updates[key];
    if (val !== undefined && String(val).trim() !== "") {
      out.push(`${key}=${escapeEnvValue(String(val).trim())}`);
    }
  }

  // Trim trailing empty lines then ensure trailing newline
  while (out.length > 0 && out[out.length - 1] === "") out.pop();
  await fs.writeFile(ENV_LOCAL_FILE, out.join("\n") + "\n", { mode: 0o600 });
}

/**
 * Persist updates to `.data/server-env.json` and merge into `.env.local`.
 * Empty string values remove the key from the store (and from .env.local).
 * Keys omitted from `updates` are left unchanged.
 */
export async function saveServerEnv(
  updates: Record<string, string>
): Promise<Record<string, string>> {
  await ensureStoreDir();
  const current = await readStoreFile();
  const next = { ...current };

  for (const [key, raw] of Object.entries(updates)) {
    if (!MANAGED_ENV_KEYS.includes(key as ManagedEnvKey)) continue;
    const value = String(raw ?? "").trim();
    if (!value) {
      delete next[key];
      delete process.env[key];
    } else {
      next[key] = value;
      process.env[key] = value;
    }
  }

  const payload: StoreFile = {
    values: next,
    updatedAt: new Date().toISOString(),
  };
  const storeFile = getStoreFile();
  await fs.writeFile(storeFile, JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
  fileCache = next;

  // `.env.local` is unavailable on Vercel (read-only project dir).
  if (!isServerlessHosting()) {
    const envLocalPatch: Record<string, string> = {};
    for (const key of Object.keys(updates)) {
      if (!MANAGED_ENV_KEYS.includes(key as ManagedEnvKey)) continue;
      envLocalPatch[key] = next[key] || "";
    }
    await mergeEnvLocalFile(envLocalPatch);
  }

  return next;
}

const INTERNAL_ENV_KEYS = [
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "ADMIN_SESSION_SECRET",
] as const;

export type InternalEnvKey = (typeof INTERNAL_ENV_KEYS)[number];

function isInternalEnvKey(key: string): key is InternalEnvKey {
  return (INTERNAL_ENV_KEYS as readonly string[]).includes(key);
}

/**
 * Persist server-only keys (VAPID, etc.) that must not appear in the admin env UI.
 */
export async function persistInternalEnv(
  updates: Partial<Record<InternalEnvKey, string>>
): Promise<Record<string, string>> {
  await ensureStoreDir();
  const current = await readStoreFile();
  const next = { ...current };
  const envLocalPatch: Record<string, string> = {};

  for (const [key, raw] of Object.entries(updates)) {
    if (!isInternalEnvKey(key)) continue;
    const value = String(raw ?? "").trim();
    if (!value) {
      delete next[key];
      delete process.env[key];
      envLocalPatch[key] = "";
    } else {
      next[key] = value;
      process.env[key] = value;
      envLocalPatch[key] = value;
    }
  }

  const payload: StoreFile = {
    values: next,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
  fileCache = next;

  if (!isServerlessHosting()) {
    await mergeEnvLocalFile(envLocalPatch);
  }

  return next;
}

export function maskSecret(value: string, visible = 4): string {
  const v = String(value || "").trim();
  if (!v) return "";
  if (v.length <= visible * 2) return "•".repeat(Math.min(v.length, 8));
  return `${v.slice(0, visible)}…${v.slice(-visible)}`;
}

export function isMaskedPlaceholder(value: string): boolean {
  const v = String(value || "").trim();
  if (!v) return true;
  if (v.includes("…") || v.includes("...") || v.includes("••••")) return true;
  if (/^•+$/.test(v)) return true;
  return /^[A-Za-z0-9_-]{1,8}[.…•]{1,3}[A-Za-z0-9_-]{1,8}$/.test(v);
}

/** Public tracking IDs only — safe for `/api/tracking-config`. */
export async function getPublicTrackingEnv(): Promise<Record<string, string>> {
  const keys = [
    "NEXT_PUBLIC_GSC_VERIFICATION",
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_GTM_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_ID",
    "NEXT_PUBLIC_GOOGLE_ADS_LABEL",
    "NEXT_PUBLIC_META_PIXEL_ID",
    "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
    "NEXT_PUBLIC_GSC_ENABLED",
    "NEXT_PUBLIC_GA_ENABLED",
    "NEXT_PUBLIC_GTM_ENABLED",
    "NEXT_PUBLIC_GOOGLE_ADS_ENABLED",
    "NEXT_PUBLIC_META_PIXEL_ENABLED",
    "NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED",
    "NEXT_PUBLIC_SITE_URL",
  ] as const;
  return getServerEnvMap(keys);
}

/** Public flights provider config — safe for `/api/flights-config`. */
export async function getPublicFlightsEnv(): Promise<Record<string, string>> {
  const keys = [
    "NEXT_PUBLIC_FLIGHTS_PROVIDER",
    "NEXT_PUBLIC_TRAVELPAYOUTS_MARKER",
    "NEXT_PUBLIC_TRAVELPAYOUTS_TRS",
    "NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN",
    "NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN",
    "NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT",
    "NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT",
    "NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE",
    "NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY",
    "NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR",
  ] as const;
  return getServerEnvMap(keys);
}

/** Public transfers provider config — safe for `/api/transfers-config`. */
export async function getPublicTransfersEnv(): Promise<Record<string, string>> {
  const keys = [
    "NEXT_PUBLIC_TRANSFERS_PROVIDER",
    "NEXT_PUBLIC_TRANSFERS_TP_MARKER",
    "NEXT_PUBLIC_TRANSFERS_TP_TRS",
    "NEXT_PUBLIC_TRANSFERS_TP_LOCALE",
    "NEXT_PUBLIC_TRANSFERS_TP_CURRENCY",
    "NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID",
    "NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID",
    "NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME",
    "NEXT_PUBLIC_TRANSFERS_TP_HEADER",
    "NEXT_PUBLIC_TRANSFERS_TP_FLAGS",
    "NEXT_PUBLIC_TRANSFERS_TP_SCRIPT",
  ] as const;
  return getServerEnvMap(keys);
}

/** Public cars provider config — safe for `/api/cars-config`. */
export async function getPublicCarsEnv(): Promise<Record<string, string>> {
  const keys = [
    "NEXT_PUBLIC_CARS_PROVIDER",
    "NEXT_PUBLIC_CARS_TP_MARKER",
    "NEXT_PUBLIC_CARS_TP_TRS",
    "NEXT_PUBLIC_CARS_TP_LOCALE",
    "NEXT_PUBLIC_CARS_TP_COUNTRY",
    "NEXT_PUBLIC_CARS_TP_CITY",
    "NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID",
    "NEXT_PUBLIC_CARS_TP_PROMO_ID",
    "NEXT_PUBLIC_CARS_TP_SCRIPT",
  ] as const;
  return getServerEnvMap(keys);
}

/** Public hotels provider — RapidAPI key never leaves the server. */
export async function getPublicHotelsEnv(): Promise<Record<string, string>> {
  const keys = ["NEXT_PUBLIC_HOTELS_PROVIDER"] as const;
  return getServerEnvMap(keys);
}

export async function getPublicClientConfig(): Promise<{
  siteUrl: string;
  googleAuthEnabled: boolean;
  deploymentRole: "origin" | "client";
}> {
  const map = await getServerEnvMap([
    "NEXT_PUBLIC_SITE_URL",
    "POCKETBASE_GOOGLE_ENABLED",
    "POCKETBASE_GOOGLE_CLIENT_ID",
    "POCKETBASE_GOOGLE_CLIENT_SECRET",
    "DEPLOYMENT_ROLE",
  ]);
  const enabled = map.POCKETBASE_GOOGLE_ENABLED.trim().toLowerCase();
  const googleAuthEnabled =
    (enabled === "true" || enabled === "1" || enabled === "yes") &&
    Boolean(map.POCKETBASE_GOOGLE_CLIENT_ID.trim()) &&
    Boolean(map.POCKETBASE_GOOGLE_CLIENT_SECRET.trim());
  const deploymentRole =
    map.DEPLOYMENT_ROLE.trim().toLowerCase() === "client" ||
    process.env.DEPLOYMENT_ROLE === "client"
      ? "client"
      : "origin";
  return {
    siteUrl: map.NEXT_PUBLIC_SITE_URL || "",
    googleAuthEnabled,
    deploymentRole,
  };
}
