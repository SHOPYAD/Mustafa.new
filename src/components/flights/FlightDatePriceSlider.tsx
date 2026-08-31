"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
};

function dfOf(locale: string) {
  if (locale === "ar") return ar;
  if (locale === "tr") return tr;
  return enUS;
}

export function useRouteCalendarPrices(
  origin: AirportPick | null,
  destination: AirportPick | null,
  date: string,
  currency: string
) {
  const [days, setDays] = useState<CalendarDayPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const routeReady = Boolean(origin?.skyId && destination?.skyId && origin.entityId && destination.entityId);

  useEffect(() => {
    if (!routeReady) {
      setDays([]);
      return;
    }
    const center = parseYmd(date) || new Date();
    const from = ymdOf(new Date(center.getFullYear(), center.getMonth(), 1));
    const to = ymdOf(addDays(new Date(center.getFullYear(), center.getMonth() + 2, 1), -1));
    let cancelled = false;
    setLoading(true);
    void priceCalendar({
      originSkyId: origin!.skyId,
      destinationSkyId: destination!.skyId,
      originEntityId: origin!.entityId,
      destinationEntityId: destination!.entityId,
      fromDate: from,
      toDate: to,
      currency,
    })
      .then((rows) => {
        if (!cancelled) setDays(rows);
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
  }, [origin, destination, date, currency, routeReady]);

  return { days, loading, routeReady };
}

export default function FlightDatePriceSlider({ query, copy, onSelectDate }: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const dfLocale = dfOf(locale);
  const scroller = useRef<HTMLDivElement>(null);
  const [trendsOpen, setTrendsOpen] = useState(false);
  const { days, loading } = useRouteCalendarPrices(query.origin, query.destination, query.date, query.currency);
  const priceMap = useMemo(() => new Map(days.map((row) => [row.date, row])), [days]);
  const windowDays = useMemo(() => sliderWindow(query.date || ymdOf(new Date()), days, 12), [days, query.date]);

  const scrollBy = (dirSign: number) => {
    const el = scroller.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.7) * dirSign;
    el.scrollBy({ left: dir === "rtl" ? -delta : delta, behavior: "smooth" });
  };

  if (!query.origin || !query.destination) return null;

  return (
    <>
      <div className="mb-4 overflow-hidden rounded-2xl border border-[#051741]/10 bg-white shadow-sm">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setTrendsOpen(true)}
            className="flex w-[4.6rem] shrink-0 flex-col items-center justify-center gap-1 border-e border-slate-100 bg-[#f3faf7] px-2 py-3 text-center text-[11px] font-bold text-[#051741] hover:bg-emerald-50"
          >
            <BarChart3 size={16} className="text-[#10b981]" />
            <span className="leading-tight">{copy.priceChart}</span>
          </button>
          <button
            type="button"
            className="inline-flex w-8 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-50"
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
                    selected ? "bg-[#051741]/[0.04]" : "hover:bg-slate-50"
                  )}
                >
                  <p className={cn("text-[11px] font-semibold", selected ? "text-[#051741]" : "text-slate-500")}>
                    {format(d, "EEEE d MMM", { locale: dfLocale })}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-bold",
                      selected ? "text-[#10b981]" : priced ? "text-[#051741]" : "text-slate-300"
                    )}
                  >
                    {priced
                      ? formatFlightPrice(priced.price, priced.currency || query.currency)
                      : loading
                        ? "…"
                        : "—"}
                  </p>
                  {selected ? <span className="mx-auto mt-1 block h-0.5 w-10 rounded-full bg-[#10b981]" /> : null}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="inline-flex w-8 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-50"
            onClick={() => scrollBy(1)}
            aria-label={copy.seeAllDates}
          >
            {dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setTrendsOpen(true)}
            className="hidden shrink-0 px-3 text-xs font-bold text-[#10b981] hover:bg-emerald-50 sm:block"
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
