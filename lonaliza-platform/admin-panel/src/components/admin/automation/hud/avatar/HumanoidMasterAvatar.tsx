"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAvatarStore } from "./store/useAvatarStore";
import HumanoidBust from "./components/HumanoidBust";
import AmberVolumetricCore from "./components/AmberVolumetricCore";
import RisingSynapticSparks from "./components/RisingSynapticSparks";
import QuantumBirthOrb from "./components/QuantumBirthOrb";
import InteractiveNeuralMathMatrix from "./components/InteractiveNeuralMathMatrix";
import AvatarPostProcessing from "./components/AvatarPostProcessing";
import AvatarHudOverlay from "./components/AvatarHudOverlay";

interface HumanoidMasterAvatarProps {
  width?: number | string;
  height?: number | string;
  frequencies?: number[];
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
  isProcessing?: boolean;
  agentStatus?: "idle" | "listening" | "deliberating" | "speaking" | "executing";
  onAvatarClick?: () => void;
  onEnterSwarmWorkspace?: () => void;
  slowCamera?: boolean;
  className?: string;
  hideDebugOverlay?: boolean;
}

// Global Camera Controller: Perfect 16:9 framing matching reference image
function CameraRig({ slowCamera }: { slowCamera?: boolean }) {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const floatY = Math.sin(t * 0.4) * (slowCamera ? 0.05 : 0.15);
    const floatX = Math.cos(t * 0.28) * (slowCamera ? 0.04 : 0.12);
    camera.position.x = floatX;
    camera.position.y = floatY;
    camera.position.z = 54.0;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// Global Frame Ticker for audio smoothing and Zustand state interpolation
function FrameTicker() {
  useFrame((_, delta) => {
    useAvatarStore.getState().tickSmoothing(delta);
  });
  return null;
}

// Sentient Bust Rig: Synchronized lifelike neck-pivot head rotation, nodding & gestures
function SentientBustRig() {
  const groupRef = useRef<THREE.Group>(null);
  const rotX = useRef(0);
  const rotY = useRef(0);
  const rotZ = useRef(0);
  const posY = useRef(0);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const state = useAvatarStore.getState();
    const currentState = state.currentState;
    const voice = state.smoothedVoiceLevel;
    const thinking = state.thinkingIntensity;

    let targetRotX = 0;
    let targetRotY = 0;
    let targetRotZ = 0;
    let targetPosY = 0;

    if (currentState === "thinking") {
      // 1. Thoughtful Contemplation:
      // Tilts head inquiringly (roll), gazes slowly side-to-side (yaw), tilts slightly upward (pitch)
      targetRotX = -0.055 + Math.sin(t * 1.6) * 0.038; // looking slightly upward
      targetRotY = Math.cos(t * 1.2) * 0.085;          // gazing side-to-side
      targetRotZ = Math.sin(t * 1.4) * 0.055;          // contemplative ear tilt
      targetPosY = Math.sin(t * 2.0) * 0.06;
    } else if (currentState === "speaking") {
      // 2. Sentient Conversational Nodding & Speech Emphasis:
      // Rhythmic head nodding synchronized with vocal cadence (~4.8Hz)
      const speechPower = Math.max(0.25, voice);
      const nod = Math.sin(t * 4.8);
      targetRotX = 0.02 + nod * (0.04 + speechPower * 0.085); // organic conversational nodding
      targetRotY = Math.sin(t * 2.1) * (0.025 + speechPower * 0.045); // slight lateral emphasis
      targetRotZ = Math.cos(t * 2.6) * (0.015 + speechPower * 0.03);  // subtle natural head roll
      targetPosY = Math.sin(t * 4.8) * (0.03 + speechPower * 0.05);   // chest vocal respiration
    } else if (currentState === "listening") {
      // 3. Attentive Listening: Head tilts forward, focused on user
      targetRotX = 0.045 + Math.sin(t * 1.1) * 0.02;
      targetRotY = Math.sin(t * 0.8) * 0.03;
      targetRotZ = -0.035; // attentive head cock
      targetPosY = Math.sin(t * 1.4) * 0.03;
    } else {
      // 4. Idle: living organism respiration & subtle micro-movements
      targetRotX = Math.sin(t * 0.6) * 0.015;
      targetRotY = Math.cos(t * 0.45) * 0.02;
      targetRotZ = Math.sin(t * 0.35) * 0.012;
      targetPosY = Math.sin(t * 0.8) * 0.03;
    }

    // Smooth physics damping
    const lerpSpeed = Math.min(1.0, delta * 4.8);
    rotX.current = THREE.MathUtils.lerp(rotX.current, targetRotX, lerpSpeed);
    rotY.current = THREE.MathUtils.lerp(rotY.current, targetRotY, lerpSpeed);
    rotZ.current = THREE.MathUtils.lerp(rotZ.current, targetRotZ, lerpSpeed);
    posY.current = THREE.MathUtils.lerp(posY.current, targetPosY, lerpSpeed);

    if (groupRef.current) {
      groupRef.current.rotation.x = rotX.current;
      groupRef.current.rotation.y = rotY.current;
      groupRef.current.rotation.z = rotZ.current;
      groupRef.current.position.y = posY.current;
    }
  });

  return (
    // Pivot at neck base (y = -7.0) so rotation mimics natural human biomechanics
    <group position={[0, -7.0, 0]}>
      <group ref={groupRef}>
        <group position={[0, 7.0, 0]}>
          {/* Layer 2: Internal Volumetric Amber Core (Fiery undulating glow inside face) */}
          <AmberVolumetricCore />

          {/* Layers 1, 2, 3: Master Humanoid Bust (Concentric curves, golden veins, heart node) */}
          <HumanoidBust />

          {/* Layer 5: Ethereal Rising Synaptic Motes from Head, Temples & Shoulders */}
          <RisingSynapticSparks />
        </group>
      </group>
    </group>
  );
}

