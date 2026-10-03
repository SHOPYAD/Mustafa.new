"use client";

import React, { useRef, useState, useEffect, memo } from "react";
import type { NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import { FloorSupervisorDisc } from "./FloorSupervisorDisc";
import { resolveVisualForCard } from "./HolographicGlassCard";

export interface InteractiveStageFloorProps {
  cards: NexusHubCard[];
  activeIndex: number;
  isListening?: boolean;
  isAgentSpeaking?: boolean;
  audioFrequencies?: number[];
  onToggleVoice?: () => void;
  onOpenCard?: (card: NexusHubCard) => void;
}

export const InteractiveStageFloor = memo(function InteractiveStageFloor({
  cards,
  activeIndex,
  isListening = false,
  isAgentSpeaking = false,
  audioFrequencies = [],
  onToggleVoice,
}: InteractiveStageFloorProps) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const floorLightningCanvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse tracking on floor
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      setMousePos({
        x: Math.round((e.clientX / window.innerWidth) * 100),
        y: Math.round((e.clientY / window.innerHeight) * 100),
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  // FAST ELECTRIC LIGHTNING CIRCUITS ON FLOOR
  useEffect(() => {
    const canvas = floorLightningCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const width = 1600;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // Helper: draw fast jagged electric lightning line
    function drawLightningLine(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      intensity: number
    ) {
      if (!ctx) return;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      if (dist < 8) return;

      const steps = Math.max(3, Math.floor(dist / 18));
      const perpX = -dy / dist;
      const perpY = dx / dist;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.3 * intensity;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10 * intensity;
      ctx.globalAlpha = Math.min(1, 0.9 * intensity);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const sway = (Math.random() - 0.5) * 16 * Math.sin(t * Math.PI);
        ctx.lineTo(x1 + dx * t + perpX * sway, y1 + dy * t + perpY * sway);
      }
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = 240; // Center of floor dais ellipses

      // 1. Fast electrical circuit arcs flashing along concentric radar ellipses
      if (frame % 2 === 0) {
        const ringConfigs = [
          { rx: 430, ry: 135 },
          { rx: 310, ry: 98 },
          { rx: 220, ry: 70 },
          { rx: 160, ry: 55 },
        ];

        for (const { rx, ry } of ringConfigs) {
          if (Math.random() < 0.65) {
            const a0 = Math.random() * Math.PI * 2;
            const aSpan = 0.35 + Math.random() * 0.7;
            const a1 = a0 + aSpan;
            const steps = 9;

            ctx.save();
            ctx.strokeStyle = Math.random() < 0.7 ? "#00f0ff" : "#ffd700";
            ctx.lineWidth = 1.4;
            ctx.shadowColor = "#00f0ff";
            ctx.shadowBlur = 9;
            ctx.globalAlpha = 0.7 + Math.random() * 0.3;
            ctx.beginPath();

            for (let s = 0; s <= steps; s++) {
              const curA = a0 + (a1 - a0) * (s / steps);
              const jitter = (Math.random() - 0.5) * 5;
              const px = centerX + Math.cos(curA) * (rx + jitter);
              const py = centerY + Math.sin(curA) * (ry + jitter * 0.35);
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 2. High-speed lightning sparks discharging to mouse coordinates on floor
      const mouseFloorX = (mousePos.x / 100) * width;
      const mouseFloorY = (mousePos.y / 100) * height;

      if (Math.random() < 0.75) {
        const angle = Math.random() * Math.PI * 2;
        const originRx = 110 + Math.random() * 60;
        const originRy = originRx * 0.35;
        const ox = centerX + Math.cos(angle) * originRx;
        const oy = centerY + Math.sin(angle) * originRy;
        const targetColor = Math.random() < 0.6 ? "#00f0ff" : Math.random() < 0.8 ? "#ffd700" : "#c084fc";
        drawLightningLine(ox, oy, mouseFloorX, mouseFloorY, targetColor, 0.85);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [mousePos]);

  const total = cards.length;

  // The 5 visible cards mapped to their floor X offsets
  // Offsets: -2, -1, 0, 1, 2
  const cardLightPools = [-2, -1, 0, 1, 2].map((offset) => {
    const cardIndex = (activeIndex + offset + total * 100) % total;
    const card = cards[cardIndex];
    const visual = card ? resolveVisualForCard(card, cardIndex) : null;
    const xPos = offset === 0 ? 0 : offset === -1 ? -155 : offset === 1 ? 155 : offset === -2 ? -295 : 295;
    return {
      offset,
      card,
      visual,
      xPos,
      isCenter: offset === 0,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[48%] z-15 overflow-hidden select-none">
      {/* 1. Glowing Horizontal Horizon Line (Matching Master Reference Image) */}
      <div
        className="absolute top-0 inset-x-0 h-[1.5px] z-30"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(0, 240, 255, 0.2) 20%, rgba(0, 240, 255, 0.95) 50%, rgba(0, 240, 255, 0.2) 80%, transparent 95%)",
          boxShadow: "0 0 25px #00f0ff, 0 0 50px rgba(0, 240, 255, 0.5)",
        }}
      />

      {/* 2. 3D Perspective High-Gloss Mirror Floor Surface */}
      <div
        className="relative h-full w-full flex items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 95% 75% at 50% 60%, rgba(0, 200, 255, 0.12) 0%, rgba(2, 12, 30, 0.92) 50%, #00040a 100%)",
        }}
      >
        {/* Subtle 3D Perspective Floor Grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 240, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.4) 1px, transparent 1px)",
            backgroundSize: "60px 40px",
          }}
        />

        {/* Interactive Mouse Specular Sheen Pool */}
        <div
          className="absolute inset-0 opacity-40 blur-2xl pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(circle 450px at ${mousePos.x}% ${mousePos.y}%, rgba(0, 240, 255, 0.35) 0%, transparent 70%)`,
          }}
        />

        {/* Card Reflection Light Pools Along Horizon Line */}
        <div className="absolute top-0 inset-x-0 flex items-start justify-center pointer-events-none z-10">
          {cardLightPools.map(({ offset, card, visual, xPos, isCenter }) => {
            if (!card || !visual) return null;
            return (
              <div
                key={`floor-light-pool-${offset}-${card.id}`}
                className="absolute flex flex-col items-center justify-start transition-all duration-500"
                style={{
                  transform: `translateX(${xPos}px)`,
                }}
              >
                <div
                  className="w-[200px] h-[70px] rounded-full blur-xl transition-all duration-500"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${visual.glowHex} 0%, ${visual.borderHex}44 40%, transparent 75%)`,
                    opacity: isCenter ? 0.95 : 0.65,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* 3. GLOWING CONCENTRIC 3D HOLOGRAPHIC STAGE DAIS ON FLOOR (Matching Master Reference Image) */}
        <div className="relative flex items-center justify-center w-[1000px] h-[320px] pointer-events-none mt-8">
          {/* Outer Giant Concentric Ring (True Ellipse) */}
          <div
            className="absolute w-[820px] h-[260px] rounded-[50%] border border-cyan-400/40 pointer-events-none"
            style={{
              boxShadow: "0 0 55px rgba(0, 240, 255, 0.28), inset 0 0 35px rgba(0, 240, 255, 0.18)",
            }}
          />

          {/* Radial Crosshairs and Tick Marks along Outer Ring */}
          <div className="absolute w-[820px] h-[260px] pointer-events-none opacity-50">
            <svg className="w-full h-full" viewBox="0 0 820 260">
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const rx1 = 390;
                const ry1 = 120;
                const rx2 = 410;
                const ry2 = 130;
                return (
                  <line
                    key={i}
                    x1={410 + cosA * rx1}
                    y1={130 + sinA * ry1}
                    x2={410 + cosA * rx2}
                    y2={130 + sinA * ry2}
                    stroke={i % 4 === 0 ? "#ffd700" : "#00f0ff"}
                    strokeWidth={i % 4 === 0 ? "2.5" : "1.2"}
                  />
                );
              })}
            </svg>
          </div>

          {/* Mid Bright Cyan Glowing Ring */}
          <div
            className="absolute w-[600px] h-[190px] rounded-[50%] border border-cyan-300/60 pointer-events-none"
            style={{
              boxShadow: "0 0 35px rgba(0, 240, 255, 0.35)",
            }}
          />

          {/* Amber Horizon Arc */}
          <div
            className="absolute w-[440px] h-[140px] rounded-[50%] border border-amber-400/60 border-dashed pointer-events-none"
            style={{
              boxShadow: "0 0 25px rgba(255, 183, 3, 0.3)",
            }}
          />

          {/* Inner Cyan Glowing Ring Encircling Supervisor Disc */}
          <div
            className="absolute w-[310px] h-[100px] rounded-[50%] border-2 border-cyan-400/75 pointer-events-none"
            style={{
              boxShadow: "0 0 30px #00f0ff",
            }}
          />

          {/* FAST FLOOR ELECTRIC LIGHTNING CIRCUITS CANVAS */}
          <canvas
            ref={floorLightningCanvasRef}
            className="pointer-events-none absolute inset-0 z-15"
            style={{ width: "100%", height: "100%" }}
          />

          {/* 4. SUPERVISOR DISC LYING FLAT ON THE 3D FLOOR LOOKING UPWARDS (NO MIC ICON - PURE WAVEFORM BARS!) */}
          <div className="pointer-events-auto relative z-25 flex items-center justify-center">
            <FloorSupervisorDisc
              isListening={isListening}
              isAgentSpeaking={isAgentSpeaking}
              audioFrequencies={audioFrequencies}
              onToggleVoice={onToggleVoice}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default InteractiveStageFloor;
