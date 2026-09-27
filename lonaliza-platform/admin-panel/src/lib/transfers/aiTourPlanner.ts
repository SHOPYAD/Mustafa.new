// src/lib/transfers/aiTourPlanner.ts
/**
 * Lonaliza AI Tour Assistant & PDF Itinerary Generator
 * Interactive planning for daily tours by hours in Turkey, producing
 * tailored itineraries and printable multi-lingual vouchers for the driver app.
 */

export interface TourPlanStop {
  time: string;
  name: string;
  kind: "sightseeing" | "photo_stop" | "meal" | "shopping" | "viewpoint" | "relax";
  stayMinutes: number;
  description: string;
  tips?: string;
}

export interface GeneratedTourPlan {
  city: string;
  hours: number;
  theme: string;
  title: string;
  summary: string;
  stops: TourPlanStop[];
  driverNotes: string;
  includedAmenities: string[];
}

/**
 * Intelligent rules-based Tour Generator covering all Turkish tourist hubs.
 * Generates custom programs based on city, requested hours, and customer vibe.
 */
export function generateSmartTourProgram(params: {
  city: string;
  hours: number;
  vibe?: "family" | "nature" | "historic" | "luxury_shopping" | "adventure";
  language?: "ar" | "en" | "tr";
}): GeneratedTourPlan {
  const city = (params.city || "Istanbul").toLowerCase();
  const hours = Math.max(4, Math.min(14, Number(params.hours) || 8));
  const lang = params.language || "ar";
  const vibe = params.vibe || "family";

  if (city.includes("trabzon") || city.includes("طرابزون")) {
    return buildTrabzonPlan(hours, lang, vibe);
  } else if (city.includes("antalya") || city.includes("أنطاليا")) {
    return buildAntalyaPlan(hours, lang, vibe);
  } else if (city.includes("bursa") || city.includes("بورصة")) {
    return buildBursaPlan(hours, lang, vibe);
  } else if (city.includes("sapanca") || city.includes("سبانجا")) {
    return buildSapancaPlan(hours, lang, vibe);
  } else {
    return buildIstanbulPlan(hours, lang, vibe);
  }
}

