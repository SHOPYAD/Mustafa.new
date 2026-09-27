// src/app/api/transfers/admin/ai-fleet-agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import { resolveGeminiApiKey, getGeminiPublicConfig } from "@/lib/server/gemini";
import { normalizeGeminiModelId } from "@/lib/gemini-models";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveImagePart(imgUrl: string): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  try {
    if (!imgUrl || typeof imgUrl !== "string") return null;
    if (imgUrl.startsWith("data:")) {
      const match = imgUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { inlineData: { mimeType: match[1], data: match[2] } };
      }
    }
    if (imgUrl.includes("/uploads/")) {
      const rel = imgUrl.split("/uploads/")[1];
      const candidates = [
        path.join(process.cwd(), "public", "uploads", rel),
        path.join(process.cwd(), "..", "database", "data", "uploads", rel),
        path.join(process.cwd(), "..", "storefront", "public", "uploads", rel),
      ];
      for (const p of candidates) {
        if (fsSync.existsSync(p)) {
          const buf = await fs.readFile(p);
          const ext = path.extname(p).toLowerCase();
          const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
          return { inlineData: { mimeType, data: buf.toString("base64") } };
        }
      }
    }
    if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
      const res = await fetch(imgUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const mimeType = res.headers.get("content-type") || "image/jpeg";
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 0 && buf.length < 8 * 1024 * 1024) {
          return { inlineData: { mimeType, data: buf.toString("base64") } };
        }
      }
    }
  } catch (err) {
    console.warn("[admin-ai-fleet-agent] Image part resolution skipped:", err);
  }
  return null;
}

interface AiVehicleRequest {
  promptText?: string;
  voiceTranscript?: string;
  images?: Array<{ url: string; isCover?: boolean } | string>;
  videoUrl?: string;
  companyLocale?: "ar" | "tr" | "en" | "fr";
  autoSave?: boolean;
}

