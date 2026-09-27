/**
 * Hotelbeds APItude adapter.
 *
 *  - Booking API   : /hotels (availability), /checkrates, /bookings
 *  - Content API   : /hotels?codes=…, /hotels/{code}/details
 *
 * Rules implemented here (from the APItude docs):
 *  - destination.code is a Hotelbeds destination code (NOT an airport IATA) — resolved via
 *    Content API `/locations/destinations`; when unknown we search by geolocation.
 *  - `filter.maxHotels` (≤ 2000) and `filter.maxRatesPerRoom` control result size.
 *  - Every rate in every room is mapped (rateKey, rateType BOOKABLE/RECHECK, board,
 *    cancellation policies, payment type, promotions, allotment).
 *  - RECHECK rates must go through /checkrates before booking (see quote()).
 */

import fs from "fs/promises";
import path from "path";
import { hotelbedsRequest, hotelbedsContentRequest } from "./hotelbedsClient";
import type {
  CancellationPolicyRule,
  HotelSearchCard,
  RatePlan,
  RoomGroup,
} from "../common/types";
import type { HotelContent, HotelContentImage } from "@/lib/server/hotels/content-types";
import { getCachedContentMany, putCachedContent, getCachedContent } from "@/lib/server/hotels/content-cache";
import {
  cleanText,
  deriveCancellation,
  httpsOnly,
  nightsBetween,
  normalizeBoard,
  publicHotelId,
  round2,
  toNumber,
} from "@/lib/server/hotels/normalize";
import { recordSupplierCall } from "@/lib/server/hotels/telemetry";

export interface HotelbedsOccupancy {
  rooms: number;
  adults: number;
  children: number;
  paxes?: Array<{ type: "AD" | "CH"; age: number }>;
}

export interface HotelbedsSearchParams {
  /** Hotelbeds destination code (e.g. ANT, IST, PAR). */
  destinationCode?: string;
  /** Geo search when destination code is unknown. */
  geo?: { latitude: number; longitude: number; radiusKm: number };
  /** Direct hotel codes (≤ 2000). */
  hotelCodes?: number[];
  checkIn: string;
  checkOut: string;
  occupancies?: HotelbedsOccupancy[];
  /** Legacy shape kept for callers that only know adults/rooms. */
  adults?: number;
  rooms?: number;
  childrenAges?: number[];
  currency?: string;
  language?: string;
  maxHotels?: number;
  maxRatesPerRoom?: number;
  /** Only return hotels whose (Hotelbeds) content is already cached. Used for progressive loading. */
  signal?: AbortSignal;
  timeoutMs?: number;
}

export const HOTELBEDS_IMAGE_BASE = "https://photos.hotelbeds.com/giata/bigger/";

const IMAGE_CATEGORY: Record<string, string> = {
  GEN: "exterior",
  HAB: "room",
  COM: "lobby",
  RES: "restaurant",
  PIS: "pool",
  DEP: "sports",
  PLA: "beach",
  BAR: "bar",
  CON: "conference",
  TER: "terrace",
  SPA: "spa",
};

const FACILITY_GROUP: Record<number, string> = {
  10: "الموقع",
  20: "نوع الإقامة",
  30: "الوجبات",
  40: "الرياضة والترفيه",
  60: "مرافق الغرفة",
  61: "مرافق الغرفة",
  62: "مرافق الغرفة",
  70: "مرافق الفندق",
  71: "مرافق الفندق",
  72: "مرافق الفندق",
  73: "خدمات الأعمال",
  74: "الترفيه",
  75: "الصحة واللياقة",
  80: "طرق الدفع",
  85: "معالم قريبة",
  90: "المسافات",
  91: "نقاط الاهتمام",
};

/* ------------------------------------------------------------------------------------------------
 * Facilities dictionary. `GET /hotels?fields=all` returns facility CODES only; names live in
 * `GET /types/facilities` (≈600 entries) and `GET /types/facilitygroups`. Cached on disk for 30 days.
 * ---------------------------------------------------------------------------------------------- */
export interface HotelbedsFacilityDictionary {
  /** key `${facilityGroupCode}-${facilityCode}` → name */
  facilities: Record<string, string>;
  /** facilityGroupCode → group name */
  groups: Record<string, string>;
  language: string;
  fetchedAt: string;
}

const FACILITY_DICT_FILE = (language: string) => path.join(process.cwd(), ".data", "hotels", `hotelbeds-facilities-${language}.json`);
const FACILITY_DICT_TTL_MS = 30 * 24 * 3600 * 1000;
const facilityDictMemory = new Map<string, HotelbedsFacilityDictionary>();
const facilityDictInflight = new Map<string, Promise<HotelbedsFacilityDictionary | null>>();

