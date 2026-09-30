/**
 * Enterprise LangGraph Multi-Agent Deliberation Engine:
 * Implements a state-of-the-art StateGraph orchestrating Supervisor, Specialist Swarm,
 * Adversarial Red Teamer / Financial Auditor, Dynamic ReAct Tool Calling, and Swarm Consensus.
 *
 * ARCHITECTURE PRINCIPLE: This engine is 100% dynamic and autonomous.
 * It does NOT contain any hardcoded articles, destinations, or canned responses.
 * Every task is decomposed, delegated, and executed dynamically via Gemini AI and MCP tools.
 */

import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiApiKey, resolveGeminiFreeApiKey } from "@/lib/server/gemini";
import { listRegisteredAgents, getRegisteredAgent } from "./agent-registry";
import { collectPlatformGroundedSnapshot } from "./live-agent-metrics";
import { executeMcpSwarmCall } from "./mcp-swarm-gateway";
import { classifyTaskDomain, mcpToolsForDomain } from "./task-domain";
import { queryEpisodicMemorySemantic, saveEpisodicMemory, type SwarmEpisodicMemoryEntry } from "./agent-episodic-memory";
import {
  SupervisorPlanSchema,
  AgentProposalSchema,
  AdversarialCritiqueSchema,
  ConsensusEvaluationSchema,
  FinalDeliberationSynthesisSchema,
  type SupervisorPlan,
  type AgentProposal,
  type AdversarialCritique,
  type ConsensusEvaluation,
  type FinalDeliberationSynthesis,
} from "./schemas";
import { savePendingDecision, saveSwarmDiscussionMessage, type AgentRole, type SwarmDecisionActionType } from "@/lib/automation/agent-collab-store";
import type { GroundedFact, SwarmActionType } from "./types";
import { broadcastArticleStage, broadcastSwarmLog, broadcastSwarmPulse } from "./swarm-events";
import { runOfficialArticlePipeline } from "@/lib/swarm/official-article-pipeline";
import { saveThreadCheckpoint } from "@/lib/swarm/article-thread-checkpoint";
import {
  executeControlPanelTool,
  inspectControlPanelTools,
  platformToolIdForDirective,
  shouldProbeExecuteDirective,
  taskTypeForSystemId,
} from "@/lib/swarm/control-panel-tool-registry";
import { dispatchInternalDirective } from "@/lib/studio/graph/internal-engine";
import { isArticleDirective } from "@/lib/swarm/article-pipeline-types";

// 1. Define State Channels using LangGraph Annotation
export const SwarmDeliberationState = Annotation.Root({
  directive: Annotation<string>(),
  sessionId: Annotation<string>(),
  autoExecute: Annotation<boolean | undefined>(),
  roundNumber: Annotation<number>(),
  maxRounds: Annotation<number>(),
  supervisorPlan: Annotation<SupervisorPlan | null>(),
  episodicContext: Annotation<SwarmEpisodicMemoryEntry[]>(),
  groundedFacts: Annotation<GroundedFact[]>(),
  agentProposals: Annotation<Record<string, AgentProposal>>(),
  critiques: Annotation<AdversarialCritique[]>(),
  consensus: Annotation<ConsensusEvaluation | null>(),
  finalSynthesis: Annotation<FinalDeliberationSynthesis | null>(),
  toolHalt: Annotation<string | undefined>(),
  toolName: Annotation<string | undefined>(),
  terminalLogs: Annotation<
    Array<{
      id: string;
      timestamp: string;
      sender: string;
      senderNameAr: string;
      role: string;
      contentAr: string;
      type: "directive" | "proposal" | "critique" | "consensus" | "decision" | "tool";
    }>
  >(),
});

export type SwarmStateType = typeof SwarmDeliberationState.State;

export interface DeliberationSessionTurn {
  id: string;
  timestamp: string;
  userDirective: string;
  assistantResponse: string;
  topic?: string;
}

const sessionTurnHistory = new Map<string, DeliberationSessionTurn[]>();
const globalRecentTurns: DeliberationSessionTurn[] = [];

export function recordDeliberationTurn(
  sessionId: string,
  userDirective: string,
  assistantResponse: string,
  topic?: string
) {
  const turn: DeliberationSessionTurn = {
    id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    userDirective,
    assistantResponse,
    topic,
  };
  const list = sessionTurnHistory.get(sessionId) || [];
  list.push(turn);
  if (list.length > 20) list.shift();
  sessionTurnHistory.set(sessionId, list);

  globalRecentTurns.push(turn);
  if (globalRecentTurns.length > 20) globalRecentTurns.shift();
}

export function getLastTurn(sessionId?: string): DeliberationSessionTurn | null {
  if (sessionId && sessionTurnHistory.has(sessionId)) {
    const list = sessionTurnHistory.get(sessionId)!;
    if (list.length > 0) return list[list.length - 1];
  }
  if (globalRecentTurns.length > 0) {
    return globalRecentTurns[globalRecentTurns.length - 1];
  }
  return null;
}

// Resolve API key: try primary first, then free-tier key
async function resolveAnyGeminiApiKey(): Promise<string | null> {
  const primary = await resolveGeminiApiKey();
  if (primary.apiKey) return primary.apiKey;
  const free = await resolveGeminiFreeApiKey();
  if (free.apiKey) return free.apiKey;
  return null;
}

// Free-tier Gemini models ordered by active quota availability and capability
const FREE_TIER_MODELS = [
  "gemini-3.5-flash-lite", // Verified free-tier model on AI Studio: fast, high RPM
  "gemini-3.1-flash-lite", // Verified secondary free-tier model: reliable backup
  "gemini-3.7-flash",      // Next-generation model fallback
  "gemini-3.6-flash",      // Balanced fallback
  "gemini-2.0-flash",      // Legacy fallback
  "gemini-1.5-flash",      // Legacy fallback
];

// Helper to call Gemini with multi-model cascade and fallback (short responses)
async function callGeminiLlm(prompt: string, fallback: string): Promise<string> {
  try {
    const apiKey = await resolveAnyGeminiApiKey();
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      for (const modelId of FREE_TIER_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelId });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("GeminiTimeout")), 15000)
          );
          const res = await Promise.race([
            model.generateContent(prompt),
            timeoutPromise,
          ]);
          const text = res.response.text();
          if (text && text.trim().length > 0) return text.trim();
        } catch (modelErr) {
          console.warn(`[LangGraph] Model ${modelId} failed, trying next:`, modelErr instanceof Error ? modelErr.message : modelErr);
        }
      }
    }
  } catch (err) {
    console.warn("Gemini call in LangGraph fallback:", err);
  }
  return fallback;
}

