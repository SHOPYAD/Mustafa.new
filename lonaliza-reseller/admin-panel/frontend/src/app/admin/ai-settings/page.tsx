"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Eye,
  EyeOff,
  Save,
  PlugZap,
  CheckCircle2,
  XCircle,
  Loader2,
  KeyRound,
  Cpu,
  ScrollText,
  MessageSquare,
} from "lucide-react";
import {
  fetchGeminiSettings,
  saveGeminiSettings,
  type GeminiClientSettings,
} from "@/data/gemini";
import {
  GEMINI_DEFAULT_MODEL,
  GEMINI_MODEL_OPTIONS,
} from "@/lib/gemini-models";
import AdminSwitch from "@/components/admin/AdminSwitch";
import {
  AdminPage,
  AdminPageHeader,
  AdminSettingsGrid,
  AdminFieldGrid,
  AdminStickySave,
  AdminSettingsPanel,
  type AdminSectionItem,
} from "@/components/admin/layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const inputClass =
  "w-full min-w-0 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm";

const labelClass =
  "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

type AiSection = "keys" | "model" | "prompts" | "sales";

const SECTIONS: AdminSectionItem[] = [
  { id: "keys", label: "المفاتيح والحدود", icon: <KeyRound size={14} /> },
  { id: "model", label: "النموذج", icon: <Cpu size={14} /> },
  { id: "prompts", label: "التعليمات", icon: <ScrollText size={14} /> },
  { id: "sales", label: "مستشار المبيعات", icon: <MessageSquare size={14} /> },
];

