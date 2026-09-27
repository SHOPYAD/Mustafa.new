"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useSecondBrainStore } from "../store/useSecondBrainStore";
import {
  Menu,
  Activity,
  Sliders,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";

// Generate regular hexagon SVG points
function getHexPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return points.join(" ");
}

// Generate realistic jagged lightning bolt path with fractal displacement
function generateLightningPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  displace: number = 18,
  segments: number = 8
): { mainPath: string; branchPaths: string[] } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / dist;
  const ny = dx / dist;

  const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];
  const branches: string[] = [];

  for (let i = 1; i < segments; i++) {
    const frac = i / segments;
    const envelope = Math.sin(frac * Math.PI);
    const offset = (Math.random() - 0.5) * 2 * displace * envelope;

    const px = x1 + dx * frac + nx * offset;
    const py = y1 + dy * frac + ny * offset;
    points.push({ x: px, y: py });

    // Multi-branch sparks branching off
    if (i === 3 || i === 5) {
      const bLen = 20 + Math.random() * 20;
      const bAngle = (Math.random() - 0.5) * 1.4;
      const bdx = Math.cos(bAngle) * nx - Math.sin(bAngle) * ny;
      const bdy = Math.sin(bAngle) * nx + Math.cos(bAngle) * ny;
      const bx = px + bdx * bLen;
      const by = py + bdy * bLen;
      branches.push(`M ${px.toFixed(1)} ${py.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)}`);
    }
  }
  points.push({ x: x2, y: y2 });

  const mainPath = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");

  return { mainPath, branchPaths: branches };
}

