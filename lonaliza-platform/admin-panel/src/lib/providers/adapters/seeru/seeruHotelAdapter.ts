/**
 * Seeru Hotels API v1 adapter — implemented against the OFFICIAL OpenAPI spec
 * (https://docs.seeru.travel/docs/hotels-api-v1.0.0.yml), base `https://{sandbox|live}-api.seeru.travel/v1/hotels`.
 *
 *   GET  /suggest?query=                         → regions[{id,name,country_code,type}], hotels[{id,name}]
 *   GET  /search?lat&lng&radius|region_id&checkInDate&checkOutDate&numAdults&numRooms&residency&currency → search_id
 *   GET  /result/{search_id}?after&wait&currency → { complete 0..100, last_result, hotels: HotelSummary[] }
 *   GET  /rates?propertyId&checkInDate&checkOutDate&numAdults&numRooms&src&currency → { rates: HotelRate[] }
 *   POST /booking/save   { src, propertyId, rate_key, dates, numAdults, numRooms, currency, customerInfo, guests } → order_id, final_price (quote + hold, no charge)
 *   POST /order/issue    { order_id } → reservation_no  (charges agency balance; rate re-validated)
 *   POST /order/details  { order_id } → HotelOrder (status new|ticketing|ticketed|cancelled|error)
 *   POST /order/cancel   { order_id }
 *
 * Notes: Seeru already aggregates several suppliers (`providers[]`, `master_id`) and returns FINAL prices in the
 * requested currency. It exposes no room photos/descriptions and no separate fare-check endpoint — the price is
 * re-validated at issue time, so every rate is flagged RECHECK and `/booking/save` is our quote step.
 * The previous local "integration guide" described endpoints that do not exist; it must not be trusted.
 */

import { getSeeruHotelContext, seeruRequest } from "./seeruClient";
import type { HotelSearchCard, RatePlan, RoomGroup } from "../common/types";
import type { HotelContent } from "@/lib/server/hotels/content-types";
import { getCachedContent, putCachedContent } from "@/lib/server/hotels/content-cache";
import { cleanText, deriveCancellation, httpsOnly, nightsBetween, normalizeBoard, publicHotelId, round2, toNumber } from "@/lib/server/hotels/normalize";
import { recordSupplierCall } from "@/lib/server/hotels/telemetry";

export interface SeeruHotelSearchParams {
  /** Free text the user typed (hotel/brand name) — flags name_match. */
  query?: string;
  regionId?: string;
  geo?: { latitude: number; longitude: number; radiusKm?: number };
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
  residency?: string;
  currency?: string;
  /** Restrict to one Seeru supplier code (H1, H2, ...). */
  src?: string;
  /** Overall polling budget. */
  budgetMs?: number;
  signal?: AbortSignal;
}

export interface SeeruHotelBookingInput {
  src: string;
  propertyId: string;
  rateKey: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
  currency?: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  guests: Array<{ firstName: string; lastName: string }>;
}

export class SeeruServiceDisabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeeruServiceDisabledError";
  }
}

