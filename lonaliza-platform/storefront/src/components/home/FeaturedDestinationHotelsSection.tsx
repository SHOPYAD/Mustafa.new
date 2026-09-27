"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Compass,
} from "lucide-react";
import FeaturedHotelCard from "@/components/hotels/FeaturedHotelCard";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export interface DestinationTab {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  flag: string;
}

const DESTINATIONS: DestinationTab[] = [
  { id: "istanbul", nameAr: "إسطنبول", nameEn: "Istanbul", countryAr: "تركيا", countryEn: "Turkey", flag: "🇹🇷" },
  { id: "antalya", nameAr: "أنطاليا", nameEn: "Antalya", countryAr: "تركيا", countryEn: "Turkey", flag: "🇹🇷" },
  { id: "trabzon", nameAr: "طرابزون", nameEn: "Trabzon", countryAr: "تركيا", countryEn: "Turkey", flag: "🇹🇷" },
  { id: "casablanca", nameAr: "الدار البيضاء", nameEn: "Casablanca", countryAr: "المغرب", countryEn: "Morocco", flag: "🇲🇦" },
  { id: "london", nameAr: "لندن", nameEn: "London", countryAr: "بريطانيا", countryEn: "UK", flag: "🇬🇧" },
  { id: "paris", nameAr: "باريس", nameEn: "Paris", countryAr: "فرنسا", countryEn: "France", flag: "🇫🇷" },
  { id: "newyork", nameAr: "نيويورك", nameEn: "New York", countryAr: "أمريكا", countryEn: "USA", flag: "🇺🇸" },
  { id: "washington", nameAr: "واشنطن", nameEn: "Washington", countryAr: "أمريكا", countryEn: "USA", flag: "🇺🇸" },
  { id: "seoul", nameAr: "سيول", nameEn: "Seoul", countryAr: "كوريا", countryEn: "Korea", flag: "🇰🇷" },
  { id: "bali", nameAr: "بالي", nameEn: "Bali", countryAr: "إندونيسيا", countryEn: "Indonesia", flag: "🇮🇩" },
  { id: "madrid", nameAr: "مدريد", nameEn: "Madrid", countryAr: "إسبانيا", countryEn: "Spain", flag: "🇪🇸" },
  { id: "barcelona", nameAr: "برشلونة", nameEn: "Barcelona", countryAr: "إسبانيا", countryEn: "Spain", flag: "🇪🇸" },
];

