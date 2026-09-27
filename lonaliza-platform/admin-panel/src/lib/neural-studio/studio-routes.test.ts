import {beforeEach,expect,it,vi} from "vitest";
const m=vi.hoisted(()=>({auth:vi.fn(),snapshot:vi.fn(),generate:vi.fn(),agents:vi.fn()}));
vi.mock("@/lib/server/admin-auth",()=>({assertAdminApi:m.auth}));
vi.mock("@/lib/neural-studio/server-snapshot",()=>({readStudioSnapshot:m.snapshot}));
vi.mock("@/lib/server/gemini-swarm-client",()=>({generateGeminiContent:m.generate}));
vi.mock("@/lib/swarm/agent-registry",()=>({listRegisteredAgents:m.agents}));
import {GET} from "@/app/api/admin/automation/studio-snapshot/route";
import {POST} from "@/app/api/admin/automation/studio-supervisor/route";
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
 const r=await POST(request({message:"استرجع الدفع",domain:"finance"}));const d=await r.json();
 expect(d.effects).toBe("read_only");expect(d.events.at(-1).detail).toContain("لم تُنفذ");
 expect(m.generate.mock.calls[0][0].systemInstruction).toContain("لا تملك أدوات كتابة");
});
it("disabled or unregistered agents cannot be selected",async()=>{
 expect((await POST(request({message:"hi",domain:"finance",agentId:"invented"}))).status).toBe(403);
 expect(m.snapshot).not.toHaveBeenCalled();
});
it("model failure is an error, not a synthetic success",async()=>{
 m.generate.mockResolvedValue({ok:false});
 const r=await POST(request({message:"hi",domain:"finance"}));expect(r.status).toBe(503);expect((await r.json()).ok).toBe(false);
});
