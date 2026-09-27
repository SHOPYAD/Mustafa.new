import {
  type BookingDest,
  destForQuery,
  destIdForQuery,
  citySlug,
  SEEDED_DEST,
  seededCityTotal,
  seededDestForQuery,
} from "@/lib/booking-dest";
import {
  enrichListCard,
  parseBookingAccessLabel,
  uniqueHotelPhotoUrls,
} from "@/lib/booking-search-parse";
import { nightsBetween, resolveStayPrices, fullLocationText } from "@/lib/hotel-display";
import { rejectPayAtPropertyLines } from "@/lib/pay-at-property";
import {
  BOOKING_DEST_TTL_MS,
  BOOKING_LIST_TTL_MS,
  bookingCacheLooksLikeError,
  deleteBookingCache,
  findCachedBookingSearch,
  listBookingCacheFiles,
  peekBookingCache,
  readBookingCache,
  writeBookingCache,
} from "@/lib/server/booking-disk-cache";
import {
  type HotelRoomsProviderResult,
  bookingQuotaCooling,
  roomsLanguage,
  searchHotelDestination,
  searchHotels,
  toIsoDate,
} from "@/lib/server/hotel-rooms-provider";
import type { TravelAdvisorHotelCard, TravelAdvisorHotelDetails } from "@/types/travel-advisor";

export type { BookingDest } from "@/lib/booking-dest";

export type BookingHotelListResult = {
  ok: boolean;
  hotels: TravelAdvisorHotelCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  destId: string;
  searchType: string;
  source: "booking";
  cached: boolean;
  quotaLimited?: boolean;
  error: string | null;
  errorCode: "not_configured" | "quota" | "invalid_key" | "search_failed" | "not_subscribed" | null;
};

export { citySlug, destIdForQuery };

let lastBookingList: TravelAdvisorHotelCard[] = [];

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

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function destRows(payload: unknown): Record<string, unknown>[] {
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

export function pickCityDest(payload: unknown, query: string): BookingDest | null {
  const q = citySlug(query);
  let best: BookingDest | null = null;
  let bestScore = 0;
  for (const row of destRows(payload)) {
    const destId = pickString(row.dest_id, row.destId, row.id);
    if (!destId || destId === "0") continue;
    const kind = pickString(row.search_type, row.dest_type, row.destType, row.type).toUpperCase();
    if (kind === "HOTEL" || kind === "PROPERTY" || kind === "HO") continue;
    const label = pickString(row.city_name, row.name, row.label, row.cc1, row.region).toLowerCase();
    let score = 1;
    if (kind === "CITY" || kind === "CI" || kind === "C") score += 50;
    else if (kind === "DISTRICT") score += 24;
    else if (kind === "REGION" || kind === "LANDMARK") score += 12;
    if (destId.startsWith("-")) score += 20;
    if (label.includes(q) || q.includes(citySlug(label))) score += 16;
    if (score > bestScore) {
      bestScore = score;
      const searchType =
        kind === "DISTRICT" ? "DISTRICT" : kind === "REGION" ? "REGION" : "CITY";
      best = { destId, searchType };
    }
  }
  return bestScore >= 12 ? best : null;
}

function hotelNodes(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root;
  const bags = [
    data?.hotels,
    data?.result,
    data?.properties,
    data?.data,
    root?.hotels,
    root?.result,
  ];
  const out: Record<string, unknown>[] = [];
  for (const bag of bags) {
    if (!Array.isArray(bag)) continue;
    for (const item of bag) {
      const rec = asRecord(item);
      if (rec) out.push(rec);
    }
    if (out.length) return out;
  }
  return out;
}

function collectHttpUrls(node: unknown, out: string[], depth = 0) {
  if (depth > 5 || out.length >= 12) return;
  if (typeof node === "string" && /^https?:\/\//i.test(node) && /\.(jpe?g|webp|png)|bstatic|images/i.test(node)) {
    if (!out.includes(node)) out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectHttpUrls(item, out, depth + 1);
    return;
  }
  const rec = asRecord(node);
  if (!rec) return;
  for (const key of Object.keys(rec)) {
    if (/url|photo|image|src/i.test(key)) collectHttpUrls(rec[key], out, depth + 1);
  }
}

function classStars(...values: unknown[]): number {
  for (const value of values) {
    const n =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value.replace(/[^0-9.]/g, ""))
          : 0;
    if (!Number.isFinite(n) || n <= 0) continue;
    if (n >= 10 && n <= 50) return Math.min(5, Math.round(n / 10));
    if (n >= 1 && n <= 5) return Math.round(n);
  }
  return 0;
}

function parseStarsFromText(text: string): number {
  const outOf = text.match(
    /(\d)\s*(?:من أصل|out of|-)\s*5(?:\s*(?:نجم|نجمة|star|yıldız|كتصنيف|تصنيف|quality))?/i
  );
  if (outOf) return Math.min(5, Number(outOf[1]) || 0);
  const m = text.match(/(\d)\s*[-–]?\s*(?:star|نجوم|نجمة|yıldız)/i);
  return m ? Math.min(5, Number(m[1])) : 0;
}

/** Booking RapidAPI wrap often has no total_count — city size lives in meta titles. */
const CITY_COUNT_TEXT_RE =
  /(\d[\d.,\u0660-\u0669]*)\s*(?:مكان إقامة|أماكن إقامة|إقامة|accommodations?|properties|hotels?|konaklama|tesis|otel)/i;

