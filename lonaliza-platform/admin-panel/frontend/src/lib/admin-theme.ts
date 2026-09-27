export const ADMIN_THEME_STORAGE_KEY = "lonaliza_admin_theme_v3";
export const LEGACY_ADMIN_THEME_STORAGE_KEY = "lonaliza_admin_theme_v3";

export type AdminTheme = "light" | "dark";

export function readStoredAdminTheme(): AdminTheme {
  try {
    const stored =
      localStorage.getItem(ADMIN_THEME_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_ADMIN_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "dark";
}

function markAdminRoute(html: HTMLElement, on: boolean) {
  if (on) html.dataset.adminRoute = "true";
  else delete html.dataset.adminRoute;
}

function paintScope(scope: HTMLElement | null, theme: AdminTheme) {
  if (!scope) return;
  scope.dataset.adminTheme = theme;
  scope.classList.toggle("dark", theme === "dark");
}

export function applyAdminTheme(theme: AdminTheme) {
  const html = document.documentElement;
  markAdminRoute(html, true);
  html.dataset.adminColorScheme = theme;
  html.classList.toggle("dark", theme === "dark");
  html.style.colorScheme = theme;
  paintScope(document.getElementById("admin-root"), theme);
  document.querySelectorAll<HTMLElement>(".admin-app-scope").forEach((el) => {
    paintScope(el, theme);
  });
}

export function persistAdminTheme(theme: AdminTheme) {
  try {
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
    localStorage.setItem(LEGACY_ADMIN_THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function clearAdminTheme() {
  const html = document.documentElement;
  markAdminRoute(html, false);
  delete html.dataset.adminTheme;
  delete html.dataset.adminColorScheme;
  html.classList.remove("dark");
  html.style.colorScheme = "";
  const scope = document.getElementById("admin-root");
  if (scope) {
    delete scope.dataset.adminTheme;
    scope.classList.remove("dark");
  }
}
