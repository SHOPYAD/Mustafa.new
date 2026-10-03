"use client";

import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  ExternalLink,
  Cpu,
  Play,
  GripHorizontal,
  RefreshCw,
  Layers,
} from "lucide-react";
import type { NexusHubCard } from "@/lib/studio/nexus/nexus-cards.generated";
import type { HubMetrics } from "../NexusSystemCard";

export interface NexusStudioFloatingWindowProps {
  card: NexusHubCard | null;
  metrics?: HubMetrics | null;
  onClose: () => void;
  onSendDirective?: (directive: string) => Promise<string | void> | void;
}

export const NexusStudioFloatingWindow = memo(function NexusStudioFloatingWindow({
  card,
  metrics,
  onClose,
  onSendDirective,
}: NexusStudioFloatingWindowProps) {
  if (!card) return null;

  // Window geometry state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Position & Dimensions (clamped safely within viewport bounds)
  const defaultW = Math.min(1060, typeof window !== "undefined" ? window.innerWidth - 48 : 1060);
  const defaultH = Math.min(580, typeof window !== "undefined" ? window.innerHeight - 150 : 580);
  const initialX = typeof window !== "undefined" ? Math.max(20, Math.round((window.innerWidth - defaultW) / 2)) : 60;
  const initialY = 72; // strictly below top header (58px)

  const [pos, setPos] = useState<{ x: number; y: number }>({ x: initialX, y: initialY });
  const [size, setSize] = useState<{ w: number; h: number }>({ w: defaultW, h: defaultH });

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number }>({
    mouseX: 0,
    mouseY: 0,
    winX: initialX,
    winY: initialY,
  });

  // Resizing state
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startW: defaultW,
    startH: defaultH,
  });

  // Drag handlers
  const handleDragPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
    if (isMaximized || isMinimized) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: pos.x,
      winY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    const maxTop = 64; // header clearance
    const maxBottom = window.innerHeight - 76 - 40; // dock clearance
    const nextX = Math.max(12, Math.min(window.innerWidth - size.w - 12, dragStartRef.current.winX + dx));
    const nextY = Math.max(maxTop, Math.min(maxBottom, dragStartRef.current.winY + dy));
    setPos({ x: nextX, y: nextY });
  };

  const handleDragPointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Resize handlers
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (isMaximized || isMinimized) return;
    isResizingRef.current = true;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: size.w,
      startH: size.h,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const dx = e.clientX - resizeStartRef.current.mouseX;
    const dy = e.clientY - resizeStartRef.current.mouseY;
    const nextW = Math.max(480, Math.min(window.innerWidth - pos.x - 20, resizeStartRef.current.startW + dx));
    const nextH = Math.max(300, Math.min(window.innerHeight - pos.y - 78, resizeStartRef.current.startH + dy));
    setSize({ w: nextW, h: nextH });
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const embedHref = `${card.href}${card.href.includes("?") ? "&" : "?"}studio=1`;

  // Render Minimized Dock Pill
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full border border-cyan-400/50 bg-[#020b18]/95 px-5 py-2 text-white shadow-[0_0_25px_rgba(0,240,255,0.4)] backdrop-blur-xl pointer-events-auto"
        dir="rtl"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
          <Cpu size={14} />
        </div>
        <span className="font-bold text-sm text-cyan-200">{card.titleAr}</span>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="rounded-lg bg-cyan-500/20 px-3 py-1 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500/35 transition-colors"
        >
          استعادة النافذة 🗖
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-6 w-6 rounded-md hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X size={14} />
        </button>
      </motion.div>
    );
  }

  // Calculate coordinates based on maximized / normal
  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: "fixed",
        top: 64,
        left: 16,
        right: 16,
        bottom: 74,
        width: "auto",
        height: "auto",
        zIndex: 50,
      }
    : {
        position: "fixed",
        top: pos.y,
        left: pos.x,
        width: size.w,
        height: size.h,
        zIndex: 50,
      };

  return (
    <div
      style={windowStyle}
      className="pointer-events-auto flex flex-col overflow-hidden rounded-[20px] border border-cyan-400/40 bg-[#020b18]/96 text-white shadow-[0_0_50px_rgba(0,240,255,0.3),inset_0_0_24px_rgba(0,240,255,0.06)] backdrop-blur-2xl select-none"
      dir="rtl"
    >
      {/* 1. Cyber Window Header Bar (Draggable) */}
      <div
        onPointerDown={handleDragPointerDown}
        onPointerMove={handleDragPointerMove}
        onPointerUp={handleDragPointerUp}
        className={`flex items-center justify-between border-b border-cyan-500/30 bg-[#031326]/90 px-4 py-2.5 ${
          isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        {/* Left: Window Identity & Drag indicator */}
        <div className="flex items-center gap-3">
          <GripHorizontal size={16} className="text-cyan-400/60" />
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_#00f0ff]">
            <Cpu size={14} />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-white tracking-wide">{card.titleAr}</h3>
            <span className="rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
              {card.category}
            </span>
          </div>
          <span className="font-mono text-xs text-slate-400 border-r border-white/10 pr-2">
            {card.titleEn}
          </span>
        </div>

        {/* Right: Window Controls (Reload, External, Min, Max, Close) */}
        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          {/* Quick Refresh */}
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors"
            title="إعادة تحميل الصفحة"
          >
            <RefreshCw size={12} />
          </button>

          {/* Open full page in new tab */}
          <a
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors"
            title="فتح في نافذة كاملة منفصلة"
          >
            <ExternalLink size={12} />
          </a>

          {/* Minimize / Hide: Black BG + Neon Amber Icon */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            style={{ backgroundColor: "#000000" }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/60 !bg-black text-[#ffaa00] hover:text-[#ffd666] hover:border-amber-400 hover:shadow-[0_0_12px_rgba(255,170,0,0.6)] transition-all cursor-pointer"
            title="تصغير النافذة"
          >
            <Minus size={13} className="stroke-[2.5]" />
          </button>

          {/* Maximize / Restore: Black BG + Neon Cyan Icon */}
          <button
            type="button"
            onClick={() => setIsMaximized((v) => !v)}
            style={{ backgroundColor: "#000000" }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/60 !bg-black text-[#00f0ff] hover:text-white hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,240,255,0.6)] transition-all cursor-pointer"
            title={isMaximized ? "استعادة المقاس الأصلي" : "تكبير النافذة بالكامل"}
          >
            {isMaximized ? <Minimize2 size={12} className="stroke-[2.5]" /> : <Maximize2 size={12} className="stroke-[2.5]" />}
          </button>

          {/* Close: Black BG + Neon Pink/Rose Icon */}
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: "#000000" }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ff0055]/70 !bg-black text-[#ff0055] hover:text-[#ff3377] hover:border-[#ff0055] hover:shadow-[0_0_14px_rgba(255,0,85,0.7)] transition-all cursor-pointer"
            title="إغلاق النافذة"
          >
            <X size={14} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Toolbar: Quick Action & Live Route Status */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#010813]/90 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-cyan-400">المسار الفعلي:</span>
          <span className="rounded bg-black/60 px-2 py-0.5 font-mono text-[11px] text-slate-300 border border-white/10">
            {card.href}
          </span>
        </div>

        {card.quickActionCommand && onSendDirective && (
          <button
            type="button"
            onClick={() => onSendDirective(card.quickActionCommand!)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1 font-mono text-[11px] font-bold text-amber-200 hover:bg-amber-500/35 hover:shadow-[0_0_12px_#ffb703] transition-all"
          >
            <Play size={10} className="fill-current" />
            <span>تشغيل فوري: {card.quickActionCommand.slice(0, 42)}...</span>
          </button>
        )}
      </div>

      {/* 3. Real Interactive Live Admin Page (Iframe) */}
      <div className="relative flex-1 w-full bg-[#000407] overflow-hidden">
        <iframe
          key={iframeKey}
          src={embedHref}
          title={card.titleAr}
          className="h-full w-full border-0"
          style={{
            backgroundColor: "#000407",
            colorScheme: "dark",
          }}
          loading="eager"
        />
      </div>

      {/* 4. Resizable Handle Corner (Only visible when not maximized) */}
      {!isMaximized && (
        <div
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          className="absolute bottom-0 right-0 z-20 flex h-5 w-5 cursor-nwse-resize items-end justify-end p-1 text-cyan-400/60 hover:text-cyan-300 transition-colors"
          title="سحب لتغيير المقاس"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
});

export default NexusStudioFloatingWindow;
