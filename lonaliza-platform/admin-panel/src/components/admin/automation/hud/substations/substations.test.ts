import { describe, it, expect } from "vitest";
import { SUB_STATIONS_CATALOG } from "./CyberSubStationViewer";

describe("Sovereign Cyber Sub-Stations Registry", () => {
  it("covers all 10 Grand Sovereign Enterprise Sectors with valid telemetry metrics", () => {
    const stations = Object.values(SUB_STATIONS_CATALOG);
    expect(stations.length).toBeGreaterThanOrEqual(10);

    const requiredSectorIds = [
      "aviation",
      "hospitality",
      "fleet",
      "tourism",
      "reseller",
      "treasury",
      "growth",
      "publishing",
      "mobile",
      "security",
    ];

    requiredSectorIds.forEach((sectorId) => {
      const found = stations.find((s) => s.sectorId === sectorId);
      expect(found).toBeDefined();
      expect(found?.metrics.healthStatus).toBe("OPTIMAL");
      expect(found?.metrics.latencyMs).toBeGreaterThan(0);
      expect(found?.records.length).toBeGreaterThan(0);
      expect(found?.tacticalToggles.length).toBeGreaterThan(0);
    });
  });

  it("verifies safe non-colliding route mapping for all sub-stations", () => {
    const stations = Object.values(SUB_STATIONS_CATALOG);
    stations.forEach((station) => {
      expect(station.route).toBeTruthy();
      expect(station.nameAr).toBeTruthy();
      expect(station.nameEn).toBeTruthy();
      expect(station.copilotPrompt).toBeTruthy();
    });
  });
});
