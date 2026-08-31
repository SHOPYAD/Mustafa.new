import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  resolveGeminiApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import {
  IMPORT_SERVICE_TYPES,
  importSchemaPrompt,
  type ImportServiceType,
} from "@/lib/import-schemas";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function isImportType(v: unknown): v is ImportServiceType {
  return (
    typeof v === "string" &&
    (IMPORT_SERVICE_TYPES as readonly string[]).includes(v)
  );
}

/** Best-effort fetch of public page text + image URLs (many sites block scrapers). */
async function fetchPageContext(url: string): Promise<{
  ok: boolean;
  text: string;
  images: string[];
  note: string;
}> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AlrayyanTourismBot/1.0; +https://lonaliza.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) {
      return {
        ok: false,
        text: "",
        images: [],
        note: `HTTP ${res.status} — الصفحة محمية؛ سيعتمد Gemini على الرابط ومعرفته.`,
      };
    }
    const html = await res.text();
    const images = Array.from(
      html.matchAll(
        /(?:og:image["'\s]+content=["']|src=["'])(https?:\/\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)[^"'\s>]*)/gi
      )
    )
      .map((m) => m[1])
      .filter(Boolean)
      .slice(0, 40);

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 28000);

    return {
      ok: true,
      text,
      images: [...new Set(images)],
      note: `تم جلب ${text.length} حرفاً و ${images.length} صورة من الصفحة.`,
    };
  } catch (e) {
    return {
      ok: false,
      text: "",
      images: [],
      note: `تعذر الجلب المباشر (${e instanceof Error ? e.message : "error"}) — سيستخدم Gemini الرابط وبحث Google إن أمكن.`,
    };
  }
}

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  const raw =
    match?.[1]?.trim() || (text.trim().startsWith("{") ? text.trim() : "");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractUrls(messages: ChatMessage[]): string[] {
  const urls: string[] = [];
  const re = /https?:\/\/[^\s<>"')\]]+/gi;
  for (const m of messages) {
    const found = m.content.match(re);
    if (found) urls.push(...found.map((u) => u.replace(/[.,;]+$/, "")));
  }
  return [...new Set(urls)];
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const serviceType = body.serviceType;
    if (!isImportType(serviceType)) {
      return NextResponse.json(
        {
          ok: false,
          error: `serviceType must be one of: ${IMPORT_SERVICE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

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
            "مفتاح Gemini غير مُعدّ. احفظه من إعدادات الذكاء الاصطناعي.",
        },
        { status: 400 }
      );
    }

    const config = await getGeminiPublicConfig();
    const model = normalizeGeminiModelId(config.model);
    const urls = extractUrls(messages);
    const primaryUrl = typeof body.url === "string" && body.url.trim()
      ? body.url.trim()
      : urls[0] || "";

    let pageNote = "لم يُمرَّر رابط.";
    let pageText = "";
    let pageImages: string[] = [];
    if (primaryUrl) {
      const page = await fetchPageContext(primaryUrl);
      pageNote = page.note;
      pageText = page.text;
      pageImages = page.images;
    }

    const schema = importSchemaPrompt(serviceType);

    const system = `أنت مساعد استيراد خدمات لوكالة الريان للسياحة / Alrayyan Tourism (لوحة التحكم).
مهمتك: من رابط أو وصف يزوّده الأدمن، استخرج بيانات ${serviceType} كاملة وأعد كائناً جاهزاً للحفظ.

قواعد صارمة:
1) أعد دائماً JSON داخل \`\`\`json بالشكل:
{
  "reply": "ملخص عربي قصير بما تم استخراجه",
  "action": "create",
  "serviceType": "${serviceType}",
  "item": { ... حسب المخطط أدناه ... }
}
2) انسخ كل التفاصيل الممكنة: صور، غرف، أسعار، تقييمات، مميزات، سياسات.
3) إن وُجدت صور في سياق الصفحة استخدم روابطها الحقيقية https.
4) إن حُجبت الصفحة، استخدم معرفتك + بحث Google عن نفس المنشأة/الخدمة واملأ أفضل تقدير واقعي، واذكر ذلك في reply.
5) الاسم والوصف ثنائي اللغة (Ar/En) قدر الإمكان.
6) لا تترك item فارغاً إذا طُلبت الإضافة.
7) whatsappNumber الافتراضي إن لم يوجد: 905321796763
8) isActive: true

مخطط item لـ ${serviceType}:
${schema}

رابط المصدر: ${primaryUrl || "(لا يوجد)"}
ملاحظة الجلب: ${pageNote}
صور مكتشفة (${pageImages.length}): ${JSON.stringify(pageImages.slice(0, 25))}
مقتطف الصفحة (قد يكون فارغاً):
${pageText || "(غير متاح)"}
`;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    async function callGemini(withSearch: boolean) {
      const payload: Record<string, unknown> = {
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.35, maxOutputTokens: 8192 },
      };
      if (withSearch) {
        payload.tools = [{ google_search: {} }];
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return { res, data };
    }

    let { res, data } = await callGemini(true);
    if (!res.ok) {
      ({ res, data } = await callGemini(false));
    }
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

    const parsed = extractJson(text);
    const reply =
      (typeof parsed?.reply === "string" && parsed.reply) ||
      text.replace(/```json[\s\S]*?```/g, "").trim() ||
      "تم التحليل.";

    const item =
      parsed?.item && typeof parsed.item === "object"
        ? (parsed.item as Record<string, unknown>)
        : null;

    // Merge discovered images if model returned few
    if (item && Array.isArray(item.images) && pageImages.length) {
      const imgs = item.images as string[];
      const merged = [...new Set([...imgs, ...pageImages])].slice(0, 50);
      item.images = merged;
    }

    return NextResponse.json({
      ok: true,
      reply,
      action: parsed?.action || (item ? "create" : "none"),
      serviceType,
      item,
      sourceUrl: primaryUrl || null,
      fetchNote: pageNote,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
