import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { incrementAuthenticatedReelView } from "@/lib/server/reel-views-store";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const reelId = decodeURIComponent(id || "").trim();
  if (!reelId) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
  }

  const user = await getRequestCustomer(req);
  if (!user?.id) {
    return NextResponse.json(
      { ok: false, error: "auth_required", viewsCount: 0, counted: false },
      { status: 401 },
    );
  }

  const result = await incrementAuthenticatedReelView(reelId, user.id);
  return NextResponse.json({
    ok: true,
    viewsCount: result.viewsCount,
    counted: result.counted,
  });
}