export async function ensureFacilityDictionary(language = "ENG"): Promise<HotelbedsFacilityDictionary | null> {
  const mem = facilityDictMemory.get(language);
  if (mem) return mem;
  try {
    const raw = await fs.readFile(FACILITY_DICT_FILE(language), "utf8");
    const parsed = JSON.parse(raw) as HotelbedsFacilityDictionary;
    if (parsed?.facilities && Date.now() - new Date(parsed.fetchedAt).getTime() < FACILITY_DICT_TTL_MS) {
      facilityDictMemory.set(language, parsed);
      return parsed;
    }
  } catch {
    /* not cached yet */
  }
  const inflight = facilityDictInflight.get(language);
  if (inflight) return inflight;
  const job = (async () => {
    const started = Date.now();
    const dict: HotelbedsFacilityDictionary = { facilities: {}, groups: {}, language, fetchedAt: new Date().toISOString() };
    let ok = true;
    for (let from = 1; from <= 2001; from += 1000) {
      const res = await hotelbedsContentRequest<any>(`/types/facilities?fields=all&language=${language}&from=${from}&to=${from + 999}`, { timeoutMs: 20_000 });
      if (!res.ok) {
        ok = false;
        break;
      }
      const list: any[] = Array.isArray(res.data?.facilities) ? res.data.facilities : [];
      for (const f of list) {
        const name = cleanText(f?.description?.content);
        if (name && f.code != null && f.facilityGroupCode != null) dict.facilities[`${f.facilityGroupCode}-${f.code}`] = name;
      }
      if (list.length < 1000 || toNumber(res.data?.total) <= from + 999) break;
    }
    const groups = await hotelbedsContentRequest<any>(`/types/facilitygroups?fields=all&language=${language}&from=1&to=100`, { timeoutMs: 15_000 });
    for (const g of Array.isArray(groups.data?.facilityGroups) ? groups.data.facilityGroups : []) {
      const name = cleanText(g?.description?.content);
      if (name && g.code != null) dict.groups[String(g.code)] = name;
    }
    recordSupplierCall({ supplier: "hotelbeds", kind: "content", ok, latencyMs: Date.now() - started, count: Object.keys(dict.facilities).length, meta: { op: "facilities-dictionary", language } });
    if (!ok || !Object.keys(dict.facilities).length) return null;
    facilityDictMemory.set(language, dict);
    try {
      await fs.mkdir(path.dirname(FACILITY_DICT_FILE(language)), { recursive: true });
      await fs.writeFile(FACILITY_DICT_FILE(language), JSON.stringify(dict), { mode: 0o600 });
    } catch {
      /* best effort */
    }
    return dict;
  })().finally(() => facilityDictInflight.delete(language));
  facilityDictInflight.set(language, job);
  return job;
}

/* ------------------------------------------------------------------------------------------------
 * Room-type dictionary (`/types/rooms`, ≈15k codes such as "DBL.DX-QN" → "DOUBLE DELUXE QUEEN").
 * Too large to fetch inline during a search, so it is built in the background (≈16 requests) and
 * served from disk afterwards. Until it exists, room names fall back to the availability response.
 * ---------------------------------------------------------------------------------------------- */
export interface HotelbedsRoomDictionary {
  rooms: Record<string, { name: string; type?: string; characteristic?: string }>;
  language: string;
  fetchedAt: string;
}
const ROOM_DICT_FILE = (language: string) => path.join(process.cwd(), ".data", "hotels", `hotelbeds-rooms-${language}.json`);
const roomDictMemory = new Map<string, HotelbedsRoomDictionary>();
const roomDictInflight = new Map<string, Promise<HotelbedsRoomDictionary | null>>();

async function readRoomDictionary(language: string): Promise<HotelbedsRoomDictionary | null> {
  const mem = roomDictMemory.get(language);
  if (mem) return mem;
  try {
    const parsed = JSON.parse(await fs.readFile(ROOM_DICT_FILE(language), "utf8")) as HotelbedsRoomDictionary;
    if (parsed?.rooms && Date.now() - new Date(parsed.fetchedAt).getTime() < FACILITY_DICT_TTL_MS) {
      roomDictMemory.set(language, parsed);
      return parsed;
    }
  } catch {
    /* not cached */
  }
  return null;
}

/** Downloads the full room-type dictionary. Intended for the content worker / first run. */
export async function buildRoomDictionary(language = "ENG"): Promise<HotelbedsRoomDictionary | null> {
  const inflight = roomDictInflight.get(language);
  if (inflight) return inflight;
  const job = (async () => {
    const started = Date.now();
    const dict: HotelbedsRoomDictionary = { rooms: {}, language, fetchedAt: new Date().toISOString() };
    let ok = true;
    let total = Infinity;
    for (let from = 1; from <= total && from <= 40_001; from += 1000) {
      const res = await hotelbedsContentRequest<any>(`/types/rooms?fields=all&language=${language}&from=${from}&to=${from + 999}`, { timeoutMs: 25_000 });
      if (!res.ok) {
        ok = false;
        break;
      }
      total = toNumber(res.data?.total, 0) || total;
      for (const r of Array.isArray(res.data?.rooms) ? res.data.rooms : []) {
        const name = cleanText(r?.description) || [cleanText(r?.typeDescription?.content), cleanText(r?.characteristicDescription?.content)].filter(Boolean).join(" ");
        if (r?.code && name) dict.rooms[String(r.code)] = { name, type: cleanText(r.typeDescription?.content), characteristic: cleanText(r.characteristicDescription?.content) };
      }
    }
    recordSupplierCall({ supplier: "hotelbeds", kind: "content", ok, latencyMs: Date.now() - started, count: Object.keys(dict.rooms).length, meta: { op: "rooms-dictionary", language } });
    if (!ok || !Object.keys(dict.rooms).length) return null;
    roomDictMemory.set(language, dict);
    try {
      await fs.mkdir(path.dirname(ROOM_DICT_FILE(language)), { recursive: true });
      await fs.writeFile(ROOM_DICT_FILE(language), JSON.stringify(dict), { mode: 0o600 });
    } catch {
      /* best effort */
    }
    return dict;
  })().finally(() => roomDictInflight.delete(language));
  roomDictInflight.set(language, job);
  return job;
}

/**
 * Returns the cached room dictionary; when missing, kicks off a background build (unless `waitForBuild`)
 * and returns null so searches are never blocked on it.
 */
