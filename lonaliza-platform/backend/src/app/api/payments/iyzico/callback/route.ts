import { NextRequest, NextResponse } from "next/server";
import { detectInvoiceService, invoiceServicePath } from "@/lib/booking-service";
import { applyIyzicoResultToBooking, bookingChargedAmount } from "@/lib/server/iyzico-bookings";
import { completeThreedsPayment, retrieveCheckout } from "@/lib/server/iyzico";
import { getIyzicoMerchantUrls } from "@/lib/server/payments-settings";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { ensureBookingConfirmToken } from "@/lib/server/hotel-booking-confirm";

export const runtime = "nodejs";

function threeDsResultHtml(input: {
  origin: string;
  redirect: string;
  payment: "pending" | "failed";
  bookingId: string;
}): string {
  const payload = JSON.stringify({
    source: "lonaliza-iyzico-3ds",
    status: "complete",
    payment: input.payment,
    bookingId: input.bookingId,
  });
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lonaliza</title></head>
<body style="font-family:system-ui,sans-serif;background:#f8f5ff;color:#2e1065;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<p>جارٍ إغلاق التحقق الآمن…</p>
<script>
(function () {
  var payload = ${payload};
  try { window.parent.postMessage(payload, ${JSON.stringify(input.origin)}); } catch (e) {}
  try { window.parent.postMessage(payload, '*'); } catch (e) {}
  try { if (window.top && window.top !== window) window.top.postMessage(payload, ${JSON.stringify(input.origin)}); } catch (e) {}
  try { if (window.top && window.top !== window) window.top.postMessage(payload, '*'); } catch (e) {}
  if (window.parent === window) location.replace(${JSON.stringify(input.redirect)});
})();
</script>
</body>
</html>`;
}

/**
 * 3DS ACS callback (and leftover Checkout Form token posts).
 * Completes 3DS auth but NEVER promotes the booking to paid — webhook only.
 */
async function handleCallback(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const url = new URL(req.url);
  const token = String(form?.get("token") || url.searchParams.get("token") || "").trim();
  const paymentId = String(form?.get("paymentId") || url.searchParams.get("paymentId") || "").trim();
  const conversationData = String(form?.get("conversationData") || url.searchParams.get("conversationData") || "").trim();
  const conversationId = String(
    form?.get("conversationId") || url.searchParams.get("conversationId") || ""
  ).trim();
  const mdStatus = String(form?.get("mdStatus") || url.searchParams.get("mdStatus") || "").trim();

  const urls = await getIyzicoMerchantUrls();

  const finish = async (
    payment: "failed" | "pending",
    bookingId?: string,
    record?: HotelBookingRecord | null
  ) => {
    const q = new URLSearchParams();
    q.set("payment", payment);
    const id = String(bookingId || conversationId || "").trim();
    if (id) {
      q.set("booking", id);
      const confirm = await ensureBookingConfirmToken(id);
      if (confirm) q.set("confirm", confirm);
    }
    const service = detectInvoiceService({
      provider: record?.provider,
      hotel_id: record?.hotel_id,
      offer_snapshot: record?.offer_snapshot,
    });
    const redirect = `${urls.origin}${invoiceServicePath(service)}?${q.toString()}`;
    const html = threeDsResultHtml({ origin: urls.origin, redirect, payment, bookingId: id });
    return new NextResponse(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  };

  let record: HotelBookingRecord | null = null;
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      record = conversationId
        ? await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(conversationId)
        : paymentId
          ? await pb.collection("hotel_bookings").getFirstListItem<HotelBookingRecord>(
              `iyzico_payment_id = "${paymentId.replace(/"/g, '\\"')}"`
            )
          : token
            ? await pb.collection("hotel_bookings").getFirstListItem<HotelBookingRecord>(
                `iyzico_token = "${token.replace(/"/g, '\\"')}"`
              )
            : null;
    } catch {
      record = null;
    }
  }

  if (paymentId) {
    const mdOk = !mdStatus || mdStatus === "1";
    if (!mdOk) {
      await applyIyzicoResultToBooking({
        retrieved: {
          ok: false,
          paid: false,
          pendingReview: false,
          paymentStatus: "failed",
          paymentId,
          conversationId,
          signatureValid: null,
          error: "3ds_failed",
        },
        conversationId,
        source: "threeds",
      });
      return finish("failed", conversationId || record?.id, record);
    }
    const retrieved = await completeThreedsPayment({
      paymentId,
      conversationId: conversationId || record?.id,
      conversationData,
    });
    const applied = await applyIyzicoResultToBooking({
      retrieved,
      conversationId: conversationId || retrieved.conversationId,
      source: "threeds",
    });
    const bookingId = applied.bookingId || conversationId || retrieved.conversationId;
    return finish(retrieved.ok ? "pending" : "failed", bookingId, record);
  }

  if (!token) return finish("failed");

  let chargedAmount: number | undefined;
  if (record) chargedAmount = bookingChargedAmount(record);

  const retrieved = await retrieveCheckout(token, conversationId || undefined, chargedAmount);
  const applied = await applyIyzicoResultToBooking({
    retrieved,
    token,
    conversationId: conversationId || retrieved.conversationId,
    source: "callback",
  });

  const bookingId = applied.bookingId || conversationId || retrieved.conversationId;
  if (!record && pb && bookingId) {
    try {
      record = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    } catch {
      record = null;
    }
  }
  if (retrieved.pendingReview) return finish("pending", bookingId, record);
  if (retrieved.ok) return finish("pending", bookingId, record);
  return finish("failed", bookingId, record);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

export async function GET(req: NextRequest) {
  return handleCallback(req);
}
