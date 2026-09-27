import { isOrigin } from "@/lib/server/deployment-role";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import {
  loadB2BTrainingConfig,
  loadB2CTrainingConfig,
} from "@/lib/automation/agent-training-store";
import {
  getMessagesForContact,
  saveCommsMessage,
  type MessageChannel,
  type MessageTrack,
} from "@/lib/automation/comms-message-store";
import { sendTelegramAdminMessage } from "@/lib/automation/channels/telegram";
import { isPhoneNumberExcluded } from "@/lib/automation/excluded-contacts-store";
import {
  analyzeClientDialectAndTone,
  type DetectedDialect,
} from "@/lib/automation/dialect-analyzer";

export type SalesAgentReplyResult = {
  replyText: string;
  track: MessageTrack;
  intent: string;
  leadScore: number;
  handoverTriggered: boolean;
};

const B2B_TRIGGER_KEYWORDS = [
  "نظام",
  "منصة",
  "شراء",
  "اشتراك",
  "ترخيص",
  "ريسيلر",
  "ديمو",
  "saas",
  "b2b",
  "reseller",
  "موقع سياحي",
  "حجز طيران وفنادق للشركات",
  "وكالة",
  "شركة سياحية",
  "موزع",
  "وايت ليبل",
  "white label",
  "aaPanel",
  "سيرفر",
];

export function detectTrack(text: string, forceTrack?: "b2b" | "b2c" | "auto"): MessageTrack {
  if (forceTrack === "b2b") return "b2b";
  if (forceTrack === "b2c") return "b2c";

  // Only allow B2B detection on the origin master platform
  if (!isOrigin()) return "b2c";

  const lower = text.toLowerCase();
  for (const kw of B2B_TRIGGER_KEYWORDS) {
    if (lower.includes(kw)) {
      return "b2b";
    }
  }
  return "b2b"; // On origin master, default to B2B
}

/**
 * Aggressive sanitizer that ensures NO raw JSON or code structure can ever leak to the client.
 */
