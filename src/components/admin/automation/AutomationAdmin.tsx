"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { catalogEntry } from "@/lib/automation/catalog";
import {
  AUTOMATION_JOB_TYPES,
  AUTOMATION_LOCALES,
  AUTOMATION_TIMEZONE,
  isAutomationJobType,
  isMessagingJobType,
  type AutomationJob,
  type AutomationJobType,
  type AutomationLocale,
  type AutomationLogEntry,
  type AutomationSettings,
} from "@/lib/automation/types";
import type { McpServerPublic, McpToolInfo } from "@/lib/server/mcp/types";
import {
  AdminPage,
  AdminPageHeader,
  AdminSettingsGrid,
  AdminFieldGrid,
  AdminSettingsSections,
  AdminSettingsPanel,
  type AdminSectionItem,
} from "@/components/admin/layout";
import AdminSwitch from "@/components/admin/AdminSwitch";
import AutomationChatPanel from "@/components/admin/automation/AutomationChatPanel";
import CommsSettings from "@/components/admin/automation/CommsSettings";
import ConnectionsHub from "@/components/admin/automation/ConnectionsHub";
import McpCatalogPanel, { type CatalogCard } from "@/components/admin/automation/McpCatalogPanel";

type TabId = "jobs" | "connections" | "logs" | "mcp" | "comms" | "settings";

const TABS: AdminSectionItem[] = [
  { id: "jobs", label: "الوظائف" },
  { id: "connections", label: "الحسابات والإعلانات" },
  { id: "mcp", label: "MCP" },
  { id: "comms", label: "واتساب / تيليجرام" },
  { id: "logs", label: "السجل" },
  { id: "settings", label: "الإعدادات العامة" },
];

const inputClass =
  "w-full min-w-0 px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm";
const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  return (await res.json()) as T;
}

type JobDraft = {
  id?: string;
  name: string;
  type: AutomationJobType;
  cron: string;
  timezone: string;
  maxPerRun: number;
  maxPerDay: number;
  locales: AutomationLocale[];
  enabled: boolean;
  dryRun: boolean;
  consentSource: string;
};

const EMPTY_DRAFT: JobDraft = {
  name: "",
  type: "articles.research_and_publish",
  cron: "0 9 * * *",
  timezone: AUTOMATION_TIMEZONE,
  maxPerRun: 3,
  maxPerDay: 10,
  locales: ["ar", "tr", "en"],
  enabled: true,
  dryRun: true,
  consentSource: "",
};

