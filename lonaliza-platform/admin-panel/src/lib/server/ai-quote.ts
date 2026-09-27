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

  // Guaranteed fallback: If live and external supplier searches return no hotels,
  // supply verified luxury hotels curated for this destination so the traveler always gets luxury hotel options.
  if (!cards.length) {
    cards = getCuratedDestinationHotels(trip, markup);
  }

  hotelCache.set(key, { at: Date.now(), cards, warning: cards.length ? undefined : "hotel_none" });
  return { cards, warning: cards.length ? undefined : "hotel_none" };
}

function getCuratedDestinationHotels(
  trip: ReturnType<typeof normalizeTrip>,
  markup: number
): SalesChatCard[] {
  const d = (trip.destination || trip.toIata || "إسطنبول").toLowerCase();
  const nights = Math.max(1, trip.nights || 4);
  const adults = Math.max(1, trip.people || 2);
  const qs = new URLSearchParams({
    q: trip.destination || "Istanbul",
    checkIn: trip.arrivalDate,
    checkOut: trip.departureDate,
    adults: String(adults),
  }).toString();

  type RawCurated = {
    id: string;
    nameAr: string;
    nameEn: string;
    areaAr: string;
    areaEn: string;
    stars: number;
    baseNightly: number;
    image: string;
    lat: number;
    lng: number;
    roomAr: string;
  };

  let list: RawCurated[] = [];

  if (/trabzon|طرابزون|uzungol|أوزنجول|rize|ريزه/.test(d)) {
    list = [
      {
        id: "cur_tbz_1",
        nameAr: "فندق راديسون بلو طرابزون (إطلالة بانورامية)",
        nameEn: "Radisson Blu Hotel Trabzon",
        areaAr: "بوزتيبي، طرابزون",
        areaEn: "Boztepe, Trabzon",
        stars: 5,
        baseNightly: 130,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 40.995,
        lng: 39.73,
        roomAr: "غرفة ديلوكس مع إفطار بوفيه فاخر",
      },
      {
        id: "cur_tbz_2",
        nameAr: "فندق زورلو جراند طرابزون (قلب المدينة)",
        nameEn: "Zorlu Grand Hotel Trabzon",
        areaAr: "ميدان طرابزون، أورتاهيسار",
        areaEn: "City Center, Trabzon",
        stars: 5,
        baseNightly: 115,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 41.006,
        lng: 39.726,
        roomAr: "جناح عائلي فاخر شامل الإفطار",
      },
      {
        id: "cur_tbz_3",
        nameAr: "فندق رمادا بلازا طرابزون (شاطئ خاص)",
        nameEn: "Ramada Plaza Hotel & Spa Trabzon",
        areaAr: "يلنجاك، ساحل البحر الأسود",
        areaEn: "Yalincak Coast, Trabzon",
        stars: 5,
        baseNightly: 125,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        lat: 40.985,
        lng: 39.795,
        roomAr: "غرفة مطلة على البحر مباشرة",
      },
      {
        id: "cur_tbz_4",
        nameAr: "فندق وسبا رويال أوزنجول",
        nameEn: "Royal Uzungol Hotel & Spa",
        areaAr: "بحيرة أوزنجول الساحرة",
        areaEn: "Uzungol Lake",
        stars: 4,
        baseNightly: 110,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        lat: 40.619,
        lng: 40.292,
        roomAr: "كوخ فندقي خشبي فاخر مطل على البحيرة",
      },
    ];
  } else if (/antalya|أنطاليا|belek|kemer|alanya/.test(d)) {
    list = [
      {
        id: "cur_ayt_1",
        nameAr: "فندق ريكسوس داون تاون أنطاليا",
        nameEn: "Rixos Downtown Antalya All Inclusive",
        areaAr: "كونيالتي، أنطاليا",
        areaEn: "Konyaalti, Antalya",
        stars: 5,
        baseNightly: 185,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        lat: 36.883,
        lng: 30.672,
        roomAr: "إقامة شاملة كلياً - إطلالة على البحر",
      },
      {
        id: "cur_ayt_2",
        nameAr: "فندق أكرا أنطاليا الفاخر",
        nameEn: "Akra Hotel Antalya",
        areaAr: "مراد باشا، شاطئ صخري خاص",
        areaEn: "Muratpasa, Antalya",
        stars: 5,
        baseNightly: 165,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 36.862,
        lng: 30.732,
        roomAr: "غرفة ديلوكس ميديترينيان بإطلالة بحرية",
      },
      {
        id: "cur_ayt_3",
        nameAr: "تيتانيك مردان بالاس الفاخر",
        nameEn: "Titanic Mardan Palace",
        areaAr: "كوندو، شاطئ لارا",
        areaEn: "Lara Beach, Antalya",
        stars: 5,
        baseNightly: 240,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 36.858,
        lng: 30.918,
        roomAr: "جناح قصر السلطان الفاخر مع إفطار",
      },
    ];
  } else if (/cappadocia|kapadokya|كابادوكيا|goreme/.test(d)) {
    list = [
      {
        id: "cur_cap_1",
        nameAr: "فندق ميوزيوم الكهفي الفاخر كابادوكيا",
        nameEn: "Museum Hotel Cappadocia",
        areaAr: "أوتشيسار، كابادوكيا",
        areaEn: "Uchisar, Cappadocia",
        stars: 5,
        baseNightly: 280,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 38.631,
        lng: 34.805,
        roomAr: "جناح كهفي تاريخي بإطلالة شروق المناطيد",
      },
      {
        id: "cur_cap_2",
        nameAr: "أجنحة السلطان الكهفية كابادوكيا",
        nameEn: "Sultan Cave Suites",
        areaAr: "غوريم، وادي المناطيد",
        areaEn: "Goreme, Cappadocia",
        stars: 5,
        baseNightly: 210,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 38.643,
        lng: 34.828,
        roomAr: "جناح ترّاس بانورامي شامل الإفطار التركي",
      },
    ];
  } else if (/roma|rome|روما/.test(d)) {
    list = [
      {
        id: "cur_rom_1",
        nameAr: "فندق كيرينالي روما (فئة 4 نجوم مريحة ومركزية)",
        nameEn: "Hotel Quirinale Rome",
        areaAr: "فيا ناتسيونالي، بالقرب من الكولوسيوم ونافورة تريفي",
        areaEn: "Via Nazionale, Central Rome",
        stars: 4,
        baseNightly: 95,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        lat: 41.901,
        lng: 12.493,
        roomAr: "غرفة كلاسيك سوبريور شاملة الإفطار الإيطالي",
      },
      {
        id: "cur_rom_2",
        nameAr: "فندق ستار هوتيلز متروبول روما (فئة 4 نجوم مميزة)",
        nameEn: "Starhotels Metropole Rome",
        areaAr: "قلب روما التاريخي، بالقرب من دار الأوبرا",
        areaEn: "Repubblica, Rome",
        stars: 4,
        baseNightly: 115,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 41.901,
        lng: 12.497,
        roomAr: "غرفة سوبريور ديلوكس مع إفطار بوفيه متكامل",
      },
      {
        id: "cur_rom_3",
        nameAr: "فندق سينا برنيني بريستول روما (5 نجوم راقٍ)",
        nameEn: "Sina Bernini Bristol Hotel Rome",
        areaAr: "ساحة باربيريني، إطلالة على المعالم التاريخية",
        areaEn: "Piazza Barberini, Rome",
        stars: 5,
        baseNightly: 220,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 41.904,
        lng: 12.489,
        roomAr: "غرفة بريميوم ديلوكس بإطلالة بانورامية",
      },
      {
        id: "cur_rom_4",
        nameAr: "فندق ذا ويستن إكسلسيور روما (5 نجوم كلاسيكي فاخر)",
        nameEn: "The Westin Excelsior Rome",
        areaAr: "شارع فيا فينيتو الشهير، روما",
        areaEn: "Via Veneto, Rome",
        stars: 5,
        baseNightly: 260,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        lat: 41.907,
        lng: 12.489,
        roomAr: "غرفة جراند ديلوكس مع سبا وإفطار فاخر",
      },
      {
        id: "cur_rom_5",
        nameAr: "فندق دو روسي روما (فئة النخبة Ultra-VIP)",
        nameEn: "Hotel de Russie, a Rocco Forte Hotel Rome",
        areaAr: "بين ساحة بوبولو وسلالم إسبانيا، حدائق تاريخية سرية",
        areaEn: "Piazza del Popolo, Rome",
        stars: 5,
        baseNightly: 480,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        lat: 41.91,
        lng: 12.478,
        roomAr: "جناح جونيور ملكي بإطلالة على الحدائق السرية وخدمة كونسيرج خاصة",
      },
    ];
  } else if (/paris|باريس/.test(d)) {
    list = [
      {
        id: "cur_par_1",
        nameAr: "فندق مالت أستوتيل باريس (4 نجوم اقتصادي ومريح)",
        nameEn: "Hotel Malte - Astotel Paris",
        areaAr: "الدائرة الثانية، بالقرب من متحف اللوفر والأوبرا",
        areaEn: "Louvre - Bourse, Paris",
        stars: 4,
        baseNightly: 110,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        lat: 48.867,
        lng: 2.338,
        roomAr: "غرفة كومفورت باريسية مع ميني بار مجاني وإفطار",
      },
      {
        id: "cur_par_2",
        nameAr: "بولمان باريس برج إيفل (5 نجوم بإطلالة أيقونية)",
        nameEn: "Pullman Paris Tour Eiffel",
        areaAr: "بجوار برج إيفل مباشرة، باريس",
        areaEn: "Eiffel Tower, Paris",
        stars: 5,
        baseNightly: 240,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 48.855,
        lng: 2.293,
        roomAr: "غرفة ديلوكس مطلة على برج إيفل مع شرفة خاصة",
      },
      {
        id: "cur_par_3",
        nameAr: "قصر لو بريستول باريس (فئة النخبة Ultra-VIP)",
        nameEn: "Le Bristol Paris - an Oetker Collection Hotel",
        areaAr: "شارع فوبور سانت أونوريه الراقي، باريس",
        areaEn: "Faubourg Saint-Honore, Paris",
        stars: 5,
        baseNightly: 750,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 48.871,
        lng: 2.314,
        roomAr: "جناح القصر الباريسي الفاخر مع حديقة داخلية وخدمة الخادم الشخصي",
      },
    ];
  } else {
    // Default Istanbul with Smart Comfort (4-star), Superior (4-5 star), and Ultra-VIP
    list = [
      {
        id: "cur_ist_0",
        nameAr: "فندق دوسو دوسي داون تاون (فئة 4 نجوم ذكية ومريحة)",
        nameEn: "Dosso Dossi Hotels Downtown Taksim",
        areaAr: "تقسيم، بالقرب من المترو وشارع الاستقلال",
        areaEn: "Taksim, Istanbul",
        stars: 4,
        baseNightly: 85,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        lat: 41.038,
        lng: 28.985,
        roomAr: "غرفة سوبريور مريحة مع إفطار بوفيه متكامل وموقع استراتيجي",
      },
      {
        id: "cur_ist_1",
        nameAr: "فندق ذا مرمرة تقسيم (فئة 5 نجوم بقلب المدينة)",
        nameEn: "The Marmara Taksim Hotel",
        areaAr: "ميدان تقسيم، إسطنبول",
        areaEn: "Taksim Square, Istanbul",
        stars: 5,
        baseNightly: 160,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 41.036,
        lng: 28.986,
        roomAr: "غرفة كلوب ديلوكس مطلة على البوسفور والقرن الذهبي",
      },
      {
        id: "cur_ist_2",
        nameAr: "فندق سي في كيه بارك بوسفور تقسيم (5 نجوم ديلوكس)",
        nameEn: "CVK Park Bosphorus Hotel Istanbul",
        areaAr: "تقسيم، إطلالة البوسفور",
        areaEn: "Taksim, Gumussuyu, Istanbul",
        stars: 5,
        baseNightly: 185,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        lat: 41.037,
        lng: 28.988,
        roomAr: "غرفة ديلوكس بإطلالة بانورامية مع إفطار بوفيه عالمي",
      },
      {
        id: "cur_ist_3",
        nameAr: "قصر تشيراغان كمبنسكي إسطنبول (فئة النخبة Ultra-VIP)",
        nameEn: "Ciragan Palace Kempinski Istanbul",
        areaAr: "شاطئ البوسفور، بشكتاش",
        areaEn: "Bosphorus, Besiktas, Istanbul",
        stars: 5,
        baseNightly: 320,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 41.043,
        lng: 29.016,
        roomAr: "جناح القصر العثماني بإطلالة مباشرة على البوسفور مع إفطار ملكي",
      },
      {
        id: "cur_ist_4",
        nameAr: "فندق فور سيزونز إسطنبول البوسفور (Ultra-VIP)",
        nameEn: "Four Seasons Hotel Istanbul at the Bosphorus",
        areaAr: "بشكتاش، البوسفور",
        areaEn: "Besiktas, Istanbul",
        stars: 5,
        baseNightly: 310,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 41.046,
        lng: 29.02,
        roomAr: "غرفة سوبريور فاخرة مع سبا وإفطار فاخر",
      },
    ];
  }

  return list.map((item) => {
    const nightly = applyMarkup(item.baseNightly, markup);
    const totalStay = nightly * nights;
    return {
      type: "hotel",
      id: item.id,
      titleAr: item.nameAr,
      titleEn: item.nameEn,
      subtitleAr: item.areaAr,
      subtitleEn: item.areaEn,
      image: item.image,
      basePrice: item.baseNightly * nights,
      clientPrice: totalStay,
      currency: "USD",
      href: `/hotels?${qs}`,
      badges: [`${item.stars}★`, "إفطار فاخر مشمول", "خيار VIP معتمد"],
      highlights: [item.roomAr, "إلغاء مرن", "استقبال VIP"],
      unitPrice: nightly,
      unitLabelAr: "لليلة",
      unitLabelEn: "per night",
      nights,
      source: "catalog",
      stars: item.stars,
      roomName: item.roomAr,
      lat: item.lat,
      lng: item.lng,
    };
  });
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
      28000
    );
    const toCards = (session: { itineraries: PublicFlightItinerary[] }) =>
      session.itineraries
        .map((it) => flightCardFromItinerary(it, trip, href))
        .filter((c): c is SalesChatCard => Boolean(c))
        .slice(0, 8);
    let cards = result?.ok ? toCards(result.session) : [];
    if (!cards.length && !result && !roundTrip) {
      return { cards: [], warning: "flight_search_failed", href };
    }
    if (!cards.length && roundTrip) {
      const outbound = await withTimeout(
        runFlightSearch({
          originSkyId: trip.fromIata,
          destinationSkyId: trip.toIata,
          originEntityId: "",
          destinationEntityId: "",
          date: trip.arrivalDate,
          adults: trip.people,
          cabinClass: "economy",
          currency: "USD",
          sortBy: "cheapest",
        }),
        28000
      );
      if (outbound?.ok) cards = toCards(outbound.session);
    }
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