export async function ensureRoomDictionary(language = "ENG", opts: { waitForBuild?: boolean } = {}): Promise<HotelbedsRoomDictionary | null> {
  const cached = await readRoomDictionary(language);
  if (cached) return cached;
  if (opts.waitForBuild) return buildRoomDictionary(language);
  if (!roomDictInflight.has(language)) void buildRoomDictionary(language).catch(() => null);
  return null;
}

/** Facility codes that carry check-in / check-out hours (group 70). */
const CHECK_IN_CODES = new Set([260, 261]);
const CHECK_OUT_CODES = new Set([390, 391]);

/**
 * Hotelbeds category codes → star count. Codes look like `4EST` (4 stars), `H4_5` (4.5 stars, official
 * "half star" categories), `3LL` (keys, apartments), `SUP`/`AG`/`BOU`… (no star rating → undefined).
 * Never concatenate the digits: `H4_5` must not become 45.
 */
export function hotelbedsStars(categoryCode: unknown): number | undefined {
  const code = String(categoryCode || "").trim().toUpperCase();
  if (!code) return undefined;
  const half = code.match(/^H(\d)_5$/);
  if (half) return Number(half[1]) + 0.5;
  const lead = code.match(/^(\d)(EST|LL|LUX|STAR|S)?$/) || code.match(/^(\d)[A-Z]*$/);
  if (lead) {
    const n = Number(lead[1]);
    return n >= 1 && n <= 5 ? n : undefined;
  }
  return undefined;
}

function facilityName(f: any, dict: HotelbedsFacilityDictionary | null): string | undefined {
  return cleanText(f?.description?.content) || dict?.facilities[`${f?.facilityGroupCode}-${f?.facilityCode}`];
}

function facilityLabel(f: any, name: string): string {
  // Numeric facilities ("Number of restaurants: 3", "Room size 32 m²", "Distance to beach 200 m").
  if (f.number != null && f.indLogic !== true) {
    if (f.distance != null) return `${name}: ${f.distance} m`;
    return `${name}: ${f.number}`;
  }
  if (f.distance != null) return `${name}: ${f.distance} m`;
  if (f.timeFrom || f.timeTo) return `${name}: ${[f.timeFrom, f.timeTo].filter(Boolean).map((t: string) => String(t).slice(0, 5)).join(" – ")}`;
  return name;
}

function buildOccupancies(p: HotelbedsSearchParams): HotelbedsOccupancy[] {
  if (Array.isArray(p.occupancies) && p.occupancies.length) return p.occupancies;
  const rooms = Math.max(1, Number(p.rooms || 1));
  const adults = Math.max(1, Number(p.adults || 2));
  const ages = Array.isArray(p.childrenAges) ? p.childrenAges.filter((a) => Number.isFinite(a)) : [];
  return [
    {
      rooms,
      adults,
      children: ages.length,
      paxes: ages.length
        ? [
            ...Array.from({ length: adults }).map(() => ({ type: "AD" as const, age: 30 })),
            ...ages.map((age) => ({ type: "CH" as const, age })),
          ]
        : undefined,
    },
  ];
}

function mapCancellation(rate: any, currency: string): CancellationPolicyRule[] {
  const list: any[] = Array.isArray(rate?.cancellationPolicies) ? rate.cancellationPolicies : [];
  return list
    .map((c) => ({
      from: String(c.from || ""),
      amount: toNumber(c.amount),
      currency: String(c.currency || currency),
      description: cleanText(c.description),
    }))
    .filter((c) => c.from);
}

function paymentTypeOf(rate: any): RatePlan["paymentType"] {
  const p = String(rate?.paymentType || "").toUpperCase();
  if (p === "AT_HOTEL") return "pay_at_hotel";
  return "prepay";
}

/** Maps one Hotelbeds availability hotel to unified RoomGroups. */
/* ------------------------------------------------------------------------------------------------
 * TripAdvisor review-score cache (`.data/hotels/hotelbeds-reviews.json`), refreshed weekly per scope.
 * ---------------------------------------------------------------------------------------------- */
interface ReviewCacheFile {
  scopes: Record<string, string>;
  hotels: Record<string, { score: NonNullable<HotelSearchCard["reviewScore"]>; at: string }>;
}
const REVIEW_CACHE_FILE = path.join(process.cwd(), ".data", "hotels", "hotelbeds-reviews.json");
const REVIEW_TTL_MS = 7 * 24 * 3600 * 1000;
let reviewCacheMemory: ReviewCacheFile | null = null;
let reviewCacheLoadedAt = 0;

async function readReviewCache(): Promise<ReviewCacheFile> {
  if (reviewCacheMemory && Date.now() - reviewCacheLoadedAt < 60_000) return reviewCacheMemory;
  try {
    reviewCacheMemory = JSON.parse(await fs.readFile(REVIEW_CACHE_FILE, "utf8")) as ReviewCacheFile;
  } catch {
    reviewCacheMemory = { scopes: {}, hotels: {} };
  }
  if (!reviewCacheMemory.scopes) reviewCacheMemory.scopes = {};
  if (!reviewCacheMemory.hotels) reviewCacheMemory.hotels = {};
  reviewCacheLoadedAt = Date.now();
  return reviewCacheMemory;
}

async function reviewsScopeStale(scope: string): Promise<boolean> {
  const cache = await readReviewCache();
  const at = cache.scopes[scope];
  return !at || Date.now() - Date.parse(at) > REVIEW_TTL_MS;
}

