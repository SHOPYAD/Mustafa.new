export interface AirOfferSegment {
  segmentId?: string;
  airlineCode: string;
  airlineName?: string;
  operatingCarrierCode?: string;
  operatingCarrierName?: string;
  flightNumber: string;
  departureAirport?: string;
  departureAirportName?: string;
  departureCity?: string;
  departureTerminal?: string;
  departureTime?: string;
  arrivalAirport?: string;
  arrivalAirportName?: string;
  arrivalCity?: string;
  arrivalTerminal?: string;
  arrivalTime?: string;
  durationMinutes?: number;
  aircraftCode?: string;
  aircraftName?: string;
  cabinClass?: string;
  bookingClass?: string;
  baggageAllowance?: {
    checkedBags?: number;
    weightKg?: number;
    dimensions?: string;
  };
}

export interface AirOfferLeg {
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  carrierCode: string;
  carrierName?: string;
  flightNumber: string;
  durationMinutes: number;
  stops: number;
  segments?: AirOfferSegment[];
  baggageAllowance?: {
    checkedBags?: number;
    weightKg?: number;
    cabinBags?: number;
    cabinDesc?: string;
  };
}

export type AirSupplierId = "travelport" | "seeru" | "pkfare" | "biletbank";

/* ------------------------------------------------------------------ */
/* Flights — FareOption model (one bookable fare family of an offer)  */
/* ------------------------------------------------------------------ */

/**
 * Baggage is tri-state on purpose. "unknown" is a legitimate answer (supplier did not tell us) and is
 * shown as such; it is resolved by the mandatory re-pricing step before booking. Never default to 23 kg.
 */
export type BaggageAllowanceState =
  | { status: "included"; pieces?: number; kg?: number; text?: string }
  | { status: "none"; text?: string }
  | { status: "unknown" };

export interface FareBaggage {
  checked: BaggageAllowanceState;
  cabin: BaggageAllowanceState;
}

/** Availability of a fare attribute as declared by the supplier/brand. */
export type FareAttributeState = "included" | "chargeable" | "not_available" | "unknown";

export interface FarePenalty {
  type: "change" | "cancel" | "no_show";
  amount?: number;
  currency?: string;
  percent?: number;
  /** e.g. "before departure", "after departure", "within 24h" — supplier wording, never invented. */
  window?: string;
  text?: string;
}

export interface FareOption {
  /** Stable id inside the offer (used by the UI to select and by the booking step to resolve the token). */
  id: string;
  supplier: AirSupplierId;
  /** Supplier brand/fare-family name, or a descriptive label derived from the rules when the supplier has none. */
  brandName: string;
  brandCode?: string;
  /** "supplier" = real brand name from the supplier; "derived" = label built from the rules (never a fake brand). */
  nameSource: "supplier" | "derived";
  cabin: string;
  baggage: FareBaggage;
  refundable: FareAttributeState;
  changeable: FareAttributeState;
  penalties: FarePenalty[];
  seatSelection: FareAttributeState;
  meal: FareAttributeState;
  priority: FareAttributeState;
  price: { total: number; base: number; taxes?: number; currency: string };
  /** Supplier token needed to price/book this exact fare (fare_key, CatalogProductOffering ids, priceToken, solutionId…). */
  supplierToken: string;
  supplierContext?: Record<string, string>;
  /** Free-text rules from the supplier (refundable_info, miniRules…). */
  rulesText?: string;
  isBestPrice?: boolean;
}

export interface AirOffer {
  id: string;
  provider: AirSupplierId;
  price: {
    total: number;
    base: number;
    taxes?: number;
    currency: string;
  };
  legs: AirOfferLeg[];
  validatingCarrier?: string;
  refundable?: boolean;
  refundableInfo?: string;
  modifiable?: boolean;
  changePenalty?: string;
  cancelPenalty?: string;
  ticketingDeadline?: string;
  /** All bookable fare families for this itinerary (at least one). Nothing here is invented. */
  fareOptions: FareOption[];
  rawOfferData?: unknown;
}

/* Helpers shared by every air adapter ------------------------------ */

export const BAGGAGE_UNKNOWN: BaggageAllowanceState = { status: "unknown" };
export const BAGGAGE_NONE: BaggageAllowanceState = { status: "none" };

