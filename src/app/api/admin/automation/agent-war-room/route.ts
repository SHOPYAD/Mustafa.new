import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  DEFAULT_AGENTS,
  getSwarmDiscussions,
  getPendingDecisions,
  getAdminDirectives,
  updateDecisionStatus,
  type AgentRole,
} from "@/lib/automation/agent-collab-store";
import { triggerSwarmDeliberation } from "@/lib/automation/agent-swarm-orchestrator";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const discussions = getSwarmDiscussions();
  const decisions = getPendingDecisions();
  const directives = getAdminDirectives();

  return NextResponse.json({
    ok: true,
    agents: DEFAULT_AGENTS,
    discussions,
    decisions,
    directives,
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const body = (await req.json()) as {
    action: "directive" | "deliberate" | "decide";
    directiveText?: string;
    topic?: string;
    contextText?: string;
    triggerSource?: AgentRole | "admin";
    decisionId?: string;
    decisionStatus?: "approved" | "rejected";
    adminNote?: string;
  };

  if (body.action === "directive" && body.directiveText) {
    const result = await triggerSwarmDeliberation({
      triggerSource: "admin",
      topic: "توجيه إداري مباشر من المدير التنفيذي",
      contextText: body.directiveText.trim(),
      impactLevel: "high",
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  }

  if (body.action === "deliberate" && body.topic && body.contextText) {
    const result = await triggerSwarmDeliberation({
      triggerSource: body.triggerSource || "sales",
      topic: body.topic.trim(),
      contextText: body.contextText.trim(),
      impactLevel: "medium",
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  }

  if (body.action === "decide" && body.decisionId && body.decisionStatus) {
    const updated = updateDecisionStatus(body.decisionId, body.decisionStatus, body.adminNote);
    return NextResponse.json({
      ok: Boolean(updated),
      decision: updated,
    });
  }

  return NextResponse.json(
    { ok: false, error: "Invalid action or parameters" },
    { status: 400 }
  );
}
