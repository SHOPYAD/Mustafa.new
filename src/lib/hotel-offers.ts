import { resolveStayPrices } from "@/lib/hotel-display";
import { ALRAYYAN_LOGO_SRC, partnerLogoSrc } from "@/lib/partner-logos";
import type { TravelAdvisorRoom, TravelAdvisorRoomRate } from "@/types/travel-advisor";

export type HotelOfferSource = {
  partnerId: string;
  partnerName: string;
  logoUrl: string;
  price: number;
  currency: string;
  roomName?: string;
  breakfastIncluded?: boolean;
  beds?: string;
  capacity?: number;
  sizeSqm?: number;
  images?: string[];
  freeCancellation?: boolean;
  nightly?: number | null;
  totalStay?: number | null;
  view?: string;
};

export type HotelOfferRow = HotelOfferSource & {
  isAlrayyan: boolean;
};

const ALRAYYAN_DISCOUNT_USD = 2;
const ALRAYYAN_FLOOR_USD = 1;

export const PARTNER_NAME_RE =
  /agoda|booking|expedia|priceline|vio\.?com|trip\.com|tripcom|ctrip|zenhotels|prestigia|stayforlong|hotels\.com|hopper|kayak|tripadvisor/i;

export function toUsdNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "");
    const m = cleaned.match(/(\d+(?:\.\d+)?)/);
    if (!m) return null;
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0) return Math.round(n * 100) / 100;
  }
  return null;
}

export function offerHasBreakfast(offer: HotelOfferSource): boolean {
  return Boolean(offer.breakfastIncluded);
}

export function isRealRoomName(name?: string | null): boolean {
  const n = (name || "").replace(/\s+/g, " ").trim();
  if (n.length < 3) return false;
  if (/^(hotel|hotels|about|location|reviews|photos|amenities|overview|details|rooms|gallery|map)$/i.test(n)) {
    return false;
  }
  if (PARTNER_NAME_RE.test(n) && !/room|suite|twin|king|queen|غرفة|oda/i.test(n)) {
    return false;
  }
  return true;
}

export function isGenericStandardRoomName(name?: string | null): boolean {
  return /^(standard room|غرفة قياسية|standart oda)$/i.test((name || "").replace(/\s+/g, " ").trim());
}

export function bestAvailableRateTitle(lang?: string): string {
  const raw = (lang || "").toLowerCase();
  if (raw.startsWith("ar")) return "أفضل سعر متاح";
  if (raw.startsWith("tr")) return "En iyi mevcut fiyat";
  return "Best available rate";
}

/** Guest-quote copy must never be used as the hotel description. */
export function isPartnerPriceDisclaimer(text?: string | null): boolean {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return /prices are provided by our partners|الأسعار مُقد[مَّ]*ة من شركائنا|الأسعار مقدمة من شركائنا/i.test(
    t
  );
}

export function isTripadvisorBoilerplate(text?: string | null): boolean {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return /tripadvisor llc|تعبر التعليقات عن الرأي الشخصي|ويُجري Tripadvisor|members of tripadvisor|does not represent the (views|opinion)/i.test(
    t
  );
}

export function isUsableHotelDescription(text?: string | null): boolean {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length < 40) return false;
  if (isGuestReviewText(t) || isPartnerPriceDisclaimer(t) || isTripadvisorBoilerplate(t)) {
    return false;
  }
  return true;
}

export function isGuestReviewText(text?: string | null): boolean {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length < 24) return false;
  if (/tripadvisor\.com\/Hotel_Review|booking\.com\/reviews/i.test(t)) return true;
  if (
    /\b(i |we |my stay|our stay|highly recommend|felt like home|staff were|amazing stay|10\/10|would (definitely )?stay)\b/i.test(
      t
    ) &&
    t.length < 1200
  ) {
    return true;
  }
  if (
    /(إقامة رائعة|أنصح بشدة|شعرنا وكأننا|كان الموظفون|ببساطة مذهل|تجربة لا تُنسى|بكل المقاييس)/.test(t) &&
    t.length < 1200
  ) {
    return true;
  }
  return false;
}

