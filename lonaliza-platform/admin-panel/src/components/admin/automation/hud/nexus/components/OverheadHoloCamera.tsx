"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { Camera, CameraOff, Hand } from "lucide-react";

export interface OverheadHoloCameraProps {
  cameraActive: boolean;
  onToggleCamera: () => void;
  gestureFeedback?: string | null;
  activeGesture?: string | null;
}

export const OverheadHoloCamera = memo(function OverheadHoloCamera({
  cameraActive,
  onToggleCamera,
  gestureFeedback,
  activeGesture,
}: OverheadHoloCameraProps) {
  return (
    <div className="pointer-events-none absolute top-1 left-0 right-0 z-30 flex flex-col items-center">
      {/* 1. Master Bezel Webcam Lens (Matching Reference Image 3) */}
      <div className="pointer-events-auto relative flex items-center justify-center">
        <button
          type="button"
          onClick={onToggleCamera}
          className="group relative flex h-6 w-16 items-center justify-center rounded-full border border-cyan-500/40 bg-[#020b18]/90 shadow-[0_0_15px_rgba(0,240,255,0.35)] backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title={cameraActive ? "إيقاف الكاميرا" : "تفعيل الكاميرا والتحكم بالإيماءات"}
        >
          {/* Glowing Optical Lens Ring */}
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full border border-cyan-400 bg-cyan-950/80 shadow-[0_0_8px_#00f0ff]">
            <div className={`h-2 w-2 rounded-full ${cameraActive ? "bg-cyan-300 shadow-[0_0_8px_#ffffff] animate-pulse" : "bg-cyan-500"}`} />
          </div>
        </button>
      </div>

      {/* Downward Light Projection Lines */}
      <div className="relative w-20 h-1.5 pointer-events-none opacity-50">
        <svg className="w-full h-full" viewBox="0 0 80 6">
          <line x1="32" y1="0" x2="16" y2="6" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="48" y1="0" x2="64" y2="6" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.5" />
        </svg>
      </div>

      {/* 2. Sleek Hand Gesture Badge (Compact & never overlaps cards) */}
      <div className="pointer-events-auto relative flex items-center">
        <button
          type="button"
          onClick={onToggleCamera}
          className="group relative flex items-center gap-2.5 rounded-full border border-cyan-400/35 bg-[#020b18]/90 px-3 py-1 shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-xl transition-all hover:border-cyan-300 hover:shadow-[0_0_25px_#00f0ff] cursor-pointer"
        >
          {/* Hand Icon with Pulse */}
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/20 text-cyan-300">
            <Hand size={12} className={activeGesture ? "text-amber-300 animate-bounce" : "text-cyan-300"} />
          </div>

          {/* Text: Control with your hand / Swipe left or right */}
          <div className="flex flex-col text-left leading-tight">
            <span className="font-sans text-[10px] font-bold text-white tracking-wide">
              {activeGesture ? (
                <span className="text-amber-300 font-mono">Gesture: {activeGesture}</span>
              ) : (
                "Control with your hand"
              )}
            </span>
            <span className="font-sans text-[8.5px] text-slate-300">
              {cameraActive ? gestureFeedback || "Swipe left or right" : "Swipe left or right (Click to activate)"}
            </span>
          </div>

          <span
            className={`ml-0.5 h-1.5 w-1.5 rounded-full ${
              cameraActive ? "bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" : "bg-slate-600"
            }`}
          />
        </button>
      </div>
    </div>
  );
});

export default OverheadHoloCamera;
