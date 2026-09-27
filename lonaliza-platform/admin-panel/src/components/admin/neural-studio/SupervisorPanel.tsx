"use client";
import {useEffect,useRef,useState} from "react";
import {STUDIO_DOMAINS,type DomainId} from "@/lib/neural-studio/catalog";
import type {PublicStage} from "@/lib/neural-studio/surfaces";
import type {DraftActionInput} from "@/lib/neural-studio/action-contract";
import DraftActionPanel from "./DraftActionPanel";
type Message={role:"user"|"model";text:string;proposal?:DraftActionInput};
type Event={id:string;stage:string;at:string;detail:string};
type Reply={proposal?:DraftActionInput;ok?:boolean;code?:string;reply?:string;events?:Event[];kind?:string;event?:Event};
type Recognizer={lang:string;continuous:boolean;interimResults:boolean;onresult:((e:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;onerror:((e:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;abort:()=>void};
type RecognitionWindow=Window&{SpeechRecognition?:new()=>Recognizer;webkitSpeechRecognition?:new()=>Recognizer};
export default function SupervisorPanel({domain,onActivity}:{domain:DomainId;onActivity:(stage:PublicStage,level:number)=>void}){
 const [team,setTeam]=useState(false),[proposal,setProposal]=useState<DraftActionInput|null>(null);
 const [input,setInput]=useState(""),[messages,setMessages]=useState<Message[]>([]),[events,setEvents]=useState<Event[]>([]);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[consent,setConsent]=useState(false),[hearing,setHearing]=useState(false);
 const [agentId,setAgentId]=useState(""),[agents,setAgents]=useState<Array<{id:string;title:string}>>([]);
 const request=useRef<AbortController|null>(null),recognition=useRef<Recognizer|null>(null);
 const audio=useRef<{element:HTMLAudioElement;context:AudioContext;url:string;frame:number}|null>(null);
 const epoch=useRef(0),mounted=useRef(true),onActivityRef=useRef(onActivity);
 onActivityRef.current=onActivity;
 const stop=()=>{
  epoch.current++;request.current?.abort();if(recognition.current){recognition.current.onresult=null;recognition.current.onerror=null;recognition.current.onend=null;recognition.current.abort();}recognition.current=null;
  if(audio.current){const s=audio.current;cancelAnimationFrame(s.frame);s.element.pause();s.element.src="";URL.revokeObjectURL(s.url);void s.context.close();audio.current=null;}
  if(mounted.current){setBusy(false);setHearing(false);onActivityRef.current("idle",0);}
 };
 useEffect(()=>{
  mounted.current=true;const abort=new AbortController();
  fetch("/api/admin/automation/studio-snapshot?domain=agents",{signal:abort.signal}).then(r=>r.json()).then(d=>{
   if(!abort.signal.aborted)setAgents((d.records||[]).filter((a:{state:string})=>a.state==="enabled").map((a:{id:string;title:string})=>({id:a.id,title:a.title})));
  }).catch(()=>{});
  return()=>{mounted.current=false;abort.abort();stop();};
 },[]);
 const send=async()=>{
  if(!input.trim()||busy)return;stop();const current=epoch.current,controller=new AbortController();request.current=controller;
  const question=input.trim();setInput("");setError("");setBusy(true);setMessages(m=>[...m,{role:"user",text:question}]);onActivityRef.current("reading",0);
  try{
   const r=await fetch("/api/admin/automation/studio-supervisor",{method:"POST",signal:controller.signal,headers:{"Content-Type":"application/json"},
    body:JSON.stringify({message:question,domain,team,agentId:agentId||undefined,history:messages.slice(-8).map(m=>({role:m.role,text:m.text.slice(0,2000)}))})});
   let d:Reply={};
   if(r.headers.get("content-type")?.includes("application/x-ndjson")&&r.body){
    const reader=r.body.getReader(),decoder=new TextDecoder();let buffer="";
    const consume=(line:string)=>{if(!line.trim()||current!==epoch.current)return;const part=JSON.parse(line) as Reply;
     if(part.kind==="event"&&part.event){
      const event=part.event;setEvents(old=>[...old,event]);
      if(event.stage==="reading"||event.stage==="reasoning"||event.stage==="error")onActivityRef.current(event.stage,0);
     }else if(part.kind==="result")d=part;
    };
    setEvents([]);
    try{while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});
     let newline:number;while((newline=buffer.indexOf("\n"))>=0){consume(buffer.slice(0,newline));buffer=buffer.slice(newline+1);}
    }buffer+=decoder.decode();if(buffer.trim())consume(buffer);}finally{reader.releaseLock();}
   }else d=await r.json() as Reply;
   if(current!==epoch.current)return;setEvents(d.events||[]);
   if(!r.ok||d.ok!==true)throw new Error(d.code==="MODEL_UNAVAILABLE"?"محرك النموذج غير متاح؛ لم يتم تنفيذ إجراء.":"تعذرت إجابة المشرف؛ لم يُثبت أي إجراء.");
   setMessages(m=>[...m,{role:"model",text:d.reply||"",proposal:d.proposal}]);onActivityRef.current("idle",0);
  }catch(e){if(!controller.signal.aborted){setError(e instanceof Error?e.message:"تعذر الاتصال");onActivityRef.current("error",0);}}
  finally{if(current===epoch.current)setBusy(false);}
 };
 const hear=()=>{
  if(hearing){recognition.current?.abort();return;}
  const rw=window as RecognitionWindow,Constructor=rw.SpeechRecognition||rw.webkitSpeechRecognition;
  if(!Constructor){setError("التفريغ الصوتي غير مدعوم في هذا المتصفح؛ استخدم مربع الكتابة.");return;}
  if(!consent)return;stop();setError("");const r=new Constructor();recognition.current=r;r.lang="ar-SA";r.continuous=false;r.interimResults=true;
  r.onresult=e=>{let text="";for(let i=0;i<e.results.length;i++)text+=e.results[i][0].transcript+" ";setInput(text.trim());};
  r.onerror=()=>{setError("تعذر التفريغ الصوتي؛ تحقق من الإذن والاتصال.");setHearing(false);onActivityRef.current("error",0);};
  r.onend=()=>{setHearing(false);onActivityRef.current("idle",0);};
  try{r.start();setHearing(true);onActivityRef.current("listening",0);}catch{setError("الميكروفون غير متاح");}
 };
 const speak=async(text:string)=>{
  stop();setError("");const current=epoch.current,controller=new AbortController();request.current=controller;
  try{
   // Explicit playback only; never sends text to TTS simply because an answer arrived.
   const r=await fetch("/api/admin/automation/voice-tts",{method:"POST",signal:controller.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({text:text.slice(0,450),voice:"ar-SA-HamedNeural"})});
   if(!r.ok)throw new Error("تعذر توليد الصوت");const blob=await r.blob();if(current!==epoch.current)return;
   const url=URL.createObjectURL(blob),element=new Audio(url),context=new AudioContext();
   const session={element,context,url,frame:0};audio.current=session;
   const source=context.createMediaElementSource(element),analyser=context.createAnalyser();analyser.fftSize=256;source.connect(analyser);analyser.connect(context.destination);
   await context.resume();if(current!==epoch.current)return;await element.play();if(current!==epoch.current)return;
   const samples=new Uint8Array(256);
   const tick=()=>{analyser.getByteTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((s,v)=>s+((v-128)/128)**2,0)/samples.length);
    onActivityRef.current("speaking",Math.min(1,rms*5));session.frame=requestAnimationFrame(tick);};tick();
   element.onended=()=>stop();
  }catch(e){if(current===epoch.current&&!controller.signal.aborted){stop();setError(e instanceof Error?e.message:"تعذر تشغيل الصوت");}}
 };
 return <section className="ns-supervisor-panel" data-testid="supervisor-console">
  <header><h2>المشرف العام وفريق الوكلاء</h2><p>نطاق القراءة: {STUDIO_DOMAINS.find(d=>d.id===domain)?.label} · لا تنفيذ ضمن إجابة الدردشة</p></header>
  <label className="ns-consent"><input type="checkbox" checked={team} onChange={e=>setTeam(e.target.checked)}/>تشاور مع حتى ثلاثة وكلاء مسجلين ومصرح لهم بقراءات هذا المجال</label>
  <label>المتحدث<select value={agentId} onChange={e=>setAgentId(e.target.value)}><option value="">المشرف العام</option>{agents.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></label>
  <div className="ns-conversation" role="log" aria-label="محادثة المشرف">{messages.length?messages.map((m,i)=><article key={i} data-role={m.role}><strong>{m.role==="user"?"أنت":"المشرف"}</strong><p>{m.text}</p>
   {m.proposal&&<button onClick={()=>setProposal(m.proposal!)}>تهيئة المقترح للمعاينة</button>}
   {m.role==="model"&&<button onClick={()=>void speak(m.text)}>قراءة صوتية لأول 450 حرفًا</button>}</article>):<p>اسأل عن بيانات القسم الحالي. الإجابة تستند إلى قراءاته ولا تنفذ تغييرات.</p>}</div>
  <label>رسالتك<textarea aria-label="رسالة المشرف" maxLength={4000} rows={3} value={input} onChange={e=>setInput(e.target.value)}/></label>
  <div className="ns-console-actions"><button disabled={busy||!input.trim()} onClick={()=>void send()}>{busy?"جارٍ الاستعلام…":"إرسال للمشرف"}</button><button onClick={stop}>مقاطعة وإيقاف</button></div>
  <label className="ns-consent"><input type="checkbox" checked={consent} onChange={e=>{setConsent(e.target.checked);if(!e.target.checked)stop();}}/>أوافق على التفريغ الصوتي عبر خدمة المتصفح؛ قد يُرسل الصوت إليها.</label>
  <button disabled={!consent} onClick={hear}>{hearing?"إيقاف التفريغ":"إملاء صوتي"}</button><small>القراءة الصوتية ترسل نص الإجابة إلى خدمة الصوت المستخدمة في المنصة.</small>
  {proposal&&<DraftActionPanel key={JSON.stringify(proposal)} kind={proposal.kind==="article.draft.create"?"article":"automation"} initial={proposal} onSaved={()=>setProposal(null)}/>}
  {error&&<p role="alert">{error}</p>}
  <details><summary>سجل مراحل الطلب الفعلية</summary><ol>{events.map(e=><li key={e.id}><time>{e.at}</time> {e.detail}</li>)}</ol></details>
 </section>;
}
