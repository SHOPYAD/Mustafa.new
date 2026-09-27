"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { clampRect, type Rect } from "@/lib/neural-studio/workspace";
interface Props { id: string; title: string; initial: Rect; onClose: () => void; children: ReactNode }
export default function FloatingWindow({ id, title, initial, onClose, children }: Props) {
  const [rect, setRect] = useState(initial), [minimized, setMinimized] = useState(false), [maximized, setMaximized] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const drag = useRef<{ x: number; y: number; rect: Rect; resize: boolean } | null>(null);
  const saved = useRef(initial);
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem("neural-window-v1:" + id) || "null");
      if (value && ["x", "y", "width", "height"].every(k => typeof value[k] === "number" && Number.isFinite(value[k])))
        setRect(clampRect(value, { width: innerWidth, height: innerHeight }));
      else setRect(clampRect(initial, { width: innerWidth, height: innerHeight }));
    } catch { setRect(clampRect(initial, { width: innerWidth, height: innerHeight })); }
    setLoaded(true);
    const resize = () => setRect(r => clampRect(r, { width: innerWidth, height: innerHeight }));
    addEventListener("resize", resize); return () => removeEventListener("resize", resize);
  }, [id]); // initial geometry is only an initial value, never a reset on parent render
  useEffect(() => {
    if (loaded && !maximized) try { localStorage.setItem("neural-window-v1:" + id, JSON.stringify(rect)); } catch {}
  }, [id, rect, loaded, maximized]);
  const maximize = () => {
    if (maximized) setRect(clampRect(saved.current, { width: innerWidth, height: innerHeight }));
    else { saved.current = rect; setRect({ x: 12, y: 80, width: innerWidth - 24, height: innerHeight - 160 }); }
    setMaximized(!maximized); setMinimized(false);
  };
  return <section className="ns-window" data-testid={"window-" + id} aria-label={title}
    style={{ left: rect.x, top: rect.y, width: rect.width, height: minimized ? 44 : rect.height, zIndex: maximized ? 35 : 25 }}>
    <header className="ns-window-bar"
      onPointerDown={e => {
        if (maximized || ((e.target as HTMLElement).closest("button") && !(e.target as HTMLElement).closest(".ns-drag"))) return;
        drag.current = { x: e.clientX, y: e.clientY, rect, resize: false }; e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => { if (drag.current && !drag.current.resize) setRect(clampRect({ ...drag.current.rect,
        x: drag.current.rect.x + e.clientX - drag.current.x, y: drag.current.rect.y + e.clientY - drag.current.y },
        { width: innerWidth, height: innerHeight })); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <button className="ns-drag" aria-label={"تحريك " + title} onKeyDown={e => {
        const dx = e.key === "ArrowRight" ? 16 : e.key === "ArrowLeft" ? -16 : 0;
        const dy = e.key === "ArrowDown" ? 16 : e.key === "ArrowUp" ? -16 : 0;
        if (dx || dy) { e.preventDefault(); setRect(clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy }, { width: innerWidth, height: innerHeight })); }
      }}>⠿</button><strong>{title}</strong>
      <button aria-label={minimized ? "استعادة النافذة" : "تصغير النافذة"} onClick={() => setMinimized(!minimized)}>−</button>
      <button aria-label={maximized ? "استعادة الحجم" : "تكبير النافذة"} onClick={maximize}>□</button>
      <button aria-label={"إغلاق " + title} onClick={onClose}>×</button>
    </header>
    {!minimized && <div className="ns-window-body" dir="rtl">{children}</div>}
    {!minimized && !maximized && <button className="ns-resize" aria-label={"تغيير حجم " + title}
      onPointerDown={e => { drag.current = { x: e.clientX, y: e.clientY, rect, resize: true }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={e => { if (drag.current?.resize) setRect(clampRect({ ...drag.current.rect,
        width: drag.current.rect.width + e.clientX - drag.current.x, height: drag.current.rect.height + e.clientY - drag.current.y },
        { width: innerWidth, height: innerHeight })); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      onKeyDown={e => {
        const dx = e.key === "ArrowRight" ? 16 : e.key === "ArrowLeft" ? -16 : 0;
        const dy = e.key === "ArrowDown" ? 16 : e.key === "ArrowUp" ? -16 : 0;
        if (dx || dy) { e.preventDefault(); setRect(clampRect({ ...rect, width: rect.width + dx, height: rect.height + dy }, { width: innerWidth, height: innerHeight })); }
      }}>◢</button>}
  </section>;
}
