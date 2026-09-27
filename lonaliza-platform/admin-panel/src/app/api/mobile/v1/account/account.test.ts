import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/server/mobile/require-mobile-customer", () => ({
  isMobileAuthDenied: (value: unknown) => value instanceof Response && (value as Response).status === 401,
  requireMobileCustomer: vi.fn(async (req: Request) => {
    if (!req.headers.get("authorization")) {
      return new Response(JSON.stringify({ ok: false }), { status: 401 });
    }
    return { customer: { id: "user-42", email: "a@b.com", name: "Guest" }, token: "jwt" };
  }),
}));

vi.mock("@/lib/loyalty/store", () => ({
  getLoyaltySettings: vi.fn(async () => ({
    enabled: true,
    pointsPerUsd: 1,
    pointsPerUsdRedeem: 100,
    minConvertPoints: 100,
  })),
}));

vi.mock("@/lib/loyalty/server", () => ({
  getWalletForUser: vi.fn(async () => ({
    points: 250,
    pendingPoints: 0,
    vouchers: [],
    ledger: [],
  })),
  walletSummary: vi.fn((_wallet: { points: number }, settings: { pointsPerUsdRedeem: number }) => ({
    points: 250,
    usd: 2.5,
    vouchers: [],
    settings,
  })),
  applyCouponToSession: vi.fn(async (code: string) => {
    if (code === "BAD") return { ok: false, error: "not_found" };
    return { ok: true, coupon: { code: "SAVE10" } };
  }),
}));

describe("mobile account wallet and coupons", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("requires Bearer for the wallet", async () => {
    const { GET } = await import("./wallet/route");
    const res = await GET(new NextRequest("http://localhost/api/mobile/v1/account/wallet"));
    expect(res.status).toBe(401);
  });

  it("returns the same loyalty points the website wallet would", async () => {
    const { GET } = await import("./wallet/route");
    const body = await (
      await GET(
        new NextRequest("http://localhost/api/mobile/v1/account/wallet", {
          headers: { authorization: "Bearer jwt" },
        })
      )
    ).json();
    expect(body.points).toBe(250);
    expect(body.usd).toBe(2.5);
  });

  it("rejects an unknown coupon with the website error meaning", async () => {
    const { POST } = await import("./loyalty/apply/route");
    const res = await POST(
      new NextRequest("http://localhost/api/mobile/v1/account/loyalty/apply", {
        method: "POST",
        headers: { authorization: "Bearer jwt", "content-type": "application/json" },
        body: JSON.stringify({ code: "BAD", service: "hotel" }),
      })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("not_found");
  });
});
