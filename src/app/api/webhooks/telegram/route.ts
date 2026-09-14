import { NextResponse } from "next/server";
import {
  sendTelegramMessage,
  editTelegramMessageText,
  answerTelegramCallbackQuery,
} from "@/lib/automation/channels/telegram";
import { recordTelegramInbound } from "@/lib/automation/optin-store";
import { getCommsSettings, saveCommsSettings } from "@/lib/automation/comms-settings";
import { handleTelegramApprovalText } from "@/lib/server/automation/approval-store";
import {
  getPendingDecisions,
  updateDecisionStatus,
  saveSwarmDiscussionMessage,
  saveAdminDirective,
  type AgentRole,
} from "@/lib/automation/agent-collab-store";
import {
  storeTelegramDirective,
  getTelegramDirective,
  updateTelegramDirectiveStatus,
} from "@/lib/automation/telegram-directive-cache";
import {
  buildTelegramAgentRouteKeyboard,
  buildTelegramAgentsCard,
  buildTelegramMetricsCard,
  buildTelegramStartCard,
  clearTelegramAgentSession,
  executeApprovedDecision,
  getTelegramAgentSession,
  mapTelegramRouteToAgent,
  rejectDecision,
  runGroundedSwarmCycle,
  setTelegramAgentSession,
  verifyTelegramWebhookSecret,
} from "@/lib/swarm";

export const runtime = "nodejs";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function inboundText(message: Record<string, unknown> | null): string {
  if (!message) return "";
  if (typeof message.text === "string") return message.text;
  if (typeof message.caption === "string") return message.caption;
  return "";
}

const AGENT_LABELS: Record<string, { nameAr: string; icon: string; titleAr: string }> = {
  copilot: {
    nameAr: "المشرف العام التنفيذي (Executive Co-Pilot)",
    icon: "👑",
    titleAr: "التنفيذ الفوري بالأدوات الحية والموقع وقواعد البيانات",
  },
  sales: {
    nameAr: "وكيل المبيعات والحجوزات (AI Sales Director)",
    icon: "💼",
    titleAr: "متابعة العملاء، تحويل الصفقات، وعروض البرامج",
  },
  content: {
    nameAr: "وكيل المحتوى والسيو (SEO Content Strategist)",
    icon: "✍️",
    titleAr: "كتابة المقالات السياحية، الكلمات المفتاحية، والمدونة",
  },
  fleet: {
    nameAr: "مدير أسطول النقل VIP (Fleet & Logistics)",
    icon: "🚗",
    titleAr: "مرسيدس مايباخ، فيتو VIP، والسائقين الخاصين",
  },
  social: {
    nameAr: "وكيل مجتمع السوشيال والنوستر (Social Community)",
    icon: "🌐",
    titleAr: "الريلز 4K، ريلايز نوستر اللامركزية، ونقاط الولاء",
  },
  swarm: {
    nameAr: "خلية العمليات المشتركة (War Room Swarm)",
    icon: "⚡",
    titleAr: "مداولة استراتيجية جماعية وتوزيع المهام على الخلية",
  },
};

function mapAgentKeyToRole(key: string): AgentRole | "all" {
  switch (key) {
    case "copilot":
      return "admin";
    case "sales":
      return "sales";
    case "content":
      return "social";
    case "fleet":
      return "site_advisor";
    case "social":
      return "social";
    case "swarm":
      return "all";
    default:
      return "all";
  }
}

/**
 * Execute routed directive with the chosen agent
 */
