"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { NEXUS_HUB_CARDS, type NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import { NexusReferenceBackdrop } from "./NexusReferenceBackdrop";
import { NexusHolographicCarousel } from "./NexusHolographicCarousel";
import { NexusLiveAnalyticsPanel } from "./NexusLiveAnalyticsPanel";
import { NexusGlobalActivityPanel } from "./NexusGlobalActivityPanel";
import { NexusSystemStatusPanel } from "./NexusSystemStatusPanel";
import { NexusSupervisorDock } from "./NexusSupervisorDock";
import type { HubMetrics } from "./NexusSystemCard";

export type NexusReferenceStageProps = {
  audioFrequencies?: number[];
  isListening?: boolean;
  isAgentSpeaking?: boolean;
  onOpenHub: (card: NexusHubCard) => void;
  onSendDirective?: (directive: string) => void;
  onOpenSupervisor?: () => void;
};

type Summary = {
  avgReadiness: number | null;
  liveRecords: number | null;
  degradedCount: number;
  points: number[];
};

export function NexusReferenceStage({
  audioFrequencies = [],
  isListening = false,
  isAgentSpeaking = false,
  onOpenHub,
  onSendDirective,
  onOpenSupervisor,
}: NexusReferenceStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [metricsByHub, setMetricsByHub] = useState<Record<string, HubMetrics>>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  const [cameraOn, setCameraOn] = useState(false);

  const rotate = useCallback((delta: number) => {
    setActiveIndex((i) => (i + delta + NEXUS_HUB_CARDS.length) % NEXUS_HUB_CARDS.length);
  }, []);

  useEffect(() => {
    const onRotate = (ev: Event) => {
      const delta = (ev as CustomEvent<{ delta?: number; index?: number }>).detail;
      if (typeof delta?.index === "number") setActiveIndex(delta.index % NEXUS_HUB_CARDS.length);
      else if (typeof delta?.delta === "number") rotate(delta.delta);
    };
    window.addEventListener("studio:nexus-rotate", onRotate);
    return () => window.removeEventListener("studio:nexus-rotate", onRotate);
  }, [rotate]);

  useEffect(() => {
    const card = NEXUS_HUB_CARDS[activeIndex];
    if (!card || metricsByHub[card.hubId]) return;
    let cancelled = false;
    void fetch(`/api/admin/studio/nexus/metrics?hubId=${encodeURIComponent(card.hubId)}`)
      .then((r) => r.json())
      .then((body) => {
        if (cancelled || !body?.ok) return;
        setMetricsByHub((prev) => ({
          ...prev,
          [card.hubId]: {
            readinessPct: body.readinessPct ?? null,
            recordsPct: body.recordsPct ?? null,
            integrationPct: body.integrationPct ?? null,
            status: body.status,
          },
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [activeIndex, metricsByHub]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/studio/nexus/metrics/summary")
      .then((r) => r.json())
      .then((body) => {
        if (cancelled || !body?.ok) return;
        setSummary({
          avgReadiness: body.avgReadiness ?? null,
          liveRecords: body.liveRecords ?? null,
          degradedCount: body.degradedCount ?? 0,
          points: Array.isArray(body.points) ? body.points : [],
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const active = NEXUS_HUB_CARDS[activeIndex];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <NexusReferenceBackdrop />
      <NexusLiveAnalyticsPanel summary={summary} active={active ? metricsByHub[active.hubId] : null} activeTitle={active?.titleAr} />
      <NexusGlobalActivityPanel points={summary?.points ?? []} />
      <NexusSystemStatusPanel camera={cameraOn} gesture={cameraOn ? "TRACK" : "STANDBY"} agent={isAgentSpeaking ? "Speaking" : isListening ? "Listening" : "Online"} />
      <button
        type="button"
        onClick={() => setCameraOn((v) => !v)}
        className="absolute right-4 top-[72px] z-20 flex items-center gap-2 rounded-2xl border border-cyan-500/35 bg-[#051321]/90 px-3 py-2 text-[11px] font-mono text-cyan-100"
      >
        {cameraOn ? <Camera size={14} /> : <CameraOff size={14} />}
        Gesture Control
      </button>
      <NexusHolographicCarousel
        activeIndex={activeIndex}
        metricsByHub={metricsByHub}
        onRotate={rotate}
        onOpen={onOpenHub}
        onQuick={(card) => onSendDirective?.(card.quickActionCommand)}
      />
      <NexusSupervisorDock
        isListening={isListening}
        isAgentSpeaking={isAgentSpeaking}
        audioFrequencies={audioFrequencies}
        onOpen={() => onOpenSupervisor?.()}
      />
    </div>
  );
}
