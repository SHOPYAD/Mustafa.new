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

  const load = useCallback(async () => {
    setError("");
    try {
      const [jobsRes, logsRes, settingsRes, mcpRes] = await Promise.all([
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

  const runJob = async (id: string, dryRun: boolean) => {
    setSaving(true);
    try {
      await jsonFetch(`/api/admin/automation/jobs/${encodeURIComponent(id)}/run`, {
        method: "POST",
        body: JSON.stringify({ dryRun }),
      });
      await load();
    } finally {
      setSaving(false);
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
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                حفظ الوظيفة
              </button>
            </AdminSettingsPanel>

            <AdminSettingsPanel className="xl:col-span-7" title="الوظائف المحفوظة">
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا وظائف بعد. صف المهمة في Copilot (وضع أتمتة) أو أنشئها هنا.</p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="rounded-xl border border-border p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{job.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {job.type && isAutomationJobType(job.type) ? catalogEntry(job.type).titleAr : job.type} · {job.cron} · {job.timezone}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {job.maxPerRun}/تشغيل · {job.maxPerDay}/يوم · {(job.locales || []).join(",")}
                            {job.dryRun ? " · dry-run" : ""}
                            {job.lastError ? ` · خطأ: ${job.lastError}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <button type="button" className="rounded-lg border px-2 py-1 text-[11px]" onClick={() => void toggleJob(job)}>
                            {job.enabled ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                          <button type="button" className="rounded-lg border px-2 py-1 text-[11px]" onClick={() => void runJob(job.id, true)}>
                            تجربة
                          </button>
                          <button type="button" className="rounded-lg border px-2 py-1 text-[11px]" onClick={() => void runJob(job.id, false)}>
                            تشغيل الآن
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border px-2 py-1 text-[11px]"
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
                          <button type="button" className="rounded-lg border px-2 py-1 text-[11px] text-rose-400" onClick={() => void removeJob(job.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminSettingsPanel>
          </AdminSettingsGrid>
          </>
        ) : null}

        {tab === "connections" ? (
          <AdminSettingsPanel title="حسابات النشر والإعلانات">
            <p className="mb-4 text-xs text-muted-foreground">
              الحالة صادقة: لا يظهر «متصل» بلا رمز. الربط عبر OAuth الرسمي. الإعلانات لها وضع تجريبي حتى تُلصق المفاتيح في /admin/ads.
            </p>
            <ConnectionsHub />
          </AdminSettingsPanel>
        ) : null}

        {tab === "logs" ? (
          <AdminSettingsPanel title="سجل النشاط (آخر 400)">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا أحداث بعد.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border px-3 py-2 text-xs">
                    <div className="flex flex-wrap gap-2 text-muted-foreground">
                      <span>{entry.at}</span>
                      <span>{entry.level}</span>
                      <span>{entry.jobType}</span>
                      {entry.dryRun ? <span>dry-run</span> : null}
                    </div>
                    <p className="mt-1">{entry.message}</p>
                  </div>
                ))}
              </div>
            )}
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
                <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  {settings.consentPolicy}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Redis: {redis?.ok ? <CheckCircle2 className="inline text-emerald-500" size={12} /> : "غير متصل"}{" "}
                  {redis ? `${redis.host}:${redis.port}` : ""} · بادئة lonaliza:automation: · لا تلمس lonaliza:hotels:
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  العامل: <code>node scripts/automation-worker.mjs</code> أو{" "}
                  <code>pm2 start ecosystem.config.cjs --only lonaliza-automation</code>. التكة: POST /api/cron/automation
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveSettings()}
                  className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  حفظ الإعدادات
                </button>
              </>
            ) : null}
          </AdminSettingsPanel>
        ) : null}
      </AdminSettingsSections>
    </AdminPage>
  );
}
