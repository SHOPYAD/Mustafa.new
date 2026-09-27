import type { HotelProvider } from "@/lib/hotels-config";

export type HotelRuntimeMode = "single" | "dual";

export type HotelEndpointUse =
  | "list"
  | "details"
  | "rooms"
  | "photos"
  | "reviews"
  | "facilities"
  | "policies"
  | "nearby"
  | "questions"
  | "destinations";

export const HOTEL_ENDPOINT_USES: readonly HotelEndpointUse[] = [
  "list",
  "details",
  "rooms",
  "photos",
  "reviews",
  "facilities",
  "policies",
  "nearby",
  "questions",
  "destinations",
] as const;

export const HOTEL_ENDPOINT_USE_AR: Record<HotelEndpointUse, string> = {
  list: "بحث قائمة",
  details: "تفاصيل فندق",
  rooms: "غرف وأسعار",
  photos: "صور",
  reviews: "تقييمات",
  facilities: "مرافق",
  policies: "سياسات",
  nearby: "أماكن قريبة",
  questions: "أسئلة وأجوبة",
  destinations: "وجهات / autocomplete",
};

export type HotelEndpointDef = {
  id: string;
  name: string;
  nameAr: string;
  path: string;
  method: "GET" | "POST";
  uses: HotelEndpointUse;
  defaultEnabled: boolean;
  deprecated?: boolean;
};

export type HotelEndpointState = {
  enabled: boolean;
  uses: HotelEndpointUse;
};

export type HotelMarkupScope = "all" | "country" | "city" | "provider";
export type HotelMarkupType = "percent" | "fixed";

export type HotelMarkupRule = {
  id: string;
  enabled: boolean;
  priority: number;
  scope: HotelMarkupScope;
  destination: string;
  provider: string;
  type: HotelMarkupType;
  value: number;
  currency: string;
};

export type HotelsRuntimeSettings = {
  mode: HotelRuntimeMode;
  providers: HotelProvider[];
  bookingEndpoints: Record<string, HotelEndpointState>;
  travelAdvisorEndpoints: Record<string, HotelEndpointState>;
  markupRules: HotelMarkupRule[];
};

export type HotelMarkupContext = {
  country?: string;
  city?: string;
  destination?: string;
  provider?: string;
  currency?: string;
};

type HotelPricedCard = {
  priceFrom: number | null;
  priceOriginal: number | null;
  nightly: number | null;
  totalStay: number | null;
  currency: string;
  city?: string;
  country?: string;
  source?: string;
};

type HotelPricedRoom = {
  price: number | null;
  nightly: number | null;
  totalStay: number | null;
  currency: string;
  rates: Array<{
    price: number | null;
    nightly: number | null;
    totalStay: number | null;
    currency: string;
  }>;
};

