import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { SPEC_COMPONENT_IDS, buildExpansionGraph } from "@/lib/neural-studio/expansion-graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const graph = buildExpansionGraph();
  const pb = await tryCreateAdminPocketBase();
  let probe: { collection: string; totalItems: number | null; freshness: "live" | "unknown" | "error"; error?: string } = {
    collection: "hotel_bookings",
    totalItems: null,
    freshness: "unknown",
  };

  if (!pb) {
    probe = { ...probe, freshness: "unknown", error: "pocketbase_unconfigured" };
  } else {
    try {
      const page = await withTimeout(pb.collection("hotel_bookings").getList(1, 1, { fields: "id" }), 2500);
      probe = { collection: "hotel_bookings", totalItems: page.totalItems, freshness: "live" };
    } catch (error) {
      probe = {
        collection: "hotel_bookings",
        totalItems: null,
        freshness: "error",
        error: error instanceof Error ? error.message : "probe_failed",
      };
    }
  }

  return NextResponse.json({
    ok: true,
    source: "sovereign-registry",
    fetchedAt: new Date().toISOString(),
    specIds: SPEC_COMPONENT_IDS,
    nodeCount: graph.nodes.length,
    graph,
    probe,
  });
}
