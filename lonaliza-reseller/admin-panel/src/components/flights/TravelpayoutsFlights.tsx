"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type TravelpayoutsPublicConfig } from "@/lib/flights-config";
import { attachTravelpayoutsRedirectIntercept } from "@/lib/flights-redirect";
import { buildWhiteLabelPageUrl } from "@/lib/travelpayouts-utils";

type TravelpayoutsFlightsProps = {
  config: TravelpayoutsPublicConfig;
};

/**
 * Same-origin `/tpwl/` embed of the official White Label Page.
 *
 * Do not restyle `#tpwl-modals`, TicketDetail, or Modal overlays — those
 * work on search.lonaliza.com and must keep Travelpayouts' own CSS.
 * Hide only the default logo row. Grow the iframe with ticket results so
 * the main page scrolls. Never snap-scroll or shrink on ticket click.
 */
const WL_FOOTER_GAP_PX = 20;
const WL_HEIGHT_PAD_PX = 8;
const MEASURE_CSS_ID = "alrayyan-tpwl-measure";
const PAGE_EMBED_CLASS = "alrayyan-flights-embed";

const WL_DESKTOP_PAGE_PX = 1687;
const WL_DESKTOP_CONTENT_BOTTOM_PX = 1499;
const WL_COMPACT_PAGE_PX = 2972;
const WL_COMPACT_CONTENT_BOTTOM_PX = 2784;
const WL_NARROW_PAGE_PX = 3533;
const WL_NARROW_CONTENT_BOTTOM_PX = 3345;
const WL_MOBILE_PAGE_PX = 3585;
const WL_MOBILE_CONTENT_BOTTOM_PX = 3381;

type EmbedHeights = {
  iframe: number;
  wrapper: number;
};

function landingHeights(): EmbedHeights {
  if (typeof window === "undefined") {
    return { iframe: WL_DESKTOP_PAGE_PX, wrapper: WL_DESKTOP_CONTENT_BOTTOM_PX + WL_FOOTER_GAP_PX };
  }
  const width = window.innerWidth;
  if (width <= 389) {
    return { iframe: WL_MOBILE_PAGE_PX, wrapper: WL_MOBILE_CONTENT_BOTTOM_PX + WL_FOOTER_GAP_PX };
  }
  if (width <= 639) {
    return { iframe: WL_NARROW_PAGE_PX, wrapper: WL_NARROW_CONTENT_BOTTOM_PX + WL_FOOTER_GAP_PX };
  }
  if (width <= 1175) {
    return { iframe: WL_COMPACT_PAGE_PX, wrapper: WL_COMPACT_CONTENT_BOTTOM_PX + WL_FOOTER_GAP_PX };
  }
  return { iframe: WL_DESKTOP_PAGE_PX, wrapper: WL_DESKTOP_CONTENT_BOTTOM_PX + WL_FOOTER_GAP_PX };
}

function asHtmlElement(el: Element | null): HTMLElement | null {
  if (!el || el.nodeType !== 1 || typeof (el as HTMLElement).getBoundingClientRect !== "function") {
    return null;
  }
  return el as HTMLElement;
}

function elementBottom(el: Element | null, scrollY: number): number {
  const node = asHtmlElement(el);
  if (!node) return 0;
  const rect = node.getBoundingClientRect();
  if (rect.height < 1 && rect.width < 1) return 0;
  return rect.bottom + scrollY;
}

function ensureMeasureCss(doc: Document): void {
  if (doc.getElementById(MEASURE_CSS_ID)) return;
  const style = doc.createElement("style");
  style.id = MEASURE_CSS_ID;
  style.textContent = `
    html, body { height: auto !important; min-height: 0 !important; overflow: visible !important; }
    .tpwl-logo__wrapper { display: none !important; margin: 0 !important; }
    .tpwl-logo-header { padding-top: 16px !important; margin-bottom: 0 !important; }
  `;
  doc.head.appendChild(style);
}

