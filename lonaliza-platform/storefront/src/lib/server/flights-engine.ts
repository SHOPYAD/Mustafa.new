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
import { getUsdRateTable } from "@/lib/server/iyzico-fx";
import { flightSearchFlight } from "@/lib/server/single-flight";
import {
  ensureSkyEntityMap,
  lookupSkyEntity,
  rememberSkyPlace,
} from "@/lib/server/sky-entity-ids";
import {
  TravelportAirAdapter,
  SeeruAirAdapter,
  PkfareAirAdapter,
  BiletbankAirAdapter,
  parsePkfareAncillaryBags,
  parsePkfareMiniRules,
  parsePkfarePenaltyTexts,
  type AirOffer,
  type FarePenalty,
  type SeeruSearchJob,
} from "@/lib/providers/adapters";
import { getProvidersRegistry } from "@/lib/server/providers-registry-store";
import { resolveAirportsForCode } from "@/lib/server/airports-db";
import { toPkfareAirportIata, toPkfareCityIata } from "@/lib/providers/adapters/pkfare/pkfareIata";
import { getLocalizedAirlineName } from "@/lib/flights/airline-dictionary";
import { collapseFarePenalties } from "@/lib/flights/fare-penalties";

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
  terminal?: string;
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
  carrierName?: string;
  carrierCode?: string;
  baggageAllowance?: any;
};

export type PublicFlightPrice = {
  base: number;
  client: number;
  currency: string;
  formatted?: string;
  taxes?: number;
  fareChanged?: boolean;
};

export type PublicBaggageState =
  | { status: "included"; pieces?: number; kg?: number; text?: string }
  | { status: "none"; text?: string }
  | { status: "unknown" };

export type PublicFareAttribute = "included" | "chargeable" | "not_available" | "unknown";

export type PublicFarePenalty = {
  type: "change" | "cancel" | "no_show";
  amount?: number;
  currency?: string;
  percent?: number;
  window?: string;
  text?: string;
};

export type PublicFareFamily = {
  id: string;
  name: string;
  /** "supplier" = brand name filed by the airline/supplier; "derived" = descriptive label built from the rules. */
  nameSource?: "supplier" | "derived";
  brandCode?: string;
  cabin?: string;
  price: PublicFlightPrice;
  /** Legacy one-line label (kept for old consumers). Empty when unknown — never "23 kg" by default. */
  baggage?: string;
  baggageDetail?: { checked: PublicBaggageState; cabin: PublicBaggageState };
  attributes?: {
    refund: PublicFareAttribute;
    change: PublicFareAttribute;
    seat: PublicFareAttribute;
    meal: PublicFareAttribute;
    priority: PublicFareAttribute;
  };
  penalties?: PublicFarePenalty[];
  rulesText?: string;
  changeable?: boolean;
  refundable?: boolean;
  isBestPrice?: boolean;
  canAddPaidBaggage?: boolean;
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
  farePolicy?: any;
  fareFamilies?: PublicFareFamily[];
  sessionLegsPayload?: string;
  baggage?: any;
  baggageAllowance?: string;
  /** True when the live offer can be priced for extra checked bags. */
  canAddPaidBaggage?: boolean;
};

/** Server-only: everything needed to price/book one fare option. Never returned to the browser. */
export type StoredFareToken = {
  fareId: string;
  offerId: string;
  supplier: "travelport" | "seeru" | "pkfare" | "biletbank";
  supplierToken: string;
  supplierContext?: Record<string, string>;
  price: { total: number; base: number; taxes?: number; currency: string };
  brandName: string;
  cabin: string;
};

export type FlightSearchContext = {
  seeruJobs?: SeeruSearchJob[];
  skyIncomplete?: boolean;
};

export type FlightSearchSession = {
  sessionId: string;
  status: "complete" | "incomplete";
  itineraries: PublicFlightItinerary[];
  currency: string;
  query: Record<string, string>;
  rawContext?: FlightSearchContext;
  /** fareId → token (server-only, stripped by the API routes which only expose `itineraries`). */
  fareTokens?: Record<string, StoredFareToken>;
  /** offerId → supplier raw offer (server-only; needed by PKFARE/Seeru booking payloads). */
  rawOffers?: Record<string, unknown>;
};

export function collectFareTokens(offers: AirOffer[]): { fareTokens: Record<string, StoredFareToken>; rawOffers: Record<string, unknown> } {
  const fareTokens: Record<string, StoredFareToken> = {};
  const rawOffers: Record<string, unknown> = {};
  for (const offer of offers) {
    if (offer.rawOfferData !== undefined) rawOffers[offer.id] = offer.rawOfferData;
    for (const opt of offer.fareOptions || []) {
      fareTokens[opt.id] = {
        fareId: opt.id,
        offerId: offer.id,
        supplier: opt.supplier,
        supplierToken: opt.supplierToken,
        supplierContext: opt.supplierContext,
        price: opt.price,
        brandName: opt.brandName,
        cabin: opt.cabin,
      };
    }
  }
  return { fareTokens, rawOffers };
}

function fareAttrRank(state?: string): number {
  if (state === "included") return 3;
  if (state === "chargeable") return 2;
  if (state === "unknown" || !state) return 1;
  return 0;
}

function fareBagRank(state?: PublicBaggageState): number {
  if (!state) return 1;
  if (state.status === "included") return 10 + (state.pieces || 0) + (state.kg || 0) / 10;
  if (state.status === "unknown") return 1;
  return 0;
}

function cheapestChangePenalty(fare: PublicFareFamily): number | null {
  const amounts = (fare.penalties || [])
    .filter((p) => p.type === "change" && p.amount != null)
    .map((p) => Number(p.amount));
  if (!amounts.length) return null;
  return Math.min(...amounts);
}

function fareFamilySignature(fare: PublicFareFamily): string {
  const bag = fare.baggageDetail?.checked;
  const bagKey =
    bag?.status === "included"
      ? `${bag.pieces || 0}x${bag.kg || 0}`
      : bag?.status || fare.baggage || "";
  return [
    String(fare.name || "").trim().toUpperCase(),
    String(fare.brandCode || "").trim().toUpperCase(),
    Math.round((fare.price?.client || 0) * 100),
    bagKey,
    fare.attributes?.refund || "",
    fare.attributes?.change || "",
  ].join("|");
}

function uniqueFareFamilies(fares?: PublicFareFamily[]): PublicFareFamily[] {
  const seen = new Map<string, PublicFareFamily>();
  for (const fare of fares || []) {
    const key = fareFamilySignature(fare);
    if (!seen.has(key)) seen.set(key, fare);
  }
  return Array.from(seen.values());
}

/** Drop a dearer fare that is equal-or-worse on bags, refund, change, and change-fee. Never drop a named brand. */
export function pruneDominatedFareFamilies(fares?: PublicFareFamily[]): PublicFareFamily[] {
  const list = uniqueFareFamilies(fares).sort((a, b) => (a.price?.client || 0) - (b.price?.client || 0));
  const kept: PublicFareFamily[] = [];
  for (const fare of list) {
    const fareBrand = String(fare.name || fare.brandCode || "").trim().toUpperCase();
    const dominated = kept.some((cheaper) => {
      const cheapBrand = String(cheaper.name || cheaper.brandCode || "").trim().toUpperCase();
      if (fare.nameSource === "supplier" && fareBrand) return false;
      if (fareBrand && cheapBrand && fareBrand !== cheapBrand && fare.nameSource === "supplier" && cheaper.nameSource === "supplier") {
        return false;
      }
      const cheap = cheaper.price?.client || 0;
      const dear = fare.price?.client || 0;
      if (!(cheap > 0 && dear >= cheap)) return false;
      const cheapRefund = cheaper.attributes?.refund;
      const dearRefund = fare.attributes?.refund;
      const cheapChange = cheaper.attributes?.change;
      const dearChange = fare.attributes?.change;
      if (!cheapRefund || cheapRefund === "unknown" || !dearRefund || dearRefund === "unknown") return false;
      if (!cheapChange || cheapChange === "unknown" || !dearChange || dearChange === "unknown") return false;
      if (fareBagRank(cheaper.baggageDetail?.checked) < fareBagRank(fare.baggageDetail?.checked)) return false;
      if (fareBagRank(cheaper.baggageDetail?.cabin) < fareBagRank(fare.baggageDetail?.cabin)) return false;
      if (fareAttrRank(cheapRefund) < fareAttrRank(dearRefund)) return false;
      if (fareAttrRank(cheapChange) < fareAttrRank(dearChange)) return false;
      const cheapFee = cheapestChangePenalty(cheaper);
      const dearFee = cheapestChangePenalty(fare);
      if (cheapFee != null && dearFee != null && cheapFee > dearFee + 0.5) return false;
      return true;
    });
    if (!dominated) kept.push({ ...fare, isBestPrice: false });
  }
  if (kept[0]) kept[0].isBestPrice = true;
  return kept;
}

