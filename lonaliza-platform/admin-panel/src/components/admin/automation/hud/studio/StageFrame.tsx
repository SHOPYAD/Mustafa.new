"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppWindow, ChevronRight, Hand, HelpCircle, Home, List, Mic, Minus, Plus, Settings } from "lucide-react";
import { STAGE_H, STAGE_W, paintSupervisorDisc, paintSupervisorWave } from "@/lib/neural-studio/expansion-scene";

export const FONT = "'Noto Sans Arabic', 'IBM Plex Sans Arabic', Tahoma, sans-serif";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap";
export const LINE = "rgba(64,214,245,0.55)";
export const PANEL_BG = "rgba(5,19,33,0.9)";

export type DataTone = "loading" | "live" | "partial" | "denied" | "error";

export interface DataNote {
  text: string;
  tone: DataTone;
  detail?: string;
}

const NOTE_COLOR: Record<DataTone, string> = {
  loading: "#8aa0ab",
  live: "#3fe3c4",
  partial: "#ffc94a",
  denied: "#ffb020",
  error: "#ff5d6c",
};

/** props المشتركة بين كل مراحل الاستوديو ذات الإطار المرجعي. */
export interface StudioStageProps {
  depthLevel: number;
  onSelectDepthLevel: (level: number) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  panEnabled: boolean;
  onTogglePan: () => void;
  onResetWindows: () => void;
  isListening: boolean;
  isAgentSpeaking?: boolean;
  audioFrequencies?: number[];
  onToggleListening: () => void;
  onStopListening: () => void;
  onOpenScreen: (screenId: string) => void;
  onOpenScreenSwitcher: () => void;
  onExitHome: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onFreshness?: (note: string) => void;
  /** محور يعمل عليه الوكيل الآن؛ تبرزه الواجهة. */
  focusNodeId?: string | null;
  /** يرسل مهمة ذات نطاق إلى خلية الوكلاء ويعيد رد المشرف. */
  onAskAgent?: (directive: string) => Promise<string>;
}

export function useStageFont() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
}

