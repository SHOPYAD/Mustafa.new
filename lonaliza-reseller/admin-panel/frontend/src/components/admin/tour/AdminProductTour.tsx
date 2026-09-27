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
      // Manual only — auto-open hid the rebuilt dashboard on first login.
      const handleStartTour = () => {
        setCurrentStepIndex(0);
        setIsOpen(true);
      };
      window.addEventListener("liotrip:start-tour", handleStartTour);
      return () => window.removeEventListener("liotrip:start-tour", handleStartTour);
    } catch {
      /* non-blocking */
    }
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
    <div className="admin-modal-sheet fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="admin-modal-panel w-full max-w-lg rounded-3xl border border-admin-border-subtle bg-admin-bg-surface p-6 sm:p-8 shadow-2xl text-foreground space-y-6 relative overflow-hidden"
        dir={dir}
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 bg-amber-500/15 rounded-full blur-3xl" />

        <div className="flex items-center justify-between border-b border-admin-border-subtle pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              جولة تعريفية بالنظام ({currentStepIndex + 1} من {ADMIN_TOUR_STEPS.length})
            </span>
          </div>

          <button
            type="button"
            onClick={closeTour}
            className="admin-tap flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            title="إغلاق الجولة"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-2">
          {ADMIN_TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 min-h-0 rounded-full transition-all ${
                idx === currentStepIndex
                  ? "w-7 bg-amber-500"
                  : idx < currentStepIndex
                  ? "w-2 bg-amber-500/40"
                  : "w-2 bg-admin-border-strong"
              }`}
            />
          ))}
        </div>

        <div className="pt-2 border-t border-admin-border-subtle flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeTour}
            className="admin-tap px-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            تخطي الجولة
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="admin-tap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-admin-bg-subtle hover:bg-muted text-sm font-semibold text-foreground transition-colors"
              >
                {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                <span>السابق</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="admin-tap inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-sm font-extrabold text-slate-950 transition-all shadow-md"
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
