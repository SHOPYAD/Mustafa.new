import type { GraphMap, GraphNode } from "./types";

function hub(id: string, label: string, capabilityRefs: string[], tone: GraphNode["tone"] = "cyan"): GraphNode {
  return { id, kind: "system", label, domainId: "automation", tone, capabilityRefs };
}

export function buildLoopsStudioMap(): GraphMap {
  const hubs: GraphNode[] = [
    hub("loops.canvas", "كانفاس التدفق", ["loops.run"]),
    hub("loops.inspector", "مفتش العقد", ["automation.loops.toggle_panel"]),
    hub("loops.credentials", "خزينة المفاتيح", [], "gold"),
    hub("loops.run", "تشغيل التدفق", ["loops.run", "automation.loops.restore_panels"], "magenta"),
  ];
  return {
    id: "screen.22",
    title: "استوديو الأتمتة البصرية",
    subtitle: "عقد وتدفقات",
    screenId: "22",
    parentMapId: "atlas",
    rootId: "agent.supervisor",
    hubs,
    leaves: {},
    edges: hubs.map((n) => ({
      id: `e-${n.id}`,
      source: "agent.supervisor",
      target: n.id,
      relationType: "contains" as const,
      evidenceRef: "loops-studio-map",
    })),
  };
}
