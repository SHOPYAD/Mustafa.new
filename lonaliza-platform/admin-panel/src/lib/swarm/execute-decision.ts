import {
  savePendingDecision,
  saveSwarmDiscussionMessage,
  updateDecisionStatus,
  type PendingApprovalDecision,
} from "@/lib/automation/agent-collab-store";
import { executeSwarmTool } from "./agent-tools";
import type { ExecutableSwarmPlan, SwarmActionType, SwarmToolKey } from "./types";

export type DecisionExecutionResult = {
  success: boolean;
  summaryAr: string;
  directUrl?: string;
};

function actionToTool(actionType: SwarmActionType): SwarmToolKey | null {
  switch (actionType) {
    case "create_blog_article":
    case "content_launch":
      return "create_blog";
    case "create_tourism_service":
      return "create_tour";
    case "create_automation_job":
      return "create_automation_job";
    case "launch_meta_ad":
    case "budget_shift":
      return "launch_meta_ad";
    default:
      return null;
  }
}

export async function executeApprovedDecision(decisionId: string): Promise<{
  decision: PendingApprovalDecision | null;
  execution: DecisionExecutionResult;
}> {
  const updated = updateDecisionStatus(decisionId, "approved", "اعتماد تنفيذي من الخلية");
  if (!updated) {
    return {
      decision: null,
      execution: { success: false, summaryAr: "القرار غير موجود أو سبق البت فيه." },
    };
  }

  const plan: ExecutableSwarmPlan | undefined = updated.executablePlan || {
    actionType: updated.actionType,
    actionPayload: updated.actionPayload,
  };

  const tool = actionToTool(plan.actionType);
  let execution: DecisionExecutionResult;

  if (!tool) {
    execution = {
      success: true,
      summaryAr:
        plan.actionType === "general_coordination"
          ? "تم اعتماد التنسيق. لا يوجد أثر جانبي قابل للتنفيذ في المخازن."
          : `تم اعتماد القرار (${plan.actionType}) دون أداة تنفيذ مباشرة — لا تتوفر خدمة تنفيذ لهذا النوع حالياً.`,
    };
  } else {
    const result = await executeSwarmTool(tool, plan.actionPayload || {});
    execution = {
      success: result.ok,
      summaryAr: result.summaryAr,
      directUrl: typeof result.payload?.url === "string" ? result.payload.url : undefined,
    };
  }

  const next: PendingApprovalDecision = {
    ...updated,
    executionResult: execution,
    status: "approved",
  };
  savePendingDecision(next);

  saveSwarmDiscussionMessage({
    id: `disc_exec_${Date.now()}`,
    fromAgent: "admin",
    toAgent: "all",
    type: "decision",
    topic: `تنفيذ قرار: ${updated.titleAr}`,
    contentAr: execution.success
      ? `✅ نُفّذ القرار المعتمد «${updated.titleAr}» فعلياً.\n${execution.summaryAr}${execution.directUrl ? `\nالرابط: ${execution.directUrl}` : ""}`
      : `⚠️ اعتُمد القرار «${updated.titleAr}» لكن التنفيذ الفعلي تعذر:\n${execution.summaryAr}`,
    timestamp: new Date().toISOString(),
    impactLevel: "critical",
  });

  return { decision: next, execution };
}

export async function rejectDecision(decisionId: string, note?: string): Promise<PendingApprovalDecision | null> {
  const updated = updateDecisionStatus(decisionId, "rejected", note || "مرفوض من الإدارة");
  if (!updated) return null;
  saveSwarmDiscussionMessage({
    id: `disc_rej_${Date.now()}`,
    fromAgent: "admin",
    toAgent: "all",
    type: "decision",
    topic: `رفض قرار: ${updated.titleAr}`,
    contentAr: `❌ رُفض المقترح «${updated.titleAr}» ولم يُنفَّذ أي تغيير في النظام.`,
    timestamp: new Date().toISOString(),
    impactLevel: "medium",
  });
  return updated;
}
