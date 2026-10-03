"use client";

import React from "react";
import type { NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import { TONES, type Tone } from "@/lib/studio/tokens";

export type HubMetrics = {
  readinessPct: number | null;
  recordsPct: number | null;
  integrationPct: number | null;
  status?: string;
};

type Props = {
  card: NexusHubCard;
  index: number;
  total: number;
  focused: boolean;
  metrics?: HubMetrics | null;
  onOpen: () => void;
  onQuick: () => void;
};

function toneOf(tone: string): Tone {
  if (tone === "gold" || tone === "cyan" || tone === "magenta" || tone === "green" || tone === "violet") return tone;
  return "cyan";
}

export function NexusSystemCard({ card, index, total, focused, metrics, onOpen, onQuick }: Props) {
  const t = TONES[toneOf(card.tone)];
  const m1 = metrics?.readinessPct;
  const m2 = metrics?.recordsPct;
  const m3 = metrics?.integrationPct;
  return (
    <article
      dir="rtl"
      className="flex h-full w-full flex-col rounded-2xl border bg-[#051321]/90 p-3 text-right shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      style={{
        borderColor: focused ? t.line : "rgba(53,227,255,0.28)",
        boxShadow: focused ? `0 0 28px ${t.halo}` : undefined,
      }}
    >
      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300/80">
        <span>#{String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
        <span className="truncate">{card.category}</span>
      </div>
      <div className="mt-2 text-[11px] font-mono tracking-wide" style={{ color: t.title }}>
        {card.titleEn}
      </div>
      <h3 className="mt-1 text-sm font-bold text-white">{card.titleAr}</h3>
      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">{card.description}</p>
      <div className="mt-2 grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
        <Metric label={card.metricLabel1} value={m1} />
        <Metric label={card.metricLabel2} value={m2} />
        <Metric label={card.metricLabel3} value={m3} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {card.features.slice(0, 3).map((f) => (
          <span key={f} className="rounded-md border border-cyan-500/25 px-1.5 py-0.5 text-[9px] text-cyan-100">
            {f}
          </span>
        ))}
      </div>
      <div className="mt-auto flex gap-2 pt-2">
        <button type="button" onClick={onQuick} className="flex-1 rounded-lg border border-amber-400/50 bg-amber-500/15 px-2 py-1 text-[10px] text-amber-100">
          توجيه فوري
        </button>
        <button type="button" onClick={onOpen} className="flex-1 rounded-lg border border-cyan-400/50 bg-cyan-500/15 px-2 py-1 text-[10px] text-cyan-100">
          فتح القسم
        </button>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="rounded-lg border border-cyan-500/20 bg-black/30 px-1 py-1">
      <div className="text-white">{value == null ? "—" : `${value}%`}</div>
      <div className="truncate text-slate-500">{label}</div>
    </div>
  );
}
