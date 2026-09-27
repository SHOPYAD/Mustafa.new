import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignatureV3 } from "@/lib/server/iyzico";

function sign(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

describe("iyzico webhook signature", () => {
  const secret = "iyzico-test-secret";
  const body = {
    iyziEventType: "CHECKOUT_FORM_AUTH",
    paymentConversationId: "conv-1",
    status: "SUCCESS",
    token: "tok-1",
    iyziPaymentId: "pay-1",
    paymentId: "pay-1",
  };

  it("accepts a valid v3 signature", () => {
    const message =
      secret +
      body.iyziEventType +
      body.iyziPaymentId +
      body.token +
      body.paymentConversationId +
      body.status;
    expect(verifyWebhookSignatureV3(secret, sign(secret, message), body)).toBe(true);
  });

  it("rejects a missing or wrong signature", () => {
    expect(verifyWebhookSignatureV3(secret, "", body)).toBe(false);
    expect(verifyWebhookSignatureV3(secret, "deadbeef", body)).toBe(false);
  });
});
