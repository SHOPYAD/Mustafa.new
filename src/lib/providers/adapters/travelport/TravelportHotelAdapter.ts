/**
 * Travelport JSON APIs — Stays (Hospitality) v11.
 *
 *   POST 11/hotel/search/properties/search                     search by geo / city / airport (100 per page)
 *   GET  11/hotel/search/properties/{identifier}?pageNumber=N  pagination (pages 2..5)
 *   GET  11/hotel/search/propertiesdetail?chainCode&propertyCode  description, images (pictureOf), amenities, attractions
 *   POST 11/hotel/availability/catalogofferingshospitality     room types + rates (CatalogOffering per rate)
 *   POST 11/hotel/book/reservations/build                      reservation (reference payload → CatalogOffering id)
 *   PUT  11/hotel/book/reservations/{id}/canceloffer
 *
 * The previous adapter used the Universal-API v12 "searchcomplete" with a 25 km radius and
 * re-ran a Dubai search whenever its in-memory cache missed. That is gone.
 */

import { randomUUID } from "crypto";
import { getTravelportContext, obtainTravelportToken, travelportRequest } from "./httpClient";
import type {
  CancellationPolicyRule,
  HotelSearchCard,
  RatePlan,
  RoomGroup,
} from "../common/types";
import type { HotelContent, HotelContentImage } from "@/lib/server/hotels/content-types";
import { getCachedContent, getCachedContentMany, putCachedContent } from "@/lib/server/hotels/content-cache";
import {
  cleanText,
  deriveCancellation,
  httpsOnly,
  nightsBetween,
  publicHotelId,
  round2,
  toNumber,
} from "@/lib/server/hotels/normalize";
import { recordSupplierCall } from "@/lib/server/hotels/telemetry";

export interface HotelSearchParams {
  /** IATA city code (SearchByCity). */
  city?: string;
  /** Geo search (preferred: exact destination centre from geo_places). */
  geo?: { latitude: number; longitude: number; radiusKm: number };
  countryCode?: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
  childrenAges?: number[];
  currency?: string;
  /** Max pages to fetch (1..5). */
  maxPages?: number;
  /** Max propertiesdetail calls for hotels without cached content. */
  contentBudget?: number;
  signal?: AbortSignal;
}

/**
 * OTA "Picture Category Code" (PIC) list used by Travelport JSON Stays `Image.pictureCategory`
 * (1 Exterior, 2 Lobby, 3 Pool, 4 Restaurant, 5 Health club, 6 Guest room, 7 Suite, 8 Meeting room,
 *  9 Ballroom, 10 Golf, 11 Beach, 12 Spa, 13 Bar/Lounge, 14 Recreation, 15 Logo, 16 Basics,
 *  17 Map, 18 Promotional, 19 Hot news, 20 Misc, 21 Guest room amenity, 22 Property amenity, 23 Business center).
 */
const PICTURE_CATEGORY_CODE: Record<number, string> = {
  1: "exterior",
  2: "lobby",
  3: "pool",
  4: "restaurant",
  5: "gym",
  6: "room",
  7: "room",
  8: "conference",
  9: "conference",
  10: "sports",
  11: "beach",
  12: "spa",
  13: "bar",
  14: "sports",
  21: "room",
  22: "other",
  23: "conference",
};
const PICTURE_CATEGORY_TEXT: Array<[RegExp, string]> = [
  [/guest ?room|bedroom|suite|studio|king|queen|twin/i, "room"],
  [/exterior|facade|entrance|building/i, "exterior"],
  [/lobby|reception|interior entrance/i, "lobby"],
  [/pool/i, "pool"],
  [/restaurant|dining|breakfast|buffet/i, "restaurant"],
  [/bar|lounge/i, "bar"],
  [/spa|sauna|hammam|wellness/i, "spa"],
  [/gym|fitness|health club/i, "gym"],
  [/beach/i, "beach"],
  [/meeting|conference|ballroom|banquet/i, "conference"],
  [/terrace|balcony|garden/i, "terrace"],
];
function pictureCategory(img: any): string {
  const code = Number(img?.pictureCategory);
  if (Number.isFinite(code) && PICTURE_CATEGORY_CODE[code]) return PICTURE_CATEGORY_CODE[code];
  const text = String(img?.caption || img?.pictureOf || "");
  for (const [re, cat] of PICTURE_CATEGORY_TEXT) if (re.test(text)) return cat;
  return "other";
}

/** Travelport property id = chainCode + propertyCode → we store as "HL:12345". */
export function tpPropertyId(chainCode: string, propertyCode: string): string {
  return `${String(chainCode || "").toUpperCase()}:${String(propertyCode || "")}`;
}
export function splitTpPropertyId(id: string): { chainCode: string; propertyCode: string } {
  const clean = String(id).replace(/^tph_/, "");
  const [chainCode, propertyCode] = clean.includes(":") ? clean.split(":") : [clean.slice(0, 2), clean.slice(2)];
  return { chainCode, propertyCode };
}