export function roomNameKey(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function partnerKey(name: string): string {
  const n = name.trim().toLowerCase();
  if (/trip\.com|tripcom|ctrip/i.test(n)) return "trip.com";
  if (/booking/i.test(n)) return "booking.com";
  if (/expedia/i.test(n)) return "expedia.com";
  if (/hotels\.com/i.test(n)) return "hotels.com";
  if (/agoda/i.test(n)) return "agoda.com";
  if (/priceline/i.test(n)) return "priceline.com";
  return n.replace(/[^a-z0-9]+/g, "");
}

export function cheapestNightly(offers: HotelOfferSource[]): number | null {
  let min: number | null = null;
  for (const offer of offers) {
    const n = toUsdNumber(offer.nightly ?? offer.price);
    if (n == null) continue;
    if (min == null || n < min) min = n;
  }
  return min;
}

export function withResolvedStay(
  offer: HotelOfferSource,
  nights: number
): HotelOfferSource {
  const resolved = resolveStayPrices(offer.price, nights, offer.totalStay ?? null);
  const nightly = resolved.nightly ?? offer.price;
  return {
    ...offer,
    price: nightly,
    nightly,
    totalStay: resolved.totalStay,
  };
}

function slugPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function rateFromOffer(offer: HotelOfferSource): TravelAdvisorRoomRate {
  const breakfast = offerHasBreakfast(offer);
  const nightly = offer.nightly ?? offer.price;
  return {
    id: `${slugPart(offer.partnerId || offer.partnerName)}-${breakfast ? "bf" : "ro"}-${nightly}`,
    board: breakfast ? "breakfast" : "room_only",
    breakfastIncluded: breakfast,
    freeCancellation: Boolean(offer.freeCancellation),
    price: nightly,
    nightly,
    totalStay: offer.totalStay ?? null,
    currency: offer.currency || "USD",
    partnerName: offer.partnerName,
  };
}

function mergeRate(existing: TravelAdvisorRoom, offer: HotelOfferSource) {
  const rate = rateFromOffer(offer);
  const same = existing.rates.find(
    (r) => r.board === rate.board && partnerKey(r.partnerName) === partnerKey(rate.partnerName)
  );
  if (same) {
    if (rate.nightly != null && (same.nightly == null || rate.nightly < same.nightly)) {
      same.price = rate.price;
      same.nightly = rate.nightly;
      same.totalStay = rate.totalStay;
      same.currency = rate.currency;
    }
    same.freeCancellation = same.freeCancellation || rate.freeCancellation;
  } else {
    existing.rates.push(rate);
  }
  const offerNightly = offer.nightly ?? offer.price;
  if (offerNightly != null && (existing.nightly == null || offerNightly < existing.nightly)) {
    existing.price = offerNightly;
    existing.currency = offer.currency || existing.currency;
    existing.nightly = offerNightly;
    existing.totalStay = offer.totalStay ?? existing.totalStay;
  }
  existing.breakfastIncluded = existing.breakfastIncluded || offerHasBreakfast(offer);
  existing.freeCancellation = existing.freeCancellation || Boolean(offer.freeCancellation);
  existing.beds = existing.beds || offer.beds || "";
  existing.view = existing.view || offer.view || "";
  if (offer.capacity && offer.capacity > existing.capacity) existing.capacity = offer.capacity;
  if (offer.sizeSqm && offer.sizeSqm > existing.sizeSqm) existing.sizeSqm = offer.sizeSqm;
  if (offer.images?.length) {
    existing.images = Array.from(new Set([...existing.images, ...offer.images])).slice(0, 8);
  }
}

export function isOfferRateRoom(room: Pick<TravelAdvisorRoom, "id" | "name">): boolean {
  return /^offer:|^partner:/i.test(room.id || "") || !isRealRoomName(room.name);
}

/**
 * Bookable rows from partner offers that already have a real room-type name.
 * Never invent a card titled Agoda.com / Booking.com / etc.
 */
export function roomsFromOffers(
  offers: HotelOfferSource[],
  _images: string[],
  adults: number
): TravelAdvisorRoom[] {
  if (!offers.length) return [];
  const grouped = new Map<string, TravelAdvisorRoom>();

  for (const offer of offers) {
    const nightly = toUsdNumber(offer.nightly ?? offer.price);
    if (nightly == null) continue;
    const rawName = (offer.roomName || "").trim();
    if (!isRealRoomName(rawName)) continue;
    const key = roomNameKey(rawName);
    const existing = grouped.get(key);
    if (existing) {
      mergeRate(existing, offer);
      continue;
    }
    grouped.set(key, {
      id: `name:${key}`,
      name: rawName,
      description: "",
      beds: offer.beds || "",
      capacity: Math.max(0, offer.capacity || adults),
      sizeSqm: offer.sizeSqm || 0,
      price: nightly,
      currency: offer.currency || "USD",
      amenities: [],
      images: offer.images?.length ? offer.images.slice(0, 8) : [],
      breakfastIncluded: offerHasBreakfast(offer),
      freeCancellation: Boolean(offer.freeCancellation),
      view: offer.view || "",
      partnerName: "",
      nightly,
      totalStay: offer.totalStay ?? null,
      available: true,
      rates: [rateFromOffer(offer)],
    });
  }

  return Array.from(grouped.values())
    .sort((a, b) => (a.nightly ?? a.price ?? 999999) - (b.nightly ?? b.price ?? 999999))
    .slice(0, 24);
}

export function alrayyanNightlyFromOffers(offers: HotelOfferSource[]): number | null {
  const min = cheapestNightly(offers);
  if (min == null) return null;
  return Math.max(ALRAYYAN_FLOOR_USD, Math.round((min - ALRAYYAN_DISCOUNT_USD) * 100) / 100);
}

const FOOD_PHOTO_RE =
  /food|breakfast|cake|coffee|restaurant|meal|dining|buffet|dish|cuisine|dessert|pastry|kahvalt|كعك|قهوة|بوفيه|cake|براونيز|حلويات/i;
const ROOM_PHOTO_RE =
  /room|bedroom|bed(?!ford)|interior|guest.?room|oda|غرفة|سرير|yatak|twin|queen|king|accessible/i;
const SEA_PHOTO_RE = /sea|ocean|beach|bosphor|coast|harbour|harbor|marina|waterfront|بحر|boğaz|deniz/i;
const BOAT_PHOTO_RE = /boat|yacht|ferry|gemi|sandal|قارب|يخت|سفينة|cruise.?ship/i;
const VIEW_PHOTO_RE = /view|balcony|terrace|window|skyline|city.?view|إطلالة|شرفة|manzara|balkon/i;
const SUITE_PHOTO_RE = /suite|living|lounge|sofa|salon|family|جناح|معيشة|عائلي|aile/i;
const BATH_PHOTO_RE = /bath|toilet|sink|shower|حمام|duş/i;
const EXTERIOR_PHOTO_RE =
  /exterior|facade|façade|building|night.?view|night.?building|outside|front.?view|خارج|مبنى|cephe|gece/i;
const POOL_PHOTO_RE = /pool|swim|مسبح|havuz/i;
const LOBBY_PHOTO_RE = /lobby|reception|atrium|ردهة|استقبال|lobi/i;
const BALCONY_PHOTO_RE = /balcony|terrace|شرفة|بلكون|teras|balkon/i;

export type RoomPhotoTag =
  | "sea"
  | "view"
  | "suite"
  | "bedroom"
  | "bathroom"
  | "balcony"
  | "lobby"
  | "pool"
  | "food"
  | "exterior"
  | "city"
  | "boat"
  | "unknown";

export type HotelPhotoRef = { url: string; extra?: string };

export function isLikelyFoodPhoto(url: string, extra = ""): boolean {
  return FOOD_PHOTO_RE.test(`${url} ${extra}`);
}

function isForbiddenPrimary(tag: RoomPhotoTag): boolean {
  return tag === "food" || tag === "exterior" || tag === "boat" || tag === "lobby" || tag === "pool";
}

export function classifyHotelPhoto(url: string, extra = "", index = 0): RoomPhotoTag {
  const blob = `${url} ${extra}`;
  const interiorHint = ROOM_PHOTO_RE.test(blob) || SUITE_PHOTO_RE.test(blob) || BALCONY_PHOTO_RE.test(blob);
  if (isLikelyFoodPhoto(url, extra)) return "food";
  if (BOAT_PHOTO_RE.test(blob) && !interiorHint) return "boat";
  if (POOL_PHOTO_RE.test(blob) && !interiorHint) return "pool";
  if (LOBBY_PHOTO_RE.test(blob) && !interiorHint) return "lobby";
  if (BATH_PHOTO_RE.test(blob) && !ROOM_PHOTO_RE.test(blob)) return "bathroom";
  if (BALCONY_PHOTO_RE.test(blob)) return "balcony";
  if (SEA_PHOTO_RE.test(blob) && !BOAT_PHOTO_RE.test(blob)) return "sea";
  if (SUITE_PHOTO_RE.test(blob)) return "suite";
  if (ROOM_PHOTO_RE.test(blob)) return "bedroom";
  if (VIEW_PHOTO_RE.test(blob) || /city|مدينة|şehir/i.test(blob)) {
    return /city|مدينة|şehir/i.test(blob) ? "city" : "view";
  }
  if (EXTERIOR_PHOTO_RE.test(blob)) return "exterior";
  if (index === 0 && !interiorHint) return "exterior";
  return "unknown";
}

export function roomPhotoWants(name: string): RoomPhotoTag[] {
  const n = name || "";
  if (/balcony|terrace|شرفة|بلكون/i.test(n)) return ["balcony", "view", "bedroom", "suite"];
  if (/accessible|ذوي الاحتياجات|engelli/i.test(n)) return ["bedroom", "suite", "view"];
  if (/sea|بحر|bosphor|galata|غلطة|boğaz|deniz/i.test(n)) return ["sea", "view", "balcony", "bedroom"];
  if (/city view|إطلالة على المدينة|şehir/i.test(n)) return ["city", "view", "balcony", "bedroom"];
  if (/triple|family|عائلي|ثلاث/i.test(n)) return ["suite", "bedroom", "view"];
  if (/suite|جناح|junior/i.test(n)) return ["suite", "bedroom", "view"];
  if (/twin|توأم|çift tek/i.test(n)) return ["bedroom", "view", "suite"];
  if (/king|كينغ|queen|كوين/i.test(n)) return ["bedroom", "suite", "view"];
  if (/deluxe|superior|ديلوكس|سوبيريور|executive/i.test(n)) return ["bedroom", "view", "suite"];
  return ["bedroom", "view", "suite", "unknown"];
}

function photoScore(tag: RoomPhotoTag, wants: RoomPhotoTag[], usedAsLead: boolean, hasInterior: boolean): number {
  if (tag === "food") return -100;
  if (tag === "lobby") return hasInterior ? -24 : -4;
  if (tag === "boat") return hasInterior ? -40 : -6;
  if (tag === "pool" && !wants.includes("pool")) return hasInterior ? -20 : -8;
  if (tag === "exterior") return hasInterior || usedAsLead ? -30 : 1;
  const idx = wants.indexOf(tag);
  if (idx >= 0) return 20 - idx * 3;
  if (tag === "balcony") return wants.includes("view") ? 12 : 6;
  if (tag === "bathroom") return 2;
  if (tag === "unknown") return 5;
  return 4;
}

function photoUrl(item: string | HotelPhotoRef): string {
  return typeof item === "string" ? item : item.url;
}

function photoExtra(item: string | HotelPhotoRef): string {
  return typeof item === "string" ? "" : item.extra || "";
}

export function uniquePhotoUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const url = String(raw || "").trim();
    if (!url) continue;
    const id =
      url.match(/\/(?:square\d+|max\d+x\d+|images\/hotel\/)[^/]*\/(\d+)\.(?:jpe?g|webp|png)/i)?.[1] ||
      url.split("?")[0];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(url);
  }
  return out;
}

