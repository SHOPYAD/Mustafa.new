"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAvatarStore } from "../store/useAvatarStore";

const AMBER_CORE_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AMBER_CORE_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;
  uniform float uThinkingIntensity;
  uniform float uAssemblyProgress;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    // Center at (0.5, 0.5)
    vec2 p = (vUv - vec2(0.5)) * 2.0;

    // Strict elliptical contours matching facial mouth/jaw area
    float r = length(vec2(p.x * 1.02, p.y * 1.14));
    if (r > 0.94) discard;

    // Expansive, volumetric glowing core that generously fills the face:
    // Rich, solid, glowing density in the center that drops cleanly to zero before face boundary
    float coreDense = max(0.0, 1.0 - (r / 0.90));
    float glow = pow(coreDense, 1.25);
    float hotspot = exp(-r * r * 2.85); // Much broader, voluminous incandescent heart
    float density = glow * 0.90 + hotspot * 0.95;

    // Living wave ripples undulating through the fiery orb
    float waveSpeed = 5.5 + uVoiceLevel * 8.0;
    float waves = 1.0 + 0.18 * sin(p.y * 14.0 - uTime * waveSpeed);

    // Dynamic concentric harmonic ring ripples pulsing gently with voice
    float radialWaves = sin(r * 22.0 - uTime * (6.0 + uVoiceLevel * 10.0)) * (0.12 + uVoiceLevel * 0.22);
    waves += radialWaves;

    // Balanced audio reactivity
    float audioBoost = 1.0 + (uVoiceLevel * 0.75 + uUserAudioLevel * 0.35) * 0.45;

    // Deep rich saturated colors with true depth:
    // Fiery deep orange base -> rich saturated warm amber -> brilliant incandescent honey gold core
    vec3 colOuter = vec3(1.45, 0.36, 0.02); // Fiery warm orange-red
    vec3 colMid   = vec3(1.68, 0.82, 0.08); // Radiant saturated amber
    vec3 colCore  = vec3(1.95, 1.35, 0.35); // Intense incandescent honey gold

    vec3 col = mix(colOuter, colMid, smoothstep(0.0, 0.45, coreDense));
    col = mix(col, colCore, smoothstep(0.45, 0.92, coreDense));

    // Thinking state: amber core pulses rhythmically in contemplative cadence
    if (uThinkingIntensity > 0.05) {
      float thinkPulse = 1.0 + sin(uTime * 3.5) * 0.18 * uThinkingIntensity;
      col *= thinkPulse;
    }

    // Assembly fade-in factor
    float assemblyFade = smoothstep(0.60, 1.0, uAssemblyProgress);

    // Rich opacity: gives deep solid presence inside the mouth and scanlines
    float alpha = density * waves * audioBoost * 1.15 * assemblyFade;

    gl_FragColor = vec4(col, alpha);
  }
`;

export default function AmberVolumetricCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: AMBER_CORE_VERTEX_SHADER,
      fragmentShader: AMBER_CORE_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uVoiceLevel: { value: 0 },
        uUserAudioLevel: { value: 0 },
        uThinkingIntensity: { value: 0 },
        uAssemblyProgress: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const state = useAvatarStore.getState();

    const voice = state.smoothedVoiceLevel;
    const assemblyProg = state.assemblyProgress;

    // Controlled dynamic scale expansion: contained safely inside the face
    const dynamicScale = (1.0 + voice * 0.10 + Math.sin(time * 8.0) * voice * 0.03) * Math.min(1.0, assemblyProg * 1.2);
    if (meshRef.current) {
      meshRef.current.scale.set(dynamicScale, dynamicScale, 1.0);
    }

    if (material.uniforms) {
      material.uniforms.uTime.value = time;
      material.uniforms.uVoiceLevel.value = voice;
      material.uniforms.uUserAudioLevel.value = state.smoothedUserAudioLevel;
      material.uniforms.uThinkingIntensity.value = state.thinkingIntensity;
      material.uniforms.uAssemblyProgress.value = assemblyProg;
    }
  });

  return (
    <mesh
      ref={meshRef}
      // Positioned strictly inside the lower face (mouth, jaw, nose)
      position={[-0.58, 2.1, 4.0]}
      material={material}
      renderOrder={12}
    >
      <planeGeometry args={[15.6, 11.8, 1, 1]} />
    </mesh>
  );
}
