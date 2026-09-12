/**
 * Live flight engine: Sky Scrapper search/details + admin markup.
 * Public errors never mention RapidAPI, keys, or quota.
 */

import {
  applyFlightMarkup,
  runtimeHasFlightProvider,
  type FlightMarkupContext,
  type FlightMarkupRule,
  type FlightsRuntimeSettings,
} from "@/lib/flights-config";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import {
  FLIGHTS_AIRPORT_TTL_MS,
  FLIGHTS_CALENDAR_TTL_MS,
  FLIGHTS_CONFIG_TTL_MS,
  FLIGHTS_LOCALE_TTL_MS,
  FLIGHTS_SESSION_TTL_MS,
  flightsCacheKey,
  readFlightsCache,
  writeFlightsCache,
} from "@/lib/server/flights-cache";
import {
  skyScrapperGet,
  type FlightProviderErrorCode,
  type SkyScrapperResult,
} from "@/lib/server/flights-sky-scrapper";
import { convertAmountSafe } from "@/lib/server/fx-service";
import {
  ensureSkyEntityMap,
  lookupSkyEntity,
  rememberSkyPlace,
} from "@/lib/server/sky-entity-ids";

export const PUBLIC_FLIGHT_EMPTY =
  "لا توجد نتائج حالياً. جرّب مطارات قريبة أو تواريخ مرنة.";
export const PUBLIC_FLIGHT_ERROR = "تعذر تحميل النتائج، حاول مرة أخرى";

export type PublicFlightPlace = {
  skyId?: string;
  entityId?: string;
  displayCode?: string;
  name?: string;
  city?: string;
  country?: string;
};

export type PublicFlightSegment = {
  flightNumber?: string;
  airline?: string;
  airlineCode?: string;
  airlineLogo?: string;
  aircraft?: string;
  origin?: PublicFlightPlace;
  destination?: PublicFlightPlace;
  departure?: string;
  arrival?: string;
  durationMinutes?: number;
};

export type PublicFlightLeg = {
  id: string;
  origin: PublicFlightPlace;
  destination: PublicFlightPlace;
  departure: string;
  arrival: string;
  durationMinutes: number;
  stopCount: number;
  segments: PublicFlightSegment[];
};

export type PublicFlightPrice = {
  base: number;
  client: number;
  currency: string;
  formatted?: string;
  taxes?: number;
  fareChanged?: boolean;
};

export type PublicFareFamily = {
  id: string;
  name: string;
  price: PublicFlightPrice;
  baggage?: string;
  changeable?: boolean;
  refundable?: boolean;
};

export type PublicFlightItinerary = {
  id: string;
  legs: PublicFlightLeg[];
  price: PublicFlightPrice;
  stops: number;
  durationMinutes: number;
  airlines: string[];
  score?: number;
  badges: string[];
  farePolicy?: unknown;
  fareFamilies?: PublicFareFamily[];
  sessionLegsPayload?: string;
};

export type FlightSearchSession = {
  sessionId: string;
  status: "complete" | "incomplete";
  itineraries: PublicFlightItinerary[];
  currency: string;
  query: Record<string, string>;
  rawContext?: unknown;
};

