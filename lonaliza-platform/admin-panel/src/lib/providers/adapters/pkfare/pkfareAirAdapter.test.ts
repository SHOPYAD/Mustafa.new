import { describe, expect, it } from "vitest";
import { toPkfareCabin } from "./pkfareCabin";
import { toPkfareAirportIata, toPkfareCityIata } from "./pkfareIata";
import {
  parsePkfareAncillaryBags,
  parsePkfareMiniRules,
  parsePkfarePenaltyTexts,
  parsePkfareShoppingData,
  pkfareFlightSegmentIds,
  pkfareShoppingHasSolutions,
} from "./pkfareAirAdapter";

describe("toPkfareCabin", () => {
  it("maps letter and name codes to Shopping V10 words", () => {
    expect(toPkfareCabin()).toBe("Economy");
    expect(toPkfareCabin("Y")).toBe("Economy");
    expect(toPkfareCabin("economy")).toBe("Economy");
    expect(toPkfareCabin("C")).toBe("Business");
    expect(toPkfareCabin("business")).toBe("Business");
    expect(toPkfareCabin("F")).toBe("First");
    expect(toPkfareCabin("W")).toBe("Premium Economy");
    expect(toPkfareCabin("premium_economy")).toBe("Premium Economy");
  });
});

describe("toPkfareCityIata", () => {
  it("maps sky city ids to PKFare buyer city codes", () => {
    expect(toPkfareCityIata("PARI")).toBe("PAR");
    expect(toPkfareCityIata("ISTA")).toBe("IST");
    expect(toPkfareCityIata("PAR")).toBe("PAR");
    expect(toPkfareCityIata("CMN")).toBe("CAS");
    expect(toPkfareCityIata("CASA")).toBe("CAS");
    expect(toPkfareCityIata("DXB")).toBe("DXB");
    expect(toPkfareCityIata("DWC")).toBe("DXB");
  });
});

describe("toPkfareAirportIata", () => {
  it("maps city skyIds to airport IATA codes PKFare accepts", () => {
    expect(toPkfareAirportIata("ISTA")).toBe("IST");
    expect(toPkfareAirportIata("LON")).toBe("LHR");
    expect(toPkfareAirportIata("NYC")).toBe("JFK");
    expect(toPkfareAirportIata("PAR")).toBe("CDG");
    expect(toPkfareAirportIata("CASA")).toBe("CMN");
    expect(toPkfareAirportIata("CMN")).toBe("CMN");
    expect(toPkfareAirportIata("IST")).toBe("IST");
  });
});

const v10Fixture = {
  errorCode: "0",
  errorMsg: "ok",
  data: {
    shoppingKey: "test-key",
    solutions: [
      {
        solutionKey: "k",
        solutionId: "id",
        fareType: "PUBLIC",
        currency: "USD",
        adtFare: 472,
        adtTax: 140.4,
        journeys: { journey_0: ["flight-1"] },
        platingCarrier: "TK",
        brandName: "PRIMEFLY",
      },
    ],
    flights: [
      {
        flightId: "flight-1",
        journeyTime: 340,
        transferCount: 0,
        segmengtIds: ["seg-1"],
      },
    ],
    segments: [
      {
        segmentId: "seg-1",
        airline: "TK",
        flightNum: "618",
        cabinClass: "ECONOMY",
        bookingCode: "E",
        departure: "CMN",
        arrival: "IST",
        flightTime: 340,
        strDepartureDate: "2026-09-20",
        strDepartureTime: "15:50",
        strArrivalDate: "2026-09-20",
        strArrivalTime: "23:30",
      },
    ],
  },
};

