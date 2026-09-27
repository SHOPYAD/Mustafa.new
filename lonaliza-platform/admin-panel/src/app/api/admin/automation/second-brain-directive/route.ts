import { NextRequest, NextResponse } from "next/server";
import { executeSwarmTool } from "@/lib/swarm/agent-tools";
import { saveSwarmDiscussionMessage } from "@/lib/automation/agent-collab-store";
import type { SwarmToolKey } from "@/lib/swarm/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { directiveId, subModuleId, toolKey, actionType, assignedAgentId, payload } = body;

    let summaryAr = "تم تنفيذ التكليف الإداري السيادي بنجاح.";
    let directUrl: string | undefined;

    // If a valid registered toolKey is provided, execute it via the real tool engine
    if (toolKey) {
      try {
        const toolResult = await executeSwarmTool(toolKey as SwarmToolKey, payload || {});
        if (toolResult.ok) {
          summaryAr = `⚡ ${toolResult.summaryAr}`;
          if (toolResult.payload && typeof toolResult.payload.url === "string") {
            directUrl = toolResult.payload.url;
          }
        }
      } catch (err: any) {
        console.warn("[Second Brain Directive Tool Execution]", err?.message || err);
      }
    }

    // Record decision in the Swarm Discussion / Audit Ledger
    saveSwarmDiscussionMessage({
      id: `sb_exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fromAgent: assignedAgentId || "supervisor_prime",
      toAgent: "all",
      type: "decision",
      topic: `تنفيذ إداري سيادي: ${actionType || directiveId}`,
      contentAr: `⚡ تم تنفيذ الإجراء الإداري الحي من قِبل المشرف العام عبر العقل الثاني:\nالموديول: ${subModuleId}\nالنتيجة: ${summaryAr}`,
      timestamp: new Date().toISOString(),
      impactLevel: "critical",
    });

    return NextResponse.json({
      ok: true,
      directiveId,
      subModuleId,
      summaryAr,
      directUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Internal server error executing directive",
      },
      { status: 500 }
    );
  }
}
