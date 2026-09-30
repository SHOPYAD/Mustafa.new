/**
 * الشاشة 02 — التوسع التراكمي.
 * الصورة المرجعية هي عقد الموضع: أطلس مصغّر ثم الحجوزات ثم عقد الحجز ثم الحجز.
 * regions/02.json ينسخ سيدبار الشاشة 01، والصورة لا تحتوي ذلك الشريط، لذلك لا يُرسم.
 * معرفات domain.02.component.1..8 ثابتة. الورقة بلا وحدة سيادية تبقى unknown.
 */
import { findSovereignSubModule } from "@/components/admin/automation/hud/brain/data/sovereignDomainGraph";
import { atlasDomainDefs, type AtlasNodeStatus } from "@/lib/neural-studio/atlas-catalog";

export interface ExpansionNode {
  id: string;
  specId?: string;
  label: string;
  hint?: string;
  parentId: string | null;
  depth: number;
  color: string;
  subModuleId?: string;
  readEndpoint?: string;
  screenId?: string;
  status: AtlasNodeStatus;
  agentNameAr?: string;
  evidenceRef: string;
  relationType: "contains" | "reference" | "cycle";
  childIds: string[];
}

export interface ExpansionGraph {
  nodes: ExpansionNode[];
  rootId: string;
  poseSelectionId: string;
  poseCursorId: string;
}

interface Seed {
  id: string;
  specId?: string;
  label: string;
  hint?: string;
  parentId: string | null;
  depth: number;
  color: string;
  subModuleId?: string;
  readEndpoint?: string;
  screenId?: string;
  children?: Seed[];
}

const GOLD = "#f5c451";
const CYAN = "#27dff4";

function materialize(seed: Seed, ancestors: string[], seenModules: Set<string>): ExpansionNode[] {
  const mod = seed.subModuleId ? findSovereignSubModule(seed.subModuleId) : undefined;
  const cycle = seed.id !== "" && ancestors.includes(seed.id);
  let relationType: ExpansionNode["relationType"] = "contains";
  if (cycle) relationType = "cycle";
  else if (seed.subModuleId && seenModules.has(seed.subModuleId)) relationType = "reference";

  const node: ExpansionNode = {
    id: seed.id,
    specId: seed.specId,
    label: seed.label,
    hint: seed.hint,
    parentId: seed.parentId,
    depth: seed.depth,
    color: seed.color,
    subModuleId: seed.subModuleId,
    readEndpoint: seed.readEndpoint || mod?.apiEndpoint,
    screenId: seed.screenId,
    status: mod?.status ?? "unknown",
    agentNameAr: mod?.assignedAgent.nameAr,
    evidenceRef: mod
      ? `sovereign:${mod.id}`
      : seed.readEndpoint
        ? `route:${seed.readEndpoint}`
        : "visual-label-only",
    relationType,
    childIds: [],
  };

  if (cycle) return [node];

  if (seed.subModuleId) seenModules.add(seed.subModuleId);
  const nextAncestors = [...ancestors, seed.id];
  const children = seed.children ?? [];
  node.childIds = children.map((child) => child.id);
  const flat = [node];
  for (const child of children) {
    flat.push(...materialize(child, nextAncestors, seenModules));
  }
  return flat;
}

