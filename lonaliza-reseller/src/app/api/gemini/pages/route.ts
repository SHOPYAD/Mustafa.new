import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  resolveGeminiApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import { upsertCustomPageBySlug } from "@/lib/server/pages-store";
import type { CustomPageInput } from "@/types/custom-page";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function extractJsonBlock(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced?.[1] || text.match(/\{[\s\S]*\}/)?.[0];
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toPageInput(patch: Record<string, unknown>): CustomPageInput {
  const bool = (v: unknown, fallback = false) =>
    typeof v === "boolean" ? v : fallback;

  return {
    slug: typeof patch.slug === "string" ? patch.slug : undefined,
    titleAr: typeof patch.titleAr === "string" ? patch.titleAr : undefined,
    titleEn: typeof patch.titleEn === "string" ? patch.titleEn : undefined,
    titleTr: typeof patch.titleTr === "string" ? patch.titleTr : undefined,
    bodyAr: typeof patch.bodyAr === "string" ? patch.bodyAr : undefined,
    bodyEn: typeof patch.bodyEn === "string" ? patch.bodyEn : undefined,
    sections: Array.isArray(patch.sections)
      ? (patch.sections as CustomPageInput["sections"])
      : undefined,
    seoTitle:
      typeof patch.seoTitle === "string"
        ? patch.seoTitle
        : typeof patch.seoTitleAr === "string"
          ? patch.seoTitleAr
          : undefined,
    seoDescription:
      typeof patch.seoDescription === "string"
        ? patch.seoDescription
        : typeof patch.seoDescriptionAr === "string"
          ? patch.seoDescriptionAr
          : undefined,
    published: bool(patch.published, true),
    showInHeader: bool(patch.showInHeader, false),
    showInFooter: bool(patch.showInFooter, false),
  };
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : [];

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

    const system = `أنت محرر صفحات لموقع الريان للسياحة (Alrayyan Tourism).
يمكنك إنشاء صفحات مخصصة تظهر في الموقع على المسار /p/[slug].

إذا طلب المستخدم إنشاء صفحة أو كتابة مقدمة لتأجير السيارات أو الترانسفير:
أعد أيضاً كتلة JSON داخل \`\`\`json ... \`\`\` بالحقول:
{
  "slug": "latin-kebab-slug",
  "titleAr": "...",
  "titleEn": "...",
  "titleTr": "...",
  "bodyAr": "<p>HTML عربي</p>",
  "bodyEn": "<p>English HTML</p>",
  "sections": [
    { "id": "sec_hero", "type": "heading", "titleAr": "", "titleEn": "" },
    { "id": "sec_body", "type": "text", "bodyAr": "", "bodyEn": "" }
  ],
  "seoTitle": "...",
  "seoDescription": "...",
  "published": true,
  "showInHeader": false,
  "showInFooter": false
}

قواعد:
- العربي أولاً ثم الإنجليزي
- HTML بسيط: p, h2, h3, ul, li, strong — بدون سكربتات
- slug لاتيني قصير (مثل cancellation-policy أو cars-guide)
- showInHeader / showInFooter حسب طلب المستخدم فقط
- published=true إلا إذا طلب مسودة
- لا تخترع أسعاراً أو أرقاماً رسمية`;

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
          temperature: 0.6,
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

    const patch = extractJsonBlock(text);
    let page = null;
    let created = false;
    if (patch && (patch.titleAr || patch.titleEn || patch.slug)) {
      const input = toPageInput(patch);
      const saved = await upsertCustomPageBySlug(input);
      if (saved.ok) {
        page = saved.page;
        created = saved.created;
      } else {
        return NextResponse.json({
          ok: true,
          reply: text,
          page: null,
          saveError: saved.error,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      reply: text,
      page,
      created,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
