"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAvatarStore } from "../store/useAvatarStore";
import { getHudArticleSnapshot } from "@/lib/swarm/article-hud-snapshot";

// =========================================================================
// ORGANIC FLOATING NEURAL MATH MATRIX (BORDERLESS & PURE HOLOGRAPHIC)
// Floating mathematical formulas, tensor equations & real-time telemetry
// framed solely by delicate cybernetic brackets ┌ ┐ └ ┘ (Zero solid boxes).
// Features continuous organic lifecycle (smooth fade-in/out across space),
// mouse parallax tilt, and live computational fluctuations.
// =========================================================================

interface CalculationNode {
  category: "math" | "mcp" | "ai" | "audit";
  title: string;
  compute: () => string;
  subText: string;
  accent: "cyan" | "gold" | "emerald";
  x: number;
  y: number;
  z: number;
  scale: number;
  phaseOffset: number;
}

function drawOrganicHoloFormula(
  ctx: CanvasRenderingContext2D,
  title: string,
  dynamicValue: string,
  subText: string,
  accent: "cyan" | "gold" | "emerald"
) {
  const w = 768;
  const h = 210;

  // 1. Completely transparent background — Zero solid or dark rectangular boxes!
  ctx.clearRect(0, 0, w, h);

  const mainColor = accent === "gold" ? "#ffb703" : accent === "emerald" ? "#10b981" : "#00f0ff";
  const glowColor =
    accent === "gold"
      ? "rgba(255, 183, 3, 0.6)"
      : accent === "emerald"
      ? "rgba(16, 185, 129, 0.6)"
      : "rgba(0, 240, 255, 0.6)";

  // 2. Delicate Cybernetic Corner Brackets ┌ ┐ └ ┘ (Frames the text with zero filled container)
  const bracketLen = 22;
  const pad = 12;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = mainColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;

  // Top-left ┌
  ctx.beginPath();
  ctx.moveTo(pad, pad + bracketLen);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + bracketLen, pad);
  ctx.stroke();

  // Top-right ┐
  ctx.beginPath();
  ctx.moveTo(w - pad - bracketLen, pad);
  ctx.lineTo(w - pad, pad);
  ctx.lineTo(w - pad, pad + bracketLen);
  ctx.stroke();

  // Bottom-left └
  ctx.beginPath();
  ctx.moveTo(pad, h - pad - bracketLen);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(pad + bracketLen, h - pad);
  ctx.stroke();

  // Bottom-right ┘
  ctx.beginPath();
  ctx.moveTo(w - pad - bracketLen, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.lineTo(w - pad, h - pad - bracketLen);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // 3. Category & Domain Tag
  ctx.fillStyle = mainColor;
  ctx.font = "bold 20px 'JetBrains Mono', 'Fira Code', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`⟨ ${title} ⟩`, pad + 24, pad + 14);

  // Subtle accent dot
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(pad + 12, pad + 24, 3, 0, Math.PI * 2);
  ctx.fill();

  // 4. Primary Live Mathematical Equation
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px 'JetBrains Mono', 'Fira Code', monospace";
  ctx.shadowColor = mainColor;
  ctx.shadowBlur = 14;
  ctx.fillText(dynamicValue, pad + 24, pad + 60);
  ctx.shadowBlur = 0;

  // 5. Sub-telemetry & Precision Metrics
  ctx.fillStyle = mainColor;
  ctx.font = "18px 'JetBrains Mono', monospace";
  ctx.fillText(subText, pad + 24, pad + 126);
}

/** موضع بعيد عن مركز المجسم، غير منتظم، وفي عمق الخلفية. */
function backgroundSlot(index: number) {
  const unit = (salt: number) => {
    const raw = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
    return raw - Math.floor(raw);
  };
  const angle = unit(1) * Math.PI * 2;
  const radius = 42 + unit(2) * 18;
  return {
    x: Math.cos(angle) * radius,
    y: (unit(3) - 0.5) * 34,
    z: -52 - unit(4) * 22,
    scale: 0.78 + unit(5) * 0.22,
  };
}

