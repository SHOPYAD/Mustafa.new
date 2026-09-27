import { describe, expect, it } from "vitest";
import { foldAirportText, searchLocalAirports } from "@/lib/server/airports-db";

function iatas(hits: Array<{ iata: string }>): string[] {
  return hits.map((hit) => hit.iata);
}

describe("searchLocalAirports multilingual matching", () => {
  it("folds Arabic teh marbuta and alef variants", () => {
    expect(foldAirportText("طنجة")).toBe(foldAirportText("طنجه"));
    expect(foldAirportText("القاهرة")).toContain("قاهر");
  });

  it("finds Tangier by Arabic طنجة, transliterations, and IATA", async () => {
    const ar = await searchLocalAirports("طنجة", "ar");
    expect(iatas(ar)).toContain("TNG");
    expect(ar.find((hit) => hit.iata === "TNG")?.city).toBe("طنجة");

    const prefix = await searchLocalAirports("طنج", "ar");
    expect(iatas(prefix)).toContain("TNG");

    const tanger = await searchLocalAirports("Tanger", "en");
    expect(iatas(tanger)).toContain("TNG");

    const tanja = await searchLocalAirports("Tanja", "en");
    expect(iatas(tanja)).toContain("TNG");

    const code = await searchLocalAirports("TNG", "en");
    expect(iatas(code)).toContain("TNG");
  });

  it("finds Fez / Marrakech by Arabic even when OurAirports municipality differs", async () => {
    const fez = await searchLocalAirports("فاس", "ar");
    expect(iatas(fez)).toContain("FEZ");

    const rak = await searchLocalAirports("مراكش", "ar");
    expect(iatas(rak)).toContain("RAK");
  });

  it("still resolves well-known Arabic capitals", async () => {
    const cairo = await searchLocalAirports("القاهرة", "ar");
    expect(iatas(cairo)).toContain("CAI");

    const dubai = await searchLocalAirports("دبي", "ar");
    expect(iatas(dubai)).toContain("DXB");
  });
});
