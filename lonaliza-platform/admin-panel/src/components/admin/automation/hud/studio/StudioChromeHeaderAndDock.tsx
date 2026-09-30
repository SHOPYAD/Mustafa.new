"use client";

import React from "react";
import {
  Home,
  Mic,
  Square,
  Hand,
  Minus,
  Plus,
  RotateCcw,
  HelpCircle,
  Settings,
  Activity,
  Menu,
  Cpu,
  Zap,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";
import { useAgentStore } from "@/lib/studio/agent/agent-store";

interface StudioChromeHeaderAndDockProps {
  currentScreenTitle: string;
  currentScreenSubtitle?: string;
  depthLevel: number;
  onSelectDepthLevel: (lvl: number) => void;
  isListening: boolean;
  onToggleListening: () => void;
  onStopListening: () => void;
  onResetWindows: () => void;
  onOpenScreenSwitcher: () => void;
  onExitHome: () => void;
  audioFrequencies?: number[];
  onToggleMcpWindow?: () => void;
  isAutoExecution?: boolean;
  onToggleAutoExecution?: () => void;
  panActive?: boolean;
  onTogglePan?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  dockNote?: string;
  onOpenHelp?: () => void;
  breadcrumbTail?: string;
  hideExtendedTools?: boolean;
  showAgentControls?: boolean;
}

export default function StudioChromeHeaderAndDock({
  currentScreenTitle = "الحضور البشري والصوت الحي",
  currentScreenSubtitle = "منصة التفاعل الطبيعي والذكاء المساعد",
  depthLevel = 2,
  onSelectDepthLevel,
  isListening = false,
  onToggleListening,
  onStopListening,
  onResetWindows,
  onOpenScreenSwitcher,
  onExitHome,
  audioFrequencies = [],
  onToggleMcpWindow,
  isAutoExecution = false,
  onToggleAutoExecution,
  panActive = false,
  onTogglePan,
  onZoomIn,
  onZoomOut,
  dockNote,
  onOpenHelp,
  breadcrumbTail,
  hideExtendedTools = false,
  showAgentControls = false,
}: StudioChromeHeaderAndDockProps) {
  const agentsVisible = useAgentStore((s) => s.agentsVisible);
  const coordinate = useAgentStore((s) => s.coordinate);
  const depthLevels = [
    { lvl: 0, code: "L0" },
    { lvl: 1, code: "L1" },
    { lvl: 2, code: "L2" },
    { lvl: 3, code: "L3" },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP CHROME HEADER BAR (Exact 100% Reference Hierarchy & Cyber Bevel)    */}
      {/* ========================================================================= */}
      <header
        dir="ltr"
        style={{ direction: "ltr" }}
        className="absolute top-0 left-0 right-0 z-50 h-[58px] px-6 flex items-center justify-between border-b border-cyan-500/25 bg-[#020b18]/90 backdrop-blur-2xl select-none"
      >
        {/* Top Header Sci-Fi Notch Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-400/40 to-cyan-500/0" />

        {/* Left Section: Home Button + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExitHome}
            className="w-9 h-9 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 hover:border-cyan-400 text-cyan-300 flex items-center justify-center transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] cursor-pointer"
            title="الرئيسية"
          >
            <Home size={18} />
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = "/admin"; }}
            title="الرجوع إلى لوحة الإدارة العادية"
            style={{ height: 36, padding: "0 12px", borderRadius: 12, border: "1.5px solid #ffbf4d", background: "rgba(48,28,4,0.92)", color: "#ffe7a3", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px rgba(255,191,77,0.35)" }}
          >
            الوضع العادي
          </button>

          <div
            className="flex items-center gap-2 text-xs font-sans text-cyan-300"
            style={{ direction: "rtl" }}
          >
            <span className="text-cyan-500/60 font-mono">&gt;</span>
            <button
              onClick={onOpenScreenSwitcher}
              className="font-bold hover:text-white transition-colors cursor-pointer"
              title="انقر لفتح قائمة الواجهات"
            >
              {currentScreenTitle}
            </button>
            {breadcrumbTail ? (
              <>
                <span className="text-cyan-500/60 font-mono">&gt;</span>
                <span className="text-cyan-100/80">{breadcrumbTail}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Center Section: Depth Level Stepper (L2 pill + line + مستوى العمق) */}
        <div className="flex items-center gap-3" style={{ direction: "rtl" }}>
          <span className="text-xs font-sans text-slate-400">مستوى العمق</span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#031124] border border-cyan-500/30">
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
              L{depthLevel}
            </span>
            <div className="relative flex items-center gap-3 px-1" style={{ direction: "ltr" }}>
              <div className="absolute left-2 right-2 h-0.5 bg-cyan-900/80 -z-0" />
              {depthLevels.map((d) => (
                <button
                  key={d.lvl}
                  onClick={() => onSelectDepthLevel(d.lvl)}
                  className={`relative z-10 w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    depthLevel === d.lvl
                      ? "bg-cyan-400 ring-4 ring-cyan-400/30 shadow-[0_0_8px_#00e5ff] scale-125"
                      : "bg-[#0b283d] hover:bg-cyan-600"
                  }`}
                  title={d.code}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Title + Subtitle + Audio Emblem Badge */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right font-sans" style={{ direction: "rtl" }}>
            <h1 className="text-base font-bold text-white tracking-wide">
              {currentScreenTitle}
            </h1>
            <p className="text-[11px] text-slate-400 font-sans">
              {currentScreenSubtitle}
            </p>
          </div>

          <div className="w-10 h-10 rounded-full border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.25)]">
            <Activity size={20} className="text-cyan-400 animate-pulse" />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BOTTOM PERSISTENT DOCK BAR (Exact Reference Styling & Chamfer Notch)   */}
      {/* ========================================================================= */}
      <footer
        dir="ltr"
        style={{ direction: "ltr" }}
        className="absolute bottom-0 left-0 right-0 z-50 h-[64px] px-6 border-t border-cyan-500/25 bg-[#020b18]/95 backdrop-blur-2xl flex items-center justify-between select-none"
      >
        {/* Bottom Dock Sci-Fi Notch Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-400/40 to-cyan-500/0" />

        {/* Left Section: Voice Interaction Controls (Mic + Waveform + Red Stop) */}
        <div className="flex items-center gap-3">
          {/* Glowing Circular Microphone Button */}
          <button
            onClick={onToggleListening}
            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? "bg-cyan-400 border-white text-black shadow-[0_0_22px_#00e5ff] scale-105"
                : "bg-cyan-950/70 border-cyan-400/60 text-cyan-300 hover:border-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
            }`}
            title="تفعيل / إيقاف الاستماع الصوتي للوكيل"
          >
            <Mic size={20} />
          </button>

          {/* Waveform Visualizer + Label */}
          <div
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all ${
              isListening
                ? "bg-[#031124] border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                : "bg-[#020b18]/80 border-slate-700/40 opacity-80"
            }`}
            style={{ direction: "rtl" }}
          >
            <span
              className={`text-xs font-sans transition-colors ${
                isListening ? "text-cyan-300 font-medium" : "text-slate-400"
              }`}
            >
              {isListening ? "استمع الآن ..." : "التسجيل متوقف"}
            </span>
            <div className="flex items-center gap-1" style={{ direction: "ltr" }}>
              {[12, 20, 8, 24, 16, 10, 22, 14, 18, 6].map((defaultH, i) => {
                const freqVal = audioFrequencies[i % audioFrequencies.length] || 0;
                const dynamicH = isListening
                  ? Math.max(4, Math.round(freqVal * 26))
                  : 3; // flat resting indicator when stopped
                return (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-100 ${
                      isListening ? "bg-cyan-400 shadow-[0_0_6px_#00e5ff]" : "bg-slate-600/50"
                    }`}
                    style={{ height: `${dynamicH}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Red Stop / Recording Button */}
          <button
            onClick={onStopListening}
            className="w-8 h-8 rounded-full border border-rose-500/70 bg-rose-950/70 text-rose-400 hover:bg-rose-900/70 flex items-center justify-center transition-all shadow-[0_0_12px_rgba(244,63,94,0.35)] cursor-pointer"
            title="إيقاف التسجيل الصوتي"
          >
            <Square size={12} className="fill-rose-400" />
          </button>
        </div>

        {/* Center Section: Navigation & Tools ([تحريك] [تكبير/تصغير] [إعادة النوافذ] [☰]) */}
        <div className="flex items-center gap-2">
          {/* Pan Tool */}
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)] ${
              panActive
                ? "bg-cyan-400/20 border-cyan-300 text-white"
                : "bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-400/50 text-cyan-200 hover:text-white"
            }`}
            title="تحريك مساحة العمل"
            onClick={onTogglePan}
          >
            <Hand size={14} className="text-cyan-400" />
            <span>تحريك</span>
          </button>

          {/* Zoom Out / In */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-400/50 text-xs font-sans text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            <button type="button" onClick={onZoomOut} className="p-1 hover:text-white cursor-pointer text-cyan-300" title="تصغير">
              <Minus size={13} />
            </button>
            <span className="px-1 text-[11px] text-cyan-300/80">تكبير / تصغير</span>
            <button type="button" onClick={onZoomIn} className="p-1 hover:text-white cursor-pointer text-cyan-300" title="تكبير">
              <Plus size={13} />
            </button>
          </div>

          {/* Reset Windows */}
          <button
            onClick={onResetWindows}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/50 text-xs text-cyan-200 hover:text-white font-sans transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)]"
            title="إعادة ترتيب النوافذ إلى وضعها القياسي"
          >
            <RotateCcw size={13} className="text-cyan-400" />
            <span>إعادة النوافذ</span>
          </button>

          {hideExtendedTools ? null : (
          <button
            onClick={onToggleMcpWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#031429] hover:bg-[#042042] border border-cyan-500/40 text-xs text-cyan-300 hover:text-white font-sans transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.2)]"
            title="فتح لوحة التحكم بخوادم وأدوات MCP"
          >
            <Cpu size={14} className="text-cyan-400 animate-pulse" />
            <span className="font-bold">خوادم MCP</span>
          </button>
          )}

          {hideExtendedTools ? null : (
          <button
            onClick={onToggleAutoExecution}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
              isAutoExecution
                ? "bg-emerald-950/80 border-emerald-400/80 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                : "bg-[#031429] hover:bg-[#042042] border-cyan-500/40 text-cyan-300 hover:text-white shadow-[0_0_10px_rgba(0,229,255,0.2)]"
            }`}
            title={
              isAutoExecution
                ? "وضع التنفيذ الذاتي: مفعل (القرارات ذات التوافق 90%+ تنفذ تلقائياً في النظام)"
                : "وضع الموافقة السيادية: يدوي (القرارات تبقى معلقة بانتظار توقيع واعتماد المشرف البشري)"
            }
          >
            <Zap size={14} className={isAutoExecution ? "text-emerald-400 fill-emerald-400 animate-pulse" : "text-cyan-400"} />
            <span className="font-bold">
              {isAutoExecution ? "تنفيذ ذاتي: مفعّل ⚡" : "اعتماد يدوي: سيادي 🛡️"}
            </span>
          </button>
          )}

          {showAgentControls ? (
            <>
              <button
                type="button"
                onClick={() => useAgentStore.getState().setAgentsVisible(!agentsVisible)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/50 text-xs text-cyan-200 hover:text-white font-sans transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                title="إظهار أو إخفاء الوكلاء حول المشرف"
              >
                {agentsVisible ? <EyeOff size={13} className="text-cyan-400" /> : <Eye size={13} className="text-cyan-400" />}
                <span>{agentsVisible ? "إخفاء الوكلاء" : "إظهار الوكلاء"}</span>
              </button>
              <button
                type="button"
                onClick={() => useAgentStore.getState().setCoordinate(!coordinate)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)] ${
                  coordinate
                    ? "bg-cyan-400/20 border-cyan-300 text-white"
                    : "bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-400/50 text-cyan-200 hover:text-white"
                }`}
                title="التنسيق الصوتي الجماعي بين المشرف والوكلاء"
              >
                <Users size={13} className="text-cyan-400" />
                <span>تنسيق جماعي</span>
              </button>
            </>
          ) : null}

          {/* Menu Button (☰ Opens the 20 Screens Navigator Modal) */}
          <button
            onClick={onOpenScreenSwitcher}
            className="p-2 rounded-xl bg-[#031124] hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all shadow-[0_0_12px_rgba(0,229,255,0.2)] cursor-pointer"
            title="استعراض كافة الواجهات الـ 20"
          >
            <Menu size={16} />
          </button>
        </div>

        {/* Right Section: Help + Settings + Label */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-sans text-slate-400 hidden xl:inline" style={{ direction: "rtl" }}>
            {dockNote || "مرجع تصميم • بيانات توضيحية"}
          </span>

          <button
            type="button"
            onClick={onOpenHelp}
            className="p-2 rounded-xl bg-[#031124] hover:bg-[#051c3a] border border-cyan-500/30 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="المساعدة"
          >
            <HelpCircle size={16} />
          </button>

          <button
            className="p-2 rounded-xl bg-[#031124] hover:bg-[#051c3a] border border-cyan-500/30 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="الإعدادات"
          >
            <Settings size={16} />
          </button>
        </div>
      </footer>
    </>
  );
}