/** Union of fare families of the same flights sold by different suppliers, cheapest first. */
export function mergeFareFamilies(a?: PublicFareFamily[], b?: PublicFareFamily[]): PublicFareFamily[] {
  const all = [...(a || []), ...(b || [])];
  if (!all.length) return [];
  const cheapest = [...all].sort((x, y) => (x.price?.client || Infinity) - (y.price?.client || Infinity))[0];
  const want = fareCabinBucket(cheapest?.cabin, cheapest?.name);
  const filtered = all.filter((f) => {
    const got = fareCabinBucket(f.cabin, f.name);
    if (want === "unknown") return true;
    return got === want || got === "unknown";
  });
  const seen = new Map<string, PublicFareFamily>();
  for (const f of filtered) {
    const key =
      String(f.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .replace(/^economy/, "eco")
        .replace(/^business/, "biz") || f.id;
    const prev = seen.get(key);
    if (!prev || (f.price?.client || Infinity) < (prev.price?.client || Infinity)) {
      seen.set(key, { ...f, isBestPrice: false });
    }
  }
  return pruneDominatedFareFamilies(Array.from(seen.values()));
}

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

function markupSupplierAmount(
  amount: number,
  markupRules: FlightMarkupRule[],
  ctx: { origin?: string; destination?: string; currency?: string }
): number {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return Number.isFinite(n) && n === 0 ? 0 : 0;
  return roundFlightPrice(applyFlightMarkup(n, markupRules, ctx).price);
}

function markupPenalties(
  penalties: PublicFarePenalty[] | undefined,
  markupRules: FlightMarkupRule[],
  ctx: { origin: string; destination: string; currency: string }
): PublicFarePenalty[] | undefined {
  if (!penalties?.length) return penalties;
  return penalties.map((p) => {
    if (p.amount == null || p.amount <= 0) return p;
    return { ...p, amount: markupSupplierAmount(p.amount, markupRules, ctx) };
  });
}

function mergePenaltyLists(base: PublicFarePenalty[] | undefined, extra: PublicFarePenalty[] | undefined): PublicFarePenalty[] {
  return collapseFarePenalties([...(base || []), ...(extra || [])]).penalties;
}

function fareFromPkfareRules(
  fare: PublicFareFamily,
  rules: { penalties: PublicFarePenalty[]; refundable: PublicFareAttribute; changeable: PublicFareAttribute },
  markupRules: FlightMarkupRule[],
  ctx: { origin: string; destination: string; currency: string }
): PublicFareFamily {
  const merged = collapseFarePenalties(mergePenaltyLists(fare.penalties, rules.penalties));
  const penalties = markupPenalties(merged.penalties, markupRules, ctx);
  const refund =
    merged.refundable !== "unknown"
      ? merged.refundable
      : rules.refundable !== "unknown"
        ? rules.refundable
        : fare.attributes?.refund || "unknown";
  const change =
    merged.changeable !== "unknown"
      ? merged.changeable
      : rules.changeable !== "unknown"
        ? rules.changeable
        : fare.attributes?.change || "unknown";
  return {
    ...fare,
    attributes: {
      refund,
      change,
      seat: fare.attributes?.seat || "unknown",
      meal: fare.attributes?.meal || "unknown",
      priority: fare.attributes?.priority || "unknown",
    },
    penalties,
    refundable: refund === "included" || refund === "chargeable",
    changeable: change === "included" || change === "chargeable",
  };
}

/** RapidAPI always sees USD so switching guest currency does not burn quota. */
const PROVIDER_CURRENCY = "USD";

function guestCurrencyOf(value: unknown): string {
  return str(value).toUpperCase() || PROVIDER_CURRENCY;
}

function fareCabinBucket(cabin?: string, brand?: string): "economy" | "premium_economy" | "business" | "first" | "unknown" {
  const t = `${cabin || ""} ${brand || ""}`.toLowerCase();
  if (/\bfirst\b/.test(t)) return "first";
  if (/\bbusiness\b/.test(t)) return "business";
  if (/premium/.test(t) && /econ/.test(t)) return "premium_economy";
  if (/econ|coach|saver|eco\b|ecojet|basic|standard|flex/.test(t) && !/\bbusiness\b/.test(t)) return "economy";
  return "unknown";
}

function requestedCabinBucket(cabin?: string): "economy" | "premium_economy" | "business" | "first" | "any" {
  const t = String(cabin || "economy").toLowerCase();
  if (t === "any") return "any";
  if (t.includes("business")) return "business";
  if (t.includes("first")) return "first";
  if (t.includes("premium")) return "premium_economy";
  return "economy";
}

function filterOptionsForCabin<T extends { cabin?: string; brandName?: string; name?: string }>(
  options: T[] | undefined,
  requested?: string
): T[] {
  const list = options || [];
  const want = requestedCabinBucket(requested);
  if (want === "any" || !list.length) return list;
  const matched = list.filter((opt) => {
    const got = fareCabinBucket(opt.cabin, opt.brandName || opt.name);
    if (want === "economy") return got === "economy" || got === "unknown";
    return got === want || got === "unknown";
  });
  return matched;
}

async function usdPerUnit(currency: string): Promise<number> {
  const from = guestCurrencyOf(currency);
  if (from === PROVIDER_CURRENCY) return 1;
  const table = await getUsdRateTable();
  const perUsd = Number(table.rates[from]);
  if (Number.isFinite(perUsd) && perUsd > 0) return 1 / perUsd;
  const converted = await convertAmountSafe(1, from, PROVIDER_CURRENCY);
  return converted > 0 && converted !== 1 ? converted : 0;
}

async function convertPenaltyToUsd(
  penalty: FarePenalty,
  offerRate: number,
  offerFrom: string
): Promise<FarePenalty> {
  if (penalty.amount == null || penalty.amount <= 0) {
    return { ...penalty, currency: penalty.currency || PROVIDER_CURRENCY };
  }
  const from = guestCurrencyOf(penalty.currency || offerFrom);
  if (from === PROVIDER_CURRENCY) return { ...penalty, currency: PROVIDER_CURRENCY };
  const rate = from === offerFrom && offerRate > 0 ? offerRate : await usdPerUnit(from);
  if (!(rate > 0)) return penalty;
  return { ...penalty, amount: roundFlightPrice(Number(penalty.amount) * rate), currency: PROVIDER_CURRENCY };
}

async function convertOfferToUsd(offer: AirOffer): Promise<AirOffer> {
  const from = guestCurrencyOf(offer.price.currency);
  const rate = from === PROVIDER_CURRENCY ? 1 : await usdPerUnit(from);
  if (from !== PROVIDER_CURRENCY && !(rate > 0)) {
    logFlights("fx-drop-offer", { provider: offer.provider, from, total: offer.price.total });
    return { ...offer, fareOptions: [], price: { ...offer.price, total: 0, base: 0, currency: PROVIDER_CURRENCY } };
  }
  const conv = (n: number) => (from === PROVIDER_CURRENCY ? Number(n || 0) : roundFlightPrice(Number(n || 0) * rate));
  const fareOptions = await Promise.all(
    (offer.fareOptions || []).map(async (opt) => ({
      ...opt,
      price: {
        ...opt.price,
        total: conv(opt.price.total),
        base: conv(opt.price.base),
        taxes: conv(opt.price.taxes || 0),
        currency: PROVIDER_CURRENCY,
      },
      penalties: opt.penalties?.length
        ? await Promise.all(opt.penalties.map((p) => convertPenaltyToUsd(p, rate, from)))
        : opt.penalties,
    }))
  );
  return {
    ...offer,
    price: {
      ...offer.price,
      total: conv(offer.price.total),
      base: conv(offer.price.base),
      taxes: conv(offer.price.taxes || 0),
      currency: PROVIDER_CURRENCY,
    },
    fareOptions,
  };
}

async function offersToItineraries(
  offers: AirOffer[],
  markupRules: FlightMarkupRule[],
  guestCurrency: string,
  requestedCabin?: string
): Promise<PublicFlightItinerary[]> {
  const converted = await Promise.all(offers.map(convertOfferToUsd));
  const out: PublicFlightItinerary[] = [];
  for (const offer of converted) {
    if (!(Number(offer.price.total) > 0)) continue;
    const fareOptions = filterOptionsForCabin(offer.fareOptions, requestedCabin);
    if ((offer.fareOptions || []).length > 0 && fareOptions.length === 0) continue;
    const itinerary = airOfferToItinerary({ ...offer, fareOptions }, markupRules, guestCurrency);
    if (!(itinerary.price.client > 0)) continue;
    out.push(itinerary);
  }
  return out;
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
            penalties: fare.penalties?.map((p) => ({ ...p, currency: p.currency || guest })),
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
              const penalties = fare.penalties?.length
                ? await Promise.all(
                    fare.penalties.map(async (p) => {
                      if (p.amount == null || p.amount <= 0) return { ...p, currency: p.currency || guest };
                      const converted = await convertAmountSafe(p.amount, guestCurrencyOf(p.currency || fareFrom), guest);
                      return { ...p, amount: roundFlightPrice(converted), currency: guest };
                    })
                  )
                : fare.penalties;
              return {
                ...fare,
                price: {
                  ...fare.price,
                  base: roundFlightPrice(fareBase),
                  client: roundFlightPrice(fareClient),
                  currency: guest,
                },
                penalties,
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

export function markupContextFromLegs(legs: PublicFlightLeg[]): FlightMarkupContext {
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

function calendarAirportIata(code: string): string {
  return toPkfareAirportIata(code) || String(code || "").trim().toUpperCase().slice(0, 3);
}

function expandCalendarProbeDates(monthStarts: string[], centerDate: string): string[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const candidates = new Set<string>();
  const add = (value: Date) => {
    if (value < today) return;
    candidates.add(value.toISOString().slice(0, 10));
  };
  for (const monthStart of monthStarts) {
    const parts = monthStart.match(/^(\d{4})-(\d{2})/);
    if (!parts) continue;
    const y = Number(parts[1]);
    const m = Number(parts[2]);
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (let day = 1; day <= last; day += 3) {
      add(new Date(Date.UTC(y, m - 1, day)));
    }
  }
  const centerRaw = centerDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || "";
  if (centerRaw) add(new Date(`${centerRaw}T12:00:00Z`));
  const centerMs = Date.parse(`${centerRaw || monthStarts[0] || today.toISOString().slice(0, 10)}T12:00:00Z`);
  return Array.from(candidates)
    .sort((a, b) => Math.abs(Date.parse(`${a}T12:00:00Z`) - centerMs) - Math.abs(Date.parse(`${b}T12:00:00Z`) - centerMs))
    .slice(0, 10)
    .sort();
}

async function fetchPkfareCalendarDays(
  originCode: string,
  destCode: string,
  monthStarts: string[],
  centerDate: string,
  markupRules: FlightMarkupRule[]
): Promise<Array<{ date: string; price: PublicFlightPrice }>> {
  const registry = await getProvidersRegistry();
  if (!registry.providers.pkfare?.enabled) return [];
  const origin = calendarAirportIata(originCode);
  const dest = calendarAirportIata(destCode);
  if (!origin || !dest) return [];
  const dates = expandCalendarProbeDates(monthStarts, centerDate);
  const adapter = new PkfareAirAdapter();
  const found: Array<{ date: string; base: number }> = [];
  for (let i = 0; i < dates.length; i += 4) {
    const batch = dates.slice(i, i + 4);
    const rows = await Promise.all(
      batch.map(async (date) => {
        try {
          const offers = await adapter.searchFlights({
            origin,
            destination: dest,
            departureDate: date,
            adults: 1,
            cabinClass: "economy",
            solutions: 3,
          });
          let min = Infinity;
          for (const offer of offers) {
            const usd = await convertOfferToUsd(offer);
            const total = Number(usd.price.total);
            if (total > 0 && total < min) min = total;
          }
          if (!Number.isFinite(min) || min <= 0) return null;
          return { date, base: min };
        } catch {
          return null;
        }
      })
    );
    for (const row of rows) if (row) found.push(row);
  }
  const ctx: FlightMarkupContext = { origin, destination: dest, currency: PROVIDER_CURRENCY };
  logFlights("calendar-pkfare", { origin, dest, probed: dates.length, priced: found.length });
  return found.map((row) => ({
    date: row.date,
    price: {
      base: roundFlightPrice(row.base),
      client: markupSupplierAmount(row.base, markupRules, ctx),
      currency: PROVIDER_CURRENCY,
    },
  }));
}

export async function runPriceCalendar(input: {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  fromDate: string;
  toDate?: string;
  centerDate?: string;
  currency?: string;
}): Promise<
  | { ok: true; days: Array<{ date: string; price: PublicFlightPrice }>; raw: unknown }
  | { ok: false; errorCode: FlightProviderErrorCode }
> {
  const { runtime } = await resolveFlightsMode();
  const guestCurrency = guestCurrencyOf(input.currency);
  const currency = PROVIDER_CURRENCY;
  const [origin, destination] = await Promise.all([
    resolveSkyPlace(runtime, input.originSkyId, input.originEntityId),
    resolveSkyPlace(runtime, input.destinationSkyId, input.destinationEntityId),
  ]);
  const monthStarts: string[] = [];
  const fromParts = str(input.fromDate).match(/^(\d{4})-(\d{2})/);
  const toParts = str(input.toDate || input.fromDate).match(/^(\d{4})-(\d{2})/);
  if (fromParts && toParts) {
    let y = Number(fromParts[1]);
    let m = Number(fromParts[2]);
    const endY = Number(toParts[1]);
    const endM = Number(toParts[2]);
    while (monthStarts.length < 3 && (y < endY || (y === endY && m <= endM))) {
      monthStarts.push(`${y}-${String(m).padStart(2, "0")}-01`);
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
  }
  if (!monthStarts.length) monthStarts.push(str(input.fromDate) || new Date().toISOString().slice(0, 10));

  const cacheKey = flightsCacheKey([
    "calendar-v4",
    origin.skyId,
    destination.skyId,
    monthStarts.join("|"),
    currency,
  ]);
  const cached = await readFlightsCache<{ days: Array<{ date: string; price: PublicFlightPrice }>; raw: unknown }>(
    cacheKey,
    FLIGHTS_CALENDAR_TTL_MS
  );
  let days: Array<{ date: string; price: PublicFlightPrice }> = cached?.days || [];
  let payload: unknown = cached?.raw;

  if (!days.length) {
    days = await fetchPkfareCalendarDays(
      origin.skyId,
      destination.skyId,
      monthStarts,
      str(input.centerDate || input.fromDate),
      runtime.markupRules
    );
    if (days.length) payload = { source: "supplier-probe", days: days.length };
  }

  if (days.length) {
    await writeFlightsCache(cacheKey, { days, raw: payload });
  } else {
    logFlights("calendar-empty", { origin: origin.skyId, dest: destination.skyId, months: monthStarts });
  }

  const daysFx = await Promise.all(
    days.map(async (row) => {
      const [base, client] = await Promise.all([
        convertAmountSafe(row.price.base, PROVIDER_CURRENCY, guestCurrency),
        convertAmountSafe(row.price.client, PROVIDER_CURRENCY, guestCurrency),
      ]);
      if (!(client > 0)) return null;
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
  return {
    ok: true,
    days: daysFx.filter((row): row is { date: string; price: PublicFlightPrice } => Boolean(row)),
    raw: payload,
  };
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
    "searchq-v12",
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
  const itineraries = applyBadges(deduplicateAndEnrichFlights([...current.itineraries, ...incoming.itineraries]));
  return {
    ...incoming,
    sessionId: incoming.sessionId || current.sessionId,
    itineraries,
    query: { ...current.query, ...incoming.query },
    fareTokens: { ...(current.fareTokens || {}), ...(incoming.fareTokens || {}) },
    rawOffers: { ...(current.rawOffers || {}), ...(incoming.rawOffers || {}) },
    rawContext: {
      ...(current.rawContext || {}),
      ...(incoming.rawContext || {}),
      seeruJobs: incoming.rawContext?.seeruJobs || current.rawContext?.seeruJobs,
    },
  };
}

function sessionStatusFromContext(session: FlightSearchSession): "complete" | "incomplete" {
  const ctx = session.rawContext || {};
  const seeruPending = (ctx.seeruJobs || []).some((j) => j.complete < 100);
  if (ctx.skyIncomplete || seeruPending) return "incomplete";
  return "complete";
}

/** Short label for a checked-baggage state; empty string when unknown (the UI shows its own "unknown" copy). */
export function baggageStateLabel(state: PublicBaggageState | undefined): string {
  if (!state) return "";
  if (state.status === "none") return "0kg";
  if (state.status === "unknown") return "";
  if (state.pieces && state.kg) return `${state.pieces} x ${state.kg} kg`;
  if (state.kg) return `${state.kg} kg`;
  if (state.pieces) return `${state.pieces} pc`;
  return state.text || "included";
}

export function airOfferToItinerary(
  offer: AirOffer,
  markupRules: FlightMarkupRule[],
  guestCurrency: string
): PublicFlightItinerary {
  const legs: PublicFlightLeg[] = (offer.legs || []).map((leg, idx: number) => {
    const originCode = leg.origin || "JED";
    const destCode = leg.destination || "DXB";
    const segments: PublicFlightSegment[] = (leg.segments || []).map((seg) => {
      const flNum = seg.flightNumber
        ? seg.flightNumber.startsWith(seg.airlineCode)
          ? seg.flightNumber
          : `${seg.airlineCode}${seg.flightNumber}`
        : `${leg.carrierCode}${leg.flightNumber || ""}`;

      const segCode = seg.airlineCode || leg.carrierCode;
      const segLocName = getLocalizedAirlineName(segCode, "ar");
      const segName = segLocName || (seg.airlineName && seg.airlineName !== segCode ? seg.airlineName : "") || segCode;

      return {
        flightNumber: flNum,
        airline: segName,
        airlineCode: segCode,
        aircraft: seg.aircraftName || seg.aircraftCode || "",
        origin: {
          skyId: seg.departureAirport || originCode,
          displayCode: seg.departureAirport || originCode,
          name: seg.departureAirportName || undefined,
          city: seg.departureCity || undefined,
        },
        destination: {
          skyId: seg.arrivalAirport || destCode,
          displayCode: seg.arrivalAirport || destCode,
          name: seg.arrivalAirportName || undefined,
          city: seg.arrivalCity || undefined,
        },
        departure: seg.departureTime || leg.departureDate,
        arrival: seg.arrivalTime || leg.arrivalDate,
        durationMinutes: seg.durationMinutes || leg.durationMinutes || 0,
      };
    });

    const carrierCode = leg.carrierCode || segments[0]?.airlineCode || offer.validatingCarrier || "";
    const carrierLocName = getLocalizedAirlineName(carrierCode, "ar");
    const carrierName = carrierLocName || (leg.carrierName && leg.carrierName !== carrierCode ? leg.carrierName : "") || segments[0]?.airline || carrierCode;

    if (segments.length === 0) {
      segments.push({
        flightNumber: `${carrierCode}${leg.flightNumber || ""}`,
        airline: carrierName,
        airlineCode: carrierCode,
        aircraft: "",
        origin: { skyId: originCode, displayCode: originCode },
        destination: { skyId: destCode, displayCode: destCode },
        departure: leg.departureDate,
        arrival: leg.arrivalDate,
        durationMinutes: leg.durationMinutes || 0,
      });
    }

    return {
      id: `${offer.id}_leg_${idx}`,
      origin: { skyId: originCode, displayCode: originCode },
      destination: { skyId: destCode, displayCode: destCode },
      departure: leg.departureDate,
      arrival: leg.arrivalDate,
      durationMinutes: leg.durationMinutes || 0,
      stopCount: leg.stops || 0,
      carrierName,
      carrierCode,
      segments,
    };
  });

  const totalDuration = legs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const maxStops = Math.max(0, ...legs.map((l) => l.stopCount));
  const airlines = Array.from(
    new Set(legs.flatMap((l) => l.segments.map((s) => s.airlineCode || s.airline || "")))
  ).filter(Boolean);

  const supplierTotal =
    Number(offer.price.total) > 0
      ? Number(offer.price.total)
      : Number(offer.price.base || 0) + Number(offer.price.taxes || 0);
  const markupCtx = {
    origin: offer.legs[0]?.origin || "",
    destination: offer.legs[offer.legs.length - 1]?.destination || "",
    currency: offer.price.currency || PROVIDER_CURRENCY,
  };
  const clientPrice = markupSupplierAmount(supplierTotal, markupRules, markupCtx);
  const badges: string[] = [];
  if (maxStops === 0) badges.push("مباشر");

  const route = {
    origin: offer.legs[0]?.origin || "",
    destination: offer.legs[offer.legs.length - 1]?.destination || "",
  };
  const options = Array.isArray(offer.fareOptions) ? offer.fareOptions : [];
  const bestOption = options.find((o) => o.isBestPrice) || options[0];

  // Baggage badge only when the supplier actually stated an allowance.
  const checked = bestOption?.baggage.checked;
  if (checked?.status === "included") {
    if (checked.kg && checked.pieces) badges.push(`${checked.pieces} × ${checked.kg} كجم حقائب`);
    else if (checked.kg) badges.push(`${checked.kg} كجم حقائب`);
    else if (checked.pieces) badges.push(`${checked.pieces} حقيبة مسجلة`);
    else badges.push("أمتعة مسجلة مشمولة");
  } else if (checked?.status === "none") {
    badges.push("بدون أمتعة مسجلة");
  }

  if (offer.refundable) {
    badges.push("قابل للاسترجاع");
  }

  const fareFamilies: PublicFareFamily[] = options.map((opt) => {
    const optTotal =
      Number(opt.price.total) > 0
        ? Number(opt.price.total)
        : Number(opt.price.base || 0) + Number(opt.price.taxes || 0);
    const brandCtx = {
      ...route,
      currency: opt.price.currency || offer.price.currency || PROVIDER_CURRENCY,
    };
    const policy = collapseFarePenalties(opt.penalties);
    const refund = policy.refundable !== "unknown" ? policy.refundable : opt.refundable;
    const change = policy.changeable !== "unknown" ? policy.changeable : opt.changeable;
    return {
      id: opt.id,
      name: opt.brandName,
      nameSource: opt.nameSource,
      brandCode: opt.brandCode,
      cabin: opt.cabin,
      price: {
        base: roundFlightPrice(opt.price.base),
        client: markupSupplierAmount(optTotal, markupRules, brandCtx),
        currency: opt.price.currency || offer.price.currency || PROVIDER_CURRENCY,
        taxes: roundFlightPrice(opt.price.taxes || 0),
      },
      baggage: baggageStateLabel(opt.baggage.checked),
      baggageDetail: { checked: opt.baggage.checked, cabin: opt.baggage.cabin },
      attributes: {
        refund,
        change,
        seat: opt.seatSelection,
        meal: opt.meal,
        priority: opt.priority,
      },
      penalties: markupPenalties(policy.penalties, markupRules, brandCtx),
      rulesText: opt.rulesText,
      refundable: refund === "included" || refund === "chargeable",
      changeable: change === "included" || change === "chargeable",
      isBestPrice: opt.isBestPrice,
      canAddPaidBaggage: offer.provider === "pkfare",
    };
  });

  const bag = bestOption?.baggage;
  const baggageLabel = bag ? baggageStateLabel(bag.checked) : "";

  return {
    id: offer.id,
    legs,
    price: {
      base: roundFlightPrice(supplierTotal),
      client: clientPrice,
      currency: offer.price.currency || PROVIDER_CURRENCY,
    },
    stops: maxStops,
    durationMinutes: totalDuration,
    airlines: airlines.length > 0 ? airlines : [offer.validatingCarrier || offer.provider],
    badges,
    fareFamilies: pruneDominatedFareFamilies(fareFamilies),
    baggage: bag,
    baggageAllowance: baggageLabel || undefined,
    canAddPaidBaggage: offer.provider === "pkfare",
    farePolicy: {
      provider: offer.provider,
      validatingCarrier: offer.validatingCarrier,
      refundable: offer.refundable,
      refundableInfo: offer.refundableInfo,
      modifiable: offer.modifiable,
      changePenalty: offer.changePenalty,
      cancelPenalty: offer.cancelPenalty,
      canVoid: Boolean((offer as any).canVoid || (offer.rawOfferData as any)?.can_void),
      canHold: Boolean((offer as any).canHold || (offer.rawOfferData as any)?.can_hold),
      ticketingDeadline: offer.ticketingDeadline,
      baggage: bag,
    },
  };
}

function fingerprintFlightNum(code: string, flightNumber: string): string {
  const airline = (code || "").trim().toUpperCase();
  let num = (flightNumber || "").trim().toUpperCase().split(/[\s-]/)[0] || "";
  if (airline && num.startsWith(airline)) num = num.slice(airline.length);
  num = num.replace(/^0+/, "") || num;
  return `${airline}${num}`;
}

export function getFlightFingerprint(itinerary: PublicFlightItinerary): string {
  const parts: string[] = [];
  for (const leg of itinerary.legs || []) {
    for (const seg of leg.segments || []) {
      const code = (seg.airlineCode || "").trim().toUpperCase();
      const num = fingerprintFlightNum(code, seg.flightNumber || "");
      const orig = (seg.origin?.displayCode || seg.origin?.skyId || "").trim().toUpperCase();
      const dest = (seg.destination?.displayCode || seg.destination?.skyId || "").trim().toUpperCase();
      const dep = (seg.departure || "").slice(0, 16);
      parts.push(`${num}-${orig}-${dest}-${dep}`);
    }
  }
  return parts.length > 0 ? parts.join("||") : itinerary.id;
}

export function deduplicateAndEnrichFlights(
  itineraries: PublicFlightItinerary[]
): PublicFlightItinerary[] {
  const map = new Map<string, PublicFlightItinerary>();

  for (const it of itineraries) {
    const fp = getFlightFingerprint(it);
    const existing = map.get(fp);

    if (!existing) {
      map.set(fp, it);
      continue;
    }

    const existingClient = existing.price?.client || Infinity;
    const currentClient = it.price?.client || Infinity;

    const preferCurrent =
      currentClient < existingClient ||
      (currentClient === existingClient &&
        ((it.id.startsWith("pk") && !existing.id.startsWith("pk")) ||
          (it.fareFamilies || []).length > (existing.fareFamilies || []).length));

    if (preferCurrent) {
      const enriched: PublicFlightItinerary = {
        ...it,
        canAddPaidBaggage: Boolean(it.canAddPaidBaggage),
        fareFamilies: mergeFareFamilies(it.fareFamilies, existing.fareFamilies),
        badges: Array.from(new Set([...it.badges, ...existing.badges])),
        legs: it.legs.map((leg, lIdx) => {
          const exLeg = existing.legs[lIdx];
          if (!exLeg) return leg;
          return {
            ...leg,
            segments: leg.segments.map((seg, sIdx) => {
              const exSeg = exLeg.segments[sIdx];
              if (!exSeg) return seg;
              return {
                ...seg,
                aircraft: seg.aircraft || exSeg.aircraft,
                airlineLogo: seg.airlineLogo || exSeg.airlineLogo,
                origin: {
                  ...seg.origin,
                  name: seg.origin?.name || exSeg.origin?.name,
                  city: seg.origin?.city || exSeg.origin?.city,
                },
                destination: {
                  ...seg.destination,
                  name: seg.destination?.name || exSeg.destination?.name,
                  city: seg.destination?.city || exSeg.destination?.city,
                },
              };
            }),
          };
        }),
      };
      map.set(fp, enriched);
    } else {
      // Existing is cheaper or equal! Enrich existing with any extra details from current
      existing.canAddPaidBaggage = Boolean(existing.canAddPaidBaggage);
      existing.fareFamilies = mergeFareFamilies(existing.fareFamilies, it.fareFamilies);
      existing.badges = Array.from(new Set([...existing.badges, ...it.badges]));
      existing.legs = existing.legs.map((leg, lIdx) => {
        const curLeg = it.legs[lIdx];
        if (!curLeg) return leg;
        return {
          ...leg,
          segments: leg.segments.map((seg, sIdx) => {
            const curSeg = curLeg.segments[sIdx];
            if (!curSeg) return seg;
            return {
              ...seg,
              aircraft: seg.aircraft || curSeg.aircraft,
              airlineLogo: seg.airlineLogo || curSeg.airlineLogo,
              origin: {
                ...seg.origin,
                name: seg.origin?.name || curSeg.origin?.name,
                city: seg.origin?.city || curSeg.origin?.city,
              },
              destination: {
                ...seg.destination,
                name: seg.destination?.name || curSeg.destination?.name,
                city: seg.destination?.city || curSeg.destination?.city,
              },
            };
          }),
        };
      });
    }
  }

  // Return deduplicated list sorted by price ascending (cheapest first)
  const results = Array.from(map.values());
  results.sort((a, b) => (a.price?.client || 0) - (b.price?.client || 0));
  return results;
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
  const registry = await getProvidersRegistry();
  const tpActive = Boolean(registry.providers.travelport_flights?.enabled);
  const seeruActive = Boolean(registry.providers.seeru?.enabled);
  const pkfareActive = Boolean(registry.providers.pkfare?.enabled);
  const bbActive = Boolean(registry.providers.biletbank?.enabled);
  const hasLiveSuppliers = tpActive || seeruActive || pkfareActive || bbActive;

  if (travelpayoutsOnly || (!live && !hasLiveSuppliers)) {
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
  query.cabinClass = cabin;
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

  // Parallel live supplier searches
  const rawOriginCode =
    input.originSkyId && (input.originSkyId.length === 4 || input.originSkyId.endsWith("A") || input.originSkyId.endsWith("D"))
      ? input.originSkyId
      : origin.skyId || input.originSkyId;
  const rawDestCode =
    input.destinationSkyId && (input.destinationSkyId.length === 4 || input.destinationSkyId.endsWith("A"))
      ? input.destinationSkyId
      : destination.skyId || input.destinationSkyId;

  const [originIatas, destIatas] = await Promise.all([
    resolveAirportsForCode(rawOriginCode),
    resolveAirportsForCode(rawDestCode),
  ]);
  const primaryOriginIata = originIatas[0] || origin.skyId || input.originSkyId;
  const primaryDestIata = destIatas[0] || destination.skyId || input.destinationSkyId;

  const supplierPromises: Promise<AirOffer[]>[] = [];
  const supplierSearchParams = {
    origin: origin.skyId || input.originSkyId,
    destination: destination.skyId || input.destinationSkyId,
    departureDate: input.date,
    returnDate: input.returnDate,
    adults,
    children: childrens,
    infants,
    cabinClass: cabin,
  };

  const singleIataParams = {
    ...supplierSearchParams,
    origin: primaryOriginIata,
    destination: primaryDestIata,
  };

  const searchPairs: Array<{ origin: string; destination: string }> = [];
  const addPair = (orig: string, dest: string) => {
    if (!orig || !dest || orig === dest) return;
    if (!searchPairs.some((p) => p.origin === orig && p.destination === dest)) {
      searchPairs.push({ origin: orig, destination: dest });
    }
  };

  // Primary pair plus every origin airport in the metro (LHR+LGW+STN+LTN for LOND)
  for (const orig of originIatas.slice(0, 4)) addPair(orig, primaryDestIata);
  if (destIatas.length > 1) {
    addPair(primaryOriginIata, destIatas[1]);
    if (originIatas[1]) addPair(originIatas[1], destIatas[1]);
  }

  const activePairs = searchPairs.slice(0, 5);
  const pkfarePairs: Array<{ origin: string; destination: string }> = [];
  const originsForPk = originIatas.length ? originIatas : [primaryOriginIata];
  const destsForPk = destIatas.length ? destIatas : [primaryDestIata];
  for (const orig of originsForPk) {
    for (const dest of destsForPk) {
      if (!orig || !dest || orig === dest) continue;
      if (!pkfarePairs.some((p) => p.origin === orig && p.destination === dest)) {
        pkfarePairs.push({ origin: orig, destination: dest });
      }
    }
  }

  if (tpActive) {
    for (const pair of activePairs) {
      const flightKey = `tp:${pair.origin}:${pair.destination}:${singleIataParams.departureDate}:${singleIataParams.adults}:${singleIataParams.cabinClass}`;
      supplierPromises.push(
        flightSearchFlight.do(
          flightKey,
          () =>
            new TravelportAirAdapter().searchFlights({
              ...singleIataParams,
              origin: pair.origin,
              destination: pair.destination,
            }),
          { ttlMs: 15_000 }
        ).catch((err) => {
          logFlights("tp-search-err", { pair, err: String(err) });
          return [];
        })
      );
    }
  }
  const seeruWave = seeruActive
    ? new SeeruAirAdapter()
        .searchFlightsWave({ ...supplierSearchParams, currency: "USD", preferredCurrency: "USD" }, 4)
        .catch((err) => {
          logFlights("seeru-search-err", { err: String(err) });
          return { offers: [] as AirOffer[], jobs: [] as SeeruSearchJob[] };
        })
    : Promise.resolve({ offers: [] as AirOffer[], jobs: [] as SeeruSearchJob[] });
  if (pkfareActive) {
    const pairs = pkfarePairs.length ? pkfarePairs : activePairs;
    const cityOrigin = toPkfareCityIata(rawOriginCode) || toPkfareCityIata(origin.skyId);
    const cityDest = toPkfareCityIata(rawDestCode) || toPkfareCityIata(destination.skyId);
    logFlights("pkfare-pairs", { pairs, originIatas, destIatas, cityOrigin, cityDest });
    for (const pair of pairs) {
      const flightKey = `pk:${pair.origin}:${pair.destination}:${singleIataParams.departureDate}:${singleIataParams.adults}:${singleIataParams.cabinClass}`;
      supplierPromises.push(
        flightSearchFlight.do(
          flightKey,
          () =>
            new PkfareAirAdapter().searchFlights({
              ...singleIataParams,
              origin: pair.origin,
              destination: pair.destination,
            }),
          { ttlMs: 15_000 }
        ).catch((err) => {
          logFlights("pkfare-search-err", { pair, err: String(err) });
          return [];
        })
      );
    }
    if (cityOrigin && cityDest) {
      const flightKey = `pk-city:${cityOrigin}:${cityDest}:${singleIataParams.departureDate}:${singleIataParams.adults}:${singleIataParams.cabinClass}`;
      supplierPromises.push(
        flightSearchFlight.do(
          flightKey,
          () =>
            new PkfareAirAdapter().searchFlights({
              ...singleIataParams,
              origin: cityOrigin,
              destination: cityDest,
              useCityCode: true,
              allowedOrigins: originsForPk,
              allowedDestinations: destsForPk,
            }),
          { ttlMs: 15_000 }
        ).catch((err) => {
          logFlights("pkfare-city-search-err", { cityOrigin, cityDest, err: String(err) });
          return [];
        })
      );
    }
  }
  if (bbActive) {
    const bbPairs = activePairs.slice(0, 2);
    for (const pair of bbPairs) {
      const flightKey = `bb:${pair.origin}:${pair.destination}:${singleIataParams.departureDate}:${singleIataParams.adults}:${singleIataParams.cabinClass}`;
      supplierPromises.push(
        flightSearchFlight.do(
          flightKey,
          () =>
            new BiletbankAirAdapter().searchFlights({
              ...singleIataParams,
              origin: pair.origin,
              destination: pair.destination,
            }),
          { ttlMs: 15_000 }
        ).catch((err) => {
          logFlights("biletbank-search-err", { pair, err: String(err) });
          return [];
        })
      );
    }
  }

  let skySession: FlightSearchSession | null = null;
  let skyError: FlightProviderErrorCode | null = null;

  if (live && isLiveEntityId(origin.entityId) && isLiveEntityId(destination.entityId)) {
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
    if (result.ok) {
      skySession = buildSearchSession(result.payload, runtime.markupRules, currency, query);
    } else {
      skyError = result.errorCode;
    }
  }

  const [supplierResults, seeruStarted] = await Promise.all([Promise.all(supplierPromises), seeruWave]);
  const supplierOffers = [...supplierResults.flat(), ...seeruStarted.offers];
  const supplierItineraries = await offersToItineraries(
    supplierOffers,
    runtime.markupRules,
    guestCurrency,
    cabin
  );
  logFlights("search-suppliers", {
    pk: supplierOffers.filter((o) => o.provider === "pkfare").length,
    tp: supplierOffers.filter((o) => o.provider === "travelport").length,
    seeru: supplierOffers.filter((o) => o.provider === "seeru").length,
    bb: supplierOffers.filter((o) => o.provider === "biletbank").length,
    itineraries: supplierItineraries.length,
    cabin,
  });

  let rawCombined: PublicFlightItinerary[] = [];
  if (skySession) {
    rawCombined = [...skySession.itineraries, ...supplierItineraries];
  } else {
    rawCombined = supplierItineraries;
  }

  // Deduplicate identical flights across providers, keeping cheapest price & richest metadata
  const combinedItineraries = deduplicateAndEnrichFlights(rawCombined);

  if (combinedItineraries.length === 0) {
    if (skyError && !hasLiveSuppliers) return { ok: false, errorCode: skyError };
    return { ok: false, errorCode: "zero_results" };
  }

  const seeruPending = seeruStarted.jobs.some((j) => j.complete < 100);
  let session: FlightSearchSession = skySession || {
    sessionId: `ses_${Date.now().toString(36)}`,
    status: "complete",
    itineraries: combinedItineraries,
    currency,
    query,
  };
  session.itineraries = combinedItineraries;
  const tokenStore = collectFareTokens(supplierOffers);
  session.fareTokens = { ...(session.fareTokens || {}), ...tokenStore.fareTokens };
  session.rawOffers = { ...(session.rawOffers || {}), ...tokenStore.rawOffers };
  session.rawContext = {
    ...(session.rawContext || {}),
    seeruJobs: seeruStarted.jobs,
    skyIncomplete: skySession?.status === "incomplete",
  };
  session.status = session.rawContext.skyIncomplete || seeruPending ? "incomplete" : "complete";

  if (skySession && session.rawContext.skyIncomplete) {
    session = await hydrateIncompleteSearch(runtime, session);
    session.status = sessionStatusFromContext(session);
  }
  await persistSession(session);
  await writeFlightsCache(queryCacheKey, session);
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
    current.rawContext = { ...(current.rawContext || {}), skyIncomplete: current.status === "incomplete" };
    current.status = sessionStatusFromContext(current);
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
  const guest = guestCurrencyOf(guestCurrency || cached?.query.guestCurrency);

  let session = cached;
  const skyPending = !cached || Boolean(cached.rawContext?.skyIncomplete);
  if (skyPending) {
    const result = await skyScrapperGet(runtime, "searchIncomplete", "/api/v2/flights/searchIncomplete", { sessionId });
    if (result.ok) {
      const incoming = buildSearchSession(result.payload, runtime.markupRules, PROVIDER_CURRENCY, cached?.query || {});
      incoming.rawContext = { skyIncomplete: incoming.status === "incomplete" };
      session = cached ? mergeSessions(cached, incoming) : incoming;
    } else if (!cached) {
      return { ok: false, errorCode: result.errorCode };
    } else if (cached.rawContext) {
      cached.rawContext.skyIncomplete = false;
    }
  }

  if (!session) return { ok: false, errorCode: "search_failed" };

  const seeruJobs = session.rawContext?.seeruJobs || [];
  if (seeruJobs.some((j) => j.complete < 100)) {
    try {
      const continued = await new SeeruAirAdapter().continueSearchJobs(seeruJobs, 20);
      const seeruItineraries = await offersToItineraries(
        continued.offers,
        runtime.markupRules,
        guest,
        String(session.query?.cabinClass || "")
      );
      const tokens = collectFareTokens(continued.offers);
      session.itineraries = deduplicateAndEnrichFlights([...session.itineraries, ...seeruItineraries]);
      session.fareTokens = { ...(session.fareTokens || {}), ...tokens.fareTokens };
      session.rawOffers = { ...(session.rawOffers || {}), ...tokens.rawOffers };
      session.rawContext = { ...(session.rawContext || {}), seeruJobs: continued.jobs };
    } catch (err) {
      logFlights("seeru-incomplete-err", { err: String(err) });
    }
  }

  session.sessionId = session.sessionId || sessionId;
  session.currency = session.currency || PROVIDER_CURRENCY;
  session.status = sessionStatusFromContext(session);
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

/** Server-only lookup of the token behind a fare id (or the cheapest fare of an itinerary) in a cached search session. */
export async function resolveFareToken(input: {
  sessionId?: string;
  fareId?: string;
  itineraryId?: string;
}): Promise<{ token: StoredFareToken; rawOffer: unknown } | null> {
  if (!input.sessionId) return null;
  const session = await readFlightsCache<FlightSearchSession>(sessionCacheKey(input.sessionId), FLIGHTS_SESSION_TTL_MS);
  if (!session?.fareTokens) return null;
  let token: StoredFareToken | undefined = input.fareId ? session.fareTokens[input.fareId] : undefined;
  if (!token && input.itineraryId) {
    const item = session.itineraries.find((it) => it.id === input.itineraryId);
    const bestId = item?.fareFamilies?.find((f) => f.isBestPrice)?.id || item?.fareFamilies?.[0]?.id;
    if (bestId) token = session.fareTokens[bestId];
    if (!token) token = Object.values(session.fareTokens).find((t) => t.offerId === input.itineraryId);
  }
  if (!token) return null;
  return { token, rawOffer: session.rawOffers?.[token.offerId] };
}

export type PublicPaidBagOption = {
  id: string;
  weightKg: number;
  pieces: number;
  label: string;
  price: number;
  currency: string;
};

/** Price paid-bag options for a stored PKFare fare. Empty list when the offer has none. */
export async function quotePaidBaggage(input: {
  sessionId: string;
  itineraryId: string;
  fareId?: string;
  adults?: number;
  children?: number;
  infants?: number;
  currency?: string;
}): Promise<{ ok: true; options: PublicPaidBagOption[] } | { ok: false; errorCode: FlightProviderErrorCode }> {
  const fareRef = await resolveFareToken({
    sessionId: input.sessionId,
    itineraryId: input.itineraryId,
    fareId: input.fareId,
  });
  if (!fareRef || fareRef.token.supplier !== "pkfare") {
    return { ok: true, options: [] };
  }

  const adults = Math.max(1, Number(input.adults || 1));
  const children = Math.max(0, Number(input.children || 0));
  const infants = Math.max(0, Number(input.infants || 0));
  const pk = new PkfareAirAdapter();
  const raw = fareRef.rawOffer as any;
  const solution = Array.isArray(raw?.solutions)
    ? raw.solutions.find((sol: any) => String(sol?.solutionId || sol?.solutionKey || "") === fareRef.token.supplierToken) || raw.solution
    : raw?.solution || raw;
  const journeys = pk.buildJourneysFromRaw({ ...raw, solution });
  if (!journeys) {
    logFlights("ancillary-journeys-missing", {
      itineraryId: input.itineraryId,
      fareId: input.fareId || "",
      hasRaw: Boolean(raw),
    });
    return { ok: true, options: [] };
  }

  const brandFare = String(
    fareRef.token.supplierContext?.brandFare || fareRef.token.supplierContext?.tag || solution?.brandFare || ""
  ).trim();
  let priced: any = null;
  try {
    priced = await pk.priceFareOption({
      solutionId: fareRef.token.supplierToken,
      rawOfferData: raw,
      adults,
      children,
      infants,
      tag: brandFare || undefined,
    });
  } catch (err) {
    logFlights("ancillary-precise-err", { err: String(err).slice(0, 200) });
  }

  const pricedOk = ["0", "0000"].includes(String(priced?.errorCode ?? priced?.code ?? ""));
  if (!pricedOk) {
    try {
      priced = await pk.precisePricing({
        solutionId: "direct pricing",
        solutionKey: solution?.solutionKey ? String(solution.solutionKey) : undefined,
        journeys,
        adults,
        children,
        infants,
        brandFare: brandFare || undefined,
      });
    } catch (err) {
      logFlights("ancillary-direct-err", { err: String(err).slice(0, 200) });
    }
  }
  const ancillarySolutionId = ["0", "0000"].includes(String(priced?.errorCode ?? priced?.code ?? ""))
    ? String(priced?.data?.solution?.solutionId || "direct pricing")
    : "direct pricing";

  let res: any = null;
  try {
    res = await pk.getAncillaryPricing({
      solutionId: ancillarySolutionId,
      solutionKey:
        priced?.data?.solution?.solutionKey ||
        (solution?.solutionKey ? String(solution.solutionKey) : undefined),
      journeys,
      adults,
      children,
      infants,
      tag: brandFare || undefined,
    });
  } catch (err) {
    logFlights("ancillary-price-err", { err: String(err).slice(0, 200) });
    return { ok: true, options: [] };
  }

  const bags = parsePkfareAncillaryBags(res);
  const { runtime } = await resolveFlightsMode();
  if (!bags.length && fareRef) {
    const sessionEmpty = await readFlightsCache<FlightSearchSession>(sessionCacheKey(input.sessionId), FLIGHTS_SESSION_TTL_MS);
    if (sessionEmpty) {
      const emptyItem = sessionEmpty.itineraries.find((it) => it.id === input.itineraryId);
      if (emptyItem) {
        emptyItem.fareFamilies = (emptyItem.fareFamilies || []).map((fare) =>
          !input.fareId || fare.id === input.fareId ? { ...fare, canAddPaidBaggage: false } : fare
        );
        emptyItem.canAddPaidBaggage = emptyItem.fareFamilies.some((f) => f.canAddPaidBaggage);
        await writeFlightsCache(sessionCacheKey(input.sessionId), sessionEmpty);
      }
    }
  }
  const guest = guestCurrencyOf(input.currency);
  const session = await readFlightsCache<FlightSearchSession>(sessionCacheKey(input.sessionId), FLIGHTS_SESSION_TTL_MS);
  const item = session?.itineraries.find((it) => it.id === input.itineraryId);
  const lastLeg = item?.legs?.length ? item.legs[item.legs.length - 1] : undefined;
  const ctx = {
    origin: item?.legs[0]?.origin?.displayCode || item?.legs[0]?.origin?.skyId || fareRef.token.supplierContext?.origin || "",
    destination:
      lastLeg?.destination?.displayCode ||
      lastLeg?.destination?.skyId ||
      fareRef.token.supplierContext?.destination ||
      "",
    currency: bags[0]?.currency || fareRef.token.price.currency || PROVIDER_CURRENCY,
  };
  const options: PublicPaidBagOption[] = [];
  for (const bag of bags) {
    const marked = markupSupplierAmount(bag.supplierPrice, runtime.markupRules, {
      ...ctx,
      currency: bag.currency || ctx.currency,
    });
    const from = guestCurrencyOf(bag.currency || ctx.currency);
    const client = from === guest ? marked : roundFlightPrice(await convertAmountSafe(marked, from, guest));
    options.push({
      id: bag.id,
      weightKg: bag.weightKg,
      pieces: bag.pieces,
      label: bag.label,
      price: client,
      currency: guest,
    });
  }
  return { ok: true, options };
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

  if (
    input.itineraryId.startsWith("tp_") ||
    input.itineraryId.startsWith("seeru_") ||
    input.itineraryId.startsWith("pkfare_") ||
    input.itineraryId.startsWith("pk_") ||
    input.itineraryId.startsWith("bb_")
  ) {
    const cached = input.sessionId
      ? await readFlightsCache<FlightSearchSession>(
          sessionCacheKey(input.sessionId),
          FLIGHTS_SESSION_TTL_MS
        )
      : null;
    const found = cached?.itineraries.find((it) => it.id === input.itineraryId);
    if (found) {
      let item = found;
      let rawDetails: Record<string, unknown> = {};

      // Re-price through the stored supplier token of the best (or first) fare option — never through the display id.
      const fareRef = await resolveFareToken({ sessionId: input.sessionId, itineraryId: input.itineraryId }).catch(() => null);

      if (input.itineraryId.startsWith("tp_")) {
        if (fareRef?.token.supplier === "travelport") {
          const tp = new TravelportAirAdapter();
          const verified = await tp.priceOffer(fareRef.token.supplierToken).catch(() => null);
          if (verified && typeof verified === "object") {
            rawDetails = verified as Record<string, unknown>;
          }
        }
      } else if (input.itineraryId.startsWith("seeru_")) {
        const seeru = new SeeruAirAdapter();
        const verified =
          fareRef?.token.supplier === "seeru"
            ? await seeru
                .priceFareOption({ fareKey: fareRef.token.supplierToken, offerId: fareRef.token.offerId, rawOfferData: fareRef.rawOffer })
                .catch(() => null)
            : await seeru.checkBookingFare(item.id).catch(() => null);
        if (verified) {
          rawDetails = (verified as Record<string, unknown>) || {};
        }
      } else if (input.itineraryId.startsWith("pkfare_") || input.itineraryId.startsWith("pk_")) {
        if (fareRef?.token.supplier === "pkfare") {
          const pk = new PkfareAirAdapter();
          const verified = await pk
            .priceFareOption({ solutionId: fareRef.token.supplierToken, rawOfferData: fareRef.rawOffer, tag: fareRef.token.supplierContext?.tag })
            .catch(() => null);
          if (verified) {
            rawDetails = (verified as Record<string, unknown>) || {};
            const priced = verified as any;
            const mini = priced?.data?.solution?.miniRuleMap || priced?.data?.miniRuleMap;
            const currency = item.fareFamilies?.[0]?.price?.currency || item.price.currency || PROVIDER_CURRENCY;
            const parsed = mini ? parsePkfareMiniRules(mini, currency) : null;
            const raw = fareRef.rawOffer as any;
            const solution = Array.isArray(raw?.solutions)
              ? raw.solutions.find((sol: any) => String(sol?.solutionId || sol?.solutionKey || "") === fareRef.token.supplierToken) || raw.solution
              : raw?.solution || raw;
            const journeys = pk.buildJourneysFromRaw({ ...raw, solution });
            const sid = String(priced?.data?.solution?.solutionId || "direct pricing");
            const tag = String(fareRef.token.supplierContext?.brandFare || fareRef.token.supplierContext?.tag || solution?.brandFare || "").trim();
            const pen = journeys
              ? await pk.fetchPenalties({ solutionId: sid, journeys, brandFare: tag || undefined, tag: tag || undefined }).catch(() => null)
              : null;
            const texts = parsePkfarePenaltyTexts((pen as any)?.data?.penalties || pen?.penalties, currency);
            const lastLeg = item.legs?.length ? item.legs[item.legs.length - 1] : undefined;
            const ruleCtx = {
              origin: item.legs?.[0]?.origin?.displayCode || item.legs?.[0]?.origin?.skyId || "",
              destination: lastLeg?.destination?.displayCode || lastLeg?.destination?.skyId || "",
              currency,
            };
            if (parsed || texts.length) {
              const fareId = item.fareFamilies?.find((f) => f.isBestPrice)?.id || item.fareFamilies?.[0]?.id;
              item = {
                ...item,
                fareFamilies: (item.fareFamilies || []).map((fare) => {
                  if (fareId && fare.id !== fareId) return fare;
                  const next = parsed
                    ? fareFromPkfareRules(fare, { ...parsed, penalties: mergePenaltyLists(parsed.penalties, texts) }, runtime.markupRules, ruleCtx)
                    : fareFromPkfareRules(
                        fare,
                        {
                          penalties: texts,
                          refundable: fare.attributes?.refund || "unknown",
                          changeable: texts.some((p) => p.type === "change" && p.amount != null) ? "chargeable" : fare.attributes?.change || "unknown",
                        },
                        runtime.markupRules,
                        ruleCtx
                      );
                  return next;
                }),
              };
              if (cached) {
                const idx = cached.itineraries.findIndex((it) => it.id === item.id);
                if (idx >= 0) {
                  cached.itineraries[idx] = item;
                  await writeFlightsCache(sessionCacheKey(input.sessionId!), cached);
                }
              }
            }
          }
        }
      } else if (input.itineraryId.startsWith("bb_")) {
        if (fareRef?.token.supplier === "biletbank") {
          const bb = new BiletbankAirAdapter();
          const verified = await bb
            .checkFarePrice({ flightId: fareRef.token.supplierToken, selectedPackage: fareRef.token.supplierContext?.selectedPackage || undefined })
            .catch(() => null);
          if (verified && verified.ok) {
            rawDetails = (verified as unknown as Record<string, unknown>) || {};
          }
        }
      }

      // Cached supplier prices are stored in the supplier currency (item.price.currency), not necessarily USD.
      const itemCurrency = guestCurrencyOf(item.price.currency || cached?.currency || PROVIDER_CURRENCY);
      const usdClient = roundFlightPrice(item.price.client);
      const usdBase = roundFlightPrice(item.price.base);
      const [client, base] = await Promise.all([
        convertAmountSafe(usdClient, itemCurrency, guestCurrency),
        convertAmountSafe(usdBase, itemCurrency, guestCurrency),
      ]);
      const localizedItinerary = {
        ...item,
        price: {
          ...item.price,
          base: roundFlightPrice(base),
          client: roundFlightPrice(client),
          currency: guestCurrency,
        },
      };
      return {
        ok: true,
        details: rawDetails,
        itinerary: localizedItinerary,
        price: {
          base: roundFlightPrice(base),
          client: roundFlightPrice(client),
          currency: guestCurrency,
        },
      };
    }
  }

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
