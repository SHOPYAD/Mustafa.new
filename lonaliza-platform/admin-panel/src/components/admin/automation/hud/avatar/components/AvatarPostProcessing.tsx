"use client";

import React from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

export default function AvatarPostProcessing() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      {/* Precision Controlled Luminous Bloom: 
          Subtle, elegant halo without spreading into the pitch-black cosmic void */}
      <Bloom
        luminanceThreshold={0.85}
        luminanceSmoothing={0.10}
        intensity={0.35}
      />
    </EffectComposer>
  );
}
