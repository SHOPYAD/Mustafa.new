"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Crosshair, Layers, Network, Search, Activity, Table2 } from "lucide-react";
import { StageDock, StageHeader, useStageFont, type DataNote, type StudioStageProps } from "../StageFrame";
import { fitCamera, focusCamera, lerpCamera, zoomAt, type Camera, type Rect } from "@/lib/studio/camera";
import { buildExpansionMap, buildPresenceMap, getMap, mapForScreen, type ExpansionPath } from "@/lib/studio/graph/maps";
import { mapCollections, type GraphMap, type GraphNode } from "@/lib/studio/graph/types";
import { layoutCumulative, layoutFor, layoutPresence, type MapLayout } from "@/lib/studio/layout/radial";
import dynamic from "next/dynamic";

const HumanoidMasterAvatar = dynamic(() => import("../../avatar/HumanoidMasterAvatar"), { ssr: false });
import { NeuralRenderer, satellitePos } from "@/lib/studio/render/neural-renderer";
import { useAgentStore, phaseLabel, type AgentPhase } from "@/lib/studio/agent/agent-store";
import { openStudioWindow, useWindowStore, type WindowState } from "@/lib/studio/windows/window-store";
import { setStudioContext } from "@/lib/studio/capabilities/client";
import { ADMIN_THEME_OVERRIDES, DESIGN, FONT, MONO, TONES, UI } from "@/lib/studio/tokens";
import { WindowChrome } from "./WindowChrome";
import { NodeIcon } from "./icons";
import { useAgentBridge } from "./useAgentBridge";
import { PageWindow, RecordWindow, RouteWindow, TableWindow } from "./windows/DataWindows";
import { PreviewWindow, TraceWindow, usePreviewLauncher } from "./windows/AgentWindows";
import { SwarmWindow } from "./windows/SwarmWindow";
import type { CapabilityResponse } from "@/lib/studio/capabilities/client";

export type StudioShellProps = Pick<
  StudioStageProps,
  "isListening" | "audioFrequencies" | "onToggleListening" | "onStopListening" | "onOpenScreenSwitcher" | "onExitHome" | "onOpenHelp" | "onOpenSettings" | "onAskAgent"
> & {
  screenId: string;
  sessionId?: string;
  isUserSpeaking?: boolean;
  isAgentSpeaking?: boolean;
  isProcessing?: boolean;
  isAutoExecution?: boolean;
  focusNodeId?: string | null;
  resetKey?: number;
  onScreenChange?: (screenId: string) => void;
  /** للمعاينة فقط: فرض حالة الوكيل. */
  forcePhase?: AgentPhase;
};

type LiveCounts = Record<string, { totalItems: number | null; state: string }>;

const LEVEL_AR = ["المستوى العام", "مستوى المجال", "مستوى النظام", "مستوى النوافذ"];
const ATLAS_FRAME: Rect = { x: 0, y: 60, w: 1330, h: 796 };


function useViewport(ref: React.RefObject<HTMLDivElement | null>) {
  const [vp, setVp] = useState<{ w: number; h: number }>({ w: DESIGN.w, h: DESIGN.h });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setVp({ w: Math.max(320, el.clientWidth), h: Math.max(320, el.clientHeight) });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return vp;
}

