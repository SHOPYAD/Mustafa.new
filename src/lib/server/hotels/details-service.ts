/**
 * Hotel details service — builds the public hotel page payload for supplier-backed hotels.
 *
 * Trip.com model: static content (photos, description, facilities, rooms, POIs) + a live rate-plan
 * matrix per room (board × cancellation × payment × supplier). Every supplier that offers the same
 * master hotel (from the search session) is queried in parallel with its own budget; room groups
 * with the same normalized name are merged so their rate plans appear side by side.
 *
 * Nothing is invented: fields the suppliers did not deliver stay empty and `available.*` flags tell
 * the UI what to hide.
 */

import type { HotelSearchCard, HotelSupplierId, RatePlan, RoomGroup } from "@/lib/providers/adapters/common/types";
import { HotelbedsHotelAdapter } from "@/lib/providers/adapters/hotelbeds/HotelbedsHotelAdapter";
import { RateHawkHotelAdapter } from "@/lib/providers/adapters/ratehawk/RateHawkHotelAdapter";
import { TravelportHotelAdapter, travelportRoomImages } from "@/lib/providers/adapters/travelport/TravelportHotelAdapter";
import { SeeruHotelAdapter } from "@/lib/providers/adapters/seeru/seeruHotelAdapter";
import type { TravelAdvisorHotelDetails, TravelAdvisorRoom, TravelAdvisorRoomRate } from "@/types/travel-advisor";
import { cacheGet, cacheSet } from "./cache";
import type { HotelContent } from "./content-types";
import { getCachedContent } from "./content-cache";
import { nameSimilarity, type MergedHotel } from "./identity-resolver";
import { BOARD_LABEL_AR, cleanText, distanceMeters, nightsBetween, normalizeHotelName, round2, splitPublicHotelId, uniq } from "./normalize";
import { findSessionCard, getSearchSession } from "./search-session";
import { supplyLogger } from "./telemetry";

export interface HotelDetailsRequest {
  /** Public id (hb_123 / tph_HL:123 / rh_slug / sh_123). */
  id: string;
  sessionId?: string;
  masterId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  childrenAges: number[];
  currency?: string;
  lang: string;
  residency?: string;
}

export interface HotelDetailsPayload {
  hotel: TravelAdvisorHotelDetails;
  rooms: TravelAdvisorRoom[];
  roomGroups: RoomGroup[];
  content: HotelContent | null;
  checkIn: string;
  checkOut: string;
  nights: number;
}

const DETAILS_BUDGET_MS: Record<HotelSupplierId, number> = { hotelbeds: 15_000, travelport: 20_000, ratehawk: 20_000, seeru: 25_000 };
const DETAILS_CACHE_SEC = 120;

function withBudget<T>(ms: number, fn: () => Promise<T>): Promise<T> {
  return Promise.race([fn(), new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`details budget exceeded (${ms}ms)`)), ms))]);
}

async function fetchSupplier(
  supplier: HotelSupplierId,
  supplierHotelId: string,
  req: HotelDetailsRequest,
  ctx?: Record<string, string>
): Promise<{ card: HotelSearchCard | null; content: HotelContent | null }> {
  switch (supplier) {
    case "hotelbeds":
      return new HotelbedsHotelAdapter().getHotelDetails(supplierHotelId, req.checkIn, req.checkOut, req.adults, {
        rooms: req.rooms,
        childrenAges: req.childrenAges,
        currency: req.currency,
        language: req.lang === "ar" ? "ARA" : "ENG",
      });
    case "ratehawk":
      return new RateHawkHotelAdapter().getHotelDetails({
        hotelId: supplierHotelId,
        checkIn: req.checkIn,
        checkOut: req.checkOut,
        adults: req.adults,
        children: req.childrenAges,
        rooms: req.rooms,
        residency: (req.residency || "sa").toLowerCase(),
        currency: req.currency,
        language: req.lang === "ar" ? "ar" : "en",
      });
    case "travelport":
      return new TravelportHotelAdapter().getHotelDetails({
        propertyId: supplierHotelId,
        checkIn: req.checkIn,
        checkOut: req.checkOut,
        adults: req.adults,
        rooms: req.rooms,
        childrenAges: req.childrenAges,
        currency: req.currency,
      });
    case "seeru":
      return new SeeruHotelAdapter().getHotelDetails({
        hotelId: supplierHotelId,
        src: ctx?.src || undefined,
        checkIn: req.checkIn,
        checkOut: req.checkOut,
        adults: req.adults,
        rooms: req.rooms,
        currency: req.currency,
      });
  }
}

