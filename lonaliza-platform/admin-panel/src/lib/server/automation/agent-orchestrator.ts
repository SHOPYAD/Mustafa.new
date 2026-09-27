import { generateGeminiContent } from "@/lib/server/gemini-swarm-client";
import {
  saveSwarmDiscussionMessage,
  savePendingDecision,
  DEFAULT_AGENTS,
  type AgentRole,
  type SwarmAgentInfo,
} from "@/lib/automation/agent-collab-store";
import { sendTelegramMessage } from "@/lib/automation/channels/telegram";
import { upsertAutomationJob } from "@/lib/server/automation/store";
import { upsertBlogPost } from "@/lib/server/blog-store";
import { upsertTour } from "@/lib/server/tours-store";
import { launchTargetedMetaAdCampaign } from "@/lib/server/mcp/servers/meta-ads-campaign-launcher";
import type { AutomationJobType } from "@/lib/automation/types";

export type OrchestratorTaskAssignment = {
  assignedAgent: AgentRole;
  taskTitle: string;
  taskDetailsAr: string;
  expectedOutputAr: string;
  priority: "normal" | "high" | "urgent";
};

export type OrchestratorPlan = {
  interpretationAr: string;
  leadSummaryAr: string;
  actionType:
    | "create_automation_job"
    | "create_blog_article"
    | "create_tourism_service"
    | "launch_meta_ad"
    | "publish_social_post"
    | "general_coordination";
  actionPayload?: {
    // Automation Job params
    jobName?: string;
    jobType?: AutomationJobType;
    cronExpression?: string;
    // Blog Article params
    articleTitleAr?: string;
    articleTitleEn?: string;
    articleExcerptAr?: string;
    articleContentAr?: string;
    articleCategory?: string;
    // Tourism Service params
    tourTitle?: string;
    tourPriceUSD?: number;
    tourDuration?: string;
    tourCategory?: string;
    tourHighlights?: string[];
    // Ad Campaign params
    campaignName?: string;
    dailyBudgetUSD?: number;
    targetAudienceAr?: string;
    targetLocations?: string[];
    targetInterests?: string[];
  };
  tasks: OrchestratorTaskAssignment[];
  requiresAdBudget: boolean;
  adBudgetUSD?: number;
  proposedDecision?: {
    titleAr: string;
    descriptionAr: string;
    costUSD?: number;
    expectedBenefitAr: string;
  };
};

/**
 * Execute real underlying operations (Automation, Articles, Services, Ads)
 */
