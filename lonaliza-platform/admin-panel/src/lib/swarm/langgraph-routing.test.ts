import { describe, expect, it } from "vitest";
import { planDirective } from "@/lib/studio/capabilities/agent-router.server";
import { resolveIntent } from "@/lib/studio/index/intent-router";
import { isArticleDirective } from "@/lib/swarm/article-pipeline-types";

describe("langgraph internal routing", () => {
  it("readiness maps to briefing capability", async () => {
    const plan = await planDirective("تقرير جاهزية شامل", { screenId: "19" });
    expect(plan?.capabilityId).toBe("briefing.readiness");
  });

  it("general server question is not article", () => {
    expect(isArticleDirective("ما الخوادم المفعلة")).toBe(false);
    expect(resolveIntent("ما الخوادم المفعلة", { screenId: "20", last: null }).kind).toBe("readiness");
  });

  it("article directive stays creative and does not trap cities or reports", () => {
    expect(isArticleDirective("اكتب مقال SEO عن ليون")).toBe(true);
    expect(isArticleDirective("انشر تدوينة سياحية عن كان")).toBe(true);
    expect(isArticleDirective("فنادق فرنسا")).toBe(false);
    expect(isArticleDirective("باريس")).toBe(false);
    expect(isArticleDirective("اكتب تقرير عن حالة الخوادم")).toBe(false);
    expect(isArticleDirective("تعديل أسعار الفنادق")).toBe(false);
    expect(resolveIntent("اكتب مقال SEO عن ليون", { screenId: "20", last: null }).kind).toBe("article");
  });

  it("operational open uses deterministic plan", async () => {
    const plan = await planDirective("اعرض طلبات الإلغاء المعلقة", { screenId: "03" });
    expect(plan?.capabilityId).toBe("bookings.cancellation.list");
  });
});