function guestCounts(adults: number, childrenAges: number[]) {
  const list: any[] = [{ "@type": "GuestCount", ageQualifyingCode: "10", count: Math.max(1, adults) }];
  for (const age of childrenAges) list.push({ "@type": "GuestCount", ageQualifyingCode: "8", age, count: 1 });
  return { "@type": "GuestCounts", GuestCount: list };
}

function firstTelephone(tel: unknown): string | undefined {
  const list = Array.isArray(tel) ? tel : tel ? [tel] : [];
  for (const item of list) {
    const raw =
      typeof item === "string"
        ? item
        : (item as { phoneNumber?: string; PhoneNumber?: string; value?: string } | null)?.phoneNumber ||
          (item as { PhoneNumber?: string } | null)?.PhoneNumber ||
          (item as { value?: string } | null)?.value;
    const n = cleanText(raw);
    if (n && n !== "[object Object]") return n;
  }
  return undefined;
}

function addressText(addr: any): string | undefined {
  if (!addr) return undefined;
  const lines = Array.isArray(addr.AddressLine) ? addr.AddressLine : [];
  const parts = [
    ...lines,
    [addr.Number?.value, addr.Street].filter(Boolean).join(" "),
    addr.City,
    addr.StateProv?.name || addr.StateProv?.value,
    addr.PostalCode,
    addr.Country?.name || addr.Country?.value,
  ]
    .map((p) => cleanText(p))
    .filter(Boolean);
  return parts.length ? Array.from(new Set(parts)).join(", ") : undefined;
}

function starsFrom(ratings: any[]): number | undefined {
  if (!Array.isArray(ratings)) return undefined;
  const prefer = ["NTM", "AAA", "GIATA", "TVPT", "OTA"];
  const usable = ratings.filter((r) => !/tripadvisor|^ta$/i.test(String(r?.provider || "")));
  const sorted = [...usable].sort((a, b) => prefer.indexOf(String(a.provider)) - prefer.indexOf(String(b.provider)));
  const v = toNumber(sorted[0]?.value, 0);
  return v >= 1 && v <= 5 ? Math.round(v) : undefined;
}

/** Guest score when Travelport names TripAdvisor. Skip bare 1–5 integers with no count (those are hotel class). */
function guestScoreFrom(ratings: any[]): HotelSearchCard["reviewScore"] | undefined {
  if (!Array.isArray(ratings)) return undefined;
  const ta = ratings.find((r) => /tripadvisor|trip.?advisor|^ta$/i.test(String(r?.provider || "")));
  if (!ta) return undefined;
  const v = toNumber(ta.value);
  if (!(v > 0)) return undefined;
  const count = ta.reviewCount != null ? toNumber(ta.reviewCount) : ta.count != null ? toNumber(ta.count) : 0;
  const hasCount = count > 0;
  const looksGuest = hasCount || v > 5 || v % 1 !== 0;
  if (!looksGuest) return undefined;
  return { source: "tripadvisor", score: round2(v), scale: v <= 5 ? 5 : 10, count: hasCount ? count : undefined };
}

function imageRoomHint(src: any, category: string): string | undefined {
  const pic = `${src?.pictureOf || ""} ${src?.caption || ""}`;
  if (/suite/i.test(pic)) return "suite";
  if (/studio/i.test(pic)) return "studio";
  if (category === "room" || /guest ?room/i.test(pic)) return "guestroom";
  return undefined;
}

const ROOM_FEATURE_RULES: Array<[RegExp, string]> = [
  [/wi-?fi|wireless/i, "Wi-Fi"],
  [/air.?condition|climate control|\ba\/c\b/i, "Air conditioning"],
  [/\bsafe\b|in-room safe/i, "In-room safe"],
  [/mini.?bar/i, "Minibar"],
  [/coffee|kettle|tea maker/i, "Tea/coffee maker"],
  [/balcony|terrace/i, "Balcony"],
  [/sea view|ocean view/i, "Sea view"],
  [/city view/i, "City view"],
  [/bathtub|bath tub/i, "Bathtub"],
  [/shower/i, "Shower"],
  [/\btv\b|television/i, "TV"],
  [/desk|work.?space/i, "Desk"],
  [/iron/i, "Iron"],
  [/hair.?dryer/i, "Hair dryer"],
  [/kitchen|kitchenette/i, "Kitchenette"],
  [/\bsofa\b/i, "Sofa"],
  [/wardrobe|closet/i, "Wardrobe"],
  [/soundproof/i, "Soundproofing"],
  [/non-?smoking/i, "Non-smoking"],
];

function roomAmenitiesFrom(raw: string[], description?: string, roomName?: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const skip = new Set([String(roomName || "").trim().toLowerCase()]);
  const push = (label: string) => {
    const key = label.toLowerCase();
    if (!label || seen.has(key) || skip.has(key)) return;
    seen.add(key);
    out.push(label);
  };
  for (const a of raw) push(a);
  if (description) {
    for (const part of description.split(/[•·|;/\n]+/)) {
      const bit = cleanText(part);
      if (bit && bit.length >= 3 && bit.length <= 42) push(bit);
    }
  }
  const blob = `${raw.join(" ")} ${description || ""}`;
  for (const [re, label] of ROOM_FEATURE_RULES) {
    if (re.test(blob)) push(label);
  }
  return out.slice(0, 24);
}

