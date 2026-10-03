"use client";

import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";

export const InteractiveMirrorDeck = memo(function InteractiveMirrorDeck() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const xPct = Math.round((e.clientX / window.innerWidth) * 100);
      const yPct = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x: xPct, y: yPct });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
      {/* 1. Ambient Cybernetic Server Hall Vertical Light Pillars (Left & Right - Matching Image 3) */}
      <div className="absolute inset-y-0 left-0 w-80 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-transparent opacity-70" />
      <div className="absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-indigo-950/40 via-purple-950/20 to-transparent opacity-70" />

      {/* Vertical Neon Ray Accents on Edges */}
      <div
        className="absolute top-0 bottom-0 left-12 w-[1px] opacity-35"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0, 240, 255, 0.6) 40%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-0 bottom-0 right-12 w-[1px] opacity-35"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(192, 132, 252, 0.6) 40%, transparent 100%)",
        }}
      />

      {/* 2. Interactive Mouse Spotlight following Cursor */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(0, 240, 255, 0.08) 0%, rgba(6, 32, 68, 0.03) 50%, transparent 80%)`,
        }}
      />

      {/* 3. Glossy Reflective Stage Floor with Mirrored Horizon */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[48%] overflow-hidden"
        style={{
          perspective: 1200,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Floor Surface - Deep Obsidian Mirror Glass */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 8, 20, 0.2) 0%, rgba(2, 16, 36, 0.75) 40%, #000407 100%)",
            boxShadow: "inset 0 10px 40px rgba(0, 240, 255, 0.15)",
          }}
        />

        {/* 3D Curved Perspective Concentric Blue Neon Rings on Floor */}
        <div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] rounded-full opacity-45 pointer-events-none"
          style={{
            transform: "rotateX(78deg) scaleY(0.65)",
            border: "2px solid rgba(0, 240, 255, 0.4)",
            boxShadow: "0 0 60px rgba(0, 240, 255, 0.3), inset 0 0 80px rgba(0, 240, 255, 0.2)",
          }}
        >
          {/* Inner concentric rings */}
          <div className="absolute inset-16 rounded-full border border-cyan-400/30" />
          <div className="absolute inset-36 rounded-full border border-blue-400/35 border-dashed" />
          <div className="absolute inset-56 rounded-full border border-cyan-300/40" />
          <div className="absolute inset-80 rounded-full border border-amber-400/30" />
        </div>

        {/* Floor Horizontal Horizon Neon Glow Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px] opacity-60"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(0, 240, 255, 0.8) 50%, transparent 95%)",
            boxShadow: "0 0 20px #00f0ff",
          }}
        />

        {/* Floor Specular Sheen reacting to mouse */}
        <div
          className="absolute top-0 left-0 right-0 h-40 opacity-40 blur-xl"
          style={{
            background: `radial-gradient(ellipse 700px 100px at ${mousePos.x}% 0%, rgba(0, 240, 255, 0.35) 0%, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
});

export default InteractiveMirrorDeck;
