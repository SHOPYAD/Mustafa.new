"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Calendar, Star, Filter, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { featuredPackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import { packageRecency, sortPackagesNewestFirst } from "@/lib/packages-sort";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import CouponSlider from "@/components/loyalty/CouponSlider";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { tContent } from "@/lib/utils";
import type { HolidayPackage } from "@/types/package";

const DEST_KEYS = [
  "all",
  "Istanbul",
  "Antalya",
  "Cappadocia",
  "Trabzon",
  "Bursa",
  "Sapanca",
  "Bodrum",
  "Izmir",
  "Pamukkale",
  "Ankara",
  "Gaziantep",
  "Fethiye",
  "Konya",
] as const;

type DestKey = (typeof DEST_KEYS)[number];
type DurationKey = "any" | "3-4" | "5-7" | "8-14" | "15";
type SortKey = "newest" | "featured" | "price-asc" | "price-desc" | "rating" | "duration";

function destLabel(key: DestKey, locale: "ar" | "en" | "tr", allLabel: string): string {
  if (key === "all") return allLabel;
  const map: Record<Exclude<DestKey, "all">, { ar: string; en: string; tr: string }> = {
    Istanbul: { ar: "إسطنبول", en: "Istanbul", tr: "İstanbul" },
    Antalya: { ar: "أنطاليا", en: "Antalya", tr: "Antalya" },
    Cappadocia: { ar: "كابادوكيا", en: "Cappadocia", tr: "Kapadokya" },
    Trabzon: { ar: "طرابزون", en: "Trabzon", tr: "Trabzon" },
    Bursa: { ar: "بورصة", en: "Bursa", tr: "Bursa" },
    Sapanca: { ar: "سبانجا", en: "Sapanca", tr: "Sapanca" },
    Bodrum: { ar: "بودروم", en: "Bodrum", tr: "Bodrum" },
    Izmir: { ar: "إزمير", en: "Izmir", tr: "İzmir" },
    Pamukkale: { ar: "باموكالي", en: "Pamukkale", tr: "Pamukkale" },
    Ankara: { ar: "أنقرة", en: "Ankara", tr: "Ankara" },
    Gaziantep: { ar: "غازي عنتاب", en: "Gaziantep", tr: "Gaziantep" },
    Fethiye: { ar: "فتحية", en: "Fethiye", tr: "Fethiye" },
    Konya: { ar: "قونية", en: "Konya", tr: "Konya" },
  };
  return map[key][locale];
}

