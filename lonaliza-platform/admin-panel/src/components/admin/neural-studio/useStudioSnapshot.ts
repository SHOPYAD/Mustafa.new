"use client";
import {useEffect,useState} from "react";
import type {DomainId} from "@/lib/neural-studio/catalog";
import type {StudioSnapshot} from "@/lib/neural-studio/surfaces";
export function useStudioSnapshot(domain:DomainId){
 const [live,setLive]=useState(false),[connection,setConnection]=useState("manual");
 const [data,setData]=useState<StudioSnapshot|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false),[revision,setRevision]=useState(0);
 useEffect(()=>{
  const abort=new AbortController();setLoading(true);setError("");setData(null);
  fetch("/api/admin/automation/studio-snapshot?domain="+domain,{signal:abort.signal,cache:"no-store"})
   .then(async r=>{if(!r.ok)throw new Error(r.status===401?"انتهت جلسة الإدارة":r.status===403?"الصلاحية غير كافية":"تعذر الاتصال بالمصدر");
    const d=await r.json();if(d.ok!==true||!Array.isArray(d.observations))throw new Error("استجابة غير صالحة");
    if(!abort.signal.aborted)setData({...d,records:Array.isArray(d.records)?d.records:[],warnings:Array.isArray(d.warnings)?d.warnings:[]});})
   .catch(e=>{if(!abort.signal.aborted)setError(e.message);}).finally(()=>{if(!abort.signal.aborted)setLoading(false);});
  return()=>abort.abort();
 },[domain,revision]);
 useEffect(()=>{
  if(!live){setConnection("manual");return;}
  let source:EventSource|null=null,disposed=false;
  const connect=()=>{
   source?.close();if(disposed||document.hidden)return;
   setConnection("connecting");
   source=new EventSource("/api/admin/automation/studio-events?domain="+domain);
   source.addEventListener("snapshot",event=>{
    try{const d=JSON.parse((event as MessageEvent).data);if(d.ok===true&&d.domainId===domain&&Array.isArray(d.observations)){
     setData({...d,records:d.records||[],warnings:d.warnings||[]});setError("");setConnection("live");
    }}catch{setConnection("invalid");}
   });
   source.addEventListener("source-error",()=>{setError("تعذرت القراءة الحية؛ المعروض آخر لقطة مستلمة.");setConnection("stale");});
   source.onerror=()=>{setConnection("reconnecting");setError("انقطع البث؛ البيانات المعروضة قديمة حتى استعادة الاتصال.");};
  };
  const visibility=()=>{if(document.hidden){source?.close();setConnection("paused");}else connect();};
  connect();document.addEventListener("visibilitychange",visibility);
  return()=>{disposed=true;source?.close();document.removeEventListener("visibilitychange",visibility);};
 },[live,domain]);
 return {data,error,loading,live,connection,toggleLive:()=>setLive(v=>!v),refresh:()=>setRevision(r=>r+1)};
}
