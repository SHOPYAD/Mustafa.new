import { describe, expect, it } from "vitest";
import {
  applyGroundTransportXor,
  classifySalesChatIntent,
  filterRequestedTools,
  planSalesChatTools,
  type SalesChatToolName,
} from "./sales-chat-intent";

const FLIGHT_ONLY_AR =
  "اريد رحلة طيران من اسطنبول الى لندن مباشرة رخيصة مع امتعة";

const PACKAGE_AR =
  "رحلة إلى طرابزون شخصين مدة عشر ايام بعد اسبوعين شامل الطيران والفنادق والكوخ والجولات السياحية";

describe("classifySalesChatIntent", () => {
  it("classifies a cheap one-way flight request as flight search", () => {
    expect(classifySalesChatIntent(FLIGHT_ONLY_AR)).toBe("INTENT_FLIGHT_SEARCH");
  });

  it("classifies an explicit bundled trip as package planner", () => {
    expect(classifySalesChatIntent(PACKAGE_AR)).toBe("INTENT_PACKAGE_PLANNER");
  });

  it("classifies hotel-only, car-only, and transfer-only utterances", () => {
    expect(classifySalesChatIntent("أبغى فندق في إسطنبول أربع ليال لشخصين")).toBe(
      "INTENT_HOTEL_SEARCH"
    );
    expect(classifySalesChatIntent("أريد تأجير سيارة من مطار إسطنبول أسبوع")).toBe(
      "INTENT_CAR_SEARCH"
    );
    expect(
      classifySalesChatIntent("ترانسفير خاص من مطار إسطنبول إلى الفندق غداً")
    ).toBe("INTENT_TRANSFER_SEARCH");
  });
});

describe("planSalesChatTools", () => {
  it("flight-only utterance never includes the car tool", () => {
    const plan = planSalesChatTools(FLIGHT_ONLY_AR);
    expect(plan.intent).toBe("INTENT_FLIGHT_SEARCH");
    expect(plan.tools).toEqual(["search_flights"]);
    expect(plan.tools).not.toContain("search_cars");
    expect(plan.tools).not.toContain("search_transfers");
    expect(plan.tools).not.toContain("search_hotels");
    expect(plan.stages).toEqual(["understand", "dates", "flights"]);
    expect(plan.stages).not.toContain("cars");
    expect(plan.flightType).toBe("one-way");
  });

  it("package utterance may use both hotel and flight tools", () => {
    const plan = planSalesChatTools(PACKAGE_AR);
    expect(plan.intent).toBe("INTENT_PACKAGE_PLANNER");
    expect(plan.tools).toContain("search_flights");
    expect(plan.tools).toContain("search_hotels");
  });

  it("package with a private Vito uses transfer XOR car, not both", () => {
    const plan = planSalesChatTools(`${PACKAGE_AR} بسيارة فيتو خاصة`);
    expect(plan.tools).toContain("search_transfers");
    expect(plan.tools).not.toContain("search_cars");
    expect(plan.groundMode).toBe("transfer");
    expect(plan.stages).toContain("transfers");
    expect(plan.stages).not.toContain("cars");
  });

  it("package with rental car uses car XOR transfer, not both", () => {
    const plan = planSalesChatTools(`${PACKAGE_AR} مع تأجير سيارة`);
    expect(plan.tools).toContain("search_cars");
    expect(plan.tools).not.toContain("search_transfers");
    expect(plan.groundMode).toBe("car");
  });

  it("keeps both ground tools only when the user asks for transfer and rental", () => {
    const plan = planSalesChatTools(
      `${PACKAGE_AR} مع ترانسفير خاص وتأجير سيارة`
    );
    expect(plan.groundMode).toBe("both");
    expect(plan.tools).toContain("search_transfers");
    expect(plan.tools).toContain("search_cars");
  });
});

describe("filterRequestedTools", () => {
  it("strips car/transfer tools even if the model requests them on a flight intent", () => {
    const requested: SalesChatToolName[] = [
      "search_flights",
      "search_cars",
      "search_transfers",
      "search_hotels",
    ];
    expect(
      filterRequestedTools("INTENT_FLIGHT_SEARCH", requested)
    ).toEqual(["search_flights"]);
  });
});

describe("applyGroundTransportXor", () => {
  const cards = [
    { type: "flight" as const, id: "f1" },
    { type: "hotel" as const, id: "h1" },
    { type: "transfer" as const, id: "t1" },
    { type: "car" as const, id: "c1" },
  ];

  it("drops the rental car when the package ground mode is transfer", () => {
    expect(applyGroundTransportXor(cards, "transfer").map((c) => c.type)).toEqual([
      "flight",
      "hotel",
      "transfer",
    ]);
  });

  it("drops the private transfer when the package ground mode is car", () => {
    expect(applyGroundTransportXor(cards, "car").map((c) => c.type)).toEqual([
      "flight",
      "hotel",
      "car",
    ]);
  });

  it("keeps both only when mode is both", () => {
    expect(applyGroundTransportXor(cards, "both").map((c) => c.type)).toEqual([
      "flight",
      "hotel",
      "transfer",
      "car",
    ]);
  });
});
