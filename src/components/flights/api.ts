import type { Locale } from "@/lib/i18n/types";
import {
  normalizeAirports,
  normalizeCalendar,
  normalizeDetails,
  normalizeEverywhere,
  normalizeNearby,
  normalizeSearch,
} from "@/components/flights/normalize";
import type {
  AirportPick,
  CabinClass,
  CalendarDayPrice,
  EverywhereDeal,
  FlightDetails,
  FlightSearchQuery,
  SearchResponse,
} from "@/components/flights/types";

function localeCode(locale: Locale): string {
  switch (locale) {
    case "tr":
      return "tr-TR";
    case "fr":
      return "fr-FR";
    case "ar":
    case "en":
    default:
      return "en-US";
  }
}

function countryCode(locale: Locale): string {
  switch (locale) {
    case "ar":
      return "SA";
    case "tr":
      return "TR";
    case "fr":
      return "FR";
    case "en":
    default:
      return "US";
  }
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store", signal });
  if (!res.ok) {
    const err = new Error("search_failed");
    throw err;
  }
  return res.json();
}

const AIRPORT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CALENDAR_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const airportMem = new Map<string, { at: number; hits: AirportPick[] }>();
const calendarMem = new Map<string, { at: number; days: CalendarDayPrice[] }>();

function readSessionCache<T>(key: string, ttl: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: number; value?: T };
    if (!parsed.at || Date.now() - parsed.at > ttl) return null;
    return parsed.value ?? null;
  } catch {
    return null;
  }
}

function writeSessionCache<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), value }));
  } catch {
    /* quota */
  }
}

export async function searchAirports(query: string, locale: Locale, signal?: AbortSignal): Promise<AirportPick[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const key = `fal:${localeCode(locale)}:${q.toLowerCase()}`;
  const mem = airportMem.get(key);
  if (mem && Date.now() - mem.at < AIRPORT_CACHE_TTL_MS) return mem.hits;
  const cached = readSessionCache<AirportPick[]>(key, AIRPORT_CACHE_TTL_MS);
  if (cached?.length) {
    airportMem.set(key, { at: Date.now(), hits: cached });
    return cached;
  }
  const json = await getJson(
    `/api/flights/airports?query=${encodeURIComponent(q)}&locale=${encodeURIComponent(localeCode(locale))}`,
    signal
  );
  const hits = normalizeAirports(json);
  if (hits.length) {
    airportMem.set(key, { at: Date.now(), hits });
    writeSessionCache(key, hits);
  }
  return hits;
}

export async function nearbyAirport(lat: number, lng: number, locale: Locale): Promise<AirportPick | null> {
  const json = await getJson(
    `/api/flights/airports/nearby?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}&locale=${encodeURIComponent(localeCode(locale))}`
  );
  return normalizeNearby(json);
}

export async function priceCalendar(input: {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  fromDate: string;
  toDate?: string;
  currency: string;
  minPrice?: number;
}): Promise<CalendarDayPrice[]> {
  const params = new URLSearchParams({
    originSkyId: input.originSkyId,
    destinationSkyId: input.destinationSkyId,
    originEntityId: input.originEntityId,
    destinationEntityId: input.destinationEntityId,
    fromDate: input.fromDate,
    currency: input.currency,
  });
  if (input.toDate) params.set("toDate", input.toDate);
  if (input.minPrice && input.minPrice > 0) params.set("minPrice", String(Math.round(input.minPrice)));
  const key = `fc3:${input.originSkyId}:${input.destinationSkyId}:${input.fromDate}:${input.toDate || ""}:${input.currency}:${input.minPrice || ""}`;
  const mem = calendarMem.get(key);
  if (mem && mem.days.length && Date.now() - mem.at < CALENDAR_CACHE_TTL_MS) return mem.days;
  const cached = readSessionCache<CalendarDayPrice[]>(key, CALENDAR_CACHE_TTL_MS);
  if (cached?.length) {
    calendarMem.set(key, { at: Date.now(), days: cached });
    return cached;
  }
  const json = await getJson(`/api/flights/price-calendar?${params}`);
  const days = normalizeCalendar(json, input.currency);
  if (days.length) {
    calendarMem.set(key, { at: Date.now(), days });
    writeSessionCache(key, days);
  }
  return days;
}

export function searchParamsFromQuery(query: FlightSearchQuery, locale: Locale, sortBy?: string): URLSearchParams {
  const params = new URLSearchParams();
  const origin = query.origin;
  const dest = query.destination;
  if (origin) {
    params.set("originSkyId", origin.skyId);
    params.set("originEntityId", origin.entityId);
  }
  if (dest) {
    params.set("destinationSkyId", dest.skyId);
    params.set("destinationEntityId", dest.entityId);
  }
  params.set("date", query.date);
  if (query.tripType === "round-trip" && query.returnDate) params.set("returnDate", query.returnDate);
  params.set("adults", String(query.adults));
  if (query.childrens) params.set("childrens", String(query.childrens));
  if (query.infants) params.set("infants", String(query.infants));
  params.set("cabinClass", query.cabinClass);
  params.set("currency", query.currency);
  params.set("market", localeCode(locale));
  params.set("countryCode", countryCode(locale));
  if (sortBy) params.set("sortBy", sortBy);
  return params;
}

