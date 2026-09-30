"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Layers, Sparkles, LayoutGrid, Check } from "lucide-react";
import { STUDIO_SCREENS, StudioScreenDef } from "./screensData";

interface ScreenSelectorModalProps {
  isOpen: boolean;
  currentScreenId: string;
  onClose: () => void;
  onSelectScreen: (screenId: string) => void;
  screens?: StudioScreenDef[];
}

export default function ScreenSelectorModal({
  isOpen,
  currentScreenId,
  onClose,
  onSelectScreen,
  screens = STUDIO_SCREENS,
}: ScreenSelectorModalProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const list = screens || STUDIO_SCREENS;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.id.includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.scope.toLowerCase().includes(q) ||
        s.layout.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#020b18] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="h-16 px-6 border-b border-cyan-500/30 bg-[#031429]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition-all"
            >
              <X size={18} />
            </button>
            <span className="text-xs font-mono text-cyan-400">
              20 SCREENS ARCHITECTURE · MATRICES & FLOWS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                مستكشف واجهات الاستوديو السيبراني العشرين (20 Screens Navigator)
              </h2>
              <p className="text-[11px] text-cyan-400/80 font-mono">
                تنقل فوري ومباشر بين كافة شاشات المنصة ونواة العمليات
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-cyan-500/20 bg-[#020d1c] shrink-0">
          <div className="relative max-w-md mr-auto">
            <Search size={16} className="absolute right-3.5 top-3 text-cyan-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن واجهة بالرقم أو الاسم أو التخطيط..."
              className="w-full pr-10 pl-4 py-2 text-xs bg-[#010611] border border-cyan-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>
        </div>

        {/* Screens Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 gap-4 custom-scrollbar">
          {filtered.map((s) => {
            const isSelected = s.id === currentScreenId;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onSelectScreen(s.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between gap-3 group ${
                  isSelected
                    ? "bg-[#031d36] border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.3)] scale-[1.02]"
                    : "bg-[#021020]/80 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-[#03152a]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                      SCREEN {s.id}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-amber-300/80">
                      {s.layout}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {s.scope}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-cyan-500/10">
                  <span>{s.nodes.length} عقد رئيسية</span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Check size={12} />
                      <span>معروضة حالياً</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