/** Booking.com15 paths actually wrapped in hotel-rooms-provider.ts */
export const BOOKING_RUNTIME_ENDPOINTS: readonly HotelEndpointDef[] = [
  {
    id: "searchDestination",
    name: "Search Hotel Destination",
    nameAr: "البحث عن الوجهة",
    path: "/api/v1/hotels/searchDestination",
    method: "GET",
    uses: "destinations",
    defaultEnabled: true,
  },
  {
    id: "getFilter",
    name: "Get Filter",
    nameAr: "فلاتر القائمة",
    path: "/api/v1/hotels/getFilter",
    method: "GET",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "getSortBy",
    name: "Sort By",
    nameAr: "ترتيب القائمة",
    path: "/api/v1/hotels/getSortBy",
    method: "GET",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "searchHotels",
    name: "Search Hotels",
    nameAr: "بحث الفنادق",
    path: "/api/v1/hotels/searchHotels",
    method: "GET",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "searchHotelsByCoordinates",
    name: "Search Hotels By Coordinates",
    nameAr: "بحث بالإحداثيات",
    path: "/api/v1/hotels/searchHotelsByCoordinates",
    method: "GET",
    uses: "nearby",
    defaultEnabled: false,
  },
  {
    id: "getHotelDetails",
    name: "Get Hotel Details",
    nameAr: "تفاصيل الفندق",
    path: "/api/v1/hotels/getHotelDetails",
    method: "GET",
    uses: "details",
    defaultEnabled: false,
  },
  {
    id: "getAvailability",
    name: "Get Room Availability",
    nameAr: "توفر الغرف",
    path: "/api/v1/hotels/getAvailability",
    method: "GET",
    uses: "rooms",
    defaultEnabled: false,
  },
  {
    id: "getDescriptionAndInfo",
    name: "Description And Info",
    nameAr: "الوصف والمعلومات",
    path: "/api/v1/hotels/getDescriptionAndInfo",
    method: "GET",
    uses: "details",
    defaultEnabled: false,
  },
  {
    id: "getRoomList",
    name: "Get Room List",
    nameAr: "قائمة الغرف",
    path: "/api/v1/hotels/getRoomList",
    method: "GET",
    uses: "rooms",
    defaultEnabled: false,
  },
  {
    id: "getPaymentFeatures",
    name: "Payment features of the Hotel",
    nameAr: "ميزات الدفع",
    path: "/api/v1/hotels/getPaymentFeatures",
    method: "GET",
    uses: "policies",
    defaultEnabled: false,
  },
  {
    id: "getHotelPolicies",
    name: "Get Hotel Policies",
    nameAr: "سياسات الفندق",
    path: "/api/v1/hotels/getHotelPolicies",
    method: "GET",
    uses: "policies",
    defaultEnabled: false,
  },
  {
    id: "propertyChildrenPolicies",
    name: "Property Children Policies",
    nameAr: "سياسات الأطفال",
    path: "/api/v1/hotels/propertyChildrenPolicies",
    method: "GET",
    uses: "policies",
    defaultEnabled: false,
  },
  {
    id: "getHotelReviewsFilterMetadata",
    name: "Hotel Reviews Filter Metadata",
    nameAr: "فلاتر التقييمات",
    path: "/api/v1/hotels/getHotelReviewsFilterMetadata",
    method: "GET",
    uses: "reviews",
    defaultEnabled: false,
  },
  {
    id: "getHotelReviewScores",
    name: "Hotel Review Scores",
    nameAr: "درجات التقييم",
    path: "/api/v1/hotels/getHotelReviewScores",
    method: "GET",
    uses: "reviews",
    defaultEnabled: true,
  },
  {
    id: "getHotelReviewsSortOption",
    name: "Hotel Reviews Sort",
    nameAr: "ترتيب التقييمات",
    path: "/api/v1/hotels/getHotelReviewsSortOption",
    method: "GET",
    uses: "reviews",
    defaultEnabled: false,
  },
  {
    id: "getHotelReviews",
    name: "Hotel Reviews (Tips)",
    nameAr: "تقييمات الضيوف",
    path: "/api/v1/hotels/getHotelReviews",
    method: "GET",
    uses: "reviews",
    defaultEnabled: true,
  },
  {
    id: "getQuestionAndAnswer",
    name: "Question And Answer",
    nameAr: "أسئلة وأجوبة",
    path: "/api/v1/hotels/getQuestionAndAnswer",
    method: "GET",
    uses: "questions",
    defaultEnabled: false,
  },
  {
    id: "getNearbyCities",
    name: "Nearby Cities",
    nameAr: "مدن قريبة",
    path: "/api/v1/hotels/getNearbyCities",
    method: "GET",
    uses: "nearby",
    defaultEnabled: false,
    deprecated: true,
  },
  {
    id: "getPopularAttractionNearBy",
    name: "Popular Attraction Near By",
    nameAr: "معالم قريبة",
    path: "/api/v1/hotels/getPopularAttractionNearBy",
    method: "GET",
    uses: "nearby",
    defaultEnabled: false,
  },
  {
    id: "getRoomListWithAvailability",
    name: "Get Room List With Availability",
    nameAr: "الغرف والأسعار",
    path: "/api/v1/hotels/getRoomListWithAvailability",
    method: "GET",
    uses: "rooms",
    defaultEnabled: false,
  },
  {
    id: "getHotelPhotos",
    name: "Get Hotel Photos",
    nameAr: "صور الفندق",
    path: "/api/v1/hotels/getHotelPhotos",
    method: "GET",
    uses: "photos",
    defaultEnabled: false,
  },
  {
    id: "getHotelFacilities",
    name: "Get Hotel Facilities",
    nameAr: "مرافق الفندق",
    path: "/api/v1/hotels/getHotelFacilities",
    method: "GET",
    uses: "facilities",
    defaultEnabled: false,
  },
];

