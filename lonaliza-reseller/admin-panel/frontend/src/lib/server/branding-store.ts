/**
 * Brand identity + homepage chrome — persisted in `.data/branding.json`.
 * Same file-store pattern as custom pages / server-env / cars.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  BRANDING_VERSION,
  DEFAULT_BRAND_COLORS,
  DEFAULT_BRANDING,
  defaultSectionVisibility,
} from "@/data/branding";
import {
  HOMEPAGE_SECTION_KEYS,
  type BrandColors,
  type BrandingContent,
  type BrandingExtraImage,
  type BrandingExtraText,
  type BrandingHeroSlide,
  type BrandingPatch,
  type BrandingSideCard,
  type HomepageSectionKey,
  type HomepageSectionVisibility,
} from "@/types/branding";
import { mergeSupportContact } from "@/lib/server/site-contact-file";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "branding.json");

type StoreFile = BrandingContent;

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-branding.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
    value.trim()
  );
}

function sanitizeColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback === DEFAULT_BRAND_COLORS.whatsapp ? "" : fallback;
  return isHexColor(trimmed) ? trimmed : fallback;
}

function sanitizeUrl(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^javascript:/i.test(trimmed)) return fallback;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function sanitizeSlide(
  raw: unknown,
  fallback?: BrandingHeroSlide
): BrandingHeroSlide | null {
  if (!raw || typeof raw !== "object") return fallback || null;
  const rec = raw as Record<string, unknown>;
  const base = fallback;
  const id = asString(rec.id, base?.id || newId("h"));
  if (!id) return null;
  return {
    id,
    nameAr: asString(rec.nameAr, base?.nameAr || ""),
    nameEn: asString(rec.nameEn, base?.nameEn || ""),
    nameTr: asString(rec.nameTr, base?.nameTr || ""),
    taglineAr: asString(rec.taglineAr, base?.taglineAr || ""),
    taglineEn: asString(rec.taglineEn, base?.taglineEn || ""),
    taglineTr: asString(rec.taglineTr, base?.taglineTr || ""),
    image: sanitizeUrl(rec.image, base?.image || ""),
    price: asNumber(rec.price, base?.price ?? 0),
    currencyLabel: asString(rec.currencyLabel, base?.currencyLabel || "USD"),
    durationAr: asString(rec.durationAr, base?.durationAr || ""),
    durationEn: asString(rec.durationEn, base?.durationEn || ""),
    durationTr: asString(rec.durationTr, base?.durationTr || ""),
    rating: asNumber(rec.rating, base?.rating ?? 4.8),
    badgeAr: asString(rec.badgeAr, base?.badgeAr || ""),
    badgeEn: asString(rec.badgeEn, base?.badgeEn || ""),
    badgeTr: asString(rec.badgeTr, base?.badgeTr || ""),
    inclusiveAr: asString(rec.inclusiveAr, base?.inclusiveAr || ""),
    inclusiveEn: asString(rec.inclusiveEn, base?.inclusiveEn || ""),
    inclusiveTr: asString(rec.inclusiveTr, base?.inclusiveTr || ""),
    ctaLabelAr: asString(rec.ctaLabelAr, base?.ctaLabelAr || ""),
    ctaLabelEn: asString(rec.ctaLabelEn, base?.ctaLabelEn || ""),
    ctaLabelTr: asString(rec.ctaLabelTr, base?.ctaLabelTr || ""),
    ctaHref: sanitizeUrl(rec.ctaHref, base?.ctaHref || "/holidays"),
    secondaryCtaLabelAr: asString(
      rec.secondaryCtaLabelAr,
      base?.secondaryCtaLabelAr || ""
    ),
    secondaryCtaLabelEn: asString(
      rec.secondaryCtaLabelEn,
      base?.secondaryCtaLabelEn || ""
    ),
    secondaryCtaLabelTr: asString(
      rec.secondaryCtaLabelTr,
      base?.secondaryCtaLabelTr || ""
    ),
    secondaryCtaHref: sanitizeUrl(
      rec.secondaryCtaHref,
      base?.secondaryCtaHref || ""
    ),
  };
}

function sanitizeSideCard(
  raw: unknown,
  fallback?: BrandingSideCard
): BrandingSideCard | null {
  if (!raw || typeof raw !== "object") return fallback || null;
  const rec = raw as Record<string, unknown>;
  const id = asString(rec.id, fallback?.id || newId("sc"));
  if (!id) return null;
  return {
    id,
    titleAr: asString(rec.titleAr, fallback?.titleAr || ""),
    titleEn: asString(rec.titleEn, fallback?.titleEn || ""),
    titleTr: asString(rec.titleTr, fallback?.titleTr || ""),
    daysAr: asString(rec.daysAr, fallback?.daysAr || ""),
    daysEn: asString(rec.daysEn, fallback?.daysEn || ""),
    daysTr: asString(rec.daysTr, fallback?.daysTr || ""),
    price: asNumber(rec.price, fallback?.price ?? 0),
    image: sanitizeUrl(rec.image, fallback?.image || ""),
    href: sanitizeUrl(rec.href, fallback?.href || "/holidays"),
  };
}

function sanitizeExtraText(
  raw: unknown,
  fallback?: BrandingExtraText
): BrandingExtraText | null {
  if (!raw || typeof raw !== "object") return fallback || null;
  const rec = raw as Record<string, unknown>;
  const id = asString(rec.id, fallback?.id || newId("xt"));
  if (!id) return null;
  return {
    id,
    titleAr: asString(rec.titleAr, fallback?.titleAr || ""),
    titleEn: asString(rec.titleEn, fallback?.titleEn || ""),
    titleTr: asString(rec.titleTr, fallback?.titleTr || ""),
    bodyAr: asString(rec.bodyAr, fallback?.bodyAr || ""),
    bodyEn: asString(rec.bodyEn, fallback?.bodyEn || ""),
    bodyTr: asString(rec.bodyTr, fallback?.bodyTr || ""),
  };
}

function sanitizeExtraImage(
  raw: unknown,
  fallback?: BrandingExtraImage
): BrandingExtraImage | null {
  if (!raw || typeof raw !== "object") return fallback || null;
  const rec = raw as Record<string, unknown>;
  const id = asString(rec.id, fallback?.id || newId("xi"));
  if (!id) return null;
  return {
    id,
    url: sanitizeUrl(rec.url, fallback?.url || ""),
    altAr: asString(rec.altAr, fallback?.altAr || ""),
    altEn: asString(rec.altEn, fallback?.altEn || ""),
    altTr: asString(rec.altTr, fallback?.altTr || ""),
  };
}

function sanitizeColors(raw: unknown, base: BrandColors): BrandColors {
  if (!raw || typeof raw !== "object") return { ...base };
  const rec = raw as Record<string, unknown>;
  return {
    primary: sanitizeColor(rec.primary, base.primary),
    secondary: sanitizeColor(rec.secondary, base.secondary),
    accent: sanitizeColor(rec.accent, base.accent),
    header: sanitizeColor(rec.header, base.header),
    footer: sanitizeColor(rec.footer, base.footer),
    button: sanitizeColor(rec.button, base.button),
    whatsapp:
      typeof rec.whatsapp === "string" && rec.whatsapp.trim() === ""
        ? ""
        : sanitizeColor(rec.whatsapp, base.whatsapp),
  };
}

function sanitizeSections(
  raw: unknown,
  base: HomepageSectionVisibility
): HomepageSectionVisibility {
  const next = { ...base };
  if (!raw || typeof raw !== "object") return next;
  const rec = raw as Record<string, unknown>;
  for (const key of HOMEPAGE_SECTION_KEYS) {
    if (typeof rec[key] === "boolean") next[key] = rec[key];
  }
  return next;
}

function listFrom<T>(
  raw: unknown,
  sanitize: (item: unknown) => T | null
): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => sanitize(item)).filter((item): item is T => item != null);
}

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((row) => row.id === item.id);
  if (index >= 0) {
    const copy = [...list];
    copy[index] = item;
    return copy;
  }
  return [...list, item];
}

export function normalizeBranding(raw: Partial<BrandingContent> | null): BrandingContent {
  const source = raw && typeof raw === "object" ? raw : {};
  const heroRaw = (
    source.hero && typeof source.hero === "object" ? source.hero : {}
  ) as Partial<BrandingContent["hero"]>;

  const slides = Array.isArray(heroRaw.slides)
    ? listFrom(heroRaw.slides, (item) => sanitizeSlide(item))
    : DEFAULT_BRANDING.hero.slides;
  const sideCards = Array.isArray(heroRaw.sideCards)
    ? listFrom(heroRaw.sideCards, (item) => sanitizeSideCard(item))
    : [];
  const extraTexts = Array.isArray(heroRaw.extraTexts)
    ? listFrom(heroRaw.extraTexts, (item) => sanitizeExtraText(item))
    : [];
  const extraImages = Array.isArray(heroRaw.extraImages)
    ? listFrom(heroRaw.extraImages, (item) => sanitizeExtraImage(item))
    : [];

  return {
    version: BRANDING_VERSION,
    updatedAt: asString(source.updatedAt, ""),
    logoUrl: sanitizeUrl(source.logoUrl, DEFAULT_BRANDING.logoUrl),
    faviconUrl: sanitizeUrl(source.faviconUrl, DEFAULT_BRANDING.faviconUrl),
    brandNameAr: asString(source.brandNameAr, DEFAULT_BRANDING.brandNameAr),
    brandNameEn: asString(source.brandNameEn, DEFAULT_BRANDING.brandNameEn),
    brandNameTr: asString(source.brandNameTr, DEFAULT_BRANDING.brandNameTr),
    showWordmark:
      typeof source.showWordmark === "boolean"
        ? source.showWordmark
        : DEFAULT_BRANDING.showWordmark,
    supportEmail: asString(source.supportEmail, DEFAULT_BRANDING.supportEmail),
    supportPhone: asString(source.supportPhone, DEFAULT_BRANDING.supportPhone),
    supportWhatsapp: asString(
      source.supportWhatsapp,
      DEFAULT_BRANDING.supportWhatsapp
    ),
    colors: sanitizeColors(source.colors, DEFAULT_BRAND_COLORS),
    sections: sanitizeSections(source.sections, defaultSectionVisibility()),
    hero: {
      slides: slides.length > 0 ? slides : DEFAULT_BRANDING.hero.slides,
      sideCards,
      extraTexts,
      extraImages,
    },
  };
}

export function mergeBrandingPatch(
  current: BrandingContent,
  patch: BrandingPatch
): BrandingContent {
  let next = normalizeBranding({
    ...current,
    ...patch,
    colors: sanitizeColors(patch.colors, current.colors),
    sections: sanitizeSections(patch.sections, current.sections),
    hero: {
      slides: current.hero.slides,
      sideCards: current.hero.sideCards,
      extraTexts: current.hero.extraTexts,
      extraImages: current.hero.extraImages,
      ...(patch.hero || {}),
    },
  });

  if (Array.isArray(patch.replaceHeroSlides)) {
    const slides = listFrom(patch.replaceHeroSlides, (item) =>
      sanitizeSlide(item)
    );
    if (slides.length > 0) next.hero.slides = slides;
  }
  if (Array.isArray(patch.replaceSideCards)) {
    next.hero.sideCards = listFrom(patch.replaceSideCards, (item) =>
      sanitizeSideCard(item)
    );
  }
  if (Array.isArray(patch.replaceExtraTexts)) {
    next.hero.extraTexts = listFrom(patch.replaceExtraTexts, (item) =>
      sanitizeExtraText(item)
    );
  }
  if (Array.isArray(patch.replaceExtraImages)) {
    next.hero.extraImages = listFrom(patch.replaceExtraImages, (item) =>
      sanitizeExtraImage(item)
    );
  }

  if (patch.upsertHeroSlide) {
    const slide = sanitizeSlide(patch.upsertHeroSlide);
    if (slide) next.hero.slides = upsertById(next.hero.slides, slide);
  }
  if (patch.removeHeroSlideId) {
    const filtered = next.hero.slides.filter(
      (slide) => slide.id !== patch.removeHeroSlideId
    );
    if (filtered.length > 0) next.hero.slides = filtered;
  }
  if (patch.upsertSideCard) {
    const card = sanitizeSideCard(patch.upsertSideCard);
    if (card) next.hero.sideCards = upsertById(next.hero.sideCards, card);
  }
  if (patch.removeSideCardId) {
    next.hero.sideCards = next.hero.sideCards.filter(
      (card) => card.id !== patch.removeSideCardId
    );
  }

  return next;
}

async function readStore(): Promise<BrandingContent | null> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<BrandingContent>;
    if (!parsed || typeof parsed !== "object") return null;
    const hasIdentity =
      typeof parsed.logoUrl === "string" ||
      typeof parsed.brandNameAr === "string" ||
      (parsed.hero && typeof parsed.hero === "object") ||
      (parsed.colors && typeof parsed.colors === "object");
    if (!hasIdentity) return null;
    return normalizeBranding(parsed);
  } catch {
    return null;
  }
}

async function writeStore(content: BrandingContent): Promise<void> {
  await ensureDir();
  const payload: StoreFile = {
    ...content,
    version: BRANDING_VERSION,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
}

export async function getBranding(): Promise<BrandingContent> {
  const stored = await readStore();
  return stored || normalizeBranding(DEFAULT_BRANDING);
}

export async function saveBranding(
  input: BrandingContent | BrandingPatch,
  opts?: { merge?: boolean }
): Promise<BrandingContent> {
  const current = await getBranding();
  const next = opts?.merge
    ? mergeBrandingPatch(current, input)
    : normalizeBranding(input as Partial<BrandingContent>);
  await writeStore(next);
  await mergeSupportContact({
    email: next.supportEmail,
    phone: next.supportPhone,
    whatsapp: next.supportWhatsapp,
  });
  return { ...next, updatedAt: new Date().toISOString() };
}

export function isHomepageSectionKey(value: string): value is HomepageSectionKey {
  return (HOMEPAGE_SECTION_KEYS as readonly string[]).includes(value);
}
