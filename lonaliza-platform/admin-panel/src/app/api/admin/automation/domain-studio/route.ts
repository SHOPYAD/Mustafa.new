import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { listRegisteredAgents } from "@/lib/swarm/agent-registry";
import { domainScreen, screenCollections } from "@/lib/neural-studio/domain-systems";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CollectionState = { totalItems: number | null; state: "live" | "error" | "timeout"; error?: string };

const TTL_MS = 60_000;
const cache = new Map<string, { at: number; value: CollectionState }>();

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

  const screenId = req.nextUrl.searchParams.get("screen") || "";
  const screen = domainScreen(screenId);
  if (!screen) return NextResponse.json({ ok: false, error: "unknown_screen" }, { status: 404 });

  const agentIds = new Set(screen.hubs.map((h) => h.agentId).filter(Boolean) as string[]);
  let agents: { id: string; nameAr: string; enabled: boolean }[] = [];
  try {
    agents = listRegisteredAgents(true)
      .filter((a) => agentIds.has(a.id))
      .map((a) => ({ id: a.id, nameAr: a.nameAr, enabled: a.enabled }));
  } catch {
    agents = [];
  }

  const fetchedAt = new Date().toISOString();
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: true, screenId, fetchedAt, freshness: "unknown", error: "pocketbase_unconfigured", collections: {}, agents });
  }

  const names = screenCollections(screen);
  const now = Date.now();
  const entries = await Promise.all(
    names.map(async (name): Promise<[string, CollectionState]> => {
      const hit = cache.get(name);
      if (hit && now - hit.at < TTL_MS) return [name, hit.value];
      try {
        const list = await withTimeout(pb.collection(name).getList(1, 1, { fields: "id" }), 4000);
        const value: CollectionState = { totalItems: list.totalItems, state: "live" };
        cache.set(name, { at: now, value });
        return [name, value];
      } catch (error) {
        const message = error instanceof Error ? error.message : "probe_failed";
        return [name, { totalItems: null, state: message === "timeout" ? "timeout" : "error", error: message }];
      }
    })
  );

  const collections = Object.fromEntries(entries);
  const live = entries.filter(([, v]) => v.state === "live").length;
  const freshness = names.length === 0 ? "routes_only" : live === names.length ? "live" : live > 0 ? "partial" : "error";
  return NextResponse.json({ ok: true, screenId, fetchedAt, freshness, collections, agents });
}
