import { describe, it, expect, beforeEach } from "vitest";
import {
  RollingTranscriptBuffer,
  IntentJudge,
  SemanticToolRouter,
  ThreeBranchGraph,
} from "./index";

describe("JARVIS Core Engine Tests", () => {
  describe("1. RollingTranscriptBuffer (120s Circular Memory)", () => {
    let buffer: RollingTranscriptBuffer;

    beforeEach(() => {
      buffer = new RollingTranscriptBuffer(120);
    });

    it("records utterances and formats context accurately", () => {
      const now = Date.now();
      buffer.push("user", "افحص أسعار الفنادق في إسطنبول", "ar", now - 5000);
      buffer.push("jarvis", "تم فحص 14 فندقاً عبر BedBanks وهامش الربح 18%", "ar", now - 2000);

      expect(buffer.size()).toBe(2);
      const formatted = buffer.getFormattedContext(120);
      expect(formatted).toContain("[OPERATOR]: افحص أسعار الفنادق في إسطنبول");
      expect(formatted).toContain("[JARVIS]: تم فحص 14 فندقاً");
    });

    it("automatically prunes entries older than 120 seconds", () => {
      const now = Date.now();
      // 150 seconds ago (should be pruned)
      buffer.push("user", "كلام قديم جداً", "ar", now - 150000);
      // 30 seconds ago (should remain)
      buffer.push("user", "أمر حديث", "ar", now - 30000);

      const windowEntries = buffer.getWindow(120);
      expect(windowEntries.length).toBe(1);
      expect(windowEntries[0].text).toBe("أمر حديث");
    });
  });

  describe("2. IntentJudge & Multilingual Barge-In Interruption", () => {
    it("detects barge-in stop words in Arabic, Turkish, English, and French", () => {
      expect(IntentJudge.isBargeIn("توقف يا جارفيز")).toBe(true);
      expect(IntentJudge.isBargeIn("dur lütfen")).toBe(true);
      expect(IntentJudge.isBargeIn("stop talking immediately")).toBe(true);
      expect(IntentJudge.isBargeIn("arrête tout")).toBe(true);
      expect(IntentJudge.isBargeIn("صباح الخير يا جارفيز")).toBe(false);
    });

    it("judges Sub-Station navigation intent and maps to correct sector", () => {
      const resAr = IntentJudge.judge("افتح محطة الفنادق العالمية", "ar");
      expect(resAr.category).toBe("SUBSTATION_NAVIGATE");
      expect(resAr.targetSectorId).toBe("sector-hotels");

      const resTr = IntentJudge.judge("uçuşları göster", "tr");
      expect(resTr.category).toBe("SUBSTATION_NAVIGATE");
      expect(resTr.targetSectorId).toBe("sector-flights");

      const resEn = IntentJudge.judge("open global transfers fleet", "en");
      expect(resEn.category).toBe("SUBSTATION_NAVIGATE");
      expect(resEn.targetSectorId).toBe("sector-fleet");
    });

    it("judges telemetry query accurately", () => {
      const res = IntentJudge.judge("كم عدد الحجوزات اليوم ومعدل الإشغال؟", "ar");
      expect(res.category).toBe("TELEMETRY_QUERY");
    });
  });

  describe("3. Dynamic SemanticToolRouter (Top 3-5 of 81 Modules)", () => {
    it("routes flight query to flights and GDS tools", () => {
      const tools = SemanticToolRouter.routeTools("ابحث عن رحلات طيران الرياض إلى طرابزون عبر Amadeus", 3);
      expect(tools.length).toBeLessThanOrEqual(3);
      expect(tools.some((t) => t.toolId === "tool-flights-gds")).toBe(true);
    });

    it("routes payment query to payment gateways and treasury tools", () => {
      const tools = SemanticToolRouter.routeTools("افحص عمليات الدفع عبر Iyzico والعملات", 3);
      expect(tools.length).toBeLessThanOrEqual(3);
      expect(tools.some((t) => t.toolId === "tool-payments-gateways" || t.toolId === "tool-currency-rates")).toBe(true);
    });

    it("formats tools into prompt context cleanly", () => {
      const tools = SemanticToolRouter.routeTools("حجز غرف فندقية", 2);
      const formatted = SemanticToolRouter.formatToolsForPrompt(tools);
      expect(formatted).toContain("[TOOL 1:");
      expect(formatted).toContain("Sector:");
      expect(formatted).toContain("Route:");
    });
  });

  describe("4. ThreeBranchGraph & Warm Profile Engine", () => {
    it("synthesizes warm profile in Arabic with user, directives, and world state", () => {
      const profile = ThreeBranchGraph.getWarmProfile("ar");
      expect(profile.userBranch.role).toBe("SUPER_ADMIN");
      expect(profile.directivesBranch.criticalRules.length).toBeGreaterThan(0);
      expect(profile.worldBranch.platformStatus).toBe("OPTIMAL");
      expect(profile.synthesizedPromptContext).toContain("الملف المعرفي الدافئ ثلاثي الفروع");
      expect(profile.synthesizedPromptContext).toContain("فرع المشغل");
      expect(profile.synthesizedPromptContext).toContain("فرع التوجيهات");
      expect(profile.synthesizedPromptContext).toContain("فرع العالم الحي");
    });

    it("synthesizes warm profile in Turkish accurately", () => {
      const profile = ThreeBranchGraph.getWarmProfile("tr");
      expect(profile.synthesizedPromptContext).toContain("ÜÇ KOLLU EGEMEN BİLGİ PROFİLİ");
      expect(profile.synthesizedPromptContext).toContain("Kullanıcı Kolu");
    });
  });
});
