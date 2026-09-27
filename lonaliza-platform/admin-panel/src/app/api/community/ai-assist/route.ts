import { NextResponse } from "next/server";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import { GEMINI_DEFAULT_MODEL } from "@/lib/gemini-models";
import { defaultHotels } from "@/data/hotels";

export const runtime = "nodejs";

// Helper: match real hotel details from catalog if mentioned in user prompt
function findMatchingHotel(prompt: string, destination: string) {
  if (!prompt || typeof prompt !== "string") return null;
  const pLower = prompt.toLowerCase();

  for (const h of defaultHotels) {
    const nameArLower = (h.nameAr || "").toLowerCase();
    const nameEnLower = (h.nameEn || "").toLowerCase();
    const slug = (h.slug || "").toLowerCase();

    const arWords = nameArLower.split(/\s+/).filter((w) => w.length > 3 && !["فندق", "قصر", "منتجع"].includes(w));
    const isArMatch = arWords.some((w) => pLower.includes(w));
    const isEnMatch = nameEnLower.length > 3 && pLower.includes(nameEnLower.split(" ")[0].toLowerCase());

    if (isArMatch || isEnMatch || pLower.includes(slug)) {
      return {
        nameAr: h.nameAr,
        neighborhood: h.neighborhoodAr || h.city,
        highlights: (h.highlightsAr || []).slice(0, 4),
        description: h.descriptionAr,
        stars: h.stars,
      };
    }
  }

  return null;
}

