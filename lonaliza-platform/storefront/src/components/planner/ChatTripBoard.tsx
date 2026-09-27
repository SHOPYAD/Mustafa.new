"use client";

import { useMemo, useRef, useState } from "react";
import { Bus, Car, Hotel, Plane, Route, Sparkles } from "lucide-react";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import { plannerCopy } from "@/lib/planner/copy";
import { formatClientPrice } from "@/lib/planner/money";
import { programCost } from "@/lib/planner/cost";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { SalesChatCardType } from "@/types/sales-chat";
import CanvasProgram from "./CanvasProgram";
import { usePlanner } from "./PlannerStore";
import { cn } from "@/lib/utils";
import TripFeedbackCard from "@/components/chat/advisor/TripFeedbackCard";

type BoardTab = "all" | "program" | SalesChatCardType;

export default function ChatTripBoard() {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const {
    trip,
    offerCards,
    offerTotal,
    offerCurrency,
    addStop,
    activeDay,
  } = usePlanner();
  const scroller = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<BoardTab>("all");

  const cards = offerCards.length ? offerCards : trip?.cards || [];
  const currency = offerCurrency || trip?.currency || "USD";
  const cost = useMemo(() => {
    if (cards.length && trip?.durationDays) {
      return programCost(cards, trip.durationDays, currency);
    }
    return null;
  }, [cards, trip?.durationDays, currency]);
  const total = cost?.total || offerTotal || trip?.totalClientPrice || 0;
  const counts = useMemo(
    () => ({
      flight: cards.filter((x) => x.type === "flight").length,
      hotel: cards.filter((x) => x.type === "hotel").length,
      car: cards.filter((x) => x.type === "car").length,
      transfer: cards.filter((x) => x.type === "transfer").length,
      package: cards.filter((x) => x.type === "package").length,
      program: trip?.days.length || 0,
    }),
    [cards, trip]
  );

  const visibleCards =
    tab === "all" || tab === "program" ? cards : cards.filter((x) => x.type === tab);
  const showProgram = Boolean(trip?.days.length) && (tab === "all" || tab === "program");
  const showOffers = tab !== "program" && visibleCards.length > 0;
  const empty = !trip && !cards.length;

  const tabs: Array<{ id: BoardTab; label: string; count: number; icon: typeof Plane }> = [
    { id: "all", label: c.sectionAll, count: cards.length + (trip?.days.length || 0), icon: Sparkles },
    { id: "program", label: c.programTitle, count: counts.program, icon: Route },
    { id: "flight", label: c.flights, count: counts.flight, icon: Plane },
    { id: "hotel", label: c.hotels, count: counts.hotel, icon: Hotel },
    { id: "car", label: c.cars, count: counts.car, icon: Car },
    { id: "transfer", label: c.transfer, count: counts.transfer, icon: Bus },
    { id: "package", label: c.packages, count: counts.package, icon: Sparkles },
  ];

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#F7F5FC]">
      <div className="shrink-0 border-b border-[#E4DFF3] bg-white px-4 py-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-black text-[#7C3AED]">{c.offersTitle}</p>
            <h2 className="truncate text-[17px] font-black text-[#1A1438]">
              {trip ? (locale === "ar" ? trip.titleAr : trip.titleEn) : c.planner}
            </h2>
          </div>
          {total > 0 ? (
            <div className="shrink-0 rounded-2xl bg-[#2E1065] px-3.5 py-2 text-end text-white shadow-sm">
              <p className="text-[10px] font-bold text-violet-200/80">
                {locale === "ar" ? "الإجمالي لشخصين" : "Total for 2"}
              </p>
              <p className="text-[16px] font-black tabular-nums text-amber-300">
                {formatClientPrice(total, currency, locale)}
              </p>
              <p className="text-[10px] text-white/70">
                {formatClientPrice(Math.round(total / 2), currency, locale)} {locale === "ar" ? "/ شخص" : "/ person"}
              </p>
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs
            .filter((item) => item.id === "all" || item.count > 0)
            .map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-[13px] font-black",
                    tab === item.id ? "bg-[#2E1065] text-white" : "bg-[#F3E8FF] text-[#2E1065]"
                  )}
                >
                  <Icon size={14} />
                  {item.label}
                  <span className={cn("text-[11px]", tab === item.id ? "text-white/80" : "text-[#7C3AED]")}>
                    {item.count}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      <div
        ref={scroller}
        data-chat-board=""
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 [scrollbar-gutter:stable]"
      >
        {empty ? (
          <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED]">
              <Sparkles size={20} />
            </span>
            <p className="mt-3 max-w-md text-[15px] font-black text-slate-900">{c.canvasEmpty}</p>
            <p className="mt-1 max-w-md text-[13px] font-medium leading-6 text-slate-700">{c.askAgent}</p>
          </div>
        ) : (
          <>
            {showProgram && trip ? (
              <>
                <CanvasProgram trip={trip} cards={cards} />
                <div className="px-4 pb-4">
                  <TripFeedbackCard destination={trip.titleAr} tripTitle={trip.titleAr} />
                </div>
              </>
            ) : null}
            {!showProgram && tab === "program" ? (
              <p className="rounded-2xl border border-dashed border-[#E4DFF3] bg-white px-4 py-6 text-center text-[13px] font-medium text-slate-600">
                {c.emptyProgram}
              </p>
            ) : null}

            {showOffers && (tab !== "all" || !showProgram) ? (
              <SalesOfferCards
                layout="slider"
                cards={visibleCards}
                onAddHotelStay={(card) =>
                  addStop(
                    {
                      id: `hotel-${card.id || card.titleEn}`,
                      day: activeDay || 1,
                      order: 99,
                      kind: "hotel",
                      titleAr: card.titleAr,
                      titleEn: card.titleEn,
                      lat: trip?.center.lat || 0,
                      lng: trip?.center.lng || 0,
                      image: card.image,
                      rating: card.stars,
                      href: card.href,
                      priceUsd: card.clientPrice,
                    },
                    activeDay || 1
                  )
                }
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
