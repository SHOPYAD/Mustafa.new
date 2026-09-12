/**
 * Live service quotes for the AI travel consultant.
 * Consumes existing site search (hotels API, internal transfers/cars).
 * Flights: Travelpayouts Data API when a token exists; otherwise a linked card
 * with pricePending (iframe search has no server price feed).
 */

import { defaultHotels } from "@/data/hotels";
import { defaultTransfers } from "@/data/transfers";
import { PHOTO } from "@/data/catalog-photos";
import { hotelApiSlug } from "@/lib/hotels-config";
import { rentalDays, matchesInternalCar, sortFleet } from "@/lib/cars/matching";
import { listActiveInternalCars } from "@/lib/server/cars-store";
import { listHotels } from "@/lib/server/travel-advisor";
import { getServerEnv } from "@/lib/server/env-store";
import { applyMarkup } from "@/lib/server/sales-catalog";
import {
  buildAdvisorCarsHref,
  buildAdvisorFlightHref,
  buildAdvisorTransferHref,
  resolveIataCode,
} from "@/lib/server/travel-search-links";
import type { SalesChatCard } from "@/types/sales-chat";

export type QuoteTrip = {
  destination: string;
  arrivalDate?: string;
  departureDate?: string;
  nights?: number;
  people?: number;
  fromIata?: string;
  toIata?: string;
  fromCity?: string;
};

export type LiveQuote = {
  cards: SalesChatCard[];
  selected: SalesChatCard[];
  totalClientPrice: number;
  pendingTypes: SalesChatCard["type"][];
  flightHref?: string;
  transferHref?: string;
  carsHref?: string;
  hotelsHref?: string;
  nights: number;
  people: number;
  arrivalDate: string;
  departureDate: string;
  warnings: string[];
};

const HOTEL_CACHE_TTL = 10 * 60 * 1000;
const hotelCache = new Map<
  string,
  { at: number; cards: SalesChatCard[]; warning?: string }
>();

const DEST_HINTS: Array<{
  keys: RegExp;
  city: string;
  iata: string;
  airport: string;
  area: string;
}> = [
  {
    keys: /istanbul|إسطنبول|اسطنبول|ist\b|saw\b/,
    city: "Istanbul",
    iata: "IST",
    airport: "IST Airport",
    area: "Sultanahmet",
  },
  {
    keys: /antalya|أنطاليا|انطاليا|belek|kemer|lara|ayt\b/,
    city: "Antalya",
    iata: "AYT",
    airport: "AYT Airport",
    area: "Belek",
  },
  {
    keys: /trabzon|طرابزون|ayder|uzungol|أوزنجول|tzx\b/,
    city: "Trabzon",
    iata: "TZX",
    airport: "TZX Airport",
    area: "Trabzon",
  },
  {
    keys: /cappadocia|kapadokya|كابادوكيا|goreme|göreme|asr\b/,
    city: "Cappadocia",
    iata: "ASR",
    airport: "ASR Airport",
    area: "Göreme",
  },
  {
    keys: /bodrum|بودروم|bjv\b/,
    city: "Bodrum",
    iata: "BJV",
    airport: "BJV Airport",
    area: "Bodrum",
  },
  {
    keys: /izmir|أزمير|ازمير|adb\b/,
    city: "Izmir",
    iata: "ADB",
    airport: "ADB Airport",
    area: "Izmir",
  },
];

