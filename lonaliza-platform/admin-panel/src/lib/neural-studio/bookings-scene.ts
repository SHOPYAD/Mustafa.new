import { cubicAt, cubicPath, dot, glow, halo, ring, rng, STAGE_H, STAGE_W, type Pt } from "./expansion-scene";
import { CORE, type BookingCluster, type ClusterTone } from "./bookings-graph";

export const TONE: Record<ClusterTone, { line: string; core: string; halo: string }> = {
  gold: { line: "#ff9f2a", core: "#ffd9a0", halo: "rgba(255,150,40,1)" },
  cyan: { line: "#35e3ff", core: "#d8fbff", halo: "rgba(53,227,255,1)" },
  magenta: { line: "#d65cff", core: "#f6dcff", halo: "rgba(214,92,255,1)" },
};

export interface BookingsSceneInput {
  clusters: BookingCluster[];
  selectedId: string | null;
  showItems: boolean;
}

export function bulletPoints(cluster: BookingCluster): Pt[] {
  return cluster.bullets.ys.map((y) => ({ x: cluster.bullets.x, y }));
}

export function paintBookingsScene(ctx: CanvasRenderingContext2D, input: BookingsSceneInput) {
  const rand = rng(3030303);
  const c = CORE.center;
  ctx.save();
  paintBackdrop(ctx, c, rand);


  const radial = input.clusters.filter((cl) => !cl.chain);
  const chain = input.clusters.filter((cl) => cl.chain);

  for (const cl of radial) {
    const tone = TONE[cl.tone];
    const a = Math.atan2(cl.hub.y - c.y, cl.hub.x - c.x);
    const from = { x: c.x + Math.cos(a) * 122, y: c.y + Math.sin(a) * 122 };
    for (const off of [-5, 0, 5]) {
      const nx = -Math.sin(a) * off;
      const ny = Math.cos(a) * off;
      const path = cubicPath(
        { x: from.x + nx, y: from.y + ny },
        { x: from.x + (cl.hub.x - from.x) * 0.4 + nx, y: from.y + (cl.hub.y - from.y) * 0.4 + ny },
        { x: from.x + (cl.hub.x - from.x) * 0.7 + nx * 0.4, y: from.y + (cl.hub.y - from.y) * 0.7 + ny * 0.4 },
        cl.hub
      );
      glow(ctx, path, tone.line, off === 0 ? 1.6 : 0.6, off === 0 ? 0.9 : 0.4);
    }
    for (let i = 1; i < 6; i += 1) {
      const t = i / 6;
      dot(ctx, from.x + (cl.hub.x - from.x) * t, from.y + (cl.hub.y - from.y) * t, 1.8, tone.core, 0.7);
    }
  }

  for (const cl of input.clusters) {
    if (cl.chain) continue;
    const tone = TONE[cl.tone];
    const selected = cl.id === input.selectedId;
    const burst = cl.tone === "magenta" ? 80 : 56;
    const outward = Math.atan2(cl.hub.y - c.y, cl.hub.x - c.x);
    for (let i = 0; i < burst; i += 1) {
      const angle = cl.tone === "magenta" ? outward + Math.PI + (rand() - 0.5) * 4.4 : outward + (rand() - 0.5) * (rand() < 0.8 ? 2.2 : 6.2);
      const len = (cl.chain ? 18 : 34) + rand() * (cl.chain ? 26 : 80);
      const end = { x: cl.hub.x + Math.cos(angle) * len, y: cl.hub.y + Math.sin(angle) * len };
      const bend = (rand() - 0.5) * len * 0.6;
      const path = new Path2D();
      path.moveTo(cl.hub.x + Math.cos(angle) * 8, cl.hub.y + Math.sin(angle) * 8);
      path.quadraticCurveTo(
        (cl.hub.x + end.x) / 2 - Math.sin(angle) * bend,
        (cl.hub.y + end.y) / 2 + Math.cos(angle) * bend,
        end.x,
        end.y
      );
      glow(ctx, path, tone.line, 0.5, selected ? 0.55 : 0.38);
      if (rand() < 0.3) dot(ctx, end.x, end.y, 1.3, tone.core, 0.8);
    }
    if (input.showItems) {
      for (const b of bulletPoints(cl)) {
        for (let s = 0; s < 3; s += 1) {
          const off = (s - 1) * 6;
          const dir = cl.textSide === "left" ? 1 : -1;
          const path = cubicPath(
            cl.hub,
            { x: cl.hub.x + (b.x - cl.hub.x) * 0.3, y: cl.hub.y + (b.y - cl.hub.y) * 0.3 + off },
            { x: b.x + dir * 40, y: b.y + off * 0.4 },
            b
          );
          glow(ctx, path, tone.line, s === 1 ? 0.9 : 0.45, s === 1 ? 0.6 : 0.3);
        }
      }
    }
  }

  if (chain.length) paintCancelChain(ctx, input.clusters);

  for (const cl of input.clusters) {
    const tone = TONE[cl.tone];
    const selected = cl.id === input.selectedId;
    const big = !cl.chain;
    halo(ctx, cl.hub.x, cl.hub.y, big ? (selected ? 62 : 46) : 30, tone.halo, selected ? 0.7 : 0.55);
    ring(ctx, cl.hub.x, cl.hub.y, big ? 11 : 9, tone.line, 2.2, 0.95);
    dot(ctx, cl.hub.x, cl.hub.y, big ? 7 : 6, tone.core);
    dot(ctx, cl.hub.x, cl.hub.y, big ? 3.5 : 3, "#ffffff");
    if (input.showItems) {
      for (const b of bulletPoints(cl)) {
        halo(ctx, b.x, b.y, 14, tone.halo, 0.35);
        ring(ctx, b.x, b.y, 7, cl.tone === "magenta" ? "#f0d6ff" : tone.line, 1.8, 0.95);
        dot(ctx, b.x, b.y, 4, cl.tone === "magenta" ? "#e9c4ff" : tone.core, 0.95);
      }
    }
  }

  paintCore(ctx, c, rand);
  ctx.restore();
}

