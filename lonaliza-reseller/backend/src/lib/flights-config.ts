/**
 * SHARED FLIGHTS SETTINGS SCHEMA — admin + live engine. Do not rename fields.
 *
 * Env-store (secrets + compressed provider):
 *   NEXT_PUBLIC_FLIGHTS_PROVIDER  "travelpayouts" | "live" | "both" | "internal"(→live)
 *   SKY_SCRAPPER_RAPIDAPI_KEY     secret, never public, never hotel RapidAPI keys
 *   SKY_SCRAPPER_HOST             default sky-scrapper.p.rapidapi.com
 *   NEXT_PUBLIC_TRAVELPAYOUTS_*   existing white-label widget fields
 *
 * Runtime store (.data/flights-runtime.json via flights-runtime-store):
 *   mode            "single" | "dual"
 *   providers       FlightEngineProvider[]  ("live" | "travelpayouts")
 *   endpoints       Record<endpointId, { enabled, uses }>
 *   markupRules     FlightMarkupRule[]
 *
 * FlightMarkupRule: id, enabled, priority, scope ("all"|"country"|"city"|"route"),
 *   origin, destination, type ("percent"|"fixed"), value, currency
 * Scope "all" = every flight unless a narrower rule matches.
 * Match rank: route > city > country > all; same rank → lower priority first.
 *
 * Endpoint ids (Sky_Scrapper_Flight_Endpoints.md only):
 *   checkServer, getConfig, getLocale, getNearbyAirports, searchAirport,
 *   getPriceCalendar, searchFlights, searchIncomplete, searchFlightsMultiStops,
 *   searchFlightEverywhere, getFlightDetails
 */

import {
  isNumericTravelpayoutsId,
  isTravelpayoutsPlaceholder,
  resolveTravelpayoutsEmbedUrl,
} from "@/lib/travelpayouts-utils";

/** Compressed saved provider — source of truth for which engines are on. */
export type FlightProvider = "internal" | "live" | "travelpayouts" | "both";

/** Engines that can be toggled (legacy `internal` maps to `live`). */
export type FlightEngineProvider = "live" | "travelpayouts";

export type FlightRuntimeMode = "single" | "dual";

/** Homepage flight-offer tiles — mutually exclusive, never mixed. */
export type FlightDealsSource = "travelpayouts" | "live";

export interface TravelpayoutsPublicConfig {
  marker: string;
  trs: string;
  domain: string;
  widgetDomain: string;
  locale: string;
  currency: string;
  linkColor: string;
  embedScript: string;
  cookiePolicyScript: string;
}

export interface FlightsPublicConfig {
  provider: FlightProvider;
  travelpayouts: TravelpayoutsPublicConfig;
  mode: FlightRuntimeMode;
  providers: FlightEngineProvider[];
  liveEnabled?: boolean;
  travelpayoutsEnabled?: boolean;
  /** Resolved homepage deals source (one of the enabled engines). */
  dealsSource?: FlightDealsSource;
}

export const TRAVELPAYOUTS_WEEDLE_DESTINATIONS = [
  "IST",
  "DXB",
  "MOW",
  "LAS",
  "NYC",
  "LON",
] as const;

export const SKY_SCRAPPER_HOST = "sky-scrapper.p.rapidapi.com";
export const SKY_SCRAPPER_BASE_URL = "https://sky-scrapper.p.rapidapi.com";

export const FLIGHTS_CONFIG_ENV_KEYS = [
  "NEXT_PUBLIC_FLIGHTS_PROVIDER",
  "NEXT_PUBLIC_TRAVELPAYOUTS_MARKER",
  "NEXT_PUBLIC_TRAVELPAYOUTS_TRS",
  "NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN",
  "NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN",
  "NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT",
  "NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT",
  "NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE",
  "NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY",
  "NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR",
] as const;

export const FLIGHTS_ADMIN_ENV_KEYS = [
  ...FLIGHTS_CONFIG_ENV_KEYS,
  "SKY_SCRAPPER_RAPIDAPI_KEY",
  "SKY_SCRAPPER_HOST",
] as const;

