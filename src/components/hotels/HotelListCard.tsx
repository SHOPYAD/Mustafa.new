"use client";

/**
 * Hotel search result card (Trip.com-style).
 *
 * Every line is backed by supplier data on the card payload; anything the supplier did not deliver
 * (rating, distance, room name, bed type, deadline…) is simply not rendered. No stock photos, no
 * invented counts, no marketing ribbons.
 */

import Link from "next/link";
import { BedDouble, Building2, Check, CreditCard, MapPin, Maximize2, Tag, Users, Utensils, Wallet, X } from "lucide-react";
import HotelPhotoSlider from "@/components/hotels/HotelPhotoSlider";
import HotelStars from "@/components/hotels/HotelStars";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import PromoPriceBlock from "@/components/loyalty/PromoPriceBlock";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { stayFromNightly } from "@/lib/hotel-display";
import { localizeHotelLabel, localizeRoomType } from "@/lib/hotel-i18n";
import {
  boardIncludesMeals,
  boardLabel,
  cancellationLabel,
  distanceLabel,
  meaningfulPromotions,
  offerCopy,
  paymentLabel,
  ratingWord,
  reviewSourceLabel,
  scoreOutOf10,
} from "@/lib/hotel-offer-copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";

type Props = {
  hotel: TravelAdvisorHotelCard;
  href: string;
};

function cardPhotos(hotel: TravelAdvisorHotelCard): string[] {
  const list = Array.isArray(hotel.images) ? hotel.images.filter(Boolean) : [];
  if (hotel.image && !list.includes(hotel.image)) list.unshift(hotel.image);
  return list;
}

const BRAND = "var(--brand-primary)";

