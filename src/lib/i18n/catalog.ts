import type { Dictionary } from "./types";

export const BUILTIN_LOCALES = ["ar", "en", "tr", "fr"] as const;
export type BuiltInLocale = (typeof BUILTIN_LOCALES)[number];

export const RTL_LANG_CODES = new Set([
  "ar",
  "fa",
  "he",
  "ur",
  "ps",
  "sd",
  "yi",
  "dv",
  "ku",
]);

export type TranslationScope = "site" | "admin";

export type RegisteredLocale = {
  code: string;
  name: string;
  nativeName: string;
  dir: "rtl" | "ltr";
  builtin: boolean;
  sourceLocale?: "ar" | "en";
};

export type TranslationKeyKind = "string" | "fn";

export const ADMIN_ROOTS = new Set([
  "admin",
  "ai",
  "editor",
  "builderAgent",
  "paymentsAdmin",
  "contactSettings",
  "integrations",
  "pocketbaseSettings",
  "menuVisibility",
  "pwa",
]);

export const BUILTIN_LOCALE_META: RegisteredLocale[] = [
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    builtin: true,
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    builtin: true,
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    dir: "ltr",
    builtin: true,
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    dir: "ltr",
    builtin: true,
  },
];

export function isBuiltInLocale(code: string): code is BuiltInLocale {
  return code === "ar" || code === "en" || code === "tr" || code === "fr";
}

export function scopeForKey(key: string): TranslationScope {
  const root = key.split(".")[0] || "";
  return ADMIN_ROOTS.has(root) ? "admin" : "site";
}

export function defaultDirForCode(code: string): "rtl" | "ltr" {
  const base = code.toLowerCase().split("-")[0] || "";
  return RTL_LANG_CODES.has(base) ? "rtl" : "ltr";
}

export function makeInterpolated(template: string, arity: number) {
  return (...args: unknown[]) => {
    let out = template;
    const n = Math.max(arity, args.length);
    for (let i = 0; i < n; i++) {
      out = out.split(`{${i}}`).join(String(args[i] ?? ""));
    }
    return out;
  };
}

export function flattenDictionary(
  dict: Dictionary
): { values: Record<string, string>; kinds: Record<string, TranslationKeyKind> } {
  const values: Record<string, string> = {};
  const kinds: Record<string, TranslationKeyKind> = {};

  const walk = (node: unknown, prefix: string) => {
    if (typeof node === "function") {
      const arity = node.length;
      const placeholders = Array.from({ length: Math.max(arity, 1) }, (_, i) => `{${i}}`);
      try {
        values[prefix] = String(node(...placeholders));
      } catch {
        values[prefix] = "";
      }
      kinds[prefix] = "fn";
      return;
    }
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        walk(v, prefix ? `${prefix}.${k}` : k);
      }
      return;
    }
    if (typeof node === "string") {
      values[prefix] = node;
      kinds[prefix] = "string";
    }
  };

  walk(dict, "");
  return { values, kinds };
}

export function applyFlatToDictionary(
  base: Dictionary,
  flat: Record<string, string>
): Dictionary {
  const walk = (node: unknown, prefix: string): unknown => {
    if (typeof node === "function") {
      const override = flat[prefix];
      if (override === undefined) return node;
      return makeInterpolated(override, node.length);
    }
    if (node && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        const path = prefix ? `${prefix}.${k}` : k;
        out[k] = walk(v, path);
      }
      return out;
    }
    if (typeof node === "string") {
      return flat[prefix] !== undefined ? flat[prefix] : node;
    }
    return node;
  };
  return walk(base, "") as Dictionary;
}

export function normalizeLangCode(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function isValidLangCode(code: string): boolean {
  return /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(code);
}
