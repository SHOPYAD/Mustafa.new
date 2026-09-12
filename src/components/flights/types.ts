export type TripType = "one-way" | "round-trip" | "multi-city";

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export type AirportKind = "city" | "airport";

export type BaggageFilter = "any" | "included" | "none" | 20 | 23 | number;

export type AirportPick = {
  skyId: string;
  entityId: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  kind?: AirportKind;
};

export type FlightLegInput = {
  origin: AirportPick | null;
  destination: AirportPick | null;
  date: string;
};

export type FlightSearchQuery = {
  tripType: TripType;
  origin: AirportPick | null;
  destination: AirportPick | null;
  date: string;
  departDate?: string;
  returnDate: string;
  multiLegs: FlightLegInput[];
  adults: number;
  childrens: number;
  children?: number;
  infants: number;
  cabinClass: CabinClass;
  currency: string;
  directOnly: boolean;
  baggage: BaggageFilter;
};

export type CalendarDayPrice = {
  date: string;
  price: number;
  currency: string;
};

export type FlightCarrier = {
  id: string;
  name: string;
  code: string;
  logoUrl: string;
};

export type FlightPlace = {
  displayCode: string;
  name: string;
  city: string;
  country: string;
  terminal?: string;
  gate?: string;
};

export type FlightAmenity = "wifi" | "power" | "meal" | "entertainment";

export type FlightSegment = {
  id: string;
  origin: FlightPlace;
  destination: FlightPlace;
  departure: string;
  arrival: string;
  durationInMinutes: number;
  flightNumber: string;
  /** Alias of flightNumber for booking/invoice siblings. */
  flightNo?: string;
  aircraft?: string;
  amenities?: FlightAmenity[];
  marketingCarrier: FlightCarrier;
  operatingCarrier?: FlightCarrier;
};

export type FlightLeg = {
  id: string;
  origin: FlightPlace;
  destination: FlightPlace;
  departure: string;
  arrival: string;
  durationInMinutes: number;
  stopCount: number;
  timeDeltaInDays: number;
  carriers: FlightCarrier[];
  segments: FlightSegment[];
  layovers: { airport: string; city: string; durationInMinutes: number; selfTransfer?: boolean; displayCode?: string; name?: string }[];
};

/** Tri-state baggage: "unknown" is legitimate (supplier did not say) and is resolved at re-pricing. */
export type BaggageState =
  | { status: "included"; pieces?: number; kg?: number; text?: string }
  | { status: "none"; text?: string }
  | { status: "unknown" };

export type FareAttributeState = "included" | "chargeable" | "not_available" | "unknown";

export type FarePenalty = {
  type: "change" | "cancel" | "no_show";
  amount?: number;
  currency?: string;
  percent?: number;
  window?: string;
  text?: string;
};

export type FareFamily = {
  id: string;
  name: string;
  price: number;
  currency: string;
  cabinClass: CabinClass;
  /** Legacy label ("23 kg", "1 pc", "0kg" = none, "" = unknown). Prefer `baggageDetail`. */
  baggage: string;
  changeable: boolean;
  refundable: boolean;
  features?: string[];
  nameSource?: "supplier" | "derived";
  brandCode?: string;
  baggageDetail?: { checked: BaggageState; cabin: BaggageState };
  attributes?: {
    refund: FareAttributeState;
    change: FareAttributeState;
    seat: FareAttributeState;
    meal: FareAttributeState;
    priority: FareAttributeState;
  };
  penalties?: FarePenalty[];
  rulesText?: string;
  isBestPrice?: boolean;
  canAddPaidBaggage?: boolean;
};

export type FarePolicy = {
  isChangeAllowed: boolean;
  isPartiallyChangeable: boolean;
  isCancellationAllowed: boolean;
  isPartiallyRefundable: boolean;
  cancellationFee?: number;
};

export type Itinerary = {
  id: string;
  price: number;
  currency: string;
  formattedPrice: string;
  rawPrice?: number;
  score?: number;
  baseFare?: number;
  taxes?: number;
  legs: FlightLeg[];
  fareFamilies: FareFamily[];
  farePolicy?: FarePolicy;
  tags: Array<"cheapest" | "fastest" | "best">;
  isSelfTransfer: boolean;
  sessionLegsPayload?: string;
  isRefundable?: boolean;
  cabinBaggage?: string;
  checkedBaggage?: string;
  fareBrand?: string;
  canAddPaidBaggage?: boolean;
};

export type FlightDetails = {
  itineraryId: string;
  legs: FlightLeg[];
  cabinBaggage: string;
  checkedBaggage: string;
  refundLabel: string;
  changeLabel: string;
  fareFamilies: FareFamily[];
  price?: number;
  currency?: string;
  farePolicy?: FarePolicy;
  fareRules?: string;
};

export type EverywhereDeal = {
  id: string;
  name: string;
  skyId: string;
  entityId: string;
  iata: string;
  imageUrl: string;
  price: number;
  currency: string;
  formattedPrice: string;
  direct: boolean;
  windowLabel: string;
};

export type SearchResponse = {
  itineraries: Itinerary[];
  sessionId: string;
  status: string;
  currency: string;
};

export type FlightFiltersState = {
  stops: Array<0 | 1 | 2>;
  airlines: string[];
  departStart: number;
  departEnd: number;
  arriveStart: number;
  arriveEnd: number;
  maxDuration: number;
  cabinClass: CabinClass | "any";
  directOnly: boolean;
  baggage: BaggageFilter;
  priceMin: number;
  priceMax: number;
  originAirports: string[];
  destAirports: string[];
  layoverAirports: string[];
  freeCancellation: boolean;
  changeableOnly: boolean;
  overnightOnly: boolean;
  fareBrands: string[];
  baggageKg: number | null;
};

export type SortKey = "best" | "price" | "fastest" | "outbound_departure_time";

export type PassengerKind = "adult" | "child" | "infant";

export type PassengerDraft = {
  id: string;
  kind: PassengerKind;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  frequentFlyer: string;
  meal: string;
};

export type SelectedFare = {
  itinerary: Itinerary;
  fare: FareFamily | null;
  sessionId?: string;
  extras: {
    extraBag: boolean;
    insurance: boolean;
    priorityBoarding: boolean;
    /** Agency add-on package ids. Empty / omitted means nothing is added to the total. */
    packageIds?: string[];
    paidBaggage?: {
      id: string;
      weightKg: number;
      label: string;
      price: number;
      currency: string;
    };
  };
};

export type BookingStep = "passengers" | "review" | "payment" | "done";