function buildIstanbulPlan(hours: number, lang: "ar" | "en" | "tr", vibe: string): GeneratedTourPlan {
  const isAr = lang === "ar";
  const stops: TourPlanStop[] = [
    {
      time: "09:30",
      name: isAr ? "استقبال من الفندق والانطلاق نحو البوسفور" : "Hotel Pickup & Bosphorus Scenic Drive",
      kind: "sightseeing",
      stayMinutes: 20,
      description: isAr ? "استقبال السائق الخاص والتوجه نحو الضفة الأوروبية لمضيق البوسفور." : "Chauffeur meet at hotel lobby with bottled water and start driving along the European shoreline.",
    },
    {
      time: "10:00",
      name: isAr ? "قصر دولما بهجة الفاخر (قصر السلاطين)" : "Dolmabahce Palace Visit",
      kind: "sightseeing",
      stayMinutes: 90,
      description: isAr ? "استكشاف حدائق وقاعات القصر الإمبراطوري العثماني الأجمل المطل مباشرة على البحر." : "Explore the magnificent Ottoman imperial palace on the water's edge.",
    },
    {
      time: "11:45",
      name: isAr ? "أورتاكوي والتقاط الصور تحت جسر البوسفور" : "Ortakoy Square & Bosphorus Bridge",
      kind: "photo_stop",
      stayMinutes: 50,
      description: isAr ? "الاستمتاع بإطلالة جامع أورتاكوي، التقاط صور تذكارية مميزة، وتجربة البطاطا المشوية (الكومبير)." : "Iconic photo stop by the historical mosque right beneath the suspension bridge.",
    },
    {
      time: "13:00",
      name: isAr ? "وجبة غداء راقية مع إطلالة بحرية" : "Panoramic Bosphorus Lunch",
      kind: "meal",
      stayMinutes: 75,
      description: isAr ? "تناول أشهى المأكولات التركية أو البحرية في مطعم فاخر يوصي به السائق." : "Enjoy authentic Turkish gastronomy with sweeping sea views.",
    },
    {
      time: "14:30",
      name: isAr ? "تل العرائس (تشامليجا) وأعلى قمة في إسطنبول" : "Camlica Hill & Great Mosque Viewpoint",
      kind: "viewpoint",
      stayMinutes: 70,
      description: isAr ? "الصعود إلى أعلى قمة تطل على قارتي آسيا وأوروبا مع جلسة شاي تركي تقليدي." : "Ascend to the Asian side's highest hill for a 360-degree panorama of Istanbul.",
    },
  ];

  if (hours >= 10) {
    stops.push({
      time: "16:00",
      name: isAr ? "تسوق حر في زورلو سنتر أو استينيا بارك" : "Luxury Shopping at Zorlu Center / IstinyePark",
      kind: "shopping",
      stayMinutes: 110,
      description: isAr ? "وقت حر للتسوق في أرقى الماركات العالمية وشراء الهدايا التذكارية." : "Leisure shopping at Turkey's premier luxury fashion and dining hub.",
    });
  }

  stops.push({
    time: hours >= 10 ? "18:15" : "16:15",
    name: isAr ? "العودة والتوصيل إلى باب الفندق" : "Hotel Return & Farewell",
    kind: "relax",
    stayMinutes: 30,
    description: isAr ? "رحلة مريحة وآمنة في سيارة فيتو VIP عائدين إلى الفندق." : "Relaxed return drive to your hotel.",
  });

  return {
    city: "Istanbul",
    hours,
    theme: isAr ? "بانوراما البوسفور والقصور التاريخية والتسوق الراقي" : "Bosphorus Grandeur & Royal Palaces",
    title: isAr ? `برنامج جولة إسطنبول الخاصة VIP (${hours} ساعات)` : `Istanbul VIP Private Day Tour (${hours} Hours)`,
    summary: isAr
      ? "برنامج سياحي متكامل مصمم بعناية ليضمن لكم تجربة فخمة لا تُنسى في إسطنبول مع مرسيدس فيتو VIP وسائق خاص."
      : "A curated VIP chauffeured tour itinerary giving you the ultimate Istanbul luxury experience.",
    stops,
    driverNotes: isAr
      ? "يرجى من السائق الالتزام بالوقوف في المواقف المخصصة، وتقديم المياه المعدنية المبردة، ومساعدة الضيوف في حمل المقتنيات."
      : "Driver instruction: Please provide cold refreshments, open vehicle doors, and adhere strictly to agreed timings.",
    includedAmenities: isAr
      ? ["سيارة مرسيدس فيتو VIP مكيفة", "سائق خاص متعدد اللغات", "الوقود ومواقف السيارات", "مياه معدنية وإنترنت 5G"]
      : ["Mercedes Vito VIP with Chauffeur", "Fuel & Toll Fees Included", "Free High-Speed WiFi & Chilled Water"],
  };
}

