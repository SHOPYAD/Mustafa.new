import { NextRequest, NextResponse } from "next/server";
import {
  defaultHotelDates,
  parseHotelApiId,
  parseHotelRouteSource,
} from "@/lib/hotels-config";
import {
  applyHotelMarkupToPublicHotel,
  runtimeHasProvider,
  type HotelsRuntimeSettings,
} from "@/lib/hotels-runtime";
import type { TravelAdvisorHotelDetails, TravelAdvisorRoom } from "@/types/travel-advisor";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { nightsBetween } from "@/lib/hotel-display";
import {
  applyFallbackNightly,
  bestAvailableRateTitle,
  fallbackRoomsFromCompare,
  isGenericStandardRoomName,
  isUsableHotelDescription,
  isRealRoomName,
  roomCardPhotos,
} from "@/lib/hotel-offers";
import {
  loadCachedHotelCard,
  mergeBookingHotelDetails,
  peekCachedBookingList,
} from "@/lib/server/booking-hotel-list";
import {
  getHotelRooms,
  lookupPersistedBookingHotelId,
} from "@/lib/server/hotel-rooms-provider";
import {
  getOwnedHotelDetails,
  mapOwnedEnginePublicError,
} from "@/lib/scraping/hotels/owned-client";
import {
  getHotelDetails,
  getHotelOffers,
  peekCachedHotelList,
  mapTravelAdvisorPublicError,
} from "@/lib/server/travel-advisor";

export const runtime = "nodejs";

function markPublicHotel(
  hotelsRuntime: HotelsRuntimeSettings,
  hotel: TravelAdvisorHotelDetails,
  rooms?: TravelAdvisorRoom[]
) {
  return applyHotelMarkupToPublicHotel(
    hotel,
    rooms && rooms.length ? rooms : hotel.rooms || [],
    hotelsRuntime.markupRules
  );
}