export type FlightEndpointUse =
  | "health"
  | "config"
  | "locale"
  | "nearby"
  | "airports"
  | "calendar"
  | "search"
  | "poll"
  | "multistop"
  | "everywhere"
  | "details"
  | "seats"
  | "price"
  | "booking";

export const FLIGHT_ENDPOINT_USES: readonly FlightEndpointUse[] = [
  "health",
  "config",
  "locale",
  "nearby",
  "airports",
  "calendar",
  "search",
  "poll",
  "multistop",
  "everywhere",
  "details",
  "seats",
  "price",
  "booking",
] as const;

export const FLIGHT_ENDPOINT_USE_AR: Record<FlightEndpointUse, string> = {
  health: "حالة السيرفر",
  config: "إعدادات النظام",
  locale: "اللغات والأسواق",
  nearby: "مطارات قريبة",
  airports: "بحث مطارات",
  calendar: "تقويم الأسعار",
  search: "بحث رحلات",
  poll: "استكمال النتائج",
  multistop: "رحلات متعددة المحطات",
  everywhere: "استكشاف الوجهات",
  details: "تفاصيل الرحلة",
  seats: "مقاعد",
  price: "سعر",
  booking: "حجز",
};

export type FlightEndpointDef = {
  id: string;
  name: string;
  nameAr: string;
  descriptionAr: string;
  path: string;
  method: "GET";
  uses: FlightEndpointUse;
  defaultEnabled: boolean;
};

export type FlightEndpointState = {
  enabled: boolean;
  uses: FlightEndpointUse;
};

export type FlightMarkupScope = "all" | "country" | "city" | "route";
export type FlightMarkupType = "percent" | "fixed";

export type FlightMarkupRule = {
  id: string;
  enabled: boolean;
  priority: number;
  scope: FlightMarkupScope;
  origin: string;
  destination: string;
  type: FlightMarkupType;
  value: number;
  currency: string;
};

export type FlightsRuntimeSettings = {
  mode: FlightRuntimeMode;
  providers: FlightEngineProvider[];
  endpoints: Record<string, FlightEndpointState>;
  markupRules: FlightMarkupRule[];
  /** Preference used only when both engines are on. */
  dealsSource?: FlightDealsSource;
};

