import type { EmailVisualDocument } from "@/lib/email/visual-doc";
import { seedValue, templateKey } from "@/lib/server/email/i18n-keys";
import { listRegisteredLocales } from "@/lib/server/translations-store";
import { promises as fs } from "fs";
import path from "path";

const STORE_FILE = path.join(process.cwd(), ".data", "translations.json");

type StoreFile = {
  overrides?: Partial<Record<"ar" | "en" | "tr", Record<string, string>>>;
  values?: Record<string, Record<string, string>>;
};

async function readTranslationFlat(): Promise<{
  overrides: Record<"ar" | "en" | "tr", Record<string, string>>;
  values: Record<string, Record<string, string>>;
}> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    return {
      overrides: {
        ar: parsed.overrides?.ar || {},
        en: parsed.overrides?.en || {},
        tr: parsed.overrides?.tr || {},
      },
      values: parsed.values || {},
    };
  } catch {
    return { overrides: { ar: {}, en: {}, tr: {} }, values: {} };
  }
}

function builtinOf(locale: string): "ar" | "en" | "tr" {
  if (locale === "en" || locale === "tr") return locale;
  return "ar";
}

export async function emailT(locale: string, key: string): Promise<string> {
  const store = await readTranslationFlat();
  const code = String(locale || "ar").trim().toLowerCase() || "ar";
  if (code === "ar") {
    return (store.overrides.ar[key] || seedValue(key, "ar") || "").trim();
  }
  if (code === "en" || code === "tr") {
    return (
      store.overrides[code][key] ||
      seedValue(key, code) ||
      seedValue(key, "ar") ||
      ""
    ).trim();
  }
  const custom = (store.values[code]?.[key] || "").trim();
  if (custom) return custom;
  return (store.overrides.en[key] || seedValue(key, "en") || seedValue(key, "ar") || "").trim();
}

export async function emailTMany(
  locale: string,
  keys: string[]
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    out[key] = await emailT(locale, key);
  }
  return out;
}

export function applyTranslatedDocument(
  doc: EmailVisualDocument,
  slug: string,
  map: Record<string, string>
): EmailVisualDocument {
  return {
    ...doc,
    blocks: doc.blocks.map((block) => {
      const textKey = templateKey(slug, `block.${block.id}`);
      const text = map[textKey];
      const rows = (block.rows || []).map((row, index) => {
        const labelKey = templateKey(slug, `block.${block.id}.row.${index}.label`);
        return {
          ...row,
          label: map[labelKey] || row.label,
        };
      });
      return {
        ...block,
        text: text || block.text,
        rows: block.rows ? rows : block.rows,
      };
    }),
  };
}

export async function translateVisualDocument(
  doc: EmailVisualDocument,
  slug: string,
  locale: string
): Promise<EmailVisualDocument> {
  if (!locale || locale === "ar") return doc;
  const keys = [templateKey(slug, "subject")];
  for (const block of doc.blocks) {
    keys.push(templateKey(slug, `block.${block.id}`));
    (block.rows || []).forEach((_, index) => {
      keys.push(templateKey(slug, `block.${block.id}.row.${index}.label`));
    });
  }
  const map = await emailTMany(locale, keys);
  return applyTranslatedDocument(doc, slug, map);
}

export async function knownEmailLocales(): Promise<string[]> {
  try {
    const locales = await listRegisteredLocales();
    return locales.map((item) => item.code);
  } catch {
    return ["ar", "en", "tr"];
  }
}

export { builtinOf };