function buildTrabzonPlan(hours: number, lang: "ar" | "en" | "tr", vibe: string): GeneratedTourPlan {
  const isAr = lang === "ar";
  return {
    city: "Trabzon",
    hours,
    theme: isAr ? "سحر أوزنجول ومرتفعات الشمال التركي الخضراء" : "Uzungol Alpine Lake & Highlands Escape",
    title: isAr ? `برنامج جولة طرابزون وأوزنجول الخاصة VIP (${hours} ساعات)` : `Trabzon & Uzungol VIP Tour (${hours} Hours)`,
    summary: isAr
      ? "رحلة طبيعية خلابة تجمع بين بحيرة أوزنجول الساحرة، مزارع الشاي، والشلالات الجبلية العذبة."
      : "Breathtaking full-day excursion to Turkey's Black Sea emerald jewel.",
    stops: [
      {
        time: "09:00",
        name: isAr ? "الانطلاق من الفندق في طرابزون" : "Departure from Trabzon Hotel",
        kind: "sightseeing",
        stayMinutes: 15,
        description: isAr ? "استقبال السائق والتحرك على الطريق الساحلي الشرقي." : "Chauffeur meet and scenic coastal drive.",
      },
      {
        time: "10:00",
        name: isAr ? "زيارة مصنع الشاي وتذوق الشاي التركي الطازج" : "Surmene Tea Factory & Tasting",
        kind: "shopping",
        stayMinutes: 45,
        description: isAr ? "التعرف على صناعة الشاي في البحر الأسود وشراء أجود الأنواع." : "Learn Black Sea tea processing and taste fresh brews.",
      },
      {
        time: "11:30",
        name: isAr ? "الوصول إلى بحيرة أوزنجول وجولة حول ضفافها" : "Arrive at Uzungol Lake & Lakeside Walk",
        kind: "sightseeing",
        stayMinutes: 120,
        description: isAr ? "التجول حول البحيرة، استئجار القوارب الصغيرة، والتصوير التذكاري." : "Stroll around the scenic alpine lake and capture postcard views.",
      },
      {
        time: "13:45",
        name: isAr ? "غداء ريفي تركي وسط الطبيعة والشلالات" : "Highland Riverside Lunch",
        kind: "meal",
        stayMinutes: 75,
        description: isAr ? "تناول سمك السلمون المرقط الطازج والفطائر التركية مع إطلالة الجبال." : "Fresh mountain trout and authentic Black Sea cuisine.",
      },
      {
        time: "15:15",
        name: isAr ? "المطل الزجاجي المرتفع وبانوراما البحيرة" : "Glass Skywalk & Aerial Panorama",
        kind: "viewpoint",
        stayMinutes: 60,
        description: isAr ? "الصعود بالسيارة إلى أعلى قمة مطلة على بحيرة أوزنجول لالتقاط أروع الصور." : "Panoramic aerial overlook with sweeping valley views.",
      },
      {
        time: "17:00",
        name: isAr ? "العودة الآمنة إلى فندق طرابزون" : "Return to Trabzon Hotel",
        kind: "relax",
        stayMinutes: 60,
        description: isAr ? "العودة بالسيارة الفاخرة والتوصيل لباب الفندق." : "Relaxing return drive with comfort stop.",
      },
    ],
    driverNotes: isAr
      ? "توجيهات السائق: القيادة بحذر في المنعطفات الجبلية، مساعدة الضيوف عند النزول، والالتزام بأوقات الراحة."
      : "Chauffeur notes: Drive safely on highland curves and offer umbrella assistance if weather turns misty.",
    includedAmenities: isAr
      ? ["سيارة فيتو VIP 4x4", "سائق خبير بمرتفعات طرابزون", "الوقود ومواقف السيارات", "مياه باردة مجانية"]
      : ["Mercedes Vito VIP Luxury Van", "Expert Mountain Chauffeur", "All Tolls & Fuel Included"],
  };
}

function buildAntalyaPlan(hours: number, lang: "ar" | "en" | "tr", vibe: string): GeneratedTourPlan {
  const isAr = lang === "ar";
  return {
    city: "Antalya",
    hours,
    theme: isAr ? "شلالات دودين وكالتشي التاريخية وساحل الريفييرا" : "Antalya Waterfalls & Historic Old Town",
    title: isAr ? `برنامج جولة أنطاليا VIP الخاصة (${hours} ساعات)` : `Antalya Riviera VIP Tour (${hours} Hours)`,
    summary: isAr ? "استكشاف شلالات دودين الهادرة، مدينة كاليتشي العتيقة، ومارينا اليخوت الفاخرة." : "Explore breathtaking Mediterranean cascades and ancient Roman gates in supreme comfort.",
    stops: [
      { time: "09:30", name: isAr ? "الاستقبال من الفندق" : "Hotel Pickup", kind: "sightseeing", stayMinutes: 15, description: isAr ? "الاستقبال والتنقل نحو الساحل الشرقي." : "Chauffeur pickup." },
      { time: "10:15", name: isAr ? "شلالات دودين السفلية المصبة بالبحر" : "Lower Duden Waterfall to Sea", kind: "photo_stop", stayMinutes: 60, description: isAr ? "مشهد سقوط المياه من الجرف الصخري مباشرة إلى مياه البحر الأبيض المتوسط." : "Dramatic cascade plunging 40 meters straight into the Mediterranean." },
      { time: "11:45", name: isAr ? "البلدة القديمة (كاليتشي) وبوابة هادريان" : "Kaleiçi Historic Quarter & Hadrian Gate", kind: "sightseeing", stayMinutes: 90, description: isAr ? "المشي في الأزقة العثمانية المرصوفة بالحصى وزيارة المارينا القديمة." : "Wander cobbled alleys and Roman architecture." },
      { time: "13:30", name: isAr ? "غداء في مارينا اليخوت" : "Marina Seafood Lunch", kind: "meal", stayMinutes: 75, description: isAr ? "غداء بحري فاخر على ضفاف البحر." : "Waterfront fresh seafood lunch." },
      { time: "15:00", name: isAr ? "تلفريك جبل تونيك تيبي (Olympos Teleferik)" : "Tunektepe Cable Car Viewpoint", kind: "viewpoint", stayMinutes: 90, description: isAr ? "ركوب التلفريك لمشاهدة خليج أنطاليا بالكامل من أعلى السحاب." : "Cable car ride up the cliff with endless sea panorama." },
      { time: "17:00", name: isAr ? "العودة للفندق" : "Return to Hotel", kind: "relax", stayMinutes: 30, description: isAr ? "توصيل مريح إلى فندقك في أنطاليا." : "Drop-off at your hotel." },
    ],
    driverNotes: isAr ? "توجيهات السائق: تبريد المقصورة جيداً لتناسب مناخ أنطاليا وتوفير مناديل مبللة منعشة." : "Keep cabin well air-conditioned and offer chilled refreshments.",
    includedAmenities: isAr ? ["مرسيدس VIP مكيفة تكييفاً مركزياً", "سائق محترف", "الوقود ومواقف السيارات"] : ["Full AC Mercedes VIP", "Chauffeur & Fuel"],
  };
}