/** Paths only from Sky_Scrapper_Flight_Endpoints.md — do not invent routes. */
export const SKY_SCRAPPER_ENDPOINTS: readonly FlightEndpointDef[] = [
  {
    id: "checkServer",
    name: "Check Server Status",
    nameAr: "فحص حالة السيرفر",
    descriptionAr: "التحقق من جاهزية خدمة Sky Scrapper وتوفرها.",
    path: "/api/v1/checkServer",
    method: "GET",
    uses: "health",
    defaultEnabled: true,
  },
  {
    id: "getConfig",
    name: "Get Configuration",
    nameAr: "إعدادات النظام",
    descriptionAr: "الأسواق والعملات ورموز الدول الافتراضية.",
    path: "/api/v1/getConfig",
    method: "GET",
    uses: "config",
    defaultEnabled: true,
  },
  {
    id: "getLocale",
    name: "Get Locale",
    nameAr: "اللغات والمناطق",
    descriptionAr: "اللغات والمحليات المدعومة.",
    path: "/api/v1/getLocale",
    method: "GET",
    uses: "locale",
    defaultEnabled: true,
  },
  {
    id: "getNearbyAirports",
    name: "Get Nearby Airports",
    nameAr: "المطارات القريبة",
    descriptionAr: "أقرب مطارات تجارية من إحداثيات المستخدم.",
    path: "/api/v1/flights/getNearbyAirports",
    method: "GET",
    uses: "nearby",
    defaultEnabled: true,
  },
  {
    id: "searchAirport",
    name: "Search Airport",
    nameAr: "بحث المطار",
    descriptionAr: "إكمال تلقائي للمطارات والمدن للحصول على skyId و entityId.",
    path: "/api/v1/flights/searchAirport",
    method: "GET",
    uses: "airports",
    defaultEnabled: true,
  },
  {
    id: "getPriceCalendar",
    name: "Get Price Calendar",
    nameAr: "تقويم الأسعار",
    descriptionAr: "أدنى سعر يومي على مدى شهر بين نقطتين.",
    path: "/api/v1/flights/getPriceCalendar",
    method: "GET",
    uses: "calendar",
    defaultEnabled: true,
  },
  {
    id: "searchFlights",
    name: "Search Flights (v2)",
    nameAr: "بحث الرحلات (الإصدار 2)",
    descriptionAr: "محرك البحث الحي للذهاب أو الذهاب والعودة.",
    path: "/api/v2/flights/searchFlights",
    method: "GET",
    uses: "search",
    defaultEnabled: true,
  },
  {
    id: "searchIncomplete",
    name: "Search Incomplete",
    nameAr: "استكمال نتائج البحث",
    descriptionAr: "استطلاع العروض المتبقية عبر sessionId بعد بحث جزئي.",
    path: "/api/v2/flights/searchIncomplete",
    method: "GET",
    uses: "poll",
    defaultEnabled: true,
  },
  {
    id: "searchFlightsMultiStops",
    name: "Search Flights Multi Stops",
    nameAr: "بحث متعدد المحطات",
    descriptionAr: "رحلات متعددة المسارات بتواريخ مختلفة.",
    path: "/api/v1/flights/searchFlightsMultiStops",
    method: "GET",
    uses: "multistop",
    defaultEnabled: true,
  },
  {
    id: "searchFlightEverywhere",
    name: "Search Flight Everywhere",
    nameAr: "استكشاف كل الوجهات",
    descriptionAr: "أرخص الدول والمدن دون وجهة ثابتة.",
    path: "/api/v1/flights/searchFlightEverywhere",
    method: "GET",
    uses: "everywhere",
    defaultEnabled: true,
  },
  {
    id: "getFlightDetails",
    name: "Get Flight Details",
    nameAr: "تفاصيل الرحلة",
    descriptionAr: "القطاعات، الأمتعة، التوقفات، وروابط الحجز العميق.",
    path: "/api/v1/flights/getFlightDetails",
    method: "GET",
    uses: "details",
    defaultEnabled: true,
  },
];

export function parseFlightProvider(raw: string | undefined): FlightProvider {
  const value = String(raw || "")
    .trim()
    .toLowerCase();
  if (value === "travelpayouts") return "travelpayouts";
  if (value === "both" || value === "dual") return "both";
  if (
    value === "live" ||
    value === "sky_scrapper" ||
    value === "skyscrapper" ||
    value === "sky-scrapper" ||
    value === "internal"
  ) {
    return "live";
  }
  return "live";
}

