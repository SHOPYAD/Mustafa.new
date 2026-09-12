/**
 * Hotel booking state machine (plan A3) — money-safe order of operations.
 *
 *   quoted ──(booking created)──▶ awaiting_payment ──(iyzico SUCCESS)──▶ supplier_pending
 *      supplier_pending ──ok──▶ supplier_confirmed ──voucher mailed──▶ voucher_sent
 *      supplier_pending ──fail─▶ supplier_failed ──auto refund──▶ refund_pending | refunded
 *
 * The supplier reservation runs exactly once per booking: a Redis lock (`fulfil:{bookingId}`) plus
 * the persisted `fulfilment_status` make the callback and the webhook idempotent, and every supplier
 * receives the booking id as its client reference so a retry can never create a second reservation.
 */

import type PocketBase from "pocketbase";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { HotelbedsHotelAdapter } from "@/lib/providers/adapters/hotelbeds/HotelbedsHotelAdapter";
import { RateHawkHotelAdapter } from "@/lib/providers/adapters/ratehawk/RateHawkHotelAdapter";
import { TravelportHotelAdapter } from "@/lib/providers/adapters/travelport/TravelportHotelAdapter";
import { SeeruHotelAdapter } from "@/lib/providers/adapters/seeru/seeruHotelAdapter";
import { createAdminNotification } from "@/lib/admin-notifications/server";
import { cacheDel, cacheLock } from "./cache";
import { getHotelQuote, updateHotelQuote, type HotelQuote } from "./quote-service";
import { supplyLogger } from "./telemetry";

export type FulfilmentStatus =
  | "awaiting_payment"
  | "supplier_pending"
  | "supplier_confirmed"
  | "voucher_sent"
  | "supplier_failed"
  | "refund_pending"
  | "refunded"
  | "refund_failed"
  | "cancelled";

export interface FulfilmentResult {
  status: FulfilmentStatus | "skipped" | "in_progress";
  supplierReference?: string;
  error?: string;
}

function snapshotOf(b: HotelBookingRecord): Record<string, unknown> {
  return b.offer_snapshot && typeof b.offer_snapshot === "object" ? { ...b.offer_snapshot } : {};
}

function splitName(full: string): { first: string; last: string } {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] || "Guest", last: parts.slice(1).join(" ") || "Guest" };
}

function guestList(b: HotelBookingRecord): Array<{ firstName: string; lastName: string }> {
  const names = Array.isArray(b.guest_names) ? b.guest_names.map((n) => String(n).trim()).filter(Boolean) : [];
  const list = (names.length ? names : [b.customer_name]).map((n) => {
    const s = splitName(n);
    return { firstName: s.first, lastName: s.last };
  });
  return list.length ? list : [{ firstName: "Guest", lastName: "Guest" }];
}

async function patch(pb: PocketBase, booking: HotelBookingRecord, data: Record<string, unknown>, snapPatch: Record<string, unknown>): Promise<HotelBookingRecord> {
  const snap = { ...snapshotOf(booking), ...snapPatch };
  const updated = await pb.collection("hotel_bookings").update<HotelBookingRecord>(booking.id, { ...data, offer_snapshot: snap });
  return updated;
}

/* ------------------------------------------------------------------------------------------------ */

type SupplierBookResult = { ok: true; reference: string; hotelConfirmation?: string; voucherUrl?: string; status?: string; raw?: unknown } | { ok: false; error: string; retryable?: boolean };

