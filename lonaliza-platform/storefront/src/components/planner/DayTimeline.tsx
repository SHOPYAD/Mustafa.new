"use client";

import { Plus, Route, StickyNote } from "lucide-react";
import type { PlannerDay } from "@/types/planner";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import StopCard from "./StopCard";
import LegTransport from "./LegTransport";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import { liveSorted, nearbyHotelCards } from "@/lib/planner/cost";
import { cn } from "@/lib/utils";
import { P } from "./planner-ui";

export default function DayTimeline({
  day,
  onAddPlace,
}: {
  day: PlannerDay;
  onAddPlace?: () => void;
}) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { optimizeDay, isOptimizing, setDayNotes, setCenterTab, trip, offerCards } = usePlanner();
  const title = locale === "ar" ? day.titleAr : day.titleEn;
  const hotels = nearbyHotelCards(
    liveSorted(offerCards.length ? offerCards : trip?.cards || [], "hotel"),
    day.stops,
    18,
    day.day
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-black uppercase tracking-wide text-[#7C3AED]">
            {locale === "ar" ? `اليوم ${day.day}` : `Day ${day.day}`}
          </p>
          <h3 className="mt-0.5 text-[18px] font-black leading-snug text-[#1A1438]">{title}</h3>
        </div>
        <button
          type="button"
          disabled={isOptimizing}
          onClick={() => optimizeDay(day.day)}
          className={cn(P.btn, P.btnGhost, "shrink-0 px-3")}
        >
          <Route size={16} />
          {isOptimizing ? c.optimizing : c.optimize}
        </button>
      </div>
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[#E4DFF3] bg-[#FBF9FF] px-3 py-2 text-[13px] text-[#5B5674]">
        <StickyNote size={15} className="text-[#7C3AED]" />
        <input
          value={day.notes}
          onChange={(e) => setDayNotes(day.day, e.target.value)}
          placeholder={c.addNotes}
          className="w-full bg-transparent text-[14px] font-medium text-[#1A1438] outline-none placeholder:text-[#8B86A3]"
        />
      </label>
      {day.stops.map((stop, i) => (
        <div key={stop.id}>
          <StopCard stop={stop} index={i + 1} />
          {day.legs[i] ? <LegTransport leg={day.legs[i]} /> : null}
        </div>
      ))}
      {hotels.length ? (
        <div className="rounded-2xl border border-[#E8E4F4] bg-white px-3 py-3">
          <p className="mb-1 text-[12px] font-black text-[#2E1065]">{c.nearbyHotels}</p>
          <SalesOfferCards layout="slider" cards={hotels.slice(0, 8)} />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => setCenterTab("ideas")}
          className={cn(P.btn, P.btnPrimary, "flex-1")}
        >
          <Plus size={16} />
          {c.places}
        </button>
        <button type="button" onClick={onAddPlace} className={cn(P.btn, P.btnGhost, "flex-1")}>
          <Plus size={16} />
          {c.custom}
        </button>
      </div>
    </div>
  );
}
