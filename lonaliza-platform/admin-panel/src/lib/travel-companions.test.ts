import { describe, expect, it } from "vitest";
import {
  companionCardCopy,
  companionsMatch,
  filterCompanionsByCity,
  normalizePlace,
} from "./travel-companions";

describe("travel companion matching", () => {
  it("normalizes Istanbul aliases to one key", () => {
    expect(normalizePlace("اسطنبول")).toBe("istanbul");
    expect(normalizePlace("إسطنبول")).toBe("istanbul");
    expect(normalizePlace("Istanbul")).toBe("istanbul");
    expect(normalizePlace("Istanbul, Turkey")).toBe("istanbul");
  });

  it("matches members from the same city even when destination differs", () => {
    expect(
      companionsMatch(
        { city: "الرياض", destination: "Istanbul" },
        { city: "Riyadh", destination: "Trabzon" },
      ),
    ).toBe(true);
  });

  it("matches the same destination when cities differ", () => {
    expect(
      companionsMatch(
        { city: "جدة", destination: "طرابزون" },
        { city: "دبي", destination: "Trabzon" },
      ),
    ).toBe(true);
  });

  it("matches when one traveler listed the other's city as destination", () => {
    expect(
      companionsMatch({ city: "Istanbul" }, { destination: "اسطنبول" }),
    ).toBe(true);
  });

  it("does not match unrelated cities", () => {
    expect(
      companionsMatch(
        { city: "Cairo", destination: "Paris" },
        { city: "Doha", destination: "London" },
      ),
    ).toBe(false);
  });

  it("finds others by a typed city name", () => {
    const people = [
      { city: "Istanbul", name: "A" },
      { city: "Riyadh", name: "B" },
      { destination: "اسطنبول", name: "C" },
    ];
    const found = filterCompanionsByCity("اسطنبول", people);
    expect(found.map((p) => p.name)).toEqual(["A", "C"]);
  });

  it("never uses raw JSON for companion cards", () => {
    const copy = companionCardCopy({
      name: "ferdos elhayatet",
      city: "Istanbul",
      destination: "Istanbul",
      bio: "Istanbul",
    });
    expect(copy.title).toBe("ferdos elhayatet");
    expect(copy.subtitle).toContain("Istanbul");
    expect(copy.title.startsWith("{")).toBe(false);
    expect(copy.subtitle.startsWith("{")).toBe(false);
  });
});
