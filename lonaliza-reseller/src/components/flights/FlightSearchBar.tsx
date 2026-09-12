"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightLeft, CalendarDays, Plus, Search, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import AirportAutocomplete from "@/components/flights/AirportAutocomplete";
import FlightPopover, { isFlightPopoverTarget } from "@/components/flights/FlightPopover";
import FlightPriceCalendar from "@/components/flights/FlightPriceCalendar";
import PassengerCabinPicker from "@/components/flights/PassengerCabinPicker";
import { cabinClassLabel, type FlightCopy } from "@/components/flights/copy";
import { isSearchReady, passengerTotal } from "@/components/flights/search-state";
import type { FlightSearchQuery, TripType } from "@/components/flights/types";
import SegmentPills, { PillToggle } from "@/components/search/SegmentPills";
import {
  fieldIcon,
  fieldLabel,
  fieldShell,
  fieldShellActive,
  fieldValue,
  searchSubmitClass,
} from "@/components/search/search-styles";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  query: FlightSearchQuery;
  onChange: (next: FlightSearchQuery) => void;
  onSubmit: () => void;
  copy: FlightCopy;
  compact?: boolean;
  variant?: "standalone" | "embedded";
  tone?: "default" | "brand";
};

function dateLocale(locale: string) {
  if (locale === "ar") return ar;
  if (locale === "tr") return tr;
  return enUS;
}

function formatDay(value: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return "";
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return format(date, "EEEE d MMMM", { locale: dateLocale(locale) });
}

function formatDayShort(value: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return "";
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return format(date, "d MMM", { locale: dateLocale(locale) });
}

