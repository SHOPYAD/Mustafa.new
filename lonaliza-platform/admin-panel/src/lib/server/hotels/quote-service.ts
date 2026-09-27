/**
 * Mandatory supplier re-price before payment (plan A3).
 *
 *   Hotelbeds  → /checkrates (fresh rateKey, final net, cancellation policies)
 *   RateHawk   → hotel/prebook (finalized book_hash, price_changed flag)
 *   Travelport → catalogofferingshospitality re-run (fresh CatalogOffering id for the same rate)
 *   Seeru      → /rates re-run (the hold itself — booking/save — happens when the booking is
 *                created because Seeru needs the customer's details)
 *
 * The quote is the single source of truth for the amount that is charged and for the supplier token
 * used at fulfilment. It lives 15 minutes in Redis + PocketBase (`hotel_quotes`).
 */

import type PocketBase from "pocketbase";
import type { HotelSupplierId, RatePlan } from "@/lib/providers/adapters/common/types";
import { HotelbedsHotelAdapter, mapHotelbedsRooms } from "@/lib/providers/adapters/hotelbeds/HotelbedsHotelAdapter";
import { RateHawkHotelAdapter, mapRateHawkRooms } from "@/lib/providers/adapters/ratehawk/RateHawkHotelAdapter";
import { TravelportHotelAdapter } from "@/lib/providers/adapters/travelport/TravelportHotelAdapter";
import { SeeruHotelAdapter } from "@/lib/providers/adapters/seeru/seeruHotelAdapter";
import { applyHotelMarkup } from "@/lib/hotels-runtime";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { cacheGet, cacheSet } from "./cache";
import { getRatePlanSnapshot, type RatePlanSnapshot } from "./details-service";
import { nightsBetween, round2, splitPublicHotelId } from "./normalize";
import { supplyLogger } from "./telemetry";

export const QUOTE_TTL_MS = 15 * 60 * 1000;
/** Price movements below this fraction are absorbed silently (same tolerance Hotelbeds applies). */
const PRICE_TOLERANCE = 0.005;

export interface HotelQuote {
  id: string;
  supplier: HotelSupplierId;
  hotelId: string;
  supplierHotelId: string;
  masterId?: string;
  sessionId?: string;
  user?: string;
  hotelName: string;
  hotelImage: string;
  stars: number;
  city: string;
  address: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  childrenAges: number[];
  rooms: number;
  roomName: string;
  roomImage: string;
  board: string;
  boardName?: string;
  refundable: boolean;
  freeCancellationUntil?: string;
  cancellationPolicies: RatePlan["cancellationPolicies"];
  paymentType: RatePlan["paymentType"];
  rateType: RatePlan["rateType"];
  /** Private — never sent to the browser. */
  supplierToken: string;
  originalToken: string;
  supplierContext: Record<string, string>;
  netTotal: number;
  sellingTotal: number;
  perNight: number;
  currency: string;
  taxesIncluded: boolean;
  markupRuleId?: string;
  priceChanged: boolean;
  previousTotal?: number;
  status: "quoted" | "consumed" | "expired" | "failed";
  expiresAt: string;
  bookingId?: string;
  error?: string;
  createdAt: string;
}

/** What the browser is allowed to see. */
export type PublicHotelQuote = Omit<HotelQuote, "supplierToken" | "originalToken" | "supplierContext" | "netTotal" | "markupRuleId">;

export function toPublicQuote(q: HotelQuote): PublicHotelQuote {
  const { supplierToken: _t, originalToken: _o, supplierContext: _c, netTotal: _n, markupRuleId: _m, ...pub } = q;
  void _t;
  void _o;
  void _c;
  void _n;
  void _m;
  return pub;
}

export interface CreateQuoteInput {
  /** Rate plan id as shown on the details page (`rates[].id`). */
  rateId?: string;
  /** Fallback when the snapshot expired: public hotel id + supplier token as delivered by the details page. */
  hotelId?: string;
  supplierToken?: string;
  supplierContext?: Record<string, string>;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  rooms?: number;
  childrenAges?: number[];
  currency?: string;
  /** Total the customer saw (used only to flag "price changed"). */
  expectedTotal?: number;
  sessionId?: string;
  masterId?: string;
  userId?: string;
  lang?: string;
}

