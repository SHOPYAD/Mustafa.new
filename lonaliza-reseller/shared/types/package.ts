// src/types/package.ts

export type TripType = 'holiday' | 'flight' | 'visa';

export type TripMode = 'group' | 'private_vip';

export interface ImageAsset {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  lat?: number;
  lng?: number;
}

export interface PackageReview {
  id: string;
  name: string;
  rating: number;
  textAr: string;
  textEn: string;
  textTr?: string;
  date: string;
  /** Sample / guest-style reviews — not live Google reviews */
  isSample?: boolean;
}

export interface MapPoint {
  lat: number;
  lng: number;
  labelAr: string;
  labelEn: string;
  labelTr?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionTr?: string;
  photo?: string;
  day?: number;
}

export type PackageTheme =
  | "classic"
  | "family"
  | "honeymoon"
  | "luxury"
  | "group"
  | "beach"
  | "nature";

export interface HolidayPackage {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  titleTr?: string;
  destination: string;
  destinationAr?: string;
  destinationEn?: string;
  destinationTr?: string;
  country: string;
  countryAr?: string;
  countryEn?: string;
  countryTr?: string;
  destinations?: string[];
  destinationsAr?: string[];
  destinationsEn?: string[];
  destinationsTr?: string[];
  durationDays: number;
  durationNights?: number;
  price: number;
  currency: string;
  rating?: number;
  images: ImageAsset[];
  amenities: string[];
  amenitiesAr?: string[];
  amenitiesTr?: string[];
  isFeatured?: boolean;
  /** Public catalog visibility. Missing / undefined means published. */
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  theme?: PackageTheme;
  // Rich content fields (managed via admin)
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionTr?: string;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: ItineraryDay[];
  inclusionsAr?: string[];
  inclusionsEn?: string[];
  inclusionsTr?: string[];
  exclusionsAr?: string[];
  exclusionsEn?: string[];
  exclusionsTr?: string[];
  itineraryAr?: ItineraryDay[];
  itineraryEn?: ItineraryDay[];
  itineraryTr?: ItineraryDay[];
  featuresAr?: string[];
  featuresEn?: string[];
  featuresTr?: string[];
  rulesAr?: string[];
  rulesEn?: string[];
  rulesTr?: string[];
  tipsAr?: string[];
  tipsEn?: string[];
  tipsTr?: string[];
  reviews?: PackageReview[];
  mapPoints?: MapPoint[];
  tripMode?: TripMode;
  groupSizeMin?: number;
  groupSizeMax?: number;
  lat?: number;
  lng?: number;
}

export interface FlightPackage {
  id: string;
  origin: string;
  destination: string;
  airline: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  currency: string;
  isRoundTrip: boolean;
}

export interface VisaService {
  id: string;
  country: string;
  visaType: string; // e.g., "Tourist", "Business"
  processingTime: string; // e.g., "3-5 days"
  price: number;
  currency: string;
  requirements: string[];
}

export interface SearchState {
  type: TripType;
  destination?: string;
  date?: string;
  returnDate?: string;
  guests?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  text: string;
  tripDestination: string;
}
