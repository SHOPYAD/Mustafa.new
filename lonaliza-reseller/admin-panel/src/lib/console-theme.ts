export const CONSOLE_THEME_STORAGE_KEY = "lonaliza_console_theme_v1";

export type ConsoleTheme = "light" | "dark";

export function readStoredConsoleTheme(): ConsoleTheme {
  try {
    const stored = localStorage.getItem(CONSOLE_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function persistConsoleTheme(theme: ConsoleTheme) {
  try {
    localStorage.setItem(CONSOLE_THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function applyConsoleRoute(theme: ConsoleTheme) {
  const html = document.documentElement;
  html.dataset.consoleRoute = "true";
  html.dataset.consolePreset = "lonaliza-royal";
  html.dataset.consoleTheme = theme;
  html.classList.toggle("dark", theme === "dark");
  html.style.colorScheme = theme;

  const root = document.getElementById("console-root");
  if (root) {
    root.dataset.consoleTheme = theme;
    root.classList.toggle("dark", theme === "dark");
  }
}

export function clearConsoleRoute() {
  const html = document.documentElement;
  delete html.dataset.consoleRoute;
  delete html.dataset.consolePreset;
  delete html.dataset.consoleTheme;
  html.classList.remove("dark");
  html.style.colorScheme = "";

  const root = document.getElementById("console-root");
  if (root) {
    delete root.dataset.consoleTheme;
    root.classList.remove("dark");
  }
}