export type CreateQuoteResult = { ok: true; quote: HotelQuote } | { ok: false; error: string; code: "not_found" | "unavailable" | "supplier_error" | "invalid" };

/* ------------------------------------------------------------------------------------------------ */

function quoteKey(id: string): string {
  return `quote:${id}`;
}

function newQuoteId(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 15; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

async function requoteHotelbeds(plan: RatePlan, nights: number): Promise<{ plan: RatePlan; hotel: any } | { error: string }> {
  const res = await new HotelbedsHotelAdapter().checkRates([plan.supplierToken]);
  if (!res.ok || !res.hotel) return { error: res.error || "checkrates_failed" };
  const groups = mapHotelbedsRooms(res.hotel, plan.price.currency, nights);
  const plans = groups.flatMap((g) => g.ratePlans);
  // We sent exactly one rateKey; Hotelbeds echoes one rate (with a fresh key). Prefer an exact
  // board+room match when several are returned.
  const exact = plans.find((p) => p.supplierToken === plan.supplierToken) || plans.find((p) => p.board === plan.board && p.roomGroupId === plan.roomGroupId) || plans[0];
  if (!exact) return { error: "rate_unavailable" };
  return { plan: { ...exact, rateType: "BOOKABLE" }, hotel: res.hotel };
}

async function requoteRateHawk(plan: RatePlan, supplierHotelId: string, nights: number): Promise<{ plan: RatePlan; priceChanged: boolean } | { error: string }> {
  const pre = await new RateHawkHotelAdapter().prebook(plan.supplierToken, 0);
  if (!pre.ok) return { error: pre.error || "prebook_failed" };
  const groups = pre.rate ? mapRateHawkRooms(supplierHotelId, [pre.rate], plan.price.currency, nights) : [];
  const fresh = groups.flatMap((g) => g.ratePlans)[0];
  const next: RatePlan = fresh ? { ...fresh, supplierToken: pre.finalizedBookHash } : { ...plan, supplierToken: pre.finalizedBookHash };
  return { plan: next, priceChanged: pre.priceChanged };
}

async function requoteTravelport(plan: RatePlan, snap: Pick<RatePlanSnapshot, "supplierHotelId" | "checkIn" | "checkOut" | "adults" | "rooms" | "childrenAges">): Promise<{ plan: RatePlan } | { error: string }> {
  const avail = await new TravelportHotelAdapter().availability({
    propertyId: snap.supplierHotelId,
    checkIn: snap.checkIn,
    checkOut: snap.checkOut,
    adults: snap.adults,
    rooms: snap.rooms,
    childrenAges: snap.childrenAges,
    currency: plan.price.currency,
  });
  const plans = avail.roomGroups.flatMap((g) => g.ratePlans);
  const same =
    plans.find((p) => p.supplierToken === plan.supplierToken) ||
    plans.find(
      (p) =>
        p.roomGroupId === plan.roomGroupId &&
        p.board === plan.board &&
        p.supplierContext?.bookingCode === plan.supplierContext?.bookingCode &&
        p.supplierContext?.rateCode === plan.supplierContext?.rateCode
    ) ||
    plans.find((p) => p.roomGroupId === plan.roomGroupId && p.board === plan.board && p.refundable === plan.refundable && Math.abs(p.price.total - plan.price.total) / Math.max(1, plan.price.total) < 0.05);
  if (!same) return { error: "rate_unavailable" };
  return { plan: same };
}

async function requoteSeeru(plan: RatePlan, snap: Pick<RatePlanSnapshot, "supplierHotelId" | "checkIn" | "checkOut" | "adults" | "rooms">): Promise<{ plan: RatePlan } | { error: string }> {
  const rates = await new SeeruHotelAdapter().getRates({
    propertyId: snap.supplierHotelId,
    checkIn: snap.checkIn,
    checkOut: snap.checkOut,
    adults: snap.adults,
    rooms: snap.rooms,
    src: plan.supplierContext?.src || undefined,
    currency: plan.price.currency,
  });
  const plans = rates.roomGroups.flatMap((g) => g.ratePlans);
  const same = plans.find((p) => p.supplierToken === plan.supplierToken) || plans.find((p) => p.supplierContext?.matchHash && p.supplierContext.matchHash === plan.supplierContext?.matchHash);
  if (!same) return { error: "rate_unavailable" };
  return { plan: same };
}

/* ------------------------------------------------------------------------------------------------ */

async function resolveSnapshot(input: CreateQuoteInput): Promise<RatePlanSnapshot | null> {
  if (input.rateId) {
    const snap = await getRatePlanSnapshot(input.rateId);
    if (snap) return snap;
  }
  // Fallback: rebuild a minimal snapshot from the explicit token (details page passed it to /hotels/book).
  if (input.hotelId && input.supplierToken && input.checkIn && input.checkOut) {
    const split = splitPublicHotelId(input.hotelId);
    if (!split) return null;
    const plan: RatePlan = {
      id: input.rateId || `${split.supplier}:${input.supplierToken.slice(0, 40)}`,
      supplier: split.supplier,
      roomGroupId: "",
      supplierToken: input.supplierToken,
      supplierContext: input.supplierContext || {},
      board: "RO",
      refundable: false,
      cancellationPolicies: [],
      paymentType: "prepay",
      price: { net: input.expectedTotal || 0, selling: input.expectedTotal || 0, currency: (input.currency || "USD").toUpperCase(), taxesIncluded: true, total: input.expectedTotal || 0 },
      rateType: "RECHECK",
    };
    return {
      plan,
      hotelId: input.hotelId,
      supplierHotelId: split.supplierHotelId,
      masterId: input.masterId,
      hotelName: "",
      hotelImage: "",
      stars: 0,
      city: "",
      address: "",
      roomName: "",
      roomImage: "",
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: Math.max(1, input.adults || 2),
      rooms: Math.max(1, input.rooms || 1),
      childrenAges: input.childrenAges || [],
      lang: input.lang || "ar",
    };
  }
  return null;
}

export async function createHotelQuote(input: CreateQuoteInput): Promise<CreateQuoteResult> {
  const snap = await resolveSnapshot(input);
  if (!snap) return { ok: false, error: "rate_not_found", code: "not_found" };
  const plan = snap.plan;
  const nights = Math.max(1, nightsBetween(snap.checkIn, snap.checkOut));
  const started = Date.now();

  let fresh: RatePlan;
  let priceChanged = false;
  let hotelMeta: { name?: string; image?: string } = {};
  /** Supplier messages that mean "this exact rate can no longer be sold" (not a transport/system error). */
  const unavailableRe = /insufficient allotment|allotment|no availability|not available|rate ?key.*(expired|invalid)|expired|sold ?out|price has changed|not found|closed sale|stop ?sale/i;
  const classify = (error: string): "unavailable" | "supplier_error" =>
    error === "rate_unavailable" || unavailableRe.test(error) ? "unavailable" : "supplier_error";
  try {
    switch (plan.supplier) {
      case "hotelbeds": {
        // BOOKABLE rates are still re-checked: it is cheap and gives us the final cancellation policy.
        const r = await requoteHotelbeds(plan, nights);
        if ("error" in r) return { ok: false, error: r.error, code: classify(r.error) };
        fresh = r.plan;
        hotelMeta = { name: r.hotel?.name };
        break;
      }
      case "ratehawk": {
        const r = await requoteRateHawk(plan, snap.supplierHotelId, nights);
        if ("error" in r) return { ok: false, error: r.error, code: classify(r.error) };
        fresh = r.plan;
        priceChanged = r.priceChanged;
        break;
      }
      case "travelport": {
        const r = await requoteTravelport(plan, snap);
        if ("error" in r) return { ok: false, error: r.error, code: classify(r.error) };
        fresh = r.plan;
        break;
      }
      case "seeru": {
        const r = await requoteSeeru(plan, snap);
        if ("error" in r) return { ok: false, error: r.error, code: classify(r.error) };
        fresh = r.plan;
        break;
      }
      default:
        return { ok: false, error: "unsupported_supplier", code: "invalid" };
    }
  } catch (err) {
    supplyLogger.warn({ supplier: plan.supplier, err: String(err) }, "quote failed");
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message, code: classify(message) };
  }

  // Selling price = supplier price + agency markup (same rule set the details page used).
  const runtime = await getHotelsRuntime();
  const marked = applyHotelMarkup(fresh.price.total, runtime.markupRules, {
    country: undefined,
    city: snap.city || undefined,
    destination: snap.city || undefined,
    provider: "supplier",
    currency: fresh.price.currency,
  });
  const sellingTotal = round2(marked.price);
  const expected = input.expectedTotal && input.expectedTotal > 0 ? input.expectedTotal : plan.price.total > 0 ? round2(applyHotelMarkup(plan.price.total, runtime.markupRules, { city: snap.city || undefined, destination: snap.city || undefined, provider: "supplier", currency: plan.price.currency }).price) : 0;
  if (expected > 0 && (fresh.price.currency !== plan.price.currency || Math.abs(sellingTotal - expected) / expected > PRICE_TOLERANCE)) priceChanged = true;

  const now = Date.now();
  const quote: HotelQuote = {
    id: newQuoteId(),
    supplier: plan.supplier,
    hotelId: snap.hotelId,
    supplierHotelId: snap.supplierHotelId,
    masterId: snap.masterId || input.masterId,
    sessionId: input.sessionId,
    user: input.userId,
    hotelName: snap.hotelName || hotelMeta.name || "",
    hotelImage: snap.hotelImage || hotelMeta.image || "",
    stars: snap.stars,
    city: snap.city,
    address: snap.address,
    checkIn: snap.checkIn,
    checkOut: snap.checkOut,
    nights,
    adults: snap.adults,
    childrenAges: snap.childrenAges,
    rooms: snap.rooms,
    roomName: snap.roomName,
    roomImage: snap.roomImage,
    board: fresh.board,
    boardName: fresh.boardName,
    refundable: fresh.refundable,
    freeCancellationUntil: fresh.freeCancellationUntil,
    cancellationPolicies: fresh.cancellationPolicies,
    paymentType: fresh.paymentType,
    rateType: fresh.rateType,
    supplierToken: fresh.supplierToken,
    originalToken: plan.supplierToken,
    supplierContext: { ...(plan.supplierContext || {}), ...(fresh.supplierContext || {}) },
    netTotal: round2(fresh.price.net),
    sellingTotal,
    perNight: round2(sellingTotal / nights),
    currency: fresh.price.currency,
    taxesIncluded: fresh.price.taxesIncluded,
    markupRuleId: marked.rule?.id,
    priceChanged,
    previousTotal: priceChanged ? expected || undefined : undefined,
    status: "quoted",
    expiresAt: new Date(now + QUOTE_TTL_MS).toISOString(),
    createdAt: new Date(now).toISOString(),
  };

  await saveQuote(quote);
  supplyLogger.info({ quoteId: quote.id, supplier: quote.supplier, total: quote.sellingTotal, currency: quote.currency, priceChanged, latencyMs: Date.now() - started }, "hotel quote created");
  return { ok: true, quote };
}

