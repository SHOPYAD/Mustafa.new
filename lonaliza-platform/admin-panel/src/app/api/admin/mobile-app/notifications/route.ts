import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getMobilePushTemplates,
  saveMobilePushTemplate,
  deleteMobilePushTemplate,
  getMobilePushCampaigns,
  dispatchPushCampaign,
  type MobilePushTemplate,
} from "@/lib/server/mobile-push-store";
import { resolveGeminiApiKey } from "@/lib/server/gemini";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const [templates, campaigns] = await Promise.all([
    getMobilePushTemplates(),
    getMobilePushCampaigns(),
  ]);

  return NextResponse.json({ ok: true, templates, campaigns });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const action = body.action || "save_template";

    if (action === "save_template") {
      const template = body.template;
      if (!template?.titleAr || !template?.bodyAr) {
        return NextResponse.json({ ok: false, error: "العنوان ونص الإشعار مطلوبان" }, { status: 400 });
      }
      const saved = await saveMobilePushTemplate(template);
      return NextResponse.json({ ok: true, template: saved });
    }

    if (action === "delete_template") {
      const id = String(body.id || "");
      if (!id) return NextResponse.json({ ok: false, error: "المعرف مطلوب" }, { status: 400 });
      const deleted = await deleteMobilePushTemplate(id);
      return NextResponse.json({ ok: true, deleted });
    }

    if (action === "dispatch") {
      const { title, body: pushBody, targetRoute, templateId } = body;
      if (!title || !pushBody) {
        return NextResponse.json({ ok: false, error: "العنوان ونص الإشعار مطلوبان" }, { status: 400 });
      }
      const campaign = await dispatchPushCampaign({
        title,
        body: pushBody,
        targetRoute,
        templateId,
      });
      return NextResponse.json({ ok: true, campaign, message: "تم إرسال الإشعار بنجاح لكافة مستخدمي التطبيق!" });
    }

    if (action === "ai_generate") {
      const prompt = String(body.prompt || "عروض فلاش سياحية لتركيا ودبي والخليج").trim();
      const { apiKey } = await resolveGeminiApiKey();

      // Fallback high-converting templates if API key is not configured
      if (!apiKey) {
        const fallback: Partial<MobilePushTemplate> = {
          titleAr: `🔥 عرض فلاش خاص: خصم 30% على حجوزات ${prompt.slice(0, 20)}!`,
          titleEn: `🔥 Flash Deal: 30% OFF on ${prompt.slice(0, 20)}!`,
          bodyAr: "سارع بحجز رحلتك الآن عبر التطبيق واستمتع بأفضل الأسعار المضمونة.",
          bodyEn: "Book now via the app and lock the best verified prices.",
          badge: "خصم فلاش 30%",
          category: "flash_deal",
          targetRoute: "/flights",
        };
        const saved = await saveMobilePushTemplate(fallback as any);
        return NextResponse.json({ ok: true, template: saved, generatedBy: "rule-engine" });
      }

      const systemInstruction = `أنت وكيل الإشعارات التسويقية الذكية لتطبيق لوناليزا للجوال (Lonaliza Push Notification Expert).
مهمتك توليد إشعار هاتف ذكي مغرٍ وقصير يرفع معدل الفتح (CTR) بدون إزعاج أو ملل.
القواعد الصارمة:
1. العنوان بالعربية: جذاب ومباشر ولا يتجاوز 40 حرفاً ويحتوي إيموجي مناسباً في البداية.
2. نص الرسالة بالعربية: يركز على الفائدة والتوفير، لا يتجاوز 90 حرفاً.
3. العنوان والنص بالإنجليزية: ترجمة احترافية تسويقية.
4. الشارة (Badge): كبسولة تسويقية قصيرة مثل "عرض 25%"، "توفير فوري"، "فلاش ديل".
5. المسار المستهدف (Target Route): أحد المسارات التالية (/flights أو /hotels أو /account?tab=wallet أو /community).
أعد الناتج بتنسيق JSON فقط على الشكل التالي:
{
  "titleAr": "...",
  "titleEn": "...",
  "bodyAr": "...",
  "bodyEn": "...",
  "badge": "...",
  "category": "flash_deal",
  "targetRoute": "/flights"
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\nموضوع العرض المطلوب: ${prompt}` }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Gemini API returned status ${res.status}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText || "{}");

      const saved = await saveMobilePushTemplate({
        titleAr: parsed.titleAr || `🔥 عرض خاص: ${prompt}`,
        titleEn: parsed.titleEn || `🔥 Special Offer: ${prompt}`,
        bodyAr: parsed.bodyAr || "افتح تطبيق لوناليزا الآن واستفد من الخصم المباشر.",
        bodyEn: parsed.bodyEn || "Open Lonaliza app now for instant discounts.",
        badge: parsed.badge || "عرض فلاش",
        category: parsed.category || "flash_deal",
        targetRoute: parsed.targetRoute || "/flights",
      });

      return NextResponse.json({ ok: true, template: saved, generatedBy: "gemini-2.0-flash" });
    }

    return NextResponse.json({ ok: false, error: "إجراء غير معروف" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
