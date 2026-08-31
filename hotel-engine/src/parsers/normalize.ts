import type { CatalogHotel, CatalogRoom } from "../catalog/catalog.types";
import type { HotelCard, HotelDetails, HotelOffer, HotelRoom, StayQuery } from "../types/hotel.types";

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T00:00:00Z`).getTime();
  const b = new Date(`${checkOut}T00:00:00Z`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 1;
  return Math.max(1, Math.round((b - a) / 86400000));
}

function isAr(lang: string): boolean {
  return String(lang || "").toLowerCase().startsWith("ar");
}

export function cheapestNightly(hotel: CatalogHotel): number | null {
  const prices = hotel.rooms
    .map((r) => r.price)
    .filter((n): n is number => typeof n === "number" && n > 0);
  if (!prices.length) return null;
  return Math.min(...prices);
}

export function toCard(hotel: CatalogHotel, stay: StayQuery, rooms?: HotelRoom[]): HotelCard {
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const ar = isAr(stay.lang);
  const fromRooms = rooms
    ?.map((r) => r.nightly)
    .filter((n): n is number => typeof n === "number" && n > 0);
  const nightly =
    (fromRooms && fromRooms.length ? Math.min(...fromRooms) : cheapestNightly(hotel));
  const totalStay = nightly != null ? nightly * nights : null;
  const name = ar ? hotel.nameAr || hotel.nameEn : hotel.nameEn;
  const neighborhood = ar ? hotel.neighborhoodAr || hotel.neighborhoodEn : hotel.neighborhoodEn;
  const snippet = ar ? hotel.descriptionAr || hotel.descriptionEn : hotel.descriptionEn;
  const roomType = rooms?.[0]?.name || (ar ? hotel.rooms[0]?.nameAr : hotel.rooms[0]?.nameEn) || "";
  return {
    id: hotel.id,
    name,
    city: hotel.city,
    country: hotel.country,
    neighborhood,
    stars: hotel.stars,
    rating: hotel.rating,
    reviewCount: hotel.reviewCount,
    image: hotel.images[0] || "",
    images: hotel.images,
    badges: hotel.isFeatured ? ["Featured"] : [],
    snippet: snippet.slice(0, 280),
    priceFrom: nightly,
    priceOriginal: nightly != null ? Math.round(nightly * 1.08) : null,
    currency: hotel.rooms[0]?.currency || "USD",
    lat: hotel.lat,
    lng: hotel.lng,
    address: ar ? hotel.addressAr || hotel.addressEn : hotel.addressEn,
    locationText: [neighborhood, hotel.city, hotel.country].filter(Boolean).join(" · "),
    roomType,
    amenities: hotel.amenities.slice(0, 12),
    distanceText: "",
    nightly,
    totalStay,
    priceIsStayTotal: false,
    nights,
    discountPct: 5,
    hurryLeft: 3,
  };
}

export function toDetails(
  hotel: CatalogHotel,
  stay: StayQuery,
  rooms: HotelRoom[]
): HotelDetails {
  const card = toCard(hotel, stay, rooms);
  const ar = isAr(stay.lang);
  return {
    ...card,
    description: ar ? hotel.descriptionAr || hotel.descriptionEn : hotel.descriptionEn,
    amenities: hotel.amenities,
    highlights: ar ? hotel.highlightsAr : hotel.highlightsEn,
    reviews: [],
    rooms,
    phone: "",
    ranking: hotel.stars ? `${hotel.stars}★ ${hotel.city}` : hotel.city,
    checkInTime: hotel.checkInTime,
    checkOutTime: hotel.checkOutTime,
    policies: ar ? hotel.policiesAr : hotel.policiesEn,
    nearbyPlaces: [],
  };
}

export function catalogRoomToHotelRoom(room: CatalogRoom, stay: StayQuery, hotel: CatalogHotel): HotelRoom {
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const ar = isAr(stay.lang);
  const nightly = room.price;
  const totalStay = nightly != null ? nightly * nights : null;
  return {
    id: room.id,
    name: ar ? room.nameAr || room.nameEn : room.nameEn,
    description: ar ? room.descriptionAr || room.descriptionEn : room.descriptionEn,
    beds: room.beds,
    capacity: room.capacity,
    sizeSqm: room.sizeSqm,
    price: nightly,
    currency: room.currency || "USD",
    amenities: room.amenities,
    images: room.images.length ? room.images : hotel.images.slice(0, 2),
    breakfastIncluded: room.breakfastIncluded,
    freeCancellation: room.freeCancellation,
    view: "",
    partnerName: "Lonaliza",
    nightly,
    totalStay,
    available: true,
    rates: [
      {
        id: `${room.id}-std`,
        board: room.breakfastIncluded ? "breakfast" : "room_only",
        breakfastIncluded: room.breakfastIncluded,
        freeCancellation: room.freeCancellation,
        price: nightly,
        nightly,
        totalStay,
        currency: room.currency || "USD",
        partnerName: "Lonaliza",
      },
    ],
  };
}

export function roomsToOffers(hotel: CatalogHotel, rooms: HotelRoom[]): HotelOffer[] {
  const cheapest = rooms
    .map((r) => r.nightly)
    .filter((n): n is number => typeof n === "number" && n > 0)
    .sort((a, b) => a - b)[0];
  if (cheapest == null) return [];
  return [
    {
      partner: "Lonaliza",
      partnerKey: "owned",
      price: cheapest,
      currency: rooms[0]?.currency || "USD",
      nightly: cheapest,
      totalStay: rooms[0]?.totalStay ?? null,
      breakfastIncluded: rooms.some((r) => r.breakfastIncluded),
      freeCancellation: rooms.some((r) => r.freeCancellation),
      url: hotel.sourceUrl,
    },
  ];
}

export const PAGE_SIZE = 15;
