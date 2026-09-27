import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsOverview, parseAnalyticsDays } from "@/lib/publish/analytics";
import { assertPublishPublicApi } from "@/lib/publish/public-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertPublishPublicApi(req);
  if (denied) return denied;
  const days = parseAnalyticsDays(new URL(req.url).searchParams.get("date"));
  const overview = await getAnalyticsOverview(days);
  return NextResponse.json({ ok: true, ...overview });
}
