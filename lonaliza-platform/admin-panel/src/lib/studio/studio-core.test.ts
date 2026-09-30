import { describe, expect, it } from "vitest";
import { buildAdminNav } from "@/components/admin/admin-nav";
import type { Dictionary } from "@/lib/i18n/types";
import { fitCamera, lerpCamera, toScreen, toWorld, zoomAt } from "./camera";
import { allMapIds, getMap, mapForScreen } from "./graph/maps";
import { layoutCollisions, layoutFor } from "./layout/radial";
import { CAPABILITIES, CAPABILITY_BY_ID, effectiveRisk, needsApproval } from "./capabilities/registry";
import { useAgentStore } from "./agent/agent-store";

describe("camera", () => {
  it("fits the reference frame 1:1 at the reference viewport", () => {
    const c = fitCamera({ x: 0, y: 60, w: 1330, h: 796 }, { x: 0, y: 60, w: 1334, h: 796 });
    expect(c.k).toBeCloseTo(1, 3);
    expect(toScreen(c, { x: 740, y: 457 }).y).toBeCloseTo(457, 1);
  });
  it("zooms around the pointer and round-trips coordinates", () => {
    const c = zoomAt({ x: 10, y: 20, k: 1 }, 2, { x: 300, y: 200 });
    expect(toWorld(c, { x: 300, y: 200 })).toEqual(toWorld({ x: 10, y: 20, k: 1 }, { x: 300, y: 200 }));
    const mid = lerpCamera({ x: 0, y: 0, k: 1 }, { x: 100, y: 0, k: 4 }, 0.5);
    expect(mid.k).toBeCloseTo(2, 5);
  });
});

describe("maps", () => {
  const nav = buildAdminNav({} as Dictionary["admin"]);
  it("atlas has the 11 admin-nav groups in menu order", () => {
    const atlas = getMap("atlas")!;
    expect(atlas.hubs.map((h) => h.domainId)).toEqual(nav.map((g) => g.id));
    expect(atlas.hubs.map((h) => h.label)).toEqual(["نظرة عامة", "الحجوزات", "الخدمات", "محتوى الموقع", "العملاء", "التسويق والنشر", "الذكاء الاصطناعي", "المالية", "الامتثال القانوني", "الإعدادات", "إعادة البيع"]);
  });
  it("every atlas leaf is a real menu item with a real href", () => {
    const hrefs = new Set(nav.flatMap((g) => g.branches.flatMap((b) => b.items.map((i) => i.href))));
    const atlas = getMap("atlas")!;
    for (const leaves of Object.values(atlas.leaves)) for (const l of leaves) expect(hrefs.has(l.href!), l.id).toBe(true);
  });
  it("every child map reference resolves and every map lays out without text collisions", () => {
    for (const id of allMapIds()) {
      const m = getMap(id);
      expect(m, id).not.toBeNull();
      for (const h of m!.hubs) if (h.childMapId) expect(getMap(h.childMapId), `${id}→${h.childMapId}`).not.toBeNull();
      for (const ls of Object.values(m!.leaves)) for (const l of ls) if (l.childMapId) expect(getMap(l.childMapId), `${id}→${l.childMapId}`).not.toBeNull();
      expect(layoutCollisions(layoutFor(m!)), id).toEqual([]);
    }
  });
  it("every edge carries relation type and evidence", () => {
    for (const id of allMapIds()) for (const e of getMap(id)!.edges) expect(e.relationType && e.evidenceRef, e.id).toBeTruthy();
  });
  it("routes screens to maps", () => {
    expect(mapForScreen("01")).toBe("atlas");
    expect(mapForScreen("03")).toBe("screen.03");
    expect(mapForScreen("13")).toBe("screen.13");
  });
});

describe("capabilities", () => {
  it("has unique ids and valid schemas", () => {
    expect(new Set(CAPABILITIES.map((c) => c.id)).size).toBe(CAPABILITIES.length);
    expect(CAPABILITY_BY_ID["bookings.cancellation.approve"].input.safeParse({ bookingId: "abc123def456ghi" }).success).toBe(true);
    expect(CAPABILITY_BY_ID["bookings.cancellation.reject"].input.safeParse({ bookingId: "abc", note: "" }).success).toBe(false);
  });
  it("refunds, deletes and sensitive writes always need the director", () => {
    expect(CAPABILITY_BY_ID["bookings.cancellation.approve"].risk).toBe("high");
    expect(CAPABILITY_BY_ID["records.delete"].risk).toBe("high");
    expect(effectiveRisk(CAPABILITY_BY_ID["records.update"], { collection: "financial_transactions" })).toBe("high");
    expect(needsApproval("high", "command", true)).toBe(true);
    expect(needsApproval("medium", "command", true)).toBe(false);
    expect(needsApproval("medium", "command", false)).toBe(true);
    expect(needsApproval("low", "query", false)).toBe(false);
  });
  it("routes clear directives to capabilities and leaves the rest to the swarm", async () => {
    const { planStudioCapability } = await import("./capabilities/agent-plan");
    expect(planStudioCapability("اعرض طلبات الإلغاء المعلقة")?.capabilityId).toBe("bookings.cancellation.list");
    expect(planStudioCapability("وافق على إلغاء الحجز abc123def456ghi برسوم 20")).toMatchObject({ capabilityId: "bookings.cancellation.approve", input: { bookingId: "abc123def456ghi", feeAmount: 20 } });
    expect(planStudioCapability("اجعل حالة الطلب abc123def456ghi تمت")?.input).toMatchObject({ status: "resolved" });
    expect(planStudioCapability("افتح جدول طلبات الاستفسار")?.input).toMatchObject({ collection: "enquiry_bookings" });
    expect(planStudioCapability("اكتب مقالا عن طرابزون")).toBeNull();
  });
});

