import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { createAdminNotification } from "@/lib/admin-notifications/server";
import { detectInvoiceService, type InvoiceService } from "@/lib/booking-service";
import { guessAirlineCode, parseRouteLine } from "@/lib/account/booking-display";
import {
  bookingChargedAmount,
  bookingChargedCurrency,
  ensureHotelBookingPaymentFields,
  refundIyzicoBooking,
} from "@/lib/server/iyzico-bookings";

export type CancelStatus =
  | "none"
  | "pending_admin"
  | "approved"
  | "rejected"
  | "refunded"
  | "refund_failed";

/** Internal Lonaliza-service request (e.g. flexible date change) executed by staff at the supplier. */
export type ChangeStatus = "none" | "pending_admin" | "done" | "rejected";

export type LonalizaServiceSnapshot = {
  id: string;
  kind: string;
  title: string;
  amount: number;
  currency?: string;
  terms?: string;
  priceType?: string;
  priceValue?: number;
};

export type GuestHotelBooking = {
  id: string;
  hotel_name: string;
  room_name: string;
  check_in: string;
  check_out: string;
  price: number;
  currency: string;
  payment_method: "card" | "whatsapp" | "other";
  status: string;
  payment_status: string;
  cancel_status: CancelStatus;
  cancel_reason: string;
  cancel_admin_note: string;
  refund_amount: number;
  free_cancellation: boolean;
  non_refundable: boolean;
  can_cancel: boolean;
  cancel_until: string;
  /** Lonaliza services purchased with this booking (never sent to the supplier). */
  lonaliza_services: LonalizaServiceSnapshot[];
  refund_guarantee: boolean;
  flex_change: boolean;
  change_status: ChangeStatus;
  change_request: string;
  change_admin_note: string;
  can_request_change: boolean;
  service: InvoiceService;
  airline: string;
  airline_code: string;
  origin: string;
  destination: string;
  route: string;
  pnr: string;
  fare_class: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  duration?: string;
  stops?: number;
  passenger_name?: string;
  hotel_stars?: number;
  hotel_address?: string;
  nights?: number;
  board_type?: string;
};

function snapshotOf(booking: HotelBookingRecord): Record<string, unknown> {
  return booking.offer_snapshot && typeof booking.offer_snapshot === "object"
    ? { ...booking.offer_snapshot }
    : {};
}

function snapString(booking: HotelBookingRecord, key: string, fallback = ""): string {
  const snap = snapshotOf(booking);
  const field = (booking as Record<string, unknown>)[key];
  if (field != null && String(field).trim()) return String(field);
  return snap[key] != null ? String(snap[key]) : fallback;
}

function snapBool(booking: HotelBookingRecord, key: string): boolean {
  const field = (booking as Record<string, unknown>)[key];
  if (typeof field === "boolean") return field;
  const snap = snapshotOf(booking);
  return snap[key] === true || snap[key] === 1 || snap[key] === "true";
}

function snapNumber(booking: HotelBookingRecord, key: string): number {
  const field = Number((booking as Record<string, unknown>)[key]);
  if (Number.isFinite(field) && field !== 0) return field;
  const n = Number(snapshotOf(booking)[key]);
  return Number.isFinite(n) ? n : 0;
}

export function cancelStatusOf(booking: HotelBookingRecord): CancelStatus {
  const raw = snapString(booking, "cancel_status", "none").toLowerCase();
  switch (raw) {
    case "pending_admin":
    case "approved":
    case "rejected":
    case "refunded":
    case "refund_failed":
      return raw;
    default:
      return "none";
  }
}

export function lonalizaServicesOf(booking: HotelBookingRecord): LonalizaServiceSnapshot[] {
  const snap = snapshotOf(booking);
  const rows = Array.isArray(snap.lonalizaServices) ? snap.lonalizaServices : [];
  const fare = Number(booking.price) || 0;
  return rows
    .map((row) => (row && typeof row === "object" ? (row as Record<string, unknown>) : null))
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map((row) => {
      const priceType = String(row.priceType || "fixed");
      const priceValue = Number(row.priceValue) || 0;
      const stored = Number(row.amount);
      const amount =
        Number.isFinite(stored) && stored > 0
          ? stored
          : priceType === "percent"
            ? Math.round(fare * (Math.max(0, priceValue) / 100) * 100) / 100
            : Math.max(0, priceValue);
      return {
        id: String(row.id || ""),
        kind: String(row.kind || "other"),
        title: String(row.title || ""),
        amount,
        currency: row.currency ? String(row.currency) : undefined,
        terms: row.terms ? String(row.terms) : undefined,
        priceType,
        priceValue,
      };
    });
}

