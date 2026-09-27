import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { runAutomationJobById } from "@/lib/server/automation/engine";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const body = (await req.json().catch(() => ({}))) as { dryRun?: boolean };
    const { job, result } = await runAutomationJobById(id, {
      dryRun: typeof body.dryRun === "boolean" ? body.dryRun : undefined,
      source: "manual",
    });
    return NextResponse.json({ ok: result.ok, job, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر التشغيل" },
      { status: 400 }
    );
  }
}
