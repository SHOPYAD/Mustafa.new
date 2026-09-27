import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createHmac, timingSafeEqual } from "crypto";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { createAdminNotification } from "@/lib/admin-notifications/server";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), ".data");
const LOG_FILE = path.join(DATA_DIR, "seeru-webhook-events.jsonl");

/**
 * Seeru order webhooks (hotels + flights). Every event is appended to the audit log, then the matching
 * booking is updated:
 *   hotel  → offer_snapshot.supplier_status / fulfilment_status / hotel_confirmation_code
 *   flight → handled by the flights booking store (order status + ticket numbers)
 *
 * When `SEERU_WEBHOOK_SECRET` is configured the `x-seeru-signature` HMAC-SHA256 of the raw body is verified.
 */
function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = String(process.env.SEERU_WEBHOOK_SECRET || "").trim();
  if (!secret) return true; // not configured → accept (events are still only status hints)
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const given = header.replace(/^sha256=/i, "").trim().toLowerCase();
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

type SeeruEvent = {
  orderId: string;
  status: string;
  reservationNo?: string;
  reason?: string;
  service: "hotel" | "flight" | "unknown";
};

function normalizeEvent(body: any): SeeruEvent {
  const payload = body?.payload || body?.data || body || {};
  const orderId = String(payload.order_id || payload.orderId || body?.order_id || body?.id || "").trim();
  const status = String(payload.status || body?.status || body?.event || "").toLowerCase();
  const reservationNo = String(payload.reservation_no || payload.reservationNo || payload.pnr || "").trim() || undefined;
  const reason = String(payload.failure_reason || payload.reason || payload.message || "").trim() || undefined;
  const type = String(body?.type || body?.service || payload.type || payload.service || "").toLowerCase();
  const service: SeeruEvent["service"] = /hotel/.test(type) ? "hotel" : /flight|air|ticket/.test(type) ? "flight" : payload.pnr ? "flight" : payload.reservation_no ? "hotel" : "unknown";
  return { orderId, status, reservationNo, reason, service };
}

async function applyToHotelBooking(ev: SeeruEvent): Promise<{ matched: boolean; bookingId?: string }> {
  if (!ev.orderId) return { matched: false };
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { matched: false };
  const rows = await pb
    .collection("hotel_bookings")
    .getList<HotelBookingRecord>(1, 5, { filter: pb.filter("provider ~ {:p} && offer_snapshot ~ {:o}", { p: "seeru", o: ev.orderId }) })
    .catch(() => null);
  const booking = rows?.items.find((b) => {
    const snap = (b.offer_snapshot || {}) as Record<string, unknown>;
    return String(snap.supplier_reference || snap.supplier_order_id || snap.seeru_order_id || "") === ev.orderId;
  });
  if (!booking) return { matched: false };
  const snap = { ...((booking.offer_snapshot || {}) as Record<string, unknown>) };
  const patch: Record<string, unknown> = {};
  const now = new Date().toISOString();
  const events = Array.isArray(snap.supplier_events) ? (snap.supplier_events as unknown[]).slice(-19) : [];
  events.push({ at: now, status: ev.status, reservationNo: ev.reservationNo, reason: ev.reason });
  const nextSnap: Record<string, unknown> = { ...snap, supplier_status: ev.status.toUpperCase(), supplier_events: events, supplier_last_webhook_at: now };

  if (ev.status === "ticketed" || ev.status === "confirmed") {
    if (ev.reservationNo) {
      nextSnap.hotel_confirmation_code = ev.reservationNo;
      nextSnap.supplierConfirmationNo = ev.reservationNo;
    }
    if (snap.fulfilment_status === "supplier_pending" || snap.fulfilment_status === "awaiting_payment") nextSnap.fulfilment_status = "supplier_confirmed";
  } else if (ev.status === "cancelled") {
    nextSnap.fulfilment_status = "cancelled";
    patch.status = "cancelled";
  } else if (ev.status === "error" || ev.status === "failed") {
    if (snap.fulfilment_status === "supplier_pending" || snap.fulfilment_status === "supplier_confirmed") {
      nextSnap.fulfilment_status = "supplier_failed";
      nextSnap.fulfilment_error = ev.reason || "seeru_webhook_error";
      await createAdminNotification({
        type: "booking",
        body_ar: `Seeru أبلغ عن فشل حجز الفندق ${booking.hotel_name} — ${ev.reason || ev.status}`,
        href: "/admin/bookings",
        meta: { bookingId: booking.id, source: "hotel", kind: "seeru_webhook_error" },
      });
    }
  }
  await pb.collection("hotel_bookings").update(booking.id, { ...patch, offer_snapshot: nextSnap });
  if (nextSnap.fulfilment_status === "supplier_confirmed" && snap.fulfilment_status !== "supplier_confirmed" && snap.fulfilment_status !== "voucher_sent") {
    void import("@/lib/server/hotels/fulfilment").then(({ sendVoucher }) => sendVoucher(booking.id)).catch(() => undefined);
  }
  return { matched: true, bookingId: booking.id };
}

async function applyToFlightBooking(ev: SeeruEvent): Promise<{ matched: boolean; bookingId?: string }> {
  if (!ev.orderId) return { matched: false };
  try {
    const mod = await import("@/lib/server/flights-bookings");
    const apply = (mod as Record<string, unknown>).applySupplierWebhook as
      | ((input: { supplier: string; orderId: string; status: string; reservationNo?: string; reason?: string }) => Promise<{ matched: boolean; bookingId?: string }>)
      | undefined;
    if (typeof apply === "function") return await apply({ supplier: "seeru", orderId: ev.orderId, status: ev.status, reservationNo: ev.reservationNo, reason: ev.reason });
  } catch {
    /* flights store not available */
  }
  return { matched: false };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = { raw: rawBody };
    }
    const signatureOk = verifySignature(rawBody, req.headers.get("x-seeru-signature") || req.headers.get("x-signature"));

    const ev = normalizeEvent(body);
    let result: { matched: boolean; bookingId?: string; service?: string } = { matched: false };
    if (signatureOk && ev.orderId) {
      if (ev.service !== "flight") result = { ...(await applyToHotelBooking(ev)), service: "hotel" };
      if (!result.matched && ev.service !== "hotel") result = { ...(await applyToFlightBooking(ev)), service: "flight" };
    }

    const eventRecord = {
      timestamp: new Date().toISOString(),
      type: "seeru_webhook",
      signatureOk,
      event: ev,
      result,
      headers: { "user-agent": req.headers.get("user-agent"), "content-type": req.headers.get("content-type") },
      body,
    };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, JSON.stringify(eventRecord) + "\n", "utf8");

    if (!signatureOk) return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    return NextResponse.json({ ok: true, received: true, matched: result.matched, timestamp: eventRecord.timestamp });
  } catch (err: any) {
    console.error("[Seeru Webhook Error]:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "seeru-webhook", status: "active" });
}