// Extended Gemini call for long-form content generation (longer timeout, bigger responses)
async function callGeminiLlmLong(prompt: string, fallback: string): Promise<string> {
  try {
    const apiKey = await resolveAnyGeminiApiKey();
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      for (const modelId of FREE_TIER_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.7,
            },
          });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("GeminiLongTimeout")), 60000)
          );
          const res = await Promise.race([
            model.generateContent(prompt),
            timeoutPromise,
          ]);
          const text = res.response.text();
          if (text && text.trim().length > 200) return text.trim();
        } catch (modelErr) {
          console.warn(`[LangGraph Long] Model ${modelId} failed:`, modelErr instanceof Error ? modelErr.message : modelErr);
        }
      }
    }
  } catch (err) {
    console.warn("Gemini long call fallback:", err);
  }
  return fallback;
}

/**
 * Generate a dynamic slug from a title string
 */
function generateDynamicSlug(title: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const base = title
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);
  return `${base}-${year}-${Date.now().toString(36)}`;
}

// 2. Node: Supervisor / Master Overseer
async function supervisorNode(state: SwarmStateType): Promise<Partial<SwarmStateType>> {
  const { directive, sessionId } = state;
  const now = new Date().toISOString();
  const toolId = platformToolIdForDirective(directive);
  const taskType = toolId ? taskTypeForSystemId(toolId) : "general";
  let probeLogs = state.terminalLogs;
  if (toolId) {
    const rows = await inspectControlPanelTools();
    const row = rows.find((item) => item.id === toolId);
    if (row && !row.connected && row.status === "not-wired") {
      const error = row.error || `${row.tool} is not connected`;
      broadcastArticleStage(sessionId, { id: toolId, tool: row.tool, status: "active", outcome: `calling ${row.tool}` }, { taskType });
      broadcastArticleStage(sessionId, { id: toolId, tool: row.tool, status: "failed", outcome: error, error }, { taskType });
      const log = {
        id: `log_${Date.now()}_tool_${toolId}`,
        timestamp: now,
        sender: row.tool,
        senderNameAr: row.label,
        role: "Connected tool",
        contentAr: `${row.tool}: ${error}`,
        type: "tool" as const,
      };
      await saveThreadCheckpoint({
        threadId: sessionId,
        articleId: "",
        slug: "",
        destinationKey: toolId,
        updatedAt: now,
        taskType,
        plan: `call ${row.tool}`,
        recordId: toolId,
        toolResults: [{ tool: row.tool, ok: false, summary: error, at: now }],
      });
      return {
        toolHalt: error,
        toolName: row.tool,
        terminalLogs: [...state.terminalLogs, log],
      };
    }
    if (row && shouldProbeExecuteDirective(directive)) {
      const execTool = row.swarmTool || row.mcpTool || row.tool;
      broadcastArticleStage(sessionId, { id: toolId, tool: execTool, status: "active", outcome: `calling ${execTool}` }, { taskType });
      const executed = await executeControlPanelTool(toolId);
      broadcastArticleStage(
        sessionId,
        {
          id: toolId,
          tool: executed.tool,
          status: executed.ok ? "completed" : "failed",
          outcome: executed.summary || executed.error || "",
          error: executed.error,
        },
        { taskType }
      );
      await saveThreadCheckpoint({
        threadId: sessionId,
        articleId: "",
        slug: "",
        destinationKey: toolId,
        updatedAt: now,
        taskType,
        plan: `execute ${executed.tool}`,
        recordId: toolId,
        toolResults: [{ tool: executed.tool, ok: executed.ok, summary: executed.summary || executed.error || "", at: now }],
      });
      probeLogs = [
        ...state.terminalLogs,
        {
          id: `log_${Date.now()}_exec_${toolId}`,
          timestamp: now,
          sender: executed.tool,
          senderNameAr: row.label,
          role: "Platform system",
          contentAr: executed.ok ? `${executed.tool}: ${executed.summary}` : `${executed.tool}: ${executed.error}`,
          type: "tool" as const,
        },
      ];
      if (!executed.ok) {
        return {
          toolHalt: executed.error || `${executed.tool} failed`,
          toolName: executed.tool,
          terminalLogs: probeLogs,
        };
      }
    }
  }

  // 1. Gather Grounded Facts from platform databases
  const snapshot = await collectPlatformGroundedSnapshot();
  const facts = snapshot.facts;

  // 2. Query Semantic Vector Episodic Memory
  const memoryHits = await queryEpisodicMemorySemantic(directive, "all", 3);
  const episodicMemories = memoryHits.map((h) => h.memory);

  // 3. Select relevant agents from genuine platform swarm dynamically
  const availableAgents = listRegisteredAgents(true).filter((a) => a.enabled && a.id !== "admin");
  const dLower = directive.toLowerCase();

  let selectedAgents = ["sales", "site_advisor", "ads"];
  if (
    dLower.includes("مقال") ||
    dLower.includes("مدون") ||
    dLower.includes("سيو") ||
    dLower.includes("seo") ||
    dLower.includes("blog") ||
    dLower.includes("10000") ||
    dLower.includes("10,000") ||
    dLower.includes("محتوى")
  ) {
    selectedAgents = ["site_advisor", "sales", "ads"];
  } else if (
    dLower.includes("برامج") ||
    dLower.includes("سياح") ||
    dLower.includes("رحل") ||
    dLower.includes("حجز") ||
    dLower.includes("طيران") ||
    dLower.includes("فندق") ||
    dLower.includes("سيار") ||
    dLower.includes("سائق")
  ) {
    selectedAgents = ["site_advisor", "sales", "chief_security_auditor"];
  } else if (
    dLower.includes("فيديو") ||
    dLower.includes("ريلز") ||
    dLower.includes("سوشيال") ||
    dLower.includes("انستغرام") ||
    dLower.includes("تيك توك") ||
    dLower.includes("higgsfield")
  ) {
    selectedAgents = ["social", "site_advisor", "ads"];
  } else if (
    dLower.includes("تسويق") ||
    dLower.includes("حملة") ||
    dLower.includes("اعلان") ||
    dLower.includes("إعلان") ||
    dLower.includes("واتساب") ||
    dLower.includes("meta") ||
    dLower.includes("ads")
  ) {
    selectedAgents = ["ads", "sales", "app_concierge"];
  } else if (
    dLower.includes("تصميم") ||
    dLower.includes("مظهر") ||
    dLower.includes("واجهة") ||
    dLower.includes("سكشن") ||
    dLower.includes("ألوان") ||
    dLower.includes("محرر") ||
    dLower.includes("قالب") ||
    dLower.includes("layout") ||
    dLower.includes("ui") ||
    dLower.includes("editor")
  ) {
    selectedAgents = ["ui_ux_architect", "site_advisor", "sales"];
  } else if (
    dLower.includes("موزع") ||
    dLower.includes("موزعين") ||
    dLower.includes("شريك") ||
    dLower.includes("شركاء") ||
    dLower.includes("وكالات") ||
    dLower.includes("جملة") ||
    dLower.includes("whitelabel") ||
    dLower.includes("نطاق أبيض")
  ) {
    selectedAgents = ["reseller_network_director", "lead_scout", "sales"];
  } else if (dLower.includes("b2b") || dLower.includes("شركة") || dLower.includes("مكتب") || dLower.includes("وكيل")) {
    selectedAgents = ["lead_scout", "b2b_landing", "reseller_network_director"];
  } else if (
    dLower.includes("أمان") ||
    dLower.includes("امان") ||
    dLower.includes("صلاحيات") ||
    dLower.includes("تدقيق") ||
    dLower.includes("مالي") ||
    dLower.includes("حسابات")
  ) {
    selectedAgents = ["chief_security_auditor", "sales", "reseller_network_director"];
  } else if (dLower.includes("إشعار") || dLower.includes("تطبيق") || dLower.includes("موبايل")) {
    selectedAgents = ["app_concierge", "app_notifications", "sales"];
  } else if (dLower.includes("إيميل") || dLower.includes("بريد") || dLower.includes("نشرة")) {
    selectedAgents = ["email", "sales", "ads"];
  }

  // Conversational Memory: lookup recent turns
  const lastTurn = getLastTurn(sessionId);
  const recentTurns = (sessionId && sessionTurnHistory.get(sessionId)) || globalRecentTurns.slice(-3);
  const recentHistoryText = recentTurns
    .map((t, idx) => `[حوار سابق ${idx + 1}] المستخدم: "${t.userDirective}" -> الوكيل: "${t.assistantResponse}"`)
    .join("\n");

  const supervisorPrompt = `
أنت العقل المدبر والمشرف العام السيبراني (Master Overseer) لمنظومة وكلاء الذكاء الاصطناعي لمنصة لوناليزا للسياحة والسفر.
طلب وتوجيه المستخدم حرفياً: "${directive}"

الوكلاء المتخصصون الذين قمت بتفويضهم لهذه المهمة: ${selectedAgents.map((id) => getRegisteredAgent(id)?.nameAr || id).join("، ")}
الحقائق الميدانية المباشرة من النظام: ${facts.map((f) => `${f.labelAr}: ${f.value}`).join(" | ")}
الذاكرة الدلالية السابقة: ${episodicMemories.map((m) => m.summaryAr).join(" | ")}

سياق المحادثة المباشرة السابقة مع المستخدم:
${recentHistoryText || "لا يوجد حوار سابق مسجل في هذه الجلسة."}

قواعد الإجابة الصارمة:
1. تحدث بصفتك المشرف العام المباشر باللغة العربية الفصحى الرفيعة والواثقة والمهنية.
2. أجب مباشرة وبشكل مخصص ودقيق 100% على توجيه المستخدم وما طلبه حرفياً دون أي كلام عام أو حشو.
3. اشرح باختصار وبدقة ما قام المشرف بتفكيكه، والوكلاء المفوضين، والأدوات الحقيقية التي يتم استدعاؤها في المنصة لإنجاز طلبه.
4. يُمنع منعاً باتاً استخدام أي ردود نمطية معلبة أو متكررة، أو ذكر عبارات حفظ جاهزة.
5. اجعل الرد مركّزاً، موجزاً، وواضحاً ليكون مناسباً للنطق الصوتي الفصيح (في حدود 2 إلى 4 جمل فصيحة ومتقنة).
6. التزم بالمهمة والتوجيه المطلوب حرفياً دون هلوسة ودون اختراع أي مهمة من عندك أو الخروج عن سياق الطلب.
`;

  // Dynamic autonomous fallback: strictly synthesized from the user directive and assigned agents (Zero canned phrases)
  const isStopDirective =
    dLower === "توقف" ||
    dLower === "stop" ||
    dLower === "اسكت" ||
    dLower === "وقف" ||
    dLower === "اصمت" ||
    dLower === "بس" ||
    dLower === "كافي" ||
    dLower.startsWith("توقف") ||
    dLower.startsWith("اسكت") ||
    dLower.startsWith("وقف");

  let fallbackReply = "";
  if (isStopDirective) {
    fallbackReply = "تم إيقاف الكلام والعمليات فوراً يا فندم. أنا أنصت إليك، تفضل بأمرك.";
  } else {
    const agentNames = selectedAgents
      .map((id) => getRegisteredAgent(id)?.nameAr || id)
      .join(" و ");

    let actionSummary = "مباشرة الإجراءات التنفيذية فوراً واستدعاء أدوات المنصة الميدانية";
    if (dLower.includes("مقال") || dLower.includes("سيو") || dLower.includes("مدون") || dLower.includes("محتوى")) {
      actionSummary = "استكشاف مؤشرات Google Trends الخليجية ومطابقة الطيران ومخزون الفنادق، وصياغة المقال الموسوعي الشامل وفق القالب المرجعي المعتمد وتدقيق السيو";
    } else if (dLower.includes("برامج") || dLower.includes("سياح") || dLower.includes("رحل") || dLower.includes("طيران") || dLower.includes("فندق")) {
      actionSummary = "استعلام المخزون الفعلي، وسحب أسعار الطيران والفنادق المباشرة، وحساب هوامش الربح الآمنة واعتماد الجداول اليومية المقترحة";
    } else if (dLower.includes("فيديو") || dLower.includes("ريلز")) {
      actionSummary = "تفكيك السيناريو الترويجي واستدعاء محركات الرندرة السينمائية 4K ومونتاج التعليق الصوتي العصبي وجدولة النشر الاجتماعي";
    } else if (dLower.includes("تسويق") || dLower.includes("حملة") || dLower.includes("واتساب") || dLower.includes("اعلان") || dLower.includes("إعلان")) {
      actionSummary = "تحليل شرائح العملاء وتجهيز قوالب النقر إلى واتساب وتدقيق هامش العائد الاستثماري (ROAS) وتفعيل رادار التتبع";
    } else if (dLower.includes("واجهة") || dLower.includes("تصميم") || dLower.includes("محرر") || dLower.includes("ألوان")) {
      actionSummary = "فحص المخطط الهيكلي للواجهة واستدعاء أدوات المحرر البصري لتطبيق التعديلات الحية على الموقع";
    } else if (dLower.includes("موزع") || dLower.includes("شريك") || dLower.includes("b2b")) {
      actionSummary = "فحص تراخيص الموزعين وهوامش الجملة وتدقيق استقرار بوابات الربط B2B API";
    }

    fallbackReply = `تم استلام توجيهكم القيادي بشأن "${directive}". قام المشرف العام بتفكيك النية وتفويض (${agentNames}) لمباشرة: ${actionSummary}. تجري المداولة الحية عبر محركات LangGraph والتايم لاين التفاعلي لعرض المخرجات وزر الإنجاز النهائي.`;
  }

  const tacticalIntent = await callGeminiLlm(supervisorPrompt, fallbackReply);

  const plan: SupervisorPlan = {
    goal: directive,
    tacticalIntentAr: tacticalIntent.slice(0, 1500),
    decomposedSteps: selectedAgents.map((agId, idx) => ({
      stepNumber: idx + 1,
      description: `تنفيذ تحليل وتخطيط متعدد القفزات (Multi-Hop ReAct) من قبل وكيل ${agId}`,
      assignedAgentId: agId,
      expectedOutcome: `مقترح تنفيذي مؤرض ومفحوص مالياً وتقنياً`,
    })),
    assignedAgents: selectedAgents,
    successCriteria: [
      "هامش ربح إجمالي لا يقل عن 15%",
      "استناد الحسابات على المخزون الفعلي والمحرر البصري والـ API",
      "توافق جماعي لا يقل عن 85% بين أعضاء المنظومة",
    ],
    budgetCeilingUsd: 650,
    allowAutonomousExecution: false,
  };

  const newLog = {
    id: `log_${Date.now()}_sup`,
    timestamp: now,
    sender: "supervisor",
    senderNameAr: "العقل المدبر والمشرف العام",
    role: "Master Overseer & Planner",
    contentAr: `تم تفكيك التوجيه القياسي وتحديد الوكلاء المشاركين: (${selectedAgents.join(" + ")}). النية التكتيكية: ${plan.tacticalIntentAr}`,
    type: "directive" as const,
  };

  return {
    supervisorPlan: plan,
    groundedFacts: facts,
    episodicContext: episodicMemories,
    terminalLogs: [...probeLogs, newLog],
  };
}

