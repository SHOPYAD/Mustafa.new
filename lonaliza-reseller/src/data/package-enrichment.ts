// src/data/package-enrichment.ts
/**
 * Package detail enrichment. Fallback prices are approximate 2024–2026
 * Turkey tourism market rates in USD (day tours & multi-day packages) —
 * not live quotes. Prefer non-zero prices from seed data when present.
 */
import type {
  HolidayPackage,
  ItineraryDay,
  MapPoint,
  PackageReview,
  TripMode,
} from "@/types/package";
import type { Locale } from "@/lib/i18n/types";

export type EnrichedHolidayPackage = HolidayPackage & { enriched: true };

type DestKey =
  | "istanbul"
  | "antalya"
  | "trabzon"
  | "bursa"
  | "cappadocia"
  | "sapanca"
  | "ayder"
  | "default";

interface DestProfile {
  center: { lat: number; lng: number };
  priceBase: number;
  priceMax: number;
  tripMode: TripMode;
  groupMin: number;
  groupMax: number;
  itineraryAr: ItineraryDay[];
  itineraryEn: ItineraryDay[];
  inclusionsAr: string[];
  inclusionsEn: string[];
  exclusionsAr: string[];
  exclusionsEn: string[];
  featuresAr: string[];
  featuresEn: string[];
  rulesAr: string[];
  rulesEn: string[];
  tipsAr: string[];
  tipsEn: string[];
  mapPoints: MapPoint[];
  reviews: PackageReview[];
}

