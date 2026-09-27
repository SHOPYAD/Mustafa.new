"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useAvatarStore, AvatarStateName } from "../store/useAvatarStore";

const RAYMARCHED_HOLOGRAM_GLSL = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uCameraPos;
uniform float uVoiceLevel;
uniform float uUserAudioLevel;
uniform float uThinkingIntensity;
uniform float uProfileTransition;
uniform int uState;

varying vec2 vUv;

// ----------------------------------------------------------------------------
// Simplex 3D Noise for organic energy currents
// ----------------------------------------------------------------------------
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

// ----------------------------------------------------------------------------
// Analytical SDF Primitives and Smooth Minimum (Inigo Quilez)
// ----------------------------------------------------------------------------
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdCappedCylinder(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// ----------------------------------------------------------------------------
// Complete Anatomical Humanoid Bust Signed Distance Field
// ----------------------------------------------------------------------------
float mapBust(vec3 p) {
  // 1. Head Cranium & Face (Upper and lower ellipsoids smoothly blended)
  vec3 pHead = p - vec3(0.0, 0.28, 0.0);
  float cranium = sdEllipsoid(pHead - vec3(0.0, 0.12, 0.0), vec3(0.36, 0.44, 0.38));
  float jaw = sdEllipsoid(pHead - vec3(0.0, -0.22, 0.06), vec3(0.24, 0.28, 0.28));
  float head = smin(cranium, jaw, 0.18);

  // 2. Neck Cylinder
  vec3 pNeck = p - vec3(0.0, -0.22, -0.04);
  float neck = sdCappedCylinder(pNeck, 0.22, 0.16 + p.y * -0.05);

  // 3. Clavicles & Broad Topographic Shoulders
  // Left shoulder capsule sweeping out to x = -1.25
  float leftShoulder = sdCapsule(p, vec3(-0.15, -0.42, -0.05), vec3(-1.25, -0.85, -0.12), 0.18);
  // Right shoulder capsule sweeping out to x = +1.25
  float rightShoulder = sdCapsule(p, vec3(0.15, -0.42, -0.05), vec3(1.25, -0.85, -0.12), 0.18);
  float shoulders = min(leftShoulder, rightShoulder);

  // 4. Upper Chest / Sternum Volume
  float chest = sdEllipsoid(p - vec3(0.0, -0.72, -0.08), vec3(0.65, 0.35, 0.26));

  // Seamless organic anatomical blend
  float bust = smin(head, neck, 0.14);
  bust = smin(bust, shoulders, 0.20);
  bust = smin(bust, chest, 0.22);

  return bust;
}

// Surface Normal via finite differences
vec3 calcNormal(vec3 p) {
  const float h = 0.002;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * mapBust(p + k.xyy * h) +
    k.yyx * mapBust(p + k.yyx * h) +
    k.yxy * mapBust(p + k.yxy * h) +
    k.xxx * mapBust(p + k.xxx * h)
  );
}

