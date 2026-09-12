"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { addDays, addMonths, format, startOfMonth } from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import FlightPriceCalendar from "@/components/flights/FlightPriceCalendar";
import { cheapestOf, parseYmd, ymdOf } from "@/components/flights/calendar-utils";
import type { FlightCopy } from "@/components/flights/copy";
import type { CalendarDayPrice, FlightSearchQuery } from "@/components/flights/types";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  query: FlightSearchQuery;
  days: CalendarDayPrice[];
  copy: FlightCopy;
  compactPrice: (amount: number) => string;
  onClose: () => void;
  onSelectDate: (date: string) => void;
};

function dfOf(locale: string) {
  if (locale === "ar") return ar;
  if (locale === "tr") return tr;
  return enUS;
}

export default function FlightPriceTrendsModal({
  query,
  days,
  copy,
  compactPrice,
  onClose,
  onSelectDate,
}: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const dfLocale = dfOf(locale);
  const [tab, setTab] = useState<"calendar" | "chart">("chart");
  const [chartStart, setChartStart] = useState(() => startOfMonth(parseYmd(query.date) || new Date()));
  const [hover, setHover] = useState<string | null>(null);

  const chartDays = useMemo(() => {
    const from = ymdOf(chartStart);
    const to = ymdOf(addDays(addMonths(chartStart, 2), -1));
    return days.filter((row) => row.date >= from && row.date <= to && row.price > 0);
  }, [chartStart, days, query.currency]);

  const maxPrice = Math.max(1, ...chartDays.map((row) => row.price));
  const cheapest = cheapestOf(days);
  const active = hover || query.date;
  const activeRow = chartDays.find((row) => row.date === active) || days.find((row) => row.date === active);
  const monthTicks = useMemo(() => {
    const seen = new Set<string>();
    return chartDays
      .map((row) => {
        const d = parseYmd(row.date);
        if (!d) return null;
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (seen.has(key)) return null;
        seen.add(key);
        return { date: row.date, label: format(d, "MMMM", { locale: dfLocale }) };
      })
      .filter((item): item is { date: string; label: string } => Boolean(item));
  }, [chartDays, dfLocale]);

  const originCity = query.origin?.city || query.origin?.iata || "";
  const destCity = query.destination?.city || query.destination?.iata || "";

  return (
    <div className="fixed inset-0 z-[140]">
      <button type="button" className="absolute inset-0 bg-[#1b053a]/60 backdrop-blur-xs" onClick={onClose} aria-label={copy.closeDetails} />
      <div
        dir={dir}
        className="absolute inset-x-3 top-[6%] mx-auto flex max-h-[88vh] max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-6 border border-purple-100"
      >
        <div className="flex items-start justify-between gap-3 border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-amber-50/20 px-5 py-4">
          <div>
            <p className="text-lg font-black text-purple-950">
              {originCity} {dir === "rtl" ? "←" : "→"} {destCity} · {copy.priceTrends}
            </p>
            <p className="mt-1 text-xs text-slate-500">{copy.priceTrendsHint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-900 hover:bg-purple-100 transition-colors"
            aria-label={copy.closeDetails}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-3">
          <button
            type="button"
            onClick={() => setTab("chart")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all",
              tab === "chart" ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-sm" : "bg-purple-50 text-purple-900 hover:bg-purple-100"
            )}
          >
            {copy.priceChart}
          </button>
          <button
            type="button"
            onClick={() => setTab("calendar")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all",
              tab === "calendar" ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-sm" : "bg-purple-50 text-purple-900 hover:bg-purple-100"
            )}
          >
            {copy.selectDates}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-3 py-4 sm:px-5">
          {tab === "calendar" ? (
            <FlightPriceCalendar
              tripType={query.tripType === "one-way" ? "one-way" : "round-trip"}
              depart={query.date}
              returnDate={query.returnDate}
              origin={query.origin}
              destination={query.destination}
              currency={query.currency}
              copy={copy}
              onChange={(depart) => onSelectDate(depart)}
              onDone={onClose}
            />
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-100 bg-white text-purple-900 shadow-sm hover:bg-purple-50"
                  onClick={() => setChartStart((d) => addMonths(d, -2))}
                >
                  {dir === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                <p className="text-sm font-black text-purple-950">
                  {format(chartStart, "MMMM yyyy", { locale: dfLocale })} —{" "}
                  {format(addMonths(chartStart, 1), "MMMM yyyy", { locale: dfLocale })}
                </p>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-100 bg-white text-purple-900 shadow-sm hover:bg-purple-50"
                  onClick={() => setChartStart((d) => addMonths(d, 2))}
                >
                  {dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>

              <div className="relative h-64 rounded-2xl bg-slate-50 border border-purple-50 px-2 pt-10 pb-8">
                {activeRow?.price ? (
                  <div className="absolute start-3 top-2 z-10 rounded-xl border border-purple-100 bg-white px-3 py-2 shadow-md">
                    <p className="text-[11px] text-slate-500">
                      {parseYmd(activeRow.date)
                        ? format(parseYmd(activeRow.date) as Date, "EEEE d MMMM", { locale: dfLocale })
                        : activeRow.date}
                    </p>
                    <p className="text-sm font-black text-[#1e1b4b]">
                      {copy.fromPrice} {formatFlightPrice(activeRow.price, activeRow.currency || query.currency)}
                    </p>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-black text-purple-700 hover:text-purple-950"
                      onClick={() => onSelectDate(activeRow.date)}
                    >
                      {copy.searchShort}
                    </button>
                  </div>
                ) : null}
                <div className="absolute end-2 top-2 text-[10px] font-bold text-slate-500">
                  {formatFlightPrice(maxPrice, query.currency)}
                </div>
                <div className="flex h-full items-end gap-px">
                  {chartDays.map((row) => {
                    const h = row.price > 0 ? Math.max(8, (row.price / maxPrice) * 100) : 4;
                    const selected = row.date === query.date;
                    const cheap = cheapest > 0 && row.price === cheapest;
                    return (
                      <button
                        key={row.date}
                        type="button"
                        title={row.date}
                        onMouseEnter={() => setHover(row.date)}
                        onFocus={() => setHover(row.date)}
                        onClick={() => onSelectDate(row.date)}
                        className="group relative flex h-full min-w-0 flex-1 items-end"
                      >
                        <span
                          className={cn(
                            "mx-auto w-full max-w-[10px] rounded-t-sm transition-all",
                            selected ? "bg-[#2e1065]" : cheap ? "bg-amber-400 shadow-sm" : "bg-purple-200 group-hover:bg-purple-400"
                          )}
                          style={{ height: `${h}%` }}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="absolute inset-x-2 bottom-1 flex justify-between text-[10px] font-semibold text-slate-400">
                  {monthTicks.map((tick) => (
                    <span key={tick.date}>{tick.label}</span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-400">{copy.pricesReference}</p>
              {cheapest > 0 ? (
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black text-amber-900">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    {copy.cheapestDay}: {compactPrice(cheapest)}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
