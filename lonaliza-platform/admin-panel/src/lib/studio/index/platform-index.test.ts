import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DOMAIN_SCREENS, KNOWN_COLLECTIONS } from "@/lib/neural-studio/domain-systems";
import { STUDIO_SCREENS } from "@/components/admin/automation/hud/screens/screensData";
import { KEYWORD_OVERRIDES } from "./overrides";
import { PLATFORM_INDEX_BY_ID, PLATFORM_INDEX_NODES } from "./platform-index.generated";

const root = path.resolve(__dirname, "../../../app");

describe("platform index drift", () => {
  it("has unique node ids", () => {
    const ids = PLATFORM_INDEX_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers all studio screens 01..22", () => {
    for (const s of STUDIO_SCREENS) {
      expect(PLATFORM_INDEX_BY_ID[`screen.${s.id}`], s.id).toBeDefined();
    }
    expect(STUDIO_SCREENS.some((s) => s.id === "21")).toBe(true);
    expect(STUDIO_SCREENS.some((s) => s.id === "22")).toBe(true);
  });

  it("indexes nexus (21) and visual loops (22) with cockpit capabilities", () => {
    const nexus = PLATFORM_INDEX_BY_ID["screen.21"];
    expect(nexus?.screenId).toBe("21");
    expect(nexus?.mapId).toBe("screen.21");
    expect(nexus?.capabilityRefs).toEqual(
      expect.arrayContaining(["nexus.rotate", "nexus.select_sector", "nexus.run_sector_command"])
    );
    const loops = PLATFORM_INDEX_BY_ID["screen.22"];
    expect(loops?.screenId).toBe("22");
    expect(loops?.mapId).toBe("screen.22");
    expect(loops?.capabilityRefs).toEqual(
      expect.arrayContaining(["loops.run", "loops.run_node", "loops.select_sector"])
    );
  });

  it("covers every domain hub and collection item", () => {
    for (const screen of DOMAIN_SCREENS) {
      expect(PLATFORM_INDEX_BY_ID[`domain.screen.${screen.screenId}`]).toBeDefined();
      for (const hub of screen.hubs) {
        expect(PLATFORM_INDEX_BY_ID[`hub.${hub.id}`], hub.id).toBeDefined();
        for (const item of hub.items) {
          const itemNodes = PLATFORM_INDEX_NODES.filter(
            (n) => n.kind === "domain_item" && n.parentId === `hub.${hub.id}` && n.labels.ar === item.label
          );
          expect(itemNodes.length, `${hub.id}/${item.label}`).toBeGreaterThan(0);
          if (item.collection) {
            expect(PLATFORM_INDEX_BY_ID[`collection.${item.collection}`], item.collection).toBeDefined();
          }
        }
      }
    }
  });

  it("covers known collections", () => {
    for (const c of KNOWN_COLLECTIONS) {
      expect(PLATFORM_INDEX_BY_ID[`collection.${c}`], c).toBeDefined();
    }
  });

  it("maps override terms to existing nodes", () => {
    for (const ids of Object.values(KEYWORD_OVERRIDES)) {
      for (const id of ids) expect(PLATFORM_INDEX_BY_ID[id], id).toBeDefined();
    }
  });

  it("indexes every admin API route file", () => {
    function walk(dir: string): string[] {
      const out: string[] = [];
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) out.push(...walk(p));
        else if (ent.name === "route.ts") out.push(p);
      }
      return out;
    }
    const routes = walk(path.join(root, "api/admin"));
    expect(routes.length).toBeGreaterThan(100);
    const apiNodes = PLATFORM_INDEX_NODES.filter((n) => n.kind === "api_route");
    expect(apiNodes.length).toBe(routes.length);
  });

  it("includes nav atlas leaves from maps GROUPS", () => {
    const leaves = PLATFORM_INDEX_NODES.filter((n) => n.kind === "nav_leaf");
    expect(leaves.length).toBeGreaterThanOrEqual(40);
  });
});
