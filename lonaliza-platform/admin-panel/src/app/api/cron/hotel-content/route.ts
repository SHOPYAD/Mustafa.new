import { NextRequest, NextResponse } from "next/server";
import { assertAutomationCronSecret, ensureAutomationCronSecret } from "@/lib/server/automation/cron-secret";
import { runContentIngestTick, getIngestState } from "@/lib/server/hotels/content-ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Called by `scripts/hotel-content-worker.mjs` (PM2 `lonaliza-hotel-content`). */
export async function POST(req: NextRequest) {
  await ensureAutomationCronSecret();
  if (!(await assertAutomationCronSecret(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const budgetMs = Number(req.nextUrl.searchParams.get("budgetMs") || 45_000);
  const result = await runContentIngestTick({ budgetMs });
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  await ensureAutomationCronSecret();
  if (!(await assertAutomationCronSecret(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, state: await getIngestState() });
}