/**
 * Parses a supplier baggage string into a tri-state allowance.
 * "1PC" → 1 piece (kg unknown); "23KG"/"23 kg" → 23 kg; "2 x 23kg" → 2 pieces of 23 kg;
 * "0PC"/"NIL"/"no baggage" → none; empty/unparseable → unknown (kept verbatim in `text`).
 */
export function parseBaggageText(raw: unknown): BaggageAllowanceState {
  const s = String(raw ?? "").trim();
  if (!s) return BAGGAGE_UNKNOWN;
  const lower = s.toLowerCase();
  if (/^(nil|none|no|0|0\s*kg|0\s*pc|0\s*piece|0\s*bag|0p|false|without|not included)$/i.test(lower) || /no\s*(checked|baggage|bag|hold)/i.test(lower) || /not\s*offered|not\s*included/.test(lower)) {
    return { status: "none", text: s };
  }
  const multi = lower.match(/(\d+)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(kg|kilo)/);
  if (multi) return { status: "included", pieces: Number(multi[1]), kg: Number(multi[2]), text: s };
  const kg = lower.match(/(\d+(?:\.\d+)?)\s*(kg|kilo|كجم|كغ)/);
  const pc = lower.match(/(\d+)\s*(pc|p\b|piece|pieces|bag|bags|حقيبة|حقائب|قطعة|قطع)/);
  if (kg && pc) return { status: "included", pieces: Number(pc[1]), kg: Number(kg[1]), text: s };
  if (kg) return Number(kg[1]) > 0 ? { status: "included", kg: Number(kg[1]), text: s } : { status: "none", text: s };
  if (pc) return Number(pc[1]) > 0 ? { status: "included", pieces: Number(pc[1]), text: s } : { status: "none", text: s };
  if (/included|مشمول|مسجلة|checked/.test(lower)) return { status: "included", text: s };
  return { status: "unknown" };
}

/**
 * Descriptive label for a fare that has no supplier brand name — built only from known rules.
 * Examples: "غير قابل للاسترداد · بدون أمتعة مسجلة", "Refundable · 1 × 23 kg".
 */
export function deriveFareLabel(
  opt: Pick<FareOption, "refundable" | "changeable" | "baggage">,
  lang: "ar" | "en" | "tr" = "ar"
): string {
  const parts: string[] = [];
  const t = {
    ar: { refundable: "قابل للاسترداد", nonRefundable: "غير قابل للاسترداد", changeable: "قابل للتغيير", noChange: "غير قابل للتغيير", noBag: "بدون أمتعة مسجلة", bagUnknown: "الأمتعة تُحدَّد عند التسعير", pc: "قطعة", kg: "كجم", basic: "السعر الأساسي" },
    en: { refundable: "Refundable", nonRefundable: "Non-refundable", changeable: "Changeable", noChange: "No changes", noBag: "No checked bag", bagUnknown: "Baggage confirmed at pricing", pc: "pc", kg: "kg", basic: "Base fare" },
    tr: { refundable: "İade edilebilir", nonRefundable: "İade edilemez", changeable: "Değiştirilebilir", noChange: "Değişiklik yok", noBag: "Kayıtlı bagaj yok", bagUnknown: "Bagaj fiyatlamada belirlenir", pc: "parça", kg: "kg", basic: "Temel ücret" },
  }[lang];
  if (opt.refundable === "included") parts.push(t.refundable);
  else if (opt.refundable === "not_available") parts.push(t.nonRefundable);
  if (opt.changeable === "included") parts.push(t.changeable);
  else if (opt.changeable === "not_available") parts.push(t.noChange);
  const c = opt.baggage.checked;
  if (c.status === "none") parts.push(t.noBag);
  else if (c.status === "included") {
    if (c.pieces && c.kg) parts.push(`${c.pieces} × ${c.kg} ${t.kg}`);
    else if (c.kg) parts.push(`${c.kg} ${t.kg}`);
    else if (c.pieces) parts.push(`${c.pieces} ${t.pc}`);
    else parts.push(c.text || (lang === "ar" ? "أمتعة مسجلة مشمولة" : lang === "tr" ? "Kayıtlı bagaj dahil" : "Checked bag included"));
  } else parts.push(t.bagUnknown);
  return parts.length ? parts.join(" · ") : t.basic;
}

export function boolToAttribute(value: boolean | undefined | null): FareAttributeState {
  if (value === true) return "included";
  if (value === false) return "not_available";
  return "unknown";
}

