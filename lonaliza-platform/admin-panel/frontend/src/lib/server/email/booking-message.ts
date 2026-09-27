import { formatHumanDate } from "@/lib/account/booking-display";
import { invoiceServicePath, type InvoiceService } from "@/lib/booking-service";
import { SITE_PUBLIC_URL } from "@/lib/pocketbase/constants";
import { formatInvoiceDate } from "@/lib/pdf/invoice-format";
import type { HotelBookingConfirmView } from "@/lib/server/hotel-booking-confirm";
import type { Locale } from "@/lib/i18n/types";
import type { EmailVars } from "@/lib/server/email/types";
import type { FlightBookingSession } from "@/lib/server/flights-bookings";
import type { InvoiceLanguage } from "@/types/invoice-template";

function localeOf(raw: string): Locale {
  if (raw === "en" || raw === "tr") return raw;
  return "ar";
}

function invoiceLang(locale: string): InvoiceLanguage {
  if (locale === "en" || locale === "tr" || locale === "fr") return locale;
  return "ar";
}

function snapStr(snap: Record<string, unknown>, key: string, fallback = ""): string {
  const value = snap[key];
  return value != null && String(value).trim() ? String(value).trim() : fallback;
}

/** Human date for mail/PDF copy. Never leave ISO `00:00:00.000Z` in the body. */
export function formatEmailDate(raw: unknown, locale = "ar"): string {
  const text = String(raw ?? "").trim();
  if (!text) return "";
  const human = formatHumanDate(text, localeOf(locale));
  if (human) return human;
  const invoice = formatInvoiceDate(text, invoiceLang(locale));
  if (invoice && !/00:00:00|\.000Z/i.test(invoice)) return invoice;
  return text
    .replace("T", " ")
    .replace(/\.000Z$/i, "")
    .replace(/\s*00:00:00(\.0+)?Z?/gi, "")
    .trim();
}

export function humanPaymentStatusLabel(status: string, locale = "ar"): string {
  const gate = String(status || "").trim().toLowerCase();
  if (gate === "paid" || gate === "success") {
    if (locale === "en") return "Paid";
    if (locale === "tr") return "Ödendi";
    return "مدفوع";
  }
  if (gate === "failed" || gate === "amount_mismatch") {
    if (locale === "en") return "Payment failed";
    if (locale === "tr") return "Ödeme başarısız";
    return "فشل الدفع";
  }
  if (locale === "en") return "Pending payment";
  if (locale === "tr") return "Ödeme bekleniyor";
  return "بانتظار الدفع";
}

export function bookingResumeUrl(view: Pick<HotelBookingConfirmView, "id" | "confirm" | "service" | "snapshot">): string {
  const snap = view.snapshot || {};
  if (view.service === "flight") {
    const flightId = snapStr(snap, "flight_booking_id");
    if (flightId) {
      return `${SITE_PUBLIC_URL}/flights/booking?id=${encodeURIComponent(flightId)}`;
    }
  }
  const path = invoiceServicePath(view.service);
  if (path === "/flights/booking") {
    return `${SITE_PUBLIC_URL}/flights/booking?id=${encodeURIComponent(view.id)}`;
  }
  const confirm = view.confirm ? `&confirm=${encodeURIComponent(view.confirm)}` : "";
  return `${SITE_PUBLIC_URL}${path}?booking=${encodeURIComponent(view.id)}${confirm}`;
}

function baggageLine(snap: Record<string, unknown>): string {
  return [
    snapStr(snap, "checkedBaggage") || snapStr(snap, "checked_baggage") || snapStr(snap, "baggage"),
    snapStr(snap, "cabinBaggage") || snapStr(snap, "cabin_baggage"),
  ]
    .filter(Boolean)
    .join(" · ");
}

function passengerLine(view: HotelBookingConfirmView): string {
  const names = (view.guest_names || []).filter(Boolean);
  if (names.length) return names.join(" · ");
  return view.customer_name || "";
}

function flightRoute(view: HotelBookingConfirmView): string {
  const snap = view.snapshot || {};
  return snapStr(snap, "route") || view.hotel_name || "";
}

export function bookingServiceTitle(view: HotelBookingConfirmView): string {
  if (view.service === "flight") return flightRoute(view) || "Flight";
  if (view.service === "hotel") return view.hotel_name;
  return view.hotel_name || view.service;
}

