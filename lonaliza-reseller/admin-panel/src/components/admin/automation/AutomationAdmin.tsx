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
  MoreHorizontal,
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
  AdminSettingsPanel,
  type AdminSectionItem,
} from "@/components/admin/layout";
import AdminSwitch from "@/components/admin/AdminSwitch";
import AutomationChatPanel from "@/components/admin/automation/AutomationChatPanel";
import CommsSettings from "@/components/admin/automation/CommsSettings";
import ConnectionsHub from "@/components/admin/automation/ConnectionsHub";
import McpCatalogPanel, { type CatalogCard } from "@/components/admin/automation/McpCatalogPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [jobSheetOpen, setJobSheetOpen] = useState(false);
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
      setJobSheetOpen(false);
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
      <AdminPage className="flex flex-col gap-6">
        <AdminPageHeader
          breadcrumb={
            <span>
              لوحة التحكم <span className="mx-1 opacity-50">/</span> الأتمتة
            </span>
          }
          title="الأتمتة"
          description="صفوا الوظيفة بالعربية، اربطوا الحسابات والخوادم الجاهزة، ثم اعتمدوا قبل أي نشر."
          icon={<Bot size={22} />}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        breadcrumb={
          <span>
            لوحة التحكم <span className="mx-1 opacity-50">/</span> الأتمتة
          </span>
        }
        title="الأتمتة"
        description="صفوا الوظيفة بالعربية، اربطوا الحسابات والخوادم الجاهزة، ثم اعتمدوا قبل أي نشر. التوقيت Europe/Istanbul."
        icon={<Bot size={22} />}
        actions={
          <Button variant="outline" type="button" onClick={() => void load()}>
            <RefreshCw size={14} />
            تحديث
          </Button>
        }
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={(id) => setTab(id as TabId)} className="flex flex-col gap-4">
        <TabsList className="h-auto w-fit max-w-full flex-wrap justify-start shrink-0">
          {TABS.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "jobs" ? (
        <>
          <AutomationChatPanel onSaved={() => void load()} />
          <Card>
            <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>الوظائف المحفوظة والنشطة</CardTitle>
                <CardDescription>أنشئوا وظيفة من المحادثة أو النموذج المجمّع. التوقيت Europe/Istanbul.</CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setDraft(EMPTY_DRAFT);
                  setJobSheetOpen(true);
                }}
              >
                <Plus size={14} />
                وظيفة جديدة
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              {jobs.length === 0 ? (
                <Empty className="mx-6 mb-6">
                  <EmptyHeader>
                    <EmptyTitle>لا توجد وظائف أتمتة محفوظة حالياً</EmptyTitle>
                    <EmptyDescription>صفّوا المهمة في المحادثة بالأعلى أو أنشئوا وظيفة يدوية.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الاسم</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>الجدول</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>آخر تشغيل</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => {
                          const isRunning = runningJobId === job.id;
                          return (
                            <TableRow key={job.id} data-running={isRunning ? "true" : undefined}>
                              <TableCell className="font-semibold">{job.name}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">
                                {job.type && isAutomationJobType(job.type) ? catalogEntry(job.type).titleAr : job.type}
                              </TableCell>
                              <TableCell className="font-mono text-xs">{job.cron}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant={job.enabled ? "secondary" : "outline"}>
                                    {job.enabled ? "نشطة" : "متوقفة"}
                                  </Badge>
                                  {job.dryRun ? <Badge variant="outline">تجريبي</Badge> : null}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {job.lastError
                                  ? `خطأ: ${job.lastError}`
                                  : job.lastRunAt
                                    ? new Date(job.lastRunAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
                                    : "بانتظار أول تشغيل"}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button type="button" variant="ghost" size="icon-sm" disabled={isRunning}>
                                      {isRunning ? <Loader2 size={14} className="animate-spin" /> : <MoreHorizontal size={16} />}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem disabled={isRunning} onClick={() => void toggleJob(job)}>
                                      {job.enabled ? "إيقاف مؤقت" : "تفعيل"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={isRunning} onClick={() => void runJob(job.id, false)}>
                                      تشغيل الآن
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={isRunning}
                                      onClick={() => {
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
                                        });
                                        setJobSheetOpen(true);
                                      }}
                                    >
                                      تعديل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      disabled={isRunning}
                                      onClick={() => {
                                        if (confirm(`هل أنت متأكد من حذف الوظيفة «${job.name}» وإيقافها نهائياً؟`)) {
                                          void removeJob(job.id);
                                        }
                                      }}
                                    >
                                      حذف
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="grid gap-3 px-4 pb-4 md:hidden">
                    {jobs.map((job) => {
                      const isRunning = runningJobId === job.id;
                      return (
                        <Card key={job.id}>
                          <CardHeader className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle className="text-sm">{job.name}</CardTitle>
                              <Badge variant={job.enabled ? "secondary" : "outline"}>
                                {job.enabled ? "نشطة" : "متوقفة"}
                              </Badge>
                            </div>
                            <CardDescription>
                              {job.type && isAutomationJobType(job.type) ? catalogEntry(job.type).titleAr : job.type} · {job.cron}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" disabled={isRunning} onClick={() => void toggleJob(job)}>
                              {job.enabled ? <Pause size={14} /> : <Play size={14} />}
                            </Button>
                            <Button type="button" size="sm" disabled={isRunning} onClick={() => void runJob(job.id, false)}>
                              {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                              تشغيل
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isRunning}
                              onClick={() => {
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
                                });
                                setJobSheetOpen(true);
                              }}
                            >
                              تعديل
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={isRunning}
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الوظيفة «${job.name}» وإيقافها نهائياً؟`)) {
                                  void removeJob(job.id);
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Sheet open={jobSheetOpen} onOpenChange={setJobSheetOpen}>
            <SheetContent side="left" className="sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{draft.id ? "تعديل الوظيفة" : "وظيفة أتمتة جديدة"}</SheetTitle>
                <SheetDescription>الحقول مجمّعة حسب الهوية والجدول والحدود والرسائل — نفس الحفظ السابق.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 px-4 pb-4">
                <details open className="rounded-lg border bg-card p-3">
                  <summary className="cursor-pointer text-sm font-semibold">الهوية</summary>
                  <div className="mt-3 grid gap-3">
                    <div>
                      <label className={labelClass}>الاسم</label>
                      <Input
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
                    <p className="text-xs text-muted-foreground">{catalogHint.descriptionAr}</p>
                    <AdminSwitch
                      label="مفعّلة"
                      checked={draft.enabled}
                      onChange={(enabled) => setDraft((d) => ({ ...d, enabled }))}
                    />
                  </div>
                </details>
                <details className="rounded-lg border bg-card p-3">
                  <summary className="cursor-pointer text-sm font-semibold">الجدول الزمني</summary>
                  <div className="mt-3 grid gap-3">
                    <div>
                      <label className={labelClass}>Cron</label>
                      <Input
                        value={draft.cron}
                        onChange={(e) => setDraft((d) => ({ ...d, cron: e.target.value }))}
                        placeholder="0 9 * * *"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>المنطقة الزمنية</label>
                      <Input
                        value={draft.timezone}
                        onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
                      />
                    </div>
                  </div>
                </details>
                <details className="rounded-lg border bg-card p-3">
                  <summary className="cursor-pointer text-sm font-semibold">الحدود واللغات</summary>
                  <div className="mt-3 grid gap-3">
                    <div>
                      <label className={labelClass}>الحد لكل تشغيل</label>
                      <Input
                        type="number"
                        min={1}
                        value={draft.maxPerRun}
                        onChange={(e) => setDraft((d) => ({ ...d, maxPerRun: Number(e.target.value) || 1 }))}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>الحد اليومي</label>
                      <Input
                        type="number"
                        min={1}
                        value={draft.maxPerDay}
                        onChange={(e) => setDraft((d) => ({ ...d, maxPerDay: Number(e.target.value) || 1 }))}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                  </div>
                </details>
                <details className="rounded-lg border bg-card p-3">
                  <summary className="cursor-pointer text-sm font-semibold">الرسائل والتجربة</summary>
                  <div className="mt-3 grid gap-3">
                    {messaging ? (
                      <div>
                        <label className={labelClass}>مصدر الموافقة (إلزامي للرسائل)</label>
                        <Input
                          value={draft.consentSource}
                          onChange={(e) => setDraft((d) => ({ ...d, consentSource: e.target.value }))}
                          placeholder="crm_opt_in"
                        />
                        <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                          جهات CRM / موافقة فقط. ممنوع الإيميلات المسحوبة.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">هذا النوع لا يرسل رسائل — لا حاجة لمصدر موافقة.</p>
                    )}
                    <AdminSwitch
                      label="تجربة بدون أثر (dry-run)"
                      checked={draft.dryRun}
                      onChange={(dryRun) => setDraft((d) => ({ ...d, dryRun }))}
                    />
                  </div>
                </details>
              </div>
              <SheetFooter>
                <Button type="button" variant="outline" onClick={() => setJobSheetOpen(false)}>
                  إلغاء
                </Button>
                <Button type="button" disabled={saving || !draft.name.trim()} onClick={() => void saveJob()}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  حفظ الوظيفة
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </>
      ) : null}

        {tab === "connections" ? (
          <AdminSettingsPanel title="حسابات النشر والإعلانات">
            <ConnectionsHub />
          </AdminSettingsPanel>
        ) : null}

        {tab === "logs" ? (
          <Card>
            <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>سجل نشاط الأتمتة وتتبع الوكلاء</CardTitle>
                <CardDescription>تصفية حسب المستوى دون تغيير مصدر السجل.</CardDescription>
              </div>
              <Button type="button" variant="destructive" size="sm" onClick={() => void clearLogs()}>
                <Trash2 size={13} />
                تنظيف ومسح السجل
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "الكل" },
                  { id: "info", label: "معلومات" },
                  { id: "warn", label: "تحذيرات" },
                  { id: "error", label: "أخطاء" },
                ].map((f) => (
                  <Button
                    key={f.id}
                    type="button"
                    size="sm"
                    variant={logFilter === f.id ? "default" : "outline"}
                    onClick={() => setLogFilter(f.id)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
              {(() => {
                const filtered = logs.filter((entry) => (logFilter === "all" ? true : entry.level === logFilter));
                if (filtered.length === 0) {
                  return (
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>لا توجد أحداث</EmptyTitle>
                        <EmptyDescription>لا توجد أحداث مسجلة في هذا التصنيف.</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  );
                }
                return (
                  <div className="max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المستوى</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>الرسالة</TableHead>
                          <TableHead>الوقت</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <Badge
                                variant={
                                  entry.level === "error"
                                    ? "destructive"
                                    : entry.level === "warn"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {entry.level}
                              </Badge>
                              {entry.dryRun ? (
                                <span className="ms-2 text-[10px] font-semibold text-amber-600">[dry-run]</span>
                              ) : null}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{entry.jobType}</TableCell>
                            <TableCell className="whitespace-pre-wrap text-xs">{entry.message}</TableCell>
                            <TableCell className="font-mono text-[10px] text-muted-foreground">
                              {entry.at ? new Date(entry.at).toLocaleString("ar-SA") : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>نفس الحقول والمفاتيح — مجمّعة حسب الغرض.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {settings ? (
              <>
                <details open className="rounded-lg border bg-muted/30 p-3">
                  <summary className="cursor-pointer text-sm font-semibold">Google Places</summary>
                  <div className="mt-3 space-y-2">
                    <label className={labelClass}>مفتاح Google Places (تقييمات النشاط — نص فقط)</label>
                    <input
                      className={inputClass}
                      type="password"
                      autoComplete="off"
                      placeholder={placesConfigured ? "محفوظ — الصقوا مفتاحاً جديداً للاستبدال" : "GOOGLE_PLACES_API_KEY"}
                      value={placesKey}
                      onChange={(e) => setPlacesKey(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      نجلب اسم النشاط ونص التقييم فقط. لا نكشط هواتف أو إيميلات شخصية من الخرائط أو التعليقات.
                      الحالة: {placesConfigured ? "مفتاح محفوظ" : "غير مُعدّ"}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      disabled={saving || !placesKey.trim()}
                      onClick={() => void savePlacesKey()}
                    >
                      حفظ مفتاح Places
                    </Button>
                  </div>
                </details>
                <details open className="rounded-lg border bg-muted/30 p-3">
                  <summary className="cursor-pointer text-sm font-semibold">الجدول والنافذة</summary>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  </div>
                </details>
                <details open className="rounded-lg border bg-muted/30 p-3">
                  <summary className="cursor-pointer text-sm font-semibold">الحدود</summary>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  </div>
                </details>
                <details open className="rounded-lg border bg-muted/30 p-3">
                  <summary className="cursor-pointer text-sm font-semibold">المحرك</summary>
                  <div className="mt-3 space-y-3">
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
                <div className="rounded-lg border bg-muted/40 p-4 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-foreground">حالة محرك الأتمتة:</span>
                    <Badge variant={redis?.ok ? "secondary" : "outline"}>
                      {redis?.ok ? <CheckCircle2 size={13} /> : null}
                      {redis?.ok ? "محرك الأتمتة متصل ونشط" : "في وضع الاستعداد"}
                    </Badge>
                  </div>
                </div>
                  </div>
                </details>
                <Button type="button" disabled={saving} onClick={() => void saveSettings()}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  حفظ الإعدادات
                </Button>
              </>
            ) : null}
            </CardContent>
          </Card>
        ) : null}
    </AdminPage>
  );
}
