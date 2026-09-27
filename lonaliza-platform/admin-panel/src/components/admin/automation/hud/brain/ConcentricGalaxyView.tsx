"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { BrainSector, BrainNode } from "@/app/api/admin/automation/second-brain-data/route";
import {
  Sparkles,
  Plane,
  Building2,
  Car,
  Palmtree,
  Network,
  CreditCard,
  TrendingUp,
  Share2,
  Smartphone,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  Database,
  Activity,
  Search,
  ChevronLeft,
  Play,
  Filter,
  Folder,
  Layers,
  Circle,
  Hexagon,
} from "lucide-react";
import type { ViewMode } from "./FloatingControlsDrawer";

interface ConcentricGalaxyViewProps {
  sectors: BrainSector[];
  nodes: BrainNode[];
  viewMode?: ViewMode;
  currentTheme?: string;
  linkDistance?: number;
  repulsion?: number;
  particleSize?: number;
  onSelectNode?: (node: BrainNode) => void;
  onSelectSector?: (sector: any) => void;
  onBackToComando?: () => void;
}

export default function ConcentricGalaxyView({
  sectors = [],
  nodes = [],
  viewMode = "radial",
  currentTheme = "oceano",
  linkDistance = 120,
  repulsion = -350,
  particleSize = 2,
  onSelectNode,
  onSelectSector,
  onBackToComando,
}: ConcentricGalaxyViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 750,
  });
  const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>("sector-flights");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orbitAngle, setOrbitAngle] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 750,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth slow rotation for radial/circulo modes
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setOrbitAngle((prev) => (prev + 0.0014) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const { width, height } = dimensions;
  const cx = width / 2;
  const cy = height / 2 + 25;

  // Real Sovereign 10 Sectors of Lonaliza Platform
  const SOVEREIGN_SECTORS = useMemo(
    () => [
      { id: "sector-flights", stationId: "flights", nameAr: "الطيران والتوزيع GDS", nameEn: "Aviation & GDS", icon: Plane, color: "#00e5ff", count: "1,420 ملفاً", provider: "PKFare / Seeru / Travelport" },
      { id: "sector-hotels", stationId: "hotels", nameAr: "الفنادق وبنوك الأسرة", nameEn: "Hotels & BedBanks", icon: Building2, color: "#10b981", count: "3,890 ملفاً", provider: "Travelport 140 / Hotelbeds" },
      { id: "sector-fleet", stationId: "transfers", nameAr: "الأسطول والنقل VIP", nameEn: "VIP Fleet & Transfers", icon: Car, color: "#f59e0b", count: "840 ملفاً", provider: "Mercedes Vito & FlightRadar" },
      { id: "sector-packages", stationId: "packages", nameAr: "الباقات والعطلات", nameEn: "Tour Packages & Itineraries", icon: Palmtree, color: "#ec4899", count: "1,120 ملفاً", provider: "AI Itineraries & Vouchers" },
      { id: "sector-b2b", stationId: "resale", nameAr: "شبكة الموزعين B2B", nameEn: "B2B Agency Reseller Network", icon: Network, color: "#a855f7", count: "2,450 ملفاً", provider: "B2B Wallet & Whitelabel" },
      { id: "sector-treasury", stationId: "payments", nameAr: "الخزينة والمدفوعات", nameEn: "Treasury & Payments", icon: CreditCard, color: "#eab308", count: "960 ملفاً", provider: "Iyzico 3DS & FX Hedging" },
      { id: "sector-growth", stationId: "ads", nameAr: "النمو والإعلانات", nameEn: "Growth & Paid Ads", icon: TrendingUp, color: "#06b6d4", count: "670 ملفاً", provider: "Meta Ads & Google v17" },
      { id: "sector-publishing", stationId: "publish", nameAr: "النشر والمحتوى", nameEn: "Omnichannel Publishing", icon: Share2, color: "#3b82f6", count: "1,850 ملفاً", provider: "Instagram, X, TikTok, Telegram" },
      { id: "sector-apps", stationId: "mobile", nameAr: "تطبيقات الموبايل", nameEn: "Guest Apps & Concierge", icon: Smartphone, color: "#14b8a6", count: "540 ملفاً", provider: "FCM, APNs, Offline Sync" },
      { id: "sector-brain", stationId: "security", nameAr: "الأمان والسيادة", nameEn: "Cyber Security & Qdrant", icon: ShieldCheck, color: "#6366f1", count: "4,200 ملفاً", provider: "Qdrant 6333 / Postgres Vector" },
    ],
    []
  );

  // Filter sectors by search query
  const filteredSectors = SOVEREIGN_SECTORS.filter((s) =>
    searchQuery
      ? s.nameAr.includes(searchQuery) ||
        s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const rCore = Math.min(width, height) * 0.12 * (linkDistance / 100);
  const rSectors = Math.min(width, height) * 0.32 * (linkDistance / 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[660px] flex flex-col bg-[#020813] text-slate-100 font-sans select-none overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. Sovereign Second Brain Top Header Bar                                 */}
      {/* ========================================================================= */}
      <div className="relative z-20 px-6 py-2.5 bg-[#031124]/90 border-b border-cyan-500/25 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 font-mono">
        {/* Left: Branding & Counts */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-sm font-black text-white tracking-wider">
              العقل الثاني السيادي (SECOND BRAIN)
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-cyan-400 font-bold">
              2,238 ملف ومعرفة · 137 روتين نشط
            </span>
          </div>

          {/* Return to Command Button */}
          {onBackToComando && (
            <button
              type="button"
              onClick={onBackToComando}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#041a38] border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-sm"
            >
              <ChevronLeft size={14} />
              <span>العودة لغرفة القيادة</span>
            </button>
          )}
        </div>

        {/* Center: Search Bar & Filter Pills */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في قاعدة المعرفة الدلالية (/) ..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#010813] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors text-right"
              dir="auto"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#010813] p-0.5 rounded-xl border border-slate-800 text-[10px]">
            <button type="button" className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold">
              القطاعات
            </button>
            <button type="button" className="px-2 py-1 rounded-lg text-slate-400 hover:text-white">
              المجلدات
            </button>
          </div>
        </div>

        {/* Right: Presentation Button */}
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
        >
          <Play size={12} className="fill-black" />
          <span>عرض تفاعلي</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. Interactive SVG Graph Stage                                            */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* SVG Orbital Canvas */}
        <svg width={width} height={height} className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* LAYOUT 1: RADIAL & CIRCULO ORBITS */}
          {(viewMode === "radial" || viewMode === "circulo") && (
            <>
              {/* Concentric Circle Orbits */}
              <circle cx={cx} cy={cy} r={rCore} fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.3" />
              <circle cx={cx} cy={cy} r={rSectors} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 12" strokeOpacity="0.25" />
              <circle cx={cx} cy={cy} r={rSectors * 1.35} fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 9" strokeOpacity="0.2" />

              {/* Radial Division Lines */}
              {viewMode === "radial" &&
                filteredSectors.map((_, i) => {
                  const angle = (i / filteredSectors.length) * Math.PI * 2 + orbitAngle;
                  const x2 = cx + Math.cos(angle) * (rSectors * 1.4);
                  const y2 = cy + Math.sin(angle) * (rSectors * 1.4);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={x2}
                      y2={y2}
                      stroke="#00e5ff"
                      strokeWidth="0.8"
                      strokeOpacity="0.15"
                      strokeDasharray="2 4"
                    />
                  );
                })}

              {/* Synaptic Curved Bezier Filaments to Selected Sector */}
              {filteredSectors.map((sec, i) => {
                const angle = (i / filteredSectors.length) * Math.PI * 2 + orbitAngle;
                const sx = cx + Math.cos(angle) * rSectors;
                const sy = cy + Math.sin(angle) * rSectors;
                const isSelected = selectedSectorId === sec.id;
                const isHovered = hoveredSectorId === sec.id;

                const c1x = cx + Math.cos(angle) * (rCore * 1.8);
                const c1y = cy + Math.sin(angle) * (rCore * 1.8);

                return (
                  <path
                    key={`synapse-${sec.id}`}
                    d={`M ${cx} ${cy} Q ${c1x} ${c1y} ${sx} ${sy}`}
                    fill="none"
                    stroke={sec.color}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                    strokeOpacity={isSelected ? 0.9 : isHovered ? 0.6 : 0.25}
                    filter={isSelected ? "url(#laser-glow)" : undefined}
                    className="transition-all duration-300"
                  />
                );
              })}
            </>
          )}

          {/* Central Radial Pulsing Waves */}
          <circle cx={cx} cy={cy} r={rCore * 0.75} fill="none" stroke="#00e5ff" strokeWidth="1.5" className="animate-ping opacity-20" />
        </svg>

        {/* Central Core: NEXUS CORE BRAIN */}
        <div
          style={{ left: `${cx}px`, top: `${cy}px` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group"
          onClick={() => setSelectedSectorId(null)}
        >
          <div className="relative size-24 md:size-28 rounded-full border-2 border-cyan-400/60 bg-[#020b18]/90 backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_0_35px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-all">
            <div className="absolute inset-1 rounded-full border border-dashed border-cyan-400/40 animate-[spin_10s_linear_infinite]" />
            <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
            <span className="text-[10px] font-black font-mono text-white mt-1">NEXUS CORE</span>
            <span className="text-[8px] font-mono text-cyan-400">ENGINES 81</span>
          </div>
        </div>

        {/* Outer Orbit: The 10 Sector Cards */}
        {filteredSectors.map((sec, i) => {
          const angle = (i / filteredSectors.length) * Math.PI * 2 + orbitAngle;
          const x = cx + Math.cos(angle) * rSectors;
          const y = cy + Math.sin(angle) * rSectors;
          const isSelected = selectedSectorId === sec.id;
          const isHovered = hoveredSectorId === sec.id;
          const IconComp = sec.icon;

          return (
            <div
              key={sec.id}
              style={{ left: `${x}px`, top: `${y}px` }}
              onMouseEnter={() => setHoveredSectorId(sec.id)}
              onMouseLeave={() => setHoveredSectorId(null)}
              onClick={() => {
                setSelectedSectorId(sec.id);
                if (onSelectSector) onSelectSector(sec);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group"
            >
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-lg ${
                  isSelected
                    ? "bg-[#041a38] border-cyan-300 scale-110 shadow-[0_0_25px_rgba(0,229,255,0.4)] ring-2 ring-cyan-400/50"
                    : isHovered
                    ? "bg-[#031429] border-cyan-500/60 scale-105 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    : "bg-[#020b18]/85 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sec.nameAr}
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 mt-0.5">
                    <span className="text-amber-400">{sec.count}</span>
                    <span>·</span>
                    <span className="truncate max-w-[110px]">{sec.nameEn}</span>
                  </div>
                </div>

                <div
                  className="p-1.5 rounded-xl text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${sec.color}20`, border: `1px solid ${sec.color}60` }}
                >
                  <IconComp size={16} style={{ color: sec.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
