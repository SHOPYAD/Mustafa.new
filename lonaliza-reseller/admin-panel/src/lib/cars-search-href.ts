import {
  getLocationByIata,
  locationDisplayName,
} from "@/lib/cars/turkey-locations";
import type { Locale } from "@/lib/i18n/types";

const DEFAULT_PICKUP_OFFSET_DAYS = 2;
const DEFAULT_RENTAL_DAYS = 7;
const DEFAULT_GUESTS = 2;

function addCalendarDays(base: Date, days: number): Date {
  const next = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function formatYmd(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Pickup today+offset, return pickup+stay — always computed at call time. */
export function carRentalSearchWindow(
  pickupOffsetDays = DEFAULT_PICKUP_OFFSET_DAYS,
  stayDays = DEFAULT_RENTAL_DAYS
): { date: string; returnDate: string } {
  const pickup = addCalendarDays(new Date(), pickupOffsetDays);
  const dropoff = addCalendarDays(pickup, stayDays);
  return { date: formatYmd(pickup), returnDate: formatYmd(dropoff) };
}

export type CarsSearchHrefOptions = {
  /** IATA or city slug used to prefill pickup / location. */
  iata: string;
  locale: Locale;
  guests?: number;
  /** yyyy-mm-dd. Defaults to today+2 when omitted. */
  date?: string;
  /** yyyy-mm-dd. Defaults to pickup+7 when omitted. */
  returnDate?: string;
};

/**
 * Builds `/cars?...` the same way the homepage Cars tab does:
 * internal fleet reads pickup/dropoff/date/returnDate/guests;
 * Travelpayouts reads location (+ dates) and currency=usd.
 */
export function buildCarsSearchHref(options: CarsSearchHrefOptions): string {
  const loc = getLocationByIata(options.iata);
  const pickupLabel = loc
    ? locationDisplayName(loc, options.locale)
    : options.iata;
  const tpLocation = loc ? `${loc.names.en} (${loc.iata})` : options.iata;
  const fallback = carRentalSearchWindow();
  const date =
    options.date && /^\d{4}-\d{2}-\d{2}$/.test(options.date)
      ? options.date
      : fallback.date;
  const returnDate =
    options.returnDate && /^\d{4}-\d{2}-\d{2}$/.test(options.returnDate)
      ? options.returnDate
      : fallback.returnDate;
  const params = new URLSearchParams({
    pickup: pickupLabel,
    dropoff: pickupLabel,
    location: tpLocation,
    date,
    returnDate,
    guests: String(options.guests ?? DEFAULT_GUESTS),
    currency: "usd",
  });
  return `/cars?${params.toString()}`;
}

export const DEFAULT_CARS_OFFER_IATA = "IST";
