export interface Rect { x: number; y: number; width: number; height: number }
export interface Viewport { width: number; height: number }
export function clampRect(rect: Rect, viewport: Viewport): Rect {
  const width = Math.min(Math.max(260, rect.width), Math.max(260, viewport.width - 24));
  const height = Math.min(Math.max(160, rect.height), Math.max(160, viewport.height - 160));
  return { width, height,
    x: Math.max(8, Math.min(rect.x, viewport.width - width - 8)),
    y: Math.max(80, Math.min(rect.y, viewport.height - height - 76)),
  };
}
export function clampZoom(zoom: number) { return Math.max(0.45, Math.min(2.4, zoom)); }
export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}
export interface GraphPosition { x: number; y: number }
export function orbitPosition(index: number, count: number, radius = 295): GraphPosition {
  const angle = -Math.PI / 2 + index * Math.PI * 2 / count;
  return { x: 740 + Math.cos(angle) * radius * 1.18, y: 447 + Math.sin(angle) * radius };
}
export function filamentPath(from: GraphPosition, to: GraphPosition, bend = 0): string {
  const dx = to.x - from.x, dy = to.y - from.y;
  return `M ${from.x} ${from.y} C ${from.x + dx * .48 - dy * bend} ${from.y + dy * .12 + dx * bend}, ${to.x - dx * .18 - dy * bend} ${to.y - dy * .38 + dx * bend}, ${to.x} ${to.y}`;
}
