import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  resolveGeminiApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function unsplashUrl(query: string) {
  const q = encodeURIComponent(query || "travel destination");
  return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80&${q}`;
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : [];
    const articleContext = body.articleContext || {};

    if (!messages.length) {
      return NextResponse.json(
        { ok: false, error: "messages required" },
        { status: 400 }
      );
    }

    const { apiKey } = await resolveGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "مفتاح Gemini غير مُعدّ على الخادم. احفظه من إعدادات الذكاء الاصطناعي أو عيّن GEMINI_API_KEY.",
        },
        { status: 400 }
      );
    }

    const config = await getGeminiPublicConfig();
    const model = normalizeGeminiModelId(
      (typeof body.model === "string" && body.model.trim()) || config.model
    );

    const systemInstructions =
      (typeof body.systemInstructions === "string" && body.systemInstructions) ||
      config.systemInstructions;
    const writingRules =
      (typeof body.writingRules === "string" && body.writingRules) ||
      config.writingRules;

    const system = `${systemInstructions}

قواعد الكتابة:
${writingRules}

سياق المقال الحالي:
${JSON.stringify(articleContext, null, 2)}

إذا طلب المستخدم كتابة أو تحسين المقال، أعد أيضاً كتلة JSON داخل \`\`\`json ... \`\`\` يمكن تطبيقها على المقال.
للصور استخدم imageSuggestions بـ query مناسب.`;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error?.message || `Gemini error (${res.status})`,
        },
        { status: 400 }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("") || "";

    let articlePatch: Record<string, unknown> | null = null;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        articlePatch = JSON.parse(jsonMatch[1]);
      } catch {
        articlePatch = null;
      }
    }

    if (articlePatch && Array.isArray(articlePatch.imageSuggestions)) {
      const imgs = articlePatch.imageSuggestions as {
        query?: string;
        alt?: string;
      }[];
      const htmlImgs = imgs
        .map((img) => {
          const src = unsplashUrl(img.query || "travel");
          const alt = img.alt || img.query || "";
          return `<figure><img src="${src}" alt="${alt}" /><figcaption>${alt}</figcaption></figure>`;
        })
        .join("\n");
      if (htmlImgs) {
        if (typeof articlePatch.contentAr === "string") {
          articlePatch.contentAr = `${articlePatch.contentAr}\n${htmlImgs}`;
        }
        if (typeof articlePatch.contentEn === "string") {
          articlePatch.contentEn = `${articlePatch.contentEn}\n${htmlImgs}`;
        }
      }
    }

    return NextResponse.json({ ok: true, reply: text, articlePatch });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
