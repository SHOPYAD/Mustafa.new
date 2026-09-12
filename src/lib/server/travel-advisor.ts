import { promises as fs } from "fs";
import path from "path";
import { getServerEnv } from "@/lib/server/env-store";
import { directFetch } from "@/lib/server/direct-network";
import { isTravelAdvisorRuntimePathEnabled } from "@/lib/server/hotels-runtime-store";
import { recordRapidApiLiveCall } from "@/lib/server/rapidapi-quota-stats";
import {
  ISTANBUL_GEO_ID,
  TRAVEL_ADVISOR_HOST,
  normalizeHotelGeoId,
  type HotelProviderErrorCode,
} from "@/lib/hotels-config";
import {
  bestAvailableRateTitle,
  cheapestNightly,
  fallbackRoomsFromCompare,
  isGenericStandardRoomName,
  isGuestReviewText,
  isPartnerPriceDisclaimer,
  isRealRoomName,
  isUsableHotelDescription,
  partnerKey,
  toUsdNumber,
  withResolvedStay,
  type HotelOfferSource,
} from "@/lib/hotel-offers";
import {
  fullLocationText,
  HOTEL_PAGE_SIZE,
  nightsBetween,
  resolveStayPrices,
} from "@/lib/hotel-display";

const LIST_FETCH_SIZE = 30;
import { partnerLogoSrc } from "@/lib/partner-logos";
import { localizeHotelLabel, rapidApiLang } from "@/lib/hotel-i18n";
import { occupancyCacheKey, type HotelRoomStay } from "@/lib/hotel-search";
import type { Locale } from "@/lib/i18n/types";
import type {
  TravelAdvisorAppliedFilter,
  TravelAdvisorFilterGroup,
  TravelAdvisorFilterOption,
  TravelAdvisorHotelCard,
  TravelAdvisorHotelDetails,
  TravelAdvisorHotelPage,
  TravelAdvisorNearbyPlace,
  TravelAdvisorReview,
  TravelAdvisorRoom,
} from "@/types/travel-advisor";

export type {
  TravelAdvisorAppliedFilter,
  TravelAdvisorFilterGroup,
  TravelAdvisorHotelCard,
  TravelAdvisorHotelDetails,
  TravelAdvisorHotelPage,
};

/**
 * RapidAPI Travel Advisor hotel endpoints we wire (host: travel-advisor.p.rapidapi.com).
 *   POST /hotel-filters/v2/list
 *   POST /hotels/v2/list
 *   POST /hotels/v2/get-details       (contentId must be a string)
 *   POST /hotels/v2/get-photos        (404 on current plan — fail soft)
 *   POST /hotels/v2/get-offers        (detailId must be a number)
 *   GET  /hotels/list-by-latlng       (fallback if v1+v2 still have no prices)
 *   GET  /hotels/list-in-boundary     (fallback if latlng also empty)
 *   GET  /hotels/list                 (v1 price merge — empty on this plan for Istanbul)
 *   GET  /hotel-filters/list          (v1 filters fallback)
 *   GET  /hotels/get-details          (v1 details merge)
 *   GET  /hotels/photos               (v1 gallery fallback)
 *   GET  /locations/v2/auto-complete
 * /hotels/v2/get-reviews and /hotels/v2/get-hotels-offers are not on this plan.
 */

const PUBLIC_ERROR_COPY: Record<
  HotelProviderErrorCode,
  { error: string; status: 401 | 429 | 502 | 503 }
> = {
  not_configured: {
    error: "لا توجد نتائج لهذه التواريخ حالياً",
    status: 503,
  },
  invalid_key: {
    error: "لا توجد نتائج لهذه التواريخ حالياً",
    status: 401,
  },
  quota: {
    error: "لا توجد نتائج لهذه التواريخ حالياً",
    status: 503,
  },
  search_failed: {
    error: "تعذر تحميل النتائج، حاول مرة أخرى",
    status: 502,
  },
  engine_unavailable: {
    error: "محرك الفنادق الخاص غير متصل حالياً. تحقق من الخدمة في لوحة الإدارة.",
    status: 503,
  },
};

export class TravelAdvisorError extends Error {
  readonly errorCode: HotelProviderErrorCode;
  readonly httpStatus: number;

  constructor(errorCode: HotelProviderErrorCode, httpStatus?: number) {
    const copy = PUBLIC_ERROR_COPY[errorCode];
    super(copy.error);
    this.name = "TravelAdvisorError";
    this.errorCode = errorCode;
    this.httpStatus = httpStatus ?? copy.status;
  }
}

export function mapTravelAdvisorPublicError(e: unknown): {
  errorCode: HotelProviderErrorCode;
  error: string;
  status: 401 | 429 | 502 | 503;
} {
  if (e instanceof TravelAdvisorError) {
    const copy = PUBLIC_ERROR_COPY[e.errorCode];
    return { errorCode: e.errorCode, error: copy.error, status: copy.status };
  }
  if (e instanceof Error && /rapidapi key is not configured/i.test(e.message)) {
    return { errorCode: "not_configured", ...PUBLIC_ERROR_COPY.not_configured };
  }
  return { errorCode: "search_failed", ...PUBLIC_ERROR_COPY.search_failed };
}

function classifyRapidApiFailure(
  status: number,
  body: string
): HotelProviderErrorCode {
  if (status === 401 || status === 403) return "invalid_key";
  if (status === 429) return "quota";
  const lower = body.toLowerCase();
  if (/not subscribed|invalid.*key|forbidden|unauthorized/.test(lower)) {
    return "invalid_key";
  }
  if (/quota|rate limit|too many/.test(lower)) return "quota";
  return "search_failed";
}

const DEFAULT_LANG = "en_US";
const LIST_CACHE_TTL_MS = 8 * 60 * 1000;
const DETAIL_CACHE_TTL_MS = 10 * 60 * 1000;
let taUnsubscribedUntil = 0;

function markTravelAdvisorUnsubscribed() {
  taUnsubscribedUntil = Date.now() + 30 * 60 * 1000;
}

function isTravelAdvisorUnsubscribed() {
  return Date.now() < taUnsubscribedUntil;
}
const SHARED_STOCK_PHOTO =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945";

export type TravelAdvisorSearchInput = {
  query?: string;
  geoId?: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: HotelRoomStay[];
  filters?: TravelAdvisorAppliedFilter[];
  sort?: string;
  lang?: string;
  page?: number;
  applyRemoteFilters?: boolean;
};

type ListSession = {
  hotels: TravelAdvisorHotelCard[];
  totalCount: number;
  nextToken: string;
  nextOffset: number;
  nextV1Offset: number;
  nextLatlngOffset: number;
  extraCursor: number;
  exhausted: boolean;
};

const ISTANBUL_CENTER = { lat: 41.0082, lng: 28.9784 };

type TaRequestInit = {
  path: string;
  method?: "GET" | "POST";
  query?: Record<string, string>;
  body?: unknown;
  retryEmpty?: boolean;
  lang?: string;
  key?: string;
  triedKeys?: string[];
};

type CacheEntry<T> = { at: number; value: T };

const listCache = new Map<string, CacheEntry<ListSession>>();
const detailCache = new Map<string, CacheEntry<TravelAdvisorHotelDetails>>();
const filterCache = new Map<string, CacheEntry<TravelAdvisorFilterGroup[]>>();
const offersCache = new Map<string, CacheEntry<HotelOfferSource[]>>();
const inflight = new Map<string, Promise<unknown>>();

function cacheGet<T>(map: Map<string, CacheEntry<T>>, key: string, ttl: number): T | null {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttl) {
    map.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet<T>(map: Map<string, CacheEntry<T>>, key: string, value: T) {
  map.set(key, { at: Date.now(), value });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function walk(value: unknown, visit: (node: Record<string, unknown>) => void) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
    return;
  }
  const rec = asRecord(value);
  if (!rec) return;
  visit(rec);
  for (const child of Object.values(rec)) walk(child, visit);
}

function walkWithAncestors(
  value: unknown,
  visit: (node: Record<string, unknown>, ancestors: Record<string, unknown>[]) => void,
  ancestors: Record<string, unknown>[] = []
) {
  if (Array.isArray(value)) {
    for (const item of value) walkWithAncestors(item, visit, ancestors);
    return;
  }
  const rec = asRecord(value);
  if (!rec) return;
  visit(rec, ancestors);
  const next = [...ancestors, rec];
  for (const child of Object.values(rec)) walkWithAncestors(child, visit, next);
}

const OTHER_HOTEL_SECTION =
  /NearbyHotel|Sponsored|AdCard|SimilarHotel|AlsoViewed|RecommendationCarousel|AdsContainer/i;

function walkScoped(
  value: unknown,
  hotelId: string,
  visit: (node: Record<string, unknown>) => void
) {
  if (Array.isArray(value)) {
    for (const item of value) walkScoped(item, hotelId, visit);
    return;
  }
  const rec = asRecord(value);
  if (!rec) return;
  const type = String(rec.__typename || "");
  if (OTHER_HOTEL_SECTION.test(type)) return;
  const childId = hotelIdFrom(rec);
  if (childId && hotelId && childId !== hotelId && looksLikeHotelCard(rec)) return;
  visit(rec);
  for (const child of Object.values(rec)) walkScoped(child, hotelId, visit);
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    const rec = asRecord(value);
    if (rec) {
      const nested = pickString(
        rec.string,
        rec.text,
        rec.value,
        rec.name,
        rec.title,
        rec.url,
        rec.href,
        rec.urlTemplate,
        rec.htmlText,
        rec.htmlString
      );
      if (nested) return nested;
    }
  }
  return "";
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    const n = toUsdNumber(value);
    if (n != null) return n;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    const rec = asRecord(value);
    if (rec) {
      const nested = pickNumber(
        rec.rating,
        rec.ratingValue,
        rec.value,
        rec.count,
        rec.number,
        rec.amount,
        rec.numberReviews,
        rec.string,
        rec.text
      );
      if (nested) return nested;
    }
  }
  return 0;
}

function isSensibleGeo(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) > 0.2 &&
    Math.abs(lng) > 0.2 &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

function extractGeo(root: unknown): { lat: number; lng: number } {
  let preferred = { lat: 0, lng: 0 };
  let found = { lat: 0, lng: 0 };
  walk(root, (node) => {
    const type = String(node.__typename || "");
    const geo =
      asRecord(node.geoPoint) ||
      asRecord(node.coordinates) ||
      asRecord(node.geo) ||
      asRecord(node.anchor) ||
      node;
    const lat = Number(geo.latitude ?? geo.lat ?? node.latitude ?? node.lat);
    const lng = Number(geo.longitude ?? geo.lng ?? node.longitude ?? node.lng);
    if (!isSensibleGeo(lat, lng)) return;
    if (
      !isSensibleGeo(preferred.lat, preferred.lng) &&
      /GeoPoint|PoiAddress|PoiLocation|StaticMap|AnchorPin/i.test(type)
    ) {
      preferred = { lat, lng };
    }
    if (!isSensibleGeo(found.lat, found.lng)) found = { lat, lng };
  });
  return isSensibleGeo(preferred.lat, preferred.lng) ? preferred : found;
}

function resolveImageUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const url = trimmed
    .replace(/\$\{width\}/gi, "1200")
    .replace(/\$\{height\}/gi, "800")
    .replace(/\{width\}/gi, "1200")
    .replace(/\{height\}/gi, "800");
  if (!/^https?:\/\//i.test(url)) return "";
  const lower = url.toLowerCase();
  if (
    lower.includes(SHARED_STOCK_PHOTO) ||
    lower.includes("sprite") ||
    lower.includes("/icon") ||
    lower.includes("favicon") ||
    lower.includes("avatar") ||
    lower.includes("logo.") ||
    lower.includes("/logo") ||
    lower.includes("award-badge") ||
    lower.includes("travelers-choice-badge") ||
    lower.includes("placeholder")
  ) {
    return "";
  }
  if (
    lower.includes("tripadvisor") ||
    lower.includes("tacdn.com") ||
    lower.includes("cloudfront") ||
    lower.includes("media-cdn") ||
    /\.(jpe?g|png|webp)(\?|$)/i.test(url)
  ) {
    return url;
  }
  return "";
}

