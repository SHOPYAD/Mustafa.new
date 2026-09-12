export const SITE_LOCALE_STORAGE_KEY = "alrayyan_locale";
export const ADMIN_LOCALE_STORAGE_KEY = "alrayyan_admin_locale";
/** Previous OKTRAVEL locale key — migrated once into alrayyan_locale. */
const LEGACY_SITE_KEY = "oktravel_locale";

export type LocaleScope = "site" | "admin";

export function localeStorageKey(scope: LocaleScope): string {
  return scope === "admin" ? ADMIN_LOCALE_STORAGE_KEY : SITE_LOCALE_STORAGE_KEY;
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

export function persistLocale(scope: LocaleScope, locale: string) {
  if (typeof window === "undefined") return;
  const key = localeStorageKey(scope);
  try {
    localStorage.setItem(key, locale);
  } catch {
    /* ignore quota */
  }
  writeCookie(key, locale);
}

export function loadLocale(scope: LocaleScope): string {
  if (typeof window === "undefined") return "ar";
  const key = localeStorageKey(scope);
  try {
    const stored = localStorage.getItem(key) || readCookie(key);
    if (stored) return stored;
    if (scope === "site") {
      const legacy = localStorage.getItem(LEGACY_SITE_KEY) || readCookie(LEGACY_SITE_KEY);
      if (legacy) {
        persistLocale("site", legacy);
        return legacy;
      }
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
