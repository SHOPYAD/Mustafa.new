import {
  getOpenRouterConfig,
  resolveOpenRouterApiKey,
} from "./openrouter-config";
import {
  resolveGeminiApiKey,
  resolveGeminiFreeApiKey,
  getGeminiPublicConfig,
} from "./gemini";
import {
  GEMINI_2026_MODELS,
  GEMINI_DEFAULT_MODEL,
  getThinkingBudgetForMode,
  calculateGeminiCost,
  type GeminiReasoningMode,
} from "@/lib/gemini-models";
import { appendAiConsumptionLog } from "./ai-consumption-tracker";

export interface UnifiedAiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface UnifiedAiParams {
  prompt: string;
  systemInstruction?: string;
  messages?: UnifiedAiMessage[];
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: "application/json" | "text/plain";
  preferredModel?: string;
  agentRole?: string; // e.g. "planner_concierge", "sales", "social", "supervisor"
  reasoningMode?: GeminiReasoningMode;
  timeoutMs?: number;
}

export interface UnifiedAiResult<T = unknown> {
  ok: boolean;
  text?: string;
  data?: T;
  modelUsed?: string;
  providerUsed?: "openrouter" | "gemini";
  promptTokens?: number;
  completionTokens?: number;
  thinkingTokens?: number;
  costUsd?: number;
  error?: string;
}

// Fallback Gemini models from the 2026 catalog
const GEMINI_CANDIDATE_MODELS = GEMINI_2026_MODELS.map((m) => m.id);

