/**
 * Flight booking state machine (plan B3) — money-safe order of operations.
 *
 *   quoted ──(hotel_bookings row, provider "flight")──▶ awaiting_payment ──(iyzico SUCCESS)──▶ supplier_pending
 *      supplier_pending ──booking ok──▶ supplier_confirmed ──issue ok──▶ ticketed | ticket_pending
 *      supplier_pending ──booking fail─▶ supplier_failed ──auto refund──▶ refunded | refund_pending
 *      supplier_confirmed ──issue fail──▶ ticket_failed ──cancel PNR + auto refund──▶ refunded | refund_pending
 *
 * Runs exactly once per booking: Redis lock (`fulfil:flight:{bookingId}`) + the persisted
 * `fulfilment_status` make callback and webhook idempotent. Every supplier receives our booking id as its
 * client reference (PKFARE buyerOrder etc.), so a retry can never create a second reservation.
 */

import type PocketBase from "pocketbase";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { createAdminNotification } from "@/lib/admin-notifications/server";
import { cacheDel, cacheLock } from "@/lib/server/hotels/cache";
import { supplyLogger } from "@/lib/server/hotels/telemetry";
import {
  bookFlightAtSupplier,
  cancelFlightBooking,
  getFlightBooking,
  quoteIsFresh,
  ticketFlightBooking,
  updateFlightBooking,
  type FlightBookingSession,
  type FlightFulfilmentStatus,
} from "@/lib/server/flights-bookings";
import { priceChanged } from "@/lib/server/flights/repricing";

export interface FlightFulfilmentResult {
  status: FlightFulfilmentStatus | "skipped" | "in_progress";
  pnr?: string;
  ticketNumbers?: string[];
  error?: string;
}

/** Supplier total may exceed the quoted supplier total by at most this share before we refuse to book. */
const PRICE_TOLERANCE = 0.02;

function snapshotOf(b: HotelBookingRecord): Record<string, unknown> {
  return b.offer_snapshot && typeof b.offer_snapshot === "object" ? { ...b.offer_snapshot } : {};
}

async function patch(pb: PocketBase, booking: HotelBookingRecord, data: Record<string, unknown>, snapPatch: Record<string, unknown>): Promise<HotelBookingRecord> {
  const snap = { ...snapshotOf(booking), ...snapPatch };
  return pb.collection("hotel_bookings").update<HotelBookingRecord>(booking.id, { ...data, offer_snapshot: snap });
}

function flightSnapshot(session: FlightBookingSession): Record<string, unknown> {
  return {
    flight_booking_id: session.id,
    supplier: session.supplier,
    fulfilment_status: session.fulfilment.status,
    fulfilment_error: session.fulfilment.error || undefined,
    pnr: session.pnr || undefined,
    airline_pnr: session.airlinePnr || undefined,
    supplier_reference: session.supplierOrderId || session.pnr || undefined,
    supplier_order_id: session.supplierOrderId || undefined,
    ticket_numbers: session.ticketNumbers || [],
    ticket_number: session.ticketNumbers?.[0] || undefined,
    ticket_issued: Boolean(session.ticketIssued),
    net_total: session.quote?.supplierTotal,
    net_currency: session.quote?.supplierCurrency,
    ticketing_deadline: session.quote?.paymentTimeLimit || undefined,
    baggage_verified: session.quote?.baggage || undefined,
  };
}

/** Copies the flight session state (PNR, tickets, status) onto the paid hotel_bookings row the customer sees. */
export async function mirrorFlightStateToHotelBooking(flightBookingId: string): Promise<void> {
  const session = await getFlightBooking(flightBookingId);
  if (!session?.hotelBookingId) return;
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(session.hotelBookingId).catch(() => null);
  if (!booking) return;
  const data: Record<string, unknown> = {};
  if (session.fulfilment.status === "cancelled" || session.fulfilment.status === "refunded") data.status = "cancelled";
  await patch(pb, booking, data, flightSnapshot(session)).catch(() => undefined);
}

/* ------------------------------------------------------------------------------------------------ */