export function hasLonalizaService(booking: HotelBookingRecord, kind: string): boolean {
  if (kind === "refund_guarantee" && snapBool(booking, "lonaliza_refund_guarantee")) return true;
  if (kind === "flex_change" && snapBool(booking, "lonaliza_flex_change")) return true;
  return lonalizaServicesOf(booking).some((row) => row.kind === kind);
}

export function changeStatusOf(booking: HotelBookingRecord): ChangeStatus {
  const raw = snapString(booking, "change_status", "none").toLowerCase();
  return raw === "pending_admin" || raw === "done" || raw === "rejected" ? raw : "none";
}

/** A change request is possible only when the customer bought the Lonaliza flexible-date service. */
export function canRequestChange(booking: HotelBookingRecord): boolean {
  if (booking.status === "cancelled") return false;
  if (!hasLonalizaService(booking, "flex_change")) return false;
  if (changeStatusOf(booking) === "pending_admin" || changeStatusOf(booking) === "done") return false;
  if (cancelStatusOf(booking) === "pending_admin" || cancelStatusOf(booking) === "approved" || cancelStatusOf(booking) === "refunded") return false;
  return beforeTravelDay(booking);
}

export function paymentMethodOf(booking: HotelBookingRecord): "card" | "whatsapp" | "other" {
  const method = snapString(booking, "payment_method").toLowerCase();
  if (method === "iyzico" || method === "card" || booking.iyzico_payment_id || booking.iyzico_token) {
    return "card";
  }
  if (method === "whatsapp") return "whatsapp";
  return "other";
}

function utcDay(value: string): number {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || "").trim());
  if (!iso) return Number.NaN;
  return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
}

export function cancelUntilOf(booking: HotelBookingRecord): string {
  return snapString(booking, "cancel_until") || booking.check_in || "";
}

export function bookingServiceOf(booking: HotelBookingRecord): InvoiceService {
  return detectInvoiceService({
    provider: booking.provider,
    hotel_id: booking.hotel_id,
    offer_snapshot: booking.offer_snapshot,
    type: snapString(booking, "booking_type") || snapString(booking, "service_type"),
  });
}

function firstLeg(booking: HotelBookingRecord): Record<string, unknown> {
  const snap = snapshotOf(booking);
  const legs = Array.isArray(snap.legs) ? snap.legs : [];
  const row = legs[0];
  return row && typeof row === "object" ? (row as Record<string, unknown>) : {};
}

function lastLeg(booking: HotelBookingRecord): Record<string, unknown> {
  const snap = snapshotOf(booking);
  const legs = Array.isArray(snap.legs) ? snap.legs : [];
  const row = legs[legs.length - 1];
  return row && typeof row === "object" ? (row as Record<string, unknown>) : {};
}

export function flightDisplayOf(booking: HotelBookingRecord): {
  airline: string;
  airline_code: string;
  origin: string;
  destination: string;
  route: string;
  pnr: string;
  fare_class: string;
} {
  const snap = snapshotOf(booking);
  const first = firstLeg(booking);
  const last = lastLeg(booking);
  const parsed = parseRouteLine(
    snapString(booking, "route") || booking.hotel_name || ""
  );
  const origin = String(first.origin || parsed.origin || "").trim();
  const destination = String(last.destination || parsed.destination || "").trim();
  const airline =
    String(first.airline || snap.airline || "")
      .trim() || String(booking.room_name || "").split(/[·•\-–]/)[0].trim();
  const flightNumbers = snapString(booking, "flightNumbers");
  const airline_code =
    String(first.airlineCode || snap.airlineCode || "")
      .trim()
      .toUpperCase() || guessAirlineCode(airline, flightNumbers);
  return {
    airline,
    airline_code,
    origin,
    destination,
    route: parsed.route || [origin, destination].filter(Boolean).join(" → "),
    pnr:
      snapString(booking, "pnr") ||
      snapString(booking, "PNR") ||
      snapString(booking, "booking_ref") ||
      booking.ref_code ||
      "",
    fare_class: snapString(booking, "fareClass") || booking.room_name || "",
  };
}

