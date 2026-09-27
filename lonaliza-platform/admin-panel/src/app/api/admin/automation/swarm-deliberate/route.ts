import { NextRequest, NextResponse } from "next/server";
import { executeLangGraphDeliberation } from "@/lib/swarm/langgraph-engine";
import { enqueueDeliberationJob } from "@/lib/swarm/swarm-queue";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const directive = String(body.directive || body.topic || "").trim();
    const source = String(body.source || "director_hud");
    const mode = String(body.mode || "sync"); // "sync" or "async_queue"
    const sessionId = body.sessionId ? String(body.sessionId) : undefined;

    if (!directive) {
      return NextResponse.json({ ok: false, error: "Missing directive or topic" }, { status: 400 });
    }

    if (mode === "async_queue") {
      const enqueued = await enqueueDeliberationJob({
        directive,
        source: source as "director_voice" | "director_hud" | "cron_trigger" | "telegram",
        budgetCeilingUsd: Number(body.budgetCeilingUsd || 500),
      });

      return NextResponse.json({
        ok: true,
        queued: true,
        jobId: enqueued.jobId,
        message: "تم تسجيل المهمة في طابور BullMQ للمعالجة في الخلفية",
      });
    }

    // Synchronous execution
    const state = await executeLangGraphDeliberation(directive, source, sessionId);

    return NextResponse.json({
      ok: true,
      data: {
        sessionId: state.sessionId,
        decisionId: state.finalSynthesis?.decisionId,
        consensusScore: state.consensus?.consensusPercentage || 90,
        tacticalIntentAr: state.supervisorPlan?.tacticalIntentAr,
        proposals: state.agentProposals,
        critiques: state.critiques,
        finalDecision: state.finalSynthesis,
        terminalLogsCount: state.terminalLogs.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Swarm Deliberate Route] Error:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