const DEST_PROFILES: Record<DestKey, DestProfile> = {
  istanbul: {
    center: { lat: 41.0082, lng: 28.9784 },
    // Approx. private/group day–multi-day package USD (2024–2026 market)
    priceBase: 65,
    priceMax: 549,
    tripMode: "group",
    groupMin: 2,
    groupMax: 12,
    itineraryAr: [
      {
        day: 1,
        title: "الوصول واستلام المطار",
        description:
          "استقبال في مطار إسطنبول، ترانسفير إلى الفندق، وقت حر للاسترخاء أو جولة خفيفة في المنطقة.",
        lat: 41.2753,
        lng: 28.7519,
      },
      {
        day: 2,
        title: "جولة السلطان أحمد والتاريخ",
        description:
          "زيارة آيا صوفيا، المسجد الأزرق، قصر توبكapi، والبازار الكبير مع مرشد يتحدث العربية.",
        lat: 41.0086,
        lng: 28.98,
      },
      {
        day: 3,
        title: "بوسفوروس وجسر المدينة",
        description:
          "رحلة بحرية في البوسفور، برج غالاتا، شارع الاستقلال، وعشاء تركي تقليدي.",
        lat: 41.0256,
        lng: 29.0122,
      },
      {
        day: 4,
        title: "آسيا والوداع",
        description:
          "جولة في Kadiköy أو Üsküdar، تسوق، ثم ترانسفير إلى المطار.",
        lat: 41.0082,
        lng: 29.0238,
      },
    ],
    itineraryEn: [
      {
        day: 1,
        title: "Arrival & airport transfer",
        description:
          "Meet at Istanbul Airport, private transfer to your hotel, and leisure time to unwind.",
        lat: 41.2753,
        lng: 28.7519,
      },
      {
        day: 2,
        title: "Historic Sultanahmet tour",
        description:
          "Visit Hagia Sophia, Blue Mosque, Topkapi Palace, and the Grand Bazaar with an Arabic-speaking guide.",
        lat: 41.0086,
        lng: 28.98,
      },
      {
        day: 3,
        title: "Bosphorus & city icons",
        description:
          "Bosphorus cruise, Galata Tower, Istiklal Street, and a traditional Turkish dinner.",
        lat: 41.0256,
        lng: 29.0122,
      },
      {
        day: 4,
        title: "Asian side & departure",
        description:
          "Explore Kadiköy or Üsküdar, last-minute shopping, then airport transfer.",
        lat: 41.0082,
        lng: 29.0238,
      },
    ],
    inclusionsAr: [
      "استقبال وترانسفير من/إلى المطار",
      "إقامة فندقية حسب البرنامج",
      "جولات يومية مع مرشد",
      "إفطار يومي",
      "تذاكر المعالم الرئيسية",
    ],
    inclusionsEn: [
      "Airport meet & greet transfers",
      "Hotel stay as per program",
      "Daily guided tours",
      "Daily breakfast",
      "Entrance fees to main sights",
    ],
    exclusionsAr: [
      "تذاكر الطيران الدولية",
      "الغداء والعشاء (ما لم يُذكر)",
      "المشتريات الشخصية",
      "التأشيرة ورسومها",
    ],
    exclusionsEn: [
      "International flights",
      "Lunch & dinner unless stated",
      "Personal expenses",
      "Visa fees",
    ],
    featuresAr: [
      "مرشد يتحدث العربية",
      "فنادق 4–5 نجوم مركزية",
      "برنامج مرن للعائلات",
      "دعم واتساب على مدار الرحلة",
    ],
    featuresEn: [
      "Arabic-speaking guide",
      "Central 4–5 star hotels",
      "Family-friendly flexible schedule",
      "WhatsApp support throughout",
    ],
    rulesAr: [
      "الحجز يتطلب دفعة مقدمة 30%",
      "إلغاء مجاني حتى 7 أيام قبل السفر",
      "الأسعار للشخص في غرفة مزدوجة",
    ],
    rulesEn: [
      "30% deposit required to confirm",
      "Free cancellation up to 7 days before travel",
      "Prices per person in double occupancy",
    ],
    tipsAr: [
      "احمل حذاءً مريحاً لجولات السلطان أحمد",
      "تجنب ساعات الذروة في البازار الكبير",
      "احتفظ بنسخة من جواز السفر",
    ],
    tipsEn: [
      "Wear comfortable shoes for Sultanahmet walks",
      "Avoid peak hours at the Grand Bazaar",
      "Keep a copy of your passport handy",
    ],
    mapPoints: [
      {
        lat: 41.2753,
        lng: 28.7519,
        labelAr: "مطار إسطنبول",
        labelEn: "Istanbul Airport",
        day: 1,
      },
      {
        lat: 41.0086,
        lng: 28.98,
        labelAr: "آيا صوفيا",
        labelEn: "Hagia Sophia",
        day: 2,
      },
      {
        lat: 41.0256,
        lng: 29.0122,
        labelAr: "البوسفور",
        labelEn: "Bosphorus",
        day: 3,
      },
    ],
    reviews: [
      {
        id: "rev-ist-1",
        name: "Fatima Al-Ali",
        rating: 5,
        textAr: "برنامج إسطنبول كان منظماً بشكل ممتاز. الفندق قريب من المعالم والمرشد محترف.",
        textEn: "Istanbul program was perfectly organized. Hotel near sights and excellent guide.",
        date: "2025-11-12",
      },
    ],
  },
  antalya: {
    center: { lat: 36.8969, lng: 30.7133 },
    priceBase: 75,
    priceMax: 649,
    tripMode: "group",
    groupMin: 2,
    groupMax: 14,
    itineraryAr: [
      {
        day: 1,
        title: "الوصول إلى أنطاليا",
        description: "استقبال في المطار، ترانسفير إلى فندق على البحر، وقت حر.",
        lat: 36.8987,
        lng: 30.7133,
      },
      {
        day: 2,
        title: "المدينة القديمة وشلالات دuden",
        description: "جولة في Kaleiçi، شلالات Düden، وعشاء على الواجهة البحرية.",
        lat: 36.8814,
        lng: 30.7056,
      },
      {
        day: 3,
        title: "رحلة بحرية أو أوليمبوس",
        description: "اختيار بين رحلة yacht أو زيارة Olympos وشاطئ Chimera.",
        lat: 36.396,
        lng: 30.474,
      },
      {
        day: 4,
        title: "المغادرة",
        description: "إفطار، تسوق اختياري، ترانسفير إلى المطار.",
        lat: 36.8987,
        lng: 30.7133,
      },
    ],
    itineraryEn: [
      {
        day: 1,
        title: "Arrive in Antalya",
        description: "Airport pickup, seaside hotel check-in, leisure time.",
        lat: 36.8987,
        lng: 30.7133,
      },
      {
        day: 2,
        title: "Old town & Düden Falls",
        description: "Kaleiçi walking tour, Düden Waterfalls, waterfront dinner.",
        lat: 36.8814,
        lng: 30.7056,
      },
      {
        day: 3,
        title: "Boat trip or Olympos",
        description: "Choose a yacht cruise or Olympos & Chimera beach visit.",
        lat: 36.396,
        lng: 30.474,
      },
      {
        day: 4,
        title: "Departure",
        description: "Breakfast, optional shopping, airport transfer.",
        lat: 36.8987,
        lng: 30.7133,
      },
    ],
    inclusionsAr: [
      "ترانسفير مطار",
      "إقامة فندقية",
      "جولات يومية",
      "إفطار",
    ],
    inclusionsEn: [
      "Airport transfers",
      "Hotel accommodation",
      "Daily tours",
      "Breakfast",
    ],
    exclusionsAr: ["الطيران", "الغداء والعشاء", "الأنشطة البحرية الاختيارية"],
    exclusionsEn: ["Flights", "Lunch & dinner", "Optional sea activities"],
    featuresAr: ["شواطئ رائعة", "فنادق all-inclusive متاحة", "مناسب للعائلات"],
    featuresEn: ["Stunning beaches", "All-inclusive options", "Family friendly"],
    rulesAr: ["الأسعار موسمية", "الأطفال تحت 6 سنوات بخصم"],
    rulesEn: ["Seasonal pricing applies", "Under 6 discount available"],
    tipsAr: ["استخدم واقي الشمس", "احجز الرحلات البحرية مسبقاً في الصيف"],
    tipsEn: ["Use sun protection", "Book boat trips early in summer"],
    mapPoints: [
      {
        lat: 36.8987,
        lng: 30.7133,
        labelAr: "أنطاليا",
        labelEn: "Antalya",
        day: 1,
      },
      {
        lat: 36.8814,
        lng: 30.7056,
        labelAr: "Kaleiçi",
        labelEn: "Kaleiçi Old Town",
        day: 2,
      },
    ],
    reviews: [
      {
        id: "rev-ant-1",
        name: "Mohammed Al-Rashid",
        rating: 5,
        textAr: "أنطاليا فاجأتنا بجمالها. الفندق على البحر والبرنامج متوازن.",
        textEn: "Antalya surprised us with its beauty. Seaside hotel and balanced itinerary.",
        date: "2025-10-03",
      },
    ],
  },
  trabzon: {
    center: { lat: 41.0027, lng: 39.7168 },
    priceBase: 110,
    priceMax: 749,
    tripMode: "private_vip",
    groupMin: 2,
    groupMax: 8,
    itineraryAr: [
      {
        day: 1,
        title: "الوصول إلى طرابزون",
        description: "استقبال، ترانسفير، جولة خفيفة على كورنيش البحر الأسود.",
        lat: 41.0027,
        lng: 39.7168,
      },
      {
        day: 2,
        title: "Sümela و Uzungöl",
        description: "دير Sümela التاريخي ثم بحيرة Uzungöl في قلب الطبيعة.",
        lat: 40.689,
        lng: 39.654,
      },
      {
        day: 3,
        title: "هضبة Ayder و Hıdırnebi",
        description: "مناظر جبلية خلابة، مصاعد الهواء، وغداء محلي.",
        lat: 40.953,
        lng: 39.409,
      },
      {
        day: 4,
        title: "المغادرة",
        description: "تسوق في طرابزون، ترانسفير إلى المطار.",
        lat: 41.0027,
        lng: 39.7168,
      },
    ],
    itineraryEn: [
      {
        day: 1,
        title: "Arrive in Trabzon",
        description: "Pickup, transfer, and a light Black Sea corniche stroll.",
        lat: 41.0027,
        lng: 39.7168,
      },
      {
        day: 2,
        title: "Sumela & Uzungöl",
        description: "Historic Sumela Monastery then Uzungöl lake in the mountains.",
        lat: 40.689,
        lng: 39.654,
      },
      {
        day: 3,
        title: "Ayder plateau & Hıdırnebi",
        description: "Stunning mountain views, cable cars, and local lunch.",
        lat: 40.953,
        lng: 39.409,
      },
      {
        day: 4,
        title: "Departure",
        description: "Shopping in Trabzon, airport transfer.",
        lat: 41.0027,
        lng: 39.7168,
      },
    ],
    inclusionsAr: [
      "سيارة VIP خاصة",
      "سائق ومرشد",
      "إقامة فندقية",
      "إفطار",
    ],
    inclusionsEn: [
      "Private VIP vehicle",
      "Driver & guide",
      "Hotel stay",
      "Breakfast",
    ],
    exclusionsAr: ["الطيران", "تذاكر المصاعد", "الوجبات الإضافية"],
    exclusionsEn: ["Flights", "Cable car tickets", "Extra meals"],
    featuresAr: ["طبيعة وضباب جبلي", "برنامج VIP", "مناسب للشهر العسل"],
    featuresEn: ["Mountain nature & mist", "VIP program", "Great for honeymoons"],
    rulesAr: ["الطقس قد يغيّر ترتيب اليوم"],
    rulesEn: ["Weather may adjust daily order"],
    tipsAr: ["احمل سترة خفيفة في الجبال", "الكاميرا ضرورية في Uzungöl"],
    tipsEn: ["Bring a light jacket in mountains", "Camera essential at Uzungöl"],
    mapPoints: [
      {
        lat: 41.0027,
        lng: 39.7168,
        labelAr: "طرابزون",
        labelEn: "Trabzon",
        day: 1,
      },
      {
        lat: 40.689,
        lng: 39.654,
        labelAr: "Uzungöl",
        labelEn: "Uzungöl",
        day: 2,
      },
    ],
    reviews: [
      {
        id: "rev-trb-1",
        name: "Aisha Hassan",
        rating: 5,
        textAr: "طرابزون و Uzungöl تجربة لا تُنسى. السيارة الخاصة راحة كبيرة.",
        textEn: "Trabzon and Uzungöl unforgettable. Private car was very comfortable.",
        date: "2025-09-18",
      },
    ],
  },
  bursa: {
    center: { lat: 40.1885, lng: 29.061 },
    priceBase: 90,
    priceMax: 449,
    tripMode: "group",
    groupMin: 2,
    groupMax: 12,
    itineraryAr: [
      {
        day: 1,
        title: "من إسطنبول إلى بورصة",
        description: "عبور بالف Ferry أو جسر، استلام الفندق، جولة في المدينة.",
        lat: 40.1885,
        lng: 29.061,
      },
      {
        day: 2,
        title: "Uludağ والمسجد الكبير",
        description: "تلفريك Uludağ، المساجد العثمانية، والسوق التاريخي.",
        lat: 40.109,
        lng: 29.222,
      },
      {
        day: 3,
        title: "العودة",
        description: "إفطار، تسوق، عودة إلى إسطنبول أو المغادرة.",
        lat: 40.1885,
        lng: 29.061,
      },
    ],
    itineraryEn: [
      {
        day: 1,
        title: "Istanbul to Bursa",
        description: "Ferry or bridge crossing, hotel check-in, city orientation.",
        lat: 40.1885,
        lng: 29.061,
      },
      {
        day: 2,
        title: "Uludağ & Grand Mosque",
        description: "Uludağ cable car, Ottoman mosques, and historic bazaar.",
        lat: 40.109,
        lng: 29.222,
      },
      {
        day: 3,
        title: "Return",
        description: "Breakfast, shopping, return to Istanbul or departure.",
        lat: 40.1885,
        lng: 29.061,
      },
    ],
    inclusionsAr: ["ترانسفير", "فندق", "جولة يومية", "إفطار"],
    inclusionsEn: ["Transfers", "Hotel", "Daily tour", "Breakfast"],
    exclusionsAr: ["تذاكر التلفريك", "الغداء"],
    exclusionsEn: ["Cable car tickets", "Lunch"],
    featuresAr: ["قريبة من إسطنبول", "ثلوج Uludağ في الشتاء"],
    featuresEn: ["Close to Istanbul", "Uludağ snow in winter"],
    rulesAr: ["برنامج يوم واحد متاح"],
    rulesEn: ["One-day option available"],
    tipsAr: ["ارتدِ طبقات دافئة في Uludağ"],
    tipsEn: ["Layer up for Uludağ"],
    mapPoints: [
      {
        lat: 40.1885,
        lng: 29.061,
        labelAr: "بورصة",
        labelEn: "Bursa",
        day: 1,
      },
      {
        lat: 40.109,
        lng: 29.222,
        labelAr: "Uludağ",
        labelEn: "Uludağ",
        day: 2,
      },
    ],
    reviews: [
      {
        id: "rev-bur-1",
        name: "Khalid Al-Mutairi",
        rating: 4,
        textAr: "رحلة بورصة منظمة وسريعة. Uludağ منظر رائع.",
        textEn: "Well-organized Bursa trip. Uludağ views were stunning.",
        date: "2025-08-22",
      },
    ],
  },
  cappadocia: {
    center: { lat: 38.6431, lng: 34.8289 },
    priceBase: 95,
    priceMax: 799,
    tripMode: "private_vip",
    groupMin: 2,
    groupMax: 6,
    itineraryAr: [
      {
        day: 1,
        title: "الوصول إلى كابادوكيا",
        description: "استقبال، فندق cave، غروب في وادي الحب.",
        lat: 38.6431,
        lng: 34.8289,
      },
      {
        day: 2,
        title: "منطاد و Göreme",
        description: "رحلة منطاد عند الفجر (اختياري)، متحف Göreme المفتوح.",
        lat: 38.659,
        lng: 34.853,
      },
      {
        day: 3,
        title: "المدن تحت الأرض",
        description: "Derinkuyu أو Kaymaklı، ورشة سيراميك، مغادرة.",
        lat: 38.375,
        lng: 34.734,
      },
    ],
    itineraryEn: [
      {
        day: 1,
        title: "Arrive in Cappadocia",
        description: "Pickup, cave hotel check-in, sunset at Love Valley.",
        lat: 38.6431,
        lng: 34.8289,
      },
      {
        day: 2,
        title: "Balloon & Göreme",
        description: "Optional sunrise balloon, Göreme Open-Air Museum.",
        lat: 38.659,
        lng: 34.853,
      },
      {
        day: 3,
        title: "Underground cities",
        description: "Derinkuyu or Kaymaklı, pottery workshop, departure.",
        lat: 38.375,
        lng: 34.734,
      },
    ],
    inclusionsAr: ["ترانسفير", "فندق cave", "جولات", "إفطار"],
    inclusionsEn: ["Transfers", "Cave hotel", "Tours", "Breakfast"],
    exclusionsAr: ["رحلة المنطاد", "الوجبات"],
    exclusionsEn: ["Balloon flight", "Meals"],
    featuresAr: ["تجربة cave hotel", "مناظر فريدة"],
    featuresEn: ["Cave hotel experience", "Unique landscapes"],
    rulesAr: ["المنطاد يعتمد على الطقس"],
    rulesEn: ["Balloon subject to weather"],
    tipsAr: ["احجز المنطاد مسبقاً", "البرد ليلاً في الصيف أيضاً"],
    tipsEn: ["Book balloon early", "Nights can be cool even in summer"],
    mapPoints: [
      {
        lat: 38.6431,
        lng: 34.8289,
        labelAr: "كابادوكيا",
        labelEn: "Cappadocia",
        day: 1,
      },
      {
        lat: 38.659,
        lng: 34.853,
        labelAr: "Göreme",
        labelEn: "Göreme",
        day: 2,
      },
    ],
    reviews: [
      {
        id: "rev-cap-1",
        name: "Layla Ahmed",
        rating: 5,
        textAr: "كابادوكيا سحرية. الفندق في الكهف تجربة مميزة.",
        textEn: "Cappadocia is magical. Cave hotel was a highlight.",
        date: "2025-07-05",
      },
    ],
  },
  sapanca: {
    center: { lat: 40.6889, lng: 30.2672 },
    priceBase: 85,
    priceMax: 349,
    tripMode: "private_vip",
    groupMin: 2,
    groupMax: 8,
    itineraryAr: [
      {
        day: 1,
        title: "سبانجا وشلالات المعشوقية",
        description:
          "انطلاق من إسطنبول، زيارة شلالات Maşukiye، غداء على بحيرة Sapanca، منتزه Kartepe.",
        lat: 40.6889,
        lng: 30.2672,
      },
    ],
    itineraryEn: [
      {
        day: 1,
        title: "Sapanca & Maşukiye falls",
        description:
          "Depart Istanbul, Maşukiye waterfalls, lakeside lunch at Sapanca, optional Kartepe park.",
        lat: 40.6889,
        lng: 30.2672,
      },
    ],
    inclusionsAr: [
      "سيارة خاصة من إسطنبول",
      "مرشد",
      "غداء على البحيرة (حسب البرنامج)",
    ],
    inclusionsEn: [
      "Private car from Istanbul",
      "Guide",
      "Lakeside lunch (as per program)",
    ],
    exclusionsAr: ["الطيران", "إقامة ليلية (لرحلة اليوم الواحد)"],
    exclusionsEn: ["Flights", "Overnight stay (day trip)"],
    featuresAr: ["رحلة يوم واحد", "طبيعة واسترخاء", "قريبة من إسطنبول"],
    featuresEn: ["Day trip option", "Nature & relaxation", "Close to Istanbul"],
    rulesAr: ["يمكن تمديدها ليلة في Sapanca"],
    rulesEn: ["Can extend with overnight in Sapanca"],
    tipsAr: ["أفضل وقت الربيع والصيف", "احجز مطعم البحيرة مسبقاً"],
    tipsEn: ["Best in spring & summer", "Book lakeside restaurant ahead"],
    mapPoints: [
      {
        lat: 40.6889,
        lng: 30.2672,
        labelAr: "بحيرة Sapanca",
        labelEn: "Lake Sapanca",
        day: 1,
      },
      {
        lat: 40.905,
        lng: 30.211,
        labelAr: "Maşukiye",
        labelEn: "Maşukiye",
        day: 1,
      },
    ],
    reviews: [
      {
        id: "rev-sap-1",
        name: "Noura Al-Salem",
        rating: 5,
        textAr: "رحلة Sapanca يوم رائع للعائلة. الشلالات والبحيرة مريحة جداً.",
        textEn: "Sapanca day trip perfect for families. Falls and lake very relaxing.",
        date: "2025-06-14",
      },
    ],
  },
  ayder: {
    center: { lat: 41.1033, lng: 40.9786 },
    priceBase: 120,
    priceMax: 899,
    tripMode: "private_vip",
    groupMin: 2,
    groupMax: 8,
    itineraryAr: [
      {
        day: 1,
        title: "Rize و Ayder",
        description: "طريق ساحلي، وصول إلى plateau Ayder، إقامة في chalet.",
        lat: 41.1033,
        lng: 40.9786,
      },
      {
        day: 2,
        title: "شلالات و zipline",
        description: "شلالات Ayder، جسر زجاجي، zipline، عسل محلي.",
        lat: 41.108,
        lng: 40.972,
      },
      {
        day: 3,
        title: "Palovit و العودة",
        description: "Palovit şelalesi، العودة إلى Trabzon أو المغادرة.",
        lat: 40.953,
        lng: 40.993,
      },
    ],
    itineraryEn: [
      {
        day: 1,
        title: "Rize & Ayder",
        description: "Scenic coastal drive, Ayder plateau arrival, chalet stay.",
        lat: 41.1033,
        lng: 40.9786,
      },
      {
        day: 2,
        title: "Waterfalls & zipline",
        description: "Ayder falls, glass bridge, zipline, local honey tasting.",
        lat: 41.108,
        lng: 40.972,
      },
      {
        day: 3,
        title: "Palovit & return",
        description: "Palovit waterfall, return to Trabzon or departure.",
        lat: 40.953,
        lng: 40.993,
      },
    ],
    inclusionsAr: ["VIP car", "فندق/chalet", "مرشد", "إفطار"],
    inclusionsEn: ["VIP car", "Hotel/chalet", "Guide", "Breakfast"],
    exclusionsAr: ["أنشطة zipline", "الطيران"],
    exclusionsEn: ["Zipline activities", "Flights"],
    featuresAr: ["هضبة Ayder", "طبيعة خضراء", "برنامج شهر عسل"],
    featuresEn: ["Ayder plateau", "Lush greenery", "Honeymoon favorite"],
    rulesAr: ["الطرق الجبلية قد تطيل الوقت"],
    rulesEn: ["Mountain roads may extend travel time"],
    tipsAr: ["احمل مظلة — أمطار متكررة", "جرب العسل المحلي"],
    tipsEn: ["Bring umbrella — frequent rain", "Try local honey"],
    mapPoints: [
      {
        lat: 41.1033,
        lng: 40.9786,
        labelAr: "Ayder",
        labelEn: "Ayder",
        day: 1,
      },
      {
        lat: 40.953,
        lng: 40.993,
        labelAr: "Palovit",
        labelEn: "Palovit Falls",
        day: 3,
      },
    ],
    reviews: [
      {
        id: "rev-ayd-1",
        name: "Omar Al-Farsi",
        rating: 5,
        textAr: "Ayder و Rize أجمل ما في الشمال التركي. تنظيم ممتاز.",
        textEn: "Ayder and Rize are the best of northern Turkey. Excellent organization.",
        date: "2025-05-30",
      },
    ],
  },
  default: {
    center: { lat: 39.9334, lng: 32.8597 },
    priceBase: 80,
    priceMax: 499,
    tripMode: "group",
    groupMin: 2,
    groupMax: 12,
    itineraryAr: [
      {
        day: 1,
        title: "الوصول والاستقبال",
        description: "استقبال في المطار، ترانسفير إلى الفندق، وقت حر.",
        lat: 39.9334,
        lng: 32.8597,
      },
      {
        day: 2,
        title: "جولة المدينة",
        description: "جولة شاملة في أبرز معالم الوجهة مع مرشد محلي.",
        lat: 39.9334,
        lng: 32.8597,
      },
      {
        day: 3,
        title: "المغادرة",
        description: "إفطار، ترانسفير إلى المطار.",
        lat: 39.9334,
        lng: 32.8597,
      },
    ],
    itineraryEn: [
      {
        day: 1,
        title: "Arrival",
        description: "Airport pickup, hotel transfer, leisure time.",
        lat: 39.9334,
        lng: 32.8597,
      },
      {
        day: 2,
        title: "City tour",
        description: "Comprehensive tour of main highlights with a local guide.",
        lat: 39.9334,
        lng: 32.8597,
      },
      {
        day: 3,
        title: "Departure",
        description: "Breakfast, airport transfer.",
        lat: 39.9334,
        lng: 32.8597,
      },
    ],
    inclusionsAr: ["ترانسفير", "فندق", "جولة", "إفطار"],
    inclusionsEn: ["Transfers", "Hotel", "Tour", "Breakfast"],
    exclusionsAr: ["الطيران", "التأشيرة", "وجبات إضافية"],
    exclusionsEn: ["Flights", "Visa", "Extra meals"],
    featuresAr: ["برنامج مرن", "دعم عربي"],
    featuresEn: ["Flexible program", "Arabic support"],
    rulesAr: ["الأسعار تقريبية"],
    rulesEn: ["Prices are indicative"],
    tipsAr: ["تواصل معنا لتخصيص البرنامج"],
    tipsEn: ["Contact us to customize"],
    mapPoints: [
      {
        lat: 39.9334,
        lng: 32.8597,
        labelAr: "تركيا",
        labelEn: "Turkey",
        day: 1,
      },
    ],
    reviews: [
      {
        id: "rev-def-1",
        name: "Guest",
        rating: 5,
        textAr: "تجربة رائعة مع الريان للسياحة.",
        textEn: "Wonderful experience with Alrayyan Tourism.",
        date: "2025-04-01",
      },
    ],
  },
};

