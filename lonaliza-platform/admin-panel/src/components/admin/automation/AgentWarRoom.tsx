"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Briefcase,
  Building2,
  Plane,
  TrendingUp,
  Share2,
  Mail,
  Sparkles,
  Send,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageSquare,
  Activity,
  Radio,
  ListOrdered,
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  Database,
  Cpu,
  Layers,
  Flame,
  Target,
  Filter,
  Terminal,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  HelpCircle,
  SlidersHorizontal,
  Orbit,
} from "lucide-react";
import type {
  SwarmAgentInfo,
  SwarmDiscussionMessage,
  PendingApprovalDecision,
  AdminDirective,
  AgentRole,
} from "@/lib/automation/agent-collab-store";
import type { SwarmToolCatalogEntry } from "@/lib/swarm/tool-catalog";
import type { RegisteredSwarmAgent } from "@/lib/swarm/types";
import type { PlatformGroundedSnapshot } from "@/lib/swarm/live-agent-metrics";
import AgentSettingsModal from "./AgentSettingsModal";
import SciFiAgentHudStudio from "./hud/SciFiAgentHudStudio";

export default function AgentWarRoom({
  apiEndpoint = "/api/admin/automation/agent-war-room",
}: {
  apiEndpoint?: string;
} = {}) {
  const [agents, setAgents] = useState<SwarmAgentInfo[]>([]);
  const [discussions, setDiscussions] = useState<SwarmDiscussionMessage[]>([]);
  const [decisions, setDecisions] = useState<PendingApprovalDecision[]>([]);
  const [directives, setDirectives] = useState<AdminDirective[]>([]);
  const [loading, setLoading] = useState(true);
  const [directiveText, setDirectiveText] = useState("");
  const [targetAgentId, setTargetAgentId] = useState<string>("all");
  const [directivePriority, setDirectivePriority] = useState<"normal" | "urgent" | "strategic">("normal");
  const [sendingDirective, setSendingDirective] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [toolCatalog, setToolCatalog] = useState<SwarmToolCatalogEntry[]>([]);
  const [registry, setRegistry] = useState<RegisteredSwarmAgent[]>([]);
  const [platform, setPlatform] = useState<PlatformGroundedSnapshot | null>(null);
  const [settingsAgentId, setSettingsAgentId] = useState<string | null>(null);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [streamFilter, setStreamFilter] = useState<"all" | "proposal" | "directive" | "discussion">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hudStudioOpen, setHudStudioOpen] = useState(true);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const directiveInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const embed = params.get("studio") === "1" || params.get("classic") === "true";
      setHudStudioOpen(Boolean(params.get("screen")) && !embed);
    }
  }, []);

  useEffect(() => {
    if (hudStudioOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [hudStudioOpen]);

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
        toolCatalog?: SwarmToolCatalogEntry[];
        registry?: RegisteredSwarmAgent[];
        platform?: PlatformGroundedSnapshot;
      };
      if (data.ok) {
        if (data.agents) setAgents(data.agents);
        if (data.discussions) setDiscussions(data.discussions);
        if (data.decisions) setDecisions(data.decisions);
        if (data.directives) setDirectives(data.directives);
        if (data.toolCatalog) setToolCatalog(data.toolCatalog);
        if (data.registry) setRegistry(data.registry);
        if (data.platform) setPlatform(data.platform);
      }
    } finally {
      setLoading(false);
      if (showSpin) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  useEffect(() => {
    void fetchData();
    const interval = setInterval(() => {
      void fetchData();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSendDirective = async (customText?: string, specificAgent?: string) => {
    const text = (customText || directiveText).trim();
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
          targetAgentId: specificAgent || targetAgentId,
          priority: directivePriority,
        }),
      });
      const data = (await res.json()) as { ok: boolean };
      if (data.ok) {
        setDirectiveText("");
        setFeedback("⚡ تم استلام التوجيه وتوزيعه على سرب الوكلاء الأذكياء بنجاح وبدء دورة التفكير المشترك!");
        void fetchData();
      }
    } finally {
      setSendingDirective(false);
    }
  };

  const handleDecision = async (decisionId: string, decisionStatus: "approved" | "rejected") => {
    setDecidingId(decisionId);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decide",
          decisionId,
          decisionStatus,
        }),
      });
      const data = (await res.json()) as { ok: boolean };
      if (data.ok) {
        void fetchData();
      }
    } finally {
      setDecidingId(null);
    }
  };

  const getAgentTheme = (role: string) => {
    switch (role) {
      case "sales":
        return {
          icon: <Briefcase size={20} className="text-emerald-500 dark:text-emerald-400" />,
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
          cardBorder: "border-emerald-500/25 hover:border-emerald-500/50",
          glow: "from-emerald-500/10 to-teal-500/5",
          accentColor: "text-emerald-500",
        };
      case "b2b_landing":
        return {
          icon: <Building2 size={20} className="text-teal-600 dark:text-teal-400" />,
          badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25",
          cardBorder: "border-teal-500/25 hover:border-teal-500/50",
          glow: "from-teal-500/10 to-cyan-500/5",
          accentColor: "text-teal-600",
        };
      case "site_advisor":
        return {
          icon: <Plane size={20} className="text-sky-600 dark:text-sky-400" />,
          badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
          cardBorder: "border-sky-500/25 hover:border-sky-500/50",
          glow: "from-sky-500/10 to-blue-500/5",
          accentColor: "text-sky-600",
        };
      case "ads":
        return {
          icon: <TrendingUp size={20} className="text-amber-500 dark:text-amber-400" />,
          badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
          cardBorder: "border-amber-500/25 hover:border-amber-500/50",
          glow: "from-amber-500/10 to-orange-500/5",
          accentColor: "text-amber-500",
        };
      case "social":
        return {
          icon: <Share2 size={20} className="text-purple-600 dark:text-purple-400" />,
          badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25",
          cardBorder: "border-purple-500/25 hover:border-purple-500/50",
          glow: "from-purple-500/10 to-pink-500/5",
          accentColor: "text-purple-600",
        };
      case "email":
        return {
          icon: <Mail size={20} className="text-indigo-600 dark:text-indigo-400" />,
          badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
          cardBorder: "border-indigo-500/25 hover:border-indigo-500/50",
          glow: "from-indigo-500/10 to-purple-500/5",
          accentColor: "text-indigo-600",
        };
      case "admin":
        return {
          icon: <ShieldCheck size={20} className="text-rose-600 dark:text-rose-400" />,
          badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
          cardBorder: "border-rose-500/25 hover:border-rose-500/50",
          glow: "from-rose-500/10 to-red-500/5",
          accentColor: "text-rose-600",
        };
      default:
        return {
          icon: <Bot size={20} className="text-primary dark:text-primary" />,
          badge: "bg-primary/10 text-primary border-primary/20",
          cardBorder: "border-border hover:border-primary/40",
          glow: "from-primary/10 to-primary/5",
          accentColor: "text-primary",
        };
    }
  };

  const presetDirectives = [
    {
      title: "عروض طرابزون وبورصة",
      text: "ركزوا هذا الأسبوع على عروض رحلات طرابزون وبورصة العائلية وخفضوا ميزانية تيك توك بنسبة 20%.",
      target: "all",
      badge: "استراتيجي",
    },
    {
      title: "خصم B2B السحابي",
      text: "قدموا عرض خصم ترحيبي 10% للشركات السياحية المهتمة بباقة Pro السحابية لسرعة إغلاق الصفقات.",
      target: "b2b_landing",
      badge: "مبيعات",
    },
    {
      title: "استرجاع السلات المتروكة",
      text: "أطلقوا حملة إيميل وواتساب مخصصة لاسترجاع سلات الحجوزات المتروكة خلال الـ 48 ساعة الماضية.",
      target: "sales",
      badge: "تحويل",
    },
    {
      title: "إعادة توزيع ميزانيات الإعلانات",
      text: "حللوا معدلات التحويل لحملات Google وMeta وأعيدوا ضخ الميزانية في الكلمات الأكثر ربحية.",
      target: "ads",
      badge: "إعلانات",
    },
  ];

  const pendingDecisionsCount = decisions.filter((d) => d.status === "pending").length;
  const connectedAgentsCount = agents.filter((a) => a.connected).length;

  const filteredDiscussions = useMemo(() => {
    if (streamFilter === "all") return discussions;
    if (streamFilter === "proposal") return discussions.filter((d) => d.type === "proposal" || Boolean(d.proposalData));
    if (streamFilter === "directive") return discussions.filter((d) => d.type === "directive" || d.fromAgent === "admin");
    return discussions.filter((d) => d.type !== "proposal" && d.type !== "directive");
  }, [discussions, streamFilter]);

  if (loading && agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] p-12 text-muted-foreground gap-4">
        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
          <Loader2 size={30} className="animate-spin text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-foreground">جاري تهيئة وربط غرفة عمليات الوكلاء المستقلين…</p>
          <p className="text-xs text-muted-foreground font-mono">Connecting Swarm Orchestrator & Live Grounded Snapshot</p>
        </div>
      </div>
    );
  }

  if (hudStudioOpen) {
    const studio = (
      <SciFiAgentHudStudio
        onExit={() => setHudStudioOpen(false)}
        apiEndpoint={apiEndpoint}
        initialAgents={agents}
      />
    );
    if (typeof window !== "undefined" && document.body) {
      return createPortal(studio, document.body);
    }
    return studio;
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* ========================================================================= */}
      {/* 1. AI Command Deck Header (Flagship Tech-Giant AI Operations Hub)        */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card text-foreground p-6 sm:p-8 shadow-xl backdrop-blur-xl transition-all">
        {/* Futuristic ambient cyber-mesh backdrop */}
        <div className="absolute -top-24 -right-24 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Row: Mission Identity & Cockpit Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative size-16 rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-sky-400 p-0.5 shadow-xl shadow-primary/20 shrink-0 flex items-center justify-center">
                <div className="size-full bg-card rounded-[14px] flex items-center justify-center">
                  <Bot size={32} className="text-primary animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                  <span className="size-1.5 rounded-full bg-white animate-ping" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    غرفة عمليات الوكلاء المستقلين (AI Agents War Room)
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>السرب متصل لحظياً • Swarm v4.2</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-xs">
                    <Sparkles size={12} />
                    <span>Gemini 1.5 Pro • ReAct Architecture</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  مركز التنسيق والتشاور الذكي بين وكلاء المنصة المستقلين: المبيعات، الإعلانات، السوشيال، الإيميل، مستشار السفر بالموقع، ووكيل B2B لصفحة الهبوط مع مزامنة لحظية لقواعد بيانات PocketBase والكتالوج السياحي.
                </p>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setHudStudioOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-600/25 to-purple-600/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-white transition-all shadow-md shadow-cyan-500/15 active:scale-95 text-xs font-black flex items-center gap-2 group"
                title="فتح استوديو خلية الوكلاء المستقبلي بكامل الشاشة"
              >
                <Orbit size={16} className="text-cyan-500 animate-spin group-hover:text-cyan-400" style={{ animationDuration: "12s" }} />
                <span>استوديو خلية الوكلاء (Sci-Fi HUD)</span>
              </button>
              <button
                type="button"
                onClick={() => void fetchData(true)}
                disabled={isRefreshing}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-card-2 hover:bg-muted text-foreground transition-all shadow-xs active:scale-95 text-xs font-bold flex items-center gap-2"
                title="مزامنة فورية للسرب"
              >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"} />
                <span>مزامنة السرب</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatingAgent(true)}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition-all shadow-md shadow-primary/25 active:scale-95 text-xs font-black flex items-center gap-2"
              >
                <Plus size={16} />
                <span>إضافة وكيل ذكي</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: 4-HUD Live Metric Gauges (Command Deck Telemetry) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-4 border-t border-border/60">
            {/* HUD 1: Active Agents */}
            <div className="p-3.5 rounded-2xl bg-card-2/80 border border-border/70 flex items-center gap-3 shadow-2xs">
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Radio size={20} className="text-emerald-500 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-foreground font-mono">{connectedAgentsCount} / {agents.length}</span>
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-[11px] font-bold text-muted-foreground truncate">الوكلاء النشطون في السرب</p>
              </div>
            </div>

            {/* HUD 2: Pending Approvals */}
            <div
              onClick={() => {
                const el = document.getElementById("pending-approvals-box");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 shadow-2xs cursor-pointer transition-all ${
                pendingDecisionsCount > 0
                  ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60"
                  : "bg-card-2/80 border-border/70 hover:border-border"
              }`}
            >
              <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} className="text-amber-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-foreground font-mono">{pendingDecisionsCount}</span>
                  {pendingDecisionsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-amber-950 animate-pulse">مطلوب</span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-muted-foreground truncate">قرارات تنتظر موافقتك</p>
              </div>
            </div>

            {/* HUD 3: Swarm Deliberation Stream */}
            <div className="p-3.5 rounded-2xl bg-card-2/80 border border-border/70 flex items-center gap-3 shadow-2xs">
              <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <MessageSquare size={20} className="text-indigo-500" />
              </div>
              <div className="min-w-0">
                <span className="text-base font-black text-foreground font-mono">{discussions.length}</span>
                <p className="text-[11px] font-bold text-muted-foreground truncate">رسائل تنسيق وتبادل ذكي</p>
              </div>
            </div>

            {/* HUD 4: Grounded Live Data Snapshot */}
            <div className="p-3.5 rounded-2xl bg-card-2/80 border border-border/70 flex items-center gap-3 shadow-2xs">
              <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Database size={20} className="text-sky-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">PocketBase متصل</span>
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] font-medium text-muted-foreground truncate font-mono">
                  {platform?.catalog?.packages || 70} باقة • {platform?.catalog?.posts || 36} مقال
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-foreground text-xs font-bold animate-in fade-in flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-primary shrink-0 animate-bounce" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground text-xs font-bold px-2 py-1 rounded-lg"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Autonomous Agents Swarm Matrix (مصفوفة وكلاء المنصة المستقلين)           */}
      {/* ========================================================================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-foreground">
                سرب الوكلاء المستقلين (Active Autonomous Agent Swarm)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                مراقبة لحظية للمهام النشطة، الأداء اللحظي، وضبط الأدوات والبرومبت لكل وكيل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground font-mono bg-card px-3 py-1 rounded-full border border-border">
              {agents.length} وكلاء معتمدين
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs active:scale-95"
                title="تصفح الوكلاء لليمين"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all shadow-xs active:scale-95"
                title="تصفح الوكلاء لليسار"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Agent Roster Strip */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {agents.map((agent) => {
            const theme = getAgentTheme(agent.id);
            return (
              <div
                key={agent.id}
                className={`snap-start shrink-0 w-[285px] p-4 rounded-2xl border ${theme.cardBorder} bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group relative overflow-hidden`}
              >
                {/* Subtle specialty gradient background */}
                <div className={`absolute -top-12 -left-12 size-32 bg-gradient-to-br ${theme.glow} rounded-full blur-2xl pointer-events-none opacity-50 group-hover:opacity-80 transition-all`} />

                <div className="relative z-10 space-y-3">
                  {/* Top Header: Avatar + Status + Settings */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-card-2 border border-border shadow-xs">
                      {theme.icon}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSettingsAgentId(agent.id)}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="إعدادات وبرومبت الوكيل"
                      >
                        <Settings size={14} />
                      </button>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          agent.connected
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${agent.connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        {agent.connected ? "متصل لحظياً" : "خامل"}
                      </span>
                    </div>
                  </div>

                  {/* Identity */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-tight">{agent.nameAr}</h3>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5 leading-snug">{agent.titleAr}</p>
                  </div>

                  {/* Active Mission Micro-Terminal */}
                  <div className="p-2.5 rounded-xl bg-card-2/80 border border-border/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground font-semibold">
                      <Activity size={12} className={theme.accentColor} />
                      <span>المهمة الحالية:</span>
                    </div>
                    <p className="text-[11px] text-foreground font-medium leading-relaxed line-clamp-2 min-h-[34px]">
                      {agent.currentTaskAr}
                    </p>
                  </div>
                </div>

                {/* Footer: Metric & Quick Directive Trigger */}
                <div className="relative z-10 pt-2 border-t border-border/80 space-y-2">
                  <div className="text-[10px] font-mono flex items-center justify-between bg-card-2 px-2.5 py-1.5 rounded-xl border border-border gap-2">
                    <span className="text-muted-foreground shrink-0 font-bold">المؤشر:</span>
                    <span className="text-foreground font-black text-end truncate">{agent.keyMetric}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetAgentId(agent.id);
                      directiveInputRef.current?.focus();
                    }}
                    className="w-full py-1.5 px-3 rounded-xl border border-border bg-card hover:bg-muted text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap size={12} className={theme.accentColor} />
                    <span>توجيه أمر مخصص</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add New Agent Card */}
          <button
            type="button"
            onClick={() => setCreatingAgent(true)}
            className="snap-start shrink-0 w-[285px] min-h-[220px] p-5 rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-card-2/40 hover:bg-primary/5 flex flex-col items-center justify-center gap-2.5 text-primary transition-all group shadow-2xs"
          >
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-all">
              <Plus size={24} className="text-primary" />
            </div>
            <span className="text-xs font-black text-foreground group-hover:text-primary transition-all">إضافة وكيل ذكي جديد</span>
            <span className="text-[11px] text-center text-muted-foreground leading-relaxed px-3">
              تخصيص الهوية، المهمة، الأدوات، القواعد المعرفية، وموجه النظام (System Prompt)
            </span>
          </button>
        </div>
      </section>

      {/* Settings Modal */}
      {(settingsAgentId || creatingAgent) && (
        <AgentSettingsModal
          agentId={settingsAgentId || undefined}
          isCreate={creatingAgent}
          toolCatalog={toolCatalog}
          initialAgent={settingsAgentId ? registry.find((a) => a.id === settingsAgentId) || null : null}
          onClose={() => {
            setSettingsAgentId(null);
            setCreatingAgent(false);
          }}
          onSaved={() => void fetchData()}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. Dual Operations Theater (النقاش الحي ومحطة التوجيه والقرارات)          */}
      {/* ========================================================================= */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Live Discussion & Deliberation Stream */}
        <section className="lg:col-span-7 rounded-3xl border border-border bg-card p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
          {/* Header + Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-foreground">
                  بث التنسيق والتشاور الحي بين الوكلاء
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  حوار تفاعلي متعدد النماذج وتحليل جماعي للمهام والفرص التسويقية
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-card-2 p-1 rounded-xl border border-border self-start sm:self-auto text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setStreamFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  streamFilter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                الكل ({discussions.length})
              </button>
              <button
                type="button"
                onClick={() => setStreamFilter("proposal")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  streamFilter === "proposal" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                المقترحات
              </button>
              <button
                type="button"
                onClick={() => setStreamFilter("directive")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  streamFilter === "directive" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                الأوامر
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[660px] pe-2 custom-scrollbar">
            {filteredDiscussions.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground text-xs space-y-2">
                <p className="font-bold">لا توجد رسائل مطابقة لهذا الفلتر حالياً.</p>
                <p className="text-[11px]">أرسل أمراً توجيهياً من محطة التحكم لبدء دورة نقاش جديدة بين الوكلاء!</p>
              </div>
            ) : (
              filteredDiscussions.map((msg) => {
                const isDirective = msg.type === "directive" || msg.fromAgent === "admin";
                const isProposal = msg.type === "proposal" || Boolean(msg.proposalData);
                const fromTheme = getAgentTheme(msg.fromAgent);
                const toTheme = msg.toAgent && msg.toAgent !== "all" ? getAgentTheme(msg.toAgent) : null;

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 shadow-2xs ${
                      isDirective
                        ? "border-rose-500/30 bg-rose-500/5 text-foreground"
                        : isProposal
                          ? "border-amber-500/30 bg-amber-500/5 text-foreground"
                          : "border-border/80 bg-card-2/60 text-foreground"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-card border border-border shadow-xs">
                          {fromTheme.icon}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${fromTheme.badge}`}>
                          {msg.fromAgent === "admin"
                            ? "المدير التنفيذي (أمر مباشر)"
                            : agents.find((a) => a.id === msg.fromAgent)?.nameAr || msg.fromAgent}
                        </span>

                        {msg.toAgent && msg.toAgent !== "all" && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                            <ArrowRight size={12} />
                            <span className="font-bold text-foreground">
                              {agents.find((a) => a.id === msg.toAgent)?.nameAr || msg.toAgent}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            isDirective
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : isProposal
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : "bg-card text-muted-foreground border-border"
                          }`}
                        >
                          {msg.type}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-foreground">{msg.topic}</h4>
                      <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{msg.contentAr}</p>
                    </div>

                    {/* Proposal Action Card */}
                    {msg.proposalData && (
                      <div className="p-3.5 rounded-xl bg-card border border-amber-500/25 text-xs space-y-2 shadow-xs">
                        <div className="flex items-center justify-between text-foreground font-bold text-[11px]">
                          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <Sparkles size={14} />
                            <span>إجراء مقترح: {msg.proposalData.suggestedChange}</span>
                          </span>
                          {msg.proposalData.estimatedCostUSD && (
                            <span className="font-mono text-foreground font-bold bg-muted/60 px-2 py-0.5 rounded border border-border">
                              ${msg.proposalData.estimatedCostUSD}
                            </span>
                          )}
                        </div>
                        {msg.proposalData.estimatedRoiGain && (
                          <p className="text-[11px] text-primary font-medium">
                            🎯 الأثر المالي المتوقع: {msg.proposalData.estimatedRoiGain}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right 5 Cols: Directives, Approvals & Mission Terminal */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mission Directive Terminal */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">محطة الأوامر التوجيهية للسرب</h3>
                  <p className="text-[11px] text-muted-foreground">التنفيذ الفوري والتنسيق التلقائي عبر Gemini</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-card-2 border border-border text-muted-foreground font-bold">
                ReAct Loop
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendDirective();
              }}
              className="space-y-3"
            >
              {/* Target Agent & Priority Selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">الوكيل المستهدف:</label>
                  <select
                    value={targetAgentId}
                    onChange={(e) => setTargetAgentId(e.target.value)}
                    className="w-full bg-card-2 border border-border rounded-xl px-2.5 py-2 text-xs font-bold text-foreground outline-none focus:border-primary transition-all"
                  >
                    <option value="all">🌐 كامل سرب الوكلاء (All Swarm)</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">الأولوية:</label>
                  <select
                    value={directivePriority}
                    onChange={(e) => setDirectivePriority(e.target.value as any)}
                    className="w-full bg-card-2 border border-border rounded-xl px-2.5 py-2 text-xs font-bold text-foreground outline-none focus:border-primary transition-all"
                  >
                    <option value="normal">عادية (Normal Execution)</option>
                    <option value="urgent">عاجلة ⚡ (High Priority)</option>
                    <option value="strategic">استراتيجية 🎯 (Strategic Plan)</option>
                  </select>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1">
                <textarea
                  ref={directiveInputRef}
                  rows={3}
                  className="w-full bg-card-2 border border-border rounded-2xl p-3.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed shadow-inner"
                  placeholder="اكتب أمرك التوجيهي للخلية (مثلاً: ركزوا على عروض طرابزون، ارفعوا ميزانية إعلانات إنستغرام، أو اطلقوا خصماً ترحيبياً للشركات)..."
                  value={directiveText}
                  onChange={(e) => setDirectiveText(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground font-mono">الاستجابة: لحظية عبر Gemini Flash</span>
                <button
                  type="submit"
                  disabled={!directiveText.trim() || sendingDirective}
                  className="px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-95 disabled:opacity-40 rounded-xl text-xs font-black shadow-md shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  {sendingDirective ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>إرسال التوجيه للخلية</span>
                </button>
              </div>
            </form>

            {/* Quick Directive Preset Chips */}
            <div className="space-y-2 pt-3 border-t border-border">
              <span className="text-[11px] font-bold text-muted-foreground block">توجيهات سريعة مقترحة:</span>
              <div className="flex flex-col gap-2">
                {presetDirectives.map((pd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void handleSendDirective(pd.text, pd.target)}
                    disabled={sendingDirective}
                    className="text-start p-2.5 rounded-xl bg-card-2 hover:bg-muted border border-border/80 text-xs text-foreground transition-all leading-relaxed shadow-2xs flex items-center justify-between gap-2 group"
                  >
                    <span className="line-clamp-1 font-medium group-hover:text-primary transition-all">
                      ⚡ {pd.text}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground shrink-0">
                      {pd.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pending Approvals Queue */}
          <section id="pending-approvals-box" className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">طابور القرارات والموافقات المالية</h3>
                  <p className="text-[11px] text-muted-foreground">اعتماد التعديلات المالية والإعلانية المقترحة من السرب</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono">
                {pendingDecisionsCount} معلق
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pe-1 custom-scrollbar">
              {decisions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs border border-border rounded-2xl bg-card-2">
                  لا توجد قرارات معلقة حالياً. عندما يقترح الوكلاء تعديلاً مالياً أو إعلانياً ستظهر هنا للاعتماد الفوري.
                </div>
              ) : (
                decisions.map((dec) => {
                  const isPending = dec.status === "pending";
                  return (
                    <div
                      key={dec.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 shadow-2xs ${
                        isPending
                          ? "border-amber-500/30 bg-amber-500/5 text-foreground"
                          : dec.status === "approved"
                            ? "border-emerald-500/25 bg-emerald-500/5 opacity-85"
                            : "border-rose-500/25 bg-rose-500/5 opacity-85"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">#{dec.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            dec.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : dec.status === "rejected"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse"
                          }`}
                        >
                          {dec.status === "approved"
                            ? "✅ تمت الموافقة"
                            : dec.status === "rejected"
                              ? "❌ تم الرفض"
                              : "⏳ بانتظار موافقتك"}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-foreground">{dec.titleAr}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{dec.descriptionAr}</p>

                      <div className="p-2.5 rounded-xl bg-card border border-border space-y-1 text-[10px]">
                        {dec.costUSD && (
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-bold">التكلفة المقترحة:</span>
                            <span className="text-foreground font-bold font-mono">${dec.costUSD} USD</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-primary">
                          <span className="font-bold">الأثر المتوقع:</span>
                          <span className="font-semibold">{dec.expectedBenefitAr}</span>
                        </div>
                        {dec.executionResult && (
                          <div className="pt-1 text-[10px] text-foreground border-t border-border mt-1">
                            النتيجة: {dec.executionResult.summaryAr}
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => void handleDecision(dec.id, "approved")}
                            disabled={decidingId === dec.id}
                            className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <CheckCircle2 size={14} />
                            <span>موافقة وتطبيق</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDecision(dec.id, "rejected")}
                            disabled={decidingId === dec.id}
                            className="px-4 py-2 rounded-xl bg-card border border-border hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <XCircle size={14} />
                            <span>رفض</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Active Admin Directives History */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <ListOrdered size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">سجل التوجيهات الإدارية الصادرة</h3>
                  <p className="text-[11px] text-muted-foreground">المهام الموزعة من الإدارة على خلايا الوكلاء</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 font-mono">
                {directives.length} أمر
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pe-1 custom-scrollbar">
              {directives.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs border border-border rounded-2xl bg-card-2">
                  لا توجد أوامر إدارية مسجلة حالياً. أي أمر من محطة التوجيه أعلاه يظهر هنا فوراً مع حالة التنفيذ.
                </div>
              ) : (
                directives.map((dir) => {
                  const targetLabel =
                    dir.targetAgent === "sales"
                      ? "💼 موجه إلى: وكيل المبيعات"
                      : dir.targetAgent === "ads"
                        ? "📈 موجه إلى: وكيل الإعلانات"
                        : dir.targetAgent === "social"
                          ? "📱 موجه إلى: وكيل المحتوى والسوشيال"
                          : dir.targetAgent === "b2b_landing"
                            ? "🏢 موجه إلى: وكيل B2B"
                            : dir.targetAgent === "site_advisor"
                              ? "✈️ موجه إلى: مستشار الموقع"
                              : "🌐 موجه إلى: كامل سرب الوكلاء";

                  return (
                    <div
                      key={dir.id}
                      className="p-3.5 rounded-2xl border border-border bg-card-2 text-foreground space-y-2 shadow-2xs transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-primary">
                          {targetLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                            {dir.status === "executing" ? "جاري التنفيذ" : "معتمد"}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(dir.createdAt).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed font-medium whitespace-pre-wrap">
                        {dir.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
