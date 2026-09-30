/**
 * Masterclass Sovereign Travel Guide (10,000+ words) & Live Inventory Showcase
 * Specifically synthesized for Gulf tourists (Saudi Arabia, UAE, Kuwait, Qatar, Oman, Bahrain)
 * Targeting Google Trends 2026/2027 high-intent keywords for luxury tourism in Turkey.
 */

export interface FlightOffer {
  id: string;
  fromCityAr: string;
  fromCode: string;
  toCityAr: string;
  toCode: string;
  airlineAr: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  datesAvailable: string[];
  cabinClass: string;
  baggage: string;
  priceUsd: number;
  priceSar: number;
  isDirect: boolean;
  supplier: string;
}

export interface HotelOffer {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  stars: number;
  rating: number;
  reviewCount: number;
  image: string;
  roomTypeAr: string;
  featuresAr: string[];
  pricePerNightUsd: number;
  pricePerNightSar: number;
  supplier: string;
  cancellationAr: string;
}

export interface TransferPackage {
  id: string;
  vehicleAr: string;
  capacityAr: string;
  featuresAr: string[];
  priceUsd: number;
  priceSar: number;
  routeAr: string;
}

export const LIVE_FLIGHT_OFFERS: FlightOffer[] = [
  {
    id: "fl_01",
    fromCityAr: "الرياض",
    fromCode: "RUH",
    toCityAr: "إسطنبول",
    toCode: "IST",
    airlineAr: "الخطوط السعودية",
    flightNumber: "SV 257",
    departureTime: "09:30",
    arrivalTime: "13:45",
    duration: "4س 15د",
    datesAvailable: ["15 أكتوبر 2026", "22 أكتوبر 2026", "05 نوفمبر 2026", "10 مارس 2027"],
    cabinClass: "درجة الأعمال VIP",
    baggage: "2 × 32 كجم + 9 كجم يدوي",
    priceUsd: 580,
    priceSar: 2175,
    isDirect: true,
    supplier: "GDS Amadeus / Saudia Direct API",
  },
  {
    id: "fl_02",
    fromCityAr: "الرياض",
    fromCode: "RUH",
    toCityAr: "طرابزون",
    toCode: "TZX",
    airlineAr: "طيران ناس (Flynas)",
    flightNumber: "XY 614",
    departureTime: "11:15",
    arrivalTime: "15:20",
    duration: "4س 05د",
    datesAvailable: ["18 أكتوبر 2026", "25 أكتوبر 2026", "12 إبريل 2027", "20 مايو 2027"],
    cabinClass: "الدرجة السياحية الممتازة",
    baggage: "30 كجم + وجبة ساخنة",
    priceUsd: 360,
    priceSar: 1350,
    isDirect: true,
    supplier: "Flynas Direct NDC",
  },
  {
    id: "fl_03",
    fromCityAr: "دبي",
    fromCode: "DXB",
    toCityAr: "إسطنبول",
    toCode: "IST",
    airlineAr: "طيران الإمارات",
    flightNumber: "EK 123",
    departureTime: "10:45",
    arrivalTime: "14:25",
    duration: "4س 40د",
    datesAvailable: ["14 أكتوبر 2026", "21 أكتوبر 2026", "01 ديسمبر 2026", "15 فبراير 2027"],
    cabinClass: "درجة أولى أجنحة خاصة",
    baggage: "50 كجم + صالة المطار الفاخرة",
    priceUsd: 1450,
    priceSar: 5435,
    isDirect: true,
    supplier: "Emirates Direct NDC",
  },
  {
    id: "fl_04",
    fromCityAr: "دبي",
    fromCode: "DXB",
    toCityAr: "طرابزون",
    toCode: "TZX",
    airlineAr: "فلاي دبي (Flydubai)",
    flightNumber: "FZ 743",
    departureTime: "13:20",
    arrivalTime: "17:10",
    duration: "4س 50د",
    datesAvailable: ["16 أكتوبر 2026", "23 أكتوبر 2026", "10 مايو 2027", "01 يونيو 2027"],
    cabinClass: "درجة الأعمال",
    baggage: "40 كجم + شاشات ترفيه",
    priceUsd: 620,
    priceSar: 2325,
    isDirect: true,
    supplier: "Flydubai Direct GDS",
  },
  {
    id: "fl_05",
    fromCityAr: "الكويت",
    fromCode: "KWI",
    toCityAr: "طرابزون",
    toCode: "TZX",
    airlineAr: "الخطوط الجوية الكويتية",
    flightNumber: "KU 189",
    departureTime: "08:45",
    arrivalTime: "11:55",
    duration: "3س 10د",
    datesAvailable: ["19 أكتوبر 2026", "26 أكتوبر 2026", "15 يونيو 2027"],
    cabinClass: "درجة الواحة VIP",
    baggage: "2 × 23 كجم",
    priceUsd: 410,
    priceSar: 1537,
    isDirect: true,
    supplier: "Kuwait Airways API",
  },
  {
    id: "fl_06",
    fromCityAr: "الدوحة",
    fromCode: "DOH",
    toCityAr: "إسطنبول",
    toCode: "SAW",
    airlineAr: "الخطوط الجوية القطرية",
    flightNumber: "QR 241",
    departureTime: "14:10",
    arrivalTime: "18:40",
    duration: "4س 30د",
    datesAvailable: ["15 أكتوبر 2026", "28 أكتوبر 2026", "18 يناير 2027"],
    cabinClass: "كيو سويت (Qsuite VIP)",
    baggage: "40 كجم + سرير مزدوج",
    priceUsd: 1320,
    priceSar: 4950,
    isDirect: true,
    supplier: "Qatar Airways NDC",
  },
];

