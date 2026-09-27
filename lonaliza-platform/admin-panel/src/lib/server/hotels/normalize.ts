/**
 * Small pure helpers shared by all hotel supplier adapters.
 */

import type { BoardCode, CancellationPolicyRule, HotelSupplierId } from "@/lib/providers/adapters/common/types";

export const SUPPLIER_PREFIX: Record<HotelSupplierId, string> = {
  hotelbeds: "hb_",
  travelport: "tph_",
  ratehawk: "rh_",
  seeru: "sh_",
};

export function publicHotelId(supplier: HotelSupplierId, supplierHotelId: string): string {
  return `${SUPPLIER_PREFIX[supplier]}${supplierHotelId}`;
}

export function splitPublicHotelId(id: string): { supplier: HotelSupplierId; supplierHotelId: string } | null {
  const s = String(id || "").trim();
  for (const [supplier, prefix] of Object.entries(SUPPLIER_PREFIX) as Array<[HotelSupplierId, string]>) {
    if (s.startsWith(prefix)) return { supplier, supplierHotelId: s.slice(prefix.length) };
  }
  return null;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 1;
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

export function toNumber(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Maps supplier board / meal codes to a normalised BoardCode. Unknown → OTHER (never guessed). */
export function normalizeBoard(raw?: string | null): BoardCode {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "OTHER";
  if (/^(ro|room only|room_only|nomeal|no meal|sa|self ?catering|ep|european)/.test(s)) return "RO";
  if (/^(bb|breakfast|bed and breakfast|bed & breakfast|cb|ab|b&b)/.test(s) || s === "breakfast") return "BB";
  if (/^(hb|half|half-board|half_board|mp|modified)/.test(s)) return "HB";
  if (/^(fb|full|full-board|full_board|pc|pensao)/.test(s)) return "FB";
  if (/^(uai|ultra)/.test(s)) return "UAI";
  if (/^(ai|all|all-inclusive|all_inclusive|ti|inclusive)/.test(s)) return "AI";
  return "OTHER";
}

export const BOARD_LABEL_AR: Record<BoardCode, string> = {
  RO: "الغرفة فقط",
  BB: "شامل الإفطار",
  HB: "نصف إقامة",
  FB: "إقامة كاملة",
  AI: "شامل جميع الوجبات",
  UAI: "شامل كلياً (Ultra)",
  OTHER: "حسب المورد",
};

export type CancellationType = "free" | "fee_applies" | "non_refundable";

export interface DerivedCancellation {
  refundable: boolean;
  cancellationType: CancellationType;
  freeCancellationUntil?: string;
  currentPenalty?: { amount: number; currency: string };
  upcomingPenalty?: { from: string; amount: number; currency: string };
}

/**
 * Derives `refundable`, `cancellationType`, and `freeCancellationUntil` from penalty rules.
 * Never labels a room non-refundable if the supplier allows cancellation with a partial penalty fee.
 */
export function deriveCancellation(
  rules: CancellationPolicyRule[],
  now = Date.now(),
  isExplicitNrf = false,
  totalRatePrice?: number
): DerivedCancellation {
  if (isExplicitNrf) {
    return { refundable: false, cancellationType: "non_refundable" };
  }

  const sorted = [...rules]
    .filter((r) => r && r.from && Number.isFinite(Date.parse(r.from)))
    .sort((a, b) => Date.parse(a.from) - Date.parse(b.from));

  if (!sorted.length) {
    return { refundable: !isExplicitNrf, cancellationType: isExplicitNrf ? "non_refundable" : "free" };
  }

  const first = sorted[0];
  const firstStart = Date.parse(first.from);

  if (firstStart > now) {
    // Free window until first penalty kicks in
    return {
      refundable: true,
      cancellationType: "free",
      freeCancellationUntil: first.from,
      upcomingPenalty: { from: first.from, amount: first.amount, currency: first.currency },
    };
  }

  // Already inside a penalty window
  let activeRule = first;
  for (const r of sorted) {
    if (Date.parse(r.from) <= now) {
      activeRule = r;
    }
  }

  if (activeRule.amount <= 0) {
    const nextWithPenalty = sorted.find((r) => Date.parse(r.from) > now && r.amount > 0);
    return {
      refundable: true,
      cancellationType: "free",
      freeCancellationUntil: nextWithPenalty?.from,
      upcomingPenalty: nextWithPenalty
        ? { from: nextWithPenalty.from, amount: nextWithPenalty.amount, currency: nextWithPenalty.currency }
        : undefined,
    };
  }

  const isFullPenalty = Boolean(
    totalRatePrice && totalRatePrice > 0 && activeRule.amount >= totalRatePrice * 0.98
  );

  if (isFullPenalty) {
    return {
      refundable: false,
      cancellationType: "non_refundable",
      currentPenalty: { amount: activeRule.amount, currency: activeRule.currency },
    };
  }

  return {
    refundable: true,
    cancellationType: "fee_applies",
    currentPenalty: { amount: activeRule.amount, currency: activeRule.currency },
  };
}

export function cleanText(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).replace(/\s+/g, " ").trim();
  return s || undefined;
}

export function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function httpsOnly(urls: Array<string | undefined | null>): string[] {
  return uniq(
    urls
      .map((u) => String(u || "").trim())
      .filter((u) => /^https?:\/\//i.test(u))
      .map((u) => u.replace(/^http:\/\//i, "https://"))
  );
}

/** Haversine distance in meters. */
export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6_371_000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function normalizeHotelName(name: string): string {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(hotel|hotels|otel|resort|residence|apart|apartments|suites|suite|spa|the|by|and|&|boutique|palace|inn|istanbul|antalya|dubai)\b/g, " ")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
