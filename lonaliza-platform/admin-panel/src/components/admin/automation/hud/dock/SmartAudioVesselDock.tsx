"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  Terminal,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  LayoutGrid,
  Zap,
} from "lucide-react";

interface SmartAudioVesselDockProps {
  isVoiceActive: boolean;
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  isProcessing: boolean;
  frequencies: number[];
  onToggleVoice: () => void;
  onOpenSidebar: () => void;
  onToggleTerminal: () => void;
  terminalOpen: boolean;
  isHandTrackingActive?: boolean;
  onToggleCamera?: () => void;
  soundFxEnabled?: boolean;
  onToggleSoundFx?: () => void;
}

export default function SmartAudioVesselDock({
  isVoiceActive,
  isUserSpeaking,
  isAgentSpeaking,
  isProcessing,
  frequencies = [],
  onToggleVoice,
  onOpenSidebar,
  onToggleTerminal,
  terminalOpen,
  isHandTrackingActive = false,
  onToggleCamera,
  soundFxEnabled = true,
  onToggleSoundFx,
}: SmartAudioVesselDockProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Status Badge parameters
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

  // 60FPS Continuous Dynamic Spectrum Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      const time = performance.now() * 0.003;

      ctx.clearRect(0, 0, width, height);

      const barCount = 32;
      const barSpacing = 4;
      const totalSpacing = barSpacing * (barCount - 1);
      const barWidth = Math.max(3, (width - totalSpacing) / barCount);

      for (let i = 0; i < barCount; i++) {
        let val = frequencies[i] || 0;

        // If in idle state, produce gentle organic harmonic breathing wave
        if (!isAgentSpeaking && !isUserSpeaking && !isProcessing) {
          const s1 = Math.sin(time * 1.5 + i * 0.3) * 0.5 + 0.5;
          const s2 = Math.cos(time * 0.8 - i * 0.15) * 0.5 + 0.5;
          val = 0.08 + s1 * 0.18 + s2 * 0.12;
        }

        const barHeight = Math.max(4, val * (height - 6));
        const x = i * (barWidth + barSpacing);
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(x, y, x, y + barHeight);
        if (isAgentSpeaking) {
          grad.addColorStop(0, "#fbbf24");
          grad.addColorStop(1, "#f97316");
        } else if (isUserSpeaking) {
          grad.addColorStop(0, "#34d399");
          grad.addColorStop(1, "#06b6d4");
        } else if (isProcessing) {
          grad.addColorStop(0, "#c084fc");
          grad.addColorStop(1, "#3b82f6");
        } else {
          grad.addColorStop(0, "rgba(0, 229, 255, 0.9)");
          grad.addColorStop(1, "rgba(2, 132, 199, 0.4)");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [frequencies, isAgentSpeaking, isUserSpeaking, isProcessing]);

  if (isCollapsed) {
    return (
      <aside
        aria-label="حاوية الصوت السيبرانية المصغرة"
        className="fixed bottom-3 right-6 z-40 px-3 py-1.5 rounded-full border border-cyan-500/40 bg-[#020b18]/95 backdrop-blur-2xl shadow-[0_0_25px_rgba(0,229,255,0.3)] flex items-center gap-2 text-slate-200 font-mono select-none"
      >
        <button
          type="button"
          onClick={onToggleVoice}
          className={`p-1.5 rounded-full ${isVoiceActive ? "bg-cyan-500 text-black shadow-[0_0_10px_#00e5ff]" : "text-slate-400 hover:text-white"}`}
          title={isVoiceActive ? "إيقاف الميكروفون" : "تشغيل الميكروفون"}
        >
          {isVoiceActive ? <Mic size={13} /> : <MicOff size={13} />}
        </button>
        <span className={`text-[10px] font-bold ${stateColor}`}>[{stateText}]</span>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-1 rounded-full text-cyan-400 hover:text-white hover:bg-cyan-500/20 text-xs transition-colors"
          title="توسيع حوض الصوت"
        >
          ▲
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="حاوية الصوت السيبرانية الذكية وأدوات القيادة"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] px-3.5 py-1.5 rounded-full border border-cyan-500/40 bg-[#020b18]/94 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,229,255,0.25)] flex items-center gap-2 sm:gap-3.5 text-slate-200 font-mono select-none"
    >
      {/* Minimize / Collapse Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(true)}
        className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs transition-colors shrink-0"
        title="تصغير حوض الصوت لمنع حجب العناصر"
      >
        ▼
      </button>

      {/* 1. Live System State Badge */}
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider ${stateColor} transition-colors shrink-0`}
      >
        <span className="relative flex size-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor} ${dotAnimation}`}
          />
          <span className={`relative inline-flex rounded-full size-2 ${dotColor}`} />
        </span>
        <span>[{stateText}]</span>
      </div>

      <div className="w-[1px] h-6 bg-cyan-500/30 hidden sm:block shrink-0" />

      {/* 2. Central Live Reactive Audio Waveform Vessel Canvas */}
      <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-[#031429] border border-cyan-500/30 shadow-inner">
        <canvas
          ref={canvasRef}
          width={240}
          height={28}
          className="w-[180px] sm:w-[240px] md:w-[280px] h-[26px] block"
        />
      </div>

      <div className="w-[1px] h-6 bg-cyan-500/30 hidden sm:block shrink-0" />

      {/* 3. Action Tools: Voice Mic, All Sections Sidebar, Terminal */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Toggle Voice Input */}
        <button
          type="button"
          onClick={onToggleVoice}
          title={isVoiceActive ? "إيقاف الميكروفون" : "تشغيل الميكروفون الذكي"}
          className={`p-2 rounded-full border transition-all active:scale-95 ${
            isVoiceActive
              ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#00e5ff]"
              : "bg-[#04162e] text-slate-400 border-cyan-500/30 hover:text-white"
          }`}
        >
          {isVoiceActive ? <Mic size={15} /> : <MicOff size={15} />}
        </button>

        {/* Toggle Silent/Audible Response */}
        <button
          type="button"
          onClick={onToggleSoundFx}
          title={soundFxEnabled ? "الرد الصوتي: مسموع" : "الرد الصوتي: صامت"}
          className={`p-2 rounded-full border transition-all active:scale-95 ${
            soundFxEnabled
              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25"
              : "bg-[#04162e] text-slate-400 border-cyan-500/30 hover:text-white"
          }`}
        >
          {soundFxEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Toggle All Platform Sections Floating Sidebar */}
        <button
          type="button"
          onClick={onOpenSidebar}
          title="فتح القائمة الشاملة لأقسام وإعدادات المنصة"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
        >
          <LayoutGrid size={14} className="text-cyan-400" />
          <span className="hidden md:inline">أقسام المنصة</span>
        </button>

        {/* Toggle Slide-out Terminal */}
        <button
          type="button"
          onClick={onToggleTerminal}
          title="الطرفية السيبرانية وسجل مداولات السرب"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all active:scale-95 ${
            terminalOpen
              ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_#00e5ff]"
              : "bg-[#04162e] text-slate-400 border-cyan-500/30 hover:text-white"
          }`}
        >
          <Terminal size={14} />
          <span className="hidden sm:inline">الطرفية</span>
        </button>
      </div>
    </aside>
  );
}