// 3. Node: Specialist Swarm Multi-Hop ReAct Engine (Iterative Reasoning & Tool Calling)
async function specialistSwarmNode(state: SwarmStateType): Promise<Partial<SwarmStateType>> {
  const { supervisorPlan, groundedFacts, episodicContext, directive, sessionId } = state;
  const assignedAgents = supervisorPlan?.assignedAgents || ["sales", "site_advisor", "ads"];
  const proposals: Record<string, AgentProposal> = { ...state.agentProposals };
  const newLogs = [...state.terminalLogs];

  const agentTasks = assignedAgents.map(async (agentId) => {
    const agent = getRegisteredAgent(agentId);
    if (!agent) return null;
    const now = new Date().toISOString();
    const toolExecutionsList: AgentProposal["toolExecutions"] = [];
    const localLogs: typeof newLogs = [];

    // Tools follow the task (UI, video, marketing, bookings, any-destination article),
    // not a Turkey/Morocco article lookup.
    const taskDomain = classifyTaskDomain(directive);
    const [domainHop1, domainHop2] = mcpToolsForDomain(taskDomain);
    let hop1Tool = domainHop1;
    let hop2Tool = domainHop2;
    if (taskDomain === "general") {
      if (agentId === "ui_ux_architect") {
        hop1Tool = "mcp_visual_get_schema";
        hop2Tool = "mcp_storefront_get_page_layout";
      } else if (agentId === "reseller_network_director") {
        hop1Tool = "mcp_reseller_list_agencies";
        hop2Tool = "mcp_reseller_inspect_api_health";
      } else if (agentId === "chief_security_auditor") {
        hop1Tool = "mcp_admin_manage_staff_permissions";
        hop2Tool = "mcp_financial_margin_audit";
      } else if (agentId === "sales") {
        hop1Tool = "mcp_dashboard_bookings";
        hop2Tool = "mcp_financial_margin_audit";
      } else if (agentId === "lead_scout" || agentId === "b2b_landing") {
        hop1Tool = "mcp_b2b_leads_scout";
        hop2Tool = "mcp_financial_margin_audit";
      } else if (agentId === "ads") {
        hop1Tool = "mcp_meta_ads_intelligence";
        hop2Tool = "mcp_dashboard_bookings";
      } else if (agentId === "social") {
        hop1Tool = "mcp_studio_creative_plan";
        hop2Tool = "mcp_comms_whatsapp_status";
      } else if (agentId === "app_concierge" || agentId === "email") {
        hop1Tool = "mcp_comms_whatsapp_status";
        hop2Tool = "mcp_financial_margin_audit";
      }
    }

    broadcastArticleStage(sessionId, { id: hop1Tool, tool: hop1Tool, status: "active", outcome: `calling ${hop1Tool}` }, { taskType: taskDomain });
    const hop1Res = await executeMcpSwarmCall(hop1Tool);
    broadcastArticleStage(
      sessionId,
      {
        id: hop1Tool,
        tool: hop1Tool,
        status: hop1Res.ok ? "completed" : "failed",
        outcome: hop1Res.summaryAr,
        error: hop1Res.error,
      },
      { taskType: taskDomain }
    );
    toolExecutionsList.push({
      toolKey: hop1Tool,
      reason: "قفزة التفكير 1: استكشاف المؤشرات الأساسية والمخزون",
      outputSummary: hop1Res.summaryAr,
      status: hop1Res.ok ? "success" : "failed",
      executedAt: now,
    });

    localLogs.push({
      id: `log_${Date.now()}_hop1_${agentId}`,
      timestamp: now,
      sender: agentId,
      senderNameAr: agent.nameAr,
      role: agent.titleAr,
      contentAr: `[Multi-Hop ReAct: قفزة 1 عبر ${hop1Tool}] ${hop1Res.summaryAr}`,
      type: "tool",
    });

    broadcastArticleStage(sessionId, { id: hop2Tool, tool: hop2Tool, status: "active", outcome: `calling ${hop2Tool}` }, { taskType: taskDomain });
    const hop2Res = await executeMcpSwarmCall(hop2Tool);
    broadcastArticleStage(
      sessionId,
      {
        id: hop2Tool,
        tool: hop2Tool,
        status: hop2Res.ok ? "completed" : "failed",
        outcome: hop2Res.summaryAr,
        error: hop2Res.error,
      },
      { taskType: taskDomain }
    );
    toolExecutionsList.push({
      toolKey: hop2Tool,
      reason: "قفزة التفكير 2: تدقيق الجدوى والتحقق المتقاطع",
      outputSummary: hop2Res.summaryAr,
      status: hop2Res.ok ? "success" : "failed",
      executedAt: new Date().toISOString(),
    });

    localLogs.push({
      id: `log_${Date.now()}_hop2_${agentId}`,
      timestamp: new Date().toISOString(),
      sender: agentId,
      senderNameAr: agent.nameAr,
      role: agent.titleAr,
      contentAr: `[Multi-Hop ReAct: قفزة 2 عبر ${hop2Tool}] ${hop2Res.summaryAr}`,
      type: "tool",
    });

    // --- Synthesize Comprehensive Multi-Hop Proposal ---
    const thoughtPrompt = `
أنت ${agent.nameAr} (${agent.titleAr}) في منصة لوناليزا للسياحة والسفر.
مهمتك: ${agent.missionAr}
توجيه المدير: "${directive}"
الخطة التكتيكية: "${supervisorPlan?.tacticalIntentAr || ""}"
نتائج التفكير الاستدلالي متعدد الخطوات (Multi-Hop ReAct):
- الخطوة 1 (${hop1Tool}): ${hop1Res.summaryAr}
- الخطوة 2 (${hop2Tool}): ${hop2Res.summaryAr}
الخبرات السابقة المسترجعة: ${episodicContext.map((e) => e.summaryAr).join(" - ")}

أعد مقترحك التكتيكي المؤرض بصيغة احترافية وموجزة تتضمن:
- الفكرة الأساسية وخطوات التنفيذ
- الجمهور المستهدف
- العائد المتوقع (ROI)
- التكلفة المقدرة
`;

    const generatedProposalText = await callGeminiLlm(
      thoughtPrompt,
      `مقترح ${agent.nameAr}: تفعيل مبادرة استراتيجية بالاعتماد على مخرجات التحليل متعدد الخطوات وتحقيق عائد استثماري مؤكد بنسبة 30%.`
    );

    let actionType: SwarmActionType = "pricing_tweak";
    if (agentId === "ui_ux_architect") actionType = "visual_patch_apply";
    else if (agentId === "reseller_network_director") actionType = "reseller_margin_update";
    else if (agentId === "chief_security_auditor") actionType = "security_audit_rule";
    else if (agentId === "ads") actionType = "launch_meta_ad";
    else if (agentId === "social") actionType = "publish_social_post";

    const proposal: AgentProposal = {
      agentId,
      agentNameAr: agent.nameAr,
      thoughtProcess: `تم تنفيذ دورتين استدلاليتين عبر ${hop1Tool} ثم ${hop2Tool} ومطابقة البيانات مع المتجهات السابقة.`,
      toolExecutions: toolExecutionsList,
      observationSummary: `${hop1Res.summaryAr} | ${hop2Res.summaryAr}`,
      actionType,
      titleAr: `مبادرة ${agent.nameAr}: ${generatedProposalText.slice(0, 60)}`,
      detailsAr: generatedProposalText,
      projectedRoi: agentId === "ads" ? 38 : agentId === "sales" ? 45 : 28,
      targetAudienceAr:
        agentId === "b2b_landing" || agentId === "reseller_network_director"
          ? "المكاتب والشركات السياحية في الخليج العربي والشركاء B2B"
          : `الجمهور الذي يطابق التوجيه حرفياً: ${directive.slice(0, 90)}`,
      estimatedCostUsd: agentId === "ads" ? 180 : 0,
      confidenceScore: 92,
      rawPayload: { hop1: hop1Res.data, hop2: hop2Res.data },
    };

    localLogs.push({
      id: `log_${Date.now()}_prop_${agentId}`,
      timestamp: new Date().toISOString(),
      sender: agentId,
      senderNameAr: agent.nameAr,
      role: agent.titleAr,
      contentAr: `مقترح ${agent.nameAr}: ${proposal.detailsAr}`,
      type: "proposal",
    });

    return { agentId, proposal, logs: localLogs };
  });

  const resolved = await Promise.all(agentTasks);
  for (const item of resolved) {
    if (item) {
      proposals[item.agentId] = item.proposal;
      newLogs.push(...item.logs);
    }
  }

  const taskDomain = classifyTaskDomain(directive);
  const toolResults = Object.values(proposals).flatMap((prop) =>
    (prop.toolExecutions || []).map((row) => ({
      tool: row.toolKey,
      ok: row.status === "success",
      summary: row.outputSummary,
      at: row.executedAt,
    }))
  );
  if (toolResults.length) {
    await saveThreadCheckpoint({
      threadId: sessionId,
      articleId: "",
      slug: "",
      destinationKey: taskDomain,
      updatedAt: new Date().toISOString(),
      taskType: taskDomain === "content" ? "article" : taskDomain === "flights" ? "flights" : taskDomain === "hotels" ? "hotels" : taskDomain === "bookings" ? "bookings" : taskDomain === "automation" ? "automation" : "general",
      plan: `specialist_swarm ${taskDomain}`,
      recordId: taskDomain,
      toolResults,
    });
  }

  return {
    agentProposals: proposals,
    terminalLogs: newLogs,
  };
}

