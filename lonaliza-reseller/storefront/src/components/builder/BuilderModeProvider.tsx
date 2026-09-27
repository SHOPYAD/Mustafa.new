"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useBuilderMode } from "@/hooks/useBuilderMode";
import { resolvePageIdFromPath } from "@/lib/builder-pages";
import type { PageLayoutHints, PageThemeTokens } from "@/types/custom-page";

type ThemePayload = {
  tokens?: PageThemeTokens;
  layoutHints?: PageLayoutHints;
};

function applyThemeVars(tokens?: PageThemeTokens, hints?: PageLayoutHints) {
  const root = document.documentElement;
  if (tokens?.navy) {
    root.style.setProperty("--alrayyan-navy", tokens.navy);
    root.style.setProperty("--navy", tokens.navy);
  }
  if (tokens?.emerald) {
    root.style.setProperty("--alrayyan-emerald", tokens.emerald);
  }
  if (tokens?.background) root.style.setProperty("--page-bg", tokens.background);
  if (tokens?.text) root.style.setProperty("--page-text", tokens.text);
  if (tokens?.accent) root.style.setProperty("--page-accent", tokens.accent);
  if (hints?.heroAlign) root.dataset.pageHeroAlign = hints.heroAlign;
  else delete root.dataset.pageHeroAlign;
  if (hints?.maxWidth) root.dataset.pageMaxWidth = hints.maxWidth;
  else delete root.dataset.pageMaxWidth;
  if (typeof hints?.showHero === "boolean") {
    root.dataset.pageShowHero = hints.showHero ? "1" : "0";
  } else {
    delete root.dataset.pageShowHero;
  }
  if (typeof hints?.compactHeader === "boolean") {
    root.dataset.pageCompactHeader = hints.compactHeader ? "1" : "0";
  } else {
    delete root.dataset.pageCompactHeader;
  }
}

function BuilderModeEffects() {
  const builder = useBuilderMode();
  const pathname = usePathname();

  useEffect(() => {
    const pageId = resolvePageIdFromPath(pathname || "/");
    if (!pageId) return;
    let cancelled = false;
    void fetch(`/api/page-theme?pageId=${encodeURIComponent(pageId)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: { ok?: boolean } & ThemePayload) => {
        if (cancelled || !data?.ok) return;
        applyThemeVars(data.tokens, data.layoutHints);
      })
      .catch(() => {
        /* keep branding defaults */
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!builder) return;
    const root = document.documentElement;
    root.setAttribute("data-builder-mode", "true");
    (window as Window & { __IS_BUILDER_MODE__?: boolean }).__IS_BUILDER_MODE__ = true;

    const blockNav = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      const allow = target.closest("[data-builder-allow]");
      if (allow) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const blockSubmit = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener("click", blockNav, true);
    document.addEventListener("submit", blockSubmit, true);
    return () => {
      root.removeAttribute("data-builder-mode");
      delete (window as Window & { __IS_BUILDER_MODE__?: boolean }).__IS_BUILDER_MODE__;
      document.removeEventListener("click", blockNav, true);
      document.removeEventListener("submit", blockSubmit, true);
    };
  }, [builder]);

  return null;
}

export function BuilderModeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <BuilderModeEffects />
      </Suspense>
      {children}
    </>
  );
}
