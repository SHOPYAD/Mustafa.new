"use client";

import dynamic from "next/dynamic";

const PlannerMap = dynamic(() => import("./PlannerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[280px] items-center justify-center bg-[#1A1438] text-[14px] font-bold text-white/80">
      …
    </div>
  ),
});

export default function PlannerMapHost({ compact }: { compact?: boolean }) {
  return <PlannerMap compact={compact} />;
}
