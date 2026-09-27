import { describe, expect, it } from "vitest";
import { isWebhookPaidPromotion, resolveIyzicoPaymentState } from "./paid-promotion";

describe("resolveIyzicoPaymentState", () => {
  const base = {
    alreadyPaid: false,
    retrievedPaid: false,
    pendingReview: false,
    retrieveOk: true,
    amountMatched: true,
  };

  it("never promotes a 3DS/callback retrieve-success to paid", () => {
    for (const source of ["callback", "threeds", "refresh"] as const) {
      const next = resolveIyzicoPaymentState({
        ...base,
        retrievedPaid: true,
        source,
      });
      expect(next.status).toBe("pending_payment");
      expect(next.paymentStatus).toBe("awaiting_webhook");
      expect(isWebhookPaidPromotion(source, next.status)).toBe(false);
    }
  });

  it("promotes only a signed webhook SUCCESS with a paid retrieve", () => {
    const next = resolveIyzicoPaymentState({
      ...base,
      retrievedPaid: true,
      webhookStatus: "SUCCESS",
      source: "webhook",
    });
    expect(next).toEqual({ status: "paid", paymentStatus: "paid" });
    expect(isWebhookPaidPromotion("webhook", next.status)).toBe(true);
  });

  it("keeps abandoned / failed ACS as pending_payment or failed, never paid", () => {
    expect(
      resolveIyzicoPaymentState({
        ...base,
        retrieveOk: false,
        source: "threeds",
      }).status
    ).toBe("pending_payment");
    expect(
      resolveIyzicoPaymentState({
        ...base,
        webhookStatus: "FAILURE",
        source: "webhook",
      })
    ).toEqual({ status: "pending_payment", paymentStatus: "failed" });
  });

  it("does not treat URL-less retrieve success without webhook as paid", () => {
    const next = resolveIyzicoPaymentState({
      ...base,
      retrievedPaid: true,
    });
    expect(next.status).toBe("pending_payment");
    expect(next.paymentStatus).toBe("awaiting_webhook");
  });
});
