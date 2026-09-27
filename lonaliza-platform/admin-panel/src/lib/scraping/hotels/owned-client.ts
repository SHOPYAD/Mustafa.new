import { getServerEnv } from "@/lib/server/env-store";
import type {
  TravelAdvisorFilterGroup,
  TravelAdvisorHotelCard,
  TravelAdvisorHotelDetails,
  TravelAdvisorHotelPage,
  TravelAdvisorRoom,
} from "@/types/travel-advisor";

export class OwnedEngineError extends Error {
  readonly errorCode: "not_configured" | "engine_unavailable" | "search_failed";
  readonly httpStatus: number;

  constructor(
    errorCode: "not_configured" | "engine_unavailable" | "search_failed",
    message: string,
    httpStatus: number
  ) {
    super(message);
    this.name = "OwnedEngineError";
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
  }
}

async function engineConfig() {
  const url = (await getServerEnv("HOTEL_ENGINE_URL")).trim() || "http://127.0.0.1:3051";
  const token = (await getServerEnv("HOTEL_ENGINE_TOKEN")).trim();
  return { url: url.replace(/\/$/, ""), token };
}

async function engineFetch<T>(
  path: string,
  search: Record<string, string | number | undefined>
): Promise<T> {
  const { url, token } = await engineConfig();
  if (!token) {
    throw new OwnedEngineError(
      "not_configured",
      "محرك الفنادق الخاص غير مضبوط. أضف HOTEL_ENGINE_TOKEN.",
      503
    );
  }
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === "") continue;
    qs.set(key, String(value));
  }
  const href = `${url}${path}?${qs.toString()}`;
  let res: Response;
  try {
    res = await fetch(href, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new OwnedEngineError(
      "engine_unavailable",
      "تعذر الاتصال بمحرك الفنادق الخاص.",
      503
    );
  }
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    json = {};
  }
  if (res.status === 401) {
    throw new OwnedEngineError("not_configured", "توكن محرك الفنادق غير صالح.", 401);
  }
  if (!res.ok) {
    throw new OwnedEngineError(
      "search_failed",
      String(json.error || json.message || "Owned hotel engine request failed"),
      res.status >= 400 && res.status < 600 ? res.status : 502
    );
  }
  return json as T;
}

export async function ownedEngineHealth(): Promise<Record<string, unknown> | null> {
  try {
    return await engineFetch<Record<string, unknown>>("/v1/health", {});
  } catch {
    return null;
  }
}

export async function listOwnedHotels(input: {
  query: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  lang?: string;
  page?: number;
}): Promise<TravelAdvisorHotelPage> {
  const data = await engineFetch<{
    hotels?: TravelAdvisorHotelCard[];
    totalCount?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  }>("/v1/hotels/search", {
    q: input.query,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    lang: input.lang || "",
    page: input.page || 0,
  });
  const hotels = Array.isArray(data.hotels) ? data.hotels : [];
  return {
    hotels,
    totalCount: Number(data.totalCount || hotels.length),
    page: Number(data.page || 0),
    pageSize: Number(data.pageSize || 15),
    hasMore: Boolean(data.hasMore),
  };
}

export async function getOwnedHotelDetails(
  id: string,
  input: { checkIn: string; checkOut: string; adults: number; lang?: string; query?: string }
): Promise<TravelAdvisorHotelDetails | null> {
  const data = await engineFetch<{ hotel?: TravelAdvisorHotelDetails }>(
    "/v1/hotels/details",
    {
      id,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults,
      lang: input.lang || "",
      q: input.query || "",
    }
  );
  return data.hotel || null;
}

export async function getOwnedHotelRooms(input: {
  id: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  lang?: string;
}): Promise<TravelAdvisorRoom[]> {
  const data = await engineFetch<{ rooms?: TravelAdvisorRoom[] }>("/v1/hotels/rooms", {
    id: input.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    lang: input.lang || "",
  });
  return Array.isArray(data.rooms) ? data.rooms : [];
}

export async function getOwnedHotelOffers(input: {
  id: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  lang?: string;
}) {
  return engineFetch<{
    offers?: Array<Record<string, unknown>>;
    rooms?: TravelAdvisorRoom[];
  }>("/v1/hotels/offers", {
    id: input.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    lang: input.lang || "",
  });
}

export async function listOwnedHotelFilters(input: {
  query: string;
  checkIn: string;
  checkOut: string;
  lang?: string;
}): Promise<TravelAdvisorFilterGroup[]> {
  const data = await engineFetch<{ groups?: TravelAdvisorFilterGroup[] }>(
    "/v1/hotels/filters",
    {
      q: input.query,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      lang: input.lang || "",
    }
  );
  return Array.isArray(data.groups) ? data.groups : [];
}

export async function testOwnedHotelFetch(id?: string) {
  const { url, token } = await engineConfig();
  if (!token) {
    throw new OwnedEngineError("not_configured", "HOTEL_ENGINE_TOKEN missing", 503);
  }
  const qs = new URLSearchParams();
  if (id) qs.set("id", id);
  const res = await fetch(`${url}/v1/hotels/test?${qs.toString()}`, {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new OwnedEngineError("search_failed", String(json.message || "test failed"), res.status);
  }
  return json;
}

export function mapOwnedEnginePublicError(e: unknown): {
  errorCode: "not_configured" | "engine_unavailable" | "search_failed";
  error: string;
  status: number;
} {
  if (e instanceof OwnedEngineError) {
    return { errorCode: e.errorCode, error: e.message, status: e.httpStatus };
  }
  return {
    errorCode: "search_failed",
    error: "تعذر البحث عن الفنادق حالياً. حاول مرة أخرى.",
    status: 502,
  };
}
