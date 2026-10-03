"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, GripHorizontal, X } from "lucide-react";

export type CyberFloatingPanelProps = {
  id: string;
  title: string;
  subtitle?: string;
  defaultPosition?: { x: number; y: number };
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  width?: number | string;
  zIndex?: number;
  anchor?: "free" | "bottom-center";
  /** بدون max-height وبدون scroll — للكاميرا والمحتوى المضغوط */
  fitContent?: boolean;
  onClose?: () => void;
};

function loadPos(key: string, fallback: { x: number; y: number }) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as { x?: number; y?: number };
    if (typeof p.x === "number" && typeof p.y === "number") return { x: p.x, y: p.y };
  } catch {
    /* default */
  }
  return fallback;
}

function loadBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  return sessionStorage.getItem(key) === "0" ? false : sessionStorage.getItem(key) === "1" ? true : fallback;
}

/** لوحة سيبرانية عائمة: سحب · طي · إغلاق · حفظ الموضع في الجلسة */
export function CyberFloatingPanel({
  id,
  title,
  subtitle,
  defaultPosition,
  defaultOpen = true,
  children,
  className = "",
  width = 360,
  zIndex = 1_000_002,
  anchor = "free",
  fitContent = false,
  onClose,
}: CyberFloatingPanelProps) {
  const posKey = `cyber-panel-pos:${id}`;
  const openKey = `cyber-panel-open:${id}`;
  const collapsedKey = `cyber-panel-collapsed:${id}`;

  const [open, setOpen] = useState(() => loadBool(openKey, defaultOpen));
  const [collapsed, setCollapsed] = useState(() => loadBool(collapsedKey, false));
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const fallback =
      defaultPosition ??
      (anchor === "bottom-center"
        ? { x: Math.max(16, (window.innerWidth - (typeof width === "number" ? width : 520)) / 2), y: window.innerHeight - 200 }
        : { x: 24, y: 88 });
    setPos(loadPos(posKey, fallback));
  }, [anchor, defaultPosition, posKey, width]);

  useEffect(() => {
    sessionStorage.setItem(openKey, open ? "1" : "0");
  }, [open, openKey]);

  useEffect(() => {
    sessionStorage.setItem(collapsedKey, collapsed ? "1" : "0");
  }, [collapsed, collapsedKey]);

  const persistPos = useCallback(
    (next: { x: number; y: number }) => {
      setPos(next);
      try {
        sessionStorage.setItem(posKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [posKey]
  );

  const onDragStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (!pos) return;
    const sx = e.clientX - pos.x;
    const sy = e.clientY - pos.y;
    const move = (ev: PointerEvent) => {
      const w = typeof width === "number" ? width : 420;
      persistPos({
        x: Math.min(Math.max(8, ev.clientX - sx), window.innerWidth - Math.min(w, window.innerWidth - 16)),
        y: Math.min(Math.max(64, ev.clientY - sy), window.innerHeight - 48),
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-[1000002] px-3 py-1.5 rounded-xl border border-cyan-500/45 bg-[#020b18]/95 text-cyan-200 text-xs font-mono shadow-[0_0_18px_rgba(0,229,255,0.25)] hover:border-cyan-300"
        style={{ left: pos?.x ?? 24, top: pos?.y ?? 88 }}
      >
        {title}
      </button>
    );
  }

  if (!pos) return null;

  return (
    <div
      dir="rtl"
      className={`fixed flex flex-col overflow-hidden rounded-2xl border border-cyan-500/35 bg-[#020b18]/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(0,229,255,0.18)] ${className}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: typeof width === "number" ? Math.min(width, window.innerWidth - 24) : width,
        maxHeight: collapsed || fitContent ? "none" : "min(72vh, 640px)",
        zIndex,
      }}
    >
      <div
        onPointerDown={onDragStart}
        className="flex items-center gap-2 px-3 py-2 border-b border-cyan-500/25 cursor-grab active:cursor-grabbing select-none bg-[#031124]/90"
      >
        <GripHorizontal size={14} className="text-cyan-500/70 shrink-0" />
        <div className="flex-1 min-w-0 text-right">
          <div className="text-xs font-bold text-white truncate">{title}</div>
          {subtitle ? <div className="text-[10px] text-slate-400 truncate">{subtitle}</div> : null}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 rounded-lg border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15"
          title={collapsed ? "توسيع" : "طي"}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
          className="p-1 rounded-lg border border-slate-600/50 text-slate-400 hover:text-white hover:border-rose-500/50"
          title="إخفاء"
        >
          <X size={14} />
        </button>
      </div>
      {!collapsed ? (
        <div className={fitContent ? "overflow-visible" : "min-h-0 overflow-auto flex-1"}>{children}</div>
      ) : null}
    </div>
  );
}
