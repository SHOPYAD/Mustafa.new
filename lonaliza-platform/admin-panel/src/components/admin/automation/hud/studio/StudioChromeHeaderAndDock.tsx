"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  GripHorizontal,
  ChevronDown,
  ChevronUp,
  Bot,
  Brain,
  ShieldCheck,
  Radio,
  MessageSquare,
  Pause,
  Play,
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
  /** fixed = شريط سفلي كامل؛ floating = لوحة عائمة فوق القوائم */
  dockLayout?: "fixed" | "floating";
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
  dockLayout = "fixed",
}: StudioChromeHeaderAndDockProps) {
  const agentsVisible = useAgentStore((s) => s.agentsVisible);
  const coordinate = useAgentStore((s) => s.coordinate);
  const chatWindowOpen = useAgentStore((s) => s.chatWindowOpen);
  const setChatWindowOpen = useAgentStore((s) => s.setChatWindowOpen);
  const useExternalAiEngine = useAgentStore((s) => s.useExternalAiEngine);
  const setUseExternalAiEngine = useAgentStore((s) => s.setUseExternalAiEngine);
  const chatMessagesCount = useAgentStore((s) => s.chatLog.length);
  const floating = dockLayout === "floating";
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [dockHidden, setDockHidden] = useState(false);
  const [dockPos, setDockPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!floating || typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("cyber-dock-pos");
      if (raw) {
        const p = JSON.parse(raw) as { x?: number; y?: number };
        if (typeof p.x === "number" && typeof p.y === "number") {
          setDockPos({ x: p.x, y: p.y });
          return;
        }
      }
    } catch {
      /* default */
    }
    setDockPos({ x: Math.max(12, (window.innerWidth - 920) / 2), y: window.innerHeight - 132 });
  }, [floating]);

  const startDockDrag = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (!dockPos) return;
      const sx = e.clientX - dockPos.x;
      const sy = e.clientY - dockPos.y;
      const move = (ev: PointerEvent) => {
        const next = {
          x: Math.min(Math.max(8, ev.clientX - sx), window.innerWidth - 120),
          y: Math.min(Math.max(64, ev.clientY - sy), window.innerHeight - 56),
        };
        setDockPos(next);
        try {
          sessionStorage.setItem("cyber-dock-pos", JSON.stringify(next));
        } catch {
          /* ignore */
        }
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [dockPos]
  );
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

      {floating && dockHidden ? (
        <button
          type="button"
          onClick={() => setDockHidden(false)}
          className="fixed z-[1000002] left-1/2 -translate-x-1/2 bottom-4 px-4 py-2 rounded-xl border border-cyan-500/45 bg-[#020b18]/95 text-cyan-200 text-xs font-mono shadow-[0_0_20px_rgba(0,229,255,0.3)]"
        >
          إظهار شريط التحكم السيبراني
        </button>
      ) : null}

      {floating && dockHidden ? null : (
      /* ========================================================================= */
      /* 2. BOTTOM PERSISTENT DOCK BAR (Exact Reference Styling & Chamfer Notch)   */
      /* ========================================================================= */
      <footer
        dir="ltr"
        style={{
          direction: "ltr",
          ...(floating && dockPos
            ? { position: "fixed", left: dockPos.x, top: dockPos.y, right: "auto", width: "min(920px, calc(100vw - 24px))", zIndex: 1000002 }
            : {}),
        }}
        className={
          floating
            ? "rounded-2xl border border-cyan-500/35 bg-[#020b18]/96 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.55),0_0_28px_rgba(0,229,255,0.2)] select-none overflow-hidden"
            : "absolute bottom-0 left-0 right-0 z-50 h-[64px] px-6 border-t border-cyan-500/25 bg-[#020b18]/95 backdrop-blur-2xl flex items-center justify-between select-none"
        }
      >
        {floating ? (
          <div
            onPointerDown={startDockDrag}
            className="flex items-center justify-between px-3 py-1 border-b border-cyan-500/20 cursor-grab active:cursor-grabbing bg-[#031124]/80"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/90">
              <GripHorizontal size={14} />
              <span>شريط التحكم · اسحب للتحريك</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setDockCollapsed((v) => !v)} className="p-1 rounded-lg border border-cyan-500/30 text-cyan-300" title="طي">
                {dockCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button type="button" onClick={() => setDockHidden(true)} className="p-1 rounded-lg border border-slate-600/50 text-slate-400 hover:text-white" title="إخفاء">
                ×
              </button>
            </div>
          </div>
        ) : null}
        {!floating || !dockCollapsed ? (
        <div className={`flex items-center justify-between gap-1.5 ${floating ? "px-2 py-1.5 flex-wrap" : "w-full h-[56px] px-3.5 flex-nowrap whitespace-nowrap overflow-x-auto no-scrollbar"}`}>
        {/* Bottom Dock Sci-Fi Notch Line */}
        {!floating ? <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-400/40 to-cyan-500/0" /> : null}

        {/* Left Section: Voice Interaction Controls (Mic + Waveform + Red Stop) */}
        {/* Left Section: Distinct Framed Live Voice Controller (Prominently sized, taller & wider) */}
        <div className="flex items-center gap-2 p-1.5 px-2 rounded-xl border border-cyan-500/40 bg-[#020d1c]/95 shadow-[0_0_20px_rgba(0,229,255,0.25)] backdrop-blur-xl shrink-0">
          {/* Interactive Live Audio Waveform Trigger Button (Red when stopped, Green when live active) */}
          <button
            type="button"
            onClick={onToggleListening}
            className={`flex items-center gap-2.5 h-9 px-3.5 rounded-lg border text-xs font-sans transition-all cursor-pointer select-none ${
              isListening
                ? "bg-emerald-950/85 border-emerald-400 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.5)]"
                : "bg-rose-950/45 border-rose-500/60 text-rose-300 hover:border-rose-400 hover:text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]"
            }`}
            title={isListening ? "إيقاف الاستماع الصوتي مؤقتاً" : "تشغيل الاستماع الصوتي التفاعلي للوكيل"}
          >
            {/* Dynamic Soundwave Bars inside trigger button (Taller, distinct bars rising and falling like real live audio) */}
            <div className="flex items-center gap-[2.5px] h-5 w-8 justify-center" style={{ direction: "ltr" }}>
              {[10, 20, 28, 16, 24, 12].map((baseH, i) => {
                const freqVal = audioFrequencies[i % audioFrequencies.length] || 0;
                const dynamicH = isListening
                  ? Math.max(4, Math.min(22, Math.round(baseH * (0.45 + freqVal * 1.25))))
                  : (i % 2 === 0 ? 4 : 2);
                return (
                  <span
                    key={i}
                    className={`w-[2.5px] rounded-full transition-all duration-100 ${
                      isListening
                        ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                        : "bg-rose-400/80"
                    }`}
                    style={{ height: `${dynamicH}px` }}
                  />
                );
              })}
            </div>

            <span className="font-bold text-xs tracking-wide">
              {isListening ? "صوت حي: نشط" : "صوت: متوقف"}
            </span>

            <span
              className={`h-2 w-2 rounded-full ${
                isListening
                  ? "bg-emerald-400 animate-ping shadow-[0_0_8px_#10b981]"
                  : "bg-rose-500 shadow-[0_0_6px_#f43f5e]"
              }`}
            />
          </button>

          {/* Interactive Pause / Resume Control Button */}
          <button
            type="button"
            onClick={isListening ? onStopListening : onToggleListening}
            className={`flex items-center justify-center h-9 w-9 rounded-lg border transition-all cursor-pointer ${
              isListening
                ? "bg-amber-950/80 border-amber-400/80 text-amber-300 hover:bg-amber-900 shadow-[0_0_14px_rgba(245,158,11,0.4)]"
                : "bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500"
            }`}
            title={isListening ? "إيقاف مؤقت (Pause)" : "استئناف الصوت (Play)"}
          >
            {isListening ? (
              <Pause size={14} className="fill-amber-300" />
            ) : (
              <Play size={13} className="fill-slate-300 ml-0.5" />
            )}
          </button>
        </div>

        {/* Center Section: Navigation & Tools (Single Line, Compact, Smart, Zero Emojis) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Pan Tool */}
          <button
            type="button"
            className={`flex items-center gap-1 h-8 px-2 rounded-lg border text-[11px] font-sans transition-all cursor-pointer shadow-[0_0_8px_rgba(0,229,255,0.15)] shrink-0 ${
              panActive
                ? "bg-cyan-400/20 border-cyan-300 text-white"
                : "bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-400/50 text-cyan-200 hover:text-white"
            }`}
            title="تحريك مساحة العمل"
            onClick={onTogglePan}
          >
            <Hand size={12} className="text-cyan-400" />
            <span>تحريك</span>
          </button>

          {/* Zoom Out / In */}
          <div className="flex items-center gap-0.5 h-8 px-1.5 rounded-lg bg-cyan-950/60 border border-cyan-400/50 text-[11px] font-sans text-cyan-200 shadow-[0_0_8px_rgba(0,229,255,0.15)] shrink-0">
            <button type="button" onClick={onZoomOut} className="p-1 hover:text-white cursor-pointer text-cyan-300" title="تصغير">
              <Minus size={11} />
            </button>
            <span className="px-0.5 text-[10px] text-cyan-300/80">تكبير/تصغير</span>
            <button type="button" onClick={onZoomIn} className="p-1 hover:text-white cursor-pointer text-cyan-300" title="تكبير">
              <Plus size={11} />
            </button>
          </div>

          {/* Reset Windows */}
          <button
            type="button"
            onClick={onResetWindows}
            className="flex items-center gap-1 h-8 px-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/50 text-[11px] text-cyan-200 hover:text-white font-sans transition-all cursor-pointer shadow-[0_0_8px_rgba(0,229,255,0.15)] shrink-0"
            title="إعادة ترتيب النوافذ إلى وضعها القياسي"
          >
            <RotateCcw size={12} className="text-cyan-400" />
            <span>إعادة النوافذ</span>
          </button>

          {hideExtendedTools ? null : (
          <button
            type="button"
            onClick={onToggleMcpWindow}
            className="flex items-center gap-1 h-8 px-2 rounded-lg bg-[#031429] hover:bg-[#042042] border border-cyan-500/40 text-[11px] text-cyan-300 hover:text-white font-sans transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)] shrink-0"
            title="فتح لوحة التحكم بخوادم وأدوات MCP"
          >
            <Cpu size={12} className="text-cyan-400 animate-pulse" />
            <span className="font-bold">خوادم MCP</span>
          </button>
          )}

          {hideExtendedTools ? null : (
          /* Smart Dual Approval Button (Zero Emojis) */
          <button
            type="button"
            onClick={onToggleAutoExecution}
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-sans font-semibold transition-all cursor-pointer shrink-0 ${
              isAutoExecution
                ? "bg-emerald-950/80 border-emerald-400/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "bg-[#031429] hover:bg-[#042042] border-cyan-500/40 text-cyan-300 hover:text-white shadow-[0_0_8px_rgba(0,229,255,0.15)]"
            }`}
            title={
              isAutoExecution
                ? "وضع التنفيذ الذاتي: مفعل (القرارات ذات التوافق 90%+ تنفذ تلقائياً في النظام)"
                : "وضع الموافقة السيادية: يدوي (القرارات تبقى معلقة بانتظار توقيع واعتماد المشرف البشري)"
            }
          >
            {isAutoExecution ? (
              <Zap size={12} className="text-emerald-400 fill-emerald-400 animate-pulse" />
            ) : (
              <ShieldCheck size={13} className="text-cyan-400" />
            )}
            <span>{isAutoExecution ? "تنفيذ ذاتي" : "اعتماد سيادي"}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoExecution ? "bg-emerald-400 shadow-[0_0_6px_#10b981]" : "bg-cyan-400 shadow-[0_0_6px_#00f0ff]"}`} />
          </button>
          )}

          {showAgentControls ? (
            <>
              {/* Smart Agents Visibility Button (Zero Emojis) */}
              <button
                type="button"
                onClick={() => useAgentStore.getState().setAgentsVisible(!agentsVisible)}
                className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-sans transition-all cursor-pointer shrink-0 ${
                  agentsVisible
                    ? "bg-cyan-950/70 border-cyan-400/60 text-cyan-200 shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                    : "bg-[#020b18] border-slate-700/60 text-slate-400 hover:text-slate-200"
                }`}
                title="إظهار أو إخفاء الوكلاء حول المشرف"
              >
                {agentsVisible ? <Eye size={12} className="text-cyan-400" /> : <EyeOff size={12} className="text-slate-500" />}
                <span>الوكلاء</span>
                <span className={`w-1.5 h-1.5 rounded-full ${agentsVisible ? "bg-cyan-400 shadow-[0_0_6px_#00f0ff]" : "bg-slate-600"}`} />
              </button>

              {/* Smart Swarm Coordination Button (Zero Emojis) */}
              <button
                type="button"
                onClick={() => useAgentStore.getState().setCoordinate(!coordinate)}
                className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-sans transition-all cursor-pointer shrink-0 shadow-[0_0_8px_rgba(0,229,255,0.15)] ${
                  coordinate
                    ? "bg-cyan-500/25 border-cyan-300 text-white shadow-[0_0_12px_rgba(0,229,255,0.35)]"
                    : "bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-400/50 text-cyan-200 hover:text-white"
                }`}
                title="التنسيق الصوتي والمزامنة اللحظية بين الوكلاء"
              >
                <Radio size={12} className={coordinate ? "text-cyan-300 animate-pulse" : "text-cyan-400"} />
                <span>تنسيق السرب</span>
              </button>
            </>
          ) : null}

          {/* Menu Button (Opens the 20 Screens Navigator Modal) */}
          <button
            type="button"
            onClick={onOpenScreenSwitcher}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#031124] hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)] cursor-pointer shrink-0"
            title="استعراض كافة الواجهات الـ 20"
          >
            <Menu size={14} />
          </button>
        </div>

        {/* Right Section: Compact AI Engine Switch + Sovereign Chat Button (Zero Emojis) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* External AI Engine Switch (Compact Slider Switch, Zero Emojis) */}
          <button
            type="button"
            onClick={() => setUseExternalAiEngine(!useExternalAiEngine)}
            className={`flex items-center gap-1.5 h-8 px-2 rounded-lg border text-[11px] font-sans transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)] shrink-0 ${
              useExternalAiEngine
                ? "bg-emerald-950/70 border-emerald-400/60 text-emerald-200 hover:border-emerald-300"
                : "bg-[#031224] border-amber-500/40 text-amber-200 hover:border-amber-300"
            }`}
            title={
              useExternalAiEngine
                ? "محرك الذكاء الخارجي: مفعّل (استخدام نماذج Gemini / OpenRouter كعقل مدبر للأوامر)"
                : "المحرك الداخلي: سيادي (استخدام الفهرس والمعجم الداخلي الشامل والخوارزميات المحلية)"
            }
          >
            <Brain size={13} className={useExternalAiEngine ? "text-emerald-400 animate-pulse" : "text-amber-400"} />
            <span className="font-bold">{useExternalAiEngine ? "AI خارجي" : "عقل داخلي"}</span>
            {/* Mini physical slider switch */}
            <div className={`relative w-5 h-2.5 rounded-full transition-colors ${useExternalAiEngine ? "bg-emerald-500/40 border border-emerald-400" : "bg-slate-700 border border-slate-600"}`}>
              <div className={`absolute top-[1px] w-1.5 h-1.5 rounded-full transition-all ${useExternalAiEngine ? "right-[2px] bg-emerald-300 shadow-[0_0_6px_#10b981]" : "left-[2px] bg-amber-400 shadow-[0_0_6px_#f59e0b]"}`} />
            </div>
          </button>

          {/* Supervisor Chat Window Button with Robot Talking Icon (Zero Emojis) */}
          <button
            type="button"
            onClick={() => setChatWindowOpen(!chatWindowOpen)}
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-sans transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.2)] shrink-0 ${
              chatWindowOpen
                ? "bg-cyan-500/25 border-cyan-300 text-white shadow-[0_0_15px_#00f0ff]"
                : "bg-[#031326] hover:bg-cyan-950/70 border-cyan-400/50 text-cyan-200 hover:text-white"
            }`}
            title={chatWindowOpen ? "تصغير محادثة الوكيل المشرف" : "فتح محادثة الوكيل المشرف"}
          >
            {/* Robot with speech bubble */}
            <div className="relative inline-flex items-center justify-center">
              <Bot size={13} className="text-cyan-400" />
              <MessageSquare size={7} className="absolute -top-1 -right-1 text-cyan-300 fill-cyan-400/40" />
            </div>
            <span className="font-bold">شات الوكيل</span>
            {chatMessagesCount > 0 && (
              <span className="flex h-3.5 min-w-[14px] px-1 items-center justify-center rounded-full bg-cyan-400 text-[9px] font-mono font-black text-black">
                {chatMessagesCount}
              </span>
            )}
          </button>
        </div>
        </div>
        ) : null}
      </footer>
      )}
    </>
  );
}