function bookingsPose(): Seed {
  return {
    id: "domain.02.component.2",
    specId: "domain.02.component.2",
    label: "الحجوزات",
    hint: "إدارة الحجوزات والتوافر",
    parentId: "domain.02.component.1",
    depth: 1,
    color: GOLD,
    screenId: "03",
    subModuleId: "sub-flights-bookings",
    children: [
      {
        id: "domain.02.bookings.manage",
        label: "إدارة الحجوزات",
        parentId: "domain.02.component.2",
        depth: 2,
        color: CYAN,
        screenId: "03",
        subModuleId: "sub-flights-bookings",
      },
      {
        id: "domain.02.bookings.fares",
        label: "التوافر والأسعار",
        parentId: "domain.02.component.2",
        depth: 2,
        color: CYAN,
        screenId: "04",
        subModuleId: "sub-flights-core",
      },
      {
        id: "domain.02.bookings.amend",
        label: "التعديل والإلغاء",
        parentId: "domain.02.component.2",
        depth: 2,
        color: CYAN,
        screenId: "03",
        subModuleId: "sub-flights-cancellations",
      },
      {
        id: "domain.02.bookings.channels",
        label: "القنوات والتكامل",
        parentId: "domain.02.component.2",
        depth: 2,
        color: CYAN,
        screenId: "12",
        subModuleId: "sub-auto-integrations",
      },
      {
        id: "domain.02.component.8",
        specId: "domain.02.component.8",
        label: "التقارير والتحليلات",
        parentId: "domain.02.component.2",
        depth: 2,
        color: CYAN,
        screenId: "19",
        subModuleId: "sub-sec-dashboard",
      },
      {
        id: "domain.02.component.3",
        specId: "domain.02.component.3",
        label: "عقد الحجز",
        hint: "إدارة عقود الحجوزات",
        parentId: "domain.02.component.2",
        depth: 2,
        color: GOLD,
        screenId: "03",
        subModuleId: "sub-flights-bookings",
        children: [
          {
        id: "domain.02.contract.cancel",
        label: "طلبات الإلغاء",
        parentId: "domain.02.component.3",
        depth: 2,
            color: CYAN,
            screenId: "03",
            subModuleId: "sub-flights-cancellations",
          },
          {
            id: "domain.02.component.6",
            specId: "domain.02.component.6",
            label: "التقييمات الموثقة",
            parentId: "domain.02.component.3",
        depth: 2,
        color: CYAN,
        screenId: "08",
        subModuleId: "sub-crm-reviews",
            readEndpoint: "/api/admin/reviews/agent",
          },
          {
            id: "domain.02.contract.policy",
        label: "سياسات الحجز",
        parentId: "domain.02.component.3",
        depth: 2,
            color: "#8aa0ab",
            screenId: "03",
          },
          {
            id: "domain.02.component.4",
            specId: "domain.02.component.4",
            label: "الحجز",
            hint: "تفاصيل الحجز الفردي",
            parentId: "domain.02.component.3",
            depth: 3,
            color: GOLD,
            screenId: "03",
            subModuleId: "sub-flights-bookings",
            children: [
              {
                id: "domain.02.booking.price",
                label: "السعر",
                parentId: "domain.02.component.4",
                depth: 3,
                color: CYAN,
                screenId: "04",
                subModuleId: "sub-flights-core",
              },
              {
                id: "domain.02.booking.availability",
                label: "التوافر",
                parentId: "domain.02.component.4",
                depth: 3,
                color: "#7ef3ff",
                screenId: "05",
                subModuleId: "sub-hotels-main",
              },
              {
                id: "domain.02.component.7",
                specId: "domain.02.component.7",
                label: "المورد",
                parentId: "domain.02.component.4",
                depth: 3,
                color: CYAN,
                screenId: "04",
                subModuleId: "sub-flights-providers",
              },
              {
                id: "domain.02.booking.customer",
                label: "العميل",
                parentId: "domain.02.component.4",
                depth: 3,
                color: CYAN,
                screenId: "08",
                subModuleId: "sub-crm-customers",
                readEndpoint: "/api/admin/crm/leads",
              },
              {
                id: "domain.02.booking.payment",
                label: "الدفع",
                parentId: "domain.02.component.4",
                depth: 3,
                color: CYAN,
                screenId: "13",
                subModuleId: "sub-treasury-payments",
                readEndpoint: "/api/admin/payments/catalog",
              },
              {
                id: "domain.02.component.5",
                specId: "domain.02.component.5",
                label: "التأكيد",
                parentId: "domain.02.component.4",
                depth: 3,
                color: CYAN,
                screenId: "03",
                subModuleId: "sub-flights-bookings",
              },
            ],
          },
        ],
      },
    ],
  };
}

export function materializeExpansion(seed: Seed, ancestors: string[] = [], seenModules: Set<string> = new Set()): ExpansionNode[] {
  return materialize(seed, ancestors, seenModules);
}

export function buildExpansionGraph(): ExpansionGraph {
  const root: Seed = {
    id: "domain.02.component.1",
    specId: "domain.02.component.1",
    label: "المنصة",
    parentId: null,
    depth: 0,
    color: CYAN,
    screenId: "01",
    children: [bookingsPose()],
  };
  const nodes = materialize(root, [], new Set());
  return {
    nodes,
    rootId: root.id,
    poseSelectionId: "domain.02.component.4",
    poseCursorId: "domain.02.booking.availability",
  };
}

export function expansionNodeMap(graph: ExpansionGraph) {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

export function ancestryLabels(graph: ExpansionGraph, id: string): string[] {
  const map = expansionNodeMap(graph);
  const labels: string[] = [];
  let current = map.get(id);
  while (current) {
    if (current.id !== graph.rootId) labels.push(current.label);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return labels.reverse();
}

/** طي الأب يخفي الذرية فقط. إعادة الفتح تعيد المعرفات نفسها. */
export function visibleIds(graph: ExpansionGraph, collapsed: ReadonlySet<string>, maxDepth: number): string[] {
  const map = expansionNodeMap(graph);
  const out: string[] = [];
  const walk = (id: string) => {
    const node = map.get(id);
    if (!node || node.depth > maxDepth) return;
    out.push(id);
    if (collapsed.has(id) || node.relationType === "cycle") return;
    for (const childId of node.childIds) walk(childId);
  };
  walk(graph.rootId);
  return out;
}

export function atlasRing() {
  return atlasDomainDefs().map((domain) => ({
    id: domain.id,
    label: domain.label,
    color: domain.color,
    angleDeg: domain.angleDeg,
    screenId: domain.screenId,
  }));
}

export const SPEC_COMPONENT_IDS = [
  "domain.02.component.1",
  "domain.02.component.2",
  "domain.02.component.3",
  "domain.02.component.4",
  "domain.02.component.5",
  "domain.02.component.6",
  "domain.02.component.7",
  "domain.02.component.8",
] as const;