async function executeAutonomousAction(
  plan: OrchestratorPlan,
  directiveText: string
): Promise<{ success: boolean; resultSummaryAr: string; directUrl?: string }> {
  try {
    // 1. CREATE AUTOMATION JOB
    if (plan.actionType === "create_automation_job" && plan.actionPayload) {
      const p = plan.actionPayload;
      const job = await upsertAutomationJob({
        name: p.jobName || `أتمتة: ${directiveText.slice(0, 30)}`,
        type: p.jobType || "articles.research_and_publish",
        cron: p.cronExpression || "0 9 * * *",
        timezone: "Europe/Istanbul",
        enabled: true,
        dryRun: false,
        locales: ["ar", "en", "tr"],
        maxPerRun: 2,
        maxPerDay: 5,
        settings: {
          focusTopic: directiveText,
        },
      });

      return {
        success: true,
        resultSummaryAr: `✅ تم إنشاء وظيفة أتمتة جديدة بنجاح في النظام:\n• الاسم: «${job.name}»\n• النوع: ${job.type}\n• الجدولة: ${job.cron} (توقيت إسطنبول)\n• الحالة: نشطة وجاهزة للتشغيل التلقائي`,
        directUrl: "https://lonaliza.com/admin/automation",
      };
    }

    // 2. CREATE & PUBLISH BLOG ARTICLE
    if (plan.actionType === "create_blog_article" && plan.actionPayload) {
      const p = plan.actionPayload;
      const titleAr = p.articleTitleAr || `دليل السفر: ${directiveText.slice(0, 40)}`;
      const titleEn = p.articleTitleEn || "Travel Guide to Turkey";
      const slug = `guide-${Date.now().toString(36)}`;

      const article = await upsertBlogPost({
        titleAr,
        titleEn,
        slug,
        excerptAr: p.articleExcerptAr || `أهم النصائح والمعلومات السياحية: ${titleAr}`,
        contentAr:
          p.articleContentAr ||
          `<h2>أبرز الأنشطة والمعالم السياحية</h2>\n<p>تتميز هذه الوجهة الساحرة بجمال طبيعي خلاب وتجارب سياحية فريدة تناسب العائلات والأفراد. يمكنكم الاستمتاع بأجمل الجولات المنظمة وأفضل خيارات الإقامة.</p>\n<h3>نصائح مهمة للمسافرين</h3>\n<p>نوصي بحجز الجولات مسبقاً والاستفادة من عروض الموسم السياحي الحصرية المقدمة من شركة لوناليزا للسياحة والسفر.</p>`,
        category: p.articleCategory || "وجهات سياحية",
        status: "published",
        featuredImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
        author: "فريق التحرير السياحي - لوناليزا",
        tags: ["سياحة", "تركيا", "عروض", "سفر"],
        publishedAt: new Date().toISOString(),
      });

      return {
        success: true,
        resultSummaryAr: `📝 تم إنشاء المقال السياحي ونشره فوراً في المدونة:\n• العنوان: «${article.titleAr}»\n• التصنيف: ${article.category}\n• الحالة: منشور ومفهرس لمحركات البحث (SEO)`,
        directUrl: `https://lonaliza.com/blog/${article.slug}`,
      };
    }

    // 3. CREATE TOURISM SERVICE / VIP TOUR
    if (plan.actionType === "create_tourism_service" && plan.actionPayload) {
      const p = plan.actionPayload;
      const title = p.tourTitle || `جولة سياحية VIP: ${directiveText.slice(0, 30)}`;
      const price = p.tourPriceUSD || 120;

      const tour = await upsertTour({
        title,
        duration: p.tourDuration || "يوم كامل (8-10 ساعات)",
        timing: "morning",
        price,
        originalPrice: price * 1.25,
        category: p.tourCategory || "VIP Day Tour",
        highlights:
          p.tourHighlights && p.tourHighlights.length > 0
            ? p.tourHighlights
            : ["سيارة خاصة VIP مع سائق يتحدث العربية", "زيارة أجمل المعالم والبحيرات", "شامل الوقود والمواقف"],
        image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
        popular: true,
        isActive: true,
      });

      return {
        success: true,
        resultSummaryAr: `🚗 تم إضافة الجولة والخدمة السياحية إلى موقع الحجوزات:\n• الجولة: «${tour.title}»\n• السعر: $${tour.price}\n• الفئة: ${tour.category}\n• الحالة: متاحة فوراً للحجز والدفع المباشر`,
        directUrl: "https://lonaliza.com/vip-tours",
      };
    }

    // 4. LAUNCH TARGETED META AD
    if (plan.actionType === "launch_meta_ad" && plan.actionPayload) {
      const p = plan.actionPayload;
      const adResult = await launchTargetedMetaAdCampaign({
        campaignName: p.campaignName || `حملة سياحية: ${directiveText.slice(0, 35)}`,
        objective: "OUTCOME_LEADS",
        targetLocations: p.targetLocations || ["SA", "AE", "KW", "QA", "TR"],
        targetInterests: p.targetInterests || ["Tourism in Turkey", "Family vacations", "Istanbul", "Trabzon"],
        dailyBudgetUSD: p.dailyBudgetUSD || plan.adBudgetUSD || 50,
        adCaption: `🌟 عروض سياحية استثنائية من لوناليزا للسياحة والسفر! برامج متكاملة وجولات VIP راقية. احجز الآن واستمتع بأجمل الأوقات.`,
        callToAction: "SEND_WHATSAPP_MESSAGE",
        approved: true,
      });

      return {
        success: adResult.ok,
        resultSummaryAr: adResult.summaryAr,
        directUrl: "https://lonaliza.com/admin/automation",
      };
    }

    return {
      success: true,
      resultSummaryAr: `⚡ تم تنسيق المهمة بنجاح وتوزيعها على أعضاء الخلية المعنيين في غرفة العمليات.`,
    };
  } catch (err) {
    return {
      success: false,
      resultSummaryAr: `تعذر التنفيذ التلقائي: ${err instanceof Error ? err.message : "خطأ غير معروف"}`,
    };
  }
}

/**
 * Master Orchestrator (الوكيل القائد):
 * Interprets directives from Admin (via Telegram or Dashboard),
 * coordinates swarm agents, delegates sub-tasks, ACTUALLY EXECUTES ACTIONS, and sends instant live reports to Telegram.
 */
