"use client";
import {useState} from "react";
import type {DraftActionInput} from "@/lib/neural-studio/action-contract";
type Preview={token:string;expiresAt:number;preview:{title:string;summary:string;effects:string[]}};
export default function DraftActionPanel({kind,onSaved,initial}:{kind:"article"|"automation";onSaved:()=>void;initial?:DraftActionInput}){
 const [title,setTitle]=useState(initial?.kind==="article.draft.create"?initial.title:initial?.name||""),[content,setContent]=useState(initial?.kind==="article.draft.create"?initial.content:""),[hour,setHour]=useState(initial?.kind==="automation.draft.create"?initial.hour:9);
 const [preview,setPreview]=useState<Preview|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const change=()=>{setPreview(null);setMessage("");};
 const send=async(confirm:boolean)=>{
  setBusy(true);setMessage("");
  try{
   const action=kind==="article"?{kind:"article.draft.create",title,content}:{kind:"automation.draft.create",name:title,type:"trips.discover_and_draft",hour};
   const r=await fetch("/api/admin/automation/studio-action",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(confirm?{mode:"confirm",confirm:true,token:preview?.token}:{mode:"preview",action})});
   const d=await r.json();if(!r.ok||d.ok!==true)throw new Error(d.code==="RECONCILIATION_REQUIRED"?"النتيجة غير محسومة؛ راجع السجل قبل المحاولة مجددًا.":"لم يُثبت الحفظ: "+(d.code||r.status));
   if(confirm){setPreview(null);setMessage(d.result.status==="draft"?"حُفظت المسودة محليًا؛ المزامنة البعيدة غير مؤكدة.":"حُفظت الوظيفة متوقفة، دون تشغيل.");onSaved();}
   else setPreview(d);
  }catch(e){setMessage(e instanceof Error?e.message:"تعذر تنفيذ الطلب");}finally{setBusy(false);}
 };
 return <section className="ns-action-form" aria-label={kind==="article"?"مسودة مقال":"مسودة أتمتة"}>
  <h3>{kind==="article"?"مسودة مقال جديدة":"وظيفة أتمتة متوقفة"}</h3>
  <label>العنوان<input value={title} maxLength={180} onChange={e=>{setTitle(e.target.value);change();}}/></label>
  {kind==="article"?<label>نص المسودة<textarea rows={5} value={content} maxLength={12000} onChange={e=>{setContent(e.target.value);change();}}/></label>:
   <label>ساعة الجدولة المقترحة — إسطنبول<input type="number" min={0} max={23} value={hour} onChange={e=>{setHour(Number(e.target.value));change();}}/></label>}
  <button disabled={busy||title.trim().length<3||(kind==="article"&&content.trim().length<10)} onClick={()=>void send(false)}>معاينة دون كتابة</button>
  {preview&&<div className="ns-approval" role="region" aria-label="مراجعة قبل الحفظ"><strong>{preview.preview.title}</strong><p>{preview.preview.summary}</p>
   <ul>{preview.preview.effects.map(e=><li key={e}>{e}</li>)}</ul><p>المعاينة صالحة لخمس دقائق.</p>
   <button disabled={busy} onClick={()=>void send(true)}>أوافق على حفظ المسودة</button><button onClick={()=>setPreview(null)}>إلغاء</button></div>}
  {message&&<p role="status">{message}</p>}
 </section>;
}
