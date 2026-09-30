import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { classifyTaskDomain, mcpToolsForDomain } from "./task-domain";
import { matchKnownTimelineCategory, timelineFromGeminiStages } from "./dynamic-timeline-stages";
import {
  convertMarkdownToHtml,
  enhanceHeadings,
  splitContentAtMidpoint,
} from "../../../../storefront/src/lib/blog/markdown-html";

describe("phase A task domains", () => {
  it("routes Egypt and Italy articles to Gemini content tools, not a fixed country", () => {
    for (const directive of [
      "اكتب مقالاً سياحياً عن مصر والأقصر",
      "Write a travel guide to Italy and Rome",
    ]) {
      expect(classifyTaskDomain(directive)).toBe("content");
      expect(mcpToolsForDomain("content")).toEqual([
        "mcp_connector_probe",
        "mcp_connector_probe",
      ]);
    }
    const engine = readFileSync(path.join(__dirname, "langgraph-engine.ts"), "utf8");
    expect(engine).not.toContain("resolveArticleFromDirective");
    expect(engine).not.toContain("TURKEY_ARTICLE_DATA");
    expect(engine).not.toContain("MOROCCO_ARTICLE_DATA");
    expect(engine).toContain("callGeminiLlmLong");
  });

  it("invokes real MCP tools for UI, video, marketing, and bookings", () => {
    expect(mcpToolsForDomain(classifyTaskDomain("عدّل واجهة الصفحة الرئيسية وألوان الهيرو"))).toEqual([
      "mcp_visual_get_schema",
      "mcp_storefront_get_page_layout",
    ]);
    expect(mcpToolsForDomain(classifyTaskDomain("أنتج فيديو ريلز عن الساحل"))).toEqual([
      "mcp_studio_creative_plan",
      "mcp_visual_read_sections",
    ]);
    expect(mcpToolsForDomain(classifyTaskDomain("أطلق حملة واتساب للعائلات"))).toEqual([
      "mcp_meta_ads_intelligence",
      "mcp_comms_whatsapp_status",
    ]);
    expect(mcpToolsForDomain(classifyTaskDomain("احجز فندق ورحلة طيران إلى روما"))).toEqual([
      "mcp_dashboard_bookings",
      "mcp_tourism_inventory",
    ]);
  });
});

describe("phase B markdown", () => {
  it("converts markdown headings and splits on h2 for Egypt and Italy samples", () => {
    const samples = [
      "# مصر\n\nمقدمة عن الأقصر.\n\n## الفنادق\n\n**شتاء** دافئ.\n\n## الطيران\n\n- القاهرة\n",
      "# Italy\n\nRome at dawn.\n\n## Hotels\n\nStay central.\n\n## Flights\n\nDirect from Riyadh.\n",
    ];
    for (const sample of samples) {
      const html = convertMarkdownToHtml(sample);
      expect(html).toContain("<h2>");
      expect(html).not.toContain("## ");
      const [first, second] = splitContentAtMidpoint(html);
      expect(first.length).toBeGreaterThan(0);
      expect(second).toContain("<h2>");
      const enhanced = enhanceHeadings(html);
      expect(enhanced.toc.length).toBeGreaterThan(0);
      expect(enhanced.html).toContain("scroll-margin-top:7.5rem");
    }
  });
});

describe("phase C timeline fallback", () => {
  it("keeps the six categories and asks Gemini only for an unknown task", () => {
    expect(matchKnownTimelineCategory("اكتب مقال عن إسبانيا")).toBe("blog");
    expect(matchKnownTimelineCategory("فيديو ريلز")).toBe("video");
    expect(matchKnownTimelineCategory("حملة إعلانية")).toBe("marketing");
    expect(matchKnownTimelineCategory("حجز فندق")).toBe("tourism");
    expect(matchKnownTimelineCategory("إعداد لوحة العملات")).toBe("admin");
    expect(matchKnownTimelineCategory("رتّب أرشيف صور المستودع الداخلي")).toBeNull();

    const timeline = timelineFromGeminiStages(
      "رتّب أرشيف صور المستودع الداخلي",
      [
        { id: "scan", label: "جرد الملفات", description: "قراءة المجلد", logs: ["scan"] },
        { id: "group", label: "تجميع حسب الوجهة", description: "تصنيف", logs: ["group"] },
        { id: "rename", label: "إعادة التسمية", description: "أسماء واضحة", logs: ["rename"] },
        { id: "report", label: "تسليم الفهرس", description: "ملخص", logs: ["report"] },
      ],
      { isProcessing: true, hasFinished: false, activeStep: 2 }
    );
    expect(timeline.category).toBe("dynamic");
    expect(timeline.stages).toHaveLength(4);
    expect(timeline.stages[0].status).toBe("completed");
    expect(timeline.stages[1].status).toBe("active");
    expect(timeline.title).not.toContain("تركيا");
  });
});

describe("phase D holographic equations", () => {
  it("replaces square nexus cards with floating equation ribbons", () => {
    const stage = readFileSync(
      path.resolve(
        __dirname,
        "../../components/admin/automation/hud/nexus/HolographicCylinderStage.tsx"
      ),
      "utf8"
    );
    expect(stage).toContain("Ψ");
    expect(stage).toContain("176, 46");
    expect(stage).not.toContain("fillRect(0, 0, 440, 620)");
    expect(stage).not.toContain("strokeRect(8, 8, 424, 604)");
  });
});
