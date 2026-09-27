"use client";

import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Copy, Lightbulb, MapPin, Plus, StickyNote, Trash2 } from "lucide-react";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import DayTimeline from "./DayTimeline";
import CanvasProgram from "./CanvasProgram";
import { cn } from "@/lib/utils";
import { P } from "./planner-ui";

export default function ItineraryPane({ onAddPlace }: { onAddPlace?: () => void }) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const {
    trip,
    generating,
    activeDay,
    setActiveDay,
    addDay,
    selectedIds,
    removeStops,
    clearSelected,
    offerCards,
    promoteLater,
    removeLater,
    setDetailStop,
    setCenterTab,
  } = usePlanner();
  const cards = offerCards.length ? offerCards : trip?.cards || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeDay]);

  if (generating && !trip) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#E4DFF3] p-3">
            <div className="h-3 w-24 animate-pulse rounded bg-[#EDE9FE]" />
            <div className="mt-3 h-16 w-full animate-pulse rounded-xl bg-[#F3E8FF]" />
          </div>
        ))}
      </div>
    );
  }

  if (!trip) return null;

  const days = trip.days;
  const current = activeDay === 0 ? null : days.find((d) => d.day === activeDay);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-[#E4DFF3] bg-[#FAF8FF] px-2 py-2">
        <button
          type="button"
          onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
          disabled={activeDay === 0}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E4DFF3] bg-white text-[#2E1065] transition hover:bg-[#F3E8FF] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={locale === "ar" ? "اليوم السابق" : "Previous Day"}
          title={locale === "ar" ? "اليوم السابق" : "Previous Day"}
        >
          {locale === "ar" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div
          ref={scrollContainerRef}
          onWheel={(e) => {
            if (e.deltaY) {
              e.currentTarget.scrollLeft += locale === "ar" ? -e.deltaY : e.deltaY;
            }
          }}
          className="planner-days flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            ref={activeDay === 0 ? activeTabRef : undefined}
            type="button"
            onClick={() => setActiveDay(0)}
            className={cn(
              "h-10 shrink-0 rounded-xl px-3.5 text-[13px] font-black transition shadow-sm",
              activeDay === 0
                ? "bg-[#2E1065] text-white shadow-purple-900/20"
                : "border border-[#E4DFF3] bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            {c.overview}
          </button>
          {days.map((d) => (
            <button
              key={d.day}
              ref={activeDay === d.day ? activeTabRef : undefined}
              type="button"
              onClick={() => setActiveDay(d.day)}
              className={cn(
                "h-10 shrink-0 rounded-xl px-3.5 text-[13px] font-black transition shadow-sm",
                activeDay === d.day
                  ? "bg-[#2E1065] text-white shadow-purple-900/20"
                  : "border border-[#E4DFF3] bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              {locale === "ar" ? `اليوم ${d.day}` : `Day ${d.day}`}
            </button>
          ))}
          <button
            type="button"
            onClick={addDay}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#7C3AED] bg-white text-[#7C3AED] transition hover:bg-[#F3E8FF]"
            aria-label={c.addDay}
            title={c.addDay}
          >
            <Plus size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveDay(Math.min(days.length, activeDay + 1))}
          disabled={activeDay >= days.length}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E4DFF3] bg-white text-[#2E1065] transition hover:bg-[#F3E8FF] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={locale === "ar" ? "اليوم التالي" : "Next Day"}
          title={locale === "ar" ? "اليوم التالي" : "Next Day"}
        >
          {locale === "ar" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-2 bg-[#2E1065] px-3 py-2 text-white">
          <span className="text-[13px] font-bold">
            {selectedIds.length} {c.selected}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                const names = trip.days
                  .flatMap((d) => d.stops)
                  .filter((s) => selectedIds.includes(s.id))
                  .map((s) => (locale === "ar" ? s.titleAr : s.titleEn))
                  .join("\n");
                void navigator.clipboard.writeText(names);
              }}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10"
              aria-label={c.copy}
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              onClick={() => removeStops(selectedIds)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10"
              aria-label={c.delete}
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={clearSelected}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-[20px] hover:bg-white/10"
              aria-label={c.clear}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {current ? (
          <DayTimeline day={current} onAddPlace={onAddPlace} />
        ) : (
          <div className="space-y-3">
            <CanvasProgram trip={trip} cards={cards} />
            {trip.later.length ? (
              <section className="rounded-2xl border border-dashed border-[#E4DFF3] p-4">
                <p className="flex items-center gap-2 text-[13px] font-black text-[#2E1065]">
                  <MapPin size={15} className="text-[#7C3AED]" />
                  {c.later}
                </p>
                {trip.later.map((s) => (
                  <div key={s.id} className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailStop(s)}
                      className="min-w-0 flex-1 text-start text-[14px] font-semibold text-[#4B4568] [unicode-bidi:isolate]"
                    >
                      {locale === "ar" ? s.titleAr : s.titleEn}
                    </button>
                    <select
                      className="h-9 rounded-lg border border-[#E4DFF3] bg-white px-2 text-[12px] font-bold"
                      defaultValue=""
                      onChange={(e) => {
                        const day = Number(e.target.value);
                        if (day) promoteLater(s.id, day);
                      }}
                    >
                      <option value="">{c.moveToDay}</option>
                      {trip.days.map((d) => (
                        <option key={d.day} value={d.day}>
                          {d.day}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => removeLater(s.id)} className="text-[12px] font-bold text-rose-700">
                      {c.delete}
                    </button>
                  </div>
                ))}
              </section>
            ) : null}
            {trip.discover?.length ? (
              <button
                type="button"
                onClick={() => setCenterTab("ideas")}
                className={cn(P.btn, P.btnGhost, "w-full")}
              >
                <Lightbulb size={16} />
                {trip.discover.length} {c.discoverHint}
              </button>
            ) : null}
            {trip.notes ? (
              <section className="rounded-2xl border border-[#E4DFF3] p-4">
                <p className="flex items-center gap-2 text-[13px] font-black text-[#2E1065]">
                  <StickyNote size={15} className="text-[#7C3AED]" />
                  {c.notes}
                </p>
                <p className="mt-2 text-[14px] leading-6 text-[#4B4568]">{trip.notes}</p>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
