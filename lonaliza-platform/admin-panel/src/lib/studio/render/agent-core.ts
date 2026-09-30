import { dot, glow, ring } from "@/lib/neural-studio/expansion-scene";
import { fastHalo as halo } from "./sprites";
import type { Pt } from "../camera";
import type { AgentPhase } from "../agent/agent-store";

const CYAN = "#35e3ff";
const GOLD = "#ffae2e";
const AMBER = "#ffcc4d";
const RED = "#ff4d6a";

function arc(ctx: CanvasRenderingContext2D, c: Pt, r: number, a0: number, a1: number, color: string, w: number, a: number) {
  const p = new Path2D();
  p.arc(c.x, c.y, r, a0, a1);
  glow(ctx, p, color, w, a);
}

/**
 * القرص الأوسط = الوكيل المشرف. يُرسم كل إطار بحالته وترددات صوته الفعلية.
 * r = نصف القطر المرئي بوحدات الشاشة (≈125 عند مقياس المرجع).
 */
export function paintAgentCore(ctx: CanvasRenderingContext2D, c: Pt, r: number, phase: AgentPhase, levels: number[], t: number) {
  const s = r / 125;
  const busy = phase === "thinking" || phase === "planning" || phase === "executing";
  const speed = busy ? 1.8 : phase === "listening" || phase === "speaking" ? 0.9 : 0.35;
  const accent = phase === "error" ? RED : phase === "awaiting_approval" ? AMBER : phase === "listening" ? CYAN : GOLD;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  halo(ctx, c.x, c.y, 175 * s, phase === "error" ? "rgba(255,70,100,1)" : "rgba(40,190,255,1)", busy ? 0.3 : 0.2);
  halo(ctx, c.x, c.y, 140 * s, phase === "error" ? "rgba(255,70,100,1)" : "rgba(255,160,50,1)", busy ? 0.8 : 0.72);

  ctx.globalCompositeOperation = "source-over";
  const fill = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 80 * s);
  fill.addColorStop(0, "rgba(3,12,20,0.55)");
  fill.addColorStop(1, "rgba(3,12,20,0.15)");
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 80 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "lighter";

  // الحلقات الثابتة
  arc(ctx, c, 126 * s, 0, Math.PI * 2, CYAN, 1.6 * s, 0.85);
  arc(ctx, c, 100 * s, 0, Math.PI * 2, CYAN, 4.2 * s, 0.95);
  arc(ctx, c, 86 * s, 0, Math.PI * 2, CYAN, 1.8 * s, 0.75);
  arc(ctx, c, 46 * s, 0, Math.PI * 2, CYAN, 1.6 * s, 0.7);

  // الأقواس الذهبية الدوارة
  const rot = t * 0.35 * speed;
  const segs: [number, number][] = [[-2.75, -1.55], [-1.3, -0.2], [0.1, 1.25], [1.5, 2.5], [2.7, 3.35]];
  for (const [a0, a1] of segs) arc(ctx, c, 114 * s, a0 + rot, a1 + rot, accent, 4.4 * s, 0.95);

  // حلقة منقطة معاكسة
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(-t * 0.5 * speed);
  ring(ctx, 0, 0, 92 * s, "#7fe9ff", 1.1 * s, 0.6, [2 * s, 6 * s]);
  ring(ctx, 0, 0, 136 * s, "#7fe9ff", 0.9 * s, 0.35, [1.5 * s, 7 * s]);
  ctx.restore();

  // الحلقة الذهبية الداخلية تنبض مع الصوت
  const avg = levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 0;
  const pulse = phase === "speaking" || phase === "listening" ? avg : 0.12 + Math.sin(t * 2) * 0.05;
  arc(ctx, c, (57 + pulse * 8) * s, 0, Math.PI * 2, accent, (3 + pulse * 3) * s, 0.95);

  // جسيمات مدارية عند التفكير/التخطيط/التنفيذ
  if (busy) {
    for (let i = 0; i < 14; i += 1) {
      const a = t * (1.2 + (i % 3) * 0.4) + (i / 14) * Math.PI * 2;
      const rr = (66 + (i % 4) * 9) * s;
      dot(ctx, c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, 1.8 * s, i % 2 ? CYAN : GOLD, 0.9);
    }
  }

  // تموج الاستماع
  if (phase === "listening") {
    const k = (t * 0.8) % 1;
    ring(ctx, c.x, c.y, (126 + k * 40) * s, CYAN, 1.4 * s, (1 - k) * 0.7);
  }
  if (phase === "awaiting_approval" || phase === "error") {
    const blink = 0.5 + Math.sin(t * 5) * 0.5;
    arc(ctx, c, 126 * s, 0, Math.PI * 2, accent, 3 * s, 0.4 + blink * 0.5);
  }

  // الموجة الصوتية: ترددات حقيقية عند الكلام/الاستماع، تنفس هادئ في غيرها
  const bars = 29;
  const live = (phase === "speaking" || phase === "listening") && levels.length > 0;
  for (let i = 0; i < bars; i += 1) {
    const u = i / (bars - 1);
    const env = Math.pow(Math.sin(u * Math.PI), 1.3);
    const lv = live ? levels[Math.floor(u * (levels.length - 1))] ?? 0 : 0.25 + 0.25 * Math.abs(Math.sin(i * 1.7 + t * (busy ? 6 : 2.4)));
    const h = (3 + env * 34 * Math.min(1, lv * (live ? 1.6 : 1))) * s;
    const x = c.x + (u - 0.5) * 76 * s;
    const color = phase === "listening" ? CYAN : accent;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 3.2 * s;
    ctx.beginPath();
    ctx.moveTo(x, c.y - h / 2);
    ctx.lineTo(x, c.y + h / 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.4 * s;
    ctx.stroke();
  }
  halo(ctx, c.x, c.y, 26 * s, "rgba(255,170,60,1)", 0.5 + pulse * 0.4);
  ctx.globalAlpha = 1;
  ctx.restore();
}
