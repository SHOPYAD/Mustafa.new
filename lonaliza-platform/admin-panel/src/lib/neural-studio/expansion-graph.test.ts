import { describe, expect, it } from "vitest";
import {
  SPEC_COMPONENT_IDS,
  ancestryLabels,
  buildExpansionGraph,
  materializeExpansion,
  visibleIds,
} from "@/lib/neural-studio/expansion-graph";
import { resolveStudioVoiceIntent } from "@/lib/neural-studio/studio-voice-intents";

describe("التوسع التراكمي — الشاشة 02", () => {
  const graph = buildExpansionGraph();

  it("يبقي المكونات الثمانية ومعرفات الصورة داخل السجل", () => {
    const ids = new Set(graph.nodes.map((node) => node.id));
    for (const specId of SPEC_COMPONENT_IDS) expect(ids.has(specId)).toBe(true);
    expect(graph.nodes.find((node) => node.id === "domain.02.contract.policy")?.status).toBe("unknown");
    expect(graph.nodes.find((node) => node.id === "domain.02.booking.availability")?.evidenceRef).toContain("sovereign:");
  });

  it("توسيع الحجز يبقي الأب، والطي يخفي الذرية ثم يعيد المعرفات", () => {
    const chain = ancestryLabels(graph, "domain.02.component.4");
    expect(chain).toEqual(["الحجوزات", "عقد الحجز", "الحجز"]);
    const open = visibleIds(graph, new Set(), 3);
    expect(open).toContain("domain.02.component.2");
    expect(open).toContain("domain.02.booking.availability");
    const collapsed = visibleIds(graph, new Set(["domain.02.component.3"]), 3);
    expect(collapsed).toContain("domain.02.component.3");
    expect(collapsed).not.toContain("domain.02.component.4");
    const restored = visibleIds(graph, new Set(), 3);
    expect(restored).toEqual(open);
  });

  it("علاقة تشير إلى جد تتوقف كمرجع دورة ولا تعيد بناء الشجرة", () => {
    const nodes = materializeExpansion({
      id: "domain.02.component.1",
      label: "المنصة",
      parentId: null,
      depth: 0,
      color: "#27dff4",
      children: [
        {
          id: "domain.02.component.2",
          label: "الحجوزات",
          parentId: "domain.02.component.1",
          depth: 1,
          color: "#f5c451",
          children: [
            {
              id: "domain.02.component.1",
              label: "رجوع للجد",
              parentId: "domain.02.component.2",
              depth: 2,
              color: "#27dff4",
              children: [
                {
                  id: "should-not-expand",
                  label: "لا يظهر",
                  parentId: "domain.02.component.1",
                  depth: 3,
                  color: "#fff",
                },
              ],
            },
          ],
        },
      ],
    });
    const loop = nodes.find((node) => node.label === "رجوع للجد");
    expect(loop?.relationType).toBe("cycle");
    expect(loop?.childIds).toEqual([]);
    expect(nodes.some((node) => node.id === "should-not-expand")).toBe(false);
  });

  it("الصوت يفتح التوسع قبل أن يخطف اسم الحجوزات الأطلس", () => {
    expect(resolveStudioVoiceIntent("افتح التوسع التراكمي")?.screenId).toBe("02");
    expect(resolveStudioVoiceIntent("اعرض الحجوزات")?.screenId).toBe("01");
  });
});
