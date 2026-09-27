import {NextResponse} from "next/server";
import {assertAdminApi,ensureAdminSessionSecret,readAdminAuthToken} from "@/lib/server/admin-auth";
import {DraftAction,describeDraftAction} from "@/lib/neural-studio/action-contract";
import {signPreview,verifyPreview,subjectHash,executeDraftOnce} from "@/lib/neural-studio/action-service";
export const runtime="nodejs";export const dynamic="force-dynamic";
const reply=(v:object,status=200)=>NextResponse.json(v,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(req:Request){
 const denied=await assertAdminApi(req);if(denied)return denied;
 if(req.headers.get("origin")!==new URL(req.url).origin)return reply({ok:false,code:"ORIGIN_DENIED"},403);
 try{
  const text=await req.text();if(Buffer.byteLength(text)>32000)return reply({ok:false,code:"TOO_LARGE"},413);
  const body=JSON.parse(text);
  const credential=readAdminAuthToken(req)||req.headers.get("x-admin-setup-secret")||req.headers.get("authorization");
  if(!credential)return reply({ok:false,code:"SESSION_REQUIRED"},401);
  const subject=subjectHash(credential),secret=await ensureAdminSessionSecret();
  if(body.mode==="preview"){
   const parsed=DraftAction.safeParse(body.action);if(!parsed.success)return reply({ok:false,code:"INVALID_ACTION"},400);
   return reply({ok:true,status:"awaiting_approval",preview:describeDraftAction(parsed.data),...signPreview(parsed.data,subject,secret)});
  }
  if(body.mode==="confirm"&&body.confirm===true&&typeof body.token==="string"&&body.token.length<30000){
   const prepared=verifyPreview(body.token,subject,secret);
   const result=await executeDraftOnce(prepared.nonce,subject,prepared.action);
   return reply({ok:true,status:"succeeded",result});
  }
  return reply({ok:false,code:"INVALID_REQUEST"},400);
 }catch(e){
  const code=e instanceof Error?e.message:"FAILED";
  const publicCode=["INVALID_PREVIEW","EXPIRED_PREVIEW","RECONCILIATION_REQUIRED","PERSISTENT_STORE_REQUIRED"].includes(code)?code:"ACTION_FAILED";
  return reply({ok:false,code:publicCode},publicCode==="RECONCILIATION_REQUIRED"?409:400);
 }
}
