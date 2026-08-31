import { NextRequest, NextResponse } from "next/server";
import { detectInvoiceService, invoiceServicePath } from "@/lib/booking-service";
import { applyIyzicoResultToBooking, bookingChargedAmount } from "@/lib/server/iyzico-bookings";
import { retrieveCheckout } from "@/lib/server/iyzico";
import { getIyzicoMerchantUrls } from "@/lib/server/payments-settings";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { ensureBookingConfirmToken } from "@/lib/server/hotel-booking-confirm";

export const runtime = "nodejs";

/**
 * Checkout Form callbackUrl — iyzico POSTs `token` here after the guest pays.
 * Official next step: retrieve `/payment/iyzipos/checkoutform/auth/ecom/detail`.
 * Redirect the browser to our confirmation page with booking id + confirm token.
 */
async function handleCallback(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const url = new URL(req.url);
  const token = String(form?.get("token") || url.searchParams.get("token") || "").trim();
  const conversationId = String(
    form?.get("conversationId") || url.searchParams.get("conversationId") || ""
  ).trim();

  const urls = await getIyzicoMerchantUrls();

  const redirect = async (
    payment: "paid" | "failed" | "pending",
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
    return NextResponse.redirect(`${urls.origin}${invoiceServicePath(service)}?${q.toString()}`, { status: 303 });
  };

  if (!token) return redirect("failed");

  let chargedAmount: number | undefined;
  let record: HotelBookingRecord | null = null;
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      record = conversationId
        ? await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(conversationId)
        : await pb.collection("hotel_bookings").getFirstListItem<HotelBookingRecord>(
            `iyzico_token = "${token.replace(/"/g, '\\"')}"`
          );
      chargedAmount = bookingChargedAmount(record);
    } catch {
      /* retrieve still runs; amount match skipped if unknown */
    }
  }

  const retrieved = await retrieveCheckout(token, conversationId || undefined, chargedAmount);
  const applied = await applyIyzicoResultToBooking({
    retrieved,
    token,
    conversationId: conversationId || retrieved.conversationId,
  });

  const bookingId = applied.bookingId || conversationId || retrieved.conversationId;
  if (!record && pb && bookingId) {
    try {
      record = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    } catch {
      record = null;
    }
  }
  if (retrieved.paid) return redirect("paid", bookingId, record);
  if (retrieved.pendingReview) return redirect("pending", bookingId, record);
  return redirect("failed", bookingId, record);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

export async function GET(req: NextRequest) {
  return handleCallback(req);
}
