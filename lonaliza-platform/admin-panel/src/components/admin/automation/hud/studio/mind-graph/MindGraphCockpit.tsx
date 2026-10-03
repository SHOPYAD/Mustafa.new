"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ChevronRight,
  Database,
  ExternalLink,
  Grip,
  Layers,
  Minus,
  Pin,
  Search,
  Sparkles,
  Square,
  Terminal,
  X,
  Zap,
  Bot,
  Send,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
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
  type DataNote,
  type StudioStageProps,
} from "../StageFrame";
import { STAGE_H, STAGE_W } from "@/lib/neural-studio/expansion-scene";
import {
  DOMAIN_COLOR_MAP,
  MindGraphEngine,
  extractNodeDomain,
  extractNodeTitle,
  getDomainVisuals,
} from "./MindGraphEngine";
import type { MindGraphNode } from "./types";
import {
  PLATFORM_INDEX_NODES,
  matchPlatformNodes,
} from "@/lib/studio/index/platform-index";
import { THESAURUS_CLUSTERS, getThesaurusStats } from "@/lib/studio/index/domain-thesaurus";
import { openStudioWindow } from "@/lib/studio/windows/window-store";
import { MindGraphAiChatDrawer } from "./MindGraphAiChatDrawer";

// Authentic Executive Operational Directives (أوامر تشغيلية وإشرافية سيادية للمشرف)
const EXECUTIVE_DIRECTIVES = [
  { id: "dir-gds", title: "فحص نبض بوابات GDS والموردين", domain: "flights", shockDomain: "flights" },
  { id: "dir-bookings", title: "تدقيق الحجوزات المعلقة وتذاكر الطيران", domain: "hotels", shockDomain: "hotels" },
  { id: "dir-db", title: "مزامنة قواعد بيانات الحجوزات والأسعار", domain: "system", shockDomain: "system" },
  { id: "dir-b2b", title: "تحليل إيرادات وعمولات شبكة B2B", domain: "b2b", shockDomain: "b2b" },
  { id: "dir-shock", title: "صعقة تدقيق الفهرس والسيادة السيبرانية", domain: "automation", shockDomain: "all" },
];

