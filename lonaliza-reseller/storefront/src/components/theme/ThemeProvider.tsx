"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_ARABIC_FONT_ID } from "@/lib/fonts/arabic-catalog";
import { DEFAULT_LATIN_FONT_ID } from "@/lib/fonts/latin-catalog";
import { loadFont, loadLatinFont } from "@/lib/fonts/load-font";
import {
  applyBrandTheme,
  BRAND_THEME_REV_KEY,
  BRAND_THEME_UPDATED_EVENT,
  factoryTheme,
  type BrandTheme,
} from "@/lib/theme/tokens";

function defaultTheme(): BrandTheme {
  return factoryTheme();
}

function isBrandTheme(value: unknown): value is BrandTheme {
  if (!value || typeof value !== "object") return false;
  const rec = value as Partial<BrandTheme>;
  return Boolean(rec.colors && rec.presetId);
}

const ThemeContext = createContext<BrandTheme>(defaultTheme());

export function useBrandTheme(): BrandTheme {
  return useContext(ThemeContext);
}

export default function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: BrandTheme;
}) {
  const [theme, setTheme] = useState<BrandTheme>(initialTheme || defaultTheme());

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/public-theme?v=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && data.theme) {
          setTheme(data.theme as BrandTheme);
        }
      } catch {
        /* keep defaults */
      }
    };

    void load();

    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<BrandTheme>).detail;
      if (detail) setTheme(detail);
      else void load();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type !== "themeUpdate") return;
      if (isBrandTheme(data.brandTheme)) {
        setTheme(data.brandTheme);
        return;
      }
      void load();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === BRAND_THEME_REV_KEY) void load();
    };

    window.addEventListener(BRAND_THEME_UPDATED_EVENT, onUpdate);
    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener(BRAND_THEME_UPDATED_EVENT, onUpdate);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    applyBrandTheme(theme);
    if (theme.arabicFontId && theme.arabicFontId !== DEFAULT_ARABIC_FONT_ID) {
      loadFont(theme.arabicFontId);
    }
    if (theme.latinFontId && theme.latinFontId !== DEFAULT_LATIN_FONT_ID) {
      loadLatinFont(theme.latinFontId);
    }
  }, [theme]);

  const value = useMemo(() => theme, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
