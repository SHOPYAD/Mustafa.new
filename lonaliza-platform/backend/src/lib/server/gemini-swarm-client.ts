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

// Ordered list of known active models in Google AI Studio
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.1-pro-preview",
  "gemini-pro-latest",
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
          maxOutputTokens: params.maxTokens ?? 2048,
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

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000),
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
        // If quota or other non-fatal error on first model, continue to next model
        if (res.status === 429 || res.status === 400) {
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

  return {
    ok: false,
    error: lastError || "All Gemini models failed",
  };
}
