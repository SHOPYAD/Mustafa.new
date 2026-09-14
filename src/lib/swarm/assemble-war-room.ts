import { listRegisteredAgents, toSwarmAgentInfo } from "./agent-registry";
import { collectPlatformGroundedSnapshot } from "./live-agent-metrics";
import { SWARM_TOOL_CATALOG } from "./tool-catalog";
import type { SwarmAgentInfo } from "@/lib/automation/agent-collab-store";

export async function assembleWarRoomAgents(): Promise<SwarmAgentInfo[]> {
  const [agents, snapshot] = await Promise.all([
    Promise.resolve(listRegisteredAgents(true)),
    collectPlatformGroundedSnapshot(),
  ]);
  return agents
    .filter((a) => a.enabled)
    .map((agent) => {
      const live = snapshot.agents.find((x) => x.id === agent.id);
      const base = toSwarmAgentInfo(agent);
      return {
        ...base,
        currentStatus: live?.currentStatus || "idle",
        currentTaskAr: live?.currentTaskAr || agent.missionAr,
        keyMetric: live?.keyMetric || "لا تتوفر بيانات فعلية من النظام",
        lastActive: live?.lastActive || agent.updatedAt,
        enabled: agent.enabled,
        isCustom: agent.isCustom,
        connected: live?.connected ?? false,
        metricSource: live?.metricSource,
        skillCount: agent.skills.filter((s) => s.enabled).length,
        toolCount: agent.allowedTools.length,
      };
    });
}

export function warRoomToolCatalog() {
  return SWARM_TOOL_CATALOG;
}