function buildBursaPlan(hours: number, lang: "ar" | "en" | "tr", vibe: string): GeneratedTourPlan {
  const isAr = lang === "ar";
  return {
    city: "Bursa",
    hours,
    theme: isAr ? "بورصة الخضراء، جبل أولوداغ، وأطول تلفريك في العالم" : "Green Bursa & Uludag Mountain Cable Car",
    title: isAr ? `برنامج جولة بورصة وجبل أولوداغ VIP (${hours} ساعات)` : `Green Bursa & Uludag VIP Tour (${hours} Hours)`,
    summary: isAr ? "رحلة ممتعة تشمل ركوب أطول تلفريك إلى جبل أولوداغ، تذوق حلوى الحلقوم التركي وكباب إسكندر الشهير." : "Iconic mountain tour featuring the world-famous cable car and authentic Iskender kebab.",
    stops: [
      { time: "08:30", name: isAr ? "الانطلاق من إسطنبول عبر جسر عثمان غازي المعلق" : "Departure via Osmangazi Bridge", kind: "sightseeing", stayMinutes: 90, description: isAr ? "رحلة سريعة ومريحة عبر رابع أطول جسر معلق في العالم." : "High-speed crossing over the Marmara gulf." },
      { time: "10:30", name: isAr ? "محطة تلفريك بورصة والصعود لجبل أولوداغ" : "Bursa Teleferik Cable Car to Peak", kind: "viewpoint", stayMinutes: 120, description: isAr ? "تجربة ركوب أطول تلفريك في العالم بين الغابات الكثيفة حتى قمة الجبل الثلجي." : "World's longest cable car ride up to Uludag pine forests." },
      { time: "13:00", name: isAr ? "غداء كباب إسكندر الأصلي في بورصة" : "Original Iskender Kebab Feast", kind: "meal", stayMinutes: 75, description: isAr ? "تذوق الطبق التاريخي في مسقط رأسه الأصلي بالزبدة البلدية." : "Taste the legendary dish in its historic birthplace." },
      { time: "14:30", name: isAr ? "الشجرة المعمرة التاريخية (İnkaya Çınarı)" : "Historic Inkaya Plane Tree (600 Years)", kind: "photo_stop", stayMinutes: 60, description: isAr ? "جلسة شاي ريفية مظللة تحت أضخم شجرة معمرة في تركيا." : "600-year-old monumental tree and tea garden." },
      { time: "16:00", name: isAr ? "سوق الحرير ومصنع الحلقوم والعسل الطبيعي" : "Silk Bazaar & Turkish Delight Tasting", kind: "shopping", stayMinutes: 60, description: isAr ? "شراء الحرير البورصي الفاخر والعسل الجبلي والحلقوم الطازج." : "Historic Koza Han and artisan confectioneries." },
      { time: "17:30", name: isAr ? "العودة إلى إسطنبول" : "Return to Istanbul", kind: "relax", stayMinutes: 90, description: isAr ? "العودة في المساء والتوصيل للفندق." : "Relaxed return journey." },
    ],
    driverNotes: isAr ? "توجيهات السائق: دفع رسوم عبور جسر عثمان غازي مسبقاً وتوفير مظلات شمسية." : "Ensure toll tags are active for Osmangazi Bridge and guide guests to the VIP Teleferik gate.",
    includedAmenities: isAr ? ["مرسيدس فيتو VIP", "رسوم جسر عثمان غازي السريع مشمولة", "وقود ومواقف"] : ["Mercedes Vito VIP", "Bridge tolls & parking included"],
  };
}