function imageDedupeKey(url: string): string {
  return url
    .split("?")[0]
    .toLowerCase()
    .replace(/\/photo-[a-z]\//, "/photo-o/");
}

function photoLocationId(node: Record<string, unknown>): string {
  const photo = asRecord(node.photo);
  const owner = asRecord(node.owner) || asRecord(node.location);
  return pickString(
    node.locationId,
    node.hotelId,
    asRecord(node.saveId)?.id,
    photo?.locationId,
    owner?.locationId,
    owner?.id
  );
}

function collectImages(root: unknown, limit = 40, hotelId = ""): string[] {
  const matched: string[] = [];
  const unlabeled: string[] = [];
  const seen = new Set<string>();
  const visitor = (node: Record<string, unknown>) => {
    if (matched.length >= limit) return;
    const ownerId = photoLocationId(node);
    if (hotelId && ownerId && ownerId !== hotelId) return;
    const sizes = asRecord(node.sizes);
    const photo = asRecord(node.photo);
    const image = asRecord(node.image);
    const dynamic =
      asRecord(node.photoSizeDynamic) ||
      asRecord(sizes) ||
      asRecord(photo?.sizes) ||
      asRecord(image?.sizes) ||
      asRecord(asRecord(photo)?.photoSizeDynamic);
    const candidates = [
      node.urlTemplate,
      dynamic?.urlTemplate,
      sizes?.urlTemplate,
      sizes?.url,
      node.url,
      node.src,
      node.photoUrl,
      node.imageUrl,
      node.publicUrl,
      node.original_size_url,
      photo?.url,
      photo?.urlTemplate,
      image?.url,
      image?.urlTemplate,
    ];
    for (const candidate of candidates) {
      const url = resolveImageUrl(pickString(candidate));
      if (!url) continue;
      const key = imageDedupeKey(url);
      if (seen.has(key)) continue;
      seen.add(key);
      if (hotelId && ownerId && ownerId === hotelId) matched.push(url);
      else unlabeled.push(url);
      if (matched.length >= limit) return;
    }
  };
  if (hotelId) walkScoped(root, hotelId, visitor);
  else walk(root, visitor);
  const preferred = matched.length >= 4 ? matched : [...matched, ...unlabeled];
  return preferred.slice(0, limit);
}

function hotelIdFrom(node: Record<string, unknown>): string {
  const save = asRecord(node.saveId);
  const route = asRecord(asRecord(node.cardLink)?.route);
  const typed = asRecord(route?.typedParams);
  return pickString(
    save?.id,
    node.contentId,
    node.locationId,
    node.hotelId,
    typed?.contentId,
    typed?.locationId,
    asRecord(node.trackingKey)?.contentId,
    /^\d{4,}$/.test(pickString(node.id)) ? node.id : ""
  );
}

function cleanHotelName(name: string): string {
  return name
    .replace(/[\u202a-\u202e\u2066-\u2069]/g, "")
    .replace(/^\d+\.\s+/, "")
    .trim();
}

const GENERIC_NAME =
  /^(hotel|hotels|about|location|reviews|photos|amenities|overview|details|rooms|gallery|map)$/i;
const MARKETING_COPY =
  /travelers'? choice awards the top|top 10% of businesses|saves from millions of travelers|based on reviews, ratings, and saves/i;

function isMarketingCopy(text: string): boolean {
  return MARKETING_COPY.test(text);
}

function isUsefulHotelName(name: string): boolean {
  const cleaned = cleanHotelName(name);
  if (!cleaned || cleaned.length < 3) return false;
  if (GENERIC_NAME.test(cleaned)) return false;
  if (/^(none|null|undefined|n\/a)$/i.test(cleaned)) return false;
  if (/^ta-/i.test(cleaned)) return false;
  if (isMarketingCopy(cleaned)) return false;
  return true;
}

function isBadgeText(text: string): boolean {
  return /breakfast|إفطار|kahvaltı|% off|discount|free cancellation|wifi|wi-fi|pool|spa|all.?inclusive/i.test(
    text
  );
}

function extractBadges(node: Record<string, unknown>): string[] {
  const badges: string[] = [];
  const push = (raw: string) => {
    const text = raw.replace(/\s+/g, " ").trim();
    if (!text || text.length > 80 || badges.includes(text)) return;
    if (GENERIC_NAME.test(text) || isMarketingCopy(text)) return;
    badges.push(text);
  };
  const primary = pickString(node.primaryInfo, asRecord(node.primaryInfo)?.text);
  const secondary = pickString(node.secondaryInfo, asRecord(node.secondaryInfo)?.text);
  if (isBadgeText(primary)) push(primary);
  if (isBadgeText(secondary)) push(secondary);
  push(pickString(node.promotionalLabel, asRecord(node.promotionalLabel)?.text));
  push(pickString(node.badge, node.badgeText, asRecord(node.badge)?.text));
  const labels = node.cardLabels;
  if (Array.isArray(labels)) {
    for (const item of labels) push(pickString(item));
  }
  walk(node, (child) => {
    const type = String(child.__typename || "");
    if (/label|badge|pill|chip|promo/i.test(type)) {
      push(pickString(child.text, child.string, child.name, child.title));
    }
  });
  return badges.slice(0, 6);
}

function isDistanceText(text: string): boolean {
  return /\d+(?:[.,]\d+)?\s*(?:km|mi|كم|ميل)/i.test(text);
}

function extractDistanceText(node: Record<string, unknown>): string {
  const direct = pickString(
    node.distance,
    node.distanceString,
    asRecord(node.distance)?.text,
    asRecord(node.distanceFrom)?.text
  );
  if (direct && isDistanceText(direct)) return direct;
  const primary = pickString(node.primaryInfo, asRecord(node.primaryInfo)?.text);
  const secondary = pickString(node.secondaryInfo, asRecord(node.secondaryInfo)?.text);
  if (isDistanceText(primary)) return primary;
  if (isDistanceText(secondary)) return secondary;
  return "";
}

function extractNeighborhood(node: Record<string, unknown>): string {
  const primary = pickString(node.primaryInfo, asRecord(node.primaryInfo)?.text);
  const secondary = pickString(node.secondaryInfo, asRecord(node.secondaryInfo)?.text);
  for (const text of [
    pickString(node.neighborhood, node.areaName, node.neighbourhood),
    isBadgeText(primary) || isDistanceText(primary) ? "" : primary,
    isBadgeText(secondary) || isDistanceText(secondary) ? "" : secondary,
  ]) {
    if (text && !isMarketingCopy(text) && !GENERIC_NAME.test(text)) return text;
  }
  return "";
}

function extractCardAddress(node: Record<string, unknown>): string {
  const direct = pickString(
    node.address,
    node.streetAddress,
    node.formattedAddress,
    node.locationString,
    node.location_string,
    asRecord(node.address)?.street,
    asRecord(node.address)?.street1,
    asRecord(node.address)?.text,
    asRecord(node.address)?.address_string,
    asRecord(node.addressObj)?.address_string,
    asRecord(node.address_obj)?.address_string,
    asRecord(node.geo)?.address,
    asRecord(node.geo)?.locationString,
    asRecord(node.location)?.address,
    asRecord(node.cardInfo)?.address,
    asRecord(asRecord(node.additionalInfo)?.address)?.address_string
  );
  if (direct && !isBadgeText(direct) && !isDistanceText(direct) && !GENERIC_NAME.test(direct)) {
    return direct;
  }
  let found = "";
  walk(node, (child) => {
    if (found) return;
    const type = String(child.__typename || "");
    if (!/Address|Geo|Location/i.test(type) && !child.street1 && !child.address_string) return;
    const text = pickString(
      child.address_string,
      child.street1,
      child.street,
      child.formattedAddress,
      child.text
    );
    if (text && text.length > 6 && text.length < 160 && !isBadgeText(text)) found = text;
  });
  return found;
}

const CARD_AMENITY =
  /wifi|wi-fi|internet|pool|swim|breakfast|إفطار|kahvalt|parking|spa|beach|gym|fitness|air.?cond|restaurant|bar|مسبح|واي/i;

function extractCardAmenities(node: Record<string, unknown>): string[] {
  const out: string[] = [];
  const push = (raw: string) => {
    const text = raw.replace(/\s+/g, " ").trim();
    if (!text || text.length > 48 || out.includes(text)) return;
    if (!CARD_AMENITY.test(text) && !isBadgeText(text)) return;
    if (GENERIC_NAME.test(text) || isMarketingCopy(text)) return;
    out.push(text);
  };
  for (const badge of extractBadges(node)) push(badge);
  const bags = [node.amenities, node.amenityTags, node.tags, node.pills, node.features];
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) {
      push(pickString(item, asRecord(item)?.name, asRecord(item)?.text, asRecord(item)?.localizedName));
    }
  }
  walk(node, (child) => {
    if (out.length >= 8) return;
    const type = String(child.__typename || "");
    if (/Amenity|PoiTag|FeatureTag|Facility/i.test(type)) {
      push(pickString(child.name, child.text, asRecord(child.tag)?.localizedName));
    }
  });
  return out.slice(0, 8);
}

function normalizeStarClass(n: number): number {
  if (n >= 10 && n <= 50) n = n / 10;
  if (n >= 1 && n <= 5) return Math.min(5, Math.round(n));
  return 0;
}

function extractStars(node: Record<string, unknown>): number {
  const direct = normalizeStarClass(
    pickNumber(
      node.hotelClass,
      asRecord(node.hotelClass)?.value,
      asRecord(node.hotelClass)?.rating,
      asRecord(node.hotelClass)?.text,
      asRecord(node.additionalInfo)?.hotelClass,
      asRecord(asRecord(node.cardInfo)?.hotelClass)?.value,
      asRecord(node.cardInfo)?.hotelClass,
      node.stars,
      node.starRating,
      node.hotel_class,
      node.class,
      node.numberOfStars,
      asRecord(node.starRating)?.rating,
      asRecord(node.starRating)?.value
    )
  );
  if (direct) return direct;
  let found = 0;
  walkScoped(node, hotelIdFrom(node), (child) => {
    if (found) return;
    const type = String(child.__typename || "");
    const classVal =
      child.hotelClass ??
      child.starRating ??
      child.hotel_class ??
      (/HotelClass|StarClass|ClassTag/i.test(type) ? child.value ?? child.text : null);
    const n = normalizeStarClass(pickNumber(classVal, asRecord(classVal)?.value, asRecord(classVal)?.text));
    if (n) found = n;
  });
  if (found) return found;
  const blob = [
    pickString(node.cardTitle, node.title, asRecord(node.cardTitle)?.string),
    pickString(node.primaryInfo, node.secondaryInfo),
    pickString(node.ranking, node.rankingString, node.hotel_class, node.hotelClass),
    ...extractBadges(node),
  ].join(" ");
  const starMatch = blob.match(/(\d(?:\.\d)?)\s*[- ]?\s*(?:star|نجوم|نجمة|yıldız)/i);
  if (starMatch) return normalizeStarClass(Number(starMatch[1]));
  const labelBlob = [
    pickString(node.badge, asRecord(node.badge)?.text),
    pickString(node.trackingTitle),
    ...(Array.isArray(node.labels) ? node.labels.map((item) => pickString(item)) : []),
    ...(Array.isArray(node.cardLabels) ? node.cardLabels.map((item) => pickString(item)) : []),
    ...extractBadges(node),
  ].join(" ");
  const labelStar = labelBlob.match(/(\d)\s*(?:[-.]?\s*)?(?:نجوم|نجمة|yıldız|stars?)/i);
  if (labelStar) return normalizeStarClass(Number(labelStar[1]));
  let fromText = 0;
  walk(node, (child) => {
    if (fromText) return;
    const text = pickString(
      child.text,
      child.string,
      child.accessibilityString,
      asRecord(child.hotelClass)?.text,
      child.title
    );
    const m = text.match(/(\d(?:\.\d)?)\s*[- ]?\s*(?:star|نجوم|نجمة|yıldız)/i);
    if (m) fromText = normalizeStarClass(Number(m[1]));
  });
  return fromText;
}

function extractStarsForId(root: unknown, hotelId: string): number {
  let found = 0;
  walkScoped(root, hotelId, (node) => {
    if (found) return;
    const n = normalizeStarClass(
      pickNumber(
        node.hotelClass,
        asRecord(node.hotelClass)?.value,
        asRecord(node.hotelClass)?.text,
        node.hotel_class,
        node.starRating,
        node.numberOfStars,
        asRecord(node.starRating)?.rating
      )
    );
    if (n) found = n;
  });
  return found;
}

function looksLikeRoomType(text: string): boolean {
  return /room|suite|twin|double|king|queen|deluxe|standard|studio|villa|apartment|junior|executive|family|غرفة|جناح|oda/i.test(
    text
  );
}

function looksLikeBedType(text: string): boolean {
  return (
    text.length < 64 &&
    /king|queen|twin|double|single|sofa|bunk|سرير|yatak|bed/i.test(text)
  );
}

function extractRoomType(node: Record<string, unknown>): string {
  const commerce =
    asRecord(node.commerceInfo) ||
    asRecord(node.commerce) ||
    asRecord(asRecord(node.commerceButtons)?.commerceInfo);
  const offer = asRecord(node.primaryOffer) || asRecord(commerce?.primaryOffer);
  const candidates = [
    pickString(commerce?.roomName, commerce?.roomType, commerce?.accommodationName, commerce?.roomTypeName),
    pickString(offer?.roomName, offer?.roomType, offer?.title, offer?.name, offer?.accommodationName),
    pickString(node.roomName, node.roomType, node.accommodationType, node.roomTypeName, node.accommodationName),
    pickString(asRecord(node.room)?.name, asRecord(node.room)?.title, asRecord(node.accommodation)?.name),
  ];
  const summary = pickString(
    commerce?.commerceSummary,
    asRecord(commerce?.commerceSummary)?.text,
    asRecord(commerce?.commerceSummary)?.string,
    node.commerceSummary
  );
  if (summary && looksLikeRoomType(summary) && summary.length < 90 && isRealRoomName(summary)) {
    return summary;
  }
  const details = commerce?.details ?? offer?.details ?? node.details ?? node.highlights;
  if (Array.isArray(details)) {
    for (const item of details) {
      const text = pickString(item, asRecord(item)?.text, asRecord(item)?.string);
      if (text && looksLikeRoomType(text) && text.length < 90 && isRealRoomName(text)) return text;
    }
  }
  for (const text of candidates) {
    if (text && looksLikeRoomType(text) && text.length < 90 && isRealRoomName(text)) return text;
  }
  for (const text of candidates) {
    if (text && isRealRoomName(text) && text.length < 90 && !GENERIC_NAME.test(text)) return text;
  }
  let found = "";
  walk(node, (child) => {
    if (found) return;
    const type = String(child.__typename || "");
    if (!/RoomType|Accommodation|OfferRoom|CommerceOffer|RoomName/i.test(type)) return;
    const text = pickString(child.roomName, child.roomType, child.title, child.name, child.accommodationName);
    if (text && looksLikeRoomType(text) && text.length < 90 && isRealRoomName(text)) found = text;
  });
  return found;
}

function extractBedType(node: Record<string, unknown>): string {
  const commerce =
    asRecord(node.commerceInfo) ||
    asRecord(node.commerce) ||
    asRecord(asRecord(node.commerceButtons)?.commerceInfo);
  const offer = asRecord(node.primaryOffer) || asRecord(commerce?.primaryOffer);
  const direct = pickString(
    node.bedType,
    node.beds,
    node.bed_type,
    asRecord(node.bedInfo)?.text,
    asRecord(node.beds)?.text,
    commerce?.bedType,
    offer?.bedType,
    asRecord(commerce?.bedInfo)?.text
  );
  if (direct && looksLikeBedType(direct)) return direct;
  const bags = [commerce?.details, offer?.details, node.details, node.highlights];
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) {
      const text = pickString(item, asRecord(item)?.text, asRecord(item)?.string);
      if (text && looksLikeBedType(text)) return text;
    }
  }
  const fromRoom = extractRoomType(node);
  const bedInName = fromRoom.match(
    /\b((?:[1-9]\s+)?(?:king|queen|twin|double|single|sofa|bunk)(?:\s+beds?)?)\b/i
  );
  return bedInName ? bedInName[1].replace(/\s+/g, " ").trim() : "";
}

function extractCancellation(node: Record<string, unknown>): string {
  const blobs: string[] = [
    ...extractBadges(node),
    pickString(node.cancellationPolicy, node.cancellation, node.freeCancellation),
    pickString(
      asRecord(node.commerceInfo)?.cancellationPolicy,
      asRecord(node.commerce)?.cancellationPolicy
    ),
  ];
  walk(node, (child) => {
    if (blobs.length > 20) return;
    blobs.push(
      pickString(child.text, child.string, child.cancellationPolicy, child.title, child.label)
    );
  });
  const blob = blobs.filter(Boolean).join(" ");
  if (/free cancellation|إلغاء مجاني|ücretsiz iptal/i.test(blob)) return "Free cancellation";
  if (/non[-\s]?refundable|غير قابل للاسترداد/i.test(blob)) return "Non-refundable";
  return "";
}

function extractHurryLeft(node: Record<string, unknown>): number {
  let found = 0;
  walk(node, (child) => {
    if (found) return;
    const text = pickString(child.text, child.string, child.urgencyMessage, child.scarcity);
    const m = text.match(/(\d+)\s+(rooms?|غرف)/i);
    if (m && /only|left|متبقي|فقط/i.test(text)) found = Number(m[1]);
  });
  return found;
}

function extractStayTotalHint(node: Record<string, unknown>): number | null {
  let found: number | null = null;
  walk(node, (child) => {
    if (found) return;
    const label = pickString(child.label, child.title, child.secondaryText, child.text);
    if (!/total|stay|إجمالي|toplam/i.test(label)) return;
    const n =
      moneyFrom(child.priceForDisplay) ||
      moneyFrom(child.displayPrice) ||
      moneyFrom(child.totalPrice) ||
      moneyFrom(child.amount);
    if (n && n >= 8) found = n;
  });
  return found;
}

function extractTotalCount(payload: unknown): number {
  let found = 0;
  walk(payload, (node) => {
    if (found > 0) return;
    const showAll = pickString(node.showAllText, asRecord(node.showAll)?.text);
    const fromShow = showAll.match(/([\d.,\u0660-\u0669]+)/);
    if (fromShow) {
      const n = Number(fromShow[1].replace(/[^\d]/g, ""));
      if (n > 0) found = n;
      return;
    }
    const n = pickNumber(
      node.totalCount,
      node.resultCount,
      node.resultsCount,
      node.hotelCount,
      asRecord(node.paging)?.total_results,
      asRecord(node.paging)?.total,
      asRecord(node.statusV2)?.totalCount
    );
    if (n >= 20) found = Math.round(n);
  });
  return found;
}

