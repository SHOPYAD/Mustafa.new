"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Sparkles, MapPin, Compass, Hotel, Calendar } from "lucide-react";

export default function PlannerProgramSkeleton() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <div
      className="relative flex h-full flex-col overflow-y-auto bg-gradient-to-b from-[#FAF8FD] to-[#F3EFFB] p-4 sm:p-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Hero Cover Card Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#4C1D95] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -end-16 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl animate-pulse" />
        <div className="absolute -start-16 -bottom-16 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl animate-pulse" />

        <div className="relative z-10 flex flex-col justify-between gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/10 px-3 py-1 text-xs font-black text-amber-300 backdrop-blur-md">
              <Sparkles size={14} className="animate-spin text-amber-300" style={{ animationDuration: "3s" }} />
              <span>{isAr ? "جاري تجهيز برنامجك الحصري الموثوق..." : "Curating your verified VIP itinerary..."}</span>
            </span>
            <div className="h-7 w-28 animate-pulse rounded-full bg-white/15" />
          </div>

          <div className="space-y-3">
            <div className="h-8 sm:h-10 w-3/4 animate-pulse rounded-2xl bg-white/20" />
            <div className="h-4 w-1/2 animate-pulse rounded-xl bg-white/15" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                <Compass size={20} className="animate-spin" style={{ animationDuration: "6s" }} />
              </div>
              <div className="space-y-1">
                <div className="h-4 w-32 animate-pulse rounded-lg bg-white/20" />
                <div className="h-3 w-20 animate-pulse rounded-md bg-white/10" />
              </div>
            </div>
            <div className="h-10 w-36 animate-pulse rounded-2xl bg-gradient-to-r from-amber-400/30 to-amber-500/30" />
          </div>
        </div>
      </div>

      {/* Days Tabs Skeleton */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <div className="h-9 w-24 shrink-0 animate-pulse rounded-2xl bg-violet-200/80" />
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div key={n} className="h-9 w-20 shrink-0 animate-pulse rounded-2xl bg-white border border-violet-100" />
        ))}
      </div>

      {/* Hotel Recommendation Showcase Skeleton */}
      <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-[#7C3AED]">
              <Hotel size={15} />
            </div>
            <div className="h-4 w-44 animate-pulse rounded-md bg-slate-200" />
          </div>
          <div className="h-4 w-20 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="h-20 w-24 shrink-0 animate-pulse rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-amber-100" />
            </div>
          </div>
          <div className="hidden sm:flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="h-20 w-24 shrink-0 animate-pulse rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-amber-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Timeline Skeletons */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#7C3AED]" />
          <div className="h-4 w-48 animate-pulse rounded-md bg-slate-200" />
        </div>

        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="flex gap-4 rounded-2xl border border-violet-100/90 bg-white p-4 shadow-sm"
          >
            <div className="h-28 w-28 sm:h-32 sm:w-36 shrink-0 animate-pulse rounded-2xl bg-gradient-to-br from-violet-100 via-slate-100 to-amber-50" />
            <div className="flex-1 space-y-2.5 py-1">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded-full bg-violet-100" />
                <div className="h-4 w-12 animate-pulse rounded-full bg-amber-100" />
              </div>
              <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
