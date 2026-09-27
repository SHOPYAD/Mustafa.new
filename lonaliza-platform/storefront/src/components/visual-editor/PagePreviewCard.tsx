"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { builderCanvasSrc } from "@/lib/builder-pages";
import type { Locale } from "@/lib/i18n/types";

const FRAME_W = 1280;
const FRAME_H = 900;
const SCROLL_MS = 8000;

export function PageLivePreview({
  path,
  locale,
  title,
}: {
  path: string;
  locale: Locale;
  title: string;
}) {
  const clipRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const rafRef = useRef(0);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = clipRef.current;
    if (!el) return;
    const sync = () => {
      const next = el.clientWidth / FRAME_W;
      setScale(Number.isFinite(next) && next > 0 ? next : 0.2);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stopScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const iframe = iframeRef.current;
    iframe?.classList.remove("is-css-scroll");
    try {
      iframe?.contentWindow?.scrollTo(0, 0);
    } catch {
      /* cross-origin */
    }
  }, []);

  const startScroll = useCallback(() => {
    stopScroll();
    const iframe = iframeRef.current;
    const win = iframe?.contentWindow;
    const doc = iframe?.contentDocument;
    if (!iframe || !win || !doc) {
      iframe?.classList.add("is-css-scroll");
      return;
    }
    const max = Math.max(0, doc.documentElement.scrollHeight - win.innerHeight);
    if (max < 16) {
      iframe.classList.add("is-css-scroll");
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / SCROLL_MS);
      try {
        win.scrollTo(0, max * t);
      } catch {
        iframe.classList.add("is-css-scroll");
        return;
      }
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopScroll]);

  useEffect(() => () => stopScroll(), [stopScroll]);

  const src = builderCanvasSrc(path, locale);

  return (
    <div
      ref={clipRef}
      className="relative aspect-[16/10] w-full overflow-hidden bg-[#051741]/8"
      onMouseEnter={startScroll}
      onMouseLeave={stopScroll}
      onFocus={startScroll}
      onBlur={stopScroll}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        tabIndex={-1}
        loading="lazy"
        className="editor-page-preview-iframe pointer-events-none absolute left-0 top-0 border-0 bg-white"
        style={{
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          ["--preview-scale" as string]: String(scale),
          ["--preview-travel" as string]: `calc(-${FRAME_H}px * ${scale} + 100%)`,
        }}
      />
    </div>
  );
}
