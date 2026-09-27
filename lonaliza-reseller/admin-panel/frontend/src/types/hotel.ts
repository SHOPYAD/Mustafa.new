export interface HotelNearbyPlace {
  nameEn: string;
  nameAr: string;
  lat: number;
  lng: number;
  category?: "attraction" | "transport" | "dining" | "nature";
}

export interface HotelRoom {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  beds: string;
  capacity: number;
  sizeSqm: number;
  price: number;
  currency: string;
  amenities: string[];
  images: string[];
  breakfastIncluded: boolean;
  freeCancellation: boolean;
}

/** Real guest review excerpts attributed to Booking.com / Tripadvisor / etc. */
export interface HotelGuestReview {
  id: string;
  author: string;
  countryAr: string;
  countryEn: string;
  rating: number;
  date: string;
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
  source: "Tripadvisor" | "Booking.com" | "Google" | "Expedia";
  stayTypeAr: string;
  stayTypeEn: string;
}

export interface Hotel {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  city: string;
  country: string;
  neighborhoodAr: string;
  neighborhoodEn: string;
  stars: number;
  rating: number;
  reviewCount: number;
  addressAr: string;
  addressEn: string;
  descriptionAr: string;
  descriptionEn: string;
  highlightsAr: string[];
  highlightsEn: string[];
  images: string[];
  amenities: string[];
  nearbyAr?: string[];
  nearbyEn?: string[];
  nearbyPlaces?: HotelNearbyPlace[];
  guestReviews?: HotelGuestReview[];
  rooms: HotelRoom[];
  lat: number;
  lng: number;
  checkIn: string;
  checkOut: string;
  policiesAr: string[];
  policiesEn: string[];
  /** Digits with country code, e.g. 905321796763 */
  whatsappNumber: string;
  whatsappMessageAr: string;
  whatsappMessageEn: string;
  phone?: string;
  website?: string;
  isFeatured: boolean;
  isActive: boolean;
}

export type HotelInput = Omit<Hotel, "id">;
