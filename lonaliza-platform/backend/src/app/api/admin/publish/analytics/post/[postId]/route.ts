import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getPostAnalytics, parseAnalyticsDays } from "@/lib/publish/analytics";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ postId: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { postId } = await ctx.params;
  const days = parseAnalyticsDays(new URL(req.url).searchParams.get("date"));
  const analytics = await getPostAnalytics(postId, days);
  if (!analytics) {
    return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, analytics });
}
