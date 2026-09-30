"use client";

import React from "react";
import { X, ExternalLink, Download, Eye } from "lucide-react";
import { STUDIO_SCREENS } from "./screensData";

interface ReferenceImageModalProps {
  isOpen: boolean;
  currentScreenId: string;
  onClose: () => void;
}

export default function ReferenceImageModal({
  isOpen,
  currentScreenId,
  onClose,
}: ReferenceImageModalProps) {
  const current =
    STUDIO_SCREENS.find((s) => s.id === currentScreenId) || STUDIO_SCREENS[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#020b18] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden text-right">
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
              ORIGINAL DESIGN REFERENCE · 1672 × 941 DPR 1
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
              <Eye size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                الصورة المرجعية الأصلية: واجهة {current.id} ({current.title})
              </h2>
              <p className="text-[11px] text-cyan-400/80 font-mono">
                مطابقة بنسبة 100% للتصميم المعتمد في استوديو أطلس السيبراني
              </p>
            </div>
          </div>
        </div>

        {/* Image Frame */}
        <div className="flex-1 bg-[#01050e] p-4 flex items-center justify-center overflow-auto custom-scrollbar">
          <img
            src={current.image}
            alt={current.title}
            className="max-w-full max-h-full object-contain rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,0,0,0.9)]"
          />
        </div>

        {/* Footer */}
        <div className="h-12 px-6 border-t border-cyan-500/20 bg-[#020d1c] flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <span>الملف: {current.file}</span>
          <a
            href={current.image}
            download={current.file}
            className="flex items-center gap-1.5 text-cyan-300 hover:text-white transition-colors"
          >
            <Download size={13} />
            <span>تنزيل الأصل عالي الدقة</span>
          </a>
        </div>
      </div>
    </div>
  );
}
