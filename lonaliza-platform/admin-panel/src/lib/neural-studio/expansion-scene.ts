/**
 * رسم الشاشة 02 على Canvas بإحداثيات الصورة المرجعية 1672×941.
 * المواضع مأخوذة بالقياس من 02-fullscreen-cumulative-expansion.png.
 */
export const STAGE_W = 1672;
export const STAGE_H = 941;

export interface Pt {
  x: number;
  y: number;
}

export type LeafTone = "cyan" | "gold" | "grey" | "cursor";

export interface SceneLeaf extends Pt {
  id: string;
  tone: LeafTone;
}

export interface SceneInput {
  hub: Pt | null;
  contract: Pt | null;
  booking: Pt | null;
  marker: Pt | null;
  listLeaves: SceneLeaf[];
  contractLeaves: SceneLeaf[];
  bookingLeaves: SceneLeaf[];
  tooltipFor: Pt | null;
}

const GOLD = "#ffc53d";
const GOLD_SOFT = "#f3b73a";
const CYAN = "#35e3ff";
const TEAL = "#1fb3cf";
const PURPLE = "#b77cff";
const GREEN = "#3ff0a1";

export const MINI_CENTER: Pt = { x: 294, y: 484 };
export const MINI_EXIT: Pt = { x: 415, y: 418 };
export const SMALL_DOT: Pt = { x: 981, y: 168 };

export const MINI_DOMAINS: { label: string; lines: string[]; label_at: Pt; node: Pt; color: string; screenId: string }[] = [
  { label: "نظرة عامة", lines: ["نظرة عامة"], label_at: { x: 302, y: 307 }, node: { x: 293, y: 387 }, color: GREEN, screenId: "19" },
  { label: "الإعدادات وإعادة البيع", lines: ["الإعدادات", "وإعادة البيع"], label_at: { x: 205, y: 335 }, node: { x: 252, y: 400 }, color: PURPLE, screenId: "16" },
  { label: "الامتثال القانوني", lines: ["الامتثال", "القانوني"], label_at: { x: 133, y: 442 }, node: { x: 196, y: 440 }, color: GOLD_SOFT, screenId: "15" },
  { label: "المالية", lines: ["المالية"], label_at: { x: 132, y: 532 }, node: { x: 199, y: 520 }, color: CYAN, screenId: "13" },
  { label: "الذكاء الاصطناعي", lines: ["الذكاء الاصطناعي"], label_at: { x: 171, y: 580 }, node: { x: 232, y: 562 }, color: GOLD_SOFT, screenId: "11" },
  { label: "التسويق والنشر", lines: ["التسويق والنشر"], label_at: { x: 278, y: 612 }, node: { x: 290, y: 584 }, color: GOLD_SOFT, screenId: "10" },
  { label: "العملاء", lines: ["العملاء"], label_at: { x: 392, y: 591 }, node: { x: 357, y: 560 }, color: PURPLE, screenId: "08" },
  { label: "محتوى الموقع", lines: ["محتوى", "الموقع"], label_at: { x: 487, y: 545 }, node: { x: 443, y: 538 }, color: GREEN, screenId: "07" },
  { label: "الخدمات", lines: ["الخدمات"], label_at: { x: 489, y: 468 }, node: { x: 397, y: 482 }, color: CYAN, screenId: "06" },
  { label: "الحجوزات", lines: ["الحجوزات"], label_at: { x: 447, y: 377 }, node: MINI_EXIT, color: GOLD, screenId: "03" },
];

const MINI_DECOR: { node: Pt; color: string }[] = [
  { node: { x: 336, y: 400 }, color: CYAN },
  { node: { x: 377, y: 326 }, color: CYAN },
  { node: { x: 163, y: 372 }, color: GOLD_SOFT },
  { node: { x: 195, y: 482 }, color: PURPLE },
  { node: { x: 170, y: 610 }, color: CYAN },
  { node: { x: 250, y: 640 }, color: PURPLE },
  { node: { x: 470, y: 612 }, color: CYAN },
  { node: { x: 120, y: 500 }, color: CYAN },
];

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function cubicPath(p0: Pt, c1: Pt, c2: Pt, p1: Pt) {
  const path = new Path2D();
  path.moveTo(p0.x, p0.y);
  path.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p1.x, p1.y);
  return path;
}

