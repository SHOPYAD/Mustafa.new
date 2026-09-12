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
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm font-bold text-slate-900">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-purple-950 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-30 transition-colors"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus size={15} />
        </button>
        <span className="w-8 text-center text-base font-black text-purple-950 font-mono">{value}</span>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-purple-950 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-30 transition-colors"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

export default function PassengerCabinPicker({ query, copy, onChange, onDone }: Props) {
  const { locale } = useLocale();
  return (
    <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-200/80">
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
      <p className="mt-4 text-xs font-black uppercase tracking-wider text-purple-950">{copy.cabin}</p>
      <div className="mt-2.5 grid grid-cols-1 gap-2">
        {CABINS.map((cabin) => (
          <button
            key={cabin}
            type="button"
            onClick={() => onChange({ ...query, cabinClass: cabin })}
            className={`rounded-xl border px-3.5 py-2.5 text-start text-xs sm:text-sm font-bold transition-all ${
              query.cabinClass === cabin
                ? "border-amber-400 bg-gradient-to-r from-purple-50 via-amber-50/40 to-purple-50 text-purple-950 shadow-xs ring-1 ring-amber-400/50"
                : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-purple-950"
            }`}
          >
            {cabinClassLabel(locale, cabin)}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 py-3 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
        onClick={onDone}
      >
        {copy.done}
      </button>
    </div>
  );
}