describe("agent state machine", () => {
  it("follows voice: listening → thinking → speaking → idle", () => {
    const s = useAgentStore.getState();
    s.reset();
    s.setVoice({ listening: true, userSpeaking: true });
    expect(useAgentStore.getState().phase).toBe("listening");
    s.setVoice({ userSpeaking: false, processing: true });
    expect(useAgentStore.getState().phase).toBe("thinking");
    s.setVoice({ processing: false, agentSpeaking: true }, [0.5, 0.7]);
    expect(useAgentStore.getState().phase).toBe("speaking");
    expect(useAgentStore.getState().levels).toEqual([0.5, 0.7]);
    s.setVoice({ agentSpeaking: false, listening: false });
    expect(useAgentStore.getState().phase).toBe("idle");
  });
  it("plans and executes on nodes", () => {
    const s = useAgentStore.getState();
    s.plan(["bookings.cancellations"], "خطوتان");
    expect(useAgentStore.getState()).toMatchObject({ phase: "planning", planNodeIds: ["bookings.cancellations"] });
    s.execute("bookings.cancellations", "اعتماد إلغاء");
    expect(useAgentStore.getState()).toMatchObject({ phase: "executing", activeNodeId: "bookings.cancellations" });
  });
});

describe("directive planner (rules)", () => {
  it("covers navigation, search, records and status on any collection", async () => {
    const { planStudioCapability } = await import("./capabilities/agent-plan");
    expect(planStudioCapability("افتح الفنادق")?.capabilityId).toBe("studio.navigate");
    expect(planStudioCapability("ابحث عن mustafa في الحجوزات")).toMatchObject({ capabilityId: "studio.open_table", input: { q: "mustafa" } });
    expect(planStudioCapability("افتح السجل qvz7g77lgoz5wmg في الحجوزات")).toMatchObject({ capabilityId: "studio.open_record", input: { id: "qvz7g77lgoz5wmg" } });
    expect(planStudioCapability("غير حالة qvz7g77lgoz5wmg في الحجوزات الى ملغي")).toMatchObject({ capabilityId: "records.update", input: { patch: { status: "cancelled" } } });
    expect(planStudioCapability("كم عدد تقييمات النزلاء")?.input).toMatchObject({ collection: "hotel_guest_reviews" });
    const { splitOperationalParts } = await import("./capabilities/agent-plan");
    expect(splitOperationalParts("كم عدد تقييمات النزلاء، واعرض طلبات الإلغاء، ثم افتح الفنادق")).toEqual([
      "كم عدد تقييمات النزلاء",
      "اعرض طلبات الإلغاء",
      "افتح الفنادق",
    ]);
    expect(splitOperationalParts("اكتب مقالا ثم انشره")).toBeNull();
  });
});

describe("screen 02 cumulative expansion", () => {
  it("chains atlas → domain → system → entity fields without collisions", async () => {
    const { buildExpansionMap } = await import("./graph/maps");
    const { layoutCumulative, layoutCollisions } = await import("./layout/radial");
    const path = { domainId: "bookings", leafId: "domain.bookings.bookings-all", itemId: "bookings.hotel.item0" };
    const m = buildExpansionMap(path, ["status", "hotel_name", "check_in"]);
    expect(m.hubs.filter((h) => h.id.startsWith("x.")).map((h) => h.id)).toEqual(["x.domain", "x.system", "x.entity"]);
    expect(m.hubs.find((h) => h.id === "x.entity")?.collection).toBe("hotel_bookings");
    expect(layoutCollisions(layoutCumulative(m, path))).toEqual([]);
  });
});

describe("screen 20 presence", () => {
  it("lays out the four presence capabilities around the humanoid without collisions", async () => {
    const { buildPresenceMap } = await import("./graph/maps");
    const { layoutPresence, layoutCollisions } = await import("./layout/radial");
    const m = buildPresenceMap();
    expect(m.hubs.map((h) => h.label)).toEqual(["إنتاج الصوت", "الوجود البشري", "التفاعل الطبيعي", "فهم الصوت"]);
    for (const ls of Object.values(m.leaves)) for (const l of ls) expect(l.collection || l.route || l.window === "trace", l.id).toBeTruthy();
    expect(layoutCollisions(layoutPresence(m))).toEqual([]);
  });
});
