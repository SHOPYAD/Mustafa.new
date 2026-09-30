import { listBookingHotels, type BookingHotelListResult } from "@/lib/server/booking-hotel-list";
import { citySlug } from "@/lib/booking-dest";
import type { HotelProvider } from "@/lib/hotels-config";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import {
  applyHotelMarkupToCards,
  bookingEndpointEnabled,
  runtimeHasProvider,
  travelAdvisorEndpointEnabled,
  type HotelsRuntimeSettings,
} from "@/lib/hotels-runtime";
import { listAdvisorScoreHints, listHotels, type TravelAdvisorSearchInput } from "@/lib/server/travel-advisor";
import type { HotelSearchProgress, TravelAdvisorFilterGroup, TravelAdvisorHotelCard } from "@/types/travel-advisor";
import { getProvidersRegistry } from "@/lib/server/providers-registry-store";
import type { HotelSearchCard } from "@/lib/providers/adapters/common/types";
import type { MergedHotel, } from "@/lib/server/hotels/identity-resolver";
import {
  ensureFanOut,
  getSearchSession,
  sessionProgress,
  startOrJoinSearchSession,
  type SearchSession,
  type SupplySearchInput,
} from "@/lib/server/hotels/search-session";
import { BOARD_LABEL_AR, nightsBetween } from "@/lib/server/hotels/normalize";
import { buildSessionFilterGroups, filterMergedHotels } from "@/lib/server/hotels/session-filters";
import { attachCachedReviewScores, persistReviewScore, reviewNameKey } from "@/lib/server/hotels/review-scores-store";
import { scoreOutOf10 } from "@/lib/hotel-offer-copy";

/**
 * Small in-process L1 for public cards (real supplier data only) so the details page can show the
 * exact list price while the full room matrix loads. Sessions in Redis remain the source of truth.
 */
const inMemoryHotelCards = new Map<string, TravelAdvisorHotelCard>();
const IN_MEMORY_LIMIT = 5000;

export function storeInMemoryHotelCard(card: TravelAdvisorHotelCard): void {
  if (!card?.id) return;
  if (inMemoryHotelCards.size > IN_MEMORY_LIMIT) {
    const first = inMemoryHotelCards.keys().next().value;
    if (first) inMemoryHotelCards.delete(first);
  }
  inMemoryHotelCards.set(card.id, card);
  if (card.masterId) inMemoryHotelCards.set(card.masterId, card);
}

export function getInMemoryHotelCard(id: string): TravelAdvisorHotelCard | null {
  if (!id) return null;
  return inMemoryHotelCards.get(id) || null;
}

function cancellationText(hotel: MergedHotel, lang: string): string {
  const plan = hotel.cheapest.ratePlan;
  if (plan?.refundable) {
    if (plan.freeCancellationUntil) {
      const d = new Date(plan.freeCancellationUntil);
      const dateText = Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" });
      return lang === "ar" ? `إلغاء مجاني${dateText ? ` حتى ${dateText}` : ""}` : `Free cancellation${dateText ? ` until ${dateText}` : ""}`;
    }
    return lang === "ar" ? "إلغاء مجاني" : "Free cancellation";
  }
  if (plan && !plan.refundable) return lang === "ar" ? "غير قابل للاسترداد" : "Non-refundable";
  return hotel.freeCancellation ? (lang === "ar" ? "إلغاء مجاني متاح" : "Free cancellation available") : "";
}

function distanceText(m: number | undefined, lang: string): string {
  if (m == null || !Number.isFinite(m)) return "";
  if (m < 1000) return lang === "ar" ? `${m} م من المركز` : `${m} m from centre`;
  const km = (m / 1000).toFixed(1);
  return lang === "ar" ? `${km} كم من المركز` : `${km} km from centre`;
}

/**
 * Converts a merged supplier hotel into the public card shape. No invented values: anything the
 * suppliers did not deliver stays empty/0/null and the UI hides it.
 */
