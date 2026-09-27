"use client";

import { Award, ShieldCheck, Sparkles, Star } from "lucide-react";

interface ReviewsAgentSkeletonProps {
  locale?: string;
  hotelName?: string;
}

export default function ReviewsAgentSkeleton({
  locale = "ar",
  hotelName,
}: ReviewsAgentSkeletonProps) {
  const isArabic = locale === "ar";
  const isTurkish = locale === "tr";

  const headline = isArabic
    ? `تجارب النزلاء الحقيقية ${hotelName ? `في ${hotelName}` : ""}`
    : isTurkish
      ? `${hotelName ? `${hotelName} ` : ""}Doğrulanmış Misafir Deneyimleri`
      : `Verified Guest Experiences ${hotelName ? `at ${hotelName}` : ""}`;

  const subtitle = isArabic
    ? "إقامة مميزة تجمع بين رقي الضيافة وراحة الغرف والموقع الحيوي. نستعرض لكم انطباعات النزلاء الموثقة وتقييماتهم لخدمات الفندق ومرافقه..."
    : isTurkish
      ? "Üstün konfor ve seçkin misafirperverlik. Hizmet kalitesi, oda konforu ve merkezi konum hakkında doğrulanmış misafir değerlendirmeleri hazırlanıyor..."
      : "An exceptional stay blending gracious hospitality, room luxury, and prime location. Preparing verified impressions from real guests on service quality and amenities...";

  const verifiedBadge = isArabic
    ? "تقييمات موثقة ومعتمدة"
    : isTurkish
      ? "Doğrulanmış Yorumlar"
      : "Verified Guest Reviews";

  const qualityBadge = isArabic
    ? "ضمان تجربة الإقامة"
    : isTurkish
      ? "Kalite Güvencesi"
      : "Quality Stay Experience";

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Luxury Marketing Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] p-5 text-white shadow-sm">
        <div className="absolute -top-10 -end-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-300/30 text-amber-300 ring-1 ring-amber-400/30 shadow-inner">
              <Award className="h-6 w-6 text-amber-300" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-black text-white tracking-tight">{headline}</h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {verifiedBadge}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-amber-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              {qualityBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Shimmer Reviews Skeleton List */}
      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-xs relative overflow-hidden"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/60 to-transparent pointer-events-none" />

            {/* Header: Author Avatar + Name + Rating Score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-1">
                  <div className="h-3.5 w-28 sm:w-36 rounded-md bg-slate-200 animate-pulse" />
                  <div className="h-2.5 w-20 rounded-md bg-slate-100 animate-pulse" />
                </div>
              </div>

              {/* Rating pill skeleton */}
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                <div className="h-3 w-7 rounded bg-amber-200 animate-pulse" />
              </div>
            </div>

            {/* Review Title Skeleton */}
            <div className="h-4 w-3/4 rounded-md bg-slate-200 animate-pulse mb-2.5" />

            {/* Review Body Skeleton Lines */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-11/12 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-slate-100 animate-pulse" />
            </div>

            {/* Footer Skeleton */}
            <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-slate-100">
              <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
              <div className="h-3.5 w-24 rounded-full bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
