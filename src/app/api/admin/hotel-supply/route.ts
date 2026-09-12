import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getSupplierHealth, getRecentSupplierCalls } from "@/lib/server/hotels/telemetry";
import { getContentStoreStats } from "@/lib/server/hotels/content-store";
import { getIngestSettings, getIngestState, runContentIngestTick, saveIngestSettings } from "@/lib/server/hotels/content-ingest";
import { decideIdentityReview, listIdentityReviews, rebuildOrphanRefs } from "@/lib/server/hotels/identity-store";
import { getProvidersRegistry } from "@/lib/server/providers-registry-store";
import { cacheHealth } from "@/lib/server/hotels/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOTEL_SUPPLIERS = ["hotelbeds", "ratehawk", "travelport_hotels", "seeru_hotels"] as const;

/**
 * GET ?view=overview  → supplier health + content store stats + ingest state/settings + provider modes
 * GET ?view=reviews&status=pending&page=1 → identity review queue
 */
export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const view = req.nextUrl.searchParams.get("view") || "overview";
  if (view === "reviews") {
    const status = (req.nextUrl.searchParams.get("status") || "pending") as "pending" | "confirmed" | "rejected";
    const page = Number(req.nextUrl.searchParams.get("page") || 1);
    return NextResponse.json({ ok: true, ...(await listIdentityReviews(status, page, 50)) });
  }
  if (view === "calls") {
    const supplier = req.nextUrl.searchParams.get("supplier") || undefined;
    return NextResponse.json({ ok: true, calls: await getRecentSupplierCalls(100, supplier) });
  }
  const [health, stats, state, settings, registry, cache] = await Promise.all([
    getSupplierHealth(),
    getContentStoreStats(),
    getIngestState(),
    getIngestSettings(),
    getProvidersRegistry(),
    cacheHealth(),
  ]);
  const providers = HOTEL_SUPPLIERS.map((id) => {
    const p = registry.providers[id];
    return { id, enabled: Boolean(p?.enabled), mode: p?.mode || "sandbox", hasCredentials: Boolean(p?.fields && Object.values(p.fields).some((v) => String(v || "").trim())) };
  });
  return NextResponse.json({ ok: true, health, stats, state, settings, providers, cache });
}

const postSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("tick"), budgetMs: z.number().int().min(5000).max(110000).optional() }),
  z.object({
    action: z.literal("settings"),
    patch: z.object({
      enabled: z.boolean().optional(),
      hotelbedsDailyRequestBudget: z.number().int().min(0).max(100000).nullable().optional(),
      languages: z.array(z.string().min(3).max(3)).min(1).max(3).optional(),
      travelportPerTick: z.number().int().min(0).max(50).optional(),
      ratehawkDump: z.boolean().optional(),
      ratehawkCountries: z.array(z.string().length(2)).nullable().optional(),
      extraDestinations: z.array(z.string().min(2).max(80)).max(200).optional(),
    }),
  }),
  z.object({ action: z.literal("decide"), id: z.string().min(1), decision: z.enum(["confirmed", "rejected"]) }),
  z.object({ action: z.literal("rebuild-orphans"), limit: z.number().int().min(1).max(5000).optional() }),
]);

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid body", issues: parsed.error.issues }, { status: 400 });
  const body = parsed.data;
  switch (body.action) {
    case "tick":
      return NextResponse.json({ ok: true, result: await runContentIngestTick({ budgetMs: body.budgetMs ?? 40_000 }) });
    case "settings":
      return NextResponse.json({ ok: true, settings: await saveIngestSettings(body.patch) });
    case "decide": {
      const rec = await decideIdentityReview(body.id, body.decision, "admin");
      return NextResponse.json({ ok: Boolean(rec), review: rec });
    }
    case "rebuild-orphans":
      return NextResponse.json({ ok: true, result: await rebuildOrphanRefs(body.limit ?? 500) });
  }
}