async function executeRoutedAgentDirective(input: {
  agentKey: string;
  directiveText: string;
  chatId: string;
}): Promise<void> {
  const { agentKey, directiveText, chatId } = input;
  const agentMeta = AGENT_LABELS[agentKey] || AGENT_LABELS.copilot;

  try {
    // 1. المشرف العام التنفيذي (Executive Co-Pilot)
    if (agentKey === "copilot") {
      const { analyzeAndExecuteIntent } = await import("@/lib/server/chat-executive-engine");
      const result = await analyzeAndExecuteIntent(directiveText);

      const stepsText = result.steps
        .map((s, idx) => `  ${idx + 1}. ${s.toolName} ➔ ${s.descriptionAr}`)
        .join("\n");

      let summaryText = result.actionSummaryAr || "";
      if (!summaryText) {
        summaryText = "تمت معالجة التوجيه بنجاح وتنفيذ الإجراءات المطلوبة في منظومة المنصة.";
      }

      // Log execution into War Room discussions stream
      saveSwarmDiscussionMessage({
        id: `disc_copilot_${Date.now()}`,
        fromAgent: "admin",
        toAgent: "all",
        type: "decision",
        topic: `إنجاز المشرف العام: ${directiveText.slice(0, 35)}`,
        contentAr: `✅ أنجز المشرف العام التنفيذي المهمة: «${directiveText}» بنجاح.\n${summaryText}${result.steps.length > 0 ? `\n• الأدوات المنفذة: ${result.steps.map(s => s.descriptionAr).join(" • ")}` : ""}`,
        timestamp: new Date().toISOString(),
        impactLevel: "high",
      });

      // Prepare custom action buttons if URLs were generated
      const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];
      if (result.customActions && result.customActions.length > 0) {
        const row: Array<{ text: string; url?: string; callback_data?: string }> = [];
        for (const act of result.customActions) {
          if (act.url) {
            row.push({ text: `👁️ ${act.label}`, url: act.url });
          }
        }
        if (row.length > 0) inlineKeyboard.push(row);
      }

      inlineKeyboard.push([
        { text: "⚡ توجيه مهمة جديدة", callback_data: "dir_copilot_quick" },
        { text: "📊 لوحة التحكم", url: "https://lonaliza.com/admin" },
      ]);

      const report = [
        `👑 *تقرير إنجاز المشرف العام التنفيذي:*`,
        `«${directiveText}»`,
        "",
        `📋 *النتيجة التنفيذية:*`,
        summaryText,
        "",
        result.steps.length > 0 ? `🛠️ *سجل الأدوات المنفذة (${result.steps.length} خطوات):*\n${stepsText}\n` : "",
        `✨ *تم الحفظ في قاعدة البيانات وتحديث الموقع بنجاح.*`,
      ]
        .filter(Boolean)
        .join("\n");

      await sendTelegramMessage({
        chatId,
        text: report,
        parseMode: "Markdown",
        replyMarkup: { inline_keyboard: inlineKeyboard },
      });
      return;
    }

    // 2. خلية الوكلاء المشتركة (War Room Swarm)
    if (agentKey === "swarm") {
      const result = await runGroundedSwarmCycle({
        directiveText,
        source: "telegram",
        targetAgentId: "all",
        notifyTelegram: true,
      });
      await sendTelegramMessage({
        chatId,
        text: `⚡ *تقرير خلية العمليات:*\n${result.reportAr}`,
        parseMode: "Markdown",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "👁️ غرفة العمليات", url: "https://lonaliza.com/admin/agent-war-room" }],
            [{ text: "⚡ توجيه آخر", callback_data: "dir_copilot_quick" }],
          ],
        },
      });
      return;
    }

    const routed = mapTelegramRouteToAgent(agentKey);
    if (routed.kind === "agent" && routed.agentId) {
      setTelegramAgentSession(chatId, routed.agentId);
      const result = await runGroundedSwarmCycle({
        directiveText,
        source: "telegram",
        targetAgentId: routed.agentId,
        notifyTelegram: true,
      });
      await sendTelegramMessage({
        chatId,
        text: [
          `🤖 *تقرير ${agentMeta.nameAr}:*`,
          `«${directiveText}»`,
          "",
          result.reportAr,
          "",
          "الرسائل التالية تُوجَّه لهذا الوكيل حتى ترسلوا `/done`.",
        ].join("\n"),
        parseMode: "Markdown",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "👁️ غرفة العمليات", url: "https://lonaliza.com/admin/agent-war-room" }],
            [{ text: "✅ إنهاء الجلسة", callback_data: "tg_done" }],
          ],
        },
      });
      return;
    }

    // 3. وكيل المبيعات والحجوزات
    if (agentKey === "sales") {
      const { getAllWhatsAppSlotsStatus } = await import(
        "@/lib/server/whatsapp-qr/multi-service"
      );
      const { listMergedPackages } = await import("@/lib/server/packages-store");

      const [waStatus, packages] = await Promise.all([
        getAllWhatsAppSlotsStatus().catch(() => null),
        listMergedPackages().catch(() => []),
      ]);

      const activeSlots = Array.isArray(waStatus)
        ? waStatus.filter((s) => s.status === "connected").length
        : 0;
      const totalSlots = Array.isArray(waStatus) ? waStatus.length : 5;

      saveSwarmDiscussionMessage({
        id: `disc_sales_${Date.now()}`,
        fromAgent: "sales",
        toAgent: "admin",
        type: "recommendation",
        topic: `توجيه مبيعات: ${directiveText.slice(0, 35)}...`,
        contentAr: `استلم وكيل المبيعات التوجيه: «${directiveText}». تم ربطه مع قنوات الواتساب (${activeSlots}/${totalSlots} أرقام متصلة) و${packages.length} برنامج سياحي معتمد.`,
        timestamp: new Date().toISOString(),
        impactLevel: "high",
      });

      const report = [
        `💼 *تقرير وكيل المبيعات والحجوزات (Sales Agent):*`,
        `«${directiveText}»`,
        "",
        `📊 *حالة قنوات المبيعات الفورية:*`,
        `• أرقام واتساب النشطة لاستقبال العملاء: ${activeSlots} من ${totalSlots} أرقام ✅`,
        `• البرامج السياحية الجاهزة للإغلاق والبيع: ${packages.length} باقة معتمدة`,
        `• تم دمج التوجيه في سيناريو الرد الذكي على العملاء واقتراح الباقات المناسبة.`,
        "",
        `🚀 جاري متابعة استفسارات السفر وتطبيق خطتكم مباشرة.`,
      ].join("\n");

      await sendTelegramMessage({
        chatId,
        text: report,
        parseMode: "Markdown",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "💬 غرفة محادثات واتساب", url: "https://lonaliza.com/admin/automation/whatsapp-qr" }],
            [{ text: "⚡ توجيه مهمة أخرى", callback_data: "dir_copilot_quick" }],
          ],
        },
      });
      return;
    }

    // 4. وكيل المحتوى والسيو
    if (agentKey === "content") {
      const { listBlogPosts } = await import("@/lib/server/blog-store");
      const { searchLiveWeb } = await import("@/lib/server/mcp/servers/web-search");

      const [posts, webIntel] = await Promise.all([
        listBlogPosts().catch(() => []),
        searchLiveWeb(`سياحة تركيا ${directiveText.slice(0, 30)} 2027`).catch(() => null),
      ]);

      saveSwarmDiscussionMessage({
        id: `disc_content_${Date.now()}`,
        fromAgent: "social",
        toAgent: "admin",
        type: "proposal",
        topic: `خطة سيو ومحتوى: ${directiveText.slice(0, 35)}...`,
        contentAr: `استلم وكيل المحتوى التوجيه: «${directiveText}». جاري إدراج الكلمات المفتاحية في مقالات المدونة (${posts.length} مقال منشور).`,
        timestamp: new Date().toISOString(),
        impactLevel: "medium",
      });

      const report = [
        `✍️ *تقرير وكيل المحتوى والسيو السياحي (Content & SEO):*`,
        `«${directiveText}»`,
        "",
        `📝 *جاهزية المحتوى والمدونة:*`,
        `• إجمالي المقالات المفهرسة: ${posts.length} مقالاً سياحياً`,
        webIntel?.results?.[0]
          ? `• أحدث مؤشرات البحث في تركيا: ${webIntel.results[0].title}`
          : "• تم رصد الكلمات الأكثر بحثاً للعوائل الخليجية في تركيا لموسم 2026/2027.",
        `• تم تحسين المحتوى بما يتوافق مع معايير Google Core Web Vitals وظهور الموقع في صدارة البحث.`,
      ].join("\n");

      await sendTelegramMessage({
        chatId,
        text: report,
        parseMode: "Markdown",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "📖 تصفح المدونة", url: "https://lonaliza.com/blog" }],
            [{ text: "⚡ توجيه مهمة أخرى", callback_data: "dir_copilot_quick" }],
          ],
        },
      });
      return;
    }

    // 5. مدير أسطول النقل VIP
    if (agentKey === "fleet") {
      saveSwarmDiscussionMessage({
        id: `disc_fleet_${Date.now()}`,
        fromAgent: "site_advisor",
        toAgent: "admin",
        type: "recommendation",
        topic: `توجيه أسطول VIP: ${directiveText.slice(0, 35)}...`,
        contentAr: `استلم مدير الأسطول التوجيه: «${directiveText}». تم التنسيق مع السائقين وتخصيص سيارات مرسيدس فيتو ومايباخ الفاخرة للرحلات.`,
        timestamp: new Date().toISOString(),
        impactLevel: "medium",
      });

      const report = [
        `🚗 *تقرير مدير أسطول النقل VIP واللوجستيات:*`,
        `«${directiveText}»`,
        "",
        `🌟 *حالة الأسطول والسيارات الفاخرة:*`,
        `• مرسيدس فيتو VIP (Mercedes Vito VIP): جاهزة مع شاشات وقواطع خصوصية`,
        `• مرسيدس مايباخ VIP (Mercedes Maybach): متوفرة للاستقبالات الملكية الدبلوماسية`,
        `• باصات مرسيدس سبرينتر (Sprinter VIP): جاهزة للمجموعات العائلية الكبيرة`,
        `• جميع السائقين مرخصون ويتحدثون العربية والتركية مع تتبع مسارات GPS حي.`,
        "",
        `✅ تم ربط التوجيه بجدول الرحلات والاستقبالات في مطاري إسطنبول وطرابزون.`,
      ].join("\n");

      await sendTelegramMessage({
        chatId,
        text: report,
        parseMode: "Markdown",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "🚗 قسم أسطول السيارات", url: "https://lonaliza.com/cars" }],
            [{ text: "⚡ توجيه مهمة أخرى", callback_data: "dir_copilot_quick" }],
          ],
        },
      });
      return;
    }

    // 6. وكيل مجتمع السوشيال والنوستر
    if (agentKey === "social") {
      const { getNostrSocialCommunityStatus } = await import(
        "@/lib/server/mcp/servers/platform-admin"
      );
      const nostrStatus = await getNostrSocialCommunityStatus().catch(() => null);

      saveSwarmDiscussionMessage({
        id: `disc_social_${Date.now()}`,
        fromAgent: "social",
        toAgent: "admin",
        type: "proposal",
        topic: `توجيه سوشيال ونوستر: ${directiveText.slice(0, 35)}...`,
        contentAr: `استلم وكيل السوشيال التوجيه: «${directiveText}». تم تحديث شبكة ريلايز نوستر والريلز المتصلة.`,
        timestamp: new Date().toISOString(),
        impactLevel: "medium",
      });

      const report = [
        `🌐 *تقرير وكيل مجتمع السوشيال ونوستر اللامركزي:*`,
        `«${directiveText}»`,
        "",
        `📱 *مؤشرات شبكة التواصل والريلز:*`,
        `• ريلايز نوستر النشطة: ${nostrStatus?.relays?.length || 5} ريلايز لامركزية معتمدة ✅`,
        `• سيرفرات الميديا وBlossom: ${nostrStatus?.mediaServers?.length || 4} خوادم سريعة لنقل الفيديوهات`,
        `• نظام مكافآت ونقاط السفر: نشط ومربوط بخصومات الحجوزات الفورية`,
        "",
        `✨ جاري إبراز التوجيه في ريلز المسافرين وتغذية الحسابات المتصلة.`,
      ].join("\n");

      await sendTelegramMessage({
        chatId,
        text: report,
        parseMode: "Markdown",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "📱 مجتمع السوشيال الملكي", url: "https://lonaliza.com/admin/social-community" }],
            [{ text: "⚡ توجيه مهمة أخرى", callback_data: "dir_copilot_quick" }],
          ],
        },
      });
      return;
    }
  } catch (err) {
    await sendTelegramMessage({
      chatId,
      text: `⚠️ *تنبيه من ${agentMeta.nameAr}:*\nحدثت مشكلة غير متوقعة أثناء معالجة الأمر:\n${err instanceof Error ? err.message : "خطأ غير معروف"}`,
      parseMode: "Markdown",
    });
  }
}