export async function fulfilFlightBooking(hotelBookingId: string, opts: { trigger: string }): Promise<FlightFulfilmentResult> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { status: "skipped", error: "pocketbase_unavailable" };
  let booking: HotelBookingRecord;
  try {
    booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(hotelBookingId);
  } catch {
    return { status: "skipped", error: "booking_not_found" };
  }
  const snap = snapshotOf(booking);
  const flightBookingId = String(snap.flight_booking_id || "");
  if (!flightBookingId) return { status: "skipped" };

  const current = String(snap.fulfilment_status || "awaiting_payment") as FlightFulfilmentStatus;
  if (["supplier_confirmed", "ticketed", "ticket_pending"].includes(current)) return { status: current, pnr: String(snap.pnr || "") };
  if (["supplier_failed", "ticket_failed", "refund_pending", "refunded", "refund_failed", "cancelled"].includes(current)) return { status: current, error: String(snap.fulfilment_error || "") };

  const paid = booking.status === "paid" || String(booking.payment_status || "").toLowerCase() === "paid";
  if (!paid) return { status: "awaiting_payment" };

  const lockKey = `fulfil:flight:${booking.id}`;
  const owner = await cacheLock(lockKey, 240);
  if (!owner) return { status: "in_progress" };

  try {
    booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(hotelBookingId);
    const fresh = snapshotOf(booking);
    const freshStatus = String(fresh.fulfilment_status || "awaiting_payment") as FlightFulfilmentStatus;
    if (freshStatus !== "awaiting_payment" && freshStatus !== "supplier_pending") return { status: freshStatus, pnr: String(fresh.pnr || "") };
    if (freshStatus === "supplier_pending" && fresh.fulfilment_started_at && Date.now() - Date.parse(String(fresh.fulfilment_started_at)) < 10 * 60 * 1000) return { status: "in_progress" };

    let session = await getFlightBooking(flightBookingId);
    if (!session) {
      await patch(pb, booking, {}, { fulfilment_status: "supplier_failed", fulfilment_error: "flight_session_missing", fulfilment_finished_at: new Date().toISOString() });
      return await autoRefund(pb, booking.id, null, "flight_session_missing");
    }
    if (session.fulfilment.status === "ticketed" || session.fulfilment.status === "supplier_confirmed" || session.fulfilment.status === "ticket_pending") {
      await patch(pb, booking, {}, flightSnapshot(session));
      return { status: session.fulfilment.status, pnr: session.pnr, ticketNumbers: session.ticketNumbers };
    }

    const startedAt = new Date().toISOString();
    session = (await updateFlightBooking(session.id, { hotelBookingId: booking.id, fulfilment: { status: "supplier_pending", startedAt, trigger: opts.trigger } })) || session;
    booking = await patch(pb, booking, {}, { ...flightSnapshot(session), fulfilment_started_at: startedAt, fulfilment_trigger: opts.trigger });
    const started = Date.now();

    if (!quoteIsFresh(session.quote)) {
      supplyLogger.warn({ bookingId: booking.id, flightBookingId, expiresAt: session.quote?.expiresAt }, "flight quote expired before fulfilment — booking with supplier price check");
    }

    // 1. Supplier booking with the real travellers.
    const booked = await bookFlightAtSupplier(session);
    if (!booked.ok) {
      supplyLogger.error({ bookingId: booking.id, flightBookingId, supplier: session.supplier, error: booked.error }, "supplier flight booking failed after payment");
      session = (await updateFlightBooking(session.id, { fulfilment: { ...session.fulfilment, status: "supplier_failed", error: booked.error.slice(0, 500), finishedAt: new Date().toISOString() } })) || session;
      await patch(pb, booking, {}, { ...flightSnapshot(session), fulfilment_finished_at: new Date().toISOString(), fulfilment_latency_ms: Date.now() - started });
      return await autoRefund(pb, booking.id, session, booked.error);
    }

    // 2. Price guard: the supplier may not charge us materially more than the quote the customer paid for.
    const quotedNet = Number(session.quote?.supplierTotal || 0);
    if (booked.supplierTotal && quotedNet > 0 && booked.supplierCurrency === session.quote?.supplierCurrency && booked.supplierTotal > quotedNet && priceChanged(quotedNet, booked.supplierTotal, PRICE_TOLERANCE)) {
      const reason = `supplier_price_increased:${quotedNet}→${booked.supplierTotal} ${booked.supplierCurrency}`;
      supplyLogger.error({ bookingId: booking.id, flightBookingId, reason }, "supplier price increased at booking — cancelling PNR and refunding");
      session = (await updateFlightBooking(session.id, { pnr: booked.pnr, airlinePnr: booked.airlinePnr, supplierOrderId: booked.supplierOrderId })) || session;
      await cancelFlightBooking(session.id).catch(() => undefined);
      session = (await updateFlightBooking(session.id, { fulfilment: { ...session.fulfilment, status: "supplier_failed", error: reason, finishedAt: new Date().toISOString() } })) || session;
      await patch(pb, booking, {}, { ...flightSnapshot(session), fulfilment_finished_at: new Date().toISOString() });
      return await autoRefund(pb, booking.id, session, reason);
    }

    session =
      (await updateFlightBooking(session.id, {
        pnr: booked.pnr,
        airlinePnr: booked.airlinePnr,
        supplierOrderId: booked.supplierOrderId,
        supplierReference: booked.supplierOrderId,
        verifiedPayload: booked.verifiedPayload || session.verifiedPayload,
        fulfilment: { ...session.fulfilment, status: "supplier_confirmed" },
      })) || session;
    booking = await patch(pb, booking, {}, { ...flightSnapshot(session), supplier_status: "CONFIRMED" });
    supplyLogger.info({ bookingId: booking.id, flightBookingId, supplier: session.supplier, pnr: booked.pnr }, "flight booked at supplier");

    // 3. Ticket issue.
    const ticketed = await ticketFlightBooking(session.id);
    session = (await getFlightBooking(session.id)) || session;
    if (!ticketed.ok) {
      supplyLogger.error({ bookingId: booking.id, flightBookingId, error: ticketed.error }, "ticket issue failed after payment — cancelling PNR and refunding");
      await cancelFlightBooking(session.id).catch(() => undefined);
      session = (await getFlightBooking(session.id)) || session;
      session = (await updateFlightBooking(session.id, { fulfilment: { ...session.fulfilment, status: "ticket_failed", error: (ticketed.error || "ticketing_failed").slice(0, 500), finishedAt: new Date().toISOString() } })) || session;
      await patch(pb, booking, {}, { ...flightSnapshot(session), fulfilment_finished_at: new Date().toISOString(), fulfilment_latency_ms: Date.now() - started });
      return await autoRefund(pb, booking.id, session, ticketed.error || "ticketing_failed");
    }

    await patch(pb, booking, {}, { ...flightSnapshot(session), fulfilment_finished_at: new Date().toISOString(), fulfilment_latency_ms: Date.now() - started });
    if (!ticketed.ticketNumbers.length) {
      await createAdminNotification({
        type: "booking",
        body_ar: `حجز الطيران ${session.pnr} مؤكد لدى ${session.supplier} لكن أرقام التذاكر لم تصل بعد — تابع الإصدار من لوحة الطيران`,
        href: "/admin/bookings",
        meta: { bookingId: booking.id, source: "flight", kind: "ticket_pending", flightBookingId: session.id },
      }).catch(() => undefined);
    }
    void import("@/lib/server/email/notify")
      .then(({ notifyFlightBookingPlaced }) => notifyFlightBookingPlaced(session as FlightBookingSession))
      .catch(() => undefined);
    return { status: session.fulfilment.status, pnr: session.pnr, ticketNumbers: session.ticketNumbers };
  } finally {
    await cacheDel(lockKey);
  }
}