describe("parsePkfareShoppingData", () => {
  it("reads PKFare's segmengtIds typo so V10 solutions become offers", () => {
    expect(pkfareFlightSegmentIds(v10Fixture.data.flights[0])).toEqual(["seg-1"]);
    const offers = parsePkfareShoppingData(v10Fixture, {
      adults: 1,
      children: 0,
      infants: 0,
      departureDate: "2026-09-20",
      cabinClass: "Economy",
    });
    expect(offers).toHaveLength(1);
    expect(offers[0].legs[0].origin).toBe("CMN");
    expect(offers[0].legs[0].destination).toBe("IST");
    expect(offers[0].legs[0].segments?.[0]?.flightNumber).toBe("618");
    expect(offers[0].price.total).toBeCloseTo(612.4);
  });

  it("groups branded fares of the same physical flight", () => {
    const branded = {
      ...v10Fixture,
      data: {
        ...v10Fixture.data,
        solutions: [
          { ...v10Fixture.data.solutions[0], solutionId: "basic", brandName: "BASIC", adtFare: 12.5, adtTax: 80.7 },
          { ...v10Fixture.data.solutions[0], solutionId: "premium", brandName: "PREMIUM", adtFare: 71.76, adtTax: 83.2, journeys: { journey_0: ["flight-other"] } },
        ],
        flights: [
          ...v10Fixture.data.flights,
          { flightId: "flight-other", journeyTime: 340, transferCount: 0, segmengtIds: ["seg-1"] },
        ],
      },
    };
    const offers = parsePkfareShoppingData(branded, {
      adults: 1,
      children: 0,
      infants: 0,
      departureDate: "2026-09-20",
      cabinClass: "Economy",
    });
    expect(offers).toHaveLength(1);
    expect(offers[0].fareOptions?.map((f) => f.brandName).sort()).toEqual(["BASIC", "PREMIUM"]);
  });

  it("gives distinct ids to different physical flights", () => {
    const otherSeg = {
      ...v10Fixture.data.segments[0],
      segmentId: "seg-2",
      flightNum: "619",
    };
    const two = {
      ...v10Fixture,
      data: {
        ...v10Fixture.data,
        solutions: [
          { ...v10Fixture.data.solutions[0], solutionId: "sol-a", brandName: "BASIC" },
          {
            ...v10Fixture.data.solutions[0],
            solutionId: "sol-b",
            brandName: "BASIC",
            journeys: { journey_0: ["flight-2"] },
          },
        ],
        flights: [
          ...v10Fixture.data.flights,
          { flightId: "flight-2", journeyTime: 340, transferCount: 0, segmengtIds: ["seg-2"] },
        ],
        segments: [...v10Fixture.data.segments, otherSeg],
      },
    };
    const offers = parsePkfareShoppingData(two, {
      adults: 1,
      children: 0,
      infants: 0,
      departureDate: "2026-09-20",
      cabinClass: "Economy",
    });
    expect(offers).toHaveLength(2);
    expect(offers[0].id).not.toBe(offers[1].id);
  });

  it("treats errorCode 0 with data:null as unusable so V8 fallback can run", () => {
    expect(pkfareShoppingHasSolutions({ errorCode: "0", errorMsg: "ok", data: null })).toBe(false);
    expect(pkfareShoppingHasSolutions(v10Fixture)).toBe(true);
    expect(pkfareShoppingHasSolutions({ errorCode: "P001", errorMsg: "illegal", data: null })).toBe(false);
  });
});

