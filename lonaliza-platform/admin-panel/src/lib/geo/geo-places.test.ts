import { describe, it, expect } from "vitest";
import { searchGeoPlaces, findPlaceByQuery } from "@/lib/server/geo-places";

describe("Worldwide Geo Places Search", () => {
  it("finds Tangier (طنجة) with high relevance when searched in Arabic", async () => {
    const hits = await searchGeoPlaces("طنجة", "ar");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].city).toBe("طنجة");
    expect(hits[0].countryCode).toBe("MA");
    expect(hits[0].geoId).toBe("293737");
  });

  it("finds Casablanca (الدار البيضاء / كازابلانكا) in Arabic and English", async () => {
    const hitsAr = await searchGeoPlaces("الدار البيضاء", "ar");
    expect(hitsAr.length).toBeGreaterThan(0);
    expect(hitsAr[0].countryCode).toBe("MA");

    const hitsEn = await searchGeoPlaces("Casablanca", "en");
    expect(hitsEn.length).toBeGreaterThan(0);
    expect(hitsEn[0].city).toBe("Casablanca");
    expect(hitsEn[0].countryCode).toBe("MA");
  });

  it("finds Cairo (القاهرة) in Arabic", async () => {
    const hits = await searchGeoPlaces("القاهرة", "ar");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].city).toBe("القاهرة");
    expect(hits[0].countryCode).toBe("EG");
  });

  it("finds Dubai (دبي) and Riyadh (الرياض)", async () => {
    const hitsDxb = await searchGeoPlaces("دبي", "ar");
    expect(hitsDxb.length).toBeGreaterThan(0);
    expect(hitsDxb[0].city).toBe("دبي");
    expect(hitsDxb[0].countryCode).toBe("AE");

    const hitsRuh = await searchGeoPlaces("الرياض", "ar");
    expect(hitsRuh.length).toBeGreaterThan(0);
    expect(hitsRuh[0].city).toBe("الرياض");
    expect(hitsRuh[0].countryCode).toBe("SA");
  });

  it("finds European cities like Paris (باريس) and London (لندن)", async () => {
    const hitsPar = await searchGeoPlaces("باريس", "ar");
    expect(hitsPar.length).toBeGreaterThan(0);
    expect(hitsPar[0].city).toBe("باريس");
    expect(hitsPar[0].countryCode).toBe("FR");

    const hitsLon = await searchGeoPlaces("لندن", "ar");
    expect(hitsLon.length).toBeGreaterThan(0);
    expect(hitsLon[0].city).toBe("لندن");
    expect(hitsLon[0].countryCode).toBe("GB");
  });

  it("findPlaceByQuery finds Tangier TripAdvisor Geo ID", async () => {
    const place = await findPlaceByQuery("طنجة");
    expect(place).not.toBeNull();
    expect(place?.tripadvisor_geo_id).toBe("293737");
  });
});
