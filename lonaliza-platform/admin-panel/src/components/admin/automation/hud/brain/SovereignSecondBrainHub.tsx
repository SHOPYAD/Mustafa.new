"use client";

import React, { useEffect } from "react";
import { useSecondBrainStore } from "./store/useSecondBrainStore";
import LineageAncestryBar from "./components/LineageAncestryBar";
import FloatingControlsDrawer from "./components/FloatingControlsDrawer";
import NodeInspectorDrawer from "./components/NodeInspectorDrawer";

// The 4 Core Views
import HexagonalConstellationView from "./views/HexagonalConstellationView";
import ConcentricGalacticView from "./views/ConcentricGalacticView";
import TacticalCommandDeckView from "./views/TacticalCommandDeckView";
import DeepNeuralCircuitDAGView from "./views/DeepNeuralCircuitDAGView";

interface SovereignSecondBrainHubProps {
  onBackToWarRoom?: () => void;
  // Bi-directional voice listener
  voiceState?: {
    isSpeaking?: boolean;
    lastTranscript?: string;
  };
}

export default function SovereignSecondBrainHub({
  onBackToWarRoom,
  voiceState,
}: SovereignSecondBrainHubProps) {
  const {
    viewMode,
    selectCluster,
    openInspectorWithSubModule,
    setViewMode,
  } = useSecondBrainStore();

  // Listen to Supervisor Voice Speech & automatically focus relevant nodes
  useEffect(() => {
    if (!voiceState?.lastTranscript) return;
    const text = voiceState.lastTranscript.toLowerCase();

    if (text.includes("طيران") || text.includes("flight") || text.includes("gds")) {
      selectCluster("cluster-flights");
    } else if (text.includes("فندق") || text.includes("فنادق") || text.includes("hotel") || text.includes("ratehawk")) {
      selectCluster("cluster-hotels");
    } else if (text.includes("سيارة") || text.includes("أسطول") || text.includes("توصيل") || text.includes("fleet")) {
      selectCluster("cluster-transfers");
    } else if (text.includes("باقة") || text.includes("باقات") || text.includes("تأشير") || text.includes("visa")) {
      selectCluster("cluster-packages");
    } else if (text.includes("خزين") || text.includes("دفع") || text.includes("عملات") || text.includes("fx")) {
      selectCluster("cluster-treasury");
    } else if (text.includes("موزع") || text.includes("b2b") || text.includes("ليد")) {
      selectCluster("cluster-b2b");
    } else if (text.includes("أمان") || text.includes("أمن") || text.includes("ترخيص") || text.includes("qdrant")) {
      selectCluster("cluster-security");
    } else if (text.includes("إعلان") || text.includes("حملة") || text.includes("ads") || text.includes("تسويق")) {
      selectCluster("cluster-publishing");
    }

    if (text.includes("تفكيك") || text.includes("مسار الكود") || text.includes("dag")) {
      setViewMode("deep_circuit");
    } else if (text.includes("غرفة القيادة") || text.includes("قيادة")) {
      setViewMode("command_deck");
    } else if (text.includes("مجرة") || text.includes("مدار")) {
      setViewMode("sunburst");
    } else if (text.includes("خلايا") || text.includes("سداسي")) {
      setViewMode("hexagonal");
    }
  }, [voiceState?.lastTranscript, selectCluster, setViewMode]);

  return (
    <div
      dir="ltr"
      style={{ direction: "ltr", textAlign: "left" }}
      className="relative w-full h-full max-h-full flex flex-col bg-[#010813] text-slate-100 select-none overflow-hidden font-sans"
    >
      {/* 1. Sovereign Top Lineage & View Switcher Bar */}
      <LineageAncestryBar onBackToWarRoom={onBackToWarRoom} />

      {/* 2. Active Dynamic View Stage */}
      <div className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden">
        {viewMode === "hexagonal" && <HexagonalConstellationView />}
        {viewMode === "sunburst" && <ConcentricGalacticView />}
        {viewMode === "command_deck" && <TacticalCommandDeckView />}
        {viewMode === "deep_circuit" && <DeepNeuralCircuitDAGView />}
      </div>

      {/* 3. Floating Cyber Tuning Drawer (Right side) */}
      <FloatingControlsDrawer />

      {/* 4. Sliding Executive Node Inspector & Dispatch Drawer */}
      <NodeInspectorDrawer />
    </div>
  );
}
