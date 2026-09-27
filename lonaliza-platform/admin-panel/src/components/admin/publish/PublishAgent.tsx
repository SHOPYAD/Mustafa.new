"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  Zap,
  Globe,
  Database,
  Cpu,
  Sliders,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Search,
  CloudSun,
  Star,
  Activity,
  ChevronDown,
  ChevronUp,
  Settings2,
  Wrench,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublishShell } from "./PublishShell";

type ChatRow = {
  id: string;
  role: "user" | "agent";
  text: string;
  mcpActions?: string[];
  timestamp?: string;
};

type McpServerInfo = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  icon: React.ElementType;
  color: string;
  isEnabled: boolean;
  status: "connected" | "standby";
  toolsCount: number;
};

const INITIAL_MCP_SERVERS: McpServerInfo[] = [
  {
    id: "meta_graph",
    nameAr: "سيرفر Meta Graph API MCP",
    nameEn: "Meta Social Publisher MCP",
    descriptionAr: "نشر البوستات، مقاطع الريلز، والقصص وتعيين الروابط المباشرة لفيسبوك وإنستغرام.",
    icon: Share2,
    color: "blue",
    isEnabled: true,
    status: "connected",
    toolsCount: 6,
  },
  {
    id: "browser_use",
    nameAr: "سيرفر Browser Use MCP",
    nameEn: "Browser Use & Web Scraper",
    descriptionAr: "تصفح وزحف أحدث تريندات السفر الدولية، منشورات المنافسين، ومواعيد الفعاليات.",
    icon: Globe,
    color: "emerald",
    isEnabled: true,
    status: "connected",
    toolsCount: 4,
  },
  {
    id: "tripadvisor_reviews",
    nameAr: "سيرفر TripAdvisor MCP",
    nameEn: "TripAdvisor & Hotel Reviews MCP",
    descriptionAr: "استيراد تقييمات الفنادق والأنشطة السياحية لاقتباسها تلقائياً في نصوص المنشورات.",
    icon: Star,
    color: "amber",
    isEnabled: true,
    status: "connected",
    toolsCount: 3,
  },
  {
    id: "weather_radar",
    nameAr: "سيرفر Weather & Flight MCP",
    nameEn: "Live Weather & Aviation Radar",
    descriptionAr: "الاستعلام عن درجات الحرارة ومواعيد رحلات الطيران الحية لتضمينها في بوستات السفر.",
    icon: CloudSun,
    color: "sky",
    isEnabled: true,
    status: "connected",
    toolsCount: 5,
  },
  {
    id: "google_search",
    nameAr: "سيرفر Google Trends MCP",
    nameEn: "Google Search & Keyword Trends",
    descriptionAr: "اكتشاف الكلمات المفتاحية الأكثر بحثاً عن وجهات السفر لتعزيز السيو والوصول.",
    icon: Search,
    color: "purple",
    isEnabled: true,
    status: "connected",
    toolsCount: 3,
  },
  {
    id: "lonaliza_db",
    nameAr: "سيرفر قاعدة بيانات لوناليزا MCP",
    nameEn: "Lonaliza Platform Database MCP",
    descriptionAr: "استعلام مباشر عن الباقات المعتمدة، أسعار الفنادق، وعروض الرحلات لنشرها فوراً.",
    icon: Database,
    color: "indigo",
    isEnabled: true,
    status: "connected",
    toolsCount: 7,
  },
];

const WELCOME: ChatRow = {
  id: "welcome",
  role: "agent",
  text: "مرحباً! أنا وكيل النشر والمحتوى الاجتماعي (AI Social Media Strategist). متصل بخلية الوكلاء المركزية (Agent Swarm War Room) ومربوط بـ 6 سيرفرات MCP نشطة. يمكنني توليد محتوى تسويقي احترافي، استخراج التريندات، وجدولة البوستات والريلز تلقائياً باسم علامتك التجارية.",
  mcpActions: [
    "الاتصال بخلية الوكلاء: متزامن مع المشرف التنفيذي",
    "سيرفرات MCP: 6 سيرفرات مفعلة وجاهزة للاستدعاء",
  ],
  timestamp: "الآن",
};

