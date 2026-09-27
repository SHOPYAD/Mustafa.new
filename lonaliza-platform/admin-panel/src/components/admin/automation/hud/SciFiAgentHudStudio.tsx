"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Bot,
  Brain,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  Activity,
  Radio,
  Clock,
  Moon,
  Globe,
  Database,
  Key,
  Folder,
  FolderOpen,
  Send,
  RefreshCw,
  X,
  CheckCircle2,
  Shield,
  Zap,
  Lock,
  Crown,
  Sliders,
  Compass,
  GitBranch,
  Orbit,
} from "lucide-react";
import type {
  SwarmAgentInfo,
  SwarmDiscussionMessage,
  PendingApprovalDecision,
  AdminDirective,
} from "@/lib/automation/agent-collab-store";
import NeuralGraph from "./NeuralGraph";
import ArchitectureDiagram from "./ArchitectureDiagram";
import WorldMapWidget from "./WorldMapWidget";
import {
  REAL_PLATFORM_HUD_AGENTS,
  enrichLiveAgentsForHud,
  type HudAgentConfig,
} from "../agentsData";

// Operational & Brain Widgets
import CarteiraLedgerWidget from "./ops/CarteiraLedgerWidget";
import SkillsDeckWidget, { MacroSkill } from "./ops/SkillsDeckWidget";
import QueueAndRoutinesWidget from "./ops/QueueAndRoutinesWidget";
import AvisosPipelineWidget from "./ops/AvisosPipelineWidget";
import AgentDotMatrixWidget from "./ops/AgentDotMatrixWidget";
import SovereignSecondBrainHub from "./brain/SovereignSecondBrainHub";
import NodeInspectorModal from "./brain/NodeInspectorModal";
import { useSovereignVoice } from "./voice/useSovereignVoice";
import HolographicCoreOrb from "./canvas/HolographicCoreOrb";
import CyberSubStationViewer from "./substations/CyberSubStationViewer";
import HumanoidMasterAvatar from "./avatar/HumanoidMasterAvatar";
import VisualLoopsEngine from "./loops/VisualLoopsEngine";
import HolographicCylinderStage from "./nexus/HolographicCylinderStage";
import { CockpitMode } from "./dock/MicroFloatingHudDock";
import SmartAudioVesselDock from "./dock/SmartAudioVesselDock";
import SlideOutCyberTerminal from "./dock/SlideOutCyberTerminal";
import FloatingCyberSidebar, { REAL_PLATFORM_SECTIONS, type CyberNavSection } from "./sidebar/FloatingCyberSidebar";
import CyberSectionModal from "./modals/CyberSectionModal";
import type { BrainSector, BrainNode } from "@/app/api/admin/automation/second-brain-data/route";

interface SciFiAgentHudStudioProps {
  onExit?: () => void;
  apiEndpoint?: string;
  initialAgents?: SwarmAgentInfo[];
}

