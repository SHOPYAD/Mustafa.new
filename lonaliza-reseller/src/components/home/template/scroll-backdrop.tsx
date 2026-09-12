"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { HomepageSectionInstance, HomepageSectionType } from "@/lib/visual-editor/schema";
import { SURFACE, type ServiceSurfaceKind } from "./surfaces";

export function sectionTypeToSurfaceKind(type: HomepageSectionType): ServiceSurfaceKind {
  switch (type) {
    case "hero":
    case "search":
      return "neutral";
    case "flightDeals":
      return "flights";
    case "hotels":
      return "hotels";
    case "packages":
    case "vipTours":
      return "tours";
    case "transfers":
      return "transfers";
    case "cars":
      return "cars";
    case "visa":
      return "visa";
    case "flashDeals":
    case "categories":
      return "offers";
    case "coupons":
    case "points":
    case "affiliate":
      return "rewards";
    case "destinations":
    case "banners":
      return "destinations";
    case "whyUs":
    case "stats":
    case "testimonials":
    case "trust":
    case "partners":
    case "blog":
    case "newsletter":
    case "contact":
    case "cta":
    case "copilot": /* Agent C: copilot pipeline */
      return "neutral";
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

function mixWash(from: string, to: string, t: number): string {
  const pct = Math.round(Math.min(1, Math.max(0, t)) * 100);
  return `linear-gradient(180deg, ${from} 0%, color-mix(in srgb, ${from} ${100 - pct}%, ${to}) 48%, ${to} 100%)`;
}

type ScrollLinkedBackdropProps = {
  layout: HomepageSectionInstance[];
};

export function ScrollLinkedBackdrop({ layout }: ScrollLinkedBackdropProps) {
  const track = useMemo(
    () =>
      layout
        .filter((item) => item.type !== "hero" && item.type !== "search")
        .map((item) => ({
          id: item.instanceId,
          kind: sectionTypeToSurfaceKind(item.type),
        })),
    [layout]
  );

  const [blend, setBlend] = useState({ from: 0, to: 0, t: 0 });

  useEffect(() => {
    if (!track.length) return;

    const read = () => {
      const mid = window.innerHeight * 0.42;
      const hits = track
        .map((entry, index) => {
          const el = document.querySelector<HTMLElement>(`[data-builder-id="${entry.id}"]`);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { index, top: rect.top, bottom: rect.bottom, height: rect.height };
        })
        .filter((row): row is { index: number; top: number; bottom: number; height: number } => Boolean(row));

      if (!hits.length) return;

      const current = hits.find((row) => row.top <= mid && row.bottom >= mid) || hits[0];
      if (!current) return;
      const span = Math.max(1, current.height);
      const local = Math.min(1, Math.max(0, (mid - current.top) / span));
      const nextIndex = Math.min(track.length - 1, current.index + (local > 0.55 ? 1 : 0));
      const t = current.index === nextIndex ? 0 : Math.min(1, Math.max(0, (local - 0.55) / 0.45));
      setBlend({ from: current.index, to: nextIndex, t });
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    const timer = window.setInterval(read, 400);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      window.clearInterval(timer);
    };
  }, [track]);

  if (!track.length) return null;

  const fromKind = track[blend.from]?.kind || "neutral";
  const toKind = track[blend.to]?.kind || fromKind;
  const from = SURFACE[fromKind];
  const to = SURFACE[toKind];

  const style: CSSProperties = {
    backgroundImage: `${mixWash(from.wash, to.wash, blend.t)}, ${from.pattern}, ${to.pattern}`,
    backgroundBlendMode: "normal, soft-light, soft-light",
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden"
      style={style}
    >
      <div
        className="absolute -end-16 top-[18%] h-64 w-64 opacity-40 transition-transform duration-700"
        style={{ transform: `translateY(${blend.from * -12}px)` }}
      >
        <div
          className="h-full w-full rounded-full blur-3xl"
          style={{ background: `color-mix(in srgb, ${from.accent} 28%, transparent)` }}
        />
      </div>
      <div
        className="absolute -start-20 bottom-[12%] h-72 w-72 opacity-30 transition-transform duration-700"
        style={{ transform: `translateY(${blend.to * 10}px)` }}
      >
        <div
          className="h-full w-full rounded-full blur-3xl"
          style={{ background: `color-mix(in srgb, ${to.accent} 26%, transparent)` }}
        />
      </div>
    </div>
  );
}
