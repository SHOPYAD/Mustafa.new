"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Compass,
  ArrowUpRight,
  Coins,
  Hotel,
  Star,
  CreditCard,
} from "lucide-react";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import { liveSorted, nearbyHotelCards, programCost } from "@/lib/planner/cost";
import { plannerCopy } from "@/lib/planner/copy";
import { dayLabel, placeCaption, programIntro, tripHeadline, writeDayNarrative } from "@/lib/planner/day-copy";
import { formatClientPrice } from "@/lib/planner/money";
import { downloadProgramPdf, programWhatsAppUrl } from "@/lib/planner/program-export";
import { fetchPublishedPackages } from "@/data/packages-client";
import type { HolidayPackage } from "@/types/package";
import { prefsStyles, styleLabel } from "@/lib/planner/styles";
import { priceEstimateNote } from "@/lib/sales-price-copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import type { PlannerTrip } from "@/types/planner";
import type { SalesChatCard } from "@/types/sales-chat";
import { KindMark } from "./KindMark";
import { usePlanner } from "./PlannerStore";
import { getSafeAttractionFallback } from "@/lib/planner/place-photos";
import ShareCommunityModal from "./ShareCommunityModal";

function WhatsAppMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.2.7.7-3.1-.2-.3A9 9 0 1 1 12 20.5Zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.1-.3c0-.1 0-.3 0-.4s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3s-.8.8-.8 1.9.8 2.2.9 2.3a10 10 0 0 0 3.8 3.4c1.4.6 1.9.6 2.6.5.4-.1 1.6-.6 1.8-1.3s.2-1.2.2-1.3-.2-.2-.5-.3Z" />
    </svg>
  );
}

