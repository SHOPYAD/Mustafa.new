"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Save,
  Loader2,
  Building2,
  Sparkles,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  Server,
  Plus,
  Trash2,
  MessageSquare,
  Users,
  CheckCircle2,
  Star,
} from "lucide-react";
import type {
  B2BLandingAgentConfig,
  B2BChatSession,
  B2BPricingPackage,
} from "@/lib/automation/b2b-landing-agent-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function B2bLandingAgentSettings() {
  const [config, setConfig] = useState<B2BLandingAgentConfig | null>(null);
  const [sessions, setSessions] = useState<B2BChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "packages" | "guardrails" | "sessions">("general");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/b2b-landing-agent");
      const data = (await res.json()) as {
        ok: boolean;
        config?: B2BLandingAgentConfig;
        sessions?: B2BChatSession[];
      };
      if (data.ok && data.config) {
        setConfig(data.config);
        setSessions(data.sessions || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleSave = async () => {
    if (!config || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/b2b-landing-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = (await res.json()) as { ok: boolean; config?: B2BLandingAgentConfig };
      if (data.ok && data.config) {
        setConfig(data.config);
        setFeedback("✅ تم حفظ وتحديث إعدادات وكيل B2B لصفحة الهبوط بنجاح!");
      }
    } catch {
      setFeedback("❌ تعذّر الحفظ، يرجى المحاولة لاحقاً.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-muted-foreground gap-3">
        <Loader2 size={32} className="animate-spin text-[color:var(--admin-gold)]" />
        <p className="text-sm">جاري تحميل إعدادات وكيل B2B لصفحة الهبوط…</p>
      </div>
    );
  }

  const inputClass = "admin-field text-xs";
  const labelClass = "block text-xs font-bold text-foreground mb-1.5";

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl border bg-primary text-primary-foreground">
              <Bot size={22} />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              وكيل لوناليزا B2B لصفحة الهبوط
              <Badge variant={config.enabled ? "secondary" : "outline"}>
                {config.enabled ? "مفعّل في صفحة الهبوط" : "معطّل"}
              </Badge>
            </CardTitle>
            <CardDescription>
              إدارة وتدريب الوكيل الذكي العائم أسفل يمين صفحة الهبوط، ومحرك الجدوى الاقتصادية للشركات.
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={config.enabled ? "destructive" : "default"}
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
          >
            {config.enabled ? "تعطيل الوكيل" : "تفعيل الوكيل"}
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>حفظ الإعدادات</span>
          </Button>
        </div>
        </CardHeader>
      </Card>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-[color:var(--admin-gold-soft)] border border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-muted)] text-xs font-bold animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-admin-border-subtle pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "general"
              ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md"
              : "bg-admin-bg-subtle text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bot size={14} />
          التوجيه والشخصية
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "packages"
              ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md"
              : "bg-admin-bg-subtle text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign size={14} />
          باقات الأسعار المعتمدة ({config.packages.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guardrails")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "guardrails"
              ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md"
              : "bg-admin-bg-subtle text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert size={14} />
          قواعد الأمان والسرية
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "sessions"
              ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-md"
              : "bg-admin-bg-subtle text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users size={14} />
          محادثات الشركات ({sessions.length})
        </button>
      </div>

      {/* Tab 1: General & Persona */}
      {activeTab === "general" && (
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4 p-5 rounded-2xl border border-admin-border-subtle bg-[color:var(--admin-bg-surface)]">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bot size={16} className="text-[color:var(--admin-gold)]" />
              هوية الوكيل ورسائل الترحيب
            </h3>

            <div>
              <label className={labelClass}>اسم الوكيل</label>
              <input
                className={inputClass}
                value={config.agentName}
                onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>المسمى الوظيفي للوكيل</label>
              <input
                className={inputClass}
                value={config.agentTitleAr}
                onChange={(e) => setConfig({ ...config, agentTitleAr: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>رسالة الترحيب بالعربية</label>
              <textarea
                rows={3}
                className={inputClass}
                value={config.welcomeMessageAr}
                onChange={(e) => setConfig({ ...config, welcomeMessageAr: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>رسالة الترحيب بالإنجليزية</label>
              <textarea
                rows={3}
                className={inputClass}
                value={config.welcomeMessageEn}
                onChange={(e) => setConfig({ ...config, welcomeMessageEn: e.target.value })}
              />
            </div>
          </div>

          <div className="md:col-span-6 space-y-4 p-5 rounded-2xl border border-admin-border-subtle bg-[color:var(--admin-bg-surface)]">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              دليل الإقناع والتوجيهات (Prompt System)
            </h3>

            <div>
              <label className={labelClass}>التوجيهات المتقدمة ودور مستشار المبيعات</label>
              <textarea
                rows={11}
                className={`${inputClass} font-mono text-[11px] leading-relaxed`}
                value={config.systemPromptAddition}
                onChange={(e) => setConfig({ ...config, systemPromptAddition: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="ecoToggle"
                checked={config.economicComparisonEnabled}
                onChange={(e) => setConfig({ ...config, economicComparisonEnabled: e.target.checked })}
                className="size-4 accent-[color:var(--admin-gold)] rounded"
              />
              <label htmlFor="ecoToggle" className="text-xs text-foreground cursor-pointer font-bold">
                تفعيل محرك المقارنة والجدوى الاقتصادية التلقائي (ROI Calculator)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Packages & Pricing */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">باقات النظام المعروضة للشركات</h3>
            <button
              type="button"
              onClick={() => {
                const newPkg: B2BPricingPackage = {
                  id: `pkg_${Date.now()}`,
                  nameAr: "باقة جديدة",
                  nameEn: "New Package",
                  priceUSD: 1200,
                  featuresAr: ["ترخيص مدى الحياة", "سيرفر مستقل"],
                };
                setConfig({ ...config, packages: [...config.packages, newPkg] });
              }}
              className="admin-btn-primary text-xs"
            >
              <Plus size={14} />
              إضافة باقة
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {config.packages.map((pkg, idx) => (
              <div key={pkg.id} className="p-4 rounded-2xl border border-admin-border-subtle bg-[color:var(--admin-bg-surface)] flex flex-col justify-between gap-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[color:var(--admin-text-muted)] font-bold uppercase">#{pkg.id}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          packages: config.packages.filter((_, pIdx) => pIdx !== idx),
                        })
                      }
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="حذف الباقة"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <label className={labelClass}>اسم الباقة (عربي)</label>
                    <input
                      className={inputClass}
                      value={pkg.nameAr}
                      onChange={(e) => {
                        const next = [...config.packages];
                        next[idx].nameAr = e.target.value;
                        setConfig({ ...config, packages: next });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>السعر الرسمي ($)</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={pkg.priceUSD}
                        onChange={(e) => {
                          const next = [...config.packages];
                          next[idx].priceUSD = Number(e.target.value);
                          setConfig({ ...config, packages: next });
                        }}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>السعر المخفض ($)</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={pkg.discountPriceUSD || ""}
                        onChange={(e) => {
                          const next = [...config.packages];
                          next[idx].discountPriceUSD = e.target.value ? Number(e.target.value) : undefined;
                          setConfig({ ...config, packages: next });
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>الميزات (ميزة في كل سطر)</label>
                    <textarea
                      rows={4}
                      className={`${inputClass} text-[11px]`}
                      value={pkg.featuresAr.join("\n")}
                      onChange={(e) => {
                        const next = [...config.packages];
                        next[idx].featuresAr = e.target.value.split("\n").filter((l) => l.trim().length > 0);
                        setConfig({ ...config, packages: next });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security & Guardrails */}
      {activeTab === "guardrails" && (
        <div className="p-5 rounded-2xl border border-admin-border-subtle bg-[color:var(--admin-bg-surface)] space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert size={18} />
            <h3>قواعد الأمان والسرية الصارمة (Anti-Extraction & Confidentiality Guardrails)</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            هذه القواعد تحظر على الذكاء الاصطناعي كشف أي تفاصيل تشغيلية سرية خاصة بالسوبر أدمن أو التكاليف الداخلية، وتمنع استدراجه عبر أسئلة ملتوية.
          </p>

          <div>
            <label className={labelClass}>نص حواجز الأمان المحقون في المحرك (Guardrails Prompt)</label>
            <textarea
              rows={8}
              className={`${inputClass} font-mono text-[11px] text-rose-200 border-rose-500/30 leading-relaxed`}
              value={config.guardrailsPrompt}
              onChange={(e) => setConfig({ ...config, guardrailsPrompt: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}>كلمات التحويل الفوري لمسؤول المبيعات البشري (مفصولة بفاصلة)</label>
            <input
              className={inputClass}
              value={config.handoverKeywords.join(", ")}
              onChange={(e) =>
                setConfig({
                  ...config,
                  handoverKeywords: e.target.value.split(",").map((k) => k.trim()),
                })
              }
            />
          </div>
        </div>
      )}

      {/* Tab 4: Sessions */}
      {activeTab === "sessions" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">سجل محادثات الشركات الزائرة في صفحة الهبوط</h3>
          {sessions.length === 0 ? (
            <div className="p-12 text-center text-admin-text-muted text-xs border border-admin-border-subtle rounded-2xl bg-[color:var(--admin-bg-subtle)]">
              لا توجد محادثات مسجلة حتى الآن. عند تحدث أي شركة عبر الشات العائم ستظهر هنا بكافة تفاصيلها ودرجة اهتمامها.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sessions.map((sess) => (
                <div key={sess.sessionId} className="p-4 rounded-2xl border border-admin-border-subtle bg-[color:var(--admin-bg-surface)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground font-mono">
                        {sess.visitorName || sess.companyName || sess.sessionId}
                      </span>
                      {sess.phoneOrEmail && (
                        <span className="text-[11px] text-[color:var(--admin-text-muted)] block font-mono">
                          📞 {sess.phoneOrEmail}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ⭐ {sess.leadScore}/100
                    </span>
                  </div>

                  <div className="bg-[color:var(--admin-bg-surface)] p-3 rounded-xl max-h-36 overflow-y-auto space-y-1.5 text-xs text-foreground custom-scrollbar">
                    {sess.messages.map((m) => (
                      <div key={m.id} className="text-[11px]">
                        <strong className={m.sender === "visitor" ? "text-[color:var(--admin-text-muted)]" : "text-amber-400"}>
                          {m.sender === "visitor" ? "الشركة: " : "الوكيل: "}
                        </strong>
                        <span>{m.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-admin-text-muted pt-1 border-t border-admin-border-subtle">
                    <span>الرسائل: {sess.messages.length}</span>
                    <span>{new Date(sess.updatedAt).toLocaleString("ar-SA")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
