import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { executeLangGraphDeliberation } from "@/lib/swarm/langgraph-engine";
import { enqueueDeliberationJob } from "@/lib/swarm/swarm-queue";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const directive = String(body.directive || body.topic || "").trim();
    const source = String(body.source || "director_hud");
    const mode = String(body.mode || "sync"); // "sync" or "async_queue"
    const sessionId = body.sessionId ? String(body.sessionId) : undefined;

    if (!directive) {
      return NextResponse.json({ ok: false, error: "Missing directive or topic" }, { status: 400 });
    }

    const dLower = directive.toLowerCase();
    const isStopDirective =
      dLower === "توقف" ||
      dLower === "stop" ||
      dLower === "اسكت" ||
      dLower === "وقف" ||
      dLower === "اصمت" ||
      dLower === "بس" ||
      dLower === "كافي" ||
      dLower.startsWith("توقف") ||
      dLower.startsWith("اسكت") ||
      dLower.startsWith("وقف");

    if (isStopDirective) {
      return NextResponse.json({
        ok: true,
        data: {
          sessionId,
          tacticalIntentAr: "تم إيقاف الكلام فوراً يا فندم. أنا أنصت إليك، تفضل بأمرك.",
          finalDecision: {
            titleAr: "إيقاف فوري للعمليات والكلام",
            rationaleAr: "تم إيقاف الكلام فوراً يا فندم. أنا أنصت إليك، تفضل بأمرك.",
          },
        },
      });
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

    const autoExecute = Boolean(body.autoExecute);

    // Synchronous execution
    const state = await executeLangGraphDeliberation(directive, source, sessionId, autoExecute);

    if (state.toolHalt) {
      return NextResponse.json({
        ok: false,
        error: state.toolHalt,
        data: {
          sessionId: state.sessionId,
          toolName: state.toolName,
          toolHalt: state.toolHalt,
          consensusScore: 0,
          published: false,
          directUrl: null,
          tacticalIntentAr: state.finalSynthesis?.executiveSummaryAr || `${state.toolName || "tool"}: ${state.toolHalt}`,
          finalDecision: state.finalSynthesis,
          terminalLogs: state.terminalLogs,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        sessionId: state.sessionId,
        decisionId: state.finalSynthesis?.decisionId,
        consensusScore: state.consensus?.consensusPercentage || 90,
        tacticalIntentAr: state.finalSynthesis?.executiveSummaryAr || state.supervisorPlan?.tacticalIntentAr,
        proposals: state.agentProposals,
        critiques: state.critiques,
        finalDecision: state.finalSynthesis,
        articlePipeline: state.finalSynthesis?.actionPayload?.articlePipeline ?? null,
        terminalLogsCount: state.terminalLogs.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Swarm Deliberate Route] Error:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
