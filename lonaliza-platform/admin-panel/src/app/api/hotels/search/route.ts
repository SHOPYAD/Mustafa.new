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

import { getProvidersRegistry } from "@/lib/server/providers-registry-store";

export const runtime = "nodejs";
export const maxDuration = 120;

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
  // Progressive search polls a few times per query, so the budget is per-IP over 10 minutes.
  const limited = await rateLimit(`hotels-search:${clientIp(req)}`, 160, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);
  const cacheKey = `hotels:${req.nextUrl.search}`;
  const cached = ttlGet<Record<string, unknown>>(cacheKey);
  if (cached && Array.isArray(cached.hotels) && cached.hotels.length > 0) {
    return NextResponse.json(cached);
  }
  const hotelsRuntime = await getHotelsRuntime();
  const registry = await getProvidersRegistry();
  const hasLiveSuppliers = Boolean(
    registry.providers.travelport_hotels?.enabled ||
    registry.providers.hotelbeds?.enabled ||
    registry.providers.seeru_hotels?.enabled ||
    registry.providers.ratehawk?.enabled
  );
  const owned = runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single";
  const isExternalMode =
    owned ||
    runtimeHasProvider(hotelsRuntime, "booking") ||
    runtimeHasProvider(hotelsRuntime, "travel_advisor") ||
    hasLiveSuppliers;
  const isInternalMode = runtimeHasProvider(hotelsRuntime, "internal") && !isExternalMode;

  try {
    const { searchParams } = new URL(req.url);
    const stay = stayFromSearchParams(searchParams);
    const query = stay.query || "Istanbul";

    if (searchParams.get("suggest") === "1") {
      if (isExternalMode) {
        if (runtimeHasProvider(hotelsRuntime, "travel_advisor")) {
          const locations = await searchLocations(query);
          return NextResponse.json({ ok: true, locations, hotels: [] });
        }
        return NextResponse.json({ ok: true, locations: [], hotels: [] });
      }
      if (isInternalMode) {
        const qLower = query.toLowerCase();
        const internalLocations = [
          { id: "istanbul", name: "إسطنبول، تركيا - Istanbul, Turkey" },
          { id: "antalya", name: "أنطاليا، تركيا - Antalya, Turkey" },
          { id: "trabzon", name: "طرابزون، تركيا - Trabzon, Turkey" },
          { id: "bodrum", name: "بودروم، تركيا - Bodrum, Turkey" },
          { id: "cappadocia", name: "كابادوكيا، تركيا - Cappadocia, Turkey" },
          { id: "rize", name: "ريزا، تركيا - Rize, Turkey" },
          { id: "bursa", name: "بورصة، تركيا - Bursa, Turkey" },
        ].filter((l) => !query || l.name.toLowerCase().includes(qLower) || l.id.includes(qLower));
        return NextResponse.json({ ok: true, locations: internalLocations, hotels: [] });
      }
      return NextResponse.json({ ok: true, locations: [], hotels: [] });
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
    const sid = (searchParams.get("sid") || "").trim().replace(/[^a-f0-9]/gi, "").slice(0, 40);
    const currency = (searchParams.get("currency") || "").trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || undefined;
    const pageSizeParam = Number(searchParams.get("pageSize") || 0);

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
      runtimeHasProvider(hotelsRuntime, "travel_advisor") ||
      hasLiveSuppliers
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
        currency,
        page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 0,
        pageSize: Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.floor(pageSizeParam) : undefined,
        sort,
        sid: sid || undefined,
        applyRemoteFilters,
        filters,
        stayRooms: stay.rooms,
        hotelName: searchParams.get("hotelName")?.trim() || "",
        hotelKey: searchParams.get("hotelKey")?.trim() || "",
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
          sid: result.sid,
          progress: result.progress,
          destination: result.destination,
          filterGroups: result.filterGroups,
          unfilteredCount: result.unfilteredCount,
        };
        if (result.progress?.complete && result.hotels.length) ttlSet(cacheKey, payload, 3 * 60 * 1000);
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
        sid: result.sid,
        progress: result.progress,
        destination: result.destination,
        filterGroups: result.filterGroups,
        unfilteredCount: result.unfilteredCount,
        error: result.unfilteredCount ? null : PUBLIC_HOTEL_EMPTY_COPY,
        errorCode: result.unfilteredCount ? null : "search_failed",
      });
    }

    // Internal Catalog Search (Activated ONLY when internal provider is chosen and external providers are disabled)
    if (isInternalMode) {
      const { nightsBetween } = await import("@/lib/hotel-display");
      const { defaultHotels } = await import("@/data/hotels");
      const nights = Math.max(1, nightsBetween(stay.checkIn, stay.checkOut));
      const normalizedQuery = (query || "").trim().toLowerCase();

      const citySynonyms: Record<string, string> = {
        "اسطنبول": "istanbul",
        "إسطنبول": "istanbul",
        "انطاليا": "antalya",
        "أنطاليا": "antalya",
        "طرابزون": "trabzon",
        "بودروم": "bodrum",
        "كابادوكيا": "cappadocia",
        "ريزا": "rize",
        "ريزه": "rize",
        "بورصة": "bursa",
        "بورصه": "bursa",
      };
      const mappedCity = citySynonyms[normalizedQuery] || "";

      const isGenericQuery =
        !normalizedQuery ||
        normalizedQuery === "turkey" ||
        normalizedQuery === "turkiye" ||
        normalizedQuery === "تركيا" ||
        normalizedQuery === "all" ||
        normalizedQuery === "الكل";

      const matchedHotels = defaultHotels.filter((h) => {
        if (h.isActive === false) return false;
        if (isGenericQuery) return true;
        if (mappedCity && h.city.toLowerCase().includes(mappedCity)) return true;
        const nameEn = (h.nameEn || "").toLowerCase();
        const nameAr = (h.nameAr || "").toLowerCase();
        const city = (h.city || "").toLowerCase();
        const country = (h.country || "").toLowerCase();
        const neighAr = (h.neighborhoodAr || "").toLowerCase();
        const neighEn = (h.neighborhoodEn || "").toLowerCase();
        return (
          nameEn.includes(normalizedQuery) ||
          nameAr.includes(normalizedQuery) ||
          city.includes(normalizedQuery) ||
          country.includes(normalizedQuery) ||
          neighAr.includes(normalizedQuery) ||
          neighEn.includes(normalizedQuery)
        );
      });

      const cards = matchedHotels.map((h) => {
        const minRoomPrice = Array.isArray(h.rooms) && h.rooms.length > 0
          ? Math.min(...h.rooms.map((r) => Number(r.price) || 250))
          : 250;
        const nightly = minRoomPrice;
        const totalStay = nightly * nights;
        const primaryRoom = h.rooms?.[0];
        return {
          id: h.slug || h.id,
          name: lang === "en" ? h.nameEn : (h.nameAr || h.nameEn),
          city: h.city,
          country: h.country,
          neighborhood: lang === "en" ? h.neighborhoodEn : (h.neighborhoodAr || h.neighborhoodEn),
          stars: h.stars || 0,
          rating: h.rating || 0,
          reviewCount: h.reviewCount || 0,
          image: h.images?.[0] || "",
          images: h.images || [],
          badges: lang === "en" ? (h.highlightsEn || []) : (h.highlightsAr || []),
          snippet: lang === "en" ? (h.descriptionEn || "") : (h.descriptionAr || ""),
          priceFrom: nightly,
          priceOriginal: null,
          currency: "USD",
          lat: h.lat || 0,
          lng: h.lng || 0,
          address: lang === "en" ? (h.addressEn || "") : (h.addressAr || ""),
          locationText: `${h.neighborhoodAr || h.neighborhoodEn || ""}, ${h.city}`,
          roomType: primaryRoom ? (lang === "en" ? primaryRoom.nameEn : primaryRoom.nameAr) : "",
          bedType: primaryRoom?.beds || "",
          cancellation: primaryRoom?.freeCancellation ? "إلغاء مجاني متاح" : "",
          amenities: h.amenities || [],
          distanceText: "",
          nightly,
          totalStay,
          priceIsStayTotal: false,
          nights,
          discountPct: 0 as const,
          hurryLeft: 0,
          breakfastIncluded: Boolean(primaryRoom?.breakfastIncluded),
          noPrepayment: false,
          nonRefundable: primaryRoom ? !primaryRoom.freeCancellation : false,
          checkInTime: h.checkIn || "14:00",
          checkOutTime: h.checkOut || "12:00",
        };
      });

      const pricedCards = applyHotelMarkupToCards(cards, hotelsRuntime.markupRules);
      const pageSize = 20;
      const startIndex = page * pageSize;
      const pagedHotels = pricedCards.slice(startIndex, startIndex + pageSize);

      const payload = {
        ok: true,
        hotels: pagedHotels,
        totalCount: pricedCards.length,
        page,
        pageSize,
        hasMore: startIndex + pageSize < pricedCards.length,
        geoId: stay.geoId,
        destId,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        source: "internal",
        fallback: false,
      };
      ttlSet(cacheKey, payload, 3 * 60 * 1000);
      return NextResponse.json(payload);
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