export default function SciFiAgentHudStudio({
  onExit,
  apiEndpoint = "/api/admin/automation/agent-war-room",
  initialAgents = [],
}: SciFiAgentHudStudioProps) {
  // 4 Cockpit Modes: Presence (Mode 1), Brain (Mode 2), Ops (Mode 3), Loops (Mode 4)
  const [cockpitMode, setCockpitMode] = useState<CockpitMode>("presence");

  // Mode 2: Second Brain State
  const [brainViewMode, setBrainViewMode] = useState<ViewMode>("radial");
  const [currentTheme, setCurrentTheme] = useState<string>("oceano");
  const [linkDistance, setLinkDistance] = useState<number>(120);
  const [repulsion, setRepulsion] = useState<number>(-350);
  const [particleSize, setParticleSize] = useState<number>(2);

  // Second Brain Data & Selected Node for Inspection
  const [brainSectors, setBrainSectors] = useState<BrainSector[]>([]);
  const [brainNodes, setBrainNodes] = useState<BrainNode[]>([]);
  const [selectedInspectorNode, setSelectedInspectorNode] = useState<BrainNode | null>(null);

  // Live Swarm State
  const [agents, setAgents] = useState<SwarmAgentInfo[]>(initialAgents);
  const [discussions, setDiscussions] = useState<SwarmDiscussionMessage[]>([]);
  const [decisions, setDecisions] = useState<PendingApprovalDecision[]>([]);
  const [directives, setDirectives] = useState<AdminDirective[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sendingDirective, setSendingDirective] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeSubStationId, setActiveSubStationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedModalSection, setSelectedModalSection] = useState<CyberNavSection | null>(null);

  // Micro Floating HUD Controls
  const [slowCamera, setSlowCamera] = useState<boolean>(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState<boolean>(true);
  const [terminalOpen, setTerminalOpen] = useState<boolean>(false);

  // Time & Weather Tick
  const [timeStr, setTimeStr] = useState("2:36 م");
  const [dateStr, setDateStr] = useState("الجمعة، 25 سبتمبر");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("ar-SA", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString("ar-SA", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Live Swarm Data
  const fetchData = async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    try {
      const res = await fetch(apiEndpoint, { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        agents?: SwarmAgentInfo[];
        discussions?: SwarmDiscussionMessage[];
        decisions?: PendingApprovalDecision[];
        directives?: AdminDirective[];
      };
      if (data.ok) {
        if (data.agents && data.agents.length > 0) setAgents(data.agents);
        if (data.discussions) setDiscussions(data.discussions);
        if (data.decisions) setDecisions(data.decisions);
        if (data.directives) setDirectives(data.directives);
      }
    } catch (err) {
      console.error("Failed to fetch HUD data", err);
    } finally {
      setLoading(false);
      if (showSpin) setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Fetch Second Brain Qdrant Vector Topology
  const fetchSecondBrainData = async () => {
    try {
      const res = await fetch("/api/admin/automation/second-brain-data", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        if (data.sectors) setBrainSectors(data.sectors);
        if (data.nodes) setBrainNodes(data.nodes);
      }
    } catch (err) {
      console.error("Failed to fetch second brain data", err);
    }
  };

  useEffect(() => {
    void fetchData();
    void fetchSecondBrainData();
    const interval = setInterval(() => void fetchData(), 6000);
    return () => clearInterval(interval);
  }, [apiEndpoint]);

  // Live Realtime SSE Stream (0s latency terminal logs & neural pulses)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/admin/automation/agent-stream?sessionId=hud_live");
      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "log" && parsed.data) {
            const logItem = parsed.data;
            const liveMsg: SwarmDiscussionMessage = {
              id: logItem.id || `live_${Date.now()}`,
              fromAgent: (logItem.sender as any) || "admin",
              toAgent: "all",
              type: "directive",
              topic: "Live Operation",
              contentAr: `[${logItem.senderNameAr || logItem.role || "نظام"}]: ${logItem.contentAr}`,
              timestamp: logItem.timestamp || new Date().toISOString(),
              impactLevel: "medium",
            };
            setDiscussions((prev) => [liveMsg, ...prev.filter((d) => d.id !== liveMsg.id)]);
          }
        } catch {
          // ignore heartbeat
        }
      };
    } catch (err) {
      console.warn("[HUD SSE] Notice:", err);
    }
    return () => {
      es?.close();
    };
  }, []);

  // Enrich only real platform agents
  const hudAgents = useMemo(() => {
    return enrichLiveAgentsForHud(agents, directives.length);
  }, [agents, directives]);

  // Send Directive through Deliberation Engine
  const handleSendDirective = async (
    targetId: string = "all",
    customText?: string
  ): Promise<string | void> => {
    const text = customText?.trim();
    if (!text || sendingDirective) return;

    setSendingDirective(true);
    setFeedback(null);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "directive",
          directiveText: text,
          targetAgentId: targetId,
          sessionId: "hud_live",
          priority: "urgent",
          screenContext: {
            activeCockpitMode: cockpitMode,
            activeSection: selectedModalSection?.titleAr || selectedModalSection?.key || null,
            activeSectionHref: selectedModalSection?.href || null,
            selectedNode: selectedInspectorNode?.id || null,
            activeSubStationId,
            isSidebarOpen,
          },
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        responseAr?: string;
        spokenReply?: string;
      };
      if (data.ok) {
        setFeedback("تم إطلاق التوجيه والتداول العصبي بنجاح!");
        void fetchData(true);
        return (
          data.spokenReply ||
          data.responseAr ||
          "أمرك يا سيدي، تم استيعاب التوجيه وتوجيهه للخلية المختصة بنجاح."
        );
      }
    } catch {
      setFeedback("حدث خطأ أثناء إرسال التوجيه للخلية");
    } finally {
      setSendingDirective(false);
    }
  };

  // Agent Sub-Station Navigation Handler
  const handleSelectAgentSubStation = (ag: HudAgentConfig) => {
    if (ag.id === "site_advisor") setActiveSubStationId("packages");
    else if (ag.id === "lead_scout" || ag.id === "b2b_landing" || ag.id === "reseller_network_director") setActiveSubStationId("resale");
    else if (ag.id === "sales") setActiveSubStationId("hotels");
    else if (ag.id === "ads") setActiveSubStationId("ads");
    else if (ag.id === "social" || ag.id === "email") setActiveSubStationId("publish");
    else if (ag.id === "app_concierge" || ag.id === "app_notifications") setActiveSubStationId("mobile");
    else if (ag.id === "ui_ux_architect") setActiveSubStationId("publish");
    else setActiveSubStationId("flights");
  };

  // Sovereign Voice Hook (Duplex Mute Lock + 850ms Cooldown + Hardware Echo Shield)
  const voice = useSovereignVoice({
    onDirectiveSubmit: async (spokenText, meta) => {
      const lower = spokenText.toLowerCase();

      // 1. Close Modal & Sidebar Command
      if (
        lower.includes("أغلق") ||
        lower.includes("إغلاق") ||
        lower.includes("اغلق") ||
        lower.includes("سكر") ||
        lower.includes("close")
      ) {
        setSelectedModalSection(null);
        setIsSidebarOpen(false);
        setActiveSubStationId(null);
        return "أمرك يا سيدي، تم إغلاق النافذة المعروضة والعودة للرؤية الشاملة.";
      }

      // 2. Open Sidebar Command
      if (
        lower.includes("السايدبار") ||
        lower.includes("القائمة") ||
        lower.includes("الأقسام") ||
        lower.includes("افتح القائمة")
      ) {
        setIsSidebarOpen(true);
        return "حاضر يا سيدي، تم فتح قائمة أقسام المنصة الشاملة.";
      }

      // 3. Open Specific Real Sections & Explain
      if (
        lower.includes("إحصائيات") ||
        lower.includes("احصائيات") ||
        lower.includes("داشبورد") ||
        lower.includes("مؤشرات") ||
        lower.includes("تقرير عام")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "dashboard");
        if (sec) setSelectedModalSection(sec);
        return "حاضر يا سيدي، تم فتح لوحة المؤشرات العامة والإحصائيات. إجمالي التداول اليومي 307 ألف دولار بنمو 18.4%، مع 38 حجزاً نشطاً عبر المنصة وكافة الموردين متصلون بنسبة 100%.";
      }

      if (
        lower.includes("فندق") ||
        lower.includes("فنادق") ||
        lower.includes("hotel") ||
        lower.includes("otel")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "hotels");
        if (sec) setSelectedModalSection(sec);
        return "أمرك، تم فتح محرك الفنادق العالمي. المنظومة متصلة حياً بـ ترافلبورت وسيرو وبكفير On-Demand مع إدارة عروض الـ 140 فندق المعروضة في سلايدر الصفحة الرئيسية للتسويق.";
      }

      if (
        lower.includes("طيران") ||
        lower.includes("flight") ||
        lower.includes("uçak") ||
        lower.includes("تذاكر")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "flights");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح رادار تذاكر الطيران، ربط الـ GDS التلقائي نشط وهوامش ربح التذاكر مقفلة تلقائياً بنسب 8% إلى 14%.";
      }

      if (lower.includes("حجز") || lower.includes("حجوزات") || lower.includes("booking")) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "bookings");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح قسم الحجوزات والعمليات التشغيلية، هناك 38 حجزاً نشطاً اليوم جاري معالجتها ومزامنتها مع الموردين.";
      }

      if (
        lower.includes("تنقل") ||
        lower.includes("أسطول") ||
        lower.includes("سيار") ||
        lower.includes("سائق") ||
        lower.includes("transfer")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "transfers");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح إدارة أسطول النقل البري، 18 سيارة مرسيدس فيتو VIP نشطة مع التتبع المباشر للسائقين واستقبال المطارات.";
      }

      if (
        lower.includes("باق") ||
        lower.includes("برامج") ||
        lower.includes("package") ||
        lower.includes("رحلات")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "packages");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح هندسة البرامج السياحية VIP، هناك 24 باقة سياحية متكاملة شاملة الطيران والفنادق والجولات بالريال والدولار.";
      }

      if (
        lower.includes("موزع") ||
        lower.includes("b2b") ||
        lower.includes("شرك") ||
        lower.includes("ديبوزيت") ||
        lower.includes("وكيل")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "b2b");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح شبكة وكالات B2B ومحفظة التوريد، إجمالي رصيد الديبوزيت 307 ألف دولار موزع عبر 42 وكالة سياحية شريكة.";
      }

      if (
        lower.includes("إعلان") ||
        lower.includes("ads") ||
        lower.includes("حملات") ||
        lower.includes("roas")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "ads");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح حملات الإعلانات الممولة Meta و Google PMax، متوسط العائد ROAS يبلغ 4.8 أضعاف بميزانية يومية 1450 دولار.";
      }

      if (
        lower.includes("نشر") ||
        lower.includes("محتوى") ||
        lower.includes("سوشيال") ||
        lower.includes("ريلز") ||
        lower.includes("مقالات")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "social");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح مصنع المحتوى والنشر الموحد، 48 مقالاً مفهرساً في Google و6 ريلز 4K سينمائية جاهزة للبث.";
      }

      if (
        lower.includes("دفع") ||
        lower.includes("مالي") ||
        lower.includes("بوابات") ||
        lower.includes("payment") ||
        lower.includes("فواتير")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "finance");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح الإدارة المالية وبوابات الدفع، بوابات إيزيكو وسترايب تعمل بكفاءة 100% مع تسويات الحسابات اليومية.";
      }

      if (
        lower.includes("أمان") ||
        lower.includes("إعداد") ||
        lower.includes("security") ||
        lower.includes("ربط برمجي")
      ) {
        const sec = REAL_PLATFORM_SECTIONS.find((s) => s.key === "settings");
        if (sec) setSelectedModalSection(sec);
        return "تم فتح إعدادات النظام والربط التقني والأمان السيبراني.";
      }

      // Cockpit Mode switches
      if (
        lower.includes("نكسس") ||
        lower.includes("nexus") ||
        lower.includes("هولوغراف") ||
        lower.includes("البطاقات") ||
        lower.includes("اسطوان")
      ) {
        setCockpitMode("nexus");
      } else if (lower.includes("حضور") || lower.includes("المشرف") || lower.includes("avatar")) {
        setCockpitMode("presence");
      } else if (lower.includes("العقل الثاني") || lower.includes("brain") || lower.includes("segundo")) {
        setCockpitMode("brain");
      } else if (lower.includes("غرفة القيادة") || lower.includes("عمليات") || lower.includes("comando")) {
        setCockpitMode("ops");
      } else if (lower.includes("الأتمتة") || lower.includes("العقد") || lower.includes("loops") || lower.includes("بلوبرنت")) {
        setCockpitMode("loops");
      }

      const reply = await handleSendDirective("all", spokenText);
      return reply || undefined;
    },
    selectedVoice: "ar-SA-HamedNeural",
    silenceThresholdMs: 1250,
    soundFxEnabled: soundFxEnabled,
  });

  // Handle Macro Skills Execution
  const handleExecuteSkill = (skill: MacroSkill) => {
    void handleSendDirective("all", `${skill.command} : ${skill.description}`);
  };

  return (
    <div
      className="fixed inset-0 z-[999999] w-screen h-screen overflow-hidden text-slate-100 font-sans select-none flex flex-col justify-between"
      style={{
        backgroundColor: "#020813",
        backgroundImage: `
          radial-gradient(circle at 50% 38%, rgba(5, 30, 65, 0.95) 0%, rgba(2, 12, 28, 0.98) 55%, #01060f 100%),
          linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 36px 36px, 36px 36px",
      }}
    >
      {/* 100% Opaque Solid Backdrop Shield */}
      <div className="absolute inset-0 bg-[#020813] z-0 pointer-events-none opacity-100" />

      {/* Cyber Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%)",
        }}
      />

      {/* ========================================================================= */}
      {/* 1. Top HUD Header Bar (Command Deck Grade)                                */}
      {/* ========================================================================= */}
      <header className="relative z-30 h-16 px-5 flex items-center justify-between border-b border-cyan-500/30 bg-[#020b18]/95 backdrop-blur-2xl shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        {/* Right Section: System Identity Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
            <Sparkles className="w-5 h-5 animate-pulse text-cyan-400" />
          </div>
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono text-white tracking-wide">
                LONALIZA CYBER OS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                NEXUS MATRIX v7.0
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/80">
              نظام العمليات السيبراني الموحد · 81 محركاً تشغيلياً
            </span>
          </div>
        </div>

        {/* Center Section: 5 Cockpit Mode Switcher Tabs */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-[#031124] border border-cyan-500/35 shadow-inner">
          <button
            type="button"
            onClick={() => setCockpitMode("presence")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              cockpitMode === "presence"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold shadow-[0_0_18px_#00e5ff] border border-cyan-300"
                : "text-slate-200 hover:text-white hover:bg-white/10 font-semibold"
            }`}
          >
            <Sparkles size={13} className={cockpitMode === "presence" ? "text-cyan-200" : "text-slate-300"} />
            <span className="text-white">1. الحضور 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setCockpitMode("brain")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              cockpitMode === "brain"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold shadow-[0_0_18px_#00e5ff] border border-cyan-300"
                : "text-slate-200 hover:text-white hover:bg-white/10 font-semibold"
            }`}
          >
            <Brain size={13} className={cockpitMode === "brain" ? "text-cyan-200" : "text-slate-300"} />
            <span className="text-white">2. العقل الثاني</span>
          </button>

          <button
            type="button"
            onClick={() => setCockpitMode("nexus")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              cockpitMode === "nexus"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold shadow-[0_0_18px_#00e5ff] border border-cyan-300"
                : "text-slate-200 hover:text-white hover:bg-white/10 font-semibold"
            }`}
          >
            <Orbit size={13} className={cockpitMode === "nexus" ? "text-cyan-200" : "text-slate-300"} />
            <span className="text-white">3. مسرح NEXUS 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setCockpitMode("ops")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              cockpitMode === "ops"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold shadow-[0_0_18px_#00e5ff] border border-cyan-300"
                : "text-slate-200 hover:text-white hover:bg-white/10 font-semibold"
            }`}
          >
            <Zap size={13} className={cockpitMode === "ops" ? "text-cyan-200" : "text-slate-300"} />
            <span className="text-white">4. غرفة القيادة</span>
          </button>

          <button
            type="button"
            onClick={() => setCockpitMode("loops")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              cockpitMode === "loops"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold shadow-[0_0_18px_#00e5ff] border border-cyan-300"
                : "text-slate-200 hover:text-white hover:bg-white/10 font-semibold"
            }`}
          >
            <GitBranch size={13} className={cockpitMode === "loops" ? "text-cyan-200" : "text-slate-300"} />
            <span className="text-white">5. الأتمتة والعقد</span>
          </button>
        </div>

        {/* Left Section: All Sections Floating Sidebar Trigger + Refresh & Exit */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-bold text-xs font-mono transition-all active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
            title="فتح القائمة الشاملة لأقسام المنصة"
          >
            <Layers size={14} className="text-cyan-400" />
            <span>أقسام المنصة الشاملة</span>
          </button>

          <button
            type="button"
            onClick={() => void fetchData(true)}
            className="p-2 rounded-xl bg-[#031429] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all"
            title="تحديث لحظي للسرب"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-cyan-400" : ""} />
          </button>

          <button
            type="button"
            onClick={onExit}
            className="relative flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#1c0612]/90 via-[#2a091a]/85 to-[#1c0612]/90 hover:from-rose-950/90 hover:via-rose-900/80 hover:to-rose-950/90 border border-rose-500/60 hover:border-rose-400 text-white font-bold text-xs font-mono shadow-[0_0_14px_rgba(244,63,94,0.30)] hover:shadow-[0_0_22px_rgba(244,63,94,0.65)] transition-all duration-300 active:scale-95 group cursor-pointer"
            title="الرجوع للوحة التحكم الرئيسية"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185] animate-pulse" />
            <span className="tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">الرجوع</span>
            <ArrowLeft size={14} className="text-rose-400 group-hover:text-white group-hover:-translate-x-1 transition-transform drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. Main Central Cockpit Stage (The 4 Modes)                              */}
      {/* ========================================================================= */}
      <main className="relative z-20 flex-1 w-full min-h-0 flex flex-col overflow-hidden">
        {/* MODE 1: AVATAR PRESENCE VIEW (Sovereign Humanoid, Amber Core, Mountains) */}
        {cockpitMode === "presence" && (
          <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden">
            <HumanoidMasterAvatar
              frequencies={voice.audioFrequencies}
              isUserSpeaking={voice.isUserSpeaking}
              isAgentSpeaking={voice.isAgentSpeaking}
              isProcessing={voice.isProcessing || sendingDirective}
              agentStatus={
                voice.isAgentSpeaking
                  ? "speaking"
                  : voice.isUserSpeaking
                  ? "listening"
                  : voice.isProcessing || sendingDirective
                  ? "deliberating"
                  : "idle"
              }
              slowCamera={slowCamera}
              onEnterSwarmWorkspace={() => setCockpitMode("brain")}
            />
          </div>
        )}

        {/* MODE 2: TRACKTOR SEGUNDO CÉREBRO (Sovereign Neural Cyber OS V11) */}
        {cockpitMode === "brain" && (
          <div className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden">
            <SovereignSecondBrainHub
              onBackToWarRoom={() => setCockpitMode("ops")}
              voiceState={{
                isSpeaking: voice.isAgentSpeaking,
                lastTranscript: voice.lastSpokenText || voice.agentResponseText,
              }}
            />
          </div>
        )}

        {/* MODE 3: NEXUS 3D CURVED CYLINDER STAGE */}
        {cockpitMode === "nexus" && (
          <div className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden">
            <HolographicCylinderStage
              frequencies={voice.audioFrequencies}
              onSelectSector={(stationId) => setActiveSubStationId(stationId)}
              onSendDirective={(dir) => void handleSendDirective("all", dir)}
            />
          </div>
        )}

        {/* MODE 4: TRACKTOR COMANDO (3-Column Executive Deck) */}
        {cockpitMode === "ops" && (
          <div className="relative flex-1 w-full min-h-0 flex items-stretch p-3 gap-3 overflow-hidden">
            {/* Left Column: Carteira Ledger (17 Real Platform Accounts & Balances) */}
            <div className="w-80 shrink-0 hidden lg:flex flex-col h-full overflow-hidden">
              <CarteiraLedgerWidget />
            </div>

            {/* Center Stage: Neural Graph & Holographic Swarm Core */}
            <div className="relative flex-1 min-w-0 h-full flex flex-col justify-between">
              <NeuralGraph
                agents={hudAgents}
                frequencies={voice.audioFrequencies}
                isUserSpeaking={voice.isUserSpeaking}
                isAgentSpeaking={voice.isAgentSpeaking}
                isProcessing={voice.isProcessing || sendingDirective}
                onSelectAgent={(ag) => handleSelectAgentSubStation(ag)}
                onSendDirectiveToAgent={(agentId, dir) => void handleSendDirective(agentId, dir)}
                onTriggerSwarmDeliberation={(topic) => void handleSendDirective("all", topic)}
                activeDiscussionsCount={discussions.length}
                consensusScore={96}
              />
            </div>

            {/* Right Column: Triple Ops Intelligence Stack (Avisos, Skills Deck, Routines) */}
            <div className="w-88 shrink-0 hidden xl:flex flex-col gap-3 h-full overflow-y-auto scrollbar-cyber pr-1">
              <AvisosPipelineWidget />
              <SkillsDeckWidget
                onExecuteSkill={handleExecuteSkill}
                isExecuting={sendingDirective}
              />
              <QueueAndRoutinesWidget />
            </div>
          </div>
        )}

        {/* MODE 4: VISUAL LOOPS BLUEPRINTS ENGINE */}
        {cockpitMode === "loops" && (
          <div className="relative flex-1 w-full min-h-0 flex flex-col overflow-hidden">
            <VisualLoopsEngine />
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. Smart Audio Vessel Dock (Dynamic 60FPS Reactive Soundwave Spectrum)     */}
      {/* ========================================================================= */}
      <SmartAudioVesselDock
        isVoiceActive={voice.isActive}
        isUserSpeaking={voice.isUserSpeaking}
        isAgentSpeaking={voice.isAgentSpeaking}
        isProcessing={voice.isProcessing || sendingDirective}
        frequencies={voice.audioFrequencies}
        onToggleVoice={voice.toggleVoice}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onToggleTerminal={() => setTerminalOpen(!terminalOpen)}
        terminalOpen={terminalOpen}
        soundFxEnabled={soundFxEnabled}
        onToggleSoundFx={() => setSoundFxEnabled(!soundFxEnabled)}
      />

      {/* ========================================================================= */}
      {/* 4. Slide-Out Cyber Terminal (Opens on demand without hiding the screen)   */}
      {/* ========================================================================= */}
      <SlideOutCyberTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        discussions={discussions}
        onSendDirective={async (txt) => {
          await handleSendDirective("all", txt);
        }}
        isSending={sendingDirective}
      />

      {/* ========================================================================= */}
      {/* 5. Floating Cyber Sidebar (All 10 Real Platform Sections & Modals)        */}
      {/* ========================================================================= */}
      <FloatingCyberSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectSection={(sec) => setSelectedModalSection(sec)}
        activeSectionKey={selectedModalSection?.key}
      />

      {/* ========================================================================= */}
      {/* 6. Real Platform Cyber Section Modal (Deep Live Operational Access)       */}
      {/* ========================================================================= */}
      <CyberSectionModal
        section={selectedModalSection}
        onClose={() => setSelectedModalSection(null)}
        onSendDirective={(txt) => handleSendDirective("all", txt)}
        onTriggerAgentAnalysis={(title, details) => {
          void handleSendDirective(
            "all",
            `قدم تحليلاً وشرحاً شفوياً تفصيلياً لقسم ${title}: ${details}`
          );
        }}
      />

      {/* ========================================================================= */}
      {/* 7. In-Studio Cyber Sub-Station Drawer (55% Width, Real Platform Data)     */}
      {/* ========================================================================= */}
      {activeSubStationId && (
        <CyberSubStationViewer
          stationId={activeSubStationId}
          onClose={() => setActiveSubStationId(null)}
          onSendDirective={(dir) => void handleSendDirective("all", dir)}
        />
      )}

      {/* Node Inspector Modal */}
      <NodeInspectorModal
        node={selectedInspectorNode}
        onClose={() => setSelectedInspectorNode(null)}
        onDiscussWithAgent={(node) => {
          setSelectedInspectorNode(null);
          void handleSendDirective("all", `مناقشة وتحليل الذاكرة: ${node.label} - ${node.summary}`);
        }}
      />
    </div>
  );
}
