import {beforeEach,expect,it,vi} from "vitest";
const m=vi.hoisted(()=>({auth:vi.fn(),snapshot:vi.fn()}));
vi.mock("@/lib/server/admin-auth",()=>({assertAdminApi:m.auth}));
vi.mock("@/lib/neural-studio/server-snapshot",()=>({readStudioSnapshot:m.snapshot}));
import {GET} from "@/app/api/admin/automation/studio-events/route";
beforeEach(()=>{vi.clearAllMocks();m.auth.mockResolvedValue(null);m.snapshot.mockResolvedValue({ok:true,domainId:"finance",observations:[],records:[]});});
it("requires authentication before creating a live stream",async()=>{
 m.auth.mockResolvedValue(new Response("",{status:401}));
 expect((await GET(new Request("https://local.test/?domain=finance"))).status).toBe(401);expect(m.snapshot).not.toHaveBeenCalled();
});
it("streams source snapshots and closes on request cancellation",async()=>{
 const abort=new AbortController();const r=await GET(new Request("https://local.test/?domain=finance",{signal:abort.signal}));
 expect(r.headers.get("content-type")).toBe("text/event-stream");
 const reader=r.body!.getReader(),first=await reader.read();
 expect(new TextDecoder().decode(first.value)).toContain("event: snapshot");
 abort.abort();expect((await reader.read()).done).toBe(true);
});
it("rejects arbitrary stream domains",async()=>{
 expect((await GET(new Request("https://local.test/?domain=secrets"))).status).toBe(400);expect(m.snapshot).not.toHaveBeenCalled();
});