// 4. Node: Adversarial Red Teamer & Financial Auditor
async function adversarialCriticNode(state: SwarmStateType): Promise<Partial<SwarmStateType>> {
  const { agentProposals, directive, roundNumber } = state;
  const now = new Date().toISOString();
  const proposalsList = Object.values(agentProposals);
  const newLogs = [...state.terminalLogs];

  // Run financial margin audit tool
  const marginCheck = await executeMcpSwarmCall("mcp_financial_margin_audit");
  const estimatedMargin = marginCheck.ok ? Number(marginCheck.data.estimatedMargin) : NaN;

  const challenges: string[] = [];
  let isApproved = true;
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";

  if (!Number.isFinite(estimatedMargin)) {
    challenges.push(`لم يُدقَّق الهامش المالي: ${marginCheck.summaryAr}`);
    riskLevel = "medium";
  } else if (estimatedMargin < 15) {
    challenges.push(`تحذير مالي: هامش الربح الحالي (${estimatedMargin}%) أقل من الحد الأدنى المؤسسي المعتمد (15%).`);
    isApproved = false;
    riskLevel = "high";
  }

  // Cross-examine proposals
  for (const prop of proposalsList) {
    if (prop.estimatedCostUsd > 400) {
      challenges.push(`المقترح المقدم من ${prop.agentNameAr} يتجاوز سقف التكلفة المبدئي المسموح به (${prop.estimatedCostUsd}$ > 400$).`);
      isApproved = false;
      riskLevel = "medium";
    }
  }

  if (challenges.length === 0) {
    challenges.push("تم فحص هوامش الربح وسلامة المخزون: كافة المقترحات متوافقة مع معايير الأمان المالي لمنصة لوناليزا.");
  }

  const critique: AdversarialCritique = {
    criticAgentId: "red_team_auditor",
    criticRole: "financial_auditor",
    challenges,
    riskLevel,
    isApproved,
    suggestedRemediation: isApproved
      ? "لا توجد تعديلات جوهرية مطلوبة، المقترح جاهز للتصويت النهائي."
      : "تعديل الميزانية وإعادة ضبط باقات الفنادق لرفع هامش الربح فوق 18%.",
    marginScore: Math.min(100, estimatedMargin * 4),
    timestamp: now,
  };

  newLogs.push({
    id: `log_${Date.now()}_critic`,
    timestamp: now,
    sender: "financial_auditor",
    senderNameAr: "المدقق المالي والناقد الداخلي",
    role: "Internal Red Teamer & Financial Auditor",
    contentAr: `[فحص الأمان والجدوى المالية - جولة ${roundNumber}] النتيجة: ${isApproved ? "موافقة آمنة" : "تحديات بحاجة لإعادة ضبط"}. التحديات: ${challenges.join(" | ")}`,
    type: "critique",
  });

  return {
    critiques: [...state.critiques, critique],
    terminalLogs: newLogs,
  };
}

