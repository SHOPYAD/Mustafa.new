"use client";

import React from "react";
import HumanoidMasterAvatar from "../avatar/HumanoidMasterAvatar";
import ParticleDrift from "@/components/ui/particle-drift";
import { AgentRing } from "./AgentRing";

interface HumanoidPresenceMasterViewProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  onSelectNode?: (nodeId: string) => void;
  voiceLevel?: number;
  frequencies?: number[];
}

export default function HumanoidPresenceMasterView({
  isSpeaking = false,
  isListening = false,
  frequencies = [],
}: HumanoidPresenceMasterViewProps) {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#000407]">
      {/* 0. INTERACTIVE MENG TO PARTICLE DRIFT CANVAS BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <ParticleDrift
          mode="dark"
          density={1.2}
          speed={0.9}
          length={1.1}
          opacity={0.85}
          className="w-full h-full"
        />
      </div>

      {/* 1. THE 3D HOLOGRAPHIC HUMANOID AVATAR & PANORAMIC NEURAL MOUNTAINS */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <HumanoidMasterAvatar
          hideDebugOverlay={true}
          slowCamera={true}
          isAgentSpeaking={isSpeaking}
          isUserSpeaking={isListening}
          frequencies={frequencies}
          className="w-full h-full pointer-events-none"
        />
      </div>

      {/* 2. NEURAL PRESENCE CHANNELS & FIBER PATHWAYS */}
      <AgentRing />
      <div className="sr-only" aria-hidden="true">
        <span>فهم الصوت</span>
        <span>التفاعل الطبيعي</span>
        <span>إنتاج الصوت</span>
        <span>الوجود البشري</span>
        <span>أنا هنا للمساعدة</span>
      </div>
    </div>
  );
}
