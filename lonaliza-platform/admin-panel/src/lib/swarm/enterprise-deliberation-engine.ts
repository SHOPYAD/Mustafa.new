import { generateGeminiContent } from "@/lib/server/gemini-swarm-client";
import {
  saveAdminDirective,
  savePendingDecision,
  saveSwarmDiscussionMessage,
  type AgentRole,
  type PendingApprovalDecision,
  type SwarmDiscussionMessage,
} from "@/lib/automation/agent-collab-store";
import { sendTelegramAdminMessage } from "@/lib/automation/channels/telegram";
import { buildAgentRuntimePrompt, getRegisteredAgent, listRegisteredAgents } from "./agent-registry";
import { runAgentReadTools } from "./agent-tools";
import { collectPlatformGroundedSnapshot, formatGroundedFactsForPrompt } from "./live-agent-metrics";
import { queryEpisodicMemory, saveEpisodicMemory } from "./agent-episodic-memory";
import type { ExecutableSwarmPlan, GroundedFact, SwarmActionType } from "./types";

export interface EnterpriseDeliberationInput {
  directiveText: string;
  source: "admin_dashboard" | "telegram" | "hud_studio" | "cron";
  targetAgentId?: string | "all";
  priority?: "normal" | "urgent" | "strategic";
  notifyTelegram?: boolean;
}

export interface EnterpriseDeliberationResult {
  ok: boolean;
  directiveId: string;
  consensusScore: number; // 0 - 100%
  leadAgentId: string;
  supportingAgentIds: string[];
  messages: SwarmDiscussionMessage[];
  proposal?: PendingApprovalDecision;
  auditTrailAr: string;
}

