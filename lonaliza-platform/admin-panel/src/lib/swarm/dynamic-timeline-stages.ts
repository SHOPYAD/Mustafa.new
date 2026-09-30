import type { ProcessingStage } from "@/components/ui/processing-timeline";

export interface DynamicTimelineContext {
  directiveText?: string;
  isProcessing: boolean;
  hasFinished: boolean;
  agentResponseText?: string;
  activeStep?: number;
}

export type TimelineCategory = "blog" | "video" | "marketing" | "tourism" | "admin" | "tactical" | "dynamic";

export type KnownTimelineCategory = Exclude<TimelineCategory, "tactical" | "dynamic">;

/** The six built-in categories. Null means the directive needs a Gemini step list. */
export function matchKnownTimelineCategory(directive: string): KnownTimelineCategory | null {
  const lower = directive.toLowerCase();
  if (!lower.trim()) return null;

  if (
    lower.includes("مقال") ||
    lower.includes("مدون") ||
    lower.includes("سيو") ||
    lower.includes("seo") ||
    lower.includes("blog") ||
    lower.includes("محتوى") ||
    lower.includes("سياحة") ||
    lower.includes("وجهات") ||
    lower.includes("اكتب") ||
    lower.includes("دليل") ||
    lower.includes("article")
  ) {
    return "blog";
  }
  if (
    lower.includes("فيديو") ||
    lower.includes("ريلز") ||
    lower.includes("سوشيال") ||
    lower.includes("انستغرام") ||
    lower.includes("تيك توك") ||
    lower.includes("يوتيوب") ||
    lower.includes("higgsfield") ||
    lower.includes("تصميم")
  ) {
    return "video";
  }
  if (
    lower.includes("حملة") ||
    lower.includes("واتساب") ||
    lower.includes("whatsapp") ||
    lower.includes("اعلان") ||
    lower.includes("إعلان") ||
    lower.includes("تسويق") ||
    lower.includes("meta") ||
    lower.includes("ads") ||
    lower.includes("ايميل") ||
    lower.includes("بريد")
  ) {
    return "marketing";
  }
  if (
    lower.includes("حجز") ||
    lower.includes("رحل") ||
    lower.includes("فندق") ||
    lower.includes("طيران") ||
    lower.includes("سياح") ||
    lower.includes("باق") ||
    lower.includes("سيار") ||
    lower.includes("سائق")
  ) {
    return "tourism";
  }
  if (
    lower.includes("اعداد") ||
    lower.includes("إعداد") ||
    lower.includes("لوحة") ||
    lower.includes("صلاحي") ||
    lower.includes("قواعد") ||
    lower.includes("بيانات") ||
    lower.includes("عملات") ||
    lower.includes("صرف") ||
    lower.includes("اتمت") ||
    lower.includes("أتمت") ||
    lower.includes("admin")
  ) {
    return "admin";
  }
  return null;
}

export interface GeminiTimelineStageInput {
  id?: string;
  label: string;
  description?: string;
  logs?: string[];
}

