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
      <div className='flex flex-col items-center justify-center p-16 text-muted-foreground gap-3'>
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-sm">جاري تحميل إعدادات وكيل B2B لصفحة الهبوط…</p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-card-2 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner";
  const labelClass = "block text-xs font-bold text-foreground mb-1.5";

  return (
    <div className="space-y-6" dir="rtl">
      {/* Executive Command Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center shrink-0 shadow-xs">
              <Building2 size={28} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">
                  وكيل لوناليزا B2B لصفحة الهبوط (Autonomous B2B Growth Agent)
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    config.enabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${config.enabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  {config.enabled ? "نشط ومفعل بصفحة الهبوط" : "معطل مؤقتاً"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                إدارة وتدريب الوكيل الذكي العائم أسفل يمين صفحة الهبوط، محرك حاسبة الجدوى الاقتصادية، وإغلاق صفقات الشركاء والشركات السياحية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                config.enabled
                  ? "border-border bg-card hover:bg-muted text-foreground"
                  : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              }`}
            >
              {config.enabled ? "إيقاف مؤقت" : "تفعيل الوكيل"}
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-5 py-2.5 bg-primary hover:opacity-95 disabled:opacity-50 text-primary-foreground rounded-xl text-xs font-black shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>

        {/* 4-HUD Live Metric Bento Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5 mt-5 border-t border-border/70">
          <div className="p-3.5 rounded-2xl bg-card-2 border border-border/80 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
              <Users size={18} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <span className="text-base font-black text-foreground font-mono">{sessions.length} جلسة</span>
              <p className="text-[11px] font-bold text-muted-foreground">استشارات شركات B2B</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card-2 border border-border/80 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <DollarSign size={18} className="text-primary" />
            </div>
            <div>
              <span className="text-base font-black text-foreground font-mono">{config.packages.length} باقات</span>
              <p className="text-[11px] font-bold text-muted-foreground">خطط الاشتراك المعتمدة</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card-2 border border-border/80 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="text-base font-black text-foreground font-mono">{config.maxDiscountPercent || 15}%</span>
              <p className="text-[11px] font-bold text-muted-foreground">سقف الخصم المسموح للوكيل</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card-2 border border-border/80 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground">Gemini 1.5 Flash</span>
              <p className="text-[11px] font-bold text-muted-foreground">محرك التفاوض الذكي</p>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-foreground text-xs font-bold animate-in fade-in flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground text-xs font-bold"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border rounded-2xl w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "general"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Bot size={15} />
          <span>التوجيه وشخصية الوكيل</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "packages"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <DollarSign size={15} />
          <span>باقات الأسعار المعتمدة ({config.packages.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guardrails")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "guardrails"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ShieldAlert size={15} />
          <span>قواعد الأمان والسرية</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "sessions"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Users size={15} />
          <span>محادثات الشركات ({sessions.length})</span>
        </button>
      </div>

      {/* Tab 1: General & Persona */}
      {activeTab === "general" && (
        <div className="grid md:grid-cols-12 gap-6">
          <div className='md:col-span-6 space-y-4 p-5 rounded-2xl border border-border bg-foreground/5'>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <Bot size={16} className="text-primary" />
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

          <div className='md:col-span-6 space-y-4 p-5 rounded-2xl border border-border bg-foreground/5'>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <Sparkles size={16} className='text-secondary' />
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
                className="size-4 accent-purple-600 rounded"
              />
              <label htmlFor="ecoToggle" className='text-xs text-foreground cursor-pointer font-bold'>
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
            <h3 className='text-sm font-bold text-foreground'>باقات النظام المعروضة للشركات</h3>
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
              className='px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:brightness-110 text-foreground text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm'
            >
              <Plus size={14} />
              إضافة باقة
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {config.packages.map((pkg, idx) => (
              <div key={pkg.id} className='p-4 rounded-2xl border border-border bg-foreground/5 flex flex-col justify-between gap-3'>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-primary font-bold uppercase">#{pkg.id}</span>
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
        <div className='p-5 rounded-2xl border border-border bg-foreground/5 space-y-4'>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert size={18} />
            <h3>قواعد الأمان والسرية الصارمة (Anti-Extraction & Confidentiality Guardrails)</h3>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed'>
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
          <h3 className='text-sm font-bold text-foreground'>سجل محادثات الشركات الزائرة في صفحة الهبوط</h3>
          {sessions.length === 0 ? (
            <div className='p-12 text-center text-muted-foreground text-xs border border-border rounded-2xl bg-foreground/5'>
              لا توجد محادثات مسجلة حتى الآن. عند تحدث أي شركة عبر الشات العائم ستظهر هنا بكافة تفاصيلها ودرجة اهتمامها.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sessions.map((sess) => (
                <div key={sess.sessionId} className='p-4 rounded-2xl border border-border bg-background/40 space-y-3'>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className='text-xs font-bold text-foreground font-mono'>
                        {sess.visitorName || sess.companyName || sess.sessionId}
                      </span>
                      {sess.phoneOrEmail && (
                        <span className="text-[11px] text-primary block font-mono">
                          📞 {sess.phoneOrEmail}
                        </span>
                      )}
                    </div>
                    <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-border/30'>
                      ⭐ {sess.leadScore}/100
                    </span>
                  </div>

                  <div className='bg-foreground/5 p-3 rounded-xl max-h-36 overflow-y-auto space-y-1.5 text-xs text-muted-foreground custom-scrollbar'>
                    {sess.messages.map((m) => (
                      <div key={m.id} className="text-[11px]">
                        <strong className={m.sender === "visitor" ? "text-primary" : "text-secondary"}>
                          {m.sender === "visitor" ? "الشركة: " : "الوكيل: "}
                        </strong>
                        <span>{m.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className='flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border'>
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
