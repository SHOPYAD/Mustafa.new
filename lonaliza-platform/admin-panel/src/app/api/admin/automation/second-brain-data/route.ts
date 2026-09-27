import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getQdrantClient, SWARM_COLLECTIONS } from "@/lib/swarm/qdrant-vector-store";

export const dynamic = "force-dynamic";
export interface BrainSector {
  id: string; nameAr: string; nameEn: string; color: string; collection: string; pointsCount: number;
}
export interface BrainNode {
  id: string; sectorId: string; label: string; summary: string; score?: number;
  collection: string; payload: Record<string, unknown>; timestamp: string;
}
export interface BrainLink { source: string; target: string; strength: number }
const collections = [
  [SWARM_COLLECTIONS.DELIBERATIONS, "ذاكرة المداولات", "Deliberations"],
  [SWARM_COLLECTIONS.CUSTOMER_CONVERSATIONS, "ذاكرة المحادثات", "Conversations"],
  [SWARM_COLLECTIONS.MARKET_CATALOG, "فهرس السوق", "Market catalog"],
  [SWARM_COLLECTIONS.DESIGN_PATCHES, "سجل تعديلات التصميم", "Design patches"],
] as const;

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const timestamp = new Date().toISOString();
  try {
    const client = getQdrantClient();
    const reads = await Promise.allSettled(collections.map(async ([collection, nameAr, nameEn]) => {
      const info = await client.getCollection(collection);
      if (typeof info.points_count !== "number") throw new Error("Count unavailable");
      return { id: collection, collection, nameAr, nameEn, color: "#00e5ff", pointsCount: info.points_count };
    }));
    const sectors: BrainSector[] = reads.flatMap(r => r.status === "fulfilled" ? [r.value] : []);
    const unavailableCollections = reads.flatMap((r, i) => r.status === "rejected" ? [collections[i][0]] : []);
    // No customer payloads, fabricated memories or secret connection URLs are sent to the browser.
    return NextResponse.json({
      success: sectors.length > 0,
      status: sectors.length === 0 ? "unavailable" : unavailableCollections.length ? "partial" : "ready",
      source: "qdrant.collection-metadata", timestamp, unavailableCollections,
      core: { id: "core", name: "ذاكرة المنصة", collectionsCount: sectors.length,
        totalPoints: sectors.reduce((sum, s) => sum + s.pointsCount, 0), totalsScope: "available-collections-only" },
      sectors, nodes: [] as BrainNode[],
      links: sectors.map(s => ({ source: "core", target: s.id, strength: 1 })),
    }, { status: sectors.length ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, status: "unavailable", timestamp,
      error: "تعذر قراءة بيانات الذاكرة.", sectors: [], nodes: [], links: [] },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