function readIframeDocument(iframe: HTMLIFrameElement): Document | null {
  try {
    const doc = iframe.contentDocument;
    if (!doc?.documentElement) return null;
    return doc;
  } catch {
    return null;
  }
}

function farthestBottom(root: Element | null, scrollY: number): number {
  if (!root) return 0;
  let max = elementBottom(root, scrollY);
  for (const el of root.querySelectorAll("*")) {
    const node = asHtmlElement(el);
    if (!node) continue;
    const rect = node.getBoundingClientRect();
    if (rect.height < 8) continue;
    max = Math.max(max, rect.bottom + scrollY);
  }
  return Math.round(max);
}

function measureEmbed(iframe: HTMLIFrameElement): EmbedHeights | null {
  const doc = readIframeDocument(iframe);
  if (!doc) return null;

  ensureMeasureCss(doc);

  const scrollY = doc.defaultView?.scrollY ?? 0;
  const iframeClient = iframe.clientHeight;
  const scrollHeight = Math.max(
    doc.documentElement.scrollHeight,
    doc.body?.scrollHeight ?? 0
  );
  const overflowing = scrollHeight > iframeClient + 2;

  const footer = asHtmlElement(doc.querySelector(".tpwl-footer__wrapper"));
  const footerH = footer ? Math.round(footer.getBoundingClientRect().height) : 0;
  const footerTop = footer ? Math.round(footer.getBoundingClientRect().top + scrollY) : 0;

  const contentBottom = Math.max(
    elementBottom(doc.querySelector(".tpwl-logo-header"), scrollY),
    elementBottom(doc.querySelector(".tpwl-search-header"), scrollY),
    elementBottom(doc.querySelector("#tpwl-search"), scrollY),
    farthestBottom(doc.getElementById("tpwl-tickets"), scrollY),
    elementBottom(doc.querySelector(".tpwl-tickets__wrapper"), scrollY),
    farthestBottom(doc.querySelector(".tpwl-widgets__wrapper"), scrollY),
    farthestBottom(doc.querySelector(".tpwl-main"), scrollY)
  );

  const boxedDocument = Math.max(contentBottom, footerTop + footerH);
  const contentFillsFrame = boxedDocument + 40 >= iframeClient;
  const documentBottom =
    overflowing && contentFillsFrame
      ? Math.max(scrollHeight, boxedDocument)
      : boxedDocument;

  if (documentBottom < 200 && contentBottom < 200) return null;

  const iframeHeight = documentBottom + WL_HEIGHT_PAD_PX;
  const wrapperHeight = Math.max(
    400,
    (contentBottom > 200 ? contentBottom : documentBottom - footerH) + WL_FOOTER_GAP_PX
  );

  const ticketsH = asHtmlElement(doc.getElementById("tpwl-tickets"))?.getBoundingClientRect().height ?? 0;
  const weedlesH =
    asHtmlElement(doc.getElementById("tpwl-widget-weedles"))?.getBoundingClientRect().height ?? 0;
  const hydrating = ticketsH < 40 && weedlesH < 400;
  if (hydrating) {
    const fallback = landingHeights();
    return {
      iframe: Math.max(iframeHeight, fallback.iframe),
      wrapper: Math.max(wrapperHeight, fallback.wrapper),
    };
  }

  return { iframe: iframeHeight, wrapper: wrapperHeight };
}

function forceIframeLocale(doc: Document, locale: string): void {
  const loc = locale || "ar";
  doc.documentElement.lang = loc;
  doc.documentElement.dir = loc === "ar" ? "rtl" : "ltr";
  try {
    const maxAge = 60 * 60 * 24 * 365;
    doc.cookie = `locale=${loc}; path=/; max-age=${maxAge}`;
    doc.cookie = `lang=${loc}; path=/; max-age=${maxAge}`;
    doc.cookie = `language=${loc}; path=/; max-age=${maxAge}`;
    doc.cookie = `locale=${loc}; path=/tpwl/; max-age=${maxAge}`;
    doc.cookie = `lang=${loc}; path=/tpwl/; max-age=${maxAge}`;
  } catch {
    // cookie write is best-effort inside the proxied document
  }
}

