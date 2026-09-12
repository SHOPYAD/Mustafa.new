import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { saveWeeklyPlan } from "@/lib/studio/planner/store";
import { generateWeeklyTourismPlan } from "@/lib/studio/planner/weekly-plan";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const plan = await generateWeeklyTourismPlan({
      locale: body.locale,
      weekStart: body.weekStart,
    });
    const saved = await saveWeeklyPlan(plan);
    return NextResponse.json({
      ok: true,
      plan,
      relativePath: saved.relativePath,
      absolutePath: saved.absolutePath,
      url: saved.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "تعذّر توليد الخطة الأسبوعية",
      },
      { status: 500 }
    );
  }
}