const CABIN = new Set(["economy", "premium_economy", "business", "first"]);
const SORT = new Set(["best", "price_high", "fastest", "outbound_departure_time"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function str(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function roundFlightPrice(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
}

/** RapidAPI always sees USD so switching guest currency does not burn quota. */
const PROVIDER_CURRENCY = "USD";

function guestCurrencyOf(value: unknown): string {
  return str(value).toUpperCase() || PROVIDER_CURRENCY;
}

async function localizeFlightSession(
  session: FlightSearchSession,
  guestCurrency: string
): Promise<FlightSearchSession> {
  const guest = guestCurrencyOf(guestCurrency);
  const itineraries = await Promise.all(
    session.itineraries.map(async (item) => {
      const from = guestCurrencyOf(item.price.currency || session.currency || PROVIDER_CURRENCY);
      if (from === guest) {
        return {
          ...item,
          price: { ...item.price, currency: guest, formatted: undefined },
          fareFamilies: item.fareFamilies?.map((fare) => ({
            ...fare,
            price: { ...fare.price, currency: guest, formatted: undefined },
          })),
        };
      }
      const [base, client, taxes] = await Promise.all([
        convertAmountSafe(item.price.base, from, guest),
        convertAmountSafe(item.price.client, from, guest),
        item.price.taxes
          ? convertAmountSafe(item.price.taxes, from, guest)
          : Promise.resolve(undefined),
      ]);
      const fareFamilies = item.fareFamilies?.length
        ? await Promise.all(
            item.fareFamilies.map(async (fare) => {
              const fareFrom = guestCurrencyOf(fare.price.currency || from);
              const [fareBase, fareClient] = await Promise.all([
                convertAmountSafe(fare.price.base, fareFrom, guest),
                convertAmountSafe(fare.price.client, fareFrom, guest),
              ]);
              return {
                ...fare,
                price: {
                  ...fare.price,
                  base: roundFlightPrice(fareBase),
                  client: roundFlightPrice(fareClient),
                  currency: guest,
                },
              };
            })
          )
        : item.fareFamilies;
      return {
        ...item,
        price: {
          ...item.price,
          base: roundFlightPrice(base),
          client: roundFlightPrice(client),
          currency: guest,
          formatted: undefined,
          ...(taxes != null ? { taxes: roundFlightPrice(taxes) } : {}),
        },
        fareFamilies,
      };
    })
  );
  return {
    ...session,
    itineraries,
    currency: guest,
    query: { ...session.query, currency: guest },
  };
}

export function publicFlightErrorCode(
  code: FlightProviderErrorCode
): Exclude<FlightProviderErrorCode, "quota" | "not_configured" | "invalid_key"> {
  switch (code) {
    case "provider_travelpayouts":
      return "provider_travelpayouts";
    case "endpoint_disabled":
      return "endpoint_disabled";
    case "zero_results":
      return "zero_results";
    case "quota":
    case "not_configured":
    case "invalid_key":
    case "search_failed":
      return "search_failed";
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}

export function publicFlightMessage(code: FlightProviderErrorCode): string {
  return code === "zero_results" || code === "provider_travelpayouts"
    ? PUBLIC_FLIGHT_EMPTY
    : PUBLIC_FLIGHT_ERROR;
}

export async function resolveFlightsMode(): Promise<{
  runtime: FlightsRuntimeSettings;
  live: boolean;
  travelpayoutsOnly: boolean;
}> {
  const runtime = await getFlightsRuntime();
  const live = runtimeHasFlightProvider(runtime, "live");
  const travelpayoutsOnly =
    !live && runtimeHasFlightProvider(runtime, "travelpayouts");
  return { runtime, live, travelpayoutsOnly };
}

function unwrapData(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload) || {};
  const data = asRecord(root.data);
  return data || root;
}

function extractSessionId(data: Record<string, unknown>): string {
  const context = asRecord(data.context);
  return (
    str(context?.sessionId) ||
    str(data.sessionId) ||
    str(data.flightsSessionId) ||
    str(data.token)
  );
}

function extractStatus(data: Record<string, unknown>): "complete" | "incomplete" {
  const context = asRecord(data.context);
  const raw = str(context?.status || data.status).toLowerCase();
  if (raw === "complete" || raw === "completed" || raw === "finished") return "complete";
  return "incomplete";
}

function placeFrom(raw: unknown): PublicFlightPlace {
  const rec = asRecord(raw) || {};
  const nested = asRecord(rec.displayCode) ? rec : rec;
  return {
    skyId: str(nested.skyId || nested.id) || undefined,
    entityId: str(nested.entityId) || undefined,
    displayCode: str(nested.displayCode || nested.iata || nested.code) || undefined,
    name: str(nested.name || nested.airport) || undefined,
    city: str(nested.city || asRecord(nested.city)?.name) || undefined,
    country: str(nested.country || asRecord(nested.country)?.name) || undefined,
  };
}

function extractPrice(itinerary: Record<string, unknown>): {
  base: number;
  taxes: number;
  currency: string;
  formatted?: string;
} {
  const price = asRecord(itinerary.price);
  const pricing = asArray(itinerary.pricingOptions)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item));
  const firstOption = pricing[0];
  const optionPrice = asRecord(firstOption?.price);
  const base =
    num(price?.raw) ||
    num(price?.amount) ||
    num(itinerary.rawPrice) ||
    num(itinerary.minPrice) ||
    num(optionPrice?.raw) ||
    num(optionPrice?.amount) ||
    num(itinerary.price);
  const explicitTaxes = num(price?.taxes || price?.fees);
  const baseFare = num(price?.baseFare || price?.base);
  const taxes =
    explicitTaxes > 0
      ? explicitTaxes
      : baseFare > 0 && base > baseFare
        ? roundFlightPrice(base - baseFare)
        : 0;
  const currency =
    str(price?.currency || optionPrice?.currency || itinerary.currency) || "USD";
  const formatted = str(price?.formatted || optionPrice?.formatted) || undefined;
  return { base, taxes, currency, formatted };
}

function extractLegsPayload(rec: Record<string, unknown>, legs: PublicFlightLeg[]): string {
  if (typeof rec.legs === "string" && rec.legs.trim()) return rec.legs.trim();
  const legIds = asArray(rec.legIds)
    .map((item) => str(item))
    .filter(Boolean);
  if (legIds.length) return JSON.stringify(legIds);
  const pricing = asArray(rec.pricingOptions).map((item) => asRecord(item));
  const firstOption = pricing.find((item) => item);
  if (firstOption) {
    const optionId = str(firstOption.id);
    if (optionId) return optionId;
    const itemIds = asArray(firstOption.items)
      .map((item) => str(asRecord(item)?.id || ""))
      .filter(Boolean);
    if (itemIds.length) return JSON.stringify(itemIds);
  }
  return JSON.stringify(
    legs.map((leg) => ({
      origin: leg.origin.displayCode || leg.origin.skyId,
      destination: leg.destination.displayCode || leg.destination.skyId,
      date: leg.departure.slice(0, 10),
    }))
  );
}

function extractFareFamilies(
  rec: Record<string, unknown>,
  fallbackPrice: number,
  currency: string,
  markupRules: FlightMarkupRule[],
  ctx: FlightMarkupContext
): PublicFareFamily[] {
  const policy = asRecord(rec.farePolicy || rec.fareRules) || {};
  const rows = asArray(rec.fareFamilies || rec.fares || rec.fareTiers || rec.pricingOptions)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item));
  if (!rows.length) return [];
  return rows.map((row, index) => {
    const priceRec = asRecord(row.price) || {};
    const items = asArray(row.items);
    const firstItem = asRecord(items[0]) || {};
    const nestedFares = asArray(firstItem.fares);
    const fareMeta = asRecord(nestedFares[0] || firstItem || row) || row;
    const baggageRec = asRecord(fareMeta.baggage || row.baggage) || {};
    const base =
      num(priceRec.client ?? priceRec.raw ?? priceRec.amount ?? priceRec.base) ||
      num(row.rawPrice) ||
      fallbackPrice;
    const marked = applyFlightMarkup(base, markupRules, ctx);
    return {
      id: str(row.id || asArray(row.agentIds)[0] || fareMeta.id || `fare-${index}`),
      name: str(fareMeta.brandName || fareMeta.name || row.name || row.brandName || `Fare ${index + 1}`),
      price: {
        base: roundFlightPrice(base),
        client: roundFlightPrice(marked.price),
        currency,
      },
      baggage:
        str(baggageRec.checked || baggageRec.cabin || fareMeta.baggage || row.baggage) || undefined,
      changeable: Boolean(
        fareMeta.changeable ?? row.changeable ?? policy.isChangeAllowed ?? policy.isPartiallyChangeable
      ),
      refundable: Boolean(
        fareMeta.refundable ?? row.refundable ?? policy.isCancellationAllowed ?? policy.isPartiallyRefundable
      ),
    };
  });
}

