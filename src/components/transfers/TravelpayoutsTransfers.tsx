"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  resolveTransfersTpScriptUrl,
  type TransfersSearchQuery,
  type TransfersTravelpayoutsConfig,
} from "@/lib/transfers-config";
import {
  enhanceIntuiProxiedDocument,
  fillIntuiSearchForm,
  injectTpembScript,
  parseIntuiHeightMessage,
  rewriteIntuiIframes,
  styleTransfersIframe,
  submitIntuiSearchForm,
  type IntuiRewriteOptions,
  type TransfersIframeMode,
} from "@/lib/tpemb-embed";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import AlrayyanServiceBanner from "@/components/travel/AlrayyanServiceBanner";

type TravelpayoutsTransfersProps = {
  config: TransfersTravelpayoutsConfig;
};

function tryFillWidgetFields(
  root: HTMLElement,
  query: TransfersSearchQuery
): void {
  const inputs = Array.from(root.querySelectorAll("input, select, textarea"));
  const setIfEmpty = (el: Element, value: string) => {
    const input = el as HTMLInputElement;
    if (!value || input.value) return;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  for (const el of inputs) {
    const name = `${el.getAttribute("name") || ""} ${el.getAttribute("id") || ""} ${el.getAttribute("placeholder") || ""}`.toLowerCase();
    if (query.from && /from|pickup|pick|origin/.test(name) && !/to|drop/.test(name)) {
      setIfEmpty(el, query.from);
    }
    if (query.to && /to|drop|dest|destination/.test(name)) {
      setIfEmpty(el, query.to);
    }
    if (query.date && /date/.test(name)) {
      setIfEmpty(el, query.date);
    }
    if (query.time && /time/.test(name)) {
      setIfEmpty(el, query.time);
    }
    if (query.guests && /guest|passenger|pax|adult/.test(name)) {
      setIfEmpty(el, query.guests);
    }
  }
}

export default function TravelpayoutsTransfers({
  config,
}: TravelpayoutsTransfersProps) {
  const { t, locale: siteLocale } = useLocale();
  const searchParams = useSearchParams();
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<TransfersIframeMode>("idle");
  const clicksRef = useRef(0);

  const query = useMemo<TransfersSearchQuery>(
    () => ({
      from: searchParams.get("from") || searchParams.get("pickup") || undefined,
      to:
        searchParams.get("to") ||
        searchParams.get("dropoff") ||
        searchParams.get("q") ||
        undefined,
      date: searchParams.get("date") || undefined,
      time: searchParams.get("time") || undefined,
      guests:
        searchParams.get("guests") ||
        searchParams.get("passengers") ||
        undefined,
    }),
    [searchParams]
  );

  const scriptUrl = resolveTransfersTpScriptUrl(config, query);
  const embedLocale = config.locale.trim() || "en";
  const currency = config.currency?.trim() || "usd";
  const rewriteOpts = useMemo<IntuiRewriteOptions>(
    () => ({
      embedLocale,
      pageLocale: siteLocale,
      currency,
      search: query,
    }),
    [embedLocale, siteLocale, currency, query]
  );
  const hasSearchQuery = Boolean(query.from || query.to || query.date);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !scriptUrl) return;

    modeRef.current = "idle";
    clicksRef.current = 0;
    mount.replaceChildren();
    injectTpembScript(mount, scriptUrl);

    const applyMode = (next: TransfersIframeMode) => {
      const rank = { idle: 0, picker: 1, results: 2 };
      if (rank[next] < rank[modeRef.current]) return;
      modeRef.current = next;
      mount.setAttribute("data-alrayyan-widget-mode", next);
      mount.style.zIndex = next === "idle" ? "30" : "80";
      for (const iframe of mount.querySelectorAll("iframe")) {
        styleTransfersIframe(iframe, next);
      }
    };

    const enhanceFrame = (iframe: HTMLIFrameElement) => {
      styleTransfersIframe(iframe, modeRef.current);
      const ok = enhanceIntuiProxiedDocument(iframe, siteLocale, query);
      if (!ok) return;
      if (hasSearchQuery) {
        applyMode("results");
        const doc = iframe.contentDocument;
        if (doc) {
          fillIntuiSearchForm(doc, query);
          window.setTimeout(() => {
            if (iframe.contentDocument) {
              fillIntuiSearchForm(iframe.contentDocument, query);
              submitIntuiSearchForm(iframe.contentDocument);
            }
          }, 600);
        }
      }
      const onPicker = () => {
        applyMode("picker");
        window.setTimeout(() => {
          enhanceIntuiProxiedDocument(iframe, siteLocale, query);
        }, 200);
      };
      iframe.contentDocument?.addEventListener("pointerdown", onPicker, true);
      iframe.contentDocument?.addEventListener("input", onPicker, true);
      iframe.contentDocument?.addEventListener("focusin", onPicker, true);
    };

    const hideLeftoverChrome = () => {
      for (const el of mount.querySelectorAll<HTMLElement>(
        "a[href*='travelpayouts.com'], a[href*='tp.media'], [class*='powered_by'], [class*='powered-by'], [class*='PoweredBy']"
      )) {
        if (el.tagName === "IFRAME") continue;
        if (el.closest("iframe")) continue;
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("width", "0", "important");
        el.style.setProperty("height", "0", "important");
        el.style.setProperty("margin", "0", "important");
        el.setAttribute("aria-hidden", "true");
      }
    };

    const bindIframe = (iframe: HTMLIFrameElement) => {
      if (iframe.dataset.alrayyanBound === "1") return;
      iframe.dataset.alrayyanBound = "1";
      rewriteIntuiIframes(mount, rewriteOpts);
      styleTransfersIframe(iframe, modeRef.current);
      iframe.addEventListener("load", () => enhanceFrame(iframe));
      if (iframe.contentDocument?.readyState === "complete") {
        enhanceFrame(iframe);
      }
      hideLeftoverChrome();
    };

    let bindTimer = 0;
    const scheduleBind = () => {
      if (bindTimer) return;
      bindTimer = window.setTimeout(() => {
        bindTimer = 0;
        const iframe = mount.querySelector("iframe");
        if (iframe) bindIframe(iframe);
      }, 250);
    };

    const observer = new MutationObserver(scheduleBind);
    observer.observe(mount, { childList: true, subtree: false });

    const onPointer = () => {
      clicksRef.current += 1;
      applyMode("picker");
      if (clicksRef.current >= 2) applyMode("results");
    };
    mount.addEventListener("pointerdown", onPointer, true);

    const onMessage = (event: MessageEvent) => {
      const height = parseIntuiHeightMessage(event.data);
      if (height && height >= 1600) {
        applyMode("results");
        const iframe = mount.querySelector("iframe");
        if (iframe && parseInt(iframe.style.height || "0", 10) < height) {
          iframe.style.height = `${height}px`;
          iframe.style.minHeight = `${height}px`;
        }
      }
    };
    window.addEventListener("message", onMessage);

    const srcPoll = window.setInterval(() => {
      const iframe = mount.querySelector("iframe");
      const src = iframe?.getAttribute("src") || iframe?.src || "";
      if (!/intui|getoffers/i.test(src)) return;
      try {
        const url = new URL(src, window.location.origin);
        if (
          url.pathname.includes("/getoffers/") ||
          url.searchParams.get("from") ||
          url.searchParams.get("to") ||
          url.searchParams.get("pickup") ||
          url.searchParams.get("date")
        ) {
          applyMode("results");
        }
      } catch {
        // keep idle/picker
      }
    }, 800);

    const timers = [0, 200, 800, 2000, 5000].map((ms) =>
      window.setTimeout(() => {
        rewriteIntuiIframes(mount, rewriteOpts);
        tryFillWidgetFields(mount, query);
        const iframe = mount.querySelector("iframe");
        if (iframe) {
          bindIframe(iframe);
          hideLeftoverChrome();
          if (iframe.contentDocument) {
            fillIntuiSearchForm(iframe.contentDocument, query);
          }
        }
      }, ms)
    );

    return () => {
      observer.disconnect();
      if (bindTimer) window.clearTimeout(bindTimer);
      timers.forEach((id) => window.clearTimeout(id));
      window.clearInterval(srcPoll);
      mount.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("message", onMessage);
      mount.replaceChildren();
    };
  }, [scriptUrl, query, rewriteOpts, siteLocale, hasSearchQuery]);

  return (
    <section className="pb-16 bg-slate-50 min-h-screen overflow-visible">
      <AlrayyanServiceBanner
        kicker={t.transfers.bannerKicker}
        title={t.transfers.bannerTitle}
        subtitle={t.transfers.bannerSubtitle}
        cta={t.transfers.bannerCta}
      />

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 mt-8 overflow-visible">
        <div
          ref={mountRef}
          id="tp-transfers-widget"
          dir="ltr"
          className="tp-transfers-widget relative z-30 w-full min-h-[28rem] bg-white overflow-visible"
        />
      </div>
    </section>
  );
}
