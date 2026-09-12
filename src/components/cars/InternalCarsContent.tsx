"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Car,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import CouponSlider from "@/components/loyalty/CouponSlider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import LocationAutocomplete from "@/components/cars/LocationAutocomplete";
import CarCard from "@/components/cars/CarCard";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import SearchAgentResultsDock from "@/components/search/SearchAgentResultsDock";
import { SEARCH_AGENT_EVENT, type SearchAgentEventDetail } from "@/lib/search-agent";
import type { RentalCar } from "@/types/car";
import { rentalDays } from "@/lib/cars/matching";
import { locationDisplayName, resolveLocationQuery } from "@/lib/cars/turkey-locations";
import { carDisplayName } from "@/lib/cars/labels";

export default function InternalCarsContent() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pickup, setPickup] = useState(
    searchParams.get("pickup") ||
      searchParams.get("from") ||
      searchParams.get("location") ||
      ""
  );
  const [dropoff, setDropoff] = useState(
    searchParams.get("dropoff") || searchParams.get("to") || ""
  );
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [returnDate, setReturnDate] = useState(
    searchParams.get("returnDate") || ""
  );
  const [guests, setGuests] = useState(searchParams.get("guests") || "2");
  const [cars, setCars] = useState<RentalCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onAgent = (event: Event) => {
      const detail = (event as CustomEvent<SearchAgentEventDetail>).detail;
      if (!detail) return;
      if (detail.action === "filter" || detail.action === "navigate") {
        const city = detail.filters?.hotelName || "";
        const pickupNext = (detail as { pickup?: string }).pickup;
        if (pickupNext || city) setPickup(pickupNext || city);
        if (detail.href && detail.action === "navigate") {
          router.push(detail.href);
        }
      }
    };
    window.addEventListener(SEARCH_AGENT_EVENT, onAgent);
    return () => window.removeEventListener(SEARCH_AGENT_EVENT, onAgent);
  }, [router]);

  useEffect(() => {
    setPickup(
      searchParams.get("pickup") ||
        searchParams.get("from") ||
        searchParams.get("location") ||
        ""
    );
    setDropoff(searchParams.get("dropoff") || searchParams.get("to") || "");
    setDate(searchParams.get("date") || "");
    setReturnDate(searchParams.get("returnDate") || "");
    setGuests(searchParams.get("guests") || "2");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    const pickupValue =
      searchParams.get("pickup") ||
      searchParams.get("from") ||
      searchParams.get("location") ||
      "";
    const dropoffValue =
      searchParams.get("dropoff") || searchParams.get("to") || "";
    if (pickupValue) params.set("pickup", pickupValue);
    if (dropoffValue) params.set("dropoff", dropoffValue);
    if (searchParams.get("guests")) {
      params.set("guests", searchParams.get("guests") || "");
    }
    if (searchParams.get("category")) {
      params.set("category", searchParams.get("category") || "");
    }

    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/cars${params.toString() ? `?${params}` : ""}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!cancelled && data?.ok && Array.isArray(data.cars)) {
          setCars(data.cars as RentalCar[]);
        }
      } catch {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const days = rentalDays(date, returnDate);

  const filterHint = useMemo(() => {
    const bits = [pickup, dropoff].filter(Boolean);
    if (!bits.length && !date) return null;
    return bits.join(" → ");
  }, [pickup, dropoff, date]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickup) params.set("pickup", pickup);
    if (dropoff) params.set("dropoff", dropoff);
    if (date) params.set("date", date);
    if (returnDate) params.set("returnDate", returnDate);
    if (guests) params.set("guests", guests);
    router.push(params.toString() ? `/cars?${params}` : "/cars");
  };

  const buildMessage = (car: RentalCar) => {
    const name = carDisplayName(car, locale);
    const pickupLoc = resolveLocationQuery(pickup);
    const dropoffLoc = resolveLocationQuery(dropoff);
    const pickupLabel = pickupLoc
      ? locationDisplayName(pickupLoc, locale)
      : pickup;
    const dropoffLabel = dropoffLoc
      ? locationDisplayName(dropoffLoc, locale)
      : dropoff;

    if (locale === "ar") {
      return [
        `مرحباً لوناليزا للسياحة والسفر، أرغب بحجز سيارة: ${name}`,
        pickupLabel ? `الاستلام: ${pickupLabel}` : "",
        dropoffLabel ? `التسليم: ${dropoffLabel}` : "",
        date ? `من: ${date}` : "",
        returnDate ? `إلى: ${returnDate}` : "",
        guests ? `عدد الركاب: ${guests}` : "",
        `السعر: $${car.pricePerDay} / يوم (USD)`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    if (locale === "tr") {
      return [
        `Merhaba Alrayyan Turizm, araç kiralamak istiyorum: ${name}`,
        pickupLabel ? `Alış: ${pickupLabel}` : "",
        dropoffLabel ? `Bırakış: ${dropoffLabel}` : "",
        date ? `Başlangıç: ${date}` : "",
        returnDate ? `Bitiş: ${returnDate}` : "",
        guests ? `Yolcu: ${guests}` : "",
        `Fiyat: $${car.pricePerDay} / gün (USD)`,
      ]
        .filter(Boolean)
        .join("\n");
    }
    return [
      `Hello Alrayyan Tourism, I would like to rent: ${name}`,
      pickupLabel ? `Pickup: ${pickupLabel}` : "",
      dropoffLabel ? `Drop-off: ${dropoffLabel}` : "",
      date ? `From: ${date}` : "",
      returnDate ? `To: ${returnDate}` : "",
      guests ? `Passengers: ${guests}` : "",
      `Rate: $${car.pricePerDay} / day (USD)`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  return (
    <>
      <section className="pt-28 pb-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 text-[#2e1065] mb-4 shadow-xs">
              <Car size={26} />
            </div>
            <h1
              className="text-3xl md:text-5xl font-bold text-slate-900 mb-3"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {t.cars.title}
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto">{t.cars.subtitle}</p>
          </div>

          <SearchAgentResultsDock
            tab="cars"
            page="hero"
            replace
            tone="light"
            className="mt-2"
            context={`Cars ${pickup} ${dropoff} ${date} ${returnDate} guests ${guests}`}
          >
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4"
          >
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t.cars.pickup}
              </label>
              <LocationAutocomplete
                value={pickup}
                onChange={(value) => setPickup(value)}
                placeholder={t.cars.pickupPlaceholder}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t.cars.dropoff}
              </label>
              <LocationAutocomplete
                value={dropoff}
                onChange={(value) => setDropoff(value)}
                placeholder={t.cars.dropoffPlaceholder}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t.cars.pickupDate}
              </label>
              <div className="relative">
                <Calendar className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full ps-11 pe-3 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 font-medium"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t.cars.dropoffDate}
              </label>
              <div className="relative">
                <Calendar className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full ps-11 pe-3 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 font-medium"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t.cars.passengers}
              </label>
              <div className="relative">
                <Users className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full ps-11 pe-3 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 font-medium appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="md:col-span-12 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:brightness-110 text-white font-bold rounded-xl shadow-md shadow-purple-950/20 transition-all"
              >
                <Search size={18} className="text-amber-300" />
                {t.cars.searchCars}
              </button>
            </div>
          </form>
          </SearchAgentResultsDock>
        </div>
      </section>

      <section className="pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CouponSlider service="cars" className="mb-6" />
          {filterHint ? (
            <p className="text-sm font-bold text-[#2e1065] mb-6">
              {t.search.resultsFor}: {filterHint}
            </p>
          ) : null}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#2e1065]" />
            </div>
          ) : cars.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-400">
              {t.cars.noResults}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car, i) => (
                <ScrollReveal key={car.id} delay={i * 0.06}>
                  <CarCard
                    car={car}
                    days={days}
                    whatsappMessage={buildMessage(car)}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
