import { describe, expect, it } from "vitest";
import { planStudioCapability } from "@/lib/studio/capabilities/agent-plan";
import { planDirective } from "@/lib/studio/capabilities/agent-router.server";
import { routeUtterance } from "@/lib/studio/commands/catalog";
import { dispatchInternalDirective } from "@/lib/studio/graph/internal-engine";
import { resolveIntent } from "@/lib/studio/index/intent-router";

const ctx = { screenId: "20", last: null };

describe("langgraph vs deterministic studio routing", () => {
  it("discuss defers to langgraph (no deterministic plan)", async () => {
    expect(resolveIntent("تناقشوا في أفضل حملة", ctx).kind).toBe("discuss");
    expect(routeUtterance("تناقشوا في أفضل حملة", ctx).kind).toBe("discuss");
    await expect(planDirective("تناقشوا في أفضل حملة", ctx)).resolves.toBeNull();
  });

  it("nexus and loops open screens via agent-plan, not langgraph", async () => {
    expect(planStudioCapability("افتح nexus")).toMatchObject({
      capabilityId: "studio.open_screen",
      input: { screenId: "21" },
    });
    await expect(planDirective("افتح nexus", ctx)).resolves.toMatchObject({
      capabilityId: "studio.open_screen",
      input: { screenId: "21" },
    });
    expect(planStudioCapability("افتح استوديو العقد والأتمتة")).toMatchObject({
      capabilityId: "studio.open_screen",
      input: { screenId: "22" },
    });
    await expect(planDirective("افتح استوديو العقد والأتمتة", ctx)).resolves.toMatchObject({
      capabilityId: "studio.open_screen",
      input: { screenId: "22" },
    });
    await expect(planDirective("افتح loops", ctx)).resolves.toMatchObject({
      capabilityId: "studio.navigate",
      input: { mapId: "screen.22", nodeId: "screen.22" },
    });
  });

  it("screen 22 operational unknowns do not allow full swarm", async () => {
    const out = await dispatchInternalDirective("عدّل قسم_zz_nonexistent_hub", "sess-22", {
      screenId: "22",
      autoExecute: false,
    });
    if (out.handled) return;
    expect(out.allowFullSwarm).toBe(false);
  });

  it("nexus rotate and loops run stay on operational capabilities", () => {
    expect(planStudioCapability("البطاقة التالية")).toMatchObject({
      capabilityId: "nexus.rotate",
      input: { delta: 1 },
    });
    expect(planStudioCapability("شغّل التدflow")).toMatchObject({
      capabilityId: "loops.run",
      input: { dryRun: true },
    });
  });
});
