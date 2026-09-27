"use client";

import { useState } from "react";
import Link from "next/link";
import { BedDouble, ChevronLeft, ChevronRight } from "lucide-react";
import HotelFeatureIcon from "@/components/hotels/HotelFeatureIcon";
import HotelPaymentChannels, {
  type HotelPaymentChannelCopy,
  type HotelPaymentChannelFlags,
} from "@/components/hotels/HotelPaymentChannels";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { stayFromNightly } from "@/lib/hotel-display";
import { localizeHotelLabel } from "@/lib/hotel-i18n";
import type { Locale } from "@/lib/i18n/types";
import type { TravelAdvisorRoom } from "@/types/travel-advisor";

type Copy = {
  breakfastIncluded: string;
  roomOnly: string;
  freeCancellation: string;
  nonRefundable: string;
  perNight: string;
  bookNow: string;
  totalStayNightsTaxes: (n: number) => string;
  roomGuests: (n: number) => string;
  roomSize: (n: number) => string;
  roomsUnavailable: string;
};

type Props = {
  room: TravelAdvisorRoom;
  title: string;
  locale: Locale;
  stayNights: number;
  t: Copy;
  bookHref: (price?: number | null) => string;
  paymentChannels?: HotelPaymentChannelFlags | null;
  paymentCopy?: HotelPaymentChannelCopy;
};

const BOOK_BTN =
  "inline-flex h-8 min-w-[72px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-3 text-xs font-bold text-white hover:brightness-110 shadow-xs transition-all";

