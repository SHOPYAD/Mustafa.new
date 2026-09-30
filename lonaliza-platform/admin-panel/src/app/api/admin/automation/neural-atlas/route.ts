import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getPocketBaseHealth, tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { buildAtlasCatalog, type AtlasProbe } from "@/lib/neural-studio/atlas-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROBE_TARGETS: { id: string; domainId: string; collection: string }[] = [
  { id: "bookings", domainId: "domain.01.component.1", collection: "hotel_bookings" },
  { id: "finance", domainId: "domain.01.component.10", collection: "financial_transactions" },
  { id: "customers", domainId: "domain.01.component.6", collection: "customers" },
];

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

  const catalog = buildAtlasCatalog();
  const probes: AtlasProbe[] = [];
  const pb = await tryCreateAdminPocketBase();

  let pocketBase: { healthy: boolean; collectionsCount: number | null; error?: string } = {
    healthy: false,
    collectionsCount: null,
  };

  try {
    const health = await withTimeout(getPocketBaseHealth(), 2500);
    pocketBase = {
      healthy: health.healthy,
      collectionsCount: health.collectionsCount,
      error: health.error,
    };
  } catch (error) {
    pocketBase = {
      healthy: false,
      collectionsCount: null,
      error: error instanceof Error ? error.message : "pocketbase_unreachable",
    };
  }

  if (!pb) {
    for (const target of PROBE_TARGETS) {
      probes.push({
        ...target,
        totalItems: null,
        freshness: "unknown",
        error: "pocketbase_unconfigured",
      });
    }
  } else {
    await Promise.all(
      PROBE_TARGETS.map(async (target) => {
        try {
          const page = await withTimeout(
            pb.collection(target.collection).getList(1, 1),
            2500
          );
          probes.push({
            ...target,
            totalItems: page.totalItems,
            freshness: "live",
          });
        } catch (error) {
          probes.push({
            ...target,
            totalItems: null,
            freshness: "error",
            error: error instanceof Error ? error.message : "probe_failed",
          });
        }
      })
    );
  }

  const liveCount = probes.filter((probe) => probe.freshness === "live").length;

  return NextResponse.json({
    ok: true,
    source: "sovereign-registry",
    fetchedAt: new Date().toISOString(),
    freshness: liveCount > 0 ? "partial" : "registry",
    domainCount: catalog.length,
    catalog,
    probes,
    pocketBase,
  });
}
