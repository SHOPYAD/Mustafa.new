import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const searchGeoPlaces = vi.fn();
const searchLocalAirports = vi.fn();

vi.mock("@/lib/server/geo-places", () => ({ searchGeoPlaces }));
vi.mock("@/lib/server/airports-db", () => ({ searchLocalAirports }));
vi.mock("@/lib/providers/adapters/seeru/seeruRideAdapter", () => ({
  SeeruRideAdapter: class {
    searchLocations = vi.fn(async () => [{ place_id: "ist", label: "Istanbul Airport" }]);
  },
}));

describe("GET /api/mobile/v1/places", () => {
  afterEach(() => {
    vi.resetModules();
    searchGeoPlaces.mockReset();
    searchLocalAirports.mockReset();
  });

  it("maps website hotel geo places into the Flutter place list", async () => {
    searchGeoPlaces.mockResolvedValueOnce([
      { id: "p1", city: "Istanbul", country: "Turkey", countryCode: "TR", admin1: "Istanbul", geoId: "293974", population: 1 },
    ]);
    const { GET } = await import("./route");
    const body = await (await GET(new NextRequest("http://localhost/api/mobile/v1/places?type=hotels&q=ist"))).json();
    expect(body.places[0].place_id).toBe("293974");
    expect(body.places[0].name).toBe("Istanbul");
  });

  it("groups website airports for the flight picker", async () => {
    searchLocalAirports.mockResolvedValueOnce([
      { skyId: "IST", iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", kind: "airport" },
    ]);
    const { GET } = await import("./route");
    const body = await (await GET(new NextRequest("http://localhost/api/mobile/v1/places?type=airports&q=ist"))).json();
    expect(body.locations[0].airports[0].iata).toBe("IST");
  });
});
