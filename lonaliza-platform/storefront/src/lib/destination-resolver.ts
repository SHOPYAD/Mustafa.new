/**
 * Universal Destination & Country Intelligence Engine
 * Resolves destination names, authentic countries, iconic covers, sights, and luxury hotels.
 */

export interface DestinationMetadata {
  cityEn: string;
  cityAr: string;
  cityTr?: string;
  countryEn: string;
  countryAr: string;
  countryTr?: string;
  destAr: string;
  destEn: string;
  destTr?: string;
  coverUrl: string;
  lat: number;
  lng: number;
  currency: string;
  timezone: string;
  visaAdviceAr: string;
  bestMonthsAr: string;
  guidelinesAr: string[];
}

export interface CuratedStop {
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  image: string;
  slotAr?: string;
  slotEn?: string;
  kind?: string;
  rating?: number;
}

export interface CuratedHotel {
  nameAr: string;
  nameEn: string;
  locationAr: string;
  locationEn: string;
  stars: string;
  image: string;
  featuresAr: string[];
  featuresEn: string[];
  priceUsdPerNight?: number;
}

const DESTINATION_PROFILES: Record<string, DestinationMetadata> = {
  marrakech: {
    cityEn: "Marrakech",
    cityAr: "مراكش",
    cityTr: "Marakeş",
    countryEn: "Morocco",
    countryAr: "المغرب",
    countryTr: "Fas",
    destAr: "مراكش، المغرب",
    destEn: "Marrakech, Morocco",
    destTr: "Marakeş, Fas",
    coverUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200",
    lat: 31.6295,
    lng: -7.9811,
    currency: "MAD",
    timezone: "GMT+1",
    visaAdviceAr: "مواطنو دول الخليج العربي مؤهلون للدخول بدون تأشيرة لمدة تصل إلى 90 يوماً مع جواز سفر ساري.",
    bestMonthsAr: "أكتوبر إلى مايو — طقس مشمس ومعتدل ومثالي للجولات وزيارة الرياضات والصحراء.",
    guidelinesAr: [
      "احرص على تجربة شاي النعناع المغربي في المقاهي المطلة على ساحة جامع الفنا وقت الغروب.",
      "تعتبر الرياضات التاريخية في المدينة العتيقة تجربة إقامة أندلسية ساحرة لا تُفوّت.",
      "جولة جبال الأطلس ووديان أوريكا وصحراء أغافاي تتطلب سيارة خاصة مريحة وسائقاً محترفاً.",
      "الدرهم المغربي هو العملة المعتمدة، وبطاقات الائتمان مقبولة في الفنادق والمطاعم الكبرى.",
    ],
  },
  cairo: {
    cityEn: "Cairo",
    cityAr: "القاهرة",
    cityTr: "Kahire",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryTr: "Mısır",
    destAr: "القاهرة، مصر",
    destEn: "Cairo, Egypt",
    destTr: "Kahire, Mısır",
    coverUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200",
    lat: 30.0444,
    lng: 31.2357,
    currency: "EGP",
    timezone: "GMT+2",
    visaAdviceAr: "تأشيرة إلكترونية فورية أو عند الوصول لمواطني الخليج والاتحاد الأوروبي ومعظم الدول.",
    bestMonthsAr: "أكتوبر إلى أبريل — أجواء شتوية معتدلة ولطيفة للاستمتاع بالنيل والآثار.",
    guidelinesAr: [
      "استمتع بجولة فلوكة شراعية في النيل عند ساعة الغروب بالقرب من جزيرة الزمالك.",
      "الحجز المسبق للمتحف المصري الكبير (GEM) يضمن دخولاً سريعاً وتجربة فاخرة خالية من الانتظار.",
      "التسوق في خان الخليلي وتناول القهوة في مقهى الفيشاوي من أروع التجارب التراثية.",
      "خدمة التنقل بسيارة خاصة وسائق طوال 10 ساعات توفر راحة تامة وتتفادى الزحام المروري.",
    ],
  },
  istanbul: {
    cityEn: "Istanbul",
    cityAr: "إسطنبول",
    cityTr: "İstanbul",
    countryEn: "Turkey",
    countryAr: "تركيا",
    countryTr: "Türkiye",
    destAr: "إسطنبول، تركيا",
    destEn: "Istanbul, Turkey",
    destTr: "İstanbul, Türkiye",
    coverUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
    lat: 41.0082,
    lng: 28.9784,
    currency: "TRY / USD",
    timezone: "GMT+3",
    visaAdviceAr: "دخول بدون تأشيرة أو تأشيرة إلكترونية سهلة لمعظم الجنسيات العربية والدولية.",
    bestMonthsAr: "أبريل إلى نوفمبر — أجواء رائعة للمضيق، الجولات، والمقاهي المفتوحة.",
    guidelinesAr: [
      "جولة كروز يخت خاص في مضيق البوسفور بين آسيا وأوروبا من أروع لحظات الرحلة.",
      "استمتع بتذوق القهوة العثمانية الأصلية والبقلاوة في أزقة السلطان أحمد وقصر توبكابي.",
      "سيارة مرسيدس فيتو VIP توفر تنقلاً سلساً ومريحاً بين المعالم المتباعدة على ضفتي البوسفور.",
      "احرص على زيارة البازار الكبير وسوق التوابل المصري لاقتناء الهدايا التذكارية الفريدة.",
    ],
  },
  trabzon: {
    cityEn: "Trabzon",
    cityAr: "طرابزون",
    cityTr: "Trabzon",
    countryEn: "Turkey",
    countryAr: "تركيا",
    countryTr: "Türkiye",
    destAr: "طرابزون، تركيا",
    destEn: "Trabzon, Turkey",
    destTr: "Trabzon, Türkiye",
    coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200",
    lat: 41.0027,
    lng: 39.7168,
    currency: "TRY / USD",
    timezone: "GMT+3",
    visaAdviceAr: "مشمولة ضمن نظام التأشيرة السياحية التركية الإلكترونية الميسرة.",
    bestMonthsAr: "مايو إلى أكتوبر — طبيعة خضراء وأنهار جبلية وجو عليل ماطر وممتع.",
    guidelinesAr: [
      "زيارة بحيرة أوزنجول ومرتفعات آيدر ودير سوميلا المعلق في الجبل رحلات حيوية لا تُعوّض.",
      "السيارة العائلية VIP بسائق خبير بالطرق الجبلية تضمن سلامة وراحة مطلقة للعائلة.",
    ],
  },
  dubai: {
    cityEn: "Dubai",
    cityAr: "دبي",
    cityTr: "Dubai",
    countryEn: "United Arab Emirates",
    countryAr: "الإمارات",
    countryTr: "Birleşik Arap Emirlikleri",
    destAr: "دبي، الإمارات",
    destEn: "Dubai, UAE",
    destTr: "Dubai, BAE",
    coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
    lat: 25.2048,
    lng: 55.2708,
    currency: "AED",
    timezone: "GMT+4",
    visaAdviceAr: "تأشيرة دخول إلكترونية فورية أو عند الوصول لأكثر من 70 جنسية حول العالم.",
    bestMonthsAr: "نوفمبر إلى أبريل — طقس شتوي مشمس ومثالي للأنشطة الخارجية والشواطئ.",
    guidelinesAr: [
      "عروض نافورة دبي وبرج خليفة وجولات المارينا الفاخرة باليخت الخاص من أهم التجارب.",
      "تجارب التسوق العالمية في دبي مول ومول الإمارات ومدينة جميرا.",
    ],
  },
  london: {
    cityEn: "London",
    cityAr: "لندن",
    cityTr: "Londra",
    countryEn: "United Kingdom",
    countryAr: "المملكة المتحدة",
    countryTr: "Birleşik Krallık",
    destAr: "لندن، المملكة المتحدة",
    destEn: "London, United Kingdom",
    destTr: "Londra, Birleşik Krallık",
    coverUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200",
    lat: 51.5074,
    lng: -0.1278,
    currency: "GBP",
    timezone: "GMT",
    visaAdviceAr: "مواطنو دول الخليج مؤهلون لتصريح السفر الإلكتروني البريطاني (ETA) خلال دقائق عبر التطبيق الرسمي.",
    bestMonthsAr: "مايو إلى أكتوبر — طقس ربيعي وصيفي معتدل ومثالي للأنشطة والحدائق والفعاليات الثقافية.",
    guidelinesAr: [
      "احرص على اصطحاب مظلة خفيفة وسترة مناسبة لتغيرات الطقس اللندني الممتعة.",
      "استمتع بتجربة شاي بعد الظهيرة البريطاني الفاخر في ذا ريتز أو ذا سافوي.",
      "تعتبر بطاقة المترو اللاتلامسية أو وسيلة الدفع الذكية الأسرع للتنقل بين أرجاء المدينة.",
      "خدمة سيارات الاستقبال الخاص من مطار هيثرو توفر وصولاً سلساً ومريحاً لفندقك.",
    ],
  },
  paris: {
    cityEn: "Paris",
    cityAr: "باريس",
    cityTr: "Paris",
    countryEn: "France",
    countryAr: "فرنسا",
    countryTr: "Fransa",
    destAr: "باريس، فرنسا",
    destEn: "Paris, France",
    destTr: "Paris, Fransa",
    coverUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
    lat: 48.8566,
    lng: 2.3522,
    currency: "EUR",
    timezone: "GMT+1",
    visaAdviceAr: "تأشيرة شنغن سياحية صالحة مطلوبة لمواطني الدول التي لا تشملها الإعفاءات.",
    bestMonthsAr: "أبريل إلى أكتوبر — طقس مشمس وخلاب لجولات الشانزلزيه وبرج إيفل ونهر السين.",
    guidelinesAr: [
      "جولة كروز خاصة في نهر السين وقت الغروب من أجمل التجارب الباريسية.",
      "ينصح بحجز تذاكر متحف اللوفر ومتحف أورسيه مسبقاً تفادياً لطوابير الانتظار.",
      "المطاعم الراقية في الدائرة الثامنة تقدم أشهى فنون الطهي الفرنسي العالمي.",
    ],
  },
  rome: {
    cityEn: "Rome",
    cityAr: "روما",
    cityTr: "Roma",
    countryEn: "Italy",
    countryAr: "إيطاليا",
    countryTr: "İtalya",
    destAr: "روما، إيطاليا",
    destEn: "Rome, Italy",
    destTr: "Roma, İtalya",
    coverUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200",
    lat: 41.9028,
    lng: 12.4964,
    currency: "EUR",
    timezone: "GMT+1",
    visaAdviceAr: "تأشيرة شنغن صالحة مطلوبة لمواطني الدول غير المعفية.",
    bestMonthsAr: "أبريل إلى يونيو، وسبتمبر إلى نوفمبر — طقس متوسطي معتدل وساحر.",
    guidelinesAr: [
      "احرص على رمي قطعة نقود في نافورة تريفي وفق التقاليد الإيطالية العريقة.",
      "حجز تذاكر الكولوسيوم ومتاحف الفاتيكان المسبق يوفر وقتك تماماً.",
    ],
  },
};

