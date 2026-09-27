import { describe, expect, it } from "vitest";
import { destKey } from "./geo";
import { foldCityName, nearbyCacheKey, warehouseCityKey } from "./poi-warehouse";
import { mergePois, poisNearCenter, type WorldPoi } from "./world-pois";

describe("warehouseCityKey", () => {
  it("maps Arabic and English aliases to one city file", () => {
    expect(warehouseCityKey("طرابزون")).toBe("trabzon");
    expect(warehouseCityKey("Trabzon, Turkey")).toBe("trabzon");
    expect(warehouseCityKey("باريس")).toBe("paris");
    expect(warehouseCityKey("Paris, France")).toBe("paris");
    expect(warehouseCityKey("القاهرة")).toBe("cairo");
  });

  it("does not force unknown cities to istanbul", () => {
    expect(warehouseCityKey("Lisbon")).toBe("lisbon");
    expect(warehouseCityKey("Vienna")).toBe("vienna");
    expect(warehouseCityKey("")).toBe("");
  });

  it("folds country noise", () => {
    expect(foldCityName("Paris, France")).toBe("paris");
  });
});

describe("nearbyCacheKey", () => {
  it("rounds coords so nearby food hits the same file", () => {
    expect(nearbyCacheKey(48.8584, 2.2945, "food")).toBe(nearbyCacheKey(48.8581, 2.2949, "food"));
  });
});

describe("destKey", () => {
  it("does not map London or Tangier to Istanbul", () => {
    expect(destKey("London")).toBeNull();
    expect(destKey("لندن")).toBeNull();
    expect(destKey("طنجة")).toBeNull();
    expect(destKey("Istanbul")).toBe("istanbul");
  });
});

describe("poisNearCenter", () => {
  it("drops landmarks from another country", () => {
    const london: WorldPoi = {
      titleEn: "Tower Bridge",
      titleAr: "تاور بريدج",
      lat: 51.5055,
      lng: -0.0754,
      kind: "attraction",
      source: "wikipedia",
    };
    const istanbul: WorldPoi = {
      titleEn: "Blue Mosque",
      titleAr: "المسجد الأزرق",
      lat: 41.0053,
      lng: 28.9768,
      kind: "attraction",
      source: "wikipedia",
    };
    const near = poisNearCenter([london, istanbul], 51.5074, -0.1278, 40);
    expect(near.map((p) => p.titleEn)).toEqual(["Tower Bridge"]);
  });
});

describe("mergePois", () => {
  it("keeps tourism first and drops weak worship after two", () => {
    const a: WorldPoi = {
      titleEn: "Petit Palais",
      titleAr: "القصر الصغير",
      lat: 48.866,
      lng: 2.315,
      kind: "attraction",
      image: "https://example.com/p.jpg",
      source: "wikidata",
      popularity: 40,
    };
    const b: WorldPoi = {
      titleEn: "Church of Saint-Something",
      titleAr: "كنيسة",
      lat: 48.86,
      lng: 2.31,
      kind: "attraction",
      source: "osm",
    };
    const merged = mergePois([[b, a, { ...b, titleEn: "Église Saint-A", lat: 48.861 }, { ...b, titleEn: "Église Saint-B", lat: 48.862 }]]);
    expect(merged[0].titleEn).toBe("Petit Palais");
    expect(merged.filter((p) => /church|église/i.test(p.titleEn)).length).toBeLessThanOrEqual(2);
  });
});
