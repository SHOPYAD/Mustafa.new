import { promises as fs } from "fs";
import path from "path";
import ar from "@/lib/i18n/dictionaries/ar";
import en from "@/lib/i18n/dictionaries/en";
import tr from "@/lib/i18n/dictionaries/tr";
import fr from "@/lib/i18n/dictionaries/fr";
import type { Dictionary } from "@/lib/i18n/types";
import {
  applyFlatToDictionary,
  BUILTIN_LOCALE_META,
  defaultDirForCode,
  flattenDictionary,
  isBuiltInLocale,
  isValidLangCode,
  normalizeLangCode,
  scopeForKey,
  type BuiltInLocale,
  type RegisteredLocale,
  type TranslationKeyKind,
  type TranslationScope,
} from "@/lib/i18n/catalog";
import {
  getEmailI18nSeedFlat,
  isEmailTemplateI18nKey,
  readExtraEmailI18nKeys,
} from "@/lib/server/email/i18n-keys";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "translations.json");
const LOCALES_DIR = path.join(DATA_DIR, "locales");

export type CustomLanguage = {
  code: string;
  name: string;
  nativeName: string;
  dir: "rtl" | "ltr";
  sourceLocale: "ar" | "en";
};

type StoreFile = {
  updatedAt?: string;
  overrides: Partial<Record<BuiltInLocale, Record<string, string>>>;
  languages: CustomLanguage[];
  values: Record<string, Record<string, string>>;
};

const emptyStore = (): StoreFile => ({
  overrides: { ar: {}, en: {}, tr: {}, fr: {} },
  languages: [],
  values: {},
});

export type BuiltinCatalogCache = {
  keys: string[];
  kinds: Record<string, TranslationKeyKind>;
  builtins: Record<BuiltInLocale, Record<string, string>>;
};

let catalogCache: BuiltinCatalogCache | null = null;

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-translations.json");
  }
  return STORE_FILE;
}

function getLocalesDir(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-locales");
  }
  return LOCALES_DIR;
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export function sourceHasText(key: string): boolean {
  const catalog = getBuiltinCatalog();
  return Boolean(
    (catalog.builtins.en[key] || "").trim() ||
      (catalog.builtins.ar[key] || "").trim() ||
      (catalog.builtins.tr[key] || "").trim() ||
      (catalog.builtins.fr[key] || "").trim() ||
      isEmailTemplateI18nKey(key)
  );
}

export function getBuiltinCatalog(): BuiltinCatalogCache {
  if (catalogCache) return catalogCache;
  const arFlat = flattenDictionary(ar);
  const enFlat = flattenDictionary(en);
  const trFlat = flattenDictionary(tr);
  const frFlat = flattenDictionary(fr);
  const email = getEmailI18nSeedFlat();
  const keySet = new Set([
    ...Object.keys(arFlat.values),
    ...Object.keys(enFlat.values),
    ...Object.keys(trFlat.values),
    ...Object.keys(frFlat.values),
    ...email.keys,
  ]);
  const keys = Array.from(keySet).sort();
  const kinds: Record<string, TranslationKeyKind> = {
    ...frFlat.kinds,
    ...trFlat.kinds,
    ...enFlat.kinds,
    ...arFlat.kinds,
  };
  for (const key of email.keys) kinds[key] = "string";
  catalogCache = {
    keys,
    kinds,
    builtins: {
      ar: { ...arFlat.values, ...email.ar },
      en: { ...enFlat.values, ...email.en },
      tr: { ...trFlat.values, ...email.tr },
      fr: { ...frFlat.values, ...email.en },
    },
  };
  return catalogCache;
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreFile>;
    const store = emptyStore();
    if (parsed.overrides && typeof parsed.overrides === "object") {
      for (const loc of ["ar", "en", "tr"] as const) {
        const map = parsed.overrides[loc];
        if (map && typeof map === "object") store.overrides[loc] = map;
      }
    }
    if (Array.isArray(parsed.languages)) {
      store.languages = parsed.languages.filter(
        (l): l is CustomLanguage =>
          Boolean(l && typeof l.code === "string" && isValidLangCode(l.code))
      );
    }
    if (parsed.values && typeof parsed.values === "object") {
      store.values = parsed.values;
    }
    store.updatedAt = parsed.updatedAt;
    return store;
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  store.updatedAt = new Date().toISOString();
  const file = getStoreFile();
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(store, null, 2));
  await writeLocaleDumps(store);
}