export const MARRAKECH_CURATED_STOPS: CuratedStop[] = [
  {
    titleAr: "ساحة جامع الفنا ومقاهي التراث البانورامية",
    titleEn: "Jemaa el-Fnaa Square & Panoramic Terraces",
    detailAr: "قلب مراكش النابض، عروض الفلكلور، تذوق عصير البرتقال الطازج وجلسة شاي وقت الغروب.",
    detailEn: "The beating heart of Marrakech, vibrant storytellers, musicians, and sunset mint tea terraces.",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
    slotAr: "المساء",
    slotEn: "Evening",
    kind: "attraction",
    rating: 4.9,
  },
  {
    titleAr: "قصر الباهية والرياض الأندلسي الملكي",
    titleEn: "Bahia Palace & Royal Courtyards",
    detailAr: "تحفة معمارية أندلسية مغربية من الزليج الفاسي والأسقف الخشبية المنقوشة والحدائق العطرة.",
    detailEn: "A 19th-century masterpiece of Islamic and Moroccan architecture with breathtaking mosaics.",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800",
    slotAr: "الصباح",
    slotEn: "Morning",
    kind: "attraction",
    rating: 4.9,
  },
  {
    titleAr: "حدائق ماجوريل ومتحف إيف سان لوران",
    titleEn: "Jardin Majorelle & Yves Saint Laurent Museum",
    detailAr: "واحة نباتية ساحرة باللون الأزرق الماجوريلي الخالد مع كنوز الأزياء الراقية العالمية.",
    detailEn: "Enchanting botanical gardens with vibrant cobalt blue villas, exotic cacti, and couture museum.",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
    slotAr: "الصباح",
    slotEn: "Morning",
    kind: "attraction",
    rating: 4.9,
  },
  {
    titleAr: "صومعة جامع الكتبية التاريخي وحدائق النخيل",
    titleEn: "Koutoubia Mosque Minaret & Gardens",
    detailAr: "أعرق معالم مراكش بمئذنته الموحدية الشامخة التي يعود تاريخها للقرن الثاني عشر الميلادي.",
    detailEn: "The grandest Almohad minaret rising majestically above rose gardens and date palms.",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800",
    slotAr: "الظهيرة",
    slotEn: "Afternoon",
    kind: "attraction",
    rating: 4.8,
  },
  {
    titleAr: "قبور السعديين وقصر البديع المهيب",
    titleEn: "Saadian Tombs & El Badi Palace",
    detailAr: "أعمدة الرخام الإيطالي الفاخر والمقرنصات المذهبة التي تؤرخ للعصر الذهبي لملوك السعديين.",
    detailEn: "Royal mausoleums adorned with intricate cedar woodwork and Italian Carrara marble.",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800",
    slotAr: "الظهيرة",
    slotEn: "Afternoon",
    kind: "attraction",
    rating: 4.8,
  },
  {
    titleAr: "أسواق المدينة العتيقة (سوق السمارين والحرفيين)",
    titleEn: "Medina Souks & Artisans Quarter",
    detailAr: "متاهة ساحرة من محلات السجاد البربري، الفوانيس النحاسية، التوابل، والزيوت الطبيعية.",
    detailEn: "Vibrant labyrinth of craft workshops, leather goods, handwoven carpets, and exotic spices.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    slotAr: "المساء",
    slotEn: "Evening",
    kind: "shopping",
    rating: 4.8,
  },
  {
    titleAr: "رحلة شلالات ووديان أوريكا وجبال الأطلس",
    titleEn: "Ourika Valley & Atlas Mountains Day Tour",
    detailAr: "رحلة يوم كامل بالسيارة الخاصة وسط جبال الأطلس وقرى الأمازيغ وضفاف النهر العليل.",
    detailEn: "Private full-day excursion along scenic mountain rivers, Berber villages, and waterfalls.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    slotAr: "الصباح",
    slotEn: "Morning",
    kind: "attraction",
    rating: 4.9,
  },
  {
    titleAr: "مخيم صحراء أغافاي الحجرية وسهرة النجوم",
    titleEn: "Agafay Desert Luxury Camp & Sunset Dinner",
    detailAr: "تجربة ركوب الجمال ودبابات الكواد وعشاء مغربي ملكي فاخر تحت ضوء النجوم بالمخيم.",
    detailEn: "Sunset camel rides, quad biking across rocky dunes, and luxury candlelit Berber dinner.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
    slotAr: "المساء",
    slotEn: "Evening",
    kind: "viewpoint",
    rating: 4.9,
  },
  {
    titleAr: "مدرسة بن يوسف التاريخية والحي الأندلسي",
    titleEn: "Ben Youssef Islamic Madrasa",
    detailAr: "أكبر كلية إسلامية تاريخية بالمغرب بنقوش الجص الموريسكية وقاعة الصلاة الرخامية الخلابة.",
    detailEn: "Magnificent 14th-century Islamic college known for exquisite stucco, cedar, and zellij tilework.",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
    slotAr: "الصباح",
    slotEn: "Morning",
    kind: "attraction",
    rating: 4.9,
  },
];

