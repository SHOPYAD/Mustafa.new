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
  service: InvoiceService;
  airline: string;
  airline_code: string;
  origin: string;
  destination: string;
  route: string;
  pnr: string;
  fare_class: string;
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
  };
}

export type AdminCancelRow = GuestHotelBooking & {
  customer_name: string;
  customer_email: string;
  charged_amount: number;
  charged_currency: string;
  cancel_requested_at: string;
  cancel_fee_amount: number;
};

export function toAdminCancelRow(booking: HotelBookingRecord): AdminCancelRow {
  return {
    ...toGuestHotelBooking(booking),
    customer_name: booking.customer_name,
    customer_email: booking.customer_email || "",
    charged_amount: bookingChargedAmount(booking),
    charged_currency: bookingChargedCurrency(booking),
    cancel_requested_at: snapString(booking, "cancel_requested_at"),
    cancel_fee_amount: snapNumber(booking, "cancel_fee_amount"),
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

export async function listPendingCancellations(): Promise<AdminCancelRow[]> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return [];
  await ensureHotelBookingPaymentFields(pb);
  const page = await pb.collection("hotel_bookings").getList<HotelBookingRecord>(1, 200, {
    sort: "-updated",
  });
  return page.items.filter((row) => cancelStatusOf(row) !== "none").map(toAdminCancelRow);
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

  if (!cardPaid(booking) || refundCharged <= 0) {
    const next = await patchCancel(booking, {
      status: "cancelled",
      cancel_status: "approved",
      cancel_fee_amount: Math.min(Math.max(0, fee), paidDisplay),
      refund_amount: 0,
      cancel_admin_note: String(input.note || "").slice(0, 500),
      cancel_approved_at: new Date().toISOString(),
    });
    return { ok: true, booking: toAdminCancelRow(next) };
  }

  const refunded = await refundIyzicoBooking({
    bookingId: booking.id,
    amount: refundCharged,
    ip: input.ip,
  });
  if (!refunded.ok) {
    const failed = await patchCancel(booking, {
      cancel_status: "refund_failed",
      cancel_fee_amount: Math.min(Math.max(0, fee), paidDisplay),
      refund_amount: refundDisp,
      cancel_admin_note: String(input.note || refunded.error || "").slice(0, 500),
    });
    return { ok: false, booking: toAdminCancelRow(failed), error: refunded.error || "refund_failed" };
  }

  const latest = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(booking.id);
  const next = await patchCancel(latest, {
    status: "cancelled",
    cancel_status: "refunded",
    cancel_fee_amount: Math.min(Math.max(0, fee), paidDisplay),
    refund_amount: refundDisp,
    cancel_admin_note: String(input.note || "").slice(0, 500),
    cancel_approved_at: new Date().toISOString(),
    iyzico_refund_id: refunded.refund?.refundId || snapString(latest, "iyzico_refund_id"),
  });
  return { ok: true, booking: toAdminCancelRow(next) };
}