async function callOpenRouter<T>(
  model: string,
  apiKey: string,
  params: UnifiedAiParams
): Promise<UnifiedAiResult<T>> {
  const startTime = Date.now();
  const messages: Array<{ role: string; content: string }> = [];
  if (params.systemInstruction) {
    messages.push({ role: "system", content: params.systemInstruction });
  }
  if (params.messages?.length) {
    for (const m of params.messages) {
      messages.push({ role: m.role, content: m.content });
    }
  } else {
    messages.push({ role: "user", content: params.prompt });
  }

  const payload: Record<string, unknown> = {
    model,
    messages,
    temperature: params.temperature ?? 0.6,
    max_tokens: params.maxTokens ?? 4096,
  };

  if (params.responseMimeType === "application/json") {
    payload.response_format = { type: "json_object" };
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://lonaliza.com",
      "X-Title": "Lonaliza Platform AI Swarm",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(params.timeoutMs ?? 25000),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    void appendAiConsumptionLog({
      provider: "openrouter",
      lane: "paid",
      agentRole: params.agentRole || "general",
      modelId: model,
      promptTokens: 0,
      completionTokens: 0,
      thinkingTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      durationMs: Date.now() - startTime,
      status: res.status === 429 ? "quota_exhausted" : "failed",
      error: errBody.slice(0, 200),
    });
    throw new Error(`OpenRouter error (${res.status}) [${model}]: ${errBody.slice(0, 150)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };

  const rawText = json.choices?.[0]?.message?.content || "";
  if (!rawText) throw new Error("Empty response from OpenRouter");

  const promptTokens = json.usage?.prompt_tokens || 0;
  const completionTokens = json.usage?.completion_tokens || 0;
  const durationMs = Date.now() - startTime;

  // Log in ledger
  void appendAiConsumptionLog({
    provider: "openrouter",
    lane: "paid",
    agentRole: params.agentRole || "general",
    modelId: model,
    promptTokens,
    completionTokens,
    thinkingTokens: 0,
    totalTokens: promptTokens + completionTokens,
    costUsd: 0, // auto-calculated inside appendAiConsumptionLog
    durationMs,
    status: "success",
  });

  let parsedData: T | undefined = undefined;
  if (params.responseMimeType === "application/json") {
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
      parsedData = JSON.parse(cleaned) as T;
    } catch {
      /* could not parse as json */
    }
  }

  return {
    ok: true,
    text: rawText,
    data: parsedData,
    modelUsed: model,
    providerUsed: "openrouter",
    promptTokens,
    completionTokens,
  };
}

async function callGeminiDirect<T>(
  model: string,
  apiKey: string,
  params: UnifiedAiParams,
  isPaid: boolean = false
): Promise<UnifiedAiResult<T>> {
  const startTime = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const generationConfig: Record<string, unknown> = {
    temperature: params.temperature ?? 0.6,
    maxOutputTokens: params.maxTokens ?? 4096,
    ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
  };

  // Inject Dynamic Thinking Budget for 2026 reasoning models
  const thinkingBudget = getThinkingBudgetForMode(model, params.reasoningMode);
  if (thinkingBudget > 0) {
    generationConfig.thinkingConfig = { thinkingBudget };
  }

  const payload: Record<string, unknown> = {
    contents: [
      {
        parts: [{ text: params.prompt }],
      },
    ],
    generationConfig,
  };

  if (params.systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: params.systemInstruction }],
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(params.timeoutMs ?? 25000),
  });

  if (!res.ok) {
    const errorData = (await res.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    const msg = errorData?.error?.message || `Gemini HTTP ${res.status}`;

    void appendAiConsumptionLog({
      provider: "gemini",
      lane: isPaid ? "paid" : "free",
      agentRole: params.agentRole || "general",
      modelId: model,
      reasoningMode: params.reasoningMode,
      promptTokens: 0,
      completionTokens: 0,
      thinkingTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      durationMs: Date.now() - startTime,
      status: res.status === 429 ? "quota_exhausted" : "failed",
      error: msg.slice(0, 200),
    });

    throw new Error(msg);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
      thinkingTokenCount?: number;
    };
  };

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const promptTokens = data.usageMetadata?.promptTokenCount || 0;
  const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;
  const thinkingTokens = data.usageMetadata?.thinkingTokenCount || 0;
  const durationMs = Date.now() - startTime;

  let calculatedCost = 0;
  if (isPaid) {
    calculatedCost = calculateGeminiCost(model, promptTokens, completionTokens, thinkingTokens);
  }

  // Record consumption in ledger
  void appendAiConsumptionLog({
    provider: "gemini",
    lane: isPaid ? "paid" : "free",
    agentRole: params.agentRole || "general",
    modelId: model,
    reasoningMode: params.reasoningMode,
    promptTokens,
    completionTokens,
    thinkingTokens,
    totalTokens: promptTokens + completionTokens + thinkingTokens,
    costUsd: calculatedCost,
    durationMs,
    status: "success",
  });

  let parsedData: T | undefined = undefined;
  if (params.responseMimeType === "application/json") {
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
      parsedData = JSON.parse(cleaned) as T;
    } catch {
      /* ignore json parse error */
    }
  }

  return {
    ok: true,
    text: rawText,
    data: parsedData,
    modelUsed: model,
    providerUsed: "gemini",
    promptTokens,
    completionTokens,
    thinkingTokens,
    costUsd: calculatedCost,
  };
}

/**
 * Main execution function with multi-provider and cascading fallback tiers.
 */
export async function generateUnifiedAiContent<T = unknown>(
  params: UnifiedAiParams
): Promise<UnifiedAiResult<T>> {
  const config = getOpenRouterConfig();
  const { apiKey: openRouterKey } = await resolveOpenRouterApiKey();

  // Resolve target model:
  // 1. Explicit preferredModel
  // 2. Agent-specific model from config
  // 3. Global default model
  let targetModel = params.preferredModel;
  if (!targetModel && params.agentRole) {
    const roleKey = params.agentRole as keyof typeof config.agentModels;
    targetModel = config.agentModels[roleKey];
  }
  if (!targetModel) {
    targetModel =
      config.globalDefaultModel ||
      (config.providerMode === "gemini" ? GEMINI_DEFAULT_MODEL : "anthropic/claude-sonnet-5");
  }

  // ----------------------------------------------------
  // Mode A: OpenRouter Engine (or if OpenRouter key exists and mode is openrouter)
  // ----------------------------------------------------
  if (config.providerMode === "openrouter" && openRouterKey) {
    const cascade = config.fallbackCascade;
    const modelsToTry = [
      targetModel,
      cascade.tier1,
      cascade.tier2,
      cascade.tier3,
      cascade.tier4,
    ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    let lastError = "";
    for (const model of modelsToTry) {
      try {
        const result = await callOpenRouter<T>(model, openRouterKey, params);
        if (result.ok) return result;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
    return { ok: false, error: `All OpenRouter models failed: ${lastError}` };
  }

  // ----------------------------------------------------
  // Mode B: Google Gemini Direct (with smart Free vs Paid lane)
  // ----------------------------------------------------
  const [paidKey, freeKey, publicConfig] = await Promise.all([
    resolveGeminiApiKey(),
    resolveGeminiFreeApiKey(),
    getGeminiPublicConfig(),
  ]);

  const isPaidLane = Boolean(publicConfig.salesPaidKeyEnabled && paidKey.apiKey);
  const geminiKey = isPaidLane ? (paidKey.apiKey || freeKey.apiKey) : (freeKey.apiKey || paidKey.apiKey);

  if (geminiKey) {
    const modelsToTry = [
      ...(params.preferredModel ? [params.preferredModel] : []),
      targetModel,
      ...GEMINI_CANDIDATE_MODELS,
    ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    let lastError = "";
    for (const model of modelsToTry) {
      try {
        const result = await callGeminiDirect<T>(model, geminiKey, params, isPaidLane);
        if (result.ok) return result;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    // Emergency cascade: If Gemini fails and OpenRouter key is available, rescue the call!
    if (openRouterKey) {
      try {
        return await callOpenRouter<T>("openrouter/free", openRouterKey, params);
      } catch {
        /* proceed to error */
      }
    }

    return { ok: false, error: `All Gemini models failed: ${lastError}` };
  }

  // If no Gemini key, but OpenRouter key exists, fallback to OpenRouter
  if (openRouterKey) {
    try {
      return await callOpenRouter<T>(targetModel, openRouterKey, params);
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "OpenRouter call failed" };
    }
  }

  return {
    ok: false,
    error: "No AI API keys configured. Please add Gemini or OpenRouter key in AI settings.",
  };
}

/**
 * Backwards-compatible alias for existing services calling generateGeminiContent.
 */
export async function generateGeminiContent<T = unknown>(params: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: "application/json" | "text/plain";
  preferredModel?: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; text?: string; data?: T; modelUsed?: string; error?: string }> {
  return generateUnifiedAiContent<T>(params);
}
