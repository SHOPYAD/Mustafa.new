import type { SalesChatCard } from "@/types/sales-chat";

export type PlannerStopKind =
  | "attraction"
  | "hotel"
  | "food"
  | "restaurant"
  | "shopping"
  | "airport"
  | "transfer"
  | "viewpoint"
  | "custom";

export type PlannerTransportMode = "walk" | "drive" | "car" | "transit" | "line";

export type PlannerCompanion = "solo" | "family" | "couple" | "friends" | "elderly";
export type PlannerStyle =
  | "cultural"
  | "classic"
  | "nature"
  | "cityscape"
  | "historical"
  | "adventure"
  | "romantic"
  | "food"
  | "shopping"
  | "relaxation"
  | "photography"
  | "beaches"
  | "family"
  | "luxury";
export type PlannerPace = "ambitious" | "moderate" | "relaxed";
export type PlannerStay = "comfort" | "premium" | "luxury";
export type PlannerRhythm = "early" | "late";

export type PlannerPrefs = {
  companion: PlannerCompanion;
  style: PlannerStyle;
  styles?: PlannerStyle[];
  pace: PlannerPace;
  stay: PlannerStay;
  rhythm: PlannerRhythm;
  travelers?: number;
  notes: string;
};

export type PlannerIntake = {
  origin: string;
  destination: string;
  durationDays: number;
  month?: string;
  arrivalDate?: string;
  departureDate?: string;
  destLat?: number;
  destLng?: number;
  radiusKm?: number;
  transportMode?: PlannerTransportMode;
  locale?: "ar" | "en" | "tr" | "fr";
  prefs: PlannerPrefs;
};

export type PlannerStop = {
  id: string;
  day: number;
  order: number;
  kind: PlannerStopKind;
  titleAr: string;
  titleEn: string;
  detailAr?: string;
  detailEn?: string;
  lat: number;
  lng: number;
  image?: string;
  visitMinutes?: number;
  hours?: string;
  priceUsd?: number;
  free?: boolean;
  rating?: number;
  reviews?: number;
  href?: string;
  addedToDay?: number;
  slotAr?: string;
  slotEn?: string;
};

export type PlannerLeg = {
  fromId: string;
  toId: string;
  mode: PlannerTransportMode;
  minutes: number;
  km: number;
  polyline?: [number, number][];
  midpoint?: [number, number];
  estimated?: boolean;
};

export type PlannerDay = {
  day: number;
  titleAr: string;
  titleEn: string;
  notes: string;
  optimized?: boolean;
  stops: PlannerStop[];
  legs: PlannerLeg[];
};

export type PlannerTrip = {
  id: string;
  titleAr: string;
  titleEn: string;
  origin: string;
  destination: string;
  durationDays: number;
  arrivalDate?: string;
  departureDate?: string;
  prefs: PlannerPrefs;
  days: PlannerDay[];
  later: PlannerStop[];
  discover?: PlannerStop[];
  notes: string;
  tipsAr: string[];
  tipsEn: string[];
  cards?: SalesChatCard[];
  totalClientPrice?: number;
  currency?: string;
  defaultMode: PlannerTransportMode;
  radiusKm?: number;
  center: { lat: number; lng: number };
};

export type PlannerIdea = PlannerStop & {
  category: PlannerStopKind;
  distanceKm?: number;
};