export default function HexagonalConstellationView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nebulaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const galaxyCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 1300, height: 750 });
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [lightningTick, setLightningTick] = useState(0);

  // HUD Tunings matching Mockup 1
  const [slider1, setSlider1] = useState(160);
  const [slider2, setSlider2] = useState(158);
  const [slider3, setSlider3] = useState(199);
  const [powerOn, setPowerOn] = useState(true);
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);
  const [activeTheme, setActiveTheme] = useState<"Cyber Teal" | "Amber Alert" | "Deep Space">("Cyber Teal");

  const {
    selectedClusterId,
    selectCluster,
    openInspectorWithSubModule,
  } = useSecondBrainStore();

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 1300,
          height: containerRef.current.clientHeight || 750,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lightning pulse loop (updates every 100ms for authentic electric flicker)
  useEffect(() => {
    const interval = setInterval(() => {
      setLightningTick((t) => (t + 1) % 1000);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const { width, height } = dimensions;
  const stageWidth = Math.max(680, width - 350);
  const cx = stageWidth / 2;
  const cy = height / 2;

  // The 8 Hexagonal Constellation Nodes matching Mockup 1 exactly
  // Vertically scaled so top and bottom nodes NEVER get clipped
  const constellationNodes = useMemo(() => {
    const scale = Math.min(stageWidth / 960, height / 760);

    return [
      {
        id: "cluster-hotels",
        subSlug: "hotels",
        en: "BedBanks",
        ar: "بنوك الأسرة",
        x: cx + 15 * scale,
        y: cy - 215 * scale,
        radius: 72 * scale,
        isPrimary: true,
      },
      {
        id: "cluster-treasury",
        subSlug: "payments",
        en: "Fintech Treasury",
        ar: "خزانة التكنولوجيا المالية",
        x: cx + 225 * scale,
        y: cy - 105 * scale,
        radius: 72 * scale,
        isPrimary: true,
      },
      {
        id: "cluster-b2b",
        subSlug: "resale",
        en: "B2B Wholesalers",
        ar: "شبكة الموزعين والجملة",
        x: cx + 245 * scale,
        y: cy + 75 * scale,
        radius: 68 * scale,
        isPrimary: false,
      },
      {
        id: "cluster-security",
        subSlug: "license",
        en: "Cyber Security",
        ar: "الأمن السيبراني",
        x: cx + 180 * scale,
        y: cy + 205 * scale,
        radius: 72 * scale,
        isPrimary: true,
      },
      {
        id: "cluster-swarm",
        subSlug: "agent-war-room",
        en: "AI Swarm",
        ar: "سرب الذكاء الاصطناعي",
        x: cx - 15 * scale,
        y: cy + 225 * scale,
        radius: 72 * scale,
        isPrimary: true,
      },
      {
        id: "cluster-transfers",
        subSlug: "cars",
        en: "VIP Fleet",
        ar: "أسطول كبار الشخصيات",
        x: cx - 215 * scale,
        y: cy + 120 * scale,
        radius: 72 * scale,
        isPrimary: true,
      },
      {
        id: "cluster-flights",
        subSlug: "flights",
        en: "Aviation GDS",
        ar: "نظام التوزيع العالمي للطيران",
        x: cx - 225 * scale,
        y: cy - 120 * scale,
        radius: 72 * scale,
        isPrimary: true,
      },
      {
        id: "cluster-packages",
        subSlug: "packages",
        en: "Tours & Visas",
        ar: "الجولات والباقات",
        x: cx - 340 * scale,
        y: cy - 5 * scale,
        radius: 64 * scale,
        isPrimary: false,
      },
    ];
  }, [cx, cy, stageWidth, height]);

  // Precompute dynamic lightning bolts connecting Nexus Core to all 8 nodes
  const lightningBolts = useMemo(() => {
    return constellationNodes.map((node) => {
      const dx = node.x - cx;
      const dy = node.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const startX = cx + (dx / dist) * 115;
      const startY = cy + (dy / dist) * 115;
      const endX = node.x - (dx / dist) * (node.radius - 4);
      const endY = node.y - (dy / dist) * (node.radius - 4);

      return {
        id: node.id,
        ...generateLightningPath(startX, startY, endX, endY, 16, 8),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cx, cy, constellationNodes, lightningTick]);

  // 1. High-Density Volumetric Particle Nebula Canvas (Flowing cyan stardust filaments)
  useEffect(() => {
    const canvas = nebulaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const particleCount = 400;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * (canvas.width * 0.45),
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.15) * 0.35,
      speedY: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.7 + 0.2,
      glow: Math.random() > 0.6 ? 8 : 2,
      color: Math.random() > 0.4 ? "#00e5ff" : Math.random() > 0.3 ? "#38bdf8" : "#ffffff",
    }));

    const renderNebula = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;

      // Volumetric organic curved stardust filament waves
      for (let s = 0; s < 4; s++) {
        ctx.beginPath();
        const steps = 30;
        for (let i = 0; i <= steps; i++) {
          const frac = i / steps;
          const px = frac * (canvas.width * 0.5) + Math.sin(t * 1.5 + frac * 4 + s) * 25;
          const py =
            canvas.height * (0.85 - frac * 0.75 + s * 0.06) +
            Math.sin(frac * 8 + t) * 20;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.16 - s * 0.03})`;
        ctx.lineWidth = 2.0;
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 10;
        ctx.stroke();
      }

      // Update and draw floating stardust particles
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width * 0.45;
        if (p.x > canvas.width * 0.45) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t * 2.5 + p.x));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.glow;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(renderNebula);
    };

    renderNebula();
    return () => cancelAnimationFrame(animId);
  }, [width, height]);

  // 2. High-Performance Logarithmic Galaxy Spiral Renderer for all Hexagons
  useEffect(() => {
    const canvas = galaxyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let rotationAngle = 0;

    const renderGalaxies = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotationAngle += 0.007;

      const arms = 4;
      const starsPerArm = 70;

      for (const node of constellationNodes) {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const px = node.x + (node.radius - 3) * Math.cos(a);
          const py = node.y + (node.radius - 3) * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.clip();

        // Deep galactic void background
        ctx.fillStyle = "#010714";
        ctx.fill();

        // Intense glowing galactic core
        const coreGrad = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 0.75
        );
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        coreGrad.addColorStop(0.12, "rgba(0, 229, 255, 0.85)");
        coreGrad.addColorStop(0.35, "rgba(2, 132, 199, 0.45)");
        coreGrad.addColorStop(0.7, "rgba(3, 20, 48, 0.2)");
        coreGrad.addColorStop(1, "transparent");

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Logarithmic spiral arms (r = a * e^(0.22 * theta))
        for (let a = 0; a < arms; a++) {
          const armOffset = (a * 2 * Math.PI) / arms;
          for (let s = 0; s < starsPerArm; s++) {
            const frac = s / starsPerArm;
            // Logarithmic spiral formula
            const dist = 4 + Math.pow(frac, 1.25) * (node.radius * 0.82);
            const theta = armOffset + rotationAngle + frac * 3.4;

            // Random spread perpendicular to the arm
            const spread = (Math.sin(s * 77 + a) * 0.12) * dist;
            const sx = node.x + Math.cos(theta) * dist + Math.sin(theta) * spread;
            const sy = node.y + Math.sin(theta) * dist - Math.cos(theta) * spread;

            const size = frac < 0.12 ? 2.4 : frac < 0.35 ? 1.6 : 0.95;
            const starColor =
              frac < 0.1
                ? "#ffffff"
                : s % 5 === 0
                ? "#f59e0b"
                : s % 2 === 0
                ? "#00e5ff"
                : "#7dd3fc";

            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fillStyle = starColor;
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(rotationAngle * 4 + s);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1.0;
        ctx.restore();
      }

      animId = requestAnimationFrame(renderGalaxies);
    };

    renderGalaxies();
    return () => cancelAnimationFrame(animId);
  }, [width, height, constellationNodes]);

  return (
    <div
      ref={containerRef}
      dir="ltr"
      style={{ direction: "ltr", textAlign: "left" }}
      className="relative w-full h-full max-h-full flex overflow-hidden select-none font-sans bg-[#010813]"
    >
      {/* ========================================================================= */}
      {/* 1. LEFT VOLUMETRIC STARDUST NEBULA CANVAS                                  */}
      {/* ========================================================================= */}
      <canvas
        ref={nebulaCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* ========================================================================= */}
      {/* 2. LOGARITHMIC SPIRAL GALAXY CANVAS (Renders inside all hexagons)          */}
      {/* ========================================================================= */}
      <canvas
        ref={galaxyCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* ========================================================================= */}
      {/* 3. MAIN INTERACTIVE SVG STAGE                                             */}
      {/* ========================================================================= */}
      <div className="relative flex-1 h-full min-h-0 overflow-hidden">
        {/* Top-Left Title Badge matching Mockup 1 */}
        <div className="absolute top-4 left-6 z-30 flex items-center gap-3 pointer-events-none">
          <div className="size-9 rounded-2xl bg-cyan-950/70 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <Sparkles className="size-5 text-cyan-300 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white tracking-wide drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
              &apos;Sovereign Cyber OS&apos; Second Brain
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80">
              Photo-realistic high-tech dashboard
            </span>
          </div>
        </div>

        <svg
          width={stageWidth}
          height={height}
          className="absolute inset-0 pointer-events-auto z-20"
        >
          <defs>
            <filter id="hex-intense-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="lightning-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="nexus-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="nexus-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* ------------------------------------------------------------- */}
          {/* A. Organic Plasma Lightning Arcs Leaping to Hexagons          */}
          {/* ------------------------------------------------------------- */}
          {lightningBolts.map((bolt) => (
            <g key={bolt.id} className="pointer-events-none">
              {/* Outer Cyan Plasma Glow */}
              <path
                d={bolt.mainPath}
                fill="none"
                stroke="#00e5ff"
                strokeWidth="3.2"
                strokeOpacity="0.45"
                filter="url(#lightning-glow)"
              />
              {/* Inner Bright White Core */}
              <path
                d={bolt.mainPath}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeOpacity="0.9"
              />
              {/* Branch Sparks */}
              {bolt.branchPaths.map((bp, bIdx) => (
                <path
                  key={bIdx}
                  d={bp}
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="1.0"
                  strokeOpacity="0.6"
                />
              ))}
            </g>
          ))}

          {/* ------------------------------------------------------------- */}
          {/* B. Central Multi-Layered Nexus Core Hologram                  */}
          {/* ------------------------------------------------------------- */}
          <g className="cursor-pointer" onClick={() => selectCluster("cluster-flights")}>
            {/* Outer Segmented Golden Ticks Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={124}
              fill="none"
              stroke="url(#nexus-gold-grad)"
              strokeWidth="3.5"
              strokeDasharray="18 14 36 14"
              filter="url(#hex-intense-glow)"
              className="origin-center animate-[spin_50s_linear_infinite]"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Middle Segmented Cyan Arc Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={104}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.8"
              strokeDasharray="45 15 20 15"
              strokeOpacity="0.9"
              className="origin-center animate-[spin_30s_linear_infinite_reverse]"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Inner Glowing Cyan Border Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={86}
              fill="#011024"
              stroke="#00e5ff"
              strokeWidth="3"
              filter="url(#hex-intense-glow)"
            />

            {/* Inner Core Gradient Sphere */}
            <circle
              cx={cx}
              cy={cy}
              r={72}
              fill="radial-gradient(circle, rgba(0,229,255,0.4) 0%, rgba(1,16,36,0.95) 75%)"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />

            {/* Center Pulsing Blinding Singularity */}
            <circle
              cx={cx}
              cy={cy}
              r={24}
              fill="#00e5ff"
              fillOpacity="0.3"
              className="animate-ping"
            />
            <circle cx={cx} cy={cy} r={8} fill="#ffffff" filter="url(#hex-intense-glow)" />

            {/* Nexus Core Typography matching Mockup 1 */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="16"
              fontWeight="900"
              letterSpacing="2"
              className="drop-shadow-[0_0_8px_#00e5ff]"
            >
              Nexus
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fill="#00e5ff"
              fontSize="14"
              fontWeight="800"
              letterSpacing="2"
              className="drop-shadow-[0_0_8px_#00e5ff]"
            >
              Core
            </text>
          </g>

          {/* ------------------------------------------------------------- */}
          {/* C. The 8 Hexagonal Constellation Enclosures                   */}
          {/* ------------------------------------------------------------- */}
          {constellationNodes.map((node) => {
            const isHovered = hoveredClusterId === node.id;
            const isSelected = selectedClusterId === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-all duration-300 group"
                onMouseEnter={() => setHoveredClusterId(node.id)}
                onMouseLeave={() => setHoveredClusterId(null)}
                onClick={() => {
                  selectCluster(node.id);
                  if (node.subSlug) openInspectorWithSubModule(`sub-${node.subSlug}-core`);
                }}
              >
                {/* Outer Chamfer Cyan Border */}
                <polygon
                  points={getHexPoints(node.x, node.y, node.radius + 3)}
                  fill="none"
                  stroke={isSelected ? "#ffffff" : isHovered ? "#38bdf8" : "rgba(0, 229, 255, 0.4)"}
                  strokeWidth="1.5"
                  strokeDasharray={node.isPrimary ? "none" : "6 4"}
                />

                {/* Main Neon Hexagon Frame */}
                <polygon
                  points={getHexPoints(node.x, node.y, node.radius)}
                  fill="none"
                  stroke={isSelected ? "#00e5ff" : isHovered ? "#38bdf8" : "#00e5ff"}
                  strokeWidth={isSelected ? "3" : isHovered ? "2.5" : "2"}
                  filter={isSelected || isHovered ? "url(#hex-intense-glow)" : "none"}
                />

                {/* Inner Bevel Border */}
                <polygon
                  points={getHexPoints(node.x, node.y, node.radius - 5)}
                  fill="none"
                  stroke="rgba(0, 229, 255, 0.25)"
                  strokeWidth="1.0"
                />

                {/* Corner Cyber Brackets */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (Math.PI / 3) * i - Math.PI / 6;
                  const bx = node.x + (node.radius + 5) * Math.cos(angle);
                  const by = node.y + (node.radius + 5) * Math.sin(angle);
                  return (
                    <circle
                      key={i}
                      cx={bx}
                      cy={by}
                      r={1.8}
                      fill="#00e5ff"
                      opacity={isSelected || isHovered ? 1 : 0.6}
                    />
                  );
                })}

                {/* Node Typography matching Mockup 1 (Top or Bottom based on Y) */}
                <g>
                  {node.y < cy ? (
                    // Labels Above Hexagon
                    <>
                      <text
                        x={node.x}
                        y={node.y - node.radius - 22}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                        letterSpacing="1"
                        className="group-hover:fill-cyan-300 transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                      >
                        {node.en}
                      </text>
                      <text
                        x={node.x}
                        y={node.y - node.radius - 8}
                        textAnchor="middle"
                        fill="#00e5ff"
                        fontSize="11"
                        fontFamily="sans-serif"
                        className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                      >
                        {node.ar}
                      </text>
                    </>
                  ) : (
                    // Labels Below Hexagon
                    <>
                      <text
                        x={node.x}
                        y={node.y + node.radius + 18}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                        letterSpacing="1"
                        className="group-hover:fill-cyan-300 transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                      >
                        {node.en}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + node.radius + 32}
                        textAnchor="middle"
                        fill="#00e5ff"
                        fontSize="11"
                        fontFamily="sans-serif"
                        className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                      >
                        {node.ar}
                      </text>
                    </>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 4. RIGHT SMART CONTROL MATRIX PANEL (MOCKUP 1 100% REPLICA)                */}
      {/* ========================================================================= */}
      <div className="w-[330px] shrink-0 h-full p-3 flex flex-col gap-2.5 z-40 overflow-y-auto text-left border-l border-cyan-500/30 bg-[#010916]/95 backdrop-blur-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.8)]">
        {/* Panel Container matching Mockup 1 Tablet HUD */}
        <div className="bg-[#020e22]/90 border border-cyan-500/40 rounded-2xl p-3.5 flex flex-col gap-3 shadow-2xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/25">
            <div className="flex items-center gap-2">
              <Menu size={16} className="text-cyan-400" />
              <span className="text-xs font-mono font-black text-white tracking-wider">
                CONTROL MATRIX
              </span>
            </div>
            {/* ON Toggle Button */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">ON</span>
              <button
                type="button"
                onClick={() => setPowerOn(!powerOn)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  powerOn ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`size-4 rounded-full bg-white transition-transform ${
                    powerOn ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mini Soundwave Spectrum Analyzer matching Mockup 1 */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#010612] border border-cyan-500/30">
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300">
              <Activity size={13} className="text-cyan-400 animate-pulse" />
              <span>97,599</span>
            </div>

            {/* 10 Dancing Vertical Bars */}
            <div className="flex items-end gap-1 h-5 px-2">
              {[40, 70, 95, 60, 100, 85, 50, 90, 75, 45].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1 bg-cyan-400 rounded-full shadow-[0_0_6px_#00e5ff]"
                />
              ))}
            </div>

            <span className="text-[11px] font-mono font-bold text-amber-400">16.50</span>
          </div>

          {/* Sliders matching Mockup 1 */}
          <div className="flex flex-col gap-2.5">
            {/* Slider 1 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-300">
                <span className="tracking-wider">FIELD INTENSITY</span>
                <span className="text-cyan-400 font-bold">{slider1}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={slider1}
                onChange={(e) => setSlider1(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Slider 2 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-300">
                <span className="tracking-wider">PLASMA COHERENCE</span>
                <span className="text-cyan-400 font-bold">{slider2}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={slider2}
                onChange={(e) => setSlider2(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Slider 3 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-300">
                <span className="tracking-wider">ORBIT DISTANCE</span>
                <span className="text-cyan-400 font-bold">{slider3}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={slider3}
                onChange={(e) => setSlider3(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-slate-400">COHERENCE LOCK</span>
            <button
              type="button"
              onClick={() => setToggleA(!toggleA)}
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                toggleA ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`size-3 rounded-full bg-white transition-transform ${
                  toggleA ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Data Readouts Mini-Table matching Mockup 1 */}
          <div className="p-2 rounded-xl bg-[#01050e] border border-cyan-500/20 flex flex-col gap-1 text-[9px] font-mono">
            <div className="flex justify-between text-slate-400 pb-0.5 border-b border-slate-800">
              <span>NEWS / DATA</span>
              <span>TELEMETRY</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>103.1956</span>
              <span className="text-cyan-400">1.00</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>106.5009</span>
              <span className="text-amber-400">0.30</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>207.874</span>
              <span className="text-emerald-400">13.590</span>
            </div>
          </div>

          {/* Color Theme Selector matching Mockup 1 */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              COLOR THEME PALETTES
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "Cyber Teal",
                  bg: "from-cyan-500 to-teal-700",
                  border: "border-cyan-400",
                },
                {
                  id: "Amber Alert",
                  bg: "from-amber-500 to-orange-700",
                  border: "border-amber-400",
                },
                {
                  id: "Deep Space",
                  bg: "from-indigo-600 to-purple-800",
                  border: "border-purple-400",
                },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => setActiveTheme(th.id as any)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                    activeTheme === th.id
                      ? `${th.border} bg-cyan-950/40 shadow-[0_0_10px_rgba(0,229,255,0.4)]`
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`w-full h-4 rounded-lg bg-gradient-to-r ${th.bg}`}
                  />
                  <span className="text-[8px] font-mono font-bold text-slate-300">
                    {th.id}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Clock & State Code matching Mockup 1 */}
          <div className="flex items-center justify-between pt-1 border-t border-cyan-500/20 text-[10px] font-mono">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[8px]">TEMPOSES</span>
              <span className="text-white font-bold">17:58 T2</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[8px]">STATIC CODE</span>
              <span className="text-cyan-400 font-bold">80.132</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
