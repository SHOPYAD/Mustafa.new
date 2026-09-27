"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "./types";
import ar from "./dictionaries/ar";
import en from "./dictionaries/en";
import tr from "./dictionaries/tr";
import fr from "./dictionaries/fr";
import {
  applyFlatToDictionary,
  BUILTIN_LOCALE_META,
  isBuiltInLocale,
  type RegisteredLocale,
} from "./catalog";
import {
  isAdminPath,
  loadLocale,
  localeStorageKey,
  persistLocale,
  type LocaleScope,
} from "./locale-storage";
import { appNavTitles } from "@/lib/mobile/app-nav-labels";
import { syncNativeLocale } from "@/lib/mobile/webview-bridge";
const builtinDictionaries: Record<"ar" | "en" | "tr" | "fr", Dictionary> = {
  ar,
  en,
  tr,
  fr,
};

type LocaleContextType = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
  locales: RegisteredLocale[];
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  reloadTranslations: () => Promise<void>;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

function asLocale(value: string): Locale {
  return value as Locale;
}

function lookupDir(code: string, locales: RegisteredLocale[]): "rtl" | "ltr" {
  const found = locales.find((l) => l.code === code);
  if (found) return found.dir;
  return code === "ar" ? "rtl" : "ltr";
}

function applyDocumentLocale(locale: string, dir: "rtl" | "ltr") {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "ar" as Locale,
      dir: "rtl" as const,
      t: ar,
      locales: BUILTIN_LOCALE_META,
      setLocale: () => {},
      toggleLocale: () => {},
      reloadTranslations: async () => {},
    };
  }
  return ctx;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scope: LocaleScope = isAdminPath(pathname) ? "admin" : "site";
  const scopeRef = useRef<LocaleScope>(scope);
  scopeRef.current = scope;
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [hydrated, setHydrated] = useState(false);
  const [locales, setLocales] = useState<RegisteredLocale[]>(BUILTIN_LOCALE_META);
  const [dicts, setDicts] = useState<Record<string, Dictionary>>(builtinDictionaries);

  const applyPayload = useCallback(
    (payload: {
      locales?: RegisteredLocale[];
      overrides?: Partial<Record<Locale, Record<string, string>>>;
      values?: Record<string, Record<string, string>>;
    }) => {
      const nextLocales = Array.isArray(payload.locales) && payload.locales.length
        ? payload.locales
        : BUILTIN_LOCALE_META;
      setLocales(nextLocales);

      const next: Record<string, Dictionary> = {
        ar: applyFlatToDictionary(ar, payload.overrides?.ar || {}),
        en: applyFlatToDictionary(en, payload.overrides?.en || {}),
        tr: applyFlatToDictionary(tr, payload.overrides?.tr || {}),
        fr: applyFlatToDictionary(fr, payload.overrides?.fr || {}),
      };
      for (const meta of nextLocales) {
        if (isBuiltInLocale(meta.code)) continue;
        const fallback = meta.sourceLocale === "ar" ? next.ar : next.en;
        next[meta.code] = applyFlatToDictionary(
          fallback,
          payload.values?.[meta.code] || {}
        );
      }
      setDicts(next);
    },
    []
  );

  const reloadTranslations = useCallback(async () => {
    try {
      const res = await fetch("/api/translations", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        locales?: RegisteredLocale[];
        overrides?: Partial<Record<Locale, Record<string, string>>>;
        values?: Record<string, Record<string, string>>;
      };
      if (data?.ok) applyPayload(data);
    } catch {
      /* keep compiled dictionaries */
    }
  }, [applyPayload]);

  useEffect(() => {
    void reloadTranslations();
  }, [reloadTranslations]);

  useEffect(() => {
    const params =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const urlLocale = params?.get("locale") || params?.get("lang") || params?.get("hl") || "";
    const isSupported =
      urlLocale === "ar" || urlLocale === "en" || urlLocale === "tr" || urlLocale === "fr";
    if (isSupported) {
      setLocaleState(urlLocale as Locale);
      persistLocale(scopeRef.current, urlLocale as Locale, { explicit: true });
    } else {
      setLocaleState(asLocale(loadLocale(scope)));
    }
    setHydrated(true);
  }, [scope]);

  // Smart Iframe Sync: listen to parent window language changes
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "SET_LOCALE" && typeof e.data?.locale === "string") {
        const next = e.data.locale;
        if (next === "ar" || next === "en" || next === "tr" || next === "fr") {
          setLocaleState(next as Locale);
          persistLocale(scopeRef.current, next as Locale, { explicit: true });
          applyDocumentLocale(next as Locale, lookupDir(next as Locale, locales));
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [locales]);

  useEffect(() => {
    applyDocumentLocale(locale, lookupDir(locale, locales));
  }, [locale, locales]);

  useEffect(() => {
    if (!hydrated) return;
    const dict = dicts[locale] || dicts.ar || ar;
    syncNativeLocale({
      locale,
      dir: lookupDir(locale, locales),
      titles: appNavTitles(dict),
      chrome: {
        messageFrom: dict.appChrome.messageFrom,
        newMessage: dict.appChrome.newMessage,
      },
    });
  }, [hydrated, locale, locales, dicts]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== localeStorageKey(scopeRef.current)) return;
      const next = String(e.newValue || "").trim();
      if (next === "ar" || next === "en" || next === "tr" || next === "fr") {
        setLocaleState(next as Locale);
        applyDocumentLocale(next, lookupDir(next, locales));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [locales]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(scopeRef.current, next, { explicit: true });
    applyDocumentLocale(next, lookupDir(next, locales));

    // Smart Iframe Broadcast: sync all embedded iframes in the document immediately
    if (typeof document !== "undefined") {
      document.querySelectorAll("iframe").forEach((frame) => {
        try {
          frame.contentWindow?.postMessage({ type: "SET_LOCALE", locale: next }, "*");
        } catch {}
      });
    }
  }, [locales]);

  const toggleLocale = useCallback(() => {
    const codes = locales.map((l) => l.code);
    const idx = codes.indexOf(locale);
    const next = codes[(idx + 1 + codes.length) % codes.length] || "ar";
    setLocale(asLocale(next));
  }, [locale, locales, setLocale]);

  const value = useMemo<LocaleContextType>(
    () => ({
      locale,
      dir: lookupDir(locale, locales),
      t: dicts[locale] || dicts.ar || ar,
      locales,
      setLocale,
      toggleLocale,
      reloadTranslations,
    }),
    [locale, locales, dicts, setLocale, toggleLocale, reloadTranslations]
  );

  return (
    <LocaleContext.Provider value={value}>
      <div className={hydrated ? undefined : "locale-boot"}>{children}</div>
    </LocaleContext.Provider>
  );
}