function parseCityCountText(text: string): number {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return 0;
  const match = raw.match(CITY_COUNT_TEXT_RE);
  if (!match) return 0;
  const n = Number(match[1].replace(/[^\d\u0660-\u0669]/g, "").replace(/[\u0660-\u0669]/g, (ch) =>
    String(ch.charCodeAt(0) - 0x0660)
  ));
  return Number.isFinite(n) && n > 50 && n < 200000 ? Math.round(n) : 0;
}

function isPageSizedTotal(n: number): boolean {
  return n > 0 && n <= 50;
}

function extractSearchTotal(payload: unknown): number {
  let best = 0;
  const visit = (node: unknown, key: string, depth: number) => {
    if (depth > 8 || best > 50000) return;
    if (typeof node === "number" && Number.isFinite(node) && node > 20 && node < 200000) {
      if (
        /^(total_count|totalcount|primary_count|primarycount|unfiltered_count|unfilteredcount|count|nb_hotels|nbhotels|result_count|results_count)$/i.test(
          key
        )
      ) {
        best = Math.max(best, Math.round(node));
      }
    }
    if (typeof node === "string") {
      const fromTitle = parseCityCountText(node);
      if (fromTitle) best = Math.max(best, fromTitle);
      const n = Number(node.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(n) && n > 20 && n < 200000 && /count/i.test(key)) {
        best = Math.max(best, Math.round(n));
      }
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item, key, depth + 1);
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    for (const childKey of Object.keys(rec)) {
      visit(rec[childKey], childKey, depth + 1);
    }
  };
  visit(payload, "", 0);
  const root = asRecord(payload);
  const data = asRecord(root?.data) || root;
  const metas = [data?.meta, root?.meta];
  for (const meta of metas) {
    if (Array.isArray(meta)) {
      for (const item of meta) {
        const rec = asRecord(item);
        best = Math.max(best, parseCityCountText(pickString(rec?.title, rec?.text, rec?.label, item)));
      }
    } else {
      const rec = asRecord(meta);
      if (rec) best = Math.max(best, parseCityCountText(pickString(rec.title, rec.text, rec.label)));
    }
  }
  return best;
}

function maxPropertyPosition(payload: unknown): number {
  let maxPos = 0;
  for (const node of hotelNodes(payload)) {
    const property = asRecord(node.property) || node;
    const pos = pickNumber(property.position, node.position);
    if (pos > maxPos) maxPos = pos;
  }
  return maxPos;
}

function destCityTotalKey(destId: string): string {
  return `city-total-${String(destId || "").replace(/^-/, "")}`;
}

function cityTotalKey(input: {
  destId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  lang?: string;
}): string {
  return [
    "city-total",
    input.destId.replace(/^-/, ""),
    toIsoDate(input.checkIn),
    toIsoDate(input.checkOut),
    String(input.adults || 2),
    String(input.rooms || 1),
    roomsLanguage(input.lang),
  ].join("-");
}

async function scanCachedSearchTotal(input: {
  destId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  lang?: string;
}): Promise<number> {
  const seen = new Set<string>();
  let lastCount = 0;
  let lastFull = false;
  let maxExtracted = 0;
  for (let page = 0; page < 24; page += 1) {
    const key = listCacheKey({ ...input, page });
    const cached = await peekBookingCache<BookingHotelListResult>(key);
    const raw = await peekBookingCache<unknown>(`raw-${key}`);
    if (!cached?.hotels?.length && !raw) {
      if (page > 0 && !seen.size) continue;
      if (page > 2 && lastCount > 0 && !lastFull) break;
      if (page > 3 && !cached && !raw) break;
      continue;
    }
    const hotels = cached?.hotels || [];
    for (const hotel of hotels) seen.add(hotel.id);
    lastCount = hotels.length;
    lastFull = hotels.length >= 18;
    if (raw) {
      maxExtracted = Math.max(maxExtracted, extractSearchTotal(raw));
      const pos = maxPropertyPosition(raw);
      if (pos >= 20) maxExtracted = Math.max(maxExtracted, pos + 1);
    }
  }
  if (maxExtracted > 50) return maxExtracted;
  if (seen.size && !lastFull) return seen.size;
  return Math.max(seen.size, maxExtracted);
}

async function resolveCityTotal(input: {
  destId: string;
  searchType: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  lang?: string;
  page: number;
  payload: unknown;
  pageHotels: number;
}): Promise<number> {
  const destKey = destCityTotalKey(input.destId);
  const rememberedDest = (await peekBookingCache<number>(destKey)) || 0;
  const rememberedStay = (await peekBookingCache<number>(cityTotalKey(input))) || 0;
  const fromPayload = extractSearchTotal(input.payload);
  let fromPage0 = 0;
  if (fromPayload <= 50 || rememberedDest <= 50) {
    const page0Raw = await peekBookingCache<unknown>(
      `raw-${listCacheKey({ ...input, page: 0 })}`
    );
    fromPage0 = extractSearchTotal(page0Raw);
  }
  const seed = Math.max(seededCityTotal(input.destId), rememberedDest, rememberedStay);
  const locked = Math.max(
    rememberedDest > 50 ? rememberedDest : 0,
    isPageSizedTotal(fromPayload) ? 0 : fromPayload,
    isPageSizedTotal(fromPage0) ? 0 : fromPage0,
    seed > 50 ? seed : 0
  );
  let total = locked;
  if (total <= 50 && input.page === 0) {
    const scanned = await scanCachedSearchTotal(input);
    const pos = maxPropertyPosition(input.payload);
    total = Math.max(
      total,
      isPageSizedTotal(scanned) ? 0 : scanned,
      pos >= 50 ? pos + 1 : 0,
      rememberedStay > 50 ? rememberedStay : 0
    );
  }
  total = Math.max(total, seed > 50 ? seed : 0);
  if (total > 50) {
    await writeBookingCache(destKey, total);
    await writeBookingCache(cityTotalKey(input), total);
  }
  return total;
}

