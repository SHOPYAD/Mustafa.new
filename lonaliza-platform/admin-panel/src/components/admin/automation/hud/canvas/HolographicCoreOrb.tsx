"use client";

import React, { useEffect, useRef } from "react";

interface HolographicCoreOrbProps {
  width?: number;
  height?: number;
  frequencies?: number[]; // Audio frequencies (0 to 1)
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
  isProcessing?: boolean;
  colorScheme?: string;
  onCoreClick?: () => void;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  baseAlpha: number;
  color: string;
}

export default function HolographicCoreOrb({
  width = 520,
  height = 520,
  frequencies = [],
  isUserSpeaking = false,
  isAgentSpeaking = false,
  isProcessing = false,
  colorScheme = "oceano",
  onCoreClick,
}: HolographicCoreOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let rotationAngle = 0;
    let ring2Angle = 0;
    let ring3Angle = 0;

    // Palette Colors based on theme
    let primaryColor = "#00e5ff"; // cyan
    let secondaryColor = "#38bdf8";
    let glowColor = "rgba(0, 229, 255, 0.4)";

    if (colorScheme === "emerald") {
      primaryColor = "#10b981";
      secondaryColor = "#34d399";
      glowColor = "rgba(16, 185, 129, 0.4)";
    } else if (colorScheme === "neon") {
      primaryColor = "#ec4899";
      secondaryColor = "#8b5cf6";
      glowColor = "rgba(236, 72, 153, 0.4)";
    } else if (colorScheme === "bordo") {
      primaryColor = "#f43f5e";
      secondaryColor = "#f59e0b";
      glowColor = "rgba(244, 63, 94, 0.4)";
    }

    if (isUserSpeaking) {
      primaryColor = "#00f0ff";
      glowColor = "rgba(0, 240, 255, 0.6)";
    } else if (isAgentSpeaking) {
      primaryColor = "#10b981";
      glowColor = "rgba(16, 185, 129, 0.6)";
    } else if (isProcessing) {
      primaryColor = "#f59e0b";
      glowColor = "rgba(245, 158, 11, 0.6)";
    }

    // Initialize 3D orbital particles
    const particleCount = 140;
    const particles: Particle[] = [];
    const sphereRadius = 110;

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
      const z = sphereRadius * Math.cos(phi);

      particles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1.2,
        baseAlpha: Math.random() * 0.6 + 0.4,
        color: Math.random() > 0.4 ? primaryColor : secondaryColor,
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Audio intensity multiplier
      const avgAudio =
        frequencies.length > 0
          ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
          : 0;

      const pulseScale = 1 + avgAudio * 0.45;
      const spinSpeed = 0.012 + (isProcessing ? 0.03 : 0) + avgAudio * 0.025;

      rotationAngle += spinSpeed;
      ring2Angle -= spinSpeed * 0.7;
      ring3Angle += spinSpeed * 1.3;

      // 1. Central Ambient Glow
      const glowRad = 130 * pulseScale;
      const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, glowRad);
      glowGrad.addColorStop(0, primaryColor + "33");
      glowGrad.addColorStop(0.5, glowColor);
      glowGrad.addColorStop(1, "transparent");

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRad, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Wireframe Shells (Ultron / Iron Man inspiration)
      ctx.save();
      ctx.translate(cx, cy);

      // Outer Ring with Tech Dashes
      ctx.strokeStyle = primaryColor + "66";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 10, 4, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 115 * pulseScale, rotationAngle, rotationAngle + Math.PI * 2);
      ctx.stroke();

      // Mid Ring with Opposite Spin
      ctx.strokeStyle = secondaryColor + "88";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([20, 8, 2, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 88 * pulseScale, ring2Angle, ring2Angle + Math.PI * 2);
      ctx.stroke();

      // Inner Fast Ring
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 58 * pulseScale, ring3Angle, ring3Angle + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Core Solid Center Node
      ctx.fillStyle = primaryColor;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 20 * pulseScale;
      ctx.beginPath();
      ctx.arc(0, 0, 18 * pulseScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      ctx.restore();

      // 3. 3D Particle Cloud with Matrix Rotation
      const cosA = Math.cos(rotationAngle);
      const sinA = Math.sin(rotationAngle);
      const cosB = Math.cos(rotationAngle * 0.5);
      const sinB = Math.sin(rotationAngle * 0.5);

      particles.forEach((p) => {
        // Rotate around Y and X axis
        const x1 = p.x * cosA - p.z * sinA;
        const z1 = p.x * sinA + p.z * cosA;

        const y2 = p.y * cosB - z1 * sinB;
        const z2 = p.y * sinB + z1 * cosB;

        // Perspective 3D projection
        const fov = 300;
        const scale = fov / (fov + z2);
        const projX = cx + x1 * scale * pulseScale;
        const projY = cy + y2 * scale * pulseScale;

        const alpha = Math.max(0.1, Math.min(1, p.baseAlpha * scale));
        const rad = Math.max(0.8, p.size * scale * (1 + avgAudio * 0.5));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(projX, projY, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [width, height, frequencies, isUserSpeaking, isAgentSpeaking, isProcessing, colorScheme]);

  return (
    <div
      onClick={onCoreClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block pointer-events-auto transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
