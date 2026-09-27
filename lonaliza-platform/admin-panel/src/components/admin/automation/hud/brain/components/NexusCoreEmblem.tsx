"use client";

import React from "react";
import { Sparkles, Shield, Cpu, Activity } from "lucide-react";

interface NexusCoreEmblemProps {
  x: number;
  y: number;
  size?: number;
  glowColor?: string;
  onClick?: () => void;
  activeLabel?: string;
}

export default function NexusCoreEmblem({
  x,
  y,
  size = 110,
  glowColor = "#00e5ff",
  onClick,
  activeLabel = "NEXUS CORE",
}: NexusCoreEmblemProps) {
  const half = size / 2;

  return (
    <div
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group select-none"
    >
      {/* Outer Pulse Wave */}
      <div
        className="absolute inset-0 rounded-full animate-ping opacity-25"
        style={{ backgroundColor: `${glowColor}30` }}
      />

      {/* Rotating Outer Dashed Energy Ring */}
      <div
        className="absolute -inset-2.5 rounded-full border border-dashed animate-[spin_18s_linear_infinite]"
        style={{ borderColor: `${glowColor}60` }}
      />

      {/* Rotating Inner Counter-Clockwise Ring */}
      <div
        className="absolute inset-1 rounded-full border border-dotted animate-[spin_12s_linear_infinite_reverse]"
        style={{ borderColor: `${glowColor}40` }}
      />

      {/* Solid Hypercore Body */}
      <div
        className="relative w-full h-full rounded-full border-2 bg-[#020b18]/95 backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105"
        style={{
          borderColor: glowColor,
          boxShadow: `0 0 35px ${glowColor}50, inset 0 0 20px ${glowColor}30`,
        }}
      >
        {/* Core Pulsing Icon */}
        <div className="relative">
          <Sparkles
            className="w-7 h-7 animate-pulse"
            style={{ color: glowColor }}
          />
          <span
            className="absolute -top-1 -right-1 size-2 rounded-full animate-ping"
            style={{ backgroundColor: glowColor }}
          />
        </div>

        {/* Central Titles */}
        <span className="text-[11px] font-black font-mono text-white mt-1 tracking-wider group-hover:text-cyan-300 transition-colors">
          {activeLabel}
        </span>
        <div className="flex items-center gap-1 text-[8px] font-mono mt-0.5" style={{ color: glowColor }}>
          <Activity size={9} />
          <span>81 AGENTS · 60+ MODS</span>
        </div>
      </div>
    </div>
  );
}