function parseUnitLabel(raw: string): { roomType: string; bedType: string } {
  const lines = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\n+/)
    .map((line) => stripHtml(line))
    .filter(Boolean);
  return {
    roomType: lines[0] || "",
    bedType: lines.slice(1).join(" · "),
  };
}

function priceFromCard(
  node: Record<string, unknown>,
  property: Record<string, unknown>,
  nights: number
): {
  nightly: number | null;
  totalStay: number | null;
  original: number | null;
  currency: string;
  priceIsStayTotal: boolean;
} {
  const breakdown =
    asRecord(property.priceBreakdown) ||
    asRecord(property.price_breakdown) ||
    asRecord(node.composite_price_breakdown) ||
    asRecord(node.price_breakdown) ||
    asRecord(node.priceBreakdown);
  const gross =
    asRecord(breakdown?.grossPrice) ||
    asRecord(breakdown?.gross_price) ||
    asRecord(breakdown?.gross_amount) ||
    asRecord(breakdown?.all_inclusive_amount);
  const perNight =
    asRecord(breakdown?.gross_amount_per_night) ||
    asRecord(breakdown?.net_amount_per_night) ||
    asRecord(property.pricePerNight);
  const strike =
    asRecord(breakdown?.strikethroughPrice) ||
    asRecord(breakdown?.strikethrough_price) ||
    asRecord(property.strikethroughPrice);
  const amount =
    pickNumber(
      perNight?.value,
      gross?.value,
      breakdown?.all_inclusive_price,
      node.min_total_price,
      node.price,
      property.price
    ) || 0;
  const stayHint =
    pickNumber(gross?.value, breakdown?.all_inclusive_price, node.min_total_price) || null;
  const nightlyHint = pickNumber(perNight?.value) || null;
  const resolved = resolveStayPrices(
    nightlyHint || amount || null,
    nights,
    stayHint && stayHint !== nightlyHint ? stayHint : null
  );
  return {
    nightly: resolved.nightly,
    totalStay: resolved.totalStay,
    original: pickNumber(strike?.value) || null,
    currency:
      pickString(
        perNight?.currency,
        gross?.currency,
        breakdown?.currency,
        property.currency,
        node.currency_code,
        node.currency
      ) || "USD",
    priceIsStayTotal: resolved.priceIsStayTotal,
  };
}

function boolish(...values: unknown[]): boolean {
  return values.some((value) => value === true || value === 1 || value === "1");
}

