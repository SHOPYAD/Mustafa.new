import {beforeEach,expect,it,vi} from "vitest";
const m=vi.hoisted(()=>({auth:vi.fn(),snapshot:vi.fn(),generate:vi.fn(),agents:vi.fn()}));
vi.mock("@/lib/server/admin-auth",()=>({assertAdminApi:m.auth}));
vi.mock("@/lib/neural-studio/server-snapshot",()=>({readStudioSnapshot:m.snapshot}));
vi.mock("@/lib/server/gemini-swarm-client",()=>({generateGeminiContent:m.generate}));
vi.mock("@/lib/swarm/agent-registry",()=>({listRegisteredAgents:m.agents}));
import {GET} from "@/app/api/admin/automation/studio-snapshot/route";
import {POST} from "@/app/api/admin/automation/studio-supervisor/route";
const result=async(r:Response)=>{const lines=(await r.text()).trim().split("\n");return JSON.parse(lines.at(-1)!);};
const request=(body:unknown,origin="https://local.test")=>new Request("https://local.test/api/admin/automation/studio-supervisor",{method:"POST",headers:{"Content-Type":"application/json",origin},body:JSON.stringify(body)});
beforeEach(()=>{vi.clearAllMocks();m.auth.mockResolvedValue(null);m.agents.mockReturnValue([]);
 m.snapshot.mockResolvedValue({ok:true,status:"unavailable",observations:[],records:[],warnings:["No source"]});
 m.generate.mockResolvedValue({ok:true,text:"لا توجد بيانات موثقة"});});
it("unauthorized reads do not call adapters",async()=>{
 m.auth.mockResolvedValue(new Response("denied",{status:401}));
 expect((await GET(new Request("https://local.test/?domain=finance"))).status).toBe(401);
 expect(m.snapshot).not.toHaveBeenCalled();
});
it("rejects unknown domains and foreign-origin supervisor requests",async()=>{
 expect((await GET(new Request("https://local.test/?domain=../../secrets"))).status).toBe(400);
 expect((await POST(request({message:"hi",domain:"finance"},"https://foreign.test"))).status).toBe(403);
 expect(m.generate).not.toHaveBeenCalled();
});
it("never labels a model response as an executed operation",async()=>{
 const r=await POST(request({message:"استرجع الدفع",domain:"finance"}));const d=await result(r);
 expect(d.effects).toBe("read_only");expect(d.events.at(-1).detail).toContain("لم تُنفذ");
 expect(m.generate.mock.calls[0][0].systemInstruction).toContain("لا تملك أدوات كتابة");
});
it("disabled or unregistered agents cannot be selected",async()=>{
 expect((await POST(request({message:"hi",domain:"finance",agentId:"invented"}))).status).toBe(403);
 expect(m.snapshot).not.toHaveBeenCalled();
});
it("model failure is an error, not a synthetic success",async()=>{
 m.generate.mockResolvedValue({ok:false});
 const r=await POST(request({message:"hi",domain:"finance"}));expect((await result(r)).ok).toBe(false);
});

it("streams public stages before the final answer",async()=>{
 const response=await POST(request({message:"افحص الحجوزات",domain:"bookings"}));
 expect(response.headers.get("Content-Type")).toContain("application/x-ndjson");
 const parts=(await response.text()).trim().split("\n").map(x=>JSON.parse(x));
 expect(parts[0].kind).toBe("event");expect(parts[0].event.stage).toBe("reading");
 expect(parts.at(-1).kind).toBe("result");expect(parts.at(-1).effects).toBe("read_only");
});
it("consults only registered peers with matching read capabilities",async()=>{
 m.agents.mockReturnValue([{id:"booking-agent",nameAr:"الحجوزات",allowedTools:["dashboard_bookings"]},
 {id:"unrelated",nameAr:"آخر",allowedTools:["blog_list"]}]);
 m.snapshot.mockResolvedValue({status:"ready",observations:[
 {tool:"dashboard_bookings",status:"ready",facts:[{key:"total",value:7,available:true}]},
 {tool:"blog_list",status:"ready",facts:[{key:"unrelated",value:99,available:true}]}],warnings:[]});
 const response=await result(await POST(request({message:"افحص الحجوزات",domain:"bookings",team:true})));
 expect(m.generate).toHaveBeenCalledTimes(2);
 const peer=m.generate.mock.calls[0][0];
 expect(peer.agentRole).toBe("booking-agent");expect(peer.prompt).not.toContain("unrelated");
 expect(response.consultations.map((a:{agentId:string})=>a.agentId)).toEqual(["booking-agent"]);
 expect(response.effects).toBe("read_only");
});
it("returns only schema-valid unexecuted draft proposals",async()=>{
 m.generate.mockResolvedValue({ok:true,text:"json",data:{reply:"مقترح مسودة",draft:{kind:"article.draft.create",title:"عنوان مقترح",content:"محتوى مسودة غير منشورة"}}});
 const accepted=await result(await POST(request({message:"أنشئ مسودة",domain:"cms"})));
 expect(accepted.proposal.kind).toBe("article.draft.create");expect(accepted.effects).toBe("read_only");
 m.generate.mockResolvedValue({ok:true,text:"json",data:{reply:"طلب",draft:{kind:"payment.refund",amount:1000}}});
 expect((await result(await POST(request({message:"استرجاع",domain:"finance"})))).proposal).toBeNull();
});
it("registry failure returns a controlled unavailable response",async()=>{
 m.agents.mockImplementation(()=>{throw new Error("private detail");});
 const response=await POST(request({message:"مرحبا",domain:"finance"}));
 expect(response.status).toBe(503);expect(await response.text()).not.toContain("private detail");
});
