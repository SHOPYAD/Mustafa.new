/**
 * Bidirectional bottom-nav active-state for the native WebView shell.
 * Isolated from product UI — Flutter mirrors the same rules in
 * Lonalizamobilapp/lib/shell/bottom_nav_sync.dart
 */

export const APP_MENU_PATH = "/menu";

export type BottomNavRole = "home" | "wallet" | "community" | "account" | "more" | "none";

const MORE_PREFIXES = [
  "/menu",
  "/flights",
  "/hotels",
  "/cars",
  "/transfers",
  "/holidays",
  "/visa",
  "/packages",
  "/package",
  "/tours",
  "/vip-tours",
  "/uae-tours",
  "/search",
  "/terms",
  "/privacy",
  "/gdpr",
  "/about",
  "/contact",
  "/ai-chat",
  "/blog",
  "/gift-cards",
  "/invoice",
] as const;

export function parseAppLocation(url: string): { pathname: string; search: string } {
  const raw = String(url || "").trim();
  if (!raw) return { pathname: "/", search: "" };
  try {
    const u = raw.startsWith("http://") || raw.startsWith("https://")
      ? new URL(raw)
      : new URL(raw, "https://lonaliza.com");
    const pathname = u.pathname.replace(/\/+$/, "") || "/";
    return { pathname, search: u.search };
  } catch {
    return { pathname: "/", search: "" };
  }
}

/** Home is the site root only — `/` or `/?app=1`, never a service path. */
export function isHomeRoot(url: string): boolean {
  return parseAppLocation(url).pathname === "/";
}

export function isMenuPath(url: string): boolean {
  return parseAppLocation(url).pathname === APP_MENU_PATH;
}

function isWalletLocation(pathname: string, search: string): boolean {
  if (pathname === "/wallet" || pathname.startsWith("/wallet/")) return true;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return params.get("tab") === "wallet";
}

function isCommunityPath(pathname: string): boolean {
  return pathname === "/community" || pathname.startsWith("/community/");
}

function isAccountPath(pathname: string): boolean {
  return pathname === "/account" || pathname.startsWith("/account/");
}

function isMorePath(pathname: string): boolean {
  if (pathname.startsWith("/p/")) return true;
  return MORE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Classify a *tab config* path (what the bar item points at). */
export function roleForTabPath(path: string): BottomNavRole {
  const { pathname, search } = parseAppLocation(path);
  if (pathname === "/" || pathname === "") return "home";
  if (pathname === APP_MENU_PATH) return "more";
  if (isWalletLocation(pathname, search)) return "wallet";
  if (isCommunityPath(pathname)) return "community";
  if (isAccountPath(pathname)) return "account";
  return "none";
}

/** Classify the live WebView URL / Next.js path. */
export function roleForUrl(url: string): BottomNavRole {
  const { pathname, search } = parseAppLocation(url);
  if (pathname === "/") return "home";
  if (isWalletLocation(pathname, search)) return "wallet";
  if (isCommunityPath(pathname)) return "community";
  if (isAccountPath(pathname)) return "account";
  if (isMorePath(pathname)) return "more";
  return "none";
}

/**
 * Index of the matching bottom tab, or -1 when no root tab should highlight.
 */
export function activeTabIndex(url: string, tabPaths: string[]): number {
  const role = roleForUrl(url);
  if (role === "none") return -1;
  const idx = tabPaths.findIndex((path) => roleForTabPath(path) === role);
  return idx >= 0 ? idx : -1;
}
