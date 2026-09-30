import { executeStudioDirective, runStudioPlan } from "@/lib/studio/capabilities/agent-router.server";
import { looksOperational } from "@/lib/studio/capabilities/agent-plan";
import { resolveIntent } from "@/lib/studio/index/intent-router";
import { isArticleDirective } from "@/lib/swarm/article-pipeline-types";
import { broadcastSwarmLog } from "@/lib/swarm/swarm-events";

export type InternalDispatchOutcome =
  | { handled: true; reply: string; sessionId: string }
  | { handled: false; allowFullSwarm: boolean; reason: "discuss" | "creative" | "unresolved" };

function logInternal(sessionId: string, contentAr: string, suffix: string) {
  broadcastSwarmLog(sessionId, {
    id: `log_${Date.now()}_${suffix}`,
    sender: "supervisor",
    senderNameAr: "المحرك الداخلي",
    role: "Internal Engine",
    contentAr,
    type: "decision",
  });
}

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

  if (intent.plans?.length) {
    const parts: string[] = [];
    for (const p of intent.plans) {
      parts.push(await runStudioPlan(p, sessionId, autoExecute));
    }
    const reply = parts.join(" · ");
    logInternal(sessionId, reply, "plans");
    return { handled: true, reply, sessionId };
  }

  const executed = await executeStudioDirective(directive, { screenId }, sessionId, autoExecute);
  if (executed) {
    logInternal(sessionId, executed, "internal");
    return { handled: true, reply: executed, sessionId };
  }

  if (intent.kind === "navigate" && intent.target) {
    const plan = {
      capabilityId: "studio.open_screen",
      input: { screenId: intent.target.screenId, hubId: intent.target.hubId },
      why: `فتح ${intent.target.label}`,
    };
    const reply = await runStudioPlan(plan, sessionId, autoExecute);
    logInternal(sessionId, reply, "nav");
    return { handled: true, reply: `افتح ${intent.target.label}. ${reply}`, sessionId };
  }

  if (intent.kind === "clarify" && intent.question) {
    return { handled: true, reply: intent.question, sessionId };
  }

  if (intent.kind === "readiness" || intent.kind === "radar" || intent.kind === "travel") {
    return { handled: false, allowFullSwarm: false, reason: "unresolved" };
  }

  const onNexusOrLoops = screenId === "21" || screenId === "22";
  if (onNexusOrLoops && looksOperational(directive)) {
    return { handled: false, allowFullSwarm: false, reason: "unresolved" };
  }

  return { handled: false, allowFullSwarm: !isArticleDirective(directive), reason: "unresolved" };
}