/* ------------------------------------------------------------------------------------------------ */

async function saveQuote(q: HotelQuote): Promise<void> {
  await cacheSet(quoteKey(q.id), q, Math.ceil(QUOTE_TTL_MS / 1000) + 24 * 3600);
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  try {
    await pb.collection("hotel_quotes").create({ id: q.id, ...toRecord(q) });
  } catch (err) {
    supplyLogger.warn({ err: String(err) }, "hotel_quotes create failed");
  }
}

function toRecord(q: HotelQuote): Record<string, unknown> {
  return {
    supplier: q.supplier,
    hotelId: q.hotelId,
    supplierHotelId: q.supplierHotelId,
    masterId: q.masterId || "",
    sessionId: q.sessionId || "",
    user: q.user || "",
    hotelName: q.hotelName,
    hotelImage: q.hotelImage,
    stars: q.stars,
    city: q.city,
    address: q.address,
    checkIn: q.checkIn,
    checkOut: q.checkOut,
    adults: q.adults,
    childrenAges: q.childrenAges,
    rooms: q.rooms,
    roomName: q.roomName,
    roomImage: q.roomImage,
    board: q.board,
    boardName: q.boardName || "",
    refundable: q.refundable,
    freeCancellationUntil: q.freeCancellationUntil || "",
    cancellationPolicies: q.cancellationPolicies,
    paymentType: q.paymentType,
    rateType: q.rateType,
    supplierToken: q.supplierToken,
    originalToken: q.originalToken,
    supplierContext: q.supplierContext,
    netTotal: q.netTotal,
    sellingTotal: q.sellingTotal,
    perNight: q.perNight,
    currency: q.currency,
    taxesIncluded: q.taxesIncluded,
    markupRuleId: q.markupRuleId || "",
    priceChanged: q.priceChanged,
    previousTotal: q.previousTotal ?? 0,
    status: q.status,
    expiresAt: q.expiresAt,
    bookingId: q.bookingId || "",
    error: q.error || "",
  };
}