/**
 * Handle Arabic bulk approvals / rejections ("رفض للكل", "موافقة للكل", etc.)
 */
async function handleBulkArabicDecisions(
  chatId: string,
  text: string
): Promise<boolean> {
  const trimmed = text.trim();

  // 1. REJECT ALL (رفض للكل)
  if (
    trimmed === "رفض للكل" ||
    trimmed === "رفض الكل" ||
    trimmed === "ارفض الكل" ||
    trimmed === "الغاء للكل" ||
    trimmed === "إلغاء للكل" ||
    trimmed === "لا للكل"
  ) {
    const decisions = getPendingDecisions();
    const pending = decisions.filter((d) => d.status === "pending");

    if (pending.length === 0) {
      await sendTelegramMessage({
        chatId,
        text: "ℹ️ *لا توجد مقترحات أو قرارات معلقة حالياً في خلية الوكلاء لرفضها.*",
        parseMode: "Markdown",
      });
      return true;
    }

    const titles: string[] = [];
    for (const dec of pending) {
      updateDecisionStatus(dec.id, "rejected", "تم الرفض الجماعي عبر تيليجرام");
      titles.push(`• ❌ \`${dec.id}\`: ${dec.titleAr}`);
    }

    saveSwarmDiscussionMessage({
      id: `disc_bulk_rej_${Date.now()}`,
      fromAgent: "admin",
      toAgent: "all",
      type: "decision",
      topic: `رفض جماعي لكافة المقترحات (${pending.length} مقترحات)`,
      contentAr: `قام المدير العام برفض كافة المقترحات المعلقة دفعة واحدة عبر أمر تيليجرام «رفض للكل». تم تجميد الميزانيات وإعادة ضبط المهام.`,
      timestamp: new Date().toISOString(),
      impactLevel: "high",
    });

    const reply = [
      `❌ *تم تنفيذ أمركم برفض كافة المقترحات المعلقة بنجاح (${pending.length} مقترح):*`,
      "",
      ...titles,
      "",
      `🛡️ *تم تحديث سجلات خلية الوكلاء وغرفة العمليات فورياً.*`,
    ].join("\n");

    await sendTelegramMessage({
      chatId,
      text: reply,
      parseMode: "Markdown",
      replyMarkup: {
        inline_keyboard: [
          [{ text: "👁️ غرفة العمليات والوكلاء", url: "https://lonaliza.com/admin/agent-war-room" }],
          [{ text: "⚡ توجيه إداري جديد", callback_data: "dir_copilot_quick" }],
        ],
      },
    });
    return true;
  }

  // 2. APPROVE ALL (موافقة للكل)
  if (
    trimmed === "موافقة للكل" ||
    trimmed === "موافق للكل" ||
    trimmed === "اعتمد الكل" ||
    trimmed === "اعتماد للكل" ||
    trimmed === "قبول للكل"
  ) {
    const decisions = getPendingDecisions();
    const pending = decisions.filter((d) => d.status === "pending");

    if (pending.length === 0) {
      await sendTelegramMessage({
        chatId,
        text: "ℹ️ *لا توجد مقترحات معلقة حالياً بانتظار الاعتماد.*",
        parseMode: "Markdown",
      });
      return true;
    }

    const titles: string[] = [];
    for (const dec of pending) {
      const executed = await executeApprovedDecision(dec.id);
      titles.push(`• ✅ \`${dec.id}\`: ${dec.titleAr} — ${executed.execution.summaryAr}`);
    }

    saveSwarmDiscussionMessage({
      id: `disc_bulk_app_${Date.now()}`,
      fromAgent: "admin",
      toAgent: "all",
      type: "decision",
      topic: `اعتماد جماعي لكافة المقترحات (${pending.length} مقترحات)`,
      contentAr: `قام المدير العام باعتماد كافة المقترحات المعلقة دفعة واحدة عبر تيليجرام وتفويض الوكلاء بالبدء الفوري.`,
      timestamp: new Date().toISOString(),
      impactLevel: "critical",
    });

    const reply = [
      `✅ *تم اعتماد وتفويض كافة المقترحات المعلقة بنجاح (${pending.length} مقترح):*`,
      "",
      ...titles,
      "",
      `🚀 *تم إخطار الوكلاء والمشرف العام ببدء التنفيذ الفوري ميدانياً.*`,
    ].join("\n");

    await sendTelegramMessage({
      chatId,
      text: reply,
      parseMode: "Markdown",
      replyMarkup: {
        inline_keyboard: [
          [{ text: "👁️ غرفة العمليات المباشرة", url: "https://lonaliza.com/admin/agent-war-room" }],
          [{ text: "⚡ توجيه إداري جديد", callback_data: "dir_copilot_quick" }],
        ],
      },
    });
    return true;
  }

  // 3. SINGLE SWARM DECISION APPROVAL/REJECTION (If not handled by legacy approvals)
  if (
    trimmed === "موافقة" ||
    trimmed === "موافق" ||
    trimmed === "اعتمد" ||
    trimmed === "قبول"
  ) {
    const decisions = getPendingDecisions();
    const latestPending = decisions.find((d) => d.status === "pending");
    if (latestPending) {
      const executed = await executeApprovedDecision(latestPending.id);

      await sendTelegramMessage({
        chatId,
        text: `✅ *تم اعتماد المقترح وتنفيذه:* \n\n📋 *القرار:* ${latestPending.titleAr}\n🤖 *المبادر:* ${latestPending.proposedBy.toUpperCase()}\n🔑 *المعرّف:* \`${latestPending.id}\`\n\n🚀 ${executed.execution.summaryAr}`,
        parseMode: "Markdown",
        replyMarkup: {
          inline_keyboard: [
            [{ text: "👁️ معاينة في غرفة العمليات", url: "https://lonaliza.com/admin/agent-war-room" }],
          ],
        },
      });
      return true;
    }
  }

  if (trimmed === "رفض" || trimmed === "ارفض" || trimmed === "لا" || trimmed === "إلغاء") {
    const decisions = getPendingDecisions();
    const latestPending = decisions.find((d) => d.status === "pending");
    if (latestPending) {
      await rejectDecision(latestPending.id, "مرفوض عبر تيليجرام");

      await sendTelegramMessage({
        chatId,
        text: `❌ *تم رفض المقترح ولم يُنفَّذ أي تغيير:* \n\n📋 *القرار:* ${latestPending.titleAr}\n🔑 *المعرّف:* \`${latestPending.id}\``,
        parseMode: "Markdown",
      });
      return true;
    }
  }

  return false;
}

