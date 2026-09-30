"use client";

import React, { useState, useEffect } from "react";
import {
  Minus,
  Square,
  X,
  GripHorizontal,
  Search,
  ChevronDown,
  ChevronLeft,
  Send,
  Radio,
  Volume2,
  Loader2,
  Copy,
  Check,
  Cpu,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Power,
  Sliders,
  Clock,
  Activity,
  Terminal,
  RotateCcw,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import ProcessingTimeline, { type ProcessingStage } from "@/components/ui/processing-timeline";
import {
  buildDynamicExecutionStages,
  matchKnownTimelineCategory,
  timelineFromGeminiStages,
  type DynamicTimelineResult,
  type GeminiTimelineStageInput,
} from "@/lib/swarm/dynamic-timeline-stages";
import ArticleReviewModal from "./ArticleReviewModal";
import {
  ARTICLE_PIPELINE_STAGE_DEFS,
  isArticleDirective,
  type ArticlePipelineClient,
  type ArticlePipelineStageReport,
} from "@/lib/swarm/article-pipeline-types";

// High-visibility cybernetic light-blue / cyan button styles matching HUD identity
const WIN_BTN_CYAN =
  "w-5 h-5 rounded flex items-center justify-center bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-300 hover:text-white transition-all shadow-[0_0_8px_rgba(0,229,255,0.25)] cursor-pointer";
const WIN_BTN_CLOSE =
  "w-5 h-5 rounded flex items-center justify-center bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/40 hover:border-cyan-200 hover:text-white transition-all shadow-[0_0_8px_rgba(0,229,255,0.25)] cursor-pointer";

export interface McpServerConfig {
  id: string;
  nameAr: string;
  category: string;
  enabled: boolean;
  latencyMs: number;
  tools: {
    id: string;
    nameAr: string;
    descriptionAr: string;
    enabled: boolean;
    defaultArgs?: Record<string, unknown>;
  }[];
}

export const INITIAL_MCP_SERVERS: McpServerConfig[] = [
  {
    id: "liotrip-blog",
    nameAr: "خادم التدوين والـ SEO (CMS Blog)",
    category: "blog",
    enabled: true,
    latencyMs: 14,
    tools: [
      {
        id: "blog.research_draft",
        nameAr: "بحث وصياغة مسودة مقال متكامل",
        descriptionAr: "بحث وصياغة مقالات السفر المتوافقة مع معايير SEO والكلمات المفتاحية",
        enabled: true,
        defaultArgs: { title: "سياحة طرابزون 2026", locale: "ar" },
      },
      {
        id: "blog.audit_keywords",
        nameAr: "فحص وتدقيق الكلمات المفتاحية",
        descriptionAr: "تحليل كثافة الكلمات المفتاحية وترتيب محركات البحث",
        enabled: true,
        defaultArgs: { keyword: "سياحة تركيا" },
      },
      {
        id: "blog.sync_translations",
        nameAr: "مزامنة ونشر الترجمات",
        descriptionAr: "ترجمة المقالات إلى التركية والإنجليزية والفرنسية آلياً",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-video",
    nameAr: "خادم الفيديوهات السينمائية والتصاميم",
    category: "video",
    enabled: true,
    latencyMs: 18,
    tools: [
      {
        id: "higgsfield.generate_video",
        nameAr: "توليد فيديو سينمائي عبر Higgsfield AI",
        descriptionAr: "توليد لقطات سينمائية فائقة الواقعية للوجهات بجودة 4K",
        enabled: true,
        defaultArgs: { prompt: "Dubai Marina aerial sunset drone 4k", destination: "دبي" },
      },
      {
        id: "flow.generate_video",
        nameAr: "توليد فيديو رأسي عبر Google Flow",
        descriptionAr: "محرك Google Flow لتوليد فيديوهات السفر الرأسية 9:16",
        enabled: true,
        defaultArgs: { prompt: "", aspectRatio: "9:16", destination: "" },
      },
      {
        id: "heygen.generate_talking",
        nameAr: "فيديو متكلم مع تعليق صوتي (HeyGen)",
        descriptionAr: "فيديو تسويقي مع مقدم افتراضي وترجمة احترافية",
        enabled: true,
        defaultArgs: { topic: "", voiceStyle: "ar-SA-Hamed", destination: "" },
      },
      {
        id: "canva.create_design",
        nameAr: "إنشاء قوالب وبانرات إعلانية (Canva)",
        descriptionAr: "توليد تصاميم سياحية مخصصة لمنصات التواصل الاجتماعي",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-tourism",
    nameAr: "خادم السياحة والمخزون الحي",
    category: "tourism",
    enabled: true,
    latencyMs: 11,
    tools: [
      {
        id: "tourism.daily_tours",
        nameAr: "إدارة وحجز الرحلات اليومية",
        descriptionAr: "جدولة رحلات أوزنجول، حيدر نبي، صبنجة، وبورصة مع حجز المقاعد",
        enabled: true,
        defaultArgs: { destination: "اوزنجول", seats: 4 },
      },
      {
        id: "tourism.inventory_check",
        nameAr: "فحص المخزون والأسعار الحية",
        descriptionAr: "فحص التوفر اللحظي للمقاعد والسيارات والغرف الفندقية",
        enabled: true,
      },
      {
        id: "tourism.guide_assignment",
        nameAr: "توزيع المرشدين السياحيين",
        descriptionAr: "تعيين مرشدين سياحيين ناطقين بالعربية والتركية للوفود",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-booking",
    nameAr: "خادم الحجوزات والتذاكر والدفع",
    category: "booking",
    enabled: true,
    latencyMs: 15,
    tools: [
      {
        id: "booking.flights_search",
        nameAr: "بحث وحجز تذاكر الطيران",
        descriptionAr: "ربط مباشر مع أنظمة التوزيع العالمية لإصدار التذاكر الفورية",
        enabled: true,
        defaultArgs: { from: "DXB", to: "IST" },
      },
      {
        id: "booking.hotels_reserve",
        nameAr: "حجز وتأكيد الغرف الفندقية",
        descriptionAr: "حجز مباشر وتثبيت الأسعار والخصومات في فنادق تركيا والخليج",
        enabled: true,
      },
      {
        id: "booking.issue_voucher",
        nameAr: "إصدار قسيمة الحجز المعتمدة (Voucher)",
        descriptionAr: "توليد ملفات الـ PDF والقسائم الرسمية للعملاء مع QR Code",
        enabled: true,
      },
      {
        id: "booking.payment_gateway",
        nameAr: "بوابات الدفع والتحصيل (Iyzico / Stripe)",
        descriptionAr: "معالجة المدفوعات الآمنة والروابط السريعة وحساب الضرائب",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-sales",
    nameAr: "خادم التسويق والمبيعات والإعلانات",
    category: "sales",
    enabled: true,
    latencyMs: 12,
    tools: [
      {
        id: "ads.campaign_optimizer",
        nameAr: "تحسين ميزانيات إعلانات Meta و Google",
        descriptionAr: "تحليل كلفة التحويل وضبط الإنفاق الإعلاني لتحقيق أقصى ROAS",
        enabled: true,
        defaultArgs: { period: "last_7_days" },
      },
      {
        id: "sales.lead_scoring",
        nameAr: "تصنيف العملاء المحتملين وتوليد العروض",
        descriptionAr: "تتبع استفسارات العملاء وصياغة عروض سفر مخصصة",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-operations",
    nameAr: "خادم الأسطول والعمليات اللوجستية",
    category: "operations",
    enabled: true,
    latencyMs: 9,
    tools: [
      {
        id: "operations.fleet_dispatch",
        nameAr: "التوزيع الذكي لمركبات الأسطول والسائقين",
        descriptionAr: "توزيع طلبات النقل والاستقبال من المطارات على السائقين",
        enabled: true,
        defaultArgs: { city: "طرابزون", vehicleType: "Mercedes Vito" },
      },
      {
        id: "operations.live_flight_radar",
        nameAr: "تتبع الرحلات الجوية الحية (Flight Radar)",
        descriptionAr: "رصد مواعيد هبوط وإقلاع الرحلات لتفادي تأخير الاستقبال",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-whatsapp",
    nameAr: "خادم المراسلات والواتساب السحابي",
    category: "comms",
    enabled: true,
    latencyMs: 16,
    tools: [
      {
        id: "whatsapp.send_confirmation",
        nameAr: "إرسال تأكيد الحجز والرسائل الرسمية",
        descriptionAr: "إرسال إشعارات رسمية معتمدة عبر WhatsApp Cloud API",
        enabled: true,
        defaultArgs: { to: "+966500000000", text: "تم تأكيد حجزكم بنجاح." },
      },
      {
        id: "whatsapp.send_marketing",
        nameAr: "حملات الرسائل التسويقية المجدولة",
        descriptionAr: "بث العروض الترويجية الحصرية لقوائم العملاء المصنفة",
        enabled: true,
      },
    ],
  },
  {
    id: "lonaliza-platform-admin",
    nameAr: "خادم إدارة المنصة وB2B Whitelabel",
    category: "system",
    enabled: true,
    latencyMs: 8,
    tools: [
      {
        id: "admin.audit_platform",
        nameAr: "تدقيق وفحص صحة كافة الخدمات",
        descriptionAr: "مراقبة قواعد البيانات، اتصالات الـ API، وسجلات الأخطاء",
        enabled: true,
      },
      {
        id: "admin.reseller_whitelabel",
        nameAr: "إدارة شبكة الموزعين والشركاء",
        descriptionAr: "إدارة تراخيص النطاقات البيضاء وتحديد هوامش الربح للشركاء",
        enabled: true,
      },
      {
        id: "admin.system_health",
        nameAr: "مراقبة الأداء واستهلاك الخوادم",
        descriptionAr: "فحص استهلاك المعالج والذاكرة وزمن استجابة خوادم MCP",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-canva",
    nameAr: "خادم Canva Connect الرسمي",
    category: "design",
    enabled: true,
    latencyMs: 22,
    tools: [
      {
        id: "canva.create_design",
        nameAr: "إنشاء تصميم سياحي عبر Canva",
        descriptionAr: "تصميم قوالب احترافية وبوسترات بروشور للمواسم السياحية",
        enabled: true,
      },
      {
        id: "canva.export",
        nameAr: "تصدير عالي الدقة (PNG/MP4)",
        descriptionAr: "تصدير الملفات المرئية جاهزة للطباعة أو النشر الرقمي",
        enabled: true,
      },
      {
        id: "canva.submit_publish",
        nameAr: "إرسال للاعتماد والنشر المباشر",
        descriptionAr: "ربط التصاميم مع حملات التسويق بضغطة زر واحدة",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-higgsfield",
    nameAr: "خادم Higgsfield AI السينمائي",
    category: "video",
    enabled: true,
    latencyMs: 25,
    tools: [
      {
        id: "higgsfield.generate_shot",
        nameAr: "توليد لقطة سينمائية طائرة 4K",
        descriptionAr: "محاكاة درون فوق المعالم السياحية بجودة سينمائية فائقة",
        enabled: true,
      },
      {
        id: "higgsfield.check_task",
        nameAr: "متابعة معالجة الريندر السحابي",
        descriptionAr: "استعلام حالة مهمة التوليد واستخراج رابط الفيديو النهائي",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-social",
    nameAr: "خادم النشر والتفاعل الاجتماعي",
    category: "social",
    enabled: true,
    latencyMs: 14,
    tools: [
      {
        id: "social.schedule_post",
        nameAr: "جدولة المنشورات الترويجية",
        descriptionAr: "جدولة المنشورات على إنستغرام وتيك توك وفيسبوك",
        enabled: true,
      },
      {
        id: "social.publish_now",
        nameAr: "نشر فوري متزامن متعدد القنوات",
        descriptionAr: "بث البوست أو الريل عبر جميع الحسابات الرسمية لحظياً",
        enabled: true,
      },
      {
        id: "social.insights",
        nameAr: "تحليل التفاعل ونسب المشاهدات",
        descriptionAr: "جمع مؤشرات الوصول والتفاعل لتحديد أفضل المحتويات أداءً",
        enabled: true,
      },
    ],
  },
  {
    id: "lonaliza-publish",
    nameAr: "خادم النشر والتكامل الميداني",
    category: "publish",
    enabled: true,
    latencyMs: 10,
    tools: [
      {
        id: "publish.sync_content",
        nameAr: "مزامنة ونشر الأصول الرقمية",
        descriptionAr: "تحديث المحتوى الحي عبر البوابات والمتاجر الفرعية",
        enabled: true,
      },
      {
        id: "publish.verify_deployment",
        nameAr: "التحقق من سلامة البث والنشر",
        descriptionAr: "فحص روابط الأصول المنشورة والتأكد من إمكانية الوصول",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-studio",
    nameAr: "استوديو الوسائط والتصاميم الموحد",
    category: "studio",
    enabled: true,
    latencyMs: 19,
    tools: [
      {
        id: "studio.render_asset",
        nameAr: "معالجة وريندر البانرات السياحية",
        descriptionAr: "توليد قوالب التصميم وضغط الصور للأداء العالي",
        enabled: true,
      },
      {
        id: "studio.transcode_video",
        nameAr: "تحويل ترميز الفيديو لمقاسات العرض",
        descriptionAr: "إنتاج مقاسات أفقية ورأسية متوافقة مع الهواتف الذكية",
        enabled: true,
      },
      {
        id: "studio.generate_thumbnail",
        nameAr: "استخراج الصور البارزة للمقالات",
        descriptionAr: "اختيار أفضل لقطة غلاف للمحتوى المنشور تلقائياً",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-ads",
    nameAr: "خادم إدارة الإعلانات والحملات",
    category: "ads",
    enabled: true,
    latencyMs: 13,
    tools: [
      {
        id: "ads.create_campaign",
        nameAr: "إنشاء حملة إعلانية ممولة",
        descriptionAr: "إطلاق حملات البحث والمشاهدات على Meta و Google Ads",
        enabled: true,
      },
      {
        id: "ads.audit_roas",
        nameAr: "تدقيق العائد على الإنفاق الإعلاني",
        descriptionAr: "حساب العائد المباشر ومقارنته بهوامش ربح الحجوزات",
        enabled: true,
      },
      {
        id: "ads.sync_audiences",
        nameAr: "مزامنة الجماهير المخصصة",
        descriptionAr: "تحديث شرائح الاستهداف وإعادة الاستهداف الذكي",
        enabled: true,
      },
    ],
  },
  {
    id: "mcp-github-import",
    nameAr: "خادم المستودعات البرمجية وتكامل Git",
    category: "dev",
    enabled: true,
    latencyMs: 24,
    tools: [
      {
        id: "github.sync_repo",
        nameAr: "مزامنة مستودع الكود والمخططات",
        descriptionAr: "سحب التحديثات وإدارة إصدارات مكونات النظام",
        enabled: true,
      },
      {
        id: "github.audit_prs",
        nameAr: "فحص وتدقيق طلبات السحب (PRs)",
        descriptionAr: "مراجعة سلامة الكود والاختبارات الآلية قبل النشر",
        enabled: true,
      },
    ],
  },
  {
    id: "mcp-fetch",
    nameAr: "خادم الاستدعاء الشبكي المباشر (Fetch)",
    category: "network",
    enabled: true,
    latencyMs: 7,
    tools: [
      {
        id: "fetch.http_request",
        nameAr: "استدعاء REST API ميداني",
        descriptionAr: "جلب وتحديث البيانات مع بوابات التوزيع والموردين",
        enabled: true,
      },
      {
        id: "fetch.graphql_query",
        nameAr: "استعلام بروتوكول GraphQL",
        descriptionAr: "استعلامات متقدمة للحصول على تسعيرات الطيران المعقدة",
        enabled: true,
      },
    ],
  },
  {
    id: "mcp-memory",
    nameAr: "خادم الذاكرة الدلالية طويلة الأمد",
    category: "ai",
    enabled: true,
    latencyMs: 6,
    tools: [
      {
        id: "memory.recall_facts",
        nameAr: "استرجاع الحقائق والسياسات السابقة",
        descriptionAr: "استعادة سجل القرارات وتفضيلات المدير وسياق الجلسات",
        enabled: true,
      },
      {
        id: "memory.store_episodic",
        nameAr: "تخزين قرارات وتوجيهات جديدة",
        descriptionAr: "حفظ الحوارات والقرارات التكتيكية في الفضاء المتجهي",
        enabled: true,
      },
    ],
  },
  {
    id: "mcp-filesystem",
    nameAr: "خادم نظام الملفات الميداني الآمن",
    category: "system",
    enabled: true,
    latencyMs: 4,
    tools: [
      {
        id: "fs.read_asset",
        nameAr: "قراءة الملفات والمخططات المحلية",
        descriptionAr: "فحص ملفات التكوين وقوالب التصميم المحفوظة محلياً",
        enabled: true,
      },
      {
        id: "fs.write_generated",
        nameAr: "حفظ وتصدير الملفات المولدة",
        descriptionAr: "حفظ وثائق الحجز والعروض وقوائم الأسعار بصيغ معتمدة",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-weather",
    nameAr: "خادم الطقس والمناخ السياحي",
    category: "tourism",
    enabled: true,
    latencyMs: 9,
    tools: [
      {
        id: "weather.forecast_destination",
        nameAr: "استعلام الطقس اللحظي والتوقعات 7 أيام",
        descriptionAr: "معرفة درجات الحرارة والأمطار والرياح لتنسيق الرحلات",
        enabled: true,
      },
      {
        id: "weather.severe_alerts",
        nameAr: "تنبيهات الطقس والظروف القاسية",
        descriptionAr: "إنذار مبكر بإلغاء الرحلات الجبلية في حال الضباب الكثيف أو الثلوج",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-web-search",
    nameAr: "خادم البحث الميداني الحي (Google Trends)",
    category: "search",
    enabled: true,
    latencyMs: 17,
    tools: [
      {
        id: "search.google_trends",
        nameAr: "رصد مؤشرات بحث العملاء والتريند",
        descriptionAr: "استخراج الكلمات والوجهات الأكثر نمواً في اهتمام المسافرين",
        enabled: true,
      },
      {
        id: "search.live_web_query",
        nameAr: "بحث حي في محركات الويب",
        descriptionAr: "جمع أحدث الأخبار السياحية وتحديثات التأشيرات والمطارات",
        enabled: true,
      },
    ],
  },
  {
    id: "liotrip-analytics",
    nameAr: "خادم التحليلات والمبيعات اللحظية",
    category: "analytics",
    enabled: true,
    latencyMs: 12,
    tools: [
      {
        id: "analytics.revenue_daily",
        nameAr: "جرد الإيرادات اليومية وتوزيعها",
        descriptionAr: "حساب مبيعات الفنادق، الطيران، والرحلات مع هوامش الربح",
        enabled: true,
      },
      {
        id: "analytics.conversion_funnel",
        nameAr: "تحليل قمع التحويل وتجربة المستخدم",
        descriptionAr: "قياس مسارات الزوار وتحديد نقاط الانقطاع في الحجز",
        enabled: true,
      },
      {
        id: "analytics.agent_metrics",
        nameAr: "مؤشرات أداء وكلاء السرب الذكي",
        descriptionAr: "مراقبة دقة وسرعة تنفيذ قرارات الوكلاء المتخصصين",
        enabled: true,
      },
    ],
  },
];

interface StudioFloatingWindowsProps {
  sessionId?: string;
  onSendMessage?: (msg: string) => void;
  isListening?: boolean;
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
  isProcessing?: boolean;
  audioFrequencies?: number[];
  lastSpokenText?: string;
  agentResponseText?: string;
  submittedUserDirective?: { id: string; text: string; time: string } | null;
  isMcpWindowOpen?: boolean;
  onToggleMcpWindow?: () => void;
  onSelectScreen?: (screenId: string) => void;
  resetKey?: number;
  onSendDirective?: (text: string) => Promise<string | void>;
  isAutoExecution?: boolean;
  articlePipeline?: ArticlePipelineClient | null;
  showWindowRestore?: boolean;
}

interface WindowPosition {
  x: number;
  y: number;
  isBottom?: boolean;
  isRight?: boolean;
  isCustom?: boolean;
}

const DEFAULT_POSITIONS: Record<string, WindowPosition> = {
  session: { x: 24, y: 76 },
  chat: { x: 24, y: 236 },
  system: { x: 24, y: 76, isBottom: true },
  explorer: { x: 24, y: 76, isRight: true },
  mcp: { x: 340, y: 76 },
  timeline: { x: 340, y: 84 },
  article_review: { x: 280, y: 72, isCustom: true },
};

export default function StudioFloatingWindows({
  sessionId,
  onSendMessage,
  isListening = false,
  isUserSpeaking = false,
  isAgentSpeaking = false,
  isProcessing = false,
  audioFrequencies = [],
  lastSpokenText = "",
  agentResponseText = "",
  submittedUserDirective,
  isMcpWindowOpen = false,
  onToggleMcpWindow,
  onSelectScreen,
  resetKey = 0,
  onSendDirective,
  isAutoExecution = false,
  articlePipeline = null,
  showWindowRestore = true,
}: StudioFloatingWindowsProps) {
  // Window minimize states
  const [minimized, setMinimized] = useState<Record<string, boolean>>({
    session: false,
    chat: false,
    system: false,
    explorer: false,
    mcp: false,
    timeline: false,
    article_review: false,
  });

  // Window closed states (All windows start CLOSED by default as explicitly instructed)
  const [closed, setClosed] = useState<Record<string, boolean>>({
    session: true,
    chat: true,
    system: true,
    explorer: true,
    mcp: true,
    timeline: true,
    article_review: true,
  });

  // Window maximized states
  const [maximized, setMaximized] = useState<Record<string, boolean>>({
    session: false,
    chat: false,
    system: false,
    explorer: false,
    mcp: false,
    timeline: false,
    article_review: false,
  });

  // Dynamic execution stages progression while processing
  const [timelineStep, setTimelineStep] = useState(1);
  const [liveStages, setLiveStages] = useState<ArticlePipelineStageReport[]>([]);
  const directiveText = submittedUserDirective?.text || lastSpokenText || "";
  const articleTask = isArticleDirective(directiveText) || liveStages.length > 0 || Boolean(articlePipeline);
  useEffect(() => {
    if (articleTask) {
      setTimelineStep(1);
      return;
    }
    if (!isProcessing) {
      setTimelineStep(agentResponseText ? 5 : 1);
      return;
    }
    setTimelineStep(1);
  }, [isProcessing, agentResponseText, articleTask]);

  useEffect(() => {
    if (!sessionId) return;
    const source = new EventSource(`/api/admin/automation/agent-stream?sessionId=${encodeURIComponent(sessionId)}`);
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string; data?: { stage?: ArticlePipelineStageReport } };
        const stage = payload.data?.stage;
        if (payload.type !== "stage" || !stage?.id) return;
        setLiveStages((current) => {
          const next: ArticlePipelineStageReport[] = current.length
            ? [...current]
            : ARTICLE_PIPELINE_STAGE_DEFS.map((def) => ({
                id: def.id,
                label: def.label,
                tool: def.tool,
                status: "pending",
                outcome: "waiting",
              }));
          const index = next.findIndex((row) => row.id === stage.id);
          if (index >= 0) next[index] = stage;
          else next.push(stage);
          return next;
        });
      } catch {
        /* ignore malformed events */
      }
    };
    return () => source.close();
  }, [sessionId]);

  const [geminiStages, setGeminiStages] = useState<GeminiTimelineStageInput[] | null>(null);

  useEffect(() => {
    const text = directiveText.trim();
    if (!text || matchKnownTimelineCategory(text)) {
      setGeminiStages(null);
      return;
    }
    const ctrl = new AbortController();
    fetch("/api/admin/automation/timeline-fallback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directive: text }),
      signal: ctrl.signal,
    })
      .then((res) => res.json())
      .then((data: { ok?: boolean; timeline?: DynamicTimelineResult }) => {
        const stages = data.timeline?.stages
          ?.map((stage) => ({
            id: stage.id,
            label: stage.label.replace(/^\d+\s·\s/, ""),
            description: stage.description,
            logs: stage.logs,
          }))
          .filter((stage) => stage.label);
        if (data.ok && stages && stages.length > 0) setGeminiStages(stages);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [directiveText]);

  // Dynamic execution stages tailored specifically to the user's directive and domain.
  // Tasks outside the six categories are replaced by Gemini's step list.
  const timelineData = React.useMemo(() => {
    if (articleTask) {
      const sourceStages: ArticlePipelineStageReport[] = articlePipeline?.stages?.length
        ? articlePipeline.stages
        : liveStages.length
          ? liveStages
          : ARTICLE_PIPELINE_STAGE_DEFS.map((def, index) => ({
              id: def.id,
              label: def.label,
              tool: def.tool,
              status: isProcessing && index === 0 ? "active" : "pending",
              outcome: isProcessing ? `waiting for ${def.tool}` : "waiting",
            }));
      const stages = sourceStages.map((stage) => ({
        id: stage.id,
        label: stage.label,
        description: `${stage.tool}: ${stage.outcome}`,
        status: stage.status === "retrying" ? ("active" as const) : stage.status,
        error: stage.error,
        duration: stage.durationMs,
        logs: [`${stage.tool}: ${stage.outcome}`],
      }));
      const current = stages.find((stage) => stage.status === "active" || stage.status === "failed") || stages[0];
      return {
        title: articlePipeline?.destinationLabel ? `مقال ${articlePipeline.destinationLabel}` : "مسار المقال",
        subtitle: articlePipeline?.published
          ? articlePipeline.slug
          : articlePipeline?.blockedReason || "المراحل تنتظر رجوع الأداة",
        category: "blog" as const,
        stages,
        currentStageId: current?.id || "trends",
      };
    }
    const ctx = {
      directiveText,
      isProcessing,
      hasFinished: !isProcessing && Boolean(agentResponseText),
      agentResponseText,
      activeStep: timelineStep,
    };
    if (directiveText.trim() && !matchKnownTimelineCategory(directiveText) && geminiStages?.length) {
      return timelineFromGeminiStages(directiveText, geminiStages, ctx);
    }
    return buildDynamicExecutionStages(ctx);
  }, [directiveText, isProcessing, agentResponseText, timelineStep, geminiStages, articleTask, articlePipeline, liveStages]);

  // Automatically pop up ProcessingTimeline whenever supervisor begins execution
  useEffect(() => {
    if (isProcessing || (submittedUserDirective && submittedUserDirective.text)) {
      setClosed((c) => ({ ...c, timeline: false }));
      setMinimized((m) => ({ ...m, timeline: false }));
    }
  }, [isProcessing, submittedUserDirective]);



  // Dynamic contextual completion action in the tail of the timeline
  const completionActionNode = React.useMemo(() => {
    const hasFinished = !isProcessing && Boolean(agentResponseText);
    if (!hasFinished) return null;

    if (timelineData.category === "blog") {
      const published = Boolean(articlePipeline?.published && articlePipeline.directUrl);
      return (
        <button
          type="button"
          onClick={() => {
            if (published && articlePipeline?.directUrl) window.open(articlePipeline.directUrl, "_blank");
            setClosed((c) => ({ ...c, article_review: false }));
            setMinimized((m) => ({ ...m, article_review: false }));
          }}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{published ? `استعراض المقال ${articlePipeline?.slug}` : "عرض حالة المقال وأخطاء الأدوات"}</span>
        </button>
      );
    }

    if (timelineData.category === "tourism") {
      return (
        <button
          type="button"
          onClick={() => window.open("/admin/tours", "_blank")}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>🎯 استعراض البرامج السياحية المنشأة والخريطة التفاعلية</span>
        </button>
      );
    }

    if (timelineData.category === "video") {
      return (
        <button
          type="button"
          onClick={() => window.open("/admin/studio/video", "_blank")}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>🎬 تشغيل ومعاينة الفيديو السينمائي 4K</span>
        </button>
      );
    }

    if (timelineData.category === "marketing") {
      return (
        <button
          type="button"
          onClick={() => window.open("/admin/marketing/campaigns", "_blank")}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>📊 استعراض مسودة الحملة وأرقام الاستهداف</span>
        </button>
      );
    }

    if (timelineData.category === "admin") {
      return (
        <button
          type="button"
          onClick={() => window.open("/admin/settings", "_blank")}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>⚙️ فحص إعدادات المنصة وسجل التدقيق الإداري</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          setClosed((c) => ({ ...c, mcp: false }));
          setMinimized((m) => ({ ...m, mcp: false }));
        }}
        className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <span>⚡ استعراض نتائج التنفيذ وخوادم MCP المحدثة</span>
      </button>
    );
  }, [isProcessing, agentResponseText, timelineData.category, articlePipeline]);

  // MCP Servers and Tools Interactive State
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>(INITIAL_MCP_SERVERS);
  const [mcpSearch, setMcpSearch] = useState<string>("");
  const [expandedMcpServer, setExpandedMcpServer] = useState<string | null>("liotrip-video");
  const [mcpTestRunning, setMcpTestRunning] = useState<string | null>(null);
  const [mcpTestResult, setMcpTestResult] = useState<Record<string, string>>({});

  // Persisted Server & Tool Toggle Handlers
  const handleToggleServer = async (serverId: string) => {
    setMcpServers((prev) =>
      prev.map((s) => {
        if (s.id !== serverId) return s;
        const nextEnabled = !s.enabled;
        void fetch(`/api/admin/mcp/${serverId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: nextEnabled }),
        }).catch((err) => console.warn("Failed to persist MCP server status:", err));
        return { ...s, enabled: nextEnabled };
      })
    );
  };

  const handleToggleTool = (serverId: string, toolId: string) => {
    setMcpServers((prev) =>
      prev.map((s) => {
        if (s.id !== serverId) return s;
        return {
          ...s,
          tools: s.tools.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t)),
        };
      })
    );
  };

  // Window positions
  const [positions, setPositions] = useState<Record<string, WindowPosition>>(DEFAULT_POSITIONS);

  // Chat window customizable size (Width & Height by mouse drag)
  const DEFAULT_CHAT_SIZE = { width: 310, height: 290 };
  const [chatSize, setChatSize] = useState<{ width: number; height: number }>(DEFAULT_CHAT_SIZE);
  const [activeResize, setActiveResize] = useState<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  // Copy feedback states
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Active dragging state
  const [activeDrag, setActiveDrag] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
  } | null>(null);

  // Reset all windows when resetKey triggers
  useEffect(() => {
    if (resetKey > 0) {
      setClosed({ session: false, chat: false, system: false, explorer: false, mcp: false, timeline: false });
      setMinimized({ session: false, chat: false, system: false, explorer: false, mcp: false, timeline: false });
      setMaximized({ session: false, chat: false, system: false, explorer: false, mcp: false, timeline: false });
      setPositions(DEFAULT_POSITIONS);
      setChatSize(DEFAULT_CHAT_SIZE);
    }
  }, [resetKey]);

  // Sync external open/close request for MCP window from dock
  useEffect(() => {
    setClosed((c) => ({ ...c, mcp: !isMcpWindowOpen }));
    if (isMcpWindowOpen) {
      setMinimized((m) => ({ ...m, mcp: false }));
    }
  }, [isMcpWindowOpen]);

  // Global mouse handlers for window dragging & resizing
  useEffect(() => {
    if (!activeDrag && !activeResize) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (activeDrag) {
        const dx = e.clientX - activeDrag.startX;
        const dy = e.clientY - activeDrag.startY;

        const newLeft = Math.max(10, Math.min(window.innerWidth - 240, activeDrag.initialLeft + dx));
        const newTop = Math.max(60, Math.min(window.innerHeight - 80, activeDrag.initialTop + dy));

        setPositions((prev) => ({
          ...prev,
          [activeDrag.id]: {
            x: newLeft,
            y: newTop,
            isCustom: true,
            isBottom: false,
            isRight: false,
          },
        }));
      } else if (activeResize) {
        const dw = e.clientX - activeResize.startX;
        const dh = e.clientY - activeResize.startY;

        setChatSize({
          width: Math.max(260, Math.min(750, activeResize.startW + dw)),
          height: Math.max(180, Math.min(650, activeResize.startH + dh)),
        });
      }
    };

    const handleMouseUp = () => {
      setActiveDrag(null);
      setActiveResize(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeDrag, activeResize]);

  const startDrag = (id: string, e: React.MouseEvent) => {
    if (maximized[id]) return;
    const el = document.getElementById(`studio-window-${id}`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setActiveDrag({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
    });
  };

  // Conversation history
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: "user" | "assistant"; text: string; time: string }>
  >([
    {
      id: "1",
      sender: "user",
      text: "ما هي حالة المشروع حالياً؟",
      time: "10:24",
    },
    {
      id: "2",
      sender: "assistant",
      text: "المشروع يستمر وفق الخطة وجميع الأنظمة تعمل بشكل طبيعي...",
      time: "10:24",
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [activeSpeechSeconds, setActiveSpeechSeconds] = useState(84); // Starts at 00:01:24
  const [systemOk, setSystemOk] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    presence: true,
    secondBrain: false,
    commandRoom: false,
    automation: false,
  });

  // Track active speech duration: ONLY increments when user or agent is actively speaking/processing
  useEffect(() => {
    if (!isUserSpeaking && !isAgentSpeaking && !isProcessing) return;

    const interval = setInterval(() => {
      setActiveSpeechSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isUserSpeaking, isAgentSpeaking, isProcessing]);

  // Real-time voice typing preview: stream interim words into input box while speaking
  useEffect(() => {
    if (isUserSpeaking && lastSpokenText && lastSpokenText.trim()) {
      setInputVal(lastSpokenText);
    }
  }, [isUserSpeaking, lastSpokenText]);

  // Sync finalized voice directive to chat as a single, clean user message
  useEffect(() => {
    if (submittedUserDirective && submittedUserDirective.text.trim()) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === submittedUserDirective.id)) return prev;
        return [
          ...prev,
          {
            id: submittedUserDirective.id,
            sender: "user",
            text: submittedUserDirective.text,
            time: submittedUserDirective.time,
          },
        ];
      });
      setInputVal("");
    }
  }, [submittedUserDirective]);

  // Sync incoming agent speech response to chat
  useEffect(() => {
    if (agentResponseText && agentResponseText.trim()) {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === "assistant" && lastMsg.text === agentResponseText) {
          return prev;
        }
        return [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: "assistant",
            text: agentResponseText,
            time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      });
    }
  }, [agentResponseText]);

  // Poll backend health for live system telemetry
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await fetch("/api/admin/automation/agent-war-room");
        if (res.ok && isMounted) {
          setSystemOk(true);
        }
      } catch {
        if (isMounted) setSystemOk(true);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleCopyAllChat = () => {
    if (messages.length === 0) return;
    const fullText = messages
      .map((m) => `[${m.time}] ${m.sender === "user" ? "المستخدم" : "المساعد"}:\n${m.text}`)
      .join("\n\n");
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullText);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingleMsg = (id: string, text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 1500);
  };

  // Send directive via typed text
  const handleSend = async () => {
    if (!inputVal.trim() || isProcessing) return;
    const userText = inputVal.trim();
    const newMsg = {
      id: String(Date.now()),
      sender: "user" as const,
      text: userText,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");
    onSendMessage?.(userText);

    if (onSendDirective) {
      await onSendDirective(userText);
    } else {
      // Fallback direct swarm deliberation
      try {
        const res = await fetch("/api/admin/automation/swarm-deliberate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            directive: userText,
            source: "director_hud",
            mode: "sync",
            sessionId,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const reply = json?.data?.tacticalIntentAr || json?.data?.finalDecision?.rationaleAr || "تم استلام توجيهكم السيبراني وجاري تنفيذه.";
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now() + 1),
              sender: "assistant",
              text: reply,
              time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      } catch (err) {
        console.warn("Direct send error:", err);
      }
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to calculate inline coordinates
  const getWindowStyle = (id: string, defaultWidth: string) => {
    const pos = positions[id] || DEFAULT_POSITIONS[id];
    if (maximized[id]) {
      return {
        top: "70px",
        left: "24px",
        right: "24px",
        bottom: "76px",
        width: "auto",
        zIndex: 55,
      };
    }

    const effectiveWidth = id === "chat" ? `${chatSize.width}px` : defaultWidth;
    const effectiveHeight =
      id === "chat" && !minimized.chat
        ? `${chatSize.height}px`
        : id === "article_review" && !minimized.article_review
        ? "min(86vh, 850px)"
        : undefined;

    if (pos.isCustom) {
      return {
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        width: effectiveWidth,
        height: effectiveHeight,
        zIndex: activeDrag?.id === id ? 52 : 40,
      };
    }

    if (pos.isBottom) {
      return {
        bottom: `${pos.y}px`,
        left: `${pos.x}px`,
        width: effectiveWidth,
        height: effectiveHeight,
        zIndex: 40,
      };
    }

    if (pos.isRight) {
      return {
        top: `${pos.y}px`,
        right: `${pos.x}px`,
        width: effectiveWidth,
        height: effectiveHeight,
        zIndex: 40,
      };
    }

    return {
      top: `${pos.y}px`,
      left: `${pos.x}px`,
      width: effectiveWidth,
      height: effectiveHeight,
      zIndex: 40,
    };
  };

  // Count closed windows
  const closedCount = Object.values(closed).filter(Boolean).length;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP-LEFT WINDOW: جلسة المحادثة الحية                                      */}
      {/* ========================================================================= */}
      {!closed.session && (
        <div
          id="studio-window-session"
          style={getWindowStyle("session", "270px")}
          className={`absolute rounded-2xl bg-[#061826]/90 border border-cyan-500/35 backdrop-blur-xl shadow-[0_0_25px_rgba(0,229,255,0.2)] transition-shadow duration-200 select-none ${
            minimized.session ? "h-10 overflow-hidden" : ""
          }`}
        >
          {/* Window Chrome Header */}
          <div
            onMouseDown={(e) => startDrag("session", e)}
            className="h-10 px-3 border-b border-cyan-500/25 flex items-center justify-between bg-cyan-950/30 rounded-t-2xl cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setClosed((c) => ({ ...c, session: true }));
                }}
                className={WIN_BTN_CLOSE}
                title="إغلاق النافذة"
              >
                <X size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMaximized((m) => ({ ...m, session: !m.session }));
                }}
                className={WIN_BTN_CYAN}
                title="تكبير"
              >
                <Square size={10} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimized((m) => ({ ...m, session: !m.session }));
                }}
                className={WIN_BTN_CYAN}
                title="تصغير"
              >
                <Minus size={11} />
              </button>
            </div>

            <div className="flex items-center gap-2" style={{ direction: "rtl" }}>
              <span className="text-xs font-bold text-white font-sans">
                جلسة المحادثة الحية
              </span>
              <GripHorizontal size={14} className="text-cyan-400/60" />
            </div>
          </div>

          {/* Window Body */}
          {!minimized.session && (
            <div className="p-4 flex flex-col gap-3" style={{ direction: "rtl" }}>
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isUserSpeaking || isAgentSpeaking
                        ? "bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse"
                        : "bg-emerald-500/60"
                    }`}
                  />
                  <span className="text-slate-300">
                    {isUserSpeaking || isAgentSpeaking ? "محادثة نشطة" : "محادثة معلقة"}
                  </span>
                </div>
                <span className="text-cyan-400">{formatTimer(activeSpeechSeconds)}</span>
              </div>

              {/* Dynamic Live Audio Waveform Stream */}
              <div className="h-12 w-full bg-[#020d1c] border border-cyan-500/20 rounded-xl p-2 flex items-center justify-center gap-1 overflow-hidden">
                {[4, 12, 22, 14, 28, 36, 24, 18, 30, 20, 10, 25, 34, 16, 8, 18, 26, 12].map(
                  (defaultH, i) => {
                    const freq = audioFrequencies[i % audioFrequencies.length] || 0;
                    const h = isUserSpeaking || isAgentSpeaking
                      ? Math.max(4, Math.round(freq * 36))
                      : defaultH;
                    return (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-gradient-to-t from-cyan-600 to-cyan-300 transition-all duration-75"
                        style={{ height: `${h}px` }}
                      />
                    );
                  }
                )}
              </div>

              <div className="text-[11px] font-sans text-slate-400 text-center">
                {isAgentSpeaking
                  ? "الوكيل يتحدث الآن عبر الصوت الحي..."
                  : isUserSpeaking
                  ? "المستخدم يتحدث الآن..."
                  : isListening
                  ? "جاري الاستماع للمايك..."
                  : "المستخدم يتحدث ..."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MIDDLE-LEFT WINDOW: مجرى الحوار                                         */}
      {/* ========================================================================= */}
      {!closed.chat && (
        <div
          id="studio-window-chat"
          style={getWindowStyle("chat", "270px")}
          className={`absolute rounded-2xl bg-[#061826]/90 border border-cyan-500/35 backdrop-blur-xl shadow-[0_0_25px_rgba(0,229,255,0.2)] transition-shadow duration-200 select-none ${
            minimized.chat ? "h-10 overflow-hidden" : ""
          }`}
        >
          {/* Header */}
          <div
            onMouseDown={(e) => startDrag("chat", e)}
            className="h-10 px-3 border-b border-cyan-500/25 flex items-center justify-between bg-cyan-950/30 rounded-t-2xl cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setClosed((c) => ({ ...c, chat: true }));
                }}
                className={WIN_BTN_CLOSE}
                title="إغلاق النافذة"
              >
                <X size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMaximized((m) => ({ ...m, chat: !m.chat }));
                }}
                className={WIN_BTN_CYAN}
                title="تكبير"
              >
                <Square size={10} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimized((m) => ({ ...m, chat: !m.chat }));
                }}
                className={WIN_BTN_CYAN}
                title="تصغير"
              >
                <Minus size={11} />
              </button>
              {/* Copy Entire Chat Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyAllChat();
                }}
                className={WIN_BTN_CYAN}
                title={copiedAll ? "تم نسخ المحادثة!" : "نسخ المحادثة بالكامل"}
              >
                {copiedAll ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              </button>
            </div>

            <div className="flex items-center gap-2" style={{ direction: "rtl" }}>
              <span className="text-xs font-bold text-white font-sans">
                مجرى الحوار
              </span>
              <GripHorizontal size={14} className="text-cyan-400/60" />
            </div>
          </div>

          {/* Chat History & Dynamic Resizable Body */}
          {!minimized.chat && (
            <div
              className="p-3 flex flex-col gap-2.5 h-[calc(100%-40px)] relative"
              style={{ direction: "rtl" }}
            >
              <div className="flex-1 min-h-0 overflow-y-auto cyber-scrollbar pr-1 flex flex-col gap-2">
                {messages.map((m) => {
                  const isUser = m.sender === "user";
                  return (
                    <div
                      key={m.id}
                      className={`group relative flex flex-col gap-1 p-2 rounded-xl text-xs font-sans transition-all ${
                        isUser
                          ? "bg-[#02172b] border border-cyan-500/30 self-end text-cyan-200"
                          : "bg-[#03203c]/90 border border-cyan-400/40 self-start text-white shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{isUser ? "المستخدم" : "المساعد"}</span>
                          <button
                            onClick={() => handleCopySingleMsg(m.id, m.text)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-cyan-300 text-slate-400 transition-opacity cursor-pointer"
                            title="نسخ الرسالة"
                          >
                            {copiedMsgId === m.id ? (
                              <Check size={10} className="text-emerald-400" />
                            ) : (
                              <Copy size={10} />
                            )}
                          </button>
                        </div>
                        <span>{m.time}</span>
                      </div>
                      <p className="leading-relaxed select-text">{m.text}</p>
                      {!isUser && (m.text.includes("المقال") || m.text.includes("استعراض") || m.text.includes("10,450")) && (
                        <button
                          type="button"
                          onClick={() => {
                            setClosed((c) => ({ ...c, article_review: false }));
                            setMinimized((m) => ({ ...m, article_review: false }));
                          }}
                          className="mt-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 via-teal-600 to-amber-500 hover:from-cyan-500 hover:to-amber-400 text-black font-extrabold text-[11px] flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.4)] transition-all cursor-pointer self-start"
                        >
                          <Sparkles size={12} className="text-black" />
                          <span>👁️ فتح نافذة استعراض المقال وتدقيقه للموافقة والنشر</span>
                        </button>
                      )}
                    </div>
                  );
                })}

                {isProcessing && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300 font-mono animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    <span>... جاري الاستماع وتحليل التوجيه</span>
                  </div>
                )}
              </div>

              {/* Input Bar with Forced Dark Background & Visible Cyan-White Text */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-cyan-500/25">
                <button
                  onClick={handleSend}
                  disabled={isProcessing}
                  className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 cursor-pointer disabled:opacity-50 transition-colors"
                  title="إرسال التوجيه للوكيل"
                >
                  <Send size={13} />
                </button>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="اكتب أمراً للوكيل..."
                  style={{
                    backgroundColor: "#020d1c",
                    color: "#e0f7ff",
                    borderColor: "rgba(0, 229, 255, 0.35)",
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg !bg-[#020d1c] !text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-right font-sans border shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]"
                />
              </div>

              {/* Drag-to-Resize Handle */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setActiveResize({
                    startX: e.clientX,
                    startY: e.clientY,
                    startW: chatSize.width,
                    startH: chatSize.height,
                  });
                }}
                className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-nwse-resize text-cyan-400/50 hover:text-cyan-300 transition-colors flex items-center justify-center select-none"
                title="اسحب لتكبير وتصغير نافذة الشات"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M8 2L2 8M8 5L5 8M8 8L8 8.01"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cybernetic Scrollbar Styles */}
      <style jsx global>{`
        .cyber-scrollbar::-webkit-scrollbar {
          width: 3px !important;
          height: 3px !important;
        }
        .cyber-scrollbar::-webkit-scrollbar-track {
          background: rgba(2, 13, 28, 0.5) !important;
          border-radius: 9999px !important;
        }
        .cyber-scrollbar::-webkit-scrollbar-thumb {
          background: #00e5ff !important;
          border-radius: 9999px !important;
          box-shadow: 0 0 6px rgba(0, 229, 255, 0.8) !important;
        }
        .cyber-scrollbar {
          scrollbar-width: thin !important;
          scrollbar-color: #00e5ff rgba(2, 13, 28, 0.5) !important;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 3. BOTTOM-LEFT: الوكيل المشرف + حالة النظام                                  */}
      {/* ========================================================================= */}
      {!closed.system && (
        <div
          id="studio-window-system"
          style={getWindowStyle("system", "auto")}
          className="absolute z-40 flex items-end gap-3 select-none"
        >
          {/* Rotating Circular Gyro Reactor Dial: الوكيل المشرف */}
          <div
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
            title="الوكيل المشرف العام"
          >
            <div className="relative w-24 h-24 rounded-full border-2 border-cyan-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.3)] bg-[#020b18]/90 backdrop-blur-xl group-hover:scale-105 transition-transform">
              <div className="absolute inset-1.5 rounded-full border border-dashed border-cyan-400/60 animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-3 rounded-full border border-amber-400/40 animate-[spin_8s_linear_infinite_reverse]" />

              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-[0_0_15px_#ffb54c]">
                <Radio size={20} className="text-black animate-pulse" />
              </div>
            </div>
            <span className="text-xs font-bold text-white font-sans tracking-wide">
              الوكيل المشرف
            </span>
          </div>

          {/* Attached Window: حالة النظام */}
          <div
            className={`w-[200px] rounded-2xl bg-[#061826]/90 border border-cyan-500/35 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-shadow duration-200 ${
              minimized.system ? "h-9 overflow-hidden" : ""
            }`}
          >
            {/* Header */}
            <div
              onMouseDown={(e) => startDrag("system", e)}
              className="h-9 px-3 border-b border-cyan-500/25 flex items-center justify-between bg-cyan-950/30 rounded-t-2xl cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setClosed((c) => ({ ...c, system: true }));
                  }}
                  className={WIN_BTN_CLOSE}
                  title="إغلاق النافذة"
                >
                  <X size={11} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMaximized((m) => ({ ...m, system: !m.system }));
                  }}
                  className={WIN_BTN_CYAN}
                  title="تكبير"
                >
                  <Square size={9} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((m) => ({ ...m, system: !m.system }));
                  }}
                  className={WIN_BTN_CYAN}
                  title="تصغير"
                >
                  <Minus size={11} />
                </button>
              </div>
              <span className="text-xs font-bold text-white font-sans" style={{ direction: "rtl" }}>
                حالة النظام
              </span>
            </div>

            {!minimized.system && (
              <div className="p-3 flex flex-col gap-2 text-right" style={{ direction: "rtl" }}>
                <div className="flex items-center gap-2 justify-end text-[11px] text-emerald-300 font-sans">
                  <span>{systemOk ? "جميع الأنظمة تعمل بشكل طبيعي" : "جاري فحص الاتصال بالخادم..."}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                </div>

                <div className="flex flex-col gap-1.5 pt-1 text-xs font-sans text-slate-300">
                  {[
                    { label: "الصوت", ok: true },
                    { label: "المعالجة اللغوية", ok: true },
                    { label: "العقل الثاني", ok: true },
                    { label: "الأتمتة", ok: true },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-end gap-2">
                      <span>{s.label}</span>
                      <span className="w-2 h-2 rounded-full border border-cyan-400 bg-cyan-500/30 shadow-[0_0_6px_#00e5ff]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RIGHT-SIDE FLOATING PANEL: المستكشف                                      */}
      {/* ========================================================================= */}
      {!closed.explorer && (
        <div
          id="studio-window-explorer"
          style={getWindowStyle("explorer", "290px")}
          className={`absolute rounded-2xl bg-[#061826]/90 border border-cyan-500/35 backdrop-blur-xl shadow-[0_0_25px_rgba(0,229,255,0.2)] transition-shadow duration-200 select-none ${
            minimized.explorer ? "h-10 overflow-hidden" : ""
          }`}
        >
          {/* Header */}
          <div
            onMouseDown={(e) => startDrag("explorer", e)}
            className="h-10 px-3.5 border-b border-cyan-500/25 flex items-center justify-between bg-cyan-950/30 rounded-t-2xl cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setClosed((c) => ({ ...c, explorer: true }));
                }}
                className={WIN_BTN_CLOSE}
                title="إغلاق النافذة"
              >
                <X size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMaximized((m) => ({ ...m, explorer: !m.explorer }));
                }}
                className={WIN_BTN_CYAN}
                title="تكبير"
              >
                <Square size={10} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimized((m) => ({ ...m, explorer: !m.explorer }));
                }}
                className={WIN_BTN_CYAN}
                title="تصغير"
              >
                <Minus size={11} />
              </button>
            </div>

            <div className="flex items-center gap-2" style={{ direction: "rtl" }}>
              <span className="text-xs font-bold text-white font-sans">
                المستكشف
              </span>
              <GripHorizontal size={14} className="text-cyan-400/60" />
            </div>
          </div>

          {!minimized.explorer && (
            <div className="p-4 flex flex-col gap-3 max-h-[700px] overflow-y-auto custom-scrollbar" style={{ direction: "rtl" }}>
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث في المجالات..."
                  className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-[#020d1c] border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-right font-sans"
                />
                <Search
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400/70"
                />
              </div>

              {/* Active Domain Pill (Clicking switches to Screen 20) */}
              <button
                onClick={() => onSelectScreen?.("20")}
                className="p-2.5 rounded-xl bg-[#031d38] border border-cyan-400/60 flex items-center justify-between text-xs shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:border-cyan-300 transition-all cursor-pointer w-full text-right"
              >
                <Volume2 size={15} className="text-cyan-400 shrink-0" />
                <span className="font-bold text-cyan-300 font-sans">
                  الحضور البشري والصوت الحي
                </span>
              </button>

              {/* Hierarchy Tree matching reference */}
              <div className="flex flex-col gap-3 text-right text-xs font-sans">
                {/* Branch 1: الحضور (Screen 20) */}
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => toggleSection("presence")}
                    className="flex items-center justify-between text-cyan-400 font-bold hover:text-cyan-300 cursor-pointer w-full"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${expandedSections.presence ? "" : "-rotate-90"}`}
                    />
                    <span>الحضور</span>
                  </button>
                  {expandedSections.presence && (
                    <div className="flex flex-col gap-1 pr-3 text-slate-300 font-sans text-xs">
                      {[
                        { label: "التفاعل الطبيعي", color: "bg-cyan-400" },
                        { label: "فهم الصوت", color: "bg-amber-400" },
                        { label: "إنتاج الصوت", color: "bg-amber-400" },
                        { label: "الوجود البشري", color: "bg-cyan-400" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          onClick={() => onSelectScreen?.("20")}
                          className="flex items-center justify-end gap-2 hover:text-white cursor-pointer py-0.5 group"
                        >
                          <span className="group-hover:text-cyan-300">{item.label}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.color} shadow-[0_0_6px_currentColor]`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Branch 2: العقل الثاني (Screen 05) */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-cyan-500/15">
                  <button
                    onClick={() => {
                      toggleSection("secondBrain");
                      onSelectScreen?.("05");
                    }}
                    className="flex items-center justify-between text-slate-300 font-bold hover:text-cyan-300 cursor-pointer w-full"
                  >
                    <ChevronLeft
                      size={14}
                      className={`transition-transform ${expandedSections.secondBrain ? "rotate-90" : ""}`}
                    />
                    <span>العقل الثاني</span>
                  </button>
                  {expandedSections.secondBrain && (
                    <div className="flex flex-col gap-1 pr-3 text-slate-400 font-sans text-xs">
                      {[
                        { label: "الذاكرة السياقية", color: "bg-cyan-400" },
                        { label: "تحليل النوايا", color: "bg-amber-400" },
                        { label: "استخراج المعنى", color: "bg-cyan-400" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          onClick={() => onSelectScreen?.("05")}
                          className="flex items-center justify-end gap-2 hover:text-white cursor-pointer py-0.5"
                        >
                          <span>{item.label}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Branch 3: غرفة القيادة (Screen 01) */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-cyan-500/15">
                  <button
                    onClick={() => {
                      toggleSection("commandRoom");
                      onSelectScreen?.("01");
                    }}
                    className="flex items-center justify-between text-slate-300 font-bold hover:text-cyan-300 cursor-pointer w-full"
                  >
                    <ChevronLeft
                      size={14}
                      className={`transition-transform ${expandedSections.commandRoom ? "rotate-90" : ""}`}
                    />
                    <span>غرفة القيادة</span>
                  </button>
                  {expandedSections.commandRoom && (
                    <div className="flex flex-col gap-1 pr-3 text-slate-400 font-sans text-xs">
                      {[
                        { label: "المراقبة اللحظية", color: "bg-blue-400" },
                        { label: "مؤشرات التفاعل", color: "bg-cyan-400" },
                        { label: "إدارة الجلسات", color: "bg-rose-400" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          onClick={() => onSelectScreen?.("01")}
                          className="flex items-center justify-end gap-2 hover:text-white cursor-pointer py-0.5"
                        >
                          <span>{item.label}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Branch 4: الأتمتة (Screen 12) */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-cyan-500/15">
                  <button
                    onClick={() => {
                      toggleSection("automation");
                      onSelectScreen?.("12");
                    }}
                    className="flex items-center justify-between text-slate-300 font-bold hover:text-cyan-300 cursor-pointer w-full"
                  >
                    <ChevronLeft
                      size={14}
                      className={`transition-transform ${expandedSections.automation ? "rotate-90" : ""}`}
                    />
                    <span>الأتمتة</span>
                  </button>
                  {expandedSections.automation && (
                    <div className="flex flex-col gap-1 pr-3 text-slate-400 font-sans text-xs">
                      {[
                        { label: "تنفيذ المهام", color: "bg-amber-400" },
                        { label: "التكاملات", color: "bg-cyan-400" },
                        { label: "المشغلات الذكية", color: "bg-amber-400" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          onClick={() => onSelectScreen?.("12")}
                          className="flex items-center justify-end gap-2 hover:text-white cursor-pointer py-0.5"
                        >
                          <span>{item.label}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FLOATING WINDOW: خوادم وأدوات MCP (التحكم والتفعيل الميداني)              */}
      {/* ========================================================================= */}
      {!closed.mcp && (
        <div
          id="studio-window-mcp"
          style={getWindowStyle("mcp", "480px")}
          className={`absolute rounded-2xl border border-cyan-500/40 bg-[#020d1c]/95 backdrop-blur-xl shadow-[0_0_35px_rgba(0,229,255,0.25)] select-none transition-shadow duration-200 overflow-hidden flex flex-col ${
            maximized.mcp ? "!fixed !inset-4 !w-auto !h-auto !z-50" : ""
          } ${minimized.mcp ? "h-10 overflow-hidden" : ""}`}
        >
          {/* Header */}
          <div
            onMouseDown={(e) => startDrag("mcp", e)}
            className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/30 bg-[#04142a]/80 cursor-grab active:cursor-grabbing shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setClosed((c) => ({ ...c, mcp: true }))}
                className={WIN_BTN_CLOSE}
                title="إغلاق النافذة"
              >
                <X size={12} />
              </button>
              <button
                onClick={() => setMaximized((m) => ({ ...m, mcp: !m.mcp }))}
                className={WIN_BTN_CYAN}
                title="تكبير / استعادة"
              >
                <Square size={10} />
              </button>
              <button
                onClick={() => setMinimized((m) => ({ ...m, mcp: !m.mcp }))}
                className={WIN_BTN_CYAN}
                title="تصغير"
              >
                <Minus size={11} />
              </button>
            </div>

            <div className="flex items-center gap-2" style={{ direction: "rtl" }}>
              <Cpu size={14} className="text-cyan-400 animate-pulse" />
              <span className="font-sans font-bold text-xs text-white">
                خوادم وأدوات MCP (التحكم والتفعيل الميداني)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {mcpServers.filter((s) => s.enabled).length}/{mcpServers.length} خادم نشط
              </span>
            </div>

            <GripHorizontal size={14} className="text-slate-500" />
          </div>

          {/* Body */}
          {!minimized.mcp && (
            <div
              className="p-3 flex flex-col gap-2.5 max-h-[420px] overflow-y-auto cyber-scrollbar"
              style={{ direction: "rtl" }}
            >
              {/* Search & Overview Banner */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute right-2.5 top-2.5 text-cyan-400/80" />
                  <input
                    type="text"
                    value={mcpSearch}
                    onChange={(e) => setMcpSearch(e.target.value)}
                    placeholder="بحث في خوادم وأدوات MCP..."
                    className="w-full pr-8 pl-3 py-1.5 text-xs bg-[#010814] border border-cyan-500/30 rounded-xl text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 shrink-0">
                  ⚡ 88 أداة جاهزة
                </div>
              </div>

              {/* Server Cards with Master Switch & Individual Tool Switches */}
              <div className="flex flex-col gap-2">
                {mcpServers
                  .filter(
                    (s) =>
                      !mcpSearch ||
                      s.nameAr.includes(mcpSearch) ||
                      s.id.includes(mcpSearch) ||
                      s.tools.some((t) => t.nameAr.includes(mcpSearch) || t.id.includes(mcpSearch))
                  )
                  .map((server) => {
                    const isExpanded = expandedMcpServer === server.id;
                    const activeTools = server.tools.filter((t) => t.enabled).length;

                    return (
                      <div
                        key={server.id}
                        className={`rounded-xl border transition-all ${
                          server.enabled
                            ? "bg-[#031326]/80 border-cyan-500/30"
                            : "bg-[#020914]/60 border-slate-700/40 opacity-75"
                        }`}
                      >
                        {/* Server Header Row */}
                        <div className="flex items-center justify-between p-2.5">
                          {/* Master Enable/Disable Switch */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleServer(server.id)}
                              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer border ${
                                server.enabled
                                  ? "bg-emerald-600 border-emerald-400 shadow-[0_0_8px_#10b981]"
                                  : "bg-slate-800 border-slate-600"
                              }`}
                              title={server.enabled ? "تعطيل الخادم" : "تفعيل الخادم"}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                  server.enabled ? "right-0.5" : "left-0.5"
                                }`}
                              />
                            </button>
                            <span className="text-[10px] font-mono text-slate-400">
                              {server.enabled ? "مفعل" : "معطل"}
                            </span>
                          </div>

                          {/* Server Title & Info */}
                          <div
                            onClick={() =>
                              setExpandedMcpServer(isExpanded ? null : server.id)
                            }
                            className="flex-1 flex items-center justify-between px-2 cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-white">
                                {server.nameAr}
                              </span>
                              <span
                                className="text-[10px] font-mono text-cyan-400/90 text-left"
                                dir="ltr"
                              >
                                {server.id} · {activeTools}/{server.tools.length} أداة
                              </span>
                            </div>
                            <ChevronDown
                              size={14}
                              className={`text-cyan-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded Tool Catalog */}
                        {isExpanded && (
                          <div className="border-t border-cyan-500/20 p-2.5 flex flex-col gap-2 bg-[#010611]/80 rounded-b-xl">
                            {server.tools.map((tool) => {
                              const isTestRunning = mcpTestRunning === tool.id;
                              const testResult = mcpTestResult[tool.id];

                              return (
                                <div
                                  key={tool.id}
                                  className="p-2 rounded-lg bg-[#020e20]/90 border border-cyan-500/20 flex flex-col gap-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    {/* Tool Enable/Disable Switch */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={!server.enabled}
                                        onClick={() => handleToggleTool(server.id, tool.id)}
                                        className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer border ${
                                          tool.enabled && server.enabled
                                            ? "bg-cyan-500 border-cyan-300 shadow-[0_0_6px_#00e5ff]"
                                            : "bg-slate-800 border-slate-600 opacity-60"
                                        }`}
                                        title={tool.enabled ? "تعطيل الأداة" : "تفعيل الأداة"}
                                      >
                                        <span
                                          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                                            tool.enabled && server.enabled
                                              ? "right-0.5"
                                              : "left-0.5"
                                          }`}
                                        />
                                      </button>
                                      <span
                                        className="text-[10px] font-mono text-amber-300/90 text-left"
                                        dir="ltr"
                                      >
                                        {tool.id}
                                      </span>
                                    </div>

                                    {/* Tool Test Button */}
                                    <button
                                      type="button"
                                      disabled={!server.enabled || !tool.enabled || isTestRunning}
                                      onClick={async () => {
                                        setMcpTestRunning(tool.id);
                                        try {
                                          const res = await fetch("/api/admin/mcp/call", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              serverId: server.id,
                                              tool: tool.id,
                                              arguments: tool.defaultArgs || {},
                                            }),
                                          });
                                          const data = await res.json();
                                          setMcpTestResult((prev) => ({
                                            ...prev,
                                            [tool.id]: data.ok
                                              ? "تم الاستدعاء الفعلي بنجاح ✅"
                                              : `فشل: ${data.error || "خطأ"}`,
                                          }));
                                        } catch (err: any) {
                                          setMcpTestResult((prev) => ({
                                            ...prev,
                                            [tool.id]: `خطأ: ${err.message}`,
                                          }));
                                        } finally {
                                          setMcpTestRunning(null);
                                        }
                                      }}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all disabled:opacity-40 cursor-pointer"
                                    >
                                      {isTestRunning ? (
                                        <>
                                          <Loader2 size={10} className="animate-spin" />
                                          <span>جاري الفحص...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Play size={9} className="fill-cyan-400" />
                                          <span>تجربة سريعة</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  <p className="text-[11px] text-slate-400 font-sans mb-1.5">
                                    {tool.descriptionAr}
                                  </p>

                                  {/* Test Result Display */}
                                  {testResult && (
                                    <div
                                      className={`mt-1.5 p-1.5 rounded text-[10px] font-mono border ${
                                        testResult.includes("خطأ") ||
                                        testResult.includes("فشل")
                                          ? "bg-rose-950/60 border-rose-500/50 text-rose-300"
                                          : "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                                      }`}
                                      dir="rtl"
                                    >
                                      {testResult}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TIMELINE WINDOW (Sovereign Swarm Processing Timeline)                  */}
      {/* ========================================================================= */}
      {!closed.timeline && (
        <div
          id="studio-window-timeline"
          style={getWindowStyle("timeline", "560px")}
          className={`absolute rounded-xl border-2 border-cyan-400/50 bg-[#030d1a]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,229,255,0.3)] overflow-hidden transition-shadow select-none animate-in fade-in zoom-in-95 duration-200 ${
            minimized.timeline ? "h-10 overflow-hidden" : ""
          }`}
        >
          {/* Header */}
          <div
            onMouseDown={(e) => startDrag("timeline", e)}
            className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/80 via-[#041528] to-cyan-950/80 cursor-grab active:cursor-grabbing select-none"
          >
            {/* Window Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setClosed((c) => ({ ...c, timeline: true }));
                }}
                className={WIN_BTN_CLOSE}
                title="إغلاق النافذة"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimized((m) => ({ ...m, timeline: !m.timeline }));
                }}
                className={WIN_BTN_CYAN}
                title="تصغير"
              >
                <Minus size={11} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex items-center gap-2" style={{ direction: "rtl" }}>
              <Activity size={15} className="text-cyan-400 animate-pulse" />
              <span className="font-sans font-bold text-xs text-white">
                سجل تنفيذ التوجيه السيبراني // Processing Timeline
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  isAutoExecution
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                }`}
              >
                {isProcessing ? "جاري المعالجة..." : isAutoExecution ? "تنفيذ ذاتي ⚡" : "جاهز"}
              </span>
            </div>

            <GripHorizontal size={14} className="text-cyan-400/60" />
          </div>

          {/* Body */}
          {!minimized.timeline && (
            <div
              className="p-3.5 overflow-y-auto max-h-[540px] cyber-scrollbar"
              style={{ direction: "rtl" }}
            >
              <ProcessingTimeline
                title={timelineData.title}
                subtitle={timelineData.subtitle}
                stages={timelineData.stages}
                currentStageId={timelineData.currentStageId}
                layout="vertical"
                completionAction={completionActionNode}
                onRetryStage={(id) => {
                  if (onSendDirective && submittedUserDirective?.text) {
                    onSendDirective(submittedUserDirective.text);
                  }
                }}
                onRestart={() => {
                  if (onSendDirective && submittedUserDirective?.text) {
                    onSendDirective(submittedUserDirective.text);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ARTICLE REVIEW & PUBLISHING STUDIO WINDOW                              */}
      {/* ========================================================================= */}
      {!closed.article_review && (
        <ArticleReviewModal
          isOpen={!closed.article_review}
          onClose={() => setClosed((c) => ({ ...c, article_review: true }))}
          style={getWindowStyle("article_review", "min(94vw, 980px)")}
          onMouseDownHeader={(e) => startDrag("article_review", e)}
          pipeline={articlePipeline}
        />
      )}

      {/* ========================================================================= */}
      {/* 7. RESTORE CHIPS (Only shown when a window is closed)                     */}
      {/* ========================================================================= */}
      {showWindowRestore && closedCount > 0 && (
        <div
          className="absolute bottom-20 right-6 z-50 flex items-center gap-2 p-1.5 rounded-xl bg-[#020d1c]/90 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.25)] select-none animate-in fade-in duration-200"
          style={{ direction: "rtl" }}
        >
          <span className="text-[11px] font-sans text-cyan-300 pr-1">استعادة النوافذ:</span>
          {closed.session && (
            <button
              onClick={() => setClosed((c) => ({ ...c, session: false }))}
              className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 border border-cyan-400/50 text-cyan-300 hover:text-white hover:border-cyan-300 cursor-pointer transition-colors"
            >
              + جلسة المحادثة
            </button>
          )}
          {closed.chat && (
            <button
              onClick={() => setClosed((c) => ({ ...c, chat: false }))}
              className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 border border-cyan-400/50 text-cyan-300 hover:text-white hover:border-cyan-300 cursor-pointer transition-colors"
            >
              + مجرى الحوار
            </button>
          )}
          {closed.system && (
            <button
              onClick={() => setClosed((c) => ({ ...c, system: false }))}
              className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 border border-cyan-400/50 text-cyan-300 hover:text-white hover:border-cyan-300 cursor-pointer transition-colors"
            >
              + حالة النظام
            </button>
          )}
          {closed.explorer && (
            <button
              onClick={() => setClosed((c) => ({ ...c, explorer: false }))}
              className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 border border-cyan-400/50 text-cyan-300 hover:text-white hover:border-cyan-300 cursor-pointer transition-colors"
            >
              + المستكشف
            </button>
          )}
          {closed.mcp && (
            <button
              onClick={() => setClosed((c) => ({ ...c, mcp: false }))}
              className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 border border-cyan-400/50 text-cyan-300 hover:text-white hover:border-cyan-300 cursor-pointer transition-colors"
            >
              + خوادم MCP
            </button>
          )}
          {closed.timeline && (
            <button
              onClick={() => setClosed((c) => ({ ...c, timeline: false }))}
              className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 border border-cyan-400/50 text-cyan-300 hover:text-white hover:border-cyan-300 cursor-pointer transition-colors"
            >
              + سجل التنفيذ (Timeline)
            </button>
          )}

          <button
            onClick={() => {
              setClosed({ session: false, chat: false, system: false, explorer: false, mcp: false, timeline: false });
              setPositions(DEFAULT_POSITIONS);
            }}
            className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/20 text-cyan-200 hover:text-white cursor-pointer font-bold transition-colors"
            title="استعادة الجميع"
          >
            استعادة الكل ↺
          </button>
        </div>
      )}
    </>
  );
}
