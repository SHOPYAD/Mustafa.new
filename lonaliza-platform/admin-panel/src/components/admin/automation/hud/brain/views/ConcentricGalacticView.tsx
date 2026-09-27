"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useSecondBrainStore } from "../store/useSecondBrainStore";
import {
  FileText,
  CheckSquare,
  FolderGit2,
  BookOpen,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

interface RadialBranch {
  pathD: string;
  color: string;
  width: number;
  opacity: number;
  endX: number;
  endY: number;
  hasNode: boolean;
  nodeSize: number;
}

export default function ConcentricGalacticView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nebulaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 1300, height: 750 });
  const [dataDensity, setDataDensity] = useState(85);
  const [timeFilter, setTimeFilter] = useState(60);
  const [selectedThemeMode, setSelectedThemeMode] = useState<"NEON NOX" | "ASTRA BRIGHT" | "CYBERSPACE">("ASTRA BRIGHT");

  const {
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

  const { width, height } = dimensions;
  const stageWidth = Math.max(680, width - 350);
  const cx = stageWidth / 2;
  const cy = height / 2;

  // Concentric Orbit Radii
  const ring1 = Math.min(stageWidth, height) * 0.12;
  const ring2 = Math.min(stageWidth, height) * 0.19;
  const ring3 = Math.min(stageWidth, height) * 0.27;
  const ring4 = Math.min(stageWidth, height) * 0.35;
  const ring5 = Math.min(stageWidth, height) * 0.43;

  // Generate 360-Degree Full Dense Fractal Dendrites (Organic Curved Bézier Capillaries)
  const fractalBranches = useMemo(() => {
    const branches: RadialBranch[] = [];

    // Helper to generate an organic, curved fan of neural capillaries
    const createCurvedFan = (
      centerAngleDeg: number,
      spreadDeg: number,
      numTrunks: number,
      trunkColor: string,
      leafColor: string
    ) => {
      for (let i = 0; i < numTrunks; i++) {
        const frac = (i - (numTrunks - 1) / 2) / ((numTrunks - 1) / 2 || 1);
        const baseAngle = (centerAngleDeg + frac * spreadDeg * 0.5) * (Math.PI / 180);
        const curveOffset = Math.sin(frac * Math.PI) * 0.15;

        // Tier 1: Core -> Ring 1 to Ring 2
        const r0 = ring1 + 8;
        const r1 = ring2 + 4;
        const x0 = cx + Math.cos(baseAngle) * r0;
        const y0 = cy + Math.sin(baseAngle) * r0;
        const x1 = cx + Math.cos(baseAngle + curveOffset) * r1;
        const y1 = cy + Math.sin(baseAngle + curveOffset) * r1;

        // Control point for subtle natural arc
        const cpx1 = cx + Math.cos(baseAngle + curveOffset * 0.5) * ((r0 + r1) / 2);
        const cpy1 = cy + Math.sin(baseAngle + curveOffset * 0.5) * ((r0 + r1) / 2);

        branches.push({
          pathD: `M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${cpx1.toFixed(1)} ${cpy1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`,
          color: trunkColor,
          width: 2.2,
          opacity: 0.9,
          endX: x1,
          endY: y1,
          hasNode: false,
          nodeSize: 0,
        });

        // Tier 2: 3 Sub-Branches radiating to Ring 3
        for (let s = -1; s <= 1; s++) {
          const sAngle = baseAngle + curveOffset + s * 0.16;
          const r2 = ring3 + 6;
          const x2 = cx + Math.cos(sAngle) * r2;
          const y2 = cy + Math.sin(sAngle) * r2;

          const cpx2 = (x1 + x2) / 2 + Math.sin(sAngle) * 7;
          const cpy2 = (y1 + y2) / 2 - Math.cos(sAngle) * 7;

          branches.push({
            pathD: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cpx2.toFixed(1)} ${cpy2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
            color: trunkColor,
            width: 1.5,
            opacity: 0.75,
            endX: x2,
            endY: y2,
            hasNode: false,
            nodeSize: 0,
          });

          // Tier 3: 2 Fine Capillaries radiating to Ring 4
          for (let t = -1; t <= 1; t += 2) {
            const tAngle = sAngle + t * 0.12;
            const r3 = ring4 + 8;
            const x3 = cx + Math.cos(tAngle) * r3;
            const y3 = cy + Math.sin(tAngle) * r3;

            const cpx3 = (x2 + x3) / 2;
            const cpy3 = (y2 + y3) / 2;

            branches.push({
              pathD: `M ${x2.toFixed(1)} ${y2.toFixed(1)} Q ${cpx3.toFixed(1)} ${cpy3.toFixed(1)} ${x3.toFixed(1)} ${y3.toFixed(1)}`,
              color: leafColor,
              width: 1.0,
              opacity: 0.65,
              endX: x3,
              endY: y3,
              hasNode: true,
              nodeSize: 2.2,
            });

            // Tier 4: Terminal Fine Micro-Capillaries to Ring 5
            const r4 = ring5 + 4;
            const x4 = cx + Math.cos(tAngle + 0.04) * r4;
            const y4 = cy + Math.sin(tAngle + 0.04) * r4;

            branches.push({
              pathD: `M ${x3.toFixed(1)} ${y3.toFixed(1)} L ${x4.toFixed(1)} ${y4.toFixed(1)}`,
              color: leafColor,
              width: 0.7,
              opacity: 0.5,
              endX: x4,
              endY: y4,
              hasNode: true,
              nodeSize: 1.6,
            });
          }
        }
      }
    };

    // Full 360-Degree Continuous Coverage matching Mockup 2
    // 1. Top-Left & Left Amber/Gold (Projects, Treasury & Fleet)
    createCurvedFan(-145, 45, 9, "#f59e0b", "#fbbf24");
    createCurvedFan(-105, 35, 7, "#eab308", "#fde047");
    // 2. Top & Top-Right Electric Cyan (Aviation GDS & BedBanks Knowledge)
    createCurvedFan(-65, 45, 10, "#00e5ff", "#38bdf8");
    createCurvedFan(-20, 45, 9, "#06b6d4", "#22d3ee");
    // 3. Right & Bottom-Right Neon Magenta (Reseller Network & CRM)
    createCurvedFan(25, 45, 9, "#d946ef", "#f472b6");
    createCurvedFan(70, 45, 8, "#a855f7", "#c084fc");
    // 4. Bottom Emerald Green (Strategic Objectives & Core Citadel)
    createCurvedFan(115, 45, 8, "#10b981", "#34d399");
    createCurvedFan(160, 45, 8, "#059669", "#10b981");
    // 5. Far Left Blue/Cyan (Real-time Telemetry & Deep Analysis)
    createCurvedFan(205, 45, 8, "#0284c7", "#38bdf8");

    return branches;
  }, [cx, cy, ring1, ring2, ring3, ring4, ring5]);

  // Deep Space Cosmic Canvas
  useEffect(() => {
    const canvas = nebulaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const stars = Array.from({ length: 400 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.0 + 0.4,
      alpha: Math.random() * 0.75 + 0.25,
      color: Math.random() > 0.4 ? "#ffffff" : Math.random() > 0.5 ? "#00e5ff" : "#f59e0b",
      speed: Math.random() * 0.02 + 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;

      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha * (0.65 + 0.35 * Math.sin(t * s.speed * 70 + s.x));
        ctx.shadowColor = s.color;
        ctx.shadowBlur = s.r > 1.4 ? 4 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      dir="ltr"
      style={{ direction: "ltr", textAlign: "left" }}
      className="relative w-full h-full max-h-full flex overflow-hidden select-none font-sans bg-[#01060f]"
    >
      {/* 1. Deep Space Cosmic Background Canvas */}
      <canvas
        ref={nebulaCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* 2. Central Galactic Stage */}
      <div className="relative flex-1 h-full min-h-0 overflow-hidden">
        {/* Top-Left Header matching Mockup 2 */}
        <div className="absolute top-4 left-6 z-30 pointer-events-none flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white tracking-widest">
              TRACKTOR
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              SEGUNDO CÉREBRO
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">
            CIRCULAR COMMAND MODE
          </span>
        </div>

        {/* Top-Right Title matching Mockup 2 */}
        <div className="absolute top-4 right-6 z-30 pointer-events-none flex flex-col items-end">
          <span className="text-sm font-bold text-white tracking-wide">
            خريطة المعرفة الجالاكتيكية
          </span>
          <span className="text-[10px] font-mono text-cyan-400 tracking-widest">
            GALACTIC KNOWLEDGE MAP
          </span>
        </div>

        {/* SVG Orbital Tree & Hypercore */}
        <svg
          width={stageWidth}
          height={height}
          className="absolute inset-0 pointer-events-auto z-20"
        >
          <defs>
            <filter id="sunburst-intense-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ------------------------------------------------------------- */}
          {/* Orbital Guide Rings with Fine Tick Markers                    */}
          {/* ------------------------------------------------------------- */}
          {[ring1, ring2, ring3, ring4, ring5].map((r, idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#00e5ff"
              strokeWidth={idx === 0 ? "2.5" : idx === 4 ? "1.8" : "1.0"}
              strokeDasharray={idx === 2 ? "12 8" : idx === 3 ? "24 12" : "none"}
              strokeOpacity={0.18 + idx * 0.05}
            />
          ))}

          {/* ------------------------------------------------------------- */}
          {/* 360-Degree Continuous Curved Fractal Dendrites                */}
          {/* ------------------------------------------------------------- */}
          {fractalBranches.map((br, bIdx) => (
            <g key={bIdx} className="pointer-events-none">
              <path
                d={br.pathD}
                fill="none"
                stroke={br.color}
                strokeWidth={br.width}
                strokeOpacity={br.opacity}
              />
              {br.hasNode && (
                <circle
                  cx={br.endX}
                  cy={br.endY}
                  r={br.nodeSize}
                  fill="#ffffff"
                  stroke={br.color}
                  strokeWidth="1.2"
                  filter="url(#sunburst-intense-glow)"
                />
              )}
            </g>
          ))}

          {/* ------------------------------------------------------------- */}
          {/* Central Luminous Hypercore with Double Infinity Torus Swirls */}
          {/* ------------------------------------------------------------- */}
          <g className="cursor-pointer" onClick={() => selectCluster("cluster-flights")}>
            {/* Outer Segmented Sunburst Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={ring1}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeDasharray="40 18 12 18"
              strokeOpacity="0.9"
              filter="url(#sunburst-intense-glow)"
              className="origin-center animate-[spin_40s_linear_infinite]"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            <circle
              cx={cx}
              cy={cy}
              r={ring1 - 16}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="3"
              strokeDasharray="20 12 50 12"
              strokeOpacity="0.85"
              filter="url(#sunburst-intense-glow)"
              className="origin-center animate-[spin_25s_linear_infinite_reverse]"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Core Solid Blue Disc */}
            <circle cx={cx} cy={cy} r={ring1 - 32} fill="#021226" stroke="#00e5ff" strokeWidth="2" />

            {/* Central Blinding White Singularity */}
            <circle cx={cx} cy={cy} r={14} fill="#ffffff" filter="url(#sunburst-intense-glow)" />

            {/* Double Torus Infinity Light Ribbons matching Mockup 2 */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={38}
              ry={20}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.5"
              transform={`rotate(-28 ${cx} ${cy})`}
              filter="url(#sunburst-intense-glow)"
            />
            <ellipse
              cx={cx}
              cy={cy}
              rx={38}
              ry={20}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              transform={`rotate(38 ${cx} ${cy})`}
              filter="url(#sunburst-intense-glow)"
            />

            {/* Central Typography matching Mockup 2 */}
            <text
              x={cx}
              y={cy - 44}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="13"
              fontWeight="bold"
              letterSpacing="1"
            >
              النواة الفائقة
            </text>
            <text
              x={cx}
              y={cy - 30}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="10"
              fontFamily="monospace"
            >
              (Hypercore)
            </text>
          </g>
        </svg>

        {/* ------------------------------------------------------------- */}
        {/* Planetary Spheres Orbiting Rings matching Mockup 2            */}
        {/* ------------------------------------------------------------- */}
        {/* A. Bottom-Left Knowledge Sphere (Banco de Conhecimento) */}
        <div
          style={{
            left: `${cx - ring4 * 0.72}px`,
            top: `${cy + ring3 * 1.15}px`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-auto cursor-pointer group flex flex-col items-center"
          onClick={() => {
            selectCluster("cluster-hotels");
            openInspectorWithSubModule("sub-hotels-main");
          }}
        >
          <div className="relative size-20 rounded-full border-2 border-cyan-400 bg-cyan-950/60 backdrop-blur-md shadow-[0_0_35px_rgba(0,229,255,0.7)] flex items-center justify-center overflow-hidden">
            {/* Miniature Golden Galaxy inside sphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.5)_0%,transparent_70%)] animate-pulse" />
            <div className="size-6 bg-white rounded-full shadow-[0_0_15px_#00e5ff]" />
          </div>
          <span className="text-[11px] font-black text-cyan-300 tracking-wider mt-2 group-hover:text-white">
            BANCO DE CONHECIMENTO
          </span>
          <span className="text-[10px] font-mono text-cyan-400">بنك المعرفة السيادي</span>
        </div>

        {/* B. Top-Left Analysis Sphere (Análise de Projetos) */}
        <div
          style={{
            left: `${cx - ring4 * 0.7}px`,
            top: `${cy - ring3 * 1.05}px`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-auto cursor-pointer group flex flex-col items-center"
          onClick={() => {
            selectCluster("cluster-treasury");
            openInspectorWithSubModule("sub-treasury-payments");
          }}
        >
          <div className="relative size-16 rounded-full border-2 border-amber-400 bg-amber-950/50 backdrop-blur-md shadow-[0_0_28px_rgba(245,158,11,0.6)] flex items-center justify-center">
            <div className="size-4 bg-white rounded-full shadow-[0_0_12px_#fbbf24]" />
          </div>
          <span className="text-[11px] font-black text-amber-300 tracking-wider mt-2 group-hover:text-white">
            ANÁLISE DE PROJETOS
          </span>
          <span className="text-[10px] font-mono text-amber-400">تحليل المشاريع</span>
        </div>

        {/* C. Bottom-Right Strategic Objectives Sphere */}
        <div
          style={{
            left: `${cx + ring4 * 0.65}px`,
            top: `${cy + ring3 * 1.05}px`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-auto cursor-pointer group flex flex-col items-center"
          onClick={() => {
            selectCluster("cluster-security");
            openInspectorWithSubModule("sub-sec-dashboard");
          }}
        >
          <div className="relative size-14 rounded-full border-2 border-emerald-400 bg-emerald-950/50 backdrop-blur-md shadow-[0_0_24px_rgba(16,185,129,0.6)] flex items-center justify-center">
            <div className="size-3.5 bg-white rounded-full shadow-[0_0_10px_#34d399]" />
          </div>
          <span className="text-[10px] font-black text-emerald-300 tracking-wider mt-2 group-hover:text-white">
            OBJETIVOS ESTRATÉGICOS
          </span>
          <span className="text-[9px] font-mono text-emerald-400">خريطة الأهداف</span>
        </div>

        {/* D. Bottom Purple Contacts Node */}
        <div
          style={{
            left: `${cx + ring3 * 0.3}px`,
            top: `${cy + ring4 * 0.95}px`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-auto cursor-pointer group flex flex-col items-center"
          onClick={() => {
            selectCluster("cluster-b2b");
            openInspectorWithSubModule("sub-b2b-resale");
          }}
        >
          <div className="relative size-10 rounded-full border-2 border-purple-400 bg-purple-950/50 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.6)] flex items-center justify-center">
            <div className="size-2.5 bg-white rounded-full shadow-[0_0_8px_#c084fc]" />
          </div>
          <span className="text-[9px] font-bold text-purple-300 tracking-wider mt-1 group-hover:text-white">
            REDES DE CONTATOS
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIGHT SMART CONTROL PANEL (FIXED 350px COLUMN - 100% IMMUNE TO CUT-OFF) */}
      {/* ========================================================================= */}
      <div className="w-[340px] shrink-0 h-full p-3.5 flex flex-col gap-3 z-40 overflow-y-auto text-left border-l border-cyan-500/30 bg-[#010917]/95 backdrop-blur-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.8)]">
        {/* Card 1: Sliders matching Mockup 2 */}
        <div className="bg-[#020e24]/95 border border-cyan-500/40 rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">لوحة التحكم الذكية</span>
            <span className="text-[10px] font-mono text-cyan-400">Smart Control Panel</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-300">
              <span>DENSIDADE DE DADOS</span>
              <span className="text-cyan-400 font-bold">{dataDensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={dataDensity}
              onChange={(e) => setDataDensity(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-300">
              <span>FILTRAGEM DE TEMPO</span>
              <span className="text-cyan-400 font-bold">{timeFilter}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={timeFilter}
              onChange={(e) => setTimeFilter(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Card 2: Quick Action Tiles & Theme Selector matching Mockup 2 */}
        <div className="bg-[#020e24]/95 border border-cyan-500/40 rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "anot", label: "ANOTAÇÕES", icon: FileText },
              { id: "taref", label: "TAREFAS", icon: CheckSquare },
              { id: "proj", label: "PROJETOS", icon: FolderGit2 },
              { id: "leit", label: "LEITURAS", icon: BookOpen },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-900/50 transition-all text-cyan-300"
              >
                <t.icon size={15} />
                <span className="text-[8px] font-mono font-bold mt-1 text-slate-300">
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-cyan-500/20">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              SELETOR DE TEMA
            </span>
            <div className="flex flex-col gap-1.5">
              {(["NEON NOX", "ASTRA BRIGHT", "CYBERSPACE"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedThemeMode(m)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold tracking-wider text-left transition-all ${
                    selectedThemeMode === m
                      ? "bg-cyan-500/20 border border-cyan-400 text-white shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                      : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Recent Connections matching Mockup 2 */}
        <div className="bg-[#020e24]/95 border border-cyan-500/40 rounded-2xl p-3.5 flex flex-col gap-2 shadow-xl flex-1">
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">
            CONEXÕES RECENTES
          </span>
          <div className="flex flex-col gap-1.5 text-[10px] font-mono max-h-40 overflow-y-auto pr-1">
            <div className="text-cyan-400 font-bold">TOPIC: ACCESSED (QDRANT_6333)</div>
            <div className="text-amber-400">RECENT CONNECTIONS: PKFARE_DIRECT</div>
            <div className="text-slate-300">TOPIC: RECENT HEADINGS</div>
            <div className="text-cyan-300">OBJETIVO ESTRATÉGICOS</div>
            <div className="text-emerald-400">TOPIC SYNCHRONIZING</div>
          </div>
        </div>
      </div>
    </div>
  );
}
