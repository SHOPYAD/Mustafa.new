"use client";
import {lazy,Suspense} from "react";
import type {PublicStage,ScreenId} from "@/lib/neural-studio/surfaces";
import DomainWorkspace from "./DomainWorkspace";
import CumulativeTree from "./CumulativeTree";
import ExecutiveWorkspace from "./ExecutiveWorkspace";
const HumanoidPresence=lazy(()=>import("./HumanoidPresence"));
interface Props{id:ScreenId;onOpen:(href:string)=>void;onNavigate:(id:ScreenId)=>void;onRestore:()=>void;onSidebar:()=>void;onVoice:()=>void;stage:PublicStage;level:number}
export default function StudioSurfaces(p:Props){
 if(p.id==="01")return null;
 if(p.id==="02")return <CumulativeTree onOpen={p.onOpen}/>;
 if(p.id==="17")return <section className="ns-state-workspace" data-testid="surface-17"><h2>الصوت وحالات المشرف</h2>
  <p>الحالة الحالية: <strong>{p.stage}</strong></p><div className="ns-state-strip">{["idle","listening","reading","reasoning","speaking","awaiting_approval","executing","error"].map(s=><span key={s} aria-current={p.stage===s?"step":undefined}>{s}</span>)}</div>
  <button onClick={p.onVoice}>فتح محادثة المشرف</button><p>القرص يتفاعل مع قياس الميكروفون أو صوت الرد؛ لا توجد حالات تنفيذ أو تفكير وهمية.</p></section>;
 if(p.id==="18")return <section className="ns-state-workspace" data-testid="surface-18"><h2>إدارة مساحة العمل</h2>
  <button onClick={p.onSidebar}>إظهار أو إخفاء المستكشف</button><button onClick={p.onRestore}>استعادة النوافذ</button><button onClick={p.onVoice}>فتح نافذة المشرف</button>
  <p>اسحب شريط النافذة، أو ركّز زر التحريك واستخدم الأسهم. غيّر الحجم من المقبض، وصغّر أو كبّر أو أغلق. تُحفظ مواضع النوافذ في هذا المتصفح.</p>
  <button onClick={()=>p.onNavigate("02")}>اختبار التوسع التراكمي</button><button onClick={()=>p.onNavigate("01")}>الرجوع إلى الأطلس</button></section>;
 if(p.id==="19")return <ExecutiveWorkspace onNavigate={p.onNavigate} level={p.level}/>;
 if(p.id==="20")return <Suspense fallback={<p role="status">تحميل محرك الحضور…</p>}><HumanoidPresence level={p.level} stage={p.stage}/></Suspense>;
 return <DomainWorkspace key={p.id} id={p.id} onOpen={p.onOpen} onNavigate={p.onNavigate}/>;
}
