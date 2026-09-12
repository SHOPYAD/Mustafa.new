/**
 * RapidAPI Booking COM 15 (DataCrawler) — hotel endpoints.
 * Host: booking-com15.p.rapidapi.com
 * All 22 hotel-folder paths are typed clients below.
 *
 * Detail page after hotel_id (quota-safe, max ~6 live calls):
 *   Phase A: getRoomListWithAvailability + getHotelPhotos
 *   Phase B (cache/time remaining): facilities, policies, reviews page1, nearby attractions
 * hotel_id from list (`bk-{id}` / bookingHotelId): skip rematch.
 * Phase B: details, reviews p1, facilities, policies, attractions — max 4 live, 24h cache.
 * Unknown ta-* URL: cache map → one searchDestination (8s) → TA-offer fallback.
 */

import { promises as fs } from "fs";
import path from "path";
import { fullLocationText, resolveStayPrices } from "@/lib/hotel-display";
import {
  assignUniqueRoomPhotos,
  isRealRoomName,
  isUsableHotelDescription,
  roomNameKey,
  toUsdNumber,
} from "@/lib/hotel-offers";
import { isPayAtPropertyCopy } from "@/lib/pay-at-property";
import {
  BOOKING_DETAIL_TTL_MS,
  BOOKING_ROOMS_TTL_MS,
  readBookingCache,
  writeBookingCache,
} from "@/lib/server/booking-disk-cache";
import {
  ROOMS_PROVIDER_HOST,
  ROOMS_PROVIDER_SUBSCRIBE_URL,
} from "@/lib/hotels-config";
import { getServerEnv } from "@/lib/server/env-store";
import { directFetch } from "@/lib/server/direct-network";
import { isBookingRuntimePathEnabled } from "@/lib/server/hotels-runtime-store";
import { recordRapidApiLiveCall } from "@/lib/server/rapidapi-quota-stats";
import type {
  TravelAdvisorFacilityGroup,
  TravelAdvisorNearbyPlace,
  TravelAdvisorQuestion,
  TravelAdvisorReview,
  TravelAdvisorReviewScore,
  TravelAdvisorRoom,
  TravelAdvisorRoomRate,
} from "@/types/travel-advisor";

export const BOOKING_COM15_HOST = ROOMS_PROVIDER_HOST;
export const BOOKING_COM15_SUBSCRIBE_URL = ROOMS_PROVIDER_SUBSCRIBE_URL;

const ROOMS_CACHE_TTL_MS = 15 * 60 * 1000;
const HOTEL_ID_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ROOMS_OVERALL_TIMEOUT_MS = 8000;
const SEARCH_DEST_TIMEOUT_MS = 3500;
const ROOMS_HTTP_TIMEOUT_MS = 6500;

/** All 22 hotel-folder paths from RapidAPI playground + DataCrawler docs. */
export const BOOKING_COM15_HOTEL_ENDPOINTS = {
  searchDestination: "/api/v1/hotels/searchDestination",
  getFilter: "/api/v1/hotels/getFilter",
  getSortBy: "/api/v1/hotels/getSortBy",
  searchHotels: "/api/v1/hotels/searchHotels",
  searchHotelsByCoordinates: "/api/v1/hotels/searchHotelsByCoordinates",
  getHotelDetails: "/api/v1/hotels/getHotelDetails",
  getAvailability: "/api/v1/hotels/getAvailability",
  getDescriptionAndInfo: "/api/v1/hotels/getDescriptionAndInfo",
  getRoomList: "/api/v1/hotels/getRoomList",
  getPaymentFeatures: "/api/v1/hotels/getPaymentFeatures",
  getHotelPolicies: "/api/v1/hotels/getHotelPolicies",
  propertyChildrenPolicies: "/api/v1/hotels/propertyChildrenPolicies",
  getHotelReviewsFilterMetadata: "/api/v1/hotels/getHotelReviewsFilterMetadata",
  getHotelReviewScores: "/api/v1/hotels/getHotelReviewScores",
  getHotelReviewsSortOption: "/api/v1/hotels/getHotelReviewsSortOption",
  getHotelReviews: "/api/v1/hotels/getHotelReviews",
  getQuestionAndAnswer: "/api/v1/hotels/getQuestionAndAnswer",
  getNearbyCities: "/api/v1/hotels/getNearbyCities",
  getPopularAttractionNearBy: "/api/v1/hotels/getPopularAttractionNearBy",
  getRoomListWithAvailability: "/api/v1/hotels/getRoomListWithAvailability",
  getHotelPhotos: "/api/v1/hotels/getHotelPhotos",
  getHotelFacilities: "/api/v1/hotels/getHotelFacilities",
} as const;

export type BookingCom15HotelEndpoint =
  (typeof BOOKING_COM15_HOTEL_ENDPOINTS)[keyof typeof BOOKING_COM15_HOTEL_ENDPOINTS];

export const BOOKING_COM15_WIRED_HOTEL_ENDPOINTS: ReadonlyArray<{
  id: number;
  name: string;
  path: BookingCom15HotelEndpoint;
  productionRooms: boolean;
  deprecated?: boolean;
}> = [
  { id: 1, name: "Search Hotel Destination", path: BOOKING_COM15_HOTEL_ENDPOINTS.searchDestination, productionRooms: false },
  { id: 2, name: "Get Filter", path: BOOKING_COM15_HOTEL_ENDPOINTS.getFilter, productionRooms: false },
  { id: 3, name: "Sort By", path: BOOKING_COM15_HOTEL_ENDPOINTS.getSortBy, productionRooms: false },
  { id: 4, name: "Search Hotels", path: BOOKING_COM15_HOTEL_ENDPOINTS.searchHotels, productionRooms: false },
  { id: 5, name: "Search Hotels By Coordinates", path: BOOKING_COM15_HOTEL_ENDPOINTS.searchHotelsByCoordinates, productionRooms: false },
  { id: 6, name: "Get Hotel Details", path: BOOKING_COM15_HOTEL_ENDPOINTS.getHotelDetails, productionRooms: false },
  { id: 7, name: "Get Room Availability", path: BOOKING_COM15_HOTEL_ENDPOINTS.getAvailability, productionRooms: false },
  { id: 8, name: "Description And Info", path: BOOKING_COM15_HOTEL_ENDPOINTS.getDescriptionAndInfo, productionRooms: false },
  { id: 9, name: "Get Room List", path: BOOKING_COM15_HOTEL_ENDPOINTS.getRoomList, productionRooms: false },
  { id: 10, name: "Payment features of the Hotel", path: BOOKING_COM15_HOTEL_ENDPOINTS.getPaymentFeatures, productionRooms: false },
  { id: 11, name: "Get Hotel Policies", path: BOOKING_COM15_HOTEL_ENDPOINTS.getHotelPolicies, productionRooms: false },
  { id: 12, name: "Property Children Policies", path: BOOKING_COM15_HOTEL_ENDPOINTS.propertyChildrenPolicies, productionRooms: false },
  { id: 13, name: "Hotel Reviews Filter Metadata", path: BOOKING_COM15_HOTEL_ENDPOINTS.getHotelReviewsFilterMetadata, productionRooms: false },
  { id: 14, name: "Hotel Review Scores", path: BOOKING_COM15_HOTEL_ENDPOINTS.getHotelReviewScores, productionRooms: false },
  { id: 15, name: "Hotel Reviews (Tips) Sort", path: BOOKING_COM15_HOTEL_ENDPOINTS.getHotelReviewsSortOption, productionRooms: false },
  { id: 16, name: "Hotel Reviews (Tips)", path: BOOKING_COM15_HOTEL_ENDPOINTS.getHotelReviews, productionRooms: false },
  { id: 17, name: "Question And Answer", path: BOOKING_COM15_HOTEL_ENDPOINTS.getQuestionAndAnswer, productionRooms: false },
  { id: 18, name: "Nearby Cities (Deprecated)", path: BOOKING_COM15_HOTEL_ENDPOINTS.getNearbyCities, productionRooms: false, deprecated: true },
  { id: 19, name: "Popular Attraction Near By", path: BOOKING_COM15_HOTEL_ENDPOINTS.getPopularAttractionNearBy, productionRooms: false },
  { id: 20, name: "Get Room List With Availability", path: BOOKING_COM15_HOTEL_ENDPOINTS.getRoomListWithAvailability, productionRooms: true },
  { id: 21, name: "Get Hotel Photos", path: BOOKING_COM15_HOTEL_ENDPOINTS.getHotelPhotos, productionRooms: false },
  { id: 22, name: "Get Hotel Facilities", path: BOOKING_COM15_HOTEL_ENDPOINTS.getHotelFacilities, productionRooms: false },
];

const PRODUCTION_ROOMS_PATH = BOOKING_COM15_HOTEL_ENDPOINTS.getRoomListWithAvailability;

export type RoomsProviderErrorCode =
  | "not_configured"
  | "not_subscribed"
  | "invalid_key"
  | "quota"
  | "search_failed";

export type HotelRoomsQuery = {
  hotelName: string;
  city?: string;
  bookingHotelId?: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  lang?: string;
  fallbackNightly?: number | null;
  hotelPhotos?: string[];
  latitude?: number;
  longitude?: number;
};

export type BookingHotelMeta = {
  name: string;
  stars: number;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  checkInTime: string;
  checkOutTime: string;
  locationText: string;
};

export type HotelRoomsProviderResult = {
  rooms: TravelAdvisorRoom[];
  bookingHotelId: string;
  error: string | null;
  errorCode: RoomsProviderErrorCode | null;
  subscribeUrl: string;
  host: string;
  httpStatus: number | null;
  path: string;
  bodySnippet: string;
  photos: string[];
  facilities: string[];
  reviews: TravelAdvisorReview[];
  policies: string[];
  nearbyPlaces: TravelAdvisorNearbyPlace[];
  description: string;
  questions: TravelAdvisorQuestion[];
  reviewScores: TravelAdvisorReviewScore[];
  facilityGroups: TravelAdvisorFacilityGroup[];
  childrenPolicy: string[];
  payment: string[];
  hotelMeta?: BookingHotelMeta;
};

export type HotelRoomsProviderStatus = {
  host: string;
  subscribeUrl: string;
  lastError: string | null;
  lastErrorCode: RoomsProviderErrorCode | null;
  lastHotelName: string;
  lastBookingHotelId: string;
  lastRoomCount: number;
  lastSample: Array<{ name: string; photo: string }>;
  lastHttpStatus: number | null;
  lastPath: string;
  lastBodySnippet: string;
  updatedAt: string | null;
};

type CacheEntry<T> = { at: number; value: T };

type FetchOk = { ok: true; status: number; path: string; payload: unknown; body: string };
type FetchErr = {
  ok: false;
  status: number;
  path: string;
  errorCode: RoomsProviderErrorCode;
  body: string;
};

const roomsCache = new Map<string, CacheEntry<HotelRoomsProviderResult>>();
const hotelIdCache = new Map<string, CacheEntry<string>>();
const inflight = new Map<string, Promise<HotelRoomsProviderResult>>();
const QUOTA_COOL_MS = 12 * 60 * 1000;
let quotaCoolUntil = 0;

export function bookingQuotaCooling(): boolean {
  return Date.now() < quotaCoolUntil;
}

function markBookingQuotaCooldown() {
  quotaCoolUntil = Date.now() + QUOTA_COOL_MS;
}

