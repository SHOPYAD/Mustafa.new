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
import { defaultHotels } from "@/data/hotels";
import { buildHotelDetails } from "@/lib/server/hotels/details-service";
import { getInMemoryHotelCard } from "@/lib/server/hotels-search-runtime";

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
  if (!id && !rawId) {
    return NextResponse.json({ ok: false, error: "Missing hotel id" }, { status: 400 });
  }

  const defaults = defaultHotelDates();
  const checkIn = searchParams.get("checkIn")?.trim() || defaults.checkIn;
  const checkOut = searchParams.get("checkOut")?.trim() || defaults.checkOut;
  const adults = Number(searchParams.get("adults") || 2);
  const childrenAges = (searchParams.get("children") || searchParams.get("childrenAges") || "").trim();
  const roomQty = Number(searchParams.get("rooms") || searchParams.get("roomQty") || 1);
  const query = searchParams.get("q")?.trim() || searchParams.get("city")?.trim() || "Istanbul";
  const lang = searchParams.get("lang")?.trim() || "";
  const bookingFromQuery = searchParams.get("bookingHotelId")?.trim() || "";
  const nights = nightsBetween(checkIn, checkOut);
  const safeNights = Math.max(1, nights);

  // Retrieve cached search card & query parameters for 100% price and photo fidelity
  const cleanLookupId = (id || rawId).replace(/^(rh_|hb_|tph_|sh_|ta-|bk-|owned-)/, "").trim();
  const cachedCard =
    getInMemoryHotelCard(id) ||
    getInMemoryHotelCard(rawId) ||
    getInMemoryHotelCard(cleanLookupId);

  const paramHotelName = searchParams.get("hotelName")?.trim() || searchParams.get("name")?.trim() || cachedCard?.name || "";
  const paramCity = searchParams.get("city")?.trim() || (searchParams.get("q")?.trim() !== "Istanbul" ? searchParams.get("q")?.trim() : "") || cachedCard?.city || "";
  const paramPrice = Number(searchParams.get("price") || searchParams.get("nightly") || cachedCard?.nightly || cachedCard?.priceFrom || 0);
  const paramImage = searchParams.get("image")?.trim() || searchParams.get("photoUrl")?.trim() || cachedCard?.image || "";
  const paramStars = Number(searchParams.get("stars") || cachedCard?.stars || 0);
  const paramRating = Number(searchParams.get("rating") || cachedCard?.rating || 0);

  const baseCandidateImages = [
    paramImage,
    cachedCard?.image,
    ...(Array.isArray(cachedCard?.images) ? cachedCard.images : []),
  ].filter(Boolean) as string[];

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

    const effectiveSupplierId =
      id.startsWith("rh_") || id.startsWith("hb_") || id.startsWith("tph_") || id.startsWith("sh_")
        ? id
        : rawId.startsWith("rh_") || rawId.startsWith("hb_") || rawId.startsWith("tph_") || rawId.startsWith("sh_")
        ? rawId
        : "";

    if (effectiveSupplierId) {
      const sid = (searchParams.get("sid") || "").trim().replace(/[^a-f0-9]/gi, "").slice(0, 40);
      const masterId = (searchParams.get("master") || "").trim().replace(/[^a-z0-9_]/gi, "").slice(0, 40);
      const currency = (searchParams.get("currency") || "").trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || undefined;
      const payload = await buildHotelDetails({
        id: effectiveSupplierId,
        sessionId: sid || undefined,
        masterId: masterId || undefined,
        checkIn,
        checkOut,
        adults: Number.isFinite(adults) && adults > 0 ? Math.floor(adults) : 2,
        rooms: Number.isFinite(roomQty) && roomQty > 0 ? Math.floor(roomQty) : 1,
        childrenAges: childrenAges.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0 && n < 18),
        currency,
        lang: lang || "ar",
      });
      if (!payload) {
        return NextResponse.json({ ok: false, error: "Hotel not found" }, { status: 404 });
      }
      const marked = markPublicHotel(hotelsRuntime, payload.hotel, payload.rooms);
      return NextResponse.json({
        ok: true,
        hotel: marked.hotel,
        rooms: marked.rooms,
        roomGroups: payload.roomGroups,
        nearby: marked.hotel.nearbyPlaces,
        reviews: [],
        reviewScores: marked.hotel.reviewScore ? [{ name: marked.hotel.reviewScore.source, score: marked.hotel.reviewScore.score }] : [],
        facilities: marked.hotel.amenities,
        facilityGroups: marked.hotel.facilityGroups,
        nearbyPlaces: marked.hotel.nearbyPlaces,
        policies: marked.hotel.policies,
        checkIn,
        checkOut,
        nights: payload.nights,
        source: "supplier",
        roomsPendingMatch: false,
      });
    }

    const isExternalMode =
      (runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single") ||
      runtimeHasProvider(hotelsRuntime, "booking") ||
      runtimeHasProvider(hotelsRuntime, "travel_advisor");
    const isInternalMode = runtimeHasProvider(hotelsRuntime, "internal") && !isExternalMode;

    const internalMatch = defaultHotels.find(
      (h) => h.id === id || h.slug === id || h.slug === rawId
    );
    if (internalMatch && isInternalMode) {
      const minRoomPrice = Array.isArray(internalMatch.rooms) && internalMatch.rooms.length > 0
        ? Math.min(...internalMatch.rooms.map((r) => Number(r.price) || 250))
        : 250;
      const nightly = minRoomPrice;
      const totalStay = nightly * Math.max(1, nights);

      const mappedRooms: TravelAdvisorRoom[] = (internalMatch.rooms || []).map((r, i) => {
        const roomNightly = Number(r.price) || nightly;
        const roomTotal = roomNightly * Math.max(1, nights);
        return {
          id: r.id || `r-${i}`,
          name: lang === "en" ? r.nameEn : (r.nameAr || r.nameEn),
          description: lang === "en" ? r.descriptionEn : (r.descriptionAr || r.descriptionEn),
          beds: r.beds || "سرير مزدوج كبير",
          capacity: r.capacity || 2,
          sizeSqm: r.sizeSqm || 35,
          price: roomNightly,
          currency: r.currency || "USD",
          amenities: r.amenities || internalMatch.amenities || [],
          images: r.images && r.images.length ? r.images : internalMatch.images,
          breakfastIncluded: Boolean(r.breakfastIncluded),
          freeCancellation: Boolean(r.freeCancellation),
          view: "إطلالة ساحرة",
          partnerName: "لوناليزا هوتيلز",
          nightly: roomNightly,
          totalStay: roomTotal,
          available: true,
          rates: [
            {
              id: `${r.id || `r-${i}`}-rate-1`,
              board: r.breakfastIncluded ? ("breakfast" as const) : ("room_only" as const),
              breakfastIncluded: Boolean(r.breakfastIncluded),
              freeCancellation: Boolean(r.freeCancellation),
              price: roomNightly,
              nightly: roomNightly,
              totalStay: roomTotal,
              currency: r.currency || "USD",
              partnerName: "لوناليزا هوتيلز",
              label: "أفضل سعر متاح شامل الضرائب والرسوم",
            },
          ],
          cancellationPolicy: r.freeCancellation ? "إلغاء مجاني حتى 48 ساعة قبل الوصول" : "غير قابل للاسترداد",
          prepayment: "دفع آمن أو عند الوصول",
          nonRefundable: !r.freeCancellation,
        };
      });

      const cardBase = {
        id: internalMatch.slug || internalMatch.id,
        name: lang === "en" ? internalMatch.nameEn : (internalMatch.nameAr || internalMatch.nameEn),
        city: internalMatch.city,
        country: internalMatch.country,
        neighborhood: lang === "en" ? internalMatch.neighborhoodEn : (internalMatch.neighborhoodAr || internalMatch.neighborhoodEn),
        stars: internalMatch.stars,
        rating: internalMatch.rating,
        reviewCount: internalMatch.reviewCount,
        image: internalMatch.images?.[0] || "",
        images: internalMatch.images || [],
        badges: lang === "en" ? (internalMatch.highlightsEn || []) : (internalMatch.highlightsAr || []),
        snippet: lang === "en" ? (internalMatch.descriptionEn || "") : (internalMatch.descriptionAr || ""),
        priceFrom: nightly,
        priceOriginal: null,
        currency: "USD",
        lat: internalMatch.lat,
        lng: internalMatch.lng,
        address: lang === "en" ? (internalMatch.addressEn || "") : (internalMatch.addressAr || ""),
        locationText: `${internalMatch.neighborhoodAr || internalMatch.neighborhoodEn || ""}, ${internalMatch.city}`,
        roomType: mappedRooms[0]?.name || "غرفة ديلوكس فاخرة",
        bedType: mappedRooms[0]?.beds || "سرير كينغ مريح",
        cancellation: "إلغاء مجاني متاح",
        amenities: internalMatch.amenities || [],
        distanceText: "وسط المدينة",
        nightly,
        totalStay,
        priceIsStayTotal: false,
        nights: Math.max(1, nights),
        discountPct: 0 as const,
        hurryLeft: 0,
        breakfastIncluded: Boolean(mappedRooms[0]?.breakfastIncluded),
        noPrepayment: true,
        nonRefundable: false,
        checkInTime: internalMatch.checkIn || "14:00",
        checkOutTime: internalMatch.checkOut || "12:00",
      };

      const hotelDetails: TravelAdvisorHotelDetails = {
        ...cardBase,
        description: lang === "en" ? internalMatch.descriptionEn : (internalMatch.descriptionAr || internalMatch.descriptionEn),
        amenities: internalMatch.amenities || [],
        highlights: lang === "en" ? (internalMatch.highlightsEn || []) : (internalMatch.highlightsAr || []),
        phone: internalMatch.phone || internalMatch.whatsappNumber || "",
        ranking: "",
        policies: lang === "en" ? (internalMatch.policiesEn || []) : (internalMatch.policiesAr || []),
        nearbyPlaces: (internalMatch.nearbyPlaces || []).map((p) => ({
          name: lang === "en" ? p.nameEn : (p.nameAr || p.nameEn),
          distance: "قريب",
        })),
        reviews: (internalMatch.guestReviews || []).map((rev) => ({
          id: rev.id,
          author: rev.author,
          rating: rev.rating,
          title: lang === "en" ? rev.titleEn : (rev.titleAr || rev.titleEn),
          text: lang === "en" ? rev.textEn : (rev.textAr || rev.textEn),
          date: rev.date,
        })),
        rooms: mappedRooms,
        roomsPendingMatch: false,
      };

      const marked = markPublicHotel(hotelsRuntime, hotelDetails, mappedRooms);
      return NextResponse.json({
        ok: true,
        hotel: marked.hotel,
        rooms: marked.rooms,
        roomsPendingMatch: false,
        nearby: (internalMatch.nearbyPlaces || []).map((p) => ({
          name: lang === "en" ? p.nameEn : (p.nameAr || p.nameEn),
          distance: "قريب",
        })),
        checkIn,
        checkOut,
        nights,
        source: "internal",
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
        hotelName: card?.name || paramHotelName || "Hotel",
        city: card?.city || query,
        bookingHotelId,
        checkIn,
        checkOut,
        adults: Number.isFinite(adults) ? adults : 2,
        childrenAges,
        roomQty: Number.isFinite(roomQty) && roomQty > 0 ? roomQty : 1,
        lang,
        fallbackNightly: paramPrice || card?.nightly || card?.priceFrom,
        hotelPhotos: [paramImage, ...(card?.images || [])].filter(Boolean),
        latitude: card?.lat,
        longitude: card?.lng,
      });

      const resolvedName = card?.name || paramHotelName || "";
      const resolvedCity = card?.city || query;
      const realImages = Array.from(
        new Set([paramImage, card?.image, ...(card?.images || [])].filter(Boolean) as string[])
      );
      // No invented rooms: when the provider returns nothing the UI shows "rooms pending".
      const publicRooms = roomsProvider.rooms || [];
      const roomsPendingMatch = publicRooms.length === 0;

      const merged = mergeBookingHotelDetails({
        hotelId: bookingHotelId,
        card: card || {
          id: bookingHotelId,
          name: resolvedName,
          city: resolvedCity,
          country: "",
          neighborhood: "",
          stars: paramStars || 0,
          rating: paramRating || 0,
          reviewCount: 0,
          image: realImages[0] || "",
          images: realImages,
          badges: [],
          snippet: "",
          priceFrom: publicRooms[0]?.nightly || paramPrice || null,
          priceOriginal: null,
          currency: "USD",
          lat: 0,
          lng: 0,
          address: "",
          locationText: resolvedCity,
          roomType: publicRooms[0]?.name || "",
          bedType: publicRooms[0]?.beds || "",
          cancellation: "",
          amenities: [],
          distanceText: "",
          nightly: publicRooms[0]?.nightly || paramPrice || null,
          totalStay: publicRooms[0]?.totalStay ?? (publicRooms[0]?.nightly || paramPrice ? (publicRooms[0]?.nightly || paramPrice) * safeNights : null),
          priceIsStayTotal: true,
          nights: safeNights,
          discountPct: 0,
          hurryLeft: 0,
          bookingHotelId,
          source: "booking",
          breakfastIncluded: Boolean(publicRooms[0]?.breakfastIncluded),
          noPrepayment: false,
          nonRefundable: publicRooms[0] ? !publicRooms[0].freeCancellation : false,
        },
        rooms: {
          ...roomsProvider,
          rooms: publicRooms,
        },
        nights: safeNights,
      });

      if (realImages.length) {
        merged.image = merged.image || realImages[0];
        merged.images = Array.from(new Set([...(merged.images || []), ...realImages]));
      }
      merged.rooms = publicRooms;
      merged.priceOriginal = null;
      merged.discountPct = 0;
      merged.hurryLeft = 0;
      if (publicRooms[0]?.nightly) {
        merged.nightly = publicRooms[0].nightly;
        merged.priceFrom = publicRooms[0].nightly;
        merged.totalStay = publicRooms[0].totalStay || publicRooms[0].nightly * safeNights;
      }

      const hotel = markPublicHotel(hotelsRuntime, merged, publicRooms);
      return NextResponse.json({
        ok: true,
        hotel: { ...hotel.hotel, roomsPendingMatch },
        rooms: hotel.rooms,
        roomsPendingMatch,
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
        nights: safeNights,
        source: "booking",
        roomsProvider: {
          host: roomsProvider.host,
          bookingHotelId: roomsProvider.bookingHotelId || undefined,
        },
      });
    }

    const details = await getHotelDetails(id, {
      query,
      checkIn,
      checkOut,
      adults: Number.isFinite(adults) ? adults : 2,
      lang,
    }).catch(() => null);

    if (details) {
      const realImages = Array.from(
        new Set(
          [paramImage, details.image, ...(Array.isArray(details.images) ? details.images : []), ...baseCandidateImages].filter(
            Boolean
          ) as string[]
        )
      );
      const effectiveCity = paramCity || (query !== "Istanbul" ? query : details.city) || details.city;
      const fallbackNightly = paramPrice > 0 ? paramPrice : (details.nightly ?? details.priceFrom);
      let rooms = (details.rooms || []).filter(
        (room) => isRealRoomName(room.name) && !isGenericStandardRoomName(room.name)
      );
      rooms = applyFallbackNightly(
        rooms.map((room) => ({ ...room, partnerName: "" })),
        fallbackNightly,
        safeNights
      );
      const startingNightly = rooms[0]?.nightly || fallbackNightly || null;
      const startingTotal = rooms[0]?.totalStay || (startingNightly ? startingNightly * safeNights : null);
      const descriptionCandidates = [details.description, details.snippet].filter((text) => isUsableHotelDescription(text));

      const markedTa = markPublicHotel(hotelsRuntime, {
        ...details,
        name: details.name || paramHotelName || "",
        city: effectiveCity,
        image: realImages[0] || details.image || "",
        images: realImages,
        priceFrom: startingNightly,
        priceOriginal: null,
        discountPct: 0,
        hurryLeft: 0,
        nightly: startingNightly,
        totalStay: startingTotal,
        description: descriptionCandidates[0] || details.description || "",
        rooms,
        roomsPendingMatch: rooms.length === 0,
      });

      return NextResponse.json({
        ok: true,
        hotel: markedTa.hotel,
        rooms: markedTa.rooms,
        roomsPendingMatch: rooms.length === 0,
        nearby: peekCachedHotelList().filter((h) => h.id !== id).slice(0, 8),
        checkIn,
        checkOut,
        nights: safeNights,
        source: "travel_advisor",
      });
    }

    // No provider could describe this hotel: say so instead of synthesising a page.
    return NextResponse.json({ ok: false, error: "Hotel not found", errorCode: "not_found" }, { status: 404 });
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
