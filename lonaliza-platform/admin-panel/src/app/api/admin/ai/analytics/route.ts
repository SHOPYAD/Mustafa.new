import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getAiAnalyticsSummary } from "@/lib/server/ai-consumption-tracker";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 30;
    const summary = await getAiAnalyticsSummary(limit);

    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "فشل جلب إحصائيات استهلاك الذكاء الاصطناعي",
      },
      { status: 500 }
    );
  }
}
