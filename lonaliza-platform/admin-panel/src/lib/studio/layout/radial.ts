import type { Pt, Rect } from "../camera";
import type { GraphMap, GraphNode } from "../graph/types";

export interface HubPlacement {
  node: GraphNode;
  at: Pt;
  side: "left" | "right";
  title: Pt;
  bullets: { node: GraphNode; at: Pt }[];
  more: number;
  box: Rect;
  /** بطاقة مستطيلة (تخطيط التدفق)، بوحدات العالم. */
  card?: { w: number; h: number };
  /** عقدة مصغرة (الأطلس المصغر في الواجهة 02). */
  mini?: boolean;
  titleSize?: number;
}

export interface LayoutLink {
  hubId: string;
  from: Pt;
  to: Pt;
}

export interface MapLayout {
  kind: "radial" | "flow" | "tree" | "cumulative" | "presence";
  /** مركز المجسم البشري ونصف قطره (الواجهة 20). */
  presence?: { at: Pt; r: number };
  /** مركز الوكيل المشرف. */
  center: Pt;
  /** عقدة جذر المجال (تخطيط الشجرة). */
  root?: { node: GraphNode; at: Pt; r: number };
  /** أعصاب صريحة بدل الوكيل→المحور (التدفق والشجرة). */
  links?: LayoutLink[];
  coreR: number;
  hubR: number;
  titleSize: number;
  itemSize: number;
  itemGap: number;
  hubs: HubPlacement[];
  bounds: Rect;
}

export interface RadialOptions {
  center: Pt;
  rx: number;
  ry: number;
  maxLeaves: number;
  titleSize: number;
  itemSize: number;
  itemGap: number;
  hubR: number;
  coreR: number;
  startDeg?: number;
  /** مراكز عناوين مقاسة من المرجع (وحدات تصميم) لكل عقدة. */
  anchors?: Record<string, Pt>;
}

/** وحدات تصميم 1672×941 (المرجع 01). */
export const ATLAS_OPTIONS: RadialOptions = {
  center: { x: 740, y: 457 },
  rx: 372,
  ry: 322,
  maxLeaves: 7,
  titleSize: 19.5,
  itemSize: 13.5,
  itemGap: 18.5,
  hubR: 10,
  coreR: 150,
  // docs/cyber-console/regions/01.json → titleCenters
  anchors: {
    "domain.overview": { x: 747, y: 92 },
    "domain.bookings": { x: 955, y: 126 },
    "domain.inventory": { x: 1055, y: 259 },
    "domain.storefront": { x: 1118, y: 447 },
    "domain.customers": { x: 939, y: 649 },
    "domain.marketing": { x: 779, y: 712 },
    "domain.ai_center": { x: 494, y: 694 },
    "domain.finance": { x: 400, y: 547 },
    "domain.legal": { x: 330, y: 418 },
    "domain.system": { x: 418, y: 259 },
    "domain.resale": { x: 547, y: 126 },
  },
};
export const DOMAIN_OPTIONS: RadialOptions = { center: { x: 740, y: 457 }, rx: 300, ry: 262, maxLeaves: 4, titleSize: 19, itemSize: 15, itemGap: 24, hubR: 27, coreR: 132 };

/** عرض تقريبي لنص عربي بخط Noto Sans Arabic. */
export function textWidth(text: string, size: number) {
  return Math.ceil(text.length * size * 0.56);
}