/** Playground date fields may show DD.MM.YYYY; the API validates yyyy-mm-dd. */
export function toBookingDotDate(value: string): string {
  const iso = toIsoDate(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(value || "").trim();
}

export function toIsoDate(value: string): string {
  const raw = String(value || "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dots = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(raw);
  if (dots) {
    return `${dots[3]}-${dots[2].padStart(2, "0")}-${dots[1].padStart(2, "0")}`;
  }
  return raw;
}

export function toBookingApiDate(value: string): string {
  return toIsoDate(value);
}

function stayNights(checkIn: string, checkOut: string): number {
  const a = Date.parse(`${toIsoDate(checkIn)}T00:00:00Z`);
  const b = Date.parse(`${toIsoDate(checkOut)}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 3;
  return Math.max(1, Math.round((b - a) / 86400000));
}

const BOOKING_ID_FILE = path.join(process.cwd(), ".data", "booking-hotel-ids.json");
/** Do not map Romance Istanbul to 74717 (Taj). Altunizade is 12947502. */
const KNOWN_BOOKING_IDS: Record<string, string> = {
  altunizade: "12947502",
  "altunizade hotel": "12947502",
  "altunizade suites": "12947502",
  "altunizade suites istanbul": "12947502",
  "altunizade suites istanbul curio collection by hilton": "12947502",
};
const BLOCKED_NAME_IDS: Array<{ name: RegExp; id: string }> = [
  { name: /romance/i, id: "74717" },
];

let persistedBookingIds: Record<string, string> = { ...KNOWN_BOOKING_IDS };
let persistedIdsReady = false;

function knownBookingHotelId(hotelName: string, city: string): string {
  const n = normalizeName(`${hotelName} ${city}`);
  const exact =
    persistedBookingIds[hotelIdCacheKey(hotelName, city)] ||
    persistedBookingIds[normalizeName(hotelName)] ||
    persistedBookingIds[n];
  if (exact) return exact;
  let bestId = "";
  let bestScore = 0;
  for (const [key, id] of Object.entries(persistedBookingIds)) {
    const score = Math.max(nameScore(hotelName, key.split("|")[0]), nameScore(n, key));
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  if (BLOCKED_NAME_IDS.some((rule) => rule.name.test(hotelName) && rule.id === bestId)) {
    return "";
  }
  return bestScore >= 80 ? bestId : "";
}

async function loadPersistedBookingIds() {
  if (persistedIdsReady) return;
  persistedIdsReady = true;
  try {
    const raw = await fs.readFile(BOOKING_ID_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, string>;
    if (parsed && typeof parsed === "object") {
      const cleaned: Record<string, string> = {};
      for (const [key, id] of Object.entries(parsed)) {
        if (BLOCKED_NAME_IDS.some((rule) => rule.name.test(key) && rule.id === id)) continue;
        cleaned[key] = id;
      }
      persistedBookingIds = { ...KNOWN_BOOKING_IDS, ...cleaned };
    }
  } catch {
    persistedBookingIds = { ...KNOWN_BOOKING_IDS };
  }
}

async function persistBookingHotelId(hotelName: string, city: string, id: string) {
  if (!id || !isRealRoomName(hotelName)) return;
  await loadPersistedBookingIds();
  const keys = [normalizeName(hotelName), hotelIdCacheKey(hotelName, city)];
  let changed = false;
  for (const key of keys) {
    if (key && persistedBookingIds[key] !== id) {
      persistedBookingIds[key] = id;
      changed = true;
    }
  }
  if (!changed) return;
  try {
    await fs.mkdir(path.dirname(BOOKING_ID_FILE), { recursive: true });
    await fs.writeFile(BOOKING_ID_FILE, JSON.stringify(persistedBookingIds, null, 2), {
      mode: 0o600,
    });
  } catch {
    /* ignore disk errors */
  }
}

void loadPersistedBookingIds();

let lastStatus: HotelRoomsProviderStatus = {
  host: BOOKING_COM15_HOST,
  subscribeUrl: BOOKING_COM15_SUBSCRIBE_URL,
  lastError: null,
  lastErrorCode: null,
  lastHotelName: "",
  lastBookingHotelId: "",
  lastRoomCount: 0,
  lastSample: [],
  lastHttpStatus: null,
  lastPath: "",
  lastBodySnippet: "",
  updatedAt: null,
};

export function getHotelRoomsProviderStatus(): HotelRoomsProviderStatus {
  return { ...lastStatus, lastSample: lastStatus.lastSample.slice() };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
    if (typeof value === "string") {
      const n = Number(value.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return 0;
}

export function roomsLanguage(lang?: string): string {
  const raw = (lang || "").toLowerCase();
  if (raw.startsWith("ar")) return "ar";
  if (raw.startsWith("tr")) return "tr";
  return "en-us";
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nameScore(query: string, candidate: string): number {
  const q = normalizeName(query);
  const c = normalizeName(candidate);
  if (!q || !c) return 0;
  if (c === q) return 200;
  if (c.includes(q) || q.includes(c)) return 120;
  const words = q.split(" ").filter((w) => w.length > 2);
  if (!words.length) return 0;
  const hits = words.filter((w) => c.includes(w)).length;
  return hits * 12;
}

function hotelIdCacheKey(name: string, city: string): string {
  return `${normalizeName(name)}|${normalizeName(city)}`;
}

function roomsCacheKey(input: HotelRoomsQuery, bookingHotelId: string): string {
  return [
    roomsLanguage(input.lang),
    bookingHotelId,
    input.checkIn,
    input.checkOut,
    String(input.adults || 2),
    input.childrenAges || "",
    String(input.roomQty || 1),
  ].join(":");
}

const STATUS_FILE = path.join(process.cwd(), ".data", "rooms-provider-status.json");

function sanitizeSnippet(raw: string): string {
  return raw
    .replace(/[A-Za-z0-9_\-]{20,}/g, (token) =>
      /rapidapi|apikey|key-/i.test(token) ? "[redacted]" : token
    )
    .replace(/["']?[A-Za-z0-9]{32,}["']?/g, "[redacted]")
    .slice(0, 280);
}

function rememberStatus(partial: Partial<HotelRoomsProviderStatus>) {
  lastStatus = {
    ...lastStatus,
    ...partial,
    lastSample: partial.lastSample ? partial.lastSample.slice(0, 4) : lastStatus.lastSample,
    updatedAt: new Date().toISOString(),
  };
  void fs
    .mkdir(path.dirname(STATUS_FILE), { recursive: true })
    .then(() => fs.writeFile(STATUS_FILE, JSON.stringify(lastStatus, null, 2), { mode: 0o600 }))
    .catch(() => undefined);
}

void fs
  .readFile(STATUS_FILE, "utf8")
  .then((raw) => {
    const parsed = JSON.parse(raw) as HotelRoomsProviderStatus;
    if (parsed && typeof parsed === "object") {
      lastStatus = {
        ...lastStatus,
        ...parsed,
        lastSample: Array.isArray(parsed.lastSample) ? parsed.lastSample.slice(0, 4) : [],
        lastHttpStatus:
          typeof parsed.lastHttpStatus === "number" ? parsed.lastHttpStatus : null,
        lastPath: typeof parsed.lastPath === "string" ? parsed.lastPath : "",
        lastBodySnippet:
          typeof parsed.lastBodySnippet === "string" ? parsed.lastBodySnippet : "",
      };
    }
  })
  .catch(() => undefined);

function emptyResult(
  host: string,
  errorCode: RoomsProviderErrorCode | null,
  error: string | null,
  extra?: Partial<HotelRoomsProviderResult>
): HotelRoomsProviderResult {
  return {
    rooms: [],
    bookingHotelId: "",
    error,
    errorCode,
    subscribeUrl: BOOKING_COM15_SUBSCRIBE_URL,
    host,
    httpStatus: extra?.httpStatus ?? null,
    path: extra?.path || "",
    bodySnippet: extra?.bodySnippet || "",
    photos: extra?.photos || [],
    facilities: extra?.facilities || [],
    reviews: extra?.reviews || [],
    policies: extra?.policies || [],
    nearbyPlaces: extra?.nearbyPlaces || [],
    description: extra?.description || "",
    questions: extra?.questions || [],
    reviewScores: extra?.reviewScores || [],
    facilityGroups: extra?.facilityGroups || [],
    childrenPolicy: extra?.childrenPolicy || [],
    payment: extra?.payment || [],
    ...extra,
  };
}

function classifyRoomsFailure(status: number, body: string): RoomsProviderErrorCode {
  const lower = body.toLowerCase();
  if (status === 403 && /not subscribed|you are not subscribed/.test(lower)) return "not_subscribed";
  if (
    status === 429 ||
    status === 403 ||
    /quota|rate limit|too many requests|exceeded/.test(lower)
  ) {
    return "quota";
  }
  if (status === 401 || /invalid.*key|unauthorized/.test(lower)) return "invalid_key";
  return "search_failed";
}

function errorMessage(
  code: RoomsProviderErrorCode,
  httpStatus?: number | null,
  body?: string
): string {
  const snippet = body ? sanitizeSnippet(body) : "";
  const http = httpStatus != null ? `HTTP ${httpStatus}` : "";
  switch (code) {
    case "not_configured":
      return "مفتاح RapidAPI غير مضبوط لمزوّد الغرف.";
    case "not_subscribed":
    case "search_failed":
      return [http, snippet || "تعذّر جلب الغرف من Booking COM 15."].filter(Boolean).join(" — ");
    case "invalid_key":
      return [http, snippet || "مفتاح RapidAPI مرفوض من مزوّد الغرف."].filter(Boolean).join(" — ");
    case "quota":
      return [http, snippet || "تم استهلاك حصة RapidAPI لمزوّد الغرف."].filter(Boolean).join(" — ");
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}

export async function isRoomsProviderEnabled(): Promise<boolean> {
  const hotelsProvider = (await getServerEnv("NEXT_PUBLIC_HOTELS_PROVIDER")).trim().toLowerCase();
  if (hotelsProvider === "booking" || hotelsProvider === "booking_com15" || hotelsProvider === "booking-com15") {
    return true;
  }
  const flag = (await getServerEnv("NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER")).trim().toLowerCase();
  return flag === "" || flag === "booking_com15" || flag === "booking-com15" || flag === "1" || flag === "true";
}

export async function isBookingConfigured(): Promise<boolean> {
  const { key, enabled } = await roomsCredentials();
  return enabled && Boolean(key);
}

export async function lookupPersistedBookingHotelId(hotelName: string, city = ""): Promise<string> {
  await loadPersistedBookingIds();
  return knownBookingHotelId(hotelName, city);
}

function normalizeHost(raw: string): string {
  const host = raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
  return host.includes("booking-com15") ? host : BOOKING_COM15_HOST;
}

async function roomsCredentials(): Promise<{ key: string; host: string; enabled: boolean }> {
  const enabled = await isRoomsProviderEnabled();
  const configured =
    (await getServerEnv("BOOKING_COM_HOST")).trim() ||
    (await getServerEnv("RAPIDAPI_ROOMS_HOST")).trim() ||
    BOOKING_COM15_HOST;
  const dedicated =
    (await getServerEnv("BOOKING_COM_RAPIDAPI_KEY")).trim() ||
    (await getServerEnv("RAPIDAPI_ROOMS_KEY")).trim();
  // Never silently use the Travel Advisor RapidAPI key for Booking.com15.
  return { key: dedicated, host: normalizeHost(configured), enabled };
}

function stayQuery(input: {
  hotelId?: string;
  destId?: string;
  searchType?: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  lang?: string;
  extra?: Record<string, string>;
}): Record<string, string> {
  const query: Record<string, string> = {
    arrival_date: toBookingApiDate(input.checkIn),
    departure_date: toBookingApiDate(input.checkOut),
    adults: String(Math.max(1, input.adults || 2)),
    room_qty: String(Math.max(1, input.roomQty || 1)),
    units: "metric",
    temperature_unit: "c",
    languagecode: roomsLanguage(input.lang),
    currency_code: "USD",
    ...input.extra,
  };
  if (input.hotelId) query.hotel_id = input.hotelId;
  if (input.destId) query.dest_id = input.destId;
  if (input.searchType) query.search_type = input.searchType;
  const children = (input.childrenAges || "").trim();
  if (children && children !== "0") query.children_age = children;
  return query;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), Math.max(1, ms));
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

async function hotelGet(
  apiPath: string,
  query: Record<string, string | number | undefined>,
  timeoutMs?: number
): Promise<FetchOk | FetchErr> {
  const { key, host } = await roomsCredentials();
  if (!key) {
    return {
      ok: false,
      status: 0,
      path: apiPath,
      errorCode: "not_configured",
      body: "مفتاح RapidAPI غير مضبوط لمزوّد الغرف.",
    };
  }
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (v == null || v === "") continue;
    params[k] = String(v);
  }
  return bookingCom15Get(host, key, apiPath, params, "GET", timeoutMs);
}

export function searchHotelDestination(input: {
  query: string;
  languagecode?: string;
  timeoutMs?: number;
}) {
  return hotelGet(
    BOOKING_COM15_HOTEL_ENDPOINTS.searchDestination,
    {
      query: input.query,
      languagecode: input.languagecode,
    },
    input.timeoutMs ?? SEARCH_DEST_TIMEOUT_MS
  );
}

export function getFilter(input: {
  destId: string;
  searchType: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  categoriesFilter?: string;
  lang?: string;
}) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getFilter, {
    ...stayQuery({
      destId: input.destId,
      searchType: input.searchType,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      childrenAges: input.childrenAges,
      roomQty: input.roomQty,
      lang: input.lang,
    }),
    categories_filter: input.categoriesFilter,
  });
}

export function getSortBy(input: {
  destId: string;
  searchType: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  categoriesFilter?: string;
  lang?: string;
}) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getSortBy, {
    ...stayQuery({
      destId: input.destId,
      searchType: input.searchType,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      childrenAges: input.childrenAges,
      roomQty: input.roomQty,
      lang: input.lang,
    }),
    categories_filter: input.categoriesFilter,
  });
}

export function searchHotels(input: {
  destId: string;
  searchType: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  pageNumber?: number;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  categoriesFilter?: string;
  lang?: string;
}) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.searchHotels, {
    ...stayQuery({
      destId: input.destId,
      searchType: input.searchType,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      childrenAges: input.childrenAges,
      roomQty: input.roomQty,
      lang: input.lang,
    }),
    page_number: input.pageNumber,
    price_min: input.priceMin,
    price_max: input.priceMax,
    sort_by: input.sortBy,
    categories_filter: input.categoriesFilter,
  });
}

export function searchHotelsByCoordinates(input: {
  latitude: string;
  longitude: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  radius?: number;
  pageNumber?: number;
  priceMin?: number;
  priceMax?: number;
  lang?: string;
  timeoutMs?: number;
}) {
  return hotelGet(
    BOOKING_COM15_HOTEL_ENDPOINTS.searchHotelsByCoordinates,
    {
      latitude: input.latitude,
      longitude: input.longitude,
      ...stayQuery({
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        childrenAges: input.childrenAges,
        roomQty: input.roomQty,
        lang: input.lang,
      }),
      radius: input.radius,
      page_number: input.pageNumber,
      price_min: input.priceMin,
      price_max: input.priceMax,
    },
    input.timeoutMs
  );
}

export function getBookingHotelDetails(input: {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  lang?: string;
}) {
  return hotelGet(
    BOOKING_COM15_HOTEL_ENDPOINTS.getHotelDetails,
    stayQuery({
      hotelId: input.hotelId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      childrenAges: input.childrenAges,
      roomQty: input.roomQty,
      lang: input.lang,
    })
  );
}

export function getRoomAvailability(input: {
  hotelId: string;
  minDate: string;
  maxDate: string;
  adults?: number;
  roomQty?: number;
}) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getAvailability, {
    hotel_id: input.hotelId,
    min_date: toBookingApiDate(input.minDate),
    max_date: toBookingApiDate(input.maxDate),
    adults: String(Math.max(1, input.adults || 1)),
    room_qty: String(Math.max(1, input.roomQty || 1)),
    currency_code: "USD",
  });
}

export function getDescriptionAndInfo(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getDescriptionAndInfo, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

export function getRoomList(input: {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  lang?: string;
}) {
  return hotelGet(
    BOOKING_COM15_HOTEL_ENDPOINTS.getRoomList,
    stayQuery({
      hotelId: input.hotelId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      childrenAges: input.childrenAges,
      roomQty: input.roomQty,
      lang: input.lang,
    })
  );
}

export function getPaymentFeatures(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getPaymentFeatures, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

export function getHotelPolicies(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getHotelPolicies, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

export function propertyChildrenPolicies(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.propertyChildrenPolicies, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

export function getHotelReviewsFilterMetadata(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getHotelReviewsFilterMetadata, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

export function getHotelReviewScores(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getHotelReviewScores, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

export function getHotelReviewsTipsSort(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getHotelReviewsSortOption, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

export function getHotelReviewsTips(input: {
  hotelId: string;
  sortOptionId?: string;
  pageNumber?: number;
  lang?: string;
  timeoutMs?: number;
}) {
  return hotelGet(
    BOOKING_COM15_HOTEL_ENDPOINTS.getHotelReviews,
    {
      hotel_id: input.hotelId,
      sort_option_id: input.sortOptionId || "sort_most_relevant",
      page_number: input.pageNumber ?? 1,
      languagecode: roomsLanguage(input.lang),
    },
    input.timeoutMs
  );
}

export const getAvailability = getRoomAvailability;
export const getHotelReviewsSortOption = getHotelReviewsTipsSort;
export const getHotelReviews = getHotelReviewsTips;
export const getBookingCom15HotelDetails = getBookingHotelDetails;

export function getQuestionAndAnswer(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getQuestionAndAnswer, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

/** Deprecated RapidAPI hotel endpoint — wired, unused in production. */
export function getNearbyCities(input: {
  latitude: string;
  longitude: string;
  lang?: string;
}) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getNearbyCities, {
    latitude: input.latitude,
    longitude: input.longitude,
    languagecode: roomsLanguage(input.lang),
  });
}

export function getPopularAttractionNearBy(input: { hotelId: string; lang?: string }) {
  return hotelGet(BOOKING_COM15_HOTEL_ENDPOINTS.getPopularAttractionNearBy, {
    hotel_id: input.hotelId,
    languagecode: roomsLanguage(input.lang),
  });
}

export function getRoomListWithAvailability(input: {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  childrenAges?: string;
  roomQty?: number;
  lang?: string;
}) {
  return hotelGet(
    BOOKING_COM15_HOTEL_ENDPOINTS.getRoomListWithAvailability,
    stayQuery({
      hotelId: input.hotelId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      childrenAges: input.childrenAges,
      roomQty: input.roomQty,
      lang: input.lang,
    })
  );
}

export function getHotelPhotos(input: { hotelId: string; timeoutMs?: number }) {
  return hotelGet(
    BOOKING_COM15_HOTEL_ENDPOINTS.getHotelPhotos,
    { hotel_id: input.hotelId },
    input.timeoutMs
  );
}

export function getHotelFacilities(input: {
  hotelId: string;
  checkIn?: string;
  checkOut?: string;
  lang?: string;
  timeoutMs?: number;
}) {
  return hotelGet(
    BOOKING_COM15_HOTEL_ENDPOINTS.getHotelFacilities,
    {
      hotel_id: input.hotelId,
      arrival_date: input.checkIn ? toBookingApiDate(input.checkIn) : undefined,
      departure_date: input.checkOut ? toBookingApiDate(input.checkOut) : undefined,
      languagecode: roomsLanguage(input.lang),
    },
    input.timeoutMs
  );
}

export async function bookingCom15Get(
  host: string,
  key: string,
  apiPath: string,
  query: Record<string, string>,
  method: "GET" | "POST" = "GET",
  timeoutMs = ROOMS_HTTP_TIMEOUT_MS
): Promise<FetchOk | FetchErr> {
  const url = new URL(`https://${host}${apiPath}`);
  const bodyParams = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v == null || v === "") continue;
    if (method === "GET") url.searchParams.set(k, v);
    else bodyParams.set(k, v);
  }

  const headers: Record<string, string> = {
    "x-rapidapi-host": host,
    "x-rapidapi-key": key,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (bookingQuotaCooling()) {
    return {
      ok: false,
      status: 429,
      path: apiPath,
      errorCode: "quota",
      body: "quota cooldown",
    };
  }

  if (!(await isBookingRuntimePathEnabled(apiPath))) {
    return {
      ok: false,
      status: 204,
      path: apiPath,
      errorCode: "search_failed",
      body: "endpoint-disabled",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(500, timeoutMs));
  try {
    const res = await directFetch(url.toString(), {
      method,
      headers,
      cache: "no-store",
      signal: controller.signal,
      ...(method === "POST" ? { body: JSON.stringify(Object.fromEntries(bodyParams)) } : {}),
    });
    const text = await res.text();
    const snippet = sanitizeSnippet(text);
    recordRapidApiLiveCall({
      provider: "booking",
      path: apiPath,
      status: res.status,
      headers: res.headers,
      ok: res.ok,
    });
    if (!res.ok) {
      const errorCode = classifyRoomsFailure(res.status, text);
      if (errorCode === "quota") markBookingQuotaCooldown();
      console.error("[booking-com15]", res.status, apiPath, snippet);
      return {
        ok: false,
        status: res.status,
        path: apiPath,
        errorCode,
        body: snippet,
      };
    }
    try {
      return {
        ok: true,
        status: res.status,
        path: apiPath,
        payload: JSON.parse(text) as unknown,
        body: snippet,
      };
    } catch {
      console.error("[booking-com15]", res.status, apiPath, "invalid json", snippet);
      return {
        ok: false,
        status: res.status,
        path: apiPath,
        errorCode: "search_failed",
        body: snippet,
      };
    }
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    const raw = error instanceof Error ? `${error.message} ${error.cause || ""}` : String(error || "");
    const viaProxy = /37367|ECONNREFUSED|tunnel|proxy/i.test(raw);
    return {
      ok: false,
      status: 0,
      path: apiPath,
      errorCode: "search_failed",
      body: aborted ? "timeout" : viaProxy ? "network-proxy" : "network",
    };
  } finally {
    clearTimeout(timer);
  }
}

function destinationRows(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  const data = root?.data;
  if (Array.isArray(data)) {
    return data.map(asRecord).filter((row): row is Record<string, unknown> => Boolean(row));
  }
  const nested = asRecord(data);
  const list = nested?.data || nested?.destinations || nested?.result;
  if (Array.isArray(list)) {
    return list.map(asRecord).filter((row): row is Record<string, unknown> => Boolean(row));
  }
  return root ? [root] : [];
}

function destKind(row: Record<string, unknown>): string {
  return pickString(row.search_type, row.dest_type, row.destType, row.type).toLowerCase();
}

function isHotelDestination(row: Record<string, unknown>): boolean {
  const kind = destKind(row);
  return kind === "hotel" || kind === "property" || kind === "ho";
}

function rowHotelId(row: Record<string, unknown>): string {
  const id = pickString(row.hotel_id, row.hotelId, row.dest_id, row.destId, row.id);
  if (!id || id === "0" || id.startsWith("-")) return "";
  return id;
}

function pickBookingHotelId(payload: unknown, hotelName: string, city: string): string {
  const rows = destinationRows(payload);
  let bestId = "";
  let bestScore = 0;
  for (const row of rows) {
    if (!isHotelDestination(row)) continue;
    const id = rowHotelId(row);
    if (!id) continue;
    const label = pickString(row.name, row.label, row.hotel_name, row.title, row.cc1);
    const score = Math.max(nameScore(hotelName, label), nameScore(`${hotelName} ${city}`, label));
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  return bestId && bestScore >= 24 ? bestId : "";
}

export function hotelIdFromSearchHotels(payload: unknown, hotelName: string, city: string): string {
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root;
  const hotels = data?.hotels || data?.result || data?.properties;
  if (!Array.isArray(hotels)) return "";
  let bestId = "";
  let bestScore = 0;
  for (const item of hotels) {
    const rec = asRecord(item);
    if (!rec) continue;
    const property = asRecord(rec.property) || rec;
    const id = pickString(
      rec.hotel_id,
      rec.hotelId,
      property.hotel_id,
      property.id,
      rec.id
    );
    if (!id || id.startsWith("-")) continue;
    const label = pickString(property.name, rec.hotel_name, rec.name);
    const score = Math.max(nameScore(hotelName, label), nameScore(`${hotelName} ${city}`, label));
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  return bestScore >= 24 ? bestId : "";
}

async function resolveBookingHotelId(
  _host: string,
  _key: string,
  hotelName: string,
  city: string,
  input: HotelRoomsQuery,
  timeoutMs = SEARCH_DEST_TIMEOUT_MS
): Promise<
  | { ok: true; id: string; status: number; path: string; body: string }
  | FetchErr
> {
  const direct = String(input.bookingHotelId || "").trim();
  if (direct && !direct.startsWith("-")) {
    hotelIdCache.set(hotelIdCacheKey(hotelName, city), { at: Date.now(), value: direct });
    void persistBookingHotelId(hotelName, city, direct);
    return { ok: true, id: direct, status: 200, path: "given", body: "" };
  }
  await loadPersistedBookingIds();
  const known = knownBookingHotelId(hotelName, city);
  if (known) {
    hotelIdCache.set(hotelIdCacheKey(hotelName, city), { at: Date.now(), value: known });
    void persistBookingHotelId(hotelName, city, known);
    return { ok: true, id: known, status: 200, path: "known", body: "" };
  }
  const cacheKey = hotelIdCacheKey(hotelName, city);
  const cached = hotelIdCache.get(cacheKey);
  if (cached && Date.now() - cached.at < HOTEL_ID_CACHE_TTL_MS && cached.value) {
    return { ok: true, id: cached.value, status: 200, path: "cache", body: "" };
  }

  const query = [hotelName, city].filter(Boolean).join(" ").trim();
  if (!query) {
    return {
      ok: false,
      status: 0,
      path: BOOKING_COM15_HOTEL_ENDPOINTS.searchDestination,
      errorCode: "search_failed",
      body: "empty hotel name",
    };
  }

  const searched = await searchHotelDestination({
    query,
    languagecode: roomsLanguage(input.lang),
    timeoutMs,
  });
  if (!searched.ok) {
    return searched;
  }
  const id = pickBookingHotelId(searched.payload, hotelName, city);
  if (id) {
    hotelIdCache.set(cacheKey, { at: Date.now(), value: id });
    void persistBookingHotelId(hotelName, city, id);
    return { ok: true, id, status: searched.status, path: searched.path, body: searched.body };
  }

  const lat = input.latitude;
  const lng = input.longitude;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      ok: false,
      status: searched.status,
      path: searched.path,
      errorCode: "search_failed",
      body: "no hotel_id match",
    };
  }
  if (lat === 0 && lng === 0) {
    return {
      ok: false,
      status: searched.status,
      path: searched.path,
      errorCode: "search_failed",
      body: "no hotel_id match",
    };
  }

  const nearby = await searchHotelsByCoordinates({
    latitude: String(lat),
    longitude: String(lng),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    childrenAges: input.childrenAges,
    roomQty: input.roomQty,
    lang: input.lang,
    timeoutMs,
  });
  if (!nearby.ok) return nearby;
  const coordId =
    hotelIdFromSearchHotels(nearby.payload, hotelName, city) ||
    pickBookingHotelId(nearby.payload, hotelName, city);
  if (!coordId) {
    return {
      ok: false,
      status: nearby.status,
      path: nearby.path,
      errorCode: "search_failed",
      body: "no hotel_id match",
    };
  }
  hotelIdCache.set(cacheKey, { at: Date.now(), value: coordId });
  void persistBookingHotelId(hotelName, city, coordId);
  return { ok: true, id: coordId, status: nearby.status, path: nearby.path, body: nearby.body };
}

function imageUrl(value: unknown): string {
  if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) return value.trim();
  const rec = asRecord(value);
  if (!rec) return "";
  const template = pickString(rec.url_template, rec.urlTemplate, rec.url_max1280);
  if (template.includes("{size}") || template.includes("{photo")) {
    return template
      .replace("{size}", "max1280x900")
      .replace("{photo_id}", pickString(rec.photo_id, rec.photoId, rec.id));
  }
  return pickString(
    rec.url_original,
    rec.url_max1280,
    rec.url_max1024,
    rec.url_max750,
    rec.url_640x200,
    rec.url_max500,
    rec.url_max300,
    rec.url_square180,
    rec.highres_url,
    rec.highres,
    rec.url,
    rec.src,
    rec.main_photo_url,
    rec.photo_url
  );
}

function collectRoomOnlyPhotos(
  room: Record<string, unknown>,
  photoIndex?: Record<string, Record<string, unknown>>,
  block?: Record<string, unknown>
): string[] {
  const urls: string[] = [];
  const push = (raw: unknown) => {
    const url = imageUrl(raw);
    if (url && !urls.includes(url)) urls.push(url);
  };
  const bags = [
    room.photos,
    room.images,
    room.room_photos,
    room.roomPhotos,
    room.photo_list,
    room.gallery,
    room.photo_gallery,
    room.main_photo,
    block?.photos,
    block?.images,
    block?.room_photos,
    block?.gallery,
  ];
  for (const bag of bags) {
    if (Array.isArray(bag)) {
      for (const item of bag) {
        if (typeof item === "number" || (typeof item === "string" && /^\d+$/.test(item))) {
          const mapped = photoIndex?.[String(item)];
          if (mapped) push(mapped);
        }
        push(item);
        if (urls.length >= 8) return urls;
      }
    } else if (bag) {
      push(bag);
    }
  }
  push(room.photo);
  push(room.image);
  push(room.main_photo_url);
  return urls.slice(0, 8);
}

function photoIndexFromPayload(data: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  const bags = [data.photos, data.hotel_photos, data.images, asRecord(data.hotel)?.photos];
  for (const bag of bags) {
    if (Array.isArray(bag)) {
      for (const item of bag) {
        const rec = asRecord(item);
        if (!rec) continue;
        const id = pickString(rec.id, rec.photo_id, rec.photoId);
        if (id) out[id] = rec;
      }
      continue;
    }
    const map = asRecord(bag);
    if (!map) continue;
    for (const [id, value] of Object.entries(map)) {
      const rec = asRecord(value);
      if (rec) out[id] = rec;
    }
  }
  return out;
}

function bedsFromName(name: string): string {
  const raw = String(name || "");
  if (/triple|ثلاثية|üç kişilik/i.test(raw)) return "3 beds";
  if (/twin|توأم|çift tek/i.test(raw)) return "2 twin beds";
  if (/king|كينغ|king-size/i.test(raw)) return "1 king bed";
  if (/queen|كوين/i.test(raw)) return "1 queen bed";
  if (/double|مزدوج|çift/i.test(raw)) return "1 double bed";
  const m = raw.match(
    /\b((?:[1-9]\s+)?(?:king|queen|twin|double|single|sofa|bunk)(?:\s+beds?)?)\b/i
  );
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
}

function viewFromName(name: string): string {
  const m = name.match(
    /\b((?:sea|ocean|city|garden|pool|courtyard|bosphorus|partial|street)\s+view)\b/i
  );
  return m ? m[1] : "";
}

function bedsFromRoom(room: Record<string, unknown>, block: Record<string, unknown>): string {
  const direct = pickString(
    room.bed_type,
    room.bedType,
    room.beds,
    room.bed_types_text,
    block.bed_type,
    block.bedType,
    block.beds,
    block.bed_configuration,
    asRecord(room.bed_info)?.name,
    asRecord(block.bed_info)?.name
  );
  if (direct && /bed|سرير|yatak|king|twin|queen|double|single/i.test(direct)) return direct;
  const configs =
    room.bed_configurations ||
    room.bedConfigurations ||
    room.bedTypes ||
    room.bed_types ||
    block.bed_configurations ||
    block.bedConfigurations ||
    block.bed_types;
  const parts: string[] = [];
  const pushLabel = (label: string) => {
    const clean = label.replace(/\s+/g, " ").trim();
    if (clean && /bed|سرير|yatak|king|twin|queen|double|single|sofa/i.test(clean) && !parts.includes(clean)) {
      parts.push(clean);
    }
  };
  const walkBeds = (node: unknown, depth = 0) => {
    if (depth > 4 || parts.length >= 4) return;
    if (typeof node === "string") {
      pushLabel(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walkBeds(item, depth + 1);
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    pushLabel(
      pickString(
        rec.name_with_count,
        rec.nameWithCount,
        rec.name_with_type,
        rec.translated_name,
        rec.description_localized,
        rec.bed_type,
        rec.name,
        rec.title
      )
    );
    const count = pickNumber(rec.count, rec.number, rec.nr, rec.quantity);
    const name = pickString(rec.name, rec.translated_name, rec.bed_type);
    if (count > 0 && name && !/bed|سرير/i.test(name)) {
      pushLabel(`${count} ${name}`);
    }
    for (const key of Object.keys(rec)) {
      if (/bed/i.test(key)) walkBeds(rec[key], depth + 1);
    }
  };
  walkBeds(configs);
  if (parts.length) return parts.join(", ");
  const bags = [room.facilities, room.highlights, room.amenities, block.facilities, block.highlights];
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) {
      const label = pickString(item, asRecord(item)?.name, asRecord(item)?.title);
      if (/king|twin|queen|double bed|single bed|سرير|yatak/i.test(label)) pushLabel(label);
    }
  }
  const named = bedsFromName(
    pickString(
      room.room_name,
      room.name_without_policy,
      room.name,
      block.room_name,
      block.name_without_policy,
      block.name
    )
  );
  if (named) return named;
  const occupancy = Math.round(pickNumber(room.max_occupancy, block.max_occupancy, block.nr_adults));
  if (/triple|ثلاثية|üç/i.test(pickString(room.room_name, block.room_name, block.name))) {
    return occupancy >= 3 ? "3 beds" : "Triple";
  }
  return "";
}

function viewFromRoom(room: Record<string, unknown>, block: Record<string, unknown>): string {
  const direct = pickString(room.view, room.viewType, block.view, block.viewType);
  if (direct) return direct;
  const named = viewFromName(
    pickString(room.room_name, room.name_without_policy, room.name, block.room_name, block.name)
  );
  if (named) return named;
  const facilities = [
    room.facilities,
    room.highlights,
    room.amenities,
    block.facilities,
    block.highlights,
  ];
  for (const bag of facilities) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) {
      const rec = asRecord(item);
      const label = pickString(item, rec?.name, rec?.title, rec?.translated_name);
      if (/view|إطلالة|manzara/i.test(label)) return label;
    }
  }
  return "";
}