export function isFreeCancelEligible(booking: HotelBookingRecord): boolean {
  const status = cancelStatusOf(booking);
  if (status === "pending_admin" || status === "approved" || status === "refunded") return false;
  if (booking.status === "cancelled") return false;
  if (snapBool(booking, "non_refundable")) return false;
  if (!snapBool(booking, "free_cancellation")) return false;
  const until = utcDay(cancelUntilOf(booking));
  if (!Number.isFinite(until)) return false;
  const today = new Date();
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return now < until;
}

function beforeTravelDay(booking: HotelBookingRecord): boolean {
  const until = utcDay(cancelUntilOf(booking) || booking.check_in || "");
  if (!Number.isFinite(until)) return true;
  const today = new Date();
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return now < until;
}

/** Hotels keep free-cancel policy; flights/tours/packages can request if not locked. */
export function canRequestCancel(booking: HotelBookingRecord): boolean {
  const status = cancelStatusOf(booking);
  if (status === "pending_admin" || status === "approved" || status === "refunded") return false;
  if (booking.status === "cancelled") return false;
  // Lonaliza refund guarantee: the customer can always request a cancellation before travel.
  if (hasLonalizaService(booking, "refund_guarantee")) return beforeTravelDay(booking);
  if (snapBool(booking, "non_refundable")) return false;

  const service = bookingServiceOf(booking);
  switch (service) {
    case "hotel":
      return isFreeCancelEligible(booking);
    case "flight":
    case "tour":
    case "package":
      return beforeTravelDay(booking);
    case "transfer":
    case "car":
    case "visa":
      return false;
    default: {
      const _never: never = service;
      return _never;
    }
  }
}

function cardPaid(booking: HotelBookingRecord): boolean {
  return (
    paymentMethodOf(booking) === "card" &&
    (booking.status === "paid" || String(booking.payment_status || "").toLowerCase() === "paid") &&
    bookingChargedAmount(booking) > 0
  );
}

export function toGuestHotelBooking(booking: HotelBookingRecord): GuestHotelBooking {
  const cancel_status = cancelStatusOf(booking);
  const flight = flightDisplayOf(booking);
  return {
    id: booking.id,
    hotel_name: booking.hotel_name,
    room_name: booking.room_name || "",
    check_in: booking.check_in,
    check_out: booking.check_out,
    price: booking.price,
    currency: booking.currency || "USD",
    payment_method: paymentMethodOf(booking),
    status: booking.status,
    payment_status: booking.payment_status || booking.status,
    cancel_status,
    cancel_reason: snapString(booking, "cancel_reason"),
    cancel_admin_note: snapString(booking, "cancel_admin_note"),
    refund_amount: snapNumber(booking, "refund_amount"),
    free_cancellation: snapBool(booking, "free_cancellation"),
    non_refundable: snapBool(booking, "non_refundable"),
    can_cancel: canRequestCancel(booking),
    cancel_until: cancelUntilOf(booking),
    service: bookingServiceOf(booking),
    airline: flight.airline,
    airline_code: flight.airline_code,
    origin: flight.origin,
    destination: flight.destination,
    route: flight.route,
    pnr: flight.pnr,
    fare_class: flight.fare_class,
    flight_number: snapString(booking, "flightNumbers") || snapString(booking, "flight_number") || "",
    departure_time: booking.check_in,
    arrival_time: booking.check_out,
    duration: snapString(booking, "duration") || undefined,
    stops: snapNumber(booking, "stops") || 0,
    passenger_name: snapString(booking, "guest_name") || snapString(booking, "passenger_name") || undefined,
    hotel_stars: Math.min(5, snapNumber(booking, "hotel_stars")) || undefined,
    hotel_address: snapString(booking, "hotel_address") || undefined,
    nights: snapNumber(booking, "nights") || undefined,
    board_type: snapString(booking, "board_type") || undefined,
    lonaliza_services: lonalizaServicesOf(booking),
    refund_guarantee: hasLonalizaService(booking, "refund_guarantee"),
    flex_change: hasLonalizaService(booking, "flex_change"),
    change_status: changeStatusOf(booking),
    change_request: snapString(booking, "change_request"),
    change_admin_note: snapString(booking, "change_admin_note"),
    can_request_change: canRequestChange(booking),
  };
}

