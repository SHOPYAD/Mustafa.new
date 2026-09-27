import type { Locale } from "@/lib/i18n/types";
import { whatsappProgramText } from "@/lib/planner/day-copy";
import { digitsWhatsApp } from "@/lib/sales-price-copy";
import { defaultSalesChatConfig } from "@/types/sales-chat";
import type { PlannerTrip } from "@/types/planner";
import type { SalesChatCard } from "@/types/sales-chat";

export function slimTripForPdf(trip: PlannerTrip, cards: SalesChatCard[]): PlannerTrip {
  return {
    id: trip.id,
    titleAr: trip.titleAr,
    titleEn: trip.titleEn,
    origin: trip.origin,
    destination: trip.destination,
    durationDays: trip.durationDays,
    arrivalDate: trip.arrivalDate,
    departureDate: trip.departureDate,
    prefs: trip.prefs,
    days: (trip.days || []).map((day) => ({
      day: day.day,
      titleAr: day.titleAr,
      titleEn: day.titleEn,
      notes: day.notes,
      stops: (day.stops || []).map((stop) => ({
        id: stop.id,
        day: stop.day,
        order: stop.order,
        kind: stop.kind,
        titleAr: stop.titleAr,
        titleEn: stop.titleEn,
        lat: stop.lat,
        lng: stop.lng,
        image: stop.image,
        slotAr: stop.slotAr,
        slotEn: stop.slotEn,
      })),
      legs: [],
    })),
    later: [],
    discover: [],
    notes: "",
    tipsAr: (trip.tipsAr || []).slice(0, 6),
    tipsEn: (trip.tipsEn || []).slice(0, 6),
    defaultMode: trip.defaultMode,
    center: trip.center,
    cards: cards.map((card) => ({
      type: card.type,
      id: card.id,
      titleAr: card.titleAr,
      titleEn: card.titleEn,
      subtitleAr: card.subtitleAr,
      subtitleEn: card.subtitleEn,
      image: card.image,
      basePrice: card.basePrice || card.clientPrice,
      clientPrice: card.clientPrice,
      currency: card.currency,
      href: card.href,
      airline: card.airline,
      fromIata: card.fromIata,
      toIata: card.toIata,
      stars: card.stars,
    })),
    totalClientPrice: trip.totalClientPrice,
    currency: trip.currency || "USD",
  };
}

export async function downloadProgramPdf(trip: PlannerTrip, cards: SalesChatCard[], locale: Locale) {
  const res = await fetch("/internal/planner/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale, trip: slimTripForPdf(trip, cards) }),
  });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || type.includes("application/json")) {
    const json = type.includes("json") ? await res.json().catch(() => ({})) : {};
    throw new Error(String(json.error || `pdf_${res.status}`));
  }
  const blob = await res.blob();
  if (!blob.size) throw new Error("pdf_empty");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lonaliza-${trip.destination || "program"}-program.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function programWhatsAppUrl(
  trip: PlannerTrip,
  cards: SalesChatCard[],
  locale: Locale,
  totalLabel: string,
  phone?: string
): string {
  const digits = digitsWhatsApp(phone || defaultSalesChatConfig.salesWhatsApp);
  const text = whatsappProgramText(trip, cards, locale, totalLabel);
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : "";
}