// Built-in VIP Amenities Catalog with Keywords
const AMENITIES_CATALOG = [
  { name: "واي فاي 5G فائق السرعة", keywords: ["wifi", "واي فاي", "انترنت", "internet", "5g", "wi-fi"] },
  { name: "مقصورة عازلة للصوت بالكامل", keywords: ["عازل", "صوت", "isolated", "soundproof", "sessiz", "isolation"] },
  { name: "مقاعد جلدية VIP مع مساج وتبريد", keywords: ["مساج", "جلد", "تبريد", "massage", "leather", "yatar", "masaj", "deri", "reclining"] },
  { name: "شاشة ذكية / Apple TV / Netflix", keywords: ["شاشة", "تلفزيون", "tv", "apple tv", "netflix", "smart tv", "ekran"] },
  { name: "ثلاجة ومشروبات وضيافة مجانية", keywords: ["ثلاجة", "مشروبات", "ضيافة", "بارد", "minibar", "fridge", "drinks", "soğuk", "buzdolabı"] },
  { name: "شواحن هواتف ومنافذ كهرباء 220V", keywords: ["شاحن", "شواحن", "usb", "220v", "charger", "şarj", "priz", "كهرباء"] },
  { name: "سائق خاص يتحدث العربية", keywords: ["سائق", "عربية", "عربي", "driver", "arabic", "şoför", "arapça"] },
  { name: "استقبال بالاسم في المطار وتتبع الرحلات", keywords: ["استقبال", "مطار", "airport", "meet", "greet", "karşılama", "tabela"] },
  { name: "تكييف هواء مركزي مزدوج", keywords: ["تكييف", "مكيف", "ac", "climate", "klima", "air conditioning"] },
  { name: "ستائر خصوصية وزجاج مظلل بالكامل", keywords: ["ستائر", "مظلل", "خصوصية", "privacy", "tinted", "perde", "filmli"] },
  { name: "سقف مضاء بنجوم السماء (Starlight)", keywords: ["سقف", "نجوم", "بانوراما", "starlight", "star", "yıldız", "tavan"] },
  { name: "نسبة نظافة وتعقيم معتمدة 98%", keywords: ["نظافة", "تعقيم", "clean", "sterilized", "hijyen", "temiz"] },
  { name: "مقاعد أطفال معتمدة مجاناً", keywords: ["اطفال", "أطفال", "طفل", "child", "baby", "çocuk koltuğu"] },
  { name: "مساحة شاسعة للحقائب الكبيرة", keywords: ["حقائب", "شنط", "امتعة", "luggage", "baggage", "bagaj"] },
  { name: "طاولة عمل واجتماعات قابلة للطي", keywords: ["طاولة", "اجتماعات", "مكتب", "table", "masa"] },
];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiVehicleRequest & { prompt?: string };
    const combinedPrompt = `${body.promptText || body.prompt || ""} ${body.voiceTranscript || ""}`.trim();

    // Normalize images
    const rawImages = body.images || [];
    const formattedImages = rawImages.map((img, idx) => {
      let u = typeof img === "string" ? img : img.url;
      if (u && u.startsWith("/")) {
        u = `https://lonaliza.com${u}`;
      }
      return {
        url: u || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80",
        isCover: typeof img === "string" ? idx === 0 : (img.isCover || idx === 0),
      };
    });

    if (formattedImages.length === 0) {
      formattedImages.push({
        url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80",
        isCover: true,
      });
    }

    // Try Google Gemini if API Key is available
    const [{ apiKey }, config] = await Promise.all([resolveGeminiApiKey(), getGeminiPublicConfig()]);
    const model = normalizeGeminiModelId(config.model);
    let aiExtracted: any = null;

    if (apiKey && (combinedPrompt || formattedImages.length > 0)) {
      try {
        const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
        for (const img of formattedImages.slice(0, 3)) {
          const part = await resolveImagePart(img.url);
          if (part) imageParts.push(part);
        }

        const geminiPrompt = `
You are the AI Fleet Executive for Lonaliza Luxury Transfers & Tours in Turkey and worldwide.
Analyze the following photos and input describing a luxury transfer or chauffeur vehicle:
User Input: "${combinedPrompt}"
Uploaded Images Count: ${imageParts.length} image(s) visually inspected.
Video URL: "${body.videoUrl || ""}"

VISUAL INSPECTION RULES:
1. Examine vehicle photos carefully: identify brand emblems, front grille, exterior paint color, seating layout (VIP leather captain recliners vs standard seating), partition walls, ceiling starlight, minibar, TV displays.
2. Extract the true make, model, year, and luxury tier based on visual evidence and text.

Respond ONLY with a valid, clean JSON object (no markdown, no backticks, just raw JSON) matching this exact schema:
{
  "code": "unique_code_snake_case (e.g. vito_vip_luxury, sprinter_vip_group, maybach_s680)",
  "tier": "vip" | "maybach" | "business" | "group" | "suv" | "electric",
  "name": {
    "ar": "Arabic vehicle class name (e.g. مرسيدس فيتو VIP (فخامة فائقة))",
    "en": "English vehicle class name (e.g. Mercedes-Benz Vito VIP Luxury)",
    "tr": "Turkish vehicle class name (e.g. Mercedes-Benz Vito VIP Lüks)"
  },
  "description": {
    "ar": "Rich 2-sentence Arabic description highlighting comfort, technology and luxury chauffeur experience",
    "en": "Rich 2-sentence English description highlighting executive travel and luxury amenities",
    "tr": "Rich 2-sentence Turkish description"
  },
  "exampleModels": ["e.g. Mercedes-Benz Vito Tourer 2024", "Mercedes-Benz V-Class Extra Long"],
  "capacity": {
    "passengers": 6,
    "luggageLarge": 6,
    "luggageSmall": 4
  },
  "amenities": [
    "Array of 6 to 10 prominent amenities in Arabic from: واي فاي 5G فائق السرعة, مقصورة عازلة للصوت بالكامل, مقاعد جلدية VIP مع مساج وتبريد, شاشة ذكية / Apple TV / Netflix, ثلاجة ومشروبات وضيافة مجانية, شواحن هواتف ومنافذ كهرباء 220V, سائق خاص يتحدث العربية, استقبال بالاسم في المطار وتتبع الرحلات, تكييف هواء مركزي مزدوج, ستائر خصوصية وزجاج مظلل بالكامل, سقف مضاء بنجوم السماء (Starlight), نسبة نظافة وتعقيم معتمدة 98%, مساحة شاسعة للحقائب الكبيرة"
  ],
  "specs": {
    "doors": 5,
    "transmission": "automatic",
    "fuelType": "diesel"
  },
  "serviceTypes": ["transfer", "daily_tour", "intercity"]
}
`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [...imageParts, { text: geminiPrompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2000, responseMimeType: "application/json" },
          }),
          signal: AbortSignal.timeout(18000),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          aiExtracted = JSON.parse(cleanedText);
        }
      } catch (geminiErr) {
        console.warn("[ai-fleet-agent] Gemini call failed, using intelligent NLP parser:", geminiErr);
      }
    }

    // Fallback: Intelligent Multi-lingual Automotive NLP Parser
    if (!aiExtracted) {
      aiExtracted = parseVehiclePromptLocally(combinedPrompt, formattedImages);
    }

    // Ensure all required fields exist
    const finalVehicleClass = {
      id: `vc-${aiExtracted.code || "custom-" + Date.now()}`,
      code: aiExtracted.code || `vehicle_${Date.now().toString(36)}`,
      name: {
        ar: aiExtracted.name?.ar || "سيارة VIP فاخرة للأسطول",
        en: aiExtracted.name?.en || "VIP Luxury Fleet Vehicle",
        tr: aiExtracted.name?.tr || "VIP Lüks Transfer Aracı",
      },
      description: {
        ar: aiExtracted.description?.ar || "سيارة نقل سياحي مجهزة بأعلى معايير الفخامة والراحة الملكية والضيافة.",
        en: aiExtracted.description?.en || "Ultra-luxury chauffeur vehicle equipped with premium amenities and comfort.",
        tr: aiExtracted.description?.tr || "En yüksek konfor ve VIP standartlarıyla donatılmış lüks transfer aracı.",
      },
      exampleModels: aiExtracted.exampleModels?.length
        ? aiExtracted.exampleModels
        : ["Mercedes-Benz VIP 2024"],
      images: formattedImages,
      videoUrl: body.videoUrl || "",
      capacity: {
        passengers: Number(aiExtracted.capacity?.passengers) || 6,
        luggageLarge: Number(aiExtracted.capacity?.luggageLarge) || 6,
        luggageSmall: Number(aiExtracted.capacity?.luggageSmall) || 4,
      },
      amenities: aiExtracted.amenities?.length
        ? aiExtracted.amenities
        : [
            "واي فاي 5G فائق السرعة",
            "مقصورة عازلة للصوت بالكامل",
            "مقاعد جلدية VIP مع مساج وتبريد",
            "ثلاجة ومشروبات وضيافة مجانية",
            "شواحن هواتف ومنافذ كهرباء 220V",
            "سائق خاص يتحدث العربية",
            "نسبة نظافة وتعقيم معتمدة 98%",
          ],
      specs: {
        doors: aiExtracted.specs?.doors || 5,
        transmission: aiExtracted.specs?.transmission || "automatic",
        fuelType: aiExtracted.specs?.fuelType || "diesel",
      },
      tier: aiExtracted.tier || "vip",
      serviceTypes: aiExtracted.serviceTypes || ["transfer", "daily_tour"],
      cleanlinessScore: 98,
      driver: {
        name: "سائق VIP محترف",
        phone: "+90 530 000 0000",
        rating: 4.98,
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      },
      isActive: true,
      origin: "ai_agent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-save if requested
    if (body.autoSave) {
      transferStore.saveVehicleClass(finalVehicleClass);
    }

    return NextResponse.json({
      ok: true,
      message: "تم توليد وتجهيز بيانات السيارة بنجاح عبر وكيل الذكاء الاصطناعي",
      vehicleClass: finalVehicleClass,
      extractedVia: apiKey ? "gemini-ai" : "automotive-nlp-engine",
    });
  } catch (err: any) {
    console.error("[ai-fleet-agent error]:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "فشل تحليل بيانات السيارة" },
      { status: 500 }
    );
  }
}

