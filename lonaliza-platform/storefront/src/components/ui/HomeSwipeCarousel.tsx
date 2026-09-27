"use client";

import { Children, useCallback, useRef, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ArrowTone = "paper" | "navy" | "gold" | "frost";

type Props = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  /** Grid/layout applied from `lg` up. Pass empty string when the parent already hides this on desktop. */
  desktopClassName?: string;
  showArrows?: boolean;
  arrowTone?: ArrowTone;
  /** Title/subtitle (or any intro) sitting on the same row as the arrows. */
  header?: ReactNode;
  headerAction?: ReactNode;
};

const AXIS_LOCK_PX = 8;

const ARROW_TONE: Record<ArrowTone, string> = {
  paper:
    "border-slate-200 bg-white text-[#1e1b4b] shadow-[0_4px_12px_-6px_rgba(15,23,42,0.35)] hover:border-purple-300 hover:bg-purple-50",
  navy:
    "border-white/20 bg-[#1e1b4b] text-amber-300 shadow-[0_6px_16px_-8px_rgba(30,27,75,0.55)] hover:bg-[#2e1065]",
  gold:
    "border-amber-300/70 bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-[0_6px_16px_-8px_rgba(245,158,11,0.55)] hover:from-amber-300 hover:to-amber-400",
  frost:
    "border-white/35 bg-white/15 text-white backdrop-blur-md hover:bg-white/25",
};

/**
 * Shared mobile scroll physics only. Arrows live in a header row ABOVE the
 * track — never over card art. Item width is a % of the content column
 * (not vw) so the active card stays fully on-canvas and the next card peeks.
 */
export default function HomeSwipeCarousel({
  children,
  className,
  itemClassName,
  desktopClassName = "lg:grid lg:grid-cols-4 lg:gap-5 lg:!overflow-visible lg:pb-0",
  showArrows = true,
  arrowTone = "paper",
  header,
  headerAction,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const axisRef = useRef<"x" | "y" | null>(null);
  const originRef = useRef({ x: 0, y: 0, sl: 0 });

  const items = Children.toArray(children);
  const gridAtLg = /lg:grid/.test(desktopClassName);
  const showHeaderRow = Boolean(header) || Boolean(headerAction) || (showArrows && items.length > 1);

  const scroll = useCallback((physicalDir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const amount = first
      ? first.getBoundingClientRect().width + 12
      : Math.max(el.clientWidth * 0.82, 220);
    el.scrollBy({
      left: physicalDir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    axisRef.current = null;
    originRef.current = {
      x: e.clientX,
      y: e.clientY,
      sl: trackRef.current?.scrollLeft ?? 0,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - originRef.current.x;
    const dy = e.clientY - originRef.current.y;
    if (!axisRef.current) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      axisRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axisRef.current !== "x" || e.pointerType !== "mouse" || e.buttons !== 1) return;
    el.scrollLeft = originRef.current.sl - dx;
  };

  return (
    <div className={cn("lonaliza-carousel-wrap relative w-full min-w-0 max-w-full", className)}>
      {showHeaderRow ? (
        <div
          className={cn(
            "mb-4 flex items-end justify-between gap-3",
            !header && !headerAction && gridAtLg && "lg:hidden"
          )}
        >
          <div className="min-w-0 flex-1 overflow-visible">{header}</div>
          <div className="flex shrink-0 items-center gap-2">
            {headerAction ? <div className="hidden sm:block">{headerAction}</div> : null}
            {showArrows && items.length > 1 ? (
              <div
                className={cn(
                  "flex items-center gap-1.5",
                  gridAtLg && "lg:hidden"
                )}
              >
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className={cn("lonaliza-carousel-arrow", ARROW_TONE[arrowTone])}
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className={cn("lonaliza-carousel-arrow", ARROW_TONE[arrowTone])}
                  aria-label="Next"
                >
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {headerAction ? <div className="mb-3 sm:hidden">{headerAction}</div> : null}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className={cn(
          "lonaliza-carousel-track flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto",
          desktopClassName
        )}
      >
        {items.map((child, index) => (
          <div
            key={(child as { key?: string | null })?.key ?? index}
            className={cn(
              "lonaliza-carousel-item w-[82%] min-w-0 max-w-[20.5rem] shrink-0 snap-start lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink",
              itemClassName
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
