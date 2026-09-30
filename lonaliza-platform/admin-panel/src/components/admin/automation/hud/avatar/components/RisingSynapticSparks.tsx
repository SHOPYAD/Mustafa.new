"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAvatarStore } from "../store/useAvatarStore";

// =========================================================================
// RISING SYNAPTIC SPARKS & LIVING SENTIENT HEAT AURA
// 3,500 tightly-clustered bioluminescent motes emerging directly from
// the head contour, temples/cheeks, and upper clavicles/shoulders.
// Ascends like intense shimmering heat/steam, proving living readiness.
// =========================================================================

const RISING_SPARKS_VERTEX_SHADER = `
  attribute vec3 aOrigin;
  attribute float aSeed;
  attribute float aPhase;
  attribute float aType; // 0.0 = shoulders, 1.0 = crown/head dome, 2.0 = temples/cheeks

  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float audioEnergy = uVoiceLevel * 0.90 + uUserAudioLevel * 0.55;
    // Fast, organic heat-convection rise speed
    float riseSpeed = 0.45 + aSeed * 0.35 + audioEnergy * 0.40;
    float progress = fract(uTime * riseSpeed + aPhase);

    vec3 pos = aOrigin;

    // Rise height: Intense vertical heat column ascending from the top of the skull into space
    float maxRise = aType > 0.5 ? (14.0 + aSeed * 8.0) : (10.0 + aSeed * 5.0);
    pos.y += progress * maxRise;

    // Convective heat shimmer (strictly upward with subtle tight heat quiver)
    float shimmerFreq = 9.0 + aSeed * 5.0;
    float swayAmp = 0.03 + progress * 0.12;
    pos.x += sin(uTime * shimmerFreq + aSeed * 6.28 + pos.y * 1.6) * swayAmp;
    pos.z += cos(uTime * (shimmerFreq * 0.8) + aSeed * 6.28 + pos.y * 1.3) * (swayAmp * 0.6);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Sharp, crisp particle size near origin, radiant bloom at mid-height, delicate dissipation
    float ptSize = (3.2 + aSeed * 2.2 + audioEnergy * 3.0) * sin(progress * 3.14159);
    gl_PointSize = ptSize * (56.0 / -mvPos.z);

    // Alpha shimmer simulating high-temperature synaptic plasma
    vAlpha = sin(progress * 3.14159) * (0.95 + 0.35 * sin(uTime * 9.0 + aSeed * 22.0));

    // Dual Palette: Intense Cyan/Turquoise Core & Warm Amber/Gold Radiance
    vec3 goldBase = vec3(1.65, 1.20, 0.32);
    vec3 cyanBase = vec3(0.04, 1.25, 1.85);
    vec3 amberHighlight = vec3(1.80, 0.88, 0.18);
    vec3 deepAzure = vec3(0.08, 0.85, 1.95);

    float colorMix = fract(aSeed * 7.73);
    vec3 primaryTone = colorMix > 0.45 
      ? mix(goldBase, amberHighlight, progress) 
      : mix(cyanBase, deepAzure, progress);

    vColor = mix(primaryTone, (colorMix > 0.45 ? cyanBase : goldBase), smoothstep(0.45, 0.9, progress));
  }
`;

const RISING_SPARKS_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;

    float core = smoothstep(0.45, 0.02, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.60;
    float alpha = (core + halo) * vAlpha;

    gl_FragColor = vec4(vColor * 1.45, alpha);
  }
`;

export default function RisingSynapticSparks() {
  const meshRef = useRef<THREE.Points>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: RISING_SPARKS_VERTEX_SHADER,
      fragmentShader: RISING_SPARKS_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uVoiceLevel: { value: 0 },
        uUserAudioLevel: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const geometry = useMemo(() => {
    const totalCount = 3500;
    const origins = new Float32Array(totalCount * 3);
    const seeds = new Float32Array(totalCount);
    const phases = new Float32Array(totalCount);
    const types = new Float32Array(totalCount);

    let idx = 0;

    // 1. Cranial Summit Plume (2,600 particles - 75%):
    // Clustered densely at the very top summit dome of the skull (Y: 14.8 to 16.5, radius: 0.2 to 3.8)
    // Shoots shimmering heat/plasma steam vertically straight up into the atmosphere (maxRise: 16 to 25 units)
    const crownCount = 2600;
    for (let i = 0; i < crownCount; i++) {
      const angle = Math.random() * Math.PI * 2.0;
      // Curvature radius at the cranial apex: follows skull dome
      const r = 0.2 + Math.random() * 3.6;
      const x = Math.cos(angle) * r;
      // Head apex begins at y: 14.8 and crowns up to 16.4
      const y = 14.8 + Math.random() * 1.6;
      const z = Math.sin(angle) * (r * 0.75) + 1.2;

      origins[idx * 3 + 0] = x;
      origins[idx * 3 + 1] = y;
      origins[idx * 3 + 2] = z;

      seeds[idx] = Math.random();
      phases[idx] = Math.random();
      types[idx] = 1.0; // crown/head apex plume
      idx++;
    }

    // 2. Lateral Face Silhouette Contour (900 particles - 25%):
    // Strictly hugging the OUTER lateral perimeter of the face and temples (zero particles across eyes/nose)
    // Streams straight upward along the jaw, cheekbones, and temples directly into the summit plume
    const faceContourCount = 900;
    for (let i = 0; i < faceContourCount; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      // y from jawline (y = 1.0) up to upper temples (y = 13.8)
      const y = 1.0 + Math.random() * 12.8;

      // Exact silhouette edge radius as measured from 3D bust vertices:
      // Jaw (y ~ 1-4): maxX ~ 8.2 to 8.6
      // Cheeks (y ~ 4-8.5): maxX ~ 8.6 to 8.92
      // Temples & forehead (y ~ 8.5-13.8): maxX ~ 8.7 down to 6.8
      let edgeX = 8.5;
      if (y < 7.0) {
        edgeX = 8.1 + (y - 1.0) * 0.12;
      } else {
        edgeX = 8.85 - (y - 7.0) * 0.28;
      }

      // Tightly cling directly to outer boundary (offset by only 0.15 to 0.45 units)
      const x = side * (edgeX + 0.12 + Math.random() * 0.38);
      // Lateral depth of cheekbones / temples
      const z = 1.5 + Math.random() * 2.8;

      origins[idx * 3 + 0] = x;
      origins[idx * 3 + 1] = y;
      origins[idx * 3 + 2] = z;

      seeds[idx] = Math.random();
      phases[idx] = Math.random();
      types[idx] = 0.0; // lateral perimeter contour
      idx++;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(origins, 3));
    geo.setAttribute("aOrigin", new THREE.BufferAttribute(origins, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aType", new THREE.BufferAttribute(types, 1));

    return geo;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const state = useAvatarStore.getState();

    if (material.uniforms) {
      material.uniforms.uTime.value = time;
      material.uniforms.uVoiceLevel.value = state.smoothedVoiceLevel;
      material.uniforms.uUserAudioLevel.value = state.smoothedUserAudioLevel;
    }
  });

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      material={material}
      renderOrder={18}
    />
  );
}
