import type { AiProgramInput } from "@/types/ai-program";
import type { PlannerTrip } from "@/types/planner";
import type { SalesChatItinerary } from "@/types/sales-chat";
import { writeDayNarrative } from "./day-copy";
import { roundedClientTotal } from "./money";

export function tripToItinerary(trip: PlannerTrip): SalesChatItinerary {
  const fromCards = (trip.cards || []).reduce((sum, c) => sum + (Number(c.clientPrice) || 0), 0);
  return {
    titleAr: trip.titleAr,
    titleEn: trip.titleEn,
    destination: trip.destination,
    arrivalDate: trip.arrivalDate,
    departureDate: trip.departureDate,
    days: trip.days.map((d) => ({
      day: d.day,
      titleAr: d.titleAr,
      titleEn: d.titleEn,
      detailAr: d.notes || writeDayNarrative(d, trip.durationDays, trip.destination, "ar"),
      detailEn: d.notes || writeDayNarrative(d, trip.durationDays, trip.destination, "en"),
      lat: d.stops[0]?.lat,
      lng: d.stops[0]?.lng,
      items: d.stops.map((s) => ({
        kind: s.kind === "hotel" ? "hotel" : s.kind === "transfer" ? "transfer" : "activity",
        labelAr: s.titleAr,
        labelEn: s.titleEn,
        time: s.slotAr,
        image: s.image,
      })),
    })),
    totalClientPrice: roundedClientTotal(trip.totalClientPrice || fromCards),
    currency: trip.currency || "USD",
  };
}

export function tripSalesReply(trip: PlannerTrip, locale: string): string {
  const dest = locale === "ar" ? trip.titleAr : trip.titleEn;
  const spots = trip.days.reduce((n, d) => n + d.stops.length, 0);
  const extra = trip.discover?.length || trip.later.length || 0;
  const total = roundedClientTotal(trip.totalClientPrice);
  if (locale === "ar") {
    const money = total > 0 ? ` الإجمالي التقريبي $${total.toLocaleString("en-US")}.` : "";
    const more = extra > 0 ? ` ${extra} معلماً حول ${trip.destination} يمكنك إضافتها.` : "";
    return `جهّزنا لك ${trip.durationDays} أيام في ${dest} — ${spots} محطات حية.${money}${more} السعر تقديري ويتأكد مع فريق الحجز.`;
  }
  const money = total > 0 ? ` Approximate total $${total.toLocaleString("en-US")}.` : "";
  const more = extra > 0 ? ` ${extra} more places around ${trip.destination} you can add.` : "";
  return `${trip.durationDays} days in ${dest} — ${spots} live stops.${money}${more} Prices are estimates until the booking team confirms.`;
}

export function tripToProgramInput(trip: PlannerTrip): AiProgramInput {
  return {
    titleAr: trip.titleAr,
    titleEn: trip.titleEn,
    destination: trip.destination,
    nights: Math.max(1, trip.durationDays - 1),
    arrivalDate: trip.arrivalDate,
    departureDate: trip.departureDate,
    thumbnail: trip.days?.[0]?.stops?.[0]?.image,
    includesAr: (trip.tipsAr || []).slice(0, 6),
    includesEn: (trip.tipsEn || []).slice(0, 6),
    itinerary: {
      titleAr: trip.titleAr,
      titleEn: trip.titleEn,
      destination: trip.destination,
      arrivalDate: trip.arrivalDate,
      departureDate: trip.departureDate,
      days: (trip.days || []).map((d) => ({
        day: d.day,
        titleAr: d.titleAr,
        titleEn: d.titleEn,
        detailAr: d.notes || writeDayNarrative(d, trip.durationDays, trip.destination, "ar"),
        detailEn: d.notes || writeDayNarrative(d, trip.durationDays, trip.destination, "en"),
        lat: d.stops?.[0]?.lat,
        lng: d.stops?.[0]?.lng,
        items: (d.stops || []).map((s) => ({
          kind: s.kind === "hotel" ? "hotel" : s.kind === "transfer" ? "transfer" : "activity",
          labelAr: s.titleAr,
          labelEn: s.titleEn,
          image: s.image,
          time: s.slotAr,
        })),
      })),
      totalClientPrice: roundedClientTotal(
        trip.totalClientPrice || (trip.cards || []).reduce((sum, c) => sum + (Number(c.clientPrice) || 0), 0)
      ),
      currency: trip.currency || "USD",
    },
    cards: trip.cards,
  };
}
