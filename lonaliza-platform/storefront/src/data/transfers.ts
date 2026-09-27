import type { TransferService, TransferInput } from "@/types/transfer";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";
import { vipDailyTours } from "@/data/vip-daily-tours";

/**
 * Airport transfers (~USD 40–85) and private VIP day tours (~USD 200–350)
 * are approximate 2024–2026 Turkey market rates — not live quotes.
 */
const STORAGE_KEY = "alrayyan_transfers_v7_vip_catalog";
const OLD_STORAGE_KEY = "alrayyan_transfers_v6_vip_catalog";
const LEGACY_TRANSFER_KEYS = [
  "alrayyan_transfers_v5",
  "oktravel_transfers_v2",
  "oktravel_transfers",
];
const DEFAULT_WA = DEFAULT_SITE_WHATSAPP;

const CAR_SEDAN =
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600&q=80";
const CAR_SUV =
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1600&q=80";
const CAR_VAN =
  "https://images.unsplash.com/photo-1544620341-f53c95b3b9a7?w=1600&q=80";
const CAR_LUXURY =
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80";
const CAR_INTERIOR =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80";
const CAR_BMW =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&q=80";
const DRIVER_PHOTO =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80";

const seededTransfers: TransferService[] = [
  // ── Airport transfers ──────────────────────────────────────────────────────
  {
    id: "tr-1",
    slug: "ist-airport-sultanahmet-luxury-sedan",
    type: "transfer",
    titleAr: "ترانسفير مطار إسطنبول → سلطان أحمت — سيدان فاخرة",
    titleEn: "IST Airport → Sultanahmet Luxury Sedan",
    descriptionAr:
      "استقبال شخصي في مطار إسطنبول الدولي (IST) مع سائق محترف وسيارة سيدان فاخرة إلى فنادق ومناطق سلطان أحمت التاريخية. تتبع الرحلة، مساعدة بالأمتعة، ومياه معدنية باردة. مثالي للمسافرين القادمين لاستكشاف البساط القديم.",
    descriptionEn:
      "Personal meet & greet at Istanbul Airport (IST) with a professional chauffeur and luxury sedan to Sultanahmet hotels and the historic peninsula. Flight tracking, luggage assistance, and chilled water onboard. Ideal for travelers heading straight to Old Istanbul.",
    vehicleName: "Mercedes-Benz E-Class",
    vehicleType: "Sedan",
    vehicleClass: "Luxury",
    seats: 3,
    luggage: 3,
    price: 55,
    currency: "USD",
    durationHours: 1,
    routeFrom: "IST Airport",
    routeTo: "Sultanahmet",
    routeFromAr: "مطار إسطنبول الدولي",
    routeToAr: "سلطان أحمت",
    highlightsAr: [
      "استقبال في الصالة مع لوحة الاسم",
      "تتبع الرحلة في الوقت الفعلي",
      "مياه معدنية وواي فاي",
      "سائق يتحدث العربية والتركية والإنجليزية",
    ],
    highlightsEn: [
      "Terminal meet & greet with name board",
      "Real-time flight tracking",
      "Bottled water & WiFi",
      "Arabic, Turkish & English speaking chauffeur",
    ],
    includesAr: [
      "سيارة سيدان فاخرة حديثة",
      "سائق محترف مرخّص",
      "مساعدة بالأمتعة",
      "رسوم الطريق والجسور",
    ],
    includesEn: [
      "Late-model luxury sedan",
      "Licensed professional chauffeur",
      "Luggage assistance",
      "Toll & bridge fees",
    ],
    images: [CAR_LUXURY, CAR_SEDAN, CAR_INTERIOR],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز ترانسفير مطار IST → سلطان أحمت (سيدان فاخرة).",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book IST Airport → Sultanahmet luxury sedan transfer.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "tr-2",
    slug: "ist-airport-taksim-suv",
    type: "transfer",
    titleAr: "ترانسفير مطار إسطنبول → تقسيم — SUV",
    titleEn: "IST Airport → Taksim SUV Transfer",
    descriptionAr:
      "نقل مريح من مطار إسطنبول إلى تقسيم وشيشلي بسيارة SUV فسيحة تناسب العائلات. مساحة أمتعة واسعة، مقاعد جلدية، وتكييف قوي — وصول سريع إلى فنادق وسط المدينة.",
    descriptionEn:
      "Comfortable transfer from IST to Taksim and Şişli in a spacious SUV — perfect for families. Generous luggage space, leather seats, and powerful AC for a smooth ride to central Istanbul hotels.",
    vehicleName: "Mercedes-Benz Vito / SUV",
    vehicleType: "SUV",
    vehicleClass: "Premium",
    seats: 6,
    luggage: 6,
    price: 65,
    currency: "USD",
    durationHours: 1.25,
    routeFrom: "IST Airport",
    routeTo: "Taksim / Şişli",
    routeFromAr: "مطار إسطنبول الدولي",
    routeToAr: "تقسيم / شيشلي",
    highlightsAr: [
      "SUV فسيح لـ 6 ركاب",
      "مساحة أمتعة كبيرة",
      "مقاعد جلدية فاخرة",
      "مناسب للعائلات",
    ],
    highlightsEn: [
      "Spacious SUV for 6 passengers",
      "Large luggage capacity",
      "Premium leather seats",
      "Family-friendly",
    ],
    includesAr: [
      "سيارة SUV فاخرة",
      "سائق محترف",
      "مياه ومناشف منعشة",
      "تأمين شامل للركاب",
    ],
    includesEn: [
      "Luxury SUV vehicle",
      "Professional chauffeur",
      "Water & refreshing towels",
      "Full passenger insurance",
    ],
    images: [CAR_SUV, CAR_LUXURY, CAR_INTERIOR],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز ترانسفير مطار IST → تقسيم (SUV).",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book IST Airport → Taksim SUV transfer.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "tr-3",
    slug: "ist-airport-besiktas-transfer",
    type: "transfer",
    titleAr: "ترانسفير مطار إسطنبول → بشيكتاش",
    titleEn: "IST Airport → Beşiktaş Transfer",
    descriptionAr:
      "ترانسفير مباشر من مطار إسطنبول إلى بشيكتاش وOrtaköy ومناطق البوسفور الشمالية. سائق محترف يعرف أسرع الطرق لتجنب الازدحام وصولاً إلى فندقك على مياه البوسفور.",
    descriptionEn:
      "Direct transfer from IST to Beşiktaş, Ortaköy, and the northern Bosphorus waterfront. A professional chauffeur who knows the fastest routes to get you to your Bosphorus-side hotel efficiently.",
    vehicleName: "Mercedes-Benz E-Class",
    vehicleType: "Sedan",
    vehicleClass: "Luxury",
    seats: 3,
    luggage: 3,
    price: 58,
    currency: "USD",
    durationHours: 1.1,
    routeFrom: "IST Airport",
    routeTo: "Beşiktaş",
    routeFromAr: "مطار إسطنبول الدولي",
    routeToAr: "بشيكتاش",
    highlightsAr: [
      "وصول مباشر إلى البوسفور",
      "سائق يعرف طرق إسطنبول",
      "استقبال شخصي في المطار",
      "مرونة في نقطة الإنزال",
    ],
    highlightsEn: [
      "Direct Bosphorus access",
      "Chauffeur who knows Istanbul routes",
      "Personal airport meet & greet",
      "Flexible drop-off point",
    ],
    includesAr: [
      "سيارة سيدان فاخرة",
      "سائق محترف",
      "مساعدة بالأمتعة",
      "رسوم الطريق",
    ],
    includesEn: [
      "Luxury sedan",
      "Professional chauffeur",
      "Luggage assistance",
      "Toll fees included",
    ],
    images: [CAR_SEDAN, CAR_LUXURY, CAR_BMW],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز ترانسفير مطار IST → بشيكتاش.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book IST Airport → Beşiktaş transfer.",
    isFeatured: false,
    isActive: true,
  },
  {
    id: "tr-4",
    slug: "ist-airport-asian-side-kadikoy",
    type: "transfer",
    titleAr: "ترانسفير مطار إسطنبول → الجانب الآسيوي (Kadıköy)",
    titleEn: "IST Airport → Asian Side (Kadıköy)",
    descriptionAr:
      "عبور الجسر الثالث أو نفق أوراسيا للوصول إلى الجانب الآسيوي — Kadıköy، Üsküdar، وModa. خدمة مريحة للمسافرين الذين يقيمون في فنادق آسيا أو يزورون أقاربهم هناك.",
    descriptionEn:
      "Cross the Third Bridge or Eurasia Tunnel to reach the Asian side — Kadıköy, Üsküdar, and Moda. A comfortable service for travelers staying in Asian-side hotels or visiting family.",
    vehicleName: "Mercedes-Benz E-Class",
    vehicleType: "Sedan",
    vehicleClass: "Luxury",
    seats: 3,
    luggage: 3,
    price: 62,
    currency: "USD",
    durationHours: 1.5,
    routeFrom: "IST Airport",
    routeTo: "Kadıköy / Asian Side",
    routeFromAr: "مطار إسطنبول الدولي",
    routeToAr: "Kadıköy / الجانب الآسيوي",
    highlightsAr: [
      "عبور الجسر أو النفق",
      "وصول إلى Kadıköy وÜsküdar",
      "سائق ثنائي اللغة",
      "تتبع الرحلة",
    ],
    highlightsEn: [
      "Bridge or tunnel crossing",
      "Drop-off in Kadıköy & Üsküdar",
      "Bilingual chauffeur",
      "Flight tracking",
    ],
    includesAr: [
      "سيارة فاخرة",
      "رسوم الجسر/النفق",
      "سائق محترف",
      "مساعدة بالأمتعة",
    ],
    includesEn: [
      "Luxury vehicle",
      "Bridge/tunnel tolls",
      "Professional chauffeur",
      "Luggage assistance",
    ],
    images: [CAR_LUXURY, CAR_SEDAN, CAR_INTERIOR],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز ترانسفير مطار IST → الجانب الآسيوي (Kadıköy).",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book IST Airport → Asian Side (Kadıköy) transfer.",
    isFeatured: false,
    isActive: true,
  },
  {
    id: "tr-5",
    slug: "saw-airport-istanbul-transfer",
    type: "transfer",
    titleAr: "ترانسفير مطار صبيحة → إسطنبول",
    titleEn: "SAW Airport → Istanbul Transfer",
    descriptionAr:
      "نقل من مطار صبيحة gökçen (SAW) إلى أي منطقة في إسطنبول — سلطان أحمت، تقسيم، أو الجانب الآسيوي. خيار اقتصادي للرحلات الداخلية والاقتصادية مع نفس مستوى الخدمة الفاخرة.",
    descriptionEn:
      "Transfer from Sabiha Gökçen Airport (SAW) to any Istanbul district — Sultanahmet, Taksim, or the Asian side. A smart choice for domestic and budget flights with the same premium service standard.",
    vehicleName: "Mercedes-Benz Vito",
    vehicleType: "Van",
    vehicleClass: "Premium",
    seats: 6,
    luggage: 6,
    price: 75,
    currency: "USD",
    durationHours: 1.75,
    routeFrom: "SAW Airport",
    routeTo: "Istanbul (any district)",
    routeFromAr: "مطار صبيحة gökçen",
    routeToAr: "إسطنبول (أي منطقة)",
    highlightsAr: [
      "من SAW إلى أي منطقة",
      "فان فسيح للعائلات",
      "تتبع الرحلة",
      "سائق محترف",
    ],
    highlightsEn: [
      "SAW to any Istanbul district",
      "Spacious van for families",
      "Flight tracking",
      "Professional chauffeur",
    ],
    includesAr: [
      "فان Mercedes فاخر",
      "سائق محترف",
      "رسوم الجسر",
      "مساعدة بالأمتعة",
    ],
    includesEn: [
      "Mercedes luxury van",
      "Professional chauffeur",
      "Bridge tolls",
      "Luggage assistance",
    ],
    images: [CAR_VAN, CAR_SUV, CAR_INTERIOR],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز ترانسفير مطار SAW → إسطنبول.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book SAW Airport → Istanbul transfer.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "tr-6",
    slug: "ayt-airport-antalya-hotels",
    type: "transfer",
    titleAr: "ترانسفير مطار أنطاليا → فنادق المدينة",
    titleEn: "AYT Airport → Antalya Hotels Transfer",
    descriptionAr:
      "استقبال في مطار أنطاليا (AYT) ونقل مباشر إلى فنادق Kaleiçi، Lara، Konyaaltı، أو Belek. مثالي لبداية عطلتك على الساحل التركي مع سائق ينتظرك عند بوابة الوصول.",
    descriptionEn:
      "Meet & greet at Antalya Airport (AYT) with direct transfer to Kaleiçi, Lara, Konyaaltı, or Belek hotels. The perfect start to your Turkish Riviera holiday with a chauffeur waiting at arrivals.",
    vehicleName: "Mercedes-Benz E-Class",
    vehicleType: "Sedan",
    vehicleClass: "Luxury",
    seats: 3,
    luggage: 3,
    price: 40,
    currency: "USD",
    durationHours: 0.75,
    routeFrom: "AYT Airport",
    routeTo: "Antalya hotels",
    routeFromAr: "مطار أنطاليا",
    routeToAr: "فنادق أنطاليا",
    highlightsAr: [
      "استقبال في المطار",
      "Kaleiçi وLara وBelek",
      "سائق يتحدث العربية",
      "مياه باردة في السيارة",
    ],
    highlightsEn: [
      "Airport meet & greet",
      "Kaleiçi, Lara & Belek",
      "Arabic-speaking chauffeur",
      "Chilled water onboard",
    ],
    includesAr: [
      "سيارة فاخرة",
      "سائق محترف",
      "مساعدة بالأمتعة",
      "تأمين الركاب",
    ],
    includesEn: [
      "Luxury vehicle",
      "Professional chauffeur",
      "Luggage assistance",
      "Passenger insurance",
    ],
    images: [CAR_SEDAN, CAR_LUXURY, CAR_INTERIOR],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز ترانسفير مطار AYT → فنادق أنطاليا.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book AYT Airport → Antalya hotels transfer.",
    isFeatured: false,
    isActive: true,
  },
  {
    id: "tr-7",
    slug: "tzx-airport-trabzon-transfer",
    type: "transfer",
    titleAr: "ترانسفير مطار Trabzon → وسط المدينة",
    titleEn: "TZX Airport → Trabzon City Transfer",
    descriptionAr:
      "نقل من مطار Trabzon (TZX) إلى فنادق وسط Trabzon أو Uzungöl وAyder. بوابة مثالية لاستكشاف الساحل الأسود وجبال Kaçkar مع سائق محلي يعرف المنطقة جيداً.",
    descriptionEn:
      "Transfer from Trabzon Airport (TZX) to downtown Trabzon hotels or onward to Uzungöl and Ayder. Your gateway to the Black Sea coast and Kaçkar Mountains with a local chauffeur who knows the region.",
    vehicleName: "Mercedes-Benz Vito",
    vehicleType: "Van",
    vehicleClass: "Premium",
    seats: 6,
    luggage: 6,
    price: 45,
    currency: "USD",
    durationHours: 0.5,
    routeFrom: "TZX Airport",
    routeTo: "Trabzon city",
    routeFromAr: "مطار Trabzon",
    routeToAr: "وسط Trabzon",
    highlightsAr: [
      "سائق محلي خبير",
      "خيار Uzungöl وAyder",
      "فان للعائلات",
      "استقبال شخصي",
    ],
    highlightsEn: [
      "Expert local chauffeur",
      "Option for Uzungöl & Ayder",
      "Family van available",
      "Personal meet & greet",
    ],
    includesAr: [
      "فان فاخر",
      "سائق محترف",
      "مساعدة بالأمتعة",
      "مياه معدنية",
    ],
    includesEn: [
      "Luxury van",
      "Professional chauffeur",
      "Luggage assistance",
      "Bottled water",
    ],
    images: [CAR_VAN, CAR_SUV, CAR_INTERIOR],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز ترانسفير مطار TZX → Trabzon.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book TZX Airport → Trabzon city transfer.",
    isFeatured: false,
    isActive: true,
  },

  // ── VIP private-car day tours ──────────────────────────────────────────────
  {
    id: "vip-1",
    slug: "istanbul-full-day-vip-tour",
    type: "vip_tour",
    titleAr: "جولة إسطنبول VIP — يوم كامل",
    titleEn: "Istanbul Full Day VIP Tour",
    descriptionAr:
      "يوم خاص كامل في إسطنبول بسيارة فاخرة مع سائق VIP. يشمل آيا صوفيا، المسجد الأزرق، Topkapı، Grand Bazaar، وGalata Tower — جدول مرن مع توقفات للتصوير والغداء حسب رغبتك.",
    descriptionEn:
      "A full private day in Istanbul with a luxury vehicle and VIP chauffeur. Covers Hagia Sophia, Blue Mosque, Topkapi Palace, Grand Bazaar, and Galata Tower — flexible itinerary with photo stops and lunch at your pace.",
    vehicleName: "Mercedes-Benz S-Class",
    vehicleType: "Sedan",
    vehicleClass: "VIP",
    seats: 3,
    luggage: 2,
    price: 280,
    currency: "USD",
    durationHours: 8,
    routeFrom: "Your Istanbul hotel",
    routeTo: "Historic Istanbul circuit",
    routeFromAr: "فندقك في إسطنبول",
    routeToAr: "دائرة إسطنبول التاريخية",
    highlightsAr: [
      "آيا صوفيا والمسجد الأزرق",
      "Topkapı وGrand Bazaar",
      "Galata Tower",
      "جدول مرن 8 ساعات",
    ],
    highlightsEn: [
      "Hagia Sophia & Blue Mosque",
      "Topkapi & Grand Bazaar",
      "Galata Tower",
      "Flexible 8-hour schedule",
    ],
    includesAr: [
      "سيارة S-Class لمدة 8 ساعات",
      "سائق VIP ثنائي اللغة",
      "مياه ومشروبات منعشة",
      "مساعدة في الدخول للمعالم",
    ],
    includesEn: [
      "S-Class vehicle for 8 hours",
      "Bilingual VIP chauffeur",
      "Water & refreshments",
      "Attraction entry assistance",
    ],
    images: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&q=80",
      CAR_LUXURY,
      CAR_SEDAN,
    ],
    carPhotos: [CAR_LUXURY, CAR_SEDAN, CAR_BMW, CAR_INTERIOR],
    driverNameAr: "أحمت يلماز",
    driverNameEn: "Ahmet Yilmaz",
    driverPhoto: DRIVER_PHOTO,
    driverBioAr:
      "سائق VIP مع أكثر من 12 سنة خبرة في جولات إسطنبول. يتحدث العربية والتركية والإنجليزية ويعرف أفضل أوقات زيارة المعالم.",
    driverBioEn:
      "VIP chauffeur with 12+ years guiding Istanbul tours. Fluent in Arabic, Turkish, and English — knows the best times to visit each landmark.",
    programAr: [
      "09:00 — استلام من الفندق",
      "09:30 — آيا صوفيا والمسجد الأزرق",
      "11:30 — Topkapı Sarayı",
      "13:00 — غداء في Eminönü (اختياري)",
      "14:30 — Grand Bazaar & Spice Bazaar",
      "16:30 — Galata Tower & Karaköy",
      "18:00 — العودة إلى الفندق",
    ],
    programEn: [
      "09:00 — Hotel pickup",
      "09:30 — Hagia Sophia & Blue Mosque",
      "11:30 — Topkapi Palace",
      "13:00 — Lunch in Eminönü (optional)",
      "14:30 — Grand Bazaar & Spice Bazaar",
      "16:30 — Galata Tower & Karaköy",
      "18:00 — Return to hotel",
    ],
    mapRoute: [
      { lat: 41.0086, lng: 28.9802, labelAr: "آيا صوفيا", labelEn: "Hagia Sophia" },
      { lat: 41.0054, lng: 28.9768, labelAr: "المسجد الأزرق", labelEn: "Blue Mosque" },
      { lat: 41.0115, lng: 28.9833, labelAr: "Topkapı", labelEn: "Topkapi Palace" },
      { lat: 41.0107, lng: 28.9685, labelAr: "Grand Bazaar", labelEn: "Grand Bazaar" },
      { lat: 41.0256, lng: 28.9744, labelAr: "Galata Tower", labelEn: "Galata Tower" },
    ],
    tipsAr: [
      "ارتدِ ملابس محتشمة لزيارة المساجد",
      "احجز تذاكر Topkapı مسبقاً في موسم الذروة",
      "احمل كاش للبازار — بعض البائعين لا يقبلون البطاقة",
    ],
    tipsEn: [
      "Wear modest clothing for mosque visits",
      "Pre-book Topkapi tickets in peak season",
      "Carry cash for the bazaar — some vendors don't accept cards",
    ],
    excludedAr: [
      "تذاكر دخول المعالم",
      "وجبات الغداء والعشاء",
      "البقشيش الشخصي",
    ],
    excludedEn: [
      "Attraction entrance tickets",
      "Meals and dining",
      "Personal gratuities",
    ],
    reviews: [
      {
        id: "r-vip1-1",
        name: "Fatima A.",
        rating: 5,
        textAr: "جولة رائعة! أحمت كان محترفاً جداً ويعرف إسطنبول عن ظهر قلب.",
        textEn: "Amazing tour! Ahmet was very professional and knows Istanbul inside out.",
        date: "2025-11-12",
      },
      {
        id: "r-vip1-2",
        name: "James R.",
        rating: 5,
        textAr: "تجربة VIP حقيقية — سيارة فاخرة وجدول مرن تماماً.",
        textEn: "A true VIP experience — luxury car and a perfectly flexible schedule.",
        date: "2025-10-28",
      },
    ],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز جولة إسطنبول VIP — يوم كامل.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book the Istanbul Full Day VIP Tour.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "vip-2",
    slug: "bosphorus-asian-side-vip-tour",
    type: "vip_tour",
    titleAr: "جولة البوسفور والجانب الآسيوي VIP",
    titleEn: "Bosphorus & Asian Side VIP Tour",
    descriptionAr:
      "استكشف مضيق البوسفور والجانب الآسيوي بسيارة خاصة. Dolmabahçe Palace، Ortaköy، Üsküdar، Maiden's Tower viewpoint، وModa Sahil — مع توقفات للتصوير على جسر البوسفور.",
    descriptionEn:
      "Explore the Bosphorus strait and Asian side by private car. Dolmabahçe Palace, Ortaköy, Üsküdar, Maiden's Tower viewpoint, and Moda waterfront — with photo stops on the Bosphorus bridges.",
    vehicleName: "BMW 7 Series",
    vehicleType: "Sedan",
    vehicleClass: "VIP",
    seats: 3,
    luggage: 2,
    price: 220,
    currency: "USD",
    durationHours: 6,
    routeFrom: "Your Istanbul hotel",
    routeTo: "Bosphorus & Asian Side circuit",
    routeFromAr: "فندقك في إسطنبول",
    routeToAr: "البوسفور والجانب الآسيوي",
    highlightsAr: [
      "Dolmabahçe Palace",
      "Ortaköy & Üsküdar",
      "Maiden's Tower viewpoint",
      "Moda Sahil",
    ],
    highlightsEn: [
      "Dolmabahçe Palace",
      "Ortaköy & Üsküdar",
      "Maiden's Tower viewpoint",
      "Moda waterfront",
    ],
    includesAr: [
      "سيارة BMW 7 Series لـ 6 ساعات",
      "سائق VIP",
      "مشروبات منعشة",
      "توقفات تصوير مرنة",
    ],
    includesEn: [
      "BMW 7 Series for 6 hours",
      "VIP chauffeur",
      "Refreshments onboard",
      "Flexible photo stops",
    ],
    images: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80",
      CAR_BMW,
      CAR_LUXURY,
    ],
    carPhotos: [CAR_BMW, CAR_LUXURY, CAR_SEDAN, CAR_INTERIOR],
    driverNameAr: "Mehmet Kaya",
    driverNameEn: "Mehmet Kaya",
    driverPhoto: DRIVER_PHOTO,
    driverBioAr: "متخصص في جولات البوسفور مع معرفة عميقة بتاريخ Ortaköy وÜsküdar.",
    driverBioEn:
      "Bosphorus tour specialist with deep knowledge of Ortaköy and Üsküdar history.",
    programAr: [
      "10:00 — استلام من الفندق",
      "10:30 — Dolmabahçe Palace",
      "12:00 — Ortaköy Mosque & Bosphorus Bridge",
      "13:30 — غداء في Üsküdar",
      "15:00 — Maiden's Tower viewpoint",
      "16:00 — Moda Sahil & Kadıköy",
      "17:00 — العودة",
    ],
    programEn: [
      "10:00 — Hotel pickup",
      "10:30 — Dolmabahçe Palace",
      "12:00 — Ortaköy Mosque & Bosphorus Bridge",
      "13:30 — Lunch in Üsküdar",
      "15:00 — Maiden's Tower viewpoint",
      "16:00 — Moda waterfront & Kadıköy",
      "17:00 — Return",
    ],
    mapRoute: [
      { lat: 41.0391, lng: 29.0002, labelAr: "Dolmabahçe", labelEn: "Dolmabahçe Palace" },
      { lat: 41.0553, lng: 29.0267, labelAr: "Ortaköy", labelEn: "Ortaköy" },
      { lat: 41.0214, lng: 29.0152, labelAr: "Üsküdar", labelEn: "Üsküdar" },
      { lat: 40.9889, lng: 29.0256, labelAr: "Moda", labelEn: "Moda" },
    ],
    tipsAr: [
      "أفضل وقت للتصوير على الجسر: قبل الغروب",
      "Dolmabahçe يتطلب حجز مسبق",
    ],
    tipsEn: [
      "Best bridge photo time: before sunset",
      "Dolmabahçe requires advance booking",
    ],
    excludedAr: ["تذاكر Dolmabahçe", "الغداء", "جولة البوسفور بالقارب"],
    excludedEn: ["Dolmabahçe tickets", "Lunch", "Bosphorus boat cruise"],
    reviews: [
      {
        id: "r-vip2-1",
        name: "Sara M.",
        rating: 5,
        textAr: "منظر البوسفور لا يُنسى — السائق توقف في أفضل النقاط للتصوير.",
        textEn: "Unforgettable Bosphorus views — the driver stopped at the best photo spots.",
        date: "2025-12-03",
      },
    ],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز جولة البوسفور والجانب الآسيوي VIP.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book the Bosphorus & Asian Side VIP Tour.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "vip-3",
    slug: "bursa-day-trip-vip",
    type: "vip_tour",
    titleAr: "رحلة بورصة VIP — يوم كامل",
    titleEn: "Bursa Day Trip VIP",
    descriptionAr:
      "رحلة يومية خاصة إلى بورصة — أول عاصمة للدولة العثمانية. Uludağ Teleferik، Green Mosque & Tomb، Grand Bazaar، وCumalıkızık village. عبور Marmara Sea Bridge بسيارة فاخرة.",
    descriptionEn:
      "A private day trip to Bursa — the first Ottoman capital. Uludağ cable car, Green Mosque & Tomb, Grand Bazaar, and Cumalıkızık village. Cross the Marmara Sea Bridge in a luxury vehicle.",
    vehicleName: "Mercedes-Benz V-Class",
    vehicleType: "Van",
    vehicleClass: "VIP",
    seats: 6,
    luggage: 4,
    price: 320,
    currency: "USD",
    durationHours: 10,
    routeFrom: "Istanbul hotel",
    routeTo: "Bursa landmarks circuit",
    routeFromAr: "فندق إسطنبول",
    routeToAr: "دائرة معالم بورصة",
    highlightsAr: [
      "Uludağ Teleferik",
      "Green Mosque & Tomb",
      "Cumalıkızık village",
      "عبور جسر Marmara",
    ],
    highlightsEn: [
      "Uludağ cable car",
      "Green Mosque & Tomb",
      "Cumalıkızık village",
      "Marmara Bridge crossing",
    ],
    includesAr: [
      "فان V-Class لـ 10 ساعات",
      "سائق VIP",
      "مياه ومشروبات",
      "مرونة في التوقفات",
    ],
    includesEn: [
      "V-Class van for 10 hours",
      "VIP chauffeur",
      "Water & refreshments",
      "Flexible stops",
    ],
    images: [
      "https://images.unsplash.com/photo-1599640840505-8d9a1a8e2a0a?w=1600&q=80",
      CAR_VAN,
      CAR_SUV,
    ],
    carPhotos: [CAR_VAN, CAR_SUV, CAR_LUXURY, CAR_INTERIOR],
    driverNameAr: "Emre Demir",
    driverNameEn: "Emre Demir",
    driverPhoto: DRIVER_PHOTO,
    driverBioAr: "خبير في رحلات بورصة وUludağ — يعرف أفضل مطاعم الكباب في المدينة.",
    driverBioEn:
      "Bursa and Uludağ trip expert — knows the best kebab restaurants in town.",
    programAr: [
      "07:30 — مغادرة إسطنبول",
      "09:30 — Green Mosque & Tomb",
      "11:00 — Uludağ Teleferik",
      "13:00 — غداء Iskender kebab",
      "14:30 — Grand Bazaar",
      "16:00 — Cumalıkızık village",
      "18:00 — العودة إلى إسطنبول",
    ],
    programEn: [
      "07:30 — Depart Istanbul",
      "09:30 — Green Mosque & Tomb",
      "11:00 — Uludağ cable car",
      "13:00 — Iskender kebab lunch",
      "14:30 — Grand Bazaar",
      "16:00 — Cumalıkızık village",
      "18:00 — Return to Istanbul",
    ],
    mapRoute: [
      { lat: 40.1826, lng: 29.0669, labelAr: "Green Mosque", labelEn: "Green Mosque" },
      { lat: 40.1089, lng: 29.0089, labelAr: "Uludağ", labelEn: "Uludağ" },
      { lat: 40.1747, lng: 29.1714, labelAr: "Cumalıkızık", labelEn: "Cumalıkızık" },
    ],
    tipsAr: [
      "البرد في Uludağ — احمل سترة",
      "جرب Iskender kebab — طبق بورصة الشهير",
    ],
    tipsEn: [
      "Uludağ can be cold — bring a jacket",
      "Try Iskender kebab — Bursa's famous dish",
    ],
    excludedAr: ["تذاكر Teleferik", "الغداء", "تذاكر المعالم"],
    excludedEn: ["Cable car tickets", "Lunch", "Attraction tickets"],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز رحلة بورصة VIP — يوم كامل.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book the Bursa Day Trip VIP.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "vip-4",
    slug: "sapanca-masukiye-vip-tour",
    type: "vip_tour",
    titleAr: "رحلة Sapanca & Masukiye VIP",
    titleEn: "Sapanca & Masukiye VIP Tour",
    descriptionAr:
      "هروب طبيعي من إسطنبول إلى بحيرة Sapanca وMasukiye — غابات، شلالات، ومطاعم السمك الطازج. يوم هادئ بسيارة خاصة مع توقفات في Kartepe viewpoint.",
    descriptionEn:
      "A nature escape from Istanbul to Lake Sapanca and Masukiye — forests, waterfalls, and fresh trout restaurants. A peaceful day by private car with stops at the Kartepe viewpoint.",
    vehicleName: "Mercedes-Benz Vito",
    vehicleType: "Van",
    vehicleClass: "VIP",
    seats: 6,
    luggage: 4,
    price: 240,
    currency: "USD",
    durationHours: 8,
    routeFrom: "Istanbul hotel",
    routeTo: "Sapanca & Masukiye",
    routeFromAr: "فندق إسطنبول",
    routeToAr: "Sapanca & Masukiye",
    highlightsAr: [
      "بحيرة Sapanca",
      "شلالات Masukiye",
      "مطاعم السمك الطازج",
      "Kartepe viewpoint",
    ],
    highlightsEn: [
      "Lake Sapanca",
      "Masukiye waterfalls",
      "Fresh trout restaurants",
      "Kartepe viewpoint",
    ],
    includesAr: [
      "فان فاخر لـ 8 ساعات",
      "سائق VIP",
      "مياه ومشروبات",
      "توقفات مرنة",
    ],
    includesEn: [
      "Luxury van for 8 hours",
      "VIP chauffeur",
      "Water & refreshments",
      "Flexible stops",
    ],
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
      CAR_VAN,
      CAR_SUV,
    ],
    carPhotos: [CAR_VAN, CAR_SUV, CAR_LUXURY],
    driverNameAr: "Can Öztürk",
    driverNameEn: "Can Öztürk",
    driverPhoto: DRIVER_PHOTO,
    driverBioAr: "يختص في رحلات الطبيعة قرب إسطنبول — يعرف أفضل مطاعم Masukiye.",
    driverBioEn:
      "Nature trip specialist near Istanbul — knows the best Masukiye restaurants.",
    programAr: [
      "09:00 — مغادرة إسطنبول",
      "10:30 — Sapanca Lake walk",
      "12:00 — غداء سمك في Masukiye",
      "14:00 — Masukiye waterfalls",
      "15:30 — Kartepe viewpoint",
      "17:00 — العودة",
    ],
    programEn: [
      "09:00 — Depart Istanbul",
      "10:30 — Sapanca Lake walk",
      "12:00 — Trout lunch in Masukiye",
      "14:00 — Masukiye waterfalls",
      "15:30 — Kartepe viewpoint",
      "17:00 — Return",
    ],
    mapRoute: [
      { lat: 40.6914, lng: 30.2669, labelAr: "Sapanca", labelEn: "Lake Sapanca" },
      { lat: 40.6533, lng: 30.1967, labelAr: "Masukiye", labelEn: "Masukiye" },
      { lat: 40.7456, lng: 30.0233, labelAr: "Kartepe", labelEn: "Kartepe" },
    ],
    tipsAr: ["احمل حذاءً مريحاً للمشي", "جرب السمك المشوي في Masukiye"],
    tipsEn: ["Wear comfortable walking shoes", "Try grilled trout in Masukiye"],
    excludedAr: ["الغداء", "أنشطة الزipline", "تذاكر المعالم"],
    excludedEn: ["Lunch", "Zipline activities", "Attraction tickets"],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز رحلة Sapanca & Masukiye VIP.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book the Sapanca & Masukiye VIP Tour.",
    isFeatured: false,
    isActive: true,
  },
  {
    id: "vip-5",
    slug: "trabzon-sumela-vip-tour",
    type: "vip_tour",
    titleAr: "جولة Trabzon & Sümela VIP",
    titleEn: "Trabzon & Sümela Monastery VIP Tour",
    descriptionAr:
      "استكشف Trabzon ودير Sümela المعلق على المنحdr — Atatürk Köşkü، Boztepe viewpoint، وUzungöl (اختياري). سائق محلي خبير في منطقة الساحل الأسود.",
    descriptionEn:
      "Explore Trabzon and the cliff-hanging Sümela Monastery — Atatürk Köşkü, Boztepe viewpoint, and optional Uzungöl extension. A local expert chauffeur for the Black Sea region.",
    vehicleName: "Mercedes-Benz Vito",
    vehicleType: "Van",
    vehicleClass: "VIP",
    seats: 6,
    luggage: 4,
    price: 260,
    currency: "USD",
    durationHours: 9,
    routeFrom: "Trabzon hotel",
    routeTo: "Sümela & Trabzon circuit",
    routeFromAr: "فندق Trabzon",
    routeToAr: "Sümela وTrabzon",
    highlightsAr: [
      "دير Sümela",
      "Atatürk Köşkü",
      "Boztepe panorama",
      "خيار Uzungöl",
    ],
    highlightsEn: [
      "Sümela Monastery",
      "Atatürk Köşkü",
      "Boztepe panorama",
      "Optional Uzungöl",
    ],
    includesAr: [
      "فان فاخر لـ 9 ساعات",
      "سائق محلي خبير",
      "مياه ومشروبات",
      "مساعدة في المسارات",
    ],
    includesEn: [
      "Luxury van for 9 hours",
      "Expert local chauffeur",
      "Water & refreshments",
      "Trail assistance",
    ],
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
      CAR_VAN,
      CAR_SUV,
    ],
    carPhotos: [CAR_VAN, CAR_SUV, CAR_LUXURY],
    driverNameAr: "Hakan Arslan",
    driverNameEn: "Hakan Arslan",
    driverPhoto: DRIVER_PHOTO,
    driverBioAr: "من Trabzon — يعرف كل مسارات Sümela وأفضل أوقات الزيارة.",
    driverBioEn:
      "From Trabzon — knows every Sümela trail and the best visiting times.",
    programAr: [
      "08:00 — استلام من الفندق",
      "09:30 — Sümela Monastery",
      "12:00 — غداء في Maçka",
      "14:00 — Atatürk Köşkü",
      "15:30 — Boztepe viewpoint",
      "17:00 — العودة",
    ],
    programEn: [
      "08:00 — Hotel pickup",
      "09:30 — Sümela Monastery",
      "12:00 — Lunch in Maçka",
      "14:00 — Atatürk Köşkü",
      "15:30 — Boztepe viewpoint",
      "17:00 — Return",
    ],
    mapRoute: [
      { lat: 40.6897, lng: 39.6583, labelAr: "Sümela", labelEn: "Sümela Monastery" },
      { lat: 41.0028, lng: 39.7306, labelAr: "Atatürk Köşkü", labelEn: "Atatürk Köşkü" },
      { lat: 41.0089, lng: 39.7233, labelAr: "Boztepe", labelEn: "Boztepe" },
    ],
    tipsAr: [
      "Sümela يتطلب مشياً — احمل حذاءً رياضياً",
      "الضباب صباحاً — أفضل وقت بعد 10:00",
    ],
    tipsEn: [
      "Sümela requires hiking — wear sports shoes",
      "Morning fog — best after 10:00 AM",
    ],
    excludedAr: ["تذاكر Sümela", "الغداء", "تمديد Uzungöl"],
    excludedEn: ["Sümela tickets", "Lunch", "Uzungöl extension"],
    reviews: [
      {
        id: "r-vip5-1",
        name: "Abdullah K.",
        rating: 5,
        textAr: "Hakan دليل ممتاز — Sümela تجربة لا تُنسى!",
        textEn: "Hakan is an excellent guide — Sümela is an unforgettable experience!",
        date: "2025-09-15",
      },
    ],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز جولة Trabzon & Sümela VIP.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book the Trabzon & Sümela VIP Tour.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "vip-6",
    slug: "antalya-old-town-waterfalls-vip",
    type: "vip_tour",
    titleAr: "جولة Kaleiçi والشلالات VIP — أنطاليا",
    titleEn: "Antalya Old Town & Waterfalls VIP Tour",
    descriptionAr:
      "يوم خاص في أنطاليا: Kaleiçi Old Town، Hadrian's Gate، Düden Waterfalls، وKurşunlu — مع توقف للسباحة في Konyaaltı beach. مثالي لعائلات الساحل التركي.",
    descriptionEn:
      "A private day in Antalya: Kaleiçi Old Town, Hadrian's Gate, Düden Waterfalls, and Kurşunlu — with a swim stop at Konyaaltı beach. Perfect for Turkish Riviera families.",
    vehicleName: "Mercedes-Benz E-Class",
    vehicleType: "Sedan",
    vehicleClass: "VIP",
    seats: 3,
    luggage: 2,
    price: 200,
    currency: "USD",
    durationHours: 7,
    routeFrom: "Antalya hotel",
    routeTo: "Antalya landmarks circuit",
    routeFromAr: "فندق أنطاليا",
    routeToAr: "دائرة معالم أنطاليا",
    highlightsAr: [
      "Kaleiçi Old Town",
      "Düden Waterfalls",
      "Kurşunlu Waterfall",
      "Konyaaltı beach",
    ],
    highlightsEn: [
      "Kaleiçi Old Town",
      "Düden Waterfalls",
      "Kurşunlu Waterfall",
      "Konyaaltı beach",
    ],
    includesAr: [
      "سيارة فاخرة لـ 7 ساعات",
      "سائق VIP",
      "مياه ومشروبات",
      "توقف شاطئ اختياري",
    ],
    includesEn: [
      "Luxury vehicle for 7 hours",
      "VIP chauffeur",
      "Water & refreshments",
      "Optional beach stop",
    ],
    images: [
      "https://images.unsplash.com/photo-1583417319070-4a2b290088a4?w=1600&q=80",
      CAR_SEDAN,
      CAR_LUXURY,
    ],
    carPhotos: [CAR_SEDAN, CAR_LUXURY, CAR_BMW],
    driverNameAr: "Serkan Yıldız",
    driverNameEn: "Serkan Yıldız",
    driverPhoto: DRIVER_PHOTO,
    driverBioAr: "دليل أنطاليا المحلي — يعرف أفضل الشواطئ والشلالات.",
    driverBioEn:
      "Local Antalya guide — knows the best beaches and waterfalls.",
    programAr: [
      "09:00 — استلام من الفندق",
      "09:30 — Kaleiçi & Hadrian's Gate",
      "11:00 — Düden Waterfalls",
      "13:00 — غداء في Old Town",
      "14:30 — Kurşunlu Waterfall",
      "16:00 — Konyaaltı beach",
      "17:00 — العودة",
    ],
    programEn: [
      "09:00 — Hotel pickup",
      "09:30 — Kaleiçi & Hadrian's Gate",
      "11:00 — Düden Waterfalls",
      "13:00 — Lunch in Old Town",
      "14:30 — Kurşunlu Waterfall",
      "16:00 — Konyaaltı beach",
      "17:00 — Return",
    ],
    mapRoute: [
      { lat: 36.8841, lng: 30.7056, labelAr: "Kaleiçi", labelEn: "Kaleiçi" },
      { lat: 36.8867, lng: 30.7828, labelAr: "Düden", labelEn: "Düden Waterfalls" },
      { lat: 36.9167, lng: 30.6833, labelAr: "Kurşunlu", labelEn: "Kurşunlu" },
      { lat: 36.8967, lng: 30.6533, labelAr: "Konyaaltı", labelEn: "Konyaaltı Beach" },
    ],
    tipsAr: ["احمل ملابس سباحة لKonyaaltı", "Kaleiçi أفضل في الصباح الباكر"],
    tipsEn: ["Bring swimwear for Konyaaltı", "Kaleiçi is best early morning"],
    excludedAr: ["تذاكر الشلالات", "الغداء", "معدات الشاطئ"],
    excludedEn: ["Waterfall tickets", "Lunch", "Beach equipment"],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز جولة Kaleiçi والشلالات VIP — أنطاليا.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book the Antalya Old Town & Waterfalls VIP Tour.",
    isFeatured: false,
    isActive: true,
  },
  {
    id: "vip-7",
    slug: "cappadocia-vip-transfer-tour",
    type: "vip_tour",
    titleAr: "جولة كابادوكيا VIP — ترانسفير + يوم خاص",
    titleEn: "Cappadocia VIP Transfer & Day Tour",
    descriptionAr:
      "نقل من Kayseri أو Nevşehir airport مع جولة VIP يوم كامل: Göreme Open Air Museum، Love Valley، Uçhisar Castle، وAvanos pottery — مع خيار رحلة المنطاد عند الشروق (حجز منفصل).",
    descriptionEn:
      "Transfer from Kayseri or Nevşehir airport plus a full VIP day tour: Göreme Open Air Museum, Love Valley, Uçhisar Castle, and Avanos pottery — with optional sunrise balloon ride (separate booking).",
    vehicleName: "Mercedes-Benz V-Class",
    vehicleType: "Van",
    vehicleClass: "VIP",
    seats: 6,
    luggage: 6,
    price: 350,
    currency: "USD",
    durationHours: 10,
    routeFrom: "ASR / NAV Airport or hotel",
    routeTo: "Cappadocia highlights circuit",
    routeFromAr: "مطار Kayseri/Nevşehir أو الفندق",
    routeToAr: "دائرة معالم كابادوكيا",
    highlightsAr: [
      "Göreme Open Air Museum",
      "Love Valley & Uçhisar",
      "Avanos pottery workshop",
      "خيار المنطاد",
    ],
    highlightsEn: [
      "Göreme Open Air Museum",
      "Love Valley & Uçhisar",
      "Avanos pottery workshop",
      "Optional balloon ride",
    ],
    includesAr: [
      "نقل من المطار + فان VIP 10 ساعات",
      "سائق/دليل محلي",
      "مياه ومشروبات",
      "ورشة فخار في Avanos",
    ],
    includesEn: [
      "Airport transfer + VIP van 10 hours",
      "Local chauffeur/guide",
      "Water & refreshments",
      "Avanos pottery workshop visit",
    ],
    images: [
      "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=1600&q=80",
      CAR_VAN,
      CAR_SUV,
    ],
    carPhotos: [CAR_VAN, CAR_SUV, CAR_LUXURY, CAR_INTERIOR],
    driverNameAr: "Murat Güneş",
    driverNameEn: "Murat Güneş",
    driverPhoto: DRIVER_PHOTO,
    driverBioAr:
      "دليل كابادوكيا معتمد — 15 سنة خبرة في وادي Göreme والمناطاد.",
    driverBioEn:
      "Certified Cappadocia guide — 15 years experience in Göreme Valley and balloon logistics.",
    programAr: [
      "05:30 — استلام من المطار (اختياري: المنطاد)",
      "08:30 — Göreme Open Air Museum",
      "10:30 — Love Valley viewpoint",
      "12:00 — غداء في Uçhisar",
      "14:00 — Uçhisar Castle",
      "15:30 — Avanos pottery workshop",
      "17:00 — التوصيل إلى الفندق",
    ],
    programEn: [
      "05:30 — Airport pickup (optional: balloon ride)",
      "08:30 — Göreme Open Air Museum",
      "10:30 — Love Valley viewpoint",
      "12:00 — Lunch in Uçhisar",
      "14:00 — Uçhisar Castle",
      "15:30 — Avanos pottery workshop",
      "17:00 — Hotel drop-off",
    ],
    mapRoute: [
      { lat: 38.6431, lng: 34.8289, labelAr: "Göreme", labelEn: "Göreme Museum" },
      { lat: 38.6583, lng: 34.8083, labelAr: "Love Valley", labelEn: "Love Valley" },
      { lat: 38.6289, lng: 34.8056, labelAr: "Uçhisar", labelEn: "Uçhisar Castle" },
      { lat: 38.7156, lng: 34.8467, labelAr: "Avanos", labelEn: "Avanos" },
    ],
    tipsAr: [
      "احجز المنطاد قبل 48 ساعة",
      "أفضل وقت للتصوير: Golden hour",
      "احمل قبعة وواقي شمس",
    ],
    tipsEn: [
      "Book balloon ride 48 hours ahead",
      "Best photo time: golden hour",
      "Bring hat and sunscreen",
    ],
    excludedAr: [
      "رحلة المنطاد",
      "تذاكر Göreme Museum",
      "الغداء",
    ],
    excludedEn: [
      "Hot air balloon ride",
      "Göreme Museum tickets",
      "Lunch",
    ],
    reviews: [
      {
        id: "r-vip7-1",
        name: "Layla H.",
        rating: 5,
        textAr: "Murat نظّم كل شيء بإتقان — كابادوكيا حلم!",
        textEn: "Murat organized everything perfectly — Cappadocia is a dream!",
        date: "2025-08-20",
      },
    ],
    whatsappNumber: DEFAULT_WA,
    whatsappMessageAr:
      "مرحباً لوناليزا للسياحة والسفر، أرغب بحجز جولة كابادوكيا VIP — نقل + يوم خاص.",
    whatsappMessageEn:
      "Hello Alrayyan Tourism, I would like to book the Cappadocia VIP Transfer & Day Tour.",
    isFeatured: true,
    isActive: true,
  },
];

