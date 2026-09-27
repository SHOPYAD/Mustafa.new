"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { plannerCopy } from "@/lib/planner/copy";
import { placeCaption } from "@/lib/planner/day-copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { kindLabel } from "./KindMark";
import { usePlanner } from "./PlannerStore";
import { P } from "./planner-ui";
import { getSafeAttractionFallback } from "@/lib/planner/place-photos";

type WikiState = {
  image?: string;
  images?: string[];
  description?: string;
  sourceUrl?: string;
};

export default function PlaceDetailSheet() {
  const { locale } = useLocale();
  const isRtl = locale === "ar";
  const c = plannerCopy(locale);
  const { detailStop, setDetailStop, addStop, addLater, activeDay, trip } = usePlanner();
  const [wiki, setWiki] = useState<WikiState>({});
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActiveImgIndex(0);
    if (!detailStop) {
      setWiki({});
      return;
    }
    const title = locale === "ar"
      ? (detailStop.titleAr || detailStop.titleEn)
      : (detailStop.titleEn || detailStop.titleAr);
    const localDetail = locale === "ar" ? detailStop.detailAr : detailStop.detailEn;
    const city = trip?.destination || "";

    void fetch(`/internal/planner/wiki?q=${encodeURIComponent(title)}&lang=${locale}&city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          const imgs = Array.isArray(d.images) && d.images.length > 0
            ? d.images
            : [d.image || detailStop.image].filter(Boolean) as string[];
          setWiki({
            image: d.image || detailStop.image,
            images: imgs,
            description: d.description || localDetail,
            sourceUrl: d.sourceUrl,
          });
        } else {
          setWiki({
            image: detailStop.image,
            images: detailStop.image ? [detailStop.image] : [],
            description: localDetail,
          });
        }
      })
      .catch(() => {
        setWiki({
          image: detailStop.image,
          images: detailStop.image ? [detailStop.image] : [],
          description: localDetail,
        });
      });
  }, [detailStop, locale, trip?.destination]);

  if (!detailStop || typeof document === "undefined") return null;
  const title = placeCaption(detailStop, locale);
  const fallback = getSafeAttractionFallback(detailStop.kind, trip?.destination);
  const gallery = wiki.images && wiki.images.length > 0
    ? wiki.images
    : wiki.image
    ? [wiki.image]
    : detailStop.image
    ? [detailStop.image]
    : [fallback];

  const currentImage = gallery[activeImgIndex] || fallback;
  const detail = wiki.description || (locale === "ar" ? detailStop.detailAr : detailStop.detailEn);

  const prevImage = () => {
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  };

  const nextImage = () => {
    setActiveImgIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe right
        if (isRtl) nextImage();
        else prevImage();
      } else {
        // swipe left
        if (isRtl) prevImage();
        else nextImage();
      }
    }
    touchStartX.current = null;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[560] flex items-end bg-black/60 backdrop-blur-sm lg:items-center lg:justify-center p-0 lg:p-4"
      onClick={() => setDetailStop(null)}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <button
        type="button"
        onClick={() => setDetailStop(null)}
        className="absolute end-4 top-4 z-[580] flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/65 active:scale-95 shadow-xl border border-white/20"
        aria-label="close"
      >
        <X size={20} />
      </button>

      <div
        className="relative max-h-[92vh] w-full overflow-hidden rounded-t-[32px] bg-white shadow-2xl lg:max-w-xl lg:rounded-[32px] border border-violet-100 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Swipable Gallery Slider Header */}
        <div
          className="relative h-64 sm:h-72 w-full shrink-0 bg-slate-900 select-none overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentImage}
            src={currentImage}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallback;
            }}
            className="h-full w-full object-cover transition-opacity duration-300 animate-in fade-in"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

          {/* Top category & count pill */}
          <div className="absolute top-4 start-4 end-16 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2E1065]/85 backdrop-blur-md px-3 py-1 text-[11px] font-black text-amber-300 border border-violet-400/30 shadow-md">
              <Sparkles size={12} className="text-amber-400" />
              {kindLabel(detailStop.kind, locale)}
            </span>
            {gallery.length > 1 && (
              <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-black text-white border border-white/20 tabular-nums">
                {activeImgIndex + 1} / {gallery.length}
              </span>
            )}
          </div>

          {/* Slider Prev / Next Controls */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute start-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95 border border-white/20 shadow-md"
                aria-label="Previous photo"
              >
                {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute end-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95 border border-white/20 shadow-md"
                aria-label="Next photo"
              >
                {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>

              {/* Slider Dots */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
                {gallery.map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      idx === activeImgIndex
                        ? "w-5 bg-white shadow"
                        : "w-1.5 bg-white/40"
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Bottom Title on Image */}
          <div className="absolute bottom-3 start-4 end-4 pointer-events-none">
            <h3 className="text-[20px] sm:text-[22px] font-black leading-snug text-white drop-shadow-md [unicode-bidi:isolate]">
              {title}
            </h3>
          </div>
        </div>

        {/* Scrollable Content Details */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 [scrollbar-width:thin]">
          {/* Quick Metrics & Tags */}
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#4B4568]">
            {detailStop.rating ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-[12px] font-black text-amber-800 border border-amber-200">
                <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
                {detailStop.rating}
              </span>
            ) : null}
            {detailStop.visitMinutes ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-violet-50 px-2.5 py-1 text-[12px] font-bold text-violet-800 border border-violet-100">
                <Clock size={13} />
                {c.visit} {detailStop.visitMinutes} {c.min}
              </span>
            ) : null}
            {detailStop.hours ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[12px] font-bold text-slate-700">
                {c.open}: {detailStop.hours}
              </span>
            ) : null}
            {trip?.destination ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[12px] font-bold text-slate-700">
                <MapPin size={13} className="text-violet-600" />
                {trip.destination}
              </span>
            ) : null}
          </div>

          {/* Detailed Narrative & Historical Summary */}
          {detail ? (
            <div className="space-y-2 rounded-2xl bg-[#FBF9FE] p-4 border border-violet-100/60">
              <h4 className="text-[13px] font-black text-[#2E1065] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#7C3AED]" />
                {locale === "ar" ? "نبذة توثيقية وتاريخية" : "Historical Overview & Details"}
              </h4>
              <p className="text-[14px] leading-relaxed text-[#332A51]">
                {detail}
              </p>
            </div>
          ) : null}

          {/* External Wiki Citation Link */}
          {wiki.sourceUrl ? (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
              <span>{c.sourceWiki}</span>
              <a
                href={wiki.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-violet-600 hover:text-violet-800 hover:underline"
              >
                <span>{locale === "ar" ? "المزيد على ويكيبيديا" : "Read on Wikipedia"}</span>
                <ExternalLink size={11} />
              </a>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">{c.sourceWiki}</p>
          )}

          {/* Action Footer Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                addStop(detailStop, activeDay || 1);
                setDetailStop(null);
              }}
              className={cn(P.btn, P.btnPrimary, "flex-1 h-12 text-[14px] font-black rounded-2xl shadow-lg shadow-violet-500/20")}
            >
              <Plus size={16} />
              {c.add}
            </button>
            <button
              type="button"
              onClick={() => {
                addLater(detailStop);
                setDetailStop(null);
              }}
              className={cn(P.btn, P.btnGhost, "h-12 text-[13px] font-bold rounded-2xl border border-violet-200/80")}
            >
              <BookmarkPlus size={16} />
              {c.addToLater}
            </button>
            {detailStop.href ? (
              <a
                href={detailStop.href}
                target="_blank"
                rel="noreferrer"
                className={cn(P.btn, P.btnGhost, "h-12 text-[13px] font-bold rounded-2xl border border-violet-200/80")}
              >
                <ExternalLink size={16} />
                {c.book}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

