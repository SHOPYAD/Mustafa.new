import { NextRequest, NextResponse } from "next/server";
import { assertAutomationCronSecret, ensureAutomationCronSecret } from "@/lib/server/automation/cron-secret";
import { tickAutomationEngine } from "@/lib/server/automation/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  await ensureAutomationCronSecret();
  if (!(await assertAutomationCronSecret(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await tickAutomationEngine("cron");
  return NextResponse.json({ ...result, ok: true });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
