"use client";

import React from "react";
import UnifiedCyberneticStudio from "./studio/UnifiedCyberneticStudio";
import type { SwarmAgentInfo } from "@/lib/automation/agent-collab-store";

export type CockpitMode = "presence" | "brain" | "ops" | "loops" | "nexus";

export interface SciFiAgentHudStudioProps {
  onExit?: () => void;
  apiEndpoint?: string;
  initialAgents?: SwarmAgentInfo[];
  initialScreenId?: string;
  initialCockpitMode?: CockpitMode | "screens";
}

export default function SciFiAgentHudStudio({
  onExit,
  initialScreenId = "20",
}: SciFiAgentHudStudioProps) {
  return (
    <UnifiedCyberneticStudio
      initialScreenId={initialScreenId || "20"}
      onExit={onExit}
    />
  );
}
