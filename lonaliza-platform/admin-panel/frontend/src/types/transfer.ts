export type TransferType = "transfer" | "vip_tour";

export interface TransferReview {
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

export interface MapRoutePoint {
  lat: number;
  lng: number;
  labelAr: string;
  labelEn: string;
  labelTr?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  descriptionTr?: string;
  photo?: string;
}

export interface TransferService {
  id: string;
  slug: string;
  type: TransferType;
  titleAr: string;
  titleEn: string;
  titleTr?: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionTr?: string;
  vehicleName: string;
  vehicleType: string;
  vehicleClass: string;
  seats: number;
  luggage: number;
  price: number;
  currency: string;
  durationHours?: number;
  routeFrom?: string;
  routeTo?: string;
  routeFromAr?: string;
  routeToAr?: string;
  highlightsAr: string[];
  highlightsEn: string[];
  includesAr: string[];
  includesEn: string[];
  images: string[];
  /** WhatsApp booking — editable from admin */
  whatsappNumber: string;
  whatsappMessageAr: string;
  whatsappMessageEn: string;
  isFeatured: boolean;
  isActive: boolean;
  driverNameAr?: string;
  driverNameEn?: string;
  driverPhoto?: string;
  driverBioAr?: string;
  driverBioEn?: string;
  reviews?: TransferReview[];
  /** Interactive day markers for VIP tour maps */
  mapRoute?: MapRoutePoint[];
  programAr?: string[];
  programEn?: string[];
  programTr?: string[];
  carPhotos?: string[];
  tipsAr?: string[];
  tipsEn?: string[];
  excludedAr?: string[];
  excludedEn?: string[];
}

export type TransferInput = Omit<TransferService, "id">;