export function PublishAgent() {
  const [messages, setMessages] = useState<ChatRow[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMcpPanel, setShowMcpPanel] = useState(true);
  const [showModelConfig, setShowModelConfig] = useState(false);

  // Model selection state
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [reasoningEffort, setReasoningEffort] = useState<"fast" | "balanced" | "deep">("balanced");

  // MCP Servers state
  const [mcpServers, setMcpServers] = useState<McpServerInfo[]>(INITIAL_MCP_SERVERS);

  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const toggleMcpServer = (id: string) => {
    setMcpServers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleSendPrompt = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend || loading) return;
    if (!customPrompt) setInput("");

    const now = new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
    const userRow: ChatRow = {
      id: `u-${Date.now()}`,
      role: "user",
      text: promptToSend,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userRow]);
    setLoading(true);

    try {
      // Determine relevant MCP tools called based on prompt
      const mcpCalls: string[] = [];
      const lower = promptToSend.toLowerCase();

      if (lower.includes("تريند") || lower.includes("بحث") || lower.includes("سوق")) {
        mcpCalls.push("MCP: Google Trends Search -> استعلام الكلمات الأكثر بحثاً عن وجهات تركيا");
        mcpCalls.push("MCP: Browser Use -> تحليل أفضل المنشورات الرائجة في تيك توك وإنستغرام");
      }
      if (lower.includes("كابادوكيا") || lower.includes("إسطنبول") || lower.includes("طرابزون") || lower.includes("باقة") || lower.includes("رحل")) {
        mcpCalls.push("MCP: Lonaliza Database -> جلب تفاصيل الباقة الفاخرة والصور المعتمدة");
        mcpCalls.push("MCP: TripAdvisor Reviews -> استخراج تقييم 4.9/5 لرحلات المنطاد والمرسيدس VIP");
      }
      if (lower.includes("نشر") || lower.includes("جدول") || lower.includes("ريل") || lower.includes("بوست")) {
        mcpCalls.push("MCP: Meta Graph API -> تجهيز أبعاد المنشور (1080x1350) والهاشتاغات المستهدفة");
      }

      // Simulated realistic response from the connected swarm agent
      await new Promise((r) => setTimeout(r, 1200));

      let reply = "";
      if (lower.includes("ريل") || lower.includes("فيديو")) {
        reply = `تم إعداد سيناريو ريل فاخر من 30 ثانية باستخدام نموذج ${selectedModel === "gemini-2.5-pro" ? "Gemini 2.5 Pro (التحليل العميق)" : "Gemini 2.5 Flash"}:

🎬 العنوان البصري: «سحر كابادوكيا كما لم تره من قبل»
✨ المشهد 1 (0-5 ث): شروق الشمس مع تحليق 100 منطاد ملون وصوت هادئ.
☕ المشهد 2 (5-15 ث): إفطار تركي تقليدي على شرفة فندق كهفي فاخر 5 نجوم.
🚐 المشهد 3 (15-25 ث): جولة بمرسيدس فيتو VIP بين أودية الدير والوادي الأحمر.
📲 المشهد 4 (25-30 ث): دعوة لاتخاذ إجراء: احجز برنامجك المتكامل الآن عبر رابط البايو.

🏷️ الهاشتاغات المعتمدة: #كابادوكيا #سياحة_تركيا #سفر_فاخر #لوناليزا #سياحة_العرب
📅 تم تمرير المسودة إلى جدول النشر التلقائي للمصادقة.`;
      } else if (lower.includes("تريند") || lower.includes("بحث")) {
        reply = `بناءً على استعلام سيرفر Browser Use و Google Trends MCP، إليك أهم 3 محاور سياحية تتصدر اهتمام المسافرين الخليجيين هذا الأسبوع:
1. الجولات الخريفية في طرابزون وأوزنجول وأيدر (ارتفاع البحث بنسبة +38%).
2. عروض الإقامة الفاخرة المطلة على البوسفور في إسطنبول (ارتفاع الحجوزات بنسبة +24%).
3. باقات الإجازات القصيرة المجمعة (طيران + فندق 5 نجوم + نقل VIP).

تمت مشاركة هذه النتائج تلقائياً مع وكيل الإعلانات ووكيل المبيعات في غرفة عمليات الوكلاء (War Room).`;
      } else {
        reply = `تمت معالجة طلبك بنجاح بواسطة وكيل النشر والمحتوى الاجتماعي بالتعاون مع خلية الوكلاء. تم توليد النص التسويقي، تجهيز الوسوم المعتمدة، وإرسال إشعار للمشرف التنفيذي لاعتماد الجدولة عبر قنوات الربط الرسمية المفتوحة.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "agent",
          text: reply,
          mcpActions: mcpCalls.length > 0 ? mcpCalls : ["MCP: Swarm Hive Coordination -> مزامنة مع وكيل الإعلانات"],
          timestamp: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "agent",
          text: "حدث خطأ غير متوقع أثناء معالجة الأمر. يرجى إعادة المحاولة.",
          timestamp: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublishShell
      title="وكيل النشر والمحتوى الذكي (AI Swarm Publishing Agent)"
      description="وكيل ذكاء اصطناعي متكامل متصل بخلية الوكلاء المركزية (War Room) ومزود بـ 6 سيرفرات MCP للبحث في التريندات والجدولة التلقائية."
    >
      <div className="space-y-6" dir="rtl">
        {/* Top Swarm Connection & War Room Live Bar */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/15 via-indigo-900/10 to-transparent dark:from-purple-950/40 dark:via-slate-900 border border-purple-200/80 dark:border-purple-900/40 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    وكيل النشر والمحتوى الاجتماعي (Social Media Agent)
                  </h2>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 shadow-xs">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>متصل بخلية الوكلاء المركزية (Swarm War Room)</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  يعمل بتنسيق لحظي مع وكيل الإعلانات ووكيل المبيعات ويستدعي أدوات الـ MCP لتحليل التريندات ونشر المحتوى المعتمد.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowModelConfig(!showModelConfig)}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>إعدادات النموذج ({selectedModel.replace("gemini-", "").replace("claude-", "")})</span>
                {showModelConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <Link
                href="/admin/agent-war-room"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-black shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-amber-300" />
                <span>غرفة عمليات الوكلاء (War Room) ↗</span>
              </Link>
            </div>
          </div>

          {/* Model Configuration Dropdown Panel */}
          {showModelConfig && (
            <div className="mt-4 pt-4 border-t border-purple-200/60 dark:border-purple-900/40 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  نموذج الذكاء الاصطناعي (AI Model)
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (فائق السرعة - جدولة فورية)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (تفكير عميق - استراتيجيات متقدمة)</option>
                  <option value="claude-3.7-sonnet">Claude 3.7 Sonnet (صياغة أدبية وتسويقية إبداعية)</option>
                  <option value="gpt-4o">GPT-4o Omnichannel (تحليل متعدد الوسائط والوسوم)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>درجة الإبداع (Temperature)</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  مستوى الاستدلال (Reasoning Effort)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["fast", "balanced", "deep"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setReasoningEffort(lvl)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        reasoningEffort === lvl
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {lvl === "fast" ? "سريع" : lvl === "balanced" ? "متوازن" : "عميق"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MCP Servers & Tools Management Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>سيرفرات وأدوات الـ MCP المربوطة بوكيل النشر (Model Context Protocol)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-black">
                    {mcpServers.filter((s) => s.isEnabled).length} / {mcpServers.length} مفعّل
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  يمكنك تفعيل أو تعطيل أي سيرفر MCP للتحكم في الصلاحيات والأدوات التي يستدعيها الوكيل أثناء توليد وجدولة المحتوى.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMcpPanel(!showMcpPanel)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{showMcpPanel ? "إخفاء السيرفرات" : "عرض السيرفرات"}</span>
              {showMcpPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showMcpPanel && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fadeIn">
              {mcpServers.map((srv) => {
                const Icon = srv.icon;
                return (
                  <div
                    key={srv.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      srv.isEnabled
                        ? "bg-slate-50/70 dark:bg-slate-850/60 border-slate-200 dark:border-slate-700/80 shadow-xs"
                        : "bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{srv.nameAr}</h4>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{srv.nameEn}</span>
                          </div>
                        </div>

                        {/* Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={srv.isEnabled}
                            onChange={() => toggleMcpServer(srv.id)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600" />
                        </label>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                        {srv.descriptionAr}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${srv.isEnabled ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span className={srv.isEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
                          {srv.isEnabled ? "جاهز للاستدعاء" : "معطل"}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono">{srv.toolsCount} أدوات نشطة</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Swarm Interactive Chat Console */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 bg-gradient-to-l from-purple-500/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                <Bot className="size-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">منصة محادثة وكيل النشر الذكي</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  نموذج: {selectedModel} • حرارة: {temperature} • استدلال: {reasoningEffort}
                </p>
              </div>
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendPrompt("افحص أحدث تريندات السفر إلى إسطنبول وكابادوكيا عبر الـ MCP")}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[11px] font-bold transition-all border border-purple-200/60 dark:border-purple-800/40 cursor-pointer"
              >
                <span>تريندات السفر 🔍</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendPrompt("أنشئ سيناريو ريل فاخر 30 ثانية عن رحلة المنطاد في كابادوكيا مع الوسوم")}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition-all border border-indigo-200/60 dark:border-indigo-800/40 cursor-pointer"
              >
                <span>ريل سياحي 📸</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendPrompt("صياغة منشور عروض الخريف للمرسيدس VIP في طرابزون وجدولته غداً")}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-all border border-emerald-200/60 dark:border-emerald-800/40 cursor-pointer"
              >
                <span>جدولة عرض VIP 🚗</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollerRef} className="max-h-[500px] min-h-[340px] space-y-4 overflow-y-auto bg-slate-50/40 dark:bg-slate-950/40 p-5">
            {messages.map((row) => (
              <div key={row.id} className={cn("flex gap-3", row.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-xs",
                    row.role === "user"
                      ? "bg-gradient-to-br from-purple-700 to-indigo-700 text-white"
                      : "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  )}
                >
                  {row.role === "user" ? "أنت" : <Bot className="size-4" />}
                </div>

                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl px-4 py-3.5 text-xs leading-relaxed space-y-2 shadow-xs",
                    row.role === "user"
                      ? "bg-purple-700 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none"
                  )}
                >
                  {/* MCP Tool Execution Badges if any */}
                  {row.mcpActions && row.mcpActions.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {row.mcpActions.map((act, i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 text-[10px] font-mono flex items-center gap-1.5"
                        >
                          <Zap className="size-3 text-amber-500 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="whitespace-pre-line leading-relaxed font-sans">{row.text}</div>

                  {row.timestamp && (
                    <div className={cn("text-[10px] font-mono text-end opacity-70", row.role === "user" ? "text-purple-200" : "text-slate-400")}>
                      {row.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200/60 dark:border-purple-800/40 w-fit">
                <Loader2 className="size-4 animate-spin text-purple-600" />
                <span>الوكيل يستدعي سيرفرات الـ MCP وينسق مع خلية العمليات...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendPrompt();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب أمراً لوكيل النشر (مثال: جدول ريل لعروض طرابزون غداً 10 صباحاً مع الهاشتاغات)..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/10 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-black shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              <span>إرسال</span>
            </button>
          </form>
        </div>
      </div>
    </PublishShell>
  );
}
