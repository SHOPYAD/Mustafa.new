"use client";

import React from "react";

type Props = { points: number[] };

export function NexusGlobalActivityPanel({ points }: Props) {
  const max = Math.max(1, ...points);
  return (
    <aside className="pointer-events-none absolute bottom-[200px] left-4 z-20 w-56 rounded-2xl border border-cyan-500/25 bg-[#051321]/80 p-3" dir="rtl">
      <div className="text-[10px] font-mono text-cyan-300">GLOBAL ACTIVITY</div>
      <div className="mt-2 flex h-16 items-end gap-0.5">
        {points.slice(0, 24).map((p, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm bg-cyan-400/70"
            style={{ height: `${Math.max(8, (p / max) * 100)}%` }}
          />
        ))}
      </div>
    </aside>
  );
}
