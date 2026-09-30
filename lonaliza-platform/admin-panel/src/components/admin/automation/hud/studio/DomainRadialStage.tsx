"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, Bell, Brain, Building2, CalendarDays, Car, Coins, CreditCard, Database, ExternalLink, FileText, Gift,
  Globe, Grip, Hotel, Image, KeyRound, Languages, LayoutGrid, Link2, Lock, Mail, MapPin, Megaphone, MessageCircle,
  Minus, Orbit, Package, PenTool, Percent, Pin, Plane, Plug, Receipt, RefreshCw, Rss, Scale, Search, Send, Settings,
  Share2, ShieldCheck, Smartphone, Sparkles, Square, Star, Store, Ticket, Timer, Trash2, Truck, Users, Wallet,
  Workflow, X, type LucideIcon,
} from "lucide-react";
import {
  FONT, PANEL_BG, StageDock, StageHeader, SupervisorDisc, beginStageDrag, iconBtn, useStageFont, useStageScale,
  type DataNote, type StudioStageProps,
} from "./StageFrame";
import { DOMAIN_SCREENS, normalizeArabic, type DomainIcon, type DomainItem, type DomainScreen } from "@/lib/neural-studio/domain-systems";
import { DOMAIN_CORE, HUB_R, ITEM_SIZE, MAX_ITEMS, RESERVED, TITLE_SIZE, layoutDomain } from "@/lib/neural-studio/domain-layout";
import { DOMAIN_TONE, paintDomainScene } from "@/lib/neural-studio/domain-scene";
import { STAGE_H, STAGE_W } from "@/lib/neural-studio/expansion-scene";

const ICONS: Record<DomainIcon, LucideIcon> = {
  plane: Plane, hotel: Hotel, building: Building2, car: Car, map: MapPin, package: Package, file: FileText, star: Star,
  users: Users, message: MessageCircle, shield: ShieldCheck, trash: Trash2, share: Share2, calendar: CalendarDays,
  pen: PenTool, image: Image, chart: BarChart3, rss: Rss, sparkles: Sparkles, settings: Settings, megaphone: Megaphone,
  mail: Mail, ticket: Ticket, percent: Percent, gift: Gift, brain: Brain, orbit: Orbit, timer: Timer, plug: Plug,
  link: Link2, database: Database, languages: Languages, credit: CreditCard, coins: Coins, receipt: Receipt,
  wallet: Wallet, store: Store, globe: Globe, key: KeyRound, refresh: RefreshCw, truck: Truck, scale: Scale, lock: Lock,
  smartphone: Smartphone, layout: LayoutGrid, search: Search, bell: Bell, workflow: Workflow,
};

type CollectionState = { totalItems: number | null; state: "live" | "error" | "timeout"; error?: string };
interface DomainData {
  freshness: "live" | "partial" | "error" | "unknown" | "routes_only";
  fetchedAt: string;
  collections: Record<string, CollectionState>;
  agents: { id: string; nameAr: string; enabled: boolean }[];
  error?: string;
}
type AgentTurn = { state: "idle" | "sending" | "done" | "error"; text?: string };

const SUPERVISOR = "الوكيل المشرف العام";

function itemSource(item: DomainItem) {
  if (item.collection) return { kind: "مجموعة PocketBase", ref: item.collection };
  if (item.route) return { kind: "مسار API", ref: item.route };
  return { kind: "صفحة الإدارة", ref: item.href ?? "—" };
}

function countText(data: DomainData | null, collection?: string) {
  if (!collection) return null;
  const s = data?.collections?.[collection];
  if (!s) return data ? "—" : "…";
  if (s.state === "live") return (s.totalItems ?? 0).toLocaleString("en-US");
  return s.state === "timeout" ? "مهلة" : "خطأ";
}