export type AdminCancelRow = GuestHotelBooking & {
  customer_name: string;
  customer_email: string;
  charged_amount: number;
  charged_currency: string;
  cancel_requested_at: string;
  cancel_fee_amount: number;
  /** cancel = refund request; change = Lonaliza flexible-date request executed by staff at the supplier. */
  request_type: "cancel" | "change";
  change_requested_at: string;
  supplier_reference: string;
  supplier_cancel_note: string;
};

export function toAdminCancelRow(booking: HotelBookingRecord): AdminCancelRow {
  const snap = snapshotOf(booking);
  const cancel = cancelStatusOf(booking);
  const change = changeStatusOf(booking);
  return {
    ...toGuestHotelBooking(booking),
    customer_name: booking.customer_name,
    customer_email: booking.customer_email || "",
    charged_amount: bookingChargedAmount(booking),
    charged_currency: bookingChargedCurrency(booking),
    cancel_requested_at: snapString(booking, "cancel_requested_at"),
    cancel_fee_amount: snapNumber(booking, "cancel_fee_amount"),
    request_type: cancel === "none" && change !== "none" ? "change" : "cancel",
    change_requested_at: snapString(booking, "change_requested_at"),
    supplier_reference: String(snap.supplier_reference || snap.supplier_order_id || snap.pnr || snap.flight_booking_id || ""),
    supplier_cancel_note: snapString(booking, "supplier_cancel_note"),
  };
}

async function patchCancel(
  booking: HotelBookingRecord,
  data: Record<string, unknown>
): Promise<HotelBookingRecord> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) throw new Error("PocketBase unavailable");
  await ensureHotelBookingPaymentFields(pb);
  const snap = { ...snapshotOf(booking), ...data };
  try {
    return await pb.collection("hotel_bookings").update<HotelBookingRecord>(booking.id, {
      ...data,
      offer_snapshot: snap,
    });
  } catch {
    return await pb.collection("hotel_bookings").update<HotelBookingRecord>(booking.id, {
      offer_snapshot: snap,
      ...(data.status ? { status: data.status } : {}),
    });
  }
}

export async function requestGuestCancel(input: {
  userId: string;
  bookingId: string;
  reason?: string;
}): Promise<{ ok: boolean; booking?: GuestHotelBooking; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, error: "PocketBase unavailable" };
  await ensureHotelBookingPaymentFields(pb);
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(input.bookingId);
  if (booking.user && booking.user !== input.userId) return { ok: false, error: "forbidden" };
  if (!canRequestCancel(booking)) return { ok: false, error: "not_cancellable" };
  const next = await patchCancel(booking, {
    cancel_status: "pending_admin",
    cancel_requested_at: new Date().toISOString(),
    cancel_reason: String(input.reason || "").slice(0, 500),
  });
  const service = bookingServiceOf(booking);
  await createAdminNotification({
    type: "booking",
    body_ar: `طلب إلغاء (${service}): ${booking.customer_name} · ${booking.hotel_name}`,
    href: "/admin/cancellations",
    meta: { bookingId: booking.id, source: "cancel_request", service },
  });
  return { ok: true, booking: toGuestHotelBooking(next) };
}