export function rotateHotelPhotos(photos: string[], index: number, take = 5): string[] {
  const clean = uniquePhotoUrls(photos);
  if (!clean.length) return [];
  const out: string[] = [];
  const n = Math.min(Math.max(1, take), clean.length);
  for (let i = 0; i < n; i += 1) out.push(clean[(index + i) % clean.length]);
  return out;
}

/** Skip the hero/aerial shot so each room card gets a different interior slice. */
export function roomCardPhotos(photos: string[], index: number, take = 5): string[] {
  const clean = uniquePhotoUrls(photos);
  if (clean.length <= 1) return clean.slice();
  const withoutHero = clean.slice(1);
  const pool = withoutHero.length >= 2 ? withoutHero : clean;
  return rotateHotelPhotos(pool, index, take);
}

/**
 * Match hotel-gallery photos to room types when the rooms API has no photos.
 * Never assign food/buffet as a room lead. First images stay unique across types.
 */
export function assignUniqueRoomPhotos(
  rooms: TravelAdvisorRoom[],
  hotelPhotos: Array<string | HotelPhotoRef>
): TravelAdvisorRoom[] {
  const extras = new Map<string, string>();
  const rawUrls: string[] = [];
  for (const item of hotelPhotos) {
    const url = photoUrl(item);
    if (!url) continue;
    rawUrls.push(url);
    const extra = photoExtra(item);
    if (extra) extras.set(url, `${extras.get(url) || ""} ${extra}`.trim());
  }
  const pool = uniquePhotoUrls(rawUrls).filter((url) => !isLikelyFoodPhoto(url, extras.get(url) || ""));
  const hotelHero = pool[0] || "";
  const tagged = pool.map((url, index) => ({
    url,
    tag: classifyHotelPhoto(url, extras.get(url) || "", index),
  }));
  const interiorTags: RoomPhotoTag[] = ["bedroom", "suite", "balcony", "view", "sea", "city", "unknown"];
  const hasInterior = tagged.some((item) => interiorTags.includes(item.tag));
  const leadUsed = new Set<string>();
  const nativeLeadCounts = new Map<string, number>();
  for (const room of rooms) {
    const lead = uniquePhotoUrls(room.images)[0];
    if (!lead) continue;
    nativeLeadCounts.set(lead, (nativeLeadCounts.get(lead) || 0) + 1);
  }
  const sharedNativeThreshold = Math.max(2, Math.ceil(rooms.length * 0.45));

  const isSharedHotelShot = (url: string): boolean => {
    if (!url) return true;
    if (url === hotelHero) return true;
    return (nativeLeadCounts.get(url) || 0) >= sharedNativeThreshold;
  };

  const pickFor = (room: TravelAdvisorRoom, take: number): string[] => {
    const wants = roomPhotoWants(`${room.name} ${room.view || ""} ${room.beds || ""}`);
    const nativeAll = uniquePhotoUrls(room.images).filter(
      (url) => !isLikelyFoodPhoto(url, `${room.name} ${extras.get(url) || ""}`)
    );
    const native = nativeAll.filter((url) => {
      const tag = classifyHotelPhoto(url, `${room.name} ${room.view || ""} ${extras.get(url) || ""}`, 2);
      if (isForbiddenPrimary(tag) && hasInterior) return nativeAll.length > 1;
      return !isSharedHotelShot(url) || nativeAll.length > 1;
    });
    const realNative = native.length && !(native.length === 1 && isSharedHotelShot(native[0])) ? native : [];
    const ranked = [
      ...realNative.map((url) => ({
        url,
        tag: classifyHotelPhoto(url, `${room.name} ${room.view || ""} ${extras.get(url) || ""}`, 2),
        native: true,
      })),
      ...tagged.map((item) => ({ ...item, native: false })),
    ];
    ranked.sort((a, b) => {
      const as = photoScore(a.tag, wants, leadUsed.has(a.url), hasInterior) + (a.native ? 8 : 0);
      const bs = photoScore(b.tag, wants, leadUsed.has(b.url), hasInterior) + (b.native ? 8 : 0);
      return bs - as;
    });
    const images: string[] = [];
    for (const item of ranked) {
      if (images.includes(item.url)) continue;
      if (item.tag === "food") continue;
      if (
        images.length === 0 &&
        hasInterior &&
        isForbiddenPrimary(item.tag) &&
        ranked.some((row) => !isForbiddenPrimary(row.tag) && row.tag !== "food")
      ) {
        continue;
      }
      if (
        images.length === 0 &&
        leadUsed.has(item.url) &&
        ranked.some((row) => !leadUsed.has(row.url) && row.tag !== "food" && !isForbiddenPrimary(row.tag))
      ) {
        continue;
      }
      images.push(item.url);
      if (images.length === 1) leadUsed.add(item.url);
      if (images.length >= take) break;
    }
    return images.slice(0, Math.max(2, Math.min(4, images.length || take)));
  };

  return rooms.map((room) => {
    const images = pickFor(room, 4);
    return { ...room, images: images.length ? images : uniquePhotoUrls(room.images).slice(0, 4) };
  });
}

