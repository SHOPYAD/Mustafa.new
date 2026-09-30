"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Video,
  FileText,
  Share2,
  MessageSquare,
  Search,
  Settings,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";

export interface McpToolPreset {
  id: string;
  nameAr: string;
  category: "video" | "blog" | "ads" | "comms" | "aviation" | "system";
  serverId: string;
  tool: string;
  descriptionAr: string;
  defaultArgs: Record<string, unknown>;
}

export const MCP_POPULAR_PRESETS: McpToolPreset[] = [
  {
    id: "higgsfield_video",
    nameAr: "توليد فيديو سياحي ذكي (Higgsfield AI)",
    category: "video",
    serverId: "liotrip-higgsfield",
    tool: "higgsfield.generate_video",
    descriptionAr: "توليد مشهد سينمائي احترافي لوجهات دبي أو طرابزون عبر سحابة Higgsfield الرسمية",
    defaultArgs: {
      prompt: "Cinematic drone view of Dubai Marina skyline at sunset with luxury yacht sailing, golden hour lighting, 4k ultra realistic",
      destination: "دبي",
      durationSeconds: 5,
    },
  },
  {
    id: "google_flow_video",
    nameAr: "توليد فيديو فائق الدقة (Google Flow Ultra)",
    category: "video",
    serverId: "liotrip-google-flow",
    tool: "flow.generate_video",
    descriptionAr: "محرك الذكاء الاصطناعي التوليدي Google Flow لتوليد فيديوهات السفر الرأسية",
    defaultArgs: {
      prompt: "",
      destination: "",
      aspectRatio: "9:16",
    },
  },
  {
    id: "heygen_studio_video",
    nameAr: "فيديو متكلم وأسبوعي (Liotrip Studio)",
    category: "video",
    serverId: "liotrip-studio",
    tool: "studio.generate_video",
    descriptionAr: "إنشاء سيناريو وفيديو ترويجي متكامل للوجهات مع التعليق الصوتي والترجمة",
    defaultArgs: {
      destination: "",
      topic: "",
      voiceStyle: "professional_arabic",
    },
  },
  {
    id: "blog_writer",
    nameAr: "كتابة ونشر مقال سياحي متكامل (CMS Blog)",
    category: "blog",
    serverId: "liotrip-blog",
    tool: "blog.research_draft",
    descriptionAr: "بحث وصياغة مقال سياحي شامل متوافق مع معايير SEO مع العناوين والكلمات المفتاحية",
    defaultArgs: {
      title: "دليل السفر الشامل إلى شمال تركيا: طرابزون وأوزنجول وريزا",
      locale: "ar",
      targetKeyword: "سياحة طرابزون 2026",
      maxSections: 5,
    },
  },
  {
    id: "canva_design",
    nameAr: "إنشاء تصميم احترافي (Canva Connect)",
    category: "video",
    serverId: "liotrip-canva",
    tool: "canva.create_design",
    descriptionAr: "توليد قالب وبانر سياحي عالي الجودة متوافق مع أبعاد إنستغرام عبر Canva",
    defaultArgs: {
      designType: "instagram_post",
      theme: "عروض رحلات دبي VIP",
    },
  },
  {
    id: "whatsapp_cloud_notify",
    nameAr: "إرسال إشعار رسمي عبر واتساب (WhatsApp Cloud)",
    category: "comms",
    serverId: "liotrip-whatsapp",
    tool: "whatsapp.send_text",
    descriptionAr: "إرسال رسالة نصية أو تأكيد حجز معتمد للعميل عبر Cloud API الرسمي",
    defaultArgs: {
      to: "+966500000000",
      text: "مرحباً بكم في لوناليزا! تم استلام طلب حجزكم وتأكيده بنجاح من قبل الوكيل المشرف.",
    },
  },
  {
    id: "ads_campaign_report",
    nameAr: "تقرير وتحسين الحملات الإعلانية (Ads Director)",
    category: "ads",
    serverId: "liotrip-ads",
    tool: "ads.reports",
    descriptionAr: "تحليل كلفة النقرة والتحويل وحساب عائد الإنفاق الإعلاني ROAS وتوزيع الميزانية",
    defaultArgs: {
      period: "last_7_days",
      channel: "meta_and_google",
    },
  },
  {
    id: "tripadvisor_crawler",
    nameAr: "جلب وترجمة تقييمات الفنادق (TripAdvisor Reviews)",
    category: "aviation",
    serverId: "liotrip-tripadvisor-reviews",
    tool: "tripadvisor.sync_hotel",
    descriptionAr: "زحف آلي على تقييمات الفندق، وترجمتها للعربية، ومطابقة المشاعر",
    defaultArgs: {
      hotelName: "Swissotel The Bosphorus Istanbul",
      limit: 10,
    },
  },
  {
    id: "platform_admin_audit",
    nameAr: "فحص شامل للمنصة والخدمات (Platform Admin Audit)",
    category: "system",
    serverId: "lonaliza-platform-admin",
    tool: "admin.audit_platform",
    descriptionAr: "تدقيق عام لصحة الخدمات، اتصال PocketBase، ومفاتيح الذكاء الاصطناعي",
    defaultArgs: {
      includeMetrics: true,
      verifyGateways: true,
    },
  },
];

