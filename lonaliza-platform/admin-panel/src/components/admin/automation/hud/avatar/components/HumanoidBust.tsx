"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAvatarStore, AvatarStateName } from "../store/useAvatarStore";

const BUST_VERTEX_SHADER = `
  attribute vec3 aColor;
  attribute float aEdge;
  attribute float aAmber;
  attribute float aVein;
  attribute float aHeart;

  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;
  uniform float uThinkingIntensity;
  uniform float uAssemblyProgress;
  uniform int uState;

  varying vec3 vColor;
  varying float vEdge;
  varying float vAmber;
  varying float vVein;
  varying float vHeart;
  varying vec3 vWorldPos;

  void main() {
    vColor = aColor;
    vEdge = aEdge;
    vAmber = aAmber;
    vVein = aVein;
    vHeart = aHeart;

    vec3 pos = position;

    // 1. Startup Swirling Vortex Assembly from Quantum Birth Orb (0, -14, 0)
    if (uAssemblyProgress < 1.0) {
      float heightFactor = clamp((position.y + 16.0) / 30.0, 0.0, 1.0);
      float pHash = fract(sin(dot(position.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      float startWindow = heightFactor * 0.40 + pHash * 0.15;
      float prog = smoothstep(startWindow, min(1.0, startWindow + 0.45), uAssemblyProgress);

      if (prog < 1.0) {
        // Spiral vortex rising upwards into the bust structure
        float spiralAngle = (1.0 - prog) * 14.0 + position.y * 0.4 + pHash * 6.28;
        float midArch = sin(prog * 3.14159) * 4.0;
        float curRadius = mix(0.5 + pHash * 1.5, length(position.xz), prog) + midArch;
        vec3 spiralPos = vec3(
          cos(spiralAngle) * curRadius,
          mix(-9.5, position.y, prog),
          sin(spiralAngle) * curRadius
        );
        pos = mix(spiralPos, position, smoothstep(0.85, 1.0, prog));
      }
    }

    // 2. Horizontal waveform ripple through the face scanlines during speech
    if (aAmber > 0.05) {
      float wave = sin(pos.x * 1.8 - uTime * (8.5 + uVoiceLevel * 14.0));
      float audioPulse = wave * (uVoiceLevel * 1.45 + uUserAudioLevel * 0.65) * aAmber;
      pos.z += audioPulse * 1.15;
    }

    // 3. Subtle neural scan motion during thinking
    if (uState == 2 && aAmber > 0.05) {
      float thinkScan = sin(pos.y * 1.8 - uTime * 4.5) * uThinkingIntensity * 0.35;
      pos.z += thinkScan;
    }

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Perfectly calibrated point sizes: continuous concentric curves, laser rim, and bold golden veins
    float ptSize = 2.45 + aEdge * 0.70 + aAmber * 0.25 + aVein * 0.85 + aHeart * 1.10;
    gl_PointSize = ptSize * (54.0 / -mvPos.z);
  }
`;

const BUST_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;

  varying vec3 vColor;
  varying float vEdge;
  varying float vAmber;
  varying float vVein;
  varying float vHeart;
  varying vec3 vWorldPos;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float pointAlpha = smoothstep(0.5, 0.08, d);

    vec3 col = vColor;

    // Saturated electric cyan laser tone matching reference image (#00E5FF)
    vec3 cyanLaser = vec3(0.0, 0.95, 1.30);
    col = mix(col, cyanLaser * length(col), 0.65 * (1.0 - vAmber));

    // Boost concentric shoulder & chest curves so they are bold, continuous, vivid, and distinct
    if (vAmber < 0.05 && vVein < 0.1 && vHeart < 0.1) {
      col = max(col, vec3(0.0, 0.95, 1.40) * length(vColor) * 1.65);
    }

    // 1. Tangent Silhouette Rim Glow: BLAZING ELECTRIC CYAN LASER RIM
    float rimFactor = pow(vEdge, 2.0) * (1.0 - vAmber * 0.85);
    col += vec3(0.0, 0.90, 1.40) * rimFactor * 1.45;

    // 2. Amber Core Harmonization: RADIANT INCANDESCENT FIERY AMBER-ORANGE FLAME
    if (vAmber > 0.01) {
      float ripple = 1.0 + sin(vWorldPos.y * 3.8 - uTime * (6.5 + uVoiceLevel * 12.0)) * 0.18;
      float audioPulse = (uVoiceLevel * 1.35 + uUserAudioLevel * 0.50);
      float boost = (ripple + audioPulse);

      vec3 amberOuter = vec3(1.25, 0.28, 0.01); // Fiery deep orange
      vec3 amberInner = vec3(1.30, 0.82, 0.15); // Radiant warm incandescent honey gold
      vec3 amberFlame = mix(amberOuter, amberInner, pow(vAmber, 1.12));

      col = mix(col, amberFlame, min(1.0, vAmber * 1.45));
      col += amberFlame * 0.85 * boost * vAmber;
    }

    // 3. Glowing Radiant Heart in Chest (Sternum Core Node)
    if (vHeart > 0.03) {
      float hp = 1.0 + sin(uTime * 3.8) * 0.30;
      col += vec3(0.25, 0.90, 1.35) * vHeart * hp * 1.5;
      if (vHeart > 0.35) {
        col += vec3(0.75, 0.95, 1.15) * (vHeart - 0.35) * 2.0;
      }
    }

    // 4. Electrical Pulses Traveling Up the Golden Neural Veins (Heart to Throat to Chin)
    if (vVein > 0.3) {
      float pulse = exp(-pow(fract((vWorldPos.y + 16.0) * 0.075 - uTime * 0.85) * 5.0 - 1.2, 2.0));
      col = mix(col, vec3(1.20, 0.85, 0.15), vVein * 0.95);
      col += vec3(1.35, 1.15, 0.45) * pulse * 1.25;
    }

    // 5. Complete Humanoid Bust Torso & Ribs down to bottom dock (100% full opacity to y = -21.15)
    float bottomFade = smoothstep(-23.0, -21.2, vWorldPos.y);
    float finalAlpha = pointAlpha * bottomFade;

    gl_FragColor = vec4(col, finalAlpha * 0.98);
  }