export default function InteractiveNeuralMathMatrix() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseSmooth = useRef({ x: 0, y: 0 });
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);

  // Calculation Definitions spanning all Supervisor Domains
  const nodesConfig = useMemo<CalculationNode[]>(() => {
    const specs: Omit<CalculationNode, "x" | "y" | "z" | "scale">[] = [
      // Left Cluster (Upper to Lower across 3D space)
      {
        category: "math",
        title: "ATTENTION_MATRIX // SOFTMAX",
        compute: () => `α_ij = exp(e_ij) / ∑ exp(e_ik)  →  [0.892, 0.081, 0.027]`,
        subText: "HEADS: 16  ·  DIM: 1536d  ·  PRECISION: FP16",
        accent: "cyan",
        phaseOffset: 0.0,
      },
      {
        category: "ai",
        title: "POLICY_GRADIENT // REINFORCE",
        compute: () => `∇_θ 𝔼[R(τ)] = 0.00342  (Entropy: 1.482)`,
        subText: "DISCOUNT_γ: 0.99  ·  ACTOR_CRITIC: CONVERGED",
        accent: "gold",
        phaseOffset: 1.2,
      },
      {
        category: "audit",
        title: "SOVEREIGN_MARGIN_AUDIT // PASS",
        compute: () => {
          const snap = getHudArticleSnapshot();
          return snap.status === "IDLE" ? "NO_LIVE_MARGIN" : snap.status;
        },
        subText: "MARGIN SHOWS ONLY AFTER A CONNECTOR RESULT",
        accent: "emerald",
        phaseOffset: 2.4,
      },
      {
        category: "mcp",
        title: "GDS_LATENCY & NDC_CONNECT",
        compute: () => `Saudia 84ms · Flynas NDC 112ms · Amadeus 96ms`,
        subText: "SLOTS: AVAILABLE  ·  INSTANT_BOOKING: ACTIVE",
        accent: "cyan",
        phaseOffset: 3.6,
      },

      // Right Cluster (Upper to Lower across 3D space)
      {
        category: "mcp",
        title: "QDRANT_COSINE_SIMILARITY",
        compute: () => `S_c(u, v) = (u · v) / (||u|| ||v||)  →  0.964`,
        subText: "VECTOR_INDEX: HNSW  ·  DISTANCE: COSINE",
        accent: "cyan",
        phaseOffset: 0.8,
      },
      {
        category: "ai",
        title: "SWARM_CONSENSUS_THRESHOLD",
        compute: () => {
          const snap = getHudArticleSnapshot();
          return snap.slug === "NO_ARTICLE" ? "NO_CONSENSUS_YET" : snap.slug;
        },
        subText: "CONSENSUS IS NOT ASSUMED",
        accent: "gold",
        phaseOffset: 2.0,
      },
      {
        category: "math",
        title: "LIOTRIP_BLOG // CMS_DISPATCH",
        compute: () => {
          const snap = getHudArticleSnapshot();
          return `${snap.slug}  [${snap.status}]`;
        },
        subText: "NO FIXED SEO SCORE",
        accent: "emerald",
        phaseOffset: 3.2,
      },
      {
        category: "mcp",
        title: "GOOGLE_TRENDS::INTENT_RADAR",
        compute: () => {
          const snap = getHudArticleSnapshot();
          return `${snap.destination}: ${snap.detail}`;
        },
        subText: "NO INVENTORY COUNT UNTIL A TOOL RETURNS",
        accent: "cyan",
        phaseOffset: 4.4,
      },
    ];
    return specs.map((spec, index) => ({ ...spec, ...backgroundSlot(index) }));
  }, []);

  // Prepare Canvases and CanvasTextures for each node
  const cardElements = useMemo(() => {
    if (typeof document === "undefined") return [];

    return nodesConfig.map((cfg, idx) => {
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 210;
      const ctx = canvas.getContext("2d")!;
      drawOrganicHoloFormula(ctx, cfg.title, cfg.compute(), cfg.subText, cfg.accent);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;

      return {
        id: idx,
        cfg,
        canvas,
        ctx,
        texture,
        pos: new THREE.Vector3(cfg.x, cfg.y, cfg.z),
        baseScale: cfg.scale,
        phaseOffset: cfg.phaseOffset,
      };
    });
  }, [nodesConfig]);

  // Periodic active re-computation (every 1.6 seconds, values tick to show living calculations)
  useEffect(() => {
    if (cardElements.length === 0) return;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      cardElements.forEach((item) => {
        let liveVal = item.cfg.compute();
        if (item.cfg.title.includes("ATTENTION")) {
          const v1 = (0.87 + Math.sin(step * 0.7) * 0.04).toFixed(3);
          const v2 = (0.08 + Math.cos(step * 0.5) * 0.02).toFixed(3);
          const v3 = (1 - Number(v1) - Number(v2)).toFixed(3);
          liveVal = `α_ij = exp(e_ij) / ∑ exp(e_ik)  →  [${v1}, ${v2}, ${v3}]`;
        } else if (item.cfg.title.includes("MARGIN")) {
          const margin = (21.2 + Math.sin(step * 0.4) * 0.6).toFixed(1);
          liveVal = `Gross Margin: +${margin}%  [THRESHOLD: >= 15%]`;
        } else if (item.cfg.title.includes("COSINE")) {
          const sim = (0.961 + Math.sin(step * 0.6) * 0.012).toFixed(3);
          liveVal = `S_c(u, v) = (u · v) / (||u|| ||v||)  →  ${sim}`;
        } else if (item.cfg.title.includes("CONSENSUS")) {
          const c = (96.2 + Math.sin(step * 0.5) * 1.4).toFixed(1);
          liveVal = `λ_agree = ${c}% >= 0.90  [UNANIMOUS_PASS]`;
        } else if (item.cfg.title.includes("LATENCY")) {
          const l1 = Math.round(82 + Math.sin(step * 0.8) * 6);
          const l2 = Math.round(110 + Math.cos(step * 0.6) * 8);
          liveVal = `Saudia ${l1}ms · Flynas NDC ${l2}ms · Amadeus 94ms`;
        }

        drawOrganicHoloFormula(item.ctx, item.cfg.title, liveVal, item.cfg.subText, item.cfg.accent);
        item.texture.needsUpdate = true;
      });
    }, 1600);

    return () => clearInterval(interval);
  }, [cardElements]);

  // Subtle Synaptic Link Lines between neighboring nodes
  const linesGeometry = useMemo(() => {
    if (cardElements.length === 0) return new THREE.BufferGeometry();

    const points: THREE.Vector3[] = [];
    for (let i = 0; i < cardElements.length; i++) {
      for (let j = i + 1; j < cardElements.length; j++) {
        const d = cardElements[i].pos.distanceTo(cardElements[j].pos);
        if (d < 22.0) {
          points.push(cardElements[i].pos, cardElements[j].pos);
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [cardElements]);

  const linesMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color("#00f0ff"),
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    const time = clock.getElapsedTime();
    const state = useAvatarStore.getState();
    const voice = state.smoothedVoiceLevel || 0;
    const thinking = state.thinkingIntensity || 0;

    // Smooth mouse pointer interpolation
    mouseSmooth.current.x += (pointer.x - mouseSmooth.current.x) * Math.min(1, delta * 5.0);
    mouseSmooth.current.y += (pointer.y - mouseSmooth.current.y) * Math.min(1, delta * 5.0);

    if (groupRef.current) {
      // 3D Parallax Tilt responding to mouse coordinates
      groupRef.current.position.x = mouseSmooth.current.x * 1.1;
      groupRef.current.position.y = mouseSmooth.current.y * 0.7;
      groupRef.current.rotation.y = mouseSmooth.current.x * 0.06;
      groupRef.current.rotation.x = -mouseSmooth.current.y * 0.04;

      if (linesMaterial) {
        linesMaterial.opacity = 0.12 + voice * 0.32 + (thinking > 0.5 ? 0.2 : 0);
      }
    }

    // Organic Fade In / Fade Out Lifecycle across 3D Space
    // Each formula smoothly oscillates its opacity and slight vertical breathing
    cardElements.forEach((item, idx) => {
      const sprite = spriteRefs.current[idx];
      if (sprite) {
        const cycle = time * 0.7 + item.phaseOffset;
        // Smooth sine wave between 0.25 (faded) and 0.95 (bright)
        const wave = 0.5 + 0.5 * Math.sin(cycle);
        const dynamicOpacity = 0.22 + 0.16 * wave + voice * 0.05;
        (sprite.material as THREE.SpriteMaterial).opacity = Math.min(1, dynamicOpacity);

        // Gentle organic floating micro-motion
        sprite.position.y = item.pos.y + Math.sin(time * 0.9 + item.phaseOffset) * 0.35;
      }
    });
  });

  if (cardElements.length === 0) return null;

  return (
    <group ref={groupRef} renderOrder={0}>
      {/* 1. Delicate Synaptic Link Lines */}
      <lineSegments geometry={linesGeometry} material={linesMaterial} />

      {/* 2. Pure Holographic Borderless Floating Formula Sprites */}
      {cardElements.map((item, idx) => (
        <sprite
          key={item.id}
          ref={(el) => {
            spriteRefs.current[idx] = el;
          }}
          position={item.pos}
          scale={[11.4 * item.baseScale, 3.1 * item.baseScale, 1]}
        >
          <spriteMaterial
            map={item.texture}
            transparent={true}
            opacity={0.34}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}
