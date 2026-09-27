import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getChannelAnalytics, parseAnalyticsDays } from "@/lib/publish/analytics";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ channelId: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { channelId } = await ctx.params;
  const days = parseAnalyticsDays(new URL(req.url).searchParams.get("date"));
  const analytics = await getChannelAnalytics(channelId, days);
  if (!analytics) {
    return NextResponse.json({ ok: false, error: "القناة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, analytics });
}
