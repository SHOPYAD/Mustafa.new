"use client";

import React, { useState, useEffect, useRef } from "react";
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
import AgentSettingsModal from "./AgentSettingsModal";

export default function AgentWarRoom({ apiEndpoint = "/api/admin/automation/agent-war-room" }: { apiEndpoint?: string } = {}) {
  const [agents, setAgents] = useState<SwarmAgentInfo[]>([]);
  const [discussions, setDiscussions] = useState<SwarmDiscussionMessage[]>([]);
  const [decisions, setDecisions] = useState<PendingApprovalDecision[]>([]);
  const [directives, setDirectives] = useState<AdminDirective[]>([]);
  const [loading, setLoading] = useState(true);
  const [directiveText, setDirectiveText] = useState("");
  const [sendingDirective, setSendingDirective] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [toolCatalog, setToolCatalog] = useState<SwarmToolCatalogEntry[]>([]);
  const [registry, setRegistry] = useState<RegisteredSwarmAgent[]>([]);
  const [settingsAgentId, setSettingsAgentId] = useState<string | null>(null);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const fetchData = async () => {
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
      };
      if (data.ok) {
        if (data.agents) setAgents(data.agents);
        if (data.discussions) setDiscussions(data.discussions);
        if (data.decisions) setDecisions(data.decisions);
        if (data.directives) setDirectives(data.directives);
        if (data.toolCatalog) setToolCatalog(data.toolCatalog);
        if (data.registry) setRegistry(data.registry);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    const interval = setInterval(() => {
      void fetchData();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSendDirective = async (customText?: string) => {
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
        }),
      });
      const data = (await res.json()) as { ok: boolean };
      if (data.ok) {
        setDirectiveText("");
        setFeedback("⚡ تم استلام التوجيه وتوزيع المهام على الوكلاء الأذكياء بنجاح!");
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

  const getAgentTheme = (role: AgentRole) => {
    switch (role) {
      case "sales":
        return {
          icon: <Briefcase size={20} className="text-purple-600 dark:text-purple-300" />,
          badge: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          cardBorder: "border-purple-200 dark:border-purple-900/60",
          bgLight: "bg-purple-500/15",
        };
      case "b2b_landing":
        return {
          icon: <Building2 size={20} className="text-teal-600 dark:text-teal-400" />,
          badge: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
          cardBorder: "border-teal-200 dark:border-teal-900/60",
          bgLight: "bg-teal-500/10",
        };
      case "site_advisor":
        return {
          icon: <Plane size={20} className="text-sky-600 dark:text-sky-400" />,
          badge: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
          cardBorder: "border-sky-200 dark:border-sky-900/60",
          bgLight: "bg-sky-500/10",
        };
      case "ads":
        return {
          icon: <TrendingUp size={20} className="text-amber-600 dark:text-amber-400" />,
          badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          cardBorder: "border-amber-200 dark:border-amber-900/60",
          bgLight: "bg-amber-500/10",
        };
      case "social":
        return {
          icon: <Share2 size={20} className="text-purple-600 dark:text-purple-400" />,
          badge: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          cardBorder: "border-purple-200 dark:border-purple-900/60",
          bgLight: "bg-purple-500/10",
        };
      case "email":
        return {
          icon: <Mail size={20} className="text-indigo-600 dark:text-indigo-400" />,
          badge: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
          cardBorder: "border-indigo-200 dark:border-indigo-900/60",
          bgLight: "bg-indigo-500/10",
        };
      case "admin":
        return {
          icon: <ShieldCheck size={20} className="text-rose-600 dark:text-rose-400" />,
          badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
          cardBorder: "border-rose-200 dark:border-rose-900/60",
          bgLight: "bg-rose-500/10",
        };
      default:
        return {
          icon: <Bot size={20} className="text-slate-600 dark:text-slate-400" />,
          badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
          cardBorder: "border-slate-200 dark:border-slate-800",
          bgLight: "bg-slate-500/10",
        };
    }
  };

  const presetDirectives = [
    "ركزوا هذا الأسبوع على عروض رحلات طرابزون وبورصة العائلية وخفضوا ميزانية تيك توك بنسبة 20%.",
    "قدموا عرض خصم ترحيبي 10% للشركات السياحية المهتمة بباقة Pro السحابية لسرعة إغلاق الصفقات.",
    "أطلقوا حملة إيميل مخصصة لاسترجاع سلات الحجوزات المتروكة خلال الـ 48 ساعة الماضية.",
  ];

  if (loading && agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500 dark:text-slate-400 gap-3">
        <Loader2 size={36} className="animate-spin text-purple-600 dark:text-purple-400" />
        <p className="text-sm font-bold">جاري فتح غرفة عمليات الوكلاء الأذكياء (War Room)…</p>
      </div>
    );
  }

  const pendingDecisionsCount = decisions.filter((d) => d.status === "pending").length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner - Sleek Modern Glassmorphism & High-Contrast Typography */}
      <div
        className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-6 sm:p-7 shadow-2xl"
        style={{ color: "#ffffff" }}
      >
        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-sky-400 p-0.5 shadow-xl shadow-purple-500/30 shrink-0 flex items-center justify-center">
              <div className="size-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Radio size={32} className="text-white drop-shadow-[0_0_10px_rgba(192,132,252,0.9)] animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="text-xl sm:text-2xl font-black tracking-wide !text-white"
                  style={{ color: "#ffffff" }}
                >
                  غرفة عمليات الوكلاء الأذكياء (AI Agents War Room)
                </h1>
                <span
                  className="px-3.5 py-1 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm"
                  style={{
                    backgroundColor: "rgba(168, 85, 247, 0.3)",
                    borderColor: "rgba(192, 132, 252, 0.7)",
                    color: "#ffffff",
                  }}
                >
                  <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="!text-white font-black">{agents.length} وكلاء مربوطون ببيانات النظام الحية</span>
                </span>
              </div>
              <p
                className="text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed !text-slate-200"
                style={{ color: "#e2e8f0" }}
              >
                مركز التنسيق والتشاور الذكي بين وكلاء المنصة: المبيعات، الإعلانات، السوشيال، الإيميل، مستشار السفر بالموقع، ووكيل B2B لصفحة الهبوط.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <button
              type="button"
              onClick={() => void fetchData()}
              className="p-3 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all shadow-md active:scale-95"
              style={{ color: "#ffffff" }}
              title="تحديث البيانات اللحظية"
            >
              <RefreshCw size={16} />
            </button>
            <div
              className="px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 text-xs shadow-inner backdrop-blur-md"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
              }}
            >
              <Activity size={16} className="text-purple-400" />
              <span style={{ color: "#cbd5e1" }}>القرارات المعلقة:</span>
              <span className="text-amber-400 font-bold font-mono text-sm">{pendingDecisionsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-bold animate-in fade-in flex items-center gap-2 shadow-sm">
          <Sparkles size={18} className="text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-500">شريط الوكلاء — مرّروا دون شريط تمرير ظاهر</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => sliderRef.current?.scrollBy({ left: 280, behavior: "smooth" })} className="p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <ChevronRight size={16} />
            </button>
            <button type="button" onClick={() => sliderRef.current?.scrollBy({ left: -280, behavior: "smooth" })} className="p-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {agents.map((agent) => {
            const theme = getAgentTheme(agent.id);
            return (
              <div
                key={agent.id}
                className={`snap-start shrink-0 w-[240px] p-4 rounded-2xl border ${theme.cardBorder} bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                      {theme.icon}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSettingsAgentId(agent.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="إعدادات الوكيل"
                      >
                        <Settings size={14} />
                      </button>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${agent.connected ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        <span className={`size-1.5 rounded-full ${agent.connected ? "bg-purple-500 animate-pulse" : "bg-slate-400"}`} />
                        {agent.connected ? "حي" : "محدود"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{agent.nameAr}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">{agent.titleAr}</p>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed min-h-[36px]">
                    {agent.currentTaskAr}
                  </p>
                  <div className="text-[10px] font-mono flex items-center justify-between bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0">المؤشر:</span>
                    <span className="text-slate-900 dark:text-white font-bold text-end">{agent.keyMetric}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setCreatingAgent(true)}
            className="snap-start shrink-0 w-[240px] min-h-[190px] p-4 rounded-2xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col items-center justify-center gap-2 text-purple-700 dark:text-purple-300"
          >
            <Plus size={22} />
            <span className="text-xs font-black">إضافة وكيل جديد</span>
            <span className="text-[10px] text-center leading-relaxed px-2">الاسم، المهمة، المهارات، القواعد، والبرومبت</span>
          </button>
        </div>
      </div>

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

      {/* Main Operations Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Live Discussion & Deliberation Stream */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">بث النقاش والتنسيق اللحظي بين الوكلاء</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">حوار ذكي وتفكير مشترك موجه بنماذج الذكاء الاصطناعي</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              {discussions.length} رسالة حية
            </span>
          </div>

          <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[620px] pe-2 custom-scrollbar">
            {discussions.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs">
                لا توجد نقاشات حالياً. أرسل توجيهاً أدناه لبدء دورة تفكير ونقاش جديدة!
              </div>
            ) : (
              discussions.map((msg) => {
                const isDirective = msg.type === "directive" || msg.fromAgent === "admin";
                const fromTheme = getAgentTheme(msg.fromAgent);
                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 shadow-sm ${
                      isDirective
                        ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100"
                        : msg.type === "proposal"
                          ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100"
                          : "border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                          {fromTheme.icon}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${fromTheme.badge}`}>
                          {msg.fromAgent === "admin"
                            ? "المدير التنفيذي (أمر مباشر)"
                            : agents.find((a) => a.id === msg.fromAgent)?.nameAr || msg.fromAgent}
                        </span>
                        {msg.toAgent && msg.toAgent !== "all" && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                            <ArrowRight size={12} />
                            <span>{agents.find((a) => a.id === msg.toAgent)?.nameAr || msg.toAgent}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            msg.impactLevel === "high" || msg.impactLevel === "critical"
                              ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {msg.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{msg.topic}</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.contentAr}</p>
                    </div>

                    {/* Proposal Attachment Card */}
                    {msg.proposalData && (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 text-xs space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                          <span>⚡ إجراء مقترح: {msg.proposalData.suggestedChange}</span>
                          {msg.proposalData.estimatedCostUSD && (
                            <span className="font-mono text-slate-900 dark:text-white font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              ${msg.proposalData.estimatedCostUSD}
                            </span>
                          )}
                        </div>
                        {msg.proposalData.estimatedRoiGain && (
                          <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                            🎯 الأثر المتوقع: {msg.proposalData.estimatedRoiGain}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 Cols: Directives & Pending Approvals */}
        <div className="lg:col-span-5 space-y-6">
          {/* Directive Input Box */}
          <div className="rounded-3xl border border-purple-200/80 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">توجيه وأمر إداري مباشر للخلية</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">التنفيذ الفوري والتنسيق التلقائي عبر Gemini</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendDirective();
              }}
              className="space-y-3"
            >
              <textarea
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all leading-relaxed shadow-inner"
                placeholder="اكتب توجيهك (مثلاً: ركزوا على عروض طرابزون، ارفعوا ميزانية إنستغرام، واقترحوا باقة سياحية جديدة)..."
                value={directiveText}
                onChange={(e) => setDirectiveText(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">الاستجابة: لحظية عبر Gemini</span>
                <button
                  type="submit"
                  disabled={!directiveText.trim() || sendingDirective}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
                >
                  {sendingDirective ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>إرسال التوجيه للخلية</span>
                </button>
              </div>
            </form>

            {/* Quick Preset Buttons - Elegant daylight chips */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">توجيهات سريعة جاهزة:</span>
              <div className="flex flex-col gap-2">
                {presetDirectives.map((pd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void handleSendDirective(pd)}
                    disabled={sendingDirective}
                    className="text-start p-3 rounded-xl bg-slate-50 hover:bg-purple-50/80 dark:bg-slate-950 dark:hover:bg-purple-950/40 border border-slate-200/80 hover:border-purple-300 dark:border-slate-800 dark:hover:border-purple-800 text-xs text-slate-700 hover:text-purple-950 dark:text-slate-300 dark:hover:text-purple-200 transition-all leading-relaxed shadow-xs"
                  >
                    ⚡ {pd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Admin Directives Queue - Prominently Displayed */}
          <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <ListOrdered size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">سجل الأوامر والتوجيهات الإدارية الصادرة</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">المهام الموزعة من المشرف العام والمنسق الذكي</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                {directives.length} أمر إداري
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pe-1 custom-scrollbar">
              {directives.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
                  لا توجد أوامر إدارية مسجلة حالياً. أي أمر من شات المشرف أو صندوق التوجيه أعلاه يظهر هنا فوراً.
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
                              : "🌐 موجه إلى: كامل خلية الوكلاء";

                  return (
                    <div
                      key={dir.id}
                      className="p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/30 dark:bg-slate-950 text-slate-900 dark:text-slate-100 space-y-2 shadow-xs transition-all hover:border-indigo-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                          {targetLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <span className="size-1.5 rounded-full bg-purple-500 animate-pulse" />
                            {dir.status === "executing" ? "جاري التنسيق والتنفيذ" : "معتمد"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(dir.createdAt).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {dir.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Approvals Queue */}
          <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">طابور القرارات المعلقة للموافقة</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">اعتماد التعديلات المالية والإعلانية</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono">
                {pendingDecisionsCount} معلق
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pe-1 custom-scrollbar">
              {decisions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
                  لا توجد قرارات معلقة حالياً. عندما يقترح الوكلاء تعديلاً مالياً أو إعلانياً ستظهر هنا للاعتماد.
                </div>
              ) : (
                decisions.map((dec) => {
                  const isPending = dec.status === "pending";
                  return (
                    <div
                      key={dec.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 shadow-sm ${
                        isPending
                          ? "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-slate-950 text-slate-900 dark:text-amber-100"
                          : dec.status === "approved"
                            ? "border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-slate-950/60 opacity-80"
                            : "border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-slate-950/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">#{dec.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dec.status === "approved"
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                              : dec.status === "rejected"
                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse"
                          }`}
                        >
                          {dec.status === "approved"
                            ? "✅ تمت الموافقة"
                            : dec.status === "rejected"
                              ? "❌ تم الرفض"
                              : "⏳ بانتظار موافقتك"}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{dec.titleAr}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{dec.descriptionAr}</p>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[10px]">
                        {dec.costUSD && (
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                            <span>التكلفة المقترحة:</span>
                            <span className="text-slate-900 dark:text-white font-bold font-mono">${dec.costUSD}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-purple-600 dark:text-purple-300">
                          <span>الأثر المتوقع:</span>
                          <span className="font-semibold">{dec.expectedBenefitAr}</span>
                        </div>
                        {dec.executionResult && (
                          <div className="pt-1 text-[10px] text-slate-700 dark:text-slate-200">
                            التنفيذ: {dec.executionResult.summaryAr}
                            {dec.executionResult.directUrl ? ` — ${dec.executionResult.directUrl}` : ""}
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => void handleDecision(dec.id, "approved")}
                            disabled={decidingId === dec.id}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-amber-300 hover:text-amber-200 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={13} className="text-amber-400" />
                            <span>موافقة وتطبيق</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDecision(dec.id, "rejected")}
                            disabled={decidingId === dec.id}
                            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <XCircle size={13} />
                            <span>رفض</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