function toLatinGuestName(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "GUEST";
  if (/^[A-Za-z\s\-']+$/.test(trimmed)) return trimmed.toUpperCase();
  const map: Record<string, string> = {
    ا: "A", أ: "A", إ: "E", آ: "AA", ب: "B", ت: "T", ث: "TH", ج: "J", ح: "H", خ: "KH", د: "D", ذ: "DH",
    ر: "R", ز: "Z", س: "S", ش: "SH", ص: "S", ض: "D", ط: "T", ظ: "Z", ع: "A", غ: "GH", ف: "F", ق: "Q",
    ك: "K", ل: "L", م: "M", ن: "N", ه: "H", و: "W", ي: "Y", ى: "A", ة: "A", ء: "A", ئ: "Y", ؤ: "W",
  };
  let latin = "";
  for (const ch of trimmed) {
    if (map[ch]) latin += map[ch];
    else if (/[A-Za-z0-9]/.test(ch)) latin += ch.toUpperCase();
    else if (ch === " " || ch === "-") latin += ch;
  }
  return latin.trim().replace(/\s+/g, " ") || "GUEST";
}

function toE164(phone: string): string {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  return `+${digits}`;
}

function isServiceDisabled(err: unknown): boolean {
  return /not enabled for this office|Service 'hotels'/i.test(String((err as any)?.message || err));
}

/** Parses "Free cancellation before 2026-08-30" style strings into an ISO deadline. */
function cancellationDeadline(text?: string | null): string | undefined {
  const m = String(text || "").match(/(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?/);
  if (!m) return undefined;
  return m[2] ? `${m[1]}T${m[2]}` : `${m[1]}T00:00:00`;
}

function mapSeeruRate(rate: any, propertyId: string, nights: number, idx: number, fallbackCurrency: string): RatePlan | null {
  const total = toNumber(rate?.price);
  const rateKey = String(rate?.rate_key || "");
  if (!rateKey || !total) return null;
  const currency = String(rate.currency || fallbackCurrency);
  const roomName = cleanText(rate.room_name) || "Room";
  const deadline = cancellationDeadline(rate.cancellation);
  const refundable = typeof rate.refundable === "boolean" ? rate.refundable : Boolean(deadline);
  const policies = !refundable
    ? []
    : deadline
      ? [{ from: deadline, amount: total, currency, description: cleanText(rate.cancellation) }]
      : [];
  const derived = deriveCancellation(policies);
  return {
    id: `sr:${rateKey.slice(0, 48)}:${idx}`,
    supplier: "seeru",
    roomGroupId: `sr:${propertyId}:${roomName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    supplierToken: rateKey,
    supplierContext: { src: String(rate.src || ""), propertyId, matchHash: String(rate.match_hash || "") },
    board: normalizeBoard(rate.board),
    boardName: cleanText(rate.board),
    refundable,
    freeCancellationUntil: refundable ? deadline || derived.freeCancellationUntil : undefined,
    cancellationPolicies: policies,
    paymentType: "prepay",
    price: { net: round2(total), selling: round2(total), currency, taxesIncluded: true, perNight: round2(total / Math.max(1, nights)), total: round2(total) },
    rateType: "RECHECK", // re-validated by Seeru at /order/issue; /booking/save is our quote
    rateComments: cleanText(rate.cancellation),
  };
}

export function mapSeeruRates(propertyId: string, rates: any[], nights: number, fallbackCurrency: string): RoomGroup[] {
  const groups = new Map<string, RoomGroup>();
  rates.forEach((r, idx) => {
    const plan = mapSeeruRate(r, propertyId, nights, idx, fallbackCurrency);
    if (!plan) return;
    const g = groups.get(plan.roomGroupId) || {
      id: plan.roomGroupId,
      supplier: "seeru" as const,
      supplierRoomCode: undefined,
      name: cleanText(r.room_name) || "Room",
      description: undefined,
      images: [],
      amenities: [],
      ratePlans: [],
    };
    g.ratePlans.push(plan);
    groups.set(plan.roomGroupId, g);
  });
  const out = Array.from(groups.values());
  for (const g of out) g.ratePlans.sort((a, b) => a.price.total - b.price.total);
  return out.sort((a, b) => (a.ratePlans[0]?.price.total || 0) - (b.ratePlans[0]?.price.total || 0));
}

function summaryToCard(h: any, params: { checkIn: string; checkOut: string; currency?: string; city?: string }, nights: number, cached: HotelContent | null): HotelSearchCard | null {
  const propertyId = String(h.propertyId || "");
  const total = toNumber(h.price);
  if (!propertyId || !total) return null;
  const currency = String(h.currency || params.currency || "USD");
  const roomGroups = mapSeeruRates(propertyId, Array.isArray(h.rates) ? h.rates : [], nights, currency);
  const ratePlans = roomGroups.flatMap((g) => g.ratePlans);
  const placeholder: RatePlan = {
    id: `sr:min:${propertyId}`,
    supplier: "seeru",
    roomGroupId: `sr:${propertyId}:min`,
    supplierToken: "",
    supplierContext: { propertyId, src: String(h.best_src || h.src || ""), needsRates: "1" },
    board: "OTHER",
    refundable: false,
    cancellationPolicies: [],
    paymentType: "prepay",
    price: { net: round2(total), selling: round2(total), currency, taxesIncluded: true, perNight: round2(total / nights), total: round2(total) },
    rateType: "RECHECK",
  };
  const images = httpsOnly([h.image, ...(cached?.images.map((i) => i.url) || [])]);
  return {
    id: publicHotelId("seeru", propertyId),
    provider: "seeru",
    supplierHotelId: propertyId,
    name: cleanText(h.name) || cached?.name || propertyId,
    city: cleanText(h.city) || cached?.city || params.city || "",
    countryCode: cleanText(h.country) || cached?.countryCode,
    address: cleanText(h.address) || cached?.address,
    lat: h.latitude != null ? toNumber(h.latitude) : cached?.lat,
    lng: h.longitude != null ? toNumber(h.longitude) : cached?.lng,
    stars: h.stars != null ? toNumber(h.stars) || undefined : cached?.stars,
    image: images[0],
    images,
    heroImage: images[0],
    amenities: Array.isArray(h.halal_features) ? h.halal_features.map(String) : cached?.facilities.map((f) => f.name),
    price: round2(total),
    currency,
    nights,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    roomGroups,
    ratePlans: ratePlans.length ? ratePlans : [placeholder],
    searchContext: { src: String(h.best_src || h.src || ""), masterId: h.master_id != null ? String(h.master_id) : "", providers: Array.isArray(h.providers) ? h.providers.join(",") : "" },
    raw: { name_match: Boolean(h.name_match), providers: h.providers },
  };
}

export class SeeruHotelAdapter {
  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    const ctx = await getSeeruHotelContext();
    if (!ctx.token) return { ok: false, message: "لم يتم العثور على مفتاح API لموزع فنادق سيرو.", latencyMs: 0 };
    try {
      const inDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
      const outDate = new Date(Date.now() + 16 * 86400000).toISOString().slice(0, 10);
      const res = await seeruRequest(ctx, "/search", {
        method: "GET",
        params: { lat: 41.0082, lng: 28.9784, radius: 20000, checkInDate: inDate, checkOutDate: outDate, numAdults: 2, numRooms: 1, residency: "SA", currency: "USD" },
      });
      const latencyMs = Date.now() - started;
      const ok = Boolean(res?.search_id);
      recordSupplierCall({ supplier: "seeru", kind: "test", ok, latencyMs });
      return ok
        ? { ok: true, message: `تم التحقق من اتصال فنادق سيرو (${ctx.baseUrl}) — ${latencyMs}ms`, latencyMs }
        : { ok: false, message: "استجاب خادم Seeru لكن دون search_id", latencyMs };
    } catch (err: any) {
      const latencyMs = Date.now() - started;
      const msg = String(err?.message || err);
      recordSupplierCall({ supplier: "seeru", kind: "test", ok: false, latencyMs, error: msg });
      if (isServiceDisabled(err)) {
        return { ok: false, message: "خدمة الفنادق غير مفعّلة لهذا المكتب في Seeru (HTTP 403: Service 'hotels' is not enabled for this office). يجب طلب تفعيلها من Seeru قبل الاستخدام.", latencyMs };
      }
      if (/401|Unauthorized|not allowed/i.test(msg)) return { ok: false, message: "رمز Seeru غير مصرح له (401 Unauthorized)", latencyMs };
      return { ok: false, message: `فشل الاتصال بفنادق سيرو: ${msg}`, latencyMs };
    }
  }

  async suggest(query: string, language = "en"): Promise<{ regions: Array<{ id: string; name: string; countryCode: string; type: string }>; hotels: Array<{ id: string; name: string }> }> {
    const ctx = await getSeeruHotelContext();
    const res = await seeruRequest(ctx, "/suggest", { method: "GET", params: { query, language } });
    return {
      regions: (Array.isArray(res?.regions) ? res.regions : []).map((r: any) => ({ id: String(r.id), name: String(r.name || ""), countryCode: String(r.country_code || ""), type: String(r.type || "") })),
      hotels: (Array.isArray(res?.hotels) ? res.hotels : []).map((h: any) => ({ id: String(h.id), name: String(h.name || "") })),
    };
  }

  async startSearch(params: SeeruHotelSearchParams): Promise<string> {
    const ctx = await getSeeruHotelContext();
    if (!ctx.token) throw new Error("Seeru hotels token missing");
    if (!params.regionId && !params.geo) throw new Error("Seeru search needs regionId or coordinates");
    const res = await seeruRequest(ctx, "/search", {
      method: "GET",
      params: {
        ...(params.geo ? { lat: params.geo.latitude, lng: params.geo.longitude, radius: Math.round((params.geo.radiusKm || 20) * 1000) } : {}),
        ...(params.regionId ? { region_id: params.regionId } : {}),
        ...(params.query ? { name: params.query } : {}),
        checkInDate: params.checkIn,
        checkOutDate: params.checkOut,
        numAdults: Math.max(1, params.adults || 2),
        numRooms: Math.max(1, params.rooms || 1),
        residency: (params.residency || "SA").toUpperCase(),
        currency: params.currency || "USD",
        ...(params.src ? { src: params.src } : {}),
      },
    });
    const searchId = res?.search_id;
    if (!searchId) throw new Error("Seeru /search returned no search_id");
    return String(searchId);
  }

  /** Polls /result until complete=100 (or budget), using the `after` cursor and server-side `wait`. */
  async searchHotels(params: SeeruHotelSearchParams): Promise<HotelSearchCard[]> {
    const started = Date.now();
    const ctx = await getSeeruHotelContext();
    const nights = nightsBetween(params.checkIn, params.checkOut);
    try {
      const searchId = await this.startSearch(params);
      const deadline = Date.now() + (params.budgetMs || 40_000);
      const byId = new Map<string, any>();
      let after = 0;
      let complete = 0;
      while (Date.now() < deadline && !params.signal?.aborted) {
        const res = await seeruRequest(ctx, `/result/${encodeURIComponent(searchId)}`, { method: "GET", params: { after, wait: 6, currency: params.currency || "USD" } });
        for (const h of Array.isArray(res?.hotels) ? res.hotels : []) if (h?.propertyId) byId.set(String(h.propertyId), h);
        complete = toNumber(res?.complete, complete);
        after = toNumber(res?.last_result, after);
        if (complete >= 100) break;
      }
      const cards: HotelSearchCard[] = [];
      for (const h of byId.values()) {
        const cached = await getCachedContent("seeru", String(h.propertyId));
        const card = summaryToCard(h, params, nights, cached);
        if (card) {
          card.searchContext = { ...(card.searchContext || {}), searchId };
          cards.push(card);
        }
      }
      recordSupplierCall({ supplier: "seeru", kind: "search", ok: true, latencyMs: Date.now() - started, count: cards.length, meta: { complete, searchId } });
      return cards;
    } catch (err: any) {
      recordSupplierCall({ supplier: "seeru", kind: "search", ok: false, latencyMs: Date.now() - started, error: String(err?.message || err) });
      if (isServiceDisabled(err)) throw new SeeruServiceDisabledError("Seeru: Service 'hotels' is not enabled for this office");
      throw err;
    }
  }

  /** Bookable rates for one property (final prices; each carries src + rate_key). */
  async getRates(input: { propertyId: string; checkIn: string; checkOut: string; adults?: number; rooms?: number; src?: string; currency?: string }): Promise<{ name?: string; country?: string; roomGroups: RoomGroup[] }> {
    const ctx = await getSeeruHotelContext();
    const propertyId = String(input.propertyId).replace(/^sh_/, "");
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const started = Date.now();
    try {
      const res = await seeruRequest(ctx, "/rates", {
        method: "GET",
        params: { propertyId, checkInDate: input.checkIn, checkOutDate: input.checkOut, numAdults: Math.max(1, input.adults || 2), numRooms: Math.max(1, input.rooms || 1), ...(input.src ? { src: input.src } : {}), currency: input.currency || "USD" },
      });
      const roomGroups = mapSeeruRates(propertyId, Array.isArray(res?.rates) ? res.rates : [], nights, input.currency || "USD");
      recordSupplierCall({ supplier: "seeru", kind: "rooms", ok: true, latencyMs: Date.now() - started, count: roomGroups.reduce((s, g) => s + g.ratePlans.length, 0), meta: { propertyId } });
      const name = cleanText(res?.name);
      if (name) {
        const existing = await getCachedContent("seeru", propertyId);
        const content: HotelContent = existing || { supplier: "seeru", supplierHotelId: propertyId, name, images: [], facilities: [], rooms: [], pois: [], language: "en", fetchedAt: new Date().toISOString() };
        content.name = name;
        content.countryCode = cleanText(res?.country) || content.countryCode;
        content.rooms = roomGroups.map((g) => ({ code: g.id, name: g.name, images: [], facilities: [] }));
        content.fetchedAt = new Date().toISOString();
        void putCachedContent(content);
      }
      return { name, country: cleanText(res?.country), roomGroups };
    } catch (err: any) {
      recordSupplierCall({ supplier: "seeru", kind: "rooms", ok: false, latencyMs: Date.now() - started, error: String(err?.message || err), meta: { propertyId } });
      throw err;
    }
  }

  async getHotelDetails(input: { hotelId: string; checkIn: string; checkOut: string; adults?: number; rooms?: number; src?: string; currency?: string }): Promise<{ card: HotelSearchCard | null; content: HotelContent | null }> {
    const propertyId = String(input.hotelId).replace(/^sh_/, "");
    const nights = nightsBetween(input.checkIn, input.checkOut);
    let rates: Awaited<ReturnType<SeeruHotelAdapter["getRates"]>> | null = null;
    try {
      rates = await this.getRates({ propertyId, ...input });
    } catch {
      rates = null;
    }
    const content = await getCachedContent("seeru", propertyId);
    if (!rates && !content) return { card: null, content: null };
    const roomGroups = rates?.roomGroups || [];
    const ratePlans = roomGroups.flatMap((g) => g.ratePlans);
    const cheapest = ratePlans.length ? ratePlans.reduce((a, b) => (a.price.total <= b.price.total ? a : b)) : null;
    const images = content ? content.images.map((i) => i.url) : [];
    return {
      content,
      card: {
        id: publicHotelId("seeru", propertyId),
        provider: "seeru",
        supplierHotelId: propertyId,
        name: rates?.name || content?.name || propertyId,
        city: content?.city || "",
        countryCode: rates?.country || content?.countryCode,
        address: content?.address,
        lat: content?.lat,
        lng: content?.lng,
        stars: content?.stars,
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

  /**
   * Quote + hold (no charge). This is the mandatory pre-payment step for Seeru: the returned `final_price`
   * is exactly what /order/issue will debit. Duplicate saves within 24h return HTTP 409 with the existing order_id.
   */
  async saveBooking(input: SeeruHotelBookingInput): Promise<{ ok: boolean; orderId: string; finalPrice: number; currency: string; duplicate?: boolean; hotel?: { name?: string; stars?: number; city?: string }; rate?: { roomName?: string; board?: string; freeCancellationBefore?: string | null }; message?: string }> {
    const ctx = await getSeeruHotelContext();
    const started = Date.now();
    try {
      const res = await seeruRequest(ctx, "/booking/save", {
        method: "POST",
        body: {
          src: input.src,
          propertyId: String(input.propertyId).replace(/^sh_/, ""),
          rate_key: input.rateKey,
          checkInDate: input.checkIn,
          checkOutDate: input.checkOut,
          numAdults: Math.max(1, input.adults || 2),
          numRooms: Math.max(1, input.rooms || 1),
          currency: input.currency || "USD",
          customerInfo: { firstName: toLatinGuestName(input.customer.firstName), lastName: toLatinGuestName(input.customer.lastName), email: input.customer.email, phone: toE164(input.customer.phone) },
          guests: input.guests.map((g) => ({ first_name: toLatinGuestName(g.firstName), last_name: toLatinGuestName(g.lastName) })),
        },
      });
      const ok = res?.status === "success" && Boolean(res?.order_id);
      recordSupplierCall({ supplier: "seeru", kind: "quote", ok, latencyMs: Date.now() - started, meta: { step: "save" } });
      return {
        ok,
        orderId: String(res?.order_id || ""),
        finalPrice: toNumber(res?.final_price),
        currency: String(res?.currency || input.currency || "USD"),
        hotel: res?.hotel ? { name: cleanText(res.hotel.name), stars: res.hotel.stars != null ? toNumber(res.hotel.stars) : undefined, city: cleanText(res.hotel.city) } : undefined,
        rate: res?.rate ? { roomName: cleanText(res.rate.room_name), board: cleanText(res.rate.board), freeCancellationBefore: res.rate.free_cancellation_before ?? null } : undefined,
        message: cleanText(res?.message),
      };
    } catch (err: any) {
      const latencyMs = Date.now() - started;
      // 409 DUPLICATE_ORDER carries the existing order id.
      const body = err?.response?.data || err?.body || err?.data;
      if (err?.status === 409 && body?.order_id) {
        recordSupplierCall({ supplier: "seeru", kind: "quote", ok: true, latencyMs, meta: { step: "save", duplicate: true } });
        return { ok: true, orderId: String(body.order_id), finalPrice: 0, currency: input.currency || "USD", duplicate: true, message: String(body.message || "DUPLICATE_ORDER") };
      }
      recordSupplierCall({ supplier: "seeru", kind: "quote", ok: false, latencyMs, error: String(err?.message || err), meta: { step: "save" } });
      throw err;
    }
  }

  /** Charges the agency balance and confirms with the supplier. Safe to retry when the order status is `error`. */
  async issueOrder(orderId: string): Promise<{ ok: boolean; orderId: string; reservationNo: string; message?: string }> {
    const ctx = await getSeeruHotelContext();
    const started = Date.now();
    try {
      const res = await seeruRequest(ctx, "/order/issue", { method: "POST", body: { order_id: orderId } });
      const ok = res?.status === "success";
      recordSupplierCall({ supplier: "seeru", kind: "book", ok, latencyMs: Date.now() - started, meta: { step: "issue", orderId } });
      return { ok, orderId: String(res?.order_id || orderId), reservationNo: String(res?.reservation_no || ""), message: cleanText(res?.message) };
    } catch (err: any) {
      recordSupplierCall({ supplier: "seeru", kind: "book", ok: false, latencyMs: Date.now() - started, error: String(err?.message || err), meta: { step: "issue", orderId } });
      throw err;
    }
  }

  async getOrderDetails(orderId: string): Promise<{ id: string; status: "new" | "ticketing" | "ticketed" | "cancelled" | "error" | string; reservationNo?: string; partnerOrderId?: string; failureReason?: string; price?: number; currency?: string; raw: any }> {
    const ctx = await getSeeruHotelContext();
    const res = await seeruRequest(ctx, "/order/details", { method: "POST", body: { order_id: orderId } });
    const booking = res?.payload?.booking || {};
    return {
      id: String(res?.id || orderId),
      status: String(res?.status || ""),
      reservationNo: res?.reservation_no ? String(res.reservation_no) : undefined,
      partnerOrderId: booking.partner_order_id ? String(booking.partner_order_id) : undefined,
      failureReason: booking.failure_reason ? String(booking.failure_reason) : undefined,
      price: booking.price != null ? toNumber(booking.price) : undefined,
      currency: booking.currency ? String(booking.currency) : undefined,
      raw: res,
    };
  }

  /** Cancels a saved (not yet issued) or errored order. Issued bookings cannot be cancelled via API. */
  async cancelReservation(orderId: string): Promise<{ ok: boolean; orderId: string; message?: string }> {
    const ctx = await getSeeruHotelContext();
    const started = Date.now();
    try {
      const res = await seeruRequest(ctx, "/order/cancel", { method: "POST", body: { order_id: orderId } });
      const ok = res?.status === "success";
      recordSupplierCall({ supplier: "seeru", kind: "cancel", ok, latencyMs: Date.now() - started, meta: { orderId } });
      return { ok, orderId: String(res?.order_id || orderId), message: cleanText(res?.message) };
    } catch (err: any) {
      recordSupplierCall({ supplier: "seeru", kind: "cancel", ok: false, latencyMs: Date.now() - started, error: String(err?.message || err), meta: { orderId } });
      throw err;
    }
  }
}
