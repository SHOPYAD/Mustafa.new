import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getSwarmDiscussions,
  getPendingDecisions,
  getAdminDirectives,
  type AgentRole,
} from "@/lib/automation/agent-collab-store";
import {
  addAgentMemory,
  addAgentRule,
  addAgentSkill,
  assembleWarRoomAgents,
  deleteAgentMemory,
  deleteAgentRule,
  deleteAgentSkill,
  deleteRegisteredAgent,
  executeApprovedDecision,
  getRegisteredAgent,
  listRegisteredAgents,
  rejectDecision,
  runGroundedSwarmCycle,
  toggleAgentRule,
  toggleAgentSkill,
  updateAgentPrompt,
  updateAgentTools,
  upsertRegisteredAgent,
  warRoomToolCatalog,
} from "@/lib/swarm";
import { isSwarmToolKey } from "@/lib/swarm/tool-catalog";
import type { SwarmToolKey } from "@/lib/swarm/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const { collectPlatformGroundedSnapshot } = await import("@/lib/swarm/live-agent-metrics");
  const [agents, registry, platform] = await Promise.all([
    assembleWarRoomAgents(),
    Promise.resolve(listRegisteredAgents(true)),
    collectPlatformGroundedSnapshot(),
  ]);

  return NextResponse.json({
    ok: true,
    agents,
    registry,
    platform,
    toolCatalog: warRoomToolCatalog(),
    discussions: getSwarmDiscussions(),
    decisions: getPendingDecisions(),
    directives: getAdminDirectives(),
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const body = (await req.json()) as {
    action?: string;
    directiveText?: string;
    topic?: string;
    contextText?: string;
    triggerSource?: AgentRole | "admin";
    targetAgentId?: string;
    decisionId?: string;
    decisionStatus?: "approved" | "rejected";
    adminNote?: string;
    agent?: Record<string, unknown>;
    agentId?: string;
    skillId?: string;
    ruleId?: string;
    noteId?: string;
    title?: string;
    markdown?: string;
    systemPrompt?: string;
    allowedTools?: string[];
    note?: string;
  };

  if (body.action === "directive" && body.directiveText) {
    const result = await runGroundedSwarmCycle({
      directiveText: body.directiveText.trim(),
      source: "admin_dashboard",
      targetAgentId: body.targetAgentId || "all",
    });
    return NextResponse.json({ ok: true, result });
  }

  if (body.action === "deliberate" && (body.topic || body.contextText)) {
    const result = await runGroundedSwarmCycle({
      directiveText: (body.contextText || body.topic || "").trim(),
      source: "admin_dashboard",
      targetAgentId: body.triggerSource && body.triggerSource !== "admin" ? body.triggerSource : "all",
    });
    return NextResponse.json({ ok: true, result });
  }

  if (body.action === "decide" && body.decisionId && body.decisionStatus) {
    if (body.decisionStatus === "approved") {
      const executed = await executeApprovedDecision(body.decisionId);
      return NextResponse.json({ ok: Boolean(executed.decision), decision: executed.decision, execution: executed.execution });
    }
    const updated = await rejectDecision(body.decisionId, body.adminNote);
    return NextResponse.json({ ok: Boolean(updated), decision: updated });
  }

  if (body.action === "upsert_agent" && body.agent && typeof body.agent.nameAr === "string") {
    const tools = Array.isArray(body.agent.allowedTools)
      ? (body.agent.allowedTools as unknown[]).filter(isSwarmToolKey)
      : undefined;
    const saved = upsertRegisteredAgent({
      id: typeof body.agent.id === "string" ? body.agent.id : undefined,
      nameAr: body.agent.nameAr,
      nameEn: typeof body.agent.nameEn === "string" ? body.agent.nameEn : undefined,
      titleAr: typeof body.agent.titleAr === "string" ? body.agent.titleAr : undefined,
      missionAr: typeof body.agent.missionAr === "string" ? body.agent.missionAr : undefined,
      systemPrompt: typeof body.agent.systemPrompt === "string" ? body.agent.systemPrompt : undefined,
      avatarIcon: typeof body.agent.avatarIcon === "string" ? body.agent.avatarIcon : undefined,
      color: typeof body.agent.color === "string" ? body.agent.color : undefined,
      allowedTools: tools,
      enabled: body.agent.enabled !== false,
    });
    return NextResponse.json({ ok: true, agent: saved, registry: listRegisteredAgents(true) });
  }

  if (body.action === "delete_agent" && body.agentId) {
    const ok = deleteRegisteredAgent(body.agentId);
    return NextResponse.json({ ok, registry: listRegisteredAgents(true) });
  }

  if (body.action === "get_agent" && body.agentId) {
    return NextResponse.json({ ok: true, agent: getRegisteredAgent(body.agentId) });
  }

  if (body.action === "add_skill" && body.agentId && body.title && body.markdown) {
    return NextResponse.json({ ok: true, agent: addAgentSkill(body.agentId, body.title, body.markdown) });
  }
  if (body.action === "toggle_skill" && body.agentId && body.skillId) {
    return NextResponse.json({ ok: true, agent: toggleAgentSkill(body.agentId, body.skillId) });
  }
  if (body.action === "delete_skill" && body.agentId && body.skillId) {
    return NextResponse.json({ ok: true, agent: deleteAgentSkill(body.agentId, body.skillId) });
  }
  if (body.action === "add_rule" && body.agentId && body.title && body.markdown) {
    return NextResponse.json({ ok: true, agent: addAgentRule(body.agentId, body.title, body.markdown) });
  }
  if (body.action === "toggle_rule" && body.agentId && body.ruleId) {
    return NextResponse.json({ ok: true, agent: toggleAgentRule(body.agentId, body.ruleId) });
  }
  if (body.action === "delete_rule" && body.agentId && body.ruleId) {
    return NextResponse.json({ ok: true, agent: deleteAgentRule(body.agentId, body.ruleId) });
  }
  if (body.action === "update_prompt" && body.agentId && typeof body.systemPrompt === "string") {
    return NextResponse.json({ ok: true, agent: updateAgentPrompt(body.agentId, body.systemPrompt) });
  }
  if (body.action === "update_tools" && body.agentId && Array.isArray(body.allowedTools)) {
    const tools = body.allowedTools.filter(isSwarmToolKey) as SwarmToolKey[];
    return NextResponse.json({ ok: true, agent: updateAgentTools(body.agentId, tools) });
  }
  if (body.action === "add_memory" && body.agentId && body.note) {
    return NextResponse.json({ ok: true, agent: addAgentMemory(body.agentId, body.note) });
  }
  if (body.action === "delete_memory" && body.agentId && body.noteId) {
    return NextResponse.json({ ok: true, agent: deleteAgentMemory(body.agentId, body.noteId) });
  }

  return NextResponse.json({ ok: false, error: "Invalid action or parameters" }, { status: 400 });
}
