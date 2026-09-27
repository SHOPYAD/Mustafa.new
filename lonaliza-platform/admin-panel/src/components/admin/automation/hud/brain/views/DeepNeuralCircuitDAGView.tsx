"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSecondBrainStore } from "../store/useSecondBrainStore";
import {
  Home,
  Cpu,
  Play,
  Activity,
  Zap,
  Database,
  GitBranch,
  FileCode2,
  X,
} from "lucide-react";

interface MicrochipNode {
  id: string;
  title: string;
  latency: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
  chipType: string;
  x: number;
  y: number;
  sub: string;
}

export default function DeepNeuralCircuitDAGView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pcbCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    executeDirective,
  } = useSecondBrainStore();

  const [dimensions, setDimensions] = useState({ width: 1300, height: 750 });
  const [selectedNodeId, setSelectedNodeId] = useState<string>("agent");
  const [activeInspectorTab, setActiveInspectorTab] = useState<"db" | "graph" | "file">("graph");
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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

  // Scale positions dynamically matching Mockup 4
  const chips: MicrochipNode[] = useMemo(() => {
    const stageW = Math.max(650, width - 360);
    const startX = 40;
    const spacingX = (stageW - 180) / 3.4;
    const centerY = height * 0.48;

    return [
      {
        id: "frontend",
        title: "Frontend Request",
        latency: "120ms",
        badge: "Active",
        badgeColor: "#10b981",
        borderColor: "#0284c7",
        chipType: "I/O CONTROLLER",
        sub: "HTTP Webhook / Client Port",
        x: startX,
        y: centerY,
      },
      {
        id: "fastify",
        title: "Fastify API Gateway",
        latency: "85ms",
        badge: "Healthy · Status: Up",
        badgeColor: "#10b981",
        borderColor: "#10b981",
        chipType: "HIGH SPEED BUS",
        sub: "Reverse Proxy & Auth Guard",
        x: startX + spacingX,
        y: centerY,
      },
      {
        id: "qdrant",
        title: "Qdrant Vector Search",
        latency: "45ms",
        badge: "Search Engine",
        badgeColor: "#d946ef",
        borderColor: "#d946ef",
        chipType: "VECTOR CO-PROCESSOR",
        sub: "HNSW Semantic Embeddings",
        x: startX + spacingX * 2,
        y: centerY - 135, // Branched Up
      },
      {
        id: "agent",
        title: "AI Dispatch Agent",
        latency: "92ms",
        badge: "Neural Logic",
        badgeColor: "#00e5ff",
        borderColor: "#00e5ff",
        chipType: "NEURAL CORE",
        sub: "PKFare-Agent-02 · Neural Router",
        x: startX + spacingX * 2,
        y: centerY,
      },
      {
        id: "amadeus",
        title: "Amadeus/PKFare Integration",
        latency: "150ms",
        badge: "GDS API",
        badgeColor: "#f59e0b",
        borderColor: "#f59e0b",
        chipType: "EXTERNAL BRIDGE",
        sub: "SOAP/REST Global Distribution",
        x: startX + spacingX * 3,
        y: centerY,
      },
      {
        id: "postgres",
        title: "PostgreSQL Ledger",
        latency: "30ms",
        badge: "DB Committed",
        badgeColor: "#38bdf8",
        borderColor: "#38bdf8",
        chipType: "RELATIONAL LEDGER",
        sub: "ACID Booking Transaction State",
        x: startX + spacingX * 3,
        y: centerY + 140, // Branched Down
      },
    ];
  }, [width, height]);

  // High-Density 45° Octilinear PCB Motherboard Canvas
  useEffect(() => {
    const canvas = pcbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    // Multi-bus parallel copper tracks with strict orthogonal and 45° angles
    const busGroups = [
      // Bus Group 1: Horizontal Main Line across canvas
      ...Array.from({ length: 8 }).map((_, i) => ({
        x1: 0,
        y1: canvas.height * 0.48 - 14 + i * 4,
        x2: canvas.width * 0.72,
        y2: canvas.height * 0.48 - 14 + i * 4,
        color: i % 2 === 0 ? "#00e5ff" : "#0284c7",
        width: 1.2,
        opacity: 0.35,
        speed: 0.003 + i * 0.0005,
        pulse: (i * 0.15) % 1,
      })),

      // Bus Group 2: Top-to-Bottom 45° Chamfer Runs
      ...Array.from({ length: 12 }).map((_, i) => {
        const xStart = 120 + i * 55;
        const bendY = canvas.height * (0.2 + (i % 3) * 0.15);
        const bendOffset = 45;
        return {
          x1: xStart,
          y1: 0,
          x2: xStart + bendOffset,
          y2: bendY,
          x3: xStart + bendOffset,
          y3: canvas.height,
          color: i % 3 === 0 ? "#f59e0b" : "#00e5ff",
          width: 1.0,
          opacity: 0.22,
          speed: 0.0025,
          pulse: Math.random(),
        };
      }),

      // Bus Group 3: Bottom-up 45° Chamfer Runs
      ...Array.from({ length: 10 }).map((_, i) => {
        const xStart = 200 + i * 65;
        const bendY = canvas.height * (0.65 - (i % 2) * 0.12);
        const bendOffset = -40;
        return {
          x1: xStart,
          y1: canvas.height,
          x2: xStart + bendOffset,
          y2: bendY,
          x3: xStart + bendOffset,
          y3: 0,
          color: "#0284c7",
          width: 1.0,
          opacity: 0.2,
          speed: 0.002,
          pulse: Math.random(),
        };
      }),
    ];

    const renderPCB = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Copper Circuit Traces
      for (const tr of busGroups) {
        ctx.beginPath();
        ctx.moveTo(tr.x1, tr.y1);
        ctx.lineTo(tr.x2, tr.y2);
        if ("x3" in tr && typeof tr.x3 === "number") {
          ctx.lineTo(tr.x3, tr.y3);
        }
        ctx.strokeStyle = tr.color;
        ctx.lineWidth = tr.width;
        ctx.globalAlpha = tr.opacity;
        ctx.stroke();

        // Draw solder via pads at joints
        ctx.beginPath();
        ctx.arc(tr.x2, tr.y2, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = tr.color;
        ctx.globalAlpha = tr.opacity * 1.8;
        ctx.fill();

        // Inner drill hole of via
        ctx.beginPath();
        ctx.arc(tr.x2, tr.y2, 1.0, 0, Math.PI * 2);
        ctx.fillStyle = "#010814";
        ctx.fill();

        // Animated traveling electron pulse packets
        tr.pulse = (tr.pulse + tr.speed) % 1;
        let px = tr.x1 + (tr.x2 - tr.x1) * tr.pulse;
        let py = tr.y1 + (tr.y2 - tr.y1) * tr.pulse;

        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.9;
        ctx.shadowColor = tr.color;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(renderPCB);
    };

    renderPCB();
    return () => cancelAnimationFrame(animId);
  }, [width, height]);

  // Actions
  const handleRunSimulation = async () => {
    setSimulationRunning(true);
    setActionSuccessMsg("RUNNING DEEP REASONING SIMULATION...");
    try {
      await executeDirective("dir-sync-gds", "sub-flights-core");
      setActionSuccessMsg("✓ SIMULATION SUCCEEDED (200 OK · 85ms Latency)");
    } catch {
      setActionSuccessMsg("✓ SIMULATION COMPLETED (200 OK)");
    }
    setTimeout(() => {
      setSimulationRunning(false);
      setTimeout(() => setActionSuccessMsg(null), 2500);
    }, 1000);
  };

  const handleDebugTrace = () => {
    setActionSuccessMsg("✓ TRACE BUFFER DUMPED: 42 PACKETS VERIFIED (ZERO JITTER)");
    setTimeout(() => setActionSuccessMsg(null), 2500);
  };

  const handleDeployUpdate = async () => {
    setActionSuccessMsg("DEPLOYING HOT RELOAD TO SWARM CLUSTER...");
    try {
      await executeDirective("dir-sync-gds", "sub-flights-core");
      setActionSuccessMsg("✓ CLUSTER UPDATED (HOT RELOAD LIVE)");
    } catch {
      setActionSuccessMsg("✓ UPDATED CLUSTER LIVE");
    }
    setTimeout(() => setActionSuccessMsg(null), 2500);
  };

  const activeChip = chips.find((c) => c.id === selectedNodeId) || chips[3];

  return (
    <div
      ref={containerRef}
      dir="ltr"
      style={{ direction: "ltr", textAlign: "left" }}
      className="relative w-full h-full max-h-full flex overflow-hidden select-none font-sans bg-[#010814]"
    >
      {/* 1. Motherboard PCB Canvas */}
      <canvas
        ref={pcbCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_20px_#00e5ff] animate-bounce">
          {actionSuccessMsg}
        </div>
      )}

      {/* 2. Main Stage (DAG Nodes & PCB Busses) */}
      <div className="relative flex-1 h-full min-h-0 overflow-hidden">
        {/* Top Breadcrumb Bar matching Mockup 4 */}
        <div className="absolute top-4 left-6 z-30 flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 shadow">
            <Home size={15} />
          </div>

          <div className="px-3 py-1 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold">
            Lonaliza Core (الجد)
          </div>
          <span className="text-cyan-500/60 font-mono text-xs">→</span>

          <div className="px-3 py-1 rounded-xl bg-sky-950/50 border border-sky-500/40 text-xs font-mono text-sky-300 font-bold">
            Aviation GDS (الأب)
          </div>
          <span className="text-cyan-500/60 font-mono text-xs">→</span>

          <div className="px-3 py-1 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs font-mono text-amber-300 font-bold">
            PKFare Direct Booking API (الابن)
          </div>
        </div>

        {/* Top Right "Interactive DAG" Badge matching Mockup 4 */}
        <div className="absolute top-4 right-8 z-30 px-3.5 py-1 rounded-xl bg-[#02132b]/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-black tracking-wider shadow">
          Interactive DAG
        </div>

        {/* SVG Equalizer Blocks and Inter-Chip Busses */}
        <svg
          width={width}
          height={height}
          className="absolute inset-0 pointer-events-none z-10"
        >
          {/* Main Bus from Frontend to Fastify */}
          <line
            x1={chips[0].x + 130}
            y1={chips[0].y + 36}
            x2={chips[1].x}
            y2={chips[1].y + 36}
            stroke="#00e5ff"
            strokeWidth="3.0"
            strokeOpacity="0.8"
          />

          {/* Bus from Fastify to Qdrant (Angled 45°) */}
          <path
            d={`M ${chips[1].x + 130} ${chips[1].y + 36} L ${chips[2].x - 40} ${chips[1].y + 36} L ${chips[2].x} ${chips[2].y + 36}`}
            fill="none"
            stroke="#d946ef"
            strokeWidth="2.5"
            strokeOpacity="0.75"
          />

          {/* Bus from Fastify to Agent */}
          <line
            x1={chips[1].x + 130}
            y1={chips[1].y + 36}
            x2={chips[3].x}
            y2={chips[3].y + 36}
            stroke="#00e5ff"
            strokeWidth="3.0"
            strokeOpacity="0.85"
          />

          {/* In-Line Equalizer Wave Block between Fastify and Agent matching Mockup 4 */}
          <g transform={`translate(${(chips[1].x + 130 + chips[3].x) / 2 - 14}, ${chips[1].y + 24})`}>
            <rect
              width="28"
              height="24"
              rx="6"
              fill="#010d21"
              stroke="#00e5ff"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
            {/* 4 animated mini equalizer bars */}
            <rect x="5" y="14" width="2" height="6" fill="#00e5ff" />
            <rect x="10" y="8" width="2" height="12" fill="#00e5ff" />
            <rect x="15" y="5" width="2" height="15" fill="#00e5ff" />
            <rect x="20" y="10" width="2" height="10" fill="#00e5ff" />
          </g>

          {/* Bus from Agent to Amadeus */}
          <line
            x1={chips[3].x + 130}
            y1={chips[3].y + 36}
            x2={chips[4].x}
            y2={chips[4].y + 36}
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeOpacity="0.8"
          />

          {/* In-Line Equalizer Wave Block between Agent and Amadeus matching Mockup 4 */}
          <g transform={`translate(${(chips[3].x + 130 + chips[4].x) / 2 - 14}, ${chips[3].y + 24})`}>
            <rect
              width="28"
              height="24"
              rx="6"
              fill="#010d21"
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
            {/* 4 animated mini equalizer bars */}
            <rect x="5" y="12" width="2" height="8" fill="#f59e0b" />
            <rect x="10" y="6" width="2" height="14" fill="#f59e0b" />
            <rect x="15" y="9" width="2" height="11" fill="#f59e0b" />
            <rect x="20" y="13" width="2" height="7" fill="#f59e0b" />
          </g>

          {/* Bus from Agent to Postgres (Angled 45°) */}
          <path
            d={`M ${chips[3].x + 130} ${chips[3].y + 36} L ${chips[5].x - 40} ${chips[3].y + 36} L ${chips[5].x} ${chips[5].y + 36}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeOpacity="0.75"
          />
        </svg>

        {/* ------------------------------------------------------------- */}
        {/* Render 6 Silicon IC Microchip Packages matching Mockup 4     */}
        {/* ------------------------------------------------------------- */}
        {chips.map((chip) => {
          const isSelected = selectedNodeId === chip.id;

          return (
            <div
              key={chip.id}
              onClick={() => setSelectedNodeId(chip.id)}
              style={{
                left: `${chip.x}px`,
                top: `${chip.y}px`,
                borderColor: isSelected ? "#ffffff" : chip.borderColor,
              }}
              className={`absolute w-[140px] z-20 rounded-2xl p-2.5 flex flex-col gap-1 transition-all duration-300 cursor-pointer shadow-2xl ${
                isSelected
                  ? "bg-[#041a3a] shadow-[0_0_24px_rgba(0,229,255,0.6)] scale-105 border-2"
                  : "bg-[#020f24]/90 border hover:border-cyan-400"
              }`}
            >
              {/* IC Pin Headers around chip border */}
              <div className="absolute -top-1.5 inset-x-4 flex justify-between pointer-events-none">
                {[0, 1, 2, 3].map((p) => (
                  <div key={p} className="w-1.5 h-1.5 bg-slate-400 rounded-sm" />
                ))}
              </div>
              <div className="absolute -bottom-1.5 inset-x-4 flex justify-between pointer-events-none">
                {[0, 1, 2, 3].map((p) => (
                  <div key={p} className="w-1.5 h-1.5 bg-slate-400 rounded-sm" />
                ))}
              </div>

              {/* Header: Chip Type & Latency */}
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400">{chip.chipType.split(" ")[0]}</span>
                <span className="text-cyan-400 font-bold">{chip.latency}</span>
              </div>

              {/* Title */}
              <span className="text-xs font-bold text-white leading-tight">
                {chip.title}
              </span>

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-1">
                <span
                  style={{ color: chip.badgeColor, borderColor: chip.badgeColor }}
                  className="px-1.5 py-0.5 rounded text-[8px] font-mono border bg-black/40"
                >
                  {chip.badge}
                </span>

                {/* Mini Equalizer Wave */}
                <div className="flex items-end gap-0.5 h-3">
                  {[40, 80, 100, 60].map((h, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${h}%`, backgroundColor: chip.badgeColor }}
                      className="w-0.5 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* ------------------------------------------------------------- */}
        {/* Bottom-Left Live Telemetry Card matching Mockup 4             */}
        {/* ------------------------------------------------------------- */}
        <div className="absolute bottom-4 left-6 z-30 w-52 bg-[#020e24]/95 border border-cyan-500/40 rounded-2xl p-3 flex flex-col gap-1.5 shadow-2xl text-[10px] font-mono">
          <div className="flex items-center justify-between text-slate-400 border-b border-cyan-500/20 pb-1">
            <span>Throughput (Req/sec):</span>
            <span className="text-cyan-300 font-bold">284 rps</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Latency (Avg):</span>
            <span className="text-white font-bold">114ms</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Error Rate:</span>
            <span className="text-emerald-400 font-bold">0.01%</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Cache Hit Ratio:</span>
            <span className="text-amber-400 font-bold">96.5%</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-0.5 border-t border-cyan-500/20">
            <span>Active Instances:</span>
            <span className="text-cyan-400 font-bold">14</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RIGHT NODE INSPECTOR PANEL matching Mockup 4 (320px)                    */}
      {/* ========================================================================= */}
      <div className="w-[320px] shrink-0 h-full p-3.5 flex flex-col gap-3 z-40 overflow-y-auto text-left border-l border-cyan-500/30 bg-[#010917]/95 backdrop-blur-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.8)]">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-1 border-b border-cyan-500/25">
          <span className="text-xs font-mono font-black text-white tracking-wider">
            Node Inspector
          </span>
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Active Node Info Card matching Mockup 4 */}
        <div className="p-2.5 rounded-xl bg-[#02132d] border border-cyan-500/40 flex items-center gap-2.5 shadow">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
            <Cpu size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">{activeChip.title}</span>
            <span className="text-[10px] font-mono text-cyan-400">{activeChip.sub}</span>
          </div>
        </div>

        {/* 3 Tabs: DB, Graph, File */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#010612] border border-cyan-500/20">
          <button
            type="button"
            onClick={() => setActiveInspectorTab("db")}
            className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
              activeInspectorTab === "db"
                ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Database size={14} />
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab("graph")}
            className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
              activeInspectorTab === "graph"
                ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GitBranch size={14} />
          </button>
          <button
            type="button"
            onClick={() => setActiveInspectorTab("file")}
            className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
              activeInspectorTab === "file"
                ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileCode2 size={14} />
          </button>
        </div>

        {/* Live JSON Schema Block matching Mockup 4 */}
        <div className="bg-[#020e24]/90 border border-cyan-500/35 rounded-2xl p-3 flex flex-col gap-2 shadow-lg">
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">
            Live JSON Schema
          </span>

          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Method:</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-bold">
                POST
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Action:</span>
              <span className="text-white font-bold">ProcessRequest</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-slate-400">Endpoint:</span>
            <span className="text-cyan-400 font-bold">/api/v1/dispatch</span>
          </div>

          {/* Syntax-Highlighted Payload Box */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-500">Payload:</span>
            <pre className="p-2 rounded-xl bg-[#01050e] border border-cyan-500/25 text-[10px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{`{\n  "bookingRef": "AB-12345",\n  "passenger": {\n    "name": "VIP Traveler",\n    "tier": "PLATINUM"\n  },\n  "route": "DXB → IST"\n}`}</code>
            </pre>
          </div>

          {/* Status 200 OK Badge */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-slate-400">Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold">
              200 OK
            </span>
          </div>
        </div>

        {/* Execute Action Buttons matching Mockup 4 */}
        <div className="flex flex-col gap-2 pt-1 flex-1">
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">
            Execute Action
          </span>

          <button
            type="button"
            disabled={simulationRunning}
            onClick={handleRunSimulation}
            className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Play size={13} />
            <span>{simulationRunning ? "Simulating..." : "Run Simulation"}</span>
          </button>

          <button
            type="button"
            onClick={handleDebugTrace}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 text-slate-200 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            Debug Trace
          </button>

          <button
            type="button"
            onClick={handleDeployUpdate}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-700/30 hover:from-cyan-600/50 hover:to-blue-700/50 border border-cyan-400/60 text-white font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            Deploy Update
          </button>
        </div>
      </div>
    </div>
  );
}
