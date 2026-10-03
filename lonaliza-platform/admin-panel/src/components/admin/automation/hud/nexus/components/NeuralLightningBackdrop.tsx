"use client";

import React, { useRef, useEffect, memo } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
  glowColor: string;
}

interface Pulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

const COLORS = [
  { main: "#00f0ff", glow: "rgba(0, 240, 255, 0.8)" }, // Cyan
  { main: "#ffd700", glow: "rgba(255, 215, 0, 0.8)" }, // Gold
  { main: "#c084fc", glow: "rgba(192, 132, 252, 0.8)" }, // Purple
  { main: "#34d399", glow: "rgba(52, 211, 153, 0.8)" }, // Emerald
  { main: "#f472b6", glow: "rgba(244, 114, 182, 0.8)" }, // Pink
];

export const NeuralLightningBackdrop = memo(function NeuralLightningBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    // Initialize 80 neural network nodes
    const nodeCount = Math.min(90, Math.max(50, Math.floor((width * height) / 18000)));
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.72), // Upper 72% of the stage
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1.5 + Math.random() * 2,
        baseAlpha: 0.35 + Math.random() * 0.45,
        color: c.main,
        glowColor: c.glow,
      });
    }

    // Active pulses along synaptic connections
    const pulses: Pulse[] = [];

    // Helper: draw jagged electric lightning bolt between two points
    function drawLightning(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      intensity: number
    ) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      if (dist < 5 || !ctx) return;

      const steps = Math.max(3, Math.floor(dist / 22));
      const perpX = -dy / dist;
      const perpY = dx / dist;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2 * intensity;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 * intensity;
      ctx.globalAlpha = Math.min(1, 0.85 * intensity);

      ctx.beginPath();
      ctx.moveTo(x1, y1);

      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        // Random jagged offset
        const sway = (Math.random() - 0.5) * 16 * Math.sin(t * Math.PI);
        const px = x1 + dx * t + perpX * sway;
        const py = y1 + dy * t + perpY * sway;
        ctx.lineTo(px, py);
      }

      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse cursor follow
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.15;
      m.y += (m.targetY - m.y) * 0.15;

      // 1. Update and draw neural nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        // Bounce within upper stage bounds
        if (n.x < 20 || n.x > width - 20) n.vx *= -1;
        if (n.y < 20 || n.y > height * 0.72) n.vy *= -1;

        // Distance to mouse
        const dMouse = m.active ? Math.hypot(n.x - m.x, n.y - m.y) : 9999;
        const mouseFactor = Math.max(0, 1 - dMouse / 260);

        // Draw node dot
        ctx.save();
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.glowColor;
        ctx.shadowBlur = (8 + mouseFactor * 16);
        ctx.globalAlpha = Math.min(1, n.baseAlpha + mouseFactor * 0.5);

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + mouseFactor * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Connect nearby nodes with synaptic network lines
      const maxConnDist = 135;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);

          if (dist < maxConnDist) {
            const alpha = (1 - dist / maxConnDist) * 0.22;
            ctx.save();
            ctx.strokeStyle = n1.color;
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
            ctx.restore();

            // Randomly spawn pulses
            if (Math.random() < 0.0008 && pulses.length < 15) {
              pulses.push({
                fromNode: i,
                toNode: j,
                progress: 0,
                speed: 0.015 + Math.random() * 0.02,
                color: n1.color,
              });
            }
          }
        }
      }

      // 3. Update & render traveling synaptic data pulses
      for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
        const p = pulses[pIdx];
        p.progress += p.speed;

        if (p.progress >= 1) {
          pulses.splice(pIdx, 1);
          continue;
        }

        const n1 = nodes[p.fromNode];
        const n2 = nodes[p.toNode];
        if (!n1 || !n2) continue;

        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. MOUSE ELECTRIC LIGHTNING CONNECTIONS (Matching User Requirement!)
      if (m.active && m.x > 0 && m.y > 0) {
        // Find 5 closest nodes to mouse
        const closeNodes: { idx: number; dist: number }[] = [];
        for (let i = 0; i < nodes.length; i++) {
          const d = Math.hypot(nodes[i].x - m.x, nodes[i].y - m.y);
          if (d < 280) {
            closeNodes.push({ idx: i, dist: d });
          }
        }

        closeNodes.sort((a, b) => a.dist - b.dist);
        const topArcs = closeNodes.slice(0, 5);

        // Draw crackling electrical lightning arcs to nearest nodes
        for (const arc of topArcs) {
          const target = nodes[arc.idx];
          const intensity = 1 - arc.dist / 280;

          // Electric bolt with flickering discharge
          if (Math.random() < 0.92) {
            drawLightning(m.x, m.y, target.x, target.y, target.color, intensity);
          }
        }

        // Draw glowing mouse plasma nexus halo
        ctx.save();
        const mouseGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 70);
        mouseGlow.addColorStop(0, "rgba(0, 240, 255, 0.45)");
        mouseGlow.addColorStop(0.3, "rgba(255, 215, 0, 0.2)");
        mouseGlow.addColorStop(0.7, "rgba(192, 132, 252, 0.1)");
        mouseGlow.addColorStop(1, "transparent");
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 70, 0, Math.PI * 2);
        ctx.fill();

        // Core bright spark
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 select-none"
      style={{
        background: "radial-gradient(ellipse 90% 70% at 50% 20%, #030e22 0%, #010612 60%, #000206 100%)",
      }}
    />
  );
});

export default NeuralLightningBackdrop;
