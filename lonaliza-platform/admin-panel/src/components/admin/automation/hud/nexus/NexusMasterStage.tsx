"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { NEXUS_HUB_CARDS, type NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import type { HubMetrics } from "./NexusSystemCard";
import { OverheadHoloCamera } from "./components/OverheadHoloCamera";
import { CurvedCardsCarousel } from "./components/CurvedCardsCarousel";
import { LiveAnalyticsCard, type LiveAnalyticsData } from "./components/LiveAnalyticsCard";
import { GlobalActivityCard } from "./components/GlobalActivityCard";
import { SystemStatusCard } from "./components/SystemStatusCard";
import { InteractiveStageFloor } from "./components/InteractiveStageFloor";
import { HolographicVaporMist } from "./components/HolographicVaporMist";
import { NeuralLightningBackdrop } from "./components/NeuralLightningBackdrop";
import { CameraGestureEngine } from "./components/CameraGestureEngine";
import { NexusStudioFloatingWindow } from "./components/NexusStudioFloatingWindow";

export interface NexusMasterStageProps {
  audioFrequencies?: number[];
  isListening?: boolean;
  isAgentSpeaking?: boolean;
  onSendDirective?: (directive: string) => Promise<string | void> | void;
  onOpenSupervisor?: () => void;
  onToggleVoice?: () => void;
  onOpenRealSection?: (card: NexusHubCard) => void;
}