export default function HotelRoomCard({
  room,
  title,
  stayNights,
  t,
  bookHref,
  locale,
  paymentChannels,
  paymentCopy,
}: Props) {
  const { formatPrice } = useCurrency();
  const photos = room.images.filter(Boolean).slice(0, 4);
  const [index, setIndex] = useState(0);
  const current = photos[index] || "";
  const rates = room.rates?.length
    ? room.rates
    : room.available !== false && (room.nightly != null || room.price != null)
      ? [
          {
            id: `${room.id}-ro`,
            board: "room_only" as const,
            breakfastIncluded: room.breakfastIncluded,
            freeCancellation: room.freeCancellation,
            price: room.price,
            nightly: room.nightly ?? room.price,
            totalStay: room.totalStay,
            currency: room.currency,
            partnerName: room.partnerName,
            label: undefined as string | undefined,
          },
        ]
      : [];

  const go = (dir: number) => {
    if (photos.length < 2) return;
    setIndex((i) => (i + dir + photos.length) % photos.length);
  };

  const unavailable = room.available === false || rates.every((rate) => (rate.nightly ?? rate.price) == null);
  const showPaidCancel = room.nonRefundable || (!room.freeCancellation && Boolean(rates.length));
  const marketing = room.breakfastIncluded
    ? t.breakfastIncluded
    : room.freeCancellation
      ? t.freeCancellation
      : room.view
        ? localizeHotelLabel(room.view, locale)
        : "";

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-[148px] w-full shrink-0 overflow-hidden bg-[#0c1b2a] sm:h-[136px] sm:w-[158px]">
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/35">
              <BedDouble size={22} />
            </div>
          )}
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute start-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1 text-white"
                aria-label="prev"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1 text-white"
                aria-label="next"
              >
                <ChevronRight size={14} />
              </button>
            </>
          ) : null}
        </div>

        <div className={`min-w-0 flex-1 px-3 py-2 ${rates.length > 3 ? "alrayyan-scroll" : ""}`}>
          <h3 className="text-[14px] font-semibold leading-snug text-[#102033]">{title}</h3>
          {unavailable ? (
            <p className="mt-1 text-[11px] font-semibold text-amber-800">{t.roomsUnavailable}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {room.sizeSqm > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f6f1e8] px-1.5 py-0.5 text-[11px] text-[#3d2c14]">
                <HotelFeatureIcon label={t.roomSize(room.sizeSqm)} kind="size" size={18} />{" "}
                {t.roomSize(room.sizeSqm)}
              </span>
            ) : null}
            {room.capacity > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f6f1e8] px-1.5 py-0.5 text-[11px] text-[#3d2c14]">
                <HotelFeatureIcon label={t.roomGuests(room.capacity)} kind="guests" size={18} />{" "}
                {t.roomGuests(room.capacity)}
              </span>
            ) : null}
            {room.beds ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f6f1e8] px-1.5 py-0.5 text-[11px] text-[#3d2c14]">
                <HotelFeatureIcon label={room.beds} kind="bed" size={18} />{" "}
                {localizeHotelLabel(room.beds, locale)}
              </span>
            ) : null}
            {room.breakfastIncluded ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-1.5 py-0.5 text-[11px] text-purple-950 border border-purple-200/60 font-medium">
                <HotelFeatureIcon label={t.breakfastIncluded} kind="breakfast" size={18} />
                {t.breakfastIncluded}
              </span>
            ) : null}
            {room.freeCancellation ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-1.5 py-0.5 text-[11px] text-purple-950 border border-purple-200/60 font-medium">
                <HotelFeatureIcon label={t.freeCancellation} kind="cancel" size={18} />
                {t.freeCancellation}
              </span>
            ) : showPaidCancel ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-900 border border-amber-200/60 font-medium">
                <HotelFeatureIcon label={t.nonRefundable} kind="noCancel" size={18} />
                {t.nonRefundable}
              </span>
            ) : null}
          </div>

          {rates.length ? (
            <div className="mt-2 space-y-1.5">
              {rates.map((rate) => {
                const money = stayFromNightly(rate.nightly ?? rate.price, stayNights);
                const nightly = money.nightly || null;
                const stay = money.total || null;
                const boardLabel = rate.label
                  ? localizeHotelLabel(rate.label.split("\n")[0] || "", locale) ||
                    (rate.breakfastIncluded ? t.breakfastIncluded : t.roomOnly)
                  : rate.breakfastIncluded
                    ? t.breakfastIncluded
                    : t.roomOnly;
                return (
                  <div
                    key={rate.id}
                    className="flex flex-nowrap items-center justify-between gap-2 rounded-lg border border-[#efe6d8] bg-[#fbf8f3] px-2.5 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#102033]">
                        <HotelFeatureIcon
                          label={boardLabel}
                          kind={rate.breakfastIncluded ? "breakfast" : "bed"}
                          size={16}
                        />
                        <span className="truncate">{boardLabel}</span>
                      </p>
                      {rate.freeCancellation ? (
                        <p className="inline-flex items-center gap-1 text-[11px] text-purple-900 font-medium">
                          <HotelFeatureIcon label={t.freeCancellation} kind="cancel" size={16} />
                          {t.freeCancellation}
                        </p>
                      ) : (
                        <p className="inline-flex items-center gap-1 text-[11px] text-amber-800">
                          <HotelFeatureIcon label={t.nonRefundable} kind="noCancel" size={16} />
                          {t.nonRefundable}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {nightly != null ? (
                        <div className="text-end">
                          <p className="text-sm font-extrabold text-[#2e1065]">
                            {formatPrice(nightly, rate.currency || room.currency || "USD")}
                          </p>
                          <p className="text-[10px] text-slate-500">{t.perNight}</p>
                          {stay != null && stayNights > 1 ? (
                            <p className="text-[10px] text-slate-500">
                              {t.totalStayNightsTaxes(stayNights)}: {formatPrice(stay, rate.currency || room.currency || "USD")}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {nightly != null && !unavailable ? (
                        <Link href={bookHref(money.nightly)} className={BOOK_BTN}>
                          {t.bookNow}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          {marketing ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-950">
              <HotelFeatureIcon label={marketing} size={16} />
              {marketing}
            </p>
          ) : null}
          {paymentCopy ? (
            <HotelPaymentChannels
              className="mt-2"
              channels={paymentChannels}
              t={paymentCopy}
              variant="compact"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
