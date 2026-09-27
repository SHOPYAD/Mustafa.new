import type { SearchTabKey } from "@/data/search-tabs";
import { hotelSearchToParams } from "@/lib/hotel-search";
import { defaultHotelDates } from "@/lib/hotels-config";
import { hotelCityQuery, stayCheckout } from "@/lib/hotel-city-query";
import { buildCarsSearchHref } from "@/lib/cars-search-href";
import { buildTransfersSearchHref } from "@/lib/transfers-search-href";
import { extractIataCode } from "@/lib/travelpayouts-utils";
import { resolveIataCode } from "@/lib/server/travel-search-links";
import type { Locale } from "@/lib/i18n/types";
import {
  appendAgentParams,
  tabToIntent,
  type SearchAgentExtract,
  type SearchAgentIntent,
} from "@/lib/search-agent";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function isIso(value?: string): value is string {
  return Boolean(value && ISO.test(value));
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildSearchAgentHref(
  extract: SearchAgentExtract,
  tabHint: SearchTabKey,
  locale: Locale,
  sid: string
): { href?: string; missing: string[]; intent: SearchAgentIntent } {
  const intent =
    extract.intent && extract.intent !== "unknown"
      ? extract.intent
      : tabToIntent(tabHint);
  const missing: string[] = [...(extract.missing || [])];

  if (intent === "flight") {
    const fromIata =
      resolveIataCode(extract.from) || extractIataCode(extract.from || "") || "";
    const toIata =
      resolveIataCode(extract.to) || extractIataCode(extract.to || "") || "";
    if (!fromIata) missing.push("from");
    if (!toIata) missing.push("to");
    if (missing.includes("from") || missing.includes("to")) {
      return { missing: [...new Set(missing)], intent };
    }
    const date = isIso(extract.date) ? extract.date : todayPlus(7);
    const flightType = extract.returnDate === "" ? "one-way" : extract.flightType || "round-trip";
    const returnDate =
      flightType === "round-trip"
        ? isIso(extract.returnDate)
          ? extract.returnDate
          : addDays(date, 7)
        : undefined;
    const guests = String(Math.max(1, (extract.adults || 1) + (extract.children || 0)));
    const cabin = extract.cabinClass || "economy";
    const params = new URLSearchParams();
    params.set("from", fromIata);
    params.set("to", toIata);
    params.set("date", date);
    if (returnDate) params.set("returnDate", returnDate);
    params.set("guests", guests);
    params.set("adults", String(Math.max(1, extract.adults || 1)));
    params.set("flightType", flightType);
    params.set("tripType", flightType);
    params.set("class", cabin);
    if (extract.filters?.directOnly) params.set("directOnly", "1");
    if (extract.filters?.baggageKg) params.set("baggage", String(extract.filters.baggageKg));
    const href = appendAgentParams(`/flights/search?${params.toString()}`, sid);
    return { href, missing: [], intent };
  }

  if (intent === "hotel") {
    const q = hotelCityQuery(extract.destination || extract.to || "");
    if (!q) missing.push("destination");
    if (missing.length) return { missing: [...new Set(missing)], intent };
    const defaults = defaultHotelDates(3);
    const checkIn = isIso(extract.date) ? extract.date : defaults.checkIn;
    const checkOut = stayCheckout(checkIn, isIso(extract.returnDate) ? extract.returnDate : undefined, 3);
    const href = appendAgentParams(
      `/hotels?${hotelSearchToParams({
        q,
        geoId: "",
        destId: "",
        checkIn,
        checkOut,
        adults: Math.max(1, extract.adults || 2),
        children: extract.children || 0,
        rooms: Math.max(1, extract.rooms || 1),
        childrenAges: [],
        hotelName: extract.filters?.hotelName,
      })}`,
      sid
    );
    return { href, missing: [], intent };
  }

  if (intent === "transfers") {
    const from = String(extract.from || extract.pickup || "").trim();
    const to = String(extract.to || extract.dropoff || extract.destination || "").trim();
    if (!from) missing.push("from");
    if (!to) missing.push("to");
    if (missing.length) return { missing: [...new Set(missing)], intent };
    const href = appendAgentParams(
      buildTransfersSearchHref({
        from,
        to,
        date: isIso(extract.date) ? extract.date : todayPlus(3),
        time: extract.time || "12:00",
        guests: extract.adults || 2,
      }),
      sid
    );
    return { href, missing: [], intent };
  }

  if (intent === "cars") {
    const city = String(extract.pickup || extract.destination || extract.to || extract.from || "").trim();
    if (!city) missing.push("pickup");
    if (missing.length) return { missing: [...new Set(missing)], intent };
    const date = isIso(extract.date) ? extract.date : todayPlus(2);
    const returnDate = isIso(extract.returnDate) ? extract.returnDate : addDays(date, 7);
    const iata = resolveIataCode(city);
    const viaBuilder = iata
      ? buildCarsSearchHref({
          iata,
          locale,
          guests: extract.adults || 2,
          date,
          returnDate,
        })
      : `/cars?${new URLSearchParams({
          pickup: city,
          dropoff: String(extract.dropoff || city),
          date,
          returnDate,
          guests: String(extract.adults || 2),
        }).toString()}`;
    return { href: appendAgentParams(viaBuilder, sid), missing: [], intent };
  }

  if (intent === "tours") {
    const params = new URLSearchParams();
    if (extract.destination || extract.to) params.set("q", extract.destination || extract.to || "");
    if (isIso(extract.date)) params.set("date", extract.date);
    if (extract.adults) params.set("guests", String(extract.adults));
    return {
      href: appendAgentParams(params.toString() ? `/vip-tours?${params}` : "/vip-tours", sid),
      missing: [],
      intent,
    };
  }

  if (intent === "holiday" || intent === "offers") {
    const params = new URLSearchParams();
    if (extract.destination || extract.to) params.set("q", extract.destination || extract.to || "");
    params.set("type", intent === "offers" ? "offers" : "holiday");
    if (isIso(extract.date)) params.set("date", extract.date);
    if (extract.adults) params.set("guests", String(extract.adults));
    return { href: appendAgentParams(`/search?${params}`, sid), missing: [], intent };
  }

  if (intent === "visa") {
    const q = extract.destination || extract.to || "";
    return {
      href: appendAgentParams(q ? `/visa?q=${encodeURIComponent(q)}` : "/visa", sid),
      missing: [],
      intent,
    };
  }

  if (intent === "insurance") {
    const params = new URLSearchParams({ type: "insurance" });
    if (extract.destination) params.set("q", extract.destination);
    if (isIso(extract.date)) params.set("date", extract.date);
    if (isIso(extract.returnDate)) params.set("returnDate", extract.returnDate);
    if (extract.adults) params.set("guests", String(extract.adults));
    return { href: appendAgentParams(`/search?${params}`, sid), missing: [], intent };
  }

  return { missing: missing.length ? missing : ["intent"], intent };
}
