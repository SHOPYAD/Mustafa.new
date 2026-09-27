"use client";

import { Children, useState, useRef, type ReactNode, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Plane, Hotel, Car, Sparkles, Tag, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export default function OfferSlider({
  title,
  children,
  className,
  type = "default",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  slideClassName?: string;
  trackClassName?: string;
  type?: "flight" | "hotel" | "transfer" | "car" | "package" | "default";
}) {
  const { dir, locale } = useLocale();
  const items = Children.toArray(children).filter(Boolean);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!items.length) return null;
  const count = items.length;
  const safe = ((index % count) + count) % count;
  const go = (delta: number) => setIndex((i) => ((i + delta) % count + count) % count);
  const rtl = dir === "rtl";

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 40; // minimum distance to count as swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left
        go(rtl ? -1 : 1);
      } else {
        // Swipe right
        go(rtl ? 1 : -1);
      }
    }
    touchStartX.current = null;
  };

  const IconComponent =
    type === "flight"
      ? Plane
      : type === "hotel"
      ? Hotel
      : type === "car" || type === "transfer"
      ? Car
      : type === "package"
      ? Sparkles
      : Tag;

  return (
    <div
      className={cn(
        "mt-4 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-violet-100/80 bg-gradient-to-b from-slate-50/70 via-white to-white p-2.5 sm:p-3.5 shadow-[0_8px_30px_-16px_rgba(46,16,101,0.08)]",
        className
      )}
    >
      {/* Slider Header */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100/80 text-[#7C3AED]">
            <IconComponent size={14} className={type === "flight" && rtl ? "-scale-x-100" : ""} />
          </div>
          {title ? (
            <h3 className="truncate text-[13px] font-black tracking-tight text-[#2E1065]">
              {title}
            </h3>
          ) : null}
          {safe === 0 && count > 1 && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200/60">
              <ShieldCheck size={11} />
              {locale === "ar" ? "الأرخص سعراً" : "Lowest Price"}
            </span>
          )}
        </div>

        {count > 1 ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Step Counter Badge */}
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-black tabular-nums text-[#6D28D9] border border-violet-100">
              {locale === "ar" ? `خيار ${safe + 1} من ${count}` : `Option ${safe + 1} of ${count}`}
            </span>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => go(rtl ? 1 : -1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-violet-200/80 bg-white text-[#2E1065] shadow-xs transition hover:border-[#7C3AED] hover:bg-violet-50 hover:text-[#7C3AED] active:scale-95"
                aria-label={locale === "ar" ? "السابق" : "Previous"}
              >
                {rtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              </button>
              <button
                type="button"
                onClick={() => go(rtl ? -1 : 1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-violet-200/80 bg-white text-[#2E1065] shadow-xs transition hover:border-[#7C3AED] hover:bg-violet-50 hover:text-[#7C3AED] active:scale-95"
                aria-label={locale === "ar" ? "التالي" : "Next"}
              >
                {rtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Swipeable Viewport - ZERO Horizontal Page Scroll */}
      <div
        className="w-full max-w-full overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full min-w-0 transition-opacity duration-200 ease-in-out">
          {items[safe]}
        </div>
      </div>

      {/* Interactive Pagination Dots / Pills */}
      {count > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5 pt-1 border-t border-violet-50">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 cursor-pointer rounded-full transition-all duration-300",
                i === safe
                  ? "w-7 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] shadow-xs"
                  : "w-2 bg-slate-200 hover:bg-violet-300"
              )}
              aria-label={`${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