function paymentFromRateInfo(raw: unknown): RatePlan["paymentType"] | undefined {
  const v = String(raw || "").toLowerCase();
  if (!v || v === "unknown") return undefined;
  if (/prepay|prepaid/.test(v)) return "prepay";
  if (/deposit/.test(v)) return "deposit";
  if (/postpay|post.?pay|guarantee/.test(v)) return "pay_at_hotel";
  return undefined;
}

/** Guest-room photos only — never lobby/pool/exterior on a room card. */
export function travelportRoomImages(content: HotelContent | null | undefined, roomCode: string, roomName: string): string[] {
  if (!content?.images?.length) return [];
  const code = String(roomCode || "").trim().toLowerCase();
  const name = String(roomName || "").trim().toLowerCase();
  const roomImgs = content.images.filter((i) => i.category === "room" || i.roomCode);
  const exact = roomImgs.filter((i) => i.roomCode && code && i.roomCode.toLowerCase() === code).map((i) => i.url);
  if (exact.length) return Array.from(new Set(exact));
  const tokens = name.split(/[^a-z0-9\u0600-\u06ff]+/).filter((t) => t.length > 3);
  const named = roomImgs.filter((i) => {
    const cap = `${i.caption || ""} ${i.roomCode || ""}`.toLowerCase();
    if (code && cap.includes(code)) return true;
    return tokens.length >= 2 && tokens.filter((t) => cap.includes(t)).length >= 2;
  });
  if (named.length) return Array.from(new Set(named.map((i) => i.url)));
  const hint = /suite/.test(name) ? "suite" : /studio/.test(name) ? "studio" : "guestroom";
  const hinted = roomImgs.filter((i) => i.roomCode === hint);
  if (hinted.length) return Array.from(new Set(hinted.map((i) => i.url)));
  return Array.from(new Set(roomImgs.map((i) => i.url)));
}

/** PropertyInfo (search or propertiesdetail) → HotelContent */
export function mapTravelportContent(info: any): HotelContent | null {
  const prop = info?.Property || info;
  const key = prop?.PropertyKey;
  if (!key?.propertyCode) return null;
  const id = tpPropertyId(key.chainCode, key.propertyCode);
  const rawImages: any[] = Array.isArray(prop.Image) ? prop.Image : [];
  const images: HotelContentImage[] = httpsOnly(rawImages.map((i: any) => i?.value)).map((url, idx) => {
    const src = rawImages.find((i) => String(i?.value).replace(/^http:/, "https:") === url);
    const category = pictureCategory(src);
    return {
      url,
      order: idx,
      category,
      caption: cleanText(src?.caption || src?.pictureOf),
      roomCode: imageRoomHint(src, category),
    };
  });
  const amenities = (Array.isArray(prop.PropertyAmenity) ? prop.PropertyAmenity : [])
    .map((a: any) => cleanText(a.description || a.Name))
    .filter(Boolean) as string[];
  const attractions = (Array.isArray(prop.Attraction) ? prop.Attraction : []).map((a: any) => ({
    name: String(a.name),
    distanceM: a.Distance?.value != null ? Math.round(toNumber(a.Distance.value) * (String(a.Distance.unitOfDistance).startsWith("Mile") ? 1609 : 1000)) : undefined,
  }));
  const descr = (Array.isArray(prop.Description) ? prop.Description : [])
    .map((d: any) => cleanText(typeof d === "string" ? d : d?.value))
    .filter(Boolean)
    .join("\n\n");
  const ci = prop.CheckInOutPolicy;
  const fmtTime = (t?: string) => {
    if (!t) return undefined;
    const digits = String(t).replace(/\D/g, "");
    if (digits.length >= 3) return `${digits.slice(0, -2).padStart(2, "0")}:${digits.slice(-2)}`;
    return cleanText(t);
  };
  return {
    supplier: "travelport",
    supplierHotelId: id,
    name: cleanText(prop.name) || id,
    description: descr || undefined,
    address: addressText(prop.Address),
    city: cleanText(prop.Address?.City),
    countryCode: cleanText(prop.Address?.Country?.value)?.toUpperCase(),
    postalCode: cleanText(prop.Address?.PostalCode),
    lat: prop.GeoLocation?.latitude != null ? toNumber(prop.GeoLocation.latitude) : undefined,
    lng: prop.GeoLocation?.longitude != null ? toNumber(prop.GeoLocation.longitude) : undefined,
    stars: starsFrom(prop.Rating),
    reviewScore: guestScoreFrom(prop.Rating),
    chain: cleanText(key.chainCode),
    phone: firstTelephone(prop.Telephone),
    email: cleanText(typeof prop.Email === "string" ? prop.Email : prop.Email?.value),
    checkInTime: fmtTime(ci?.checkInTime),
    checkOutTime: fmtTime(ci?.checkOutTime),
    policies: [
      cleanText(typeof ci?.description === "string" ? ci.description : ci?.description?.value),
      cleanText(ci?.CheckInInstructions || ci?.checkInInstructions),
      cleanText(ci?.CheckOutInstructions || ci?.checkOutInstructions),
    ].filter(Boolean) as string[],
    images,
    facilities: amenities.map((name: string) => ({ group: "مرافق الفندق", name })),
    rooms: [],
    pois: attractions,
    language: "en",
    fetchedAt: new Date().toISOString(),
  };
}