function fromRecord(r: Record<string, any>): HotelQuote {
  return {
    id: String(r.id),
    supplier: r.supplier,
    hotelId: String(r.hotelId || ""),
    supplierHotelId: String(r.supplierHotelId || ""),
    masterId: r.masterId || undefined,
    sessionId: r.sessionId || undefined,
    user: r.user || undefined,
    hotelName: String(r.hotelName || ""),
    hotelImage: String(r.hotelImage || ""),
    stars: Number(r.stars) || 0,
    city: String(r.city || ""),
    address: String(r.address || ""),
    checkIn: String(r.checkIn || ""),
    checkOut: String(r.checkOut || ""),
    nights: Math.max(1, nightsBetween(String(r.checkIn || ""), String(r.checkOut || ""))),
    adults: Number(r.adults) || 2,
    childrenAges: Array.isArray(r.childrenAges) ? r.childrenAges.map(Number) : [],
    rooms: Number(r.rooms) || 1,
    roomName: String(r.roomName || ""),
    roomImage: String(r.roomImage || ""),
    board: String(r.board || "RO"),
    boardName: r.boardName || undefined,
    refundable: Boolean(r.refundable),
    freeCancellationUntil: r.freeCancellationUntil || undefined,
    cancellationPolicies: Array.isArray(r.cancellationPolicies) ? r.cancellationPolicies : [],
    paymentType: r.paymentType || "prepay",
    rateType: r.rateType || "BOOKABLE",
    supplierToken: String(r.supplierToken || ""),
    originalToken: String(r.originalToken || ""),
    supplierContext: r.supplierContext && typeof r.supplierContext === "object" ? r.supplierContext : {},
    netTotal: Number(r.netTotal) || 0,
    sellingTotal: Number(r.sellingTotal) || 0,
    perNight: Number(r.perNight) || 0,
    currency: String(r.currency || "USD"),
    taxesIncluded: Boolean(r.taxesIncluded),
    markupRuleId: r.markupRuleId || undefined,
    priceChanged: Boolean(r.priceChanged),
    previousTotal: Number(r.previousTotal) || undefined,
    status: r.status || "quoted",
    expiresAt: String(r.expiresAt || ""),
    bookingId: r.bookingId || undefined,
    error: r.error || undefined,
    createdAt: String(r.created || r.createdAt || ""),
  };
}

