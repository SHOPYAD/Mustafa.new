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
          className="ed-device-frame relative flex w-full flex-col overflow-visible rounded-xl border shadow-lg"
          style={{
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
            height: scale < 1 ? `${100 / scale}%` : "auto",
            minHeight: scale < 1 ? `${100 / scale}%` : "100%",
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