async function storeReviewScores(scope: string, hotels: any[]): Promise<void> {
  const cache = await readReviewCache();
  cache.scopes[scope] = new Date().toISOString();
  for (const h of hotels) {
    const score = hotelbedsReviewScore(h);
    if (score && h?.code != null) cache.hotels[String(h.code)] = { score, at: cache.scopes[scope] };
  }
  reviewCacheMemory = cache;
  try {
    await fs.mkdir(path.dirname(REVIEW_CACHE_FILE), { recursive: true });
    await fs.writeFile(REVIEW_CACHE_FILE, JSON.stringify(cache), { mode: 0o600 });
  } catch {
    /* best effort */
  }
}

/** Cached TripAdvisor score for a Hotelbeds hotel code (details path). */
export async function cachedHotelbedsReviewScore(code: string): Promise<HotelSearchCard["reviewScore"] | undefined> {
  const cache = await readReviewCache();
  return cache.hotels[String(code)]?.score;
}

/** Availability response `hotel.reviews[]` carries the TripAdvisor score (rate 0–5, reviewCount). */
export function hotelbedsReviewScore(hotel: any): HotelSearchCard["reviewScore"] | undefined {
  const reviews: any[] = Array.isArray(hotel?.reviews) ? hotel.reviews : [];
  const ta = reviews.find((r) => /tripadvisor/i.test(String(r?.type || ""))) || reviews[0];
  const rate = ta ? toNumber(ta.rate) : 0;
  if (!ta || !(rate > 0)) return undefined;
  return { source: String(ta.type || "TRIPADVISOR").toLowerCase(), score: round2(rate), scale: 5, count: ta.reviewCount != null ? toNumber(ta.reviewCount) : undefined };
}

function roomImagesForCode(images: HotelContent["images"] | undefined, roomCode: string): string[] {
  const code = String(roomCode || "").trim();
  if (!code || !images?.length) return [];
  const exact = images.filter((img) => img.roomCode && img.roomCode === code).map((i) => i.url);
  if (exact.length) return exact;
  return images
    .filter((img) => img.roomCode && (code.startsWith(img.roomCode) || img.roomCode.startsWith(code)))
    .map((i) => i.url);
}

export function mapHotelbedsRooms(hotel: any, currency: string, nights: number, content?: HotelContent | null): RoomGroup[] {
  const rooms: any[] = Array.isArray(hotel?.rooms) ? hotel.rooms : [];
  const groups: RoomGroup[] = [];
  const hotelCode = String(hotel?.code || "");
  for (const r of rooms) {
    const roomCode = String(r.code || "");
    const contentRoom = content?.rooms.find((cr) => cr.code === roomCode);
    const roomImages = content ? roomImagesForCode(content.images, roomCode) : [];
    const groupId = `hb:${hotelCode}:${roomCode}`;
    const ratePlans: RatePlan[] = [];
    const rates: any[] = Array.isArray(r.rates) ? r.rates : [];
    for (const rate of rates) {
      const rateKey = String(rate.rateKey || "");
      if (!rateKey) continue;
      const rateCurrency = String(hotel?.currency || currency);
      const net = toNumber(rate.net);
      const selling = rate.sellingRate != null ? toNumber(rate.sellingRate) : net;
      const policies = mapCancellation(rate, rateCurrency);
      const rateClass = String(rate.rateClass || "").toUpperCase();
      const isNrf = rateClass === "NRF" || rateClass === "NR";
      const cancel = deriveCancellation(policies, Date.now(), isNrf, selling);
      const refundable = cancel.refundable;
      const promotions = Array.isArray(rate.promotions)
        ? rate.promotions.map((p: any) => cleanText(p.name || p.remark)).filter(Boolean)
        : [];
      ratePlans.push({
        id: `hb:${rateKey.slice(0, 48)}:${ratePlans.length}`,
        supplier: "hotelbeds",
        roomGroupId: groupId,
        supplierToken: rateKey,
        supplierContext: { hotelCode, roomCode, rateClass },
        board: normalizeBoard(rate.boardCode || rate.boardName),
        boardName: cleanText(rate.boardName),
        refundable,
        cancellationType: cancel.cancellationType,
        freeCancellationUntil: cancel.freeCancellationUntil,
        currentPenalty: cancel.currentPenalty,
        cancellationPolicies: policies,
        paymentType: paymentTypeOf(rate),
        price: {
          net: round2(net),
          selling: round2(selling),
          currency: rateCurrency,
          taxesIncluded: !(Array.isArray(rate.taxes?.taxes) && rate.taxes.taxes.some((t: any) => t.included === false)),
          taxes: Array.isArray(rate.taxes?.taxes)
            ? round2(rate.taxes.taxes.reduce((s: number, t: any) => s + toNumber(t.amount), 0))
            : undefined,
          perNight: round2(selling / Math.max(1, nights)),
          total: round2(selling),
        },
        rateType: String(rate.rateType || "BOOKABLE").toUpperCase() === "RECHECK" ? "RECHECK" : "BOOKABLE",
        promotions: promotions.length ? (promotions as string[]) : undefined,
        remainingRooms: rate.allotment != null ? toNumber(rate.allotment) : undefined,
        occupancy: { adults: toNumber(rate.adults, 2), children: toNumber(rate.children, 0), rooms: toNumber(rate.rooms, 1) },
        rateComments: cleanText(rate.rateComments),
      });
    }
    if (!ratePlans.length) continue;
    groups.push({
      id: groupId,
      supplier: "hotelbeds",
      supplierRoomCode: roomCode,
      name: cleanText(r.name) || contentRoom?.name || roomCode,
      description: contentRoom?.description,
      images: roomImages,
      sizeSqm: contentRoom?.sizeSqm,
      beds: contentRoom?.beds,
      maxOccupancy: contentRoom?.maxPax,
      amenities: contentRoom?.facilities || [],
      ratePlans: ratePlans.sort((a, b) => a.price.total - b.price.total),
    });
  }
  return groups.sort((a, b) => (a.ratePlans[0]?.price.total || 0) - (b.ratePlans[0]?.price.total || 0));
}

