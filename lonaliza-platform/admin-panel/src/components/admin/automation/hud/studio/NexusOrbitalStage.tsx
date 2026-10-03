"use client";

import React, { useCallback } from "react";
import { NexusMasterStage } from "@/components/admin/automation/hud/nexus/NexusMasterStage";
import { NEXUS_HUB_CARDS, type NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import { openStudioWindow, useWindowStore } from "@/lib/studio/windows/window-store";

export interface NexusOrbitalStageProps {
  audioFrequencies?: number[];
  isListening?: boolean;
  isAgentSpeaking?: boolean;
  onOpenScreen?: (screenId: string) => void;
  onAskAgent?: (directive: string) => Promise<string>;
  onOpenSupervisor?: () => void;
  onToggleVoice?: () => void;
}

function windowIdForHub(hubId: string) {
  return `nexus:hub:${hubId}`;
}

export default function NexusOrbitalStage(props: NexusOrbitalStageProps) {
  const { onOpenScreen, onAskAgent, audioFrequencies = [], isListening, isAgentSpeaking, onOpenSupervisor, onToggleVoice } = props;

  const openHubCyberSettings = useCallback(
    (card: NexusHubCard) => {
      // Do not navigate away from Screen 21. Open strictly in-place in studio.
      const href = card.href;
      const embedHref = `${href}${href.includes("?") ? "&" : "?"}studio=1`;
      openStudioWindow(
        "route",
        windowIdForHub(card.hubId),
        card.titleAr,
        {
          href: embedHref,
          page: true,
          studio: 1,
          embed: true,
          hubId: card.hubId,
          screenId: card.screenId,
        },
        { w: 1080, h: 660 }
      );
    },
    []
  );

  const closeHubCyberSettings = useCallback((hubId: string) => {
    useWindowStore.getState().close(windowIdForHub(hubId));
  }, []);

  const handleSendDirective = useCallback(
    (directive: string) => {
      return onAskAgent?.(directive);
    },
    [onAskAgent]
  );

  const handleSelectSector = useCallback(
    (stationId: string) => {
      const card = NEXUS_HUB_CARDS.find((c) => c.stationId === stationId || c.hubId === stationId);
      if (card) openHubCyberSettings(card);
    },
    [openHubCyberSettings]
  );

  return (
    <NexusMasterStage
      audioFrequencies={audioFrequencies}
      isListening={isListening}
      isAgentSpeaking={isAgentSpeaking}
      onSendDirective={handleSendDirective}
      onOpenSupervisor={onOpenSupervisor}
      onToggleVoice={onToggleVoice}
      onOpenRealSection={openHubCyberSettings}
    />
  );
}