export function useStageScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [box, setBox] = useState({ k: 1, x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || STAGE_W;
      const h = el.clientHeight || STAGE_H;
      const k = Math.min(w / STAGE_W, h / STAGE_H);
      setBox({ k, x: (w - STAGE_W * k) / 2, y: (h - STAGE_H * k) / 2 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return box;
}

/** سحب نافذة داخل المسرح بإحداثيات 1672×941. */
export function beginStageDrag(
  event: React.PointerEvent,
  k: number,
  pos: { x: number; y: number },
  set: (p: { x: number; y: number }) => void,
  width: number
) {
  if ((event.target as HTMLElement).closest("button, input")) return;
  event.preventDefault();
  const sx = event.clientX;
  const sy = event.clientY;
  const move = (ev: PointerEvent) => {
    const x = pos.x + (ev.clientX - sx) / k;
    const y = pos.y + (ev.clientY - sy) / k;
    set({ x: Math.min(STAGE_W - width, Math.max(0, x)), y: Math.min(STAGE_H - 85 - 40, Math.max(60, y)) });
  };
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

export function StageHeader({
  crumbs,
  title,
  subtitle = "منصة عمليات المعرفة المؤسسية",
  depthLevel,
  onSelectDepthLevel,
  onExitHome,
  onOpenScreenSwitcher,
}: {
  crumbs: [string, string];
  title: string;
  subtitle?: string;
  depthLevel: number;
  onSelectDepthLevel: (level: number) => void;
  onExitHome: () => void;
  onOpenScreenSwitcher: () => void;
}) {
  const depthDots = [3, 2, 1, 0];
  return (
    <header
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: STAGE_W,
        height: 60,
        background: "linear-gradient(180deg, rgba(4,18,32,0.94), rgba(3,13,24,0.86))",
        borderBottom: `1px solid ${LINE}`,
        boxShadow: "0 1px 12px rgba(64,214,245,0.18)",
      }}
    >
      <button type="button" aria-label="الرئيسية" onClick={onExitHome} style={{ position: "absolute", left: 27, top: 11, width: 53, height: 40, borderRadius: 8, border: "1.5px solid rgba(64,214,245,0.85)", background: "rgba(6,42,58,0.6)", display: "grid", placeItems: "center", boxShadow: "0 0 12px rgba(64,214,245,0.3)", cursor: "pointer" }}>
        <Home size={26} color="#5fe8ff" strokeWidth={1.8} />
      </button>
      <button type="button" onClick={() => { window.location.href = "/admin"; }} dir="rtl" style={{ position: "absolute", left: 90, top: 11, height: 40, padding: "0 12px", borderRadius: 8, border: "1.5px solid rgba(255,190,90,0.75)", background: "rgba(40,24,4,0.55)", color: "#ffd27a", fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px rgba(255,190,90,0.25)" }}>
        الوضع العادي
      </button>
      <div style={{ position: "absolute", left: 230, top: 13, height: 34, display: "flex", alignItems: "center" }}>
        <ChevronRight size={22} color="#e2eef4" style={{ marginRight: 22 }} />
        <button type="button" onClick={onOpenScreenSwitcher} dir="rtl" style={{ fontSize: 17.5, color: "#d3e0e8", background: "transparent", border: 0, padding: 0, cursor: "pointer", whiteSpace: "nowrap", fontFamily: FONT, marginRight: 20 }}>
          {crumbs[0]}
        </button>
        <ChevronRight size={22} color="#e2eef4" style={{ marginRight: 13 }} />
        <span dir="rtl" style={{ fontSize: 17.5, color: "#e8f3f8", whiteSpace: "nowrap" }}>
          {crumbs[1]}
        </span>
      </div>

      <div style={{ position: "absolute", left: 845, top: 12, width: 345, height: 38, borderRadius: 19, border: `1px solid ${LINE}`, background: "rgba(3,16,28,0.86)" }}>
        <span style={{ position: "absolute", left: 14, top: 6, width: 34, height: 25, borderRadius: 5, border: "1px solid rgba(64,214,245,0.8)", color: "#eaf6fb", fontSize: 15, fontWeight: 700, display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif" }}>
          L{depthLevel}
        </span>
        <span style={{ position: "absolute", left: 71, top: 18, width: 125, height: 2, background: "rgba(150,210,230,0.55)" }} />
        {depthDots.map((level, i) => {
          const active = level === depthLevel;
          return (
            <button
              key={level}
              type="button"
              aria-label={`مستوى العمق L${level}`}
              onClick={() => onSelectDepthLevel(level)}
              style={{
                position: "absolute",
                left: 71 + i * 41.5 - (active ? 10 : 6),
                top: 19 - (active ? 10 : 6),
                width: active ? 20 : 12,
                height: active ? 20 : 12,
                borderRadius: 12,
                border: active ? "2px solid #5fe8ff" : "1.5px solid rgba(190,225,238,0.8)",
                background: active ? "radial-gradient(circle, #e9fdff 0 38%, rgba(4,30,44,1) 42%)" : "#041726",
                boxShadow: active ? "0 0 10px rgba(95,232,255,0.8)" : "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          );
        })}
        <span dir="rtl" style={{ position: "absolute", right: 18, top: 5, fontSize: 14, color: "#dbe9f0", whiteSpace: "nowrap" }}>
          مستوى العمق :
        </span>
      </div>

      <span dir="rtl" style={{ position: "absolute", right: 91, top: 13, fontSize: 26, fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", lineHeight: "30px" }}>
        {title}
      </span>
      <span dir="rtl" style={{ position: "absolute", right: 92, top: 37, fontSize: 15.5, color: "#b6c7d1", whiteSpace: "nowrap", lineHeight: "20px" }}>
        {subtitle}
      </span>
      <svg width="48" height="48" viewBox="0 0 48 48" style={{ position: "absolute", left: 1608, top: 6 }}>
        <circle cx="24" cy="24" r="21" fill="rgba(4,30,44,0.8)" stroke="#40d6f5" strokeWidth="1.4" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <g key={i}>
              <line x1={24} y1={24} x2={24 + Math.cos(a) * 14} y2={24 + Math.sin(a) * 14} stroke="#8ff0ff" strokeWidth="1.2" />
              <circle cx={24 + Math.cos(a) * 14} cy={24 + Math.sin(a) * 14} r="1.8" fill="#bff8ff" />
            </g>
          );
        })}
        <circle cx="24" cy="24" r="7" fill="none" stroke="#8ff0ff" strokeWidth="1.2" />
        <circle cx="24" cy="24" r="2.5" fill="#e6fdff" />
      </svg>
    </header>
  );
}

export function StageDock({
  note,
  panEnabled,
  isListening,
  audioFrequencies = [],
  onToggleListening,
  onStopListening,
  onTogglePan,
  onZoomIn,
  onZoomOut,
  onResetWindows,
  onOpenScreenSwitcher,
  onOpenHelp,
  onOpenSettings,
}: Pick<
  StudioStageProps,
  | "panEnabled"
  | "isListening"
  | "audioFrequencies"
  | "onToggleListening"
  | "onStopListening"
  | "onTogglePan"
  | "onZoomIn"
  | "onZoomOut"
  | "onResetWindows"
  | "onOpenScreenSwitcher"
  | "onOpenHelp"
  | "onOpenSettings"
> & { note: DataNote }) {
  const bars = useMemo(() => {
    const base = [6, 12, 20, 30, 18, 36, 26, 40, 22, 34, 14, 28, 38, 24, 32, 16, 26, 36, 20, 30, 12, 22, 16, 10, 8, 6];
    return base.map((h, i) => {
      if (!isListening || audioFrequencies.length === 0) return h;
      const f = audioFrequencies[i % audioFrequencies.length] || 0;
      return Math.max(4, Math.round(f * 42));
    });
  }, [audioFrequencies, isListening]);
  return (
    <footer style={{ position: "absolute", left: 0, top: 856, width: STAGE_W, height: 85 }}>
      <svg width={STAGE_W} height={85} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="dock-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(4,17,30,0.96)" />
            <stop offset="1" stopColor="rgba(2,9,17,0.99)" />
          </linearGradient>
        </defs>
        <path d={`M0 0 L404 0 L431 6 L${STAGE_W} 6 L${STAGE_W} 85 L0 85 Z`} fill="url(#dock-fill)" />
        <path d={`M0 0.5 L404 0.5 L431 6.5 L${STAGE_W} 6.5`} fill="none" stroke="rgba(64,214,245,0.8)" strokeWidth="1.5" />
        <path d={`M0 0.5 L404 0.5 L431 6.5 L${STAGE_W} 6.5`} fill="none" stroke="rgba(64,214,245,0.25)" strokeWidth="6" />
      </svg>
      <div style={{ position: "absolute", left: 22, top: 12, width: 391, height: 60, borderRadius: 30, border: "1px solid rgba(64,214,245,0.35)", background: "rgba(3,14,26,0.9)" }} />
      <button type="button" aria-label="تشغيل الاستماع" onClick={onToggleListening} style={{ position: "absolute", left: 28, top: 16, width: 52, height: 52, borderRadius: 26, border: "2px solid #45e6ff", background: "radial-gradient(circle, #0f4b5e, #041822)", boxShadow: isListening ? "0 0 22px rgba(69,230,255,0.85)" : "0 0 14px rgba(69,230,255,0.5)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
        <Mic size={24} color="#b7f5ff" />
      </button>
      <span dir="rtl" style={{ position: "absolute", left: 113, top: 41, transform: "translateY(-50%)", fontSize: 15, color: "#d8e8f0", whiteSpace: "nowrap" }}>استمع للأوامر...</span>
      <div style={{ position: "absolute", left: 218, top: 22, width: 103, height: 40, display: "flex", alignItems: "center", gap: 1.6, opacity: isListening ? 1 : 0.55 }}>
        {bars.map((h, i) => (
          <span key={i} style={{ width: 2.2, height: h, borderRadius: 1, background: "#45e6ff", boxShadow: "0 0 6px rgba(69,230,255,0.8)" }} />
        ))}
      </div>
      <button type="button" aria-label="إيقاف الاستماع" onClick={onStopListening} style={{ position: "absolute", left: 356, top: 17, width: 50, height: 50, borderRadius: 25, border: "2px solid #ff4d5e", background: "radial-gradient(circle, #3a0b14, #1a050a)", boxShadow: "0 0 16px rgba(255,77,94,0.55)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
        <span style={{ width: 18, height: 18, borderRadius: 3, background: "#ff4d5e" }} />
      </button>
      <span style={dockSep(438)} />
      <button type="button" aria-label="تحريك" onClick={onTogglePan} style={{ position: "absolute", left: 463, top: 24, width: 42, height: 41, borderRadius: 8, border: `1px solid ${panEnabled ? "#5fe8ff" : "rgba(64,214,245,0.55)"}`, background: panEnabled ? "rgba(20,80,100,0.6)" : "rgba(5,28,42,0.7)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
        <Hand size={22} color="#d8eef6" />
      </button>
      <span dir="rtl" style={{ position: "absolute", left: 519, top: 44, transform: "translateY(-50%)", fontSize: 15, color: "#d8e8f0" }}>تحريك</span>
      <div style={{ position: "absolute", left: 600, top: 19, width: 248, height: 48, borderRadius: 24, border: "1px solid rgba(64,214,245,0.45)", background: "rgba(4,20,34,0.8)" }}>
        <button type="button" aria-label="تصغير" onClick={onZoomOut} style={roundBtn(11)}><Minus size={18} color="#d8eef6" /></button>
        <span dir="rtl" style={{ position: "absolute", left: 131, top: 22, transform: "translate(-50%, -50%)", fontSize: 15, color: "#d8e8f0", whiteSpace: "nowrap" }}>تكبير / تصغير</span>
        <button type="button" aria-label="تكبير" onClick={onZoomIn} style={roundBtn(212)}><Plus size={18} color="#d8eef6" /></button>
      </div>
      <span style={dockSep(870)} />
      <button type="button" aria-label="إعادة النوافذ" onClick={onResetWindows} style={{ position: "absolute", left: 896, top: 22, width: 42, height: 43, borderRadius: 7, border: "1px solid rgba(64,214,245,0.55)", background: "rgba(5,28,42,0.7)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
        <AppWindow size={20} color="#d8eef6" />
      </button>
      <span dir="rtl" style={{ position: "absolute", left: 953, top: 44, transform: "translateY(-50%)", fontSize: 15, color: "#d8e8f0", whiteSpace: "nowrap" }}>إعادة النوافذ</span>
      <button type="button" aria-label="الواجهات" onClick={onOpenScreenSwitcher} style={plainBtn(1223)}><List size={26} color="#d8eef6" /></button>
      <span style={dockSep(1264)} />
      <button type="button" aria-label="المساعدة" onClick={onOpenHelp} style={plainBtn(1309)}><HelpCircle size={26} color="#d8eef6" /></button>
      <button type="button" aria-label="الإعدادات" onClick={onOpenSettings} style={plainBtn(1369)}><Settings size={26} color="#d8eef6" /></button>
      <span style={dockSep(1430)} />
      <span dir="rtl" title={note.detail ?? note.text} style={{ position: "absolute", right: 30, top: 40, transform: "translateY(-50%)", maxWidth: 200, fontSize: 14.5, color: "#c3d2db", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: NOTE_COLOR[note.tone], boxShadow: `0 0 8px ${NOTE_COLOR[note.tone]}` }} />
        {note.text}
      </span>
    </footer>
  );
}

/** قرص الوكيل المشرف؛ size هو القطر المعروض بإحداثيات المسرح. */
export function SupervisorDisc({
  k,
  cx,
  cy,
  size = 220,
  labelTop,
  labelFont = 20,
  isListening,
  isAgentSpeaking = false,
  audioFrequencies = [],
  onOpen,
  variant = "rings",
  labelPill = true,
}: {
  k: number;
  cx: number;
  cy: number;
  size?: number;
  labelTop: number;
  labelFont?: number;
  isListening: boolean;
  isAgentSpeaking?: boolean;
  audioFrequencies?: number[];
  onOpen: () => void;
  variant?: "rings" | "wave";
  labelPill?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const level = useMemo(() => {
    if (!isAgentSpeaking || audioFrequencies.length === 0) return 0;
    return Math.min(1, audioFrequencies.reduce((a, b) => a + b, 0) / audioFrequencies.length / 0.6);
  }, [audioFrequencies, isAgentSpeaking]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const base = 220;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const density = k * dpr * (size / base);
    canvas.width = Math.round(base * density);
    canvas.height = Math.round(base * density);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(density, 0, 0, density, 0, 0);
    const animate = isAgentSpeaking || isListening;
    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      (variant === "wave" ? paintSupervisorWave : paintSupervisorDisc)(ctx, base, level, animate ? (now - start) / 1000 : 0);
      if (animate) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [isAgentSpeaking, isListening, k, level, size, variant]);

  const hit = size * 0.86;
  return (
    <>
      <canvas ref={ref} style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, pointerEvents: "none" }} />
      <button
        type="button"
        onClick={onOpen}
        aria-label="الوكيل المشرف"
        style={{ position: "absolute", left: cx - hit / 2, top: cy - hit / 2, width: hit, height: hit, borderRadius: hit / 2, background: "transparent", border: 0, cursor: "pointer" }}
      />
      <span dir="rtl" style={{ position: "absolute", left: cx, top: labelTop, transform: "translateX(-50%)", padding: "0 12px", height: labelFont * 1.7, borderRadius: 10, background: labelPill ? "rgba(2,10,18,0.78)" : "transparent", color: labelPill ? "#ffffff" : "#e8f2f6", fontSize: labelFont, fontWeight: labelPill ? 700 : 600, textShadow: labelPill ? "none" : "0 0 8px rgba(0,0,0,0.9)", display: "grid", placeItems: "center", pointerEvents: "none", whiteSpace: "nowrap" }}>
        الوكيل المشرف
      </span>
    </>
  );
}

export function iconBtn(left: number, top = 11): React.CSSProperties {
  return { position: "absolute", left, top, width: 22, height: 22, display: "grid", placeItems: "center", background: "transparent", border: 0, cursor: "pointer", padding: 0 };
}

function roundBtn(left: number): React.CSSProperties {
  return { position: "absolute", left, top: 6, width: 34, height: 34, borderRadius: 17, border: "1.5px solid rgba(215,238,246,0.85)", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 };
}

function plainBtn(center: number): React.CSSProperties {
  return { position: "absolute", left: center - 16, top: 28, width: 32, height: 32, display: "grid", placeItems: "center", background: "transparent", border: 0, cursor: "pointer", padding: 0 };
}

function dockSep(left: number): React.CSSProperties {
  return { position: "absolute", left, top: 28, width: 1, height: 31, background: "rgba(64,214,245,0.35)" };
}
