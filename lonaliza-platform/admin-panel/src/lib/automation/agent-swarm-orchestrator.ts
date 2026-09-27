import type { AgentRole, PendingApprovalDecision, SwarmDiscussionMessage } from "./agent-collab-store";
import { runGroundedSwarmCycle } from "@/lib/swarm/grounded-runtime";

export interface TriggerSwarmDeliberationInput {
  triggerSource: AgentRole | "admin" | "cron";
  topic: string;
  contextText: string;
  impactLevel?: "low" | "medium" | "high" | "critical";
}

/**
 * Backward-compatible entry: now runs the grounded multi-agent runtime
 * instead of a single Gemini role-play call.
 */
export async function triggerSwarmDeliberation({
  triggerSource,
  topic,
  contextText,
}: TriggerSwarmDeliberationInput): Promise<{
  ok: boolean;
  messagesGenerated: SwarmDiscussionMessage[];
  proposalCreated?: PendingApprovalDecision;
}> {
  const result = await runGroundedSwarmCycle({
    directiveText: `${topic}\n${contextText}`.trim(),
    source: triggerSource === "cron" ? "cron" : "admin_dashboard",
    targetAgentId: triggerSource !== "admin" && triggerSource !== "cron" ? triggerSource : "all",
    notifyTelegram: true,
  });

  return {
    ok: result.ok,
    messagesGenerated: result.messages,
    proposalCreated: result.proposal,
  };
}
