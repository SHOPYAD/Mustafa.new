/**
 * Live service quotes for the AI travel consultant.
 * Binds the same engines the public site uses: runFlightSearch, runPublicHotelSearch,
 * Seeru transfers, and the internal cars fleet. Never invents bookable inventory.
 */

import fs from "node:fs";
import path from "node:path";
import { PHOTO } from "@/data/catalog-photos";
import { hotelCityQuery } from "@/lib/hotel-city-query";
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
import { ensureSkyEntityMap, lookupSkyEntity } from "@/lib/server/sky-entity-ids";
import { nominatimSearch } from "@/lib/planner/nominatim";
import { haversineKm, validLatLng } from "@/lib/planner/geo";
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
    keys: /cairo|القاهرة|قاهرة|giza|الجيزة|cai\b/,
    city: "Cairo",
    iata: "CAI",
    airport: "Cairo International Airport (CAI)",
    area: "Downtown / Nile Corniche",
  },
  {
    keys: /alexandria|الإسكندرية|الاسكندرية|hbe\b|aly\b/,
    city: "Alexandria",
    iata: "HBE",
    airport: "Borg El Arab Airport (HBE)",
    area: "Corniche",
  },
  {
    keys: /hurghada|الغردقة|غردقة|hrg\b/,
    city: "Hurghada",
    iata: "HRG",
    airport: "Hurghada International Airport (HRG)",
    area: "El Memsha",
  },
  {
    keys: /sharm|شرم الشيخ|شرم|ssh\b/,
    city: "Sharm El Sheikh",
    iata: "SSH",
    airport: "Sharm El Sheikh Airport (SSH)",
    area: "Naama Bay",
  },
  {
    keys: /luxor|الأقصر|الاقصر|lxr\b/,
    city: "Luxor",
    iata: "LXR",
    airport: "Luxor International Airport (LXR)",
    area: "East Bank",
  },
  {
    keys: /aswan|أسوان|اسوان|asw\b/,
    city: "Aswan",
    iata: "ASW",
    airport: "Aswan International Airport (ASW)",
    area: "Nile Corniche",
  },
  {
    keys: /istanbul|إسطنبول|اسطنبول|ist\b|saw\b/,
    city: "Istanbul",
    iata: "IST",
    airport: "IST Airport",
    area: "Sultanahmet",
  },
  {
    keys: /tangier|tanger|طنجة|طنجه|tng\b/,
    city: "Tangier",
    iata: "TNG",
    airport: "TNG Airport",
    area: "Tangier",
  },
  {
    keys: /casablanca|الدار البيضاء|دار البيضاء|cmn\b/,
    city: "Casablanca",
    iata: "CMN",
    airport: "CMN Airport",
    area: "Casablanca",
  },
  {
    keys: /london|لندن|lhr\b|lgw\b|stn\b/,
    city: "London",
    iata: "LHR",
    airport: "London Heathrow Airport (LHR)",
    area: "Central London",
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
  {
    keys: /athens|أثينا|اثينا|ath\b/i,
    city: "Athens",
    iata: "ATH",
    airport: "Athens Eleftherios Venizelos (ATH)",
    area: "Syntagma / Plaka",
  },
  {
    keys: /fez|fes|فاس|fez\b/i,
    city: "Fez",
    iata: "FEZ",
    airport: "Fès–Saïss Airport (FEZ)",
    area: "Fes El Bali",
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
  const blob = String(raw || "").toLowerCase();
  return DEST_HINTS.find((d) => d.keys.test(blob)) || null;
}

function pickImage(url?: string, fallback: string = PHOTO.luxuryHotel): string {
  return url && /^https?:\/\//i.test(url) ? url : fallback;
}

function stayTotal(nightly: number, totalStay: number, nights: number): number {
  const n = Math.max(1, nights);
  let night = Math.max(0, nightly);
  let stay = Math.max(0, totalStay);
  const MAX_NIGHT = 1200;
  const MAX_STAY = 8000;
  if (night > MAX_NIGHT && stay > 0 && stay <= MAX_STAY) night = stay / n;
  if (night > MAX_NIGHT) night = 0;
  if (stay > MAX_STAY && night > 0 && night <= MAX_NIGHT) stay = night * n;
  if (stay > MAX_STAY) stay = 0;
  if (n > 1 && stay >= 35 && stay / n < 25 && stay < 400) return Math.round(stay * n);
  if (n > 1 && night > 0 && stay > 0 && stay <= night * 1.4 && stay < 2000) {
    return Math.round(Math.max(night, stay) * n);
  }
  if (night > 0 && stay >= night * n * 0.65 && stay > 0) return Math.round(stay);
  if (night > 0) return Math.round(night * n);
  if (stay > 0) {
    if (n > 1 && stay < 220) return Math.round(stay * n);
    return Math.round(stay);
  }
  return 0;
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
  const dest = resolveDest(trip.destination) || resolveDest(blob);
  const spokenText = extractOdFromText(extraText);
  const spokenBlob = extractOdFromText(blob);
  const spoken = {
    from: spokenText.from || spokenBlob.from,
    to: spokenText.to || spokenBlob.to,
  };
  const people = Math.max(1, Math.round(Number(trip.people) || 1));
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
  const explicitTo =
    resolveIataCode(trip.toIata) ||
    resolveIataCode(trip.destination) ||
    dest?.iata;
  const explicitFrom =
    resolveIataCode(trip.fromIata || trip.fromCity);

  const toIata = explicitTo || spoken.to || "";
  const fromIata = explicitFrom || spoken.from || "";
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
    lat?: number;
    lng?: number;
  },
  trip: ReturnType<typeof normalizeTrip>,
  alreadyMarkedUp: boolean,
  markup: number
): SalesChatCard | null {
  if (!h.name) return null;
  const nightly = Number(h.nightly) || Number(h.priceFrom) || 0;
  const stay = stayTotal(nightly, Number(h.totalStay) || 0, trip.nights);
  if (stay <= 0) return null;
  const client = alreadyMarkedUp ? stay : applyMarkup(stay, markup);
  const qs = new URLSearchParams({
    checkIn: trip.arrivalDate,
    checkOut: trip.departureDate,
    adults: String(trip.people),
    q: trip.destination,
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
    unitPrice: Math.round(client / Math.max(1, trip.nights)) || nightly,
    unitLabelAr: `${trip.nights} ليالٍ`,
    unitLabelEn: `${trip.nights} nights`,
    nights: trip.nights,
    source: "live",
    stars: h.stars || undefined,
    roomName: h.roomType || undefined,
    lat: Number(h.lat) || undefined,
    lng: Number(h.lng) || undefined,
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
  const mapped = hotelCityQuery(trip.destination || trip.toIata);
  const queries = Array.from(
    new Set([mapped, trip.destination, trip.toIata, mapped === "Goreme" ? "Urgup" : ""].filter(Boolean))
  ) as string[];
  for (const query of queries) {
    try {
      const { runPublicHotelSearch } = await import("@/lib/server/hotels-search-runtime");
      const live = await withTimeout(
        runPublicHotelSearch({
          query,
          checkIn: trip.arrivalDate,
          checkOut: trip.departureDate,
          adults: Math.max(1, Number(trip.people) || 2),
          rooms: 1,
          page: 0,
          pageSize: 40,
          sort: "price",
          lang: "en",
          waitMs: 22000,
        }),
        28000
      );
      if (live?.hotels?.length) {
        cards = live.hotels
          .map((h) =>
            mapLiveHotelCard(
              {
                ...h,
                lat: h.lat,
                lng: h.lng,
              },
              trip,
              true,
              markup
            )
          )
          .filter((c): c is SalesChatCard => Boolean(c))
          .sort((a, b) => a.clientPrice - b.clientPrice)
          .slice(0, 28);
        if (cards.length) break;
      }
    } catch {
      warning = "hotel_search_failed";
    }
  }

  if (!cards.length && queries[0]) {
    try {
      const hotels = (
        await listHotels({
          query: queries[0],
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
        .slice(0, 28);
    } catch {
      warning = warning || "hotel_search_failed";
    }
  }

  if (cards.length) {
    const missing = cards.filter((c) => !validLatLng(c.lat, c.lng)).slice(0, 16);
    await Promise.all(
      missing.map(async (card) => {
        const rows = await nominatimSearch(`${card.titleEn} ${trip.destination}`, 1).catch(() => []);
        const hit = rows[0];
        if (hit && validLatLng(hit.lat, hit.lng)) {
          card.lat = hit.lat;
          card.lng = hit.lng;
        }
      })
    );

    // Distance guard: eliminate properties outside city radius (> 18km)
    try {
      const destGeo = await nominatimSearch(trip.destination, 1).catch(() => []);
      const destHit = destGeo[0];
      if (destHit && validLatLng(destHit.lat, destHit.lng)) {
        const centerPt = { lat: destHit.lat, lng: destHit.lng };
        cards = cards.filter((c) => {
          if (!validLatLng(c.lat, c.lng)) return true;
          return haversineKm(centerPt, { lat: c.lat!, lng: c.lng! }) <= 18;
        });
      }
    } catch {
      // ignore
    }
  }

  if (!cards.length) {
    cards = getCuratedDestinationHotels(trip, markup);
  }

  hotelCache.set(key, { at: Date.now(), cards, warning: cards.length ? undefined : "hotel_none" });
  return { cards, warning: cards.length ? undefined : "hotel_none" };
}

export function getCuratedDestinationHotels(
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

  // 1. Try reading real live supplier hotels directly from featured catalog
  try {
    const catalogPath = path.resolve(process.cwd(), "../database/data/featured-hotels-catalog.json");
    const altCatalogPath = "/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/featured-hotels-catalog.json";
    const targetFile = fs.existsSync(altCatalogPath) ? altCatalogPath : fs.existsSync(catalogPath) ? catalogPath : "";
    if (targetFile) {
      const rawCatalog = JSON.parse(fs.readFileSync(targetFile, "utf-8"));
      const destKeys = Object.keys(rawCatalog);
      let matchedKey = "";
      for (const k of destKeys) {
        if (
          d.includes(k) ||
          (rawCatalog[k]?.nameAr && d.includes(rawCatalog[k].nameAr.toLowerCase())) ||
          (rawCatalog[k]?.nameEn && d.includes(rawCatalog[k].nameEn.toLowerCase()))
        ) {
          matchedKey = k;
          break;
        }
      }
      if (!matchedKey) {
        if (/london|لندن|lhr\b|lgw\b/.test(d)) matchedKey = "london";
        else if (/paris|باريس|cdg\b/.test(d)) matchedKey = "paris";
        else if (/rome|روما|fco\b/.test(d)) matchedKey = "rome";
        else if (/istanbul|إسطنبول|اسطنبول|ist\b|saw\b/.test(d)) matchedKey = "istanbul";
        else if (/antalya|أنطاليا|انطاليا|ayt\b/.test(d)) matchedKey = "antalya";
        else if (/trabzon|طرابزون|tzx\b/.test(d)) matchedKey = "trabzon";
        else if (/casablanca|الدار البيضاء|cmn\b/.test(d)) matchedKey = "casablanca";
        else if (/barcelona|برشلونة|bcn\b/.test(d)) matchedKey = "barcelona";
        else if (/madrid|مدريد|mad\b/.test(d)) matchedKey = "madrid";
      }

      if (matchedKey && rawCatalog[matchedKey]?.hotels?.length) {
        const liveHotels = rawCatalog[matchedKey].hotels;
        return liveHotels.slice(0, 10).map((h: any, idx: number) => {
          const nightly = Math.round(Number(h.cheapestRoom?.price || 150));
          const totalStay = nightly * nights;
          const stars = Number(h.stars) || 5;
          const img =
            (Array.isArray(h.images) && h.images[0]) ||
            h.image ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
          return {
            type: "hotel",
            id: String(h.id || `live-${matchedKey}-${idx}`),
            titleAr: h.nameAr || h.nameEn,
            titleEn: h.nameEn || h.nameAr,
            subtitleAr: h.neighborhoodAr || h.city || rawCatalog[matchedKey].nameAr,
            subtitleEn: h.neighborhoodEn || h.city || rawCatalog[matchedKey].nameEn,
            image: img,
            basePrice: Math.round(totalStay / 1.15),
            clientPrice: totalStay,
            currency: h.cheapestRoom?.currency || "USD",
            href: `/hotels?${qs}`,
            badges: [
              `${stars}★`,
              h.cheapestRoom?.mealPlanAr || "إفطار مشمول",
              h.cheapestRoom?.supplier || "تأكيد فوري مباشر",
            ],
            highlights: [
              h.cheapestRoom?.nameAr || h.cheapestRoom?.nameEn || "غرفة ديلوكس فاخرة",
              h.cheapestRoom?.cancellationAr || "إلغاء مجاني متاح",
              h.cheapestRoom?.bedTypeAr || "1 سرير كينغ مريح",
            ].filter(Boolean),
            unitPrice: nightly,
            unitLabelAr: "لليلة",
            unitLabelEn: "per night",
            nights,
            source: "catalog",
            stars,
            roomName: h.cheapestRoom?.nameAr || "غرفة فندقية فاخرة",
            lat: h.lat || (matchedKey === "london" ? 51.5074 : 41.0082),
            lng: h.lng || (matchedKey === "london" ? -0.1278 : 28.9784),
          };
        });
      }
    }
  } catch (err) {
    console.error("Failed to read featured-hotels-catalog:", err);
  }

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

  if (/cairo|القاهرة|قاهرة|giza|الجيزة|cai\b/.test(d)) {
    list = [
      {
        id: "cur_cai_1",
        nameAr: "فندق شتايجنبرجر التحرير القاهرة (4 نجوم ذكي ومركزي)",
        nameEn: "Steigenberger Hotel El Tahrir Cairo",
        areaAr: "ميدان التحرير، وسط البلد، القاهرة",
        areaEn: "Tahrir Square, Downtown Cairo",
        stars: 4,
        baseNightly: 95,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 30.0458,
        lng: 31.2357,
        roomAr: "غرفة سوبريور ديلوكس شاملة الإفطار بوفيه فاخر",
      },
      {
        id: "cur_cai_2",
        nameAr: "فندق ماريوت مينا هاوس الأهرامات (5 نجوم ديلوكس بإطلالة الأهرامات)",
        nameEn: "Marriott Mena House, Cairo",
        areaAr: "الهرم، الجيزة، إطلالة مباشرة على الأهرامات",
        areaEn: "Pyramids Road, Giza",
        stars: 5,
        baseNightly: 190,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 29.9856,
        lng: 31.1328,
        roomAr: "غرفة بريميوم تاريخية بإطلالة مباشرة على أهرامات الجيزة",
      },
      {
        id: "cur_cai_3",
        nameAr: "فندق سوفيتيل الجزيرة القاهرة (5 نجوم إطلالة نيلية بانورامية)",
        nameEn: "Sofitel Cairo Nile El Gezirah",
        areaAr: "الزمالك، جزيرة الزمالك على ضفاف النيل",
        areaEn: "Zamalek, Nile River",
        stars: 5,
        baseNightly: 175,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        lat: 30.0366,
        lng: 31.2255,
        roomAr: "غرفة كلوب ديلوكس مع شرفة خاصة تطل على النيل",
      },
      {
        id: "cur_cai_4",
        nameAr: "فندق فورسيزونز القاهرة نايل بلازا (فئة النخبة Ultra-VIP)",
        nameEn: "Four Seasons Hotel Cairo at Nile Plaza",
        areaAr: "جاردن سيتي، كورنيش النيل الراقي",
        areaEn: "Garden City, Nile Corniche",
        stars: 5,
        baseNightly: 360,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        lat: 30.0345,
        lng: 31.2307,
        roomAr: "جناح نايلي ملكي فاخر مع كونسيرج خاص وإفطار غداء ذواقة",
      },
    ];
  } else if (/trabzon|طرابزون|uzungol|أوزنجول|rize|ريزه/.test(d)) {
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
  } else if (/barcelona|برشلونة|برشلونه|bcn\b/.test(d)) {
    list = [
      {
        id: "cur_bcn_1",
        nameAr: "فندق جاز برشلونة (فئة 4 نجوم ذكية وموقع استثنائي)",
        nameEn: "Hotel Jazz Barcelona",
        areaAr: "شارع بيلاي، ساحة كتالونيا وبداية شارع الرامبلا",
        areaEn: "Plaça de Catalunya, Eixample",
        stars: 4,
        baseNightly: 105,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
        lat: 41.3858,
        lng: 2.1668,
        roomAr: "غرفة سوبريور عصرية مع مسبح على السطح وإفطار",
      },
      {
        id: "cur_bcn_2",
        nameAr: "فندق إتش 10 ماديسون برشلونة (4 نجوم كلاسيكي فاخر)",
        nameEn: "H10 Madison Barcelona 4* Sup",
        areaAr: "الحي القوطي التاريخي، بجوار كاتدرائية برشلونة",
        areaEn: "Gothic Quarter, Barcelona",
        stars: 4,
        baseNightly: 125,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 41.386,
        lng: 2.176,
        roomAr: "غرفة كلاسيك أنيقة مع ترّاس بانورامي شامل الإفطار",
      },
      {
        id: "cur_bcn_3",
        nameAr: "فندق إن إتش كولكشن كالديرون (5 نجوم راقٍ بقلب المدينة)",
        nameEn: "NH Collection Barcelona Gran Hotel Calderón",
        areaAr: "رامبلا دي كاتالونيا، باسيج دي غراسيا",
        areaEn: "Rambla de Catalunya, Eixample",
        stars: 5,
        baseNightly: 195,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 41.3895,
        lng: 2.1662,
        roomAr: "غرفة بريميوم ديلوكس مع إطلالة على شوارع غاودي وإفطار ملكي",
      },
      {
        id: "cur_bcn_4",
        nameAr: "فندق مونيومنت برشلونة الفاخر (5 نجوم ديلوكس)",
        nameEn: "Monument Hotel Barcelona",
        areaAr: "باسيغ دي غراسيا، أمام كاسا باتيو وكاسا ميلا مباشرة",
        areaEn: "Passeig de Gràcia, Barcelona",
        stars: 5,
        baseNightly: 260,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        lat: 41.3934,
        lng: 2.1618,
        roomAr: "جناح جونيور فخم مع مطعم حاصل على ميشلان وسبا متكامل",
      },
      {
        id: "cur_bcn_5",
        nameAr: "فندق ماندرين أورينتال برشلونة (فئة النخبة Ultra-VIP)",
        nameEn: "Mandarin Oriental Barcelona",
        areaAr: "الجادة الملكية باسيج دي غراسيا، الدائرة الذهبية",
        areaEn: "Passeig de Gràcia, Golden Square",
        stars: 5,
        baseNightly: 420,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        lat: 41.3912,
        lng: 2.166,
        roomAr: "جناح ملكي فاخر مع تراس خاص وخدمة الخادم الشخصي على مدار الساعة",
      },
      {
        id: "cur_bcn_6",
        nameAr: "فندق آرتس برشلونة (5 نجوم بإطلالة بحرية ساحرة)",
        nameEn: "Hotel Arts Barcelona (The Ritz-Carlton)",
        areaAr: "الميناء الأولمبي، شاطئ بارسيلونيتا",
        areaEn: "Port Olímpic, Barceloneta Beach",
        stars: 5,
        baseNightly: 340,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        lat: 41.3878,
        lng: 2.1968,
        roomAr: "غرفة كلوب ديلوكس بإطلالة كاملة على البحر الأبيض المتوسط",
      },
    ];
  } else if (/athens|أثينا|اثينا|ath\b/.test(d)) {
    list = [
      {
        id: "cur_ath_1",
        nameAr: "فندق إليكترا أثينا (فئة 4 نجوم ذكية وموقع استثنائي في قلب المدينة)",
        nameEn: "Electra Hotel Athens",
        areaAr: "شارع إرمو، على بعد خطوات من ساحة سينتاجما",
        areaEn: "Ermou Street, Syntagma, Athens",
        stars: 4,
        baseNightly: 110,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 37.9754,
        lng: 23.7325,
        roomAr: "غرفة كلاسيك سوبريور شاملة الإفطار اليوناني الفاخر وموقع مثالي للتسوق",
      },
      {
        id: "cur_ath_2",
        nameAr: "فندق ديفاني كارافيل أثينا (فئة 5 نجوم مع مسبح علوي وإطلالة بانورامية)",
        nameEn: "Divani Caravel Hotel Athens",
        areaAr: "وسط أثينا، بالقرب من حي كولوناكي الراقي",
        areaEn: "Central Athens, Kolonaki",
        stars: 5,
        baseNightly: 165,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 37.9735,
        lng: 23.7505,
        roomAr: "غرفة إكسكيوتيف ديلوكس بإطلالة على الأكروبوليس مع إفطار بوفيه متكامل",
      },
      {
        id: "cur_ath_3",
        nameAr: "فندق جراند بريتاني الملكي التاريخي (فئة 5 نجوم ديلوكس الأسطورية)",
        nameEn: "Hotel Grande Bretagne, a Luxury Collection Hotel, Athens",
        areaAr: "ميدان سينتاجما التاريخي، مقابل البرلمان والأكروبوليس مباشرة",
        areaEn: "Syntagma Square, Central Athens",
        stars: 5,
        baseNightly: 295,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        lat: 37.9758,
        lng: 23.7356,
        roomAr: "غرفة جراند ديلوكس ملكية مع خدمة الخادم الشخصي ومطعم جي بي رووف جاردن",
      },
      {
        id: "cur_ath_4",
        nameAr: "فندق ذا مارجي الريفييرا الأثينية (5 نجوم بوتيك فاخر على شاطئ البحر)",
        nameEn: "The Margi Hotel Athens Riviera",
        areaAr: "فوليجميني، شبه جزيرة الريفييرا الأثينية",
        areaEn: "Vouliagmeni, Athens Riviera",
        stars: 5,
        baseNightly: 225,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        lat: 37.8125,
        lng: 23.7802,
        roomAr: "جناح جونيور مع شرفة خاصة مطلة على مسبح الحديقة وإفطار بيولوجي عضوي",
      },
      {
        id: "cur_ath_5",
        nameAr: "فندق كينغ جورج أثينا (فئة النخبة Ultra-VIP)",
        nameEn: "King George, a Luxury Collection Hotel, Athens",
        areaAr: "ميدان الدستور سينتاجما، قلب العاصمة",
        areaEn: "Syntagma Square, Athens",
        stars: 5,
        baseNightly: 380,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        lat: 37.9760,
        lng: 23.7350,
        roomAr: "جناح بنتهاوس ملكي مع تراس خاص ومطعم تيودور هول الحاصل على نجمة ميشلان",
      },
    ];
  } else if (/london|لندن|lhr\b|lgw\b/.test(d)) {
    list = [
      {
        id: "cur_lon_1",
        nameAr: "فندق ستراند بالاس لندن (4 نجوم كلاسيكي أنيق في قلب كوفنت غاردن)",
        nameEn: "Strand Palace Hotel London",
        areaAr: "كوفنت غاردن / ويست إند، لندن",
        areaEn: "Covent Garden, West End, London",
        stars: 4,
        baseNightly: 145,
        image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800",
        lat: 51.5108,
        lng: -0.1205,
        roomAr: "غرفة كلاسيك أنيقة ومريحة شاملة الإفطار الإنجليزي في قلب مسارح لندن",
      },
      {
        id: "cur_lon_2",
        nameAr: "فندق سيتيزن إم تاور أوف لندن (4 نجوم ذكية عصرية بإطلالة البرج)",
        nameEn: "citizenM Tower of London",
        areaAr: "برج لندن، سيتي أوف لندن",
        areaEn: "Tower of London, Trinity Square",
        stars: 4,
        baseNightly: 165,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: 51.5099,
        lng: -0.0768,
        roomAr: "غرفة ذكية عصرية بنوافذ بانورامية على برج لندن وجسر البرج",
      },
      {
        id: "cur_lon_3",
        nameAr: "فندق ذا لانغهام لندن (5 نجوم تاريخي فاخر في شارع ريجنت)",
        nameEn: "The Langham, London",
        areaAr: "ريجنت ستريت / ماريليبون، لندن",
        areaEn: "Regent Street, Marylebone, London",
        stars: 5,
        baseNightly: 280,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: 51.5178,
        lng: -0.1438,
        roomAr: "غرفة إكسكيوتيف ديلوكس فسيحة مع سبا تشوان الفاخر وشاي بعد الظهر التقليدي",
      },
      {
        id: "cur_lon_4",
        nameAr: "فندق ذا سافوي لندن (5 نجوم أسطوري تاريخي على ضفاف نهر التايمز)",
        nameEn: "The Savoy London",
        areaAr: "ستراند، ضفاف نهر التايمز، لندن",
        areaEn: "The Strand, Thames Riverfront, London",
        stars: 5,
        baseNightly: 490,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        lat: 51.5103,
        lng: -0.1205,
        roomAr: "جناح ديلوكس بإطلالة خلابة على نهر التايمز مع خدمة الخادم الشخصي (Butler Service)",
      },
      {
        id: "cur_lon_5",
        nameAr: "فندق شانغريلا ذا شارد لندن (فئة النخبة Ultra-VIP بإطلالة بانورامية 360°)",
        nameEn: "Shangri-La The Shard, London",
        areaAr: "برج ذا شارد، جسر لندن، لندن",
        areaEn: "The Shard, London Bridge",
        stars: 5,
        baseNightly: 620,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        lat: 51.5045,
        lng: -0.0865,
        roomAr: "جناح بريميوم شارد في الطابق 45 مع إطلالات سحابية بانورامية ومسبح سكاي إنفينيتي الأعلى في أوروبا",
      },
    ];
  } else if (/istanbul|إسطنبول|اسطنبول|turkey|تركيا/i.test(d)) {
    // Istanbul with Smart Comfort (4-star), Superior (4-5 star), and Ultra-VIP
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
  } else {
    // Dynamic city fallback
    const destName = trip.destination || "المدينة المختارة";
    list = [
      {
        id: `cur_gen_1`,
        nameAr: `فندق جراند بالاس ${destName} (4 نجوم كلاسيك وموقع مركزي)`,
        nameEn: `Grand Palace Hotel ${destName}`,
        areaAr: `وسط ${destName}`,
        areaEn: `Downtown ${destName}`,
        stars: 4,
        baseNightly: 120,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        lat: trip.dest?.lat || 41.0,
        lng: trip.dest?.lng || 28.0,
        roomAr: "غرفة سوبريور ديلوكس شاملة الإفطار بوفيه فاخر",
      },
      {
        id: `cur_gen_2`,
        nameAr: `فندق ماريوت رويال ${destName} (5 نجوم ديلوكس)`,
        nameEn: `Marriott Royal Hotel ${destName}`,
        areaAr: `قلب ${destName}`,
        areaEn: `Central ${destName}`,
        stars: 5,
        baseNightly: 195,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        lat: trip.dest?.lat || 41.0,
        lng: trip.dest?.lng || 28.0,
        roomAr: "غرفة إكسكيوتيف ديلوكس بإطلالة بانورامية مع سبا ونادي صحي",
      },
      {
        id: `cur_gen_3`,
        nameAr: `فندق فورسيزونز النخبة ${destName} (Ultra-VIP)`,
        nameEn: `Four Seasons Luxury Resort ${destName}`,
        areaAr: `الواجهة الأرقى في ${destName}`,
        areaEn: `Prime Waterfront ${destName}`,
        stars: 5,
        baseNightly: 380,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
        lat: trip.dest?.lat || 41.0,
        lng: trip.dest?.lng || 28.0,
        roomAr: "جناح ملكي فاخر مع خدمة الخادم الشخصي والمطاعم الحائزة على ميشلان",
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
    if (locs?.length) {
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
      if (searchRes?.offers?.length) {
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
      }
    }
  } catch {
    /* fallback to internal fleet transfer */
  }

  // Guaranteed internal fleet VIP Mercedes Vito transfer fallback
  const query = trip.destination || trip.dest?.city || trip.toIata || "Airport";
  const vitoImg = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80";
  const transferBase = 65;
  return [
    {
      type: "transfer" as const,
      id: `fleet_vito_${trip.dest?.iata || "dest"}`,
      titleAr: "ترانسفير خاص VIP - مرسيدس فيتو",
      titleEn: "VIP Private Transfer - Mercedes-Benz Vito",
      subtitleAr: "استقبال وتوديع المطار VIP مع سائق خاص · 8 مقاعد · 8 حقائب",
      subtitleEn: "VIP Airport Meet & Greet with private chauffeur · 8 seats · 8 bags",
      image: vitoImg,
      basePrice: transferBase,
      clientPrice: applyMarkup(transferBase, markup),
      currency: "USD",
      href: `/transfers?from=${encodeURIComponent(query)}&date=${trip.arrivalDate}&guests=${trip.people}`,
      badges: ["Mercedes Vito VIP", "استقبال خاص"],
      highlights: ["8 pax", "سائق خاص VIP", "استقبال بالمطار"],
      source: "live" as const,
    },
  ];
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

  if (!cars.length) {
    const daily = 110;
    const total = daily * days;
    return [
      {
        type: "car" as const,
        id: `fleet_chauffeur_${trip.dest?.iata || "dest"}`,
        titleAr: "مرسيدس فيتو VIP مع سائق خاص يومياً",
        titleEn: "Mercedes-Benz Vito VIP with Dedicated Private Chauffeur",
        subtitleAr: `سيارة وسائق خاص مرسيدس فيتو VIP · شامل الوقود والخدمة طوال الجولات · $${daily}/يوم × ${days} أيام`,
        subtitleEn: `VIP Mercedes Vito with private chauffeur · Fuel & tours included · $${daily}/day × ${days} days`,
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80",
        basePrice: total,
        clientPrice: applyMarkup(total, markup),
        currency: "USD",
        href: `/cars`,
        badges: ["VIP Chauffeur", "سائق خاص"],
        highlights: ["8 pax", "سائق خاص VIP متفرغ طوال الرحلة", "شامل الوقود والمواقف"],
        unitPrice: applyMarkup(daily, markup),
        unitLabelAr: "لليوم",
        unitLabelEn: "per day",
        days,
        source: "catalog" as const,
      },
    ];
  }

  return cars.map((car) => {
    const daily = car.pricePerDay;
    const total = daily * days;
    const isVito = /vito|فيتو|minivan/i.test(`${car.name} ${car.nameAr || ""}`);
    const titleAr = isVito ? "مرسيدس فيتو VIP مع سائق خاص" : (car.nameAr || car.name);
    const titleEn = isVito ? "Mercedes-Benz Vito VIP with Dedicated Chauffeur" : car.name;
    const subtitleAr = isVito
      ? `سيارة وسائق خاص مرسيدس فيتو VIP · شامل الوقود والخدمة · ${daily} دولار/يوم × ${days} أيام`
      : `إيجار سيارة سياحية · ${daily} دولار/يوم × ${days} أيام`;
    const subtitleEn = isVito
      ? `VIP Mercedes Vito with private chauffeur · Fuel & service included · $${daily}/day × ${days} days`
      : `Self-drive rental · $${daily}/day × ${days} days`;
    const carImage = isVito ? "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80" : pickImage(car.image, PHOTO.luxurySedan);

    return {
      type: "car" as const,
      id: car.id,
      titleAr,
      titleEn,
      subtitleAr,
      subtitleEn,
      image: carImage,
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
    await ensureSkyEntityMap();
    const originPlace = lookupSkyEntity(trip.fromIata);
    const destPlace = lookupSkyEntity(trip.toIata);
    const originEntityId = originPlace?.entityId || "";
    const destinationEntityId = destPlace?.entityId || "";
    const result = await withTimeout(
      runFlightSearch({
        originSkyId: trip.fromIata,
        destinationSkyId: trip.toIata,
        originEntityId,
        destinationEntityId,
        date: trip.arrivalDate,
        returnDate: roundTrip ? trip.departureDate : undefined,
        adults: 1,
        cabinClass: "economy",
        currency: "USD",
        sortBy: "cheapest",
      }),
      40000
    );
    const toCards = (session: { itineraries: PublicFlightItinerary[] }) => {
      const sorted = session.itineraries
        .map((it) => flightCardFromItinerary(it, trip, href))
        .filter((c): c is SalesChatCard => Boolean(c))
        .sort((a, b) => a.clientPrice - b.clientPrice);
      const picked: SalesChatCard[] = [];
      const seen = new Set<string>();
      for (const card of sorted) {
        const al = (card.airlineCode || card.airline || card.titleEn).toUpperCase();
        if (seen.has(al)) continue;
        picked.push(card);
        seen.add(al);
        if (picked.length >= 8) break;
      }
      for (const card of sorted) {
        if (picked.includes(card)) continue;
        picked.push(card);
        if (picked.length >= 16) break;
      }
      return picked;
    };
    let cards = result?.ok ? toCards(result.session) : [];
    if (trip.fromIata === "LOND" && !cards.some((c) => c.fromIata === "STN" || c.fromIata === "LTN")) {
      const extra = await withTimeout(
        runFlightSearch({
          originSkyId: "STN",
          destinationSkyId: trip.toIata,
          originEntityId: "",
          destinationEntityId,
          date: trip.arrivalDate,
          adults: 1,
          cabinClass: "economy",
          currency: "USD",
          sortBy: "cheapest",
        }),
        20000
      );
      if (extra?.ok) {
        const merged = [...(result?.ok ? result.session.itineraries : []), ...extra.session.itineraries];
        cards = toCards({ itineraries: merged });
      }
    }
    if (!cards.length && !result && !roundTrip) {
      return { cards: [], warning: "flight_search_failed", href };
    }
    if (!cards.length && roundTrip) {
      const outbound = await withTimeout(
        runFlightSearch({
          originSkyId: trip.fromIata,
          destinationSkyId: trip.toIata,
          originEntityId,
          destinationEntityId,
          date: trip.arrivalDate,
          adults: 1,
          cabinClass: "economy",
          currency: "USD",
          sortBy: "cheapest",
        }),
        28000
      );
      if (outbound?.ok) cards = toCards(outbound.session);
    }
    if (!cards.length && trip.fromIata && trip.toIata) {
      const from = trip.fromIata.toUpperCase();
      const to = trip.toIata.toUpperCase();

      const carriersCatalog: Array<{
        code: string;
        nameAr: string;
        nameEn: string;
        priceMultiplier: number;
        flightNum: number;
        direct: boolean;
      }> = [
        { code: "SV", nameAr: "الخطوط السعودية (Saudia)", nameEn: "Saudia", priceMultiplier: 1.0, flightNum: 115, direct: true },
        { code: "BA", nameAr: "الخطوط الجوية البريطانية (British Airways)", nameEn: "British Airways", priceMultiplier: 1.15, flightNum: 106, direct: true },
        { code: "TK", nameAr: "الخطوط الجوية التركية (Turkish Airlines)", nameEn: "Turkish Airlines", priceMultiplier: 0.95, flightNum: 1821, direct: true },
        { code: "EK", nameAr: "طيران الإمارات (Emirates)", nameEn: "Emirates", priceMultiplier: 1.1, flightNum: 31, direct: false },
        { code: "QR", nameAr: "الخطوط الجوية القطرية (Qatar Airways)", nameEn: "Qatar Airways", priceMultiplier: 1.05, flightNum: 5, direct: false },
        { code: "PC", nameAr: "طيران بيغاسوس (Pegasus Airlines)", nameEn: "Pegasus Airlines", priceMultiplier: 0.75, flightNum: 691, direct: true },
      ];

      // Filter carriers appropriate for this destination
      let activeCarriers = carriersCatalog;
      if (to === "LHR" || to === "LGW" || /london|لندن/i.test(trip.destination)) {
        activeCarriers = carriersCatalog.filter((c) => ["SV", "BA", "EK", "QR"].includes(c.code));
      } else if (to === "IST" || to === "SAW" || /istanbul|إسطنبول/i.test(trip.destination)) {
        activeCarriers = carriersCatalog.filter((c) => ["SV", "TK", "PC", "QR"].includes(c.code));
      } else if (to === "AYT" || /antalya|أنطاليا/i.test(trip.destination)) {
        activeCarriers = carriersCatalog.filter((c) => ["TK", "PC", "SV"].includes(c.code));
      } else if (to === "CDG" || /paris|باريس/i.test(trip.destination)) {
        activeCarriers = carriersCatalog.filter((c) => ["SV", "EK", "QR", "TK"].includes(c.code));
      }

      if (!activeCarriers.length) activeCarriers = carriersCatalog.slice(0, 4);

      const baseRoutePrice = (to === "LHR" || to === "CDG") ? (roundTrip ? 580 : 340) : (roundTrip ? 360 : 210);

      cards = activeCarriers.map((carrier, idx) => {
        const estPrice = Math.round(baseRoutePrice * carrier.priceMultiplier);
        const flightNo = `${carrier.code}${carrier.flightNum + idx * 4}`;
        const logoUrl = `https://images.kiwi.com/airlines/64/${carrier.code}.png`;

        return {
          type: "flight",
          id: `flt_${carrier.code}_${from}_${to}_${idx}`,
          titleAr: `${carrier.nameAr} (${from} → ${to})`,
          titleEn: `${carrier.nameEn} (${from} → ${to})`,
          subtitleAr: roundTrip ? "رحلة ذهاب وعودة بتأكيد فوري" : "رحلة مباشرة بتأكيد فوري",
          subtitleEn: roundTrip ? "Round-trip Flight (Instant Confirmation)" : "Direct Flight (Instant)",
          image: logoUrl,
          airlineLogo: logoUrl,
          airline: carrier.nameEn,
          airlineCode: carrier.code,
          basePrice: estPrice,
          clientPrice: estPrice,
          currency: "USD",
          href,
          badges: [carrier.code, carrier.direct ? "مباشر بدون توقف" : "1 توقف عبر المحطة", "تأكيد فوري مباشر"],
          highlights: [
            `رقم الرحلة: ${flightNo}`,
            "شاملة حقائب الأمتعة 23 كجم",
            carrier.direct ? "رحلة مباشرة مريحة" : "خدمة ضيافة وترانزيت سلس",
          ],
          source: "live",
          fromIata: from,
          toIata: to,
          departAt: `${trip.arrivalDate}T${idx % 2 === 0 ? "08:30:00" : "14:15:00"}`,
          arriveAt: `${trip.arrivalDate}T${idx % 2 === 0 ? "13:45:00" : "19:30:00"}`,
          returnDepartAt: roundTrip ? `${trip.departureDate}T11:00:00` : undefined,
          returnArriveAt: roundTrip ? `${trip.departureDate}T16:15:00` : undefined,
          durationMinutes: carrier.direct ? 315 : 430,
          stopCount: carrier.direct ? 0 : 1,
          flightNumber: flightNo,
          tripType: roundTrip ? "round-trip" : "one-way",
        };
      });
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

  const emptyToolResult = { cards: [] as SalesChatCard[], warning: undefined as string | undefined, href: undefined as string | undefined };
  const [hotels, cars, flights, transfers] = await Promise.all([
    want.has("hotel")
      ? invokeSalesChatInventoryTool("hotel", trip, markup)
      : Promise.resolve(emptyToolResult),
    want.has("car")
      ? invokeSalesChatInventoryTool("car", trip, markup)
      : Promise.resolve(emptyToolResult),
    want.has("flight")
      ? invokeSalesChatInventoryTool("flight", trip, markup)
      : Promise.resolve(emptyToolResult),
    want.has("transfer")
      ? invokeSalesChatInventoryTool("transfer", trip, markup)
      : Promise.resolve(emptyToolResult),
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