function paintCancelChain(ctx: CanvasRenderingContext2D, clusters: BookingCluster[]) {
  const byId = new Map(clusters.map((cl) => [cl.id, cl]));
  const cancel = byId.get("cancel");
  const policy = byId.get("policy");
  const refund = byId.get("refund");
  const verify = byId.get("verify");
  const track = byId.get("track");
  const tone = TONE.magenta;
  const titleNode = { x: 395, y: 420 };
  const bend = { x: 231, y: 460 };
  const aux1 = { x: 255, y: 526 };
  const aux2 = { x: 312, y: 608 };
  const segs: [Pt, Pt, Pt, Pt][] = [];
  if (cancel) segs.push([cancel.hub, { x: 440, y: 440 }, { x: 420, y: 424 }, titleNode]);
  if (cancel && policy) {
    segs.push([titleNode, { x: 392, y: 356 }, { x: 240, y: 352 }, bend]);
    segs.push([bend, { x: 190, y: 490 }, { x: 115, y: 500 }, policy.hub]);
    segs.push([bend, { x: 245, y: 480 }, { x: 255, y: 505 }, aux1]);
  }
  if (cancel && refund) segs.push([cancel.hub, { x: 450, y: 545 }, { x: 350, y: 590 }, aux2]);
  if (policy && refund) segs.push([policy.hub, { x: 82, y: 575 }, { x: 100, y: 597 }, refund.hub]);
  if (refund && verify) segs.push([refund.hub, { x: 135, y: 645 }, { x: 150, y: 668 }, verify.hub]);
  if (verify && track) segs.push([verify.hub, { x: 185, y: 720 }, { x: 200, y: 745 }, track.hub]);
  if (track) segs.push([track.hub, { x: 228, y: 790 }, { x: 236, y: 808 }, { x: 244, y: 836 }]);
  if (verify) segs.push([aux2, { x: 335, y: 640 }, { x: 350, y: 675 }, { x: 350, y: 708 }]);
  if (track) segs.push([{ x: 350, y: 732 }, { x: 358, y: 755 }, { x: 363, y: 775 }, { x: 366, y: 797 }]);
  for (const [a, b, cc, d] of segs) {
    glow(ctx, cubicPath(a, b, cc, d), tone.line, 1.5, 0.9);
    for (let i = 1; i < 5; i += 1) {
      const p = cubicAt(a, b, cc, d, i / 5);
      halo(ctx, p.x, p.y, 6, tone.halo, 0.45);
      dot(ctx, p.x, p.y, 1.8, "#f6dcff");
    }
  }
  const nodes: [Pt, string][] = [
    [titleNode, tone.line],
    [aux1, tone.line],
    [aux2, tone.line],
  ];
  if (cancel && policy) nodes.push([bend, "#ffcf8a"]);
  for (const [p, color] of nodes) {
    halo(ctx, p.x, p.y, 18, color === tone.line ? tone.halo : "rgba(255,200,120,1)", 0.6);
    ring(ctx, p.x, p.y, 7, color, 2, 0.95);
    dot(ctx, p.x, p.y, 4, "#fbeaff");
  }
}