/** Merges room groups from several suppliers when their names clearly describe the same room. */
export function mergeRoomGroups(groups: RoomGroup[]): RoomGroup[] {
  const out: RoomGroup[] = [];
  for (const g of groups) {
    if (!g.ratePlans.length) continue;
    const target = out.find((o) => o.supplier !== g.supplier && (normalizeHotelName(o.name) === normalizeHotelName(g.name) || nameSimilarity(o.name, g.name) >= 0.9));
    if (!target) {
      out.push({ ...g, images: g.images.slice(), amenities: g.amenities.slice(), ratePlans: g.ratePlans.slice() });
      continue;
    }
    target.ratePlans.push(...g.ratePlans);
    if (target.supplierRoomCode && g.supplierRoomCode && target.supplierRoomCode === g.supplierRoomCode) {
      target.images = uniq([...target.images, ...g.images]);
    }
    target.amenities = uniq([...target.amenities, ...g.amenities]);
    target.description = target.description || g.description;
    target.sizeSqm = target.sizeSqm || g.sizeSqm;
    target.beds = target.beds || g.beds;
    target.maxOccupancy = target.maxOccupancy || g.maxOccupancy;
  }
  for (const g of out) g.ratePlans.sort((a, b) => a.price.total - b.price.total);
  return out.sort((a, b) => (a.ratePlans[0]?.price.total || 0) - (b.ratePlans[0]?.price.total || 0));
}

function mergeContent(primary: HotelContent | null, others: HotelContent[]): HotelContent | null {
  const all = [primary, ...others].filter(Boolean) as HotelContent[];
  if (!all.length) return null;
  const base = { ...all[0], images: all[0].images.slice(), facilities: all[0].facilities.slice(), rooms: all[0].rooms.slice(), pois: all[0].pois.slice() };
  for (const c of all.slice(1)) {
    base.description = base.description && base.description.length >= (c.description?.length || 0) ? base.description : c.description || base.description;
    base.address = base.address || c.address;
    base.city = base.city || c.city;
    base.countryCode = base.countryCode || c.countryCode;
    base.lat = base.lat ?? c.lat;
    base.lng = base.lng ?? c.lng;
    base.stars = base.stars || c.stars;
    base.giataCode = base.giataCode || c.giataCode;
    base.phone = base.phone || c.phone;
    base.email = base.email || c.email;
    base.website = base.website || c.website;
    base.checkInTime = base.checkInTime || c.checkInTime;
    base.checkOutTime = base.checkOutTime || c.checkOutTime;
    base.reviewScore = base.reviewScore || c.reviewScore;
    base.policies = base.policies || c.policies;
    const seen = new Set(base.images.map((i) => i.url));
    for (const img of c.images) if (!seen.has(img.url)) base.images.push(img);
    const facSeen = new Set(base.facilities.map((f) => normalizeHotelName(f.name)));
    for (const f of c.facilities) if (!facSeen.has(normalizeHotelName(f.name))) base.facilities.push(f);
    const poiSeen = new Set(base.pois.map((p) => normalizeHotelName(p.name)));
    for (const p of c.pois) if (!poiSeen.has(normalizeHotelName(p.name))) base.pois.push(p);
    if (!base.rooms.length) base.rooms = c.rooms.slice();
  }
  return base;
}

