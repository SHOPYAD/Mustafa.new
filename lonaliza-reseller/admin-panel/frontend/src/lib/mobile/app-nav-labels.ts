import type { Dictionary, Locale } from "@/lib/i18n/types";
import ar from "@/lib/i18n/dictionaries/ar";
import en from "@/lib/i18n/dictionaries/en";
import tr from "@/lib/i18n/dictionaries/tr";
import fr from "@/lib/i18n/dictionaries/fr";

export type AppNavRole = "home" | "wallet" | "reels" | "me" | "more";

export function appNavTitles(t: Dictionary): Record<AppNavRole, string> {
  return {
    home: t.appNav.home,
    wallet: t.appNav.wallet,
    reels: t.appNav.reels,
    me: t.appNav.me,
    more: t.appNav.more,
  };
}

export function interpolateChrome(template: string, value: string): string {
  return template.split("{0}").join(value);
}

export function builtinDictionary(locale: string): Dictionary {
  if (locale === "en") return en;
  if (locale === "tr") return tr;
  if (locale === "fr") return fr;
  return ar;
}

export function documentLocale(): Locale {
  if (typeof document === "undefined") return "ar";
  const lang = (document.documentElement.lang || "").toLowerCase();
  if (lang === "en" || lang === "tr" || lang === "fr" || lang === "ar") return lang;
  return "ar";
}
