"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TransferCard from "@/components/transfers/TransferCard";
import { getFeaturedVipDailyTours } from "@/data/transfers";
import type { TransferService } from "@/types/transfer";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function matchesQuery(item: TransferService, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    item.titleEn,
    item.titleAr,
    item.titleTr,
    item.routeFrom,
    item.routeTo,
    item.routeFromAr,
    item.routeToAr,
    item.vehicleName,
    ...(item.highlightsEn || []),
    ...(item.highlightsAr || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export default function VipToursContent() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<TransferService[]>([]);
  const q =
    searchParams.get("q") ||
    searchParams.get("destination") ||
    searchParams.get("from") ||
    "";

  useEffect(() => {
    setTours(getFeaturedVipDailyTours());
  }, []);

  const filtered = useMemo(
    () => tours.filter((item) => matchesQuery(item, q)),
    [tours, q]
  );

  const filterHint = q
    ? locale === "ar"
      ? `تصفية: ${q}`
      : `Filtered: ${q}`
    : null;

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1527838832700-5059252407fa?w=2000"
          alt={t.catalog.vipHeroTitle}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <Sparkles size={16} className="text-emerald-400" />
            <span className="text-white text-sm font-medium tracking-wide">
              {t.catalog.vipHeroKicker}
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {t.catalog.vipHeroTitle}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            {t.catalog.vipHeroSubtitle}
          </p>
          {filterHint && (
            <p className="mt-4 text-sm text-emerald-300/90">{filterHint}</p>
          )}
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              {t.transfers.noTransfers}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((item, i) => (
                <ScrollReveal key={item.id} delay={Math.min(i, 8) * 0.06}>
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
