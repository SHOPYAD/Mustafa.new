"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  FolderOpen,
  Home,
  Lightbulb,
  Map as MapIcon,
  MessageSquare,
  RotateCcw,
  Route,
} from "lucide-react";
import { AdvisorThread } from "@/components/chat/advisor/AdvisorThread";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import AddPlaceSheet from "./AddPlaceSheet";
import DayTimeline from "./DayTimeline";
import IdeasPane from "./IdeasPane";
import PlannerIntake from "./PlannerIntake";
import PlannerMapHost from "./PlannerMapHost";
import { usePlanner } from "./PlannerStore";
import PlannerProgramSkeleton from "./PlannerProgramSkeleton";
import { P } from "./planner-ui";

type PhoneSurface = "program" | "map" | "ideas";

export default function MobilePlannerShell({
  generate,
  genError,
  saveTrip,
  saved,
}: {
  generate: (self?: boolean) => void;
  genError?: string;
  saveTrip: () => void;
  saved: boolean;
}) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const {
    mode,
    setMode,
    trip,
    generating,
    resetPlan,
    programsOpen,
    setProgramsOpen,
    activeDay,
    setActiveDay,
    addStop,
    offerCards,
    promoteLater,
    removeLater,
    setDetailStop,
  } = usePlanner();
  const [surface, setSurface] = useState<PhoneSurface>("program");
  const [placeOpen, setPlaceOpen] = useState(false);
  const cards = offerCards.length ? offerCards : trip?.cards || [];
  const day = trip?.days.find((d) => d.day === (activeDay || 1)) || trip?.days[0];

  return (
    <div data-mobile-planner="" className="relative flex h-full min-h-0 flex-col bg-[#F7F5FC]">
      <header className="shrink-0 border-b border-[#E4DFF3] bg-white px-3 pb-2 pt-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-violet-200/80 bg-violet-50/70 px-3 text-[12px] font-black text-[#2E1065] shadow-sm transition-all hover:bg-violet-100 active:scale-95"
          >
            <Home size={15} className="text-[#7C3AED]" />
            <span>{locale === "ar" ? "الرئيسية" : locale === "tr" ? "Ana Sayfa" : "Home"}</span>
          </Link>
          <span className="truncate text-[13px] font-black text-slate-800">
            {trip ? (locale === "ar" ? trip.titleAr : trip.titleEn) : c.planner}
          </span>
        </div>
        <div className="grid h-10 grid-cols-2 rounded-2xl bg-[#F3E8FF] p-1">
          <button
            type="button"
            onClick={() => setMode("chat")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl text-[13px] font-black",
              mode === "chat" ? "bg-[#2E1065] text-white shadow-sm" : "text-[#2E1065]"
            )}
          >
            <MessageSquare size={15} />
            {c.modeChat}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("planner");
              setSurface("program");
            }}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl text-[13px] font-black",
              mode === "planner" ? "bg-[#2E1065] text-white shadow-sm" : "text-[#2E1065]"
            )}
          >
            <Route size={15} />
            {c.modePlan}
          </button>
        </div>

        {mode === "planner" && trip ? (
          <div className="mt-2 flex items-center gap-1.5">
            {(
              [
                { id: "program", label: c.phoneProgram, icon: Route },
                { id: "map", label: c.phoneMap, icon: MapIcon },
                { id: "ideas", label: c.phoneIdeas, icon: Lightbulb },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSurface(item.id)}
                  className={cn(
                    "inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-xl text-[12px] font-black",
                    surface === item.id ? "bg-[#7C3AED] text-white" : "bg-[#F4F2FA] text-[#2E1065]"
                  )}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={resetPlan}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F2FA] text-[#2E1065]"
              aria-label={c.newPlan}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        ) : (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setProgramsOpen(!programsOpen)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold text-[#2E1065]"
            >
              <FolderOpen size={15} />
              {c.programs}
            </button>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === "chat" ? (
          <AdvisorThread className="h-full min-h-0" embedded />
        ) : generating && !trip ? (
          <PlannerProgramSkeleton />
        ) : !trip ? (
          <div className="h-full overflow-y-auto">
            <PlannerIntake error={genError} onGenerate={(self) => void generate(self)} />
          </div>
        ) : surface === "map" ? (
          <div className="relative h-full min-h-0">
            <PlannerMapHost compact />
          </div>
        ) : surface === "ideas" ? (
          <IdeasPane />
        ) : (
          <div className="flex h-full min-h-0 flex-col bg-white">
            <div className="shrink-0 border-b border-[#E4DFF3] px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-[#7C3AED]">{c.programTitle}</p>
                  <h2 className="truncate text-[16px] font-black text-[#1A1438]">
                    {locale === "ar" ? trip.titleAr : trip.titleEn}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => void saveTrip()}
                  className={cn(P.btn, saved ? P.btnGhost : P.btnPrimary, "h-10 shrink-0 px-3 text-[12px]")}
                >
                  <Bookmark size={14} />
                  {saved ? c.savedOk : c.saveTrip}
                </button>
              </div>
              <div className="planner-days mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {trip.days.map((d) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDay(d.day)}
                    className={cn(
                      "h-10 shrink-0 rounded-xl px-3 text-[13px] font-black",
                      (activeDay || 1) === d.day ? "bg-[#2E1065] text-white" : "bg-[#F3E8FF] text-[#2E1065]"
                    )}
                  >
                    {locale === "ar" ? `اليوم ${d.day}` : `Day ${d.day}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3">
              {cards.length ? (
                <div className="mb-4">
                  <SalesOfferCards
                    layout="slider"
                    cards={cards}
                    onAddHotelStay={(card) =>
                      addStop(
                        {
                          id: `hotel-${card.id || card.titleEn}`,
                          day: activeDay || 1,
                          order: 99,
                          kind: "hotel",
                          titleAr: card.titleAr,
                          titleEn: card.titleEn,
                          lat: trip.center.lat,
                          lng: trip.center.lng,
                          image: card.image,
                          rating: card.stars,
                          href: card.href,
                          priceUsd: card.clientPrice,
                        },
                        activeDay || 1
                      )
                    }
                  />
                </div>
              ) : null}
              {day ? <DayTimeline day={day} onAddPlace={() => setPlaceOpen(true)} /> : null}
              {trip.later.length ? (
                <section className="mt-4 rounded-2xl border border-dashed border-[#E4DFF3] p-3">
                  <p className="text-[12px] font-black text-[#2E1065]">{c.later}</p>
                  {trip.later.map((s) => (
                    <div key={s.id} className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailStop(s)}
                        className="min-w-0 flex-1 text-start text-[13px] font-semibold text-[#4B4568]"
                      >
                        {locale === "ar" ? s.titleAr : s.titleEn}
                      </button>
                      <button
                        type="button"
                        onClick={() => promoteLater(s.id, activeDay || 1)}
                        className="h-9 rounded-lg bg-[#F3E8FF] px-2 text-[11px] font-bold text-[#6D28D9]"
                      >
                        {c.add}
                      </button>
                      <button type="button" onClick={() => removeLater(s.id)} className="text-[11px] font-bold text-rose-700">
                        {c.delete}
                      </button>
                    </div>
                  ))}
                </section>
              ) : null}
            </div>
            <AddPlaceSheet open={placeOpen} onClose={() => setPlaceOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
