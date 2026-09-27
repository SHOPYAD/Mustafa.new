import { describe, expect, it } from "vitest";
import {
  addLogoItem,
  defaultLogoItems,
  parseLogoField,
  parseLogoList,
  readLogoList,
  replaceLogoUrl,
  serializeLogoList,
} from "./logo-lists";
import { defaultSectionForType } from "./schema";

describe("logo lists", () => {
  it("parses logo fields and replaces a tile url", () => {
    expect(parseLogoField("logo.hotels.six-senses-ist")).toEqual({
      kind: "hotels",
      id: "six-senses-ist",
    });
    const next = replaceLogoUrl(defaultLogoItems("partners"), "rixos", "/hotels/rixos.svg");
    expect(next.find((row) => row.id === "rixos")?.logoUrl).toBe("/hotels/rixos.svg");
  });

  it("adds without a cap and serializes back", () => {
    let items = defaultLogoItems("hotels");
    const start = items.length;
    items = addLogoItem(items, "hotels");
    items = addLogoItem(items, "hotels");
    expect(items.length).toBe(start + 2);
    expect(parseLogoList(serializeLogoList(items))).toHaveLength(start + 2);
  });

  it("reads draft settings before catalog defaults", () => {
    const instance = defaultSectionForType("partners");
    instance.settings.partnersLogosJson = serializeLogoList([
      { id: "custom", name: "Custom", logoUrl: "/uploads/logo.png" },
    ]);
    expect(readLogoList(instance, "partners")).toEqual([
      { id: "custom", name: "Custom", logoUrl: "/uploads/logo.png" },
    ]);
  });

  it("defaults partner tiles to image urls not empty text chips", () => {
    const partners = defaultLogoItems("partners");
    expect(partners.every((row) => row.logoUrl)).toBe(true);
    expect(partners.map((row) => row.id)).toEqual(
      expect.arrayContaining(["rixos", "marriott", "hilton", "booking"])
    );
  });
});
