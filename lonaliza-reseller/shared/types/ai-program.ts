import type { SalesChatCard, SalesChatItinerary } from "@/types/sales-chat";

export type SavedAiProgram = {
  id: string;
  titleAr: string;
  titleEn: string;
  destination: string;
  nights: number;
  people?: number;
  arrivalDate?: string;
  departureDate?: string;
  priceFromUsd: number;
  thumbnail?: string;
  includesAr: string[];
  includesEn: string[];
  itinerary: SalesChatItinerary;
  cards?: SalesChatCard[];
  flightHref?: string;
  transferHref?: string;
  carsHref?: string;
  hidden: boolean;
  createdAt: string;
};

export type SavedAiProgramPublic = Omit<SavedAiProgram, "hidden">;

export type AiProgramInput = {
  titleAr: string;
  titleEn: string;
  destination: string;
  nights?: number;
  people?: number;
  arrivalDate?: string;
  departureDate?: string;
  priceFromUsd?: number;
  thumbnail?: string;
  includesAr?: string[];
  includesEn?: string[];
  itinerary: SalesChatItinerary;
  cards?: SalesChatCard[];
  flightHref?: string;
  transferHref?: string;
  carsHref?: string;
};
