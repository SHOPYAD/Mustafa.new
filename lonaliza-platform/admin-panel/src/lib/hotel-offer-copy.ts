/**
 * Pure, client-safe copy helpers shared by the hotel result card and the hotel detail page.
 * Everything here only *labels* supplier facts — it never fabricates a fact that is missing.
 */

import type { Locale } from "@/lib/i18n/types";

type Tri = { ar: string; en: string; tr: string };

const BOARD: Record<string, Tri> = {
  RO: { ar: "الغرفة فقط", en: "Room only", tr: "Sadece oda" },
  BB: { ar: "شامل الإفطار", en: "Breakfast included", tr: "Kahvaltı dahil" },
  HB: { ar: "نصف إقامة (إفطار + عشاء)", en: "Half board", tr: "Yarım pansiyon" },
  FB: { ar: "إقامة كاملة (3 وجبات)", en: "Full board", tr: "Tam pansiyon" },
  AI: { ar: "شامل كلياً", en: "All inclusive", tr: "Her şey dahil" },
  UAI: { ar: "شامل كلياً (Ultra)", en: "Ultra all inclusive", tr: "Ultra her şey dahil" },
};

export const OFFER_COPY = {
  ar: {
    freeCancel: "إلغاء مجاني",
    freeCancelUntil: (d: string) => `إلغاء مجاني حتى ${d}`,
    nonRefundable: "غير قابل للاسترداد",
    payAtHotel: "الدفع في الفندق",
    deposit: "عربون عند الحجز",
    prepay: "دفع مسبق آمن",
    recheck: "يُؤكَّد السعر قبل الدفع",
    taxesIncluded: "شامل الضرائب والرسوم",
    taxesExcluded: "الضرائب غير مشمولة",
    perNight: "الليلة",
    totalFor: (n: number) => (n === 1 ? "الإجمالي لليلة واحدة" : n === 2 ? "الإجمالي لليلتين" : n <= 10 ? `الإجمالي لـ ${n} ليالٍ` : `الإجمالي لـ ${n} ليلة`),
    nights: (n: number) => (n === 1 ? "ليلة" : n === 2 ? "ليلتان" : n <= 10 ? `${n} ليالٍ` : `${n} ليلة`),
    remaining: (n: number) => (n === 1 ? "بقيت غرفة واحدة فقط بهذا السعر" : n === 2 ? "بقيت غرفتان فقط بهذا السعر" : `بقي ${n} غرف فقط بهذا السعر`),
    offers: (n: number) => (n === 2 ? "عرضان للسعر" : `${n} عروض أسعار`),
    fromCentre: "من المركز",
    reviews: (n: number) => (n === 1 ? "تقييم واحد" : n === 2 ? "تقييمان" : n <= 10 ? `${n} تقييمات` : `${n} تقييم`),
    ratingExcellent: "ممتاز",
    ratingVeryGood: "جيد جداً",
    ratingGood: "جيد",
    ratingFair: "مقبول",
    seeRooms: "عرض الغرف",
    book: "احجز",
    cheapestRoom: "أقل سعر متاح",
  },
  en: {
    freeCancel: "Free cancellation",
    freeCancelUntil: (d: string) => `Free cancellation until ${d}`,
    nonRefundable: "Non-refundable",
    payAtHotel: "Pay at the hotel",
    deposit: "Deposit at booking",
    prepay: "Secure prepayment",
    recheck: "Price confirmed before payment",
    taxesIncluded: "Taxes & fees included",
    taxesExcluded: "Taxes not included",
    perNight: "per night",
    totalFor: (n: number) => `Total for ${n} night${n === 1 ? "" : "s"}`,
    nights: (n: number) => `${n} night${n === 1 ? "" : "s"}`,
    remaining: (n: number) => (n === 1 ? "Only 1 room left at this price" : `Only ${n} rooms left at this price`),
    offers: (n: number) => `${n} rate${n === 1 ? "" : "s"}`,
    fromCentre: "from centre",
    reviews: (n: number) => `${n} review${n === 1 ? "" : "s"}`,
    ratingExcellent: "Excellent",
    ratingVeryGood: "Very good",
    ratingGood: "Good",
    ratingFair: "Fair",
    seeRooms: "See rooms",
    book: "Book",
    cheapestRoom: "Lowest available rate",
  },
  tr: {
    freeCancel: "Ücretsiz iptal",
    freeCancelUntil: (d: string) => `${d} tarihine kadar ücretsiz iptal`,
    nonRefundable: "İade edilemez",
    payAtHotel: "Otelde ödeme",
    deposit: "Rezervasyonda depozito",
    prepay: "Güvenli ön ödeme",
    recheck: "Fiyat ödeme öncesi onaylanır",
    taxesIncluded: "Vergiler ve ücretler dahil",
    taxesExcluded: "Vergiler dahil değil",
    perNight: "gecelik",
    totalFor: (n: number) => `${n} gece toplam`,
    nights: (n: number) => `${n} gece`,
    remaining: (n: number) => `Bu fiyata yalnızca ${n} oda kaldı`,
    offers: (n: number) => `${n} fiyat seçeneği`,
    fromCentre: "merkezden",
    reviews: (n: number) => `${n} yorum`,
    ratingExcellent: "Mükemmel",
    ratingVeryGood: "Çok iyi",
    ratingGood: "İyi",
    ratingFair: "Orta",
    seeRooms: "Odaları gör",
    book: "Rezervasyon",
    cheapestRoom: "En düşük fiyat",
  },
};

