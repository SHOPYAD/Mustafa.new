"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  useBuilderStore,
} from "@/lib/builder/editor-store";
import { cn } from "@/lib/builder/cn";

export function SidebarResizeHandle({ rtl = false }: { rtl?: boolean }) {
  const sidebarWidth = useBuilderStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useBuilderStore((s) => s.sidebarCollapsed);
  const setSidebarWidth = useBuilderStore((s) => s.setSidebarWidth);
  const toggleSidebarCollapsed = useBuilderStore((s) => s.toggleSidebarCollapsed);
  const setSidebarResizing = useBuilderStore((s) => s.setSidebarResizing);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{ startX: number; startWidth: number; moved: boolean } | null>(null);
  const draggedRecently = useRef(false);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || sidebarCollapsed) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = { startX: e.clientX, startWidth: sidebarWidth, moved: false };
      setDragging(true);
      setSidebarResizing(true);
    },
    [sidebarWidth, sidebarCollapsed, setSidebarResizing]
  );

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const delta = e.clientX - dragState.current.startX;
      const directional = rtl ? -delta : delta;
      if (Math.abs(directional) > 2) dragState.current.moved = true;
      setSidebarWidth(dragState.current.startWidth + directional);
    },
    [rtl, setSidebarWidth]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      if (dragState.current.moved) {
        draggedRecently.current = true;
        window.setTimeout(() => {
          draggedRecently.current = false;
        }, 200);
      }
      dragState.current = null;
      setDragging(false);
      setSidebarResizing(false);
    },
    [setSidebarResizing]
  );

  useEffect(() => {
    if (!dragging) return;
    const style = document.createElement("style");
    style.textContent = `iframe { pointer-events: none !important; } body { cursor: col-resize !important; user-select: none !important; }`;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [dragging]);

  const Chevron = sidebarCollapsed
    ? rtl
      ? ChevronLeft
      : ChevronRight
    : rtl
      ? ChevronRight
      : ChevronLeft;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuenow={sidebarCollapsed ? 0 : sidebarWidth}
      aria-valuemin={SIDEBAR_MIN_WIDTH}
      aria-valuemax={SIDEBAR_MAX_WIDTH}
      onPointerDown={startDrag}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => {
        if (!sidebarCollapsed) setSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
      }}
      className={cn(
        "group/resize relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center hover:bg-emerald-200/50",
        dragging && "bg-emerald-300/60",
        sidebarCollapsed && "cursor-pointer"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-200 group-hover/resize:bg-emerald-400",
          dragging && "bg-emerald-500"
        )}
      />
      <button
        type="button"
        onClick={(e) => {
          if (draggedRecently.current) {
            e.preventDefault();
            return;
          }
          toggleSidebarCollapsed();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "relative z-10 flex h-14 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-emerald-400 hover:text-emerald-700",
          sidebarCollapsed ? "opacity-100" : "opacity-0 group-hover/resize:opacity-100",
          dragging && "opacity-100"
        )}
      >
        <Chevron className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