export async function getHotelQuote(id: string, pb?: PocketBase | null): Promise<HotelQuote | null> {
  const clean = String(id || "").trim().replace(/[^a-z0-9]/gi, "").slice(0, 40);
  if (!clean) return null;
  const cached = await cacheGet<HotelQuote>(quoteKey(clean));
  if (cached) return cached;
  const client = pb ?? (await tryCreateAdminPocketBase());
  if (!client) return null;
  try {
    const rec = await client.collection("hotel_quotes").getOne(clean);
    const q = fromRecord(rec as unknown as Record<string, any>);
    await cacheSet(quoteKey(clean), q, 3600);
    return q;
  } catch {
    return null;
  }
}

export function quoteIsUsable(q: HotelQuote): { ok: true } | { ok: false; reason: "expired" | "consumed" | "failed" } {
  if (q.status === "consumed") return { ok: false, reason: "consumed" };
  if (q.status === "failed") return { ok: false, reason: "failed" };
  if (q.status === "expired" || Date.parse(q.expiresAt) < Date.now()) return { ok: false, reason: "expired" };
  return { ok: true };
}

export async function updateHotelQuote(id: string, patch: Partial<Pick<HotelQuote, "status" | "bookingId" | "error" | "supplierToken" | "supplierContext" | "sellingTotal" | "netTotal" | "currency">>): Promise<HotelQuote | null> {
  const current = await getHotelQuote(id);
  if (!current) return null;
  const next: HotelQuote = { ...current, ...patch };
  await cacheSet(quoteKey(id), next, 24 * 3600);
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      await pb.collection("hotel_quotes").update(id, toRecord(next));
    } catch (err) {
      supplyLogger.warn({ err: String(err), id }, "hotel_quotes update failed");
    }
  }
  return next;
}
