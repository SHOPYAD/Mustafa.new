/** Shared import-service type labels (safe for client + server). */

export const IMPORT_SERVICE_TYPES = [
  "hotel",
  "transfer",
  "flight",
  "package",
  "tour",
  "visa",
] as const;

export type ImportServiceType = (typeof IMPORT_SERVICE_TYPES)[number];

export function importSchemaPrompt(type: ImportServiceType): string {
  const schemas: Record<ImportServiceType, string> = {
    hotel: `HotelInput (بدون id):
{
  "slug": "kebab-case",
  "nameAr": "اسم الفندق بالعربية حصراً",
  "nameEn": "Hotel Name in English Only",
  "city": "Istanbul", "country": "Turkey",
  "neighborhoodAr": "تقسيم / إسطنبول", "neighborhoodEn": "Taksim / Istanbul",
  "stars": 5, "rating": 4.8, "reviewCount": 850,
  "addressAr": "العنوان بالعربية", "addressEn": "Address in English",
  "descriptionAr": "وصف الفندق بالعربية فقط 100% دون خلط لغات",
  "descriptionEn": "Hotel description in English only (100% pure English)",
  "highlightsAr": ["إطلالة بوسفور ساحرة", "مسبح داخلي وسبا فاخر"],
  "highlightsEn": ["Stunning Bosphorus View", "Luxury Spa & Indoor Pool"],
  "images": ["https://images.unsplash.com/..."],
  "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Fitness Center", "Restaurant"],
  "rooms": [{
    "id": "r1",
    "nameAr": "غرفة ديلوكس كينغ",
    "nameEn": "Deluxe King Room",
    "descriptionAr": "غرفة واسعة بإطلالة خلابة مع سرير كينغ",
    "descriptionEn": "Spacious room with king bed and scenic view",
    "beds": "1 King Bed", "capacity": 2, "sizeSqm": 42,
    "price": 280, "currency": "USD",
    "amenities": ["WiFi", "Mini Bar", "AC", "Safe Box"],
    "images": ["https://images.unsplash.com/..."],
    "breakfastIncluded": true, "freeCancellation": true
  }],
  "lat": 41.0082, "lng": 28.9784,
  "checkIn": "14:00", "checkOut": "12:00",
  "policiesAr": ["تسجيل الوصول من الساعة 14:00", "تسجيل المغادرة حتى الساعة 12:00"],
  "policiesEn": ["Check-in from 14:00", "Check-out until 12:00"],
  "whatsappNumber": "905321796763",
  "whatsappMessageAr": "مرحباً، أود حجز إقامة في هذا الفندق",
  "whatsappMessageEn": "Hello, I would like to book a stay at this hotel",
  "phone": "+90 532 179 6763", "website": "https://...",
  "isFeatured": true, "isActive": true
}`,
    transfer: `TransferInput (بدون id):
{
  "slug": "kebab-case",
  "type": "transfer" | "vip_tour",
  "titleAr": "عنوان خدمة النقل بالعربية حصراً",
  "titleEn": "Transfer / VIP Tour Title in English Only",
  "descriptionAr": "الوصف بالعربية فقط 100% دون خلط لغات",
  "descriptionEn": "Service description in English only",
  "vehicleName": "Mercedes-Benz Vito VIP",
  "vehicleType": "Van",
  "vehicleClass": "VIP",
  "seats": 6, "luggage": 6,
  "price": 65, "currency": "USD", "durationHours": 1.5,
  "routeFrom": "Istanbul Airport (IST)", "routeTo": "Taksim / Sultanahmet",
  "routeFromAr": "مطار إسطنبول الدولي (IST)", "routeToAr": "تقسيم / سلطان أحمت",
  "highlightsAr": ["استقبال خاص في صالة المطار بلوحة الاسم", "سيارة VIP حديثة ومكيفة مع واي فاي ومياه باردة"],
  "highlightsEn": ["Airport Meet & Greet with Name Sign", "Modern VIP Vehicle with WiFi & Bottled Water"],
  "includesAr": ["سيارة خاصة مع سائق محترف", "رسوم الطرق والجسور ومواقف المطار"],
  "includesEn": ["Private vehicle with professional chauffeur", "All highway, bridge, and airport parking tolls"],
  "images": ["https://images.unsplash.com/..."],
  "whatsappNumber": "905321796763",
  "whatsappMessageAr": "مرحباً، أود حجز هذه الخدمة",
  "whatsappMessageEn": "Hello, I would like to book this service",
  "isFeatured": true, "isActive": true
}`,
    flight: `Flight (بدون id):
{
  "airline": "Turkish Airlines", "airlineLogo": "✈️", "flightNumber": "TK 1821",
  "departure": { "time": "08:30", "city": "Istanbul", "airport": "IST" },
  "arrival": { "time": "10:00", "city": "Cappadocia", "airport": "NAV" },
  "duration": "1h 30m", "stops": 0, "price": 85, "currency": "USD",
  "amenities": ["Baggage 20kg", "In-flight Snacks", "Free Seat Selection"],
  "isActive": true
}`,
    package: `HolidayPackage (بدون id):
{
  "slug": "kebab-case-english-only",
  "title": "عنوان البرنامج الرئيسي بالعربية",
  "titleAr": "عنوان البرنامج السياحي باللغة العربية حصراً وواضح جداً",
  "titleEn": "Tour Package Title in Pure English Only",
  "titleTr": "Tur Paketi Başlığı Saf Türkçe Olarak",
  "destination": "الوجهة بالعربية (مثل: كبادوكيا)",
  "destinationAr": "الوجهة بالعربية (مثل: كبادوكيا، تركيا)",
  "destinationEn": "Destination in English (e.g. Cappadocia, Turkey)",
  "destinationTr": "Kapadokya, Türkiye",
  "country": "تركيا",
  "countryAr": "تركيا",
  "countryEn": "Turkey",
  "countryTr": "Türkiye",
  "durationDays": 4,
  "durationNights": 3,
  "price": 450,
  "currency": "USD",
  "rating": 4.9,
  "images": [
    { "url": "https://images.unsplash.com/...", "alt": "High quality descriptive alt", "width": 1200, "height": 800 }
  ],
  "amenities": ["Domestic Flights", "Cave Hotel", "Daily Guided Tours", "Airport Transfers"],
  "amenitiesAr": ["طيران داخلي مشمول", "إقامة في فندق كهفي فاخر", "جولات سياحية يومية مع مرشد", "توصيل المطار ذهاباً وإياباً"],
  "isFeatured": true,
  "isPublished": true,
  "description": "الوصف بالعربية حصراً",
  "descriptionAr": "الوصف التفصيلي الشامل للبرنامج باللغة العربية حصراً 100% دون كتابة أي نص إنجليزي داخله إطلاقاً.",
  "descriptionEn": "Comprehensive, professional, high-converting tour package description in 100% pure English only. No Arabic mixed in.",
  "descriptionTr": "Kapsamlı ve profesyonel tur paketi açıklaması saf Türkçe olarak 100%.",
  "inclusions": ["Round-trip domestic flights", "Hotel accommodation with breakfast", "Guided tours with lunch", "All transfers"],
  "inclusionsAr": ["تذاكر الطيران الداخلي ذهاباً وإياباً", "إقامة فندقية فاخرة مع وجبة الإفطار", "جولات سياحية يومية برفقة مرشد مع وجبة الغداء", "جميع التنقلات والاستقبال والتوديع في المطار"],
  "inclusionsEn": ["Round-trip domestic flight tickets", "Hotel accommodation with daily breakfast", "Daily guided sightseeing tours with lunch", "All airport and excursion transfers"],
  "exclusions": ["International flights", "Personal expenses", "Optional activities"],
  "exclusionsAr": ["تذاكر الطيران الدولي", "المصاريف الشخصية والأنشطة الاختيارية", "وجبات العشاء غير المذكورة"],
  "exclusionsEn": ["International flight tickets", "Personal expenses and optional activities", "Unlisted dinners and drinks"],
  "itinerary": [
    { "day": 1, "title": "اليوم الأول: الوصول والاستقبال", "description": "شرح اليوم الأول بالعربية" }
  ],
  "itineraryAr": [
    { "day": 1, "title": "اليوم الأول: الوصول والاستقبال وبدء الجولة", "description": "شرح تفصيلي لما سيحدث في اليوم الأول باللغة العربية فقط 100%." }
  ],
  "itineraryEn": [
    { "day": 1, "title": "Day 1: Arrival & Tour Kickoff", "description": "Detailed description of Day 1 program in 100% pure English only." }
  ]
}`,
    tour: `Tour (بدون id):
{
  "slug": "kebab-case-english",
  "title": "عنوان الجولة بالعربية حصراً",
  "titleAr": "عنوان الجولة بالعربية حصراً وبدقة",
  "titleEn": "Tour Title in Pure English Only",
  "titleTr": "Tur Başlığı Saf Türkçe Olarak",
  "category": "Day Tours / Adventure / Cultural",
  "duration": "8 hours",
  "timing": "morning",
  "price": 85,
  "originalPrice": 110,
  "rating": 4.9,
  "reviewCount": 320,
  "popular": true,
  "image": "https://images.unsplash.com/...",
  "images": ["https://images.unsplash.com/..."],
  "highlights": ["Iconic landmarks visit", "Professional tour guide", "Lunch included"],
  "highlightsAr": ["زيارة أبرز المعالم التاريخية والطبيعية", "مرشد سياحي مرخص ومحترف", "وجبة غداء تقليدية مشمولة"],
  "highlightsEn": ["Visit top historical & scenic landmarks", "Professional licensed tour guide", "Traditional lunch included"],
  "description": "الوصف بالعربية",
  "descriptionAr": "الوصف التفصيلي للجولة باللغة العربية فقط 100% دون خلط أي لغة أخرى.",
  "descriptionEn": "Detailed tour description in 100% pure English only.",
  "descriptionTr": "Detaylı tur açıklaması saf Türkçe olarak.",
  "isActive": true,
  "isFeatured": true
}`,
    visa: `VisaCountry:
{
  "id": "turkey", "country": "Turkey", "countryAr": "تركيا", "flag": "🇹🇷", "isActive": true,
  "types": [{
    "name": "Tourist E-Visa", "nameAr": "تأشيرة سياحية إلكترونية",
    "duration": "30-90 Days", "durationAr": "30-90 يوم",
    "price": "USD 65",
    "processingTime": "24-48 Hours", "processingTimeAr": "24-48 ساعة",
    "features": ["Single / Multiple Entry", "Online Approval", "24/7 Support"],
    "featuresAr": ["دخول مفرد أو متعدد", "موافقة إلكترونية سريعة", "دعم فني على مدار الساعة"]
  }]
}`,
  };
  return schemas[type];
}
