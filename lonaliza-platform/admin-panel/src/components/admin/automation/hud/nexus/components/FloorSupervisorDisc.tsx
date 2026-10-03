"use client";

import React, { useRef, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { paintSupervisorDisc } from "@/lib/neural-studio/expansion-scene";

export interface FloorSupervisorDiscProps {
  isListening?: boolean;
  isAgentSpeaking?: boolean;
  audioFrequencies?: number[];
  onToggleVoice?: () => void;
  onOpenDetails?: () => void;
  className?: string;
}

export const FloorSupervisorDisc = memo(function FloorSupervisorDisc({
  isListening = false,
  isAgentSpeaking = false,
  audioFrequencies = [],
  onToggleVoice,
  className = "",
}: FloorSupervisorDiscProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute smooth amplitude level from audio frequencies
  const audioLevel = useMemo(() => {
    if ((!isListening && !isAgentSpeaking) || audioFrequencies.length === 0) return 0.28;
    const avg = audioFrequencies.reduce((sum, val) => sum + val, 0) / audioFrequencies.length;
    return Math.min(1, Math.max(0.2, avg / 0.45));
  }, [audioFrequencies, isListening, isAgentSpeaking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const baseSize = 280;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.round(baseSize * dpr);
    canvas.height = Math.round(baseSize * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    const start = performance.now();

    const render = (now: number) => {
      const phase = (now - start) / 1000;
      // Paints the official supervisor disc with concentric glowing rings and 17 smooth animated audio frequency waveform bars!
      paintSupervisorDisc(ctx, baseSize, audioLevel, phase);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [audioLevel]);

  return (
    <div
      onClick={onToggleVoice}
      className={`pointer-events-auto relative flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{
        transform: "rotateX(68deg)",
        transformOrigin: "center center",
      }}
      title={isListening ? "إيقاف الاستماع" : "انقر للتحدث مع الوكيل المشرف"}
    >
      {/* Outer Glowing Holographic Pulse Halo */}
      <motion.div
        animate={{
          scale: isListening || isAgentSpeaking ? [1, 1.06, 1] : [1, 1.02, 1],
          boxShadow:
            isListening || isAgentSpeaking
              ? "0 0 90px rgba(0, 240, 255, 0.85), inset 0 0 50px rgba(255, 215, 0, 0.5)"
              : "0 0 50px rgba(0, 240, 255, 0.5)",
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-[310px] w-[310px] items-center justify-center rounded-full border-2 border-cyan-400/70 bg-[#020914]/90 backdrop-blur-md"
      >
        {/* Concentric Decorative Rings */}
        <div className="absolute inset-2 rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]" />
        <div className="absolute inset-7 rounded-full border border-amber-400/60 border-dashed animate-spin-slow" />
        <div className="absolute inset-13 rounded-full border border-cyan-300/50" />
        <div className="absolute inset-19 rounded-full border border-cyan-400/30 border-dotted" />

        {/* Rotating Radial Spokes / Ticks */}
        <svg className="absolute inset-0 h-full w-full animate-spin-reverse opacity-60">
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const x1 = 155 + Math.cos(a) * 92;
            const y1 = 155 + Math.sin(a) * 92;
            const x2 = 155 + Math.cos(a) * 148;
            const y2 = 155 + Math.sin(a) * 148;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 3 === 0 ? "#ffd700" : "#00f0ff"}
                strokeWidth={i % 3 === 0 ? "2" : "1.2"}
              />
            );
          })}
        </svg>

        {/* Canvas Rendering the Official Supervisor Disc (Concentric Rings + Smooth Animated Audio Waveform Bars in Center!) */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none relative z-10 h-[260px] w-[260px]"
          style={{ width: 260, height: 260 }}
        />
      </motion.div>
    </div>
  );
});

export default FloorSupervisorDisc;
