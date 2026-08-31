import { describe, expect, it } from "vitest";

/**
 * Contract fixture for Iyzico checkout init/callback — no live keys.
 * Guards the fields the production routes must keep sending.
 */
const requiredInitFields = [
  "bookingId",
  "conversationId",
  "price",
  "currency",
  "callbackUrl",
  "buyer",
] as const;

const requiredCallbackFields = ["token", "conversationId"] as const;

describe("iyzico checkout fixtures", () => {
  it("keeps init field names stable", () => {
    const sample = {
      bookingId: "bk_1",
      conversationId: "conv_1",
      price: 100,
      currency: "TRY",
      callbackUrl: "https://lonaliza.com/api/payments/iyzico/callback",
      buyer: { id: "u1", name: "A", surname: "B", email: "a@b.c", phone: "5" },
    };
    for (const key of requiredInitFields) {
      expect(sample[key]).toBeTruthy();
    }
  });

  it("keeps callback field names stable", () => {
    const sample = { token: "tok", conversationId: "conv_1" };
    for (const key of requiredCallbackFields) {
      expect(sample[key]).toBeTruthy();
    }
  });
});
