"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cabinClassLabel, type FlightCopy } from "@/components/flights/copy";
import { formatDuration } from "@/components/flights/normalize";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import type { BaggageFilter, CabinClass, FlightFiltersState, FlightSearchQuery, Itinerary } from "@/components/flights/types";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type AirlineOpt = { name: string; code: string; logoUrl: string; minPrice: number; currency: string };
type AirportOpt = { code: string; name: string; count: number };

type Props = {
  copy: FlightCopy;
  filters: FlightFiltersState;
  onChange: (next: FlightFiltersState) => void;
  airlines: AirlineOpt[];
  originAirports: AirportOpt[];
  destAirports: AirportOpt[];
  maxDuration: number;
  priceBounds: { min: number; max: number; currency: string };
};

const CABINS: Array<CabinClass | "any"> = ["any", "economy", "premium_economy", "business", "first"];

function hourLabel(h: number): string {
  const hour = Math.max(0, Math.min(24, Math.round(h)));
  return `${String(hour).padStart(2, "0")}:00`;
}

function DualRange({
  min,
  max,
  start,
  end,
  onChange,
}: {
  min: number;
  max: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}) {
  return (
    <div className="relative h-8">
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#10b981]"
        style={{
          left: `${((start - min) / Math.max(1, max - min)) * 100}%`,
          right: `${((max - end) / Math.max(1, max - min)) * 100}%`,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={start}
        onChange={(e) => onChange(Math.min(Number(e.target.value), end), end)}
        className="pointer-events-none absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#051741] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#051741]"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={end}
        onChange={(e) => onChange(start, Math.max(Number(e.target.value), start))}
        className="pointer-events-none absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#10b981] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#10b981]"
      />
    </div>
  );
}

export function defaultFilters(
  maxDuration = 2400,
  priceBounds = { min: 0, max: 0 }
): FlightFiltersState {
  return {
    stops: [0, 1, 2],
    airlines: [],
    departStart: 0,
    departEnd: 24,
    arriveStart: 0,
    arriveEnd: 24,
    maxDuration,
    cabinClass: "any",
    directOnly: false,
    baggage: "any",
    priceMin: priceBounds.min,
    priceMax: priceBounds.max || 0,
    originAirports: [],
    destAirports: [],
    freeCancellation: false,
  };
}

export function filtersFromQuery(query: FlightSearchQuery, maxDuration = 2400): FlightFiltersState {
  return {
    ...defaultFilters(maxDuration),
    stops: query.directOnly ? [0] : [0, 1, 2],
    directOnly: query.directOnly,
    baggage: query.baggage,
    cabinClass: "any",
  };
}

export function airlineOptions(items: Itinerary[]): AirlineOpt[] {
  const map = new Map<string, AirlineOpt>();
  for (const item of items) {
    const carrier = item.legs[0]?.carriers[0] || item.legs[0]?.segments[0]?.marketingCarrier;
    const name = carrier?.name || item.legs[0]?.segments[0]?.marketingCarrier.name || "Airline";
    const prev = map.get(name);
    if (!prev || item.price < prev.minPrice) {
      map.set(name, {
        name,
        code: carrier?.code || "",
        logoUrl: carrier?.logoUrl || prev?.logoUrl || "",
        minPrice: item.price,
        currency: item.currency,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.minPrice - b.minPrice);
}

export function airportOptions(items: Itinerary[], end: "origin" | "destination"): AirportOpt[] {
  const map = new Map<string, AirportOpt>();
  for (const item of items) {
    for (const leg of item.legs) {
      const place = end === "origin" ? leg.origin : leg.destination;
      const code = place.displayCode;
      if (!code) continue;
      const prev = map.get(code);
      map.set(code, {
        code,
        name: place.city || place.name || code,
        count: (prev?.count || 0) + 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-bold transition",
        active
          ? "bg-[#051741] text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
    >
      {children}
    </button>
  );
}

export default function FlightFilters({
  copy,
  filters,
  onChange,
  airlines,
  originAirports,
  destAirports,
  maxDuration,
  priceBounds,
}: Props) {
  const { locale } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const stopOpts: Array<[0 | 1 | 2, string]> = [
    [0, copy.nonstop],
    [1, copy.oneStop],
    [2, copy.twoPlus],
  ];
  const windows: Array<[number, number, string]> = [
    [0, 12, copy.morning],
    [12, 17, copy.afternoon],
    [17, 21, copy.evening],
    [21, 24, copy.night],
  ];

  const toggleStop = (stop: 0 | 1 | 2) => {
    const has = filters.stops.includes(stop);
    const stops = has ? filters.stops.filter((s) => s !== stop) : [...filters.stops, stop];
    onChange({
      ...filters,
      stops,
      directOnly: stops.length === 1 && stops[0] === 0,
    });
  };

  const toggleList = (key: "airlines" | "originAirports" | "destAirports", value: string) => {
    const current = filters[key];
    const has = current.includes(value);
    onChange({
      ...filters,
      [key]: has ? current.filter((item) => item !== value) : [...current, value],
    });
  };

  return (
    <aside className="overflow-hidden rounded-3xl border border-[#051741]/10 bg-white shadow-[0_12px_40px_rgba(5,23,65,0.06)]">
      <div className="flex items-center justify-between bg-[#051741] px-4 py-3 text-white">
        <h2 className="text-sm font-bold">{copy.filters}</h2>
        <button
          type="button"
          className="text-xs font-semibold text-[#34d399] hover:text-white"
          onClick={() =>
            onChange({
              ...defaultFilters(maxDuration, priceBounds),
              cabinClass: "any",
            })
          }
        >
          {copy.clearFilters}
        </button>
      </div>

      <div className="space-y-5 p-4">
        <section>
          <button
            type="button"
            onClick={() => onChange({ ...filters, freeCancellation: !filters.freeCancellation })}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-start text-xs font-bold transition",
              filters.freeCancellation
                ? "border-[#10b981] bg-emerald-50 text-[#051741]"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            <span>{copy.freeCancellation}</span>
            <span
              className={cn(
                "inline-flex h-4 w-4 items-center justify-center rounded border",
                filters.freeCancellation ? "border-[#10b981] bg-[#10b981] text-white" : "border-slate-300"
              )}
            >
              {filters.freeCancellation ? <Check size={10} /> : null}
            </span>
          </button>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.stops}</p>
          <div className="flex flex-wrap gap-2">
            {stopOpts.map(([value, label]) => (
              <Chip key={value} active={filters.stops.includes(value)} onClick={() => toggleStop(value)}>
                {label}
              </Chip>
            ))}
          </div>
        </section>

        {priceBounds.max > priceBounds.min ? (
          <section>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.priceRange}</p>
            <p className="mb-1 text-xs font-semibold text-[#051741]">
              {formatFlightPrice(filters.priceMin || priceBounds.min, priceBounds.currency)} —{" "}
              {formatFlightPrice(filters.priceMax || priceBounds.max, priceBounds.currency)}
            </p>
            <DualRange
              min={priceBounds.min}
              max={priceBounds.max}
              start={filters.priceMin || priceBounds.min}
              end={filters.priceMax || priceBounds.max}
              onChange={(priceMin, priceMax) => onChange({ ...filters, priceMin, priceMax })}
            />
          </section>
        ) : null}

        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.airlines}</p>
          <div className="max-h-56 space-y-1.5 overflow-auto">
            {airlines.map((row) => {
              const active = filters.airlines.includes(row.name);
              return (
                <button
                  key={row.name}
                  type="button"
                  onClick={() => toggleList("airlines", row.name)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-start text-sm transition",
                    active ? "bg-emerald-50 text-[#051741]" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <AirlineLogo code={row.code} name={row.name} logoUrl={row.logoUrl} size="sm" className="rounded-md" />
                  <span className="min-w-0 flex-1 truncate font-semibold">{row.name}</span>
                  <span className="text-[11px] text-[#059669]">
                    {formatFlightPrice(row.minPrice, row.currency)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {originAirports.length > 1 ? (
          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.originAirports}</p>
            <div className="flex flex-wrap gap-2">
              {originAirports.map((row) => (
                <Chip
                  key={row.code}
                  active={filters.originAirports.includes(row.code)}
                  onClick={() => toggleList("originAirports", row.code)}
                >
                  {row.code} · {row.count}
                </Chip>
              ))}
            </div>
          </section>
        ) : null}

        {destAirports.length > 1 ? (
          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.destAirports}</p>
            <div className="flex flex-wrap gap-2">
              {destAirports.map((row) => (
                <Chip
                  key={row.code}
                  active={filters.destAirports.includes(row.code)}
                  onClick={() => toggleList("destAirports", row.code)}
                >
                  {row.code} · {row.count}
                </Chip>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.departWindow}</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {windows.map(([start, end, label]) => (
              <Chip
                key={label}
                active={filters.departStart === start && filters.departEnd === end}
                onClick={() => onChange({ ...filters, departStart: start, departEnd: end })}
              >
                {label}
              </Chip>
            ))}
          </div>
          <p className="mb-1 text-xs text-slate-500">
            {hourLabel(filters.departStart)} — {hourLabel(filters.departEnd)}
          </p>
          <DualRange
            min={0}
            max={24}
            start={filters.departStart}
            end={filters.departEnd}
            onChange={(departStart, departEnd) => onChange({ ...filters, departStart, departEnd })}
          />
        </section>

        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.arriveWindow}</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {windows.map(([start, end, label]) => (
              <Chip
                key={`arr-${label}`}
                active={filters.arriveStart === start && filters.arriveEnd === end}
                onClick={() => onChange({ ...filters, arriveStart: start, arriveEnd: end })}
              >
                {label}
              </Chip>
            ))}
          </div>
          <p className="mb-1 text-xs text-slate-500">
            {hourLabel(filters.arriveStart)} — {hourLabel(filters.arriveEnd)}
          </p>
          <DualRange
            min={0}
            max={24}
            start={filters.arriveStart}
            end={filters.arriveEnd}
            onChange={(arriveStart, arriveEnd) => onChange({ ...filters, arriveStart, arriveEnd })}
          />
        </section>

        <section>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.duration}</p>
          <p className="mb-1 text-xs font-semibold text-[#051741]">{formatDuration(filters.maxDuration)}</p>
          <input
            type="range"
            min={60}
            max={Math.max(120, maxDuration)}
            value={filters.maxDuration}
            onChange={(e) => onChange({ ...filters, maxDuration: Number(e.target.value) })}
            className="w-full accent-[#10b981]"
          />
        </section>

        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.baggageFilter}</p>
          <div className="grid grid-cols-2 gap-2">
            {(["any", "included", 20, 23] as const).map((opt) => (
              <button
                key={String(opt)}
                type="button"
                onClick={() => onChange({ ...filters, baggage: opt as BaggageFilter })}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-bold",
                  filters.baggage === opt
                    ? "border-[#10b981] bg-emerald-50 text-[#051741]"
                    : "border-slate-200 text-slate-600"
                )}
              >
                {opt === "any"
                  ? copy.baggageAny
                  : opt === "included"
                    ? copy.baggageIncluded
                    : opt === 20
                      ? copy.baggage20
                      : copy.baggage23}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#051741]/60">{copy.cabinFilter}</p>
          <div className="flex flex-wrap gap-2">
            {CABINS.map((cabin) => (
              <Chip
                key={cabin}
                active={filters.cabinClass === cabin}
                onClick={() => onChange({ ...filters, cabinClass: cabin })}
              >
                {cabin === "any" ? copy.anyCabin : cabinClassLabel(locale, cabin)}
              </Chip>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