export function cubicAt(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
  };
}

export function glow(ctx: CanvasRenderingContext2D, path: Path2D, color: string, width: number, alpha: number) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha * 0.07;
  ctx.lineWidth = width * 8;
  ctx.stroke(path);
  ctx.globalAlpha = alpha * 0.2;
  ctx.lineWidth = width * 3.2;
  ctx.stroke(path);
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
}

export function halo(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, width: number, alpha = 1, dash?: number[]) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function bigOrb(ctx: CanvasRenderingContext2D, p: Pt, scale = 1) {
  halo(ctx, p.x, p.y, 58 * scale, "rgba(255,170,40,1)", 0.38);
  halo(ctx, p.x, p.y, 26 * scale, "rgba(255,200,90,1)", 0.55);
  ctx.globalCompositeOperation = "source-over";
  dot(ctx, p.x, p.y, 16 * scale, "#1a1204", 0.85);
  ctx.globalCompositeOperation = "lighter";
  ring(ctx, p.x, p.y, 17 * scale, "#ffc53d", 2.6, 0.95);
  ring(ctx, p.x, p.y, 23 * scale, "#ffc53d", 1, 0.4);
  dot(ctx, p.x, p.y, 11.5 * scale, "#f7b52e");
  halo(ctx, p.x, p.y, 10 * scale, "rgba(255,245,210,1)", 0.85);
  dot(ctx, p.x, p.y, 5 * scale, "#fffaf0");
}

function leafDot(ctx: CanvasRenderingContext2D, leaf: SceneLeaf) {
  const tone = leaf.tone;
  const color = tone === "gold" ? "#ffc94a" : tone === "grey" ? "#7d93a0" : tone === "cursor" ? "#ffe39a" : CYAN;
  const core = tone === "gold" ? "#ffd15e" : tone === "grey" ? "#8fa3ae" : tone === "cursor" ? "#fff3cf" : "#62ecff";
  if (tone !== "grey") halo(ctx, leaf.x, leaf.y, 26, color, 0.4);
  ring(ctx, leaf.x, leaf.y, 12, color, 2.6, tone === "grey" ? 0.7 : 1);
  ctx.globalCompositeOperation = "source-over";
  dot(ctx, leaf.x, leaf.y, 9.5, "#04141d");
  ctx.globalCompositeOperation = "lighter";
  dot(ctx, leaf.x, leaf.y, 6.8, core, tone === "grey" ? 0.8 : 1);
  if (tone !== "grey") dot(ctx, leaf.x, leaf.y, 3, tone === "cyan" ? "#e6fdff" : "#fffbef", 0.9);
}

interface Burst {
  x: number;
  y: number;
  r: number;
  n: number;
  color: string;
  alpha: number;
}

const BURSTS: Burst[] = [
  { x: 1176, y: 258, r: 100, n: 40, color: CYAN, alpha: 0.36 },
  { x: 1160, y: 655, r: 95, n: 36, color: CYAN, alpha: 0.36 },
  { x: 800, y: 283, r: 55, n: 20, color: CYAN, alpha: 0.3 },
  { x: 1290, y: 578, r: 45, n: 14, color: CYAN, alpha: 0.28 },
  { x: 1319, y: 663, r: 42, n: 12, color: CYAN, alpha: 0.28 },
  { x: 1398, y: 295, r: 40, n: 12, color: CYAN, alpha: 0.25 },
  { x: 1259, y: 173, r: 45, n: 14, color: CYAN, alpha: 0.28 },
  { x: 610, y: 690, r: 50, n: 16, color: TEAL, alpha: 0.28 },
  { x: 1050, y: 760, r: 42, n: 12, color: TEAL, alpha: 0.24 },
];

