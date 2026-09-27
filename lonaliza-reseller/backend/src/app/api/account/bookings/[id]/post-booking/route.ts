import { NextRequest, NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { createAdminNotification } from "@/lib/admin-notifications/server";
import type { HotelBookingRecord, EnquiryBookingRecord } from "@/lib/pocketbase/records";
import { findMockBookingDetail } from "@/lib/server/mock-account-bookings";
import {
  bookingServiceOf,
  canRequestCancel,
  canRequestChange,
  cancelStatusOf,
  changeStatusOf,
  flightDisplayOf,
  hasLonalizaService,
  lonalizaServicesOf,
  requestGuestCancel,
  requestGuestChange,
} from "@/lib/server/hotel-cancellations";
import { SeeruAirAdapter } from "@/lib/providers/adapters/seeru/seeruAirAdapter";
import { customerFacingCopy, pickScheduleStamp } from "@/lib/account/booking-display";

export const runtime = "nodejs";

/**
 * Post-booking (customer account) — governing rule: nothing is invented.
 * Every field is either taken from the stored booking/supplier data or omitted.
 * Lonaliza services (refund guarantee / flexible date) drive the cancel & change capabilities;
 * they are executed internally by Lonaliza staff, never sent to the supplier from here.
 */

function str(value: unknown): string {
  return value != null && String(value).trim() ? String(value).trim() : "";
}

function num(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n !== 0 ? n : undefined;
}

function minutesLabel(total: number | undefined): string {
  if (!total || total <= 0) return "";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h > 0 ? `${h} س` : ""}${h > 0 && m > 0 ? " " : ""}${m > 0 ? `${m} د` : ""}`.trim();
}

function baggageSummaryOf(bag: Record<string, unknown> | null | undefined): string {
  if (!bag) return "";
  const kg = num(bag.weightKg ?? bag.kg);
  const pieces = num(bag.checkedBags ?? bag.pieces);
  if (kg && pieces) return `${pieces} × ${kg} كجم`;
  if (kg) return `${kg} كجم`;
  if (pieces) return `${pieces} حقيبة مسجلة`;
  if (str(bag.text)) return str(bag.text);
  if (bag.status === "none" || bag.checkedBags === 0) return "بدون أمتعة مسجلة";
  return "";
}

function lonalizaServicesPayload(booking: HotelBookingRecord) {
  return lonalizaServicesOf(booking).map((svc) => ({
    id: svc.id,
    kind: svc.kind,
    title: svc.title,
    amount: svc.amount,
    currency: svc.currency || booking.currency,
    terms: svc.terms || "",
  }));
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  const mock = findMockBookingDetail(id);
  if (mock) {
    return NextResponse.json({
      ok: true,
      serviceType: mock.serviceType,
      booking: {
        id: mock.id,
        title: mock.title,
        subtitle: mock.subtitle,
        checkIn: mock.flightDetails?.departureTime || mock.hotelDetails?.checkIn || mock.created,
        checkOut: mock.flightDetails?.returnFlight?.arrivalTime || mock.hotelDetails?.checkOut || mock.created,
        price: mock.price,
        currency: mock.currency,
        status: mock.status,
        paymentStatus: mock.paymentStatus,
        pnr: mock.pnr,
        provider: mock.provider,
        freeCancellation: mock.capabilities.freeCancellation,
        cancelStatus: mock.cancelStatus || "none",
        cancelReason: mock.cancelReason || "",
        cancelAdminNote: mock.cancelAdminNote || "",
        refundAmount: mock.refundAmount || 0,
      },
      flightDetails: mock.flightDetails,
      hotelDetails: mock.hotelDetails,
      serviceDetails: mock.serviceDetails,
      passengers: mock.passengers,
      priceBreakdown: mock.priceBreakdown,
      capabilities: mock.capabilities,
      baggageOptions: mock.baggageOptions,
      lonalizaServices: [],
      policies: { cancellation: "", modification: "" },
      postBookingRequests: mock.postBookingRequests || [],
      demo: true,
    });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }

  // 1) hotel_bookings (hotels + paid flights + other services)
  let hotelBooking: HotelBookingRecord | null = null;
  try {
    const item = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(id);
    if (item.user === user.id || item.customer_email?.toLowerCase() === user.email.toLowerCase()) {
      hotelBooking = item;
    }
  } catch {
    /* try enquiry_bookings */
  }

  if (hotelBooking) {
    const snap =
      hotelBooking.offer_snapshot && typeof hotelBooking.offer_snapshot === "object"
        ? (hotelBooking.offer_snapshot as Record<string, unknown>)
        : {};

    const provider = String(hotelBooking.provider || snap.provider || "manual").toLowerCase();
    const serviceType = bookingServiceOf(hotelBooking);
    const flight = flightDisplayOf(hotelBooking);
    const cancelStatus = cancelStatusOf(hotelBooking);
    const changeStatus = changeStatusOf(hotelBooking);
    const isCancelled = hotelBooking.status === "cancelled" || cancelStatus === "approved" || cancelStatus === "refunded";

    const isFlight = serviceType === "flight";
    const isHotel = serviceType === "hotel";
    const isOther = serviceType === "car" || serviceType === "transfer" || serviceType === "tour" || serviceType === "package";

    const itin =
      snap.itinerary && typeof snap.itinerary === "object"
        ? (snap.itinerary as Record<string, unknown>)
        : {};
    const legs = (
      Array.isArray(snap.legs)
        ? snap.legs
        : Array.isArray(itin.legs)
          ? itin.legs
          : []
    ) as Array<Record<string, any>>;
    const firstLeg = legs[0] || {};
    const lastLeg = legs[legs.length - 1] || firstLeg;
    const firstSeg = Array.isArray(firstLeg.segments)
      ? firstLeg.segments[0]
      : Array.isArray(snap.segments)
        ? (snap.segments as Array<Record<string, any>>)[0]
        : undefined;
    const lastSeg = Array.isArray(lastLeg.segments)
      ? lastLeg.segments[lastLeg.segments.length - 1]
      : Array.isArray(snap.segments)
        ? (snap.segments as Array<Record<string, any>>).at(-1)
        : undefined;

    const title = isFlight
      ? [flight.origin, flight.destination].filter(Boolean).join(" ➔ ") || hotelBooking.hotel_name
      : hotelBooking.hotel_name || "";
    const subtitle = isFlight
      ? [flight.airline, flight.fare_class].filter(Boolean).join(" · ")
      : hotelBooking.room_name || "";

    const flightDetails = isFlight
      ? {
          airline: flight.airline || "",
          airlineCode: flight.airline_code || "",
          flightNumber: str(snap.flightNumbers) || str(firstSeg?.flightNumber) || "",
          aircraft: str(snap.aircraft) || str(firstSeg?.aircraft) || "",
          origin: flight.origin || "",
          originAirport: str(snap.originAirport) || str(firstSeg?.origin?.name) || "",
          originTerminal: str(firstSeg?.origin?.terminal) || "",
          destination: flight.destination || "",
          destinationAirport: str(snap.destinationAirport) || str(lastSeg?.destination?.name) || "",
          destinationTerminal: str(lastSeg?.destination?.terminal) || "",
          departureTime:
            pickScheduleStamp(
              firstSeg?.departure,
              firstSeg?.departureTime,
              firstLeg.departure,
              firstLeg.departureTime,
              snap.departureTime,
              snap.departure,
              itin.departure
            ) || str(firstSeg?.departure),
          arrivalTime:
            pickScheduleStamp(
              lastSeg?.arrival,
              lastSeg?.arrivalTime,
              lastLeg.arrival,
              lastLeg.arrivalTime,
              snap.arrivalTime,
              snap.arrival,
              itin.arrival
            ) || str(lastSeg?.arrival),
          duration: str(snap.duration) || minutesLabel(num(firstLeg.durationMinutes)),
          durationMinutes: num(firstLeg.durationMinutes) || num(snap.durationMinutes),
          stops: Number(snap.stops) || Math.max(0, (Array.isArray(firstLeg.segments) ? firstLeg.segments.length : 1) - 1),
          cabinClass: flight.fare_class || "",
          fareBrand: str(snap.fareClass) || str(snap.fareBrand) || "",
        }
      : undefined;

    const hotelDetails = isHotel
      ? {
          hotelName: hotelBooking.hotel_name,
          stars: Math.min(5, Number(snap.stars || snap.hotel_stars) || 0) || undefined,
          address: str(snap.address || snap.hotel_address) || "",
          roomType: hotelBooking.room_name || "",
          checkIn: hotelBooking.check_in,
          checkOut: hotelBooking.check_out,
          nights: num(snap.nights),
          guests: `${hotelBooking.adults || 1} بالغ` + (hotelBooking.children ? ` و ${hotelBooking.children} أطفال` : ""),
          boardType: str(snap.boardType || snap.board_type) || "",
          hotelImage: str(snap.hotel_image || snap.image) || "",
        }
      : undefined;

    const serviceDetails = isOther
      ? {
          categoryName: str(snap.categoryName) || hotelBooking.room_name || "",
          vehicleModel: str(snap.vehicleModel || snap.vehicle) || "",
          pickupLocation: str(snap.pickupLocation) || "",
          dropoffLocation: str(snap.dropoffLocation) || "",
          guideLanguage: str(snap.guideLanguage) || "",
          inclusions: Array.isArray(snap.inclusions) ? (snap.inclusions as string[]) : [],
        }
      : undefined;

    const guestNames =
      Array.isArray(hotelBooking.guest_names) && hotelBooking.guest_names.length
        ? hotelBooking.guest_names
        : [hotelBooking.customer_name || ""];
    const ticketNumber = str(snap.ticket_number || snap.ticketNumber);
    const passengers = guestNames.map((g) => {
      const parts = String(g).split(/[·•|]/);
      return {
        name: parts[0]?.trim() || hotelBooking.customer_name,
        type: "adult" as const,
        ticketNumber: ticketNumber && !/^(PENDING|TKT-)/i.test(ticketNumber) ? ticketNumber : "",
        seat: "",
        baggage: isFlight ? baggageSummaryOf((snap.baggage as Record<string, unknown>) || null) : "",
        meal: "",
        passportNumber: parts[1]?.trim() || "",
      };
    });

    const baseFare = num(snap.baseFare ?? snap.base_fare);
    const taxes = num(snap.taxes ?? snap.taxesAndFees);
    const extrasTotal = Number(snap.extrasTotal) || 0;
    const priceBreakdown = {
      baseFare: baseFare ?? (taxes != null ? Math.max(0, hotelBooking.price - taxes - extrasTotal) : undefined),
      taxesAndFees: taxes,
      ancillaryFee: extrasTotal || 0,
      discount: Number(snap.discount || 0),
      total: hotelBooking.price,
    };

    const lonalizaServices = lonalizaServicesPayload(hotelBooking);
    const refundGuarantee = hasLonalizaService(hotelBooking, "refund_guarantee");
    const flexChange = hasLonalizaService(hotelBooking, "flex_change");

    // Capabilities strictly from supplier rules + purchased Lonaliza services.
    const canCancel = !isCancelled && canRequestCancel(hotelBooking);
    const canModify = !isCancelled && canRequestChange(hotelBooking);
    const canAddBaggage = false; // supplier ancillaries (PKFARE ancillaryPricing / Travelport ancillaryshop) are a later phase.

    const cancelUntil = str(snap.cancel_until);
    const cancellationPolicy = refundGuarantee
      ? "ضمان استرداد لوناليزا مفعّل: يمكنك طلب الإلغاء قبل موعد السفر ويُسترد المبلغ وفق شروط الخدمة."
      : hotelBooking.free_cancellation || snap.isFreeCancellation
        ? `إلغاء مجاني وفق شروط الخدمة${cancelUntil ? ` حتى ${cancelUntil.slice(0, 10)}` : ""}.`
        : snap.non_refundable || hotelBooking.non_refundable
          ? "غير قابل للاسترداد وفق شروط الخدمة."
          : customerFacingCopy(
              str(snap.cancellationPolicy || snap.cancel_policy) ||
                "يخضع الإلغاء لشروط الخدمة؛ تُعرض الرسوم قبل التأكيد."
            );
    const modificationPolicy = flexChange
      ? "خدمة التاريخ المرن من لوناليزا مفعّلة: يمكنك طلب تغيير التاريخ مرة واحدة وينفّذه فريق لوناليزا حسب التوفر."
      : "تغيير الموعد غير مشمول؛ يمكن شراء خدمة التاريخ المرن من لوناليزا عند الحجز.";

    return NextResponse.json({
      ok: true,
      serviceType,
      booking: {
        id: hotelBooking.id,
        title,
        subtitle,
        checkIn: hotelBooking.check_in,
        checkOut: hotelBooking.check_out,
        price: hotelBooking.price,
        currency: hotelBooking.currency,
        status: hotelBooking.status,
        paymentStatus: hotelBooking.payment_status || hotelBooking.status,
        pnr: flight.pnr || str(snap.pnr || snap.supplier_reference) || "",
        provider,
        freeCancellation: Boolean(hotelBooking.free_cancellation || snap.isFreeCancellation),
        cancelStatus,
        cancelReason: str(snap.cancel_reason),
        cancelAdminNote: str(snap.cancel_admin_note),
        refundAmount: Number(snap.refund_amount || 0),
        changeStatus,
        changeRequest: str(snap.change_request),
        changeAdminNote: str(snap.change_admin_note),
      },
      flightDetails,
      hotelDetails,
      serviceDetails,
      passengers,
      priceBreakdown,
      lonalizaServices,
      capabilities: {
        canCancel,
        canModify,
        canAddBaggage,
        refundGuarantee,
        flexChange,
        freeCancellation: Boolean(hotelBooking.free_cancellation || snap.isFreeCancellation),
        cancellationDeadline: cancelUntil || undefined,
        supportsAutomatedSupplierRefund: ["ratehawk", "hotelbeds", "travelport", "travelport_hotels", "pkfare", "biletbank", "seeru"].includes(provider),
        isTravelpayouts: provider.includes("travelpayouts") || provider.includes("tp_partner"),
      },
      baggageOptions: [],
      policies: {
        cancellation: cancellationPolicy,
        modification: modificationPolicy,
      },
      postBookingRequests: Array.isArray(snap.post_booking_requests) ? snap.post_booking_requests : [],
    });
  }

  // 2) enquiry_bookings (flight sessions not yet paid through hotel_bookings, WhatsApp flow…)
  let enquiryBooking: EnquiryBookingRecord | null = null;
  try {
    const item = await pb.collection("enquiry_bookings").getOne<EnquiryBookingRecord>(id);
    if (item.user === user.id || item.customer_email?.toLowerCase() === user.email.toLowerCase()) {
      enquiryBooking = item;
    }
  } catch {
    /* not found */
  }

  if (!enquiryBooking) {
    return NextResponse.json({ ok: false, error: "booking_not_found" }, { status: 404 });
  }

  const meta = (enquiryBooking.metadata || {}) as Record<string, unknown>;
  const serviceType = String(enquiryBooking.type || "flight").toLowerCase();
  const providerEngine = String(meta.provider || meta.engine || "").toLowerCase();
  const isTravelpayouts = providerEngine.includes("travelpayouts") || Boolean(meta.travelpayoutsUrl);

  const itin = (meta.itinerary as Record<string, unknown>) || null;
  const itinLegs = Array.isArray(itin?.legs) ? (itin.legs as Array<Record<string, any>>) : [];
  const firstLeg = itinLegs[0];
  const lastLeg = itinLegs[itinLegs.length - 1] || firstLeg;
  const firstSeg = Array.isArray(firstLeg?.segments) ? firstLeg.segments[0] : undefined;
  const lastSeg = Array.isArray(lastLeg?.segments) ? lastLeg.segments[lastLeg.segments.length - 1] : undefined;

  const originCode = str(firstSeg?.origin?.displayCode || firstLeg?.origin?.displayCode);
  const destCode = str(lastSeg?.destination?.displayCode || lastLeg?.destination?.displayCode);

  const bag = ((meta.baggageAllowance as Record<string, unknown>) || firstLeg?.baggageAllowance || null) as Record<string, unknown> | null;
  const baggageSummary = baggageSummaryOf(bag);

  const flightDetails =
    serviceType === "flight"
      ? {
          airline: str(meta.airline || firstSeg?.airline || firstLeg?.carrierName),
          airlineCode: str(meta.airline_code || firstSeg?.airlineCode || firstLeg?.carrierCode),
          flightNumber: str(meta.flightNumber || firstSeg?.flightNumber),
          aircraft: str(meta.aircraft || firstSeg?.aircraft),
          origin: originCode,
          originAirport: str(meta.originAirport || firstSeg?.origin?.name || firstSeg?.origin?.city),
          originTerminal: str(meta.originTerminal || firstSeg?.origin?.terminal),
          destination: destCode,
          destinationAirport: str(meta.destinationAirport || lastSeg?.destination?.name || lastSeg?.destination?.city),
          destinationTerminal: str(meta.destinationTerminal || lastSeg?.destination?.terminal),
          departureTime: pickScheduleStamp(
            meta.departureTime,
            firstSeg?.departure,
            firstSeg?.departureTime,
            firstLeg?.departure
          ),
          arrivalTime: pickScheduleStamp(
            meta.arrivalTime,
            lastSeg?.arrival,
            lastSeg?.arrivalTime,
            lastLeg?.arrival
          ),
          duration: minutesLabel(num(firstLeg?.durationMinutes)),
          durationMinutes: num(firstLeg?.durationMinutes),
          stops: Number(firstLeg?.stopCount || 0),
          cabinClass: str(firstSeg?.cabinClass),
          fareBrand: str(meta.fareBrand),
        }
      : undefined;

  const rawTravelers =
    Array.isArray(meta.travelers) && meta.travelers.length
      ? (meta.travelers as Array<Record<string, unknown>>)
      : [{ name: enquiryBooking.customer_name }];

  const realTicket = str(meta.ticketNumber);
  const passengers = rawTravelers.map((t: any) => ({
    name:
      [t.title, t.firstName || t.first_name, t.lastName || t.last_name].filter(Boolean).join(" ") ||
      t.name ||
      enquiryBooking.customer_name ||
      "",
    type: t.type === "CHD" ? "child" : t.type === "INF" ? "infant" : "adult",
    ticketNumber: realTicket && !/^(PENDING|TKT-)/i.test(realTicket) ? realTicket : "",
    seat: str(t.seat),
    baggage: baggageSummary,
    meal: "",
    passportNumber: str(t.passportNumber || t.passport_no),
    nationality: str(t.nationality),
  }));

  const price = (meta.price as Record<string, unknown>) || {};
  const totalAmt = Number(price.client || (enquiryBooking as any).price || 0);
  const taxesAmt = num(price.taxes);
  const priceBreakdown = {
    baseFare: num(price.base) ?? (taxesAmt != null ? Math.max(0, totalAmt - taxesAmt) : undefined),
    taxesAndFees: taxesAmt,
    ancillaryFee: 0,
    discount: 0,
    total: totalAmt,
  };

  // Optional live status from Seeru when a real order exists (non-blocking).
  let liveSupplierStatus = "RECORDED";
  if (providerEngine === "seeru" && meta.pnr) {
    try {
      const seeru = new SeeruAirAdapter();
      const live = await seeru.fetchOrderDetails(String(meta.pnr)).catch(() => null);
      if (live) liveSupplierStatus = "CONNECTED_LIVE";
    } catch {
      /* non-blocking */
    }
  }

  const refundable = meta.refundable === true;
  const refundableInfo = str(meta.refundableInfo);
  return NextResponse.json({
    ok: true,
    serviceType,
    booking: {
      id: enquiryBooking.id,
      title: enquiryBooking.service_name || enquiryBooking.destination || "",
      subtitle: enquiryBooking.destination || "",
      status: enquiryBooking.status,
      pnr: str(meta.pnr || meta.orderId) || "",
      airline: str(meta.airline || flightDetails?.airline),
      airlineCode: str(meta.airline_code || flightDetails?.airlineCode),
      price: totalAmt,
      currency: str(price.currency) || "USD",
      currentBaggage: bag || undefined,
      baggageSummary,
      provider: providerEngine,
      fareBrand: str(meta.fareBrand),
      freeCancellation: refundable && !refundableInfo,
      cancelStatus: String(meta.cancelStatus || "none"),
    },
    flightDetails,
    passengers,
    priceBreakdown,
    lonalizaServices: [],
    capabilities: {
      canCancel: enquiryBooking.status !== "cancelled" && Boolean(meta.pnr),
      canModify: false,
      canAddBaggage: false,
      canVoid: Boolean(meta.canVoid),
      canHold: Boolean(meta.canHold),
      ticketingDeadline: meta.ticketingDeadline ? String(meta.ticketingDeadline) : undefined,
      freeCancellation: refundable && !refundableInfo,
      supportsAutomatedSupplierRefund: ["supplier_live", "pkfare", "biletbank", "seeru", "travelport"].includes(providerEngine),
      isTravelpayouts,
      travelpayoutsPartnerName: isTravelpayouts ? str(meta.partnerName) : null,
      travelpayoutsManageUrl: isTravelpayouts ? str(meta.travelpayoutsUrl) : null,
      liveSupplierStatus,
    },
    baggageOptions: [],
    policies: {
      cancellation: refundable
        ? `قابلة للاسترداد وفق شروط الخدمة${refundableInfo ? `: ${refundableInfo}` : ""}`
        : meta.refundable === false
          ? "غير قابلة للاسترداد وفق شروط الخدمة."
          : "تُحدَّد شروط الاسترداد عند التسعير.",
      modification:
        meta.canExchange === true
          ? "التغيير متاح وفق شروط شركة الطيران وفرق السعر."
          : meta.canExchange === false
            ? "التغيير غير متاح على هذه التعرفة."
            : "تُحدَّد شروط التغيير من شركة الطيران عند التسعير.",
      baggage: baggageSummary ? `الأمتعة المشمولة: ${baggageSummary}` : "تفاصيل الأمتعة تُؤكد من شركة الطيران.",
    },
    postBookingRequests: meta.post_booking_requests || [],
  });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const action = String(body.action || "").trim();
  if (!["cancel", "void", "quote_refund", "modify_flight"].includes(action)) {
    return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
  }

  if (id.startsWith("mock-")) {
    return NextResponse.json({ ok: false, error: "demo_booking" }, { status: 400 });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }

  const timestamp = new Date().toISOString();
  const details = (body.details && typeof body.details === "object" ? body.details : {}) as Record<string, unknown>;
  const requestItem = {
    id: `req_${Date.now()}`,
    action,
    createdAt: timestamp,
    status: "pending_admin",
    details,
  };

  // 1) hotel_bookings → unified Lonaliza request flow (cancel / flexible-date change)
  try {
    const hotel = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(id);
    if (hotel.user === user.id || hotel.customer_email?.toLowerCase() === user.email.toLowerCase()) {
      if (action === "cancel") {
        const result = await requestGuestCancel({ userId: user.id, bookingId: hotel.id, reason: String(body.reason || "") });
        if (!result.ok) return NextResponse.json({ ok: false, error: result.error || "not_cancellable" }, { status: 400 });
        return NextResponse.json({
          ok: true,
          message: "request_submitted",
          request: requestItem,
          note: "تم استلام طلب الإلغاء وسيراجعه فريق لوناليزا ثم ينفّذه ويُشعرك بالنتيجة.",
        });
      }
      if (action === "modify_flight") {
        const result = await requestGuestChange({
          userId: user.id,
          bookingId: hotel.id,
          newDate: String(details.newDate || body.newDate || ""),
          note: String(details.notes || body.notes || ""),
        });
        if (!result.ok) {
          const status = result.error === "forbidden" ? 403 : 400;
          return NextResponse.json({ ok: false, error: result.error || "not_changeable" }, { status });
        }
        return NextResponse.json({
          ok: true,
          message: "request_submitted",
          request: requestItem,
          note: "تم استلام طلب تغيير التاريخ (خدمة لوناليزا) وسينفّذه فريقنا حسب التوفر ثم يُشعرك.",
        });
      }
      return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
    }
  } catch {
    /* check enquiry */
  }

  // 2) enquiry_bookings (supplier session bookings)
  try {
    const enquiry = await pb.collection("enquiry_bookings").getOne<EnquiryBookingRecord>(id);
    if (enquiry.user === user.id || enquiry.customer_email?.toLowerCase() === user.email.toLowerCase()) {
      const meta = (enquiry.metadata || {}) as Record<string, unknown>;
      const providerEngine = String(meta.provider || meta.engine || "").toLowerCase();
      const existingReqs = Array.isArray(meta.post_booking_requests) ? meta.post_booking_requests : [];
      existingReqs.push(requestItem);

      // Live refund quote: only a real supplier answer is returned — never an estimate.
      if (action === "quote_refund") {
        if (providerEngine === "seeru" && meta.pnr) {
          try {
            const seeru = new SeeruAirAdapter();
            const quote = await seeru.quoteTicketRefund({ ticketId: String(meta.pnr) });
            const refundAmt = Number(quote?.refundAmount);
            if (!Number.isFinite(refundAmt)) {
              return NextResponse.json({ ok: false, error: "quote_unavailable" }, { status: 502 });
            }
            const total = Number((meta.price as Record<string, unknown>)?.client || 0);
            return NextResponse.json({
              ok: true,
              quote: {
                supplier: "seeru",
                refundAmount: refundAmt,
                penaltyAmount: total > 0 ? Math.max(0, Math.round((total - refundAmt) * 100) / 100) : undefined,
                currency: String((meta.price as Record<string, unknown>)?.currency || "USD"),
                canVoid: Boolean(meta.canVoid),
                status: quote?.status || "QUOTED",
                message: quote?.message || "",
              },
            });
          } catch {
            return NextResponse.json({ ok: false, error: "quote_unavailable" }, { status: 502 });
          }
        }
        return NextResponse.json({ ok: false, error: "quote_unavailable" }, { status: 400 });
      }

      if (action === "void") {
        if (!(providerEngine === "seeru" && meta.pnr && meta.canVoid)) {
          return NextResponse.json({ ok: false, error: "void_unavailable" }, { status: 400 });
        }
        try {
          const seeru = new SeeruAirAdapter();
          await seeru.voidTicket({ ticketId: String(meta.pnr) });
        } catch (err) {
          return NextResponse.json({ ok: false, error: `void_failed: ${String((err as Error)?.message || err)}` }, { status: 502 });
        }
        await pb.collection("enquiry_bookings").update(enquiry.id, {
          status: "cancelled",
          metadata: { ...meta, cancelStatus: "voided", post_booking_requests: existingReqs, lastPostBookingAction: "void" },
        });
        return NextResponse.json({ ok: true, message: "ticket_voided_successfully", note: "تم إبطال التذكرة بنجاح." });
      }

      if (action === "cancel") {
        // Recorded as a request for Lonaliza staff — the supplier cancellation is executed by the admin flow.
        await pb.collection("enquiry_bookings").update(enquiry.id, {
          metadata: { ...meta, cancelStatus: "pending_admin", post_booking_requests: existingReqs, lastPostBookingAction: action },
        });
        await createAdminNotification({
          type: "booking",
          body_ar: `طلب إلغاء من العميل ${user.name} على حجز: ${enquiry.service_name || enquiry.destination || enquiry.type}`,
          href: `/admin/bookings`,
          meta: { enquiryId: enquiry.id, action, userId: user.id },
        });
        return NextResponse.json({ ok: true, message: "request_submitted", request: requestItem });
      }

      return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
    }
  } catch {
    /* not found */
  }

  return NextResponse.json({ ok: false, error: "booking_not_found" }, { status: 404 });
}