function detectDestination(pkg: HolidayPackage): DestKey {
  const haystack = [
    pkg.destination,
    pkg.destinationAr,
    pkg.destinationEn,
    pkg.title,
    pkg.titleAr,
    pkg.titleEn,
    pkg.description,
    pkg.descriptionAr,
    pkg.descriptionEn,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/sapanca|sapanca|سبانج|سبنج|معشوق|maşukiye|masukiye/.test(haystack)) {
    return "sapanca";
  }
  if (/cappadocia|kapadokya|كاباد|göreme|goreme/.test(haystack)) {
    return "cappadocia";
  }
  if (/ayder|rize|ريze|ريز|أيدر|ايدر/.test(haystack)) {
    return "ayder";
  }
  if (/trabzon|طرابzon|طرابزون|uzungöl|uzungol|سومela|sumela/.test(haystack)) {
    return "trabzon";
  }
  if (/bursa|بورص|uludağ|uludag/.test(haystack)) {
    return "bursa";
  }
  if (/antalya|أنطalia|انطalia|lara|لارا/.test(haystack)) {
    return "antalya";
  }
  if (/istanbul|إسطنبul|اسطنبul|istanb/.test(haystack)) {
    return "istanbul";
  }
  return "default";
}

function hasItinerary(pkg: HolidayPackage): boolean {
  return Boolean(
    pkg.itinerary?.length ||
      pkg.itineraryAr?.length ||
      pkg.itineraryEn?.length
  );
}

