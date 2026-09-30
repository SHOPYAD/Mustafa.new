import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { delegate } from "@/lib/studio/agents/task-board.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const directive = String(body?.directive ?? "").trim().slice(0, 2000);
  if (!directive) return NextResponse.json({ ok: false, error: "directive_required" }, { status: 400 });
  const sessionId = String(body?.sessionId ?? "studio").slice(0, 80);
  const screenId = String(body?.screenId ?? "20").replace(/[^\d]/g, "").slice(0, 2) || "20";
  const tasks = await delegate(directive, sessionId, body?.autoExecute === true, 120_000, screenId);
  const done = tasks.filter((t) => t.status === "done" || t.status === "failed");
  const summary =
    tasks.length === 1
      ? tasks[0].result ?? "المهمة قيد التنفيذ."
      : `وزعت المهمة على ${tasks.length} وكلاء. ${done.map((t) => `${t.agentNameAr}: ${t.result}`).join(" · ")}${done.length < tasks.length ? ` · ${tasks.length - done.length} ما زالت تعمل.` : ""}`;
  return NextResponse.json({
    ok: true,
    data: { sessionId, tasks, tacticalIntentAr: summary, articlePipeline: tasks.find((t) => t.articlePipeline)?.articlePipeline ?? null },
  });
}