function mapPenalties(tc: any, currency: string, total: number): CancellationPolicyRule[] {
  const list: any[] = Array.isArray(tc?.CancelPenalty) ? tc.CancelPenalty : [];
  const out: CancellationPolicyRule[] = [];
  for (const p of list) {
    const date = p.Deadline?.SpecificDate?.specific || p.Deadline?.SpecificDate?.start;
    if (!date) continue;
    const time = p.Deadline?.Time ? String(p.Deadline.Time) : "00:00:00";
    const pen = p.HotelPenalty || {};
    let amount = 0;
    const type = String(pen["@type"] || "");
    if (type === "HotelPenaltyAmount") amount = toNumber(pen.Amount?.value ?? pen.Amount);
    else if (type === "HotelPenaltyPercent") amount = round2((toNumber(pen.Percent) / 100) * total);
    else if (type === "HotelPenaltyNights") amount = round2(toNumber(pen.Nights, 1) * (total / 1));
    if (String(p.Refundable || "").toLowerCase() === "no" && amount === 0) amount = total;
    out.push({ from: `${date}T${time}`, amount, currency, description: cleanText(p.Description) });
  }
  return out;
}

/** CatalogOfferingHospitality[] → RoomGroups (grouped by room description / type code). */
export function mapTravelportOfferings(propertyId: string, offerings: any[], refList: any[], nights: number, content?: HotelContent | null): RoomGroup[] {
  const groups = new Map<string, RoomGroup>();
  offerings.forEach((co, idx) => {
    const products: any[] = (co.ProductOptions || []).flatMap((po: any) => po.Product || []);
    const product = products[0] || {};
    const price = co.Price || {};
    const currency = String(price.CurrencyCode?.value || price.CurrencyCode || "USD");
    const total = toNumber(price.TotalPrice);
    if (!co.id || !total) return;
    const tc = co.TermsAndConditions || {};
    const room = product.RoomType || {};
    const rc = room.RoomCharacteristics || {};
    const roomName = cleanText(room.Description?.title) || cleanText(rc.shortRoomDescription) || cleanText(room.Description?.value)?.slice(0, 80) || "Room";
    const roomCode = cleanText(rc.typeCode) || roomName;
    const groupId = `tp:${propertyId}:${roomCode}`;
    const penalties = mapPenalties(tc, currency, total);
    const derived = deriveCancellation(penalties);
    const penaltyList: any[] = Array.isArray(tc.CancelPenalty) ? tc.CancelPenalty : [];
    const refundableFlag =
      penaltyList.some((p: any) => String(p.Refundable || "").toLowerCase() === "yes") ||
      String(tc.Refundable || co.Refundable || "").toLowerCase() === "yes";
    const explicitNo =
      !refundableFlag && penaltyList.some((p: any) => String(p.Refundable || "").toLowerCase() === "no");
    const descText = Array.isArray(tc.Description)
      ? tc.Description.map(String).join(" ")
      : String(tc.Description || "");
    const freeCancelText = /free\s*cancel|refundable(?!\s*no)|إلغاء مجاني/i.test(descText);
    const meals = tc.MealsIncluded || {};
    const board: RatePlan["board"] = meals.breakfastInd && meals.lunchInd && meals.dinnerInd ? "FB" : meals.breakfastInd && meals.dinnerInd ? "HB" : meals.breakfastInd ? "BB" : "RO";
    const paymentType: RatePlan["paymentType"] = paymentFromRateInfo(tc.RatePaymentInfo) || "pay_at_hotel";
    const plan: RatePlan = {
      id: `tp:${String(co.id).slice(0, 40)}:${idx}`,
      supplier: "travelport",
      roomGroupId: groupId,
      supplierToken: String(co.id),
      supplierContext: {
        authority: String(co.Identifier?.authority || ""),
        bookingCode: String(product.bookingCode || ""),
        rateCode: String(tc.ProductRateCodeInfo?.[0]?.RateCodeInfo?.[0]?.value || ""),
      },
      board,
      boardName: meals.breakfastInd ? "Breakfast included" : undefined,
      refundable: explicitNo ? false : refundableFlag || derived.refundable || freeCancelText || !penaltyList.length,
      freeCancellationUntil: derived.freeCancellationUntil,
      cancellationPolicies: penalties,
      paymentType,
      price: {
        net: round2(total),
        selling: round2(total),
        currency,
        taxesIncluded: price.TotalTaxes != null,
        taxes: price.TotalTaxes != null ? round2(toNumber(price.TotalTaxes)) : undefined,
        perNight: round2(total / Math.max(1, nights)),
        total: round2(total),
      },
      rateType: "BOOKABLE",
      remainingRooms: co.limitedAvailabilityInd ? 1 : undefined,
      rateComments: Array.isArray(tc.Description) ? tc.Description.map(String).join(" · ") : undefined,
    };
    let g = groups.get(groupId);
    if (!g) {
      const beds = Array.isArray(rc.BedConfiguration) ? rc.BedConfiguration.map((b: any) => `${b.quantity || 1}× ${b.bedType || ""}`.trim()).join(", ") : undefined;
      const rawAmenities = (Array.isArray(room.RoomAmenity) ? room.RoomAmenity : []).map((a: any) => cleanText(a.description || a.Name)).filter(Boolean) as string[];
      const description = cleanText(room.Description?.value);
      g = {
        id: groupId,
        supplier: "travelport",
        supplierRoomCode: roomCode,
        name: roomName,
        description,
        images: travelportRoomImages(content, roomCode, roomName),
        beds: beds || undefined,
        amenities: roomAmenitiesFrom(rawAmenities, description, roomName),
        ratePlans: [],
      };
      groups.set(groupId, g);
    }
    g.ratePlans.push(plan);
  });
  void refList;
  return Array.from(groups.values())
    .map((g) => ({ ...g, ratePlans: g.ratePlans.sort((a, b) => a.price.total - b.price.total) }))
    .sort((a, b) => (a.ratePlans[0]?.price.total || 0) - (b.ratePlans[0]?.price.total || 0));
}

