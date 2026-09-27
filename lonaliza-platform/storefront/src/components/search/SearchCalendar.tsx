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
  mode: "single" | "range";
  start: string;
  end?: string;
  locale: Locale;
  dir: "ltr" | "rtl";
  startLabel: string;
  endLabel?: string;
  selectStart: string;
  selectEnd?: string;
  doneLabel: string;
  nightsLabel?: string;
  onChange: (start: string, end?: string) => void;
  onDone: () => void;
};

function parseYmd(value?: string | null): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function toYmd(date: Date): string {
  if (!date || isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

function weekdayLabels(locale: Locale, dfLocale: typeof ar) {
  const saturdayStart = locale === "ar";
  const start = saturdayStart ? new Date(2024, 5, 1) : new Date(2024, 5, 2);
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), "EEEEEE", { locale: dfLocale })
  );
}

export default function SearchCalendar({
  mode,
  start,
  end,
  locale,
  dir,
  startLabel,
  endLabel,
  selectStart,
  selectEnd,
  doneLabel,
  nightsLabel,
  onChange,
  onDone,
}: Props) {
  const dfLocale = locale === "ar" ? ar : locale === "tr" ? tr : enUS;
  const startDate = parseYmd(start);
  const endDate = parseYmd(end || "");
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(() => startOfMonth(startDate || today));
  const [pickingEnd, setPickingEnd] = useState(false);
  const months = useMemo(() => [month, addMonths(month, 1)], [month]);
  const labels = weekdayLabels(locale, dfLocale);
  const saturdayStart = locale === "ar";

  const pickDay = (day: Date) => {
    const ymd = toYmd(day);
    if (mode === "single") {
      onChange(ymd);
      onDone();
      return;
    }
    if (!pickingEnd || !startDate || !isAfter(day, startDate)) {
      const nextEnd = endDate && isAfter(endDate, day) ? toYmd(endDate) : toYmd(addDays(day, 1));
      onChange(ymd, nextEnd);
      setPickingEnd(true);
      return;
    }
    onChange(start, ymd);
    setPickingEnd(false);
    onDone();
  };

  return (
    <div className="p-4 sm:p-5">
      {mode === "range" ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <div
            className={cn(
              "rounded-xl border px-3 py-2.5",
              !pickingEnd
                ? "border-[var(--brand-primary)] bg-[var(--theme-chip-hover)]"
                : "border-slate-200 bg-slate-50"
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {startLabel}
            </p>
            <p className="mt-0.5 text-sm font-bold text-[var(--navy)]">
              {startDate ? format(startDate, "d MMMM yyyy", { locale: dfLocale }) : selectStart}
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border px-3 py-2.5",
              pickingEnd
                ? "border-[var(--brand-primary)] bg-[var(--theme-chip-hover)]"
                : "border-slate-200 bg-slate-50"
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {endLabel}
            </p>
            <p className="mt-0.5 text-sm font-bold text-[var(--navy)]">
              {endDate
                ? format(endDate, "d MMMM yyyy", { locale: dfLocale })
                : selectEnd || selectStart}
            </p>
          </div>
          {nightsLabel ? (
            <div className="col-span-2 flex items-center justify-center rounded-xl bg-[var(--navy)] px-4 py-2.5 text-sm font-bold text-white sm:col-span-1">
              {nightsLabel}
            </div>
          ) : null}
        </div>
      ) : null}

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
          {mode === "range" && pickingEnd ? selectEnd || selectStart : selectStart}
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
          const startPad = saturdayStart ? (first.getDay() + 1) % 7 : first.getDay();
          const daysInMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
          const cells = [
            ...Array.from({ length: startPad }, () => null),
            ...Array.from({ length: daysInMonth }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i + 1)),
          ];
          return (
            <div key={m && !isNaN(m.getTime()) ? m.toISOString() : `m-${monthIndex}`} className={cn(monthIndex === 1 && "hidden md:block")}>
              <p className="mb-3 text-center text-base font-black text-purple-950">
                {format(m, "MMMM yyyy", { locale: dfLocale })}
              </p>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500">
                {labels.map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <span key={`e-${i}`} />;
                  const disabled = isBefore(day, today);
                  const inRange =
                    mode === "range" &&
                    startDate &&
                    endDate &&
                    !isBefore(day, startDate) &&
                    isBefore(day, endDate);
                  const isIn = startDate && isSameDay(day, startDate);
                  const isOut = mode === "range" && endDate && isSameDay(day, endDate);
                  return (
                    <button
                      key={day && !isNaN(day.getTime()) ? day.toISOString() : `d-${i}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => pickDay(day)}
                      className={cn(
                        "h-11 rounded-xl text-sm font-bold transition",
                        disabled && "cursor-not-allowed text-slate-300 opacity-40",
                        !disabled && !isIn && !isOut && inRange && "bg-purple-100 text-purple-950 font-black border border-purple-300/60",
                        (isIn || isOut) &&
                          "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] font-black text-white shadow-md border border-amber-400/50",
                        !disabled &&
                          !isIn &&
                          !isOut &&
                          !inRange &&
                          "text-slate-900 hover:bg-purple-50 hover:text-purple-950"
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
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 py-3 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
        onClick={onDone}
      >
        {doneLabel}
      </button>
    </div>
  );
}
