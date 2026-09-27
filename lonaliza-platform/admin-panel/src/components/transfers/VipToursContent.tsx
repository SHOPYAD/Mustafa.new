"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bus, Car, MessageCircle, Sparkles, Users } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TransferCard from "@/components/transfers/TransferCard";
import { getFeaturedVipDailyTours } from "@/data/transfers";
import type { TransferService } from "@/types/transfer";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import SearchAgentResultsDock from "@/components/search/SearchAgentResultsDock";
import { withAppParam } from "@/lib/mobile/app-mode";
import { cn } from "@/lib/utils";

type VehicleFilter = "all" | "sedan" | "vito" | "sprinter";

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

function vehicleBucket(item: TransferService): Exclude<VehicleFilter, "all"> | "other" {
  const hay = `${item.vehicleType} ${item.vehicleName}`.toLowerCase();
  if (hay.includes("sprinter")) return "sprinter";
  if (
    hay.includes("vito") ||
    hay.includes("v-class") ||
    hay.includes("v class") ||
    hay.includes("minivan") ||
    hay.includes("van")
  ) {
    return "vito";
  }
  if (hay.includes("sedan")) return "sedan";
  return "other";
}

export default function VipToursContent() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<TransferService[]>([]);
  const [vehicle, setVehicle] = useState<VehicleFilter>("all");
  const q =
    searchParams.get("q") ||
    searchParams.get("destination") ||
    searchParams.get("from") ||
    "";

  useEffect(() => {
    setTours(getFeaturedVipDailyTours());
  }, []);

  const filtered = useMemo(
    () =>
      tours.filter((item) => {
        if (!matchesQuery(item, q)) return false;
        if (vehicle === "all") return true;
        return vehicleBucket(item) === vehicle;
      }),
    [tours, q, vehicle]
  );

  const filterHint = q
    ? locale === "ar"
      ? `تصفية: ${q}`
      : `Filtered: ${q}`
    : null;

  const vehicleFilters: { id: VehicleFilter; label: string; Icon: typeof Car }[] = [
    { id: "all", label: t.catalog.vehicleAll, Icon: Sparkles },
    { id: "sedan", label: t.catalog.vehicleSedan, Icon: Car },
    { id: "vito", label: t.catalog.vehicleVito, Icon: Users },
    { id: "sprinter", label: t.catalog.vehicleSprinter, Icon: Bus },
  ];

  return (
    <>
      <section className="relative flex min-h-[42vh] items-center justify-center overflow-hidden md:min-h-[50vh]">
        <Image
          src="https://images.unsplash.com/photo-1527838832700-5059252407fa?w=2000"
          alt={t.catalog.vipHeroTitle}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-16 text-center sm:px-6 lg:px-8 md:pt-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md md:mb-8">
            <Sparkles size={16} className="text-emerald-400" />
            <span className="text-sm font-medium tracking-wide text-white">
              {t.catalog.vipHeroKicker}
            </span>
          </div>
          <h1
            className="mb-4 text-4xl font-bold text-white md:mb-6 md:text-6xl"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {t.catalog.vipHeroTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-white/80 md:text-xl">
            {t.catalog.vipHeroSubtitle}
          </p>
          {filterHint && (
            <p className="mt-4 text-sm text-emerald-300/90">{filterHint}</p>
          )}
        </div>
      </section>

      <div className="relative z-20 mx-auto mt-5 max-w-7xl px-4 sm:mt-6 sm:px-6 lg:px-8">
        <SearchAgentResultsDock
          tab="tours"
          page="hero"
          replace
          tone="light"
          hintLayout="stacked"
          context={`VIP tours ${q}`}
        />
      </div>

      <section className="bg-[#f4f1fa] py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
            {vehicleFilters.map(({ id, label, Icon }) => {
              const active = vehicle === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVehicle(id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-black transition active:scale-[0.98]",
                    active
                      ? "border-[#2E1065] bg-[#2E1065] text-white shadow-md shadow-purple-950/20"
                      : "border-purple-100 bg-white text-slate-700 shadow-sm hover:border-purple-200"
                  )}
                >
                  <Icon size={16} strokeWidth={2.2} />
                  {label}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="overflow-hidden rounded-[28px] border border-purple-100 bg-gradient-to-br from-[#2E1065] via-[#4c1d95] to-[#6d28d9] p-8 text-center text-white shadow-xl shadow-purple-950/20 md:p-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/20">
                <Sparkles size={28} className="text-amber-300" />
              </div>
              <h2 className="text-xl font-black md:text-2xl">{t.catalog.vipEmptyTitle}</h2>
              {q ? (
                <p className="mt-2 text-sm font-semibold text-amber-200/90">{q}</p>
              ) : null}
              <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-white/75 md:text-base">
                {t.catalog.vipEmptyHint}
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={withAppParam("/ai-chat")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-[#2E1065] shadow-sm active:scale-[0.99]"
                >
                  <Sparkles size={16} />
                  {t.catalog.vipEmptyCta}
                </Link>
                <Link
                  href={withAppParam("/contact")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-bold text-white active:scale-[0.99]"
                >
                  <MessageCircle size={16} />
                  {t.nav.contact}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
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
