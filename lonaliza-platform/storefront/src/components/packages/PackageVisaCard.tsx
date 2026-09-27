"use client";

import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Globe,
  CheckCircle,
  AlertCircle,
  FileCheck,
  ChevronDown,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  SUPPORTED_NATIONALITIES,
  resolveVisaIntelligence,
  type VisaRequirement,
  type NationalityOption,
} from "@/lib/visa-intelligence";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface PackageVisaCardProps {
  country: string;
  destination: string;
  defaultNationality?: string;
}

export function PackageVisaCard({
  country,
  destination,
  defaultNationality = "SA",
}: PackageVisaCardProps) {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";
  const [selectedNationality, setSelectedNationality] = useState<string>(defaultNationality);

  const visaInfo: VisaRequirement = useMemo(() => {
    return resolveVisaIntelligence(selectedNationality, country, destination);
  }, [selectedNationality, country, destination]);

  const currentNat = useMemo(() => {
    return (
      SUPPORTED_NATIONALITIES.find((n) => n.code === selectedNationality) ||
      SUPPORTED_NATIONALITIES[0]
    );
  }, [selectedNationality]);

  const isVisaFree = visaInfo.status === "visa_free";
  const isEvisa = visaInfo.status === "evisa";
  const isArrival = visaInfo.status === "visa_on_arrival";

  return (
    <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-violet-50 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-[#7C3AED]">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h3 className="text-sm font-black text-[#1A1438]">
              {isAr ? "شروط التأشيرة والدخول" : "Visa & Entry Intelligence"}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {isAr ? `لوجهة ${destination}` : `For travel to ${destination}`}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-[#7C3AED]">
          <Globe size={11} />
          {isAr ? "تحقق مباشر" : "Live Verify"}
        </span>
      </div>

      {/* Interactive Nationality Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 block">
          {isAr ? "اختر جنسية المسافر للتحقق من الشروط:" : "Select Traveler Nationality:"}
        </label>
        <div className="relative">
          <select
            value={selectedNationality}
            onChange={(e) => setSelectedNationality(e.target.value)}
            className="w-full appearance-none rounded-xl border border-violet-200/80 bg-[#FAF9FD] px-3.5 py-2.5 text-xs font-bold text-[#1A1438] outline-none transition focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-violet-500/20"
          >
            {SUPPORTED_NATIONALITIES.map((n) => (
              <option key={n.code} value={n.code}>
                {n.flag} {isAr ? n.nameAr : n.nameEn}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 text-slate-400"
          />
        </div>
      </div>

      {/* Dynamic Visa Status Badge & Summary */}
      <div
        className={`rounded-2xl border p-4 space-y-2 ${
          isVisaFree
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white"
            : isEvisa || isArrival
            ? "border-amber-200 bg-gradient-to-br from-amber-50/70 to-white"
            : "border-blue-200 bg-gradient-to-br from-blue-50/70 to-white"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black shadow-xs ${
              isVisaFree
                ? "bg-emerald-600 text-white"
                : isEvisa || isArrival
                ? "bg-amber-500 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            <CheckCircle size={12} />
            <span>{isAr ? visaInfo.badgeAr : visaInfo.badgeEn}</span>
          </span>

          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Clock size={11} className="text-[#7C3AED]" />
            <span>{isAr ? `إقامة حتى ${visaInfo.maxStayDays} يوماً` : `Up to ${visaInfo.maxStayDays} Days`}</span>
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-700">
          {isAr ? visaInfo.summaryAr : visaInfo.summaryEn}
        </p>
      </div>

      {/* Conditions Checklist */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <span className="text-[11px] font-black text-slate-900 block">
          {isAr ? "المتطلبات الأساسية للسفر:" : "Key Travel Requirements:"}
        </span>
        <ul className="space-y-1.5 text-[11px] text-slate-600">
          {visaInfo.conditionsAr.slice(0, 3).map((cond, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle size={13} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{isAr ? cond : visaInfo.conditionsEn[idx] || cond}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Guarantee Notice */}
      <div className="rounded-xl bg-violet-50/80 p-2.5 flex items-center gap-2 text-[11px] font-bold text-[#7C3AED]">
        <FileCheck size={15} className="shrink-0" />
        <span>
          {isAr
            ? "جميع مستندات وتأكيدات الحجز الصادرة من لوناليزا معتمدة 100% للسفر"
            : "All travel vouchers issued by Lonaliza are 100% verified"}
        </span>
      </div>
    </div>
  );
}
