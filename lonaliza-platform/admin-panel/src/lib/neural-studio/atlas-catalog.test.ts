import { describe, expect, it } from "vitest";
import { buildAtlasCatalog, findAtlasNode } from "@/lib/neural-studio/atlas-catalog";
import { resolveStudioVoiceIntent } from "@/lib/neural-studio/studio-voice-intents";
import { findSovereignSubModule } from "@/components/admin/automation/hud/brain/data/sovereignDomainGraph";

describe("أطلس الشاشة 01", () => {
  const catalog = buildAtlasCatalog();

  it("يعرض عناقيد الصورة المرجعية الأحد عشر لا اثني عشر عنواناً مكرراً", () => {
    expect(catalog).toHaveLength(11);
    expect(catalog.map((domain) => domain.label)).toEqual([
      "نظرة عامة",
      "الحجوزات",
      "الخدمات",
      "محتوى الموقع",
      "العملاء",
      "التسويق والنشر",
      "الذكاء الاصطناعي",
      "المالية",
      "الامتثال القانوني",
      "الإعدادات",
      "إعادة البيع",
    ]);
  });

  it("يربط الأوراق المعروفة بسجل حقيقي ويبقي المجهول رمادياً", () => {
    const bookings = findAtlasNode(catalog, "domain.01.component.1");
    expect(bookings?.domain.leaves.map((leaf) => leaf.label)).toEqual([
      "الحجوزات",
      "طلبات الإلغاء",
      "تقييمات العملاء الموثقة",
    ]);
    for (const leaf of catalog.flatMap((domain) => domain.leaves)) {
      if (leaf.subModuleId) {
        expect(findSovereignSubModule(leaf.subModuleId)?.id).toBe(leaf.subModuleId);
        expect(leaf.status).not.toBe("unknown");
      } else if (!leaf.readEndpoint) {
        expect(leaf.status).toBe("unknown");
        expect(leaf.evidenceRef).toBe("visual-label-only");
      }
    }
  });

  it("يفتح الأطلس بالصوت دون إرسال أمر كتابة", () => {
    expect(resolveStudioVoiceIntent("افتح الأطلس العصبي")?.screenId).toBe("01");
    expect(resolveStudioVoiceIntent("اعرض الحجوزات")?.domainId).toBe("domain.01.component.1");
    expect(resolveStudioVoiceIntent("احجز تذكرة الآن")).toBeNull();
  });
});
