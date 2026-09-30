import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { assertOriginOnly } from "@/lib/server/deployment-role";
import { generateGeminiContent } from "@/lib/server/gemini-swarm-client";

export const runtime = "nodejs";

const PLATFORM_FACTS = `
منصة لوناليزا (Lonaliza) هي منصة سياحية سحابية متكاملة للشركات بنظام الوايت ليبل (SaaS White-Label):
- محرك حجز فنادق يضم أكثر من 500,000 فندق مع أسعار الجملة B2B وتأكيد فوري للغرف.
- محرك طيران يربط أكثر من 400 شركة طيران عالمية بدون اشتراط تراخيص IATA.
- محرك رحلات وجولات وسيارات خاصة VIP مع سائق في تركيا والشرق الأوسط وأوروبا.
- بوابات دفع إلكترونية متعددة (Stripe, PayPal, PayTR, Iyzico, MyFatoorah, Tap, بنوك محلية).
- خلية وكلاء ذكاء اصطناعي (AI Swarm) لخدمة العملاء، الرد الآلي على واتساب بلهجات متعددة، إدارة المبيعات، وإنتاج المحتوى.
- تطبيق ويب تقدمي PWA فائق السرعة يعمل بهوية وشعار الوكالة.
- رابط الديمو الحي: https://lonaliza.com/demo
`;

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    assertOriginOnly("Reseller Scraper AI Studio API");
    const body = (await req.json()) as {
      mode: "template" | "skills_rules";
      prompt: string;
      channel?: "whatsapp" | "email";
      targetAgent?: string;
      existingContext?: string;
    };

    if (!body.prompt?.trim()) {
      return NextResponse.json({ ok: false, error: "النص المطلوب فارغ" }, { status: 400 });
    }

    if (body.mode === "template") {
      const channel = body.channel || "whatsapp";
      const systemInstruction = `
أنت كبير كتاب الإعلانات والمبيعات B2B لمنصة لوناليزا السياحية.
صمم قوالب تسويقية مقنعة وجذابة للشركات ووكالات السياحة والسفر.
التزم فقط بميزات لوناليزا الحقيقية التالية دون أي مبالغة أو تخريف:
${PLATFORM_FACTS}

القواعد الإلزامية:
1. استخدم المتغيرات التالية داخل النص: {company_name}، {city}، {demo_url}.
2. للقناة ${channel}: ${channel === "whatsapp" ? "اكتب رسالة واتساب أنيقة ومختصرة مع إيموجي مدروس دون تكلف" : "اكتب عنوان بريد جذاب وجسم رسالة تسويقية رسمية مقنعة"}.
3. أرجع النتيجة بتنسيق JSON حصراً:
{
  "title": "عنوان وصفي للقالب",
  "subject": "عنوان البريد إن وجد",
  "category": "whitelabel",
  "body": "نص الرسالة المنسق",
  "variables": ["company_name", "city", "demo_url"],
  "tip": "نصيحة تسويقية مختصرة"
}
`;

      const aiRes = await generateGeminiContent<{
        title: string;
        subject?: string;
        category?: string;
        body: string;
        variables: string[];
        tip?: string;
      }>({
        systemInstruction,
        prompt: `طلب المدير: "${body.prompt}"\nالسياق الحالي إن وجد: "${body.existingContext || ""}"`,
        responseMimeType: "application/json",
        temperature: 0.4,
      });

      if (aiRes.ok && aiRes.data) {
        return NextResponse.json({ ok: true, result: aiRes.data });
      }

      return NextResponse.json(
        { ok: false, error: aiRes.error || "فشل الذكاء الاصطناعي في صياغة القالب" },
        { status: 500 }
      );
    }

    if (body.mode === "skills_rules") {
      const targetAgent = body.targetAgent || "sales";
      const systemInstruction = `
أنت مهندس أنظمة الذكاء الاصطناعي والمشرف على خلية وكلاء لوناليزا (AI Swarm).
مهمتك صياغة مهارة (Skill) أو قاعدة صارمة (Rule) لوكيل النظام (${targetAgent}).
تعتمد على الحقائق التالية فقط:
${PLATFORM_FACTS}

قواعد هندسة الأوامر:
- اجعل المهارة تشرح للوكيل كيف يتصرف وخطوات إقناع العميل بأسلوب بشري راقٍ دون روبوتية.
- اجعل القاعدة تمنع اختراع الأرقام، وتمنع الوعود غير الحقيقية، وتلزم الوكيل بتحويل المحادثة لموظف بشري عند الضرورة.
- أرجع النتيجة بتنسيق JSON حصراً:
{
  "type": "skill" أو "rule",
  "title": "عنوان المهارة أو القاعدة",
  "markdown": "شرح مفصل ومحكم بالماركداون للمهارة أو القاعدة",
  "rationale": "سبب وأثر هذه الإضافة"
}
`;

      const aiRes = await generateGeminiContent<{
        type: "skill" | "rule";
        title: string;
        markdown: string;
        rationale?: string;
      }>({
        systemInstruction,
        prompt: `طلب المشرف لإنشاء مهارة أو قاعدة: "${body.prompt}"\nالسياق الحالي: "${body.existingContext || ""}"`,
        responseMimeType: "application/json",
        temperature: 0.3,
      });

      if (aiRes.ok && aiRes.data) {
        return NextResponse.json({ ok: true, result: aiRes.data });
      }

      return NextResponse.json(
        { ok: false, error: aiRes.error || "فشل الذكاء الاصطناعي في صياغة المهارة/القاعدة" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: false, error: "وضع غير مدعوم" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
