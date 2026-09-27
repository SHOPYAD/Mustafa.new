/**
 * RateHawk / Emerging Travel Group B2B API v3 adapter.
 *
 *   search/multicomplete/   → region ids (handled in hotels/destinations.ts)
 *   search/serp/region/     → all hotels in a region with their rates
 *   search/serp/hotels/     → rates for specific hotel ids
 *   search/hp/              → hotel page: every rate for one hotel
 *   hotel/info/             → static content (images, room_groups, amenity_groups, description_struct, policies)
 *   hotel/prebook/          → mandatory re-price, returns a fresh book_hash
 *   hotel/order/booking/form|finish|finish/status|info|cancel
 *
 * Every rate is mapped to a RatePlan; rooms are grouped through `rg_ext` so rates
 * land under the correct room_group (name, photos, bedding) coming from hotel/info.
 */

import { randomUUID } from "crypto";
import { getRateHawkContext, ratehawkPostJson } from "./ratehawkClient";
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
  normalizeBoard,
  publicHotelId,
  round2,
  toNumber,
} from "@/lib/server/hotels/normalize";
import { recordSupplierCall } from "@/lib/server/hotels/telemetry";

export interface RateHawkSearchParams {
  query?: string;
  regionId?: number;
  hotelIds?: string[];
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number[];
  rooms?: number;
  residency?: string;
  currency?: string;
  language?: string;
  /** Skip hotel/info enrichment for hotels not already cached (progressive loading). */
  contentBudget?: number;
  signal?: AbortSignal;
}

export interface RateHawkGuest {
  firstName: string;
  lastName: string;
  isChild?: boolean;
  age?: number;
}

export interface RateHawkBookingInput {
  bookHash: string;
  partnerOrderId: string;
  guests: RateHawkGuest[];
  contactEmail: string;
  contactPhone: string;
  amount?: string | number;
  currency?: string;
  specialRequests?: string;
  userIp?: string;
  /** Skip prebook when caller already did it and passes the finalized hash. */
  skipPrebook?: boolean;
}

export const RATEHAWK_IMAGE_SIZE = "1024x768";

export function ratehawkImage(url: string, size = RATEHAWK_IMAGE_SIZE): string {
  return String(url || "").replace("{size}", size);
}

