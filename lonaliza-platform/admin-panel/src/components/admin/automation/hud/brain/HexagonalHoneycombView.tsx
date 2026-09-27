"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  generateHoneycombSectors,
  isPointInPolygon,
  HexCellConfig,
  Point2D,
} from "../math/hex-math";
import type { BrainSector, BrainNode } from "@/app/api/admin/automation/second-brain-data/route";
import { Sparkles, Database, Layers, ArrowUpRight } from "lucide-react";

interface HexagonalHoneycombViewProps {
  sectors: BrainSector[];
  nodes: BrainNode[];
  onSelectNode?: (node: BrainNode) => void;
  onSelectSector?: (sector: BrainSector) => void;
}

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  sectorId: string;
}

export default function HexagonalHoneycombView({
  sectors,
  nodes,
  onSelectNode,
  onSelectSector,
}: HexagonalHoneycombViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 650,
  });
  const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 900,
          height: containerRef.current.clientHeight || 650,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = dimensions;
  const cx = width / 2;
  const cy = height / 2;

  // Responsive radius calculation
  const centerRadius = Math.min(width, height) * 0.16;
  const sectorRadius = Math.min(width, height) * 0.13;
  const gap = 20;

  const { coreCell, sectors: hexSectors } = generateHoneycombSectors(
    cx,
    cy,
    centerRadius,
    sectorRadius,
    gap
  );

  // Render floating stars inside each hexagon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    // Generate 15 particles per sector
    const particles: StarParticle[] = [];
    hexSectors.forEach((sector) => {
      for (let i = 0; i < 14; i++) {
        // Random point near sector center
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (sector.radius * 0.75);
        const p: Point2D = {
          x: sector.center.x + dist * Math.cos(angle),
          y: sector.center.y + dist * Math.sin(angle),
        };

        if (isPointInPolygon(p, sector.vertices)) {
          particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2 + 1.2,
            alpha: Math.random() * 0.7 + 0.3,
            sectorId: sector.id,
          });
        }
      }
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particles
      particles.forEach((p) => {
        const sector = hexSectors.find((s) => s.id === p.sectorId);
        if (!sector) return;

        p.x += p.vx;
        p.y += p.vy;

        // Bounce inside hex boundaries
        if (!isPointInPolygon({ x: p.x, y: p.y }, sector.vertices)) {
          p.vx = -p.vx;
          p.vy = -p.vy;
          p.x += p.vx * 2;
          p.y += p.vy * 2;
        }

        ctx.fillStyle = sector.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [width, height, hexSectors]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[620px] flex items-center justify-center overflow-hidden bg-[#020813] select-none"
    >
      {/* Background canvas for vector star particles */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* SVG Layer for Hexagonal Bento Frames */}
      <svg
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full z-20 pointer-events-none"
      >
        <defs>
          <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Central Core Hexagon */}
        <path
          d={coreCell.svgPath}
          fill="url(#core-glow)"
          stroke="#00e5ff"
          strokeWidth="2"
          className="filter drop-shadow-[0_0_15px_#00e5ff]"
        />

        {/* Connecting Laser Beams from Core to 6 Sectors */}
        {hexSectors.map((sector) => (
          <line
            key={`beam-${sector.id}`}
            x1={cx}
            y1={cy}
            x2={sector.center.x}
            y2={sector.center.y}
            stroke={sector.color}
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.4"
          />
        ))}

        {/* 6 Peripheral Hexagons */}
        {hexSectors.map((sector) => {
          const isHovered = hoveredSectorId === sector.id;

          return (
            <path
              key={`hex-${sector.id}`}
              d={sector.svgPath}
              fill={`${sector.color}0a`}
              stroke={sector.color}
              strokeWidth={isHovered ? 2.5 : 1.2}
              strokeOpacity={isHovered ? 0.9 : 0.45}
              className="transition-all duration-300"
              style={{
                filter: isHovered ? `drop-shadow(0 0 12px ${sector.color})` : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Interactive HTML Overlay for Labels and Click Targets */}
      <div className="absolute inset-0 z-30 pointer-events-auto">
        {/* Core Center Label */}
        <div
          style={{
            position: "absolute",
            left: `${cx}px`,
            top: `${cy}px`,
            transform: "translate(-50%, -50%)",
          }}
          className="flex flex-col items-center justify-center text-center p-3 pointer-events-auto cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full border border-cyan-400 bg-cyan-950/60 flex items-center justify-center mb-1 shadow-[0_0_15px_#00e5ff]">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-spin-slow" />
          </div>
          <span className="text-xs font-bold text-cyan-200 font-mono tracking-wider">
            النواة السيادية
          </span>
          <span className="text-[10px] text-cyan-400/80 font-mono">
            Qdrant: 259 متجه
          </span>
        </div>

        {/* Sector Labels */}
        {hexSectors.map((sector) => {
          const backendSector = sectors.find((s) => s.id === sector.id);
          const sectorNodes = nodes.filter((n) => n.sectorId === sector.id);

          return (
            <div
              key={`label-${sector.id}`}
              onMouseEnter={() => setHoveredSectorId(sector.id)}
              onMouseLeave={() => setHoveredSectorId(null)}
              onClick={() => {
                if (backendSector && onSelectSector) onSelectSector(backendSector);
                if (sectorNodes.length > 0 && onSelectNode) onSelectNode(sectorNodes[0]);
              }}
              style={{
                position: "absolute",
                left: `${sector.center.x}px`,
                top: `${sector.center.y}px`,
                transform: "translate(-50%, -50%)",
                width: `${sector.radius * 1.5}px`,
              }}
              className="flex flex-col items-center justify-center text-center p-2 rounded-xl transition-all duration-300 cursor-pointer group"
            >
              <span
                className="text-xs font-bold tracking-wide transition-colors group-hover:scale-105"
                style={{ color: sector.color }}
              >
                {sector.nameAr}
              </span>

              <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                {backendSector ? `${backendSector.pointsCount} متجه حي` : "متصل"}
              </span>

              {sectorNodes.length > 0 && (
                <span className="text-[9px] text-cyan-300 font-mono bg-[#03152d]/90 px-2 py-0.5 rounded border border-cyan-500/40 mt-1 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <span>[فحص المتجهات]</span>
                  <ArrowUpRight size={10} className="text-cyan-400" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
