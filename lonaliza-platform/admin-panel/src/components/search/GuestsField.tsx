"use client";

import { useRef, useState, type ReactNode } from "react";
import { Minus, Plus, Users } from "lucide-react";
import SearchPopover from "@/components/hotels/SearchPopover";
import {
  fieldIcon,
  fieldLabel,
  fieldShell,
  fieldShellActive,
  fieldValue,
} from "@/components/search/search-styles";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export type GuestRow = {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
};

type Props = {
  label: string;
  summary: string;
  rows: GuestRow[];
  applyLabel: string;
  extra?: ReactNode;
  className?: string;
};

function Stepper({ row }: { row: GuestRow }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm font-bold text-slate-900">{row.label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-purple-950 transition-colors hover:border-purple-300 hover:bg-purple-50 disabled:opacity-30 cursor-pointer"
          disabled={row.value <= row.min}
          onClick={() => row.onChange(Math.max(row.min, row.value - 1))}
          aria-label="-"
        >
          <Minus size={15} />
        </button>
        <span className="w-8 text-center text-base font-black text-purple-950 font-mono">{row.value}</span>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-purple-950 transition-colors hover:border-purple-300 hover:bg-purple-50 disabled:opacity-30 cursor-pointer"
          disabled={row.value >= row.max}
          onClick={() => row.onChange(Math.min(row.max, row.value + 1))}
          aria-label="+"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

export default function GuestsField({
  label,
  summary,
  rows,
  applyLabel,
  extra,
  className,
}: Props) {
  const { dir } = useLocale();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("min-w-0", className)}>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(fieldShell, open && fieldShellActive)}
      >
        <Users size={18} className={fieldIcon} />
        <span className="min-w-0 flex-1 text-start">
          <span className={fieldLabel}>{label}</span>
          <span className={cn(fieldValue, "mt-1 block")}>{summary}</span>
        </span>
      </button>
      <SearchPopover
        open={open}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
        size="field"
        minWidth={300}
        dir={dir}
      >
        <div className="p-4">
          {rows.map((row) => (
            <Stepper key={row.key} row={row} />
          ))}
          {extra}
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 py-3 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            onClick={() => setOpen(false)}
          >
            {applyLabel}
          </button>
        </div>
      </SearchPopover>
    </div>
  );
}
