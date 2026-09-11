import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const runPublicHotelSearch = vi.fn();
const createHotelQuote = vi.fn();
const getHotelQuote = vi.fn();
const quoteIsUsable = vi.fn();
const updateHotelQuote = vi.fn();
const create = vi.fn();

vi.mock("@/lib/server/hotels-search-runtime", () => ({
  runPublicHotelSearch,
}));

vi.mock("@/lib/server/channel-services-store", () => ({
  getChannelServices: vi.fn(async () => ({ appEnabled: { hotel: true } })),
  appEnabledKeys: vi.fn((config: { appEnabled: { hotel?: boolean } }) =>
    config.appEnabled.hotel ? ["hotel"] : []
  ),
}));

vi.mock("@/lib/server/hotels/quote-service", () => ({
  createHotelQuote,
  toPublicQuote: (quote: { id: string }) => quote,
  getHotelQuote,
  quoteIsUsable,
  updateHotelQuote,
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

vi.mock("@/lib/pocketbase/admin", () => ({
  tryCreateAdminPocketBase: vi.fn(async () => ({
    collection: () => ({ create }),
  })),
}));

describe("GET /api/mobile/v1/hotels/search", () => {
  afterEach(() => {
    vi.resetModules();
    runPublicHotelSearch.mockReset();
  });

  it("returns empty hotels when the app channel is off", async () => {
    const channel = await import("@/lib/server/channel-services-store");
    vi.mocked(channel.appEnabledKeys).mockReturnValueOnce([]);
    const { GET } = await import("./search/route");
    const body = await (await GET(new NextRequest("http://localhost/api/mobile/v1/hotels/search?q=Istanbul"))).json();
    expect(body.hotels).toEqual([]);
    expect(runPublicHotelSearch).not.toHaveBeenCalled();
  });

  it("calls the website hotel search function, not a cookie HTTP route", async () => {
    runPublicHotelSearch.mockResolvedValueOnce({
      hotels: [{ id: "h1", name: "Test" }],
      totalCount: 1,
      page: 0,
      pageSize: 20,
      hasMore: false,
    });
    const { GET } = await import("./search/route");
    const body = await (await GET(new NextRequest("http://localhost/api/mobile/v1/hotels/search?q=Istanbul"))).json();
    expect(body.hotels[0].id).toBe("h1");
    expect(runPublicHotelSearch).toHaveBeenCalled();
  });
});

describe("POST /api/mobile/v1/hotels/book", () => {
  afterEach(() => {
    vi.resetModules();
    getHotelQuote.mockReset();
    quoteIsUsable.mockReset();
    create.mockReset();
  });

  it("rejects book without a usable quote", async () => {
    const { POST } = await import("./book/route");
    const res = await POST(
      new NextRequest("http://localhost/api/mobile/v1/hotels/book", {
        method: "POST",
        headers: { authorization: "Bearer jwt", "content-type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("persists the hotel booking for the Bearer customer", async () => {
    getHotelQuote.mockResolvedValueOnce({
      id: "q1",
      user: "user-42",
      hotelId: "h1",
      hotelName: "Test",
      roomName: "King",
      checkIn: "2026-10-01",
      checkOut: "2026-10-03",
      adults: 2,
      childrenAges: [],
      sellingTotal: 180,
      currency: "USD",
      supplier: "ratehawk",
    });
    quoteIsUsable.mockReturnValueOnce({ ok: true });
    create.mockResolvedValueOnce({ id: "bkg-9" });
    const { POST } = await import("./book/route");
    const body = await (
      await POST(
        new NextRequest("http://localhost/api/mobile/v1/hotels/book", {
          method: "POST",
          headers: { authorization: "Bearer jwt", "content-type": "application/json" },
          body: JSON.stringify({ quoteId: "q1" }),
        })
      )
    ).json();
    expect(body.bookingId).toBe("bkg-9");
    expect(body.price).toBe(180);
  });
});
