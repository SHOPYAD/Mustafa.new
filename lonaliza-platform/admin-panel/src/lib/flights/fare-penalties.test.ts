import { describe, expect, it } from "vitest";
import { collapseFarePenalties, customerFacingPenalties } from "./fare-penalties";

describe("collapseFarePenalties", () => {
  it("keeps before-departure fees and drops a contradictory free cancel on the same fare", () => {
    const parsed = collapseFarePenalties([
      { type: "cancel", amount: 53, currency: "USD", window: "before departure" },
      { type: "cancel", text: "Non-refundable", window: "after departure" },
      { type: "cancel", amount: 0, text: "Free", window: "before departure" },
      { type: "change", amount: 35, currency: "USD", window: "before departure" },
      { type: "change", text: "Non-changeable", window: "after departure" },
    ]);
    expect(parsed.refundable).toBe("chargeable");
    expect(parsed.changeable).toBe("chargeable");
    expect(parsed.penalties.filter((p) => p.type === "cancel")).toHaveLength(2);
    expect(parsed.penalties.find((p) => p.type === "cancel" && p.window?.includes("before"))?.amount).toBe(53);
    expect(parsed.penalties.some((p) => p.type === "cancel" && p.amount === 0)).toBe(false);
  });

  it("does not advertise free cancellation when the before-departure rule is forbidden", () => {
    const parsed = collapseFarePenalties([
      { type: "cancel", text: "Non-refundable", window: "before departure" },
      { type: "cancel", amount: 0, text: "Free", window: "after departure" },
    ]);
    expect(parsed.refundable).toBe("not_available");
  });

  it("hides after-departure rows from the customer-facing list", () => {
    const parsed = customerFacingPenalties([
      { type: "cancel", amount: 59, currency: "USD", window: "before departure" },
      { type: "cancel", text: "Non-refundable", window: "after departure" },
      { type: "change", amount: 0, text: "Free", window: "before departure" },
      { type: "change", text: "Non-changeable", window: "after departure" },
    ]);
    expect(parsed.penalties).toHaveLength(2);
    expect(parsed.penalties.every((p) => !String(p.window || "").includes("after"))).toBe(true);
    expect(parsed.penalties.find((p) => p.type === "cancel")?.amount).toBe(59);
    expect(parsed.penalties.find((p) => p.type === "change")?.amount).toBe(0);
    expect(parsed.afterDeparture).toHaveLength(2);
  });

  it("keeps a change fee when a sibling same-window row is not permitted", () => {
    const parsed = collapseFarePenalties([
      { type: "change", text: "Non-changeable", window: "before departure" },
      { type: "change", amount: 93, currency: "USD", window: "before departure" },
    ]);
    expect(parsed.changeable).toBe("chargeable");
    expect(parsed.penalties).toHaveLength(1);
    expect(parsed.penalties[0].amount).toBe(93);
  });
});