export default function StudioShell(props: StudioShellProps) {
  useStageFont();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<NeuralRenderer | null>(null);
  const vp = useViewport(rootRef);
  const setViewport = useWindowStore((s) => s.setViewport);
  const scale = useWindowStore((s) => s.scale);
  const windows = useWindowStore((s) => s.windows);
  const openWin = useWindowStore((s) => s.open);
  const resetAll = useWindowStore((s) => s.resetAll);

  const [history, setHistory] = useState<{ mapId: string; selectedId: string | null }[]>(() => {
    const mapId = mapForScreen(props.screenId);
    if (mapId === "atlas") return [{ mapId, selectedId: "domain.overview" }];
    const parent = getMap(mapId)?.parentMapId;
    const chain = parent && parent !== "atlas" ? [{ mapId: "atlas", selectedId: null }, { mapId: parent, selectedId: null }] : [{ mapId: "atlas", selectedId: null }];
    return [...chain, { mapId, selectedId: null }];
  });
  const current = history[history.length - 1];
  const isExpansion = props.screenId === "02";
  const isPresence = props.screenId === "20";
  const [expPath, setExpPath] = useState<ExpansionPath>({ domainId: "bookings", leafId: "domain.bookings.bookings-all", itemId: "bookings.hotel.item0" });
  const [expFields, setExpFields] = useState<string[] | null>(null);
  const expCollection = useMemo(() => (isExpansion ? buildExpansionMap(expPath, null).hubs.find((h) => h.id === "x.entity")?.collection : undefined), [isExpansion, expPath]);
  useEffect(() => {
    setExpFields(null);
    if (!expCollection) return;
    let alive = true;
    fetch(`/api/admin/studio/schema?collection=${encodeURIComponent(expCollection)}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j.ok) return;
        const names = (j.fields as { name: string }[]).map((f) => f.name).filter((f) => f !== "id");
        setExpFields([...names.filter((f) => f !== "created" && f !== "updated"), ...names.filter((f) => f === "created" || f === "updated")]);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [expCollection]);
  const map = useMemo(() => (isPresence ? buildPresenceMap() : isExpansion ? buildExpansionMap(expPath, expFields) : getMap(current.mapId) ?? (getMap("atlas") as GraphMap)), [isPresence, isExpansion, expPath, expFields, current.mapId]);
  const layout = useMemo(() => (isPresence ? layoutPresence(map) : isExpansion ? layoutCumulative(map, expPath) : layoutFor(map)), [isPresence, isExpansion, map, expPath]);
  const [selectedId, setSelectedId] = useState<string | null>(current.selectedId);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [userCam, setUserCam] = useState<Camera | null>(null);
  const [anim, setAnim] = useState<{ cam: Camera; opacity: number } | null>(null);
  const [panEnabled, setPanEnabled] = useState(false);
  const [live, setLive] = useState<{ counts: LiveCounts; at: string | null; error: string | null }>({ counts: {}, at: null, error: null });
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const launchPreview = usePreviewLauncher();
  const navigateRef = useRef<((mapId: string, nodeId?: string) => void) | null>(null);
  const applyCapabilityUi = useCallback((capabilityId: string, input: Record<string, unknown>) => {
    if (capabilityId === "studio.open_table" && typeof input.collection === "string")
      openStudioWindow("table", `table:${input.collection}`, `${input.collection} · جدول`, { collection: input.collection, q: input.q }, { w: 820, h: 540 });
    if (capabilityId === "studio.open_record" && typeof input.collection === "string")
      openStudioWindow("record", `record:${input.collection}:${input.id}`, `${input.collection} · ${input.id}`, { collection: input.collection, id: input.id }, { w: 620, h: 560 });
    if (capabilityId === "studio.navigate" && typeof input.mapId === "string")
      navigateRef.current?.(input.mapId, typeof input.nodeId === "string" ? input.nodeId : undefined);
    if (capabilityId === "studio.open_route" && typeof input.route === "string")
      openStudioWindow("route", `route:${input.route}`, "طلبات الإلغاء المعلقة", { route: input.route }, { w: 760, h: 520 });
  }, []);

  useEffect(() => {
    const onCapUi = (ev: Event) => {
      const detail = (ev as CustomEvent<{ capabilityId?: string; input?: Record<string, unknown> }>).detail;
      if (detail?.capabilityId) applyCapabilityUi(detail.capabilityId, detail.input ?? {});
    };
    window.addEventListener("studio:capability-ui", onCapUi);
    return () => window.removeEventListener("studio:capability-ui", onCapUi);
  }, [applyCapabilityUi]);

  useAgentBridge(
    props.sessionId,
    {
      isListening: props.isListening,
      isUserSpeaking: !!props.isUserSpeaking,
      isAgentSpeaking: !!props.isAgentSpeaking,
      isProcessing: !!props.isProcessing,
      audioFrequencies: props.audioFrequencies ?? [],
    },
    {
      onProposal: (capabilityId, input) => void launchPreview(capabilityId, input, "agent"),
      onUi: (capabilityId, input) => applyCapabilityUi(capabilityId, input),
    }
  );
  const phase = useAgentStore((s) => s.phase);
  const phaseDetail = useAgentStore((s) => s.detail);
  useEffect(() => {
    if (props.forcePhase) useAgentStore.getState().setPhase(props.forcePhase, "");
  }, [props.forcePhase]);
  useEffect(() => setStudioContext(props.sessionId, !!props.isAutoExecution), [props.sessionId, props.isAutoExecution]);

  // ---- مقاسات الغلاف المرتكزة على الحواف
  const sBar = vp.w / DESIGN.w;
  const headerH = 60 * sBar;
  const dockH = 85 * sBar;
  const explorerW = 322;
  const explorerX = vp.w - (explorerW + 16) * scale;
  const area: Rect = useMemo(() => ({ x: 0, y: headerH, w: explorerX, h: vp.h - headerH - dockH }), [headerH, explorerX, vp.h, dockH]);
  const baseCam = useMemo(() => {
    if (map.id === "atlas") return fitCamera(ATLAS_FRAME, area);
    const b = layout.bounds;
    return fitCamera({ x: b.x - 30, y: b.y - 40, w: b.w + 60, h: b.h + 80 }, { x: area.x + 300 * scale * 0.4, y: area.y, w: area.w - 300 * scale * 0.4, h: area.h });
  }, [map.id, layout, area, scale]);
  const camera = anim?.cam ?? userCam ?? baseCam;
  const opacity = anim?.opacity ?? 1;

  useEffect(() => setViewport(vp.w, vp.h), [vp.w, vp.h, setViewport]);

  // ---- النوافذ الثابتة (السياق والمستكشف)
  const placeWin = useWindowStore((s) => s.place);
  useEffect(() => {
    const ctxPlace = { x: 14 * scale, y: headerH + 22 * scale, w: 296, h: 172 };
    const exPlace = { x: explorerX, y: headerH + 38 * scale, w: explorerW, h: (vp.h - dockH - 12 * scale - (headerH + 38 * scale)) / scale };
    if (!windows["ctx"]?.open) openWin("ctx", "context", "معلومات السياق", ctxPlace, {});
    else placeWin("ctx", ctxPlace);
    if (!windows["explorer"]?.open) openWin("explorer", "explorer", "المستكشف", exPlace, {});
    else placeWin("explorer", exPlace);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vp.w, vp.h, scale, props.resetKey]);

  useEffect(() => {
    if (props.resetKey) {
      resetAll();
      setUserCam(null);
    }
  }, [props.resetKey, resetAll]);

  // ---- الرسام
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = new NeuralRenderer(canvas);
    rendererRef.current = r;
    r.start();
    return () => r.stop();
  }, []);
  const bgCenter = useMemo(() => ({ x: baseCam.x + layout.center.x * baseCam.k, y: baseCam.y + layout.center.y * baseCam.k }), [baseCam, layout]);
  useEffect(() => {
    rendererRef.current?.setScene({
      layout,
      camera,
      viewport: vp,
      dpr: typeof window === "undefined" ? 1 : Math.min(2, window.devicePixelRatio || 1),
      selectedId,
      hoverId,
      seed: 1672,
      opacity,
      animating: !!anim,
      bgCenter,
    });
  }, [layout, camera, vp, selectedId, hoverId, opacity, anim, bgCenter]);

  // ---- العدادات الحية
  const collections = useMemo(() => mapCollections(map), [map]);
  const loadLive = useCallback(async () => {
    if (!collections.length) {
      setLive((l) => ({ ...l, at: new Date().toISOString(), error: null }));
      return;
    }
    try {
      const r = await fetch(`/api/admin/studio/live?collections=${collections.join(",")}`);
      const j = await r.json();
      if (j.ok) setLive({ counts: j.counts, at: j.fetchedAt, error: null });
      else setLive((l) => ({ ...l, error: j.error || `http_${r.status}` }));
    } catch {
      setLive((l) => ({ ...l, error: "network" }));
    }
  }, [collections]);
  useEffect(() => {
    void loadLive();
    const t = setInterval(loadLive, 60_000);
    const onRefresh = () => void loadLive();
    window.addEventListener("studio:refresh", onRefresh);
    return () => {
      clearInterval(t);
      window.removeEventListener("studio:refresh", onRefresh);
    };
  }, [loadLive]);

  // ---- الانتقال بين الخرائط
  const animRef = useRef(0);
  const runAnim = useCallback((from: Camera, to: Camera, op0: number, op1: number, ms: number) => {
    return new Promise<void>((resolve) => {
      cancelAnimationFrame(animRef.current);
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        setAnim({ cam: lerpCamera(from, to, t), opacity: op0 + (op1 - op0) * t });
        if (t < 1) animRef.current = requestAnimationFrame(step);
        else resolve();
      };
      animRef.current = requestAnimationFrame(step);
    });
  }, []);

  const baseCamRef = useRef(baseCam);
  baseCamRef.current = baseCam;
  const navigate = useCallback(
    async (mapId: string, via?: GraphNode, mode: "push" | "pop" | "reset" = "push", popTo?: number) => {
      const target = getMap(mapId);
      if (!target) return;
      const from = camera;
      const hub = via ? layout.hubs.find((h) => h.node.id === via.id || h.bullets.some((b) => b.node.id === via.id)) : null;
      const focusPt = hub ? (hub.bullets.find((b) => b.node.id === via?.id)?.at ?? hub.at) : layout.center;
      if (mode === "push") await runAnim(from, focusCamera(focusPt, area, from.k * 2.3), 1, 0, 420);
      else await runAnim(from, focusCamera(layout.center, area, from.k * 0.5), 1, 0, 360);
      setUserCam(null);
      setSelectedId(null);
      setHistory((h) => {
        if (mode === "pop") return h.slice(0, (popTo ?? h.length - 2) + 1);
        if (mode === "reset") return [{ mapId, selectedId: null }];
        return [...h.slice(0, -1), { ...h[h.length - 1], selectedId: via?.id ?? null }, { mapId, selectedId: null }];
      });
      if (target.screenId && target.screenId !== props.screenId) props.onScreenChange?.(target.screenId);
      requestAnimationFrame(async () => {
        const to = baseCamRef.current;
        const start = mode === "push" ? { k: to.k * 0.55, x: to.x + (layout.center.x * to.k * 0.45), y: to.y + (layout.center.y * to.k * 0.45) } : { k: to.k * 1.8, x: to.x - layout.center.x * to.k * 0.8, y: to.y - layout.center.y * to.k * 0.8 };
        await runAnim(start, to, 0, 1, 480);
        setAnim(null);
      });
    },
    [camera, layout, area, runAnim, props]
  );

  useEffect(() => {
    const want = mapForScreen(props.screenId);
    const cur = getMap(history[history.length - 1].mapId);
    const atlasScreens = ["01", "17", "18", "19"];
    if (cur && cur.screenId !== props.screenId && !(atlasScreens.includes(props.screenId) && cur.id === "atlas")) {
      const parentId = getMap(want)?.parentMapId;
      const parent = want === "atlas" ? [] : parentId && parentId !== "atlas" ? [{ mapId: "atlas", selectedId: null }, { mapId: parentId, selectedId: null }] : [{ mapId: "atlas", selectedId: null }];
      setHistory([...parent, { mapId: want, selectedId: null }]);
      setUserCam(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.screenId]);

  navigateRef.current = (mapId, nodeId) => {
    const via = nodeId ? layout.hubs.find((h) => h.node.id === nodeId)?.node : undefined;
    if (nodeId) useAgentStore.getState().plan([nodeId], "");
    void navigate(mapId, via);
  };

  const back = useCallback(() => {
    if (history.length > 1) void navigate(history[history.length - 2].mapId, undefined, "pop");
    else if (map.parentMapId) void navigate(map.parentMapId, undefined, "reset");
  }, [history, map.parentMapId, navigate]);

  useEffect(() => {
    if (current.selectedId !== selectedId) setSelectedId(current.selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.mapId]);

  // ---- تركيز الوكيل على عقدة
  useEffect(() => {
    if (!props.focusNodeId) return;
    const hub = layout.hubs.find((h) => h.node.id === props.focusNodeId);
    if (hub) {
      setSelectedId(hub.node.id);
      useAgentStore.getState().plan([hub.node.id], hub.node.label);
    }
  }, [props.focusNodeId, layout]);

  // ---- فتح النوافذ من العقد
  const openNode = useCallback(
    (node: GraphNode) => {
      if (suppressClick.current) return;
      setSelectedId(node.id);
      if (isExpansion) {
        if (node.id.startsWith("mini.")) {
          setExpPath({ domainId: node.domainId });
          return;
        }
        if ((map.leaves["x.domain"] ?? []).some((l) => l.id === node.id) && node.childMapId?.startsWith("hub.")) {
          setExpPath((p) => ({ domainId: p.domainId, leafId: node.id }));
          useAgentStore.getState().plan([node.id], node.label);
          return;
        }
        if ((map.leaves["x.system"] ?? []).some((l) => l.id === node.id) && node.collection) {
          setExpPath((p) => ({ ...p, itemId: node.id }));
          return;
        }
      }
      if (node.childMapId) {
        void navigate(node.childMapId, node);
        return;
      }
      if (node.window === "trace") {
        openStudioWindow("trace", "trace", "مسار عمل الوكيل المشرف", {}, { w: 520, h: 460 });
        return;
      }
      const title = node.fullLabel ?? node.label;
      if (node.collection && node.window !== "page") openStudioWindow("table", `table:${node.collection}`, `${title} · جدول`, { collection: node.collection, title }, { w: 820, h: 540 });
      else if (node.route) openStudioWindow("route", `route:${node.route}`, title, { route: node.route }, { w: 700, h: 500 });
      else if (node.href) openStudioWindow("route", `page:${node.href}`, title, { href: node.href, page: true }, { w: 1080, h: 660 });
    },
    [navigate, isExpansion, map]
  );

  // ---- التفاعل: عجلة، سحب، لوحة المفاتيح
  const onWheel = (e: React.WheelEvent) => {
    if (anim) return;
    setUserCam(zoomAt(camera, e.deltaY < 0 ? 1.1 : 1 / 1.1, { x: e.clientX, y: e.clientY }));
  };
  const suppressClick = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.button !== 0 && e.button !== 1) || anim) return;
    const start = { x: e.clientX, y: e.clientY, cam: camera };
    let dragging = false;
    const move = (ev: PointerEvent) => {
      if (!dragging && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 5) return;
      dragging = true;
      setUserCam({ ...start.cam, x: start.cam.x + ev.clientX - start.x, y: start.cam.y + ev.clientY - start.y });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (dragging) {
        suppressClick.current = true;
        setTimeout(() => (suppressClick.current = false), 0);
      } else rendererRef.current?.ripple(ev.clientX, ev.clientY);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.getAttribute?.("role") === "dialog") return;
      const ids = layout.hubs.map((h) => h.node.id);
      const i = selectedId ? ids.indexOf(selectedId) : -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setSelectedId(ids[(i + 1) % ids.length]);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setSelectedId(ids[(i - 1 + ids.length) % ids.length]);
      else if (e.key === "Enter" && selectedId) {
        const n = layout.hubs.find((h) => h.node.id === selectedId)?.node;
        if (n) openNode(n);
      } else if (e.key === "Escape" || e.key === "Backspace") back();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layout, selectedId, openNode, back]);

  // ---- البيانات المعروضة
  const selectedNode = useMemo(() => {
    for (const h of layout.hubs) {
      if (h.node.id === selectedId) return h.node;
      const b = (map.leaves[h.node.id] ?? []).find((l) => l.id === selectedId);
      if (b) return b;
    }
    return null;
  }, [selectedId, layout, map]);
  const depth = isExpansion ? (expPath.itemId ? 3 : expPath.leafId ? 2 : 1) : Math.min(3, history.length - 1);
  const parentTitle = history.length > 1 ? getMap(history[history.length - 2].mapId)?.title ?? "الأطلس" : "الأطلس";
  const note: DataNote = live.error
    ? { tone: "error", text: "تعذر تحديث العدادات", detail: live.error }
    : live.at
      ? { tone: "live", text: `بيانات حية · ${new Date(live.at).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}`, detail: collections.join(", ") }
      : { tone: "loading", text: "جارٍ القراءة…" };
  const countOf = (n: GraphNode) => (n.collection ? live.counts[n.collection] : undefined);

  const openTrace = () => openStudioWindow("trace", "trace", "مسار عمل الوكيل المشرف", {}, { w: 520, h: 460 });
  const openSwarm = () => openStudioWindow("agents", "agents", "خلية الوكلاء · العمل الحي", {}, { w: 780, h: 600 });
  const liveTasks = useAgentStore((s) => s.tasks);
  const liveAgents = useAgentStore((s) => s.agents);
  const shellChat = useAgentStore((s) => s.chatLog);
  const runningTasks = useMemo(() => Object.values(liveTasks).filter((t) => t.status === "running" || t.status === "queued").sort((a, b) => a.startedAt.localeCompare(b.startedAt)), [liveTasks]);
  const agentColors = useMemo(() => new Map(liveAgents.map((a) => [a.id, a.color])), [liveAgents]);
  useEffect(() => {
    if (props.screenId === "17") openTrace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.screenId]);

  return (
    <div
      ref={rootRef}
      dir="ltr"
      onPointerMove={(e) => rendererRef.current?.setPointer({ x: e.clientX, y: e.clientY })}
      onPointerLeave={() => rendererRef.current?.setPointer(null)}
      style={{ ...ADMIN_THEME_OVERRIDES, position: "fixed", inset: 0, overflow: "hidden", background: UI.bg, fontFamily: FONT, color: UI.text, userSelect: "none" }}>
      <canvas ref={canvasRef} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "grab", touchAction: "none" }} onWheel={onWheel} onPointerDown={onPointerDown} />
      <aside dir="rtl" aria-label="محادثة هذه الشاشة" style={{ position: "absolute", left: 16, bottom: 100, width: 320, maxHeight: 220, overflow: "auto", zIndex: 30, background: "rgba(4,16,28,0.94)", border: "1px solid rgba(64,214,245,0.45)", borderRadius: 12, padding: 10, color: "#e7f7ff" }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>محادثة هذه الشاشة</div>
        {shellChat.length === 0 ? <div style={{ fontSize: 12, color: "#93a8b3" }}>لا رسائل بعد على هذه الشاشة.</div> : shellChat.slice(-6).map((row) => (
          <p key={row.id} style={{ fontSize: 12, margin: "4px 0" }}><b>{row.speakerName || (row.sender === "user" ? "المدير" : "المشرف")}: </b>{row.text}</p>
        ))}
      </aside>

      {layout.presence ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: camera.x + (layout.presence.at.x - layout.presence.r * 1.25) * camera.k,
            top: camera.y + (layout.presence.at.y - layout.presence.r * 1.35) * camera.k,
            width: layout.presence.r * 2.5 * camera.k,
            height: layout.presence.r * 2.7 * camera.k,
            pointerEvents: "none",
            opacity,
            WebkitMaskImage: "radial-gradient(ellipse at center, #000 52%, transparent 74%)",
            maskImage: "radial-gradient(ellipse at center, #000 52%, transparent 74%)",
          }}
        >
          <HumanoidMasterAvatar
            width="100%"
            height="100%"
            hideDebugOverlay
            slowCamera
            isAgentSpeaking={!!props.isAgentSpeaking}
            isUserSpeaking={!!props.isUserSpeaking}
            isProcessing={phase === "thinking" || phase === "planning"}
            agentStatus={phase === "listening" ? "listening" : phase === "thinking" || phase === "planning" ? "deliberating" : phase === "speaking" ? "speaking" : phase === "executing" || phase === "awaiting_approval" ? "executing" : "idle"}
            frequencies={props.audioFrequencies ?? []}
            className="w-full h-full pointer-events-none"
          />
        </div>
      ) : null}

      {/* النصوص والأهداف التفاعلية في إحداثيات العالم */}
      <div onWheel={onWheel} onPointerDown={onPointerDown} style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.k})`, transformOrigin: "0 0", opacity }}>
        {layout.hubs.map((h) => {
          const tone = TONES[h.node.tone];
          const disc = layout.hubR > 15 && !h.card;
          const sel = h.node.id === selectedId;
          if (h.card) {
            return (
              <React.Fragment key={h.node.id}>
                <button
                  type="button"
                  aria-label={h.node.fullLabel ?? h.node.label}
                  onClick={() => openNode(h.node)}
                  onMouseEnter={() => setHoverId(h.node.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setSelectedId(h.node.id)}
                  dir="rtl"
                  style={{ position: "absolute", left: h.at.x - h.card.w / 2, top: h.at.y - h.card.h / 2, width: h.card.w, height: h.card.h, border: 0, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "0 14px", color: "#fff", fontFamily: FONT }}
                >
                  <NodeIcon name={h.node.icon} size={24} color={tone.title} />
                  <span style={{ fontSize: layout.titleSize, fontWeight: 700, whiteSpace: "nowrap", textShadow: `0 0 8px ${tone.line}99` }}>{h.node.label}</span>
                </button>
                {h.bullets.map((b) => {
                  const c = countOf(b.node);
                  return (
                    <span key={b.node.id} dir="rtl" onClick={() => openNode(b.node)} style={{ position: "absolute", left: b.at.x - 11, top: b.at.y, transform: "translate(-100%, -50%)", fontSize: layout.itemSize, color: "#dbe7ee", whiteSpace: "nowrap", cursor: "pointer", textShadow: "0 0 4px #000", display: "inline-flex", gap: 5 }}>
                      {b.node.label}
                      {b.node.collection ? <span style={{ fontFamily: MONO, fontSize: layout.itemSize * 0.72, color: c?.state === "live" ? tone.title : UI.textFaint }}>{c?.totalItems ?? "—"}</span> : null}
                    </span>
                  );
                })}
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={h.node.id}>
              <button
                type="button"
                aria-label={h.node.fullLabel ?? h.node.label}
                onClick={() => openNode(h.node)}
                onMouseEnter={() => setHoverId(h.node.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setSelectedId(h.node.id)}
                style={{ position: "absolute", left: h.at.x - layout.hubR - 8, top: h.at.y - layout.hubR - 8, width: (layout.hubR + 8) * 2, height: (layout.hubR + 8) * 2, borderRadius: "50%", border: 0, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", padding: 0, outline: sel ? `1px dashed ${tone.line}` : "none" }}
              >
                {disc ? <NodeIcon name={h.node.icon} size={layout.hubR * 1.05} color={tone.title} /> : null}
              </button>
              <span
                dir="rtl"
                onClick={() => openNode(h.node)}
                onMouseEnter={() => setHoverId(h.node.id)}
                onMouseLeave={() => setHoverId(null)}
                style={{ position: "absolute", left: h.title.x, top: h.title.y, transform: `translate(${h.side === "left" ? "-100%" : "0"}, -50%)`, fontSize: h.titleSize ?? layout.titleSize, fontWeight: h.mini ? 600 : 700, color: tone.title, whiteSpace: "nowrap", textShadow: `0 0 10px ${tone.line}aa, 0 0 2px #000`, cursor: "pointer", lineHeight: 1.2 }}
              >
                {h.node.label}
              </span>
              {h.bullets.map((b) => {
                const c = countOf(b.node);
                return (
                  <span
                    key={b.node.id}
                    dir="rtl"
                    title={b.node.fullLabel ?? b.node.label}
                    onClick={() => openNode(b.node)}
                    onMouseEnter={() => setHoverId(h.node.id)}
                    onMouseLeave={() => setHoverId(null)}
                    style={{ position: "absolute", left: b.at.x + (h.side === "left" ? -11 : 11), top: b.at.y, transform: `translate(${h.side === "left" ? "-100%" : "0"}, -50%)`, fontSize: layout.itemSize, color: b.node.id === selectedId || b.node.id === expPath.leafId || b.node.id === expPath.itemId ? "#fff" : "#dbe7ee", fontWeight: b.node.id === expPath.leafId || b.node.id === expPath.itemId ? 700 : 400, whiteSpace: "nowrap", cursor: "pointer", lineHeight: 1.1, textShadow: "0 0 3px #000, 0 0 6px #000", display: "inline-flex", gap: 5, alignItems: "baseline" }}
                  >
                    {b.node.label}
                    {b.node.collection && b.node.kind !== "setting" ? <span style={{ fontFamily: MONO, fontSize: layout.itemSize * 0.72, color: c?.state === "live" ? tone.title : UI.textFaint }}>{c?.totalItems ?? "—"}</span> : null}
                  </span>
                );
              })}
              {h.more > 0 ? (
                <span style={{ position: "absolute", left: h.bullets[h.bullets.length - 1].at.x + (h.side === "left" ? -11 : 11), top: h.bullets[h.bullets.length - 1].at.y + layout.itemGap, transform: `translate(${h.side === "left" ? "-100%" : "0"}, -50%)`, fontSize: layout.itemSize * 0.9, color: UI.textDim, whiteSpace: "nowrap", cursor: "pointer" }} onClick={() => openNode(h.node)}>
                  +{h.more} أخرى
                </span>
              ) : null}
            </React.Fragment>
          );
        })}
        {layout.root ? (
          <>
            <button type="button" aria-label={layout.root.node.label} onClick={() => openNode(layout.root!.node)} style={{ position: "absolute", left: layout.root.at.x - layout.root.r, top: layout.root.at.y - layout.root.r, width: layout.root.r * 2, height: layout.root.r * 2, borderRadius: "50%", border: 0, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 }}>
              <NodeIcon name={layout.root.node.icon} size={layout.root.r * 0.95} color={TONES[layout.root.node.tone].title} />
            </button>
            <span dir="rtl" style={{ position: "absolute", left: layout.root.at.x, top: layout.root.at.y - layout.root.r - (layout.kind === "cumulative" ? 12 : 30), transform: "translate(-50%, -50%)", fontSize: layout.kind === "cumulative" ? 13 : 24, fontWeight: 700, color: TONES[layout.root.node.tone].title, whiteSpace: "nowrap", textShadow: `0 0 12px ${TONES[layout.root.node.tone].line}` }}>{layout.root.node.label}</span>
          </>
        ) : null}
        {runningTasks.slice(0, 8).map((task, i, arr) => {
          const pos = satellitePos(layout, i, arr.length);
          const color = agentColors.get(task.agentId) ?? UI.accent;
          return (
            <button
              key={task.id}
              type="button"
              title={`${task.agentNameAr}: ${task.directive}`}
              onClick={openSwarm}
              dir="rtl"
              style={{ position: "absolute", left: pos.x, top: pos.y - 26, transform: "translate(-50%, -50%)", padding: "1px 8px", borderRadius: 8, border: `1px solid ${color}88`, background: "rgba(2,10,16,0.85)", color, fontFamily: FONT, fontSize: 11.5, whiteSpace: "nowrap", cursor: "pointer", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {task.agentNameAr.replace(/^وكيل\s*/, "")}
            </button>
          );
        })}
        {/* عنوان الوكيل تحت القرص */}
        <div style={{ position: "absolute", left: layout.center.x, top: layout.center.y + layout.coreR * 0.47, transform: "translate(-50%, 0)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, pointerEvents: "auto" }}>
          <button type="button" onClick={openTrace} dir="rtl" style={{ padding: "3px 14px", borderRadius: 8, background: "rgba(2,10,16,0.82)", border: "1px solid rgba(255,190,90,0.25)", color: "#fff", fontFamily: FONT, fontSize: 19, fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer", boxShadow: "0 0 12px rgba(0,0,0,0.6)" }}>
            الوكيل المشرف
          </button>
          <button type="button" onClick={openSwarm} dir="rtl" style={{ padding: "2px 10px", borderRadius: 10, border: `1px solid ${runningTasks.length ? "rgba(79,230,255,0.7)" : "rgba(79,230,255,0.25)"}`, background: "rgba(2,10,16,0.8)", color: runningTasks.length ? UI.accent : UI.textDim, fontFamily: FONT, fontSize: 12.5, whiteSpace: "nowrap", cursor: "pointer", boxShadow: runningTasks.length ? "0 0 10px rgba(79,230,255,0.4)" : "none" }}>
            {runningTasks.length ? `${runningTasks.length} ${runningTasks.length === 1 ? "وكيل يعمل" : "وكلاء يعملون"}` : "خلية الوكلاء"}
          </button>
          {phase !== "idle" ? (
            <span dir="rtl" style={{ fontSize: 13, color: phase === "error" ? UI.danger : phase === "awaiting_approval" ? UI.warn : UI.accent, whiteSpace: "nowrap", textShadow: "0 0 4px #000" }}>
              {phaseLabel(phase, phaseDetail)}
            </span>
          ) : null}
        </div>
      </div>

      {/* الترويسة: كامل العرض */}
      <div style={{ position: "absolute", left: 0, top: 0, width: DESIGN.w, height: 60, transform: `scale(${sBar})`, transformOrigin: "0 0", zIndex: 30 }}>
        <StageHeader
          crumbs={map.id === "atlas" ? ["المنصة", "الأطلس العصبي الشامل"] : [parentTitle, map.title]}
          title={map.id === "atlas" ? "الأطلس العصبي الشامل" : map.title}
          subtitle={map.id === "atlas" ? "منصة عمليات المعرفة المؤسسية" : map.subtitle}
          depthLevel={depth}
          onSelectDepthLevel={(lvl) => {
            if (lvl < history.length - 1) void navigate(history[lvl].mapId, undefined, "pop", lvl);
          }}
          onExitHome={props.onExitHome}
          onOpenScreenSwitcher={props.onOpenScreenSwitcher}
        />
      </div>

      {/* الشريط السفلي: كامل العرض */}
      <div style={{ position: "absolute", left: 0, top: vp.h - dockH, width: DESIGN.w, height: 85, transform: `scale(${sBar})`, transformOrigin: "0 0", zIndex: 30 }}>
        <div style={{ position: "absolute", left: 0, top: -856, width: DESIGN.w, height: 0 }}>
          <StageDock
            note={note}
            panEnabled={panEnabled}
            isListening={props.isListening}
            audioFrequencies={props.audioFrequencies}
            onToggleListening={props.onToggleListening}
            onStopListening={props.onStopListening}
            onTogglePan={() => setPanEnabled((v) => !v)}
            onZoomIn={() => setUserCam(zoomAt(camera, 1.15, { x: area.x + area.w / 2, y: area.y + area.h / 2 }))}
            onZoomOut={() => setUserCam(zoomAt(camera, 1 / 1.15, { x: area.x + area.w / 2, y: area.y + area.h / 2 }))}
            onResetWindows={() => {
              resetAll();
              setUserCam(null);
            }}
            onOpenScreenSwitcher={props.onOpenScreenSwitcher}
            onOpenHelp={props.onOpenHelp}
            onOpenSettings={openSwarm}
          />
        </div>
      </div>

      {/* النوافذ */}
      {Object.values(windows)
        .filter((w) => w.open)
        .map((w) => (
          <WindowHost
            key={w.id}
            win={w}
            scale={scale}
            map={map}
            layout={layout}
            depth={depth}
            selected={selectedNode}
            onSelect={setSelectedId}
            onOpenNode={openNode}
            onBack={history.length > 1 || map.parentMapId ? back : undefined}
            query={query}
            setQuery={setQuery}
            expanded={expanded}
            setExpanded={setExpanded}
            countOf={countOf}
            onAsk={props.onAskAgent}
          />
        ))}
    </div>
  );
}

function WindowHost({
  win,
  scale,
  map,
  layout,
  depth,
  selected,
  onSelect,
  onOpenNode,
  onBack,
  query,
  setQuery,
  expanded,
  setExpanded,
  countOf,
  onAsk,
}: {
  win: WindowState;
  scale: number;
  map: GraphMap;
  layout: MapLayout;
  depth: number;
  selected: GraphNode | null;
  onSelect: (id: string | null) => void;
  onOpenNode: (n: GraphNode) => void;
  onBack?: () => void;
  query: string;
  setQuery: (q: string) => void;
  expanded: Record<string, boolean>;
  setExpanded: (fn: (e: Record<string, boolean>) => Record<string, boolean>) => void;
  countOf: (n: GraphNode) => { totalItems: number | null; state: string } | undefined;
  onAsk?: (d: string) => Promise<string>;
}) {
  const p = win.payload;
  switch (win.kind) {
    case "context": {
      const rel = selected ? (map.leaves[selected.id]?.length ?? 0) : layout.hubs.length;
      const rows = [
        { icon: <Crosshair size={22} color="#5fe8ff" />, k: "التحديد", v: selected ? selected.label : map.title },
        { icon: <Network size={22} color="#5fe8ff" />, k: "العلاقات", v: map.id === "atlas" ? `${layout.hubs.length} مجال رئيسي` : selected?.collection ? `مجموعة ${selected.collection}` : selected?.route ? `مسار ${selected.route}` : selected ? `${rel} مصدر بيانات` : `${layout.hubs.length} نظام` },
        { icon: <Layers size={22} color="#5fe8ff" />, k: "الطبقة", v: `L${depth} - ${LEVEL_AR[depth]}` },
      ];
      return (
        <WindowChrome win={win} scale={scale} closable={false} bodyPadding={8}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map((r) => (
              <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 14, direction: "ltr" }}>
                <span style={{ width: 30, display: "grid", placeItems: "center", flex: "0 0 auto" }}>{r.icon}</span>
                <span dir="rtl" style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1.25, textAlign: "left" }}>
                  <span style={{ fontSize: 13.5, color: UI.textDim }}>{r.k}</span>
                  <span style={{ fontSize: 14.5, color: UI.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.v}</span>
                </span>
              </div>
            ))}
          </div>
        </WindowChrome>
      );
    }
    case "explorer": {
      const q = query.trim();
      const hubs = layout.hubs.map((h) => h.node).filter((n) => !q || n.label.includes(q) || (map.leaves[n.id] ?? []).some((l) => l.label.includes(q)));
      return (
        <WindowChrome win={win} scale={scale} closable={false} bodyPadding={10}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, border: `1px solid ${UI.borderSoft}`, background: "rgba(2,10,18,0.75)", marginBottom: 12 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="البحث في المجالات..." style={{ flex: 1, background: "transparent", border: 0, outline: "none", color: UI.text, fontSize: 14.5, fontFamily: FONT }} />
            <Search size={17} color={UI.textDim} />
          </label>
          <button type="button" onClick={onBack ?? (() => onSelect(null))} style={{ direction: "ltr", width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 10, border: "1px solid rgba(95,232,255,0.7)", background: "rgba(10,60,80,0.35)", color: "#fff", fontFamily: FONT, fontSize: 16.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 12px rgba(64,214,245,0.25)", marginBottom: 8 }}>
            <Activity size={20} color="#5fe8ff" />
            <span dir="rtl" style={{ flex: 1, textAlign: "left" }}>{map.id === "atlas" ? "الأطلس العصبي الشامل" : map.title}</span>
            {onBack ? <span style={{ fontSize: 12.5, color: UI.textDim, fontWeight: 400 }}>رجوع</span> : null}
          </button>
          <div role="tree" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {hubs.map((n) => {
              const tone = TONES[n.tone];
              const open = !!expanded[n.id] || (!!q && (map.leaves[n.id] ?? []).some((l) => l.label.includes(q)));
              const sel = selected?.id === n.id;
              const kids = map.leaves[n.id] ?? [];
              return (
                <div key={n.id} role="treeitem" aria-expanded={open}>
                  <div
                    tabIndex={0}
                    onClick={() => onSelect(n.id)}
                    onDoubleClick={() => onOpenNode(n)}
                    onKeyDown={(e) => e.key === "Enter" && onOpenNode(n)}
                    style={{ direction: "ltr", display: "flex", alignItems: "center", gap: 10, padding: "5px 8px", minHeight: 34, borderRadius: 8, cursor: "pointer", background: sel ? "rgba(64,214,245,0.12)" : "transparent", border: sel ? "1px solid rgba(64,214,245,0.55)" : "1px solid transparent" }}
                  >
                    <button type="button" aria-label="توسيع" onClick={(e) => { e.stopPropagation(); setExpanded((x) => ({ ...x, [n.id]: !x[n.id] })); }} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", display: "grid", placeItems: "center", width: 16 }}>
                      {kids.length ? (open ? <ChevronDown size={15} color="#c9d8df" /> : <ChevronRight size={15} color="#c9d8df" />) : null}
                    </button>
                    <span style={{ width: 15, height: 15, borderRadius: "50%", border: `2.5px solid ${tone.line}`, boxShadow: `0 0 7px ${tone.line}`, flex: "0 0 auto" }} />
                    <span dir="rtl" style={{ flex: 1, textAlign: "left", fontSize: 16, color: UI.text, whiteSpace: "nowrap" }}>{kids.length === 1 ? `${n.label} (${kids[0].label})` : n.label}</span>
                  </div>
                  {open
                    ? kids.map((l) => {
                        const c = countOf(l);
                        return (
                          <div key={l.id} onClick={() => onOpenNode(l)} style={{ direction: "ltr", display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 4px 44px", cursor: "pointer", fontSize: 14, color: UI.textDim }}>
                            {l.collection ? <Table2 size={13} color={tone.line} /> : <span style={{ width: 6, height: 6, borderRadius: 3, background: tone.line }} />}
                            <span dir="rtl" style={{ flex: 1, textAlign: "left" }}>{l.label}</span>
                            {l.collection ? <span style={{ fontFamily: MONO, fontSize: 12 }}>{c?.totalItems ?? "—"}</span> : null}
                          </div>
                        );
                      })
                    : null}
                </div>
              );
            })}
          </div>
        </WindowChrome>
      );
    }
    case "table":
      return (
        <WindowChrome win={win} scale={scale} icon={<Table2 size={16} color={UI.accent} />}>
          <TableWindow collection={String(p.collection)} title={p.title as string | undefined} status={p.status as string | undefined} initialQuery={p.q as string | undefined} />
        </WindowChrome>
      );
    case "record":
      return (
        <WindowChrome win={win} scale={scale}>
          <RecordWindow collection={String(p.collection)} id={String(p.id)} />
        </WindowChrome>
      );
    case "route":
      return (
        <WindowChrome win={win} scale={scale} bodyPadding={p.page ? 8 : 12}>
          {p.page ? <PageWindow href={String(p.href)} /> : <RouteWindow route={String(p.route)} />}
        </WindowChrome>
      );
    case "preview":
      return (
        <WindowChrome win={win} scale={scale}>
          <PreviewWindow winId={win.id} capabilityId={String(p.capabilityId)} input={p.input as Record<string, unknown>} response={p.response as CapabilityResponse} />
        </WindowChrome>
      );
    case "trace":
      return (
        <WindowChrome win={win} scale={scale}>
          <TraceWindow onAsk={onAsk} />
        </WindowChrome>
      );
    case "agents":
      return (
        <WindowChrome win={win} scale={scale}>
          <SwarmWindow onDelegate={onAsk} />
        </WindowChrome>
      );
    default:
      return null;
  }
}