/** ETG requires Latin guest names. */
export function toLatinGuestName(name: string): string {
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

function rgKey(rg: any): string {
  if (!rg || typeof rg !== "object") return "";
  const keys = ["class", "quality", "sex", "bathroom", "bedding", "family", "capacity", "club", "bedrooms", "balcony", "view", "floor"];
  return keys.map((k) => String(rg[k] ?? 0)).join(".");
}

function guestsBody(adults: number, children: number[], rooms: number) {
  const perRoomAdults = Math.max(1, Math.ceil(adults / Math.max(1, rooms)));
  return Array.from({ length: Math.max(1, rooms) }).map((_, i) => ({
    adults: i === 0 ? Math.max(1, adults - perRoomAdults * (rooms - 1)) : perRoomAdults,
    children: i === 0 ? children : [],
  }));
}

function mapPolicies(pt: any, currency: string): CancellationPolicyRule[] {
  const list: any[] = Array.isArray(pt?.cancellation_penalties?.policies) ? pt.cancellation_penalties.policies : [];
  return list
    .filter((p) => p && (p.start_at || p.end_at))
    .map((p) => ({
      from: String(p.start_at || p.end_at),
      amount: toNumber(p.amount_show ?? p.amount_charge),
      currency: String(pt.show_currency_code || pt.currency_code || currency),
    }));
}

function mapRate(rate: any, hotelId: string, currency: string, nights: number, index: number): RatePlan | null {
  const pts: any[] = Array.isArray(rate?.payment_options?.payment_types) ? rate.payment_options.payment_types : [];
  const pt = pts.find((p) => p.type === "deposit") || pts.find((p) => p.type === "now") || pts[0];
  if (!pt || !rate?.book_hash) return null;
  const rateCurrency = String(pt.show_currency_code || pt.currency_code || currency);
  const total = toNumber(pt.show_amount ?? pt.amount);
  const net = toNumber(pt.amount ?? pt.show_amount);
  const policies = mapPolicies(pt, rateCurrency);
  const freeBefore = pt?.cancellation_penalties?.free_cancellation_before;
  const derived = deriveCancellation(policies);
  const refundable = freeBefore ? Date.parse(freeBefore) > Date.now() : derived.refundable;
  const taxes: any[] = Array.isArray(pt.tax_data?.taxes) ? pt.tax_data.taxes : [];
  const notIncluded = taxes.filter((t) => t.included_by_supplier === false);
  const paymentType: RatePlan["paymentType"] = pt.type === "hotel" ? "pay_at_hotel" : pt.type === "deposit" ? "deposit" : "prepay";
  return {
    id: `rh:${String(rate.match_hash || rate.book_hash).slice(0, 40)}:${index}`,
    supplier: "ratehawk",
    roomGroupId: `rh:${hotelId}:${rgKey(rate.rg_ext) || "default"}`,
    supplierToken: String(rate.book_hash),
    supplierContext: { matchHash: String(rate.match_hash || ""), paymentType: String(pt.type || "") },
    board: normalizeBoard(rate.meal),
    boardName: cleanText(rate.meal_data?.value || rate.meal)?.replace(/_/g, " "),
    refundable,
    freeCancellationUntil: freeBefore || derived.freeCancellationUntil,
    cancellationPolicies: policies,
    paymentType,
    price: {
      net: round2(net),
      selling: round2(total),
      currency: rateCurrency,
      taxesIncluded: notIncluded.length === 0,
      taxes: taxes.length ? round2(taxes.reduce((s, t) => s + toNumber(t.amount), 0)) : undefined,
      perNight: round2(total / Math.max(1, nights)),
      total: round2(total),
    },
    rateType: "BOOKABLE",
    remainingRooms: rate.allotment != null ? toNumber(rate.allotment) : undefined,
    rateComments: Array.isArray(rate.amenities_data) && rate.amenities_data.length ? rate.amenities_data.join(", ") : undefined,
  };
}

/** Groups rates into RoomGroups using rg_ext + hotel/info room_groups. */
export function mapRateHawkRooms(hotelId: string, rates: any[], currency: string, nights: number, content?: HotelContent | null): RoomGroup[] {
  const groups = new Map<string, RoomGroup>();
  rates.forEach((rate, idx) => {
    const plan = mapRate(rate, hotelId, currency, nights, idx);
    if (!plan) return;
    let group = groups.get(plan.roomGroupId);
    if (!group) {
      const key = rgKey(rate.rg_ext);
      const contentRoom = content?.rooms.find((r) => r.code === key) || null;
      const name = cleanText(rate.room_name) || contentRoom?.name || cleanText(rate.room_data_trans?.main_name) || "Room";
      const bedding = cleanText(rate.room_data_trans?.bedding_type) || contentRoom?.beds;
      group = {
        id: plan.roomGroupId,
        supplier: "ratehawk",
        supplierRoomCode: key || undefined,
        name,
        description: contentRoom?.description || cleanText(rate.room_data_trans?.misc_room),
        images: contentRoom?.images || [],
        beds: bedding,
        maxOccupancy: rate.rg_ext?.capacity ? toNumber(rate.rg_ext.capacity) : contentRoom?.maxPax,
        amenities: contentRoom?.facilities || (Array.isArray(rate.amenities_data) ? rate.amenities_data.map(String) : []),
        ratePlans: [],
      };
      groups.set(plan.roomGroupId, group);
    }
    group.ratePlans.push(plan);
  });
  return Array.from(groups.values())
    .map((g) => ({ ...g, ratePlans: g.ratePlans.sort((a, b) => a.price.total - b.price.total) }))
    .sort((a, b) => (a.ratePlans[0]?.price.total || 0) - (b.ratePlans[0]?.price.total || 0));
}

/** hotel/info → HotelContent */
export function mapRateHawkContent(h: any, language = "en"): HotelContent {
  const images: HotelContentImage[] = httpsOnly((Array.isArray(h.images) ? h.images : []).map((u: string) => ratehawkImage(u))).map((url, i) => ({
    url,
    order: i,
    category: i === 0 ? "exterior" : "other",
  }));
  const roomGroups: any[] = Array.isArray(h.room_groups) ? h.room_groups : [];
  const rooms = roomGroups.map((rg) => {
    const imgs = httpsOnly((Array.isArray(rg.images) ? rg.images : []).map((u: string) => ratehawkImage(u)));
    return {
      code: rgKey(rg.rg_ext) || String(rg.room_group_id),
      name: cleanText(rg.name) || cleanText(rg.name_struct?.main_name) || "Room",
      description: undefined,
      images: imgs,
      beds: cleanText(rg.name_struct?.bedding_type),
      maxPax: rg.rg_ext?.capacity ? toNumber(rg.rg_ext.capacity) : undefined,
      facilities: Array.isArray(rg.room_amenities) ? rg.room_amenities.map((a: string) => String(a).replace(/-/g, " ")) : [],
    };
  });
  for (const r of rooms) for (const url of r.images) if (!images.some((i) => i.url === url)) images.push({ url, roomCode: r.code, category: "room" });
  const facilities = (Array.isArray(h.amenity_groups) ? h.amenity_groups : []).flatMap((g: any) =>
    (Array.isArray(g.amenities) ? g.amenities : []).map((a: string) => ({ group: String(g.group_name || "Facilities"), name: String(a) }))
  );
  const description = (Array.isArray(h.description_struct) ? h.description_struct : [])
    .map((d: any) => [d.title ? `${d.title}\n` : "", ...(Array.isArray(d.paragraphs) ? d.paragraphs : [])].join(" ").trim())
    .filter(Boolean)
    .join("\n\n");
  const policies = (Array.isArray(h.policy_struct) ? h.policy_struct : [])
    .map((p: any) => [p.title, ...(Array.isArray(p.paragraphs) ? p.paragraphs : [])].filter(Boolean).join(": "))
    .filter(Boolean);
  return {
    supplier: "ratehawk",
    supplierHotelId: String(h.id),
    name: cleanText(h.name) || String(h.id),
    description: description || undefined,
    address: cleanText(h.address),
    city: cleanText(h.region?.name),
    countryCode: cleanText(h.region?.country_code)?.toUpperCase(),
    postalCode: cleanText(h.postal_code),
    lat: h.latitude != null ? toNumber(h.latitude) : undefined,
    lng: h.longitude != null ? toNumber(h.longitude) : undefined,
    stars: h.star_rating != null ? toNumber(h.star_rating) || undefined : undefined,
    chain: cleanText(h.hotel_chain),
    phone: cleanText(h.phone),
    email: cleanText(h.email),
    checkInTime: cleanText(h.check_in_time),
    checkOutTime: cleanText(h.check_out_time),
    images,
    facilities,
    rooms,
    pois: [],
    policies: policies.length ? policies : undefined,
    reviewScore: undefined,
    language,
    fetchedAt: new Date().toISOString(),
  };
}

export class RateHawkHotelAdapter {
  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    await getRateHawkContext();
    const res = await ratehawkPostJson("search/multicomplete/", { query: "Istanbul", language: "en" });
    const latencyMs = Date.now() - started;
    const ok = Boolean(res?.status === "ok" || res?.data);
    recordSupplierCall({ supplier: "ratehawk", kind: "test", ok, latencyMs });
    if (!ok) throw new Error(`فشل استعلام RateHawk multicomplete: ${JSON.stringify(res).slice(0, 200)}`);
    return { ok: true, message: `تم التحقق من اتصال RateHawk بنجاح عبر multicomplete (${latencyMs}ms)`, latencyMs };
  }

  async getContent(hotelId: string, language = "en"): Promise<HotelContent | null> {
    const id = String(hotelId).replace(/^rh_/, "");
    const cached = await getCachedContent("ratehawk", id);
    if (cached) return cached;
    const started = Date.now();
    try {
      const res = await ratehawkPostJson<any>("hotel/info/", { id, language });
      if (!res?.data) throw new Error(res?.error || "empty hotel/info");
      const content = mapRateHawkContent(res.data, language);
      void putCachedContent(content);
      recordSupplierCall({ supplier: "ratehawk", kind: "content", ok: true, latencyMs: Date.now() - started, meta: { op: "hotel-info", id } });
      return content;
    } catch (err) {
      recordSupplierCall({ supplier: "ratehawk", kind: "content", ok: false, latencyMs: Date.now() - started, error: String(err), meta: { op: "hotel-info", id } });
      return null;
    }
  }

  /**
   * Ensures content for many hotels, limited by `budget` network calls (hotel/info is 1 hotel per call).
   * The content worker (A1) fills the rest in the background from the static dump.
   */
  async ensureContent(ids: string[], budget = 40, language = "en", signal?: AbortSignal): Promise<Map<string, HotelContent>> {
    const cached = await getCachedContentMany("ratehawk", ids);
    const missing = ids.filter((id) => !cached.has(id)).slice(0, Math.max(0, budget));
    const concurrency = 6;
    for (let i = 0; i < missing.length; i += concurrency) {
      if (signal?.aborted) break;
      const batch = missing.slice(i, i + concurrency);
      const results = await Promise.all(batch.map((id) => this.getContent(id, language)));
      results.forEach((c) => c && cached.set(c.supplierHotelId, c));
    }
    return cached;
  }

  async searchHotels(params: RateHawkSearchParams): Promise<HotelSearchCard[]> {
    const nights = nightsBetween(params.checkIn, params.checkOut);
    const adults = Math.max(1, Number(params.adults || 2));
    const children = Array.isArray(params.children) ? params.children : [];
    const rooms = Math.max(1, Number(params.rooms || 1));
    const language = params.language || "en";
    const currency = params.currency || "USD";
    const residency = (params.residency || "sa").toLowerCase();

    const common = {
      checkin: params.checkIn,
      checkout: params.checkOut,
      residency,
      language,
      currency,
      guests: guestsBody(adults, children, rooms),
    };

    let serp: any;
    if (Array.isArray(params.hotelIds) && params.hotelIds.length) {
      serp = await ratehawkPostJson("search/serp/hotels/", {
        ...common,
        ids: params.hotelIds.map((h) => String(h).replace(/^rh_/, "")),
      });
    } else {
      if (!params.regionId) throw new Error("RateHawk search requires regionId");
      serp = await ratehawkPostJson("search/serp/region/", { ...common, region_id: params.regionId });
    }
    if (serp?.status === "error") throw new Error(serp?.error || "RateHawk serp error");

    const hotels: any[] = Array.isArray(serp?.data?.hotels) ? serp.data.hotels : [];
    if (!hotels.length) return [];

    const contentMap = await this.ensureContent(
      hotels.map((h) => String(h.id)),
      params.contentBudget ?? 40,
      language,
      params.signal
    );

    const cards: HotelSearchCard[] = [];
    for (const h of hotels) {
      const id = String(h.id || "");
      if (!id) continue;
      const content = contentMap.get(id) || null;
      const roomGroups = mapRateHawkRooms(id, Array.isArray(h.rates) ? h.rates : [], currency, nights, content);
      const ratePlans = roomGroups.flatMap((g) => g.ratePlans);
      if (!ratePlans.length) continue;
      const cheapest = ratePlans.reduce((a, b) => (a.price.total <= b.price.total ? a : b));
      const images = content ? content.images.map((i) => i.url) : [];
      cards.push({
        id: publicHotelId("ratehawk", id),
        provider: "ratehawk",
        supplierHotelId: id,
        name: content?.name || cleanText(h.name) || id,
        city: content?.city || params.query || "",
        countryCode: content?.countryCode,
        address: content?.address,
        lat: content?.lat,
        lng: content?.lng,
        stars: content?.stars ?? (h.star_rating != null ? toNumber(h.star_rating) || undefined : undefined),
        description: content?.description,
        amenities: content?.facilities.map((f) => f.name).slice(0, 40),
        image: images[0],
        images,
        heroImage: images[0],
        price: cheapest.price.total,
        currency: cheapest.price.currency,
        nights,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        roomGroups,
        ratePlans,
        rooms: roomGroups.map((g) => ({
          id: g.id,
          name: g.name,
          price: g.ratePlans[0]?.price.total,
          currency: g.ratePlans[0]?.price.currency,
          refundable: g.ratePlans[0]?.refundable,
          boardType: g.ratePlans[0]?.boardName,
        })),
        searchContext: { hid: String(h.hid || "") },
        raw: { hid: h.hid },
      });
    }
    return cards;
  }

  /** Hotel page — all rates for one hotel + static content. */
  async getHotelDetails(input: {
    hotelId: string;
    checkIn: string;
    checkOut: string;
    adults?: number;
    children?: number[];
    rooms?: number;
    residency?: string;
    currency?: string;
    language?: string;
  }): Promise<{ card: HotelSearchCard | null; content: HotelContent | null }> {
    const id = String(input.hotelId).replace(/^rh_/, "");
    const language = input.language || "en";
    const currency = input.currency || "USD";
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const started = Date.now();
    const [hp, content] = await Promise.all([
      ratehawkPostJson<any>("search/hp/", {
        id,
        checkin: input.checkIn,
        checkout: input.checkOut,
        residency: (input.residency || "sa").toLowerCase(),
        language,
        currency,
        guests: guestsBody(Math.max(1, input.adults || 2), input.children || [], Math.max(1, input.rooms || 1)),
      }).catch((err) => ({ status: "error", error: String(err) })),
      this.getContent(id, language),
    ]);
    const hotel = hp?.data?.hotels?.[0] || null;
    recordSupplierCall({ supplier: "ratehawk", kind: "details", ok: Boolean(hotel), latencyMs: Date.now() - started, error: hotel ? undefined : hp?.error || "no rates", meta: { id } });
    if (!hotel && !content) return { card: null, content: null };
    const roomGroups = hotel ? mapRateHawkRooms(id, hotel.rates || [], currency, nights, content) : [];
    const ratePlans = roomGroups.flatMap((g) => g.ratePlans);
    const cheapest = ratePlans.length ? ratePlans.reduce((a, b) => (a.price.total <= b.price.total ? a : b)) : null;
    const images = content ? content.images.map((i) => i.url) : [];
    return {
      content,
      card: {
        id: publicHotelId("ratehawk", id),
        provider: "ratehawk",
        supplierHotelId: id,
        name: content?.name || id,
        city: content?.city || "",
        countryCode: content?.countryCode,
        address: content?.address,
        lat: content?.lat,
        lng: content?.lng,
        stars: content?.stars,
        description: content?.description,
        amenities: content?.facilities.map((f) => f.name),
        image: images[0],
        images,
        heroImage: images[0],
        price: cheapest?.price.total || 0,
        currency: cheapest?.price.currency || currency,
        nights,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        roomGroups,
        ratePlans,
        searchContext: { hid: String(hotel?.hid || "") },
      },
    };
  }

  /** Mandatory prebook: returns fresh book_hash + price change flag. */
  async prebook(bookHash: string, priceIncreasePercent = 0): Promise<{ ok: boolean; priceChanged: boolean; finalizedBookHash: string; rate: any; error?: string }> {
    const started = Date.now();
    const res = await ratehawkPostJson<any>("hotel/prebook/", { hash: bookHash, price_increase_percent: priceIncreasePercent }).catch((err) => ({ status: "error", error: String(err) }));
    const ok = res?.status !== "error" && Boolean(res?.data);
    recordSupplierCall({ supplier: "ratehawk", kind: "quote", ok, latencyMs: Date.now() - started, error: ok ? undefined : String(res?.error || "prebook failed") });
    if (!ok) return { ok: false, priceChanged: false, finalizedBookHash: bookHash, rate: null, error: String(res?.error || "فشل التحقق المسبق من سعر الغرفة (Prebook)") };
    const hotel = res.data?.hotels?.[0];
    const rate = hotel?.rates?.[0] || res.data?.rate || null;
    return {
      ok: true,
      priceChanged: Boolean(res.data?.changes?.price_changed),
      finalizedBookHash: String(rate?.book_hash || bookHash),
      rate,
    };
  }

  async createBookingForm(partnerOrderId: string, bookHash: string, userIp = "127.0.0.1"): Promise<any> {
    return ratehawkPostJson("hotel/order/booking/form/", { partner_order_id: partnerOrderId, book_hash: bookHash, language: "en", user_ip: userIp });
  }

  async startBookingFinish(input: {
    partnerOrderId: string;
    paymentType: { type: string; amount: string; currency_code: string };
    rooms: Array<{ guests: Array<{ first_name: string; last_name: string; is_child?: boolean; age?: number }> }>;
    user: { email: string; phone: string; comment?: string };
  }): Promise<any> {
    return ratehawkPostJson("hotel/order/booking/finish/", {
      partner: { partner_order_id: input.partnerOrderId, comment: input.user.comment || "" },
      language: "en",
      rooms: input.rooms.map((r) => ({
        guests: r.guests.map((g) => ({
          first_name: toLatinGuestName(g.first_name),
          last_name: toLatinGuestName(g.last_name),
          ...(g.is_child ? { is_child: true, age: g.age } : {}),
        })),
      })),
      payment_type: input.paymentType,
      user: { email: input.user.email, phone: input.user.phone, comment: input.user.comment || "Booked via Lonaliza" },
    });
  }

  async pollBookingStatus(partnerOrderId: string, maxAttempts = 30, intervalMs = 2500): Promise<{ ok: boolean; status: string; orderId?: number; error?: string }> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await ratehawkPostJson<any>("hotel/order/booking/finish/status/", { partner_order_id: partnerOrderId });
        const status = String(res?.data?.status || res?.status || "").toLowerCase();
        if (status === "ok") return { ok: true, status: "ok", orderId: res?.data?.order_id };
        if (status === "failed" || res?.error === "booking_failed") return { ok: false, status: "failed", error: res?.data?.error || res?.error || "فشل تأكيد الحجز لدى المورد" };
      } catch {
        /* transient */
      }
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, intervalMs));
    }
    return { ok: false, status: "timeout", error: "تجاوزت مهلة انتظار تأكيد حجز الفندق" };
  }

  async getOrderInfo(partnerOrderId: string): Promise<any> {
    return ratehawkPostJson("hotel/order/info/", { ordering: { ordering_type: "desc", ordering_by: "created_at" }, pagination: { page_size: "1", page_number: "1" }, search: { partner_order_ids: [partnerOrderId] } });
  }

  /** Prebook → form → finish → status → info. Caller must have collected payment first. */
  async createReservation(input: RateHawkBookingInput): Promise<{
    ok: boolean;
    orderId?: string;
    etgOrderId?: number;
    hotelConfirmationCode?: string;
    voucherUrl?: string;
    status: string;
    error?: string;
    raw?: any;
  }> {
    const partnerOrderId = input.partnerOrderId || `LONA-RH-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const started = Date.now();
    let lockedHash = input.bookHash;
    if (!input.skipPrebook) {
      const pre = await this.prebook(input.bookHash, 0);
      if (!pre.ok) return { ok: false, status: "FAILED", error: pre.error };
      lockedHash = pre.finalizedBookHash;
    }

    const formRes = await this.createBookingForm(partnerOrderId, lockedHash, input.userIp).catch((err) => ({ status: "error", error: String(err) }));
    if (formRes?.status === "error") {
      recordSupplierCall({ supplier: "ratehawk", kind: "book", ok: false, latencyMs: Date.now() - started, error: String(formRes?.error), meta: { step: "form", partnerOrderId } });
      return { ok: false, status: "FAILED", error: formRes?.error || "فشل فتح جلسة الحجز لدى المورد" };
    }
    const paymentTypes: any[] = formRes?.data?.payment_types || [];
    const chosen = paymentTypes.find((p) => p.type === "deposit") || paymentTypes[0];
    if (!chosen) {
      recordSupplierCall({ supplier: "ratehawk", kind: "book", ok: false, latencyMs: Date.now() - started, error: "no payment types", meta: { step: "form", partnerOrderId } });
      return { ok: false, status: "FAILED", error: "المورد لم يعد أي طريقة دفع لهذا السعر" };
    }

    const guests = input.guests.length ? input.guests : [{ firstName: "Guest", lastName: "Guest" }];
    const finishRes = await this.startBookingFinish({
      partnerOrderId,
      paymentType: { type: String(chosen.type), amount: String(chosen.amount), currency_code: String(chosen.currency_code) },
      rooms: [{ guests: guests.map((g) => ({ first_name: g.firstName, last_name: g.lastName, is_child: g.isChild, age: g.age })) }],
      user: { email: input.contactEmail, phone: input.contactPhone, comment: input.specialRequests },
    }).catch((err) => ({ status: "error", error: String(err) }));
    if (finishRes?.status === "error") {
      recordSupplierCall({ supplier: "ratehawk", kind: "book", ok: false, latencyMs: Date.now() - started, error: String(finishRes?.error), meta: { step: "finish", partnerOrderId } });
      return { ok: false, status: "FAILED", error: finishRes?.error || "فشل إرسال بيانات النزلاء للمورد", orderId: partnerOrderId };
    }

    const poll = await this.pollBookingStatus(partnerOrderId, 30, 2500);
    if (!poll.ok) {
      recordSupplierCall({ supplier: "ratehawk", kind: "book", ok: false, latencyMs: Date.now() - started, error: poll.error, meta: { step: "status", partnerOrderId } });
      return { ok: false, status: poll.status.toUpperCase(), error: poll.error, orderId: partnerOrderId };
    }

    let hotelConfirmationCode = "";
    let voucherUrl = "";
    let orderInfo: any = null;
    try {
      orderInfo = await this.getOrderInfo(partnerOrderId);
      const order = orderInfo?.data?.orders?.[0];
      hotelConfirmationCode = order?.supplier_data?.confirmation_id || "";
      voucherUrl = order?.voucher_url || "";
    } catch {
      /* non-critical */
    }
    recordSupplierCall({ supplier: "ratehawk", kind: "book", ok: true, latencyMs: Date.now() - started, meta: { partnerOrderId } });
    return { ok: true, orderId: partnerOrderId, etgOrderId: poll.orderId, hotelConfirmationCode, voucherUrl, status: "CONFIRMED", raw: orderInfo?.data || finishRes?.data };
  }

  async cancelReservation(partnerOrderId: string): Promise<{ ok: boolean; penaltyAmount?: string; penaltyCurrency?: string; error?: string }> {
    const started = Date.now();
    const res = await ratehawkPostJson<any>("hotel/order/cancel/", { partner_order_id: partnerOrderId }).catch((err) => ({ status: "error", error: String(err) }));
    const ok = res?.status === "ok";
    recordSupplierCall({ supplier: "ratehawk", kind: "cancel", ok, latencyMs: Date.now() - started, error: ok ? undefined : String(res?.error), meta: { partnerOrderId } });
    if (ok) return { ok: true, penaltyAmount: res?.data?.amount_payable?.amount, penaltyCurrency: res?.data?.amount_payable?.currency_code };
    return { ok: false, error: res?.error || "فشل إلغاء حجز الفندق لدى المورد" };
  }
}
