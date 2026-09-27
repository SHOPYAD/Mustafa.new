import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { readRequestCookie } from "@/lib/http/cookies";
import {
  AFFILIATE_REF_COOKIE,
  createPendingConversion,
  normalizeRefCode,
} from "@/lib/affiliate/server";
import { createAdminNotification } from "@/lib/admin-notifications/server";
import { detectInvoiceService } from "@/lib/booking-service";
import { newConfirmToken } from "@/lib/server/hotel-booking-confirm";
import { notifyHotelBookingPlaced } from "@/lib/server/email/notify";
import { sendOtpIfEnabled } from "@/lib/automation/handlers/comms";
import { notifyBookingChannels } from "@/lib/automation/transactional";
import { localeFromRequest, rememberCustomerLocale } from "@/lib/server/email/recipient-locale";
import { persistHotelFlightRefs } from "@/lib/server/flight-booking-refs";
import { ensureFreshFlightQuote, updateFlightBooking, type FlightBookingSession } from "@/lib/server/flights-bookings";
import { listActiveAgencyExtras } from "@/lib/server/agency-extras-store";
import { extraLineAmount, toLonalizaServiceLine } from "@/lib/agency-extras";
import { confirmBookingPoints, redeemOnBooking } from "@/lib/loyalty/server";
import { bookingServiceFromProvider, LOYALTY_COUPON_COOKIE } from "@/lib/loyalty/types";
import { getHotelQuote, quoteIsUsable, updateHotelQuote, type HotelQuote } from "@/lib/server/hotels/quote-service";
import { fulfilHotelBooking } from "@/lib/server/hotels/fulfilment";

const SUPPLIER_PROVIDERS = new Set(["hotelbeds", "ratehawk", "travelport", "travelport_hotels", "seeru", "seeru_hotels"]);

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, bookings: [], error: "PocketBase unavailable" }, { status: 503 });
  }
  const rows = await pb.collection("hotel_bookings").getFullList<HotelBookingRecord>({
    filter: `user = "${user.id}"`,
    sort: "-id",
  });
  return NextResponse.json({ ok: true, bookings: rows });
}

