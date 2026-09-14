"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format } from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import { priceCalendar } from "@/components/flights/api";
import {
  formatCalendarPrice,
  parseYmd,
  sliderWindow,
  ymdOf,
} from "@/components/flights/calendar-utils";
import FlightPriceTrendsModal from "@/components/flights/FlightPriceTrendsModal";
import type { FlightCopy } from "@/components/flights/copy";
import type { AirportPick, CalendarDayPrice, FlightSearchQuery } from "@/components/flights/types";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  query: FlightSearchQuery;
  copy: FlightCopy;
  onSelectDate: (date: string) => void;
  minLivePrice?: number;
};

function dfOf(locale: string) {
  if (locale === "ar") return ar;
  if (locale === "tr") return tr;
  return enUS;
}

const CLIENT_CALENDAR_CACHE = new Map<string, CalendarDayPrice[]>();

export function useRouteCalendarPrices(
  origin: AirportPick | null,
  destination: AirportPick | null,
  date: string,
  currency: string
) {
  const [days, setDays] = useState<CalendarDayPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const originSkyId = origin?.skyId || "";
  const destinationSkyId = destination?.skyId || "";
  const originEntityId = origin?.entityId || "";
  const destinationEntityId = destination?.entityId || "";
  const routeReady = Boolean(originSkyId && destinationSkyId);
  const cacheKey = `${originSkyId}_${destinationSkyId}_${currency}_${date || ""}`;

  useEffect(() => {
    if (!routeReady) {
      setDays([]);
      return;
    }

    if (CLIENT_CALENDAR_CACHE.has(cacheKey)) {
      setDays(CLIENT_CALENDAR_CACHE.get(cacheKey)!);
      return;
    }

    const center = parseYmd(date) || new Date();
    const today = new Date();
    const from = ymdOf(new Date(today.getFullYear(), today.getMonth(), 1));
    const horizon = addDays(new Date(center.getFullYear(), center.getMonth(), center.getDate()), 60);
    const to = ymdOf(new Date(horizon.getFullYear(), horizon.getMonth() + 1, 0));
    let cancelled = false;
    setLoading(true);

    void priceCalendar({
      originSkyId,
      destinationSkyId,
      originEntityId,
      destinationEntityId,
      fromDate: from,
      toDate: to,
      date,
      currency,
    })
      .then((rows) => {
        if (!cancelled && rows.length > 0) {
          CLIENT_CALENDAR_CACHE.set(cacheKey, rows);
          setDays(rows);
        }
      })
      .catch(() => {
        if (!cancelled) setDays([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [originSkyId, destinationSkyId, originEntityId, destinationEntityId, date, currency, routeReady, cacheKey]);

  return { days, loading, routeReady };
}

function FlightDatePriceSliderComponent({ query, copy, onSelectDate, minLivePrice }: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const dfLocale = dfOf(locale);
  const scroller = useRef<HTMLDivElement>(null);
  const [trendsOpen, setTrendsOpen] = useState(false);
  const { days, loading } = useRouteCalendarPrices(query.origin, query.destination, query.date, query.currency);
  const priceMap = useMemo(() => {
    const map = new Map(days.map((row) => [row.date, row]));
    if (minLivePrice && minLivePrice > 0 && query.date) {
      map.set(query.date, {
        date: query.date,
        price: Math.round(minLivePrice),
        currency: query.currency,
      });
    }
    return map;
  }, [days, minLivePrice, query.date, query.currency]);
  const windowDays = useMemo(() => sliderWindow(query.date || ymdOf(new Date()), days, 45), [days, query.date]);

  const scrollBy = (dirSign: number) => {
    const el = scroller.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.7) * dirSign;
    el.scrollBy({ left: dir === "rtl" ? -delta : delta, behavior: "smooth" });
  };

  if (!query.origin || !query.destination) return null;

  return (
    <>
      <div className="mb-4 overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setTrendsOpen(true)}
            className="flex w-[5rem] shrink-0 flex-col items-center justify-center gap-1 border-e border-purple-200 bg-purple-50 px-2.5 py-3 text-center text-xs font-black text-purple-950 hover:bg-purple-100 transition-colors"
          >
            <BarChart3 size={17} className="text-[#2e1065]" />
            <span className="leading-tight">{copy.priceChart}</span>
          </button>
          <button
            type="button"
            className="inline-flex w-8 shrink-0 items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            onClick={() => scrollBy(-1)}
            aria-label={copy.seeAllDates}
          >
            {dir === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <div
            ref={scroller}
            className="flex min-w-0 flex-1 snap-x snap-mandatory gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {windowDays.map((ymd) => {
              const d = parseYmd(ymd);
              if (!d) return null;
              const priced = priceMap.get(ymd);
              const selected = ymd === query.date;
              return (
                <button
                  key={ymd}
                  type="button"
                  onClick={() => onSelectDate(ymd)}
                  className={cn(
                    "min-w-[5.6rem] snap-start px-3 py-2.5 text-center transition",
                    selected ? "bg-purple-50/90 font-bold" : "hover:bg-slate-50"
                  )}
                >
                  <p className={cn("text-[11px]", selected ? "text-purple-950 font-extrabold" : "text-slate-700 font-bold")}>
                    {format(d, "EEEE d MMM", { locale: dfLocale })}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-extrabold",
                      selected ? "text-[#2e1065] font-black" : priced ? "text-[#1e1b4b]" : "text-slate-500 font-semibold"
                    )}
                  >
                    {priced
                      ? formatFlightPrice(priced.price, priced.currency || query.currency)
                      : loading
                        ? "…"
                        : "—"}
                  </p>
                  {selected ? <span className="mx-auto mt-1 block h-1 w-10 rounded-full bg-gradient-to-r from-[#2e1065] to-amber-500" /> : null}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="inline-flex w-8 shrink-0 items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            onClick={() => scrollBy(1)}
            aria-label={copy.seeAllDates}
          >
            {dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setTrendsOpen(true)}
            className="hidden shrink-0 px-4 py-2 my-1.5 mx-2 rounded-xl border border-purple-200 bg-purple-50 text-xs font-bold text-purple-950 hover:bg-gradient-to-r hover:from-[#2e1065] hover:to-[#4c1d95] hover:text-white shadow-2xs transition-all sm:block"
          >
            {copy.seeAllDates}
          </button>
        </div>
      </div>
      {trendsOpen ? (
        <FlightPriceTrendsModal
          query={query}
          days={days}
          copy={copy}
          compactPrice={formatCalendarPrice}
          onClose={() => setTrendsOpen(false)}
          onSelectDate={(ymd) => {
            setTrendsOpen(false);
            onSelectDate(ymd);
          }}
        />
      ) : null}
    </>
  );
}

const FlightDatePriceSlider = memo(FlightDatePriceSliderComponent);
export default FlightDatePriceSlider;