interface McpActionDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteSuccess?: (result: any) => void;
}

export default function McpActionDispatcherModal({
  isOpen,
  onClose,
  onExecuteSuccess,
}: McpActionDispatcherModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<McpToolPreset>(MCP_POPULAR_PRESETS[0]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [customServerId, setCustomServerId] = useState<string>(MCP_POPULAR_PRESETS[0].serverId);
  const [customToolName, setCustomToolName] = useState<string>(MCP_POPULAR_PRESETS[0].tool);
  const [argsJson, setArgsJson] = useState<string>(
    JSON.stringify(MCP_POPULAR_PRESETS[0].defaultArgs, null, 2)
  );
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [executing, setExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const filteredPresets = useMemo(() => {
    return MCP_POPULAR_PRESETS.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchSearch =
        p.nameAr.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.tool.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.serverId.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchFilter]);

  const handleSelectPreset = (p: McpToolPreset) => {
    setSelectedPreset(p);
    setCustomServerId(p.serverId);
    setCustomToolName(p.tool);
    setArgsJson(JSON.stringify(p.defaultArgs, null, 2));
    setExecutionResult(null);
    setExecutionError(null);
    setLatencyMs(null);
  };

  const handleExecute = async () => {
    setExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);
    setLatencyMs(null);

    let parsedArgs: Record<string, unknown> = {};
    try {
      if (argsJson.trim()) {
        parsedArgs = JSON.parse(argsJson);
      }
    } catch (err: any) {
      setExecutionError("صيغة JSON للمعاملات غير صحيحة: " + err.message);
      setExecuting(false);
      return;
    }

    const t0 = performance.now();
    try {
      const res = await fetch("/api/admin/mcp/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: customServerId,
          tool: customToolName,
          arguments: parsedArgs,
        }),
      });

      const elapsed = Math.round(performance.now() - t0);
      setLatencyMs(elapsed);

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || `HTTP ${res.status}: خطأ أثناء استدعاء الأداة`);
      }

      setExecutionResult(data);
      if (onExecuteSuccess) {
        onExecuteSuccess(data);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - t0);
      setLatencyMs(elapsed);
      setExecutionError(err.message || "فشل الاتصال بخادم MCP");
    } finally {
      setExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#020b18] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden text-right">
        {/* Header Bar */}
        <div className="h-16 px-6 border-b border-cyan-500/30 bg-[#031429]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition-all"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff] animate-ping" />
              <span>LIVE MCP RUNTIME · 21 SERVERS · 88 TOOLS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                مركز تنفيذ واستدعاء أدوات الوكيل السيبراني (MCP Action Dispatcher)
              </h2>
              <p className="text-[11px] text-cyan-400/80 font-mono">
                تشغيل أدوات Higgsfield و Google Flow والمدونة وواتساب وكافة خوادم المنظومة مباشرة
              </p>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">
          {/* Left Panel (Col 4): Presets & Tools Catalog */}
          <div className="col-span-5 border-l border-cyan-500/20 bg-[#020c1b]/95 p-4 flex flex-col min-h-0">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 text-[11px] font-mono scrollbar-none">
              {[
                { id: "all", label: "الكل" },
                { id: "video", label: "فيديو وتصميم" },
                { id: "blog", label: "المقالات" },
                { id: "ads", label: "الإعلانات" },
                { id: "comms", label: "واتساب" },
                { id: "aviation", label: "السياحة" },
                { id: "system", label: "النظام" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                    activeCategory === c.id
                      ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_#00e5ff]"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative mt-2 mb-3 shrink-0">
              <Search size={14} className="absolute right-3 top-2.5 text-cyan-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="بحث في الأدوات والخوادم..."
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-[#010814] border border-cyan-500/30 rounded-xl text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Preset Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredPresets.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`w-full text-right p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)] text-white"
                        : "bg-[#031122]/70 border-cyan-500/20 hover:border-cyan-500/40 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                        {p.serverId}
                      </span>
                      <span className="font-bold text-white text-xs">{p.nameAr}</span>
                    </div>
                    <div className="font-mono text-[11px] text-amber-300/90 text-left" dir="ltr">
                      {p.tool}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {p.descriptionAr}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel (Col 7): Parameter Config & Live Execution Console */}
          <div className="col-span-7 bg-[#020b18] p-5 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
            {/* Tool Identity Info */}
            <div className="p-3 rounded-xl bg-[#031326] border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{selectedPreset.nameAr}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedPreset.descriptionAr}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300">
                <Sparkles size={18} />
              </div>
            </div>

            {/* Editable Server & Tool Names */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-mono text-cyan-300 mb-1">
                  معرّف الخادم (Server ID)
                </label>
                <input
                  type="text"
                  value={customServerId}
                  onChange={(e) => setCustomServerId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#010814] border border-cyan-500/30 rounded-xl text-cyan-200"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-cyan-300 mb-1">
                  اسم الأداة (Tool Name)
                </label>
                <input
                  type="text"
                  value={customToolName}
                  onChange={(e) => setCustomToolName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#010814] border border-cyan-500/30 rounded-xl text-cyan-200"
                  dir="ltr"
                />
              </div>
            </div>

            {/* JSON Arguments Editor */}
            <div className="mt-3 flex-1 flex flex-col min-h-[160px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-400">
                  معاملات الاستدعاء (Arguments Payload JSON)
                </span>
                <span className="text-[10px] font-mono text-cyan-400">RFC 8259 Compliant</span>
              </div>
              <textarea
                value={argsJson}
                onChange={(e) => setArgsJson(e.target.value)}
                className="w-full flex-1 p-3 text-xs font-mono bg-[#010611] border border-cyan-500/30 rounded-xl text-emerald-300 focus:outline-none focus:border-cyan-400 resize-none custom-scrollbar"
                dir="ltr"
                rows={7}
              />
            </div>

            {/* Execution Trigger Bar */}
            <div className="mt-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {latencyMs !== null && (
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                    الزمن: {latencyMs}ms
                  </span>
                )}
                {executionResult && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                    <CheckCircle2 size={13} />
                    <span>تم التنفيذ بنجاح</span>
                  </span>
                )}
                {executionError && (
                  <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/40">
                    <AlertTriangle size={13} />
                    <span>خطأ في الاستدعاء</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleExecute}
                disabled={executing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs font-mono shadow-[0_0_20px_#00e5ff] transition-all active:scale-95 disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-black" />
                    <span>جاري التنفيذ العصبي...</span>
                  </>
                ) : (
                  <>
                    <Play size={15} className="fill-black text-black" />
                    <span>تنفيذ الأداة فورياً عبر الخادم</span>
                  </>
                )}
              </button>
            </div>

            {/* Execution Result Log Terminal */}
            {(executionResult || executionError) && (
              <div className="mt-4 p-3 rounded-xl bg-[#01050d] border border-cyan-500/40 text-xs font-mono flex flex-col max-h-[180px] overflow-hidden">
                <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20 mb-2">
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1.5">
                    <Terminal size={12} />
                    <span>CONSOLE OUTPUT</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(executionResult || executionError, null, 2)
                      );
                    }}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy size={11} />
                    <span>نسخ</span>
                  </button>
                </div>
                <pre
                  className="flex-1 overflow-y-auto text-[11px] text-cyan-200 custom-scrollbar whitespace-pre-wrap"
                  dir="ltr"
                >
                  {executionError
                    ? `[ERROR] ${executionError}`
                    : JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