function extractSegments(leg: Record<string, unknown>): PublicFlightSegment[] {
  const rows = asArray(leg.segments).length ? asArray(leg.segments) : asArray(leg.carriers);
  return rows.map((item) => {
    const rec = asRecord(item) || {};
    const marketing = asRecord(asArray(asRecord(rec.marketing)?.marketing)?.[0] || rec.marketing);
    const carrier = asRecord(rec.marketingCarrier) || marketing || asRecord(rec.carrier) || rec;
    return {
      flightNumber: str(rec.flightNumber || rec.flightNo) || undefined,
      airline: str(carrier.name || rec.airlineName || rec.name) || undefined,
      airlineCode: str(carrier.alternateId || carrier.id || rec.airlineCode) || undefined,
      airlineLogo: str(carrier.logoUrl || rec.logoUrl) || undefined,
      aircraft: str(asRecord(rec.operatingCarrier)?.altId || rec.aircraft || rec.equipment) || undefined,
      origin: placeFrom(rec.origin || rec.departureAirport),
      destination: placeFrom(rec.destination || rec.arrivalAirport),
      departure: str(rec.departure || rec.departureTime) || undefined,
      arrival: str(rec.arrival || rec.arrivalTime) || undefined,
      durationMinutes: num(rec.durationInMinutes || rec.duration) || undefined,
    };
  });
}

function extractLeg(raw: unknown, index: number): PublicFlightLeg {
  const rec = asRecord(raw) || {};
  const carriers = asRecord(rec.carriers);
  const marketing = asArray(carriers?.marketing);
  const firstCarrier = asRecord(marketing[0]);
  const segments = extractSegments(rec);
  if (!segments.length && firstCarrier) {
    segments.push({
      airline: str(firstCarrier.name) || undefined,
      airlineCode: str(firstCarrier.alternateId || firstCarrier.id) || undefined,
      airlineLogo: str(firstCarrier.logoUrl) || undefined,
    });
  }
  return {
    id: str(rec.id) || `leg-${index}`,
    origin: placeFrom(rec.origin),
    destination: placeFrom(rec.destination),
    departure: str(rec.departure),
    arrival: str(rec.arrival),
    durationMinutes: num(rec.durationInMinutes || rec.duration),
    stopCount: num(rec.stopCount ?? rec.stops),
    segments,
  };
}

function markupContextFromLegs(legs: PublicFlightLeg[]): FlightMarkupContext {
  const first = legs[0];
  const last = legs[legs.length - 1];
  return {
    origin: first?.origin.skyId || first?.origin.displayCode,
    destination: last?.destination.skyId || last?.destination.displayCode,
    originCity: first?.origin.city || first?.origin.name,
    destinationCity: last?.destination.city || last?.destination.name,
    originCountry: first?.origin.country,
    destinationCountry: last?.destination.country,
  };
}

function badgesFor(
  itinerary: PublicFlightItinerary,
  all: PublicFlightItinerary[]
): string[] {
  const badges: string[] = [];
  const cheapest = all.reduce(
    (min, item) => (item.price.client < min ? item.price.client : min),
    Number.POSITIVE_INFINITY
  );
  const fastest = all.reduce(
    (min, item) => (item.durationMinutes < min ? item.durationMinutes : min),
    Number.POSITIVE_INFINITY
  );
  if (itinerary.price.client === cheapest && cheapest !== Number.POSITIVE_INFINITY) {
    badges.push("cheapest");
  }
  if (itinerary.durationMinutes === fastest && fastest !== Number.POSITIVE_INFINITY) {
    badges.push("fastest");
  }
  const providerBest = [...all].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  if (providerBest && providerBest.id === itinerary.id && (itinerary.score || 0) > 0) {
    badges.push("best");
    return badges;
  }
  const minPrice = cheapest !== Number.POSITIVE_INFINITY ? cheapest : 1;
  const minDuration = fastest !== Number.POSITIVE_INFINITY ? fastest : 1;
  const scored = all
    .map((item) => ({
      id: item.id,
      score: item.price.client / minPrice + item.durationMinutes / minDuration,
    }))
    .sort((a, b) => a.score - b.score)[0];
  if (scored?.id === itinerary.id) badges.push("best");
  return badges;
}

function normalizeItinerary(
  raw: unknown,
  markupRules: FlightMarkupRule[],
  fallbackCurrency: string
): PublicFlightItinerary | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = str(rec.id || rec.itineraryId);
  if (!id) return null;
  const legs = asArray(rec.legs).map((leg, index) => extractLeg(leg, index));
  const priceInfo = extractPrice(rec);
  const currency = fallbackCurrency;
  const ctx = { ...markupContextFromLegs(legs), currency };
  const marked = applyFlightMarkup(priceInfo.base, markupRules, ctx);
  const fareFamilies = extractFareFamilies(rec, priceInfo.base, currency, markupRules, ctx);
  const airlines = [
    ...new Set(
      legs.flatMap((leg) =>
        leg.segments.map((seg) => seg.airline || seg.airlineCode || "").filter(Boolean)
      )
    ),
  ];
  return {
    id,
    legs,
    price: {
      base: roundFlightPrice(priceInfo.base),
      client: roundFlightPrice(marked.price),
      currency,
      formatted: priceInfo.formatted,
      ...(priceInfo.taxes > 0 ? { taxes: priceInfo.taxes } : {}),
    },
    stops: legs.reduce((sum, leg) => sum + leg.stopCount, 0),
    durationMinutes: legs.reduce((sum, leg) => sum + leg.durationMinutes, 0),
    airlines,
    score: num(rec.score) || undefined,
    badges: [],
    farePolicy: rec.farePolicy ?? rec.fareRules,
    fareFamilies: fareFamilies.length ? fareFamilies : undefined,
    sessionLegsPayload: extractLegsPayload(rec, legs),
  };
}

function collectItineraries(data: Record<string, unknown>): unknown[] {
  const direct = asArray(data.itineraries);
  if (direct.length) return direct;
  const wrap = asRecord(data.itineraries);
  if (wrap) {
    if (asArray(wrap.results).length) return asArray(wrap.results);
    if (asArray(wrap.itineraries).length) return asArray(wrap.itineraries);
    const fromBuckets = asArray(wrap.buckets).flatMap((bucket) => {
      const rec = asRecord(bucket) || {};
      return asArray(rec.items).length ? asArray(rec.items) : asArray(rec.itineraries);
    });
    if (fromBuckets.length) return fromBuckets;
  }
  const flights = asRecord(data.flights);
  if (flights) {
    const nestedDirect = asArray(flights.itineraries);
    if (nestedDirect.length) return nestedDirect;
    const nestedWrap = asRecord(flights.itineraries);
    if (nestedWrap && asArray(nestedWrap.results).length) return asArray(nestedWrap.results);
  }
  if (asArray(data.results).length) return asArray(data.results);
  return [];
}

