"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronsRight,
  Grip,
  Minus,
  Pin,
  Square,
  X,
} from "lucide-react";
import {
  FONT,
  LINE,
  PANEL_BG,
  StageDock,
  StageHeader,
  SupervisorDisc,
  beginStageDrag,
  iconBtn,
  useStageFont,
  useStageScale,
  type DataNote,
  type StudioStageProps,
} from "./StageFrame";
import {
  ancestryLabels,
  buildExpansionGraph,
  expansionNodeMap,
  visibleIds,
  type ExpansionNode,
} from "@/lib/neural-studio/expansion-graph";
import {
  MINI_DOMAINS,
  STAGE_H,
  STAGE_W,
  paintExpansionScene,
  type LeafTone,
  type Pt,
  type SceneLeaf,
} from "@/lib/neural-studio/expansion-scene";

const HUB: Pt = { x: 752, y: 408 };
const CONTRACT: Pt = { x: 925, y: 499 };
const BOOKING: Pt = { x: 1237, y: 558 };
const MARKER: Pt = { x: 725, y: 166 };

const LEAF_POS: Record<string, { dot: Pt; labelLeft: number }> = {
  "domain.02.bookings.manage": { dot: { x: 951, y: 208 }, labelLeft: 987 },
  "domain.02.bookings.fares": { dot: { x: 951, y: 256 }, labelLeft: 985 },
  "domain.02.bookings.amend": { dot: { x: 950, y: 306 }, labelLeft: 987 },
  "domain.02.bookings.channels": { dot: { x: 950, y: 357 }, labelLeft: 987 },
  "domain.02.component.8": { dot: { x: 950, y: 407 }, labelLeft: 986 },
  "domain.02.contract.cancel": { dot: { x: 947, y: 572 }, labelLeft: 987 },
  "domain.02.component.6": { dot: { x: 948, y: 627 }, labelLeft: 986 },
  "domain.02.contract.policy": { dot: { x: 948, y: 678 }, labelLeft: 986 },
  "domain.02.booking.price": { dot: { x: 1425, y: 415 }, labelLeft: 1459 },
  "domain.02.booking.availability": { dot: { x: 1451, y: 466 }, labelLeft: 1495 },
  "domain.02.component.7": { dot: { x: 1435, y: 526 }, labelLeft: 1471 },
  "domain.02.booking.customer": { dot: { x: 1435, y: 576 }, labelLeft: 1471 },
  "domain.02.booking.payment": { dot: { x: 1434, y: 627 }, labelLeft: 1471 },
  "domain.02.component.5": { dot: { x: 1428, y: 678 }, labelLeft: 1468 },
};

const LIST_IDS = [
  "domain.02.bookings.manage",
  "domain.02.bookings.fares",
  "domain.02.bookings.amend",
  "domain.02.bookings.channels",
  "domain.02.component.8",
];
const CONTRACT_IDS = ["domain.02.contract.cancel", "domain.02.component.6", "domain.02.contract.policy"];
const BOOKING_IDS = [
  "domain.02.booking.price",
  "domain.02.booking.availability",
  "domain.02.component.7",
  "domain.02.booking.customer",
  "domain.02.booking.payment",
  "domain.02.component.5",
];
const HUB_IDS = new Set(["domain.02.component.2", "domain.02.component.3", "domain.02.component.4"]);


function toneFor(node: ExpansionNode, cursorId: string | null): LeafTone {
  if (node.id === cursorId) return "cursor";
  if (node.status === "unknown") return "grey";
  if (node.id === "domain.02.booking.price") return "gold";
  return "cyan";
}

