/**
 * Custom CMS pages — persisted in `.data/custom-pages.json` (gitignored).
 * Same file-store pattern as Gemini / server-env.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  CUSTOM_PAGE_SECTION_TYPES,
  type CustomPage,
  type CustomPageInput,
  type CustomPageSection,
  type CustomPageSectionType,
  type PageLayoutHints,
  type PageThemeTokens,
  type PublicPageLink,
} from "@/types/custom-page";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "custom-pages.json");

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "flights",
  "transfers",
  "cars",
  "hotels",
  "holidays",
  "visa",
  "blog",
  "contact",
  "search",
  "privacy",
  "terms",
  "package",
  "p",
  "ai-chat",
  "uae-tours",
  "vip-tours",
  "account",
  "tours",
  "login",
  "packages",
]);

type StoreFile = {
  pages: CustomPage[];
  updatedAt?: string;
};

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-custom-pages.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function slugify(raw: string): string {
  const arabicToLatin: Record<string, string> = {
    ا: "a",
    أ: "a",
    إ: "a",
    آ: "a",
    ب: "b",
    ت: "t",
    ث: "th",
    ج: "j",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "dh",
    ر: "r",
    ز: "z",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "d",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "q",
    ك: "k",
    ل: "l",
    م: "m",
    ن: "n",
    ه: "h",
    و: "w",
    ي: "y",
    ى: "a",
    ة: "a",
    ء: "",
  };

  let s = String(raw || "").trim().toLowerCase();
  s = s
    .split("")
    .map((ch) => arabicToLatin[ch] ?? ch)
    .join("");
  s = s
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s;
}

export function normalizePageSlug(raw: string, fallbackTitle = ""): string {
  return slugify(raw) || slugify(fallbackTitle);
}

export function isReservedPageSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

function newId(): string {
  return `pg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultAboutPage(): CustomPage {
  const now = "2026-09-01T00:00:00.000Z";
  return {
    id: "pg_about_lonaliza",
    slug: "about",
    titleAr: "من نحن — لوناليزا للسياحة وتقنية السفر",
    titleEn: "About Us — Lonaliza Travel & Cloud Technology",
    titleTr: "Hakkımızda — Lonaliza Turizm ve Seyahat Teknolojisi",
    bodyAr: `<p>منصة لوناليزا هي المنظومة السحابية الذكية المتكاملة لحجوزات الطيران والفنادق والترانسفير. نُمكّن الوكالات والشركات حول العالم من إطلاق منصاتهم المستقلة بهويتهم الخاصة خلال 24 ساعة مع اتصال مباشر بشبكات التوزيع العالمية وبنوك الأسرة وتطبيقات الهاتف الذكية.</p>`,
    bodyEn: `<p>Lonaliza is the smart cloud travel platform powering global flight, hotel, transfer, and tour bookings. We empower travel agencies worldwide to launch their own branded portals in 24 hours with direct GDS connectivity, global bedbanks, and native mobile apps.</p>`,
    bodyTr: `<p>Lonaliza, küresel uçuş, otel, transfer ve tur rezervasyonlarını güçlendiren akıllı bulut seyahat platformudur.</p>`,
    seoTitle: "من نحن | لوناليزا للتقنية والسياحة العالمية",
    seoDescription: "تعرف على لوناليزا: المنظومة السحابية المتكاملة لحجوزات الطيران والفنادق والترانسفير وحلول الوايت ليبل للشركات السياحية حول العالم.",
    published: true,
    showInHeader: true,
    showInFooter: true,
    sections: [
      {
        id: "sec_hero",
        type: "heading",
        titleAr: "من نحن — ثورة السياحة والتقنية السحابية",
        titleEn: "About Us — Cloud Travel Platform",
        titleTr: "Hakkımızda — Bulut Seyahat Platformu",
      },
      {
        id: "sec_story",
        type: "text",
        titleAr: "رؤيتنا وقصتنا",
        titleEn: "Our Story & Vision",
        titleTr: "Hikayemiz ve Vizyonumuz",
        bodyAr: "<p>انطلقت لوناليزا لتقديم حلول سفر وسياحة رقمية متقدمة، تجمع بين تيسير الحجوزات المباشرة للمسافرين عبر موقع وتطبيق متطور، وبين تمكين مكاتب وشركات السياحة من امتلاك منصاتهم المستقلة وحلول الوايت ليبل المتقدمة خلال 24 ساعة فقط.</p>",
        bodyEn: "<p>Lonaliza was launched to pioneer advanced travel technology, bridging consumer bookings with turnkey enterprise White Label platforms for travel agencies globally.</p>",
      },
      {
        id: "sec_cta",
        type: "cta",
        titleAr: "ابدأ رحلتك أو أطلق وكالتك اليوم",
        titleEn: "Start Your Journey or Launch Your Agency",
        titleTr: "Yolculuğunuza Başlayın",
        bodyAr: "استكشف أحدث عروض الطيران والفنادق أو انضم لبوابة الشركاء B2B.",
        bodyEn: "Explore live flight & hotel deals or join our B2B partners portal.",
        ctaLabelAr: "دخول بوابة الشركاء B2B",
        ctaLabelEn: "Open B2B Portal",
        ctaLabelTr: "B2B Paneline Giriş",
        ctaHref: "/partners/dashboard",
      },
    ],
    theme: {
      navy: "#2E1065",
      emerald: "#F59E0B",
    },
    layoutHints: {
      maxWidth: "wide",
      heroAlign: "start",
      showHero: true,
    },
    createdAt: now,
    updatedAt: now,
  };
}

async function readStore(): Promise<CustomPage[]> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
    if (!pages.some((p) => p.slug === "about")) {
      pages.unshift(defaultAboutPage());
    }
    return pages;
  } catch {
    return [defaultAboutPage()];
  }
}

async function writeStore(pages: CustomPage[]): Promise<void> {
  await ensureDir();
  const payload: StoreFile = {
    pages,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(payload, null, 2), {
    mode: 0o600,
  });
}

function sanitizeHtml(html: string): string {
  return String(html || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
}

function isSectionType(value: string): value is CustomPageSectionType {
  return (CUSTOM_PAGE_SECTION_TYPES as readonly string[]).includes(value);
}

function sanitizeSection(raw: CustomPageSection, index: number): CustomPageSection | null {
  const type = isSectionType(String(raw?.type || "")) ? raw.type : "text";
  const id = String(raw?.id || "").trim() || `sec_${index + 1}`;
  return {
    id,
    type,
    hidden: Boolean(raw.hidden),
    titleAr: raw.titleAr != null ? String(raw.titleAr) : undefined,
    titleEn: raw.titleEn != null ? String(raw.titleEn) : undefined,
    titleTr: raw.titleTr != null ? String(raw.titleTr) : undefined,
    bodyAr: raw.bodyAr != null ? sanitizeHtml(String(raw.bodyAr)) : undefined,
    bodyEn: raw.bodyEn != null ? sanitizeHtml(String(raw.bodyEn)) : undefined,
    bodyTr: raw.bodyTr != null ? sanitizeHtml(String(raw.bodyTr)) : undefined,
    image: raw.image != null ? String(raw.image).trim() : undefined,
    ctaLabelAr: raw.ctaLabelAr != null ? String(raw.ctaLabelAr) : undefined,
    ctaLabelEn: raw.ctaLabelEn != null ? String(raw.ctaLabelEn) : undefined,
    ctaLabelTr: raw.ctaLabelTr != null ? String(raw.ctaLabelTr) : undefined,
    ctaHref: raw.ctaHref != null ? String(raw.ctaHref).trim() : undefined,
    background: raw.background != null ? String(raw.background).trim() : undefined,
    textColor: raw.textColor != null ? String(raw.textColor).trim() : undefined,
    accent: raw.accent != null ? String(raw.accent).trim() : undefined,
  };
}

function sanitizeSections(raw?: CustomPageSection[]): CustomPageSection[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((item, index) => sanitizeSection(item, index))
    .filter((item): item is CustomPageSection => item != null);
}

function sanitizeTheme(raw?: PageThemeTokens): PageThemeTokens | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const next: PageThemeTokens = {};
  if (raw.navy) next.navy = String(raw.navy).trim();
  if (raw.emerald) next.emerald = String(raw.emerald).trim();
  if (raw.background) next.background = String(raw.background).trim();
  if (raw.text) next.text = String(raw.text).trim();
  if (raw.accent) next.accent = String(raw.accent).trim();
  return next;
}

function sanitizeHints(raw?: PageLayoutHints): PageLayoutHints | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const next: PageLayoutHints = {};
  if (raw.heroAlign === "start" || raw.heroAlign === "center") next.heroAlign = raw.heroAlign;
  if (raw.maxWidth === "narrow" || raw.maxWidth === "default" || raw.maxWidth === "wide") {
    next.maxWidth = raw.maxWidth;
  }
  if (typeof raw.showHero === "boolean") next.showHero = raw.showHero;
  if (typeof raw.compactHeader === "boolean") next.compactHeader = raw.compactHeader;
  return Object.keys(next).length ? next : undefined;
}

export function defaultCustomPageSections(
  titleAr: string,
  titleEn: string,
  titleTr = ""
): CustomPageSection[] {
  return [
    {
      id: "sec_hero",
      type: "heading",
      titleAr: titleAr || titleEn,
      titleEn: titleEn || titleAr,
      titleTr: titleTr || titleEn || titleAr,
    },
    {
      id: "sec_body",
      type: "text",
      bodyAr: "",
      bodyEn: "",
      bodyTr: "",
    },
  ];
}

function applyInput(base: CustomPage, input: CustomPageInput): CustomPage {
  const titleAr = input.titleAr !== undefined ? String(input.titleAr).trim() : base.titleAr;
  const titleEn = input.titleEn !== undefined ? String(input.titleEn).trim() : base.titleEn;
  const titleTr =
    input.titleTr !== undefined ? String(input.titleTr).trim() : base.titleTr || "";
  let slug =
    input.slug !== undefined
      ? normalizePageSlug(input.slug, titleAr || titleEn)
      : base.slug;
  if (!slug) slug = normalizePageSlug(titleAr || titleEn || base.id);

  return {
    ...base,
    slug,
    titleAr,
    titleEn,
    titleTr,
    bodyAr:
      input.bodyAr !== undefined ? sanitizeHtml(String(input.bodyAr)) : base.bodyAr,
    bodyEn:
      input.bodyEn !== undefined ? sanitizeHtml(String(input.bodyEn)) : base.bodyEn,
    seoTitle:
      input.seoTitle !== undefined ? String(input.seoTitle).trim() : base.seoTitle,
    seoDescription:
      input.seoDescription !== undefined
        ? String(input.seoDescription).trim()
        : base.seoDescription,
    published:
      input.published !== undefined ? Boolean(input.published) : base.published,
    showInHeader:
      input.showInHeader !== undefined
        ? Boolean(input.showInHeader)
        : base.showInHeader,
    showInFooter:
      input.showInFooter !== undefined
        ? Boolean(input.showInFooter)
        : base.showInFooter,
    sections:
      input.sections !== undefined
        ? sanitizeSections(input.sections) || []
        : base.sections,
    theme: input.theme !== undefined ? sanitizeTheme(input.theme) : base.theme,
    layoutHints:
      input.layoutHints !== undefined ? sanitizeHints(input.layoutHints) : base.layoutHints,
    updatedAt: new Date().toISOString(),
  };
}

export async function listCustomPages(): Promise<CustomPage[]> {
  const pages = await readStore();
  return pages.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getCustomPageById(id: string): Promise<CustomPage | null> {
  const pages = await readStore();
  return pages.find((p) => p.id === id) || null;
}

export async function getCustomPageBySlug(
  slug: string
): Promise<CustomPage | null> {
  const normalized = normalizePageSlug(slug);
  if (!normalized) return null;
  const pages = await readStore();
  return pages.find((p) => p.slug === normalized) || null;
}

export async function getPublishedPageBySlug(
  slug: string
): Promise<CustomPage | null> {
  const page = await getCustomPageBySlug(slug);
  if (!page || !page.published) return null;
  return page;
}

export async function listPublicPageLinks(): Promise<PublicPageLink[]> {
  const pages = await readStore();
  return pages
    .filter((p) => p.published && (p.showInHeader || p.showInFooter))
    .map((p) => ({
      slug: p.slug,
      href: `/p/${p.slug}`,
      titleAr: p.titleAr || p.titleEn,
      titleEn: p.titleEn || p.titleAr,
      showInHeader: p.showInHeader,
      showInFooter: p.showInFooter,
    }));
}

export async function createCustomPage(
  input: CustomPageInput
): Promise<{ ok: true; page: CustomPage } | { ok: false; error: string }> {
  const titleAr = String(input.titleAr || "").trim();
  const titleEn = String(input.titleEn || "").trim();
  if (!titleAr && !titleEn) {
    return { ok: false, error: "العنوان مطلوب" };
  }

  const slug = normalizePageSlug(input.slug || "", titleAr || titleEn);
  if (!slug) return { ok: false, error: "الرابط (slug) غير صالح" };
  if (isReservedPageSlug(slug)) {
    return { ok: false, error: `الرابط «${slug}» محجوز` };
  }

  const pages = await readStore();
  if (pages.some((p) => p.slug === slug)) {
    return { ok: false, error: "هذا الرابط مستخدم بالفعل" };
  }

  const now = new Date().toISOString();
  const page = applyInput(
    {
      id: newId(),
      slug,
      titleAr,
      titleEn,
      titleTr: String(input.titleTr || "").trim(),
      bodyAr: "",
      bodyEn: "",
      seoTitle: "",
      seoDescription: "",
      published: false,
      showInHeader: false,
      showInFooter: false,
      sections: defaultCustomPageSections(titleAr, titleEn, String(input.titleTr || "")),
      theme: {},
      layoutHints: { maxWidth: "default", heroAlign: "start" },
      createdAt: now,
      updatedAt: now,
    },
    input
  );

  pages.push(page);
  await writeStore(pages);
  return { ok: true, page };
}

export async function updateCustomPage(
  id: string,
  input: CustomPageInput
): Promise<{ ok: true; page: CustomPage } | { ok: false; error: string }> {
  const pages = await readStore();
  const index = pages.findIndex((p) => p.id === id);
  if (index < 0) return { ok: false, error: "الصفحة غير موجودة" };

  const next = applyInput(pages[index], input);
  if (isReservedPageSlug(next.slug)) {
    return { ok: false, error: `الرابط «${next.slug}» محجوز` };
  }
  if (pages.some((p) => p.id !== id && p.slug === next.slug)) {
    return { ok: false, error: "هذا الرابط مستخدم بالفعل" };
  }

  pages[index] = next;
  await writeStore(pages);
  return { ok: true, page: next };
}

export async function upsertCustomPageBySlug(
  input: CustomPageInput
): Promise<{ ok: true; page: CustomPage; created: boolean } | { ok: false; error: string }> {
  const slug = normalizePageSlug(input.slug || "", input.titleAr || input.titleEn || "");
  if (!slug) return { ok: false, error: "الرابط (slug) غير صالح" };

  const existing = await getCustomPageBySlug(slug);
  if (existing) {
    const updated = await updateCustomPage(existing.id, input);
    if (!updated.ok) return { ok: false, error: updated.error };
    return { ok: true, page: updated.page, created: false };
  }
  const created = await createCustomPage({ ...input, slug });
  if (!created.ok) return { ok: false, error: created.error };
  return { ok: true, page: created.page, created: true };
}

export async function deleteCustomPage(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const pages = await readStore();
  const next = pages.filter((p) => p.id !== id);
  if (next.length === pages.length) {
    return { ok: false, error: "الصفحة غير موجودة" };
  }
  await writeStore(next);
  return { ok: true };
}
