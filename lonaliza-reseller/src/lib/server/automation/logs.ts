import { promises as fs } from "fs";
import path from "path";
import type { AutomationLogEntry, AutomationLogLevel } from "@/lib/automation/types";
import { logsStoreFile } from "./paths";

const MAX_LOGS = 400;

type LogsFile = {
  version: 1;
  entries: AutomationLogEntry[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

async function readLogs(): Promise<LogsFile> {
  try {
    const raw = await fs.readFile(logsStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as LogsFile;
    return {
      version: 1,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return { version: 1, entries: [] };
  }
}

async function writeLogs(file: LogsFile): Promise<void> {
  await fs.mkdir(path.dirname(logsStoreFile()), { recursive: true });
  await fs.writeFile(logsStoreFile(), JSON.stringify(file, null, 2), { mode: 0o600 });
}

export async function listAutomationLogs(limit = 120): Promise<AutomationLogEntry[]> {
  const file = await readLogs();
  return file.entries.slice(0, Math.min(MAX_LOGS, Math.max(1, limit)));
}

export async function appendAutomationLog(
  entry: Omit<AutomationLogEntry, "id" | "at"> & { at?: string; level?: AutomationLogLevel }
): Promise<AutomationLogEntry> {
  const next: AutomationLogEntry = {
    id: newId(),
    at: entry.at || nowIso(),
    level: entry.level || "info",
    jobId: entry.jobId,
    jobType: entry.jobType,
    message: entry.message,
    dryRun: entry.dryRun,
    meta: entry.meta,
  };
  const file = await readLogs();
  const entries = [next, ...file.entries].slice(0, MAX_LOGS);
  await writeLogs({ version: 1, entries });
  return next;
}