/** Maps a Content API hotel object (list or details) to HotelContent. */
export function mapHotelbedsContent(
  h: any,
  language = "ENG",
  dict: HotelbedsFacilityDictionary | null = null,
  roomDict: HotelbedsRoomDictionary | null = null
): HotelContent {
  const images: HotelContentImage[] = (Array.isArray(h.images) ? h.images : [])
    .filter((img: any) => img?.path)
    .sort((a: any, b: any) => toNumber(a.visualOrder ?? a.order, 999) - toNumber(b.visualOrder ?? b.order, 999))
    .map((img: any, idx: number) => ({
      url: `${HOTELBEDS_IMAGE_BASE}${img.path}`,
      roomCode: img.roomCode ? String(img.roomCode) : undefined,
      category: IMAGE_CATEGORY[String(img.imageTypeCode || img.type?.code || "")] || "other",
      order: idx,
    }));

  let checkInTime: string | undefined;
  let checkOutTime: string | undefined;
  const policyLines: string[] = [];
  const facilities: HotelContent["facilities"] = [];
  for (const f of Array.isArray(h.facilities) ? h.facilities : []) {
    if (!f || f.indYesOrNo === false) continue;
    const groupCode = toNumber(f.facilityGroupCode);
    const code = toNumber(f.facilityCode);
    if (groupCode === 70 && CHECK_IN_CODES.has(code)) {
      checkInTime = checkInTime || cleanText(f.timeFrom)?.slice(0, 5);
      continue;
    }
    if (groupCode === 70 && CHECK_OUT_CODES.has(code)) {
      checkOutTime = checkOutTime || cleanText(f.timeTo || f.timeFrom)?.slice(0, 5);
      continue;
    }
    const name = facilityName(f, dict);
    if (!name) continue;
    // Groups 10 (location codes), 20 (hotel type), 61/62 (room distribution), 100 (areas of interest)
    // are classification codes, not amenities.
    if ([10, 20, 61, 62, 100].includes(groupCode)) continue;
    facilities.push({
      group: dict?.groups[String(groupCode)] || FACILITY_GROUP[groupCode] || "مرافق الفندق",
      name: facilityLabel(f, name),
      code: `${f.facilityGroupCode}-${f.facilityCode}`,
      fee: f.indFee === true ? true : undefined,
    });
  }

  const rooms = (Array.isArray(h.rooms) ? h.rooms : []).map((r: any) => {
    const roomFacilities: any[] = Array.isArray(r.roomFacilities) ? r.roomFacilities : [];
    const named = roomFacilities
      .filter((f) => f && f.indYesOrNo !== false)
      .map((f) => ({ f, name: facilityName(f, dict) || "" }))
      .filter((x) => x.name);
    const sizeFacility = named.find(({ f, name }) => /size|m2|m²|square|surface/i.test(name) && f.number);
    const beds = named
      .filter(({ f, name }) => /bed/i.test(name) && !/bedroom/i.test(name) && f.number)
      .map(({ f, name }) => `${f.number}× ${name}`)
      .join(", ");
    const roomCode = String(r.roomCode || "");
    const dictEntry = roomDict?.rooms[roomCode];
    const roomName =
      cleanText(r.description) ||
      cleanText(r.type?.description?.content) ||
      dictEntry?.name ||
      [cleanText(r.roomType), cleanText(r.characteristicCode)].filter(Boolean).join(" ") ||
      roomCode;
    return {
      code: roomCode,
      name: roomName,
      description: cleanText(r.characteristic?.description?.content) !== roomName ? cleanText(r.characteristic?.description?.content) : undefined,
      images: roomImagesForCode(images, roomCode),
      sizeSqm: sizeFacility ? toNumber(sizeFacility.f.number) || undefined : undefined,
      beds: beds || undefined,
      maxAdults: r.maxAdults != null ? toNumber(r.maxAdults) : undefined,
      maxChildren: r.maxChildren != null ? toNumber(r.maxChildren) : undefined,
      maxPax: r.maxPax != null ? toNumber(r.maxPax) : undefined,
      facilities: named.filter(({ f }) => !/size|m2|m²|square|surface/i.test(facilityName(f, dict) || "")).map(({ f, name }) => facilityLabel(f, name)),
    };
  });

  const pois = (Array.isArray(h.interestPoints) ? h.interestPoints : [])
    .filter((p: any) => p?.poiName)
    .map((p: any) => ({
      name: String(p.poiName),
      distanceM: p.distance != null ? toNumber(p.distance) : undefined,
    }));

  const phones: any[] = Array.isArray(h.phones) ? h.phones : [];
  const stars = hotelbedsStars(h.categoryCode);
  for (const issue of Array.isArray(h.issues) ? h.issues : []) {
    const line = cleanText(issue?.issue?.content ?? issue?.description?.content ?? issue?.issue ?? issue?.description);
    if (line) policyLines.push(line);
  }

  return {
    supplier: "hotelbeds",
    supplierHotelId: String(h.code),
    name: cleanText(h.name?.content ?? h.name) || `Hotel ${h.code}`,
    description: cleanText(h.description?.content ?? h.description),
    address: cleanText(h.address?.content ?? h.address),
    city: cleanText(h.city?.content ?? h.city),
    countryCode: cleanText(h.countryCode),
    postalCode: cleanText(h.postalCode),
    lat: h.coordinates?.latitude != null ? toNumber(h.coordinates.latitude) : undefined,
    lng: h.coordinates?.longitude != null ? toNumber(h.coordinates.longitude) : undefined,
    stars,
    chain: cleanText(h.chainCode),
    giataCode: h.giataCode != null ? String(h.giataCode) : undefined,
    phone: phones[0]?.phoneNumber ? String(phones[0].phoneNumber) : undefined,
    email: cleanText(h.email),
    website: cleanText(h.web),
    images,
    facilities,
    rooms,
    pois,
    checkInTime,
    checkOutTime,
    policies: policyLines.length ? Array.from(new Set(policyLines)) : undefined,
    language,
    fetchedAt: new Date().toISOString(),
  };
}

