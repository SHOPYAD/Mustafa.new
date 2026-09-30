import type { Tone } from "../tokens";

export type NodeKind = "agent" | "domain" | "system" | "entity" | "setting" | "action";
export type RelationType = "contains" | "depends_on" | "calls" | "produces" | "observed_flow";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  /** الاسم الكامل في لوحة الإدارة إن اختُصر العنوان للعرض. */
  fullLabel?: string;
  parentId?: string;
  domainId: string;
  tone: Tone;
  icon?: string;
  href?: string;
  collection?: string;
  route?: string;
  capabilityRefs: string[];
  /** خريطة فرعية تُفتح بالنقر. */
  childMapId?: string;
  /** نافذة تُفتح بالنقر إن لم تكن هناك خريطة فرعية. */
  window?: "table" | "route" | "page" | "trace";
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationType: RelationType;
  evidenceRef: string;
}

export interface GraphMap {
  id: string;
  title: string;
  subtitle: string;
  screenId: string;
  parentMapId?: string;
  /** العقدة المركزية دائمًا الوكيل المشرف. */
  rootId: "agent.supervisor";
  /** عقدة المجال نفسه (جذر الشجرة في المراجع 05 و06). */
  root?: GraphNode;
  hubs: GraphNode[];
  leaves: Record<string, GraphNode[]>;
  edges: GraphEdge[];
}

export const AGENT_ROOT: GraphNode = {
  id: "agent.supervisor",
  kind: "agent",
  label: "الوكيل المشرف",
  domainId: "platform",
  tone: "gold",
  capabilityRefs: [],
};

export function mapCollections(map: GraphMap): string[] {
  const out = new Set<string>();
  for (const hub of map.hubs) {
    if (hub.collection) out.add(hub.collection);
    for (const leaf of map.leaves[hub.id] ?? []) if (leaf.collection) out.add(leaf.collection);
  }
  return [...out];
}
