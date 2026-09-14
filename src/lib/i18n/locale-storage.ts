export const SITE_LOCALE_STORAGE_KEY = "alrayyan_locale";
export const ADMIN_LOCALE_STORAGE_KEY = "alrayyan_admin_locale";
/** Set when the traveler (or URL) explicitly chooses a language — not browser sniffing. */
export const SITE_LOCALE_EXPLICIT_KEY = "alrayyan_locale_explicit";
export const ADMIN_LOCALE_EXPLICIT_KEY = "alrayyan_admin_locale_explicit";
/** Previous OKTRAVEL locale key — migrated once into alrayyan_locale. */
const LEGACY_SITE_KEY = "oktravel_locale";

export type LocaleScope = "site" | "admin";

export function localeStorageKey(scope: LocaleScope): string {
  return scope === "admin" ? ADMIN_LOCALE_STORAGE_KEY : SITE_LOCALE_STORAGE_KEY;
}

export function localeExplicitKey(scope: LocaleScope): string {
  return scope === "admin" ? ADMIN_LOCALE_EXPLICIT_KEY : SITE_LOCALE_EXPLICIT_KEY;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("=") || "");
  }
  return null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=31536000`;
}

export function persistLocale(
  scope: LocaleScope,
  locale: string,
  options?: { explicit?: boolean }
) {
  if (typeof window === "undefined") return;
  const key = localeStorageKey(scope);
  try {
    localStorage.setItem(key, locale);
    if (options?.explicit !== false) {
      localStorage.setItem(localeExplicitKey(scope), "1");
    }
  } catch {
    /* ignore quota */
  }
  writeCookie(key, locale);
  if (options?.explicit !== false) {
    writeCookie(localeExplicitKey(scope), "1");
  }
}

export function hasExplicitLocale(scope: LocaleScope): boolean {
  if (typeof window === "undefined") return false;
  try {
    const flag = localStorage.getItem(localeExplicitKey(scope)) || readCookie(localeExplicitKey(scope));
    return flag === "1" || flag === "true";
  } catch {
    return false;
  }
}

function isAppShellClient(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (typeof document !== "undefined" && document.cookie.includes("lonaliza_app_shell=1")) return true;
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("LonalizaApp")) return true;
    const search = window.location.search || "";
    return search.includes("app=1") || search.includes("view_mode=app") || search.includes("mobileBridge=1");
  } catch {
    return false;
  }
}

/**
 * Detects the client's device/browser language preference intelligently.
 * Supports Arabic, French, Turkish, and English.
 */
export function detectBrowserLocale(): "ar" | "en" | "tr" | "fr" {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "ar";
  const navLanguages =
    navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const lang of navLanguages) {
    if (!lang) continue;
    const l = lang.toLowerCase().trim();
    if (l.startsWith("ar")) return "ar";
    if (l.startsWith("fr")) return "fr";
    if (l.startsWith("tr")) return "tr";
    if (l.startsWith("en")) return "en";
  }
  return "ar";
}

export function loadLocale(scope: LocaleScope): string {
  if (typeof window === "undefined") return "ar";
  const key = localeStorageKey(scope);
  try {
    const stored = localStorage.getItem(key) || readCookie(key);
    const explicit = hasExplicitLocale(scope);
    const appShell = isAppShellClient();
    // Native app chrome is Arabic by default. Ignore browser-sniffed English so /menu
    // follows the shell locale until the traveler picks a language in the picker.
    if (stored && (explicit || !appShell)) return stored;
    if (appShell) return "ar";
    if (scope === "site") {
      const legacy = localStorage.getItem(LEGACY_SITE_KEY) || readCookie(LEGACY_SITE_KEY);
      if (legacy) {
        persistLocale("site", legacy, { explicit: true });
        return legacy;
      }
      const detected = detectBrowserLocale();
      persistLocale("site", detected, { explicit: false });
      return detected;
    }
  } catch {
    /* ignore */
  }
  return "ar";
}

export function isAdminPath(pathname: string | null | undefined): boolean {
  const path = pathname || "";
  return path === "/admin" || path.startsWith("/admin/");
}