function applyBadges(items: PublicFlightItinerary[]): PublicFlightItinerary[] {
  return items.map((item) => ({ ...item, badges: badgesFor(item, items) }));
}

function sessionCacheKey(sessionId: string): string {
  return flightsCacheKey(["session", sessionId]);
}

export function cabinClassOf(raw: string | undefined): string {
  const value = str(raw).toLowerCase().replace(/[\s-]+/g, "_");
  return CABIN.has(value) ? value : "economy";
}

export function sortByOf(raw: string | undefined): string {
  const value = str(raw).toLowerCase();
  if (value === "cheapest" || value === "price_low" || value === "price") return "best";
  return SORT.has(value) ? value : "best";
}

const SAFE_FLIGHT_LOCALES = new Set(["en-US", "en-GB", "en-CA", "tr-TR", "ar-AE", "de-DE", "fr-FR"]);

export function isLiveEntityId(value: string): boolean {
  return /^\d{4,}$/.test(str(value));
}

export function localeOf(raw: string | undefined): string {
  const value = str(raw);
  if (value.toLowerCase() === "ar-sa") return "en-US";
  if (SAFE_FLIGHT_LOCALES.has(value)) return value;
  switch (value.toLowerCase()) {
    case "ar":
    case "ar-sa":
      return "en-US";
    case "tr":
      return "tr-TR";
    case "en":
      return "en-US";
    default:
      return "en-US";
  }
}

export function marketOf(raw: string | undefined): string {
  return localeOf(raw);
}

type ResolvedSkyPlace = { skyId: string; entityId: string; kind: "city" | "airport" };

function skyHitsFromPayload(payload: unknown): ResolvedSkyPlace[] {
  const root = asRecord(payload) || {};
  const rows = asArray(root.data).length ? asArray(root.data) : asArray(root.airports);
  const hits: ResolvedSkyPlace[] = [];
  for (const item of rows) {
    const rec = asRecord(item) || {};
    const nav = asRecord(rec.navigation) || {};
    const params = asRecord(nav.relevantFlightParams) || {};
    const skyId = str(rec.skyId || params.skyId);
    const entityId = str(rec.entityId || params.entityId || nav.entityId);
    if (!skyId || !isLiveEntityId(entityId)) continue;
    const type = str(nav.entityType || params.flightPlaceType || rec.kind).toUpperCase();
    hits.push({
      skyId,
      entityId,
      kind: type.includes("CITY") ? "city" : "airport",
    });
  }
  return hits;
}

function pickSkyHit(
  hits: ResolvedSkyPlace[],
  skyId: string,
  preferCity: boolean
): ResolvedSkyPlace | null {
  const code = skyId.toUpperCase();
  const exactKind = hits.find(
    (hit) => hit.skyId.toUpperCase() === code && hit.kind === (preferCity ? "city" : "airport")
  );
  if (exactKind) return exactKind;
  const sameCode = hits.find((hit) => hit.skyId.toUpperCase() === code);
  if (sameCode) return sameCode;
  if (preferCity) {
    const city = hits.find((hit) => hit.kind === "city");
    if (city) return city;
  }
  return hits[0] || null;
}

function logFlights(event: string, meta: Record<string, unknown>): void {
  console.info(
    "[flights-search]",
    JSON.stringify({
      event,
      ...meta,
    })
  );
}

async function resolveSkyPlace(
  runtime: FlightsRuntimeSettings,
  skyId: string,
  entityId: string,
  kind?: string
): Promise<ResolvedSkyPlace> {
  const rawSky = str(skyId);
  const rawEnt = str(entityId);
  const preferCity = kind === "city" || rawEnt.toLowerCase().startsWith("loc-c-");
  const wantedKind: "city" | "airport" = preferCity ? "city" : "airport";
  if (rawSky && isLiveEntityId(rawEnt)) {
    const resolved = { skyId: rawSky, entityId: rawEnt, kind: wantedKind };
    await rememberSkyPlace(resolved);
    return resolved;
  }

  await ensureSkyEntityMap();
  const mapped =
    lookupSkyEntity(rawSky, wantedKind) ||
    lookupSkyEntity(rawEnt, wantedKind) ||
    lookupSkyEntity(rawSky.replace(/^loc-[ac]-/i, ""), wantedKind);
  if (mapped && isLiveEntityId(mapped.entityId)) {
    logFlights("place-mapped", {
      fromSkyId: rawSky,
      fromSynthetic: !isLiveEntityId(rawEnt),
      toSkyId: mapped.skyId,
      toKind: mapped.kind,
    });
    return mapped;
  }

  const cacheKey = flightsCacheKey(["place", rawSky, wantedKind]);
  const cached = await readFlightsCache<ResolvedSkyPlace>(cacheKey, FLIGHTS_AIRPORT_TTL_MS);
  if (cached?.skyId && isLiveEntityId(cached.entityId)) {
    await rememberSkyPlace(cached);
    return cached;
  }

  const query = rawSky.replace(/^loc-[ac]-/i, "") || rawSky;
  const result = await skyScrapperGet(runtime, "searchAirport", "/api/v1/flights/searchAirport", {
    query,
    locale: "en-US",
  });
  if (!result.ok) {
    logFlights("place-resolve-failed", {
      skyId: rawSky,
      query,
      preferCity,
      errorCode: result.errorCode,
      status: result.status,
    });
    return { skyId: rawSky, entityId: rawEnt, kind: wantedKind };
  }
  const hit = pickSkyHit(skyHitsFromPayload(result.payload), rawSky, preferCity);
  if (!hit) {
    logFlights("place-resolve-empty", { skyId: rawSky, query, preferCity });
    return { skyId: rawSky, entityId: rawEnt, kind: wantedKind };
  }
  await writeFlightsCache(cacheKey, hit);
  await rememberSkyPlace(hit);
  logFlights("place-resolved", {
    fromSkyId: rawSky,
    fromSynthetic: !isLiveEntityId(rawEnt),
    toSkyId: hit.skyId,
    toKind: hit.kind,
  });
  return hit;
}