export default function HumanoidMasterAvatar({
  width = "100%",
  height = "100%",
  frequencies = [],
  isUserSpeaking = false,
  isAgentSpeaking = false,
  isProcessing = false,
  agentStatus = "idle",
  onAvatarClick,
  onEnterSwarmWorkspace,
  slowCamera = false,
  className = "",
  hideDebugOverlay = false,
}: HumanoidMasterAvatarProps) {
  const [mounted, setMounted] = useState(false);
  const setState = useAvatarStore((s) => s.setState);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize incoming audio and status props to Zustand store
  useEffect(() => {
    // Only apply external status once assembly is complete
    if (!useAvatarStore.getState().isAssembled) return;

    if (isAgentSpeaking) {
      const avgFreq =
        frequencies.length > 0
          ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
          : 0.65;
      setState("speaking", { voiceLevel: Math.max(0.2, avgFreq * 1.5) });
    } else if (isUserSpeaking) {
      const avgFreq =
        frequencies.length > 0
          ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
          : 0.55;
      setState("listening", { userAudioLevel: Math.max(0.2, avgFreq * 1.4) });
    } else if (isProcessing || agentStatus === "deliberating" || agentStatus === "executing") {
      setState("thinking", { intensity: 0.85 });
    } else {
      setState("idle");
    }
  }, [isAgentSpeaking, isUserSpeaking, isProcessing, agentStatus, frequencies, setState]);

  if (!mounted) {
    return (
      <div
        className={`relative flex items-center justify-center bg-[#020611] text-[#00D9FF] font-mono text-sm ${className}`}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#00D9FF] border-t-transparent animate-spin" />
          <span className="tracking-widest text-xs">SYNCHRONIZING HOLOGRAPHIC QUANTUM BUST...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full bg-transparent overflow-hidden select-none ${className}`}
      style={{ width, height }}
      onClick={onAvatarClick}
    >
      <Canvas
        camera={{ position: [0, 0, 54], fov: 42, near: 0.5, far: 500 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={[1, 2]}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <FrameTicker />
          <CameraRig slowCamera={slowCamera} />

          {/* Layer 0: Interactive Algorithmic Neural Matrix Backdrop (Mouse Parallax & Formulas) */}
          <InteractiveNeuralMathMatrix />

          {/* Layer 0: Quantum Birth Orb (Bottom center assembly vortex source & ambient anchor) */}
          <QuantumBirthOrb />

          {/* Sentient Biomechanical Bust Rig: Neck-pivot nodding, thinking gestures & amber core */}
          <SentientBustRig />

          {/* Layer 6: Precision Controlled Bloom & Postprocessing */}
          <AvatarPostProcessing />
        </Suspense>
      </Canvas>

      {/* Interactive HUD Overlay */}
      {!hideDebugOverlay && (
        <AvatarHudOverlay
          slowCamera={slowCamera}
          onEnterSwarmWorkspace={onEnterSwarmWorkspace}
        />
      )}
    </div>
  );
}
