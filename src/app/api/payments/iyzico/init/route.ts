import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { mapGuestCheckoutError } from "@/lib/iyzico-limits";
import { createCheckout } from "@/lib/server/iyzico";
import { persistCheckoutCharge } from "@/lib/server/iyzico-bookings";
import { getIyzicoMerchantUrls, getIyzicoSecrets } from "@/lib/server/payments-settings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestCustomer(req);
    if (!user) {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    const secrets = await getIyzicoSecrets();
    if (!secrets.enabled || !secrets.apiKey || !secrets.secretKey) {
      return NextResponse.json({ ok: false, error: "iyzico_not_configured" }, { status: 400 });
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const bookingId = String(body.bookingId || "").trim();
    if (!bookingId) {
      return NextResponse.json({ ok: false, error: "booking_required" }, { status: 400 });
    }

    const pb = await tryCreateAdminPocketBase();
    if (!pb) {
      return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });
    }

    const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    if (booking.user && booking.user !== user.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const { callbackUrl } = await getIyzicoMerchantUrls();
    const amount = Number(body.amount || booking.price || 0);
    const currency = String(body.currency || booking.currency || "USD");
    const fullName = String(body.name || booking.customer_name || user.name || "Guest");
    const parts = fullName.trim().split(/\s+/);
    const countryCode = String(body.countryCode || "").trim();
    const country = String(body.country || (countryCode === "+90" ? "Turkey" : "")).trim();
    const result = await createCheckout({
      bookingId: booking.id,
      conversationId: booking.id,
      price: amount,
      currency,
      hotelName: booking.hotel_name,
      roomName: booking.room_name || "",
      callbackUrl,
      buyer: {
        id: user.id,
        name: String(body.firstName || parts[0] || fullName),
        surname: String(body.lastName || parts.slice(1).join(" ") || "Guest"),
        email: String(body.email || booking.customer_email || user.email || ""),
        phone: String(body.phone || booking.customer_phone || ""),
        identityNumber: String(body.identityNumber || "").trim() || undefined,
        city: String(body.city || ""),
        country,
        address: String(body.address || ""),
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
      },
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: mapGuestCheckoutError(result.error, result.errorCode),
          errorCode: result.errorCode,
        },
        { status: 400 }
      );
    }

    if (result.charge) {
      try {
        await persistCheckoutCharge({
          bookingId: booking.id,
          token: result.token,
          charge: result.charge,
        });
      } catch {
        /* form still usable */
      }
    }

    return NextResponse.json({
      ok: true,
      token: result.token,
      paymentPageUrl: result.paymentPageUrl,
      checkoutFormContent: result.checkoutFormContent,
      chargedAmount: result.charge?.chargedAmount,
      chargedCurrency: result.charge?.chargedCurrency,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "iyzico_init_failed";
    const safe = /tunnel|ECONNREFUSED|ECONNRESET|ETIMEDOUT/i.test(message)
      ? "iyzico_network"
      : "iyzico_init_failed";
    return NextResponse.json({ ok: false, error: safe }, { status: 400 });
  }
}