async function writeLocaleDumps(store: StoreFile): Promise<void> {
  try {
    const dir = getLocalesDir();
    await ensureDir(dir);
    const catalog = getBuiltinCatalog();
    for (const loc of ["ar", "en", "tr"] as const) {
      const merged = { ...catalog.builtins[loc], ...(store.overrides[loc] || {}) };
      await fs.writeFile(
        path.join(dir, `${loc}.json`),
        JSON.stringify(merged, null, 2)
      );
    }
    for (const lang of store.languages) {
      await fs.writeFile(
        path.join(dir, `${lang.code}.json`),
        JSON.stringify(store.values[lang.code] || {}, null, 2)
      );
    }
  } catch {
    /* dumps are convenience only */
  }
}

export async function listRegisteredLocales(): Promise<RegisteredLocale[]> {
  const store = await readStore();
  return [
    ...BUILTIN_LOCALE_META,
    ...store.languages.map((l) => ({
      code: l.code,
      name: l.name,
      nativeName: l.nativeName,
      dir: l.dir,
      builtin: false,
      sourceLocale: l.sourceLocale,
    })),
  ];
}

export function mergeBuiltinValues(
  locale: BuiltInLocale,
  overrides?: Record<string, string>
): Record<string, string> {
  const catalog = getBuiltinCatalog();
  return { ...catalog.builtins[locale], ...(overrides || {}) };
}

export async function getPublicTranslationsPayload() {
  const store = await readStore();
  const locales = await listRegisteredLocales();
  return {
    locales,
    overrides: {
      ar: store.overrides.ar || {},
      en: store.overrides.en || {},
      tr: store.overrides.tr || {},
    },
    values: store.values,
    updatedAt: store.updatedAt || null,
  };
}

export type TranslationRow = {
  key: string;
  scope: TranslationScope;
  kind: TranslationKeyKind;
  values: Record<string, string>;
  missing: string[];
};

export async function getTranslationCatalog() {
  const store = await readStore();
  const catalog = getBuiltinCatalog();
  const locales = await listRegisteredLocales();
  const localeCodes = locales.map((l) => l.code);

  const extra = await readExtraEmailI18nKeys();
  const extraKeys = Object.keys(extra).filter((key) => !catalog.keys.includes(key));
  const allKeys = [...catalog.keys, ...extraKeys].sort();

  const rows: TranslationRow[] = allKeys.map((key) => {
    const values: Record<string, string> = {};
    for (const loc of ["ar", "en", "tr"] as const) {
      const extraVal = loc === "ar" || loc === "en" ? extra[key]?.[loc] || "" : "";
      values[loc] = (
        store.overrides[loc]?.[key] ??
        catalog.builtins[loc][key] ??
        extraVal
      ).trim();
    }
    for (const lang of store.languages) {
      values[lang.code] = (store.values[lang.code]?.[key] ?? "").trim();
    }
    const missing = localeCodes.filter((code) => {
      if (values[code]) return false;
      if (code === "ar" || code === "en" || code === "tr") return true;
      return sourceHasText(key);
    });
    return {
      key,
      scope: scopeForKey(key),
      kind: catalog.kinds[key] || "string",
      values,
      missing,
    };
  });

  const site = rows.filter((r) => r.scope === "site");
  const admin = rows.filter((r) => r.scope === "admin");
  const languageStats: Record<string, LanguageProgress> = {};
  for (const loc of locales) {
    if (loc.builtin) continue;
    const translatable = catalog.keys.filter((key) => sourceHasText(key));
    const filled = translatable.filter((key) =>
      Boolean((store.values[loc.code]?.[key] || "").trim())
    ).length;
    languageStats[loc.code] = {
      code: loc.code,
      filled,
      total: translatable.length,
      missing: translatable.length - filled,
    };
  }

  return {
    locales,
    rows,
    languageStats,
    counts: {
      total: rows.length,
      site: site.length,
      admin: admin.length,
      missing: rows.filter((r) => r.missing.length > 0).length,
    },
    updatedAt: store.updatedAt || null,
  };
}

export type LanguageProgress = {
  code: string;
  filled: number;
  total: number;
  missing: number;
};

export async function getLanguageProgress(
  code: string
): Promise<LanguageProgress> {
  const store = await readStore();
  const catalog = getBuiltinCatalog();
  const extra = await readExtraEmailI18nKeys();
  const extraKeys = Object.keys(extra).filter((key) => !catalog.keys.includes(key));
  const values = store.values[normalizeLangCode(code)] || {};
  const translatable = [...catalog.keys, ...extraKeys].filter((key) => sourceHasText(key));
  const filled = translatable.filter((key) => Boolean((values[key] || "").trim()))
    .length;
  return {
    code: normalizeLangCode(code),
    filled,
    total: translatable.length,
    missing: translatable.length - filled,
  };
}

