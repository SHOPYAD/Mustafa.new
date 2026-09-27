import { resolveGeminiApiKey } from "@/lib/server/gemini";
import {
  getB2BLandingAgentConfig,
  saveB2BChatSession,
  getB2BChatSessions,
  type B2BChatMessage,
  type B2BChatSession,
} from "./b2b-landing-agent-store";
import { sendTelegramAdminMessage } from "@/lib/ads/reports-telegram";

export interface ProcessB2BLandingChatInput {
  sessionId?: string;
  visitorName?: string;
  companyName?: string;
  phoneOrEmail?: string;
  message: string;
  history?: Array<{ sender: "agent" | "visitor"; text: string }>;
  locale?: string;
}

export interface ProcessB2BLandingChatOutput {
  sessionId: string;
  replyText: string;
  leadScore: number;
  intent: string;
  handoverTriggered?: boolean;
  roiData?: {
    currentCost?: number;
    lonalizaCost?: number;
    projectedSavingsYear1?: number;
    projectedRoiPercent?: number;
    breakEvenMonths?: number;
  };
}

export async function processB2BLandingChat({
  sessionId,
  visitorName,
  companyName,
  phoneOrEmail,
  message,
  history = [],
  locale = "ar",
}: ProcessB2BLandingChatInput): Promise<ProcessB2BLandingChatOutput> {
  const config = getB2BLandingAgentConfig();
  const currentSessionId = sessionId || `b2b_session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Check for handover keywords
  const lowerMsg = message.toLowerCase();
  const needsHandover = config.handoverKeywords.some((kw) => kw && lowerMsg.includes(kw.toLowerCase()));

  if (needsHandover) {
    const handoverText =
      locale === "en"
        ? "I have transferred your request to our Executive Sales Director. Our team will contact you directly via phone or WhatsApp shortly to schedule a tailored live demo for your company!"
        : "تم تحويل طلبك مباشرة إلى الإدارة التنفيذية ومسؤولي المبيعات. سيتواصل معك أحد مستشارينا هاتفياً أو عبر الواتساب خلال وقت قصير لترتيب عرض حي (Demo) مخصص لشركتكم!";

    // Send Telegram alert to admin
    void sendTelegramAdminMessage(
      `🏢 *تنبيه: اهتمام شركة جديدة في الشات B2B*\n\n` +
      `👤 *الاسم:* ${visitorName || "غير محدد"}\n` +
      `🏢 *الشركة:* ${companyName || "غير محدد"}\n` +
      `📞 *الاتصال:* \`${phoneOrEmail || "غير محدد"}\`\n` +
      `💬 *الرسالة:* "${message}"\n` +
      `🌐 *الجلسة:* \`${currentSessionId}\`\n\n` +
      `⚡ يرجى التواصل مع الشركة فوراً.`
    ).catch(() => {});

    return {
      sessionId: currentSessionId,
      replyText: handoverText,
      leadScore: 95,
      intent: "b2b_executive_demo",
      handoverTriggered: true,
    };
  }

  const { generateGeminiContent } = await import("@/lib/server/gemini-swarm-client");

  const packagesInfo = config.packages
    .map(
      (p) =>
        `- باقة [${p.nameAr}] (${p.nameEn}): السعر الرسمي $${p.priceUSD}${
          p.discountPriceUSD ? ` (عرض خاص مخفض $${p.discountPriceUSD})` : ""
        } | الميزات: ${p.featuresAr.join(" - ")}`
    )
    .join("\n");

  const serverHighlights = config.serverSpecsHighlightsAr.map((s) => `• ${s}`).join("\n");

  const formattedHistory = history.map((m) => `${m.sender === "visitor" ? "العميل" : "المستشار"}: ${m.text}`).join("\n");

  const systemPrompt = `
${config.systemPromptAddition}

=== تفاصيل باقات الأسعار المعتمدة للشركات B2B ===
${packagesInfo}

=== البنية التحتية والسيرفر المستقل ولوحة aaPanel ===
${serverHighlights}

=== قواعد الأمان والسرية الصارمة (GUARDRAILS) ===
${config.guardrailsPrompt}

=== تعليمات إضافية ومقارنة الجدوى الاقتصادية (ROI Calculation) ===
1. تحدث بأسلوب استشاري تنفيذي راقٍ ومقنع، وقدم إجابات محددة وواضحة عن المنصة وميزات السيرفر المستقل وتراخيص امتلاك النظام مدى الحياة.
2. أجب بدقة على سؤال العميل مستنداً على تفاصيل الباقات والأسعار أعلاه.
3. إذا ذكر العميل أنه يدفع اشتراكات شهرية أو عمولات أو لديه موظفين، قم بحساب المقارنة الاقتصادية بالأرقام:
   - احسب التكلفة السنوية لنظامه القديم.
   - وضح له أنه مع لوناليزا يدفع مرة واحدة فقط لامتلاك النظام مدى الحياة (Lifetime License) ويستعيد رأس ماله (Break-even) خلال 2-4 أشهر فقط، ويوفر آلاف الدولارات في السنوات القادمة.
4. التزم باللغة المطلوبة للمحادثة (${locale === "en" ? "English" : "العربية"}).
5. أرجع إجابتك دائماً بتنسيق JSON حصرياً بالشكل التالي:
{
  "replyText": "نص الرد المقنع باللغة المناسبة مع التنسيق الجميل والرموز التعبيرية",
  "leadScore": 85,
  "intent": "b2b_pricing_inquiry | b2b_server_features | b2b_roi_comparison | b2b_demo_booking | general",
  "roiData": {
    "currentCost": 6000,
    "lonalizaCost": 1499,
    "projectedSavingsYear1": 4501,
    "projectedRoiPercent": 300,
    "breakEvenMonths": 3
  }
}
`.trim();

  let replyText = "";
  let leadScore = 75;
  let intent = "b2b_inquiry";
  let roiData: ProcessB2BLandingChatOutput["roiData"] | undefined;

  try {
    const aiResult = await generateGeminiContent<{
      replyText?: string;
      leadScore?: number;
      intent?: string;
      roiData?: ProcessB2BLandingChatOutput["roiData"];
    }>({
      prompt: `=== سجل المحادثة السابقة ===\n${formattedHistory}\n\n=== رسالة العميل الحالية ===\n${message}`,
      systemInstruction: systemPrompt,
      temperature: 0.6,
      maxTokens: 1200,
      responseMimeType: "application/json",
    });

    if (aiResult.ok && aiResult.data) {
      if (aiResult.data.replyText) replyText = aiResult.data.replyText;
      if (typeof aiResult.data.leadScore === "number") leadScore = aiResult.data.leadScore;
      if (aiResult.data.intent) intent = aiResult.data.intent;
      if (aiResult.data.roiData) roiData = aiResult.data.roiData;
    } else if (aiResult.ok && aiResult.text) {
      replyText = aiResult.text.trim();
    }
  } catch (err) {
    console.error("[B2B Landing Agent] Gemini generation error:", err);
  }

  // Fallback if AI was unavailable
  if (!replyText) {
    replyText =
      locale === "en"
        ? `Lonaliza platform gives your travel agency lifetime ownership of a turnkey travel portal on a dedicated server with aaPanel, automated booking APIs for hotels & flights, and multi-channel AI sales agents. The Lifetime License is available for $1,499 one-time (with an optional updates & support subscription for $199/year). Would you like to schedule a quick live demo?`
        : `منصة لوناليزا تمنح شركتكم امتلاكاً دائماً مدى الحياة (Lifetime License) للنسخة النهائية للمنصة السياحية المتكاملة على سيرفر سحابي مستقل مع لوحة aaPanel، ومحركات حجز طيران وفنادق عالمية، وترسانة ذكاء اصطناعي كاملة لإدارة المبيعات والواتساب. باقة الامتلاك الدائم متاحة بسعر 1499$ فقط لمرة واحدة (مع اشتراك تحديثات ودعم فني اختياري بـ 199$/سنة). هل ترغب في حجز موعد لعرض تجريبي حي (Live Demo)؟`;
  }

  // Save conversation session
  const existingSessions = getB2BChatSessions();
  const foundSession = existingSessions.find((s) => s.sessionId === currentSessionId);

  const updatedMessages: B2BChatMessage[] = foundSession ? [...foundSession.messages] : [];
  updatedMessages.push({
    id: `msg_vis_${Date.now()}`,
    sender: "visitor",
    text: message,
    timestamp: new Date().toISOString(),
  });
  updatedMessages.push({
    id: `msg_agt_${Date.now()}`,
    sender: "agent",
    text: replyText,
    timestamp: new Date().toISOString(),
    roiData,
  });

  const sessionObj: B2BChatSession = {
    sessionId: currentSessionId,
    visitorName: visitorName || foundSession?.visitorName,
    companyName: companyName || foundSession?.companyName,
    phoneOrEmail: phoneOrEmail || foundSession?.phoneOrEmail,
    leadScore: Math.max(leadScore, foundSession?.leadScore || 0),
    intent,
    messages: updatedMessages,
    createdAt: foundSession?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveB2BChatSession(sessionObj);

  return {
    sessionId: currentSessionId,
    replyText,
    leadScore,
    intent,
    roiData,
  };
}
