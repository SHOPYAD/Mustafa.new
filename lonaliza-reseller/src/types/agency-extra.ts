export const AGENCY_EXTRA_ICONS = [
  "refund",
  "bag",
  "insurance",
  "priority",
  "sms",
  "calendar",
  "shield",
  "star",
] as const;

export type AgencyExtraIcon = (typeof AGENCY_EXTRA_ICONS)[number];

export const AGENCY_EXTRA_SERVICES = [
  "flights",
  "hotels",
  "cars",
  "transfers",
  "tours",
] as const;

export type AgencyExtraService = (typeof AGENCY_EXTRA_SERVICES)[number];

export const AGENCY_EXTRA_PRICE_TYPES = ["fixed", "percent"] as const;

export type AgencyExtraPriceType = (typeof AGENCY_EXTRA_PRICE_TYPES)[number];

export type AgencyExtraPackage = {
  id: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  descAr: string;
  descEn: string;
  descTr: string;
  priceType: AgencyExtraPriceType;
  priceValue: number;
  serviceTypes: AgencyExtraService[];
  isActive: boolean;
  sort: number;
  icon: AgencyExtraIcon;
  createdAt: string;
  updatedAt: string;
};

export type AgencyExtraInput = Partial<AgencyExtraPackage> & {
  id?: string;
};

export function isAgencyExtraIcon(value: string): value is AgencyExtraIcon {
  return (AGENCY_EXTRA_ICONS as readonly string[]).includes(value);
}

export function isAgencyExtraService(value: string): value is AgencyExtraService {
  return (AGENCY_EXTRA_SERVICES as readonly string[]).includes(value);
}

export function isAgencyExtraPriceType(value: string): value is AgencyExtraPriceType {
  return (AGENCY_EXTRA_PRICE_TYPES as readonly string[]).includes(value);
}
