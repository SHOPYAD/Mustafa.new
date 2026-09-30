"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAvatarStore } from "../store/useAvatarStore";

const ORB_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ORB_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uAssemblyProgress;
  uniform float uVoiceLevel;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - vec2(0.5)) * 2.0;
    float r = length(p);
    if (r > 1.0) discard;

    // Intense Gaussian radiant glow
    float glow = exp(-r * r * 3.5);

    // Dynamic energy pulse
    float pulse = 1.0 + 0.35 * sin(uTime * 10.0) + uVoiceLevel * 0.45;

    // Multi-tier color: white-hot center -> electric cyan -> deep cobalt blue
    vec3 colCore = vec3(1.6, 1.9, 2.2);
    vec3 colMid  = vec3(0.0, 0.95, 1.45);
    vec3 colEdge = vec3(0.02, 0.25, 0.85);

    vec3 col = mix(colEdge, colMid, smoothstep(0.0, 0.45, glow));
    col = mix(col, colCore, smoothstep(0.45, 1.0, glow));

    // Assembly visibility: intense during birth vortex, dissolves completely once assembled so point-cloud heart shines
    float activeFactor = 1.0 - smoothstep(0.85, 1.0, uAssemblyProgress);
    float alpha = glow * pulse * activeFactor;

    gl_FragColor = vec4(col, alpha);
  }
`;

const RINGS_VERTEX_SHADER = `
  attribute vec3 aOffset;
  attribute float aPhase;
  uniform float uTime;
  uniform float uAssemblyProgress;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float t = uTime * 2.2 + aPhase;
    float progress = fract(t);

    // Expanding concentric ripple rings from quantum birth orb
    vec3 pos = position;
    float currentRadius = 0.5 + progress * 6.5;
    pos.x *= currentRadius;
    pos.z *= currentRadius;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float activeFactor = 1.0 - smoothstep(0.85, 1.0, uAssemblyProgress);
    vAlpha = (1.0 - progress) * smoothstep(0.0, 0.2, progress) * (0.25 + 0.75 * activeFactor);
    vColor = mix(vec3(0.0, 0.95, 1.4), vec3(0.2, 0.6, 1.2), progress);

    gl_PointSize = (2.4 * (1.0 - progress * 0.5)) * (80.0 / -mvPos.z);
  }
`;

const RINGS_FRAGMENT_SHADER = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float pAlpha = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor * 1.6, pAlpha * vAlpha);
  }
`;

export default function QuantumBirthOrb() {
  const orbRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Points>(null);

  const orbMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: ORB_VERTEX_SHADER,
      fragmentShader: ORB_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uAssemblyProgress: { value: 0.0 },
        uVoiceLevel: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  const ringsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: RINGS_VERTEX_SHADER,
      fragmentShader: RINGS_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uAssemblyProgress: { value: 0.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Geometry for concentric ripple ring points
  const ringsGeometry = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 * 6; // 6 nested ripples
      positions[i * 3] = Math.cos(angle);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 2] = Math.sin(angle);
      phases[i] = (i % 6) / 6.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const state = useAvatarStore.getState();
    const prog = state.assemblyProgress;
    const voice = state.smoothedVoiceLevel;

    if (orbMaterial.uniforms) {
      orbMaterial.uniforms.uTime.value = time;
      orbMaterial.uniforms.uAssemblyProgress.value = prog;
      orbMaterial.uniforms.uVoiceLevel.value = voice;
    }

    if (ringsMaterial.uniforms) {
      ringsMaterial.uniforms.uTime.value = time;
      ringsMaterial.uniforms.uAssemblyProgress.value = prog;
    }

    if (orbRef.current) {
      // Dynamic pulsing scale: expands during birth vortex, contracts to subtle anchor
      const birthScale = prog < 1.0 ? 1.4 + Math.sin(time * 8.0) * 0.35 : 0.45;
      orbRef.current.scale.setScalar(birthScale);
    }
  });

  return (
    <group position={[0, -9.5, 2.5]}>
      {/* 1. Central Luminous Quantum Core Orb */}
      <mesh ref={orbRef} material={orbMaterial}>
        <planeGeometry args={[7.5, 7.5]} />
      </mesh>

      {/* 2. Concentric Expanding Ripple Rings */}
      <points ref={ringsRef} geometry={ringsGeometry} material={ringsMaterial} />
    </group>
  );
}