export function providersFromCompressed(
  provider: FlightProvider
): FlightEngineProvider[] {
  switch (provider) {
    case "travelpayouts":
      return ["travelpayouts"];
    case "both":
      return ["live", "travelpayouts"];
    case "live":
    case "internal":
      return ["live"];
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

export function modeFromCompressed(provider: FlightProvider): FlightRuntimeMode {
  return provider === "both" ? "dual" : "single";
}

export function compressedFlightProvider(
  mode: FlightRuntimeMode,
  providers: FlightEngineProvider[]
): FlightProvider {
  const liveOn = providers.includes("live");
  const tpOn = providers.includes("travelpayouts");
  if (mode === "dual" || (liveOn && tpOn)) return "both";
  if (tpOn && !liveOn) return "travelpayouts";
  return "live";
}

export function isLiveFlightProvider(
  provider: FlightProvider | string | undefined
): boolean {
  const parsed = parseFlightProvider(String(provider || ""));
  return parsed === "live" || parsed === "both" || parsed === "internal";
}

export function usesTravelpayoutsProvider(
  provider: FlightProvider | string | undefined
): boolean {
  const parsed = parseFlightProvider(String(provider || ""));
  return parsed === "travelpayouts" || parsed === "both";
}

export function parseFlightDealsSource(raw: unknown): FlightDealsSource | undefined {
  if (raw === "travelpayouts" || raw === "live") return raw;
  return undefined;
}

/**
 * Homepage tiles are one source only.
 * Single engine → that engine. Both on → admin `dealsSource`, default Travelpayouts.
 */
export function resolveFlightDealsSource(
  providers: FlightEngineProvider[],
  preferred?: FlightDealsSource | null
): FlightDealsSource {
  const tp = providers.includes("travelpayouts");
  const live = providers.includes("live");
  if (tp && !live) return "travelpayouts";
  if (live && !tp) return "live";
  if (tp && live) {
    return preferred === "live" ? "live" : "travelpayouts";
  }
  return "live";
}

export function buildFlightsConfigFromMap(
  map: Record<string, string>
): FlightsPublicConfig {
  const provider = parseFlightProvider(map.NEXT_PUBLIC_FLIGHTS_PROVIDER);
  return {
    provider,
    mode: modeFromCompressed(provider),
    providers: providersFromCompressed(provider),
    liveEnabled: provider === "live" || provider === "both" || provider === "internal",
    travelpayoutsEnabled: provider === "travelpayouts" || provider === "both",
    travelpayouts: {
      marker: map.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || "",
      trs: map.NEXT_PUBLIC_TRAVELPAYOUTS_TRS || "",
      domain: map.NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN || "lonaliza.com",
      widgetDomain:
        map.NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN || "wl.aviasales.com",
      locale: map.NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE || "ar",
      currency: map.NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY || "usd",
      linkColor: map.NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR || "#f59e0b",
      embedScript: map.NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT || "",
      cookiePolicyScript: map.NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT || "",
    },
  };
}

/** Client/build-time fallback from process.env. */
export function getFlightsConfigFromEnv(): FlightsPublicConfig {
  const map: Record<string, string> = {};
  for (const key of FLIGHTS_CONFIG_ENV_KEYS) {
    const val = process.env[key];
    if (val) map[key] = val;
  }
  return buildFlightsConfigFromMap(map);
}

export function isTravelpayoutsReady(config: TravelpayoutsPublicConfig): boolean {
  const marker = config.marker.trim();
  const trs = config.trs.trim();
  const domain = config.domain.trim();

  if (!marker || !trs || !domain) return false;
  if (!isNumericTravelpayoutsId(marker) || !isNumericTravelpayoutsId(trs)) return false;
  if (isTravelpayoutsPlaceholder(marker, "marker")) return false;
  if (isTravelpayoutsPlaceholder(trs, "trs")) return false;

  const embedUrl = resolveTravelpayoutsEmbedUrl({
    marker,
    trs,
    domain,
    widgetDomain: config.widgetDomain,
    locale: config.locale,
    currency: config.currency,
    embedScript: config.embedScript,
  });

  return Boolean(embedUrl && !isTravelpayoutsPlaceholder(embedUrl, "embed"));
}

function parseEndpointUse(raw: unknown, fallback: FlightEndpointUse): FlightEndpointUse {
  const value = String(raw || "").trim();
  for (const use of FLIGHT_ENDPOINT_USES) {
    if (use === value) return use;
  }
  return fallback;
}

function endpointStatesFromCatalog(
  incoming?: Record<string, FlightEndpointState>
): Record<string, FlightEndpointState> {
  const out: Record<string, FlightEndpointState> = {};
  for (const item of SKY_SCRAPPER_ENDPOINTS) {
    const prev = incoming?.[item.id];
    out[item.id] = {
      enabled: typeof prev?.enabled === "boolean" ? prev.enabled : item.defaultEnabled,
      uses: parseEndpointUse(prev?.uses, item.uses),
    };
  }
  return out;
}

function newMarkupId(): string {
  return `mk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const MARKUP_SCOPES: readonly FlightMarkupScope[] = ["all", "country", "city", "route"];

/** Narrower match wins. Same scope → lower priority number first. */
const MARKUP_SCOPE_RANK: Record<FlightMarkupScope, number> = {
  route: 3,
  city: 2,
  country: 1,
  all: 0,
};
const MARKUP_TYPES: readonly FlightMarkupType[] = ["percent", "fixed"];

export function sanitizeFlightMarkupRule(raw: unknown): FlightMarkupRule | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const scopeRaw = String(rec.scope || "").trim();
  const typeRaw = String(rec.type || "").trim();
  const scope = MARKUP_SCOPES.includes(scopeRaw as FlightMarkupScope)
    ? (scopeRaw as FlightMarkupScope)
    : "route";
  const type = MARKUP_TYPES.includes(typeRaw as FlightMarkupType)
    ? (typeRaw as FlightMarkupType)
    : "percent";
  const value = Number(rec.value);
  const priority = Number(rec.priority);
  return {
    id: String(rec.id || "").trim() || newMarkupId(),
    enabled: rec.enabled !== false,
    priority: Number.isFinite(priority) ? Math.max(1, Math.round(priority)) : 100,
    scope,
    origin: String(rec.origin || "").trim(),
    destination: String(rec.destination || "").trim(),
    type,
    value: Number.isFinite(value) ? Math.max(0, value) : 0,
    currency: String(rec.currency || "USD").trim().toUpperCase() || "USD",
  };
}

export function createEmptyMarkupRule(): FlightMarkupRule {
  return {
    id: newMarkupId(),
    enabled: true,
    priority: 100,
    scope: "route",
    origin: "",
    destination: "",
    type: "percent",
    value: 0,
    currency: "USD",
  };
}

export function defaultFlightMarkupRule(): FlightMarkupRule {
  return {
    id: "mk_default_all_18",
    enabled: true,
    priority: 100,
    scope: "all",
    origin: "",
    destination: "",
    type: "percent",
    value: 18,
    currency: "USD",
  };
}

export function defaultFlightsRuntime(
  provider: FlightProvider = "live"
): FlightsRuntimeSettings {
  const compressed = parseFlightProvider(provider);
  return {
    mode: modeFromCompressed(compressed),
    providers: providersFromCompressed(compressed),
    endpoints: endpointStatesFromCatalog(),
    markupRules: [defaultFlightMarkupRule()],
    dealsSource: compressed === "live" || compressed === "internal" ? "live" : "travelpayouts",
  };
}

export function sanitizeFlightsRuntime(
  raw: unknown,
  fallbackProvider: FlightProvider = "live"
): FlightsRuntimeSettings {
  const base = defaultFlightsRuntime(fallbackProvider);
  if (!raw || typeof raw !== "object") return base;
  const rec = raw as Record<string, unknown>;
  const mode: FlightRuntimeMode = rec.mode === "dual" ? "dual" : "single";
  const incoming = Array.isArray(rec.providers)
    ? rec.providers
        .map((item) => String(item || "").trim())
        .map((item) => (item === "internal" ? "live" : item))
        .filter((item): item is FlightEngineProvider =>
          item === "live" || item === "travelpayouts"
        )
    : [];
  let providers: FlightEngineProvider[] =
    incoming.length > 0 ? incoming : base.providers.slice();
  if (mode === "single") {
    providers = [providers[0] || "live"];
  } else {
    const unique: FlightEngineProvider[] = [];
    for (const item of providers) {
      if (!unique.includes(item)) unique.push(item);
    }
    if (!unique.includes("live")) unique.unshift("live");
    if (!unique.includes("travelpayouts")) unique.push("travelpayouts");
    providers = unique.slice(0, 2);
  }
  const markupRaw = Array.isArray(rec.markupRules) ? rec.markupRules : [];
  const markupRules = (
    markupRaw
      .map((item) => sanitizeFlightMarkupRule(item))
      .filter((item): item is FlightMarkupRule => item !== null)
      .sort((a, b) => a.priority - b.priority)
  );
  const resolvedMarkup = markupRules.length ? markupRules : [defaultFlightMarkupRule()];
  return {
    mode,
    providers,
    endpoints: endpointStatesFromCatalog(
      rec.endpoints && typeof rec.endpoints === "object"
        ? (rec.endpoints as Record<string, FlightEndpointState>)
        : undefined
    ),
    markupRules: resolvedMarkup,
    dealsSource:
      parseFlightDealsSource(rec.dealsSource) ||
      resolveFlightDealsSource(providers, undefined),
  };
}

export function runtimePrimaryProvider(
  settings: FlightsRuntimeSettings
): FlightProvider {
  return compressedFlightProvider(settings.mode, settings.providers);
}

export function runtimeHasFlightProvider(
  settings: FlightsRuntimeSettings,
  provider: FlightEngineProvider
): boolean {
  return settings.providers.includes(provider);
}

export function flightEndpointEnabled(
  settings: FlightsRuntimeSettings,
  idOrPath: string
): boolean {
  const byId = settings.endpoints[idOrPath];
  if (byId) return byId.enabled;
  const def = SKY_SCRAPPER_ENDPOINTS.find((item) => item.path === idOrPath);
  if (!def) return true;
  return settings.endpoints[def.id]?.enabled ?? def.defaultEnabled;
}

function normMatch(value: string): string {
  return value.trim().toLowerCase();
}

function tokenMatches(ruleValue: string, candidate: string): boolean {
  const rule = normMatch(ruleValue);
  const hay = normMatch(candidate);
  if (!rule) return true;
  if (!hay) return false;
  return hay === rule || hay.includes(rule) || rule.includes(hay);
}

export type FlightMarkupContext = {
  originCountry?: string;
  destinationCountry?: string;
  originCity?: string;
  destinationCity?: string;
  origin?: string;
  destination?: string;
  currency?: string;
};

function flightMarkupRuleMatches(
  rule: FlightMarkupRule,
  ctx: FlightMarkupContext
): boolean {
  const origin = ctx.origin || ctx.originCity || ctx.originCountry || "";
  const destination =
    ctx.destination || ctx.destinationCity || ctx.destinationCountry || "";

  switch (rule.scope) {
    case "all":
      return true;
    case "country": {
      const hit =
        tokenMatches(rule.origin, ctx.originCountry || origin) ||
        tokenMatches(rule.destination, ctx.destinationCountry || destination) ||
        tokenMatches(rule.origin, ctx.destinationCountry || destination);
      return Boolean(hit && (rule.origin || rule.destination));
    }
    case "city": {
      const hit =
        tokenMatches(rule.origin, ctx.originCity || origin) ||
        tokenMatches(rule.destination, ctx.destinationCity || destination);
      return Boolean(hit && (rule.origin || rule.destination));
    }
    case "route": {
      const originHit = tokenMatches(rule.origin, origin);
      const destHit = rule.destination
        ? tokenMatches(rule.destination, destination)
        : true;
      return Boolean(originHit && destHit && rule.origin);
    }
    default: {
      const _exhaustive: never = rule.scope;
      return _exhaustive;
    }
  }
}

export function selectFlightMarkupRule(
  rules: FlightMarkupRule[],
  ctx: FlightMarkupContext
): FlightMarkupRule | null {
  const matches = rules
    .filter((rule) => rule.enabled && flightMarkupRuleMatches(rule, ctx))
    .sort((a, b) => {
      const spec = MARKUP_SCOPE_RANK[b.scope] - MARKUP_SCOPE_RANK[a.scope];
      if (spec !== 0) return spec;
      return a.priority - b.priority;
    });
  return matches[0] ?? null;
}

export function applyFlightMarkup(
  basePrice: number,
  rules: FlightMarkupRule[],
  ctx: FlightMarkupContext
): { price: number; rule: FlightMarkupRule | null } {
  const amount = Number(basePrice);
  if (!Number.isFinite(amount) || amount < 0) {
    return { price: 0, rule: null };
  }
  const rule = selectFlightMarkupRule(rules, ctx);
  if (!rule || rule.value <= 0) return { price: amount, rule };
  switch (rule.type) {
    case "percent":
      return { price: amount * (1 + rule.value / 100), rule };
    case "fixed":
      return { price: amount + rule.value, rule };
    default: {
      const _exhaustive: never = rule.type;
      return { price: amount, rule: _exhaustive };
    }
  }
}
