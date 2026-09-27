/**
 * Live service quotes for the AI travel consultant.
 * Binds the same engines the public site uses: runFlightSearch, runPublicHotelSearch,
 * Seeru transfers, and the internal cars fleet. Never invents bookable inventory.
 */

import { PHOTO } from "@/data/catalog-photos";
import { hotelApiSlug } from "@/lib/hotels-config";
import { rentalDays, matchesInternalCar, sortFleet } from "@/lib/cars/matching";
import { listActiveInternalCars } from "@/lib/server/cars-store";
import { listHotels } from "@/lib/server/travel-advisor";
import { applyMarkup } from "@/lib/server/sales-catalog";
import {
  buildAdvisorCarsHref,
  buildAdvisorFlightHref,
  buildAdvisorTransferHref,
  extractOdFromText,
  resolveIataCode,
} from "@/lib/server/travel-search-links";
import type { SalesChatCard } from "@/types/sales-chat";
import type { PublicFlightItinerary } from "@/lib/server/flights-engine";
import {
  applyGroundTransportXor,
  type GroundTransportMode,
  type QuoteService,
} from "@/lib/sales-chat-intent";

export type QuoteTrip = {
  destination: string;
  arrivalDate?: string;
  departureDate?: string;
  nights?: number;
  people?: number;
  fromIata?: string;
  toIata?: string;
  fromCity?: string;
  flightType?: "one-way" | "round-trip";
};

export type LiveQuoteOptions = {
  /** When set, only these GDS/catalog tools run. Omitted = legacy full pipeline. */
  services?: QuoteService[];
  groundMode?: GroundTransportMode;
  flightType?: "one-way" | "round-trip";
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
  {
    keys: /rome|roma|روما|fco\b|cia\b/,
    city: "Rome",
    iata: "FCO",
    airport: "FCO Airport (Fiumicino)",
    area: "Centro Storico",
  },
  {
    keys: /paris|باريس|cdg\b|ory\b/,
    city: "Paris",
    iata: "CDG",
    airport: "CDG Airport",
    area: "Central Paris",
  },
  {
    keys: /milan|milano|ميلانو|ميلان|mxp\b|lin\b/,
    city: "Milan",
    iata: "MXP",
    airport: "MXP Airport (Malpensa)",
    area: "Duomo",
  },
  {
    keys: /dubai|دبي|dxb\b/,
    city: "Dubai",
    iata: "DXB",
    airport: "DXB Airport",
    area: "Downtown Dubai",
  },
  {
    keys: /barcelona|برشلونة|برشلونه|bcn\b/,
    city: "Barcelona",
    iata: "BCN",
    airport: "BCN Airport",
    area: "Eixample",
  },
  {
    keys: /madrid|مدريد|mad\b/,
    city: "Madrid",
    iata: "MAD",
    airport: "MAD Airport",
    area: "Centro",
  },
  {
    keys: /vienna|wien|فيينا|vie\b/,
    city: "Vienna",
    iata: "VIE",
    airport: "VIE Airport",
    area: "Innere Stadt",
  },
  {
    keys: /amsterdam|أمستردام|امستردام|ams\b/,
    city: "Amsterdam",
    iata: "AMS",
    airport: "AMS Airport",
    area: "Centrum",
  },
];

function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Accept only real calendar days. Rejects "10", "2026", "10 days", etc. */
export function validIsoDate(raw?: string | null): string {
  const m = String(raw || "")
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < 2024 || y > 2036 || mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    return "";
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (dt.getTime() < today.getTime() - 86400000) return "";
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      }
    );
  });
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
  flightType: "one-way" | "round-trip";
  dest: ReturnType<typeof resolveDest>;
} {
  const blob = `${trip.destination} ${trip.toIata || ""} ${extraText}`;
  const dest = resolveDest(blob);
  const spokenText = extractOdFromText(extraText);
  const spokenBlob = extractOdFromText(blob);
  const spoken = {
    from: spokenText.from || spokenBlob.from,
    to: spokenText.to || spokenBlob.to,
  };
  const people = Math.max(1, Math.round(Number(trip.people) || 2));
  let arrival = validIsoDate(trip.arrivalDate);
  let departure = validIsoDate(trip.departureDate);
  let nights = Math.max(0, Math.round(Number(trip.nights) || 0));
  if (nights > 60) nights = 0;
  if (!nights && arrival && departure) nights = nightsBetween(arrival, departure);
  if (!nights) nights = 6;
  if (!arrival) arrival = isoPlus(14);
  if (!departure) {
    const start = Date.parse(`${arrival}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + nights);
    departure = end.toISOString().slice(0, 10);
  }
  if (departure <= arrival) {
    const start = Date.parse(`${arrival}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + nights);
    departure = end.toISOString().slice(0, 10);
  }
  const toIata =
    spoken.to ||
    resolveIataCode(trip.toIata) ||
    dest?.iata ||
    resolveIataCode(trip.destination) ||
    "";
  const fromIata =
    spoken.from ||
    resolveIataCode(trip.fromIata || trip.fromCity) ||
    "";
  const flightType = trip.flightType === "one-way" ? "one-way" : "round-trip";
  return {
    destination: dest?.city || trip.destination || toIata || "",
    people,
    arrivalDate: arrival,
    departureDate: departure,
    nights,
    fromIata,
    toIata,
    flightType,
    dest,
  };
}

