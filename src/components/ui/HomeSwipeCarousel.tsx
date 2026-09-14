"use client";

import { Children, useCallback, useRef, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  /** Grid/layout applied from `lg` up. Pass empty string when the parent already hides this on desktop. */
  desktopClassName?: string;
  showArrows?: boolean;
};

const AXIS_LOCK_PX = 8;

/**
 * Mobile horizontal swipe row with discreet arrows. From `lg` it becomes a CSS grid.
 * Track uses pan-x pan-y so a vertical finger start still scrolls the page.
 */
export default function HomeSwipeCarousel({
  children,
  className,
  itemClassName,
  desktopClassName = "lg:grid lg:grid-cols-4 lg:gap-5 lg:!overflow-visible lg:pb-0",
  showArrows = true,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const axisRef = useRef<"x" | "y" | null>(null);
  const originRef = useRef({ x: 0, y: 0, sl: 0 });

  const items = Children.toArray(children);

  const scroll = useCallback((physicalDir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.78, 220);
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
    // Touch/pen: native overflow + pan-x pan-y. Mouse: drag only after a horizontal lock.
    if (axisRef.current !== "x" || e.pointerType !== "mouse" || e.buttons !== 1) return;
    el.scrollLeft = originRef.current.sl - dx;
  };

  return (
    <div className={cn("lonaliza-carousel-wrap relative min-w-0 max-w-full", className)}>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className={cn(
          "lonaliza-carousel-track flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 pe-1",
          desktopClassName
        )}
      >
        {items.map((child, index) => (
          <div
            key={(child as { key?: string | null })?.key ?? index}
            className={cn(
              "w-[min(82vw,19.5rem)] max-w-full shrink-0 snap-start lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink",
              itemClassName
            )}
          >
            {child}
          </div>
        ))}
      </div>
      {showArrows && items.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => scroll("left")}
            className="lonaliza-carousel-arrow start-0 lg:hidden"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="lonaliza-carousel-arrow end-0 lg:hidden"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </>
      ) : null}
    </div>
  );
}
