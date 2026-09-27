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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          icon: <Briefcase size={20} className="text-[color:var(--admin-gold)]" />,
          badge: "bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] border-[color:var(--admin-border-subtle)]",
          cardBorder: "border-[color:var(--admin-border-subtle)]",
          bgLight: "bg-[color:var(--admin-gold-soft)]",
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
          badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-[color:var(--admin-gold)] border-amber-200 dark:border-amber-800",
          cardBorder: "border-amber-200 dark:border-amber-900/60",
          bgLight: "bg-amber-500/10",
        };
      case "social":
        return {
          icon: <Share2 size={20} className="text-[color:var(--admin-gold)]" />,
          badge: "bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] border-[color:var(--admin-border-subtle)]",
          cardBorder: "border-[color:var(--admin-border-subtle)]",
          bgLight: "bg-[color:var(--admin-gold-soft)]",
        };
      case "email":
        return {
          icon: <Mail size={20} className="text-[color:var(--admin-gold)]" />,
          badge: "bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] border-[color:var(--admin-border-subtle)]",
          cardBorder: "border-[color:var(--admin-border-subtle)]",
          bgLight: "bg-[color:var(--admin-gold)]/10",
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
          icon: <Bot size={20} className="text-[color:var(--admin-text-muted)]" />,
          badge: "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-muted)] border-[color:var(--admin-border-subtle)] dark:border-[color:var(--admin-border-subtle)]",
          cardBorder: "border-[color:var(--admin-border-subtle)]",
          bgLight: "bg-[color:var(--admin-bg-subtle)]",
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
      <div className="flex flex-col items-center justify-center p-16 text-[color:var(--admin-text-muted)] gap-3">
        <Loader2 size={36} className="animate-spin text-[color:var(--admin-gold)]" />
        <p className="text-sm font-bold">جاري فتح غرفة عمليات الوكلاء الأذكياء (War Room)…</p>
      </div>
    );
  }

  const pendingDecisionsCount = decisions.filter((d) => d.status === "pending").length;

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl border bg-primary text-primary-foreground">
              <Radio size={22} />
            </div>
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2">
                غرفة عمليات الوكلاء الأذكياء (AI Agents War Room)
                <Badge variant="secondary">{agents.length} وكلاء مربوطون</Badge>
              </CardTitle>
              <CardDescription>
                مركز التنسيق والتشاور الذكي بين وكلاء المنصة: المبيعات، الإعلانات، السوشيال، الإيميل، مستشار السفر بالموقع، ووكيل B2B لصفحة الهبوط.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon" onClick={() => void fetchData()} title="تحديث البيانات اللحظية">
              <RefreshCw size={16} />
            </Button>
            <Badge variant="outline">
              <Activity size={14} />
              القرارات المعلقة: {pendingDecisionsCount}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {feedback && (
        <div className="p-4 rounded-2xl bg-[color:var(--admin-gold-soft)] border border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-primary)] dark:text-[color:var(--admin-text-muted)] text-xs font-bold animate-in fade-in flex items-center gap-2 shadow-sm">
          <Sparkles size={18} className="text-[color:var(--admin-gold)] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="admin-agent-strip relative -mx-1 px-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-[color:var(--admin-text-muted)]">شريط الوكلاء — مرّروا دون شريط تمرير ظاهر</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => sliderRef.current?.scrollBy({ left: 280, behavior: "smooth" })} className="p-2 rounded-xl border bg-[color:var(--admin-bg-surface)] border-[color:var(--admin-border-subtle)]">
              <ChevronRight size={16} />
            </button>
            <button type="button" onClick={() => sliderRef.current?.scrollBy({ left: -280, behavior: "smooth" })} className="p-2 rounded-xl border bg-[color:var(--admin-bg-surface)] border-[color:var(--admin-border-subtle)]">
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
        <div
          ref={sliderRef}
          className="admin-agent-strip__track flex flex-row flex-nowrap overflow-x-auto gap-4 scrollbar-none pb-2"
        >
          {agents.map((agent) => {
            const theme = getAgentTheme(agent.id);
            return (
              <div
                key={agent.id}
                className={`admin-agent-strip__card w-[240px] p-4 rounded-2xl border ${theme.cardBorder} bg-[color:var(--admin-bg-surface)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)] shadow-sm">
                      {theme.icon}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSettingsAgentId(agent.id)}
                        className="p-1.5 rounded-lg border border-[color:var(--admin-border-subtle)] hover:bg-[color:var(--admin-bg-subtle)]"
                        title="إعدادات الوكيل"
                      >
                        <Settings size={14} />
                      </button>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${agent.connected ? "bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] border-[color:var(--admin-border-subtle)]" : "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-muted)] border-[color:var(--admin-border-subtle)]"}`}>
                        <span className={`size-1.5 rounded-full ${agent.connected ? "bg-[color:var(--admin-gold)] animate-pulse" : "bg-[color:var(--admin-text-muted)]"}`} />
                        {agent.connected ? "حي" : "محدود"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-xs font-bold text-[color:var(--admin-text-primary)] leading-tight">{agent.nameAr}</h3>
                    <p className="text-[11px] text-[color:var(--admin-text-muted)] font-medium mt-0.5 leading-snug">{agent.titleAr}</p>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-[color:var(--admin-border-subtle)] space-y-2">
                  <p className="text-[11px] text-[color:var(--admin-text-muted)] font-medium leading-relaxed min-h-[36px]">
                    {agent.currentTaskAr}
                  </p>
                  <div className="text-[10px] font-mono flex items-center justify-between bg-[color:var(--admin-bg-subtle)] px-2.5 py-1.5 rounded-xl border border-[color:var(--admin-border-subtle)] gap-2">
                    <span className="text-[color:var(--admin-text-muted)] shrink-0">المؤشر:</span>
                    <span className="text-[color:var(--admin-text-primary)] font-bold text-end">{agent.keyMetric}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setCreatingAgent(true)}
            className="admin-agent-strip__card w-[240px] min-h-[190px] p-4 rounded-2xl border border-dashed border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-purple-soft)] flex flex-col items-center justify-center gap-2 text-[color:var(--admin-purple-royal)]"
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
        <Card className="lg:col-span-7 flex flex-col gap-4 p-0">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)]">
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[color:var(--admin-text-primary)]">بث النقاش والتنسيق اللحظي بين الوكلاء</h2>
                <p className="text-[11px] text-[color:var(--admin-text-muted)]">حوار ذكي وتفكير مشترك موجه بنماذج الذكاء الاصطناعي</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[color:var(--admin-text-muted)] font-mono bg-[color:var(--admin-bg-subtle)] px-2.5 py-1 rounded-full">
              {discussions.length} رسالة حية
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5 overflow-y-auto max-h-[620px] pe-2 custom-scrollbar">
            {discussions.length === 0 ? (
              <div className="p-16 text-center text-[color:var(--admin-text-muted)] text-xs">
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
                          : "border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-primary)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[color:var(--admin-bg-surface)] border border-[color:var(--admin-border-subtle)] shadow-xs">
                          {fromTheme.icon}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${fromTheme.badge}`}>
                          {msg.fromAgent === "admin"
                            ? "المدير التنفيذي (أمر مباشر)"
                            : agents.find((a) => a.id === msg.fromAgent)?.nameAr || msg.fromAgent}
                        </span>
                        {msg.toAgent && msg.toAgent !== "all" && (
                          <span className="text-[11px] text-[color:var(--admin-text-muted)] flex items-center gap-1 font-medium">
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
                              : "bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-muted)] border border-[color:var(--admin-border-subtle)]"
                          }`}
                        >
                          {msg.type}
                        </span>
                        <span className="text-[10px] font-mono text-[color:var(--admin-text-muted)]">
                          {new Date(msg.timestamp).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[color:var(--admin-text-primary)] mb-1">{msg.topic}</h4>
                      <p className="text-xs text-[color:var(--admin-text-muted)] leading-relaxed whitespace-pre-wrap">{msg.contentAr}</p>
                    </div>

                    {/* Proposal Attachment Card */}
                    {msg.proposalData && (
                      <div className="p-3.5 rounded-xl bg-[color:var(--admin-bg-surface)] border border-amber-200 dark:border-amber-800/80 text-xs space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between text-amber-800 dark:text-[color:var(--admin-gold)] font-bold text-[11px]">
                          <span>⚡ إجراء مقترح: {msg.proposalData.suggestedChange}</span>
                          {msg.proposalData.estimatedCostUSD && (
                            <span className="font-mono text-[color:var(--admin-text-primary)] font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              ${msg.proposalData.estimatedCostUSD}
                            </span>
                          )}
                        </div>
                        {msg.proposalData.estimatedRoiGain && (
                          <p className="text-[11px] text-[color:var(--admin-gold)] font-medium">
                            🎯 الأثر المتوقع: {msg.proposalData.estimatedRoiGain}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right 5 Cols: Directives & Pending Approvals */}
        <div className="lg:col-span-5 space-y-6">
          {/* Directive Input Box */}
          <Card className="p-0">
            <CardHeader>
              <CardTitle className="text-sm">توجيه وأمر إداري مباشر للخلية</CardTitle>
              <CardDescription>التنفيذ الفوري والتنسيق التلقائي عبر Gemini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendDirective();
              }}
              className="space-y-3"
            >
              <textarea
                rows={3}
                className="w-full bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)] rounded-2xl p-3.5 text-xs text-[color:var(--admin-text-primary)] placeholder:text-[color:var(--admin-text-faint)] outline-none focus:border-[color:var(--admin-gold)] focus:ring-2 focus:ring-[color:var(--admin-gold)]/20 transition-all leading-relaxed shadow-inner"
                placeholder="اكتب توجيهك (مثلاً: ركزوا على عروض طرابزون، ارفعوا ميزانية إنستغرام، واقترحوا باقة سياحية جديدة)..."
                value={directiveText}
                onChange={(e) => setDirectiveText(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[color:var(--admin-text-muted)] font-mono">الاستجابة: لحظية عبر Gemini</span>
                <Button
                  type="submit"
                  size="sm"
                  className="admin-btn-primary"
                  disabled={!directiveText.trim() || sendingDirective}
                >
                  {sendingDirective ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>إرسال التوجيه للخلية</span>
                </Button>
              </div>
            </form>

            {/* Quick Preset Buttons - Elegant daylight chips */}
            <div className="space-y-2 pt-3 border-t border-[color:var(--admin-border-subtle)]">
              <span className="text-[11px] font-bold text-[color:var(--admin-text-muted)] block">توجيهات سريعة جاهزة:</span>
              <div className="flex flex-col gap-2">
                {presetDirectives.map((pd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void handleSendDirective(pd)}
                    disabled={sendingDirective}
                    className="text-start p-3 rounded-xl bg-[color:var(--admin-bg-subtle)] hover:bg-[color:var(--admin-gold-soft)] dark:bg-[color:var(--admin-bg-canvas)]  border border-[color:var(--admin-border-subtle)]/80 hover:border-[color:var(--admin-gold)] dark:border-[color:var(--admin-border-subtle)]  text-xs text-[color:var(--admin-text-muted)] hover:text-[color:var(--admin-text-primary)] dark:text-[color:var(--admin-text-muted)]  transition-all leading-relaxed shadow-xs"
                  >
                    ⚡ {pd}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          </Card>

          {/* Active Admin Directives Queue - Prominently Displayed */}
          <div className="rounded-3xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)]">
                  <ListOrdered size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[color:var(--admin-text-primary)]">سجل الأوامر والتوجيهات الإدارية الصادرة</h3>
                  <p className="text-[11px] text-[color:var(--admin-text-muted)]">المهام الموزعة من المشرف العام والمنسق الذكي</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] border border-[color:var(--admin-border-subtle)] font-mono">
                {directives.length} أمر إداري
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pe-1 custom-scrollbar">
              {directives.length === 0 ? (
                <div className="p-6 text-center text-[color:var(--admin-text-muted)] text-xs border border-[color:var(--admin-border-subtle)] rounded-2xl bg-[color:var(--admin-bg-subtle)]">
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
                      className="p-3.5 rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] text-[color:var(--admin-text-primary)] space-y-2 shadow-xs transition-all hover:border-[color:var(--admin-gold)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[color:var(--admin-gold)] ">
                          {targetLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] border border-[color:var(--admin-border-subtle)]">
                            <span className="size-1.5 rounded-full bg-[color:var(--admin-gold)] animate-pulse" />
                            {dir.status === "executing" ? "جاري التنسيق والتنفيذ" : "معتمد"}
                          </span>
                          <span className="text-[10px] font-mono text-[color:var(--admin-text-muted)]">
                            {new Date(dir.createdAt).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[color:var(--admin-text-primary)] leading-relaxed font-medium whitespace-pre-wrap">
                        {dir.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Approvals Queue */}
          <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-[color:var(--admin-bg-surface)] p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[color:var(--admin-text-primary)]">طابور القرارات المعلقة للموافقة</h3>
                  <p className="text-[11px] text-[color:var(--admin-text-muted)]">اعتماد التعديلات المالية والإعلانية</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-[color:var(--admin-gold)] border border-amber-200 dark:border-amber-800 font-mono">
                {pendingDecisionsCount} معلق
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pe-1 custom-scrollbar">
              {decisions.length === 0 ? (
                <div className="p-8 text-center text-[color:var(--admin-text-muted)] text-xs border border-[color:var(--admin-border-subtle)] rounded-2xl bg-[color:var(--admin-bg-subtle)]">
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
                          ? "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-[color:var(--admin-bg-canvas)] text-[color:var(--admin-text-primary)] dark:text-amber-100"
                          : dec.status === "approved"
                            ? "border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-gold-soft)] opacity-80"
                            : "border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-[color:var(--admin-bg-subtle)] opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">#{dec.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dec.status === "approved"
                              ? "bg-[color:var(--admin-gold-soft)] text-[color:var(--admin-gold)] border border-[color:var(--admin-border-subtle)]"
                              : dec.status === "rejected"
                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-[color:var(--admin-gold)] border border-amber-200 dark:border-amber-800 animate-pulse"
                          }`}
                        >
                          {dec.status === "approved"
                            ? "✅ تمت الموافقة"
                            : dec.status === "rejected"
                              ? "❌ تم الرفض"
                              : "⏳ بانتظار موافقتك"}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[color:var(--admin-text-primary)]">{dec.titleAr}</h4>
                      <p className="text-[11px] text-[color:var(--admin-text-muted)] dark:text-[color:var(--admin-text-muted)] leading-relaxed">{dec.descriptionAr}</p>

                      <div className="p-2.5 rounded-xl bg-[color:var(--admin-bg-surface)] border border-[color:var(--admin-border-subtle)] space-y-1 text-[10px]">
                        {dec.costUSD && (
                          <div className="flex items-center justify-between text-[color:var(--admin-text-muted)] dark:text-[color:var(--admin-text-muted)]">
                            <span>التكلفة المقترحة:</span>
                            <span className="text-[color:var(--admin-text-primary)] font-bold font-mono">${dec.costUSD}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[color:var(--admin-gold)]">
                          <span>الأثر المتوقع:</span>
                          <span className="font-semibold">{dec.expectedBenefitAr}</span>
                        </div>
                        {dec.executionResult && (
                          <div className="pt-1 text-[10px] text-[color:var(--admin-text-muted)]">
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
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-[color:var(--admin-gold)] hover:text-[color:var(--admin-gold)] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
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