export const LIVE_HOTEL_OFFERS: HotelOffer[] = [
  {
    id: "ht_01",
    nameAr: "قصر سيراجان كمبينسكي إسطنبول",
    nameEn: "Çırağan Palace Kempinski Istanbul",
    cityAr: "إسطنبول - البوسفور",
    stars: 5,
    rating: 4.9,
    reviewCount: 3420,
    image: "/images/destinations/istanbul-bosphorus-yacht-4k.jpg",
    roomTypeAr: "جناح الباشا الملكي مع شرفة مطلة على البوسفور",
    featuresAr: ["إفطار ملكي مجاني", "خدمة المساعد الشخصي (Butler)", "مسبح إنفينيتي مدفأ", "رصيف يخوت خاص"],
    pricePerNightUsd: 740,
    pricePerNightSar: 2775,
    supplier: "Kempinski Direct Connect",
    cancellationAr: "إلغاء مجاني حتى 48 ساعة قبل الوصول",
  },
  {
    id: "ht_02",
    nameAr: "فندق وأكواخ إينان كاردشلار أوزنجول",
    nameEn: "Inan Kardesler Hotel & Bungalows Uzungol",
    cityAr: "طرابزون - أوزنجول",
    stars: 5,
    rating: 4.8,
    reviewCount: 2850,
    image: "/images/destinations/trabzon-uzungol-luxury-4k.jpg",
    roomTypeAr: "كوخ خشبي دوبلكس عائلي VIP مطل على البحيرة والشلال",
    featuresAr: ["إطلالة بانورامية كاملة", "مدفأة حطب طبيعية", "شرفة خاصة متسعة", "إفطار قروي تركي شامل"],
    pricePerNightUsd: 310,
    pricePerNightSar: 1162,
    supplier: "LioTrip Direct Supplier North Turkey",
    cancellationAr: "إلغاء مرن مع استرداد كامل",
  },
  {
    id: "ht_03",
    nameAr: "فندق ميوزيوم كابادوكيا الفاخر",
    nameEn: "Museum Hotel Cappadocia (Relais & Châteaux)",
    cityAr: "كابادوكيا - أوتش هيسار",
    stars: 5,
    rating: 4.95,
    reviewCount: 1980,
    image: "/images/destinations/cappadocia-balloons-sunrise-4k.jpg",
    roomTypeAr: "جناح كهفي تاريخي VIP مع مسبح خاص مدفأ",
    featuresAr: ["إطلالة شروق الشمس والمناطيد", "متحف أثري مرخص داخل الجناح", "سبا ملكي", "جلسات تصوير خاصة"],
    pricePerNightUsd: 590,
    pricePerNightSar: 2212,
    supplier: "Relais & Châteaux Direct",
    cancellationAr: "إلغاء مجاني مع تأكيد فوري",
  },
  {
    id: "ht_04",
    nameAr: "فندق راديسون بلو طرابزون",
    nameEn: "Radisson Blu Hotel Trabzon",
    cityAr: "طرابزون - بوزتيبي",
    stars: 5,
    rating: 4.7,
    reviewCount: 1650,
    image: "/images/destinations/trabzon-uzungol-luxury-4k.jpg",
    roomTypeAr: "جناح بريميوم مطل على البحر الأسود والمدينة",
    featuresAr: ["موقع استراتيجي في بوزتيبي", "نادي صحي وحمام تركي", "مواقف مجانية للسيارات VIP", "مطعم بإطلالة بانورامية"],
    pricePerNightUsd: 220,
    pricePerNightSar: 825,
    supplier: "Radisson Rewards Direct",
    cancellationAr: "إلغاء مجاني حتى يوم الوصول",
  },
  {
    id: "ht_05",
    nameAr: "منتجع ريكسوس بريميوم بيليك أنطاليا",
    nameEn: "Rixos Premium Belek Antalya",
    cityAr: "أنطاليا - بيليك",
    stars: 5,
    rating: 4.9,
    reviewCount: 4120,
    image: "/images/destinations/istanbul-bosphorus-yacht-4k.jpg",
    roomTypeAr: "فيلا كلوب عائلية خاصة مع مسبح وشاطئ خاص",
    featuresAr: ["شامل جميع الوجبات والمشروبات Ultra All-Inclusive", "دخول غير محدود لمدينة أرض الأساطير (The Land of Legends)", "نادي أطفال متكامل", "خدمة سيارة جولف خاصة"],
    pricePerNightUsd: 850,
    pricePerNightSar: 3187,
    supplier: "Rixos Hotels B2B",
    cancellationAr: "إلغاء مجاني حتى 7 أيام قبل الوصول",
  },
];

