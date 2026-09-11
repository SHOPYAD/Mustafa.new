import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/server/branding-store", () => ({
  getBranding: vi.fn(async () => ({
    colors: { primary: "#2e1065", accent: "#f59e0b", secondary: "#ffffff" },
    siteName: "Lonaliza",
  })),
}));

vi.mock("@/lib/server/currencies-store", () => ({
  getCurrenciesSettings: vi.fn(async () => ({
    defaultCode: "USD",
    liveFxEnabled: true,
    currencies: [
      { code: "USD", enabled: true },
      { code: "TRY", enabled: true },
      { code: "EUR", enabled: false },
    ],
  })),
}));

vi.mock("@/lib/server/channel-services-store", () => ({
  getChannelServices: vi.fn(async () => ({
    websiteEnabled: { flight: true, hotel: true, cars: true },
    appEnabled: { flight: false, hotel: true, cars: false },
    order: ["flight", "hotel", "cars"],
    updatedAt: "2026-09-11T00:00:00.000Z",
  })),
  appEnabledKeys: vi.fn(() => ["hotel"]),
}));

describe("GET /api/mobile/v1/bootstrap", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("returns branding and only app-enabled services, with no catalog rows", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.branding.colors.primary).toBe("#2e1065");
    expect(body.services).toEqual([{ key: "hotel" }]);
    expect(body.locales).toEqual(expect.arrayContaining(["ar", "en", "tr", "fr"]));
    expect(body.currencies).toEqual(expect.arrayContaining(["USD", "TRY"]));
    expect(body.currencies).not.toContain("EUR");
    expect(body.offers).toBeUndefined();
    expect(body.flights).toBeUndefined();
    expect(body.hotels).toBeUndefined();
    expect(body.surfaces.some((s: { key: string }) => s.key === "hotel")).toBe(true);
    expect(body.surfaces.some((s: { key: string }) => s.key === "ai-chat")).toBe(true);
  });

  it("returns an empty services array when every app flag is false", async () => {
    const channel = await import("@/lib/server/channel-services-store");
    vi.mocked(channel.appEnabledKeys).mockReturnValueOnce([]);
    const { GET } = await import("./route");
    const body = await (await GET()).json();
    expect(body.ok).toBe(true);
    expect(body.services).toEqual([]);
  });
});

describe("requireMobileCustomer", () => {
  it("returns 401 without leaking offers when Authorization is missing", async () => {
    const { requireMobileCustomer } = await import(
      "@/lib/server/mobile/require-mobile-customer"
    );
    const req = new NextRequest("http://localhost/api/mobile/v1/flights");
    const denied = await requireMobileCustomer(req);
    expect(denied).not.toBeNull();
    expect(denied!.status).toBe(401);
    const body = await denied!.json();
    expect(body.offers).toBeUndefined();
    expect(body.ok).toBe(false);
  });

  it("rejects a B2B partner key header as a customer session", async () => {
    const { requireMobileCustomer } = await import(
      "@/lib/server/mobile/require-mobile-customer"
    );
    const req = new NextRequest("http://localhost/api/mobile/v1/flights", {
      headers: { "x-lonaliza-b2b-key": "partner-secret" },
    });
    const denied = await requireMobileCustomer(req);
    expect(denied?.status).toBe(401);
  });
});
