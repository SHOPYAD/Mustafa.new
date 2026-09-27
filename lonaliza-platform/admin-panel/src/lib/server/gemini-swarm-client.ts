import { generateUnifiedAiContent, type UnifiedAiParams } from "./unified-ai-client";

export interface GeminiContentItem {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GeminiCallParams {
  prompt: string;
  contents?: GeminiContentItem[];
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: "application/json" | "text/plain";
  preferredModel?: string;
  agentRole?: string;
  timeoutMs?: number;
}

export interface GeminiCallResult<T = unknown> {
  ok: boolean;
  text?: string;
  data?: T;
  modelUsed?: string;
  error?: string;
}

/**
 * Universal Unified AI generation with OpenRouter & Google Gemini support and automatic multi-tier fallback.
 */
export async function generateGeminiContent<T = unknown>(
  params: GeminiCallParams
): Promise<GeminiCallResult<T>> {
  const unifiedParams: UnifiedAiParams = {
    prompt: params.prompt,
    systemInstruction: params.systemInstruction,
    temperature: params.temperature,
    maxTokens: params.maxTokens,
    responseMimeType: params.responseMimeType,
    preferredModel: params.preferredModel,
    agentRole: params.agentRole,
    timeoutMs: params.timeoutMs,
  };

  if (params.contents?.length) {
    unifiedParams.messages = params.contents.map((c) => ({
      role: c.role === "model" ? "assistant" : "user",
      content: c.parts.map((p) => p.text).join("\n"),
    }));
  }

  const result = await generateUnifiedAiContent<T>(unifiedParams);
  return {
    ok: result.ok,
    text: result.text,
    data: result.data,
    modelUsed: result.modelUsed,
    error: result.error,
  };
}
