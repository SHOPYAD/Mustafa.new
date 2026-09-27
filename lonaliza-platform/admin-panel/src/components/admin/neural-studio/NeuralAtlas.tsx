"use client";
import { useRef, useState, type CSSProperties } from "react";
import { STUDIO_PAGES, type DomainId } from "@/lib/neural-studio/catalog";
import { ATLAS_CLUSTERS, ATLAS_CORE as core } from "@/lib/neural-studio/atlas-composition";
import { filamentPath, type GraphPosition } from "@/lib/neural-studio/workspace";
import SupervisorCore from "./SupervisorCore";
interface Props {
 selected: DomainId; expanded: string[]; onSelect: (id: DomainId) => void;
 onToggle: (id: string) => void; onInspect: (href: string) => void;
 zoom: number; level: number; listening: boolean;
}
export default function NeuralAtlas({selected,expanded,onSelect,onToggle,onInspect,zoom,level,listening}:Props){
 const svg=useRef<SVGSVGElement>(null);
 const [pins,setPins]=useState<Record<string,GraphPosition>>({});
 const [pan,setPan]=useState({x:0,y:0});
 const gesture=useRef<{id:string;start:GraphPosition;initial:GraphPosition;moved:boolean}|null>(null);
 const point=(e:React.PointerEvent,camera=pan):GraphPosition=>{
  const p=svg.current!.createSVGPoint();p.x=e.clientX;p.y=e.clientY;
  const q=p.matrixTransform(svg.current!.getScreenCTM()!.inverse());
  return {x:(q.x-core.x-camera.x)/zoom+core.x,y:(q.y-core.y-camera.y)/zoom+core.y};
 };
 const begin=(e:React.PointerEvent,id:string,initial:GraphPosition)=>{
  e.stopPropagation();gesture.current={id,start:point(e),initial,moved:false};e.currentTarget.setPointerCapture(e.pointerId);
 };
 const move=(e:React.PointerEvent)=>{
  const drag=gesture.current;if(!drag)return;
  const p=point(e,drag.id==="camera"?drag.initial:pan),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
  if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;
  if(drag.id==="camera")setPan({x:drag.initial.x+dx*zoom,y:drag.initial.y+dy*zoom});
  else setPins(prev=>({...prev,[drag.id]:{x:drag.initial.x+dx,y:drag.initial.y+dy}}));
 };
 const end=()=>{setTimeout(()=>{gesture.current=null;},0);};
 const nudge=(e:React.KeyboardEvent,id:string,p:GraphPosition)=>{
  const dx=e.key==="ArrowRight"?12:e.key==="ArrowLeft"?-12:0,dy=e.key==="ArrowDown"?12:e.key==="ArrowUp"?-12:0;
  if(dx||dy){e.preventDefault();setPins(prev=>({...prev,[id]:{x:p.x+dx,y:p.y+dy}}));}
 };
 return <svg ref={svg} className="ns-atlas" viewBox="0 0 1672 941" aria-label="خريطة أقسام المنصة"
  onPointerMove={move} onPointerUp={end} onPointerCancel={()=>{gesture.current=null;}}>
  <defs>
   <filter id="ns-light" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur stdDeviation="2.1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
   </filter>
   <filter id="ns-bloom" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
   </filter>
   <radialGradient id="ns-corona"><stop stopColor="var(--ns-ion)" stopOpacity=".04"/><stop offset=".6" stopColor="var(--ns-ion)" stopOpacity=".13"/><stop offset="1" stopColor="var(--ns-ion)" stopOpacity="0"/></radialGradient>
   <radialGradient id="ns-amber-volume"><stop stopColor="var(--ns-amber)" stopOpacity=".27"/><stop offset=".65" stopColor="var(--ns-amber)" stopOpacity=".05"/><stop offset="1" stopColor="var(--ns-amber)" stopOpacity=".3"/></radialGradient>
  </defs>
  <rect width="1672" height="941" fill="transparent" onPointerDown={e=>begin(e,"camera",pan)}/>
  <g transform={`translate(${core.x+pan.x} ${core.y+pan.y}) scale(${zoom}) translate(${-core.x} ${-core.y})`}>
   <g aria-hidden="true" className="ns-orbital-scaffold">
    {[157,173,192,218,264,314,378,403,423].map((r,i)=><ellipse key={r} cx={core.x} cy={core.y} rx={r*1.16} ry={r}
     className={"ns-orbital-track "+(i%3===1?"ns-track-gold":"")} />)}
    {Array.from({length:42},(_,i)=>{const a=i*Math.PI*2/42,r=165+(i%4)*82;return <g key={i}>
     <line x1={core.x+Math.cos(a)*144} y1={core.y+Math.sin(a)*144} x2={core.x+Math.cos(a)*478} y2={core.y+Math.sin(a)*414} className="ns-radial-guide"/>
     <circle cx={core.x+Math.cos(a)*r*1.16} cy={core.y+Math.sin(a)*r} r={i%3===0?3:1.5} className={i%4===0?"ns-landmark ns-landmark-gold":"ns-landmark"}/>
    </g>;})}
   </g>
   {ATLAS_CLUSTERS.map(cluster=>{
    const position=pins[cluster.id]||cluster.hub,offset={x:position.x-cluster.hub.x,y:position.y-cluster.hub.y};
    const active=cluster.domains.includes(selected),open=cluster.domains.some(id=>expanded.includes(id));
    const defaults=cluster.pages.map(href=>STUDIO_PAGES.find(p=>p.href===href)).filter((p):p is typeof STUDIO_PAGES[number]=>!!p);
    const additional=open?STUDIO_PAGES.filter(p=>cluster.domains.includes(p.domain as DomainId)&&!p.dynamic&&!cluster.pages.includes(p.href)):[];
    const leaves=[...defaults,...additional];
    const angle=Math.atan2(position.y-core.y,position.x-core.x);
    const from={x:core.x+Math.cos(angle)*140,y:core.y+Math.sin(angle)*140};
    return <g key={cluster.id} className="ns-domain" data-cluster={cluster.id}
     style={{"--ns-domain-color":`var(--ns-${cluster.tone})`} as CSSProperties}>
     {Array.from({length:13},(_,i)=><path key={i} d={filamentPath(from,position,(i-6)*.045)} className="ns-filament"
      strokeOpacity={i===6?.82:.17+Math.abs(i-6)*.023} strokeWidth={i===6?1.45:.55}/>)}
     {leaves.map((page,i)=>{
      const extra=i>=defaults.length,j=extra?i-defaults.length:i;
      const base=extra?{x:cluster.leaf.x+cluster.side*(250+Math.floor(j/8)*225),y:cluster.leaf.y+(j%8)*24}:{x:cluster.leaf.x,y:cluster.leaf.y+i*22};
      const leaf=pins[page.href]||{x:base.x+offset.x,y:base.y+offset.y};
      return <g key={page.href}>
       {[-.26,-.1,.1].map((bend,k)=><path key={k} d={filamentPath(position,leaf,bend)} className="ns-filament" strokeOpacity={k===1?.72:.29} strokeWidth={k===1?.85:.45}/>)}
       <g role="button" tabIndex={0} aria-label={page.label} data-testid={"node-"+page.href} className="ns-leaf"
        transform={`translate(${leaf.x} ${leaf.y})`} onPointerDown={e=>begin(e,page.href,leaf)}
        onClick={()=>{if(!gesture.current?.moved)onInspect(page.href);}}
        onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onInspect(page.href);}nudge(e,page.href,leaf);}}>
        <circle r="11" fill="transparent"/><circle r="6.4" className="ns-node-ring"/><circle r="3.3" className="ns-node-dot"/>
        <text x={cluster.side*16} y="5" textAnchor={cluster.side>0?"end":"start"} direction="rtl" className="ns-leaf-label">{page.label}</text>
       </g>
      </g>;
     })}
     <text x={cluster.leaf.x+offset.x+cluster.side*16} y={cluster.leaf.y+offset.y-24}
      textAnchor={cluster.side>0?"end":"start"} direction="rtl" className="ns-domain-label">{cluster.label}</text>
     <g role="button" tabIndex={0} data-testid={"domain-"+cluster.id} aria-label={cluster.label} aria-expanded={open}
      transform={`translate(${position.x} ${position.y})`} className="ns-domain-hub" onPointerDown={e=>begin(e,cluster.id,position)}
      onClick={()=>{if(!gesture.current?.moved){onSelect(cluster.domains[0]);onToggle(cluster.domains[0]);}}}
      onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(cluster.domains[0]);onToggle(cluster.domains[0]);}nudge(e,cluster.id,position);}}>
      <circle r="20" className="ns-node-aura"/><circle r={active?9:8} className="ns-node-ring"/><circle r="4.8" className="ns-node-dot"/>
      <title>{cluster.label} — علاقات احتواء من فهرس المصدر، وليست حركة عمليات حية</title>
     </g>
    </g>;
   })}
   <g transform={`translate(${core.x} ${core.y})`}><SupervisorCore level={level} listening={listening}/></g>
  </g>
 </svg>;
}