export function paintExpansionScene(ctx: CanvasRenderingContext2D, input: SceneInput) {
  const rand = rng(20260929);
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#01060c";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const sky = ctx.createRadialGradient(860, 460, 60, 860, 460, 1000);
  sky.addColorStop(0, "#0b2440");
  sky.addColorStop(0.45, "#051426");
  sky.addColorStop(1, "#01050b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const leftGlow = ctx.createRadialGradient(294, 484, 10, 294, 484, 330);
  leftGlow.addColorStop(0, "rgba(40,110,170,0.35)");
  leftGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  for (let i = 0; i < 1750; i += 1) {
    const x = rand() * STAGE_W;
    const y = rand() * STAGE_H;
    const pick = rand();
    const color = pick < 0.68 ? "#cfefff" : pick < 0.84 ? "#ffd889" : pick < 0.93 ? CYAN : pick < 0.97 ? PURPLE : GREEN;
    const big = rand() < 0.07;
    const r = big ? 1.3 + rand() * 1.5 : 0.35 + rand() * 0.9;
    if (big) halo(ctx, x, y, r * 6, color, 0.25);
    dot(ctx, x, y, r, color, 0.35 + rand() * 0.6);
  }

  for (const [radius, alpha] of [
    [310, 0.14],
    [440, 0.12],
    [590, 0.1],
    [760, 0.08],
  ] as const) {
    ring(ctx, 860, 470, radius, "#3ab7dc", 1, alpha);
  }
  ring(ctx, 294, 484, 200, "#3ab7dc", 1, 0.12);
  ring(ctx, 294, 484, 250, "#3ab7dc", 0.8, 0.08, [2, 7]);

  const web: Pt[] = [];
  for (let i = 0; i < 220; i += 1) {
    web.push({ x: rand() * STAGE_W, y: 70 + rand() * 790 });
  }
  for (const a of web) {
    const near = web
      .filter((b) => b !== a)
      .map((b) => ({ b, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { b } of near) {
      const path = new Path2D();
      path.moveTo(a.x, a.y);
      path.quadraticCurveTo((a.x + b.x) / 2 + (rand() - 0.5) * 30, (a.y + b.y) / 2 + (rand() - 0.5) * 30, b.x, b.y);
      ctx.strokeStyle = "#4cc6ea";
      ctx.globalAlpha = 0.13;
      ctx.lineWidth = 0.7;
      ctx.stroke(path);
    }
    dot(ctx, a.x, a.y, 1.3, "#9fe9ff", 0.55);
  }
  ctx.globalAlpha = 1;

  for (const burst of BURSTS) {
    for (let i = 0; i < burst.n; i += 1) {
      const angle = rand() * Math.PI * 2;
      const len = burst.r * (0.35 + rand() * 0.65);
      const end = { x: burst.x + Math.cos(angle) * len, y: burst.y + Math.sin(angle) * len };
      const bend = (rand() - 0.5) * len * 0.5;
      const path = new Path2D();
      path.moveTo(burst.x, burst.y);
      path.quadraticCurveTo(
        (burst.x + end.x) / 2 - Math.sin(angle) * bend,
        (burst.y + end.y) / 2 + Math.cos(angle) * bend,
        end.x,
        end.y
      );
      glow(ctx, path, burst.color, 0.6, burst.alpha);
      dot(ctx, end.x, end.y, 1.2 + rand() * 1.2, burst.color, 0.8);
    }
    halo(ctx, burst.x, burst.y, 20, burst.color, 0.6);
    ring(ctx, burst.x, burst.y, 7, burst.color, 1.4, 0.8);
    dot(ctx, burst.x, burst.y, 3.5, "#eaffff");
  }

  paintMiniAtlas(ctx, rand);
  paintCone(ctx, rand, input.hub);

  if (input.marker && input.hub) {
    paintBigArc(ctx, input.marker, input.booking);
    for (const bend of [-26, 10, 34]) {
      const path = cubicPath(
        input.marker,
        { x: input.marker.x - 20 + bend, y: input.marker.y + 90 },
        { x: input.hub.x + bend * 0.6, y: input.hub.y - 90 },
        input.hub
      );
      glow(ctx, path, GOLD, bend === 10 ? 1.6 : 0.8, bend === 10 ? 0.9 : 0.45);
    }
    const link = cubicPath(input.marker, { x: 820, y: 130 }, { x: 900, y: 175 }, SMALL_DOT);
    glow(ctx, link, CYAN, 0.8, 0.5);
    halo(ctx, SMALL_DOT.x, SMALL_DOT.y, 18, CYAN, 0.6);
    dot(ctx, SMALL_DOT.x, SMALL_DOT.y, 5, "#d8fdff");
  }

  const hub = input.hub;
  if (hub) {
    spray(ctx, rand, hub, 90, 40, 170, 0.42);
    const leaves = [...input.listLeaves, ...input.contractLeaves, ...input.bookingLeaves];
    fan(ctx, rand, hub, 60, { x0: 900, x1: 1620, y0: 70, y1: 440 }, 0.26, leaves);
    fan(ctx, rand, hub, 42, { x0: 640, x1: 1080, y0: 470, y1: 840 }, 0.24, leaves);
    for (const leaf of [...input.listLeaves, ...input.contractLeaves]) {
      const tone = leaf.tone === "grey" ? "#7d93a0" : CYAN;
      const lift = (hub.y - leaf.y) * 0.55;
      for (let s = 0; s < 7; s += 1) {
        const off = (s - 3) * 7;
        const path = cubicPath(
          hub,
          { x: hub.x + 55 + off, y: hub.y - lift + off * 1.4 },
          { x: leaf.x - 110, y: leaf.y + off * 0.6 },
          leaf
        );
        glow(ctx, path, s === 3 ? tone : TEAL, s === 3 ? 1.5 : 0.55, s === 3 ? 0.95 : 0.35);
      }
    }
  }

  if (input.contract && hub) {
    spray(ctx, rand, input.contract, 34, 30, 100, 0.35);
    const c1 = { x: hub.x + 70, y: hub.y - 8 };
    const c2 = { x: input.contract.x - 90, y: input.contract.y - 30 };
    beadedPath(ctx, hub, c1, c2, input.contract);
  }
  if (input.contract && input.booking) {
    beadedPath(ctx, input.contract, { x: 1010, y: 450 }, { x: 1150, y: 470 }, input.booking);
  }

  const booking = input.booking;
  if (booking) {
    spray(ctx, rand, booking, 60, 30, 150, 0.36);
    fan(ctx, rand, booking, 36, { x0: 1300, x1: 1650, y0: 330, y1: 820 }, 0.24, input.bookingLeaves);
    fan(ctx, rand, booking, 22, { x0: 940, x1: 1200, y0: 600, y1: 830 }, 0.22);
    for (const leaf of input.bookingLeaves) {
      const tone = leaf.tone === "gold" ? GOLD : leaf.tone === "cursor" ? "#ffe39a" : CYAN;
      for (let s = 0; s < 7; s += 1) {
        const off = (s - 3) * 6;
        const path = cubicPath(
          booking,
          { x: booking.x + 80, y: booking.y + off },
          { x: leaf.x - 95, y: leaf.y + off * 0.5 },
          leaf
        );
        glow(ctx, path, s === 3 ? tone : leaf.tone === "gold" ? GOLD_SOFT : TEAL, s === 3 ? 1.5 : 0.55, s === 3 ? 0.95 : 0.35);
      }
    }
  }

  if (input.tooltipFor) {
    const d = input.tooltipFor;
    const tip = { x: d.x + 19, y: d.y - 169 };
    const tipPath = new Path2D();
    tipPath.moveTo(tip.x + 90, tip.y + 65);
    tipPath.quadraticCurveTo(tip.x + 90, tip.y + 120, d.x + 101, d.y + 4);
    const tipPath2 = new Path2D();
    tipPath2.moveTo(tip.x, tip.y + 59);
    tipPath2.lineTo(d.x - 11, d.y - 74);
    ctx.save();
    ctx.setLineDash([3, 6]);
    glow(ctx, tipPath, CYAN, 1.2, 0.8);
    glow(ctx, tipPath2, CYAN, 1.2, 0.8);
    ctx.restore();
  }

  if (input.marker) {
    halo(ctx, input.marker.x, input.marker.y, 36, "rgba(255,200,80,1)", 0.6);
    ring(ctx, input.marker.x, input.marker.y, 11, "#ffcf55", 2, 0.95);
    dot(ctx, input.marker.x, input.marker.y, 6, "#fff4d0");
  }
  if (hub) bigOrb(ctx, hub, 1.1);
  if (input.contract) bigOrb(ctx, input.contract, 1);
  if (booking) bigOrb(ctx, booking, 1);

  for (const leaf of [...input.listLeaves, ...input.contractLeaves, ...input.bookingLeaves]) {
    leafDot(ctx, leaf);
  }

  ctx.restore();
}

function spray(ctx: CanvasRenderingContext2D, rand: () => number, from: Pt, count: number, min: number, max: number, alpha: number) {
  for (let i = 0; i < count; i += 1) {
    const angle = rand() * Math.PI * 2;
    const len = min + rand() * (max - min);
    const start = { x: from.x + Math.cos(angle) * 16, y: from.y + Math.sin(angle) * 16 };
    const end = { x: from.x + Math.cos(angle) * len, y: from.y + Math.sin(angle) * len };
    const bend = (rand() - 0.5) * len * 0.6;
    const path = new Path2D();
    path.moveTo(start.x, start.y);
    path.quadraticCurveTo(
      (start.x + end.x) / 2 - Math.sin(angle) * bend,
      (start.y + end.y) / 2 + Math.cos(angle) * bend,
      end.x,
      end.y
    );
    const rightward = Math.cos(angle) > 0.15;
    glow(ctx, path, rightward ? (rand() < 0.8 ? CYAN : GOLD_SOFT) : rand() < 0.75 ? GOLD_SOFT : TEAL, 0.5, alpha * 0.75);
    if (rand() < 0.35) dot(ctx, end.x, end.y, 1.4, "#eaffff", 0.8);
  }
}

function fan(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  from: Pt,
  count: number,
  box: { x0: number; x1: number; y0: number; y1: number },
  alpha: number,
  avoid: Pt[] = []
) {
  for (let i = 0; i < count; i += 1) {
    const end = { x: box.x0 + rand() * (box.x1 - box.x0), y: box.y0 + rand() * (box.y1 - box.y0) };
    if (avoid.some((p) => Math.abs(p.y - end.y) < 34 && end.x > p.x - 140)) continue;
    const a = Math.atan2(end.y - from.y, end.x - from.x);
    const path = cubicPath(
      { x: from.x + Math.cos(a) * 18, y: from.y + Math.sin(a) * 18 },
      { x: from.x + (end.x - from.x) * 0.25 + (rand() - 0.5) * 80, y: from.y + (rand() - 0.5) * 60 },
      { x: from.x + (end.x - from.x) * 0.7, y: end.y + (rand() - 0.5) * 70 },
      end
    );
    glow(ctx, path, rand() < 0.75 ? CYAN : GOLD_SOFT, 0.5, alpha * (0.6 + rand() * 0.6));
    dot(ctx, end.x, end.y, 1 + rand() * 1.4, "#bff6ff", 0.7);
  }
}

function beadedPath(ctx: CanvasRenderingContext2D, p0: Pt, c1: Pt, c2: Pt, p1: Pt) {
  const path = cubicPath(p0, c1, c2, p1);
  glow(ctx, path, GOLD, 2.6, 0.95);
  const steps = 14;
  for (let i = 1; i < steps; i += 1) {
    const p = cubicAt(p0, c1, c2, p1, i / steps);
    halo(ctx, p.x, p.y, 9, "rgba(255,200,80,1)", 0.55);
    dot(ctx, p.x, p.y, 2.8, "#fff1c4");
  }
}

function paintBigArc(ctx: CanvasRenderingContext2D, marker: Pt, booking: Pt | null) {
  const end = booking ?? { x: 1237, y: 558 };
  const segs: [Pt, Pt, Pt, Pt][] = [
    [marker, { x: 660, y: 250 }, { x: 650, y: 470 }, { x: 745, y: 600 }],
    [{ x: 745, y: 600 }, { x: 830, y: 710 }, { x: 1050, y: 770 }, { x: 1150, y: 720 }],
    [{ x: 1150, y: 720 }, { x: 1215, y: 690 }, { x: 1240, y: 620 }, end],
  ];
  for (const [offset, color, width, alpha] of [
    [0, GOLD, 1.8, 0.9],
    [-22, CYAN, 0.9, 0.5],
    [24, GOLD_SOFT, 0.8, 0.4],
  ] as const) {
    for (const [a, b, c, d] of segs) {
      const shift = (p: Pt) => ({ x: p.x + offset, y: p.y - offset * 0.3 });
      glow(ctx, cubicPath(offset ? shift(a) : a, shift(b), shift(c), offset ? shift(d) : d), color, width, alpha);
    }
  }
  for (const [a, b, c, d] of segs) {
    for (let i = 1; i < 8; i += 1) {
      const p = cubicAt(a, b, c, d, i / 8);
      halo(ctx, p.x, p.y, 8, "rgba(255,200,80,1)", 0.5);
      dot(ctx, p.x, p.y, 2.5, "#fff1c4");
    }
  }
}

function paintCone(ctx: CanvasRenderingContext2D, rand: () => number, hub: Pt | null) {
  const apex = MINI_EXIT;
  const end = hub ?? { x: 752, y: 408 };
  const strand = (t: number) => ({
    c1: { x: 560, y: apex.y + t * 34 },
    c2: { x: 690, y: end.y + t * 100 },
  });
  const upper = strand(-1);
  const lower = strand(1);
  const fill = ctx.createLinearGradient(apex.x, 0, end.x, 0);
  fill.addColorStop(0, "rgba(255,205,100,0.26)");
  fill.addColorStop(0.7, "rgba(255,190,70,0.12)");
  fill.addColorStop(1, "rgba(255,190,70,0.04)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(apex.x, apex.y);
  ctx.bezierCurveTo(upper.c1.x, upper.c1.y, upper.c2.x, upper.c2.y, end.x, end.y);
  ctx.bezierCurveTo(lower.c2.x, lower.c2.y, lower.c1.x, lower.c1.y, apex.x, apex.y);
  ctx.fill();
  const n = 26;
  for (let i = 0; i <= n; i += 1) {
    const t = (i / n) * 2 - 1;
    const { c1, c2 } = strand(t);
    const edge = i === 0 || i === n;
    glow(ctx, cubicPath(apex, c1, c2, end), GOLD_SOFT, edge ? 1.2 : 0.45, edge ? 0.8 : 0.25 + rand() * 0.15);
  }
}

function paintMiniAtlas(ctx: CanvasRenderingContext2D, rand: () => number) {
  const c = MINI_CENTER;
  halo(ctx, c.x, c.y, 90, "rgba(60,170,230,1)", 0.25);
  for (const [r, color, w, a, dash] of [
    [14, GOLD, 2, 0.9, undefined],
    [22, GOLD, 1.4, 0.7, undefined],
    [31, CYAN, 2.2, 0.85, undefined],
    [40, CYAN, 1.2, 0.6, [3, 4]],
    [50, GOLD_SOFT, 1.2, 0.55, undefined],
    [64, CYAN, 1, 0.4, undefined],
    [100, CYAN, 0.8, 0.2, [2, 6]],
    [160, CYAN, 0.8, 0.14, undefined],
  ] as const) {
    ring(ctx, c.x, c.y, r, color, w, a, dash ? [...dash] : undefined);
  }
  for (let i = 0; i < 24; i += 1) {
    const angle = (i / 24) * Math.PI * 2;
    const path = new Path2D();
    path.moveTo(c.x + Math.cos(angle) * 16, c.y + Math.sin(angle) * 16);
    path.lineTo(c.x + Math.cos(angle) * 60, c.y + Math.sin(angle) * 60);
    glow(ctx, path, i % 3 === 0 ? GOLD_SOFT : CYAN, 0.5, 0.35);
  }
  const all = [...MINI_DOMAINS.map((d) => ({ node: d.node, color: d.color })), ...MINI_DECOR];
  for (const item of all) {
    const path = new Path2D();
    path.moveTo(c.x, c.y);
    path.lineTo(item.node.x, item.node.y);
    glow(ctx, path, item.color, 0.8, 0.45);
    for (let i = 0; i < 14; i += 1) {
      const angle = rand() * Math.PI * 2;
      const len = 10 + rand() * 20;
      const ray = new Path2D();
      ray.moveTo(item.node.x, item.node.y);
      ray.lineTo(item.node.x + Math.cos(angle) * len, item.node.y + Math.sin(angle) * len);
      glow(ctx, ray, item.color, 0.5, 0.5);
    }
    halo(ctx, item.node.x, item.node.y, 16, item.color, 0.7);
    ring(ctx, item.node.x, item.node.y, 6, item.color, 1.6, 0.9);
    dot(ctx, item.node.x, item.node.y, 3.2, "#ffffff");
  }
  halo(ctx, c.x, c.y, 34, "rgba(255,200,80,1)", 0.9);
  dot(ctx, c.x, c.y, 9, "#fff2c4");
  halo(ctx, MINI_EXIT.x, MINI_EXIT.y, 42, "rgba(255,200,80,1)", 0.7);
  ring(ctx, MINI_EXIT.x, MINI_EXIT.y, 12, "#ffcf55", 2.2, 0.95);
  ring(ctx, MINI_EXIT.x, MINI_EXIT.y, 19, "#ffcf55", 1.2, 0.55);
  dot(ctx, MINI_EXIT.x, MINI_EXIT.y, 6, "#fff4d0");
}

const SPIKES = [0.25, 0.4, 0.3, 0.65, 0.35, 0.9, 0.5, 1, 0.55, 0.85, 0.4, 0.7, 0.3, 0.6, 0.3, 0.4, 0.2];

/** قرص الوكيل المشرف. level بين 0 و 1 من خرج الصوت الفعلي. */
export function paintSupervisorDisc(ctx: CanvasRenderingContext2D, size: number, level: number, phase: number) {
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  halo(ctx, c, c, c, "rgba(40,150,210,1)", 0.28);
  halo(ctx, c, c, 60, "rgba(255,190,70,1)", 0.22);
  const arcs: [number, string, number, number, number][] = [
    [27, GOLD, 1.6, 0, Math.PI * 2],
    [33, GOLD_SOFT, 0.8, 0, Math.PI * 2],
    [40, CYAN, 2, 0, Math.PI * 2],
    [45, CYAN, 0.8, 0, Math.PI * 2],
    [52, GOLD, 2.8, -2.6, -0.5],
    [52, GOLD, 2.8, 0.6, 2.5],
    [57, GOLD_SOFT, 0.8, 0, Math.PI * 2],
    [64, CYAN, 1.4, 0, Math.PI * 2],
    [76, GOLD_SOFT, 1.2, -2.9, -1.2],
    [76, GOLD_SOFT, 1.2, 0.2, 1.9],
    [82, CYAN, 0.7, 0, Math.PI * 2],
    [88, CYAN, 1.1, -1.2, 1.4],
    [88, CYAN, 1.1, 1.9, 4.5],
    [97, CYAN, 0.7, 0, Math.PI * 2],
  ];
  for (const [r, color, w, a0, a1] of arcs) {
    const path = new Path2D();
    path.arc(c, c, r, a0 + phase * (r % 2 ? 0.2 : -0.15), a1 + phase * (r % 2 ? 0.2 : -0.15));
    glow(ctx, path, color, w, 0.9);
  }
  ctx.save();
  ctx.setLineDash([2, 5]);
  ring(ctx, c, c, 69, GOLD_SOFT, 1, 0.6);
  ctx.restore();
  for (const [angle, r, color] of [
    [-2.2, 97, GOLD],
    [-0.4, 87, CYAN],
    [1.1, 97, GOLD],
    [2.7, 75, CYAN],
    [-1.4, 63, GOLD],
  ] as const) {
    halo(ctx, c + Math.cos(angle) * r, c + Math.sin(angle) * r, 8, color, 0.8);
    dot(ctx, c + Math.cos(angle) * r, c + Math.sin(angle) * r, 2.4, "#fffbe8");
  }
  ctx.globalCompositeOperation = "source-over";
  dot(ctx, c, c, 25, "#07121b", 0.92);
  ctx.globalCompositeOperation = "lighter";
  ring(ctx, c, c, 27, GOLD, 1.6, 0.95);
  for (const [dx, dy] of [
    [1, 0],
    [0, 1],
  ]) {
    const cross = new Path2D();
    cross.moveTo(c - dx * 70, c - dy * 70);
    cross.lineTo(c + dx * 70, c + dy * 70);
    glow(ctx, cross, GOLD_SOFT, 0.6, 0.3);
  }
  const bars = 17;
  const amp = 0.6 + level * 0.4;
  for (let i = 0; i < bars; i += 1) {
    const t = i / (bars - 1);
    const shape = Math.sin(t * Math.PI) * SPIKES[i % SPIKES.length] * (0.75 + 0.25 * Math.abs(Math.sin(i * 2.3 + phase * 3)));
    const h = 3 + shape * 30 * amp;
    const x = c - 18 + t * 36;
    ctx.strokeStyle = "#ffcf5e";
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x, c - h / 2);
    ctx.lineTo(x, c + h / 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}

/** نسخة الواجهة 03: موجة عريضة وشعاع ذهبي وأقواس متقطعة. */
export function paintSupervisorWave(ctx: CanvasRenderingContext2D, size: number, level: number, phase: number) {
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  halo(ctx, c, c, c, "rgba(40,150,210,1)", 0.22);
  const arc = (r: number, color: string, w: number, a: number, a0: number, a1: number) => {
    const path = new Path2D();
    path.arc(c, c, r, a0, a1);
    glow(ctx, path, color, w, a);
  };
  arc(100, CYAN, 1.2, 0.8, 0, Math.PI * 2);
  const segs: [number, number, string][] = [
    [-2.9, -2.0, GOLD], [-1.8, -1.2, CYAN], [-1.0, -0.15, GOLD], [0.05, 0.6, CYAN],
    [0.8, 1.7, GOLD], [1.9, 2.4, CYAN], [2.6, 3.2, GOLD],
  ];
  for (const [a0, a1, color] of segs) arc(90, color, 5.5, 0.9, a0 + phase * 0.2, a1 + phase * 0.2);
  arc(78, CYAN, 2.6, 0.95, 0, Math.PI * 2);
  ctx.save();
  ctx.setLineDash([3, 5]);
  ring(ctx, c, c, 69, CYAN, 1, 0.55);
  ctx.restore();
  for (const a of [-2.3, -0.5, 0.9, 2.5]) {
    halo(ctx, c + Math.cos(a) * 100, c + Math.sin(a) * 100, 8, GOLD, 0.8);
    dot(ctx, c + Math.cos(a) * 100, c + Math.sin(a) * 100, 2.4, "#fffbe8");
  }
  const bars = 31;
  const amp = 0.85 + level * 0.15;
  for (let i = 0; i < bars; i += 1) {
    const t = i / (bars - 1);
    const env = Math.pow(Math.sin(t * Math.PI), 0.8);
    const h = 5 + env * 70 * amp * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.9 + phase * 4)));
    const x = c - 72 + t * 144;
    ctx.strokeStyle = CYAN;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(x, c - h / 2);
    ctx.lineTo(x, c + h / 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  halo(ctx, c, c, 34, "rgba(255,160,40,1)", 0.95);
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2;
    const len = i % 2 ? 14 : 30;
    const path = new Path2D();
    path.moveTo(c, c);
    path.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
    glow(ctx, path, "#ffb43a", 1, 0.85);
  }
  dot(ctx, c, c, 3.2, "#fff2c8");
  ctx.restore();
}
