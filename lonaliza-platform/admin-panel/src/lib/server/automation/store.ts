import { promises as fs } from "fs";
import path from "path";
import {
  AUTOMATION_LOCALES,
  AUTOMATION_TIMEZONE,
  isAutomationJobType,
  isAutomationLocale,
  isMessagingJobType,
  type AutomationJob,
  type AutomationJobInput,
  type AutomationLocale,
  type AutomationSettings,
} from "@/lib/automation/types";
import { jobsStoreFile, settingsStoreFile } from "./paths";

const CONSENT_POLICY =
  "Jobs that message people require consentSource. Only CRM / opt-in contacts. No scraped emails or phone numbers.";

type JobsFile = {
  version: 1;
  jobs: AutomationJob[];
  updatedAt: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function asLocales(value: unknown, fallback: AutomationLocale[]): AutomationLocale[] {
  if (!Array.isArray(value)) return fallback;
  const next = value.filter(isAutomationLocale);
  return next.length ? [...new Set(next)] : fallback;
}

function emptyJobs(): JobsFile {
  return { version: 1, jobs: [], updatedAt: nowIso() };
}

export function defaultAutomationSettings(): AutomationSettings {
  return {
    timezone: AUTOMATION_TIMEZONE,
    publishWindowStart: "08:00",
    publishWindowEnd: "22:00",
    defaultMaxPerRun: 3,
    defaultMaxPerDay: 10,
    defaultDryRun: true,
    workerEnabled: true,
    consentPolicy: CONSENT_POLICY,
    updatedAt: nowIso(),
  };
}

async function ensureParent(file: string): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeJob(raw: unknown): AutomationJob | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  if (typeof rec.id !== "string" || typeof rec.name !== "string" || !isAutomationJobType(rec.type)) {
    return null;
  }
  const locales = asLocales(rec.locales, [...AUTOMATION_LOCALES]);
  return {
    id: rec.id,
    name: rec.name,
    type: rec.type,
    enabled: rec.enabled !== false,
    cron: typeof rec.cron === "string" && rec.cron.trim() ? rec.cron.trim() : "0 9 * * *",
    timezone: typeof rec.timezone === "string" && rec.timezone.trim() ? rec.timezone.trim() : AUTOMATION_TIMEZONE,
    maxPerRun: clampInt(rec.maxPerRun, 3, 1, 100),
    maxPerDay: clampInt(rec.maxPerDay, 10, 1, 500),
    locales,
    dryRun: rec.dryRun !== false,
    consentSource: typeof rec.consentSource === "string" ? rec.consentSource.trim() || undefined : undefined,
    settings: rec.settings && typeof rec.settings === "object" && !Array.isArray(rec.settings)
      ? (rec.settings as Record<string, unknown>)
      : {},
    lastRunAt: typeof rec.lastRunAt === "string" ? rec.lastRunAt : null,
    lastError: typeof rec.lastError === "string" ? rec.lastError : null,
    lastResult: typeof rec.lastResult === "string" ? rec.lastResult : null,
    runCountToday: clampInt(rec.runCountToday, 0, 0, 10_000),
    runCountDate: typeof rec.runCountDate === "string" ? rec.runCountDate : "",
    createdAt: typeof rec.createdAt === "string" ? rec.createdAt : nowIso(),
    updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : nowIso(),
  };
}

function validateJob(job: AutomationJob): string | null {
  if (isMessagingJobType(job.type) && !job.consentSource) {
    return "Messaging jobs require consentSource (CRM / opt-in only).";
  }
  if (!job.name?.trim()) return "Job name is required.";
  if (!job.cron?.trim()) return "Cron expression is required.";
  return null;
}

async function writeJobs(file: JobsFile): Promise<JobsFile> {
  const payload: JobsFile = { ...file, version: 1, updatedAt: nowIso() };
  await ensureParent(jobsStoreFile());
  await fs.writeFile(jobsStoreFile(), JSON.stringify(payload, null, 2), { mode: 0o600 });
  return payload;
}

export async function getAutomationJobsFile(): Promise<JobsFile> {
  const raw = await readJson<JobsFile>(jobsStoreFile(), emptyJobs());
  const jobs = (Array.isArray(raw.jobs) ? raw.jobs : [])
    .map(normalizeJob)
    .filter((item): item is AutomationJob => item != null);
  return { version: 1, jobs, updatedAt: raw.updatedAt || nowIso() };
}

export async function listAutomationJobs(): Promise<AutomationJob[]> {
  return (await getAutomationJobsFile()).jobs;
}

export async function getAutomationJob(id: string): Promise<AutomationJob | null> {
  const file = await getAutomationJobsFile();
  return file.jobs.find((item) => item.id === id) || null;
}