async function bookAtSupplier(booking: HotelBookingRecord, quote: HotelQuote): Promise<SupplierBookResult> {
  const holder = splitName(booking.customer_name);
  const guests = guestList(booking);
  const email = String(booking.customer_email || "");
  const phone = String(booking.customer_phone || "");
  const snap = snapshotOf(booking);

  switch (quote.supplier) {
    case "hotelbeds": {
      const adults = Math.max(1, Number(booking.adults) || quote.adults || 1);
      const paxes: Array<{ roomId: number; type: "AD" | "CH"; name: string; surname: string; age?: number }> = [];
      for (let i = 0; i < adults; i++) {
        const g = guests[i] || guests[0];
        paxes.push({ roomId: 1, type: "AD", name: g.firstName, surname: g.lastName });
      }
      for (const age of quote.childrenAges) paxes.push({ roomId: 1, type: "CH", name: "Child", surname: holder.last, age });
      const res = await new HotelbedsHotelAdapter().createReservation({
        rateKey: quote.supplierToken,
        guestFirstName: holder.first,
        guestLastName: holder.last,
        guestEmail: email,
        guestPhone: phone,
        clientReference: booking.id.slice(0, 20),
        paxes,
        remark: booking.notes ? String(booking.notes).slice(0, 200) : undefined,
        tolerance: 2,
      });
      if (!res.ok || !res.bookingReference) return { ok: false, error: res.error || "hotelbeds_book_failed" };
      return { ok: true, reference: res.bookingReference, status: res.status, raw: res.raw };
    }
    case "ratehawk": {
      const rh = new RateHawkHotelAdapter();
      const partnerOrderId = `LONA-${booking.id}`;
      const attempt = async (bookHash: string, skipPrebook: boolean) =>
        rh.createReservation({
          bookHash,
          partnerOrderId,
          guests,
          contactEmail: email,
          contactPhone: phone,
          amount: quote.netTotal,
          currency: quote.currency,
          specialRequests: booking.notes ? String(booking.notes).slice(0, 200) : undefined,
          skipPrebook,
        });
      // The quote already ran prebook and holds the finalized hash; fall back to a fresh prebook on the
      // original hash if the finalized one has meanwhile expired.
      let res = await attempt(quote.supplierToken, true);
      if (!res.ok && quote.originalToken && quote.originalToken !== quote.supplierToken && !/partner_order_id|duplicate/i.test(res.error || "")) {
        res = await attempt(quote.originalToken, false);
      }
      if (!res.ok || !res.orderId) return { ok: false, error: res.error || "ratehawk_book_failed" };
      return { ok: true, reference: res.orderId, hotelConfirmation: res.hotelConfirmationCode, voucherUrl: res.voucherUrl, status: res.status, raw: res.raw };
    }
    case "travelport": {
      const res = await new TravelportHotelAdapter().createReservation({
        catalogOfferingId: quote.supplierToken,
        guestFirstName: holder.first,
        guestLastName: holder.last,
        guestEmail: email,
        guestPhone: phone,
        specialInstruction: booking.notes ? String(booking.notes).slice(0, 50) : undefined,
      });
      if (!res.ok) return { ok: false, error: res.error || "travelport_book_failed" };
      const reference = res.locator || res.confirmationNumber;
      if (!reference) return { ok: false, error: "travelport_no_locator" };
      return { ok: true, reference, hotelConfirmation: res.confirmationNumber, raw: res.raw };
    }
    case "seeru": {
      const seeru = new SeeruHotelAdapter();
      let orderId = String(snap.seeru_order_id || "");
      if (!orderId) {
        const saved = await seeru.saveBooking({
          src: quote.supplierContext.src || "",
          propertyId: quote.supplierHotelId,
          rateKey: quote.supplierToken,
          checkIn: quote.checkIn,
          checkOut: quote.checkOut,
          adults: quote.adults,
          rooms: quote.rooms,
          currency: quote.currency,
          customer: { firstName: holder.first, lastName: holder.last, email, phone },
          guests,
        });
        if (!saved.ok || !saved.orderId) return { ok: false, error: saved.message || "seeru_save_failed" };
        orderId = saved.orderId;
      }
      const issued = await seeru.issueOrder(orderId);
      if (!issued.ok) return { ok: false, error: issued.message || "seeru_issue_failed" };
      return { ok: true, reference: orderId, hotelConfirmation: issued.reservationNo || undefined, status: "CONFIRMED" };
    }
    default:
      return { ok: false, error: "unsupported_supplier" };
  }
}

/* ------------------------------------------------------------------------------------------------ */

/**
 * Executes the supplier reservation for a paid booking. Safe to call repeatedly (callback, webhook,
 * admin retry): only the first caller performs the booking; the others observe the stored state.
 */
