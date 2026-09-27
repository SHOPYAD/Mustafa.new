"use client";

import { useRef, useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import SearchCalendar from "@/components/search/SearchCalendar";
import {
  fieldIcon,
  fieldLabel,
  fieldShell,
  fieldShellActive,
  fieldValue,
} from "@/components/search/search-styles";
import SearchPopover from "@/components/hotels/SearchPopover";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

function parseYmd(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatDay(value: string, locale: string, fallback: string): string {
  const date = parseYmd(value);
  if (!date) return fallback;
  const df = locale === "ar" ? ar : locale === "tr" ? tr : enUS;
  return format(date, "EEE d MMM", { locale: df });
}

type Props = {
  mode: "single" | "range";
  start: string;
  end?: string;
  startLabel: string;
  endLabel?: string;
  placeholder: string;
  selectStart: string;
  selectEnd?: string;
  doneLabel: string;
  nightsLabel?: string;
  badge?: ReactNode;
  onChange: (start: string, end?: string) => void;
  className?: string;
};

export default function DateField({
  mode,
  start,
  end,
  startLabel,
  endLabel,
  placeholder,
  selectStart,
  selectEnd,
  doneLabel,
  nightsLabel,
  badge,
  onChange,
  className,
}: Props) {
  const { locale, dir } = useLocale();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const text =
    mode === "range"
      ? start
        ? `${formatDay(start, locale, startLabel)}${end ? ` — ${formatDay(end, locale, endLabel || "")}` : ""}`
        : placeholder
      : start
        ? formatDay(start, locale, placeholder)
        : placeholder;

  return (
    <div className={cn("min-w-0", className)}>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(fieldShell, open && fieldShellActive)}
      >
        <CalendarDays size={18} className={fieldIcon} />
        <span className="min-w-0 flex-1">
          <span className={fieldLabel}>
            {mode === "range" && endLabel ? `${startLabel} — ${endLabel}` : startLabel}
          </span>
          <span className={cn(fieldValue, "mt-1 block")}>{text}</span>
        </span>
        {badge}
      </button>
      <SearchPopover
        open={open}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
        size="wide"
        dir={dir}
      >
        <SearchCalendar
          mode={mode}
          start={start}
          end={end}
          locale={locale}
          dir={dir}
          startLabel={startLabel}
          endLabel={endLabel}
          selectStart={selectStart}
          selectEnd={selectEnd}
          doneLabel={doneLabel}
          nightsLabel={nightsLabel}
          onChange={onChange}
          onDone={() => setOpen(false)}
        />
      </SearchPopover>
    </div>
  );
}
