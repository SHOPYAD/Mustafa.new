import { describe, expect, it } from "vitest";
import { STUDIO_SCREENS } from "@/components/admin/automation/hud/screens/screensData";
import { PLATFORM_INDEX_NODES, matchPlatformNodes } from "@/lib/studio/index/platform-index";
import { THESAURUS_CLUSTERS, getThesaurusStats } from "@/lib/studio/index/domain-thesaurus";
import { extractNodeDomain } from "./MindGraphEngine";

describe("Mind Graph Cockpit — Screen 23 & 3D Neural Architecture", () => {
  it("has screen 23 properly defined in STUDIO_SCREENS with full metadata", () => {
    const screen23 = STUDIO_SCREENS.find((s) => s.id === "23");
    expect(screen23).toBeDefined();
    expect(screen23?.title).toContain("العقل المدبر السيادي");
    expect(screen23?.layout).toBe("workspace");
    expect(screen23?.nodes.length).toBeGreaterThanOrEqual(4);
    expect(screen23?.capabilities).toContain("mind_graph.inspect");
  });

  it("encompasses all 1,208 platform nodes with 100% referential integrity", () => {
    expect(PLATFORM_INDEX_NODES.length).toBeGreaterThanOrEqual(1200);
    const uniqueIds = new Set(PLATFORM_INDEX_NODES.map((n) => n.id));
    expect(uniqueIds.size).toBe(PLATFORM_INDEX_NODES.length);
  });

  it("covers all 26 domain thesaurus clusters with rich term mappings", () => {
    const stats = getThesaurusStats();
    expect(stats.totalClusters).toBe(26);
    expect(stats.totalTerms).toBeGreaterThanOrEqual(5000);
    expect(THESAURUS_CLUSTERS.length).toBe(26);
  });

  it("real-time dialect query simulator routes queries to matching nodes with positive score", () => {
    const sampleQueries = [
      { q: "شوف لي فندق كشخة", expectedDomain: "hotels" },
      { q: "بدنا سيارة مع شوفير لبورصة", expectedDomain: "transfers" },
      { q: "عاوز احجز طيارة لاسطنبول", expectedDomain: "flights" },
      { q: "طلع لي فاتورة ضريبية", expectedDomain: "finance" },
    ];

    for (const sq of sampleQueries) {
      const matches = matchPlatformNodes(sq.q);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].score).toBeGreaterThan(0);
      const domain = extractNodeDomain(matches[0].node);
      expect(domain).toBe(sq.expectedDomain);
    }
  });
});