export async function runEnterpriseDeliberationCycle(
  input: EnterpriseDeliberationInput
): Promise<EnterpriseDeliberationResult> {
  const snapshot = await collectPlatformGroundedSnapshot();
  const factsBlock = formatGroundedFactsForPrompt(snapshot.facts);
  const roster = listRegisteredAgents(false);

  // 1. Log Master Directive
  const directiveId = `dir_${Date.now()}`;
  saveAdminDirective({
    id: directiveId,
    text: input.directiveText,
    targetAgent: (input.targetAgentId as AgentRole) || "all",
    createdAt: new Date().toISOString(),
    status: "executing",
  });

  const masterTriggerMsg: SwarmDiscussionMessage = {
    id: `disc_${Date.now()}_master`,
    fromAgent: "admin",
    toAgent: (input.targetAgentId as AgentRole) || "all",
    type: "directive",
    topic: "توجيه استراتيجي من الإدارة العليا",
    contentAr: input.directiveText,
    timestamp: new Date().toISOString(),
    impactLevel: input.priority === "urgent" ? "critical" : "high",
  };
  saveSwarmDiscussionMessage(masterTriggerMsg);
  const messages: SwarmDiscussionMessage[] = [masterTriggerMsg];

  // 2. Query Swarm Episodic Memory
  const pastMemories = queryEpisodicMemory(input.directiveText, input.targetAgentId, 2);
  const memoryContext =
    pastMemories.length > 0
      ? `\n\nذاكرة السرب السابقة (سوابق ناجحة):\n` +
        pastMemories.map((m) => `• [${m.agentId}] ${m.summaryAr} (${m.keyInsightsAr.join(" | ")})`).join("\n")
      : "";

  // 3. Master Overseer Planner (العقل المدبر)
  const masterPlanning = await generateGeminiContent<{
    leadAgentId: string;
    supportingAgentIds: string[];
    missionDecompositionAr: string;
    actionType: SwarmActionType;
  }>({
    systemInstruction:
      "أنت العقل المدبر والمشرف العام لخلية وكلاء لوناليزا (Master AI Overseer). مهمتك تحليل توجيه المدير وتفكيكه وتحديد الوكيل التنفيذي الأنسب (leadAgent) مع 2 وكلاء داعمين للمناظرة والتدقيق (supportingAgents). ممنوع اختراع أرقام. أرجع JSON فقط.",
    prompt: `حقائق المنصة الحية:\n${factsBlock}${memoryContext}\n\nالوكلاء المعتمدون في الخلية:\n${roster
      .map((a) => `- ${a.id}: ${a.nameAr} (${a.titleAr})`)
      .join("\n")}\n\nتوجيه الإدارة العليا: "${input.directiveText}"\nالهدف المحدد: ${input.targetAgentId || "all"}\n\nأرجع JSON:\n{"leadAgentId":"sales","supportingAgentIds":["ads","social"],"missionDecompositionAr":"...","actionType":"general_coordination"}`,
    temperature: 0.25,
    maxTokens: 850,
    responseMimeType: "application/json",
  });

  const leadId =
    (input.targetAgentId && input.targetAgentId !== "all" ? input.targetAgentId : masterPlanning.data?.leadAgentId) ||
    "site_advisor";
  const leadAgent = getRegisteredAgent(leadId) || roster[0];

  const supportingIds = (masterPlanning.data?.supportingAgentIds || [])
    .filter((id) => id !== leadAgent.id && roster.some((a) => a.id === id))
    .slice(0, 2);

  // If no supporting selected, pick relevant siblings
  if (supportingIds.length === 0) {
    const siblings = roster.filter((a) => a.id !== leadAgent.id);
    if (leadAgent.id === "site_advisor") supportingIds.push("sales", "social");
    else if (leadAgent.id === "sales") supportingIds.push("ads", "email");
    else if (leadAgent.id === "lead_scout") supportingIds.push("sales", "b2b_landing");
    else supportingIds.push(siblings[0]?.id || "sales", siblings[1]?.id || "social");
  }

  // Publish Overseer Master Plan
  const overseerMsg: SwarmDiscussionMessage = {
    id: `disc_${Date.now()}_overseer`,
    fromAgent: "admin",
    toAgent: "all",
    type: "insight",
    topic: "العقل المدبر: تفكيك المهمة ومخطط التنسيق العصبي",
    contentAr:
      masterPlanning.data?.missionDecompositionAr ||
      `تم توجيه قيادة المهمة للوكيل الأساسي (${leadAgent.nameAr}) مع تكليف (${supportingIds.join(" و ")}) بمهام المراجعة والمناظرة والتحقق المالي.`,
    timestamp: new Date().toISOString(),
    impactLevel: "high",
  };
  saveSwarmDiscussionMessage(overseerMsg);
  messages.push(overseerMsg);

  // 4. Step 1: Lead Agent Formulation with Real Grounded Tools
  const leadTools = await runAgentReadTools(leadAgent.allowedTools);
  const leadToolFacts = leadTools.flatMap((t) => t.facts);
  const leadToolsSummary = leadTools.map((t) => `• ${t.tool}: ${t.ok ? t.summaryAr : "غير متاح"}`).join("\n");

  const leadTurn = await generateGeminiContent<{
    contentAr: string;
    proposal?: {
      titleAr: string;
      descriptionAr: string;
      actionType: SwarmActionType;
      costUSD?: number;
      expectedBenefitAr: string;
      actionPayload?: Record<string, unknown>;
    };
  }>({
    systemInstruction: buildAgentRuntimePrompt(leadAgent),
    prompt: `أنت الوكيل القيادي في هذه المهمة. استخدم بيانات أدواتك الحية فقط وتذكر سوابق السرب:\n${leadToolsSummary}${memoryContext}\n\nتوجيه المدير: "${input.directiveText}"\n\nصغ مقترحك التنفيذي المبدئي لخلية الوكلاء. أرجع JSON:\n{"contentAr":"...","proposal":{"titleAr":"...","descriptionAr":"...","actionType":"general_coordination","costUSD":0,"expectedBenefitAr":"...","actionPayload":{}}}`,
    temperature: 0.35,
    maxTokens: 1100,
    responseMimeType: "application/json",
  });

  const leadMsg: SwarmDiscussionMessage = {
    id: `disc_${Date.now()}_${leadAgent.id}`,
    fromAgent: leadAgent.id,
    toAgent: "all",
    type: "proposal",
    topic: `مقترح ${leadAgent.nameAr} التنفيذي`,
    contentAr: leadTurn.data?.contentAr || `${leadAgent.nameAr}: تم فحص المعطيات وتقديم مسودة العمل.`,
    timestamp: new Date().toISOString(),
    impactLevel: "high",
    proposalData: leadTurn.data?.proposal
      ? {
          actionType: leadTurn.data.proposal.actionType,
          suggestedChange: leadTurn.data.proposal.titleAr,
          estimatedCostUSD: leadTurn.data.proposal.costUSD,
          estimatedRoiGain: leadTurn.data.proposal.expectedBenefitAr,
        }
      : undefined,
  };
  saveSwarmDiscussionMessage(leadMsg);
  messages.push(leadMsg);

  // 5. Step 2: Peer Cross-Critique & Deliberation (مناظرة الأقران والتدقيق)
  const peerReviews: Array<{ agentId: string; score: number; critiqueAr: string }> = [];

  for (const peerId of supportingIds) {
    const peerAgent = getRegisteredAgent(peerId);
    if (!peerAgent) continue;

    const peerTools = await runAgentReadTools(peerAgent.allowedTools);
    const peerToolsSummary = peerTools.map((t) => `• ${t.tool}: ${t.ok ? t.summaryAr : "غير متاح"}`).join("\n");

    const peerTurn = await generateGeminiContent<{
      critiqueAr: string;
      feasibilityScore: number; // 1 to 10
      suggestedEnhancementAr: string;
    }>({
      systemInstruction: buildAgentRuntimePrompt(peerAgent),
      prompt: `المقترح المطروح من (${leadAgent.nameAr}):\n"${leadTurn.data?.contentAr}"\n\nبياناتك الحية كـ (${peerAgent.nameAr}):\n${peerToolsSummary}\n\nراجع هذا المقترح من زاوية تخصصك. قيّم الجدوى وأعطِ ملاحظات تنقيح. أرجع JSON:\n{"critiqueAr":"...","feasibilityScore":9,"suggestedEnhancementAr":"..."}`,
      temperature: 0.3,
      maxTokens: 900,
      responseMimeType: "application/json",
    });

    const score = Math.max(1, Math.min(10, peerTurn.data?.feasibilityScore || 8));
    peerReviews.push({
      agentId: peerAgent.id,
      score,
      critiqueAr: peerTurn.data?.critiqueAr || "المقترح متوافق مع مؤشرات السرب.",
    });

    const critiqueMsg: SwarmDiscussionMessage = {
      id: `disc_${Date.now()}_${peerAgent.id}`,
      fromAgent: peerAgent.id,
      toAgent: leadAgent.id,
      type: "recommendation",
      topic: `تدقيق ${peerAgent.nameAr} لمقترح ${leadAgent.nameAr}`,
      contentAr: `📊 تقييم الجدوى: ${score * 10}%\n${peerTurn.data?.critiqueAr || "معتمد مبدئياً."}\n💡 الإضافة المقترحة: ${peerTurn.data?.suggestedEnhancementAr || "المتابعة اللحظية للتنفيذ."}`,
      timestamp: new Date().toISOString(),
      impactLevel: score >= 8 ? "medium" : "high",
    };
    saveSwarmDiscussionMessage(critiqueMsg);
    messages.push(critiqueMsg);
  }

  // 6. Step 3: Swarm Consensus Calculation (حساب الإجماع العصبي)
  const avgScore = peerReviews.length > 0 ? peerReviews.reduce((sum, r) => sum + r.score, 0) / peerReviews.length : 9;
  const consensusScore = Math.round(avgScore * 10);

  // 7. Step 4: Decision Synthesis & Packaging
  let proposal: PendingApprovalDecision | undefined;

  if (leadTurn.data?.proposal?.titleAr) {
    const p = leadTurn.data.proposal;
    proposal = {
      id: `dec_${Date.now().toString(36)}`,
      titleAr: p.titleAr,
      descriptionAr: `${p.descriptionAr}\n\n🤝 نتيجة تشاور السرب: إجماع بنسبة ${consensusScore}%\nملاحظات المراجعة: ${peerReviews.map((r) => `${r.agentId} (${r.score * 10}%)`).join(" • ")}`,
      proposedBy: leadAgent.id,
      affectedAgent: leadAgent.id,
      actionType: p.actionType,
      costUSD: p.costUSD,
      expectedBenefitAr: p.expectedBenefitAr,
      status: "pending",
      createdAt: new Date().toISOString(),
      executablePlan: {
        actionType: p.actionType,
        actionPayload: p.actionPayload || {},
      },
      actionPayload: p.actionPayload,
    };
    savePendingDecision(proposal);

    // Save insight to episodic memory
    saveEpisodicMemory({
      category: "campaign_outcome",
      agentId: leadAgent.id,
      summaryAr: `خطة ${proposal.titleAr}: إجماع السرب ${consensusScore}% مع وكلاء ${supportingIds.join(" & ")}.`,
      keyInsightsAr: peerReviews.map((r) => r.critiqueAr.slice(0, 120)),
      metrics: { roiGain: p.expectedBenefitAr, costUSD: p.costUSD, successRate: consensusScore / 100 },
      tags: [leadAgent.id, p.actionType, ...supportingIds],
    });
  }

  // Telegram Notification
  if (proposal && input.notifyTelegram !== false) {
    void sendTelegramAdminMessage(
      `⚡ *قرار تنفيذي معتمد من خلية الوكلاء الذكية*\n\n` +
        `📋 *${proposal.titleAr}*\n` +
        `${proposal.descriptionAr}\n` +
        `🧠 *نسبة إجماع السرب (Consensus):* ${consensusScore}%\n` +
        `👤 *الوكيل القيادي:* ${leadAgent.nameAr}\n` +
        (proposal.costUSD ? `💰 التكلفة: $${proposal.costUSD}\n` : "") +
        `🎯 الأثر المتوقع: ${proposal.expectedBenefitAr}`
    );
  }

  return {
    ok: true,
    directiveId,
    consensusScore,
    leadAgentId: leadAgent.id,
    supportingAgentIds: supportingIds,
    messages,
    proposal,
    auditTrailAr: `تم إنجاز دورة التشاور متعددة المراحل بإجماع ${consensusScore}% بين ${leadAgent.nameAr} و${supportingIds.join("، ")}.`,
  };
}
