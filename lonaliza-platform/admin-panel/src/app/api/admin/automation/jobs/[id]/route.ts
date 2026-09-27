import { NextRequest, NextResponse } from "next/server";
import { isAutomationJobType } from "@/lib/automation/types";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deleteAutomationJob, getAutomationJob, patchAutomationJob } from "@/lib/server/automation/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const job = await getAutomationJob(id);
  if (!job) return NextResponse.json({ ok: false, error: "غير موجودة" }, { status: 404 });
  return NextResponse.json({ ok: true, job });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (body.type != null && !isAutomationJobType(body.type)) {
      return NextResponse.json({ ok: false, error: "نوع وظيفة غير صالح" }, { status: 400 });
    }
    const job = await patchAutomationJob(id, body);
    return NextResponse.json({ ok: true, job });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر التحديث" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  await deleteAutomationJob(id);
  return NextResponse.json({ ok: true });
}
