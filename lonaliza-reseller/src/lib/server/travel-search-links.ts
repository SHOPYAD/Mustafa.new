import { buildCarsSearchHref } from "@/lib/cars-search-href";
import { resolveLocationQuery } from "@/lib/cars/turkey-locations";
import { buildTransfersSearchHref } from "@/lib/transfers-search-href";
import {
  buildFlightsPageHref,
  extractIataCode,
} from "@/lib/travelpayouts-utils";
import type { Locale } from "@/lib/i18n/types";
import type {
  CarsSearchHints,
  FlightSearchHints,
  TransferSearchHints,
} from "@/types/sales-chat";

const ALLOWED_PREFIXES = [
  "/flights",
  "/transfers",
  "/cars",
  "/hotels",
  "/holidays",
  "/packages",
  "/package",
  "/vip-tours",
  "/tours",
];

const CITY_IATA: Record<string, string> = {
  istanbul: "IST",
  "istanbul (ist)": "IST",
  ist: "IST",
  saw: "SAW",
  "sahiha": "SAW",
  "sabiha": "SAW",
  antalya: "AYT",
  أسطنبول: "IST",
  اسطنبول: "IST",
  إسطنبول: "IST",
  أنطاليا: "AYT",
  انطاليا: "AYT",
  trabzon: "TZX",
  طرابزون: "TZX",
  ankara: "ESB",
  أنقرة: "ESB",
  انقره: "ESB",
  izmir: "ADB",
  أزمير: "ADB",
  cappadocia: "ASR",
  kapadokya: "ASR",
  كابادوكيا: "ASR",
  kayseri: "ASR",
  dubai: "DXB",
  دبي: "DXB",
  "abu dhabi": "AUH",
  "أبوظبي": "AUH",
  ابوظبي: "AUH",
  sharjah: "SHJ",
  الشارقة: "SHJ",
  doha: "DOH",
  الدوحة: "DOH",
  riyadh: "RUH",
  الرياض: "RUH",
  jeddah: "JED",
  جدة: "JED",
  kuwait: "KWI",
  الكويت: "KWI",
  bahrain: "BAH",
  البحرين: "BAH",
  muscat: "MCT",
  مسقط: "MCT",
  amman: "AMM",
  عمّان: "AMM",
  عمان: "AMM",
  cairo: "CAI",
  القاهرة: "CAI",
  london: "LHR",
  لندن: "LHR",
  paris: "CDG",
  باريس: "CDG",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value?: string): value is string {
  return Boolean(value && ISO_DATE.test(value));
}

export function sanitizeSiteHref(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  let value = String(raw).trim();
  if (!value) return undefined;

  try {
    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, "");
      if (host !== "lonaliza.com" && host !== "localhost") return undefined;
      value = `${url.pathname}${url.search}`;
    }
  } catch {
    return undefined;
  }

  if (!value.startsWith("/")) return undefined;
  if (value.startsWith("//")) return undefined;
  const pathOnly = value.split("?")[0];
  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`)
  );
  return allowed ? value : undefined;
}

export function resolveIataCode(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const fromExtract = extractIataCode(String(raw));
  if (fromExtract) return fromExtract;

  const key = String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (CITY_IATA[key]) return CITY_IATA[key];

  const loc = resolveLocationQuery(String(raw));
  if (loc?.iata) return loc.iata;
  if (loc?.type === "city") {
    const airport = resolveLocationQuery(`${loc.names.en} airport`);
    if (airport?.iata) return airport.iata;
  }
  return undefined;
}

export function buildAdvisorFlightHref(
  hints?: FlightSearchHints | null,
  fallbackHref?: string
): string | undefined {
  if (hints?.alreadyBookedFlights) return undefined;

  const fromIata = resolveIataCode(hints?.fromIata || hints?.from);
  const toIata = resolveIataCode(hints?.toIata || hints?.to);
  if (fromIata && toIata) {
    const guests = String(hints?.guests || "1");
    const flightType = hints?.flightType === "round-trip" ? "round-trip" : "one-way";
    return buildFlightsPageHref({
      fromIata,
      toIata,
      guests,
      cabinClass: hints?.cabinClass || "economy",
      flightType,
      date: isIsoDate(hints?.date) ? hints?.date : undefined,
      returnDate:
        flightType === "round-trip" && isIsoDate(hints?.returnDate)
          ? hints?.returnDate
          : undefined,
    });
  }

  return sanitizeSiteHref(fallbackHref);
}

export function buildAdvisorTransferHref(
  hints?: TransferSearchHints | null,
  fallbackHref?: string
): string | undefined {
  const from = String(hints?.from || "").trim();
  const to = String(hints?.to || "").trim();
  if (from && to) {
    return buildTransfersSearchHref({
      from,
      to,
      date: isIsoDate(hints?.date) ? hints.date : undefined,
      time: hints?.time,
      guests: hints?.guests,
    });
  }
  return sanitizeSiteHref(fallbackHref);
}

export function buildAdvisorCarsHref(
  hints?: CarsSearchHints | null,
  fallbackHref?: string,
  locale: Locale = "ar"
): string | undefined {
  const iata =
    resolveIataCode(hints?.iata || hints?.city) ||
    (hints?.city ? resolveIataCode(hints.city) : undefined);
  if (iata) {
    return buildCarsSearchHref({
      iata,
      locale,
      guests: Number(hints?.guests) || undefined,
      date: isIsoDate(hints?.date) ? hints.date : undefined,
      returnDate: isIsoDate(hints?.returnDate) ? hints.returnDate : undefined,
    });
  }
  return sanitizeSiteHref(fallbackHref);
}
