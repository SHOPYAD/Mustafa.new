import { expect, it } from "vitest";
import { clampRect, clampZoom, orbitPosition, seededRandom } from "./workspace";
import { STUDIO_DOMAINS, STUDIO_PAGES, STUDIO_SCREENS } from "./catalog";
it("keeps window headers reachable when a desktop window is restored on a phone", () => {
  const rect = clampRect({ x: 1800, y: 900, width: 520, height: 800 }, { width: 390, height: 844 });
  expect(rect.x).toBeGreaterThanOrEqual(8);
  expect(rect.x + rect.width).toBeLessThanOrEqual(382);
  expect(rect.y).toBeGreaterThanOrEqual(80);
  expect(rect.y + rect.height).toBeLessThanOrEqual(768);
});
it("clamps zoom and creates stable graph positions", () => {
  expect(clampZoom(20)).toBe(2.4);
  expect(clampZoom(.01)).toBe(.45);
  expect(orbitPosition(2, 15)).toEqual(orbitPosition(2, 15));
  const a = seededRandom(12), b = seededRandom(12);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});
it("maps every discovered non-auth administrative page to a domain", () => {
  expect(STUDIO_PAGES).toHaveLength(81);
  expect(STUDIO_PAGES.filter(p => p.scope === "domain").every(p => STUDIO_DOMAINS.some(d => d.id === p.domain))).toBe(true);
  expect(new Set(STUDIO_PAGES.map(p => p.href)).size).toBe(STUDIO_PAGES.length);
});
it("tracks all 20 references without declaring any visually approved", () => {
  expect(STUDIO_SCREENS).toHaveLength(20);
  expect(new Set(STUDIO_SCREENS.map(s => s.id)).size).toBe(20);
  expect(STUDIO_SCREENS.every(s => s.acceptance === "pending")).toBe(true);
});

it("reference composition contains all source domains exactly once", async () => {
 const { ATLAS_CLUSTERS } = await import("./atlas-composition");
 const domains = ATLAS_CLUSTERS.flatMap(c => c.domains);
 expect(ATLAS_CLUSTERS).toHaveLength(11);
 expect([...domains].sort()).toEqual(STUDIO_DOMAINS.map(d => d.id).sort());
 expect(new Set(domains).size).toBe(domains.length);
 for (const c of ATLAS_CLUSTERS) for (const href of c.pages) {
  const page = STUDIO_PAGES.find(p => p.href === href);
  expect(page, href).toBeDefined();
  expect(c.domains).toContain(page!.domain);
 }
});
it("reference anchors are deliberate, finite and leave the inspector/explorer clear", async () => {
 const { ATLAS_CLUSTERS, ATLAS_CORE } = await import("./atlas-composition");
 expect(ATLAS_CORE).toEqual({x:745,y:455});
 for (const c of ATLAS_CLUSTERS) {
  expect(c.hub.x).toBeGreaterThan(320);
  expect(c.hub.x).toBeLessThan(1336);
  expect(c.hub.y).toBeGreaterThan(80);
  expect(c.hub.y).toBeLessThan(869);
 }
});
