export const DEFAULT_POCKETBASE_URL = "http://127.0.0.1:8090";
export const POCKETBASE_PUBLIC_URL = "https://pocketbase.lonaliza.com";
export const POCKETBASE_ADMIN_UI_URL = `${POCKETBASE_PUBLIC_URL}/_/`;
export const SITE_PUBLIC_URL = "https://lonaliza.com";
export const POCKETBASE_APP_NAME = "الريان للسياحة / Alrayyan Tourism";
export const POCKETBASE_EXPECTED_VERSION = "0.30.1";

/** Public site origin for OAuth. Never localhost / http. */
export function resolveSitePublicUrl(raw?: string): string {
  const trimmed = (raw || "").trim().replace(/\/$/, "");
  if (
    !trimmed ||
    /localhost|127\.0\.0\.1/i.test(trimmed) ||
    !/^https:\/\//i.test(trimmed)
  ) {
    return SITE_PUBLIC_URL;
  }
  return trimmed;
}

export const GOOGLE_REDIRECT_URIS = [
  `${SITE_PUBLIC_URL}/api/auth/callback`,
  `${POCKETBASE_PUBLIC_URL}/api/oauth2-redirect`,
] as const;

export const PB_SUPERUSER_COOKIE = "pb_superuser";
/** PocketBase 0.30 admin UI LocalAuthStore key (see `/_/assets/index-*.js`). */
export const PB_SUPERUSER_STORAGE_KEY = "__pb_superuser_auth__";
export const OAUTH_VERIFIER_COOKIE = "alrayyan_oauth_verifier";
export const OAUTH_NEXT_COOKIE = "alrayyan_oauth_next";

/** Browser-facing PocketBase URL. Never derived from Host / NEXT_PUBLIC_SITE_URL. */
export function pocketbasePublicHref(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${POCKETBASE_PUBLIC_URL}${normalized}`;
}