export default function CumulativeExpansionStage(props: StudioStageProps) {
  const {
    depthLevel,
    zoom,
    panEnabled,
    isListening,
    isAgentSpeaking = false,
    audioFrequencies = [],
    onOpenScreen,
    onFreshness,
  } = props;

  useStageFont();
  const outerRef = useRef<HTMLDivElement>(null);
  const sceneCanvasRef = useRef<HTMLCanvasElement>(null);
  const stage = useStageScale(outerRef);

  const graph = useMemo(() => buildExpansionGraph(), []);
  const byId = useMemo(() => expansionNodeMap(graph), [graph]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState(graph.poseSelectionId);
  const [cursorId, setCursorId] = useState<string | null>(graph.poseCursorId);
  const [cardOpen, setCardOpen] = useState(true);
  const [cardMin, setCardMin] = useState(false);
  const [mapOpen, setMapOpen] = useState(true);
  const [mapMin, setMapMin] = useState(false);
  const [cardPos, setCardPos] = useState({ x: 18, y: 84 });
  const [mapPos, setMapPos] = useState({ x: 266, y: 656 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [note, setNote] = useState<DataNote>({ text: "جارٍ قراءة سجل الحجوزات", tone: "loading" });

  useEffect(() => {
    let cancelled = false;
    const report = (next: DataNote) => {
      if (cancelled) return;
      setNote(next);
      onFreshness?.(`سجل التوسع · ${next.text}`);
    };
    fetch("/api/admin/automation/neural-expansion", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) return report({ text: "القراءة الحية تحتاج جلسة مشرف", tone: "denied" });
        if (!res.ok) return report({ text: "تعذر تحديث سجل الحجوزات", tone: "error", detail: `HTTP ${res.status}` });
        const json = await res.json();
        const probe = json?.probe;
        const at = json?.fetchedAt ? new Date(json.fetchedAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }) : "";
        if (probe?.freshness === "live") {
          return report({ text: `بيانات حية • ${probe.totalItems} حجز • ${at}`, tone: "live", detail: `PocketBase/${probe.collection}: ${probe.totalItems} · ${json.nodeCount} عقدة في السجل` });
        }
        report({ text: "السجل السيادي • عدّاد الحجوزات غير متاح", tone: "partial", detail: probe?.error });
      })
      .catch(() => report({ text: "تعذر الاتصال بسجل الحجوزات", tone: "error" }));
    return () => {
      cancelled = true;
    };
  }, [onFreshness]);

  const shown = useMemo(() => new Set(visibleIds(graph, collapsed, depthLevel)), [collapsed, depthLevel, graph]);

  const leafOf = useCallback(
    (ids: string[]): SceneLeaf[] =>
      ids.flatMap((id) => {
        const node = byId.get(id);
        const pos = LEAF_POS[id];
        if (!node || !pos || !shown.has(id)) return [];
        return [{ id, x: pos.dot.x, y: pos.dot.y, tone: toneFor(node, cursorId) }];
      }),
    [byId, cursorId, shown]
  );

  const cursorPos = cursorId && BOOKING_IDS.includes(cursorId) && shown.has(cursorId) ? LEAF_POS[cursorId].dot : null;

  useEffect(() => {
    const canvas = sceneCanvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const density = stage.k * dpr * Math.max(1, zoom);
    canvas.width = Math.max(1, Math.round(STAGE_W * density));
    canvas.height = Math.max(1, Math.round(STAGE_H * density));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const frame = requestAnimationFrame(() => {
      ctx.setTransform(density, 0, 0, density, 0, 0);
      paintExpansionScene(ctx, {
        hub: shown.has("domain.02.component.2") ? HUB : null,
        marker: shown.has("domain.02.component.2") ? MARKER : null,
        contract: shown.has("domain.02.component.3") ? CONTRACT : null,
        booking: shown.has("domain.02.component.4") ? BOOKING : null,
        listLeaves: leafOf(LIST_IDS),
        contractLeaves: leafOf(CONTRACT_IDS),
        bookingLeaves: leafOf(BOOKING_IDS),
        tooltipFor: cursorPos,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [cursorPos, leafOf, shown, stage.k, zoom]);

  const selected = byId.get(selectedId) ?? byId.get(graph.rootId)!;
  const chain = ancestryLabels(graph, selected.id);
  const visibleLeafIds = [...LIST_IDS, ...CONTRACT_IDS, ...BOOKING_IDS].filter((id) => shown.has(id));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "Escape") {
        setSelectedId(graph.poseSelectionId);
        setCursorId(graph.poseCursorId);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      if (visibleLeafIds.length === 0) return;
      event.preventDefault();
      const index = cursorId ? visibleLeafIds.indexOf(cursorId) : -1;
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = visibleLeafIds[(index + step + visibleLeafIds.length) % visibleLeafIds.length];
      setCursorId(next);
      setSelectedId(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursorId, graph.poseCursorId, graph.poseSelectionId, visibleLeafIds]);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onScenePointerDown = (event: React.PointerEvent) => {
    if (!panEnabled || (event.target as HTMLElement).closest("button")) return;
    const sx = event.clientX;
    const sy = event.clientY;
    const origin = { ...pan };
    const move = (ev: PointerEvent) => {
      setPan({ x: origin.x + (ev.clientX - sx) / stage.k, y: origin.y + (ev.clientY - sy) / stage.k });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={outerRef}
      dir="ltr"
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#01050b", fontFamily: FONT }}
    >
      <div
        style={{
          position: "absolute",
          left: stage.x,
          top: stage.y,
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${stage.k})`,
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        <div
          onPointerDown={onScenePointerDown}
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "836px 470px",
            cursor: panEnabled ? "grab" : "default",
          }}
        >
          <canvas ref={sceneCanvasRef} style={{ position: "absolute", left: 0, top: 0, width: STAGE_W, height: STAGE_H }} />

          {MINI_DOMAINS.map((domain) => {
            const gold = domain.label === "الحجوزات";
            return (
              <React.Fragment key={domain.label}>
                <button
                  type="button"
                  aria-label={`فتح ${domain.label}`}
                  onClick={() => onOpenScreen(domain.screenId)}
                  style={{ position: "absolute", left: domain.node.x - 14, top: domain.node.y - 14, width: 28, height: 28, borderRadius: 14, background: "transparent", border: 0, cursor: "pointer" }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: domain.label_at.x,
                    top: domain.label_at.y,
                    transform: "translate(-50%, -50%)",
                    color: gold ? "#ffd05a" : "#dbe7ee",
                    fontSize: gold ? 19 : 16,
                    fontWeight: gold ? 700 : 500,
                    lineHeight: 1.15,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    textShadow: gold ? "0 0 10px rgba(255,197,61,0.8)" : "0 0 6px rgba(0,0,0,0.9)",
                    pointerEvents: "none",
                  }}
                  dir="rtl"
                >
                  {domain.lines.map((line) => (
                    <span key={line} style={{ display: "block" }}>
                      {line}
                    </span>
                  ))}
                </span>
              </React.Fragment>
            );
          })}

          {shown.has("domain.02.component.2") && (
            <>
              <button
                type="button"
                aria-label="الحجوزات"
                onClick={() => {
                  setSelectedId("domain.02.component.2");
                  setCardOpen(true);
                }}
                onDoubleClick={() => toggleCollapse("domain.02.component.2")}
                style={{ position: "absolute", left: HUB.x - 26, top: HUB.y - 26, width: 52, height: 52, borderRadius: 26, background: "transparent", border: 0, cursor: "pointer" }}
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedId("domain.02.component.2");
                  setCardOpen(true);
                }}
                onDoubleClick={() => onOpenScreen("03")}
                style={{ position: "absolute", left: MARKER.x - 16, top: 134, height: 80, paddingLeft: 58, background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}
              >
                <span dir="rtl" style={{ display: "block", color: "#ffd35a", fontSize: 31, fontWeight: 700, lineHeight: "40px", textShadow: "0 0 14px rgba(255,197,61,0.75)" }}>
                  الحجوزات
                </span>
                <span dir="rtl" style={{ display: "block", color: "#b9c9d3", fontSize: 14, lineHeight: "18px", marginLeft: -2 }}>
                  إدارة الحجوزات والتوافر
                </span>
              </button>
            </>
          )}

          {shown.has("domain.02.component.3") && (
            <>
              <button
                type="button"
                aria-label="عقد الحجز"
                onClick={() => {
                  setSelectedId("domain.02.component.3");
                  setCardOpen(true);
                }}
                onDoubleClick={() => toggleCollapse("domain.02.component.3")}
                style={{ position: "absolute", left: CONTRACT.x - 24, top: CONTRACT.y - 24, width: 48, height: 48, borderRadius: 24, background: "transparent", border: 0, cursor: "pointer" }}
              />
              <span style={{ position: "absolute", left: 976, top: 462, pointerEvents: "none" }} dir="rtl">
                <span style={{ display: "block", color: "#ffffff", fontSize: 27, fontWeight: 700, lineHeight: "36px", textAlign: "left", textShadow: "0 0 10px rgba(0,0,0,0.9)" }}>عقد الحجز</span>
                <span style={{ display: "block", color: "#b9c9d3", fontSize: 14, lineHeight: "18px", textAlign: "left" }}>إدارة عقود الحجوزات</span>
              </span>
            </>
          )}

          {shown.has("domain.02.component.4") && (
            <>
              <button
                type="button"
                aria-label="الحجز"
                onClick={() => {
                  setSelectedId("domain.02.component.4");
                  setCardOpen(true);
                }}
                onDoubleClick={() => toggleCollapse("domain.02.component.4")}
                style={{ position: "absolute", left: BOOKING.x - 24, top: BOOKING.y - 24, width: 48, height: 48, borderRadius: 24, background: "transparent", border: 0, cursor: "pointer" }}
              />
              <span style={{ position: "absolute", left: 1240, top: 468, transform: "translateX(-50%)", textAlign: "center", pointerEvents: "none", whiteSpace: "nowrap" }} dir="rtl">
                <span style={{ display: "block", color: "#ffd35a", fontSize: 20, fontWeight: 700, lineHeight: "30px", textShadow: "0 0 10px rgba(255,197,61,0.75)" }}>الحجز</span>
                <span style={{ display: "block", color: "#b9c9d3", fontSize: 10.5, lineHeight: "15px", marginLeft: -12 }}>تفاصيل الحجز الفردي</span>
              </span>
            </>
          )}

          {visibleLeafIds.map((id) => {
            const node = byId.get(id)!;
            const pos = LEAF_POS[id];
            const isCursor = id === cursorId;
            const tone = toneFor(node, cursorId);
            const left = pos.dot.x - 24;
            const color = isCursor ? "#ffffff" : tone === "grey" ? "#8ea2ad" : tone === "gold" ? "#ffcf5a" : "#eaf6fb";
            return (
              <button
                key={id}
                type="button"
                data-node={id}
                onMouseEnter={() => setCursorId(id)}
                onFocus={() => setCursorId(id)}
                onClick={() => {
                  setCursorId(id);
                  setSelectedId(id);
                  setCardOpen(true);
                }}
                onDoubleClick={() => node.screenId && onOpenScreen(node.screenId)}
                style={{
                  position: "absolute",
                  left,
                  top: pos.dot.y - 24,
                  height: 48,
                  paddingLeft: pos.labelLeft - left,
                  paddingRight: 29,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 10,
                  border: isCursor ? "1.5px solid rgba(62,231,255,0.85)" : "1.5px solid transparent",
                  background: isCursor ? "rgba(8,46,62,0.55)" : "transparent",
                  boxShadow: isCursor ? "0 0 18px rgba(62,231,255,0.35), inset 0 0 12px rgba(62,231,255,0.15)" : "none",
                  color,
                  fontSize: isCursor ? 20 : 18,
                  fontWeight: isCursor || tone === "gold" ? 700 : 500,
                  fontFamily: FONT,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  textShadow: tone === "gold" ? "0 0 8px rgba(255,197,61,0.7)" : "0 0 6px rgba(62,231,255,0.3)",
                }}
              >
                {isCursor ? (
                  <span
                    style={{
                      position: "absolute",
                      left: 10.5,
                      top: 10.5,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      border: "2.6px solid #ffe39a",
                      background: "radial-gradient(circle, #fffaf0 0 50%, #04141d 56%)",
                      boxShadow: "0 0 14px rgba(255,214,120,0.85)",
                      pointerEvents: "none",
                    }}
                  />
                ) : null}
                <span dir="rtl">{node.label}</span>
                {isCursor ? (
                  <svg width="30" height="36" viewBox="0 0 30 36" style={{ position: "absolute", left: 30, top: 25, pointerEvents: "none", filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }}>
                    <path
                      d="M9 3.5c0-1.7 1.3-3 3-3s3 1.3 3 3V15l1-.2c.3-1.5 1.5-2.5 3-2.3 1.2.1 2.1 1 2.4 2.1 1.1-.7 2.6-.6 3.6.3.6.6.9 1.3 1 2.1 1.2-.2 2.4.5 2.8 1.7.2.5.2 1 .2 1.5v5.3c0 5.8-4.3 10.5-10 10.5h-1.5c-3.1 0-6-1.5-7.8-4.1L2.6 23c-.9-1.2-.7-2.9.5-3.8 1.1-.8 2.7-.7 3.6.3L9 22V3.5z"
                      fill="#ffffff"
                      stroke="#0b1b26"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </button>
            );
          })}

          {cursorPos ? (
            <div
              dir="rtl"
              style={{
                position: "absolute",
                left: cursorPos.x + 19,
                top: cursorPos.y - 169,
                width: 147,
                height: 64,
                borderRadius: 8,
                border: `1px solid ${LINE}`,
                background: "rgba(4,18,30,0.85)",
                color: "#d7eef6",
                fontSize: 15,
                lineHeight: "20px",
                paddingBottom: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <span>سحب لاستكشاف</span>
              <span>العقدة الفرعية</span>
            </div>
          ) : null}
        </div>

        <StageHeader
          crumbs={["المسح الطرفي / التسلسل السحيق", "التوسع التراكمي والشاشة الكاملة"]}
          title="التوسع التراكمي والشاشة الكاملة"
          depthLevel={depthLevel}
          onSelectDepthLevel={props.onSelectDepthLevel}
          onExitHome={props.onExitHome}
          onOpenScreenSwitcher={props.onOpenScreenSwitcher}
        />

        {cardOpen && (
          <section
            aria-label="سياق العقدة"
            title={note.detail ?? note.text}
            style={{
              position: "absolute",
              left: cardPos.x,
              top: cardPos.y,
              width: 339,
              height: cardMin ? 43 : 203,
              borderRadius: 12,
              border: "1px solid rgba(64,214,245,0.7)",
              background: PANEL_BG,
              boxShadow: "0 0 22px rgba(64,214,245,0.18), inset 0 0 18px rgba(64,214,245,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              onPointerDown={(e) => beginStageDrag(e, stage.k, cardPos, setCardPos, 339)}
              style={{ position: "absolute", left: 0, top: 0, right: 0, height: 43, borderBottom: "1px solid rgba(64,214,245,0.3)", cursor: "move" }}
            >
              <Grip size={20} color="#4fdcf7" style={{ position: "absolute", left: 17, top: 11 }} />
              <span dir="rtl" style={{ position: "absolute", left: 67, top: 2, fontSize: 17, fontWeight: 700, color: "#ffffff" }}>سياق العقدة</span>
              <button type="button" aria-label="تثبيت" style={iconBtn(200)}><Pin size={17} color="#d5e7ef" /></button>
              <button type="button" aria-label="تصغير" onClick={() => setCardMin((v) => !v)} style={iconBtn(237)}><Minus size={18} color="#d5e7ef" /></button>
              <button type="button" aria-label="إعادة الوضع" onClick={() => { setSelectedId(graph.poseSelectionId); setCursorId(graph.poseCursorId); }} style={iconBtn(272)}><Square size={15} color="#d5e7ef" /></button>
              <button type="button" aria-label="إغلاق" onClick={() => setCardOpen(false)} style={iconBtn(308)}><X size={18} color="#d5e7ef" /></button>
            </div>
            {!cardMin && (
              <>
                <span style={{ position: "absolute", left: 17, top: 54, width: 47, height: 47, borderRadius: 8, border: "1px solid rgba(64,214,245,0.35)", background: "rgba(2,12,22,0.9)", display: "grid", placeItems: "center" }}>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      border: `3px solid ${HUB_IDS.has(selected.id) || selected.id === "domain.02.booking.price" ? "#ffc94a" : selected.status === "unknown" ? "#7d93a0" : "#35e3ff"}`,
                      background: `radial-gradient(circle, ${HUB_IDS.has(selected.id) ? "#ffe39a" : "#c9fbff"} 0 48%, #06121c 54%)`,
                      boxShadow: HUB_IDS.has(selected.id) ? "0 0 12px rgba(255,197,61,0.6)" : "0 0 12px rgba(53,227,255,0.5)",
                    }}
                  />
                </span>
                <span dir="rtl" style={{ position: "absolute", left: 82, top: 44, fontSize: 20, fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap" }}>{selected.label}</span>
                <span dir="ltr" style={{ position: "absolute", left: 82, top: 75, fontSize: 14.5, color: "#c2d1da", whiteSpace: "nowrap", display: "flex", gap: 7 }}>
                  {(chain.length ? [...chain].reverse() : ["المنصة"]).map((part, i) => (
                    <React.Fragment key={part + i}>
                      {i > 0 ? <span style={{ color: "#5f7886" }}>&lt;</span> : null}
                      <span dir="rtl">{part}</span>
                    </React.Fragment>
                  ))}
                </span>
                <span style={{ position: "absolute", left: 17, top: 113, width: 305, height: 1, background: "rgba(64,214,245,0.25)" }} />
                <span dir="rtl" style={{ position: "absolute", left: 83, top: 112, fontSize: 15, color: "#d2e1e9", whiteSpace: "nowrap" }}>
                  النوع: {selected.relationType === "cycle" ? "مرجع دورة" : "عقدة تشغيلية"}
                </span>
                <span dir="rtl" style={{ position: "absolute", left: 83, top: 139, fontSize: 15, color: "#d2e1e9", whiteSpace: "nowrap" }}>
                  الخدمات الفرعية: {selected.childIds.length}
                </span>
                <span style={{ position: "absolute", left: 83, top: 165, display: "flex", alignItems: "center", gap: 12 }}>
                  <span dir="rtl" style={{ fontSize: 15, color: "#d2e1e9", whiteSpace: "nowrap" }}>
                    الحالة: {selected.status === "unknown" ? "غير معروفة" : "نشطة"}
                  </span>
                  <span style={{ width: 11, height: 11, borderRadius: 6, background: selected.status === "unknown" ? "#6b7780" : "#3ee58f", boxShadow: selected.status === "unknown" ? "none" : "0 0 8px #3ee58f" }} />
                </span>
              </>
            )}
          </section>
        )}

        <SupervisorDisc
          k={stage.k}
          cx={126}
          cy={745}
          labelTop={800}
          isListening={isListening}
          isAgentSpeaking={isAgentSpeaking}
          audioFrequencies={audioFrequencies}
          onOpen={() => onOpenScreen("20")}
        />

        {mapOpen && (
          <section
            aria-label="خريطة العرض المصغرة"
            style={{
              position: "absolute",
              left: mapPos.x,
              top: mapPos.y,
              width: 366,
              height: mapMin ? 40 : 176,
              borderRadius: 10,
              border: "1px solid rgba(64,214,245,0.6)",
              background: "rgba(4,16,28,0.92)",
              boxShadow: "0 0 18px rgba(64,214,245,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              onPointerDown={(e) => beginStageDrag(e, stage.k, mapPos, setMapPos, 366)}
              style={{ position: "absolute", left: 0, top: 0, right: 0, height: 40, borderBottom: "1px solid rgba(64,214,245,0.3)", cursor: "move" }}
            >
              <span dir="rtl" style={{ position: "absolute", left: 15, top: 5, fontSize: 15, fontWeight: 600, color: "#e6f2f8" }}>خريطة العرض المصغرة</span>
              <button type="button" aria-label="تثبيت" style={iconBtn(234, 8)}><Pin size={15} color="#d5e7ef" /></button>
              <button type="button" aria-label="تصغير" onClick={() => setMapMin((v) => !v)} style={iconBtn(268, 8)}><Minus size={16} color="#d5e7ef" /></button>
              <button type="button" aria-label="إعادة العرض" onClick={() => setPan({ x: 0, y: 0 })} style={iconBtn(299, 8)}><Square size={14} color="#d5e7ef" /></button>
              <button type="button" aria-label="إغلاق" onClick={() => setMapOpen(false)} style={iconBtn(330, 8)}><X size={16} color="#d5e7ef" /></button>
            </div>
            {!mapMin && <MiniMap pan={pan} zoom={zoom} />}
            {!mapMin && (
              <button type="button" aria-label="إغلاق الخريطة" onClick={() => setMapOpen(false)} style={{ position: "absolute", left: 341, top: 153, width: 24, height: 22, borderRadius: "6px 0 10px 0", border: "1px solid rgba(64,214,245,0.5)", background: "rgba(4,20,34,0.9)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
                <X size={13} color="#cfe6f0" />
              </button>
            )}
          </section>
        )}

        <button
          type="button"
          aria-label="القائمة"
          onClick={props.onOpenScreenSwitcher}
          style={{ position: "absolute", left: 1632, top: 92, width: 40, height: 175, background: "transparent", border: 0, cursor: "pointer", padding: 0 }}
        >
          <svg width="40" height="175" style={{ position: "absolute", left: 0, top: 0 }}>
            <path d="M40 1 L14 1 Q2 1 2 13 L2 135 L40 172" fill="rgba(5,20,34,0.92)" stroke="rgba(64,214,245,0.7)" strokeWidth="1.3" />
          </svg>
          <ChevronsRight size={18} color="#d8eef6" style={{ position: "absolute", left: 12, top: 14 }} />
          <span style={{ position: "absolute", left: 10, top: 40, writingMode: "vertical-rl", fontSize: 15, color: "#d8eef6", fontFamily: FONT }}>القائمة</span>
        </button>

        <StageDock {...props} note={note} />
      </div>
    </div>
  );
}

function MiniMap({ pan, zoom }: { pan: Pt; zoom: number }) {
  const c = { x: 85, y: 61 };
  const ring = (n: number, r: number, phase: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = phase + (i / n) * Math.PI * 2;
      return { x: c.x + Math.cos(a) * r * 1.25, y: c.y + Math.sin(a) * r };
    });
  const inner = ring(8, 28, 0.3);
  const outer = ring(12, 50, 0.1);
  const rect = {
    x: 164 - pan.x * 0.08,
    y: 12 - pan.y * 0.08,
    w: 140 / zoom,
    h: 104 / zoom,
  };
  const fanTargets = [
    [290, 58],
    [258, 84],
    [272, 102],
    [300, 110],
    [312, 30],
    [245, 22],
    [322, 80],
  ];
  return (
    <svg width="340" height="130" viewBox="0 0 340 130" style={{ position: "absolute", left: 0, top: 44 }}>
      {[...inner, ...outer].map((n, i) => (
        <line key={`l${i}`} x1={c.x} y1={c.y} x2={n.x} y2={n.y} stroke="#5fdcf5" strokeOpacity={i < 8 ? 0.6 : 0.35} strokeWidth="0.7" />
      ))}
      {outer.map((n, i) => (
        <g key={`o${i}`}>
          <circle cx={n.x} cy={n.y} r={6} fill="none" stroke="#7fe9ff" strokeOpacity="0.35" />
          <circle cx={n.x} cy={n.y} r={2.6} fill="#cdefff" />
        </g>
      ))}
      {inner.map((n, i) => (
        <circle key={`i${i}`} cx={n.x} cy={n.y} r={1.8} fill="#9fe6ff" />
      ))}
      <circle cx={c.x} cy={c.y} r={15} fill="none" stroke="#7fe9ff" strokeOpacity="0.55" />
      <circle cx={c.x} cy={c.y} r={9} fill="none" stroke="#bff6ff" strokeOpacity="0.8" strokeWidth="1.4" />
      <circle cx={c.x} cy={c.y} r={4.5} fill="#f2fdff" />
      <line x1={c.x} y1={c.y} x2={150} y2={45} stroke="#7fe9ff" strokeOpacity="0.7" />
      <circle cx={150} cy={45} r={8} fill="none" stroke="#5fe8ff" strokeOpacity="0.6" />
      <circle cx={150} cy={45} r={4.5} fill="#35e3ff" />
      <circle cx={172} cy={54} r={3} fill="#ffffff" />
      <path d="M172 54 C 195 20, 215 30, 232 58 C 215 88, 195 90, 172 54 Z" fill="rgba(255,190,70,0.3)" />
      {Array.from({ length: 11 }, (_, i) => (
        <path key={`f${i}`} d={`M172 54 C 192 ${26 + i * 5}, 214 ${40 + i * 2}, 232 58`} fill="none" stroke="#ffc53d" strokeOpacity="0.5" strokeWidth="0.6" />
      ))}
      {fanTargets.map(([x, y], i) => (
        <g key={`t${i}`}>
          <line x1={232} y1={58} x2={x} y2={y} stroke="#35e3ff" strokeOpacity="0.55" strokeWidth="0.7" />
          <circle cx={x} cy={y} r={i === 0 ? 5 : 2.4} fill={i === 0 ? "#5fe8ff" : "#9feeff"} />
        </g>
      ))}
      <circle cx={232} cy={58} r={10} fill="rgba(255,200,80,0.35)" />
      <circle cx={232} cy={58} r={4.8} fill="#fff1c4" />
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="none" stroke="#7fe9ff" strokeWidth="1.5" />
    </svg>
  );
}