function moneyFrom(value: unknown): number | null {
  const direct = toUsdNumber(value);
  if (direct && direct >= 8) return direct;
  const rec = asRecord(value);
  if (!rec) return null;
  return (
    toUsdNumber(
      pickString(
        rec.string,
        rec.text,
        rec.htmlString,
        rec.amount,
        rec.value,
        rec.displayPrice,
        rec.priceForDisplay
      )
    ) ||
    toUsdNumber(rec.amount) ||
    toUsdNumber(rec.value) ||
    moneyFrom(rec.price) ||
    moneyFrom(rec.displayPrice) ||
    moneyFrom(rec.priceForDisplay) ||
    moneyFrom(rec.strikeThroughPrice) ||
    moneyFrom(rec.strikethroughPrice) ||
    moneyFrom(rec.localizedPrice) ||
    moneyFrom(rec.grossPrice) ||
    moneyFrom(rec.gross)
  );
}

function extractPrice(node: Record<string, unknown>): number | null {
  const commerce =
    asRecord(node.commerceInfo) ||
    asRecord(node.commerce) ||
    asRecord(asRecord(node.commerceButtons)?.commerceInfo) ||
    asRecord(asRecord(asRecord(node.commerceButtons)?.singleButton)?.commerceInfo);
  const primary =
    asRecord(node.primaryOffer) ||
    asRecord(commerce?.primaryOffer) ||
    asRecord(asRecord(node.commerceInfo)?.primaryOffer);
  const candidates = [
    commerce?.priceForDisplay,
    commerce?.displayPrice,
    commerce?.price,
    commerce?.strikethroughPrice,
    commerce?.strikeThroughPrice,
    primary?.displayPrice,
    primary?.priceForDisplay,
    primary?.price,
    asRecord(node.commerceSummary)?.price,
    asRecord(node.commerceSummary)?.priceForDisplay,
    node.priceForDisplay,
    node.displayPrice,
    node.strikeThroughPrice,
    node.strikethroughPrice,
    node.price,
    node.priceFrom,
    node.price_level,
  ];
  for (const candidate of candidates) {
    const n = moneyFrom(candidate);
    if (n && n >= 8) return n;
  }

  let found: number | null = null;
  walk(node, (child) => {
    if (found) return;
    const n =
      moneyFrom(child.priceForDisplay) ||
      moneyFrom(child.displayPrice) ||
      moneyFrom(child.strikeThroughPrice) ||
      moneyFrom(child.strikethroughPrice) ||
      moneyFrom(child.primaryOffer) ||
      moneyFrom(asRecord(child.commerce)?.priceForDisplay) ||
      moneyFrom(asRecord(child.commerceInfo)?.priceForDisplay);
    if (n && n >= 8) found = n;
  });
  return found;
}

function emptyCard(id: string): TravelAdvisorHotelCard {
  return {
    id,
    name: "",
    city: "Istanbul",
    country: "Turkey",
    neighborhood: "",
    stars: 0,
    rating: 0,
    reviewCount: 0,
    image: "",
    images: [],
    badges: [],
    snippet: "",
    priceFrom: null,
    priceOriginal: null,
    currency: "USD",
    lat: 0,
    lng: 0,
    address: "",
    locationText: "",
    roomType: "",
    bedType: "",
    cancellation: "",
    amenities: [],
    distanceText: "",
    nightly: null,
    totalStay: null,
    priceIsStayTotal: false,
    nights: 1,
    discountPct: 0,
    hurryLeft: 0,
  };
}

function withDisplayPricing(
  card: TravelAdvisorHotelCard,
  input: TravelAdvisorSearchInput,
  stayTotalHint: number | null = null
): TravelAdvisorHotelCard {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const resolved = resolveStayPrices(card.priceFrom, nights, stayTotalHint ?? card.totalStay);
  const nightly = resolved.nightly;
  // Only a discount the provider actually reported (strike-through price present) is shown.
  const priceOriginal = card.priceOriginal && nightly != null && card.priceOriginal > nightly ? card.priceOriginal : null;
  const rawPct = priceOriginal && nightly ? Math.round(((priceOriginal - nightly) / priceOriginal) * 100) : 0;
  const discountPct: TravelAdvisorHotelCard["discountPct"] = rawPct >= 15 ? 15 : rawPct >= 10 ? 10 : rawPct >= 5 ? 5 : 0;
  const baseLocation =
    card.locationText ||
    fullLocationText({
      neighborhood: card.neighborhood,
      address: card.address,
      city: card.city,
    });
  const locationText =
    card.distanceText && !baseLocation.includes(card.distanceText)
      ? [baseLocation, card.distanceText].filter(Boolean).join(" · ")
      : baseLocation;
  return {
    ...card,
    nights,
    nightly,
    totalStay: resolved.totalStay,
    priceIsStayTotal: resolved.priceIsStayTotal,
    discountPct,
    priceFrom: nightly,
    priceOriginal,
    locationText,
  };
}

function extractOriginalPrice(node: Record<string, unknown>, current: number | null): number | null {
  let found: number | null = null;
  walk(node, (child) => {
    if (found) return;
    const n =
      moneyFrom(child.strikeThroughPrice) ||
      moneyFrom(child.strikethroughPrice) ||
      moneyFrom(child.originalPrice);
    if (n && (!current || n > current)) found = n;
  });
  return found;
}

function mapHotelCard(node: Record<string, unknown>): TravelAdvisorHotelCard | null {
  const id = hotelIdFrom(node);
  const name = pickString(
    node.cardTitle,
    node.title,
    node.name,
    asRecord(node.cardTitle)?.string,
    asRecord(node.title)?.string
  );
  if (!id || !isUsefulHotelName(name)) return null;
  const displayName = cleanHotelName(name);
  const photoRoot = node.cardPhotos ?? node.photos ?? node;
  const images = collectImages(photoRoot, 8, id);
  const geo = extractGeo(node);
  const badges = extractBadges(node);
  const amenities = extractCardAmenities(node);
  const neighborhood = extractNeighborhood(node);
  const address = extractCardAddress(node);
  const city = pickString(
    node.city,
    asRecord(node.geo)?.city,
    asRecord(node.address)?.city,
    asRecord(node.address_obj)?.city,
    asRecord(node.addressObj)?.city
  );
  const distanceText = extractDistanceText(node);
  const locationText = [
    fullLocationText({ neighborhood, address, city }),
    distanceText,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    id,
    name: displayName,
    city,
    country: pickString(node.country, asRecord(node.geo)?.country, "Turkey"),
    neighborhood,
    stars: extractStars(node),
    rating: pickNumber(
      asRecord(node.bubbleRating)?.rating,
      node.rating,
      node.ratingValue
    ),
    reviewCount: Math.round(
      pickNumber(
        asRecord(node.bubbleRating)?.numberReviews,
        node.reviewCount,
        node.numReviews,
        node.num_reviews
      )
    ),
    image: images[0] || "",
    images,
    badges,
    snippet: pickString(
      node.descriptiveText,
      asRecord(node.descriptiveText)?.text,
      asRecord(node.rankingDetailsV2)?.text,
      node.rankingString,
      node.ranking
    ).slice(0, 180),
    priceFrom: extractPrice(node),
    priceOriginal: extractOriginalPrice(node, extractPrice(node)),
    currency: "USD",
    lat: geo.lat,
    lng: geo.lng,
    address,
    locationText,
    roomType: extractRoomType(node),
    bedType: extractBedType(node),
    cancellation: extractCancellation(node),
    amenities,
    distanceText,
    nightly: null,
    totalStay: extractStayTotalHint(node),
    priceIsStayTotal: false,
    nights: 1,
    discountPct: 0,
    hurryLeft: extractHurryLeft(node),
  };
}

function looksLikeHotelCard(node: Record<string, unknown>): boolean {
  const keys = Object.keys(node);
  const type = String(node.__typename || "");
  if (/Filter|Sort|Impression|Status|Polling/i.test(type)) return false;
  return (
    Boolean(hotelIdFrom(node)) &&
    (keys.includes("cardTitle") ||
      keys.includes("bubbleRating") ||
      keys.includes("commerceInfo") ||
      keys.includes("hotelClass") ||
      keys.includes("cardPhotos") ||
      /HotelCard|SingleCard|HorizontalCard/i.test(type) ||
      (typeof node.name === "string" && typeof node.contentId === "string"))
  );
}

function extractHotels(payload: unknown): TravelAdvisorHotelCard[] {
  const seen = new Map<string, TravelAdvisorHotelCard>();
  const rawKeys = new Set<string>();
  const samples: Record<string, unknown>[] = [];
  walk(payload, (node) => {
    if (looksLikeHotelCard(node)) {
      for (const key of Object.keys(node)) rawKeys.add(key);
      if (samples.length < 3) {
        samples.push({
          address: node.address,
          primaryInfo: node.primaryInfo,
          secondaryInfo: node.secondaryInfo,
          labels: node.labels,
          badge: node.badge,
          commerceButtons: node.commerceButtons
            ? Object.keys(asRecord(node.commerceButtons) || {})
            : null,
        });
      }
    } else {
      for (const key of Object.keys(node)) {
        if (/hotelClass|starRating|hotel_class|address|street|roomType|roomName|locationString/i.test(key)) {
          rawKeys.add(key);
        }
      }
    }
    if (!looksLikeHotelCard(node)) return;
    const card = mapHotelCard(node);
    if (!card) return;
    const existing = seen.get(card.id);
    seen.set(card.id, existing ? mergeCard(existing, card) : card);
  });
  void fs
    .mkdir(path.join(process.cwd(), ".data"), { recursive: true })
    .then(() =>
      fs.writeFile(
        path.join(process.cwd(), ".data", "ta-search-field-keys.json"),
        JSON.stringify(
          { keys: Array.from(rawKeys).sort(), samples, at: new Date().toISOString() },
          null,
          2
        )
      )
    )
    .catch(() => undefined);
  return Array.from(seen.values());
}

function listResponses(payload: unknown): Record<string, unknown>[] {
  const data = asRecord(asRecord(payload)?.data);
  const list = data?.AppPresentation_queryAppListV2;
  if (!Array.isArray(list)) return [];
  return list.map(asRecord).filter((item): item is Record<string, unknown> => Boolean(item));
}

function extractUpdateToken(payload: unknown): string {
  for (const item of listResponses(payload)) {
    const polling = asRecord(asRecord(item.statusV2)?.pollingStatus);
    const token = pickString(polling?.updateToken);
    if (token) return token;
  }
  let fallback = "";
  walk(payload, (node) => {
    if (fallback) return;
    const token = pickString(asRecord(node.pollingStatus)?.updateToken);
    if (token) fallback = token;
  });
  return fallback;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHotelName(payload: unknown, fallbackId: string): string {
  const cards = extractHotels(payload);
  const matched = cards.find((c) => c.id === fallbackId);
  if (matched && isUsefulHotelName(matched.name)) return matched.name;

  const candidates: string[] = [];
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    if (/navTitle|heroTitle|locationName|PoiHero|HeroSection/i.test(type)) {
      const name = pickString(node.string, node.text, node.title, node.name);
      if (isUsefulHotelName(name)) candidates.push(cleanHotelName(name));
    }
    const named = pickString(
      node.navTitle,
      node.heroTitle,
      node.locationName,
      node.pageTitle,
      node.heading,
      asRecord(node.container)?.navTitle,
      asRecord(node.location)?.name,
      asRecord(node.heading)?.text,
      asRecord(node.heading)?.string
    );
    if (isUsefulHotelName(named)) candidates.push(cleanHotelName(named));
  });
  const hotelish = candidates.find((n) => /hotel|suites|resort|inn|lodge|فندق|otel/i.test(n));
  return hotelish || candidates[0] || "";
}

function isReviewGraphNode(node: Record<string, unknown>, type: string): boolean {
  if (
    /UserReview|ReviewCard|ReviewQuote|ReviewItem|ReviewList|Contributor|ReviewBubble|GuestReview/i.test(
      type
    )
  ) {
    return true;
  }
  return Boolean(
    node.username ||
      node.userName ||
      node.userProfile ||
      node.publishedDate ||
      node.reviewText ||
      node.dateVisitedValue
  );
}

function extractDescription(payload: unknown): string {
  const ranked: Array<{ score: number; text: string }> = [];
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    if (isReviewGraphNode(node, type)) return;
    const isAbout =
      /CollapsibleText|PoiAbout|PoiOverview|AboutSection|DescriptionSection|About/i.test(type) ||
      node.about != null ||
      node.overview != null;
    const raw = pickString(
      node.about,
      node.description,
      node.overview,
      asRecord(node.about)?.text,
      asRecord(node.about)?.htmlString,
      asRecord(node.description)?.text,
      asRecord(node.description)?.htmlString,
      isAbout ? node.htmlText : "",
      isAbout ? node.htmlString : "",
      isAbout ? asRecord(node.htmlText)?.htmlString : "",
      isAbout ? asRecord(node.text)?.htmlString : "",
      isAbout ? asRecord(node.text)?.text : "",
      node.nullableText,
      isAbout ? node.text : ""
    );
    const text = stripHtml(raw);
    if (!text || text.length < 40) return;
    if (GENERIC_NAME.test(text)) return;
    if (/tripadvisor\.com\/Hotel_Review/i.test(text)) return;
    if (isGuestReviewText(text) || isPartnerPriceDisclaimer(text)) return;
    if (isMarketingCopy(text) && !isAbout) return;
    let score = text.length;
    if (/CollapsibleText|PoiAbout|About/i.test(type)) score += 800;
    if (isAbout) score += 300;
    if (node.about != null || node.description != null) score += 200;
    if (isMarketingCopy(text)) score -= 400;
    ranked.push({ score, text });
  });
  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0]?.text || "";
  return isUsableHotelDescription(best) ? best : "";
}

function extractAmenities(payload: unknown): string[] {
  const amenities: string[] = [];
  const push = (raw: string) => {
    const name = raw.replace(/\s+/g, " ").trim();
    if (!name || name.length > 64 || amenities.includes(name)) return;
    if (isMarketingCopy(name) || GENERIC_NAME.test(name)) return;
    if (/^view all|^see all|^show all/i.test(name)) return;
    amenities.push(name);
  };
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    const title = pickString(node.title, node.name, node.header);
    if (
      (/SmallTextList|BulletList|Amenity|Facility/i.test(type) && /amenit|facilit|feature|مراف/i.test(title)) ||
      type === "AppPresentation_SmallTextListSubsection"
    ) {
      const list = node.list || node.items || node.amenities || node.facilities;
      if (Array.isArray(list)) {
        for (const item of list) push(pickString(item, asRecord(item)?.string, asRecord(item)?.text));
      }
    }
    const bags = [node.amenities, node.facilities, node.features, node.amenityTags];
    for (const bag of bags) {
      if (!Array.isArray(bag)) continue;
      for (const item of bag) {
        push(pickString(item, asRecord(item)?.name, asRecord(item)?.localizedName, asRecord(item)?.text));
      }
    }
    const tag = asRecord(node.tag);
    push(pickString(tag?.localizedName, node.amenityName, node.featureName, node.amenity));
    if (/Amenity|Feature|Facility|PoiTag|CategorizedAmenity/i.test(type)) {
      push(pickString(node.name, node.text, tag?.localizedName, node.title));
    }
  });
  return amenities.slice(0, 48);
}

