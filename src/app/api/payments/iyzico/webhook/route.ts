import { NextRequest, NextResponse } from "next/server";
import { applyIyzicoResultToBooking, bookingChargedAmount } from "@/lib/server/iyzico-bookings";
import {
  retrieveCheckout,
  retrievePayment,
  verifyWebhookSignatureV3,
  webhookHeaderV3,
  type IyzicoWebhookBody,
} from "@/lib/server/iyzico";
import { getIyzicoSecrets } from "@/lib/server/payments-settings";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";

export const runtime = "nodejs";

/**
 * Official merchant notification URL (not the Checkout Form callbackUrl).
 * Paste in iyzico panel: Settings → Merchant Settings → Merchant Notifications.
 * https://docs.iyzico.com/en/advanced/webhook
 *
 * iyzico POSTs JSON and retries until this route returns 2xx (max 3 attempts).
 */
function jsonOk(): NextResponse {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  return jsonOk();
}

export async function POST(req: NextRequest) {
  let body: IyzicoWebhookBody = {};
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      body = (await req.json()) as IyzicoWebhookBody;
    } else {
      const form = await req.formData().catch(() => null);
      if (form) {
        body = {
          token: String(form.get("token") || ""),
          status: String(form.get("status") || ""),
          paymentId: String(form.get("paymentId") || ""),
          iyziPaymentId: String(form.get("iyziPaymentId") || ""),
          paymentConversationId: String(form.get("paymentConversationId") || ""),
          iyziEventType: String(form.get("iyziEventType") || ""),
          iyziEventTime: String(form.get("iyziEventTime") || ""),
          iyziReferenceCode: String(form.get("iyziReferenceCode") || ""),
          merchantId: String(form.get("merchantId") || ""),
        };
      } else {
        body = (await req.json()) as IyzicoWebhookBody;
      }
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const secrets = await getIyzicoSecrets();
  const signatureHeader = webhookHeaderV3(req);
  if (
    !signatureHeader ||
    !secrets.secretKey ||
    !verifyWebhookSignatureV3(secrets.secretKey, signatureHeader, body)
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const status = String(body.status || "").toUpperCase();
  const eventType = String(body.iyziEventType || "");
  const token = String(body.token || "").trim();
  const conversationId = String(body.paymentConversationId || "").trim();

  const terminal =
    status === "SUCCESS" ||
    status === "FAILURE" ||
    eventType === "CHECKOUT_FORM_AUTH" ||
    eventType === "PWI_TKN_AUTH" ||
    eventType === "PWI_TKN_THREEDS_AUTH" ||
    eventType === "API_AUTH" ||
    eventType === "THREE_DS_AUTH";

  if (!terminal) {
    return jsonOk();
  }

  let chargedAmount: number | undefined;
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      const booking = conversationId
        ? await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(conversationId)
        : token
          ? await pb.collection("hotel_bookings").getFirstListItem<HotelBookingRecord>(
              `iyzico_token = "${token.replace(/"/g, '\\"')}"`
            )
          : null;
      if (booking) chargedAmount = bookingChargedAmount(booking);
    } catch {
      /* amount match skipped if booking not found yet */
    }
  }

  if (token) {
    const retrieved = await retrieveCheckout(token, conversationId || undefined, chargedAmount);
    await applyIyzicoResultToBooking({
      retrieved,
      token,
      conversationId,
      webhookStatus: status,
      webhookEventType: eventType,
    });
    return jsonOk();
  }

  const paymentId = String(body.iyziPaymentId ?? body.paymentId ?? "").trim();
  if (paymentId && (status === "SUCCESS" || status === "FAILURE")) {
    const retrieved = await retrievePayment(paymentId, conversationId || undefined, chargedAmount);
    await applyIyzicoResultToBooking({
      retrieved,
      conversationId,
      webhookStatus: status,
      webhookEventType: eventType,
    });
    return jsonOk();
  }

  if (signatureHeader && (status === "SUCCESS" || status === "FAILURE")) {
    await applyIyzicoResultToBooking({
      retrieved: {
        ok: true,
        paid: status === "SUCCESS",
        pendingReview: false,
        paymentStatus: status,
        paymentId: String(body.iyziPaymentId ?? body.paymentId ?? ""),
        conversationId,
        signatureValid: true,
      },
      conversationId,
      webhookStatus: status,
      webhookEventType: eventType,
    });
  }

  return jsonOk();
}