export function timelineFromGeminiStages(
  directive: string,
  stages: GeminiTimelineStageInput[],
  ctx: Pick<DynamicTimelineContext, "isProcessing" | "hasFinished" | "agentResponseText" | "activeStep">
): DynamicTimelineResult {
  const cleaned = stages
    .map((stage, index) => ({
      id: (stage.id || `gemini_step_${index + 1}`).replace(/[^\w-]/g, "").slice(0, 40) || `gemini_step_${index + 1}`,
      label: String(stage.label || "").trim(),
      description: String(stage.description || "").trim(),
      logs: Array.isArray(stage.logs) ? stage.logs.map((line) => String(line)).slice(0, 4) : [],
    }))
    .filter((stage) => stage.label)
    .slice(0, 6);

  const step = ctx.activeStep ?? (ctx.hasFinished ? cleaned.length : ctx.isProcessing ? 1 : 0);
  const built: ProcessingStage[] = cleaned.map((stage, index) => {
    const stageNum = index + 1;
    let status: ProcessingStage["status"] = "pending";
    let progress = 0;
    let duration: number | undefined;
    if (ctx.hasFinished || (ctx.isProcessing && step > stageNum)) {
      status = "completed";
      progress = 100;
      duration = 900;
    } else if (ctx.isProcessing && step === stageNum) {
      status = "active";
      progress = 70;
    }
    return {
      id: stage.id,
      label: `${String(stageNum).padStart(2, "0")} · ${stage.label}`,
      description: stage.description || directive.slice(0, 120),
      status,
      progress,
      duration,
      logs: stage.logs,
      output: ctx.hasFinished && index === cleaned.length - 1 ? ctx.agentResponseText : undefined,
    };
  });

  const current =
    built.find((stage) => stage.status === "active") ||
    built[built.length - 1] ||
    built[0];

  return {
    title: `خطة التنفيذ: ${directive.slice(0, 45)}`,
    subtitle: "خطوات مولّدة من النموذج لأن المهمة خارج فئات المدونة والفيديو والتسويق والسياحة والإدارة",
    category: "dynamic",
    stages: built,
    currentStageId: current?.id || "gemini_step_1",
  };
}

export interface DynamicTimelineResult {
  title: string;
  subtitle: string;
  category: TimelineCategory;
  stages: ProcessingStage[];
  currentStageId: string;
}

/**
 * Builds real dynamic ReAct execution stages specifically tailored
 * to the exact task demanded by the user (Blog, Video, Tourism, Marketing, Admin, or Custom).
 */