function extractHighlights(payload: unknown): string[] {
  const highlights: string[] = [];
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    const text = pickString(
      asRecord(node.highlight)?.text,
      node.highlight,
      /Highlight|Ranking/i.test(type) ? node.text || node.string : ""
    );
    if (!text || text.length > 140 || highlights.includes(text)) return;
    if (isMarketingCopy(text)) return;
    if (node.highlight || /Highlight|Ranking/i.test(type)) highlights.push(text);
  });
  return highlights.slice(0, 12);
}

function extractReviews(payload: unknown): TravelAdvisorReview[] {
  const reviews: TravelAdvisorReview[] = [];
  const seen = new Set<string>();
  const pushReview = (node: Record<string, unknown>, type: string) => {
    const profile = asRecord(node.userProfile) || asRecord(node.memberProfile);
    const author = pickString(
      node.username,
      node.userName,
      node.author,
      node.displayName,
      profile?.username,
      profile?.displayName,
      asRecord(profile?.displayName)?.string,
      asRecord(node.user)?.username,
      asRecord(node.contributor)?.primaryInfo,
      asRecord(node.author)?.name,
      asRecord(node.user)?.name,
      asRecord(node.member)?.username
    );
    const text = stripHtml(
      pickString(
        node.htmlText,
        asRecord(node.htmlText)?.htmlString,
        node.reviewText,
        asRecord(node.review)?.text,
        asRecord(node.text)?.htmlString,
        asRecord(node.text)?.text,
        node.pros,
        node.comment,
        node.body,
        node.quote,
        node.translatedText,
        node.originalText,
        asRecord(node.body)?.text,
        asRecord(node.quote)?.text,
        /Review/i.test(type) ? node.text : ""
      )
    );
    if (!text || text.length < 12) return;
    if (isMarketingCopy(text)) return;
    const hasBody = Boolean(
      node.htmlText || node.reviewText || node.pros || asRecord(node.text)?.htmlString
    );
    const hasMeta = Boolean(
      author ||
        node.publishedDate ||
        node.dateVisitedValue ||
        asRecord(node.bubbleRating) ||
        node.average_score
    );
    const looksLikeReview =
      /UserReview|ReviewCard|ReviewSection|ReviewQuote|ReviewItem|PoiReview|GuestReview|ReviewBubble|ReviewListItem|horizontalReview/i.test(
        type
      ) ||
      hasBody ||
      (hasMeta && text.length >= 20) ||
      Boolean(author && text.length >= 20);
    if (!looksLikeReview) return;
    const who = author || "Guest";
    const key = `${who}:${text.slice(0, 48)}`;
    if (seen.has(key)) return;
    seen.add(key);
    reviews.push({
      id: pickString(node.id, node.stableDiffingType, node.review_id, key),
      author: who,
      rating: pickNumber(
        asRecord(node.bubbleRating)?.rating,
        node.rating,
        asRecord(node.rating)?.value,
        node.average_score,
        node.averageScore
      ),
      title: pickString(
        node.htmlTitle,
        asRecord(node.htmlTitle)?.htmlString,
        node.title,
        asRecord(node.title)?.text,
        node.headline
      ),
      text,
      date: pickString(
        node.publishedDate,
        node.dateVisitedValue,
        node.date,
        node.travelDate,
        node.review_date,
        ""
      ),
    });
  };
  const reviewTypes = new Set<string>();
  walk(payload, (node) => {
    if (reviews.length >= 40) return;
    const type = String(node.__typename || "");
    if (/review/i.test(type)) reviewTypes.add(type);
    pushReview(node, type);
    const bags = [
      node.reviews,
      node.userReviews,
      node.reviewList,
      node.reviewItems,
      node.result,
      node.content,
      node.cards,
      node.items,
      node.list,
      node.sectionContent,
    ];
    for (const bag of bags) {
      if (!Array.isArray(bag)) continue;
      for (const item of bag) {
        const rec = asRecord(item);
        if (rec) pushReview(rec, String(rec.__typename || type));
      }
    }
  });
  void fs
    .mkdir(path.join(process.cwd(), ".data"), { recursive: true })
    .then(() =>
      fs.writeFile(
        path.join(process.cwd(), ".data", "ta-review-field-keys.json"),
        JSON.stringify(
          {
            count: reviews.length,
            reviewTypes: Array.from(reviewTypes).sort(),
            authors: reviews.slice(0, 8).map((r) => r.author),
            at: new Date().toISOString(),
          },
          null,
          2
        )
      )
    )
    .catch(() => undefined);
  return reviews.slice(0, 40);
}

function roomNameFromNode(node: Record<string, unknown>): string {
  const direct = cleanHotelName(
    pickString(
      node.roomName,
      node.roomType,
      node.accommodationName,
      node.room_name,
      node.room_type,
      asRecord(node.roomName)?.string,
      asRecord(node.roomType)?.name,
      asRecord(node.room)?.name,
      asRecord(node.room)?.title,
      asRecord(node.room)?.roomName,
      asRecord(node.accommodation)?.name
    )
  );
  if (isRealRoomName(direct) && looksLikeRoomType(direct)) return direct;
  const details = node.details ?? node.highlights ?? node.features;
  if (Array.isArray(details)) {
    for (const item of details) {
      const text = cleanHotelName(pickString(item, asRecord(item)?.text, asRecord(item)?.string));
      if (isRealRoomName(text) && looksLikeRoomType(text) && text.length < 90) return text;
    }
  }
  const summary = cleanHotelName(
    pickString(
      node.commerceSummary,
      asRecord(node.commerceSummary)?.text,
      asRecord(node.commerceSummary)?.string,
      node.cardTitle,
      asRecord(node.cardTitle)?.string,
      node.title,
      asRecord(node.title)?.string
    )
  );
  if (isRealRoomName(summary) && looksLikeRoomType(summary) && summary.length < 90) return summary;
  if (isRealRoomName(direct) && !GENERIC_NAME.test(direct)) return direct;
  return "";
}

function roomNameFromAncestors(ancestors: Record<string, unknown>[]): string {
  for (let i = ancestors.length - 1; i >= 0; i -= 1) {
    const name = roomNameFromNode(ancestors[i]);
    if (name) return name;
  }
  return "";
}

function collectRoomImages(node: Record<string, unknown>): string[] {
  const roots = [
    node.cardPhotos,
    node.photos,
    node.images,
    node.media,
    node.gallery,
    node.photo,
    asRecord(node.room)?.photos,
    asRecord(node.room)?.images,
  ];
  const urls: string[] = [];
  for (const root of roots) {
    if (!root) continue;
    for (const url of collectImages(root, 8, "")) {
      if (!urls.includes(url)) urls.push(url);
      if (urls.length >= 8) return urls;
    }
  }
  return urls;
}

function extractRooms(payload: unknown): TravelAdvisorRoom[] {
  const rooms: TravelAdvisorRoom[] = [];
  const seen = new Set<string>();
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    const keys = Object.keys(node);
    const looksLikeRoom =
      (/RoomCard|RoomType|HotelRoom|OfferRoom|AccommodationCard|AvailableRoom|RoomsSection/i.test(type) &&
        !/BedroomCount|Roommate|Bathroom/i.test(type)) ||
      keys.includes("roomName") ||
      keys.includes("roomType") ||
      keys.includes("room_name") ||
      (keys.includes("bedType") && (keys.includes("title") || keys.includes("name") || keys.includes("roomName")));
    if (!looksLikeRoom) return;
    const name = roomNameFromNode(node);
    if (!isRealRoomName(name) || isMarketingCopy(name)) return;
    const images = collectRoomImages(node);
    const price = extractPrice(node);
    const id = pickString(node.roomId, node.contentId, node.id, name);
    const key = `${id}|${name.toLowerCase()}`;
    if (seen.has(key) || seen.has(name.toLowerCase())) return;
    seen.add(key);
    seen.add(name.toLowerCase());
    const amenityBits: string[] = [];
    walk(node, (child) => {
      const amenity = pickString(child.amenityName, child.featureName);
      if (amenity && amenityBits.length < 8 && !amenityBits.includes(amenity)) {
        amenityBits.push(amenity);
      }
    });
    const blob = `${name} ${pickString(node.description, asRecord(node.description)?.text)}`;
    const view = pickString(node.view, node.viewType, asRecord(node.view)?.text, asRecord(node.viewInfo)?.text);
    rooms.push({
      id,
      name,
      description: pickString(node.description, asRecord(node.description)?.text, node.subtitle),
      beds: pickString(node.bedType, node.beds, asRecord(node.bedInfo)?.text, asRecord(node.beds)?.text),
      capacity: Math.round(pickNumber(node.occupancy, node.capacity, node.maxOccupancy, node.maxGuests)),
      sizeSqm: Math.round(pickNumber(node.sizeSqm, node.roomSize, node.size, node.squareMeters)),
      price,
      currency: "USD",
      amenities: amenityBits,
      images,
      breakfastIncluded: /breakfast|إفطار|kahvaltı/i.test(blob),
      freeCancellation: /free cancellation|إلغاء مجاني/i.test(blob),
      view,
      partnerName: "",
      nightly: price,
      totalStay: extractStayTotalHint(node),
      available: price != null,
      rates: [],
    });
  });
  return rooms.slice(0, 24);
}

function resolvePartnerLogo(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return resolveImageUrl(trimmed);
  if (/\.(png|jpe?g|svg|webp)$/i.test(trimmed) || /branding|logo/i.test(trimmed)) {
    return `https://static.tacdn.com/${trimmed.replace(/^\//, "")}`;
  }
  return "";
}

function summarizePayloadRoomKeys(payload: unknown): { typenames: string[]; keys: string[] } {
  const typenames = new Set<string>();
  const keys = new Set<string>();
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    if (type) typenames.add(type);
    for (const key of Object.keys(node)) {
      if (/room|bed|photo|offer|accommod|price|night|view|occup/i.test(key)) keys.add(key);
    }
  });
  return { typenames: Array.from(typenames).slice(0, 40), keys: Array.from(keys).sort() };
}

function extractOfferAmounts(node: Record<string, unknown>): {
  display: number | null;
  nightly: number | null;
  total: number | null;
} {
  const nightly =
    moneyFrom(node.nightlyRate) ||
    moneyFrom(node.pricePerNight) ||
    moneyFrom(node.perNightPrice) ||
    moneyFrom(node.nightlyPrice) ||
    moneyFrom(asRecord(node.rate)?.nightly) ||
    null;
  const total =
    moneyFrom(node.totalPrice) ||
    moneyFrom(node.stayTotal) ||
    moneyFrom(node.totalStay) ||
    moneyFrom(node.inclusivePrice) ||
    extractStayTotalHint(node);
  const display =
    moneyFrom(node.displayPrice) ||
    moneyFrom(node.priceForDisplay) ||
    moneyFrom(node.price) ||
    moneyFrom(node.amount) ||
    nightly ||
    total;
  return { display, nightly, total };
}

function extractOffers(payload: unknown): HotelOfferSource[] {
  const offers: HotelOfferSource[] = [];
  const seen = new Set<string>();
  walkWithAncestors(payload, (node, ancestors) => {
    const type = String(node.__typename || "");
    const partnerName =
      pickString(
        node.providerName,
        node.vendorName,
        node.partnerName,
        node.supplierName,
        asRecord(node.provider)?.name,
        asRecord(node.vendor)?.name,
        asRecord(node.logo)?.alt,
        node.providerDisplayName
      ) || partnerFromAncestors(ancestors);
    const amounts = extractOfferAmounts(node);
    const price = amounts.display;
    const roomName =
      roomNameFromNode(node) ||
      roomNameFromAncestors(ancestors);
    const boardText = [
      pickString(node.mealPlan, node.board, node.boardType, node.ratePlan),
      pickString(asRecord(node.mealPlan)?.text, asRecord(node.board)?.text),
      pickString(node.title, node.subtitle, node.description, node.commerceSummary),
    ].join(" ");
    const rawLogo = resolvePartnerLogo(
      pickString(
        node.providerLogoUrl,
        asRecord(node.logo)?.url,
        asRecord(node.provider)?.logo,
        node.logoUrl,
        node.logo
      )
    );
    const logoUrl = partnerLogoSrc(partnerName, rawLogo);
    const looksLikeOffer =
      Boolean(partnerName) &&
      price != null &&
      (/OfferDeal|CommerceOffer/i.test(type) ||
        node.displayPrice != null ||
        node.priceForDisplay != null ||
        node.providerName != null ||
        node.vendorName != null ||
        node.partnerName != null ||
        node.supplierName != null ||
        node.providerDisplayName != null ||
        asRecord(node.provider) != null);
    if (!looksLikeOffer || price == null) return;
    const key = `${partnerName.toLowerCase()}|${roomName.toLowerCase()}|${price}|${boardText.slice(0, 24)}`;
    if (seen.has(key)) return;
    seen.add(key);
    const blob = `${partnerName} ${roomName} ${boardText} ${pickString(node.title, node.description, node.cancellationPolicy)}`;
    const offerImages = collectRoomImages(node);
    offers.push({
      partnerId: pickString(node.providerId, node.vendorId, partnerName.toLowerCase()),
      partnerName,
      logoUrl,
      price,
      currency: pickString(node.currency, asRecord(node.price)?.currency, "USD") || "USD",
      roomName: isRealRoomName(roomName) ? roomName : "",
      breakfastIncluded: /breakfast|إفطار|kahvaltı|half.?board|all.?inclusive/i.test(blob),
      beds: pickString(node.bedType, node.beds, asRecord(node.bedInfo)?.text, asRecord(node.beds)?.text),
      capacity: Math.round(pickNumber(node.occupancy, node.capacity, node.maxOccupancy, node.maxGuests, node.adults)),
      sizeSqm: Math.round(pickNumber(node.sizeSqm, node.roomSize, node.size, node.squareMeters)),
      images: offerImages,
      freeCancellation: /free cancellation|إلغاء مجاني|refundable/i.test(blob),
      nightly: amounts.nightly ?? price,
      totalStay: amounts.total,
      view: pickString(node.view, node.viewType, asRecord(node.view)?.text),
    });
  });
  return offers.sort((a, b) => a.price - b.price).slice(0, 48);
}

function partnerFromAncestors(ancestors: Record<string, unknown>[]): string {
  for (let i = ancestors.length - 1; i >= 0; i -= 1) {
    const rec = ancestors[i];
    const name = pickString(
      rec.providerName,
      rec.vendorName,
      rec.partnerName,
      rec.supplierName,
      rec.providerDisplayName,
      asRecord(rec.provider)?.name,
      asRecord(rec.vendor)?.name,
      asRecord(rec.logo)?.alt
    );
    if (name) return name;
  }
  return "";
}

