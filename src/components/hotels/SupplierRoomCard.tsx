"use client";

/* eslint-disable @next/next/no-img-element */
/**
 * Luxury room + rate comparison. Every chip is a real supplier fact (board, cancel, payment,
 * comments, occupancy). Differences between rates on the same room are spelled out so a guest
 * can see why one price is higher than another.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BedDouble,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import HotelFeatureIcon from "@/components/hotels/HotelFeatureIcon";
import PromoPriceBlock from "@/components/loyalty/PromoPriceBlock";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { localizeHotelLabel } from "@/lib/hotel-i18n";
import { boardIncludesMeals, boardLabel, fmtDeadline, meaningfulPromotions, offerCopy, paymentLabel } from "@/lib/hotel-offer-copy";
import type { Locale } from "@/lib/i18n/types";
import type { TravelAdvisorRoom, TravelAdvisorRoomRate } from "@/types/travel-advisor";

type Props = {
  room: TravelAdvisorRoom;
  nights: number;
  locale: Locale;
  bookHref: (room: TravelAdvisorRoom, rate: TravelAdvisorRoomRate) => string;
  onOpenImage?: (url: string) => void;
  initialRates?: number;
};

const COPY = {
  ar: {
    photos: (n: number) => (n === 1 ? "صورة" : n === 2 ? "صورتان" : `${n} صور`),
    noPhotos: "لا توجد صور لهذه الغرفة",
    upTo: (n: number) => (n === 1 ? "لشخص واحد" : n === 2 ? "حتى شخصين" : `حتى ${n} أشخاص`),
    sqm: "م²",
    showAllAmenities: (n: number) => `عرض كل المرافق (${n})`,
    hideAmenities: "إخفاء المرافق",
    moreRates: (n: number) => (n === 1 ? "عرض سعر آخر" : n === 2 ? "عرض سعرين آخرين" : `عرض ${n} أسعار أخرى`),
    lessRates: "عرض أقل",
    cancelDetails: "تفاصيل الإلغاء",
    hideDetails: "إخفاء التفاصيل",
    penaltyFrom: (d: string, amount: string) => `من ${d}: غرامة ${amount}`,
    penaltyFreeUntil: (d: string, amount: string) => `إلغاء مجاني حتى ${d} — بعد ذلك تطبق غرامة ${amount}`,
    penaltyActive: (amount: string) => `تطبق غرامة إلغاء حالية بقيمة ${amount}`,
    roomDescription: "وصف الغرفة",
    bestValue: "أفضل قيمة",
    cheapest: "الأقل سعراً",
    whyMore: "ما الذي يميز هذا السعر",
    vsCheapest: "مقارنة بالأقل سعراً",
    guests: (a: number, ch: number) => (ch > 0 ? `${a} بالغ · ${ch} طفل` : `${a} بالغ`),
    nightly: "لليلة",
    stayTotal: (n: number) => (n === 1 ? "إجمالي الليلة" : n === 2 ? "إجمالي الليلتين" : `إجمالي ${n} ليالٍ`),
    rateOptions: (n: number) => (n === 1 ? "خيار سعر واحد" : n === 2 ? "خيارا سعر" : `${n} خيارات سعر`),
    includes: "يشمل",
    noMeals: "بدون وجبات",
  },
  en: {
    photos: (n: number) => `${n} photo${n === 1 ? "" : "s"}`,
    noPhotos: "No photos for this room",
    upTo: (n: number) => `Up to ${n} guest${n === 1 ? "" : "s"}`,
    sqm: "m²",
    showAllAmenities: (n: number) => `Show all amenities (${n})`,
    hideAmenities: "Hide amenities",
    moreRates: (n: number) => `Show ${n} more rate${n === 1 ? "" : "s"}`,
    lessRates: "Show less",
    cancelDetails: "Cancellation details",
    hideDetails: "Hide details",
    penaltyFrom: (d: string, amount: string) => `From ${d}: penalty ${amount}`,
    penaltyFreeUntil: (d: string, amount: string) => `Free cancellation until ${d} — then penalty ${amount}`,
    penaltyActive: (amount: string) => `Cancellation penalty of ${amount} applies`,
    roomDescription: "Room description",
    bestValue: "Best value",
    cheapest: "Lowest price",
    whyMore: "What this rate includes",
    vsCheapest: "Compared with the lowest price",
    guests: (a: number, ch: number) => (ch > 0 ? `${a} adults · ${ch} children` : `${a} adults`),
    nightly: "per night",
    stayTotal: (n: number) => `Total for ${n} night${n === 1 ? "" : "s"}`,
    rateOptions: (n: number) => `${n} rate option${n === 1 ? "" : "s"}`,
    includes: "Includes",
    noMeals: "No meals",
  },
  tr: {
    photos: (n: number) => `${n} fotoğraf`,
    noPhotos: "Bu oda için fotoğraf yok",
    upTo: (n: number) => `En fazla ${n} misafir`,
    sqm: "m²",
    showAllAmenities: (n: number) => `Tüm olanakları göster (${n})`,
    hideAmenities: "Olanakları gizle",
    moreRates: (n: number) => `${n} fiyat daha göster`,
    lessRates: "Daha az göster",
    cancelDetails: "İptal ayrıntıları",
    hideDetails: "Ayrıntıları gizle",
    penaltyFrom: (d: string, amount: string) => `${d} itibarıyla: ceza ${amount}`,
    penaltyFreeUntil: (d: string, amount: string) => `${d} tarihine kadar ücretsiz — sonrasında ceza ${amount}`,
    penaltyActive: (amount: string) => `${amount} tutarında iptal cezası geçerlidir`,
    roomDescription: "Oda açıklaması",
    bestValue: "En iyi değer",
    cheapest: "En düşük fiyat",
    whyMore: "Bu fiyatın farkı",
    vsCheapest: "En düşük fiyatla karşılaştırma",
    guests: (a: number, ch: number) => (ch > 0 ? `${a} yetişkin · ${ch} çocuk` : `${a} yetişkin`),
    nightly: "gecelik",
    stayTotal: (n: number) => `${n} gece toplam`,
    rateOptions: (n: number) => `${n} fiyat seçeneği`,
    includes: "Dahil",
    noMeals: "Yemek yok",
  },
};

function copyFor(locale: Locale) {
  return locale === "ar" || locale === "tr" ? COPY[locale] : COPY.en;
}

function dedupeRates(rates: TravelAdvisorRoomRate[]): TravelAdvisorRoomRate[] {
  const seen = new Set<string>();
  const out: TravelAdvisorRoomRate[] = [];
  for (const r of rates) {
    const key = [r.supplier || "", r.boardCode || r.board, r.freeCancellation ? "R" : "N", r.freeCancellationUntil || "", r.paymentType || "", r.totalStay ?? r.price ?? "", r.rateType || "", r.rateComments || ""].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out.sort((a, b) => (a.totalStay ?? a.price ?? 0) - (b.totalStay ?? b.price ?? 0));
}

export function isRateFreeCancelActive(rate: TravelAdvisorRoomRate): boolean {
  if (rate.cancellationType === "free") return true;
  if (rate.cancellationType === "non_refundable" || rate.cancellationType === "fee_applies") return false;
  if (!rate.freeCancellation) return false;
  if (rate.freeCancellationUntil && Date.parse(rate.freeCancellationUntil) <= Date.now()) {
    return false;
  }
  const policies = (rate.cancellationPolicies || []).filter((p) => p.from && Number.isFinite(Date.parse(p.from)));
  if (policies.some((p) => Date.parse(p.from) <= Date.now() && p.amount > 0)) {
    return false;
  }
  return true;
}

function inclusionScore(rate: TravelAdvisorRoomRate): number {
  let s = 0;
  if (boardIncludesMeals(rate.boardCode) || rate.breakfastIncluded) s += 3;
  if (rate.boardCode === "HB" || rate.boardCode === "FB") s += 2;
  if (rate.boardCode === "AI" || rate.boardCode === "UAI") s += 3;
  if (isRateFreeCancelActive(rate)) s += 3;
  if (rate.paymentType === "pay_at_hotel") s += 1;
  if (rate.promotions?.length) s += 1;
  return s;
}

function extrasVs(base: TravelAdvisorRoomRate, rate: TravelAdvisorRoomRate, locale: Locale, c: ReturnType<typeof offerCopy>): string[] {
  const extras: string[] = [];
  const baseMeals = boardIncludesMeals(base.boardCode) || base.breakfastIncluded;
  const rateMeals = boardIncludesMeals(rate.boardCode) || rate.breakfastIncluded;
  if (rateMeals && !baseMeals) extras.push(boardLabel(rate.boardCode, locale, rate.boardName));
  if (rate.boardCode && base.boardCode && rate.boardCode !== base.boardCode && rateMeals && baseMeals) {
    extras.push(boardLabel(rate.boardCode, locale, rate.boardName));
  }
  if (isRateFreeCancelActive(rate) && !isRateFreeCancelActive(base)) extras.push(c.freeCancel);
  if (rate.paymentType === "pay_at_hotel" && base.paymentType !== "pay_at_hotel") extras.push(c.payAtHotel);
  if (rate.paymentType === "prepay" && base.paymentType === "pay_at_hotel") extras.push(c.prepay);
  return extras.filter(Boolean);
}

export default function SupplierRoomCard({ room, nights, locale, bookHref, onOpenImage, initialRates = 4 }: Props) {
  const { formatPrice } = useCurrency();
  const c = offerCopy(locale);
  const k = copyFor(locale);
  const ar = locale === "ar";
  const photos = useMemo(() => room.images.filter(Boolean), [room.images]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [allAmenities, setAllAmenities] = useState(false);
  const [allRates, setAllRates] = useState(false);
  const [policyOpen, setPolicyOpen] = useState<string | null>(null);

  const rates = useMemo(() => dedupeRates(room.rates || []), [room.rates]);
  const cheapest = rates[0];
  const bestValueId = useMemo(() => {
    if (rates.length < 2) return "";
    let best = rates[0];
    let bestScore = inclusionScore(best) / Math.max(1, best.totalStay ?? best.price ?? 1);
    for (const r of rates) {
      const score = inclusionScore(r) / Math.max(1, r.totalStay ?? r.price ?? 1);
      if (score > bestScore + 1e-9) {
        best = r;
        bestScore = score;
      }
    }
    return inclusionScore(best) > inclusionScore(cheapest) ? best.id : "";
  }, [rates, cheapest]);

  const visibleRates = allRates ? rates : rates.slice(0, initialRates);
  const hiddenRates = rates.length - visibleRates.length;
  const amenities = room.amenities || [];
  const shownAmenities = allAmenities ? amenities : amenities.slice(0, 10);
  const current = photos[Math.min(photoIdx, Math.max(0, photos.length - 1))];

  const go = (dir: number) => {
    if (photos.length < 2) return;
    setPhotoIdx((i) => (i + dir + photos.length) % photos.length);
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-[#2e1065]/10 bg-white shadow-[0_12px_40px_-24px_rgba(46,16,101,0.45)]">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
        <div className="border-b border-slate-100 bg-gradient-to-b from-[#2e1065]/[0.04] to-white p-4 lg:border-b-0 lg:border-e">
          <div className="relative h-52 overflow-hidden rounded-2xl bg-slate-100">
            {current ? (
              <button type="button" data-keep-color="true" onClick={() => onOpenImage?.(current)} className="block h-full w-full bg-transparent">
                <img src={current} alt={room.name} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400">
                <BedDouble size={28} />
                <span className="text-[11px]">{k.noPhotos}</span>
              </div>
            )}
            {photos.length > 1 ? (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="prev" className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow hover:bg-white">
                  {ar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                <button type="button" onClick={() => go(1)} aria-label="next" className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow hover:bg-white">
                  {ar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
                <span className="absolute bottom-2 end-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10.5px] font-semibold text-white">
                  <Camera size={11} /> {photoIdx + 1}/{photos.length}
                </span>
              </>
            ) : null}
          </div>

          <h3 className="mt-3 text-[17px] font-black leading-snug text-[#1e1b4b]">{room.name}</h3>
          {rates.length > 1 ? <p className="mt-1 text-[11px] font-semibold text-[#2e1065]/70">{k.rateOptions(rates.length)}</p> : null}

          {room.sizeSqm > 0 || room.beds || room.capacity > 0 || room.view ? (
            <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[12.5px] text-slate-700">
              {room.sizeSqm > 0 ? (
                <li className="inline-flex items-center gap-1 font-semibold">
                  <Maximize2 size={13} className="text-[#2e1065]" /> {room.sizeSqm} {k.sqm}
                </li>
              ) : null}
              {room.beds ? (
                <li className="inline-flex items-center gap-1 font-semibold">
                  <BedDouble size={13} className="text-[#2e1065]" /> {localizeHotelLabel(room.beds, locale)}
                </li>
              ) : null}
              {room.capacity > 0 ? (
                <li className="inline-flex items-center gap-1 font-semibold">
                  <Users size={13} className="text-[#2e1065]" /> {k.upTo(room.capacity)}
                </li>
              ) : null}
              {room.view ? <li className="font-semibold text-slate-600">{localizeHotelLabel(room.view, locale)}</li> : null}
            </ul>
          ) : null}

          {room.description ? (
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-slate-600">
              <span className="font-bold text-slate-800">{k.roomDescription}: </span>
              {room.description}
            </p>
          ) : null}

          {amenities.length ? (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {shownAmenities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 rounded-lg border border-[#2e1065]/10 bg-white px-2 py-1 text-[11px] text-slate-700">
                    <HotelFeatureIcon label={a} size={12} className="text-[#2e1065]" />
                    {localizeHotelLabel(a, locale)}
                  </span>
                ))}
              </div>
              {amenities.length > 10 ? (
                <button type="button" data-keep-color="true" onClick={() => setAllAmenities((v) => !v)} className="mt-2 inline-flex items-center gap-1 bg-transparent text-[11.5px] font-bold text-[#2e1065] hover:underline">
                  {allAmenities ? k.hideAmenities : k.showAllAmenities(amenities.length)}
                  {allAmenities ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="divide-y divide-[#2e1065]/8">
          {visibleRates.map((rate) => {
            const board = boardLabel(rate.boardCode, locale, rate.boardName) || (rate.breakfastIncluded ? boardLabel("BB", locale) : k.noMeals);
            const meals = boardIncludesMeals(rate.boardCode) || rate.breakfastIncluded;
            const payment = paymentLabel(rate.paymentType, locale);
            const promos = meaningfulPromotions(rate.promotions);
            const isFreeCancel = isRateFreeCancelActive(rate);
            const deadline = isFreeCancel ? fmtDeadline(rate.freeCancellationUntil, locale, true) : "";
            const policies = (rate.cancellationPolicies || []).filter((p) => p.from && Number.isFinite(Date.parse(p.from)));
            const activePenalty = rate.currentPenalty || policies.find((p) => Date.parse(p.from) <= Date.now() && p.amount > 0);
            const isCancellableWithFee = !isFreeCancel && (
              rate.cancellationType === "fee_applies" ||
              Boolean(activePenalty && activePenalty.amount > 0 && (rate.totalStay == null || activePenalty.amount < rate.totalStay)) ||
              policies.some((p) => p.amount > 0 && (rate.totalStay == null || p.amount < rate.totalStay))
            );
            const penaltyFeeStr = activePenalty ? formatPrice(activePenalty.amount, activePenalty.currency) : "";
            const total = rate.totalStay ?? rate.price;
            const nightly = rate.nightly;
            const isPolicyOpen = policyOpen === rate.id;
            const isBest = rate.id === bestValueId;
            const isCheapest = cheapest && rate.id === cheapest.id;
            const extras = cheapest && !isCheapest ? extrasVs(cheapest, rate, locale, c) : [];
            const occ = rate.occupancy;
            return (
              <div key={rate.id} className={`grid grid-cols-1 gap-4 p-4 sm:grid-cols-[1fr_220px] sm:items-stretch ${isBest ? "bg-gradient-to-l from-amber-50/80 via-white to-white" : ""}`}>
                <div className="min-w-0 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isBest ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#2e1065] to-[#6d28d9] px-2.5 py-0.5 text-[10.5px] font-black text-amber-200">
                        <Sparkles size={11} /> {k.bestValue}
                      </span>
                    ) : null}
                    {isCheapest && rates.length > 1 ? (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-bold text-slate-600">{k.cheapest}</span>
                    ) : null}
                    {rate.rateType === "RECHECK" ? <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{c.recheck}</span> : null}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[12px] font-extrabold ${meals ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                      <Utensils size={13} /> {board}
                    </span>
                    {isFreeCancel ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-[12px] font-extrabold text-emerald-800 border border-emerald-200/60 shadow-2xs">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        {deadline ? c.freeCancelUntil(deadline) : c.freeCancel}
                      </span>
                    ) : isCancellableWithFee ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1 text-[12px] font-extrabold text-amber-900 border border-amber-200/60 shadow-2xs">
                        <AlertCircle size={13} className="text-amber-600" />
                        {locale === "ar"
                          ? (penaltyFeeStr ? `إلغاء متاح (رسوم الإلغاء: ${penaltyFeeStr})` : "إلغاء متاح برسوم محددة")
                          : locale === "tr"
                          ? (penaltyFeeStr ? `İptal Edilebilir (${penaltyFeeStr} kesinti)` : "Ücretli İptal Edilebilir")
                          : (penaltyFeeStr ? `Cancellable (fee: ${penaltyFeeStr})` : "Cancellable with fee")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-2.5 py-1 text-[12px] font-extrabold text-rose-800 border border-rose-200/60 shadow-2xs">
                        <X size={13} className="text-rose-600" />
                        {c.nonRefundable}
                      </span>
                    )}
                    {payment ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-2.5 py-1 text-[12px] font-extrabold text-sky-800">
                        {rate.paymentType === "prepay" ? <CreditCard size={13} /> : <Wallet size={13} />} {payment}
                      </span>
                    ) : null}
                    {occ && occ.adults > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-1 text-[12px] font-bold text-slate-600">
                        <Users size={13} /> {k.guests(occ.adults, occ.children || 0)}
                      </span>
                    ) : null}
                  </div>

                  {policies.length ? (
                    <button type="button" data-keep-color="true" onClick={() => setPolicyOpen(isPolicyOpen ? null : rate.id)} className="inline-flex items-center gap-0.5 bg-transparent text-[11.5px] font-bold text-[#2e1065] hover:underline">
                      {isPolicyOpen ? k.hideDetails : k.cancelDetails}
                      {isPolicyOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  ) : null}
                  {isPolicyOpen && policies.length ? (
                    <ul className="space-y-1.5 text-[11.5px] text-slate-700 bg-purple-50/40 p-3 rounded-xl border border-purple-100/80">
                      {policies.slice(0, 6).map((p, i) => {
                        const isPast = Date.parse(p.from) <= Date.now();
                        const d = fmtDeadline(p.from, locale, true);
                        const amt = formatPrice(p.amount, p.currency);
                        return (
                          <li key={i} className="flex items-start gap-2">
                            <span className="shrink-0 text-purple-700 font-bold mt-0.5">•</span>
                            <span className="leading-snug">
                              {isPast
                                ? (locale === "ar" ? `تطبق حالياً غرامة إلغاء بقيمة ${amt}` : locale === "tr" ? `Şu anda ${amt} iptal cezası geçerlidir` : `Current cancellation penalty: ${amt}`)
                                : (locale === "ar" ? `إلغاء مجاني كامل حتى ${d} — بعد ذلك تطبق غرامة ${amt}` : locale === "tr" ? `${d} tarihine kadar ücretsiz — sonrasında ceza ${amt}` : `Free cancellation until ${d} — penalty ${amt} thereafter`)}
                              {p.description ? ` (${p.description})` : ""}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  {extras.length ? (
                    <p className="text-[12px] font-semibold text-[#2e1065]">
                      <span className="text-slate-500">{k.whyMore}: </span>
                      {extras.join(" · ")}
                    </p>
                  ) : null}

                  {promos.length ? (
                    <div className="flex flex-wrap gap-1">
                      {promos.map((p) => (
                        <span key={p} className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          <Tag size={11} /> {p}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {rate.remainingRooms != null && rate.remainingRooms > 0 && rate.remainingRooms <= 5 ? (
                    <p className="text-[12px] font-bold text-rose-600">{c.remaining(rate.remainingRooms)}</p>
                  ) : null}
                  {rate.rateComments ? <p className="whitespace-pre-line text-[12px] leading-relaxed text-slate-600">{rate.rateComments}</p> : null}
                  {rate.label && !rate.rateComments ? <p className="text-[11.5px] text-slate-500">{rate.label}</p> : null}
                </div>

                <div className="flex flex-col justify-center rounded-2xl border border-[#2e1065]/10 bg-gradient-to-b from-[#2e1065]/[0.06] via-amber-50/50 to-white px-3.5 py-3 text-start sm:text-end">
                  {total != null ? (
                    <>
                      {nightly != null && nights > 1 ? (
                        <p className="text-[11px] font-semibold text-slate-500">
                          {formatPrice(nightly, rate.currency || room.currency || "USD")} / {k.nightly}
                        </p>
                      ) : null}
                      <PromoPriceBlock
                        amount={total}
                        currency={rate.currency || room.currency || "USD"}
                        service="hotels"
                        formatPrice={formatPrice}
                        size="lg"
                        subLabel={k.stayTotal(nights)}
                        note={rate.taxesIncluded === false ? c.taxesExcluded : c.taxesIncluded}
                      />
                      <div className="mt-1 sm:flex sm:justify-end">
                        <LoyaltyPointsRow amount={total} currency={rate.currency || room.currency || "USD"} service="hotels" className="font-bold text-[#2e1065]" />
                      </div>
                      <Link
                        href={bookHref(room, rate)}
                        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl px-5 py-3 text-[14px] font-black text-white shadow-[0_10px_24px_-10px_rgba(46,16,101,0.8)] transition-all hover:brightness-110 active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg, #2e1065 0%, #6d28d9 55%, #b45309 160%)" }}
                      >
                        <CreditCard size={16} /> {c.book}
                      </Link>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Check size={12} /> {c.cheapestRoom}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {hiddenRates > 0 || allRates ? (
            <button type="button" data-keep-color="true" onClick={() => setAllRates((v) => !v)} className="inline-flex w-full items-center justify-center gap-1 bg-transparent py-3 text-sm font-bold text-[#2e1065] hover:bg-[#2e1065]/[0.04]">
              {allRates ? k.lessRates : k.moreRates(hiddenRates)}
              {allRates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
