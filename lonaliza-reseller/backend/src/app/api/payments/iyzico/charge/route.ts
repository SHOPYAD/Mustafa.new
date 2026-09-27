import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { mapGuestCheckoutError } from "@/lib/iyzico-limits";
import { detectCardBrand, digitsOnly, last4Of, redactPaymentPayload } from "@/lib/payments/card-fields";
import {
  initializeThreedsPayment,
  storeIyzicoCard,
  type IyzicoPaymentCard,
} from "@/lib/server/iyzico";
import { persistCheckoutCharge } from "@/lib/server/iyzico-bookings";
import { getIyzicoMerchantUrls, getIyzicoSecrets } from "@/lib/server/payments-settings";
import {
  findSavedCard,
  getCardUserKey,
  upsertSavedCard,
} from "@/lib/server/lonaliza-social-commerce";

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

    const saveCard = body.saveCard === true || body.saveCard === "1" || body.saveCard === 1;
    const savedCardId = String(body.savedCardId || "").trim();
    const cardObj = body.card && typeof body.card === "object" ? (body.card as Record<string, unknown>) : {};
    const pan = digitsOnly(String(cardObj.cardNumber || body.cardNumber || ""));
    const cvc = digitsOnly(String(cardObj.cvc || body.cvc || ""));
    const cardHolderName = String(cardObj.cardHolderName || body.cardHolderName || "").trim();
    const expireMonth = String(cardObj.expireMonth || body.expireMonth || "").padStart(2, "0").slice(-2);
    const expireYear = String(cardObj.expireYear || body.expireYear || "").trim();

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

    try {
      const hotelBooking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
      hotelBookingFound = true;
      if (hotelBooking.status === "paid" || hotelBooking.status === "cancelled") {
        return NextResponse.json({ ok: false, error: "booking_not_payable", errorCode: "booking_not_payable" }, { status: 409 });
      }
      const snap = (hotelBooking.offer_snapshot || {}) as Record<string, unknown>;
      if (snap.quote_id) {
        const { getHotelQuote, quoteIsUsable } = await import("@/lib/server/hotels/quote-service");
        const quote = await getHotelQuote(String(snap.quote_id));
        const usable = quote ? quoteIsUsable(quote) : { ok: false as const, reason: "expired" as const };
        if (!usable.ok) {
          return NextResponse.json({ ok: false, error: `quote_${usable.reason}`, errorCode: `quote_${usable.reason}` }, { status: 409 });
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
    } catch {
      try {
        const enquiryBooking = await pb.collection("enquiry_bookings").getOne(bookingId);
        bookingName = String((enquiryBooking as Record<string, unknown>).service_name || "Flight Booking");
        roomOrDesc = String((enquiryBooking as Record<string, unknown>).destination || "Flight Ticket");
        customerName = String((enquiryBooking as Record<string, unknown>).customer_name || customerName);
        customerEmail = String((enquiryBooking as Record<string, unknown>).customer_email || customerEmail);
        customerPhone = String((enquiryBooking as Record<string, unknown>).customer_phone || "");
        validBookingId = enquiryBooking.id;
      } catch {
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
          /* body amount */
        }
      }
    }

    const amount = hotelBookingFound ? bookingPrice : Number(body.amount || bookingPrice || 1);
    const currency = hotelBookingFound ? bookingCurrency : String(body.currency || bookingCurrency || "USD");
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
    }

    let paymentCard: IyzicoPaymentCard;
    if (savedCardId) {
      const saved = await findSavedCard(savedCardId, user.id);
      if (!saved?.cardToken || !saved.cardUserKey) {
        return NextResponse.json({ ok: false, error: "saved_card_missing" }, { status: 400 });
      }
      if (cvc.length < 3) {
        return NextResponse.json({ ok: false, error: "cvc_invalid" }, { status: 400 });
      }
      paymentCard = { cardToken: saved.cardToken, cardUserKey: saved.cardUserKey, cvc };
    } else {
      if (pan.length < 13 || cvc.length < 3 || cardHolderName.length < 2) {
        return NextResponse.json({ ok: false, error: "card_invalid" }, { status: 400 });
      }
      paymentCard = {
        cardHolderName,
        cardNumber: pan,
        expireMonth,
        expireYear,
        cvc,
        registerCard: saveCard ? 1 : 0,
        cardAlias: "Lonaliza",
      };
      if (saveCard) {
        const existingKey = await getCardUserKey(user.id);
        const stored = await storeIyzicoCard({
          email: String(body.email || customerEmail || user.email || ""),
          externalId: user.id,
          cardUserKey: existingKey || undefined,
          card: {
            cardAlias: "Lonaliza",
            cardHolderName,
            cardNumber: pan,
            expireMonth,
            expireYear,
          },
        });
        if (stored.ok && stored.card?.cardToken && stored.card.cardUserKey) {
          paymentCard = {
            cardToken: stored.card.cardToken,
            cardUserKey: stored.card.cardUserKey,
            cvc,
          };
          await upsertSavedCard({
            userId: user.id,
            brand: detectCardBrand(pan),
            last4: stored.card.lastFourDigits || last4Of(pan),
            cardUserKey: stored.card.cardUserKey,
            cardToken: stored.card.cardToken,
            expireMonth: stored.card.expireMonth || expireMonth,
            expireYear: stored.card.expireYear || expireYear,
            binNumber: stored.card.binNumber,
            cardAlias: stored.card.cardAlias,
          });
        }
      }
    }

    const { callbackUrl } = await getIyzicoMerchantUrls();
    const fullName = String(body.name || customerName || user.name || "Guest");
    const parts = fullName.trim().split(/\s+/);
    const countryCode = String(body.countryCode || "").trim();
    const country = String(body.country || (countryCode === "+90" ? "Turkey" : "")).trim();

    const result = await initializeThreedsPayment({
      bookingId: validBookingId,
      conversationId: validBookingId,
      price: amount,
      currency,
      hotelName: bookingName,
      roomName: roomOrDesc || "Standard",
      callbackUrl,
      paymentCard,
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
          paymentId: result.paymentId,
          charge: result.charge,
          paymentStatus: "pending_payment",
        });
      } catch {
        /* 3DS html still usable */
      }
    }

    if (saveCard && result.cardToken && result.cardUserKey) {
      await upsertSavedCard({
        userId: user.id,
        brand: pan ? detectCardBrand(pan) : "Card",
        last4: pan ? last4Of(pan) : "",
        cardUserKey: result.cardUserKey,
        cardToken: result.cardToken,
        expireMonth,
        expireYear,
      });
    }

    return NextResponse.json(
      redactPaymentPayload({
        ok: true,
        payment: "pending",
        paymentStatus: "pending_payment",
        paymentId: result.paymentId,
        threeDSHtml: result.threeDSHtml || "",
        sandbox: secrets.mode !== "production",
        chargedAmount: result.charge?.chargedAmount,
        chargedCurrency: result.charge?.chargedCurrency,
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "iyzico_init_failed";
    const safe = /tunnel|ECONNREFUSED|ECONNRESET|ETIMEDOUT/i.test(message) ? "iyzico_network" : "iyzico_init_failed";
    return NextResponse.json({ ok: false, error: safe }, { status: 400 });
  }
}
