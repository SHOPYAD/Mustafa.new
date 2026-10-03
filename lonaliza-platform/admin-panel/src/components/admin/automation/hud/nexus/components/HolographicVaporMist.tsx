"use client";

import React, { useRef, useEffect, memo } from "react";

export interface HolographicVaporMistProps {
  isListening?: boolean;
  isAgentSpeaking?: boolean;
  audioFrequencies?: number[];
  themeColor?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  hue: "cyan" | "gold" | "white";
  swayFreq: number;
  swayAmp: number;
}

export const HolographicVaporMist = memo(function HolographicVaporMist({
  isListening = false,
  isAgentSpeaking = false,
  audioFrequencies = [],
  themeColor = "gold",
}: HolographicVaporMistProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic audio intensity
  const audioIntensity = React.useMemo(() => {
    if (audioFrequencies.length === 0) return 0.2;
    const sum = audioFrequencies.reduce((acc, v) => acc + v, 0);
    return Math.min(1, Math.max(0.15, (sum / audioFrequencies.length) * 2));
  }, [audioFrequencies]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const width = 650;
    const height = 520;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particles: Particle[] = [];
    const maxParticles = Math.round((isAgentSpeaking ? 85 : isListening ? 65 : 48) * (1 + audioIntensity * 0.5));

    function createParticle(): Particle {
      const isGold = Math.random() < 0.45;
      const isWhite = Math.random() < 0.2;
      return {
        // Spawn around center bottom near supervisor floor disc
        x: width / 2 + (Math.random() - 0.5) * 110,
        y: height - 15 - Math.random() * 25,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(1.1 + Math.random() * 1.5) * (1 + audioIntensity * 0.8),
        radius: 6 + Math.random() * 8,
        maxRadius: 28 + Math.random() * 26,
        alpha: 0,
        maxAlpha: (0.28 + Math.random() * 0.35) * (1 + audioIntensity * 0.5),
        life: 0,
        maxLife: 140 + Math.random() * 90,
        hue: isWhite ? "white" : isGold ? "gold" : "cyan",
        swayFreq: 0.02 + Math.random() * 0.03,
        swayAmp: 0.4 + Math.random() * 0.8,
      };
    }

    // Initialize initial particles
    for (let i = 0; i < maxParticles; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      p.y = height - (p.life / p.maxLife) * (height - 30);
      particles.push(p);
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Soft Ambient Ethereal Glow Clouds at Base (Dissipated, No Polygon Edges!)
      const basePulse = Math.sin(frame * 0.04) * 0.15;
      const baseAlpha = (isAgentSpeaking ? 0.35 : isListening ? 0.28 : 0.2) + basePulse;

      // Golden Warmth Cloud
      const goldGrad = ctx.createRadialGradient(
        width / 2,
        height - 50,
        15,
        width / 2,
        height - 120,
        180
      );
      goldGrad.addColorStop(0, `rgba(255, 215, 0, ${baseAlpha * 1.1})`);
      goldGrad.addColorStop(0.5, `rgba(255, 183, 3, ${baseAlpha * 0.5})`);
      goldGrad.addColorStop(1, "rgba(255, 183, 3, 0)");
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height - 80, 180, 0, Math.PI * 2);
      ctx.fill();

      // Electric Cyan Aura Cloud
      const cyanGrad = ctx.createRadialGradient(
        width / 2,
        height - 70,
        20,
        width / 2,
        height - 160,
        220
      );
      cyanGrad.addColorStop(0, `rgba(0, 240, 255, ${baseAlpha * 1.2})`);
      cyanGrad.addColorStop(0.4, `rgba(0, 180, 255, ${baseAlpha * 0.4})`);
      cyanGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
      ctx.fillStyle = cyanGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height - 100, 220, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rising Dissipating Vapor Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.y += p.vy;
        p.x += Math.sin(p.life * p.swayFreq) * p.swayAmp + p.vx;

        const progress = p.life / p.maxLife; // 0 to 1

        // Disperse and expand radius as it rises
        const curRadius = p.radius + (p.maxRadius - p.radius) * Math.pow(progress, 0.7);

        // Fade in rapidly at bottom, then smoothly evaporate/dissipate to 0 at top
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.maxAlpha;
        } else {
          p.alpha = Math.max(0, (1 - Math.pow(progress, 1.4)) * p.maxAlpha);
        }

        if (p.alpha > 0.005) {
          const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, curRadius);

          if (p.hue === "gold") {
            radGrad.addColorStop(0, `rgba(255, 225, 120, ${p.alpha})`);
            radGrad.addColorStop(0.4, `rgba(255, 200, 30, ${p.alpha * 0.6})`);
            radGrad.addColorStop(1, "rgba(255, 180, 0, 0)");
          } else if (p.hue === "white") {
            radGrad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * 1.1})`);
            radGrad.addColorStop(0.5, `rgba(200, 245, 255, ${p.alpha * 0.4})`);
            radGrad.addColorStop(1, "rgba(200, 245, 255, 0)");
          } else {
            radGrad.addColorStop(0, `rgba(180, 250, 255, ${p.alpha})`);
            radGrad.addColorStop(0.4, `rgba(0, 220, 255, ${p.alpha * 0.65})`);
            radGrad.addColorStop(1, "rgba(0, 180, 255, 0)");
          }

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Reset particle when it fades or rises above canvas
        if (p.life >= p.maxLife || p.y < 20 || p.alpha <= 0.005) {
          particles[i] = createParticle();
        }
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [isListening, isAgentSpeaking, themeColor]);

  return (
    <div className="pointer-events-none absolute bottom-[40px] left-1/2 -translate-x-1/2 z-25 flex flex-col items-center justify-end select-none">
      <canvas
        ref={canvasRef}
        style={{
          width: 650,
          height: 520,
          filter: "blur(5px)",
        }}
        className="pointer-events-none"
      />
    </div>
  );
});

export default HolographicVaporMist;
