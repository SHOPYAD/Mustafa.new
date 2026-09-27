"use client";

import { useRef, useState } from "react";
import { Clock } from "lucide-react";
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

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  className?: string;
};

function parseTime(value: string): { hour: string; minute: string } {
  const m = /^(\d{2}):(\d{2})/.exec(value);
  return {
    hour: m?.[1] || "10",
    minute: MINUTES.includes(m?.[2] || "") ? m![2] : "00",
  };
}

export default function TimeField({
  value,
  onChange,
  label,
  placeholder,
  className,
}: Props) {
  const { dir } = useLocale();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { hour, minute } = parseTime(value);

  const pick = (nextHour: string, nextMinute: string) => {
    onChange(`${nextHour}:${nextMinute}`);
  };

  return (
    <div className={cn("min-w-0", className)}>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(fieldShell, open && fieldShellActive)}
      >
        <Clock size={18} className={fieldIcon} />
        <span className="min-w-0 flex-1 text-start">
          <span className={fieldLabel}>{label}</span>
          <span className={cn(fieldValue, "mt-1 block")}>{value || placeholder}</span>
        </span>
      </button>
      <SearchPopover
        open={open}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
        size="field"
        minWidth={280}
        dir={dir}
      >
        <div className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <div className="alrayyan-scroll grid max-h-48 grid-cols-4 gap-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => pick(h, minute)}
                    className={cn(
                      "rounded-lg py-1.5 text-xs font-semibold transition",
                      hour === h
                        ? "bg-[var(--navy)] text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-[var(--theme-chip-hover)]"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                min
              </p>
              <div className="grid grid-cols-2 gap-1">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      pick(hour, m);
                      setOpen(false);
                    }}
                    className={cn(
                      "rounded-lg py-2 text-sm font-semibold transition",
                      minute === m
                        ? "bg-[var(--brand-primary)] text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-[var(--theme-chip-hover)]"
                    )}
                  >
                    :{m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SearchPopover>
    </div>
  );
}
