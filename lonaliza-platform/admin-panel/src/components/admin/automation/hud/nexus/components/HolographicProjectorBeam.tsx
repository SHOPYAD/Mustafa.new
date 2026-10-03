"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";

export interface HolographicProjectorBeamProps {
  isListening?: boolean;
  isAgentSpeaking?: boolean;
  activeThemeColor?: string; // gold, cyan, amber, purple, magenta
}

export const HolographicProjectorBeam = memo(function HolographicProjectorBeam({
  isListening = false,
  isAgentSpeaking = false,
  activeThemeColor = "gold",
}: HolographicProjectorBeamProps) {
  // Theme hues for beam projection
  const isGold = activeThemeColor === "gold";

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-15 flex flex-col items-center justify-end w-[580px] h-[520px] select-none">
      {/* 1. Volumetric Conical Projector Light Cone */}
      <motion.div
        animate={{
          opacity: isAgentSpeaking ? [0.75, 1, 0.75] : isListening ? [0.65, 0.9, 0.65] : [0.5, 0.7, 0.5],
          scaleX: isAgentSpeaking ? [1, 1.05, 1] : [1, 1.02, 1],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          clipPath: "polygon(26% 0%, 74% 0%, 96% 100%, 4% 100%)",
          background:
            "linear-gradient(to top, rgba(0, 240, 255, 0.55) 0%, rgba(0, 180, 255, 0.25) 35%, rgba(255, 215, 0, 0.42) 75%, rgba(255, 255, 255, 0.18) 100%)",
          filter: "blur(7px)",
        }}
        className="absolute inset-0 w-full h-full"
      />

      {/* 2. Core High-Intensity Vertical Neon Laser Beam */}
      <motion.div
        animate={{
          opacity: isAgentSpeaking ? [0.8, 1, 0.8] : [0.65, 0.85, 0.65],
          scaleX: [1, 1.15, 1],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "linear-gradient(to top, rgba(0, 240, 255, 0.95) 0%, rgba(255, 215, 0, 0.85) 60%, transparent 100%)",
          filter: "blur(8px)",
        }}
        className="absolute bottom-0 w-[64px] h-[480px]"
      />

      {/* 3. Rising Holographic Scanline Wave Pulse */}
      <motion.div
        animate={{ y: [220, -180], opacity: [0, 0.85, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        className="absolute w-[320px] h-[5px] rounded-full bg-cyan-200 blur-sm shadow-[0_0_20px_#00f0ff]"
      />

      {/* 4. Second Faster Golden Wave Pulse */}
      <motion.div
        animate={{ y: [240, -160], opacity: [0, 0.75, 0] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: "linear", delay: 1.1 }}
        className="absolute w-[260px] h-[4px] rounded-full bg-amber-200 blur-sm shadow-[0_0_18px_#ffd700]"
      />

      {/* 5. Radiant Hotspot Oval directly at bottom edge of Center Card */}
      <div
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255, 215, 0, 0.85) 0%, rgba(0, 240, 255, 0.5) 45%, transparent 75%)",
          filter: "blur(12px)",
        }}
        className="absolute bottom-[230px] w-[380px] h-[80px] rounded-full animate-pulse"
      />

      {/* 6. Base Projection Emitter Halo on Floor */}
      <div
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.9) 0%, rgba(255, 215, 0, 0.6) 40%, transparent 70%)",
          filter: "blur(10px)",
        }}
        className="absolute bottom-2 w-[220px] h-[45px] rounded-full"
      />
    </div>
  );
});

export default HolographicProjectorBeam;