function walkFlags(node: unknown): {
  breakfast: boolean;
  cancel: boolean;
  nonRefundable: boolean;
  roomType: string;
  bedType: string;
  amenities: string[];
} {
  const amenities: string[] = [];
  let breakfast = false;
  let cancel = false;
  let nonRefundable = false;
  let roomType = "";
  let bedType = "";
  const visit = (value: unknown, depth = 0) => {
    if (depth > 4) return;
    if (typeof value === "string") {
      const text = stripHtml(value);
      if (!text) return;
      if (/breakfast|إفطار|kahvaltı/i.test(text)) breakfast = true;
      if (/non.?refund|غير قابل للإلغاء|غير قابل للاسترداد|iade yok/i.test(text)) nonRefundable = true;
      else if (/free cancellation|إلغاء مجاني|ücretsiz iptal|\brefundable\b/i.test(text)) cancel = true;
      if (!roomType && /room|suite|غرفة|جناح|oda/i.test(text) && text.length < 80) {
        roomType = text;
      }
      if (!bedType && /bed|سرير|yatak/i.test(text) && text.length < 80) {
        bedType = text;
      }
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    const rec = asRecord(value);
    if (!rec) return;
    if (rec.refundable === 0 || rec.is_free_cancellable === 0 || rec.has_free_cancellation === 0) {
      nonRefundable = true;
    }
    if (rec.refundable === 1 || rec.is_free_cancellable === 1 || rec.has_free_cancellation === 1) {
      cancel = true;
    }
    const label = pickString(rec.text, rec.name, rec.title, rec.identifier, rec.explanation);
    if (label) {
      visit(label, depth + 1);
      if (
        /wifi|breakfast|pool|parking|spa|إفطار|مسبح|واي/i.test(label) &&
        label.length < 48 &&
        !amenities.includes(label)
      ) {
        amenities.push(label);
      }
    }
    for (const key of Object.keys(rec)) {
      if (
        /access|badge|benefit|ribbon|meal|board|cancel|refund|unit|room|bed|amenit|facility|label/i.test(
          key
        )
      ) {
        visit(rec[key], depth + 1);
      }
    }
  };
  visit(node);
  return { breakfast, cancel, nonRefundable, roomType, bedType, amenities };
}

export function mapSearchHotelCard(
  node: Record<string, unknown>,
  nights: number,
  cityFallback: string
): TravelAdvisorHotelCard | null {
  const property = asRecord(node.property) || asRecord(node.hotel) || node;
  const id = pickString(
    node.hotel_id,
    node.hotelId,
    property.hotel_id,
    property.id,
    node.id
  );
  if (!id || id.startsWith("-")) return null;
  const name = pickString(
    property.name,
    node.hotel_name,
    node.hotel_name_trans,
    node.name,
    property.hotel_name
  );
  if (!name) return null;

  const access = pickString(
    node.accessibilityLabel,
    node.accessibility_label,
    property.accessibilityLabel
  );
  const unit = parseUnitLabel(
    pickString(
      node.unit_configuration_label,
      node.unitConfigurationLabel,
      property.unit_configuration_label,
      node.accommodation_type_name,
      property.accommodation_type_name,
      node.roomName,
      node.room_name,
      property.roomName,
      node.unitType
    )
  );
  const location = asRecord(property.location) || asRecord(node.location) || {};
  const flags = walkFlags({
    access,
    badges: property.priceBreakdown || node.composite_price_breakdown,
    ribbon: node.ribbon_text,
    benefits: asRecord(property.priceBreakdown)?.benefitBadges,
    extra: node.hotel_include_breakfast,
    mealplan: node.mealplan || property.mealplan,
    highlighted: property.highlighted_amenities || node.highlighted_amenities,
    loyalty: property.loyaltyRewards || node.loyaltyRewards,
  });
  const prices = priceFromCard(node, property, nights);
  const photos: string[] = [];
  const photoBags = [
    property.photoUrls,
    property.photo_urls,
    node.max_1440_photo_url,
    node.max_photo_url,
    node.main_photo_url,
    property.main_photo_url,
  ];
  for (const bag of photoBags) {
    if (typeof bag === "string" && /^https?:\/\//i.test(bag) && !photos.includes(bag)) photos.push(bag);
    else if (Array.isArray(bag)) {
      for (const item of bag) {
        if (typeof item === "string" && /^https?:\/\//i.test(item) && !photos.includes(item)) {
          photos.push(item);
        }
      }
    }
  }
  collectHttpUrls(property, photos);
  const uniquePhotos = uniqueHotelPhotoUrls(photos).slice(0, 8);
  const city = pickString(
    location.city,
    property.wishlistName,
    node.city_name_en,
    node.city_trans,
    node.city,
    property.city,
    cityFallback
  );
  const parsedAccess = parseBookingAccessLabel(access, name, city);
  const neighborhood = pickString(
    node.district,
    node.district_trans,
    property.district,
    location.district,
    node.quarter,
    node.neighborhood,
    property.neighborhood,
    location.neighborhood,
    parsedAccess.neighborhood
  );
  const address = pickString(
    node.address,
    node.address1,
    node.address_trans,
    property.address,
    property.address1,
    node.address_en,
    location.address,
    parsedAccess.address
  );
  const zip = pickString(node.zip, property.zip, location.zip);
  const street = [address, zip].filter(Boolean).join(" ");
  const stars =
    classStars(
      property.accuratePropertyClass,
      property.propertyClass,
      property.qualityClass,
      node.class,
      node.hotel_class,
      node.stars,
      node.hotel_class_text
    ) ||
    parsedAccess.stars ||
    parseStarsFromText(`${name} ${access}`);
  const rating = pickNumber(
    property.reviewScore,
    node.review_score,
    property.review_score,
    node.reviewScore
  );
  const reviewCount = Math.round(
    pickNumber(property.reviewCount, node.review_nr, node.review_count, property.review_nr)
  );
  const breakfast =
    flags.breakfast ||
    parsedAccess.breakfast ||
    boolish(
      node.hotel_include_breakfast,
      node.breakfast_included,
      node.is_breakfast_included,
      property.is_breakfast_included
    );
  const cancellation =
    flags.cancel ||
    parsedAccess.cancel ||
    boolish(
      node.is_free_cancellable,
      node.has_free_cancellation,
      node.refundable,
      property.isFreeCancellable,
      property.is_free_cancellable
    );
  const nonRefundable =
    !cancellation &&
    (flags.nonRefundable ||
      node.refundable === 0 ||
      property.is_free_cancellable === 0 ||
      node.is_free_cancellable === 0);
  const checkinNode = asRecord(property.checkin) || asRecord(node.checkin);
  const checkoutNode = asRecord(property.checkout) || asRecord(node.checkout);
  const checkInTime = pickString(checkinNode?.fromTime, checkinNode?.from);
  const checkOutTime = pickString(checkoutNode?.untilTime, checkoutNode?.until);
  const roomType = unit.roomType || parsedAccess.roomType || flags.roomType;
  const bedType = unit.bedType || parsedAccess.bedType || flags.bedType;
  const amenities = [
    ...flags.amenities,
    ...(breakfast ? ["Breakfast included"] : []),
    ...(cancellation ? ["Free cancellation"] : []),
  ];
  const roundedDiscount =
    prices.original && prices.nightly && prices.original > prices.nightly
      ? ([5, 10, 15] as const).reduce((best, pct) => {
          const target = prices.nightly! / (1 - pct / 100);
          return Math.abs(target - prices.original!) < Math.abs((prices.nightly! / (1 - best / 100)) - prices.original!)
            ? pct
            : best;
        }, 5 as 5 | 10 | 15)
      : 0;
  const distanceText = pickString(
    parsedAccess.distanceText,
    node.distance_to_cc,
    node.distance,
    asRecord(Array.isArray(node.distances) ? node.distances[0] : null)?.text
  );
  const locationText = [fullLocationText({ neighborhood, address: street, city }), distanceText]
    .filter(Boolean)
    .filter((part, idx, all) => all.findIndex((p) => p.toLowerCase() === part.toLowerCase()) === idx)
    .join(" · ");
  return enrichListCard({
    id,
    name,
    city,
    country: pickString(property.countryCode, node.country_trans, node.cc1, node.country).toUpperCase(),
    neighborhood,
    stars,
    rating,
    reviewCount,
    image: uniquePhotos[0] || "",
    images: uniquePhotos.slice(0, 8),
    badges: amenities.slice(0, 4),
    snippet: access.slice(0, 800),
    priceFrom: prices.nightly,
    priceOriginal: prices.original,
    currency: prices.currency,
    lat: pickNumber(property.latitude, node.latitude, location.latitude),
    lng: pickNumber(property.longitude, node.longitude, location.longitude),
    address: street,
    locationText,
    roomType,
    bedType,
    cancellation: cancellation ? "Free cancellation" : nonRefundable ? "Non-refundable" : "",
    amenities: amenities.slice(0, 8),
    distanceText,
    nightly: prices.nightly,
    totalStay: prices.totalStay,
    priceIsStayTotal: prices.priceIsStayTotal,
    nights,
    discountPct: prices.original && prices.nightly && prices.original > prices.nightly ? roundedDiscount : 0,
    hurryLeft:
      Math.round(pickNumber(node.urgency_room_msg ? 2 : 0, node.rooms_left, property.roomsLeft)) ||
      parsedAccess.hurryLeft,
    bookingHotelId: id,
    source: "booking",
    breakfastIncluded: breakfast,
    noPrepayment: parsedAccess.noPrepayment,
    nonRefundable,
    checkInTime,
    checkOutTime,
  });
}

function listCacheKey(input: {
  destId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  page: number;
  lang?: string;
}): string {
  return [
    "search",
    String(input.destId || "").replace(/^-/, ""),
    toIsoDate(input.checkIn),
    toIsoDate(input.checkOut),
    String(input.adults || 2),
    String(input.rooms || 1),
    String(input.page || 0),
    roomsLanguage(input.lang),
  ].join("-");
}

function hotelLooksLikeCity(hotel: TravelAdvisorHotelCard, slug: string): boolean {
  const blob = `${hotel.city} ${hotel.locationText} ${hotel.neighborhood} ${hotel.name}`;
  if (slug === "istanbul") return /istanbul|إسطنبول|اسطنبول|i̇stanbul/i.test(blob);
  if (slug === "antalya") return /antalya|أنطاليا|انطاليا|antalia/i.test(blob);
  if (slug === "izmir") return /izmir|izmır|إزمير|ازمير|İzmir/i.test(blob);
  if (slug === "trabzon") return /trabzon|طرابزون/i.test(blob);
  return citySlug(hotel.city) === slug || citySlug(blob) === slug;
}

function hotelsBelongToQuery(hotels: TravelAdvisorHotelCard[], query: string): boolean {
  const slug = citySlug(query);
  if (!slug || !hotels.length) return true;
  if (!SEEDED_DEST[slug]) return true;
  const sample = hotels.slice(0, 8);
  const own = sample.filter((hotel) => hotelLooksLikeCity(hotel, slug)).length;
  return own >= Math.ceil(sample.length / 2);
}

async function leftoverCardsForQuery(query: string): Promise<TravelAdvisorHotelCard[]> {
  const slug = citySlug(query);
  if (!slug) return [];
  const names = await listBookingCacheFiles("card-");
  const hotels: TravelAdvisorHotelCard[] = [];
  for (const name of names) {
    const id = name.replace(/^card-/, "").replace(/\.json$/, "");
    const card = await peekBookingCache<TravelAdvisorHotelCard>(`card-${id}`);
    if (!card?.id || !card.name) continue;
    if (!hotelLooksLikeCity(card, slug)) continue;
    hotels.push(enrichListCard(card));
    if (hotels.length >= 80) break;
  }
  return hotels;
}

function listResult(input: {
  dest: BookingDest;
  hotels: TravelAdvisorHotelCard[];
  totalCount: number;
  page: number;
  cached: boolean;
  hasMore?: boolean;
  quotaLimited?: boolean;
  error?: string | null;
  errorCode?: BookingHotelListResult["errorCode"];
}): BookingHotelListResult {
  const hotels = input.hotels;
  lastBookingList = hotels;
  const cityTotal = Math.max(input.totalCount || 0, hotels.length);
  const pageEnd = (input.page + 1) * 20;
  return {
    ok: hotels.length > 0,
    hotels,
    totalCount: cityTotal,
    page: input.page,
    pageSize: 20,
    hasMore:
      input.hasMore ??
      (cityTotal > pageEnd || (hotels.length >= 18 && cityTotal > hotels.length)),
    destId: input.dest.destId,
    searchType: input.dest.searchType,
    source: "booking",
    cached: input.cached,
    quotaLimited: Boolean(input.quotaLimited),
    error: hotels.length ? null : input.error || null,
    errorCode: hotels.length ? null : input.errorCode || null,
  };
}

export function peekCachedBookingList(): TravelAdvisorHotelCard[] {
  return lastBookingList.map(enrichListCard);
}

export async function loadCachedHotelCard(hotelId: string): Promise<TravelAdvisorHotelCard | null> {
  const id = String(hotelId || "").trim();
  if (!id) return null;
  const memory = lastBookingList.find((h) => h.id === id || h.bookingHotelId === id);
  if (memory) return enrichListCard(memory);
  const disk = await readBookingCache<TravelAdvisorHotelCard>(`card-${id}`, BOOKING_DEST_TTL_MS);
  return disk ? enrichListCard(disk) : null;
}

export async function persistHotelCard(card: TravelAdvisorHotelCard): Promise<void> {
  const id = card.bookingHotelId || card.id;
  if (!id) return;
  await writeBookingCache(`card-${id}`, card);
}

async function hydrateListPhotos(hotels: TravelAdvisorHotelCard[]): Promise<TravelAdvisorHotelCard[]> {
  return Promise.all(
    hotels.map(async (hotel) => {
      const extra = await peekBookingCache<string[]>(`photos-${hotel.bookingHotelId || hotel.id}`);
      if (!extra?.length) return hotel;
      const images = uniqueHotelPhotoUrls([hotel.image, ...(hotel.images || []), ...extra]).slice(0, 8);
      return { ...hotel, image: images[0] || hotel.image, images };
    })
  );
}

export async function resolveBookingDestId(input: {
  query: string;
  destId?: string;
  lang?: string;
}): Promise<BookingDest | null> {
  const query = (input.query || "").trim();
  const slug = citySlug(query);
  await deleteBookingCache("dest");
  const seeded = seededDestForQuery(query);
  if (seeded) {
    if (slug) await writeBookingCache(`dest-${slug}`, seeded);
    return seeded;
  }
  const matched = destForQuery(query, input.destId);
  if (matched) {
    if (slug) await writeBookingCache(`dest-${slug}`, matched);
    return matched;
  }
  if (slug) {
    const cached = await readBookingCache<BookingDest>(`dest-${slug}`, BOOKING_DEST_TTL_MS);
    const allowed = destIdForQuery(query, cached?.destId);
    if (allowed) {
      return { destId: allowed, searchType: cached?.searchType || "CITY" };
    }
  }
  if (!query || bookingQuotaCooling()) return null;
  const searched = await searchHotelDestination({
    query,
    languagecode: roomsLanguage(input.lang),
  });
  if (!searched.ok) return null;
  const dest = pickCityDest(searched.payload, query);
  if (!dest) return null;
  if (slug) await writeBookingCache(`dest-${slug}`, dest);
  return dest;
}

async function leftoverListForDest(
  dest: BookingDest,
  query: string,
  cacheKey: string
): Promise<TravelAdvisorHotelCard[]> {
  const stale = await peekBookingCache<BookingHotelListResult>(cacheKey);
  if (
    stale?.hotels?.length &&
    !bookingCacheLooksLikeError(stale) &&
    hotelsBelongToQuery(stale.hotels, query)
  ) {
    return stale.hotels.map(enrichListCard);
  }
  const anyCached = (await findCachedBookingSearch(dest.destId)) as BookingHotelListResult | null;
  if (anyCached?.hotels?.length && hotelsBelongToQuery(anyCached.hotels, query)) {
    return anyCached.hotels.map(enrichListCard);
  }
  return leftoverCardsForQuery(query);
}

const PAGE_SIZE = 20;
const liveSearchInflight = new Map<string, Promise<Awaited<ReturnType<typeof searchHotels>>>>();

async function liveSearchHotelsPage(input: {
  dest: BookingDest;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  childrenAges?: string;
  lang?: string;
  page: number;
}): Promise<Awaited<ReturnType<typeof searchHotels>>> {
  const key = listCacheKey({
    destId: input.dest.destId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    rooms: input.rooms,
    page: input.page,
    lang: input.lang,
  });
  const existing = liveSearchInflight.get(key);
  if (existing) return existing;
  const work = searchHotels({
    destId: input.dest.destId,
    searchType: input.dest.searchType,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    childrenAges: input.childrenAges,
    roomQty: input.rooms,
    pageNumber: Math.max(1, Math.floor(input.page) + 1),
    lang: input.lang,
  }).finally(() => {
    liveSearchInflight.delete(key);
  });
  liveSearchInflight.set(key, work);
  return work;
}

async function rememberedCityTotalFor(input: {
  destId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  lang?: string;
  query: string;
}): Promise<number> {
  const destRemembered = (await peekBookingCache<number>(destCityTotalKey(input.destId))) || 0;
  const stayRemembered = (await peekBookingCache<number>(cityTotalKey(input))) || 0;
  return Math.max(
    destRemembered > 50 ? destRemembered : 0,
    stayRemembered > 50 ? stayRemembered : 0,
    seededCityTotal(input.destId),
    seededCityTotal(input.query)
  );
}

function slicePage(hotels: TravelAdvisorHotelCard[], page: number): TravelAdvisorHotelCard[] {
  const start = Math.max(0, page) * PAGE_SIZE;
  return hotels.slice(start, start + PAGE_SIZE);
}

function prefetchNextBookingPage(input: {
  query: string;
  destId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  childrenAges?: string;
  lang?: string;
  page: number;
}) {
  if (bookingQuotaCooling()) return;
  void listBookingHotels({ ...input, page: input.page + 1 }).catch(() => undefined);
}

export async function listBookingHotels(input: {
  query: string;
  destId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  childrenAges?: string;
  lang?: string;
  page: number;
}): Promise<BookingHotelListResult> {
  const dest = await resolveBookingDestId({
    query: input.query,
    destId: input.destId,
    lang: input.lang,
  });
  if (!dest) {
    const leftover = await leftoverCardsForQuery(input.query);
    if (leftover.length) {
      const pageHotels = slicePage(leftover, input.page);
      const cityTotal = Math.max(seededCityTotal(input.query), leftover.length);
      console.info("[booking-search]", JSON.stringify({ q: input.query, destId: "", via: "cards", hotels: pageHotels.length, pool: leftover.length }));
      return listResult({
        dest: { destId: "", searchType: "CITY" },
        hotels: pageHotels,
        totalCount: cityTotal,
        page: input.page,
        cached: true,
        hasMore: leftover.length > (input.page + 1) * PAGE_SIZE || cityTotal > leftover.length,
      });
    }
    console.info("[booking-search]", JSON.stringify({ q: input.query, destId: "", via: "no-dest" }));
    return {
      ok: false,
      hotels: [],
      totalCount: 0,
      page: input.page,
      pageSize: 20,
      hasMore: false,
      destId: "",
      searchType: "CITY",
      source: "booking",
      cached: false,
      error: "dest_id missing",
      errorCode: "search_failed",
    };
  }

  const cacheKey = listCacheKey({
    destId: dest.destId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    rooms: input.rooms,
    page: input.page,
    lang: input.lang,
  });
  const cached = await readBookingCache<BookingHotelListResult>(cacheKey, BOOKING_LIST_TTL_MS);
  if (
    cached?.hotels?.length &&
    !bookingCacheLooksLikeError(cached) &&
    hotelsBelongToQuery(cached.hotels, input.query)
  ) {
    const raw = await peekBookingCache<unknown>(`raw-${cacheKey}`);
    const remapped = raw
      ? hotelNodes(raw)
          .map((node) => mapSearchHotelCard(node, nightsBetween(input.checkIn, input.checkOut), input.query))
          .filter((card): card is TravelAdvisorHotelCard => Boolean(card))
      : cached.hotels.map(enrichListCard);
    const hotels = await hydrateListPhotos(remapped.length ? remapped : cached.hotels.map(enrichListCard));
    const totalCount = await resolveCityTotal({
      destId: dest.destId,
      searchType: dest.searchType,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      rooms: input.rooms,
      lang: input.lang,
      page: input.page,
      payload: raw,
      pageHotels: hotels.length,
    });
    console.info("[booking-search]", JSON.stringify({ q: input.query, destId: dest.destId, via: "cache", hotels: hotels.length, totalCount }));
    const cachedResult = listResult({ dest, hotels, totalCount, page: input.page, cached: true });
    if (cachedResult.hasMore && input.page === 0) prefetchNextBookingPage(input);
    return cachedResult;
  }

  const skipLive = bookingQuotaCooling();
  const fetched = skipLive
    ? null
    : await liveSearchHotelsPage({
        dest,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        rooms: input.rooms,
        childrenAges: input.childrenAges,
        lang: input.lang,
        page: input.page,
      });

  if (!fetched || !fetched.ok) {
    const leftover = await leftoverListForDest(dest, input.query, cacheKey);
    if (leftover.length) {
      const pool = leftover.filter((hotel) => hotelsBelongToQuery([hotel], input.query));
      const hotels = await hydrateListPhotos(slicePage(pool.length ? pool : leftover, input.page));
      const cityTotal = Math.max(
        await rememberedCityTotalFor({
          destId: dest.destId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          adults: input.adults,
          rooms: input.rooms,
          lang: input.lang,
          query: input.query,
        }),
        leftover.length
      );
      console.info(
        "[booking-search]",
        JSON.stringify({
          q: input.query,
          destId: dest.destId,
          via: skipLive ? "cooldown-leftover" : "live-fail-leftover",
          hotels: hotels.length,
          totalCount: cityTotal,
          liveStatus: fetched?.status ?? 429,
        })
      );
      return listResult({
        dest,
        hotels,
        totalCount: cityTotal,
        page: input.page,
        cached: true,
        quotaLimited: fetched?.errorCode === "quota" || fetched?.status === 429 || skipLive,
        hasMore: leftover.length > (input.page + 1) * PAGE_SIZE || cityTotal > leftover.length,
      });
    }
    console.info(
      "[booking-search]",
      JSON.stringify({
        q: input.query,
        destId: dest.destId,
        via: "live-fail",
        liveStatus: fetched?.status ?? 429,
        errorCode: fetched?.errorCode || "quota",
      })
    );
    return {
      ok: false,
      hotels: [],
      totalCount: 0,
      page: input.page,
      pageSize: 20,
      hasMore: false,
      destId: dest.destId,
      searchType: dest.searchType,
      source: "booking",
      cached: false,
      error: fetched?.body || "searchHotels failed",
      errorCode: fetched?.errorCode || "quota",
    };
  }

  const nights = nightsBetween(input.checkIn, input.checkOut);
  const nodes = hotelNodes(fetched.payload);
  const mapped = nodes
    .map((node) => mapSearchHotelCard(node, nights, input.query))
    .filter((card): card is TravelAdvisorHotelCard => Boolean(card));
  const hotels = await hydrateListPhotos(mapped);

  if (!hotels.length || !hotelsBelongToQuery(hotels, input.query)) {
    const leftover = await leftoverListForDest(dest, input.query, cacheKey);
    if (leftover.length) {
      const fallback = await hydrateListPhotos(leftover);
      console.info(
        "[booking-search]",
        JSON.stringify({
          q: input.query,
          destId: dest.destId,
          via: "parse-leftover",
          nodes: nodes.length,
          hotels: fallback.length,
        })
      );
      const cityTotal = Math.max(
        await rememberedCityTotalFor({
          destId: dest.destId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          adults: input.adults,
          rooms: input.rooms,
          lang: input.lang,
          query: input.query,
        }),
        leftover.length
      );
      return listResult({
        dest,
        hotels: slicePage(fallback, input.page),
        totalCount: cityTotal,
        page: input.page,
        cached: true,
        hasMore: leftover.length > (input.page + 1) * PAGE_SIZE || cityTotal > leftover.length,
      });
    }
    console.info(
      "[booking-search]",
      JSON.stringify({ q: input.query, destId: dest.destId, via: "parse-empty", nodes: nodes.length })
    );
    return {
      ok: false,
      hotels: [],
      totalCount: 0,
      page: input.page,
      pageSize: 20,
      hasMore: false,
      destId: dest.destId,
      searchType: dest.searchType,
      source: "booking",
      cached: false,
      error: "search parse empty",
      errorCode: "search_failed",
    };
  }

  const totalCount = await resolveCityTotal({
    destId: dest.destId,
    searchType: dest.searchType,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    rooms: input.rooms,
    lang: input.lang,
    page: input.page,
    payload: fetched.payload,
    pageHotels: hotels.length,
  });

  const result = listResult({ dest, hotels, totalCount, page: input.page, cached: false });
  console.info("[booking-search]", JSON.stringify({ q: input.query, destId: dest.destId, via: "live", hotels: hotels.length, totalCount }));
  await writeBookingCache(cacheKey, result);
  await writeBookingCache(`raw-${cacheKey}`, fetched.payload);
  await Promise.all(hotels.map((card) => persistHotelCard(card)));
  if (result.hasMore && input.page === 0) prefetchNextBookingPage(input);
  return result;
}

export function mergeBookingHotelDetails(input: {
  hotelId: string;
  card?: TravelAdvisorHotelCard | null;
  rooms: HotelRoomsProviderResult;
  nights: number;
}): TravelAdvisorHotelDetails {
  const card = input.card;
  const meta = input.rooms.hotelMeta;
  const images = Array.from(
    new Set([...(input.rooms.photos || []), ...(card?.images || []), card?.image || ""])
  ).filter(Boolean);
  const nightly = card?.nightly ?? card?.priceFrom ?? input.rooms.rooms.find((r) => r.nightly)?.nightly ?? null;
  return {
    id: input.hotelId,
    name: meta?.name || card?.name || "Hotel",
    city: meta?.city || card?.city || "",
    country: meta?.country || card?.country || "",
    neighborhood: card?.neighborhood || "",
    stars: meta?.stars || card?.stars || 0,
    rating: meta?.rating || card?.rating || 0,
    reviewCount: meta?.reviewCount || card?.reviewCount || input.rooms.reviews.length,
    image: images[0] || "",
    images,
    badges: card?.badges || [],
    snippet: card?.snippet || "",
    priceFrom: nightly,
    priceOriginal: card?.priceOriginal ?? null,
    currency: card?.currency || "USD",
    lat: meta?.lat || card?.lat || 0,
    lng: meta?.lng || card?.lng || 0,
    address: meta?.address || card?.address || "",
    locationText: meta?.locationText || card?.locationText || "",
    roomType: card?.roomType || "",
    bedType: card?.bedType || "",
    cancellation: card?.cancellation || "",
    nonRefundable: card?.nonRefundable,
    amenities: input.rooms.facilities.length ? input.rooms.facilities : card?.amenities || [],
    distanceText: card?.distanceText || "",
    nightly,
    totalStay: card?.totalStay ?? (nightly != null ? Math.round(nightly * input.nights) : null),
    priceIsStayTotal: card?.priceIsStayTotal || false,
    nights: input.nights,
    discountPct: card?.discountPct || 0,
    hurryLeft: card?.hurryLeft || 0,
    bookingHotelId: input.hotelId,
    source: "booking",
    breakfastIncluded: card?.breakfastIncluded,
    description: input.rooms.description || "",
    highlights: (input.rooms.facilities || []).slice(0, 6),
    reviews: input.rooms.reviews,
    rooms: input.rooms.rooms,
    phone: "",
    ranking: "",
    checkInTime:
      meta?.checkInTime ||
      card?.checkInTime ||
      input.rooms.policies.map((p) => p.match(/check-?in[:\s]+(\d{1,2}:\d{2})/i)?.[1] || "").find(Boolean) ||
      "",
    checkOutTime:
      meta?.checkOutTime ||
      card?.checkOutTime ||
      input.rooms.policies.map((p) => p.match(/check-?out[:\s]+(\d{1,2}:\d{2})/i)?.[1] || "").find(Boolean) ||
      "",
    policies: input.rooms.policies,
    nearbyPlaces: input.rooms.nearbyPlaces,
    questions: input.rooms.questions,
    reviewScores: input.rooms.reviewScores,
    facilityGroups: input.rooms.facilityGroups,
    childrenPolicy: input.rooms.childrenPolicy,
    payment: rejectPayAtPropertyLines(input.rooms.payment || []),
    roomsPendingMatch: false,
  };
}
