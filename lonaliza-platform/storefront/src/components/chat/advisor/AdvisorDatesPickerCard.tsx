"use client";

import { useState } from "react";
import {
  CalendarDays,
  Users,
  Sparkles,
  PlaneTakeoff,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import DateField from "@/components/search/DateField";
import GuestsField, { type GuestRow } from "@/components/search/GuestsField";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

// Helper to compute default date YYYY-MM-DD + N days
function defaultIso(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  initialStart?: string;
  initialEnd?: string;
  initialAdults?: number;
  initialChildren?: number;
  onConfirm: (datesText: string) => void;
  className?: string;
};

export default function AdvisorDatesPickerCard({
  initialStart,
  initialEnd,
  initialAdults = 2,
  initialChildren = 0,
  onConfirm,
  className,
}: Props) {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";

  const [start, setStart] = useState<string>(() => initialStart || defaultIso(14));
  const [end, setEnd] = useState<string>(() => initialEnd || defaultIso(19));
  const [adults, setAdults] = useState<number>(initialAdults);
  const [children, setChildren] = useState<number>(initialChildren);
  const [expanded, setExpanded] = useState<boolean>(true);

  const guestRows: GuestRow[] = [
    {
      key: "adults",
      label: isAr ? "البالغين (12+ سنة)" : "Adults (12+ yrs)",
      value: adults,
      min: 1,
      max: 12,
      onChange: setAdults,
    },
    {
      key: "children",
      label: isAr ? "الأطفال (2 - 11 سنة)" : "Children (2 - 11 yrs)",
      value: children,
      min: 0,
      max: 8,
      onChange: setChildren,
    },
  ];

  const guestsSummary = isAr
    ? `${adults} بالغين${children > 0 ? ` · ${children} أطفال` : ""}`
    : `${adults} Adults${children > 0 ? ` · ${children} Children` : ""}`;

  const handleApply = () => {
    const prompt = isAr
      ? `التواريخ المختارة: من ${start} إلى ${end} (${adults} بالغين${children > 0 ? ` و ${children} أطفال` : ""}). يرجى البحث عن عروض الطيران المباشر، الفنادق الفاخرة المعتمدة، وتجهيز مسار الرحلة المتكامل.`
      : `Selected travel dates: from ${start} to ${end} for ${adults} adults${children > 0 ? ` and ${children} children` : ""}. Please find direct flights, 5-star hotels, and complete the itinerary.`;
    onConfirm(prompt);
    setExpanded(false);
  };

  return (
    <div
      className={cn(
        "my-3 overflow-hidden rounded-3xl border border-violet-200/90 bg-gradient-to-b from-white via-violet-50/20 to-violet-50/50 p-4 sm:p-5 shadow-[0_16px_36px_-16px_rgba(46,16,101,0.12)] transition-all",
        className
      )}
      dir={dir}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 border-b border-violet-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white shadow-xs">
            <CalendarDays size={18} />
          </div>
          <div>
            <h4 className="text-[15px] font-black text-[#1A1438] leading-tight">
              {isAr ? "حدد مواعيد السفر وعدد المسافرين" : "Choose Travel Dates & Travelers"}
            </h4>
            <p className="text-[11px] font-bold text-[#7C3AED]">
              {isAr
                ? "مطلوب لجلب الأسعار الحقيقية المؤكدة للطيران والفنادق"
                : "Required to fetch confirmed live flight and hotel rates"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-violet-100 hover:text-slate-700 transition"
          aria-label="toggle"
        >
          <ChevronDown
            size={18}
            className={cn("transition-transform duration-200", expanded ? "rotate-180" : "")}
          />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3.5 animate-in fade-in duration-200">
          {/* Dual Date Range Field with Platform Luxury SearchCalendar */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
              {isAr ? "تواريخ الذهاب والعودة (التقويم المعتمد):" : "Departure & Return Dates:"}
            </label>
            <DateField
              mode="range"
              start={start}
              end={end}
              startLabel={isAr ? "تاريخ الذهاب" : "Departure"}
              endLabel={isAr ? "تاريخ العودة" : "Return"}
              placeholder={isAr ? "اختر تواريخ الرحلة..." : "Pick trip dates..."}
              selectStart={isAr ? "حدد تاريخ الذهاب" : "Select Departure"}
              selectEnd={isAr ? "حدد تاريخ العودة" : "Select Return"}
              doneLabel={isAr ? "تأكيد المواعيد" : "Confirm Dates"}
              nightsLabel={isAr ? "ليالٍ" : "nights"}
              onChange={(s, e) => {
                setStart(s);
                if (e) setEnd(e);
              }}
              className="w-full"
            />
          </div>

          {/* Travelers Field */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
              {isAr ? "عدد الأشخاص والمسافرين:" : "Travelers:"}
            </label>
            <GuestsField
              label={isAr ? "المسافرون" : "Travelers"}
              summary={guestsSummary}
              rows={guestRows}
              applyLabel={isAr ? "تأكيد العدد" : "Confirm Guests"}
              className="w-full"
            />
          </div>

          {/* Confirmation Action Button */}
          <button
            type="button"
            onClick={handleApply}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] text-[14px] font-black text-white shadow-[0_12px_24px_-10px_rgba(124,58,237,0.7)] hover:opacity-95 active:scale-98 transition cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-300" />
            <span>
              {isAr
                ? "تأكيد المواعيد وعرض أسعار الطيران والفنادق ✈️"
                : "Confirm Dates & Fetch Flights and Hotels"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
