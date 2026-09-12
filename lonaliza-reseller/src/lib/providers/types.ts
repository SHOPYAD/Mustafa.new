export const PROVIDER_VERTICALS = ["flights", "hotels", "cars", "transfers"] as const;
export type ProviderVertical = (typeof PROVIDER_VERTICALS)[number];

export const PROVIDER_CATEGORIES = ["gds", "scraper", "affiliate"] as const;
export type ProviderCategory = (typeof PROVIDER_CATEGORIES)[number];

export const PROVIDER_INTEGRATIONS = ["live", "coming_soon"] as const;
export type ProviderIntegration = (typeof PROVIDER_INTEGRATIONS)[number];

export const PROVIDER_MODES = ["sandbox", "production"] as const;
export type ProviderMode = (typeof PROVIDER_MODES)[number];

export const PROVIDER_FIELD_KINDS = ["text", "password", "url"] as const;
export type ProviderFieldKind = (typeof PROVIDER_FIELD_KINDS)[number];

export const PROVIDER_IDS = [
  "air_scraper",
  "travelpayouts_flights",
  "pkfare",
  "seeru",
  "amadeus_flights",
  "travelport_flights",
  "biletbank",
  "iati",
  "biletdukkani",
  "turna_flights",
  "tbo_flights",
  "hotel_engine",
  "booking_com15",
  "travel_advisor",
  "hotels_internal",
  "amadeus_hotels",
  "travelport_hotels",
  "ratehawk",
  "tbo_hotels",
  "cars_internal",
  "travelpayouts_cars",
  "amadeus_cars",
  "travelport_cars",
  "tbo_cars",
  "cartrawler",
  "rentalcars",
  "sunnycars",
  "transfers_internal",
  "travelpayouts_transfers",
  "amadeus_transfers",
  "travelport_transfers",
  "tbo_transfers",
  "mozio",
  "kiwitaxi",
  "jayride",
  "gettransfer",
  "iway",
] as const;

export type CatalogProviderId = (typeof PROVIDER_IDS)[number];

export type ProviderFieldDef = {
  key: string;
  labelAr: string;
  hintAr: string;
  kind: ProviderFieldKind;
  required: boolean;
  placeholder?: string;
};

export type CatalogProvider = {
  id: CatalogProviderId;
  vertical: ProviderVertical;
  category: ProviderCategory;
  integration: ProviderIntegration;
  name: string;
  nameAr: string;
  logo: string;
  noteAr: string;
  docsUrl?: string;
  fields: readonly ProviderFieldDef[];
};

export type ProviderRuntimeState = {
  enabled: boolean;
  mode: ProviderMode;
  /** Custom logo URL or `/providers/custom/...` path; null/undefined = catalog default */
  customLogo?: string | null;
  fields: Record<string, string>;
};

export type ProvidersRegistryFile = {
  updatedAt: string;
  providers: Partial<Record<CatalogProviderId, ProviderRuntimeState>>;
};

export type ProviderClientState = {
  id: CatalogProviderId;
  enabled: boolean;
  ready: boolean;
  connected: boolean;
  mode: ProviderMode;
  customLogo?: string | null;
  fields: Record<string, string>;
  integration: ProviderIntegration;
};

export const NOT_INTEGRATED_AR = "قريباً — التكامل غير مفعّل";
export const COMING_SOON_LOCKED_AR =
  "مقفلة — لا يمكن فتح الإعدادات أو اختبار الاتصال قبل اكتمال التكامل";

export function isProviderMode(value: unknown): value is ProviderMode {
  return value === "sandbox" || value === "production";
}

export function providerModeLabel(mode: ProviderMode): string {
  switch (mode) {
    case "sandbox":
      return "تجريبي";
    case "production":
      return "إنتاج";
    default:
      return assertNever(mode, "mode");
  }
}

export function isCatalogProviderId(value: string): value is CatalogProviderId {
  return (PROVIDER_IDS as readonly string[]).includes(value);
}

export function assertNever(value: never, message: string): never {
  throw new Error(message);
}

export function providerVerticalLabel(vertical: ProviderVertical): string {
  switch (vertical) {
    case "flights":
      return "طيران";
    case "hotels":
      return "فنادق";
    case "cars":
      return "سيارات";
    case "transfers":
      return "ترانسفير";
    default:
      return assertNever(vertical, "vertical");
  }
}

export function providerCategoryLabel(category: ProviderCategory): string {
  switch (category) {
    case "gds":
      return "مزودو GDS / داتا حية / بنك مباشر";
    case "scraper":
      return "مزودو سكرابر / داتا حية عبر سكرابر";
    case "affiliate":
      return "ترافل بايوتس (عمولة)";
    default:
      return assertNever(category, "category");
  }
}

export function providerCategoryHint(category: ProviderCategory): string {
  switch (category) {
    case "gds":
      return "مخزون مباشر أو جملة أو GDS — الحجز الحي يعمل فقط بعد تكامل حقيقي.";
    case "scraper":
      return "داتا حية عبر سكرابر مفعّل حالياً في النظام.";
    case "affiliate":
      return "عمولة وتوجيه — ليست GDS ولا مخزون مباشر.";
    default:
      return assertNever(category, "category");
  }
}