export function paintCore(ctx: CanvasRenderingContext2D, c: Pt, rand: () => number) {
  for (let i = 0; i < 56; i += 1) {
    const a = (i / 56) * Math.PI * 2;
    const r1 = 210 + rand() * 110;
    const path = new Path2D();
    path.moveTo(c.x + Math.cos(a) * 126, c.y + Math.sin(a) * 126);
    path.lineTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1);
    glow(ctx, path, i % 6 === 0 ? "#ffae2e" : "#35d8ff", 0.7, 0.42);
    for (const rr of [150, 188, 232]) {
      if (rr < r1 && rand() < 0.45) dot(ctx, c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, 1.6, i % 6 === 0 ? "#ffd27a" : "#c8f7ff", 0.9);
    }
  }
  ring(ctx, c.x, c.y, 150, "#35d8ff", 0.9, 0.4);
  ring(ctx, c.x, c.y, 188, "#35d8ff", 0.8, 0.3);
  ring(ctx, c.x, c.y, 232, "#35d8ff", 0.7, 0.22);
  halo(ctx, c.x, c.y, 160, "rgba(40,190,255,1)", 0.28);

  for (let i = 0; i < 24; i += 1) {
    const a = (i / 24) * Math.PI * 2 + 0.07;
    const path = new Path2D();
    path.moveTo(c.x + Math.cos(a) * 24, c.y + Math.sin(a) * 24);
    path.lineTo(c.x + Math.cos(a) * 126, c.y + Math.sin(a) * 126);
    glow(ctx, path, "#35d8ff", 0.5, 0.22);
  }
  ctx.globalCompositeOperation = "source-over";
  const inner = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 60);
  inner.addColorStop(0, "rgba(4,14,22,0.55)");
  inner.addColorStop(1, "rgba(4,14,22,0.2)");
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 60, 0, Math.PI * 2);
  ctx.fill();

  const solid = (r: number, glowColor: string, core: string, hi: string, w: number, spread: number) => {
    ctx.globalCompositeOperation = "lighter";
    const path = new Path2D();
    path.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = glowColor;
    for (const [mul, a] of [[spread * 2.6, 0.1], [spread * 1.6, 0.18], [spread * 0.9, 0.3]] as const) {
      ctx.globalAlpha = a;
      ctx.lineWidth = w * mul;
      ctx.stroke(path);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = core;
    ctx.lineWidth = w;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hi;
    ctx.lineWidth = Math.max(1, w * 0.35);
    ctx.stroke(path);
  };
  solid(56, "#ffa030", "#d9801c", "#ffc868", 1.6, 3);
  solid(64, "#22c8ff", "#1cc0f4", "#c4f9ff", 5, 3);
  solid(84, "#ff9020", "#ff9a22", "#ffd476", 11, 3);
  solid(101, "#22c8ff", "#1cc0f4", "#c4f9ff", 5.2, 3);
  ctx.globalCompositeOperation = "lighter";
  for (const [r, a] of [[108, 0.55], [113, 0.35], [121, 0.45]] as const) ring(ctx, c.x, c.y, r, "#48dcff", 1, a);
  ring(ctx, c.x, c.y, 116, "#ffb04a", 0.9, 0.35);
  ctx.globalCompositeOperation = "lighter";
  ring(ctx, c.x, c.y, 127, "#6fe8ff", 1.2, 0.55, [2, 5]);
  for (let i = 0; i < 14; i += 1) {
    const a = rand() * Math.PI * 2;
    const r = [86, 101, 66][i % 3];
    halo(ctx, c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, 7, i % 3 === 0 ? "rgba(255,200,90,1)" : "rgba(120,240,255,1)", 0.8);
  }
  ctx.globalAlpha = 1;
}

