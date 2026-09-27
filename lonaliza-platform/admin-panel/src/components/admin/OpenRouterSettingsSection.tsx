"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Search,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRightLeft,
  DollarSign,
  Gift,
  Crown,
  Scale,
} from "lucide-react";
import {
  CURATED_OPENROUTER_MODELS,
  DEFAULT_AGENT_MODELS,
  DEFAULT_FALLBACK_CASCADE,
  type AgentModelAssignments,
  type FallbackCascadeConfig,
  type ModelProvider,
  type ModelTier,
  type OpenRouterModelInfo,
} from "@/lib/openrouter-models";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { AdminSettingsPanel } from "@/components/admin/layout";

const inputClass =
  "w-full min-w-0 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";
const labelClass =
  "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

export default function OpenRouterSettingsSection() {
  const [providerMode, setProviderMode] = useState<"gemini" | "openrouter">("openrouter");
  const [globalDefault, setGlobalDefault] = useState("anthropic/claude-sonnet-5");
  const [fallbackCascade, setFallbackCascade] = useState<FallbackCascadeConfig>(DEFAULT_FALLBACK_CASCADE);
  const [agentModels, setAgentModels] = useState<AgentModelAssignments>(DEFAULT_AGENT_MODELS);
  const [models, setModels] = useState<OpenRouterModelInfo[]>(CURATED_OPENROUTER_MODELS);
  const [hasKey, setHasKey] = useState(false);
  const [keyMasked, setKeyMasked] = useState("");
  const [keyDraft, setKeyDraft] = useState("");
  const [showKey, setShowKey] = useState(false);

  // Filters & State
  const [selectedTier, setSelectedTier] = useState<"all" | ModelTier>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");

  // Load config on mount
  useEffect(() => {
    fetch("/api/admin/openrouter/sync")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.config) {
          setProviderMode(data.config.providerMode || "openrouter");
          setGlobalDefault(data.config.globalDefaultModel || "anthropic/claude-sonnet-5");
          if (data.config.fallbackCascade) setFallbackCascade(data.config.fallbackCascade);
          if (data.config.agentModels) setAgentModels(data.config.agentModels);
          if (data.config.cachedDynamicModels?.length) setModels(data.config.cachedDynamicModels);
          setHasKey(Boolean(data.config.hasOpenRouterKey));
          setKeyMasked(data.config.openRouterApiKeyMasked || "");
          setLastSyncedAt(data.config.lastSyncedAt || "");
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/admin/openrouter/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: keyDraft.trim() || undefined,
          saveKey: Boolean(keyDraft.trim()),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        if (data.models?.length) setModels(data.models);
        setSyncMsg(data.message || `تم تحديث ${data.totalModels} نموذجاً بنجاح.`);
        setLastSyncedAt(new Date().toISOString());
        if (keyDraft.trim()) {
          setHasKey(true);
          setKeyMasked(`${keyDraft.slice(0, 4)}••••••••${keyDraft.slice(-4)}`);
          setKeyDraft("");
        }
      } else {
        setSyncMsg(`تنبيه: ${data.error}`);
      }
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "فشلت المزامنة");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 6000);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/openrouter/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerMode,
          globalDefaultModel: globalDefault,
          fallbackCascade,
          agentModels,
          openRouterApiKey: keyDraft.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSaveMsg("تم حفظ إعدادات OpenRouter والنماذج بنجاح.");
        if (keyDraft.trim()) {
          setHasKey(true);
          setKeyMasked(`${keyDraft.slice(0, 4)}••••••••${keyDraft.slice(-4)}`);
          setKeyDraft("");
        }
      } else {
        setSaveMsg(data.error || "فشل الحفظ");
      }
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 4000);
    }
  };

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      if (selectedTier !== "all" && m.tier !== selectedTier) return false;
      if (selectedProvider !== "all" && m.provider !== selectedProvider) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.descriptionAr.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [models, selectedTier, selectedProvider, searchQuery]);

  const freeCount = useMemo(() => models.filter((m) => m.isFree).length, [models]);
  const balancedCount = useMemo(() => models.filter((m) => m.tier === "balanced").length, [models]);
  const flagshipCount = useMemo(() => models.filter((m) => m.tier === "flagship").length, [models]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Provider Selector */}
      <AdminSettingsPanel
        span={12}
        title="محرك OpenRouter ونماذج الذكاء الاصطناعي (تحديث 2026)"
        description="تكامل شامل يتيح لك ولأي عميل أو شركة اختيار النماذج المناسبة للميزانية (فاخرة، متوسطة اقتصادية، أو مجانية 100%) والتبديل التلقائي عند انقطاع الخدمة."
      >
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-violet-200/70 bg-gradient-to-r from-violet-50/60 via-purple-50/40 to-white">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-200">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base">
                  وضع المزود النشط (Active Provider)
                </h4>
                <p className="text-xs text-slate-500">
                  حدد ما إذا كنت تريد استخدام محرك OpenRouter الشامل أو Google Gemini المباشر.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-border shadow-xs">
              <button
                type="button"
                onClick={() => setProviderMode("openrouter")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  providerMode === "openrouter"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap size={13} />
                OpenRouter Engine (شامل النماذج)
              </button>
              <button
                type="button"
                onClick={() => setProviderMode("gemini")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  providerMode === "gemini"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Google Gemini Direct
              </button>
            </div>
          </div>

          {/* API Key Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-8">
              <label className={labelClass}>مفتاح OpenRouter API Key</label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder={
                    hasKey
                      ? `مفتاح محفوظ (${keyMasked}) — اتركه فارغاً للإبقاء عليه`
                      : "sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
                  }
                  className={`${inputClass} pe-10 font-mono`}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {hasKey ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck size={12} />
                    مفتاح معتمد ومحفوظ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    لم يُدخل مفتاح (يعمل على النماذج المجانية والموجه الذكي)
                  </span>
                )}
                {lastSyncedAt && (
                  <span className="text-[11px] text-slate-400">
                    آخر مزامنة: {new Date(lastSyncedAt).toLocaleDateString("ar-SA")}
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                {syncing ? "جارٍ الاتصال وجلب النماذج..." : "تحديث حي ومزامنة OpenRouter"}
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
              >
                {saving ? "حفظ..." : "حفظ"}
              </button>
            </div>
          </div>

          {syncMsg && (
            <div className="p-3 rounded-xl bg-violet-50 text-violet-800 text-xs border border-violet-200 font-medium flex items-center gap-2">
              <CheckCircle2 size={15} className="text-violet-600 shrink-0" />
              <span>{syncMsg}</span>
            </div>
          )}
          {saveMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 font-medium flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>{saveMsg}</span>
            </div>
          )}
        </div>
      </AdminSettingsPanel>

      {/* 2. Cascading Fallback Selector & Global Default */}
      <AdminSettingsPanel
        span={12}
        title="التسلسل الهرمي للتبديل التلقائي (Cascading Fallback Tiers)"
        description="إذا واجه النموذج الأساسي ضغطاً أو نفاداً في الحصة، ينتقل المحرك تلقائياً وفورياً إلى النموذج التالي دون انقطاع خدمة العميل."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tier 1 */}
            <div className="p-3.5 rounded-xl border border-violet-200 bg-violet-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-violet-700 tracking-wider">
                  المستوى 1: النموذج الرئيسي (Primary)
                </span>
                <Crown size={14} className="text-amber-500" />
              </div>
              <select
                value={fallbackCascade.tier1}
                onChange={(e) =>
                  setFallbackCascade((prev) => ({ ...prev, tier1: e.target.value }))
                }
                className="w-full text-xs font-semibold bg-white border border-border rounded-lg p-2 focus:ring-1 focus:ring-violet-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                  </option>
                ))}
              </select>
            </div>

            {/* Tier 2 */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-blue-700 tracking-wider">
                  المستوى 2: الاحتياطي الأول (Secondary)
                </span>
                <Scale size={14} className="text-blue-500" />
              </div>
              <select
                value={fallbackCascade.tier2}
                onChange={(e) =>
                  setFallbackCascade((prev) => ({ ...prev, tier2: e.target.value }))
                }
                className="w-full text-xs font-semibold bg-white border border-border rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                  </option>
                ))}
              </select>
            </div>

            {/* Tier 3 */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">
                  المستوى 3: الاحتياطي الاقتصادي
                </span>
                <Gift size={14} className="text-emerald-500" />
              </div>
              <select
                value={fallbackCascade.tier3}
                onChange={(e) =>
                  setFallbackCascade((prev) => ({ ...prev, tier3: e.target.value }))
                }
                className="w-full text-xs font-semibold bg-white border border-border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                  </option>
                ))}
              </select>
            </div>

            {/* Tier 4 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                  المستوى 4: طوارئ مجاني (Emergency)
                </span>
                <Zap size={14} className="text-slate-500" />
              </div>
              <select
                value={fallbackCascade.tier4}
                onChange={(e) =>
                  setFallbackCascade((prev) => ({ ...prev, tier4: e.target.value }))
                }
                className="w-full text-xs font-semibold bg-white border border-border rounded-lg p-2 focus:ring-1 focus:ring-slate-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </AdminSettingsPanel>

      {/* 3. Per-Agent Routing Matrix */}
      <AdminSettingsPanel
        span={12}
        title="تخصيص النماذج لكل وكيل في خلية الوكلاء (Agent Routing)"
        description="يمكنك تحديد نموذج مخصص لكل وكيل حسب طبيعة عمله، أو إبقائه على النموذج الافتراضي للخلية."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Planner Concierge */}
          <div className="p-3.5 rounded-xl border border-border bg-white shadow-xs">
            <span className="text-xs font-bold text-slate-900 block mb-1">
              🗺️ وكيل الشات والتخطيط السياحي (Planner Concierge)
            </span>
            <p className="text-[11px] text-slate-500 mb-2">
              مسؤول عن تصميم الرحلات الفاخرة وجداول المعالم والأيام.
            </p>
            <select
              value={agentModels.planner_concierge || globalDefault}
              onChange={(e) =>
                setAgentModels((prev) => ({ ...prev, planner_concierge: e.target.value }))
              }
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                </option>
              ))}
            </select>
          </div>

          {/* Sales Agent */}
          <div className="p-3.5 rounded-xl border border-border bg-white shadow-xs">
            <span className="text-xs font-bold text-slate-900 block mb-1">
              💼 وكيل المبيعات والأتمتة (AI Sales)
            </span>
            <p className="text-[11px] text-slate-500 mb-2">
              إغلاق صفقات الطيران والفنادق والرد السريع على العملاء.
            </p>
            <select
              value={agentModels.sales || globalDefault}
              onChange={(e) =>
                setAgentModels((prev) => ({ ...prev, sales: e.target.value }))
              }
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                </option>
              ))}
            </select>
          </div>

          {/* Publishing & Social */}
          <div className="p-3.5 rounded-xl border border-border bg-white shadow-xs">
            <span className="text-xs font-bold text-slate-900 block mb-1">
              ✍️ وكيل النشر والمحتوى وتدقيق الباقات (Publisher)
            </span>
            <p className="text-[11px] text-slate-500 mb-2">
              تدقيق البرامج المنشأة، صياغة المقالات، ونشر الباقات الرسمية.
            </p>
            <select
              value={agentModels.social || globalDefault}
              onChange={(e) =>
                setAgentModels((prev) => ({ ...prev, social: e.target.value }))
              }
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                </option>
              ))}
            </select>
          </div>

          {/* Mobile App Concierge */}
          <div className="p-3.5 rounded-xl border border-border bg-white shadow-xs">
            <span className="text-xs font-bold text-slate-900 block mb-1">
              📱 مساعد تطبيق الجوال (Mobile Concierge)
            </span>
            <p className="text-[11px] text-slate-500 mb-2">
              مرافقة مسافري تطبيق الهاتف والرد الفوري الخفيف.
            </p>
            <select
              value={agentModels.app_concierge || globalDefault}
              onChange={(e) =>
                setAgentModels((prev) => ({ ...prev, app_concierge: e.target.value }))
              }
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                </option>
              ))}
            </select>
          </div>

          {/* B2B Agent */}
          <div className="p-3.5 rounded-xl border border-border bg-white shadow-xs">
            <span className="text-xs font-bold text-slate-900 block mb-1">
              🏢 وكيل نمو الشركات B2B (Landing Agent)
            </span>
            <p className="text-[11px] text-slate-500 mb-2">
              التفاوض وإقناع شركات السياحة بالجدوى الاقتصادية للمنصة.
            </p>
            <select
              value={agentModels.b2b_landing || globalDefault}
              onChange={(e) =>
                setAgentModels((prev) => ({ ...prev, b2b_landing: e.target.value }))
              }
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminSettingsPanel>

      {/* 4. Model Catalog & Financial Tiers Filter */}
      <AdminSettingsPanel
        span={12}
        title={`دليل النماذج المتاحة (${filteredModels.length} من أصل ${models.length})`}
        description="تصفح النماذج مصنفة حسب ميزانيتك، مع إمكانية البحث وتعيين أي نموذج كافتراضي للخلية."
      >
        <div className="space-y-4">
          {/* Controls: Tier buttons + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Financial Tier Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setSelectedTier("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedTier === "all"
                    ? "bg-white text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                الكل ({models.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("flagship")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedTier === "flagship"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Crown size={12} className="text-amber-400" />
                💎 فاخرة رائدة ({flagshipCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("balanced")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedTier === "balanced"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Scale size={12} className="text-blue-300" />
                ⚖️ متوسطة متوازنة ({balancedCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("free")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedTier === "free"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Gift size={12} className="text-emerald-200" />
                🎁 مجانية بالكامل ({freeCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن نموذج..."
                className={`${inputClass} ps-9 text-xs`}
              />
              <Search
                size={14}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[560px] overflow-y-auto pe-1">
            {filteredModels.map((m) => {
              const isDefault = globalDefault === m.id;
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDefault
                      ? "border-violet-500 bg-violet-50/40 ring-1 ring-violet-400/50"
                      : "border-border bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        {m.name}
                        {isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-violet-600 text-white">
                            الافتراضي
                          </span>
                        )}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400 truncate block max-w-[200px]">
                        {m.id}
                      </span>
                    </div>

                    {/* Price Badge */}
                    {m.isFree ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        <Gift size={11} />
                        مجاني 100%
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        m.tier === "balanced"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-purple-100 text-purple-800 border border-purple-200"
                      }`}>
                        ${m.promptPricePerM}/M
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-2.5 leading-relaxed">
                    {m.descriptionAr}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>السياق: {Math.round(m.contextLength / 1000)}k توكن</span>
                    <button
                      type="button"
                      onClick={() => setGlobalDefault(m.id)}
                      className={`font-bold hover:underline ${
                        isDefault ? "text-violet-600" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {isDefault ? "✓ محدد كافتراضي" : "تعيين كافتراضي للخلية"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AdminSettingsPanel>
    </div>
  );
}
