import { dispatchAutomationJob } from "@/lib/automation/handlers";
import type {
  AutomationJob,
  AutomationJobContext,
  AutomationJobResult,
} from "@/lib/automation/types";
import { appendAutomationLog } from "./logs";
import { getAutomationJob, getAutomationSettings, recordJobRun } from "./store";

function dayKeyInZone(timezone: string, at = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(at);
  } catch {
    return at.toISOString().slice(0, 10);
  }
}

export async function runAutomationJobById(
  id: string,
  options?: { dryRun?: boolean; source?: "cron" | "worker" | "manual" }
): Promise<{ job: AutomationJob; result: AutomationJobResult }> {
  const job = await getAutomationJob(id);
  if (!job) throw new Error("Job not found");
  return executeAutomationJob(job, options);
}

export async function executeAutomationJob(
  job: AutomationJob,
  options?: { dryRun?: boolean; source?: "cron" | "worker" | "manual" }
): Promise<{ job: AutomationJob; result: AutomationJobResult }> {
  const settings = await getAutomationSettings();
  const timezone = job.timezone || settings.timezone;
  const dayKey = dayKeyInZone(timezone);
  const sameDay = job.runCountDate === dayKey;
  const used = sameDay ? job.runCountToday || 0 : 0;
  const maxPerDay = job.maxPerDay || 10;
  if (used >= maxPerDay) {
    const result: AutomationJobResult = {
      ok: true,
      processed: 0,
      skipped: job.maxPerRun || 0,
      message: `Daily cap reached (${maxPerDay}).`,
      dryRun: Boolean(options?.dryRun ?? job.dryRun),
    };
    await appendAutomationLog({
      level: "warn",
      jobId: job.id,
      jobType: job.type,
      message: result.message,
      dryRun: result.dryRun,
    });
    return { job, result };
  }

  const dryRun = Boolean(options?.dryRun ?? job.dryRun);
  const ctx: AutomationJobContext = {
    job,
    dryRun,
    locales: job.locales,
    maxPerRun: job.maxPerRun,
    timezone,
    runAt: new Date().toISOString(),
  };

  let result: AutomationJobResult;
  try {
    result = await dispatchAutomationJob(ctx);
  } catch (error) {
    result = {
      ok: false,
      processed: 0,
      message: error instanceof Error ? error.message : "Job handler failed",
      dryRun,
    };
  }

  const updated = await recordJobRun(job.id, {
    lastRunAt: ctx.runAt || new Date().toISOString(),
    lastError: result.ok ? null : result.message,
    lastResult: result.message,
    dayKey,
    increment: result.processed || (result.ok ? 1 : 0),
  });

  await appendAutomationLog({
    level: result.ok ? "info" : "error",
    jobId: job.id,
    jobType: job.type,
    message: result.message,
    dryRun,
    meta: { source: options?.source || "manual", processed: result.processed },
  });

  return { job: updated || job, result };
}
