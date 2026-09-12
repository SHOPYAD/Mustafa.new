export const ADMIN_THEME_STORAGE_KEY = "lonaliza_admin_theme";
export const LEGACY_ADMIN_THEME_STORAGE_KEY = "alrayyan_admin_theme";

export type AdminTheme = "light" | "dark";

export function readStoredAdminTheme(): AdminTheme {
  try {
    const stored = localStorage.getItem(ADMIN_THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_ADMIN_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

export function applyAdminTheme(theme: AdminTheme) {
  const root = document.documentElement;
  root.dataset.adminTheme = theme;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
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
  const root = document.documentElement;
  delete root.dataset.adminTheme;
  root.classList.remove("dark");
  root.style.colorScheme = "";
}
