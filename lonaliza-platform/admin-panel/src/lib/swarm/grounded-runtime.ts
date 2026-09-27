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
import type { ExecutableSwarmPlan, GroundedFact, SwarmActionType } from "./types";

export type GroundedRuntimeInput = {
  directiveText: string;
  source: "admin_dashboard" | "telegram" | "copilot" | "cron";
  targetAgentId?: string | "all";
  notifyTelegram?: boolean;
};

export type GroundedRuntimeResult = {
  ok: boolean;
  messages: SwarmDiscussionMessage[];
  proposal?: PendingApprovalDecision;
  factsUsed: GroundedFact[];
  reportAr: string;
};

const ACTION_TYPES: SwarmActionType[] = [
  "create_blog_article",
  "create_tourism_service",
  "create_automation_job",
  "launch_meta_ad",
  "publish_social_post",
  "content_launch",
  "budget_shift",
  "campaign_pause",
  "email_broadcast",
  "pricing_tweak",
  "general_coordination",
];

function parseActionType(value: unknown): SwarmActionType {
  const v = String(value || "");
  return ACTION_TYPES.includes(v as SwarmActionType) ? (v as SwarmActionType) : "general_coordination";
}

function critiqueText(content: string, facts: GroundedFact[]): string {
  const available = facts.filter((f) => f.available).map((f) => String(f.value));
  const invented = content.match(/\d+(?:\.\d+)?%|\$\d+|\d+(?:\.\d+)?x/g) || [];
  const stripped = invented.filter((token) => !available.some((v) => String(v).includes(token.replace(/[%$x]/g, ""))));
  if (stripped.length === 0) return content;
  return `${content}\n\n⚠️ تنبيه المدقق: أرقام (${stripped.join(", ")}) لم تُعثر في مصادر النظام وتم تجاهل اعتمادها.`;
}

