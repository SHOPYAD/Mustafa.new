"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface HolographicFoilCardProps {
  name?: string;
  set?: string;
  number?: string;
  className?: string;
}

export function HolographicFoilCard({
  name = "AURORA-9",
  set = "SPECTRAL SERIES",
  number = "021 / 100",
  className = "",
}: HolographicFoilCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const sx = useSpring(mx, spring);
  const sy = useSpring(my, spring);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [16, -16]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);
  const foil = useTransform([sx, sy], ([x, y]) => {
    const px = ((Number(x) + 0.5) * 100).toFixed(1);
    const py = ((Number(y) + 0.5) * 100).toFixed(1);
    return `linear-gradient(${Number(x) * 80 + 120}deg, rgba(255,80,180,0.0) 20%, rgba(80,220,255,0.45) 45%, rgba(255,220,80,0.4) 58%, rgba(180,80,255,0.35) 72%, transparent 88%), radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.55), transparent 42%)`;
  });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      className={`flex min-h-screen w-full items-center justify-center bg-[#09090f] p-8 ${className}`}
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-[440px] w-[300px] cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-700 p-[2px] shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
          <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#111118]">
            <motion.div
              className="absolute inset-0 mix-blend-color-dodge opacity-80"
              style={{ backgroundImage: foil }}
            />
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(from 0deg, transparent 0deg 8deg, rgba(255,255,255,0.15) 8deg 9deg)",
              }}
            />
            <motion.div
              className="pointer-events-none absolute h-40 w-40 rounded-full bg-white/30 blur-2xl"
              style={{ left: glareX, top: glareY, x: "-50%", y: "-50%" }}
            />
            <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
              <div className="flex items-start justify-between font-mono text-[10px] tracking-[0.25em] text-white/70">
                <span>{set}</span>
                <span>{number}</span>
              </div>
              <div>
                <div className="mb-3 h-36 w-full rounded-xl border border-white/15 bg-white/5" />
                <h2 className="font-mono text-3xl font-black tracking-tight">{name}</h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/80">
                  Holographic rare
                </p>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-white/50">
                <span>ATK 88 · DEF 91</span>
                <span>FOIL</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default HolographicFoilCard;
