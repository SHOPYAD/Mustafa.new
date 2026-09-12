import type PocketBase from "pocketbase";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { notifyIyzicoPaymentSuccess } from "@/lib/server/email/notify";
import {
  cancelPayment,
  refundPayment,
  retrieveCheckout,
  retrievePayment,
  type IyzicoChargePlan,
  type IyzicoRefundResult,
  type IyzicoRetrieveResult,
} from "@/lib/server/iyzico";
import { bookingConfirmToken, newConfirmToken } from "@/lib/server/hotel-booking-confirm";
import { confirmBookingPoints } from "@/lib/loyalty/server";

function pbQuote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function snapshotOf(booking: HotelBookingRecord): Record<string, unknown> {
  return booking.offer_snapshot && typeof booking.offer_snapshot === "object"
    ? { ...booking.offer_snapshot }
    : {};
}

function snapshotString(snapshot: Record<string, unknown>, key: string): string {
  const value = snapshot[key];
  return value != null ? String(value) : "";
}

function snapshotNumber(snapshot: Record<string, unknown>, key: string): number {
  const n = Number(snapshot[key]);
  return Number.isFinite(n) ? n : 0;
}

export function bookingChargedAmount(booking: HotelBookingRecord): number {
  const snap = snapshotOf(booking);
  const fromField = Number(booking.charged_amount);
  if (Number.isFinite(fromField) && fromField > 0) return fromField;
  return snapshotNumber(snap, "charged_amount") || snapshotNumber(snap, "chargedAmount");
}

export function bookingChargedCurrency(booking: HotelBookingRecord): string {
  const snap = snapshotOf(booking);
  return (
    String(booking.charged_currency || "").trim() ||
    snapshotString(snap, "charged_currency") ||
    snapshotString(snap, "chargedCurrency") ||
    "TRY"
  );
}

export function bookingPaymentId(booking: HotelBookingRecord): string {
  const snap = snapshotOf(booking);
  return String(booking.iyzico_payment_id || "").trim() || snapshotString(snap, "iyzico_payment_id");
}

export function bookingToken(booking: HotelBookingRecord): string {
  const snap = snapshotOf(booking);
  return String(booking.iyzico_token || "").trim() || snapshotString(snap, "iyzico_token");
}

export function bookingPaymentTransactionId(booking: HotelBookingRecord): string {
  return snapshotString(snapshotOf(booking), "iyzico_payment_transaction_id");
}

export function bookingRefundedAmount(booking: HotelBookingRecord): number {
  return snapshotNumber(snapshotOf(booking), "iyzico_refunded_amount");
}

const PAYMENT_FIELDS: Array<{ name: string; type: "text" | "number" | "bool" }> = [
  { name: "iyzico_payment_id", type: "text" },
  { name: "iyzico_token", type: "text" },
  { name: "payment_status", type: "text" },
  { name: "charged_amount", type: "number" },
  { name: "charged_currency", type: "text" },
  { name: "display_amount", type: "number" },
  { name: "display_currency", type: "text" },
  { name: "fx_rate", type: "number" },
  { name: "fx_source", type: "text" },
  { name: "fx_at", type: "text" },
  { name: "cancel_status", type: "text" },
  { name: "cancel_requested_at", type: "text" },
  { name: "cancel_reason", type: "text" },
  { name: "cancel_fee_amount", type: "number" },
  { name: "refund_amount", type: "number" },
  { name: "cancel_admin_note", type: "text" },
  { name: "cancel_approved_at", type: "text" },
  { name: "iyzico_refund_id", type: "text" },
  { name: "free_cancellation", type: "bool" },
  { name: "non_refundable", type: "bool" },
];

let fieldsEnsured = false;