export async function runGroundedSwarmCycle(input: GroundedRuntimeInput): Promise<GroundedRuntimeResult> {
  const snapshot = await collectPlatformGroundedSnapshot();
  const factsBlock = formatGroundedFactsForPrompt(snapshot.facts);
  const roster = listRegisteredAgents(false);
  const target =
    input.targetAgentId && input.targetAgentId !== "all"
      ? roster.filter((a) => a.id === input.targetAgentId)
      : roster;

  const directiveId = `dir_${Date.now()}`;
  saveAdminDirective({
    id: directiveId,
    text: input.directiveText,
    targetAgent: (input.targetAgentId as AgentRole) || "all",
    createdAt: new Date().toISOString(),
    status: "executing",
  });

  const triggerMsg: SwarmDiscussionMessage = {
    id: `disc_${Date.now()}_dir`,
    fromAgent: "admin",
    toAgent: (input.targetAgentId as AgentRole) || "all",
    type: "directive",
    topic: "توجيه إداري تنفيذي",
    contentAr: input.directiveText,
    timestamp: new Date().toISOString(),
    impactLevel: "critical",
  };
  saveSwarmDiscussionMessage(triggerMsg);
  const messages: SwarmDiscussionMessage[] = [triggerMsg];

  const supervisor = await generateGeminiContent<{
    selectedAgentIds?: string[];
    planAr?: string;
    requiresApproval?: boolean;
    proposedActionType?: SwarmActionType;
  }>({
    systemInstruction:
      "أنت مشرف خلية وكلاء لوناليزا. خطط فقط بناءً على الحقائق المعطاة. ممنوع اختراع أرقام. أرجع JSON.",
    prompt: `الحقائق الحية:\n${factsBlock}\n\nالوكلاء المتاحون:\n${roster
      .map((a) => `- ${a.id}: ${a.nameAr} (${a.titleAr})`)
      .join("\n")}\n\nتوجيه المدير: "${input.directiveText}"\nالهدف: ${input.targetAgentId || "all"}\n\nأرجع JSON:\n{"selectedAgentIds":["sales"],"planAr":"...","requiresApproval":true,"proposedActionType":"general_coordination"}`,
    temperature: 0.3,
    maxTokens: 900,
    responseMimeType: "application/json",
  });

  const selectedIds =
    supervisor.data?.selectedAgentIds?.filter((id) => roster.some((a) => a.id === id)) ||
    target.map((a) => a.id).slice(0, 4);
  const uniqueIds = [...new Set(selectedIds.length ? selectedIds : target.slice(0, 3).map((a) => a.id))];

  if (supervisor.data?.planAr) {
    const planMsg: SwarmDiscussionMessage = {
      id: `disc_${Date.now()}_plan`,
      fromAgent: "admin",
      toAgent: "all",
      type: "insight",
      topic: "خطة المشرف للخلية",
      contentAr: critiqueText(supervisor.data.planAr, snapshot.facts),
      timestamp: new Date().toISOString(),
      impactLevel: "high",
    };
    saveSwarmDiscussionMessage(planMsg);
    messages.push(planMsg);
  }

  let proposal: PendingApprovalDecision | undefined;

  for (const agentId of uniqueIds) {
    const agent = getRegisteredAgent(agentId);
    if (!agent) continue;
    const toolResults = await runAgentReadTools(agent.allowedTools);
    const toolFacts = toolResults.flatMap((r) => r.facts);
    const toolBlock = toolResults
      .map((r) => `• ${r.tool}: ${r.ok ? r.summaryAr : r.error || "فشل"}`)
      .join("\n");

    const turn = await generateGeminiContent<{
      contentAr?: string;
      type?: SwarmDiscussionMessage["type"];
      toAgent?: string;
      propose?: {
        titleAr: string;
        descriptionAr: string;
        actionType: SwarmActionType;
        costUSD?: number;
        expectedBenefitAr: string;
        actionPayload?: Record<string, unknown>;
      } | null;
    }>({
      systemInstruction: buildAgentRuntimePrompt(agent),
      prompt: `توجيه المدير: "${input.directiveText}"\n\nحقائق المنصة:\n${factsBlock}\n\nنتائج أدواتك فقط:\n${toolBlock}\n\nاكتب ردك كعضو في الخلية. استخدم أرقام الأدوات فقط. أرجع JSON:\n{"contentAr":"...","type":"recommendation","toAgent":"all","propose":null}\nإذا احتجت إجراءً تنفيذياً ضع propose مع actionType و actionPayload.`,
      temperature: 0.4,
      maxTokens: 1200,
      responseMimeType: "application/json",
    });

    const rawText =
      turn.data?.contentAr ||
      `${agent.nameAr}: استلمت التوجيه واطلعت على البيانات الفعلية (${toolResults.map((r) => r.summaryAr).join(" · ")}).`;
    const contentAr = critiqueText(rawText, [...snapshot.facts, ...toolFacts]);

    const msg: SwarmDiscussionMessage = {
      id: `disc_${Date.now()}_${agent.id}`,
      fromAgent: agent.id,
      toAgent: (turn.data?.toAgent as AgentRole) || "all",
      type: turn.data?.type || "recommendation",
      topic: `رد ${agent.nameAr}`,
      contentAr,
      timestamp: new Date().toISOString(),
      impactLevel: "high",
    };
    saveSwarmDiscussionMessage(msg);
    messages.push(msg);

    if (!proposal && turn.data?.propose?.titleAr) {
      const actionType = parseActionType(turn.data.propose.actionType || supervisor.data?.proposedActionType);
      const executablePlan: ExecutableSwarmPlan = {
        actionType,
        actionPayload: turn.data.propose.actionPayload || {},
      };
      proposal = {
        id: `dec_${Date.now().toString(36)}`,
        titleAr: turn.data.propose.titleAr,
        descriptionAr: turn.data.propose.descriptionAr,
        proposedBy: agent.id,
        affectedAgent: agent.id,
        actionType,
        costUSD: turn.data.propose.costUSD,
        expectedBenefitAr: turn.data.propose.expectedBenefitAr,
        status: "pending",
        createdAt: new Date().toISOString(),
        executablePlan,
        actionPayload: executablePlan.actionPayload,
      };
      savePendingDecision(proposal);
    }
  }

  if (!proposal && supervisor.data?.requiresApproval) {
    proposal = {
      id: `dec_${Date.now().toString(36)}`,
      titleAr: "اعتماد خطة التنسيق",
      descriptionAr: supervisor.data.planAr || input.directiveText,
      proposedBy: uniqueIds[0] || "sales",
      affectedAgent: uniqueIds[1] || uniqueIds[0] || "sales",
      actionType: parseActionType(supervisor.data.proposedActionType),
      expectedBenefitAr: "تنفيذ التوجيه بعد المراجعة",
      status: "pending",
      createdAt: new Date().toISOString(),
      executablePlan: { actionType: parseActionType(supervisor.data.proposedActionType) },
    };
    savePendingDecision(proposal);
  }

  if (proposal && input.notifyTelegram !== false) {
    void sendTelegramAdminMessage(
      `⚡ *مقترح من خلية الوكلاء يحتاج اعتمادكم*\n\n` +
        `📋 *${proposal.titleAr}*\n` +
        `${proposal.descriptionAr}\n` +
        (proposal.costUSD ? `💰 التكلفة: $${proposal.costUSD}\n` : "") +
        `🎯 ${proposal.expectedBenefitAr}\n` +
        `🔑 \`${proposal.id}\``,
      {
        replyMarkup: {
          inline_keyboard: [
            [
              { text: "✅ اعتماد وتنفيذ", callback_data: `dec_app:${proposal.id}` },
              { text: "❌ رفض", callback_data: `dec_rej:${proposal.id}` },
            ],
            [
              { text: "👁️ غرفة العمليات", url: "https://lonaliza.com/admin/agent-war-room" },
              { text: "🤖 تفويض المشرف العام", callback_data: `dec_cop:${proposal.id}` },
            ],
          ],
        },
      }
    ).catch(() => {});
  }

  const reportAr = [
    "تم تشغيل دورة خلية حقيقية بأدوات النظام.",
    `الوكلاء المشاركون: ${uniqueIds.join(", ")}`,
    proposal ? `مقترح معلّق: ${proposal.titleAr} (${proposal.id})` : "لا يوجد أثر جانبي يحتاج موافقة.",
    `حقائق مستخدمة: ${snapshot.facts.filter((f) => f.available).length} مؤشر حي.`,
  ].join("\n");

  return {
    ok: true,
    messages,
    proposal,
    factsUsed: snapshot.facts,
    reportAr,
  };
}
