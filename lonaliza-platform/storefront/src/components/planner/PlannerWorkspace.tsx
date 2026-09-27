"use client";

import { useCallback, useEffect, useState } from "react";
import { useAui } from "@assistant-ui/react";
import Link from "next/link";
import { Bookmark, ChevronDown, FolderOpen, Home, Maximize2, MessageSquare, Minimize2, PanelRightClose, PanelRightOpen, Route, X } from "lucide-react";
import { AdvisorThread } from "@/components/chat/advisor/AdvisorThread";
import SavedProgramsPanel from "@/components/chat/SavedProgramsPanel";
import { setAdvisorPlannerMode } from "@/components/chat/advisor/advisor-extras";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { isClientAppMode } from "@/lib/mobile/app-mode";
import { cn } from "@/lib/utils";
import type { PlannerTrip } from "@/types/planner";
import MobilePlannerShell from "./MobilePlannerShell";
import PlaceDetailSheet from "./PlaceDetailSheet";
import PlannerIntake from "./PlannerIntake";
import PlannerMapHost from "./PlannerMapHost";
import { usePlanner } from "./PlannerStore";
import PlannerProgramSkeleton from "./PlannerProgramSkeleton";
import ResizableSplit from "./ResizableSplit";
import TripCanvas from "./TripCanvas";
import { prefsStyles, styleLabel } from "@/lib/planner/styles";
import { P } from "./planner-ui";

