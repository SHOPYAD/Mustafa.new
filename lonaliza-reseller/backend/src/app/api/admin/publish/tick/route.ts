import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { assertPublishCronSecret, ensurePublishCronSecret } from "@/lib/publish/cron-secret";
import { tickPublishEngine } from "@/lib/publish/tick";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function authorized(req: NextRequest): Promise<NextResponse | null> {
  await ensurePublishCronSecret();
  if (await assertPublishCronSecret(req)) return null;
  return assertAdminApi(req);
}

export async function POST(req: NextRequest) {
  const denied = await authorized(req);
  if (denied) return denied;
  const result = await tickPublishEngine("cron");
  return NextResponse.json({ ...result, ok: true });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
