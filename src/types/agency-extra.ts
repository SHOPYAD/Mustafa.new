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

/**
 * Fulfilment kind of a Lonaliza service. Lonaliza services are sold and fulfilled by Lonaliza,
 * never sent to the supplier (like Trip.com AirFlex):
 * - refund_guarantee: customer may cancel; Lonaliza refunds from its own wallet and cancels at the supplier.
 * - flex_change: one date change executed by Lonaliza staff at the supplier.
 * - insurance / extra_bag / priority / sms / other: fulfilled by Lonaliza operations after payment.
 */
export const AGENCY_EXTRA_KINDS = [
  "refund_guarantee",
  "flex_change",
  "insurance",
  "extra_bag",
  "priority",
  "sms",
  "other",
] as const;

export type AgencyExtraKind = (typeof AGENCY_EXTRA_KINDS)[number];

export function isAgencyExtraKind(value: string): value is AgencyExtraKind {
  return (AGENCY_EXTRA_KINDS as readonly string[]).includes(value);
}

export function kindFromIcon(icon: string): AgencyExtraKind {
  switch (icon) {
    case "refund":
      return "refund_guarantee";
    case "calendar":
      return "flex_change";
    case "insurance":
    case "shield":
      return "insurance";
    case "bag":
      return "extra_bag";
    case "priority":
      return "priority";
    case "sms":
      return "sms";
    default:
      return "other";
  }
}

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
  /** Fulfilment kind (drives the internal execution flow). */
  kind: AgencyExtraKind;
  /** Customer-facing terms & conditions, editable from the admin. */
  termsAr: string;
  termsEn: string;
  termsTr: string;
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
