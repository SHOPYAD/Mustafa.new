"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CalendarDays, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import HotelDateRangePicker from "@/components/hotels/HotelDateRangePicker";
import SearchPopover, {
  isHotelSearchPopoverTarget,
} from "@/components/hotels/SearchPopover";
import { nightsBetween } from "@/lib/hotel-display";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { GeoPlaceHit, HotelSearchQuery } from "@/lib/hotel-search";
import { cn } from "@/lib/utils";

type Props = {
  value: HotelSearchQuery;
  onChange: (next: HotelSearchQuery) => void;
  onSubmit: () => void;
  compactActions?: ReactNode;
};

function parseYmd(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label="-"
        >
          <Minus size={14} />
        </button>
        <span className="w-7 text-center text-sm font-bold text-[#051741]">{value}</span>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label="+"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

const fieldShell =
  "flex h-16 w-full items-center gap-3 rounded-xl border border-slate-300 bg-white px-3.5 text-start transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/25";

export default function HotelSearchBar({
  value,
  onChange,
  onSubmit,
  compactActions,
}: Props) {
  const { locale, dir, t } = useLocale();
  const dfLocale = locale === "ar" ? ar : locale === "tr" ? tr : enUS;
  const wrapRef = useRef<HTMLFormElement>(null);
  const destAnchorRef = useRef<HTMLLabelElement>(null);
  const datesAnchorRef = useRef<HTMLDivElement>(null);
  const guestsAnchorRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<GeoPlaceHit[]>([]);
  const [destOpen, setDestOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const closeAll = () => {
    setDestOpen(false);
    setDatesOpen(false);
    setGuestsOpen(false);
  };

  useEffect(() => {
    const q = value.q.trim();
    if (q.length < 1) {
      setPlaces([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geo/search?q=${encodeURIComponent(q)}&lang=${locale}`,
          { signal: ctrl.signal, cache: "no-store" }
        );
        const data = (await res.json()) as { places?: GeoPlaceHit[] };
        setPlaces(Array.isArray(data.places) ? data.places : []);
        setHighlight(0);
      } catch {
        if (!ctrl.signal.aborted) setPlaces([]);
      }
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [value.q, locale]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (isHotelSearchPopoverTarget(e.target)) return;
      closeAll();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const nights = nightsBetween(value.checkIn, value.checkOut);
  const checkInDate = parseYmd(value.checkIn);
  const checkOutDate = parseYmd(value.checkOut);

  const occupancyLabel = useMemo(() => {
    const kids = value.childrenAges.length;
    const bits = [`${value.adults} ${t.hotels.adults}`];
    if (kids) bits.push(`${kids} ${t.hotels.children}`);
    bits.push(`${value.rooms} ${t.hotels.rooms}`);
    return bits.join(" · ");
  }, [value.adults, value.childrenAges.length, value.rooms, t.hotels]);

  const pickPlace = (place: GeoPlaceHit) => {
    onChange({
      ...value,
      q: place.city,
      geoId: place.geoId,
      destId: "",
    });
    setDestOpen(false);
  };

  const dateText = (date: Date | null, fallback: string) =>
    date ? format(date, "d MMM yyyy", { locale: dfLocale }) : fallback;

  return (
    <form
      ref={wrapRef}
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(5,23,65,0.18)] md:p-4"
      onSubmit={(e) => {
        e.preventDefault();
        closeAll();
        onSubmit();
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.05fr)_auto]">
        <label ref={destAnchorRef} className="block sm:col-span-2 xl:col-span-1">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-slate-500">
            {t.hotels.destination}
          </span>
          <div className={fieldShell}>
            <MapPin size={18} className="shrink-0 text-emerald-600" />
            <input
              value={value.q}
              onChange={(e) => {
                onChange({ ...value, q: e.target.value, geoId: "", destId: "" });
                setDestOpen(true);
                setDatesOpen(false);
                setGuestsOpen(false);
              }}
              onFocus={() => {
                setDestOpen(true);
                setDatesOpen(false);
                setGuestsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlight((i) => Math.min(places.length - 1, i + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlight((i) => Math.max(0, i - 1));
                } else if (e.key === "Enter" && destOpen && places[highlight]) {
                  e.preventDefault();
                  pickPlace(places[highlight]);
                } else if (e.key === "Escape") {
                  setDestOpen(false);
                }
              }}
              autoComplete="off"
              className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              placeholder={t.hotels.destinationPlaceholder}
            />
          </div>
        </label>

        <div
          ref={datesAnchorRef}
          className="grid grid-cols-2 gap-3 sm:col-span-2 xl:col-span-2"
        >
          <div>
            <span className="mb-1.5 block text-xs font-bold tracking-wide text-slate-500">
              {t.hotels.checkIn}
            </span>
            <button
              type="button"
              className={cn(fieldShell, datesOpen && "border-emerald-500 ring-2 ring-emerald-500/25")}
              onClick={() => {
                setDatesOpen((o) => !o);
                setDestOpen(false);
                setGuestsOpen(false);
              }}
            >
              <CalendarDays size={18} className="shrink-0 text-emerald-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                {dateText(checkInDate, t.hotels.selectCheckIn)}
              </span>
            </button>
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-bold tracking-wide text-slate-500">
              {t.hotels.checkOut}
            </span>
            <button
              type="button"
              className={cn(fieldShell, datesOpen && "border-emerald-500 ring-2 ring-emerald-500/25")}
              onClick={() => {
                setDatesOpen(true);
                setDestOpen(false);
                setGuestsOpen(false);
              }}
            >
              <CalendarDays size={18} className="shrink-0 text-emerald-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                {dateText(checkOutDate, t.hotels.selectCheckOut)}
              </span>
              <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                {t.hotels.nightsCount(nights)}
              </span>
            </button>
          </div>
        </div>

        <div ref={guestsAnchorRef}>
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-slate-500">
            {t.hotels.guests}
          </span>
          <button
            type="button"
            className={cn(fieldShell, guestsOpen && "border-emerald-500 ring-2 ring-emerald-500/25")}
            onClick={() => {
              setGuestsOpen((o) => !o);
              setDestOpen(false);
              setDatesOpen(false);
            }}
          >
            <Users size={18} className="shrink-0 text-emerald-600" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
              {occupancyLabel}
            </span>
          </button>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
          <button
            type="submit"
            className="inline-flex h-16 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 xl:min-w-[8.5rem]"
          >
            <Search size={16} />
            {t.common.search}
          </button>
          {compactActions}
        </div>
      </div>

      <SearchPopover
        open={destOpen && Boolean(value.q.trim())}
        anchorRef={destAnchorRef}
        onClose={() => setDestOpen(false)}
        size="field"
        dir={dir}
      >
        <ul className="py-1" role="listbox">
          {places.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-400">{t.hotels.noCitiesFound}</li>
          ) : (
            places.map((place, i) => (
              <li key={place.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-3 text-sm",
                    i === highlight ? "bg-emerald-50 text-emerald-950" : "text-slate-800 hover:bg-slate-50"
                  )}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pickPlace(place)}
                >
                  <span className="font-semibold">{place.city}</span>
                  <span className="text-xs text-slate-500">
                    {place.admin1 && place.admin1 !== place.city
                      ? `${place.admin1}, ${place.country}`
                      : place.country}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </SearchPopover>

      <SearchPopover
        open={datesOpen}
        anchorRef={datesAnchorRef}
        onClose={() => setDatesOpen(false)}
        size="wide"
        dir={dir}
      >
        <HotelDateRangePicker
          checkIn={value.checkIn}
          checkOut={value.checkOut}
          locale={locale}
          dir={dir}
          nightsLabel={t.hotels.nightsStay(nights)}
          checkInLabel={t.hotels.checkIn}
          checkOutLabel={t.hotels.checkOut}
          selectCheckIn={t.hotels.selectCheckIn}
          selectCheckOut={t.hotels.selectCheckOut}
          doneLabel={t.hotels.doneOccupancy}
          onChange={(checkIn, checkOut) => onChange({ ...value, checkIn, checkOut })}
          onDone={() => setDatesOpen(false)}
        />
      </SearchPopover>

      <SearchPopover
        open={guestsOpen}
        anchorRef={guestsAnchorRef}
        onClose={() => setGuestsOpen(false)}
        size="field"
        minWidth={320}
        dir={dir}
      >
        <div className="p-4">
          <p className="mb-1 text-sm font-bold text-[#051741]">{t.hotels.guests}</p>
          <Stepper
            label={t.hotels.rooms}
            value={value.rooms}
            min={1}
            max={8}
            onChange={(rooms) => onChange({ ...value, rooms })}
          />
          <Stepper
            label={t.hotels.adults}
            value={value.adults}
            min={1}
            max={16}
            onChange={(adults) => onChange({ ...value, adults })}
          />
          <Stepper
            label={t.hotels.children}
            value={value.childrenAges.length}
            min={0}
            max={6}
            onChange={(n) => {
              const ages = value.childrenAges.slice(0, n);
              while (ages.length < n) ages.push(8);
              onChange({ ...value, children: n, childrenAges: ages });
            }}
          />
          {value.childrenAges.length ? (
            <div className="mt-2 space-y-2 border-t border-slate-100 pt-3">
              {value.childrenAges.map((age, i) => (
                <label key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-600">{t.hotels.childAgeLabel(i + 1)}</span>
                  <select
                    value={age}
                    className="rounded-xl border border-slate-300 px-2.5 py-2 text-sm"
                    onChange={(e) => {
                      const ages = [...value.childrenAges];
                      ages[i] = Number(e.target.value);
                      onChange({ ...value, childrenAges: ages });
                    }}
                  >
                    {Array.from({ length: 18 }, (_, y) => (
                      <option key={y} value={y}>
                        {y} {t.hotels.yearsOld}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500"
            onClick={() => setGuestsOpen(false)}
          >
            {t.hotels.applyOccupancy}
          </button>
        </div>
      </SearchPopover>
    </form>
  );
}
