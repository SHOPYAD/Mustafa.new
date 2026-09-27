"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STEPS_AR = [
  "تحليل الوجهة وتفضيلات السفر",
  "فحص مقاعد الطيران والفنادق الفاخرة الحية",
  "تنسيق مسار سيارة مرسيدس VIP الخاصة والسائق",
  "استدعاء المعالم الحقيقية وتوثيق الصور والمعلومات",
  "صياغة وتوزيع الأيام وحساب التكلفة الإجمالية المؤكدة",
];

const STEPS_EN = [
  "Analyzing destination & travel preferences",
  "Checking live flights & luxury 5-star hotels",
  "Coordinating private Mercedes VIP chauffeur route",
  "Fetching verified POIs, authentic photos & history",
  "Curating daily itinerary & authoritative package total",
];

const SUB_MESSAGES_AR = [
  "نحن الآن نفحص المقاعد المباشرة وأفضل خيارات الإقامة الفاخرة...",
  "استدعاء المعالم الحقيقية والإحداثيات والصور عبر وكيل خرائط جوجل المباشر...",
  "ننسق جدول أيام متوازن بسيارة مرسيدس فيتو VIP وشروحات تاريخية موثقة...",
  "نضع اللمسات الأخيرة للباقة المتكاملة بضمان لوناليزا الفاخرة...",
];

const SUB_MESSAGES_EN = [
  "Scanning direct flights and luxury accommodations...",
  "Discovering verified places, coordinates & high-res photos via Google Maps Live Agent...",
  "Optimizing daily routes with private Mercedes VIP vehicle & verified history...",
  "Finalizing your exclusive all-inclusive VIP package...",
];

export default function ThinkingSteps({ active }: { active: boolean }) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const steps = isAr ? STEPS_AR : STEPS_EN;
  const subMessages = isAr ? SUB_MESSAGES_AR : SUB_MESSAGES_EN;

  const [activeStep, setActiveStep] = useState(0);
  const [subMsgIdx, setSubMsgIdx] = useState(0);

  useEffect(() => {
    if (!active) {
      setActiveStep(0);
      return;
    }
    setActiveStep(0);
    // Progressive advancement through realistic work intervals
    const delays = [1400, 3200, 5800, 8800];
    const timers = delays.map((ms, idx) =>
      window.setTimeout(() => {
        setActiveStep(idx + 1);
      }, ms)
    );

    // Rotating micro-status messages every 3.2s
    const subInterval = window.setInterval(() => {
      setSubMsgIdx((prev) => (prev + 1) % subMessages.length);
    }, 3200);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearInterval(subInterval);
    };
  }, [active, subMessages.length]);

  if (!active) return null;

  return (
    <div
      className="space-y-3 rounded-2xl border border-violet-200/80 bg-gradient-to-b from-white to-[#FAF8FD] p-4 shadow-sm"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] font-black text-[#2E1065]">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F3E8FF] text-[#7C3AED]">
            <Sparkles size={14} className="animate-spin text-[#7C3AED]" style={{ animationDuration: "3s" }} />
          </span>
          <span>{isAr ? "الوكيل الذكي يخطط رحلتك الآن" : "AI Advisor is curating your trip"}</span>
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-800 animate-pulse">
          {activeStep + 1} / {steps.length}
        </span>
      </div>

      {/* Stepper items */}
      <div className="space-y-2 pt-1">
        {steps.map((label, i) => {
          const isDone = activeStep > i;
          const isCurrent = activeStep === i;
          return (
            <div
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2.5 py-1.5 transition-all duration-300",
                isCurrent ? "bg-violet-50/90 ring-1 ring-violet-200" : ""
              )}
            >
              {isDone ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <Check size={13} strokeWidth={3} />
                </span>
              ) : isCurrent ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-sm shadow-violet-500/30 ring-2 ring-violet-300 ring-offset-1">
                  <Loader2 size={13} className="animate-spin" />
                </span>
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#E4DFF3] text-[11px] font-bold text-slate-400">
                  {i + 1}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[13px] transition-colors",
                    isCurrent
                      ? "font-black text-[#2E1065]"
                      : isDone
                      ? "font-semibold text-slate-700"
                      : "text-slate-400"
                  )}
                >
                  {label}
                </p>
                {isCurrent && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-violet-100">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[#7C3AED] to-amber-400" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Reassuring Micro-Copy ticker */}
      <div className="rounded-xl bg-[#F3E8FF]/60 px-3 py-2 text-[11px] font-bold text-[#6D28D9] flex items-center gap-2 border border-violet-200/50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C3AED]"></span>
        </span>
        <span className="truncate transition-opacity duration-300">{subMessages[subMsgIdx]}</span>
      </div>
    </div>
  );
}