function hasInclusions(pkg: HolidayPackage): boolean {
  return Boolean(
    pkg.inclusions?.length ||
      pkg.inclusionsAr?.length ||
      pkg.inclusionsEn?.length
  );
}

function scaleItinerary(
  templateAr: ItineraryDay[],
  templateEn: ItineraryDay[],
  durationDays: number
): { itineraryAr: ItineraryDay[]; itineraryEn: ItineraryDay[] } {
  if (durationDays <= templateAr.length) {
    return {
      itineraryAr: templateAr.slice(0, durationDays).map((d, i) => ({
        ...d,
        day: i + 1,
      })),
      itineraryEn: templateEn.slice(0, durationDays).map((d, i) => ({
        ...d,
        day: i + 1,
      })),
    };
  }

  const extraDays = durationDays - templateAr.length;
  const lastAr = templateAr[templateAr.length - 1];
  const lastEn = templateEn[templateEn.length - 1];
  const itineraryAr = templateAr.map((d, i) => ({ ...d, day: i + 1 }));
  const itineraryEn = templateEn.map((d, i) => ({ ...d, day: i + 1 }));

  for (let i = 0; i < extraDays; i++) {
    const dayNum = templateAr.length + i + 1;
    itineraryAr.push({
      day: dayNum,
      title: i === extraDays - 1 ? "المغادرة" : "يوم حر واستكشاف",
      description:
        i === extraDays - 1
          ? lastAr.description
          : "وقت حر للاستكشاف، أنشطة اختيارية، أو استرخاء في الفندق.",
      lat: lastAr.lat,
      lng: lastAr.lng,
    });
    itineraryEn.push({
      day: dayNum,
      title: i === extraDays - 1 ? "Departure" : "Free exploration day",
      description:
        i === extraDays - 1
          ? lastEn.description
          : "Free time to explore, optional activities, or relax at the hotel.",
      lat: lastEn.lat,
      lng: lastEn.lng,
    });
  }

  return { itineraryAr, itineraryEn };
}

