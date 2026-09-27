// src/lib/transfers/types.ts
/**
 * Lonaliza Enterprise Transfers & Daily Tours Type Definitions
 * Complete domain models for vehicle classes, Turkish zones, routes, tours,
 * supplier fleet, driver app integration, multi-stage bookings, and telemetry.
 */

export interface TransferI18nText {
  ar: string;
  en: string;
  tr: string;
}

export interface TransferImage {
  url: string;
  isCover?: boolean;
  credit?: string;
}

export interface TransferVehicleCapacity {
  passengers: number;
  luggageLarge: number;
  luggageSmall: number;
}

export interface TransferVehicleSpecs {
  doors: number;
  transmission: "automatic" | "manual";
  fuelType: "diesel" | "petrol" | "hybrid" | "electric";
}

export interface TransferRatingBreakdown {
  overall: number;
  punctuality: number;
  cleanliness: number;
  driver: number;
  valueForMoney: number;
  itinerary?: number;
}

export interface TransferVehicleClass {
  id: string;
  code: string;
  name: TransferI18nText;
  description: TransferI18nText;
  exampleModels: string[];
  images: TransferImage[];
  capacity: TransferVehicleCapacity;
  amenities: string[];
  specs: TransferVehicleSpecs;
  tier: "economy" | "comfort" | "business" | "vip" | "group";
  serviceTypes: ("transfer" | "daily_tour")[];
  displayOrder: number;
  rating: {
    avg: number;
    count: number;
  };
  origin: "master" | "supplier_submission";
  moderationStatus: "approved" | "pending" | "rejected";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferGeoPoint {
  lat: number;
  lng: number;
}

export interface TransferZone {
  id: string;
  code: string;
  name: TransferI18nText;
  city: string;
  country: string;
  kind: "airport" | "district" | "resort" | "city_center" | "landmark";
  airportCode?: string;
  center: TransferGeoPoint;
  radiusKm: number;
  popularityRank: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferNightSurcharge {
  startHour: number;
  endHour: number;
  amount: number;
  percent: number;
}

export interface TransferSeasonRule {
  label: string;
  startDate: string;
  endDate: string;
  amount: number;
  percent: number;
}

export interface TransferRoute {
  id: string;
  fromZoneId: string;
  toZoneId: string;
  vehicleClassId: string;
  direction: "both" | "oneway";
  basePrice: number;
  currency: string;
  returnDiscountPercent: number;
  nightSurcharge: TransferNightSurcharge;
  seasonRules?: TransferSeasonRule[];
  estimatedDurationMinutes: number;
  estimatedDistanceKm: number;
  supplierNet?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferTourStop {
  order: number;
  name: TransferI18nText;
  description: TransferI18nText;
  kind: "sightseeing" | "photo_stop" | "meal" | "shopping" | "free_time" | "cable_car" | "boat" | "viewpoint";
  lat?: number;
  lng?: number;
  stayMinutes: number;
  entranceFee?: {
    amount: number;
    currency: string;
    includedByDefault: boolean;
  };
  images?: TransferImage[];
}

export interface TransferTourPrice {
  vehicleClassId: string;
  price: number;
  currency: string;
  minPax: number;
  maxPax: number;
  netCost?: number;
}

export interface TransferTour {
  id: string;
  slug: string;
  title: TransferI18nText;
  summary: TransferI18nText;
  description: TransferI18nText;
  hubCity: string;
  country: string;
  category: "city" | "nature" | "historical" | "religious" | "shopping" | "adventure";
  durationHours: number;
  startTimeOptions?: string[];
  itinerary: TransferTourStop[];
  pickup: {
    instructions: TransferI18nText;
    windowMinutes: number;
  };
  prices: TransferTourPrice[];
  extraHourPrice: {
    amount: number;
    currency: string;
  };
  inclusions: string[];
  exclusions: string[];
  driverLanguages: string[];
  images: TransferImage[];
  popularityRank: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferSupplierPayoutVoucher {
  id: string;
  weekStart: string;
  weekEnd: string;
  amount: number;
  currency: string;
  voucherUrl: string;
  note?: string;
  uploadedAt: string;
}

export interface TransferSupplierDocument {
  kind: "commercial_registry" | "operating_license" | "tax_certificate" | "insurance";
  url: string;
  uploadedAt: string;
}

export interface TransferSupplier {
  id: string;
  accountType: "company" | "individual";
  legalName: string;
  tradeName: string;
  contactEmail: string;
  contactPhone: string;
  serviceTypes: ("transfer" | "daily_tour")[];
  commissionPct: number;
  autoApproveVehicles: boolean;
  settlementModel: "weekly" | "monthly" | "per_trip";
  status: "active" | "pending" | "suspended";
  documents: TransferSupplierDocument[];
  payoutVouchers: TransferSupplierPayoutVoucher[];
  rating: {
    avg: number;
    count: number;
  };
  stats: {
    tripsCompleted: number;
    offersReceived: number;
    offersAccepted: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferSupplierVehicle {
  id: string;
  supplierId: string;
  vehicleClassId: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  cleanlinessRating: number; // e.g. 98%
  ownImages: TransferImage[];
  driver: {
    name: string;
    phone: string;
    licenseNumber?: string;
    photoUrl?: string;
    languages: string[];
  };
  customPricing?: {
    transferPriceMarkup?: number;
    hourlyRates?: Record<number, number>; // hours -> price
  };
  moderationStatus: "approved" | "pending" | "rejected";
  moderationNote?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferContact {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  preferredLanguage: "ar" | "en" | "tr";
}

export interface TransferPassengers {
  adults: number;
  children: number;
  infants: number;
}

export interface TransferLuggage {
  large: number;
  small: number;
}

export interface TransferBookingLeg {
  direction: "outbound" | "inbound";
  fromZoneId?: string;
  toZoneId?: string;
  fromLabel: string;
  toLabel: string;
  address: string;
  lat?: number;
  lng?: number;
  scheduledAt: string;
  flight?: {
    number: string;
    airline?: string;
  };
  hotelName?: string;
  roomNumber?: string;
}

export interface TransferBookingTourData {
  tourId?: string;
  titleSnapshot: string;
  startAt: string;
  hours: number;
  pickupAddress: string;
  hotelName?: string;
  itineraryPdfUrl?: string;
  itinerarySummary?: string;
  customStops?: Array<{ name: string; durationMinutes: number }>;
}

export interface TransferPassportUpload {
  passengerName?: string;
  photoUrl: string;
  passportNumber?: string;
  nationality?: string;
}

export type TransferPaymentMode = "online_full" | "deposit_half" | "cash_arrival";
export type TransferPaymentStatus = "unpaid" | "partially_paid" | "paid" | "refunded";
export type TransferTripStatus =
  | "pending_assignment"
  | "offered"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface TransferBooking {
  id: string;
  bookingNumber: string;
  serviceType: "transfer" | "daily_tour";
  customerId?: string;
  contact: TransferContact;
  vehicleClassId: string;
  vehicleClassName?: string;
  passengers: TransferPassengers;
  luggage: TransferLuggage;
  tripType: "oneway" | "roundtrip";
  legs?: TransferBookingLeg[];
  tour?: TransferBookingTourData;
  pricing: {
    base: number;
    discountAmount: number;
    discountReason?: string;
    total: number;
    depositPaid?: number;
    remainingToCollect?: number;
    currency: string;
    supplierNet?: number;
    commissionAmount?: number;
  };
  paymentMode: TransferPaymentMode;
  paymentStatus: TransferPaymentStatus;
  status: TransferTripStatus;
  assignment?: {
    supplierId?: string;
    vehicleId?: string;
    driverName?: string;
    driverPhone?: string;
    plateNumber?: string;
    assignedAt?: string;
  };
  passengerPassports?: TransferPassportUpload[];
  flightTicketUrl?: string;
  flightNumber?: string;
  customerNotes?: string;
  adminNotes?: string;
  reviewId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferTelemetry {
  driverId: string;
  vehicleId: string;
  bookingId?: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  batteryPct?: number;
  updatedAt: string;
}

export interface TransferReview {
  id: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  serviceType: "transfer" | "daily_tour";
  vehicleClassId?: string;
  driverName?: string;
  ratings: {
    overall: number;
    cleanliness: number;
    punctuality: number;
    driver: number;
    valueForMoney: number;
  };
  comment: string;
  status: "published" | "pending" | "hidden";
  adminReply?: string;
  createdAt: string;
}

export interface TransferQuoteRequest {
  id: string;
  serviceType: "transfer" | "daily_tour" | "vip_custom";
  from: {
    label: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  to: {
    label: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  outboundAt: string;
  inboundAt?: string;
  passengers: TransferPassengers;
  luggage: TransferLuggage;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  status: "new" | "in_progress" | "quoted" | "won" | "lost";
  quotedAmount?: number;
  quotedCurrency?: string;
  internalNote?: string;
  createdAt: string;
  handledAt?: string;
}

export interface TransferGlobalSettings {
  onlineFullDiscountPercent: number; // e.g. 10%
  depositDiscountPercent: number; // e.g. 5%
  defaultCommissionPercent: number; // e.g. 15%
  autoApproveFleet: boolean; // default false
  baseCurrency: string; // USD
  emergencyContactPhone: string;
  emergencyContactWhatsapp: string;
}