function mapLiveHotelCard(
  h: {
    id: string;
    name: string;
    city?: string;
    neighborhood?: string;
    image?: string;
    images?: string[];
    stars?: number;
    badges?: string[];
    nightly?: number | null;
    totalStay?: number | null;
    priceFrom?: number | null;
    currency?: string;
    sessionId?: string;
    masterId?: string;
    roomType?: string;
    breakfastIncluded?: boolean;
  },
  trip: ReturnType<typeof normalizeTrip>,
  alreadyMarkedUp: boolean,
  markup: number
): SalesChatCard | null {
  if (!h.name) return null;
  const nightly = Number(h.nightly) || Number(h.priceFrom) || 0;
  const stay =
    Number(h.totalStay) > 0
      ? Number(h.totalStay)
      : hotelStayPrice(nightly, trip.nights);
  if (stay <= 0) return null;
  const client = alreadyMarkedUp ? stay : applyMarkup(stay, markup);
  const qs = new URLSearchParams({
    checkIn: trip.arrivalDate,
    checkOut: trip.departureDate,
    adults: String(trip.people),
  });
  if (h.sessionId) qs.set("sid", h.sessionId);
  if (h.masterId) qs.set("master", h.masterId);
  const highlights = [
    h.roomType,
    ...(h.badges || []).slice(0, 2),
    h.breakfastIncluded ? "إفطار مشمول" : "",
  ].filter((x): x is string => Boolean(x));
  return {
    type: "hotel",
    id: h.id,
    titleAr: h.name,
    titleEn: h.name,
    subtitleAr: h.neighborhood || h.city || trip.destination,
    subtitleEn: h.neighborhood || h.city || trip.destination,
    image: pickImage(h.image || h.images?.[0]),
    basePrice: stay,
    clientPrice: client,
    currency: h.currency || "USD",
    href: `/hotels/${hotelApiSlug(h.id)}?${qs.toString()}`,
    badges: h.stars ? [`${h.stars}★`] : [],
    highlights,
    unitPrice: nightly || Math.round(stay / Math.max(1, trip.nights)),
    unitLabelAr: "لليلة",
    unitLabelEn: "per night",
    nights: trip.nights,
    source: "live",
    stars: h.stars || undefined,
    roomName: h.roomType || undefined,
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
  const query = trip.destination || trip.toIata;
  if (query) {
    try {
      const { runPublicHotelSearch } = await import("@/lib/server/hotels-search-runtime");
      const live = await withTimeout(
        runPublicHotelSearch({
          query,
          checkIn: trip.arrivalDate,
          checkOut: trip.departureDate,
          adults: trip.people,
          rooms: 1,
          page: 0,
          pageSize: 12,
          sort: "best",
          lang: "ar",
        }),
        14000
      );
      if (live?.hotels?.length) {
        cards = live.hotels
          .map((h) => mapLiveHotelCard(h, trip, true, markup))
          .filter((c): c is SalesChatCard => Boolean(c))
          .slice(0, 8);
      }
    } catch {
      warning = "hotel_search_failed";
    }
  }

  if (!cards.length && query) {
    try {
      const hotels = (
        await listHotels({
          query,
          checkIn: trip.arrivalDate,
          checkOut: trip.departureDate,
          adults: trip.people,
        })
      ).hotels;
      cards = hotels
        .map((h) =>
          mapLiveHotelCard(
            {
              id: h.id,
              name: h.name,
              city: h.city,
              neighborhood: h.neighborhood,
              image: h.image,
              images: h.images,
              stars: h.stars,
              badges: h.badges,
              nightly: h.nightly,
              totalStay: h.totalStay,
              priceFrom: h.priceFrom,
              currency: h.currency,
              roomType: h.roomType,
              breakfastIncluded: h.breakfastIncluded,
            },
            trip,
            false,
            markup
          )
        )
        .filter((c): c is SalesChatCard => Boolean(c))
        .slice(0, 8);
    } catch {
      warning = warning || "hotel_search_failed";
    }
  }

  if (!cards.length) warning = warning || "hotel_none";
  hotelCache.set(key, { at: Date.now(), cards, warning });
  return { cards, warning };
}

async function quoteTransfers(
  trip: ReturnType<typeof normalizeTrip>,
  markup: number
): Promise<SalesChatCard[]> {
  try {
    const { SeeruRideAdapter } = await import("@/lib/providers/adapters/seeru/seeruRideAdapter");
    const adapter = new SeeruRideAdapter();
    const dest = trip.dest;
    const query = dest?.iata || dest?.airport || dest?.city || trip.destination || trip.toIata;
    if (!query) return [];
    const locs = await withTimeout(adapter.searchLocations(query), 8000);
    if (!locs?.length) return [];
    const searchRes = await withTimeout(
      adapter.searchRides({
        fromPlaceId: locs[0].place_id,
        date: trip.arrivalDate,
        time: "12:00",
        mode: "transfer",
        pax: Math.max(1, trip.people),
      }),
      10000
    );
    if (!searchRes?.offers?.length) return [];
    return searchRes.offers.slice(0, 6).map((o) => ({
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
      badges: [o.car_class.title].filter(Boolean),
      highlights: [`${o.car_class.capacity} pax`],
      source: "live" as const,
    }));
  } catch {
    return [];
  }
}

async function quoteCars(
  trip: ReturnType<typeof normalizeTrip>,
  markup: number
): Promise<SalesChatCard[]> {
  const days = Math.max(1, rentalDays(trip.arrivalDate, trip.departureDate));
  const pickup = trip.dest?.airport || trip.destination || trip.toIata;
  const cars = sortFleet(
    (await listActiveInternalCars()).filter((car) =>
      matchesInternalCar(car, {
        pickup,
        date: trip.arrivalDate,
        returnDate: trip.departureDate,
        guests: String(trip.people),
      })
    )
  ).slice(0, 6);

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
      source: "catalog" as const,
    };
  });
}