export const defaultTransfers: TransferService[] = [
  ...seededTransfers.filter((item) => item.type === "transfer"),
  ...vipDailyTours,
];

function save(items: TransferService[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function migrateIfNeeded(items: TransferService[]): TransferService[] {
  return items.map((t) => {
    const legacy = t as TransferService & {
      highlights?: string[];
      includes?: string[];
    };
    return {
      ...t,
      vehicleClass: t.vehicleClass || "Standard",
      highlightsAr: t.highlightsAr?.length
        ? t.highlightsAr
        : legacy.highlights || [],
      highlightsEn: t.highlightsEn?.length
        ? t.highlightsEn
        : legacy.highlights || [],
      includesAr: t.includesAr?.length ? t.includesAr : legacy.includes || [],
      includesEn: t.includesEn?.length ? t.includesEn : legacy.includes || [],
      routeFromAr: t.routeFromAr || t.routeFrom || "",
      routeToAr: t.routeToAr || t.routeTo || "",
      whatsappNumber: t.whatsappNumber || DEFAULT_WA,
      whatsappMessageAr:
        t.whatsappMessageAr ||
        `مرحباً، أرغب بالحجز: ${t.titleAr}`,
      whatsappMessageEn:
        t.whatsappMessageEn ||
        `Hello, I would like to book: ${t.titleEn}`,
    };
  });
}

function mergeMissingDefaults(stored: TransferService[]): TransferService[] {
  const byId = new Map(stored.map((item) => [item.id, item]));
  for (const item of defaultTransfers) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return migrateIfNeeded([...byId.values()]);
}

export function getTransfers(): TransferService[] {
  if (typeof window === "undefined") return defaultTransfers;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return mergeMissingDefaults(JSON.parse(stored) as TransferService[]);
    } catch {
      return defaultTransfers;
    }
  }
  localStorage.removeItem(OLD_STORAGE_KEY);
  for (const key of LEGACY_TRANSFER_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  save(defaultTransfers);
  return defaultTransfers;
}

export function getActiveTransfers(): TransferService[] {
  return getTransfers().filter((t) => t.isActive);
}

export async function fetchDynamicTransfers(): Promise<TransferService[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/transfers/catalog", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.list) && data.list.length > 0) {
        return data.list;
      }
    } catch {
      /* fallback to seeded */
    }
  }
  return getActiveTransfers();
}

