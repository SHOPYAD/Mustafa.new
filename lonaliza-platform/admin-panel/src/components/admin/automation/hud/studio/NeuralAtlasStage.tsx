"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Minus, Search, Square, X } from "lucide-react";
import { findSovereignSubModule } from "@/components/admin/automation/hud/brain/data/sovereignDomainGraph";
import {
  buildAtlasCatalog,
  findAtlasNode,
  leafAngle,
  polar,
  type AtlasDomainView,
  type AtlasLeafView,
  type AtlasProbe,
} from "@/lib/neural-studio/atlas-catalog";

const VB_W = 1040;
const VB_H = 780;
const CX = 500;
const CY = 392;
const HUB_R = 168;
const LEAF_R = 246;

interface NeuralAtlasStageProps {
  depthLevel: number;
  zoom: number;
  panEnabled: boolean;
  focusDomainId?: string | null;
  onOpenScreen: (screenId: string) => void;
  onFreshness?: (note: string) => void;
}

interface AtlasPayload {
  freshness: "partial" | "registry";
  fetchedAt: string;
  probes: AtlasProbe[];
  pocketBase: { healthy: boolean; collectionsCount: number | null; error?: string };
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function curve(x1: number, y1: number, x2: number, y2: number, bend: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  return `M ${x1} ${y1} Q ${mx + (-dy / len) * bend} ${my + (dx / len) * bend} ${x2} ${y2}`;
}

function statusLabel(status: string) {
  if (status === "online") return "متصل في السجل";
  if (status === "syncing") return "مزامنة";
  if (status === "warning") return "تحذير في السجل";
  if (status === "locked") return "مقفل";
  return "غير معروف";
}

export default function NeuralAtlasStage({
  depthLevel,
  zoom,
  panEnabled,
  focusDomainId,
  onOpenScreen,
  onFreshness,
}: NeuralAtlasStageProps) {
  const filterId = useId().replace(/:/g, "");
  const stageRef = useRef<HTMLDivElement>(null);
  const catalog = useMemo(() => buildAtlasCatalog(), []);
  const stars = useMemo(() => {
    const rand = mulberry32(11);
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: rand() * VB_W,
      y: rand() * VB_H,
      r: rand() * 1.3 + 0.3,
      o: rand() * 0.55 + 0.15,
    }));
  }, []);

  const [selectedId, setSelectedId] = useState<string>("domain.01.overview");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [payload, setPayload] = useState<AtlasPayload | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "Escape") {
        setSelectedId("domain.01.overview");
        setInspectorOpen(false);
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const ids = catalog.map((domain) => domain.id);
      const currentDomainId = findAtlasNode(catalog, selectedId)?.domain.id ?? ids[0];
      const index = Math.max(0, ids.indexOf(currentDomainId));
      const step = event.key === "ArrowLeft" ? 1 : -1;
      const next = ids[(index + step + ids.length) % ids.length];
      setSelectedId(next);
      setInspectorOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [catalog, selectedId]);

  useEffect(() => {
    if (focusDomainId && findAtlasNode(catalog, focusDomainId)) {
      setSelectedId(focusDomainId);
      setInspectorOpen(true);
    }
  }, [catalog, focusDomainId]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/automation/neural-atlas", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          setLoadState("denied");
          onFreshness?.("السجل السيادي · القراءة الحية تحتاج جلسة مشرف");
          return;
        }
        if (!res.ok) {
          setLoadState("error");
          onFreshness?.("السجل السيادي · تعذر تحديث العدّادات");
          return;
        }
        const json = (await res.json()) as AtlasPayload;
        if (cancelled) return;
        setPayload(json);
        setLoadState("ready");
        onFreshness?.(
          json.freshness === "partial"
            ? "سجل سيادي · عدّادات جزئية من PocketBase"
            : "سجل سيادي · العدّادات الحية غير متاحة"
        );
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState("error");
        onFreshness?.("السجل السيادي · تعذر الاتصال");
      });
    return () => {
      cancelled = true;
    };
  }, [onFreshness]);

  const selected = findAtlasNode(catalog, selectedId);
  const selectedDomain = selected?.domain ?? catalog[0];
  const selectedLeaf = selected?.leaf;
  const moduleRecord = selectedLeaf?.subModuleId
    ? findSovereignSubModule(selectedLeaf.subModuleId)
    : undefined;
  const probe = payload?.probes.find((item) => item.domainId === selectedDomain.id);

  const visibleDomains = catalog.filter((domain) => {
    const q = query.trim();
    if (!q) return true;
    return (
      domain.label.includes(q) ||
      domain.leaves.some((leaf) => leaf.label.includes(q))
    );
  });

  const onPointerDown = (event: React.PointerEvent) => {
    if (!panEnabled) return;
    if ((event.target as Element).closest("[data-node]")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.px + event.clientX - dragRef.current.x,
      y: dragRef.current.py + event.clientY - dragRef.current.y,
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="absolute top-[58px] bottom-[64px] left-0 right-0 overflow-hidden" dir="rtl">
      <div
        ref={stageRef}
        className="absolute bottom-0 left-0 top-0"
        style={{ right: sidebarOpen ? 300 : 0 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="h-full w-full"
            role="img"
            aria-label="الأطلس العصبي الشامل"
            style={{ fontFamily: "var(--font-ar), 'IBM Plex Sans Arabic', Tahoma, sans-serif" }}
          >
            <defs>
              <radialGradient id={`${filterId}-void`} cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#0a2a4a" stopOpacity="0.55" />
                <stop offset="55%" stopColor="#03101c" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#02070d" stopOpacity="0" />
              </radialGradient>
              <filter id={`${filterId}-glow`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id={`${filterId}-core`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffe7a3" />
                <stop offset="42%" stopColor="#f0b429" />
                <stop offset="70%" stopColor="#12324a" />
                <stop offset="100%" stopColor="#27dff4" />
              </radialGradient>
            </defs>

            <rect width={VB_W} height={VB_H} fill="#02070e" />
            <rect width={VB_W} height={VB_H} fill={`url(#${filterId}-void)`} />
            {stars.map((star) => (
              <circle key={star.id} cx={star.x} cy={star.y} r={star.r} fill="#d7f6ff" opacity={star.o} />
            ))}

            {[78, 132, 198, 286, 360].map((radius, index) => (
              <circle
                key={radius}
                cx={CX}
                cy={CY}
                r={radius}
                fill="none"
                stroke={index < 2 ? "#e7c56a" : "#27dff4"}
                strokeOpacity={index < 2 ? 0.35 : 0.22}
                strokeWidth={index === 2 ? 1.2 : 0.7}
                strokeDasharray={index % 2 === 0 ? "2 7" : "5 9"}
              />
            ))}

            {catalog.map((domain) => {
              const hub = polar(CX, CY, HUB_R, domain.angleDeg);
              const core = polar(CX, CY, 74, domain.angleDeg);
              const active = selectedDomain.id === domain.id;
              const related = selectedDomain.relatedDomainIds.includes(domain.id);
              return (
                <g key={domain.id} filter={`url(#${filterId}-glow)`}>
                  {[-16, -6, 6, 16].map((bend) => (
                    <path
                      key={bend}
                      d={curve(core.x, core.y, hub.x, hub.y, bend)}
                      fill="none"
                      stroke={bend === 6 ? "#fff6d2" : domain.color}
                      strokeWidth={active && Math.abs(bend) === 6 ? 1.8 : 0.9}
                      strokeOpacity={active || related ? 0.9 : 0.42}
                    />
                  ))}
                  {domain.leaves.map((leaf, index) => {
                    const angle = leafAngle(domain.angleDeg, index, domain.leaves.length);
                    const tip = polar(CX, CY, LEAF_R + (index % 2) * 22, angle);
                    const chosen = selectedId === leaf.id;
                    return (
                      <path
                        key={leaf.id}
                        d={curve(hub.x, hub.y, tip.x, tip.y, (index - domain.leaves.length / 2) * 4)}
                        fill="none"
                        stroke={leaf.status === "unknown" ? "#7d8b96" : domain.color}
                        strokeWidth={chosen ? 1.6 : 0.8}
                        strokeOpacity={chosen || active ? 0.9 : 0.45}
                        strokeDasharray={leaf.status === "unknown" ? "2 3" : undefined}
                      />
                    );
                  })}
                  {!reducedMotion && (
                    <circle r="2.2" fill={domain.color}>
                      <animateMotion
                        dur={`${7 + (domain.angleDeg % 5)}s`}
                        repeatCount="indefinite"
                        path={curve(core.x, core.y, hub.x, hub.y, 8)}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            <circle cx={CX} cy={CY} r="70" fill="none" stroke="#27dff4" strokeWidth="1.2" strokeOpacity="0.7" />
            <circle cx={CX} cy={CY} r="62" fill="#041018" stroke="#7ef3ff" strokeWidth="2" />
            <circle cx={CX} cy={CY} r="52" fill="none" stroke="#f0c14a" strokeWidth="1.2" />
            <circle cx={CX} cy={CY} r="46" fill="none" stroke="#f0c14a" strokeWidth="1.4" strokeDasharray="3 4" />
            <circle cx={CX} cy={CY} r="28" fill={`url(#${filterId}-core)`} />
            <path
              d={`M ${CX - 16} ${CY} Q ${CX - 8} ${CY - 10} ${CX} ${CY} T ${CX + 16} ${CY}`}
              fill="none"
              stroke="#fff4cc"
              strokeWidth="1.6"
            />
            <text
              x={CX}
              y={CY + 84}
              textAnchor="middle"
              fill="#f4fbff"
              fontSize="14"
              fontWeight="700"
              style={{ direction: "rtl" }}
              onClick={() => setSelectedId("domain.01.overview")}
            >
              الوكيل المشرف
            </text>

            {catalog.map((domain) => {
              const hub = polar(CX, CY, HUB_R, domain.angleDeg);
              const active = selectedDomain.id === domain.id;
              const anchor = domain.angleDeg > 20 && domain.angleDeg < 160 ? "middle" : Math.cos((domain.angleDeg * Math.PI) / 180) >= 0 ? "start" : "end";
              return (
                <g
                  key={`${domain.id}-label`}
                  data-node="domain"
                  onClick={() => {
                    setSelectedId(domain.id);
                    setInspectorOpen(true);
                  }}
                  onDoubleClick={() => onOpenScreen(domain.screenId)}
                  style={{ cursor: "pointer" }}
                >
                  <circle cx={hub.x} cy={hub.y} r={active ? 5 : 3.5} fill={domain.color} />
                  <text
                    x={hub.x + (anchor === "start" ? 10 : anchor === "end" ? -10 : 0)}
                    y={hub.y - 12}
                    textAnchor={anchor}
                    fill={domain.color}
                    fontSize="14"
                    fontWeight="700"
                    style={{ direction: "rtl" }}
                  >
                    {domain.label}
                  </text>
                </g>
              );
            })}

            {catalog.flatMap((domain) =>
              domain.leaves.map((leaf, index) => {
                const angle = leafAngle(domain.angleDeg, index, domain.leaves.length);
                    const tip = polar(CX, CY, LEAF_R + (index % 2) * 22, angle);
                const chosen = selectedId === leaf.id;
                const cos = Math.cos((angle * Math.PI) / 180);
                const anchor = Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";
                return (
                  <g
                    key={`${leaf.id}-label`}
                    data-node="leaf"
                    onClick={() => {
                      setSelectedId(leaf.id);
                      setInspectorOpen(true);
                    }}
                    onDoubleClick={() => onOpenScreen(leaf.screenId)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      cx={tip.x}
                      cy={tip.y}
                      r={chosen ? 3.2 : 2}
                      fill={leaf.status === "unknown" ? "#6b7780" : domain.color}
                    />
                    <text
                      x={tip.x + (anchor === "start" ? 8 : anchor === "end" ? -8 : 0)}
                      y={tip.y + 4}
                      textAnchor={anchor}
                      fill={leaf.status === "unknown" ? "#9aa8b2" : "#e7f6ff"}
                      fontSize="11"
                      style={{ direction: "rtl" }}
                    >
                      {leaf.label}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
        </div>

        {contextOpen && (
          <ContextCard
            domain={selectedDomain}
            leaf={selectedLeaf}
            depthLevel={depthLevel}
            loadState={loadState}
            probe={probe}
            fetchedAt={payload?.fetchedAt}
            onClose={() => setContextOpen(false)}
          />
        )}

        {inspectorOpen && (
          <InspectorCard
            domain={selectedDomain}
            leaf={selectedLeaf}
            depthLevel={depthLevel}
            directives={moduleRecord?.executableDirectives ?? []}
            onClose={() => setInspectorOpen(false)}
            onOpen={() => onOpenScreen((selectedLeaf || selectedDomain).screenId)}
          />
        )}

        {!contextOpen && (
          <button
            type="button"
            onClick={() => setContextOpen(true)}
            className="absolute left-4 top-4 rounded-lg border border-cyan-400/40 bg-[#061422]/90 px-3 py-1 text-xs text-cyan-200"
          >
            معلومات السياق
          </button>
        )}
      </div>

      {sidebarOpen ? (
        <Explorer
          domains={visibleDomains}
          selectedId={selectedId}
          query={query}
          onQuery={setQuery}
          onSelect={(id) => {
            setSelectedId(id);
            setInspectorOpen(true);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute bottom-4 right-4 top-4 w-10 rounded-l-xl border border-cyan-400/30 bg-[#061422]/90 text-xs text-cyan-200"
        >
          المستكشف
        </button>
      )}
    </div>
  );
}

function ContextCard({
  domain,
  leaf,
  depthLevel,
  loadState,
  probe,
  fetchedAt,
  onClose,
}: {
  domain: AtlasDomainView;
  leaf?: AtlasLeafView;
  depthLevel: number;
  loadState: string;
  probe?: AtlasProbe;
  fetchedAt?: string;
  onClose: () => void;
}) {
  const source =
    loadState === "loading"
      ? "جارٍ طلب العدّادات"
      : loadState === "denied"
        ? "جلسة المشرف مطلوبة للقراءة الحية"
        : loadState === "error"
          ? "تعذر تحديث العدّادات"
            : probe?.freshness === "live"
              ? `${probe.collection}: ${probe.totalItems}`
              : "هيكل السجل السيادي";

  return (
    <section
      className="absolute left-5 top-4 z-20 w-[280px] rounded-xl border border-[#22748b] bg-[rgba(6,22,38,0.88)] text-right shadow-[0_0_24px_rgba(39,223,244,0.15)] backdrop-blur-md"
      aria-label="معلومات السياق"
    >
      <header dir="ltr" className="flex items-center justify-between border-b border-cyan-500/20 px-3 py-2">
        <WindowButtons onClose={onClose} />
        <h2 className="text-[13px] font-semibold text-white">معلومات السياق</h2>
      </header>
      <div className="space-y-3 px-3 py-3 text-[12px] text-[#d5e8f2]">
        <Row icon="◎" label="التحديد" value={leaf?.label || domain.label} />
        <Row
          icon="✦"
          label="العلاقات"
          value={
            domain.id === "domain.01.overview" && !leaf
              ? "11 مجال رئيسي"
              : `${domain.relatedDomainIds.length} مجالات مرتبطة`
          }
        />
        <Row icon="▤" label="الطبقة" value={`L${depthLevel} · المستوى العام`} />
        <p className="text-[11px] leading-5 text-[#8facbc]">
          {source}
          {fetchedAt ? ` · ${new Date(fetchedAt).toLocaleTimeString("ar-SA")}` : ""}
        </p>
        <p className="text-[11px] leading-5 text-[#8facbc]">
          معروف في السجل: {domain.knownCount} · غير معروف: {domain.unknownCount}
        </p>
      </div>
    </section>
  );
}

function InspectorCard({
  domain,
  leaf,
  depthLevel,
  directives,
  onClose,
  onOpen,
}: {
  domain: AtlasDomainView;
  leaf?: AtlasLeafView;
  depthLevel: number;
  directives: { id: string; titleAr: string; impactLevel: string }[];
  onClose: () => void;
  onOpen: () => void;
}) {
  return (
    <section className="absolute bottom-4 left-5 z-20 w-[300px] rounded-xl border border-[#22748b] bg-[rgba(6,22,38,0.92)] text-right backdrop-blur-md">
      <header dir="ltr" className="flex items-center justify-between border-b border-cyan-500/20 px-3 py-2">
        <WindowButtons onClose={onClose} />
        <h2 className="text-[13px] font-semibold text-white">فاحص العقدة</h2>
      </header>
      <div className="space-y-2 px-3 py-3 text-[12px] text-[#d5e8f2]">
        <p className="font-semibold" style={{ color: domain.color }}>
          {leaf?.label || domain.label}
        </p>
        <p>الحالة: {leaf ? statusLabel(leaf.status) : `${domain.knownCount} معروف · ${domain.unknownCount} غير معروف`}</p>
        <p>الوكيل: {leaf?.agentNameAr || "المشرف يستعرض المجال"}</p>
        <p className="break-all text-[11px] text-[#8facbc]">
          {leaf?.readEndpoint ? `${leaf.httpMethod || "GET"} ${leaf.readEndpoint}` : "اختر عنصراً لعرض مسار القراءة"}
        </p>
        <p className="text-[11px] text-[#8facbc]">الدليل: {leaf?.evidenceRef || `screen:${domain.screenId}`}</p>
        {depthLevel >= 2 && directives.length > 0 && (
          <ul className="space-y-1 border-t border-cyan-500/15 pt-2 text-[11px]">
            {directives.slice(0, 3).map((item) => (
              <li key={item.id}>
                معاينة: {item.titleAr} · أثر {item.impactLevel}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="mt-1 w-full rounded-lg border border-cyan-400/40 py-1.5 text-[12px] text-cyan-100"
        >
          فتح واجهة القسم
        </button>
        <p className="text-[10px] leading-4 text-[#8facbc]">
          الأطلس يعرض ويعاين. الحجز والدفع والحذف والنشر لا تُنفذ من هذه اللوحة.
        </p>
      </div>
    </section>
  );
}

function Explorer({
  domains,
  selectedId,
  query,
  onQuery,
  onSelect,
  onClose,
}: {
  domains: AtlasDomainView[];
  selectedId: string;
  query: string;
  onQuery: (value: string) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <aside className="absolute bottom-0 right-0 top-0 z-30 w-[300px] border-l border-[#20546a] bg-[rgba(4,16,30,0.92)] backdrop-blur-md">
      <header dir="ltr" className="flex items-center justify-between border-b border-cyan-500/20 px-3 py-2">
        <WindowButtons onClose={onClose} />
        <h2 className="text-[13px] font-semibold text-white">المستكشف</h2>
      </header>
      <div className="px-3 py-3">
        <label className="relative block">
          <Search size={14} className="absolute right-2 top-2 text-cyan-300/70" />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="البحث في المجالات"
            className="w-full rounded-lg border border-cyan-500/30 bg-[#041018] py-1.5 pl-2 pr-7 text-right text-[12px] text-white outline-none"
          />
        </label>
        <div className="mt-3 max-h-[calc(100vh-220px)] overflow-auto">
          <p className="mb-2 text-[12px] font-bold text-cyan-200">الأطلس العصبي الشامل</p>
          {domains.length === 0 ? (
            <p className="text-[12px] text-[#8facbc]">لا مجال يطابق البحث.</p>
          ) : (
            domains.map((domain) => {
              const active = selectedId === domain.id || domain.leaves.some((leaf) => leaf.id === selectedId);
              return (
                <div key={domain.id} className="mb-1">
                  <button
                    type="button"
                    onClick={() => onSelect(domain.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-[12px]"
                    style={{
                      color: active ? "#e9f6ff" : "#b7c9d4",
                      background: selectedId === domain.id ? "rgba(39,223,244,0.12)" : "transparent",
                      border: selectedId === domain.id ? "1px solid rgba(39,223,244,0.45)" : "1px solid transparent",
                    }}
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: domain.color }} />
                    <span>{domain.label}</span>
                  </button>
                  {active &&
                    domain.leaves.map((leaf) => (
                      <button
                        key={leaf.id}
                        type="button"
                        onClick={() => onSelect(leaf.id)}
                        className="flex w-full items-center gap-2 py-0.5 pr-5 text-[11px] text-[#c5d5df]"
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: leaf.status === "unknown" ? "#6b7780" : domain.color }}
                        />
                        <span>{leaf.label}</span>
                      </button>
                    ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

function WindowButtons({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onClose} className="grid h-5 w-5 place-items-center rounded border border-cyan-400/40 text-cyan-200" aria-label="إغلاق">
        <X size={11} />
      </button>
      <span className="grid h-5 w-5 place-items-center rounded border border-cyan-400/30 text-cyan-200/70">
        <Square size={9} />
      </span>
      <span className="grid h-5 w-5 place-items-center rounded border border-cyan-400/30 text-cyan-200/70">
        <Minus size={11} />
      </span>
    </div>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white">{value}</span>
      <span className="flex items-center gap-2 text-[#9ec4d4]">
        {label}
        <span className="text-cyan-300">{icon}</span>
      </span>
    </div>
  );
}