export function standardRoomTitle(lang?: string): string {
  const raw = (lang || "").toLowerCase();
  if (raw.startsWith("ar")) return "غرفة قياسية";
  if (raw.startsWith("tr")) return "Standart oda";
  return "Standard room";
}

export function applyFallbackNightly(
  rooms: TravelAdvisorRoom[],
  fallbackNightly: number | null | undefined,
  nights: number
): TravelAdvisorRoom[] {
  if (fallbackNightly == null || !(fallbackNightly > 0)) return rooms;
  const nightly = fallbackNightly;
  const totalStay = nights > 1 ? Math.round(nightly * nights) : nightly;
  return rooms.map((room) => {
    if (room.available === false) {
      return {
        ...room,
        price: room.price,
        nightly: room.nightly,
        totalStay: room.totalStay,
      };
    }
    if (room.nightly != null || room.price != null) {
      if (room.rates.length) return room;
      return {
        ...room,
        rates: [
          {
            id: `${room.id}-fallback`,
            board: room.breakfastIncluded ? "breakfast" : "room_only",
            breakfastIncluded: room.breakfastIncluded,
            freeCancellation: room.freeCancellation,
            price: room.nightly ?? room.price,
            nightly: room.nightly ?? room.price,
            totalStay: room.totalStay ?? totalStay,
            currency: room.currency || "USD",
            partnerName: "",
          },
        ],
      };
    }
    return {
      ...room,
      price: nightly,
      nightly,
      totalStay,
      rates: [
        {
          id: `${room.id}-fallback`,
          board: room.breakfastIncluded ? "breakfast" : "room_only",
          breakfastIncluded: room.breakfastIncluded,
          freeCancellation: room.freeCancellation,
          price: nightly,
          nightly,
          totalStay,
          currency: room.currency || "USD",
          partnerName: "",
        },
      ],
    };
  });
}