export async function ensureHotelBookingPaymentFields(pb?: PocketBase | null): Promise<void> {
  if (fieldsEnsured) return;
  const client = pb || (await tryCreateAdminPocketBase());
  if (!client) return;
  try {
    const col = await client.collections.getOne("hotel_bookings");
    const fields = (Array.isArray(col.fields) ? [...col.fields] : []) as Array<Record<string, unknown>>;
    const names = new Set(fields.map((f) => String(f.name || "")));
    let changed = false;
    for (const field of PAYMENT_FIELDS) {
      if (names.has(field.name)) continue;
      fields.push({ name: field.name, type: field.type });
      changed = true;
    }
    if (changed) {
      await client.collections.update(col.id, { fields });
    }
    fieldsEnsured = true;
  } catch {
    /* snapshot-only updates still work */
  }
}

async function findHotelBooking(opts: {
  conversationId?: string;
  token?: string;
  paymentId?: string;
}): Promise<HotelBookingRecord | null> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  const conversationId = String(opts.conversationId || "").trim();
  const token = String(opts.token || "").trim();
  const paymentId = String(opts.paymentId || "").trim();

  if (conversationId) {
    try {
      return await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(conversationId);
    } catch {
      /* conversationId is not a booking id */
    }
  }

  if (token) {
    try {
      return await pb.collection("hotel_bookings").getFirstListItem<HotelBookingRecord>(
        `iyzico_token = ${pbQuote(token)}`
      );
    } catch {
      /* dedicated field missing or empty */
    }
    try {
      return await pb.collection("hotel_bookings").getFirstListItem<HotelBookingRecord>(
        `offer_snapshot.iyzico_token = ${pbQuote(token)}`
      );
    } catch {
      /* no row stored this checkout token */
    }
  }

  if (paymentId) {
    try {
      return await pb.collection("hotel_bookings").getFirstListItem<HotelBookingRecord>(
        `iyzico_payment_id = ${pbQuote(paymentId)}`
      );
    } catch {
      /* ignore */
    }
  }

  return null;
}

async function patchBooking(
  pb: PocketBase,
  booking: HotelBookingRecord,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await pb.collection("hotel_bookings").update(booking.id, data);
  } catch {
    const { offer_snapshot: snapshot, status, ...rest } = data;
    await pb.collection("hotel_bookings").update(booking.id, {
      ...(status ? { status } : {}),
      offer_snapshot: {
        ...snapshotOf(booking),
        ...(snapshot && typeof snapshot === "object" ? snapshot : {}),
        ...rest,
      },
    });
  }
}

export async function persistCheckoutCharge(input: {
  bookingId: string;
  token?: string;
  charge: IyzicoChargePlan;
}): Promise<void> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  await ensureHotelBookingPaymentFields(pb);
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(input.bookingId);
  const snapshot = snapshotOf(booking);
  const confirmToken = bookingConfirmToken(booking) || newConfirmToken();
  await patchBooking(pb, booking, {
    iyzico_token: input.token || booking.iyzico_token || "",
    payment_status: booking.payment_status || "pending_payment",
    charged_amount: input.charge.chargedAmount,
    charged_currency: input.charge.chargedCurrency,
    display_amount: input.charge.displayAmount,
    display_currency: input.charge.displayCurrency,
    fx_rate: input.charge.fxRate,
    fx_source: input.charge.fxSource,
    fx_at: input.charge.fxAt,
    offer_snapshot: {
      ...snapshot,
      confirm_token: confirmToken,
      payment_method: "iyzico",
      iyzico_token: input.token || snapshot.iyzico_token,
      charged_amount: input.charge.chargedAmount,
      charged_currency: input.charge.chargedCurrency,
      chargedAmount: input.charge.chargedAmount,
      chargedCurrency: input.charge.chargedCurrency,
      display_amount: input.charge.displayAmount,
      display_currency: input.charge.displayCurrency,
      fx_rate: input.charge.fxRate,
      fx_source: input.charge.fxSource,
      fx_at: input.charge.fxAt,
      fxNote: input.charge.fxNote,
    },
  });
}

