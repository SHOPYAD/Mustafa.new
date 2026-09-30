import { describe, expect, it } from "vitest";
import type { BlueprintLoop } from "./blueprint-types";
import { topologicalOrder, validateGraph } from "./blueprint-runner.server";

const sampleLoop: BlueprintLoop = {
  id: "test-loop",
  name: "Test",
  sector: "articles",
  nodes: [
    {
      id: "a",
      type: "trigger",
      title: "T",
      subtitle: "",
      details: "",
      parameters: {},
    },
    {
      id: "b",
      type: "action",
      title: "A",
      subtitle: "",
      details: "",
      parameters: {},
    },
    {
      id: "c",
      type: "review",
      title: "R",
      subtitle: "",
      details: "",
      parameters: {},
    },
  ],
  connections: [
    { id: "c1", from: "a", to: "b" },
    { id: "c2", from: "b", to: "c" },
  ],
};

describe("blueprint-runner graph", () => {
  it("validateGraph accepts a simple DAG", () => {
    const v = validateGraph(sampleLoop);
    expect(v.ok).toBe(true);
    expect(v.errors).toEqual([]);
  });

  it("validateGraph rejects cycles", () => {
    const cyclic: BlueprintLoop = {
      ...sampleLoop,
      connections: [
        { id: "c1", from: "a", to: "b" },
        { id: "c2", from: "b", to: "c" },
        { id: "c3", from: "c", to: "a" },
      ],
    };
    const v = validateGraph(cyclic);
    expect(v.ok).toBe(false);
    expect(v.errors.some((e) => e.includes("دورة"))).toBe(true);
  });

  it("topologicalOrder respects edges", () => {
    const order = topologicalOrder(sampleLoop).map((n) => n.id);
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
  });
});
