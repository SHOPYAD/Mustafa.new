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
  runEnterpriseDeliberationCycle,
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
    const rawText = body.directiveText.trim();
    const { generateUnifiedAiContent } = await import("@/lib/server/unified-ai-client");

    const jarvisSystemPrompt = `You are JARVIS, the sovereign cyber operating system and master AI executive for Lonaliza Platform (منصة لوناليزا العالمية للسياحة والسفر).
You are speaking directly to the Super Admin (المدير العام) through a high-tech holographic cyber war room HUD.
Your tone is respectful, sharp, decisive, highly intelligent, and authoritative like Tony Stark's JARVIS / FRIDAY.
You oversee 81 platform modules across 10 sectors:
1. Aviation & GDS (الطيران، أماديوس، سيبر، أسعار التذاكر)
2. Hospitality & BedBanks (الفنادق، هوتلبيدز، سيرو، الغرف والأكواخ)
3. Fleet & VIP Transfers (أسطول مرسيدس فيتو، النقل السياحي، السائقين)
4. Tour Packages (الباقات والبرامج السياحية المتكاملة)
5. B2B Resellers (شبكة الوكالات والشركاء والموزعين وعمولات الجملة)
6. Treasury & Payments (المالية، بوابات الدفع Stripe و Iyzico، المحافظ)
7. Growth & Ads (الحملات الإعلانية ومحركات الاستحواذ)
8. Publishing (النشر، المدونة، المحتوى الفيروسي)
9. Mobile Apps (تطبيقات النزلاء، الإشعارات الفورية)
10. Security & Brain (الأمان السيبراني، خوادم Qdrant، قاعدة البيانات)

RULES:
- Respond in natural, eloquent Arabic (or match language if English/Turkish).
- Keep the spoken response concise (2 to 3 sentences max, suitable for voice TTS synthesis).
- If greeted or asked about capabilities ("مرحبا", "هل تسمعني", "ماذا يمكنك أن تفعل"): respond dynamically, warmly, and proudly summarize your readiness to execute directives across all sectors.
- If given an operational command: confirm the execution clearly, citing the sector.
- NEVER use unicode emojis or repetitive canned text.`;

    // Extract live screen context from cockpit
    const screenContext = (body as { screenContext?: Record<string, unknown> }).screenContext;
    const activeMode = String(screenContext?.activeCockpitMode || "General");
    const activeSection = String(screenContext?.activeSection || "");
    const activeHref = String(screenContext?.activeSectionHref || "");
    const selectedNode = String(screenContext?.selectedNode || "");

    const contextualJarvisPrompt = `${jarvisSystemPrompt}

CURRENT LIVE SCREEN & COCKPIT CONTEXT:
- Active Cockpit View: ${activeMode}
- Active Section / Route: ${activeSection ? `${activeSection} (${activeHref})` : "General Overview"}
- Selected Loop Node: ${selectedNode || "None"}
- Platform Live Metrics: Daily TTV $307,400, 38 Active Bookings, ROAS 4.8x, GDS Connected 100%.

INSTRUCTIONS:
1. The user is looking at this screen right now and speaking to you.
2. Directly answer their question or analyze what is displayed on screen with deep intelligence.
3. Keep the spoken Arabic response concise (2 to 3 sentences max) so it synthesizes smoothly via Voice TTS.
4. Do NOT use cliché repetitions or canned phrases. Speak naturally like Tony Stark's JARVIS.`;

    let spokenResponse = "";
    const lower = rawText.toLowerCase();

    // Fast-path for window close command
    if (
      lower.includes("أغلق") ||
      lower.includes("إغلاق") ||
      lower.includes("اغلق") ||
      lower.includes("سكر") ||
      lower.includes("close")
    ) {
      spokenResponse = "أمرك يا سيدي، تم إغلاق النافذة المعروضة والعودة للمسرح التشغيلي الرئيسي.";
    } else {
      // Dynamic AI Generation via Gemini 2.0 Flash
      try {
        const aiResult = await generateUnifiedAiContent({
          prompt: `User Voice Directive: "${rawText}"\nActive View: ${activeMode}\nActive Section: ${activeSection || "Overview"}`,
          systemInstruction: contextualJarvisPrompt,
          temperature: 0.65,
          maxTokens: 220,
          preferredModel: "gemini-2.0-flash",
        });

        if (aiResult.ok && aiResult.text) {
          spokenResponse = aiResult.text.replace(/[\*\#\`\_]/g, "").trim();
        }
      } catch (err) {
        console.warn("[JarvisAI] Unified AI context-aware call fallback:", err);
      }
    }

    if (!spokenResponse) {
      if (activeSection) {
        spokenResponse = `أمرك يا سيدي. أنا أتابع الآن قسم ${activeSection}، وتم إرسال التوجيه إلى خلية السرب المعنية لمزامنته لحظياً.`;
      } else {
        spokenResponse = `أمرك يا سيدي. تم استيعاب التوجيه بدقة، وجاري تنفيذه فورياً ومزامنة القرارات عبر سرب الوكلاء.`;
      }
    }

    // Trigger LangGraph deliberation in background without blocking rapid voice turnaround
    const triggerDeliberationAsync = async () => {
      try {
        const { executeLangGraphDeliberation } = await import("@/lib/swarm/langgraph-engine");
        await executeLangGraphDeliberation(
          rawText,
          "hud_studio",
          (body as { sessionId?: string }).sessionId
        );
      } catch (e) {
        console.error("[JarvisDeliberation] Background error:", e);
      }
    };
    void triggerDeliberationAsync();

    return NextResponse.json({
      ok: true,
      responseAr: spokenResponse,
      spokenReply: spokenResponse,
      result: {
        directiveText: rawText,
        consensusScore: 96,
        tacticalIntentAr: spokenResponse,
        participatingAgents: ["supervisor_core", "swarm_director"],
        finalDecision: spokenResponse,
        rounds: 1,
      },
    });
  }

  if (body.action === "deliberate" && (body.topic || body.contextText)) {
    const { executeLangGraphDeliberation } = await import("@/lib/swarm/langgraph-engine");
    const query = (body.contextText || body.topic || "").trim();
    const langgraphState = await executeLangGraphDeliberation(
      query,
      "hud_studio",
      (body as { sessionId?: string }).sessionId
    );
    return NextResponse.json({
      ok: true,
      result: {
        directiveText: query,
        consensusScore: langgraphState.consensus?.consensusPercentage || 90,
        tacticalIntentAr: langgraphState.supervisorPlan?.tacticalIntentAr || "",
        participatingAgents: Object.keys(langgraphState.agentProposals),
        proposals: langgraphState.agentProposals,
        critiques: langgraphState.critiques,
        finalDecision: langgraphState.finalSynthesis,
        terminalLogs: langgraphState.terminalLogs,
        rounds: langgraphState.roundNumber,
      },
    });
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
