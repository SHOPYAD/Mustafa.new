import {expect,it} from "vitest";
import {SURFACES,getSurfacePages,screenForDomain} from "./surfaces";
import {STUDIO_DOMAINS,STUDIO_PAGES} from "./catalog";
import {DraftAction,describeDraftAction} from "./action-contract";
it("every reference has a routable surface and every domain is covered",()=>{
 expect(SURFACES).toHaveLength(20);expect(new Set(SURFACES.map(s=>s.id)).size).toBe(20);
 for(const d of STUDIO_DOMAINS)expect(SURFACES.some(s=>s.id===screenForDomain(d.id))).toBe(true);
 const covered=new Set(SURFACES.flatMap(s=>getSurfacePages(s.id).map(p=>p.href)));
 expect(STUDIO_PAGES.filter(p=>p.domain).every(p=>covered.has(p.href))).toBe(true);
});
it("related surfaces resolve and never invent navigation URLs",()=>{
 for(const s of SURFACES)for(const id of s.links)expect(SURFACES.some(t=>t.id===id)).toBe(true);
});
it("only two explicit draft mutations are accepted",()=>{
 expect(DraftAction.safeParse({kind:"ticket.issue",bookingId:"x"}).success).toBe(false);
 expect(DraftAction.safeParse({kind:"article.draft.create",title:"Test",content:"Safe plain text",status:"published"}).success).toBe(false);
 expect(DraftAction.safeParse({kind:"automation.draft.create",name:"Test",type:"trips.discover_and_draft",hour:24}).success).toBe(false);
 expect(describeDraftAction({kind:"automation.draft.create",name:"Test",type:"trips.discover_and_draft",hour:9}).effects.join()).toContain("enabled=false");
});
