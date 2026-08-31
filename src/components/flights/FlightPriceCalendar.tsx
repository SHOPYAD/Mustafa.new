"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  addMonths,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import { priceCalendar } from "@/components/flights/api";
import { formatCalendarPrice, parseYmd, ymdOf } from "@/components/flights/calendar-utils";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import type { FlightCopy } from "@/components/flights/copy";
import type { AirportPick, CalendarDayPrice } from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  tripType: "one-way" | "round-trip";
  depart: string;
  returnDate: string;
  origin: AirportPick | null;
  destination: AirportPick | null;
  currency: string;
  copy: FlightCopy;
  initialPick?: "depart" | "return";
  onChange: (depart: string, returnDate: string) => void;
  onDone: () => void;
};

function toYmd(date: Date): string {
  return ymdOf(date);
}

function weekdayLabels(locale: string, dfLocale: typeof ar) {
  const saturdayStart = locale === "ar";
  const start = saturdayStart ? new Date(2024, 5, 1) : new Date(2024, 5, 2);
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "EEEEEE", { locale: dfLocale }));
}

export default function FlightPriceCalendar({
  tripType,
  depart,
  returnDate,
  origin,
  destination,
  currency,
  copy,
  initialPick = "depart",
  onChange,
  onDone,
}: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const dfLocale = locale === "ar" ? ar : locale === "tr" ? tr : enUS;
  const departDate = parseYmd(depart);
  const backDate = parseYmd(returnDate);
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(() => startOfMonth(departDate || today));
  const [pickingReturn, setPickingReturn] = useState(
    tripType === "round-trip" && initialPick === "return" && Boolean(departDate)
  );

  useEffect(() => {
    setPickingReturn(tripType === "round-trip" && initialPick === "return" && Boolean(departDate));
  }, [initialPick, tripType, departDate]);
  const [prices, setPrices] = useState<CalendarDayPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const routeReady = Boolean(
    origin?.skyId && destination?.skyId && origin.entityId && destination.entityId
  );
  const months = useMemo(() => [month, addMonths(month, 1)], [month]);
  const labels = weekdayLabels(locale, dfLocale);
  const saturdayStart = locale === "ar";

  useEffect(() => {
    if (!routeReady) {
      setPrices([]);
      setLoadingPrices(false);
      return;
    }
    let cancelled = false;
    const fromDate = toYmd(startOfMonth(month));
    const toDate = toYmd(addDays(addMonths(startOfMonth(month), 2), -1));
    setLoadingPrices(true);
    void priceCalendar({
      originSkyId: origin!.skyId,
      destinationSkyId: destination!.skyId,
      originEntityId: origin!.entityId,
      destinationEntityId: destination!.entityId,
      fromDate,
      toDate,
      currency,
    })
      .then((rows) => {
        if (!cancelled) setPrices(rows);
      })
      .catch(() => {
        if (!cancelled) setPrices([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPrices(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, destination, month, currency, routeReady]);

  const priceMap = useMemo(() => new Map(prices.map((row) => [row.date, row.price])), [prices]);
  const cheapest = useMemo(() => {
    if (!prices.length) return 0;
    return Math.min(...prices.map((row) => row.price));
  }, [prices]);

  const pickDay = (day: Date) => {
    const ymd = toYmd(day);
    if (tripType === "one-way") {
      onChange(ymd, "");
      onDone();
      return;
    }
    if (!pickingReturn || !departDate || !isAfter(day, departDate)) {
      const nextOut = backDate && isAfter(backDate, day) ? toYmd(backDate) : toYmd(addDays(day, 7));
      onChange(ymd, nextOut);
      setPickingReturn(true);
      return;
    }
    onChange(depart, ymd);
    setPickingReturn(false);
    onDone();
  };

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className={cn("rounded-xl border px-3 py-2.5", !pickingReturn ? "border-[var(--brand-primary)] bg-emerald-50" : "border-slate-200 bg-slate-50")}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{copy.departure}</p>
          <p className="mt-0.5 text-sm font-bold text-[var(--navy)]">
            {departDate ? format(departDate, "d MMM yyyy", { locale: dfLocale }) : copy.selectDates}
          </p>
        </div>
        {tripType === "round-trip" ? (
          <div className={cn("rounded-xl border px-3 py-2.5", pickingReturn ? "border-[var(--brand-primary)] bg-emerald-50" : "border-slate-200 bg-slate-50")}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{copy.return}</p>
            <p className="mt-0.5 text-sm font-bold text-[var(--navy)]">
              {backDate ? format(backDate, "d MMM yyyy", { locale: dfLocale }) : copy.selectDates}
            </p>
          </div>
        ) : (
          <div />
        )}
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => setMonth((m) => addMonths(m, -1))}
        >
          {dir === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-semibold text-slate-600">{copy.selectDates}</p>
          {!routeReady ? (
            <p className="mt-0.5 text-xs text-amber-600">{copy.pickFromList}</p>
          ) : loadingPrices ? (
            <p className="mt-0.5 text-xs text-slate-400">…</p>
          ) : prices.length > 0 ? (
            <p className="mt-0.5 text-xs font-medium text-emerald-600">
              {copy.cheapestDay}: {formatFlightPrice(cheapest, currency)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          {dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {months.map((m, monthIndex) => {
          const first = startOfMonth(m);
          const startPad = saturdayStart ? (first.getDay() + 1) % 7 : first.getDay();
          const daysInMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
          const cells = [
            ...Array.from({ length: startPad }, () => null),
            ...Array.from({ length: daysInMonth }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i + 1)),
          ];
          return (
            <div key={m.toISOString()} className={cn(monthIndex === 1 && "hidden md:block")}>
              <p className="mb-3 text-center text-base font-bold text-[var(--navy)]">
                {format(m, "MMMM yyyy", { locale: dfLocale })}
              </p>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
                {labels.map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <span key={`e-${i}`} />;
                  const ymd = toYmd(day);
                  const beforeDepart =
                    pickingReturn && departDate ? isBefore(day, departDate) : false;
                  const disabled = isBefore(day, today) || beforeDepart;
                  const inRange =
                    tripType === "round-trip" &&
                    departDate &&
                    backDate &&
                    !isBefore(day, departDate) &&
                    isBefore(day, backDate);
                  const isIn = departDate && isSameDay(day, departDate);
                  const isOut = tripType === "round-trip" && backDate && isSameDay(day, backDate);
                  const dayPrice = priceMap.get(ymd);
                  const isCheapest = Boolean(dayPrice && cheapest && dayPrice === cheapest);
                  return (
                    <button
                      key={ymd}
                      type="button"
                      disabled={disabled}
                      onClick={() => pickDay(day)}
                      className={cn(
                        "flex min-h-[3.65rem] flex-col items-center justify-center rounded-xl px-0.5 py-1 text-sm transition",
                        disabled && "cursor-not-allowed text-slate-300",
                        !disabled && !isIn && !isOut && inRange && "bg-emerald-50 text-emerald-950",
                        (isIn || isOut) && "bg-[var(--brand-primary)] font-bold text-white shadow-sm",
                        !disabled && !isIn && !isOut && !inRange && "text-slate-800 hover:bg-slate-100",
                        isCheapest && !isIn && !isOut && "bg-emerald-50 ring-1 ring-emerald-500"
                      )}
                    >
                      <span className="leading-none">{day.getDate()}</span>
                      {dayPrice && !disabled ? (
                        <span
                          className={cn(
                            "mt-1 max-w-full truncate text-[10px] font-bold leading-none",
                            isIn || isOut
                              ? "text-white/90"
                              : isCheapest
                                ? "text-emerald-700"
                                : "text-slate-500"
                          )}
                        >
                          {formatCalendarPrice(dayPrice)}
                        </span>
                      ) : loadingPrices && routeReady && !disabled ? (
                        <span className="mt-1 text-[10px] text-slate-300">…</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-[var(--navy)] py-3 text-sm font-bold text-white hover:opacity-90"
        onClick={onDone}
      >
        {copy.done}
      </button>
    </div>
  );
}
