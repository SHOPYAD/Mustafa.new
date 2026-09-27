import { NextRequest, NextResponse } from "next/server";
import { resolveGatewayForTenant } from "@/lib/server/payment-gateways-store";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { ensureBookingConfirmToken } from "@/lib/server/hotel-booking-confirm";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook endpoint active" });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ gateway: string }> }
) {
  const { gateway: gatewayKind } = await context.params;
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenant") || req.headers.get("x-tenant-id") || "platform";

  try {
    const rawBody = await req.text();
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      // Form URL-encoded fallback
      const searchParams = new URLSearchParams(rawBody);
      const obj: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        obj[k] = v;
      });
      parsedBody = Object.keys(obj).length > 0 ? obj : rawBody;
    }

    const headersMap: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headersMap[key.toLowerCase()] = val;
    });

    const { instance } = await resolveGatewayForTenant(tenantId, gatewayKind);
    const event = instance.parseWebhookEvent(parsedBody, headersMap);

    const bookingId = event.orderId || "";
    const isPaid =
      event.type === "payment.paid" ||
      event.type === "payment.captured" ||
      event.status === "paid" ||
      event.status === "captured";

    if (bookingId && isPaid) {
      const pb = await tryCreateAdminPocketBase();
      if (pb) {
        // Try hotel_bookings
        try {
          const hotel = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
          if (hotel) {
            const snap = (hotel.offer_snapshot || {}) as Record<string, unknown>;
            await pb.collection("hotel_bookings").update(bookingId, {
              status: "paid",
              payment_status: "paid",
              payment_method: gatewayKind,
              offer_snapshot: {
                ...snap,
                paidGateway: gatewayKind,
                gatewayPaymentId: event.gatewayPaymentId,
                paidAmount: event.amount,
                paidCurrency: event.currency,
                paidAt: new Date().toISOString(),
              },
            });
            await ensureBookingConfirmToken(bookingId);
          }
        } catch {
          // Try enquiry_bookings
          try {
            await pb.collection("enquiry_bookings").update(bookingId, {
              status: "paid",
              payment_status: "paid",
              payment_method: gatewayKind,
            });
          } catch {
            /* ignore if not found */
          }
        }
      }
    }

    // Provider-specific acknowledgments
    if (gatewayKind === "paytr") {
      return new NextResponse("OK", { status: 200 });
    }

    return NextResponse.json({ ok: true, received: true, eventId: event.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "webhook_processing_failed";
    // Return 200 for idempotent handling if signature missing in test mode, otherwise 400
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
