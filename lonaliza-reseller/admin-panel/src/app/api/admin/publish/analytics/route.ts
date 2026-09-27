import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getAnalyticsOverview, parseAnalyticsDays } from "@/lib/publish/analytics";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const days = parseAnalyticsDays(new URL(req.url).searchParams.get("date"));
  const overview = await getAnalyticsOverview(days);
  return NextResponse.json({ ok: true, ...overview });
}
