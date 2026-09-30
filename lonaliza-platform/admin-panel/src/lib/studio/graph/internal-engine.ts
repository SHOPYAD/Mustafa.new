import { planDirective, runStudioPlan } from "@/lib/studio/capabilities/agent-router.server";
import { resolveIntent } from "@/lib/studio/index/intent-router";
import { isArticleDirective } from "@/lib/swarm/article-pipeline-types";
import { broadcastSwarmLog } from "@/lib/swarm/swarm-events";

export type InternalDispatchOutcome =
  | { handled: true; reply: string; sessionId: string }
  | { handled: false; allowFullSwarm: boolean; reason: "discuss" | "creative" | "unresolved" };

/** مسار حتمي قبل سرب Gemini — تنفيذ محلي أو رفض التوسع غير الضروري. */
export async function dispatchInternalDirective(
  directive: string,
  sessionId: string,
  options: { source?: string; autoExecute?: boolean; screenId?: string } = {}
): Promise<InternalDispatchOutcome> {
  const screenId = options.screenId || "20";
  const autoExecute = Boolean(options.autoExecute);

  const intent = resolveIntent(directive, { screenId, last: null });
  if (intent.kind === "discuss") return { handled: false, allowFullSwarm: true, reason: "discuss" };
  if (intent.kind === "article" && isArticleDirective(directive)) {
    return { handled: false, allowFullSwarm: true, reason: "creative" };
  }
  if (intent.kind === "article") {
    return { handled: false, allowFullSwarm: false, reason: "unresolved" };
  }

  const plan = await planDirective(directive, { screenId });
  if (plan) {
    const reply = await runStudioPlan(plan, sessionId, autoExecute);
    broadcastSwarmLog(sessionId, {
      id: `log_${Date.now()}_internal`,
      timestamp: new Date().toISOString(),
      sender: "supervisor",
      senderNameAr: "المحرك الداخلي",
      role: "Internal Engine",
      contentAr: reply,
      type: "decision",
    });
    return { handled: true, reply, sessionId };
  }

  if (intent.kind === "readiness" || intent.kind === "radar" || intent.kind === "travel") {
    return { handled: false, allowFullSwarm: false, reason: "unresolved" };
  }

  if (intent.kind === "navigate" || intent.kind === "clarify") {
    return { handled: false, allowFullSwarm: false, reason: "unresolved" };
  }

  return { handled: false, allowFullSwarm: !isArticleDirective(directive), reason: "unresolved" };
}