export default function TravelpayoutsFlights({ config }: TravelpayoutsFlightsProps) {
  const searchParams = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastHeightsRef = useRef<EmbedHeights>(landingHeights());
  const [heights, setHeights] = useState<EmbedHeights>(lastHeightsRef.current);
  const locale = config.locale || "ar";

  const iframeSrc = useMemo(
    () =>
      buildWhiteLabelPageUrl({
        from: searchParams.get("from") || undefined,
        to: searchParams.get("to") || undefined,
        date: searchParams.get("date") || undefined,
        returnDate: searchParams.get("returnDate") || undefined,
        guests: searchParams.get("guests") || undefined,
        flightType: searchParams.get("flightType") || undefined,
        class: searchParams.get("class") || undefined,
        flightSearch: searchParams.get("flightSearch") || undefined,
        locale,
      }),
    [searchParams, locale]
  );

  const applyHeights = useCallback((next: EmbedHeights) => {
    const prev = lastHeightsRef.current;
    if (prev.iframe === next.iframe && prev.wrapper === next.wrapper) return;
    lastHeightsRef.current = next;
    setHeights(next);
  }, []);

  const measure = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const next = measureEmbed(iframe);
    if (next) applyHeights(next);
  }, [applyHeights]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intervalId = 0;

    const detachWatchers = () => {
      observer?.disconnect();
      observer = null;
      resizeObserver?.disconnect();
      resizeObserver = null;
    };

    const attachWatchers = () => {
      detachWatchers();
      const doc = readIframeDocument(iframe);
      if (doc) forceIframeLocale(doc, locale);
      measure();
      if (!doc) return;

      observer = new MutationObserver(() => measure());
      observer.observe(doc.documentElement, {
        childList: true,
        subtree: true,
        attributes: false,
      });

      const tickets = doc.getElementById("tpwl-tickets");
      if (tickets?.shadowRoot) {
        observer.observe(tickets.shadowRoot, {
          childList: true,
          subtree: true,
          attributes: false,
        });
      }

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => measure());
        resizeObserver.observe(doc.documentElement);
        if (doc.body) resizeObserver.observe(doc.body);
        if (tickets) resizeObserver.observe(tickets);
      }
    };

    const onLoad = () => attachWatchers();
    iframe.addEventListener("load", onLoad);
    attachWatchers();

    intervalId = window.setInterval(measure, 400);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      iframe.removeEventListener("load", onLoad);
      window.clearInterval(intervalId);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      detachWatchers();
    };
  }, [measure, iframeSrc, locale]);

  useEffect(() => {
    document.documentElement.classList.add(PAGE_EMBED_CLASS);
    return () => {
      document.documentElement.classList.remove(PAGE_EMBED_CLASS);
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    return attachTravelpayoutsRedirectIntercept(iframe);
  }, [iframeSrc]);

  return (
    <section className="relative z-0 bg-[#051741] pt-24 md:pt-32">
      <style>{`
        html.${PAGE_EMBED_CLASS} {
          overflow-x: clip;
          overflow-y: auto;
          scroll-behavior: auto;
        }
        html.${PAGE_EMBED_CLASS} body {
          overflow-x: clip;
          overflow-y: visible;
          max-width: 100%;
        }
        .tp-wl-embed {
          position: relative;
          overflow: visible;
          background: #051741;
        }
        .tp-wl-embed iframe {
          position: absolute;
          inset-inline: 0;
          top: 0;
          width: 100%;
          border: 0;
          overflow: visible;
          background: #051741;
        }
      `}</style>
      <div className="tp-wl-embed" style={{ height: heights.wrapper }}>
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="Flight search"
          lang={locale}
          scrolling="no"
          referrerPolicy="no-referrer-when-downgrade"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            width: "100%",
            height: heights.iframe,
            zIndex: "auto",
            transform: "none",
          }}
        />
      </div>
    </section>
  );
}
