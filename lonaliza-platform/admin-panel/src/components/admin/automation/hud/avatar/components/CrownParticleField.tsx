"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAvatarStore } from "../store/useAvatarStore";

const CROWN_VERTEX_SHADER = `
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uThinkingIntensity;
  uniform float uVoiceLevel;
  uniform float uAssemblyProgress;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    vec3 pos = position;

    // 1. Thinking State: Stardust motes accelerate upward from the cranial dome into the ether
    if (uThinkingIntensity > 0.02) {
      float pHash = fract(sin(dot(pos.xy, vec2(12.9898, 78.233))) * 43758.5453);
      float lift = fract(uTime * 0.45 + pHash) * 6.5 * uThinkingIntensity;
      pos.y += lift;
      pos.x += sin(uTime * 2.2 + pHash * 6.28) * 0.45 * uThinkingIntensity;
      pos.z += cos(uTime * 2.0 + pHash * 6.28) * 0.45 * uThinkingIntensity;
    }

    // 2. Organic floating aura around cranial dome (subtle ethereal drift)
    float t = uTime * (0.55 + uThinkingIntensity * 0.9);
    pos.y += sin(t * 1.1 + pos.x * 1.2 + pos.z * 0.8) * 0.22;
    pos.x += cos(t * 0.85 + pos.y * 0.9) * 0.15;
    pos.z += sin(t * 0.95 + pos.x * 0.7) * 0.15;

    // 3. Assembly vortex
    if (uAssemblyProgress < 1.0) {
      float pHash = fract(sin(dot(pos.xz, vec2(37.112, 61.439))) * 28461.12);
      float prog = smoothstep(0.35 + pHash * 0.2, 0.95, uAssemblyProgress);
      float spiralAngle = (1.0 - prog) * 16.0 + pHash * 6.28;
      float r = mix(0.5, length(pos.xz), prog) + sin((1.0 - prog) * 3.14159) * 3.0;
      vec3 spiralPos = vec3(cos(spiralAngle) * r, mix(-14.0, pos.y, prog), sin(spiralAngle) * r);
      pos = mix(spiralPos, pos, smoothstep(0.8, 1.0, prog));
    }

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    vAlpha = smoothstep(0.4, 0.9, uAssemblyProgress);
    // Delicate, radiant stardust motes with dynamic breathing and speech pulsation
    float ptSize = (2.2 + uThinkingIntensity * 1.2 + uVoiceLevel * 0.85);
    gl_PointSize = ptSize * (84.0 / -mvPos.z);
  }
`;

const CROWN_FRAGMENT_SHADER = `
  uniform float uThinkingIntensity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;

    vec3 col = vColor * 2.4 + vec3(0.12, 0.65, 1.25);
    // Thinking neural spark illumination
    if (uThinkingIntensity > 0.05) {
      col = mix(col, vec3(1.45, 1.20, 0.40), uThinkingIntensity * 0.70);
    }
    float alpha = smoothstep(0.5, 0.06, d) * vAlpha * 0.95;
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function CrownParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBuffers() {
      try {
        const [posRes, colRes] = await Promise.all([
          fetch("/api/avatar/geometry?file=crown_pos.bin&v=v28"),
          fetch("/api/avatar/geometry?file=crown_col.bin&v=v28"),
        ]);

        if (!posRes.ok || !colRes.ok) return;

        const [posBuf, colBuf] = await Promise.all([
          posRes.arrayBuffer(),
          colRes.arrayBuffer(),
        ]);

        if (!isMounted) return;

        const positions = new Float32Array(posBuf);
        const colors = new Float32Array(colBuf);

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

        setGeometry(geo);
      } catch (err) {
        console.error("Error loading crown geometry:", err);
      }
    }

    loadBuffers();

    return () => {
      isMounted = false;
    };
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: CROWN_VERTEX_SHADER,
      fragmentShader: CROWN_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uThinkingIntensity: { value: 0 },
        uVoiceLevel: { value: 0 },
        uAssemblyProgress: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const state = useAvatarStore.getState();

    if (material.uniforms) {
      material.uniforms.uTime.value = time;
      material.uniforms.uThinkingIntensity.value = state.thinkingIntensity;
      material.uniforms.uVoiceLevel.value = state.smoothedVoiceLevel;
      material.uniforms.uAssemblyProgress.value = state.assemblyProgress;
    }
  });

  if (!geometry) return null;

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, 0]}
    />
  );
}