export default function FeaturedDestinationHotelsSection() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState<string>("istanbul");
  const [hotelsByDest, setHotelsByDest] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [datesMeta, setDatesMeta] = useState<{ checkIn: string; checkOut: string } | null>(null);

  // Tabs Slider Navigation
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const [startXTabs, setStartXTabs] = useState(0);
  const [scrollLeftTabs, setScrollLeftTabs] = useState(0);

  // Hotel Cards Slider Navigation
  const cardsSliderRef = useRef<HTMLDivElement>(null);
  const [isDraggingCards, setIsDraggingCards] = useState(false);
  const [startXCards, setStartXCards] = useState(0);
  const [scrollLeftCards, setScrollLeftCards] = useState(0);

  const scrollTabs = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const amount = 260;
    const sign = direction === "left" ? -amount : amount;
    scrollContainerRef.current.scrollBy({ left: sign, behavior: "smooth" });
  };

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDraggingTabs(true);
    setStartXTabs(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftTabs(scrollContainerRef.current.scrollLeft);
  };

  const handleTabsMouseLeaveOrUp = () => {
    setIsDraggingTabs(false);
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabs || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXTabs) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftTabs - walk;
  };

  // Cards Slider Scroll
  const scrollCards = (direction: "prev" | "next") => {
    if (!cardsSliderRef.current) return;
    const container = cardsSliderRef.current;
    const cardEl = container.querySelector<HTMLElement>(".hotel-card-slide");
    const step = cardEl ? cardEl.offsetWidth + 24 : 410;
    const sign = direction === "next" ? 1 : -1;
    // In RTL locales, scrolling forward (next) moves scrollLeft accordingly
    const rtlMultiplier = isAr ? -1 : 1;
    container.scrollBy({ left: sign * step * rtlMultiplier, behavior: "smooth" });
  };

  const handleCardsMouseDown = (e: React.MouseEvent) => {
    if (!cardsSliderRef.current) return;
    // Don't start drag if clicking interactive elements inside cards
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select")) return;
    setIsDraggingCards(true);
    setStartXCards(e.pageX - cardsSliderRef.current.offsetLeft);
    setScrollLeftCards(cardsSliderRef.current.scrollLeft);
  };

  const handleCardsMouseLeaveOrUp = () => {
    setIsDraggingCards(false);
  };

  const handleCardsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCards || !cardsSliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - cardsSliderRef.current.offsetLeft;
    const walk = (x - startXCards) * 1.5;
    cardsSliderRef.current.scrollLeft = scrollLeftCards - walk;
  };

  // Fetch hotels for a given destination
  const fetchDestinationHotels = useCallback(async (destId: string, forceRefresh = false) => {
    if (!forceRefresh && hotelsByDest[destId] && hotelsByDest[destId].length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/hotels/featured-destinations?destination=${destId}${forceRefresh ? "&refresh=1" : ""}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.hotels)) {
        setHotelsByDest((prev) => ({
          ...prev,
          [destId]: data.hotels,
        }));
        if (data.checkIn && data.checkOut) {
          setDatesMeta({ checkIn: data.checkIn, checkOut: data.checkOut });
        }
      }
    } catch (err) {
      console.error("Failed to load destination hotels:", err);
    } finally {
      setIsLoading(false);
    }
  }, [hotelsByDest]);

  // Initial load
  useEffect(() => {
    fetchDestinationHotels(activeTab);
  }, [activeTab, fetchDestinationHotels]);

  // Reset cards slider position when switching destination tab
  useEffect(() => {
    if (cardsSliderRef.current) {
      cardsSliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  const currentHotels = hotelsByDest[activeTab] || [];
  const currentDestMeta = DESTINATIONS.find((d) => d.id === activeTab) || DESTINATIONS[0];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-y border-slate-200/70 dark:border-slate-800/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-600/10 text-purple-700 dark:text-purple-300 text-xs font-black w-fit mb-2.5 border border-purple-500/20">
              <Sparkles size={13} className="text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>{isAr ? "باقات وإقامات فندقية مختارة بعناية" : "Curated Luxury Hotel Stays"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {isAr ? "أفضل عروض الفنادق لأهم الوجهات السياحية" : "Top Hotel Deals for Leading Destinations"}
            </h2>

            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
              {isAr
                ? "إقامات فاخرة وخيارات متنوعة بأفضل الأسعار المضمونة، مع مرونة كاملة في الحجز وتأكيد فوري وخيارات إلغاء ميسّرة."
                : "Handpicked premium stays with best rates guaranteed, flexible cancellation options, and instant verified booking."}
            </p>
          </div>

          {/* Controls & Badges */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Next Week Ahead Date Range Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/25 text-xs font-bold shadow-2xs">
              <Calendar size={14} className="text-amber-500 shrink-0" />
              <span>
                {isAr ? "عروض الأسبوع القادم: " : "Next Week Deals: "}
                <strong className="font-black text-amber-700 dark:text-amber-300">
                  {datesMeta ? `${datesMeta.checkIn} إلى ${datesMeta.checkOut}` : "تحديث فوري حي"}
                </strong>
              </span>
            </div>

            {/* High-Contrast Royal Purple Slider Navigation Arrows in Header (Only when hotels exist) */}
            {currentHotels.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCards(isAr ? "next" : "prev")}
                  className="size-10 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center transition-all shadow-md shadow-purple-700/30 cursor-pointer active:scale-90 border-0"
                  title={isAr ? "السابق" : "Previous"}
                  aria-label="Previous"
                >
                  <ChevronRight size={22} className="stroke-[3] text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCards(isAr ? "prev" : "next")}
                  className="size-10 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center transition-all shadow-md shadow-purple-700/30 cursor-pointer active:scale-90 border-0"
                  title={isAr ? "التالي" : "Next"}
                  aria-label="Next"
                >
                  <ChevronLeft size={22} className="stroke-[3] text-white" />
                </button>
              </div>
            )}

            {/* View All Button */}
            <Link
              href={`/hotels?destination=${currentDestMeta.nameEn}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/25 transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-95"
            >
              <span>{isAr ? `عرض الكل في ${currentDestMeta.nameAr}` : `View all in ${currentDestMeta.nameEn}`}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Attractive Sliding Destination Tabs */}
        <div className="relative flex items-center gap-2 mb-8 select-none">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollTabs("left")}
            className="size-10 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center transition-all shadow-md shadow-purple-700/30 shrink-0 cursor-pointer z-10 active:scale-90 border-0"
            title={isAr ? "التمرير لليمين" : "Scroll Left"}
          >
            <ChevronRight size={22} className="stroke-[3] text-white" />
          </button>

          {/* Smooth Scrollable Tabs Container */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleTabsMouseDown}
            onMouseLeave={handleTabsMouseLeaveOrUp}
            onMouseUp={handleTabsMouseLeaveOrUp}
            onMouseMove={handleTabsMouseMove}
            className="flex items-center gap-2 overflow-x-auto min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-1 px-1 cursor-grab active:cursor-grabbing"
          >
            {DESTINATIONS.map((dest) => {
              const isActive = activeTab === dest.id;
              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => setActiveTab(dest.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer shadow-2xs border",
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-lg shadow-purple-500/25 scale-[1.02]"
                      : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80"
                  )}
                >
                  <span className="text-base">{dest.flag}</span>
                  <span>{isAr ? dest.nameAr : dest.nameEn}</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {isAr ? dest.countryAr : dest.countryEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollTabs("right")}
            className="size-10 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center transition-all shadow-md shadow-purple-700/30 shrink-0 cursor-pointer z-10 active:scale-90 border-0"
            title={isAr ? "التمرير لليسار" : "Scroll Right"}
          >
            <ChevronLeft size={22} className="stroke-[3] text-white" />
          </button>
        </div>

        {/* Hotel Cards Carousel / Slider */}
        <div className="relative group/slider">
          {/* Floating Right Navigation Button (Pointing Right) */}
          {currentHotels.length > 0 && (
            <button
              type="button"
              onClick={() => scrollCards("next")}
              className="hidden md:flex absolute -end-5 top-1/2 -translate-y-1/2 size-12 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white border-2 border-white dark:border-slate-800 shadow-2xl items-center justify-center transition-all duration-200 cursor-pointer z-30 hover:scale-110 active:scale-95 group/btn"
              title={isAr ? "العرض التالي" : "Next"}
              aria-label="Next Hotel"
            >
              <ChevronLeft size={24} className="stroke-white stroke-[3]" />
            </button>
          )}

          {/* Smooth Cards Slider Container */}
          <div
            ref={cardsSliderRef}
            onMouseDown={handleCardsMouseDown}
            onMouseLeave={handleCardsMouseLeaveOrUp}
            onMouseUp={handleCardsMouseLeaveOrUp}
            onMouseMove={handleCardsMouseMove}
            className="flex items-stretch gap-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory py-2 px-1 cursor-grab active:cursor-grabbing select-none"
          >
            {isLoading && currentHotels.length === 0 ? (
              /* Skeleton Shimmer Loading in Slider */
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="hotel-card-slide w-[88vw] sm:w-[380px] lg:w-[390px] shrink-0 snap-start rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-pulse flex flex-col h-[480px]"
                >
                  <div className="h-60 bg-slate-200 dark:bg-slate-800 w-full" />
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full mt-auto" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
                  </div>
                </div>
              ))
            ) : currentHotels.length === 0 ? (
              /* Empty State When No Supplier Deals Available (User Requirement) */
              <div className="w-full py-14 px-6 rounded-3xl border border-dashed border-purple-300 dark:border-purple-800/50 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-center my-2 shadow-xs">
                <div className="size-16 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20 shadow-xs">
                  <Compass size={32} className="stroke-[2.2]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">
                  {isAr
                    ? `لا توجد عروض فنادق متوفرة حالياً من المزودين في ${currentDestMeta.nameAr}`
                    : `No live supplier hotel deals currently available in ${currentDestMeta.nameEn}`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mb-6 leading-relaxed font-medium">
                  {isAr
                    ? `تعتمد هذه القائمة حصراً ومباشرة على محركات وموردي الفنادق المعتمدة. يمكنك إعادة المحاولة الآن للتحقق من أي غرف شاغرة أو الانتقال لمحرك البحث الكامل.`
                    : `This showcase relies strictly on verified live supplier rates. You can refresh to check for new available inventory or use the full search engine.`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fetchDestinationHotels(activeTab, true)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                    <span>{isAr ? "البحث لاحقاً / تحديث العروض" : "Search Again / Refresh"}</span>
                  </button>
                  <Link
                    href={`/hotels?destination=${currentDestMeta.nameEn}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-2xs"
                  >
                    <span>{isAr ? `الانتقال لمحرك البحث في ${currentDestMeta.nameAr}` : `Full Search in ${currentDestMeta.nameEn}`}</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            ) : (
              currentHotels.map((hotel) => (
                <div
                  key={hotel.id || hotel.slug}
                  className="hotel-card-slide w-[88vw] sm:w-[380px] lg:w-[390px] shrink-0 snap-start flex flex-col"
                >
                  <FeaturedHotelCard
                    hotel={hotel}
                    checkIn={datesMeta?.checkIn}
                    checkOut={datesMeta?.checkOut}
                  />
                </div>
              ))
            )}
          </div>

          {/* Floating Left Navigation Button (Pointing Left) */}
          {currentHotels.length > 0 && (
            <button
              type="button"
              onClick={() => scrollCards("prev")}
              className="hidden md:flex absolute -start-5 top-1/2 -translate-y-1/2 size-12 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white border-2 border-white dark:border-slate-800 shadow-2xl items-center justify-center transition-all duration-200 cursor-pointer z-30 hover:scale-110 active:scale-95 group/btn"
              title={isAr ? "العرض السابق" : "Previous"}
              aria-label="Previous Hotel"
            >
              <ChevronRight size={24} className="stroke-white stroke-[3]" />
            </button>
          )}
        </div>

        {/* Bottom Trust & Refresh Notice */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <span className="font-medium">
              {isAr
                ? "جميع الأسعار المعروضة شاملة الضرائب والرسوم، مع ضمان أفضل سعر وتأكيد حجز فوري وموثّق."
                : "All prices are all-inclusive with taxes and fees, best price guarantee, and instant verified booking."}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentHotels.length > 0 && (
              <span className="text-[11px] font-bold text-slate-400">
                {isAr ? `يعرض ${currentHotels.length} فنادق مميزة من المزودين` : `Showing ${currentHotels.length} live supplier hotels`}
              </span>
            )}
            <button
              type="button"
              onClick={() => fetchDestinationHotels(activeTab, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer shrink-0"
              title={isAr ? "تحديث الأسعار فورا" : "Refresh prices"}
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin text-purple-600" : ""} />
              <span>{isAr ? "تحديث الأسعار" : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