export async function fulfilHotelBooking(bookingId: string, opts: { trigger: string }): Promise<FulfilmentResult> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { status: "skipped", error: "pocketbase_unavailable" };
  let booking: HotelBookingRecord;
  try {
    booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
  } catch {
    return { status: "skipped", error: "booking_not_found" };
  }
  const snap = snapshotOf(booking);
  const quoteId = String(snap.quote_id || "");
  if (!quoteId) return { status: "skipped" }; // legacy / non-supplier booking

  const current = String(snap.fulfilment_status || "awaiting_payment") as FulfilmentStatus;
  if (current === "supplier_confirmed" || current === "voucher_sent") return { status: current, supplierReference: String(snap.supplier_reference || "") };
  if (current === "supplier_failed" || current === "refund_pending" || current === "refunded" || current === "refund_failed" || current === "cancelled") return { status: current, error: String(snap.fulfilment_error || "") };

  const paid = booking.status === "paid" || String(booking.payment_status || "").toLowerCase() === "paid";
  if (!paid) return { status: "awaiting_payment" };

  const lockKey = `fulfil:${booking.id}`;
  const owner = await cacheLock(lockKey, 180);
  if (!owner) return { status: "in_progress" };

  try {
    // Re-read under the lock (the other racer may have finished between our read and the lock).
    booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    const fresh = snapshotOf(booking);
    const freshStatus = String(fresh.fulfilment_status || "awaiting_payment") as FulfilmentStatus;
    if (freshStatus !== "awaiting_payment" && freshStatus !== "supplier_pending") return { status: freshStatus, supplierReference: String(fresh.supplier_reference || "") };
    if (freshStatus === "supplier_pending" && fresh.fulfilment_started_at && Date.now() - Date.parse(String(fresh.fulfilment_started_at)) < 10 * 60 * 1000) return { status: "in_progress" };

    const quote = await getHotelQuote(quoteId, pb);
    if (!quote) {
      await patch(pb, booking, {}, { fulfilment_status: "supplier_failed", fulfilment_error: "quote_missing", fulfilment_finished_at: new Date().toISOString() });
      return await autoRefund(pb, booking.id, "quote_missing");
    }

    booking = await patch(pb, booking, {}, { fulfilment_status: "supplier_pending", fulfilment_started_at: new Date().toISOString(), fulfilment_trigger: opts.trigger, supplier: quote.supplier });
    const started = Date.now();
    let result: SupplierBookResult;
    try {
      result = await bookAtSupplier(booking, quote);
    } catch (err) {
      result = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }

    if (result.ok) {
      // `status` stays "paid" (PocketBase select: pending_payment|paid|cancelled); the supplier
      // state lives in offer_snapshot.fulfilment_status.
      await patch(
        pb,
        booking,
        {},
        {
          fulfilment_status: "supplier_confirmed",
          fulfilment_finished_at: new Date().toISOString(),
          fulfilment_latency_ms: Date.now() - started,
          supplier: quote.supplier,
          supplier_reference: result.reference,
          supplier_order_id: result.reference,
          supplier_status: result.status || "CONFIRMED",
          ...(result.hotelConfirmation ? { hotel_confirmation_code: result.hotelConfirmation, supplierConfirmationNo: result.hotelConfirmation } : { supplierConfirmationNo: result.reference }),
          ...(result.voucherUrl ? { supplier_voucher_url: result.voucherUrl } : {}),
          net_total: quote.netTotal,
          net_currency: quote.currency,
        }
      );
      await updateHotelQuote(quote.id, { status: "consumed", bookingId: booking.id });
      supplyLogger.info({ bookingId: booking.id, supplier: quote.supplier, reference: result.reference, trigger: opts.trigger }, "hotel booking confirmed at supplier");
      void sendVoucher(booking.id).catch((err) => supplyLogger.warn({ err: String(err), bookingId: booking.id }, "voucher send failed"));
      return { status: "supplier_confirmed", supplierReference: result.reference };
    }

    supplyLogger.error({ bookingId: booking.id, supplier: quote.supplier, error: result.error, trigger: opts.trigger }, "supplier booking failed after payment");
    await patch(pb, booking, {}, { fulfilment_status: "supplier_failed", fulfilment_error: result.error.slice(0, 500), fulfilment_finished_at: new Date().toISOString(), fulfilment_latency_ms: Date.now() - started });
    await updateHotelQuote(quote.id, { status: "failed", bookingId: booking.id, error: result.error.slice(0, 500) });
    return await autoRefund(pb, booking.id, result.error);
  } finally {
    await cacheDel(lockKey);
  }
}

