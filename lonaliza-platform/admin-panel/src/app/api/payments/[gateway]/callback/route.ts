import { NextRequest, NextResponse } from "next/server";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { getServerEnv } from "@/lib/server/env-store";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { ensureBookingConfirmToken } from "@/lib/server/hotel-booking-confirm";
import { detectInvoiceService, invoiceServicePath } from "@/lib/booking-service";

export const runtime = "nodejs";

function completionResultHtml(input: {
  origin: string;
  redirect: string;
  payment: "paid" | "failed" | "pending";
  bookingId: string;
  gateway: string;
}): string {
  const payload = JSON.stringify({
    source: `lonaliza-${input.gateway}-redirect`,
    status: "complete",
    payment: input.payment,
    bookingId: input.bookingId,
  });

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lonaliza Payments</title></head>
<body style="font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;background:#f8f5ff;color:#2e1065;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<div style="text-align:center;padding:2rem;background:#ffffff;border-radius:1rem;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);max-width:400px;width:90%">
  <div style="font-size:2rem;margin-bottom:1rem">${input.payment === "failed" ? "⚠️" : "✅"}</div>
  <h2 style="margin:0 0 0.5rem 0;font-size:1.25rem">${input.payment === "failed" ? "لم تكتمل عملية الدفع" : "تمت معالجة الدفع بنجاح"}</h2>
  <p style="color:#64748b;font-size:0.875rem;margin:0 0 1.5rem 0">جارٍ نقلك لتفاصيل الحجز…</p>
  <a href="${input.redirect}" style="display:inline-block;background:#051741;color:#ffffff;padding:0.625rem 1.25rem;border-radius:0.5rem;text-decoration:none;font-weight:bold;font-size:0.875rem">الانتقال الآن</a>
</div>
<script>
(function () {
  var payload = ${payload};
  try { window.parent.postMessage(payload, ${JSON.stringify(input.origin)}); } catch (e) {}
  try { window.parent.postMessage(payload, '*'); } catch (e) {}
  try { if (window.top && window.top !== window) window.top.postMessage(payload, ${JSON.stringify(input.origin)}); } catch (e) {}
  try { if (window.top && window.top !== window) window.top.postMessage(payload, '*'); } catch (e) {}
  setTimeout(function() {
    location.replace(${JSON.stringify(input.redirect)});
  }, 1200);
})();
</script>
</body>
</html>`;
}

async function handleCallback(
  req: NextRequest,
  context: { params: Promise<{ gateway: string }> }
) {
  const { gateway: gatewayKind } = await context.params;
  const form = await req.formData().catch(() => null);
  const url = new URL(req.url);

  const bookingId = String(
    form?.get("bookingId") ||
    url.searchParams.get("bookingId") ||
    url.searchParams.get("orderId") ||
    url.searchParams.get("conversationId") ||
    ""
  ).trim();

  const rawStatus = String(
    form?.get("status") ||
    url.searchParams.get("status") ||
    form?.get("payment_status") ||
    url.searchParams.get("payment_status") ||
    ""
  ).toLowerCase();

  const isFailed =
    rawStatus === "failed" ||
    rawStatus === "failure" ||
    rawStatus === "cancelled" ||
    rawStatus === "canceled";

  const paymentOutcome: "paid" | "failed" | "pending" = isFailed
    ? "failed"
    : rawStatus === "success" || rawStatus === "paid" || rawStatus === "completed"
      ? "paid"
      : "pending";

  const origin = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));

  let record: HotelBookingRecord | null = null;
  let confirmToken = "";

  if (bookingId) {
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      try {
        record = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
        if (record && paymentOutcome === "paid") {
          await pb.collection("hotel_bookings").update(bookingId, {
            status: "paid",
            payment_status: "paid",
            payment_method: gatewayKind,
          });
        }
      } catch {
        /* pass */
      }
    }
    confirmToken = await ensureBookingConfirmToken(bookingId);
  }

  const q = new URLSearchParams();
  q.set("payment", paymentOutcome);
  if (bookingId) {
    q.set("booking", bookingId);
    if (confirmToken) q.set("confirm", confirmToken);
  }

  const service = detectInvoiceService({
    provider: record?.provider,
    hotel_id: record?.hotel_id,
    offer_snapshot: record?.offer_snapshot,
  });

  const redirect = `${origin}${invoiceServicePath(service)}?${q.toString()}`;

  const html = completionResultHtml({
    origin,
    redirect,
    payment: paymentOutcome,
    bookingId,
    gateway: gatewayKind,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ gateway: string }> }
) {
  return handleCallback(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ gateway: string }> }
) {
  return handleCallback(req, context);
}
