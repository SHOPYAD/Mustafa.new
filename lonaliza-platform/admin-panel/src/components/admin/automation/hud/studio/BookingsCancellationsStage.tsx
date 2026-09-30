"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarX2,
  Check,
  Eye,
  FileText,
  Grip,
  Minus,
  Pin,
  Search,
  Square,
  Star,
  Workflow,
  X,
} from "lucide-react";
import {
  FONT,
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
  BOOKING_CLUSTERS,
  CANCEL_STATE_LABEL,
  CORE,
  FAINT_DOMAINS,
  clusterById,
  matchClusters,
  requestStage,
  type BookingCluster,
  type BookingSummary,
  type FocusRequest,
} from "@/lib/neural-studio/bookings-graph";
import { TONE, paintBookingsScene } from "@/lib/neural-studio/bookings-scene";
import { STAGE_H, STAGE_W } from "@/lib/neural-studio/expansion-scene";

type Source = { collection: string; totalItems: number | null; state: "live" | "error"; error?: string };
interface StudioData {
  freshness: "live" | "partial" | "error" | "unknown";
  fetchedAt: string;
  sources: Source[];
  summary: BookingSummary | null;
  focus: FocusRequest | null;
}
type Preview = { state: "idle" | "loading" | "done" | "error"; text?: string };

const CANCEL_FAMILY = new Set(["cancel", "policy", "refund", "verify", "track"]);
const RELATION_AR = { contains: "يحتوي", depends_on: "يعتمد على", links_domain: "مرتبط بمجال" } as const;
const TITLE_COLOR = { gold: "#ffbf4d", cyan: "#4fe6ff", magenta: "#e27cff" } as const;

const EXPLORER = { w: 324, h: 755 };
const DETAILS = { w: 318, h: 490 };
const OTHER_DOMAINS = [
  { label: "الخدمات", screenId: "06" },
  { label: "محتوى الموقع", screenId: "07" },
  { label: "العملاء", screenId: "08" },
  { label: "التسويق والنشر", screenId: "09" },
];
const TREE_CHILDREN = [
  { label: "الحجوزات", target: "core", color: "#35e3ff" },
  { label: "الإلغاء", target: "cancel", color: "#d65cff" },
  { label: "التقييمات", target: "review", color: "#ffc94a" },
];

function sourceCount(data: StudioData | null, collection: string) {
  const s = data?.sources.find((src) => src.collection === collection);
  return s?.state === "live" ? s.totalItems : null;
}

function metricText(cluster: BookingCluster | null, data: StudioData | null): string {
  const sum = data?.summary;
  if (!data || data.freshness === "error" || data.freshness === "unknown") return "القراءة الحية غير متاحة";
  if (!cluster) {
    const hotel = sourceCount(data, "hotel_bookings");
    const general = sourceCount(data, "enquiry_bookings");
    return `فنادق ${hotel ?? "—"} · طلبات ${general ?? "—"}`;
  }
  if (!sum) return "غير متاح";
  const requests = sum.sampled - sum.cancel.none;
  switch (cluster.metric) {
    case "cancel":
    case "track":
      return `${sum.cancel.pending_admin} معلّق من ${requests}`;
    case "refund":
      return `مسترد ${sum.cancel.refunded} · فشل ${sum.cancel.refund_failed}`;
    case "verify":
      return `موافق ${sum.cancel.approved} · مرفوض ${sum.cancel.rejected}`;
    case "review": {
      const n = sourceCount(data, "hotel_guest_reviews");
      return n === null ? "غير متاح" : `${n} تقييم`;
    }
    case "confirm":
      return `${sum.confirmed} مؤكد من آخر ${sum.sampled}`;
    case "payment":
      return `${sum.paid} مدفوع من آخر ${sum.sampled}`;
    case "supplier":
      return `${sum.withSupplierRef} بمرجع مورد`;
    default:
      return "بلا مؤشر مباشر";
  }
}