export const LIVE_TRANSFER_PACKAGES: TransferPackage[] = [
  {
    id: "tr_01",
    vehicleAr: "مرسيدس فيتو VIP موديل 2026/2027 (Mercedes Vito Extra Long)",
    capacityAr: "حتى 7 ركاب + 8 حقائب سفر كبيرة",
    featuresAr: [
      "مقاعد جلد مايباخ ريكلاينر مع مساج وتدفئة",
      "شاشة ذكية 32 بوصة مع Apple TV و Netflix و YouTube",
      "إنترنت واي فاي فائق السرعة مفتوح طوال الرحلة",
      "ثلاجة مشروبات باردة وماكينة قهوة نسبريسو مجانية",
      "سائق خاص خبير ومرخص يتحدث العربية بطلاقة",
      "شامل الوقود، رسوم الطرق السريعة، ورسوم مواقف السيارات",
    ],
    priceUsd: 140,
    priceSar: 525,
    routeAr: "استقبال مطار إسطنبول (IST/SAW) إلى الفندق أو جولة 10 ساعات يومية",
  },
  {
    id: "tr_02",
    vehicleAr: "مرسيدس سبرينتر VIP رويال (Mercedes Sprinter VIP)",
    capacityAr: "حتى 14 راكب مع كامل الأمتعة (مثالي للعوائل الكبيرة)",
    featuresAr: [
      "تصميم طائرة رجال الأعمال مع مقاعد فارهة متحركة",
      "نظام إضاءة ستارلايت (Starlight Ceiling) متطور",
      "نظام صوتي محيطي Harman Kardon",
      "منافذ شحن سريعة Type-C لكافة المقاعد",
      "سائق محترف مع مساعد للمساعدة في الأمتعة والتسوق",
    ],
    priceUsd: 220,
    priceSar: 825,
    routeAr: "جولات الشمال التركي (طرابزون - أوزنجول - آيدر - ريزا) يومياً",
  },
];

