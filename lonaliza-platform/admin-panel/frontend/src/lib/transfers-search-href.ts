const DEFAULT_TRANSFER_OFFSET_DAYS = 3;
const DEFAULT_TRANSFER_TIME = "12:00";
const DEFAULT_GUESTS = "2";

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

/** Transfer date = today + offset, computed at click time. */
export function transferSearchDate(
  offsetDays = DEFAULT_TRANSFER_OFFSET_DAYS
): string {
  return formatYmd(addCalendarDays(new Date(), offsetDays));
}

export type TransfersSearchHrefOptions = {
  from: string;
  to: string;
  date?: string;
  time?: string;
  guests?: string | number;
};

/**
 * Builds `/transfers?from=&to=&date=` so the Travelpayouts/Intui widget
 * can prefill (and attempt to run) search. Currency is always USD.
 */
export function buildTransfersSearchHref(
  options: TransfersSearchHrefOptions
): string {
  const params = new URLSearchParams({
    from: options.from,
    to: options.to,
    pickup: options.from,
    dropoff: options.to,
    date: options.date || transferSearchDate(),
    time: options.time || DEFAULT_TRANSFER_TIME,
    guests: String(options.guests ?? DEFAULT_GUESTS),
    passengers: String(options.guests ?? DEFAULT_GUESTS),
    currency: "usd",
  });
  return `/transfers?${params.toString()}`;
}
