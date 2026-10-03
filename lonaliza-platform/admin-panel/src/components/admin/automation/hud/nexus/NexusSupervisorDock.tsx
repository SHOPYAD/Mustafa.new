"use client";

import React from "react";
import { SupervisorDisc } from "@/components/admin/automation/hud/studio/StageFrame";
import { STUDIO_Z } from "@/lib/studio/tokens";

type Props = {
  isListening: boolean;
  isAgentSpeaking: boolean;
  audioFrequencies: number[];
  onOpen: () => void;
};

/** قرص الوكيل المشرف فوق الدock الثابت، يتفاعل مع الترددات. */
export function NexusSupervisorDock({ isListening, isAgentSpeaking, audioFrequencies, onOpen }: Props) {
  return (
    <div className="pointer-events-none fixed left-1/2" style={{ bottom: 92, zIndex: STUDIO_Z.tray, transform: "translateX(-50%)" }}>
      <div className="relative h-[120px] w-[160px]">
        <SupervisorDisc
          k={0.55}
          cx={80}
          cy={52}
          size={96}
          labelTop={100}
          labelFont={12}
          variant="wave"
          labelPill={false}
          isListening={isListening}
          isAgentSpeaking={isAgentSpeaking}
          audioFrequencies={audioFrequencies}
          onOpen={onOpen}
        />
      </div>
    </div>
  );
}