export type OfferCopy = (typeof OFFER_COPY)["en"];

type CopyLocale = keyof typeof OFFER_COPY;

function copyLocale(locale: Locale): CopyLocale {
  return locale === "ar" || locale === "tr" ? locale : "en";
}

export function offerCopy(locale: Locale): OfferCopy {
  return OFFER_COPY[copyLocale(locale)];
}

/** Board label for a normalised code; falls back to the supplier's own wording, else empty. */
export function boardLabel(code: string | undefined, locale: Locale, supplierName?: string): string {
  const hit = code ? BOARD[code] : undefined;
  if (hit) return hit[copyLocale(locale)] || hit.en;
  return supplierName || "";
}

export function boardIncludesMeals(code?: string): boolean {
  return ["BB", "HB", "FB", "AI", "UAI"].includes(String(code || ""));
}

function intlLocale(locale: Locale) {
  return locale === "ar" ? "ar-EG" : locale === "tr" ? "tr-TR" : "en-GB";
}

export function fmtDeadline(iso: string | undefined, locale: Locale, withTime = false): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      day: "numeric",
      month: "short",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(d);
  } catch {
    return iso;
  }
}

export function fmtStayDate(ymd: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(locale), { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${ymd}T12:00:00Z`));
  } catch {
    return ymd;
  }
}

/** Cancellation sentence from supplier facts only. */
export function cancellationLabel(
  refundable: boolean | undefined,
  freeUntil: string | undefined,
  locale: Locale,
  withTime = false
): { text: string; tone: "good" | "neutral" } | null {
  if (refundable == null) return null;
  const c = offerCopy(locale);
  if (refundable) {
    const d = fmtDeadline(freeUntil, locale, withTime);
    return { text: d ? c.freeCancelUntil(d) : c.freeCancel, tone: "good" };
  }
  return { text: c.nonRefundable, tone: "neutral" };
}

export function paymentLabel(type: string | undefined, locale: Locale): string {
  const c = offerCopy(locale);
  if (type === "pay_at_hotel") return c.payAtHotel;
  if (type === "deposit") return c.deposit;
  if (type === "prepay") return c.prepay;
  return "";
}

/** Normalises any supplier scale to /10 for display. */
export function scoreOutOf10(score: number, scale: number): number {
  if (!(score > 0)) return 0;
  const s = scale === 5 ? score * 2 : scale === 100 ? score / 10 : score;
  return Math.round(s * 10) / 10;
}

export function ratingWord(score10: number, locale: Locale): string {
  const c = offerCopy(locale);
  if (score10 >= 9) return c.ratingExcellent;
  if (score10 >= 8) return c.ratingVeryGood;
  if (score10 >= 7) return c.ratingGood;
  return c.ratingFair;
}

export function reviewSourceLabel(source: string | undefined): string {
  const s = String(source || "").toLowerCase();
  if (s === "tripadvisor" || s === "travel_advisor") return "TripAdvisor";
  if (s === "booking" || s === "booking_com15") return "Booking.com";
  if (s === "ratehawk") return "RateHawk";
  if (s === "hotelbeds") return "Hotelbeds";
  if (s === "travelport") return "Travelport";
  return source || "";
}

/** Distance text from metres — nothing when unknown. */
export function distanceLabel(m: number | undefined | null, locale: Locale): string {
  if (m == null || !Number.isFinite(m)) return "";
  const km = m / 1000;
  if (m < 1000) return locale === "ar" ? `${Math.round(m)} م` : `${Math.round(m)} m`;
  return locale === "ar" ? `${km.toFixed(1)} كم` : `${km.toFixed(1)} km`;
}

/**
 * Hotelbeds duplicates the cancellation status as a "promotion" ("Non-refundable rate. No amendments
 * permitted"). We keep real promotions only; the cancellation line already says the same thing.
 */
export function meaningfulPromotions(list: string[] | undefined): string[] {
  return (list || []).filter((p) => p && !/non.?refund|no amendments|غير مسترجع|غير قابل للاسترداد|iade edilemez/i.test(p));
}
