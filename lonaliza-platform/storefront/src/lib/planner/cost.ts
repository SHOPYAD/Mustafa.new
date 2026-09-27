import type { SalesChatCard } from "@/types/sales-chat";
import { haversineKm, validLatLng } from "./geo";

export type ProgramCost = {
  flight: number;
  hotel: number;
  hotelNightly: number;
  nights: number;
  transfer: number;
  transferRound: number;
  privateCar: number;
  rentalCar: number;
  totalPrivate: number;
  totalRental: number;
  total: number;
  currency: string;
  transferEstimated: boolean;
  toursEstimated: boolean;
  privateEstimated: boolean;
  rentalEstimated: boolean;
  tours: number;
};

function cheapest(cards: SalesChatCard[], type: SalesChatCard["type"]): number {
  const prices = cards
    .filter((c) => c.type === type && Number(c.clientPrice) > 0)
    .map((c) => Math.round(Number(c.clientPrice)));
  if (!prices.length) return 0;
  return Math.min(...prices);
}

export function liveSorted(cards: SalesChatCard[], type: SalesChatCard["type"]): SalesChatCard[] {
  return cards
    .filter((c) => c.type === type && (Number(c.clientPrice) > 0 || Boolean(c.image && c.href)))
    .sort((a, b) => (Number(a.clientPrice) || 999999) - (Number(b.clientPrice) || 999999));
}

function looksRental(card: SalesChatCard): boolean {
  const blob = `${card.titleEn} ${card.titleAr} ${card.subtitleEn || ""} ${card.subtitleAr || ""}`.toLowerCase();
  return /rental|hire|بدون سائق|self.?drive|ekonomik|economy car/i.test(blob) && !/سائق|chauffeur|driver|vip/i.test(blob);
}

function looksChauffeur(card: SalesChatCard): boolean {
  const blob = `${card.titleEn} ${card.titleAr} ${card.subtitleEn || ""} ${card.subtitleAr || ""}`.toLowerCase();
  return /سائق|chauffeur|driver|private|vip|خاص/.test(blob);
}

export function nearbyHotelCards(
  hotels: SalesChatCard[],
  stops: Array<{ lat?: number; lng?: number }>,
  maxKm = 18,
  dayIndex = 1
): SalesChatCard[] {
  const pts = stops.filter((s) => validLatLng(s.lat, s.lng)) as Array<{ lat: number; lng: number }>;
  const geo = hotels.filter((h) => validLatLng(h.lat, h.lng));
  let pool: SalesChatCard[];
  if (!pts.length || !geo.length) {
    pool = liveSorted(hotels, "hotel");
  } else {
    const ranked = geo
      .map((h) => ({
        h,
        d: Math.min(...pts.map((p) => haversineKm(p, { lat: h.lat as number, lng: h.lng as number }))),
      }))
      .sort((a, b) => a.d - b.d || a.h.clientPrice - b.h.clientPrice);
    const near = ranked.filter((x) => x.d <= maxKm).map((x) => x.h);
    if (near.length >= 4) {
      pool = near;
    } else {
      const wider = ranked.filter((x) => x.d <= maxKm * 2).map((x) => x.h);
      pool = wider.length ? wider : liveSorted(hotels, "hotel");
    }
  }

  if (pool.length <= 1) return pool;
  // Rotate pool according to dayIndex so each day presents distinct hotel recommendations
  const offset = ((Math.max(1, dayIndex) - 1) * 2) % pool.length;
  if (offset === 0) return pool;
  return [...pool.slice(offset), ...pool.slice(0, offset)];
}

export function programCost(cards: SalesChatCard[], days: number, currency = "USD"): ProgramCost {
  const nights = Math.max(1, days - 1);
  const tourDays = Math.max(1, days);
  const hotels = liveSorted(cards, "hotel");
  const cars = liveSorted(cards, "car");
  const flight = cheapest(cards, "flight");
  const hotelCard = hotels[0];
  const hotel = hotelCard ? Math.round(Number(hotelCard.clientPrice)) : 0;
  const hotelNightly = hotelCard?.unitPrice || (nights ? Math.round(hotel / nights) : hotel);
  const liveTransfer = cheapest(cards, "transfer");
  const transferEstimated = liveTransfer <= 0;
  const transferOne = liveTransfer || 55;
  const transferRound = transferOne * 2;
  const chauffeur = cars.find(looksChauffeur);
  const rental = cars.find(looksRental) || cars.filter((c) => c !== chauffeur)[0];
  const privateEstimated = !chauffeur;
  const rentalEstimated = !rental;
  const privateCar = chauffeur
    ? Math.round(Number(chauffeur.clientPrice))
    : Math.round(95 * tourDays);
  const rentalCar = rental ? Math.round(Number(rental.clientPrice)) : Math.round(42 * tourDays);
  const tours = cheapest(cards, "package");
  const totalPrivate = flight + hotel + transferRound + privateCar + tours;
  const totalRental = flight + hotel + transferRound + rentalCar + tours;
  return {
    flight,
    hotel,
    hotelNightly,
    nights,
    transfer: transferOne,
    transferRound,
    privateCar,
    rentalCar,
    totalPrivate,
    totalRental,
    total: totalPrivate || totalRental || flight + hotel + transferRound,
    currency,
    transferEstimated,
    toursEstimated: tours <= 0,
    privateEstimated,
    rentalEstimated,
    tours,
  };
}