function placeHub(node: GraphNode, map: GraphMap, o: RadialOptions, at: Pt, side: "left" | "right"): HubPlacement {
  const all = map.leaves[node.id] ?? [];
  const shown = all.slice(0, o.maxLeaves);
  const more = all.length - shown.length;
  const rows = shown.length + (more > 0 ? 1 : 0);
  const titleH = o.titleSize + 16;
  const blockH = titleH + rows * o.itemGap;
  const top = at.y - blockH / 2;
  const dir = side === "left" ? -1 : 1;
  const bulletX = at.x + dir * (o.hubR + 22);
  const bullets = shown.map((leaf, k) => ({ node: leaf, at: { x: bulletX, y: top + titleH + o.itemGap / 2 + k * o.itemGap } }));
  const titleW = textWidth(node.label, o.titleSize);
  const itemW = Math.max(0, ...shown.map((l) => textWidth(l.label, o.itemSize) + 44));
  const w = Math.max(titleW, itemW) + 10;
  const anchorX = side === "left" ? bulletX + 10 : bulletX - 10;
  return { node, at, side, title: { x: anchorX, y: top + titleH / 2 }, bullets, more, box: { x: side === "left" ? anchorX - w : anchorX, y: top, w, h: blockH } };
}

export function layoutRadial(map: GraphMap, o: RadialOptions): MapLayout {
  const n = map.hubs.length || 1;
  const offset = o.startDeg ?? (n % 2 === 0 ? 180 / n : 0);
  let hubs = map.hubs.map((node, i): HubPlacement => {
    const anchor = o.anchors?.[node.id];
    if (anchor) {
      const side: "left" | "right" = anchor.x < o.center.x - 1 ? "left" : "right";
      const dir = side === "left" ? -1 : 1;
      const probe = placeHub(node, map, o, { x: 0, y: 0 }, side);
      const titleW = textWidth(node.label, o.titleSize);
      const edgeX = anchor.x - dir * (titleW / 2);
      const at = { x: edgeX - dir * (o.hubR + 12), y: anchor.y - probe.title.y };
      return placeHub(node, map, o, at, side);
    }
    const deg = 90 - offset - (360 / n) * i;
    const rad = (deg * Math.PI) / 180;
    const at = { x: o.center.x + Math.cos(rad) * o.rx, y: o.center.y - Math.sin(rad) * o.ry };
    return placeHub(node, map, o, at, at.x < o.center.x - 1 ? "left" : "right");
  });
  const gap = 6;
  for (let iter = 0; iter < 80; iter += 1) {
    let moved = false;
    for (let i = 0; i < hubs.length; i += 1) {
      for (let j = i + 1; j < hubs.length; j += 1) {
        const a = hubs[i].box;
        const b = hubs[j].box;
        if (!(a.x < b.x + b.w && b.x < a.x + a.w)) continue;
        const overlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + gap;
        if (overlap <= 0) continue;
        const [upper, lower] = a.y <= b.y ? [i, j] : [j, i];
        const shift = overlap / 2;
        hubs[upper] = placeHub(hubs[upper].node, map, o, { x: hubs[upper].at.x, y: hubs[upper].at.y - shift }, hubs[upper].side);
        hubs[lower] = placeHub(hubs[lower].node, map, o, { x: hubs[lower].at.x, y: hubs[lower].at.y + shift }, hubs[lower].side);
        moved = true;
      }
    }
    if (!moved) break;
  }
  const xs = hubs.flatMap((h) => [h.box.x, h.box.x + h.box.w, o.center.x - o.coreR, o.center.x + o.coreR]);
  const ys = hubs.flatMap((h) => [h.box.y, h.box.y + h.box.h, o.center.y - o.coreR, o.center.y + o.coreR]);
  const bounds = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  return { kind: "radial", center: o.center, coreR: o.coreR, hubR: o.hubR, titleSize: o.titleSize, itemSize: o.itemSize, itemGap: o.itemGap, hubs, bounds };
}

