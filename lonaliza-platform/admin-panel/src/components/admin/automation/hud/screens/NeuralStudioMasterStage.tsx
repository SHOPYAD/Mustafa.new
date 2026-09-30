"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Cpu,
  Layers,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plane,
  Building2,
  Car,
  Palmtree,
  CreditCard,
  TrendingUp,
  Share2,
  Smartphone,
  ShieldCheck,
  Sliders,
  RefreshCw,
  Play,
  Eye,
  GitBranch,
  Orbit,
  MessageSquare,
  Send,
  Radio,
  FileText,
  Terminal,
  Settings,
  Database,
  Volume2,
  Mic,
  Video,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Pin,
  X,
  ExternalLink,
  Code,
  Laptop,
  Check,
  Clock,
  ArrowUpRight,
  Shield,
  HelpCircle,
  Hash,
  Lock,
  Users,
  Globe,
  Download,
  Printer,
  QrCode,
  Key,
  Receipt,
  Scale,
} from "lucide-react";
import { STUDIO_SCREENS, StudioScreenDef } from "./screensData";
import HumanoidMasterAvatar from "../avatar/HumanoidMasterAvatar";

interface NeuralStudioMasterStageProps {
  currentScreenId: string;
  depthLevel: number; // 0: Atlas, 1: Domain, 2: Microservice, 3: Action
  onSelectScreen: (screenId: string) => void;
  onOpenMcpDispatcher: () => void;
  onOpenReferenceImage: () => void;
  voiceFrequencies?: number[];
  isSpeaking?: boolean;
}