function amenityLabel(raw: unknown): string {
  if (typeof raw === "string") return raw.replace(/\s+/g, " ").trim();
  const rec = asRecord(raw);
  if (!rec) return "";
  const details = Array.isArray(rec.details) ? pickString(rec.details[0]) : "";
  return pickString(
    rec.title,
    rec.name,
    details,
    rec.translated_name,
    rec.name_untranslated,
    rec.alt_name,
    rec.localizedName,
    rec.facility_name,
    rec.alt_facilitytype_name,
    rec.text,
    rec.label
  )
    .replace(/\s+/g, " ")
    .trim();
}

function amenitiesFromRoom(room: Record<string, unknown>, block: Record<string, unknown>): string[] {
  const out: string[] = [];
  const push = (raw: unknown) => {
    const rec = asRecord(raw);
    if (rec?.bed_types || rec?.bedTypes) return;
    const clean = amenityLabel(raw);
    if (!clean || clean.length > 64 || out.includes(clean)) return;
    if (/^view all|^see all|^show all|^bed$/i.test(clean)) return;
    out.push(clean);
  };
  const bags = [
    room.facilities,
    room.highlights,
    room.amenities,
    room.room_amenities,
    room.roomFacilities,
    room.room_facilities,
    room.benefits,
    room.facilityIds,
    room.bh_room_highlights,
    asRecord(room.bundle_extras)?.benefits,
    asRecord(block.bundle_extras)?.benefits,
    block.facilities,
    block.amenities,
    block.highlights,
    block.room_highlights,
    block.bh_room_highlights,
  ];
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) push(item);
  }
  return out.slice(0, 12);
}

