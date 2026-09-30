import { describe, expect, it } from "vitest";
import {
  BOOKING_CLUSTERS,
  maskName,
  pickFocusRequest,
  refundPreview,
  requestStage,
  summarizeBookings,
  type BookingRowInput,
} from "./bookings-graph";

const rows: BookingRowInput[] = [
  { id: "b1", status: "confirmed", payment_status: "paid", cancel_status: "none", supplier_reference: "HB-1" },
  { id: "b2", status: "confirmed", payment_status: "paid", cancel_status: "refunded", customer_name: "Sara Ahmed" },
  { id: "b3", status: "cancelled", payment_status: "paid", cancel_status: "pending_admin", customer_name: "Omar Khalid Ali", cancel_reason: " تغيير الخطط ", free_cancellation: true, cancel_until: "2026-10-01T00:00:00Z" },
  { id: "b4", cancel_status: "pending_admin", request_type: "change" },
];

describe("bookings studio adapter", () => {
  it("covers the eight spec components with stable ids", () => {
    const ids = BOOKING_CLUSTERS.map((c) => c.specId).filter(Boolean).sort();
    expect(ids).toEqual(["domain.03.component.2", "domain.03.component.3", "domain.03.component.4", "domain.03.component.5", "domain.03.component.6", "domain.03.component.7", "domain.03.component.8"]);
    for (const c of BOOKING_CLUSTERS) expect(c.evidenceRef.length).toBeGreaterThan(0);
  });

  it("summarizes cancellation, confirmation and payment state", () => {
    const sum = summarizeBookings(rows);
    expect(sum.sampled).toBe(4);
    expect(sum.cancel.pending_admin).toBe(2);
    expect(sum.cancel.refunded).toBe(1);
    expect(sum.confirmed).toBe(2);
    expect(sum.paid).toBe(3);
    expect(sum.withSupplierRef).toBe(1);
  });

  it("focuses the pending cancellation, ignoring date-change requests", () => {
    const focus = pickFocusRequest(rows);
    expect(focus?.bookingId).toBe("b3");
    expect(focus?.customer).toBe("Omar K.");
    expect(focus?.reason).toBe("تغيير الخطط");
    expect(focus?.policy).toBe("إلغاء مجاني حتى 2026-10-01");
    expect(pickFocusRequest([rows[0]])).toBeNull();
  });

  it("masks names and previews refunds without exceeding the paid amount", () => {
    expect(maskName(undefined)).toBe("غير مسجل");
    expect(refundPreview({ charged_amount: 100, cancel_fee_amount: 150, charged_currency: "TRY", cancel_status: "pending_admin" })).toEqual({
      paid: 100,
      fee: 100,
      refund: 0,
      currency: "TRY",
      actionable: true,
    });
    expect(refundPreview({ charged_amount: 250.5, cancel_fee_amount: 50, cancel_status: "approved" }).actionable).toBe(false);
  });

  it("maps request state to the three review stages", () => {
    expect(requestStage("none")).toBe(0);
    expect(requestStage("pending_admin")).toBe(2);
    expect(requestStage("refund_failed")).toBe(3);
  });
});
