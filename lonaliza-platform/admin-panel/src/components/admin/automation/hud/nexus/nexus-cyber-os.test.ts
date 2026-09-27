import { describe, it, expect } from "vitest";
import { NEXUS_SECTOR_CARDS } from "./HolographicCylinderStage";
import { SUB_STATIONS_CATALOG } from "../substations/CyberSubStationViewer";
import { IntentJudge, globalTranscriptBuffer } from "@/lib/jarvis/index";

describe("NEXUS 3D Cybernetic OS & Multi-Modal Deck Test Suite", () => {
  describe("NEXUS 3D Holographic Cylinder Sector Cards", () => {
    it("defines exactly 6 operational sector cards matching the 6 platform engines", () => {
      expect(NEXUS_SECTOR_CARDS).toHaveLength(6);
    });

    it("verifies each card links to a valid platform sub-station in SUB_STATIONS_CATALOG", () => {
      NEXUS_SECTOR_CARDS.forEach((card) => {
        expect(card.id).toBeDefined();
        expect(card.titleAr.length).toBeGreaterThan(3);
        expect(card.titleEn.length).toBeGreaterThan(3);
        expect(card.color).toMatch(/^#[0-9a-fA-F]{6}$/);

        // Every card's stationId must exist in the real SUB_STATIONS_CATALOG
        expect(SUB_STATIONS_CATALOG[card.stationId]).toBeDefined();

        // Metrics verification
        expect(card.metricLabel1).toBeTruthy();
        expect(card.metricValue1).toBeTruthy();
        expect(card.metricLabel2).toBeTruthy();
        expect(card.metricValue2).toBeTruthy();

        // Quick action command verification
        expect(card.quickActionCommand.length).toBeGreaterThan(10);
      });
    });

    it("covers all 6 critical business sectors without duplication", () => {
      const cardIds = NEXUS_SECTOR_CARDS.map((c) => c.id);
      expect(cardIds).toContain("nexus-ads");
      expect(cardIds).toContain("nexus-social");
      expect(cardIds).toContain("nexus-video");
      expect(cardIds).toContain("nexus-articles");
      expect(cardIds).toContain("nexus-tours");
      expect(cardIds).toContain("nexus-distribution");
      expect(new Set(cardIds).size).toBe(6);
    });
  });

  describe("Sovereign Voice Intent & Acoustic Guard Logic", () => {
    it("correctly identifies barge-in interrupt stop words across Arabic and English", () => {
      expect(IntentJudge.isBargeIn("توقف يا جارفيس")).toBe(true);
      expect(IntentJudge.isBargeIn("اسكت خلاص")).toBe(true);
      expect(IntentJudge.isBargeIn("بس وقف")).toBe(true);
      expect(IntentJudge.isBargeIn("stop talking")).toBe(true);
      expect(IntentJudge.isBargeIn("cancel")).toBe(true);
      expect(IntentJudge.isBargeIn("dur tamam")).toBe(true);

      // Normal queries must NOT be barge-in
      expect(IntentJudge.isBargeIn("أظهر لي أسعار رحلات طرابزون")).toBe(false);
      expect(IntentJudge.isBargeIn("افتح مسرح نكسس")).toBe(false);
      expect(IntentJudge.isBargeIn("كم عدد سيارات مرسيدس فيتو المتاحة")).toBe(false);
    });

    it("records and maintains rolling transcripts in globalTranscriptBuffer", () => {
      globalTranscriptBuffer.clear();
      globalTranscriptBuffer.push("user", "افتح محطة الفنادق", "ar");
      globalTranscriptBuffer.push("jarvis", "تم فتح محطة ترافلبورت وهوتبيدس", "ar");

      const items = globalTranscriptBuffer.getWindow(120);
      expect(items).toHaveLength(2);
      expect(items[0].speaker).toBe("user");
      expect(items[0].text).toBe("افتح محطة الفنادق");
      expect(items[1].speaker).toBe("jarvis");
      expect(items[1].text).toBe("تم فتح محطة ترافلبورت وهوتبيدس");
    });
  });
});
