import { NextRequest, NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { mapGuestCheckoutError } from "@/lib/iyzico-limits";
import { createCheckout } from "@/lib/server/iyzico";
import { persistCheckoutCharge } from "@/lib/server/iyzico-bookings";
import { getIyzicoMerchantUrls, getIyzicoSecrets } from "@/lib/server/payments-settings";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;
  const user = auth.customer;

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

  let bookingName = "Travel Service Booking";
  let roomOrDesc = "Booking Reservation";
  let customerName = user.name || "Guest";
  let customerEmail = user.email || "";
  let customerPhone = "";
  let bookingPrice = 0;
  let bookingCurrency = "USD";
  let ownerId = "";

  try {
    const hotel = await pb.collection("hotel_bookings").getOne(bookingId);
    ownerId = String(hotel.user || "");
    if (hotel.status === "paid" || hotel.status === "cancelled") {
      return NextResponse.json({ ok: false, error: "booking_not_payable" }, { status: 409 });
    }
    bookingName = String(hotel.hotel_name || bookingName);
    roomOrDesc = String(hotel.room_name || "Hotel Room");
    bookingPrice = Number(hotel.price || 0);
    bookingCurrency = String(hotel.currency || "USD");
    customerName = String(hotel.customer_name || customerName);
    customerEmail = String(hotel.customer_email || customerEmail);
  } catch {
    try {
      const enquiry = await pb.collection("enquiry_bookings").getOne(bookingId);
      ownerId = String(enquiry.user || enquiry.customer_id || "");
      bookingName = String(enquiry.service_name || "Flight Booking");
      bookingPrice = Number(enquiry.price || enquiry.total || 0);
      bookingCurrency = String(enquiry.currency || "USD");
    } catch {
      const { getFlightBooking } = await import("@/lib/server/flights-bookings");
      const flight = await getFlightBooking(bookingId);
      if (!flight) {
        return NextResponse.json({ ok: false, error: "booking_not_found" }, { status: 404 });
      }
      ownerId = String(flight.userId || "");
      bookingPrice = Number(flight.price?.client || flight.price?.base || 0);
      bookingCurrency = String(flight.price?.currency || "USD");
      bookingName = `Flight: ${flight.contact?.name || "Booking"}`;
    }
  }

  if (ownerId && ownerId !== user.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const amount = bookingPrice;
  const currency = bookingCurrency;
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
  }

  const { callbackUrl } = await getIyzicoMerchantUrls();
  const result = await createCheckout({
    bookingId,
    conversationId: bookingId,
    price: amount,
    currency,
    hotelName: bookingName,
    roomName: roomOrDesc,
    callbackUrl,
    buyer: {
      id: user.id,
      name: customerName.split(/\s+/)[0] || customerName,
      surname: customerName.split(/\s+/).slice(1).join(" ") || "Guest",
      email: customerEmail || user.email,
      phone: customerPhone,
      city: "",
      country: "",
      address: "",
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: mapGuestCheckoutError(result.error, result.errorCode), errorCode: result.errorCode },
      { status: 400 }
    );
  }

  if (result.charge) {
    try {
      await persistCheckoutCharge({ bookingId, token: result.token, charge: result.charge });
    } catch {
      /* form still usable */
    }
  }

  return NextResponse.json({
    ok: true,
    token: result.token,
    paymentPageUrl: result.paymentPageUrl,
    checkoutFormContent: result.checkoutFormContent,
  });
}