export async function POST(req: Request) {
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

  const customer_name = String(body.customer_name || body.name || user.name || "").trim();
  let hotel_name = String(body.hotel_name || "").trim();
  let hotel_id = String(body.hotel_id || "").trim();
  const requestedProvider = String(body.provider || "internal");

  // Supplier-backed hotels (Hotelbeds / RateHawk / Travelport / Seeru) may only be booked from a live
  // quote: the quote fixes price, currency, room and the supplier token server-side, and the supplier
  // reservation itself is executed after the payment succeeds (see fulfilHotelBooking).
  let quote: HotelQuote | null = null;
  const quoteId = String(body.quoteId || body.quote_id || "").trim();
  if (quoteId) {
    quote = await getHotelQuote(quoteId);
    if (!quote) return NextResponse.json({ ok: false, error: "quote_not_found", errorCode: "quote_not_found" }, { status: 404 });
    if (quote.user && quote.user !== user.id) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    const usable = quoteIsUsable(quote);
    if (!usable.ok) return NextResponse.json({ ok: false, error: `quote_${usable.reason}`, errorCode: `quote_${usable.reason}` }, { status: 409 });
    hotel_name = quote.hotelName || hotel_name;
    hotel_id = quote.hotelId || hotel_id;
  } else if (SUPPLIER_PROVIDERS.has(requestedProvider)) {
    return NextResponse.json({ ok: false, error: "quote_required", errorCode: "quote_required" }, { status: 400 });
  }
  // Flights (provider "flight"): the amount is fixed server-side from the supplier-verified quote of the
  // flight session (+ Lonaliza services priced from the admin store). The client never sets the price.
  let flightPrice: { total: number; currency: string; session: FlightBookingSession } | null = null;
  if (requestedProvider === "flight") {
    const snapIn = body.offer_snapshot && typeof body.offer_snapshot === "object" ? (body.offer_snapshot as Record<string, unknown>) : {};
    const flightBookingId = String(snapIn.flight_booking_id || body.flight_booking_id || "").trim();
    if (!flightBookingId) return NextResponse.json({ ok: false, error: "flight_quote_required", errorCode: "flight_quote_required" }, { status: 400 });
    const fresh = await ensureFreshFlightQuote(flightBookingId);
    if (!fresh.ok) {
      const status = fresh.error === "not_found" ? 404 : 409;
      return NextResponse.json({ ok: false, error: `flight_${fresh.error}`, errorCode: `flight_${fresh.error}` }, { status });
    }
    if (fresh.session.userId && fresh.session.userId !== user.id) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    if (fresh.session.hotelBookingId) return NextResponse.json({ ok: false, error: "flight_already_booked", errorCode: "flight_already_booked" }, { status: 409 });
    const quote = fresh.session.quote!;
    if (fresh.fareChanged) {
      return NextResponse.json(
        { ok: false, error: "flight_price_changed", errorCode: "flight_price_changed", price: { client: quote.clientTotal, currency: quote.clientCurrency, previous: quote.previousClientTotal } },
        { status: 409 }
      );
    }
    const wantedIds = Array.isArray(snapIn.lonalizaServices) ? (snapIn.lonalizaServices as Array<Record<string, unknown>>).map((l) => String(l?.id || "")) : [];
    const packages = wantedIds.length ? (await listActiveAgencyExtras("flights")).filter((pkg) => wantedIds.includes(pkg.id)) : [];
    const servicesTotal = packages.reduce((sum, pkg) => sum + extraLineAmount(pkg, quote.clientTotal), 0);
    flightPrice = { total: Math.round((quote.clientTotal + servicesTotal) * 100) / 100, currency: quote.clientCurrency, session: fresh.session };
    if (body.offer_snapshot && typeof body.offer_snapshot === "object") {
      (body.offer_snapshot as Record<string, unknown>).lonalizaServices = packages.map((pkg) => toLonalizaServiceLine(pkg, quote.clientTotal, (String(body.locale || "ar") as "ar" | "en" | "tr"), quote.clientCurrency));
      (body.offer_snapshot as Record<string, unknown>).flight_quote = quote;
      (body.offer_snapshot as Record<string, unknown>).fulfilment_status = "awaiting_payment";
    }
  }
  if (!customer_name || !hotel_name || !hotel_id) {
    return NextResponse.json(
      { ok: false, error: "بيانات الفندق والاسم مطلوبة" },
      { status: 400 }
    );
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json(
      { ok: false, error: "نظام الحجوزات غير جاهز حالياً" },
      { status: 503 }
    );
  }

  const guestNames = Array.isArray(body.guest_names)
    ? body.guest_names.map((n) => String(n).trim()).filter(Boolean)
    : String(body.guest_names || "")
        .split(/\n|,/)
        .map((n) => n.trim())
        .filter(Boolean);

  const refCode = normalizeRefCode(readRequestCookie(req, AFFILIATE_REF_COOKIE) || "");
  const row = {
    user: user.id,
    hotel_id,
    hotel_name,
    hotel_slug: String(body.hotel_slug || hotel_id),
    room_id: quote ? quote.id : String(body.room_id || ""),
    room_name: quote?.roomName || String(body.room_name || ""),
    check_in: (quote?.checkIn || String(body.check_in || body.checkIn || "").trim()) || undefined,
    check_out: (quote?.checkOut || String(body.check_out || body.checkOut || "").trim()) || undefined,
    adults: quote ? quote.adults : Number(body.adults || 2),
    children: quote ? quote.childrenAges.length : Number(body.children || 0),
    guest_names: guestNames,
    customer_name,
    customer_email: String(body.customer_email || body.email || user.email || ""),
    customer_phone: String(body.customer_phone || body.phone || ""),
    notes: String(body.notes || "").slice(0, 2000),
    // Quote-backed bookings never trust the client's price.
    price: quote ? quote.sellingTotal : flightPrice ? flightPrice.total : Number(body.price || 0),
    currency: quote ? quote.currency : flightPrice ? flightPrice.currency : String(body.currency || "USD"),
    provider: quote ? quote.supplier : requestedProvider,
    status: "pending_payment",
    offer_snapshot: (() => {
      const snap =
        body.offer_snapshot && typeof body.offer_snapshot === "object"
          ? { ...(body.offer_snapshot as Record<string, unknown>) }
          : {};
      const base = {
        ...snap,
        hotel_image: String(quote?.hotelImage || snap.hotel_image || body.hotel_image || ""),
        stars: Number(quote?.stars || snap.stars || body.stars || 0),
        rating: Number(snap.rating || body.rating || 0),
        nightly: Number(quote?.perNight || snap.nightly || body.nightly || 0),
        nights: Number(quote?.nights || snap.nights || 0),
        confirm_token: String(snap.confirm_token || "").trim() || newConfirmToken(),
        free_cancellation: quote ? quote.refundable : Boolean(snap.free_cancellation ?? snap.freeCancellation),
        non_refundable: quote ? !quote.refundable : Boolean(snap.non_refundable ?? snap.nonRefundable),
        cancel_until: String(quote?.freeCancellationUntil || snap.cancel_until || snap.cancelUntil || body.check_in || body.checkIn || ""),
        payment_method: String(snap.payment_method || "other"),
        cancel_status: "none",
        locale: localeFromRequest(req, body),
      };
      if (!quote) return base;
      return {
        ...base,
        quote_id: quote.id,
        supplier: quote.supplier,
        supplier_hotel_id: quote.supplierHotelId,
        master_id: quote.masterId || "",
        fulfilment_status: "awaiting_payment",
        hotelName: quote.hotelName,
        city: quote.city,
        address: quote.address,
        image: quote.hotelImage,
        roomName: quote.roomName,
        roomImage: quote.roomImage,
        board: quote.board,
        boardName: quote.boardName || "",
        boardCode: quote.board,
        paymentType: quote.paymentType,
        rateType: quote.rateType,
        freeCancellation: quote.refundable,
        freeCancellationUntil: quote.freeCancellationUntil || "",
        cancellationPolicies: quote.cancellationPolicies,
        cancellationText: quote.refundable
          ? quote.freeCancellationUntil
            ? `Free cancellation until ${quote.freeCancellationUntil}`
            : "Free cancellation"
          : "Non-refundable",
        taxesIncluded: quote.taxesIncluded,
        priceChanged: quote.priceChanged,
        adults: quote.adults,
        children: quote.childrenAges.length,
        children_ages: quote.childrenAges,
      };
    })(),
    ...(refCode ? { ref_code: refCode } : {}),
  };

  const created = await pb.collection("hotel_bookings").create<HotelBookingRecord>(row);
  const flightSnap = await persistHotelFlightRefs(created);
  created.offer_snapshot = flightSnap;
  if (flightPrice) {
    await updateFlightBooking(flightPrice.session.id, { hotelBookingId: created.id, userId: flightPrice.session.userId || user.id }).catch(() => undefined);
  }

  if (quote) {
    await updateHotelQuote(quote.id, { bookingId: created.id });
  }

  const service = bookingServiceFromProvider(row.provider, row.hotel_id);
  const couponCode =
    String(body.couponCode || "").trim() || readRequestCookie(req, LOYALTY_COUPON_COOKIE) || "";
  const voucherIds = Array.isArray(body.voucherIds)
    ? body.voucherIds.map((id) => String(id)).filter(Boolean)
    : [];
  let coveredInFull = false;
  try {
    const loyaltyQuote = await redeemOnBooking({
      userId: user.id,
      bookingId: created.id,
      service,
      amount: row.price,
      currency: row.currency,
      couponCode,
      voucherIds,
      confirmEarn: false,
    });
    if (loyaltyQuote.discountUsd > 0 || loyaltyQuote.coveredInFull) {
      const snap =
        created.offer_snapshot && typeof created.offer_snapshot === "object"
          ? { ...(created.offer_snapshot as Record<string, unknown>) }
          : {};
      const nextStatus = loyaltyQuote.coveredInFull ? "paid" : created.status;
      const nextPay = loyaltyQuote.coveredInFull ? "paid" : "pending_payment";
      await pb.collection("hotel_bookings").update(created.id, {
        price: loyaltyQuote.payableAmount,
        status: nextStatus,
        payment_status: nextPay,
        offer_snapshot: {
          ...snap,
          original_price: row.price,
          loyalty_discount_usd: loyaltyQuote.discountUsd,
          loyalty_coupon: loyaltyQuote.couponCode || "",
          loyalty_vouchers: loyaltyQuote.voucherIds,
          payment_method: loyaltyQuote.coveredInFull ? "voucher" : snap.payment_method,
        },
      });
      created.price = loyaltyQuote.payableAmount;
      created.status = nextStatus;
      if (loyaltyQuote.coveredInFull) {
        coveredInFull = true;
        await confirmBookingPoints(created.id, user.id);
      }
    }
  } catch {
    /* booking still stands without loyalty */
  }

  // Fully covered by loyalty vouchers → nothing to charge; execute the supplier booking now.
  let fulfilment: Awaited<ReturnType<typeof fulfilHotelBooking>> | null = null;
  if (coveredInFull && quote) {
    fulfilment = await fulfilHotelBooking(created.id, { trigger: "loyalty_covered" }).catch(() => null);
  }

  await pb.collection("enquiry_bookings").create({
    type: detectInvoiceService({
      provider: row.provider,
      hotel_id: row.hotel_id,
      offer_snapshot: row.offer_snapshot,
    }),
    status: "new",
    service_name: hotel_name,
    destination: row.hotel_slug,
    customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    message: [
      row.room_name ? `الغرفة: ${row.room_name}` : "",
      `من ${row.check_in} إلى ${row.check_out}`,
      `السعر: ${row.currency} ${row.price}`,
      "حالة الدفع: pending_payment",
    ]
      .filter(Boolean)
      .join("\n"),
      user: user.id,
      metadata: {
        hotel_booking_id: created.id,
        payment_status: "pending_payment",
        provider: row.provider,
        locale: localeFromRequest(req, body),
      },
      ...(refCode ? { ref_code: refCode } : {}),
    });

  if (refCode) {
    await createPendingConversion({
      code: refCode,
      service: "hotel",
      bookingAmount: row.price,
      bookingId: created.id,
      path: "/hotels",
      notes: `${hotel_name} — ${row.check_in} → ${row.check_out}`,
    });
  }

  await createAdminNotification({
    type: "booking",
    body_ar: [customer_name, hotel_name].filter(Boolean).join(" · "),
    href: "/admin/bookings",
    meta: {
      bookingId: created.id,
      name: customer_name,
      service: hotel_name,
      source: "hotel",
    },
  });

  const confirm =
    created.offer_snapshot && typeof created.offer_snapshot === "object"
      ? String((created.offer_snapshot as Record<string, unknown>).confirm_token || "")
      : "";
  if (row.customer_email) {
    void rememberCustomerLocale(row.customer_email, localeFromRequest(req, body), {
      name: customer_name,
      userId: user.id,
    });
  }
  void notifyHotelBookingPlaced(created.id).catch(() => undefined);
  void notifyBookingChannels({
    bookingId: created.id,
    name: customer_name,
    phone: row.customer_phone,
    status: coveredInFull ? "paid" : "pending_payment",
    service: hotel_name,
    userId: user.id,
    sendEmail: false,
  }).catch(() => undefined);
  const otp = await sendOtpIfEnabled({
    phone: row.customer_phone,
    email: row.customer_email,
    purpose: "booking_confirm",
  }).catch(() => null);
  return NextResponse.json(
    {
      ok: true,
      booking: created,
      confirm,
      coveredInFull,
      fulfilment: fulfilment ? { status: fulfilment.status, supplierReference: fulfilment.supplierReference } : undefined,
      otpSent: Boolean(otp?.ok),
      otpChannel: otp?.ok ? otp.channel : undefined,
      otpTo: otp?.ok ? otp.to : undefined,
    },
    { status: 201 }
  );
}