export async function runAirportSearch(input: {
  query: string;
  locale?: string;
}): Promise<SkyScrapperResult> {
  const { runtime, live, travelpayoutsOnly } = await resolveFlightsMode();
  if (travelpayoutsOnly || !live) {
    return {
      ok: false,
      status: 200,
      path: "/api/v1/flights/searchAirport",
      errorCode: "provider_travelpayouts",
      body: "travelpayouts",
    };
  }
  const locale = localeOf(input.locale);
  const query = str(input.query);
  const cacheKey = flightsCacheKey(["airport", locale, query]);
  const cached = await readFlightsCache<unknown>(cacheKey, FLIGHTS_AIRPORT_TTL_MS);
  if (cached != null) {
    return { ok: true, status: 200, path: "/api/v1/flights/searchAirport", payload: cached };
  }
  const result = await skyScrapperGet(runtime, "searchAirport", "/api/v1/flights/searchAirport", {
    query,
    locale,
  });
  if (result.ok) await writeFlightsCache(cacheKey, result.payload);
  return result;
}

export async function runNearbyAirports(input: {
  lat: number;
  lng: number;
  locale?: string;
}): Promise<SkyScrapperResult> {
  const { runtime, live, travelpayoutsOnly } = await resolveFlightsMode();
  if (travelpayoutsOnly || !live) {
    return {
      ok: false,
      status: 200,
      path: "/api/v1/flights/getNearbyAirports",
      errorCode: "provider_travelpayouts",
      body: "travelpayouts",
    };
  }
  const locale = localeOf(input.locale);
  const cacheKey = flightsCacheKey([
    "nearby",
    locale,
    input.lat.toFixed(3),
    input.lng.toFixed(3),
  ]);
  const cached = await readFlightsCache<unknown>(cacheKey, FLIGHTS_AIRPORT_TTL_MS);
  if (cached != null) {
    return { ok: true, status: 200, path: "/api/v1/flights/getNearbyAirports", payload: cached };
  }
  const result = await skyScrapperGet(
    runtime,
    "getNearbyAirports",
    "/api/v1/flights/getNearbyAirports",
    { lat: input.lat, lng: input.lng, locale }
  );
  if (result.ok) await writeFlightsCache(cacheKey, result.payload);
  return result;
}

export async function runPriceCalendar(input: {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  fromDate: string;
  toDate?: string;
  currency?: string;
}): Promise<
  | { ok: true; days: Array<{ date: string; price: PublicFlightPrice }>; raw: unknown }
  | { ok: false; errorCode: FlightProviderErrorCode }
> {
  const { runtime, live, travelpayoutsOnly } = await resolveFlightsMode();
  if (travelpayoutsOnly || !live) {
    return { ok: false, errorCode: "provider_travelpayouts" };
  }
  const month = str(input.fromDate).slice(0, 7);
  const guestCurrency = guestCurrencyOf(input.currency);
  const currency = PROVIDER_CURRENCY;
  const [origin, destination] = await Promise.all([
    resolveSkyPlace(runtime, input.originSkyId, input.originEntityId),
    resolveSkyPlace(runtime, input.destinationSkyId, input.destinationEntityId),
  ]);
  const cacheKey = flightsCacheKey([
    "calendar",
    origin.skyId,
    destination.skyId,
    month,
    currency,
  ]);
  let payload = await readFlightsCache<unknown>(cacheKey, FLIGHTS_CALENDAR_TTL_MS);
  if (payload == null) {
    const result = await skyScrapperGet(
      runtime,
      "getPriceCalendar",
      "/api/v1/flights/getPriceCalendar",
      {
        originSkyId: origin.skyId,
        destinationSkyId: destination.skyId,
        originEntityId: origin.entityId,
        destinationEntityId: destination.entityId,
        fromDate: input.fromDate,
        toDate: input.toDate,
        currency,
      }
    );
    if (!result.ok) return { ok: false, errorCode: result.errorCode };
    payload = result.payload;
    await writeFlightsCache(cacheKey, payload);
  }
  const data = unwrapData(payload);
  const flightsWrap = asRecord(data.flights);
  const rows = asArray(
    flightsWrap?.days || data.days || data.prices || data.calendar
  );
  const ctx: FlightMarkupContext = {
    origin: origin.skyId,
    destination: destination.skyId,
    currency,
  };
  const days = rows
    .map((item) => {
      const rec = asRecord(item) || {};
      const dateRaw = str(rec.day || rec.date || rec.departureDate || rec.fromDate);
      const date = dateRaw.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || "";
      const priceRec = asRecord(rec.price);
      const base = num(
        priceRec?.client ??
          priceRec?.raw ??
          priceRec?.amount ??
          priceRec?.total ??
          rec.rawPrice ??
          rec.minPrice ??
          rec.price
      );
      if (!date || base <= 0) return null;
      const marked = applyFlightMarkup(base, runtime.markupRules, ctx);
      return {
        date,
        price: {
          base: roundFlightPrice(base),
          client: roundFlightPrice(marked.price),
          currency,
        },
      };
    })
    .filter((item): item is { date: string; price: PublicFlightPrice } => Boolean(item));
  const daysFx = await Promise.all(
    days.map(async (row) => {
      const [base, client] = await Promise.all([
        convertAmountSafe(row.price.base, PROVIDER_CURRENCY, guestCurrency),
        convertAmountSafe(row.price.client, PROVIDER_CURRENCY, guestCurrency),
      ]);
      return {
        ...row,
        price: {
          ...row.price,
          base: roundFlightPrice(base),
          client: roundFlightPrice(client),
          currency: guestCurrency,
        },
      };
    })
  );
  return { ok: true, days: daysFx, raw: payload };
}

