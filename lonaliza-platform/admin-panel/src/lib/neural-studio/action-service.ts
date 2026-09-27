import {createHash,createHmac,randomUUID,timingSafeEqual} from "node:crypto";
import {promises as fs} from "node:fs";
import path from "node:path";
import {DraftAction,type DraftActionInput} from "./action-contract";
export function signPreview(action:DraftActionInput,subject:string,secret:string,now=Date.now()){
 const payload={action,subject,nonce:randomUUID(),expiresAt:now+300000};
 const body=Buffer.from(JSON.stringify(payload)).toString("base64url");
 return {token:body+"."+createHmac("sha256",secret).update(body).digest("base64url"),expiresAt:payload.expiresAt};
}
export function verifyPreview(token:string,subject:string,secret:string,now=Date.now()){
 const [body,mac,...extra]=token.split(".");if(!body||!mac||extra.length)throw new Error("INVALID_PREVIEW");
 const expected=createHmac("sha256",secret).update(body).digest(),given=Buffer.from(mac,"base64url");
 if(given.length!==expected.length||!timingSafeEqual(given,expected))throw new Error("INVALID_PREVIEW");
 const payload=JSON.parse(Buffer.from(body,"base64url").toString()) as {action:unknown;subject:string;nonce:string;expiresAt:number};
 if(payload.subject!==subject||!Number.isFinite(payload.expiresAt)||payload.expiresAt<now||!/^[a-f0-9-]{36}$/.test(payload.nonce))throw new Error("EXPIRED_PREVIEW");
 return {...payload,action:DraftAction.parse(payload.action)};
}
export function subjectHash(credential:string){return createHash("sha256").update(credential).digest("hex");}
export async function executeDraftOnce(nonce:string,subject:string,action:DraftActionInput){
 if(!/^[a-f0-9-]{36}$/.test(nonce)||!/^[a-f0-9]{64}$/.test(subject))throw new Error("INVALID_ID");
 if(process.env.VERCEL==="1"||process.env.AWS_LAMBDA_FUNCTION_NAME)throw new Error("PERSISTENT_STORE_REQUIRED");
 const dir=path.join(process.cwd(),".data","neural-studio","receipts");await fs.mkdir(dir,{recursive:true,mode:0o700});
 const file=path.join(dir,nonce+".json");
 let lock;try{lock=await fs.open(file,"wx",0o600);}catch(e){
  if((e as NodeJS.ErrnoException).code!=="EEXIST")throw e;
  const receipt=JSON.parse(await fs.readFile(file,"utf8"));
  if(receipt.subject!==subject)throw new Error("SUBJECT_DENIED");
  if(receipt.status==="succeeded")return {...receipt.result,replayed:true};
  throw new Error("RECONCILIATION_REQUIRED");
 }
 await lock.writeFile(JSON.stringify({subject,status:"started",kind:action.kind,startedAt:new Date().toISOString()}));await lock.close();
 try{
  let result:{id:string;href:string;status:string;sync:string};
  if(action.kind==="article.draft.create"){
   const {createBlogPost}=await import("@/lib/server/blog-store");
   const escape=(s:string)=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
   const post=await createBlogPost({id:"studio_"+nonce,slug:"studio-"+nonce,titleAr:action.title,titleEn:action.title,
    contentAr:action.content.split("\n").map(p=>"<p>"+escape(p)+"</p>").join(""),status:"draft",author:"استوديو الإدارة"});
   result={id:post.id,href:"/admin/blog",status:"draft",sync:"local_store_saved_remote_sync_not_confirmed"};
  }else{
   const {upsertAutomationJob}=await import("@/lib/server/automation/store");
   const job=await upsertAutomationJob({id:"studio_"+nonce,name:action.name,type:action.type,cron:"0 "+action.hour+" * * *",
    timezone:"Europe/Istanbul",enabled:false,dryRun:true,maxPerRun:1,maxPerDay:1,locales:["ar"]});
   result={id:job.id,href:"/admin/automation",status:"paused",sync:"local_store_saved"};
  }
  await fs.writeFile(file,JSON.stringify({subject,status:"succeeded",result,completedAt:new Date().toISOString()}),{mode:0o600});
  return {...result,replayed:false};
 }catch{
  await fs.writeFile(file,JSON.stringify({subject,status:"uncertain",kind:action.kind,at:new Date().toISOString()}),{mode:0o600});
  // Never retry automatically: the store may have committed before a response failed.
  throw new Error("RECONCILIATION_REQUIRED");
 }
}
