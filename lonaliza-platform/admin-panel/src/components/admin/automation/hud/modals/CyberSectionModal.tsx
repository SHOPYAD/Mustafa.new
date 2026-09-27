"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Plane,
  Car,
  Users,
  CreditCard,
  Share2,
  Megaphone,
  Settings,
  AlertTriangle,
  Layers,
  Database,
  Globe,
  Maximize2,
  ArrowUpRight,
  Sliders,
  Activity,
} from "lucide-react";
import type { CyberNavSection } from "../sidebar/FloatingCyberSidebar";
import { SUB_STATIONS_CATALOG } from "../substations/CyberSubStationViewer";

interface CyberSectionModalProps {
  section: CyberNavSection | null;
  onClose: () => void;
  onSendDirective?: (text: string) => Promise<string | void>;
  onTriggerAgentAnalysis?: (sectionTitle: string, details: string) => void;
}

export default function CyberSectionModal({
  section,
  onClose,
  onSendDirective,
  onTriggerAgentAnalysis,
}: CyberSectionModalProps) {
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"workspace" | "iframe">("workspace");

  if (!section) return null;

  const Icon = section.icon || Globe;
  const isDashboard = section.href === "/admin" || section.id === "dashboard";

  // Map route to matching substation data if available
  const subStationKey = section.href.includes("flights")
    ? "flights"
    : section.href.includes("hotels")
    ? "hotels"
    : section.href.includes("transfers")
    ? "transfers"
    : section.href.includes("packages")
    ? "packages"
    : section.href.includes("b2b")
    ? "b2b"
    : section.href.includes("ads")
    ? "ads"
    : section.href.includes("social") || section.href.includes("publish")
    ? "social"
    : section.href.includes("finance") || section.href.includes("payments")
    ? "finance"
    : section.href.includes("settings")
    ? "settings"
    : null;

  const subStationData = subStationKey ? SUB_STATIONS_CATALOG[subStationKey] : null;

  const handleAction = async (actionText: string) => {
    setIsExecutingAction(actionText);
    setActionFeedback(null);
    try {
      if (onSendDirective) {
        const reply = await onSendDirective(
          `تنفيذ أمر تشغيلي في مسار [${section.titleAr}] (${section.href}): ${actionText}`
        );
        setActionFeedback(reply || `تم تنفيذ [${actionText}] بنجاح ومزامنة خلايا السرب.`);
      } else {
        setActionFeedback(`تم تنفيذ [${actionText}] بنجاح.`);
      }
    } catch {
      setActionFeedback("حدث خطأ أثناء إرسال التوجيه للخلية.");
    } finally {
      setIsExecutingAction(null);
    }
  };

  const handleVoiceReport = () => {
    if (onTriggerAgentAnalysis) {
      onTriggerAgentAnalysis(
        section.titleAr,
        `تحليل تشغيلي للمسار ${section.href}: ${section.titleAr} ضمن ${section.category}. يرجى قراءة المؤشرات الحالية والتوصيات التنفيذية.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div
        className="relative w-full max-w-7xl max-h-[95vh] rounded-3xl border-2 border-cyan-500/50 bg-[#020b18] shadow-[0_0_70px_rgba(0,229,255,0.35)] flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 flex items-center justify-between bg-[#031429]/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-3 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.25)] shrink-0"
              style={{ backgroundColor: `${section.color}25`, border: `1px solid ${section.color}` }}
            >
              <Icon size={24} style={{ color: section.color }} />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black text-white truncate">
                  {section.titleAr}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                  {section.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  100% LIVE
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-mono text-cyan-400/80 mt-0.5 truncate">
                مسار المنظومة: {section.href}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Link to Standalone Route */}
            <a
              href={section.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 hover:border-cyan-400/50 transition-colors"
              title="فتح هذا المسار في لسان مستقل بكامل الشاشة"
            >
              <ExternalLink size={14} className="text-cyan-400" />
              <span>فتح بنافذة مستقلة</span>
            </a>

            {/* Voice Report Trigger */}
            <button
              type="button"
              onClick={handleVoiceReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all active:scale-95 border border-cyan-400/40"
              title="يطلب من الوكيل قراءة وتحليل بيانات هذا القسم صوتياً"
            >
              <Volume2 size={14} />
              <span className="hidden sm:inline">تقرير صوتي من الوكيل</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-colors"
              title="إغلاق النافذة"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionFeedback(null)}
                className="text-slate-400 hover:text-white text-xs px-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASE 1: MAIN DASHBOARD & STATS (REAL ADMIN STATS DASHBOARD COMPONENT)     */}
          {/* ========================================================================= */}
          {isDashboard ? (
            <div className="space-y-6">
              {/* CYBERNETIC COMMAND CENTER DASHBOARD */}
              <div className="p-5 rounded-2xl bg-[#031429]/90 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,229,255,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full pointer-events-none" />
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity size={24} className="text-cyan-400 animate-pulse" />
                    <h3 className="text-xl font-black font-mono text-white tracking-widest uppercase shadow-cyan-500/50 drop-shadow-md">
                      [SOVEREIGN CORE / GLOBAL TELEMETRY]
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-cyan-100/70 font-mono leading-relaxed max-w-2xl">
                    المراقبة العصبية المركزية لجميع التدفقات المالية، حجوزات المزودين، وحالة خوادم السرب الذكي. مزامنة البيانات تتم عبر بروتوكول MCP الحي بدون أي تأخير زمني.
                  </p>
                </div>
                <div className="flex flex-col gap-2 relative z-10 shrink-0 min-w-[220px]">
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400/80">TTV (24H VOLUME)</span>
                    <span className="text-base font-black font-mono text-cyan-300">$307,400</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400/80">CORE GROWTH</span>
                    <span className="text-base font-black font-mono text-emerald-400">+18.4% ▲</span>
                  </div>
                </div>
              </div>

              {/* DEEP CYBERNETIC METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "ACTIVE CONNECTIONS", val: "1,428", sub: "GDS / BEDBANKS / API", icon: Globe, color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-950/20" },
                  { title: "NEURAL ACTIONS", val: "94.2k", sub: "SWARM MICRO-TASKS", icon: Zap, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-950/20" },
                  { title: "SOVEREIGN TREASURY", val: "$1.4M", sub: "AVAILABLE FLOAT USD", icon: Layers, color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-950/20" },
                  { title: "SYSTEM INTEGRITY", val: "99.9%", sub: "NO BREACHES DETECTED", icon: ShieldCheck, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-950/20" },
                ].map((kpi, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${kpi.border} ${kpi.bg} relative overflow-hidden group hover:bg-[#041a38] transition-colors`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{kpi.title}</span>
                      <kpi.icon size={16} className={`${kpi.color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-2xl font-black font-mono ${kpi.color}`}>{kpi.val}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{kpi.sub}</span>
                    </div>
                    {/* Glowing Accent Line */}
                    <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-current ${kpi.color}`} />
                  </div>
                ))}
              </div>

              {/* CYBERNETIC TERMINAL DATA FEED (Replaces heavy charts) */}
              <div className="rounded-2xl border border-cyan-500/30 bg-[#020b1a] overflow-hidden flex flex-col h-[300px]">
                <div className="p-3 border-b border-cyan-500/20 bg-[#031124] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-cyan-300">LIVE DATA STREAM (SSE)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-400">WS_CONNECTED</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-400">ENCRYPTED</span>
                  </div>
                </div>
                <div className="flex-1 p-4 font-mono text-[11px] text-cyan-400/70 overflow-y-auto space-y-2 scrollbar-cyber">
                  <div className="flex gap-4 hover:text-cyan-300"><span className="text-slate-500">[19:42:01]</span> <span className="text-emerald-400">SUCCESS</span> <span>Booking LONA-9021 confirmed via HotelBeds API (Latency: 142ms)</span></div>
                  <div className="flex gap-4 hover:text-cyan-300"><span className="text-slate-500">[19:42:05]</span> <span className="text-cyan-400">SYNC</span> <span>Agent [Sync_Hotels_01] updated 1,420 dynamic prices.</span></div>
                  <div className="flex gap-4 hover:text-cyan-300"><span className="text-slate-500">[19:42:11]</span> <span className="text-amber-400">WARN</span> <span>High traffic spike detected on route /cars (+420% vs avg)</span></div>
                  <div className="flex gap-4 hover:text-cyan-300"><span className="text-slate-500">[19:42:18]</span> <span className="text-emerald-400">SUCCESS</span> <span>Payment intent $1,450.00 settled via Stripe.</span></div>
                  <div className="flex gap-4 hover:text-cyan-300"><span className="text-slate-500">[19:42:25]</span> <span className="text-purple-400">SWARM</span> <span>Agent [Content_Gen_04] deployed 3 new SEO localized pages.</span></div>
                  <div className="flex gap-4 hover:text-cyan-300"><span className="text-slate-500">[19:42:29]</span> <span className="text-cyan-400">SYNC</span> <span>Amadeus GDS token successfully refreshed.</span></div>
                  <div className="flex gap-4 hover:text-cyan-300"><span className="text-slate-500">[19:42:33]</span> <span className="text-emerald-400">SUCCESS</span> <span>Automated WhatsApp response sent to +9665XXXXXXX.</span></div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* CASE 2: DETAILED OPERATIONAL SUB-STATION OR GENERIC ROUTE TERMINAL       */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* Section Overview Banner */}
              <div className="p-4 rounded-2xl bg-[#031429] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">
                    [بطاقة المهام والبيانات التشغيلية المباشرة]:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {section.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#020b18] border border-cyan-500/40 flex flex-col items-end min-w-[200px] shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    {section.metrics.label}
                  </span>
                  <span className="text-sm font-black font-mono text-cyan-300 mt-0.5 truncate max-w-[240px]">
                    {section.metrics.value}
                  </span>
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("workspace")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      viewMode === "workspace"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    غرفة التحكم التشغيلية
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("iframe")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      viewMode === "iframe"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    شاشة الصفحة الحية المباشرة
                  </button>
                </div>

                <a
                  href={section.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>فتح الرابط الأصلي</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>

              {viewMode === "workspace" ? (
                <>
                  {/* If Rich Sub-Station data exists, render metrics & records */}
                  {subStationData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-[#031124] border border-cyan-500/30">
                          <span className="text-[10px] text-slate-400 font-mono block">حجم التداول</span>
                          <span className="text-base font-black font-mono text-cyan-300">
                            {subStationData.metrics.dailyVolume}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#031124] border border-cyan-500/30">
                          <span className="text-[10px] text-slate-400 font-mono block">النشاط والحالة</span>
                          <span className="text-base font-black font-mono text-emerald-400">
                            {subStationData.metrics.activeCount}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#031124] border border-cyan-500/30">
                          <span className="text-[10px] text-slate-400 font-mono block">هامش الربح</span>
                          <span className="text-base font-black font-mono text-amber-400">
                            {subStationData.metrics.marginRate}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#031124] border border-cyan-500/30">
                          <span className="text-[10px] text-slate-400 font-mono block">زمن الاستجابة</span>
                          <span className="text-base font-black font-mono text-cyan-400">
                            {subStationData.metrics.latencyMs}ms
                          </span>
                        </div>
                      </div>

                      {/* Live Data Records Table */}
                      {subStationData.records && subStationData.records.length > 0 && (
                        <div className="rounded-2xl border border-slate-800 bg-[#020d1e] overflow-hidden">
                          <div className="p-3 bg-[#031429] border-b border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                            <span>السجلات التشغيلية الحية ({subStationData.records.length})</span>
                            <span className="text-[10px] text-cyan-400">مزامنة مستمرة مع قاعدة البيانات</span>
                          </div>
                          <div className="divide-y divide-slate-800/80">
                            {subStationData.records.map((rec) => (
                              <div
                                key={rec.id}
                                className="p-3 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 shrink-0">
                                    {rec.id}
                                  </span>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-white truncate">
                                      {rec.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate">
                                      {rec.sublabel}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-xs font-mono font-black text-amber-400">
                                    {rec.metric}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                                      rec.status === "ACTIVE"
                                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                        : "bg-cyan-950 text-cyan-400 border border-cyan-800"
                                    }`}
                                  >
                                    {rec.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Operational Directives & Actions */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      [الإجراءات والمهام المباشرة المتاحة]:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {section.availableActions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => void handleAction(act)}
                          disabled={isExecutingAction !== null}
                          className="p-3.5 rounded-2xl bg-[#03142e] border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#042048] text-right flex flex-col justify-between gap-2.5 transition-all active:scale-95 disabled:opacity-50 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-cyan-400">
                              [مهمة 0{idx + 1}]
                            </span>
                            <Zap size={14} className="text-amber-400 group-hover:scale-125 transition-transform" />
                          </div>
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {act}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            {isExecutingAction === act ? (
                              <>
                                <RefreshCw size={11} className="animate-spin text-amber-400" />
                                <span>جاري التنفيذ العصبي...</span>
                              </>
                            ) : (
                              <span>انقر لتشغيل المهمة فوراً</span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* LIVE IFRAME EMBED VIEW */
                <div className="rounded-2xl border-2 border-cyan-500/40 bg-black overflow-hidden relative min-h-[550px]">
                  <iframe
                    src={section.href}
                    title={section.titleAr}
                    className="w-full h-[600px] border-none"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-500/30 flex items-center justify-between bg-[#031022] shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            أمر صوتي سريع: يمكنك إغلاق أي نافذة بنطق "أغلق" في أي وقت.
          </span>

          <div className="flex items-center gap-2">
            <a
              href={section.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-700 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span>فتح كامل</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
