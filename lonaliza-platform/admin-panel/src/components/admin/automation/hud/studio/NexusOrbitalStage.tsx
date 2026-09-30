"use client";

import React, { useCallback } from "react";
import HolographicCylinderStage from "@/components/admin/automation/hud/nexus/HolographicCylinderStage";
import { NEXUS_HUB_CARDS, type NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import { openStudioWindow, useWindowStore } from "@/lib/studio/windows/window-store";
export interface NexusOrbitalStageProps {
  audioFrequencies?: number[];
  onOpenScreen: (screenId: string) => void;
  onAskAgent?: (directive: string) => Promise<string>;
}

function windowIdForHub(hubId: string) {
  return `nexus:hub:${hubId}`;
}

export default function NexusOrbitalStage(props: NexusOrbitalStageProps) {
  const { onOpenScreen, onAskAgent, audioFrequencies = [] } = props;

  const openHubCyberSettings = useCallback(
    (card: NexusHubCard) => {
      onOpenScreen(card.screenId);
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
    [onOpenScreen]
  );

  const closeHubCyberSettings = useCallback((hubId: string) => {
    useWindowStore.getState().close(windowIdForHub(hubId));
  }, []);

  const handleSendDirective = useCallback(
    (directive: string) => {
      onAskAgent?.(directive);
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
    <HolographicCylinderStage
      frequencies={audioFrequencies}
      onSendDirective={handleSendDirective}
      onSelectSector={handleSelectSector}
      onOpenHub={openHubCyberSettings}
      onCloseHub={(hubId) => closeHubCyberSettings(hubId)}
      className="absolute inset-0"
    />
  );
}
