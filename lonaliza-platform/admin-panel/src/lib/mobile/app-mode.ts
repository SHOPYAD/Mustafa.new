/**
 * Lonaliza Enterprise Mobile App Mode Detector
 * Handles seamless detection of App Shell mode across Server and Client.
 */

export const APP_SHELL_COOKIE = "lonaliza_app_shell";
export const APP_SHELL_HEADER = "x-lonaliza-app";

export function isAppModeQuery(urlOrSearch: string): boolean {
  try {
    const search = urlOrSearch.includes("?")
      ? urlOrSearch.slice(urlOrSearch.indexOf("?"))
      : urlOrSearch;
    const params = new URLSearchParams(search);
    return (
      params.get("app") === "1" ||
      params.get("view_mode") === "app" ||
      params.get("mobileBridge") === "1" ||
      params.get("shell") === "1"
    );
  } catch {
    return false;
  }
}

/**
 * Client-side check if current window is running inside the Lonaliza native shell.
 */
export function isClientAppMode(): boolean {
  if (typeof window === "undefined") return false;
  if (isAppModeQuery(window.location.search)) return true;
  if (document.cookie.includes(`${APP_SHELL_COOKIE}=1`)) return true;
  if (navigator.userAgent.includes("LonalizaApp")) return true;
  return false;
}

/** Keep app-shell query on client routes so the native WebView stays in app mode. */
export function withAppParam(path: string): string {
  try {
    const url = new URL(path, "https://lonaliza.com");
    if (!url.searchParams.has("app")) url.searchParams.set("app", "1");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return path;
  }
}
