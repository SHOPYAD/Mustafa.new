"use client";

import dynamic from "next/dynamic";
import React from "react";

const VisualLoopsEngine = dynamic(
  () => import("../loops/VisualLoopsEngine"),
  { ssr: false, loading: () => <StageLoader label="VISUAL LOOPS STUDIO" /> }
);

function StageLoader({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#010712] font-mono text-cyan-300">
      {label} · جاري التحميل…
    </div>
  );
}

/** شاشة 22 — استوديو العقد والأتمتة البصرية بكامل الشاشة. */
export default function VisualLoopsStage() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <VisualLoopsEngine />
    </div>
  );
}
