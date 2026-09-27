import type { FlightDealsSource } from "@/lib/flights-config";

export type HomepageFlightDeal = {
  id: string;
  originIata: string;
  originNameAr: string;
  originNameEn: string;
  originNameTr: string;
  destIata: string;
  destNameAr: string;
  destNameEn: string;
  destNameTr: string;
  destImage: string;
  price: number | null;
  currency: string;
  href: string;
  airlineIata?: string;
  airlineName?: string;
  airlineLogo?: string;
  direct?: boolean;
  originSkyId?: string;
  originEntityId?: string;
  destSkyId?: string;
  destEntityId?: string;
};

export type HomepageFlightDealGroup = {
  destIata: string;
  destNameAr: string;
  destNameEn: string;
  destNameTr: string;
  destImage: string;
  offers: HomepageFlightDeal[];
};

export type HomepageFlightDealsPayload = {
  ok: true;
  source: FlightDealsSource;
  cachedAt: string | null;
  stale: boolean;
  groups: HomepageFlightDealGroup[];
  deals: HomepageFlightDeal[];
};