export default function HotelListCard({ hotel, href }: Props) {
  const { locale } = useLocale();
  const { formatPrice } = useCurrency();
  const c = offerCopy(locale);
  const priceCurrency = hotel.currency || "USD";
  const photos = cardPhotos(hotel);
  const nights = Math.max(1, hotel.nights || 1);
  const money = stayFromNightly(hotel.nightly ?? hotel.priceFrom, nights);
  const nightly = money.nightly || null;
  const stayTotal = money.total || null;

  // Rating: only when a supplier delivered one. Supplier cards are normalised to /10 server-side;
  // legacy TravelAdvisor feeds report a /5 bubble score.
  const rating = hotel.reviewScore
    ? scoreOutOf10(hotel.reviewScore.score, hotel.reviewScore.scale)
    : hotel.rating > 0
      ? hotel.source === "travel_advisor" && hotel.rating <= 5
        ? Math.round(hotel.rating * 20) / 10
        : hotel.rating
      : 0;
  const reviewCount = hotel.reviewCount > 0 ? hotel.reviewCount : 0;
  const reviewSource = reviewSourceLabel(hotel.reviewScore?.source);

  // Location line: city (+ district/address when different) + distance to centre when known.
  const city = (hotel.city || "").trim();
  const place = [hotel.neighborhood, hotel.address].map((s) => (s || "").trim()).filter((s) => s && s.toLowerCase() !== city.toLowerCase())[0] || "";
  const distance = hotel.distanceFromCenterM != null ? distanceLabel(hotel.distanceFromCenterM, locale) : "";

  // Cheapest rate plan facts (verbatim from supplier), with legacy fallbacks.
  const offer = hotel.cheapestOffer;
  const roomName = localizeRoomType(offer?.roomName || hotel.roomType || "", locale);
  const beds = offer?.beds || (hotel.bedType && hotel.bedType !== hotel.roomType ? hotel.bedType : "");
  const board = offer?.board ? boardLabel(offer.board, locale, offer.boardName) : hotel.breakfastIncluded ? boardLabel("BB", locale) : "";
  const boardHasMeals = offer?.board ? boardIncludesMeals(offer.board) : Boolean(hotel.breakfastIncluded);
  const cancel = offer
    ? cancellationLabel(offer.refundable, offer.freeCancellationUntil, locale)
    : hotel.nonRefundable != null
      ? cancellationLabel(!hotel.nonRefundable, undefined, locale)
      : null;
  const payment = paymentLabel(offer?.paymentType, locale);
  const remaining = offer?.remainingRooms ?? (hotel.hurryLeft > 0 ? hotel.hurryLeft : 0);
  const promotions = meaningfulPromotions(offer?.promotions).slice(0, 1);
  const taxesNote = offer?.taxesIncluded === false ? c.taxesExcluded : c.taxesIncluded;
  const offerCount = hotel.offerCount && hotel.offerCount > 1 ? hotel.offerCount : 0;

  return (
    <article className="group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200">
      {/* Photo */}
      <Link href={href} className="relative block w-full aspect-[16/10] sm:aspect-auto sm:w-[264px] sm:min-h-[212px] shrink-0 bg-slate-100">
        <HotelPhotoSlider
          images={photos}
          name={hotel.name}
          hotelId={/^\d+$/.test(hotel.bookingHotelId || "") ? hotel.bookingHotelId : undefined}
          className="!min-h-0 h-full w-full"
        />
        {offerCount ? (
          <span className="absolute top-2.5 start-2.5 inline-flex items-center gap-1 rounded-md bg-white/95 backdrop-blur px-2 py-1 text-[11px] font-bold text-slate-800 shadow-sm">
            <Building2 size={12} className="text-[var(--brand-primary)]" /> {c.offers(offerCount)}
          </span>
        ) : null}
      </Link>

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row">
        <div className="flex-1 min-w-0 px-4 pt-3.5 pb-3 flex flex-col gap-2">
          {/* Name + stars */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="font-extrabold text-slate-900 text-[16px] leading-snug">
                <Link href={href} className="hover:text-[var(--brand-primary)] transition-colors">
                  {hotel.name}
                </Link>
              </h3>
              <HotelStars stars={hotel.stars} size={13} />
            </div>

            {/* Rating (real only) */}
            {rating > 0 ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-white font-extrabold tabular-nums shadow-xs" style={{ background: BRAND }}>
                  {rating.toFixed(1)}
                  <span className="text-[10px] font-semibold opacity-80">/10</span>
                </span>
                <span className="font-bold text-slate-800">{ratingWord(rating, locale)}</span>
                {reviewCount ? <span className="text-slate-500">· {c.reviews(reviewCount)}</span> : null}
                {reviewSource ? <span className="text-slate-400">· {reviewSource}</span> : null}
              </div>
            ) : null}

            {/* Location */}
            {city || place || distance ? (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-600">
                <MapPin size={14} className="mt-px shrink-0 text-[var(--brand-primary)]" />
                <span className="leading-snug line-clamp-1">
                  {[place, city].filter(Boolean).join(" · ")}
                  {distance ? <span className="text-slate-400"> · {distance} {c.fromCentre}</span> : null}
                </span>
              </p>
            ) : null}
          </div>

          {/* Cheapest offer block */}
          {roomName || board || cancel || beds ? (
            <div className="mt-auto rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
              {roomName ? (
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900 leading-snug">
                  <BedDouble size={15} className="shrink-0 text-slate-500" />
                  <span className="line-clamp-1">{roomName}</span>
                </p>
              ) : null}
              {beds || offer?.sizeSqm || offer?.maxOccupancy ? (
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-slate-600">
                  {beds ? <span>{localizeHotelLabel(beds, locale)}</span> : null}
                  {offer?.sizeSqm ? (
                    <span className="inline-flex items-center gap-1">
                      <Maximize2 size={11} /> {offer.sizeSqm} {locale === "ar" ? "م²" : "m²"}
                    </span>
                  ) : null}
                  {offer?.maxOccupancy ? (
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} /> {offer.maxOccupancy}
                    </span>
                  ) : null}
                </p>
              ) : null}
              <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
                {board ? (
                  <li className={`inline-flex items-center gap-1 font-semibold ${boardHasMeals ? "text-emerald-700" : "text-slate-600"}`}>
                    <Utensils size={12} /> {board}
                  </li>
                ) : null}
                {cancel ? (
                  <li className={`inline-flex items-center gap-1 font-semibold ${cancel.tone === "good" ? "text-emerald-700" : "text-slate-500"}`}>
                    {cancel.tone === "good" ? <Check size={12} /> : <X size={12} />} {cancel.text}
                  </li>
                ) : null}
                {payment ? (
                  <li className="inline-flex items-center gap-1 font-semibold text-sky-700">
                    {offer?.paymentType === "prepay" ? <CreditCard size={12} /> : <Wallet size={12} />} {payment}
                  </li>
                ) : null}
              </ul>
              {promotions.length ? (
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-bold text-rose-700">
                  <Tag size={11} /> {promotions[0]}
                </p>
              ) : null}
            </div>
          ) : null}

        </div>

        {/* Price column */}
        <div className="sm:w-[232px] shrink-0 flex sm:flex-col items-stretch justify-between sm:justify-end gap-3 px-4 py-4 sm:ps-4 border-t sm:border-t-0 sm:border-s border-[#2e1065]/10 bg-gradient-to-b from-[#2e1065]/[0.08] via-amber-50/70 to-white">
          {nightly != null ? (
            <div className="w-full text-start sm:text-end">
              {remaining > 0 && remaining <= 5 ? <p className="mb-1.5 text-[11px] font-black text-rose-600">{c.remaining(remaining)}</p> : null}
              <PromoPriceBlock
                amount={nightly}
                currency={priceCurrency}
                service="hotels"
                formatPrice={formatPrice}
                size="lg"
                perLabel={c.perNight}
                subLabel={stayTotal != null ? `${c.totalFor(nights)}: ${formatPrice(stayTotal, priceCurrency)}` : undefined}
                note={taxesNote}
              />
              {stayTotal != null ? (
                <div className="mt-2 sm:flex sm:justify-end">
                  <LoyaltyPointsRow amount={stayTotal} currency={priceCurrency} service="hotels" className="font-bold text-[#2e1065]" />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-500 text-start sm:text-end">{locale === "ar" ? "السعر يظهر في صفحة الفندق" : "Price shown on the hotel page"}</p>
          )}
          <Link
            href={href}
            className="inline-flex shrink-0 items-center justify-center rounded-2xl px-4 py-3.5 text-[14px] font-black text-white shadow-[0_12px_28px_-12px_rgba(46,16,101,0.85)] hover:brightness-110 active:scale-[0.98] transition-all sm:w-full"
            style={{ background: "linear-gradient(135deg, #2e1065 0%, #6d28d9 55%, #b45309 160%)" }}
          >
            {c.seeRooms}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden border border-slate-200/80">
      <div className="w-full aspect-[16/10] sm:aspect-auto sm:w-[264px] sm:min-h-[212px] bg-slate-200 animate-pulse" />
      <div className="flex-1 p-4 space-y-2.5">
        <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
        <div className="mt-4 h-16 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
      <div className="sm:w-[188px] p-4 border-t sm:border-t-0 sm:border-s border-slate-100 flex flex-col items-end justify-end gap-2">
        <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
        <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
