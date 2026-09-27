import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/server/channel-services-store", () => ({
  getChannelServices: vi.fn(async () => ({ appEnabled: { cars: true, holiday: true, tours: true } })),
  appEnabledKeys: vi.fn((config: { appEnabled: Record<string, boolean> }) =>
    Object.entries(config.appEnabled)
      .filter(([, on]) => on)
      .map(([key]) => key)
  ),
}));

vi.mock("@/lib/server/cars-store", () => ({
  listActiveInternalCars: vi.fn(async () => [{ id: "car-1", name: "Fiat" }]),
}));

vi.mock("@/lib/cars/matching", () => ({
  matchesInternalCar: () => true,
  sortFleet: (cars: unknown[]) => cars,
}));

vi.mock("@/lib/server/packages-store", () => ({
  listMergedPackages: vi.fn(async () => [{ id: "pkg-1", title: "Cappadocia" }]),
}));

const create = vi.fn();

vi.mock("@/lib/pocketbase/admin", () => ({
  tryCreateAdminPocketBase: vi.fn(async () => ({
    collection: () => ({ create }),
  })),
}));

vi.mock("@/lib/server/mobile/require-mobile-customer", () => ({
  isMobileAuthDenied: (value: unknown) => value instanceof Response && (value as Response).status === 401,
  requireMobileCustomer: vi.fn(async (req: Request) => {
    if (!req.headers.get("authorization")) {
      return new Response(JSON.stringify({ ok: false }), { status: 401 });
    }
    return { customer: { id: "user-42", email: "a@b.com", name: "Guest" }, token: "jwt" };
  }),
}));

describe("mobile catalog", () => {
  afterEach(() => {
    vi.resetModules();
    create.mockReset();
  });

  it("lists cars from the website store when the app channel is on", async () => {
    const { GET } = await import("./cars/route");
    const body = await (await GET(new NextRequest("http://localhost/api/mobile/v1/catalog/cars"))).json();
    expect(body.cars[0].id).toBe("car-1");
  });

  it("lists packages from the website store", async () => {
    const { GET } = await import("./packages/route");
    const body = await (await GET()).json();
    expect(body.packages[0].id).toBe("pkg-1");
  });

  it("persists a catalog enquiry with the quoted live price", async () => {
    create.mockResolvedValueOnce({ id: "enq-9" });
    const { POST } = await import("./enquire/route");
    const body = await (
      await POST(
        new NextRequest("http://localhost/api/mobile/v1/catalog/enquire", {
          method: "POST",
          headers: { authorization: "Bearer jwt", "content-type": "application/json" },
          body: JSON.stringify({ type: "cars", service_name: "Fiat", price: 41, currency: "USD" }),
        })
      )
    ).json();
    expect(body.bookingId).toBe("enq-9");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "cars",
        metadata: expect.objectContaining({ quotedPrice: 41, currency: "USD" }),
      })
    );
  });
});