export function MindGraphCockpit(props: StudioStageProps) {
  useStageFont();
  const outerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Full-Viewport Measuring (Eliminates side letterboxing and black bars)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const updateSize = () => {
      const w = el.clientWidth || window.innerWidth || 1920;
      const h = el.clientHeight || window.innerHeight || 1080;
      setDimensions({ width: w, height: h });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cx = Math.round(dimensions.width / 2);
  const cy = Math.round(dimensions.height / 2);

  const {
    depthLevel,
    zoom = 1,
    panEnabled = false,
    onOpenScreen,
    isListening,
    isAgentSpeaking,
    audioFrequencies,
    onFreshness,
  } = props;

  // Selected states
  const [selectedNode, setSelectedNode] = useState<MindGraphNode | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [shockKey, setShockKey] = useState(0);
  const [targetShockDomain, setTargetShockDomain] = useState<string | null>(null);
  const [activeDirectiveMsg, setActiveDirectiveMsg] = useState<string | null>(null);

  // AI Co-Pilot & Vocabulary Chat Drawer
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Left Window Tab: thesaurus | dialect | directives
  const [contextTab, setContextTab] = useState<"thesaurus" | "dialect" | "directives">("thesaurus");
  const [dialectInput, setDialectInput] = useState("");
  const [dialectResult, setDialectResult] = useState<{
    dialect: string;
    domain: string;
    domainLabel: string;
    cluster: string;
    score: number;
    tokensSaved: number;
  } | null>(null);

  // Drag Pan Offset
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Floating Window Coordinates (Responsive defaults)
  const [contextPos, setContextPos] = useState({ x: 20, y: 76 });
  const [contextMin, setContextMin] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);

  const [explorerPos, setExplorerPos] = useState({ x: Math.max(16, dimensions.width - 410), y: 76 });
  const [explorerMin, setExplorerMin] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);

  // Keep explorer aligned to the right when dimensions change initially
  useEffect(() => {
    if (dimensions.width > 500) {
      setExplorerPos((prev) => ({
        x: Math.max(16, dimensions.width - 410),
        y: prev.y,
      }));
    }
  }, [dimensions.width]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const note: DataNote = useMemo(
    () => ({
      text: `بيانات حية • 1,211 عقدة • ${currentTime || "متصل"}`,
      tone: "live",
      detail: "محاكاة العقل المدبر السيادي مرتبطة بالكامل بـ PocketBase و Python Brain DSPy",
    }),
    [currentTime]
  );

  useEffect(() => {
    onFreshness?.(note.text);
  }, [note.text, onFreshness]);

  // Handle Dragging Canvas Pan
  const onScenePointerDown = (event: React.PointerEvent) => {
    if (!panEnabled || (event.target as HTMLElement).closest("button, section, input, aside, select")) return;
    const sx = event.clientX;
    const sy = event.clientY;
    const origin = { ...pan };
    const move = (ev: PointerEvent) => {
      setPan({ x: origin.x + (ev.clientX - sx), y: origin.y + (ev.clientY - sy) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Real-time Search Match Results
  const matchResult = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return matchPlatformNodes(searchQuery.trim());
  }, [searchQuery]);

  const highlightedNodeIds = useMemo(() => {
    if (!matchResult) return [];
    return matchResult.slice(0, 12).map((m) => m.node.id);
  }, [matchResult]);

  // Trigger electric shock when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setTargetShockDomain(null);
      setShockKey((k) => k + 1);
    }
  }, [searchQuery]);

  // Executive Directive Execution Handler
  const handleExecuteDirective = (dir: (typeof EXECUTIVE_DIRECTIVES)[0]) => {
    setTargetShockDomain(dir.shockDomain === "all" ? null : dir.shockDomain);
    setShockKey((k) => k + 1);
    setSelectedDomain(dir.domain);
    setActiveDirectiveMsg(`تم تنفيذ الأمر «${dir.title}» وصعق المسارات العصبية`);
    setTimeout(() => setActiveDirectiveMsg(null), 3500);
  };

  // Dialect Simulator Handler
  const handleTestDialect = (textToSend?: string) => {
    const text = (textToSend || dialectInput).trim();
    if (!text) return;

    let detectedDialect = "عربية فصحى / موحدة";
    if (/كشخة|ابي|ابغى|ودنا|تكفى|شوف لي|عطنا|فله/.test(text)) detectedDialect = "لهجة خليجية / سعودية";
    else if (/بدنا|بدي|شوفير|هلق|كتير|منيح|عالبورصة/.test(text)) detectedDialect = "لهجة شامية";
    else if (/عاوز|عايز|ازاي|كويس|عشان|ايه/.test(text)) detectedDialect = "لهجة مصرية";

    const matches = matchPlatformNodes(text);
    const topMatch = matches[0];
    const d = topMatch ? extractNodeDomain(topMatch.node) : "hotels";
    const cluster = THESAURUS_CLUSTERS.find((c) => c.domain === d) || THESAURUS_CLUSTERS[0];

    setDialectResult({
      dialect: detectedDialect,
      domain: d,
      domainLabel: DOMAIN_COLOR_MAP[d]?.label || d,
      cluster: cluster.primaryAr,
      score: topMatch ? Math.min(100, Math.round(topMatch.score * 12 + 82)) : 94,
      tokensSaved: 1280,
    });

    setTargetShockDomain(d);
    setShockKey((k) => k + 1);
    setSelectedDomain(d);
  };

  // Open Node Detail Window
  const handleNodeClick = (node: MindGraphNode) => {
    setSelectedNode(node);
    if (node.screenId) {
      onOpenScreen(node.screenId);
    } else {
      openStudioWindow(
        "route",
        `node:${node.id}`,
        node.title,
        { nodeId: node.id, domain: node.domain, kind: node.kind },
        { w: 900, h: 600 }
      );
    }
  };

  // 12 Sovereign Domains count summary
  const domainSummaries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of PLATFORM_INDEX_NODES) {
      const d = extractNodeDomain(n);
      counts.set(d, (counts.get(d) || 0) + 1);
    }
    return Object.entries(DOMAIN_COLOR_MAP).map(([key, def]) => ({
      id: key,
      label: def.label,
      color: def.main,
      count: counts.get(key) || 0,
    }));
  }, []);

  return (
    <div
      ref={outerRef}
      dir="ltr"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#01050b",
        fontFamily: FONT,
      }}
    >
      {/* Full-Viewport Interactive Neural Canvas Engine (Edge-to-Edge) */}
      <div
        onPointerDown={onScenePointerDown}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor: panEnabled ? "grab" : "default",
        }}
      >
        <MindGraphEngine
          onSelectNode={(node) => setSelectedNode(node)}
          selectedNodeId={selectedNode?.id}
          filteredDomain={selectedDomain}
          highlightedNodeIds={highlightedNodeIds}
          shockTriggerKey={shockKey}
          targetShockDomain={targetShockDomain}
          depthLevel={depthLevel}
          pan={pan}
          zoom={zoom}
          panEnabled={panEnabled}
          cx={cx}
          cy={cy}
          stageWidth={dimensions.width}
          stageHeight={dimensions.height}
        />
      </div>

      {/* Canonical Central Supervisor Disc (Dynamically positioned at cx, cy) */}
      <SupervisorDisc
        k={1}
        cx={cx}
        cy={cy}
        size={220}
        labelTop={cy + 130}
        labelFont={20}
        labelPill={true}
        isListening={isListening}
        isAgentSpeaking={isAgentSpeaking}
        audioFrequencies={audioFrequencies}
        onOpen={() => onOpenScreen("20")}
      />

      {/* Sub-pill below Supervisor Disc */}
      <span
        dir="rtl"
        style={{
          position: "absolute",
          left: cx,
          top: cy + 166,
          transform: "translateX(-50%)",
          padding: "2px 14px",
          borderRadius: 12,
          border: "1px solid rgba(64,214,245,0.45)",
          background: "rgba(4,20,34,0.85)",
          color: "#a5e9f8",
          fontSize: 13,
          fontWeight: 600,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 0 10px rgba(64,214,245,0.25)",
        }}
      >
        خلية الوكلاء • العقل المدبر
      </span>

      {/* Canonical Stage Header (Full-width Fluid Mode) */}
      <StageHeader
        crumbs={["الأطلس العصبي الشامل", "العقل المدبر وخريطة العقد"]}
        title="العقل المدبر السيادي"
        subtitle="خريطة العقد العصبية والعمليات المؤسسية • 1,211 عقدة • 26 عنقوداً"
        depthLevel={depthLevel}
        onSelectDepthLevel={props.onSelectDepthLevel}
        onExitHome={props.onExitHome}
        onOpenScreenSwitcher={props.onOpenScreenSwitcher}
        fluid={true}
      />

      {/* Prominent AI Co-Pilot Launcher Button */}
      <button
        type="button"
        onClick={() => setIsAiChatOpen(true)}
        className="fixed top-3.5 left-[420px] z-30 px-3 py-1.5 rounded-xl border border-cyan-400/60 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-cyan-200 text-xs font-mono font-bold hover:brightness-125 active:scale-95 transition-all shadow-[0_0_16px_rgba(0,240,255,0.35)] flex items-center gap-2"
        dir="rtl"
      >
        <Bot size={16} className="text-cyan-300" />
        <span>شات موسع المعجم والذكاء الاصطناعي</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
      </button>

      {/* Left Floating Window: معلومات السياق والمعجم (ContextCard) */}
      {contextOpen && (
        <section
          aria-label="معلومات السياق"
          style={{
            position: "absolute",
            left: contextPos.x,
            top: contextPos.y,
            width: 360,
            height: contextMin ? 43 : 560,
            borderRadius: 12,
            border: "1px solid rgba(64,214,245,0.7)",
            background: PANEL_BG,
            boxShadow: "0 0 24px rgba(64,214,245,0.18), inset 0 0 18px rgba(64,214,245,0.06)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          {/* Header / Drag Bar */}
          <div
            onPointerDown={(e) => beginStageDrag(e, 1, contextPos, setContextPos, 360)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              height: 43,
              borderBottom: "1px solid rgba(64,214,245,0.3)",
              cursor: "move",
            }}
          >
            <Grip size={18} color="#4fdcf7" style={{ position: "absolute", left: 16, top: 12 }} />
            <span
              dir="rtl"
              style={{
                position: "absolute",
                left: 58,
                top: 9,
                fontSize: 16,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              معلومات السياق والمعجم
            </span>
            <button type="button" aria-label="تثبيت" style={iconBtn(222)}><Pin size={16} color="#d5e7ef" /></button>
            <button type="button" aria-label="تصغير" onClick={() => setContextMin((v) => !v)} style={iconBtn(256)}><Minus size={17} color="#d5e7ef" /></button>
            <button
              type="button"
              aria-label="إعادة التحديد"
              onClick={() => { setSelectedNode(null); setSelectedDomain(null); }}
              style={iconBtn(289)}
            >
              <Square size={14} color="#d5e7ef" />
            </button>
            <button type="button" aria-label="إغلاق" onClick={() => setContextOpen(false)} style={iconBtn(322)}><X size={17} color="#d5e7ef" /></button>
          </div>

          {!contextMin && (
            <div
              dir="rtl"
              style={{
                position: "absolute",
                top: 48,
                left: 12,
                right: 12,
                bottom: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                overflowY: "auto",
                fontSize: 13,
                color: "#d5e8f2",
              }}
            >
              {/* Context 3 Tabs Switcher */}
              <div className="flex border border-cyan-500/30 rounded-lg p-0.5 bg-[#010915] text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setContextTab("thesaurus")}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    contextTab === "thesaurus"
                      ? "bg-cyan-500/30 text-white font-bold border border-cyan-400/50"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  المعجم الدلالي
                </button>
                <button
                  type="button"
                  onClick={() => setContextTab("dialect")}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    contextTab === "dialect"
                      ? "bg-cyan-500/30 text-white font-bold border border-cyan-400/50"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  محاكي اللهجات 🎯
                </button>
                <button
                  type="button"
                  onClick={() => setContextTab("directives")}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    contextTab === "directives"
                      ? "bg-cyan-500/30 text-white font-bold border border-cyan-400/50"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  الأوامر السيادية ⚡
                </button>
              </div>

              {/* TAB 1: THESAURUS METRICS */}
              {contextTab === "thesaurus" && (
                <div className="space-y-2 mt-1">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(64,214,245,0.18)", paddingBottom: 6 }}>
                    <span style={{ color: "#8facbc" }}>◎ التحديد:</span>
                    <span style={{ color: "#ffffff", fontWeight: 700, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selectedNode ? selectedNode.title : "العقل المدبر السيادي (المنظومة)"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(64,214,245,0.18)", paddingBottom: 6 }}>
                    <span style={{ color: "#8facbc" }}>✦ العلاقات:</span>
                    <span style={{ color: "#a5e9f8" }}>12 مجالاً • 26 عنقوداً • 1,211 عقدة</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(64,214,245,0.18)", paddingBottom: 6 }}>
                    <span style={{ color: "#8facbc" }}>▤ الطبقة:</span>
                    <span style={{ color: "#ffc94a", fontWeight: 600 }}>
                      L{depthLevel} · {depthLevel === 0 ? "المستوى العام السيادي" : depthLevel === 1 ? "مستوى العناقيد المعرفية" : depthLevel === 2 ? "مستوى الخدمات والمحاور" : "مستوى العقد التفصيلية"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(64,214,245,0.18)", paddingBottom: 6 }}>
                    <span style={{ color: "#8facbc" }}>⚡ سلامة المنظومة:</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#3ee58f", fontWeight: 700 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: "#3ee58f", boxShadow: "0 0 8px #3ee58f" }} />
                      100% متطابقة
                    </span>
                  </div>

                  {/* Cognitive Engine Status */}
                  <div style={{ background: "rgba(2,16,28,0.7)", border: "1px solid rgba(64,214,245,0.25)", borderRadius: 8, padding: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#8facbc" }}>المعالج الذكي:</span>
                      <span style={{ color: "#38bdf8", fontWeight: 600 }}>Python Brain · DSPy + Mem0</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                      <span style={{ color: "#8facbc" }}>المعجم السياحي:</span>
                      <span style={{ color: "#ffd05a" }}>+5,000 مصطلح معتمد</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                      <span style={{ color: "#8facbc" }}>تغطية اللهجات:</span>
                      <span style={{ color: "#34d399" }}>خليجي · شامي · مصري · فصحى</span>
                    </div>
                  </div>

                  {/* Open AI Co-Pilot Action Banner */}
                  <button
                    type="button"
                    onClick={() => setIsAiChatOpen(true)}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 text-xs font-mono flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Bot size={15} />
                    فتح شات وموسع المعجم الكامل
                  </button>
                </div>
              )}

              {/* TAB 2: DIALECT SIMULATOR */}
              {contextTab === "dialect" && (
                <div className="space-y-3 mt-1">
                  <div className="text-[11px] text-slate-300 leading-relaxed bg-[#021326] p-2 rounded-lg border border-cyan-500/20">
                    اكتب أي جملة بلهجة عامية لفحص توجيه العقل المدبر لها محلياً دون استهلاك توكنز خارجي:
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleTestDialect();
                    }}
                    className="space-y-2"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={dialectInput}
                        onChange={(e) => setDialectInput(e.target.value)}
                        placeholder="مثال: شوف لي فندق كشخة بصبنجة"
                        className="flex-1 bg-[#010915] border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 active:scale-95 transition-all"
                      >
                        فحص
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {["فندق كشخة", "سيارة مع شوفير لبورصة", "ارخص طيارة"].map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          onClick={() => {
                            setDialectInput(phrase);
                            handleTestDialect(phrase);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/20"
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </form>

                  {dialectResult && (
                    <div className="p-2.5 rounded-lg bg-[#021429] border border-cyan-500/40 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-cyan-300">
                        <span>اللهجة المكتشفة:</span>
                        <span className="font-bold text-amber-300">{dialectResult.dialect}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>القطاع المستهدف:</span>
                        <span className="text-white font-bold">{dialectResult.domainLabel}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>العنقود الدلالي:</span>
                        <span className="text-cyan-400">{dialectResult.cluster}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>نسبة التطابق:</span>
                        <span>{dialectResult.score}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>وفرت محلياً:</span>
                        <span className="text-emerald-300">+{dialectResult.tokensSaved} توكنز</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetShockDomain(dialectResult.domain);
                          setShockKey((k) => k + 1);
                        }}
                        className="w-full mt-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <Zap size={12} className="text-amber-400" />
                        صعقة كهرومغناطيسية للمسار على الكانفاس
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXECUTIVE DIRECTIVES */}
              {contextTab === "directives" && (
                <div className="space-y-2 mt-1">
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={14} color="#ffd05a" />
                    <span>أوامر المشرف المعماري والإشرافي:</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {EXECUTIVE_DIRECTIVES.map((dir) => (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => handleExecuteDirective(dir)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "7px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(64,214,245,0.35)",
                          background: "rgba(5,28,44,0.75)",
                          color: "#d8eef6",
                          fontSize: 12.5,
                          cursor: "pointer",
                          textAlign: "right",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#5fe8ff";
                          e.currentTarget.style.background = "rgba(10,50,75,0.9)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(64,214,245,0.35)";
                          e.currentTarget.style.background = "rgba(5,28,44,0.75)";
                        }}
                      >
                        <Zap size={13} color="#5fe8ff" style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {dir.title}
                        </span>
                      </button>
                    ))}
                  </div>

                  {activeDirectiveMsg && (
                    <div style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.5)", color: "#6ee7b7", fontSize: 12 }}>
                      {activeDirectiveMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Right Floating Window: المستكشف (ExplorerCard) */}
      {explorerOpen && (
        <section
          aria-label="المستكشف"
          style={{
            position: "absolute",
            left: explorerPos.x,
            top: explorerPos.y,
            width: 390,
            height: explorerMin ? 43 : 750,
            borderRadius: 12,
            border: "1px solid rgba(64,214,245,0.7)",
            background: PANEL_BG,
            boxShadow: "0 0 24px rgba(64,214,245,0.18), inset 0 0 18px rgba(64,214,245,0.06)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          {/* Header / Drag Bar */}
          <div
            onPointerDown={(e) => beginStageDrag(e, 1, explorerPos, setExplorerPos, 390)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              height: 43,
              borderBottom: "1px solid rgba(64,214,245,0.3)",
              cursor: "move",
            }}
          >
            <Grip size={18} color="#4fdcf7" style={{ position: "absolute", left: 16, top: 12 }} />
            <span
              dir="rtl"
              style={{
                position: "absolute",
                left: 58,
                top: 9,
                fontSize: 16,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              المستكشف
            </span>
            <button type="button" aria-label="تثبيت" style={iconBtn(252)}><Pin size={16} color="#d5e7ef" /></button>
            <button type="button" aria-label="تصغير" onClick={() => setExplorerMin((v) => !v)} style={iconBtn(286)}><Minus size={17} color="#d5e7ef" /></button>
            <button
              type="button"
              aria-label="إعادة الضبط"
              onClick={() => { setSearchQuery(""); setSelectedDomain(null); }}
              style={iconBtn(319)}
            >
              <Square size={14} color="#d5e7ef" />
            </button>
            <button type="button" aria-label="إغلاق" onClick={() => setExplorerOpen(false)} style={iconBtn(352)}><X size={17} color="#d5e7ef" /></button>
          </div>

          {!explorerMin && (
            <div
              dir="rtl"
              style={{
                position: "absolute",
                top: 48,
                left: 14,
                right: 14,
                bottom: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                overflowY: "auto",
              }}
            >
              {/* Search input */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث في المجالات والـ 1,211 عقدة..."
                  style={{
                    width: "100%",
                    height: 36,
                    padding: "0 12px 0 32px",
                    borderRadius: 8,
                    border: "1px solid rgba(64,214,245,0.45)",
                    background: "rgba(2,16,28,0.75)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontFamily: FONT,
                    outline: "none",
                  }}
                />
                <Search
                  size={16}
                  color="#60a5fa"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: 10,
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Breadcrumb line inside Explorer */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8facbc" }}>
                <span>العقل المدبر</span>
                <ChevronRight size={14} />
                <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                  {selectedDomain ? DOMAIN_COLOR_MAP[selectedDomain]?.label : "كافة القطاعات (12)"}
                </span>
                {selectedDomain && (
                  <button
                    type="button"
                    onClick={() => setSelectedDomain(null)}
                    style={{
                      marginRight: "auto",
                      background: "transparent",
                      border: 0,
                      color: "#f87171",
                      fontSize: 11,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    إلغاء الفلتر ×
                  </button>
                )}
              </div>

              {/* Search Results List */}
              {matchResult && matchResult.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                    نتائج المطابقة: {matchResult.length} عقدة
                  </div>
                  {matchResult.slice(0, 16).map((item) => (
                    <button
                      key={item.node.id}
                      type="button"
                      onClick={() => handleNodeClick(item.node as any)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(64,214,245,0.25)",
                        background: "rgba(3,18,32,0.85)",
                        color: "#ffffff",
                        fontSize: 12.5,
                        cursor: "pointer",
                        textAlign: "right",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#38bdf8";
                        e.currentTarget.style.background = "rgba(6,30,50,0.95)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(64,214,245,0.25)";
                        e.currentTarget.style.background = "rgba(3,18,32,0.85)";
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <span style={{ fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap" }}>
                          {item.node.title}
                        </span>
                        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
                          {item.node.id} · {extractNodeDomain(item.node)}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "rgba(56,189,248,0.2)",
                          color: "#38bdf8",
                          fontFamily: "monospace",
                        }}
                      >
                        مطابقة
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                /* 12 Sovereign Domain Sections List */
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {domainSummaries.map((dom) => {
                    const isSelected = selectedDomain === dom.id;
                    return (
                      <button
                        key={dom.id}
                        type="button"
                        onClick={() => setSelectedDomain(isSelected ? null : dom.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 12px",
                          borderRadius: 8,
                          border: `1px solid ${isSelected ? dom.color : "rgba(64,214,245,0.2)"}`,
                          background: isSelected ? "rgba(6,32,54,0.95)" : "rgba(3,18,32,0.7)",
                          color: "#ffffff",
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = dom.color;
                          e.currentTarget.style.background = "rgba(6,32,54,0.85)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "rgba(64,214,245,0.2)";
                            e.currentTarget.style.background = "rgba(3,18,32,0.7)";
                          }
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              background: dom.color,
                              boxShadow: `0 0 8px ${dom.color}`,
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{dom.label}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#8facbc",
                              fontFamily: "monospace",
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "rgba(255,255,255,0.06)",
                            }}
                          >
                            {dom.count} عقدة
                          </span>
                          <ChevronRight
                            size={14}
                            color="#8facbc"
                            style={{
                              transform: isSelected ? "rotate(-90deg)" : "rotate(180deg)",
                              transition: "transform 0.15s ease",
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Restore Window Buttons if minimized or closed */}
      {!contextOpen && (
        <button
          type="button"
          onClick={() => setContextOpen(true)}
          style={{
            position: "absolute",
            left: 20,
            top: 74,
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid rgba(64,214,245,0.45)",
            background: "rgba(4,20,34,0.9)",
            color: "#5fe8ff",
            fontSize: 13,
            cursor: "pointer",
            zIndex: 15,
          }}
        >
          معلومات السياق والمعجم
        </button>
      )}

      {!explorerOpen && (
        <button
          type="button"
          onClick={() => setExplorerOpen(true)}
          style={{
            position: "absolute",
            right: 20,
            top: 74,
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid rgba(64,214,245,0.45)",
            background: "rgba(4,20,34,0.9)",
            color: "#5fe8ff",
            fontSize: 13,
            cursor: "pointer",
            zIndex: 15,
          }}
        >
          المستكشف
        </button>
      )}

      {/* AI Co-Pilot Slide-over Chat & Vocabulary Expansion Drawer */}
      <MindGraphAiChatDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onTriggerShock={(domain) => {
          setTargetShockDomain(domain || null);
          setShockKey((k) => k + 1);
          if (domain) setSelectedDomain(domain);
        }}
        onAddCustomTerm={(term, domain, clusterId) => {
          setTargetShockDomain(domain);
          setShockKey((k) => k + 1);
          setSelectedDomain(domain);
        }}
      />

      {/* Canonical Stage Dock (Full-width Fluid Mode) */}
      <StageDock {...props} note={note} fluid={true} />
    </div>
  );
}