describe("parsePkfareMiniRules", () => {
  it("keeps non-refundable / non-changeable without inventing a fee", () => {
    const parsed = parsePkfareMiniRules(
      {
        ADT: [
          {
            miniRules: [
              { penaltyType: 0, when: 0, cannotDo: true, amount: 30, currency: "USD" },
              { penaltyType: 1, when: 0, cannotDo: false, amount: 30, currency: "USD" },
            ],
          },
        ],
      },
      "USD"
    );
    expect(parsed.refundable).toBe("not_available");
    expect(parsed.changeable).toBe("chargeable");
    expect(parsed.penalties[0].amount).toBeUndefined();
    expect(parsed.penalties[0].text).toBe("Non-refundable");
    expect(parsed.penalties[1].amount).toBe(30);
  });

  it("reads V10 isPermited=0 as not available", () => {
    const parsed = parsePkfareMiniRules(
      {
        ADT: [
          {
            miniRules: [
              { penaltyType: 0, isPermited: 0, when: 0, amount: null, currencyCode: null },
              { penaltyType: 2, isPermited: 0, when: 0, amount: null, currencyCode: null },
            ],
          },
        ],
      },
      "USD"
    );
    expect(parsed.refundable).toBe("not_available");
    expect(parsed.changeable).toBe("not_available");
  });

  it("reads V10 free change as included", () => {
    const parsed = parsePkfareMiniRules(
      {
        ADT: [
          {
            miniRules: [
              { penaltyType: 0, isPermited: 1, when: 0, penaltyFee: 0, currencyCode: "USD", description: "Free of charge" },
              { penaltyType: 2, isPermited: 1, when: 0, amount: 0, currencyCode: "USD" },
            ],
          },
        ],
      },
      "USD"
    );
    expect(parsed.refundable).toBe("included");
    expect(parsed.changeable).toBe("included");
  });

  it("keeps a reissue fee when a sibling rule says not permitted", () => {
    const parsed = parsePkfareMiniRules(
      {
        ADT: [
          {
            miniRules: [
              { penaltyType: 0, isPermited: 0, when: 0, amount: null, currencyCode: null },
              { penaltyType: 2, isPermited: 0, when: 0, amount: null, currencyCode: null },
              { penaltyType: 2, isPermited: 1, when: 0, amount: 93, currencyCode: "USD" },
            ],
          },
        ],
      },
      "USD"
    );
    expect(parsed.refundable).toBe("not_available");
    expect(parsed.changeable).toBe("chargeable");
    expect(parsed.penalties.find((p) => p.type === "change" && p.amount === 93)?.amount).toBe(93);
  });

  it("reads a change fee even when that same rule is marked not permitted", () => {
    const parsed = parsePkfareMiniRules(
      {
        ADT: [
          {
            miniRules: [{ penaltyType: 2, isPermited: 0, when: 0, amount: 131, currencyCode: "USD" }],
          },
        ],
      },
      "USD"
    );
    expect(parsed.changeable).toBe("chargeable");
    expect(parsed.penalties[0].amount).toBe(131);
  });
});

describe("parsePkfarePenaltyTexts", () => {
  it("reads reissue dollar amounts and skips structured-rule placeholders", () => {
    const rows = parsePkfarePenaltyTexts(
      ["Refer to structured rules.", "Reissue: 131.0 USD\nRefund: Non-refundable"],
      "USD"
    );
    expect(rows.some((p) => p.type === "change" && p.amount === 131)).toBe(true);
    expect(rows.some((p) => p.type === "cancel" && p.text === "Non-refundable")).toBe(true);
  });
});

describe("parsePkfareAncillaryBags", () => {
  it("reads paid weights and prices only", () => {
    const bags = parsePkfareAncillaryBags({
      errorCode: "0",
      data: {
        ancillary: {
          baggages: [
            { ancillaryKey: "a1", payBaggageType: 1, baggageWeight: "20KG", baggagePrice: 73.71, baggageCurrency: "USD", baggagePiece: 1 },
            { ancillaryKey: "a2", payBaggageType: 1, baggageWeight: "25KG", baggagePrice: 79.52, baggageCurrency: "USD", baggagePiece: 1 },
          ],
        },
      },
    });
    expect(bags).toHaveLength(2);
    expect(bags[0].weightKg).toBe(20);
    expect(bags[0].supplierPrice).toBeCloseTo(73.71);
    expect(bags[1].weightKg).toBe(25);
  });

  it("reads V6 ancillary array payload used by AJet paid bags", () => {
    const bags = parsePkfareAncillaryBags({
      errorCode: "0",
      data: [
        {
          ancillaryType: 1,
          ancillary: {
            ancillaries: {
              baggage: [
                { ancillaryKey: "a", ancillaryType: 1, payBaggageType: 1, baggagePiece: -1, baggageWeight: "5KG", baggageCurrency: "USD", baggagePrice: 18.69 },
                { ancillaryKey: "b", ancillaryType: 1, payBaggageType: 1, baggagePiece: -1, baggageWeight: "15KG", baggageCurrency: "USD", baggagePrice: 27.65 },
              ],
            },
          },
        },
      ],
    });
    expect(bags.map((b) => [b.weightKg, b.supplierPrice, b.pieces])).toEqual([
      [5, 18.69, 1],
      [15, 27.65, 1],
    ]);
  });

  it("returns empty on B190", () => {
    expect(parsePkfareAncillaryBags({ errorCode: "B190", errorMsg: "No ancillary product found." })).toEqual([]);
  });
});