function flightCardFromItinerary(
  it: PublicFlightItinerary,
  trip: ReturnType<typeof normalizeTrip>,
  href?: string
): SalesChatCard | null {
  const price = Number(it.price?.client) || 0;
  if (price <= 0) return null;
  const out = it.legs?.[0];
  const ret = it.legs?.[1];
  if (!out) return null;
  const from = out.origin?.displayCode || trip.fromIata;
  const to = out.destination?.displayCode || trip.toIata;
  const airline = it.airlines?.[0] || out.carrierName || "";
  const airlineCode = out.carrierCode || out.segments?.[0]?.airlineCode || "";
  const airlineLogo = out.segments?.[0]?.airlineLogo || "";
  const flightNumber = out.segments?.[0]?.flightNumber || "";
  return {
    type: "flight",
    id: it.id,
    titleAr: airline ? `${airline} ${from} → ${to}` : `طيران ${from} → ${to}`,
    titleEn: airline ? `${airline} ${from} → ${to}` : `Flights ${from} → ${to}`,
    subtitleAr: ret ? "ذهاب وعودة" : "اتجاه واحد",
    subtitleEn: ret ? "Round-trip" : "One-way",
    image: airlineLogo || undefined,
    basePrice: Number(it.price?.base) || price,
    clientPrice: price,
    currency: it.price?.currency || "USD",
    href,
    badges: [
      airlineCode,
      out.stopCount === 0 ? "مباشر" : `${out.stopCount} توقف`,
    ].filter(Boolean),
    highlights: [],
    source: "live",
    airline,
    airlineCode,
    airlineLogo,
    fromIata: from,
    toIata: to,
    departAt: out.departure,
    arriveAt: out.arrival,
    returnDepartAt: ret?.departure,
    returnArriveAt: ret?.arrival,
    durationMinutes: out.durationMinutes || it.durationMinutes,
    stopCount: out.stopCount ?? it.stops,
    flightNumber,
    tripType: ret ? "round-trip" : "one-way",
  };
}

