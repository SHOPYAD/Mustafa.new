import { describe, expect, it } from "vitest";
import { getSessionLoopSnapshot, resolveBlueprintLoop, setSessionLoopSnapshot } from "./loops-store.server";

const sample = {
  id: "loop-unit",
  name: "Unit",
  sector: "articles" as const,
  nodes: [{ id: "n1", type: "trigger" as const, title: "T", subtitle: "", details: "", parameters: {} }],
  connections: [] as { id: string; from: string; to: string }[],
};

describe("loops-store", () => {
  it("resolves inline loop, then id, then session snapshot", () => {
    setSessionLoopSnapshot("sess-a", sample);
    expect(resolveBlueprintLoop({ loop: sample }, "sess-a")?.id).toBe("loop-unit");
    expect(resolveBlueprintLoop({ loopId: "loop-unit" }, "other")?.id).toBe("loop-unit");
    expect(resolveBlueprintLoop({}, "sess-a")?.id).toBe("loop-unit");
    expect(getSessionLoopSnapshot("sess-a")?.id).toBe("loop-unit");
  });
});
