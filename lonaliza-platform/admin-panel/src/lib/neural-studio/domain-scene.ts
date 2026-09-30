import { cubicPath, dot, glow, halo, ring, rng, type Pt } from "./expansion-scene";
import { paintBackdrop, paintCore } from "./bookings-scene";
import { DOMAIN_CORE, HUB_R, type HubLayout } from "./domain-layout";
import type { DomainTone } from "./domain-systems";

export const DOMAIN_TONE: Record<DomainTone, { line: string; core: string; halo: string; title: string }> = {
  gold: { line: "#ff9f2a", core: "#ffd9a0", halo: "rgba(255,150,40,1)", title: "#ffbf4d" },
  cyan: { line: "#35e3ff", core: "#d8fbff", halo: "rgba(53,227,255,1)", title: "#4fe6ff" },
  magenta: { line: "#d65cff", core: "#f6dcff", halo: "rgba(214,92,255,1)", title: "#e27cff" },
  green: { line: "#3cf0a8", core: "#cbffe8", halo: "rgba(60,240,168,1)", title: "#5cf5b8" },
};

export interface DomainSceneInput {
  layout: HubLayout[];
  selectedId: string | null;
  showItems: boolean;
  showHubs: boolean;
  seed: number;
}

export function paintDomainScene(ctx: CanvasRenderingContext2D, input: DomainSceneInput) {
  const rand = rng(input.seed);
  const c = DOMAIN_CORE;
  ctx.save();
  paintBackdrop(ctx, c, rand);

  if (input.showHubs) {
    for (const l of input.layout) {
      const tone = DOMAIN_TONE[l.hub.tone];
      const selected = l.hub.id === input.selectedId;
      const a = Math.atan2(l.at.y - c.y, l.at.x - c.x);
      const from = { x: c.x + Math.cos(a) * 122, y: c.y + Math.sin(a) * 122 };
      const to = { x: l.at.x - Math.cos(a) * HUB_R, y: l.at.y - Math.sin(a) * HUB_R };
      for (const off of [-6, 0, 6]) {
        const n = { x: -Math.sin(a) * off, y: Math.cos(a) * off };
        const mid = { x: (from.x + to.x) / 2 + n.x * 3, y: (from.y + to.y) / 2 + n.y * 3 };
        const path = new Path2D();
        path.moveTo(from.x + n.x, from.y + n.y);
        path.quadraticCurveTo(mid.x, mid.y, to.x, to.y);
        glow(ctx, path, tone.line, off === 0 ? 1.6 : 0.8, off === 0 ? (selected ? 1 : 0.85) : 0.45);
      }
      for (let i = 1; i < 6; i += 1) {
        const t = i / 6;
        dot(ctx, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, 1.8, tone.core, 0.7);
      }

      const outward = a;
      const burst = selected ? 70 : 52;
      for (let i = 0; i < burst; i += 1) {
        const angle = outward + (rand() - 0.5) * (rand() < 0.8 ? 2.4 : 6.2);
        const len = 34 + rand() * 78;
        const end = { x: l.at.x + Math.cos(angle) * len, y: l.at.y + Math.sin(angle) * len };
        const bend = (rand() - 0.5) * len * 0.6;
        const path = new Path2D();
        path.moveTo(l.at.x + Math.cos(angle) * HUB_R, l.at.y + Math.sin(angle) * HUB_R);
        path.quadraticCurveTo(
          (l.at.x + end.x) / 2 - Math.sin(angle) * bend,
          (l.at.y + end.y) / 2 + Math.cos(angle) * bend,
          end.x,
          end.y
        );
        glow(ctx, path, tone.line, 0.5, selected ? 0.55 : 0.36);
        if (rand() < 0.3) dot(ctx, end.x, end.y, 1.3, tone.core, 0.8);
      }

      if (input.showItems) {
        const dir = l.side === "left" ? -1 : 1;
        for (const b of l.bullets) {
          for (let s = 0; s < 3; s += 1) {
            const off = (s - 1) * 5;
            const path = cubicPath(
              { x: l.at.x + dir * HUB_R, y: l.at.y },
              { x: l.at.x + dir * (HUB_R + 12), y: l.at.y + off },
              { x: b.x - dir * 16, y: b.y + off * 0.4 },
              b
            );
            glow(ctx, path, tone.line, s === 1 ? 0.9 : 0.45, s === 1 ? 0.6 : 0.3);
          }
        }
      }
    }
  }

  paintCore(ctx, c, rand);

  if (input.showHubs) {
    for (const l of input.layout) {
      const tone = DOMAIN_TONE[l.hub.tone];
      const selected = l.hub.id === input.selectedId;
      paintHubDisc(ctx, l.at, tone, selected);
      if (input.showItems) {
        for (const b of l.bullets) {
          halo(ctx, b.x, b.y, 14, tone.halo, 0.35);
          ring(ctx, b.x, b.y, 6.5, tone.line, 1.8, 0.95);
          dot(ctx, b.x, b.y, 3.6, tone.core, 0.95);
        }
      }
    }
  }
  ctx.restore();
}

function paintHubDisc(ctx: CanvasRenderingContext2D, p: Pt, tone: (typeof DOMAIN_TONE)[DomainTone], selected: boolean) {
  halo(ctx, p.x, p.y, selected ? 78 : 60, tone.halo, selected ? 0.55 : 0.4);
  ctx.globalCompositeOperation = "source-over";
  const fill = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, HUB_R);
  fill.addColorStop(0, "rgba(6,22,34,0.96)");
  fill.addColorStop(1, "rgba(3,12,20,0.96)");
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(p.x, p.y, HUB_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  const path = new Path2D();
  path.arc(p.x, p.y, HUB_R, 0, Math.PI * 2);
  glow(ctx, path, tone.line, selected ? 3.2 : 2.4, 1);
  ring(ctx, p.x, p.y, HUB_R + 7, tone.line, 1, selected ? 0.7 : 0.4, [2, 4]);
}
