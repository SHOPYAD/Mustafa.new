"use client";

import React, { useEffect, useState } from "react";
import {
  getAdminThemeTokens,
  type AdminThemePresetId,
  type AdminThemeTokens,
} from "@/lib/theme/admin-presets";
import { readStoredThemeConfig, type AdminThemeConfig } from "@/lib/admin-theme-engine";
import { readStoredAdminFont, applyAdminFont } from "@/lib/theme/fonts-catalog";

export function AdminThemeEngine({ currentMode }: { currentMode: "light" | "dark" }) {
  const [tokens, setTokens] = useState<AdminThemeTokens | null>(null);

  useEffect(() => {
    const update = (forcedConfig?: AdminThemeConfig) => {
      const config = forcedConfig || readStoredThemeConfig();
      const activeTokens = getAdminThemeTokens(config.preset, config.mode || currentMode);
      setTokens(activeTokens);

      const fontId = config.fontFamily || readStoredAdminFont();
      applyAdminFont(fontId);
    };

    update();

    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<AdminThemeConfig>).detail;
      update(detail);
    };

    window.addEventListener("lonaliza:admin-theme-change", handleThemeChange);
    return () => window.removeEventListener("lonaliza:admin-theme-change", handleThemeChange);
  }, [currentMode]);

  if (!tokens) return null;

  const t = tokens;

  return (
    <style
      id="admin-active-theme-tokens"
      dangerouslySetInnerHTML={{
        __html: `
        :root,
        html,
        html.dark,
        html[data-admin-theme="light"],
        html[data-admin-theme="dark"],
        .admin-shell {
          --background: ${t.background} !important;
          --foreground: ${t.foreground} !important;
          --heading: ${t.heading} !important;
          --card: ${t.card} !important;
          --card-foreground: ${t.cardForeground} !important;
          --popover: ${t.popover} !important;
          --popover-foreground: ${t.popoverForeground} !important;
          --primary: ${t.primary} !important;
          --primary-foreground: ${t.primaryForeground} !important;
          --secondary: ${t.secondary} !important;
          --secondary-foreground: ${t.secondaryForeground} !important;
          --muted: ${t.muted} !important;
          --muted-foreground: ${t.mutedForeground} !important;
          --accent: ${t.accent} !important;
          --accent-foreground: ${t.accentForeground} !important;
          --destructive: ${t.destructive} !important;
          --destructive-foreground: ${t.destructiveForeground} !important;
          --border: ${t.border} !important;
          --input: ${t.input} !important;
          --ring: ${t.ring} !important;

          /* Physical geometry & radii tokens */
          --radius: ${t.radius} !important;
          --radius-card: ${t.radiusCard} !important;
          --radius-input: ${t.radiusInput} !important;
          --radius-button: ${t.radiusButton} !important;
          --radius-badge: ${t.radiusBadge} !important;

          /* Elevation & shadows */
          --theme-card-shadow: ${t.shadowCard} !important;
          --theme-button-shadow: ${t.shadowButton} !important;
          --theme-dropdown-shadow: ${t.shadowDropdown} !important;

          /* Admin Enterprise tokens compatibility */
          --admin-bg-base: ${t.background} !important;
          --admin-bg-surface: ${t.card} !important;
          --admin-bg-surface-2: ${t.muted} !important;
          --admin-text-primary: ${t.foreground} !important;
          --admin-text-muted: ${t.mutedForeground} !important;
          --admin-border-base: ${t.border} !important;
          --admin-accent: ${t.primary} !important;
          --admin-bg: ${t.background} !important;
          --admin-surface: ${t.card} !important;
          --admin-border: ${t.border} !important;
          --admin-text: ${t.foreground} !important;
          --admin-text-muted: ${t.mutedForeground} !important;
        }

        /* Enforce active font family globally */
        body,
        .admin-shell,
        button,
        input,
        select,
        textarea {
          font-family: var(--admin-font-family, 'Cairo', sans-serif) !important;
        }

        /* Glassmorphic elevation utility */
        .admin-card-glass {
          backdrop-filter: ${t.cardBackdropBlur || "none"} !important;
          border: ${t.cardBorder || `1px solid ${t.border}`} !important;
          box-shadow: ${t.shadowCard} !important;
        }

        /* Absolute Enforced Zero Scrollbars for all sliding tab strips */
        [data-tab-strip],
        .no-scrollbar,
        .scrollbar-none {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        [data-tab-strip]::-webkit-scrollbar,
        .no-scrollbar::-webkit-scrollbar,
        .scrollbar-none::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Enforce isolated crisp white text for intentionally dark banners */
        .admin-isolated-dark,
        [data-admin-isolated-dark="true"] {
          color: #ffffff !important;
        }
        .admin-isolated-dark h1,
        .admin-isolated-dark h2,
        .admin-isolated-dark h3,
        .admin-isolated-dark p,
        .admin-isolated-dark span {
          color: #ffffff !important;
        }
        .admin-isolated-dark p {
          color: #e2e8f0 !important;
        }

        /* Pure White Icons for Explicit Dark Surfaces and Dark Sidebar */
        :is(html.dark, html[data-admin-theme="dark"]) aside svg:not([class*="fill-amber"]):not([class*="text-amber-400"]),
        :is(html.dark, html[data-admin-theme="dark"]) .admin-shell aside svg:not([class*="fill-amber"]):not([class*="text-amber-400"]),
        .admin-isolated-dark svg:not([class*="fill-amber"]):not([class*="text-amber-400"]) {
          stroke: #ffffff !important;
          color: #ffffff !important;
        }
      `,
      }}
    />
  );
}
