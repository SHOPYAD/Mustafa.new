"use client";

import { useState } from "react";
import {
  Download,
  Loader2,
  X,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Coins,
  Car,
  Plane,
  Hotel,
  Compass,
  ArrowUpRight,
  Clock,
  UserCheck,
  Wallet,
  Star,
  Crown,
  Check,
} from "lucide-react";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import { liveSorted, nearbyHotelCards, programCost } from "@/lib/planner/cost";
import { plannerCopy } from "@/lib/planner/copy";
import {
  dayLabel,
  placeCaption,
  tripHeadline,
  writeDayNarrative,
  writeDayShort,
  programIntro,
} from "@/lib/planner/day-copy";
import { formatClientPrice } from "@/lib/planner/money";
import { downloadProgramPdf, programWhatsAppUrl } from "@/lib/planner/program-export";
import { priceEstimateNote } from "@/lib/sales-price-copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import type { PlannerDay, PlannerTrip } from "@/types/planner";
import type { SalesChatCard } from "@/types/sales-chat";
import { KindMark } from "./KindMark";
import { usePlanner } from "./PlannerStore";
import { getSafeAttractionFallback } from "@/lib/planner/place-photos";
import ShareCommunityModal from "./ShareCommunityModal";

export type BudgetTierKey = "smart" | "superior" | "vip";

function WhatsAppMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.2.7.7-3.1-.2-.3A9 9 0 1 1 12 20.5Zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.1-.3c0-.1 0-.3 0-.4s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3s-.8.8-.8 1.9.8 2.2.9 2.3a10 10 0 0 0 3.8 3.4c1.4.6 1.9.6 2.6.5.4-.1 1.6-.6 1.8-1.3s.2-1.2.2-1.3-.2-.2-.5-.3Z" />
    </svg>
  );
}