export function getFeaturedTransfers(): TransferService[] {
  return getActiveTransfers().filter((t) => t.isFeatured);
}

/**
 * Homepage VIP daily-tour carousel — internal catalog only (`type=vip_tour`).
 * Never includes airport transfers. If a stored catalog has no VIP tours
 * (stale localStorage), seed the default Istanbul / Bosphorus / Cappadocia set.
 */
export function ensureVipDailyTours(): TransferService[] {
  const items = getTransfers();
  if (items.some((item) => item.type === "vip_tour")) {
    return items;
  }
  const seeded = defaultTransfers.filter((item) => item.type === "vip_tour");
  const next = [...items, ...seeded];
  if (typeof window !== "undefined") {
    save(next);
  }
  return next;
}

export function getFeaturedVipDailyTours(): TransferService[] {
  const vip = ensureVipDailyTours().filter(
    (item) => item.isActive && item.type === "vip_tour"
  );
  return [...vip].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured)
  );
}

export function getTransferBySlug(slug: string): TransferService | undefined {
  return getTransfers().find((t) => t.slug === slug);
}

export function getTransferById(id: string): TransferService | undefined {
  return getTransfers().find((t) => t.id === id);
}

export function addTransfer(input: TransferInput): TransferService {
  const items = getTransfers();
  const item: TransferService = { ...input, id: Date.now().toString() };
  items.unshift(item);
  save(items);
  return item;
}

export function updateTransfer(
  id: string,
  data: Partial<TransferService>
): TransferService | null {
  const items = getTransfers();
  const idx = items.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data, id };
  save(items);
  return items[idx];
}

export function deleteTransfer(id: string): boolean {
  const remaining = getTransfers().filter((t) => t.id !== id && t.slug !== id);
  save(remaining);
  return true;
}

export function resetTransfers() {
  localStorage.removeItem(OLD_STORAGE_KEY);
  for (const key of LEGACY_TRANSFER_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  save(defaultTransfers);
}
