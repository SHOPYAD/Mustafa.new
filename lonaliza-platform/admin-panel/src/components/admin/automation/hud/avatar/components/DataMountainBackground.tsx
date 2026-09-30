"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAvatarStore } from "../store/useAvatarStore";

// =========================================================================
// 1. ORGANIC NEURAL SPIDERWEB & SYNAPTIC AXONS (LINE SEGMENTS)
// Natural axonal arborization, spiderweb curves, multi-color nerve filaments
// =========================================================================
const NEURAL_WEB_VERTEX_SHADER = `
  attribute vec3 aColor;
  attribute float aVeinType; // 0.0 = cyan, 1.0 = gold, 2.0 = violet, 3.0 = amber

  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;

  varying vec3 vColor;
  varying float vVeinType;
  varying vec3 vWorldPos;
  varying float vDist;

  void main() {
    vColor = aColor;
    vVeinType = aVeinType;

    vec3 pos = position;

    float audioEnergy = uVoiceLevel * 0.90 + uUserAudioLevel * 0.50;

    // Organic neural wave undulation along axonal pathways
    float waveX = sin(pos.x * 0.035 + uTime * 1.5 + pos.y * 0.05) * (0.6 + audioEnergy * 1.2);
    float waveY = cos(pos.y * 0.045 - uTime * 1.3 + pos.x * 0.03) * (0.4 + audioEnergy * 0.8);
    pos.z += waveX;
    pos.y += waveY;

    // Golden & amber pulse surges along major axonal highways
    if (aVeinType > 0.5) {
      pos.z += sin(pos.x * 0.06 - uTime * 3.5 + pos.y * 0.08) * (0.7 + audioEnergy * 1.4);
    }

    vec4 worldPos4 = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos4.xyz;
    vec4 mvPos = viewMatrix * worldPos4;
    gl_Position = projectionMatrix * mvPos;
    vDist = -mvPos.z;
  }
`;

const NEURAL_WEB_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;

  varying vec3 vColor;
  varying float vVeinType;
  varying vec3 vWorldPos;
  varying float vDist;

  void main() {
    // Gentle exclusion zone immediately behind avatar face for maximum front contrast
    float headDistX = abs(vWorldPos.x) / 12.0;
    float headDistY = (vWorldPos.y - 6.5) / 9.5;
    float headMask = headDistX * headDistX + headDistY * headDistY;
    if (headMask < 0.85) {
      discard;
    }

    vec3 col = vColor;
    float audioEnergy = uVoiceLevel * 0.85 + uUserAudioLevel * 0.40;

    // Traveling action potential pulses across neural network
    if (vVeinType > 0.5 && vVeinType < 1.5) {
      // Golden Nerve Conduits
      float pulse = 0.95 + 0.45 * sin(uTime * 4.2 + vWorldPos.x * 0.06 - vWorldPos.y * 0.08);
      vec3 goldVein = vec3(1.50, 1.12, 0.28);
      col = goldVein * pulse * (1.1 + audioEnergy * 0.8);
    } else if (vVeinType > 2.5) {
      // Amber Living Veins
      float pulse = 0.90 + 0.50 * sin(uTime * 5.0 - vWorldPos.x * 0.08 + vWorldPos.y * 0.06);
      vec3 amberVein = vec3(1.45, 0.65, 0.12);
      col = amberVein * pulse * (1.15 + audioEnergy * 0.9);
    } else if (vVeinType > 1.5 && vVeinType < 2.5) {
      // Violet Synaptic Bridges
      float pulse = 0.90 + 0.40 * cos(uTime * 3.8 + vWorldPos.y * 0.10);
      vec3 violetVein = vec3(0.65, 0.30, 1.55);
      col = violetVein * pulse * (1.05 + audioEnergy * 0.7);
    } else {
      // Electric Cyan Axon Filaments
      vec3 cyanLaser = vec3(0.05, 1.05, 1.55);
      col = cyanLaser * (0.90 + audioEnergy * 0.70);
    }

    // Organic peripheral fade
    float distFade = smoothstep(120.0, 40.0, vDist);
    float alpha = 0.68 * distFade;

    if (headMask < 1.3) {
      alpha *= smoothstep(0.85, 1.3, headMask);
    }

    gl_FragColor = vec4(col, alpha);
  }