export const NexusMasterStage = memo(function NexusMasterStage({
  audioFrequencies = [],
  isListening = false,
  isAgentSpeaking = false,
  onSendDirective,
  onOpenSupervisor,
  onToggleVoice,
  onOpenRealSection,
}: NexusMasterStageProps) {
  // Carousel State - Default index 2 puts MARKETS at center, flanked by FLIGHTS, HOTELS, PROJECTS, SOCIAL
  const [activeIndex, setActiveIndex] = useState(2);
  const [metricsByHub, setMetricsByHub] = useState<Record<string, HubMetrics>>({});
  const [summaryMetrics, setSummaryMetrics] = useState<Record<string, { value: string; label: string; trend?: string }>>({});
  const [liveAnalytics, setLiveAnalytics] = useState<LiveAnalyticsData | null>(null);
  const [activityPoints, setActivityPoints] = useState<number[]>([55, 68, 82, 45, 95, 70, 88, 62, 78, 84, 91]);

  // Camera & Gestures (Default OFF as requested by user)
  const [cameraActive, setCameraActive] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  const [activeGesture, setActiveGesture] = useState<string | null>(null);

  // In-Studio Section Modal
  const [inspectedCard, setInspectedCard] = useState<NexusHubCard | null>(null);

  // Rotation handler
  const totalCards = NEXUS_HUB_CARDS.length;
  const rotateCarousel = useCallback(
    (delta: number) => {
      setActiveIndex((prev) => (prev + delta + totalCards) % totalCards);
    },
    [totalCards]
  );

  // Card open & close (STRICTLY IN-PLACE INSIDE STUDIO)
  const handleOpenCard = useCallback((card: NexusHubCard) => {
    setInspectedCard(card);
  }, []);

  const handleCloseCard = useCallback(() => {
    setInspectedCard(null);
  }, []);

  // Listen to custom studio commands (voice, intent, gestures)
  useEffect(() => {
    const handleCustomRotate = (ev: Event) => {
      const detail = (ev as CustomEvent<{ delta?: number; index?: number }>).detail;
      if (typeof detail?.index === "number") {
        setActiveIndex(detail.index % totalCards);
      } else if (typeof detail?.delta === "number") {
        rotateCarousel(detail.delta);
      }
    };

    const handleOpenSector = () => {
      if (NEXUS_HUB_CARDS[activeIndex]) {
        handleOpenCard(NEXUS_HUB_CARDS[activeIndex]);
      }
    };

    const handleCloseSector = () => {
      handleCloseCard();
    };

    const handleToggleCam = () => {
      setCameraActive((v) => !v);
    };

    const handleSelectSectorEv = (ev: Event) => {
      const detail = (ev as CustomEvent<{ stationId?: string; hubId?: string; sectorId?: string }>).detail;
      if (!detail) return;
      const idx = NEXUS_HUB_CARDS.findIndex(
        (c) =>
          (detail.stationId && (c.stationId === detail.stationId || c.hubId === detail.stationId)) ||
          (detail.hubId && c.hubId === detail.hubId) ||
          (detail.sectorId && c.id === detail.sectorId)
      );
      if (idx >= 0) {
        setActiveIndex(idx);
        handleOpenCard(NEXUS_HUB_CARDS[idx]);
      }
    };

    window.addEventListener("studio:nexus-rotate", handleCustomRotate);
    window.addEventListener("studio:nexus-open-sector", handleOpenSector);
    window.addEventListener("studio:nexus-close-sector", handleCloseSector);
    window.addEventListener("studio:nexus-toggle-camera", handleToggleCam);
    window.addEventListener("studio:nexus-select-sector", handleSelectSectorEv);

    return () => {
      window.removeEventListener("studio:nexus-rotate", handleCustomRotate);
      window.removeEventListener("studio:nexus-open-sector", handleOpenSector);
      window.removeEventListener("studio:nexus-close-sector", handleCloseSector);
      window.removeEventListener("studio:nexus-toggle-camera", handleToggleCam);
      window.removeEventListener("studio:nexus-select-sector", handleSelectSectorEv);
    };
  }, [activeIndex, handleCloseCard, handleOpenCard, rotateCarousel, totalCards]);

  // Fetch real telemetry metrics from system
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/studio/nexus/metrics/summary")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.ok) return;
        if (data.liveAnalytics) {
          setLiveAnalytics(data.liveAnalytics);
        }
        if (data.hubMetricsSummary) {
          setSummaryMetrics(data.hubMetricsSummary);
        }
        if (Array.isArray(data.points) && data.points.length > 0) {
          setActivityPoints(data.points);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch individual hub metrics for active card
  useEffect(() => {
    const card = NEXUS_HUB_CARDS[activeIndex];
    if (!card || metricsByHub[card.hubId]) return;

    let cancelled = false;
    fetch(`/api/admin/studio/nexus/metrics?hubId=${encodeURIComponent(card.hubId)}`)
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

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#01060f] text-white select-none">
      {/* 1. Interactive Neural Synaptic Field Background with Mouse Electric Lightning Arcs */}
      <NeuralLightningBackdrop />

      {/* TOP: Overhead Camera & Compact Sensor Console */}
      <OverheadHoloCamera
        cameraActive={cameraActive}
        onToggleCamera={() => setCameraActive((v) => !v)}
        gestureFeedback={gestureFeedback}
        activeGesture={activeGesture}
      />

      {/* LEFT COLUMN: Live Analytics (Top) & Global Activity (Bottom) - ZERO CARD OVERLAP */}
      <div className="pointer-events-none absolute left-6 top-16 bottom-6 z-25 flex flex-col justify-between">
        <LiveAnalyticsCard data={liveAnalytics} />
        <GlobalActivityCard points={activityPoints} liveVisitorsCount={liveAnalytics?.usersOnline ?? 6} />
      </div>

      {/* RIGHT COLUMN: System Status (Bottom) - ZERO CARD OVERLAP */}
      <div className="pointer-events-none absolute right-6 bottom-6 z-25 flex flex-col justify-end">
        <SystemStatusCard
          cameraActive={cameraActive}
          gestureStatus={cameraActive ? "Ready" : "Standby"}
          aiStatus={isAgentSpeaking ? "Speaking" : isListening ? "Thinking" : "Online"}
        />
      </div>

      {/* 2. 3D PERSPECTIVE FLAT FLOOR (With Concentric Rings, Card Reflections, and Supervisor Disc in Front) */}
      <InteractiveStageFloor
        cards={NEXUS_HUB_CARDS}
        activeIndex={activeIndex}
        isListening={isListening}
        isAgentSpeaking={isAgentSpeaking}
        audioFrequencies={audioFrequencies}
        onToggleVoice={onToggleVoice}
        onOpenCard={handleOpenCard}
      />

      {/* 3. ETHEREAL RISING AND DISSIPATING HOLOGRAPHIC VAPOR MIST (Drifting upward from Supervisor Disc) */}
      <HolographicVaporMist
        isListening={isListening}
        isAgentSpeaking={isAgentSpeaking}
        audioFrequencies={audioFrequencies}
        themeColor={NEXUS_HUB_CARDS[activeIndex] ? (NEXUS_HUB_CARDS[activeIndex].tone === "gold" || activeIndex % 5 === 2 ? "gold" : "cyan") : "gold"}
      />

      {/* CENTER: Curved 3D Arc Holographic Cards Deck (Positioned comfortably below top header & console) */}
      <div className="absolute inset-x-0 top-[72px] bottom-[110px] z-20 flex flex-col items-center justify-center pointer-events-none">
        <CurvedCardsCarousel
          cards={NEXUS_HUB_CARDS}
          activeIndex={activeIndex}
          metricsByHub={metricsByHub}
          summaryMetrics={summaryMetrics}
          onRotate={rotateCarousel}
          onOpen={handleOpenCard}
          onQuick={(card) => onSendDirective?.(card.quickActionCommand)}
        />
      </div>

      {/* 4. Center Bottom 5 Pagination Dots (Positioned directly above the bottom dock bar) */}
      <div className="fixed bottom-[74px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-cyan-500/35 bg-[#020b18]/95 px-4 py-1.5 backdrop-blur-xl shadow-[0_0_20px_rgba(0,240,255,0.25)] pointer-events-auto select-none">
        {[-2, -1, 0, 1, 2].map((offset) => {
          const isCenter = offset === 0;
          return (
            <button
              key={offset}
              type="button"
              onClick={() => rotateCarousel(offset)}
              className={`rounded-full transition-all duration-300 ${
                isCenter
                  ? "h-2 w-4 bg-cyan-400 shadow-[0_0_12px_#00f0ff]"
                  : "h-1.5 w-1.5 bg-slate-600 hover:bg-cyan-500/60"
              }`}
              title="انتقال"
            />
          );
        })}
        <span className="ml-2 font-mono text-[10px] text-slate-400 border-l border-white/10 pl-2">
          {String(activeIndex + 1).padStart(2, "0")} / {String(totalCards).padStart(2, "0")}
        </span>
      </div>

      {/* Real-time Optical Flow Camera Gesture Tracking Engine */}
      <CameraGestureEngine
        isActive={cameraActive}
        onSwipeLeft={() => rotateCarousel(-1)}
        onSwipeRight={() => rotateCarousel(1)}
        onOpenCard={() => {
          if (NEXUS_HUB_CARDS[activeIndex]) {
            handleOpenCard(NEXUS_HUB_CARDS[activeIndex]);
          }
        }}
        onCloseCard={handleCloseCard}
        onGestureDetected={(g) => {
          setActiveGesture(g);
          setTimeout(() => setActiveGesture(null), 1000);
        }}
        onStatusChange={(msg) => setGestureFeedback(msg)}
      />

      {/* IN-STUDIO FLOATING SECTION WINDOW (DRAGGABLE, RESIZABLE, MINIMIZABLE, MAXIMIZABLE) */}
      <NexusStudioFloatingWindow
        card={inspectedCard}
        metrics={inspectedCard ? metricsByHub[inspectedCard.hubId] : null}
        onClose={handleCloseCard}
        onSendDirective={onSendDirective}
      />
    </div>
  );
});

export default NexusMasterStage;
