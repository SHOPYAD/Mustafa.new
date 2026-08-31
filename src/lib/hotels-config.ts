export type HotelProvider = "internal" | "travel_advisor" | "owned" | "booking";

export interface HotelsPublicConfig {
  provider: HotelProvider;
}

export const HOTELS_CONFIG_ENV_KEYS = [
  "NEXT_PUBLIC_HOTELS_PROVIDER",
  "RAPIDAPI_KEY",
  "RAPIDAPI_TRAVEL_ADVISOR_HOST",
  "RAPIDAPI_ROOMS_HOST",
  "RAPIDAPI_ROOMS_KEY",
  "BOOKING_COM_HOST",
  "BOOKING_COM_RAPIDAPI_KEY",
  "NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER",
  "HOTEL_ENGINE_URL",
  "HOTEL_ENGINE_TOKEN",
] as const;

export const TRAVEL_ADVISOR_HOST = "travel-advisor.p.rapidapi.com";
export const ROOMS_PROVIDER_HOST = "booking-com15.p.rapidapi.com";
export const ROOMS_PROVIDER_SUBSCRIBE_URL =
  "https://rapidapi.com/DataCrawler/api/booking-com15";

export const ISTANBUL_GEO_ID = "293974";

export function parseHotelProvider(raw: string | undefined): HotelProvider {
  const value = String(raw || "").trim().toLowerCase();
  if (value === "travel_advisor") return "travel_advisor";
  if (value === "owned") return "owned";
  if (value === "booking" || value === "booking_com15" || value === "booking-com15") {
    return "booking";
  }
  return "internal";
}

export function isBookingHotelsProvider(provider: HotelProvider | string | undefined): boolean {
  return parseHotelProvider(String(provider || "")) === "booking";
}

export function buildHotelsConfigFromMap(
  map: Record<string, string>
): HotelsPublicConfig {
  return {
    provider: parseHotelProvider(map.NEXT_PUBLIC_HOTELS_PROVIDER),
  };
}

export function getHotelsConfigFromEnv(): HotelsPublicConfig {
  return buildHotelsConfigFromMap({
    NEXT_PUBLIC_HOTELS_PROVIDER: process.env.NEXT_PUBLIC_HOTELS_PROVIDER || "",
  });
}

export function defaultHotelDates(nights = 3): {
  checkIn: string;
  checkOut: string;
} {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + nights);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { checkIn: iso(start), checkOut: iso(end) };
}

export function hotelApiSlug(
  id: string,
  source?: "booking" | "ta" | "owned" | "travel_advisor"
): string {
  const clean = String(id || "")
    .replace(/^(ta-|owned-|bk-)/, "")
    .trim();
  if (source === "booking" || String(id || "").startsWith("bk-")) return `bk-${clean}`;
  if (source === "owned" || String(id || "").startsWith("owned-")) return `owned-${clean}`;
  return `ta-${clean}`;
}

export function parseHotelApiId(slug: string): string | null {
  const s = String(slug || "").trim();
  if (s.startsWith("ta-") || s.startsWith("owned-") || s.startsWith("bk-")) {
    const id = s.replace(/^(ta-|owned-|bk-)/, "").trim();
    return id || null;
  }
  return null;
}

export function parseHotelRouteSource(
  slug: string
): "booking" | "ta" | "owned" | null {
  const s = String(slug || "").trim();
  if (s.startsWith("bk-")) return "booking";
  if (s.startsWith("owned-")) return "owned";
  if (s.startsWith("ta-")) return "ta";
  return null;
}

export type HotelProviderErrorCode =
  | "not_configured"
  | "invalid_key"
  | "quota"
  | "search_failed"
  | "engine_unavailable";

export function parseHotelApiJson(text: string): Record<string, unknown> {
  if (!text.trim()) return {};
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function normalizeHotelGeoId(raw: string): string {
  const s = String(raw || "").trim();
  if (/^\d+$/.test(s)) return s;
  for (const part of s.split(";")) {
    const n = part.replace(/^g/i, "");
    if (/^\d{3,}$/.test(n)) return n;
  }
  const m = s.match(/\d{3,}/);
  return m?.[0] || s;
}

export function hotelProviderErrorMessage(
  copy: {
    searchError: string;
    providerNotConfigured: string;
    providerInvalidKey: string;
    providerQuota: string;
    engineUnavailable: string;
  },
  code: unknown
): string {
  const resolved: HotelProviderErrorCode =
    code === "not_configured" ||
    code === "invalid_key" ||
    code === "quota" ||
    code === "search_failed" ||
    code === "engine_unavailable"
      ? code
      : "search_failed";
  switch (resolved) {
    case "not_configured":
    case "invalid_key":
    case "quota":
    case "engine_unavailable":
    case "search_failed":
      return copy.searchError;
    default: {
      const _exhaustive: never = resolved;
      return _exhaustive;
    }
  }
}

export const PUBLIC_HOTEL_EMPTY_COPY = "لا توجد نتائج لهذه التواريخ حالياً";

export function publicHotelErrorCode(
  code: unknown
): Exclude<HotelProviderErrorCode, "quota" | "not_configured" | "invalid_key"> {
  return code === "engine_unavailable" ? "engine_unavailable" : "search_failed";
}