export function bookingDetailLines(
  view: HotelBookingConfirmView,
  locale = "ar"
): { ar: string; en: string } {
  const snap = view.snapshot || {};
  const depart = formatEmailDate(snapStr(snap, "departDate") || view.check_in, locale);
  const ret = formatEmailDate(snapStr(snap, "returnDate") || view.check_out, locale);
  if (view.service === "flight") {
    const pax = passengerLine(view);
    const bags = baggageLine(snap);
    const line = [flightRoute(view), depart && ret && depart === ret ? depart : [depart, ret].filter(Boolean).join(" → "), pax, bags]
      .filter(Boolean)
      .join(" · ");
    return { ar: line, en: line };
  }
  if (view.service === "hotel") {
    const address = snapStr(snap, "address") || snapStr(snap, "city");
    const board = snapStr(snap, "boardName") || snapStr(snap, "board");
    const line = [
      view.hotel_name,
      view.room_name,
      [formatEmailDate(view.check_in, locale), formatEmailDate(view.check_out, locale)].filter(Boolean).join(" → "),
      address,
      board,
    ]
      .filter(Boolean)
      .join(" · ");
    return { ar: line, en: line };
  }
  const vehicle = snapStr(snap, "vehicle") || snapStr(snap, "vehicleModel") || view.room_name;
  const pickup = snapStr(snap, "pickup") || snapStr(snap, "pickupLocation") || snapStr(snap, "address");
  const driver = snapStr(snap, "driver_notes") || snapStr(snap, "driverNotes") || snapStr(snap, "notes");
  const line = [view.hotel_name, vehicle, pickup, driver, formatEmailDate(view.check_in, locale)].filter(Boolean).join(" · ");
  return { ar: line, en: line };
}

export function buildBookingEmailVars(
  view: HotelBookingConfirmView,
  locale = "ar",
  extra: Record<string, string> = {}
): EmailVars {
  const snap = view.snapshot || {};
  const details = bookingDetailLines(view, locale);
  const route = flightRoute(view);
  return {
    name: view.customer_name,
    email: view.customer_email,
    booking_id: view.id,
    bookingId: view.id,
    service_name: bookingServiceTitle(view),
    detail_ar: details.ar,
    detail_en: details.en,
    amount: view.price,
    currency: view.currency || "USD",
    cta_url: bookingResumeUrl(view),
    route,
    depart_date: formatEmailDate(snapStr(snap, "departDate") || view.check_in, locale),
    return_date: formatEmailDate(snapStr(snap, "returnDate") || view.check_out, locale),
    passengers: passengerLine(view),
    baggage: baggageLine(snap),
    hotel_name: view.hotel_name,
    room_name: view.room_name,
    check_in: formatEmailDate(view.check_in, locale),
    check_out: formatEmailDate(view.check_out, locale),
    nights: view.nights,
    address: snapStr(snap, "address") || snapStr(snap, "city"),
    breakfast: snapStr(snap, "boardName") || snapStr(snap, "board"),
    vehicle: snapStr(snap, "vehicle") || snapStr(snap, "vehicleModel") || view.room_name,
    pickup: snapStr(snap, "pickup") || snapStr(snap, "pickupLocation"),
    driver_notes: snapStr(snap, "driver_notes") || snapStr(snap, "driverNotes"),
    ...extra,
  };
}

export function flightSessionDetail(
  booking: FlightBookingSession,
  locale = "ar"
): { route: string; detail: string; depart: string; ret: string; passengers: string; baggage: string } {
  const first = booking.itinerary?.legs[0];
  const last = booking.itinerary?.legs[(booking.itinerary?.legs.length || 1) - 1];
  const route = [
    first?.origin.displayCode || first?.origin.skyId,
    last?.destination.displayCode || last?.destination.skyId,
  ]
    .filter(Boolean)
    .join(" → ");
  const depart = formatEmailDate(first?.departure || "", locale);
  const ret = formatEmailDate(last?.arrival || "", locale);
  const names = (booking.travelers || [])
    .map((row) => [row.firstName || row.first_name, row.lastName || row.last_name].filter(Boolean).join(" "))
    .filter(Boolean);
  const passengers =
    names.join(" · ") ||
    `${booking.passengers.adults} ${locale === "en" ? "adult(s)" : locale === "tr" ? "yetişkin" : "بالغ"}`;
  const quoteBags = booking.quote?.baggage;
  const baggage = [
    typeof booking.itinerary?.baggageAllowance === "string" ? booking.itinerary.baggageAllowance : "",
    quoteBags?.checked,
    quoteBags?.cabin,
  ]
    .filter(Boolean)
    .join(" · ");
  const detail = [route, depart && ret ? `${depart} → ${ret}` : depart, passengers, baggage].filter(Boolean).join(" · ");
  return { route: route || "Flight", detail, depart, ret, passengers, baggage };
}

export function serviceUsesHotelWording(service: InvoiceService, text: string): boolean {
  if (service === "flight") {
    return /فندق|hotel|غرفة|check-?in|check-?out/i.test(text);
  }
  return false;
}