/** Customer asks Lonaliza to execute the flexible-date service (internal flow, staff executes at the supplier). */
export async function requestGuestChange(input: {
  userId: string;
  bookingId: string;
  newDate?: string;
  note?: string;
}): Promise<{ ok: boolean; booking?: GuestHotelBooking; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, error: "PocketBase unavailable" };
  await ensureHotelBookingPaymentFields(pb);
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(input.bookingId);
  if (booking.user && booking.user !== input.userId) return { ok: false, error: "forbidden" };
  if (!canRequestChange(booking)) return { ok: false, error: "not_changeable" };
  const newDate = String(input.newDate || "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return { ok: false, error: "date_required" };
  const request = `${newDate}${input.note ? ` · ${String(input.note).slice(0, 300)}` : ""}`;
  const next = await patchCancel(booking, {
    change_status: "pending_admin",
    change_requested_at: new Date().toISOString(),
    change_request: request,
    change_new_date: newDate,
  });
  const service = bookingServiceOf(booking);
  await createAdminNotification({
    type: "booking",
    body_ar: `طلب تغيير تاريخ (خدمة لوناليزا · ${service}): ${booking.customer_name} · ${booking.hotel_name} → ${newDate}`,
    href: "/admin/cancellations",
    meta: { bookingId: booking.id, source: "change_request", service },
  });
  return { ok: true, booking: toGuestHotelBooking(next) };
}

/** Admin marks a Lonaliza change request as executed (after doing it at the supplier) or rejects it. */
export async function resolveChangeRequest(input: {
  bookingId: string;
  action: "done" | "reject";
  note?: string;
  newCheckIn?: string;
  newCheckOut?: string;
}): Promise<{ ok: boolean; booking?: AdminCancelRow; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, error: "PocketBase unavailable" };
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(input.bookingId);
  if (changeStatusOf(booking) !== "pending_admin") return { ok: false, error: "not_pending" };
  const data: Record<string, unknown> = {
    change_status: input.action === "done" ? "done" : "rejected",
    change_admin_note: String(input.note || "").slice(0, 500),
    change_resolved_at: new Date().toISOString(),
  };
  if (input.action === "done") {
    if (input.newCheckIn && /^\d{4}-\d{2}-\d{2}$/.test(input.newCheckIn)) data.check_in = input.newCheckIn;
    if (input.newCheckOut && /^\d{4}-\d{2}-\d{2}$/.test(input.newCheckOut)) data.check_out = input.newCheckOut;
  }
  const next = await patchCancel(booking, data);
  return { ok: true, booking: toAdminCancelRow(next) };
}

export async function listPendingCancellations(): Promise<AdminCancelRow[]> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return [];
  await ensureHotelBookingPaymentFields(pb);
  const page = await pb.collection("hotel_bookings").getList<HotelBookingRecord>(1, 200, {
    sort: "-updated",
  });
  return page.items
    .filter((row) => cancelStatusOf(row) !== "none" || changeStatusOf(row) !== "none")
    .map(toAdminCancelRow);
}

function refundDisplay(paid: number, fee: number): number {
  const safePaid = Math.max(0, paid);
  const safeFee = Math.min(Math.max(0, fee), safePaid);
  return Math.round((safePaid - safeFee) * 100) / 100;
}

export async function rejectCancel(input: {
  bookingId: string;
  note?: string;
}): Promise<{ ok: boolean; booking?: AdminCancelRow; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, error: "PocketBase unavailable" };
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(input.bookingId);
  const status = cancelStatusOf(booking);
  if (status !== "pending_admin" && status !== "refund_failed") {
    return { ok: false, error: "not_pending" };
  }
  const next = await patchCancel(booking, {
    cancel_status: "rejected",
    cancel_admin_note: String(input.note || "").slice(0, 500),
  });
  return { ok: true, booking: toAdminCancelRow(next) };
}