function buildSearchSession(
  payload: unknown,
  markupRules: FlightMarkupRule[],
  currency: string,
  query: Record<string, string>
): FlightSearchSession {
  const data = unwrapData(payload);
  const sessionId = extractSessionId(data);
  const status = extractStatus(data);
  const itineraries = applyBadges(
    collectItineraries(data)
      .map((item) => normalizeItinerary(item, markupRules, currency))
      .filter((item): item is PublicFlightItinerary => Boolean(item))
  );
  return {
    sessionId,
    status: sessionId && status === "incomplete" ? "incomplete" : itineraries.length ? status : "complete",
    itineraries,
    currency,
    query,
    rawContext: asRecord(data.context) || undefined,
  };
}

async function persistSession(session: FlightSearchSession, aliasId?: string): Promise<void> {
  if (session.sessionId) {
    await writeFlightsCache(sessionCacheKey(session.sessionId), session);
  }
  if (aliasId && aliasId !== session.sessionId) {
    await writeFlightsCache(sessionCacheKey(aliasId), session);
  }
}

function searchQueryCacheKey(
  query: Record<string, string>,
  cabin: string,
  adults: number,
  childrens: number,
  infants: number,
  sortBy: string
): string {
  return flightsCacheKey([
    "searchq",
    query.originSkyId,
    query.destinationSkyId,
    query.originEntityId,
    query.destinationEntityId,
    query.date,
    query.returnDate || "ow",
    cabin,
    adults,
    childrens,
    infants,
    sortBy,
  ]);
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mergeSessions(
  current: FlightSearchSession,
  incoming: FlightSearchSession
): FlightSearchSession {
  const byId = new Map<string, PublicFlightItinerary>();
  for (const item of current.itineraries) byId.set(item.id, item);
  for (const item of incoming.itineraries) byId.set(item.id, item);
  const itineraries = applyBadges([...byId.values()]);
  return {
    ...incoming,
    sessionId: incoming.sessionId || current.sessionId,
    itineraries,
    query: { ...current.query, ...incoming.query },
  };
}

export async function runFlightSearch(input: {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  date: string;
  returnDate?: string;
  adults?: number;
  childrens?: number;
  infants?: number;
  cabinClass?: string;
  sortBy?: string;
  currency?: string;
  market?: string;
  countryCode?: string;
}): Promise<
  | { ok: true; session: FlightSearchSession }
  | { ok: false; errorCode: FlightProviderErrorCode }
> {
  const { runtime, live, travelpayoutsOnly } = await resolveFlightsMode();
  if (travelpayoutsOnly || !live) {
    return { ok: false, errorCode: "provider_travelpayouts" };
  }
  const guestCurrency = guestCurrencyOf(input.currency);
  const currency = PROVIDER_CURRENCY;
  const [origin, destination] = await Promise.all([
    resolveSkyPlace(runtime, input.originSkyId, input.originEntityId),
    resolveSkyPlace(runtime, input.destinationSkyId, input.destinationEntityId),
  ]);
  const query: Record<string, string> = {
    originSkyId: origin.skyId,
    destinationSkyId: destination.skyId,
    originEntityId: origin.entityId,
    destinationEntityId: destination.entityId,
    date: input.date,
    currency,
    guestCurrency,
  };
  if (input.returnDate) query.returnDate = input.returnDate;
  const cabin = cabinClassOf(input.cabinClass);
  const adults = input.adults ?? 1;
  const childrens = input.childrens || 0;
  const infants = input.infants || 0;
  const sortBy = sortByOf(input.sortBy);
  const queryCacheKey = searchQueryCacheKey(query, cabin, adults, childrens, infants, sortBy);
  const cachedSearch = await readFlightsCache<FlightSearchSession>(queryCacheKey, FLIGHTS_SESSION_TTL_MS);
  if (cachedSearch && cachedSearch.itineraries.length > 0) {
    logFlights("search-cache", {
      originSkyId: origin.skyId,
      destSkyId: destination.skyId,
      date: input.date,
      itineraries: cachedSearch.itineraries.length,
    });
    return { ok: true, session: await localizeFlightSession(cachedSearch, guestCurrency) };
  }
  logFlights("search", {
    originSkyId: origin.skyId,
    destSkyId: destination.skyId,
    originResolved: isLiveEntityId(origin.entityId),
    destResolved: isLiveEntityId(destination.entityId),
    originWasSynthetic: !isLiveEntityId(input.originEntityId),
    destWasSynthetic: !isLiveEntityId(input.destinationEntityId),
    date: input.date,
    returnDate: input.returnDate || null,
    cabin,
    adults,
  });
  if (!isLiveEntityId(origin.entityId) || !isLiveEntityId(destination.entityId)) {
    logFlights("search-unresolved-entity", {
      originEntityId: origin.entityId,
      destinationEntityId: destination.entityId,
    });
    return { ok: false, errorCode: "search_failed" };
  }
  const result = await skyScrapperGet(runtime, "searchFlights", "/api/v2/flights/searchFlights", {
    originSkyId: origin.skyId,
    destinationSkyId: destination.skyId,
    originEntityId: origin.entityId,
    destinationEntityId: destination.entityId,
    date: input.date,
    returnDate: input.returnDate,
    adults,
    childrens: childrens || undefined,
    infants: infants || undefined,
    cabinClass: cabin,
    sortBy,
    currency,
    market: marketOf(input.market),
    countryCode: input.countryCode || "US",
  });
  if (!result.ok) {
    logFlights("search-result", {
      ok: false,
      status: result.status,
      errorCode: result.errorCode,
    });
    return { ok: false, errorCode: result.errorCode };
  }
  let session = buildSearchSession(result.payload, runtime.markupRules, currency, query);
  logFlights("search-result", {
    ok: true,
    status: result.status,
    itineraries: session.itineraries.length,
    sessionStatus: session.status,
    payloadKeys: Object.keys(asRecord(result.payload) || {}),
    dataKeys: Object.keys(unwrapData(result.payload)),
    itinerariesKind: Array.isArray(unwrapData(result.payload).itineraries)
      ? "array"
      : unwrapData(result.payload).itineraries == null
        ? "missing"
        : typeof unwrapData(result.payload).itineraries,
    providerMessage: (() => {
      const raw = asRecord(result.payload)?.message ?? unwrapData(result.payload).message;
      if (raw == null) return "";
      return (typeof raw === "string" ? raw : JSON.stringify(raw)).slice(0, 180);
    })(),
  });
  session = await hydrateIncompleteSearch(runtime, session);
  await persistSession(session);
  if (session.itineraries.length > 0) {
    await writeFlightsCache(queryCacheKey, session);
  }
  return { ok: true, session: await localizeFlightSession(session, guestCurrency) };
}

async function hydrateIncompleteSearch(
  runtime: FlightsRuntimeSettings,
  session: FlightSearchSession
): Promise<FlightSearchSession> {
  if (session.status === "complete" || !session.sessionId) {
    return session;
  }
  const requestedId = session.sessionId;
  let current = session;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await sleepMs(1500);
    const result = await skyScrapperGet(runtime, "searchIncomplete", "/api/v2/flights/searchIncomplete", {
      sessionId: current.sessionId || requestedId,
    });
    if (!result.ok) {
      logFlights("search-poll", {
        ok: false,
        attempt,
        status: result.status,
        errorCode: result.errorCode,
      });
      break;
    }
    const incoming = buildSearchSession(result.payload, runtime.markupRules, current.currency, current.query);
    current = mergeSessions(current, incoming);
    current.sessionId = current.sessionId || requestedId;
    await persistSession(current, requestedId);
    logFlights("search-poll", {
      ok: true,
      attempt,
      itineraries: current.itineraries.length,
      sessionStatus: current.status,
    });
    if (current.status === "complete") break;
  }
  return current;
}