export function sanitizeHumanReply(raw: string): string {
  if (!raw) return "";
  let text = raw.trim();

  // 1. Remove markdown code fences
  text = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();

  // 2. Try parsing full JSON object
  if (text.startsWith("{") && text.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.reply === "string" && parsed.reply) {
        text = parsed.reply;
      }
    } catch {
      // ignore
    }
  }

  // 3. Regex extract "reply": "..." if still present
  const replyMatch = text.match(/["']?reply["']?\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (replyMatch && replyMatch[1]) {
    text = replyMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  // 4. Strip stray JSON wrapper artifacts
  text = text
    .replace(/^\s*\{\s*/, "")
    .replace(/\s*\}\s*$/, "")
    .replace(/"intent"\s*:\s*"[^"]*"/gi, "")
    .replace(/"leadScore"\s*:\s*\d+/gi, "")
    .replace(/,\s*$/m, "")
    .trim();

  // 5. Final fallback cleanup
  if (text.startsWith('"') && text.endsWith('"') && text.length > 2) {
    text = text.slice(1, -1);
  }

  return text.trim();
}

export async function processIncomingMessageAndReply({
  from,
  body,
  channel,
  customerName,
  forceTrack,
  metadata,
}: {
  from: string;
  body: string;
  channel: MessageChannel;
  customerName?: string;
  forceTrack?: "b2b" | "b2c" | "auto";
  metadata?: Record<string, unknown>;
}): Promise<SalesAgentReplyResult | null> {
  // 1. CHECK EXCLUSION LIST: Never auto-reply to personal/family contacts
  if (isPhoneNumberExcluded(from)) {
    console.log(`[ai-sales-agent] Skipping excluded phone number: ${from}`);
    return null;
  }

  // 2. DIALECT & CASUAL CHAT ANALYSIS
  const dialect = analyzeClientDialectAndTone(from, body);

  // If casual personal message without business context, ignore to avoid spamming friends
  const lowerBody = body.toLowerCase();
  const hasBusinessKeyword = [
    "حجز", "سعر", "باقة", "فندق", "طيران", "رحلة", "ديمو", "نظام", "شركة", "منصة",
    "بكج", "طرابزون", "إسطنبول", "تركيا", "سياحة", "تكلفة", "سيارة", "سائق",
  ].some((kw) => lowerBody.includes(kw));

  if (dialect.isCasualPersonalVibe && !hasBusinessKeyword) {
    console.log(`[ai-sales-agent] Skipping casual personal message from ${from}: "${body}"`);
    return null;
  }

  const track = detectTrack(body, forceTrack);

  // Save the inbound message
  saveCommsMessage({
    channel,
    direction: "inbound",
    category: "inbound",
    track,
    from,
    to: channel === "whatsapp" ? "system" : "bot",
    body,
    status: "received",
    customerName,
    metadata,
  });

  const b2bConfig = loadB2BTrainingConfig();
  const b2cConfig = loadB2CTrainingConfig();

  // Check if AI reply is enabled for this track
  if (track === "b2b" && (!b2bConfig || !b2bConfig.enabled)) {
    return null;
  }
  if (track === "b2c" && !b2cConfig.enabled) {
    return null;
  }

  // Check for human handover keywords
  const activeKeywords =
    track === "b2b" ? b2bConfig?.handoverKeywords || [] : b2cConfig.handoverKeywords || [];
  const needsHandover = activeKeywords.some((kw) => kw && lowerBody.includes(kw.toLowerCase()));

  if (needsHandover) {
    void sendTelegramAdminMessage(
      `🚨 *تنبيه: طلب تحويل لموظف بشري (${track.toUpperCase()})*\n\n` +
        `👤 *العميل:* ${customerName || "غير محدد"}\n` +
        `📞 *الرقم/المعرف:* \`${from}\` (${dialect.regionNameAr})\n` +
        `💬 *نص الرسالة:* "${body}"\n\n` +
        `⚡ يرجى التواصل مع العميل لمتابعة الطلب.`
    ).catch(() => {});

    const handoverMsg =
      track === "b2b"
        ? "أهلاً بك 🌸! تم تحويل محادثتك للفريق التنفيذي، وسيتواصل معك أحد مسؤولينا لمناقشة كافة التفاصيل فوراً."
        : "أهلاً بك 🌸! تم تحويل استفسارك لمستشار الحجوزات، وسيتواصل معك خلال دقائق لمساعدتك في ترتيب أفضل برنامج.";

    saveCommsMessage({
      channel,
      direction: "outbound",
      category: "ai_sales",
      track,
      from: "system",
      to: from,
      body: handoverMsg,
      status: "sent",
      customerName,
      intent: "human_handover",
      leadScore: 95,
    });

    return {
      replyText: handoverMsg,
      track,
      intent: "human_handover",
      leadScore: 95,
      handoverTriggered: true,
    };
  }

  // Prepare recent history for context
  const history = getMessagesForContact(from, channel).slice(-6);
  const formattedHistory = history
    .map((m) => `${m.direction === "inbound" ? "العميل" : "أنت"}: ${m.body}`)
    .join("\n");

  // Dynamic real-time travel search context (only for specific keywords)
  let liveSearchSnippet = "";
  if (track === "b2c") {
    try {
      const {
        searchHotelsTool,
        searchPackagesAndToursTool,
        searchCarsTool,
      } = await import("./agent-tools-registry");

      const [hotels, packages, cars] = await Promise.all([
        lowerBody.includes("فندق") || lowerBody.includes("سكن")
          ? searchHotelsTool({ query: body })
          : Promise.resolve([]),
        lowerBody.includes("بكج") || lowerBody.includes("برنامج") || lowerBody.includes("رحل")
          ? searchPackagesAndToursTool({ query: body })
          : Promise.resolve([]),
        lowerBody.includes("سيار") || lowerBody.includes("سائق")
          ? searchCarsTool({ query: body })
          : Promise.resolve([]),
      ]);

      const snippets: string[] = [];
      if (hotels.length > 0) {
        snippets.push(`🏨 فنادق مقترحة:\n` + hotels.slice(0, 2).map((h) => `- ${h.nameAr} (${h.stars} نجوم) في ${h.city} ابتداءً من $${h.fromPriceUSD}`).join("\n"));
      }
      if (packages.length > 0) {
        snippets.push(`🌟 باقات متاحة:\n` + packages.slice(0, 2).map((p) => `- ${p.title} (${p.days} أيام) بسعر $${p.priceUSD}`).join("\n"));
      }
      if (cars.length > 0) {
        snippets.push(`🚗 سيارات:\n` + cars.slice(0, 2).map((c) => `- ${c.titleAr} (${c.vehicle}) بسعر $${c.priceUSD}`).join("\n"));
      }
      liveSearchSnippet = snippets.join("\n\n");
    } catch (err) {
      console.warn("[ai-sales-agent] Tools lookup warning:", err);
    }
  }

  let replyText = "";
  let intent = "general_inquiry";
  let leadScore = 70;

  try {
    const { generateGeminiContent } = await import("@/lib/server/gemini-swarm-client");
    const prompt = buildAgentPrompt({
      track,
      b2bConfig: track === "b2b" ? b2bConfig : null,
      b2cConfig,
      incomingMessage: body,
      formattedHistory,
      customerName,
      liveSearchSnippet,
      dialect,
    });

    const aiRes = await generateGeminiContent<{
      reply?: string;
      intent?: string;
      leadScore?: number;
    }>({
      prompt,
      temperature: 0.4,
      maxTokens: 500,
      responseMimeType: "application/json",
    });

    if (aiRes.ok && aiRes.data && aiRes.data.reply) {
      replyText = sanitizeHumanReply(aiRes.data.reply);
      intent = aiRes.data.intent || intent;
      leadScore = typeof aiRes.data.leadScore === "number" ? aiRes.data.leadScore : leadScore;
    } else if (aiRes.ok && aiRes.text) {
      replyText = sanitizeHumanReply(aiRes.text);
    }
  } catch (err) {
    console.error("[ai-sales-agent] Gemini call failed:", err);
  }

  // Safety fallback if empty or still invalid
  if (!replyText || replyText.startsWith("{")) {
    if (track === "b2b") {
      replyText = "أهلاً بك معنا في منصة لوناليزا (Lonaliza B2B) 🌸! يسعدنا تقديم حلول الحجوزات والأتمتة المتكاملة لشركتك السياحية. هل تحب الاطلاع على العرض التوضيحي المباشر (Demo)؟";
    } else {
      replyText = "أهلاً وسهلاً بك في لوناليزا للسياحة والسفر 🌸✈️! يسعدني مساعدتك في ترتيب رحلتك القادمة. ما هي الوجهة التي تفضل زيارتها؟";
    }
  }

  // Save the outbound response
  saveCommsMessage({
    channel,
    direction: "outbound",
    category: "ai_sales",
    track,
    from: "system",
    to: from,
    body: replyText,
    status: "sent",
    customerName,
    intent,
    leadScore,
    metadata,
  });

  return {
    replyText,
    track,
    intent,
    leadScore,
    handoverTriggered: false,
  };
}

function buildAgentPrompt({
  track,
  b2bConfig,
  b2cConfig,
  incomingMessage,
  formattedHistory,
  customerName,
  liveSearchSnippet,
  dialect,
}: {
  track: MessageTrack;
  b2bConfig: ReturnType<typeof loadB2BTrainingConfig>;
  b2cConfig: ReturnType<typeof loadB2CTrainingConfig>;
  incomingMessage: string;
  formattedHistory: string;
  customerName?: string;
  liveSearchSnippet?: string;
  dialect: DetectedDialect;
}): string {
  const commonHumanRules = `
قواعد وأسلوب المحادثة الصارمة (قوانين الذكاء العاطفي والبشري):
1. 🛑 الإيجاز والدقة التامة: أجب في 1 إلى 3 جمل قصيرة ومركزة فقط! ممنوع منعاً باتاً كتابة فقرات طويلة أو مقالات.
2. 🛑 ممنوع الحشو الإعلاني: لا ترسل قوائم أسعار طويلة، ولا تسرد الباقات ولا ترسل كوبونات الخصم فورياً إلا إذا طلب العميل ذلك صراحة.
3. 💬 الردود التفاعلية اللطيفة: إذا أرسل العميل تحية أو ضحك ("ههههه"، "الحمد لله")، تفاعل معه بلطف وإيجاز (مثل: "دوم الضحكة يا رب 😄🌸! كيف نقدر نساعدك؟").
4. 🎯 الهندسة الاجتماعية وفهم العميل: اسأل سؤالاً واحداً فقط في نهاية الرد لتفهم رغبة العميل واحتياجه بدقة.
5. 🌍 مطابقة اللهجة والأسلوب: ${dialect.dialectGuidelinesAr}
6. 🔒 إخراج نظيف: أعد الرد بصيغة JSON محكمة فقط بدون أي نص إضافي خارج الـ JSON.`;

  if (track === "b2b" && b2bConfig) {
    return `أنت "مستشار حلول منصة لوناليزا B2B" (Lonaliza Travel Platform SaaS).
مهمتك: مساعدة أصحاب المكاتب والشركات السياحية وتقديم المنصة الذكية (نظام سحابي لحجوزات الطيران والفنادق والأتمتة).
العميل: ${customerName || "أستاذنا الكريم"}
رابط الديمو: ${b2bConfig.demoUrl}

${commonHumanRules}

سياق المحادثة السابقة:
${formattedHistory || "بداية المحادثة"}

رسالة العميل الجديدة:
"${incomingMessage}"

JSON Schema:
\`\`\`json
{
  "reply": "نص رد بشري ودافي وموجز جداً (1-3 جمل)",
  "intent": "b2b_inquiry",
  "leadScore": 85
}
\`\`\``;
  }

  return `أنت "المستشار وخبير السفر السياحي" في لوناليزا للسياحة والسفر (Lonaliza Travel).
مهمتك: مساعدة المسافرين بلباقة ودفء لتخطيط عطلاتهم في تركيا وأجمل الوجهات السياحية.
العميل: ${customerName || "ضيفنا العزيز"}
رابط الموقع: ${b2cConfig.bookingUrl}

${liveSearchSnippet ? `بيانات متوفرة:\n${liveSearchSnippet}\n` : ""}
${commonHumanRules}

سياق المحادثة السابقة:
${formattedHistory || "بداية المحادثة"}

رسالة العميل الجديدة:
"${incomingMessage}"

JSON Schema:
\`\`\`json
{
  "reply": "نص رد بشري ودافي وموجز جداً بلهجة العميل (1-3 جمل)",
  "intent": "travel_inquiry",
  "leadScore": 75
}
\`\`\``;
}
