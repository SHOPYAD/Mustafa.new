import { NextRequest, NextResponse } from "next/server";
import { isApprovalEvent } from "@/lib/automation/approval";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  applyApprovalEvent,
  getApproval,
  listApprovals,
  proposeAutomationDraft,
} from "@/lib/server/automation/approval-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get("id") || "";
  if (id) {
    const record = await getApproval(id);
    if (!record) return NextResponse.json({ ok: false, error: "غير موجود" }, { status: 404 });
    return NextResponse.json({ ok: true, record });
  }
  const items = await listApprovals();
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const notes = typeof body.notes === "string" ? body.notes : undefined;
    const reason = typeof body.reason === "string" ? body.reason : undefined;
    const approvalId = typeof body.approvalId === "string" ? body.approvalId : "";
    const actor = body.actor === "copilot" ? "copilot" : "studio";

    if (action === "propose" || action === "chat") {
      const result = await proposeAutomationDraft({
        prompt,
        notes,
        previousId: approvalId || undefined,
        actor,
      });
      return NextResponse.json({
        ok: true,
        record: result.record,
        reply: result.replyAr,
        usedGemini: result.usedGemini,
      });
    }

    if (isApprovalEvent(action) && approvalId) {
      const result = await applyApprovalEvent({
        id: approvalId,
        event: action,
        actor,
        notes,
        reason,
      });
      return NextResponse.json({ ok: true, record: result.record, reply: result.message });
    }

    return NextResponse.json({ ok: false, error: "إجراء غير صالح" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر تنفيذ الاستوديو" },
      { status: 400 }
    );
  }
}
