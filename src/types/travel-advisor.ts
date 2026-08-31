export type TravelAdvisorHotelCard = {
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
  bedType: string;
  cancellation: string;
  amenities: string[];
  distanceText: string;
  nightly: number | null;
  totalStay: number | null;
  priceIsStayTotal: boolean;
  nights: number;
  discountPct: 0 | 5 | 10 | 15;
  hurryLeft: number;
  bookingHotelId?: string;
  source?: "booking" | "travel_advisor";
  breakfastIncluded?: boolean;
  noPrepayment?: boolean;
  nonRefundable?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
};

export type TravelAdvisorNearbyPlace = {
  name: string;
  distance: string;
};

export type TravelAdvisorHotelPage = {
  hotels: TravelAdvisorHotelCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type TravelAdvisorFilterOption = {
  value: string;
  label: string;
  count: number | null;
};

export type TravelAdvisorFilterGroup = {
  id: string;
  title: string;
  kind: "multi" | "range" | "distance";
  min: number | null;
  max: number | null;
  unit: string;
  options: TravelAdvisorFilterOption[];
};

export type TravelAdvisorAppliedFilter = {
  id: string;
  value: string[];
};

export type TravelAdvisorRoomRate = {
  id: string;
  board: "breakfast" | "room_only";
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  price: number | null;
  nightly: number | null;
  totalStay: number | null;
  currency: string;
  partnerName: string;
  label?: string;
};

export type TravelAdvisorRoom = {
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
  rates: TravelAdvisorRoomRate[];
  cancellationPolicy?: string;
  prepayment?: string;
  nonRefundable?: boolean;
};

export type TravelAdvisorReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  text: string;
  date: string;
};

export type TravelAdvisorQuestion = {
  id: string;
  question: string;
  answer: string;
};

export type TravelAdvisorReviewScore = {
  name: string;
  score: number;
};

export type TravelAdvisorFacilityGroup = {
  title: string;
  items: string[];
};

export type TravelAdvisorHotelDetails = TravelAdvisorHotelCard & {
  description: string;
  amenities: string[];
  highlights: string[];
  reviews: TravelAdvisorReview[];
  rooms: TravelAdvisorRoom[];
  phone: string;
  ranking: string;
  checkInTime: string;
  checkOutTime: string;
  policies: string[];
  nearbyPlaces: TravelAdvisorNearbyPlace[];
  questions?: TravelAdvisorQuestion[];
  reviewScores?: TravelAdvisorReviewScore[];
  facilityGroups?: TravelAdvisorFacilityGroup[];
  childrenPolicy?: string[];
  payment?: string[];
  roomsPendingMatch?: boolean;
};
