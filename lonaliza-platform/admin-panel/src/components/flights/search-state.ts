import type { BaggageFilter, CabinClass, FlightSearchQuery, AirportPick, TripType } from "@/components/flights/types";
import { parseCabinClass } from "@/components/flights/normalize";

export const BOOKING_SESSION_KEY = "alrayyan_flight_booking";
export const NEARBY_SESSION_KEY = "alrayyan_flight_nearby";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function emptyQuery(currency = "USD"): FlightSearchQuery {
  return {
    tripType: "round-trip",
    origin: null,
    destination: null,
    date: "",
    returnDate: "",
    multiLegs: [
      { origin: null, destination: null, date: "" },
      { origin: null, destination: null, date: "" },
    ],
    adults: 1,
    childrens: 0,
    infants: 0,
    cabinClass: "economy",
    currency,
    directOnly: false,
    baggage: "any",
  };
}

export function parseAirportParam(prefix: string, params: URLSearchParams): AirportPick | null {
  const skyId = params.get(`${prefix}SkyId`) || "";
  const entityId = params.get(`${prefix}EntityId`) || "";
  if (!skyId || !entityId) return null;
  return {
    skyId,
    entityId,
    iata: (params.get(`${prefix}Iata`) || skyId).slice(0, 4),
    name: params.get(`${prefix}Label`) || params.get(`${prefix}Name`) || skyId,
    city: params.get(`${prefix}City`) || params.get(`${prefix}Label`) || skyId,
    country: params.get(`${prefix}Country`) || "",
    kind:
      params.get(`${prefix}Kind`) === "city" ||
      (params.get(`${prefix}EntityId`) || "").toLowerCase().startsWith("loc-c-")
        ? "city"
        : "airport",
  };
}

export function parseBaggageFilter(value: string | null): BaggageFilter {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "included" || raw === "bag" || raw === "yes") return "included";
  if (raw === "20" || raw === "20kg") return 20;
  if (raw === "23" || raw === "23kg") return 23;
  return "any";
}

function parseTripType(value: string | null): TripType {
  if (value === "one-way" || value === "oneway") return "one-way";
  if (value === "multi-city" || value === "multicity") return "multi-city";
  return "round-trip";
}

export function queryFromSearchParams(params: URLSearchParams, currency = "USD"): FlightSearchQuery {
  const guests = Math.max(1, Number(params.get("guests") || params.get("adults") || 1) || 1);
  const origin =
    parseAirportParam("origin", params) ||
    (params.get("from")
      ? {
          skyId: params.get("from") || "",
          entityId: params.get("originEntityId") || "",
          iata: (params.get("from") || "").slice(0, 4),
          name: params.get("from") || "",
          city: params.get("from") || "",
          country: "",
          kind: "airport",
        }
      : null);
  const destination =
    parseAirportParam("destination", params) ||
    (params.get("to")
      ? {
          skyId: params.get("to") || "",
          entityId: params.get("destinationEntityId") || "",
          iata: (params.get("to") || "").slice(0, 4),
          name: params.get("to") || "",
          city: params.get("to") || "",
          country: "",
          kind: "airport",
        }
      : null);

  const query = emptyQuery(params.get("currency") || currency);
  query.tripType = parseTripType(params.get("tripType") || params.get("flightType"));
  query.origin = origin && origin.skyId ? origin : null;
  query.destination = destination && destination.skyId ? destination : null;
  query.date = params.get("date") || "";
  query.returnDate = params.get("returnDate") || "";
  query.adults = Math.max(1, Number(params.get("adults") || guests) || 1);
  query.childrens = Math.max(0, Number(params.get("childrens") || params.get("children") || 0) || 0);
  query.infants = Math.max(0, Number(params.get("infants") || 0) || 0);
  query.cabinClass = parseCabinClass(params.get("cabinClass") || params.get("class"));
  query.directOnly = params.get("directOnly") === "1" || params.get("directOnly") === "true";
  query.baggage = parseBaggageFilter(params.get("baggage"));
  if (query.tripType === "multi-city") {
    try {
      const raw = JSON.parse(params.get("legs") || "[]") as unknown[];
      query.multiLegs = raw.map((item) => {
        const row = asRecord(item);
        const originPick = asRecord(row.origin);
        const destPick = asRecord(row.destination);
        return {
          origin: originPick.skyId
            ? {
                skyId: String(originPick.skyId),
                entityId: String(originPick.entityId || ""),
                iata: String(originPick.iata || originPick.skyId),
                name: String(originPick.name || originPick.skyId),
                city: String(originPick.city || originPick.name || ""),
                country: String(originPick.country || ""),
                kind: originPick.kind === "city" ? "city" : "airport",
              }
            : null,
          destination: destPick.skyId
            ? {
                skyId: String(destPick.skyId),
                entityId: String(destPick.entityId || ""),
                iata: String(destPick.iata || destPick.skyId),
                name: String(destPick.name || destPick.skyId),
                city: String(destPick.city || destPick.name || ""),
                country: String(destPick.country || ""),
                kind: destPick.kind === "city" ? "city" : "airport",
              }
            : null,
          date: String(row.date || ""),
        };
      });
      if (query.multiLegs.length < 2) {
        query.multiLegs = [
          { origin: query.origin, destination: query.destination, date: query.date },
          { origin: query.destination, destination: null, date: query.returnDate },
        ];
      }
    } catch {
      query.multiLegs = [
        { origin: query.origin, destination: query.destination, date: query.date },
        { origin: query.destination, destination: null, date: query.returnDate },
      ];
    }
  }
  return query;
}

