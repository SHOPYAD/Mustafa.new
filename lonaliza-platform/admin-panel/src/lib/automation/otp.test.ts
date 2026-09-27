import { describe, expect, it } from "vitest";
import {
  DEFAULT_OTP_TTL_MS,
  MemoryOtpStore,
  evaluateOtp,
  generateOtpCode,
  hashOtp,
  hashesMatch,
  issueOtpRecord,
  persistIssuedOtp,
  verifyStoredOtp,
} from "@/lib/automation/otp";

const pepper = "test-pepper-do-not-use-in-prod";

describe("otp", () => {
  it("generates a 6-digit code", () => {
    const code = generateOtpCode(6);
    expect(code).toMatch(/^\d{6}$/);
  });

  it("hashes the same code to the same digest", () => {
    const a = hashOtp("123456", pepper, "905551112233", "register");
    const b = hashOtp("123456", pepper, "90 555 111 22 33", "register");
    expect(hashesMatch(a, b)).toBe(true);
    expect(hashesMatch(a, hashOtp("000000", pepper, "905551112233", "register"))).toBe(false);
  });

  it("verifies a fresh code and rejects reuse after consume", async () => {
    const store = new MemoryOtpStore();
    const issued = await persistIssuedOtp(store, {
      to: "guest@example.com",
      purpose: "register",
      channel: "email",
      pepper,
      code: "654321",
    });
    expect(issued.record.hash).not.toContain("654321");

    const first = await verifyStoredOtp(store, {
      to: "guest@example.com",
      code: "654321",
      purpose: "register",
      pepper,
    });
    expect(first.ok).toBe(true);

    const second = await verifyStoredOtp(store, {
      to: "guest@example.com",
      code: "654321",
      purpose: "register",
      pepper,
    });
    expect(second.ok).toBe(false);
    expect(second.error).toBe("consumed");
  });

  it("expires after ttl", () => {
    const issued = issueOtpRecord({
      to: "+90 555 000 11 22",
      purpose: "booking_confirm",
      channel: "whatsapp",
      pepper,
      code: "111222",
      now: 1_000,
      ttlMs: DEFAULT_OTP_TTL_MS,
    });
    const expired = evaluateOtp(issued.record, {
      to: "905550001122",
      code: "111222",
      purpose: "booking_confirm",
      pepper,
      now: 1_000 + DEFAULT_OTP_TTL_MS + 1,
    });
    expect(expired.ok).toBe(false);
    if (!expired.ok) expect(expired.error).toBe("expired");
  });

  it("rejects a wrong code then locks after max attempts", () => {
    const issued = issueOtpRecord({
      to: "905551112233",
      purpose: "login_verify",
      channel: "telegram",
      pepper,
      code: "999000",
      now: 10,
    });
    let current = issued.record;
    for (let i = 0; i < 5; i += 1) {
      const result = evaluateOtp(current, {
        to: "905551112233",
        code: "000000",
        purpose: "login_verify",
        pepper,
        now: 11,
      });
      expect(result.ok).toBe(false);
      current = result.next || current;
    }
    const locked = evaluateOtp(current, {
      to: "905551112233",
      code: "999000",
      purpose: "login_verify",
      pepper,
      now: 12,
    });
    expect(locked.ok).toBe(false);
    if (!locked.ok) expect(locked.error).toBe("locked");
  });
});
