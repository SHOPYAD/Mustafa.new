import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { collectDashboardStats } from "@/lib/server/dashboard-stats";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const stats = await collectDashboardStats();
  return NextResponse.json({ ok: true, stats });
}
