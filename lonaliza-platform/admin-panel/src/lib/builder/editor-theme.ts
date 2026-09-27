/* Agent A: editor chrome only */

export const EDITOR_CHROME_THEME_KEY = "alrayyan-builder:chrome-theme";
export const ADMIN_THEME_STORAGE_KEY = "alrayyan_admin_theme";
export const EDITOR_CHROME_THEME_DATASET = "builderChromeTheme";

export type EditorChromeTheme = "light" | "dark";

function normalizeTheme(value: string | null): EditorChromeTheme | null {
  if (value === "light" || value === "day") return "light";
  if (value === "dark" || value === "night") return "dark";
  return null;
}

export function readEditorChromeTheme(): EditorChromeTheme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = normalizeTheme(window.localStorage.getItem(EDITOR_CHROME_THEME_KEY));
    if (stored) return stored;
    const admin = normalizeTheme(window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY));
    if (admin) return admin;
  } catch {
    /* quota / private mode */
  }
  return "light";
}

export function persistEditorChromeTheme(theme: EditorChromeTheme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EDITOR_CHROME_THEME_KEY, theme);
  } catch {
    /* quota */
  }
}

export function applyEditorChromeTheme(theme: EditorChromeTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset[EDITOR_CHROME_THEME_DATASET] = theme;
}

export function clearEditorChromeThemeAttr() {
  if (typeof document === "undefined") return;
  delete document.documentElement.dataset[EDITOR_CHROME_THEME_DATASET];
}

export function toggleEditorChromeTheme(current: EditorChromeTheme): EditorChromeTheme {
  return current === "dark" ? "light" : "dark";
}
