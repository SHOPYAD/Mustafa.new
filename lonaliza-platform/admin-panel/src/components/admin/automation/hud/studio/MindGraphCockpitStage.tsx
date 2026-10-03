"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { StudioStageProps } from "./StageFrame";

const MindGraphCockpit = dynamic(
  () => import("./mind-graph/MindGraphCockpit").then((m) => m.MindGraphCockpit),
  {
    ssr: false,
    loading: () => <StageLoader label="SOVEREIGN MIND GRAPH COCKPIT" />,
  }
);

function StageLoader({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#010611] font-mono text-cyan-300">
      {label} · جاري تحميل العقل المدبر ومحاكاة العقد العصبية…
    </div>
  );
}

export type MindGraphCockpitStageProps = StudioStageProps;

/** شاشة 23 — استعراض العقل المدبر السيادي وخريطة العقد العصبية المؤسسية بجمالية الأطلس الكاملة. */
export default function MindGraphCockpitStage(props: MindGraphCockpitStageProps) {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <MindGraphCockpit {...props} />
    </div>
  );
}
