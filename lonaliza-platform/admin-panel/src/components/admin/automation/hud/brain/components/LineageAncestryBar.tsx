"use client";

import React from "react";
import {
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Hexagon,
  Circle,
  LayoutGrid,
  GitBranch,
  SlidersHorizontal,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  useSecondBrainStore,
  type SecondBrainViewMode,
} from "../store/useSecondBrainStore";

interface LineageAncestryBarProps {
  onBackToWarRoom?: () => void;
}

export default function LineageAncestryBar({ onBackToWarRoom }: LineageAncestryBarProps) {
  const {
    viewMode,
    setViewMode,
    selectedClusterId,
    selectedSubModuleId,
    getSelectedCluster,
    getSelectedSubModule,
    selectCluster,
    selectSubModule,
    toggleControlsDrawer,
    controlsDrawerOpen,
    executionMode,
    setExecutionMode,
  } = useSecondBrainStore();

  const cluster = getSelectedCluster();
  const sub = getSelectedSubModule();

  const viewModes: { id: SecondBrainViewMode; labelAr: string; icon: any }[] = [
    { id: "hexagonal", labelAr: "المصفوفة السداسية", icon: Hexagon },
    { id: "sunburst", labelAr: "المجرة المدارية", icon: Circle },
    { id: "command_deck", labelAr: "العمليات الثلاثية", icon: LayoutGrid },
    { id: "deep_circuit", labelAr: "تفكيك الكود DAG", icon: GitBranch },
  ];

  return (
    <div className="relative z-30 px-4 py-2 bg-[#020b18]/95 border-b border-cyan-500/25 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 font-sans select-none shadow-md">
      {/* 1. Left: Lineage Ancestry (الجد -> الأب -> الابن -> الحفيد) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs">
        {/* Grandparent: Lonaliza Core (الجد) */}
        <button
          type="button"
          onClick={() => {
            selectCluster("cluster-flights");
            selectSubModule(null);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-900/60 transition-all font-mono text-[11px]"
        >
          <Shield size={12} className="text-cyan-400" />
          <span className="font-bold">Lonaliza Core</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-200">الجد</span>
        </button>

        <ChevronRight size={13} className="text-slate-500 shrink-0" />

        {/* Parent: Selected Megacluster (الأب) */}
        {cluster && (
          <button
            type="button"
            onClick={() => selectSubModule(null)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#041a38] border border-cyan-400/50 text-white hover:border-cyan-300 transition-all font-mono text-[11px]"
          >
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: cluster.color }}
            />
            <span className="font-bold">{cluster.nameAr}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">الأب</span>
          </button>
        )}

        {/* Child: Selected Sub-Module (الابن) */}
        {sub && (
          <>
            <ChevronRight size={13} className="text-slate-500 shrink-0" />
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-mono text-[11px] shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <Sparkles size={11} className="text-amber-300 animate-pulse" />
              <span className="font-black text-white">{sub.nameAr}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold">الابن</span>
            </div>
          </>
        )}
      </div>

      {/* 2. Center/Right: View Mode Selector Buttons */}
      <div className="flex items-center gap-1 bg-[#010712] p-1 rounded-xl border border-slate-800">
        {viewModes.map((vm) => {
          const Icon = vm.icon;
          const isActive = viewMode === vm.id;
          return (
            <button
              key={vm.id}
              type="button"
              data-view-id={vm.id}
              onClick={() => setViewMode(vm.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon size={13} />
              <span>{vm.labelAr}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Right: Execution Mode & Tuning Drawer Toggle */}
      <div className="flex items-center gap-2">
        {/* Live vs Dry-run Toggle */}
        <div className="flex items-center gap-1 bg-[#010813] px-1.5 py-1 rounded-xl border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => setExecutionMode("live")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold transition-all ${
              executionMode === "live"
                ? "bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap size={10} />
            <span>تنفيذ حي</span>
          </button>
          <button
            type="button"
            onClick={() => setExecutionMode("dry_run")}
            className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
              executionMode === "dry_run"
                ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>محاكاة</span>
          </button>
        </div>

        {/* Cyber Tuning Drawer Toggle */}
        <button
          type="button"
          onClick={toggleControlsDrawer}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            controlsDrawerOpen
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              : "bg-[#031124] border-slate-800 text-slate-300 hover:border-slate-700"
          }`}
        >
          <SlidersHorizontal size={13} />
          <span>الضبط والسمات</span>
        </button>

        {/* Back to War Room */}
        {onBackToWarRoom && (
          <button
            type="button"
            onClick={onBackToWarRoom}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs transition-all"
          >
            <RotateCcw size={12} />
            <span>غرفة القيادة</span>
          </button>
        )}
      </div>
    </div>
  );
}
