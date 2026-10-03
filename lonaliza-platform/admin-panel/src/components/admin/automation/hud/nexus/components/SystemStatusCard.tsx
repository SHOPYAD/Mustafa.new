"use client";

import React, { memo } from "react";
import { Camera, Hand, Cpu, CheckCircle2 } from "lucide-react";

export interface SystemStatusCardProps {
  cameraActive?: boolean;
  gestureStatus?: "Ready" | "Active" | "Standby" | "Disabled";
  aiStatus?: "Online" | "Thinking" | "Speaking" | "Offline";
}

export const SystemStatusCard = memo(function SystemStatusCard({
  cameraActive = true,
  gestureStatus = "Ready",
  aiStatus = "Online",
}: SystemStatusCardProps) {
  return (
    <div className="pointer-events-auto w-[210px] rounded-[18px] border border-cyan-500/30 bg-[#020d1c]/85 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <h4 className="text-[12px] font-black tracking-wide text-white">SYSTEM STATUS</h4>
        </div>
        <CheckCircle2 size={13} className="text-emerald-400" />
      </div>

      {/* 3 Status Rows matching Reference Image 4 */}
      <div className="mt-2.5 space-y-2.5">
        {/* Row 1: Camera */}
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-950/40 text-cyan-300">
              <Camera size={12} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Camera</span>
          </div>
          <span
            className={`font-mono text-xs font-bold ${
              cameraActive
                ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                : "text-slate-500"
            }`}
          >
            {cameraActive ? "Active" : "Standby"}
          </span>
        </div>

        {/* Row 2: Gesture Control */}
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-950/40 text-cyan-300">
              <Hand size={12} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Gesture Control</span>
          </div>
          <span className="font-mono text-xs font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.7)]">
            {gestureStatus}
          </span>
        </div>

        {/* Row 3: AI Assistant */}
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-950/40 text-cyan-300">
              <Cpu size={12} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">AI Assistant</span>
          </div>
          <span
            className={`font-mono text-xs font-bold ${
              aiStatus === "Offline"
                ? "text-red-400"
                : "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]"
            }`}
          >
            {aiStatus}
          </span>
        </div>
      </div>
    </div>
  );
});

export default SystemStatusCard;
