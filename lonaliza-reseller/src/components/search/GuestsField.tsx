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
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm font-semibold text-slate-800">{row.label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-[var(--brand-primary)] hover:bg-[var(--theme-chip-hover)] disabled:opacity-40"
          disabled={row.value <= row.min}
          onClick={() => row.onChange(Math.max(row.min, row.value - 1))}
          aria-label="-"
        >
          <Minus size={14} />
        </button>
        <span className="w-7 text-center text-sm font-bold text-[var(--navy)]">{row.value}</span>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-[var(--brand-primary)] hover:bg-[var(--theme-chip-hover)] disabled:opacity-40"
          disabled={row.value >= row.max}
          onClick={() => row.onChange(Math.min(row.max, row.value + 1))}
          aria-label="+"
        >
          <Plus size={14} />
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
            className="mt-3 w-full rounded-xl bg-[var(--navy)] py-2.5 text-sm font-bold text-white hover:opacity-90"
            onClick={() => setOpen(false)}
          >
            {applyLabel}
          </button>
        </div>
      </SearchPopover>
    </div>
  );
}