function mergeOffers(a: HotelOfferSource[], b: HotelOfferSource[]): HotelOfferSource[] {
  const seen = new Set<string>();
  const out: HotelOfferSource[] = [];
  for (const offer of [...a, ...b]) {
    const key = `${partnerKey(offer.partnerName)}|${(offer.roomName || "").toLowerCase()}|${offer.price}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(offer);
  }
  return out.sort((x, y) => x.price - y.price).slice(0, 48);
}

function unionImages(a: string[] = [], b: string[] = []): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of [...a, ...b]) {
    if (!url) continue;
    const key = imageDedupeKey(url);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

function mergeCard(
  base: TravelAdvisorHotelCard,
  extra: Partial<TravelAdvisorHotelCard>
): TravelAdvisorHotelCard {
  const images = unionImages(base.images, extra.images || (extra.image ? [extra.image] : []));
  return {
    ...base,
    ...extra,
    name: extra.name && isUsefulHotelName(extra.name) ? extra.name : base.name,
    image: base.image || extra.image || images[0] || "",
    images,
    badges: Array.from(new Set([...(base.badges || []), ...(extra.badges || [])])).slice(0, 8),
    snippet: extra.snippet || base.snippet,
    priceFrom:
      extra.priceFrom != null && base.priceFrom != null
        ? Math.min(extra.priceFrom, base.priceFrom)
        : extra.priceFrom ?? base.priceFrom,
    priceOriginal: extra.priceOriginal ?? base.priceOriginal,
    lat: extra.lat && isSensibleGeo(extra.lat, extra.lng || base.lng) ? extra.lat : base.lat,
    lng: extra.lng && isSensibleGeo(extra.lat || base.lat, extra.lng) ? extra.lng : base.lng,
    neighborhood: extra.neighborhood || base.neighborhood,
    address: extra.address || base.address,
    rating: extra.rating || base.rating,
    reviewCount: extra.reviewCount || base.reviewCount,
    stars: extra.stars || base.stars,
    roomType: extra.roomType || base.roomType,
    bedType: extra.bedType || base.bedType,
    cancellation: extra.cancellation || base.cancellation,
    amenities: Array.from(new Set([...(base.amenities || []), ...(extra.amenities || [])])).slice(0, 8),
    distanceText: extra.distanceText || base.distanceText,
    nightly:
      extra.nightly != null && base.nightly != null
        ? Math.min(extra.nightly, base.nightly)
        : extra.nightly ?? base.nightly,
    totalStay: extra.totalStay ?? base.totalStay,
    priceIsStayTotal: extra.priceIsStayTotal ?? base.priceIsStayTotal,
    nights: extra.nights || base.nights,
    discountPct: extra.discountPct || base.discountPct,
    hurryLeft: extra.hurryLeft || base.hurryLeft,
    locationText: [
      fullLocationText({
        neighborhood: extra.neighborhood || base.neighborhood,
        address: extra.address || base.address,
        city: extra.city || base.city,
      }),
      extra.distanceText || base.distanceText,
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

function cachedListCard(
  contentId: string,
  input?: TravelAdvisorSearchInput
): TravelAdvisorHotelCard | null {
  const nights = input ? nightsBetween(input.checkIn, input.checkOut) : 0;
  for (const entry of listCache.values()) {
    const hit = entry.value.hotels.find((h) => h.id === contentId);
    if (!hit) continue;
    if (nights && hit.nights && hit.nights !== nights) {
      return {
        ...hit,
        priceFrom: null,
        nightly: null,
        totalStay: null,
        priceIsStayTotal: false,
        nights,
      };
    }
    return hit;
  }
  return null;
}

export function peekCachedHotelList(): TravelAdvisorHotelCard[] {
  let newest: CacheEntry<ListSession> | null = null;
  for (const entry of listCache.values()) {
    if (!newest || entry.at > newest.at) newest = entry;
  }
  if (!newest || Date.now() - newest.at > LIST_CACHE_TTL_MS) return [];
  return newest.value.hotels;
}

async function taKeyCandidates(): Promise<string[]> {
  const primary = (await getServerEnv("RAPIDAPI_KEY")).trim();
  const rooms = (await getServerEnv("RAPIDAPI_ROOMS_KEY")).trim();
  const booking = (await getServerEnv("BOOKING_COM_RAPIDAPI_KEY")).trim();
  return [primary, rooms, booking].filter((k, i, all) => k && all.indexOf(k) === i);
}

async function taFetch<T>(init: TaRequestInit): Promise<T> {
  if (isTravelAdvisorUnsubscribed()) {
    throw new TravelAdvisorError("not_configured");
  }
  const keys = await taKeyCandidates();
  const key = init.key || keys[0] || "";
  const host =
    (await getServerEnv("RAPIDAPI_TRAVEL_ADVISOR_HOST")).trim() ||
    TRAVEL_ADVISOR_HOST;
  if (!key) {
    throw new TravelAdvisorError("not_configured");
  }

  const url = new URL(`https://${host}${init.path}`);
  url.searchParams.set("currency", "USD");
  url.searchParams.set("units", "km");
  url.searchParams.set("lang", rapidApiLang(init.lang) || DEFAULT_LANG);
  for (const [k, v] of Object.entries(init.query || {})) {
    if (v) url.searchParams.set(k, v);
  }

  if (!(await isTravelAdvisorRuntimePathEnabled(init.path))) {
    throw new TravelAdvisorError("search_failed");
  }

  const res = await directFetch(url.toString(), {
    method: init.method || "GET",
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  const text = await res.text();
  recordRapidApiLiveCall({
    provider: "travel_advisor",
    path: init.path,
    status: res.status,
    headers: res.headers,
    ok: res.ok && Boolean(text.trim()),
  });
  if (!text.trim()) {
    if (init.method === "POST" && init.retryEmpty !== false) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return taFetch<T>({ ...init, retryEmpty: false });
    }
    console.error("[travel-advisor]", init.path, res.status, "empty-body");
    throw new TravelAdvisorError(
      classifyRapidApiFailure(res.status, ""),
      res.status
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text) as unknown;
  } catch {
    throw new TravelAdvisorError(
      classifyRapidApiFailure(res.status, text.slice(0, 240)),
      res.status
    );
  }

  if (!res.ok) {
    const tried = new Set([...(init.triedKeys || []), key].filter(Boolean));
    const nextKey = keys.find((item) => item && !tried.has(item));
    if (nextKey && /not subscribed/i.test(text)) {
      return taFetch<T>({ ...init, key: nextKey, triedKeys: [...tried], retryEmpty: false });
    }
    if (/not subscribed/i.test(text)) markTravelAdvisorUnsubscribed();
    console.error("[travel-advisor]", init.path, res.status, text.slice(0, 240));
    throw new TravelAdvisorError(
      classifyRapidApiFailure(res.status, text.slice(0, 240)),
      res.status
    );
  }
  return payload as T;
}

async function taFetchOptional(init: TaRequestInit): Promise<unknown | null> {
  try {
    return await taFetch(init);
  } catch {
    return null;
  }
}

export async function searchLocations(query: string): Promise<
  Array<{ geoId: string; name: string; type: string }>
> {
  const q = query.trim() || "Istanbul";
  const payload = await taFetch<unknown>({
    path: "/locations/v2/auto-complete",
    query: { query: q },
  });
  const results: Array<{ geoId: string; name: string; type: string }> = [];
  const seen = new Set<string>();
  walk(payload, (node) => {
    const details = asRecord(node.detailsV2);
    const geoId = normalizeHotelGeoId(
      pickString(
        details?.locationId,
        node.locationId,
        node.geoId,
        node.documentId,
        node.id
      )
    );
    const name = pickString(
      node.title,
      node.name,
      asRecord(node.title)?.string,
      node.primaryInfo
    );
    const type = pickString(node.type, node.placeType, details?.placeType, "GEO").toUpperCase();
    if (!geoId || !name || seen.has(geoId)) return;
    if (type.includes("HOTEL")) return;
    seen.add(geoId);
    results.push({ geoId, name, type });
  });
  return results.slice(0, 8);
}

function roomStay(input: TravelAdvisorSearchInput) {
  if (input.rooms?.length) {
    return {
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      rooms: input.rooms.map((r) => ({
        adults: Math.max(1, r.adults || 1),
        childrenAges: Array.isArray(r.childrenAges)
          ? r.childrenAges.filter((n) => Number.isFinite(n) && n >= 0 && n <= 17)
          : [],
      })),
    };
  }
  const adults = Math.max(1, input.adults || 2);
  return {
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    rooms: [
      {
        adults,
        childrenAges: [] as number[],
      },
    ],
  };
}

function appliedFilters(input: TravelAdvisorSearchInput): TravelAdvisorAppliedFilter[] {
  return (input.filters || []).filter(
    (f) => f && f.id && Array.isArray(f.value) && f.value.length > 0
  );
}

function listStayBody(
  input: TravelAdvisorSearchInput,
  geoId: string,
  updateToken = ""
) {
  const normalized = normalizeHotelGeoId(geoId);
  const geoIdNum = Number(normalized);
  const filters = input.applyRemoteFilters
    ? appliedFilters(input).map((f) => ({ id: f.id, value: f.value }))
    : [];
  const sort =
    input.sort === "price"
      ? { sort: "PRICE_LOW_TO_HIGH", sortOrder: "asc" as const }
      : {};
  return {
    geoId: Number.isFinite(geoIdNum) && geoIdNum > 0 ? geoIdNum : normalized,
    ...roomStay(input),
    ...sort,
    ...(filters.length ? { filters } : {}),
    ...(updateToken ? { updateToken } : {}),
  };
}

function detailStayBody(input: TravelAdvisorSearchInput, contentId: string) {
  return {
    contentId,
    ...roomStay(input),
  };
}

function listCacheKey(input: TravelAdvisorSearchInput, geoId: string) {
  const filterKey = input.applyRemoteFilters ? JSON.stringify(appliedFilters(input)) : "";
  return `list:${rapidApiLang(input.lang)}:${geoId}:${input.checkIn}:${input.checkOut}:${occupancyCacheKey(input.rooms, input.adults)}:${input.sort || ""}:${filterKey}`;
}

function detailCacheKey(contentId: string, input: TravelAdvisorSearchInput) {
  return `detail:${rapidApiLang(input.lang)}:${contentId}:${input.checkIn}:${input.checkOut}:${occupancyCacheKey(input.rooms, input.adults)}`;
}

function pageFromSession(session: ListSession, page: number): TravelAdvisorHotelPage {
  const start = page * HOTEL_PAGE_SIZE;
  const hotels = session.hotels.slice(start, start + HOTEL_PAGE_SIZE);
  const totalCount = Math.max(session.totalCount, session.hotels.length);
  return {
    hotels,
    totalCount,
    page,
    pageSize: HOTEL_PAGE_SIZE,
    hasMore:
      start + HOTEL_PAGE_SIZE < session.hotels.length ||
      (!session.exhausted && (session.totalCount === 0 || session.hotels.length < session.totalCount)),
  };
}

function isIstanbulLabel(value: string): boolean {
  return /^(istanbul|إسطنبول|اسطنبول|İstanbul)$/i.test(value.trim());
}

function decorateList(hotels: TravelAdvisorHotelCard[], input: TravelAdvisorSearchInput) {
  const queryCity = (input.query || "").trim();
  return hotels.map((h) => {
    const misplacedIstanbul =
      Boolean(queryCity) &&
      !isIstanbulLabel(queryCity) &&
      isIstanbulLabel(h.city);
    const city = misplacedIstanbul ? queryCity : h.city || queryCity || "Istanbul";
    const locationText = [
      fullLocationText({
        neighborhood: h.neighborhood,
        address: h.address,
        city,
      }),
      h.distanceText,
    ]
      .filter(Boolean)
      .join(" · ");
    const amenities = (h.amenities || []).length
      ? h.amenities
      : (h.badges || []).filter((b) => CARD_AMENITY.test(b));
    return withDisplayPricing(
      {
        ...h,
        city,
        country: h.country || "Turkey",
        locationText,
        amenities,
      },
      input
    );
  });
}

function pricedCount(hotels: TravelAdvisorHotelCard[]): number {
  return hotels.filter((h) => h.priceFrom != null || h.nightly != null).length;
}

function needsPriceFollowUp(hotels: TravelAdvisorHotelCard[]): boolean {
  if (!hotels.length) return true;
  return pricedCount(hotels) < Math.ceil(hotels.length * 0.6);
}

function listGeoCenter(
  input: TravelAdvisorSearchInput,
  hotels: TravelAdvisorHotelCard[]
): { lat: number; lng: number } | null {
  for (const hotel of hotels) {
    if (isSensibleGeo(hotel.lat, hotel.lng)) return { lat: hotel.lat, lng: hotel.lng };
  }
  const q = (input.query || "").trim();
  if (input.geoId === ISTANBUL_GEO_ID || /istanbul|إسطنبول|اسطنبول/i.test(q)) {
    return ISTANBUL_CENTER;
  }
  return null;
}

function v1StayQuery(
  input: TravelAdvisorSearchInput,
  geoId: string,
  offset: number
): Record<string, string> {
  return {
    location_id: geoId,
    adults: String(Math.max(1, input.adults || 2)),
    rooms: "1",
    nights: String(nightsBetween(input.checkIn, input.checkOut)),
    offset: String(Math.max(0, offset)),
    order: "asc",
    limit: String(LIST_FETCH_SIZE),
    sort: "recommended",
    checkin: input.checkIn,
  };
}

const EXTRA_LIST_QUERIES: Array<Record<string, string>> = [
  { sort: "ranking", order: "desc" },
  { sort: "price", order: "asc" },
  { hotel_class: "5" },
  { hotel_class: "4" },
  { hotel_class: "3" },
  { pricesmin: "0", pricesmax: "100" },
  { pricesmin: "100", pricesmax: "180" },
  { pricesmin: "180", pricesmax: "280" },
  { pricesmin: "280", pricesmax: "450" },
  { pricesmin: "450", pricesmax: "2500" },
];

async function fetchV1ListPage(
  input: TravelAdvisorSearchInput,
  geoId: string,
  offset: number,
  extra: Record<string, string> = {}
): Promise<TravelAdvisorHotelCard[]> {
  const payload = await taFetchOptional({
    path: "/hotels/list",
    method: "GET",
    lang: input.lang,
    query: { ...v1StayQuery(input, geoId, offset), ...extra },
  });
  return extractV1Hotels(payload, input);
}

async function fetchLatlngPage(
  input: TravelAdvisorSearchInput,
  center: { lat: number; lng: number },
  offset: number
): Promise<TravelAdvisorHotelCard[]> {
  const payload = await taFetchOptional({
    path: "/hotels/list-by-latlng",
    method: "GET",
    lang: input.lang,
    query: {
      latitude: String(center.lat),
      longitude: String(center.lng),
      adults: String(Math.max(1, input.adults || 2)),
      rooms: "1",
      nights: String(nightsBetween(input.checkIn, input.checkOut)),
      offset: String(Math.max(0, offset)),
      limit: String(LIST_FETCH_SIZE),
      checkin: input.checkIn,
    },
  });
  return extractV1Hotels(payload, input);
}

async function fetchBoundaryPage(
  input: TravelAdvisorSearchInput,
  center: { lat: number; lng: number },
  offset: number
): Promise<TravelAdvisorHotelCard[]> {
  const payload = await taFetchOptional({
    path: "/hotels/list-in-boundary",
    method: "GET",
    lang: input.lang,
    query: {
      bl_latitude: String(center.lat - 0.18),
      bl_longitude: String(center.lng - 0.28),
      tr_latitude: String(center.lat + 0.18),
      tr_longitude: String(center.lng + 0.28),
      adults: String(Math.max(1, input.adults || 2)),
      rooms: "1",
      nights: String(nightsBetween(input.checkIn, input.checkOut)),
      offset: String(Math.max(0, offset)),
      limit: String(LIST_FETCH_SIZE),
      checkin: input.checkIn,
    },
  });
  return extractV1Hotels(payload, input);
}

/**
 * v2 /hotels/v2/list often hard-caps ~30 cards per city on this RapidAPI plan.
 * Follow-up poll merges prices onto the same ids. Extra pages come from
 * v1 /hotels/list offsets plus /hotels/list-by-latlng (and boundary if needed).
 */
export async function listHotels(
  input: TravelAdvisorSearchInput
): Promise<TravelAdvisorHotelPage> {
  let geoId = (input.geoId || "").trim();
  if (!geoId) {
    const q = (input.query || "Istanbul").trim();
    if (/istanbul/i.test(q) || q === "إسطنبول" || q === "اسطنبول") {
      geoId = ISTANBUL_GEO_ID;
    } else {
      const locs = await searchLocations(q);
      geoId = locs[0]?.geoId || ISTANBUL_GEO_ID;
    }
  }

  const key = listCacheKey(input, geoId);
  const page = Math.max(0, input.page || 0);
  const need = (page + 1) * HOTEL_PAGE_SIZE;
  const cached = cacheGet(listCache, key, LIST_CACHE_TTL_MS);
  if (cached && (cached.hotels.length >= need || cached.exhausted)) {
    return pageFromSession(cached, page);
  }

  let session: ListSession = cached || {
    hotels: [],
    totalCount: 0,
    nextToken: "",
    nextOffset: 0,
    nextV1Offset: 0,
    nextLatlngOffset: 0,
    extraCursor: 0,
    exhausted: false,
  };

  if (session.hotels.length === 0) {
    const first = await taFetch<unknown>({
      path: "/hotels/v2/list",
      method: "POST",
      lang: input.lang,
      body: listStayBody(input, geoId),
    });
    let hotels = extractHotels(first);
    let token = extractUpdateToken(first);
    const totalFromApi = extractTotalCount(first);
    if (token && (hotels.length === 0 || needsPriceFollowUp(hotels))) {
      const second = await taFetch<unknown>({
        path: "/hotels/v2/list",
        method: "POST",
        lang: input.lang,
        body: listStayBody(input, geoId, token),
      });
      hotels = mergeHotelLists(hotels, extractHotels(second));
      token = extractUpdateToken(second) || token;
      session.totalCount = Math.max(totalFromApi, extractTotalCount(second));
    } else {
      session.totalCount = totalFromApi;
    }

    const v1Hotels = await fetchV1ListPage(input, geoId, 0);
    hotels = mergeHotelLists(hotels, v1Hotels);

    const center = listGeoCenter(input, hotels);
    let latlngHotels: TravelAdvisorHotelCard[] = [];
    if (center) {
      latlngHotels = await fetchLatlngPage(input, center, 0);
      hotels = mergeHotelLists(hotels, latlngHotels);
    }

    let extraCursor = 0;
    while (extraCursor < 3 && extraCursor < EXTRA_LIST_QUERIES.length) {
      const extra = EXTRA_LIST_QUERIES[extraCursor];
      extraCursor += 1;
      hotels = mergeHotelLists(hotels, await fetchV1ListPage(input, geoId, 0, extra));
    }

    session.hotels = decorateList(hotels, input);
    session.nextToken = token;
    session.nextOffset = LIST_FETCH_SIZE;
    session.nextV1Offset = LIST_FETCH_SIZE;
    session.nextLatlngOffset = latlngHotels.length ? LIST_FETCH_SIZE : 0;
    session.extraCursor = extraCursor;
    session.totalCount = Math.max(session.totalCount, session.hotels.length);
    session.exhausted = hotels.length === 0;
    cacheSet(listCache, key, session);
    return pageFromSession(session, page);
  }

  let attempts = 0;
  while (session.hotels.length < need && !session.exhausted && attempts < 3) {
    attempts += 1;
    const v2Offset = session.nextOffset || session.hotels.length;
    const v1Offset = session.nextV1Offset || 0;
    const latlngOffset = session.nextLatlngOffset || 0;
    const nextV2 = await taFetchOptional({
      path: "/hotels/v2/list",
      method: "POST",
      lang: input.lang,
      body: {
        ...listStayBody(input, geoId, session.nextToken || ""),
        offset: v2Offset,
        page: Math.floor(v2Offset / LIST_FETCH_SIZE),
        limit: LIST_FETCH_SIZE,
      },
    });
    let more = extractHotels(nextV2);
    if (nextV2) {
      session.totalCount = Math.max(session.totalCount, extractTotalCount(nextV2));
      session.nextToken = extractUpdateToken(nextV2) || session.nextToken;
    }

    const v1More = await fetchV1ListPage(input, geoId, v1Offset);
    more = mergeHotelLists(more, v1More);

    const center = listGeoCenter(input, session.hotels);
    let latlngMore: TravelAdvisorHotelCard[] = [];
    if (center) {
      latlngMore = await fetchLatlngPage(input, center, latlngOffset);
      more = mergeHotelLists(more, latlngMore);
    }

    const extraIdx = session.extraCursor || 0;
    if (extraIdx < EXTRA_LIST_QUERIES.length) {
      more = mergeHotelLists(
        more,
        await fetchV1ListPage(input, geoId, 0, EXTRA_LIST_QUERIES[extraIdx])
      );
      session.extraCursor = extraIdx + 1;
    }

    const known = new Set(session.hotels.map((h) => h.id));
    let uniqueNew = more.filter((h) => !known.has(h.id));
    if (uniqueNew.length === 0 && center) {
      const boundary = await fetchBoundaryPage(input, center, latlngOffset);
      more = mergeHotelLists(more, boundary);
      uniqueNew = more.filter((h) => !known.has(h.id));
    }

    const before = session.hotels.length;
    session.hotels = decorateList(mergeHotelLists(session.hotels, more), input);
    session.nextOffset = v2Offset + LIST_FETCH_SIZE;
    session.nextV1Offset = v1Offset + LIST_FETCH_SIZE;
    session.nextLatlngOffset = latlngOffset + LIST_FETCH_SIZE;
    session.totalCount = Math.max(session.totalCount, session.hotels.length);
    const extrasLeft = (session.extraCursor || 0) < EXTRA_LIST_QUERIES.length;
    const emptyPages = v1More.length === 0 && latlngMore.length === 0 && uniqueNew.length === 0;
    if (
      session.hotels.length === before &&
      uniqueNew.length === 0 &&
      emptyPages &&
      !extrasLeft
    ) {
      session.exhausted = true;
    }
  }
  cacheSet(listCache, key, session);
  return pageFromSession(session, page);
}

function extractV1Hotels(
  payload: unknown,
  input: TravelAdvisorSearchInput
): TravelAdvisorHotelCard[] {
  if (!payload) return [];
  const root = asRecord(payload);
  const data = root?.data;
  let rows: unknown[] = [];
  if (Array.isArray(data)) rows = data;
  else if (Array.isArray(root)) rows = root;
  else {
    const nested = asRecord(data);
    for (const key of ["data", "hotels", "results", "list"]) {
      const bag = nested?.[key];
      if (Array.isArray(bag)) {
        rows = bag;
        break;
      }
    }
  }
  const out: TravelAdvisorHotelCard[] = [];
  for (const item of rows) {
    const hotel = asRecord(item);
    if (!hotel) continue;
    const parsed = parseV1Hotel(
      hotel,
      pickString(hotel.location_id, hotel.locationId, hotel.id),
      input
    );
    if (parsed && isUsefulHotelName(parsed.name)) out.push(parsed);
  }
  return out;
}

function mergeHotelLists(
  primary: TravelAdvisorHotelCard[],
  extra: TravelAdvisorHotelCard[]
): TravelAdvisorHotelCard[] {
  const map = new Map<string, TravelAdvisorHotelCard>();
  for (const hotel of primary) map.set(hotel.id, hotel);
  for (const hotel of extra) {
    const current = map.get(hotel.id);
    map.set(hotel.id, current ? mergeCard(current, hotel) : hotel);
  }
  const out = primary.map((h) => map.get(h.id) || h);
  for (const hotel of extra) {
    if (!primary.some((p) => p.id === hotel.id)) {
      const next = map.get(hotel.id);
      if (next) out.push(next);
    }
  }
  return out;
}

function detailsFromPayload(
  payload: unknown,
  contentId: string,
  input: TravelAdvisorSearchInput
): TravelAdvisorHotelDetails {
  const cards = extractHotels(payload);
  const listed = cachedListCard(contentId, input);
  const fromTree = cards.find((c) => c.id === contentId);
  let base = emptyCard(contentId);
  if (listed) base = mergeCard(base, listed);
  if (fromTree) base = mergeCard(base, fromTree);

  const name = extractHotelName(payload, contentId) || base.name;
  const images = collectImages(payload, 48, contentId);
  const geo = extractGeo(payload);
  let neighborhood = base.neighborhood;
  let address = base.address;
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    if (type === "AppPresentation_PoiOverview") {
      neighborhood = neighborhood || pickString(node.neighborhood);
    }
    if (/PoiLocation|PoiAddress/i.test(type)) {
      neighborhood = neighborhood || pickString(node.neighborhood);
      address =
        address ||
        pickString(
          node.address,
          asRecord(node.address)?.street1,
          asRecord(node.address)?.address_string
        );
    }
    if (!address) {
      address = pickString(
        asRecord(node.address)?.street1,
        asRecord(node.address)?.street,
        asRecord(node.address)?.text,
        node.streetAddress
      );
    }
  });
  let phone = "";
  walk(payload, (node) => {
    if (phone) return;
    phone = pickString(node.phone, node.telephone, asRecord(node.contact)?.phone);
  });
  let ranking = "";
  walk(payload, (node) => {
    if (ranking) return;
    const text = pickString(node.rankingString, node.ranking, asRecord(node.ranking)?.string);
    if (/#\d+|of \d+/i.test(text)) ranking = text;
  });

  return {
    ...base,
    id: contentId,
    name: (isUsefulHotelName(name) ? name : base.name) || "",
    city: base.city || input.query || "Istanbul",
    country: base.country || "Turkey",
    image: images[0] || base.image,
    images: images.length ? images : base.images,
    description: preferHotelDescription(
      extractDescription(payload),
      isUsableHotelDescription(base.snippet) ? base.snippet : ""
    ),
    amenities: Array.from(new Set([...(base.amenities || []), ...extractAmenities(payload)])).slice(
      0,
      48
    ),
    highlights: ranking
      ? [ranking, ...extractHighlights(payload)].slice(0, 12)
      : extractHighlights(payload),
    reviews: extractReviews(payload).slice(0, 40),
    rooms: extractRooms(payload),
    phone,
    ranking,
    neighborhood,
    address,
    locationText: fullLocationText({ neighborhood, address, city: base.city || input.query || "Istanbul" }),
    stars: base.stars || extractStarsForId(payload, contentId),
    snippet: base.snippet,
    lat: isSensibleGeo(geo.lat, geo.lng) ? geo.lat : base.lat,
    lng: isSensibleGeo(geo.lat, geo.lng) ? geo.lng : base.lng,
    priceFrom: extractPrice(asRecord(payload) || {}) || base.priceFrom,
    checkInTime: pickCheckTime(payload, "checkIn"),
    checkOutTime: pickCheckTime(payload, "checkOut"),
    policies: extractPolicies(payload),
    nearbyPlaces: extractNearbyPlaces(payload),
    roomsPendingMatch: false,
  };
}

function pickCheckTime(payload: unknown, kind: "checkIn" | "checkOut"): string {
  let found = "";
  walk(payload, (node) => {
    if (found) return;
    found =
      kind === "checkIn"
        ? pickString(
            node.checkInTime,
            node.checkinTime,
            asRecord(node.checkIn)?.time
          )
        : pickString(
            node.checkOutTime,
            node.checkoutTime,
            asRecord(node.checkOut)?.time
          );
    if (found && !/^\d{1,2}:\d{2}/.test(found) && !/\d{1,2}\s*(am|pm)/i.test(found)) {
      found = "";
    }
  });
  return found;
}

function extractPolicies(payload: unknown): string[] {
  const policies: string[] = [];
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    if (/Policy|HouseRule|FinePrint|Disclaimer/i.test(type)) {
      const text = pickString(node.text, node.string, node.description, node.title, node.nullableText);
      if (text && text.length > 8 && text.length < 220 && !policies.includes(text) && !isMarketingCopy(text)) {
        policies.push(text);
      }
    }
    if (type === "AppPresentation_StandaloneInfoSubsection") {
      const title = pickString(node.title);
      const item = pickString(node.standaloneItem);
      const line = title && item ? `${title}: ${item}` : item || title;
      if (line && line.length > 4 && line.length < 180 && !policies.includes(line)) {
        policies.push(line);
      }
    }
  });
  return policies.slice(0, 12);
}

