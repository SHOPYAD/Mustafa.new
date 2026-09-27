import {assertAdminApi} from "@/lib/server/admin-auth";
import {STUDIO_DOMAINS} from "@/lib/neural-studio/catalog";
import {readStudioSnapshot} from "@/lib/neural-studio/server-snapshot";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(req:Request){
 const denied=await assertAdminApi(req);if(denied)return denied;
 const domain=STUDIO_DOMAINS.find(d=>d.id===new URL(req.url).searchParams.get("domain"));
 if(!domain)return Response.json({ok:false,code:"UNKNOWN_DOMAIN"},{status:400});
 let closed=false,timer:ReturnType<typeof setTimeout>|undefined,wake:(()=>void)|undefined;
 let finish=()=>{};const encoder=new TextEncoder();
 const stream=new ReadableStream<Uint8Array>({
  start(controller){
   const started=Date.now();
   finish=()=>{if(closed)return;closed=true;if(timer)clearTimeout(timer);wake?.();req.signal.removeEventListener("abort",finish);try{controller.close();}catch{}};
   req.signal.addEventListener("abort",finish,{once:true});
   if(req.signal.aborted){finish();return;}
   const emit=(event:string,data:unknown)=>{if(!closed)controller.enqueue(encoder.encode("event: "+event+"\ndata: "+JSON.stringify(data)+"\n\n"));};
   void(async()=>{
    try{while(!closed&&Date.now()-started<115000){
     try{const snapshot=await readStudioSnapshot(domain.id);emit("snapshot",snapshot);}
     catch{emit("source-error",{ok:false,code:"SOURCE_UNAVAILABLE",at:new Date().toISOString()});}
     if(closed)break;
     await new Promise<void>(resolve=>{wake=resolve;timer=setTimeout(resolve,10000);});
    }}finally{finish();}
   })();
  },
  cancel(){finish();}
 });
 return new Response(stream,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-store, no-transform","X-Accel-Buffering":"no","Connection":"keep-alive"}});
}
