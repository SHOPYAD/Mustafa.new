import { cubicAt, dot, glow, halo, ring, rng } from "@/lib/neural-studio/expansion-scene";
import { toScreen, type Camera, type Pt } from "../camera";
import type { MapLayout } from "../layout/radial";
import { TONES } from "../tokens";
import { useAgentStore } from "../agent/agent-store";
import { paintAgentCore } from "./agent-core";
import { fastHalo } from "./sprites";

export interface SceneState {
  layout: MapLayout;
  camera: Camera;
  viewport: { w: number; h: number };
  dpr: number;
  selectedId: string | null;
  hoverId: string | null;
  seed: number;
  /** 0..1 شفافية الخريطة أثناء الانتقال. */
  opacity: number;
  /** أثناء حركة الكاميرا تُحوَّل صورة الخريطة المخزنة بدل إعادة رسمها. */
  animating: boolean;
  /** مركز توهج الخلفية على الشاشة (ثابت لكل مقاس). */
  bgCenter: Pt;
}

interface Nerve {
  hubId: string;
  tone: keyof typeof TONES;
  /** نقاط عيّنة متساوية المسافة (arc-length) بوحدات العالم. */
  samples: Pt[];
}

const SAMPLES = 40;

function resampleCubic(p0: Pt, c1: Pt, c2: Pt, p1: Pt): Pt[] {
  const raw: Pt[] = [];
  for (let i = 0; i <= 120; i += 1) raw.push(cubicAt(p0, c1, c2, p1, i / 120));
  const acc = [0];
  for (let i = 1; i < raw.length; i += 1) acc.push(acc[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y));
  const total = acc[acc.length - 1] || 1;
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k <= SAMPLES; k += 1) {
    const target = (k / SAMPLES) * total;
    while (j < acc.length - 2 && acc[j + 1] < target) j += 1;
    const span = acc[j + 1] - acc[j] || 1;
    const u = (target - acc[j]) / span;
    out.push({ x: raw[j].x + (raw[j + 1].x - raw[j].x) * u, y: raw[j].y + (raw[j + 1].y - raw[j].y) * u });
  }
  return out;
}

function linkNerve(hubId: string, tone: keyof typeof TONES, from: Pt, to: Pt, r0: number, r1: number): Nerve {
  const a = Math.atan2(to.y - from.y, to.x - from.x);
  const p0 = { x: from.x + Math.cos(a) * r0, y: from.y + Math.sin(a) * r0 };
  const p1 = { x: to.x - Math.cos(a) * r1, y: to.y - Math.sin(a) * r1 };
  const dx = p1.x - p0.x;
  return { hubId, tone, samples: resampleCubic(p0, { x: p0.x + dx * 0.45, y: p0.y }, { x: p1.x - dx * 0.45, y: p1.y }, p1) };
}

function nervesFor(layout: MapLayout): Nerve[] {
  if (layout.links) {
    const tone = (id: string) => layout.hubs.find((h) => h.node.id === id)?.node.tone ?? layout.root?.node.tone ?? "cyan";
    const radius = (p: Pt) => (p === layout.center ? layout.coreR * 0.86 : layout.root && p === layout.root.at ? layout.root.r : layout.presence && p === layout.presence.at ? layout.presence.r * 0.55 : layout.hubR);
    return layout.links.map((l) => linkNerve(l.hubId, tone(l.hubId), l.from, l.to, radius(l.from), radius(l.to)));
  }
  const c = layout.center;
  return layout.hubs.map((h) => {
    const a = Math.atan2(h.at.y - c.y, h.at.x - c.x);
    const from = { x: c.x + Math.cos(a) * (layout.coreR * 0.86), y: c.y + Math.sin(a) * (layout.coreR * 0.86) };
    const to = { x: h.at.x - Math.cos(a) * layout.hubR, y: h.at.y - Math.sin(a) * layout.hubR };
    const bend = 0.18;
    const n = { x: -Math.sin(a), y: Math.cos(a) };
    const d = Math.hypot(to.x - from.x, to.y - from.y);
    const c1 = { x: from.x + (to.x - from.x) * 0.33 + n.x * d * bend, y: from.y + (to.y - from.y) * 0.33 + n.y * d * bend };
    const c2 = { x: from.x + (to.x - from.x) * 0.7 - n.x * d * bend * 0.4, y: from.y + (to.y - from.y) * 0.7 - n.y * d * bend * 0.4 };
    return { hubId: h.node.id, tone: h.node.tone, samples: resampleCubic(from, c1, c2, to) };
  });
}