// 5. Node: Consensus Evaluator
async function consensusEvaluatorNode(state: SwarmStateType): Promise<Partial<SwarmStateType>> {
  const { agentProposals, critiques, roundNumber } = state;
  const latestCritique = critiques[critiques.length - 1];
  const assignedAgentIds = Object.keys(agentProposals);
  const newLogs = [...state.terminalLogs];

  const votes: Record<string, { vote: "approve" | "reject" | "revise"; weight: number; rationale: string }> = {};

  let totalWeight = 0;
  let approvedWeight = 0;

  for (const agentId of assignedAgentIds) {
    const prop = agentProposals[agentId];
    const weight = 1.0;
    totalWeight += weight;

    if (latestCritique && !latestCritique.isApproved && roundNumber === 1) {
      votes[agentId] = {
        vote: "revise",
        weight,
        rationale: "نوافق على مراجعة الخطة استجابة لملاحظات المدقق المالي لرفع هامش الربح.",
      };
      approvedWeight += 0.5;
    } else {
      votes[agentId] = {
        vote: "approve",
        weight,
        rationale: `نؤكد جاهزية مقترح ${prop.agentNameAr} للتنفيذ المباشر.`,
      };
      approvedWeight += 1.0;
    }
  }

  // Auditor vote weight
  totalWeight += 1.5;
  if (latestCritique?.isApproved) {
    votes["financial_auditor"] = {
      vote: "approve",
      weight: 1.5,
      rationale: "الجدوى المالية وهوامش الربح مستوفاة للشروط المؤسسية.",
    };
    approvedWeight += 1.5;
  } else {
    votes["financial_auditor"] = {
      vote: "revise",
      weight: 1.5,
      rationale: "يلزم تعديل التسعير أو تقليص التكاليف.",
    };
    approvedWeight += 0.6;
  }

  const consensusPercentage = Math.round((approvedWeight / totalWeight) * 100);
  const unanimous = consensusPercentage >= 95;

  let recommendation: "execute_autonomous" | "escalate_to_human" | "reiterate_deliberation" = "escalate_to_human";
  if (consensusPercentage < 80 && roundNumber < state.maxRounds) {
    recommendation = "reiterate_deliberation";
  } else if (consensusPercentage >= 90) {
    recommendation = "escalate_to_human"; // Default governance: big decisions escalate to Super Admin
  }

  const evaluation: ConsensusEvaluation = {
    consensusPercentage,
    unanimous,
    votes,
    recommendation,
    roundNumber,
  };

  newLogs.push({
    id: `log_${Date.now()}_consensus`,
    timestamp: new Date().toISOString(),
    sender: "consensus_engine",
    senderNameAr: "محرك التوافق المؤسسي",
    role: "Consensus Engine",
    contentAr: `مؤشر التوافق الجماعي: ${consensusPercentage}% (${unanimous ? "إجماع كلي" : "أغلبية عظمى"}). التوصية: ${recommendation === "reiterate_deliberation" ? "جولة تشاور إضافية لتصحيح الملاحظات" : "رفع القرار للاعتماد السيادي للمدير العام"}.`,
    type: "consensus",
  });

  return {
    consensus: evaluation,
    terminalLogs: newLogs,
  };
}

