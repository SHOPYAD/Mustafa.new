import { Cron } from "croner";
import type { AutomationJob, AutomationTickResult } from "@/lib/automation/types";
import { enqueueAutomationJob, isAutomationWorkerAlive } from "./queue";
import { executeAutomationJob } from "./runner";
import { getAutomationSettings, listAutomationJobs } from "./store";

const MIN_GAP_MS = 45_000;

export { executeAutomationJob, runAutomationJobById } from "./runner";

function clockInZone(timezone: string, at = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(at);
  } catch {
    return `${String(at.getUTCHours()).padStart(2, "0")}:${String(at.getUTCMinutes()).padStart(2, "0")}`;
  }
}

function inPublishWindow(start: string, end: string, timezone: string, at = new Date()): boolean {
  const now = clockInZone(timezone, at);
  if (start <= end) return now >= start && now <= end;
  return now >= start || now <= end;
}

export function isJobDue(job: AutomationJob, now = new Date()): boolean {
  if (!job.enabled) return false;
  try {
    const cron = new Cron(job.cron || "0 9 * * *", { timezone: job.timezone || "Europe/Istanbul", paused: true });
    const prev = cron.previousRuns(1, now)[0] ?? cron.previousRun();
    if (!prev) return !job.lastRunAt;
    if (!job.lastRunAt) return true;
    const last = new Date(job.lastRunAt);
    if (Number.isNaN(last.getTime())) return true;
    if (now.getTime() - last.getTime() < MIN_GAP_MS) return false;
    return prev.getTime() > last.getTime();
  } catch {
    return false;
  }
}

export async function tickAutomationEngine(source: "cron" | "worker" | "manual"): Promise<AutomationTickResult> {
  const [jobs, settings] = await Promise.all([listAutomationJobs(), getAutomationSettings()]);
  const workerAlive = await isAutomationWorkerAlive();
  const report: AutomationTickResult = {
    ok: true,
    due: 0,
    ran: 0,
    skipped: 0,
    errors: 0,
    source,
    redis: workerAlive,
    jobs: [],
  };

  if (!settings.workerEnabled && source !== "manual") {
    return report;
  }

  for (const job of jobs) {
    if (!job.enabled) continue;
    if (!isJobDue(job)) continue;
    if (!inPublishWindow(settings.publishWindowStart, settings.publishWindowEnd, job.timezone || settings.timezone)) {
      report.skipped += 1;
      report.jobs.push({ id: job.id, type: job.type || "", status: "window", message: "Outside publish window" });
      continue;
    }
    report.due += 1;
    try {
      if (workerAlive && source === "cron") {
        const queued = await enqueueAutomationJob(job.id, { dryRun: job.dryRun });
        if (queued) {
          report.ran += 1;
          report.jobs.push({ id: job.id, type: job.type || "", status: "queued", message: "Enqueued on BullMQ" });
          continue;
        }
      }
      const { result } = await executeAutomationJob(job, { source });
      if (result.ok) report.ran += 1;
      else report.errors += 1;
      report.jobs.push({
        id: job.id,
        type: job.type || "",
        status: result.ok ? "ran" : "error",
        message: result.message,
      });
    } catch (error) {
      report.errors += 1;
      report.jobs.push({
        id: job.id,
        type: job.type || "",
        status: "error",
        message: error instanceof Error ? error.message : "Tick failed",
      });
    }
  }

  report.ok = report.errors === 0;
  return report;
}
