import { describe, expect, it } from "vitest";
import {
  createAdminSessionToken,
  looksLikeSignedAdminToken,
  verifyAdminSessionToken,
} from "@/lib/admin-session-token";

describe("admin session token", () => {
  it("accepts a freshly signed token and rejects cookie=1", async () => {
    const secret = "a".repeat(32);
    const token = await createAdminSessionToken(secret, 60);
    expect(looksLikeSignedAdminToken("1")).toBe(false);
    expect(looksLikeSignedAdminToken(token)).toBe(true);
    expect(await verifyAdminSessionToken(secret, token)).toBe(true);
    expect(await verifyAdminSessionToken(secret, "1")).toBe(false);
    expect(await verifyAdminSessionToken("other-secret-value-32chars-long", token)).toBe(false);
  });

  it("rejects an expired token", async () => {
    const secret = "b".repeat(32);
    const token = await createAdminSessionToken(secret, -10);
    expect(await verifyAdminSessionToken(secret, token)).toBe(false);
  });
});
