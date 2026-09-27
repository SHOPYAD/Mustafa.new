"use client";

import React from "react";
import {
  SlidersHorizontal,
  Palette,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  Circle,
  LayoutGrid,
  GitBranch,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  useSecondBrainStore,
  CYBER_THEMES,
  type CyberThemeKey,
  type SecondBrainViewMode,
} from "../store/useSecondBrainStore";

interface FloatingControlsDrawerProps {
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
  viewMode?: any;
  onViewModeChange?: (mode: any) => void;
  linkDistance?: number;
  onLinkDistanceChange?: (val: number) => void;
  repulsion?: number;
  onRepulsionChange?: (val: number) => void;
  particleSize?: number;
  onParticleSizeChange?: (val: number) => void;
}

export default function FloatingControlsDrawer(props: FloatingControlsDrawerProps) {
  const store = useSecondBrainStore();

  const isOpen = store.controlsDrawerOpen;
  const setIsOpen = store.setControlsDrawerOpen;

  const currentTheme = store.activeThemeKey;
  const repulsion = store.repulsion;
  const linkDistance = store.linkDistance;
  const particleSize = store.particleSize;
  const viewMode = store.viewMode;

  const handleResetPhysics = () => {
    store.setPhysicsRepulsion(-320);
    store.setPhysicsLinkDistance(135);
    store.setPhysicsParticleSize(2.2);
    store.setPhysicsParticleSpeed(1.0);
  };

  const themes: { key: CyberThemeKey; nameAr: string; namePt: string; color: string }[] = [
    { key: "oceano", nameAr: "أوقيانوس (Oceano)", namePt: "Oceano", color: "#00e5ff" },
    { key: "metalico", nameAr: "ميتاليك (Metálico)", namePt: "Metálico Tracktor", color: "#94a3b8" },
    { key: "neon", nameAr: "نيون سيبراني (Neon)", namePt: "Neon Nox", color: "#d946ef" },
    { key: "rubric", nameAr: "ياقوتي (Rubric)", namePt: "Rubric", color: "#f43f5e" },
    { key: "bordo", nameAr: "عنابي ملكي (Bordô)", namePt: "Bordô", color: "#e11d48" },
    { key: "papel", nameAr: "ورقي سيادي (Papel)", namePt: "Papel", color: "#eab308" },
  ];

  return (
    <div
      dir="rtl"
      className={`fixed top-20 left-4 z-50 transition-all duration-300 flex items-start select-none font-sans ${
        isOpen
          ? "translate-x-0 opacity-100 pointer-events-auto"
          : "-translate-x-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Main Drawer Panel */}
      <div className="w-80 bg-[#020b18]/95 border border-cyan-500/30 rounded-2xl backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden text-slate-100 flex flex-col text-right">
        {/* Header */}
        <div className="p-3 bg-[#031124] border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <SlidersHorizontal size={14} className="text-cyan-400" />
            <span>لوحة التحكم والتوليف الذكي</span>
          </div>
          <button
            type="button"
            onClick={handleResetPhysics}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white transition-all font-mono"
            title="إعادة ضبط الفيزياء"
          >
            <RotateCcw size={10} />
            <span>إعادة ضبط</span>
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Section 1: View Modes */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-cyan-300 block">نمط العرض الكوني:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "hexagonal", label: "مصفوفة سداسية", icon: Hexagon },
                { id: "sunburst", label: "مجرة مدارية", icon: Circle },
                { id: "command_deck", label: "العمليات الثلاثية", icon: LayoutGrid },
                { id: "deep_circuit", label: "تفكيك الكود DAG", icon: GitBranch },
              ].map((vm) => {
                const Icon = vm.icon;
                const isAct = viewMode === vm.id;
                return (
                  <button
                    key={vm.id}
                    type="button"
                    data-view-id={vm.id}
                    onClick={() => store.setViewMode(vm.id as SecondBrainViewMode)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-[11px] font-bold transition-all ${
                      isAct
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                        : "bg-[#010813] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon size={12} className={isAct ? "text-cyan-300" : "text-slate-500"} />
                    <span>{vm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Physics Sliders */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-cyan-300 block">محاكاة القوى الفيزيائية (D3-Force):</span>

            {/* Repulsion */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>قوة التنافر الكهرومغناطيسي:</span>
                <span className="text-cyan-400 font-bold">{repulsion}</span>
              </div>
              <input
                type="range"
                min="-600"
                max="-100"
                step="20"
                value={repulsion}
                onChange={(e) => store.setPhysicsRepulsion(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Link Distance */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>مسافة الروابط النيونية:</span>
                <span className="text-cyan-400 font-bold">{linkDistance} px</span>
              </div>
              <input
                type="range"
                min="60"
                max="250"
                step="5"
                value={linkDistance}
                onChange={(e) => store.setPhysicsLinkDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Particle Size */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>كثافة وحجم الذرات النجمية:</span>
                <span className="text-cyan-400 font-bold">{particleSize}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.2"
                value={particleSize}
                onChange={(e) => store.setPhysicsParticleSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Section 3: Color Themes */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-cyan-300 block flex items-center justify-between">
              <span>سمة الألوان السيادية:</span>
              <Palette size={12} className="text-cyan-400" />
            </span>
            <div className="space-y-1.5">
              {themes.map((th) => {
                const isSelected = currentTheme === th.key;
                return (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => store.setThemeKey(th.key)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-[11px] transition-all ${
                      isSelected
                        ? "bg-[#041a38] border-cyan-400 text-white shadow-[0_0_12px_rgba(0,229,255,0.25)]"
                        : "bg-[#010813] border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: th.color }}
                      />
                      <span className="font-bold">{th.nameAr}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{th.namePt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Handle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 bg-[#031124] border border-cyan-500/40 rounded-r-2xl text-cyan-300 hover:text-white flex items-center justify-center transition-all shadow-lg hover:bg-cyan-950/80 shrink-0 mt-3"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}
