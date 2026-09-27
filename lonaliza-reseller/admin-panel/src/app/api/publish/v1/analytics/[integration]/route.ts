import { NextRequest, NextResponse } from "next/server";
import { getChannelAnalytics, parseAnalyticsDays } from "@/lib/publish/analytics";
import { assertPublishPublicApi } from "@/lib/publish/public-auth";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ integration: string }> }
) {
  const denied = await assertPublishPublicApi(req);
  if (denied) return denied;
  const { integration } = await ctx.params;
  const days = parseAnalyticsDays(new URL(req.url).searchParams.get("date"));
  const analytics = await getChannelAnalytics(integration, days);
  if (!analytics) {
    return NextResponse.json({ ok: false, error: "القناة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, analytics });
}