export async function runSearchIncomplete(
  sessionId: string,
  guestCurrency?: string
): Promise<
  | { ok: true; session: FlightSearchSession }
  | { ok: false; errorCode: FlightProviderErrorCode }
> {
  const { runtime, live, travelpayoutsOnly } = await resolveFlightsMode();
  if (travelpayoutsOnly || !live) {
    return { ok: false, errorCode: "provider_travelpayouts" };
  }
  const cached = await readFlightsCache<FlightSearchSession>(
    sessionCacheKey(sessionId),
    FLIGHTS_SESSION_TTL_MS
  );
  const result = await skyScrapperGet(
    runtime,
    "searchIncomplete",
    "/api/v2/flights/searchIncomplete",
    { sessionId }
  );
  const guest = guestCurrencyOf(guestCurrency || cached?.query.guestCurrency);
  if (!result.ok) {
    if (cached) return { ok: true, session: await localizeFlightSession(cached, guest) };
    return { ok: false, errorCode: result.errorCode };
  }
  const incoming = buildSearchSession(
    result.payload,
    runtime.markupRules,
    PROVIDER_CURRENCY,
    cached?.query || {}
  );
  const session = cached ? mergeSessions(cached, incoming) : incoming;
  session.sessionId = session.sessionId || sessionId;
  session.currency = PROVIDER_CURRENCY;
  await persistSession(session, sessionId);
  return { ok: true, session: await localizeFlightSession(session, guest) };
}

export async function runMultiStopsSearch(input: {
  legs: string;
  adults?: number;
  cabinClass?: string;
  currency?: string;
}): Promise<
  | { ok: true; session: FlightSearchSession }
  | { ok: false; errorCode: FlightProviderErrorCode }
> {
  const { runtime, live, travelpayoutsOnly } = await resolveFlightsMode();
  if (travelpayoutsOnly || !live) {
    return { ok: false, errorCode: "provider_travelpayouts" };
  }
  const guestCurrency = guestCurrencyOf(input.currency);
  const currency = PROVIDER_CURRENCY;
  let resolvedLegs = input.legs;
  try {
    const parsed = JSON.parse(input.legs) as unknown;
    if (Array.isArray(parsed)) {
      const next = await Promise.all(
        parsed.map(async (item) => {
          const rec = asRecord(item) || {};
          const origin = await resolveSkyPlace(
            runtime,
            str(rec.originSkyId),
            str(rec.originEntityId)
          );
          const destination = await resolveSkyPlace(
            runtime,
            str(rec.destinationSkyId),
            str(rec.destinationEntityId)
          );
          return {
            ...rec,
            originSkyId: origin.skyId,
            destinationSkyId: destination.skyId,
            originEntityId: origin.entityId,
            destinationEntityId: destination.entityId,
          };
        })
      );
      resolvedLegs = JSON.stringify(next);
    }
  } catch {
    resolvedLegs = input.legs;
  }
  const result = await skyScrapperGet(
    runtime,
    "searchFlightsMultiStops",
    "/api/v1/flights/searchFlightsMultiStops",
    {
      legs: resolvedLegs,
      adults: input.adults ?? 1,
      cabinClass: cabinClassOf(input.cabinClass),
      currency,
    }
  );
  if (!result.ok) return { ok: false, errorCode: result.errorCode };
  const session = buildSearchSession(result.payload, runtime.markupRules, currency, {
    legs: input.legs,
    currency,
    guestCurrency,
  });
  await persistSession(session);
  return { ok: true, session: await localizeFlightSession(session, guestCurrency) };
}

export async function runEverywhereSearch(input: {
  originSkyId: string;
  originEntityId: string;
  travelDate?: string;
  currency?: string;
  market?: string;
  countryCode?: string;
}): Promise<
  | { ok: true; destinations: Array<Record<string, unknown>>; raw: unknown }
  | { ok: false; errorCode: FlightProviderErrorCode }
