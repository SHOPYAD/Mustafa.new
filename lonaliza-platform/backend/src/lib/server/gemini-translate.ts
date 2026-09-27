import {
  getGeminiPublicConfig,
  resolveGeminiApiKey,
} from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";

const GEMINI_MISSING_AR =
  "مفتاح Gemini غير مُعدّ. احفظه من إعدادات الذكاء الاصطناعي أو عيّن GEMINI_API_KEY على الخادم.";

export type TranslateFailureCode =
  | "rate_limit"
  | "timeout"
  | "auth"
  | "bad_json"
  | "unavailable"
  | "network"
  | "unknown";

export type TranslateBatchResult =
  | { ok: true; translations: Record<string, string> }
  | { ok: false; error: string; code: TranslateFailureCode; httpStatus?: number };

function redactSecret(text: string, secret: string): string {
  if (!secret) return text;
  return text.split(secret).join("[redacted]");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requireGeminiForTranslations(): Promise<
  | { ok: true; apiKey: string; model: string }
  | { ok: false; error: string }
> {
  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) {
    return { ok: false, error: GEMINI_MISSING_AR };
  }
  const config = await getGeminiPublicConfig();
  return {
    ok: true,
    apiKey,
    model: normalizeGeminiModelId(config.model),
  };
}

export function classifyTranslateError(
  status: number,
  message: string
): { code: TranslateFailureCode; messageAr: string } {
  const m = message || "";
  if (
    status === 429 ||
    /RESOURCE_EXHAUSTED|quota|rate.?limit|too many requests/i.test(m)
  ) {
    return {
      code: "rate_limit",
      messageAr:
        "تجاوز معدل طلبات Gemini (429). انتظر قليلاً ثم اضغط «متابعة الترجمة».",
    };
  }
  if (
    status === 401 ||
    status === 403 ||
    /API[_ ]?KEY|unauthenticated|PERMISSION_DENIED|invalid api/i.test(m)
  ) {
    return {
      code: "auth",
      messageAr:
        "مفتاح Gemini مرفوض. احفظ مفتاحاً صالحاً من إعدادات الذكاء الاصطناعي.",
    };
  }
  if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /DEADLINE|timeout|timed out|ETIMEDOUT|ECONNRESET/i.test(m)
  ) {
    return {
      code: "timeout",
      messageAr:
        "انتهت المهلة أو انقطع الاتصال بالخادم (502/504). الدُفعات المحفوظة لم تُفقد.",
    };
  }
  if (status === 404 || /not found|NOT_FOUND|no longer available/i.test(m)) {
    return {
      code: "unavailable",
      messageAr:
        "نموذج Gemini غير متاح. غيّر النموذج من إعدادات الذكاء الاصطناعي.",
    };
  }
  return {
    code: "unknown",
    messageAr: m
      ? `فشل Gemini (${status || "؟"}): ${m}`
      : `فشل Gemini (${status || "؟"}).`,
  };
}

function extractJsonObject(text: string): Record<string, string> | null {
  const block = text.match(/```json\s*([\s\S]*?)```/);
  const raw = block ? block[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return recoverJsonPairs(raw);
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<
      string,
      unknown
    >;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string") out[k] = v;
    }
    return Object.keys(out).length ? out : recoverJsonPairs(raw);
  } catch {
    return recoverJsonPairs(raw);
  }
}

function recoverJsonPairs(raw: string): Record<string, string> | null {
  const out: Record<string, string> = {};
  const re = /"((?:[^"\\]|\\.)+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let match: RegExpExecArray | null = re.exec(raw);
  while (match) {
    try {
      out[JSON.parse(`"${match[1]}"`)] = JSON.parse(`"${match[2]}"`);
    } catch {
      out[match[1]] = match[2];
    }
    match = re.exec(raw);
  }
  return Object.keys(out).length ? out : null;
}

async function translateUiBatchOnce(input: {
  apiKey: string;
  model: string;
  sourceLocale: "ar" | "en";
  targetCode: string;
  targetName: string;
  entries: { key: string; text: string }[];
}): Promise<TranslateBatchResult> {
  const sourceLabel = input.sourceLocale === "ar" ? "Arabic" : "English";
  const pairs: Record<string, string> = {};
  for (const entry of input.entries) {
    if (entry.text.trim()) pairs[entry.key] = entry.text;
  }
  if (!Object.keys(pairs).length) {
    return { ok: true, translations: {} };
  }

  const system = `You are a professional UI translator for a travel agency (Alrayyan Tourism).
Translate UI strings from ${sourceLabel} to ${input.targetName} (${input.targetCode}).
Rules:
- Return a single JSON object only: { "key": "translated string" }
- Keep placeholders like {0}, {1} exactly as-is
- Keep brand names (Alrayyan, IATA, WhatsApp, PocketBase, Gemini, Travelpayouts, iyzico) unchanged
- Keep the same tone and brevity as the source
- Do not add explanations`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${input.apiKey}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(40000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(pairs) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      }),
    });
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      return {
        ok: false,
        code: "timeout",
        error:
          "انتهت مهلة دفعة Gemini (40 ثانية). الدُفعات المحفوظة لم تُفقد.",
      };
    }
    return {
      ok: false,
      code: "network",
      error: "تعذّر الاتصال بخدمة Gemini. حاول مرة أخرى.",
    };
  }

  let data: {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    const classified = classifyTranslateError(res.status, "");
    return {
      ok: false,
      code: res.status >= 500 ? "timeout" : classified.code,
      httpStatus: res.status,
      error: classified.messageAr,
    };
  }

  if (!res.ok) {
    const raw = data?.error?.message || `Gemini error (${res.status})`;
    const safe = redactSecret(raw, input.apiKey);
    const classified = classifyTranslateError(res.status, safe);
    return {
      ok: false,
      code: classified.code,
      httpStatus: res.status,
      error: classified.messageAr,
    };
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("") || "";
  const parsed = extractJsonObject(text);
  if (!parsed) {
    return {
      ok: false,
      code: "bad_json",
      error: "Gemini لم يُرجع JSON صالحاً لهذه الدفعة. أعد المحاولة.",
    };
  }
  return { ok: true, translations: parsed };
}

export async function translateUiBatch(input: {
  apiKey: string;
  model: string;
  sourceLocale: "ar" | "en";
  targetCode: string;
  targetName: string;
  entries: { key: string; text: string }[];
  retries?: number;
}): Promise<TranslateBatchResult> {
  const attempts = Math.min(3, Math.max(1, input.retries ?? 2));
  let last: TranslateBatchResult = {
    ok: false,
    code: "unknown",
    error: "فشلت دفعة الترجمة",
  };
  for (let attempt = 1; attempt <= attempts; attempt++) {
    last = await translateUiBatchOnce(input);
    if (last.ok) return last;
    if (last.code === "auth") return last;
    if (attempt < attempts) {
      const waitMs =
        last.code === "rate_limit" ? 5000 * attempt : 1500 * attempt;
      await sleep(waitMs);
    }
  }
  return last;
}

export { GEMINI_MISSING_AR };
