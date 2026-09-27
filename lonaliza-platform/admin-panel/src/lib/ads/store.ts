import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_GEO_CODES } from "./geos";
import type {
  AdsCredentials,
  AdsReport,
  AdsSettings,
  StoredCampaign,
} from "./types";

function adsDataDir(): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null) {
    return path.join("/tmp", "lonaliza-ads");
  }
  return path.join(process.cwd(), ".data", "ads");
}

export function adsYamlCandidates(): string[] {
  const custom = (process.env.GOOGLE_ADS_YAML_PATH || "").trim();
  return [
    custom,
    path.join(adsDataDir(), "google-ads.yaml"),
    path.join(process.cwd(), "google-ads.yaml"),
  ].filter(Boolean);
}

function settingsFile() {
  return path.join(adsDataDir(), "settings.json");
}
function credentialsFile() {
  return path.join(adsDataDir(), "credentials.json");
}
function campaignsFile() {
  return path.join(adsDataDir(), "campaigns.json");
}
function reportsFile() {
  return path.join(adsDataDir(), "reports.json");
}

export const EMPTY_CREDENTIALS: AdsCredentials = {
  googleDeveloperToken: "",
  googleClientId: "",
  googleClientSecret: "",
  googleRefreshToken: "",
  googleCustomerId: "",
  googleLoginCustomerId: "",
  metaAccessToken: "",
  metaAdAccountId: "",
  metaPageId: "",
  metaAppId: "",
  metaAppSecret: "",
  metaPixelId: "",
};

export const DEFAULT_ADS_SETTINGS: AdsSettings = {
  defaultGeoCodes: [...DEFAULT_GEO_CODES],
  telegramChatId: "",
  currency: "USD",
  alert70SentOn: "",
  alert100SentOn: "",
};

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = JSON.parse(await fs.readFile(file, "utf8")) as T;
    return raw && typeof raw === "object" ? raw : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), { mode: 0o600 });
}

export async function loadAdsSettings(): Promise<AdsSettings> {
  const raw = await readJson<Partial<AdsSettings>>(settingsFile(), {});
  const geos = Array.isArray(raw.defaultGeoCodes)
    ? raw.defaultGeoCodes.map(String).filter(Boolean)
    : DEFAULT_ADS_SETTINGS.defaultGeoCodes;
  return {
    defaultGeoCodes: geos.length ? geos : [...DEFAULT_GEO_CODES],
    telegramChatId: String(raw.telegramChatId || "").trim(),
    currency: String(raw.currency || "USD").trim() || "USD",
    alert70SentOn: String(raw.alert70SentOn || "").trim(),
    alert100SentOn: String(raw.alert100SentOn || "").trim(),
  };
}

export async function saveAdsSettings(patch: Partial<AdsSettings>): Promise<AdsSettings> {
  const current = await loadAdsSettings();
  const next: AdsSettings = {
    ...current,
    ...patch,
    defaultGeoCodes: patch.defaultGeoCodes?.length
      ? patch.defaultGeoCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)
      : current.defaultGeoCodes,
    telegramChatId:
      patch.telegramChatId === undefined
        ? current.telegramChatId
        : String(patch.telegramChatId).trim(),
    currency:
      patch.currency === undefined
        ? current.currency
        : String(patch.currency).trim() || current.currency,
  };
  await writeJson(settingsFile(), next);
  return next;
}