export async function searchFlights(
  query: FlightSearchQuery,
  locale: Locale,
  sortBy?: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  if (query.tripType === "multi-city") {
    const legs = query.multiLegs
      .filter((leg) => leg.origin && leg.destination && leg.date)
      .map((leg) => ({
        originSkyId: leg.origin!.skyId,
        destinationSkyId: leg.destination!.skyId,
        originEntityId: leg.origin!.entityId,
        destinationEntityId: leg.destination!.entityId,
        date: leg.date,
      }));
    const params = new URLSearchParams({
      legs: JSON.stringify(legs),
      adults: String(query.adults),
      cabinClass: query.cabinClass,
      currency: query.currency,
    });
    if (query.childrens) params.set("childrens", String(query.childrens));
    if (query.infants) params.set("infants", String(query.infants));
    const json = await getJson(`/api/flights/search/multi-stops?${params}`, signal);
    return normalizeSearch(json, query.currency, query.cabinClass);
  }
  const params = searchParamsFromQuery(query, locale, sortBy);
  const json = await getJson(`/api/flights/search?${params}`, signal);
  return normalizeSearch(json, query.currency, query.cabinClass);
}

export async function searchIncomplete(
  sessionId: string,
  currency: string,
  cabin: CabinClass,
  signal?: AbortSignal
): Promise<SearchResponse> {
  const json = await getJson(
    `/api/flights/search/incomplete?sessionId=${encodeURIComponent(sessionId)}&currency=${encodeURIComponent(currency)}`,
    signal
  );
  return normalizeSearch(json, currency, cabin);
}

export async function exploreEverywhere(
  origin: AirportPick,
  currency: string,
  locale: Locale,
  travelDate?: string
): Promise<EverywhereDeal[]> {
  const params = new URLSearchParams({
    originSkyId: origin.skyId,
    originEntityId: origin.entityId,
    currency,
    market: localeCode(locale),
    countryCode: countryCode(locale),
  });
  if (travelDate) params.set("travelDate", travelDate);
  const json = await getJson(`/api/flights/search/everywhere?${params}`);
  return normalizeEverywhere(json, currency);
}

export async function flightDetails(input: {
  itineraryId: string;
  legs: string;
  currency: string;
  locale: Locale;
  cabin: CabinClass;
  sessionId?: string;
  quotedPrice?: number;
}): Promise<FlightDetails> {
  const params = new URLSearchParams({
    itineraryId: input.itineraryId,
    legs: input.legs,
    currency: input.currency,
    market: localeCode(input.locale),
    countryCode: countryCode(input.locale),
  });
  if (input.sessionId) params.set("sessionId", input.sessionId);
  if (input.quotedPrice) params.set("quotedPrice", String(input.quotedPrice));
  const json = await getJson(`/api/flights/details?${params}`);
  return normalizeDetails(json, input.itineraryId, input.cabin, input.quotedPrice);
}

export async function initFlightBooking(input: {
  itineraryId: string;
  /** Selected fare family (FareFamily.id) — resolved server-side to the supplier token. */
  fareId?: string;
  legs: string;
  sessionId?: string;
  currency: string;
  locale: Locale;
  quotedPrice: number;
  adults: number;
  childrens: number;
  infants: number;
  contact: { name: string; email: string; phone: string };
  travelers: Array<Record<string, unknown>>;
}): Promise<{
  bookingId: string;
  fareChanged: boolean;
  clientPrice: number;
  currency: string;
  /** Server-side quote validity (ISO). Payment must start before this instant or the fare is re-priced. */
  quoteExpiresAt?: string;
  iyzicoEnabled: boolean;
  whatsappBankLinkEnabled: boolean;
}> {
  const res = await fetch("/api/flights/book/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itineraryId: input.itineraryId,
      fareId: input.fareId,
      legs: input.legs,
      sessionId: input.sessionId,
      currency: input.currency,
      market: localeCode(input.locale),
      countryCode: countryCode(input.locale),
      quotedPrice: input.quotedPrice,
      adults: input.adults,
      childrens: input.childrens,
      infants: input.infants,
      contact: input.contact,
      travelers: input.travelers,
    }),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    bookingId?: string;
    errorCode?: string;
    fareChanged?: boolean;
    price?: { client?: number; currency?: string };
    quote?: { expiresAt?: string } | null;
    payment?: { iyzicoEnabled?: boolean; whatsappBankLinkEnabled?: boolean };
  };
  if (!res.ok || !json.ok || !json.bookingId) {
    throw new Error(String(json.errorCode || "search_failed"));
  }
  return {
    bookingId: json.bookingId,
    fareChanged: Boolean(json.fareChanged),
    clientPrice: Number(json.price?.client) || input.quotedPrice,
    currency: String(json.price?.currency || input.currency),
    quoteExpiresAt: json.quote?.expiresAt || undefined,
    iyzicoEnabled: Boolean(json.payment?.iyzicoEnabled),
    whatsappBankLinkEnabled: json.payment?.whatsappBankLinkEnabled !== false,
  };
}

export type PaidBagOption = {
  id: string;
  weightKg: number;
  pieces: number;
  label: string;
  price: number;
  currency: string;
};

export async function fetchPaidBaggage(input: {
  sessionId: string;
  itineraryId: string;
  fareId?: string;
  adults?: number;
  children?: number;
  infants?: number;
  currency?: string;
}): Promise<PaidBagOption[]> {
  const res = await fetch("/api/flights/ancillary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: input.sessionId,
      itineraryId: input.itineraryId,
      fareId: input.fareId,
      adults: input.adults || 1,
      children: input.children || 0,
      infants: input.infants || 0,
      currency: input.currency,
    }),
  });
  const json = (await res.json()) as { ok?: boolean; options?: PaidBagOption[] };
  if (!res.ok || !json.ok) return [];
  return Array.isArray(json.options) ? json.options : [];
}