export function mergedHotelToPublicCard(hotel: MergedHotel, sessionId: string, lang = "ar"): TravelAdvisorHotelCard {
  const nights = Math.max(1, hotel.nights || 1);
  const total = hotel.cheapest.price;
  const nightly = total > 0 ? Math.round((total / nights) * 100) / 100 : null;
  const plan = hotel.cheapest.ratePlan;
  const roomGroup = hotel.offers.find((o) => o.id === hotel.cheapest.cardId)?.roomGroups?.find((g) => g.id === plan?.roomGroupId);
  const badges: string[] = [];
  if (hotel.freeCancellation) badges.push(lang === "ar" ? "إلغاء مجاني" : "Free cancellation");
  if (hotel.breakfastIncluded) badges.push(lang === "ar" ? "إفطار مشمول" : "Breakfast included");
  if (hotel.payAtHotel) badges.push(lang === "ar" ? "ادفع في الفندق" : "Pay at hotel");
  if (hotel.offers.length > 1) badges.push(lang === "ar" ? `${hotel.offers.length} عروض` : `${hotel.offers.length} offers`);
  const promo = plan?.promotions?.[0];
  const rating10 = hotel.reviewScore ? (hotel.reviewScore.scale === 5 ? hotel.reviewScore.score * 2 : hotel.reviewScore.score) : 0;

  const card: TravelAdvisorHotelCard = {
    id: hotel.cheapest.cardId,
    masterId: hotel.masterId,
    name: hotel.name,
    city: hotel.city,
    country: hotel.countryCode || "",
    neighborhood: "",
    stars: hotel.stars || 0,
    rating: Math.round(rating10 * 10) / 10,
    reviewCount: hotel.reviewScore?.count || 0,
    reviewScore: hotel.reviewScore,
    image: hotel.images[0] || "",
    images: hotel.images,
    badges,
    snippet: hotel.description ? hotel.description.slice(0, 180) : "",
    priceFrom: nightly,
    priceOriginal: null,
    currency: hotel.cheapest.currency,
    lat: hotel.lat ?? 0,
    lng: hotel.lng ?? 0,
    address: hotel.address || "",
    locationText: hotel.city || "",
    roomType: roomGroup?.name || "",
    bedType: roomGroup?.beds || "",
    cancellation: cancellationText(hotel, lang),
    amenities: hotel.amenities,
    distanceText: distanceText(hotel.distanceFromCenterM, lang),
    distanceFromCenterM: hotel.distanceFromCenterM,
    nightly,
    totalStay: total > 0 ? total : null,
    priceIsStayTotal: true,
    nights,
    discountPct: 0,
    hurryLeft: plan?.remainingRooms && plan.remainingRooms <= 5 ? plan.remainingRooms : 0,
    source: "supplier",
    breakfastIncluded: hotel.breakfastIncluded,
    noPrepayment: hotel.payAtHotel,
    nonRefundable: plan ? !plan.refundable : !hotel.freeCancellation,
    freeCancellation: hotel.freeCancellation,
    payAtHotel: hotel.payAtHotel,
    offerCount: hotel.offers.length,
    offers: hotel.offers.map((o) => ({ supplier: o.provider, id: o.id, total: o.price, currency: o.currency })),
    sessionId,
  };
  if (plan) {
    // Structured facts of the cheapest rate plan (verbatim supplier data, no prices).
    const placeholder = plan.rateType === "RECHECK" && plan.supplierContext?.needsAvailability === "1";
    const offer: NonNullable<TravelAdvisorHotelCard["cheapestOffer"]> = { supplier: plan.supplier };
    if (roomGroup?.name) offer.roomName = roomGroup.name;
    if (roomGroup?.beds) offer.beds = roomGroup.beds;
    if (roomGroup?.sizeSqm) offer.sizeSqm = roomGroup.sizeSqm;
    if (roomGroup?.maxOccupancy) offer.maxOccupancy = roomGroup.maxOccupancy;
    if (!placeholder) {
      offer.board = plan.board;
      if (plan.boardName) offer.boardName = plan.boardName;
      offer.refundable = plan.refundable;
      if (plan.refundable && plan.freeCancellationUntil) offer.freeCancellationUntil = plan.freeCancellationUntil;
      offer.paymentType = plan.paymentType;
    }
    offer.rateType = plan.rateType;
    offer.taxesIncluded = plan.price.taxesIncluded;
    if (plan.remainingRooms != null && plan.remainingRooms > 0) offer.remainingRooms = plan.remainingRooms;
    if (plan.promotions?.length) offer.promotions = plan.promotions.slice(0, 3);
    card.cheapestOffer = offer;
  }
  if (promo && !card.snippet) card.snippet = promo;
  if (plan?.board && plan.board !== "OTHER" && !badges.some((b) => /إفطار|Breakfast/.test(b))) {
    badges.push(lang === "ar" ? BOARD_LABEL_AR[plan.board] : plan.board);
  }
  storeInMemoryHotelCard(card);
  return card;
}

