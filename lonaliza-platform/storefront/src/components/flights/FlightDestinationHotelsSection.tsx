"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Crown, Hotel, Sparkles } from "lucide-react";
import HotelStars from "@/components/hotels/HotelStars";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { stayFromNightly } from "@/lib/hotel-display";
import { hotelApiSlug, parseHotelApiJson } from "@/lib/hotels-config";
import { hotelSearchToParams } from "@/lib/hotel-search";
import { localizeRoomType } from "@/lib/hotel-i18n";
import { offerCopy, ratingWord, scoreOutOf10 } from "@/lib/hotel-offer-copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";

type Props = {
  destinationCity: string;
  destinationIata?: string;
  departDate?: string;
  returnDate?: string;
  guestsCount?: number;
};

function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export default function FlightDestinationHotelsSection({
  destinationCity,
  destinationIata,
  departDate,
  guestsCount = 2,
}: Props) {
  const { locale, dir } = useLocale();
  const { formatPrice } = useCurrency();
  const c = offerCopy(locale);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sidRef = useRef("");
  const [hotels, setHotels] = useState<TravelAdvisorHotelCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const city = (destinationCity || "").trim();
  const checkIn = departDate || "";
  const checkOut = checkIn ? addDays(checkIn, 4) : "";
  const adults = Math.max(1, guestsCount);
  const searchQuery = city || (destinationIata || "").trim();

  const resultsHref = useMemo(() => {
    if (!searchQuery || !checkIn || !checkOut) return "/hotels";
    return `/hotels?${hotelSearchToParams({
      q: searchQuery,
      geoId: "",
      destId: "",
      checkIn,
      checkOut,
      adults,
      children: 0,
      rooms: 1,
      childrenAges: [],
    }).toString()}`;
  }, [searchQuery, checkIn, checkOut, adults]);

  useEffect(() => {
    if (!searchQuery || !checkIn || !checkOut) {
      setHotels([]);
      setDone(true);
      return;
    }
    let cancelled = false;
    sidRef.current = "";
    setLoading(true);
    setDone(false);
    setHotels([]);

    const searchOnce = async (sid = "") => {
      const qs = new URLSearchParams({
        q: searchQuery,
        query: searchQuery,
        city: searchQuery,
        checkIn,
        checkOut,
        adults: String(adults),
        rooms: "1",
        lang: locale,
        page: "0",
        pageSize: "50",
      });
      if (sid) qs.set("sid", sid);
      const res = await fetch(`/api/hotels/search?${qs}`, { cache: "no-store" });
      if (!res.ok) return { list: [] as TravelAdvisorHotelCard[], sid, complete: false };
      const data = parseHotelApiJson(await res.text());
      const list = Array.isArray(data.hotels) ? (data.hotels as TravelAdvisorHotelCard[]) : [];
      const nextSid = typeof data.sid === "string" && data.sid ? data.sid : sid;
      const complete = Boolean((data.progress as { complete?: boolean } | undefined)?.complete);
      return { list, sid: nextSid, complete };
    };

    void (async () => {
      try {
        const first = await searchOnce();
        if (cancelled) return;
        sidRef.current = first.sid;
        setHotels(first.list);
        if (first.complete || first.list.length >= 40) {
          setDone(true);
          return;
        }
        for (let i = 0; i < 28; i += 1) {
          await new Promise((r) => setTimeout(r, i < 8 ? 1500 : 2200));
          if (cancelled || !sidRef.current) return;
          const next = await searchOnce(sidRef.current);
          if (cancelled) return;
          setHotels((prev) => {
            const seen = new Set(next.list.map((h) => h.id));
            return [...next.list, ...prev.filter((h) => !seen.has(h.id))];
          });
          if (next.complete || next.list.length >= 40) break;
        }
      } catch {
        if (!cancelled) setHotels([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setDone(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, checkIn, checkOut, adults, locale]);

  const scroll = (offset: number) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!searchQuery) return null;
  if (done && !hotels.length && !loading) {
    return (
      <section className="rounded-[28px] border border-amber-200/70 bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#3b0764] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Crown size={16} className="text-amber-300" />
            {locale === "ar" ? `لا فنادق متاحة الآن في ${city || searchQuery}` : `No live hotels in ${city || searchQuery} yet`}
          </div>
          <Link href={resultsHref} className="rounded-xl bg-amber-400 px-3 py-2 text-[11px] font-black text-slate-950">
            {locale === "ar" ? "ابحث في الفنادق" : "Search hotels"}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-violet-200/80 bg-white shadow-[0_18px_40px_rgba(46,16,101,0.12)]">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#3b0764] px-4 py-3.5">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-amber-300">
            <Crown size={13} />
            {locale === "ar" ? "إقامة فاخرة بعد الوصول" : "Stay after landing"}
          </p>
          <p className="text-base font-black text-white">
            {locale === "ar" ? `فنادق في ${city || searchQuery}` : locale === "tr" ? `${city || searchQuery} otelleri` : `Hotels in ${city || searchQuery}`}
          </p>
          <p className="text-[11px] font-medium text-white/70">
            {locale === "ar"
              ? "صور وأسعار حية · 4 ليالٍ من تاريخ وصول الرحلة"
              : "Live photos and prices · 4 nights from flight arrival"}
            {hotels.length ? ` · ${hotels.length}` : ""}
          </p>
        </div>
        <Link
          href={resultsHref}
          className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-[11px] font-black text-slate-950 shadow-md"
        >
          {locale === "ar" ? "كل فنادق الوجهة" : locale === "tr" ? "Tüm oteller" : "All destination hotels"}
        </Link>
      </div>
      <div className="relative bg-slate-50">
        <button
          type="button"
          onClick={() => scroll(-320)}
          className="absolute start-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[#2e1065] shadow-md ring-1 ring-slate-200"
        >
          {dir === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <div
          ref={scrollerRef}
          dir="ltr"
          className="flex gap-4 overflow-x-auto touch-pan-x px-12 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {loading && !hotels.length
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[20.5rem] w-[16rem] shrink-0 animate-pulse rounded-2xl bg-slate-200" />
              ))
            : hotels.slice(0, 48).map((hotel) => {
                const photos = hotel.images?.length ? hotel.images : hotel.image ? [hotel.image] : [];
                const cover = photos[0] || "";
                const nights = Math.max(1, hotel.nights || 4);
                const money = stayFromNightly(hotel.nightly ?? hotel.priceFrom, nights);
                const nightly = money.nightly || null;
                const stayTotal = money.total || null;
                const score = hotel.reviewScore
                  ? scoreOutOf10(hotel.reviewScore.score, hotel.reviewScore.scale)
                  : hotel.rating > 0
                    ? hotel.source === "travel_advisor" && hotel.rating <= 5
                      ? Math.round(hotel.rating * 20) / 10
                      : hotel.rating
                    : 0;
                const href = `/hotels/${hotelApiSlug(hotel.id, hotel.source === "booking" ? "booking" : undefined)}?${hotelSearchToParams({
                  q: searchQuery,
                  geoId: "",
                  destId: "",
                  checkIn,
                  checkOut,
                  adults,
                  children: 0,
                  rooms: 1,
                  childrenAges: [],
                }).toString()}${hotel.sessionId ? `&sid=${hotel.sessionId}` : ""}${hotel.masterId ? `&master=${hotel.masterId}` : ""}`;
                return (
                  <article
                    key={hotel.id}
                    className="flex w-[16rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <Link href={href} className="relative block h-40 overflow-hidden bg-slate-100">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt={hotel.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2e1065] to-[#1e1b4b] text-amber-200">
                          <Hotel size={28} />
                        </div>
                      )}
                      {score > 0 ? (
                        <span className="absolute top-2.5 end-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-slate-950 shadow">
                          <Sparkles size={10} className="text-amber-500" />
                          {score.toFixed(1)}
                          <span className="font-bold text-slate-600">{ratingWord(score, locale)}</span>
                        </span>
                      ) : null}
                      {hotel.discountPct ? (
                        <span className="absolute top-2.5 start-2.5 rounded-full bg-rose-600 px-2 py-1 text-[10px] font-black text-white">
                          -{hotel.discountPct}%
                        </span>
                      ) : null}
                    </Link>
                    <div className="flex flex-1 flex-col gap-2 p-3.5">
                      <HotelStars stars={hotel.stars} size={12} />
                      <Link href={href} className="line-clamp-2 min-h-[2.5rem] text-[13px] font-extrabold leading-snug text-[#1e1b4b]">
                        {hotel.name}
                      </Link>
                      {hotel.cheapestOffer?.roomName || hotel.roomType ? (
                        <p className="line-clamp-1 text-[11px] font-semibold text-slate-500">
                          {localizeRoomType(hotel.cheapestOffer?.roomName || hotel.roomType, locale)}
                        </p>
                      ) : null}
                      <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
                        <div>
                          {nightly != null ? (
                            <>
                              <p className="text-[10px] font-bold text-slate-400">{c.perNight}</p>
                              <p className="text-lg font-black leading-none text-[#1e1b4b]">
                                {formatPrice(nightly, hotel.currency || "USD")}
                              </p>
                              {stayTotal != null ? (
                                <p className="mt-1 text-[10px] font-semibold text-slate-500">
                                  {c.totalFor(nights)}: {formatPrice(stayTotal, hotel.currency || "USD")}
                                </p>
                              ) : null}
                            </>
                          ) : (
                            <p className="text-sm font-black text-slate-400">—</p>
                          )}
                        </div>
                        <Link
                          href={href}
                          className="shrink-0 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-3 py-2 text-[11px] font-black text-white"
                        >
                          {c.seeRooms}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>
        <button
          type="button"
          onClick={() => scroll(320)}
          className="absolute end-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[#2e1065] shadow-md ring-1 ring-slate-200"
        >
          {dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </section>
  );
}
