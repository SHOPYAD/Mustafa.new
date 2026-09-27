/**
 * Site-wide visual theme — persisted in `.data/brand-theme.json`.
 * Single source of truth for appearance tokens (editor + public site).
 */

import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_BRAND_COLORS } from "@/data/branding";
import type { BrandColors } from "@/types/branding";
import { getBranding } from "@/lib/server/branding-store";
import { getPocketBaseSetting, savePocketBaseSetting } from "@/lib/server/pb-settings-sync";
import { factoryPreset, getThemePreset, THEME_PRESETS } from "@/lib/theme/presets";
import {
  DEFAULT_ARABIC_FONT_ID,
  isArabicFontId,
} from "@/lib/fonts/arabic-catalog";
import {
  DEFAULT_LATIN_FONT_ID,
  isLatinFontId,
} from "@/lib/fonts/latin-catalog";
import {
  borderFromChrome,
  BRAND_THEME_VERSION,
  colorsFromChrome,
  FACTORY_CHROME,
  factoryTheme,
  radiusFromChrome,
  type BrandTheme,
  type ImageTreatment,
  type ThemeBorder,
  type ThemeChrome,
  type ThemeImage,
  type ThemeRadius,
} from "@/lib/theme/tokens";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "brand-theme.json");

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-brand-theme.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());
}

function asCssColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback === DEFAULT_BRAND_COLORS.whatsapp ? "" : fallback;
  if (isHexColor(trimmed)) return trimmed;
  if (/^rgba?\(/i.test(trimmed)) return trimmed;
  if (/^color-mix\(/i.test(trimmed)) return trimmed;
  if (/^transparent$/i.test(trimmed)) return trimmed;
  return fallback;
}

function asCssSize(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(trimmed) || trimmed === "999px") {
    return trimmed;
  }
  return fallback;
}