/** Back-compat helper for callers holding a single supplier card. */
export function hotelCardToTravelAdvisor(card: HotelSearchCard, nights: number, sessionId = ""): TravelAdvisorHotelCard {
  const safeNights = Math.max(1, nights || card.nights || 1);
  const plans = card.ratePlans?.length ? card.ratePlans : card.roomGroups?.flatMap((g) => g.ratePlans) || [];
  const plan = plans.length ? plans.reduce((a, b) => (a.price.total <= b.price.total ? a : b)) : undefined;
  const merged: MergedHotel = {
    masterId: card.id,
    name: card.name,
    city: card.city,
    countryCode: card.countryCode,
    address: card.address,
    lat: card.lat,
    lng: card.lng,
    stars: card.stars,
    giataCode: card.giataCode,
    reviewScore: card.reviewScore,
    description: card.description,
    amenities: card.amenities || [],
    images: [card.heroImage, card.image, ...(card.images || [])].filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i),
    offers: [card],
    cheapest: { supplier: card.provider, cardId: card.id, price: card.price, currency: card.currency, ratePlan: plan },
    freeCancellation: plans.some((p) => p.refundable),
    breakfastIncluded: plans.some((p) => ["BB", "HB", "FB", "AI", "UAI"].includes(p.board)),
    payAtHotel: plans.some((p) => p.paymentType === "pay_at_hotel"),
    nights: safeNights,
    checkIn: card.checkIn,
    checkOut: card.checkOut,
  };
  return mergedHotelToPublicCard(merged, sessionId);
}

export type PublicHotelSearchInput = {
  query: string;
  destId?: string;
  geoId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  childrenAges?: string;
  lang?: string;
  currency?: string;
  page: number;
  pageSize?: number;
  sort?: string;
  /** Existing session id (progressive loading / pagination). */
  sid?: string;
  applyRemoteFilters?: boolean;
  filters?: TravelAdvisorSearchInput["filters"];
  stayRooms?: TravelAdvisorSearchInput["rooms"];
  hotelName?: string;
  hotelKey?: string;
  /** Limit the supplier fan-out. The hotels page omits this and uses every enabled provider. */
  onlySuppliers?: Array<"hotelbeds" | "travelport" | "ratehawk" | "seeru">;
};

export type PublicHotelSearchResult = {
  ok: boolean;
  hotels: TravelAdvisorHotelCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  destId: string;
  geoId: string;
  source: "booking" | "travel_advisor" | "owned" | "internal" | "multi" | "supplier";
  cached: boolean;
  quotaLimited: boolean;
  error: string | null;
  errorCode: BookingHotelListResult["errorCode"];
  /** Progressive-search session (supplier mode only). */
  sid?: string;
  progress?: HotelSearchProgress;
  destination?: { nameEn: string; nameAr: string; countryCode: string; lat?: number; lng?: number } | null;
  /** Real filter facets computed from the whole merged result set (supplier mode only). */
  filterGroups?: TravelAdvisorFilterGroup[];
  /** Number of hotels in the session before filters were applied (supplier mode only). */
  unfilteredCount?: number;
};

const DEFAULT_PAGE_SIZE = 20;

function parseChildrenAges(raw?: string): number[] {
  return String(raw || "")
    .split(/[,\s]+/)
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v >= 0 && v < 18);
}

function sortMerged(hotels: MergedHotel[], sort?: string): MergedHotel[] {
  const list = hotels.slice();
  switch (sort) {
    case "price":
      list.sort((a, b) => a.cheapest.price - b.cheapest.price);
      break;
    case "popular":
    case "rating":
      list.sort((a, b) => {
        const ra = a.reviewScore ? (a.reviewScore.scale === 5 ? a.reviewScore.score * 2 : a.reviewScore.score) : 0;
        const rb = b.reviewScore ? (b.reviewScore.scale === 5 ? b.reviewScore.score * 2 : b.reviewScore.score) : 0;
        return rb - ra || (b.reviewScore?.count || 0) - (a.reviewScore?.count || 0) || a.cheapest.price - b.cheapest.price;
      });
      break;
    case "distance":
      list.sort((a, b) => (a.distanceFromCenterM ?? 1e9) - (b.distanceFromCenterM ?? 1e9));
      break;
    default: {
      // "best": completeness (photos, stars, multi-supplier) then value.
      const score = (h: MergedHotel) => {
        let s = 0;
        if (h.images.length >= 3) s += 3;
        else if (h.images.length) s += 1;
        if (h.stars) s += h.stars * 0.6;
        if (h.reviewScore) s += 2 + (h.reviewScore.scale === 5 ? h.reviewScore.score * 2 : h.reviewScore.score) / 5;
        if (h.offers.length > 1) s += 1.5;
        if (h.freeCancellation) s += 0.5;
        if (h.distanceFromCenterM != null) s += Math.max(0, 2 - h.distanceFromCenterM / 5000);
        return s;
      };
      list.sort((a, b) => score(b) - score(a) || a.cheapest.price - b.cheapest.price);
    }
  }
  return list;
}