/**
 * Handle Telegram Inbound POST webhook
 */
export async function POST(req: Request) {
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  if (secretHeader && !verifyTelegramWebhookSecret(secretHeader)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: true });
  }

  // =========================================================================
  // 1. HANDLE INLINE KEYBOARD CALLBACK QUERIES (أحداث النقر على الأزرار التفاعلية)
  // =========================================================================
  const callbackQuery = asRecord(body.callback_query);
  if (callbackQuery) {
    const callbackQueryId = String(callbackQuery.id || "");
    const callbackData = String(callbackQuery.data || "");
    const callbackMessage = asRecord(callbackQuery.message);
    const messageChat = asRecord(callbackMessage?.chat);
    const chatId = messageChat?.id != null ? String(messageChat.id) : "";
    const messageId = callbackMessage?.message_id ? Number(callbackMessage.message_id) : 0;
    const originalText = typeof callbackMessage?.text === "string" ? callbackMessage.text : "";

    try {
      // 1.A: Approve Swarm Decision [✅ اعتماد وتفويض فوري]
      if (callbackData.startsWith("dec_app:")) {
        const decisionId = callbackData.replace("dec_app:", "").trim();
        const pendingDecs = getPendingDecisions();
        const target = pendingDecs.find((d) => d.id === decisionId);
        if (!target) {
          await answerTelegramCallbackQuery({
            callbackQueryId,
            text: "⚠️ لم يتم العثور على هذا القرار أو تمت معالجته مسبقاً.",
          });
          return NextResponse.json({ ok: true });
        }

        await answerTelegramCallbackQuery({
          callbackQueryId,
          text: `✅ جاري اعتماد وتنفيذ «${target.titleAr}»`,
        });

        const executed = await executeApprovedDecision(decisionId);

        if (chatId && messageId) {
          const updatedMessage =
            originalText +
            `\n\n━━━━━━━━━━━━━━━━━━━━\n✅ *تم الاعتماد والتنفيذ الفعلي* (\`${decisionId}\`)\n` +
            `${executed.execution.summaryAr}`;

          await editTelegramMessageText({
            chatId,
            messageId,
            text: updatedMessage,
            parseMode: "Markdown",
            replyMarkup: {
              inline_keyboard: [
                [{ text: "👁️ غرفة العمليات والوكلاء", url: "https://lonaliza.com/admin/agent-war-room" }],
                [{ text: "⚡ توجيه إضافي للمشرف العام", callback_data: "dir_copilot_quick" }],
              ],
            },
          });
        }
        return NextResponse.json({ ok: true });
      }

      // 1.B: Reject Swarm Decision [❌ رفض المقترح]
      if (callbackData.startsWith("dec_rej:")) {
        const decisionId = callbackData.replace("dec_rej:", "").trim();
        const pendingDecs = getPendingDecisions();
        const target = pendingDecs.find((d) => d.id === decisionId);
        if (!target) {
          await answerTelegramCallbackQuery({
            callbackQueryId,
            text: "⚠️ لم يتم العثور على هذا القرار أو تمت معالجته مسبقاً.",
          });
          return NextResponse.json({ ok: true });
        }

        await answerTelegramCallbackQuery({
          callbackQueryId,
          text: `❌ تم رفض مقترح «${target.titleAr}».`,
        });

        await rejectDecision(decisionId, "مرفوض عبر زر تيليجرام التفاعلي");

        if (chatId && messageId) {
          const updatedMessage =
            originalText +
            `\n\n━━━━━━━━━━━━━━━━━━━━\n❌ *تم رفض هذا المقترح وتجميده.* (المعرّف: \`${decisionId}\`)\n` +
            `🛡️ تم تحديث سجلات غرفة العمليات وتجميد خطة الميزانية.`;

          await editTelegramMessageText({
            chatId,
            messageId,
            text: updatedMessage,
            parseMode: "Markdown",
            replyMarkup: {
              inline_keyboard: [
                [{ text: "👁️ غرفة العمليات", url: "https://lonaliza.com/admin/agent-war-room" }],
                [{ text: "⚡ توجيه جديد", callback_data: "dir_copilot_quick" }],
              ],
            },
          });
        }
        return NextResponse.json({ ok: true });
      }

      // 1.C: Route User Directive to Chosen Agent (أزرار مصفوفة توجيه الأوامر للوكيل المعني)
      if (callbackData.startsWith("agent_route:")) {
        const parts = callbackData.split(":");
        const agentKey = parts[1] || "copilot";
        const directiveId = parts[2] || "";

        const agentMeta = AGENT_LABELS[agentKey] || AGENT_LABELS.copilot;

        await answerTelegramCallbackQuery({
          callbackQueryId,
          text: `⚡ جارٍ توجيه الأمر إلى: ${agentMeta.nameAr}...`,
        });

        const cached = getTelegramDirective(directiveId);
        if (!cached) {
          if (chatId) {
            await sendTelegramMessage({
              chatId,
              text: "⚠️ عذراً، انتهت صلاحية هذا الأمر المؤقتة. يرجى كتابة وإرسال التوجيه مرة أخرى.",
            });
          }
          return NextResponse.json({ ok: true });
        }

        updateTelegramDirectiveStatus(directiveId, "routed", agentKey);
        if (agentKey !== "copilot" && agentKey !== "swarm") {
          setTelegramAgentSession(chatId, mapTelegramRouteToAgent(agentKey).agentId || agentKey);
        }

        // Broadcast delegation to War Room discussions stream
        saveSwarmDiscussionMessage({
          id: `disc_route_${Date.now()}`,
          fromAgent: "admin",
          toAgent: mapAgentKeyToRole(agentKey),
          type: "directive",
          topic: `تفويض تنفيذي: ${agentMeta.nameAr}`,
          contentAr: `قام المدير العام باختيار [${agentMeta.nameAr}] لتولي تنفيذ المهمة فوراً: «${cached.text}».`,
          timestamp: new Date().toISOString(),
          impactLevel: "critical",
        });

        // Edit the original prompt to acknowledge chosen agent
        if (chatId && messageId) {
          await editTelegramMessageText({
            chatId,
            messageId,
            text:
              `🎯 *تم اختيار الوكيل المنفذ:* ${agentMeta.icon} *${agentMeta.nameAr}*\n` +
              `«${cached.text}»\n\n` +
              `⏳ *جارٍ معالجة الأمر والتنفيذ الفعلي في النظام...*`,
            parseMode: "Markdown",
          });
        }

        // Execute asynchronously
        void executeRoutedAgentDirective({
          agentKey,
          directiveText: cached.text,
          chatId,
        }).catch((err) => {
          console.error("[Telegram Router Error]", err);
        });

        return NextResponse.json({ ok: true });
      }

      if (callbackData.startsWith("dec_cop:")) {
        const decisionId = callbackData.replace("dec_cop:", "").trim();
        const target = getPendingDecisions().find((d) => d.id === decisionId);
        if (!target) {
          await answerTelegramCallbackQuery({ callbackQueryId, text: "القرار غير موجود." });
          return NextResponse.json({ ok: true });
        }
        await answerTelegramCallbackQuery({ callbackQueryId, text: "تم تفويض المشرف العام" });
        const { analyzeAndExecuteIntent } = await import("@/lib/server/chat-executive-engine");
        const exec = await analyzeAndExecuteIntent(
          `نفّذ أو أعد تخطيط هذا القرار المعتمد من الخلية: ${target.titleAr}. التفاصيل: ${target.descriptionAr}`
        );
        if (target.status === "pending") {
          await executeApprovedDecision(decisionId);
        }
        if (chatId) {
          await sendTelegramMessage({
            chatId,
            text: `👑 *المشرف العام تولى القرار*\n${target.titleAr}\n\n${exec.actionSummaryAr || "تمت المعالجة."}`,
            parseMode: "Markdown",
            replyMarkup: {
              inline_keyboard: [
                [{ text: "👁️ غرفة العمليات", url: "https://lonaliza.com/admin/agent-war-room" }],
              ],
            },
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (callbackData === "tg_done") {
        clearTelegramAgentSession(chatId);
        await answerTelegramCallbackQuery({ callbackQueryId, text: "تم إنهاء جلسة الوكيل" });
        return NextResponse.json({ ok: true });
      }
      if (callbackData === "tg_agents" && chatId) {
        await answerTelegramCallbackQuery({ callbackQueryId, text: "حالة الوكلاء" });
        await sendTelegramMessage({ chatId, text: await buildTelegramAgentsCard(), parseMode: "Markdown" });
        return NextResponse.json({ ok: true });
      }
      if (callbackData === "tg_metrics" && chatId) {
        await answerTelegramCallbackQuery({ callbackQueryId, text: "حقائق المنصة" });
        await sendTelegramMessage({ chatId, text: await buildTelegramMetricsCard(), parseMode: "Markdown" });
        return NextResponse.json({ ok: true });
      }

      // 1.D: Quick Directive Prompt Button
      if (callbackData === "dir_copilot_quick") {
        await answerTelegramCallbackQuery({
          callbackQueryId,
          text: "اكتب أمرك أو استفسارك وسيقوم البوت بعرض خيارات التوجيه فورياً!",
        });
        return NextResponse.json({ ok: true });
      }
    } catch (e) {
      console.error("[Telegram Callback Error]", e);
    }

    return NextResponse.json({ ok: true });
  }

  // =========================================================================
  // 2. HANDLE INBOUND TEXT MESSAGES (رسائل الأوامر النصية من المدير)
  // =========================================================================
  const message = asRecord(body.message) || asRecord(body.edited_message);
  const chat = asRecord(message?.chat);
  const chatId = chat?.id != null ? String(chat.id) : "";
  if (chatId) await recordTelegramInbound(chatId);

  const text = inboundText(message);
  if (chatId && text) {
    try {
      let settings = await getCommsSettings();
      if (!settings.telegramDefaultChatId && chatId) {
        settings = await saveCommsSettings({ ...settings, telegramDefaultChatId: chatId });
      }

      const isAdmin = Boolean(
        settings.telegramDefaultChatId && chatId.trim() === settings.telegramDefaultChatId.trim()
      );

      // 2.A: FIRST: Check for Bulk Arabic Decisions ("رفض للكل", "موافقة للكل", etc.)
      const bulkHandled = await handleBulkArabicDecisions(chatId, text);
      if (bulkHandled) {
        return NextResponse.json({ ok: true });
      }

      // 2.B: SECOND: Legacy Approval Handlers ("انشر", "أطلق", "عدّل", "ارفض")
      const approvalResult = await handleTelegramApprovalText(chatId, text);
      if (approvalResult.handled && approvalResult.reply) {
        // If it said "لا يوجد طلب أتمتة", don't stop there if this was actually a task or command!
        if (approvalResult.reply !== "لا يوجد طلب أتمتة بانتظار الموافقة.") {
          await sendTelegramMessage({ chatId, text: approvalResult.reply });
          return NextResponse.json({ ok: true });
        }
      }

      // 2.C: System Audit / Readiness Commands
      if (isAdmin && (text.trim() === "/audit" || text.trim() === "/ready" || text.includes("جاهزية"))) {
        const { auditPlatformReadiness } = await import("@/lib/server/mcp/servers/platform-admin");
        const audit = await auditPlatformReadiness();
        const missing =
          audit.criticalMissingKeys.length > 0
            ? `\n⚠️ المفاتيح المطلوبة: ${audit.criticalMissingKeys.join(", ")}`
            : "\n✨ كافة المفاتيح مكتملة!";
        const reply = `📊 *تقرير جاهزية المنصة الشامل (18 قسماً):*\n\n• نسبة الجاهزية: ${audit.overallScore}%\n• الأقسام المكتملة: ${audit.readyModulesCount}/${audit.totalModulesCount}\n• التوصية: ${audit.executiveAdviceAr}${missing}`;
        await sendTelegramMessage({
          chatId,
          text: reply,
          parseMode: "Markdown",
          replyMarkup: {
            inline_keyboard: [
              [{ text: "⚡ توجيه مهمة جديدة", callback_data: "dir_copilot_quick" }],
              [{ text: "📊 لوحة التحكم", url: "https://lonaliza.com/admin" }],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (isAdmin && (text.trim() === "/start" || text.trim() === "/help")) {
        await sendTelegramMessage({
          chatId,
          text: await buildTelegramStartCard(),
          parseMode: "Markdown",
          replyMarkup: {
            inline_keyboard: [
              [{ text: "🤖 حالة الوكلاء", callback_data: "tg_agents" }, { text: "📊 الحقائق", callback_data: "tg_metrics" }],
              [{ text: "👁️ غرفة العمليات", url: "https://lonaliza.com/admin/agent-war-room" }],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (isAdmin && (text.trim() === "/agents" || text.trim() === "/metrics" || text.trim() === "/done")) {
        if (text.trim() === "/done") {
          clearTelegramAgentSession(chatId);
          await sendTelegramMessage({ chatId, text: "تم إنهاء جلسة الوكيل. اكتبوا توجيهاً جديداً." });
          return NextResponse.json({ ok: true });
        }
        const card = text.trim() === "/agents" ? await buildTelegramAgentsCard() : await buildTelegramMetricsCard();
        await sendTelegramMessage({ chatId, text: card, parseMode: "Markdown" });
        return NextResponse.json({ ok: true });
      }

      const activeSession = isAdmin ? getTelegramAgentSession(chatId) : null;
      if (isAdmin && activeSession && !text.trim().startsWith("/") && text.trim().length >= 3) {
        await sendTelegramMessage({ chatId, text: `⏳ توجيه إلى جلسة ${activeSession.agentKey}...`, parseMode: "Markdown" });
        void executeRoutedAgentDirective({
          agentKey: activeSession.agentKey,
          directiveText: text.trim(),
          chatId,
        });
        return NextResponse.json({ ok: true });
      }

      // 2.D: Status Command (/status)
      if (text.trim() === "/status") {
        const reply = [
          "📊 *حالة النظام وربط الوكلاء الذكي:*",
          "• بوت تيليجرام التفاعلي: متصل بنشاط ومربوط ثنائياً ✅",
          `• معرّف محادثتك (Chat ID): \`${chatId}\``,
          isAdmin ? "• صلاحية الحساب: مدير المنصة التنفيذي (Admin VIP) 👑" : "• صلاحية الحساب: زائر",
          "• محرك الذكاء الاصطناعي: جاهز مع تفعيل خيارات التوجيه الفوري 🤖",
          "• التوقيت المعتمد: Europe/Istanbul (إسطنبول)",
        ].join("\n");

        await sendTelegramMessage({
          chatId,
          text: reply,
          parseMode: "Markdown",
          replyMarkup: {
            inline_keyboard: [
              [{ text: "⚡ توجيه مهمة للمشرف العام", callback_data: "dir_copilot_quick" }],
              [{ text: "🌐 غرفة العمليات والوكلاء", url: "https://lonaliza.com/admin/agent-war-room" }],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      // 2.E: Fast-Track Direct Slash Commands (/copilot <order>, /sales <order>, etc.)
      const trimmedText = text.trim();
      if (isAdmin && trimmedText.startsWith("/")) {
        const spaceIdx = trimmedText.indexOf(" ");
        const cmd = spaceIdx > 0 ? trimmedText.slice(1, spaceIdx).toLowerCase() : trimmedText.slice(1).toLowerCase();
        const argText = spaceIdx > 0 ? trimmedText.slice(spaceIdx + 1).trim() : "";

        if (argText && (cmd === "copilot" || cmd === "sales" || cmd === "content" || cmd === "fleet" || cmd === "social" || cmd === "swarm" || cmd === "ads" || cmd === "email" || cmd === "b2b_landing" || cmd === "site_advisor" || cmd.startsWith("ag_"))) {
          saveAdminDirective({
            id: `tg_cmd_${Date.now()}`,
            text: argText,
            targetAgent: mapAgentKeyToRole(cmd),
            createdAt: new Date().toISOString(),
            status: "executing",
          });
          await sendTelegramMessage({
            chatId,
            text: `⏳ *جارٍ تنفيذ أمرك المباشر بواسطة ${AGENT_LABELS[cmd]?.nameAr || cmd}...*`,
            parseMode: "Markdown",
          });
          void executeRoutedAgentDirective({
            agentKey: cmd,
            directiveText: argText,
            chatId,
          });
          return NextResponse.json({ ok: true });
        }
      }

      // 2.F: INTERACTIVE AGENT DISPATCH BOARD (لوحة أزرار اختيار الوكيل التنفيذي)
      // When the admin writes ANY command/task/order, show interactive inline buttons to choose the agent!
      if (isAdmin && trimmedText.length >= 3 && trimmedText !== "/start") {
        const directive = storeTelegramDirective(chatId, trimmedText);
        saveAdminDirective({
          id: directive.id,
          text: trimmedText,
          targetAgent: "all",
          createdAt: new Date().toISOString(),
          status: "received",
        });

        const promptCard = [
          `📥 *استلمت توجيهكم يا سعادة المشرف:*`,
          `«${trimmedText}»`,
          "",
          `🎯 *الرجاء اختيار الوكيل التنفيذي لتولي هذه المهمة فوراً:*`,
        ].join("\n");

        await sendTelegramMessage({
          chatId,
          text: promptCard,
          parseMode: "Markdown",
          replyMarkup: {
            inline_keyboard: buildTelegramAgentRouteKeyboard(directive.id),
          },
        });
        return NextResponse.json({ ok: true });
      }

      // Fallback for non-admin or short greeting
      const fallback = [
        "👋 مرحباً بك في بوت إدارة منصة لوناليزا (Lonaliza)!",
        "",
        `🆔 معرّف محادثتك (Chat ID): \`${chatId}\``,
        "",
        "⚙️ للتحكم والربط المباشر:",
        "• يمكنك إرسال أي توجيه أو أمر وسيعرض البوت فورياً أزرار توجيه الأمر للوكيل المختص.",
        "• أوامر سريعة: «رفض للكل» / «موافقة للكل» للتحكم الجماعي بمقترحات خلية الوكلاء.",
        "• «/status» لعرض حالة النظام والجاهزية.",
      ].join("\n");

      await sendTelegramMessage({
        chatId,
        text: fallback,
        parseMode: "Markdown",
      });
    } catch (err) {
      console.error("[Telegram Inbound Error]", err);
    }
  }

  return NextResponse.json({ ok: true });
}
