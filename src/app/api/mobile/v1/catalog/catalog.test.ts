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

describe("mobile catalog", () => {
  afterEach(() => {
    vi.resetModules();
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
});
