import { promises as fs } from "fs";
import path from "path";
import { calculateGeminiCost, getGeminiModelById, type GeminiReasoningMode } from "@/lib/gemini-models";
import { CURATED_OPENROUTER_MODELS } from "@/lib/openrouter-models";

const DATA_DIR = path.join(process.cwd(), ".data");
const LEDGER_FILE = path.join(DATA_DIR, "ai-consumption-ledger.json");
const MAX_LEDGER_ENTRIES = 2000;

export interface AiConsumptionLog {
  id: string;
  timestamp: string;
  provider: "gemini" | "openrouter";
  lane: "free" | "paid";
  agentRole: string;
  modelId: string;
  reasoningMode?: GeminiReasoningMode | "off";
  promptTokens: number;
  completionTokens: number;
  thinkingTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
  status: "success" | "quota_exhausted" | "failed";
  error?: string;
}

export interface AiAnalyticsSummary {
  date: string;
  gemini: {
    freeRequestsToday: number;
    maxFreeDaily: number;
    freeRequestsPct: number;
    paidRequestsToday: number;
    paidCostTodayUsd: number;
    promptTokensToday: number;
    completionTokensToday: number;
    thinkingTokensToday: number;
    totalTokensToday: number;
    byModel: Record<string, { requests: number; tokens: number; costUsd: number }>;
    byAgent: Record<string, { requests: number; tokens: number; costUsd: number }>;
  };
  openrouter: {
    requestsToday: number;
    costTodayUsd: number;
    promptTokensToday: number;
    completionTokensToday: number;
    totalTokensToday: number;
    byModel: Record<string, { requests: number; tokens: number; costUsd: number }>;
    byAgent: Record<string, { requests: number; tokens: number; costUsd: number }>;
  };
  combinedTotalCostUsd: number;
  recentLogs: AiConsumptionLog[];
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readLedger(): Promise<AiConsumptionLog[]> {
  try {
    const raw = await fs.readFile(LEDGER_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AiConsumptionLog[];
  } catch {
    /* missing or corrupt ledger */
  }
  return [];
}

async function writeLedger(logs: AiConsumptionLog[]): Promise<void> {
  await ensureDataDir();
  const trimmed = logs.slice(-MAX_LEDGER_ENTRIES);
  await fs.writeFile(LEDGER_FILE, JSON.stringify(trimmed, null, 2), "utf8");
}

function calculateOpenRouterCost(modelId: string, promptTokens: number, completionTokens: number): number {
  const curated = CURATED_OPENROUTER_MODELS.find((m) => m.id === modelId);
  if (!curated || curated.isFree) return 0;
  const inCost = (promptTokens / 1_000_000) * curated.promptPricePerM;
  const outCost = (completionTokens / 1_000_000) * curated.completionPricePerM;
  return Math.round((inCost + outCost) * 100_000) / 100_000;
}

export async function appendAiConsumptionLog(
  entry: Omit<AiConsumptionLog, "id" | "timestamp">
): Promise<AiConsumptionLog> {
  const id = `ai_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = new Date().toISOString();

  let finalCost = entry.costUsd;
  if (finalCost === undefined || finalCost === null) {
    if (entry.provider === "gemini") {
      finalCost = entry.lane === "free" ? 0 : calculateGeminiCost(
        entry.modelId,
        entry.promptTokens,
        entry.completionTokens,
        entry.thinkingTokens
      );
    } else {
      finalCost = calculateOpenRouterCost(entry.modelId, entry.promptTokens, entry.completionTokens);
    }
  }

  const record: AiConsumptionLog = {
    id,
    timestamp,
    ...entry,
    costUsd: finalCost,
    totalTokens: entry.promptTokens + entry.completionTokens + (entry.thinkingTokens || 0),
  };

  const logs = await readLedger();
  logs.push(record);
  await writeLedger(logs);

  return record;
}

export async function getAiAnalyticsSummary(limitLogs: number = 30): Promise<AiAnalyticsSummary> {
  const logs = await readLedger();
  const todayKey = new Date().toISOString().slice(0, 10);

  const summary: AiAnalyticsSummary = {
    date: todayKey,
    gemini: {
      freeRequestsToday: 0,
      maxFreeDaily: 1500,
      freeRequestsPct: 0,
      paidRequestsToday: 0,
      paidCostTodayUsd: 0,
      promptTokensToday: 0,
      completionTokensToday: 0,
      thinkingTokensToday: 0,
      totalTokensToday: 0,
      byModel: {},
      byAgent: {},
    },
    openrouter: {
      requestsToday: 0,
      costTodayUsd: 0,
      promptTokensToday: 0,
      completionTokensToday: 0,
      totalTokensToday: 0,
      byModel: {},
      byAgent: {},
    },
    combinedTotalCostUsd: 0,
    recentLogs: [],
  };

  for (const log of logs) {
    const isToday = log.timestamp.slice(0, 10) === todayKey;

    if (log.provider === "gemini") {
      if (isToday) {
        if (log.lane === "free") {
          summary.gemini.freeRequestsToday += 1;
        } else {
          summary.gemini.paidRequestsToday += 1;
          summary.gemini.paidCostTodayUsd += log.costUsd || 0;
        }
        summary.gemini.promptTokensToday += log.promptTokens || 0;
        summary.gemini.completionTokensToday += log.completionTokens || 0;
        summary.gemini.thinkingTokensToday += log.thinkingTokens || 0;
        summary.gemini.totalTokensToday += log.totalTokens || 0;

        // By model
        const mKey = log.modelId || "unknown";
        if (!summary.gemini.byModel[mKey]) {
          summary.gemini.byModel[mKey] = { requests: 0, tokens: 0, costUsd: 0 };
        }
        summary.gemini.byModel[mKey].requests += 1;
        summary.gemini.byModel[mKey].tokens += log.totalTokens || 0;
        summary.gemini.byModel[mKey].costUsd += log.costUsd || 0;

        // By agent
        const aKey = log.agentRole || "general";
        if (!summary.gemini.byAgent[aKey]) {
          summary.gemini.byAgent[aKey] = { requests: 0, tokens: 0, costUsd: 0 };
        }
        summary.gemini.byAgent[aKey].requests += 1;
        summary.gemini.byAgent[aKey].tokens += log.totalTokens || 0;
        summary.gemini.byAgent[aKey].costUsd += log.costUsd || 0;
      }
    } else if (log.provider === "openrouter") {
      if (isToday) {
        summary.openrouter.requestsToday += 1;
        summary.openrouter.costTodayUsd += log.costUsd || 0;
        summary.openrouter.promptTokensToday += log.promptTokens || 0;
        summary.openrouter.completionTokensToday += log.completionTokens || 0;
        summary.openrouter.totalTokensToday += log.totalTokens || 0;

        // By model
        const mKey = log.modelId || "unknown";
        if (!summary.openrouter.byModel[mKey]) {
          summary.openrouter.byModel[mKey] = { requests: 0, tokens: 0, costUsd: 0 };
        }
        summary.openrouter.byModel[mKey].requests += 1;
        summary.openrouter.byModel[mKey].tokens += log.totalTokens || 0;
        summary.openrouter.byModel[mKey].costUsd += log.costUsd || 0;

        // By agent
        const aKey = log.agentRole || "general";
        if (!summary.openrouter.byAgent[aKey]) {
          summary.openrouter.byAgent[aKey] = { requests: 0, tokens: 0, costUsd: 0 };
        }
        summary.openrouter.byAgent[aKey].requests += 1;
        summary.openrouter.byAgent[aKey].tokens += log.totalTokens || 0;
        summary.openrouter.byAgent[aKey].costUsd += log.costUsd || 0;
      }
    }
  }

  // Rounded metrics
  summary.gemini.paidCostTodayUsd = Math.round(summary.gemini.paidCostTodayUsd * 100_000) / 100_000;
  summary.openrouter.costTodayUsd = Math.round(summary.openrouter.costTodayUsd * 100_000) / 100_000;
  summary.combinedTotalCostUsd = Math.round((summary.gemini.paidCostTodayUsd + summary.openrouter.costTodayUsd) * 100_000) / 100_000;
  summary.gemini.freeRequestsPct = Math.round((summary.gemini.freeRequestsToday / summary.gemini.maxFreeDaily) * 100);

  // Return the most recent logs (reversed)
  summary.recentLogs = logs.slice(-limitLogs).reverse();

  return summary;
}
