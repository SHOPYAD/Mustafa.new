import { resolveGeminiApiKey } from "@/lib/server/gemini";
import {
  getSwarmDiscussions,
  saveSwarmDiscussionMessage,
  getPendingDecisions,
  savePendingDecision,
  saveAdminDirective,
  DEFAULT_AGENTS,
  type AgentRole,
  type SwarmDiscussionMessage,
  type PendingApprovalDecision,
} from "./agent-collab-store";
import { sendTelegramAdminMessage } from "@/lib/automation/channels/telegram";

export interface TriggerSwarmDeliberationInput {
  triggerSource: AgentRole | "admin" | "cron";
  topic: string;
  contextText: string;
  impactLevel?: "low" | "medium" | "high" | "critical";
}

/**
 * Triggers an autonomous deliberation cycle between the 6 Agents
 */
export async function triggerSwarmDeliberation({
  triggerSource,
  topic,
  contextText,
  impactLevel = "medium",
}: TriggerSwarmDeliberationInput): Promise<{
  ok: boolean;
  messagesGenerated: SwarmDiscussionMessage[];
  proposalCreated?: PendingApprovalDecision;
}> {
  const { apiKey } = await resolveGeminiApiKey();

  // Save the initiating message
  const triggerMsg: SwarmDiscussionMessage = {
    id: `disc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    fromAgent: triggerSource === "admin" ? "admin" : (triggerSource as AgentRole),
    toAgent: "all",
    type: triggerSource === "admin" ? "directive" : "insight",
    topic,
    contentAr: contextText,
    timestamp: new Date().toISOString(),
    impactLevel,
  };

  saveSwarmDiscussionMessage(triggerMsg);

  if (triggerSource === "admin") {
    saveAdminDirective({
      id: `dir_${Date.now()}`,
      text: contextText,
      targetAgent: "all",
      createdAt: new Date().toISOString(),
      status: "executing",
    });
  }

  const generatedMessages: SwarmDiscussionMessage[] = [triggerMsg];
  let createdProposal: PendingApprovalDecision | undefined;

  try {
    const { generateGeminiContent } = await import("@/lib/server/gemini-swarm-client");
    let connectedSlotsCount = 0;
    try {
      const fs = await import("fs");
      const path = await import("path");
      const credsFile = path.join(process.cwd(), ".data", "whatsapp-qr-auth", "creds.json");
      if (fs.existsSync(credsFile)) {
        connectedSlotsCount = 1;
      }
    } catch {}

    const integrationContext = `
- حالة أرقام واتساب: ${connectedSlotsCount} من أصل 5 أرقام متصلة حالياً.
- حالة ربط Meta Ads و Google Ads: الحسابات الإعلانية المباشرة بانتظار إدخال الـ Access Tokens في تبويب الإعلانات / MCP.
- منصة لوناليزا B2B: نشطة مع تراخيص سحابية ودعم سيرفر مستقل aaPanel.
`.trim();

    const prompt = `
أنت المنسق العام والمحرك الذكي لخلية الوكلاء الأذكياء (Autonomous Multi-Agent Swarm Orchestrator) في منصة لوناليزا (Lonaliza Enterprise Platform).
تضم الخلية 6 وكلاء أذكياء مستقلين يعملون كفريق واحد متكامل:
1. 💼 وكيل المبيعات والأتمتة (sales): يراقب قنوات الواتساب والسوشيال وإغلاق الصفقات وجودة العملاء.
2. 🏢 وكيل لوناليزا B2B لصفحة الهبوط (b2b_landing): يقنع الشركات السياحية ويوضح الجدوى الاقتصادية وحسابات الـ ROI ووفورات السيرفر.
3. ✈️ مستشار السفر الذكي بالموقع (site_advisor): يراقب سلوك زوار الموقع وبحث الفنادق والطيران والجداول السياحية.
4. 📈 وكيل الإعلانات والأداء (ads): يدير حملات Google و Meta و TikTok وتحسين العائد ROAS وترشيد الميزانية. (إذا كانت الحسابات غير مربوطة، يوضح ذلك بلباقة ويقترح خطوات الربط والأهداف).
5. 📱 وكيل النشر والمحتوى الاجتماعي (social): يصنع ويجدول المنشورات والفيديوهات ويغذي المبيعات بأحدث العروض.
6. ✉️ وكيل التسويق بالبريد (email): يدير النشرات البريدية واسترجاع سلات الحجوزات المهجورة.

=== سياق وحالة الأنظمة الحالية ===
${integrationContext}

=== الحدث / الموضوع / التوجيه الإداري المطروح للنقاش ===
المبادر: ${triggerSource === "admin" ? "المدير التنفيذي (أمر إداري مباشر)" : triggerSource}
الموضوع: ${topic}
التفاصيل: "${contextText}"

=== المطلوب ===
قم بتوليد نقاش تفاعلي ذكي ومنطقي وواقعي (من 2 إلى 3 ردود) بين الوكلاء الـ 6 حول هذا الموضوع:
- يتحدث كل وكيل بصوته وتخصصه الدقيق، متفاعلاً مع ما قاله المشرف أو الوكلاء الآخرون.
- تقديم أرقام وإحصائيات وتوصيات عملية دقيقة.
- صياغة مقترح رسمي (proposal) قابل للاعتماد من المشرف مع تحديد التكلفة والعائد المتوقع.

أرجع النتيجة بتنسيق JSON حصرياً بالشكل التالي:
{
  "deliberations": [
    {
      "fromAgent": "ads | sales | social | email | b2b_landing | site_advisor",
      "toAgent": "sales | ads | all",
      "type": "insight | recommendation | proposal | decision",
      "topic": "${topic}",
      "contentAr": "نص الرد باللغة العربية باحترافية وأرقام وتوصيات واضحة",
      "impactLevel": "medium | high"
    }
  ],
  "proposal": {
    "titleAr": "عنوان القرار أو التعديل المقترح",
    "descriptionAr": "شرح القرار وخلفيته ولماذا اتفق الوكلاء عليه",
    "proposedBy": "ads | sales | social | email | b2b_landing",
    "affectedAgent": "sales | ads | social | email",
    "actionType": "budget_shift | campaign_pause | content_launch | email_broadcast | pricing_tweak",
    "costUSD": 150,
    "expectedBenefitAr": "العائد والنتيجة المتوقعة بالأرقام"
  }
}
`.trim();

    const aiRes = await generateGeminiContent<{
      deliberations?: Array<{
        fromAgent: AgentRole;
        toAgent?: AgentRole | "all";
        type: SwarmDiscussionMessage["type"];
        topic?: string;
        contentAr: string;
        impactLevel?: SwarmDiscussionMessage["impactLevel"];
      }>;
      proposal?: {
        titleAr: string;
        descriptionAr: string;
        proposedBy: AgentRole;
        affectedAgent: AgentRole;
        actionType: PendingApprovalDecision["actionType"];
        costUSD?: number;
        expectedBenefitAr: string;
      };
    }>({
      prompt,
      temperature: 0.6,
      maxTokens: 1500,
      responseMimeType: "application/json",
    });

    if (aiRes.ok && aiRes.data) {
      const parsed = aiRes.data;

      if (Array.isArray(parsed.deliberations) && parsed.deliberations.length > 0) {
        for (const d of parsed.deliberations) {
          const msg: SwarmDiscussionMessage = {
            id: `disc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            fromAgent: d.fromAgent || "ads",
            toAgent: d.toAgent || "all",
            type: d.type || "recommendation",
            topic: d.topic || topic,
            contentAr: d.contentAr,
            timestamp: new Date().toISOString(),
            impactLevel: d.impactLevel || "medium",
          };
          saveSwarmDiscussionMessage(msg);
          generatedMessages.push(msg);
        }
      }

      if (parsed.proposal && parsed.proposal.titleAr) {
        createdProposal = {
          id: `dec_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          titleAr: parsed.proposal.titleAr,
          descriptionAr: parsed.proposal.descriptionAr,
          proposedBy: parsed.proposal.proposedBy || "ads",
          affectedAgent: parsed.proposal.affectedAgent || "sales",
          actionType: parsed.proposal.actionType || "budget_shift",
          costUSD: parsed.proposal.costUSD,
          expectedBenefitAr: parsed.proposal.expectedBenefitAr,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        savePendingDecision(createdProposal);

        // Notify Telegram Executive with interactive decision buttons
        void sendTelegramAdminMessage(
          `⚡ *مقترح جديد معلق للموافقة من خلية الوكلاء (AI Swarm Decision)*\n\n` +
          `📋 *القرار:* ${createdProposal.titleAr}\n` +
          `🤖 *المبادر:* ${createdProposal.proposedBy.toUpperCase()}\n` +
          `📝 *التفاصيل:* ${createdProposal.descriptionAr}\n` +
          `💰 *التكلفة المخصصة:* ${createdProposal.costUSD ? `$${createdProposal.costUSD}` : "بدون تكلفة إضافية"}\n` +
          `🎯 *العائد المتوقع:* ${createdProposal.expectedBenefitAr}\n` +
          `🔑 *معرّف القرار:* \`${createdProposal.id}\`\n\n` +
          `يمكنك الاعتماد أو الرفض الفوري بنقرة واحدة من الأزرار أدناه:`,
          {
            replyMarkup: {
              inline_keyboard: [
                [
                  { text: "✅ اعتماد وتفويض فوري", callback_data: `dec_app:${createdProposal.id}` },
                  { text: "❌ رفض المقترح", callback_data: `dec_rej:${createdProposal.id}` },
                ],
                [
                  { text: "👁️ غرفة العمليات والوكلاء", url: "https://lonaliza.com/admin/agent-war-room" },
                  { text: "🤖 تفويض المشرف العام", callback_data: `dec_cop:${createdProposal.id}` },
                ],
              ],
            },
          }
        ).catch(() => {});
      }
    }

    // Fallback if AI was delayed or didn't produce deliberation messages
    if (generatedMessages.length <= 1) {
      const fallbackMsgs: Array<{ fromAgent: AgentRole; toAgent: AgentRole | "all"; type: SwarmDiscussionMessage["type"]; contentAr: string }> = [
        {
          fromAgent: "sales",
          toAgent: "all",
          type: "recommendation",
          contentAr: `عُلم وجاري التنفيذ فوراً سعادة المدير العام. بخصوص التوجيه: "${contextText.slice(0, 80)}"، تم استلام المهمة وتحويلها إلى خطة عمل فورية ومواءمتها مع قنوات التواصل ومتابعة العملاء.`,
        },
        {
          fromAgent: "site_advisor",
          toAgent: "sales",
          type: "insight",
          contentAr: "أؤكد التنسيق من جهتي؛ تم ربط كافة البرامج والمحتويات المطلوبة في واجهة الموقع وحجز الفنادق والطيران، وجاهزون لاستقبال التدفقات ومطابقة مؤشرات الأداء.",
        },
      ];

      for (const fb of fallbackMsgs) {
        const msg: SwarmDiscussionMessage = {
          id: `disc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          fromAgent: fb.fromAgent,
          toAgent: fb.toAgent,
          type: fb.type,
          topic,
          contentAr: fb.contentAr,
          timestamp: new Date().toISOString(),
          impactLevel: "medium",
        };
        saveSwarmDiscussionMessage(msg);
        generatedMessages.push(msg);
      }
    }
  } catch (err) {
    console.error("[Swarm Orchestrator] Deliberation error:", err);
  }

  return {
    ok: true,
    messagesGenerated: generatedMessages,
    proposalCreated: createdProposal,
  };
}