export default function AdminAiSettingsPage() {
  const [settings, setSettings] = useState<GeminiClientSettings | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [freeApiKeyDraft, setFreeApiKeyDraft] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showFreeKey, setShowFreeKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [testing, setTesting] = useState(false);
  const [section, setSection] = useState<AiSection>("keys");
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchGeminiSettings()
      .then((s) => {
        setSettings(s);
        setApiKeyDraft("");
      })
      .catch((e) =>
        setTestResult({
          ok: false,
          message: e instanceof Error ? e.message : "فشل التحميل",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSavedMsg("");
    try {
      const next = await saveGeminiSettings({
        model: settings.model,
        systemInstructions: settings.systemInstructions,
        writingRules: settings.writingRules,
        salesWhatsApp: settings.salesWhatsApp,
        salesMarkupPercent: settings.salesMarkupPercent,
        salesInstructions: settings.salesInstructions,
        salesWelcomeAr: settings.salesWelcomeAr,
        salesWelcomeEn: settings.salesWelcomeEn,
        salesBehaviorRules: settings.salesBehaviorRules,
        salesTone: settings.salesTone,
        salesUpsellNotes: settings.salesUpsellNotes,
        salesSaveProgramRules: settings.salesSaveProgramRules,
        salesPreferLiteModel: settings.salesPreferLiteModel,
        salesUseGoogleSearch: settings.salesUseGoogleSearch,
        dailyFreeChatLimit: settings.dailyFreeChatLimit,
        dailyPaidChatLimit: settings.dailyPaidChatLimit,
        salesPaidKeyEnabled: settings.salesPaidKeyEnabled,
        apiKey: apiKeyDraft.trim() || undefined,
        freeApiKey: freeApiKeyDraft.trim() || undefined,
      });
      setSettings(next);
      setApiKeyDraft("");
      setFreeApiKeyDraft("");
      setSavedMsg("تم الحفظ.");
      setTimeout(() => setSavedMsg(""), 4000);
    } catch (e) {
      setTestResult({
        ok: false,
        message: e instanceof Error ? e.message : "فشل الحفظ",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const selectedModel = settings?.model || GEMINI_DEFAULT_MODEL;
    try {
      if (apiKeyDraft.trim() && settings) {
        const next = await saveGeminiSettings({
          model: selectedModel,
          systemInstructions: settings.systemInstructions,
          writingRules: settings.writingRules,
          salesWhatsApp: settings.salesWhatsApp,
          salesMarkupPercent: settings.salesMarkupPercent,
          salesInstructions: settings.salesInstructions,
          salesWelcomeAr: settings.salesWelcomeAr,
          salesWelcomeEn: settings.salesWelcomeEn,
          salesBehaviorRules: settings.salesBehaviorRules,
          salesTone: settings.salesTone,
          salesUpsellNotes: settings.salesUpsellNotes,
          salesSaveProgramRules: settings.salesSaveProgramRules,
          salesPreferLiteModel: settings.salesPreferLiteModel,
          salesUseGoogleSearch: settings.salesUseGoogleSearch,
          dailyFreeChatLimit: settings.dailyFreeChatLimit,
          dailyPaidChatLimit: settings.dailyPaidChatLimit,
          salesPaidKeyEnabled: settings.salesPaidKeyEnabled,
          apiKey: apiKeyDraft.trim() || undefined,
          freeApiKey: freeApiKeyDraft.trim() || undefined,
        });
        setSettings(next);
        setApiKeyDraft("");
        setFreeApiKeyDraft("");
      }

      const res = await fetch("/api/gemini/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel }),
      });
      const data = await res.json();
      setTestResult({
        ok: Boolean(data.ok),
        message: data.ok
          ? data.message || "الاتصال ناجح"
          : data.error || "فشل الاتصال",
      });
    } catch (e) {
      setTestResult({
        ok: false,
        message: e instanceof Error ? e.message : "خطأ شبكة",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !settings) {
    return (
      <AdminPage className="flex flex-col gap-6">
        <AdminPageHeader
          breadcrumb={<span>لوحة التحكم <span className="mx-1 opacity-50">/</span> الذكاء الاصطناعي</span>}
          icon={<Sparkles size={20} />}
          title="إعدادات الذكاء الاصطناعي"
          description="المفاتيح والتعليمات تُحفظ بأمان. المستشار يستخدم الحد المجاني أولاً."
        />
        <Skeleton className="h-64 rounded-xl" />
      </AdminPage>
    );
  }

  const renderSection = (current: AiSection) => {
    switch (current) {
      case "keys":
        return (
          <AdminSettingsGrid>
            <AdminSettingsPanel
              span={7}
              title="الحد المجاني والمفتاح المدفوع"
              description="استخدم مفتاحاً من مشروع بدون فوترة للحد المجاني. المفتاح المدفوع يبقى متوقفاً حتى تشغّله بنفسك."
            >
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>مفتاح الحد المجاني</label>
                  <div className="relative">
                    <input
                      type={showFreeKey ? "text" : "password"}
                      value={freeApiKeyDraft}
                      onChange={(e) => setFreeApiKeyDraft(e.target.value)}
                      placeholder={
                        settings.hasFreeApiKey
                          ? "مفتاح مجاني محفوظ — اتركه فارغاً للإبقاء عليه"
                          : "الصق مفتاح المشروع بدون فوترة"
                      }
                      className={`${inputClass} pe-12`}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFreeKey((v) => !v)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showFreeKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    اليوم: مجاني {settings.usageToday.freeCount}/
                    {settings.dailyFreeChatLimit}
                    {settings.salesPaidKeyEnabled
                      ? ` · مدفوع ${settings.usageToday.paidCount}/${settings.dailyPaidChatLimit}`
                      : " · المفتاح المدفوع متوقف"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <AdminSwitch
                    label="المفتاح المدفوع"
                    description={
                      settings.salesPaidKeyEnabled
                        ? "يعمل بعد نفاد الحد المجاني"
                        : "متوقف — لن يُخصم شيء من الفاتورة"
                    }
                    checked={settings.salesPaidKeyEnabled}
                    onChange={(next) =>
                      setSettings((s) =>
                        s ? { ...s, salesPaidKeyEnabled: next } : s
                      )
                    }
                  />
                  <div className="mt-3">
                    <label className={labelClass}>مفتاح الفوترة (اختياري)</label>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKeyDraft}
                        onChange={(e) => setApiKeyDraft(e.target.value)}
                        placeholder={
                          settings.hasApiKey
                            ? "مفتاح مدفوع محفوظ — اتركه فارغاً للإبقاء عليه"
                            : "الصق المفتاح المدفوع إن رغبت"
                        }
                        className={`${inputClass} pe-12`}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((v) => !v)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </AdminSettingsPanel>

            <AdminSettingsPanel
              span={5}
              title="السقوف اليومية"
              description="حدود الحماية لكل مفتاح."
            >
              <AdminFieldGrid>
                <div>
                  <label className={labelClass}>سقف مجاني / يوم</label>
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    value={settings.dailyFreeChatLimit}
                    onChange={(e) =>
                      setSettings((s) =>
                        s
                          ? {
                              ...s,
                              dailyFreeChatLimit: Number(e.target.value) || 0,
                            }
                          : s
                      )
                    }
                    className={inputClass}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className={labelClass}>سقف مدفوع / يوم (حماية)</label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={settings.dailyPaidChatLimit}
                    onChange={(e) =>
                      setSettings((s) =>
                        s
                          ? {
                              ...s,
                              dailyPaidChatLimit: Number(e.target.value) || 0,
                            }
                          : s
                      )
                    }
                    className={inputClass}
                    dir="ltr"
                  />
                </div>
              </AdminFieldGrid>
              <div className="mt-4 space-y-3">
                <label className="flex items-start gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="mt-1 shrink-0"
                    checked={settings.salesPreferLiteModel}
                    onChange={(e) =>
                      setSettings((s) =>
                        s
                          ? { ...s, salesPreferLiteModel: e.target.checked }
                          : s
                      )
                    }
                  />
                  <span>استخدم فلاش لايت للمستشار (أوفر بكثير من 3.6)</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="mt-1 shrink-0"
                    checked={settings.salesUseGoogleSearch}
                    onChange={(e) =>
                      setSettings((s) =>
                        s
                          ? { ...s, salesUseGoogleSearch: e.target.checked }
                          : s
                      )
                    }
                  />
                  <span>بحث جوجل داخل كل رد (مكلف جداً — اتركه مغلقاً)</span>
                </label>
              </div>
            </AdminSettingsPanel>
          </AdminSettingsGrid>
        );
      case "model":
        return (
          <AdminSettingsGrid>
            <AdminSettingsPanel span={7} title="النموذج / Model">
              <label className={labelClass}>النموذج / Model</label>
              <select
                value={
                  GEMINI_MODEL_OPTIONS.some((m) => m.id === settings.model)
                    ? settings.model
                    : GEMINI_DEFAULT_MODEL
                }
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, model: e.target.value } : s))
                }
                className={`${inputClass} cursor-pointer appearance-none`}
              >
                {GEMINI_MODEL_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.labelAr} / {m.labelEn}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                المستشار يستخدم فلاش لايت تلقائياً عندما يكون خيار التوفير مفعّلاً.
              </p>
            </AdminSettingsPanel>
            <AdminSettingsPanel
              span={5}
              title="توفير التكلفة"
              description="خيارات تؤثر على النموذج أثناء المحادثة."
            >
              <label className="flex items-start gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="mt-1 shrink-0"
                  checked={settings.salesPreferLiteModel}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, salesPreferLiteModel: e.target.checked } : s
                    )
                  }
                />
                <span>استخدم فلاش لايت للمستشار (أوفر بكثير من 3.6)</span>
              </label>
            </AdminSettingsPanel>
          </AdminSettingsGrid>
        );
      case "prompts":
        return (
          <AdminSettingsGrid>
            <AdminSettingsPanel span={7} title="تعليمات النظام">
              <textarea
                value={settings.systemInstructions}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, systemInstructions: e.target.value } : s
                  )
                }
                rows={16}
                className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
                dir="auto"
              />
            </AdminSettingsPanel>
            <AdminSettingsPanel span={5} title="قواعد الكتابة">
              <textarea
                value={settings.writingRules}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, writingRules: e.target.value } : s
                  )
                }
                rows={16}
                className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
                dir="auto"
              />
            </AdminSettingsPanel>
          </AdminSettingsGrid>
        );
      case "sales":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              إدارة البرامج المحفوظة للزوار:{" "}
              <a
                href="/admin/ai-programs"
                className="text-emerald-600 underline underline-offset-2 dark:text-emerald-300"
              >
                برامج المساعد الذكي
              </a>
            </p>
            <AdminSettingsGrid>
              <AdminSettingsPanel span={6} title="واتساب وهامش الربح">
                <AdminFieldGrid>
                  <div>
                    <label className={labelClass}>واتساب المبيعات</label>
                    <input
                      type="text"
                      value={settings.salesWhatsApp}
                      onChange={(e) =>
                        setSettings((s) =>
                          s ? { ...s, salesWhatsApp: e.target.value } : s
                        )
                      }
                      placeholder="905321796763"
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>هامش الربح %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={settings.salesMarkupPercent}
                      onChange={(e) =>
                        setSettings((s) =>
                          s
                            ? {
                                ...s,
                                salesMarkupPercent: Number(e.target.value) || 0,
                              }
                            : s
                        )
                      }
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>
                </AdminFieldGrid>
              </AdminSettingsPanel>
              <AdminSettingsPanel span={6} title="النبرة / Tone">
                <textarea
                  value={settings.salesTone}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, salesTone: e.target.value } : s
                    )
                  }
                  rows={4}
                  className={`${inputClass} resize-y`}
                  dir="auto"
                />
              </AdminSettingsPanel>
              <AdminSettingsPanel span={6} title="رسالة الترحيب (عربي)">
                <textarea
                  value={settings.salesWelcomeAr}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, salesWelcomeAr: e.target.value } : s
                    )
                  }
                  rows={4}
                  className={`${inputClass} resize-y`}
                  dir="rtl"
                />
              </AdminSettingsPanel>
              <AdminSettingsPanel span={6} title="Welcome message (English)">
                <textarea
                  value={settings.salesWelcomeEn}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, salesWelcomeEn: e.target.value } : s
                    )
                  }
                  rows={4}
                  className={`${inputClass} resize-y`}
                  dir="ltr"
                />
              </AdminSettingsPanel>
              <AdminSettingsPanel span={12} title="تعليمات مستشار المبيعات">
                <textarea
                  value={settings.salesInstructions}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, salesInstructions: e.target.value } : s
                    )
                  }
                  rows={8}
                  className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
                  dir="auto"
                />
              </AdminSettingsPanel>
              <AdminSettingsPanel
                span={12}
                title="قواعد السلوك (تُحقَن في كل طلب)"
              >
                <textarea
                  value={settings.salesBehaviorRules}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, salesBehaviorRules: e.target.value } : s
                    )
                  }
                  rows={10}
                  className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
                  dir="auto"
                />
              </AdminSettingsPanel>
              <AdminSettingsPanel
                span={6}
                title="اقتراح جولات VIP والبرامج السياحية"
              >
                <textarea
                  value={settings.salesUpsellNotes}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, salesUpsellNotes: e.target.value } : s
                    )
                  }
                  rows={5}
                  className={`${inputClass} resize-y`}
                  dir="auto"
                />
              </AdminSettingsPanel>
              <AdminSettingsPanel span={6} title="متى يُحفظ البرنامج">
                <textarea
                  value={settings.salesSaveProgramRules}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, salesSaveProgramRules: e.target.value } : s
                    )
                  }
                  rows={5}
                  className={`${inputClass} resize-y`}
                  dir="auto"
                />
              </AdminSettingsPanel>
            </AdminSettingsGrid>
          </div>
        );
      default: {
        const _never: never = current;
        return _never;
      }
    }
  };

  return (
    <AdminPage className="flex flex-col gap-6">
      <AdminPageHeader
        breadcrumb={<span>لوحة التحكم <span className="mx-1 opacity-50">/</span> الذكاء الاصطناعي</span>}
        icon={<Sparkles size={20} />}
        title="إعدادات الذكاء الاصطناعي"
        description="المفاتيح والتعليمات تُحفظ بأمان. المستشار يستخدم الحد المجاني أولاً."
        actions={
          <>
            <Button type="button" variant="outline" onClick={handleTest} disabled={testing || (!settings.hasApiKey && !apiKeyDraft.trim())}>
              {testing ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />}
              اختبار الاتصال
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              حفظ على الخادم
            </Button>
          </>
        }
      />

      <Tabs value={section} onValueChange={(id) => setSection(id as AiSection)} className="flex flex-col">
        <TabsList className="h-8 w-full shrink-0 justify-start overflow-x-auto">
          {SECTIONS.map((item) => (
            <TabsTrigger key={item.id} value={item.id} className="gap-1.5">
              {item.icon}
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={section} className="mt-4">
          {renderSection(section)}
        </TabsContent>
      </Tabs>

      {testResult ? (
        <Alert variant={testResult.ok ? "default" : "destructive"}>
          {testResult.ok ? <CheckCircle2 /> : <XCircle />}
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      ) : null}

      <AdminStickySave>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          حفظ على الخادم
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleTest}
          disabled={testing || (!settings.hasApiKey && !apiKeyDraft.trim())}
        >
          {testing ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />}
          اختبار الاتصال
        </Button>
        {savedMsg ? (
          <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} />
            {savedMsg}
          </p>
        ) : null}
      </AdminStickySave>
    </AdminPage>
  );
}
