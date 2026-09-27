import {beforeEach,expect,it,vi} from "vitest";
const mocks=vi.hoisted(()=>({files:new Map<string,string>(),blog:vi.fn(),job:vi.fn()}));
vi.mock("node:fs",()=>({promises:{
 mkdir:vi.fn(async()=>{}),
 open:vi.fn(async(file:string)=>{if(mocks.files.has(file))throw Object.assign(new Error("exists"),{code:"EEXIST"});mocks.files.set(file,"");
  return {writeFile:async(text:string)=>{mocks.files.set(file,text);},close:async()=>{}};}),
 readFile:vi.fn(async(file:string)=>mocks.files.get(file)),
 writeFile:vi.fn(async(file:string,text:string)=>{mocks.files.set(file,text);})
}}));
vi.mock("@/lib/server/blog-store",()=>({createBlogPost:mocks.blog}));
vi.mock("@/lib/server/automation/store",()=>({upsertAutomationJob:mocks.job}));
import {signPreview,verifyPreview,subjectHash,executeDraftOnce} from "./action-service";
const action={kind:"article.draft.create" as const,title:"Test draft",content:"<script>unsafe()</script>"};
const secret="a".repeat(64),subject=subjectHash("session-a");
beforeEach(()=>{mocks.files.clear();mocks.blog.mockReset().mockResolvedValue({id:"draft-1"});mocks.job.mockReset().mockResolvedValue({id:"job-1"});});
it("preview binds exact payload, session and expiry without writes",()=>{
 const p=signPreview(action,subject,secret,1000);
 expect(verifyPreview(p.token,subject,secret,2000).action).toEqual(action);
 expect(()=>verifyPreview(p.token,subjectHash("b"),secret,2000)).toThrow();
 expect(()=>verifyPreview(p.token,subject,secret,400000)).toThrow();
 const [body,mac]=p.token.split(".");expect(()=>verifyPreview(body+"A."+mac,subject,secret,2000)).toThrow();
 expect(mocks.blog).not.toHaveBeenCalled();
});
it("confirmation persists once, escapes HTML and does not publish",async()=>{
 const p=verifyPreview(signPreview(action,subject,secret).token,subject,secret);
 const a=await executeDraftOnce(p.nonce,subject,p.action),b=await executeDraftOnce(p.nonce,subject,p.action);
 expect(mocks.blog).toHaveBeenCalledTimes(1);expect(mocks.blog.mock.calls[0][0]).toMatchObject({status:"draft",contentAr:"<p>&lt;script&gt;unsafe()&lt;/script&gt;</p>"});
 expect(a.status).toBe("draft");expect(b.replayed).toBe(true);
});
it("ambiguous store failure never automatically repeats a mutation",async()=>{
 mocks.blog.mockRejectedValue(new Error("after write"));
 const p=verifyPreview(signPreview(action,subject,secret).token,subject,secret);
 await expect(executeDraftOnce(p.nonce,subject,p.action)).rejects.toThrow("RECONCILIATION_REQUIRED");
 await expect(executeDraftOnce(p.nonce,subject,p.action)).rejects.toThrow("RECONCILIATION_REQUIRED");
 expect(mocks.blog).toHaveBeenCalledTimes(1);
});
it("automation drafts are paused and dry-run at server boundary",async()=>{
 const a={kind:"automation.draft.create" as const,name:"Safe job",type:"trips.discover_and_draft" as const,hour:9};
 const p=verifyPreview(signPreview(a,subject,secret).token,subject,secret);
 await executeDraftOnce(p.nonce,subject,p.action);
 expect(mocks.job.mock.calls[0][0]).toMatchObject({enabled:false,dryRun:true,cron:"0 9 * * *",maxPerRun:1});
});
