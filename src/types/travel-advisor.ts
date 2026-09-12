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
  /** Real promotional discount only (from supplier promotions); 0 when none. */
  discountPct: 0 | 5 | 10 | 15;
  /** Remaining rooms reported by the supplier (0 = unknown, never invented). */
  hurryLeft: number;
  bookingHotelId?: string;
  source?: "booking" | "travel_advisor" | "supplier";
  breakfastIncluded?: boolean;
  noPrepayment?: boolean;
  nonRefundable?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  /* ---- Supply-platform fields (multi-supplier merged hotel) ---- */
  /** Master identity grouping every supplier code of this property. */
  masterId?: string;
  /** Number of suppliers offering this property (shown as "x عروض"). */
  offerCount?: number;
  /** Internal only — never rendered as a badge publicly. */
  offers?: Array<{ supplier: string; id: string; total: number; currency: string }>;
  /** Search session that produced this card (used by details/booking to reuse supplier context). */
  sessionId?: string;
  freeCancellation?: boolean;
  payAtHotel?: boolean;
  /** Metres from the searched destination centre, when coordinates are known. */
  distanceFromCenterM?: number;
  /** Review score as delivered by a supplier (TripAdvisor via Hotelbeds, RateHawk...). */
  reviewScore?: { source: string; score: number; scale: number; count?: number };
  /**
   * Facts about the cheapest rate plan behind the card price — copied verbatim from the supplier
   * rate/room content. Every field is optional; missing = supplier did not provide it (UI hides it).
   * Prices are intentionally NOT repeated here (see `nightly` / `totalStay`, which carry markup).
   */
  cheapestOffer?: HotelCardCheapestOffer;
};

export type HotelCardCheapestOffer = {
  supplier: string;
  roomName?: string;
  beds?: string;
  sizeSqm?: number;
  maxOccupancy?: number;
  /** RO/BB/HB/FB/AI/UAI/OTHER */
  board?: string;
  /** Supplier wording for the board when it is not one of the normalised codes. */
  boardName?: string;
  refundable?: boolean;
  /** ISO datetime of the free-cancellation deadline (only when refundable). */
  freeCancellationUntil?: string;
  paymentType?: "prepay" | "pay_at_hotel" | "deposit";
  rateType?: "BOOKABLE" | "RECHECK";
  taxesIncluded?: boolean;
  remainingRooms?: number;
  promotions?: string[];
};

export type HotelSearchProgress = {
  complete: boolean;
  done: string[];
  pending: string[];
  disabled: string[];
  stats: Array<{ supplier: string; ok: boolean; count: number; latencyMs: number; error?: string }>;
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
  /* ---- Supply-platform fields (real supplier rate plan) ---- */
  /** RO/BB/HB/FB/AI/UAI/OTHER */
  boardCode?: string;
  boardName?: string;
  paymentType?: "prepay" | "pay_at_hotel" | "deposit";
  freeCancellationUntil?: string;
  cancellationPolicies?: Array<{ from: string; amount: number; currency: string; description?: string }>;
  /** BOOKABLE = price is final; RECHECK = must be re-quoted before payment. */
  rateType?: "BOOKABLE" | "RECHECK";
  /** Internal booking handle (rateKey / book_hash / rate_id / catalogOffering id). */
  supplierToken?: string;
  supplier?: string;
  supplierContext?: Record<string, string>;
  remainingRooms?: number;
  promotions?: string[];
  taxesIncluded?: boolean;
  taxes?: number | null;
  rateComments?: string;
  occupancy?: { adults: number; children: number; rooms: number };
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
  source?: "booking_com15" | "tripadvisor";
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
  email?: string;
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
  /* ---- Supply-platform fields ---- */
  /** Primary supplier of this hotel page (internal use). */
  supplier?: string;
  supplierHotelId?: string;
  masterId?: string;
  sessionId?: string;
  /** Every supplier offering this property with its cheapest total. */
  offers?: Array<{ supplier: string; id: string; total: number; currency: string }>;
  /** Points of interest with real distances from the supplier content. */
  pois?: Array<{ name: string; distanceM?: number; type?: string }>;
  /** Images grouped by category (exterior/room/pool/...) for gallery filters. */
  imageCategories?: Array<{ category: string; urls: string[] }>;
  /** Which sections the suppliers actually delivered; the UI hides everything else. */
  available?: {
    description: boolean;
    facilities: boolean;
    pois: boolean;
    policies: boolean;
    reviews: boolean;
    map: boolean;
  };
  /** Per-supplier fetch status for the room matrix (some suppliers may have timed out). */
  supplierStatus?: Array<{ supplier: string; ok: boolean; rooms: number; latencyMs: number; error?: string }>;
};
