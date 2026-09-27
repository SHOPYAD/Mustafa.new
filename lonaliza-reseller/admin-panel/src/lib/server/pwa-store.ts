/**
 * PWA install settings — `.data/pwa.json`.
 * Same file-store pattern as branding / search-tabs.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_PWA_SETTINGS,
  PWA_DEFAULT_BACKGROUND_COLOR,
  PWA_DEFAULT_THEME_COLOR,
  PWA_VERSION,
  type PwaPatch,
  type PwaSettings,
} from "@/data/pwa";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "pwa.json");

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-pwa.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function sanitizeColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return isHexColor(trimmed) ? trimmed : fallback;
}

function sanitizeUrl(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^javascript:/i.test(trimmed)) return fallback;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return fallback;
}

export function normalizePwaSettings(raw: Partial<PwaSettings> | null): PwaSettings {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    version: PWA_VERSION,
    updatedAt:
      typeof source.updatedAt === "string" && source.updatedAt
        ? source.updatedAt
        : null,
    enabledPublic: asBool(source.enabledPublic, DEFAULT_PWA_SETTINGS.enabledPublic),
    enabledAdmin: asBool(source.enabledAdmin, DEFAULT_PWA_SETTINGS.enabledAdmin),
    showBanner: asBool(source.showBanner, DEFAULT_PWA_SETTINGS.showBanner),
    nameAr: asString(source.nameAr, DEFAULT_PWA_SETTINGS.nameAr).slice(0, 80),
    nameEn: asString(source.nameEn, DEFAULT_PWA_SETTINGS.nameEn).slice(0, 80),
    nameTr: asString(source.nameTr, DEFAULT_PWA_SETTINGS.nameTr).slice(0, 80),
    shortName: asString(source.shortName, DEFAULT_PWA_SETTINGS.shortName).slice(
      0,
      24
    ),
    themeColor: sanitizeColor(source.themeColor, PWA_DEFAULT_THEME_COLOR),
    backgroundColor: sanitizeColor(
      source.backgroundColor,
      PWA_DEFAULT_BACKGROUND_COLOR
    ),
    icon192: sanitizeUrl(source.icon192),
    icon512: sanitizeUrl(source.icon512),
    appleTouchIcon: sanitizeUrl(source.appleTouchIcon),
  };
}

function mergePatch(current: PwaSettings, patch: PwaPatch): PwaSettings {
  return normalizePwaSettings({ ...current, ...patch });
}

async function readStore(): Promise<PwaSettings | null> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<PwaSettings>;
    if (!parsed || typeof parsed !== "object") return null;
    return normalizePwaSettings(parsed);
  } catch {
    return null;
  }
}

async function writeStore(content: PwaSettings): Promise<void> {
  await ensureDir();
  const payload: PwaSettings = {
    ...content,
    version: PWA_VERSION,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
}

export async function getPwaSettings(): Promise<PwaSettings> {
  const stored = await readStore();
  return stored || normalizePwaSettings(DEFAULT_PWA_SETTINGS);
}

export async function savePwaSettings(patch: PwaPatch): Promise<PwaSettings> {
  const current = await getPwaSettings();
  const next = mergePatch(current, patch);
  await writeStore(next);
  return { ...next, updatedAt: new Date().toISOString() };
}

export async function resetPwaSettings(): Promise<PwaSettings> {
  const next = normalizePwaSettings(DEFAULT_PWA_SETTINGS);
  await writeStore(next);
  return { ...next, updatedAt: new Date().toISOString() };
}