export async function upsertAutomationJob(input: AutomationJobInput): Promise<AutomationJob> {
  const settings = await getAutomationSettings();
  const file = await getAutomationJobsFile();
  const ts = nowIso();
  const id = input.id?.trim() || newId("job");
  const existing = file.jobs.find((item) => item.id === id);
  const next: AutomationJob = {
    id,
    name: input.name.trim(),
    type: input.type,
    enabled: input.enabled ?? existing?.enabled ?? true,
    cron: (input.cron || existing?.cron || "0 9 * * *").trim(),
    timezone: (input.timezone || existing?.timezone || settings.timezone || AUTOMATION_TIMEZONE).trim(),
    maxPerRun: clampInt(input.maxPerRun, existing?.maxPerRun ?? settings.defaultMaxPerRun, 1, 100),
    maxPerDay: clampInt(input.maxPerDay, existing?.maxPerDay ?? settings.defaultMaxPerDay, 1, 500),
    locales: asLocales(input.locales, existing?.locales || [...AUTOMATION_LOCALES]),
    dryRun: input.dryRun ?? existing?.dryRun ?? settings.defaultDryRun,
    consentSource: (input.consentSource ?? existing?.consentSource)?.trim() || undefined,
    settings: input.settings || existing?.settings || {},
    lastRunAt: existing?.lastRunAt ?? null,
    lastError: existing?.lastError ?? null,
    lastResult: existing?.lastResult ?? null,
    runCountToday: existing?.runCountToday ?? 0,
    runCountDate: existing?.runCountDate ?? "",
    createdAt: existing?.createdAt || ts,
    updatedAt: ts,
  };
  const error = validateJob(next);
  if (error) throw new Error(error);
  const jobs = existing
    ? file.jobs.map((item) => (item.id === id ? next : item))
    : [...file.jobs, next];
  await writeJobs({ ...file, jobs });
  return next;
}

export async function patchAutomationJob(
  id: string,
  patch: Partial<AutomationJob>
): Promise<AutomationJob> {
  const existing = await getAutomationJob(id);
  if (!existing) throw new Error("Job not found");
  return upsertAutomationJob({
    ...existing,
    ...patch,
    id,
    name: patch.name ?? existing.name ?? "job",
    type: patch.type ?? existing.type ?? "articles.research_and_publish",
  });
}

export async function deleteAutomationJob(id: string): Promise<void> {
  const file = await getAutomationJobsFile();
  await writeJobs({ ...file, jobs: file.jobs.filter((item) => item.id !== id) });
  try {
    const { purgeApprovalByJobId } = await import("./approval-store");
    await purgeApprovalByJobId(id);
  } catch {
    // Non-critical if approvals file is missing
  }
}

export async function recordJobRun(
  id: string,
  update: {
    lastRunAt: string;
    lastError: string | null;
    lastResult?: string | null;
    dayKey: string;
    increment: number;
  }
): Promise<AutomationJob | null> {
  const file = await getAutomationJobsFile();
  const existing = file.jobs.find((item) => item.id === id);
  if (!existing) return null;
  const sameDay = existing.runCountDate === update.dayKey;
  const next: AutomationJob = {
    ...existing,
    lastRunAt: update.lastRunAt,
    lastError: update.lastError,
    lastResult: update.lastResult ?? existing.lastResult,
    runCountDate: update.dayKey,
    runCountToday: (sameDay ? existing.runCountToday || 0 : 0) + update.increment,
    updatedAt: nowIso(),
  };
  await writeJobs({
    ...file,
    jobs: file.jobs.map((item) => (item.id === id ? next : item)),
  });
  return next;
}

export async function getAutomationSettings(): Promise<AutomationSettings> {
  const raw = await readJson<Partial<AutomationSettings>>(settingsStoreFile(), {});
  return {
    ...defaultAutomationSettings(),
    ...raw,
    timezone: raw.timezone?.trim() || AUTOMATION_TIMEZONE,
    consentPolicy: CONSENT_POLICY,
  };
}

export async function saveAutomationSettings(
  patch: Partial<AutomationSettings>
): Promise<AutomationSettings> {
  const current = await getAutomationSettings();
  const next: AutomationSettings = {
    ...current,
    ...patch,
    timezone: (patch.timezone || current.timezone || AUTOMATION_TIMEZONE).trim(),
    consentPolicy: CONSENT_POLICY,
    updatedAt: nowIso(),
  };
  await ensureParent(settingsStoreFile());
  await fs.writeFile(settingsStoreFile(), JSON.stringify(next, null, 2), { mode: 0o600 });
  return next;
}