/** بنود تحت العقدة (للتدفق والشجرة): العنوان فوق، القائمة أسفل. */
function placeBelow(node: GraphNode, map: GraphMap, o: RadialOptions, at: Pt): HubPlacement {
  const all = map.leaves[node.id] ?? [];
  const shown = all.slice(0, o.maxLeaves);
  const more = all.length - shown.length;
  const titleW = textWidth(node.label, o.titleSize);
  const itemW = Math.max(0, ...shown.map((l) => textWidth(l.label, o.itemSize) + 30));
  const bulletX = at.x + Math.max(40, itemW / 2);
  const top = at.y + o.hubR + 14;
  const bullets = shown.map((leaf, k) => ({ node: leaf, at: { x: bulletX, y: top + o.itemGap / 2 + k * o.itemGap } }));
  const titleY = at.y - o.hubR - 22;
  const rows = shown.length + (more > 0 ? 1 : 0);
  const w = Math.max(titleW, itemW + 20);
  const titleX = at.x + titleW / 2;
  return {
    node,
    at,
    side: "left",
    title: { x: titleX, y: titleY },
    bullets,
    more,
    box: { x: at.x - w / 2, y: titleY - o.titleSize / 2 - 4, w, h: top + rows * o.itemGap - (titleY - o.titleSize / 2 - 4) },
  };
}