function matchesDestination(pkg: HolidayPackage, dest: DestKey): boolean {
  if (dest === "all") return true;
  const hay = [
    pkg.destination,
    pkg.destinationEn,
    pkg.destinationAr,
    pkg.destinationTr,
    ...(pkg.destinations ?? []),
    ...(pkg.destinationsEn ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(dest.toLowerCase());
}

function matchesDuration(days: number, key: DurationKey): boolean {
  switch (key) {
    case "any":
      return true;
    case "3-4":
      return days >= 3 && days <= 4;
    case "5-7":
      return days >= 5 && days <= 7;
    case "8-14":
      return days >= 8 && days <= 14;
    case "15":
      return days >= 15;
    default: {
      const _never: never = key;
      return _never;
    }
  }
}

function HolidaysContent() {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const cat = t.catalog;
  const [packages, setPackages] = useState<HolidayPackage[]>(featuredPackages);
  const [destination, setDestination] = useState<DestKey>("all");
  const [duration, setDuration] = useState<DurationKey>("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [visible, setVisible] = useState(12);

  useEffect(() => {
    void fetchPublishedPackages().then(setPackages);
    const q = searchParams.get("q") || "";
    if (!q) return;
    const match = DEST_KEYS.find(
      (key) => key !== "all" && key.toLowerCase() === q.toLowerCase()
    );
    if (match) setDestination(match);
  }, [searchParams]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: packages.length };
    for (const key of DEST_KEYS) {
      if (key === "all") continue;
      next[key] = packages.filter((pkg) => matchesDestination(pkg, key)).length;
    }
    return next;
  }, [packages]);

  const filtered = useMemo(() => {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Number.POSITIVE_INFINITY;
    const list = packages.filter((pkg) => {
      if (!matchesDestination(pkg, destination)) return false;
      if (!matchesDuration(pkg.durationDays, duration)) return false;
      if (pkg.price < min || pkg.price > max) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "newest":
        return sortPackagesNewestFirst(sorted);
      case "featured":
        sorted.sort((a, b) => {
          const featured = Number(b.isFeatured) - Number(a.isFeatured);
          if (featured !== 0) return featured;
          return packageRecency(b) - packageRecency(a);
        });
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "duration":
        sorted.sort((a, b) => a.durationDays - b.durationDays);
        break;
      default: {
        const _never: never = sort;
        return _never;
      }
    }
    return sorted;
  }, [packages, destination, duration, minPrice, maxPrice, sort]);

  const shown = filtered.slice(0, visible);

  return (
    <>
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=2000"
          alt={t.nav.holidays}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="text-white text-sm font-medium tracking-wide">
              {cat.heroKicker}
            </span>
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-4 py-1.5 text-sm font-bold text-emerald-100">
            <MapPin size={14} />
            {cat.inTurkey}
          </div>
          <h1
            className="mb-6 text-3xl font-bold text-white sm:text-5xl md:text-7xl"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {cat.heroTitle}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-400">
              {cat.heroHighlight}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl px-1 text-base font-light leading-relaxed text-white/80 sm:text-xl">
            {cat.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 shrink-0">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/60 sticky top-24">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                    <Filter size={20} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{cat.refineSearch}</h3>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-amber-600" />
                    {cat.destination}
                  </h4>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pe-1">
                    {DEST_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-xl hover:bg-amber-50"
                      >
                        <input
                          type="radio"
                          name="destination"
                          checked={destination === key}
                          onChange={() => {
                            setDestination(key);
                            setVisible(12);
                          }}
                          className="w-4 h-4 text-amber-600"
                        />
                        <span className="text-slate-600 group-hover:text-amber-700 font-medium flex-1">
                          {destLabel(key, locale, cat.allDestinations)}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                          {counts[key] ?? 0}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-amber-600" />
                    {cat.duration}
                  </h4>
                  <select
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value as DurationKey);
                      setVisible(12);
                    }}
                    className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="any">{cat.anyDuration}</option>
                    <option value="3-4">{cat.days34}</option>
                    <option value="5-7">{cat.days57}</option>
                    <option value="8-14">{cat.days814}</option>
                    <option value="15">{cat.days15}</option>
                  </select>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-4">{cat.priceRange}</h4>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder={cat.minPrice}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm"
                    />
                    <input
                      type="number"
                      placeholder={cat.maxPrice}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDestination("all");
                    setDuration("any");
                    setMinPrice("");
                    setMaxPrice("");
                    setSort("newest");
                    setVisible(12);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl"
                >
                  {cat.resetFilters}
                </button>
              </div>
            </aside>

            <div className="flex-1">
              <CouponSlider service="packages" className="mb-6" />
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-slate-600">{cat.showingPackages(filtered.length)}</p>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                >
                  <option value="newest">{cat.sortBy}: {cat.sortNewest}</option>
                  <option value="featured">{cat.sortBy}: {cat.sortFeatured}</option>
                  <option value="price-asc">{cat.sortPriceLow}</option>
                  <option value="price-desc">{cat.sortPriceHigh}</option>
                  <option value="rating">{cat.sortRating}</option>
                  <option value="duration">{cat.sortDuration}</option>
                </select>
              </div>

              {shown.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl text-slate-500">
                  {cat.noPackages}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shown.map((pkg, i) => {
                    const title = tContent(pkg, "title", locale);
                    const dest = tContent(pkg, "destination", locale);
                    const nights = pkg.durationNights ?? Math.max(1, pkg.durationDays - 1);
                    return (
                      <ScrollReveal key={pkg.id} delay={Math.min(i, 6) * 0.05}>
                        <Link
                          href={`/package/${pkg.slug}`}
                          className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                        >
                          <div className="relative h-52 overflow-hidden">
                            <SafeImage
                              src={pkg.images[0]?.url || ""}
                              alt={pkg.images[0]?.alt || title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-4 start-4 flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow">
                                {cat.inTurkey}
                              </span>
                              {pkg.isFeatured && (
                                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                                  {cat.featured}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                              <MapPin size={14} />
                              <span>{dest}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600">
                              {title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {pkg.durationDays} {cat.days} / {nights} {cat.nights}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                {pkg.rating}
                              </span>
                            </div>
                            <LoyaltyPointsRow
                              amount={pkg.price}
                              currency={pkg.currency || "USD"}
                              service="packages"
                              className="mb-3"
                            />
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-2xl font-bold text-slate-900">
                                  {formatPrice(pkg.price, pkg.currency || "USD")}
                                </span>
                                <span className="text-slate-500 text-sm">{cat.perPerson}</span>
                              </div>
                              <span className="flex items-center gap-1 text-orange-600 font-semibold text-sm">
                                {cat.view} <ArrowRight size={16} className="rtl:rotate-180" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </ScrollReveal>
                    );
                  })}
                </div>
              )}

              {visible < filtered.length && (
                <div className="text-center mt-12">
                  <button
                    type="button"
                    onClick={() => setVisible((n) => n + 12)}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
                  >
                    {cat.loadMore}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function HolidaysPage() {
  return (
    <Suspense
      fallback={
        <section className="pt-28 pb-20 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 h-80 bg-slate-200 rounded-2xl animate-pulse" />
        </section>
      }
    >
      <HolidaysContent />
    </Suspense>
  );
}
