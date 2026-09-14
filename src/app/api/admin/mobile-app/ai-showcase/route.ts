import { NextRequest, NextResponse } from "next/server";
import { resolveGeminiApiKey } from "@/lib/server/gemini";

interface ShowcaseSlideTemplate {
  id: string;
  category: string;
  headlineAr: string;
  subheadlineAr: string;
  headlineEn: string;
  badgeAr: string;
  themeGradient: string;
  mockupFrame: "titanium-gold" | "titanium-black" | "silver-luxury" | "minimal-notch";
  accentColor: string;
  defaultBgImage?: string;
}

const LUXURY_TEMPLATES: ShowcaseSlideTemplate[] = [
  {
    id: "flights-vip",
    category: "flights",
    headlineAr: "احجز طيرانك بضغطة زر مع أسعار حصرية",
    subheadlineAr: "مقارنة فورية بين أكثر من 500 شركة طيران عالمية مع تأكيد فوري",
    headlineEn: "Instant Flight Bookings with VIP Rates",
    badgeAr: "طيران وفنادق VIP",
    themeGradient: "from-[#140522] via-[#2a0e50] to-[#0d0218]",
    mockupFrame: "titanium-gold",
    accentColor: "#F59E0B",
    defaultBgImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1080&q=80",
  },
  {
    id: "cashback-wallet",
    category: "wallet",
    headlineAr: "كاش باك نقدي حقيقي يدخل محفظتك فوراً",
    subheadlineAr: "استرداد نقدي فوري على كل حجز فندقي أو رحلة طيران يمكنك سحبه أو إعادة استخدامه",
    headlineEn: "Real Cash Back Directly Into Your Wallet",
    badgeAr: "المحفظة الذكية",
    themeGradient: "from-[#0f172a] via-[#1e1b4b] to-[#140522]",
    mockupFrame: "titanium-gold",
    accentColor: "#10B981",
    defaultBgImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080&q=80",
  },
  {
    id: "ai-concierge",
    category: "ai",
    headlineAr: "مستشارك السياحي الذكي 24/7",
    subheadlineAr: "ذكاء اصطناعي لتخطيط جدول الرحلة وحجز الفنادق والجولات خطوة بخطوة",
    headlineEn: "Your 24/7 AI Luxury Travel Concierge",
    badgeAr: "مساعد الذكاء الاصطناعي",
    themeGradient: "from-[#180829] via-[#3b126d] to-[#140522]",
    mockupFrame: "titanium-black",
    accentColor: "#FBBF24",
    defaultBgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80",
  },
  {
    id: "turkey-tours",
    category: "tours",
    headlineAr: "أفخم الجولات السياحية والسيارات الخاصة VIP",
    subheadlineAr: "سيارات مرسيدس فيانو VIP مع سائق خاص يتحدث العربية في كافة مدن تركيا",
    headlineEn: "Private VIP Chauffeurs & Exclusive Tours",
    badgeAr: "سيارات خاصة VIP",
    themeGradient: "from-[#1a0c2e] via-[#2d124d] to-[#140522]",
    mockupFrame: "titanium-gold",
    accentColor: "#F59E0B",
    defaultBgImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1080&q=80",
  },
  {
    id: "luxury-hotels",
    category: "hotels",
    headlineAr: "منتجعات وفنادق 5 نجوم مع إطلالات ساحرة",
    subheadlineAr: "إقامة مريحة وفاخرة بأسعار تفضيلية وضمان أفضل سعر",
    headlineEn: "Curated 5-Star Hotels & Resorts",
    badgeAr: "إقامة ملوكية",
    themeGradient: "from-[#12071f] via-[#240b3b] to-[#0a0212]",
    mockupFrame: "silver-luxury",
    accentColor: "#EC4899",
    defaultBgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1080&q=80",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const category = body?.category || "all";

    const { apiKey } = await resolveGeminiApiKey();

    if (apiKey && prompt) {
      try {
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `أنت خبير ASO وتسويق تطبيقات سياحية فاخرة (App Store & Google Play Showcase).
المطلوب صياغة 4 شاشات تسويقية جذابة جداً بالمواصفات التالية:
- هوية فاخرة لتطبيق "لوناليزا للسياحة والسفر VIP"
- إبراز (طيران وفنادق، كاش باك محفظة فورية، مستشار AI، سيارات وسائق خاص VIP)
- الفكرة أو الطلب الإضافي: "${prompt}"

أعد النتيجة بصيغة JSON فقط كالتالي بدون علامات ماركداون:
[
  {
    "id": "slide_1",
    "category": "flights",
    "headlineAr": "عنوان قصير جذاب جداً (4 إلى 6 كلمات)",
    "subheadlineAr": "وصف تسويقي مكمل مقنع وموجز (10 إلى 15 كلمة)",
    "headlineEn": "Short compelling English headline",
    "badgeAr": "شارة صغيرة",
    "themeGradient": "from-[#140522] via-[#2a0e50] to-[#0d0218]",
    "mockupFrame": "titanium-gold",
    "accentColor": "#F59E0B"
  }
]`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1200,
              },
            }),
          }
        );

        if (aiResponse.ok) {
          const aiJson = await aiResponse.json();
          const text = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return NextResponse.json({
                ok: true,
                slides: parsed,
                source: "gemini_ai",
              });
            }
          }
        }
      } catch (aiErr) {
        console.warn("Gemini Showcase Generation failed, using luxury templates", aiErr);
      }
    }

    // Fallback: Filter or return luxury templates
    let filtered = LUXURY_TEMPLATES;
    if (category && category !== "all") {
      filtered = LUXURY_TEMPLATES.filter((t) => t.category === category);
      if (filtered.length === 0) filtered = LUXURY_TEMPLATES;
    }

    return NextResponse.json({
      ok: true,
      slides: filtered,
      source: "luxury_templates",
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