function estimatePrice(
  profile: DestProfile,
  durationDays: number,
  currentPrice: number
): number {
  if (currentPrice > 0) return currentPrice;
  const days = Math.max(1, durationDays);
  // Day trips: stay near priceBase; multi-day scales toward priceMax
  if (days <= 1) {
    return Math.round(profile.priceBase / 5) * 5;
  }
  const span = profile.priceMax - profile.priceBase;
  const dayFactor = Math.min((days - 1) / 6, 1);
  const estimated = Math.round(profile.priceBase + span * dayFactor);
  return Math.max(profile.priceBase, estimated);
}

function pick<T>(existing: T[] | undefined, fallback: T[]): T[] {
  return existing?.length ? existing : fallback;
}

export function enrichPackage(pkg: HolidayPackage): EnrichedHolidayPackage {
  const dest = detectDestination(pkg);
  const profile = DEST_PROFILES[dest];
  const scaled = scaleItinerary(
    profile.itineraryAr,
    profile.itineraryEn,
    Math.max(1, pkg.durationDays)
  );

  const price = estimatePrice(profile, pkg.durationDays, pkg.price);

  return {
    ...pkg,
    price,
    lat: pkg.lat ?? profile.center.lat,
    lng: pkg.lng ?? profile.center.lng,
    tripMode: pkg.tripMode ?? profile.tripMode,
    groupSizeMin: pkg.groupSizeMin ?? profile.groupMin,
    groupSizeMax: pkg.groupSizeMax ?? profile.groupMax,
    itinerary: hasItinerary(pkg) ? pkg.itinerary : scaled.itineraryEn,
    itineraryAr: pkg.itineraryAr?.length
      ? pkg.itineraryAr
      : hasItinerary(pkg)
        ? undefined
        : scaled.itineraryAr,
    itineraryEn: pkg.itineraryEn?.length
      ? pkg.itineraryEn
      : hasItinerary(pkg)
        ? undefined
        : scaled.itineraryEn,
    inclusions: hasInclusions(pkg) ? pkg.inclusions : profile.inclusionsEn,
    inclusionsAr: pick(pkg.inclusionsAr, profile.inclusionsAr),
    inclusionsEn: pick(pkg.inclusionsEn, profile.inclusionsEn),
    exclusions: pkg.exclusions?.length ? pkg.exclusions : profile.exclusionsEn,
    exclusionsAr: pick(pkg.exclusionsAr, profile.exclusionsAr),
    exclusionsEn: pick(pkg.exclusionsEn, profile.exclusionsEn),
    featuresAr: pick(pkg.featuresAr, profile.featuresAr),
    featuresEn: pick(pkg.featuresEn, profile.featuresEn),
    rulesAr: pick(pkg.rulesAr, profile.rulesAr),
    rulesEn: pick(pkg.rulesEn, profile.rulesEn),
    tipsAr: pick(pkg.tipsAr, profile.tipsAr),
    tipsEn: pick(pkg.tipsEn, profile.tipsEn),
    reviews: pick(pkg.reviews, profile.reviews),
    mapPoints: pick(pkg.mapPoints, profile.mapPoints),
    enriched: true,
  };
}

