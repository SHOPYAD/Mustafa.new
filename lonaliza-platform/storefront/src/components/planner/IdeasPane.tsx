"use client";

import { useEffect, useMemo, useState } from "react";
import { BookmarkPlus, Check, Plus, Search, Star } from "lucide-react";
import type { PlannerIdea, PlannerStopKind } from "@/types/planner";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import { KindMark, kindLabel } from "./KindMark";
import { cn } from "@/lib/utils";
import { P } from "./planner-ui";
import { getSafeAttractionFallback } from "@/lib/planner/place-photos";

const FILTERS: Array<PlannerStopKind | "all"> = ["all", "attraction", "food", "hotel", "shopping"];

function looksLikeCity(q: string): boolean {
  const t = q.trim();
  if (t.length < 3) return false;
  if (/\d/.test(t)) return false;
  return !/(street|st\.|avenue|hotel|museum|مسجد|شارع|فندق)/i.test(t);
}

export default function IdeasPane() {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { trip, addStop, addLater, activeDay, setDetailStop } = usePlanner();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<PlannerStopKind | "all">("all");
  const [ideas, setIdeas] = useState<PlannerIdea[]>([]);
  const [cities, setCities] = useState<Array<{ label: string; city: string }>>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  const taken = useMemo(() => {
    const names = new Set<string>();
    for (const d of trip?.days || []) {
      for (const s of d.stops) names.add(s.titleEn.toLowerCase());
    }
    for (const s of trip?.later || []) names.add(s.titleEn.toLowerCase());
    return names;
  }, [trip]);

  const discoverIdeas = useMemo<PlannerIdea[]>(
    () =>
      (trip?.discover || [])
        .filter((s) => !taken.has(s.titleEn.toLowerCase()))
        .map((s) => ({ ...s, category: s.kind })),
    [trip?.discover, taken]
  );

  useEffect(() => {
    const dest = (city || trip?.destination || "").trim();
    if (!dest) {
      setIdeas([]);
      setLoading(false);
      return;
    }
    const params = new URLSearchParams({ q: dest });
    if (kind !== "all") params.set("kind", kind);
    setLoading(true);
    void fetch(`/internal/planner/ideas?${params}`)
      .then(async (r) => {
        const d = await r.json();
        if (d.ok) setIdeas(d.ideas || []);
      })
      .finally(() => setLoading(false));
  }, [trip?.destination, kind, city]);

  useEffect(() => {
    if (!looksLikeCity(q) || q.trim().length < 3) {
      setCities([]);
      return;
    }
    const t = window.setTimeout(() => {
      void fetch(`/internal/planner/places?q=${encodeURIComponent(q)}&lang=${locale}`)
        .then((r) => r.json())
        .then((d) => setCities((d.places || []).slice(0, 6)))
        .catch(() => setCities([]));
    }, 280);
    return () => window.clearTimeout(t);
  }, [q, locale]);

  const filtered = useMemo(() => {
    const extra = ideas.filter((idea) => {
      if (taken.has(idea.titleEn.toLowerCase())) return false;
      if (discoverIdeas.some((d) => d.titleEn.toLowerCase() === idea.titleEn.toLowerCase())) return false;
      if (!q.trim() || city) return true;
      return `${idea.titleAr} ${idea.titleEn}`.toLowerCase().includes(q.toLowerCase());
    });
    const fromDiscover =
      !q.trim() || city
        ? discoverIdeas.filter((idea) => kind === "all" || idea.kind === kind)
        : discoverIdeas.filter(
            (idea) =>
              (kind === "all" || idea.kind === kind) &&
              `${idea.titleAr} ${idea.titleEn}`.toLowerCase().includes(q.toLowerCase())
          );
    return [...fromDiscover, ...extra];
  }, [ideas, taken, q, city, discoverIdeas, kind]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#FBF9FF]">
      <div className="shrink-0 space-y-2.5 border-b border-[#E4DFF3] bg-white p-3">
        <label className="flex h-12 items-center gap-2 rounded-xl border border-[#E4DFF3] bg-white px-3">
          <Search size={16} className="text-[#7C3AED]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={c.searchPlace}
            className="w-full bg-transparent text-[15px] text-[#1A1438] outline-none placeholder:text-[#8B86A3]"
          />
        </label>
        {cities.length ? (
          <div className="flex flex-wrap gap-1.5">
            {cities.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setCity(item.city || item.label);
                  setQ(item.city || item.label);
                  setCities([]);
                }}
                className="rounded-full bg-[#F3E8FF] px-3 py-1 text-[12px] font-bold text-[#6D28D9]"
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setKind(f)}
              className={cn(P.chip, kind === f ? P.chipOn : P.chipOff)}
            >
              {f === "all"
                ? c.all
                : f === "food"
                  ? c.food
                  : f === "hotel"
                    ? c.hotels
                    : f === "shopping"
                      ? c.shopping
                      : c.attractions}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-2xl border border-[#E4DFF3] bg-white p-2.5">
                <div className="h-[92px] w-[104px] animate-pulse rounded-xl bg-[#EDE9FE]" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-[#EDE9FE]" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[#F3E8FF]" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {!loading && filtered.length === 0 ? (
          <p className="px-2 py-10 text-center text-[14px] font-medium leading-6 text-[#5B5674]">{c.emptyIdeas}</p>
        ) : null}
        {filtered.map((idea) => {
          const title = locale === "ar" ? idea.titleAr : idea.titleEn;
          return (
            <article
              key={idea.id}
              className="flex gap-3 rounded-2xl border border-[#E4DFF3] bg-white p-2.5 shadow-[0_6px_18px_-16px_rgba(46,16,101,0.4)]"
            >
              <button type="button" onClick={() => setDetailStop(idea)} className="relative h-[92px] w-[104px] shrink-0 overflow-hidden rounded-xl bg-[#F3E8FF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={idea.image || getSafeAttractionFallback(idea.kind, city || trip?.destination)}
                  alt={title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getSafeAttractionFallback(idea.kind, city || trip?.destination);
                  }}
                  className="h-full w-full object-cover"
                />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-[#6B6584]">{kindLabel(idea.kind, locale === "ar")}</p>
                <p className="mt-0.5 line-clamp-2 text-[15px] font-black leading-snug text-[#1A1438]">{title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#4B4568]">
                  {idea.rating ? (
                    <span className="inline-flex items-center gap-0.5 text-[#B45309]">
                      <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                      {idea.rating}
                    </span>
                  ) : null}
                  {idea.distanceKm != null ? (
                    <span>
                      {idea.distanceKm} {c.km} · {c.fromYou}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 self-center">
                <button
                  type="button"
                  onClick={() => addStop(idea, activeDay || 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C3AED] text-white"
                  aria-label={c.add}
                >
                  <Plus size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => addLater(idea)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]"
                  aria-label={c.addToLater}
                >
                  <BookmarkPlus size={16} />
                </button>
              </div>
            </article>
          );
        })}
        {taken.size ? (
          <p className="inline-flex items-center gap-1 px-1 text-[12px] font-semibold text-emerald-700">
            <Check size={12} />
            {taken.size} {c.added}
          </p>
        ) : null}
      </div>
    </div>
  );
}
