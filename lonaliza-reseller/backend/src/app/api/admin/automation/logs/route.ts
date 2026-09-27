import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listAutomationLogs } from "@/lib/server/automation/logs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const limit = Number(req.nextUrl.searchParams.get("limit") || 120);
  const logs = await listAutomationLogs(limit);
  return NextResponse.json({ ok: true, logs });
}

export async function DELETE(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { clearAutomationLogs } = await import("@/lib/server/automation/logs");
  await clearAutomationLogs();
  return NextResponse.json({ ok: true, cleared: true });
}
