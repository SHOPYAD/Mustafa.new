"use client";
import { useEffect, useRef } from "react";
import { seededRandom } from "@/lib/neural-studio/workspace";
export default function NeuralField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const context = canvas.getContext("2d"); if (!context) return;
    const random = seededRandom(271828);
    const stars = Array.from({ length: 2300 }, () => ({ x: random(), y: random(), r: .25 + random() * 1.25, a: .15 + random() * .65 }));
    const draw = () => {
      const bounds = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = bounds.width * dpr; canvas.height = bounds.height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, bounds.width, bounds.height);
      const color = getComputedStyle(canvas).getPropertyValue("--ns-ion").trim() || "cyan";
      context.fillStyle = color; context.strokeStyle = color;
      for (const star of stars) {
        context.globalAlpha = star.a;
        context.beginPath(); context.arc(star.x * bounds.width, star.y * bounds.height, star.r, 0, Math.PI * 2); context.fill();
      }
      context.globalAlpha = .1; context.lineWidth = .6;
      const nodes = stars.slice(0, 120);
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        if (Math.hypot((a.x-b.x)*bounds.width, (a.y-b.y)*bounds.height) < 170) {
          context.beginPath(); context.moveTo(a.x*bounds.width, a.y*bounds.height);
          context.lineTo(b.x*bounds.width, b.y*bounds.height); context.stroke();
        }
      }
      context.globalAlpha = 1;
    };
    const observer = new ResizeObserver(draw); observer.observe(canvas); draw();
    return () => observer.disconnect();
  }, []);
  return <canvas ref={ref} className="ns-field" aria-hidden="true" />;
}