/* ------------------------------------------------------------------ */
/* Hotels — unified supply model (shared by every hotel supplier)      */
/* ------------------------------------------------------------------ */

export type HotelSupplierId = "travelport" | "ratehawk" | "hotelbeds" | "seeru";

/** Meal / board basis normalised across suppliers. */
export type BoardCode = "RO" | "BB" | "HB" | "FB" | "AI" | "UAI" | "OTHER";

export type PaymentType = "prepay" | "pay_at_hotel" | "deposit";

export interface CancellationPolicyRule {
  /** ISO datetime after which this penalty applies. */
  from: string;
  /** Penalty amount in `currency` (absolute). */
  amount: number;
  currency: string;
  /** Free-text from supplier (never fabricated). */
  description?: string;
}

export interface RatePrice {
  /** What the supplier charges us. */
  net: number;
  /** Price shown to the customer before agency markup (supplier selling/recommended). */
  selling: number;
  currency: string;
  taxesIncluded: boolean;
  taxes?: number;
  perNight?: number;
  total: number;
}

/**
 * A single bookable rate plan for a room group.
 * Nothing here is generated — every field is copied from the supplier response.
 */
export interface RatePlan {
  id: string;
  supplier: HotelSupplierId;
  roomGroupId: string;
  /** Raw supplier room / rate code (rateKey, book_hash, rate_id, ratePlanId). */
  supplierToken: string;
  /** Supplier's own room-code/rate-code needed for booking flows (e.g. Seeru search_id). */
  supplierContext?: Record<string, string>;
  board: BoardCode;
  boardName?: string;
  refundable: boolean;
  cancellationType?: "free" | "fee_applies" | "non_refundable";
  freeCancellationUntil?: string;
  currentPenalty?: { amount: number; currency: string };
  cancellationPolicies: CancellationPolicyRule[];
  paymentType: PaymentType;
  price: RatePrice;
  /** Hotelbeds RECHECK rates must be re-priced before booking. */
  rateType: "BOOKABLE" | "RECHECK";
  promotions?: string[];
  remainingRooms?: number;
  occupancy?: { adults: number; children: number; rooms: number };
  rateComments?: string;
}

export interface RoomGroup {
  id: string;
  supplier: HotelSupplierId;
  /** Supplier room type code (Hotelbeds roomCode, RateHawk rg_ext hash, Seeru room_type_id...) */
  supplierRoomCode?: string;
  name: string;
  description?: string;
  images: string[];
  sizeSqm?: number;
  beds?: string;
  maxOccupancy?: number;
  amenities: string[];
  ratePlans: RatePlan[];
}

export interface SupplierReviewScore {
  source: string;
  score: number;
  scale: number;
  count?: number;
}

/**
 * A hotel offer as returned by one supplier for one stay.
 * `price`/`currency` = cheapest rate plan total for the stay.
 */
export interface HotelSearchCard {
  id: string;
  provider: HotelSupplierId;
  /** Supplier native hotel id (without our prefix). */
  supplierHotelId: string;
  name: string;
  city: string;
  countryCode?: string;
  address?: string;
  lat?: number;
  lng?: number;
  stars?: number;
  /** Real guest score from supplier (e.g. Hotelbeds TripAdvisor, RateHawk rating). */
  reviewScore?: SupplierReviewScore;
  /** @deprecated legacy field used by older UIs, prefer reviewScore */
  rating?: number;
  giataCode?: string;
  description?: string;
  amenities?: string[];
  image?: string;
  images?: string[];
  heroImage?: string;
  /** Cheapest total for the whole stay (all rooms requested). */
  price: number;
  currency: string;
  nights: number;
  checkIn: string;
  checkOut: string;
  roomGroups: RoomGroup[];
  /** Flat list (all room groups) for quick access. */
  ratePlans: RatePlan[];
  /** Legacy compact rooms (kept for older consumers). */
  rooms?: Array<{
    id?: string;
    name?: string;
    price?: number;
    currency?: string;
    refundable?: boolean;
    boardType?: string;
  }>;
  /** Supplier session context required by later calls (e.g. Seeru search_id). */
  searchContext?: Record<string, string>;
  raw?: unknown;
}

export interface SupplierSearchStats {
  supplier: HotelSupplierId;
  ok: boolean;
  count: number;
  latencyMs: number;
  error?: string;
  /** True if the supplier told us more pages exist and we stopped early. */
  truncated?: boolean;
  pagesFetched?: number;
}
