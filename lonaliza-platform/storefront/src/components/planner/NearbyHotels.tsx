"use client";

import { Hotel } from "lucide-react";
import type { SalesChatCard } from "@/types/sales-chat";
import { plannerCopy } from "@/lib/planner/copy";
import { formatClientPrice } from "@/lib/planner/money";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import { getSafeAttractionFallback } from "@/lib/planner/place-photos";

export default function NearbyHotels() {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { addStop, activeDay, trip, offerCards } = usePlanner();
  const hotels = (offerCards.length ? offerCards : trip?.cards || []).filter(
    (card): card is SalesChatCard =>
      card.type === "hotel" && Boolean(card.image) && Number(card.clientPrice) > 0
  );
  if (!hotels.length) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 flex items-center gap-1.5 text-[12px] font-black text-[#2E1065]">
        <Hotel size={14} />
        {c.hotels}
      </p>
      <div className="grid gap-2">
        {hotels.slice(0, 2).map((card) => (
          <button
            key={card.id || card.titleEn}
            type="button"
            onClick={() =>
              addStop(
                {
                  id: `hotel-${card.id || card.titleEn}`,
                  day: activeDay || 1,
                  order: 99,
                  kind: "hotel",
                  titleAr: card.titleAr,
                  titleEn: card.titleEn,
                  lat: trip?.center.lat || 0,
                  lng: trip?.center.lng || 0,
                  image: card.image,
                  rating: card.stars,
                  href: card.href,
                  priceUsd: card.clientPrice,
                },
                activeDay || 1
              )
            }
            className="flex overflow-hidden rounded-2xl border border-[#E8E4F4] bg-white text-start"
          >
            <div className="h-24 w-28 shrink-0 bg-[#FEF3C7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image || getSafeAttractionFallback("hotel", trip?.destination)}
                alt=""
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getSafeAttractionFallback("hotel", trip?.destination);
                }}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 px-3 py-2.5">
              <p className="line-clamp-2 text-[14px] font-black text-[#1A1438] [unicode-bidi:isolate]">
                {locale === "ar" ? card.titleAr || card.titleEn : card.titleEn}
              </p>
              <p className="mt-1 text-[16px] font-black tabular-nums text-[#2E1065]">
                {formatClientPrice(card.clientPrice, card.currency || "USD", locale)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
