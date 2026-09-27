import { NextRequest, NextResponse } from "next/server";
import { getPostAnalytics, parseAnalyticsDays } from "@/lib/publish/analytics";
import { assertPublishPublicApi } from "@/lib/publish/public-auth";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ postId: string }> }
) {
  const denied = await assertPublishPublicApi(req);
  if (denied) return denied;
  const { postId } = await ctx.params;
  const days = parseAnalyticsDays(new URL(req.url).searchParams.get("date"));
  const analytics = await getPostAnalytics(postId, days);
  if (!analytics) {
    return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, analytics });
}
