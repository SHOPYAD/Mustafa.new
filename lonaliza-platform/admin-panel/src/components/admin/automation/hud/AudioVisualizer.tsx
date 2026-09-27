"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, MessageSquare, Volume2, Power, Globe } from "lucide-react";

interface AudioVisualizerProps {
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onVoiceDirective?: (text: string) => void;
}

export default function AudioVisualizer({
  onToggleChat,
  isChatOpen = false,
  onVoiceDirective,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isListening, setIsListening] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [systemActive, setSystemActive] = useState(true);
  const animationFrameRef = useRef<number | null>(null);

  // Render animated real-time audio wave harmonic on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const barsCount = 38;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const barWidth = width / barsCount;

      phase += isListening && systemActive ? 0.08 : 0.015;

      // Draw mirrored golden/amber glowing frequency bars
      for (let i = 0; i < barsCount; i++) {
        // Multi-frequency sine harmonics
        const norm = i / barsCount;
        const bellCurve = Math.sin(norm * Math.PI); // Taper at edges, peak in middle

        let amp = 0;
        if (systemActive) {
          const sine1 = Math.sin(norm * 12 + phase * 2);
          const sine2 = Math.cos(norm * 18 - phase * 1.5);
          const sine3 = Math.sin(phase * 3 + norm * 8);

          const noise = isListening ? (sine1 + sine2 * 0.7 + sine3 * 0.5) / 2.2 : Math.sin(phase + norm * 4) * 0.15;
          amp = (Math.abs(noise) * 0.85 + 0.15) * bellCurve * (height * 0.42);
        } else {
          amp = 2; // Flatline when off
        }

        const x = i * barWidth + barWidth * 0.2;
        const w = barWidth * 0.6;

        // Gradient from bright gold to cyan
        const grad = ctx.createLinearGradient(0, centerY - amp, 0, centerY + amp);
        if (norm > 0.35 && norm < 0.65) {
          grad.addColorStop(0, "#00e5ff"); // Cyan highlight in center
          grad.addColorStop(0.5, "#fbbf24"); // Amber body
          grad.addColorStop(1, "#f59e0b");
        } else {
          grad.addColorStop(0, "#f59e0b");
          grad.addColorStop(0.5, "#d97706");
          grad.addColorStop(1, "#b45309");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Top and bottom rounded caps
        ctx.roundRect(x, centerY - amp, w, Math.max(amp * 2, 2), 3);
        ctx.fill();

        // Subtle glow overlay on peak bars
        if (norm > 0.4 && norm < 0.6 && isListening && systemActive) {
          ctx.shadowColor = "#00e5ff";
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, systemActive]);

  return (
    <div className="flex flex-col items-center">
      {/* Listening HUD Capsule */}
      <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#03152d]/90 border border-amber-500/40 text-amber-300 text-[10px] font-mono shadow-[0_0_15px_rgba(245,158,11,0.25)]">
        <Mic size={11} className={isListening ? "text-amber-400 animate-pulse" : "text-slate-500"} />
        <span className="font-bold">Listening</span>
        <span className="text-slate-400">/</span>
        <span className="font-arabic font-medium">يستمع...</span>
      </div>

      {/* Realtime Canvas Sound Wave */}
      <div className="relative w-64 sm:w-72 h-14 mt-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={288}
          height={56}
          className="w-full h-full drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]"
        />
      </div>

      {/* Control Dock Buttons Bar */}
      <div className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-2xl bg-[#04162e]/85 border border-cyan-500/25 backdrop-blur-md shadow-lg">
        {/* Chat Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${
            isChatOpen
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
              : "bg-slate-900/60 text-slate-300 border-slate-700/60 hover:text-white hover:border-cyan-500/40"
          }`}
        >
          <MessageSquare size={12} className="text-cyan-400" />
          <span>Chat</span>
          <span className="text-slate-400 font-normal">/ محادثة</span>
        </button>

        {/* Voice Toggle */}
        <button
          type="button"
          onClick={() => setIsListening(!isListening)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${
            isListening
              ? "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              : "bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-white"
          }`}
        >
          {isListening ? (
            <Volume2 size={12} className="text-amber-400" />
          ) : (
            <MicOff size={12} className="text-slate-400" />
          )}
          <span>{isListening ? "فتح الصوت" : "كتم"}</span>
        </button>

        {/* Master Power / On Toggle */}
        <button
          type="button"
          onClick={() => setSystemActive(!systemActive)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all border ${
            systemActive
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
          }`}
        >
          <Power size={11} />
          <span>{systemActive ? "ON" : "OFF"}</span>
        </button>
      </div>
    </div>
  );
}