function breakfastFromBlock(block: Record<string, unknown>): boolean {
  if (block.breakfast_included === 1 || block.breakfastIncluded === true) return true;
  const meal = pickString(block.mealplan, block.meal_plan, block.board, block.boardType);
  return /breakfast|إفطار|kahvaltı/i.test(meal);
}

function boardKey(block: Record<string, unknown>): string {
  const meal = mealplanFromBlock(block).toLowerCase();
  if (/full board|إقامة كاملة/i.test(meal)) return "fb";
  if (/half board|نصف إقامة/i.test(meal)) return "hb";
  if (breakfastFromBlock(block) || /breakfast|إفطار/i.test(meal)) return "bf";
  return "ro";
}

function priceFromBlock(block: Record<string, unknown>): {
  nightly: number | null;
  totalStay: number | null;
  currency: string;
} {
  const breakdown = asRecord(block.product_price_breakdown) || asRecord(block.price_breakdown);
  const perNight = asRecord(breakdown?.gross_amount_per_night) || asRecord(breakdown?.net_amount_per_night);
  const total = asRecord(breakdown?.gross_amount) || asRecord(breakdown?.all_inclusive_amount);
  const minPrice = asRecord(block.min_price) || asRecord(block.price) || asRecord(block.priceBreakdown);
  const gross = asRecord(minPrice?.grossPrice) || asRecord(minPrice?.gross_price);
  const nightly =
    toUsdNumber(perNight?.value) ??
    toUsdNumber(minPrice?.price) ??
    toUsdNumber(gross?.value) ??
    toUsdNumber(block.price) ??
    toUsdNumber(block.min_price);
  const stay = toUsdNumber(total?.value) ?? toUsdNumber(block.total_price);
  const currency =
    pickString(
      perNight?.currency,
      total?.currency,
      minPrice?.currency,
      gross?.currency,
      block.currency,
      block.currency_code
    ) || "USD";
  return { nightly, totalStay: stay, currency };
}

function roomsLookup(data: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  const hotel = asRecord(data.hotel);
  const rooms =
    data.rooms ||
    data.room_list ||
    data.roomList ||
    data.roomTypes ||
    hotel?.rooms ||
    hotel?.room_list;
  if (Array.isArray(rooms)) {
    for (const item of rooms) {
      const rec = asRecord(item);
      if (!rec) continue;
      const id = pickString(rec.room_id, rec.roomId, rec.id);
      if (id) out[id] = rec;
    }
    return out;
  }
  const map = asRecord(rooms);
  if (!map) return out;
  for (const [id, value] of Object.entries(map)) {
    const rec = asRecord(value);
    if (rec) out[id] = rec;
  }
  return out;
}

export type ParseRoomsOptions = {
  fallbackNightly?: number | null;
  hotelPhotos?: string[];
  checkIn?: string;
};

type RoomBlockRow = {
  block: Record<string, unknown>;
  fromUnavailable: boolean;
};

function pushBlockRows(
  list: unknown,
  fromUnavailable: boolean,
  rows: RoomBlockRow[],
  seen: Set<string>
) {
  if (!Array.isArray(list)) return;
  for (const item of list) {
    const rec = asRecord(item);
    if (!rec) continue;
    const sig = [
      pickString(rec.room_id, rec.roomId, rec.id),
      pickString(rec.block_id, rec.blockId),
      String(rec.breakfast_included ?? rec.breakfastIncluded ?? ""),
      String(rec.refundable ?? ""),
      pickString(rec.room_name, rec.name_without_policy, rec.name),
    ].join("|");
    if (seen.has(sig)) continue;
    seen.add(sig);
    rows.push({ block: rec, fromUnavailable });
  }
}

export function collectRoomBlockRows(payload: unknown): RoomBlockRow[] {
  const rows: RoomBlockRow[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown, depth = 0) => {
    if (depth > 4) return;
    const rec = asRecord(node);
    if (!rec) return;
    pushBlockRows(rec.available, false, rows, seen);
    pushBlockRows(rec.unavailable, true, rows, seen);
    pushBlockRows(rec.block, false, rows, seen);
    pushBlockRows(rec.blocks, false, rows, seen);
    pushBlockRows(rec.available_blocks, false, rows, seen);
    pushBlockRows(rec.availableRooms, false, rows, seen);
    pushBlockRows(rec.available_rooms, false, rows, seen);
    pushBlockRows(rec.roomTypes, false, rows, seen);
    pushBlockRows(rec.room_list, false, rows, seen);
    if (depth === 0) {
      visit(rec.data, depth + 1);
      visit(rec.hotel, depth + 1);
    }
  };
  visit(payload);
  return rows;
}

function photoRecordExtra(rec: Record<string, unknown>): string {
  const bags = [
    rec.tags,
    rec.ml_tags,
    rec.photo_tags,
    rec.photoTags,
    rec.classifications,
    rec.types,
  ];
  const bits: string[] = [
    pickString(rec.alt, rec.alt_text, rec.caption, rec.title, rec.description, rec.tag_name, rec.photo_type),
  ];
  for (const bag of bags) {
    if (Array.isArray(bag)) {
      for (const item of bag) {
        const row = asRecord(item);
        bits.push(pickString(item, row?.tag, row?.name, row?.label, row?.id));
      }
    } else if (typeof bag === "string") {
      bits.push(bag);
    }
  }
  return bits.filter(Boolean).join(" ");
}

export function parseHotelPhotoMeta(payload: unknown): { url: string; extra: string }[] {
  const out: { url: string; extra: string }[] = [];
  const seen = new Set<string>();
  const push = (raw: unknown) => {
    if (typeof raw === "string" && /^https?:\/\//i.test(raw.trim())) {
      const url = raw.trim();
      if (!seen.has(url)) {
        seen.add(url);
        out.push({ url, extra: "" });
      }
      return;
    }
    const rec = asRecord(raw);
    if (!rec) return;
    const url = imageUrl(rec);
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ url, extra: photoRecordExtra(rec) });
  };
  const root = asRecord(payload);
  const data = root?.data;
  if (Array.isArray(payload)) {
    for (const item of payload) push(item);
  }
  if (Array.isArray(data)) {
    for (const item of data) push(item);
  } else {
    const rec = asRecord(data) || root;
    if (rec) {
      for (const bag of [rec.photos, rec.images, rec.hotel_photos]) {
        if (Array.isArray(bag)) {
          for (const item of bag) push(item);
        }
      }
    }
  }
  return out.slice(0, 40);
}

export function parseHotelPhotosPayload(payload: unknown): string[] {
  return parseHotelPhotoMeta(payload).map((item) => item.url);
}

export function nightlyFromAvDates(payload: unknown, checkIn: string): number | null {
  const iso = toIsoDate(checkIn);
  if (!iso) return null;
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root;
  if (!data) return null;
  const av = data.avDates || data.av_dates;
  if (!Array.isArray(av)) return null;
  for (const item of av) {
    const rec = asRecord(item);
    if (!rec) continue;
    if (rec[iso] != null) {
      const n = pickNumber(rec[iso]);
      if (n > 0) return n;
    }
    const date = pickString(rec.date, rec.day);
    if (date === iso) {
      const n = pickNumber(rec.price, rec.value, rec.amount);
      if (n > 0) return n;
    }
  }
  return null;
}

function stripPolicyHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#x20ac;/gi, "€")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function translatedPolicyText(node: unknown): string {
  const rec = asRecord(node);
  if (!rec) return typeof node === "string" ? stripPolicyHtml(node) : "";
  const titleDetails = asRecord(rec.title_details);
  const descriptionDetails = asRecord(rec.description_details);
  const clarification = asRecord(rec.clarification_details);
  return stripPolicyHtml(
    pickString(
      rec.translation,
      rec.description,
      rec.text,
      rec.title,
      rec.content,
      rec.policy,
      titleDetails?.translation,
      descriptionDetails?.translation,
      clarification?.translation
    )
  );
}

function policyFromBlock(block: Record<string, unknown>): {
  title: string;
  description: string;
  prepayment: string;
} {
  const details =
    asRecord(block.policy_display_details) ||
    asRecord(block.policyDisplayDetails) ||
    asRecord(block.policies);
  const cancelNode = details
    ? asRecord(details.cancellation) ||
      asRecord(details.cancellation_info) ||
      (Array.isArray(details.cancellation) ? asRecord(details.cancellation[0]) : null)
    : null;
  const preNode = details
    ? asRecord(details.prepayment) ||
      asRecord(details.prepayment_info) ||
      (Array.isArray(details.prepayment) ? asRecord(details.prepayment[0]) : null)
    : null;
  const terms = asRecord(block.paymentterms);
  const termsCancel = asRecord(terms?.cancellation);
  const termsPre = asRecord(terms?.prepayment);
  return {
    title: stripPolicyHtml(
      pickString(
        translatedPolicyText(asRecord(cancelNode)?.title_details),
        cancelNode?.title,
        cancelNode?.name,
        block.cancellation_type
      )
    ),
    description: stripPolicyHtml(
      pickString(
        translatedPolicyText(asRecord(cancelNode)?.description_details),
        cancelNode?.description,
        termsCancel?.description,
        cancelNode?.text,
        cancelNode?.details
      )
    ),
    prepayment: stripPolicyHtml(
      pickString(
        translatedPolicyText(asRecord(preNode)?.title_details),
        translatedPolicyText(asRecord(preNode)?.description_details),
        preNode?.title,
        preNode?.description,
        termsPre?.description,
        translatedPolicyText(termsPre),
        preNode?.text
      )
    ),
  };
}

function mealplanFromBlock(block: Record<string, unknown>): string {
  return (
    pickString(block.mealplan, block.meal_plan, block.board)
      .replace(/\\n/g, "\n")
      .split(/\n+/)[0]
      ?.trim() || ""
  );
}

function smokingLabel(value: unknown): string {
  if (value === 0 || value === "0") return "Non-smoking";
  if (value === 1 || value === "1") return "Smoking";
  return "";
}

function facilityHasChildren(rec: Record<string, unknown>): boolean {
  return [rec.facilities, rec.items, rec.children, rec.facility, rec.amenities, rec.instances].some(
    (bag) => Array.isArray(bag) && bag.length > 0
  );
}

function instanceTitles(raw: unknown): string[] {
  const rec = asRecord(raw);
  if (!rec) return [];
  const titles: string[] = [];
  const bags = [rec.instances, rec.subFacilities, rec.sub_facilities];
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const inst of bag) {
      const ir = asRecord(inst);
      const label = pickString(ir?.title, ir?.name, ir?.translated_name, ir?.label);
      if (label && !titles.includes(label)) titles.push(label);
      if (ir) {
        for (const nested of instanceTitles(ir)) {
          if (!titles.includes(nested)) titles.push(nested);
        }
      }
    }
  }
  return titles;
}

function isFacilityGroupHeading(label: string): boolean {
  return /^(general|some rooms|layout|room amenities|outdoor.?view|services and extra|services|activities|living area|media( &| and) technology|food & drink$|miscellaneous|sustainability practices|safety features|safety & security|physical distancing|cleanliness & disinfection|food.?drink safety|self.?check-?in|عام|بعض الغرف|التصميم|مرافق الغرفة|الخدمات والإضافات|أنشطة خارجية وإطلالات|ميديا وتكنولوجيا|مأكولات ومشروبات|متفرقات|ممارسات الاستدامة|وسائل الأمان|التباعد المكاني|التنظيف والتعقيم|السلامة الغذائية|تسجيل الوصول الذاتي)$/i.test(
    label.trim()
  );
}

export function parseFacilitiesPayload(payload: unknown): string[] {
  const grouped = parseFacilitiesGrouped(payload);
  const out: string[] = [];
  for (const group of grouped) {
    for (const item of group.items) {
      if (!out.includes(item)) out.push(item);
    }
  }
  return out.slice(0, 80);
}

function timeFromNode(node: unknown, prefer: "from" | "until" = "from"): string {
  const rec = asRecord(node);
  if (prefer === "until") {
    return pickString(
      rec?.untilTime,
      rec?.until,
      rec?.to,
      rec?.end_time,
      rec?.until_time,
      rec?.toTime,
      typeof node === "string" ? node : ""
    );
  }
  return pickString(
    rec?.fromTime,
    rec?.from,
    rec?.begin_time,
    rec?.from_time,
    rec?.start,
    typeof node === "string" ? node : ""
  );
}