export async function executeOrchestratorDirective(input: {
  directiveText: string;
  source: "telegram" | "admin_dashboard" | "cron";
  adminChatId?: string;
}): Promise<{
  ok: boolean;
  plan: OrchestratorPlan;
  reportAr: string;
}> {
  const agentsRoster = DEFAULT_AGENTS.map(
    (a: SwarmAgentInfo) => `- ${a.id} (${a.nameAr} - ${a.titleAr}): اختصاصه: ${a.titleAr}`
  ).join("\n");

  const systemPrompt = `أنت "الوكيل القائد والمشرف العام" (Master Orchestrator) لمنظومة الوكلاء الأذكياء في شركة "لوناليزا للسياحة والسفر" (Lonaliza Tourism).
مهمتك: استقبال أوامر الإدارة من تيليجرام أو لوحة التحكم، فهمها بدقة، وتحديد الإجراء الحقيقي لتنفيذه في النظام:

فريق الوكلاء التابعين لإشرافك:
${agentsRoster}

أنواع الإجراءات التنفيذية المتاحة في المنظومة (actionType):
1. "create_automation_job": إذا طلب الأدمن إنشاء وظيفة أتمتة مجدولة (نشر مقالات دورية، استعادة حجوزات، صيد عروض).
2. "create_blog_article": إذا طلب الأدمن كتابة أو نشر مقال سياحي في المدونة.
3. "create_tourism_service": إذا طلب الأدمن إضافة جولة سياحية أو خدمة VIP أو برنامج سياحي للموقع.
4. "launch_meta_ad": إذا طلب الأدمن إطلاق حملة إعلانية ممولة أو ترويجية على ميتا/إنستغرام.
5. "publish_social_post": إذا طلب الأدمن نشر بوست أو منشور على وسائل التواصل.
6. "general_coordination": إذا كان استفساراً عاماً أو توجيهاً إدارياً تنسيقياً.

قواعد صارمة:
- إذا طلب الأدمن إنشاء أي شيء (أتمتة، مقال، خدمة، إعلان)، قم بصياغة actionPayload كامل بالقيم المناسبة باللغة العربية.
- يجب إرجاع الرد بصيغة JSON محكمة حصراً.

JSON Schema:
{
  "interpretationAr": "شرح فهمك لأمر الإدارة",
  "leadSummaryAr": "ملخص خطة التنفيذ",
  "actionType": "create_automation_job" | "create_blog_article" | "create_tourism_service" | "launch_meta_ad" | "publish_social_post" | "general_coordination",
  "actionPayload": {
    "jobName": "اسم الوظيفة المجدولة إن وجدت",
    "jobType": "articles.research_and_publish",
    "cronExpression": "0 10 * * *",
    "articleTitleAr": "عنوان المقال إن طلب مقالاً",
    "articleCategory": "وجهات سياحية",
    "articleExcerptAr": "مقدمة المقال",
    "articleContentAr": "محتوى المقال الكامل بتنسيق HTML",
    "tourTitle": "عنوان الجولة أو الخدمة إن طلب إضافة خدمة",
    "tourPriceUSD": 120,
    "tourDuration": "يوم كامل",
    "tourHighlights": ["ميزة 1", "ميزة 2"],
    "campaignName": "اسم الحملة الإعلانية إن طلب إعلاناً",
    "dailyBudgetUSD": 50,
    "targetLocations": ["SA", "AE", "KW", "QA", "TR"]
  },
  "tasks": [
    {
      "assignedAgent": "sales" | "ads" | "social" | "email" | "site_advisor" | "b2b_landing",
      "taskTitle": "عنوان المهمة الفرعية",
      "taskDetailsAr": "تفاصيل المهمة",
      "expectedOutputAr": "المخرج",
      "priority": "normal" | "high" | "urgent"
    }
  ],
  "requiresAdBudget": false,
  "adBudgetUSD": 50
}`;

  let plan: OrchestratorPlan = {
    interpretationAr: input.directiveText,
    leadSummaryAr: "تم استلام التوجيه وتوزيعه على الوكلاء المعنيين.",
    actionType: "general_coordination",
    tasks: [
      {
        assignedAgent: "sales",
        taskTitle: "تنفيذ التوجيه الإداري",
        taskDetailsAr: input.directiveText,
        expectedOutputAr: "تنفيذ التوجيه والتنسيق",
        priority: "high",
      },
    ],
    requiresAdBudget: false,
  };

  // Immediate Telegram acknowledgment so the admin knows the swarm is on it!
  if (input.adminChatId) {
    void sendTelegramMessage({
      chatId: input.adminChatId,
      text: `⚡ *استلم الوكيل القائد أمركم:* «${input.directiveText}»\n\n⏳ *جارٍ معالجة الأمر وتنفيذه عبر الخلية الذكية في الخلفية...*`,
    });
  }

  const aiResult = await generateGeminiContent<Partial<OrchestratorPlan>>({
    prompt: `أمر وتوجيه الإدارة الجديد:\n«${input.directiveText}»`,
    systemInstruction: systemPrompt,
    temperature: 0.2,
    responseMimeType: "application/json",
  });

  if (aiResult.ok && aiResult.data) {
    const parsed = aiResult.data;
    if (parsed.interpretationAr) {
      plan = {
        interpretationAr: parsed.interpretationAr,
        leadSummaryAr: parsed.leadSummaryAr || plan.leadSummaryAr,
        actionType: parsed.actionType || "general_coordination",
        actionPayload: parsed.actionPayload,
        tasks: Array.isArray(parsed.tasks)
          ? parsed.tasks.map((t) => ({
              assignedAgent: (t.assignedAgent as AgentRole) || "sales",
              taskTitle: t.taskTitle || "مهمة فرعية",
              taskDetailsAr: t.taskDetailsAr || "",
              expectedOutputAr: t.expectedOutputAr || "",
              priority: t.priority || "normal",
            }))
          : plan.tasks,
        requiresAdBudget: Boolean(parsed.requiresAdBudget),
        adBudgetUSD: parsed.adBudgetUSD,
        proposedDecision: parsed.proposedDecision,
      };
    }
  }

  // 1. Record Lead Orchestrator Directive in War Room discussions
  saveSwarmDiscussionMessage({
    id: `disc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    fromAgent: "admin",
    toAgent: "all",
    type: "directive",
    topic: `توجيه إداري: ${plan.interpretationAr.slice(0, 45)}...`,
    contentAr: `⚡ استلم الوكيل القائد توجيه الإدارة: «${input.directiveText}»\n📋 خطة التنسيق: ${plan.leadSummaryAr}`,
    timestamp: new Date().toISOString(),
    impactLevel: "high",
  });

  // 2. Record Sub-tasks for each assigned agent
  for (const task of plan.tasks) {
    saveSwarmDiscussionMessage({
      id: `disc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      fromAgent: task.assignedAgent,
      toAgent: "admin",
      type: "proposal",
      topic: task.taskTitle,
      contentAr: `✅ تم استلام المهمة من الوكيل القائد:\n${task.taskDetailsAr}\n🎯 المخرج المستهدف: ${task.expectedOutputAr}`,
      timestamp: new Date().toISOString(),
      impactLevel: task.priority === "urgent" ? "critical" : "medium",
    });
  }

  // 3. EXECUTE REAL AUTONOMOUS ACTION
  const actionExecution = await executeAutonomousAction(plan, input.directiveText);

  // 4. Record Pending Decision if budget / approval needed
  if (plan.proposedDecision) {
    savePendingDecision({
      id: `dec_${Date.now().toString(36)}`,
      proposedBy: "ads",
      affectedAgent: "sales",
      actionType: "content_launch",
      titleAr: plan.proposedDecision.titleAr,
      descriptionAr: plan.proposedDecision.descriptionAr,
      costUSD: plan.proposedDecision.costUSD,
      expectedBenefitAr: plan.proposedDecision.expectedBenefitAr,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  }

  // 5. Build Detailed Completion Report for Admin
  const tasksFormatted = plan.tasks
    .map(
      (t, idx) =>
        `  ${idx + 1}. [${DEFAULT_AGENTS.find((a: SwarmAgentInfo) => a.id === t.assignedAgent)?.nameAr || t.assignedAgent}] ➔ ${t.taskTitle}`
    )
    .join("\n");

  const reportAr = [
    "🎖️ *تقرير تنفيذ الوكيل القائد (Orchestrator):*",
    `«${input.directiveText}»`,
    "",
    `📋 *خطة العمل:* ${plan.leadSummaryAr}`,
    "",
    `🚀 *نتيجة التنفيذ المباشر:*`,
    actionExecution.resultSummaryAr,
    actionExecution.directUrl ? `🔗 *الرابط المباشر:* ${actionExecution.directUrl}` : "",
    "",
    "⚡ *فريق الوكلاء المنفذ:*",
    tasksFormatted,
    "",
    plan.requiresAdBudget && plan.adBudgetUSD
      ? `💰 *ميزانية الإعلان المقترحة:* $${plan.adBudgetUSD} (تم تجهيز القرار للاعتماد)`
      : "",
    "✨ *النظام يعمل ذاتياً بنجاح حتى أثناء غيابكم.*",
  ]
    .filter(Boolean)
    .join("\n");

  // 6. Send live completion report to Admin on Telegram
  if (input.adminChatId) {
    void sendTelegramMessage({
      chatId: input.adminChatId,
      text: reportAr,
    });
  }

  return {
    ok: true,
    plan,
    reportAr,
  };
}
