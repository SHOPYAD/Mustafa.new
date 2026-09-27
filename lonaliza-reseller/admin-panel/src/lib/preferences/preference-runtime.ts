"use client";

import { PREFERENCE_REGISTRY, type PreferenceKey, type PreferenceValueMap } from "./preferences-config";
import type { ResolvedThemeMode } from "./theme";
import { applyThemeMode } from "./theme-utils";

export function applyPreference<K extends PreferenceKey>(
  key: K,
  value: PreferenceValueMap[K],
): ResolvedThemeMode | undefined {
  if (key === "theme_mode") {
    const resolved = applyThemeMode(value as PreferenceValueMap["theme_mode"]);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.adminColorScheme = resolved;
      document.documentElement.dataset.adminTheme = resolved;
      const root = document.getElementById("admin-root");
      if (root) {
        root.dataset.adminColorScheme = resolved;
        root.dataset.adminTheme = resolved;
        root.classList.toggle("dark", resolved === "dark");
      }
    }
    return resolved;
  }

  if (typeof document !== "undefined") {
    const attr = PREFERENCE_REGISTRY[key].attribute;
    document.documentElement.setAttribute(attr, String(value));
    const root = document.getElementById("admin-root");
    if (root) {
      root.setAttribute(attr, String(value));
    }
  }
  return undefined;
}