export async function applyIyzicoResultToBooking(input: {
  retrieved: IyzicoRetrieveResult;
  token?: string;
  conversationId?: string;
  webhookStatus?: string;
  webhookEventType?: string;
}): Promise<{ updated: boolean; bookingId?: string; alreadyPaid: boolean; confirmToken?: string }> {
  const token = String(input.token || input.retrieved.token || "").trim();
  const conversationId = String(input.conversationId || input.retrieved.conversationId || "").trim();
  const booking = await findHotelBooking({
    conversationId,
    token,
    paymentId: input.retrieved.paymentId,
  });
  if (!booking) return { updated: false, alreadyPaid: false };

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return {
      updated: false,
      bookingId: booking.id,
      alreadyPaid: booking.status === "paid",
      confirmToken: bookingConfirmToken(booking),
    };
  }
  await ensureHotelBookingPaymentFields(pb);

  const alreadyPaid = booking.status === "paid";
  const snapshot = snapshotOf(booking);
  const confirmToken = bookingConfirmToken(booking) || newConfirmToken();
  const chargedAmount = bookingChargedAmount(booking);
  const retrieved: IyzicoRetrieveResult = {
    ...input.retrieved,
    amountMatched:
      input.retrieved.amountMatched ??
      (chargedAmount > 0
        ? Math.abs(Number(input.retrieved.paidPrice) - chargedAmount) <= Math.max(0.5, chargedAmount * 0.02)
        : true),
  };

  const webhookSuccess = String(input.webhookStatus || "").toUpperCase() === "SUCCESS";
  /** Official: fraudStatus 0 stays pending until merchant webhook SUCCESS. */
  const reviewCleared = retrieved.pendingReview && webhookSuccess;
  const amountOk = retrieved.amountMatched !== false;

  let nextStatus = booking.status;
  let paymentStatus = String(booking.payment_status || booking.status || "pending_payment");
  if (alreadyPaid) {
    nextStatus = "paid";
    paymentStatus = "paid";
  } else if ((retrieved.paid || reviewCleared) && amountOk) {
    nextStatus = "paid";
    paymentStatus = "paid";
  } else if (retrieved.pendingReview) {
    nextStatus = "pending_payment";
    paymentStatus = "pending_review";
  } else if (!amountOk && (retrieved.paid || webhookSuccess)) {
    nextStatus = "pending_payment";
    paymentStatus = "amount_mismatch";
  } else {
    nextStatus = "pending_payment";
    paymentStatus = retrieved.ok ? "failed" : paymentStatus;
  }

  await patchBooking(pb, booking, {
    status: nextStatus,
    iyzico_payment_id: retrieved.paymentId || booking.iyzico_payment_id || "",
    iyzico_token: token || booking.iyzico_token || "",
    payment_status: paymentStatus,
    offer_snapshot: {
      ...snapshot,
      confirm_token: confirmToken,
      payment_method: "iyzico",
      iyzico_token: token || snapshot.iyzico_token,
      iyzico_payment_id: retrieved.paymentId || snapshot.iyzico_payment_id,
      iyzico_payment_transaction_id:
        retrieved.paymentTransactionId || snapshot.iyzico_payment_transaction_id,
      iyzico_status: retrieved.paymentStatus || input.webhookStatus || snapshot.iyzico_status,
      iyzico_fraud_status: retrieved.fraudStatus,
      iyzico_paid_price: retrieved.paidPrice,
      iyzico_paid_currency: retrieved.currency,
      iyzico_amount_matched: amountOk,
      ...(input.webhookEventType ? { iyzico_event_type: input.webhookEventType } : {}),
    },
  });

  if (!alreadyPaid && nextStatus === "paid") {
    // 0. Supplier reservation (quote-backed hotel bookings). Idempotent: callback + webhook may both land.
    if (snapshot.quote_id) {
      void import("@/lib/server/hotels/fulfilment")
        .then(({ fulfilHotelBooking }) => fulfilHotelBooking(booking.id, { trigger: input.webhookEventType ? "iyzico_webhook" : "iyzico_callback" }))
        .catch((e) => console.warn("[hotel fulfilment error]:", e));
    }
    // 0b. Flights: supplier booking + ticket issue only after the money is in (plan B3). Idempotent.
    if (snapshot.flight_booking_id) {
      void import("@/lib/server/flights/fulfilment")
        .then(({ fulfilFlightBooking }) => fulfilFlightBooking(booking.id, { trigger: input.webhookEventType ? "iyzico_webhook" : "iyzico_callback" }))
        .catch((e) => console.warn("[flight fulfilment error]:", e));
    }

    // 1. Trigger Parasut e-Archive issuance automatically
    void (async () => {
      try {
        const { triggerParasutEArchiveIssue } = await import("@/lib/server/parasut/parasut-service");
        await triggerParasutEArchiveIssue(booking.id);
      } catch (e) {
        console.warn("[Parasut background issue error]:", e);
      }
    })();

    void notifyIyzicoPaymentSuccess(booking.id).catch(() => undefined);
    const userId = String(booking.user || "").trim();
    if (userId) {
      void confirmBookingPoints(booking.id, userId).catch(() => undefined);
    }
  }

  return { updated: true, bookingId: booking.id, alreadyPaid, confirmToken };
}

