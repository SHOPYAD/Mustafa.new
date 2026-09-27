import { promises as fs } from "node:fs";
import path from "node:path";
import { STUDIO_DOMAINS, type DomainId } from "./catalog";
import type { StudioSnapshot, StudioRecord, Observation } from "./surfaces";
import { executeSwarmTool } from "@/lib/swarm/agent-tools";
import { isReadCapability } from "./read-capabilities";
type RecordValue=Record<string,unknown>;
const rec=(v:unknown):RecordValue=>v&&typeof v==="object"&&!Array.isArray(v)?v as RecordValue:{};
const txt=(v:unknown)=>typeof v==="string"?v.slice(0,240):"";
const fact=(key:string,labelAr:string,value:string|number|boolean|null,source:string)=>({key,labelAr,value,source,available:value!==null});
function row(id:string,title:string,state:string,source:string,fields:StudioRecord["fields"],href?:string):StudioRecord{
 return {id,title,state,source,fields,href};
}
async function storedFile(name:"legal-policies.json"|"deletion-requests.json") {
 // Never call legacy getters that seed plausible-looking legal/deletion records.
 const ephemeral=process.env.VERCEL==="1"||process.env.AWS_LAMBDA_FUNCTION_NAME!=null;
 const file=ephemeral?path.join("/tmp",name==="legal-policies.json"?"alrayyan-legal-policies.json":"alrayyan-deletion-requests.json"):path.join(process.cwd(),".data",name);
 return JSON.parse(await fs.readFile(file,"utf8")) as unknown;
}
export async function readStudioSnapshot(domainId:DomainId):Promise<StudioSnapshot>{
 const domain=STUDIO_DOMAINS.find(d=>d.id===domainId)!;
 const observations:Observation[]=[], records:StudioRecord[]=[], warnings:string[]=[];
 await Promise.all(domain.tools.map(async tool=>{
  const started=performance.now();
  if(!isReadCapability(tool))return;
  try{
   const result=await executeSwarmTool(tool,{});
   const unavailableDashboard=tool==="dashboard_bookings"&&result.ok&&result.facts.some(f=>f.key==="pocketbase"&&f.value===false);
   if(unavailableDashboard)warnings.push("مصدر الحجوزات غير متصل؛ الأصفار الاحتياطية ليست أعدادًا موثقة.");
   observations.push({tool,status:result.ok&&!unavailableDashboard?"ready":"unavailable",observedAt:new Date().toISOString(),readDurationMs:Math.round(performance.now()-started),
    facts:result.ok&&!unavailableDashboard?result.facts.map(f=>({...f,value:f.value===undefined?null:f.value})):[]});
  }catch{observations.push({tool,status:"unavailable",facts:[]});}
 }));
 const extra=async(source:string,fn:()=>Promise<void>)=>{
  const start=performance.now();
  try{await fn();observations.push({tool:source,status:"ready",observedAt:new Date().toISOString(),readDurationMs:Math.round(performance.now()-start),
   facts:[fact(source,"سجلات معروضة من المصدر",records.filter(r=>r.source===source).length,source)]});}
  catch{observations.push({tool:source,status:"unavailable",facts:[]});warnings.push("تعذرت قراءة "+source+"؛ لم تستخدم بيانات بديلة.");}
 };
 if(domainId==="agents")await extra("agent-registry",async()=>{
  const {listRegisteredAgents}=await import("@/lib/swarm/agent-registry");
  for(const a of listRegisteredAgents())records.push(row(a.id,a.nameAr,a.enabled?"enabled":"disabled","agent-registry",
   {mission:a.missionAr,tools:a.allowedTools.join(", "),updatedAt:a.updatedAt},"/admin/agent-studio"));
  warnings.push("تمكين الوكيل لا يعني أنه يعمل الآن؛ السجل يعرض الإعداد الفعلي فقط.");
 });
 if(domainId==="automation")await extra("automation-store",async()=>{
  const {listAutomationJobs}=await import("@/lib/server/automation/store");
  for(const j of (await listAutomationJobs()).slice(0,100))records.push(row(j.id,j.name,j.enabled?"enabled":"paused","automation-store",
   {type:j.type,cron:j.cron,timezone:j.timezone,dryRun:j.dryRun,lastRunAt:j.lastRunAt,updatedAt:j.updatedAt},"/admin/automation"));
  warnings.push("أول 100 وظيفة. آخر وقت تشغيل ليس إثبات نجاح؛ راجع سجل التنفيذ.");
 });
 if(domainId==="cms")await extra("blog-store",async()=>{
  const {listBlogPosts}=await import("@/lib/server/blog-store");
  for(const p of (await listBlogPosts()).slice(0,100))records.push(row(p.id,p.titleAr,p.status,"blog-store",
   {slug:p.slug,updatedAt:p.updatedAt},"/admin/blog"));
  warnings.push("فهرس المحتوى المحفوظ وقد يشمل المحتوى المهاجر؛ ليس إحصاء زيارات.");
 });
 if(domainId==="publishing")await extra("publish-store",async()=>{
  const {listPosts}=await import("@/lib/publish/posts");
  const result=await listPosts();if(!result.store.available)throw new Error("unavailable");
  for(const p of result.posts.slice(0,100))records.push(row(p.id,p.title||"منشور "+p.id,p.state,"publish-store",
   {channelId:p.channelId,publishDate:p.publishDate},"/admin/publish"));
 });
 if(domainId==="finance")await extra("financial_transactions",async()=>{
  const {tryCreateAdminPocketBase}=await import("@/lib/pocketbase/admin");
  const pb=await tryCreateAdminPocketBase();if(!pb)throw new Error("unavailable");
  const page=await pb.collection("financial_transactions").getList(1,50,{sort:"-created",fields:"id,type,status,amount,currency,created"});
  for(const value of page.items){const t=rec(value);records.push(row(txt(t.id),txt(t.type),txt(t.status),"financial_transactions",
   {amount:typeof t.amount==="number"&&Number.isFinite(t.amount)?t.amount:null,currency:txt(t.currency)||null,created:txt(t.created)},"/admin/payments"));}
  warnings.push("آخر 50 معاملة فقط؛ لا جمع لعملات مختلفة، ولا أرصدة أو اتجاهات مصطنعة.");
 });
 if(domainId==="security"){
  await extra("legal-policies",async()=>{
   const data=rec(await storedFile("legal-policies.json")),identity=rec(data.identity);
   if(!Array.isArray(data.clauses))throw new Error("invalid");
   for(const value of data.clauses.slice(0,100)){const c=rec(value);records.push(row(txt(c.id),txt(c.titleAr)||txt(c.id),"stored","legal-policies",
    {policyVersion:txt(identity.policyVersion)||null,updatedAt:txt(c.updatedAt)||txt(data.updatedAt)||null},"/admin/legal"));}
   warnings.push("وثائق محفوظة، وليست شهادة امتثال قانوني أو فحص أمني.");
  });
  await extra("deletion-requests",async()=>{
   const data=await storedFile("deletion-requests.json");if(!Array.isArray(data))throw new Error("invalid");
   for(const value of data.slice(0,100)){const r=rec(value);if(["del_req_101","del_req_102","del_req_103"].includes(txt(r.id)))continue;
    records.push(row(txt(r.id),"طلب خصوصية",txt(r.status),"deletion-requests",{requestedAt:txt(r.requestedAt),retentionExpiresAt:txt(r.retentionExpiresAt)},"/admin/legal"));}
   warnings.push("تم إخفاء بيانات أصحاب الطلبات واستبعاد معرفات العينات القديمة المعروفة دون حذفها.");
  });
 }
 if(domainId==="settings")await extra("tracking-config",async()=>{
  const {getServerEnvMap}=await import("@/lib/server/env-store");
  const keys=["NEXT_PUBLIC_GA_ID","NEXT_PUBLIC_GTM_ID","NEXT_PUBLIC_META_PIXEL_ID","NEXT_PUBLIC_TIKTOK_PIXEL_ID"] as const;
  const values=await getServerEnvMap(keys);
  for(const key of keys)records.push(row(key,key,values[key]?.trim()?"configured":"not_configured","tracking-config",{configured:!!values[key]?.trim()},"/admin/integrations"));
  warnings.push("وجود إعداد ليس اختبار اتصال. لم تُرسل قيم الإعدادات أو الأسرار إلى المتصفح.");
 });
 const ready=observations.filter(o=>o.status==="ready").length;
 return {ok:true,domainId,observedAt:new Date().toISOString(),observations,records,warnings,
  status:!observations.length?"not_connected":ready===observations.length?"ready":ready?"partial":"unavailable"};
}