export class HotelbedsHotelAdapter {
  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    const res = await hotelbedsRequest<any>("/status", { timeoutMs: 8000 });
    const latencyMs = Date.now() - started;
    recordSupplierCall({ supplier: "hotelbeds", kind: "test", ok: res.ok, latencyMs, error: res.error });
    if (!res.ok) throw new Error(res.error || "فشل الاتصال بخدمة Hotelbeds /status");
    return { ok: true, message: `تم مصادقة Hotelbeds بنجاح عبر توقيع SHA-256 ونقطة /status (${latencyMs}ms)`, latencyMs };
  }

  /**
   * Fetches static content for hotel codes (Content API list endpoint), using the disk cache first.
   * Up to 250 codes per request → a 2000-hotel destination costs ≤ 8 requests, then zero for 30 days.
   */
  async ensureContent(codes: string[], language = "ENG", opts: { maxRequests?: number; signal?: AbortSignal } = {}): Promise<Map<string, HotelContent>> {
    const unique = Array.from(new Set(codes.map(String).filter(Boolean)));
    const cached = await getCachedContentMany("hotelbeds", unique);
    const missing = unique.filter((c) => !cached.has(c));
    const chunk = 250;
    const maxRequests = opts.maxRequests ?? 8;
    let requests = 0;
    const dict = missing.length ? await ensureFacilityDictionary(language) : null;
    const roomDict = missing.length ? await ensureRoomDictionary(language) : null;
    for (let i = 0; i < missing.length && requests < maxRequests; i += chunk) {
      if (opts.signal?.aborted) break;
      const batch = missing.slice(i, i + chunk);
      const started = Date.now();
      const res = await hotelbedsContentRequest<any>(
        `/hotels?codes=${batch.join(",")}&language=${language}&fields=all&useSecondaryLanguage=false&from=1&to=${batch.length}`,
        { timeoutMs: 15_000 }
      );
      requests += 1;
      recordSupplierCall({
        supplier: "hotelbeds",
        kind: "content",
        ok: res.ok,
        latencyMs: Date.now() - started,
        count: Array.isArray(res.data?.hotels) ? res.data.hotels.length : 0,
        error: res.error,
        meta: { op: "hotels-content", batch: batch.length },
      });
      if (!res.ok) break;
      for (const item of res.data?.hotels || []) {
        const content = mapHotelbedsContent(item, language, dict, roomDict);
        cached.set(content.supplierHotelId, content);
        void putCachedContent(content);
      }
    }
    return cached;
  }

  async getContent(code: string, language = "ENG"): Promise<HotelContent | null> {
    const clean = String(code).replace(/^hb_/, "");
    const hit = await getCachedContent("hotelbeds", clean);
    if (hit && hit.rooms.length) return hit;
    const started = Date.now();
    const res = await hotelbedsContentRequest<any>(
      `/hotels/${clean}/details?language=${language}&useSecondaryLanguage=false`,
      { timeoutMs: 10_000 }
    );
    recordSupplierCall({ supplier: "hotelbeds", kind: "content", ok: res.ok, latencyMs: Date.now() - started, error: res.error, meta: { op: "hotel-details", code: clean } });
    if (!res.ok || !res.data?.hotel) return hit;
    const content = mapHotelbedsContent(res.data.hotel, language, await ensureFacilityDictionary(language), await ensureRoomDictionary(language));
    void putCachedContent(content);
    return content;
  }

  /**
   * Availability search — returns one card per hotel with ALL room groups & rate plans.
   */
  async searchHotels(params: HotelbedsSearchParams): Promise<HotelSearchCard[]> {
    const occupancies = buildOccupancies(params);
    const nights = nightsBetween(params.checkIn, params.checkOut);
    const body: Record<string, unknown> = {
      stay: { checkIn: params.checkIn, checkOut: params.checkOut },
      occupancies: occupancies.map((o) => ({
        rooms: o.rooms,
        adults: o.adults,
        children: o.children,
        ...(o.paxes ? { paxes: o.paxes } : {}),
      })),
      filter: {
        maxHotels: Math.min(2000, Math.max(1, params.maxHotels || 2000)),
        maxRatesPerRoom: Math.min(50, Math.max(1, params.maxRatesPerRoom || 20)),
      },
      dailyRate: false,
      language: params.language || "ENG",
    };
    if (params.currency) body.currency = params.currency;

    if (Array.isArray(params.hotelCodes) && params.hotelCodes.length) {
      body.hotels = { hotel: params.hotelCodes.slice(0, 2000) };
    } else if (params.destinationCode) {
      body.destination = { code: params.destinationCode.toUpperCase() };
    } else if (params.geo) {
      body.geolocation = {
        latitude: params.geo.latitude,
        longitude: params.geo.longitude,
        radius: Math.min(200, Math.max(1, Math.round(params.geo.radiusKm))),
        unit: "km",
      };
    } else {
      throw new Error("Hotelbeds search requires destinationCode, geo or hotelCodes");
    }

    // TripAdvisor scores: Hotelbeds only returns `reviews[]` when the request carries a reviews filter,
    // and that filter drops hotels without reviews. So the scores are refreshed by a parallel
    // `maxRatesPerRoom: 1` call at most once per destination per week, and cached on disk.
    const reviewScopeKey = params.destinationCode ? `dest:${params.destinationCode.toUpperCase()}` : params.geo ? `geo:${params.geo.latitude.toFixed(2)},${params.geo.longitude.toFixed(2)},${Math.round(params.geo.radiusKm)}` : "";
    const reviewsPromise = reviewScopeKey && (await reviewsScopeStale(reviewScopeKey))
      ? hotelbedsRequest<any>("/hotels", {
          method: "POST",
          body: { ...body, filter: { maxHotels: 2000, maxRatesPerRoom: 1 }, reviews: [{ type: "TRIPADVISOR", maxRate: 5, minRate: 1, minReviewCount: 1 }] },
          timeoutMs: params.timeoutMs || 25_000,
          signal: params.signal,
        })
          .then((r) => {
            const list: any[] = r.ok ? r.data?.hotels?.hotels || [] : [];
            recordSupplierCall({ supplier: "hotelbeds", kind: "search", ok: r.ok, latencyMs: 0, count: list.length, error: r.error, meta: { op: "reviews-refresh", scope: reviewScopeKey } });
            if (r.ok) void storeReviewScores(reviewScopeKey, list);
          })
          .catch(() => undefined)
      : Promise.resolve();

    const res = await hotelbedsRequest<any>("/hotels", {
      method: "POST",
      body,
      timeoutMs: params.timeoutMs || 25_000,
      signal: params.signal,
    });
    if (!res.ok) throw new Error(res.error || "Hotelbeds availability failed");

    const rawHotels: any[] = res.data?.hotels?.hotels || [];
    if (!rawHotels.length) return [];
    await reviewsPromise;
    const reviewCache = await readReviewCache();

    // Static content for the returned hotels (photos, description, rooms, facilities, POIs).
    const contentMap = await this.ensureContent(rawHotels.map((h) => String(h.code)), params.language || "ENG", {
      signal: params.signal,
    });

    const cards: HotelSearchCard[] = [];
    for (const h of rawHotels) {
      const code = String(h.code || "");
      if (!code) continue;
      const currency = String(h.currency || params.currency || "EUR");
      const content = contentMap.get(code) || null;
      const roomGroups = mapHotelbedsRooms(h, currency, nights, content);
      const ratePlans = roomGroups.flatMap((g) => g.ratePlans);
      if (!ratePlans.length) continue;
      const cheapest = ratePlans.reduce((a, b) => (a.price.total <= b.price.total ? a : b));
      const images = httpsOnly(content?.images.map((i) => i.url) || []);
      const stars = hotelbedsStars(h.categoryCode) || content?.stars;
      const lat = h.latitude != null ? toNumber(h.latitude) : content?.lat;
      const lng = h.longitude != null ? toNumber(h.longitude) : content?.lng;
      cards.push({
        id: publicHotelId("hotelbeds", code),
        provider: "hotelbeds",
        supplierHotelId: code,
        name: cleanText(h.name) || content?.name || `Hotel ${code}`,
        city: cleanText(h.destinationName) || content?.city || "",
        countryCode: content?.countryCode,
        address: content?.address,
        lat: Number.isFinite(lat as number) ? (lat as number) : undefined,
        lng: Number.isFinite(lng as number) ? (lng as number) : undefined,
        stars: stars || undefined,
        reviewScore: hotelbedsReviewScore(h) || reviewCache.hotels[code]?.score || content?.reviewScore,
        giataCode: content?.giataCode,
        description: content?.description,
        amenities: content?.facilities.map((f) => f.name).slice(0, 40),
        image: images[0],
        images,
        heroImage: images[0],
        price: cheapest.price.total,
        currency: cheapest.price.currency,
        nights,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        roomGroups,
        ratePlans,
        rooms: roomGroups.map((g) => ({
          id: g.id,
          name: g.name,
          price: g.ratePlans[0]?.price.total,
          currency: g.ratePlans[0]?.price.currency,
          refundable: g.ratePlans[0]?.refundable,
          boardType: g.ratePlans[0]?.boardName,
        })),
        raw: { code: h.code, zoneName: h.zoneName, destinationCode: h.destinationCode, categoryName: h.categoryName },
      });
    }
    return cards;
  }

  /**
   * Live rates for one hotel + full content. Returns null when the hotel has no availability
   * and no content (never fabricates).
   */
  async getHotelDetails(
    hotelCode: string,
    checkIn: string,
    checkOut: string,
    adults = 2,
    opts: { rooms?: number; childrenAges?: number[]; currency?: string; language?: string } = {}
  ): Promise<{ card: HotelSearchCard | null; content: HotelContent | null }> {
    const cleanCode = String(hotelCode).replace(/^hb_/, "");
    const codeNum = parseInt(cleanCode, 10);
    if (!Number.isFinite(codeNum)) return { card: null, content: null };

    const [cards, content] = await Promise.all([
      this.searchHotels({
        hotelCodes: [codeNum],
        checkIn,
        checkOut,
        adults,
        rooms: opts.rooms,
        childrenAges: opts.childrenAges,
        currency: opts.currency,
        language: opts.language,
        maxRatesPerRoom: 50,
      }).catch((err) => {
        recordSupplierCall({ supplier: "hotelbeds", kind: "details", ok: false, latencyMs: 0, error: String(err), meta: { code: cleanCode } });
        return [] as HotelSearchCard[];
      }),
      this.getContent(cleanCode, opts.language || "ENG"),
    ]);

    const card = cards[0] || null;
    if (card && content) {
      // Enrich room groups now that detailed content (room descriptions/photos) is available.
      card.roomGroups = card.roomGroups.map((g) => {
        const cr = content.rooms.find((r) => r.code === g.supplierRoomCode);
        const imgs = roomImagesForCode(content.images, g.supplierRoomCode || "");
        return {
          ...g,
          description: cr?.description || g.description,
          images: imgs,
          sizeSqm: cr?.sizeSqm ?? g.sizeSqm,
          beds: cr?.beds ?? g.beds,
          maxOccupancy: cr?.maxPax ?? g.maxOccupancy,
          amenities: cr?.facilities?.length ? cr.facilities : g.amenities,
        };
      });
      card.description = content.description || card.description;
      card.address = content.address || card.address;
      card.images = httpsOnly(content.images.map((i) => i.url));
      card.image = card.images[0];
      card.heroImage = card.images[0];
      card.amenities = content.facilities.map((f) => f.name);
    }
    return { card, content };
  }

  /**
   * /checkrates — mandatory for RECHECK rates, recommended for all before booking.
   */
  async checkRates(rateKeys: string[]): Promise<{ ok: boolean; hotel: any | null; error?: string }> {
    const started = Date.now();
    const res = await hotelbedsRequest<any>("/checkrates", {
      method: "POST",
      body: { rooms: rateKeys.map((rateKey) => ({ rateKey })) },
      timeoutMs: 20_000,
    });
    recordSupplierCall({ supplier: "hotelbeds", kind: "quote", ok: res.ok, latencyMs: Date.now() - started, error: res.error });
    if (!res.ok) return { ok: false, hotel: null, error: res.error };
    return { ok: true, hotel: res.data?.hotel || null };
  }

  /** @deprecated use checkRates */
  async checkAvailability(rateKey: string): Promise<any> {
    const r = await this.checkRates([rateKey]);
    return r.hotel;
  }

  async createReservation(input: {
    rateKey: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail?: string;
    guestPhone?: string;
    clientReference: string;
    paxes?: Array<{ roomId: number; type: "AD" | "CH"; name: string; surname: string; age?: number }>;
    remark?: string;
    tolerance?: number;
  }): Promise<{ ok: boolean; bookingReference?: string; status?: string; total?: number; currency?: string; error?: string; raw?: any }> {
    const body = {
      holder: { name: input.guestFirstName || "Guest", surname: input.guestLastName || "Guest" },
      rooms: [
        {
          rateKey: input.rateKey,
          paxes: input.paxes?.length
            ? input.paxes
            : [{ roomId: 1, type: "AD", name: input.guestFirstName || "Guest", surname: input.guestLastName || "Guest" }],
        },
      ],
      clientReference: input.clientReference.slice(0, 20),
      remark: input.remark ? input.remark.slice(0, 200) : undefined,
      tolerance: typeof input.tolerance === "number" ? input.tolerance : 2,
    };
    const started = Date.now();
    const res = await hotelbedsRequest<any>("/bookings", { method: "POST", body, timeoutMs: 45_000 });
    recordSupplierCall({ supplier: "hotelbeds", kind: "book", ok: res.ok, latencyMs: Date.now() - started, error: res.error, meta: { clientReference: input.clientReference } });
    if (!res.ok) return { ok: false, error: res.error || "فشل إنشاء حجز Hotelbeds" };
    const booking = res.data?.booking;
    const ref = booking?.reference;
    if (!ref) return { ok: false, error: "Hotelbeds لم يعد مرجع حجز", raw: res.data };
    return {
      ok: true,
      bookingReference: String(ref),
      status: String(booking?.status || "CONFIRMED"),
      total: booking?.totalNet != null ? toNumber(booking.totalNet) : undefined,
      currency: booking?.currency,
      raw: booking,
    };
  }

  async getBooking(bookingReference: string): Promise<any | null> {
    const res = await hotelbedsRequest<any>(`/bookings/${encodeURIComponent(bookingReference)}`, { timeoutMs: 15_000 });
    return res.ok ? res.data?.booking || null : null;
  }

  async cancelReservation(bookingReference: string, simulate = false): Promise<{ ok: boolean; penalty?: number; currency?: string; error?: string }> {
    const started = Date.now();
    const res = await hotelbedsRequest<any>(
      `/bookings/${encodeURIComponent(bookingReference)}?cancellationFlag=${simulate ? "SIMULATION" : "CANCELLATION"}`,
      { method: "DELETE", timeoutMs: 30_000 }
    );
    recordSupplierCall({ supplier: "hotelbeds", kind: "cancel", ok: res.ok, latencyMs: Date.now() - started, error: res.error, meta: { simulate } });
    if (!res.ok) return { ok: false, error: res.error };
    const b = res.data?.booking;
    const penalty = b?.hotel?.rooms?.[0]?.rates?.[0]?.cancellationPolicies?.[0]?.amount;
    return { ok: true, penalty: penalty != null ? toNumber(penalty) : undefined, currency: b?.currency };
  }
}