function extractNearbyPlaces(payload: unknown): TravelAdvisorNearbyPlace[] {
  const places: TravelAdvisorNearbyPlace[] = [];
  const seen = new Set<string>();
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    if (looksLikeHotelCard(node) || OTHER_HOTEL_SECTION.test(type)) return;
    const name = pickString(
      node.poiName,
      node.attractionName,
      node.landmarkName,
      node.name,
      node.title,
      asRecord(node.primaryInfo)?.text,
      asRecord(node.title)?.string
    );
    if (!name || name.length < 2 || name.length > 80 || GENERIC_NAME.test(name)) return;
    const distance = pickString(
      node.distance,
      node.distanceString,
      asRecord(node.distance)?.text,
      asRecord(node.secondaryInfo)?.text
    );
    const looksNearby =
      /Nearby|Attraction|Landmark|PoiDistance|DistanceItem|NearbyPlace/i.test(type) ||
      (Boolean(distance) && isDistanceText(distance) && /poi|place|attraction|landmark/i.test(type + name));
    if (!looksNearby && !(node.distance != null && name && !looksLikeHotelCard(node))) return;
    if (!looksNearby && !isDistanceText(distance)) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    places.push({ name, distance });
  });
  return places.slice(0, 16);
}

function preferHotelDescription(a: string, b: string): string {
  const aOk = isUsableHotelDescription(a);
  const bOk = isUsableHotelDescription(b);
  if (aOk && !bOk) return a;
  if (bOk && !aOk) return b;
  if (aOk && bOk) return a.length >= b.length ? a : b;
  return "";
}

function mergeDetails(
  a: TravelAdvisorHotelDetails,
  b: TravelAdvisorHotelDetails
): TravelAdvisorHotelDetails {
  const images = unionImages(a.images, b.images);
  return {
    ...a,
    name: isUsefulHotelName(a.name) ? a.name : b.name,
    description: preferHotelDescription(a.description, b.description),
    image: a.image || b.image || images[0] || "",
    images,
    amenities: Array.from(new Set([...a.amenities, ...b.amenities])).slice(0, 36),
    highlights: a.highlights.length ? a.highlights : b.highlights,
    reviews: unionReviews(a.reviews, b.reviews),
    rooms: unionRooms(a.rooms, b.rooms),
    badges: Array.from(new Set([...(a.badges || []), ...(b.badges || [])])).slice(0, 8),
    snippet: a.snippet || b.snippet,
    phone: a.phone || b.phone,
    ranking: a.ranking || b.ranking,
    address: a.address || b.address,
    locationText: [
      fullLocationText({
        neighborhood: a.neighborhood || b.neighborhood,
        address: a.address || b.address,
        city: a.city || b.city,
      }),
      a.distanceText || b.distanceText,
    ]
      .filter(Boolean)
      .join(" · "),
    roomType: a.roomType || b.roomType,
    bedType: a.bedType || b.bedType,
    cancellation: a.cancellation || b.cancellation,
    lat: isSensibleGeo(a.lat, a.lng) ? a.lat : b.lat,
    lng: isSensibleGeo(a.lat, a.lng) ? a.lng : b.lng,
    priceFrom: a.priceFrom ?? b.priceFrom,
    priceOriginal: a.priceOriginal ?? b.priceOriginal,
    rating: a.rating || b.rating,
    reviewCount: a.reviewCount || b.reviewCount,
    neighborhood: a.neighborhood || b.neighborhood,
    checkInTime: a.checkInTime || b.checkInTime,
    checkOutTime: a.checkOutTime || b.checkOutTime,
    policies: a.policies?.length ? a.policies : b.policies || [],
    nearbyPlaces: a.nearbyPlaces?.length ? a.nearbyPlaces : b.nearbyPlaces || [],
    stars: a.stars || b.stars,
    distanceText: a.distanceText || b.distanceText,
    roomsPendingMatch: Boolean(a.roomsPendingMatch || b.roomsPendingMatch),
  };
}