/** Supplier refused (or ticketing failed) after we took the money → refund automatically and alert the admin. */
async function autoRefund(pb: PocketBase, bookingId: string, session: FlightBookingSession | null, reason: string): Promise<FlightFulfilmentResult> {
  let booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
  const snap = snapshotOf(booking);
  const isIyzico = Boolean(booking.iyzico_payment_id || booking.iyzico_token || snap.iyzico_payment_id || snap.iyzico_token);
  await createAdminNotification({
    type: "booking",
    body_ar: `فشل تأكيد حجز الطيران لدى المورد بعد الدفع — ${booking.hotel_name} — ${reason.slice(0, 120)}`,
    href: "/admin/bookings",
    meta: { bookingId, source: "flight", kind: "supplier_failed", reason: reason.slice(0, 300), flightBookingId: session?.id },
  });
  const setSession = async (status: FlightFulfilmentStatus) => {
    if (session) await updateFlightBooking(session.id, { fulfilment: { ...session.fulfilment, status, error: reason.slice(0, 500) } }).catch(() => undefined);
  };
  if (!isIyzico) {
    await patch(pb, booking, {}, { fulfilment_status: "refund_pending", refund_reason: reason.slice(0, 300) });
    await setSession("refund_pending");
    return { status: "refund_pending", error: reason };
  }
  try {
    const { refundIyzicoBooking } = await import("@/lib/server/iyzico-bookings");
    const res = await refundIyzicoBooking({ bookingId });
    booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    if (res.ok) {
      await patch(pb, booking, { status: "cancelled" }, { fulfilment_status: "refunded", refund_reason: reason.slice(0, 300), refunded_at: new Date().toISOString() });
      await setSession("refunded");
      return { status: "refunded", error: reason };
    }
    await patch(pb, booking, {}, { fulfilment_status: "refund_failed", refund_reason: reason.slice(0, 300), refund_error: String(res.error || "").slice(0, 300) });
    await setSession("refund_failed");
    await createAdminNotification({ type: "booking", body_ar: `تعذّر الاسترداد التلقائي لحجز الطيران ${booking.hotel_name} — تدخل يدوي مطلوب`, href: "/admin/bookings", meta: { bookingId, source: "flight", kind: "refund_failed" } });
    return { status: "refund_failed", error: res.error || reason };
  } catch (err) {
    await patch(pb, booking, {}, { fulfilment_status: "refund_failed", refund_reason: reason.slice(0, 300), refund_error: String(err).slice(0, 300) });
    await setSession("refund_failed");
    return { status: "refund_failed", error: String(err) };
  }
}