/**
 * Bookable room cards when Booking rooms are missing.
 * Uses real offer room names when present; otherwise one Alrayyan card
 * titled "best available rate" — never an invented "Standard room".
 */
export function fallbackRoomsFromCompare(
  offers: HotelOfferSource[],
  images: string[],
  adults: number,
  roomTitle: string,
  fallbackNightly?: number | null,
  lang?: string
): TravelAdvisorRoom[] {
  const named = roomsFromOffers(offers, images, adults).map((room, i) => ({
    ...room,
    partnerName: "",
    images: room.images.length ? room.images : roomCardPhotos(images, i),
  }));
  if (named.length) return named;

  const pricedOffers = offers.filter((offer) => toUsdNumber(offer.nightly ?? offer.price) != null);
  const nightly = fallbackNightly ?? alrayyanNightlyFromOffers(offers);
  const title =
    isRealRoomName(roomTitle) && !isGenericStandardRoomName(roomTitle)
      ? roomTitle
      : bestAvailableRateTitle(lang);
  if (nightly == null && !pricedOffers.length) return [];

  const lead = pricedOffers[0];
  const price = nightly ?? toUsdNumber(lead?.nightly ?? lead?.price);
  if (price == null) return [];
  const breakfast = pricedOffers.some((offer) => offerHasBreakfast(offer));
  const freeCancellation = pricedOffers.some((offer) => Boolean(offer.freeCancellation));
  const beds = pricedOffers.map((offer) => offer.beds || "").find(Boolean) || "";
  const view = pricedOffers.map((offer) => offer.view || "").find(Boolean) || "";
  const rates =
    pricedOffers.length > 0
      ? pricedOffers.slice(0, 6).map((offer, i) => {
          const rate = rateFromOffer(offer);
          return { ...rate, id: `${rate.id}-${i}`, partnerName: "" };
        })
      : [
          {
            id: "fallback-best",
            board: breakfast ? ("breakfast" as const) : ("room_only" as const),
            breakfastIncluded: breakfast,
            freeCancellation,
            price,
            nightly: price,
            totalStay: null,
            currency: "USD",
            partnerName: "",
          },
        ];

  return [
    {
      id: "fallback:best-available",
      name: title,
      description: "",
      beds,
      capacity: Math.max(1, lead?.capacity || adults),
      sizeSqm: lead?.sizeSqm || 0,
      price,
      currency: lead?.currency || "USD",
      amenities: [],
      images: roomCardPhotos(images, 0, 6),
      breakfastIncluded: breakfast,
      freeCancellation,
      view,
      partnerName: "",
      nightly: price,
      totalStay: lead?.totalStay ?? null,
      available: true,
      rates,
    },
  ];
}

