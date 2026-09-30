"use client";

import React, { useRef } from "react";
import { GripVertical, Maximize2, Minus, Pin, X } from "lucide-react";
import { useWindowStore, type WindowState } from "@/lib/studio/windows/window-store";
import { FONT, UI } from "@/lib/studio/tokens";

/**
 * الإطار الموحد لكل نافذة في الاستوديو. x/y بكسل شاشة، w/h وحدات تصميم تُضرب في scale.
 */
export function WindowChrome({
  win,
  scale,
  icon,
  children,
  closable = true,
  bodyPadding = 12,
}: {
  win: WindowState;
  scale: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
  closable?: boolean;
  bodyPadding?: number;
}) {
  const { focus, move, resize, close, toggleMin, toggleMax, togglePin, viewport } = useWindowStore();
  const ref = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    focus(win.id);
    const sx = e.clientX - win.x;
    const sy = e.clientY - win.y;
    const onMove = (ev: PointerEvent) => move(win.id, ev.clientX - sx, ev.clientY - sy);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    focus(win.id);
    const sx = e.clientX;
    const sy = e.clientY;
    const w0 = win.w;
    const h0 = win.h;
    const onMove = (ev: PointerEvent) => resize(win.id, w0 + (ev.clientX - sx) / scale, h0 + (ev.clientY - sy) / scale);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.target !== ref.current) return;
    const step = e.shiftKey ? 40 : 10;
    if (e.key === "Escape" && closable) close(win.id);
    else if (e.key === "ArrowLeft") move(win.id, win.x - step, win.y);
    else if (e.key === "ArrowRight") move(win.id, win.x + step, win.y);
    else if (e.key === "ArrowUp") move(win.id, win.x, win.y - step);
    else if (e.key === "ArrowDown") move(win.id, win.x, win.y + step);
    else return;
    e.preventDefault();
  };

  const maxed = win.max;
  const zoom = scale > 0 ? scale : 1;
  const left = (maxed ? 16 : win.x) / zoom;
  const top = (maxed ? 70 * zoom : win.y) / zoom;
  const width = maxed ? (viewport.w - 32) / scale : win.w;
  const height = win.min ? UI.barH : maxed ? (viewport.h - 70 * scale - 100 * scale) / scale : win.h;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={win.title}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={() => focus(win.id)}
      onWheel={(event) => event.stopPropagation()}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        zoom: scale,
        zIndex: 40 + win.z,
        borderRadius: UI.radius,
        border: `1px solid ${UI.border}`,
        background: UI.panel,
        boxShadow: `${UI.glow}, inset 0 0 18px rgba(64,214,245,0.05)`,
        fontFamily: FONT,
        color: UI.text,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        outline: "none",
      }}
    >
      <div
        onPointerDown={startDrag}
        onDoubleClick={() => toggleMax(win.id)}
        style={{ height: UI.barH, flex: "0 0 auto", display: "flex", alignItems: "center", gap: 6, padding: "0 10px", borderBottom: win.min ? 0 : `1px solid ${UI.borderSoft}`, cursor: "grab", direction: "ltr" }}
      >
        {closable ? <ChromeBtn label="إغلاق" onClick={() => close(win.id)}><X size={16} /></ChromeBtn> : null}
        <ChromeBtn label="تكبير" onClick={() => toggleMax(win.id)}><Maximize2 size={14} /></ChromeBtn>
        <ChromeBtn label="تصغير" onClick={() => toggleMin(win.id)}><Minus size={16} /></ChromeBtn>
        <ChromeBtn label="تثبيت" active={win.pinned} onClick={() => togglePin(win.id)}><Pin size={14} /></ChromeBtn>
        <span dir="rtl" style={{ flex: 1, textAlign: "right", fontSize: 16.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{win.title}</span>
        {icon}
        <GripVertical size={16} color={UI.textFaint} />
      </div>
      {!win.min ? (
        <div dir="rtl" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: bodyPadding }}>
          {children}
        </div>
      ) : null}
      {!win.min && !maxed ? (
        <span aria-hidden onPointerDown={startResize} style={{ position: "absolute", right: 0, bottom: 0, width: 16, height: 16, cursor: "nwse-resize", background: `linear-gradient(135deg, transparent 50%, ${UI.borderSoft} 50%)` }} />
      ) : null}
    </div>
  );
}

function ChromeBtn({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{ width: 24, height: 24, display: "grid", placeItems: "center", border: 0, borderRadius: 6, background: active ? "rgba(64,214,245,0.18)" : "transparent", color: active ? UI.accent : "#c9d8df", cursor: "pointer", padding: 0 }}
    >
      {children}
    </button>
  );
}

export function Pill({ children, tone = UI.accent }: { children: React.ReactNode; tone?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 8px", borderRadius: 10, border: `1px solid ${tone}55`, color: tone, fontSize: 12, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function CyberButton({ children, onClick, tone = UI.accent, disabled, title }: { children: React.ReactNode; onClick?: () => void; tone?: string; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, border: `1px solid ${tone}99`, background: `${tone}1a`, color: tone, fontSize: 13.5, fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, whiteSpace: "nowrap" }}
    >
      {children}
    </button>
  );
}