function polyline(ctx: CanvasRenderingContext2D, pts: Pt[], cam: Camera) {
  const p = new Path2D();
  pts.forEach((q, i) => {
    const s = toScreen(cam, q);
    if (i === 0) p.moveTo(s.x, s.y);
    else p.lineTo(s.x, s.y);
  });
  return p;
}

/** موضع قمر الوكيل رقم i حول القرص (مشترك بين الرسم والنصوص). */
export function satellitePos(L: MapLayout, i: number, n: number): Pt {
  // القوس العلوي فقط: أسفل القرص محجوز لعنوان الوكيل وشارة الخلية.
  const a = -Math.PI + ((i + 1) / (Math.max(1, n) + 1)) * Math.PI;
  const r = L.coreR * 1.02;
  return { x: L.center.x + Math.cos(a) * r, y: L.center.y + Math.sin(a) * r };
}

function hexToRgba(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},1)` : "rgba(80,220,255,1)";
}

export class NeuralRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cache: HTMLCanvasElement;
  private bg: HTMLCanvasElement;
  private comp: HTMLCanvasElement;
  private compDirty = true;
  private skip = false;
  private workEma = 0;
  private webPts: Pt[] = [];
  private webEdges: [number, number][] = [];
  private sparks: { e: number; o: number; v: number }[] = [];
  private pointer: Pt | null = null;
  private ripples: { x: number; y: number; t0: number }[] = [];
  private now = 0;
  private scene: SceneState | null = null;
  private nerves: Nerve[] = [];
  private dirty = true;
  private bgDirty = true;
  private cacheCam: Camera = { x: 0, y: 0, k: 1 };
  private raf = 0;
  private t0 = performance.now();
  private reduced = false;
  frameMs = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.cache = document.createElement("canvas");
    this.bg = document.createElement("canvas");
    this.comp = document.createElement("canvas");
    this.reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }

  setScene(next: SceneState) {
    const prev = this.scene;
    if (!prev || prev.layout !== next.layout) this.nerves = nervesFor(next.layout);
    const viewportChanged = !prev || prev.viewport.w !== next.viewport.w || prev.viewport.h !== next.viewport.h || prev.dpr !== next.dpr;
    if (viewportChanged || !prev || prev.seed !== next.seed || prev.bgCenter.x !== next.bgCenter.x || prev.bgCenter.y !== next.bgCenter.y) this.bgDirty = true;
    const camChanged = !prev || prev.camera.k !== next.camera.k || prev.camera.x !== next.camera.x || prev.camera.y !== next.camera.y;
    if (viewportChanged || !prev || prev.layout !== next.layout || prev.selectedId !== next.selectedId || (camChanged && !next.animating) || (prev.animating && !next.animating))
      this.dirty = true;
    this.scene = next;
  }

  /** موضع المؤشر على الشاشة (للخلفية التفاعلية). */
  setPointer(p: Pt | null) {
    this.pointer = p;
  }

  /** موجة تنتشر في الشبكة الخلفية من نقطة النقر. */
  ripple(x: number, y: number) {
    this.ripples.push({ x, y, t0: this.now });
    if (this.ripples.length > 6) this.ripples.shift();
  }

  start() {
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      // 60fps عادةً؛ 30fps عند prefers-reduced-motion أو إذا تجاوز زمن الرسم 14ms.
      const throttle = this.reduced || this.workEma > 14;
      this.skip = throttle ? !this.skip : false;
      if (this.skip) return;
      const start = performance.now();
      this.frame((now - this.t0) / 1000);
      this.frameMs = performance.now() - start;
      performance.measure("studio-frame", { start, duration: this.frameMs });
      this.workEma = this.workEma * 0.9 + this.frameMs * 0.1;
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  /** رسم إطار واحد فورًا (للاختبار واللقطات). */
  frame(t: number) {
    const s = this.scene;
    if (!s) return;
    const W = Math.round(s.viewport.w * s.dpr);
    const H = Math.round(s.viewport.h * s.dpr);
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
      this.dirty = true;
      this.bgDirty = true;
    }
    if (this.bgDirty) {
      this.bg.width = W;
      this.bg.height = H;
      const bctx = this.bg.getContext("2d") as CanvasRenderingContext2D;
      bctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      this.paintBackdrop(bctx, s);
      this.bgDirty = false;
      this.compDirty = true;
    }
    if (this.dirty) {
      this.cache.width = W;
      this.cache.height = H;
      const cctx = this.cache.getContext("2d") as CanvasRenderingContext2D;
      cctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      cctx.clearRect(0, 0, s.viewport.w, s.viewport.h);
      this.paintStatic(cctx, s);
      this.cacheCam = s.camera;
      this.dirty = false;
      this.compDirty = true;
    }
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    const still = !s.animating && s.opacity >= 1 && this.cacheCam === s.camera;
    if (still) {
      if (this.compDirty) {
        this.comp.width = W;
        this.comp.height = H;
        const k2 = this.comp.getContext("2d") as CanvasRenderingContext2D;
        k2.drawImage(this.bg, 0, 0);
        k2.drawImage(this.cache, 0, 0);
        this.compDirty = false;
      }
      ctx.drawImage(this.comp, 0, 0);
    } else {
      ctx.drawImage(this.bg, 0, 0);
      const r = s.camera.k / this.cacheCam.k;
      ctx.globalAlpha = s.opacity;
      ctx.setTransform(r, 0, 0, r, (s.camera.x - this.cacheCam.x * r) * s.dpr, (s.camera.y - this.cacheCam.y * r) * s.dpr);
      ctx.drawImage(this.cache, 0, 0);
      ctx.globalAlpha = 1;
    }
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    this.paintLive(ctx, s, this.reduced ? 0 : t);
  }

  private paintBackdrop(ctx: CanvasRenderingContext2D, s: SceneState) {
    const { w, h } = s.viewport;
    const cam = s.camera;
    const rand = rng(s.seed);
    const c = s.bgCenter;
    const k = cam.k;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#01060c";
    ctx.fillRect(0, 0, w, h);
    const sky = ctx.createRadialGradient(c.x, c.y, 40 * k, c.x, c.y, Math.max(w, h) * 0.75);
    sky.addColorStop(0, "#082029");
    sky.addColorStop(0.45, "#030f15");
    sky.addColorStop(1, "#010508");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    const stars = Math.round((w * h) / 900);
    for (let i = 0; i < stars; i += 1) {
      const x = rand() * w;
      const y = rand() * h;
      const pick = rand();
      const color = pick < 0.66 ? "#cfefff" : pick < 0.86 ? "#ffc46a" : pick < 0.95 ? "#35e3ff" : "#c98cff";
      const big = rand() < 0.06;
      const r = big ? 1.2 + rand() * 1.5 : 0.35 + rand() * 0.85;
      if (big) halo(ctx, x, y, r * 6, color, 0.22);
      dot(ctx, x, y, r, color, 0.3 + rand() * 0.6);
    }

    // شبكة عصبية خلفية تغطي كامل الشاشة
    const web: Pt[] = [];
    const count = Math.round((w * h) / 2700);
    for (let i = 0; i < count; i += 1) web.push({ x: rand() * w, y: rand() * h });
    this.webPts = web;
    this.webEdges = [];
    for (const [ai, a] of web.entries()) {
      const near = web
        .map((b, bi) => ({ b, bi, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
        .filter((x) => x.b !== a)
        .sort((p, q) => p.d - q.d)
        .slice(0, 4);
      for (const { bi } of near) if (ai < bi) this.webEdges.push([ai, bi]);
      for (const { b } of near) {
        ctx.strokeStyle = "#4cc6ea";
        ctx.globalAlpha = 0.24;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo((a.x + b.x) / 2 + (rand() - 0.5) * 24, (a.y + b.y) / 2 + (rand() - 0.5) * 24, b.x, b.y);
        ctx.stroke();
      }
      const gold = rand() < 0.28;
      if (gold) halo(ctx, a.x, a.y, rand() < 0.3 ? 18 : 11, "rgba(255,150,40,1)", 0.5);
      else halo(ctx, a.x, a.y, 6, "rgba(80,220,255,1)", 0.3);
      dot(ctx, a.x, a.y, gold ? 2.3 : 1.4, gold ? "#ffd08a" : "#b8f2ff", 0.8);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    const vig = ctx.createRadialGradient(c.x, c.y, Math.min(w, h) * 0.35, c.x, c.y, Math.max(w, h) * 0.7);
    vig.addColorStop(0, "rgba(1,5,9,0)");
    vig.addColorStop(1, "rgba(1,5,9,0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  private paintStatic(ctx: CanvasRenderingContext2D, s: SceneState) {
    const cam = s.camera;
    const rand = rng(s.seed + 7);
    const c = toScreen(cam, s.layout.center);
    const k = cam.k;
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    // الشبكة القطبية حول الوكيل
    if (s.layout.kind === "radial") {
      ctx.globalCompositeOperation = "source-over";
      const disc = ctx.createRadialGradient(c.x, c.y, 120 * k, c.x, c.y, 390 * k);
      disc.addColorStop(0, "rgba(40,90,90,0.10)");
      disc.addColorStop(0.7, "rgba(20,60,70,0.05)");
      disc.addColorStop(1, "rgba(5,30,45,0)");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 390 * k, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      for (const rr of [185, 245, 305, 365]) ring(ctx, c.x, c.y, rr * k, "#7fe9ff", 1.1, 0.3, [1.6, 5]);
    }
    for (const rr of [150, 170, 200, 225, 260, 290, 330, 370, 420, 460]) ring(ctx, c.x, c.y, rr * k, rr % 3 === 0 ? "#ffae2e" : "#3ab7dc", 0.9, rr < 300 ? 0.34 : 0.18);
    for (let i = 0; i < 72; i += 1) {
      const a = (i / 72) * Math.PI * 2;
      const r1 = (140 + rand() * 60) * k;
      const r2 = (260 + rand() * 220) * k;
      const p = new Path2D();
      p.moveTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1);
      p.lineTo(c.x + Math.cos(a) * r2, c.y + Math.sin(a) * r2);
      glow(ctx, p, i % 6 === 0 ? "#ffae2e" : "#35d8ff", 0.6, 0.36);
      for (const rr of [170, 225, 290]) if (rand() < 0.4 && rr * k < r2) dot(ctx, c.x + Math.cos(a) * rr * k, c.y + Math.sin(a) * rr * k, 1.4, i % 6 === 0 ? "#ffd27a" : "#c8f7ff", 0.85);
    }

    const L = s.layout;
    const disc = L.hubR > 15;
    for (let i = 0; i < L.hubs.length; i += 1) {
      const hub = L.hubs[i];
      const tone = TONES[hub.node.tone];
      const nerve = this.nerves.find((nv) => nv.hubId === hub.node.id) ?? this.nerves[i];
      const sel = hub.node.id === s.selectedId;
      glow(ctx, polyline(ctx, nerve.samples, cam), tone.line, 1.6, sel ? 1 : 0.9);
      for (let strand = 0; strand < 4; strand += 1) {
        const amp = 3 + strand * 2.6;
        const ph = strand * 1.7 + i;
        const off = nerve.samples.map((q, j) => {
          const env = Math.sin((j / SAMPLES) * Math.PI);
          return { x: q.x + Math.sin(j * 0.33 + ph) * amp * env, y: q.y + Math.cos(j * 0.29 + ph) * amp * env };
        });
        glow(ctx, polyline(ctx, off, cam), strand % 2 ? "#35d8ff" : tone.line, 0.6, 0.32);
      }
      for (let j = 5; j < SAMPLES; j += 7) {
        const q = toScreen(cam, nerve.samples[j]);
        dot(ctx, q.x, q.y, 1.7, tone.core, 0.75);
      }
      if (L.kind === "radial") {
        for (let br = 0; br < 12; br += 1) {
          const j = 4 + Math.floor(rand() * (SAMPLES - 10));
          const q = nerve.samples[j];
          const nx = nerve.samples[j + 1].x - q.x;
          const ny = nerve.samples[j + 1].y - q.y;
          const len = Math.hypot(nx, ny) || 1;
          const side = rand() < 0.5 ? -1 : 1;
          const bl = 18 + rand() * 46;
          const end = { x: q.x + (-ny / len) * bl * side + (nx / len) * bl * 0.6, y: q.y + (nx / len) * bl * side + (ny / len) * bl * 0.6 };
          const a0 = toScreen(cam, q);
          const a1 = toScreen(cam, end);
          const p = new Path2D();
          p.moveTo(a0.x, a0.y);
          p.quadraticCurveTo((a0.x + a1.x) / 2 + (rand() - 0.5) * 10 * k, (a0.y + a1.y) / 2 + (rand() - 0.5) * 10 * k, a1.x, a1.y);
          glow(ctx, p, br % 3 === 0 ? "#35d8ff" : tone.line, 0.55, 0.4);
          dot(ctx, a1.x, a1.y, 1.3, tone.core, 0.8);
        }
      }

      const at = toScreen(cam, hub.at);
      const boxC = { x: hub.box.x + hub.box.w / 2, y: hub.box.y + hub.box.h / 2 };
      const outward = disc ? Math.atan2(hub.at.y - L.center.y, hub.at.x - L.center.x) : Math.atan2(hub.at.y - boxC.y, hub.at.x - boxC.x);
      const sc = hub.mini ? 0.38 : 1;
      const burst = hub.card ? 0 : hub.mini ? 26 : disc ? 50 : 84;
      for (let b = 0; b < burst; b += 1) {
        const angle = outward + (rand() - 0.5) * (rand() < 0.75 ? 2.8 : 6.2);
        const len = ((disc ? 34 : 34) * k + rand() * (disc ? 78 : 104) * k) * sc;
        const end = { x: at.x + Math.cos(angle) * len, y: at.y + Math.sin(angle) * len };
        const bend = (rand() - 0.5) * len * 0.6;
        const p = new Path2D();
        p.moveTo(at.x + Math.cos(angle) * L.hubR * k, at.y + Math.sin(angle) * L.hubR * k);
        p.quadraticCurveTo((at.x + end.x) / 2 - Math.sin(angle) * bend, (at.y + end.y) / 2 + Math.cos(angle) * bend, end.x, end.y);
        glow(ctx, p, tone.line, 0.5, sel ? 0.45 : 0.22);
        if (rand() < 0.3) dot(ctx, end.x, end.y, 1.2, tone.core, 0.8);
      }

      const dir = hub.side === "left" ? -1 : 1;
      for (const b of hub.bullets) {
        const bp = toScreen(cam, b.at);
        for (let sgm = 0; sgm < 2; sgm += 1) {
          const o = (sgm - 0.5) * 4 * k;
          const p = new Path2D();
          p.moveTo(at.x + dir * L.hubR * k, at.y);
          p.bezierCurveTo(at.x + dir * (L.hubR + 12) * k, at.y + o, bp.x - dir * 14 * k, bp.y + o * 0.4, bp.x, bp.y);
          glow(ctx, p, tone.line, sgm ? 0.8 : 0.45, sgm ? 0.55 : 0.3);
        }
      }

      if (hub.card) {
        const cw = hub.card.w * k;
        const ch = hub.card.h * k;
        halo(ctx, at.x, at.y, (sel ? 110 : 90) * k, tone.halo, sel ? 0.4 : 0.26);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(4,16,26,0.95)";
        ctx.beginPath();
        ctx.roundRect(at.x - cw / 2, at.y - ch / 2, cw, ch, 9 * k);
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        const p = new Path2D();
        p.roundRect(at.x - cw / 2, at.y - ch / 2, cw, ch, 9 * k);
        glow(ctx, p, tone.line, (sel ? 2.6 : 1.8) * Math.max(0.7, k), 1);
      } else if (disc) {
        halo(ctx, at.x, at.y, (sel ? 78 : 60) * k, tone.halo, sel ? 0.55 : 0.4);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(4,16,26,0.96)";
        ctx.beginPath();
        ctx.arc(at.x, at.y, L.hubR * k, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        const p = new Path2D();
        p.arc(at.x, at.y, L.hubR * k, 0, Math.PI * 2);
        glow(ctx, p, tone.line, (sel ? 3.2 : 2.4) * Math.max(0.7, k), 1);
        ring(ctx, at.x, at.y, (L.hubR + 7) * k, tone.line, 1, sel ? 0.7 : 0.4, [2, 4]);
      } else {
        halo(ctx, at.x, at.y, (sel ? 62 : 50) * k * sc, tone.halo, sel ? 0.95 : 0.8);
        halo(ctx, at.x, at.y, 20 * k * sc, tone.halo, 0.9);
        ring(ctx, at.x, at.y, L.hubR * k * (hub.mini ? 0.5 : 1), tone.line, hub.mini ? 1.4 : 2.6, 1);
        dot(ctx, at.x, at.y, 7 * k * sc, tone.core);
        dot(ctx, at.x, at.y, 3.6 * k * sc, "#ffffff");
      }
      for (const b of hub.bullets) {
        const bp = toScreen(cam, b.at);
        halo(ctx, bp.x, bp.y, 12 * k, tone.halo, 0.32);
        ring(ctx, bp.x, bp.y, 5.8 * k, tone.line, 1.6, 0.95);
        dot(ctx, bp.x, bp.y, 3.2 * k, tone.core, 0.95);
      }
    }
    if (L.root) {
      const at = toScreen(cam, L.root.at);
      const tone = TONES[L.root.node.tone];
      const rootNerve = this.nerves.find((nv) => nv.hubId === L.root!.node.id);
      if (rootNerve) glow(ctx, polyline(ctx, rootNerve.samples, cam), tone.line, 1.8, 0.95);
      const rs = L.root.r / 40;
      halo(ctx, at.x, at.y, 110 * k * rs, tone.halo, 0.55);
      for (let b = 0; b < 90; b += 1) {
        const angle = rand() * Math.PI * 2;
        const len = (50 + rand() * 90) * k * rs;
        const p = new Path2D();
        p.moveTo(at.x + Math.cos(angle) * L.root.r * k, at.y + Math.sin(angle) * L.root.r * k);
        p.lineTo(at.x + Math.cos(angle) * len, at.y + Math.sin(angle) * len);
        glow(ctx, p, tone.line, 0.5, 0.35);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(4,16,26,0.96)";
      ctx.beginPath();
      ctx.arc(at.x, at.y, L.root.r * k, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      const p = new Path2D();
      p.arc(at.x, at.y, L.root.r * k, 0, Math.PI * 2);
      glow(ctx, p, tone.line, 3.4, 1);
      ring(ctx, at.x, at.y, (L.root.r + 10) * k, tone.line, 1.2, 0.6, [3, 5]);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  private paintLive(ctx: CanvasRenderingContext2D, s: SceneState, t: number) {
    const cam = s.camera;
    const L = s.layout;
    const agent = useAgentStore.getState();
    const plan = new Set(agent.planNodeIds);
    this.now = t;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // الخلفية الحية: إشارات تسري على الشبكة، واستجابة للمؤشر، وموجات النقر
    if (this.webEdges.length) {
      if (this.sparks.length === 0) for (let i = 0; i < 46; i += 1) this.sparks.push({ e: Math.floor(Math.random() * this.webEdges.length), o: Math.random(), v: 0.15 + Math.random() * 0.35 });
      for (const sp of this.sparks) {
        const u = (t * sp.v + sp.o) % 1;
        if (u < 0.02) sp.e = Math.floor(Math.random() * this.webEdges.length);
        const [ai, bi] = this.webEdges[sp.e];
        const a = this.webPts[ai];
        const b = this.webPts[bi];
        fastHalo(ctx, a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, 7, sp.e % 4 === 0 ? "rgba(255,170,60,1)" : "rgba(90,225,255,1)", 0.7 * Math.sin(u * Math.PI));
      }
      const p = this.pointer;
      if (p) {
        fastHalo(ctx, p.x, p.y, 60, "rgba(80,220,255,1)", 0.18);
        for (const q of this.webPts) {
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          if (d > 170) continue;
          const k = 1 - d / 170;
          ctx.strokeStyle = "#7fe9ff";
          ctx.globalAlpha = 0.45 * k;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(q.x, q.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          fastHalo(ctx, q.x, q.y, 10 + 8 * k, "rgba(120,235,255,1)", 0.6 * k);
        }
        ctx.globalAlpha = 1;
      }
      this.ripples = this.ripples.filter((r) => t - r.t0 < 1.4);
      for (const r of this.ripples) {
        const age = t - r.t0;
        const rad = age * 420;
        ring(ctx, r.x, r.y, rad, "#7fe9ff", 1.4, (1 - age / 1.4) * 0.6);
        for (const q of this.webPts) {
          const d = Math.abs(Math.hypot(q.x - r.x, q.y - r.y) - rad);
          if (d < 18) fastHalo(ctx, q.x, q.y, 12, "rgba(140,240,255,1)", (1 - d / 18) * (1 - age / 1.4));
        }
      }
    }

    // الوكلاء العاملون: أقمار حول القرص وأشعة إلى العقد التي يعملون عليها
    const running = Object.values(agent.tasks).filter((x) => x.status === "running" || x.status === "queued");
    const colors = new Map(agent.agents.map((a) => [a.id, a.color]));
    running.slice(0, 8).forEach((task, i, arr) => {
      const pos = satellitePos(L, i, arr.length);
      const sp = toScreen(cam, pos);
      const color = colors.get(task.agentId) ?? "#4fe6ff";
      const rgba = hexToRgba(color);
      const c0 = toScreen(cam, L.center);
      const u = (t * 0.9 + i * 0.37) % 1;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(c0.x, c0.y);
      ctx.lineTo(sp.x, sp.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      fastHalo(ctx, c0.x + (sp.x - c0.x) * u, c0.y + (sp.y - c0.y) * u, 9, rgba, 0.9);
      fastHalo(ctx, sp.x, sp.y, 26 * cam.k + 6 * Math.sin(t * 4 + i), rgba, 0.75);
      ring(ctx, sp.x, sp.y, 9 * cam.k + 4, color, 2, 0.95);
      dot(ctx, sp.x, sp.y, 3.5, "#ffffff", 0.95);
      const target = L.hubs.find((h) => h.node.id === task.nodeId);
      if (target) {
        const tp = toScreen(cam, target.at);
        ctx.setLineDash([6, 8]);
        ctx.lineDashOffset = -t * 40;
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(tp.x, tp.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        fastHalo(ctx, tp.x, tp.y, 60 * cam.k, rgba, 0.4 + 0.3 * Math.sin(t * 5));
      }
    });

    // نبضات تسري من الوكيل إلى كل نظام
    for (const nerve of this.nerves) {
      const tone = TONES[nerve.tone];
      const hot = nerve.hubId === agent.activeNodeId || plan.has(nerve.hubId);
      const n = hot ? 4 : 2;
      const speed = hot ? 0.9 : 0.28;
      for (let i = 0; i < n; i += 1) {
        const u = (t * speed + i / n + (nerve.hubId.length % 7) * 0.13) % 1;
        const idx = u * SAMPLES;
        const a = nerve.samples[Math.floor(idx)];
        const b = nerve.samples[Math.min(SAMPLES, Math.floor(idx) + 1)];
        const f = idx - Math.floor(idx);
        const q = toScreen(cam, { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
        fastHalo(ctx, q.x, q.y, (hot ? 16 : 10) * cam.k, tone.halo, hot ? 0.9 : 0.55);
        dot(ctx, q.x, q.y, (hot ? 2.8 : 2) * cam.k, "#ffffff", 0.95);
      }
    }

    // توهج العقد المختارة وما يعمل عليه الوكيل
    for (const hub of L.hubs) {
      const at = toScreen(cam, hub.at);
      const tone = TONES[hub.node.tone];
      const breathe = 0.5 + Math.sin(t * 2.2 + hub.at.x * 0.01) * 0.5;
      if (hub.node.id === s.hoverId || hub.node.id === s.selectedId) fastHalo(ctx, at.x, at.y, 64 * cam.k, tone.halo, 0.25 + breathe * 0.2);
      if (hub.node.id === agent.activeNodeId || plan.has(hub.node.id)) {
        const k = (t * 0.9) % 1;
        ring(ctx, at.x, at.y, (L.hubR + 10 + k * 34) * cam.k, tone.line, 2, (1 - k) * 0.9);
        fastHalo(ctx, at.x, at.y, 70 * cam.k, tone.halo, 0.35 + breathe * 0.3);
      }
    }

    const center = toScreen(cam, L.center);
    paintAgentCore(ctx, center, L.coreR * 0.83 * cam.k, agent.phase, agent.levels, t);

    ctx.restore();
  }
}
