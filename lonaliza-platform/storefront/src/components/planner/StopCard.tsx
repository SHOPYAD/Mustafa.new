"use client";

import { useState } from "react";
import { ArrowRightLeft, Clock, Pencil, Star, Trash2 } from "lucide-react";
import type { PlannerIdea, PlannerStop } from "@/types/planner";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import { KindMark, kindLabel } from "./KindMark";
import { cn } from "@/lib/utils";
import { getSafeAttractionFallback } from "@/lib/planner/place-photos";

export default function StopCard({
  stop,
  index,
}: {
  stop: PlannerStop;
  index: number;
}) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const {
    trip,
    selectedIds,
    toggleSelected,
    setSelectedStopId,
    selectedStopId,
    updateStop,
    removeStops,
    moveStop,
    replaceStop,
    setDetailStop,
    setHoveredStopId,
  } = usePlanner();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(locale === "ar" ? stop.titleAr : stop.titleEn);
  const [swap, setSwap] = useState<PlannerIdea[]>([]);
  const title = locale === "ar" ? stop.titleAr : stop.titleEn;
  const detail = locale === "ar" ? stop.detailAr : stop.detailEn;
  const selected = selectedIds.includes(stop.id);
  const active = selected || selectedStopId === stop.id;

  const loadSwap = async () => {
    const dest = trip?.destination || "";
    if (!dest) return;
    const res = await fetch(`/internal/planner/ideas?q=${encodeURIComponent(dest)}`);
    const data = await res.json();
    setSwap((data.ideas || []).filter((i: PlannerIdea) => i.titleEn !== stop.titleEn).slice(0, 8));
  };

  return (
    <article
      onMouseEnter={() => setHoveredStopId(stop.id)}
      onMouseLeave={() => setHoveredStopId(null)}
      className={cn(
        "rounded-2xl border bg-white p-2.5 transition",
        active ? "border-[#7C3AED] shadow-[0_8px_24px_-16px_rgba(46,16,101,0.55)]" : "border-[#E4DFF3]"
      )}
    >
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => toggleSelected(stop.id)}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center"
          aria-label={c.selected}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md border-2",
              selected ? "border-[#7C3AED] bg-[#7C3AED] text-white" : "border-[#C4B5FD] bg-white"
            )}
          >
            {selected ? "✓" : ""}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedStopId(stop.id);
            setDetailStop(stop);
          }}
          className="flex min-w-0 flex-1 cursor-pointer gap-3 text-start"
        >
          <div className="relative h-24 w-[112px] shrink-0 overflow-hidden rounded-xl bg-[#F3E8FF]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stop.image || getSafeAttractionFallback(stop.kind, trip?.destination)}
              alt={title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getSafeAttractionFallback(stop.kind, trip?.destination);
              }}
              className="h-full w-full object-cover"
            />
            <span className="absolute start-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#2E1065] text-[11px] font-black text-white shadow">
              {index}
            </span>
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {stop.slotAr || stop.slotEn ? (
                <span className="rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-black text-[#6D28D9]">
                  {locale === "ar" ? stop.slotAr : stop.slotEn}
                </span>
              ) : null}
              <KindMark kind={stop.kind} size={12} />
              <span className="text-[12px] font-bold text-[#6B6584]">{kindLabel(stop.kind, locale === "ar")}</span>
            </div>
            {editing ? (
              <input
                value={draft}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  if (locale === "ar") updateStop(stop.id, { titleAr: draft });
                  else updateStop(stop.id, { titleEn: draft });
                  setEditing(false);
                }}
                className="mt-1 w-full rounded-lg border border-[#C4B5FD] px-2 py-1 text-[15px] font-black text-[#1A1438] outline-none"
              />
            ) : (
              <p className="mt-1 line-clamp-2 text-[15px] font-black leading-snug text-[#1A1438]">{title}</p>
            )}
            {detail ? <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-[#5B5674]">{detail}</p> : null}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold text-[#4B4568]">
              {stop.visitMinutes ? (
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} className="text-[#7C3AED]" />
                  {stop.visitMinutes} {c.min}
                </span>
              ) : null}
              {stop.hours ? (
                <span>
                  {c.open}: {stop.hours}
                </span>
              ) : null}
              {stop.rating ? (
                <span className="inline-flex items-center gap-0.5 text-[#B45309]">
                  <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                  {stop.rating}
                  {stop.reviews ? (
                    <span className="font-medium text-[#6B6584]">
                      ({stop.reviews.toLocaleString()} {c.reviews})
                    </span>
                  ) : null}
                </span>
              ) : null}
              {stop.free ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">{c.free}</span>
              ) : stop.priceUsd ? (
                <span className="font-black text-[#2E1065]">${stop.priceUsd}</span>
              ) : null}
            </div>
          </div>
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:ps-[52px]">
        <button
          type="button"
          onClick={() => {
            setDraft(title);
            setEditing(true);
          }}
          className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-[12px] font-bold text-slate-700 hover:bg-[#F3E8FF]"
        >
          <Pencil size={13} />
          {c.edit}
        </button>
        <button
          type="button"
          onClick={() => void loadSwap()}
          className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-[12px] font-bold text-slate-700 hover:bg-[#F3E8FF]"
        >
          <ArrowRightLeft size={13} />
          {c.replace}
        </button>
        <select
          value={stop.day}
          onChange={(e) => moveStop(stop.id, Number(e.target.value))}
          className="h-9 rounded-lg border border-[#E4DFF3] bg-white px-2 text-[12px] font-bold text-slate-700"
          aria-label={c.moveTo}
        >
          {(trip?.days || []).map((d) => (
            <option key={d.day} value={d.day}>
              {c.moveTo} {d.day}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => removeStops([stop.id])}
          className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-[12px] font-bold text-rose-700 hover:bg-rose-50"
        >
          <Trash2 size={13} />
          {c.delete}
        </button>
      </div>
      {swap.length ? (
        <div className="mt-2 space-y-1.5 ps-[52px]">
          {swap.map((idea) => (
            <button
              key={idea.id}
              type="button"
              onClick={() => {
                replaceStop(stop.id, idea);
                setSwap([]);
              }}
              className="flex w-full items-center gap-2 rounded-xl border border-[#E4DFF3] px-2 py-1.5 text-start hover:border-[#C4B5FD]"
            >
              <span className="h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F3E8FF]">
                {idea.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={idea.image} alt="" className="h-full w-full object-cover" />
                ) : null}
              </span>
              <span className="line-clamp-1 text-[13px] font-bold text-[#1A1438]">
                {locale === "ar" ? idea.titleAr : idea.titleEn}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
