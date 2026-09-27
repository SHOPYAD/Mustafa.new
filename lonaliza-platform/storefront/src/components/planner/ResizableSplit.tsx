"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function ResizableSplit({
  start,
  end,
  defaultPct = 30,
  minPct = 22,
  maxPct = 58,
  storageKey,
  className,
}: {
  start: ReactNode;
  end: ReactNode;
  defaultPct?: number;
  minPct?: number;
  maxPct?: number;
  storageKey?: string;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(defaultPct);
  const drag = useRef(false);

  useEffect(() => {
    if (!storageKey) return;
    const raw = window.localStorage.getItem(storageKey);
    const n = Number(raw);
    if (n >= minPct && n <= maxPct) setPct(n);
  }, [maxPct, minPct, storageKey]);

  const persist = useCallback(
    (next: number) => {
      setPct(next);
      if (storageKey) window.localStorage.setItem(storageKey, String(next));
    },
    [storageKey]
  );

  const onMove = useCallback(
    (clientX: number) => {
      const box = boxRef.current;
      if (!box || !drag.current) return;
      const rect = box.getBoundingClientRect();
      const rtl = getComputedStyle(box).direction === "rtl";
      const x = rtl ? rect.right - clientX : clientX - rect.left;
      const next = Math.min(maxPct, Math.max(minPct, (x / rect.width) * 100));
      persist(next);
    },
    [maxPct, minPct, persist]
  );

  useEffect(() => {
    const move = (e: PointerEvent) => onMove(e.clientX);
    const up = () => {
      drag.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [onMove]);

  return (
    <div ref={boxRef} className={cn("flex h-full min-h-0 min-w-0 flex-1 overflow-hidden", className)}>
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden" style={{ width: `${pct}%` }}>
        {start}
      </div>
      <button
        type="button"
        aria-label="resize"
        onPointerDown={(e) => {
          e.preventDefault();
          drag.current = true;
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
        className="group relative z-10 w-3 shrink-0 cursor-col-resize bg-transparent"
      >
        <span className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2 bg-[#E4DFF3] group-hover:bg-[#7C3AED] group-hover:shadow-[0_0_0_2px_rgba(124,58,237,0.15)]" />
      </button>
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{end}</div>
    </div>
  );
}
