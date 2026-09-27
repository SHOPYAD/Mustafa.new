import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { mapGuestCheckoutError } from "@/lib/iyzico-limits";
import { createCheckout, initializeThreedsPayment } from "@/lib/server/iyzico";
import { persistCheckoutCharge } from "@/lib/server/iyzico-bookings";
import { getIyzicoMerchantUrls } from "@/lib/server/payments-settings";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { getServerEnv } from "@/lib/server/env-store";
import { resolveGatewayForTenant } from "@/lib/server/payment-gateways-store";
import { digitsOnly } from "@/lib/payments/card-fields";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestCustomer(req);
    if (!user) {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
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

    let bookingName = "Travel Service Booking";
    let roomOrDesc = "Booking Reservation";
    let customerName = user.name || "Guest";
    let customerEmail = user.email || "";
    let customerPhone = "";
    let bookingPrice = Number(body.amount || 0);
    let bookingCurrency = String(body.currency || "USD");
    let validBookingId = bookingId;
    let hotelBookingFound = false;
    let bookingTenantId: string | undefined = undefined;

    // 1. Try hotel_bookings
    try {
      const hotelBooking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
      if (hotelBooking) {
        hotelBookingFound = true;
        if (hotelBooking.status === "paid" || hotelBooking.status === "cancelled") {
          return NextResponse.json(
            { ok: false, error: "booking_not_payable", errorCode: "booking_not_payable" },
            { status: 409 }
          );
        }
        const snap = (hotelBooking.offer_snapshot || {}) as Record<string, unknown>;
        if (snap.quote_id) {
          const { getHotelQuote, quoteIsUsable } = await import("@/lib/server/hotels/quote-service");
          const quote = await getHotelQuote(String(snap.quote_id));
          const usable = quote ? quoteIsUsable(quote) : { ok: false as const, reason: "expired" as const };
          if (!usable.ok) {
            return NextResponse.json(
              { ok: false, error: `quote_${usable.reason}`, errorCode: `quote_${usable.reason}` },
              { status: 409 }
            );
          }
        }
        if (hotelBooking.user && hotelBooking.user !== user.id) {
          return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
        }
        bookingName = hotelBooking.hotel_name || "Hotel Booking";
        roomOrDesc = hotelBooking.room_name || "Hotel Room";
        customerName = hotelBooking.customer_name || customerName;
        customerEmail = hotelBooking.customer_email || customerEmail;
        customerPhone = hotelBooking.customer_phone || "";
        bookingPrice = hotelBooking.price || bookingPrice;
        bookingCurrency = hotelBooking.currency || bookingCurrency;
        validBookingId = hotelBooking.id;

        // Extract tenant if assigned to reseller
        const resellerId = (hotelBooking as Record<string, unknown>).reseller_id || snap.reseller_id;
        if (resellerId) bookingTenantId = String(resellerId);
      }
    } catch {
      // 2. Try enquiry_bookings
      try {
        const enquiryBooking = await pb.collection("enquiry_bookings").getOne(bookingId);
        if (enquiryBooking) {
          bookingName = String((enquiryBooking as Record<string, unknown>).service_name || "Flight Booking");
          roomOrDesc = String((enquiryBooking as Record<string, unknown>).destination || "Flight Ticket");
          customerName = String((enquiryBooking as Record<string, unknown>).customer_name || customerName);
          customerEmail = String((enquiryBooking as Record<string, unknown>).customer_email || customerEmail);
          customerPhone = String((enquiryBooking as Record<string, unknown>).customer_phone || "");
          validBookingId = enquiryBooking.id;
          if ((enquiryBooking as Record<string, unknown>).reseller_id) {
            bookingTenantId = String((enquiryBooking as Record<string, unknown>).reseller_id);
          }
        }
      } catch {
        // 3. Try Flight session store
        try {
          const { getFlightBooking } = await import("@/lib/server/flights-bookings");
          const flightBooking = await getFlightBooking(bookingId);
          if (flightBooking) {
            bookingName = `Flight: ${flightBooking.contact?.name || "Booking"}`;
            roomOrDesc = "Flight Ticket";
            customerName = flightBooking.contact?.name || customerName;
            customerEmail = flightBooking.contact?.email || customerEmail;
            customerPhone = flightBooking.contact?.phone || "";
            bookingPrice = flightBooking.price?.client || flightBooking.price?.base || bookingPrice;
            bookingCurrency = flightBooking.price?.currency || bookingCurrency;
            validBookingId = flightBooking.id;
          }
        } catch {
          /* proceed with body parameters */
        }
      }
    }

    const amount = hotelBookingFound ? bookingPrice : Number(body.amount || bookingPrice || 1);
    const currency = hotelBookingFound ? bookingCurrency : String(body.currency || bookingCurrency || "USD");
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
    }

    // Determine tenant: body -> header -> booking record -> 'platform'
    const requestedTenant =
      String(body.tenantId || "").trim() ||
      req.headers.get("x-tenant-id")?.trim() ||
      bookingTenantId ||
      "platform";

    const requestedGatewayKind = body.gatewayKind ? String(body.gatewayKind).trim() : undefined;

    // Resolve tenant gateway instance
    const resolved = await resolveGatewayForTenant(requestedTenant, requestedGatewayKind);
    const { kind, instance, testMode, tenantId } = resolved;

    const origin = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
    const fullName = String(body.name || customerName || user.name || "Guest");
    const parts = fullName.trim().split(/\s+/);
    const countryCode = String(body.countryCode || "").trim();
    const country = String(body.country || (countryCode === "+90" ? "Turkey" : "TR")).trim();

    // CARD PARAMS (if provided)
    const cardObj = body.card && typeof body.card === "object" ? (body.card as Record<string, unknown>) : null;
    const cardParams = cardObj
      ? {
          cardHolderName: String(cardObj.cardHolderName || body.cardHolderName || fullName).trim(),
          cardNumber: digitsOnly(String(cardObj.cardNumber || body.cardNumber || "")),
          expireMonth: String(cardObj.expireMonth || body.expireMonth || "").padStart(2, "0").slice(-2),
          expireYear: String(cardObj.expireYear || body.expireYear || "").trim(),
          cvc: digitsOnly(String(cardObj.cvc || body.cvc || "")),
        }
      : undefined;

    // If resolved gateway is iyzico, execute native iyzico checkout
    if (kind === "iyzico") {
      const { callbackUrl } = await getIyzicoMerchantUrls();
      const result = await createCheckout({
        bookingId: validBookingId,
        conversationId: validBookingId,
        price: amount,
        currency,
        hotelName: bookingName,
        roomName: roomOrDesc || "Standard",
        callbackUrl,
        buyer: {
          id: user.id,
          name: String(body.firstName || parts[0] || fullName),
          surname: String(body.lastName || parts.slice(1).join(" ") || "Guest"),
          email: String(body.email || customerEmail || user.email || ""),
          phone: String(body.phone || customerPhone || ""),
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
            bookingId: validBookingId,
            token: result.token,
            charge: result.charge,
          });
        } catch {
          /* pass */
        }
      }

      return NextResponse.json({
        ok: true,
        gateway: "iyzico",
        token: result.token,
        paymentPageUrl: result.paymentPageUrl,
        redirectUrl: result.paymentPageUrl,
        checkoutFormContent: result.checkoutFormContent,
        chargedAmount: result.charge?.chargedAmount,
        chargedCurrency: result.charge?.chargedCurrency,
        testMode,
        tenantId,
      });
    }

    // For any of the 48+ other payment gateways: invoke createPayment on adapter
    const callbackUrl = `${origin}/api/payments/${kind}/callback?bookingId=${encodeURIComponent(validBookingId)}&tenant=${encodeURIComponent(tenantId)}`;
    const successUrl = `${origin}/api/payments/${kind}/callback?bookingId=${encodeURIComponent(validBookingId)}&status=success&tenant=${encodeURIComponent(tenantId)}`;
    const failureUrl = `${origin}/api/payments/${kind}/callback?bookingId=${encodeURIComponent(validBookingId)}&status=failed&tenant=${encodeURIComponent(tenantId)}`;

    const paymentResult = await instance.createPayment({
      orderId: validBookingId,
      amount,
      currency,
      subdomain: tenantId,
      customer: {
        name: fullName,
        firstName: String(body.firstName || parts[0] || fullName),
        lastName: String(body.lastName || parts.slice(1).join(" ") || "Guest"),
        email: String(body.email || customerEmail || user.email || ""),
        phone: String(body.phone || customerPhone || ""),
        customerId: user.id,
      },
      billingAddress: {
        country: country.length === 2 ? country.toUpperCase() : "TR",
        city: String(body.city || "Istanbul"),
        line1: String(body.address || "Central"),
      },
      paymentCard: cardParams,
      successUrl,
      failureUrl,
      callbackUrl,
      metadata: {
        bookingId: validBookingId,
        tenantId,
        service: bookingName,
      },
      checkoutChannel: "redirect",
    });

    return NextResponse.json({
      ok: true,
      gateway: kind,
      gatewayId: paymentResult.gatewayId,
      status: paymentResult.status,
      paymentPageUrl: paymentResult.redirectUrl,
      redirectUrl: paymentResult.redirectUrl,
      clientSecret: paymentResult.clientSecret,
      checkoutFormContent: paymentResult.embeddedHtml,
      chargedAmount: amount,
      chargedCurrency: currency,
      testMode,
      tenantId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "payment_init_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
