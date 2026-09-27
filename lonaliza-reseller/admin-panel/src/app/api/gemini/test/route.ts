import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  resolveGeminiApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import {
  GEMINI_DEFAULT_MODEL,
  geminiAuthErrorMessageAr,
  geminiFallbackSuccessMessageAr,
  geminiUnavailableMessageAr,
  isGeminiAuthError,
  isGeminiModelUnavailable,
  normalizeGeminiModelId,
} from "@/lib/gemini-models";

export const runtime = "nodejs";

type GeminiGenerateResult = {
  status: number;
  ok: boolean;
  message: string;
  text: string;
};

async function generateTest(
  apiKey: string,
  model: string
): Promise<GeminiGenerateResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Reply with exactly: OK" }] }],
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const message = data?.error?.message || `Gemini error (${res.status})`;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "OK";
  return { status: res.status, ok: res.ok, message, text };
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    let modelOverride: string | undefined;
    try {
      const body = await req.json();
      if (typeof body?.model === "string") modelOverride = body.model.trim();
    } catch {
      /* empty body ok */
    }

    const { apiKey, source } = await resolveGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "لا يوجد مفتاح بعد. أضف المفتاح من هذه الصفحة ثم احفظ.",
        },
        { status: 400 }
      );
    }

    const config = await getGeminiPublicConfig();
    const requested = normalizeGeminiModelId(
      modelOverride || config.model
    );

    const first = await generateTest(apiKey, requested);
    if (first.ok) {
      return NextResponse.json({
        ok: true,
        message: first.text,
        model: requested,
        keySource: source,
      });
    }

    if (isGeminiAuthError(first.message)) {
      return NextResponse.json(
        { ok: false, error: geminiAuthErrorMessageAr() },
        { status: 400 }
      );
    }

    if (isGeminiModelUnavailable(first.status, first.message)) {
      if (requested !== GEMINI_DEFAULT_MODEL) {
        const retry = await generateTest(apiKey, GEMINI_DEFAULT_MODEL);
        if (retry.ok) {
          return NextResponse.json({
            ok: true,
            message: geminiFallbackSuccessMessageAr(
              requested,
              GEMINI_DEFAULT_MODEL
            ),
            model: GEMINI_DEFAULT_MODEL,
            requestedModel: requested,
            fallbackUsed: true,
            keySource: source,
          });
        }
        if (isGeminiAuthError(retry.message)) {
          return NextResponse.json(
            { ok: false, error: geminiAuthErrorMessageAr() },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            ok: false,
            error: geminiUnavailableMessageAr(
              requested,
              GEMINI_DEFAULT_MODEL,
              true,
              retry.message
            ),
            model: requested,
            requestedModel: requested,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: geminiUnavailableMessageAr(
            requested,
            GEMINI_DEFAULT_MODEL,
            false
          ),
          model: requested,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: first.message,
        model: requested,
      },
      { status: 400 }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
