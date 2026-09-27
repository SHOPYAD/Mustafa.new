/**
 * Visual homepage template — persisted in `.data/homepage-template.json`.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  TEMPLATE_SEED_VERSION,
  cloneDraft,
  defaultHomepageDraft,
  defaultHomepageTemplateFile,
  ensureOriginalHomepageSections,
  isHomepageSectionType,
  type HomepageSectionInstance,
  type HomepageTemplateDraft,
  type HomepageTemplateFile,
  type LocalizedCopy,
  type SectionStyles,
} from "@/lib/visual-editor/schema";
import { getPocketBaseSetting, savePocketBaseSetting } from "@/lib/server/pb-settings-sync";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "homepage-template.json");

function isServerlessHosting(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-homepage-template.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function asCopy(value: unknown): LocalizedCopy | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  return {
    ar: String(rec.ar || ""),
    en: String(rec.en || ""),
    tr: String(rec.tr || ""),
  };
}

function asStyles(value: unknown): SectionStyles {
  const rec = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    background: String(rec.background || ""),
    accent: String(rec.accent || ""),
    textColor: String(rec.textColor || ""),
    overlay: String(rec.overlay || ""),
  };
}

function sanitizeSection(raw: unknown): HomepageSectionInstance | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  if (!isHomepageSectionType(String(rec.type || ""))) return null;
  const texts: Record<string, LocalizedCopy> = {};
  if (rec.texts && typeof rec.texts === "object") {
    for (const [key, value] of Object.entries(rec.texts as Record<string, unknown>)) {
      const copy = asCopy(value);
      if (copy) texts[key] = copy;
    }
  }
  const settings: Record<string, string | number | boolean> = {};
  if (rec.settings && typeof rec.settings === "object") {
    for (const [key, value] of Object.entries(rec.settings as Record<string, unknown>)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        settings[key] = value;
      }
    }
  }
  return {
    instanceId: String(rec.instanceId || `${rec.type}-imported`),
    type: rec.type as HomepageSectionInstance["type"],
    hidden: Boolean(rec.hidden),
    texts,
    styles: asStyles(rec.styles),
    settings,
  };
}

function sanitizeDraft(raw: unknown): HomepageTemplateDraft {
  const fallback = defaultHomepageDraft();
  if (!raw || typeof raw !== "object") return fallback;
  const rec = raw as Record<string, unknown>;
  const layout = Array.isArray(rec.layout)
    ? rec.layout.map(sanitizeSection).filter((item): item is HomepageSectionInstance => item !== null)
    : [];
  const global =
    rec.global && typeof rec.global === "object"
      ? (rec.global as Record<string, unknown>)
      : {};
  return ensureOriginalHomepageSections({
    layout: layout.length ? layout : fallback.layout,
    global: {
      navy: String(global.navy || fallback.global.navy),
      emerald: String(global.emerald || fallback.global.emerald),
    },
  });
}

function sanitizeFile(raw: unknown): HomepageTemplateFile {
  const fallback = defaultHomepageTemplateFile();
  if (!raw || typeof raw !== "object") return fallback;
  const rec = raw as Record<string, unknown>;
  const version = Number(rec.version) || TEMPLATE_SEED_VERSION;
  if (!rec.draft && version < TEMPLATE_SEED_VERSION) return fallback;
  return {
    version: TEMPLATE_SEED_VERSION,
    updatedAt: String(rec.updatedAt || fallback.updatedAt),
    publishedAt: rec.publishedAt ? String(rec.publishedAt) : null,
    draft: sanitizeDraft(rec.draft),
    published: rec.published ? sanitizeDraft(rec.published) : null,
  };
}

async function readStore(): Promise<HomepageTemplateFile> {
  try {
    const parsed = await getPocketBaseSetting<unknown>(
      "homepage_template",
      "homepage-template.json",
      null
    );
    if (parsed) {
      return sanitizeFile(parsed);
    }
    return defaultHomepageTemplateFile();
  } catch {
    return defaultHomepageTemplateFile();
  }
}

async function writeStore(store: HomepageTemplateFile): Promise<HomepageTemplateFile> {
  const next: HomepageTemplateFile = {
    ...store,
    version: TEMPLATE_SEED_VERSION,
    updatedAt: new Date().toISOString(),
  };
  await savePocketBaseSetting("homepage_template", next, "homepage-template.json", "template");
  return next;
}

export async function getHomepageTemplateFile(): Promise<HomepageTemplateFile> {
  return readStore();
}

export async function getPublishedHomepageDraft(): Promise<HomepageTemplateDraft> {
  const store = await readStore();
  return cloneDraft(store.published || defaultHomepageDraft());
}

export async function saveHomepageTemplateDraft(
  draft: HomepageTemplateDraft
): Promise<HomepageTemplateFile> {
  const store = await readStore();
  store.draft = sanitizeDraft(draft);
  return writeStore(store);
}

export async function publishHomepageTemplate(
  draft?: HomepageTemplateDraft
): Promise<HomepageTemplateFile> {
  const store = await readStore();
  const nextDraft = sanitizeDraft(draft || store.draft);
  store.draft = nextDraft;
  store.published = cloneDraft(nextDraft);
  store.publishedAt = new Date().toISOString();
  return writeStore(store);
}

export async function resetHomepageTemplate(): Promise<HomepageTemplateFile> {
  return writeStore(defaultHomepageTemplateFile());
}