function writeAirport(params: URLSearchParams, prefix: string, airport: AirportPick | null) {
  if (!airport) return;
  params.set(`${prefix}SkyId`, airport.skyId);
  params.set(`${prefix}EntityId`, airport.entityId);
  params.set(`${prefix}Iata`, airport.iata);
  params.set(`${prefix}Label`, airport.city || airport.name);
  params.set(`${prefix}Name`, airport.name);
  if (airport.country) params.set(`${prefix}Country`, airport.country);
  if (airport.kind) params.set(`${prefix}Kind`, airport.kind);
}

export function queryToSearchParams(query: FlightSearchQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set("tripType", query.tripType);
  writeAirport(params, "origin", query.origin);
  writeAirport(params, "destination", query.destination);
  if (query.date) params.set("date", query.date);
  if (query.returnDate) params.set("returnDate", query.returnDate);
  params.set("adults", String(query.adults));
  if (query.childrens) params.set("childrens", String(query.childrens));
  if (query.infants) params.set("infants", String(query.infants));
  params.set("cabinClass", query.cabinClass);
  params.set("currency", query.currency);
  if (query.origin) params.set("from", query.origin.iata || query.origin.skyId);
  if (query.destination) params.set("to", query.destination.iata || query.destination.skyId);
  params.set("flightType", query.tripType);
  params.set("class", query.cabinClass === "premium_economy" ? "premium" : query.cabinClass);
  if (query.directOnly) params.set("directOnly", "1");
  if (query.baggage !== "any") params.set("baggage", String(query.baggage));
  if (query.tripType === "multi-city") {
    params.set("legs", JSON.stringify(query.multiLegs));
  }
  return params;
}

export function searchHref(query: FlightSearchQuery): string {
  return `/flights/search?${queryToSearchParams(query).toString()}`;
}

export function bookingHref(): string {
  return "/flights/booking";
}

export function isSearchReady(query: FlightSearchQuery): boolean {
  if (query.tripType === "multi-city") {
    const legs = Array.isArray(query.multiLegs) ? query.multiLegs : [];
    const ready = legs.filter((leg) => leg.origin && leg.destination && /^\d{4}-\d{2}-\d{2}$/.test(leg.date));
    return ready.length >= 2;
  }
  if (!query.origin?.skyId || !query.origin.entityId) return false;
  if (!query.destination?.skyId || !query.destination.entityId) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(query.date)) return false;
  if (query.tripType === "round-trip" && !/^\d{4}-\d{2}-\d{2}$/.test(query.returnDate)) return false;
  return true;
}

export function passengerTotal(query: FlightSearchQuery): number {
  return query.adults + query.childrens + query.infants;
}

export function cabinFromParam(value: string | null): CabinClass {
  return parseCabinClass(value);
}