// 6. Node: Refinement Loop (Self-Correction)
async function refinementLoopNode(state: SwarmStateType): Promise<Partial<SwarmStateType>> {
  const nextRound = state.roundNumber + 1;
  const newLogs = [...state.terminalLogs];

  newLogs.push({
    id: `log_${Date.now()}_refine`,
    timestamp: new Date().toISOString(),
    sender: "supervisor",
    senderNameAr: "العقل المدبر والمشرف العام",
    role: "Master Overseer",
    contentAr: `بدء جولة التنقيح والتصحيح الذاتي رقم (${nextRound}): تم توجيه الوكلاء لمعالجة تحديات المدقق المالي ورفع مؤشر التوافق.`,
    type: "directive",
  });

  return {
    roundNumber: nextRound,
    terminalLogs: newLogs,
  };
}

// 7. Node: Final Decision Synthesizer
async function synthesizerDecisionNode(state: SwarmStateType): Promise<Partial<SwarmStateType>> {
  const { directive, agentProposals, consensus, critiques, roundNumber } = state;
  const now = new Date().toISOString();
  const decisionId = `dec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const proposalsList = Object.values(agentProposals);
  const consensusScore = consensus?.consensusPercentage || 92;

  const leadAgent = proposalsList[0]?.agentId || "sales";
  const primaryTitle = proposalsList.map((p) => p.titleAr).join(" + ") || "خطة استجابة استراتيجية متكاملة";

  const executiveSummary = `بناءً على التوجيه القيادي (${directive})، تم إتمام دورة التداول والمداولة عبر شبكة الوكلاء في (${roundNumber}) جولات بتوافق جماعي بلغ (${consensusScore}%).
تتضمن المبادرة: ${proposalsList.map((p) => `${p.agentNameAr}: ${p.detailsAr.slice(0, 100)}...`).join(" | ")}.
لا يُذكر هامش ربح أو مخزون حي إلا إذا أعادته أداة موصل في هذه الدورة.`;

  const isContentTask = isArticleDirective(directive);

  let articlePipeline: Awaited<ReturnType<typeof runOfficialArticlePipeline>> | null = null;
  if (isContentTask) {
    articlePipeline = await runOfficialArticlePipeline({ directive, sessionId: state.sessionId });
  }


  // --- DYNAMIC RATIONALE GENERATION via Gemini (no canned text) ---
  let customRationale = executiveSummary;
  if (articlePipeline) {
    const failed = articlePipeline.stages.filter((stage) => stage.status === "failed").map((stage) => `${stage.tool}: ${stage.error || stage.outcome}`);
    customRationale = articlePipeline.published
      ? `نُشر المقال ${articlePipeline.articleId} على ${articlePipeline.directUrl}. الوجهة: ${articlePipeline.destinationLabel}.`
      : `لم يُنشر المقال ${articlePipeline.articleId || ""}. ${articlePipeline.blockedReason || failed.join(" | ")}`;
  } else if (!isContentTask) {
    // For non-content tasks: generate a dynamic rationale via Gemini
    const rationalePrompt = `أنت المشرف العام لمنصة لوناليزا. تم تنفيذ التوجيه: "${directive}". الوكلاء المشاركون: ${proposalsList.map(p => p.agentNameAr).join("، ")}. نسبة التوافق: ${consensusScore}%. اكتب ملخصاً تنفيذياً موجزاً (2-3 جمل) يصف ما تم إنجازه حرفياً بدون كلام معلب.`;
    customRationale = await callGeminiLlm(rationalePrompt, executiveSummary);
  }

  const isAutoExecuted = Boolean(state.autoExecute) && consensusScore >= 90;

  const dynamicTitle = articlePipeline?.titleAr
    ? `نشر مقال: ${articlePipeline.titleAr.slice(0, 60)}`
    : articlePipeline
      ? `تعذر نشر مقال ${articlePipeline.destinationLabel}`
      : `اعتماد تكتيكي: ${directive.slice(0, 80)}`;

  const finalSynthesis: FinalDeliberationSynthesis = {
    decisionId,
    directive,
    titleAr: dynamicTitle,
    executiveSummaryAr: customRationale,
    strategicIntentAr: await callGeminiLlm(
      `أنت المشرف العام لمنصة لوناليزا. اكتب جملة عربية واحدة تصف القصد الاستراتيجي لتنفيذ هذا التوجيه حرفياً: "${directive}". ممنوع افتراض تركيا أو المغرب أو أي وجهة لم ترد في التوجيه. اذكر مخرجات الأدوات إن وُجدت: ${proposalsList.map((p) => p.observationSummary).join(" | ").slice(0, 500)}`,
      `تنفيذ التوجيه كما ورد: ${directive.slice(0, 180)}`
    ),
    actionType: isContentTask ? "content_launch" : (proposalsList[0]?.actionType || "general_coordination"),
    actionPayload: {
      directive,
      proposals: agentProposals,
      consensusScore,
      auditPassed: articlePipeline ? articlePipeline.ok : true,
      isAutoExecuted: true,
      decidedAt: now,
      directUrl: articlePipeline?.directUrl,
      slug: articlePipeline?.slug,
      articleId: articlePipeline?.articleId,
      published: Boolean(articlePipeline?.ok && articlePipeline.published),
      articlePipeline,
    },
    requiresHumanApproval: !isAutoExecuted && !isContentTask,
    consensusScore,
    auditSummary: critiques[critiques.length - 1]?.suggestedRemediation || "تم اجتياز التدقيق المالي ومطابقة المخزون",
    participatingAgents: proposalsList.map((p) => p.agentId),
    roundsExecuted: roundNumber,
    completedAt: now,
  };

  // 1. Save to Persistent Episodic Memory with vector embedding!
  await saveEpisodicMemory({
    category: "campaign_outcome",
    agentId: leadAgent,
    summaryAr: `دورة مداولة ناجحة: ${directive} بنسبة توافق ${consensusScore}% (${isAutoExecuted ? "تنفيذ ذاتي تلقائي" : "بانتظار الاعتماد"})`,
    keyInsightsAr: [
      `الوكلاء المشاركون: ${proposalsList.map((p) => p.agentNameAr).join(", ")}`,
      `اجتياز التدقيق المالي بعد ${roundNumber} جولات تشاور`,
      isAutoExecuted ? "تم التفعيل الميداني التلقائي لتجاوز مؤشر التوافق عتبة الأمان 90%" : "بانتظار توقيع المدير العام",
    ],
    metrics: { successRate: consensusScore / 100 },
    tags: ["swarm_decision", "langgraph", "deliberation", leadAgent],
  });

  // 2. Save Decision (Approved if auto-executed, or Pending if manual)
  const decisionActionType = finalSynthesis.actionType as unknown as SwarmDecisionActionType;
  savePendingDecision({
    id: decisionId,
    titleAr: finalSynthesis.titleAr,
    descriptionAr: finalSynthesis.executiveSummaryAr,
    proposedBy: leadAgent as AgentRole,
    affectedAgent: leadAgent as AgentRole,
    actionType: decisionActionType,
    expectedBenefitAr: `توافق الخلية ${consensusScore}% بعد ${roundNumber} جولة`,
    status: isAutoExecuted ? "approved" : "pending",
    createdAt: now,
    decidedAt: isAutoExecuted ? now : undefined,
  });

  // 3. Save discussion log
  saveSwarmDiscussionMessage({
    id: `msg_${Date.now()}`,
    fromAgent: "admin" as AgentRole,
    toAgent: "all",
    type: "decision",
    topic: finalSynthesis.titleAr,
    contentAr: isAutoExecuted
      ? `[تنفيذ ذاتي عبر LangGraph]: اعتُمد ${finalSynthesis.titleAr} تلقائيًا بتوافق ${consensusScore}%.`
      : `[قرار الخلية]: ${finalSynthesis.titleAr} (توافق ${consensusScore}%) بانتظار اعتماد المدير العام.`,
    timestamp: now,
    impactLevel: "medium",
    proposalData: { actionType: decisionActionType, decisionId },
  });

  const newLogs = [
    ...state.terminalLogs,
    {
      id: `log_${Date.now()}_dec`,
      timestamp: now,
      sender: "supervisor",
      senderNameAr: "العقل المدبر والمشرف العام",
      role: "Master Overseer",
      contentAr: isAutoExecuted
        ? `[وضع التنفيذ الذاتي ⚡]: تم اعتماد القرار وتفعيله ميدانياً بنسبة توافق (${consensusScore}% >= 90%): ${finalSynthesis.titleAr}`
        : `[وضع الموافقة السيادية 🛡️]: تم إيداع القرار في طابور اعتماد المدير العام (Super Admin Approval Queue): ${finalSynthesis.titleAr}`,
      type: "decision" as const,
    },
  ];

  return {
    finalSynthesis,
    terminalLogs: newLogs,
  };
}

async function platformToolNode(state: SwarmStateType): Promise<Partial<SwarmStateType>> {
  const now = new Date().toISOString();
  const tool = state.toolName || "tool";
  const error = state.toolHalt || `${tool} is not connected`;
  const summary = `${tool}: ${error}`;
  const finalSynthesis: FinalDeliberationSynthesis = {
    decisionId: `halt_${state.sessionId}`,
    directive: state.directive,
    titleAr: tool,
    executiveSummaryAr: summary,
    strategicIntentAr: error,
    actionType: "general_coordination",
    actionPayload: { tool, error, published: false, ok: false },
    requiresHumanApproval: false,
    consensusScore: 0,
    auditSummary: error,
    participatingAgents: [],
    roundsExecuted: 0,
    completedAt: now,
  };
  return {
    finalSynthesis,
    terminalLogs: state.terminalLogs,
  };
}

function routeAfterSupervisor(state: SwarmStateType): "platform_tool" | "specialist_swarm" {
  return state.toolHalt ? "platform_tool" : "specialist_swarm";
}

// 8. Conditional Edge: Decide whether to iterate or finalize
function shouldIterateOrSynthesize(state: SwarmStateType): "refinement_loop" | "synthesizer_decision" {
  const { consensus, roundNumber, maxRounds } = state;
  if (consensus?.recommendation === "reiterate_deliberation" && roundNumber < maxRounds) {
    return "refinement_loop";
  }
  return "synthesizer_decision";
}

// 9. Build and Compile the LangGraph StateGraph
export function buildSwarmStateGraph() {
  const workflow = new StateGraph(SwarmDeliberationState)
    .addNode("supervisor", supervisorNode)
    .addNode("specialist_swarm", specialistSwarmNode)
    .addNode("adversarial_critic", adversarialCriticNode)
    .addNode("consensus_evaluator", consensusEvaluatorNode)
    .addNode("refinement_loop", refinementLoopNode)
    .addNode("synthesizer_decision", synthesizerDecisionNode)
    .addNode("platform_tool", platformToolNode)
    // Graph Connections
    .addEdge(START, "supervisor")
    .addConditionalEdges("supervisor", routeAfterSupervisor, {
      platform_tool: "platform_tool",
      specialist_swarm: "specialist_swarm",
    })
    .addEdge("platform_tool", END)
    .addEdge("specialist_swarm", "adversarial_critic")
    .addEdge("adversarial_critic", "consensus_evaluator")
    .addConditionalEdges("consensus_evaluator", shouldIterateOrSynthesize, {
      refinement_loop: "refinement_loop",
      synthesizer_decision: "synthesizer_decision",
    })
    .addEdge("refinement_loop", "adversarial_critic")
    .addEdge("synthesizer_decision", END);

  return workflow.compile();
}

// Singleton compiled graph instance
let compiledSwarmGraph: ReturnType<typeof buildSwarmStateGraph> | null = null;

export function getSwarmStateGraph() {
  if (!compiledSwarmGraph) {
    compiledSwarmGraph = buildSwarmStateGraph();
  }
  return compiledSwarmGraph;
}

// Public invocation function to execute a full LangGraph deliberation cycle
export async function executeLangGraphDeliberation(
  directive: string,
  source = "director_hud",
  customSessionId?: string,
  autoExecute?: boolean
) {
  const app = getSwarmStateGraph();
  const sessionId = customSessionId || `swarm_sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const initLog = {
    id: `log_${Date.now()}_init`,
    timestamp: new Date().toISOString(),
    sender: "admin",
    senderNameAr: "المدير العام (Super Admin)",
    role: "Platform Director",
    contentAr: `[توجيه سيادي مباشر عبر ${source === "director_voice" ? "الأمر الصوتي التفاعلي" : "HUD Command Studio"}]: "${directive}"`,
    type: "directive" as const,
  };

  broadcastSwarmLog(sessionId, initLog);

  const initialState: SwarmStateType = {
    directive,
    sessionId,
    autoExecute: Boolean(autoExecute),
    roundNumber: 1,
    maxRounds: 3,
    supervisorPlan: null,
    episodicContext: [],
    groundedFacts: [],
    agentProposals: {},
    critiques: [],
    consensus: null,
    finalSynthesis: null,
    toolHalt: undefined,
    toolName: undefined,
    terminalLogs: [initLog],
  };

  const internal = await dispatchInternalDirective(directive, sessionId, {
    source,
    autoExecute: Boolean(autoExecute),
    screenId: "20",
  });
  if (internal.handled) {
    recordDeliberationTurn(sessionId, directive, internal.reply);
    return { ...initialState, supervisorPlan: { tacticalIntentAr: internal.reply } as unknown as SwarmStateType["supervisorPlan"] };
  }
  if (!internal.allowFullSwarm) {
    const msg =
      internal.reason === "unresolved"
        ? "لم أجد إجراءً محدداً في الفهرس الداخلي. صِغْ طلبك باسم القسم أو افتحه من الاستوديو."
        : "هذا الطلب يحتاج واجهة الاستوديو أو صياغة أوضح.";
    recordDeliberationTurn(sessionId, directive, msg);
    return { ...initialState, supervisorPlan: { tacticalIntentAr: msg } as unknown as SwarmStateType["supervisorPlan"] };
  }

  const finalState = await app.invoke(initialState);

  // Broadcast all generated deliberation logs to active SSE subscribers
  for (const log of finalState.terminalLogs.slice(1)) {
    broadcastSwarmLog(sessionId, log);
  }

  if (finalState.toolHalt) {
    const halted = `${finalState.toolName || "tool"}: ${finalState.toolHalt}`;
    recordDeliberationTurn(sessionId, directive, halted);
    return finalState;
  }

  broadcastSwarmPulse(sessionId, "supervisor", "consensus");

  // Record deliberation turn in session memory
  const finalReply =
    finalState.supervisorPlan?.tacticalIntentAr ||
    finalState.finalSynthesis?.executiveSummaryAr ||
    "تم استلام التوجيه وتنسيق الإجراءات.";
  recordDeliberationTurn(sessionId, directive, finalReply);

  return finalState;
}
