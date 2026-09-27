import { NextRequest, NextResponse } from "next/server";
import { dispatchDueCampaigns } from "@/lib/server/email/campaigns";
import { ensureEmailCronSecret } from "@/lib/server/email/collections";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = (await ensureEmailCronSecret()).trim();
  const header = req.headers.get("x-cron-secret")?.trim() || "";
  if (!secret || header !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await dispatchDueCampaigns();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