export default function DomainRadialStage(props: StudioStageProps & { screenId: string }) {
  const { screenId, depthLevel, zoom, panEnabled, isListening, isAgentSpeaking = false, audioFrequencies = [], onOpenScreen, onFreshness, focusNodeId, onAskAgent } = props;
  const screen = DOMAIN_SCREENS.find((s) => s.screenId === screenId) as DomainScreen;

  useStageFont();
  const outerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stage = useStageScale(outerRef);
  const layout = useMemo(() => layoutDomain(screen), [screen]);

  const [selectedId, setSelectedId] = useState<string>("core");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [data, setData] = useState<DomainData | null>(null);
  const [note, setNote] = useState<DataNote>({ text: "جارٍ قراءة أنظمة القسم", tone: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [ask, setAsk] = useState("");
  const [turn, setTurn] = useState<AgentTurn>({ state: "idle" });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [explorer, setExplorer] = useState({ open: true, min: false, x: RESERVED.explorer.x, y: RESERVED.explorer.y });
  const [details, setDetails] = useState({ open: true, min: false, x: RESERVED.details.x, y: RESERVED.details.y });
  const [agentWin, setAgentWin] = useState({ open: true, min: false, x: RESERVED.agent.x, y: RESERVED.agent.y });

  useEffect(() => {
    if (focusNodeId && screen.hubs.some((h) => h.id === focusNodeId)) {
      setSelectedId(focusNodeId);
      setSelectedItem(null);
    }
  }, [focusNodeId, screen]);

  useEffect(() => {
    let cancelled = false;
    const report = (next: DataNote) => {
      if (cancelled) return;
      setNote(next);
      onFreshness?.(`${screen.title} · ${next.text}`);
    };
    fetch(`/api/admin/automation/domain-studio?screen=${screenId}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) return report({ text: "القراءة الحية تحتاج جلسة مشرف", tone: "denied" });
        if (!res.ok) return report({ text: "تعذرت قراءة أنظمة القسم", tone: "error", detail: `HTTP ${res.status}` });
        const json = (await res.json()) as DomainData;
        if (cancelled) return;
        setData(json);
        const at = new Date(json.fetchedAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
        const states = Object.entries(json.collections ?? {});
        const live = states.filter(([, s]) => s.state === "live");
        const failed = states.filter(([, s]) => s.state !== "live").map(([n]) => n);
        const records = live.reduce((sum, [, s]) => sum + (s.totalItems ?? 0), 0);
        if (json.freshness === "unknown") return report({ text: "PocketBase غير مهيأ", tone: "error", detail: json.error });
        if (json.freshness === "routes_only") return report({ text: `مسارات API فقط · ${at}`, tone: "partial", detail: "هذا القسم لا يملك مجموعات PocketBase؛ بياناته عبر مسارات API المدرجة." });
        report({
          text: `${json.freshness === "live" ? "بيانات حية" : "بيانات جزئية"} • ${live.length}/${states.length} مجموعات • ${at}`,
          tone: json.freshness === "live" ? "live" : json.freshness === "partial" ? "partial" : "error",
          detail: `${records.toLocaleString("en-US")} سجل${failed.length ? ` · تعذرت قراءة: ${failed.join("، ")}` : ""}`,
        });
      })
      .catch(() => report({ text: "تعذر الاتصال بالخادم", tone: "error" }));
    return () => {
      cancelled = true;
    };
  }, [screenId, screen.title, onFreshness, reloadKey]);

  const showHubs = depthLevel >= 1;
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
      paintDomainScene(ctx, { layout, selectedId, showHubs, showItems, seed: 4040 + Number(screenId) });
    });
    return () => cancelAnimationFrame(frame);
  }, [layout, selectedId, showHubs, showItems, stage.k, zoom, screenId]);

  const select = useCallback((id: string, item: number | null = null) => {
    setSelectedId(id);
    setSelectedItem(item);
    setTurn({ state: "idle" });
    setDetails((d) => ({ ...d, open: true, min: false }));
  }, []);

  useEffect(() => {
    const order = ["core", ...screen.hubs.map((h) => h.id)];
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "Escape") return select("core");
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const i = order.indexOf(selectedId);
      select(order[(i + (event.key === "ArrowDown" ? 1 : -1) + order.length) % order.length]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, selectedId, select]);

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

  const hub = selectedId === "core" ? null : screen.hubs.find((h) => h.id === selectedId) ?? null;
  const item = hub && selectedItem !== null ? hub.items[selectedItem] : null;
  const tone = DOMAIN_TONE[hub?.tone ?? "cyan"];
  const agent = hub?.agentId ? data?.agents.find((a) => a.id === hub.agentId) : null;
  const agentName = agent?.nameAr ?? SUPERVISOR;
  const href = item?.href ?? hub?.href ?? screen.core.href;
  const DetailIcon = ICONS[hub?.icon ?? screen.core.icon];
  const CoreIcon = ICONS[screen.core.icon];

  const hubRecords = (items: DomainItem[]) => {
    const live = items.filter((it) => it.collection && data?.collections?.[it.collection]?.state === "live");
    if (!items.some((it) => it.collection)) return "مسارات API فقط";
    if (!data) return "…";
    return `${live.reduce((s, it) => s + (data.collections[it.collection as string].totalItems ?? 0), 0).toLocaleString("en-US")} سجل`;
  };

  const detailRows: [string, string][] = item
    ? [
        ["المصدر", itemSource(item).kind],
        ["المرجع", itemSource(item).ref],
        ["السجلات", countText(data, item.collection) ?? "يُقرأ عبر المسار"],
        ["القسم", hub?.label ?? "—"],
        ["الوكيل", agentName],
      ]
    : hub
      ? [
          ["الصفحة", hub.href],
          ["البنود", `${hub.items.length} مصادر حقيقية`],
          ["السجلات", hubRecords(hub.items)],
          ["المعرف", hub.id],
          ["الوكيل", agentName],
        ]
      : [
          ["الصفحة", screen.core.href],
          ["الأقسام", `${screen.hubs.length} أنظمة`],
          ["السجلات", hubRecords(screen.hubs.flatMap((h) => h.items))],
          ["الحالة", note.text],
          ["الوكيل", SUPERVISOR],
        ];

  const sendToAgent = async (text: string) => {
    const directive = text.trim();
    if (!directive || !onAskAgent) return;
    const scope = item ? `${hub?.label} ← ${item.label} (${itemSource(item).ref})` : hub ? `${hub.label} (${hub.href})` : `${screen.title} (${screen.core.href})`;
    setTurn({ state: "sending" });
    try {
      const reply = await onAskAgent(`[قسم: ${scope}] ${directive}`);
      setTurn({ state: "done", text: reply });
      setAsk("");
    } catch {
      setTurn({ state: "error", text: "تعذر الوصول إلى خلية الوكلاء" });
    }
  };

  const q = normalizeArabic(query);
  const results = q
    ? screen.hubs.flatMap((h) => [
        ...(normalizeArabic(h.label).includes(q) ? [{ hubId: h.id, index: null as number | null, label: h.label, tone: h.tone }] : []),
        ...h.items.map((it, i) => ({ hubId: h.id, index: i as number | null, label: `${it.label} · ${h.label}`, tone: h.tone })).filter((r) => normalizeArabic(r.label).includes(q)),
      ]).slice(0, 7)
    : [];
  const otherScreens = DOMAIN_SCREENS.filter((s) => s.screenId !== screenId);

  const windowBar = (title: string, w: number, state: { x: number; y: number }, set: (p: Partial<{ x: number; y: number; min: boolean; open: boolean }>) => void, home: { x: number; y: number }, min: boolean) => (
    <div onPointerDown={(e) => beginStageDrag(e, stage.k, state, (p) => set(p), w)} style={{ position: "absolute", left: 0, top: 0, right: 0, height: 40, borderBottom: "1px solid rgba(64,214,245,0.22)", cursor: "move" }}>
      <Grip size={17} color="#4fdcf7" style={{ position: "absolute", left: 12, top: 11 }} />
      <span dir="rtl" style={{ position: "absolute", left: 42, top: 6, fontSize: 16, fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", maxWidth: w - 150, overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
      <button type="button" aria-label="تثبيت" style={iconBtn(w - 133, 9)}><Pin size={15} color="#d5e7ef" /></button>
      <button type="button" aria-label="تصغير" onClick={() => set({ min: !min })} style={iconBtn(w - 102, 9)}><Minus size={16} color="#d5e7ef" /></button>
      <button type="button" aria-label="إعادة" onClick={() => set({ ...home, min: false })} style={iconBtn(w - 72, 9)}><Square size={13} color="#d5e7ef" /></button>
      <button type="button" aria-label="إغلاق" onClick={() => set({ open: false })} style={iconBtn(w - 38, 9)}><X size={16} color="#d5e7ef" /></button>
    </div>
  );

  return (
    <div ref={outerRef} dir="ltr" style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#01050b", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: stage.x, top: stage.y, width: STAGE_W, height: STAGE_H, transform: `scale(${stage.k})`, transformOrigin: "0 0", overflow: "hidden" }}>
        <div onPointerDown={onScenePointerDown} style={{ position: "absolute", inset: 0, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: `${DOMAIN_CORE.x}px ${DOMAIN_CORE.y}px`, cursor: panEnabled ? "grab" : "default" }}>
          <canvas ref={canvasRef} style={{ position: "absolute", left: 0, top: 0, width: STAGE_W, height: STAGE_H }} />
          <style>{`@keyframes agentFocus{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.9);opacity:0}}`}</style>

          <button type="button" aria-label={screen.core.label} onClick={() => select("core")} style={{ position: "absolute", left: DOMAIN_CORE.x - 70, top: DOMAIN_CORE.y - 70, width: 140, height: 140, borderRadius: 70, background: "transparent", border: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <CoreIcon size={50} color="#ffb13a" strokeWidth={1.8} style={{ marginTop: -24, filter: "drop-shadow(0 0 10px rgba(255,160,40,0.9))" }} />
          </button>
          <span dir="rtl" style={{ position: "absolute", left: DOMAIN_CORE.x, top: DOMAIN_CORE.y + 60, transform: "translate(-50%, -50%)", padding: "2px 12px", borderRadius: 9, background: "rgba(2,10,18,0.8)", color: "#ffffff", fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", pointerEvents: "none" }}>
            {screen.core.label}
          </span>

          {showHubs &&
            layout.map((l) => {
              const Icon = ICONS[l.hub.icon];
              const t = DOMAIN_TONE[l.hub.tone];
              const focused = focusNodeId === l.hub.id;
              const left = l.side === "left";
              return (
                <React.Fragment key={l.hub.id}>
                  {focused ? (
                    <span aria-hidden style={{ position: "absolute", left: l.at.x - HUB_R - 6, top: l.at.y - HUB_R - 6, width: (HUB_R + 6) * 2, height: (HUB_R + 6) * 2, borderRadius: "50%", border: `2px solid ${t.line}`, animation: "agentFocus 1.6s ease-out infinite", pointerEvents: "none" }} />
                  ) : null}
                  <button type="button" aria-label={l.hub.label} title={l.hub.href} onClick={() => select(l.hub.id)} onDoubleClick={() => window.open(l.hub.href, "_blank", "noopener")} style={{ position: "absolute", left: l.at.x - HUB_R, top: l.at.y - HUB_R, width: HUB_R * 2, height: HUB_R * 2, borderRadius: HUB_R, background: "transparent", border: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
                    <Icon size={24} color={t.core} strokeWidth={1.9} />
                  </button>
                  <button type="button" onClick={() => select(l.hub.id)} dir="rtl" style={{ position: "absolute", left: l.title.x, top: l.title.y, transform: left ? "translate(-100%, -50%)" : "translateY(-50%)", fontSize: TITLE_SIZE, fontWeight: 700, color: t.title, textShadow: `0 0 3px #000, 0 0 8px #000, 0 0 14px ${t.title}88`, background: "transparent", border: 0, padding: 0, cursor: "pointer", whiteSpace: "nowrap", fontFamily: FONT }}>
                    {l.hub.label}
                  </button>
                  {showItems &&
                    l.hub.items.slice(0, MAX_ITEMS).map((it, i) => {
                      const b = l.bullets[i];
                      const active = l.hub.id === selectedId && selectedItem === i;
                      const count = countText(data, it.collection);
                      return (
                        <button key={it.label} type="button" title={itemSource(it).ref} onClick={() => select(l.hub.id, i)} dir="rtl" style={{ position: "absolute", left: left ? b.x - 13 : b.x + 13, top: b.y, transform: left ? "translate(-100%, -50%)" : "translateY(-50%)", fontSize: ITEM_SIZE, color: active ? "#ffffff" : "#e2eef4", fontWeight: active ? 700 : 500, background: active ? "rgba(64,214,245,0.12)" : "transparent", border: 0, borderRadius: 5, padding: "0 4px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: FONT, textShadow: "0 0 3px #000, 0 0 7px #000" }}>
                          {it.label}
                          {count ? <span style={{ marginInlineStart: 6, fontSize: 12, color: t.title, fontFamily: "ui-monospace, monospace" }}>{count}</span> : null}
                        </button>
                      );
                    })}
                </React.Fragment>
              );
            })}
        </div>

        <StageHeader crumbs={[screen.title, item?.label ?? hub?.label ?? screen.core.label]} title={screen.title} depthLevel={depthLevel} onSelectDepthLevel={props.onSelectDepthLevel} onExitHome={props.onExitHome} onOpenScreenSwitcher={props.onOpenScreenSwitcher} />

        {agentWin.open && (
          <section aria-label="الوكيل المسؤول" style={{ position: "absolute", left: agentWin.x, top: agentWin.y, width: RESERVED.agent.w, height: agentWin.min ? 40 : RESERVED.agent.h, borderRadius: 12, border: "1px solid rgba(64,214,245,0.65)", background: PANEL_BG, boxShadow: "0 0 22px rgba(64,214,245,0.16)", overflow: "hidden" }}>
            {windowBar("الوكيل المسؤول", RESERVED.agent.w, agentWin, (p) => setAgentWin((s) => ({ ...s, ...p })), { x: RESERVED.agent.x, y: RESERVED.agent.y }, agentWin.min)}
            {!agentWin.min && (
              <div dir="rtl" style={{ position: "absolute", left: 14, right: 14, top: 50, bottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 5, background: agent && !agent.enabled ? "#7d93a0" : "#35f0a0", boxShadow: agent && !agent.enabled ? "none" : "0 0 8px #35f0a0" }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agentName}</span>
                </div>
                <span style={{ fontSize: 12.5, color: "#93a8b3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  النطاق: {item ? item.label : hub ? hub.label : screen.title}
                  {agent && !agent.enabled ? " · الوكيل معطّل، يتولى المشرف" : ""}
                </span>
                <div dir="rtl" style={{ flex: 1, minHeight: 0, overflow: "auto", fontSize: 13, lineHeight: "20px", color: turn.state === "error" ? "#ff8a95" : "#cfe3ec", whiteSpace: "pre-wrap" }}>
                  {turn.state === "sending" ? "يعمل الوكيل على الطلب…" : turn.text ?? "اكتب مهمة لهذا القسم لتصل إلى خلية الوكلاء بنطاقها."}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); void sendToAgent(ask); }} style={{ display: "flex", gap: 6, height: 36 }}>
                  <input value={ask} onChange={(e) => setAsk(e.target.value)} disabled={!onAskAgent || turn.state === "sending"} placeholder="مهمة للوكيل…" style={{ flex: 1, minWidth: 0, borderRadius: 8, border: "1px solid rgba(64,214,245,0.45)", background: "rgba(2,12,22,0.9)", color: "#e6f2f8", fontSize: 14, padding: "0 10px", outline: "none", fontFamily: FONT }} />
                  <button type="submit" aria-label="إرسال" disabled={!onAskAgent || turn.state === "sending" || !ask.trim()} style={{ width: 38, borderRadius: 8, border: "1.5px solid #4fe6ff", background: "rgba(20,90,110,0.45)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                    <Send size={17} color="#bff6ff" />
                  </button>
                </form>
              </div>
            )}
          </section>
        )}

        {explorer.open && (
          <section aria-label="المستكشف" style={{ position: "absolute", left: explorer.x, top: explorer.y, width: RESERVED.explorer.w, height: explorer.min ? 40 : RESERVED.explorer.h, borderRadius: 12, border: "1px solid rgba(64,214,245,0.65)", background: PANEL_BG, boxShadow: "0 0 22px rgba(64,214,245,0.16)", overflow: "hidden" }}>
            {windowBar("المستكشف", RESERVED.explorer.w, explorer, (p) => setExplorer((s) => ({ ...s, ...p })), { x: RESERVED.explorer.x, y: RESERVED.explorer.y }, explorer.min)}
            {!explorer.min && (
              <>
                <label style={{ position: "absolute", left: 16, top: 50, width: 292, height: 36, borderRadius: 8, border: "1px solid rgba(64,214,245,0.45)", background: "rgba(2,12,22,0.9)", display: "flex", alignItems: "center" }}>
                  <input dir="rtl" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && results[0]) select(results[0].hubId, results[0].index); }} placeholder={`البحث في ${screen.core.label}...`} style={{ flex: 1, height: "100%", background: "transparent", border: 0, outline: "none", color: "#e6f2f8", fontSize: 14.5, padding: "0 10px", fontFamily: FONT }} />
                  <Search size={19} color="#d5e7ef" style={{ marginRight: 12 }} />
                </label>
                <div dir="rtl" style={{ position: "absolute", left: 16, right: 16, top: 96, bottom: 12, overflowY: "auto", overflowX: "hidden" }}>
                  {q ? (
                    results.length === 0 ? <p style={{ margin: 0, fontSize: 14, color: "#8fa4b0" }}>لا نتائج في هذا القسم</p> : results.map((r) => (
                      <button key={`${r.hubId}-${r.index}`} type="button" onClick={() => select(r.hubId, r.index)} style={{ display: "block", width: "100%", height: 34, textAlign: "right", fontSize: 15, color: DOMAIN_TONE[r.tone].title, background: "transparent", border: 0, borderBottom: "1px solid rgba(64,214,245,0.15)", cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</button>
                    ))
                  ) : (
                    <>
                      <button type="button" onClick={() => select("core")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid rgba(64,214,245,0.35)", background: "rgba(20,90,110,0.35)", cursor: "pointer", fontFamily: FONT }}>
                        <span style={{ fontSize: 12, color: "#d5e7ef" }}>▼</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "#4fe6ff" }}>{screen.core.label}</span>
                      </button>
                      {screen.hubs.map((h) => {
                        const t = DOMAIN_TONE[h.tone];
                        const active = h.id === selectedId;
                        return (
                          <React.Fragment key={h.id}>
                            <button type="button" onClick={() => select(h.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 34, marginTop: 3, padding: "0 12px 0 6px", borderRadius: 6, border: active ? `1px solid ${t.line}99` : "1px solid transparent", background: active ? `${t.line}22` : "transparent", cursor: "pointer", fontFamily: FONT }}>
                              <span style={{ width: 15, height: 15, flex: "none", borderRadius: 8, border: `2.2px solid ${t.line}`, background: `radial-gradient(circle, ${t.line} 0 40%, #04141d 48%)`, boxShadow: `0 0 8px ${t.line}` }} />
                              <span style={{ fontSize: 15.5, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.label}</span>
                              {focusNodeId === h.id ? <span style={{ marginInlineStart: "auto", fontSize: 11, color: t.title }}>الوكيل هنا</span> : null}
                            </button>
                            {active && h.items.map((it, i) => (
                              <button key={it.label} type="button" onClick={() => select(h.id, i)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", height: 28, padding: "0 34px 0 6px", background: selectedItem === i ? "rgba(64,214,245,0.1)" : "transparent", border: 0, cursor: "pointer", fontFamily: FONT }}>
                                <span style={{ width: 8, height: 8, flex: "none", borderRadius: 4, border: `1.6px solid ${t.line}` }} />
                                <span style={{ fontSize: 13.5, color: "#cfe3ec", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
                                {it.collection ? <span style={{ marginInlineStart: "auto", fontSize: 11.5, color: t.title, fontFamily: "ui-monospace, monospace" }}>{countText(data, it.collection)}</span> : null}
                              </button>
                            ))}
                          </React.Fragment>
                        );
                      })}
                      <div style={{ height: 1, margin: "10px 0 6px", background: "rgba(64,214,245,0.2)" }} />
                      {otherScreens.map((s) => (
                        <button key={s.screenId} type="button" onClick={() => onOpenScreen(s.screenId)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", height: 30, padding: "0 6px", background: "transparent", border: 0, cursor: "pointer", fontFamily: FONT }}>
                          <span style={{ fontSize: 10, color: "#8fa4b0" }}>◀</span>
                          <span style={{ fontSize: 14, color: "#b7c8d2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {details.open && (
          <section aria-label="تفاصيل العنصر" style={{ position: "absolute", left: details.x, top: details.y, width: RESERVED.details.w, height: details.min ? 40 : RESERVED.details.h, borderRadius: 12, border: "1px solid rgba(64,214,245,0.7)", background: "rgba(5,19,33,0.96)", boxShadow: "0 0 22px rgba(64,214,245,0.2)", overflow: "hidden" }}>
            {windowBar("تفاصيل العنصر", RESERVED.details.w, details, (p) => setDetails((s) => ({ ...s, ...p })), { x: RESERVED.details.x, y: RESERVED.details.y }, details.min)}
            {!details.min && (
              <>
                <span style={{ position: "absolute", left: 16, top: 52, width: 46, height: 46, borderRadius: 9, border: `1.5px solid ${tone.line}aa`, background: `${tone.line}1f`, display: "grid", placeItems: "center" }}>
                  <DetailIcon size={24} color={tone.core} />
                </span>
                <span dir="rtl" style={{ position: "absolute", left: 74, right: 16, top: 50, fontSize: 18.5, fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "right" }}>{item?.label ?? hub?.label ?? screen.core.label}</span>
                <span dir="rtl" style={{ position: "absolute", left: 74, right: 16, top: 78, fontSize: 12.5, color: "#9fb3be", whiteSpace: "nowrap", textAlign: "right" }}>{item ? `ضمن ${hub?.label}` : hub ? "نظام فعلي في لوحة الإدارة" : screen.subtitle}</span>
                {detailRows.map(([label, value], i) => {
                  const y = 124 + i * 29;
                  return (
                    <React.Fragment key={label}>
                      <span style={{ position: "absolute", left: 16, top: y - 15, width: 292, height: 1, background: "rgba(64,214,245,0.16)" }} />
                      <span dir="rtl" style={{ position: "absolute", right: 18, top: y, transform: "translateY(-50%)", fontSize: 13, color: "#93a8b3" }}>{label}</span>
                      <span dir={/^[\x00-\x7F]+$/.test(value) ? "ltr" : "rtl"} title={value} style={{ position: "absolute", left: 18, top: y, transform: "translateY(-50%)", maxWidth: 210, overflow: "hidden", textOverflow: "ellipsis", fontSize: 13.5, color: "#eef6fa", whiteSpace: "nowrap", fontFamily: /^[\x00-\x7F]+$/.test(value) ? "ui-monospace, monospace" : FONT }}>{value}</span>
                    </React.Fragment>
                  );
                })}
                <button type="button" onClick={() => window.open(href, "_blank", "noopener")} style={{ position: "absolute", left: 16, top: 262, width: 142, height: 34, borderRadius: 7, border: "1.5px solid #4fe6ff", background: "rgba(20,90,110,0.45)", color: "#ffffff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: FONT }}>
                  <span dir="rtl">فتح النظام</span>
                  <ExternalLink size={16} color="#bff6ff" />
                </button>
                <button type="button" onClick={() => setReloadKey((k) => k + 1)} style={{ position: "absolute", left: 166, top: 262, width: 142, height: 34, borderRadius: 7, border: "1px solid rgba(64,214,245,0.5)", background: "rgba(5,28,42,0.7)", color: "#e6f2f8", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: FONT }}>
                  <span dir="rtl">تحديث القراءة</span>
                  <RefreshCw size={15} color="#d5e7ef" />
                </button>
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