function buildSapancaPlan(hours: number, lang: "ar" | "en" | "tr", vibe: string): GeneratedTourPlan {
  const isAr = lang === "ar";
  return {
    city: "Sapanca",
    hours,
    theme: isAr ? "بحيرة سبانجا وشلالات معشوقية وسفاري الطبيعة" : "Sapanca Lake & Masukiye Forest Safari",
    title: isAr ? `برنامج جولة سبانجا ومعشوقية VIP (${hours} ساعات)` : `Sapanca & Masukiye VIP Day Tour (${hours} Hours)`,
    summary: isAr ? "يوم من الاسترخاء والمغامرة وسط الغابات والبحيرات مع وجبة غداء عائمة فوق الشلالات." : "A serene and thrilling escape to tranquil waters and mountain waterfall groves.",
    stops: [
      { time: "09:00", name: isAr ? "الانطلاق نحو سبانجا" : "Departure to Sapanca", kind: "sightseeing", stayMinutes: 80, description: isAr ? "رحلة مريحة على الطريق السريع." : "Comfortable highway cruise." },
      { time: "10:30", name: isAr ? "كورنيش بحيرة سبانجا والأنشطة المائية" : "Sapanca Lake Promenade", kind: "relax", stayMinutes: 90, description: isAr ? "المشي على ضفاف البحيرة وركوب القوارب والدراجات." : "Boardwalk stroll and boat cruising." },
      { time: "12:15", name: isAr ? "غداء شلالات معشوقية العائمة" : "Floating Waterfall Lunch at Masukiye", kind: "meal", stayMinutes: 80, description: isAr ? "تناول طاجن الفخار التركي في جلسات فوق مياه الشلال مباشرة." : "Dine on platforms directly above rushing mountain streams." },
      { time: "14:00", name: isAr ? "سفاري الدبابات الجبلية والزيبلاين (ATV)" : "Quad Biking (ATV) & Forest Zipline", kind: "viewpoint", stayMinutes: 75, description: isAr ? "مغامرة الدبابات بين أشجار الغابات الكثيفة." : "Exhilarating off-road quad biking." },
      { time: "15:45", name: isAr ? "مطل الزجاجي فوق جبل كارتبه" : "Kartepe Mountain Viewpoint", kind: "viewpoint", stayMinutes: 60, description: isAr ? "إطلالة ساحرة على كامل بحيرة سبانجا من الأعلى." : "Breathtaking mountain outlook." },
      { time: "17:00", name: isAr ? "العودة إلى إسطنبول" : "Return to Hotel", kind: "relax", stayMinutes: 80, description: isAr ? "العودة الآمنة والتوصيل للفندق." : "Return drop-off." },
    ],
    driverNotes: isAr ? "توجيهات السائق: مساعدة العائلات في حجز أنشطة الدبابات من المحطات المعتمدة وتجنب التأخير." : "Help guests coordinate ATV activities safely and assist with gear.",
    includedAmenities: isAr ? ["سيارة فيتو VIP", "سائق خاص", "الوقود ومواقف السيارات", "مياه وضيافة"] : ["Mercedes Vito VIP", "Private Chauffeur & All Tolls"],
  };
}

/**
 * Generates ready-to-print HTML/PDF voucher template for daily tours.
 * Includes official Lonaliza branding, booking code, passenger info,
 * chauffeur instructions, and structured itinerary.
 */