export type AdminIyzicoBooking = {
  id: string;
  hotel_name: string;
  customer_name: string;
  status: string;
  payment_status: string;
  paymentId: string;
  token: string;
  display_amount: number;
  display_currency: string;
  charged_amount: number;
  charged_currency: string;
  fx_rate: number;
  fx_source: string;
  refunded_amount: number;
  created: string;
  canRefund: boolean;
};

function toAdminRow(row: HotelBookingRecord): AdminIyzicoBooking {
  const snap = snapshotOf(row);
  const paymentId = bookingPaymentId(row);
  const token = bookingToken(row);
  const charged = bookingChargedAmount(row);
  const refunded = bookingRefundedAmount(row);
  const paymentStatus = String(row.payment_status || row.status || "");
  return {
    id: row.id,
    hotel_name: row.hotel_name,
    customer_name: row.customer_name,
    status: row.status,
    payment_status: paymentStatus,
    paymentId,
    token,
    display_amount: Number(row.display_amount) || snapshotNumber(snap, "display_amount") || Number(row.price) || 0,
    display_currency: String(row.display_currency || snap.display_currency || row.currency || "USD"),
    charged_amount: charged,
    charged_currency: bookingChargedCurrency(row),
    fx_rate: Number(row.fx_rate) || snapshotNumber(snap, "fx_rate") || 0,
    fx_source: String(row.fx_source || snap.fx_source || ""),
    refunded_amount: refunded,
    created: row.created,
    canRefund: row.status === "paid" && Boolean(paymentId) && refunded < charged - 0.01,
  };
}

function isIyzicoBooking(row: HotelBookingRecord): boolean {
  const snap = snapshotOf(row);
  return Boolean(
    row.iyzico_token ||
      row.iyzico_payment_id ||
      snap.iyzico_token ||
      snap.iyzico_payment_id ||
      snap.payment_method === "iyzico"
  );
}

export async function listRecentIyzicoBookings(limit = 40): Promise<AdminIyzicoBooking[]> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return [];
  await ensureHotelBookingPaymentFields(pb);
  const page = await pb.collection("hotel_bookings").getList<HotelBookingRecord>(1, 80, {
    sort: "-created",
  });
  return page.items.filter(isIyzicoBooking).slice(0, limit).map(toAdminRow);
}

