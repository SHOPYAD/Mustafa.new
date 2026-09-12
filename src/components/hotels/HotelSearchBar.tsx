"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Building2, CalendarDays, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import HotelDateRangePicker from "@/components/hotels/HotelDateRangePicker";
import SearchPopover, {
  isHotelSearchPopoverTarget,
} from "@/components/hotels/SearchPopover";
import { nightsBetween } from "@/lib/hotel-display";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { GeoPlaceHit, HotelSearchQuery, HotelSuggestHit } from "@/lib/hotel-search";
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
  "flex h-16 w-full items-center gap-3 rounded-xl border border-slate-300 bg-white px-3.5 text-start transition focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/25";

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
  const [hotelHits, setHotelHits] = useState<HotelSuggestHit[]>([]);
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
      setHotelHits([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/hotels/suggest?q=${encodeURIComponent(q)}&lang=${locale}`,
          { signal: ctrl.signal, cache: "no-store" }
        );
        const data = (await res.json()) as { cities?: HotelSuggestHit[]; hotels?: HotelSuggestHit[] };
        const cities = Array.isArray(data.cities) ? data.cities : [];
        setPlaces(
          cities.map((c) => ({
            id: c.id,
            city: c.city || c.name,
            country: c.country || "",
            countryCode: "",
            admin1: "",
            geoId: c.id,
            population: 0,
          }))
        );
        setHotelHits(Array.isArray(data.hotels) ? data.hotels : []);
        setHighlight(0);
      } catch {
        if (!ctrl.signal.aborted) {
          setPlaces([]);
          setHotelHits([]);
        }
      }
    }, 200);
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
      hotelName: "",
      hotelKey: "",
    });
    setDestOpen(false);
  };

  const pickHotel = (hotel: HotelSuggestHit) => {
    onChange({
      ...value,
      q: hotel.city || hotel.name,
      hotelName: hotel.name,
      hotelKey: hotel.hotelKey || hotel.bookingHotelId || hotel.id,
      destId: "",
    });
    setDestOpen(false);
  };

  const dateText = (date: Date | null, fallback: string) =>
    date ? format(date, "d MMM yyyy", { locale: dfLocale }) : fallback;

  return (
    <form
      ref={wrapRef}
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(46,16,101,0.12)] md:p-4"
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
            <MapPin size={18} className="shrink-0 text-[#2e1065]" />
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
              className={cn(fieldShell, datesOpen && "border-purple-500 ring-2 ring-purple-500/25")}
              onClick={() => {
                setDatesOpen((o) => !o);
                setDestOpen(false);
                setGuestsOpen(false);
              }}
            >
              <CalendarDays size={18} className="shrink-0 text-[#2e1065]" />
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
              className={cn(fieldShell, datesOpen && "border-purple-500 ring-2 ring-purple-500/25")}
              onClick={() => {
                setDatesOpen(true);
                setDestOpen(false);
                setGuestsOpen(false);
              }}
            >
              <CalendarDays size={18} className="shrink-0 text-[#2e1065]" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                {dateText(checkOutDate, t.hotels.selectCheckOut)}
              </span>
              <span className="shrink-0 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-950 border border-purple-200/60">
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
            className={cn(fieldShell, guestsOpen && "border-purple-500 ring-2 ring-purple-500/25")}
            onClick={() => {
              setGuestsOpen((o) => !o);
              setDestOpen(false);
              setDatesOpen(false);
            }}
          >
            <Users size={18} className="shrink-0 text-[#2e1065]" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
              {occupancyLabel}
            </span>
          </button>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
          <button
            type="submit"
            className="inline-flex h-16 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:brightness-110 px-7 text-sm font-bold text-white shadow-md shadow-purple-950/20 xl:min-w-[8.5rem] transition-all"
          >
            <Search size={16} className="text-amber-300" />
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
        <div className="py-1" role="listbox">
          {hotelHits.length ? (
            <div className="px-4 pt-2 pb-1 text-[11px] font-black uppercase tracking-wide text-purple-800">
              {locale === "ar" ? "فنادق" : locale === "tr" ? "Oteller" : "Hotels"}
            </div>
          ) : null}
          {hotelHits.map((hotel, i) => (
            <button
              key={`h-${hotel.id}`}
              type="button"
              role="option"
              aria-selected={i === highlight}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm",
                i === highlight ? "bg-purple-50 text-purple-950 font-bold" : "text-slate-800 hover:bg-slate-50"
              )}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pickHotel(hotel)}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <Building2 size={14} className="shrink-0 text-[#2e1065]" />
                <span className="truncate font-semibold">{hotel.name}</span>
              </span>
              <span className="shrink-0 text-xs text-slate-500">{hotel.city}</span>
            </button>
          ))}
          {places.length ? (
            <div className="px-4 pt-2 pb-1 text-[11px] font-black uppercase tracking-wide text-slate-500">
              {locale === "ar" ? "مدن" : locale === "tr" ? "Şehirler" : "Cities"}
            </div>
          ) : null}
          {places.map((place, i) => (
            <button
              key={place.id}
              type="button"
              role="option"
              aria-selected={hotelHits.length + i === highlight}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm",
                hotelHits.length + i === highlight ? "bg-purple-50 text-purple-950 font-bold" : "text-slate-800 hover:bg-slate-50"
              )}
              onMouseEnter={() => setHighlight(hotelHits.length + i)}
              onClick={() => pickPlace(place)}
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                <MapPin size={14} className="text-[#2e1065]" />
                {place.city}
              </span>
              <span className="text-xs text-slate-500">{place.country}</span>
            </button>
          ))}
          {!places.length && !hotelHits.length ? (
            <p className="px-4 py-3 text-sm text-slate-400">{t.hotels.noCitiesFound}</p>
          ) : null}
        </div>
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
          <p className="mb-1 text-sm font-bold text-[#1e1b4b]">{t.hotels.guests}</p>
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
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] py-3 text-sm font-bold text-white hover:brightness-110 shadow-sm transition-all"
            onClick={() => setGuestsOpen(false)}
          >
            {t.hotels.applyOccupancy}
          </button>
        </div>
      </SearchPopover>
    </form>
  );
}
