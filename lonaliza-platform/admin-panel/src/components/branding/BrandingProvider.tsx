"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BRANDING_UPDATED_EVENT,
  DEFAULT_BRANDING,
  brandNameForLocale,
} from "@/data/branding";
import type { BrandingContent } from "@/types/branding";

const BrandingContext = createContext<BrandingContent>(DEFAULT_BRANDING);

export function useBranding(): BrandingContent {
  return useContext(BrandingContext);
}

export function useBrandName(locale: string): string {
  const branding = useBranding();
  return brandNameForLocale(branding, locale);
}

function applyBrandColors(colors: BrandingContent["colors"]) {
  const root = document.documentElement;
  root.style.setProperty("--brand-primary", colors.primary);
  root.style.setProperty("--brand-secondary", colors.secondary);
  root.style.setProperty("--brand-accent", colors.accent);
  root.style.setProperty("--brand-header", colors.header);
  root.style.setProperty("--brand-footer", colors.footer);
  root.style.setProperty("--brand-button", colors.button);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--navy", colors.accent);
  const whatsapp = colors.whatsapp.trim() || "#22c55e";
  root.style.setProperty("--brand-whatsapp", whatsapp);
}

function applyFavicon(href: string) {
  if (!href) return;
  const selectors = [
    "link[rel='icon']",
    "link[rel='shortcut icon']",
  ];
  let link = document.querySelector(selectors[0]) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingContent>(DEFAULT_BRANDING);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/public-branding", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok && data.branding) {
          setBranding(data.branding as BrandingContent);
        }
      } catch {
        /* keep defaults */
      }
    };

    void load();

    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<BrandingContent>).detail;
      if (detail) setBranding(detail);
      else void load();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "themeUpdate") return;
      const colors = data.brandTheme?.colors;
      if (colors) {
        setBranding((prev) => ({ ...prev, colors: { ...prev.colors, ...colors } }));
        return;
      }
      void load();
    };

    window.addEventListener(BRANDING_UPDATED_EVENT, onUpdate);
    window.addEventListener("message", onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener(BRANDING_UPDATED_EVENT, onUpdate);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  useEffect(() => {
    applyBrandColors(branding.colors);
    applyFavicon(branding.faviconUrl || "/favicon.png");
  }, [branding]);

  const value = useMemo(() => branding, [branding]);

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
}