export async function refreshIyzicoBooking(bookingId: string): Promise<{
  ok: boolean;
  booking?: AdminIyzicoBooking;
  error?: string;
}> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, error: "PocketBase unavailable" };
  await ensureHotelBookingPaymentFields(pb);
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
  const charged = bookingChargedAmount(booking);
  const token = bookingToken(booking);
  const paymentId = bookingPaymentId(booking);
  let retrieved: IyzicoRetrieveResult;
  if (token) {
    retrieved = await retrieveCheckout(token, booking.id, charged);
  } else if (paymentId) {
    retrieved = await retrievePayment(paymentId, booking.id, charged);
  } else {
    return { ok: false, error: "no_iyzico_reference" };
  }
  await applyIyzicoResultToBooking({
    retrieved,
    token,
    conversationId: booking.id,
  });
  const next = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
  return { ok: retrieved.ok, booking: toAdminRow(next), error: retrieved.error };
}

export async function refundIyzicoBooking(input: {
  bookingId: string;
  amount?: number;
  ip?: string;
}): Promise<{ ok: boolean; booking?: AdminIyzicoBooking; refund?: IyzicoRefundResult; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, error: "PocketBase unavailable" };
  await ensureHotelBookingPaymentFields(pb);
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingIdSafe(input.bookingId));
  const paid =
    booking.status === "paid" || String(booking.payment_status || "").toLowerCase() === "paid";
  if (!paid) return { ok: false, error: "not_paid" };

  const charged = bookingChargedAmount(booking);
  const already = bookingRefundedAmount(booking);
  const remaining = Math.round((charged - already) * 100) / 100;
  if (remaining <= 0) return { ok: false, error: "already_refunded" };

  const requested = input.amount != null && input.amount > 0 ? input.amount : remaining;
  const price = Math.min(requested, remaining);
  const currency = bookingChargedCurrency(booking);
  let paymentId = bookingPaymentId(booking);
  let paymentTransactionId = bookingPaymentTransactionId(booking);

  if (!paymentTransactionId && (paymentId || bookingToken(booking))) {
    const retrieved = bookingToken(booking)
      ? await retrieveCheckout(bookingToken(booking), booking.id, charged)
      : await retrievePayment(paymentId, booking.id, charged);
    paymentId = retrieved.paymentId || paymentId;
    paymentTransactionId = retrieved.paymentTransactionId || paymentTransactionId;
    await applyIyzicoResultToBooking({
      retrieved,
      token: bookingToken(booking),
      conversationId: booking.id,
    });
  }

  const fullRemaining = Math.abs(price - remaining) < 0.02;
  let refund: IyzicoRefundResult | null = null;
  if (fullRemaining && paymentId) {
    refund = await cancelPayment({
      paymentId,
      conversationId: booking.id,
      ip: input.ip,
    });
  }
  if (!refund?.ok) {
    if (!paymentTransactionId) {
      return { ok: false, error: refund?.error || "missing_payment_transaction_id" };
    }
    refund = await refundPayment({
      paymentTransactionId,
      price,
      currency,
      conversationId: booking.id,
      ip: input.ip,
    });
  }
  if (!refund.ok) return { ok: false, error: refund.error };

  const snap = snapshotOf(booking);
  const nextRefunded = Math.round((already + Number(refund.price || price)) * 100) / 100;
  const paymentStatus = nextRefunded >= charged - 0.02 ? "refunded" : "partial_refund";
  await patchBooking(pb, booking, {
    payment_status: paymentStatus,
    iyzico_payment_id: paymentId || booking.iyzico_payment_id || "",
    offer_snapshot: {
      ...snap,
      iyzico_payment_id: paymentId || snap.iyzico_payment_id,
      iyzico_payment_transaction_id: paymentTransactionId || snap.iyzico_payment_transaction_id,
      iyzico_refund_id: refund.refundId,
      iyzico_refund_status: paymentStatus,
      iyzico_refund_via: refund.via,
      iyzico_refunded_amount: nextRefunded,
    },
  });
  const next = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(booking.id);
  return { ok: true, booking: toAdminRow(next), refund };
}

function bookingIdSafe(id: string): string {
  return String(id || "").trim();
}