async function overlayAdvisorDestinationScores(
  cards: TravelAdvisorHotelCard[],
  session: SearchSession,
  runtime: HotelsRuntimeSettings,
  input: PublicHotelSearchInput
): Promise<TravelAdvisorHotelCard[]> {
  if (!travelAdvisorEndpointEnabled(runtime, "hotelsListByLatlng")) return cards;
  const lat = session.destination?.lat;
  const lng = session.destination?.lng;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return cards;
  const hints = await listAdvisorScoreHints({
    lat,
    lng,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    lang: input.lang,
  }).catch(() => []);
  if (!hints.length) return cards;
  return Promise.all(
    cards.map(async (card) => {
      if (card.reviewScore?.score || card.rating > 0) return card;
      const nameKey = reviewNameKey(card.name);
      const match = hints.find((hint) => {
        const hintKey = reviewNameKey(hint.name);
        return hintKey === nameKey || hintKey.includes(nameKey) || nameKey.includes(hintKey);
      });
      if (!match || !(match.rating > 0)) return card;
      const score10 = scoreOutOf10(match.rating, match.rating <= 5 ? 5 : 10);
      void persistReviewScore({
        masterId: card.masterId,
        name: card.name,
        city: card.city,
        taHotelId: match.id,
        score: score10,
        scale: 10,
        count: match.reviewCount,
        source: "tripadvisor",
      });
      return {
        ...card,
        rating: score10,
        reviewCount: match.reviewCount || card.reviewCount || 0,
        reviewScore: {
          source: "tripadvisor",
          score: score10,
          scale: 10,
          count: match.reviewCount || undefined,
        },
      };
    })
  );
}