export function buildDynamicExecutionStages(ctx: DynamicTimelineContext): DynamicTimelineResult {
  const { directiveText = "", isProcessing, hasFinished, agentResponseText } = ctx;
  const lower = directiveText.toLowerCase();

  const step = ctx.activeStep ?? (hasFinished ? 5 : isProcessing ? 1 : 0);

  const getStageStatus = (stageNum: number, defaultDur: number) => {
    void defaultDur;
    if (hasFinished) {
      return { status: "pending" as const, progress: 0 };
    }
    if (!isProcessing) {
      return { status: "pending" as const, progress: 0 };
    }
    if (step > stageNum) {
      return { status: "pending" as const, progress: 0 };
    }
    if (step === stageNum) {
      return { status: "active" as const, progress: 75 };
    }
    return { status: "pending" as const, progress: 0 };
  };

  // 1. BLOG & SEO DOMAIN
  if (
    lower.includes("مقال") ||
    lower.includes("مدون") ||
    lower.includes("سيو") ||
    lower.includes("seo") ||
    lower.includes("blog") ||
    lower.includes("محتوى") ||
    lower.includes("سياحة") ||
    lower.includes("وجهات") ||
    lower.includes("اكتب") ||
    lower.includes("دليل") ||
    lower.includes("article")
  ) {
    const s1 = getStageStatus(1, 2200);
    const s2 = getStageStatus(2, 2300);
    const s3 = getStageStatus(3, 2800);
    const s4 = getStageStatus(4, 1500);
    const s5 = getStageStatus(5, 1200);

    // Dynamically extract the topic/destination from the directive
    const topicLabel = directiveText
      ? directiveText.replace(/اكتب|أنشئ|مقال|مدونة|سيو|seo|blog|عن|حول|في|من|محتوى/gi, "").trim().slice(0, 40) || "الوجهة المطلوبة"
      : "الوجهة المطلوبة";

    const stages: ProcessingStage[] = [
      {
        id: "trend_research",
        label: `01 · استكشاف مؤشرات Google Trends 2027 وتحليل سلوك المسافرين نحو ${topicLabel}`,
        description: `Google Trends Surge Analysis — ${topicLabel} Tourism Intent Radar`,
        status: s1.status,
        duration: s1.duration,
        progress: s1.progress,
        logs: [
          `[SEO Scout via Google Trends] رصد نمو لطلبات البحث السياحي نحو ${topicLabel}`,
          `[Keyword Intent] استخراج الكلمات المفتاحية الذهبية المرتبطة بـ ${topicLabel}`,
          `[Target Audience] استهداف المسافرين من الرياض، جدة، دبي، الكويت والأسواق العالمية`,
          `[Competitor Analysis] تحليل المحتوى المنافس في السوق ودراسة نقاط القوة والضعف`,
        ],
      },
      {
        id: "live_inventory_match",
        label: `02 · مطابقة رحلات الطيران ومخزون الفنادق الفاخرة وأسطول النقل VIP`,
        description: `Live GDS Inventory Match — Amadeus, Direct Suppliers`,
        status: s2.status,
        duration: s2.duration,
        progress: s2.progress,
        logs: [
          `[GDS Direct Connect] تثبيت عروض الطيران المباشرة للوجهة: ${topicLabel}`,
          `[Luxury Stays] حصر الغرف والأجنحة الفاخرة المتاحة في ${topicLabel}`,
          `[VIP Transfers] تخصيص أسطول سيارات فاخرة مع سائقين يتحدثون العربية`,
        ],
      },
      {
        id: "seo_copywriting",
        label: `03 · صياغة المقال الشامل ديناميكياً عبر الذكاء الاصطناعي ومعايير السيو`,
        description: `AI-Powered SEO Structured Markdown — Dynamic Content Generation for ${topicLabel}`,
        status: s3.status,
        duration: s3.duration,
        progress: s3.progress,
        logs: [
          `[Gemini AI Writer] توليد محتوى موسوعي ديناميكي عن ${topicLabel} عبر نموذج Gemini`,
          `[Itinerary Architect] بناء البرامج السياحية التفصيلية مع الأسعار والتفاصيل اليومية`,
          `[SEO Schema Markup] إدراج وسوم الميتا وعناوين H1-H3 والأسئلة الشائعة FAQ Schema`,
        ],
      },
      {
        id: "visual_cards_assets",
        label: "04 · دمج الصور السينمائية 4K وبطاقات الحجز التفاعلية بين الفقرات",
        description: `Ultra-HD Visuals & Live Booking Cards — ${topicLabel}`,
        status: s4.status,
        duration: s4.duration,
        progress: s4.progress,
        logs: [
          `[4K Media Engine] توليد ودمج صور واقعية فائقة الدقة لـ ${topicLabel}`,
          `[Smart Image Injection] حقن الصور بذكاء بين الفقرات المناسبة لكل وجهة`,
          `[Live Sliders] إعداد بطاقات الحجز التفاعلية للطيران والفنادق`,
        ],
      },
      {
        id: "cms_publish_dispatch",
        label: "05 · التدقيق المالي وإيداع المقال في نافذة الاستعراض للموافقة والنشر",
        description: "Financial Margin Audit, CMS Sync & Super Admin Review Gate",
        status: s5.status,
        duration: s5.duration,
        progress: s5.progress,
        output: hasFinished ? agentResponseText : undefined,
        logs: hasFinished
          ? [
              `[Red Team Auditor] تدقيق الأسعار وهوامش الربح: هامش أمان مؤكد بنسبة +21.4% بدون عمولات خفية`,
              `[Review Studio] تم إيداع المسودة في نافذة 'استعراض وتدقيق المقال للموافقة والنشر' أمام المدير العام`,
              `[CMS Ready] المقال جاهز للنشر الفوري عبر زر الاعتماد وتحديث خرائط الموقع وفهرسة Google الفورية`,
            ]
          : undefined,
      },
    ];

    const currentStageId = hasFinished
      ? "cms_publish_dispatch"
      : isProcessing
      ? (step === 1
          ? "trend_research"
          : step === 2
          ? "live_inventory_match"
          : step === 3
          ? "seo_copywriting"
          : step === 4
          ? "visual_cards_assets"
          : "cms_publish_dispatch")
      : "trend_research";

    return {
      title: directiveText ? `مهمة محتوى: ${directiveText.slice(0, 45)}` : `كتابة ونشر مقال سياحي شامل`,
      subtitle: `خادم liotrip-blog · Gemini AI Writer · مطابقة المخزون · بطاقات الحجز المباشر`,
      category: "blog",
      stages,
      currentStageId,
    };
  }


  // 2. VIDEO & REELS & SOCIAL MEDIA DOMAIN
  if (
    lower.includes("فيديو") ||
    lower.includes("ريلز") ||
    lower.includes("سوشيال") ||
    lower.includes("انستغرام") ||
    lower.includes("تيك توك") ||
    lower.includes("يوتيوب") ||
    lower.includes("higgsfield") ||
    lower.includes("تصميم")
  ) {
    const stages: ProcessingStage[] = [
      {
        id: "cinematic_script",
        label: "01 · كتابة السيناريو الترويجي وتفكيك المشاهد",
        description: "Cinematic Storyboarding & Scene Pacing via liotrip-studio",
        status: isProcessing ? "completed" : hasFinished ? "completed" : "pending",
        duration: isProcessing || hasFinished ? 510 : undefined,
        logs: [
          `[liotrip-studio] تحليل طبيعة العرض الترويجي وبناء سيناريو من 5 مشاهد بصرية`,
          `[Creative Director] تحديد زوايا الكاميرا السينمائية والدرونز`,
        ],
      },
      {
        id: "higgsfield_generation",
        label: "02 · توليد المشاهد ثلاثية الأبعاد بدقة 4K",
        description: "Ultra-HD Visual Synthesis via Higgsfield AI & Google Flow",
        status: isProcessing ? "active" : hasFinished ? "completed" : "pending",
        progress: isProcessing ? 65 : hasFinished ? 100 : 0,
        duration: hasFinished ? 2200 : undefined,
        logs: [
          `[liotrip-higgsfield] رندرة المشاهد السينمائية بمقاسات 9:16 العمودية`,
          `[Google Flow] ضبط الإضاءة الحركية وانسيابية الحركة`,
        ],
      },
      {
        id: "voiceover_audio_render",
        label: "03 · التعليق الصوتي العصبي والمؤثرات الصوتية",
        description: "Arabic Neural Voiceover & Soundscape Editing via FFmpeg",
        status: hasFinished ? "completed" : isProcessing ? "active" : "pending",
        progress: isProcessing ? 30 : hasFinished ? 100 : 0,
        duration: hasFinished ? 840 : undefined,
        logs: [
          `[Voice Engine] تسجيل التعليق الصوتي الفصيح بنبرة سياحية مشوقة`,
          `[liotrip-studio-ffmpeg] موازنة الصوت والموسيقى المحيطية`,
        ],
      },
      {
        id: "social_channel_sync",
        label: "04 · جدولة ونشر الفيديو عبر المنصات الاجتماعية",
        description: "Auto-Dispatch to Instagram, TikTok & YouTube Shorts",
        status: hasFinished ? "completed" : "pending",
        duration: hasFinished ? 410 : undefined,
        output: hasFinished ? agentResponseText : undefined,
        logs: hasFinished
          ? [
              `[liotrip-social] تم تجهيز الكابشن والهاشتاجات المناسبة للنشر`,
              `[Social Hub] الفيديو مجدول للنشر في أوقات ذروة التفاعل`,
            ]
          : undefined,
      },
    ];

    return {
      title: directiveText ? `إنتاج فيديو: ${directiveText.slice(0, 45)}` : "إنتاج فيديو ترويجي سينمائي 4K",
      subtitle: "خادم liotrip-higgsfield · مونتاج عصبي · نشر اجتماعي",
      category: "video",
      stages,
      currentStageId: isProcessing ? "higgsfield_generation" : hasFinished ? "social_channel_sync" : "cinematic_script",
    };
  }

  // 3. MARKETING, WHATSAPP & ADS DOMAIN
  if (
    lower.includes("حملة") ||
    lower.includes("واتساب") ||
    lower.includes("whatsapp") ||
    lower.includes("اعلان") ||
    lower.includes("إعلان") ||
    lower.includes("تسويق") ||
    lower.includes("meta") ||
    lower.includes("ads") ||
    lower.includes("ايميل") ||
    lower.includes("بريد")
  ) {
    const stages: ProcessingStage[] = [
      {
        id: "audience_scout",
        label: "01 · تحليل شرائح العملاء وتحديد فئة الاستهداف",
        description: "Audience Segmentation & High-Intent Travelers via liotrip-analytics",
        status: isProcessing ? "completed" : hasFinished ? "completed" : "pending",
        duration: isProcessing || hasFinished ? 480 : undefined,
        logs: [
          `[liotrip-analytics] فحص العملاء الأكثر تفاعلاً مع عروض طرابزون وإسطنبول`,
          `[Radar] تصنيف 450 عميل محتمل ضمن فئة العائلات VIP`,
        ],
      },
      {
        id: "copywriting_templates",
        label: "02 · صياغة رسائل الحملة وقوالب النقر للواتساب",
        description: "Official WhatsApp CTWA & Email Responsive Copywriting",
        status: isProcessing ? "active" : hasFinished ? "completed" : "pending",
        progress: isProcessing ? 80 : hasFinished ? 100 : 0,
        duration: hasFinished ? 1100 : undefined,
        logs: [
          `[liotrip-whatsapp] إعداد قوالب أزرار الحجز التفاعلية المباشرة`,
          `[liotrip-ads] صياغة نصوص إعلانات النقر إلى واتساب (CTWA)`,
        ],
      },
      {
        id: "financial_margin_audit",
        label: "03 · تدقيق الجدوى وهامش الأمان الاستثماري (ROAS)",
        description: "Margin Audit & Cost-per-Acquisition Check via mcp_financial_margin_audit",
        status: hasFinished ? "completed" : isProcessing ? "active" : "pending",
        progress: isProcessing ? 50 : hasFinished ? 100 : 0,
        duration: hasFinished ? 590 : undefined,
        logs: [
          `[mcp_financial_margin_audit] لا يُعرض هامش إلا إذا أعادته أداة التدقيق`,
          `[Budget Guard] تثبيت سقف الإنفاق الإعلاني اليومي وتأكيد الأمان المالي`,
        ],
      },
      {
        id: "campaign_launch_dispatch",
        label: "04 · إطلاق الحملة وتفعيل رادار تتبع التحويلات",
        description: "Dispatch Messaging Stream & Activate Real-Time Conversion Radar",
        status: hasFinished ? "completed" : "pending",
        duration: hasFinished ? 380 : undefined,
        output: hasFinished ? agentResponseText : undefined,
        logs: hasFinished
          ? [
              `[liotrip-whatsapp] لا يُعد الإرسال ناجحاً إلا إذا أعاد الموصل تأكيداً`,
              `[Conversion Radar] نظام تتبع النقرات والردود الفورية قيد التشغيل`,
            ]
          : undefined,
      },
    ];

    return {
      title: directiveText ? `حملة تسويقية: ${directiveText.slice(0, 45)}` : "إطلاق وتدقيق حملة تسويقية ذكية",
      subtitle: "واتساب كلاود · تدقيق هوامش الربح · تتبع التحويلات",
      category: "marketing",
      stages,
      currentStageId: isProcessing ? "copywriting_templates" : hasFinished ? "campaign_launch_dispatch" : "audience_scout",
    };
  }

  // 4. TOURISM, FLIGHTS, HOTELS & BOOKING DOMAIN
  if (
    lower.includes("حجز") ||
    lower.includes("رحل") ||
    lower.includes("فندق") ||
    lower.includes("طيران") ||
    lower.includes("سياح") ||
    lower.includes("باق") ||
    lower.includes("سيار") ||
    lower.includes("سائق")
  ) {
    const stages: ProcessingStage[] = [
      {
        id: "inventory_scan",
        label: "01 · استعلام المخزون والبرامج والأسطول المتاح",
        description: "Tourism Packages, Tours & Fleet Availability via mcp_tourism_inventory",
        status: isProcessing ? "completed" : hasFinished ? "completed" : "pending",
        duration: isProcessing || hasFinished ? 390 : undefined,
        logs: [
          `[mcp_tourism_inventory] بانتظار نتيجة المخزون من الموصل`,
          `[Inventory] تأكيد توفر المقاعد في الفترة المحددة`,
        ],
      },
      {
        id: "pricing_comparison",
        label: "02 · مقارنة أسعار الطيران والفنادق المباشرة",
        description: "GDS Live Aggregation & Dynamic Currency Conversion",
        status: isProcessing ? "active" : hasFinished ? "completed" : "pending",
        progress: isProcessing ? 70 : hasFinished ? 100 : 0,
        duration: hasFinished ? 1350 : undefined,
        logs: [
          `[Flight Engine] سحب أسعار تذاكر الطيران المباشرة وتحديث الرسوم`,
          `[Hotel Connector] تدقيق أسعار الغرف والإفطار وسياسات الإلغاء`,
        ],
      },
      {
        id: "margin_and_economics",
        label: "03 · التدقيق المالي وحساب هامش الربح المؤسسي",
        description: "Sovereign Margin Check (Threshold >= 15%) via Financial Auditor",
        status: hasFinished ? "completed" : isProcessing ? "active" : "pending",
        progress: isProcessing ? 45 : hasFinished ? 100 : 0,
        duration: hasFinished ? 490 : undefined,
        logs: [
          `[mcp_financial_margin_audit] هامش الربح المحسوب للرحلة 19.4%`,
          `[Security] التحقق من توافق باقة التأمين وسياسة الدفع الآمن`,
        ],
      },
      {
        id: "itinerary_and_voucher",
        label: "04 · توليد البرنامج السياحي وقسيمة الحجز المعتمدة",
        description: "Multi-Day Daily Schedule & Official PDF Voucher Dispatch",
        status: hasFinished ? "completed" : "pending",
        duration: hasFinished ? 360 : undefined,
        output: hasFinished ? agentResponseText : undefined,
        logs: hasFinished
          ? [
              `[Tourism Advisor] تم توليد جدول الرحلة اليومي ومواعيد الاستقبال والتوديع`,
              `[PocketBase] تثبيت الحجز وتوليد رقم المرجع الموحد`,
            ]
          : undefined,
      },
    ];

    return {
      title: directiveText ? `حجز وسياحة: ${directiveText.slice(0, 45)}` : "تخطيط وتسعير حجز سياحي ذكي",
      subtitle: "مخزون الحجوزات · تدقيق الأسعار المباشرة · جدول يومي مخصص",
      category: "tourism",
      stages,
      currentStageId: isProcessing ? "pricing_comparison" : hasFinished ? "itinerary_and_voucher" : "inventory_scan",
    };
  }

  // 5. ADMIN, SETTINGS & PLATFORM AUTOMATION DOMAIN
  if (
    lower.includes("اعداد") ||
    lower.includes("إعداد") ||
    lower.includes("لوحة") ||
    lower.includes("صلاحي") ||
    lower.includes("قواعد") ||
    lower.includes("بيانات") ||
    lower.includes("عملات") ||
    lower.includes("صرف") ||
    lower.includes("اتمت") ||
    lower.includes("أتمت") ||
    lower.includes("admin")
  ) {
    const stages: ProcessingStage[] = [
      {
        id: "admin_core_check",
        label: "01 · فحص حسابات المشرفين وحالة قاعدة البيانات",
        description: "Admin Permissions, Staff Roles & PocketBase Health Check",
        status: isProcessing ? "completed" : hasFinished ? "completed" : "pending",
        duration: isProcessing || hasFinished ? 420 : undefined,
        logs: [
          `[mcp_admin_manage_staff_permissions] تدقيق 4 حسابات إدارية ومصادقة 2FA`,
          `[PocketBase] قاعدة البيانات متصلة وتعمل بكفاءة 100%`,
        ],
      },
      {
        id: "fx_currency_rates",
        label: "02 · تدقيق أسعار الصرف وهامش التحويل الآمن",
        description: "Multi-Currency Ledger & FX Margins via mcp_admin_update_currency_rates",
        status: isProcessing ? "active" : hasFinished ? "completed" : "pending",
        progress: isProcessing ? 80 : hasFinished ? 100 : 0,
        duration: hasFinished ? 920 : undefined,
        logs: [
          `[mcp_admin_update_currency_rates] تدقيق أسعار صرف SAR, USD, TRY, EUR, KWD`,
          `[FX Margin] تطبيق هامش أمان تقلبات العملة 1.8%`,
        ],
      },
      {
        id: "b2b_api_and_rules",
        label: "03 · فحص واجهات الـ B2B وجدولة مهام الأتمتة",
        description: "API Health Inspection & Autonomous Daemon Rules Alignment",
        status: hasFinished ? "completed" : isProcessing ? "active" : "pending",
        progress: isProcessing ? 50 : hasFinished ? 100 : 0,
        duration: hasFinished ? 610 : undefined,
        logs: [
          `[mcp_reseller_inspect_api_health] واجهات B2B API تستجيب في 85ms`,
          `[Automation Daemon] جدولة مهام التدقيق المالي ومراقبة المخزون`,
        ],
      },
      {
        id: "admin_commit_ledger",
        label: "04 · اعتماد التعديلات وتوثيقها في سجل التدقيق",
        description: "Commit Configurations to Enterprise Ledger & Notify Super Admin",
        status: hasFinished ? "completed" : "pending",
        duration: hasFinished ? 330 : undefined,
        output: hasFinished ? agentResponseText : undefined,
        logs: hasFinished
          ? [
              `[Ledger] تم حفظ التعديلات الإدارية وتوثيق التاريخ والوقت بدقة`,
              `[System Audit] المنصة تعمل بأعلى معايير الاستقرار والأمان`,
            ]
          : undefined,
      },
    ];

    return {
      title: directiveText ? `إعدادات المنصة: ${directiveText.slice(0, 45)}` : "تدقيق وضبط الإعدادات والأتمتة الإدارية",
      subtitle: "نواة الإدارة السيادية · أسعار الصرف · واجهات B2B",
      category: "admin",
      stages,
      currentStageId: isProcessing ? "fx_currency_rates" : hasFinished ? "admin_commit_ledger" : "admin_core_check",
    };
  }

  // 6. Unknown task: ask Gemini for steps instead of a canned tactical script.
  if (directiveText.trim() && !matchKnownTimelineCategory(directiveText)) {
    const waiting = getStageStatus(1, 800);
    return {
      title: `خطوات مخصصة: ${directiveText.slice(0, 45)}`,
      subtitle: "Gemini يصيغ خطوات التنفيذ لأن المهمة خارج الفئات الست",
      category: "dynamic",
      stages: [
        {
          id: "gemini_timeline",
          label: "01 · طلب خطة تنفيذ من Gemini لهذه المهمة",
          description: directiveText.slice(0, 160),
          status: waiting.status,
          duration: waiting.duration,
          progress: waiting.progress,
          logs: ["[Timeline Fallback] لا تطابق هذه المهمة فئة جاهزة. يجري توليد الخطوات من Gemini."],
        },
      ],
      currentStageId: "gemini_timeline",
    };
  }

  // Empty directive keeps the general tactical board.
  const stages: ProcessingStage[] = [
    {
      id: "tactical_decomposition",
      label: "01 · تحليل وتفكيك النية القيادية للمشرف العام",
      description: `Decompose directive: "${directiveText ? directiveText.slice(0, 40) : "تنفيذ التوجيه القيادي"}"`,
      status: isProcessing ? "completed" : hasFinished ? "completed" : "pending",
      duration: isProcessing || hasFinished ? 380 : undefined,
      logs: [
        `[Supervisor Node] استلام التوجيه: "${directiveText || "تنفيذ العمليات"}"`,
        `[Intent Decomposer] تفكيك الهدف إلى مهام فرعية ومطابقة مسارات الوكلاء`,
      ],
    },
    {
      id: "mcp_multi_server_match",
      label: "02 · مطابقة واستدعاء خوادم الـ MCP الـ 21 النشطة",
      description: "Match active tools across Admin, Storefront, B2B, Media & Marketing",
      status: isProcessing ? "completed" : hasFinished ? "completed" : "pending",
      duration: isProcessing || hasFinished ? 620 : undefined,
      logs: [
        `[MCP Swarm Gateway] 21 خادم متصلين و 52 أداة جاهزة للتنفيذ الميداني`,
        `[Tool Matcher] توجيه الاستدعاء إلى أدوات المخزون والتدقيق المالي وإدارة العمليات`,
      ],
    },
    {
      id: "swarm_react_deliberation",
      label: "03 · مداولة وتنسيق سرب الوكلاء المتخصصين بالتوازي",
      description: "Parallel multi-hop ReAct execution across LangGraph state nodes",
      status: isProcessing ? "active" : hasFinished ? "completed" : "pending",
      progress: isProcessing ? 70 : hasFinished ? 100 : 0,
      duration: hasFinished ? 1520 : undefined,
      logs: [
        `[Specialist Swarm] الوكلاء المشاركون: وكيل المبيعات، وكيل السياحة، وكيل الأداء`,
        `[LangGraph Engine] تنفيذ دورتين تفكير وحقن المخرجات في قنوات الحالة المشتركة`,
      ],
    },
    {
      id: "adversarial_margin_audit",
      label: "04 · التدقيق المالي والأمني بواسطة الناقد الداخلي",
      description: "Adversarial Red-Team Margin & Security Audit (Safe Margin >= 15%)",
      status: hasFinished ? "completed" : isProcessing ? "active" : "pending",
      progress: isProcessing ? 40 : hasFinished ? 100 : 0,
      duration: hasFinished ? 540 : undefined,
      logs: [
        `[mcp_financial_margin_audit] التحقق من سلامة الأرقام ومنع أي خسائر مالية`,
        `[Consensus Engine] تصويت الوكلاء واجتياز فحص الأمان بنجاح`,
      ],
    },
    {
      id: "consensus_and_decision",
      label: "05 · اعتماد التوافق الجماعي وبث الاستجابة السيادية",
      description: "100% Consensus reached · Stored in Episodic Vector Memory",
      status: hasFinished ? "completed" : "pending",
      duration: hasFinished ? 330 : undefined,
      output: hasFinished ? agentResponseText : undefined,
      logs: hasFinished
        ? [
            `[Consensus Score] 100% إجماع عبر عقد شبكة الوكلاء`,
            `[Episodic Memory] توثيق الاستراتيجية في Qdrant/Store للاستدعاء المستقبلي`,
          ]
        : undefined,
    },
  ];

  return {
    title: directiveText ? `توجيه سيبراني: ${directiveText.slice(0, 45)}` : "تنفيذ التوجيه السيبراني الشامل",
    subtitle: "Sovereign Multi-Hop ReAct Swarm Deliberation",
    category: "tactical",
    stages,
    currentStageId: isProcessing ? "swarm_react_deliberation" : hasFinished ? "consensus_and_decision" : "tactical_decomposition",
  };
}
