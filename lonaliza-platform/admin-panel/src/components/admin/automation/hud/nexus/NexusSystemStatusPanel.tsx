"use client";

import React from "react";

type Props = {
  camera: boolean;
  gesture: string;
  agent: string;
};

export function NexusSystemStatusPanel({ camera, gesture, agent }: Props) {
  return (
    <aside className="pointer-events-none absolute bottom-[200px] right-4 z-20 w-52 rounded-2xl border border-cyan-500/25 bg-[#051321]/80 p-3 text-right" dir="rtl">
      <div className="text-[10px] font-mono text-cyan-300">SYSTEM STATUS</div>
      <Line label="الكاميرا" value={camera ? "Active" : "Standby"} />
      <Line label="الإيماءة" value={gesture} />
      <Line label="الوكيل" value={agent} />
    </aside>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1.5 flex justify-between text-[11px]">
      <span className="font-mono text-emerald-300">{value}</span>
      <span className="text-slate-400">{label}</span>
    </div>
  );
}
