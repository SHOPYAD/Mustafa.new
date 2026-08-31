"use client";

import { useMemo, useState } from "react";
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
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type Props = {
  checkIn: string;
  checkOut: string;
  locale: Locale;
  dir: "ltr" | "rtl";
  nightsLabel: string;
  checkInLabel: string;
  checkOutLabel: string;
  selectCheckIn: string;
  selectCheckOut: string;
  doneLabel: string;
  onChange: (checkIn: string, checkOut: string) => void;
  onDone: () => void;
};

function parseYmd(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

function weekdayLabels(locale: Locale, dfLocale: typeof ar) {
  const saturdayStart = locale === "ar";
  const start = saturdayStart
    ? new Date(2024, 5, 1)
    : new Date(2024, 5, 2);
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), "EEEEEE", { locale: dfLocale })
  );
}

export default function HotelDateRangePicker({
  checkIn,
  checkOut,
  locale,
  dir,
  nightsLabel,
  checkInLabel,
  checkOutLabel,
  selectCheckIn,
  selectCheckOut,
  doneLabel,
  onChange,
  onDone,
}: Props) {
  const dfLocale = locale === "ar" ? ar : locale === "tr" ? tr : enUS;
  const checkInDate = parseYmd(checkIn);
  const checkOutDate = parseYmd(checkOut);
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(() =>
    startOfMonth(checkInDate || today)
  );
  const [pickingOut, setPickingOut] = useState(false);
  const months = useMemo(
    () => [month, addMonths(month, 1)],
    [month]
  );
  const labels = weekdayLabels(locale, dfLocale);
  const saturdayStart = locale === "ar";

  const pickDay = (day: Date) => {
    const ymd = toYmd(day);
    if (!pickingOut || !checkInDate || !isAfter(day, checkInDate)) {
      const nextOut = checkOutDate && isAfter(checkOutDate, day)
        ? toYmd(checkOutDate)
        : toYmd(addDays(day, 1));
      onChange(ymd, nextOut);
      setPickingOut(true);
      return;
    }
    onChange(checkIn, ymd);
    setPickingOut(false);
    onDone();
  };

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <div
          className={cn(
            "rounded-xl border px-3 py-2.5",
            !pickingOut ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50"
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {checkInLabel}
          </p>
          <p className="mt-0.5 text-sm font-bold text-[#051741]">
            {checkInDate
              ? format(checkInDate, "d MMMM yyyy", { locale: dfLocale })
              : selectCheckIn}
          </p>
        </div>
        <div
          className={cn(
            "rounded-xl border px-3 py-2.5",
            pickingOut ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50"
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {checkOutLabel}
          </p>
          <p className="mt-0.5 text-sm font-bold text-[#051741]">
            {checkOutDate
              ? format(checkOutDate, "d MMMM yyyy", { locale: dfLocale })
              : selectCheckOut}
          </p>
        </div>
        <div className="col-span-2 flex items-center justify-center rounded-xl bg-[#051741] px-4 py-2.5 text-sm font-bold text-white sm:col-span-1">
          {nightsLabel}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="prev-month"
        >
          {dir === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <p className="text-sm font-semibold text-slate-600">
          {pickingOut ? selectCheckOut : selectCheckIn}
        </p>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="next-month"
        >
          {dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {months.map((m, monthIndex) => {
          const first = startOfMonth(m);
          const startPad = saturdayStart
            ? (first.getDay() + 1) % 7
            : first.getDay();
          const daysInMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
          const cells = [
            ...Array.from({ length: startPad }, () => null),
            ...Array.from({ length: daysInMonth }, (_, i) =>
              new Date(m.getFullYear(), m.getMonth(), i + 1)
            ),
          ];
          return (
            <div
              key={m.toISOString()}
              className={cn(monthIndex === 1 && "hidden md:block")}
            >
              <p className="mb-3 text-center text-base font-bold text-[#051741]">
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
                  const disabled = isBefore(day, today);
                  const inRange =
                    checkInDate &&
                    checkOutDate &&
                    !isBefore(day, checkInDate) &&
                    isBefore(day, checkOutDate);
                  const isIn = checkInDate && isSameDay(day, checkInDate);
                  const isOut = checkOutDate && isSameDay(day, checkOutDate);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => pickDay(day)}
                      className={cn(
                        "h-11 rounded-xl text-sm font-medium transition",
                        disabled && "cursor-not-allowed text-slate-300",
                        !disabled && !isIn && !isOut && inRange && "bg-emerald-50 text-emerald-900",
                        (isIn || isOut) && "bg-emerald-600 font-bold text-white shadow-sm",
                        !disabled && !isIn && !isOut && !inRange && "text-slate-800 hover:bg-slate-100"
                      )}
                    >
                      {day.getDate()}
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
        className="mt-4 w-full rounded-xl bg-[#051741] py-3 text-sm font-bold text-white hover:bg-[#0a2a4a]"
        onClick={onDone}
      >
        {doneLabel}
      </button>
    </div>
  );
}
