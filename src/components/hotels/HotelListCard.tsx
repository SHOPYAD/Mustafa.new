"use client";

import Link from "next/link";
import HotelFeatureIcon from "@/components/hotels/HotelFeatureIcon";
import HotelPhotoSlider from "@/components/hotels/HotelPhotoSlider";
import { hotelRatingLabel, stayFromNightly } from "@/lib/hotel-display";
import { localizeHotelLabel, localizeRoomType } from "@/lib/hotel-i18n";
import { pickHotelRibbon, ribbonClass, type HotelRibbonKind } from "@/lib/hotel-ribbons";
import { useCurrency } from "@/components/ui/CurrencySelector";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";

type Props = {
  hotel: TravelAdvisorHotelCard;
  href: string;
  neighborRibbons?: HotelRibbonKind[];
};

function cardPhotos(hotel: TravelAdvisorHotelCard): string[] {
  const list = Array.isArray(hotel.images) ? hotel.images.filter(Boolean) : [];
  if (hotel.image && !list.includes(hotel.image)) list.unshift(hotel.image);
  return list;
}

export default function HotelListCard({ hotel, href, neighborRibbons = [] }: Props) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const priceCurrency = hotel.currency || "USD";
  const photos = cardPhotos(hotel);
  const money = stayFromNightly(hotel.nightly ?? hotel.priceFrom, hotel.nights || 1);
  const nightly = money.nightly || null;
  const stayTotal = money.total || null;
  const before =
    hotel.priceOriginal && nightly != null && hotel.priceOriginal > nightly
      ? hotel.priceOriginal
      : null;
  const location =
    hotel.locationText ||
    [hotel.neighborhood, hotel.address, hotel.city, hotel.distanceText]
      .filter(Boolean)
      .join(" · ");
  const roomType = localizeRoomType(hotel.roomType, locale);
  const ribbon = pickHotelRibbon(hotel, neighborRibbons);
  const ribbonLabel =
    ribbon?.kind === "bestArea"
      ? t.hotels.ribbonBestArea
      : ribbon?.kind === "hurry"
        ? t.hotels.ribbonHurry
        : ribbon?.kind === "nearCenter"
          ? t.hotels.ribbonNearCenter
          : ribbon?.kind === "breakfast"
            ? t.hotels.ribbonBreakfast
            : ribbon?.kind === "freeCancel"
              ? t.hotels.ribbonFreeCancel
              : "";

  const freeCancel = /free cancellation|إلغاء مجاني|ücretsiz iptal/i.test(hotel.cancellation);
  const paidCancel =
    hotel.nonRefundable || /non.?refund|غير قابل/i.test(hotel.cancellation || "");

  const chips: Array<{ key: string; label: string; kind?: "bed" | "breakfast" | "cancel" | "noCancel" }> =
    [];
  if (roomType) chips.push({ key: "room", label: roomType });
  if (hotel.bedType && hotel.bedType !== hotel.roomType) {
    chips.push({
      key: "bed",
      label: localizeHotelLabel(hotel.bedType, locale),
      kind: "bed",
    });
  }
  if (hotel.breakfastIncluded) {
    chips.push({ key: "bf", label: t.hotels.breakfastIncluded, kind: "breakfast" });
  }
  if (freeCancel) {
    chips.push({ key: "cx", label: t.hotels.freeCancellation, kind: "cancel" });
  } else if (paidCancel) {
    chips.push({ key: "nr", label: t.hotels.nonRefundable, kind: "noCancel" });
  }

  return (
    <article className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full h-[168px] sm:w-[220px] sm:h-[188px] shrink-0">
        <HotelPhotoSlider
          images={photos}
          name={hotel.name}
          hotelId={hotel.bookingHotelId || hotel.id}
          className="!min-h-0 h-full w-full"
        />
      </div>
      <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-bold text-slate-900 text-[15px] leading-tight">
              <Link href={href} className="hover:text-emerald-800">
                {hotel.name}
              </Link>
            </h3>
            {hotel.stars > 0
              ? Array.from({ length: hotel.stars }).map((_, idx) => (
                  <span key={idx} className="text-amber-400 text-xs leading-none" aria-hidden>
                    ★
                  </span>
                ))
              : null}
          </div>
          {hotel.rating > 0 ? (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-[#051741] px-1.5 py-0.5 text-white text-[11px] font-bold">
                {hotel.rating.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {hotelRatingLabel(hotel.rating, t.hotels)}
              </span>
              {hotel.reviewCount > 0 ? (
                <span className="text-[11px] text-slate-500">
                  {hotel.reviewCount.toLocaleString()} {t.hotels.reviews}
                </span>
              ) : null}
            </div>
          ) : null}
          <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
            <HotelFeatureIcon label={location || hotel.city} kind="location" size={20} />
            <span className="leading-snug line-clamp-2">{location || hotel.city}</span>
          </p>
          {chips.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.slice(0, 5).map((chip) => (
                <span
                  key={chip.key}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 text-[12px] rounded-md ${
                    chip.kind === "cancel"
                      ? "bg-emerald-50 text-emerald-800"
                      : chip.kind === "noCancel"
                        ? "bg-amber-50 text-amber-900"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <HotelFeatureIcon label={chip.label} kind={chip.kind} size={20} />
                  {chip.label}
                </span>
              ))}
            </div>
          ) : null}
          {stayTotal != null ? (
            <LoyaltyPointsRow
              className="mt-2"
              amount={stayTotal}
              currency={priceCurrency}
              service="hotels"
            />
          ) : null}
          <div className="mt-auto pt-2">
            {ribbon && ribbonLabel ? (
              <p
                className={`hotel-ribbon hotel-ribbon-pulse w-full rounded-md bg-gradient-to-l px-2.5 py-1.5 text-[12px] font-bold leading-snug shadow-sm ${ribbonClass(ribbon.tone)}`}
              >
                {ribbonLabel}
              </p>
            ) : null}
          </div>
        </div>
        <div className="sm:w-[168px] shrink-0 flex sm:flex-col items-stretch justify-between gap-2">
          {nightly != null ? (
            <div className="rounded-xl bg-gradient-to-br from-[#051741] to-[#0a3a2a] px-3 py-2 text-white sm:text-end">
              {hotel.discountPct ? (
                <span className="inline-flex mb-0.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-[#051741]">
                  {t.hotels.discountBadge(hotel.discountPct)}
                </span>
              ) : null}
              {before != null ? (
                <p className="text-[11px] text-white/50 line-through">{formatPrice(before, priceCurrency)}</p>
              ) : null}
              <p className="text-[10px] text-amber-200/80">{t.hotels.perNight}</p>
              <p className="text-2xl font-bold text-amber-300 leading-none">
                {formatPrice(nightly, priceCurrency)}
              </p>
              {stayTotal != null && (hotel.nights || 1) > 1 ? (
                <p className="text-[10px] text-white/75 mt-1">
                  {t.hotels.totalStayNightsTaxes(hotel.nights || 1)}: {formatPrice(stayTotal, priceCurrency)}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:text-end">
              <p className="text-xs font-semibold text-slate-600">{t.hotels.priceOnDetails}</p>
            </div>
          )}
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-lg bg-[#051741] px-3 py-2 text-sm font-bold text-white hover:bg-[#0a2a4a]"
          >
            {t.hotels.bookNow}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden border border-slate-200">
      <div className="w-full h-[168px] sm:w-[220px] sm:h-[188px] bg-slate-200 animate-pulse" />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
