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
      <div className="flex flex-col items-center justify-center p-16 text-white/60 gap-3">
        <Loader2 size={32} className="animate-spin text-purple-400" />
        <p className="text-sm">جاري تحميل إعدادات وكيل B2B لصفحة الهبوط…</p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-purple-500 transition-all";
  const labelClass = "block text-xs font-bold text-white/80 mb-1.5";

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 p-0.5 shadow-xl shadow-purple-950/20">
            <div className="size-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot size={30} className="text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">وكيل لوناليزا B2B لصفحة الهبوط</h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  config.enabled
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {config.enabled ? "🟣 مفعّل في صفحة الهبوط" : "🔴 معطّل"}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              إدارة وتدريب الوكيل الذكي العائم أسفل يمين صفحة الهبوط، ومحرك الجدوى الاقتصادية للشركات.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              config.enabled
                ? "bg-rose-600/20 border-rose-500/30 text-rose-300 hover:bg-rose-600/30"
                : "bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
            }`}
          >
            {config.enabled ? "تعطيل الوكيل" : "تفعيل الوكيل"}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-950/30 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "general"
              ? "bg-[#2e1065] text-white shadow-md"
              : "bg-white/5 text-white/60 hover:text-white"
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
              ? "bg-[#2e1065] text-white shadow-md"
              : "bg-white/5 text-white/60 hover:text-white"
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
              ? "bg-[#2e1065] text-white shadow-md"
              : "bg-white/5 text-white/60 hover:text-white"
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
              ? "bg-[#2e1065] text-white shadow-md"
              : "bg-white/5 text-white/60 hover:text-white"
          }`}
        >
          <Users size={14} />
          محادثات الشركات ({sessions.length})
        </button>
      </div>

      {/* Tab 1: General & Persona */}
      {activeTab === "general" && (
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4 p-5 rounded-2xl border border-white/10 bg-black/40">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot size={16} className="text-purple-400" />
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

          <div className="md:col-span-6 space-y-4 p-5 rounded-2xl border border-white/10 bg-black/40">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
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
                className="size-4 accent-purple-600 rounded"
              />
              <label htmlFor="ecoToggle" className="text-xs text-white cursor-pointer font-bold">
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
            <h3 className="text-sm font-bold text-white">باقات النظام المعروضة للشركات</h3>
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
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus size={14} />
              إضافة باقة
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {config.packages.map((pkg, idx) => (
              <div key={pkg.id} className="p-4 rounded-2xl border border-white/10 bg-black/40 flex flex-col justify-between gap-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-300 font-bold uppercase">#{pkg.id}</span>
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
        <div className="p-5 rounded-2xl border border-white/10 bg-black/40 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert size={18} />
            <h3>قواعد الأمان والسرية الصارمة (Anti-Extraction & Confidentiality Guardrails)</h3>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
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
          <h3 className="text-sm font-bold text-white">سجل محادثات الشركات الزائرة في صفحة الهبوط</h3>
          {sessions.length === 0 ? (
            <div className="p-12 text-center text-white/40 text-xs border border-white/5 rounded-2xl bg-black/20">
              لا توجد محادثات مسجلة حتى الآن. عند تحدث أي شركة عبر الشات العائم ستظهر هنا بكافة تفاصيلها ودرجة اهتمامها.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sessions.map((sess) => (
                <div key={sess.sessionId} className="p-4 rounded-2xl border border-white/10 bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white font-mono">
                        {sess.visitorName || sess.companyName || sess.sessionId}
                      </span>
                      {sess.phoneOrEmail && (
                        <span className="text-[11px] text-purple-300 block font-mono">
                          📞 {sess.phoneOrEmail}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ⭐ {sess.leadScore}/100
                    </span>
                  </div>

                  <div className="bg-black/40 p-3 rounded-xl max-h-36 overflow-y-auto space-y-1.5 text-xs text-white/80 custom-scrollbar">
                    {sess.messages.map((m) => (
                      <div key={m.id} className="text-[11px]">
                        <strong className={m.sender === "visitor" ? "text-purple-300" : "text-amber-400"}>
                          {m.sender === "visitor" ? "الشركة: " : "الوكيل: "}
                        </strong>
                        <span>{m.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
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
