import { create } from "zustand";

export type WindowKind = "context" | "explorer" | "inspector" | "table" | "record" | "route" | "preview" | "trace" | "agent" | "agents" | "thesaurus";

export interface WindowState {
  id: string;
  kind: WindowKind;
  title: string;
  /** إحداثيات شاشة بالبكسل. */
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  pinned: boolean;
  /** حرّكها المستخدم أو غيّر مقاسها: لا يُعاد تموضعها تلقائيًا. */
  moved: boolean;
  open: boolean;
  payload: Record<string, unknown>;
}

type Placement = Pick<WindowState, "x" | "y" | "w" | "h">;

interface WindowStore {
  windows: Record<string, WindowState>;
  topZ: number;
  viewport: { w: number; h: number };
  /** مقياس واجهة النوافذ نسبة إلى مقاس التصميم 1672×941. */
  scale: number;
  open: (id: string, kind: WindowKind, title: string, place: Placement, payload?: Record<string, unknown>) => void;
  close: (id: string) => void;
  /** يعيد تموضع نافذة مرتكزة على الحواف عند تغير المقاس، ما لم يحركها المستخدم أو يثبتها. */
  place: (id: string, place: Placement) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  toggleMin: (id: string) => void;
  toggleMax: (id: string) => void;
  togglePin: (id: string) => void;
  setViewport: (w: number, h: number) => void;
  resetAll: () => void;
}

const STORAGE = "cyber-console.windows.v1";
const MIN_W = 220;
const MIN_H = 120;

function clampPlace(w: WindowState, vw: number, vh: number, scale = 1): WindowState {
  const zoom = scale > 0 ? scale : 1;
  const width = Math.min(Math.max(MIN_W, w.w), Math.max(MIN_W, (vw - 16) / zoom));
  const height = Math.min(Math.max(MIN_H, w.h), Math.max(MIN_H, (vh - 16) / zoom));
  const visualW = width * zoom;
  return {
    ...w,
    w: width,
    h: height,
    x: Math.min(Math.max(0, w.x), Math.max(0, vw - visualW)),
    y: Math.min(Math.max(0, w.y), Math.max(0, vh - 40)),
  };
}

function loadSaved(): Record<string, Partial<WindowState>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE) || "{}");
  } catch {
    return {};
  }
}

function persist(windows: Record<string, WindowState>) {
  if (typeof window === "undefined") return;
  const slim = Object.fromEntries(
    Object.values(windows)
      .filter((w) => w.pinned)
      .map((w) => [w.id, { x: w.x, y: w.y, w: w.w, h: w.h }])
  );
  try {
    localStorage.setItem(STORAGE, JSON.stringify(slim));
  } catch {
    /* storage full or blocked */
  }
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: {},
  topZ: 10,
  viewport: { w: 1672, h: 941 },
  scale: 1,
  open: (id, kind, title, place, payload = {}) =>
    set((s) => {
      const saved = loadSaved()[id];
      const prev = s.windows[id];
      const z = s.topZ + 1;
      const base: WindowState = prev
        ? { ...prev, title, payload, open: true, min: false, z }
        : { id, kind, title, ...place, ...(saved ?? {}), z, min: false, max: false, pinned: !!saved, moved: false, open: true, payload };
      return { topZ: z, windows: { ...s.windows, [id]: clampPlace(base, s.viewport.w, s.viewport.h, s.scale) } };
    }),
  close: (id) => set((s) => (s.windows[id] ? { windows: { ...s.windows, [id]: { ...s.windows[id], open: false } } } : s)),
  place: (id, place) =>
    set((s) => {
      const win = s.windows[id];
      if (!win || win.pinned || win.moved) return s;
      return { windows: { ...s.windows, [id]: clampPlace({ ...win, ...place }, s.viewport.w, s.viewport.h, s.scale) } };
    }),
  focus: (id) =>
    set((s) => {
      const w = s.windows[id];
      if (!w || w.z === s.topZ) return s;
      const z = s.topZ + 1;
      return { topZ: z, windows: { ...s.windows, [id]: { ...w, z } } };
    }),
  move: (id, x, y) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return s;
      const next = { ...s.windows, [id]: clampPlace({ ...w, x, y, moved: true }, s.viewport.w, s.viewport.h, s.scale) };
      if (w.pinned) persist(next);
      return { windows: next };
    }),
  resize: (id, w, h) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      const next = { ...s.windows, [id]: clampPlace({ ...win, w, h, moved: true }, s.viewport.w, s.viewport.h, s.scale) };
      if (win.pinned) persist(next);
      return { windows: next };
    }),
  toggleMin: (id) => set((s) => (s.windows[id] ? { windows: { ...s.windows, [id]: { ...s.windows[id], min: !s.windows[id].min } } } : s)),
  toggleMax: (id) => set((s) => (s.windows[id] ? { windows: { ...s.windows, [id]: { ...s.windows[id], max: !s.windows[id].max, min: false } } } : s)),
  togglePin: (id) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return s;
      const next = { ...s.windows, [id]: { ...w, pinned: !w.pinned } };
      persist(next);
      return { windows: next };
    }),
  setViewport: (w, h) =>
    set((s) => {
      const scale = Math.max(0.62, Math.min(w / 1672, h / 941));
      return {
        viewport: { w, h },
        scale,
        windows: Object.fromEntries(Object.entries(s.windows).map(([k, v]) => [k, clampPlace(v, w, h, scale)])),
      };
    }),
  resetAll: () => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE);
    set((s) => ({ windows: Object.fromEntries(Object.entries(s.windows).filter(([, w]) => w.kind === "context" || w.kind === "explorer").map(([k, w]) => [k, { ...w, pinned: false, moved: false }])) }));
    void get;
  },
}));

let cascade = 0;

/** يفتح نافذة بيانات بمقاس تصميم (w,h) في موضع متدرج داخل المساحة الحرة. */
export function openStudioWindow(kind: WindowKind, id: string, title: string, payload: Record<string, unknown>, size: { w: number; h: number } = { w: 760, h: 520 }) {
  const { viewport, scale, windows, open, focus } = useWindowStore.getState();
  if (windows[id]?.open) {
    open(id, kind, title, windows[id], payload);
    focus(id);
    return;
  }
  cascade = (cascade + 1) % 6;
  const w = Math.min(size.w, (viewport.w - 40) / scale);
  const h = Math.min(size.h, (viewport.h - 190 * scale) / scale);
  const x = Math.max(12, Math.round(viewport.w * 0.5 - (w * scale) / 2 - 170 * scale + cascade * 28 * scale));
  const y = Math.round(92 * scale + cascade * 26 * scale);
  open(id, kind, title, { x, y, w, h }, payload);
}