export default function ChatProgram({ trip, cards }: { trip: PlannerTrip; cards?: SalesChatCard[] }) {
  const { locale } = useLocale();
  const lang = locale as Locale;
  const c = plannerCopy(lang);
  const { setDetailStop } = usePlanner();
  const [busy, setBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [matchingPackages, setMatchingPackages] = useState<HolidayPackage[]>([]);

  useEffect(() => {
    fetchPublishedPackages().then((all) => {
      const d = (trip?.destination || "").trim().toLowerCase();
      if (!d) return;
      const matched = all.filter((p) => {
        const pDest = (p.destination || "").toLowerCase();
        const pTitle = (p.title || "").toLowerCase();
        return pDest.includes(d) || d.includes(pDest) || pTitle.includes(d);
      });
      setMatchingPackages(matched.slice(0, 4));
    });
  }, [trip?.destination]);

  const offerCards = cards?.length ? cards : trip.cards || [];
  const flights = liveSorted(offerCards, "flight");
  const hotels = liveSorted(offerCards, "hotel");
  const transfers = liveSorted(offerCards, "transfer");
  const cars = liveSorted(offerCards, "car");
  const cost = programCost(offerCards, trip.durationDays, trip.currency);
  const dest = trip.destination;
  const title = tripHeadline(trip, lang);
  const cover = trip.days.flatMap((d) => d.stops).find((s) => s.image)?.image || hotels[0]?.image;
  const mix = prefsStyles(trip.prefs);
  const totalLabel = `${c.approxTotal}: ${formatClientPrice(cost.total || cost.flight + cost.hotel, cost.currency, lang)}`;
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

  const totalStops = trip.days.reduce((acc, d) => acc + d.stops.length, 0);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Luxury Editorial Hero Header */}
      <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#4C1D95] text-white shadow-[0_24px_54px_-24px_rgba(46,16,101,0.9)] border border-violet-500/25">
        {cover ? (
          <div className="relative h-56 sm:h-64 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover || getSafeAttractionFallback("default", dest)}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getSafeAttractionFallback("default", dest);
              }}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E0B4B] via-[#2E1065]/70 to-black/30" />
            
            {/* Top Badges */}
            <div className="absolute top-4 start-4 end-4 flex items-center justify-between gap-2">
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
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/20 backdrop-blur-md px-3 py-1 text-[10px] font-black text-emerald-300 border border-emerald-400/30">
                <ShieldCheck size={12} />
                {lang === "ar" ? "برنامج معتمد وحصري" : "Verified VIP Itinerary"}
              </span>
            </div>
          </div>
        ) : null}

        {/* Hero Body */}
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-violet-400/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-200">
              <Sparkles size={11} className="text-amber-400" />
              {lang === "ar" ? "خطة سياحية مخصصة" : "Custom Tailored Itinerary"}
            </span>
            {totalStops > 0 && (
              <span className="text-[11px] font-bold text-violet-200/80">
                · {totalStops} {lang === "ar" ? "محطة ومعلم سياحي" : "stops & landmarks"}
              </span>
            )}
          </div>

          <h2 className="text-[22px] sm:text-[26px] font-black leading-snug tracking-tight text-white [unicode-bidi:isolate]">
            {title}
          </h2>

          {/* Multi-Style Blend Chips */}
          {mix.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[11px] font-black text-violet-300 self-center me-1">
                {lang === "ar" ? "مزيج الأساليب:" : "Style Blend:"}
              </span>
              {mix.map((st) => (
                <span
                  key={st}
                  className="rounded-xl bg-white/15 backdrop-blur-sm px-2.5 py-1 text-[11px] font-black text-white border border-white/10"
                >
                  {styleLabel(st, lang)}
                </span>
              ))}
            </div>
          ) : null}

          <p className="mt-3.5 text-[14px] sm:text-[15px] leading-relaxed text-white/85">
            {programIntro(trip.durationDays, dest, lang)}
          </p>

          {/* Price & Highlight Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/15">
            <div>
              <p className="text-[11px] font-bold text-violet-200/70 uppercase tracking-wider">
                {lang === "ar" ? "السعر الإجمالي التقديري للباقة" : "Estimated Total Package Price"}
              </p>
              <p className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-white">
                {formatClientPrice(cost.total || cost.flight + cost.hotel, cost.currency, lang)}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 text-[13px] font-black text-white shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Coins size={16} className="text-amber-200" />
                <span>{lang === "ar" ? "شارك في مجتمعنا (+250 نقطة)" : "Share in Community (+250 Pts)"}</span>
              </button>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#128C7E] px-4 text-[13px] font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <WhatsAppMark />
                  <span>{c.shareWhatsApp}</span>
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => void download()}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-md px-4 text-[13px] font-black text-white border border-white/20 transition-all hover:bg-white/30 active:scale-95"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>{c.downloadPdf}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Offers Section */}
      {flights.length ? (
        <section className="space-y-2">
          <SalesOfferCards layout="slider" cards={flights.slice(0, 16)} />
        </section>
      ) : (
        <div className="rounded-2xl bg-[#F4F2FA] p-3.5 text-[13px] text-[#4B4568] flex items-center gap-2 border border-violet-100">
          <Clock size={16} className="text-[#7C3AED]" />
          <span>{c.preparingFlight}</span>
        </div>
      )}

      {/* Hotel Offers Section */}
      {hotels.length ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Hotel size={17} className="text-[#7C3AED]" />
              <h3 className="text-[15px] font-black text-[#1A1438]">
                {lang === "ar" ? "الفنادق الفاخرة المعتمدة المقترحة" : "Recommended Luxury Hotels"}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full">
              {hotels.length} {lang === "ar" ? "خيارات فاخرة" : "luxury choices"}
            </span>
          </div>
          <SalesOfferCards layout="slider" cards={hotels.slice(0, 12)} />
        </section>
      ) : null}

      {/* Day by Day Editorial Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-[#7C3AED]" />
            <h3 className="text-[16px] font-black text-[#1A1438]">
              {lang === "ar" ? "تفاصيل الجدول اليومي والمزارات" : "Daily Itinerary & Sightseeing"}
            </h3>
          </div>
          <span className="text-[12px] font-bold text-slate-400">
            {trip.days.length} {c.days}
          </span>
        </div>

        {trip.days.map((day) => {
          const dayTitle = lang === "ar" ? day.titleAr : day.titleEn;
          const nearHotels = nearbyHotelCards(hotels, day.stops, 18, day.day).slice(0, 8);

          return (
            <article
              key={day.day}
              className="overflow-hidden rounded-3xl border border-violet-100/90 bg-white shadow-[0_12px_32px_-20px_rgba(46,16,101,0.12)] transition-all hover:border-violet-300"
            >
              {/* Day Header */}
              <div className="border-b border-violet-50 bg-gradient-to-r from-violet-50/50 via-white to-white px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-[13px] font-black text-white shadow-xs">
                    {day.day}
                  </span>
                  <div>
                    <span className="text-[11px] font-black text-[#7C3AED] uppercase tracking-wider">
                      {dayLabel(day.day, lang)}
                    </span>
                    <h4 className="text-[16px] font-black text-[#1A1438] [unicode-bidi:isolate] leading-snug">
                      {dayTitle}
                    </h4>
                  </div>
                </div>
                <span className="rounded-full bg-violet-100/70 px-2.5 py-0.5 text-[11px] font-black text-[#6D28D9]">
                  {day.stops.length} {lang === "ar" ? "معالم" : "stops"}
                </span>
              </div>

              {/* Day Narrative */}
              <div className="px-5 py-3.5 space-y-3">
                <div className="rounded-2xl border border-violet-100/90 bg-gradient-to-br from-violet-50/40 via-[#FAF9FD] to-white p-4 shadow-xs">
                  <p className="text-[14px] leading-relaxed text-[#2D264D] font-medium [unicode-bidi:isolate]">
                    {day.notes?.trim() || writeDayNarrative(day, trip.durationDays, dest, lang)}
                  </p>

                  {/* Sensory Period Walkthrough */}
                  <div className="mt-3 space-y-2 pt-3 border-t border-violet-100/70">
                    <div className="flex items-start gap-3 rounded-xl bg-white/90 p-3 border border-amber-100/80 shadow-xs">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[15px] border border-amber-200/50">
                        🌅
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[12px] font-black text-amber-800 block">
                          {lang === "ar" ? "الفترة الصباحية" : "Morning"}
                        </span>
                        <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                          {day.stops[0]
                            ? `${placeCaption(day.stops[0], lang)} — انطلاقة منعشة بالسيارة الخاصة واستراحة قهوة.`
                            : "استكشاف صباحي لأولى معالم المدينة."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-white/90 p-3 border border-sky-100/80 shadow-xs">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[15px] border border-sky-200/50">
                        ☀️
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[12px] font-black text-sky-800 block">
                          {lang === "ar" ? "الظهيرة وتجربة الغداء" : "Afternoon & Lunch"}
                        </span>
                        <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                          {day.stops[1]
                            ? `${placeCaption(day.stops[1], lang)} — جولة ثقافية وتناول غداء أصيل في مطعم عريق.`
                            : "جولة ظهيرة مميزة واستراحة غداء تراثية."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl bg-white/90 p-3 border border-purple-100/80 shadow-xs">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[15px] border border-purple-200/50">
                        🌙
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[12px] font-black text-purple-800 block">
                          {lang === "ar" ? "المساء وسهرة العشاء" : "Evening & Dinner"}
                        </span>
                        <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                          {day.stops[2] || day.stops[1]
                            ? `${placeCaption(day.stops[2] || day.stops[1], lang)} — إطلالة الغروب وجولة الأسواق والعشاء.`
                            : "أمسية شاعرية في أرقى الساحات والمقاهي."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day Stops Showcase */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 px-4 pb-4">
                {day.stops.map((stop) => {
                  const name = placeCaption(stop, lang);
                  return (
                    <button
                      key={stop.id}
                      type="button"
                      onClick={() => setDetailStop(stop)}
                      className="group/stop flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-violet-100/80 bg-slate-50/70 text-start transition-all duration-200 hover:border-[#7C3AED] hover:bg-white hover:shadow-md active:scale-98"
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-violet-100/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={stop.image || getSafeAttractionFallback(stop.kind, dest)}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getSafeAttractionFallback(stop.kind, dest);
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/stop:scale-110"
                        />
                        <span className="absolute top-2 start-2 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-black text-white">
                          <KindMark kind={stop.kind} size={10} />
                          <span>{lang === "ar" ? stop.slotAr : stop.slotEn}</span>
                        </span>
                        {stop.rating ? (
                          <span className="absolute top-2 end-2 flex items-center gap-1 rounded-md bg-amber-500/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                            <Star size={10} className="fill-white" />
                            <span>{stop.rating}</span>
                          </span>
                        ) : null}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <span className="line-clamp-2 text-[12px] font-black leading-snug text-[#1A1438] [unicode-bidi:isolate] group-hover/stop:text-[#7C3AED]">
                          {name}
                        </span>
                        <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 group-hover/stop:text-[#7C3AED]">
                          <span>{lang === "ar" ? "عرض التفاصيل" : "Details"}</span>
                          <ArrowUpRight size={10} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Contextual Nearby Hotels slider for this day */}
              {nearHotels.length > 0 && (
                <div className="border-t border-violet-100/80 bg-gradient-to-b from-violet-50/30 to-white px-4 py-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[12px] font-black text-[#2E1065] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>{c.nearbyHotels}</span>
                    </p>
                    <span className="text-[10px] font-bold text-slate-400">
                      {lang === "ar" ? "فنادق قريبة من جولات هذا اليوم" : "Hotels near today's tours"}
                    </span>
                  </div>
                  <SalesOfferCards layout="slider" cards={nearHotels} />
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Global Hotel Recommendations Section (if needed) */}
      {hotels.length > 0 && (
        <section className="space-y-2">
          <SalesOfferCards layout="slider" cards={hotels.slice(0, 16)} />
        </section>
      )}

      {/* Cars & Transfers Section */}
      {cars.length > 0 && (
        <section className="space-y-2">
          <SalesOfferCards layout="slider" cards={cars.slice(0, 6)} />
        </section>
      )}

      {transfers.length > 0 && (
        <section className="space-y-2">
          <SalesOfferCards layout="slider" cards={transfers.slice(0, 4)} />
        </section>
      )}

      {/* Smart Recommendations of Pre-configured Live Packages in this destination */}
      {matchingPackages.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <Sparkles size={16} />
              </span>
              <div>
                <h4 className="text-[15px] font-black text-[#1A1438]">
                  {lang === "ar" ? `باقات معتمدة في ${dest} جاهزة للحجز الفوري` : `Verified Packages in ${dest} Ready to Book`}
                </h4>
                <p className="text-[11px] font-medium text-slate-500">
                  {lang === "ar" ? "برامج سياحية متكاملة مصممة من خبراء لوناليزا بأسعار حصرية شاملة" : "Handcrafted VIP itineraries with confirmed pricing"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchingPackages.map((pkg) => (
              <Link
                key={pkg.id || pkg.slug}
                href={`/package/${pkg.slug || pkg.id}`}
                className="group/pkg flex gap-3 rounded-2xl border border-amber-200/60 bg-white p-3 shadow-xs hover:border-amber-400 hover:shadow-md transition-all"
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      typeof pkg.images?.[0] === "string"
                        ? (pkg.images[0] as string)
                        : (pkg.images?.[0] as { url?: string } | undefined)?.url ||
                          (pkg as unknown as { image?: string }).image ||
                          getSafeAttractionFallback("default", dest)
                    }
                    alt=""
                    className="h-full w-full object-cover group-hover/pkg:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-1 start-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {pkg.durationDays || (pkg as unknown as { days?: number }).days || 5} {lang === "ar" ? "أيام" : "Days"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <h5 className="text-[13px] font-black text-[#1A1438] line-clamp-1 group-hover/pkg:text-amber-600">
                      {pkg.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {pkg.overview || (pkg as unknown as { shortDescription?: string }).shortDescription || pkg.description || ""}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[13px] font-black text-amber-600 font-mono">
                      ${pkg.price || (pkg as unknown as { basePrice?: number }).basePrice || "—"}
                    </span>
                    <span className="text-[11px] font-bold text-[#7C3AED] flex items-center gap-0.5">
                      <span>{lang === "ar" ? "تفاصيل وحجز" : "View"}</span>
                      <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Executive Financial Breakdown Card */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#3B0764] p-5 sm:p-6 text-white shadow-[0_24px_50px_-22px_rgba(46,16,101,0.85)] border border-violet-500/30">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-300">
              {lang === "ar" ? "بيان التكلفة الشامل" : "Comprehensive Cost Summary"}
            </span>
            <h4 className="text-[18px] font-black text-white">{c.approxTotal}</h4>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-black text-emerald-300 border border-emerald-400/30">
            {lang === "ar" ? "سعر حصري معتمد من لوناليزا" : "Exclusive Lonaliza VIP Rate"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
          <div className="rounded-2xl bg-white/5 p-3 border border-white/5 flex justify-between items-center">
            <span className="text-white/80">{c.cheapestLive}</span>
            <span className="font-black tabular-nums text-white text-[15px]">
              {cost.flight ? formatClientPrice(cost.flight, cost.currency, lang) : "—"}
            </span>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 border border-white/5 flex justify-between items-center">
            <span className="text-white/80">
              {c.hotelStay} {cost.nights ? `(${cost.nights} ${c.nightsStay})` : ""}
            </span>
            <span className="font-black tabular-nums text-white text-[15px]">
              {cost.hotel ? formatClientPrice(cost.hotel, cost.currency, lang) : "—"}
            </span>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 border border-white/5 flex justify-between items-center">
            <span className="text-white/80">
              {c.pickupDropoff} {cost.transferEstimated ? `(${c.estimated})` : ""}
            </span>
            <span className="font-black tabular-nums text-white text-[15px]">
              {cost.transferRound ? formatClientPrice(cost.transferRound, cost.currency, lang) : "—"}
            </span>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 border border-white/5 flex justify-between items-center">
            <span className="text-white/80">
              {c.privateCar} {cost.privateEstimated ? `(${c.estimated})` : ""}
            </span>
            <span className="font-black tabular-nums text-white text-[15px]">
              {formatClientPrice(cost.privateCar, cost.currency, lang)}
            </span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-white/15 pt-4">
          <div>
            <p className="text-[11px] font-bold text-violet-300">
              {cost.totalPrivate > 0
                ? `${c.totalPrivate}: ${formatClientPrice(cost.totalPrivate, cost.currency, lang)}`
                : c.approxTotal}
            </p>
            <p className="text-3xl font-black tabular-nums text-amber-300 tracking-tight">
              {formatClientPrice(cost.total, cost.currency, lang)}
            </p>
          </div>
          <p className="max-w-xs text-[11px] leading-5 text-white/70">{priceEstimateNote(lang)}</p>
        </div>
      </section>

      {/* Primary Booking CTA & Compact Actions Bar */}
      <div className="space-y-3 pt-2">
        <Link
          href={`/package/book?customTrip=1&tripId=${trip.id}&dest=${encodeURIComponent(dest)}&title=${encodeURIComponent(title)}&days=${trip.durationDays}&total=${cost.total || cost.flight + cost.hotel}&date=${trip.arrivalDate || ""}&people=${trip.prefs?.travelers || 2}`}
          onClick={() => {
            try {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("lonaliza_active_booking_trip", JSON.stringify({ trip, offerCards, cost }));
              }
            } catch {}
          }}
          className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white shadow-[0_16px_36px_-12px_rgba(245,158,11,0.85)] transition-all duration-300 hover:brightness-105 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
              <CreditCard size={22} className="text-white" />
            </div>
            <div className="text-start">
              <span className="block text-[15px] font-black tracking-tight leading-tight">
                {lang === "ar" ? "احجز هذا البرنامج الآن مباشرة" : "Book This Custom Itinerary Now"}
              </span>
              <span className="block text-[11px] font-medium text-amber-100/90 mt-0.5">
                {lang === "ar" ? "تأكيد فوري • سيارة خاصة VIP • دفع آمن" : "Instant Confirmation • VIP Chauffeur • Secure Pay"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-black/20 px-3 py-1.5 text-[14px] font-black text-amber-200 tabular-nums">
              {formatClientPrice(cost.total || cost.flight + cost.hotel, cost.currency, lang)}
            </span>
          </div>
        </Link>

        {/* Secondary Compact Action Row */}
        <div className="grid grid-cols-3 gap-2">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#128C7E] px-2 text-[12px] font-bold text-white shadow-xs transition-all hover:bg-[#0E7064] active:scale-98"
            >
              <WhatsAppMark />
              <span className="truncate">{c.shareWhatsApp}</span>
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => void download()}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] px-2 text-[12px] font-bold text-white shadow-xs transition-all hover:opacity-95 active:scale-98 cursor-pointer"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span className="truncate">{c.downloadPdf}</span>
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/90 px-2 text-[12px] font-black text-amber-800 shadow-xs transition-all hover:bg-amber-100 active:scale-98 cursor-pointer"
          >
            <Coins size={15} className="text-amber-600" />
            <span className="truncate">{lang === "ar" ? "مشاركة (+250)" : "Share (+250)"}</span>
          </button>
        </div>
      </div>

      {pdfError ? <p className="text-center text-[12px] font-bold text-[#B91C1C]">{pdfError}</p> : null}

      <ShareCommunityModal
        trip={trip}
        cards={offerCards}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