export default function AutomationAdmin() {
  const [tab, setTab] = useState<TabId>("jobs");
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [logs, setLogs] = useState<AutomationLogEntry[]>([]);
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [redis, setRedis] = useState<{ ok: boolean; host: string; port: number } | null>(null);
  const [servers, setServers] = useState<McpServerPublic[]>([]);
  const [mcpTools, setMcpTools] = useState<Array<McpToolInfo & { serverId: string; serverName: string }>>([]);
  const [mcpCatalog, setMcpCatalog] = useState<CatalogCard[]>([]);
  const [whatsappReady, setWhatsappReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<JobDraft>(EMPTY_DRAFT);
  const [placesKey, setPlacesKey] = useState("");
  const [placesConfigured, setPlacesConfigured] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [jobsRes, logsRes, settingsRes, mcpRes, envRes] = await Promise.all([
        jsonFetch<{ ok?: boolean; jobs?: AutomationJob[]; error?: string }>("/api/admin/automation/jobs"),
        jsonFetch<{ logs?: AutomationLogEntry[] }>("/api/admin/automation/logs"),
        jsonFetch<{ settings?: AutomationSettings; redis?: { ok: boolean; host: string; port: number } }>(
          "/api/admin/automation/settings"
        ),
        jsonFetch<{
          servers?: McpServerPublic[];
          tools?: Array<McpToolInfo & { serverId: string; serverName: string }>;
          catalog?: CatalogCard[];
          hints?: { whatsappReady?: boolean };
        }>("/api/admin/mcp"),
        jsonFetch<{
          keys?: Record<string, { configured?: boolean; masked?: string }>;
        }>("/api/admin/env"),
      ]);
      if (jobsRes.ok === false) throw new Error(jobsRes.error || "فشل التحميل");
      setJobs(jobsRes.jobs || []);
      setLogs(logsRes.logs || []);
      setSettings(settingsRes.settings || null);
      setRedis(settingsRes.redis || null);
      setServers(mcpRes.servers || []);
      setMcpTools(mcpRes.tools || []);
      setMcpCatalog(mcpRes.catalog || []);
      setWhatsappReady(Boolean(mcpRes.hints?.whatsappReady));
      const places = envRes.keys?.GOOGLE_PLACES_API_KEY;
      setPlacesConfigured(Boolean(places?.configured));
      setPlacesKey("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التحميل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveJob = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await jsonFetch<{ ok?: boolean; error?: string }>("/api/admin/automation/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          consentSource: draft.consentSource || undefined,
        }),
      });
      if (!data.ok) throw new Error(data.error || "فشل الحفظ");
      setDraft(EMPTY_DRAFT);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<string>("all");

  const runJob = async (id: string, dryRun: boolean) => {
    setRunningJobId(id);
    setSaving(true);
    try {
      await jsonFetch(`/api/admin/automation/jobs/${encodeURIComponent(id)}/run`, {
        method: "POST",
        body: JSON.stringify({ dryRun }),
      });
      await load();
    } finally {
      setSaving(false);
      setRunningJobId(null);
    }
  };

  const toggleJob = async (job: AutomationJob) => {
    await jsonFetch(`/api/admin/automation/jobs/${encodeURIComponent(job.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: !job.enabled }),
    });
    await load();
  };

  const removeJob = async (id: string) => {
    await jsonFetch(`/api/admin/automation/jobs/${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  };

  const clearLogs = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في مسح وتنظيف كل سجلات النشاط؟")) return;
    setSaving(true);
    try {
      await jsonFetch("/api/admin/automation/logs", { method: "DELETE" });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const data = await jsonFetch<{ ok?: boolean; error?: string }>("/api/admin/automation/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      if (!data.ok) throw new Error(data.error || "فشل الحفظ");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const savePlacesKey = async () => {
    if (!placesKey.trim()) return;
    setSaving(true);
    setError("");
    try {
      const data = await jsonFetch<{ ok?: boolean; error?: string }>("/api/admin/env", {
        method: "PUT",
        body: JSON.stringify({ values: { GOOGLE_PLACES_API_KEY: placesKey.trim() } }),
      });
      if (!data.ok) throw new Error(data.error || "فشل حفظ مفتاح Places");
      setPlacesKey("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل حفظ المفتاح");
    } finally {
      setSaving(false);
    }
  };

  const messaging = isMessagingJobType(draft.type);
  const catalogHint = useMemo(() => catalogEntry(draft.type), [draft.type]);

  if (loading) {
    return (
      <AdminPage>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          جاري التحميل…
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="الأتمتة"
        description="صفوا الوظيفة بالعربية، اربطوا الحسابات والخوادم الجاهزة، ثم اعتمدوا قبل أي نشر. التوقيت Europe/Istanbul."
        icon={<Bot size={22} />}
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
          >
            <RefreshCw size={14} />
            تحديث
          </button>
        }
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <AdminSettingsSections items={TABS} activeId={tab} onChange={(id) => setTab(id as TabId)}>
        {tab === "jobs" ? (
          <>
          <AutomationChatPanel onSaved={() => void load()} />
          <AdminSettingsGrid>
            <AdminSettingsPanel className="xl:col-span-5" title="إعداد متقدم / يدوي">
              <AdminFieldGrid>
                <div>
                  <label className={labelClass}>الاسم</label>
                  <input
                    className={inputClass}
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="مقالات يومية"
                  />
                </div>
                <div>
                  <label className={labelClass}>النوع</label>
                  <select
                    className={inputClass}
                    value={draft.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      if (isAutomationJobType(type)) setDraft((d) => ({ ...d, type }));
                    }}
                  >
                    {AUTOMATION_JOB_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {catalogEntry(type).titleAr} — {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cron</label>
                  <input
                    className={inputClass}
                    value={draft.cron}
                    onChange={(e) => setDraft((d) => ({ ...d, cron: e.target.value }))}
                    placeholder="0 9 * * *"
                  />
                </div>
                <div>
                  <label className={labelClass}>المنطقة الزمنية</label>
                  <input
                    className={inputClass}
                    value={draft.timezone}
                    onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>الحد لكل تشغيل</label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={draft.maxPerRun}
                    onChange={(e) => setDraft((d) => ({ ...d, maxPerRun: Number(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>الحد اليومي</label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={draft.maxPerDay}
                    onChange={(e) => setDraft((d) => ({ ...d, maxPerDay: Number(e.target.value) || 1 }))}
                  />
                </div>
              </AdminFieldGrid>
              <p className="mt-3 text-xs text-muted-foreground">{catalogHint.descriptionAr}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {AUTOMATION_LOCALES.map((loc) => (
                  <label key={loc} className="inline-flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={draft.locales.includes(loc)}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          locales: e.target.checked
                            ? [...d.locales, loc]
                            : d.locales.filter((item) => item !== loc),
                        }))
                      }
                    />
                    {loc}
                  </label>
                ))}
              </div>
              {messaging ? (
                <div className="mt-3">
                  <label className={labelClass}>مصدر الموافقة (إلزامي للرسائل)</label>
                  <input
                    className={inputClass}
                    value={draft.consentSource}
                    onChange={(e) => setDraft((d) => ({ ...d, consentSource: e.target.value }))}
                    placeholder="crm_opt_in"
                  />
                  <p className="mt-1 text-[11px] text-amber-600">
                    جهات CRM / موافقة فقط. ممنوع الإيميلات المسحوبة.
                  </p>
                </div>
              ) : null}
              <AdminSwitch
                label="مفعّلة"
                checked={draft.enabled}
                onChange={(enabled) => setDraft((d) => ({ ...d, enabled }))}
              />
              <AdminSwitch
                label="تجربة بدون أثر (dry-run)"
                checked={draft.dryRun}
                onChange={(dryRun) => setDraft((d) => ({ ...d, dryRun }))}
              />
              <button
                type="button"
                disabled={saving || !draft.name.trim()}
                onClick={() => void saveJob()}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] px-4 py-2.5 text-xs font-bold text-amber-300 hover:text-amber-200 disabled:opacity-40 transition-colors shadow-sm"
              >
                {saving ? <Loader2 size={14} className="animate-spin text-amber-300" /> : <Plus size={14} className="text-amber-400" />}
                حفظ الوظيفة
              </button>
            </AdminSettingsPanel>

            <AdminSettingsPanel className="xl:col-span-7" title="الوظائف المحفوظة والنشطة">
              {jobs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
                  لا توجد وظائف أتمتة محفوظة حالياً. صف المهمة في المحادثة بالأعلى أو أنشئ وظيفة يدوية.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {jobs.map((job) => {
                    const isRunning = runningJobId === job.id;
                    return (
                      <div
                        key={job.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          isRunning
                            ? "border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 ring-1 ring-purple-500"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">{job.name}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  job.enabled
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-border"
                                }`}
                              >
                                {job.enabled ? "نشطة ومجدولة" : "متوقفة مؤقتاً"}
                              </span>
                              {job.dryRun ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  تجريبي (Dry Run)
                                </span>
                              ) : null}
                            </div>

                            <p className="text-xs text-muted-foreground">
                              {job.type && isAutomationJobType(job.type) ? catalogEntry(job.type).titleAr : job.type} · الجدول: {job.cron} (توقيت إسطنبول)
                            </p>

                            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground pt-1">
                              <span>الحد: {job.maxPerRun}/تشغيل ({job.maxPerDay}/يوم)</span>
                              <span>· اللغات: {(job.locales || []).join(", ")}</span>
                              {job.lastRunAt ? (
                                <span className="text-purple-600 dark:text-purple-400 font-medium">
                                  · آخر تشغيل: {new Date(job.lastRunAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              ) : (
                                <span>· بانتظار أول تشغيل</span>
                              )}
                              {job.lastError ? (
                                <span className="text-rose-500">· خطأ: {job.lastError}</span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isRunning}
                              className="rounded-xl border border-border bg-background hover:bg-muted p-2 text-xs transition-colors"
                              onClick={() => void toggleJob(job)}
                              title={job.enabled ? "إيقاف مؤقت" : "تفعيل"}
                            >
                              {job.enabled ? <Pause size={14} /> : <Play size={14} className="text-emerald-500" />}
                            </button>

                            <button
                              type="button"
                              disabled={isRunning}
                              className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                              onClick={() => void runJob(job.id, false)}
                            >
                              {isRunning ? (
                                <>
                                  <Loader2 size={13} className="animate-spin text-purple-600" />
                                  <span>جاري التنفيذ…</span>
                                </>
                              ) : (
                                <>
                                  <Play size={13} />
                                  <span>تشغيل الآن</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isRunning}
                              className="rounded-xl border border-border bg-background hover:bg-muted px-2.5 py-1.5 text-xs transition-colors"
                              onClick={() =>
                                setDraft({
                                  id: job.id,
                                  name: job.name || "",
                                  type: job.type && isAutomationJobType(job.type) ? job.type : "articles.research_and_publish",
                                  cron: job.cron || "0 9 * * *",
                                  timezone: job.timezone || AUTOMATION_TIMEZONE,
                                  maxPerRun: job.maxPerRun || 3,
                                  maxPerDay: job.maxPerDay || 10,
                                  locales: job.locales || ["ar", "tr", "en"],
                                  enabled: job.enabled !== false,
                                  dryRun: job.dryRun !== false,
                                  consentSource: job.consentSource || "",
                                })
                              }
                            >
                              تعديل
                            </button>

                            <button
                              type="button"
                              disabled={isRunning}
                              className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 p-2 text-xs transition-colors"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الوظيفة «${job.name}» وإيقافها نهائياً؟`)) {
                                  void removeJob(job.id);
                                }
                              }}
                              title="حذف الوظيفة وإيقافها نهائياً"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AdminSettingsPanel>
          </AdminSettingsGrid>
          </>
        ) : null}

        {tab === "connections" ? (
          <AdminSettingsPanel title="حسابات النشر والإعلانات">
            <ConnectionsHub />
          </AdminSettingsPanel>
        ) : null}

        {tab === "logs" ? (
          <AdminSettingsPanel title="سجل نشاط الأتمتة وتتبع الوكلاء">
            {/* Filter Tabs & Clear Action */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "الكل" },
                  { id: "info", label: "معلومات" },
                  { id: "warn", label: "تحذيرات" },
                  { id: "error", label: "أخطاء" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLogFilter(f.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      logFilter === f.id
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void clearLogs()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
              >
                <Trash2 size={13} />
                <span>تنظيف ومسح السجل</span>
              </button>
            </div>

            {(() => {
              const filtered = logs.filter((entry) => (logFilter === "all" ? true : entry.level === logFilter));
              if (filtered.length === 0) {
                return (
                  <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
                    لا توجد أحداث مسجلة في هذا التصنيف. السجل نظيف تماماً!
                  </div>
                );
              }
              return (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pe-1">
                  {filtered.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-xl border p-3 text-xs flex flex-col gap-1.5 shadow-xs ${
                        entry.level === "error"
                          ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200"
                          : entry.level === "warn"
                            ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200"
                            : "border-border bg-card text-foreground"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              entry.level === "error"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                                : entry.level === "warn"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                  : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                            }`}
                          >
                            {entry.level}
                          </span>
                          <span className="font-mono text-[11px]">{entry.jobType}</span>
                          {entry.dryRun ? (
                            <span className="text-[10px] text-amber-600 font-semibold">[dry-run]</span>
                          ) : null}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {entry.at ? new Date(entry.at).toLocaleString("ar-SA") : ""}
                        </span>
                      </div>
                      <p className="leading-relaxed font-medium text-xs whitespace-pre-wrap">{entry.message}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </AdminSettingsPanel>
        ) : null}

        {tab === "mcp" ? (
          <AdminSettingsPanel title="كتالوج موصلات MCP">
            <p className="mb-4 text-xs text-muted-foreground">
              اختاروا من الكتالوج أو أضيفوا خادم MCP. GitHub لاستيراد خادم MCP فقط — ليس لاستنساخ مشاريع.
              النشر الاجتماعي يتم بعد موافقة تيليجرام فقط.
            </p>
            <McpCatalogPanel
              catalog={mcpCatalog}
              servers={servers}
              mcpTools={mcpTools}
              whatsappReady={whatsappReady}
              onReload={load}
            />
          </AdminSettingsPanel>
        ) : null}

        {tab === "comms" ? (
          <AdminSettingsPanel title="رسائل واتساب / تيليجرام وOTP">
            <CommsSettings />
          </AdminSettingsPanel>
        ) : null}

        {tab === "settings" ? (
          <AdminSettingsPanel title="الإعدادات العامة">
            {settings ? (
              <>
                <AdminFieldGrid>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>مفتاح Google Places (تقييمات النشاط — نص فقط)</label>
                    <input
                      className={inputClass}
                      type="password"
                      autoComplete="off"
                      placeholder={placesConfigured ? "محفوظ — الصقوا مفتاحاً جديداً للاستبدال" : "GOOGLE_PLACES_API_KEY"}
                      value={placesKey}
                      onChange={(e) => setPlacesKey(e.target.value)}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      نجلب اسم النشاط ونص التقييم فقط. لا نكشط هواتف أو إيميلات شخصية من الخرائط أو التعليقات.
                      الحالة: {placesConfigured ? "مفتاح محفوظ" : "غير مُعدّ"}
                    </p>
                    <button
                      type="button"
                      disabled={saving || !placesKey.trim()}
                      onClick={() => void savePlacesKey()}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] px-4 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      حفظ مفتاح Places
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>المنطقة الزمنية</label>
                    <input
                      className={inputClass}
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>نافذة النشر من</label>
                    <input
                      className={inputClass}
                      value={settings.publishWindowStart}
                      onChange={(e) => setSettings({ ...settings, publishWindowStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>نافذة النشر إلى</label>
                    <input
                      className={inputClass}
                      value={settings.publishWindowEnd}
                      onChange={(e) => setSettings({ ...settings, publishWindowEnd: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>الحد الافتراضي لكل تشغيل</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={settings.defaultMaxPerRun}
                      onChange={(e) => setSettings({ ...settings, defaultMaxPerRun: Number(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>الحد اليومي الافتراضي</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={settings.defaultMaxPerDay}
                      onChange={(e) => setSettings({ ...settings, defaultMaxPerDay: Number(e.target.value) || 1 })}
                    />
                  </div>
                </AdminFieldGrid>
                <AdminSwitch
                  label="المحرك يعمل"
                  description="إيقاف عام لكل التكات التلقائية"
                  checked={settings.workerEnabled}
                  onChange={(workerEnabled) => setSettings({ ...settings, workerEnabled })}
                />
                <AdminSwitch
                  label="تجربة افتراضية"
                  checked={settings.defaultDryRun}
                  onChange={(defaultDryRun) => setSettings({ ...settings, defaultDryRun })}
                />
                <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">حالة محرك الأتمتة:</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      redis?.ok ? "bg-purple-50 dark:bg-purple-950/60 text-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800" : "bg-muted text-muted-foreground"
                    }`}>
                      {redis?.ok ? <CheckCircle2 size={13} className="text-purple-600 dark:text-amber-400" /> : null}
                      {redis?.ok ? "محرك الأتمتة متصل ونشط" : "في وضع الاستعداد"}
                    </span>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveSettings()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] px-6 py-2.5 text-sm font-extrabold text-amber-300 hover:text-amber-200 disabled:opacity-40 transition-colors shadow-md"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin text-amber-300" /> : null}
                    حفظ الإعدادات
                  </button>
                </div>
              </>
            ) : null}
          </AdminSettingsPanel>
        ) : null}
      </AdminSettingsSections>
    </AdminPage>
  );
}
