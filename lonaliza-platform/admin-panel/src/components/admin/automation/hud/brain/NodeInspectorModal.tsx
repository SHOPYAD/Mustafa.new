"use client";

import React from "react";
import type { BrainNode } from "@/app/api/admin/automation/second-brain-data/route";
import {
  X,
  Database,
  Cpu,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  Send,
} from "lucide-react";

interface NodeInspectorModalProps {
  node: BrainNode | null;
  onClose: () => void;
  onDiscussWithAgent?: (node: BrainNode) => void;
}

export default function NodeInspectorModal({
  node,
  onClose,
  onDiscussWithAgent,
}: NodeInspectorModalProps) {
  if (!node) return null;

  const scorePct = node.score ? Math.round(node.score * 100) : 95;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-5 rounded-2xl border border-cyan-500/40 bg-[#020813]/95 text-slate-100 shadow-[0_0_35px_rgba(0,229,255,0.2)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                تفتيش الذاكرة المتجهة (Qdrant Inspector)
              </span>
              <span className="text-xs font-mono text-cyan-300">
                المجموعة: {node.collection}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Node Title & Match Score */}
        <div className="flex items-start justify-between gap-3 text-right">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white tracking-wide">
              {node.label}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {node.summary}
            </p>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 shrink-0">
            <span className="text-xs font-bold font-mono text-cyan-300">
              {scorePct}%
            </span>
            <span className="text-[8px] font-mono text-slate-400">
              تطابق دلالي
            </span>
          </div>
        </div>

        {/* Payload Grid */}
        <div className="flex flex-col gap-1.5 bg-[#050e1c] p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            حمولة المتجه الحقيقية (Vector Payload):
          </span>
          <pre className="scrollbar-cyber text-[11px] font-mono text-cyan-300 overflow-x-auto overflow-y-auto max-h-40 p-2 rounded bg-black/40 border border-slate-800/80 leading-relaxed text-left" dir="ltr">
            {JSON.stringify(node.payload, null, 2)}
          </pre>
        </div>

        {/* Footer & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{new Date(node.timestamp).toLocaleString("ar-SA")}</span>
          </span>

          {onDiscussWithAgent && (
            <button
              type="button"
              onClick={() => onDiscussWithAgent(node)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_12px_#00e5ff]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>استدعاء الوكيل المختص</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
