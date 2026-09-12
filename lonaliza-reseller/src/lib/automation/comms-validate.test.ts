import { describe, expect, it } from "vitest";
import {
  isNumericWhatsAppPhoneId,
  looksLikeEmail,
  sanitizeWhatsAppPhoneNumberId,
  validateWhatsAppPhoneNumberId,
} from "./comms-validate";

describe("whatsapp phone number id", () => {
  it("rejects emails that used to leak into the ID field", () => {
    expect(looksLikeEmail("admin@lonaliza.com")).toBe(true);
    expect(sanitizeWhatsAppPhoneNumberId("admin@lonaliza.com")).toBe("");
    expect(validateWhatsAppPhoneNumberId("admin@lonaliza.com")).toMatch(/رقماً|بريد/);
  });

  it("accepts a numeric Cloud API phone id", () => {
    expect(isNumericWhatsAppPhoneId("123456789012345")).toBe(true);
    expect(validateWhatsAppPhoneNumberId("123456789012345")).toBeNull();
  });
});
