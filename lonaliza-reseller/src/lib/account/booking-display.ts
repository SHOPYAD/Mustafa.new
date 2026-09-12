import type { InvoiceService } from "@/lib/booking-service";
import type { Locale } from "@/lib/i18n/types";

export const BOOKING_FILTERS = [
  "all",
  "flight",
  "hotel",
  "car",
  "transfer",
  "package",
  "enquiry",
] as const;

export type BookingFilter = (typeof BOOKING_FILTERS)[number];

export type AccountService = InvoiceService | "enquiry";

const AIRLINE_NAME_IATA: Array<[RegExp, string]> = [
  [/pegasus/i, "PC"],
  [/turkish airlines|\bthy\b/i, "TK"],
  [/flynas|nas air/i, "XY"],
  [/flyadeal/i, "F3"],
  [/saudia|saudi arabian/i, "SV"],
  [/emirates/i, "EK"],
  [/qatar airways/i, "QR"],
  [/flydubai/i, "FZ"],
  [/etihad/i, "EY"],
  [/ajet|anadolu/i, "VF"],
  [/sunexpress/i, "XQ"],
  [/air arabia/i, "G9"],
  [/nile air/i, "NP"],
  [/egyptair/i, "MS"],
  [/gulf air/i, "GF"],
  [/oman air/i, "WY"],
  [/middle east/i, "ME"],
  [/royal jordanian/i, "RJ"],
];

export function localeDateTag(locale: Locale): string {
  if (locale === "ar") return "ar-AE";
  if (locale === "tr") return "tr-TR";
  if (locale === "en") return "en-GB";
  return String(locale) || "en-GB";
}

function parseDateValue(value: string): Date | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const ms = Date.parse(normalized);
  if (Number.isFinite(ms)) return new Date(ms);
  if (isoDay) {
    return new Date(Date.UTC(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3])));
  }
  return null;
}

function isUtcMidnight(date: Date): boolean {
  return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
}

/** Human-readable date; hides midnight clock noise from ISO timestamps. */
export function formatHumanDate(value: string, locale: Locale): string {
  const date = parseDateValue(value);
  if (!date) return "";
  const tag = localeDateTag(locale);
  const showTime = !isUtcMidnight(date) && /T\d{2}:\d{2}/.test(String(value)) && !/T00:00/.test(String(value));
  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(showTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function formatHumanDateTime(value: string, locale: Locale): string {
  const date = parseDateValue(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(localeDateTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function parseRouteLine(raw: string): { origin: string; destination: string; route: string } {
  const text = String(raw || "").trim();
  const parts = text
    .split(/\s*(?:→|->|—|–|−)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    const origin = parts[0];
    const destination = parts[parts.length - 1];
    return { origin, destination, route: `${origin} → ${destination}` };
  }
  return { origin: "", destination: "", route: text };
}

export function guessAirlineCode(name: string, flightNumbers = ""): string {
  const fromFlights = /^([A-Z0-9]{2})\s?\d/i.exec(String(flightNumbers).trim());
  if (fromFlights) return fromFlights[1].toUpperCase();
  const label = String(name || "").trim();
  for (const [pattern, code] of AIRLINE_NAME_IATA) {
    if (pattern.test(label)) return code;
  }
  return "";
}

export function matchesBookingFilter(service: AccountService, filter: BookingFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "enquiry":
      return service === "enquiry";
    case "package":
      return service === "package" || service === "tour";
    case "flight":
    case "hotel":
    case "car":
    case "transfer":
      return service === filter;
    default: {
      const _never: never = filter;
      return _never;
    }
  }
}
