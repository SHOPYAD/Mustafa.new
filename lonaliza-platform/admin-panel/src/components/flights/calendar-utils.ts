import type { CalendarDayPrice } from "@/components/flights/types";

export function ymdOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseYmd(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Normalize Sky Scrapper / engine day keys to YYYY-MM-DD. */
export function calendarDateKey(value: unknown): string {
  if (typeof value === "string") {
    const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return ymdOf(d);
  }
  return "";
}

/** Compact Western-numeral price for calendar cells and slider chips. */
export function formatCalendarPrice(amount: number): string {
  const n = Math.round(Number(amount) || 0);
  if (n >= 10000) {
    const k = n / 1000;
    const shown = k >= 100 ? String(Math.round(k)) : k.toFixed(1).replace(/\.0$/, "");
    return `${shown}k`;
  }
  return n.toLocaleString("en-US");
}

export function cheapestOf(days: CalendarDayPrice[]): number {
  const prices = days.map((row) => row.price).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : 0;
}

export function mergeCalendarDays(current: CalendarDayPrice[], incoming: CalendarDayPrice[]): CalendarDayPrice[] {
  const map = new Map(current.map((row) => [row.date, row]));
  for (const row of incoming) map.set(row.date, row);
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function sliderWindow(centerYmd: string, days: CalendarDayPrice[], afterDays = 45): string[] {
  const center = parseYmd(centerYmd) || new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime() < center.getTime() ? today : new Date(center.getFullYear(), center.getMonth(), center.getDate());
  const end = new Date(center.getFullYear(), center.getMonth(), center.getDate() + afterDays);
  const out: string[] = [];
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    out.push(ymdOf(d));
  }
  if (!days.length) return out;
  const priced = new Set(days.filter((row) => row.price > 0).map((row) => row.date));
  if (out.some((d) => priced.has(d))) return out;
  return days.filter((row) => row.price > 0).slice(0, afterDays).map((row) => row.date);
}