function looksLikeClock(value: string): boolean {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.length > 28) return false;
  return /^\d{1,2}[:.]\d{2}/.test(text) || /\d{1,2}(?::\d{2})?\s*(?:ص|م|am|pm)/i.test(text);
}

export function extractCheckTimes(payload: unknown): { checkIn: string; checkOut: string } {
  let checkIn = "";
  let checkOut = "";
  const visit = (node: unknown, depth = 0, keyHint = "") => {
    if (depth > 8 || (checkIn && checkOut)) return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1, keyHint);
      return;
    }
    const rec = asRecord(node);
    if (!rec) {
      if (typeof node === "string" && looksLikeClock(node)) {
        if (/check.?out|مغادرة/i.test(keyHint) && !checkOut) checkOut = node.trim();
        else if (/check.?in|وصول/i.test(keyHint) && !checkIn) checkIn = node.trim();
      }
      return;
    }
    const checkinNode =
      rec.checkin || rec.check_in || rec.arrival_info || rec.checkIn || rec.checkin_checkout_times;
    const checkoutNode = rec.checkout || rec.check_out || rec.departure_info || rec.checkOut;
    const inTime =
      timeFromNode(checkinNode, "from") ||
      pickString(rec.checkin_from, rec.checkInFrom, rec.check_in_from);
    const outTime =
      timeFromNode(checkoutNode, "until") ||
      pickString(rec.checkout_until, rec.checkOutUntil, rec.check_out_until);
    if (inTime && looksLikeClock(inTime) && !checkIn) checkIn = inTime;
    if (outTime && looksLikeClock(outTime) && !checkOut) checkOut = outTime;
    if (/check.?in/i.test(keyHint) && !/out/i.test(keyHint)) {
      const hintedIn = timeFromNode(rec, "from");
      if (hintedIn && looksLikeClock(hintedIn) && !checkIn) checkIn = hintedIn;
    }
    if (/check.?out/i.test(keyHint)) {
      const hintedOut = timeFromNode(rec, "until");
      if (hintedOut && looksLikeClock(hintedOut) && !checkOut) checkOut = hintedOut;
    }
    for (const [key, value] of Object.entries(rec)) {
      if (
        /fromTime|untilTime|checkin|checkout|check_in|check_out|arrival|departure/i.test(key) ||
        depth < 3
      ) {
        visit(value, depth + 1, key);
      }
    }
  };
  visit(payload);
  return { checkIn, checkOut };
}

export function parsePoliciesPayload(payload: unknown): string[] {
  const out: string[] = [];
  const push = (raw: unknown) => {
    const rec = asRecord(raw);
    const text = rec
      ? [pickString(rec.title, rec.name), pickString(rec.description, rec.text, rec.details, rec.content, rec.policy)]
          .filter(Boolean)
          .join(" — ")
      : typeof raw === "string"
        ? raw.trim()
        : "";
    if (!text || text.length > 400 || out.includes(text)) return;
    if (/^check-?in\/?check-?out$|^تسجيل الوصول$|^status$|^success$/i.test(text) && text.length < 28) {
      return;
    }
    if (/^(غير قابل للاسترداد|non-?refundable|iade yok)\s*\d+$/i.test(text)) return;
    out.push(text);
  };
  const times = extractCheckTimes(payload);
  if (times.checkIn) push(`Check-in: ${times.checkIn}`);
  if (times.checkOut) push(`Check-out: ${times.checkOut}`);
  const walkPolicies = (node: unknown, depth = 0) => {
    if (depth > 6 || out.length >= 24) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        if (typeof item === "string") push(item);
        else walkPolicies(item, depth + 1);
      }
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    if (rec.title || rec.description || rec.text || rec.content || rec.policy) push(rec);
    for (const key of Object.keys(rec)) {
      if (/polic|rule|checkin|checkout|child|pet|payment|card|house|bed/i.test(key)) {
        walkPolicies(rec[key], depth + 1);
      }
    }
    if (depth === 0) walkPolicies(rec.data, 1);
  };
  walkPolicies(payload);
  return out.slice(0, 24);
}

export function parseReviewsPayload(payload: unknown): TravelAdvisorReview[] {
  const out: TravelAdvisorReview[] = [];
  const bags: unknown[] = [];
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root;
  if (Array.isArray(root?.data)) bags.push(root.data);
  if (data) {
    bags.push(data.result, data.reviews, data.tips, data.items);
  }
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) {
      const rec = asRecord(item);
      if (!rec) continue;
      const authorRec = asRecord(rec.author) || asRecord(rec.user);
      const author = pickString(authorRec?.name, rec.author_name, rec.name, rec.user_name);
      const title = pickString(rec.title, rec.title_translated, rec.headline);
      const cleanBit = (value: string) => {
        const text = value.replace(/\s+/g, " ").trim();
        if (!text || text === "-" || text === "—") return "";
        if (/^\d+$/.test(text)) return "";
        return value.trim();
      };
      const pros = cleanBit(pickString(rec.pros, rec.pros_translated));
      const cons = cleanBit(pickString(rec.cons, rec.cons_translated));
      const body = cleanBit(pickString(rec.text, rec.review, rec.comment, rec.pros_translated));
      const text = [body || pros, cons ? `— ${cons}` : ""].filter(Boolean).join("\n").trim() || title;
      if (!text) continue;
      const rawScore = pickNumber(rec.average_score, rec.averageScore, rec.rating, rec.score);
      const rating = rawScore > 5 ? rawScore : rawScore > 0 ? Math.round(rawScore * 2.5 * 10) / 10 : 0;
      out.push({
        id: pickString(rec.review_id, rec.id, `${author}-${out.length}`) || `rv-${out.length}`,
        author: author || "Guest",
        rating,
        title,
        text,
        date: pickString(rec.date, rec.review_date, rec.created),
      });
      if (out.length >= 50) return out;
    }
  }
  return out;
}

export function parseHotelDetailsPayload(payload: unknown): BookingHotelMeta {
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root || {};
  const hotel = asRecord(data.hotel) || asRecord(data.property) || data;
  const times = extractCheckTimes(payload);
  const checkin =
    asRecord(hotel.checkin) || asRecord(hotel.arrival_info) || asRecord(data.checkin) || {};
  const checkout =
    asRecord(hotel.checkout) || asRecord(hotel.departure_info) || asRecord(data.checkout) || {};
  const address = pickString(hotel.address, hotel.address_trans, data.address, hotel.location);
  const city = pickString(hotel.city, hotel.city_trans, hotel.wishlistName, data.city);
  const neighborhood = pickString(hotel.district, hotel.district_trans, hotel.quarter);
  const starsRaw = pickNumber(
    hotel.accuratePropertyClass,
    hotel.propertyClass,
    hotel.hotel_class,
    hotel.class,
    data.hotel_class
  );
  const stars =
    starsRaw >= 10 && starsRaw <= 50 ? Math.round(starsRaw / 10) : Math.min(5, Math.round(starsRaw));
  return {
    name: pickString(hotel.hotel_name, hotel.name, data.hotel_name),
    stars: stars > 0 && stars <= 5 ? stars : 0,
    address,
    city,
    country: pickString(hotel.country_trans, hotel.countryCode, hotel.cc1, data.country).toUpperCase(),
    rating: pickNumber(hotel.review_score, hotel.reviewScore, data.review_score),
    reviewCount: Math.round(pickNumber(hotel.review_nr, hotel.reviewCount, data.review_nr)),
    lat: pickNumber(hotel.latitude, data.latitude),
    lng: pickNumber(hotel.longitude, data.longitude),
    checkInTime: times.checkIn || pickString(checkin.fromTime, checkin.from, hotel.checkin_from),
    checkOutTime:
      times.checkOut || pickString(checkout.untilTime, checkout.until, hotel.checkout_until),
    locationText: fullLocationText({ neighborhood, address, city }),
  };
}

export function parseNearbyAttractionsPayload(payload: unknown): TravelAdvisorNearbyPlace[] {
  const out: TravelAdvisorNearbyPlace[] = [];
  const seen = new Set<string>();
  const formatDistance = (raw: unknown): string => {
    if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
      if (raw > 50) return `${Math.round(raw)} m`;
      if (raw >= 1) return `${raw.toFixed(1)} km`;
      return `${Math.round(raw * 1000)} m`;
    }
    return typeof raw === "string" ? raw.trim() : "";
  };
  const push = (raw: unknown) => {
    const rec = asRecord(raw);
    const name = rec
      ? pickString(
          rec.name,
          rec.title,
          rec.tag,
          rec.attraction_name,
          rec.label,
          rec.landmark_name,
          rec.poi_name,
          rec.city_name,
          rec.city,
          rec.dest_name,
          asRecord(rec.attraction)?.name
        )
      : typeof raw === "string"
        ? raw.trim()
        : "";
    if (!name || name.length > 120 || seen.has(name.toLowerCase())) return;
    if (/^(location|الموقع|nearby|أماكن قريبة)$/i.test(name)) return;
    seen.add(name.toLowerCase());
    const distance = rec
      ? formatDistance(
          rec.distance ??
            rec.distance_string ??
            rec.dist ??
            rec.distanceKm ??
            rec.distance_km ??
            asRecord(rec.distance)?.value ??
            asRecord(rec.distance)?.text
        )
      : "";
    out.push({ name, distance });
  };
  const walk = (node: unknown, depth = 0) => {
    if (depth > 7 || out.length >= 20) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        const rec = asRecord(item);
        if (rec && (rec.name || rec.title || rec.tag || rec.attraction_name || rec.city_name || rec.distance != null)) {
          push(item);
        } else walk(item, depth + 1);
      }
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    if ((rec.name || rec.tag || rec.title || rec.city_name || rec.landmark_name) && (rec.distance != null || rec.distance_string || rec.dist)) {
      push(rec);
    }
    for (const key of Object.keys(rec)) {
      if (/attract|nearby|landmark|poi|place|popular|location|result|item|cit|closest/i.test(key)) {
        walk(rec[key], depth + 1);
      }
    }
    if (depth === 0) walk(rec.data, 1);
  };
  walk(payload);
  return out;
}

export function parseNearbyFromDescription(text: string): TravelAdvisorNearbyPlace[] {
  const out: TravelAdvisorNearbyPlace[] = [];
  const seen = new Set<string>();
  const push = (rawName: string, km: string) => {
    const chain = rawName.match(/^(.*?)\s*و\s*(\d+)\s*كم\s+(?:عن|من)\s+(.+)$/);
    if (chain) {
      push(chain[1], km);
      push(chain[3], chain[2]);
      return;
    }
    const name = rawName
      .replace(/^و\s+/, "")
      .replace(/^يقع\s+/, "")
      .replace(/[«»"']/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (name.length < 3 || name.length > 48) return;
    if (/\sو\s|وشارع|وبازار|وميدان|ومحطة/.test(name)) return;
    if (
      /مكان الإقامة|هذا الفندق|الضيوف|غرفاً|مكيفة|يمكن للضيوف|Holiday Inn|المصنف|مكان إقامة|^في\s|^من\s|^على\s|مركز (?:إسطنبول|اسطنبول|Istanbul)/i.test(
        name
      )
    ) {
      return;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name, distance: km ? `${String(km).replace(",", ".")} km` : "" });
  };
  const body = String(text || "");
  const patterns = [
    /(?:على بعد|على بُعد|يبعد(?: مكان الإقامة)?|مسافة)\s*(\d+(?:[.,]\d+)?)\s*كم\s*(?:من|عن)\s+([^،.]+)/g,
    /(\d+(?:[.,]\d+)?)\s*كم\s+عن\s+([^،.]+)/g,
    /يقع\s+([^،.]{3,50})\s+على بُعد\s*(\d+(?:[.,]\d+)?)\s*كم/g,
  ];
  for (const [index, re] of patterns.entries()) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null = re.exec(body);
    while (match && out.length < 16) {
      if (index === 2) push(match[1], match[2]);
      else push(match[2], match[1]);
      match = re.exec(body);
    }
  }
  const listMatch = body.match(
    /(?:المعالم(?: السياحية)?(?: الشهيرة)?|أماكن قريبة)[^:.]{0,80}(?:ما يلي|تشمل)?[:：]\s*([^.]+)/
  );
  if (listMatch?.[1]) {
    for (const bit of listMatch[1].split(/\s+و\s+|،|,|؛/).map((part) => part.trim()).filter(Boolean)) {
      const withKm = bit.match(/^(.*?)\s+(?:على بعد|على بُعد)?\s*(\d+(?:[.,]\d+)?)\s*كم/);
      if (withKm) push(withKm[1], withKm[2]);
      else push(bit.replace(/^(?:ومنها|منها)\s+/, ""), "");
    }
  }
  return out;
}

export function extractStayExtrasFromRooms(payload: unknown): {
  policies: string[];
  payment: string[];
  children: string[];
} {
  const policies: string[] = [];
  const payment: string[] = [];
  const children: string[] = [];
  const push = (bag: string[], raw: string) => {
    const text = stripPolicyHtml(raw);
    if (!text || text.length < 8 || text.length > 500 || bag.includes(text)) return;
    if (/^(غير قابل للاسترداد|non-?refundable)\s*\d+$/i.test(text)) return;
    bag.push(text);
  };
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root;
  const blocks = [
    ...(Array.isArray(data?.available) ? data.available : []),
    ...(Array.isArray(data?.unavailable) ? data.unavailable : []),
    ...(Array.isArray(root?.available) ? root.available : []),
  ];
  for (const item of blocks.slice(0, 10)) {
    const rec = asRecord(item);
    if (!rec) continue;
    const policy = policyFromBlock(rec);
    if (policy.title) push(policies, policy.title);
    if (policy.description) push(policies, policy.description);
    if (policy.prepayment && !isPayAtPropertyCopy(policy.prepayment)) push(payment, policy.prepayment);
    const age = pickNumber(rec.max_children_free_age);
    const freeCount = pickNumber(rec.max_children_free);
    if (!children.length && age >= 1 && age <= 17) {
      if (freeCount > 0) {
        push(
          children,
          `Up to ${Math.round(freeCount)} child(ren) aged ${Math.round(age)} or under may stay free, subject to the property child policy.`
        );
      }
    }
  }
  return {
    policies: policies.slice(0, 8),
    payment: payment.slice(0, 8),
    children: children.slice(0, 6),
  };
}

export function parseDescriptionPayload(payload: unknown): string {
  const texts: string[] = [];
  const visit = (node: unknown, depth = 0) => {
    if (depth > 6 || texts.length >= 12) return;
    if (typeof node === "string") {
      const text = node.replace(/\s+/g, " ").trim();
      if (text.length >= 40 && isUsableHotelDescription(text)) texts.push(text);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1);
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    for (const key of Object.keys(rec)) {
      if (/descript|info|about|overview|hoteldescription|important_information/i.test(key)) {
        visit(rec[key], depth + 1);
      }
    }
    if (depth === 0) visit(rec.data, 1);
  };
  visit(payload);
  texts.sort((a, b) => b.length - a.length);
  return texts[0] || "";
}