function inferRoomView(name?: string, description?: string): string {
  const text = `${name || ""} ${description || ""}`;
  const match = text.match(/([^.,;\n]{0,36}(?:view|إطلالة|manzara)[^.,;\n]{0,24})/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function rateToPublic(plan: RatePlan, nights: number, lang: string): TravelAdvisorRoomRate {
  const boardLabel = lang === "ar" ? BOARD_LABEL_AR[plan.board] : plan.boardName || plan.board;
  const breakfast = ["BB", "HB", "FB", "AI", "UAI"].includes(plan.board);
  let label = plan.boardName && plan.board === "OTHER" ? plan.boardName : boardLabel;

  const isFree = Boolean(
    plan.cancellationType === "free" ||
    (plan.freeCancellationUntil && Date.parse(plan.freeCancellationUntil) > Date.now())
  );
  const isFeeApplies = Boolean(
    plan.cancellationType === "fee_applies" ||
    (plan.refundable && !isFree && plan.cancellationPolicies?.some((p) => p.amount > 0))
  );

  if (isFree && plan.freeCancellationUntil) {
    const d = new Date(plan.freeCancellationUntil);
    if (!Number.isNaN(d.getTime())) {
      const dateText = d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      label += lang === "ar" ? ` · إلغاء مجاني حتى ${dateText}` : ` · Free cancellation until ${dateText}`;
    }
  } else if (isFree) {
    label += lang === "ar" ? " · إلغاء مجاني" : " · Free cancellation";
  } else if (isFeeApplies) {
    const penalty = plan.currentPenalty || plan.cancellationPolicies?.find((p) => p.amount > 0);
    const amtStr = penalty ? `${penalty.amount} ${penalty.currency}` : "";
    label += lang === "ar"
      ? (amtStr ? ` · إلغاء متاح (غرامة: ${amtStr})` : " · إلغاء متاح برسوم")
      : (amtStr ? ` · Cancellable (fee: ${amtStr})` : " · Cancellation with fee");
  } else {
    label += lang === "ar" ? " · غير قابل للاسترداد" : " · Non-refundable";
  }

  if (plan.paymentType === "pay_at_hotel") label += lang === "ar" ? " · الدفع في الفندق" : " · Pay at hotel";
  return {
    id: plan.id,
    board: breakfast ? "breakfast" : "room_only",
    breakfastIncluded: breakfast,
    freeCancellation: isFree,
    cancellationType: plan.cancellationType || (isFree ? "free" : isFeeApplies ? "fee_applies" : "non_refundable"),
    price: round2(plan.price.total),
    nightly: round2(plan.price.perNight ?? plan.price.total / Math.max(1, nights)),
    totalStay: round2(plan.price.total),
    currency: plan.price.currency,
    partnerName: "Lonaliza",
    label,
    boardCode: plan.board,
    boardName: plan.boardName,
    paymentType: plan.paymentType,
    freeCancellationUntil: isFree ? plan.freeCancellationUntil : undefined,
    currentPenalty: plan.currentPenalty,
    cancellationPolicies: plan.cancellationPolicies,
    rateType: plan.rateType,
    supplierToken: plan.supplierToken,
    supplier: plan.supplier,
    supplierContext: plan.supplierContext,
    remainingRooms: plan.remainingRooms,
    promotions: plan.promotions,
    taxesIncluded: plan.price.taxesIncluded,
    taxes: plan.price.taxes ?? null,
    rateComments: plan.rateComments,
    occupancy: plan.occupancy,
  };
}

export function roomGroupToPublic(group: RoomGroup, nights: number, lang: string): TravelAdvisorRoom {
  const rates = group.ratePlans.map((p) => rateToPublic(p, nights, lang)).sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  const cheapest = rates[0];
  const isCheapestFree = cheapest?.cancellationType === "free" || Boolean(cheapest?.freeCancellation);
  const isCheapestFee = cheapest?.cancellationType === "fee_applies";

  let cancellationPolicyText = lang === "ar" ? "غير قابل للاسترداد" : "Non-refundable";
  if (isCheapestFree) {
    cancellationPolicyText = cheapest.freeCancellationUntil
      ? lang === "ar"
        ? `إلغاء مجاني حتى ${new Date(cheapest.freeCancellationUntil).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}`
        : `Free cancellation until ${new Date(cheapest.freeCancellationUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`
      : lang === "ar"
        ? "إلغاء مجاني"
        : "Free cancellation";
  } else if (isCheapestFee) {
    const penaltyAmt = cheapest.currentPenalty ? `${cheapest.currentPenalty.amount} ${cheapest.currentPenalty.currency}` : "";
    cancellationPolicyText = lang === "ar"
      ? (penaltyAmt ? `إلغاء متاح (رسوم: ${penaltyAmt})` : "إلغاء متاح برسوم محددة")
      : (penaltyAmt ? `Cancellable (fee: ${penaltyAmt})` : "Cancellable with fee");
  }

  return {
    id: group.id,
    name: group.name,
    description: group.description || "",
    beds: group.beds || "",
    capacity: group.maxOccupancy || 0,
    sizeSqm: group.sizeSqm || 0,
    price: cheapest?.nightly ?? null,
    currency: cheapest?.currency || "USD",
    amenities: group.amenities,
    images: group.images,
    breakfastIncluded: rates.some((r) => r.breakfastIncluded),
    freeCancellation: rates.some((r) => r.freeCancellation),
    view: inferRoomView(group.name, group.description),
    partnerName: "Lonaliza",
    nightly: cheapest?.nightly ?? null,
    totalStay: cheapest?.totalStay ?? null,
    available: rates.length > 0,
    rates,
    cancellationPolicy: cancellationPolicyText,
    prepayment: cheapest?.paymentType === "pay_at_hotel" ? (lang === "ar" ? "الدفع في الفندق" : "Pay at the hotel") : lang === "ar" ? "دفع مسبق آمن" : "Secure prepayment",
    nonRefundable: cheapest ? cheapest.cancellationType === "non_refundable" : true,
  };
}

function imageCategories(content: HotelContent | null, roomGroups: RoomGroup[]): Array<{ category: string; urls: string[] }> {
  const map = new Map<string, string[]>();
  for (const img of content?.images || []) {
    const cat = img.category || (img.roomCode ? "room" : "general");
    map.set(cat, [...(map.get(cat) || []), img.url]);
  }
  const roomUrls = uniq(roomGroups.flatMap((g) => g.images));
  if (roomUrls.length) map.set("room", uniq([...(map.get("room") || []), ...roomUrls]));
  return Array.from(map.entries()).map(([category, urls]) => ({ category, urls: uniq(urls) }));
}

export async function buildHotelDetails(req: HotelDetailsRequest): Promise<HotelDetailsPayload | null> {
  const split = splitPublicHotelId(req.id);
  if (!split) return null;
  const nights = nightsBetween(req.checkIn, req.checkOut);
  const cacheKey = `details:v3:${req.id}:${req.checkIn}:${req.checkOut}:${req.adults}:${req.rooms}:${req.childrenAges.join(",")}:${req.currency || "USD"}:${req.lang}:${req.sessionId || ""}`;
  const cached = await cacheGet<HotelDetailsPayload>(cacheKey);
  if (cached) return cached;

  // Which suppliers offer this master hotel? (from the search session when available)
  let sessionHotel: MergedHotel | null = null;
  let primaryCard: HotelSearchCard | null = null;
  if (req.sessionId) {
    const found = await findSessionCard(req.sessionId, req.id);
    if (found) {
      sessionHotel = found.hotel;
      primaryCard = found.card;
    } else if (req.masterId) {
      const session = await getSearchSession(req.sessionId);
      sessionHotel = session?.hotels.find((h) => h.masterId === req.masterId) || null;
      primaryCard = sessionHotel?.offers.find((o) => o.id === req.id) || sessionHotel?.offers[0] || null;
    }
  }
  const offers = sessionHotel?.offers?.length ? sessionHotel.offers : [];
  const targets: Array<{ supplier: HotelSupplierId; supplierHotelId: string; ctx?: Record<string, string> }> = [];
  targets.push({ supplier: split.supplier, supplierHotelId: split.supplierHotelId, ctx: primaryCard?.searchContext });
  for (const o of offers) {
    if (o.id === req.id) continue;
    const s = splitPublicHotelId(o.id);
    if (s && !targets.some((t) => t.supplier === s.supplier)) targets.push({ supplier: s.supplier, supplierHotelId: s.supplierHotelId, ctx: o.searchContext });
  }

  const started = Date.now();
  const results = await Promise.allSettled(
    targets.map((t) => withBudget(DETAILS_BUDGET_MS[t.supplier], () => fetchSupplier(t.supplier, t.supplierHotelId, req, t.ctx)).then((r) => ({ ...r, t, latencyMs: Date.now() - started })))
  );

  const supplierStatus: NonNullable<TravelAdvisorHotelDetails["supplierStatus"]> = [];
  const cards: HotelSearchCard[] = [];
  const contents: HotelContent[] = [];
  let primaryContent: HotelContent | null = null;
  results.forEach((r, idx) => {
    const t = targets[idx];
    if (r.status === "fulfilled") {
      const { card, content, latencyMs } = r.value;
      if (card) cards.push(card);
      if (content) {
        if (idx === 0) primaryContent = content;
        else contents.push(content);
      }
      supplierStatus.push({ supplier: t.supplier, ok: Boolean(card), rooms: card?.roomGroups.length || 0, latencyMs });
    } else {
      supplyLogger.warn({ supplier: t.supplier, id: t.supplierHotelId, error: String(r.reason?.message || r.reason) }, "details supplier failed");
      supplierStatus.push({ supplier: t.supplier, ok: false, rooms: 0, latencyMs: Date.now() - started, error: String(r.reason?.message || r.reason) });
    }
  });

  if (!primaryContent) primaryContent = await getCachedContent(split.supplier, split.supplierHotelId);
  const content = mergeContent(primaryContent, contents);
  const primary = cards.find((c) => c.id === req.id) || cards[0] || primaryCard;
  if (!primary && !content) return null;

  const roomGroups = mergeRoomGroups(cards.flatMap((c) => c.roomGroups));
  for (const g of roomGroups) {
    if (g.images.length) continue;
    g.images = travelportRoomImages(content, g.supplierRoomCode || "", g.name);
  }
  const allPlans = roomGroups.flatMap((g) => g.ratePlans);
  const cheapest = allPlans.length ? allPlans.reduce((a, b) => (a.price.total <= b.price.total ? a : b)) : null;
  const total = cheapest?.price.total ?? primary?.price ?? 0;
  const currency = cheapest?.price.currency || primary?.currency || req.currency || "USD";
  const nightly = total > 0 ? round2(total / Math.max(1, nights)) : null;

  const galleryUrls = uniq([
    ...(content?.images.filter((i) => !i.roomCode).map((i) => i.url) || []),
    ...(primary ? [primary.heroImage, primary.image, ...(primary.images || [])].filter(Boolean) as string[] : []),
    ...(sessionHotel?.images || []),
    ...(content?.images.map((i) => i.url) || []),
  ]);

  const lat = content?.lat ?? primary?.lat ?? sessionHotel?.lat ?? 0;
  const lng = content?.lng ?? primary?.lng ?? sessionHotel?.lng ?? 0;
  const rawPolicies = content?.policies || [];
  const extractedFacilitiesFromPolicies: string[] = [];
  const cleanPolicies: string[] = [];
  const FACILITY_LINE_RE = /كراسي متحركة|موقف السيارات|مواقف|استقبال|تغطية الهاتف|إنترنت|واي فاي|تأجير السيارات|خدمة الغرف|غسيل الملابس|الخدمة الطبية|مجالسة الأطفال|طاقم عمل|أمن 24|مسبح|صالة ألعاب|حمام سباحة|سبا|ساونا|مفتاح الغرف|wheelchair|car park|parking|reception|wi-?fi|internet|car hire|shuttle|room service|laundry|medical|babysitt|security|luggage|multilingual/i;

  for (const p of rawPolicies) {
    const text = cleanText(p);
    if (!text) continue;
    if (FACILITY_LINE_RE.test(text)) {
      extractedFacilitiesFromPolicies.push(text);
    } else {
      cleanPolicies.push(text);
    }
  }

  const facilityGroups = (() => {
    const map = new Map<string, string[]>();
    for (const f of content?.facilities || []) map.set(f.group, uniq([...(map.get(f.group) || []), f.name]));
    if (extractedFacilitiesFromPolicies.length) {
      const gTitle = req.lang === "ar" ? "مرافق وخدمات الفندق" : "Hotel Facilities & Services";
      map.set(gTitle, uniq([...(map.get(gTitle) || []), ...extractedFacilitiesFromPolicies]));
    }
    return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
  })();
  const amenities = uniq([
    ...(content?.facilities.map((f) => f.name) || []),
    ...extractedFacilitiesFromPolicies,
    ...(primary?.amenities || []),
  ]);
  const pois = (content?.pois || []).slice().sort((a, b) => (a.distanceM ?? 1e9) - (b.distanceM ?? 1e9));
  const policies: string[] = [];
  if (content?.checkInTime) policies.push(req.lang === "ar" ? `تسجيل الوصول من ${content.checkInTime}` : `Check-in from ${content.checkInTime}`);
  if (content?.checkOutTime) policies.push(req.lang === "ar" ? `تسجيل المغادرة حتى ${content.checkOutTime}` : `Check-out until ${content.checkOutTime}`);
  policies.push(...cleanPolicies);
  const reviewScore = primary?.reviewScore || sessionHotel?.reviewScore || content?.reviewScore;
  const rating10 = reviewScore ? (reviewScore.scale === 5 ? reviewScore.score * 2 : reviewScore.score) : 0;
  const rooms = roomGroups.map((g) => roomGroupToPublic(g, nights, req.lang));
  const cheapestRoom = rooms[0];

  const hotel: TravelAdvisorHotelDetails = {
    id: req.id,
    masterId: sessionHotel?.masterId || req.masterId,
    sessionId: req.sessionId,
    supplier: split.supplier,
    supplierHotelId: split.supplierHotelId,
    name: content?.name || primary?.name || sessionHotel?.name || "",
    city: content?.city || primary?.city || sessionHotel?.city || "",
    country: content?.countryCode || primary?.countryCode || sessionHotel?.countryCode || "",
    neighborhood: "",
    stars: content?.stars || primary?.stars || sessionHotel?.stars || 0,
    rating: Math.round(rating10 * 10) / 10,
    reviewCount: reviewScore?.count || 0,
    reviewScore,
    image: galleryUrls[0] || "",
    images: galleryUrls,
    badges: [],
    snippet: content?.description ? content.description.slice(0, 200) : "",
    priceFrom: nightly,
    priceOriginal: null,
    currency,
    lat,
    lng,
    address: content?.address || primary?.address || sessionHotel?.address || "",
    locationText: content?.city || primary?.city || "",
    roomType: cheapestRoom?.name || "",
    bedType: cheapestRoom?.beds || "",
    cancellation: cheapestRoom?.cancellationPolicy || "",
    amenities,
    distanceText: "",
    nightly,
    totalStay: total > 0 ? round2(total) : null,
    priceIsStayTotal: true,
    nights: Math.max(1, nights),
    discountPct: 0,
    hurryLeft: cheapest?.remainingRooms && cheapest.remainingRooms <= 5 ? cheapest.remainingRooms : 0,
    source: "supplier",
    breakfastIncluded: rooms.some((r) => r.breakfastIncluded),
    noPrepayment: allPlans.some((p) => p.paymentType === "pay_at_hotel"),
    nonRefundable: cheapest ? !cheapest.refundable : true,
    freeCancellation: allPlans.some((p) => p.refundable),
    payAtHotel: allPlans.some((p) => p.paymentType === "pay_at_hotel"),
    checkInTime: content?.checkInTime || "",
    checkOutTime: content?.checkOutTime || "",
    offers: (sessionHotel?.offers || (primary ? [primary] : [])).map((o) => ({ supplier: o.provider, id: o.id, total: o.price, currency: o.currency })),
    offerCount: sessionHotel?.offers.length || (primary ? 1 : 0),
    description: content?.description || primary?.description || "",
    highlights: [],
    reviews: [],
    rooms,
    phone: content?.phone && !/object Object/i.test(content.phone) ? content.phone : "",
    email: content?.email || "",
    ranking: "",
    policies,
    nearbyPlaces: pois.slice(0, 20).map((p) => ({
      name: p.name,
      distance: p.distanceM != null ? (p.distanceM >= 1000 ? `${(p.distanceM / 1000).toFixed(1)} ${req.lang === "ar" ? "كم" : "km"}` : `${p.distanceM} ${req.lang === "ar" ? "م" : "m"}`) : "",
    })),
    pois,
    facilityGroups,
    imageCategories: imageCategories(content, roomGroups),
    available: {
      description: Boolean(content?.description || primary?.description),
      facilities: amenities.length > 0,
      pois: pois.length > 0,
      policies: policies.length > 0 || Boolean(content?.phone || content?.email || content?.address || content?.checkInTime || content?.checkOutTime || primary?.address),
      reviews: Boolean(reviewScore),
      map: Boolean(lat || lng),
    },
    supplierStatus,
    roomsPendingMatch: false,
  };
  if (sessionHotel?.distanceFromCenterM != null) {
    hotel.distanceFromCenterM = sessionHotel.distanceFromCenterM;
  } else if (sessionHotel && req.sessionId) {
    const session = await getSearchSession(req.sessionId);
    if (session?.destination?.lat && session.destination.lng && (lat || lng)) {
      hotel.distanceFromCenterM = Math.round(distanceMeters(session.destination.lat, session.destination.lng, lat, lng));
    }
  }
  if (hotel.distanceFromCenterM != null) {
    const m = hotel.distanceFromCenterM;
    hotel.distanceText = m < 1000 ? (req.lang === "ar" ? `${m} م من المركز` : `${m} m from centre`) : req.lang === "ar" ? `${(m / 1000).toFixed(1)} كم من المركز` : `${(m / 1000).toFixed(1)} km from centre`;
  }

  const payload: HotelDetailsPayload = { hotel, rooms, roomGroups, content, checkIn: req.checkIn, checkOut: req.checkOut, nights: Math.max(1, nights) };
  if (rooms.length) void cacheSet(cacheKey, payload, DETAILS_CACHE_SEC);
  // Snapshot every rate plan so the quote step (POST /api/hotels/quote) can resolve a plan by id
  // without trusting a client-supplied supplier token or price.
  if (roomGroups.length) {
    void Promise.all(
      roomGroups.flatMap((g) =>
        g.ratePlans.map((plan) =>
          cacheSet<RatePlanSnapshot>(
            `plan:${plan.id}`,
            {
              plan,
              hotelId: hotel.id,
              supplierHotelId: split.supplierHotelId,
              masterId: hotel.masterId,
              hotelName: hotel.name,
              hotelImage: hotel.image || galleryUrls[0] || "",
              stars: hotel.stars || 0,
              city: hotel.city || "",
              address: hotel.address || "",
              roomName: g.name,
              roomImage: g.images[0] || "",
              checkIn: req.checkIn,
              checkOut: req.checkOut,
              adults: req.adults,
              rooms: req.rooms,
              childrenAges: req.childrenAges,
              lang: req.lang,
            },
            PLAN_SNAPSHOT_SEC
          )
        )
      )
    ).catch(() => undefined);
  }
  return payload;
}

/** Rate plan + the display context it was offered in (cached for the quote step). */
export interface RatePlanSnapshot {
  plan: RatePlan;
  hotelId: string;
  supplierHotelId: string;
  masterId?: string;
  hotelName: string;
  hotelImage: string;
  stars: number;
  city: string;
  address: string;
  roomName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  childrenAges: number[];
  lang: string;
}

const PLAN_SNAPSHOT_SEC = 45 * 60;

export async function getRatePlanSnapshot(planId: string): Promise<RatePlanSnapshot | null> {
  if (!planId) return null;
  return cacheGet<RatePlanSnapshot>(`plan:${planId}`);
}