/** Supplier refused after we took the money → refund automatically and alert the admin. */
async function autoRefund(pb: PocketBase, bookingId: string, reason: string): Promise<FulfilmentResult> {
  let booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
  const snap = snapshotOf(booking);
  const isIyzico = Boolean(booking.iyzico_payment_id || booking.iyzico_token || snap.iyzico_payment_id || snap.iyzico_token);
  await createAdminNotification({
    type: "booking",
    body_ar: `فشل تأكيد حجز الفندق لدى المورد بعد الدفع — ${booking.hotel_name} — ${reason.slice(0, 120)}`,
    href: "/admin/bookings",
    meta: { bookingId, source: "hotel", kind: "supplier_failed", reason: reason.slice(0, 300) },
  });
  if (!isIyzico) {
    await patch(pb, booking, {}, { fulfilment_status: "refund_pending", refund_reason: reason.slice(0, 300) });
    return { status: "refund_pending", error: reason };
  }
  try {
    const { refundIyzicoBooking } = await import("@/lib/server/iyzico-bookings");
    const res = await refundIyzicoBooking({ bookingId });
    booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    if (res.ok) {
      await patch(pb, booking, { status: "cancelled" }, { fulfilment_status: "refunded", refund_reason: reason.slice(0, 300), refunded_at: new Date().toISOString() });
      return { status: "refunded", error: reason };
    }
    await patch(pb, booking, {}, { fulfilment_status: "refund_failed", refund_reason: reason.slice(0, 300), refund_error: String(res.error || "").slice(0, 300) });
    await createAdminNotification({ type: "booking", body_ar: `تعذّر الاسترداد التلقائي لحجز ${booking.hotel_name} — تدخل يدوي مطلوب`, href: "/admin/bookings", meta: { bookingId, source: "hotel", kind: "refund_failed" } });
    return { status: "refund_failed", error: res.error || reason };
  } catch (err) {
    await patch(pb, booking, {}, { fulfilment_status: "refund_failed", refund_reason: reason.slice(0, 300), refund_error: String(err).slice(0, 300) });
    return { status: "refund_failed", error: String(err) };
  }
}

/* ------------------------------------------------------------------------------------------------ */

/** Mails the real voucher (supplier reference, hotel confirmation, room, board, cancellation terms). */
export async function sendVoucher(bookingId: string): Promise<boolean> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return false;
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
  const snap = snapshotOf(booking);
  if (snap.fulfilment_status !== "supplier_confirmed" && snap.fulfilment_status !== "voucher_sent") return false;
  if (snap.email_voucher_sent) return true;
  const to = String(booking.customer_email || "").trim();
  if (!to) return false;

  const [{ resolveOfficialInvoice }, { buildHotelVoucherModelFromInvoice, renderHotelVoucherHtml }, { renderHtmlToPdf }, { sendMail }, { getEmailBrand }] = await Promise.all([
    import("@/lib/server/invoice-resolver"),
    import("@/lib/pdf/hotel-voucher-html"),
    import("@/lib/pdf/program-pdf"),
    import("@/lib/server/email/send"),
    import("@/lib/server/email/brand"),
  ]);
  const invoice = await resolveOfficialInvoice(booking.id);
  if (!invoice) return false;
  const model = buildHotelVoucherModelFromInvoice(invoice, null);
  const locale = String(snap.locale || "ar");
  const html = renderHotelVoucherHtml(model, locale);
  let pdf: Buffer | null = null;
  try {
    pdf = await renderHtmlToPdf(html);
  } catch {
    pdf = null;
  }
  const brand = await getEmailBrand().catch(() => null);
  const brandName = (brand as { name?: string } | null)?.name || "Lonaliza";
  const ar = locale === "ar";
  const ref = String(snap.hotel_confirmation_code || snap.supplier_reference || "");
  const subject = ar ? `قسيمة حجز الفندق — ${booking.hotel_name}` : `Hotel voucher — ${booking.hotel_name}`;
  const body = `<div dir="${ar ? "rtl" : "ltr"}" style="font-family:system-ui,Segoe UI,Tahoma,sans-serif;font-size:15px;color:#0f172a;line-height:1.7">
    <p>${ar ? `مرحباً ${booking.customer_name}،` : `Hello ${booking.customer_name},`}</p>
    <p>${ar ? "تم تأكيد حجزك لدى الفندق. تجدون قسيمة الحجز الرسمية مرفقة بهذه الرسالة." : "Your hotel reservation is confirmed. The official voucher is attached."}</p>
    <table style="border-collapse:collapse;margin:12px 0">
      <tr><td style="padding:4px 12px;color:#64748b">${ar ? "الفندق" : "Hotel"}</td><td style="padding:4px 12px;font-weight:700">${booking.hotel_name}</td></tr>
      <tr><td style="padding:4px 12px;color:#64748b">${ar ? "الغرفة" : "Room"}</td><td style="padding:4px 12px">${booking.room_name || "—"}</td></tr>
      <tr><td style="padding:4px 12px;color:#64748b">${ar ? "الوصول / المغادرة" : "Check-in / out"}</td><td style="padding:4px 12px">${booking.check_in} → ${booking.check_out}</td></tr>
      <tr><td style="padding:4px 12px;color:#64748b">${ar ? "رقم التأكيد" : "Confirmation"}</td><td style="padding:4px 12px;font-family:monospace;font-weight:700">${ref || "—"}</td></tr>
    </table>
    <p style="color:#64748b;font-size:13px">${brandName}</p>
  </div>`;
  const sent = await sendMail({
    to,
    toName: booking.customer_name,
    subject,
    html: body,
    attachments: pdf ? [{ filename: `lonaliza-voucher-${booking.id}.pdf`, content: pdf, contentType: "application/pdf" }] : [],
    listUnsubscribe: false,
    locale,
  });
  if (!sent.ok) return false;
  await patch(pb, booking, {}, { fulfilment_status: "voucher_sent", email_voucher_sent: new Date().toISOString(), voucher_html_ready: true });
  return true;
}

