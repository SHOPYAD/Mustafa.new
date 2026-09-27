"use client";

import React, { useState } from "react";
import {
  Sliders,
  Palette,
  Eye,
  Zap,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Compass,
  LayoutGrid,
  Radio,
  Layers,
  Circle,
  Hexagon,
  Sparkles,
} from "lucide-react";

export type ViewMode = "radial" | "circulo" | "hex" | "forca" | "placa" | "grid";

export interface ThemeOption {
  id: string;
  nameAr: string;
  namePt: string;
  primaryColor: string;
  bgColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "metalico", nameAr: "ميتاليك تراكتور", namePt: "Metálico Tracktor", primaryColor: "#94a3b8", bgColor: "#0b0d10" },
  { id: "rubric", nameAr: "روبريك ياقوتي", namePt: "Rubric", primaryColor: "#f43f5e", bgColor: "#140306" },
  { id: "oceano", nameAr: "أوقيانوس (الافتراضي)", namePt: "Oceano", primaryColor: "#00e5ff", bgColor: "#020813" },
  { id: "neon", nameAr: "نيون سيبراني", namePt: "Neon", primaryColor: "#ec4899", bgColor: "#0c0214" },
  { id: "bordo", nameAr: "بوردو فاخر", namePt: "Bordô", primaryColor: "#e11d48", bgColor: "#180408" },
  { id: "papel", nameAr: "ورقي تقني", namePt: "Papel", primaryColor: "#0284c7", bgColor: "#f8fafc" },
];

interface FloatingControlsDrawerProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  linkDistance: number;
  onLinkDistanceChange: (val: number) => void;
  repulsion: number;
  onRepulsionChange: (val: number) => void;
  particleSize: number;
  onParticleSizeChange: (val: number) => void;
  onResetPhysics?: () => void;
}

export default function FloatingControlsDrawer({
  currentTheme,
  onThemeChange,
  viewMode,
  onViewModeChange,
  linkDistance,
  onLinkDistanceChange,
  repulsion,
  onRepulsionChange,
  particleSize,
  onParticleSizeChange,
  onResetPhysics,
}: FloatingControlsDrawerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Normalize linkDistance to 0.00 - 1.00 for the UI slider display
  const normalizedDistance = Math.min(1.0, Math.max(0.0, (linkDistance - 50) / 150));

  return (
    <div
      className={`fixed top-24 right-4 z-40 transition-all duration-300 flex items-start select-none ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-42px)]"
      }`}
    >
      {/* Toggle Tab Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-l-2xl border-y border-l border-cyan-500/40 bg-[#040e1c]/95 text-cyan-400 hover:text-white hover:bg-cyan-900/40 shadow-[-8px_0_20px_rgba(0,229,255,0.2)] flex items-center justify-center backdrop-blur-md"
        title="لوحة التحكم بالسمات ومحركات التخطيط الستة"
      >
        <Sliders className="w-5 h-5 animate-pulse" />
      </button>

      {/* Drawer Body */}
      <div className="w-80 p-5 rounded-2xl border border-cyan-500/30 bg-[#020b18]/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 text-slate-200 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>TRACKTOR · CONTROLES</span>
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 1. The 6 Layout Engines Switcher (أنماط التخطيط الستة) */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>محركات التخطيط البصري (LAYOUT):</span>
            <span className="text-cyan-400 uppercase text-[10px]">[{viewMode}]</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5 bg-[#010813] p-1.5 rounded-xl border border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => onViewModeChange("radial")}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === "radial"
                  ? "bg-cyan-500 text-black font-black shadow-[0_0_10px_#00e5ff]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio size={11} />
              <span>RADIAL</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("circulo")}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === "circulo"
                  ? "bg-cyan-500 text-black font-black shadow-[0_0_10px_#00e5ff]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Circle size={11} />
              <span>Círculo</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("hex")}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === "hex"
                  ? "bg-cyan-500 text-black font-black shadow-[0_0_10px_#00e5ff]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Hexagon size={11} />
              <span>Hex</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("forca")}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === "forca"
                  ? "bg-cyan-500 text-black font-black shadow-[0_0_10px_#00e5ff]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap size={11} />
              <span>Força</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("placa")}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === "placa"
                  ? "bg-cyan-500 text-black font-black shadow-[0_0_10px_#00e5ff]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers size={11} />
              <span>Placa</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                viewMode === "grid"
                  ? "bg-cyan-500 text-black font-black shadow-[0_0_10px_#00e5ff]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={11} />
              <span>GRID</span>
            </button>
          </div>
        </div>

        {/* 2. Interactive Sliders (التحكم التفاعلي بالمسافات والأحجام والتنافر) */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
          {/* Slider 1: DISTÂNCIA RAIO */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">DISTÂNCIA RAIO:</span>
              <span className="text-cyan-400 font-bold">{normalizedDistance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={linkDistance}
              onChange={(e) => onLinkDistanceChange(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Slider 2: RELAÇÃO ESPACIAL */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">RELAÇÃO ESPACIAL:</span>
              <span className="text-amber-400 font-bold">{Math.abs(repulsion)}</span>
            </div>
            <input
              type="range"
              min="-600"
              max="-150"
              value={repulsion}
              onChange={(e) => onRepulsionChange(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Slider 3: TAMANHO (CÍRCULOS E FONT) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">TAMANHO (CÍRCULOS E FONT):</span>
              <span className="text-emerald-400 font-bold">{particleSize}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="0.5"
              value={particleSize}
              onChange={(e) => onParticleSizeChange(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* 3. The 6 Master Theme Palettes (السمات اللونية الست) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold">
            السمات اللونية المعتمدة (TEMAS):
          </span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {THEME_OPTIONS.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onThemeChange(theme.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                    isActive
                      ? "border-cyan-400 bg-cyan-950/40 text-white font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                      : "border-slate-800 bg-[#010813] text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-3 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span className="truncate">{theme.namePt}</span>
                  </div>
                  {isActive && <span className="size-1.5 rounded-full bg-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset Button */}
        {onResetPhysics && (
          <button
            type="button"
            onClick={onResetPhysics}
            className="w-full py-2 rounded-xl border border-slate-800 bg-[#010813] hover:border-cyan-500/40 hover:text-white text-slate-400 text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw size={12} />
            <span>إعادة ضبط القيم الافتراضية (RESET)</span>
          </button>
        )}
      </div>
    </div>
  );
}