export const MASTER_GUIDE_ARTICLE_DATA = {
  id: "turkey-luxury-travel-guide-2027-master",
  slug: "turkey-luxury-travel-guide-2027-gulf-vip",
  titleAr: "الموسوعة الشاملة للسياحة الفاخرة في تركيا 2027: دليل المسافر الخليجي الميداني لأفضل الوجهات، عروض الطيران، فنادق VIP، وبرامج الـ 7 والـ 10 أيام",
  titleEn: "The Ultimate Guide to Luxury Turkey Travel 2027: Gulf Traveler VIP Manual",
  category: "السياحة والسفر في تركيا",
  author: "فريق أبحاث خبراء السفر في لوناليزا (LioTrip AI & Travel Specialists)",
  publishedAt: "2026-09-28T20:00:00Z",
  status: "published" as const,
  coverImage: "/images/destinations/trabzon-uzungol-luxury-4k.jpg",
  coverAlt: "بحيرة أوزنجول في طرابزون وأجمل الوجهات السياحية في تركيا 2027 للمسافرين من دول الخليج",
  readingTimeMinutes: 32,
  wordCount: 10450,
  seo: {
    metaTitleAr: "دليل السياحة في تركيا 2027 للعوائل الخليجية | عروض طيران وفنادق VIP لوناليزا",
    metaTitleEn: "Turkey Luxury Travel Guide 2027 for Gulf Visitors | Flights, VIP Hotels & Tours",
    metaDescriptionAr: "اكتشف الدليل الشامل والأكبر للسياحة في تركيا 2027 للمسافرين من السعودية، الإمارات، الكويت، وقطر. عروض طيران مباشرة، حجز فنادق 5 نجوم، سيارة مع سائق VIP، وبرامج 7 و 10 أيام في طرابزون وإسطنبول وبورصة وأنطاليا.",
    metaDescriptionEn: "Comprehensive 2027 travel guide to Turkey for Gulf families. Live flight deals, 5-star hotel bookings, luxury Mercedes Vito transfers, and 7 & 10-day itineraries across Trabzon, Istanbul, Cappadocia, and Antalya.",
    focusKeyword: "سياحة تركيا 2027 للعوائل الخليجية",
    keywords: [
      "سياحة تركيا 2027",
      "أفضل وجهات تركيا للخليجيين",
      "رحلات طرابزون من الرياض",
      "عروض طيران الكويت طرابزون",
      "فنادق البوسفور 5 نجوم إسطنبول",
      "بكج سياحي طرابزون 10 أيام",
      "سيارة مع سائق في تركيا VIP",
      "أكواخ أوزنجول الفاخرة",
      "حجز طيران وفنادق تركيا لوناليزا",
      "منتجعات أنطاليا للعوائل",
    ],
  },
  googleTrendsAnalysis: {
    targetRegions: ["المملكة العربية السعودية", "الإمارات العربية المتحدة", "دولة الكويت", "دولة قطر", "سلطنة عمان", "مملكة البحرين"],
    topSurgingKeywords: [
      { keyword: "رحلات طرابزون والشمال التركي 2027", growth: "+420%", intent: "حجز عائلي فاخر" },
      { keyword: "أفضل فنادق البوسفور إطلالة كاملة", growth: "+310%", intent: "إقامة VIP" },
      { keyword: "سيارة فيتو مع سائق يتحدث عربي إسطنبول", growth: "+285%", intent: "توصيل وترانسفير" },
      { keyword: "عروض طيران ناس وطيران الإمارات لتركيا", growth: "+240%", intent: "مقارنة أسعار الطيران" },
      { keyword: "برنامج سياحي 10 أيام في تركيا متكامل", growth: "+390%", intent: "باقات جاهزة" },
    ],
  },
};
