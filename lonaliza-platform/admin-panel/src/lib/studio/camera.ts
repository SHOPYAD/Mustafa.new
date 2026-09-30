export interface Pt {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** screen = world * k + (x, y) */
export interface Camera {
  x: number;
  y: number;
  k: number;
}

export function fitCamera(world: Rect, area: Rect, padding = 0): Camera {
  const k = Math.min((area.w - padding * 2) / world.w, (area.h - padding * 2) / world.h);
  return {
    k,
    x: area.x + (area.w - world.w * k) / 2 - world.x * k,
    y: area.y + (area.h - world.h * k) / 2 - world.y * k,
  };
}

export function toScreen(c: Camera, p: Pt): Pt {
  return { x: p.x * c.k + c.x, y: p.y * c.k + c.y };
}

export function toWorld(c: Camera, p: Pt): Pt {
  return { x: (p.x - c.x) / c.k, y: (p.y - c.y) / c.k };
}

export function zoomAt(c: Camera, factor: number, screen: Pt, min = 0.25, max = 6): Camera {
  const k = Math.min(max, Math.max(min, c.k * factor));
  const w = toWorld(c, screen);
  return { k, x: screen.x - w.x * k, y: screen.y - w.y * k };
}

/** كاميرا تضع نقطة العالم p في مركز المساحة بمقياس k. */
export function focusCamera(p: Pt, area: Rect, k: number): Camera {
  return { k, x: area.x + area.w / 2 - p.x * k, y: area.y + area.h / 2 - p.y * k };
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** استيفاء بمقياس لوغاريتمي كي لا تبدو الطيران خطيًا عند التكبير. */
export function lerpCamera(a: Camera, b: Camera, t: number): Camera {
  const e = easeInOutCubic(Math.min(1, Math.max(0, t)));
  const k = Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * e);
  return { k, x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
}
