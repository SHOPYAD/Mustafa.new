import {
  getOpenRouterConfig,
  resolveOpenRouterApiKey,
} from "./openrouter-config";
import { resolveGeminiApiKey, resolveGeminiFreeApiKey } from "./gemini";

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
  agentRole?: string; // e.g. "planner_concierge", "sales", "social"
  timeoutMs?: number;
}

export interface UnifiedAiResult<T = unknown> {
  ok: boolean;
  text?: string;
  data?: T;
  modelUsed?: string;
  providerUsed?: "openrouter" | "gemini";
  error?: string;
}

// Fallback Gemini models
const GEMINI_CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-pro-latest",
  "gemini-flash-latest",
];

async function callOpenRouter<T>(
  model: string,
  apiKey: string,
  params: UnifiedAiParams
): Promise<UnifiedAiResult<T>> {
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
    throw new Error(`OpenRouter error (${res.status}) [${model}]: ${errBody.slice(0, 150)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawText = json.choices?.[0]?.message?.content || "";
  if (!rawText) throw new Error("Empty response from OpenRouter");

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
  };
}

async function callGeminiDirect<T>(
  model: string,
  apiKey: string,
  params: UnifiedAiParams
): Promise<UnifiedAiResult<T>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload: Record<string, unknown> = {
    contents: [
      {
        parts: [{ text: params.prompt }],
      },
    ],
    generationConfig: {
      temperature: params.temperature ?? 0.6,
      maxOutputTokens: params.maxTokens ?? 4096,
      ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
    },
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
    signal: AbortSignal.timeout(params.timeoutMs ?? 20000),
  });

  if (!res.ok) {
    const errorData = (await res.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(errorData?.error?.message || `Gemini HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
    targetModel = config.globalDefaultModel || "anthropic/claude-sonnet-5";
  }

  // ----------------------------------------------------
  // Mode A: OpenRouter Engine (or if OpenRouter key exists)
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
  // Mode B: Google Gemini Direct (with automatic fallback)
  // ----------------------------------------------------
  const [paidKey, freeKey] = await Promise.all([
    resolveGeminiApiKey(),
    resolveGeminiFreeApiKey(),
  ]);
  const geminiKey = paidKey.apiKey || freeKey.apiKey;

  if (geminiKey) {
    const modelsToTry = [
      ...(params.preferredModel ? [params.preferredModel] : []),
      ...GEMINI_CANDIDATE_MODELS,
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let lastError = "";
    for (const model of modelsToTry) {
      try {
        const result = await callGeminiDirect<T>(model, geminiKey, params);
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