> {
  const { runtime, live, travelpayoutsOnly } = await resolveFlightsMode();
  if (travelpayoutsOnly || !live) {
    return { ok: false, errorCode: "provider_travelpayouts" };
  }
  const guestCurrency = guestCurrencyOf(input.currency);
  const currency = PROVIDER_CURRENCY;
  const origin = await resolveSkyPlace(runtime, input.originSkyId, input.originEntityId);
  const result = await skyScrapperGet(
    runtime,
    "searchFlightEverywhere",
    "/api/v1/flights/searchFlightEverywhere",
    {
      originSkyId: origin.skyId,
      originEntityId: origin.entityId,
      travelDate: input.travelDate,
      currency,
      market: marketOf(input.market),
      countryCode: input.countryCode || "US",
    }
  );
  if (!result.ok) return { ok: false, errorCode: result.errorCode };
  const data = unwrapData(result.payload);
  const everywhere = asRecord(data.everywhereDestination) || {};
  const rows = asArray(
    everywhere.results ||
      data.results ||
      data.everywhereDestinations ||
      data.destinations ||
      data.countries
  );
  const destinations = rows.map((item) => {
    const rec = asRecord(item) || {};
    const content = asRecord(rec.content) || {};
    const quotes = asRecord(content.flightQuotes || rec.flightQuotes) || {};
    const cheapest = asRecord(quotes.cheapest || rec.cheapest) || {};
    const priceRec = asRecord(rec.price) || asRecord(rec.cheapestPrice) || {};
    const base = num(
      priceRec.raw ||
        priceRec.client ||
        cheapest.rawPrice ||
        cheapest.price ||
        rec.price ||
        rec.cheapestPrice
    );
    const dest =
      str(rec.skyId || rec.destinationSkyId || rec.id || rec.entityId || rec.name);
    const marked = applyFlightMarkup(base, runtime.markupRules, {
      origin: origin.skyId,
      destination: dest,
      currency,
    });
    return {
      ...rec,
      price: {
        base: roundFlightPrice(base),
        client: roundFlightPrice(marked.price),
        currency,
      },
    };
  });
  const destinationsFx = await Promise.all(
    destinations.map(async (row) => {
      const price = asRecord(row.price) || {};
      const [baseFx, clientFx] = await Promise.all([
        convertAmountSafe(num(price.base), PROVIDER_CURRENCY, guestCurrency),
        convertAmountSafe(num(price.client), PROVIDER_CURRENCY, guestCurrency),
      ]);
      return {
        ...row,
        price: {
          ...price,
          base: roundFlightPrice(baseFx),
          client: roundFlightPrice(clientFx),
          currency: guestCurrency,
        },
      };
    })
  );
  return { ok: true, destinations: destinationsFx, raw: result.payload };
}

export async function runFlightDetails(input: {
  itineraryId: string;
  legs: string;
  sessionId?: string;
  currency?: string;
  market?: string;
  countryCode?: string;
  quotedClient?: number;
}): Promise<
  | {
      ok: true;
      details: Record<string, unknown>;
      price: PublicFlightPrice;
      itinerary: PublicFlightItinerary | null;
    }
  | { ok: false; errorCode: FlightProviderErrorCode }
> {
  const { runtime, live, travelpayoutsOnly } = await resolveFlightsMode();
  if (travelpayoutsOnly || !live) {
    return { ok: false, errorCode: "provider_travelpayouts" };
  }
  const guestCurrency = guestCurrencyOf(input.currency);
  const currency = PROVIDER_CURRENCY;
  const result = await skyScrapperGet(
    runtime,
    "getFlightDetails",
    "/api/v1/flights/getFlightDetails",
    {
      itineraryId: input.itineraryId,
      legs: input.legs,
      sessionId: input.sessionId,
      currency,
      market: marketOf(input.market),
      countryCode: input.countryCode || "US",
    }
  );
  if (!result.ok) return { ok: false, errorCode: result.errorCode };
  const data = unwrapData(result.payload);
  const itineraryRaw =
    asRecord(data.itinerary) ||
    asRecord(data.itineraryDetails) ||
    asArray(data.itineraries)[0] ||
    data;
  const itinerary = normalizeItinerary(itineraryRaw, runtime.markupRules, currency);
  const priceInfo = extractPrice(asRecord(itineraryRaw) || data);
  const marked = applyFlightMarkup(priceInfo.base || itinerary?.price.base || 0, runtime.markupRules, {
    ...markupContextFromLegs(itinerary?.legs || []),
    currency,
  });
  const usdClient = roundFlightPrice(itinerary?.price.client ?? marked.price);
  const usdBase = roundFlightPrice(priceInfo.base || itinerary?.price.base || 0);
  const [client, base] = await Promise.all([
    convertAmountSafe(usdClient, PROVIDER_CURRENCY, guestCurrency),
    convertAmountSafe(usdBase, PROVIDER_CURRENCY, guestCurrency),
  ]);
  const localizedItinerary = itinerary
    ? {
        ...itinerary,
        price: {
          ...itinerary.price,
          base: roundFlightPrice(base),
          client: roundFlightPrice(client),
          currency: guestCurrency,
          formatted: undefined,
        },
      }
    : null;
  const quoted = Number(input.quotedClient);
  const fareChanged =
    Number.isFinite(quoted) && quoted > 0 && Math.abs(roundFlightPrice(client) - quoted) >= 0.5;
  return {
    ok: true,
    details: data,
    itinerary: localizedItinerary,
    price: {
      base: roundFlightPrice(base),
      client: roundFlightPrice(client),
      currency: guestCurrency,
      formatted: priceInfo.formatted,
      fareChanged,
    },
  };
}

export async function runSystemConfig(): Promise<{
  config: unknown | null;
  locale: unknown | null;
  health: unknown | null;
}> {
  const { runtime, live } = await resolveFlightsMode();
  if (!live) return { config: null, locale: null, health: null };

  const readOrFetch = async (
    endpointId: string,
    path: string,
    ttl: number,
    cacheName: string
  ): Promise<unknown | null> => {
    const cacheKey = flightsCacheKey([cacheName]);
    const cached = await readFlightsCache<unknown>(cacheKey, ttl);
    if (cached != null) return cached;
    const result = await skyScrapperGet(runtime, endpointId, path, {});
    if (!result.ok) return null;
    await writeFlightsCache(cacheKey, result.payload);
    return result.payload;
  };

  const [config, locale] = await Promise.all([
    readOrFetch("getConfig", "/api/v1/getConfig", FLIGHTS_CONFIG_TTL_MS, "sys-config"),
    readOrFetch("getLocale", "/api/v1/getLocale", FLIGHTS_LOCALE_TTL_MS, "sys-locale"),
  ]);
  return { config, locale, health: null };
}

export async function runServerHealth(): Promise<unknown | null> {
  const { runtime, live } = await resolveFlightsMode();
  if (!live) return null;
  const result = await skyScrapperGet(runtime, "checkServer", "/api/v1/checkServer", {});
  return result.ok ? result.payload : null;
}

export function encodeLegs(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  try {
    return JSON.stringify(value ?? []);
  } catch {
    return "[]";
  }
}