async function pageSession(session: SearchSession, input: PublicHotelSearchInput, runtime: HotelsRuntimeSettings): Promise<PublicHotelSearchResult> {
  const pageSize = Math.min(50, Math.max(5, input.pageSize || DEFAULT_PAGE_SIZE));
  const page = Math.max(0, input.page || 0);
  const filters = [...(input.filters || [])];
  const hotelName = (input.hotelName || "").trim();
  if (hotelName && !filters.some((f) => f.id === "name" || f.id === "hotelName")) {
    filters.push({ id: "name", value: [hotelName] });
  }
  const filtered = filterMergedHotels(session.hotels, filters);
  const sorted = sortMerged(filtered, input.sort);
  const slice = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const cards = await overlayAdvisorDestinationScores(
    await attachCachedReviewScores(
      applyHotelMarkupToCards(
        slice.map((h) => mergedHotelToPublicCard(h, session.sid, input.lang || "ar")),
        runtime.markupRules
      )
    ),
    session,
    runtime,
    input
  );
  const progress = sessionProgress(session);
  const totalCount = sorted.length;
  const allFailed = progress.complete && progress.stats.filter((s) => !progress.disabled.includes(s.supplier)).every((s) => !s.ok);
  const filterGroups = page === 0 ? buildSessionFilterGroups(session, input.lang) : undefined;
  return {
    ok: !(progress.complete && session.hotels.length === 0 && allFailed),
    hotels: cards,
    totalCount,
    page,
    pageSize,
    hasMore: (page + 1) * pageSize < totalCount || !progress.complete,
    destId: input.destId || "",
    geoId: input.geoId || session.destination?.geoPlaceId || "",
    source: "supplier",
    cached: false,
    quotaLimited: false,
    error: progress.complete && session.hotels.length === 0 ? (allFailed ? progress.stats.find((s) => s.error)?.error || "search_failed" : null) : null,
    errorCode: progress.complete && session.hotels.length === 0 && allFailed ? "search_failed" : null,
    sid: session.sid,
    progress,
    filterGroups,
    unfilteredCount: session.hotels.length,
    destination: session.destination
      ? { nameEn: session.destination.nameEn, nameAr: session.destination.nameAr, countryCode: session.destination.countryCode, lat: session.destination.lat ?? undefined, lng: session.destination.lng ?? undefined }
      : null,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Legacy list providers (Booking/TravelAdvisor RapidAPI feeds). Kept only when no live supplier is
 * enabled — they are display-only and not bookable through our supply chain.
 * ---------------------------------------------------------------------------------------------- */

function hotelDedupeKey(hotel: TravelAdvisorHotelCard): string {
  const bookingId = String(hotel.bookingHotelId || (hotel.source === "booking" ? hotel.id : "")).trim();
  if (bookingId) return `bk:${bookingId}`;
  const name = String(hotel.name || "").toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, " ").replace(/\s+/g, " ").trim();
  return `name:${name}|${citySlug(hotel.city || "")}`;
}

function hotelMatchesQuery(hotel: TravelAdvisorHotelCard, query: string): boolean {
  if (!query) return true;
  const blob = `${hotel.city} ${hotel.locationText} ${hotel.neighborhood} ${hotel.name}`.toLowerCase();
  if (blob.includes(query.toLowerCase())) return true;
  const slug = citySlug(query);
  if (!slug) return true;
  return citySlug(hotel.city) === slug || citySlug(blob) === slug;
}

function hotelMatchesName(hotel: TravelAdvisorHotelCard, hotelName?: string): boolean {
  const needle = (hotelName || "").trim().toLowerCase();
  if (!needle) return true;
  return String(hotel.name || "").toLowerCase().includes(needle);
}

function mergeHotelLists(query: string, groups: TravelAdvisorHotelCard[][], prefer: HotelProvider): TravelAdvisorHotelCard[] {
  const map = new Map<string, TravelAdvisorHotelCard>();
  const ordered = prefer === "travel_advisor" ? [...groups].reverse() : groups;
  for (const group of ordered) {
    for (const hotel of group) {
      if (!hotelMatchesQuery(hotel, query)) continue;
      const key = hotelDedupeKey(hotel);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, hotel);
        continue;
      }
      const existingPrice = existing.priceFrom ?? existing.nightly ?? Infinity;
      const currentPrice = hotel.priceFrom ?? hotel.nightly ?? Infinity;
      const winner = currentPrice < existingPrice ? hotel : existing;
      const loser = winner === hotel ? existing : hotel;
      map.set(key, {
        ...winner,
        images: Array.from(new Set([...(winner.images || []), ...(loser.images || [])])),
        amenities: Array.from(new Set([...(winner.amenities || []), ...(loser.amenities || [])])),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => (a.priceFrom ?? a.nightly ?? 0) - (b.priceFrom ?? b.nightly ?? 0));
}

async function searchBooking(input: PublicHotelSearchInput): Promise<BookingHotelListResult> {
  return listBookingHotels({
    query: input.query,
    destId: input.destId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    rooms: input.rooms,
    childrenAges: input.childrenAges,
    lang: input.lang,
    page: input.page,
  });
}

async function searchTravelAdvisor(input: PublicHotelSearchInput) {
  return listHotels({
    query: input.query,
    geoId: input.geoId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    rooms: input.stayRooms,
    filters: input.applyRemoteFilters ? input.filters : [],
    applyRemoteFilters: Boolean(input.applyRemoteFilters),
    sort: input.sort,
    lang: input.lang,
    page: input.page,
  });
}

async function runLegacyListProviders(runtime: HotelsRuntimeSettings, input: PublicHotelSearchInput): Promise<PublicHotelSearchResult> {
  const bookingOn = runtimeHasProvider(runtime, "booking") && bookingEndpointEnabled(runtime, "searchHotels");
  const taOn = runtimeHasProvider(runtime, "travel_advisor") && travelAdvisorEndpointEnabled(runtime, "hotelsV2List");

  if (runtime.mode === "single" || !(bookingOn && taOn)) {
    if (bookingOn) {
      const booking = await searchBooking(input);
      const hotels = applyHotelMarkupToCards(
        booking.hotels.filter((hotel) => hotelMatchesQuery(hotel, input.query) && hotelMatchesName(hotel, input.hotelName)),
        runtime.markupRules
      );
      return {
        ok: booking.ok || hotels.length > 0,
        hotels,
        totalCount: Math.max(booking.totalCount, hotels.length),
        page: booking.page,
        pageSize: booking.pageSize,
        hasMore: booking.hasMore,
        destId: booking.destId,
        geoId: "",
        source: "booking",
        cached: booking.cached,
        quotaLimited: hotels.length > 0 ? false : Boolean(booking.quotaLimited) || booking.errorCode === "quota",
        error: hotels.length > 0 ? null : booking.error,
        errorCode: hotels.length > 0 ? null : booking.errorCode,
      };
    }
    if (taOn) {
      const result = await searchTravelAdvisor(input);
      const hotels = applyHotelMarkupToCards(
        result.hotels
          .map((hotel) => ({ ...hotel, source: "travel_advisor" as const }))
          .filter((hotel) => hotelMatchesQuery(hotel, input.query) && hotelMatchesName(hotel, input.hotelName)),
        runtime.markupRules
      );
      return {
        ok: true,
        hotels,
        totalCount: Math.max(result.totalCount, hotels.length),
        page: result.page,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
        destId: input.destId || "",
        geoId: input.geoId || "",
        source: "travel_advisor",
        cached: false,
        quotaLimited: false,
        error: null,
        errorCode: null,
      };
    }
    return {
      ok: false,
      hotels: [],
      totalCount: 0,
      page: input.page,
      pageSize: DEFAULT_PAGE_SIZE,
      hasMore: false,
      destId: "",
      geoId: "",
      source: runtime.providers[0] === "owned" ? "owned" : "internal",
      cached: false,
      quotaLimited: false,
      error: "no list provider",
      errorCode: "search_failed",
    };
  }

  const bookingFirst = runtime.providers[0] !== "travel_advisor";
  const [booking, ta] = await Promise.all([bookingOn ? searchBooking(input) : null, taOn ? searchTravelAdvisor(input).catch(() => null) : null]);
  const bookingHotels = booking?.hotels || [];
  const taHotels = (ta?.hotels || []).map((hotel) => ({ ...hotel, source: "travel_advisor" as const }));
  const hotels = applyHotelMarkupToCards(
    mergeHotelLists(input.query, bookingFirst ? [bookingHotels, taHotels] : [taHotels, bookingHotels], bookingFirst ? "booking" : "travel_advisor"),
    runtime.markupRules
  );
  const totalCount = Math.max(booking?.totalCount || 0, ta?.totalCount || 0, hotels.length);
  const quotaLimited = Boolean(booking?.quotaLimited) || booking?.errorCode === "quota";
  if (!hotels.length) {
    return {
      ok: false,
      hotels: [],
      totalCount: 0,
      page: input.page,
      pageSize: DEFAULT_PAGE_SIZE,
      hasMore: false,
      destId: booking?.destId || "",
      geoId: input.geoId || "",
      source: "multi",
      cached: Boolean(booking?.cached),
      quotaLimited,
      error: booking?.error || "search_failed",
      errorCode: booking?.errorCode || (quotaLimited ? "quota" : "search_failed"),
    };
  }
  return {
    ok: true,
    hotels,
    totalCount,
    page: input.page,
    pageSize: DEFAULT_PAGE_SIZE,
    hasMore: Boolean(booking?.hasMore || ta?.hasMore) || totalCount > hotels.length,
    destId: booking?.destId || "",
    geoId: "",
    source: "multi",
    cached: Boolean(booking?.cached),
    quotaLimited,
    error: null,
    errorCode: null,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Public entry point
 * ---------------------------------------------------------------------------------------------- */

export async function runPublicHotelSearch(input: PublicHotelSearchInput): Promise<PublicHotelSearchResult> {
  const runtime = await getHotelsRuntime();
  const registry = await getProvidersRegistry();
  const p = registry.providers;
  const hasLiveSuppliers = Boolean(p.ratehawk?.enabled || p.hotelbeds?.enabled || p.travelport_hotels?.enabled || p.seeru_hotels?.enabled);

  if (!hasLiveSuppliers) return runLegacyListProviders(runtime, input);

  if (input.sid) {
    const existing = await getSearchSession(input.sid);
    if (existing) return pageSession(await ensureFanOut(existing), input, runtime);
  }

  const supplyInput: SupplySearchInput = {
    query: input.query,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: Math.max(1, input.adults || 2),
    rooms: Math.max(1, input.rooms || 1),
    childrenAges: parseChildrenAges(input.childrenAges),
    currency: input.currency || "USD",
    lang: input.lang || "ar",
    onlySuppliers: input.onlySuppliers,
  };
  const session = await startOrJoinSearchSession(supplyInput, { waitMs: input.page > 0 ? 2_000 : undefined });
  return pageSession(session, input, runtime);
}

export function publicSearchNights(input: PublicHotelSearchInput): number {
  return nightsBetween(input.checkIn, input.checkOut);
}
