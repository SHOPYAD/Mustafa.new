"use client";

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Cpu, Play, CheckCircle2 } from "lucide-react";
import type { NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import type { HubMetrics } from "../NexusSystemCard";

export interface InStudioSectionOverlayProps {
  card: NexusHubCard | null;
  metrics?: HubMetrics | null;
  onClose: () => void;
  onSendDirective?: (directive: string) => Promise<string | void> | void;
  onOpenRealSection?: (card: NexusHubCard) => void;
}

export const InStudioSectionOverlay = memo(function InStudioSectionOverlay({
  card,
  metrics,
  onClose,
  onSendDirective,
  onOpenRealSection,
}: InStudioSectionOverlayProps) {
  if (!card) return null;

  const embedHref = `${card.href}${card.href.includes("?") ? "&" : "?"}studio=1`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 pointer-events-auto">
        {/* Dark blur backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Window Container - 100% Cyber Liquid Obsidian Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          style={{
            backgroundColor: "rgba(2, 11, 24, 0.98)",
            borderColor: "rgba(0, 240, 255, 0.55)",
            boxShadow: "0 0 70px rgba(0, 240, 255, 0.35), inset 0 0 30px rgba(0, 240, 255, 0.08)",
          }}
          className="relative z-10 flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border text-white backdrop-blur-2xl"
          dir="rtl"
        >
          {/* Top Cyber Header Bar */}
          <div
            style={{
              backgroundColor: "rgba(4, 18, 38, 0.92)",
              borderBottomColor: "rgba(0, 240, 255, 0.25)",
            }}
            className="flex items-center justify-between border-b px-5 py-3.5"
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  backgroundColor: "rgba(0, 240, 255, 0.15)",
                  borderColor: "rgba(0, 240, 255, 0.6)",
                  boxShadow: "0 0 15px rgba(0, 240, 255, 0.4)",
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border text-cyan-300"
              >
                <Cpu size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">{card.titleAr}</h3>
                  <span
                    style={{
                      backgroundColor: "rgba(0, 240, 255, 0.18)",
                      borderColor: "rgba(0, 240, 255, 0.4)",
                    }}
                    className="rounded-full border px-2 py-0.2 font-mono text-[10px] font-bold text-cyan-300"
                  >
                    {card.category}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-cyan-300/80">{card.titleEn}</p>
              </div>
            </div>

            {/* Action Buttons: Open Full Window & Close */}
            <div className="flex items-center gap-2.5">
              {onOpenRealSection && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenRealSection(card);
                    onClose();
                  }}
                  style={{
                    backgroundColor: "rgba(0, 240, 255, 0.2)",
                    borderColor: "rgba(0, 240, 255, 0.6)",
                  }}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/35 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  <ExternalLink size={13} />
                  فتح في نافذة كاملة
                </button>
              )}

              <span
                style={{
                  backgroundColor: "rgba(2, 14, 30, 0.8)",
                  borderColor: "rgba(0, 240, 255, 0.25)",
                }}
                className="hidden sm:inline-block rounded-lg border px-2.5 py-1 text-[11px] font-medium text-cyan-200"
              >
                ✊ اقبض يدك أو انقر للإغلاق
              </span>

              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.18)",
                  borderColor: "rgba(239, 68, 68, 0.5)",
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border text-red-300 hover:bg-red-500/35 hover:text-white transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                title="إغلاق النافذة"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body: Live Real Section Embedded View & Controls */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3.5">
            {/* Top Quick Status & Actions Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/25 bg-[#031124]/85 px-4 py-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-bold">المسار الفعلي:</span>
                <code className="rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-amber-300 border border-amber-500/30">
                  {card.href}
                </code>
              </div>

              {/* Recommended Quick Trigger */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-200">الإجراء السريع:</span>
                <button
                  type="button"
                  onClick={() => onSendDirective?.(card.quickActionCommand)}
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.25)",
                    borderColor: "rgba(245, 158, 11, 0.65)",
                  }}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[11px] font-bold text-amber-100 hover:bg-amber-500/35 transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                >
                  <Play size={11} />
                  تشغيل فوري
                </button>
              </div>
            </div>

            {/* Real Live Admin Section Embedded Frame */}
            <div className="relative flex-1 w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#010814] shadow-inner">
              <iframe
                src={embedHref}
                title={card.titleAr}
                className="h-full w-full border-0"
                style={{
                  background: "#020712",
                  colorScheme: "dark",
                }}
              />
            </div>

            {/* Bottom Real Capabilities Badges */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-[11px] font-bold text-slate-300 shrink-0">القدرات والخدمات المتاحة:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {card.features.map((f, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: "rgba(4, 20, 42, 0.8)",
                      borderColor: "rgba(0, 240, 255, 0.25)",
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-0.5 text-[10px] text-cyan-200"
                  >
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

export default InStudioSectionOverlay;
