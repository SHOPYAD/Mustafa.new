import { resolveGeminiApiKey, resolveGeminiFreeApiKey } from "./gemini";

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
  timeoutMs?: number;
  responseMimeType?: "application/json" | "text/plain";
  preferredModel?: string;
}

export interface GeminiCallResult<T = unknown> {
  ok: boolean;
  text?: string;
  data?: T;
  modelUsed?: string;
  error?: string;
}

// Ordered list of verified active models in Google AI Studio
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

/**
 * Executes a robust Gemini generation call with automatic fallback across valid model IDs.
 */
export async function generateGeminiContent<T = unknown>(
  params: GeminiCallParams
): Promise<GeminiCallResult<T>> {
  const [paid, free] = await Promise.all([
    resolveGeminiApiKey(),
    resolveGeminiFreeApiKey(),
  ]);

  const apiKey = paid.apiKey || free.apiKey;
  if (!apiKey) {
    return {
      ok: false,
      error: "No Gemini API Key found. Please add a key in AI settings.",
    };
  }

  const modelsToTry = [
    ...(params.preferredModel ? [params.preferredModel] : []),
    ...CANDIDATE_MODELS.filter((m) => m !== params.preferredModel),
  ];

  let lastError = "";

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload: Record<string, unknown> = {
        contents: params.contents?.length
          ? params.contents
          : [
              {
                parts: [{ text: params.prompt }],
              },
            ],
        generationConfig: {
          temperature: params.temperature ?? 0.6,
          maxOutputTokens: params.maxTokens ?? 8192,
          ...(params.responseMimeType
            ? { responseMimeType: params.responseMimeType }
            : {}),
        },
      };

      if (params.systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: params.systemInstruction }],
        };
      }

      const timeoutMs = params.timeoutMs || 35000;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as {
          error?: { message?: string; code?: number };
        } | null;
        lastError = errorData?.error?.message || `HTTP ${res.status}`;
        // If 404 model not found, try the next model in the fallback chain
        if (
          res.status === 404 ||
          lastError.includes("not found") ||
          lastError.includes("no longer available")
        ) {
          continue;
        }
        // If quota or temporary overload on model, continue to next model in fallback chain
        if (res.status === 429 || res.status === 400 || res.status === 503 || res.status === 500) {
          continue;
        }
        continue;
      }

      const data = (await res.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const rawText =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("") || "";

      if (!rawText) {
        lastError = "Empty response from Gemini";
        continue;
      }

      if (params.responseMimeType === "application/json") {
        try {
          const cleaned = rawText
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          const parsed = JSON.parse(cleaned) as T;
          return {
            ok: true,
            text: rawText,
            data: parsed,
            modelUsed: model,
          };
        } catch {
          // If JSON parse failed, try extracting first JSON object
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              const parsed = JSON.parse(match[0]) as T;
              return {
                ok: true,
                text: rawText,
                data: parsed,
                modelUsed: model,
              };
            } catch {
              // ignore
            }
          }
        }
      }

      return {
        ok: true,
        text: rawText,
        modelUsed: model,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Fetch failed";
    }
  }

  // Fallback to OpenRouter if Gemini fails or quota exceeded
  try {
    const fs = await import("fs");
    const path = await import("path");
    let openRouterKey = process.env.OPENROUTER_API_KEY || "";
    const secretsPath = path.join(process.cwd(), ".data", "openrouter-secrets.json");
    if (!openRouterKey && fs.existsSync(secretsPath)) {
      const data = JSON.parse(fs.readFileSync(secretsPath, "utf-8"));
      openRouterKey = data.apiKey || "";
    }
    if (openRouterKey) {
      const openRouterModel = params.preferredModel?.includes("/") ? params.preferredModel : "deepseek/deepseek-v4.1-flash";
      const payload: Record<string, unknown> = {
        model: openRouterModel,
        messages: [
          ...(params.systemInstruction ? [{ role: "system", content: params.systemInstruction }] : []),
          ...(params.contents?.length
            ? params.contents.map((c) => ({
                role: c.role === "model" ? "assistant" : "user",
                content: c.parts.map((p) => p.text).join("\n"),
              }))
            : [{ role: "user", content: params.prompt }]),
        ],
        temperature: params.temperature ?? 0.6,
        max_tokens: params.maxTokens ?? 2048,
      };
      if (params.responseMimeType === "application/json") {
        payload.response_format = { type: "json_object" };
      }
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(params.timeoutMs || 25000),
      });
      if (res.ok) {
        const json = await res.json();
        const rawText = json.choices?.[0]?.message?.content || "";
        if (rawText) {
          let parsed = undefined;
          if (params.responseMimeType === "application/json") {
            try {
              const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
              parsed = JSON.parse(cleaned);
            } catch {
              const match = rawText.match(/\{[\s\S]*\}/);
              if (match) parsed = JSON.parse(match[0]);
            }
          }
          return {
            ok: true,
            text: rawText,
            data: parsed,
            modelUsed: openRouterModel,
          };
        }
      }
    }
  } catch {
    /* openrouter fallback failed, return gemini error */
  }

  return {
    ok: false,
    error: lastError || "All Gemini and OpenRouter models failed",
  };
}
