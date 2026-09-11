import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const runFlightSearch = vi.fn();

vi.mock("@/lib/server/flights-engine", () => ({
  PUBLIC_FLIGHT_EMPTY: "empty",
  runFlightSearch,
}));

vi.mock("@/lib/server/channel-services-store", () => ({
  getChannelServices: vi.fn(async () => ({
    appEnabled: { flight: true },
    order: ["flight"],
  })),
  appEnabledKeys: vi.fn((config: { appEnabled: { flight: boolean } }) =>
    config.appEnabled.flight ? ["flight"] : []
  ),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  clientIp: () => "127.0.0.1",
  rateLimit: () => ({ ok: true }),
  rateLimitResponse: () => new Response("limited", { status: 429 }),
}));

describe("GET /api/mobile/v1/flights/search", () => {
  afterEach(() => {
    vi.resetModules();
    runFlightSearch.mockReset();
  });

  it("returns the same offer id and client price the website engine produced", async () => {
    runFlightSearch.mockResolvedValueOnce({
      ok: true,
      session: {
        sessionId: "sess-1",
        status: "complete",
        currency: "USD",
        itineraries: [
          {
            id: "offer-77",
            legs: [],
            price: { base: 90, client: 108, currency: "USD", taxes: 10 },
            stops: 0,
            durationMinutes: 120,
            airlines: ["TK"],
            badges: [],
          },
        ],
      },
    });
    const { GET } = await import("./search/route");
    const res = await GET(
      new NextRequest(
        "http://localhost/api/mobile/v1/flights/search?originSkyId=IST&destinationSkyId=DXB&date=2026-10-01"
      )
    );
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.offers[0].id).toBe("offer-77");
    expect(body.offers[0].pricing.total).toBe(108);
    expect(runFlightSearch).toHaveBeenCalled();
  });

  it("returns no offers when the app channel disables flights", async () => {
    const channel = await import("@/lib/server/channel-services-store");
    vi.mocked(channel.appEnabledKeys).mockReturnValueOnce([]);
    const { GET } = await import("./search/route");
    const body = await (
      await GET(new NextRequest("http://localhost/api/mobile/v1/flights/search?originSkyId=IST&destinationSkyId=DXB&date=2026-10-01"))
    ).json();
    expect(body.offers).toEqual([]);
    expect(runFlightSearch).not.toHaveBeenCalled();
  });
});
