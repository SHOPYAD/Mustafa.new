/**
 * Real search filters computed from the merged supplier results of a search session.
 *
 * Every option and count is derived from what the suppliers actually returned for this stay
 * (stars, review score, nightly price, board, cancellation, payment type, distance, facilities).
 * Nothing here is a static template.
 */

import type { TravelAdvisorAppliedFilter, TravelAdvisorFilterGroup } from "@/types/travel-advisor";
import type { MergedHotel } from "./identity-resolver";
import type { SearchSession } from "./search-session";

type Lang = "ar" | "en" | "tr";

const L = (lang: Lang, ar: string, en: string, tr?: string) => (lang === "ar" ? ar : lang === "tr" ? tr || en : en);

function langOf(input?: string): Lang {
  return input === "ar" || input === "tr" ? input : "en";
}

function nightly(h: MergedHotel): number | null {
  const n = Math.max(1, h.nights || 1);
  return h.cheapest && h.cheapest.price > 0 ? Math.round((h.cheapest.price / n) * 100) / 100 : null;
}

/** Review score normalised to a 10-point scale (Hotelbeds TripAdvisor is /5, RateHawk /10). */
function rating10(h: MergedHotel): number | null {
  if (!h.reviewScore) return null;
  return h.reviewScore.scale === 5 ? h.reviewScore.score * 2 : h.reviewScore.score;
}

function boards(h: MergedHotel): Set<string> {
  const set = new Set<string>();
  for (const offer of h.offers) for (const plan of offer.ratePlans || []) set.add(plan.board || "OTHER");
  return set;
}

/** Best-effort canonical facility keys so the same facility from several suppliers/languages counts once. */
const FACILITY_KEYS: Array<{ key: string; re: RegExp; label: Record<Lang, string> }> = [
  { key: "wifi", re: /wi-?fi|wireless|internet|واي ?فاي|إنترنت|kablosuz/i, label: { ar: "واي فاي", en: "Wi-Fi", tr: "Wi-Fi" } },
  { key: "pool", re: /\bpool|swimming|مسبح|حمام سباحة|havuz/i, label: { ar: "مسبح", en: "Pool", tr: "Havuz" } },
  { key: "parking", re: /parking|garage|موقف|مواقف|otopark/i, label: { ar: "موقف سيارات", en: "Parking", tr: "Otopark" } },
  { key: "spa", re: /\bspa\b|sauna|hammam|turkish bath|سبا|ساونا|حمام تركي|wellness/i, label: { ar: "سبا / ساونا", en: "Spa & sauna", tr: "Spa" } },
  { key: "gym", re: /gym|fitness|لياقة|نادي رياضي|spor salonu/i, label: { ar: "نادي رياضي", en: "Fitness centre", tr: "Fitness" } },
  { key: "restaurant", re: /restaurant|مطعم|restoran/i, label: { ar: "مطعم", en: "Restaurant", tr: "Restoran" } },
  { key: "beach", re: /beach|شاطئ|plaj/i, label: { ar: "شاطئ", en: "Beach", tr: "Plaj" } },
  { key: "ac", re: /air[- ]?cond|climate control|تكييف|klima/i, label: { ar: "تكييف", en: "Air conditioning", tr: "Klima" } },
  { key: "family", re: /family|kids|children|playground|أطفال|عائل|çocuk/i, label: { ar: "مناسب للعائلات", en: "Family friendly", tr: "Aile dostu" } },
  { key: "pets", re: /pets? allowed|حيوانات|evcil/i, label: { ar: "يسمح بالحيوانات الأليفة", en: "Pets allowed", tr: "Evcil hayvan" } },
  { key: "accessible", re: /wheelchair|disabled|accessib|ذوي|إعاقة|engelli/i, label: { ar: "مناسب لذوي الاحتياجات", en: "Accessible", tr: "Engelli erişimi" } },
  { key: "shuttle", re: /shuttle|airport transfer|نقل من المطار|خدمة نقل|servis/i, label: { ar: "خدمة نقل للمطار", en: "Airport shuttle", tr: "Havalimanı servisi" } },
  { key: "bar", re: /\bbar\b|lounge|بار|صالة/i, label: { ar: "بار / صالة", en: "Bar & lounge", tr: "Bar" } },
  { key: "elevator", re: /elevator|lift|مصعد|asansör/i, label: { ar: "مصعد", en: "Elevator", tr: "Asansör" } },
  { key: "business", re: /business|meeting|conference|اجتماعات|مؤتمرات|toplantı/i, label: { ar: "مرافق أعمال", en: "Business facilities", tr: "İş olanakları" } },
];

function facilityKeys(h: MergedHotel): Set<string> {
  const set = new Set<string>();
  for (const a of h.amenities || []) for (const f of FACILITY_KEYS) if (f.re.test(a)) set.add(f.key);
  return set;
}

/* ------------------------------------------------------------------------------------------------ */

