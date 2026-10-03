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
  Cpu,
  Brain,
  Sliders,
  AlertTriangle,
  Flame,
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
import {
  GEMINI_2026_MODELS,
  DEFAULT_GEMINI_FALLBACK_CASCADE,
  DEFAULT_GEMINI_AGENT_MODELS,
  GEMINI_DEFAULT_MODEL,
  type GeminiModelInfo,
} from "@/lib/gemini-models";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { AdminSettingsPanel } from "@/components/admin/layout";
import AiConsumptionAnalyticsPanel from "@/components/admin/AiConsumptionAnalyticsPanel";

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

  // Gemini Direct Settings & State
  const [geminiPaidKeyEnabled, setGeminiPaidKeyEnabled] = useState(false);
  const [hasGeminiFreeKey, setHasGeminiFreeKey] = useState(false);
  const [geminiFreeKeyMasked, setGeminiFreeKeyMasked] = useState("");
  const [hasGeminiPaidKey, setHasGeminiPaidKey] = useState(false);
  const [geminiPaidKeyMasked, setGeminiPaidKeyMasked] = useState("");
  const [geminiUsageToday, setGeminiUsageToday] = useState<{ freeCount: number; paidCount: number }>({
    freeCount: 0,
    paidCount: 0,
  });
  const [togglingGeminiPaid, setTogglingGeminiPaid] = useState(false);

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
    // 1. Load OpenRouter settings
    fetch("/api/admin/openrouter/sync")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.config) {
          const mode = data.config.providerMode || "openrouter";
          setProviderMode(mode);
          setGlobalDefault(
            data.config.globalDefaultModel ||
              (mode === "gemini" ? GEMINI_DEFAULT_MODEL : "anthropic/claude-sonnet-5")
          );
          if (data.config.fallbackCascade) setFallbackCascade(data.config.fallbackCascade);
          if (data.config.agentModels) setAgentModels(data.config.agentModels);
          if (data.config.cachedDynamicModels?.length) setModels(data.config.cachedDynamicModels);
          setHasKey(Boolean(data.config.hasOpenRouterKey));
          setKeyMasked(data.config.openRouterApiKeyMasked || "");
          setLastSyncedAt(data.config.lastSyncedAt || "");
        }
      })
      .catch(() => {});

    // 2. Load Gemini Direct settings & quota status
    fetch("/api/gemini/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.settings) {
          setGeminiPaidKeyEnabled(Boolean(data.settings.salesPaidKeyEnabled));
          setHasGeminiFreeKey(Boolean(data.settings.hasFreeApiKey));
          setGeminiFreeKeyMasked(data.settings.freeApiKeyMasked || "");
          setHasGeminiPaidKey(Boolean(data.settings.hasApiKey));
          setGeminiPaidKeyMasked(data.settings.apiKeyMasked || "");
          if (data.settings.usageToday) {
            setGeminiUsageToday(data.settings.usageToday);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleGeminiPaid = async (enabled: boolean) => {
    setTogglingGeminiPaid(true);
    try {
      const res = await fetch("/api/gemini/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesPaidKeyEnabled: enabled }),
      });
      const data = await res.json();
      if (data.ok) {
        setGeminiPaidKeyEnabled(enabled);
        setSaveMsg(
          enabled
            ? "تم تفعيل وضع Gemini المدفوع (Paid Billing Tier) — مسموح بنماذج Pro والتفكير العميق."
            : "تم قفل الوضع المدفوع — النظام يعمل حصرياً بالحصة المجانية 100% (1,500 طلب/يوم - $0.00)."
        );
      }
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "فشل تعديل حالة وضع Gemini المدفوع");
    } finally {
      setTogglingGeminiPaid(false);
      setTimeout(() => setSaveMsg(""), 4500);
    }
  };

  const handleSwitchProviderMode = (mode: "gemini" | "openrouter") => {
    setProviderMode(mode);
    if (mode === "gemini") {
      if (
        globalDefault.includes("/") ||
        globalDefault.includes("claude") ||
        globalDefault.includes("gpt")
      ) {
        setGlobalDefault(GEMINI_DEFAULT_MODEL);
      }
      if (fallbackCascade.tier1.includes("/")) {
        setFallbackCascade(DEFAULT_GEMINI_FALLBACK_CASCADE);
      }
    } else {
      if (globalDefault.startsWith("gemini-")) {
        setGlobalDefault("anthropic/claude-sonnet-5");
      }
      if (fallbackCascade.tier1.startsWith("gemini-")) {
        setFallbackCascade(DEFAULT_FALLBACK_CASCADE);
      }
    }
  };

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
        setSaveMsg("تم حفظ إعدادات المحرك وتخصيصات النماذج بنجاح.");
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

  // Filtered OpenRouter models
  const filteredOpenRouterModels = useMemo(() => {
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

  // Filtered Gemini 2026 models
  const filteredGeminiModels = useMemo(() => {
    return GEMINI_2026_MODELS.filter((m) => {
      if (selectedTier !== "all" && m.tier !== selectedTier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.labelAr.toLowerCase().includes(q) ||
          m.descriptionAr.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedTier, searchQuery]);

  const geminiFreeCount = useMemo(() => GEMINI_2026_MODELS.filter((m) => m.isFree).length, []);
  const geminiBalancedCount = useMemo(() => GEMINI_2026_MODELS.filter((m) => m.tier === "balanced").length, []);
  const geminiFlagshipCount = useMemo(() => GEMINI_2026_MODELS.filter((m) => m.tier === "flagship").length, []);

  const openRouterFreeCount = useMemo(() => models.filter((m) => m.isFree).length, [models]);
  const openRouterBalancedCount = useMemo(() => models.filter((m) => m.tier === "balanced").length, [models]);
  const openRouterFlagshipCount = useMemo(() => models.filter((m) => m.tier === "flagship").length, [models]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Provider Selector */}
      <AdminSettingsPanel
        span={12}
        title="محرك الذكاء الاصطناعي ونماذج 2026 (OpenRouter & Google Gemini)"
        description="تحكم سيادي متكامل يتيح التبديل الفوري بين Google Gemini المباشر و OpenRouter الشامل، وضبط الحصة المجانية والوضع المدفوع بدقة لكل وكيل."
      >
        <div className="space-y-6">
          {/* Provider Mode Switcher Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card/60 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md transition-colors ${
                  providerMode === "gemini" ? "bg-primary shadow-primary/20" : "bg-violet-600 shadow-violet-200"
                }`}
              >
                {providerMode === "gemini" ? <Cpu size={24} /> : <Sparkles size={24} />}
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm md:text-base flex items-center gap-2">
                  المزود النشط:{" "}
                  {providerMode === "gemini" ? (
                    <span className="text-primary font-black">Google Gemini Direct (الجيل الأحدث 2026)</span>
                  ) : (
                    <span className="text-violet-600 font-black">OpenRouter Engine (محرك النماذج المتعددة)</span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {providerMode === "gemini"
                    ? "اتصال مباشر مع خوادم Google AI Studio بحصة مجانية 1,500 طلب/يوم أو تحويل ذكي للمدفوع."
                    : "محرك يضم كبرى شركات الذكاء الاصطناعي (Claude Sonnet 5, GPT-5, DeepSeek R1)."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => handleSwitchProviderMode("gemini")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  providerMode === "gemini"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Cpu size={14} />
                Google Gemini Direct
              </button>
              <button
                type="button"
                onClick={() => handleSwitchProviderMode("openrouter")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  providerMode === "openrouter"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap size={14} />
                OpenRouter Engine
              </button>
            </div>
          </div>

          {/* Conditional Control Box: Gemini vs OpenRouter */}
          {providerMode === "gemini" ? (
            /* Gemini Direct Status & Paid Mode Switch */
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Free Quota & Paid Status */}
                <div className="md:col-span-8 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Gift size={13} />
                      الحصة المجانية 100%: 1,500 طلب/يوم ($0.00)
                    </span>
                    {hasGeminiFreeKey ? (
                      <span className="text-[11px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                        مفتاح المجاني: {geminiFreeKeyMasked || "معتمد"}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        مفتاح الحصة المجانية مسجل من متغيرات البيئة
                      </span>
                    )}
                    {hasGeminiPaidKey && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                        <ShieldCheck size={12} />
                        مفتاح الدفع ({geminiPaidKeyMasked})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    منظومة Gemini تتيح تشغيل نماذج الفلاش الخفيفة مجاناً بالكامل. لتشغيل نماذج Pro والاستدلال التفكيري العالي دون انقطاع، قم بتفعيل زِر الوضع المدفوع أدناه.
                  </p>
                </div>

                {/* Paid Mode Switch */}
                <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center">
                  <div className="p-3 rounded-xl border border-border bg-background shadow-xs w-full">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          تفعيل زر الوضع المدفوع (Paid Key)
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {geminiPaidKeyEnabled ? "مدفوع نشط: استدلال عميق" : "مجاني فقط: 0.00$ بدون أي رسوم"}
                        </span>
                      </div>
                      <AdminSwitch
                        checked={geminiPaidKeyEnabled}
                        disabled={togglingGeminiPaid}
                        onChange={handleToggleGeminiPaid}
                        aria-label="تفعيل وضع Gemini المدفوع"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Quota Bar */}
              <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-primary/10 text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>
                    الاستهلاك المجاني اليوم:{" "}
                    <strong className="text-foreground">{geminiUsageToday.freeCount}</strong> / 1,500 طلب
                  </span>
                  <span>
                    الاستهلاك المدفوع اليوم:{" "}
                    <strong className="text-foreground">{geminiUsageToday.paidCount}</strong> طلب
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition"
                >
                  {saving ? "جارٍ الحفظ..." : "حفظ إعدادات Gemini"}
                </button>
              </div>
            </div>
          ) : (
            /* OpenRouter API Key Box */
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
                    aria-label={showKey ? "إخفاء المفتاح" : "إظهار المفتاح"}
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
                    <span className="text-[11px] text-muted-foreground">
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
                  {syncing ? "جارٍ جلب النماذج..." : "مزامنة نماذج OpenRouter"}
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
          )}

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

      {/* 2. Dual AI Consumption & Token Ledger Dashboard */}
      <AiConsumptionAnalyticsPanel />

      {/* 3. Cascading Fallback Selector & Global Default */}
      <AdminSettingsPanel
        span={12}
        title={`التسلسل الهرمي للتبديل التلقائي (${providerMode === "gemini" ? "نماذج Google Gemini 2026" : "نماذج OpenRouter"})`}
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
                onChange={(e) => setFallbackCascade((prev) => ({ ...prev, tier1: e.target.value }))}
                className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2 focus:ring-1 focus:ring-violet-500"
              >
                {providerMode === "gemini"
                  ? GEMINI_2026_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                      </option>
                    ))
                  : models.map((m) => (
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
                onChange={(e) => setFallbackCascade((prev) => ({ ...prev, tier2: e.target.value }))}
                className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
              >
                {providerMode === "gemini"
                  ? GEMINI_2026_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                      </option>
                    ))
                  : models.map((m) => (
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
                onChange={(e) => setFallbackCascade((prev) => ({ ...prev, tier3: e.target.value }))}
                className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              >
                {providerMode === "gemini"
                  ? GEMINI_2026_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                      </option>
                    ))
                  : models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                      </option>
                    ))}
              </select>
            </div>

            {/* Tier 4 */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">
                  المستوى 4: طوارئ مجاني (Emergency)
                </span>
                <Zap size={14} className="text-amber-500" />
              </div>
              <select
                value={fallbackCascade.tier4}
                onChange={(e) => setFallbackCascade((prev) => ({ ...prev, tier4: e.target.value }))}
                className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2 focus:ring-1 focus:ring-primary"
              >
                {providerMode === "gemini"
                  ? GEMINI_2026_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                      </option>
                    ))
                  : models.map((m) => (
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
        title={`تخصيص النماذج لكل وكيل في خلية الوكلاء (${providerMode === "gemini" ? "Google Gemini 2026" : "OpenRouter Matrix"})`}
        description="تحديد النموذج ونمط الاستدلال التفكيري لكل وكيل حسب وظيفته وحساسية بياناته، أو إبقائه على النموذج الافتراضي."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Supervisor Brain */}
          <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                👑 الوكيل المشرف العام (Supervisor Brain)
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                استدلال عالي
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              قيادة خلية الوكلاء وتوزيع المهام والتحقق من التوافق والقرارات.
            </p>
            <select
              value={agentModels.ads || (providerMode === "gemini" ? "gemini-3.1-pro-preview" : globalDefault)}
              onChange={(e) => setAgentModels((prev) => ({ ...prev, ads: e.target.value }))}
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {providerMode === "gemini"
                ? GEMINI_2026_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))
                : models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))}
            </select>
          </div>

          {/* Planner Concierge */}
          <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                🗺️ وكيل التخطيط السياحي (Planner Concierge)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                استدلال متوسط
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              تصميم الرحلات الفاخرة، ترتيب جداول المعالم ومطابقة الفنادق.
            </p>
            <select
              value={agentModels.planner_concierge || globalDefault}
              onChange={(e) => setAgentModels((prev) => ({ ...prev, planner_concierge: e.target.value }))}
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {providerMode === "gemini"
                ? GEMINI_2026_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))
                : models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))}
            </select>
          </div>

          {/* Sales Agent */}
          <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                💼 وكيل المبيعات والأتمتة (AI Sales)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                استجابة فورية
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              إغلاق صفقات الطيران والفنادق والردود اللحظية الاقتصادية.
            </p>
            <select
              value={agentModels.sales || (providerMode === "gemini" ? "gemini-3.5-flash-lite" : globalDefault)}
              onChange={(e) => setAgentModels((prev) => ({ ...prev, sales: e.target.value }))}
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {providerMode === "gemini"
                ? GEMINI_2026_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))
                : models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))}
            </select>
          </div>

          {/* Publishing & Social */}
          <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                ✍️ وكيل النشر وتدقيق الباقات (Publisher)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                سرد متقدم
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              تدقيق البرامج السياحية وصياغة المحتوى التحريري بدون قوالب مقالية.
            </p>
            <select
              value={agentModels.social || (providerMode === "gemini" ? "gemini-3.7-flash" : globalDefault)}
              onChange={(e) => setAgentModels((prev) => ({ ...prev, social: e.target.value }))}
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {providerMode === "gemini"
                ? GEMINI_2026_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))
                : models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))}
            </select>
          </div>

          {/* Mobile App Concierge */}
          <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                📱 مساعد تطبيق الجوال (Mobile Concierge)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                مجاني 100%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              مرافقة مسافري تطبيق الهاتف مع ضمان بقاء التكلفة صفرية.
            </p>
            <select
              value={agentModels.app_concierge || (providerMode === "gemini" ? "gemini-3.5-flash-lite" : globalDefault)}
              onChange={(e) => setAgentModels((prev) => ({ ...prev, app_concierge: e.target.value }))}
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {providerMode === "gemini"
                ? GEMINI_2026_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))
                : models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))}
            </select>
          </div>

          {/* B2B Agent */}
          <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                🏢 وكيل نمو الشركات B2B (Landing Agent)
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                تفاوض ذكي
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              التفاوض وإقناع شركات السياحة بالجدوى الاقتصادية لمنصة لوناليزا.
            </p>
            <select
              value={agentModels.b2b_landing || (providerMode === "gemini" ? "gemini-3.6-flash" : globalDefault)}
              onChange={(e) => setAgentModels((prev) => ({ ...prev, b2b_landing: e.target.value }))}
              className="w-full text-xs font-semibold bg-background border border-border rounded-lg p-2"
            >
              {providerMode === "gemini"
                ? GEMINI_2026_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.isFree ? "مجاني 100%" : `$${m.promptPricePerM}/M`})
                    </option>
                  ))
                : models.map((m) => (
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
        title={`دليل النماذج المتاحة (${providerMode === "gemini" ? filteredGeminiModels.length : filteredOpenRouterModels.length} نموذج)`}
        description={
          providerMode === "gemini"
            ? "دليل نماذج Google Gemini 2026 الرسمية مع تسعير التوكنز وأنماط التفكير وإمكانية التعيين الفوري كافتراضي للخلية."
            : "تصفح نماذج OpenRouter مصنفة حسب ميزانيتك، مع إمكانية البحث وتعيين أي نموذج كافتراضي للخلية."
        }
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
                  selectedTier === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                الكل ({providerMode === "gemini" ? GEMINI_2026_MODELS.length : models.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("flagship")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedTier === "flagship" ? "bg-violet-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Crown size={12} className="text-amber-400" />
                💎 نماذج Pro الرائدة ({providerMode === "gemini" ? geminiFlagshipCount : openRouterFlagshipCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("balanced")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedTier === "balanced" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Scale size={12} className="text-blue-300" />
                ⚖️ فلاش المتوازنة ({providerMode === "gemini" ? geminiBalancedCount : openRouterBalancedCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("free")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedTier === "free" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Gift size={12} className="text-emerald-200" />
                🎁 مجانية بالكامل ({providerMode === "gemini" ? geminiFreeCount : openRouterFreeCount})
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
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[600px] overflow-y-auto pe-1">
            {providerMode === "gemini"
              ? filteredGeminiModels.map((m) => {
                  const isDefault = globalDefault === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDefault
                          ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                          : "border-border bg-card hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h5 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            {m.name}
                            {isDefault && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-primary text-primary-foreground">
                                الافتراضي
                              </span>
                            )}
                          </h5>
                          <span className="text-[10px] font-mono text-muted-foreground truncate block max-w-[200px]">
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
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                              m.tier === "balanced"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            ${m.promptPricePerM}/M
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
                        {m.descriptionAr}
                      </p>

                      <div className="space-y-1.5 text-[10px] text-muted-foreground pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span>السياق: {Math.round(m.contextLength / 1000)}k توكن</span>
                          <span className="font-semibold text-foreground">
                            الإدخال: ${m.promptPricePerM} / الإخراج: ${m.completionPricePerM}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-bold">
                            الاستدلال: {m.supportedReasoningModes.map((r) => (r === "off" ? "بدون" : r === "low" ? "منخفض" : r === "medium" ? "متوسط" : "عالي")).join(" / ")}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGlobalDefault(m.id)}
                            className={`font-bold hover:underline ${
                              isDefault ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {isDefault ? "✓ محدد كافتراضي" : "تعيين كافتراضي للخلية"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              : filteredOpenRouterModels.map((m) => {
                  const isDefault = globalDefault === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDefault
                          ? "border-violet-500 bg-violet-50/40 ring-1 ring-violet-400/50"
                          : "border-border bg-card hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h5 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            {m.name}
                            {isDefault && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-violet-600 text-white">
                                الافتراضي
                              </span>
                            )}
                          </h5>
                          <span className="text-[10px] font-mono text-muted-foreground truncate block max-w-[200px]">
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
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                              m.tier === "balanced"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            ${m.promptPricePerM}/M
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
                        {m.descriptionAr}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-muted-foreground">
                        <span>السياق: {Math.round(m.contextLength / 1000)}k توكن</span>
                        <button
                          type="button"
                          onClick={() => setGlobalDefault(m.id)}
                          className={`font-bold hover:underline ${
                            isDefault ? "text-violet-600" : "text-muted-foreground hover:text-foreground"
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