/** Travel Advisor paths actually called from travel-advisor.ts */
export const TRAVEL_ADVISOR_RUNTIME_ENDPOINTS: readonly HotelEndpointDef[] = [
  {
    id: "locationsAutoComplete",
    name: "Locations auto-complete",
    nameAr: "اقتراح الوجهات",
    path: "/locations/v2/auto-complete",
    method: "GET",
    uses: "destinations",
    defaultEnabled: true,
  },
  {
    id: "hotelsV2List",
    name: "Hotels v2 list",
    nameAr: "قائمة الفنادق v2",
    path: "/hotels/v2/list",
    method: "POST",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "hotelsList",
    name: "Hotels v1 list",
    nameAr: "قائمة الفنادق v1",
    path: "/hotels/list",
    method: "GET",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "hotelsListByLatlng",
    name: "Hotels list by latlng",
    nameAr: "قائمة بالإحداثيات",
    path: "/hotels/list-by-latlng",
    method: "GET",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "hotelsListInBoundary",
    name: "Hotels list in boundary",
    nameAr: "قائمة داخل الحدود",
    path: "/hotels/list-in-boundary",
    method: "GET",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "hotelFiltersV2",
    name: "Hotel filters v2",
    nameAr: "فلاتر v2",
    path: "/hotel-filters/v2/list",
    method: "POST",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "hotelFiltersV1",
    name: "Hotel filters v1",
    nameAr: "فلاتر v1",
    path: "/hotel-filters/list",
    method: "GET",
    uses: "list",
    defaultEnabled: false,
  },
  {
    id: "hotelsV2Details",
    name: "Hotels v2 details",
    nameAr: "تفاصيل v2",
    path: "/hotels/v2/get-details",
    method: "POST",
    uses: "details",
    defaultEnabled: false,
  },
  {
    id: "hotelsV1Details",
    name: "Hotels v1 details",
    nameAr: "تفاصيل v1",
    path: "/hotels/get-details",
    method: "GET",
    uses: "details",
    defaultEnabled: false,
  },
  {
    id: "hotelsV2Photos",
    name: "Hotels v2 photos",
    nameAr: "صور v2",
    path: "/hotels/v2/get-photos",
    method: "POST",
    uses: "photos",
    defaultEnabled: false,
  },
  {
    id: "hotelsV1Photos",
    name: "Hotels v1 photos",
    nameAr: "صور v1",
    path: "/hotels/photos",
    method: "GET",
    uses: "photos",
    defaultEnabled: false,
  },
  {
    id: "hotelsV2Offers",
    name: "Hotels v2 offers",
    nameAr: "عروض الغرف",
    path: "/hotels/v2/get-offers",
    method: "POST",
    uses: "rooms",
    defaultEnabled: false,
  },
  {
    id: "hotelsV2Reviews",
    name: "Hotels v2 reviews",
    nameAr: "تقييمات v2",
    path: "/hotels/v2/get-reviews",
    method: "POST",
    uses: "reviews",
    defaultEnabled: true,
  },
];

function parseUse(raw: unknown, fallback: HotelEndpointUse): HotelEndpointUse {
  const value = String(raw || "").trim();
  for (const use of HOTEL_ENDPOINT_USES) {
    if (use === value) return use;
  }
  return fallback;
}

