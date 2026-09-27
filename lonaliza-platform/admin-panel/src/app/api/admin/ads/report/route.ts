import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { assertAutomationCronSecret } from "@/lib/server/automation/cron-secret";
import { lastAdsReport, runAdsTelegramReport } from "@/lib/ads/reports-telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function authorized(req: Request): Promise<NextResponse | null> {
  if (await assertAutomationCronSecret(req)) return null;
  return assertAdminApi(req);
}

export async function GET(req: Request) {
  const denied = await authorized(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, report: await lastAdsReport() });
}

export async function POST(req: Request) {
  const denied = await authorized(req);
  if (denied) return denied;
  let force = false;
  try {
    const body = (await req.json()) as { force?: boolean };
    force = body.force === true;
  } catch {
    force = false;
  }
  const report = await runAdsTelegramReport({ force });
  return NextResponse.json({ ok: true, report });
}
