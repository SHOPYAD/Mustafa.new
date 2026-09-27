"use client";
import {useState} from "react";
import {STUDIO_DOMAINS,STUDIO_PAGES} from "@/lib/neural-studio/catalog";
export default function CumulativeTree({onOpen}:{onOpen:(href:string)=>void}){
 const [open,setOpen]=useState<string[]>(["bookings"]),[details,setDetails]=useState<string[]>([]);
 const toggle=(id:string)=>setOpen(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
 return <section className="ns-cumulative" data-testid="surface-02"><h2>التوسع التراكمي</h2><p>المنصة ← المجال ← الصفحة ← مصدرها. طي أحد الفروع لا يغلق بقية الفروع.</p>
  <div className="ns-tree-branches">{STUDIO_DOMAINS.map(d=><section key={d.id}><button aria-expanded={open.includes(d.id)} onClick={()=>toggle(d.id)}>{d.label}</button>
   {open.includes(d.id)&&<ul>{STUDIO_PAGES.filter(p=>p.domain===d.id).map(p=><li key={p.href}><button aria-expanded={details.includes(p.href)}
    onClick={()=>setDetails(x=>x.includes(p.href)?x.filter(h=>h!==p.href):[...x,p.href])}>{p.label}</button>
    {details.includes(p.href)&&<div className="ns-source-branch"><code dir="ltr">{p.path}</code><small>نسخة المصدر: {p.sha.slice(0,10)}</small>
     {!p.dynamic&&<button onClick={()=>onOpen(p.href)}>فتح الأداة</button>}</div>}</li>)}</ul>}
  </section>)}</div></section>;
}
