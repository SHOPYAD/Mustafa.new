import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const createCheckout = vi.fn();
const getOne = vi.fn();

vi.mock("@/lib/server/mobile/require-mobile-customer", () => ({
  isMobileAuthDenied: (value: unknown) => value instanceof Response && "status" in value && (value as Response).status === 401,
  requireMobileCustomer: vi.fn(async (req: Request) => {
    if (!req.headers.get("authorization")) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401 });
    }
    return { customer: { id: "user-42", email: "guest@lonaliza.com", name: "Guest" }, token: "jwt" };
  }),
}));

vi.mock("@/lib/pocketbase/admin", () => ({
  tryCreateAdminPocketBase: vi.fn(async () => ({
    collection: () => ({ getOne }),
  })),
}));

vi.mock("@/lib/server/payments-settings", () => ({
  getIyzicoSecrets: vi.fn(async () => ({ enabled: true, apiKey: "k", secretKey: "s" })),
  getIyzicoMerchantUrls: vi.fn(async () => ({ callbackUrl: "https://lonaliza.com/pay/cb" })),
}));

vi.mock("@/lib/server/iyzico", () => ({
  createCheckout,
}));

vi.mock("@/lib/server/iyzico-bookings", () => ({
  persistCheckoutCharge: vi.fn(),
}));

vi.mock("@/lib/iyzico-limits", () => ({
  mapGuestCheckoutError: (err: string) => err,
}));

describe("POST /api/mobile/v1/payments/iyzico/init", () => {
  afterEach(() => {
    vi.resetModules();
    createCheckout.mockReset();
    getOne.mockReset();
  });

  it("returns 401 without a Bearer session and does not start checkout", async () => {
    const { POST } = await import("./iyzico/init/route");
    const res = await POST(new NextRequest("http://localhost/api/mobile/v1/payments/iyzico/init", { method: "POST" }));
    expect(res.status).toBe(401);
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it("rejects another customer's booking and ignores a client-undercut amount", async () => {
    getOne.mockResolvedValueOnce({
      id: "bkg-1",
      user: "other-user",
      price: 200,
      currency: "USD",
      hotel_name: "Test",
      room_name: "King",
      status: "pending",
    });
    const { POST } = await import("./iyzico/init/route");
    const res = await POST(
      new NextRequest("http://localhost/api/mobile/v1/payments/iyzico/init", {
        method: "POST",
        headers: { authorization: "Bearer jwt", "content-type": "application/json" },
        body: JSON.stringify({ bookingId: "bkg-1", amount: 1 }),
      })
    );
    expect(res.status).toBe(403);
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it("charges the server booking price, not the client amount", async () => {
    getOne.mockResolvedValueOnce({
      id: "bkg-1",
      user: "user-42",
      price: 200,
      currency: "USD",
      hotel_name: "Test",
      room_name: "King",
      status: "pending",
    });
    createCheckout.mockResolvedValueOnce({
      ok: true,
      token: "iy-1",
      paymentPageUrl: "https://iyzico.test/pay",
    });
    const { POST } = await import("./iyzico/init/route");
    const res = await POST(
      new NextRequest("http://localhost/api/mobile/v1/payments/iyzico/init", {
        method: "POST",
        headers: { authorization: "Bearer jwt", "content-type": "application/json" },
        body: JSON.stringify({ bookingId: "bkg-1", amount: 1 }),
      })
    );
    expect(res.status).toBe(200);
    expect(createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ price: 200, currency: "USD" })
    );
  });
});