function boundsOf(hubs: HubPlacement[], extra: Pt[], r: number) {
  const xs = [...hubs.flatMap((h) => [h.box.x, h.box.x + h.box.w]), ...extra.flatMap((p) => [p.x - r, p.x + r])];
  const ys = [...hubs.flatMap((h) => [h.box.y, h.box.y + h.box.h]), ...extra.flatMap((p) => [p.y - r, p.y + r])];
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

const SIDE_CORE = { center: { x: 215, y: 735 }, coreR: 112 };

function placeCard(node: GraphNode, map: GraphMap, o: RadialOptions, at: Pt): HubPlacement {
  const all = map.leaves[node.id] ?? [];
  const shown = all.slice(0, o.maxLeaves);
  const more = all.length - shown.length;
  const card = { w: Math.max(168, textWidth(node.label, o.titleSize) + 70), h: 58 };
  const itemW = Math.max(0, ...shown.map((l) => textWidth(l.label, o.itemSize) + 30));
  const top = at.y + card.h / 2 + 12;
  const bulletX = at.x + Math.min(card.w / 2 - 12, Math.max(40, itemW / 2));
  const bullets = shown.map((leaf, k) => ({ node: leaf, at: { x: bulletX, y: top + o.itemGap / 2 + k * o.itemGap } }));
  const rows = shown.length + (more > 0 ? 1 : 0);
  const w = Math.max(card.w, itemW + 20);
  return { node, at, side: "left", title: { x: at.x, y: at.y }, bullets, more, card, box: { x: at.x - w / 2, y: at.y - card.h / 2, w, h: card.h / 2 + 12 + rows * o.itemGap + card.h / 2 } };
}

/** تدفق من اليسار إلى اليمين في صفين (المرجعان 04 و12). */
export function layoutFlow(map: GraphMap, o: RadialOptions): MapLayout {
  const n = map.hubs.length;
  const perRow = n > 4 ? Math.ceil(n / 2) : n;
  const colW = 280;
  const rowY = [300, 560];
  const hubs = map.hubs.map((node, i) => {
    const row = Math.floor(i / perRow);
    const col = row % 2 === 0 ? i % perRow : perRow - 1 - (i % perRow);
    return placeCard(node, map, o, { x: 520 + col * colW, y: rowY[row] ?? 560 });
  });
  const links = hubs.map((h, i) => ({ hubId: h.node.id, from: i === 0 ? SIDE_CORE.center : hubs[i - 1].at, to: h.at }));
  return { kind: "flow", center: SIDE_CORE.center, coreR: SIDE_CORE.coreR, hubR: o.hubR, titleSize: o.titleSize, itemSize: o.itemSize, itemGap: o.itemGap, hubs, links, bounds: boundsOf(hubs, [SIDE_CORE.center], SIDE_CORE.coreR) };
}

/** شجرة: جذر المجال في الأعلى والأنظمة على قوس أسفله (المرجعان 05 و06). */
export function layoutTree(map: GraphMap, o: RadialOptions, rootNode: GraphNode): MapLayout {
  const n = map.hubs.length;
  const root = { node: rootNode, at: { x: 860, y: 200 }, r: 40 };
  const span = Math.min(1040, 175 * n);
  const staggered = n > 4;
  const hubs = map.hubs.map((node, i) => {
    const u = n === 1 ? 0.5 : i / (n - 1);
    const x = root.at.x - span / 2 + u * span;
    const y = staggered ? 400 + (i % 2) * 215 : 470 - Math.sin(u * Math.PI) * 60;
    return placeBelow(node, map, o, { x, y });
  });
  const links = [{ hubId: rootNode.id, from: SIDE_CORE.center, to: root.at }, ...hubs.map((h) => ({ hubId: h.node.id, from: root.at, to: h.at }))];
  return { kind: "tree", center: SIDE_CORE.center, coreR: SIDE_CORE.coreR, root, hubR: o.hubR, titleSize: o.titleSize, itemSize: o.itemSize, itemGap: o.itemGap, hubs, links, bounds: boundsOf(hubs, [SIDE_CORE.center, root.at], Math.max(SIDE_CORE.coreR, 60)) };
}

export const FLOW_OPTIONS: RadialOptions = { ...{ center: { x: 0, y: 0 }, rx: 0, ry: 0 }, maxLeaves: 3, titleSize: 17, itemSize: 13.5, itemGap: 20, hubR: 25, coreR: 112 };

const LAYOUT_OF: Record<string, "flow" | "tree"> = { "screen.04": "flow", "screen.12": "flow", "screen.05": "tree", "screen.06": "tree" };

/** اختيار التخطيط حسب المرجع لكل خريطة. */
export function layoutFor(map: GraphMap, rootNode: GraphNode | undefined = map.root): MapLayout {
  if (map.id === "atlas") return layoutRadial(map, ATLAS_OPTIONS);
  const kind = LAYOUT_OF[map.id];
  if (kind === "flow") return layoutFlow(map, FLOW_OPTIONS);
  if (kind === "tree" && rootNode) return layoutTree(map, FLOW_OPTIONS, rootNode);
  return layoutRadial(map, DOMAIN_OPTIONS);
}

export function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function layoutCollisions(layout: MapLayout, reserved: Rect[] = []): string[] {
  const out: string[] = [];
  layout.hubs.forEach((a, i) => {
    layout.hubs.slice(i + 1).forEach((b) => overlaps(a.box, b.box) && out.push(`${a.node.id}~${b.node.id}`));
    reserved.forEach((r, k) => overlaps(a.box, r) && out.push(`${a.node.id}#${k}`));
    const core = { x: layout.center.x - layout.coreR, y: layout.center.y - layout.coreR, w: layout.coreR * 2, h: layout.coreR * 2 };
    if (overlaps(a.box, core)) out.push(`${a.node.id}#core`);
  });
  return out;
}


/** الواجهة 02: أطلس مصغر يسارًا ثم حلقات السلسلة تتوسع نحو اليمين. */
export function layoutCumulative(map: GraphMap, selected: { leafId?: string; itemId?: string }): MapLayout {
  const o: RadialOptions = { center: { x: 0, y: 0 }, rx: 0, ry: 0, maxLeaves: 9, titleSize: 22, itemSize: 14.5, itemGap: 25, hubR: 10, coreR: 112 };
  const miniC = { x: 260, y: 430 };
  const minis = map.hubs.filter((h) => h.id.startsWith("mini."));
  const hubs: HubPlacement[] = minis.map((node, i) => {
    const a = -Math.PI / 2 + ((i + 0.5) / minis.length) * Math.PI * 2;
    const at = { x: miniC.x + Math.cos(a) * 128, y: miniC.y + Math.sin(a) * 112 };
    const side: "left" | "right" = at.x < miniC.x - 1 ? "left" : "right";
    const w = textWidth(node.label, 11.5) + 8;
    const tx = side === "left" ? at.x - 9 : at.x + 9;
    return { node, at, side, title: { x: tx, y: at.y }, bullets: [], more: 0, mini: true, titleSize: 11.5, box: { x: side === "left" ? tx - w : tx, y: at.y - 9, w, h: 18 } };
  });
  for (let iter = 0; iter < 40; iter += 1) {
    let moved = false;
    for (let i = 0; i < hubs.length; i += 1)
      for (let j = i + 1; j < hubs.length; j += 1) {
        const A = hubs[i].box;
        const B = hubs[j].box;
        if (!(A.x < B.x + B.w && B.x < A.x + A.w)) continue;
        const ov = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) + 2;
        if (ov <= 0) continue;
        const [up, dn] = A.y <= B.y ? [hubs[i], hubs[j]] : [hubs[j], hubs[i]];
        for (const [h, dy] of [[up, -ov / 2], [dn, ov / 2]] as [HubPlacement, number][]) {
          h.at = { x: h.at.x, y: h.at.y + dy };
          h.title = { x: h.title.x, y: h.title.y + dy };
          h.box = { ...h.box, y: h.box.y + dy };
        }
        moved = true;
      }
    if (!moved) break;
  }
  const chain: [string, Pt][] = [["x.domain", { x: 560, y: 250 }], ["x.system", { x: 760, y: 560 }], ["x.entity", { x: 1010, y: 330 }]];
  for (const [id, at] of chain) {
    const node = map.hubs.find((h) => h.id === id);
    if (node) hubs.push(placeHub(node, map, o, at, "right"));
  }
  const links: LayoutLink[] = [{ hubId: "x.root", from: SIDE_CORE.center, to: miniC }];
  for (const m of minis) links.push({ hubId: m.id, from: miniC, to: hubs.find((h) => h.node.id === m.id)!.at });
  const get = (id: string) => hubs.find((h) => h.node.id === id);
  const dom = get("x.domain");
  const miniSel = map.edges.find((e) => e.target === "x.domain")?.source;
  if (dom && miniSel) links.push({ hubId: "x.domain", from: get(miniSel)!.at, to: dom.at });
  const sys = get("x.system");
  if (dom && sys) links.push({ hubId: "x.system", from: dom.bullets.find((b) => b.node.id === selected.leafId)?.at ?? dom.at, to: sys.at });
  const ent = get("x.entity");
  if (sys && ent) links.push({ hubId: "x.entity", from: sys.bullets.find((b) => b.node.id === selected.itemId)?.at ?? sys.at, to: ent.at });
  const root = { node: { id: "x.root", kind: "domain" as const, label: "الأطلس", domainId: "platform", tone: "cyan" as const, capabilityRefs: [] }, at: miniC, r: 26 };
  return { kind: "cumulative", center: SIDE_CORE.center, coreR: SIDE_CORE.coreR, root, hubR: o.hubR, titleSize: o.titleSize, itemSize: o.itemSize, itemGap: o.itemGap, hubs, links, bounds: boundsOf(hubs, [SIDE_CORE.center, miniC], SIDE_CORE.coreR) };
}


/** الواجهة 20: المجسم في المركز، القدرات الأربع حوله، والوكيل أسفل اليسار. */
export function layoutPresence(map: GraphMap): MapLayout {
  const at = { x: 840, y: 430 };
  const base = layoutRadial(map, { center: at, rx: 390, ry: 170, maxLeaves: 4, titleSize: 20, itemSize: 14.5, itemGap: 23, hubR: 10, coreR: 120, startDeg: 45 });
  const links: LayoutLink[] = [{ hubId: "presence.core", from: SIDE_CORE.center, to: at }, ...base.hubs.map((h) => ({ hubId: h.node.id, from: at, to: h.at }))];
  return { ...base, kind: "presence", center: SIDE_CORE.center, coreR: SIDE_CORE.coreR, presence: { at, r: 250 }, links, bounds: boundsOf(base.hubs, [SIDE_CORE.center, at], 250) };
}
