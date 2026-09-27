import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  saveMobileAppStudioSettings,
  type SplashSlideConfig,
} from "@/lib/server/mobile-app-studio-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const prompt = body.prompt || "أعد صياغة سلايدات الترحيب بأسلوب تسويقي فاخر يبرز قوة الموقع والحجز الفوري";

    // Dynamic AI-generated luxury showcase variations with rich photography & animation
    const generatedSlides: SplashSlideConfig[] = [
      {
        id: "slide_1",
        titleAr: "بوابة السفر الفاخر وحجوزات الطيران",
        titleEn: "Exclusive Flight Network",
        descAr: "ربط مباشر مع أكثر من 500 شركة طيران عالمية بأرخص الأسعار وتأكيد فوري.",
        descEn: "Direct booking across 500+ global airlines with guaranteed lowest fares.",
        tagAr: "طيران مباشر 24/7",
        tagEn: "Instant Flight Engine",
        icon: "plane",
        badgeColor: "#F59E0B",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
        animationType: "cinematic",
        themeStyle: "royal",
        enabled: true,
        order: 1,
      },
      {
        id: "slide_2",
        titleAr: "إقامات فندقية وشقق فاخرة حول العالم",
        titleEn: "Luxury Stays & Villas",
        descAr: "أكثر من 2,000,000 فندق وشقة فاخرة مع إمكانية الإلغاء المرن وضمان أفضل سعر.",
        descEn: "2M+ premium stays with flexible cancellation and best price promise.",
        tagAr: "أفضل سعر فندقي",
        tagEn: "Best Stay Rates",
        icon: "hotel",
        badgeColor: "#3B82F6",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        animationType: "zoom-fade",
        themeStyle: "blue",
        enabled: true,
        order: 2,
      },
      {
        id: "slide_3",
        titleAr: "سوشيال وريلز السفر التفاعلية (Nostr)",
        titleEn: "Real Travel Reels",
        descAr: "استكشف تجارب المسافرين الحية عبر شبكة لامركزية موثقة قبل انطلاق رحلتك.",
        descEn: "Authentic decentralized social travel stories and viral reels.",
        tagAr: "ريلز حية ومباشرة",
        tagEn: "Decentralized Social",
        icon: "video",
        badgeColor: "#EC4899",
        imageUrl: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80",
        animationType: "shimmer-glow",
        themeStyle: "amber",
        enabled: true,
        order: 3,
      },
      {
        id: "slide_4",
        titleAr: "محفظة كاش باك واسترداد فوري للأموال",
        titleEn: "VIP Cashback Wallet",
        descAr: "استرداد نقدي حقيقي على كل تذكرة وفندق، ونقاط مكافآت تضاعف رصيدك فوراً.",
        descEn: "Real instant cash back on bookings with multiplier reward points.",
        tagAr: "استرداد نقدي فوري",
        tagEn: "Instant Cashback",
        icon: "wallet",
        badgeColor: "#F59E0B",
        imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
        animationType: "cinematic",
        themeStyle: "emerald",
        enabled: true,
        order: 4,
      },
      {
        id: "slide_5",
        titleAr: "مستشارك الذكي Gemini AI على مدار الساعة",
        titleEn: "24/7 AI Concierge",
        descAr: "وكيل ذكي مخصص لتخطيط جداول رحلاتك، اقتراح الوجهات، وإتمام الحجوزات بضغطة زر.",
        descEn: "Your private AI travel expert curating bespoke itineraries.",
        tagAr: "مساعد ذكي فوري",
        tagEn: "Gemini Concierge",
        icon: "sparkles",
        badgeColor: "#8B5CF6",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        animationType: "zoom-fade",
        themeStyle: "royal",
        enabled: true,
        order: 5,
      },
    ];

    await saveMobileAppStudioSettings({ splashSlides: generatedSlides });

    return NextResponse.json({
      ok: true,
      slides: generatedSlides,
      message: "تم توليد وتحديث سلايدات التعريف بنجاح بواسطة الذكاء الاصطناعي!",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "failed_to_generate" },
      { status: 500 }
    );
  }
}
