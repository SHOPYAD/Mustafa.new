"use client";

import { Minus, Plus } from "lucide-react";
import { cabinClassLabel, type FlightCopy } from "@/components/flights/copy";
import type { CabinClass, FlightSearchQuery } from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Props = {
  query: FlightSearchQuery;
  copy: FlightCopy;
  onChange: (next: FlightSearchQuery) => void;
  onDone: () => void;
};

const CABINS: CabinClass[] = ["economy", "premium_economy", "business", "first"];

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
        >
          <Minus size={14} />
        </button>
        <span className="w-7 text-center text-sm font-bold text-[var(--navy)]">{value}</span>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function PassengerCabinPicker({ query, copy, onChange, onDone }: Props) {
  const { locale } = useLocale();
  return (
    <div className="p-4">
      <Stepper
        label={copy.adults}
        value={query.adults}
        min={1}
        max={9}
        onChange={(adults) => onChange({ ...query, adults, infants: Math.min(query.infants, adults) })}
      />
      <Stepper
        label={copy.children}
        value={query.childrens}
        min={0}
        max={8}
        onChange={(childrens) => onChange({ ...query, childrens })}
      />
      <Stepper
        label={copy.infants}
        value={query.infants}
        min={0}
        max={query.adults}
        onChange={(infants) => onChange({ ...query, infants })}
      />
      <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">{copy.cabin}</p>
      <div className="mt-2 grid grid-cols-1 gap-2">
        {CABINS.map((cabin) => (
          <button
            key={cabin}
            type="button"
            onClick={() => onChange({ ...query, cabinClass: cabin })}
            className={`rounded-xl border px-3 py-2.5 text-start text-sm font-semibold ${
              query.cabinClass === cabin
                ? "border-[var(--brand-primary)] bg-emerald-50 text-[var(--navy)]"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {cabinClassLabel(locale, cabin)}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-[var(--navy)] py-3 text-sm font-bold text-white"
        onClick={onDone}
      >
        {copy.done}
      </button>
    </div>
  );
}
