export type StayQuery = {
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  lang: string;
};

export type HotelCard = {
  id: string;
  name: string;
  city: string;
  country: string;
  neighborhood: string;
  stars: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  badges: string[];
  snippet: string;
  priceFrom: number | null;
  priceOriginal: number | null;
  currency: string;
  lat: number;
  lng: number;
  address: string;
  locationText: string;
  roomType: string;
  amenities: string[];
  distanceText: string;
  nightly: number | null;
  totalStay: number | null;
  priceIsStayTotal: boolean;
  nights: number;
  discountPct: 0 | 5 | 10 | 15;
  hurryLeft: number;
};

export type HotelRoomRate = {
  id: string;
  board: "breakfast" | "room_only";
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  price: number | null;
  nightly: number | null;
  totalStay: number | null;
  currency: string;
  partnerName: string;
};

export type HotelRoom = {
  id: string;
  name: string;
  description: string;
  beds: string;
  capacity: number;
  sizeSqm: number;
  price: number | null;
  currency: string;
  amenities: string[];
  images: string[];
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  view: string;
  partnerName: string;
  nightly: number | null;
  totalStay: number | null;
  available: boolean;
  rates: HotelRoomRate[];
};

export type HotelDetails = HotelCard & {
  description: string;
  amenities: string[];
  highlights: string[];
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    title: string;
    text: string;
    date: string;
  }>;
  rooms: HotelRoom[];
  phone: string;
  ranking: string;
  checkInTime: string;
  checkOutTime: string;
  policies: string[];
  nearbyPlaces: Array<{ name: string; distance: string }>;
};

export type HotelOffer = {
  partner: string;
  partnerKey: string;
  price: number | null;
  currency: string;
  nightly: number | null;
  totalStay: number | null;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  url: string;
};

export type LastCrawlStatus = {
  at: string | null;
  hotelId: string;
  ok: boolean;
  roomCount: number;
  error: string | null;
  durationMs: number;
  source: "live" | "catalog" | "cache";
};