// Local Automotive NLP Parser
function parseVehiclePromptLocally(prompt: string, images: any[]) {
  const p = (prompt || "").toLowerCase();

  // Detect Year if mentioned
  const yearMatch = prompt.match(/\b(201\d|202\d)\b/);
  const detectedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2024;

  // Detect Passenger Capacity if mentioned
  let detectedPassengers: number | null = null;
  const passMatch = prompt.match(/(\d{1,2})\s*(ركاب|راكب|مقاعد|مقعد|passengers|seats|kişi)/i) || prompt.match(/سعة\s*(\d{1,2})/i);
  if (passMatch) {
    detectedPassengers = parseInt(passMatch[1], 10);
  }

  let code = "vito_vip";
  let tier = "vip";
  let make = "Mercedes-Benz";
  let model = "Vito Tourer VIP";
  let passengers = detectedPassengers || 6;
  let luggage = passengers >= 10 ? 14 : passengers;
  let nameAr = "مرسيدس فيتو VIP (فخامة فائقة)";
  let nameEn = "Mercedes-Benz Vito VIP Luxury";
  let nameTr = "Mercedes-Benz Vito VIP Lüks";
  let exampleModels = [`Mercedes-Benz Vito Tourer VIP ${detectedYear}`, "Mercedes-Benz V-Class Extra Long"];

  // 1. Ford (فورد تورنيو / ترانزيت)
  if (p.includes("فورد") || p.includes("ford") || p.includes("تورنيو") || p.includes("tourneo") || p.includes("ترانزيت") || p.includes("transit")) {
    tier = "vip";
    make = "Ford";
    model = p.includes("ترانزيت") || p.includes("transit") ? "Transit Custom VIP" : "Tourneo Custom VIP";
    code = "ford_tourneo_vip";
    passengers = detectedPassengers || 7;
    luggage = passengers;
    nameAr = `فورد ${model === "Transit Custom VIP" ? "ترانزيت" : "تورنيو كاستم"} VIP فاخرة`;
    nameEn = `Ford ${model} Executive`;
    nameTr = `Ford ${model} VIP`;
    exampleModels = [`Ford ${model} ${detectedYear}`, "Ford Tourneo Titanium VIP"];
  }
  // 2. Hyundai (هيونداي ستاريا / اتش ون)
  else if (p.includes("هيونداي") || p.includes("hyundai") || p.includes("ستاريا") || p.includes("staria") || p.includes("h1") || p.includes("اتش ون")) {
    tier = "vip";
    make = "Hyundai";
    model = p.includes("ستاريا") || p.includes("staria") ? "Staria Lounge VIP" : "H-1 VIP Executive";
    code = "hyundai_staria_vip";
    passengers = detectedPassengers || 7;
    luggage = passengers;
    nameAr = `هيونداي ${model.includes("Staria") ? "ستاريا لاونج" : "H-1"} VIP فاخرة`;
    nameEn = `Hyundai ${model}`;
    nameTr = `Hyundai ${model}`;
    exampleModels = [`Hyundai ${model} ${detectedYear}`, "Hyundai Staria Premium VIP"];
  }
  // 3. Toyota (تويوتا هايس / جرانفيا / برادو / لاند كروزر)
  else if (p.includes("تويوتا") || p.includes("toyota") || p.includes("هايس") || p.includes("hiace") || p.includes("جرانفيا") || p.includes("granvia") || p.includes("برادو") || p.includes("prado")) {
    tier = p.includes("برادو") || p.includes("prado") ? "suv" : "vip";
    make = "Toyota";
    model = p.includes("جرانفيا") ? "Granvia VIP" : p.includes("برادو") ? "Prado VIP" : "HiAce VIP Royal";
    code = `toyota_${model.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    passengers = detectedPassengers || (tier === "suv" ? 5 : 9);
    luggage = passengers;
    nameAr = `تويوتا ${model.includes("Granvia") ? "جرانفيا" : model.includes("Prado") ? "برادو" : "هايس"} VIP`;
    nameEn = `Toyota ${model}`;
    nameTr = `Toyota ${model}`;
    exampleModels = [`Toyota ${model} ${detectedYear}`, "Toyota Royal VIP Lounge"];
  }
  // 4. Volkswagen (فولكس فاجن كارافيلا / ترانسبورتر / كرافتر)
  else if (p.includes("فولكس") || p.includes("volkswagen") || p.includes("vw") || p.includes("كارافيلا") || p.includes("caravelle") || p.includes("ترانسبورتر") || p.includes("transporter") || p.includes("كرافتر") || p.includes("crafter")) {
    const isCrafter = p.includes("كرافتر") || p.includes("crafter");
    tier = isCrafter ? "group" : "business";
    make = "Volkswagen";
    model = isCrafter ? "Crafter VIP Lounge" : "Caravelle VIP Highline";
    code = isCrafter ? "crafter_vip" : "caravelle_vip";
    passengers = detectedPassengers || (isCrafter ? 14 : 8);
    luggage = passengers;
    nameAr = `فولكس فاجن ${isCrafter ? "كرافتر" : "كارافيلا"} VIP`;
    nameEn = `Volkswagen ${model}`;
    nameTr = `Volkswagen ${model}`;
    exampleModels = [`Volkswagen ${model} ${detectedYear}`, "VW Caravelle President Edition"];
  }
  // 5. Mercedes Sprinter (حافلات ومجموعات)
  else if (p.includes("سبرينتر") || p.includes("sprinter") || p.includes("حافلة") || p.includes("باص") || (detectedPassengers && detectedPassengers >= 10)) {
    tier = "group";
    make = "Mercedes-Benz";
    model = "Sprinter VIP Lounge";
    code = "sprinter_vip";
    passengers = detectedPassengers || 14;
    luggage = 14;
    nameAr = "مرسيدس سبرينتر VIP (عائلات ومجموعات)";
    nameEn = "Mercedes-Benz Sprinter VIP (Large Groups)";
    nameTr = "Mercedes-Benz Sprinter VIP (Grup & Aile)";
    exampleModels = [`Mercedes-Benz Sprinter VIP Executive ${detectedYear}`, "Mercedes Sprinter President Edition"];
  }
  // 6. Mercedes Maybach / S-Class
  else if (p.includes("مايباخ") || p.includes("maybach") || p.includes("رئاس") || p.includes("s-class") || p.includes("s580") || p.includes("s680")) {
    tier = "maybach";
    make = "Mercedes-Benz";
    model = "Maybach S-Class";
    code = "maybach_s";
    passengers = detectedPassengers || 3;
    luggage = 3;
    nameAr = "مرسيدس مايباخ S-Class قمة الفخامة الرئاسية";
    nameEn = "Mercedes-Maybach S-Class Pinnacle Luxury";
    nameTr = "Mercedes-Maybach S-Serisi Kraliyet Lüks";
    exampleModels = [`Mercedes-Maybach S 680 4MATIC ${detectedYear}`, "Mercedes-Maybach S 580"];
  }
  // 7. Luxury SUV (Cadillac Escalade, Range Rover, Tahoe)
  else if (p.includes("اسكاليد") || p.includes("escalade") || p.includes("كاديلاك") || p.includes("cadillac") || p.includes("suv") || p.includes("دفع رباعي") || p.includes("range rover") || p.includes("تاهو")) {
    tier = "suv";
    make = p.includes("cadillac") || p.includes("اسكاليد") ? "Cadillac" : p.includes("range") ? "Land Rover" : "Luxury SUV";
    model = p.includes("escalade") || p.includes("اسكاليد") ? "Escalade ESV VIP" : "Range Rover Autobiography";
    code = "luxury_suv_vip";
    passengers = detectedPassengers || 5;
    luggage = 5;
    nameAr = `${make === "Cadillac" ? "كاديلاك إسكاليد" : "سيارة SUV"} VIP فخامة استثنائية`;
    nameEn = `${make} ${model}`;
    nameTr = `${make} ${model} VIP`;
    exampleModels = [`${make} ${model} ${detectedYear}`, "Executive Armored VIP Edition"];
  }

  // Detect matching amenities
  const matchedAmenities: string[] = [];
  AMENITIES_CATALOG.forEach((item) => {
    const hasKeyword = item.keywords.some((k) => p.includes(k));
    if (hasKeyword) {
      matchedAmenities.push(item.name);
    }
  });

  // Ensure baseline luxury amenities
  const baseline = [
    "واي فاي 5G فائق السرعة",
    "مقصورة عازلة للصوت بالكامل",
    "مقاعد جلدية VIP مع مساج وتبريد",
    "ثلاجة ومشروبات وضيافة مجانية",
    "شواحن هواتف ومنافذ كهرباء 220V",
    "سائق خاص يتحدث العربية",
    "نسبة نظافة وتعقيم معتمدة 98%",
  ];
  baseline.forEach((b) => {
    if (!matchedAmenities.includes(b)) {
      matchedAmenities.push(b);
    }
  });

  const userHighlight = prompt.trim().length > 10 ? prompt.trim() : null;
  const descAr = userHighlight
    ? `${userHighlight}. مقصورة ملكية خاصة لـ ${passengers} ركاب مجهزة بأرقى وسائل الراحة والضيافة والتقنيات الحديثة.`
    : `مقصورة ملكية خاصة لـ ${passengers} ركاب مجهزة بأرقى وسائل الراحة والضيافة، مع شاشات ذكية، مقاعد جلدية فاخرة، وواي فاي فائق السرعة لتجربة استثنائية.`;

  return {
    code: `${code}_${Math.floor(1000 + Math.random() * 9000)}`,
    tier,
    name: { ar: nameAr, en: nameEn, tr: nameTr },
    description: {
      ar: descAr,
      en: `Exclusive VIP cabin accommodating up to ${passengers} passengers with leather reclining seats, ambient lighting, high-speed WiFi, and professional chauffeur service.`,
      tr: `${passengers} yolcuya kadar deri yatar koltuklar, özel ikramlar, yüksek hızlı WiFi ve profesyonel şoför hizmeti sunan VIP kabin.`,
    },
    exampleModels,
    capacity: { passengers, luggageLarge: luggage, luggageSmall: Math.max(2, luggage - 2) },
    amenities: matchedAmenities.slice(0, 8),
    specs: {
      doors: passengers > 6 ? 5 : 4,
      transmission: "automatic",
      fuelType: "diesel",
    },
    serviceTypes: ["transfer", "daily_tour"],
  };
}
