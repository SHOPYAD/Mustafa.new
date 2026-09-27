import { describe, expect, it } from "vitest";
import {
  assertNoRawCardData,
  detectCardBrand,
  formatCardNumberDisplay,
  last4Of,
  parseCardForm,
  redactPaymentPayload,
} from "./card-fields";

describe("card field helpers", () => {
  it("formats PAN for display and never keeps spaces in the charge payload", () => {
    expect(formatCardNumberDisplay("5528790000000008")).toBe("5528 7900 0000 0008");
    const parsed = parseCardForm({
      cardHolderName: "Ada Lovelace",
      cardNumber: "5528 7900 0000 0008",
      expiry: "12/30",
      cvc: "123",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.card.cardNumber).toBe("5528790000000008");
      expect(last4Of(parsed.card.cardNumber)).toBe("0008");
      expect(detectCardBrand(parsed.card.cardNumber)).toBe("Mastercard");
    }
  });

  it("strips PAN/CVV from any object that might be persisted", () => {
    const redacted = redactPaymentPayload({
      bookingId: "bk1",
      cardNumber: "5528790000000008",
      cvc: "123",
      saveCard: true,
      nested: { cardHolderName: "Ada", last4: "0008" },
    });
    expect(redacted).toEqual({ bookingId: "bk1", saveCard: true, nested: { last4: "0008" } });
    expect(() =>
      assertNoRawCardData({ snapshot: { cardNumber: "5528790000000008", cvc: "123" } })
    ).toThrow("raw_card_data_forbidden");
  });
});
