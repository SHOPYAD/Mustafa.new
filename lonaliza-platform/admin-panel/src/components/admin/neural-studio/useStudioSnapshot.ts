"use client";
import {useEffect,useState} from "react";
import type {DomainId} from "@/lib/neural-studio/catalog";
import type {StudioSnapshot} from "@/lib/neural-studio/surfaces";
export function useStudioSnapshot(domain:DomainId){
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
 return {data,error,loading,refresh:()=>setRevision(r=>r+1)};
}
