import type { GraphMap, GraphNode } from "./types";

function hub(id: string, label: string, capabilityRefs: string[], tone: GraphNode["tone"] = "cyan"): GraphNode {
  return { id, kind: "system", label, domainId: "platform", tone, capabilityRefs };
}

export function buildNexusStudioMap(): GraphMap {
  const hubs: GraphNode[] = [
    hub("nexus.carousel", "سلايد البطاقات", ["nexus.rotate", "nexus.focus_card"]),
    hub("nexus.gesture", "تعقب اليد", ["nexus.toggle_panel"]),
    hub("nexus.metrics", "إحصائيات حية", [], "gold"),
    hub("nexus.hub_settings", "إعدادات القسم", ["nexus.run_sector_command"], "magenta"),
  ];
  return {
    id: "screen.21",
    title: "مسرح Nexus",
    subtitle: "سلايد البطاقات الهولوغرافية",
    screenId: "21",
    parentMapId: "atlas",
    rootId: "agent.supervisor",
    hubs,
    leaves: {},
    edges: hubs.map((n) => ({
      id: `e-${n.id}`,
      source: "agent.supervisor",
      target: n.id,
      relationType: "contains" as const,
      evidenceRef: "nexus-studio-map",
    })),
  };
}
