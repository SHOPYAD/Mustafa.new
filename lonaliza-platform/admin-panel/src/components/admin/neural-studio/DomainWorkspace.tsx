"use client";
import {useMemo,useRef,useState} from "react";
import {STUDIO_DOMAINS,type DomainId} from "@/lib/neural-studio/catalog";
import {getSurface,getSurfacePages,type ScreenId,type StudioRecord} from "@/lib/neural-studio/surfaces";
import {useStudioSnapshot} from "./useStudioSnapshot";
import DraftActionPanel from "./DraftActionPanel";
interface Props{id:ScreenId;onOpen:(href:string)=>void;onNavigate:(id:ScreenId)=>void}
export default function DomainWorkspace({id,onOpen,onNavigate}:Props){
 const surface=getSurface(id)!;const domain=(surface.domains[0]||"overview") as DomainId;
 const {data,error,loading,refresh}=useStudioSnapshot(domain);
 const pages=useMemo(()=>getSurfacePages(id),[id]);
 const [selected,setSelected]=useState<string|null>(null),[filter,setFilter]=useState(""),[record,setRecord]=useState<StudioRecord|null>(null);
 const [pins,setPins]=useState<Record<string,{x:number;y:number}>>({});
 const drag=useRef<{id:string;x:number;y:number;px:number;py:number}|null>(null);
 const graph=useRef<HTMLDivElement>(null);
 const current=pages.find(p=>p.href===selected);
 const visible=pages.filter(p=>!filter||p.label.includes(filter));
 const records=(data?.records||[]).filter(r=>!filter||r.title.includes(filter)||r.state.includes(filter));
 const position=(index:number,href:string)=>{
  const count=visible.length;
  if(pins[href])return pins[href];
  if(surface.layout==="dag")return {x:105+(index%3)*285,y:88+Math.floor(index/3)*116};
  const a=-Math.PI/2+index*Math.PI*2/Math.max(1,count);
  return {x:430+Math.cos(a)*315,y:290+Math.sin(a)*215};
 };
 const move=(e:React.PointerEvent)=>{
  const d=drag.current;if(!d||!graph.current)return;const scale=graph.current.getBoundingClientRect().width/960;
  setPins(p=>({...p,[d.id]:{x:Math.max(90,Math.min(850,d.px+(e.clientX-d.x)/scale)),y:Math.max(40,d.py+(e.clientY-d.y)/scale)}}));
 };
 const height=Math.max(610,surface.layout==="dag"?Math.ceil(visible.length/3)*116+120:610);
 return <section className="ns-domain-workspace" data-testid={"surface-"+id} dir="rtl">
  <header className="ns-surface-heading"><div><p>{STUDIO_DOMAINS.find(d=>d.id===domain)?.label}</p><h2>مسارات القسم ومصادره</h2></div>
   <div><button onClick={refresh} disabled={loading}>{loading?"جارٍ القراءة…":"تحديث من المصدر"}</button>
    <input aria-label="تصفية مسارات وسجلات القسم" placeholder="تصفية…" value={filter} onChange={e=>setFilter(e.target.value)}/></div></header>
  <div className="ns-domain-columns">
   <div className="ns-domain-main">
    <div className="ns-domain-canvas" ref={graph}>
     <svg viewBox={`0 0 960 ${height}`} role="group" aria-label="شبكة مسارات القسم" onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
      <defs><radialGradient id={"hub-"+id}><stop stopColor="var(--ns-ion)" stopOpacity=".28"/><stop offset="1" stopColor="var(--ns-ion)" stopOpacity="0"/></radialGradient></defs>
      {surface.layout!=="dag"&&<g><circle cx="430" cy="290" r="95" fill={`url(#hub-${id})`}/><circle cx="430" cy="290" r="68" className="ns-ring ns-ion"/><text x="430" y="295" textAnchor="middle" className="ns-core-label">{STUDIO_DOMAINS.find(d=>d.id===domain)?.label}</text></g>}
      {visible.map((p,i)=>{
       const pos=position(i,p.href),parent=surface.layout==="dag"?(i?position(i-1,visible[i-1].href):pos):{x:430,y:290};
       return <g key={p.href}>
        <path d={`M ${parent.x} ${parent.y} C ${parent.x+120} ${parent.y}, ${pos.x-120} ${pos.y}, ${pos.x} ${pos.y}`} className="ns-structure-edge"/>
        <g transform={`translate(${pos.x} ${pos.y})`} role="button" tabIndex={0} aria-label={p.label} className={"ns-route-node "+(selected===p.href?"is-selected":"")}
         onPointerDown={e=>{drag.current={id:p.href,x:e.clientX,y:e.clientY,px:pos.x,py:pos.y};e.currentTarget.setPointerCapture(e.pointerId);}}
         onClick={()=>setSelected(p.href)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(p.href);}}}>
         <rect x="-95" y="-33" width="190" height="66" rx="9"/><circle cx="-79" r="4"/>
         <text y="-3" textAnchor="middle" direction="rtl">{p.label}</text>
         <text y="19" textAnchor="middle" className="ns-route-caption">{p.dynamic?"يتطلب اختيار سجل":"مسار إدارة موجود"}</text>
        </g>
       </g>;
      })}
     </svg>
    </div>
    <p className="ns-note">الخطوط لتنظيم واجهات القسم، وليست تتبعًا لتنفيذ فعلي أو إثبات اتصال بين الخوادم.</p>
    <div className="ns-facts-grid">{data?.observations.flatMap(o=>o.facts.map(f=><article key={o.tool+f.key}><span>{f.labelAr}</span>
     <strong>{f.available?String(f.value??"غير متاح"):"غير متاح"}</strong><small>{f.source}</small></article>))}</div>
    <section className="ns-records"><h3>السجلات من المصدر</h3>
     {loading?<p role="status">قراءة السجلات…</p>:error?<p role="alert">{error}</p>:records.length===0?<p>لا توجد سجلات معروضة من هذا المحول. استخدم واجهة القسم الأصلية للتفاصيل غير الموصولة هنا.</p>:
      <div className="ns-table-scroll"><table><thead><tr><th>السجل</th><th>الحالة المحفوظة</th><th>المصدر</th><th>التفاصيل</th></tr></thead>
       <tbody>{records.map(r=><tr key={r.source+r.id}><td>{r.title}</td><td>{r.state||"غير معروفة"}</td><td>{r.source}</td><td><button onClick={()=>setRecord(r)}>فحص</button></td></tr>)}</tbody></table></div>}
     {data&&<small>آخر قراءة: <time>{data.observedAt}</time> · {data.status}</small>}
    </section>
   </div>
   <aside className="ns-domain-inspector" aria-label="فاحص القسم">
    <h3>{current?.label||"حدد عقدة لفحصها"}</h3>
    {current&&<><code dir="ltr">{current.href}</code><p>مصدر: {current.path}</p>
     {!current.dynamic&&<button onClick={()=>onOpen(current.href)}>فتح أداة الإدارة داخل الاستوديو</button>}</>}
    {record&&<section aria-label="تفاصيل السجل"><h4>{record.title}</h4><code>{record.id}</code>
     <dl>{Object.entries(record.fields).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v===null?"غير متاح":String(v)}</dd></div>)}</dl>
     {record.href&&<button onClick={()=>onOpen(record.href!)}>فتح أداة السجل</button>}</section>}
    <details><summary>نطاق السيناريو المطلوب</summary><ol>{surface.nodes.map(n=><li key={n}>{n}</li>)}</ol>
     <p>هذه مكونات الخطة؛ وجود الاسم لا يعني اكتمال محول التنفيذ.</p><p>{surface.risk}</p></details>
    {data?.warnings.map(w=><p key={w} className="ns-warning">{w}</p>)}
    <h4>الأقسام المرتبطة في الخطة</h4><div className="ns-related">{surface.links.map(link=><button key={link} onClick={()=>onNavigate(link as ScreenId)}>واجهة {link}</button>)}</div>
    {id==="07"&&<DraftActionPanel kind="article" onSaved={refresh}/>}
    {id==="12"&&<DraftActionPanel kind="automation" onSaved={refresh}/>}
   </aside>
  </div>
 </section>;
}