export default function NeuralStudioMasterStage({
  currentScreenId,
  depthLevel,
  onSelectScreen,
  onOpenMcpDispatcher,
  onOpenReferenceImage,
  voiceFrequencies = [],
  isSpeaking = false,
}: NeuralStudioMasterStageProps) {
  const currentScreen = useMemo(() => {
    return (
      STUDIO_SCREENS.find((s) => s.id === currentScreenId) ||
      STUDIO_SCREENS[0]
    );
  }, [currentScreenId]);

  // General Interactive States
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"details" | "trace" | "schema">(
    "details"
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["01-0", "01-1"])
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [liveLog, setLiveLog] = useState<string[]>([]);

  // Screen 04: Aviation JSON viewer state
  const [gdsResponseTab, setGdsResponseTab] = useState<"json" | "headers" | "latency">("json");
  const [flightMargin, setFlightMargin] = useState<number>(18);

  // Screen 07: CMS preview device mode
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile" | "pwa">("desktop");

  // Screen 08: Live Chat draft
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "agent"; text: string; time: string }>
  >([
    {
      sender: "user",
      text: "السلام عليكم، هل يوجد حجز متاح لفندق السويس أوتيل في إسطنبول لعائلة مكونة من 4 أشخاص في شهر يوليو القادم؟",
      time: "02:14 م",
    },
    {
      sender: "agent",
      text: "وعليكم السلام ورحمة الله وبركاته! نعم يا سيدي، متوفر جناح عائلي مطل على البوسفور مباشرة مع إفطار مجاني بسعر تفضيلي عبر بنك الأسرة.",
      time: "02:15 م",
    },
  ]);

  // Screen 10: Ad budget slider
  const [adBudget, setAdBudget] = useState<number>(4500);

  // Screen 17: Voice state switcher
  const [simulatedVoiceState, setSimulatedVoiceState] = useState<
    "idle" | "listening" | "deliberating" | "speaking" | "executing" | "interrupted"
  >("deliberating");

  // Screen 16: SMTP Test feedback
  const [smtpTesting, setSmtpTesting] = useState<boolean>(false);
  const [smtpResult, setSmtpResult] = useState<string | null>(null);

  // Screen 13: Finance & Invoices
  const [activeInvoiceFilter, setActiveInvoiceFilter] = useState<"all" | "settled" | "pending" | "refunds">("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("INV-2026-9042");

  // Screen 14: B2B Reselling & White-Label
  const [selectedB2BAgency, setSelectedB2BAgency] = useState<string>("east-rides");
  const [b2bMarkupPct, setB2bMarkupPct] = useState<number>(10);

  // Screen 15: Compliance & Security
  const [complianceScanRunning, setComplianceScanRunning] = useState<boolean>(false);
  const [complianceScanResult, setComplianceScanResult] = useState<string | null>(null);

  // Screen 18: Window Manager
  const [workspaceLayoutMode, setWorkspaceLayoutMode] = useState<"quad" | "horizontal" | "vertical" | "freeform">("quad");

  // Reset node selection when screen changes
  useEffect(() => {
    setSelectedNodeIndex(0);
    setActiveTab("details");
  }, [currentScreenId]);

  // Periodic simulated live ticks
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().toLocaleTimeString("ar-SA");
      setLiveLog((prev) => [
        `[${now}] نبضة سيبرانية مستقرة — مزامنة العقدة (${currentScreen.nodes[selectedNodeIndex] || "المشرف"})`,
        ...prev.slice(0, 15),
      ]);
    }, 7000);
    return () => clearInterval(timer);
  }, [currentScreen, selectedNodeIndex]);

  // Handle expanding nodes
  const toggleNodeExpansion = (nodeKey: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeKey)) next.delete(nodeKey);
      else next.add(nodeKey);
      return next;
    });
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    const now = new Date().toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: chatMessage, time: now },
    ]);
    const userQuery = chatMessage;
    setChatMessage("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: `أهلاً بك! تم استيعاب طلبكم: "${userQuery}". جاري التنسيق الفوري مع محرك التوافر وإصدار العرض المخصص.`,
          time: new Date().toLocaleTimeString("ar-SA", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 900);
  };

  const handleTestSmtp = () => {
    setSmtpTesting(true);
    setSmtpResult(null);
    setTimeout(() => {
      setSmtpTesting(false);
      setSmtpResult("تم الاتصال بخادم SMTP بنجاح عبر TLS المنفذ 587 (زمن الاستجابة 84ms) — الرسالة التجريبية أُرسلت للمشرف.");
    }, 1200);
  };

  return (
    <div
      data-screen={currentScreen.id}
      className="relative w-full h-full flex flex-col overflow-hidden bg-[#020c17] select-none text-right font-sans"
    >
      {/* Visual Canvas Stage / Screens Switcher */}
      <div className="relative flex-1 w-full min-h-0 overflow-hidden flex flex-col">
        {/* ========================================================================= */}
        {/* SCREEN 01 & 02: NEURAL ATLAS & CUMULATIVE EXPANSION (Radial Topology)      */}
        {/* ========================================================================= */}
        {(currentScreen.id === "01" || currentScreen.id === "02") && (
          <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
            {/* Ambient Background Grid & Stars */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,255,0.06)_0%,rgba(2,12,23,0.98)_80%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#02203615_1px,transparent_1px),linear-gradient(to_bottom,#02203615_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* SVG Holographic Radial Matrix */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-auto"
              viewBox="0 0 1400 820"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="supervisorCoreGrad">
                  <stop offset="0%" stopColor="#dbffff" />
                  <stop offset="15%" stopColor="#22e5ff" />
                  <stop offset="50%" stopColor="#025263" />
                  <stop offset="100%" stopColor="#04121c" />
                </radialGradient>
              </defs>

              {/* Concentric Orbital Rings */}
              <circle cx="700" cy="410" r="160" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4 8" fill="none" opacity="0.35" />
              <circle cx="700" cy="410" r="250" stroke="#00e5ff" strokeWidth="1.2" strokeDasharray="6 12" fill="none" opacity="0.25" />
              <circle cx="700" cy="410" r="340" stroke="#f4c46d" strokeWidth="0.8" strokeDasharray="3 9" fill="none" opacity="0.3" />

              {/* Radial Energy Lines Connecting Core to Nodes */}
              {currentScreen.nodes.map((node, i) => {
                const total = currentScreen.nodes.length;
                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / total;
                const radius = currentScreen.id === "02" && depthLevel >= 1 ? 310 : 260;
                const x = 700 + Math.cos(angle) * radius;
                const y = 410 + Math.sin(angle) * radius;
                const isSelected = selectedNodeIndex === i;

                return (
                  <g key={`edge-${i}`}>
                    <line
                      x1="700"
                      y1="410"
                      x2={x}
                      y2={y}
                      stroke={isSelected ? "#00e5ff" : "#0f4a5c"}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={isSelected ? "none" : "3 3"}
                      opacity={isSelected ? 0.9 : 0.4}
                      filter={isSelected ? "url(#cyanGlow)" : undefined}
                    />
                  </g>
                );
              })}

              {/* Central Glowing Supervisor Orb */}
              <g
                transform="translate(700 410)"
                className="cursor-pointer group"
                onClick={() => setSelectedNodeIndex(-1)}
              >
                <circle r="88" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.6" className="animate-spin-slow" />
                <circle r="74" fill="none" stroke="#f4c46d" strokeWidth="1.5" opacity="0.7" />
                <circle r="60" fill="url(#supervisorCoreGrad)" filter="url(#cyanGlow)" />
                <circle r="56" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
                <text y="-6" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="15" className="font-mono">
                  المشرف
                </text>
                <text y="16" textAnchor="middle" fill="#27dff4" fontSize="10" fontWeight="600" className="font-mono">
                  SUPERVISOR L0
                </text>
              </g>

              {/* Radial Domain Nodes */}
              {currentScreen.nodes.map((node, i) => {
                const total = currentScreen.nodes.length;
                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / total;
                const radius = currentScreen.id === "02" && depthLevel >= 1 ? 310 : 260;
                const x = 700 + Math.cos(angle) * radius;
                const y = 410 + Math.sin(angle) * radius;
                const isSelected = selectedNodeIndex === i;

                return (
                  <g
                    key={`node-${i}`}
                    transform={`translate(${x} ${y})`}
                    className="cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => setSelectedNodeIndex(i)}
                  >
                    <rect
                      x="-78"
                      y="-28"
                      width="156"
                      height="56"
                      rx="12"
                      fill={isSelected ? "#031d33" : "#021220"}
                      stroke={isSelected ? "#00e5ff" : "#1a5369"}
                      strokeWidth={isSelected ? 2 : 1}
                      filter={isSelected ? "url(#cyanGlow)" : undefined}
                    />
                    <circle cx="62" cy="-14" r="3.5" fill={isSelected ? "#00e5ff" : "#f4c46d"} />
                    <text
                      y="-2"
                      textAnchor="middle"
                      fill={isSelected ? "#ffffff" : "#c4e5f2"}
                      fontSize="13"
                      fontWeight="bold"
                    >
                      {node}
                    </text>
                    <text
                      y="16"
                      textAnchor="middle"
                      fill={isSelected ? "#27dff4" : "#6898a8"}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {currentScreen.id === "02" ? `L${depthLevel} · DOMAIN` : `DOMAIN 0${i + 1}`}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Left Operational Context & Inspector Panels */}
            <div className="absolute left-6 top-6 bottom-6 w-96 flex flex-col gap-4 pointer-events-auto z-10">
              {/* Node Inspector Panel */}
              <div className="flex-1 bg-[#020d1c]/95 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff] animate-pulse" />
                    <span className="font-bold text-white text-sm">فاحص العقدة (Inspector)</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    LIVE L{depthLevel}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 my-3 bg-[#010814] p-1 rounded-xl shrink-0">
                  {(["details", "trace", "schema"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        activeTab === tab
                          ? "bg-cyan-500 text-black shadow-[0_0_12px_#00e5ff]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab === "details" ? "التفاصيل" : tab === "trace" ? "التتبع" : "العقد (Schema)"}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar text-xs">
                  {activeTab === "details" && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-[#031427] border border-cyan-500/20">
                        <div className="text-slate-400 text-[11px]">اسم العقدة المحددة</div>
                        <div className="text-white font-bold text-sm mt-0.5">
                          {selectedNodeIndex === -1
                            ? "الوكيل المشرف العام (Lonaliza Sovereign Supervisor)"
                            : currentScreen.nodes[selectedNodeIndex] || "العقدة المركزية"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2.5 rounded-xl bg-[#010a17] border border-cyan-500/20">
                          <span className="text-slate-400 block">حالة الاتصال</span>
                          <span className="text-emerald-400 font-bold">متصل حياً (100%)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#010a17] border border-cyan-500/20">
                          <span className="text-slate-400 block">زمن الاستجابة</span>
                          <span className="text-cyan-300 font-bold">42ms Ultra Low</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#031427] border border-cyan-500/20 text-slate-300 text-[11px] leading-relaxed">
                        <span className="text-cyan-400 font-bold block mb-1">السيناريو التشغيلي:</span>
                        {currentScreen.scenario}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={onOpenMcpDispatcher}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_#00e5ff] active:scale-95 transition-all"
                        >
                          <Zap size={14} className="fill-black" />
                          <span>تنفيذ إجراء عبر أداة MCP</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "trace" && (
                    <div className="space-y-2 text-[11px] font-mono">
                      <div className="text-slate-400 pb-1">سجل الأحداث والنبضات العصبية:</div>
                      {liveLog.length === 0 ? (
                        <div className="p-3 rounded-xl bg-[#010814] text-slate-500 text-center">
                          جاري استماع النبضات الحية...
                        </div>
                      ) : (
                        liveLog.map((log, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[#010916] border border-cyan-500/15 text-cyan-300/90 text-[10px]">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "schema" && (
                    <div className="space-y-2 font-mono text-[11px]" dir="ltr">
                      <div className="text-slate-400">Payload Contract Schema:</div>
                      <pre className="p-3 rounded-xl bg-[#010610] border border-cyan-500/30 text-emerald-300 text-[10px] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(
                          {
                            screenId: currentScreen.id,
                            slug: currentScreen.slug,
                            layout: currentScreen.layout,
                            depthLevel,
                            capabilities: currentScreen.capabilities,
                            fields: currentScreen.fields,
                            activeNode:
                              selectedNodeIndex === -1
                                ? "supervisor"
                                : currentScreen.nodes[selectedNodeIndex],
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Jump to Related Screens */}
              <div className="h-28 bg-[#020d1c]/90 border border-cyan-500/30 rounded-2xl p-3 shadow-lg flex flex-col justify-between shrink-0">
                <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                  <span>المسارات المترابطة (Cross Links):</span>
                  <span className="text-[10px] text-cyan-400">{currentScreen.links.length} شاشات</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {currentScreen.links.map((linkId) => (
                    <button
                      key={linkId}
                      onClick={() => onSelectScreen(linkId)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono shrink-0 transition-all hover:border-cyan-400"
                    >
                      واجهة {linkId} ↗
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 03: BOOKINGS & CANCELLATIONS DAG                                    */}
        {/* ========================================================================= */}
        {currentScreen.id === "03" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#031326] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">الحجوزات المؤكدة اليوم</span>
                <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">38 حجزاً</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">+14% مقارنة بالأمس</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#031326] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">قيمة العمليات اليومية</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">$307,420</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">تسوية لحظية عبر البنوك</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#031326] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">طلبات الإلغاء المعلقة</span>
                <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">2 طلبات</span>
                <span className="text-[10px] text-amber-300 font-mono mt-1 block">تحت فحص سياسة الغرامة</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#031326] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">مؤشر رضا النزلاء</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">96.8%</span>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">تقييمات TripAdvisor موثقة</span>
              </div>
            </div>

            {/* Horizontal DAG Workflow Stepper */}
            <div className="p-6 rounded-2xl bg-[#020f21] border border-cyan-500/40 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <GitBranch className="text-cyan-400" size={18} />
                  <span className="font-bold text-white text-sm">
                    مسار تدفق الحجز والإلغاء (DAG Execution Pipeline)
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400">BOOKING FLOW v4.2</span>
              </div>

              <div className="grid grid-cols-5 gap-3 relative py-4">
                {[
                  { step: "01", name: "استلام الطلب", status: "مكتمل", icon: Building2, color: "text-emerald-400", bg: "border-emerald-500/40" },
                  { step: "02", name: "فحص التوافر المسبق", status: "مكتمل", icon: CheckCircle2, color: "text-emerald-400", bg: "border-emerald-500/40" },
                  { step: "03", name: "التفويض المالي والخصم", status: "مكتمل", icon: CreditCard, color: "text-emerald-400", bg: "border-emerald-500/40" },
                  { step: "04", name: "إصدار PNR ومزامنة المورد", status: "نشط الآن", icon: RefreshCw, color: "text-cyan-400", bg: "border-cyan-400 shadow-[0_0_15px_#00e5ff]" },
                  { step: "05", name: "سياسة الإلغاء والتسوية", status: "جاهز", icon: ShieldCheck, color: "text-slate-400", bg: "border-slate-700" },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.step}
                      className={`p-4 rounded-xl bg-[#010917] border ${s.bg} flex flex-col gap-2 relative transition-all hover:scale-105`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{s.step}</span>
                        <Icon size={16} className={s.color} />
                      </div>
                      <div className="text-xs font-bold text-white">{s.name}</div>
                      <div className={`text-[10px] font-mono ${s.color}`}>{s.status}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bookings & Cancellation Table */}
            <div className="flex-1 min-h-[300px] p-5 rounded-2xl bg-[#020e1f] border border-cyan-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">سجل العمليات التشغيلية المباشرة</span>
                <button
                  onClick={onOpenMcpDispatcher}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/25 transition-all"
                >
                  استدعاء أداة استعلام الحجوزات ↗
                </button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-cyan-500/20 text-slate-400 font-mono">
                      <th className="py-2.5 px-3">رقم الحجز</th>
                      <th className="py-2.5 px-3">العميل</th>
                      <th className="py-2.5 px-3">الخدمة</th>
                      <th className="py-2.5 px-3">المبلغ</th>
                      <th className="py-2.5 px-3">حالة الإلغاء</th>
                      <th className="py-2.5 px-3">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/10">
                    <tr className="hover:bg-cyan-500/5">
                      <td className="py-3 px-3 font-mono text-cyan-300">#BK-90412</td>
                      <td className="py-3 px-3 text-white font-bold">محمد عبد الله القحطاني</td>
                      <td className="py-3 px-3 text-slate-300">سويس أوتيل البوسفور (3 ليالٍ)</td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">$1,240</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          مؤكد · غير قابل للإلغاء
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={onOpenMcpDispatcher}
                          className="px-2 py-1 rounded bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/30 text-[11px]"
                        >
                          معاينة السياسة
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-cyan-500/5">
                      <td className="py-3 px-3 font-mono text-cyan-300">#BK-90413</td>
                      <td className="py-3 px-3 text-white font-bold">سارة أحمد المنصوري</td>
                      <td className="py-3 px-3 text-slate-300">طيران الإمارات (دبي - طرابزون)</td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">$840</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          طلب إلغاء معلق (غرامة $100)
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={onOpenMcpDispatcher}
                          className="px-2 py-1 rounded bg-rose-500/15 text-rose-300 hover:bg-rose-500/30 text-[11px]"
                        >
                          اعتماد الاسترداد
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 04: FLIGHTS & GDS ENGINEERING CIRCUIT                              */}
        {/* ========================================================================= */}
        {currentScreen.id === "04" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* GDS Gateways Status Bar */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: "Travelport Universal API", ping: "94ms", status: "ONLINE", margin: "+18%", pnr: "100%" },
                { name: "PKFare MD5 Engine", ping: "124ms", status: "ONLINE", margin: "+18%", pnr: "100%" },
                { name: "Seeru Flights JWT", ping: "88ms", status: "ONLINE", margin: "+18%", pnr: "100%" },
                { name: "Biletbank BBOST REST", ping: "142ms", status: "ONLINE", margin: "+18%", pnr: "100%" },
              ].map((gds) => (
                <div key={gds.name} className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{gds.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 mt-1">
                    <span>زمن الاستجابة: {gds.ping}</span>
                    <span className="text-amber-400">{gds.margin} هامش</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Circuit Board & Live JSON Inspector */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-[380px]">
              {/* Left Column (Col 5): Margin markup sliders & Live triggers */}
              <div className="col-span-5 p-5 rounded-2xl bg-[#020e1f] border border-cyan-500/30 flex flex-col gap-4">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <Sliders size={16} className="text-cyan-400" />
                  <span>التحكم في هوامش ربح التذاكر الموحدة</span>
                </span>

                <div className="p-4 rounded-xl bg-[#010814] border border-cyan-500/20">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-300">نسبة الهامش المقفل:</span>
                    <span className="text-cyan-400 font-bold text-base">+{flightMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={flightMargin}
                    onChange={(e) => setFlightMargin(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    يتم تطبيق الهامش لحظياً على رحلات ترافلبورت وبكفير وسيرو دون تأثير على سرعة الحجز
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-end gap-2">
                  <button
                    onClick={onOpenMcpDispatcher}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_15px_#00e5ff] transition-all"
                  >
                    استدعاء فاحص أسعار الطيران الحي ↗
                  </button>
                </div>
              </div>

              {/* Right Column (Col 7): Live Raw JSON Telemetry */}
              <div className="col-span-7 p-5 rounded-2xl bg-[#010611] border border-cyan-500/40 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <Code size={14} />
                    <span>TRAVELPORT / PKFARE AIR TELEMETRY INSPECTOR</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["json", "headers", "latency"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setGdsResponseTab(t)}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono ${
                          gdsResponseTab === t
                            ? "bg-cyan-500 text-black font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <pre className="flex-1 overflow-y-auto text-[11px] font-mono text-emerald-300 p-3 bg-[#01040a] rounded-xl mt-3 custom-scrollbar" dir="ltr">
                  {JSON.stringify(
                    {
                      flightQuery: {
                        origin: "JED",
                        destination: "TZX",
                        departureDate: "2026-07-15",
                        passengers: { adults: 2, children: 1 },
                      },
                      gdsRouting: {
                        activeGateway: "PKFare_MD5_shoppingV10",
                        fallbackGateway: "Travelport_Universal_API",
                        pnrStatus: "AVAILABLE_INSTANT",
                        baseFareUSD: 390.0,
                        markupAppliedPercent: flightMargin,
                        finalPriceUSD: Math.round(390 * (1 + flightMargin / 100)),
                      },
                      latencyBenchmarkMs: 124,
                      timestamp: new Date().toISOString(),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 05: HOTELS & BEDBANKS MATRIX                                       */}
        {/* ========================================================================= */}
        {currentScreen.id === "05" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Bedbanks Status Ribbon */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: "Travelport Hospitality Engine", count: "82 فندقاً", ping: "96ms", status: "متزامن" },
                { name: "Seeru Hotels B2B API", count: "44 فندقاً", ping: "84ms", status: "متزامن" },
                { name: "RateHawk Live Inventory", count: "12 فندقاً VIP", ping: "110ms", status: "متزامن" },
                { name: "Bokun Experiences & Stays", count: "18 منتجعاً", ping: "135ms", status: "متزامن" },
              ].map((bb) => (
                <div key={bb.name} className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 flex flex-col gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{bb.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 mt-1">
                    <span>{bb.count}</span>
                    <span className="text-emerald-400 font-bold">{bb.status} ({bb.ping})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Room Availability and Rate Parity Table */}
            <div className="flex-1 min-h-[360px] p-5 rounded-2xl bg-[#020e1f] border border-cyan-500/40 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Building2 className="text-cyan-400" size={18} />
                  <span className="font-bold text-white text-sm">
                    مصفوفة توافر الغرف وهامش الربح وبنوك الأسرّة (Room Allotment & Parity)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenMcpDispatcher}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_12px_#00e5ff]"
                  >
                    مزامنة تقييمات TripAdvisor عبر MCP ↗
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-cyan-500/20 text-slate-400 font-mono">
                      <th className="py-2.5 px-3">الفندق</th>
                      <th className="py-2.5 px-3">المدينة والوجهة</th>
                      <th className="py-2.5 px-3">نوع الغرفة</th>
                      <th className="py-2.5 px-3">بنك الأسرة المعتمد</th>
                      <th className="py-2.5 px-3">السعر لليلة</th>
                      <th className="py-2.5 px-3">الحالة والتوافر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/10">
                    <tr className="hover:bg-cyan-500/5">
                      <td className="py-3 px-3 font-bold text-white">Swissotel The Bosphorus</td>
                      <td className="py-3 px-3 text-cyan-300">إسطنبول، تركيا</td>
                      <td className="py-3 px-3 text-slate-300">جناح ديلوكس بإطلالة بوسفور كاملة</td>
                      <td className="py-3 px-3 font-mono text-slate-300">Travelport Hospitality</td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">$420.00</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          متاح فوري (3 غرف متبقية)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-cyan-500/5">
                      <td className="py-3 px-3 font-bold text-white">Rixos Premium Dubai JBR</td>
                      <td className="py-3 px-3 text-cyan-300">دبي، الإمارات</td>
                      <td className="py-3 px-3 text-slate-300">غرفة بريميوم كينغ مطلة على البحر</td>
                      <td className="py-3 px-3 font-mono text-slate-300">RateHawk Direct API</td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">$580.00</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          متاح فوري (تأكيد لحظي)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-cyan-500/5">
                      <td className="py-3 px-3 font-bold text-white">Radisson Blu Hotel Trabzon</td>
                      <td className="py-3 px-3 text-cyan-300">طرابزون، تركيا</td>
                      <td className="py-3 px-3 text-slate-300">غرفة عائلية واسعة مع إفطار مشمول</td>
                      <td className="py-3 px-3 font-mono text-slate-300">Seeru Hotels Engine</td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">$210.00</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          متاح فوري (عروض الصيف)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 06: MOBILITY, FLEET & TOURS HUB                                     */}
        {/* ========================================================================= */}
        {currentScreen.id === "06" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Fleet Status Ribbon */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">أسطول Mercedes Vito VIP</span>
                <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">18 سيارة</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">100% تتبع GPS حي</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">البرامج السياحية الشاملة</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">24 برنامجاً</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">شامل الطيران والفندق والجولات</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">استقبالات المطارات اليوم</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">14 استقبالاً</span>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">مطار إسطنبول وطرابزون ودبي</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">طلبات التأشيرات النشطة</span>
                <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">28 تأشيرة</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">معدل قبول 99.2%</span>
              </div>
            </div>

            {/* Mercedes Vito VIP Fleet & Transfer Schedule */}
            <div className="grid grid-cols-12 gap-6 min-h-[340px]">
              {/* Fleet Dispatch List (Col 7) */}
              <div className="col-span-7 p-5 rounded-2xl bg-[#020e1f] border border-cyan-500/40 flex flex-col gap-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <Car className="text-cyan-400" size={18} />
                    <span className="font-bold text-white text-sm">
                      أسطول النقل السياحي والسيارات الفاخرة (Mercedes-Benz Vito VIP)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">FLEET RADAR</span>
                </div>

                <div className="space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
                  {[
                    { id: "VITO-01", model: "Mercedes Vito VIP 2026 (7 مقاعد)", driver: "أحمد كايا (مرخص سياحياً)", task: "استقبال مطار إسطنبول الدولي (IST) -> فندق سويس أوتيل", status: "في الطريق للمطار", color: "text-emerald-400" },
                    { id: "VITO-02", model: "Mercedes Vito VIP Extra Long", driver: "مصطفى دمير", task: "جولة يومية خاصة: بحيرة أوزنجول ومرتفعات السلطان مراد", status: "جولة نشطة", color: "text-cyan-400" },
                    { id: "VITO-03", model: "Mercedes V-Class Maybach Edition", driver: "سالم المنصوري", task: "استقبال مطار دبي (DXB) -> نخلة جميرا ريكسوس", status: "جاهز بالموقف", color: "text-amber-400" },
                  ].map((v) => (
                    <div key={v.id} className="p-3.5 rounded-xl bg-[#010917] border border-cyan-500/20 flex flex-col gap-1.5 hover:border-cyan-500/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-300 font-bold text-xs">{v.id} · {v.model}</span>
                        <span className={`text-[10px] font-mono font-bold ${v.color}`}>{v.status}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans">{v.task}</p>
                      <span className="text-[10px] text-slate-400 font-mono">السائق المخصص: {v.driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package Itinerary Stepper (Col 5) */}
              <div className="col-span-5 p-5 rounded-2xl bg-[#010815] border border-cyan-500/30 flex flex-col gap-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <Palmtree className="text-cyan-400" size={18} />
                    <span className="font-bold text-white text-sm">برنامج رحلة الشمال التركي VIP</span>
                  </div>
                  <span className="text-xs font-mono text-amber-300">7 أيام / 6 ليالٍ</span>
                </div>

                <div className="space-y-2 text-xs flex-1 overflow-y-auto custom-scrollbar">
                  {[
                    { day: "اليوم 1", title: "الاستقبال والتوصيل للفندق", sub: "مطار طرابزون واستلام الغرف والراحة" },
                    { day: "اليوم 2", title: "سحر بحيرة أوزنجول والشلالات", sub: "جولة بالمرسيدس فيتو مع زيارة مزارع الشاي" },
                    { day: "اليوم 3", title: "مرتفعات آيدر وهضبة ريزا", sub: "التجديف وممارسة الأنشطة الريفية وزيارة الجسور" },
                    { day: "اليوم 4", title: "دير سوميلا وقرية هامسي كوي", sub: "تذوق المهلبية التقليدية والمناظر الجبلية" },
                  ].map((it) => (
                    <div key={it.day} className="p-2.5 rounded-xl bg-[#021020] border border-cyan-500/15 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{it.day}: {it.title}</span>
                        <span className="text-[10px] text-slate-400">{it.sub}</span>
                      </div>
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>

                <button
                  onClick={onOpenMcpDispatcher}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all mt-2"
                >
                  إرسال تفاصيل المسار للعميل عبر واتساب ↗
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 07: CMS & VISUAL EXPERIENCE STUDIO WITH LIVE PREVIEW                */}
        {/* ========================================================================= */}
        {currentScreen.id === "07" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
            {/* Top Toolbar: Device Mode Switcher */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#021022] border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white">معاينة الواجهة الحية:</span>
                <div className="flex items-center gap-1 bg-[#010814] p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      previewDevice === "desktop"
                        ? "bg-cyan-500 text-black font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Laptop size={14} />
                    <span>سطح المكتب</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      previewDevice === "mobile"
                        ? "bg-cyan-500 text-black font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>الجوال</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice("pwa")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      previewDevice === "pwa"
                        ? "bg-cyan-500 text-black font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>تطبيق PWA</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMcpDispatcher}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs font-mono shadow-[0_0_12px_#00e5ff]"
                >
                  كتابة وتوليد مقال ذكي (Blog MCP)
                </button>
              </div>
            </div>

            {/* Device Canvas Frame */}
            <div className="flex-1 flex items-center justify-center p-4 bg-[#010611] rounded-2xl border border-cyan-500/20 overflow-hidden">
              <div
                className={`transition-all duration-300 rounded-2xl border border-cyan-500/40 bg-[#020d1c] shadow-[0_0_40px_rgba(0,229,255,0.15)] flex flex-col overflow-hidden ${
                  previewDevice === "desktop"
                    ? "w-full max-w-4xl h-[420px]"
                    : previewDevice === "mobile"
                    ? "w-[340px] h-[480px]"
                    : "w-[390px] h-[480px]"
                }`}
              >
                {/* Mock Browser Header */}
                <div className="h-8 px-4 bg-[#010814] border-b border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-cyan-300">https://lonaliza.com/explore</span>
                  <span className="text-xs">AR</span>
                </div>

                {/* Simulated Hero Section */}
                <div className="flex-1 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden bg-[radial-gradient(ellipse_at_top,#00395c_0%,#020d1c_80%)]">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono mb-3">
                    رحلات صيف 2026 الحصرية
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-white max-w-lg leading-tight">
                    اكتشف سحر الطبيعة بين قمم طرابزون وأبراج دبي الفاخرة
                  </h1>
                  <p className="text-xs text-slate-300 mt-2 max-w-md">
                    حجوزات طيران مؤكدة وفنادق 5 نجوم مع استقبال VIP وأسطول سيارات فاخر.
                  </p>
                  <button className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-lg">
                    احجز رحلتك الآن
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 08: CUSTOMERS & LIVE CONVERSATION STREAM                           */}
        {/* ========================================================================= */}
        {currentScreen.id === "08" && (
          <div className="flex-1 w-full h-full p-8 grid grid-cols-12 gap-6 overflow-hidden">
            {/* Customer 360 Dossier (Col 4) */}
            <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-lg font-mono">
                  MQ
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">محمد عبد الله القحطاني</h3>
                  <span className="text-xs font-mono text-cyan-400">+966 50 123 4567</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#010814] flex items-center justify-between">
                  <span className="text-slate-400">تصنيف العميل:</span>
                  <span className="text-amber-400 font-bold">VIP Platinum</span>
                </div>
                <div className="p-3 rounded-xl bg-[#010814] flex items-center justify-between">
                  <span className="text-slate-400">إجمالي الإنفاق:</span>
                  <span className="text-emerald-400 font-bold">$18,450</span>
                </div>
                <div className="p-3 rounded-xl bg-[#010814] flex items-center justify-between">
                  <span className="text-slate-400">نقاط الولاء المكتسبة:</span>
                  <span className="text-cyan-300 font-bold">2,400 نقطة</span>
                </div>
                <div className="p-3 rounded-xl bg-[#010814] flex items-center justify-between">
                  <span className="text-slate-400">مؤشر الرضا التراكمي:</span>
                  <span className="text-emerald-400 font-bold">98% إيجابي جداً</span>
                </div>
              </div>

              <div className="mt-auto">
                <button
                  onClick={onOpenMcpDispatcher}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-cyan-300 font-bold text-xs transition-all"
                >
                  إرسال قالب رسمي عبر واتساب ↗
                </button>
              </div>
            </div>

            {/* Unified Chat Thread (Col 8) */}
            <div className="col-span-8 p-5 rounded-2xl bg-[#010816] border border-cyan-500/40 flex flex-col overflow-hidden">
              <div className="pb-3 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-cyan-400" size={18} />
                  <span className="font-bold text-white text-sm">
                    خيط المحادثة الموحد (WhatsApp & Platform Concierge)
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-400">ONLINE · META CLOUD API</span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 my-2 custom-scrollbar">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[75%] ${
                      m.sender === "user" ? "mr-auto text-left items-start" : "ml-auto text-right items-end"
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-[#031d33] border border-cyan-500/30 text-white rounded-br-none"
                          : "bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-bl-none shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                      }`}
                      dir="rtl"
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">
                      {m.time} · {m.sender === "user" ? "العميل" : "الوكيل الذكي"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="pt-2 border-t border-cyan-500/20 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="اكتب ردك المباشر أو دع الوكيل يقترح رداً..."
                  className="flex-1 px-4 py-2 text-xs bg-[#020d1c] border border-cyan-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleSendChat}
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_#00e5ff] transition-all"
                >
                  <Send size={15} className="fill-black" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 09: MULTI-CHANNEL PUBLISHING & SOCIAL VIDEO STUDIO                 */}
        {/* ========================================================================= */}
        {currentScreen.id === "09" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#021024] border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <Video className="text-cyan-400" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-white">استوديو إنتاج وجدولة الفيديو متعدد القنوات</h3>
                  <span className="text-xs text-slate-400 font-mono">Higgsfield AI · Google Flow · Instagram Reels</span>
                </div>
              </div>
              <button
                onClick={onOpenMcpDispatcher}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_15px_#00e5ff]"
              >
                توليد فيديو سياحي عبر Higgsfield AI ↗
              </button>
            </div>

            {/* Weekly Schedule Matrix */}
            <div className="grid grid-cols-7 gap-3">
              {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map((day, idx) => (
                <div key={day} className="p-3.5 rounded-xl bg-[#010917] border border-cyan-500/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300">
                    <span>{day}</span>
                    <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#021427] border border-cyan-500/10 text-[11px] text-slate-300">
                    <span className="text-amber-400 font-bold block">فيديو Reels (9:16)</span>
                    <span>شلالات أوزنجول الساحرة</span>
                    <span className="text-[9px] text-emerald-400 font-mono block mt-1">مجدول 06:00 م</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 10: ADS, AFFILIATES & GROWTH CONVERSION FUNNEL                     */}
        {/* ========================================================================= */}
        {currentScreen.id === "10" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">ميزانية الحملات النشطة</span>
                <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">${adBudget}</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Google Ads & Meta CTWA</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">عائد الإنفاق الإعلاني ROAS</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">4.82x</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">أعلى من متوسط قطاع السفر (+28%)</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">كلفة النقرة CPC</span>
                <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">$0.18</span>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">حملات الاستهداف الذكي Lookalike</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">أرباح شبكة المسوقين بالعمولة</span>
                <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">$14,250</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">عمولة 10% لكل حجز مؤكد</span>
              </div>
            </div>

            {/* Conversion Funnel Grid */}
            <div className="p-6 rounded-2xl bg-[#020e1f] border border-cyan-500/40 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-cyan-400" size={18} />
                  <span className="font-bold text-white text-sm">
                    مسار التحويل الإعلاني والنمو التراكمي (Conversion Funnel)
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400">GROWTH MATRIX v3.0</span>
              </div>

              <div className="grid grid-cols-5 gap-3 py-3">
                {[
                  { stage: "الظهور والانطباعات", metric: "1,240,000", sub: "Meta + Google + TikTok", width: "100%", color: "bg-cyan-500" },
                  { stage: "النقرات المؤهلة (CTR)", metric: "84,200", sub: "معدل نقر 6.78%", width: "80%", color: "bg-blue-500" },
                  { stage: "محادثات CTWA واتساب", metric: "4,120", sub: "عملاء متفاعلون لحظياً", width: "60%", color: "bg-emerald-500" },
                  { stage: "الحجوزات المؤكدة", metric: "380", sub: "معدل إغلاق 9.22%", width: "40%", color: "bg-amber-400" },
                  { stage: "الإيراد المالي الإجمالي", metric: "$307,420", sub: "صافي الأرباح المحققة", width: "25%", color: "bg-purple-500" },
                ].map((st, idx) => (
                  <div key={st.stage} className="p-4 rounded-xl bg-[#010917] border border-cyan-500/20 flex flex-col gap-2">
                    <div className="text-[11px] font-mono text-slate-400">مرحلة 0{idx + 1}</div>
                    <div className="text-xs font-bold text-white">{st.stage}</div>
                    <div className="text-lg font-black font-mono text-cyan-300 mt-1">{st.metric}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{st.sub}</span>
                    <div className="w-full bg-[#01050e] h-1.5 rounded-full overflow-hidden mt-2">
                      <div className={`h-full ${st.color}`} style={{ width: st.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Budget Optimizer & MCP Trigger */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 p-5 rounded-2xl bg-[#020e1f] border border-cyan-500/30 flex flex-col gap-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders size={16} className="text-cyan-400" />
                  <span>محاكي ضبط وتحسين الميزانية الإعلانية اليومية</span>
                </span>
                <div className="p-4 rounded-xl bg-[#010814] border border-cyan-500/20">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-300">الميزانية الشهرية المقترحة:</span>
                    <span className="text-cyan-400 font-bold text-lg">${adBudget}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="500"
                    value={adBudget}
                    onChange={(e) => setAdBudget(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                    <span>النقرات المتوقعة: ~{Math.round(adBudget / 0.18)} نقرة</span>
                    <span className="text-emerald-400">العائد المقدر: ~${Math.round(adBudget * 4.82)}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-4 p-5 rounded-2xl bg-[#010816] border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-sm font-bold text-white block mb-1">الوكيل الإعلاني الذكي</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يقوم وكيل الإعلانات بمراقبة تكلفة الاستحواذ وتوزيع الميزانية تلقائياً بين الكلمات المفتاحية الأكثر ربحية.
                  </p>
                </div>
                <button
                  onClick={onOpenMcpDispatcher}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_15px_#00e5ff] transition-all"
                >
                  استدعاء أداة إطلاق وتحسين الحملات (Ads MCP) ↗
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 11: MULTI-AGENT CHAMBER & KNOWLEDGE                                */}
        {/* ========================================================================= */}
        {currentScreen.id === "11" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#021024] border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <Orbit className="text-cyan-400" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-white">غرفة عمليات الوكلاء المتعددين وخوادم MCP الـ 21</h3>
                  <span className="text-xs text-slate-400 font-mono">88 أداة ذكية نشطة وجاهزة للتنفيذ المباشر</span>
                </div>
              </div>
              <button
                onClick={onOpenMcpDispatcher}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_15px_#00e5ff]"
              >
                فتح نافذة استدعاء الأدوات المباشرة ↗
              </button>
            </div>

            {/* Agent Cards Grid */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: "الوكيل المشرف (Supervisor)", role: "التنسيق العام والقرارات", status: "نشط 100%", tools: "12 أداة" },
                { name: "خبير الطيران (Flight Master)", role: "GDS والأسعار اللحظية", status: "نشط 100%", tools: "8 أدوات" },
                { name: "مفاوض الفنادق (Hotel Copilot)", role: "بنوك الأسرة وتوافر الغرف", status: "نشط 100%", tools: "7 أدوات" },
                { name: "مهندس المحتوى (Content Lead)", role: "المقالات وتصاميم Canva", status: "نشط 100%", tools: "14 أداة" },
                { name: "مخرج الفيديو (Studio Director)", role: "Higgsfield & Google Flow", status: "نشط 100%", tools: "9 أدوات" },
                { name: "مدير الإعلانات (Ads Strategist)", role: "تحسين الحملات و ROAS", status: "نشط 100%", tools: "6 أدوات" },
                { name: "مستشار الرحلات (Concierge)", role: "محادثات واتساب وباقات دبي", status: "نشط 100%", tools: "11 أداة" },
                { name: "مسؤول الامتثال (Compliance Officer)", role: "حماية البيانات و PDPL", status: "نشط 100%", tools: "5 أدوات" },
              ].map((ag) => (
                <div key={ag.name} className="p-4 rounded-xl bg-[#010917] border border-cyan-500/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{ag.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  </div>
                  <span className="text-xs text-slate-400">{ag.role}</span>
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 mt-2 pt-2 border-t border-cyan-500/10">
                    <span>{ag.tools}</span>
                    <span className="text-emerald-400">{ag.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 12: AUTOMATION WORKFLOWS STUDIO & DAG LOGIC                        */}
        {/* ========================================================================= */}
        {currentScreen.id === "12" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">مسارات الأتمتة النشطة</span>
                <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">12 مساراً</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">100% مشغلة بانتظام</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">معدل نجاح المهام</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">99.98%</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">آلية إعادة المحاولة التلقائية</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">متوسط زمن التنفيذ</span>
                <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">850ms</span>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">تنفيذ فائق السرعة عبر Redis</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#021124] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <span className="text-xs text-slate-400 block font-mono">المهام المنفذة اليوم</span>
                <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">1,840 مهمة</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">0 أخطاء معلقة</span>
              </div>
            </div>

            {/* Visual DAG Workflow Architecture */}
            <div className="p-6 rounded-2xl bg-[#020e1f] border border-cyan-500/40 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <GitBranch className="text-cyan-400" size={18} />
                  <span className="font-bold text-white text-sm">
                    مسار العمل التلقائي: معالجة حجز VIP وإصدار الوثائق (Workflow DAG)
                  </span>
                </div>
                <button
                  onClick={onOpenMcpDispatcher}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_12px_#00e5ff]"
                >
                  تشغيل المسار يدوياً الآن ↗
                </button>
              </div>

              {/* DAG Logic Nodes */}
              <div className="grid grid-cols-4 gap-4 py-3">
                <div className="p-4 rounded-xl bg-[#010917] border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.2)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400">01. المحفز TRIGGER</span>
                    <Sparkles size={14} className="text-cyan-400" />
                  </div>
                  <div className="text-xs font-bold text-white">حجز مؤكد جديد #BK</div>
                  <p className="text-[11px] text-slate-400">استلام حدث الحجز من بوابة الدفع وتأكيد الحوالة</p>
                </div>

                <div className="p-4 rounded-xl bg-[#010917] border border-amber-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-300">02. الفحص CONDITION</span>
                    <ShieldCheck size={14} className="text-amber-400" />
                  </div>
                  <div className="text-xs font-bold text-white">مطابقة الشروط والسياسات</div>
                  <p className="text-[11px] text-slate-400">التحقق من سقف الرصيد ورخصة الوكالة وموافقة PDPL</p>
                </div>

                <div className="p-4 rounded-xl bg-[#010917] border border-emerald-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400">03. التنفيذ PARALLEL</span>
                    <Zap size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-xs font-bold text-white">3 إجراءات متزامنة</div>
                  <p className="text-[11px] text-slate-400">توليد الفاتورة + إشعار واتساب + تنبيه تيليجرام</p>
                </div>

                <div className="p-4 rounded-xl bg-[#010917] border border-blue-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-400">04. التسوية COMPLETE</span>
                    <CheckCircle2 size={14} className="text-blue-400" />
                  </div>
                  <div className="text-xs font-bold text-white">حفظ السجل والأرشفة</div>
                  <p className="text-[11px] text-slate-400">تسجيل المعاملة في PocketBase وتحديث الرصيد</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 13: FINANCE, INVOICES & LOYALTY                                    */}
        {/* ========================================================================= */}
        {currentScreen.id === "13" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Top Telemetry Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div>
                <h2 className="text-lg font-black text-white font-mono tracking-wide">
                  المالية والفوترة المؤتمتة وبرامج الولاء (ZATCA Phase 2)
                </h2>
                <span className="text-xs font-mono text-cyan-400">
                  FINANCIAL LEDGER · REALTIME SETTLEMENTS · TAX ENGINE · MULTI-CURRENCY
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMcpDispatcher}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-[0_0_15px_#ffb54c]"
                >
                  استدعاء خادم المحاسبة (Accounting MCP) ↗
                </button>
              </div>
            </div>

            {/* Financial KPI Banner */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "إجمالي حجم العمليات المحصلة", val: "1,152,825 ر.س", sub: "$307,420 USD", color: "text-emerald-400" },
                { label: "صافي التدفقات النقدية الواردة", val: "930,712 ر.س", sub: "+18.2% هذا الشهر", color: "text-cyan-400" },
                { label: "مستحقات معلقة بانتظار التسوية", val: "222,113 ر.س", sub: "14 معاملة تحت المعالجة", color: "text-amber-400" },
                { label: "ضريبة القيمة المضافة المحتسبة (15%)", val: "172,923 ر.س", sub: "مفوترة ومعتمدة بهيئة الزكاة", color: "text-purple-400" },
                { label: "رصيد نقاط الولاء النشطة", val: "1,420,000 نقطة", sub: "تعادل 14,200 ر.س رصيد استرداد", color: "text-blue-400" },
              ].map((k) => (
                <div key={k.label} className="p-4 rounded-xl bg-[#021024] border border-cyan-500/20 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-400 font-mono">{k.label}</span>
                  <span className={`text-base font-black font-mono ${k.color}`}>{k.val}</span>
                  <span className="text-[10px] text-slate-500">{k.sub}</span>
                </div>
              ))}
            </div>

            {/* Main 3-Column Working Grid */}
            <div className="grid grid-cols-12 gap-6 min-h-[520px]">
              {/* Col 1: Ledger Journal (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Receipt size={16} className="text-cyan-400" />
                    <span>سجل القيود اليومية والمعاملات</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LIVE SYNC
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex rounded-xl bg-[#010814] p-1 border border-cyan-500/20">
                  {(["all", "settled", "pending", "refunds"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveInvoiceFilter(tab)}
                      className={`flex-1 py-1 text-[11px] font-mono rounded-lg transition-all ${
                        activeInvoiceFilter === tab
                          ? "bg-cyan-500/30 text-cyan-300 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab === "all" ? "الكل" : tab === "settled" ? "المسواة" : tab === "pending" ? "المعلقة" : "الاسترداد"}
                    </button>
                  ))}
                </div>

                {/* Transactions List */}
                <div className="space-y-2.5 overflow-y-auto max-h-[380px] custom-scrollbar">
                  {[
                    { id: "INV-2026-9042", user: "سعد بن إبراهيم القحطاني", type: "حجز فندق وطيران", amount: "10,867.50 ر.س", status: "settled", time: "منذ 12 دقيقة" },
                    { id: "INV-2026-9041", user: "شركة ركائب الشرق للسياحة", type: "شحن محفظة B2B", amount: "50,000.00 ر.س", status: "settled", time: "منذ 45 دقيقة" },
                    { id: "INV-2026-9040", user: "الدكتورة نورة الشمري", type: "طيران الرياض - لندن", amount: "4,620.00 ر.س", status: "pending", time: "منذ ساعتين" },
                    { id: "INV-2026-9039", user: "فهد العتيبي", type: "استرداد حجز سيارة ملغي", amount: "-650.00 ر.س", status: "refunds", time: "أمس" },
                    { id: "INV-2026-9038", user: "مجموعة المسافر الدولي", type: "تسوية عمولات شهرية", amount: "18,400.00 ر.س", status: "settled", time: "أمس" },
                  ]
                    .filter((item) => activeInvoiceFilter === "all" || item.status === activeInvoiceFilter)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedInvoiceId(item.id)}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                          selectedInvoiceId === item.id
                            ? "bg-[#031d38] border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                            : "bg-[#010a17] border-cyan-500/10 hover:border-cyan-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-cyan-400 font-bold">{item.id}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.status === "settled"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : item.status === "pending"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {item.status === "settled" ? "تمت التسوية" : item.status === "pending" ? "قيد الانتظار" : "مسترد"}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">{item.user}</div>
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-slate-400">{item.type}</span>
                          <span className="font-mono font-bold text-amber-300">{item.amount}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Col 2: Lifecycle Flow DAG (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-cyan-400" />
                  <span>دورة حياة الدفع والفوترة والتسوية (DAG)</span>
                </span>

                <div className="flex-1 flex flex-col justify-between py-2 relative">
                  {[
                    { step: "01. التفويض والدفع", desc: "بوابة الدفع (مدى / فيزا / أبل باي / تمارا)", status: "مكتمل بنجاح", icon: CreditCard, color: "text-cyan-400" },
                    { step: "02. الفحص الأمني ومكافحة الاحتيال", desc: "تحقق 3D-Secure والتوافق البنكي الفوري", status: "درجة الأمان 99.8%", icon: ShieldCheck, color: "text-emerald-400" },
                    { step: "03. التحصيل ومطابقة العملة", desc: "توجيه المبلغ إلى الحساب التشغيلي المحلي", status: "SAR FX Fixed", icon: ArrowUpRight, color: "text-blue-400" },
                    { step: "04. احتساب الضريبة والتسعير", desc: "تطبيق 15% ضريبة القيمة المضافة ونسبة الهامش", status: "مطابق لهيئة الزكاة", icon: Scale, color: "text-amber-400" },
                    { step: "05. إصدار الفاتورة الضريبية ZATCA", desc: "تضمين الختم المشفر ورمز QR المرحلة الثانية", status: "مُصدر إلكترونياً", icon: QrCode, color: "text-purple-400" },
                    { step: "06. إيداع نقاط الولاء ومكافأة العميل", desc: "إضافة 108 نقطة لحساب المسافر في التطبيق", status: "تم الشحن", icon: Sparkles, color: "text-emerald-400" },
                  ].map((node) => (
                    <div key={node.step} className="p-3 rounded-xl bg-[#010917] border border-cyan-500/20 flex items-center justify-between text-right">
                      <div className="flex items-center gap-3">
                        <node.icon size={18} className={node.color} />
                        <div>
                          <span className="text-xs font-bold text-white block">{node.step}</span>
                          <span className="text-[10px] text-slate-400">{node.desc}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                        {node.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: Invoice Document Live Preview (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FileText size={14} className="text-cyan-400" />
                    <span>معاينة الفاتورة الضريبية الإلكترونية</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">ZATCA COMPLIANT</span>
                </div>

                {/* Styled Invoice Sheet Mockup */}
                <div className="p-4 rounded-xl bg-[#010814] border border-cyan-500/20 text-xs text-right space-y-3 font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <div>
                      <span className="text-cyan-400 font-black text-sm block">لوناليزا للسياحة</span>
                      <span className="text-[10px] text-slate-400">س.ت: 1010892019 · ضريبي: 310492817200003</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-cyan-500/30">
                      <QrCode size={24} className="text-cyan-300" />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">رقم الفاتورة:</span>
                    <span className="text-white font-bold">{selectedInvoiceId}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">اسم العميل:</span>
                    <span className="text-cyan-300 font-bold">سعد بن إبراهيم القحطاني</span>
                  </div>

                  <div className="pt-2 border-t border-cyan-500/10 space-y-1.5 text-[10px]">
                    <div className="flex justify-between text-slate-300">
                      <span>• إقامة سويس أوتيل إسطنبول (5 ليالٍ)</span>
                      <span>4,850.00 ر.س</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• تذكرة طيران الرياض - إسطنبول - الرياض</span>
                      <span>3,200.00 ر.س</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>• جولة سياحية خاصة وسيارة VIP</span>
                      <span>1,400.00 ر.س</span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-bold pt-1 border-t border-cyan-500/20">
                      <span>ضريبة القيمة المضافة (15%):</span>
                      <span>1,417.50 ر.س</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 text-sm font-black pt-1 border-t border-cyan-500/30">
                      <span>الإجمالي الصافي:</span>
                      <span>10,867.50 ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                  <button
                    onClick={() => alert(`تم إصدار وتصدير نسخة PDF للفاتورة رقم ${selectedInvoiceId}`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono transition-all"
                  >
                    <Download size={14} />
                    <span>تصدير PDF</span>
                  </button>
                  <button
                    onClick={() => alert(`تم إرسال الفاتورة ${selectedInvoiceId} إلى واتساب العميل بنجاح`)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs font-mono transition-all"
                  >
                    <Send size={14} />
                    <span>إرسال واتساب</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 14: B2B RESELLING & WHITE-LABEL NETWORK                            */}
        {/* ========================================================================= */}
        {currentScreen.id === "14" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Header Telemetry */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div>
                <h2 className="text-lg font-black text-white font-mono tracking-wide">
                  إعادة البيع وشبكة الشركاء المؤسسية B2B والوايت ليبل
                </h2>
                <span className="text-xs font-mono text-cyan-400">
                  B2B RESELLING NETWORK · WHITE-LABEL MESH · CUSTOM DOMAINS · COMMISSION ENGINE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMcpDispatcher}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-black font-extrabold text-xs shadow-[0_0_15px_#00e5ff]"
                >
                  إصدار ترخيص شريك جديد (B2B MCP) ↗
                </button>
              </div>
            </div>

            {/* Network KPIs */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { title: "الوكالات والشركاء المعتمدين", val: "42 وكالة شريكة", sub: "12 بلاتينية · 18 ذهبية · 12 فضية", color: "text-cyan-400" },
                { title: "إجمالي حجم حجوزات B2B", val: "$1,420,000 USD", sub: "5,325,000 ر.س حجم التداول التراكمي", color: "text-amber-400" },
                { title: "البوابات المستقلة النشطة (White-Label)", val: "8 بوابات بنطاق خاص", sub: "100% شهادات SSL مخصصة وهوية مستقلة", color: "text-emerald-400" },
                { title: "عمولات الموزعين المدفوعة", val: "$148,200 USD", sub: "تسوية آلية فور إصدار التذاكر", color: "text-purple-400" },
              ].map((k) => (
                <div key={k.title} className="p-4 rounded-xl bg-[#021024] border border-cyan-500/20 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-400 font-mono">{k.title}</span>
                  <span className={`text-xl font-black font-mono ${k.color}`}>{k.val}</span>
                  <span className="text-[10px] text-slate-500">{k.sub}</span>
                </div>
              ))}
            </div>

            {/* 3-Column Working Grid */}
            <div className="grid grid-cols-12 gap-6 min-h-[500px]">
              {/* Col 1: Agency Dossier & Tiering Roster (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Users size={16} className="text-cyan-400" />
                  <span>دليل الوكالات الشريكة ومستويات التصنيف</span>
                </span>

                <div className="space-y-3 overflow-y-auto max-h-[380px] custom-scrollbar">
                  {[
                    { id: "east-rides", name: "شركة ركائب الشرق للسياحة", tier: "PLATINUM", balance: "185,000 ر.س", comm: "12%", bookings: 480, domain: "b2b.east-rides.com" },
                    { id: "gulf-wings", name: "وكالة أجنحة الخليج للسفر", tier: "GOLD", balance: "92,000 ر.س", comm: "9%", bookings: 215, domain: "portal.gulfwings.travel" },
                    { id: "silver-horiz", name: "مؤسسة الأفق الفضي لتنظيم الرحلات", tier: "SILVER", balance: "34,000 ر.س", comm: "7%", bookings: 88, domain: "booking.silver-horizon.com" },
                    { id: "dubai-intl", name: "مجموعة المسافر الدولي دبي", tier: "PLATINUM", balance: "240,000 ر.س", comm: "14%", bookings: 620, domain: "dubai.lonaliza-b2b.com" },
                  ].map((ag) => (
                    <div
                      key={ag.id}
                      onClick={() => setSelectedB2BAgency(ag.id)}
                      className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                        selectedB2BAgency === ag.id
                          ? "bg-[#031d38] border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                          : "bg-[#010a17] border-cyan-500/10 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-white font-bold">{ag.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          ag.tier === "PLATINUM" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}>
                          {ag.tier}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] font-mono">
                        <span className="text-slate-400">رصيد المحفظة:</span>
                        <span className="text-emerald-400 font-bold">{ag.balance}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                        <span className="text-slate-500">العمولة الممنوحة: {ag.comm}</span>
                        <span className="text-cyan-400/80">{ag.bookings} حجزاً منجزاً</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2: White-Label Network Radar (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe size={16} className="text-cyan-400" />
                  <span>بوابات الوايت ليبل ورادار النطاقات المخصصة</span>
                </span>

                <div className="space-y-3">
                  {[
                    { domain: "b2b.east-rides.com", ssl: "TLS 1.3 Active", pnr: "Autonomy Active", markup: "+8.5%", status: "ONLINE" },
                    { domain: "portal.gulfwings.travel", ssl: "Cloudflare Edge", pnr: "GDS Dual Channel", markup: "+9.0%", status: "ONLINE" },
                    { domain: "booking.silver-horizon.com", ssl: "Auto-Renewed", pnr: "Bedbanks & Tours", markup: "+11.0%", status: "ONLINE" },
                  ].map((p) => (
                    <div key={p.domain} className="p-3.5 rounded-xl bg-[#010917] border border-cyan-500/20 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                          <Lock size={12} className="text-emerald-400" />
                          <span>{p.domain}</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                          {p.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-cyan-500/10">
                        <span>شهادة الأمان: {p.ssl}</span>
                        <span>قناة الحجز: {p.pnr}</span>
                        <span>هامش الربح: {p.markup}</span>
                        <span className="text-cyan-400">تزامن الأسعار: 100%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-[#010714] border border-cyan-500/15 text-xs text-slate-300 leading-relaxed mt-auto">
                  <span className="text-cyan-400 font-bold block mb-1">ميزة الوايت ليبل الذكية:</span>
                  تتيح للشركاء بيع تذاكر الطيران والغرف الفندقية بهويتهم الخاصة وبأسعارهم المحددة، مع قيام الاستوديو السيبراني بإصدار PNR والتسويات المالية تلقائياً.
                </div>
              </div>

              {/* Col 3: Markup Engine & Overdraft Controls (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders size={16} className="text-cyan-400" />
                  <span>محرك هوامش الربح والتسهيلات الائتمانية</span>
                </span>

                <div className="space-y-4">
                  {/* Markup Slider */}
                  <div className="p-3.5 rounded-xl bg-[#010917] border border-cyan-500/20 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">نسبة هامش أرباح الطيران:</span>
                      <span className="text-cyan-400 font-bold">+{b2bMarkupPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={25}
                      value={b2bMarkupPct}
                      onChange={(e) => setB2bMarkupPct(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>حد أدنى: +2%</span>
                      <span>افتراضي: +10%</span>
                      <span>حد أقصى: +25%</span>
                    </div>
                  </div>

                  {/* Overdraft Facility */}
                  <div className="p-3.5 rounded-xl bg-[#010917] border border-cyan-500/20 space-y-2 text-right">
                    <span className="text-xs text-slate-300 font-bold block">التسهيل الائتماني المفتوح (Overdraft):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue="50,000 SAR"
                        className="flex-1 px-3 py-2 rounded-lg bg-[#020b18] border border-cyan-500/30 text-cyan-300 text-xs font-mono text-right"
                      />
                      <button
                        onClick={() => alert("تم تحديث سقف الائتمان للوكالة بنجاح")}
                        className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold"
                      >
                        حفظ
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block">يسمح للشريك بإصدار التذاكر الفورية حتى استهلاك السقف الائتماني.</span>
                  </div>

                  {/* API Token Box */}
                  <div className="p-3.5 rounded-xl bg-[#010917] border border-cyan-500/20 space-y-2 text-right">
                    <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                      <Key size={13} className="text-amber-400" />
                      <span>مفتاح B2B API Gateway:</span>
                    </span>
                    <div className="p-2 rounded-lg bg-[#020b18] border border-cyan-500/20 font-mono text-[10px] text-slate-400 truncate">
                      b2b_live_sec_8923a10b42f...91e4
                    </div>
                    <button
                      onClick={() => alert("تم توليد مفتاح API جديد وتوثيقه في الخادم")}
                      className="w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition-all"
                    >
                      توليد مفتاح اتصال جديد (Regenerate Key)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 15: LEGAL, PRIVACY, COMPLIANCE & SECURITY                          */}
        {/* ========================================================================= */}
        {currentScreen.id === "15" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Header Telemetry */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div>
                <h2 className="text-lg font-black text-white font-mono tracking-wide">
                  الامتثال القانوني والخصوصية والأمان السيبراني (GDPR / PDPL)
                </h2>
                <span className="text-xs font-mono text-cyan-400">
                  COMPLIANCE POSTURE · TRAVELER DATA PRIVACY · CRYPTOGRAPHIC VAULT · AUDIT CHAIN
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setComplianceScanRunning(true);
                    setTimeout(() => {
                      setComplianceScanRunning(false);
                      setComplianceScanResult("تم فحص 12 سياسة و 142 عقد حجز: 0 انتهاكات أمنية أو قانونية مسجلة ✅");
                    }, 1200);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-extrabold text-xs shadow-[0_0_15px_#10b981]"
                >
                  {complianceScanRunning ? "جاري الفحص الميداني..." : "تشغيل فحص الامتثال الشامل (Security Scan MCP) ↗"}
                </button>
              </div>
            </div>

            {/* Compliance KPI Banner */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { title: "مؤشر الامتثال الأمني والقانوني", val: "99.4% متوافق", sub: "نظام حماية البيانات الشخصية السعودي PDPL", color: "text-emerald-400" },
                { title: "تشفير بيانات المسافرين الحساسة", val: "AES-256-GCM", sub: "جوازات السفر، الهويات، بطاقات الدفع", color: "text-cyan-400" },
                { title: "طلبات حقوق البيانات (SAR/RTF)", val: "14 طلباً منجزاً", sub: "0 طلبات متأخرة عن المهلة القانونية", color: "text-blue-400" },
                { title: "سجل التدقيق العصبي غير القابل للتعديل", val: "IMMUTABLE CHAIN", sub: "توثيق بالهاش الزمني لكل استعلام", color: "text-amber-400" },
              ].map((k) => (
                <div key={k.title} className="p-4 rounded-xl bg-[#021024] border border-cyan-500/20 flex flex-col gap-1">
                  <span className="text-[11px] text-slate-400 font-mono">{k.title}</span>
                  <span className={`text-xl font-black font-mono ${k.color}`}>{k.val}</span>
                  <span className="text-[10px] text-slate-500">{k.sub}</span>
                </div>
              ))}
            </div>

            {/* Notification Alert if scan completed */}
            {complianceScanResult && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                <span>{complianceScanResult}</span>
                <button onClick={() => setComplianceScanResult(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {/* 3-Column Working Grid */}
            <div className="grid grid-cols-12 gap-6 min-h-[500px]">
              {/* Col 1: Legal Policies & Documents (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale size={16} className="text-cyan-400" />
                  <span>السياسات القانونية وميثاق حقوق المسافر</span>
                </span>

                <div className="space-y-3 overflow-y-auto max-h-[380px] custom-scrollbar">
                  {[
                    { title: "سياسة الخصوصية وحماية البيانات الشخصية", ver: "v4.2 - 2026", status: "مفعلة ومعتمدة", desc: "متوافقة مع نظام حماية البيانات الشخصية السعودي ولائحة GDPR" },
                    { title: "الشروط والأحكام العامة للخدمة والحجوزات", ver: "v3.8 - 2026", status: "مفعلة ومعتمدة", desc: "تنظم عقود السفر والإلغاء والتذاكر وسياسة بنوك الأسرة" },
                    { title: "ميثاق حقوق المسافر وهيئة الطيران المدني", ver: "GACA Charter 2026", status: "إلزامي للناقلين", desc: "آلية التعويض عن تأخر الرحلات أو فقدان الأمتعة" },
                    { title: "سياسة إدارة ملفات تعريف الارتباط والموافقة", ver: "Consent v2.1", status: "نشطة بالتطبيق", desc: "إشعار الموافقة الصريحة وتخصيص تجربة التصفح" },
                  ].map((p) => (
                    <div key={p.title} className="p-3.5 rounded-xl bg-[#010917] border border-cyan-500/15 text-right space-y-1.5 hover:border-cyan-500/30 transition-all">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-white font-bold">{p.title}</span>
                        <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">{p.ver}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>{p.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2: Security Radar & Cryptographic Vault (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cyan-400" />
                  <span>خزائن التشفير والحدود السيادية للبيانات</span>
                </span>

                <div className="space-y-3">
                  {[
                    { name: "خزنة الجوازات والوثائق الرسمية", status: "AES-256 ENCRYPTED", desc: "تشفير مزدوج مع تجزئة المفاتيح والتحقق البيومتري", icon: Lock, color: "text-cyan-400" },
                    { name: "بيئة الدفع والبطاقات الائتمانية", status: "PCI-DSS LEVEL 1", desc: "استخدام الرموز المميزة Tokenization دون تخزين أرقام البطاقات", icon: CreditCard, color: "text-emerald-400" },
                    { name: "رادار كشف الاختراق والأنشطة المشبوهة", status: "0 INCIDENTS", desc: "مراقبة لحظية عبر جدار حماية الذكاء الاصطناعي WAF", icon: Shield, color: "text-blue-400" },
                    { name: "نقل البيانات عبر الحدود الدولية", status: "TLS 1.3 SECURE", desc: "بروتوكول حماية مشدد عند إرسال بيانات المسافر لشركات الطيران", icon: Globe, color: "text-amber-400" },
                  ].map((v) => (
                    <div key={v.name} className="p-3.5 rounded-xl bg-[#010917] border border-cyan-500/20 space-y-1 text-right">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-white font-bold flex items-center gap-1.5">
                          <v.icon size={14} className={v.color} />
                          <span>{v.name}</span>
                        </span>
                        <span className="text-[9px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                          {v.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{v.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-[#010814] border border-cyan-500/20 text-xs text-right mt-auto">
                  <span className="text-emerald-400 font-bold block mb-1">الشهادات والاعتمادات:</span>
                  <span className="text-slate-400 text-[11px] block">
                    • مسجل ومعتمد لدى الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA).
                    <br />• متوافق بنسبة 100% مع معايير اتحاد النقل الجوي الدولي (IATA).
                  </span>
                </div>
              </div>

              {/* Col 3: Data Rights Requests & Live Audit Trail (4 cols) */}
              <div className="col-span-4 p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal size={16} className="text-cyan-400" />
                  <span>سجل التدقيق اللحظي وطلبات الخصوصية</span>
                </span>

                {/* Data Subject Requests Queue */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 font-bold block text-right">طلبات أصحاب البيانات (Data Rights):</span>
                  {[
                    { id: "SAR-4921", req: "تصدير نسخة كاملة من بيانات الحجوزات", status: "مكتمل في 4 ثوانٍ ✅" },
                    { id: "RTF-1104", req: "حق النسيان وحذف السجلات غير المحاسبية", status: "منفذ بعد إتمام الرحلة ✅" },
                  ].map((r) => (
                    <div key={r.id} className="p-2.5 rounded-lg bg-[#010917] border border-cyan-500/15 text-right text-[11px]">
                      <div className="flex justify-between font-mono text-[10px] text-cyan-400">
                        <span>{r.id}</span>
                        <span className="text-emerald-400">{r.status}</span>
                      </div>
                      <span className="text-slate-300 block mt-0.5">{r.req}</span>
                    </div>
                  ))}
                </div>

                {/* Audit Event Log */}
                <div className="flex-1 flex flex-col gap-2 mt-2">
                  <span className="text-xs text-slate-300 font-bold block text-right">سجل الأحداث الأمنية اللحظي:</span>
                  <div className="flex-1 p-3 rounded-xl bg-[#010814] border border-cyan-500/20 font-mono text-[10px] space-y-2 overflow-y-auto max-h-[190px] custom-scrollbar text-slate-300">
                    <p className="text-cyan-400">[01:14:22] تسجيل دخول المشرف من 195.154.x.x مع تحقق 2FA ناجح</p>
                    <p className="text-emerald-400">[01:12:05] اكتمال عملية إخفاء الهوية الجزئية للبيانات بنجاح</p>
                    <p className="text-slate-400">[01:05:40] فحص قواعد أمان PocketBase: اجتياز كامل 100%</p>
                    <p className="text-slate-400">[00:58:12] تجديد توكن تشفير واجهة أماديوس GDS بأمان</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 16: SETTINGS, INTEGRATION GRID & SMTP TEST                         */}
        {/* ========================================================================= */}
        {currentScreen.id === "16" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-3 gap-6">
              {/* SMTP Settings & Live Test */}
              <div className="p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-4">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings size={16} className="text-cyan-400" />
                  <span>إعدادات خادم البريد الرسمي (SMTP)</span>
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#010814]">
                    <span className="text-slate-400 block text-[10px]">الخادم Host:</span>
                    <span className="text-cyan-300">mail.lonaliza.com</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#010814]">
                    <span className="text-slate-400 block text-[10px]">المنفذ والتشفير:</span>
                    <span className="text-cyan-300">Port 587 (STARTTLS)</span>
                  </div>
                </div>
                <button
                  onClick={handleTestSmtp}
                  disabled={smtpTesting}
                  className="py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all"
                >
                  {smtpTesting ? "جاري فحص الاتصال..." : "إجراء اختبار إرسال حي (Ping SMTP)"}
                </button>
                {smtpResult && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                    {smtpResult}
                  </div>
                )}
              </div>

              {/* PocketBase & Database Health */}
              <div className="p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Database size={16} className="text-cyan-400" />
                  <span>حالة PocketBase والميكروسيرفيس</span>
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#010814] flex items-center justify-between">
                    <span>PocketBase (Port 8090)</span>
                    <span className="text-emerald-400 font-bold">ONLINE (12ms)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#010814] flex items-center justify-between">
                    <span>Redis Cache / Queues</span>
                    <span className="text-emerald-400 font-bold">CONNECTED</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#010814] flex items-center justify-between">
                    <span>PM2 Core Microservices</span>
                    <span className="text-emerald-400 font-bold">12/12 ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* AI & MCP Keys Status */}
              <div className="p-5 rounded-2xl bg-[#021024] border border-cyan-500/30 flex flex-col gap-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu size={16} className="text-cyan-400" />
                  <span>تراخيص ومفاتيح الذكاء الاصطناعي</span>
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#010814] flex items-center justify-between">
                    <span>Google Gemini 2.0 Flash</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#010814] flex items-center justify-between">
                    <span>Higgsfield AI Key</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#010814] flex items-center justify-between">
                    <span>Canva Connect OAuth</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 17: SOVEREIGN VOICE MATRIX & 6 STATES DIAL                         */}
        {/* ========================================================================= */}
        {currentScreen.id === "17" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col items-center justify-center gap-6 overflow-hidden">
            <div className="text-center">
              <h2 className="text-xl font-black text-white font-mono">
                مصفوفة القرص الصوتي وحالات الوكيل السيبراني الست
              </h2>
              <p className="text-xs text-cyan-400/80 font-mono mt-1">
                SOVEREIGN VOICE MATRIX · 6 DISCRETE CYBER STATES · HARDWARE ECHO SHIELD
              </p>
            </div>

            {/* 6 States Interactive Dial Grid */}
            <div className="grid grid-cols-3 gap-5 max-w-3xl w-full">
              {[
                { id: "idle", name: "1. الخمول (Idle)", desc: "سكون عصبي بانتظار إشارة التفعيل", color: "text-slate-300", border: "border-slate-700" },
                { id: "listening", name: "2. الاستماع (Listening)", desc: "التقاط ذبذبات صوت المستخدم وتحليل التردد", color: "text-cyan-400", border: "border-cyan-400" },
                { id: "deliberating", name: "3. التفكير (Deliberating)", desc: "معالجة التوجيه في شبكة Qdrant العصبية", color: "text-amber-400", border: "border-amber-400 shadow-[0_0_20px_#ffb54c]" },
                { id: "speaking", name: "4. الكلام (Speaking)", desc: "توليد النطق الطبيعي وإيماءات الأفاتار", color: "text-emerald-400", border: "border-emerald-400" },
                { id: "executing", name: "5. التنفيذ (Executing)", desc: "استدعاء وتفعيل أدوات MCP على المنصة", color: "text-blue-400", border: "border-blue-400" },
                { id: "interrupted", name: "6. المقاطعة (Interrupted)", desc: "إيقاف فوري للحديث عند مقاطعة المستخدم", color: "text-rose-400", border: "border-rose-400" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSimulatedVoiceState(st.id as any)}
                  className={`p-5 rounded-2xl bg-[#021022] border text-right transition-all flex flex-col gap-2 ${
                    simulatedVoiceState === st.id
                      ? `${st.border} bg-[#031936] shadow-xl scale-105`
                      : "border-cyan-500/20 hover:border-cyan-500/40"
                  }`}
                >
                  <span className={`text-sm font-bold font-mono ${st.color}`}>{st.name}</span>
                  <span className="text-xs text-slate-400 leading-relaxed">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 18: WINDOW MANAGER & WORKSPACE INTERACTION STATES                 */}
        {/* ========================================================================= */}
        {currentScreen.id === "18" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Header Telemetry */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div>
                <h2 className="text-lg font-black text-white font-mono tracking-wide">
                  معمل إدارة النوافذ التفاعلية ومساحات العمل (HUD Window Lab)
                </h2>
                <span className="text-xs font-mono text-cyan-400">
                  WORKSPACE WINDOW MANAGER · 2.5D GLASS PANELS · DOCKING · MULTI-SURFACE TILES
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-[#010814] p-1 border border-cyan-500/20 text-xs font-mono">
                  {(["quad", "horizontal", "vertical", "freeform"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setWorkspaceLayoutMode(mode)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        workspaceLayoutMode === mode
                          ? "bg-cyan-500/30 text-cyan-300 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode === "quad" ? "رباعي" : mode === "horizontal" ? "أفقي" : mode === "vertical" ? "رأسي" : "حر"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Multi-Window Interactive Canvas */}
            <div className={`flex-1 min-h-[560px] gap-4 ${
              workspaceLayoutMode === "quad"
                ? "grid grid-cols-2 grid-rows-2"
                : workspaceLayoutMode === "horizontal"
                ? "grid grid-rows-4"
                : workspaceLayoutMode === "vertical"
                ? "grid grid-cols-4"
                : "relative flex flex-wrap"
            }`}>
              {/* Window A: Flight Radar Stream */}
              <div className="p-4 rounded-2xl bg-[#021024]/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex flex-col gap-2 relative">
                {/* Titlebar */}
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs font-mono">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Plane size={14} className="text-cyan-400" />
                    <span>رادار الرحلات الجوية الفوري (Flight Radar Stream)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 text-cyan-400 text-[10px]">_</button>
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 text-cyan-400 text-[10px]">□</button>
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-rose-950/60 hover:bg-rose-900 text-rose-400 text-[10px]">✕</button>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-3 rounded-xl bg-[#010814] flex flex-col justify-between font-mono text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>SV-104 · الرياض -&gt; دبي</span>
                    <span className="text-emerald-400">EN ROUTE (FL380)</span>
                  </div>
                  <div className="h-20 w-full relative flex items-center justify-center border border-cyan-500/20 rounded-lg overflow-hidden bg-[#020b18]">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:16px_16px]" />
                    <span className="text-[11px] text-cyan-400 font-bold z-10 flex items-center gap-2">
                      <Plane size={16} className="text-cyan-300 animate-pulse" />
                      <span>LIVE TELEMETRY: 512 KTS · PNR: 7KJ94A</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>ETA: 03:45 م</span>
                    <span>مسافة متبقية: 384 كم</span>
                  </div>
                </div>
              </div>

              {/* Window B: Customer Live Chat */}
              <div className="p-4 rounded-2xl bg-[#021024]/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex flex-col gap-2 relative">
                {/* Titlebar */}
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs font-mono">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-cyan-400" />
                    <span>محادثة واتساب العميل (WhatsApp Bridge)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 text-cyan-400 text-[10px]">_</button>
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 text-cyan-400 text-[10px]">□</button>
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-rose-950/60 hover:bg-rose-900 text-rose-400 text-[10px]">✕</button>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-3 rounded-xl bg-[#010814] flex flex-col justify-between text-xs space-y-2">
                  <div className="p-2.5 rounded-lg bg-[#02142a] text-slate-200 text-right leading-relaxed text-[11px]">
                    &quot;هل يمكن تعديل تاريخ العودة لرحلة إسطنبول ليوم الجمعة بدلاً من الخميس؟&quot;
                  </div>
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-right leading-relaxed text-[11px]">
                    &quot;تم التحقق عبر نظام أماديوس: التعديل متاح مجاناً وفق شروط التذكرة المرنة. هل أؤكد العملية؟&quot;
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-cyan-500/10">
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      تأكيد التعديل الفوري
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono mr-auto">العميل نشط الآن</span>
                  </div>
                </div>
              </div>

              {/* Window C: Terminal MCP Execution */}
              <div className="p-4 rounded-2xl bg-[#021024]/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex flex-col gap-2 relative">
                {/* Titlebar */}
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs font-mono">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Terminal size={14} className="text-cyan-400" />
                    <span>وحدة أوامر MCP النشطة (Terminal Console)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 text-cyan-400 text-[10px]">_</button>
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 text-cyan-400 text-[10px]">□</button>
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-rose-950/60 hover:bg-rose-900 text-rose-400 text-[10px]">✕</button>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-3 rounded-xl bg-[#010814] font-mono text-[10px] space-y-1.5 text-slate-300 overflow-y-auto max-h-[150px] custom-scrollbar">
                  <p className="text-cyan-400">&gt; POST /api/admin/mcp/call</p>
                  <p className="text-slate-400">  {`{"serverId": "liotrip-higgsfield", "tool": "generate_video"}`}</p>
                  <p className="text-emerald-400">&gt; 200 OK — Render job dispatched to AI Video Pipeline (4K 60FPS)</p>
                  <p className="text-cyan-400">&gt; POST /api/admin/mcp/call</p>
                  <p className="text-slate-400">  {`{"serverId": "liotrip-canva", "tool": "create_social_asset"}`}</p>
                  <p className="text-emerald-400">&gt; 200 OK — Asset ID #CNV-9812 created in Media Library</p>
                </div>
              </div>

              {/* Window D: Audio Spectrogram */}
              <div className="p-4 rounded-2xl bg-[#021024]/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex flex-col gap-2 relative">
                {/* Titlebar */}
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs font-mono">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Volume2 size={14} className="text-cyan-400" />
                    <span>محلل الترددات الصوتية للأفاتار (Spectrogram)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 text-cyan-400 text-[10px]">_</button>
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 text-cyan-400 text-[10px]">□</button>
                    <button className="w-5 h-5 rounded flex items-center justify-center bg-rose-950/60 hover:bg-rose-900 text-rose-400 text-[10px]">✕</button>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-3 rounded-xl bg-[#010814] flex flex-col justify-between">
                  <div className="flex items-end justify-between h-24 gap-1 px-4">
                    {[40, 65, 80, 50, 95, 70, 85, 60, 90, 75, 45, 80, 65, 90, 55, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-cyan-600 via-cyan-400 to-amber-300 transition-all duration-300"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400 pt-2 border-t border-cyan-500/10">
                    <span>AUDIO ENGINE: 48kHz 24-bit</span>
                    <span className="text-emerald-400">LATENCY: 18ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 19: EXECUTIVE COMMAND & 6 HEXAGONAL PODS                           */}
        {/* ========================================================================= */}
        {currentScreen.id === "19" && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div>
                <h2 className="text-lg font-black text-white font-mono tracking-wide">
                  غرفة القيادة التنفيذية — العناقيد السداسية الستة
                </h2>
                <span className="text-xs font-mono text-cyan-400">
                  EXECUTIVE COMMAND PODS · 24H REALTIME TELEMETRY
                </span>
              </div>
              <button
                onClick={onOpenMcpDispatcher}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_15px_#00e5ff]"
              >
                تحديث المؤشرات التنفيذية (Admin MCP) ↗
              </button>
            </div>

            {/* 6 Hexagonal Pods Grid */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { title: "عنقود الإيرادات الكلية", value: "$307,420", sub: "+18.4% نمو أسبوعي", color: "text-amber-400", border: "border-amber-400/40" },
                { title: "عنقود الحجوزات النشطة", value: "38 حجزاً مؤكداً", sub: "100% إصدار فوري PNR", color: "text-cyan-400", border: "border-cyan-400/40" },
                { title: "عنقود اتصال الموردين", value: "100% متصل", sub: "GDS, PKFare, Seeru, Bedbanks", color: "text-emerald-400", border: "border-emerald-400/40" },
                { title: "عنقود كفاءة الوكلاء", value: "99.4% نجاح", sub: "16 وكيلاً سيبرانياً في السرب", color: "text-cyan-300", border: "border-cyan-500/40" },
                { title: "عنقود التحويل الإعلاني", value: "4.82x ROAS", sub: "Google & Meta Click-to-WhatsApp", color: "text-emerald-300", border: "border-emerald-500/40" },
                { title: "عنقود شبكة B2B والتوريد", value: "$1,420,000", sub: "42 وكالة شريكة مرخصة", color: "text-amber-300", border: "border-amber-500/40" },
              ].map((pod, idx) => (
                <div
                  key={pod.title}
                  className={`p-6 rounded-2xl bg-[#021024] border ${pod.border} shadow-[0_0_25px_rgba(0,0,0,0.8)] flex flex-col gap-2 relative overflow-hidden`}
                >
                  <span className="text-xs font-mono text-slate-400">{pod.title}</span>
                  <span className={`text-2xl font-black font-mono ${pod.color} mt-1`}>{pod.value}</span>
                  <span className="text-[11px] font-mono text-slate-400">{pod.sub}</span>

                  {/* Simulated Sparkline Curve */}
                  <svg className="w-full h-10 mt-2" viewBox="0 0 200 40">
                    <path
                      d="M 0 30 Q 50 10 100 25 T 200 12"
                      fill="none"
                      stroke={idx % 2 === 0 ? "#00e5ff" : "#ffb54c"}
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 20: JARVIS HUMANOID PRESENCE AVATAR STUDIO                         */}
        {/* ========================================================================= */}
        {currentScreen.id === "20" && (
          <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden">
            <HumanoidMasterAvatar
              frequencies={voiceFrequencies}
              isUserSpeaking={false}
              isAgentSpeaking={isSpeaking}
              isProcessing={false}
              agentStatus="speaking"
              slowCamera={true}
              onEnterSwarmWorkspace={() => onSelectScreen("01")}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* FALLBACK / OTHER SCREENS (05, 06, 10, 12, 13, 14, 15, 18)                 */}
        {/* ========================================================================= */}
        {![
          "01",
          "02",
          "03",
          "04",
          "05",
          "06",
          "07",
          "08",
          "09",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15",
          "16",
          "17",
          "18",
          "19",
          "20",
        ].includes(currentScreen.id) && (
          <div className="flex-1 w-full h-full p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Header Description */}
            <div className="p-6 rounded-2xl bg-[#021024] border border-cyan-500/30 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">{currentScreen.title}</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {currentScreen.scope}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMcpDispatcher}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs shadow-[0_0_15px_#00e5ff]"
                >
                  استدعاء أداة ذات صلة (MCP) ↗
                </button>
              </div>
            </div>

            {/* Nodes Layout Grid */}
            <div className="grid grid-cols-4 gap-4">
              {currentScreen.nodes.map((node, idx) => (
                <div
                  key={node}
                  onClick={() => setSelectedNodeIndex(idx)}
                  className={`p-4 rounded-xl border text-right transition-all cursor-pointer ${
                    selectedNodeIndex === idx
                      ? "bg-[#031d38] border-cyan-400 shadow-[0_0_15px_#00e5ff]"
                      : "bg-[#010917] border-cyan-500/20 hover:border-cyan-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400">NODE 0{idx + 1}</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <div className="text-xs font-bold text-white mt-1">{node}</div>
                </div>
              ))}
            </div>

            {/* Operational Scenario Box */}
            <div className="p-5 rounded-2xl bg-[#010714] border border-cyan-500/20 text-xs">
              <span className="text-cyan-400 font-bold block mb-1">السيناريو التشغيلي الميداني:</span>
              <p className="text-slate-300 leading-relaxed">{currentScreen.scenario}</p>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Bottom HUD Bar */}
      <footer className="relative z-30 h-14 px-6 border-t border-cyan-500/30 bg-[#020b18]/95 backdrop-blur-2xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-white font-bold">20/20 SCREENS ACTIVE</span>
          </div>
          <span className="text-cyan-500/40">|</span>
          <span className="text-cyan-400">الواجهة الحالية: {currentScreen.id} · {currentScreen.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReferenceImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-all"
          >
            <Eye size={14} />
            <span>عرض الصورة المرجعية الأصلية</span>
          </button>

          <button
            onClick={onOpenMcpDispatcher}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs font-mono shadow-[0_0_15px_#00e5ff] transition-all active:scale-95"
          >
            <Zap size={14} className="fill-black" />
            <span>تشغيل أدوات MCP (21 خادماً · 88 أداة)</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
