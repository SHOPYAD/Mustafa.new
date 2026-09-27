"use client";

/* Agent A: editor chrome only */

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import type { BuilderDevice } from "@/lib/builder/editor-store";

const SIZE: Record<BuilderDevice, { w: number }> = {
  desktop: { w: 1440 },
  tablet: { w: 820 },
  mobile: { w: 390 },
};

export function DeviceFrame({
  device,
  children,
}: {
  device: BuilderDevice;
  children: ReactNode;
}) {
  const { w } = SIZE[device];
  const [available, setAvailable] = useState(1440);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById("canvas-wrap");
      setAvailable(el?.clientWidth || window.innerWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scale = device === "desktop" ? Math.min(1, (available - 32) / w) : 1;
  const frameWidth = `${w}px`;
  const slotWidth = w * scale;

  return (
    <div className="flex h-full w-full items-start justify-center overflow-visible p-4">
      <div className="relative flex" style={{ width: slotWidth, minHeight: "100%" }}>
        <motion.div
          layout
          initial={false}
          animate={{ width: frameWidth }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className={
            device === "mobile"
              ? "ed-device-frame relative flex w-full flex-col overflow-hidden rounded-[48px] border-[10px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/20 bg-slate-950"
              : "ed-device-frame relative flex w-full flex-col overflow-visible rounded-xl border shadow-lg"
          }
          style={{
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
            height: scale < 1 ? `${100 / scale}%` : "auto",
            minHeight: scale < 1 ? `${100 / scale}%` : "100%",
          }}
        >
          {device === "mobile" && (
            <div className="relative w-full h-7 bg-slate-950 flex items-center justify-center shrink-0 border-b border-slate-900 z-30 select-none">
              {/* Dynamic Island Notch */}
              <div className="h-4 w-24 rounded-full bg-black flex items-center justify-between px-2.5 shadow-inner border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" />
              </div>
            </div>
          )}
          {children}
          {device === "mobile" && (
            <div className="relative w-full h-4 bg-slate-950 flex items-center justify-center shrink-0 z-30 select-none">
              <div className="h-1 w-28 rounded-full bg-slate-600/60" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