export class TravelportHotelAdapter {
  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    const ctx = await getTravelportContext("travelport_hotels");
    if (!ctx.username && !ctx.clientId) throw new Error("بيانات اعتماد ترافلبورت فنادق غير مدخلة (Username / Client ID)");
    const token = await obtainTravelportToken(ctx, true);
    const latencyMs = Date.now() - started;
    recordSupplierCall({ supplier: "travelport", kind: "test", ok: Boolean(token), latencyMs });
    if (!token) throw new Error("فشل استلام رمز الوصول لخدمة فنادق ترافلبورت");
    return { ok: true, message: `تم مصادقة ترافلبورت فنادق بنجاح مقابل ${ctx.oauthUrl} (${latencyMs}ms)`, latencyMs };
  }

  async getContent(propertyId: string): Promise<HotelContent | null> {
    const id = String(propertyId).replace(/^tph_/, "");
    const cached = await getCachedContent("travelport", id);
    if (cached && (cached.description || cached.images.length > 1) && cached.phone !== "[object Object]") return cached;
    const { chainCode, propertyCode } = splitTpPropertyId(id);
    const started = Date.now();
    const res = await travelportRequest<any>(
      `11/hotel/search/propertiesdetail?chainCode=${encodeURIComponent(chainCode)}&propertyCode=${encodeURIComponent(propertyCode)}&ImageSize=Large`,
      { method: "GET", providerId: "travelport_hotels", timeoutMs: 15_000 }
    );
    recordSupplierCall({ supplier: "travelport", kind: "content", ok: res.ok, latencyMs: Date.now() - started, error: res.error, meta: { op: "propertiesdetail", id } });
    if (!res.ok) return cached;
    const info = res.data?.PropertiesResponse?.Properties?.PropertyInfo?.[0];
    const content = info ? mapTravelportContent(info) : null;
    if (!content) return cached;
    if (cached) {
      content.rooms = cached.rooms;
      if (!content.images.length) content.images = cached.images;
    }
    void putCachedContent(content);
    return content;
  }

  /** Search by geo/city with pagination; cards carry LowestAvailableRate (rate plans come from availability()). */
  async searchHotels(params: HotelSearchParams): Promise<HotelSearchCard[]> {
    const nights = nightsBetween(params.checkIn, params.checkOut);
    const adults = Math.max(1, params.adults || 2);
    const rooms = Math.max(1, params.rooms || 1);
    const childrenAges = Array.isArray(params.childrenAges) ? params.childrenAges : [];

    let searchBy: any;
    if (params.geo) {
      searchBy = {
        "@type": "SearchByGeoLocation",
        Latitude: params.geo.latitude,
        Longitude: params.geo.longitude,
        SearchRadius: { value: Math.min(40, Math.max(1, Math.round(params.geo.radiusKm))), unitOfDistance: "Kilometers" },
      };
    } else if (params.city && /^[A-Za-z]{3}$/.test(params.city)) {
      searchBy = { "@type": "SearchByCity", SearchCity: params.city.toUpperCase(), SearchRadius: { value: 40, unitOfDistance: "Kilometers" } };
    } else {
      throw new Error("Travelport search requires geo or a 3-letter IATA city");
    }

    const body = {
      PropertiesQuerySearch: {
        "@type": "PropertiesQuerySearch",
        CheckInDate: params.checkIn,
        CheckOutDate: params.checkOut,
        ImageSize: "Large",
        returnAllImagesInd: true,
        returnOnlyAvailablePropertiesInd: true,
        recommendedPropertyAmenitiesInd: true,
        ...(params.currency ? { RequestedCurrency: params.currency } : {}),
        RoomStayCandidate: Array.from({ length: rooms }).map((_, i) => ({
          "@type": "RoomStayCandidate",
          GuestCounts: guestCounts(i === 0 ? adults - Math.floor(adults / rooms) * (rooms - 1) : Math.floor(adults / rooms) || 1, i === 0 ? childrenAges : []),
        })),
        SearchBy: searchBy,
      },
    };

    const correlationId = randomUUID();
    const started = Date.now();
    const first = await travelportRequest<any>("11/hotel/search/properties/search", {
      method: "POST",
      body,
      providerId: "travelport_hotels",
      timeoutMs: 25_000,
      signal: params.signal,
      correlationId,
    });
    if (!first.ok) {
      recordSupplierCall({ supplier: "travelport", kind: "search", ok: false, latencyMs: Date.now() - started, error: first.error });
      throw new Error(first.error || "Travelport properties/search failed");
    }
    const resp = first.data?.PropertiesResponse || first.data;
    const errors = resp?.Result?.Error;
    if (Array.isArray(errors) && errors.length && !resp?.Properties?.PropertyInfo?.length) {
      const msg = errors.map((e: any) => e.Message).join("; ");
      recordSupplierCall({ supplier: "travelport", kind: "search", ok: false, latencyMs: Date.now() - started, error: msg });
      throw new Error(`Travelport: ${msg}`);
    }
    const all: any[] = [...(resp?.Properties?.PropertyInfo || [])];
    const identifier = resp?.Properties?.Identifier?.value;
    const totalPages = Math.min(5, toNumber(resp?.Properties?.numberOfPages ?? resp?.Pagination?.totalPages, 1), params.maxPages || 5);
    for (let page = 2; page <= totalPages && identifier; page++) {
      if (params.signal?.aborted) break;
      const more = await travelportRequest<any>(
        `11/hotel/search/properties/${encodeURIComponent(identifier)}?pageNumber=${page}`,
        { method: "GET", providerId: "travelport_hotels", timeoutMs: 20_000, signal: params.signal, correlationId }
      );
      if (!more.ok) break;
      all.push(...((more.data?.PropertiesResponse || more.data)?.Properties?.PropertyInfo || []));
    }

    const ids = all.map((p) => tpPropertyId(p.Property?.PropertyKey?.chainCode, p.Property?.PropertyKey?.propertyCode));
    const cachedContent = await getCachedContentMany("travelport", ids);

    const cards: HotelSearchCard[] = [];
    for (const info of all) {
      const prop = info.Property || {};
      const key = prop.PropertyKey;
      if (!key?.propertyCode) continue;
      if (String(info.availability || "Open") === "Close") continue;
      const id = tpPropertyId(key.chainCode, key.propertyCode);
      const searchContent = mapTravelportContent(info);
      const cached = cachedContent.get(id);
      const content: HotelContent | null = cached
        ? { ...cached, images: cached.images.length ? cached.images : searchContent?.images || [] }
        : searchContent;
      if (searchContent && !cached) void putCachedContent(searchContent);
      const lowest = info.LowestAvailableRate;
      const total = toNumber(lowest?.value);
      if (!total) continue;
      const currency = String(lowest?.code || params.currency || "USD");
      const images = content ? content.images.map((i) => i.url) : [];
      // Search returns only the lowest rate; hydrateAvailability() fills room/board/cancel.
      const placeholderPlan: RatePlan = {
        id: `tp:lowest:${id}`,
        supplier: "travelport",
        roomGroupId: `tp:${id}:lowest`,
        supplierToken: String(info.Identifier?.value || ""),
        supplierContext: { authority: String(info.Identifier?.authority || ""), needsAvailability: "1" },
        board: "OTHER",
        refundable: false,
        cancellationPolicies: [],
        paymentType: "prepay",
        price: { net: round2(total), selling: round2(total), currency, taxesIncluded: false, perNight: round2(total / nights), total: round2(total) },
        rateType: "RECHECK",
      };
      const dist = info.Distance?.value != null ? toNumber(info.Distance.value) : undefined;
      cards.push({
        id: publicHotelId("travelport", id),
        provider: "travelport",
        supplierHotelId: id,
        name: content?.name || cleanText(prop.name) || id,
        city: content?.city || "",
        countryCode: content?.countryCode || params.countryCode,
        address: content?.address,
        lat: content?.lat,
        lng: content?.lng,
        stars: content?.stars,
        reviewScore: content?.reviewScore,
        description: content?.description,
        amenities: content?.facilities.map((f) => f.name).slice(0, 40),
        image: images[0],
        images,
        heroImage: images[0],
        price: round2(total),
        currency,
        nights,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        roomGroups: [],
        ratePlans: [placeholderPlan],
        searchContext: { distanceKm: dist != null ? String(dist) : "", identifier: String(identifier || "") },
        raw: { availability: info.availability, featured: info.featuredPropertyInd },
      });
    }
    await this.hydrateSearchAvailability(cards, params, started);
    recordSupplierCall({ supplier: "travelport", kind: "search", ok: true, latencyMs: Date.now() - started, count: cards.length, meta: { pages: totalPages, raw: all.length } });
    return cards;
  }

  /** Fills the cheapest room / board / cancel / payment on list cards from live availability. */
  private async hydrateSearchAvailability(cards: HotelSearchCard[], params: HotelSearchParams, _startedAt: number): Promise<void> {
    if (!cards.length || params.signal?.aborted) return;
    const deadline = Date.now() + 28_000;
    const slice = cards;
    let cursor = 0;
    const workers = Array.from({ length: Math.min(8, slice.length) }, async () => {
      while (cursor < slice.length && Date.now() < deadline && !params.signal?.aborted) {
        const card = slice[cursor++];
        if (!card) return;
        try {
          const avail = await this.availability({
            propertyId: card.supplierHotelId,
            checkIn: params.checkIn,
            checkOut: params.checkOut,
            adults: params.adults,
            rooms: params.rooms,
            childrenAges: params.childrenAges,
            currency: params.currency,
          });
          if (!avail.roomGroups.length) continue;
          const ratePlans = avail.roomGroups.flatMap((g) => g.ratePlans);
          const cheapest = ratePlans.reduce((a, b) => (a.price.total <= b.price.total ? a : b));
          card.roomGroups = avail.roomGroups;
          card.ratePlans = ratePlans;
          card.price = cheapest.price.total;
          card.currency = cheapest.price.currency;
        } catch {
          /* keep the lowest-rate placeholder */
        }
      }
    });
    await Promise.all(workers);
  }

  /** Availability (rate matrix) for one property. */
  async availability(input: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    rooms?: number;
    childrenAges?: number[];
    currency?: string;
  }): Promise<{ roomGroups: RoomGroup[]; propertyDates: any | null }> {
    const id = String(input.propertyId).replace(/^tph_/, "");
    const { chainCode, propertyCode } = splitTpPropertyId(id);
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const body = {
      CatalogOfferingsQueryRequest: {
        "@type": "CatalogOfferingsRequestHospitality",
        CatalogOfferingsRequest: [
          {
            "@type": "CatalogOfferingsRequestHospitality",
            StayDates: { start: input.checkIn, end: input.checkOut },
            verboseResponseInd: true,
            ...(input.currency ? { requestedCurrency: input.currency } : {}),
            HotelSearchCriterion: {
              "@type": "HotelSearchCriterion",
              numberOfRooms: Math.max(1, input.rooms || 1),
              PropertyRequest: [{ "@type": "PropertyRequest", PropertyKey: { "@type": "PropertyKey", chainCode, propertyCode } }],
              RoomStayCandidates: {
                "@type": "RoomStayCandidates",
                RoomStayCandidate: [{ "@type": "RoomStayCandidate", GuestCounts: guestCounts(Math.max(1, input.adults || 2), input.childrenAges || []) }],
              },
            },
          },
        ],
      },
    };
    const started = Date.now();
    const res = await travelportRequest<any>("11/hotel/availability/catalogofferingshospitality", {
      method: "POST",
      body,
      providerId: "travelport_hotels",
      timeoutMs: 30_000,
    });
    if (!res.ok) {
      recordSupplierCall({ supplier: "travelport", kind: "rooms", ok: false, latencyMs: Date.now() - started, error: res.error, meta: { id } });
      throw new Error(res.error || "Travelport availability failed");
    }
    const r = res.data?.CatalogOfferingsHospitalityResponse || res.data;
    const offerings: any[] = r?.CatalogOfferings?.CatalogOffering || [];
    const refList: any[] = r?.ReferenceList || [];
    const content = await getCachedContent("travelport", id);
    const roomGroups = mapTravelportOfferings(id, offerings, refList, nights, content);
    recordSupplierCall({ supplier: "travelport", kind: "rooms", ok: true, latencyMs: Date.now() - started, count: roomGroups.reduce((s, g) => s + g.ratePlans.length, 0), meta: { id } });
    return { roomGroups, propertyDates: refList.find((x) => x?.["@type"] === "ReferenceListPropertyDates")?.PropertyDates?.[0] || null };
  }

  /** Details = content + full rate matrix. */
  async getHotelDetails(input: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    rooms?: number;
    childrenAges?: number[];
    currency?: string;
  }): Promise<{ card: HotelSearchCard | null; content: HotelContent | null }> {
    const id = String(input.propertyId).replace(/^tph_/, "");
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const [content, avail] = await Promise.all([
      this.getContent(id),
      this.availability(input).catch((err) => {
        recordSupplierCall({ supplier: "travelport", kind: "details", ok: false, latencyMs: 0, error: String(err), meta: { id } });
        return { roomGroups: [] as RoomGroup[], propertyDates: null };
      }),
    ]);
    if (!content && !avail.roomGroups.length) return { card: null, content: null };
    const roomGroups = avail.roomGroups.map((g) => ({
      ...g,
      images: travelportRoomImages(content, g.supplierRoomCode || "", g.name),
      amenities: (g.amenities || []).filter((a) => a.toLowerCase() !== g.name.toLowerCase()),
    }));
    const ratePlans = roomGroups.flatMap((g) => g.ratePlans);
    const cheapest = ratePlans.length ? ratePlans.reduce((a, b) => (a.price.total <= b.price.total ? a : b)) : null;
    const images = content ? content.images.map((i) => i.url) : [];
    return {
      content,
      card: {
        id: publicHotelId("travelport", id),
        provider: "travelport",
        supplierHotelId: id,
        name: content?.name || cleanText(avail.propertyDates?.propertyName) || id,
        city: content?.city || cleanText(avail.propertyDates?.PropertyAddress?.City) || "",
        countryCode: content?.countryCode,
        address: content?.address || addressText(avail.propertyDates?.PropertyAddress),
        lat: content?.lat ?? (avail.propertyDates?.GeoLocation?.latitude != null ? toNumber(avail.propertyDates.GeoLocation.latitude) : undefined),
        lng: content?.lng ?? (avail.propertyDates?.GeoLocation?.longitude != null ? toNumber(avail.propertyDates.GeoLocation.longitude) : undefined),
        stars: content?.stars,
        reviewScore: content?.reviewScore,
        description: content?.description,
        amenities: content?.facilities.map((f) => f.name),
        image: images[0],
        images,
        heroImage: images[0],
        price: cheapest?.price.total || 0,
        currency: cheapest?.price.currency || input.currency || "USD",
        nights,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        roomGroups,
        ratePlans,
      },
    };
  }

  /** Reservation (reference payload) from a CatalogOffering id obtained in availability(). */
  async createReservation(input: {
    catalogOfferingId: string;
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestPhone: string;
    specialInstruction?: string;
    guarantee?: { type: "agency" } | { type: "card"; number: string; expiry: string; holder: string; cvv?: string; cardType?: string };
  }): Promise<{ ok: boolean; confirmationNumber?: string; locator?: string; error?: string; raw?: any }> {
    const fop: any =
      input.guarantee?.type === "card"
        ? {
            "@type": "FormOfPaymentPaymentCard",
            id: "fop_1",
            PaymentCard: {
              "@type": "PaymentCardDetail",
              cardNumber: input.guarantee.number,
              expireDate: input.guarantee.expiry,
              cardHolderName: input.guarantee.holder,
              ...(input.guarantee.cvv ? { cvv: input.guarantee.cvv } : {}),
              ...(input.guarantee.cardType ? { cardType: input.guarantee.cardType } : {}),
            },
          }
        : { "@type": "FormOfPaymentGuaranteeAgency", id: "fop_1" };
    const body = {
      ReservationBuildFromCatalogOffering: {
        "@type": "ReservationBuildFromCatalogOffering",
        BuildFromCatalogOfferingHospitality: {
          "@type": "BuildFromCatalogOfferingHospitality",
          CatalogOfferingIdentifier: { value: input.catalogOfferingId },
          ...(input.specialInstruction ? { SpecialInstruction: input.specialInstruction.slice(0, 50) } : {}),
        },
        Traveler: [
          {
            "@type": "Traveler",
            id: "trav_1",
            PersonName: { "@type": "PersonName", Given: input.guestFirstName, Surname: input.guestLastName },
            Telephone: [{ "@type": "Telephone", phoneNumber: input.guestPhone.replace(/\D/g, ""), role: "Mobile" }],
            Email: [{ value: input.guestEmail }],
          },
        ],
        FormOfPayment: [fop],
      },
    };
    const started = Date.now();
    const res = await travelportRequest<any>("11/hotel/book/reservations/build", {
      method: "POST",
      body,
      providerId: "travelport_hotels",
      timeoutMs: 60_000,
    });
    const r = res.data?.ReservationResponse || res.data;
    const errors = r?.Result?.Error;
    const errMsg = Array.isArray(errors) && errors.length ? errors.map((e: any) => e.Message).join("; ") : undefined;
    const ok = res.ok && !errMsg;
    recordSupplierCall({ supplier: "travelport", kind: "book", ok, latencyMs: Date.now() - started, error: res.error || errMsg });
    if (!ok) return { ok: false, error: res.error || errMsg || "فشل حجز فندق ترافلبورت", raw: res.data };
    const reservation = r?.Reservation || r;
    const confirmation = reservation?.Offer?.[0]?.Product?.[0]?.confirmationNumber || reservation?.Confirmation?.[0]?.Locator?.value;
    const locator = reservation?.Identifier?.value || reservation?.Receipt?.[0]?.Confirmation?.Locator?.value;
    return { ok: true, confirmationNumber: confirmation ? String(confirmation) : undefined, locator: locator ? String(locator) : undefined, raw: reservation };
  }

  async cancelReservation(reservationIdentifier: string): Promise<{ ok: boolean; error?: string }> {
    const started = Date.now();
    const res = await travelportRequest<any>(`11/hotel/book/reservations/${encodeURIComponent(reservationIdentifier)}/canceloffer`, {
      method: "PUT",
      providerId: "travelport_hotels",
      timeoutMs: 30_000,
    });
    recordSupplierCall({ supplier: "travelport", kind: "cancel", ok: res.ok, latencyMs: Date.now() - started, error: res.error });
    return { ok: res.ok, error: res.error };
  }
}
