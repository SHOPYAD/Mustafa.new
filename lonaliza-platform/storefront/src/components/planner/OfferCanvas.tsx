"use client";

import { useMemo } from "react";
import { Plane, Hotel, Car, Bus, Sparkles } from "lucide-react";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import { plannerCopy } from "@/lib/planner/copy";
import { programCost } from "@/lib/planner/cost";
import { formatClientPrice } from "@/lib/planner/money";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";

export default function OfferCanvas() {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { offerCards, offerTotal, offerCurrency, addStop, activeDay, trip } = usePlanner();

  const cost = useMemo(() => {
    if (offerCards.length && trip?.durationDays) {
      return programCost(offerCards, trip.durationDays, offerCurrency || trip?.currency || "USD");
    }
    return null;
  }, [offerCards, trip?.durationDays, offerCurrency, trip?.currency]);
  const total = cost?.total || offerTotal || 0;
  const currency = offerCurrency || trip?.currency || "USD";

  if (!offerCards.length) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED]">
          <Sparkles size={22} />
        </span>
        <p className="mt-4 max-w-md text-[16px] font-black text-slate-900">{c.canvasEmpty}</p>
        <p className="mt-2 max-w-md text-[14px] font-medium leading-6 text-slate-700">{c.askAgent}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            [Plane, locale === "ar" ? "طيران" : "Flights"],
            [Hotel, locale === "ar" ? "فنادق" : "Hotels"],
            [Car, locale === "ar" ? "سيارات" : "Cars"],
            [Bus, locale === "ar" ? "ترانسفير" : "Transfer"],
          ].map(([Icon, label]) => (
            <span
              key={String(label)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E4DFF3] bg-white px-3 text-[13px] font-bold text-slate-800"
            >
              <Icon size={15} className="text-[#7C3AED]" />
              {label as string}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto px-4 py-4">
      {total > 0 ? (
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#2E1065] px-4 py-3 text-white">
          <p className="text-[13px] font-bold">{c.liveTotal}</p>
          <p className="text-[18px] font-black tabular-nums">
            {formatClientPrice(total, currency, locale)}
          </p>
        </div>
      ) : null}
      <SalesOfferCards
        cards={offerCards}
        onAddHotelStay={(card) =>
          addStop(
            {
              id: `hotel-${card.id || card.titleEn}`,
              day: activeDay || 1,
              order: 99,
              kind: "hotel",
              titleAr: card.titleAr,
              titleEn: card.titleEn,
              lat: trip?.center.lat || 41.0082,
              lng: trip?.center.lng || 28.9784,
              image: card.image,
              rating: card.stars,
              href: card.href,
              priceUsd: card.clientPrice,
            },
            activeDay || 1
          )
        }
      />
    </div>
  );
}
