"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Baby,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Compass,
  Crown,
  Heart,
  Landmark,
  MapPin,
  Moon,
  Mountain,
  Palmtree,
  ShoppingBag,
  Sparkles,
  Sun,
  Trees,
  Users,
  User,
  Utensils,
  Waves,
  Car,
  Footprints,
  Radar,
} from "lucide-react";
import { usePlanner } from "./PlannerStore";
import { PLANNER_MONTHS_AR, PLANNER_MONTHS_EN, plannerCopy } from "@/lib/planner/copy";
import { prefsStyles } from "@/lib/planner/styles";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { P } from "./planner-ui";
import type {
  PlannerCompanion,
  PlannerIntake as PlannerIntakeData,
  PlannerPace,
  PlannerRhythm,
  PlannerStay,
  PlannerStyle,
  PlannerTransportMode,
} from "@/types/planner";

type PlaceHit = { label: string; lat: number; lng: number; city?: string };

function safeAddDaysIso(baseDateStr: string | undefined, days: number): string | undefined {
  if (!baseDateStr) return undefined;
  const parts = String(baseDateStr).split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return undefined;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(d.getTime())) return undefined;
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeDaysBetween(arrStr: string | undefined, depStr: string | undefined): number | null {
  if (!arrStr || !depStr) return null;
  const pArr = String(arrStr).split("-").map(Number);
  const pDep = String(depStr).split("-").map(Number);
  if (pArr.length !== 3 || pDep.length !== 3 || pArr.some(isNaN) || pDep.some(isNaN)) return null;
  const dArr = new Date(pArr[0], pArr[1] - 1, pArr[2]);
  const dDep = new Date(pDep[0], pDep[1] - 1, pDep[2]);
  if (isNaN(dArr.getTime()) || isNaN(dDep.getTime()) || dDep < dArr) return null;
  return Math.max(1, Math.round((dDep.getTime() - dArr.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export default function PlannerIntake({
  onGenerate,
  error,
}: {
  onGenerate: (self?: boolean) => void;
  error?: string;
}) {
  const { locale } = useLocale();
  const lang = locale;
  const c = plannerCopy(locale);
  const { intakeDraft, setIntakeDraft, generating } = usePlanner();
  const destRef = useRef<HTMLInputElement>(null);
  const [flex, setFlex] = useState(true);
  const [dateOpen, setDateOpen] = useState(false);
  const [prefOpen, setPrefOpen] = useState(true);
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [qOpen, setQOpen] = useState(false);
  const [originHits, setOriginHits] = useState<PlaceHit[]>([]);
  const [originOpen, setOriginOpen] = useState(false);
  const months = locale === "ar" ? PLANNER_MONTHS_AR : PLANNER_MONTHS_EN;

  useEffect(() => {
    const q = intakeDraft.destination.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      void fetch(`/internal/planner/places?q=${encodeURIComponent(q)}&lang=${locale}`, { cache: "no-store" })
        .then(async (res) => {
          const data = await res.json();
          const places = (data.places || []) as PlaceHit[];
          if (places.length) {
            setHits(places);
            setQOpen(true);
            return;
          }
          const geo = await fetch("/internal/planner/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q }),
          }).then((r) => r.json());
          setHits(geo.places || []);
          setQOpen(true);
        })
        .catch(() => {
          void fetch("/internal/planner/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q }),
          }).then(async (res) => {
            const data = await res.json();
            setHits(data.places || []);
            setQOpen(true);
          });
        });
    }, 280);
    return () => window.clearTimeout(t);
  }, [intakeDraft.destination, locale]);

  useEffect(() => {
    if (error !== "destination") return;
    destRef.current?.focus();
    destRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  useEffect(() => {
    const q = intakeDraft.origin.trim();
    if (q.length < 2) {
      setOriginHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      void fetch(`/internal/planner/places?q=${encodeURIComponent(q)}&lang=${locale}`, { cache: "no-store" })
        .then(async (res) => {
          const data = await res.json();
          setOriginHits((data.places || []) as PlaceHit[]);
          setOriginOpen(true);
        })
        .catch(() => setOriginHits([]));
    }, 280);
    return () => window.clearTimeout(t);
  }, [intakeDraft.origin, locale]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-white px-5 py-6 lg:px-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2E1065] text-white">
          <MapPin size={20} />
        </span>
        <div>
          <h1 className="text-[22px] font-black leading-tight tracking-tight text-[#2E1065] lg:text-[26px]">{c.planner}</h1>
          <p className="mt-0.5 text-[13px] font-medium text-[#5B5674]">{c.productHint}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <label className="relative block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-[#4B4568]">
            <MapPin size={15} className="text-[#7C3AED]" />
            {c.startingFrom}
          </span>
          <input
            value={intakeDraft.origin}
            onChange={(e) => {
              setIntakeDraft({ origin: e.target.value });
              setOriginOpen(true);
            }}
            placeholder={c.originPlaceholder}
            className={P.field}
          />
          {originOpen && originHits.length > 0 ? (
            <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[#E4DFF3] bg-white shadow-lg">
              {originHits.map((hit) => (
                <li key={`o-${hit.label}-${hit.lat}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIntakeDraft({ origin: hit.city || hit.label.split("—")[0]?.trim() || hit.label });
                      setOriginOpen(false);
                    }}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 py-2 text-start text-[14px] font-semibold text-[#1A1438] hover:bg-[#F3E8FF]"
                  >
                    <MapPin size={14} className="shrink-0 text-[#7C3AED]" />
                    <span className="line-clamp-2">{hit.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </label>

        <label className="relative block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-[#4B4568]">
            <Landmark size={15} className="text-[#7C3AED]" />
            {c.headingTo}
          </span>
          <input
            ref={destRef}
            value={intakeDraft.destination}
            onChange={(e) => {
              setIntakeDraft({ destination: e.target.value, destLat: undefined, destLng: undefined });
              setQOpen(true);
            }}
            placeholder={c.destPlaceholder}
            className={cn(P.field, error === "destination" && "border-rose-400 ring-2 ring-rose-200")}
          />
          {error === "destination" ? (
            <p className="mt-1.5 text-[13px] font-bold text-rose-600">{c.destRequired}</p>
          ) : null}
          {qOpen && hits.length > 0 ? (
            <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[#E4DFF3] bg-white shadow-lg">
              {hits.map((hit) => (
                <li key={`${hit.label}-${hit.lat}`}>
                  <button
                    type="button"
                    onClick={() => {
                      const city = hit.city || hit.label.split(",")[0] || hit.label;
                      if (hit.lat && hit.lng) {
                        setIntakeDraft({ destination: city, destLat: hit.lat, destLng: hit.lng });
                        setQOpen(false);
                        return;
                      }
                      void fetch("/internal/planner/geocode", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ q: city }),
                      }).then(async (res) => {
                        const data = await res.json();
                        const first = data.places?.[0];
                        setIntakeDraft({
                          destination: city,
                          destLat: first?.lat,
                          destLng: first?.lng,
                        });
                        setQOpen(false);
                      });
                    }}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 py-2 text-start text-[14px] font-semibold text-[#1A1438] hover:bg-[#F3E8FF]"
                  >
                    <MapPin size={14} className="shrink-0 text-[#7C3AED]" />
                    <span className="line-clamp-2">{hit.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </label>

        <div>
          <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-[#4B4568]">
            <CalendarDays size={15} className="text-[#7C3AED]" />
            {c.dateDuration}
          </span>
          <button
            type="button"
            onClick={() => setDateOpen((v) => !v)}
            className={cn(P.field, "flex items-center justify-between text-start")}
          >
            <span>
              {intakeDraft.durationDays} {c.days}
              {intakeDraft.month ? ` · ${intakeDraft.month}` : ""}
              {flex ? ` · ${c.flexible}` : ""}
            </span>
            <ChevronDown size={16} />
          </button>
          {dateOpen ? (
            <div className="mt-2 rounded-2xl border border-[#E4DFF3] bg-white p-3 shadow-md">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFlex(false)}
                  className={cn(P.chip, !flex ? P.chipOn : P.chipOff)}
                >
                  {c.selectDate}
                </button>
                <button
                  type="button"
                  onClick={() => setFlex(true)}
                  className={cn(P.chip, flex ? P.chipOn : P.chipOff)}
                >
                  {c.flexible}
                </button>
              </div>
              <p className="mt-3 mb-1.5 text-[12px] font-bold text-[#5B5674]">{c.days}</p>
              <div className="flex flex-wrap gap-1.5">
                {[3, 4, 5, 7, 10, 12, 14, 15, 21, 30].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      const updates: Partial<PlannerIntakeData> = { durationDays: n };
                      if (intakeDraft.arrivalDate) {
                        const nextDep = safeAddDaysIso(intakeDraft.arrivalDate, n - 1);
                        if (nextDep) updates.departureDate = nextDep;
                      }
                      setIntakeDraft(updates);
                    }}
                    className={cn(P.chip, intakeDraft.durationDays === n ? P.chipOn : P.chipOff)}
                  >
                    {n} {c.dayN}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">
                  {lang === "ar" ? "أو حدد عدداً مخصصاً:" : "Or custom days:"}
                </span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={intakeDraft.durationDays}
                  onChange={(e) => {
                    const n = Math.max(1, Math.min(30, Number(e.target.value) || 1));
                    const updates: Partial<PlannerIntakeData> = { durationDays: n };
                    if (intakeDraft.arrivalDate) {
                      const nextDep = safeAddDaysIso(intakeDraft.arrivalDate, n - 1);
                      if (nextDep) updates.departureDate = nextDep;
                    }
                    setIntakeDraft(updates);
                  }}
                  className="w-20 rounded-lg border border-violet-200 bg-white px-2 py-1 text-[12px] font-bold text-[#2E1065] text-center"
                />
                <span className="text-[11px] font-bold text-slate-500">{lang === "ar" ? "يوم" : "days"}</span>
              </div>
              <p className="mt-3 mb-1.5 text-[12px] font-bold text-[#5B5674]">{c.months}</p>
              <div className="flex flex-wrap gap-1.5">
                {months.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setIntakeDraft({ month: PLANNER_MONTHS_EN[i] })}
                    className={cn(P.chip, intakeDraft.month === PLANNER_MONTHS_EN[i] ? P.chipOn : P.chipOff)}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {!flex ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      {lang === "ar" ? "تاريخ الوصول" : "Arrival"}
                    </label>
                    <input
                      type="date"
                      value={intakeDraft.arrivalDate || ""}
                      onChange={(e) => {
                        const arr = e.target.value;
                        const dep = intakeDraft.departureDate;
                        const updates: Partial<PlannerIntakeData> = { arrivalDate: arr };
                        const diff = safeDaysBetween(arr, dep);
                        if (diff !== null) {
                          updates.durationDays = diff;
                        } else if (arr && intakeDraft.durationDays) {
                          const nextDep = safeAddDaysIso(arr, intakeDraft.durationDays - 1);
                          if (nextDep) updates.departureDate = nextDep;
                        }
                        setIntakeDraft(updates);
                      }}
                      className={P.field}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      {lang === "ar" ? "تاريخ المغادرة" : "Departure"}
                    </label>
                    <input
                      type="date"
                      value={intakeDraft.departureDate || ""}
                      onChange={(e) => {
                        const dep = e.target.value;
                        const arr = intakeDraft.arrivalDate;
                        const updates: Partial<PlannerIntakeData> = { departureDate: dep };
                        const diff = safeDaysBetween(arr, dep);
                        if (diff !== null) {
                          updates.durationDays = diff;
                        }
                        setIntakeDraft(updates);
                      }}
                      className={P.field}
                    />
                  </div>
                </div>
              ) : null}

              {/* Discovery Radius Slider */}
              <div className="mt-4 border-t border-[#E4DFF3]/80 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#4B4568]">
                    <Radar size={14} className="text-[#7C3AED]" />
                    {lang === "ar" ? "نطاق الاستكشاف الجغرافي" : "Discovery Radius"}
                  </span>
                  <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-[11px] font-black text-[#7C3AED]">
                    {intakeDraft.radiusKm || 25} {lang === "ar" ? "كم" : "km"}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={intakeDraft.radiusKm || 25}
                  onChange={(e) => setIntakeDraft({ radiusKm: Number(e.target.value) })}
                  className="mt-2 w-full accent-[#7C3AED] cursor-pointer"
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {[
                    { km: 15, ar: "15 كم: معالم المركز", en: "15km Center" },
                    { km: 25, ar: "25 كم: المدينة الكاملة", en: "25km City" },
                    { km: 50, ar: "50 كم: رحلات يومية", en: "50km Day Trips" },
                    { km: 100, ar: "100 كم: إقليم شامل", en: "100km Region" },
                  ].map((r) => (
                    <button
                      key={r.km}
                      type="button"
                      onClick={() => setIntakeDraft({ radiusKm: r.km })}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-md border font-bold transition-all",
                        (intakeDraft.radiusKm || 25) === r.km
                          ? "border-[#7C3AED] bg-violet-50 text-[#7C3AED]"
                          : "border-slate-200 text-slate-500 hover:border-violet-200"
                      )}
                    >
                      {lang === "ar" ? r.ar : r.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Transport Mode */}
              <div className="mt-3 flex items-center justify-between border-t border-[#E4DFF3]/80 pt-2.5">
                <span className="text-[12px] font-bold text-[#4B4568] flex items-center gap-1.5">
                  <Car size={14} className="text-[#7C3AED]" />
                  {lang === "ar" ? "وسيلة التنقل الافتراضية" : "Transport Mode"}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setIntakeDraft({ transportMode: "car" })}
                    className={cn(
                      "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all",
                      (!intakeDraft.transportMode || intakeDraft.transportMode === "car")
                        ? "border-[#7C3AED] bg-violet-600 text-white shadow-xs"
                        : "border-slate-200 text-slate-500 hover:border-violet-200"
                    )}
                  >
                    <Car size={12} />
                    <span>{lang === "ar" ? "سيارة خاصة VIP" : "Private Car"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntakeDraft({ transportMode: "walk" })}
                    className={cn(
                      "flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all",
                      intakeDraft.transportMode === "walk"
                        ? "border-[#7C3AED] bg-violet-600 text-white shadow-xs"
                        : "border-slate-200 text-slate-500 hover:border-violet-200"
                    )}
                  >
                    <Footprints size={12} />
                    <span>{lang === "ar" ? "مشي" : "Walking"}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDateOpen(false)}
                className={cn(P.btn, P.btnPrimary, "mt-3 w-full")}
              >
                <Check size={16} />
                {c.confirm}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPrefOpen((v) => !v)}
        className="mt-5 flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-[#E4DFF3] bg-[#F7F5FC] px-3 text-[14px] font-bold text-[#2E1065]"
      >
        <span className="inline-flex items-center gap-2">
          <Users size={16} />
          {c.prefs}
        </span>
        <ChevronDown size={16} className={prefOpen ? "rotate-180" : ""} />
      </button>

      {prefOpen ? (
        <div className="mt-3 space-y-4 rounded-2xl border border-[#E4DFF3] p-3">
          <Group
            icon={<Users size={14} />}
            label={c.companion}
            value={intakeDraft.prefs.companion}
            options={[
              ["solo", locale === "ar" ? "فرد" : "Solo", <User size={14} key="s" />],
              ["family", locale === "ar" ? "عائلة" : "Family", <Baby size={14} key="f" />],
              ["couple", locale === "ar" ? "زوجان" : "Couple", <Users size={14} key="c" />],
              ["friends", locale === "ar" ? "أصدقاء" : "Friends", <Users size={14} key="fr" />],
              ["elderly", locale === "ar" ? "كبار سن" : "Elderly", <Users size={14} key="e" />],
            ]}
            onPick={(v) => setIntakeDraft({ prefs: { ...intakeDraft.prefs, companion: v as PlannerCompanion } })}
          />
          <GroupMulti
            icon={<Landmark size={14} />}
            label={c.style}
            hint={c.styleMix}
            values={prefsStyles(intakeDraft.prefs)}
            locale={locale}
            options={[
              ["cultural", locale === "ar" ? "ثقافي وتراثي" : "Cultural", <Landmark size={14} key="cu" />],
              ["historical", locale === "ar" ? "تاريخي وآثار" : "Historical", <Landmark size={14} key="h" />],
              ["nature", locale === "ar" ? "طبيعة وريف" : "Nature", <Trees size={14} key="n" />],
              ["classic", locale === "ar" ? "كلاسيكي وأيقوني" : "Classic", <Compass size={14} key="cl" />],
              ["cityscape", locale === "ar" ? "أجواء المدينة" : "City", <MapPin size={14} key="ci" />],
              ["beaches", locale === "ar" ? "شواطئ وبحرية" : "Beaches", <Palmtree size={14} key="bch" />],
              ["relaxation", locale === "ar" ? "استجمام وسبا" : "Relaxation", <Waves size={14} key="rx" />],
              ["adventure", locale === "ar" ? "مغامرة وتشويق" : "Adventure", <Mountain size={14} key="ad" />],
              ["family", locale === "ar" ? "ترفيه عائلي" : "Family", <Baby size={14} key="fam" />],
              ["shopping", locale === "ar" ? "تسوق وبازارات" : "Shopping", <ShoppingBag size={14} key="sh" />],
              ["food", locale === "ar" ? "طهي وتذوق" : "Food", <Utensils size={14} key="fo" />],
              ["luxury", locale === "ar" ? "فاخر ونخبة VIP" : "Luxury VIP", <Crown size={14} key="lux" />],
              ["romantic", locale === "ar" ? "رومانسي" : "Romantic", <Heart size={14} key="ro" />],
              ["photography", locale === "ar" ? "تصوير ومناظر" : "Photography", <Camera size={14} key="ph" />],
            ]}
            onToggle={(id) => {
              const cur = prefsStyles(intakeDraft.prefs);
              const style = id as PlannerStyle;
              const next = cur.includes(style) ? cur.filter((s) => s !== style) : [...cur, style];
              const styles = next.length ? next : [style];
              setIntakeDraft({ prefs: { ...intakeDraft.prefs, style: styles[0], styles } });
            }}
          />
          <Group
            icon={<Sun size={14} />}
            label={c.pace}
            value={intakeDraft.prefs.pace}
            options={[
              ["ambitious", locale === "ar" ? "طموح" : "Ambitious"],
              ["moderate", locale === "ar" ? "معتدل" : "Moderate"],
              ["relaxed", locale === "ar" ? "مريح" : "Relaxed"],
            ]}
            onPick={(v) => setIntakeDraft({ prefs: { ...intakeDraft.prefs, pace: v as PlannerPace } })}
          />
          <Group
            icon={<MapPin size={14} />}
            label={c.stay}
            value={intakeDraft.prefs.stay}
            options={[
              ["comfort", locale === "ar" ? "مريحة" : "Comfort"],
              ["premium", locale === "ar" ? "مميزة" : "Premium"],
              ["luxury", locale === "ar" ? "فاخرة" : "Luxury"],
            ]}
            onPick={(v) => setIntakeDraft({ prefs: { ...intakeDraft.prefs, stay: v as PlannerStay } })}
          />
          <Group
            icon={<Moon size={14} />}
            label={c.rhythm}
            value={intakeDraft.prefs.rhythm}
            options={[
              ["early", locale === "ar" ? "بداية مبكرة" : "Early starts", <Sun size={14} key="e" />],
              ["late", locale === "ar" ? "سهر" : "Late nights", <Moon size={14} key="l" />],
            ]}
            onPick={(v) => setIntakeDraft({ prefs: { ...intakeDraft.prefs, rhythm: v as PlannerRhythm } })}
          />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-[#4B4568]">{c.other}</span>
            <textarea
              maxLength={1000}
              rows={3}
              value={intakeDraft.prefs.notes}
              onChange={(e) => setIntakeDraft({ prefs: { ...intakeDraft.prefs, notes: e.target.value } })}
              placeholder={c.otherHint}
              className="w-full rounded-xl border border-[#E4DFF3] px-3 py-2 text-[14px] outline-none focus:border-[#7C3AED]"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 pb-4">
        <button
          type="button"
          disabled={generating}
          onClick={() => {
            setQOpen(false);
            setOriginOpen(false);
            if (!intakeDraft.destination.trim()) {
              destRef.current?.focus();
              destRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            onGenerate(false);
          }}
          className={cn(P.btn, P.btnPrimary, "h-12 w-full text-[15px]")}
        >
          <Sparkles size={17} />
          {generating ? c.planAiBusy : c.planAi}
        </button>
        <button
          type="button"
          disabled={generating}
          onClick={() => onGenerate(true)}
          className={cn(P.btn, P.btnGhost, "w-full")}
        >
          {c.createMyself}
        </button>
        {error === "failed" ? <p className="text-center text-[13px] font-bold text-rose-600">{c.generateFailed}</p> : null}
      </div>

      <section className="mt-4 rounded-2xl border border-dashed border-[#E4DFF3] px-4 py-6 text-center">
        <User size={36} className="mx-auto text-[#C4B5FD]" />
        <p className="mt-2 text-[15px] font-bold text-[#2E1065]">{c.myTrips}</p>
        <p className="mt-1 text-[13px] leading-6 text-[#5B5674]">{c.noTrips}</p>
      </section>
    </div>
  );
}

function GroupMulti({
  label,
  values,
  options,
  onToggle,
  icon,
  hint,
  locale = "ar",
}: {
  label: string;
  values: string[];
  options: Array<[string, string, ReactNode?]>;
  onToggle: (v: string) => void;
  icon?: ReactNode;
  hint?: string;
  locale?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#4B4568]">
          {icon}
          {label}
        </p>
        {values.length > 0 && (
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-black text-[#7C3AED]">
            {values.length}{" "}
            {values.length === 1
              ? locale === "ar"
                ? "أسلوب محدد"
                : "style"
              : locale === "ar"
                ? "أساليب ممزوجة"
                : "blended styles"}
          </span>
        )}
      </div>
      {hint ? <p className="mb-2 text-[12px] leading-5 text-[#6B6584]">{hint}</p> : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map(([id, name, ico]) => (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={cn(P.chip, values.includes(id) ? P.chipOn : P.chipOff)}
          >
            {ico}
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Group({
  label,
  value,
  options,
  onPick,
  icon,
}: {
  label: string;
  value: string;
  options: Array<[string, string, ReactNode?]>;
  onPick: (v: string) => void;
  icon?: ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-[#4B4568]">
        {icon}
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([id, name, ico]) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className={cn(P.chip, value === id ? P.chipOn : P.chipOff)}
          >
            {ico}
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
