import { promises as fs } from "fs";
import path from "path";
import type { CampaignResult } from "@/lib/automation/types";

export type CampaignLogRow = CampaignResult & {
  at: string;
  jobId?: string;
  jobType?: string;
};

function logFile(): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null) {
    return path.join("/tmp", "lonaliza-comms-campaign-logs.json");
  }
  return path.join(process.cwd(), ".data", "comms-campaign-logs.json");
}

export async function appendCampaignLog(row: CampaignLogRow): Promise<void> {
  let rows: CampaignLogRow[] = [];
  try {
    rows = JSON.parse(await fs.readFile(logFile(), "utf8")) as CampaignLogRow[];
    if (!Array.isArray(rows)) rows = [];
  } catch {
    rows = [];
  }
  rows.unshift(row);
  rows = rows.slice(0, 80);
  await fs.mkdir(path.dirname(logFile()), { recursive: true });
  await fs.writeFile(logFile(), JSON.stringify(rows, null, 2), { mode: 0o600 });
}

export async function listCampaignLogs(): Promise<CampaignLogRow[]> {
  try {
    const rows = JSON.parse(await fs.readFile(logFile(), "utf8")) as CampaignLogRow[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}
