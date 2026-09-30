import type { DomainHub, DomainScreen } from "./domain-systems";
import type { Pt } from "./expansion-scene";

export const DOMAIN_CORE: Pt = { x: 742, y: 470 };
export const HUB_R = 27;
export const TITLE_SIZE = 19;
export const ITEM_SIZE = 15;
export const ITEM_GAP = 24;
export const MAX_ITEMS = 4;

/** مناطق محجوزة للنوافذ والقرص: لا يدخلها نص العقد. */
export const RESERVED = {
  agent: { x: 14, y: 92, w: 292, h: 206 },
  explorer: { x: 1336, y: 92, w: 324, h: 430 },
  details: { x: 1336, y: 532, w: 324, h: 306 },
  disc: { x: 10, y: 680, w: 150, h: 170 },
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HubLayout {
  hub: DomainHub;
  at: Pt;
  side: "left" | "right";
  title: { x: number; y: number };
  bullets: Pt[];
  box: Rect;
}

/** تقدير عرض النص العربي؛ يكفي لمنع التداخل دون قياس DOM. */
export function textWidth(text: string, size: number) {
  return Math.ceil(text.length * size * 0.56);
}

export function layoutDomain(screen: DomainScreen): HubLayout[] {
  const n = screen.hubs.length;
  const rx = 300;
  const ry = 262;
  const offset = 180 / n;
  return screen.hubs.map((hub, i) => {
    const deg = 90 - offset - (360 / n) * i;
    const rad = (deg * Math.PI) / 180;
    const at = { x: DOMAIN_CORE.x + Math.cos(rad) * rx, y: DOMAIN_CORE.y - Math.sin(rad) * ry };
    const side: "left" | "right" = at.x < DOMAIN_CORE.x - 1 ? "left" : "right";
    const items = hub.items.slice(0, MAX_ITEMS);
    const blockH = 30 + items.length * ITEM_GAP;
    const top = at.y - blockH / 2;
    const dir = side === "left" ? -1 : 1;
    const bulletX = at.x + dir * (HUB_R + 24);
    const bullets = items.map((_, k) => ({ x: bulletX, y: top + 30 + ITEM_GAP / 2 + k * ITEM_GAP }));
    const titleW = textWidth(hub.label, TITLE_SIZE);
    const itemW = Math.max(0, ...items.map((it) => textWidth(it.label, ITEM_SIZE) + 22));
    const w = Math.max(titleW, itemW) + 12;
    const x0 = side === "left" ? bulletX + 10 - w : bulletX - 10;
    return {
      hub,
      at,
      side,
      title: { x: side === "left" ? bulletX + 10 : bulletX - 10, y: top + 12 },
      bullets,
      box: { x: x0, y: top, w, h: blockH },
    };
  });
}

export function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
