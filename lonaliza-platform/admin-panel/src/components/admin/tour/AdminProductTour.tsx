"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Package,
  Scan,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { ADMIN_TOUR_STEPS, type TourStep } from "./tour-steps";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const ICON_MAP: Record<string, typeof Sparkles> = {
  LayoutDashboard,
  Inbox,
  Users,
  Package,
  Scan,
  Megaphone,
  Sparkles,
  Settings,
};

export default function AdminProductTour() {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Check if first-time user
    try {
      const completed = localStorage.getItem("liotrip_admin_tour_seen");
      if (!completed) {
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      /* non-blocking */
    }

    // Listen for manual trigger
    const handleStartTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener("liotrip:start-tour", handleStartTour);
    return () => window.removeEventListener("liotrip:start-tour", handleStartTour);
  }, []);

  const closeTour = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("liotrip_admin_tour_seen", "true");
    } catch {
      /* non-blocking */
    }
  };

  const handleNext = () => {
    if (currentStepIndex < ADMIN_TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      closeTour();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!isOpen) return null;

  const currentStep = ADMIN_TOUR_STEPS[currentStepIndex];
  const Icon = ICON_MAP[currentStep.iconName] || Sparkles;
  const isLast = currentStepIndex === ADMIN_TOUR_STEPS.length - 1;

  const title =
    locale === "en"
      ? currentStep.titleEn
      : locale === "tr"
      ? currentStep.titleTr
      : currentStep.titleAr;

  const desc =
    locale === "en"
      ? currentStep.descriptionEn
      : locale === "tr"
      ? currentStep.descriptionTr
      : currentStep.descriptionAr;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/5 backdrop-blur-sm animate-in fade-in duration-200'>
      <div
        className='w-full max-w-lg rounded-3xl border border-border/40 bg-background/95 p-6 sm:p-8 shadow-2xl text-foreground backdrop-blur-2xl space-y-6 relative overflow-hidden'
        dir={dir}
      >
        {/* Glow corner */}
        <div className='pointer-events-none absolute -top-24 -right-24 h-48 w-48 bg-secondary/20 rounded-full blur-3xl' />

        {/* Header */}
        <div className='flex items-center justify-between border-b border-border pb-4'>
          <div className="flex items-center gap-2">
            <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/20 text-secondary'>
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className='text-xs font-bold uppercase tracking-wider text-secondary'>
              جولة تعريفية بالنظام ({currentStepIndex + 1} من {ADMIN_TOUR_STEPS.length})
            </span>
          </div>

          <button
            type="button"
            onClick={closeTour}
            className='p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/10 rounded-xl transition-colors'
            title="إغلاق الجولة"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-admin-btn-secondary-bg/20 to-admin-btn-secondary-hover/5 text-secondary border border-border/30 shrink-0'>
              <Icon className="h-6 w-6" />
            </div>
            <h2 className='text-xl font-bold tracking-tight text-foreground'>{title}</h2>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {ADMIN_TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? "w-7 bg-secondary"
                  : idx < currentStepIndex
                  ? "w-2 bg-secondary/40"
                  : "w-2 bg-card/20"
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation Buttons */}
        <div className='pt-2 border-t border-border flex items-center justify-between gap-3'>
          <button
            type="button"
            onClick={closeTour}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            تخطي الجولة
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card/5 hover:bg-card/10 text-xs font-semibold text-slate-200 transition-colors'
              >
                {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                <span>السابق</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className='inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-secondary hover:bg-secondary text-xs font-extrabold text-foreground transition-all shadow-md'
            >
              <span>{isLast ? "إنهاء الجولة والبدء" : "التالي"}</span>
              {isLast ? (
                <Check className="h-3.5 w-3.5" />
              ) : isRtl ? (
                <ArrowLeft className="h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