export function parseQuestionAndAnswerPayload(payload: unknown): TravelAdvisorQuestion[] {
  const out: TravelAdvisorQuestion[] = [];
  const seen = new Set<string>();
  const push = (raw: unknown) => {
    const rec = asRecord(raw);
    if (!rec) return;
    const question = pickString(
      rec.question,
      rec.question_text,
      rec.question_title,
      rec.title,
      rec.q,
      asRecord(rec.question)?.text,
      asRecord(rec.question)?.question,
      asRecord(rec.question)?.title
    );
    const answers = rec.answers || rec.answer_list || rec.replies || rec.answer_items;
    let answer = pickString(
      rec.answer,
      rec.answer_text,
      rec.text,
      asRecord(rec.answer)?.text,
      asRecord(rec.answer)?.answer,
      asRecord(rec.best_answer)?.text
    );
    if (!answer && Array.isArray(answers)) {
      answer = answers
        .map((item) => pickString(asRecord(item)?.answer, asRecord(item)?.text, asRecord(item)?.body, item))
        .filter(Boolean)
        .join("\n");
    }
    if (!question) return;
    if (!answer) answer = "";
    const key = question.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      id: pickString(rec.id, rec.question_id, `qa-${out.length}`) || `qa-${out.length}`,
      question,
      answer,
    });
  };
  const walk = (node: unknown, depth = 0) => {
    if (depth > 6 || out.length >= 20) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        const rec = asRecord(item);
        if (rec && (rec.question || rec.question_text || rec.answers)) push(item);
        else walk(item, depth + 1);
      }
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    if (rec.question || rec.question_text) push(rec);
    for (const key of Object.keys(rec)) {
      if (/qna|question|answer|faq|qa|result|item|list/i.test(key)) walk(rec[key], depth + 1);
    }
    if (depth === 0) walk(rec.data, 1);
  };
  walk(payload);
  return out;
}

export function parseReviewScoresPayload(payload: unknown): TravelAdvisorReviewScore[] {
  const out: TravelAdvisorReviewScore[] = [];
  const seen = new Set<string>();
  const pushNamed = (name: string, score: number) => {
    const label = name.replace(/[_-]+/g, " ").trim();
    if (!label || score <= 0 || seen.has(label.toLowerCase())) return;
    seen.add(label.toLowerCase());
    out.push({ name: label, score: score > 10 && score <= 100 ? score / 10 : score });
  };
  const walk = (node: unknown, depth = 0) => {
    if (depth > 7 || out.length >= 12) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        const rec = asRecord(item);
        if (!rec) continue;
        const name = pickString(
          rec.question,
          rec.score_title,
          rec.title,
          rec.name,
          rec.category,
          rec.criterion
        );
        const score = pickNumber(rec.score, rec.average_score, rec.value, rec.rating, rec.average);
        if (name && score > 0) pushNamed(name, score);
      }
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    const mapped = [
      ["location", rec.location],
      ["service", rec.service],
      ["cleanliness", rec.cleanliness],
      ["facilities", rec.facilities],
      ["staff", rec.staff],
      ["comfort", rec.comfort],
      ["value", rec.value],
    ] as const;
    for (const [name, value] of mapped) {
      const score = pickNumber(value, asRecord(value)?.score, asRecord(value)?.value);
      if (score > 0) pushNamed(name, score);
    }
    for (const key of Object.keys(rec)) {
      if (/score|breakdown|question|categor|subscore|rating/i.test(key)) walk(rec[key], depth + 1);
    }
    if (depth === 0) walk(rec.data, 1);
  };
  walk(payload);
  return out;
}

export function parseFacilitiesGrouped(payload: unknown): TravelAdvisorFacilityGroup[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root || {};
  const groupTitles = new Map<string, string>();
  for (const bag of [data.facilityGroups, data.facility_groups, data.groups]) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) {
      const rec = asRecord(item);
      if (!rec) continue;
      const id = rec.id ?? rec.groupId ?? rec.group_id;
      const title = pickString(rec.title, rec.name, rec.facilitytype_name, rec.category);
      if (id != null && title) groupTitles.set(String(id), title);
    }
  }

  const byGroup = new Map<string, string[]>();
  const pushItem = (groupTitle: string, label: string) => {
    const clean = label.replace(/\s+/g, " ").trim();
    if (!clean || clean.length > 72) return;
    if (isFacilityGroupHeading(clean) && !instanceTitles({ instances: [{ title: clean }] }).length) {
      /* keep heading-only labels out unless they are also real instance titles */
    }
    const key = groupTitle || "";
    const list = byGroup.get(key) || [];
    if (list.includes(clean)) return;
    list.push(clean);
    byGroup.set(key, list);
  };

  const collectFromList = (list: unknown, fallbackGroup = "") => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      const rec = asRecord(item);
      if (!rec) {
        const label = amenityLabel(item);
        if (label && !isFacilityGroupHeading(label)) pushItem(fallbackGroup, label);
        continue;
      }
      const gid = rec.groupId ?? rec.group_id ?? rec.id;
      const groupTitle =
        (gid != null ? groupTitles.get(String(gid)) : "") ||
        pickString(rec.alt_facilitytype_name, rec.facilitytype_name) ||
        fallbackGroup;
      const titles = instanceTitles(rec);
      if (titles.length) {
        for (const title of titles) pushItem(groupTitle, title);
        continue;
      }
      const kids = rec.facilities || rec.items || rec.children;
      if (Array.isArray(kids) && kids.length) {
        const heading = pickString(rec.name, rec.title, rec.category);
        collectFromList(kids, heading || groupTitle);
        continue;
      }
      const label = amenityLabel(rec);
      if (label && !isFacilityGroupHeading(label)) pushItem(groupTitle, label);
    }
  };

  collectFromList(data.facilities || data.hotel_facilities || data.items);
  collectFromList(data.accommodationHighlights, "");
  collectFromList(data.highlights, "");
  if (Array.isArray(root?.data)) collectFromList(root.data);

  const groups: TravelAdvisorFacilityGroup[] = [];
  for (const [title, items] of byGroup) {
    const filtered = items.filter((item) => !isFacilityGroupHeading(item) || items.length === 1);
    if (filtered.length) groups.push({ title, items: filtered.slice(0, 24) });
  }
  return groups.slice(0, 20);
}

export function parsePaymentFeaturesPayload(payload: unknown): string[] {
  const out: string[] = [];
  const push = (label: string) => {
    const clean = label.replace(/\s+/g, " ").trim();
    if (!clean || clean.length > 120 || out.includes(clean)) return;
    if (/^status$|^success$|^true$|^false$/i.test(clean)) return;
    out.push(clean);
  };
  const walk = (node: unknown, depth = 0) => {
    if (depth > 6 || out.length >= 20) return;
    if (typeof node === "string") {
      if (node.trim().length >= 3) push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    const label = pickString(
      rec.name,
      rec.title,
      rec.brand,
      rec.card_type,
      rec.cardType,
      rec.payment_method,
      rec.paymentMethod,
      rec.text,
      rec.description
    );
    if (label) push(label);
    for (const key of Object.keys(rec)) {
      if (/card|payment|method|brand|pay/i.test(key)) walk(rec[key], depth + 1);
    }
    if (depth === 0) walk(rec.data, 1);
  };
  walk(payload);
  return out.slice(0, 20);
}

export function parseChildrenPoliciesPayload(payload: unknown): string[] {
  const out: string[] = [];
  const push = (label: string) => {
    const clean = label.replace(/\s+/g, " ").trim();
    if (!clean || clean.length < 8 || clean.length > 500 || out.includes(clean)) return;
    if (/^status$|^success$|^true$|^false$/i.test(clean)) return;
    out.push(clean);
  };
  const walk = (node: unknown, depth = 0) => {
    if (depth > 6 || out.length >= 16) return;
    if (typeof node === "string") {
      push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    const label = pickString(
      rec.description,
      rec.text,
      rec.content,
      rec.policy,
      rec.child_policy,
      rec.children_policy,
      rec.extra_beds,
      rec.details
    );
    if (label) push(label);
    else if (rec.title && rec.name) push(`${pickString(rec.title)} — ${pickString(rec.name)}`);
    for (const key of Object.keys(rec)) {
      if (/child|bed|crib|infant|family|policy|rule/i.test(key)) walk(rec[key], depth + 1);
    }
    if (depth === 0) walk(rec.data, 1);
  };
  walk(payload);
  return out.slice(0, 16);
}

export function parseRoomsPayload(
  payload: unknown,
  adults: number,
  nights: number,
  options: ParseRoomsOptions = {}
): TravelAdvisorRoom[] {
  const root = asRecord(payload);
  const raw = asRecord(root?.data) || root;
  if (!raw && !root) return [];
  const hotel = raw ? asRecord(raw.hotel) : null;
  const data = hotel && raw ? { ...hotel, ...raw } : raw || root || {};

  const lookup = roomsLookup(data);
  const photos = photoIndexFromPayload(data);
  const hotelPhotos = [
    ...(options.hotelPhotos || []),
    ...parseHotelPhotosPayload(payload),
  ].filter(Boolean);
  void options.fallbackNightly;
  void (options.checkIn ? nightlyFromAvDates(payload, options.checkIn) : null);

  const blockRows = collectRoomBlockRows(payload);
  const grouped = new Map<string, TravelAdvisorRoom>();
  const rateSeen = new Set<string>();

    const sources: RoomBlockRow[] = blockRows.length
    ? blockRows
    : Object.entries(lookup).map(([id, room]) => ({
        block: { ...room, room_id: pickString(room.room_id, id) },
        fromUnavailable: false,
      }));

  for (const { block, fromUnavailable } of sources) {
    const roomId = pickString(block.room_id, block.roomId);
    const room = (roomId && lookup[roomId]) || asRecord(block.room) || block;
    const name = pickString(
      room.room_name,
      block.room_name,
      room.name_without_policy,
      block.name_without_policy,
      room.roomName,
      room.roomtype_name,
      room.name,
      block.roomName,
      block.name
    );
    if (!isRealRoomName(name)) continue;

    const groupKey = roomId || roomNameKey(name);
    const roomPhotos = collectRoomOnlyPhotos(room, photos, block);
    const nativePrice = priceFromBlock(block);
    const hasNativePrice = nativePrice.nightly != null || nativePrice.totalStay != null;
    const priced = hasNativePrice
      ? resolveStayPrices(nativePrice.nightly ?? nativePrice.totalStay, nights, nativePrice.totalStay)
      : { nightly: null, totalStay: null, priceIsStayTotal: false };
    const nightly = priced.nightly;
    const totalStay = priced.totalStay;
    const currency = nativePrice.currency || "USD";
    const explicitSold =
      block.available === 0 ||
      block.is_soldout === 1 ||
      block.soldout === 1;
    const soldOut = fromUnavailable || explicitSold || (hasNativePrice ? false : fromUnavailable);
    const breakfast = breakfastFromBlock(block);
    const refundableKnown =
      block.refundable === 0 ||
      block.refundable === 1 ||
      block.refundable === true ||
      block.refundable === false ||
      block.is_free_cancellable === 0 ||
      block.is_free_cancellable === 1;
    const freeCancellation = Boolean(
      block.refundable === 1 ||
        block.refundable === true ||
        block.is_free_cancellable === 1 ||
        block.is_no_prepayment_block === 1 ||
        /free cancellation|إلغاء مجاني/i.test(pickString(block.refundable_until, block.policy))
    );
    const nonRefundable = refundableKnown && !freeCancellation;
    const policy = policyFromBlock(block);
    const meal = mealplanFromBlock(block);
    const board = boardKey(block);
    const extractedAmenities = amenitiesFromRoom(room, block);
    const highlight = pickString(asRecord(block.bundle_extras)?.highlighted_text);
    if (highlight && !extractedAmenities.includes(highlight)) extractedAmenities.unshift(highlight);
    const smoke = smokingLabel(block.smoking ?? room.smoking);
    if (smoke) extractedAmenities.push(smoke);
    const bathrooms = Math.round(
      pickNumber(block.number_of_bathrooms, room.number_of_bathrooms)
    );
    if (bathrooms > 0) extractedAmenities.push(`${bathrooms} bathroom`);

    const rateKey = `${groupKey}|${board}|${freeCancellation ? 1 : 0}|${nightly ?? "x"}`;
    const rate: TravelAdvisorRoomRate | null =
      nightly != null
        ? {
            id: `${groupKey}-${board}-${freeCancellation ? "rf" : "nr"}-${Math.round(nightly)}`,
            board: breakfast ? "breakfast" : "room_only",
            breakfastIncluded: breakfast,
            freeCancellation,
            price: nightly,
            nightly,
            totalStay,
            currency,
            partnerName: "",
            label: meal || undefined,
          }
        : null;

    const existing = grouped.get(groupKey);
    if (existing) {
      if (rate && !rateSeen.has(rateKey)) {
        rateSeen.add(rateKey);
        existing.rates.push(rate);
      }
      existing.breakfastIncluded = existing.breakfastIncluded || breakfast;
      existing.freeCancellation = existing.freeCancellation || freeCancellation;
      existing.nonRefundable = existing.freeCancellation ? false : existing.nonRefundable || nonRefundable;
      existing.available = existing.available || !soldOut;
      existing.images = Array.from(new Set([...existing.images, ...roomPhotos])).slice(0, 8);
      existing.amenities = Array.from(
        new Set([...existing.amenities, ...extractedAmenities])
      ).slice(0, 12);
      if (nightly != null && (existing.nightly == null || nightly < existing.nightly)) {
        existing.price = nightly;
        existing.nightly = nightly;
        existing.totalStay = totalStay;
        existing.currency = currency;
      }
      if (!existing.cancellationPolicy && (policy.title || policy.description)) {
        existing.cancellationPolicy = [policy.title, policy.description]
          .filter(Boolean)
          .join(" — ");
      }
      if (!existing.prepayment && policy.prepayment) existing.prepayment = policy.prepayment;
      if (!existing.description && meal) existing.description = meal;
      continue;
    }

    if (rate) rateSeen.add(rateKey);
    grouped.set(groupKey, {
      id: `bk:${roomId || groupKey}`,
      name,
      description: pickString(
        room.description,
        asRecord(room.description)?.text,
        block.room_description,
        meal
      ),
      beds: bedsFromRoom(room, block),
      capacity: Math.round(
        pickNumber(room.max_occupancy, room.occupancy, block.max_occupancy, block.nr_adults, adults)
      ),
      sizeSqm: Math.round(
        pickNumber(room.room_surface_in_m2, room.squareMeters, block.room_surface_in_m2, room.size)
      ),
      price: nightly,
      currency,
      amenities: extractedAmenities,
      images: roomPhotos,
      breakfastIncluded: breakfast,
      freeCancellation,
      nonRefundable,
      view: viewFromRoom(room, block),
      partnerName: "",
      nightly,
      totalStay,
      available: !soldOut,
      rates: rate ? [rate] : [],
      cancellationPolicy:
        [policy.title, policy.description].filter(Boolean).join(" — ") || undefined,
      prepayment: policy.prepayment || undefined,
    });
  }

  for (const [id, room] of Object.entries(lookup)) {
    const name = pickString(room.room_name, room.roomName, room.name_without_policy);
    if (!isRealRoomName(name)) continue;
    const key = roomIdGroupKey(id, name);
    if (grouped.has(id) || grouped.has(key)) continue;
    grouped.set(id || key, {
      id: `bk:${id}`,
      name,
      description: pickString(room.description, asRecord(room.description)?.text),
      beds: bedsFromRoom(room, room),
      capacity: Math.round(pickNumber(room.max_occupancy, room.occupancy)),
      sizeSqm: Math.round(pickNumber(room.room_surface_in_m2, room.squareMeters, room.size)),
      price: null,
      currency: "USD",
      amenities: amenitiesFromRoom(room, room),
      images: collectRoomOnlyPhotos(room, photos, room),
      breakfastIncluded: false,
      freeCancellation: false,
      nonRefundable: false,
      view: viewFromRoom(room, room),
      partnerName: "",
      nightly: null,
      totalStay: null,
      available: false,
      rates: [],
    });
  }

  const rooms = assignUniqueRoomPhotos(Array.from(grouped.values()), hotelPhotos);

  return rooms
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return (a.nightly ?? a.price ?? 999999) - (b.nightly ?? b.price ?? 999999);
    })
    .slice(0, 24);
}