export default function PlannerWorkspace() {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const aui = useAui();
  const {
    mode,
    setMode,
    view,
    setMobileTab,
    generating,
    setGenerating,
    applyTrip,
    trip,
    programsOpen,
    setProgramsOpen,
    intakeDraft,
    setIntakeDraft,
    resetPlan,
  } = usePlanner();
  const [saved, setSaved] = useState(false);
  const [genError, setGenError] = useState("");
  const [phoneShell, setPhoneShell] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  useEffect(() => {
    setAdvisorPlannerMode(true);
    return () => setAdvisorPlannerMode(false);
  }, []);

  useEffect(() => {
    const sync = () => setPhoneShell(isClientAppMode() || window.innerWidth < 1024);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const generate = useCallback(
    async (self?: boolean) => {
      const dest = intakeDraft.destination.trim();
      if (!dest && !self) {
        setGenError("destination");
        return;
      }
      setGenError("");
      setMode("planner");
      setMobileTab("plan");
      setGenerating(true);
      let destLat = intakeDraft.destLat;
      let destLng = intakeDraft.destLng;
      if (dest && (!destLat || !destLng)) {
        try {
          const geo = await fetch("/internal/planner/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: dest }),
          }).then((r) => r.json());
          destLat = geo.places?.[0]?.lat || destLat;
          destLng = geo.places?.[0]?.lng || destLng;
          if (destLat && destLng) setIntakeDraft({ destLat, destLng });
        } catch {
          /* generate still resolves the city server-side */
        }
      }
      const stylesList = prefsStyles(intakeDraft.prefs);
      const stylesLabelAr = stylesList.map((s) => styleLabel(s, "ar")).join(" + ");
      const stylesLabelEn = stylesList.map((s) => styleLabel(s, "en")).join(" + ");
      const prompt =
        locale === "ar"
          ? `خطط برنامج سياحي حقيقي في ${dest} لمدة ${intakeDraft.durationDays} أيام، انطلاق من ${intakeDraft.origin || "غير محدد"}، رفقة ${intakeDraft.prefs.companion}، مزيج أساليب (${stylesLabelAr}). وزع الأيام بتنوع بين هذه الأساليب مع معالم حقيقية وعروض طيران وفنادق قريبة قابلة للحجز.`
          : `Build a real ${intakeDraft.durationDays}-day trip in ${dest} from ${intakeDraft.origin || "unspecified"}, ${intakeDraft.prefs.companion}, blended styles (${stylesLabelEn}). Distribute the days across these styles with real attractions and bookable live flight and hotel offers.`;
      try {
        aui.composer.setText(prompt);
        aui.composer.send();
      } catch {
        /* composer may be empty on first paint */
      }
      try {
        const res = await fetch("/internal/planner/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...intakeDraft,
            origin: intakeDraft.origin || "Riyadh",
            locale,
            people: 1,
            destination: dest,
            destLat,
            destLng,
            self: Boolean(self),
          }),
        });
        const data = await res.json();
        if (data.ok && data.trip) {
          applyTrip(data.trip as PlannerTrip);
          return;
        }
        setGenError("failed");
      } catch {
        setGenError("failed");
      } finally {
        setGenerating(false);
      }
    },
    [applyTrip, aui.composer, intakeDraft, locale, setGenerating, setIntakeDraft, setMode, setMobileTab]
  );

  const saveTrip = useCallback(async () => {
    if (!trip) return;
    const res = await fetch("/internal/planner/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip }),
    });
    const data = await res.json();
    if (data.ok) setSaved(true);
  }, [trip]);

  const plannerCanvas = view === "workspace" && trip;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#F7F5FC]">
      <header
        data-planner-switch=""
        className={cn(
          "sticky top-0 z-40 h-14 shrink-0 items-center justify-between gap-3 border-b border-[#E4DFF3] bg-white px-3 lg:px-4",
          phoneShell ? "hidden" : "hidden lg:flex"
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href="/"
            title={locale === "ar" ? "العودة للصفحة الرئيسية" : "Return to Home"}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-violet-200/80 bg-violet-50/70 px-3.5 text-[13px] font-black text-[#2E1065] shadow-sm transition-all hover:bg-violet-100 hover:scale-105 active:scale-95"
          >
            <Home size={16} className="text-[#7C3AED]" />
            <span>{locale === "ar" ? "الرئيسية" : locale === "tr" ? "Ana Sayfa" : "Home"}</span>
          </Link>

          <div className="inline-flex h-11 rounded-xl bg-[#F3E8FF] p-1">
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-black",
                mode === "chat" ? "bg-[#2E1065] text-white" : "bg-transparent text-slate-800"
              )}
            >
              <MessageSquare size={15} />
              {c.modeChat}
            </button>
            <button
              type="button"
              onClick={() => setMode("planner")}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-black",
                mode === "planner" ? "bg-[#2E1065] text-white" : "bg-transparent text-slate-800"
              )}
            >
              <Route size={15} />
              {c.modePlan}
            </button>
          </div>
          <h1 className="hidden truncate text-[15px] font-black text-slate-900 md:block">
            {trip ? (locale === "ar" ? trip.titleAr : trip.titleEn) : c.planner}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {trip ? (
            <>
              <button type="button" onClick={resetPlan} className={cn(P.btn, P.btnGhost, "px-3")}>
                {c.newPlan}
              </button>
              <button type="button" onClick={() => void saveTrip()} className={cn(P.btn, saved ? P.btnGhost : P.btnPrimary, "px-3")}>
                <Bookmark size={16} />
                <span className="hidden sm:inline">{saved ? c.savedOk : c.saveTrip}</span>
              </button>
            </>
          ) : null}
          <button type="button" onClick={() => setProgramsOpen(true)} className={cn(P.btn, P.btnGhost, "px-3")}>
            <FolderOpen size={16} />
            <span className="hidden sm:inline">{c.programs}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setChatCollapsed((v) => !v);
              setTimeout(() => window.dispatchEvent(new Event("resize")), 150);
            }}
            title={chatCollapsed ? (locale === "ar" ? "إظهار الشات" : "Show Chat") : (locale === "ar" ? "ملء الشاشة للكانفاس" : "Full-Screen Canvas")}
            className={cn(P.btn, chatCollapsed ? P.btnPrimary : P.btnGhost, "px-3 flex items-center gap-1.5")}
          >
            {chatCollapsed ? <PanelRightOpen size={16} /> : <Maximize2 size={16} />}
            <span className="hidden sm:inline">
              {chatCollapsed
                ? (locale === "ar" ? "إظهار الشات" : "Show Chat")
                : (locale === "ar" ? "ملء الشاشة للكانفاس" : "Full Canvas")}
            </span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 relative">
        <div className={cn("min-h-0 min-w-0 flex-1", phoneShell ? "hidden" : "hidden lg:flex")}>
          {chatCollapsed ? (
            <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#FBF9FF]">
              {mode === "chat" ? (
                <TripCanvas variant="chat" />
              ) : generating && !trip ? (
                <ResizableSplit
                  storageKey="lonaliza-generating-split-v1"
                  defaultPct={46}
                  minPct={32}
                  maxPct={68}
                  start={<PlannerProgramSkeleton />}
                  end={<PlannerMapHost />}
                />
              ) : plannerCanvas ? (
                <TripCanvas variant="planner" />
              ) : (
                <ResizableSplit
                  storageKey="lonaliza-intake-split"
                  defaultPct={46}
                  minPct={32}
                  maxPct={68}
                  start={<PlannerIntake error={genError} onGenerate={(self) => void generate(self)} />}
                  end={<PlannerMapHost />}
                />
              )}
              {/* Floating button to reopen chat */}
              <button
                type="button"
                onClick={() => {
                  setChatCollapsed(false);
                  setTimeout(() => window.dispatchEvent(new Event("resize")), 150);
                }}
                className="fixed bottom-6 end-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] px-4 py-3 text-[14px] font-black text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20"
              >
                <MessageSquare size={18} />
                <span>{locale === "ar" ? "فتح الشات والمستشار" : "Open Advisor Chat"}</span>
              </button>
            </div>
          ) : (
            <ResizableSplit
              storageKey="lonaliza-advisor-split-v3"
              defaultPct={48}
              minPct={30}
              maxPct={65}
              start={
                <AdvisorThread
                  className="h-full min-h-0"
                  embedded
                  onCollapse={() => {
                    setChatCollapsed(true);
                    setTimeout(() => window.dispatchEvent(new Event("resize")), 150);
                  }}
                />
              }
              end={
                <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#FBF9FF]">
                  {mode === "chat" ? (
                    <TripCanvas variant="chat" />
                  ) : generating && !trip ? (
                    <ResizableSplit
                      storageKey="lonaliza-generating-split-v2"
                      defaultPct={46}
                      minPct={32}
                      maxPct={68}
                      start={<PlannerProgramSkeleton />}
                      end={<PlannerMapHost />}
                    />
                  ) : plannerCanvas ? (
                    <TripCanvas variant="planner" />
                  ) : (
                    <ResizableSplit
                      storageKey="lonaliza-intake-split"
                      defaultPct={46}
                      minPct={32}
                      maxPct={68}
                      start={<PlannerIntake error={genError} onGenerate={(self) => void generate(self)} />}
                      end={<PlannerMapHost />}
                    />
                  )}
                </section>
              }
            />
          )}
        </div>
        <section className={cn("min-h-0 min-w-0 w-full flex-col", phoneShell ? "flex" : "flex lg:hidden")}>
          <MobilePlannerShell
            generate={(self) => void generate(self)}
            genError={genError}
            saveTrip={() => void saveTrip()}
            saved={saved}
          />
        </section>
      </div>

      <PlaceDetailSheet />
      {programsOpen ? (
        <div className="absolute inset-0 z-40 bg-black/30" onClick={() => setProgramsOpen(false)}>
          <aside className="absolute inset-y-0 start-0 w-[min(100%,320px)] bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <SavedProgramsPanel variant="sidebar" />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
