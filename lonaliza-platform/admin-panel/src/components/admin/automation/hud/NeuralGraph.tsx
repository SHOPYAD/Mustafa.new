"use client";

import React, { useState, useId, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import {
  Bot,
  Plane,
  Building2,
  TrendingUp,
  Share2,
  Mail,
  Smartphone,
  Radar,
  ShieldCheck,
  Zap,
  Cpu,
  Palette,
  Network,
  ShieldAlert,
  X,
  Send,
  Sparkles,
  ArrowUpRight,
  Activity,
  Layers,
} from "lucide-react";
import type { HudAgentConfig } from "../agentsData";


interface NeuralGraphProps {
  agents: HudAgentConfig[];
  frequencies?: number[];
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
  isProcessing?: boolean;
  onSelectAgent?: (agent: HudAgentConfig) => void;
  onSendDirectiveToAgent?: (agentId: string, directive: string) => void;
  onTriggerSwarmDeliberation?: (topic: string) => void;
  activeDiscussionsCount?: number;
  consensusScore?: number;
}

export default function NeuralGraph({
  agents,
  frequencies = [],
  isUserSpeaking = false,
  isAgentSpeaking = false,
  isProcessing = false,
  onSelectAgent,
  onSendDirectiveToAgent,
  onTriggerSwarmDeliberation,
  activeDiscussionsCount = 0,
  consensusScore = 96,
}: NeuralGraphProps) {
  const [selectedAgent, setSelectedAgent] = useState<HudAgentConfig | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [masterModalOpen, setMasterModalOpen] = useState<boolean>(false);
  const [swarmTopic, setSwarmTopic] = useState("");
  const [quickDirective, setQuickDirective] = useState("");
  const idPrefix = useId().replace(/:/g, "");

  // Coordinate Plane (Spacious 1360 x 700 widescreen workspace)
  const VIEW_WIDTH = 1360;
  const VIEW_HEIGHT = 700;
  const CENTER_X = VIEW_WIDTH / 2; // 680
  const CENTER_Y = VIEW_HEIGHT / 2; // 350

  // Concise single-word role mapping to prevent any label collisions
  const getAgentShortRole = (id: string): string => {
    switch (id) {
      case "sales": return "الفنادق";
      case "site_advisor": return "الباقات";
      case "lead_scout": return "الموزعين";
      case "b2b_landing": return "وكالات B2B";
      case "ads": return "الإعلانات";
      case "social": return "النشر";
      case "email": return "البريد";
      case "app_concierge": return "التطبيق";
      case "app_notifications": return "الإشعارات";
      case "ui_ux_architect": return "المتجر البصري";
      case "reseller_network_director": return "شبكة التوزيع";
      case "security": return "الأمان";
      default: return "وكيل";
    }
  };

  // Pure Vector Icon Dispatcher
  const renderAgentIcon = (iconName: string, size = 18) => {
    const props = { size, className: "shrink-0" };
    switch (iconName) {
      case "Plane": return <Plane {...props} />;
      case "Building2": return <Building2 {...props} />;
      case "TrendingUp": return <TrendingUp {...props} />;
      case "Share2": return <Share2 {...props} />;
      case "Mail": return <Mail {...props} />;
      case "Smartphone": return <Smartphone {...props} />;
      case "Radar": return <Radar {...props} />;
      case "ShieldCheck": return <ShieldCheck {...props} />;
      case "Zap": return <Zap {...props} />;
      case "Cpu": return <Cpu {...props} />;
      case "Palette": return <Palette {...props} />;
      case "Network": return <Network {...props} />;
      case "ShieldAlert": return <ShieldAlert {...props} />;
      default: return <Bot {...props} />;
    }
  };

  // Anti-Collision Dual-Layer Orbit (Staggered Radii completely prevents overlapping)
  const nodesWithCoords = useMemo(() => {
    const total = agents.length;
    if (total === 0) return [];

    const RX_OUTER = 510;
    const RY_OUTER = 270;
    const RX_INNER = 385;
    const RY_INNER = 195;

    return agents.map((agent, i) => {
      // Start at 12 o'clock (-PI/2) and spread clockwise
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const isOuter = i % 2 === 0;
      const rx = isOuter ? RX_OUTER : RX_INNER;
      const ry = isOuter ? RY_OUTER : RY_INNER;

      const x = Math.round(CENTER_X + rx * Math.cos(angle));
      const y = Math.round(CENTER_Y + ry * Math.sin(angle));

      // Cubic Bezier control points for the synaptic nerves
      const midDist = 0.45;
      const controlX1 = Math.round(CENTER_X + (x - CENTER_X) * midDist);
      const controlY1 = Math.round(CENTER_Y + (y - CENTER_Y) * midDist);
      const controlX2 = Math.round(CENTER_X + (x - CENTER_X) * 0.75);
      const controlY2 = Math.round(y);

      return {
        ...agent,
        x,
        y,
        controlX1,
        controlY1,
        controlX2,
        controlY2,
        isOuter,
      };
    });
  }, [agents]);

  const handleNodeClick = (agent: HudAgentConfig) => {
    onSelectAgent?.(agent);
  };

  const handleMasterDeliberationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swarmTopic.trim()) return;
    onTriggerSwarmDeliberation?.(swarmTopic.trim());
    setSwarmTopic("");
    setMasterModalOpen(false);
  };

  // =========================================================================
  // Holographic 3D Swarm Core Component
  // =========================================================================
  const ThreeSwarmCore = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const w = 220;
      const h = 220;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
      camera.position.z = 150;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // Core Icosahedron
      const geo = new THREE.IcosahedronGeometry(28, 1);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const core = new THREE.Mesh(geo, mat);
      group.add(core);

      // Inner glowing sphere
      const innerGeo = new THREE.SphereGeometry(18, 32, 32);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x00bfff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      const innerSphere = new THREE.Mesh(innerGeo, innerMat);
      group.add(innerSphere);

      // Orbital Rings
      const ringGeo1 = new THREE.TorusGeometry(45, 0.5, 16, 100);
      const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.5 });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 2;
      group.add(ring1);

      const ringGeo2 = new THREE.TorusGeometry(60, 0.3, 16, 100);
      const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.3 });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.y = Math.PI / 3;
      group.add(ring2);

      let animId: number;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        
        // Pulse based on audio frequencies or simply time
        const scale = isAgentSpeaking || isUserSpeaking ? 1.1 + Math.sin(Date.now() * 0.005) * 0.1 : 1.0;
        group.scale.set(scale, scale, scale);
        
        core.rotation.x += 0.01;
        core.rotation.y += 0.015;
        ring1.rotation.z -= 0.01;
        ring2.rotation.x += 0.005;

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    }, []);

    return <div ref={containerRef} className="absolute inset-0 pointer-events-none mix-blend-screen" />;
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-transparent">
      {/* ========================================================================= */}
      {/* 1. Center Stage: Central Holographic Command Nucleus (Tactical Core)      */}
      {/* ========================================================================= */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center justify-center cursor-pointer group"
        style={{
          left: `${(CENTER_X / VIEW_WIDTH) * 100}%`,
          top: `${(CENTER_Y / VIEW_HEIGHT) * 100}%`,
          width: "220px",
          height: "220px",
          zIndex: 15,
        }}
        onClick={() => setMasterModalOpen(true)}
      >
        {/* Animated Cyber Core Rings */}
        <div className="relative size-36 rounded-full border border-cyan-400/30 bg-[#031124]/40 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_60px_rgba(0,229,255,0.25)] group-hover:border-cyan-300 transition-all overflow-hidden">
          <ThreeSwarmCore />

          {/* Central Core Icon & Label (Overlay on 3D) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <Sparkles className="w-6 h-6 text-cyan-200 animate-pulse drop-shadow-[0_0_8px_rgba(0,229,255,1)]" />
            <span className="text-[10px] font-black font-mono text-white mt-1 drop-shadow-md">SWARM CORE</span>
            <span className="text-[8px] font-mono text-amber-300 font-bold drop-shadow-md">12 AGENTS</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-2.5 px-3 py-1 rounded-full bg-[#020b18]/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 backdrop-blur-md shadow-md">
          {isAgentSpeaking ? "تداول حي نشط" : isUserSpeaking ? "استماع للتوجيه..." : "نواة السرب في الجاهزية"}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SVG Synaptic Nerve Layer connecting Humanoid Avatar to Agent Orbit     */}
      {/* ========================================================================= */}
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <defs>
          <filter id={`${idPrefix}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric Dual Orbital Navigation Rings */}
        <ellipse
          cx={CENTER_X}
          cy={CENTER_Y}
          rx="510"
          ry="270"
          fill="none"
          stroke="#00e5ff"
          strokeOpacity="0.14"
          strokeWidth="1.2"
          strokeDasharray="6 14"
        />
        <ellipse
          cx={CENTER_X}
          cy={CENTER_Y}
          rx="385"
          ry="195"
          fill="none"
          stroke="#f59e0b"
          strokeOpacity="0.12"
          strokeWidth="0.8"
          strokeDasharray="4 16"
        />

        {/* Glowing Bezier Synapse Filaments */}
        {nodesWithCoords.map((node) => {
          const isHovered = hoveredAgentId === node.id;
          const isSelected = selectedAgent?.id === node.id;
          const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.0;
          const strokeOpacity = isSelected ? 0.95 : isHovered ? 0.75 : 0.35;

          const pathD = `M ${CENTER_X} ${CENTER_Y} C ${node.controlX1} ${node.controlY1}, ${node.controlX2} ${node.controlY2}, ${node.x} ${node.y}`;

          return (
            <g key={`synapse-${node.id}`}>
              <path
                d={pathD}
                fill="none"
                stroke={node.colorHex}
                strokeWidth={strokeWidth + 2.5}
                strokeOpacity={strokeOpacity * 0.3}
                filter={`url(#${idPrefix}-glow)`}
                strokeLinecap="round"
              />
              <path
                d={pathD}
                fill="none"
                stroke={node.colorHex}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={isHovered ? "8 4" : undefined}
                strokeLinecap="round"
              />
              
              {/* Pulsing Light Particle flowing along the path */}
              {(isSelected || isHovered || isAgentSpeaking) && (
                <circle r={isSelected ? 4 : 2.5} fill={node.colorHex} filter={`url(#${idPrefix}-glow)`}>
                  <animateMotion
                    path={pathD}
                    dur={isAgentSpeaking ? "1.5s" : "3s"}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* ========================================================================= */}
      {/* 3. Anti-Collision Agent Nodes with Compact Monospace Badges              */}
      {/* ========================================================================= */}
      {nodesWithCoords.map((agent, idx) => {
        const isHovered = hoveredAgentId === agent.id;
        const isSelected = selectedAgent?.id === agent.id;
        const leftPct = (agent.x / VIEW_WIDTH) * 100;
        const topPct = (agent.y / VIEW_HEIGHT) * 100;

        return (
          <div
            key={agent.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-transform duration-200"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              zIndex: isSelected ? 50 : isHovered ? 45 : 25,
            }}
            onMouseEnter={() => setHoveredAgentId(agent.id)}
            onMouseLeave={() => setHoveredAgentId(null)}
            onClick={() => handleNodeClick(agent)}
          >
            {/* Glowing Cyber Node Circle */}
            <div
              className={`relative size-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                isHovered || isSelected ? "scale-125 shadow-2xl" : "scale-100"
              }`}
              style={{
                backgroundColor: "#020b18",
                border: `2px solid ${agent.colorHex}`,
                boxShadow:
                  isHovered || isSelected
                    ? `0 0 25px ${agent.glowRgba}, 0 0 12px ${agent.colorHex}`
                    : `0 0 14px ${agent.glowRgba}`,
              }}
            >
              {/* Pure Vector Icon */}
              <div style={{ color: agent.colorHex }}>{renderAgentIcon(agent.iconName, 18)}</div>

              {/* Status pulse LED */}
              <span
                className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#020b18]"
                style={{ backgroundColor: agent.colorHex }}
              >
                {agent.status === "active" && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-80"
                    style={{ backgroundColor: agent.colorHex }}
                  />
                )}
              </span>
            </div>

            {/* Compact, Single-Word Typography Label (Zero Text Collisions Guaranteed!) */}
            <div className="mt-1 flex flex-col items-center pointer-events-none text-center font-mono">
              <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-md bg-[#020b18]/90 border border-cyan-500/25 whitespace-nowrap shadow-sm">
                {getAgentShortRole(agent.id)}
              </span>
              <span
                className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded mt-0.5"
                style={{
                  backgroundColor: `${agent.colorHex}25`,
                  color: agent.colorHex,
                  border: `1px solid ${agent.colorHex}40`,
                }}
              >
                [AGT-0{idx + 1}]
              </span>
            </div>

            {/* Floating Holographic Tooltip (Visible on Hover Only - Guaranteed No Clipping) */}
            {isHovered && (
              <div
                className={`absolute ${
                  agent.y < CENTER_Y ? "top-full mt-3" : "bottom-full mb-3"
                } w-64 p-3 rounded-xl bg-[#03152d]/98 border border-cyan-500/60 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,229,255,0.5)] pointer-events-none font-mono text-start space-y-1.5 animate-in fade-in zoom-in-95 duration-150`}
                style={{ zIndex: 100 }}
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1">
                  <span className="text-xs font-black text-white">{agent.nameAr}</span>
                  <span
                    className="text-[9px] font-bold uppercase px-1 rounded"
                    style={{ backgroundColor: `${agent.colorHex}30`, color: agent.colorHex }}
                  >
                    {agent.status}
                  </span>
                </div>
                <p className="text-[10px] text-cyan-300 font-sans leading-tight">{agent.titleAr}</p>
                <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>الأدوات: {agent.toolsCount} أدوات</span>
                  <span className="text-amber-300 font-bold">{agent.keyMetric}</span>
                </div>
                <div className="pt-1 text-[9px] text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight size={10} />
                  <span>انقر لفتح المحطة السيادية</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ========================================================================= */}
      {/* 4. Master AI Swarm Telemetry & Directives Modal                           */}
      {/* ========================================================================= */}
      {masterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          dir="rtl"
        >
          <div className="relative w-full max-w-lg p-6 rounded-3xl border border-amber-400/50 bg-[#031429] shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-4 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                  <Cpu size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-sans">
                    المشرف العام والهيكل البشري التجسيدي
                  </h3>
                  <p className="text-xs text-amber-300">Master Sovereign Controller Core</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMasterModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Core Swarm Telemetry Gauges */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-[#020b18] border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 block">نسبة الإجماع</span>
                <span className="text-lg font-black text-emerald-400">{consensusScore}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#020b18] border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 block">الوكلاء النشطون</span>
                <span className="text-lg font-black text-cyan-300">{agents.length} وكلاء</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#020b18] border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 block">حالة البروتوكول</span>
                <span className="text-lg font-black text-amber-400">ReAct Loop</span>
              </div>
            </div>

            {/* Trigger Swarm Deliberation Form */}
            <form onSubmit={handleMasterDeliberationSubmit} className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300 block font-sans">
                إطلاق جلسة تداول عصبية بين كامل السرب:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={swarmTopic}
                  onChange={(e) => setSwarmTopic(e.target.value)}
                  placeholder="مثال: مراجعة هوامش طيران أومادوس ومقارنة أسعار الفنادق..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#020b18] border border-amber-500/40 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-sans"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1.5"
                >
                  <Zap size={14} />
                  <span>تداول</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