export const MARRAKECH_CURATED_HOTELS: CuratedHotel[] = [
  {
    nameAr: "فندق لا مامونيا الأسطوري (La Mamounia Palace Marrakech)",
    nameEn: "La Mamounia Palace Marrakech",
    locationAr: "باب الجديد، وسط مراكش — حدائق تاريخية ملكية ممتدة على 20 هكتاراً",
    locationEn: "Avenue Bab Jdid, Central Marrakech — Historic Royal Gardens",
    stars: "⭐ 5 نجوم قصر ملكي (Palace 5★)",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    featuresAr: ["أعرق فندق قصر بالعالم", "سبا مغربي ملكي مع حمام رخامي", "إفطار بوفيه فاخر في حدائق المأمون"],
    featuresEn: ["World-renowned Historic Palace", "Royal Marble Spa & Hamam", "Luxury Garden Buffet"],
    priceUsdPerNight: 550,
  },
  {
    nameAr: "فندق رويال منصور مراكش (Royal Mansour Marrakech)",
    nameEn: "Royal Mansour Marrakech",
    locationAr: "رياضات خاصة متكاملة — ملاذ الفخامة الملكية المغربية",
    locationEn: "Rue Abou Abbas El Sebti — Ultra-Exclusive Private Riads",
    stars: "⭐ 5 نجوم ألترا VIP (Ultra Luxury 5★)",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    featuresAr: ["رياض خاص من 3 طوابق مع مسبح خاص", "خدمة خادم شخصي بتلر 24/7", "مطاعم حائزة على نجوم ميشلان"],
    featuresEn: ["Private Multi-story Riad with Pool", "24/7 Dedicated Butler", "Michelin-starred Dining"],
    priceUsdPerNight: 850,
  },
  {
    nameAr: "منتجع ذا أوبيروي مراكش (The Oberoi, Marrakech)",
    nameEn: "The Oberoi, Marrakech",
    locationAr: "طريق فاس — بساتين الزيتون وإطلالة ساحرة على قمم الأطلس",
    locationEn: "Route de Fes — 28 Acres of Olive Groves with Atlas Vistas",
    stars: "⭐ 5 نجوم ديلوكس (5★ Deluxe)",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    featuresAr: ["فيلات خاصة مع مسابح مدفأة", "إطلالة بانورامية على جبال الأطلس", "عمارة مستوحاة من قصر الحمراء"],
    featuresEn: ["Private Heated Pool Villas", "Atlas Mountain Views", "Alhambra-inspired Architecture"],
    priceUsdPerNight: 480,
  },
  {
    nameAr: "فندق فور سيزونز مراكش (Four Seasons Resort Marrakech)",
    nameEn: "Four Seasons Resort Marrakech",
    locationAr: "شارع المنارة — جوار حدائق المنارة التاريخية والمدينة الجديدة",
    locationEn: "Boulevard de la Menara — Beside Historic Menara Gardens",
    stars: "⭐ 5 نجوم فاخر (5★ Luxury)",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    featuresAr: ["مسابح عائلية وأجنحة ديلوكس", "حدائق النخيل والورود", "خدمة كونسيرج VIP متميزة"],
    featuresEn: ["Family & Adult Resort Pools", "Lush Palm Gardens", "VIP Concierge Services"],
    priceUsdPerNight: 420,
  },
];

