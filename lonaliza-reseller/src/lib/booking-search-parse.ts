import { fullLocationText } from "@/lib/hotel-display";
import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";

export function stripBidi(value: string): string {
  return value
    .replace(/[\u200e\u200f\u202a-\u202e]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type BookingAccessBits = {
  neighborhood: string;
  address: string;
  distanceText: string;
  roomType: string;
  bedType: string;
  breakfast: boolean;
  cancel: boolean;
  noPrepayment: boolean;
  stars: number;
  hurryLeft: number;
};

const SKIP_LINE =
  /شريك|preferred partner|genius|موبايل|mobile only|booking\.com|عرض العطلة|عرض لفترة|جديد على|ضرائب|taxes|رسوم|كان السعر|السعر الحالي|original price|current price|limited[- ]time|holiday deal/i;

const SCORE_LINE = /[\d.]+\s*(رائع|ممتاز|جيد|تقييم|excellent|very good|good|reviews?)/i;
const STAR_LINE =
  /(\d)\s*(?:من أصل|out of|-)\s*5(?:\s*(?:نجم|نجمة|star|yıldız|كتصنيف|تصنيف|quality))?/i;
const BREAKFAST_RE =
  /شامل(?:\s+ال)?إفطار|إفطار مجاني|إفطار مشمول|breakfast included|free breakfast|kahvaltı dahil/i;
const CANCEL_RE = /إلغاء مجاني|free cancellation|ücretsiz iptal|refundable/i;
const PREPAY_RE = /لا يطلب دفع مقدم|no prepayment|ön ödeme yok|pay later/i;
const ROOM_PREFIX =
  /^(غرفة[^:]{0,48}|جناح[^:]{0,48}|.+\b(?:room|suite|oda)\b[^:]{0,40})\s*[:：]\s*(.+)$/i;
const BED_ONLY = /^(?:الأسرّة[:：]?\s*)?(سرير|سريران|سريرين|beds?|bed)\b/i;
const DIST_ONLY = /^[\d.,]+\s*(?:كلم|كم|km)\b/i;
const LOC_DIST = /^(.+?)\s*[•·,]\s*((?:\d+[.,]\d+|\d+)\s*(?:كلم|كم|km).+)$/i;

export function parseBookingAccessLabel(
  raw: string,
  hotelName: string,
  city: string
): BookingAccessBits {
  const bits: BookingAccessBits = {
    neighborhood: "",
    address: "",
    distanceText: "",
    roomType: "",
    bedType: "",
    breakfast: false,
    cancel: false,
    noPrepayment: false,
    stars: 0,
    hurryLeft: 0,
  };
  if (!raw) return bits;

  const name = stripBidi(hotelName).toLowerCase();
  const cityNorm = stripBidi(city).toLowerCase();
  const hurry = raw.match(/بقي\s+(\d+)|only\s+(\d+)\s+(?:room|option|left)/i);
  if (hurry) bits.hurryLeft = Number(hurry[1] || hurry[2] || 0) || 0;

  const starMatch = raw.match(STAR_LINE);
  if (starMatch) bits.stars = Math.min(5, Number(starMatch[1]) || 0);

  for (const part of raw.split(/\n+/)) {
    const line = stripBidi(part).replace(/[.\u06D4]+$/g, "").trim();
    if (!line) continue;
    if (name && line.toLowerCase() === name) continue;
    if (STAR_LINE.test(line) || /^\d\s*[-–]\s*(?:star|نجم|تصنيف)/i.test(line)) continue;
    if (SCORE_LINE.test(line) && /\d/.test(line)) continue;
    if (SKIP_LINE.test(line)) continue;
    if (/^\+?\s*\d[\d.,]*\s*USD/.test(line) || /^USD\s*\d/.test(line)) continue;

    if (BREAKFAST_RE.test(line)) {
      bits.breakfast = true;
      continue;
    }
    if (CANCEL_RE.test(line)) {
      bits.cancel = true;
      continue;
    }
    if (PREPAY_RE.test(line)) {
      bits.noPrepayment = true;
      continue;
    }

    const loc = line.match(LOC_DIST);
    if (loc) {
      const left = loc[1].trim();
      if (left && left.toLowerCase() !== cityNorm) bits.neighborhood = bits.neighborhood || left;
      bits.distanceText = bits.distanceText || loc[2].trim();
      continue;
    }
    if (DIST_ONLY.test(line) || /(?:كلم|كم|km)\s+من\s+(?:المركز|centre|center)/i.test(line)) {
      bits.distanceText = bits.distanceText || line;
      continue;
    }

    const room = line.match(ROOM_PREFIX);
    if (room) {
      bits.roomType = bits.roomType || room[1].trim();
      bits.bedType = bits.bedType || room[2].replace(/^الأسرّة[:：]?\s*/i, "").trim();
      continue;
    }
    if (BED_ONLY.test(line) && line.length < 80) {
      bits.bedType = bits.bedType || line.replace(/^الأسرّة[:：]?\s*/i, "").trim();
      continue;
    }
    if (!bits.roomType && /^(غرفة|جناح|hotel room|oda)\b/i.test(line) && line.length < 48) {
      bits.roomType = line;
    }
  }

  return bits;
}

function locationLine(parts: {
  neighborhood?: string;
  address?: string;
  city?: string;
  distanceText?: string;
}): string {
  const base = fullLocationText({
    neighborhood: parts.neighborhood,
    address: parts.address,
    city: parts.city,
  });
  const distance = (parts.distanceText || "").trim();
  if (distance && !base.includes(distance)) {
    return base ? `${base} · ${distance}` : distance;
  }
  return base;
}

export function enrichListCard(card: TravelAdvisorHotelCard): TravelAdvisorHotelCard {
  const parsed = parseBookingAccessLabel(card.snippet || "", card.name, card.city);
  const neighborhood = card.neighborhood || parsed.neighborhood;
  const address = card.address || parsed.address;
  const distanceText = card.distanceText || parsed.distanceText;
  const roomType = card.roomType || parsed.roomType;
  const bedType = card.bedType || parsed.bedType;
  const breakfast = Boolean(card.breakfastIncluded || parsed.breakfast);
  const nonRefundable =
    Boolean(card.nonRefundable) ||
    /non.?refund|غير قابل للإلغاء|غير قابل للاسترداد|iade yok/i.test(card.snippet || "");
  const cancellation =
    card.cancellation ||
    (parsed.cancel ? "Free cancellation" : nonRefundable ? "Non-refundable" : "");
  const amenities = Array.from(
    new Set([
      ...(card.amenities || []),
      ...(breakfast ? ["Breakfast included"] : []),
      ...(cancellation ? ["Free cancellation"] : []),
      ...(parsed.noPrepayment ? ["No prepayment"] : []),
    ])
  ).slice(0, 8);
  const cityOnly =
    !card.locationText ||
    card.locationText.trim().toLowerCase() === (card.city || "").trim().toLowerCase();
  const locationText = cityOnly
    ? locationLine({ neighborhood, address, city: card.city, distanceText })
    : card.locationText.includes(distanceText || "___")
      ? card.locationText
      : locationLine({
          neighborhood: neighborhood || card.neighborhood,
          address: address || card.address,
          city: card.city,
          distanceText,
        });
  const images = uniqueHotelPhotoUrls([card.image, ...(card.images || [])]);
  return {
    ...card,
    image: images[0] || card.image,
    images,
    neighborhood,
    address,
    distanceText,
    locationText: locationText || card.locationText || card.city,
    roomType,
    bedType,
    cancellation,
    breakfastIncluded: breakfast,
    nonRefundable: card.nonRefundable || nonRefundable,
    amenities,
    badges: amenities.slice(0, 4),
    stars: card.stars > 0 ? card.stars : parsed.stars,
    hurryLeft: card.hurryLeft > 0 ? card.hurryLeft : parsed.hurryLeft,
    noPrepayment: card.noPrepayment || parsed.noPrepayment,
  };
}

export function uniqueHotelPhotoUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const url = String(raw || "").trim();
    if (!url || !/^https?:\/\//i.test(url)) continue;
    const id =
      url.match(/\/(?:square\d+|max\d+x\d+)\/(\d+)\.(?:jpe?g|webp|png)/i)?.[1] ||
      url.split("?")[0];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(url);
  }
  return out;
}
