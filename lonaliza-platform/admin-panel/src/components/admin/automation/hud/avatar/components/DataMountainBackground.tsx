"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAvatarStore } from "../store/useAvatarStore";

const BACKDROP_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // 1. Subtle 3D cylindrical wrap around the viewer for true panoramic depth
    pos.z -= pow(pos.x * 0.008, 2.0) * 14.0;

    // 2. Organic undulating terrain wave across the landscape, surging smoothly with speech
    float audioEnergy = uVoiceLevel * 0.68 + uUserAudioLevel * 0.32;
    pos.z += sin(pos.x * 0.07 + uTime * 2.2) * (0.35 + audioEnergy * 1.1);
    pos.y += cos(pos.x * 0.05 - uTime * 1.6) * (0.18 + audioEnergy * 0.5);

    // 3. Audio acoustic shockwave ripple radiating outward from avatar
    float dist = length(pos.xy);
    pos.z += sin(dist * 0.40 - uTime * 5.0) * audioEnergy * 0.65;

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const BACKDROP_FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform sampler2D uLightningMask;
  uniform float uTime;
  uniform float uVoiceLevel;
  uniform float uUserAudioLevel;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vec2 uv = vUv;

    // Subtle micro ripple across the terrain during speech
    float audioEnergy = uVoiceLevel * 0.65 + uUserAudioLevel * 0.35;
    uv.y += sin(uv.x * 32.0 + uTime * 3.0) * audioEnergy * 0.0022;

    vec4 baseCol = texture2D(uTexture, uv);
    float lightning = texture2D(uLightningMask, uv).r;

    vec3 col = baseCol.rgb;

    // 1. Dynamic Living Golden Lightning Veins:
    // Warm, silky, incandescent amber gold (#FFB800 / #FFC72C)
    // ZERO nuclear white glare / perfectly eye-friendly
    if (lightning > 0.04) {
      float pulse = 0.95 + 0.22 * sin(uTime * 3.6 + audioEnergy * 5.0);
      float flicker = fract(sin(uv.x * 93.2 + uTime * 16.0) * 43758.5453) * 0.12;
      vec3 goldColor = vec3(1.22, 0.86, 0.18); // Rich warm incandescent gold
      col += goldColor * lightning * (pulse + flicker) * (1.0 + audioEnergy * 0.45);
    }

    // 2. Cyan Ridge Crests & Matrix Lattice Reactivity:
    // When agent speaks, the cyan mountain crests and topological dots breathe with luminescence
    float cyanLum = dot(col, vec3(-0.2, 0.55, 0.95));
    if (cyanLum > 0.18) {
      col += vec3(0.01, 0.42, 0.72) * cyanLum * audioEnergy * 0.58;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

const PARTICLES_VERTEX_SHADER = `
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uVoiceLevel;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec3 pos = position;

    // Gentle 3D floating curl motion
    pos.y += sin(uTime * 0.8 + position.x * 0.08) * 0.7;
    pos.x += cos(uTime * 0.6 + position.y * 0.08) * 0.5;
    pos.z += sin(uTime * 0.7 + position.z * 0.08) * 0.6;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = (1.9 + uVoiceLevel * 1.1) * (65.0 / -mvPos.z);
  }
`;

const PARTICLES_FRAGMENT_SHADER = `
  varying vec3 vColor;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, d) * 0.85;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function DataMountainBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const [textures, setTextures] = useState<{
    texture: THREE.Texture;
    lightningMask: THREE.Texture;
  } | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let isMounted = true;

    Promise.all([
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          "/api/avatar/geometry?file=master_cyber_backdrop.png&v=v38_pure_authentic",
          resolve,
          undefined,
          reject
        );
      }),
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          "/api/avatar/geometry?file=master_lightning_mask.png&v=v38_pure_authentic",
          resolve,
          undefined,
          reject
        );
      }),
    ])
      .then(([texture, lightningMask]) => {
        if (!isMounted) return;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        lightningMask.minFilter = THREE.LinearFilter;
        lightningMask.magFilter = THREE.LinearFilter;
        setTextures({ texture, lightningMask });
      })
      .catch((err) => {
        console.error("Error loading master backdrop textures:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const backdropMaterial = useMemo(() => {
    if (!textures) return null;
    return new THREE.ShaderMaterial({
      vertexShader: BACKDROP_VERTEX_SHADER,
      fragmentShader: BACKDROP_FRAGMENT_SHADER,
      uniforms: {
        uTexture: { value: textures.texture },
        uLightningMask: { value: textures.lightningMask },
        uTime: { value: 0 },
        uVoiceLevel: { value: 0 },
        uUserAudioLevel: { value: 0 },
      },
      depthWrite: false,
      transparent: false,
    });
  }, [textures]);

  // Floating 3D ambient cyber stardust & reactive network particles in scene depth
  const particleGeo = useMemo(() => {
    const count = 850;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 175.0;
      const y = (Math.random() - 0.5) * 85.0;
      const z = -18.0 - Math.random() * 24.0;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const isGold = Math.random() < 0.24;
      if (isGold) {
        colors[i * 3 + 0] = 1.0;
        colors[i * 3 + 1] = 0.78;
        colors[i * 3 + 2] = 0.18;
      } else {
        colors[i * 3 + 0] = 0.02;
        colors[i * 3 + 1] = 0.78;
        colors[i * 3 + 2] = 1.18;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: PARTICLES_VERTEX_SHADER,
      fragmentShader: PARTICLES_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uVoiceLevel: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const state = useAvatarStore.getState();

    if (backdropMaterial && backdropMaterial.uniforms) {
      backdropMaterial.uniforms.uTime.value = time;
      backdropMaterial.uniforms.uVoiceLevel.value = state.smoothedVoiceLevel;
      backdropMaterial.uniforms.uUserAudioLevel.value = state.smoothedUserAudioLevel;
    }

    if (particleMaterial && particleMaterial.uniforms) {
      particleMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uVoiceLevel.value = state.smoothedVoiceLevel;
    }
  });

  return (
    <group>
      {/* 1. Master Authentic Cyber Mountain Backdrop (100% Reference Parity & Audio-Reactive) */}
      {backdropMaterial && (
        <mesh
          ref={meshRef}
          position={[0, 0, -42]}
          material={backdropMaterial}
        >
          <planeGeometry args={[176, 92, 64, 32]} />
        </mesh>
      )}

      {/* 2. Floating 3D Living Interactive Particle Network in Scene Depth */}
      <points
        ref={particlesRef}
        geometry={particleGeo}
        material={particleMaterial}
      />
    </group>
  );
}