// ----------------------------------------------------------------------------
// Distant Data Mountain Heightfield (Left & Right Peaks, Dark Center)
// ----------------------------------------------------------------------------
float mapMountains(vec3 p) {
  // Center valley mask: completely clear in center (|x| < 1.0)
  float centerDist = abs(p.x);
  float valley = smoothstep(0.9, 2.2, centerDist);

  // Procedural multi-octave terrain height
  float n1 = snoise(vec3(p.x * 0.45, 0.0, p.z * 0.35));
  float n2 = snoise(vec3(p.x * 1.1, 0.0, p.z * 0.8)) * 0.4;
  float terrainHeight = -0.55 + max(0.0, n1 + n2 + 0.3) * 0.85 * valley;

  return p.y - terrainHeight;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  // Camera Ray Generation
  vec3 ro = uCameraPos;
  vec3 rd = normalize(vec3(uv, -1.95)); // Pinhole forward ray

  // Deep space base color
  vec3 finalColor = vec3(0.008, 0.024, 0.067); // #020611

  // --------------------------------------------------------------------------
  // STEP 1: March Distant Data Mountains (Far Background z in [-5.0, -9.0])
  // --------------------------------------------------------------------------
  float tM = 2.0;
  for (int i = 0; i < 48; i++) {
    vec3 pM = ro + tM * rd;
    if (pM.z < -9.0 || tM > 12.0) break;
    float dM = mapMountains(pM);
    if (dM < 0.02) {
      // Mountain surface reached: render cyan contour isolines and gold veins
      float isoline = smoothstep(0.06, 0.0, abs(fract(pM.y * 14.0) - 0.5));
      float goldVein = smoothstep(0.05, 0.0, abs(sin(pM.x * 2.5 + pM.z * 1.8 + uTime * 0.5)));
      
      vec3 mColor = mix(vec3(0.0, 0.55, 0.75), vec3(1.0, 0.7, 0.1), goldVein * 0.8);
      float depthFade = smoothstep(11.0, 4.0, tM);
      finalColor += mColor * (0.25 + isoline * 0.45) * depthFade * 0.65;
      break;
    }
    tM += max(dM * 0.5, 0.05);
  }

  // --------------------------------------------------------------------------
  // STEP 2: March Anatomical Holographic Bust (Near Foreground)
  // --------------------------------------------------------------------------
  float t = 1.2;
  vec3 accumulatedLight = vec3(0.0);
  float transmittance = 1.0;

  for (int i = 0; i < 68; i++) {
    vec3 p = ro + t * rd;
    if (t > 4.5 || transmittance < 0.02) break;

    float d = mapBust(p);

    // We are inside or near the holographic shell
    if (abs(d) < 0.04) {
      vec3 N = calcNormal(p);
      float fresnel = pow(1.0 - max(0.0, dot(N, -rd)), 2.2);

      // Continuous 120-140 horizontal scanlines
      float scanCoord = p.y * 72.0 + sin(p.x * 6.0) * 0.25;
      float scanline = smoothstep(0.35, 0.05, abs(fract(scanCoord) - 0.5));

      // Wave ripple in face from audio
      float faceRipple = sin(p.x * 12.0 - uTime * 8.0) * (uVoiceLevel * 0.6 + uUserAudioLevel * 0.4);
      float isFace = smoothstep(0.35, 0.0, length(p.xy - vec2(0.0, 0.25)));

      // Cyan holographic shell colors
      vec3 cyanEdge = vec3(0.21, 0.95, 1.0);  // #36F2FF
      vec3 cyanBody = vec3(0.0, 0.74, 0.92);  // #00BDEB
      vec3 shellCol = mix(cyanBody, cyanEdge, fresnel);

      // Layer 2: Incandescent Organic Amber Core (Inside face, 50% width, soft gradient)
      vec3 pAmber = p - vec3(0.0, 0.22, 0.08);
      float amberR = length(vec2(pAmber.x * 2.2, pAmber.y * 1.45));
      float amberGlow = exp(-amberR * 3.2);

      // Undulating horizontal harmonics in amber core
      float amberHarmonics = 1.0 + 0.35 * sin(p.y * 28.0 - uTime * 6.0 + faceRipple);
      float audioBoost = uVoiceLevel * 1.5 + uUserAudioLevel * 0.85;

      vec3 cAmberHot = vec3(1.0, 0.85, 0.3); // Warm gold
      vec3 cAmberMid = vec3(1.0, 0.54, 0.08); // Fiery orange
      vec3 coreCol = mix(cAmberMid, cAmberHot, clamp(amberGlow * 1.5 + audioBoost * 0.4, 0.0, 1.0));
      coreCol *= amberGlow * amberHarmonics * (1.0 + audioBoost * 1.2);

      // Layer 3: Delicate Asymmetric Branching Golden Vein
      // Ascends from chest (y = -0.55) through neck to chin (y = 0.05)
      float veinX = sin(p.y * 12.0) * 0.04 + cos(p.y * 18.0) * 0.02 + 0.015;
      float distToVein = length(vec2(p.x - veinX, p.z - 0.16));
      float isVeinZone = step(-0.55, p.y) * step(p.y, 0.1);
      float veinPulse = exp(-pow((p.y + 0.55 - fract(uTime * 0.6) * 0.65) * 8.0, 2.0));
      float veinGlow = smoothstep(0.025, 0.0, distToVein) * isVeinZone * (1.0 + veinPulse * 2.0);
      vec3 veinCol = vec3(1.0, 0.84, 0.0) * veinGlow * 2.2;

      // Composite local light contribution
      float shellDensity = (scanline * 0.75 + fresnel * 1.1) * (1.0 - isFace * 0.35);
      vec3 stepLight = shellCol * shellDensity + coreCol * 1.35 + veinCol;

      // Soft light accumulation
      float sampleOpacity = clamp(shellDensity * 0.35 + amberGlow * 0.4 + veinGlow * 0.6, 0.0, 1.0);
      accumulatedLight += stepLight * sampleOpacity * transmittance;
      transmittance *= (1.0 - sampleOpacity * 0.75);
    }

    t += max(abs(d) * 0.6, 0.015);
  }

  finalColor += accumulatedLight;

  // --------------------------------------------------------------------------
  // STEP 3: Vignette and Output
  // --------------------------------------------------------------------------
  float vig = smoothstep(1.4, 0.35, length(uv));
  finalColor *= vig;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function RaymarchedHologramBust() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uCameraPos: { value: new THREE.Vector3(0, -0.15, 3.1) },
      uVoiceLevel: { value: 0 },
      uUserAudioLevel: { value: 0 },
      uThinkingIntensity: { value: 0 },
      uProfileTransition: { value: 0 },
      uState: { value: 0 },
    };
  }, [size.width, size.height]);

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

    if (meshRef.current && (meshRef.current.material as THREE.ShaderMaterial).uniforms) {
      const u = (meshRef.current.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value = time;
      u.uResolution.value.set(size.width, size.height);
      u.uVoiceLevel.value = state.smoothedVoiceLevel;
      u.uUserAudioLevel.value = state.smoothedUserAudioLevel;
      u.uThinkingIntensity.value = state.thinkingIntensity;
      u.uProfileTransition.value = state.profileTransitionProgress ?? 0;
      u.uState.value = stateMap[state.currentState] ?? 0;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={RAYMARCHED_HOLOGRAM_GLSL}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