async function quoteFlights(
  trip: ReturnType<typeof normalizeTrip>
): Promise<{ cards: SalesChatCard[]; warning?: string; href?: string }> {
  const roundTrip = trip.flightType === "round-trip";
  const href = buildAdvisorFlightHref({
    fromIata: trip.fromIata,
    toIata: trip.toIata,
    date: trip.arrivalDate,
    returnDate: roundTrip ? trip.departureDate : undefined,
    guests: trip.people,
    flightType: trip.flightType,
  });
  if (!trip.fromIata || !trip.toIata || !validIsoDate(trip.arrivalDate)) {
    return { cards: [], warning: "flight_need_origin_dates", href };
  }
  try {
    const { runFlightSearch } = await import("@/lib/server/flights-engine");
    const result = await withTimeout(
      runFlightSearch({
        originSkyId: trip.fromIata,
        destinationSkyId: trip.toIata,
        originEntityId: "",
        destinationEntityId: "",
        date: trip.arrivalDate,
        returnDate: roundTrip ? trip.departureDate : undefined,
        adults: trip.people,
        cabinClass: "economy",
        currency: "USD",
        sortBy: "cheapest",
      }),
      16000
    );
    if (!result?.ok) {
      return { cards: [], warning: "flight_search_failed", href };
    }
    const cards = result.session.itineraries
      .map((it) => flightCardFromItinerary(it, trip, href))
      .filter((c): c is SalesChatCard => Boolean(c))
      .slice(0, 8);
    if (!cards.length) {
      return { cards: [], warning: "flight_no_offers", href };
    }
    return { cards, href };
  } catch {
    return { cards: [], warning: "flight_search_failed", href };
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

/** Named GDS/catalog tools the sales-chat router may invoke. */
export async function invokeSalesChatInventoryTool(
  service: QuoteService,
  trip: ReturnType<typeof normalizeTrip>,
  markup: number
): Promise<{ cards: SalesChatCard[]; warning?: string; href?: string }> {
  if (service === "flight") return quoteFlights(trip);
  if (service === "hotel") return quoteHotels(trip, markup);
  if (service === "car") {
    return { cards: await quoteCars(trip, markup) };
  }
  return { cards: await quoteTransfers(trip, markup) };
}

export async function buildLiveQuote(
  raw: QuoteTrip,
  markup: number,
  extraText = "",
  options?: LiveQuoteOptions
): Promise<LiveQuote | null> {
  const destText = String(raw.destination || "").trim();
  if (!destText && !raw.toIata && !raw.fromIata) return null;

  const trip = normalizeTrip(
    {
      ...raw,
      flightType: options?.flightType || raw.flightType || "round-trip",
    },
    extraText
  );
  if (!trip.destination && !trip.toIata) return null;
  const warnings: string[] = [];
  const want = new Set<QuoteService>(
    options?.services ?? ["flight", "hotel", "car", "transfer"]
  );

  const [hotels, cars, flights, transfers] = await Promise.all([
    want.has("hotel")
      ? invokeSalesChatInventoryTool("hotel", trip, markup)
      : Promise.resolve({ cards: [] as SalesChatCard[] }),
    want.has("car")
      ? invokeSalesChatInventoryTool("car", trip, markup)
      : Promise.resolve({ cards: [] as SalesChatCard[] }),
    want.has("flight")
      ? invokeSalesChatInventoryTool("flight", trip, markup)
      : Promise.resolve({ cards: [] as SalesChatCard[] }),
    want.has("transfer")
      ? invokeSalesChatInventoryTool("transfer", trip, markup)
      : Promise.resolve({ cards: [] as SalesChatCard[] }),
  ]);
  if (hotels.warning) warnings.push(hotels.warning);
  if (flights.warning) warnings.push(flights.warning);
  if (want.has("flight") && !flights.cards.length && !flights.warning) {
    warnings.push("flight_no_offers");
  }

  const groundMode =
    options?.groundMode ??
    (want.has("car") && want.has("transfer")
      ? "both"
      : want.has("car")
        ? "car"
        : want.has("transfer")
          ? "transfer"
          : "none");
  const cards = applyGroundTransportXor(
    [...flights.cards, ...hotels.cards, ...transfers.cards, ...cars.cards],
    groundMode
  );
  const selected = pickSelected(cards);
  const totalClientPrice = selected.reduce((s, c) => s + (c.clientPrice || 0), 0);
  const pendingTypes = selected
    .filter((c) => c.pricePending || c.clientPrice <= 0)
    .map((c) => c.type);

  const airport = trip.dest?.airport || (trip.toIata ? `${trip.toIata} Airport` : "");
  const area = trip.dest?.area || trip.destination;

  return {
    cards,
    selected,
    totalClientPrice,
    pendingTypes,
    flightHref: want.has("flight")
      ? flights.href || flights.cards[0]?.href
      : undefined,
    transferHref:
      want.has("transfer") && airport && area
      ? buildAdvisorTransferHref({
          from: airport,
          to: area,
          date: trip.arrivalDate,
          guests: trip.people,
        })
      : undefined,
    carsHref:
      want.has("car") && (trip.toIata || trip.destination)
      ? buildAdvisorCarsHref({
          iata: trip.toIata,
          city: trip.destination,
          date: trip.arrivalDate,
          returnDate: trip.departureDate,
          guests: trip.people,
        })
      : undefined,
    hotelsHref:
      want.has("hotel") && trip.destination
      ? `/hotels?q=${encodeURIComponent(trip.destination)}&checkIn=${trip.arrivalDate}&checkOut=${trip.departureDate}&adults=${trip.people}`
      : undefined,
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
  const real = (c: SalesChatCard) => c.source === "live" || c.source === "catalog";
  if (!live) return aiCards.filter(real);
  return live.cards.filter(real);
}
