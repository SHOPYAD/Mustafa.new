import { describe, expect, it } from "vitest";
import { getFlightFingerprint, pruneDominatedFareFamilies, type PublicFlightItinerary } from "./flights-engine";

function itinerary(id: string, flightNumber: string): PublicFlightItinerary {
  return {
    id,
    legs: [
      {
        id: `${id}_leg_0`,
        origin: { skyId: "CDG", displayCode: "CDG" },
        destination: { skyId: "SAW", displayCode: "SAW" },
        departure: "2026-09-18T12:35:00",
        arrival: "2026-09-18T17:10:00",
        durationMinutes: 215,
        stopCount: 0,
        segments: [
          {
            flightNumber,
            airlineCode: "VF",
            airline: "AJet",
            origin: { skyId: "CDG", displayCode: "CDG" },
            destination: { skyId: "SAW", displayCode: "SAW" },
            departure: "2026-09-18T12:35:00",
            arrival: "2026-09-18T17:10:00",
            durationMinutes: 215,
          },
        ],
      },
    ],
    price: { base: 93.2, client: 109.98, currency: "USD" },
    stops: 0,
    durationMinutes: 215,
    airlines: ["VF"],
    badges: [],
  };
}

describe("getFlightFingerprint", () => {
  it("matches Sky VF12 with PKFare flight 12", () => {
    const sky = itinerary("sky_1", "VF12");
    const pk = itinerary("pk_1", "12");
    const skyDash = itinerary("sky_2", "VF12-3200");
    expect(getFlightFingerprint(sky)).toBe(getFlightFingerprint(pk));
    expect(getFlightFingerprint(sky)).toBe(getFlightFingerprint(skyDash));
  });
});

describe("pruneDominatedFareFamilies", () => {
  it("never drops a supplier-named brand even when a cheaper derived fare looks worse-or-equal", () => {
    const none = { status: "none" as const, text: "0PC" };
    const attrs = { refund: "not_available" as const, change: "not_available" as const, seat: "unknown" as const, meal: "unknown" as const, priority: "unknown" as const };
    const kept = pruneDominatedFareFamilies([
      {
        id: "derived",
        name: "غير قابل للاسترداد · غير قابل للتغيير · بدون أمتعة مسجلة",
        nameSource: "derived",
        price: { base: 12.5, client: 109.87, currency: "USD" },
        attributes: attrs,
        baggageDetail: { checked: none, cabin: none },
      },
      {
        id: "eco",
        name: "ECOJET",
        nameSource: "supplier",
        price: { base: 39.73, client: 145, currency: "USD" },
        attributes: attrs,
        baggageDetail: { checked: none, cabin: none },
      },
      {
        id: "pre",
        name: "PREMIUM",
        nameSource: "supplier",
        price: { base: 71.76, client: 183, currency: "USD" },
        attributes: attrs,
        baggageDetail: { checked: none, cabin: none },
      },
    ]);
    expect(kept.map((f) => f.name).sort()).toEqual(["ECOJET", "PREMIUM", "غير قابل للاسترداد · غير قابل للتغيير · بدون أمتعة مسجلة"].sort());
  });
});
