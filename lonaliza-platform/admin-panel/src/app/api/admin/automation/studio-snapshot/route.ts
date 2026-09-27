import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { STUDIO_DOMAINS } from "@/lib/neural-studio/catalog";
import { readStudioSnapshot } from "@/lib/neural-studio/server-snapshot";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 const denied=await assertAdminApi(request);if(denied)return denied;
 const domain=STUDIO_DOMAINS.find(d=>d.id===new URL(request.url).searchParams.get("domain"));
 if(!domain)return NextResponse.json({ok:false,code:"UNKNOWN_DOMAIN"},{status:400});
 try{return NextResponse.json(await readStudioSnapshot(domain.id),{headers:{"Cache-Control":"no-store"}});}
 catch{return NextResponse.json({ok:false,code:"SOURCE_UNAVAILABLE"},{status:503});}
}
