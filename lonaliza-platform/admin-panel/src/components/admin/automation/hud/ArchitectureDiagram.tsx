"use client";

import React from "react";
import { Database, Cpu, Layers, Key, Network, Radio, Sparkles } from "lucide-react";

export default function ArchitectureDiagram() {
  return (
    <div className="size-full flex flex-col justify-between p-3.5 text-slate-200 select-none font-mono text-[10px]">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Layers size={13} />
          <span className="tracking-wide">System Architecture</span>
        </div>
        <span className="text-[9px] text-cyan-300/70 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
          MCP v1.3
        </span>
      </div>

      {/* Interactive Micro Diagram */}
      <div className="relative my-2 h-36 flex items-center justify-between gap-2">
        {/* Left: Channel System Node */}
        <div className="w-20 p-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col items-center justify-center text-center gap-1 shadow-[0_0_12px_rgba(0,229,255,0.15)] shrink-0">
          <Radio size={16} className="text-cyan-400 animate-pulse" />
          <span className="font-bold text-[9px] text-cyan-200 leading-tight">Channel System</span>
          <span className="text-[8px] text-slate-400 leading-none">WA/TG/Nostr</span>
        </div>

        {/* Connecting Animated Dashes */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 via-amber-400 to-cyan-500 opacity-60" />
          <div className="absolute size-2 rounded-full bg-cyan-300 animate-ping" />
        </div>

        {/* Center: Master AI Controller */}
        <div className="w-24 p-2 rounded-xl bg-slate-900/90 border border-amber-500/50 flex flex-col items-center justify-center text-center gap-1 shadow-[0_0_16px_rgba(245,158,11,0.25)] shrink-0">
          <div className="size-7 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
            <Cpu size={14} className="animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <span className="font-black text-[9px] text-amber-300 leading-tight">Master AI Controller</span>
        </div>

        {/* Connecting Animated Dashes */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-amber-400 via-cyan-500 to-emerald-400 opacity-60" />
        </div>

        {/* Right Stack: Application, MCP & API Keys */}
        <div className="flex flex-col gap-1.5 w-24 shrink-0">
          <div className="px-2 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between text-[8px]">
            <span className="text-slate-300 font-bold">Application</span>
            <span className="size-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="px-2 py-1 rounded-lg bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between text-[8px]">
            <span className="text-emerald-300 font-bold">MCP Links</span>
            <Network size={10} className="text-emerald-400" />
          </div>
          <div className="px-2 py-1 rounded-lg bg-slate-900/80 border border-amber-500/30 flex items-center justify-between text-[8px]">
            <span className="text-amber-300 font-bold">API Keys</span>
            <Key size={10} className="text-amber-400" />
          </div>
        </div>
      </div>

      {/* Footer Data Flows & Status */}
      <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between text-[9px] text-slate-400">
        <span className="flex items-center gap-1">
          <Database size={10} className="text-cyan-400" />
          <span>PocketBase: Connected</span>
        </span>
        <span className="text-emerald-400 font-bold">Latency: 24ms</span>
      </div>
    </div>
  );
}
