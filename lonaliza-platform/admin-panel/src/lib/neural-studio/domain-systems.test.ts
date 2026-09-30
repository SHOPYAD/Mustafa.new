import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DOMAIN_SCREENS, KNOWN_COLLECTIONS, resolveDomainFocus } from "./domain-systems";
import { RESERVED, layoutDomain, overlaps } from "./domain-layout";

const root = path.resolve(__dirname, "../../app");
const AGENT_IDS = ["sales", "b2b_landing", "site_advisor", "ads", "social", "email", "app_concierge", "app_notifications", "lead_scout", "ui_ux_architect", "reseller_network_director", "chief_security_auditor"];

function pageExists(href: string) {
  const clean = href.split(/[?#]/)[0].replace(/^\/admin\/?/, "");
  return fs.existsSync(path.join(root, "admin", clean, "page.tsx"));
}

describe("domain systems registry", () => {
  const hubs = DOMAIN_SCREENS.flatMap((s) => s.hubs);

  it("covers screens 03..16 with unique hub ids", () => {
    expect(DOMAIN_SCREENS.map((s) => s.screenId)).toEqual(["03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16"]);
    expect(new Set(hubs.map((h) => h.id)).size).toBe(hubs.length);
  });

  it("points every hub and core at an existing admin page", () => {
    for (const s of DOMAIN_SCREENS) expect(pageExists(s.core.href), s.core.href).toBe(true);
    for (const h of hubs) expect(pageExists(h.href), `${h.id} ${h.href}`).toBe(true);
  });

  it("uses only real collections, routes and agents", () => {
    for (const h of hubs) {
      if (h.agentId) expect(AGENT_IDS, h.id).toContain(h.agentId);
      expect(h.items.length).toBeGreaterThan(0);
      for (const item of h.items) {
        expect(item.collection || item.route || item.href, `${h.id}/${item.label}`).toBeTruthy();
        if (item.collection) expect(KNOWN_COLLECTIONS.has(item.collection), item.collection).toBe(true);
        if (item.route) expect(fs.existsSync(path.join(root, item.route.replace(/^\//, ""), "route.ts")), item.route).toBe(true);
        if (item.href) expect(pageExists(item.href), item.href).toBe(true);
      }
    }
  });

  it("routes task text to the matching real hub", () => {
    expect(resolveDomainFocus("راجع تقييمات الفنادق الجديدة")?.hubId).toBe("hotels.reviews");
    expect(resolveDomainFocus("جدول منشور على انستغرام عبر تقويم النشر")?.screenId).toBe("09");
    expect(resolveDomainFocus("كيف حالك")).toBeNull();
  });

  it("lays out every screen without text collisions or window overlap", () => {
    for (const s of DOMAIN_SCREENS) {
      const layout = layoutDomain(s);
      layout.forEach((a, i) => {
        layout.slice(i + 1).forEach((b) => expect(overlaps(a.box, b.box), `${s.screenId} ${a.hub.id}~${b.hub.id}`).toBe(false));
        for (const [name, r] of Object.entries(RESERVED)) expect(overlaps(a.box, r), `${s.screenId} ${a.hub.id}#${name}`).toBe(false);
      });
    }
  });
});