export async function GET(req: NextRequest) {
  const hotelsRuntime = await getHotelsRuntime();
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id") || searchParams.get("slug") || "";
  const routeSource = parseHotelRouteSource(rawId);
  const id = parseHotelApiId(rawId) || rawId.replace(/^(ta-|owned-|bk-)/, "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing hotel id" }, { status: 400 });
  }

  const defaults = defaultHotelDates();
  const checkIn = searchParams.get("checkIn")?.trim() || defaults.checkIn;
  const checkOut = searchParams.get("checkOut")?.trim() || defaults.checkOut;
  const adults = Number(searchParams.get("adults") || 2);
  const childrenAges = (searchParams.get("children") || searchParams.get("childrenAges") || "").trim();
  const roomQty = Number(searchParams.get("rooms") || searchParams.get("roomQty") || 1);
  const query = searchParams.get("q")?.trim() || "Istanbul";
  const lang = searchParams.get("lang")?.trim() || "";
  const bookingFromQuery = searchParams.get("bookingHotelId")?.trim() || "";
  const nights = nightsBetween(checkIn, checkOut);

  try {
    if (runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single") {
      const details = await getOwnedHotelDetails(id, {
        checkIn,
        checkOut,
        adults: Number.isFinite(adults) ? adults : 2,
        lang,
        query,
      });
      if (!details) {
        return NextResponse.json({ ok: false, error: "Hotel not found" }, { status: 404 });
      }
      const markedOwned = markPublicHotel(hotelsRuntime, details, details.rooms);
      return NextResponse.json({
        ok: true,
        hotel: { ...markedOwned.hotel, roomsPendingMatch: false },
        rooms: markedOwned.rooms,
        nearby: [],
        checkIn,
        checkOut,
        nights,
        roomsPendingMatch: false,
      });
    }

    const bookingPrimary =
      hotelsRuntime.mode === "single" && runtimeHasProvider(hotelsRuntime, "booking");
    const bookingOn = runtimeHasProvider(hotelsRuntime, "booking");
    let bookingHotelId = bookingFromQuery || (routeSource === "booking" ? id : "");

    if (bookingOn && !bookingHotelId && routeSource === "ta" && !bookingPrimary) {
      const listed = peekCachedHotelList().find((h) => h.id === id);
      if (listed?.name) {
        bookingHotelId = await lookupPersistedBookingHotelId(listed.name, listed.city || query);
      }
    }

    if (bookingOn && bookingHotelId) {
      const card = await loadCachedHotelCard(bookingHotelId);
      const roomsProvider = await getHotelRooms({
        hotelName: card?.name || "Hotel",
        city: card?.city || query,
        bookingHotelId,
        checkIn,
        checkOut,
        adults: Number.isFinite(adults) ? adults : 2,
        childrenAges,
        roomQty: Number.isFinite(roomQty) && roomQty > 0 ? roomQty : 1,
        lang,
        fallbackNightly: card?.nightly ?? card?.priceFrom,
        hotelPhotos: card?.images || [],
        latitude: card?.lat,
        longitude: card?.lng,
      });
      const hotel = markPublicHotel(
        hotelsRuntime,
        mergeBookingHotelDetails({
          hotelId: bookingHotelId,
          card,
          rooms: roomsProvider,
          nights,
        })
      );
      return NextResponse.json({
        ok: true,
        hotel: hotel.hotel,
        rooms: hotel.rooms,
        roomsPendingMatch: false,
        nearby: peekCachedBookingList().filter((h) => h.id !== bookingHotelId).slice(0, 8),
        reviews: hotel.hotel.reviews,
        facilities: hotel.hotel.amenities,
        facilityGroups: hotel.hotel.facilityGroups,
        nearbyPlaces: hotel.hotel.nearbyPlaces,
        policies: hotel.hotel.policies,
        payment: hotel.hotel.payment,
        childrenPolicy: hotel.hotel.childrenPolicy,
        qa: hotel.hotel.questions,
        checkIn,
        checkOut,
        nights,
        source: "booking",
        roomsProvider: {
          host: roomsProvider.host,
          bookingHotelId: roomsProvider.bookingHotelId || undefined,
        },
      });
    }

    if (bookingPrimary) {
      return NextResponse.json(
        { ok: false, error: "تعذر تحميل النتائج، حاول مرة أخرى", errorCode: "search_failed" },
        { status: 503 }
      );
    }

    const details = await getHotelDetails(id, {
      query,
      checkIn,
      checkOut,
      adults: Number.isFinite(adults) ? adults : 2,
      lang,
    });
    if (!details) {
      return NextResponse.json({ ok: false, error: "Hotel not found" }, { status: 404 });
    }

    if (bookingOn && !bookingHotelId) {
      bookingHotelId = await lookupPersistedBookingHotelId(details.name, details.city || query);
      if (bookingHotelId) {
        const card = await loadCachedHotelCard(bookingHotelId);
        const roomsProvider = await getHotelRooms({
          hotelName: details.name,
          city: details.city || query,
          bookingHotelId,
          checkIn,
          checkOut,
          adults: Number.isFinite(adults) ? adults : 2,
          childrenAges,
          roomQty: Number.isFinite(roomQty) && roomQty > 0 ? roomQty : 1,
          lang,
          fallbackNightly: details.nightly ?? details.priceFrom,
          hotelPhotos: (details.images || []).filter(Boolean),
          latitude: details.lat,
          longitude: details.lng,
        });
        const hotel = markPublicHotel(
          hotelsRuntime,
          mergeBookingHotelDetails({
            hotelId: bookingHotelId,
            card: card || {
              ...details,
              bookingHotelId,
              source: "booking",
            },
            rooms: roomsProvider,
            nights,
          })
        );
        return NextResponse.json({
          ok: true,
          hotel: {
            ...hotel.hotel,
            name: hotel.hotel.name || details.name,
            rating: hotel.hotel.rating || details.rating,
            reviewCount: hotel.hotel.reviewCount || details.reviewCount,
          },
          rooms: hotel.rooms,
          roomsPendingMatch: false,
          nearby: peekCachedBookingList().slice(0, 8),
          reviews: hotel.hotel.reviews,
          facilities: hotel.hotel.amenities,
          facilityGroups: hotel.hotel.facilityGroups,
          nearbyPlaces: hotel.hotel.nearbyPlaces,
          policies: hotel.hotel.policies,
          payment: hotel.hotel.payment,
          childrenPolicy: hotel.hotel.childrenPolicy,
          qa: hotel.hotel.questions,
          checkIn,
          checkOut,
          nights,
          source: "booking",
        });
      }

      const roomsProvider = await getHotelRooms({
        hotelName: details.name,
        city: details.city || query,
        checkIn,
        checkOut,
        adults: Number.isFinite(adults) ? adults : 2,
        childrenAges,
        roomQty: Number.isFinite(roomQty) && roomQty > 0 ? roomQty : 1,
        lang,
        fallbackNightly: details.nightly ?? details.priceFrom,
        hotelPhotos: (details.images || []).filter(Boolean),
        latitude: details.lat,
        longitude: details.lng,
      });
      if (roomsProvider.bookingHotelId && roomsProvider.rooms.length) {
        const hotel = markPublicHotel(
          hotelsRuntime,
          mergeBookingHotelDetails({
            hotelId: roomsProvider.bookingHotelId,
            card: {
              ...details,
              bookingHotelId: roomsProvider.bookingHotelId,
              source: "booking",
            },
            rooms: roomsProvider,
            nights,
          })
        );
        return NextResponse.json({
          ok: true,
          hotel: hotel.hotel,
          rooms: hotel.rooms,
          roomsPendingMatch: false,
          nearby: peekCachedHotelList().filter((h) => h.id !== id).slice(0, 8),
          reviews: hotel.hotel.reviews,
          facilities: hotel.hotel.amenities,
          facilityGroups: hotel.hotel.facilityGroups,
          nearbyPlaces: hotel.hotel.nearbyPlaces,
          policies: hotel.hotel.policies,
          payment: hotel.hotel.payment,
          childrenPolicy: hotel.hotel.childrenPolicy,
          qa: hotel.hotel.questions,
          checkIn,
          checkOut,
          nights,
          source: "booking",
        });
      }
    }

    const nearby = peekCachedHotelList()
      .filter((h) => h.id !== id)
      .slice(0, 8);
    const hotelImages = (details.images || []).filter(Boolean);
    const fallbackNightly = details.nightly ?? details.priceFrom;
    let rooms = details.rooms.filter(
      (room) => isRealRoomName(room.name) && !isGenericStandardRoomName(room.name)
    );

    rooms = applyFallbackNightly(
      rooms.map((room, i) => ({
        ...room,
        partnerName: "",
        images: room.images.length ? room.images : roomCardPhotos(hotelImages, i, 6),
      })),
      fallbackNightly,
      nights
    );

    if (!rooms.length) {
      try {
        const offers = await getHotelOffers(id, {
          query,
          checkIn,
          checkOut,
          adults: Number.isFinite(adults) ? adults : 2,
          lang,
        });
        rooms = applyFallbackNightly(
          fallbackRoomsFromCompare(
            offers,
            hotelImages,
            Number.isFinite(adults) ? adults : 2,
            bestAvailableRateTitle(lang),
            fallbackNightly,
            lang
          ),
          fallbackNightly,
          nights
        );
      } catch {
        rooms = [];
      }
    }

    const descriptionCandidates = [details.description, details.snippet].filter((text) =>
      isUsableHotelDescription(text)
    );

    const markedTa = markPublicHotel(hotelsRuntime, {
      ...details,
      description: descriptionCandidates[0] || "",
      rooms,
      roomsPendingMatch: false,
    });
    return NextResponse.json({
      ok: true,
      hotel: markedTa.hotel,
      rooms: markedTa.rooms,
      roomsPendingMatch: false,
      nearby,
      checkIn,
      checkOut,
      nights,
      source: "travel_advisor",
    });
  } catch (e) {
    const mapped =
      runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single"
        ? mapOwnedEnginePublicError(e)
        : mapTravelAdvisorPublicError(e);
    return NextResponse.json(
      {
        ok: false,
        error: mapped.error,
        errorCode: mapped.errorCode,
      },
      { status: mapped.status }
    );
  }
}
