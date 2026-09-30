import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { DOMAIN_SCREENS, type DomainHub } from "@/lib/neural-studio/domain-systems";
import { auditPlatformReadiness } from "@/lib/server/mcp/servers/platform-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_MS = 60_000;
const cache = new Map<string, { at: number; body: Record<string, unknown> }>();

type CollectionState = { totalItems: number | null; state: "live" | "error" | "timeout"; error?: string };

function findHub(hubId: string): { screenId: string; hub: DomainHub; screenTitle: string } | null {
  for (const screen of DOMAIN_SCREENS) {
    const hub = screen.hubs.find((h) => h.id === hubId);
    if (hub) return { screenId: screen.screenId, hub, screenTitle: screen.title };
  }
  return null;
}

function hubCollections(hub: DomainHub): string[] {
  const names = new Set<string>();
  for (const item of hub.items) if (item.collection) names.add(item.collection);
  return [...names];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

function pctLive(collections: Record<string, CollectionState>, names: string[]): number | null {
  if (names.length === 0) return null;
  const live = names.filter((n) => collections[n]?.state === "live").length;
  return Math.round((live / names.length) * 100);
}

function integrationFromAudit(hubHref: string, overallScore: number, modules: { configUrl: string; readinessPercent: number }[]): number {
  const match = modules.find((m) => hubHref === m.configUrl || hubHref.startsWith(m.configUrl) || m.configUrl.startsWith(hubHref));
  return match?.readinessPercent ?? overallScore;
}

function healthFromPct(readinessPct: number): "OPTIMAL" | "DEGRADED" | "OFFLINE" {
  if (readinessPct >= 85) return "OPTIMAL";
  if (readinessPct >= 45) return "DEGRADED";
  return "OFFLINE";
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const hubId = req.nextUrl.searchParams.get("hubId")?.trim() ?? "";
  if (!hubId) return NextResponse.json({ ok: false, error: "missing_hubId" }, { status: 400 });

  const hit = cache.get(hubId);
  const now = Date.now();
  if (hit && now - hit.at < TTL_MS) return NextResponse.json(hit.body);

  const resolved = findHub(hubId);
  if (!resolved) return NextResponse.json({ ok: false, error: "unknown_hub" }, { status: 404 });

  const { hub, screenId, screenTitle } = resolved;
  const collectionNames = hubCollections(hub);
  const fetchedAt = new Date().toISOString();
  const collections: Record<string, CollectionState> = {};

  const pb = await tryCreateAdminPocketBase();
  if (pb && collectionNames.length) {
    const entries = await Promise.all(
      collectionNames.map(async (name): Promise<[string, CollectionState]> => {
        try {
          const list = await withTimeout(pb.collection(name).getList(1, 1, { fields: "id" }), 4000);
          return [name, { totalItems: list.totalItems, state: "live" }];
        } catch (error) {
          const message = error instanceof Error ? error.message : "probe_failed";
          return [name, { totalItems: null, state: message === "timeout" ? "timeout" : "error", error: message }];
        }
      })
    );
    for (const [k, v] of entries) collections[k] = v;
  }

  let auditOverall: number | null = null;
  let auditModules: { configUrl: string; readinessPercent: number }[] = [];
  let auditStale = false;
  try {
    const audit = await auditPlatformReadiness();
    auditOverall = audit.overallScore;
    auditModules = audit.modules.map((m) => ({ configUrl: m.configUrl, readinessPercent: m.readinessPercent }));
  } catch {
    auditStale = true;
  }

  const recordsPct = pctLive(collections, collectionNames);
  const integrationPct = auditOverall !== null ? integrationFromAudit(hub.href, auditOverall, auditModules) : null;
  const collectionScore = recordsPct;
  const readinessPct =
    collectionScore !== null && integrationPct !== null
      ? Math.round(collectionScore * 0.55 + integrationPct * 0.45)
      : collectionScore ?? integrationPct;
  const status =
    readinessPct === null ? ("OFFLINE" as const) : healthFromPct(readinessPct);
  const labelAr =
    readinessPct === null
      ? `${hub.label}: بيانات غير متاحة`
      : status === "OPTIMAL"
        ? `${hub.label}: تشغيل طبيعي`
        : status === "DEGRADED"
          ? `${hub.label}: يحتاج متابعة`
          : `${hub.label}: غير متصل`;

  const body = {
    ok: true,
    hubId,
    screenId,
    screenTitle,
    fetchedAt,
    readinessPct: readinessPct ?? null,
    recordsPct: recordsPct ?? null,
    integrationPct: integrationPct ?? null,
    auditStale,
    status,
    labelAr,
    sources: {
      collections: collectionNames,
      domainStudio: `/api/admin/automation/domain-studio?screen=${screenId}`,
      platformReadiness: "/api/admin/platform-readiness",
      hubHref: hub.href,
    },
    collections,
  };

  cache.set(hubId, { at: now, body });
  return NextResponse.json(body);
}