export default function CanvasProgram({
  trip,
  cards,
}: {
  trip: PlannerTrip;
  cards?: SalesChatCard[];
}) {
  const { locale } = useLocale();
  const lang = locale as Locale;
  const isAr = lang === "ar";
  const c = plannerCopy(lang);
  const { setActiveDay, setDetailStop, setHoveredStopId } = usePlanner();
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [selectedTier, setSelectedTier] = useState<BudgetTierKey>("superior");

  const offerCards = cards?.length ? cards : trip.cards || [];
  const flights = liveSorted(offerCards, "flight");
  const hotels = liveSorted(offerCards, "hotel");
  const cars = liveSorted(offerCards, "car");
  const transfers = liveSorted(offerCards, "transfer");
  const cost = programCost(offerCards, trip.durationDays, trip.currency);
  const title = tripHeadline(trip, lang);
  const dest = trip.destination;
  const cover =
    trip.days.flatMap((d) => d.stops).find((s) => s.image)?.image ||
    hotels[0]?.image ||
    getSafeAttractionFallback("default", dest);

  const rawBase = cost.total || (cost.flight + cost.hotel) || (trip.durationDays * 180);
  const tierCalculatedPrices: Record<BudgetTierKey, number> = {
    smart: Math.max(250, Math.round((rawBase * 0.65) / 50) * 50),
    superior: Math.max(390, Math.round((rawBase * 0.90) / 50) * 50),
    vip: Math.max(650, Math.round((rawBase * 1.35) / 50) * 50),
  };

  const activePrice = tierCalculatedPrices[selectedTier];
  const activeTierLabel =
    selectedTier === "smart"
      ? (isAr ? "الفئة الذكية المعتدلة (Smart Comfort)" : "Smart Comfort Tier")
      : selectedTier === "superior"
        ? (isAr ? "الفئة المميزة الوسطى (Premium Superior ⭐ الأكثر طلباً)" : "Premium Superior Tier")
        : (isAr ? "فئة النخبة والرفاهية (Ultra-VIP Luxury)" : "Ultra-VIP Tier");

  const totalLabel = `${activeTierLabel}: ${formatClientPrice(
    activePrice,
    cost.currency || "USD",
    lang
  )}`;
  const wa = programWhatsAppUrl(trip, offerCards, lang, totalLabel);

  const download = async () => {
    setBusy(true);
    setPdfError("");
    try {
      await downloadProgramPdf(trip, offerCards, lang);
    } catch {
      setPdfError(c.pdfFailed);
    } finally {
      setBusy(false);
    }
  };

  const selected = trip.days.find((d) => d.day === openDay) || null;

  return (
    <div className="w-full min-w-0 space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. Cinematic Hero Header */}
      <div className="group relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#4C1D95] text-white shadow-[0_20px_48px_-20px_rgba(46,16,101,0.85)] border border-violet-500/25">
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getSafeAttractionFallback("default", dest);
            }}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E0B4B] via-[#2E1065]/75 to-black/30" />

          {/* Badges Over Cover */}
          <div className="absolute top-3.5 start-3.5 end-3.5 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-black text-white border border-white/15">
                <Calendar size={12} className="text-violet-300" />
                {trip.durationDays} {c.days}
                {trip.origin ? ` · ${trip.origin}` : ""}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-black text-amber-300 border border-white/15">
                <MapPin size={12} />
                {dest}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-emerald-300 border border-emerald-400/30">
              <ShieldCheck size={12} />
              {isAr ? "برنامج VIP معتمد" : "Verified VIP"}
            </span>
          </div>
        </div>

        {/* Hero Bottom Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-violet-300 text-[11px] font-black uppercase tracking-wider mb-1">
              <Sparkles size={12} className="text-amber-400" />
              <span>{isAr ? "مخطط الرحلة الحصري" : "Executive Itinerary"}</span>
            </div>
            <h2 className="text-[20px] sm:text-[24px] font-black leading-snug tracking-tight text-white [unicode-bidi:isolate]">
              {title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/85 line-clamp-2">
              {programIntro(trip.durationDays, dest, lang)}
            </p>
          </div>

          {/* Hero Action Row & Price */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/15">
            <div>
              <p className="text-[10px] font-bold text-violet-200/70 uppercase tracking-wider">
                {activeTierLabel}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black tabular-nums tracking-tight text-amber-300">
                  {formatClientPrice(activePrice, cost.currency || "USD", lang)}
                </p>
                <span className="text-[11px] font-bold text-amber-200/90">
                  {isAr ? `(الإجمالي لشخصين)` : `(Total for 2 adults)`}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-white/80 mt-0.5">
                {isAr
                  ? `${formatClientPrice(Math.round(activePrice / (Number((trip as any).travelers) || 2)), cost.currency || "USD", lang)} للشخص الواحد شامل كل الخدمات`
                  : `${formatClientPrice(Math.round(activePrice / (Number((trip as any).travelers) || 2)), cost.currency || "USD", lang)} per person all-inclusive`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 text-[12px] font-black text-white shadow-md shadow-amber-500/25 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Coins size={14} className="text-amber-200" />
                <span>{isAr ? "شارك واربح 250 نقطة" : "Share (+250 Pts)"}</span>
              </button>

              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#128C7E] px-3.5 text-[12px] font-black text-white shadow-md transition hover:scale-105 active:scale-95"
                >
                  <WhatsAppMark />
                  <span>{c.bookWhatsApp}</span>
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => void download()}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 text-[12px] font-black text-white border border-white/20 transition hover:bg-white/30 active:scale-95 cursor-pointer"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span>{c.downloadPdf}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {pdfError ? (
        <p className="rounded-xl bg-rose-50 p-2.5 text-center text-[12px] font-bold text-[#B91C1C]">
          {pdfError}
        </p>
      ) : null}

      {/* 2. Three-Tier Budget Package Selector (نماذج باقات الرحلة حسب الميزانية) */}
      <div className="overflow-hidden rounded-[24px] border border-violet-200/80 bg-gradient-to-b from-white via-white to-violet-50/25 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-[#7C3AED] text-[11px] font-black uppercase tracking-wider mb-0.5">
              <Wallet size={13} />
              <span>{isAr ? "خيارات الميزانية المرنة" : "Flexible Budget Models"}</span>
            </div>
            <h3 className="text-[17px] font-black text-slate-900">
              {isAr ? "نماذج باقات الرحلة حسب الميزانية" : "Trip Packages by Budget Tier"}
            </h3>
            <p className="text-[12px] text-slate-500">
              {isAr ? "اختر المستوى المناسب لميزانيتك واحتياجاتك ليتم تخصيص البرنامج والحجز فوراً:" : "Select the tier that best matches your budget and comfort preferences:"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-violet-100/60 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <span>{isAr ? "المدة:" : "Duration:"}</span>
            <span className="font-black text-violet-900 font-mono">{trip.durationDays} {isAr ? "أيام" : "Days"}</span>
          </div>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Tier 1: Smart Comfort */}
          <div
            onClick={() => setSelectedTier("smart")}
            className={`cursor-pointer relative flex flex-col justify-between rounded-2xl p-4.5 transition-all duration-300 ${
              selectedTier === "smart"
                ? "border-2 border-blue-500 bg-blue-50/40 shadow-lg shadow-blue-500/10 ring-2 ring-blue-400/20 scale-[1.01]"
                : "border border-slate-200/90 bg-white hover:border-blue-300 hover:bg-blue-50/20"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black text-blue-800">
                  <Wallet size={11} />
                  {isAr ? "قيمة ذكية معتدلة" : "Smart Value"}
                </span>
                {selectedTier === "smart" ? (
                  <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : null}
              </div>

              <div>
                <h4 className="text-[15px] font-black text-slate-900">
                  {isAr ? "الفئة الذكية المعتدلة" : "Smart Comfort Tier"}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr ? "توازن مثالي بين الجودة والتكلفة الاقتصادية" : "Optimized balance of quality & value"}
                </p>
              </div>

              <div className="pt-1 pb-2 border-b border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold block">{isAr ? "التكلفة الإجمالية (شخصين):" : "Est. Total (2 guests):"}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-blue-700 font-mono">
                    {formatClientPrice(tierCalculatedPrices.smart, cost.currency || "USD", lang)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    ({formatClientPrice(Math.round(tierCalculatedPrices.smart / 2), cost.currency || "USD", lang)} {isAr ? "/ فرد" : "/ person"})
                  </span>
                </div>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>{isAr ? "فندق 4 نجوم مركزي مريح شامل الإفطار" : "4-Star comfortable central hotel with breakfast"}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>{isAr ? "طيران اقتصادي موثوق مع حقائب 23 كجم" : "Economy flights with 23kg luggage"}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>{isAr ? "استقبال وتوديع المطار + بطاقة تنقل ذكية" : "Airport transfers + Smart transit passes"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className={`mt-4 w-full py-2 rounded-xl text-[12px] font-black transition ${
                selectedTier === "smart"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {selectedTier === "smart" ? (isAr ? "✓ الباقة المختارة" : "✓ Selected") : (isAr ? "اختيار الفئة الذكية" : "Select Smart")}
            </button>
          </div>

          {/* Tier 2: Premium Superior (Most Popular) */}
          <div
            onClick={() => setSelectedTier("superior")}
            className={`cursor-pointer relative flex flex-col justify-between rounded-2xl p-4.5 transition-all duration-300 ${
              selectedTier === "superior"
                ? "border-2 border-violet-600 bg-violet-50/50 shadow-xl shadow-violet-600/15 ring-2 ring-violet-400/30 scale-[1.02]"
                : "border border-slate-200/90 bg-white hover:border-violet-300 hover:bg-violet-50/20"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-black text-violet-800">
                  <Star size={11} className="fill-violet-700 text-violet-700" />
                  {isAr ? "الأكثر طلباً وتوازناً ⭐" : "Most Popular ⭐"}
                </span>
                {selectedTier === "superior" ? (
                  <span className="size-5 rounded-full bg-violet-600 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : null}
              </div>

              <div>
                <h4 className="text-[15px] font-black text-slate-900">
                  {isAr ? "الفئة المميزة الوسطى" : "Premium Superior Tier"}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr ? "أعلى قيمة مقابل السعر مع خصوصية فائقة" : "Best value for money & superior privacy"}
                </p>
              </div>

              <div className="pt-1 pb-2 border-b border-violet-100">
                <span className="text-[11px] text-slate-400 font-bold block">{isAr ? "التكلفة الإجمالية (شخصين):" : "Est. Total (2 guests):"}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-violet-700 font-mono">
                    {formatClientPrice(tierCalculatedPrices.superior, cost.currency || "USD", lang)}
                  </span>
                  <span className="text-[10px] font-bold text-violet-600">
                    ({formatClientPrice(Math.round(tierCalculatedPrices.superior / 2), cost.currency || "USD", lang)} {isAr ? "/ فرد" : "/ person"})
                  </span>
                </div>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-violet-600 shrink-0 mt-0.5" />
                  <span>{isAr ? "فندق 4-5 نجوم ديلوكس بقلب المدينة مع إطلالة" : "4-5 Star deluxe city-center hotel with views"}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-violet-600 shrink-0 mt-0.5" />
                  <span>{isAr ? "سيارة مرسيدس خاصة مع سائق للجولات والاستقبال VIP" : "Private Mercedes with chauffeur for tours & airport"}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-violet-600 shrink-0 mt-0.5" />
                  <span>{isAr ? "تذاكر دخول سريع للمعالم ومقاعد مفضلة" : "Fast-track landmark passes & priority access"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className={`mt-4 w-full py-2 rounded-xl text-[12px] font-black transition ${
                selectedTier === "superior"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {selectedTier === "superior" ? (isAr ? "✓ الباقة المختارة" : "✓ Selected") : (isAr ? "اختيار الفئة المميزة" : "Select Superior")}
            </button>
          </div>

          {/* Tier 3: Ultra-VIP Luxury */}
          <div
            onClick={() => setSelectedTier("vip")}
            className={`cursor-pointer relative flex flex-col justify-between rounded-2xl p-4.5 transition-all duration-300 ${
              selectedTier === "vip"
                ? "border-2 border-amber-500 bg-amber-50/40 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/30 scale-[1.01]"
                : "border border-slate-200/90 bg-white hover:border-amber-300 hover:bg-amber-50/20"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                  <Crown size={11} className="text-amber-700" />
                  {isAr ? "فخامة ملكية متكاملة" : "Ultra VIP"}
                </span>
                {selectedTier === "vip" ? (
                  <span className="size-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : null}
              </div>

              <div>
                <h4 className="text-[15px] font-black text-slate-900">
                  {isAr ? "فئة النخبة والرفاهية المطلقة" : "Ultra-VIP Luxury Tier"}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr ? "أعلى مستويات الفخامة الملكية والخدمة الخاصة" : "Highest standard of bespoke royal hospitality"}
                </p>
              </div>

              <div className="pt-1 pb-2 border-b border-amber-100">
                <span className="text-[11px] text-slate-400 font-bold block">{isAr ? "التكلفة الإجمالية (شخصين):" : "Est. Total (2 guests):"}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-amber-700 font-mono">
                    {formatClientPrice(tierCalculatedPrices.vip, cost.currency || "USD", lang)}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800">
                    ({formatClientPrice(Math.round(tierCalculatedPrices.vip / 2), cost.currency || "USD", lang)} {isAr ? "/ فرد" : "/ person"})
                  </span>
                </div>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{isAr ? "أجنحة قصور تاريخية وفنادق 5 نجوم ألترا فاخرة" : "Palace suites & 5-star ultra luxury hotels"}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{isAr ? "مرسيدس فيتو VIP خاصة مع سائق طوال الرحلة (10 س/يوم)" : "Full dedicated VIP Mercedes Vito with chauffeur daily"}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{isAr ? "خدمة كونسيرج 24/7 وصالات VIP وتجارب طهي خاصة" : "24/7 VIP concierge, airport CIP lounge & fine dining"}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className={`mt-4 w-full py-2 rounded-xl text-[12px] font-black transition ${
                selectedTier === "vip"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25"
                  : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              {selectedTier === "vip" ? (isAr ? "✓ الباقة المختارة" : "✓ Selected") : (isAr ? "اختيار باقة VIP" : "Select VIP")}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mercedes Vito VIP Private Transfer Feature Card */}
      <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-28 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/cars/mercedes-vito-vip.jpg"
              alt="Mercedes Vito VIP"
              className="h-full w-full object-cover"
            />
            <span className="absolute top-2 start-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-black text-amber-300">
              VIP FLEET
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1 text-center sm:text-start">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">
                <Car size={11} />
                {isAr ? "سيارة خاصة فاخرة" : "Private Luxury Van"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                <UserCheck size={11} />
                {isAr ? "سائق خاص يتحدث العربية" : "Chauffeur Included"}
              </span>
            </div>
            <h4 className="text-[15px] font-black text-[#1A1438]">
              {isAr ? "مرسيدس فيتو VIP مع سائق خاص وخدمة استقبال المطار" : "Mercedes Vito VIP with Private Chauffeur"}
            </h4>
            <p className="text-[12px] leading-relaxed text-slate-600">
              {isAr
                ? "تنقلات يومية خاصة بمرونة كاملة تشمل الوقود، رسوم الطرق، والاستقبال والتوديع في المطار بسيارة مرسيدس فيتو VIP مجهزة بأعلى معايير الراحة."
                : "Full daily private chauffeur touring, including fuel, highway tolls, and airport meet & greet in high-comfort executive Mercedes Vito."}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Flight Offers Section */}
      {flights.length ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[13px] font-black text-[#2E1065] flex items-center gap-1.5">
              <Plane size={15} className="text-[#7C3AED]" />
              <span>{c.cheapestLive}</span>
            </p>
            <span className="text-[11px] font-bold text-slate-400">
              {isAr ? "أفضل خيارات الطيران المباشر" : "Best live flight deals"}
            </span>
          </div>
          <SalesOfferCards layout="slider" cards={flights.slice(0, 16)} />
        </section>
      ) : (
        <p className="rounded-xl bg-[#F4F2FA] px-3 py-2 text-[13px] text-[#4B4568] flex items-center gap-2">
          <Clock size={14} className="text-[#7C3AED]" />
          <span>{c.preparingFlight}</span>
        </p>
      )}

      {/* Hotel Offers Section */}
      {hotels.length ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[13px] font-black text-[#2E1065] flex items-center gap-1.5">
              <Hotel size={15} className="text-[#7C3AED]" />
              <span>{isAr ? "الفنادق الفاخرة المعتمدة" : "Recommended Luxury Hotels"}</span>
            </p>
            <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              {hotels.length} {isAr ? "خيارات فاخرة" : "luxury choices"}
            </span>
          </div>
          <SalesOfferCards layout="slider" cards={hotels.slice(0, 12)} />
        </section>
      ) : null}

      {/* 4. Day-by-Day Editorial Roadmap */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[14px] font-black text-[#1A1438] flex items-center gap-1.5">
            <Compass size={16} className="text-[#7C3AED]" />
            <span>{isAr ? "الجدول اليومي والمزارات" : "Daily Sightseeing Schedule"}</span>
          </p>
          <span className="text-[11px] font-bold text-slate-400">
            {trip.days.length} {c.days}
          </span>
        </div>

        {trip.days.map((day) => (
          <DayRow
            key={day.day}
            day={day}
            daysCount={trip.durationDays}
            dest={dest}
            locale={lang}
            hotels={hotels}
            onOpen={() => {
              setOpenDay(day.day);
              setActiveDay(day.day);
            }}
            onPlace={setDetailStop}
          />
        ))}
      </div>

      {/* 5. Itemized Comprehensive Cost Breakdown */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#3B0764] p-5 text-white shadow-lg border border-violet-500/25">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-violet-300">
              {isAr ? "بيان التكلفة الشامل" : "Cost Breakdown"}
            </p>
            <h4 className="text-[16px] font-black text-white">{c.approxTotal}</h4>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-400/30">
            {isAr ? "سعر نهائي شفاف" : "Transparent Rates"}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-[13px] text-violet-100">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-white/80">{c.cheapestLive}</span>
            <span className="font-bold tabular-nums text-white">
              {cost.flight ? formatClientPrice(cost.flight, cost.currency, lang) : "—"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-white/80">
              {c.hotelStay} {cost.nights ? `(${cost.nights} ${c.nightsStay})` : ""}
            </span>
            <span className="font-bold tabular-nums text-white">
              {cost.hotel ? formatClientPrice(cost.hotel, cost.currency, lang) : "—"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-white/80">
              {c.pickupDropoff} {cost.transferEstimated ? `(${c.estimated})` : ""}
            </span>
            <span className="font-bold tabular-nums text-white">
              {cost.transferRound ? formatClientPrice(cost.transferRound, cost.currency, lang) : "—"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-white/80">
              {c.privateCar} {cost.privateEstimated ? `(${c.estimated})` : ""}
            </span>
            <span className="font-bold tabular-nums text-white">
              {formatClientPrice(cost.privateCar, cost.currency, lang)}
            </span>
          </div>
        </div>

        {cost.totalPrivate > 0 ? (
          <p className="mt-2.5 border-t border-white/10 pt-2 text-[12px] font-bold text-emerald-300">
            {c.totalPrivate}: {formatClientPrice(cost.totalPrivate, cost.currency, lang)}
          </p>
        ) : null}

        <div className="mt-3 border-t border-white/15 pt-2.5 flex items-baseline justify-between">
          <span className="text-[12px] font-bold text-violet-200">
            {isAr ? "الإجمالي التقريبي للباقة" : "Estimated Grand Total"}
          </span>
          <span className="text-2xl font-black tabular-nums text-amber-300">
            {formatClientPrice(cost.total, cost.currency, lang)}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-white/60">{priceEstimateNote(lang)}</p>
      </div>

      {/* 6. Day Detail Modal Popup */}
      {selected ? (
        <div
          className="fixed inset-0 z-[520] flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          onClick={() => setOpenDay(null)}
        >
          <div
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-violet-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-black text-[#7C3AED] uppercase">
                  {dayLabel(selected.day, lang)}
                </span>
                <h4 className="text-[18px] font-black text-[#1A1438] [unicode-bidi:isolate]">
                  {isAr ? selected.titleAr : selected.titleEn}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setOpenDay(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-[14px] leading-relaxed text-[#3F3A58]">
              {selected.notes?.trim() || writeDayNarrative(selected, trip.durationDays, dest, lang)}
            </p>

            <div className="mt-4 space-y-2">
              <span className="text-[12px] font-black text-slate-800">
                {isAr ? "معالم وجولات هذا اليوم:" : "Stops & Highlights:"}
              </span>
              <ul className="space-y-2">
                {selected.stops.map((stop) => (
                  <li key={stop.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setHoveredStopId(stop.id)}
                      onMouseLeave={() => setHoveredStopId(null)}
                      onClick={() => setDetailStop(stop)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-[#F7F5FC] p-2.5 text-start hover:border-[#7C3AED] hover:shadow-md transition"
                    >
                      <span className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-[#EDE9FE]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={stop.image || getSafeAttractionFallback(stop.kind, dest)}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getSafeAttractionFallback(stop.kind, dest);
                          }}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-black text-[#1A1438] [unicode-bidi:isolate]">
                          {placeCaption(stop, lang)}
                        </span>
                        <span className="text-[12px] text-[#7C3AED] font-bold">
                          {isAr ? stop.slotAr : stop.slotEn}
                        </span>
                      </span>
                      <ArrowUpRight size={14} className="text-slate-400 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rotating Hotels for this selected day */}
            {nearbyHotelCards(hotels, selected.stops, 18, selected.day).length ? (
              <div className="mt-5 border-t border-slate-100 pt-3">
                <p className="mb-2 text-[12px] font-black text-[#2E1065] flex items-center gap-1.5">
                  <Hotel size={13} className="text-[#7C3AED]" />
                  <span>{c.nearbyHotels}</span>
                </p>
                <SalesOfferCards
                  layout="slider"
                  cards={nearbyHotelCards(hotels, selected.stops, 18, selected.day).slice(0, 8)}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 7. Community Share Modal */}
      <ShareCommunityModal
        trip={trip}
        cards={offerCards}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}

function DayRow({
  day,
  daysCount,
  dest,
  locale,
  hotels,
  onOpen,
  onPlace,
}: {
  day: PlannerDay;
  daysCount: number;
  dest: string;
  locale: Locale;
  hotels: SalesChatCard[];
  onOpen: () => void;
  onPlace: (stop: PlannerDay["stops"][number]) => void;
}) {
  const isAr = locale === "ar";
  const title = isAr ? day.titleAr : day.titleEn;
  const hotel = hotels[0];
  const hotelLabel = hotel ? (isAr ? hotel.titleAr || hotel.titleEn : hotel.titleEn || hotel.titleAr) : "";
  const short = writeDayShort(day, locale, hotelLabel);
  const detail = day.notes?.trim() || writeDayNarrative(day, daysCount, dest, locale);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3.5 rounded-2xl border border-[#E8E4F4] bg-white p-3.5 text-start transition-all duration-200 hover:border-[#7C3AED] hover:shadow-[0_12px_28px_-16px_rgba(46,16,101,0.35)]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-[14px] font-black text-white shadow-xs">
          {day.day}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="block truncate text-[15px] font-black text-[#1A1438] [unicode-bidi:isolate]">
              {title}
            </span>
            <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-black text-[#7C3AED]">
              {day.stops.length} {isAr ? "معالم" : "stops"}
            </span>
          </div>
          <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-[#5B5674] [unicode-bidi:isolate]">
            {short}
          </span>
          <div className="mt-2.5 flex items-center gap-2 overflow-hidden">
            {day.stops.slice(0, 5).map((s) => (
              <span
                key={s.id}
                className="h-12 w-14 shrink-0 overflow-hidden rounded-xl bg-[#EDE9FE] border border-violet-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image || getSafeAttractionFallback(s.kind, dest)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getSafeAttractionFallback(s.kind, dest);
                  }}
                  className="h-full w-full object-cover"
                />
              </span>
            ))}
          </div>
        </div>
      </button>

      {/* Hover Preview Flyout */}
      <div className="pointer-events-none absolute start-14 top-full z-30 mt-1 hidden w-[min(100%,24rem)] rounded-2xl border border-violet-200 bg-white p-4 text-[13px] leading-relaxed text-[#3F3A58] shadow-2xl group-hover:block animate-in fade-in zoom-in-95 duration-150">
        <p className="line-clamp-3">{detail}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {day.stops.slice(0, 4).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlace(s);
              }}
              className="pointer-events-auto truncate rounded-lg bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-bold text-[#6D28D9] [unicode-bidi:isolate] hover:bg-[#EDE9FE]"
            >
              {placeCaption(s, locale)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
