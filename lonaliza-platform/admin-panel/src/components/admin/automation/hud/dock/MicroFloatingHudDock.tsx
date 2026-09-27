"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  RotateCcw,
  Terminal,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Brain,
  Zap,
  Activity,
  GitBranch,
  Orbit,
} from "lucide-react";

export type CockpitMode = "presence" | "brain" | "nexus" | "ops" | "loops";

interface MicroFloatingHudDockProps {
  currentMode: CockpitMode;
  onModeChange: (mode: CockpitMode) => void;
  isVoiceActive: boolean;
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  isProcessing: boolean;
  onToggleVoice: () => void;
  slowCamera: boolean;
  onToggleSlowCamera: () => void;
  onResetCamera: () => void;
  soundFxEnabled: boolean;
  onToggleSoundFx: () => void;
  onToggleTerminal: () => void;
  terminalOpen: boolean;
  logsCount?: number;
}

export default function MicroFloatingHudDock({
  currentMode,
  onModeChange,
  isVoiceActive,
  isUserSpeaking,
  isAgentSpeaking,
  isProcessing,
  onToggleVoice,
  slowCamera,
  onToggleSlowCamera,
  onResetCamera,
  soundFxEnabled,
  onToggleSoundFx,
  onToggleTerminal,
  terminalOpen,
  logsCount = 0,
}: MicroFloatingHudDockProps) {
  // Determine state indicator
  let stateText = "IDLE";
  let stateColor = "text-cyan-400 border-cyan-500/40 bg-cyan-500/10";
  let dotColor = "bg-cyan-400";
  let dotAnimation = "";

  if (isAgentSpeaking) {
    stateText = "SPEAKING";
    stateColor = "text-amber-300 border-amber-500/50 bg-amber-500/15";
    dotColor = "bg-amber-400";
    dotAnimation = "animate-ping";
  } else if (isUserSpeaking) {
    stateText = "LISTENING";
    stateColor = "text-emerald-300 border-emerald-500/50 bg-emerald-500/15";
    dotColor = "bg-emerald-400";
    dotAnimation = "animate-ping";
  } else if (isProcessing) {
    stateText = "THINKING";
    stateColor = "text-purple-300 border-purple-500/50 bg-purple-500/15";
    dotColor = "bg-purple-400";
    dotAnimation = "animate-pulse";
  }

  return (
    <aside
      aria-label="شريط التحكم السيبراني العائم"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] px-3 py-1.5 rounded-full border border-cyan-500/35 bg-[#020b18]/92 backdrop-blur-xl shadow-[0_0_35px_rgba(0,229,255,0.18)] flex items-center gap-2 sm:gap-3 text-slate-200 font-mono select-none"
    >
      {/* 1. Live System State Badge */}
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider ${stateColor} transition-colors`}
      >
        <span className="relative flex size-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor} ${dotAnimation}`}
          />
          <span className={`relative inline-flex rounded-full size-2 ${dotColor}`} />
        </span>
        <span>[{stateText}]</span>
      </div>

      <div className="w-[1px] h-5 bg-cyan-500/25 hidden sm:block" />

      {/* 2. Mode Selector Pill Tabs */}
      <div className="flex items-center gap-1 p-0.5 rounded-full bg-[#04162e]/80 border border-cyan-500/20">
        <button
          type="button"
          onClick={() => onModeChange("presence")}
          title="طور الحضور البصري 3D (Avatar Presence)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            currentMode === "presence"
              ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles size={12} />
          <span className="hidden md:inline">الوكيل المشرف</span>
          <span className="md:hidden">1</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("brain")}
          title="طور العقل الثاني (Segundo Cérebro)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            currentMode === "brain"
              ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Brain size={12} />
          <span className="hidden md:inline">العقل الثاني</span>
          <span className="md:hidden">2</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("nexus")}
          title="طور مسرح NEXUS 3D للبطاقات الهولوغرافية المقوسة (Cylinder Deck)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            currentMode === "nexus"
              ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Orbit size={12} />
          <span className="hidden md:inline">مسرح NEXUS 3D</span>
          <span className="md:hidden">3</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("ops")}
          title="طور غرفة قيادة العمليات (Comando Deck)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            currentMode === "ops"
              ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Zap size={12} />
          <span className="hidden md:inline">غرفة القيادة</span>
          <span className="md:hidden">4</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("loops")}
          title="طور الأتمتة البصرية والعقد (Visual Loops Engine)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
            currentMode === "loops"
              ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <GitBranch size={12} />
          <span className="hidden md:inline">الأتمتة والعقد</span>
          <span className="md:hidden">5</span>
        </button>
      </div>

      <div className="w-[1px] h-5 bg-cyan-500/25 hidden md:block" />

      {/* 3. Voice Toggle Button with Visualizer Waves */}
      <button
        type="button"
        onClick={onToggleVoice}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all ${
          isVoiceActive
            ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
            : "border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200"
        }`}
        title={isVoiceActive ? "تعطيل الصوت والمايكروفون" : "تفعيل الاستماع الصوتي الذكي"}
      >
        {isVoiceActive ? <Mic size={13} className="text-emerald-400 animate-pulse" /> : <MicOff size={13} />}
        <span className="hidden lg:inline">{isVoiceActive ? "المايك: نشط" : "صامت"}</span>
      </button>

      {/* 4. Camera & View Controls */}
      <div className="hidden lg:flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleSlowCamera}
          className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${
            slowCamera
              ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
              : "border-slate-800 bg-[#041224] text-slate-400 hover:text-white"
          }`}
          title="دوران الكاميرا البطيء والسينمائي"
        >
          {slowCamera ? "SLOW CAM [ON]" : "SLOW CAM"}
        </button>

        <button
          type="button"
          onClick={onResetCamera}
          className="p-1 rounded-lg border border-slate-800 bg-[#041224] text-slate-400 hover:text-cyan-300 transition-colors"
          title="إعادة ضبط زاوية الكاميرا"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* 5. Sound FX Toggle */}
      <button
        type="button"
        onClick={onToggleSoundFx}
        className="p-1.5 rounded-full border border-slate-800 bg-[#041224] text-slate-400 hover:text-white transition-colors hidden sm:block"
        title={soundFxEnabled ? "كتم المؤثرات الصوتية" : "تشغيل المؤثرات الصوتية"}
      >
        {soundFxEnabled ? <Volume2 size={13} className="text-cyan-400" /> : <VolumeX size={13} />}
      </button>

      {/* 6. Slide-Out Cyber Terminal Trigger */}
      <button
        type="button"
        onClick={onToggleTerminal}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-all ${
          terminalOpen
            ? "border-cyan-400 bg-cyan-500/25 text-white shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            : "border-cyan-500/30 bg-[#04162e] text-cyan-300 hover:border-cyan-400 hover:text-white"
        }`}
        title="فتح سجل المداولات والطرفية السيبرانية"
      >
        <Terminal size={12} />
        <span className="hidden sm:inline">الطرفية</span>
        {logsCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-500 text-black font-black">
            {logsCount}
          </span>
        )}
      </button>
    </aside>
  );
}