/* ------------------------------------------------------------------------------------------------ */

export type CancelResult = { ok: true; penalty?: number; currency?: string; supplierStatus: string } | { ok: false; error: string };

/** Unified supplier cancellation for the four hotel suppliers. */
export async function cancelHotelBookingAtSupplier(bookingId: string, opts: { simulate?: boolean } = {}): Promise<CancelResult> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, error: "pocketbase_unavailable" };
  const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
  const snap = snapshotOf(booking);
  const supplier = String(snap.supplier || booking.provider || "");
  const reference = String(snap.supplier_reference || snap.supplier_order_id || "");
  if (!reference) return { ok: false, error: "no_supplier_reference" };
  if (snap.fulfilment_status === "cancelled") return { ok: true, supplierStatus: "already_cancelled" };

  let result: CancelResult;
  try {
    switch (supplier) {
      case "hotelbeds": {
        const r = await new HotelbedsHotelAdapter().cancelReservation(reference, Boolean(opts.simulate));
        result = r.ok ? { ok: true, penalty: r.penalty, currency: r.currency, supplierStatus: opts.simulate ? "simulated" : "cancelled" } : { ok: false, error: r.error || "cancel_failed" };
        break;
      }
      case "ratehawk": {
        if (opts.simulate) return { ok: true, supplierStatus: "simulation_unsupported" };
        const r = await new RateHawkHotelAdapter().cancelReservation(reference);
        result = r.ok ? { ok: true, penalty: r.penaltyAmount != null ? Number(r.penaltyAmount) : undefined, currency: r.penaltyCurrency, supplierStatus: "cancelled" } : { ok: false, error: r.error || "cancel_failed" };
        break;
      }
      case "travelport":
      case "travelport_hotels": {
        if (opts.simulate) return { ok: true, supplierStatus: "simulation_unsupported" };
        const r = await new TravelportHotelAdapter().cancelReservation(reference);
        result = r.ok ? { ok: true, supplierStatus: "cancelled" } : { ok: false, error: r.error || "cancel_failed" };
        break;
      }
      case "seeru":
      case "seeru_hotels": {
        if (opts.simulate) return { ok: true, supplierStatus: "simulation_unsupported" };
        const r = await new SeeruHotelAdapter().cancelReservation(reference);
        result = r.ok ? { ok: true, supplierStatus: "cancelled" } : { ok: false, error: r.message || "cancel_failed" };
        break;
      }
      default:
        return { ok: false, error: "unsupported_supplier" };
    }
  } catch (err) {
    result = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  if (result.ok && !opts.simulate) {
    await patch(pb, booking, { status: "cancelled" }, { fulfilment_status: "cancelled", supplier_cancelled_at: new Date().toISOString(), supplier_cancel_penalty: result.penalty ?? 0, supplier_cancel_currency: result.currency || "" });
  }
  return result;
}
