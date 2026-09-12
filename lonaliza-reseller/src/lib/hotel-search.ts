import { destIdForQuery } from "@/lib/booking-dest";
import { defaultHotelDates } from "@/lib/hotels-config";

export type HotelRoomStay = {
  adults: number;
  childrenAges: number[];
};

export type HotelSearchQuery = {
  q: string;
  geoId: string;
  destId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  childrenAges: number[];
};

const MAX_ROOMS = 8;
const MAX_ADULTS = 16;
const MAX_CHILDREN = 6;

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function parseChildrenAges(raw: string | null | undefined, count: number): number[] {
  const parts = String(raw || "")
    .split(",")
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 17);
  const ages = parts.slice(0, MAX_CHILDREN);
  const target = clampInt(count, 0, MAX_CHILDREN, ages.length);
  while (ages.length < target) ages.push(8);
  return ages.slice(0, target);
}

export function toAdvisorRooms(query: HotelSearchQuery): HotelRoomStay[] {
  const roomCount = clampInt(query.rooms, 1, MAX_ROOMS, 1);
  const adults = clampInt(query.adults, 1, MAX_ADULTS, 2);
  const ages = parseChildrenAges(query.childrenAges.join(","), query.children);
  const base = Math.floor(adults / roomCount);
  let extra = adults % roomCount;
  const rooms: HotelRoomStay[] = [];
  for (let i = 0; i < roomCount; i += 1) {
    const roomAdults = Math.max(1, base + (extra > 0 ? 1 : 0));
    if (extra > 0) extra -= 1;
    rooms.push({
      adults: roomAdults,
      childrenAges: i === 0 ? ages : [],
    });
  }
  return rooms;
}

export function occupancyCacheKey(rooms: HotelRoomStay[] | undefined, adults?: number): string {
  if (rooms?.length) {
    return rooms
      .map((r) => `${r.adults}:${(r.childrenAges || []).join("-")}`)
      .join("|");
  }
  return String(adults || 2);
}

function searchParam(sp: URLSearchParams | null, ...keys: string[]): string {
  if (!sp) return "";
  for (const key of keys) {
    const value = (sp.get(key) || "").trim();
    if (value) return value;
  }
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of sp.entries()) {
    if (wanted.has(key.toLowerCase()) && value.trim()) return value.trim();
  }
  return "";
}

export function parseHotelSearchParams(
  sp: URLSearchParams | null,
  defaults = defaultHotelDates()
): HotelSearchQuery {
  const rooms = clampInt(searchParam(sp, "rooms"), 1, MAX_ROOMS, 1);
  const adults = clampInt(searchParam(sp, "adults"), 1, MAX_ADULTS, 2);
  const children = clampInt(searchParam(sp, "children"), 0, MAX_CHILDREN, 0);
  const q = searchParam(sp, "q") || "Istanbul";
  return {
    q,
    geoId: searchParam(sp, "geoId", "geoid"),
    destId: destIdForQuery(q, searchParam(sp, "destId", "dest_id")),
    checkIn: searchParam(sp, "checkIn", "checkin") || defaults.checkIn,
    checkOut: searchParam(sp, "checkOut", "checkout") || defaults.checkOut,
    adults,
    children,
    rooms,
    childrenAges: parseChildrenAges(searchParam(sp, "childrenAges", "children_ages"), children),
  };
}

export function stayFromSearchParams(sp: URLSearchParams) {
  const query = parseHotelSearchParams(sp);
  return {
    query: query.q,
    geoId: query.geoId,
    destId: query.destId,
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    adults: query.adults,
    rooms: toAdvisorRooms(query),
  };
}

export function hotelSearchToParams(query: HotelSearchQuery): URLSearchParams {
  const qs = new URLSearchParams({
    q: query.q || "Istanbul",
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    adults: String(query.adults),
    children: String(query.childrenAges.length),
    rooms: String(query.rooms),
  });
  if (query.geoId) qs.set("geoId", query.geoId);
  if (query.destId) qs.set("destId", query.destId);
  if (query.childrenAges.length) qs.set("childrenAges", query.childrenAges.join(","));
  return qs;
}

export function syncHotelSearchUrl(query: HotelSearchQuery) {
  if (typeof window === "undefined") return;
  const next = `/hotels?${hotelSearchToParams(query).toString()}`;
  window.history.replaceState(null, "", next);
}

export type GeoPlaceHit = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  admin1: string;
  geoId: string;
  population: number;
};
