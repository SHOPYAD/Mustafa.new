"use client";

import React from "react";
import type { HubMetrics } from "./NexusSystemCard";

type Summary = {
  avgReadiness: number | null;
  liveRecords: number | null;
  degradedCount: number;
  fetchedAt?: string;
};

type Props = {
  summary: Summary | null;
  active?: HubMetrics | null;
  activeTitle?: string;
};

export function NexusLiveAnalyticsPanel({ summary, active, activeTitle }: Props) {
  return (
    <aside className="pointer-events-auto absolute left-4 top-[72px] z-20 w-56 rounded-2xl border border-cyan-500/30 bg-[#051321]/88 p-3 text-right backdrop-blur-xl" dir="rtl">
      <div className="text-[10px] font-mono text-cyan-300">LIVE ANALYTICS</div>
      <Row label="متوسط الجاهزية" value={summary?.avgReadiness} />
      <Row label="سجلات حية" value={summary?.liveRecords} raw />
      <Row label="أقسام متدهورة" value={summary?.degradedCount} raw />
      {activeTitle ? <div className="mt-2 truncate text-[11px] text-white">{activeTitle}</div> : null}
      <Row label="جاهزية البطاقة" value={active?.readinessPct} />
    </aside>
  );
}

function Row({ label, value, raw }: { label: string; value?: number | null; raw?: boolean }) {
  const text = value == null ? "—" : raw ? String(value) : `${value}%`;
  return (
    <div className="mt-1.5 flex items-center justify-between text-[11px]">
      <span className="font-mono text-cyan-100">{text}</span>
      <span className="text-slate-400">{label}</span>
    </div>
  );
}
