import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  resolveGeminiApiKey,
  getGeminiPublicConfig,
} from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import { getBranding } from "@/lib/server/branding-store";
import type { BrandingPatch } from "@/types/branding";

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

function toPatch(raw: Record<string, unknown>): BrandingPatch | null {
  if (!raw || typeof raw !== "object") return null;
  const patch: BrandingPatch = {};
  const strings = [
    "logoUrl",
    "faviconUrl",
    "brandNameAr",
    "brandNameEn",
    "brandNameTr",
  ] as const;
  for (const key of strings) {
    if (typeof raw[key] === "string") patch[key] = raw[key] as string;
  }
  if (typeof raw.showWordmark === "boolean") {
    patch.showWordmark = raw.showWordmark;
  }
  if (raw.colors && typeof raw.colors === "object") {
    patch.colors = raw.colors as BrandingPatch["colors"];
  }
  if (raw.sections && typeof raw.sections === "object") {
    patch.sections = raw.sections as BrandingPatch["sections"];
  }
  if (raw.hero && typeof raw.hero === "object") {
    patch.hero = raw.hero as BrandingPatch["hero"];
  }
  if (Array.isArray(raw.replaceHeroSlides)) {
    patch.replaceHeroSlides = raw.replaceHeroSlides as BrandingPatch["replaceHeroSlides"];
  }
  if (Array.isArray(raw.replaceSideCards)) {
    patch.replaceSideCards = raw.replaceSideCards as BrandingPatch["replaceSideCards"];
  }
  if (Array.isArray(raw.replaceExtraTexts)) {
    patch.replaceExtraTexts = raw.replaceExtraTexts as BrandingPatch["replaceExtraTexts"];
  }
  if (Array.isArray(raw.replaceExtraImages)) {
    patch.replaceExtraImages = raw.replaceExtraImages as BrandingPatch["replaceExtraImages"];
  }
  if (raw.upsertHeroSlide && typeof raw.upsertHeroSlide === "object") {
    patch.upsertHeroSlide = raw.upsertHeroSlide as BrandingPatch["upsertHeroSlide"];
  }
  if (typeof raw.removeHeroSlideId === "string") {
    patch.removeHeroSlideId = raw.removeHeroSlideId;
  }
  if (raw.upsertSideCard && typeof raw.upsertSideCard === "object") {
    patch.upsertSideCard = raw.upsertSideCard as BrandingPatch["upsertSideCard"];
  }
  if (typeof raw.removeSideCardId === "string") {
    patch.removeSideCardId = raw.removeSideCardId;
  }
  return Object.keys(patch).length > 0 ? patch : null;
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

    const current = await getBranding();

    const system = `أنت محرر هوية بصرية (براندينج) لموقع الريان للسياحة (Alrayyan Tourism).
يمكنك اقتراح تعديلات على: الشعار، اسم العلامة، الألوان، إظهار أقسام الصفحة الرئيسية، ومحتوى الهيرو.

أعد دائماً:
1) رداً عربياً قصيراً يوضح المقترح
2) كتلة JSON داخل \`\`\`json ... \`\`\` بصيغة BrandingPatch

قواعد الدمج (مهم جداً):
- أرسل فقط الحقول التي يجب تغييرها — لا تُرجع كائن البراندينج كاملاً إلا إذا طُلب إعادة الضبط صراحة
- لا ترسل مصفوفات فارغة ولا تستبدل الهيرو بالكامل إلا إذا طلب المستخدم ذلك
- لإضافة/تعديل شريحة واحدة استخدم upsertHeroSlide
- لحذف شريحة استخدم removeHeroSlideId
- لإظهار/إخفاء أقسام استخدم sections: { "hero": true, "search": false, ... }
- الألوان بصيغة hex مثل #10b981
- showWordmark افتراضياً false — لا تُظهر الكلمة بجانب الشعار إلا إذا طلب المستخدم
- العربي أولاً ثم الإنجليزي ثم التركي
- الأسعار أرقام بالدولار (USD)
- الصور: روابط https أو مسارات محلية تبدأ بـ /
- لا تخترع نظام دفع ولا تلمس إعدادات الطيران/الترانسفير

أقسام الصفحة المسموحة:
hero, search, destinations, flashDeals, extraSections, stats, features, visa, packages, hotels, flightDeals, carRentalDeals, transferOffers, vipDailyTours, testimonials, trust, partners, blog, cta

الحالة الحالية (مرجع فقط، لا تنسخها كاملة):
${JSON.stringify({
  brandNameAr: current.brandNameAr,
  brandNameEn: current.brandNameEn,
  showWordmark: current.showWordmark,
  colors: current.colors,
  sections: current.sections,
  slideIds: current.hero.slides.map((s) => s.id),
  sideCardIds: current.hero.sideCards.map((s) => s.id),
})}`;

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
          temperature: 0.5,
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

    const extracted = extractJsonBlock(text);
    const patch = extracted ? toPatch(extracted) : null;

    return NextResponse.json({
      ok: true,
      reply: text,
      patch,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