/**
 * Pick bilingual/trilingual CMS field by locale.
 * TR falls back to AR (then EN) until dedicated Tr content exists.
 */
export function tContent(
  item: Record<string, unknown> | null | undefined,
  base: string,
  locale: Locale
): string {
  if (!item) return "";
  const arKey = `${base}Ar`;
  const enKey = `${base}En`;
  const trKey = `${base}Tr`;
  const arVal = String(item[arKey] || "");
  const enVal = String(item[enKey] || "");
  const trVal = String(item[trKey] || "");
  const baseVal = String(item[base] || "");

  if (locale === "ar") {
    return arVal || enVal || baseVal;
  }
  if (locale === "tr") {
    return trVal || arVal || enVal || baseVal;
  }
  return enVal || arVal || baseVal;
}

/** UI chrome strings with optional Turkish; defaults to EN when TR missing */
export function localeUi(
  locale: Locale,
  texts: { ar: string; en: string; tr?: string }
): string {
  if (locale === "ar") return texts.ar;
  if (locale === "tr") return texts.tr ?? texts.en;
  return texts.en;
}

export function dateLocaleTag(locale: Locale): string {
  if (locale === "ar") return "ar-AE";
  if (locale === "tr") return "tr-TR";
  if (locale === "en") return "en-GB";
  return String(locale);
}