/** الخلفية المشتركة لواجهات المجال: سماء، نجوم، حلقات، شبكة. */
export function paintBackdrop(ctx: CanvasRenderingContext2D, c: Pt, rand: () => number) {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#01060c";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const sky = ctx.createRadialGradient(c.x, c.y, 40, c.x, c.y, 900);
  sky.addColorStop(0, "#082029");
  sky.addColorStop(0.45, "#030f15");
  sky.addColorStop(1, "#010508");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  for (let i = 0; i < 1600; i += 1) {
    const x = rand() * STAGE_W;
    const y = rand() * STAGE_H;
    const pick = rand();
    const color = pick < 0.66 ? "#cfefff" : pick < 0.86 ? "#ffc46a" : pick < 0.95 ? "#35e3ff" : "#c98cff";
    const big = rand() < 0.07;
    const r = big ? 1.3 + rand() * 1.6 : 0.35 + rand() * 0.9;
    if (big) halo(ctx, x, y, r * 6, color, 0.25);
    dot(ctx, x, y, r, color, 0.35 + rand() * 0.6);
  }

  for (const [radius, alpha] of [
    [180, 0.1],
    [300, 0.13],
    [420, 0.11],
    [560, 0.09],
    [720, 0.07],
  ] as const) {
    ring(ctx, c.x, c.y, radius, "#3ab7dc", 1, alpha * 1.6);
  }
  ring(ctx, c.x, c.y, 250, "#3ab7dc", 0.8, 0.12, [2, 7]);

  const web: Pt[] = [];
  for (let i = 0; i < 430; i += 1) web.push({ x: rand() * 1340, y: 70 + rand() * 780 });
  for (const a of web) {
    const near = web
      .filter((b) => b !== a)
      .map((b) => ({ b, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 3);
    for (const { b } of near) {
      const path = new Path2D();
      path.moveTo(a.x, a.y);
      path.quadraticCurveTo((a.x + b.x) / 2 + (rand() - 0.5) * 30, (a.y + b.y) / 2 + (rand() - 0.5) * 30, b.x, b.y);
      ctx.strokeStyle = "#4cc6ea";
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = 0.8;
      ctx.stroke(path);
    }
    const gold = rand() < 0.3;
    if (gold) {
      halo(ctx, a.x, a.y, rand() < 0.3 ? 22 : 13, "rgba(255,150,40,1)", 0.6);
    } else halo(ctx, a.x, a.y, 7, "rgba(80,220,255,1)", 0.35);
    dot(ctx, a.x, a.y, gold ? 2.6 : 1.5, gold ? "#ffd08a" : "#b8f2ff", 0.85);
  }
  ctx.globalAlpha = 1;
}
