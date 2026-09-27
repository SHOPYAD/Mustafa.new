import { NextRequest, NextResponse } from "next/server";
import { resolveVisaIntelligence } from "@/lib/visa-intelligence";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userMessage = String(body.userMessage || body.message || "").trim();
    const nationality = String(body.nationality || "SA").toUpperCase();
    const originCity = String(body.originCity || "الرياض").trim();
    const pkg = body.packageData || {};
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];
    const locale = String(body.locale || "ar");
    const isAr = locale === "ar";

    if (!userMessage) {
      return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 });
    }

    const destination = pkg.destination || "وجهتك السياحية";
    const country = pkg.country || "البلد المضيف";
    const durationDays = Number(pkg.durationDays) || 5;
    const currentPrice = Number(pkg.price) || 1542;
    const currency = pkg.currency || "USD";

    // 1. Get accurate visa intelligence for this traveler
    const visaInfo = resolveVisaIntelligence(nationality, country, destination);

    // 2. Check if user is asking to MODIFY or EXTEND the trip
    const isModifyIntent =
      /تعديل|غير|أضف|زيد|نقص|أيام|يوم|فندق|طيران|تخصيص|برنامج جديد|modify|change|add|days|hotel|customize/i.test(
        userMessage
      );

    let updatedProgram: any = null;
    let replyText = "";

    if (isModifyIntent) {
      // Detect requested days
      const daysMatch = userMessage.match(/(\d+)\s*(أيام|ايام|يوم|days?)/i);
      let newDays = durationDays;
      if (daysMatch && daysMatch[1]) {
        const parsed = parseInt(daysMatch[1], 10);
        if (parsed >= 2 && parsed <= 30) {
          newDays = parsed;
        }
      } else if (/أضف يوم|زيد يوم|يوم إضافي|add a day|one more day/i.test(userMessage)) {
        newDays = durationDays + 1;
      } else if (/أضف يومين|زيد يومين|add two days/i.test(userMessage)) {
        newDays = durationDays + 2;
      } else if (/نقص يوم|قلل يوم|reduce a day/i.test(userMessage)) {
        newDays = Math.max(3, durationDays - 1);
      }

      // Re-calculate price scaled per day
      const baseDailyRate = Math.round(currentPrice / durationDays);
      const recalculatedPrice = Math.round(baseDailyRate * newDays);

      const updatedTitle = isAr
        ? `${destination} — برنامج سياحي مخصص VIP (${newDays} أيام)`
        : `${destination} — Bespoke VIP Program (${newDays} Days)`;

      updatedProgram = {
        modified: true,
        originalDays: durationDays,
        durationDays: newDays,
        originalPrice: currentPrice,
        price: recalculatedPrice,
        currency,
        title: updatedTitle,
        destination,
        country,
        perPersonPrice: Math.round(recalculatedPrice / 2),
        modificationNote: isAr
          ? `تم تحديث مدة الرحلة إلى ${newDays} أيام وتعديل السعر الإجمالي إلى $${recalculatedPrice.toLocaleString()} لشخصين شاملة كافة الخدمات VIP.`
          : `Trip duration updated to ${newDays} days, total price adjusted to $${recalculatedPrice.toLocaleString()} for 2 adults all-inclusive VIP.`,
      };

      replyText = isAr
        ? `يسعدني جداً تلبية رغبتك! قمت بتعديل برنامج الرحلة فوراً:\n\n✨ **المدة الجديدة:** ${newDays} أيام / ${Math.max(1, newDays - 1)} ليالي.\n💰 **السعر الإجمالي المحدث:** $${recalculatedPrice.toLocaleString()} (يشمل شخصين بكل الخدمات، الطيران، الفندق، وسيارة فيتو VIP بسائق خاص).\n\nلقد قمت بحقن هذا التعديل في الخلفية. يمكنك الآن الضغط على زر **«الانتقال إلى مخطط البرنامج الكامل»** لاستعراض وتعديل كل يوم بالتفصيل، أو الضغط على **«احجز هذا البرنامج المعدل الآن»** لتأكيد الحجز الفوري!`
        : `Delighted to customize your trip! I have updated your package itinerary:\n\n✨ **New Duration:** ${newDays} Days / ${Math.max(1, newDays - 1)} Nights.\n💰 **Updated Total Price:** $${recalculatedPrice.toLocaleString()} for 2 guests all-inclusive.\n\nThe updated program is now saved. Click **"Explore in Full Planner"** to fine-tune your itinerary or **"Book Custom Program Now"** to confirm immediately!`;
    } else {
      // User asking advice / visa / recommendations
      const isVisaQuery = /فيزا|تأشيرة|جواز|دخول|شروط|visa|passport|entry/i.test(userMessage);

      if (isVisaQuery) {
        replyText = isAr
          ? `بصفتي مستشارك الخاص لرحلة ${destination}، إليك تفاصيل التأشيرة والدخول المعتمدة:\n\n📌 **حالة التأشيرة لجنسيتك:** ${visaInfo.badgeAr}\n${visaInfo.summaryAr}\n\n✅ **المتطلبات الأساسية:**\n${visaInfo.conditionsAr.map((c) => `• ${c}`).join("\n")}\n\n💡 **توصيات وإرشادات لوناليزا:**\n${visaInfo.advisoryTipsAr.map((t) => `• ${t}`).join("\n")}\n\nجميع حجوزات الطيران والفنادق التي تصدرها لك لوناليزا مؤكدة ومعتمدة 100% لتسهيل سفرك!`
          : `As your personal VIP travel advisor for ${destination}, here are the visa requirements:\n\n📌 **Visa Status:** ${visaInfo.badgeEn}\n${visaInfo.summaryEn}\n\n✅ **Requirements:**\n${visaInfo.conditionsEn.map((c) => `• ${c}`).join("\n")}\n\n💡 **Expert Tips:**\n${visaInfo.advisoryTipsEn.map((t) => `• ${t}`).join("\n")}`;
      } else {
        // General travel, packing, weather or activities question
        replyText = isAr
          ? `أهلاً بك! بصفتي مستشارك السياحي المخصص لبرنامج "${pkg.title || destination}":\n\n${userMessage.includes("طقس") || userMessage.includes("ملابس") ? `الطقس في ${destination} رائع وممتع للجولات. يُنصح باصطحاب ملابس مريحة للتنقلات نهاراً وسترة خفيفة للمساء.` : ""}${userMessage.includes("عائل") || userMessage.includes("أطفال") ? `البرنامج مثالي جداً للعائلات والأطفال، حيث خصصنا سيارة مرسيدس فيتو VIP عائلية واسعة بسائق محترف يرافقكم طوال 10 ساعات يومياً، مع زيارة أفضل الحدائق والمزارات الترفيهية.` : ""}${userMessage.includes("فندق") || userMessage.includes("إقامة") ? `الفنادق المعتمدة في هذه الباقة هي فنادق 5 نجوم ديلوكس مجربة وموثوقة مع بوفيه إفطار يومي فاخر مشمول وخدمة كونسيرج 24/7.` : ""}\n\nهل تود مني تعديل أي تفاصيل في خطة الأيام، أو تغيير الفندق، أو إضافة أنشطة خاصة لبرنامجك؟ فقط أخبرني وسأقوم بتعديل البرنامج لك على الفور!`
          : `Welcome! As your dedicated travel advisor for "${pkg.title || destination}":\n\nThe itinerary is tailored for exceptional comfort with private luxury transportation, premium 5-star accommodations, and flexible pacing. Would you like me to adjust the duration, upgrade your hotel, or add custom activities? Just let me know!`;
      }
    }

    return NextResponse.json({
      ok: true,
      reply: replyText,
      visaInfo,
      updatedProgram,
    });
  } catch (err: any) {
    console.error("[PackageAdvisor] Error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to process advisor request",
      },
      { status: 500 }
    );
  }
}
