"use client";

import { useState } from "react";
import { Car, Check, ChevronDown, Footprints, Navigation, Train } from "lucide-react";
import type { PlannerLeg, PlannerTransportMode } from "@/types/planner";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import { cn } from "@/lib/utils";

const MODES: PlannerTransportMode[] = ["drive", "transit", "walk", "line"];

export default function LegTransport({ leg }: { leg: PlannerLeg }) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { setLegMode } = usePlanner();
  const [open, setOpen] = useState(false);
  const labels: Record<PlannerTransportMode, string> = {
    walk: c.walk,
    drive: c.drive,
    car: c.drive,
    transit: c.transit,
    line: c.line,
  };
  const Icon =
    leg.mode === "walk" ? Footprints : leg.mode === "drive" ? Car : leg.mode === "transit" ? Train : Navigation;

  return (
    <div className="relative py-1.5 ps-12">
      <div className="absolute start-[22px] top-0 bottom-0 w-px bg-[#E4DFF3]" />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#E4DFF3] bg-white px-3 text-[13px] font-bold text-slate-800 hover:border-[#C4B5FD]"
      >
        <Icon size={15} className="text-[#7C3AED]" />
        {leg.minutes} {c.min}
        <span className="text-[#8B86A3]">·</span>
        {leg.km} {c.km}
        <span className="text-[#8B86A3]">·</span>
        {labels[leg.mode]}
        {leg.estimated ? <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800">{c.estimated}</span> : null}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-64 overflow-hidden rounded-2xl border border-[#E4DFF3] bg-white p-1.5 shadow-[0_16px_40px_-20px_rgba(46,16,101,0.45)]">
          {MODES.map((mode) => {
            const ModeIcon = mode === "walk" ? Footprints : mode === "drive" ? Car : mode === "transit" ? Train : Navigation;
            const on = leg.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setLegMode(leg.fromId, mode);
                  setOpen(false);
                }}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-start text-[14px] font-bold",
                  on ? "bg-[#F3E8FF] text-purple-900" : "text-slate-800 hover:bg-[#F7F5FC]"
                )}
              >
                <ModeIcon size={16} className="text-[#7C3AED]" />
                {labels[mode]}
                {on ? <Check size={14} className="ms-auto" /> : null}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setLegMode(leg.fromId, leg.mode, true);
              setOpen(false);
            }}
            className="mt-1 flex min-h-11 w-full cursor-pointer items-center rounded-xl bg-[#F7F5FC] px-3 text-start text-[13px] font-bold text-[#2E1065]"
          >
            {c.setDefault}
          </button>
        </div>
      )}
    </div>
  );
}