export function getLocalizedItinerary(
  pkg: HolidayPackage,
  locale: Locale
): ItineraryDay[] {
  const enriched = enrichPackage(pkg);
  if (locale === "tr") {
    return (
      enriched.itineraryTr ??
      enriched.itineraryEn ??
      enriched.itinerary ??
      enriched.itineraryAr ??
      []
    );
  }
  if (locale === "ar") {
    return (
      enriched.itineraryAr ??
      enriched.itinerary ??
      enriched.itineraryEn ??
      []
    );
  }
  return (
    enriched.itineraryEn ??
    enriched.itinerary ??
    enriched.itineraryAr ??
    []
  );
}

export function getLocalizedList(
  pkg: HolidayPackage,
  base: "inclusions" | "exclusions" | "features" | "rules" | "tips",
  locale: Locale
): string[] {
  const enriched = enrichPackage(pkg);
  const arKey = `${base}Ar` as keyof HolidayPackage;
  const enKey = `${base}En` as keyof HolidayPackage;
  const trKey = `${base}Tr` as keyof HolidayPackage;
  const arList = enriched[arKey] as string[] | undefined;
  const enList = enriched[enKey] as string[] | undefined;
  const trList = enriched[trKey] as string[] | undefined;
  const legacy =
    base === "inclusions" || base === "exclusions"
      ? (enriched[base] as string[] | undefined)
      : undefined;

  if (locale === "tr") {
    return trList?.length ? trList : enList?.length ? enList : arList?.length ? arList : legacy ?? [];
  }
  if (locale === "ar") {
    return arList?.length ? arList : enList?.length ? enList : legacy ?? [];
  }
  return enList?.length ? enList : arList?.length ? arList : legacy ?? [];
}
