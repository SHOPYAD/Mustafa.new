/**
 * Theme tokens + layout hints for non-home public pages.
 * Persisted in `.data/page-themes.json`.
 */

import { promises as fs } from "fs";
import path from "path";
import type { PageLayoutHints, PageThemeTokens } from "@/types/custom-page";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "page-themes.json");

export type PageThemeRecord = {
  pageId: string;
  tokens: PageThemeTokens;
  layoutHints: PageLayoutHints;
  updatedAt: string;
};

type StoreFile = {
  themes: Record<string, PageThemeRecord>;
  updatedAt?: string;
};

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-page-themes.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

async function readStore(): Promise<Record<string, PageThemeRecord>> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    return parsed.themes && typeof parsed.themes === "object" ? parsed.themes : {};
  } catch {
    return {};
  }
}

async function writeStore(themes: Record<string, PageThemeRecord>): Promise<void> {
  await ensureDir();
  const payload: StoreFile = {
    themes,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
}

function cleanTokens(input?: PageThemeTokens): PageThemeTokens {
  const next: PageThemeTokens = {};
  if (input?.navy) next.navy = String(input.navy).trim();
  if (input?.emerald) next.emerald = String(input.emerald).trim();
  if (input?.background) next.background = String(input.background).trim();
  if (input?.text) next.text = String(input.text).trim();
  if (input?.accent) next.accent = String(input.accent).trim();
  return next;
}

function cleanHints(input?: PageLayoutHints): PageLayoutHints {
  const next: PageLayoutHints = {};
  if (input?.heroAlign === "start" || input?.heroAlign === "center") {
    next.heroAlign = input.heroAlign;
  }
  if (
    input?.maxWidth === "narrow" ||
    input?.maxWidth === "default" ||
    input?.maxWidth === "wide"
  ) {
    next.maxWidth = input.maxWidth;
  }
  if (typeof input?.showHero === "boolean") next.showHero = input.showHero;
  if (typeof input?.compactHeader === "boolean") next.compactHeader = input.compactHeader;
  return next;
}

export async function getPageTheme(pageId: string): Promise<PageThemeRecord | null> {
  const themes = await readStore();
  return themes[pageId] || null;
}

export async function upsertPageTheme(
  pageId: string,
  patch: { tokens?: PageThemeTokens; layoutHints?: PageLayoutHints }
): Promise<PageThemeRecord> {
  const themes = await readStore();
  const prev = themes[pageId];
  const next: PageThemeRecord = {
    pageId,
    tokens: { ...(prev?.tokens || {}), ...cleanTokens(patch.tokens) },
    layoutHints: { ...(prev?.layoutHints || {}), ...cleanHints(patch.layoutHints) },
    updatedAt: new Date().toISOString(),
  };
  themes[pageId] = next;
  await writeStore(themes);
  return next;
}