export function generateItineraryHtml(plan: GeneratedTourPlan, bookingInfo?: {
  bookingNumber?: string;
  guestName?: string;
  date?: string;
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;
}): string {
  const bNumber = bookingInfo?.bookingNumber || "LONA-TOUR-PENDING";
  const guest = bookingInfo?.guestName || "ضيف لوناليزا المحترم (VIP Guest)";
  const dateStr = bookingInfo?.date || new Date().toISOString().split("T")[0];
  const driver = bookingInfo?.driverName || "سائق معتمد من مؤسسة لوناليزا";
  const driverPhone = bookingInfo?.driverPhone || "+90 534 231 12 34";
  const plate = bookingInfo?.vehiclePlate || "34 VIP 2024";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${plan.title} - ${bNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Outfit:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', 'Outfit', sans-serif;
      background-color: #0b0f19;
      color: #f8fafc;
      padding: 30px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .header {
      background: linear-gradient(135deg, #1e1435 0%, #0b0f19 100%);
      border-bottom: 2px solid #d4af37;
      padding: 30px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      color: #d4af37;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      color: #94a3b8;
      font-size: 13px;
      margin-top: 4px;
    }
    .badge {
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid #d4af37;
      color: #f59e0b;
      padding: 6px 16px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 13px;
    }
    .content { padding: 35px 40px; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .meta-item { font-size: 14px; }
    .meta-label { color: #94a3b8; font-size: 12px; margin-bottom: 2px; }
    .meta-value { color: #f8fafc; font-weight: 700; }
    .section-title {
      color: #d4af37;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .timeline {
      position: relative;
      border-right: 2px solid rgba(212, 175, 55, 0.4);
      margin-right: 15px;
      padding-right: 25px;
      margin-bottom: 30px;
    }
    .stop-card {
      position: relative;
      margin-bottom: 22px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 16px 20px;
    }
    .stop-card::before {
      content: '';
      position: absolute;
      right: -32px;
      top: 20px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #d4af37;
      border: 3px solid #111827;
    }
    .stop-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .stop-time {
      color: #f59e0b;
      font-weight: 800;
      font-size: 14px;
    }
    .stop-stay {
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 12px;
      color: #cbd5e1;
    }
    .stop-title { font-weight: 700; font-size: 15px; color: #fff; margin-bottom: 4px; }
    .stop-desc { font-size: 13px; color: #94a3b8; }
    .driver-box {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .driver-box-title { color: #10b981; font-weight: 700; font-size: 15px; margin-bottom: 6px; }
    .driver-box-text { color: #e2e8f0; font-size: 13px; }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      background: #0b0f19;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand-title">LONALIZA LUXURY PLATFORM</div>
        <div class="brand-sub">مؤسسة لوناليزا العالمية للسياحة والنقل الفاخر</div>
      </div>
      <div class="badge">${plan.hours} ساعات VIP</div>
    </div>

    <div class="content">
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 22px; color: #fff; margin-bottom: 8px;">${plan.title}</h1>
        <p style="color: #94a3b8; font-size: 14px;">${plan.summary}</p>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">رقم الحجز الرسمي</div>
          <div class="meta-value">${bNumber}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">اسم العميل المحترم</div>
          <div class="meta-value">${guest}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">تاريخ تنفيذ الرحلة</div>
          <div class="meta-value">${dateStr}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">السائق ورقم اللوحة</div>
          <div class="meta-value">${driver} (${plate}) - هاتف: ${driverPhone}</div>
        </div>
      </div>

      <div class="driver-box">
        <div class="driver-box-title">تعليمات هامة للسائق لتنفيذ البرنامج بدقة</div>
        <div class="driver-box-text">${plan.driverNotes}</div>
      </div>

      <div class="section-title">مسار ومحطات الجولة السياحية المجدولة</div>
      <div class="timeline">
        ${plan.stops
          .map(
            (stop) => `
          <div class="stop-card">
            <div class="stop-header">
              <span class="stop-time">${stop.time}</span>
              <span class="stop-stay">${stop.stayMinutes} دقيقة</span>
            </div>
            <div class="stop-title">${stop.name}</div>
            <div class="stop-desc">${stop.description}</div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="section-title">الخدمات المشمولة في الجولة</div>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
        ${plan.includedAmenities
          .map(
            (amenity) => `
          <span style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); color: #e2e8f0; padding: 4px 12px; border-radius: 8px; font-size: 12px;">
            ✓ ${amenity}
          </span>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="footer">
      منصة لوناليزا للسياحة والنقل الفاخر — خدمة العملاء المباشرة 24/7 على مدار الساعة | info@lonaliza.com | lonaliza.com
    </div>
  </div>
</body>
</html>`;
}
