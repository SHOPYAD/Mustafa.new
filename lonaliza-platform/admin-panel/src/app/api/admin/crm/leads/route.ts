import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "pocketbase_unavailable" }, { status: 503 });
  }

  try {
    const records = await pb.collection("crm_leads").getFullList({
      sort: "-created",
    });

    const totalLeads = records.length;
    const wonRecords = records.filter((r) => r.stage === "won");
    const wonLeads = wonRecords.length;
    const pipelineRecords = records.filter((r) => r.stage !== "lost");
    const pipelineValue = pipelineRecords.reduce((sum, r) => sum + (Number(r.estimated_budget) || 0), 0);
    const avgDealSize = totalLeads > 0 ? Math.round(pipelineValue / totalLeads) : 0;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const stages = [
      { id: "new", name: "استفسارات جديدة", count: records.filter((r) => r.stage === "new").length, value: records.filter((r) => r.stage === "new").reduce((acc, r) => acc + (Number(r.estimated_budget) || 0), 0) },
      { id: "contacted", name: "تم التواصل الأولي", count: records.filter((r) => r.stage === "contacted").length, value: records.filter((r) => r.stage === "contacted").reduce((acc, r) => acc + (Number(r.estimated_budget) || 0), 0) },
      { id: "proposal_sent", name: "عروض أسعار مرسلة", count: records.filter((r) => r.stage === "proposal_sent").length, value: records.filter((r) => r.stage === "proposal_sent").reduce((acc, r) => acc + (Number(r.estimated_budget) || 0), 0) },
      { id: "won", name: "صفقات مؤكدة ومسددة", count: wonRecords.length, value: wonRecords.reduce((acc, r) => acc + (Number(r.estimated_budget) || 0), 0) },
    ];

    const tasks = records
      .filter((r) => r.stage !== "won" && r.stage !== "lost")
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        title: `متابعة ${r.name} - ${r.destination || r.service_type}`,
        assignedTo: r.assigned_agent || "فريق المبيعات",
        priority: r.priority || "medium",
        dueDate: r.due_date || new Date().toISOString().slice(0, 10),
        value: Number(r.estimated_budget) || 0,
        currency: r.currency || "USD",
      }));

    return NextResponse.json({
      ok: true,
      summary: {
        totalLeads,
        wonLeads,
        pipelineValue,
        avgDealSize,
        conversionRate,
      },
      stages,
      tasks,
      leads: records,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "pocketbase_unavailable" }, { status: 503 });
  }

  try {
    const body = (await req.json()) as { id: string; stage?: string; notes?: string; priority?: string };
    if (!body.id) {
      return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
    }

    const payload: Record<string, unknown> = {};
    if (body.stage) payload.stage = body.stage;
    if (body.notes !== undefined) payload.notes = body.notes;
    if (body.priority) payload.priority = body.priority;

    const updated = await pb.collection("crm_leads").update(body.id, payload);
    return NextResponse.json({ ok: true, lead: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