function statesFromCatalog(
  catalog: readonly HotelEndpointDef[],
  incoming?: Record<string, HotelEndpointState>
): Record<string, HotelEndpointState> {
  const out: Record<string, HotelEndpointState> = {};
  for (const item of catalog) {
    const prev = incoming?.[item.id];
    out[item.id] = {
      enabled: typeof prev?.enabled === "boolean" ? prev.enabled : item.defaultEnabled,
      uses: parseUse(prev?.uses, item.uses),
    };
  }
  return out;
}

function newHotelMarkupId(): string {
  return `hmk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const HOTEL_MARKUP_SCOPES: readonly HotelMarkupScope[] = ["all", "country", "city", "provider"];
const HOTEL_MARKUP_TYPES: readonly HotelMarkupType[] = ["percent", "fixed"];
const HOTEL_MARKUP_SCOPE_RANK: Record<HotelMarkupScope, number> = {
  provider: 3,
  city: 2,
  country: 1,
  all: 0,
};

export function sanitizeHotelMarkupRule(raw: unknown): HotelMarkupRule | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const scopeRaw = String(rec.scope || "").trim();
  const typeRaw = String(rec.type || "").trim();
  const scope = HOTEL_MARKUP_SCOPES.includes(scopeRaw as HotelMarkupScope)
    ? (scopeRaw as HotelMarkupScope)
    : "all";
  const type = HOTEL_MARKUP_TYPES.includes(typeRaw as HotelMarkupType)
    ? (typeRaw as HotelMarkupType)
    : "percent";
  const value = Number(rec.value);
  const priority = Number(rec.priority);
  return {
    id: String(rec.id || "").trim() || newHotelMarkupId(),
    enabled: rec.enabled !== false,
    priority: Number.isFinite(priority) ? Math.max(1, Math.round(priority)) : 100,
    scope,
    destination: String(rec.destination || "").trim(),
    provider: String(rec.provider || "").trim(),
    type,
    value: Number.isFinite(value) ? Math.max(0, value) : 0,
    currency: String(rec.currency || "USD").trim().toUpperCase() || "USD",
  };
}

export function createEmptyHotelMarkupRule(): HotelMarkupRule {
  return {
    id: newHotelMarkupId(),
    enabled: true,
    priority: 100,
    scope: "all",
    destination: "",
    provider: "",
    type: "percent",
    value: 0,
    currency: "USD",
  };
}

export function defaultHotelMarkupRule(): HotelMarkupRule {
  return {
    id: "hmk_default_all_15",
    enabled: true,
    priority: 100,
    scope: "all",
    destination: "",
    provider: "",
    type: "percent",
    value: 15,
    currency: "USD",
  };
}

export function defaultHotelsRuntime(provider: HotelProvider = "booking"): HotelsRuntimeSettings {
  const primary: HotelProvider =
    provider === "travel_advisor" || provider === "owned" || provider === "internal"
      ? provider
      : "booking";
  return {
    mode: "single",
    providers: [primary],
    bookingEndpoints: statesFromCatalog(BOOKING_RUNTIME_ENDPOINTS),
    travelAdvisorEndpoints: statesFromCatalog(TRAVEL_ADVISOR_RUNTIME_ENDPOINTS),
    markupRules: [defaultHotelMarkupRule()],
  };
}

export function sanitizeHotelsRuntime(
  raw: unknown,
  fallbackProvider: HotelProvider = "booking"
): HotelsRuntimeSettings {
  const base = defaultHotelsRuntime(fallbackProvider);
  if (!raw || typeof raw !== "object") return base;
  const rec = raw as Record<string, unknown>;
  const mode: HotelRuntimeMode = rec.mode === "dual" ? "dual" : "single";
  const allowed: HotelProvider[] = ["booking", "travel_advisor", "owned", "internal"];
  const incoming = Array.isArray(rec.providers)
    ? rec.providers
        .map((item) => String(item || "").trim())
        .filter((item): item is HotelProvider =>
          allowed.includes(item as HotelProvider)
        )
    : [];
  let providers: HotelProvider[] =
    incoming.length > 0 ? incoming : base.providers.slice();
  if (mode === "single") {
    providers = [providers[0] || fallbackProvider];
  } else {
    const pair = providers.filter(
      (item) => item === "booking" || item === "travel_advisor"
    );
    providers = pair.slice(0, 2);
    if (providers.length < 2) {
      if (!providers.includes("booking")) providers.push("booking");
      if (providers.length < 2 && !providers.includes("travel_advisor")) {
        providers.push("travel_advisor");
      }
    }
  }
  const markupRaw = Array.isArray(rec.markupRules) ? rec.markupRules : [];
  const markupRules = markupRaw
    .map((item) => sanitizeHotelMarkupRule(item))
    .filter((item): item is HotelMarkupRule => item !== null)
    .sort((a, b) => a.priority - b.priority);
  return {
    mode,
    providers,
    bookingEndpoints: statesFromCatalog(
      BOOKING_RUNTIME_ENDPOINTS,
      rec.bookingEndpoints && typeof rec.bookingEndpoints === "object"
        ? (rec.bookingEndpoints as Record<string, HotelEndpointState>)
        : undefined
    ),
    travelAdvisorEndpoints: statesFromCatalog(
      TRAVEL_ADVISOR_RUNTIME_ENDPOINTS,
      rec.travelAdvisorEndpoints && typeof rec.travelAdvisorEndpoints === "object"
        ? (rec.travelAdvisorEndpoints as Record<string, HotelEndpointState>)
        : undefined
    ),
    markupRules: markupRules.length ? markupRules : [defaultHotelMarkupRule()],
  };
}

const REVIEWS_ONLY_BOOKING_IDS = new Set([
  "searchDestination",
  "getHotelReviews",
  "getHotelReviewScores",
]);

const REVIEWS_ONLY_TRAVEL_ADVISOR_IDS = new Set([
  "locationsAutoComplete",
  "hotelsV2Reviews",
]);

function reviewsOnlyStates(
  catalog: readonly HotelEndpointDef[],
  keepIds: Set<string>
): Record<string, HotelEndpointState> {
  const out: Record<string, HotelEndpointState> = {};
  for (const item of catalog) {
    out[item.id] = { enabled: keepIds.has(item.id), uses: item.uses };
  }
  return out;
}

/** Keep RapidAPI for guest reviews + the one lookup each API needs to resolve a hotel id. */
export function applyReviewsOnlyHotelsRuntime(
  settings: HotelsRuntimeSettings
): HotelsRuntimeSettings {
  return {
    ...settings,
    bookingEndpoints: reviewsOnlyStates(BOOKING_RUNTIME_ENDPOINTS, REVIEWS_ONLY_BOOKING_IDS),
    travelAdvisorEndpoints: reviewsOnlyStates(
      TRAVEL_ADVISOR_RUNTIME_ENDPOINTS,
      REVIEWS_ONLY_TRAVEL_ADVISOR_IDS
    ),
  };
}

export function runtimePrimaryProvider(settings: HotelsRuntimeSettings): HotelProvider {
  return settings.providers[0] || "booking";
}

export function runtimeHasProvider(
  settings: HotelsRuntimeSettings,
  provider: HotelProvider
): boolean {
  return settings.providers.includes(provider);
}

export function bookingEndpointEnabled(
  settings: HotelsRuntimeSettings,
  idOrPath: string
): boolean {
  const byId = settings.bookingEndpoints[idOrPath];
  if (byId) return byId.enabled;
  const def = BOOKING_RUNTIME_ENDPOINTS.find((item) => item.path === idOrPath);
  if (!def) return true;
  return settings.bookingEndpoints[def.id]?.enabled ?? def.defaultEnabled;
}

export function travelAdvisorEndpointEnabled(
  settings: HotelsRuntimeSettings,
  idOrPath: string
): boolean {
  const byId = settings.travelAdvisorEndpoints[idOrPath];
  if (byId) return byId.enabled;
  const def = TRAVEL_ADVISOR_RUNTIME_ENDPOINTS.find((item) => item.path === idOrPath);
  if (!def) return true;
  return settings.travelAdvisorEndpoints[def.id]?.enabled ?? def.defaultEnabled;
}

export function providerForUse(
  settings: HotelsRuntimeSettings,
  use: HotelEndpointUse
): HotelProvider | null {
  const bookingOn = runtimeHasProvider(settings, "booking");
  const taOn = runtimeHasProvider(settings, "travel_advisor");
  if (settings.mode === "single" || !(bookingOn && taOn)) {
    return settings.providers[0] || null;
  }
  const bookingMatch = BOOKING_RUNTIME_ENDPOINTS.some(
    (item) =>
      item.uses === use &&
      (settings.bookingEndpoints[item.id]?.enabled ?? item.defaultEnabled) &&
      (settings.bookingEndpoints[item.id]?.uses ?? item.uses) === use
  );
  const taMatch = TRAVEL_ADVISOR_RUNTIME_ENDPOINTS.some(
    (item) =>
      item.uses === use &&
      (settings.travelAdvisorEndpoints[item.id]?.enabled ?? item.defaultEnabled) &&
      (settings.travelAdvisorEndpoints[item.id]?.uses ?? item.uses) === use
  );
  if (bookingMatch && !taMatch) return "booking";
  if (taMatch && !bookingMatch) return "travel_advisor";
  if (use === "reviews" && taMatch) return "travel_advisor";
  if (bookingMatch) return "booking";
  if (taMatch) return "travel_advisor";
  return settings.providers[0] || null;
}

function normHotelMatch(value: string): string {
  return value.trim().toLowerCase();
}

function hotelTokenMatches(ruleValue: string, candidate: string): boolean {
  const rule = normHotelMatch(ruleValue);
  const hay = normHotelMatch(candidate);
  if (!rule) return true;
  if (!hay) return false;
  return hay === rule || hay.includes(rule) || rule.includes(hay);
}

function hotelMarkupRuleMatches(rule: HotelMarkupRule, ctx: HotelMarkupContext): boolean {
  const destination = ctx.destination || ctx.city || ctx.country || "";
  switch (rule.scope) {
    case "all":
      return true;
    case "country":
      return Boolean(rule.destination && hotelTokenMatches(rule.destination, ctx.country || destination));
    case "city":
      return Boolean(rule.destination && hotelTokenMatches(rule.destination, ctx.city || destination));
    case "provider":
      return Boolean(rule.provider && hotelTokenMatches(rule.provider, ctx.provider || ""));
    default: {
      const _exhaustive: never = rule.scope;
      return _exhaustive;
    }
  }
}

export function selectHotelMarkupRule(
  rules: HotelMarkupRule[],
  ctx: HotelMarkupContext
): HotelMarkupRule | null {
  const matches = rules
    .filter((rule) => rule.enabled && hotelMarkupRuleMatches(rule, ctx))
    .sort((a, b) => {
      const spec = HOTEL_MARKUP_SCOPE_RANK[b.scope] - HOTEL_MARKUP_SCOPE_RANK[a.scope];
      if (spec !== 0) return spec;
      return a.priority - b.priority;
    });
  return matches[0] ?? null;
}

function markAmount(amount: number, rule: HotelMarkupRule): number {
  switch (rule.type) {
    case "percent":
      return Math.round(amount * (1 + rule.value / 100) * 100) / 100;
    case "fixed":
      return Math.round((amount + rule.value) * 100) / 100;
    default: {
      const _exhaustive: never = rule.type;
      return _exhaustive;
    }
  }
}

export function applyHotelMarkup(
  basePrice: number,
  rules: HotelMarkupRule[],
  ctx: HotelMarkupContext
): { price: number; rule: HotelMarkupRule | null } {
  const amount = Number(basePrice);
  if (!Number.isFinite(amount) || amount < 0) {
    return { price: 0, rule: null };
  }
  const rule = selectHotelMarkupRule(rules, ctx);
  if (!rule || rule.value <= 0) return { price: amount, rule };
  return { price: markAmount(amount, rule), rule };
}

export function reverseHotelMarkup(
  clientPrice: number,
  rules: HotelMarkupRule[],
  ctx: HotelMarkupContext
): { cost: number; profit: number; rule: HotelMarkupRule | null } {
  const paid = Number(clientPrice);
  if (!Number.isFinite(paid) || paid <= 0) {
    return { cost: 0, profit: 0, rule: null };
  }
  const rule = selectHotelMarkupRule(rules, ctx);
  if (!rule || rule.value <= 0) return { cost: paid, profit: 0, rule };
  switch (rule.type) {
    case "percent": {
      const cost = Math.round((paid / (1 + rule.value / 100)) * 100) / 100;
      return { cost, profit: Math.round((paid - cost) * 100) / 100, rule };
    }
    case "fixed": {
      const cost = Math.max(0, Math.round((paid - rule.value) * 100) / 100);
      return { cost, profit: Math.round((paid - cost) * 100) / 100, rule };
    }
    default: {
      const _exhaustive: never = rule.type;
      return { cost: paid, profit: 0, rule: _exhaustive };
    }
  }
}

function markNullable(value: number | null, rule: HotelMarkupRule | null): number | null {
  if (value == null || !Number.isFinite(value)) return value;
  if (!rule || rule.value <= 0) return value;
  return markAmount(value, rule);
}

export function hotelMarkupContextFromCard(card: HotelPricedCard): HotelMarkupContext {
  return {
    country: card.country,
    city: card.city,
    destination: card.city || card.country,
    provider: card.source,
    currency: card.currency,
  };
}

export function applyHotelMarkupToCard<T extends HotelPricedCard>(
  card: T,
  rules: HotelMarkupRule[]
): T {
  const rule = selectHotelMarkupRule(rules, hotelMarkupContextFromCard(card));
  if (!rule || rule.value <= 0) return card;
  return {
    ...card,
    priceFrom: markNullable(card.priceFrom, rule),
    priceOriginal: markNullable(card.priceOriginal, rule),
    nightly: markNullable(card.nightly, rule),
    totalStay: markNullable(card.totalStay, rule),
  };
}

export function applyHotelMarkupToRoom<T extends HotelPricedRoom>(
  room: T,
  rules: HotelMarkupRule[],
  ctx: HotelMarkupContext
): T {
  const rule = selectHotelMarkupRule(rules, ctx);
  if (!rule || rule.value <= 0) return room;
  return {
    ...room,
    price: markNullable(room.price, rule),
    nightly: markNullable(room.nightly, rule),
    totalStay: markNullable(room.totalStay, rule),
    rates: room.rates.map((rate) => ({
      ...rate,
      price: markNullable(rate.price, rule),
      nightly: markNullable(rate.nightly, rule),
      totalStay: markNullable(rate.totalStay, rule),
    })),
  };
}

export function applyHotelMarkupToCards<T extends HotelPricedCard>(
  cards: T[],
  rules: HotelMarkupRule[]
): T[] {
  if (!rules.some((rule) => rule.enabled && rule.value > 0)) return cards;
  return cards.map((card) => applyHotelMarkupToCard(card, rules));
}

export function applyHotelMarkupToRooms<T extends HotelPricedRoom>(
  rooms: T[],
  rules: HotelMarkupRule[],
  ctx: HotelMarkupContext
): T[] {
  if (!rules.some((rule) => rule.enabled && rule.value > 0)) return rooms;
  return rooms.map((room) => applyHotelMarkupToRoom(room, rules, ctx));
}

export function applyHotelMarkupToPublicHotel<
  T extends HotelPricedCard & { rooms?: R[] },
  R extends HotelPricedRoom,
>(hotel: T, rooms: R[], rules: HotelMarkupRule[]): { hotel: T; rooms: R[] } {
  const ctx = hotelMarkupContextFromCard(hotel);
  const markedRooms = applyHotelMarkupToRooms(rooms, rules, ctx);
  return {
    hotel: { ...applyHotelMarkupToCard(hotel, rules), rooms: markedRooms },
    rooms: markedRooms,
  };
}
