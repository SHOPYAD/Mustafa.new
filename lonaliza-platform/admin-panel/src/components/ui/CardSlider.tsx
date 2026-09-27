"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardSliderProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Section color mode: 'light', 'dark', or 'auto' (default: auto responds to dark: classes) */
  tone?: "light" | "dark" | "auto";
  headerAction?: ReactNode;
}

/**
 * Arrow-only horizontal slider — scrollbar is fully hidden.
 */
export default function CardSlider({
  title,
  subtitle,
  children,
  className,
  tone = "auto",
  headerAction,
}: CardSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.75, 240);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const btnClass =
    tone === "dark"
      ? "w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      : tone === "light"
        ? "w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
        : "w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center transition-colors";

  return (
    <section className={cn("lonaliza-carousel-wrap relative min-w-0 max-w-full", className)}>
      <div className="mb-5 flex items-end justify-between gap-4">
        {title || subtitle ? (
          <div className="min-w-0">
            {title ? (
              <h2
                className={cn(
                  "overflow-visible pt-0.5 text-xl font-bold leading-[1.35] tracking-tight md:text-2xl",
                  tone === "dark"
                    ? "text-white"
                    : tone === "light"
                      ? "text-slate-900"
                      : "text-slate-900 dark:text-white"
                )}
              >
                {title}
              </h2>
            ) : null}
            {subtitle && (
              <p
                className={cn(
                  "mt-1 text-sm",
                  tone === "dark"
                    ? "text-white/50"
                    : tone === "light"
                      ? "text-slate-500"
                      : "text-slate-500 dark:text-slate-400"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        ) : (
          <div />
        )}
        <div className="flex shrink-0 items-center gap-2">
          {headerAction}
          <button
            type="button"
            onClick={() => scroll("left")}
            className={btnClass}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className={btnClass}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="lonaliza-carousel-track flex min-w-0 max-w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 pe-1 sm:gap-4"
      >
        {children}
      </div>
    </section>
  );
}
