import { describe, expect, it } from "vitest";
import {
  paymentEmailGate,
  pendingTemplateKinds,
  successTemplateKinds,
  templateKindsForGate,
} from "./payment-gate";

describe("payment email gate", () => {
  it("treats checkout-create pending_payment as pending, never paid", () => {
    expect(paymentEmailGate({ status: "pending_payment", payment_status: "pending_payment" })).toBe(
      "pending"
    );
    expect(paymentEmailGate({ status: "pending_payment" })).toBe("pending");
  });

  it("requires verified paid status", () => {
    expect(paymentEmailGate({ status: "paid", payment_status: "paid" })).toBe("paid");
    expect(paymentEmailGate({ status: "pending_payment", payment_status: "paid" })).toBe("paid");
  });

  it("maps iyzico failures to failed", () => {
    expect(paymentEmailGate({ status: "pending_payment", payment_status: "failed" })).toBe("failed");
    expect(paymentEmailGate({ payment_status: "amount_mismatch" })).toBe("failed");
  });

  it("never selects hotel_success for a Flynas-style flight", () => {
    const kinds = templateKindsForGate("flight", "pending");
    expect(kinds).toEqual(["flight_reminder"]);
    expect(kinds.join()).not.toMatch(/hotel/);
    expect(successTemplateKinds("flight")).toEqual(["flight_success", "booking_success"]);
    expect(successTemplateKinds("flight")).not.toContain("hotel_success");
  });

  it("uses hotel templates only for hotels", () => {
    expect(pendingTemplateKinds("hotel")).toEqual(["hotel_reminder"]);
    expect(successTemplateKinds("hotel")[0]).toBe("hotel_success");
  });
});
