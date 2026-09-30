import { describe, expect, it } from "vitest";
import { executeControlPanelTool, inspectPlatformSystems } from "@/lib/swarm/platform-systems-registry";

const SMOKE_IDS = [
  "settings",
  "providers",
  "bookings",
  "blog",
  "flights",
  "hotels",
  "packages",
  "tours",
  "cars",
  "automation",
  "visual_editor",
  "translations",
  "reseller",
  "leads",
  "social",
  "reports",
  "integrations",
  "swarm",
  "trends",
];

describe("platform systems smoke", () => {
  it("lists every inventoried subsystem", async () => {
    const rows = await inspectPlatformSystems();
    expect(rows.length).toBeGreaterThanOrEqual(30);
    const ids = new Set(rows.map((row) => row.id));
    expect(ids.size).toBe(rows.length);
  });

  it("runs one safe execute per major domain", async () => {
    const results = await Promise.all(SMOKE_IDS.map((id) => executeControlPanelTool(id)));
    for (const row of results) {
      expect(row.tool).toBeTruthy();
      expect(typeof row.ok).toBe("boolean");
      if (!row.ok) {
        expect(row.error || row.summary).toBeTruthy();
      } else {
        expect(row.summary).toBeTruthy();
      }
    }
    const okCount = results.filter((row) => row.ok).length;
    expect(okCount).toBeGreaterThan(SMOKE_IDS.length / 2);
  });
});
