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

const CLOCK_RE = /(?:T|\s)(\d{2}:\d{2})(?::\d{2})?/;
const HM_ONLY_RE = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;
const HHMM_RE = /^(\d{2})(\d{2})$/;

function asTrimmed(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    const s = value.trim();
    return !s || s === "[object Object]" ? "" : s;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 1e11) return new Date(value).toISOString();
    if (value > 1e9) return new Date(value * 1000).toISOString();
  }
  return "";
}

export function isDateOnlyOrMidnightStamp(value: string): boolean {
  const raw = String(value || "").trim();
  if (!raw) return true;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return true;
  if (/T00:00(:00)?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/i.test(raw)) return true;
  if (/\s00:00(:00)?(\.\d+)?(Z)?$/i.test(raw)) return true;
  return false;
}

/** Pull an ISO / date-time stamp from supplier objects or strings. */
export function extractScheduleStamp(source: unknown): string {
  const direct = asTrimmed(source);
  if (direct) return direct;
  if (!source || typeof source !== "object") return "";
  const o = source as Record<string, unknown>;
  const keys = [
    "dateTime",
    "date_time",
    "iso",
    "timestamp",
    "departureTime",
    "arrivalTime",
    "strDepartureTime",
    "strArrivalTime",
    "departure",
    "arrival",
    "at",
    "time",
  ];
  for (const key of keys) {
    const nested = extractScheduleStamp(o[key]);
    if (nested) return nested;
  }
  const date = asTrimmed(o.date || o.departureDate || o.arrivalDate);
  const time = asTrimmed(o.time || o.clock || o.depTime || o.arrTime);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{1,2}:\d{2}/.test(time)) {
    const hm = time.length === 4 || time.length === 5 ? time.padStart(5, "0") : time;
    return `${date}T${hm}`;
  }
  return "";
}

/** HH:mm from a real schedule. Empty when the stamp is date-only / midnight placeholder. */
export function formatFlightClock(value: unknown): string {
  const raw = extractScheduleStamp(value);
  if (!raw) return "";
  const hmOnly = HM_ONLY_RE.exec(raw);
  if (hmOnly) {
    const clock = `${hmOnly[1].padStart(2, "0")}:${hmOnly[2]}`;
    return clock === "00:00" ? "" : clock;
  }
  if (HHMM_RE.test(raw) && raw.length === 4) {
    return `${raw.slice(0, 2)}:${raw.slice(2)}`;
  }
  if (isDateOnlyOrMidnightStamp(raw)) return "";
  const match = CLOCK_RE.exec(raw.includes("T") || raw.includes(" ") ? raw : `T${raw}`);
  if (match && match[1] && match[1] !== "00:00") return match[1];
  return "";
}

export function pickScheduleStamp(...candidates: unknown[]): string {
  const stamps = candidates.map(extractScheduleStamp).filter(Boolean);
  const withClock = stamps.find((s) => formatFlightClock(s));
  return withClock || "";
}

export function fareRulePills(text: string): string[] {
  return String(text || "")
    .split(/\s*[·•|,;/]\s*|\s+-{1,3}\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}

/** Never show B2B supply jargon (مورد / موزع / وسيط / supplier) to customers. */
export function customerFacingCopy(text: string): string {
  return String(text || "")
    .replace(/\(تنفّذها لوناليزا،?\s*مستقلة عن المورد\)/g, "")
    .replace(/مستقلة عن المورد/g, "")
    .replace(/لدى المورد/g, "")
    .replace(/وفق شروط المورد\.?/g, "وفق شروط الخدمة.")
    .replace(/سياسة المورد/g, "شروط الخدمة")
    .replace(/مزود الخدمة المباشر/g, "شروط التذكرة")
    .replace(/المزود المباشر/g, "شروط التذكرة")
    .replace(/هذا المورد/g, "هذه الخدمة")
    .replace(/\bالموردين\b/g, "الشركاء")
    .replace(/\bالمورد\b/g, "الخدمة")
    .replace(/\bالموزع\b/g, "")
    .replace(/\bالوسيط\b/g, "")
    .replace(/\bsuppliers?\b/gi, "the service")
    .replace(/\bdistributors?\b/gi, "")
    .replace(/\bwholesalers?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
}

export function formatDurationLabel(totalMinutes: number | undefined, locale: Locale): string {
  if (!totalMinutes || totalMinutes <= 0) return "";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (locale === "ar") {
    return `${h > 0 ? `${h} س` : ""}${h > 0 && m > 0 ? " " : ""}${m > 0 ? `${m} د` : ""}`.trim();
  }
  if (locale === "tr") {
    return `${h > 0 ? `${h} sa` : ""}${h > 0 && m > 0 ? " " : ""}${m > 0 ? `${m} dk` : ""}`.trim();
  }
  if (locale === "fr") {
    return `${h > 0 ? `${h} h` : ""}${h > 0 && m > 0 ? " " : ""}${m > 0 ? `${m} min` : ""}`.trim();
  }
  return `${h > 0 ? `${h}h` : ""}${h > 0 && m > 0 ? " " : ""}${m > 0 ? `${m}m` : ""}`.trim();
}
