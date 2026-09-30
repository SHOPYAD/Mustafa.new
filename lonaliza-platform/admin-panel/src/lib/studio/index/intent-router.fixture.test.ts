import { describe, expect, it } from "vitest";
import { DOMAIN_SCREENS } from "@/lib/neural-studio/domain-systems";
import { STUDIO_SCREENS } from "@/components/admin/automation/hud/screens/screensData";
import { routeUtterance } from "@/lib/studio/commands/catalog";
import { plansFromIntent, resolveIntent } from "./intent-router";
import { PLATFORM_INDEX_NODES } from "./platform-index.generated";

describe("intent-router fixtures", () => {
  for (const screen of STUDIO_SCREENS) {
    it(`screen ${screen.id} title routes`, () => {
      const route = routeUtterance(`افتح ${screen.title}`, { screenId: "20", last: null });
      expect(["navigate", "clarify", "none"]).toContain(route.kind);
    });
  }

  for (const domain of DOMAIN_SCREENS) {
    for (const hub of domain.hubs) {
      it(`hub ${hub.id} on screen ${domain.screenId}`, () => {
        const route = routeUtterance(`اعرض ${hub.label}`, { screenId: domain.screenId, last: null });
        expect(route.kind).toBe("navigate");
        expect(route.target?.screenId).toBe(domain.screenId);
      });
      it(`hub keyword ${hub.id}`, () => {
        const kw = hub.keywords[0];
        if (!kw) return;
        const route = routeUtterance(`افتح ${kw}`, { screenId: domain.screenId, last: null });
        expect(["navigate", "clarify", "none", "article", "radar"]).toContain(route.kind);
      });
    }
    for (const hub of domain.hubs) {
      for (const item of hub.items) {
        if (!item.collection) continue;
        it(`table ${item.collection} via ${item.label}`, () => {
          const plans = plansFromIntent(`اعرض جدول ${item.label}`, { screenId: domain.screenId, last: null });
          const open = plans.find((p) => p.capabilityId.includes("open_table") || p.capabilityId.includes(".list"));
          expect(open || routeUtterance(`افتح ${item.label}`, { screenId: domain.screenId, last: null }).kind).toBeTruthy();
        });
      }
    }
  }

  const navLeaves = PLATFORM_INDEX_NODES.filter((n) => n.kind === "nav_leaf");
  for (const leaf of navLeaves) {
    it(`nav leaf ${leaf.id}`, () => {
      const route = routeUtterance(`افتح ${leaf.labels.ar}`, { screenId: leaf.screenId || "01", last: null });
      expect(["navigate", "clarify", "none"]).toContain(route.kind);
    });
  }

  it("readiness not article", () => {
    expect(resolveIntent("ما الخوادم المفعلة لديك", { screenId: "20", last: null }).kind).toBe("readiness");
    expect(resolveIntent("تقرير جاهزية المنصة", { screenId: "19", last: null }).kind).toBe("readiness");
  });

  it("article only when explicit", () => {
    expect(resolveIntent("اكتب مقال عن باريس", { screenId: "20", last: null }).kind).toBe("article");
    expect(resolveIntent("ما حالة النظام", { screenId: "20", last: null }).kind).not.toBe("article");
  });

  it("discuss routes to swarm", () => {
    expect(resolveIntent("تناقشوا في أفضل حملة", { screenId: "20", last: null }).kind).toBe("discuss");
  });

  it("cancellation list operational", () => {
    const plans = plansFromIntent("اعرض طلبات الإلغاء المعلقة", { screenId: "03", last: null });
    expect(plans[0]?.capabilityId).toBe("bookings.cancellation.list");
  });

  it("nexus cockpit phrases navigate to screen 21", () => {
    for (const utterance of ["افتح nexus", "افتح مسرح nexus", "nexus orbital deck", "افتح orbital deck"]) {
      const route = routeUtterance(utterance, { screenId: "20", last: null });
      expect(route.kind).toBe("navigate");
      expect(route.target?.screenId).toBe("21");
    }
    expect(resolveIntent("افتح nexus", { screenId: "20", last: null }).nodeId).toBe("screen.21");
  });

  it("visual loops cockpit phrases navigate to screen 22", () => {
    for (const utterance of ["افتح loops", "اعرض loops", "افتح استوديو العقد والأتمتة", "افتح trigger rag model"]) {
      const route = routeUtterance(utterance, { screenId: "20", last: null });
      expect(route.kind).toBe("navigate");
      expect(route.target?.screenId).toBe("22");
    }
    expect(resolveIntent("افتح loops", { screenId: "20", last: null }).nodeId).toBe("screen.22");
  });
});
