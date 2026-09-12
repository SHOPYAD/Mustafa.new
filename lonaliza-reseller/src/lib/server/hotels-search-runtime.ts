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
import {
  listHotels,
  type TravelAdvisorSearchInput,
} from "@/lib/server/travel-advisor";
import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";

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
  page: number;
  sort?: string;
  applyRemoteFilters?: boolean;
  filters?: TravelAdvisorSearchInput["filters"];
  stayRooms?: TravelAdvisorSearchInput["rooms"];
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
  source: "booking" | "travel_advisor" | "owned" | "internal" | "multi";
  cached: boolean;
  quotaLimited: boolean;
  error: string | null;
  errorCode: BookingHotelListResult["errorCode"];
};

function hotelDedupeKey(hotel: TravelAdvisorHotelCard): string {
  const bookingId = String(hotel.bookingHotelId || (hotel.source === "booking" ? hotel.id : "")).trim();
  if (bookingId) return `bk:${bookingId}`;
  const name = String(hotel.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `name:${name}|${citySlug(hotel.city || "")}`;
}

function hotelMatchesQuery(hotel: TravelAdvisorHotelCard, query: string): boolean {
  const slug = citySlug(query);
  if (!slug) return true;
  const blob = `${hotel.city} ${hotel.locationText} ${hotel.neighborhood} ${hotel.name}`;
  if (slug === "istanbul") return /istanbul|إسطنبول|اسطنبول|i̇stanbul/i.test(blob);
  if (slug === "antalya") return /antalya|أنطاليا|انطاليا|antalia/i.test(blob);
  if (slug === "izmir") return /izmir|izmır|إزمير|ازمير|İzmir/i.test(blob);
  if (slug === "trabzon") return /trabzon|طرابزون/i.test(blob);
  return citySlug(hotel.city) === slug || citySlug(blob) === slug;
}

function mergeHotelLists(
  query: string,
  groups: TravelAdvisorHotelCard[][],
  prefer: HotelProvider
): TravelAdvisorHotelCard[] {
  const seen = new Set<string>();
  const out: TravelAdvisorHotelCard[] = [];
  const ordered = prefer === "travel_advisor" ? [...groups].reverse() : groups;
  for (const group of ordered) {
    for (const hotel of group) {
      if (!hotelMatchesQuery(hotel, query)) continue;
      const key = hotelDedupeKey(hotel);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(hotel);
    }
  }
  return out;
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

export async function runPublicHotelSearch(
  input: PublicHotelSearchInput
): Promise<PublicHotelSearchResult> {
  const runtime = await getHotelsRuntime();
  const bookingOn =
    runtimeHasProvider(runtime, "booking") &&
    bookingEndpointEnabled(runtime, "searchHotels");
  const taOn =
    runtimeHasProvider(runtime, "travel_advisor") &&
    travelAdvisorEndpointEnabled(runtime, "hotelsV2List");

  if (runtime.mode === "single" || !(bookingOn && taOn)) {
    if (bookingOn) {
      const booking = await searchBooking(input);
      const hotels = applyHotelMarkupToCards(
        booking.hotels.filter((hotel) => hotelMatchesQuery(hotel, input.query)),
        runtime.markupRules
      );
      return {
        ok: booking.ok || hotels.length > 0,
        hotels,
        totalCount: booking.totalCount,
        page: booking.page,
        pageSize: booking.pageSize,
        hasMore: booking.hasMore,
        destId: booking.destId,
        geoId: "",
        source: "booking",
        cached: booking.cached,
        quotaLimited: Boolean(booking.quotaLimited) || booking.errorCode === "quota",
        error: booking.error,
        errorCode: booking.errorCode,
      };
    }
    if (taOn) {
      const result = await searchTravelAdvisor(input);
      const hotels = applyHotelMarkupToCards(
        result.hotels
          .map((hotel) => ({ ...hotel, source: "travel_advisor" as const }))
          .filter((hotel) => hotelMatchesQuery(hotel, input.query)),
        runtime.markupRules
      );
      return {
        ok: true,
        hotels,
        totalCount: result.totalCount,
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
      pageSize: 20,
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

  return searchDual(runtime, input, bookingOn, taOn);
}

async function searchDual(
  runtime: HotelsRuntimeSettings,
  input: PublicHotelSearchInput,
  bookingOn: boolean,
  taOn: boolean
): Promise<PublicHotelSearchResult> {
  const bookingFirst = runtime.providers[0] !== "travel_advisor";
  const bookingPromise = bookingOn ? searchBooking(input) : null;
  const taPromise = taOn
    ? searchTravelAdvisor(input).catch(() => null)
    : null;
  const [booking, ta] = await Promise.all([bookingPromise, taPromise]);
  const bookingHotels = booking?.hotels || [];
  const taHotels = (ta?.hotels || []).map((hotel) => ({
    ...hotel,
    source: "travel_advisor" as const,
  }));
  const hotels = applyHotelMarkupToCards(
    mergeHotelLists(
      input.query,
      bookingFirst ? [bookingHotels, taHotels] : [taHotels, bookingHotels],
      bookingFirst ? "booking" : "travel_advisor"
    ),
    runtime.markupRules
  );
  const totalCount = Math.max(
    booking?.totalCount || 0,
    ta?.totalCount || 0,
    hotels.length
  );
  const quotaLimited = Boolean(booking?.quotaLimited) || booking?.errorCode === "quota";
  if (!hotels.length) {
    return {
      ok: false,
      hotels: [],
      totalCount: 0,
      page: input.page,
      pageSize: 20,
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
    pageSize: 20,
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
