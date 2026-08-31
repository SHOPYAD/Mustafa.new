"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Car } from "lucide-react";
import CouponSlider from "@/components/loyalty/CouponSlider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TransferCard from "@/components/transfers/TransferCard";
import { getActiveTransfers } from "@/data/transfers";
import type { TransferService } from "@/types/transfer";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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

  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || searchParams.get("q") || "";

  useEffect(() => {
    setTransfers(getActiveTransfers().filter((item) => item.type === "transfer"));
  }, []);

  const filtered = useMemo(() => {
    return transfers.filter((item) => matchesRoute(item, fromParam, toParam));
  }, [transfers, fromParam, toParam]);

  const filterHint =
    fromParam || toParam
      ? locale === "ar"
        ? `تصفية: ${[fromParam, toParam].filter(Boolean).join(" → ")}`
        : `Filtered: ${[fromParam, toParam].filter(Boolean).join(" → ")}`
      : null;

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=2000"
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
              {t.transfers.bannerKicker}
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {t.transfers.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            {t.transfers.subtitle}
          </p>
          {filterHint && (
            <p className="mt-4 text-sm text-emerald-300/90">{filterHint}</p>
          )}
        </div>
      </section>

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
