"use client";
import {useState} from "react";
import {STUDIO_DOMAINS,type DomainId} from "@/lib/neural-studio/catalog";
import {screenForDomain,type ScreenId} from "@/lib/neural-studio/surfaces";
import {useStudioSnapshot} from "./useStudioSnapshot";
import SupervisorCore from "./SupervisorCore";
export default function ExecutiveWorkspace({onNavigate,level}:{onNavigate:(id:ScreenId)=>void;level:number}){
 const [selected,setSelected]=useState<DomainId>("overview");
 const {data,error,loading,refresh}=useStudioSnapshot(selected);
 const domains=STUDIO_DOMAINS.filter(d=>["bookings","flights","hotels","finance","agents","automation","growth","security"].includes(d.id));
 return <section className="ns-executive" data-testid="surface-19"><div className="ns-executive-orbit"><svg viewBox="0 0 1000 720" aria-label="العناقيد التنفيذية">
  <g transform="translate(500 360)"><SupervisorCore level={level}/></g>
  {domains.map((d,i)=>{const a=-Math.PI/2+i*Math.PI/4,x=500+Math.cos(a)*315,y=360+Math.sin(a)*245;return <g key={d.id}>
   <path d={`M 500 360 Q 500 ${y} ${x} ${y}`} className="ns-structure-edge"/>
   <g transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={d.label} onClick={()=>setSelected(d.id)}
    onKeyDown={e=>{if(e.key==="Enter")setSelected(d.id);}} className="ns-hex-node">
    <polygon points="-70,0 -35,-60 35,-60 70,0 35,60 -35,60"/><text y="0" textAnchor="middle">{d.label}</text>
    <text y="25" textAnchor="middle" className="ns-route-caption">{selected===d.id?(loading?"قراءة…":data?.status||"غير متاح"):"لم يُفحص"}</text>
   </g></g>;})}
 </svg></div><aside className="ns-domain-inspector"><h2>{STUDIO_DOMAINS.find(d=>d.id===selected)?.label}</h2>
  <button onClick={refresh}>تحديث القراءة</button><button onClick={()=>onNavigate(screenForDomain(selected))}>فتح مساحة القطاع</button>
  {error&&<p role="alert">{error}</p>}
  {data?.observations.flatMap(o=>o.facts.map(f=><dl key={o.tool+f.key}><dt>{f.labelAr}</dt><dd>{f.available?String(f.value):"غير متاح"}</dd></dl>))}
  <p>لا تُعرض إيرادات أو معدلات أداء دون مصدر. تغيير اللون عند التحديد لا يعني سلامة القطاع.</p>
 </aside></section>;
}
