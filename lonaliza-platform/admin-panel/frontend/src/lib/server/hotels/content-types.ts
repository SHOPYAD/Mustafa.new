/**
 * Static hotel content (Trip.com style "content DB") — separated from live rates.
 * Filled by supplier content APIs / dumps, never by templates.
 */

import type { HotelSupplierId } from "@/lib/providers/adapters/common/types";

export interface HotelContentImage {
  url: string;
  /** Supplier room code when the picture belongs to a room. */
  roomCode?: string;
  /** Normalised category: exterior | room | lobby | pool | restaurant | spa | beach | other */
  category?: string;
  order?: number;
  /** Supplier-provided caption (Travelport "Guest Room,On-Site"). */
  caption?: string;
}

export interface HotelContentFacility {
  group: string;
  name: string;
  /** Supplier code (Hotelbeds facilityCode/groupCode, OTA code…). */
  code?: string;
  /** Present when the supplier says the facility is chargeable. */
  fee?: boolean;
}

export interface HotelContentRoom {
  code: string;
  name: string;
  description?: string;
  images: string[];
  sizeSqm?: number;
  beds?: string;
  maxAdults?: number;
  maxChildren?: number;
  maxPax?: number;
  facilities: string[];
}

export interface HotelContentPoi {
  name: string;
  distanceM?: number;
  type?: string;
}

export interface HotelContent {
  supplier: HotelSupplierId;
  supplierHotelId: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  countryCode?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  stars?: number;
  chain?: string;
  giataCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  checkInTime?: string;
  checkOutTime?: string;
  images: HotelContentImage[];
  facilities: HotelContentFacility[];
  rooms: HotelContentRoom[];
  pois: HotelContentPoi[];
  policies?: string[];
  reviewScore?: { source: string; score: number; scale: number; count?: number };
  language: string;
  fetchedAt: string;
}