export function matchesMergedHotel(h: MergedHotel, filter: TravelAdvisorAppliedFilter): boolean {
  const values = filter.value.filter(Boolean);
  if (!values.length) return true;
  switch (filter.id) {
    case "class": {
      const s = Math.round(h.stars || 0);
      return s > 0 && values.some((v) => Math.round(Number(v) >= 10 ? Number(v) / 10 : Number(v)) === s);
    }
    case "rating": {
      const r = rating10(h);
      if (r == null) return false;
      const min = Number(values[0]);
      if (!Number.isFinite(min) || min <= 0) return true;
      return r >= (min > 10 ? min / 10 : min <= 5 ? min * 2 : min);
    }
    case "price": {
      const n = nightly(h);
      if (n == null) return false;
      const min = Number(values[0]);
      const max = Number(values[1] ?? values[0]);
      const sliderMax = Number(values[2]);
      if (Number.isFinite(min) && n < min) return false;
      // When the slider is at its upper bound the range is open-ended ("max and above").
      if (Number.isFinite(max) && max > 0 && n > max && !(Number.isFinite(sliderMax) && max >= sliderMax)) return false;
      return true;
    }
    case "cancel":
      return values.some((v) => (v === "free" ? h.freeCancellation : !h.freeCancellation));
    case "meals":
      return values.some((v) => (v === "breakfast" ? h.breakfastIncluded : !h.breakfastIncluded));
    case "board": {
      const b = boards(h);
      return values.some((v) => b.has(v));
    }
    case "deals":
      return values.some((v) => {
        if (v === "2" || /cancel/i.test(v)) return h.freeCancellation;
        if (v === "3" || /pay/i.test(v)) return h.payAtHotel;
        if (/breakfast/i.test(v)) return h.breakfastIncluded;
        if (v === "multi") return h.offers.length > 1;
        return false;
      });
    case "distFrom": {
      const maxKm = Number(values[0] ?? values[1]);
      if (!Number.isFinite(maxKm) || maxKm <= 0) return true;
      if (h.distanceFromCenterM == null) return false;
      return h.distanceFromCenterM / 1000 <= maxKm;
    }
    case "amenity": {
      const keys = facilityKeys(h);
      const text = (h.amenities || []).join(" ").toLowerCase();
      return values.some((v) => keys.has(v) || (v.length > 1 && text.includes(v.toLowerCase())));
    }
    case "photos":
      return h.images.length > 0;
    case "name":
    case "hotelName": {
      const needle = values[0]?.toLowerCase().trim();
      if (!needle) return true;
      return String(h.name || "").toLowerCase().includes(needle);
    }
    default:
      return true;
  }
}

export function filterMergedHotels(hotels: MergedHotel[], filters: TravelAdvisorAppliedFilter[] | undefined): MergedHotel[] {
  const active = (filters || []).filter((f) => f && f.id && Array.isArray(f.value) && f.value.length);
  if (!active.length) return hotels;
  return hotels.filter((h) => active.every((f) => matchesMergedHotel(h, f)));
}

/* ------------------------------------------------------------------------------------------------ */

const BOARD_LABEL: Record<string, Record<Lang, string>> = {
  RO: { ar: "الغرفة فقط", en: "Room only", tr: "Sadece oda" },
  BB: { ar: "شامل الإفطار", en: "Breakfast included", tr: "Kahvaltı dahil" },
  HB: { ar: "نصف إقامة", en: "Half board", tr: "Yarım pansiyon" },
  FB: { ar: "إقامة كاملة", en: "Full board", tr: "Tam pansiyon" },
  AI: { ar: "شامل كلياً", en: "All inclusive", tr: "Her şey dahil" },
  UAI: { ar: "شامل كلياً فاخر", en: "Ultra all inclusive", tr: "Ultra her şey dahil" },
};

