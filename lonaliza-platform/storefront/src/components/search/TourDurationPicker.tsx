"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, Check, Sparkles } from "lucide-react";
import {
  fieldIcon,
  fieldLabel,
  fieldShell,
  fieldShellActive,
  fieldValue,
} from "@/components/search/search-styles";
import { cn } from "@/lib/utils";

interface TourDurationPickerProps {
  value: number;
  onChange: (hours: number) => void;
  locale?: string;
  className?: string;
}

interface DurationOption {
  hours: number;
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
  isRecommended?: boolean;
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    hours: 4,
    titleAr: "4 ساعات",
    titleEn: "4 Hours",
    subAr: "نصف يوم",
    subEn: "Half Day",
  },
  {
    hours: 8,
    titleAr: "8 ساعات",
    titleEn: "8 Hours",
    subAr: "يوم كامل",
    subEn: "Full Day",
    isRecommended: true,
  },
  {
    hours: 10,
    titleAr: "10 ساعات",
    titleEn: "10 Hours",
    subAr: "يوم مطوّل",
    subEn: "Extended Day",
  },
  {
    hours: 12,
    titleAr: "12 ساعة",
    titleEn: "12 Hours",
    subAr: "يوم شامل كامل",
    subEn: "Comprehensive Day",
  },
];

export default function TourDurationPicker({
  value,
  onChange,
  locale = "ar",
  className,
}: TourDurationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAr = locale === "ar";
  const activeOption =
    DURATION_OPTIONS.find((opt) => opt.hours === value) || DURATION_OPTIONS[1];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("min-w-0 relative z-40", className)}>
      {/* Trigger Button - Matches fieldShell exactly */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(fieldShell, isOpen && fieldShellActive)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Clock size={18} className={fieldIcon} />
        <span className="min-w-0 flex-1 text-start">
          <span className={fieldLabel}>{isAr ? "مدة الجولة" : "Tour Duration"}</span>
          <span className={fieldValue}>
            {isAr
              ? `${activeOption.titleAr} (${activeOption.subAr})`
              : `${activeOption.titleEn} (${activeOption.subEn})`}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-amber-500"
          )}
        />
      </button>

      {/* Custom Dropdown Popup with high contrast dark text */}
      {isOpen && (
        <div className="absolute top-full start-0 mt-2 w-full min-w-[280px] sm:min-w-[320px] z-[9999] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 mb-1 text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>{isAr ? "مدة الجولة بالساعات" : "Tour Duration"}</span>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              {isAr ? "مع سائق خاص" : "With Chauffeur"}
            </span>
          </div>

          <div className="flex flex-col gap-1" role="listbox">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = opt.hours === value;
              return (
                <button
                  key={opt.hours}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.hours);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-start",
                    isSelected
                      ? "bg-amber-500/15 text-amber-950 dark:text-amber-100 border border-amber-500/30"
                      : "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Clock
                      size={16}
                      className={cn(
                        "shrink-0",
                        isSelected ? "text-amber-600" : "text-slate-500"
                      )}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-slate-950 dark:text-white">
                          {isAr ? opt.titleAr : opt.titleEn}
                        </span>
                        {opt.isRecommended && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] font-black shadow-xs">
                            <Sparkles size={8} />
                            {isAr ? "موصى به" : "Recommended"}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                        {isAr ? opt.subAr : opt.subEn}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="size-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