function roomIdGroupKey(id: string, name: string): string {
  return id || roomNameKey(name);
}

export function mergeProviderRooms(
  providerRooms: TravelAdvisorRoom[],
  existing: TravelAdvisorRoom[]
): TravelAdvisorRoom[] {
  const seen = new Map<string, TravelAdvisorRoom>();
  const out: TravelAdvisorRoom[] = [];
  for (const room of [...providerRooms, ...existing]) {
    if (!isRealRoomName(room.name)) continue;
    const key = roomNameKey(room.name);
    const current = seen.get(key);
    if (current) {
      current.beds = current.beds || room.beds;
      current.view = current.view || room.view;
      current.description = current.description || room.description;
      current.capacity = Math.max(current.capacity, room.capacity);
      current.sizeSqm = current.sizeSqm || room.sizeSqm;
      current.images = Array.from(new Set([...current.images, ...room.images])).slice(0, 8);
      current.amenities = Array.from(
        new Set([...(current.amenities || []), ...(room.amenities || [])])
      ).slice(0, 12);
      current.rates = [...current.rates, ...room.rates];
      current.cancellationPolicy = current.cancellationPolicy || room.cancellationPolicy;
      current.prepayment = current.prepayment || room.prepayment;
      current.available = current.available || room.available;
      if (room.price != null && (current.price == null || room.price < current.price)) {
        current.price = room.price;
        current.nightly = room.nightly;
        current.totalStay = room.totalStay;
        current.currency = room.currency;
      }
      continue;
    }
    seen.set(key, {
      ...room,
      amenities: room.amenities || [],
      rates: room.rates.slice(),
      available: room.available !== false,
    });
    out.push(seen.get(key)!);
  }
  return out
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return (a.nightly ?? a.price ?? 999999) - (b.nightly ?? b.price ?? 999999);
    })
    .slice(0, 24);
}

async function persistRoomsPayload(hotelId: string, payload: unknown) {
  if (!hotelId || !payload) return;
  try {
    await fs.mkdir(path.dirname(BOOKING_ID_FILE), { recursive: true });
    await fs.writeFile(
      path.join(process.cwd(), ".data", `booking-rooms-${hotelId}.json`),
      JSON.stringify(payload),
      { mode: 0o600 }
    );
  } catch {
    /* ignore disk errors */
  }
}

async function loadCachedRoomsPayload(hotelId: string): Promise<unknown | null> {
  const files = [
    path.join(process.cwd(), ".data", `booking-rooms-${hotelId}.json`),
    path.join(process.cwd(), ".data", `booking-hotel-rooms-${hotelId}.json`),
  ];
  for (const file of files) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      /* try next */
    }
  }
  return null;
}

type EnrichmentCache = {
  at: number;
  photos: string[];
  facilities: string[];
  reviews: TravelAdvisorReview[];
  policies: string[];
  nearbyPlaces: TravelAdvisorNearbyPlace[];
  description: string;
};

async function loadEnrichmentCache(hotelId: string): Promise<EnrichmentCache | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), ".data", `booking-enrich-${hotelId}.json`),
      "utf8"
    );
    const parsed = JSON.parse(raw) as EnrichmentCache;
    if (!parsed || typeof parsed !== "object") return null;
    if (Date.now() - (parsed.at || 0) > HOTEL_ID_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function persistEnrichmentCache(hotelId: string, value: EnrichmentCache) {
  if (!hotelId) return;
  try {
    await fs.mkdir(path.dirname(BOOKING_ID_FILE), { recursive: true });
    await fs.writeFile(
      path.join(process.cwd(), ".data", `booking-enrich-${hotelId}.json`),
      JSON.stringify({ ...value, at: Date.now() }),
      { mode: 0o600 }
    );
  } catch {
    /* ignore disk errors */
  }
}

async function fetchRoomsPayload(
  host: string,
  key: string,
  hotelId: string,
  input: HotelRoomsQuery,
  timeoutMs = ROOMS_HTTP_TIMEOUT_MS
): Promise<FetchOk | FetchErr> {
  const query = stayQuery({
    hotelId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    childrenAges: input.childrenAges,
    roomQty: input.roomQty,
    lang: input.lang,
  });
  return bookingCom15Get(host, key, PRODUCTION_ROOMS_PATH, query, "GET", timeoutMs);
}

type ExtraBox<T> = { fetched: true; value: T };

function isExtraBox<T>(value: unknown): value is ExtraBox<T> {
  return Boolean(value && typeof value === "object" && (value as ExtraBox<T>).fetched === true && "value" in value);
}

function unwrapExtra<T>(raw: unknown, emptyIsMiss: boolean): { hit: boolean; value: T | undefined } {
  if (raw == null) return { hit: false, value: undefined };
  if (isExtraBox<T>(raw)) {
    if (emptyIsMiss && Array.isArray(raw.value) && raw.value.length === 0) {
      return { hit: false, value: undefined };
    }
    return { hit: true, value: raw.value };
  }
  if (emptyIsMiss && Array.isArray(raw) && raw.length === 0) return { hit: false, value: undefined };
  if (
    emptyIsMiss &&
    Array.isArray(raw) &&
    raw.length > 0 &&
    raw.every((item) => typeof item === "string" && isFacilityGroupHeading(item))
  ) {
    return { hit: false, value: undefined };
  }
  return { hit: true, value: raw as T };
}

async function readExtra<T>(key: string, emptyIsMiss = true): Promise<{ hit: boolean; value: T | undefined }> {
  const raw = await readBookingCache<unknown>(key, BOOKING_DETAIL_TTL_MS);
  return unwrapExtra<T>(raw, emptyIsMiss);
}

async function writeExtra<T>(key: string, value: T): Promise<void> {
  await writeBookingCache(key, { fetched: true, value } satisfies ExtraBox<T>);
}

export async function fetchHotelReviewsPage(input: {
  hotelId: string;
  page: number;
  lang?: string;
}): Promise<TravelAdvisorReview[]> {
  const hotelId = String(input.hotelId || "").trim();
  const page = Math.max(1, Math.floor(input.page || 1));
  const lang = roomsLanguage(input.lang);
  const cacheKey = `reviews-${hotelId}-${page}-${lang}`;
  const cached = unwrapExtra<TravelAdvisorReview[]>(
    await readBookingCache<unknown>(cacheKey, BOOKING_DETAIL_TTL_MS),
    true
  );
  if (cached.hit && cached.value?.length) return cached.value;
  const fetched = await getHotelReviews({
    hotelId,
    pageNumber: page,
    lang,
  });
  if (!fetched.ok) return [];
  const reviews = parseReviewsPayload(fetched.payload);
  if (reviews.length) await writeExtra(cacheKey, reviews);
  return reviews;
}

type PhaseBResult = {
  facilities: string[];
  reviews: TravelAdvisorReview[];
  policies: string[];
  nearbyPlaces: TravelAdvisorNearbyPlace[];
  description: string;
  questions: TravelAdvisorQuestion[];
  reviewScores: TravelAdvisorReviewScore[];
  facilityGroups: TravelAdvisorFacilityGroup[];
  childrenPolicy: string[];
  payment: string[];
  hotelMeta?: BookingHotelMeta;
};

function uniquePolicyLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const text = String(line || "").replace(/\s+/g, " ").trim();
    if (!text || out.includes(text)) continue;
    if (/^(غير قابل للاسترداد|non-?refundable)\s*\d+$/i.test(text)) continue;
    if (isPayAtPropertyCopy(text)) continue;
    out.push(text);
  }
  return out;
}

function applyRoomDerivedExtras(
  extras: PhaseBResult,
  rooms: TravelAdvisorRoom[],
  roomsPayload: unknown
): PhaseBResult {
  const fromPayload = roomsPayload
    ? extractStayExtrasFromRooms(roomsPayload)
    : { policies: [], payment: [], children: [] };
  const fromRooms = { policies: [] as string[], payment: [] as string[] };
  for (const room of rooms) {
    if (room.cancellationPolicy) fromRooms.policies.push(room.cancellationPolicy);
    if (room.prepayment) fromRooms.payment.push(room.prepayment);
  }
  return {
    ...extras,
    policies: uniquePolicyLines([
      ...extras.policies,
      ...fromPayload.policies,
      ...fromRooms.policies,
    ]).slice(0, 24),
    payment: uniquePolicyLines([
      ...extras.payment,
      ...fromPayload.payment,
      ...fromRooms.payment,
    ]).slice(0, 20),
    childrenPolicy: extras.childrenPolicy.length
      ? extras.childrenPolicy
      : fromPayload.children,
  };
}