export async function loadAdsCredentials(): Promise<AdsCredentials> {
  const raw = await readJson<Partial<AdsCredentials>>(credentialsFile(), {});
  return {
    googleDeveloperToken: String(raw.googleDeveloperToken || "").trim(),
    googleClientId: String(raw.googleClientId || "").trim(),
    googleClientSecret: String(raw.googleClientSecret || "").trim(),
    googleRefreshToken: String(raw.googleRefreshToken || "").trim(),
    googleCustomerId: String(raw.googleCustomerId || "").replace(/-/g, "").trim(),
    googleLoginCustomerId: String(raw.googleLoginCustomerId || "").replace(/-/g, "").trim(),
    metaAccessToken: String(raw.metaAccessToken || "").trim(),
    metaAdAccountId: String(raw.metaAdAccountId || "").replace(/^act_/i, "").trim(),
    metaPageId: String(raw.metaPageId || "").trim(),
    metaAppId: String(raw.metaAppId || "").trim(),
    metaAppSecret: String(raw.metaAppSecret || "").trim(),
    metaPixelId: String(raw.metaPixelId || "").trim(),
  };
}

export async function saveAdsCredentials(
  patch: Partial<AdsCredentials>
): Promise<AdsCredentials> {
  const current = await loadAdsCredentials();
  const next: AdsCredentials = { ...current };
  for (const key of Object.keys(EMPTY_CREDENTIALS) as (keyof AdsCredentials)[]) {
    if (patch[key] === undefined) continue;
    const value = String(patch[key] || "").trim();
    if (looksMasked(value)) continue;
    next[key] =
      key === "googleCustomerId" || key === "googleLoginCustomerId" || key === "metaAdAccountId"
        ? value.replace(/^act_/i, "").replace(/-/g, "")
        : value;
  }
  await writeJson(credentialsFile(), next);
  return next;
}

export function looksMasked(value: string): boolean {
  const v = String(value || "").trim();
  return !v || v.includes("…") || v.includes("...") || /^•+$/.test(v);
}

export function maskSecret(value: string): string {
  const v = String(value || "").trim();
  if (!v) return "";
  if (v.length <= 8) return "•".repeat(Math.min(v.length, 8));
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}

export function publicCredentials(creds: AdsCredentials) {
  return {
    googleDeveloperToken: maskSecret(creds.googleDeveloperToken),
    googleClientId: creds.googleClientId,
    googleClientSecret: maskSecret(creds.googleClientSecret),
    googleRefreshToken: maskSecret(creds.googleRefreshToken),
    googleCustomerId: creds.googleCustomerId,
    googleLoginCustomerId: creds.googleLoginCustomerId,
    metaAccessToken: maskSecret(creds.metaAccessToken),
    metaAdAccountId: creds.metaAdAccountId,
    metaPageId: creds.metaPageId,
    metaAppId: creds.metaAppId,
    metaAppSecret: maskSecret(creds.metaAppSecret),
    metaPixelId: creds.metaPixelId,
  };
}

export async function listCampaigns(): Promise<StoredCampaign[]> {
  const rows = await readJson<StoredCampaign[]>(campaignsFile(), []);
  return Array.isArray(rows) ? rows : [];
}

export async function upsertCampaign(row: StoredCampaign): Promise<StoredCampaign> {
  const rows = await listCampaigns();
  const idx = rows.findIndex((c) => c.id === row.id);
  if (idx >= 0) rows[idx] = row;
  else rows.unshift(row);
  await writeJson(campaignsFile(), rows.slice(0, 200));
  return row;
}

export async function patchCampaign(
  id: string,
  patch: Partial<StoredCampaign>
): Promise<StoredCampaign | null> {
  const rows = await listCampaigns();
  const idx = rows.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const next = { ...rows[idx], ...patch, id: rows[idx].id };
  rows[idx] = next;
  await writeJson(campaignsFile(), rows);
  return next;
}

export async function listReports(): Promise<AdsReport[]> {
  const rows = await readJson<AdsReport[]>(reportsFile(), []);
  return Array.isArray(rows) ? rows : [];
}

export async function saveReport(report: AdsReport): Promise<AdsReport> {
  const rows = await listReports();
  rows.unshift(report);
  await writeJson(reportsFile(), rows.slice(0, 60));
  return report;
}

export async function latestReport(): Promise<AdsReport | null> {
  const rows = await listReports();
  return rows[0] ?? null;
}