`;

export default function HumanoidBust() {
  const meshRef = useRef<THREE.Points>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBuffers() {
      try {
        const [posRes, colRes, attrRes] = await Promise.all([
          fetch("/api/avatar/geometry?file=bust_pos.bin&v=v28"),
          fetch("/api/avatar/geometry?file=bust_col.bin&v=v28"),
          fetch("/api/avatar/geometry?file=bust_attrs.bin&v=v28"),
        ]);

        if (!posRes.ok || !colRes.ok || !attrRes.ok) {
          console.error("Failed to fetch avatar binary buffers");
          return;
        }

        const [posBuf, colBuf, attrBuf] = await Promise.all([
          posRes.arrayBuffer(),
          colRes.arrayBuffer(),
          attrRes.arrayBuffer(),
        ]);

        if (!isMounted) return;

        const positions = new Float32Array(posBuf);
        const colors = new Float32Array(colBuf);
        const rawAttrs = new Float32Array(attrBuf);

        const pointCount = positions.length / 3;
        const edges = new Float32Array(pointCount);
        const ambers = new Float32Array(pointCount);
        const veins = new Float32Array(pointCount);
        const hearts = new Float32Array(pointCount);

        for (let i = 0; i < pointCount; i++) {
          edges[i] = rawAttrs[i * 4];
          ambers[i] = rawAttrs[i * 4 + 1];
          veins[i] = rawAttrs[i * 4 + 2];
          hearts[i] = rawAttrs[i * 4 + 3];
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
        geo.setAttribute("aEdge", new THREE.BufferAttribute(edges, 1));
        geo.setAttribute("aAmber", new THREE.BufferAttribute(ambers, 1));
        geo.setAttribute("aVein", new THREE.BufferAttribute(veins, 1));
        geo.setAttribute("aHeart", new THREE.BufferAttribute(hearts, 1));

        setGeometry(geo);
        useAvatarStore.getState().setAssemblyProgress(1.0);
      } catch (err) {
        console.error("Error loading avatar geometry:", err);
      }
    }

    loadBuffers();

    return () => {
      isMounted = false;
    };
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: BUST_VERTEX_SHADER,
      fragmentShader: BUST_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uVoiceLevel: { value: 0 },
        uUserAudioLevel: { value: 0 },
        uThinkingIntensity: { value: 0 },
        uAssemblyProgress: { value: 1.0 },
        uState: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const state = useAvatarStore.getState();

    const stateMap: Record<AvatarStateName, number> = {
      idle: 0,
      listening: 1,
      thinking: 2,
      speaking: 3,
      confident: 4,
      uncertain: 5,
      error: 6,
    };
    const stateInt = stateMap[state.currentState] ?? 0;

    if (material.uniforms) {
      material.uniforms.uTime.value = time;
      material.uniforms.uVoiceLevel.value = state.smoothedVoiceLevel;
      material.uniforms.uUserAudioLevel.value = state.smoothedUserAudioLevel;
      material.uniforms.uThinkingIntensity.value = state.thinkingIntensity;
      material.uniforms.uAssemblyProgress.value = state.assemblyProgress;
      material.uniforms.uState.value = stateInt;
    }
  });

  if (!geometry) return null;

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, 0]}
      renderOrder={15}
    />
  );
}
