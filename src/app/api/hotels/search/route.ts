import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { ttlGet, ttlSet } from "@/lib/server/ttl-cache";
import { PUBLIC_HOTEL_EMPTY_COPY, publicHotelErrorCode } from "@/lib/hotels-config";
import { stayFromSearchParams } from "@/lib/hotel-search";
import { resolvePlaceGeoId } from "@/lib/server/geo-places";
import { applyHotelMarkupToCards, runtimeHasProvider } from "@/lib/hotels-runtime";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { runPublicHotelSearch } from "@/lib/server/hotels-search-runtime";
import {
  listOwnedHotels,
  mapOwnedEnginePublicError,
} from "@/lib/scraping/hotels/owned-client";
import {
  mapTravelAdvisorPublicError,
  searchLocations,
  type TravelAdvisorAppliedFilter,
} from "@/lib/server/travel-advisor";

export const runtime = "nodejs";

function failJson(e: unknown, owned: boolean) {
  const mapped = owned
    ? mapOwnedEnginePublicError(e)
    : mapTravelAdvisorPublicError(e);
  return NextResponse.json(
    {
      ok: true,
      hotels: [],
      totalCount: 0,
      hasMore: false,
      error: PUBLIC_HOTEL_EMPTY_COPY,
      errorCode: publicHotelErrorCode(mapped.errorCode),
    },
    { status: 200 }
  );
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(`hotels-search:${clientIp(req)}`, 40, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  const cacheKey = `hotels:${req.nextUrl.search}`;
  const cached = ttlGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json(cached);
  const hotelsRuntime = await getHotelsRuntime();
  const owned = runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single";
  try {
    const { searchParams } = new URL(req.url);
    const stay = stayFromSearchParams(searchParams);
    const query = stay.query || "Istanbul";

    if (searchParams.get("suggest") === "1") {
      if (owned || !runtimeHasProvider(hotelsRuntime, "travel_advisor")) {
        return NextResponse.json({ ok: true, locations: [], hotels: [] });
      }
      const locations = await searchLocations(query);
      return NextResponse.json({ ok: true, locations, hotels: [] });
    }

    let filters: TravelAdvisorAppliedFilter[] = [];
    const rawFilters = searchParams.get("filters")?.trim();
    if (rawFilters) {
      try {
        const parsed = JSON.parse(rawFilters) as unknown;
        if (Array.isArray(parsed)) {
          filters = parsed
            .map((item) => {
              const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : null;
              const id = String(rec?.id || "").trim();
              const value = Array.isArray(rec?.value)
                ? rec.value.map((v) => String(v)).filter(Boolean)
                : [];
              return { id, value };
            })
            .filter((f) => f.id && f.value.length);
        }
      } catch {
        filters = [];
      }
    }
    const sort = searchParams.get("sort")?.trim() || "";
    const lang = searchParams.get("lang")?.trim() || "";
    const page = Number(searchParams.get("page") || 0);
    const applyRemoteFilters = searchParams.get("applyAll") === "1";
    const roomQty = Number(searchParams.get("rooms") || stay.rooms?.length || 1);
    const childrenAges = (searchParams.get("childrenAges") || "").trim();
    const destId = stay.destId;

    if (owned) {
      const result = await listOwnedHotels({
        query,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        adults: stay.adults,
        lang,
        page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 0,
      });
      return NextResponse.json({
        ok: true,
        hotels: applyHotelMarkupToCards(result.hotels, hotelsRuntime.markupRules),
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
        geoId: stay.geoId,
        destId,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        source: "owned",
        fallback: false,
      });
    }

    if (
      runtimeHasProvider(hotelsRuntime, "booking") ||
      runtimeHasProvider(hotelsRuntime, "travel_advisor")
    ) {
      const geoId = runtimeHasProvider(hotelsRuntime, "travel_advisor")
        ? await resolvePlaceGeoId({ geoId: stay.geoId, query })
        : "";
      const result = await runPublicHotelSearch({
        query,
        destId,
        geoId,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        adults: stay.adults,
        rooms: Number.isFinite(roomQty) && roomQty > 0 ? Math.floor(roomQty) : 1,
        childrenAges,
        lang,
        page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 0,
        sort,
        applyRemoteFilters,
        filters,
        stayRooms: stay.rooms,
      });
      if (result.ok || result.hotels.length) {
        const payload = {
          ok: true,
          hotels: result.hotels,
          totalCount: result.totalCount,
          page: result.page,
          pageSize: result.pageSize,
          hasMore: result.hasMore,
          geoId: result.geoId,
          destId: result.destId,
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          source: result.source,
          fallback: false,
          cached: result.cached,
        };
        ttlSet(cacheKey, payload, 3 * 60 * 1000);
        return NextResponse.json(payload);
      }
      return NextResponse.json({
        ok: true,
        hotels: [],
        totalCount: 0,
        page: result.page,
        pageSize: result.pageSize || 20,
        hasMore: false,
        geoId: result.geoId,
        destId: result.destId,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        source: result.source,
        fallback: false,
        cached: result.cached,
        error: PUBLIC_HOTEL_EMPTY_COPY,
        errorCode: "search_failed",
      });
    }

    return NextResponse.json({
      ok: true,
      hotels: [],
      totalCount: 0,
      page: 0,
      pageSize: 20,
      hasMore: false,
      geoId: stay.geoId,
      destId,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      source: "internal",
      fallback: false,
    });
  } catch (e) {
    return failJson(e, owned);
  }
}
