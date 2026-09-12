"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Star, Filter, Search } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CouponSlider from "@/components/loyalty/CouponSlider";
import HotelCard from "@/components/hotels/HotelCard";
import { getActiveHotels } from "@/data/hotels";
import type { Hotel } from "@/types/hotel";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";

export default function InternalHotelsContent() {
  const { locale, t } = useLocale();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [city, setCity] = useState("all");
  const [stars, setStars] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setHotels(getActiveHotels());
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(hotels.map((h) => h.city))).sort(),
    [hotels]
  );

  const filtered = hotels.filter((h) => {
    if (city !== "all" && h.city !== city) return false;
    if (stars !== "all" && h.stars !== Number(stars)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = tContent(h, "name", locale).toLowerCase();
      const neighborhood = tContent(h, "neighborhood", locale).toLowerCase();
      const address = tContent(h, "address", locale).toLowerCase();
      if (
        !name.includes(q) &&
        !neighborhood.includes(q) &&
        !address.includes(q) &&
        !h.city.toLowerCase().includes(q) &&
        !h.amenities.some((a) => a.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=2000"
          alt="Hotels"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="text-white text-sm font-medium tracking-wide">
              {t.hotels.stars}
            </span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {t.hotels.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            {t.hotels.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 font-semibold flex-shrink-0">
              <Filter size={18} className="text-orange-500" />
              Filter
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.hotels.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="all">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={stars}
              onChange={(e) => setStars(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="all">All stars</option>
              {[5, 4, 3].map((s) => (
                <option key={s} value={s}>
                  {s} {t.hotels.stars}
                </option>
              ))}
            </select>

            <p className="lg:ms-auto text-sm text-slate-500 whitespace-nowrap">
              <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
              hotels
            </p>
          </div>

          <CouponSlider service="hotels" className="mb-6" />

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">{t.hotels.noHotels}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((hotel, i) => (
                <ScrollReveal key={hotel.id} delay={i * 0.08}>
                  <HotelCard hotel={hotel} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