export function buildSessionFilterGroups(session: Pick<SearchSession, "hotels" | "input">, langInput?: string): TravelAdvisorFilterGroup[] {
  const lang = langOf(langInput || session.input.lang);
  const hotels = session.hotels;
  const total = hotels.length;
  const groups: TravelAdvisorFilterGroup[] = [];
  if (!total) return groups;

  // Price per night (in the session currency, converted client-side to the display currency).
  const nightlies = hotels.map(nightly).filter((n): n is number => n != null && n > 0);
  if (nightlies.length) {
    // Slider bounds use the 95th percentile so one absurd outlier rate cannot flatten the range;
    // hotels above the bound are still matched when the slider sits at its maximum.
    const sorted = [...nightlies].sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
    const min = Math.floor(sorted[0] / 5) * 5;
    const max = Math.ceil(p95 / 5) * 5;
    groups.push({ id: "price", title: L(lang, "السعر لليلة", "Price per night", "Gecelik fiyat"), kind: "range", min, max: Math.max(max, min + 10), unit: hotels[0].cheapest.currency || session.input.currency || "USD", options: [] });
  }

  // Stars.
  const starCounts = new Map<number, number>();
  for (const h of hotels) {
    const s = Math.round(h.stars || 0);
    if (s >= 1 && s <= 5) starCounts.set(s, (starCounts.get(s) || 0) + 1);
  }
  if (starCounts.size) {
    groups.push({
      id: "class",
      title: L(lang, "تصنيف الفندق", "Hotel class", "Otel sınıfı"),
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: [5, 4, 3, 2, 1].filter((s) => starCounts.has(s)).map((s) => ({ value: String(s), label: L(lang, `${s} نجوم`, `${s} star`, `${s} yıldız`), count: starCounts.get(s) || 0 })),
    });
  }

  // Guest rating (only from real supplier review scores).
  const rated = hotels.map(rating10).filter((r): r is number => r != null);
  if (rated.length) {
    const RATING_WORD: Record<number, Record<Lang, string>> = {
      9: { ar: "ممتاز", en: "Excellent", tr: "Mükemmel" },
      8: { ar: "جيد جداً", en: "Very good", tr: "Çok iyi" },
      7: { ar: "جيد", en: "Good", tr: "İyi" },
      6: { ar: "مقبول", en: "Pleasant", tr: "Hoş" },
    };
    const opts = [9, 8, 7, 6]
      .map((min) => ({ value: String(min), label: `${min}+ ${RATING_WORD[min][lang]}`, count: rated.filter((r) => r >= min).length }))
      .filter((o) => o.count > 0);
    if (opts.length) groups.push({ id: "rating", title: L(lang, "تقييم النزلاء", "Guest rating", "Misafir puanı"), kind: "multi", min: null, max: null, unit: "", options: opts });
  }

  // Board basis (from every rate plan).
  const boardCounts = new Map<string, number>();
  for (const h of hotels) for (const b of boards(h)) boardCounts.set(b, (boardCounts.get(b) || 0) + 1);
  const boardOpts = ["RO", "BB", "HB", "FB", "AI", "UAI"].filter((b) => boardCounts.has(b)).map((b) => ({ value: b, label: BOARD_LABEL[b][lang], count: boardCounts.get(b) || 0 }));
  if (boardOpts.length >= 2) groups.push({ id: "board", title: L(lang, "نظام الوجبات", "Meal plan", "Yemek planı"), kind: "multi", min: null, max: null, unit: "", options: boardOpts });

  // Cancellation.
  const freeCancel = hotels.filter((h) => h.freeCancellation).length;
  if (freeCancel > 0 && freeCancel < total) {
    groups.push({
      id: "cancel",
      title: L(lang, "سياسة الإلغاء", "Cancellation", "İptal"),
      kind: "multi",
      min: null,
      max: null,
      unit: "",
      options: [
        { value: "free", label: L(lang, "إلغاء مجاني", "Free cancellation", "Ücretsiz iptal"), count: freeCancel },
        { value: "paid", label: L(lang, "غير قابل للاسترداد", "Non-refundable", "İade edilemez"), count: total - freeCancel },
      ],
    });
  }

  // Deals / payment.
  const payAtHotel = hotels.filter((h) => h.payAtHotel).length;
  const multi = hotels.filter((h) => h.offers.length > 1).length;
  const dealOpts: TravelAdvisorFilterGroup["options"] = [];
  if (freeCancel) dealOpts.push({ value: "2", label: L(lang, "إلغاء مجاني", "Free cancellation", "Ücretsiz iptal"), count: freeCancel });
  if (payAtHotel) dealOpts.push({ value: "3", label: L(lang, "الدفع في الفندق", "Pay at hotel", "Otelde öde"), count: payAtHotel });
  if (multi) dealOpts.push({ value: "multi", label: L(lang, "أكثر من عرض سعر", "Multiple offers", "Birden fazla teklif"), count: multi });
  if (dealOpts.length) groups.push({ id: "deals", title: L(lang, "مميزات الحجز", "Booking perks", "Rezervasyon avantajları"), kind: "multi", min: null, max: null, unit: "", options: dealOpts });

  // Distance from centre.
  const withDist = hotels.filter((h) => h.distanceFromCenterM != null);
  if (withDist.length >= 3) {
    const opts = [1, 2, 5, 10]
      .map((km) => ({ value: String(km), label: L(lang, `أقل من ${km} كم`, `Under ${km} km`, `${km} km altında`), count: withDist.filter((h) => (h.distanceFromCenterM as number) / 1000 <= km).length }))
      .filter((o) => o.count > 0 && o.count < total);
    if (opts.length) groups.push({ id: "distFrom", title: L(lang, "المسافة من المركز", "Distance from centre", "Merkeze uzaklık"), kind: "multi", min: null, max: null, unit: "km", options: opts });
  }

  // Facilities (canonical keys, counted once per hotel).
  const facCounts = new Map<string, number>();
  for (const h of hotels) for (const k of facilityKeys(h)) facCounts.set(k, (facCounts.get(k) || 0) + 1);
  const facOpts = FACILITY_KEYS.filter((f) => facCounts.has(f.key)).map((f) => ({ value: f.key, label: f.label[lang], count: facCounts.get(f.key) || 0 }));
  if (facOpts.length) groups.push({ id: "amenity", title: L(lang, "المرافق", "Facilities", "Olanaklar"), kind: "multi", min: null, max: null, unit: "", options: facOpts });

  return groups;
}
