"use client";

import { MapPin } from "lucide-react";
import SalesOfferCards from "@/components/chat/SalesOfferCards";
import { plannerCopy } from "@/lib/planner/copy";
import { formatClientPrice } from "@/lib/planner/money";
import { tripSalesReply } from "@/lib/planner/to-program";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { PlannerTrip } from "@/types/planner";
import type { SalesChatCard } from "@/types/sales-chat";
import { KindMark } from "./KindMark";
import { usePlanner } from "./PlannerStore";

function liveCardsOf(cards: SalesChatCard[], type: SalesChatCard["type"]) {
  return cards.filter((c) => c.type === type && (Number(c.clientPrice) > 0 || Boolean(c.image && c.href)));
}

export default function TripProgram({
  trip,
  cards,
  compact,
}: {
  trip: PlannerTrip;
  cards?: SalesChatCard[];
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { addStop, activeDay, setDetailStop, setActiveDay, setMode, setCenterTab } = usePlanner();
  const offerCards = cards?.length ? cards : trip.cards || [];
  const flights = liveCardsOf(offerCards, "flight").slice(0, 2);
  const hotels = liveCardsOf(offerCards, "hotel").slice(0, 2);
  const cover =
    trip.days.flatMap((d) => d.stops).find((s) => s.image)?.image ||
    hotels[0]?.image ||
    flights[0]?.image;
  const total = Math.round(Number(trip.totalClientPrice) || offerCards.reduce((s, x) => s + (Number(x.clientPrice) || 0), 0));
  const title = locale === "ar" ? trip.titleAr : trip.titleEn;

  return (
    <div className="w-full min-w-0 space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      {cover ? (
        <div className="overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="h-40 w-full object-cover" />
        </div>
      ) : null}

      <div>
        <h3 className="text-[17px] font-black leading-snug text-[#1A1438] [unicode-bidi:isolate]">{title}</h3>
        <p className="mt-1.5 text-[14px] leading-7 text-[#4B4568]">{tripSalesReply(trip, locale)}</p>
      </div>

      {flights.length || hotels.length ? (
        <SalesOfferCards
          layout="slider"
          cards={[...flights, ...hotels]}
          onAddHotelStay={(card) =>
            addStop(
              {
                id: `hotel-${card.id || card.titleEn}`,
                day: activeDay || 1,
                order: 99,
                kind: "hotel",
                titleAr: card.titleAr,
                titleEn: card.titleEn,
                lat: trip.center.lat,
                lng: trip.center.lng,
                image: card.image,
                rating: card.stars,
                href: card.href,
                priceUsd: card.clientPrice,
              },
              activeDay || 1
            )
          }
        />
      ) : (
        <p className="rounded-xl bg-[#F4F2FA] px-3 py-2 text-[13px] font-medium text-[#4B4568]">{c.preparingFlight}</p>
      )}

      <section className="space-y-3">
        <p className="text-[12px] font-black text-[#2E1065]">{c.daysTitle}</p>
        {trip.days.map((day) => {
          const dayTitle = locale === "ar" ? day.titleAr : day.titleEn;
          return (
            <article key={day.day} className="overflow-hidden rounded-2xl border border-[#E8E4F4] bg-white">
              <button
                type="button"
                onClick={() => {
                  setActiveDay(day.day);
                  setCenterTab("itinerary");
                  if (!compact) setMode("planner");
                }}
                className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-start"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-[#7C3AED]">
                    {locale === "ar" ? `اليوم ${day.day}` : `Day ${day.day}`}
                  </p>
                  <p className="truncate text-[15px] font-black text-[#1A1438] [unicode-bidi:isolate]">{dayTitle}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#F3E8FF] px-2 py-1 text-[11px] font-bold text-[#6D28D9]">
                  {day.stops.length} {c.places}
                </span>
              </button>
              <ol className="space-y-1 px-3 pb-3">
                {day.stops.slice(0, 6).map((stop, i) => {
                  const name = locale === "ar" ? stop.titleAr || stop.titleEn : stop.titleEn || stop.titleAr;
                  return (
                    <li key={stop.id}>
                      <button
                        type="button"
                        onClick={() => setDetailStop(stop)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-1 py-1.5 text-start hover:bg-[#F7F5FC]"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2E1065] text-[11px] font-black text-white">
                          {i + 1}
                        </span>
                        <span className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F3E8FF]">
                          {stop.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={stop.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full items-center justify-center">
                              <KindMark kind={stop.kind} size={14} />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-bold text-[#1A1438] [unicode-bidi:isolate]">
                            {name}
                          </span>
                          {stop.slotAr || stop.slotEn ? (
                            <span className="text-[11px] font-semibold text-[#7C3AED]">
                              {locale === "ar" ? stop.slotAr : stop.slotEn}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </section>

      {trip.discover?.length ? (
        <button
          type="button"
          onClick={() => {
            setCenterTab("ideas");
            if (!compact) setMode("planner");
          }}
          className="flex items-center gap-1 text-[13px] font-medium text-[#5B5674]"
        >
          <MapPin size={14} className="text-[#7C3AED]" />
          {trip.discover.length} {c.discoverHint}
        </button>
      ) : null}

      <div className="rounded-2xl bg-[#2E1065] px-4 py-3 text-white">
        <p className="text-[11px] font-bold text-white/70">{c.approxTotal}</p>
        <p className="text-[20px] font-black tabular-nums">
          {total > 0 ? formatClientPrice(total, trip.currency || "USD", locale) : c.preparingFlight}
        </p>
        <p className="mt-1 text-[12px] font-semibold text-white/85">{c.weIssue}</p>
      </div>
    </div>
  );
}