`;

// =========================================================================
// 2. FULL-FIELD COSMIC SYNAPTIC PARTICLES (FILLS ENTIRE BACKGROUND VOID)
// Continuous deep universe of crisp synaptic stars and breathing nodes
// =========================================================================
const COSMIC_POINTS_VERTEX_SHADER = `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aTwinkleSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    vec3 pos = position;

    float audioEnergy = uVoiceLevel * 0.85 + uUserAudioLevel * 0.45;

    // Organic slow cosmic drift
    float t = uTime * aTwinkleSpeed + aPhase;
    pos.y += sin(t * 0.8 + pos.x * 0.02) * 0.4;
    pos.x += cos(t * 0.6 + pos.y * 0.02) * 0.3;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Twinkling harmonic breathing
    float twinkle = 0.7 + 0.3 * sin(t * 2.5);
    float ptSize = (aSize + audioEnergy * 1.8) * twinkle;
    gl_PointSize = ptSize * (58.0 / -mvPos.z);

    vAlpha = twinkle * smoothstep(140.0, 30.0, -mvPos.z);
  }
`;

const COSMIC_POINTS_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;

    float core = smoothstep(0.48, 0.06, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.45;
    float alpha = (core + halo) * vAlpha * 0.85;

    gl_FragColor = vec4(vColor * 1.25, alpha);
  }
`;