async function runBookingPhaseB(
  hotelId: string,
  input: HotelRoomsQuery,
  _remain?: () => number
): Promise<PhaseBResult> {
  void _remain;
  const lang = roomsLanguage(input.lang);
  const detailsKey = `details-${hotelId}-${lang}`;
  const descKey = `description-${hotelId}-${lang}`;
  const facKey = `facilities-${hotelId}-${lang}`;
  const facGroupKey = `facility-groups-${hotelId}-${lang}`;
  const revKey = `reviews-${hotelId}-1-${lang}`;
  const polKey = `policies-${hotelId}-${lang}`;
  const nearKey = `attractions-${hotelId}-${lang}`;
  const qaKey = `qa-${hotelId}-${lang}`;
  const scoresKey = `review-scores-${hotelId}-${lang}`;
  const childKey = `children-policies-${hotelId}-${lang}`;
  const payKey = `payment-${hotelId}-${lang}`;
  const sortKey = `review-sort-${hotelId}-${lang}`;

  const detailsBox = await readExtra<BookingHotelMeta>(detailsKey, false);
  let hotelMeta = detailsBox.value;
  let description = (await readExtra<string>(descKey, true)).value || "";
  let facilities = (await readExtra<string[]>(facKey)).value || [];
  let facilityGroups = (await readExtra<TravelAdvisorFacilityGroup[]>(facGroupKey)).value || [];
  let reviews = (await readExtra<TravelAdvisorReview[]>(revKey)).value || [];
  const policiesBox = await readExtra<string[]>(polKey, false);
  let policies = (policiesBox.value || []).filter(
    (line) => !/^(غير قابل للاسترداد|non-?refundable)\s*\d+$/i.test(line)
  );
  const nearbyBox = await readExtra<TravelAdvisorNearbyPlace[]>(nearKey, false);
  let nearbyPlaces = nearbyBox.value || [];
  if (description) {
    const fromDesc = parseNearbyFromDescription(description);
    if (fromDesc.length) {
      const seen = new Set(nearbyPlaces.map((place) => place.name.toLowerCase()));
      let added = 0;
      for (const place of fromDesc) {
        if (seen.has(place.name.toLowerCase())) continue;
        nearbyPlaces.push(place);
        seen.add(place.name.toLowerCase());
        added += 1;
      }
    }
  }
  nearbyPlaces = nearbyPlaces.filter(
    (place) =>
      place.name &&
      place.name.length <= 48 &&
      !/\sو\s|وشارع|وبازار|وميدان|ومحطة/.test(place.name) &&
      !/^(في|من|على)\s/.test(place.name)
  );
  if (description || nearbyPlaces.length) {
    await writeExtra(nearKey, nearbyPlaces);
  }
  const questionsBox = await readExtra<TravelAdvisorQuestion[]>(qaKey, false);
  let questions = questionsBox.value || [];
  const scoresBox = await readExtra<TravelAdvisorReviewScore[]>(scoresKey, false);
  let reviewScores = scoresBox.value || [];
  const childrenBox = await readExtra<string[]>(childKey, false);
  let childrenPolicy = childrenBox.value || [];
  const paymentBox = await readExtra<string[]>(payKey, false);
  let payment = paymentBox.value || [];

  const jobs: Array<() => Promise<void>> = [];

  if (!reviews.length) {
    jobs.push(async () => {
      reviews = await fetchHotelReviewsPage({ hotelId, page: 1, lang: input.lang });
    });
  }
  if (!facilities.length || !facilityGroups.length) {
    jobs.push(async () => {
      const res = await getHotelFacilities({
        hotelId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        lang: input.lang,
        timeoutMs: 8000,
      });
      if (!res.ok) return;
      facilities = parseFacilitiesPayload(res.payload);
      facilityGroups = parseFacilitiesGrouped(res.payload);
      if (facilities.length) await writeExtra(facKey, facilities);
      if (facilityGroups.length) await writeExtra(facGroupKey, facilityGroups);
    });
  }
  if (!nearbyPlaces.length) {
    jobs.push(async () => {
      const res = await getPopularAttractionNearBy({ hotelId, lang: input.lang });
      if (res.ok) {
        const parsed = parseNearbyAttractionsPayload(res.payload);
        if (parsed.length) nearbyPlaces = parsed;
      }
      if (!nearbyPlaces.length) {
        const lat = input.latitude ?? hotelMeta?.lat;
        const lng = input.longitude ?? hotelMeta?.lng;
        if (lat && lng) {
          const cities = await getNearbyCities({
            latitude: String(lat),
            longitude: String(lng),
            lang: input.lang,
          });
          if (cities.ok) {
            const parsed = parseNearbyAttractionsPayload(cities.payload);
            if (parsed.length) nearbyPlaces = parsed;
          }
        }
      }
      if (!nearbyPlaces.length && description) {
        nearbyPlaces = parseNearbyFromDescription(description);
      }
      await writeExtra(nearKey, nearbyPlaces);
    });
  }
  if (!policiesBox.hit) {
    jobs.push(async () => {
      const res = await getHotelPolicies({ hotelId, lang: input.lang });
      if (!res.ok) return;
      policies = parsePoliciesPayload(res.payload);
      await writeExtra(polKey, policies);
    });
  }
  if (!hotelMeta) {
    jobs.push(async () => {
      const res = await getBookingHotelDetails({
        hotelId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        childrenAges: input.childrenAges,
        roomQty: input.roomQty,
        lang: input.lang,
      });
      if (!res.ok) return;
      hotelMeta = parseHotelDetailsPayload(res.payload);
      const fromDetails = parseDescriptionPayload(res.payload);
      if (!isUsableHotelDescription(description) && isUsableHotelDescription(fromDetails)) {
        description = fromDetails;
        await writeExtra(descKey, description);
      }
      await writeExtra(detailsKey, hotelMeta);
    });
  }
  if (!childrenBox.hit) {
    jobs.push(async () => {
      const res = await propertyChildrenPolicies({ hotelId, lang: input.lang });
      if (!res.ok) return;
      childrenPolicy = parseChildrenPoliciesPayload(res.payload);
      if (!childrenPolicy.length) childrenPolicy = parsePoliciesPayload(res.payload);
      await writeExtra(childKey, childrenPolicy);
    });
  }
  if (!paymentBox.hit) {
    jobs.push(async () => {
      const res = await getPaymentFeatures({ hotelId, lang: input.lang });
      if (!res.ok) return;
      payment = parsePaymentFeaturesPayload(res.payload);
      await writeExtra(payKey, payment);
    });
  }
  if (!questionsBox.hit) {
    jobs.push(async () => {
      const res = await getQuestionAndAnswer({ hotelId, lang: input.lang });
      if (res.ok) {
        questions = parseQuestionAndAnswerPayload(res.payload);
      }
      await writeExtra(qaKey, questions);
    });
  }
  if (!isUsableHotelDescription(description)) {
    jobs.push(async () => {
      const res = await getDescriptionAndInfo({ hotelId, lang: input.lang });
      if (!res.ok) return;
      const text = parseDescriptionPayload(res.payload);
      if (isUsableHotelDescription(text)) {
        description = text;
        await writeExtra(descKey, text);
      }
    });
  }
  if (!scoresBox.hit) {
    const leftover = await readExtra<TravelAdvisorReviewScore[]>(scoresKey, false);
    if (leftover.hit) reviewScores = leftover.value || [];
  }
  const sortCached = await readExtra<unknown>(sortKey, false);
  void sortCached;

  // RapidAPI BASIC 429s if 8 extras fire at once — two at a time.
  for (let i = 0; i < jobs.length; i += 2) {
    await Promise.all(jobs.slice(i, i + 2).map((job) => job()));
    if (i + 2 < jobs.length) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  if (hotelMeta) {
    const times = { checkIn: hotelMeta.checkInTime, checkOut: hotelMeta.checkOutTime };
    if (times.checkIn && !policies.some((line) => /check-?in/i.test(line))) {
      policies = [`Check-in: ${times.checkIn}`, ...policies];
    }
    if (times.checkOut && !policies.some((line) => /check-?out/i.test(line))) {
      policies = [`Check-out: ${times.checkOut}`, ...policies];
    }
  }

  if (!facilityGroups.length && facilities.length) {
    facilityGroups = [{ title: "", items: facilities }];
  }

  return {
    facilities,
    reviews,
    policies,
    nearbyPlaces,
    description,
    questions,
    reviewScores,
    facilityGroups,
    childrenPolicy,
    payment,
    hotelMeta: hotelMeta || undefined,
  };
}

export async function getHotelRooms(input: HotelRoomsQuery): Promise<HotelRoomsProviderResult> {
  const { key, host, enabled } = await roomsCredentials();
  const hotelName = (input.hotelName || "").trim();
  const givenId = String(input.bookingHotelId || "").trim();
  if (!enabled) {
    return emptyResult(host, null, null);
  }
  if (!key) {
    const result = emptyResult(host, "not_configured", errorMessage("not_configured"));
    rememberStatus({
      host,
      lastError: result.error,
      lastErrorCode: result.errorCode,
      lastHotelName: hotelName,
      lastBookingHotelId: "",
      lastRoomCount: 0,
      lastSample: [],
      lastHttpStatus: null,
      lastPath: "",
      lastBodySnippet: "",
    });
    return result;
  }
  if (!givenId && !isRealRoomName(hotelName)) {
    return emptyResult(host, null, null);
  }

  const overallMs = givenId ? 28000 : ROOMS_OVERALL_TIMEOUT_MS;
  const workKey = `${host}:${givenId || hotelIdCacheKey(hotelName, input.city || "")}:${input.checkIn}:${input.checkOut}:${roomsLanguage(input.lang)}:${input.adults || 2}:${input.roomQty || 1}`;
  const existing = inflight.get(workKey);
  let extrasHold: Promise<PhaseBResult> | null = null;
  const work =
    existing ||
    (async () => {
      const started = Date.now();
      const deadline = started + overallMs;
      const remain = () => Math.max(200, deadline - Date.now());
      const resolved = await resolveBookingHotelId(
        host,
        key,
        hotelName || "Hotel",
        input.city || "",
        input,
        givenId ? 200 : Math.min(SEARCH_DEST_TIMEOUT_MS, remain())
      );
      if (!resolved.ok) {
        const result = emptyResult(host, null, null, {
          path: resolved.path || "cache",
          bodySnippet: "no booking hotel id — Travel Advisor fallback",
        });
        rememberStatus({
          host,
          lastError: null,
          lastErrorCode: null,
          lastHotelName: hotelName,
          lastBookingHotelId: "",
          lastRoomCount: 0,
          lastSample: [],
          lastHttpStatus: null,
          lastPath: result.path,
          lastBodySnippet: result.bodySnippet,
        });
        return result;
      }

      const cacheKey = roomsCacheKey(input, resolved.id);
      const mem = roomsCache.get(cacheKey);
      extrasHold = runBookingPhaseB(resolved.id, input);
      if (mem && Date.now() - mem.at < ROOMS_CACHE_TTL_MS) {
        const datedRoomsKey = [
          "rooms",
          resolved.id,
          toIsoDate(input.checkIn),
          toIsoDate(input.checkOut),
          String(input.adults || 2),
          String(input.roomQty || 1),
          roomsLanguage(input.lang),
        ].join("-");
        const roomsPayload =
          (await readBookingCache<unknown>(datedRoomsKey, BOOKING_ROOMS_TTL_MS)) ||
          (await loadCachedRoomsPayload(resolved.id));
        const extrasFresh = applyRoomDerivedExtras(
          await extrasHold,
          mem.value.rooms,
          roomsPayload
        );
        const merged: HotelRoomsProviderResult = {
          ...mem.value,
          facilities: extrasFresh.facilities.length ? extrasFresh.facilities : mem.value.facilities,
          reviews: extrasFresh.reviews.length ? extrasFresh.reviews : mem.value.reviews,
          policies: extrasFresh.policies.length ? extrasFresh.policies : mem.value.policies,
          nearbyPlaces: extrasFresh.nearbyPlaces.length ? extrasFresh.nearbyPlaces : mem.value.nearbyPlaces,
          questions: extrasFresh.questions.length ? extrasFresh.questions : mem.value.questions,
          reviewScores: extrasFresh.reviewScores.length ? extrasFresh.reviewScores : mem.value.reviewScores,
          facilityGroups: extrasFresh.facilityGroups.length
            ? extrasFresh.facilityGroups
            : mem.value.facilityGroups,
          childrenPolicy: extrasFresh.childrenPolicy.length
            ? extrasFresh.childrenPolicy
            : mem.value.childrenPolicy || [],
          payment: extrasFresh.payment.length ? extrasFresh.payment : mem.value.payment || [],
          hotelMeta: extrasFresh.hotelMeta || mem.value.hotelMeta,
          description: extrasFresh.description || mem.value.description,
        };
        roomsCache.set(cacheKey, { at: Date.now(), value: merged });
        return merged;
      }

      const nights = stayNights(input.checkIn, input.checkOut);
      const parseOpts: ParseRoomsOptions = {
        fallbackNightly: input.fallbackNightly,
        hotelPhotos: input.hotelPhotos,
        checkIn: input.checkIn,
      };
      const datedRoomsKey = [
        "rooms",
        resolved.id,
        toIsoDate(input.checkIn),
        toIsoDate(input.checkOut),
        String(input.adults || 2),
        String(input.roomQty || 1),
        roomsLanguage(input.lang),
      ].join("-");

      const extrasPromise = extrasHold || runBookingPhaseB(resolved.id, input);
      extrasHold = extrasPromise;

      let roomsPath = "file-cache";
      let roomsStatus = 200;
      let roomsSnippet = "cached rooms payload";
      let roomsPayload: unknown =
        (await readBookingCache<unknown>(datedRoomsKey, BOOKING_ROOMS_TTL_MS)) || null;
      if (!roomsPayload && remain() > 800) {
        const fetched = await fetchRoomsPayload(host, key, resolved.id, input, Math.min(8000, remain()));
        if (fetched.ok) {
          roomsPayload = fetched.payload;
          roomsPath = fetched.path;
          roomsStatus = fetched.status;
          roomsSnippet = fetched.body;
          void persistRoomsPayload(resolved.id, fetched.payload);
          await writeBookingCache(datedRoomsKey, fetched.payload);
        } else {
          roomsPath = fetched.path;
          roomsStatus = fetched.status;
          roomsSnippet = fetched.body;
          roomsPayload = await loadCachedRoomsPayload(resolved.id);
        }
      }

      let rooms = roomsPayload
        ? parseRoomsPayload(roomsPayload, input.adults || 2, nights, parseOpts)
        : [];

      const photoKey = `photos-${resolved.id}`;
      const cachedPhotos = await readBookingCache<unknown>(photoKey, BOOKING_DETAIL_TTL_MS);
      let photoMeta: { url: string; extra: string }[] = [];
      let photos: string[] = [];
      if (Array.isArray(cachedPhotos) && cachedPhotos.length) {
        if (typeof cachedPhotos[0] === "object" && cachedPhotos[0] && "url" in (cachedPhotos[0] as object)) {
          photoMeta = (cachedPhotos as { url: string; extra?: string }[])
            .map((item) => ({ url: String(item.url || ""), extra: String(item.extra || "") }))
            .filter((item) => item.url);
          photos = photoMeta.map((item) => item.url);
        } else {
          photos = cachedPhotos.filter((item): item is string => typeof item === "string" && item.length > 0);
        }
      }
      if (!photos.length && (input.hotelPhotos || []).length < 4 && remain() > 1200) {
        const photoRes = await getHotelPhotos({ hotelId: resolved.id, timeoutMs: Math.min(6500, remain()) });
        if (photoRes.ok) {
          photoMeta = parseHotelPhotoMeta(photoRes.payload);
          photos = photoMeta.map((item) => item.url);
          if (photoMeta.length) await writeBookingCache(photoKey, photoMeta);
        }
      }

      const hotelPhotos = Array.from(new Set([...photos, ...(input.hotelPhotos || [])]));
      rooms = assignUniqueRoomPhotos(rooms, photoMeta.length ? [...photoMeta, ...hotelPhotos] : hotelPhotos);

      const phaseB = applyRoomDerivedExtras(await extrasPromise, rooms, roomsPayload);
      const description = isUsableHotelDescription(phaseB.description) ? phaseB.description : "";

      void persistBookingHotelId(hotelName || phaseB.hotelMeta?.name || "", input.city || "", resolved.id);
      const result: HotelRoomsProviderResult = {
        rooms,
        bookingHotelId: resolved.id,
        error: rooms.length ? null : roomsPayload ? "HTTP 200 — لا غرف قابلة للتحليل في الرد" : null,
        errorCode: rooms.length || !roomsPayload ? null : "search_failed",
        subscribeUrl: BOOKING_COM15_SUBSCRIBE_URL,
        host,
        httpStatus: roomsStatus,
        path: roomsPath,
        bodySnippet: roomsSnippet,
        photos: hotelPhotos.slice(0, 40),
        facilities: phaseB.facilities,
        reviews: phaseB.reviews,
        policies: phaseB.policies,
        nearbyPlaces: phaseB.nearbyPlaces,
        description,
        questions: phaseB.questions,
        reviewScores: phaseB.reviewScores,
        facilityGroups: phaseB.facilityGroups,
        childrenPolicy: phaseB.childrenPolicy,
        payment: phaseB.payment,
        hotelMeta: phaseB.hotelMeta,
      };
      roomsCache.set(cacheKey, { at: Date.now(), value: result });
      rememberStatus({
        host,
        lastError: result.error,
        lastErrorCode: result.errorCode,
        lastHotelName: hotelName || phaseB.hotelMeta?.name || "",
        lastBookingHotelId: resolved.id,
        lastRoomCount: rooms.length,
        lastSample: rooms.slice(0, 4).map((room) => ({
          name: room.name,
          photo: room.images[0] || "",
        })),
        lastHttpStatus: roomsStatus,
        lastPath: roomsPath,
        lastBodySnippet: roomsSnippet,
      });
      return result;
    })();

  if (!existing) inflight.set(workKey, work);
  try {
    const raced = await withTimeout(work, overallMs);
    if (raced) return raced;
    const hotelId = givenId || "";
    if (hotelId) {
      const extrasHoldValue: PhaseBResult | null = extrasHold
        ? await withTimeout<PhaseBResult>(extrasHold, 12000)
        : null;
      const extrasBase = extrasHoldValue || (await runBookingPhaseB(hotelId, input));
      const datedRoomsKey = [
        "rooms",
        hotelId,
        toIsoDate(input.checkIn),
        toIsoDate(input.checkOut),
        String(input.adults || 2),
        String(input.roomQty || 1),
        roomsLanguage(input.lang),
      ].join("-");
      const roomsPayload =
        (await readBookingCache<unknown>(datedRoomsKey, BOOKING_ROOMS_TTL_MS)) ||
        (await loadCachedRoomsPayload(hotelId));
      const nights = stayNights(input.checkIn, input.checkOut);
      const rooms = roomsPayload
        ? assignUniqueRoomPhotos(
            parseRoomsPayload(roomsPayload, input.adults || 2, nights, {
              fallbackNightly: input.fallbackNightly,
              hotelPhotos: input.hotelPhotos,
              checkIn: input.checkIn,
            }),
            input.hotelPhotos || []
          )
        : [];
      const extras = applyRoomDerivedExtras(extrasBase, rooms, roomsPayload);
      return {
        ...emptyResult(host, null, null, {
          path: "timeout-partial",
          bodySnippet: "Returned cached rooms and extras after detail budget",
        }),
        rooms,
        bookingHotelId: hotelId,
        photos: input.hotelPhotos || [],
        facilities: extras.facilities,
        reviews: extras.reviews,
        policies: extras.policies,
        nearbyPlaces: extras.nearbyPlaces,
        description: extras.description,
        questions: extras.questions,
        reviewScores: extras.reviewScores,
        facilityGroups: extras.facilityGroups,
        childrenPolicy: extras.childrenPolicy,
        payment: extras.payment,
        hotelMeta: extras.hotelMeta,
      };
    }
    return emptyResult(host, null, null, {
      path: "timeout",
      bodySnippet: givenId
        ? "Booking detail timed out"
        : "rooms fetch capped at 8s — Travel Advisor fallback",
    });
  } finally {
    void work.finally(() => inflight.delete(workKey));
  }
}