function asCssShadow(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed === "none") return trimmed;
  if (trimmed.length > 240) return fallback;
  if (/inset|-?\d|rgba?\(|color-mix\(/i.test(trimmed)) return trimmed;
  return fallback;
}

const IMAGE_TREATMENTS: readonly ImageTreatment[] = [
  "none",
  "rounded",
  "shadow",
  "lift",
  "film",
];

function isImageTreatment(value: string): value is ImageTreatment {
  return (IMAGE_TREATMENTS as readonly string[]).includes(value);
}

function sanitizeColors(raw: unknown, base: BrandColors): BrandColors {
  if (!raw || typeof raw !== "object") return { ...base };
  const rec = raw as Record<string, unknown>;
  return {
    primary: asCssColor(rec.primary, base.primary),
    secondary: asCssColor(rec.secondary, base.secondary),
    accent: asCssColor(rec.accent, base.accent),
    header: asCssColor(rec.header, base.header),
    footer: asCssColor(rec.footer, base.footer),
    button: asCssColor(rec.button, base.button),
    whatsapp:
      typeof rec.whatsapp === "string" && rec.whatsapp.trim() === ""
        ? ""
        : asCssColor(rec.whatsapp, base.whatsapp),
  };
}

function sanitizeRadius(raw: unknown, base: ThemeRadius): ThemeRadius {
  if (!raw || typeof raw !== "object") return { ...base };
  const rec = raw as Record<string, unknown>;
  return {
    button: asCssSize(rec.button, base.button),
    card: asCssSize(rec.card, base.card),
    input: asCssSize(rec.input, base.input),
  };
}

function sanitizeBorder(raw: unknown, base: ThemeBorder): ThemeBorder {
  if (!raw || typeof raw !== "object") return { ...base };
  const rec = raw as Record<string, unknown>;
  return {
    width: asCssSize(rec.width, base.width),
    color: asCssColor(rec.color, base.color),
  };
}

function sanitizeImage(raw: unknown, base: ThemeImage): ThemeImage {
  if (!raw || typeof raw !== "object") return { ...base };
  const rec = raw as Record<string, unknown>;
  const treatment =
    typeof rec.treatment === "string" && isImageTreatment(rec.treatment)
      ? rec.treatment
      : base.treatment;
  return {
    treatment,
    radius: asCssSize(rec.radius, base.radius),
  };
}

function sanitizeArabicFontId(value: unknown, fallback: string): string {
  if (typeof value === "string" && isArabicFontId(value)) return value;
  return isArabicFontId(fallback) ? fallback : DEFAULT_ARABIC_FONT_ID;
}

function sanitizeLatinFontId(value: unknown, fallback: string): string {
  if (typeof value === "string" && isLatinFontId(value)) return value;
  return isLatinFontId(fallback) ? fallback : DEFAULT_LATIN_FONT_ID;
}

function chromeFromLegacyColors(colors: BrandColors, base: ThemeChrome): ThemeChrome {
  return {
    ...base,
    headerBg: colors.header || base.headerBg,
    footerBg: colors.footer || base.footerBg,
    primary: colors.primary || base.primary,
    secondary: colors.secondary || base.secondary,
    buttonBg: colors.button || base.buttonBg,
    tabActiveBg: colors.button || base.tabActiveBg,
    focusRing: colors.primary || base.focusRing,
    textLink: colors.primary || base.textLink,
    sectionBg: colors.secondary || base.sectionBg,
  };
}

function sanitizeChrome(raw: unknown, base: ThemeChrome): ThemeChrome {
  if (!raw || typeof raw !== "object") return { ...base };
  const rec = raw as Record<string, unknown>;
  return {
    pageBg: asCssColor(rec.pageBg, base.pageBg),
    sectionBg: asCssColor(rec.sectionBg, base.sectionBg),
    cardBg: asCssColor(rec.cardBg, base.cardBg),
    headerBg: asCssColor(rec.headerBg, base.headerBg),
    footerBg: asCssColor(rec.footerBg, base.footerBg),
    overlayBg: asCssColor(rec.overlayBg, base.overlayBg),
    textHeading: asCssColor(rec.textHeading, base.textHeading),
    textBody: asCssColor(rec.textBody, base.textBody),
    textMuted: asCssColor(rec.textMuted, base.textMuted),
    textInverse: asCssColor(rec.textInverse, base.textInverse),
    textLink: asCssColor(rec.textLink, base.textLink),
    primary: asCssColor(rec.primary, base.primary),
    secondary: asCssColor(rec.secondary, base.secondary),
    success: asCssColor(rec.success, base.success),
    buttonBg: asCssColor(rec.buttonBg, base.buttonBg),
    buttonText: asCssColor(rec.buttonText, base.buttonText),
    buttonBorder: asCssColor(rec.buttonBorder, base.buttonBorder),
    buttonHoverBg: asCssColor(rec.buttonHoverBg, base.buttonHoverBg),
    buttonHoverText: asCssColor(rec.buttonHoverText, base.buttonHoverText),
    buttonActiveBg: asCssColor(rec.buttonActiveBg, base.buttonActiveBg),
    buttonDisabledBg: asCssColor(rec.buttonDisabledBg, base.buttonDisabledBg),
    buttonDisabledText: asCssColor(rec.buttonDisabledText, base.buttonDisabledText),
    buttonRadius: asCssSize(rec.buttonRadius, base.buttonRadius),
    buttonShadow: asCssShadow(rec.buttonShadow, base.buttonShadow),
    cardHoverBg: asCssColor(rec.cardHoverBg, base.cardHoverBg),
    cardHoverShadow: asCssShadow(rec.cardHoverShadow, base.cardHoverShadow),
    navHover: asCssColor(rec.navHover, base.navHover),
    chipHover: asCssColor(rec.chipHover, base.chipHover),
    borderColor: asCssColor(rec.borderColor, base.borderColor),
    borderWidth: asCssSize(rec.borderWidth, base.borderWidth),
    radiusSm: asCssSize(rec.radiusSm, base.radiusSm),
    radiusMd: asCssSize(rec.radiusMd, base.radiusMd),
    radiusLg: asCssSize(rec.radiusLg, base.radiusLg),
    radiusXl: asCssSize(rec.radiusXl, base.radiusXl),
    radiusCard: asCssSize(rec.radiusCard, base.radiusCard),
    radiusInput: asCssSize(rec.radiusInput, base.radiusInput),
    headerGlass: asCssColor(rec.headerGlass, base.headerGlass),
    cardGlass: asCssColor(rec.cardGlass, base.cardGlass),
    searchGlass: asCssColor(rec.searchGlass, base.searchGlass),
    focusRing: asCssColor(rec.focusRing, base.focusRing),
    shadowSm: asCssShadow(rec.shadowSm, base.shadowSm),
    shadowMd: asCssShadow(rec.shadowMd, base.shadowMd),
    shadowLg: asCssShadow(rec.shadowLg, base.shadowLg),
    inputBg: asCssColor(rec.inputBg, base.inputBg),
    inputText: asCssColor(rec.inputText, base.inputText),
    inputBorder: asCssColor(rec.inputBorder, base.inputBorder),
    inputPlaceholder: asCssColor(rec.inputPlaceholder, base.inputPlaceholder),
    tabActiveBg: asCssColor(rec.tabActiveBg, base.tabActiveBg),
    tabActiveText: asCssColor(rec.tabActiveText, base.tabActiveText),
    tabIdleBg: asCssColor(rec.tabIdleBg, base.tabIdleBg),
    tabIdleText: asCssColor(rec.tabIdleText, base.tabIdleText),
    badgeBg: asCssColor(rec.badgeBg, base.badgeBg),
    badgeText: asCssColor(rec.badgeText, base.badgeText),
    iconChrome: asCssColor(rec.iconChrome, base.iconChrome),
  };
}

export function normalizeBrandTheme(raw: Partial<BrandTheme> | null): BrandTheme {
  const base = factoryTheme();
  const source = raw && typeof raw === "object" ? raw : {};
  const presetId =
    typeof source.presetId === "string" && source.presetId.trim()
      ? source.presetId.trim()
      : base.presetId;
  const colors = sanitizeColors(source.colors, base.colors);
  const hasChrome = source.chrome && typeof source.chrome === "object";
  const chromeBase = hasChrome
    ? FACTORY_CHROME
    : chromeFromLegacyColors(colors, FACTORY_CHROME);
  const chrome = sanitizeChrome(source.chrome, chromeBase);
  const radius = sanitizeRadius(source.radius, radiusFromChrome(chrome));
  const border = sanitizeBorder(source.border, borderFromChrome(chrome));
  return {
    version: BRAND_THEME_VERSION,
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : "",
    presetId,
    colors: {
      ...colorsFromChrome(chrome),
      whatsapp: colors.whatsapp,
    },
    radius,
    border,
    image: sanitizeImage(source.image, base.image),
    arabicFontId: sanitizeArabicFontId(source.arabicFontId, base.arabicFontId),
    latinFontId: sanitizeLatinFontId(
      (source as { latinFontId?: unknown }).latinFontId,
      base.latinFontId
    ),
    chrome,
  };
}

export function themeFromPresetId(presetId: string): BrandTheme {
  const preset = getThemePreset(presetId) || factoryPreset() || THEME_PRESETS[0]!;
  return {
    version: BRAND_THEME_VERSION,
    updatedAt: "",
    presetId: preset.id,
    colors: { ...preset.theme.colors },
    radius: { ...preset.theme.radius },
    border: { ...preset.theme.border },
    image: { ...preset.theme.image },
    arabicFontId: preset.theme.arabicFontId,
    latinFontId: preset.theme.latinFontId,
    chrome: { ...preset.theme.chrome },
  };
}

async function readStore(): Promise<BrandTheme | null> {
  try {
    const parsed = await getPocketBaseSetting<Partial<BrandTheme> | null>(
      "brand_theme",
      "brand-theme.json",
      null
    );
    if (!parsed || typeof parsed !== "object") return null;
    return normalizeBrandTheme(parsed);
  } catch {
    return null;
  }
}

async function writeStore(theme: BrandTheme): Promise<void> {
  const payload: BrandTheme = {
    ...theme,
    version: BRAND_THEME_VERSION,
    updatedAt: new Date().toISOString(),
  };
  await savePocketBaseSetting("brand_theme", payload, "brand-theme.json", "branding");
}

export async function getBrandTheme(): Promise<BrandTheme> {
  const stored = await readStore();
  if (stored) return stored;
  const branding = await getBranding();
  return normalizeBrandTheme({
    ...factoryTheme(),
    colors: { ...branding.colors },
    chrome: chromeFromLegacyColors(branding.colors, FACTORY_CHROME),
  });
}

export async function saveBrandTheme(
  input: Partial<BrandTheme> & { applyPresetId?: string; reset?: boolean }
): Promise<BrandTheme> {
  if (input.reset) {
    const factory = factoryTheme();
    await writeStore(factory);
    return { ...factory, updatedAt: new Date().toISOString() };
  }
  const current = await getBrandTheme();
  const fromPreset = input.applyPresetId
    ? themeFromPresetId(input.applyPresetId)
    : current;
  const colors = input.colors || fromPreset.colors;
  const chromeBase = input.chrome || fromPreset.chrome;
  const chrome =
    input.colors && !input.applyPresetId && !input.chrome
      ? {
          ...chromeBase,
          headerBg: colors.header || chromeBase.headerBg,
          footerBg: colors.footer || chromeBase.footerBg,
          primary: colors.primary || chromeBase.primary,
          secondary: colors.secondary || chromeBase.secondary,
          buttonBg: colors.button || chromeBase.buttonBg,
          tabActiveBg: colors.button || chromeBase.tabActiveBg,
          focusRing: colors.primary || chromeBase.focusRing,
        }
      : chromeBase;
  const next = normalizeBrandTheme({
    ...fromPreset,
    ...input,
    colors,
    radius: input.radius || fromPreset.radius,
    border: input.border || fromPreset.border,
    image: input.image || fromPreset.image,
    chrome,
    presetId: input.applyPresetId || input.presetId || fromPreset.presetId,
    arabicFontId: input.arabicFontId ?? fromPreset.arabicFontId ?? current.arabicFontId,
    latinFontId: input.latinFontId ?? fromPreset.latinFontId ?? current.latinFontId,
  });
  await writeStore(next);
  return { ...next, updatedAt: new Date().toISOString() };
}

export async function resetBrandTheme(): Promise<BrandTheme> {
  return saveBrandTheme({ reset: true });
}