export default function DataMountainBackground() {
  const linesMeshRef = useRef<THREE.LineSegments>(null);
  const pointsMeshRef = useRef<THREE.Points>(null);

  // Materials
  const linesMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: NEURAL_WEB_VERTEX_SHADER,
      fragmentShader: NEURAL_WEB_FRAGMENT_SHADER,
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

  const pointsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: COSMIC_POINTS_VERTEX_SHADER,
      fragmentShader: COSMIC_POINTS_FRAGMENT_SHADER,
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

  // 1. Generate Organic Neural Spiderweb Filaments (LineSegments)
  const webLinesGeo = useMemo(() => {
    const segments: { p1: [number, number, number]; p2: [number, number, number]; type: number }[] = [];

    // Hubs around spine and chest:
    const hubs: [number, number, number][] = [
      [0, -14, -22],
      [-18, -10, -24],
      [18, -10, -24],
      [-38, -6, -28],
      [38, -6, -28],
      [0, -26, -20],
      [-55, -16, -32],
      [55, -16, -32],
    ];

    // Radial Axons radiating outward in organic arcs (like a spiderweb / neural arborization)
    const numAxonsPerHub = 18;
    hubs.forEach((hub, hIdx) => {
      for (let a = 0; a < numAxonsPerHub; a++) {
        const baseAngle = (a / numAxonsPerHub) * Math.PI * 2.0;
        let curr: [number, number, number] = [hub[0], hub[1], hub[2]];
        const steps = 14 + Math.floor(Math.random() * 8);

        // Vein type based on angle and hub
        let type = 0.0; // cyan
        if (a % 5 === 0) type = 1.0; // gold
        else if (a % 4 === 0) type = 2.0; // violet
        else if (a % 3 === 0) type = 3.0; // amber

        for (let s = 0; s < steps; s++) {
          const stepDist = 4.5 + Math.random() * 3.5;
          const curveAngle = baseAngle + Math.sin(s * 0.45 + hIdx) * 0.35;
          const nextX = curr[0] + Math.cos(curveAngle) * stepDist;
          const nextY = curr[1] + Math.sin(curveAngle) * stepDist * 0.75 + (Math.random() - 0.5) * 1.5;
          const nextZ = curr[2] - Math.random() * 2.0;

          // Natural organic boundaries (no straight cutoff)
          if (Math.abs(nextX) > 240.0 || nextY < -55.0 || nextY > 38.0) break;

          segments.push({
            p1: [curr[0], curr[1], curr[2]],
            p2: [nextX, nextY, nextZ],
            type,
          });

          curr = [nextX, nextY, nextZ];
        }
      }
    });

    // Concentric Web Cross-Connections (Spiderweb loops connecting neighboring radial filaments)
    const concentricRings = 12;
    for (let ring = 1; ring <= concentricRings; ring++) {
      const radiusX = ring * 14.0 + 8.0;
      const radiusY = ring * 9.5 + 6.0;
      const ringSteps = 36;
      let prevPt: [number, number, number] | null = null;
      let firstPt: [number, number, number] | null = null;

      for (let st = 0; st <= ringSteps; st++) {
        const theta = (st / ringSteps) * Math.PI * 2.0;
        // Organic sinusoidal deformation of web ring
        const rDeform = 1.0 + Math.sin(theta * 6.0 + ring) * 0.12 + Math.cos(theta * 3.0) * 0.08;
        const x = Math.cos(theta) * radiusX * rDeform;
        const y = -12.0 + Math.sin(theta) * radiusY * rDeform;
        const z = -22.0 - ring * 1.5 + (Math.random() - 0.5) * 1.5;

        // Skip behind head center
        const inHead = Math.abs(x) < 14.0 && y > -2.0 && y < 16.0;
        if (!inHead && prevPt) {
          const type = ring % 3 === 0 ? 1.0 : ring % 4 === 0 ? 2.0 : 0.0;
          segments.push({
            p1: prevPt,
            p2: [x, y, z],
            type,
          });
        }

        if (!inHead) {
          prevPt = [x, y, z];
          if (!firstPt) firstPt = [x, y, z];
        } else {
          prevPt = null;
        }
      }
    }

    const totalSegs = segments.length;
    const positions = new Float32Array(totalSegs * 2 * 3);
    const colors = new Float32Array(totalSegs * 2 * 3);
    const veinTypes = new Float32Array(totalSegs * 2);

    segments.forEach((seg, i) => {
      // P1
      positions[i * 6 + 0] = seg.p1[0];
      positions[i * 6 + 1] = seg.p1[1];
      positions[i * 6 + 2] = seg.p1[2];
      // P2
      positions[i * 6 + 3] = seg.p2[0];
      positions[i * 6 + 4] = seg.p2[1];
      positions[i * 6 + 5] = seg.p2[2];

      let r = 0.05, g = 0.90, b = 1.35; // Cyan
      if (seg.type === 1.0) {
        // Gold
        r = 1.45; g = 1.05; b = 0.25;
      } else if (seg.type === 2.0) {
        // Violet
        r = 0.65; g = 0.30; b = 1.45;
      } else if (seg.type === 3.0) {
        // Amber
        r = 1.40; g = 0.60; b = 0.15;
      }

      colors[i * 6 + 0] = r;
      colors[i * 6 + 1] = g;
      colors[i * 6 + 2] = b;
      colors[i * 6 + 3] = r;
      colors[i * 6 + 4] = g;
      colors[i * 6 + 5] = b;

      veinTypes[i * 2 + 0] = seg.type;
      veinTypes[i * 2 + 1] = seg.type;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aVeinType", new THREE.BufferAttribute(veinTypes, 1));
    return geo;
  }, []);

  // 2. Generate Full-Field Cosmic Synaptic Constellation Particles
  const cosmicGeo = useMemo(() => {
    const count = 30000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkleSpeeds = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Fill the entire background volume
      const x = (Math.random() - 0.5) * 520.0;
      const y = (Math.random() - 0.5) * 160.0;
      const z = -28.0 - Math.random() * 80.0;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation across stars
      const colorRoll = Math.random();
      if (colorRoll < 0.45) {
        // Electric Cyan
        colors[i * 3 + 0] = 0.08;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1.45;
      } else if (colorRoll < 0.70) {
        // Golden Ember
        colors[i * 3 + 0] = 1.45;
        colors[i * 3 + 1] = 1.05;
        colors[i * 3 + 2] = 0.28;
      } else if (colorRoll < 0.85) {
        // Stellar White
        colors[i * 3 + 0] = 1.20;
        colors[i * 3 + 1] = 1.25;
        colors[i * 3 + 2] = 1.35;
      } else {
        // Violet Nebula Spark
        colors[i * 3 + 0] = 0.70;
        colors[i * 3 + 1] = 0.35;
        colors[i * 3 + 2] = 1.40;
      }

      sizes[i] = 1.8 + Math.random() * 2.8;
      twinkleSpeeds[i] = 0.8 + Math.random() * 1.6;
      phases[i] = Math.random() * Math.PI * 2.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aTwinkleSpeed", new THREE.BufferAttribute(twinkleSpeeds, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const state = useAvatarStore.getState();

    if (linesMaterial.uniforms) {
      linesMaterial.uniforms.uTime.value = time;
      linesMaterial.uniforms.uVoiceLevel.value = state.smoothedVoiceLevel;
      linesMaterial.uniforms.uUserAudioLevel.value = state.smoothedUserAudioLevel;
    }

    if (pointsMaterial.uniforms) {
      pointsMaterial.uniforms.uTime.value = time;
      pointsMaterial.uniforms.uVoiceLevel.value = state.smoothedVoiceLevel;
      pointsMaterial.uniforms.uUserAudioLevel.value = state.smoothedUserAudioLevel;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Full-Field Deep Cosmic Synaptic Constellation Particles */}
      <points
        ref={pointsMeshRef}
        geometry={cosmicGeo}
        material={pointsMaterial}
        renderOrder={1}
      />

      {/* 2. Organic Neural Spiderweb Axon Filaments (Curved & Multi-Colored) */}
      <lineSegments
        ref={linesMeshRef}
        geometry={webLinesGeo}
        material={linesMaterial}
        renderOrder={2}
      />
    </group>
  );
}