export async function approveCancel(input: {
  bookingId: string;
  feeAmount?: number;
  note?: string;
  ip?: string;
}): Promise<{ ok: boolean; booking?: AdminCancelRow; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, error: "PocketBase unavailable" };
  await ensureHotelBookingPaymentFields(pb);
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(input.bookingId);
  const status = cancelStatusOf(booking);
  if (status !== "pending_admin" && status !== "refund_failed") {
    return { ok: false, error: "not_pending" };
  }

  const paidDisplay = booking.price > 0 ? booking.price : bookingChargedAmount(booking);
  const fee = Number(input.feeAmount || 0);
  const refundDisp = refundDisplay(paidDisplay, fee);
  const charged = bookingChargedAmount(booking);
  const refundCharged =
    charged > 0 && paidDisplay > 0
      ? Math.round((charged * (refundDisp / paidDisplay)) * 100) / 100
      : refundDisp;

  // 1. Cancel at the supplier FIRST (all four hotel suppliers, unified). If the supplier refuses we
  //    must not refund: the room is still held and the admin has to resolve it manually.
  const snap = snapshotOf(booking);
  const service = bookingServiceOf(booking);
  const refundGuarantee = hasLonalizaService(booking, "refund_guarantee");
  const supplierRef = String(snap.supplier_reference || snap.supplier_order_id || "");
  if (service === "hotel" && supplierRef && snap.fulfilment_status !== "cancelled") {
    const { cancelHotelBookingAtSupplier } = await import("@/lib/server/hotels/fulfilment");
    const cancelled = await cancelHotelBookingAtSupplier(booking.id);
    if (!cancelled.ok) {
      await patchCancel(booking, { cancel_admin_note: `supplier cancel failed: ${cancelled.error}`.slice(0, 500) });
      return { ok: false, error: `supplier_cancel_failed: ${cancelled.error}` };
    }
    if (cancelled.penalty != null && cancelled.penalty > 0) {
      await patchCancel(booking, { cancel_admin_note: `${String(input.note || "")} · supplier penalty ${cancelled.penalty} ${cancelled.currency || ""}`.trim().slice(0, 500) });
    }
  } else if (service === "flight") {
    // Flights: cancel the supplier PNR through the flight booking session (Travelport/Seeru/PKFARE/Biletbank).
    const flightBookingId = String(snap.flight_booking_id || (snap.multiSupplierDispatch as Record<string, any> | undefined)?.flight?.bookingId || "");
    if (flightBookingId && snap.supplier_cancel_status !== "cancelled") {
      const { cancelFlightBooking } = await import("@/lib/server/flights-bookings");
      const cancelled = await cancelFlightBooking(flightBookingId).catch((err) => ({ ok: false, error: String(err) }));
      if (!cancelled.ok) {
        // With a Lonaliza refund guarantee the customer is refunded anyway (Lonaliza absorbs the difference);
        // without it, the admin must resolve the supplier side first.
        await patchCancel(booking, {
          supplier_cancel_status: "failed",
          supplier_cancel_note: `supplier cancel failed: ${cancelled.error || "unknown"}`.slice(0, 500),
        });
        if (!refundGuarantee) return { ok: false, error: `supplier_cancel_failed: ${cancelled.error || "unknown"}` };
      } else {
        await patchCancel(booking, { supplier_cancel_status: "cancelled", supplier_cancelled_at: new Date().toISOString() });
      }
    }
  }

  if (!cardPaid(booking) || refundCharged <= 0) {
    const fresh = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(booking.id);
    const next = await patchCancel(fresh, {
      status: "cancelled",
      cancel_status: "approved",
      cancel_fee_amount: Math.min(Math.max(0, fee), paidDisplay),
      refund_amount: refundDisp,
      cancel_admin_note: String(input.note || "").slice(0, 500),
      cancel_approved_at: new Date().toISOString(),
    });
    return { ok: true, booking: toAdminCancelRow(next) };
  }

  // 2. Refund the customer (full or minus the admin fee / supplier penalty).
  let iyzicoRefundId = "";
  try {
    const refunded = await refundIyzicoBooking({
      bookingId: booking.id,
      amount: refundCharged,
      ip: input.ip,
    });
    if (refunded.ok && refunded.refund?.refundId) {
      iyzicoRefundId = refunded.refund.refundId;
    }
  } catch {
    // Gateway refund failed/unsupported - proceed with manual cancellation approval
  }

  const latest = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(booking.id);
  const next = await patchCancel(latest, {
    status: "cancelled",
    cancel_status: iyzicoRefundId ? "refunded" : "approved",
    cancel_fee_amount: Math.min(Math.max(0, fee), paidDisplay),
    refund_amount: refundDisp,
    cancel_admin_note: String(input.note || "").slice(0, 500),
    cancel_approved_at: new Date().toISOString(),
    ...(iyzicoRefundId ? { iyzico_refund_id: iyzicoRefundId } : {}),
  });
  return { ok: true, booking: toAdminCancelRow(next) };
}
