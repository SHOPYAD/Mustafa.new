import { describe, expect, it } from "vitest";
import {
  ensureQdrantCollections,
  upsertDeliberationMemory,
  searchDeliberations,
  migrateLocalEpisodicMemoriesToQdrant,
  SWARM_COLLECTIONS,
  getQdrantClient,
} from "./qdrant-vector-store";

describe("Enterprise Qdrant Vector Store", () => {
  it("initializes all 4 enterprise collections in Qdrant", async () => {
    const initialized = await ensureQdrantCollections();
    expect(initialized).toBe(true);

    const client = getQdrantClient();
    const { collections } = await client.getCollections();
    const names = collections.map((c) => c.name);

    expect(names).toContain(SWARM_COLLECTIONS.DELIBERATIONS);
    expect(names).toContain(SWARM_COLLECTIONS.CUSTOMER_CONVERSATIONS);
    expect(names).toContain(SWARM_COLLECTIONS.MARKET_CATALOG);
    expect(names).toContain(SWARM_COLLECTIONS.DESIGN_PATCHES);
  });

  it("migrates existing memories and executes vector search", async () => {
    const migrated = await migrateLocalEpisodicMemoriesToQdrant();
    expect(migrated).toBeGreaterThanOrEqual(0);

    // Upsert a test deliberation
    const ok = await upsertDeliberationMemory({
      id: "test_trabzon_vip_campaign",
      timestamp: new Date().toISOString(),
      category: "campaign_outcome",
      agentId: "sales",
      summaryAr: "حملة طرابزون VIP الصيفية بسيارات فيتو خاصة",
      keyInsightsAr: ["طلب متزايد على السيارات العائلية الفخمة"],
      metrics: { roiGain: "+45%", marginPercent: 25 },
      tags: ["trabzon", "vip", "summer"],
    });
    expect(ok).toBe(true);

    // Search
    const results = await searchDeliberations("باقة طرابزون VIP عائلية", {
      targetAgentId: "sales",
      limit: 3,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].memory.summaryAr).toBeDefined();
    expect(results[0].score).toBeGreaterThan(0);
  });
});