async function toInlineImagePart(raw: string): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  try {
    if (!raw || typeof raw !== "string") return null;
    if (raw.startsWith("data:")) {
      const match = raw.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;
      return { inlineData: { mimeType: match[1] || "image/jpeg", data: match[2] } };
    }
    if (!/^https?:\/\//i.test(raw)) return null;
    const res = await fetch(raw, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 80 || buf.length > 5 * 1024 * 1024) return null;
    const mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    if (!mime.startsWith("image/")) return null;
    return { inlineData: { mimeType: mime, data: buf.toString("base64") } };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt = "",
      destination = "اسطنبول",
      category = "tours",
      booking, // { id, type, typeLabel, title, destination, date, refNumber }
      rating = 5,
      language = "ar",
      images = [],
      videos = [],
      visualFrames = [],
      mode = "compose", // "compose" | "improve" | "hashtags"
    } = body;

    const frameList = Array.isArray(visualFrames) ? visualFrames : [];
    const imageList = Array.isArray(images) ? images : [];
    const videoList = Array.isArray(videos) ? videos : [];
    const mediaCount = imageList.length + videoList.length + frameList.length;
    const hasMedia = mediaCount > 0;
    const bookingMeta = booking
      ? `بيانات الحجز المرفقة: العنوان=${booking.title || ""}، النوع=${booking.typeLabel || booking.type || ""}، الوجهة=${booking.destination || ""}، التاريخ=${booking.date || ""}، السعر=${booking.price || ""} ${booking.currency || ""}، رقم=${booking.id || booking.refNumber || ""}.`
      : "";
    const mediaContext = hasMedia
      ? `المسافر أرفق ${imageList.length} صورة و${videoList.length} فيديو. الصورتان/لقطات الفيديو مرفقة بصرياً — صف ما تراه فعلياً (المكان، الإضاءة، المرافق، الأشخاص إن وُجدوا، الأجواء) وادمجه مع بيانات الحجز. لا تختصر.`
      : "";

    // Clean destination
    const cleanDest = (booking?.destination || destination || "اسطنبول").replace(/[()]/g, "").trim();
    const destTag = cleanDest.replace(/\s+/g, "_") || "اسطنبول";

    // Detect service category accurately from prompt, category, or attached booking
    const combinedText = `${prompt} ${booking?.title || ""} ${booking?.typeLabel || ""} ${category}`.toLowerCase();
    const isYacht = /يخت|بحر|كروز|بوسفور|قارب|yacht|cruise|boat/i.test(combinedText);
    const isCar = /سيارة|سائق|تأجير|ترانسفير|توصيل|فان|مرسيدس|فيانو|car|transfer|sprinter/i.test(combinedText) || category === "cars" || category === "transfers";
    const isFlight = /طيران|تذكرة|مطار|رحلة جوية|flight/i.test(combinedText) || category === "flights";
    const isTour = !isYacht && !isCar && !isFlight && (/جولة|رحلة|برنامج|معالم|سفاري|يومية|شلال|مرتفعات|tour|activity|trip|safari/i.test(combinedText) || category === "tours" || category === "vip-tours" || category === "activities");
    const isHotel = !isYacht && !isCar && !isFlight && !isTour;

    const bookingTitle = booking?.title || "";
    const matchedHotel = isHotel ? findMatchingHotel(prompt || bookingTitle, cleanDest) : null;
    const serviceName = bookingTitle || matchedHotel?.nameAr || prompt.trim().split(/[\n,.]/)[0] || (
      isYacht ? `جولة يخت فاخر في ${cleanDest}` :
      isTour ? `جولة سياحية مميزة في ${cleanDest}` :
      isCar ? `خدمة سيارة خاصة وسائق في ${cleanDest}` :
      isFlight ? `رحلة طيران إلى ${cleanDest}` :
      `إقامة فندقية في ${cleanDest}`
    );

    const { apiKey } = await resolveGeminiApiKey();

    let serviceGuidelines = "";
    let defaultHashtags: string[] = [];

    if (isYacht) {
      serviceGuidelines = `نوع التجربة: جولة يخت خاص أو رحلة بحرية في ${cleanDest}.
العنوان المذكور: ${serviceName}.
القواعد الخاصة:
- اكتب بصيغة مسافر استمتع بجولة يخت خاصة ومميزة في مضيق البوسفور أو البحر.
- صف روعة الإبحار، الخصوصية، نسيم البحر العليل، هدوء الأمواج، والخدمة الراقية وضيافة كابتن اليخت وطاقمه.
- اذكر مشاهدة القصور التاريخية والجسور المعلقة وأنوار المدينة من الماء وقت الغروب.
- قدم نصيحة عملية للمسافرين (مثل حجز الجولة وقت الغروب، أو الاستمتاع بكوب الشاي أو القهوة التركية على متن اليخت).`;
      defaultHashtags = [`#${destTag}`, "#جولة_يخت", "#رحلة_بحرية", "#سياحة_فاخرة"];
    } else if (isTour) {
      serviceGuidelines = `نوع التجربة: جولة سياحية يومية أو برنامج سياحي في ${cleanDest}.
العنوان المذكور: ${serviceName}.
القواعد الخاصة:
- اكتب بصيغة مسافر قضى يوماً سياحياً ممتعاً ومريحاً مع عائلته أو أصدقائه.
- صف دقة المواعيد، راحة السيارة، لطف واحترافية المرشد أو السائق، وجمال المعالم الطبيعية أو التاريخية التي زارها.
- قدم نصيحة للمسافرين حول أفضل وقت للزيارة أو الأماكن التي تستحق التصوير.`;
      defaultHashtags = [`#${destTag}`, "#جولات_سياحية", "#تجارب_سفر", "#اكتشف_العالم"];
    } else if (isCar) {
      serviceGuidelines = `نوع التجربة: تأجير سيارة خاصة أو خدمة نقل وترانسفير VIP في ${cleanDest}.
العنوان المذكور: ${serviceName}.
القواعد الخاصة:
- اكتب بصيغة مسافر استمتع بخدمة سيارة فارهة وسائق خاص محترف.
- ركّز على نظافة السيارة، تكييفها الممتاز، دقة المواعيد، وسهولة التنقل بين المدن والمعالم بدون إرهاق.`;
      defaultHashtags = [`#${destTag}`, "#سيارة_خاصة", "#ترانسفير_VIP", "#راحة_المسافر"];
    } else if (isFlight) {
      serviceGuidelines = `نوع التجربة: حجز طيران وسفر جوي إلى ${cleanDest}.
العنوان المذكور: ${serviceName}.
القواعد الخاصة:
- اكتب عن سلاسة إجراءات السفر، دقة المواعيد، والوصول المريح.`;
      defaultHashtags = [`#${destTag}`, "#طيران", "#سفر_وسياحة"];
    } else {
      serviceGuidelines = `نوع التجربة: إقامة فندقية أو منتجع سياحي في ${cleanDest}.
العنوان المذكور: ${serviceName}.
القواعد الخاصة:
- اكتب بصيغة نزيل قضى إقامة مريحة في الفندق.
- صف الغرفة والإطلالة، النظافة والهدوء، جودة بوفيه الإفطار، وتعامل طاقم الاستقبال.`;
      defaultHashtags = [`#${destTag}`, "#تقييم_فنادق", "#إقامة_فاخرة", "#تجارب_سفر"];
    }

    const systemPrompt = `أنت تمثل مسافراً حقيقياً يدون مراجعته وتجربته الشخصية الواقعية في مجتمع السفر والسياحة.
${serviceGuidelines}

القواعد العامة الصارمة:
1. المنظور والضمير (First-Person Authentic Traveler):
   - اكتب دائماً بصيغة المتكلم المباشرة (مثال: "قضيت جولة لا تُنسى في...", "أشارككم تجربتي الأخيرة...", "بصراحة الخدمة والترتيب...", "أكثر ما نال إعجابي...").
2. النبرة الإنسانية والواقعية:
   - اكتب بأسلوب عربي طبيعي وسلس ومقنع، كشخص حقيقي يكتب تقييماً موثوقاً على منصات السفر العالمية وخرائط جوجل.
   - ابتعد تماماً عن الركاكة، والتراكيب المسرحية المصطنعة، والجمل الإنشائية المحشوة (مثل: "في الختام لا يسعني إلا أن أقول"، "سحر الشرق الأخاذ").
3. ممنوع منعاً باتاً:
   - يمنع قطعياً التحدث باسم شركة أو الترويج الإعلاني الفج. أنت مسافر يدون رأيه المستقل.
4. الالتزام بالمعطيات الحقيقية:
   - التزم بالخدمة الفعلية المحددة أعلاه (${serviceName}). إن كانت جولة يخت تحدث عن اليخت والبحر، وإن كانت جولة سياحية تحدث عن المعالم، وإن كان فندقاً تحدث عن الإقامة.
   - ادمج أي ملاحظات إضافية يذكرها المسافر.
5. الهيكل (مراجعة كاملة بلا سقف كلمات ضيق):
   - سطر أول جذاب يحدد التجربة والمدينة والانطباع العام.
   - أربع إلى ست فقرات غنية: ما رأيته في الصور/لقطات الفيديو، تفاصيل الحجز والخدمة، الأجواء والمرافق، لحظة مميزة، ثم نصيحة عملية للمسافرين.
   - وسوم هاشتاج مناسبة في النهاية.
   - الحد الأدنى عند وجود وسائط: 220 كلمة عربية. ممنوع الرد بجملة قصيرة أو تلخيص مخل.`;

    let userPrompt = "";
    if (mode === "hashtags") {
      userPrompt = `اقترح 5 هاشتاجات سفر طبيعية ومناسبة لـ: وجهة ${cleanDest} وتجربة ${serviceName}.`;
    } else if (mode === "improve") {
      userPrompt = `أعد صياغة مسودة التجربة التالية لتصبح مراجعة مسافر بشرية واقعية وثرية بالتفاصيل الدقيقة بضمير المتكلم عن (${serviceName}):
"${prompt}"
الوجهة: ${cleanDest}
${mediaContext}`;
    } else {
      userPrompt = `اكتب مراجعة مسافر واقعية طويلة بضمير المتكلم بناءً على المعطيات التالية:
- الخدمة / التجربة: ${serviceName}
- الوجهة: ${cleanDest}
- التقييم المعطى: ${rating} من 5 نجوم
- ملاحظات المسافر: "${prompt || "تجربة ممتازة وتنسيق رائع وخدمة راقية جداً"}"
${bookingMeta}
${mediaContext}
تأكد أن النص يتمحور تماماً حول ${serviceName} ويصف المشهد البصري إن وُجدت صور أو لقطات فيديو. لا تضع حداً قصيراً للكلمات.`;
    }

    if (apiKey) {
      try {
        const visualSources = [...frameList, ...imageList].slice(0, 6);
        const visualParts = (
          await Promise.all(visualSources.map((src) => toInlineImagePart(String(src))))
        ).filter(Boolean) as Array<{ inlineData: { mimeType: string; data: string } }>;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_DEFAULT_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [
                {
                  role: "user",
                  parts: [{ text: userPrompt }, ...visualParts],
                },
              ],
              generationConfig: {
                temperature: 0.75,
                maxOutputTokens: 8192,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text =
            data?.candidates?.[0]?.content?.parts
              ?.map((p: { text?: string }) => p.text || "")
              .join("")
              .trim() || "";

          if (text.length > 40) {
            const hashtagMatches = text.match(/#[\p{L}\p{N}_]+/gu) || [];
            return NextResponse.json({
              ok: true,
              text,
              hashtags: Array.from(new Set(hashtagMatches.length > 0 ? hashtagMatches : defaultHashtags)),
            });
          }
        }
      } catch {
        // fallback below
      }
    }

    // Dynamic, High-Quality Authentic Arabic Fallback Tailored to the EXACT Service
    let humanFallback = "";
    if (isYacht) {
      humanFallback =
        `أشارككم لقطات وتجربتي الاستثنائية في ${serviceName} (${cleanDest}) 🛥️🌊\n\n` +
        `بصراحة كانت جولة بحرية في قمة الروعة والفخامة؛ ${prompt ? prompt : "الإبحار في مضيق البوسفور وقت الغروب مشهد ساحر لا يُنسى، واليخت كان نظيفاً وواسعاً ومجهزاً بأعلى معايير الراحة والخصوصية مع طاقم محترف ومضياف للغاية"}.\n\n` +
        `استمتعنا برؤية القصور العثمانية والجسور المعلقة وأنوار المدينة التاريخية من قلب البحر، مع تقديم القهوة والشاي التركي وأجواء هادئة ومميزة تليق بالعائلات وكبار الشخصيات.\n\n` +
        `💡 نصيحة للمسافرين: احرصوا على حجز الجولة قبل الغروب بساعتين للاستمتاع بجمال النهار وتدرج ألوان الغروب الساحرة وانعكاس أضواء البوسفور ليلاً.\n\n` +
        defaultHashtags.join(" ");
    } else if (isTour) {
      humanFallback =
        `توثيق لجولتنا السياحية الرائعة في ${serviceName} (${cleanDest}) 🏔️✨\n\n` +
        `كان يوماً سياحياً متكاملاً وممتعاً؛ ${prompt ? prompt : "الانطلاق كان بالموعد المحدد في سيارة VIP مريحة ومكيفة، وكان السائق خبيراً بالطرق ولطيفاً جداً، حيث أخذنا إلى أجمل الإطلالات الطبيعية والمعالم الحيوية بعيداً عن الزحام"}.\n\n` +
        `المناظر الطبيعية والتقاط الصور التذكارية وسط الأجواء المنعشة تجربة لا تمل وتستحق التكرار في كل رحلة.\n\n` +
        `💡 نصيحة للمسافرين: ابدأوا الجولة مبكراً في الصباح للاستمتاع بالهدوء واستثمار كل لحظة في زيارة كافة المعالم المقررة براحة تامة.\n\n` +
        defaultHashtags.join(" ");
    } else if (isCar) {
      humanFallback =
        `تجربتي مع خدمة التنقل والسيارة الخاصة في ${cleanDest} 🚘✨\n\n` +
        `خدمة راقية ودقيقة بالمواعيد بكل ما تعنيه الكلمة؛ ${prompt ? prompt : "السيارة كانت حديثة ونظيفة ومجهزة بإنترنت ومقاعد مريحة للغاية، والسائق محترف ودود وملتزم بالمسارات المحددة دون أي تأخير"}.\n\n` +
        `سهلت علينا التنقل مع الحقائب والعائلة بكل أريحية وسلاسة تامة دون عناء البحث عن وسائل نقل أخرى.\n\n` +
        `💡 نصيحة للمسافرين: ترتيب خدمة الاستقبال والتوصيل مسبقاً يوفر الكثير من الوقت والجهد ويضمن بداية رحلة مريحة ومطمئنة.\n\n` +
        defaultHashtags.join(" ");
    } else if (isFlight) {
      humanFallback =
        `تجربة السفر وحجز الطيران إلى ${cleanDest} ✈️🌍\n\n` +
        `الحمد لله كانت الرحلة سلسة ومريحة؛ ${prompt ? prompt : "إجراءات الحجز وإصدار التذاكر كانت سريعة ودقيقة، ومواعيد الإقلاع والوصول كانت منتظمة ومثالية"}.\n\n` +
        `بداية ممتازة لرحلة سياحية نتمنى أن تكون مليئة بالذكريات الجميلة والتجارب الممتعة.\n\n` +
        defaultHashtags.join(" ");
    } else {
      humanFallback =
        `أشارككم مراجعتي وتجربتي خلال الإقامة في ${serviceName} (${cleanDest}) ✨\n\n` +
        `بصراحة كانت تجربة ممتازة وتستحق التوثيق؛ ${prompt ? prompt : "الاستقبال كان سريعاً ولطيفاً والغرفة نظيفة وواسعة ومجهزة بكل ما يحتاجه المسافر لضمان إقامة هادئة ومريحة"}.\n\n` +
        `أكثر ما نال إعجابي هو مستوى الخدمة والنظافة، وموقع المكان الممتاز الذي يسهل الوصول منه إلى المعالم الحيوية والمطاعم المجاورة.\n\n` +
        `💡 نصيحة للمسافرين: يُفضل دائماً التنسيق المسبق وطلب غرف في الأدوار العليا للحصول على إطلالة أجمل وهدوء أكبر أثناء الإقامة.\n\n` +
        defaultHashtags.join(" ");
    }

    return NextResponse.json({
      ok: true,
      text: humanFallback,
      hashtags: defaultHashtags,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