import { WORLD_CITIES_MASTER } from "@/lib/geo/world-cities-data";

const CITY_COORDS_MAP: Record<string, { lat: number; lng: number; coverUrl: string; currency: string; timezone: string }> = {
  "geo-par": { lat: 48.8566, lng: 2.3522, coverUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-nce": { lat: 43.7102, lng: 7.2620, coverUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-lon": { lat: 51.5074, lng: -0.1278, coverUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200", currency: "GBP", timezone: "GMT+0" },
  "geo-man": { lat: 53.4808, lng: -2.2426, coverUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200", currency: "GBP", timezone: "GMT+0" },
  "geo-rom": { lat: 41.9028, lng: 12.4964, coverUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-mil": { lat: 45.4642, lng: 9.1900, coverUrl: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-vce": { lat: 45.4408, lng: 12.3155, coverUrl: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-mad": { lat: 40.4168, lng: -3.7038, coverUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-bcn": { lat: 41.3879, lng: 2.1699, coverUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-agp": { lat: 36.7213, lng: -4.4214, coverUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-ber": { lat: 52.5200, lng: 13.4050, coverUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-muc": { lat: 48.1351, lng: 11.5820, coverUrl: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-fra": { lat: 50.1109, lng: 8.6821, coverUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-gva": { lat: 46.2044, lng: 6.1432, coverUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200", currency: "CHF", timezone: "GMT+1" },
  "geo-zrh": { lat: 47.3769, lng: 8.5417, coverUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200", currency: "CHF", timezone: "GMT+1" },
  "geo-itl": { lat: 46.6863, lng: 7.8632, coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200", currency: "CHF", timezone: "GMT+1" },
  "geo-vie": { lat: 48.2082, lng: 16.3738, coverUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-ams": { lat: 52.3676, lng: 4.9041, coverUrl: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200", currency: "EUR", timezone: "GMT+1" },
  "geo-ath": { lat: 37.9838, lng: 23.7275, coverUrl: "https://images.unsplash.com/photo-1555993539-1732916b8235?w=1200", currency: "EUR", timezone: "GMT+2" },
  "geo-san": { lat: 36.3932, lng: 25.4615, coverUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200", currency: "EUR", timezone: "GMT+2" },
  "geo-lis": { lat: 38.7223, lng: -9.1393, coverUrl: "https://images.unsplash.com/photo-1508672019048-805b876b67e2?w=1200", currency: "EUR", timezone: "GMT+0" },
  "geo-bkk": { lat: 13.7563, lng: 100.5018, coverUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200", currency: "THB", timezone: "GMT+7" },
  "geo-hkt": { lat: 7.8804, lng: 98.3923, coverUrl: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200", currency: "THB", timezone: "GMT+7" },
  "geo-kul": { lat: 3.1390, lng: 101.6869, coverUrl: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=1200", currency: "MYR", timezone: "GMT+8" },
  "geo-dps": { lat: -8.4095, lng: 115.1889, coverUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200", currency: "IDR", timezone: "GMT+8" },
  "geo-sin": { lat: 1.3521, lng: 103.8198, coverUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200", currency: "SGD", timezone: "GMT+8" },
  "geo-tyo": { lat: 35.6762, lng: 139.6503, coverUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200", currency: "JPY", timezone: "GMT+9" },
  "geo-bak": { lat: 40.4093, lng: 49.8671, coverUrl: "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200", currency: "AZN", timezone: "GMT+4" },
  "geo-tbs": { lat: 41.7151, lng: 44.8271, coverUrl: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200", currency: "GEL", timezone: "GMT+4" },
  "geo-mle": { lat: 4.1755, lng: 73.5093, coverUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200", currency: "USD", timezone: "GMT+5" },
  "geo-nyc": { lat: 40.7128, lng: -74.0060, coverUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200", currency: "USD", timezone: "GMT-5" },
  "geo-mia": { lat: 25.7617, lng: -80.1918, coverUrl: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200", currency: "USD", timezone: "GMT-5" },
  "geo-yhz": { lat: 43.6532, lng: -79.3832, coverUrl: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=1200", currency: "CAD", timezone: "GMT-5" },
  "geo-ruh": { lat: 24.7136, lng: 46.6753, coverUrl: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200", currency: "SAR", timezone: "GMT+3" },
  "geo-jed": { lat: 21.5433, lng: 39.1728, coverUrl: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200", currency: "SAR", timezone: "GMT+3" },
  "geo-doh": { lat: 25.2854, lng: 51.5310, coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200", currency: "QAR", timezone: "GMT+3" },
  "geo-kwi": { lat: 29.3759, lng: 47.9774, coverUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200", currency: "KWD", timezone: "GMT+3" },
  "geo-mct": { lat: 23.5859, lng: 58.4059, coverUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200", currency: "OMR", timezone: "GMT+4" },
  "geo-amm": { lat: 31.9454, lng: 35.9284, coverUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200", currency: "JOD", timezone: "GMT+3" },
  "geo-bey": { lat: 33.8938, lng: 35.5018, coverUrl: "https://images.unsplash.com/photo-1508672019048-805b876b67e2?w=1200", currency: "USD", timezone: "GMT+2" },
};

export function resolveDestinationMeta(destinationRaw?: string): DestinationMetadata {
  const norm = String(destinationRaw || "").trim().toLowerCase();

  // 1. High-priority dedicated profiles (London, Paris, Rome, Marrakech, Cairo, Istanbul, Trabzon, Dubai)
  if (/(^|[^a-z0-9])(london|لندن|londra)([^a-z0-9]|$)/i.test(norm)) return DESTINATION_PROFILES.london;
  if (/(^|[^a-z0-9])(paris|باريس)([^a-z0-9]|$)/i.test(norm)) return DESTINATION_PROFILES.paris;
  if (/(^|[^a-z0-9])(rome|روما|roma)([^a-z0-9]|$)/i.test(norm)) return DESTINATION_PROFILES.rome;
  if (/marrakech|marrakesh|مراكش/i.test(norm)) return DESTINATION_PROFILES.marrakech;
  if (/casablanca|كازابلانكا|الدار البيضاء/i.test(norm)) {
    return {
      ...DESTINATION_PROFILES.marrakech,
      cityEn: "Casablanca",
      cityAr: "الدار البيضاء",
      destAr: "الدار البيضاء، المغرب",
      destEn: "Casablanca, Morocco",
      coverUrl: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=1200",
      lat: 33.5731,
      lng: -7.5898,
    };
  }
  if (/trabzon|طرابزون/i.test(norm)) return DESTINATION_PROFILES.trabzon;
  if (/(^|[^a-z0-9])(istanbul|istanbuls|istanbullu|إسطنبول|اسطنبول)([^a-z0-9]|$)/i.test(norm)) return DESTINATION_PROFILES.istanbul;
  if (/dubai|دبي/i.test(norm)) return DESTINATION_PROFILES.dubai;
  if (/cairo|القاهرة|قاهرة/i.test(norm)) return DESTINATION_PROFILES.cairo;

  // 2. Global search in WORLD_CITIES_MASTER with strict word-boundary matching
  const matched = WORLD_CITIES_MASTER.find((item) => {
    const en = item.cityNameEn.toLowerCase();
    const ar = item.cityNameAr.toLowerCase();
    if (new RegExp(`(^|[^a-z0-9])${en}([^a-z0-9]|$)`, "i").test(norm)) return true;
    if (norm.includes(ar)) return true;
    if (item.cityNameTr && new RegExp(`(^|[^a-z0-9])${item.cityNameTr.toLowerCase()}([^a-z0-9]|$)`, "i").test(norm)) return true;
    if (item.aliases && item.aliases.some((a) => {
      const alias = a.trim().toLowerCase();
      if (!alias) return false;
      if (alias.length <= 4) {
        return new RegExp(`(^|[^a-z0-9])${alias}([^a-z0-9]|$)`, "i").test(norm);
      }
      return norm.includes(alias);
    })) return true;
    return false;
  });

  if (matched) {
    const coords = CITY_COORDS_MAP[matched.id] || {
      lat: 30.0,
      lng: 31.0,
      coverUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
      currency: "USD",
      timezone: "GMT",
    };

    return {
      cityEn: matched.cityNameEn,
      cityAr: matched.cityNameAr,
      cityTr: matched.cityNameTr,
      countryEn: matched.countryNameEn,
      countryAr: matched.countryNameAr,
      countryTr: matched.countryNameTr,
      destAr: `${matched.cityNameAr}، ${matched.countryNameAr}`,
      destEn: `${matched.cityNameEn}, ${matched.countryNameEn}`,
      destTr: `${matched.cityNameTr}, ${matched.countryNameTr}`,
      coverUrl: coords.coverUrl,
      lat: coords.lat,
      lng: coords.lng,
      currency: coords.currency,
      timezone: coords.timezone,
      visaAdviceAr: `يُرجى التحقق من اشتراطات التأشيرة السياحية لدولة ${matched.countryNameAr} وجواز سفر صالح لمدة 6 أشهر على الأقل.`,
      bestMonthsAr: "تتوفر رحلات مجدولة ومنسقة طوال شهور العام بسيارة خاصة وخدمة كونسيرج VIP.",
      guidelinesAr: [
        `تأكيد حجوزات الطيران والفندق في ${matched.cityNameAr} مسبقاً يضمن أفضل الأسعار وتجربة فاخرة.`,
        "سائق خاص VIP يرافقك طوال البرنامج لتوفير الراحة والخصوصية والأمان التام.",
        "خدمة الكونسيرج ومستشار السفر متاحة لك على مدار الساعة لتلبية أي طلب أو استفسار.",
        `استمتع باستكشاف أشهر معالم وأسواق ${matched.cityNameAr} بمرونة تامة.`,
      ],
    };
  }

  // 3. Fallback: Parse cleanly from raw input without assuming any specific country
  const cleanName = destinationRaw ? destinationRaw.trim() : "وجهة الأحلام";
  const parts = cleanName.split(/[،,-]/).map((s) => s.trim()).filter(Boolean);
  const city = parts[0] || cleanName;
  const country = parts[1] || (cleanName.includes("المغرب") ? "المغرب" : cleanName.includes("تركيا") ? "تركيا" : "وجهة دولية فاخرة");

  return {
    cityEn: city,
    cityAr: city,
    countryEn: country,
    countryAr: country,
    destAr: cleanName,
    destEn: cleanName,
    coverUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
    lat: 31.6295,
    lng: -7.9811,
    currency: "USD",
    timezone: "GMT",
    visaAdviceAr: "يُرجى التحقق من صلاحية جواز السفر لمدة لا تقل عن 6 أشهر قبل موعد السفر.",
    bestMonthsAr: "تتوفر رحلات مجدولة ومنسقة طوال شهور العام بسيارة خاصة وخدمة كونسيرج VIP.",
    guidelinesAr: [
      "تأكيد حجوزات الطيران والفندق مسبقاً يضمن أسعاراً تفضيلية وخدمة لا تشوبها شائبة.",
      "سائق خاص VIP يرافقك طوال البرنامج لتوفير الراحة والخصوصية والأمان التام.",
      "خدمة الكونسيرج ومستشار السفر متاحة لك على مدار الساعة لتلبية أي طلب أو تعديل.",
    ],
  };
}
