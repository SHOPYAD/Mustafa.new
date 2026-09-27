import fs from "fs";
import path from "path";
import {
  CURATED_OPENROUTER_MODELS,
  DEFAULT_AGENT_MODELS,
  DEFAULT_FALLBACK_CASCADE,
  type AgentModelAssignments,
  type FallbackCascadeConfig,
  type OpenRouterModelInfo,
} from "../openrouter-models";

const DATA_DIR = path.join(process.cwd(), ".data");
const CONFIG_FILE = path.join(DATA_DIR, "openrouter-config.json");
const SECRETS_FILE = path.join(DATA_DIR, "openrouter-secrets.json");

export type ProviderMode = "gemini" | "openrouter";

export interface OpenRouterConfigData {
  providerMode: ProviderMode;
  globalDefaultModel: string;
  fallbackCascade: FallbackCascadeConfig;
  agentModels: AgentModelAssignments;
  cachedDynamicModels?: OpenRouterModelInfo[];
  lastSyncedAt?: string;
  openRouterApiKeyMasked?: string;
  hasOpenRouterKey?: boolean;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function maskKey(key: string): string {
  if (!key || key.length < 8) return "";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export async function resolveOpenRouterApiKey(): Promise<{ apiKey: string; source: "env" | "file" | "none" }> {
  if (process.env.OPENROUTER_API_KEY?.trim()) {
    return { apiKey: process.env.OPENROUTER_API_KEY.trim(), source: "env" };
  }
  ensureDir();
  if (fs.existsSync(SECRETS_FILE)) {
    try {
      const raw = fs.readFileSync(SECRETS_FILE, "utf-8");
      const json = JSON.parse(raw);
      if (json.apiKey && typeof json.apiKey === "string") {
        return { apiKey: json.apiKey.trim(), source: "file" };
      }
    } catch {
      /* ignore read error */
    }
  }
  return { apiKey: "", source: "none" };
}

export async function saveOpenRouterApiKey(apiKey: string): Promise<void> {
  ensureDir();
  const trimmed = String(apiKey || "").trim();
  if (!trimmed) return;
  fs.writeFileSync(SECRETS_FILE, JSON.stringify({ apiKey: trimmed, updatedAt: new Date().toISOString() }, null, 2), "utf-8");
}

export function getOpenRouterConfig(): OpenRouterConfigData {
  ensureDir();
  let fileConfig: Partial<OpenRouterConfigData> = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      fileConfig = JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }

  let hasKey = false;
  let keyMasked = "";
  if (process.env.OPENROUTER_API_KEY?.trim()) {
    hasKey = true;
    keyMasked = maskKey(process.env.OPENROUTER_API_KEY.trim());
  } else if (fs.existsSync(SECRETS_FILE)) {
    try {
      const raw = fs.readFileSync(SECRETS_FILE, "utf-8");
      const json = JSON.parse(raw);
      if (json.apiKey) {
        hasKey = true;
        keyMasked = maskKey(json.apiKey);
      }
    } catch {
      /* ignore */
    }
  }

  return {
    providerMode: fileConfig.providerMode || (hasKey ? "openrouter" : "gemini"),
    globalDefaultModel: fileConfig.globalDefaultModel || "anthropic/claude-sonnet-5",
    fallbackCascade: fileConfig.fallbackCascade || DEFAULT_FALLBACK_CASCADE,
    agentModels: { ...DEFAULT_AGENT_MODELS, ...(fileConfig.agentModels || {}) },
    cachedDynamicModels: fileConfig.cachedDynamicModels || CURATED_OPENROUTER_MODELS,
    lastSyncedAt: fileConfig.lastSyncedAt || new Date().toISOString(),
    hasOpenRouterKey: hasKey,
    openRouterApiKeyMasked: keyMasked,
  };
}

export function saveOpenRouterConfig(patch: Partial<OpenRouterConfigData>): OpenRouterConfigData {
  ensureDir();
  const current = getOpenRouterConfig();
  const next: OpenRouterConfigData = {
    ...current,
    ...patch,
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