export default function FlightSearchBar({
  query,
  onChange,
  onSubmit,
  copy,
  compact,
  variant = "standalone",
}: Props) {
  const { locale, dir } = useLocale();
  const wrapRef = useRef<HTMLFormElement>(null);
  const dateRef = useRef<HTMLButtonElement>(null);
  const paxRef = useRef<HTMLButtonElement>(null);
  const multiDateRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [dateOpen, setDateOpen] = useState(false);
  const [paxOpen, setPaxOpen] = useState(false);
  const [multiDateIndex, setMultiDateIndex] = useState<number | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      if (isFlightPopoverTarget(e.target)) return;
      setDateOpen(false);
      setPaxOpen(false);
      setMultiDateIndex(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const tripTypes: Array<[TripType, string]> = [
    ["round-trip", copy.roundTrip],
    ["one-way", copy.oneWay],
    ["multi-city", copy.multiCity],
  ];

  const paxLabel = `${passengerTotal(query)} ${copy.adultKind} - ${cabinClassLabel(locale, query.cabinClass)}`;

  const swap = () => {
    onChange({ ...query, origin: query.destination, destination: query.origin });
  };

  const dateText =
    query.tripType === "round-trip"
      ? query.date && query.returnDate
        ? `${formatDay(query.date, locale)} — ${formatDay(query.returnDate, locale)}`
        : query.date
          ? formatDay(query.date, locale)
          : copy.selectDates
      : query.date
        ? formatDay(query.date, locale)
        : copy.selectDates;

  return (
    <form
      ref={wrapRef}
      onSubmit={(e) => {
        e.preventDefault();
        if (isSearchReady(query)) onSubmit();
      }}
      className={cn(
        "overflow-visible",
        variant === "embedded"
          ? "bg-transparent p-0"
          : cn(
              "rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-[0_16px_40px_rgba(10,22,40,0.12)] sm:rounded-[1.75rem] sm:p-3",
              compact && "shadow-md"
            )
      )}
    >
      <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <SegmentPills
          value={query.tripType}
          options={tripTypes.map(([value, label]) => ({ value, label }))}
          onChange={(tripType) =>
            onChange({
              ...query,
              tripType,
              returnDate: tripType === "one-way" ? "" : query.returnDate,
            })
          }
          className="w-full max-w-full"
        />
        <PillToggle
          checked={query.directOnly}
          onChange={(directOnly) => onChange({ ...query, directOnly })}
          label={copy.nonstopOnly}
          className="self-start sm:self-auto"
        />
      </div>

      {query.tripType === "multi-city" ? (
        <div className="space-y-2">
          {query.multiLegs.map((leg, index) => (
            <div key={`leg-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_200px_auto]">
              <AirportAutocomplete
                label={`${copy.departureAirport} ${index + 1}`}
                value={leg.origin}
                copy={copy}
                onChange={(origin) => {
                  const multiLegs = query.multiLegs.map((row, i) => (i === index ? { ...row, origin } : row));
                  onChange({
                    ...query,
                    multiLegs,
                    origin: index === 0 ? origin : query.origin,
                  });
                }}
              />
              <AirportAutocomplete
                label={`${copy.arrivalAirport} ${index + 1}`}
                value={leg.destination}
                copy={copy}
                onChange={(destination) => {
                  const multiLegs = query.multiLegs.map((row, i) =>
                    i === index ? { ...row, destination } : row
                  );
                  onChange({
                    ...query,
                    multiLegs,
                    destination: index === 0 ? destination : query.destination,
                  });
                }}
              />
              <button
                ref={(el) => {
                  multiDateRefs.current[index] = el;
                }}
                type="button"
                onClick={() => {
                  setPaxOpen(false);
                  setDateOpen(false);
                  setMultiDateIndex(index);
                }}
                className={cn(
                  fieldShell,
                  multiDateIndex === index && fieldShellActive,
                  "text-start"
                )}
              >
                <CalendarDays size={16} className={fieldIcon} />
                <span className={fieldValue}>
                  {leg.date ? formatDayShort(leg.date, locale) : copy.selectDates}
                </span>
              </button>
              {query.multiLegs.length > 2 ? (
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center self-center rounded-xl border border-slate-200 text-slate-500 hover:bg-rose-50"
                  onClick={() =>
                    onChange({ ...query, multiLegs: query.multiLegs.filter((_, i) => i !== index) })
                  }
                  aria-label={copy.removeLeg}
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            {query.multiLegs.length < 4 ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-bold text-[#10b981] hover:text-[#059669]"
                onClick={() =>
                  onChange({
                    ...query,
                    multiLegs: [...query.multiLegs, { origin: null, destination: null, date: "" }],
                  })
                }
              >
                <Plus size={14} /> {copy.addLeg}
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                ref={paxRef}
                type="button"
                onClick={() => setPaxOpen((v) => !v)}
                className={cn(fieldShell, "h-[3.25rem] w-full px-3 sm:min-w-[11rem] sm:w-auto")}
              >
                <Users size={14} className={fieldIcon} />
                <span className={fieldValue}>{paxLabel}</span>
              </button>
              <button
                type="submit"
                disabled={!isSearchReady(query)}
                className={cn(searchSubmitClass, "h-[3.25rem] w-full min-w-0 px-6 sm:w-auto sm:min-w-[8.25rem]")}
              >
                <Search size={16} className="text-white" />
                {copy.searchShort}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
            <div className="relative flex min-w-0 flex-col gap-2 md:flex-row md:items-stretch lg:flex-[1.15]">
              <AirportAutocomplete
                label={copy.departureAirport}
                value={query.origin}
                copy={copy}
                onChange={(origin) => onChange({ ...query, origin })}
              />
              <button
                type="button"
                onClick={swap}
                aria-label={copy.swap}
                className="mx-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[var(--navy)] shadow-sm hover:border-[var(--brand-primary)] hover:bg-emerald-50 md:absolute md:left-1/2 md:top-1/2 md:z-10 md:-translate-x-1/2 md:-translate-y-1/2"
              >
                <ArrowRightLeft size={14} className="rotate-90 md:rotate-0" />
              </button>
              <AirportAutocomplete
                label={copy.arrivalAirport}
                value={query.destination}
                copy={copy}
                onChange={(destination) => onChange({ ...query, destination })}
              />
            </div>

            <button
              ref={dateRef}
              type="button"
              onClick={() => {
                setPaxOpen(false);
                setDateOpen((v) => !v);
              }}
              className={cn(
                fieldShell,
                "h-[3.25rem] w-full min-w-0 flex-col items-start justify-center gap-0.5 lg:flex-[1.05]",
                dateOpen && fieldShellActive
              )}
            >
              <span className={fieldLabel}>
                {query.tripType === "round-trip" ? `${copy.departure} — ${copy.return}` : copy.departure}
              </span>
              <span className="inline-flex min-w-0 items-center gap-2">
                <CalendarDays size={15} className={cn(fieldIcon, "shrink-0")} />
                <span className={cn(fieldValue, "truncate")}>{dateText}</span>
              </span>
            </button>

            <button
              ref={paxRef}
              type="button"
              onClick={() => {
                setDateOpen(false);
                setPaxOpen((v) => !v);
              }}
              className={cn(
                fieldShell,
                "h-[3.25rem] w-full min-w-0 sm:min-w-[11rem] lg:flex-[0.75]",
                paxOpen && fieldShellActive
              )}
            >
              <Users size={16} className={fieldIcon} />
              <span className={cn(fieldValue, "flex-1")}>{paxLabel}</span>
            </button>
          </div>

          <div className="mt-2.5 flex justify-stretch sm:justify-end">
            <button
              type="submit"
              disabled={!isSearchReady(query)}
              className={cn(searchSubmitClass, "w-full min-w-0 sm:w-auto sm:min-w-[8.25rem]")}
            >
              <Search size={16} className="text-white" />
              {copy.searchShort}
            </button>
          </div>
        </>
      )}

      <FlightPopover
        open={multiDateIndex !== null && query.tripType === "multi-city"}
        anchorRef={{ current: multiDateIndex !== null ? multiDateRefs.current[multiDateIndex] : null }}
        onClose={() => setMultiDateIndex(null)}
        size="wide"
        dir={dir}
      >
        {multiDateIndex !== null ? (
          <FlightPriceCalendar
            tripType="one-way"
            depart={query.multiLegs[multiDateIndex]?.date || ""}
            returnDate=""
            origin={query.multiLegs[multiDateIndex]?.origin || query.origin}
            destination={query.multiLegs[multiDateIndex]?.destination || query.destination}
            currency={query.currency}
            copy={copy}
            onChange={(date) => {
              const index = multiDateIndex;
              const multiLegs = query.multiLegs.map((row, i) => (i === index ? { ...row, date } : row));
              onChange({ ...query, multiLegs, date: index === 0 ? date : query.date });
            }}
            onDone={() => setMultiDateIndex(null)}
          />
        ) : null}
      </FlightPopover>

      <FlightPopover
        open={dateOpen && query.tripType !== "multi-city"}
        anchorRef={dateRef}
        onClose={() => setDateOpen(false)}
        size="wide"
        dir={dir}
      >
        <FlightPriceCalendar
          tripType={query.tripType === "one-way" ? "one-way" : "round-trip"}
          depart={query.date}
          returnDate={query.returnDate}
          origin={query.origin}
          destination={query.destination}
          currency={query.currency}
          copy={copy}
          initialPick="depart"
          onChange={(date, returnDate) => onChange({ ...query, date, returnDate })}
          onDone={() => setDateOpen(false)}
        />
      </FlightPopover>

      <FlightPopover open={paxOpen} anchorRef={paxRef} onClose={() => setPaxOpen(false)} dir={dir}>
        <PassengerCabinPicker query={query} copy={copy} onChange={onChange} onDone={() => setPaxOpen(false)} />
      </FlightPopover>
    </form>
  );
}
