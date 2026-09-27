import type { Locale } from "@/lib/i18n/types";
import { localizeHotelLabel } from "@/lib/hotel-i18n";

export const HOTEL_PAGE_SIZE = 15;

function utcYmd(value: string): number {
  const raw = String(value || "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dots = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(raw);
  if (dots) return Date.UTC(Number(dots[3]), Number(dots[2]) - 1, Number(dots[1]));
  return Number.NaN;
}

export function hotelRatingLabel(
  rating: number,
  t: { ratingExcellent: string; ratingVeryGood: string; ratingGood: string }
): string {
  if (rating > 5) {
    if (rating >= 9) return t.ratingExcellent;
    if (rating >= 8) return t.ratingVeryGood;
    return t.ratingGood;
  }
  if (rating >= 4.5) return t.ratingExcellent;
  if (rating >= 4) return t.ratingVeryGood;
  return t.ratingGood;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = utcYmd(checkIn);
  const b = utcYmd(checkOut);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 3;
  return Math.max(1, Math.round((b - a) / 86400000));
}

export function pricesClose(a: number, b: number, tol = 0.12): boolean {
  if (!(a > 0) || !(b > 0)) return false;
  return Math.abs(a - b) / Math.max(a, b) <= tol;
}

/**
 * Classify an API amount as per-night or stay-total for the requested dates.
 * Never keep a stay-total from a different night count, and never multiply a
 * stay-total by nights again.
 */
export function resolveStayPrices(
  apiAmount: number | null,
  nights: number,
  stayTotalHint: number | null
): { nightly: number | null; totalStay: number | null; priceIsStayTotal: boolean } {
  const n = Math.max(1, nights);
  if (apiAmount == null || !(apiAmount > 0)) {
    return { nightly: null, totalStay: null, priceIsStayTotal: false };
  }
  const asNightlyTotal = apiAmount * n;
  if (stayTotalHint && pricesClose(stayTotalHint, asNightlyTotal)) {
    const shownNightly = Math.round(apiAmount);
    return {
      nightly: shownNightly,
      totalStay: shownNightly * n,
      priceIsStayTotal: false,
    };
  }
  if (stayTotalHint && n > 1 && pricesClose(stayTotalHint, apiAmount)) {
    const shownNightly = Math.max(1, Math.round(apiAmount / n));
    return {
      nightly: shownNightly,
      totalStay: shownNightly * n,
      priceIsStayTotal: true,
    };
  }
  if (n > 1 && apiAmount >= 900 && apiAmount / n >= 15 && apiAmount / n <= 800) {
    const shownNightly = Math.max(1, Math.round(apiAmount / n));
    return {
      nightly: shownNightly,
      totalStay: shownNightly * n,
      priceIsStayTotal: true,
    };
  }
  const shownNightly = Math.round(apiAmount);
  return {
    nightly: shownNightly,
    totalStay: shownNightly * n,
    priceIsStayTotal: false,
  };
}

/** Guest-facing money: shown nightly × nights. Never mix a separate rounded stay. */
export function stayFromNightly(
  nightly: number | null | undefined,
  nights: number
): { nightly: number; total: number } {
  const n = Math.max(1, Math.round(nights) || 1);
  const shown = nightly != null && Number.isFinite(nightly) && nightly > 0 ? Math.round(nightly) : 0;
  return { nightly: shown, total: shown * n };
}

export function fullLocationText(parts: {
  neighborhood?: string;
  address?: string;
  city?: string;
}): string {
  const city = (parts.city || "").trim();
  const neighborhood = (parts.neighborhood || "").trim();
  const address = (parts.address || "").trim();
  const uniq: string[] = [];
  for (const part of [neighborhood, address]) {
    if (!part) continue;
    if (city && part.toLowerCase() === city.toLowerCase()) continue;
    if (uniq.some((u) => u.toLowerCase() === part.toLowerCase())) continue;
    uniq.push(part);
  }
  if (uniq.length) return city && !uniq.join(" ").includes(city) ? `${uniq.join(" · ")}, ${city}` : uniq.join(" · ");
  return city;
}

export function localizeMaybeLabel(text: string, locale: Locale): string {
  return localizeHotelLabel(text, locale);
}

export function imageHostPath(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname.split("?")[0]}`;
  } catch {
    return url.split("?")[0];
  }
}
