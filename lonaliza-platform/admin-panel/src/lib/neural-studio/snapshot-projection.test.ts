import {beforeEach,expect,it,vi} from "vitest";
const m=vi.hoisted(()=>({read:vi.fn(),tool:vi.fn(),pb:vi.fn(),list:vi.fn()}));
vi.mock("node:fs",()=>({promises:{readFile:m.read}}));
vi.mock("@/lib/swarm/agent-tools",()=>({executeSwarmTool:m.tool}));
vi.mock("@/lib/pocketbase/admin",()=>({tryCreateAdminPocketBase:m.pb}));
import {readStudioSnapshot} from "./server-snapshot";
beforeEach(()=>{vi.clearAllMocks();m.tool.mockResolvedValue({ok:false});m.pb.mockResolvedValue({collection:()=>({getList:m.list})});});
it("finance projects fields without PII, secrets or invented balances",async()=>{
 m.list.mockResolvedValue({items:[{id:"x",type:"booking_income",status:"pending",amount:10,currency:"EUR",created:"2026-09-28",email:"private",token:"secret"}]});
 const s=await readStudioSnapshot("finance");expect(s.status).toBe("ready");
 expect(s.records[0].fields).toEqual({amount:10,currency:"EUR",created:"2026-09-28"});
 expect(JSON.stringify(s)).not.toMatch(/private|secret|walletBalances|cashflowTrend/);
});
it("unavailable finance is not an empty healthy account",async()=>{
 m.pb.mockResolvedValue(null);const s=await readStudioSnapshot("finance");expect(s.status).toBe("unavailable");expect(s.records).toEqual([]);
});
it("legal reader never fabricates missing policies or uses seeded deletion rows",async()=>{
 m.read.mockImplementation(async(file:string)=>{
  if(file.endsWith("legal-policies.json"))throw new Error("ENOENT");
  return JSON.stringify([{id:"del_req_101",email:"seed"},{id:"real",status:"pending",email:"private",requestedAt:"2026-09-28"}]);
 });
 const s=await readStudioSnapshot("security");expect(s.status).toBe("partial");expect(s.records.map(r=>r.id)).toEqual(["real"]);
 expect(JSON.stringify(s)).not.toContain("private");expect(s.observations.find(o=>o.tool==="legal-policies")?.status).toBe("unavailable");
});

it("does not expose fallback zero counts when the bookings source is offline",async()=>{
 m.tool.mockResolvedValue({ok:true,facts:[{key:"pocketbase",value:false,available:true},{key:"bookings",value:0,available:true}]});
 const s=await readStudioSnapshot("bookings");
 expect(s.status).toBe("unavailable");expect(s.observations[0].facts).toEqual([]);
 expect(s.warnings.join(" ")).toContain("الأصفار");
});
