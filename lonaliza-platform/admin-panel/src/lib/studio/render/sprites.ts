/** توهج مسبق الرسم لكل لون: drawImage أرخص بكثير من createRadialGradient في كل إطار. */
const cache = new Map<string, HTMLCanvasElement>();
const SIZE = 128;

function sprite(color: string) {
  let c = cache.get(color);
  if (c) return c;
  c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  const grad = g.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
  const rgb = color.replace(/rgba?\(([^)]+)\)/, "$1").split(",").slice(0, 3).join(",");
  grad.addColorStop(0, `rgba(${rgb},0.9)`);
  grad.addColorStop(0.35, `rgba(${rgb},0.35)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, SIZE, SIZE);
  cache.set(color, c);
  return c;
}

/** color بصيغة rgba(r,g,b,1). */
export function fastHalo(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  if (r <= 0 || alpha <= 0) return;
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(sprite(color), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = prev;
}