function unionReviews(
  a: TravelAdvisorReview[],
  b: TravelAdvisorReview[]
): TravelAdvisorReview[] {
  const seen = new Set<string>();
  const out: TravelAdvisorReview[] = [];
  for (const review of [...a, ...b]) {
    const key = `${review.author}:${review.text.slice(0, 48)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(review);
  }
  return out.slice(0, 40);
}

function extractV1RoomArrays(hotel: Record<string, unknown>): TravelAdvisorRoom[] {
  const bags = [hotel.rooms, hotel.room_types, hotel.roomTypes, hotel.hotel_rooms];
  const rooms: TravelAdvisorRoom[] = [];
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) {
      const rec = asRecord(item);
      if (!rec) continue;
      const name = roomNameFromNode(rec);
      if (!isRealRoomName(name)) continue;
      rooms.push({
        id: pickString(rec.roomId, rec.id, name),
        name,
        description: pickString(rec.description, rec.room_tip, rec.tip),
        beds: pickString(rec.bedType, rec.beds, rec.bed_type),
        capacity: Math.round(pickNumber(rec.occupancy, rec.capacity, rec.maxOccupancy)),
        sizeSqm: Math.round(pickNumber(rec.sizeSqm, rec.roomSize, rec.size)),
        price: extractPrice(rec),
        currency: "USD",
        amenities: (() => {
          const bits: string[] = [];
          const bags = [rec.amenities, rec.facilities, rec.highlights];
          for (const bag of bags) {
            if (!Array.isArray(bag)) continue;
            for (const item of bag) {
              const text = pickString(item, asRecord(item)?.name, asRecord(item)?.title);
              if (text && text.length < 48 && !bits.includes(text)) bits.push(text);
            }
          }
          return bits.slice(0, 12);
        })(),
        images: collectRoomImages(rec),
        breakfastIncluded: false,
        freeCancellation: false,
        view: pickString(rec.view, rec.viewType),
        partnerName: "",
        nightly: extractPrice(rec),
        totalStay: null,
        available: extractPrice(rec) != null,
        rates: [],
      });
    }
  }
  return rooms;
}

function emptyRoomFields(room: TravelAdvisorRoom): TravelAdvisorRoom {
  return {
    ...room,
    view: room.view || "",
    partnerName: room.partnerName || "",
    nightly: room.nightly ?? room.price,
    totalStay: room.totalStay ?? null,
    available: room.available !== false && (room.price != null || (room.rates || []).some((r) => r.price != null)),
    rates: room.rates || [],
  };
}

function unionRooms(a: TravelAdvisorRoom[], b: TravelAdvisorRoom[]): TravelAdvisorRoom[] {
  const seen = new Map<string, TravelAdvisorRoom>();
  const out: TravelAdvisorRoom[] = [];
  for (const raw of [...a, ...b]) {
    if (!isRealRoomName(raw.name)) continue;
    const room = emptyRoomFields(raw);
    const key = (room.name || room.id).toLowerCase();
    const existing = seen.get(key);
    if (existing) {
      existing.beds = existing.beds || room.beds;
      existing.view = existing.view || room.view;
      existing.description = existing.description || room.description;
      existing.capacity = Math.max(existing.capacity, room.capacity);
      existing.sizeSqm = existing.sizeSqm || room.sizeSqm;
      existing.images = unionImages(existing.images, room.images);
      existing.amenities = Array.from(
        new Set([...(existing.amenities || []), ...(room.amenities || [])])
      ).slice(0, 12);
      existing.rates = [...existing.rates, ...room.rates];
      existing.available = existing.available || room.available;
      if (room.price != null && (existing.price == null || room.price < existing.price)) {
        existing.price = room.price;
        existing.currency = room.currency;
      }
      continue;
    }
    seen.set(key, room);
    out.push(room);
  }
  return out.slice(0, 24);
}

function extractReviewUpdateToken(payload: unknown): string {
  let token = "";
  walk(payload, (node) => {
    if (token) return;
    const type = String(node.__typename || "");
    if (!/UserReviewSection|ReviewList|ReviewsSection/i.test(type)) return;
    token = pickString(asRecord(node.pollingStatus)?.updateToken, node.updateToken);
  });
  return token;
}

function parseV1Hotel(
  payload: unknown,
  contentId: string,
  input: TravelAdvisorSearchInput
): TravelAdvisorHotelDetails | null {
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root;
  const hotel =
    asRecord(data?.hotel) ||
    (Array.isArray(data) ? asRecord(data[0]) : null) ||
    data;
  if (!hotel) return null;
  const name = pickString(hotel.name, hotel.location_string, hotel.locationString);
  const images = collectImages(hotel, 32, pickString(hotel.location_id, hotel.locationId, contentId));
  const geo = extractGeo(hotel);
  const amenities: string[] = [];
  const rawAmenities = hotel.amenities;
  if (Array.isArray(rawAmenities)) {
    for (const item of rawAmenities) {
      const text = pickString(item, asRecord(item)?.name);
      if (text && !amenities.includes(text)) amenities.push(text);
    }
  }
  const reviews = extractReviews(hotel);
  if (!isUsefulHotelName(name) && images.length === 0 && !reviews.length) {
    return null;
  }
  return {
    ...emptyCard(contentId),
    id: pickString(hotel.location_id, hotel.locationId, contentId),
    name: isUsefulHotelName(name) ? name : "",
    city: pickString(asRecord(hotel.address_obj)?.city, hotel.city, input.query, "Istanbul"),
    country: pickString(asRecord(hotel.address_obj)?.country, hotel.country, "Turkey"),
    neighborhood: pickString(
      hotel.neighborhood,
      asRecord(hotel.address_obj)?.state,
      asRecord(hotel.address_obj)?.street1
    ),
    stars: Math.min(5, Math.round(pickNumber(hotel.hotel_class, hotel.stars))),
    rating: pickNumber(hotel.rating, hotel.ratingValue),
    reviewCount: Math.round(pickNumber(hotel.num_reviews, hotel.numReviews, hotel.reviewCount)),
    image: images[0] || "",
    images,
    badges: [],
    snippet: stripHtml(pickString(hotel.description, hotel.ranking, hotel.ranking_string)).slice(0, 180),
    priceFrom:
      moneyFrom(hotel.price) ||
      moneyFrom(hotel.priceFrom) ||
      moneyFrom(hotel.price_from) ||
      extractPrice(hotel),
    priceOriginal: null,
    currency: "USD",
    lat: geo.lat,
    lng: geo.lng,
    address: pickString(hotel.address, asRecord(hotel.address_obj)?.address_string),
    locationText: fullLocationText({
      neighborhood: pickString(
        hotel.neighborhood,
        asRecord(hotel.address_obj)?.state,
        asRecord(hotel.address_obj)?.street1
      ),
      address: pickString(hotel.address, asRecord(hotel.address_obj)?.address_string),
      city: pickString(asRecord(hotel.address_obj)?.city, hotel.city, input.query, "Istanbul"),
    }),
    roomType: pickString(hotel.room_type, hotel.roomType),
    bedType: pickString(hotel.bed_type, hotel.bedType, hotel.beds),
    cancellation: pickString(hotel.cancellation, hotel.cancellationPolicy),
    amenities: amenities.slice(0, 36),
    distanceText: "",
    nightly: null,
    totalStay: null,
    priceIsStayTotal: false,
    nights: nightsBetween(input.checkIn, input.checkOut),
    discountPct: 0,
    hurryLeft: 0,
    description: preferHotelDescription(
      stripHtml(pickString(hotel.description, hotel.about)),
      ""
    ),
    highlights: [],
    reviews,
    rooms: unionRooms(extractRooms(hotel), extractV1RoomArrays(hotel)),
    phone: pickString(hotel.phone, hotel.telephone),
    ranking: pickString(hotel.ranking, hotel.ranking_string),
    checkInTime: pickString(hotel.checkin_time, hotel.checkInTime),
    checkOutTime: pickString(hotel.checkout_time, hotel.checkOutTime),
    policies: [],
    nearbyPlaces: [],
    roomsPendingMatch: false,
  };
}

function listedAsDetails(
  listed: TravelAdvisorHotelCard | null,
  contentId: string
): TravelAdvisorHotelDetails {
  const base = listed || emptyCard(contentId);
  return {
    ...base,
    description: isUsableHotelDescription(base.snippet) ? base.snippet : "",
    amenities: base.amenities || [],
    highlights: [],
    reviews: [],
    rooms: [],
    phone: "",
    ranking: "",
    checkInTime: "",
    checkOutTime: "",
    policies: [],
    nearbyPlaces: [],
    roomsPendingMatch: false,
  };
}

export async function getHotelDetails(
  contentId: string,
  input: TravelAdvisorSearchInput
): Promise<TravelAdvisorHotelDetails | null> {
  const key = detailCacheKey(contentId, input);
  const cached = cacheGet(detailCache, key, DETAIL_CACHE_TTL_MS);
  if (cached) return cached;

  const existing = inflight.get(key);
  if (existing) return existing as Promise<TravelAdvisorHotelDetails | null>;

  const work = (async () => {
    let details = listedAsDetails(cachedListCard(contentId, input), contentId);

    const v2 = await taFetchOptional({
      path: "/hotels/v2/get-details",
      method: "POST",
      lang: input.lang,
      body: { contentId: String(contentId), ...roomStay(input) },
    });
    if (v2) details = mergeDetails(detailsFromPayload(v2, contentId, input), details);
    const detailToken = v2 ? extractUpdateToken(v2) : "";
    const incompleteDetail =
      !isUsefulHotelName(details.name) ||
      details.amenities.length === 0 ||
      /prices are provided by our partners|الأسعار مُقد[مَّ]*ة من شركائنا|الأسعار مقدمة من شركائنا/i.test(
        details.description
      );
    let filled: unknown = null;
    if (detailToken && incompleteDetail) {
      filled = await taFetchOptional({
        path: "/hotels/v2/get-details",
        method: "POST",
        lang: input.lang,
        body: {
          contentId: String(contentId),
          ...roomStay(input),
          updateToken: detailToken,
        },
      });
      if (filled) details = mergeDetails(detailsFromPayload(filled, contentId, input), details);
    }
    const reviewToken = v2 ? extractReviewUpdateToken(v2) : "";
    if (details.reviews.length < 10 && reviewToken && reviewToken !== detailToken) {
      const extraReviews = await taFetchOptional({
        path: "/hotels/v2/get-details",
        method: "POST",
        lang: input.lang,
        body: { contentId: String(contentId), ...roomStay(input), updateToken: reviewToken },
      });
      if (extraReviews) {
        details = mergeDetails(details, detailsFromPayload(extraReviews, contentId, input));
      }
    }

    const v1 = await taFetchOptional({
      path: "/hotels/get-details",
      method: "GET",
      lang: input.lang,
      query: {
        location_id: contentId,
        checkin: input.checkIn,
        adults: String(Math.max(1, input.adults || 2)),
        nights: String(nightsBetween(input.checkIn, input.checkOut)),
      },
    });
    const parsed = v1 ? parseV1Hotel(v1, contentId, input) : null;
    if (parsed) details = mergeDetails(details, parsed);
    if (details.reviews.length < 10) {
      const reviewPage = await taFetchOptional({
        path: "/hotels/v2/get-reviews",
        method: "POST",
        lang: input.lang,
        body: { contentId: String(contentId), offset: 0, limit: 20 },
      });
      if (reviewPage) {
        const extra = extractReviews(reviewPage);
        const root = asRecord(reviewPage);
        const data = asRecord(root?.data);
        void fs
          .mkdir(path.join(process.cwd(), ".data"), { recursive: true })
          .then(() =>
            fs.writeFile(
              path.join(process.cwd(), ".data", "ta-get-reviews-last.json"),
              JSON.stringify(
                {
                  extraCount: extra.length,
                  topKeys: root ? Object.keys(root) : [],
                  dataKeys: data ? Object.keys(data) : [],
                  at: new Date().toISOString(),
                },
                null,
                2
              )
            )
          )
          .catch(() => undefined);
        details = mergeDetails(details, detailsFromPayload(reviewPage, contentId, input));
      }
    }

    if (details.images.length < 8) {
      const photosV2 = await taFetchOptional({
        path: "/hotels/v2/get-photos",
        method: "POST",
        lang: input.lang,
        body: { contentId: String(contentId) },
      });
      if (photosV2) {
        details = mergeDetails(details, detailsFromPayload(photosV2, contentId, input));
      }
    }
    if (details.images.length < 8) {
      const photosV1 = await taFetchOptional({
        path: "/hotels/photos",
        method: "GET",
        lang: input.lang,
        query: { location_id: contentId },
      });
      if (photosV1) {
        const photoParsed = parseV1Hotel(photosV1, contentId, input);
        details = mergeDetails(
          details,
          photoParsed || detailsFromPayload(photosV1, contentId, input)
        );
      }
    }

    const listed = cachedListCard(contentId, input);
    if (listed && !isUsefulHotelName(details.name)) {
      details = { ...details, name: listed.name };
    }
    if (listed) {
      details = {
        ...details,
        priceFrom: details.priceFrom ?? listed.priceFrom,
        nightly: details.nightly ?? listed.nightly,
        totalStay: details.totalStay ?? listed.totalStay,
      };
    }
    const fromDetailsOffers = mergeOffers(
      v2 ? extractOffers(v2) : [],
      filled ? extractOffers(filled) : []
    );
    const offers = mergeOffers(fromDetailsOffers, await getHotelOffers(contentId, input));
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const leadNightly = cheapestNightly(offers);
    details = {
      ...details,
      priceFrom: leadNightly ?? details.priceFrom,
      nightly: leadNightly ?? details.nightly,
      totalStay: null,
    };
    const namedDetailRooms = details.rooms.filter(
      (room) => isRealRoomName(room.name) && !isGenericStandardRoomName(room.name)
    );
    const offerRooms = fallbackRoomsFromCompare(
      offers,
      details.images,
      input.adults || 2,
      bestAvailableRateTitle(input.lang),
      leadNightly,
      input.lang
    );
    const priced = withDisplayPricing(details, input);
    const roomSource = unionRooms(namedDetailRooms, offerRooms);
    const mergedRooms = roomSource.map((room) => {
      const resolved = resolveStayPrices(room.nightly ?? room.price, nights, room.totalStay);
      return {
        ...room,
        nightly: resolved.nightly,
        price: resolved.nightly,
        totalStay: resolved.totalStay,
        rates: room.rates.map((rate) => {
          const rateResolved = resolveStayPrices(rate.nightly ?? rate.price, nights, rate.totalStay);
          return {
            ...rate,
            nightly: rateResolved.nightly,
            price: rateResolved.nightly,
            totalStay: rateResolved.totalStay,
          };
        }),
      };
    });
    details = {
      ...details,
      ...priced,
      rooms: mergedRooms,
    };

    cacheSet(detailCache, key, details);
    return details;
  })();

  inflight.set(key, work);
  try {
    return await work;
  } finally {
    inflight.delete(key);
  }
}

function offersCacheKey(contentId: string, input: TravelAdvisorSearchInput) {
  return `offers:${rapidApiLang(input.lang)}:${contentId}:${input.checkIn}:${input.checkOut}:${occupancyCacheKey(input.rooms, input.adults)}`;
}

export async function getHotelOffers(
  contentId: string,
  input: TravelAdvisorSearchInput
): Promise<HotelOfferSource[]> {
  const key = offersCacheKey(contentId, input);
  const cached = cacheGet(offersCache, key, LIST_CACHE_TTL_MS);
  if (cached) return cached;

  const existing = inflight.get(key);
  if (existing) return existing as Promise<HotelOfferSource[]>;

  const work = (async () => {
    const detailId = Number(contentId);
    const body = {
      detailId: Number.isFinite(detailId) ? detailId : contentId,
      ...roomStay(input),
      updateToken: "",
    };
    let payload = await taFetchOptional({
      path: "/hotels/v2/get-offers",
      method: "POST",
      lang: input.lang,
      body,
    });
    let offers = payload ? extractOffers(payload) : [];
    const token = payload ? extractUpdateToken(payload) : "";
    if (token) {
      const second = await taFetchOptional({
        path: "/hotels/v2/get-offers",
        method: "POST",
        lang: input.lang,
        body: { ...body, updateToken: token },
      });
      offers = mergeOffers(offers, second ? extractOffers(second) : []);
      payload = second || payload;
    }
    if (!offers.length) {
      const altBody = {
        contentId: String(contentId),
        ...roomStay(input),
        updateToken: "",
      };
      const alt = await taFetchOptional({
        path: "/hotels/v2/get-offers",
        method: "POST",
        lang: input.lang,
        body: altBody,
      });
      offers = mergeOffers(offers, alt ? extractOffers(alt) : []);
      const altToken = alt ? extractUpdateToken(alt) : "";
      if (altToken) {
        const alt2 = await taFetchOptional({
          path: "/hotels/v2/get-offers",
          method: "POST",
          lang: input.lang,
          body: { ...altBody, updateToken: altToken },
        });
        offers = mergeOffers(offers, alt2 ? extractOffers(alt2) : []);
        payload = alt2 || alt || payload;
      } else {
        payload = alt || payload;
      }
    }
    const nights = nightsBetween(input.checkIn, input.checkOut);
    offers = offers.map((offer) => withResolvedStay(offer, nights));
    if (!offers.length && payload) {
      const summary = summarizePayloadRoomKeys(payload);
      console.info(
        "[travel-advisor] get-offers empty",
        contentId,
        input.checkIn,
        input.checkOut,
        summary
      );
    }
    if (offers.length) cacheSet(offersCache, key, offers);
    return offers;
  })();

  inflight.set(key, work);
  try {
    return await work;
  } finally {
    inflight.delete(key);
  }
}

function filterOptionLabel(node: Record<string, unknown>, groupId = ""): string {
  const object = node.object;
  if (typeof object === "string" && object.trim()) return object.trim();
  const acc = pickString(
    node.unselectedAccessibilityString,
    node.selectedAccessibilityString
  );
  const applied = acc.match(/^(?:Apply|Remove) (.+) filter$/i);
  if (applied?.[1]) return applied[1];
  const nested = asRecord(object);
  const tag = asRecord(nested?.tag) || asRecord(node.tag);
  const minRating = Number(nested?.minimumRatingValue ?? node.minimumRatingValue);
  if (groupId === "rating" && Number.isFinite(minRating) && minRating > 0) {
    const display = minRating > 10 ? minRating / 10 : minRating;
    return `${display.toFixed(1)}+`;
  }
  const value = pickString(node.value);
  if (groupId === "rating" && /^\d+$/.test(value)) {
    const n = Number(value);
    if (n >= 10 && n <= 50) return `${(n / 10).toFixed(1)}+`;
  }
  if (value === "botb") return "Best of the Best";
  return pickString(
    asRecord(tag)?.localizedName,
    nested?.name,
    node.name,
    node.title,
    node.label,
    acc,
    value
  );
}

function extractFilterGroups(payload: unknown): TravelAdvisorFilterGroup[] {
  const groups: TravelAdvisorFilterGroup[] = [];
  const seen = new Set<string>();
  walk(payload, (node) => {
    const type = String(node.__typename || "");
    const id = pickString(node.name);
    if (!id || seen.has(id)) return;
    if (!/Filter$/i.test(type) || /FilterGroup|FilterResponse/i.test(type)) return;
    if (id === "Filters") return;

    const title = pickString(node.title, node.name) || id;
    if (/RangedSlider|price/i.test(type) || id === "price") {
      const min = Number(node.minValue ?? 0);
      const max = Number(node.maxValue ?? 0);
      seen.add(id);
      groups.push({
        id,
        title,
        kind: "range",
        min: Number.isFinite(min) ? min : 0,
        max: Number.isFinite(max) && max > 0 ? max : 360,
        unit: "USD",
        options: [],
      });
      return;
    }

    if (/DistanceFrom/i.test(type) || id === "distFrom") {
      const options: TravelAdvisorFilterOption[] = [];
      const locations = Array.isArray(node.locations) ? node.locations : [];
      for (const loc of locations) {
        const rec = asRecord(loc);
        if (!rec) continue;
        const value = pickString(rec.value, rec.id, rec.geoId);
        const label = filterOptionLabel(rec, id);
        if (value && label) options.push({ value, label, count: rec.count != null ? Number(rec.count) : null });
      }
      seen.add(id);
      groups.push({
        id,
        title,
        kind: "distance",
        min: Number(node.minDistance ?? 0.5) || 0.5,
        max: Number(node.maxDistance ?? 25) || 25,
        unit: "km",
        options,
      });
      return;
    }

    const values = Array.isArray(node.values) ? node.values : [];
    if (!values.length) return;
    const options: TravelAdvisorFilterOption[] = [];
    for (const item of values) {
      const rec = asRecord(item);
      if (!rec) continue;
      const value = pickString(rec.value, rec.id);
      const label = filterOptionLabel(rec, id);
      if (!value || !label) continue;
      options.push({
        value,
        label,
        count: rec.count != null ? Number(rec.count) : null,
      });
    }
    if (!options.length) return;
    seen.add(id);
    groups.push({
      id,
      title,
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: options.slice(0, id === "amenity" ? 28 : id === "brand" ? 12 : 20),
    });
  });
  const order = [
    "price",
    "class",
    "rating",
    "type",
    "amenity",
    "deals",
    "popular",
    "distFrom",
    "neighborhood",
    "style",
    "travelersChoice",
    "brand",
  ];
  groups.sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return groups;
}

function extractV1FilterGroups(payload: unknown): TravelAdvisorFilterGroup[] {
  if (!payload) return [];
  const groups: TravelAdvisorFilterGroup[] = [];
  const root = asRecord(payload);
  const filters = asRecord(root?.filters) || root;
  if (!filters) return [];
  for (const [id, raw] of Object.entries(filters)) {
    if (!Array.isArray(raw) || !raw.length) continue;
    const options: TravelAdvisorFilterOption[] = [];
    for (const item of raw) {
      const rec = asRecord(item);
      const value = pickString(rec?.value, rec?.id, item);
      const label = pickString(rec?.label, rec?.name, rec?.text, value);
      if (value && label) options.push({ value, label, count: null });
    }
    if (options.length) {
      groups.push({
        id,
        title: id,
        kind: id === "price" ? "range" : "multi",
        min: null,
        max: null,
        unit: "",
        options: options.slice(0, 20),
      });
    }
  }
  return groups;
}

export async function listHotelFilters(
  input: TravelAdvisorSearchInput
): Promise<TravelAdvisorFilterGroup[]> {
  let geoId = (input.geoId || "").trim();
  if (!geoId) {
    const q = (input.query || "Istanbul").trim();
    geoId =
      /istanbul/i.test(q) || q === "إسطنبول" || q === "اسطنبول"
        ? ISTANBUL_GEO_ID
        : (await searchLocations(q))[0]?.geoId || ISTANBUL_GEO_ID;
  }
  const key = `filters:${rapidApiLang(input.lang)}:${geoId}:${input.checkIn}:${input.checkOut}:${occupancyCacheKey(input.rooms, input.adults)}`;
  const cached = cacheGet(filterCache, key, LIST_CACHE_TTL_MS);
  if (cached) return cached;

  const v2 = await taFetchOptional({
    path: "/hotel-filters/v2/list",
    method: "POST",
    lang: input.lang,
    body: {
      ...listStayBody(input, geoId),
      sort: "PRICE_LOW_TO_HIGH",
      sortOrder: "asc",
    },
  });
  let groups = extractFilterGroups(v2);
  if (!groups.length) {
    const v1 = await taFetchOptional({
      path: "/hotel-filters/list",
      method: "GET",
      lang: input.lang,
      query: {
        location_id: geoId,
        adults: String(Math.max(1, input.adults || 2)),
        rooms: "1",
        nights: String(nightsBetween(input.checkIn, input.checkOut)),
        order: "asc",
        sort: "recommended",
      },
    });
    groups = extractV1FilterGroups(v1);
  }
  const locale: Locale = input.lang === "ar" || input.lang === "tr" ? input.lang : "en";
  const dealByValue: Record<string, string> = {
    "1": "Special offers",
    "2": "Free cancellation",
    "3": "Pay at stay",
  };
  groups = groups.map((group) => ({
    ...group,
    options: group.options.map((opt) => {
      const raw =
        group.id === "deals" && dealByValue[opt.value]
          ? dealByValue[opt.value]
          : opt.label;
      return { ...opt, label: localizeHotelLabel(raw, locale) };
    }),
  }));
  cacheSet(filterCache, key, groups);
  return groups;
}

function advisorNameKey(value: string): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function advisorNameScore(query: string, candidate: string): number {
  const q = advisorNameKey(query);
  const c = advisorNameKey(candidate);
  if (!q || !c) return 0;
  if (c === q) return 200;
  if (c.includes(q) || q.includes(c)) return 120;
  const words = q.split(" ").filter((w) => w.length > 2);
  if (!words.length) return 0;
  return words.filter((w) => c.includes(w)).length * 12;
}

export type TravelAdvisorHotelMatch = {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
};

/** Autocomplete results that are hotels — used to resolve the TripAdvisor location/content id. */
export async function searchHotelPlaces(query: string): Promise<TravelAdvisorHotelMatch[]> {
  const q = query.trim();
  if (!q) return [];
  const payload = await taFetchOptional({
    path: "/locations/v2/auto-complete",
    query: { query: q },
  });
  if (!payload) return [];
  const results: TravelAdvisorHotelMatch[] = [];
  const seen = new Set<string>();
  walk(payload, (node) => {
    const details = asRecord(node.detailsV2);
    const id = normalizeHotelGeoId(
      pickString(
        details?.locationId,
        node.locationId,
        node.contentId,
        node.documentId,
        /^\d{4,}$/.test(pickString(node.id)) ? node.id : ""
      )
    );
    const name = cleanHotelName(
      pickString(node.title, node.name, asRecord(node.title)?.string, node.primaryInfo)
    );
    const type = pickString(node.type, node.placeType, details?.placeType, node.resultType).toUpperCase();
    if (!id || !name || seen.has(id)) return;
    const hotelType = type.includes("HOTEL") || /hotel|resort|riad|suites/i.test(name);
    if (!hotelType) return;
    seen.add(id);
    results.push({
      id,
      name,
      rating: pickNumber(asRecord(node.bubbleRating)?.rating, node.rating),
      reviewCount: Math.round(
        pickNumber(asRecord(node.bubbleRating)?.numberReviews, node.numReviews, node.reviewCount)
      ),
    });
  });
  return results.slice(0, 12);
}

export async function resolveTravelAdvisorHotelId(input: {
  name: string;
  city?: string;
}): Promise<TravelAdvisorHotelMatch | null> {
  const name = input.name.trim();
  if (!name || isTravelAdvisorUnsubscribed()) return null;
  const queries = [[name, input.city].filter(Boolean).join(" "), name].filter(
    (item, index, all) => item && all.indexOf(item) === index
  );
  let best: TravelAdvisorHotelMatch | null = null;
  let bestScore = 0;
  for (const query of queries) {
    const places = await searchHotelPlaces(query);
    for (const place of places) {
      const score = Math.max(
        advisorNameScore(name, place.name),
        advisorNameScore(`${name} ${input.city || ""}`, place.name)
      );
      if (score > bestScore) {
        bestScore = score;
        best = place;
      }
    }
    if (bestScore >= 48) break;
  }
  return bestScore >= 24 ? best : null;
}

export async function fetchTravelAdvisorReviews(input: {
  contentId: string;
  lang?: string;
}): Promise<{ reviews: TravelAdvisorReview[]; rating: number; reviewCount: number }> {
  const contentId = String(input.contentId || "").trim();
  if (!contentId) return { reviews: [], rating: 0, reviewCount: 0 };
  const reviews: TravelAdvisorReview[] = [];
  const seen = new Set<string>();
  let rating = 0;
  let reviewCount = 0;
  for (const offset of [0, 20, 40]) {
    const page = await taFetchOptional({
      path: "/hotels/v2/get-reviews",
      method: "POST",
      lang: input.lang,
      body: { contentId: String(contentId), offset, limit: 20 },
    });
    if (!page) break;
    const extra = extractReviews(page);
    const cards = extractHotels(page);
    const card = cards.find((item) => item.id === contentId) || cards[0];
    if (card?.rating) rating = rating || card.rating;
    if (card?.reviewCount) reviewCount = reviewCount || card.reviewCount;
    let added = 0;
    for (const row of extra) {
      if (!row.text || seen.has(row.id)) continue;
      seen.add(row.id);
      reviews.push({ ...row, source: "tripadvisor" });
      added += 1;
    }
    if (added < 6) break;
  }
  if (!reviews.length) {
    const details = await taFetchOptional({
      path: "/hotels/get-details",
      method: "GET",
      lang: input.lang,
      query: { location_id: contentId },
    });
    if (details) {
      for (const row of extractReviews(details)) {
        if (!row.text || seen.has(row.id)) continue;
        seen.add(row.id);
        reviews.push({ ...row, source: "tripadvisor" });
      }
    }
  }
  return { reviews, rating, reviewCount };
}

export async function listAdvisorScoreHints(input: {
  lat: number;
  lng: number;
  checkIn: string;
  checkOut: string;
  lang?: string;
}): Promise<TravelAdvisorHotelMatch[]> {
  const hotels = await fetchLatlngPage(
    {
      query: "",
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: 2,
      lang: input.lang,
    },
    { lat: input.lat, lng: input.lng },
    0
  );
  return hotels
    .filter((hotel) => hotel.rating > 0 && hotel.name)
    .map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      rating: hotel.rating,
      reviewCount: hotel.reviewCount || 0,
    }));
}