function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nightsBetween(a?: string, b?: string): number {
  if (!a || !b) return 0;
  const start = Date.parse(`${a}T00:00:00`);
  const end = Date.parse(`${b}T00:00:00`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.max(1, Math.round((end - start) / 86400000));
}

function resolveDest(raw: string) {
  const blob = String(raw || "");
  return DEST_HINTS.find((d) => d.keys.test(blob)) || null;
}

function pickImage(url?: string, fallback: string = PHOTO.luxuryHotel): string {
  return url && /^https?:\/\//i.test(url) ? url : fallback;
}

function hotelStayPrice(nightlyOrStay: number, nights: number): number {
  if (nightlyOrStay <= 0) return 0;
  if (nightlyOrStay <= 500) return Math.round(nightlyOrStay * nights);
  return Math.round(nightlyOrStay);
}

export function normalizeTrip(
  trip: QuoteTrip,
  extraText = ""
): Required<Pick<QuoteTrip, "destination" | "people">> & {
  arrivalDate: string;
  departureDate: string;
  nights: number;
  fromIata: string;
  toIata: string;
  dest: ReturnType<typeof resolveDest>;
} {
  const blob = `${trip.destination} ${trip.toIata || ""} ${extraText}`;
  const dest = resolveDest(blob);
  const people = Math.max(1, Math.round(Number(trip.people) || 2));
  let arrival = trip.arrivalDate || "";
  let departure = trip.departureDate || "";
  let nights = Math.max(0, Math.round(Number(trip.nights) || 0));
  if (!nights && arrival && departure) nights = nightsBetween(arrival, departure);
  if (!nights) nights = 6;
  if (!arrival) arrival = isoPlus(14);
  if (!departure) {
    const start = Date.parse(`${arrival}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + nights);
    departure = end.toISOString().slice(0, 10);
  }
  const toIata =
    resolveIataCode(trip.toIata) || dest?.iata || resolveIataCode(trip.destination) || "IST";
  const fromIata = resolveIataCode(trip.fromIata || trip.fromCity) || "DXB";
  return {
    destination: dest?.city || trip.destination || "Istanbul",
    people,
    arrivalDate: arrival,
    departureDate: departure,
    nights,
    fromIata,
    toIata,
    dest,
  };
}

async function quoteHotels(
  trip: ReturnType<typeof normalizeTrip>,
  markup: number
): Promise<{ cards: SalesChatCard[]; warning?: string }> {
  const key = `${trip.destination}:${trip.arrivalDate}:${trip.departureDate}:${trip.people}`;
  const hit = hotelCache.get(key);
  if (hit && Date.now() - hit.at < HOTEL_CACHE_TTL) {
    return { cards: hit.cards, warning: hit.warning };
  }

  let cards: SalesChatCard[] = [];
  let warning: string | undefined;
  try {
    const hotels = (await listHotels({
      query: trip.destination,
      checkIn: trip.arrivalDate,
      checkOut: trip.departureDate,
      adults: trip.people,
    })).hotels;
    const destCity = trip.destination.toLowerCase();
    const matching = hotels.filter((h) => {
      if (!h.name) return false;
      const city = `${h.city} ${h.neighborhood} ${h.name}`.toLowerCase();
      return (
        city.includes(destCity.slice(0, 5)) ||
        destCity.includes((h.city || "").toLowerCase().slice(0, 5))
      );
    });
    const pool = matching.length ? matching : [];
    cards = pool.slice(0, 3).map((h) => {
        const stay = hotelStayPrice(Number(h.priceFrom) || 0, trip.nights);
        const pending = stay <= 0;
        const client = pending ? 0 : applyMarkup(stay, markup);
        const href = `/hotels/${hotelApiSlug(h.id)}?checkIn=${trip.arrivalDate}&checkOut=${trip.departureDate}&adults=${trip.people}`;
        return {
          type: "hotel" as const,
          id: h.id,
          titleAr: h.name,
          titleEn: h.name,
          subtitleAr: h.neighborhood || h.city || trip.destination,
          subtitleEn: h.neighborhood || h.city || trip.destination,
          image: pickImage(h.image || h.images?.[0]),
          basePrice: stay,
          clientPrice: client,
          currency: "USD",
          href,
          badges: h.stars ? [`${h.stars}★`] : h.badges?.slice(0, 2),
          highlights: h.badges?.slice(0, 3),
          pricePending: pending,
          unitPrice: stay > 0 ? Math.round(stay / trip.nights) : undefined,
          unitLabelAr: "لليلة",
          unitLabelEn: "per night",
          nights: trip.nights,
          source: pending ? "pending" : "live",
        };
      });
  } catch {
    warning = "hotel_search_failed";
  }

  if (!cards.length) {
    // Live multi-supplier search (Hotelbeds / Travelport / RateHawk / Seeru) through the supply orchestrator.
    try {
      const { runPublicHotelSearch } = await import("@/lib/server/hotels-search-runtime");
      const live = await runPublicHotelSearch({
        query: trip.destination,
        checkIn: trip.arrivalDate,
        checkOut: trip.departureDate,
        adults: trip.people,
        rooms: 1,
        page: 0,
        pageSize: 10,
        sort: "best",
        lang: "ar",
      });
      if (live.hotels.length) {
        cards = live.hotels.slice(0, 3).map((h) => {
          const stay = hotelStayPrice(Number(h.nightly) || 0, trip.nights);
          const pending = stay <= 0;
          const qs = new URLSearchParams({ checkIn: trip.arrivalDate, checkOut: trip.departureDate, adults: String(trip.people) });
          if (h.sessionId) qs.set("sid", h.sessionId);
          if (h.masterId) qs.set("master", h.masterId);
          return {
            type: "hotel" as const,
            id: h.id,
            titleAr: h.name,
            titleEn: h.name,
            subtitleAr: h.city || trip.destination,
            subtitleEn: h.city || trip.destination,
            image: pickImage(h.image),
            basePrice: stay,
            clientPrice: pending ? 0 : applyMarkup(stay, markup),
            currency: h.currency || "USD",
            href: `/hotels/${hotelApiSlug(h.id)}?${qs.toString()}`,
            badges: h.stars ? [`${h.stars}★`] : [],
            highlights: h.badges?.slice(0, 3) || [],
            pricePending: pending,
            unitPrice: Number(h.nightly) || undefined,
            unitLabelAr: "لليلة",
            unitLabelEn: "per night",
            nights: trip.nights,
            source: pending ? "pending" : "live",
          };
        });
      }
    } catch {
      /* fallback to local catalogue */
    }
  }

  if (!cards.length) {
    const city = trip.destination.toLowerCase();
    const fallback = defaultHotels
      .filter((h) => h.isActive !== false)
      .filter((h) => (h.city || "").toLowerCase().includes(city.slice(0, 4)) || city.includes((h.city || "").toLowerCase()))
      .slice(0, 3);
    cards = fallback.map((h) => {
      const nightly =
        (h.rooms || []).map((r) => r.price).filter((p) => p > 0).sort((a, b) => a - b)[0] || 0;
      const stay = nightly * trip.nights;
      const pending = stay <= 0;
      return {
        type: "hotel" as const,
        id: h.id,
        titleAr: h.nameAr,
        titleEn: h.nameEn,
        subtitleAr: h.neighborhoodAr || h.city,
        subtitleEn: h.neighborhoodEn || h.city,
        image: pickImage(h.images?.[0]),
        basePrice: stay,
        clientPrice: pending ? 0 : applyMarkup(stay, markup),
        currency: "USD",
        href: `/hotels/${h.slug}?checkIn=${trip.arrivalDate}&checkOut=${trip.departureDate}&adults=${trip.people}`,
        badges: h.stars ? [`${h.stars}★`] : [],
        highlights: (h.highlightsAr || []).slice(0, 3),
        pricePending: pending,
        unitPrice: nightly || undefined,
        unitLabelAr: "لليلة",
        unitLabelEn: "per night",
        nights: trip.nights,
        source: pending ? "pending" : "catalog",
      };
    });
    if (!cards.length) warning = warning || "hotel_none";
  }

  hotelCache.set(key, { at: Date.now(), cards, warning });
  return { cards, warning };
}

async function quoteTransfers(
  trip: ReturnType<typeof normalizeTrip>,
  markup: number
): Promise<SalesChatCard[]> {
  // 1. Try Live Seeru Ride search if destination is available
  try {
    const { SeeruRideAdapter } = await import("@/lib/providers/adapters/seeru/seeruRideAdapter");
    const adapter = new SeeruRideAdapter();
    const dest = trip.dest;
    const query = dest?.iata || dest?.airport || dest?.city || trip.destination;
    const locs = await adapter.searchLocations(query);
    if (locs.length > 0) {
      const searchRes = await adapter.searchRides({
        fromPlaceId: locs[0].place_id,
        date: trip.arrivalDate,
        time: "12:00",
        mode: "transfer",
        pax: Math.max(1, trip.people),
      });

      if (searchRes.offers?.length) {
        return searchRes.offers.slice(0, 2).map((o) => ({
          type: "transfer" as const,
          id: `sr_${o.offer_id}`,
          titleAr: `ترانسفير خاص - ${o.car_class.title}`,
          titleEn: `Private Ride - ${o.car_class.title}`,
          subtitleAr: `${o.car_class.capacity} مقاعد · ${o.car_class.luggage} حقائب`,
          subtitleEn: `${o.car_class.capacity} seats · ${o.car_class.luggage} bags`,
          image: o.car_class.image || pickImage(undefined, PHOTO.luxurySedan),
          basePrice: o.price,
          clientPrice: applyMarkup(o.price, markup),
          currency: searchRes.currency || "USD",
          href: `/transfers?from=${encodeURIComponent(locs[0].label)}&date=${trip.arrivalDate}&guests=${trip.people}`,
          badges: [o.car_class.title, "Seeru Direct"].filter(Boolean),
          highlights: [`سعة ${o.car_class.capacity} ركاب`, `استقبال في المطار مع لافتة باسم العميل`, `خدمة مباشرة ومؤمنة`],
          source: "live",
        }));
      }
    }
  } catch {
    /* fallback to catalog */
  }

  // 2. Fallback to catalog transfers
  const dest = trip.dest;
  const hay = `${trip.destination} ${dest?.city || ""} ${dest?.iata || ""} ${dest?.area || ""}`.toLowerCase();
  const items = defaultTransfers
    .filter((t) => t.isActive !== false && t.type === "transfer")
    .filter((t) => {
      const blob = `${t.routeFrom} ${t.routeTo} ${t.routeFromAr} ${t.routeToAr} ${t.titleEn} ${t.titleAr}`.toLowerCase();
      return (
        blob.includes(hay.slice(0, 5)) ||
        (dest &&
          (blob.includes(dest.city.toLowerCase()) ||
            blob.includes(dest.iata.toLowerCase()) ||
            blob.includes(dest.area.toLowerCase())))
      );
    })
    .filter((t) => t.seats >= Math.min(trip.people, 3))
    .sort((a, b) => a.price - b.price)
    .slice(0, 2);

  return items.map((t) => ({
    type: "transfer" as const,
    id: t.id,
    titleAr: t.titleAr,
    titleEn: t.titleEn,
    subtitleAr: `${t.vehicleName} · ${t.seats} مقاعد`,
    subtitleEn: `${t.vehicleName} · ${t.seats} seats`,
    image: pickImage(t.images?.[0], PHOTO.luxurySedan),
    basePrice: t.price,
    clientPrice: applyMarkup(t.price, markup),
    currency: t.currency || "USD",
    href: `/transfers/${t.slug}?date=${trip.arrivalDate}&guests=${trip.people}`,
    badges: [t.vehicleClass || t.vehicleType].filter(Boolean),
    highlights: (t.highlightsAr || []).slice(0, 3),
    source: "catalog",
  }));
}

async function quoteCars(
  trip: ReturnType<typeof normalizeTrip>,
  markup: number
): Promise<SalesChatCard[]> {
  const days = Math.max(1, rentalDays(trip.arrivalDate, trip.departureDate));
  const pickup = trip.dest?.airport || trip.destination;
  const cars = sortFleet(
    (await listActiveInternalCars()).filter((car) =>
      matchesInternalCar(car, {
        pickup,
        date: trip.arrivalDate,
        returnDate: trip.departureDate,
        guests: String(trip.people),
      })
    )
  ).slice(0, 2);

  return cars.map((car) => {
    const daily = car.pricePerDay;
    const total = daily * days;
    return {
      type: "car" as const,
      id: car.id,
      titleAr: car.nameAr || car.name,
      titleEn: car.name,
      subtitleAr: `${daily} دولار/يوم × ${days} أيام`,
      subtitleEn: `$${daily}/day × ${days} days`,
      image: pickImage(car.image, PHOTO.luxurySedan),
      basePrice: total,
      clientPrice: applyMarkup(total, markup),
      currency: "USD",
      href:
        buildAdvisorCarsHref(
          {
            iata: trip.toIata,
            city: trip.destination,
            date: trip.arrivalDate,
            returnDate: trip.departureDate,
            guests: trip.people,
          },
          `/cars?pickup=${encodeURIComponent(pickup)}&date=${trip.arrivalDate}&returnDate=${trip.departureDate}&guests=${trip.people}`
        ) || `/cars`,
      badges: [car.category],
      highlights: [
        `${car.passengers} pax`,
        car.transmission,
        car.airConditioning ? "A/C" : "",
      ].filter(Boolean),
      unitPrice: applyMarkup(daily, markup),
      unitLabelAr: "لليوم",
      unitLabelEn: "per day",
      days,
      source: "catalog",
    };
  });
}

async function quoteFlights(
  trip: ReturnType<typeof normalizeTrip>,
  markup: number
): Promise<{ cards: SalesChatCard[]; warning?: string }> {
  const href = buildAdvisorFlightHref({
    fromIata: trip.fromIata,
    toIata: trip.toIata,
    date: trip.arrivalDate,
    returnDate: trip.departureDate,
    guests: trip.people,
    flightType: "round-trip",
  });
  const token = (
    (await getServerEnv("TRAVELPAYOUTS_TOKEN")) ||
    (await getServerEnv("TRAVELPAYOUTS_API_TOKEN")) ||
    ""
  ).trim();

  const pendingCard = (price = 0, extra?: Partial<SalesChatCard>): SalesChatCard => ({
    type: "flight",
    id: `${trip.fromIata}-${trip.toIata}`,
    titleAr: `طيران ${trip.fromIata} → ${trip.toIata}`,
    titleEn: `Flights ${trip.fromIata} → ${trip.toIata}`,
    subtitleAr: `${trip.arrivalDate} → ${trip.departureDate}`,
    subtitleEn: `${trip.arrivalDate} → ${trip.departureDate}`,
    image: PHOTO.istanbulSkyline,
    basePrice: price,
    clientPrice: price > 0 ? applyMarkup(price, markup) : 0,
    currency: "USD",
    href,
    badges: ["round-trip"],
    pricePending: price <= 0,
    source: price > 0 ? "live" : "pending",
    ...extra,
  });

  if (!token) {
    return {
      cards: [pendingCard()],
      warning: "flight_live_price_unavailable",
    };
  }

  try {
    const url = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
    url.searchParams.set("origin", trip.fromIata);
    url.searchParams.set("destination", trip.toIata);
    url.searchParams.set("departure_at", trip.arrivalDate.slice(0, 7));
    url.searchParams.set("return_at", trip.departureDate.slice(0, 7));
    url.searchParams.set("currency", "usd");
    url.searchParams.set("limit", "3");
    url.searchParams.set("sorting", "price");
    url.searchParams.set("token", token);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return { cards: [pendingCard()], warning: "flight_search_failed" };
    }
    const data = (await res.json()) as {
      data?: Array<{ price?: number; airline?: string; departure_at?: string }>;
    };
    const rows = Array.isArray(data.data) ? data.data : [];
    const cards = rows
      .filter((row) => Number(row.price) > 0)
      .slice(0, 3)
      .map((row, i) =>
        pendingCard(Number(row.price), {
          id: `${trip.fromIata}-${trip.toIata}-${i}`,
          titleAr: row.airline
            ? `طيران ${row.airline} ${trip.fromIata} → ${trip.toIata}`
            : `طيران ${trip.fromIata} → ${trip.toIata}`,
          titleEn: row.airline
            ? `${row.airline} ${trip.fromIata} → ${trip.toIata}`
            : `Flights ${trip.fromIata} → ${trip.toIata}`,
          pricePending: false,
          source: "live",
        })
      );
    if (!cards.length) {
      return { cards: [pendingCard()], warning: "flight_no_offers" };
    }
    return { cards };
  } catch {
    return { cards: [pendingCard()], warning: "flight_search_failed" };
  }
}

function pickSelected(cards: SalesChatCard[]): SalesChatCard[] {
  const order: SalesChatCard["type"][] = ["flight", "hotel", "transfer", "car"];
  const selected: SalesChatCard[] = [];
  for (const type of order) {
    const group = cards.filter((c) => c.type === type);
    if (!group.length) continue;
    const priced = group.filter((c) => c.clientPrice > 0).sort((a, b) => a.clientPrice - b.clientPrice);
    selected.push(priced[0] || group[0]);
  }
  return selected;
}

export async function buildLiveQuote(
  raw: QuoteTrip,
  markup: number,
  extraText = ""
): Promise<LiveQuote | null> {
  const destText = String(raw.destination || "").trim();
  if (!destText && !raw.toIata) return null;

  const trip = normalizeTrip(raw, extraText);
  const warnings: string[] = [];

  const [hotels, cars, flights, transfers] = await Promise.all([
    quoteHotels(trip, markup),
    quoteCars(trip, markup),
    quoteFlights(trip, markup),
    quoteTransfers(trip, markup),
  ]);
  if (hotels.warning) warnings.push(hotels.warning);
  if (flights.warning) warnings.push(flights.warning);

  const cards = [
    ...flights.cards,
    ...hotels.cards,
    ...transfers,
    ...cars,
  ];
  const selected = pickSelected(cards);
  const totalClientPrice = selected.reduce((s, c) => s + (c.clientPrice || 0), 0);
  const pendingTypes = selected
    .filter((c) => c.pricePending || c.clientPrice <= 0)
    .map((c) => c.type);

  const airport = trip.dest?.airport || `${trip.toIata} Airport`;
  const area = trip.dest?.area || trip.destination;

  return {
    cards,
    selected,
    totalClientPrice,
    pendingTypes,
    flightHref: flights.cards[0]?.href,
    transferHref: buildAdvisorTransferHref({
      from: airport,
      to: area,
      date: trip.arrivalDate,
      guests: trip.people,
    }),
    carsHref: buildAdvisorCarsHref({
      iata: trip.toIata,
      city: trip.destination,
      date: trip.arrivalDate,
      returnDate: trip.departureDate,
      guests: trip.people,
    }),
    hotelsHref: `/hotels?q=${encodeURIComponent(trip.destination)}&checkIn=${trip.arrivalDate}&checkOut=${trip.departureDate}&adults=${trip.people}`,
    nights: trip.nights,
    people: trip.people,
    arrivalDate: trip.arrivalDate,
    departureDate: trip.departureDate,
    warnings,
  };
}

export function mergeLiveCards(
  aiCards: SalesChatCard[],
  live: LiveQuote | null
): SalesChatCard[] {
  if (!live) return aiCards;
  const packages = aiCards.filter((c) => c.type === "package");
  return [...live.cards, ...packages];
}