export async function saveTranslationValues(
  locale: string,
  updates: Record<string, string>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const code = normalizeLangCode(locale);
  if (!code) return { ok: false, error: "رمز اللغة مطلوب." };
  const store = await readStore();
  const catalog = getBuiltinCatalog();
  const extra = await readExtraEmailI18nKeys();
  const allowed = new Set([...catalog.keys, ...Object.keys(extra)]);
  const cleaned: Record<string, string> = {};
  for (const [key, raw] of Object.entries(updates)) {
    if (!allowed.has(key) && !isEmailTemplateI18nKey(key)) continue;
    cleaned[key] = String(raw ?? "");
  }
  if (!Object.keys(cleaned).length) {
    return { ok: false, error: "لا توجد مفاتيح صالحة للحفظ." };
  }

  if (isBuiltInLocale(code)) {
    store.overrides[code] = { ...(store.overrides[code] || {}), ...cleaned };
  } else {
    const exists = store.languages.some((l) => l.code === code);
    if (!exists) return { ok: false, error: "اللغة غير مسجّلة." };
    store.values[code] = { ...(store.values[code] || {}), ...cleaned };
  }
  await writeStore(store);
  return { ok: true };
}

export async function addCustomLanguage(input: {
  code: string;
  name: string;
  nativeName: string;
  dir?: "rtl" | "ltr";
  sourceLocale?: "ar" | "en";
}): Promise<
  | { ok: true; language: CustomLanguage; keyCount: number }
  | { ok: false; error: string }
> {
  const code = normalizeLangCode(input.code);
  if (!isValidLangCode(code)) {
    return {
      ok: false,
      error: "رمز اللغة غير صالح. استخدم مثل fr أو de أو pt-br.",
    };
  }
  if (isBuiltInLocale(code)) {
    return { ok: false, error: "هذه اللغة موجودة مسبقاً (عربية / إنجليزية / تركية)." };
  }
  const name = input.name.trim();
  const nativeName = input.nativeName.trim() || name;
  if (!name) return { ok: false, error: "اسم اللغة مطلوب." };
  const sourceLocale = input.sourceLocale === "ar" ? "ar" : "en";
  const dir = input.dir === "rtl" || input.dir === "ltr" ? input.dir : undefined;

  const store = await readStore();
  if (store.languages.some((l) => l.code === code)) {
    return { ok: false, error: "هذه اللغة مضافة مسبقاً." };
  }
  const language: CustomLanguage = {
    code,
    name,
    nativeName,
    dir: dir || defaultDirForCode(code),
    sourceLocale,
  };
  store.languages.push(language);
  store.values[code] = store.values[code] || {};
  await writeStore(store);
  return { ok: true, language, keyCount: getBuiltinCatalog().keys.length };
}

export async function getLanguageBatch(
  code: string,
  sourceLocale: "ar" | "en",
  offset: number,
  limit: number,
  scope: TranslationScope | "all",
  missingOnly = true
) {
  const store = await readStore();
  const catalog = getBuiltinCatalog();
  const extra = await readExtraEmailI18nKeys();
  const existing = store.values[normalizeLangCode(code)] || {};
  const extraKeys = Object.keys(extra).filter((key) => !catalog.keys.includes(key));
  const allKeys = [...catalog.keys, ...extraKeys];
  const scoped = allKeys.filter((key) =>
    scope === "all" ? true : scopeForKey(key) === scope
  );
  const keys = missingOnly
    ? scoped.filter(
        (key) => sourceHasText(key) && !(existing[key] || "").trim()
      )
    : scoped;
  const slice = keys.slice(
    Math.max(0, offset),
    Math.max(0, offset) + Math.max(1, limit)
  );
  const sourceMap = mergeBuiltinValues(
    sourceLocale,
    store.overrides[sourceLocale]
  );
  const entries = slice.map((key) => ({
    key,
    text: sourceMap[key] || extra[key]?.[sourceLocale] || extra[key]?.ar || "",
  }));
  const filled = scoped.length - keys.length;
  return {
    keys,
    entries,
    total: scoped.length,
    remaining: keys.length,
    filled,
    offset: Math.max(0, offset),
    limit: Math.max(1, limit),
  };
}

export function getBuiltinDictionary(locale: BuiltInLocale): Dictionary {
  if (locale === "ar") return ar;
  if (locale === "tr") return tr;
  return en;
}

export function hydrateDictionary(
  locale: string,
  overrides: Record<string, string>,
  fallback: BuiltInLocale = "en"
): Dictionary {
  const base = getBuiltinDictionary(
    isBuiltInLocale(locale) ? locale : fallback
  );
  return applyFlatToDictionary(base, overrides);
}

export async function getCustomLanguage(code: string): Promise<CustomLanguage | null> {
  const store = await readStore();
  return store.languages.find((l) => l.code === normalizeLangCode(code)) || null;
}
