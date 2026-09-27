"use client";
import { useMemo, useRef, useState } from "react";
import { STUDIO_DOMAINS, STUDIO_PAGES, type DomainId } from "@/lib/neural-studio/catalog";
import { filamentPath, orbitPosition, type GraphPosition } from "@/lib/neural-studio/workspace";
import SupervisorCore from "./SupervisorCore";
interface Props {
  selected: DomainId; expanded: string[]; onSelect: (id: DomainId) => void;
  onToggle: (id: string) => void; onInspect: (href: string) => void;
  zoom: number; level: number; listening: boolean;
}
export default function NeuralAtlas({ selected, expanded, onSelect, onToggle, onInspect, zoom, level, listening }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const [pins, setPins] = useState<Record<string, GraphPosition>>({});
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const gesture = useRef<{ id: string; start: GraphPosition; initial: GraphPosition; moved: boolean } | null>(null);
  const core = { x: 740, y: 447 };
  const positions = useMemo(() => Object.fromEntries(STUDIO_DOMAINS.map((domain, i) =>
    [domain.id, pins[domain.id] || orbitPosition(i, STUDIO_DOMAINS.length)])), [pins]);
  const point = (e: React.PointerEvent, camera = pan): GraphPosition => {
    const p = svg.current!.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(svg.current!.getScreenCTM()!.inverse());
    return { x: (q.x - core.x - camera.x) / zoom + core.x, y: (q.y - core.y - camera.y) / zoom + core.y };
  };
  const move = (e: React.PointerEvent) => {
    const drag = gesture.current; if (!drag) return;
    const current = point(e, drag.id === "camera" ? drag.initial : pan), dx = current.x - drag.start.x, dy = current.y - drag.start.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    if (drag.id === "camera") setPan({ x: drag.initial.x + dx * zoom, y: drag.initial.y + dy * zoom });
    else setPins(p => ({ ...p, [drag.id]: { x: drag.initial.x + dx, y: drag.initial.y + dy } }));
  };
  const end = () => { setTimeout(() => { gesture.current = null; }, 0); };
  return <svg ref={svg} className="ns-atlas" viewBox="0 0 1672 941" aria-label="خريطة أقسام المنصة"
    onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; }}>
    <defs>
      <filter id="ns-light" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="2.2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <radialGradient id="ns-core-radial"><stop stopColor="var(--ns-ion)" stopOpacity=".22" /><stop offset="1" stopColor="var(--ns-ion)" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="1672" height="941" fill="transparent" onPointerDown={e => {
      gesture.current = { id: "camera", start: point(e), initial: pan, moved: false }; e.currentTarget.setPointerCapture(e.pointerId);
    }} />
    <g transform={`translate(${core.x+pan.x} ${core.y+pan.y}) scale(${zoom}) translate(${-core.x} ${-core.y})`}>
      {[195, 270, 352, 410].map(r => <ellipse key={r} cx="740" cy="447" rx={r*1.18} ry={r}
        className="ns-orbital-track" />)}
      {STUDIO_DOMAINS.map((domain, index) => {
        const position = positions[domain.id], open = expanded.includes(domain.id);
        const pages = STUDIO_PAGES.filter(p => p.domain === domain.id && !p.dynamic);
        const visible = pages.slice(0, open ? pages.length : 3);
        const outward = position.x >= core.x ? 1 : -1;
        const active = selected === domain.id;
        return <g key={domain.id} className={index % 3 === 1 ? "ns-domain ns-gold" : "ns-domain"}>
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={filamentPath(core, position, (i-3)*.035)}
            className="ns-filament" strokeOpacity={active ? .85 : .28} strokeWidth={i===3 ? 1.5 : .55} />)}
          {visible.map((page, i) => {
            const leaf = pins[page.href] || { x: position.x + outward * (open ? 166 : 100), y: position.y + (i-(visible.length-1)/2)*24 };
            return <g key={page.href}>
              <path d={filamentPath(position, leaf, .14)} className="ns-filament" strokeOpacity={open ? .8 : .3} />
              <g role="button" tabIndex={0} aria-label={page.label} data-testid={"node-" + page.href}
                onPointerDown={e => { e.stopPropagation(); gesture.current = { id: page.href, start: point(e), initial: leaf, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
                onClick={() => { if (!gesture.current?.moved) onInspect(page.href); }}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onInspect(page.href); } }}
                className="ns-leaf" transform={`translate(${leaf.x} ${leaf.y})`}>
                <circle r="12" fill="transparent" /><circle r="5" className="ns-node-ring" /><circle r="2" className="ns-node-dot" />
                <text x={outward*12} y="5" textAnchor={outward>0?"start":"end"} direction="rtl" className="ns-leaf-label">{page.label}</text>
              </g>
            </g>;
          })}
          <g role="button" tabIndex={0} data-testid={"domain-" + domain.id} aria-label={domain.label}
            aria-expanded={open} className="ns-domain-hub" transform={`translate(${position.x} ${position.y})`}
            onPointerDown={e => { e.stopPropagation(); gesture.current = { id: domain.id, start: point(e), initial: position, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
            onClick={() => { if (!gesture.current?.moved) { onSelect(domain.id); onToggle(domain.id); } }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(domain.id); onToggle(domain.id); }
              const dx = e.key === "ArrowRight" ? 12 : e.key === "ArrowLeft" ? -12 : 0;
              const dy = e.key === "ArrowDown" ? 12 : e.key === "ArrowUp" ? -12 : 0;
              if (dx || dy) { e.preventDefault(); setPins(p => ({ ...p, [domain.id]: { x: position.x+dx, y: position.y+dy } })); }
            }}>
            <circle r={active?22:17} className="ns-node-aura" /><circle r="9" className="ns-node-ring" />
            <circle r="4" className="ns-node-dot" />
            <text y="-24" textAnchor="middle" direction="rtl" className="ns-domain-label">{domain.label}</text>
            <title>{pages.length} مسار إداري مكتشف — اضغط للتوسيع، واسحب لتغيير الموضع</title>
          </g>
        </g>;
      })}
      <g transform="translate(740 447)"><SupervisorCore level={level} listening={listening} /></g>
    </g>
  </svg>;
}
