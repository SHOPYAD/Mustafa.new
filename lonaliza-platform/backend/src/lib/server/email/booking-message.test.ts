import { describe, expect, it } from "vitest";
import {
  bookingDetailLines,
  bookingResumeUrl,
  formatEmailDate,
  humanPaymentStatusLabel,
  serviceUsesHotelWording,
} from "./booking-message";
import type { HotelBookingConfirmView } from "@/lib/server/hotel-booking-confirm";

function flightView(over: Partial<HotelBookingConfirmView> = {}): HotelBookingConfirmView {
  return {
    id: "k55el02b32nxbjk",
    hotel_id: "flight:TZX-DMM",
    hotel_name: "TZX → DMM",
    hotel_slug: "TZX-DMM",
    hotel_image: "",
    stars: 0,
    rating: 0,
    room_name: "",
    check_in: "2026-09-22 00:00:00.000Z",
    check_out: "2026-09-22 00:00:00.000Z",
    nights: 1,
    adults: 1,
    children: 0,
    guest_names: ["Ghizlane El kandoussi"],
    customer_name: "Ghizlane El kandoussi",
    customer_email: "guest@example.com",
    customer_phone: "",
    nightly: 0,
    price: 342.13,
    currency: "USD",
    payment_method: "card",
    status: "pending_payment",
    payment_status: "pending_payment",
    fulfilment_status: "awaiting_payment",
    supplier: "flynas",
    supplier_reference: "",
    hotel_confirmation_code: "",
    fulfilment_error: "",
    confirm: "tok",
    service: "flight",
    snapshot: {
      flight_booking_id: "flt_abc",
      route: "TZX → DMM",
      baggage: "20 KG",
      cabinBaggage: "7 KG",
    },
    ...over,
  };
}

describe("booking email copy", () => {
  it("formats ISO midnight stamps as human Arabic dates", () => {
    const formatted = formatEmailDate("2026-09-22 00:00:00.000Z", "ar");
    expect(formatted).not.toMatch(/00:00:00/);
    expect(formatted).not.toMatch(/\.000Z/);
    expect(formatted).toMatch(/2026/);
  });

  it("builds flight details without hotel wording", () => {
    const lines = bookingDetailLines(flightView(), "ar");
    expect(lines.ar).toMatch(/TZX/);
    expect(lines.ar).toMatch(/Ghizlane/);
    expect(serviceUsesHotelWording("flight", lines.ar)).toBe(false);
    expect(humanPaymentStatusLabel("pending_payment", "ar")).toBe("بانتظار الدفع");
    expect(humanPaymentStatusLabel("pending_payment", "ar")).not.toMatch(/ناجح/);
  });

  it("points unpaid flights at the flight resume URL", () => {
    expect(bookingResumeUrl(flightView())).toContain("/flights/booking?id=flt_abc");
  });
});
