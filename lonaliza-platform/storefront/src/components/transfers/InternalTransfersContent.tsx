"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Car } from "lucide-react";
import CouponSlider from "@/components/loyalty/CouponSlider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TransferCard from "@/components/transfers/TransferCard";
import { getActiveTransfers, fetchDynamicTransfers } from "@/data/transfers";
import type { TransferService } from "@/types/transfer";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import SeeruRideLiveSearch from "@/components/transfers/SeeruRideLiveSearch";
import SearchAgentResultsDock from "@/components/search/SearchAgentResultsDock";

function matchesRoute(
  item: TransferService,
  from: string,
  to: string
): boolean {
  if (!from && !to) return true;
  const hay = [
    item.titleEn,
    item.titleAr,
    item.routeFrom,
    item.routeTo,
    item.routeFromAr,
    item.routeToAr,
    item.vehicleName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const fromOk = !from || hay.includes(from.toLowerCase());
  const toOk = !to || hay.includes(to.toLowerCase());
  return fromOk && toOk;
}

export default function InternalTransfersContent() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const [transfers, setTransfers] = useState<TransferService[]>([]);

  const modeParam = searchParams.get("mode") || "transfer";
  const cityParam = searchParams.get("city") || "";
  const hoursParam = searchParams.get("hours") || "";
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || searchParams.get("q") || "";

  useEffect(() => {
    let cancelled = false;
    void fetchDynamicTransfers()
      .then((all) => {
        if (cancelled) return;
        if (modeParam === "daily_tour" || modeParam === "hourly") {
          setTransfers(all.filter((item) => item.type === "vip_tour"));
        } else {
          setTransfers(all.filter((item) => item.type === "transfer"));
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (modeParam === "daily_tour" || modeParam === "hourly") {
          setTransfers(getActiveTransfers().filter((item) => item.type === "vip_tour"));
        } else {
          setTransfers(getActiveTransfers().filter((item) => item.type === "transfer"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [modeParam]);

  const filtered = useMemo(() => {
    if (modeParam === "daily_tour" || modeParam === "hourly") {
      if (!cityParam) return transfers;
      return transfers.filter((item) => {
        const hay = [
          item.titleEn,
          item.titleAr,
          item.routeFrom,
          item.routeTo,
          item.routeFromAr,
          item.routeToAr,
          item.vehicleName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(cityParam.toLowerCase());
      });
    }
    return transfers.filter((item) => matchesRoute(item, fromParam, toParam));
  }, [transfers, modeParam, cityParam, fromParam, toParam]);

  const filterHint =
    modeParam === "daily_tour" || modeParam === "hourly"
      ? locale === "ar"
        ? `جولات سياحية يومية: ${cityParam || "تركيا"} (${hoursParam ? `${hoursParam} ساعات` : "يوم كامل"})`
        : `Daily Tours: ${cityParam || "Turkey"} (${hoursParam ? `${hoursParam} hours` : "Full Day"})`
      : fromParam || toParam
        ? locale === "ar"
          ? `تصفية: ${[fromParam, toParam].filter(Boolean).join(" → ")}`
          : `Filtered: ${[fromParam, toParam].filter(Boolean).join(" → ")}`
        : null;

  const isDailyTour = modeParam === "daily_tour" || modeParam === "hourly";

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src={
            isDailyTour
              ? "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=2000"
              : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=2000"
          }
          alt={t.transfers.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <Car size={16} className="text-emerald-400" />
            <span className="text-white text-sm font-medium tracking-wide">
              {isDailyTour
                ? locale === "ar"
                  ? "جولات يومية بسائق خاص VIP"
                  : "VIP Private Chauffeur Tours"
                : t.transfers.bannerKicker}
            </span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {isDailyTour
              ? locale === "ar"
                ? "الجولات السياحية اليومية بالسيارة الخاصة"
                : "Private Daily Tours by the Hour"
              : t.transfers.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            {isDailyTour
              ? locale === "ar"
                ? "فانات وسيارات مايباخ وفيتو مع سائق محترف وخبير تحت تصرفك بالساعات في أهم معالم تركيا"
                : "VIP Mercedes Vito & Sprinter vans with dedicated professional chauffeurs"
              : t.transfers.subtitle}
          </p>
          {filterHint && (
            <p className="mt-4 text-sm font-bold text-amber-300 drop-shadow-md">{filterHint}</p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <SearchAgentResultsDock
          tab="transfers"
          page="hero"
          replace
          tone="light"
          context={`Transfer ${fromParam} → ${toParam}`}
        />
      </div>
      <SeeruRideLiveSearch />

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CouponSlider service="transfers" className="mb-6" />
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              {t.transfers.noTransfers}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 0.08}>
                  <TransferCard transfer={item} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