export default function BookingsCancellationsStage(props: StudioStageProps) {
  const { depthLevel, zoom, panEnabled, isListening, isAgentSpeaking = false, audioFrequencies = [], onOpenScreen, onFreshness } = props;

  useStageFont();
  const outerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stage = useStageScale(outerRef);

  const [selectedId, setSelectedId] = useState<string>("cancel");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [data, setData] = useState<StudioData | null>(null);
  const [note, setNote] = useState<DataNote>({ text: "جارٍ قراءة الحجوزات والإلغاءات", tone: "loading" });
  const [preview, setPreview] = useState<Preview>({ state: "idle" });
  const [explorer, setExplorer] = useState({ open: true, min: false, expanded: true, x: 1336, y: 95 });
  const [details, setDetails] = useState({ open: true, min: false, x: 1070, y: 360 });
  const [query, setQuery] = useState("");
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    const report = (next: DataNote) => {
      if (cancelled) return;
      setNote(next);
      onFreshness?.(`الحجوزات والإلغاء · ${next.text}`);
    };
    fetch("/api/admin/automation/bookings-studio", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) return report({ text: "القراءة الحية تحتاج جلسة مشرف", tone: "denied" });
        if (!res.ok) return report({ text: "تعذر قراءة الحجوزات", tone: "error", detail: `HTTP ${res.status}` });
        const json = (await res.json()) as StudioData & { error?: string };
        if (cancelled) return;
        setData(json);
        if (json.freshness === "unknown") return report({ text: "PocketBase غير مهيأ", tone: "error", detail: json.error });
        const at = json.fetchedAt ? new Date(json.fetchedAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }) : "";
        const hotel = json.sources?.find((s) => s.collection === "hotel_bookings");
        const pending = json.summary?.cancel.pending_admin ?? 0;
        const failed = (json.sources ?? []).filter((s) => s.state === "error").map((s) => s.collection);
        report({
          text: `${json.freshness === "live" ? "بيانات حية" : "بيانات جزئية"} • معلّق ${pending} • ${at}`,
          tone: json.freshness === "live" ? "live" : "partial",
          detail: `حجوزات الفنادق: ${hotel?.totalItems ?? "—"} · طلبات إلغاء معلّقة: ${pending}${failed.length ? ` · تعذرت قراءة: ${failed.join("، ")}` : ""}`,
        });
      })
      .catch(() => report({ text: "تعذر الاتصال بخادم الحجوزات", tone: "error" }));
    return () => {
      cancelled = true;
    };
  }, [onFreshness]);

  const visible = useMemo(
    () => (depthLevel < 1 ? [] : BOOKING_CLUSTERS.filter((cl) => cl.depth <= Math.max(1, depthLevel))),
    [depthLevel]
  );
  const showItems = depthLevel >= 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const density = stage.k * dpr * Math.max(1, zoom);
    canvas.width = Math.max(1, Math.round(STAGE_W * density));
    canvas.height = Math.max(1, Math.round(STAGE_H * density));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const frame = requestAnimationFrame(() => {
      ctx.setTransform(density, 0, 0, density, 0, 0);
      paintBookingsScene(ctx, { clusters: visible, selectedId, showItems });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedId, showItems, stage.k, visible, zoom]);

  const select = (id: string, item: number | null = null) => {
    setSelectedId(id);
    setSelectedItem(item);
    setPreview({ state: "idle" });
    setDetails((d) => ({ ...d, open: true, min: false }));
  };

  useEffect(() => {
    const order = ["core", ...visible.map((cl) => cl.id)];
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "Escape") return select("cancel");
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const i = order.indexOf(selectedId);
      select(order[(i + (event.key === "ArrowDown" ? 1 : -1) + order.length) % order.length]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, visible]);

  const onScenePointerDown = (event: React.PointerEvent) => {
    if (!panEnabled || (event.target as HTMLElement).closest("button")) return;
    const sx = event.clientX;
    const sy = event.clientY;
    const origin = { ...pan };
    const move = (ev: PointerEvent) => setPan({ x: origin.x + (ev.clientX - sx) / stage.k, y: origin.y + (ev.clientY - sy) / stage.k });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const cluster = selectedId === "core" ? null : clusterById(selectedId) ?? null;
  const focus = data?.focus ?? null;
  const isCancel = !!cluster && CANCEL_FAMILY.has(cluster.id);
  const results = matchClusters(query).slice(0, 6);

  const runPreview = async () => {
    if (!focus) return;
    setPreview({ state: "loading" });
    try {
      const res = await fetch("/api/admin/automation/bookings-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", bookingId: focus.bookingId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setPreview({ state: "error", text: res.status === 401 || res.status === 403 ? "المعاينة تحتاج جلسة مشرف" : `تعذرت المعاينة (${json.error ?? res.status})` });
        return;
      }
      const p = json.preview;
      setPreview({
        state: "done",
        text: `الاسترداد المتوقع ${p.refund} ${p.currency} · رسوم ${p.fee}${p.actionable ? "" : " · الطلب ليس معلّقًا"}`,
      });
    } catch {
      setPreview({ state: "error", text: "تعذر الاتصال بالخادم" });
    }
  };

  const detailRows: [string, React.ReactNode][] = isCancel
    ? [
        [
          "الحالة",
          <span key="s" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: CANCEL_STATE_LABEL[focus?.state ?? "none"].color }}>
            {CANCEL_STATE_LABEL[focus?.state ?? "none"].text}
            <span style={{ width: 10, height: 10, borderRadius: 5, background: CANCEL_STATE_LABEL[focus?.state ?? "none"].color, boxShadow: `0 0 8px ${CANCEL_STATE_LABEL[focus?.state ?? "none"].color}` }} />
          </span>,
        ],
        ["رقم الحجز", focus?.reference ?? "—"],
        ["العميل", focus?.customer ?? "—"],
        ["سبب الإلغاء", focus?.reason ?? "—"],
        ["سياسة الإلغاء", focus?.policy ?? "—"],
      ]
    : [
        ["المعرف", cluster?.specId ?? (cluster ? `domain.03.${cluster.id}` : CORE.specId)],
        ["العلاقة", cluster ? RELATION_AR[cluster.relationType] : "جذر المجال"],
        ["الدليل", cluster?.evidenceRef ?? CORE.evidenceRef],
        ["القدرة", cluster?.capability ?? (cluster ? "قراءة" : CORE.capability)],
        ["المؤشر الحي", metricText(cluster, data)],
      ];

  const titleText = selectedItem !== null && cluster ? cluster.items[selectedItem] : cluster?.label ?? CORE.label;
  const subText = selectedItem !== null && cluster ? `ضمن ${cluster.label}` : isCancel ? "عملية تشغيلية" : cluster ? "مكوّن المجال" : "جذر مجال الحجوزات";
  const tone = cluster ? cluster.tone : "cyan";
  const DetailIcon = isCancel ? CalendarX2 : cluster?.id === "review" ? Star : cluster ? Workflow : CalendarDays;
  const stageIndex = requestStage(focus?.state ?? "none");
  const treeRow = selectedId === "core" ? 0 : isCancel ? 1 : selectedId === "review" ? 2 : -1;

  return (
    <div ref={outerRef} dir="ltr" style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#01050b", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: stage.x, top: stage.y, width: STAGE_W, height: STAGE_H, transform: `scale(${stage.k})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <div
          onPointerDown={onScenePointerDown}
          style={{ position: "absolute", inset: 0, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "690px 432px", cursor: panEnabled ? "grab" : "default" }}
        >
          <canvas ref={canvasRef} style={{ position: "absolute", left: 0, top: 0, width: STAGE_W, height: STAGE_H }} />

          {FAINT_DOMAINS.map((d) => (
            <button key={d.label} type="button" onClick={() => onOpenScreen(d.screenId)} dir="rtl" style={{ position: "absolute", left: d.at.x, top: d.at.y, transform: "translate(-50%, -50%)", fontSize: 16, color: "#8fa4b0", background: "transparent", border: 0, padding: 0, cursor: "pointer", whiteSpace: "nowrap", fontFamily: FONT }}>
              {d.label}
            </button>
          ))}

          <button type="button" aria-label={CORE.label} onClick={() => select("core")} style={{ position: "absolute", left: CORE.center.x - 70, top: CORE.center.y - 70, width: 140, height: 140, borderRadius: 70, background: "transparent", border: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <svg width="58" height="54" viewBox="0 0 58 54" style={{ marginTop: -26, filter: "drop-shadow(0 0 10px rgba(255,160,40,0.9))" }}>
              <defs>
                <linearGradient id="cal-body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffc15a" />
                  <stop offset="1" stopColor="#ff8a1c" />
                </linearGradient>
              </defs>
              <rect x="3" y="7" width="52" height="45" rx="8" fill="url(#cal-body)" stroke="#fff1d6" strokeWidth="2.2" />
              <rect x="3" y="7" width="52" height="12" rx="6" fill="#ffd488" />
              <rect x="14" y="1" width="5" height="12" rx="2.5" fill="#ffe0a3" />
              <rect x="39" y="1" width="5" height="12" rx="2.5" fill="#ffe0a3" />
              {[0, 1, 2].map((row) =>
                [0, 1, 2, 3].map((col) => <rect key={`${row}-${col}`} x={10 + col * 10} y={24 + row * 8.5} width="6.5" height="5.5" rx="1.2" fill="#5a2a05" />)
              )}
            </svg>
          </button>
          <span dir="rtl" title={focus ? `حجز ${focus.reference}` : undefined} style={{ position: "absolute", left: CORE.center.x, top: CORE.center.y + 60, transform: "translate(-50%, -50%)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", padding: "2px 12px", borderRadius: 9, background: "rgba(2,10,18,0.8)", color: "#ffffff", fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", pointerEvents: "none" }}>
            {focus ? focus.reference : CORE.label}
          </span>

          {visible.map((cl) => (
            <React.Fragment key={cl.id}>
              <button type="button" aria-label={cl.label} onClick={() => select(cl.id)} onDoubleClick={() => cl.linkScreenId && onOpenScreen(cl.linkScreenId)} style={{ position: "absolute", left: cl.hub.x - 18, top: cl.hub.y - 18, width: 36, height: 36, borderRadius: 18, background: "transparent", border: 0, cursor: "pointer" }} />
              <button
                type="button"
                onClick={() => select(cl.id)}
                dir="rtl"
                style={{
                  position: "absolute",
                  left: cl.title.right,
                  top: cl.title.y,
                  transform: "translate(-100%, -50%)",
                  fontSize: cl.title.size,
                  fontWeight: 700,
                  color: TITLE_COLOR[cl.tone],
                  textShadow: `0 0 12px ${TITLE_COLOR[cl.tone]}99`,
                  background: "transparent",
                  border: 0,
                  borderRadius: 6,
                  padding: "0 4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: FONT,
                }}
              >
                {cl.label}
              </button>
              {showItems &&
                cl.items.map((item, i) => {
                  const y = cl.bullets.ys[i];
                  const left = cl.textSide === "left";
                  const active = cl.id === selectedId && selectedItem === i;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => select(cl.id, i)}
                      dir="rtl"
                      style={{
                        position: "absolute",
                        left: left ? cl.bullets.x - 14 : cl.bullets.x + 14,
                        top: y,
                        transform: left ? "translate(-100%, -50%)" : "translateY(-50%)",
                        fontSize: 15,
                        color: active ? "#ffffff" : "#e2eef4",
                        fontWeight: active ? 700 : 500,
                        background: active ? "rgba(64,214,245,0.12)" : "transparent",
                        border: 0,
                        borderRadius: 5,
                        padding: "0 4px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        fontFamily: FONT,
                        textShadow: "0 0 6px rgba(0,0,0,0.9)",
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
            </React.Fragment>
          ))}
        </div>

        <StageHeader
          crumbs={["الحجوزات والإلغاء والتقييمات", "الحجوزات"]}
          title="الحجوزات والإلغاء والتقييمات"
          depthLevel={depthLevel}
          onSelectDepthLevel={props.onSelectDepthLevel}
          onExitHome={props.onExitHome}
          onOpenScreenSwitcher={props.onOpenScreenSwitcher}
        />

        {explorer.open && (
          <section aria-label="المستكشف" style={{ position: "absolute", left: explorer.x, top: explorer.y, width: EXPLORER.w, height: explorer.min ? 40 : EXPLORER.h, borderRadius: 12, border: "1px solid rgba(64,214,245,0.65)", background: PANEL_BG, boxShadow: "0 0 22px rgba(64,214,245,0.16)", overflow: "hidden" }}>
            <div onPointerDown={(e) => beginStageDrag(e, stage.k, explorer, (p) => setExplorer((s) => ({ ...s, ...p })), EXPLORER.w)} style={{ position: "absolute", left: 0, top: 0, right: 0, height: 40, cursor: "move" }}>
              <Grip size={18} color="#4fdcf7" style={{ position: "absolute", left: 13, top: 11 }} />
              <span dir="rtl" style={{ position: "absolute", left: 44, top: 5, fontSize: 17, fontWeight: 700, color: "#ffffff" }}>المستكشف</span>
              <button type="button" aria-label="تثبيت" style={iconBtn(188, 9)}><Pin size={16} color="#d5e7ef" /></button>
              <button type="button" aria-label="تصغير" onClick={() => setExplorer((s) => ({ ...s, min: !s.min }))} style={iconBtn(221, 9)}><Minus size={17} color="#d5e7ef" /></button>
              <button type="button" aria-label="إعادة" onClick={() => setExplorer((s) => ({ ...s, x: 1336, y: 95, expanded: true }))} style={iconBtn(255, 9)}><Square size={14} color="#d5e7ef" /></button>
              <button type="button" aria-label="إغلاق" onClick={() => setExplorer((s) => ({ ...s, open: false }))} style={iconBtn(289, 9)}><X size={17} color="#d5e7ef" /></button>
            </div>
            {!explorer.min && (
              <>
                <label style={{ position: "absolute", left: 17, top: 53, width: 289, height: 37, borderRadius: 8, border: "1px solid rgba(64,214,245,0.45)", background: "rgba(2,12,22,0.9)", display: "flex", alignItems: "center" }}>
                  <input
                    dir="rtl"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && results[0]) select(results[0].id);
                    }}
                    placeholder="البحث في المجالات..."
                    style={{ flex: 1, height: "100%", background: "transparent", border: 0, outline: "none", color: "#e6f2f8", fontSize: 15, padding: "0 10px", fontFamily: FONT }}
                  />
                  <Search size={20} color="#d5e7ef" style={{ marginRight: 12 }} />
                </label>
                {query.trim() ? (
                  <div style={{ position: "absolute", left: 17, top: 103, width: 289 }}>
                    {results.length === 0 ? (
                      <p dir="rtl" style={{ margin: 0, fontSize: 14, color: "#8fa4b0" }}>لا نتائج في هذا المجال</p>
                    ) : (
                      results.map((r) => (
                        <button key={r.id} type="button" onClick={() => select(r.id)} dir="rtl" style={{ display: "block", width: "100%", height: 38, textAlign: "right", fontSize: 16, color: TITLE_COLOR[r.tone], background: "transparent", border: 0, borderBottom: "1px solid rgba(64,214,245,0.15)", cursor: "pointer", fontFamily: FONT }}>
                          {r.label}
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => setExplorer((s) => ({ ...s, expanded: !s.expanded }))} style={{ position: "absolute", left: 17, top: 103, width: 289, height: 37, borderRadius: 6, border: "1px solid rgba(64,214,245,0.35)", background: "rgba(20,90,110,0.35)", cursor: "pointer", padding: 0 }}>
                      <span style={{ position: "absolute", left: 13, top: 8, fontSize: 13, color: "#d5e7ef", transform: explorer.expanded ? "none" : "rotate(-90deg)" }}>▼</span>
                      <span dir="rtl" style={{ position: "absolute", left: 37, top: 2, fontSize: 20, fontWeight: 700, color: "#4fe6ff", fontFamily: FONT }}>الحجوزات</span>
                    </button>
                    {explorer.expanded &&
                      TREE_CHILDREN.map((row, i) => {
                        const y = 162 + i * 40.5;
                        const active = treeRow === i;
                        return (
                          <button key={row.label} type="button" onClick={() => select(row.target)} style={{ position: "absolute", left: 30, top: y - 18, width: 270, height: 36, background: "transparent", border: 0, cursor: "pointer", padding: 0 }}>
                            <span style={{ position: "absolute", left: 10, top: 10, fontSize: 11, color: active ? "#e27cff" : "#d5e7ef" }}>▶</span>
                            {active ? <span style={{ position: "absolute", left: 32, top: 0, width: 237, height: 35, borderRadius: 6, border: `1px solid ${row.color}99`, background: `${row.color}22` }} /> : null}
                            <span style={{ position: "absolute", left: 47, top: 8, width: 18, height: 18, borderRadius: 9, border: `2.4px solid ${row.color}`, background: `radial-gradient(circle, ${row.color} 0 42%, #04141d 48%)`, boxShadow: `0 0 10px ${row.color}` }} />
                            <span dir="rtl" style={{ position: "absolute", left: 86, top: 3, fontSize: 18, color: "#ffffff", fontFamily: FONT }}>{row.label}</span>
                          </button>
                        );
                      })}
                    {OTHER_DOMAINS.map((row, i) => {
                      const y = explorer.expanded ? [295, 345, 391, 442][i] : 165 + i * 50;
                      return (
                        <button key={row.label} type="button" onClick={() => onOpenScreen(row.screenId)} style={{ position: "absolute", left: 17, top: y - 24, width: 289, height: 48, background: "transparent", border: 0, borderTop: "1px solid rgba(64,214,245,0.18)", cursor: "pointer", padding: 0 }}>
                          <span style={{ position: "absolute", left: 60, top: 17, fontSize: 11, color: "#d5e7ef" }}>▶</span>
                          <span dir="rtl" style={{ position: "absolute", left: 87, top: 10, fontSize: 18, color: "#e6f2f8", fontFamily: FONT }}>{row.label}</span>
                        </button>
                      );
                    })}
                    <span style={{ position: "absolute", left: 312, top: 25, width: 5, height: 375, borderRadius: 3, background: "rgba(120,200,225,0.35)" }} />
                  </>
                )}
              </>
            )}
          </section>
        )}

        {details.open && (
          <section aria-label="تفاصيل العنصر" style={{ position: "absolute", left: details.x, top: details.y, width: DETAILS.w, height: details.min ? 40 : DETAILS.h, borderRadius: 12, border: "1px solid rgba(64,214,245,0.7)", background: "rgba(5,19,33,0.96)", boxShadow: "0 0 22px rgba(64,214,245,0.2)", overflow: "hidden" }}>
            <div onPointerDown={(e) => beginStageDrag(e, stage.k, details, (p) => setDetails((s) => ({ ...s, ...p })), DETAILS.w)} style={{ position: "absolute", left: 0, top: 0, right: 0, height: 40, borderBottom: "1px solid rgba(64,214,245,0.25)", cursor: "move" }}>
              <Grip size={17} color="#4fdcf7" style={{ position: "absolute", left: 12, top: 11 }} />
              <span dir="rtl" style={{ position: "absolute", left: 45, top: 6, fontSize: 16, fontWeight: 700, color: "#ffffff" }}>تفاصيل العنصر</span>
              <button type="button" aria-label="تثبيت" style={iconBtn(191, 9)}><Pin size={15} color="#d5e7ef" /></button>
              <button type="button" aria-label="تصغير" onClick={() => setDetails((s) => ({ ...s, min: !s.min }))} style={iconBtn(222, 9)}><Minus size={16} color="#d5e7ef" /></button>
              <button type="button" aria-label="إعادة" onClick={() => setDetails((s) => ({ ...s, x: 1070, y: 360 }))} style={iconBtn(252, 9)}><Square size={13} color="#d5e7ef" /></button>
              <button type="button" aria-label="إغلاق" onClick={() => setDetails((s) => ({ ...s, open: false }))} style={iconBtn(286, 9)}><X size={16} color="#d5e7ef" /></button>
            </div>
            {!details.min && (
              <>
                <span style={{ position: "absolute", left: 17, top: 57, width: 51, height: 50, borderRadius: 9, border: `1.5px solid ${TONE[tone].line}aa`, background: `${TONE[tone].line}1f`, display: "grid", placeItems: "center" }}>
                  <DetailIcon size={26} color={TONE[tone].core} />
                </span>
                <span dir="rtl" style={{ position: "absolute", left: 85, top: 56, fontSize: 20, fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap" }}>{titleText}</span>
                <span dir="rtl" style={{ position: "absolute", left: 85, top: 86, fontSize: 13, color: "#9fb3be", whiteSpace: "nowrap" }}>{subText}</span>
                {detailRows.map(([label, value], i) => {
                  const y = [138, 170, 197, 230, 260][i];
                  return (
                    <React.Fragment key={label}>
                      <span style={{ position: "absolute", left: 17, top: y - 16, width: 284, height: 1, background: "rgba(64,214,245,0.16)" }} />
                      <span dir="rtl" style={{ position: "absolute", left: 20, top: y, transform: "translateY(-50%)", fontSize: 13.5, color: "#93a8b3" }}>{label}</span>
                      <span dir="rtl" title={typeof value === "string" ? value : undefined} style={{ position: "absolute", right: 21, top: y, transform: "translateY(-50%)", maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", fontSize: 14.5, color: "#eef6fa", whiteSpace: "nowrap" }}>{value}</span>
                    </React.Fragment>
                  );
                })}
                <button type="button" onClick={() => window.open("/admin/cancellations", "_blank", "noopener")} style={{ position: "absolute", left: 17, top: 295, width: 136, height: 38, borderRadius: 7, border: "1px solid rgba(64,214,245,0.5)", background: "rgba(5,28,42,0.7)", color: "#e6f2f8", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontFamily: FONT }}>
                  <span dir="rtl">سجل الطلب</span>
                  <FileText size={20} color="#d5e7ef" />
                </button>
                {isCancel ? (
                  <button type="button" disabled={!focus || preview.state === "loading"} title={focus ? "cancellation.preview · قراءة فقط" : "لا يوجد طلب إلغاء للمعاينة"} onClick={runPreview} style={{ position: "absolute", left: 167, top: 295, width: 136, height: 38, borderRadius: 7, border: "1.5px solid #4fe6ff", background: "rgba(20,90,110,0.45)", boxShadow: "0 0 12px rgba(79,230,255,0.35)", color: "#ffffff", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: focus ? "pointer" : "not-allowed", opacity: focus ? 1 : 0.55, fontFamily: FONT }}>
                    <span dir="rtl">{preview.state === "loading" ? "جارٍ المعاينة" : "معاينة الأثر"}</span>
                    <Eye size={20} color="#bff6ff" />
                  </button>
                ) : (
                  <button type="button" disabled={!cluster?.linkScreenId} onClick={() => cluster?.linkScreenId && onOpenScreen(cluster.linkScreenId)} style={{ position: "absolute", left: 167, top: 295, width: 136, height: 38, borderRadius: 7, border: "1.5px solid #4fe6ff", background: "rgba(20,90,110,0.45)", color: "#ffffff", fontSize: 15, fontWeight: 700, cursor: cluster?.linkScreenId ? "pointer" : "not-allowed", opacity: cluster?.linkScreenId ? 1 : 0.55, fontFamily: FONT }}>
                    <span dir="rtl">فتح المجال المرتبط</span>
                  </button>
                )}
                {preview.text ? (
                  <span dir="rtl" style={{ position: "absolute", left: 17, right: 17, top: 338, fontSize: 12.5, color: preview.state === "error" ? "#ff8a95" : "#bff6ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{preview.text}</span>
                ) : null}
                <span style={{ position: "absolute", left: 17, top: 352, width: 284, height: 1, background: "rgba(64,214,245,0.16)" }} />
                {isCancel ? (
                  <>
                    <span dir="rtl" style={{ position: "absolute", left: 20, top: 356, fontSize: 14, color: "#d2e1e9" }}>مراحل الطلب</span>
                    <span style={{ position: "absolute", left: 50, top: 409, width: 223, height: 2, background: "rgba(64,214,245,0.5)" }} />
                    {["استلام الطلب", "المراجعة", "القرار"].map((label, i) => {
                      const done = stageIndex === 3 || i < stageIndex - 1;
                      const active = stageIndex > 0 && stageIndex < 3 && i === stageIndex - 1;
                      const x = [50, 162, 273][i];
                      return (
                        <React.Fragment key={label}>
                          <span style={{ position: "absolute", left: x - 16, top: 394, width: 32, height: 32, borderRadius: 16, border: `2px solid ${done || active ? "#4fe6ff" : "#7d93a0"}`, background: active ? "radial-gradient(circle, #4fe6ff 0 45%, #04141d 52%)" : "#04141d", boxShadow: done || active ? "0 0 10px rgba(79,230,255,0.6)" : "none", display: "grid", placeItems: "center" }}>
                            {done ? <Check size={17} color="#bff6ff" strokeWidth={2.6} /> : null}
                          </span>
                          <span dir="rtl" style={{ position: "absolute", left: x, top: 442, transform: "translate(-50%, -50%)", fontSize: 13.5, color: active ? "#4fe6ff" : "#d2e1e9", whiteSpace: "nowrap" }}>{label}</span>
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  <span dir="rtl" style={{ position: "absolute", left: 20, right: 20, top: 362, fontSize: 13.5, color: "#b7c8d2", lineHeight: "22px", whiteSpace: "normal", textAlign: "right" }}>
                    {cluster ? cluster.items.join(" · ") : `${BOOKING_CLUSTERS.filter((c) => !c.chain).length} مكونات حول الحجز · ${metricText(null, data)}`}
                  </span>
                )}
              </>
            )}
          </section>
        )}

        <SupervisorDisc k={stage.k} cx={83} cy={757} size={132} labelTop={829} labelFont={17} variant="wave" labelPill={false} isListening={isListening} isAgentSpeaking={isAgentSpeaking} audioFrequencies={audioFrequencies} onOpen={() => onOpenScreen("20")} />

        <StageDock {...props} note={note} />
      </div>
    </div>
  );
}