export function buildCompareOffers(
  sources: HotelOfferSource[],
  alrayyanName: string,
  alrayyanLogo: string
): HotelOfferRow[] {
  const cheapestByPartner = new Map<string, HotelOfferRow>();
  for (const source of sources) {
    const nightly = toUsdNumber(source.nightly ?? source.price);
    if (!source.partnerName.trim() || nightly == null) continue;
    const key = partnerKey(source.partnerName);
    if (!key) continue;
    const current = cheapestByPartner.get(key);
    if (current && (current.nightly ?? current.price) <= nightly) continue;
    cheapestByPartner.set(key, {
      ...source,
      price: nightly,
      nightly,
      totalStay: source.totalStay ?? null,
      currency: (source.currency || "USD").toUpperCase(),
      logoUrl: partnerLogoSrc(source.partnerName, source.logoUrl),
      isAlrayyan: false,
    });
  }

  const others = Array.from(cheapestByPartner.values()).sort(
    (a, b) => (a.nightly ?? a.price) - (b.nightly ?? b.price)
  );

  const minOther = others[0]?.nightly ?? others[0]?.price;
  const ours =
    minOther != null
      ? Math.max(ALRAYYAN_FLOOR_USD, Math.round((minOther - ALRAYYAN_DISCOUNT_USD) * 100) / 100)
      : null;

  const alrayyan: HotelOfferRow | null =
    ours != null
      ? {
          partnerId: "alrayyan",
          partnerName: alrayyanName,
          logoUrl: ALRAYYAN_LOGO_SRC || alrayyanLogo,
          price: ours,
          nightly: ours,
          totalStay: others[0]?.totalStay != null && minOther
            ? Math.round((others[0].totalStay * ours) / minOther)
            : null,
          currency: "USD",
          isAlrayyan: true,
        }
      : null;

  return alrayyan ? [alrayyan, ...others] : others;
}
