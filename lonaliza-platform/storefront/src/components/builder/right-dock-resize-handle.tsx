"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  RIGHT_DOCK_DEFAULT_WIDTH,
  RIGHT_DOCK_MAX_WIDTH,
  RIGHT_DOCK_MIN_WIDTH,
  useBuilderStore,
} from "@/lib/builder/editor-store";
import { cn } from "@/lib/builder/cn";

export function RightDockResizeHandle({ rtl = false }: { rtl?: boolean }) {
  const width = useBuilderStore((s) => s.rightDockWidth);
  const collapsed = useBuilderStore((s) => s.rightDockCollapsed);
  const setWidth = useBuilderStore((s) => s.setRightDockWidth);
  const toggle = useBuilderStore((s) => s.toggleRightDockCollapsed);
  const setResizing = useBuilderStore((s) => s.setRightDockResizing);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{ startX: number; startWidth: number; moved: boolean } | null>(null);
  const draggedRecently = useRef(false);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || collapsed) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = { startX: e.clientX, startWidth: width, moved: false };
      setDragging(true);
      setResizing(true);
    },
    [width, collapsed, setResizing]
  );

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const delta = dragState.current.startX - e.clientX;
      const directional = rtl ? -delta : delta;
      if (Math.abs(directional) > 2) dragState.current.moved = true;
      setWidth(dragState.current.startWidth + directional);
    },
    [rtl, setWidth]
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
      setResizing(false);
    },
    [setResizing]
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

  const Chevron = collapsed
    ? rtl
      ? ChevronRight
      : ChevronLeft
    : rtl
      ? ChevronLeft
      : ChevronRight;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize inspector"
      aria-valuenow={collapsed ? 0 : width}
      aria-valuemin={RIGHT_DOCK_MIN_WIDTH}
      aria-valuemax={RIGHT_DOCK_MAX_WIDTH}
      onPointerDown={startDrag}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => {
        if (!collapsed) setWidth(RIGHT_DOCK_DEFAULT_WIDTH);
      }}
      className={cn(
        "group/resize relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center hover:bg-emerald-200/50",
        dragging && "bg-emerald-300/60"
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          if (draggedRecently.current) {
            e.preventDefault();
            return;
          }
          toggle();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={collapsed ? "Expand inspector" : "Collapse inspector"}
        className={cn(
          "relative z-10 flex h-14 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-emerald-400 hover:text-emerald-700",
          collapsed ? "opacity-100" : "opacity-0 group-hover/resize:opacity-100",
          dragging && "opacity-100"
        )}
      >
        <Chevron className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
