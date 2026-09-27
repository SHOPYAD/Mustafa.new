/**
 * One-shot helper: patches types/en/ar and writes dictionaries/tr.ts
 * Run: node scripts/build-tr-dict.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "lib", "i18n");
const dictDir = path.join(root, "dictionaries");

const ADMIN_EXTRA_KEYS = `
    searchTabs: string;
    welcomeSubtitle: string;
    live: string;
    quickActions: string;
    recentEnquiries: string;
    viewAllArrow: string;
    noEnquiriesYet: string;
    noEnquiriesHint: string;
    anonymous: string;
    enquiries: string;
    articles: string;
    visaCountries: string;
    statNew: string;
    statActive: string;
    statFeatured: string;
    statPublished: string;
    qaBookingsDesc: string;
    qaFlightsDesc: string;
    qaPackagesDesc: string;
    qaHotelsDesc: string;
    qaTransfersDesc: string;
    qaArticlesDesc: string;
    qaToursDesc: string;
    qaVisaDesc: string;
    qaContentDesc: string;
    statusNew: string;
    statusInProgress: string;
    statusResolved: string;
    bookingsSubtitle: string;
    pocketbaseConnected: string;
    connectPocketbase: string;
    pocketbaseWarningBefore: string;
    pocketbaseSetupLink: string;
    pocketbaseWarningAfter: string;
    searchBookingsPlaceholder: string;
    allTypes: string;
    allStatuses: string;
    filterByCustomer: string;
    colCustomer: string;
    colContact: string;
    colService: string;
    colDestination: string;
    colDateStatus: string;
    colActions: string;
    colRole: string;
    colJoined: string;
    noEnquiriesFound: string;
    noEnquiriesEmptyHint: string;
    adjustSearchFilter: string;
    typeFlight: string;
    typeHotel: string;
    typePackage: string;
    typeTransfer: string;
    typeVisa: string;
    typeTour: string;
    typeCallback: string;
    typeContact: string;
    typeGeneral: string;
    messageLabel: string;
    deleteEnquiry: string;
    deleteCannotUndo: string;
    customersSubtitle: string;
    customersSearchPlaceholder: string;
    noCustomers: string;
    noCustomersHint: string;
    failedLoadCustomers: string;
    brandName: string;
    brandMark: string;
    availability: string;
    available: string;
    route: string;
    tourProgram: string;
    routeMap: string;
    driver: string;
    highlights: string;
    includes: string;
    notIncluded: string;
    tips: string;
    guestReviews: string;
    results: string;
    turkeyMap: string;
    exploreTurkeyCities: string;
    getInTouch: string;
    contactHeroSubtitle: string;
    sendMessage: string;
    sendMessageSubtitle: string;
    messageSent: string;
    messageSentBody: string;
    fieldName: string;
    fieldEmail: string;
    fieldPhone: string;
    fieldSubject: string;
    fieldMessage: string;
    whyUs: string;
    whyUsBody: string;
    callUs: string;
    emailUsTitle: string;
    visitUs: string;
    workingHours: string;
    readMoreShort: string;
    explorePackages: string;
    turkeyCitiesWith: string;
    dayLabel: string;
    totalLabel: string;
    offersLabel: string;
    itineraryLabel: string;
    flightLabel: string;
    searchTabsSubtitle: string;
    resetDefaultsShort: string;
`;

const ADMIN_EXTRA_EN = `
    searchTabs: "Search Tabs",
    welcomeSubtitle: "Welcome back, Misbah. Here's what's happening.",
    live: "Live",
    quickActions: "Quick Actions",
    recentEnquiries: "Recent Enquiries",
    viewAllArrow: "View all →",
    noEnquiriesYet: "No enquiries yet",
    noEnquiriesHint: "They'll appear here when customers submit forms",
    anonymous: "Anonymous",
    enquiries: "Enquiries",
    articles: "Articles",
    visaCountries: "Visa Countries",
    statNew: "{n} new",
    statActive: "{n} active",
    statFeatured: "{n} featured",
    statPublished: "{n} published",
    qaBookingsDesc: "View enquiries",
    qaFlightsDesc: "Manage flights",
    qaPackagesDesc: "Holiday packages",
    qaHotelsDesc: "Hotel inventory",
    qaTransfersDesc: "VIP & transfers",
    qaArticlesDesc: "Blog posts",
    qaToursDesc: "UAE tours",
    qaVisaDesc: "Visa services",
    qaContentDesc: "Featured items",
    statusNew: "New",
    statusInProgress: "In Progress",
    statusResolved: "Resolved",
    bookingsSubtitle: "Manage customer enquiries and booking requests from Supabase",
    pocketbaseConnected: "PocketBase connected",
    connectPocketbase: "Connect PocketBase",
    pocketbaseWarningBefore: "PocketBase is not connected yet. Showing empty/local fallback. Open",
    pocketbaseSetupLink: "PocketBase settings",
    pocketbaseWarningAfter: "to connect.",
    searchBookingsPlaceholder: "Search name, email, phone, service...",
    allTypes: "All types",
    allStatuses: "All Statuses",
    filterByCustomer: "Filter by customer...",
    colCustomer: "Customer",
    colContact: "Contact",
    colService: "Service",
    colDestination: "Destination",
    colDateStatus: "Date / Status",
    colActions: "Actions",
    colRole: "Role",
    colJoined: "Joined",
    noEnquiriesFound: "No enquiries found",
    noEnquiriesEmptyHint: "Enquiries submitted via the website will appear here once Supabase is connected",
    adjustSearchFilter: "Try adjusting your search or filter",
    typeFlight: "Flight",
    typeHotel: "Hotel",
    typePackage: "Package",
    typeTransfer: "Transfer",
    typeVisa: "Visa",
    typeTour: "Tour",
    typeCallback: "Callback",
    typeContact: "Contact",
    typeGeneral: "General",
    messageLabel: "Message:",
    deleteEnquiry: "Delete Enquiry",
    deleteCannotUndo: "This cannot be undone",
    customersSubtitle: "Registered users from Supabase Auth & profiles",
    customersSearchPlaceholder: "Search by name, email, or phone...",
    noCustomers: "No registered customers",
    noCustomersHint: "When visitors sign in with Google (or email) via Supabase, their profiles will list here.",
    failedLoadCustomers: "Failed to load customers",
    brandName: "Alrayyan Tourism",
    brandMark: "ALRAYYAN TOURISM",
    availability: "Availability",
    available: "Available",
    route: "Route",
    tourProgram: "Tour program",
    routeMap: "Route map",
    driver: "Driver",
    highlights: "Highlights",
    includes: "Includes",
    notIncluded: "Not included",
    tips: "Tips",
    guestReviews: "Guest reviews",
    results: "results",
    turkeyMap: "Turkey map",
    exploreTurkeyCities: "Explore Turkey cities",
    getInTouch: "Get In Touch",
    contactHeroSubtitle: "We're here to help plan your perfect Turkey trip.",
    sendMessage: "Send Us a Message",
    sendMessageSubtitle: "Fill out the form and our team will get back to you.",
    messageSent: "Message Sent!",
    messageSentBody: "Thank you — we will contact you shortly.",
    fieldName: "Name",
    fieldEmail: "Email",
    fieldPhone: "Phone",
    fieldSubject: "Subject",
    fieldMessage: "Message",
    whyUs: "Why Alrayyan Tourism?",
    whyUsBody: "Licensed travel experts focused on Turkey holidays, transfers, and VIP tours.",
    callUs: "Call Us",
    emailUsTitle: "Email Us",
    visitUs: "Visit Us",
    workingHours: "Working Hours",
    readMoreShort: "Read More",
    explorePackages: "Explore Packages",
    turkeyCitiesWith: "Turkey cities with Alrayyan",
    dayLabel: "Day {n}",
    totalLabel: "Total",
    offersLabel: "Offers:",
    itineraryLabel: "Itinerary",
    flightLabel: "Flight",
    searchTabsSubtitle: "Choose which search tabs appear on the homepage widget.",
    resetDefaultsShort: "Reset defaults",
`;

const ADMIN_EXTRA_AR = `
    searchTabs: "تبويبات البحث",
    welcomeSubtitle: "مرحباً بعودتك، مصباح. إليك آخر المستجدات.",
    live: "مباشر",
    quickActions: "إجراءات سريعة",
    recentEnquiries: "أحدث الاستفسارات",
    viewAllArrow: "عرض الكل ←",
    noEnquiriesYet: "لا توجد استفسارات بعد",
    noEnquiriesHint: "ستظهر هنا عندما يرسل العملاء النماذج",
    anonymous: "مجهول",
    enquiries: "الاستفسارات",
    articles: "المقالات",
    visaCountries: "دول التأشيرة",
    statNew: "{n} جديد",
    statActive: "{n} نشط",
    statFeatured: "{n} مميز",
    statPublished: "{n} منشور",
    qaBookingsDesc: "عرض الاستفسارات",
    qaFlightsDesc: "إدارة الرحلات",
    qaPackagesDesc: "باقات العطلات",
    qaHotelsDesc: "مخزون الفنادق",
    qaTransfersDesc: "ترانسفير وVIP",
    qaArticlesDesc: "مقالات المدونة",
    qaToursDesc: "جولات",
    qaVisaDesc: "خدمات التأشيرة",
    qaContentDesc: "العناصر المميزة",
    statusNew: "جديد",
    statusInProgress: "قيد المعالجة",
    statusResolved: "تم الحل",
    bookingsSubtitle: "إدارة استفسارات العملاء وطلبات الحجز من Supabase",
    pocketbaseConnected: "PocketBase متصل",
    connectPocketbase: "ربط PocketBase",
    pocketbaseWarningBefore: "لم يتم ربط PocketBase بعد. يتم عرض بيانات فارغة/محلية. افتح",
    pocketbaseSetupLink: "إعدادات PocketBase",
    pocketbaseWarningAfter: "للربط.",
    searchBookingsPlaceholder: "ابحث بالاسم أو البريد أو الهاتف أو الخدمة...",
    allTypes: "كل الأنواع",
    allStatuses: "كل الحالات",
    filterByCustomer: "تصفية حسب العميل...",
    colCustomer: "العميل",
    colContact: "التواصل",
    colService: "الخدمة",
    colDestination: "الوجهة",
    colDateStatus: "التاريخ / الحالة",
    colActions: "إجراءات",
    colRole: "الدور",
    colJoined: "تاريخ الانضمام",
    noEnquiriesFound: "لا توجد استفسارات",
    noEnquiriesEmptyHint: "ستظهر الاستفسارات المرسلة عبر الموقع هنا بعد ربط Supabase",
    adjustSearchFilter: "جرّب تعديل البحث أو التصفية",
    typeFlight: "طيران",
    typeHotel: "فندق",
    typePackage: "باقة",
    typeTransfer: "ترانسفير",
    typeVisa: "تأشيرة",
    typeTour: "جولة",
    typeCallback: "اتصال مرتجع",
    typeContact: "تواصل",
    typeGeneral: "عام",
    messageLabel: "الرسالة:",
    deleteEnquiry: "حذف الاستفسار",
    deleteCannotUndo: "لا يمكن التراجع عن هذا الإجراء",
    customersSubtitle: "المستخدمون المسجّلون من Supabase Auth والملفات الشخصية",
    customersSearchPlaceholder: "ابحث بالاسم أو البريد أو الهاتف...",
    noCustomers: "لا يوجد عملاء مسجّلون",
    noCustomersHint: "عند تسجيل الزوار عبر Google أو البريد في Supabase، ستظهر ملفاتهم هنا.",
    failedLoadCustomers: "فشل تحميل العملاء",
    brandName: "الريان للسياحة",
    brandMark: "الريان للسياحة",
    availability: "التوفر",
    available: "متاح",
    route: "المسار",
    tourProgram: "برنامج الجولة",
    routeMap: "خريطة المسار",
    driver: "السائق",
    highlights: "أبرز المميزات",
    includes: "يشمل",
    notIncluded: "لا يشمل",
    tips: "نصائح",
    guestReviews: "آراء العملاء",
    results: "نتيجة",
    turkeyMap: "خريطة تركيا",
    exploreTurkeyCities: "استكشف مدن تركيا",
    getInTouch: "تواصل معنا",
    contactHeroSubtitle: "نحن هنا لمساعدتك في تخطيط رحلتك المثالية إلى تركيا.",
    sendMessage: "أرسل رسالة",
    sendMessageSubtitle: "املأ النموذج وسيتواصل فريقنا معك.",
    messageSent: "تم الإرسال!",
    messageSentBody: "شكراً لك — سنتواصل معك قريباً.",
    fieldName: "الاسم",
    fieldEmail: "البريد",
    fieldPhone: "الهاتف",
    fieldSubject: "الموضوع",
    fieldMessage: "الرسالة",
    whyUs: "لماذا الريان للسياحة؟",
    whyUsBody: "خبراء سفر مرخّصون متخصصون في عطلات تركيا والترانسفير وجولات VIP.",
    callUs: "اتصل بنا",
    emailUsTitle: "راسلنا",
    visitUs: "زورنا",
    workingHours: "ساعات العمل",
    readMoreShort: "اقرأ المزيد",
    explorePackages: "استكشف الباقات",
    turkeyCitiesWith: "مدن تركيا مع الريان",
    dayLabel: "اليوم {n}",
    totalLabel: "الإجمالي",
    offersLabel: "العروض:",
    itineraryLabel: "البرنامج",
    flightLabel: "طيران",
    searchTabsSubtitle: "اختر تبويبات البحث التي تظهر في أداة الصفحة الرئيسية.",
    resetDefaultsShort: "إعادة الافتراضي",
`;

const ADMIN_EXTRA_TR = `
    searchTabs: "Arama Sekmeleri",
    welcomeSubtitle: "Tekrar hoş geldiniz, Misbah. İşte güncel durum.",
    live: "Canlı",
    quickActions: "Hızlı İşlemler",
    recentEnquiries: "Son Talepler",
    viewAllArrow: "Tümünü gör →",
    noEnquiriesYet: "Henüz talep yok",
    noEnquiriesHint: "Müşteriler form gönderdiğinde burada görünecek",
    anonymous: "Anonim",
    enquiries: "Talepler",
    articles: "Yazılar",
    visaCountries: "Vize Ülkeleri",
    statNew: "{n} yeni",
    statActive: "{n} aktif",
    statFeatured: "{n} öne çıkan",
    statPublished: "{n} yayında",
    qaBookingsDesc: "Talepleri görüntüle",
    qaFlightsDesc: "Uçuşları yönet",
    qaPackagesDesc: "Tatil paketleri",
    qaHotelsDesc: "Otel envanteri",
    qaTransfersDesc: "VIP ve transferler",
    qaArticlesDesc: "Blog yazıları",
    qaToursDesc: "Turlar",
    qaVisaDesc: "Vize hizmetleri",
    qaContentDesc: "Öne çıkan öğeler",
    statusNew: "Yeni",
    statusInProgress: "Devam ediyor",
    statusResolved: "Çözüldü",
    bookingsSubtitle: "Supabase üzerinden müşteri taleplerini ve rezervasyonları yönetin",
    pocketbaseConnected: "PocketBase bağlı",
    connectPocketbase: "PocketBase bağla",
    pocketbaseWarningBefore: "PocketBase henüz bağlanmadı. Boş/yerel yedek gösteriliyor. Bağlamak için",
    pocketbaseSetupLink: "PocketBase ayarları",
    pocketbaseWarningAfter: "sayfasını açın.",
    searchBookingsPlaceholder: "Ad, e-posta, telefon, hizmet ara...",
    allTypes: "Tüm türler",
    allStatuses: "Tüm durumlar",
    filterByCustomer: "Müşteriye göre filtrele...",
    colCustomer: "Müşteri",
    colContact: "İletişim",
    colService: "Hizmet",
    colDestination: "Destinasyon",
    colDateStatus: "Tarih / Durum",
    colActions: "İşlemler",
    colRole: "Rol",
    colJoined: "Katılım",
    noEnquiriesFound: "Talep bulunamadı",
    noEnquiriesEmptyHint: "Site üzerinden gönderilen talepler Supabase bağlandığında burada görünür",
    adjustSearchFilter: "Arama veya filtreyi değiştirmeyi deneyin",
    typeFlight: "Uçuş",
    typeHotel: "Otel",
    typePackage: "Paket",
    typeTransfer: "Transfer",
    typeVisa: "Vize",
    typeTour: "Tur",
    typeCallback: "Geri arama",
    typeContact: "İletişim",
    typeGeneral: "Genel",
    messageLabel: "Mesaj:",
    deleteEnquiry: "Talebi Sil",
    deleteCannotUndo: "Bu işlem geri alınamaz",
    customersSubtitle: "Supabase Auth ve profillerden kayıtlı kullanıcılar",
    customersSearchPlaceholder: "Ad, e-posta veya telefona göre ara...",
    noCustomers: "Kayıtlı müşteri yok",
    noCustomersHint: "Ziyaretçiler Google veya e-posta ile Supabase üzerinden giriş yaptığında profilleri burada listelenir.",
    failedLoadCustomers: "Müşteriler yüklenemedi",
    brandName: "Alrayyan Turizm",
    brandMark: "ALRAYYAN TURİZM",
    availability: "Müsaitlik",
    available: "Müsait",
    route: "Rota",
    tourProgram: "Tur programı",
    routeMap: "Rota haritası",
    driver: "Şoför",
    highlights: "Öne çıkanlar",
    includes: "Dahil",
    notIncluded: "Dahil değil",
    tips: "İpuçları",
    guestReviews: "Misafir yorumları",
    results: "sonuç",
    turkeyMap: "Türkiye haritası",
    exploreTurkeyCities: "Türkiye şehirlerini keşfedin",
    getInTouch: "Bize Ulaşın",
    contactHeroSubtitle: "Mükemmel Türkiye seyahatinizi planlamanıza yardımcı olmak için buradayız.",
    sendMessage: "Bize Mesaj Gönderin",
    sendMessageSubtitle: "Formu doldurun, ekibimiz size dönüş yapsın.",
    messageSent: "Mesaj Gönderildi!",
    messageSentBody: "Teşekkürler — kısa süre içinde sizinle iletişime geçeceğiz.",
    fieldName: "Ad",
    fieldEmail: "E-posta",
    fieldPhone: "Telefon",
    fieldSubject: "Konu",
    fieldMessage: "Mesaj",
    whyUs: "Neden Alrayyan Turizm?",
    whyUsBody: "Türkiye tatilleri, transferler ve VIP turlar konusunda lisanslı seyahat uzmanları.",
    callUs: "Bizi Arayın",
    emailUsTitle: "E-posta Gönderin",
    visitUs: "Bizi Ziyaret Edin",
    workingHours: "Çalışma Saatleri",
    readMoreShort: "Devamını Oku",
    explorePackages: "Paketleri Keşfet",
    turkeyCitiesWith: "Alrayyan ile Türkiye şehirleri",
    dayLabel: "Gün {n}",
    totalLabel: "Toplam",
    offersLabel: "Teklifler:",
    itineraryLabel: "Program",
    flightLabel: "Uçuş",
    searchTabsSubtitle: "Ana sayfa arama widget'ında hangi sekmelerin görüneceğini seçin.",
    resetDefaultsShort: "Varsayılana sıfırla",
`;

function insertBefore(haystack, needle, insert) {
  const i = haystack.indexOf(needle);
  if (i < 0) throw new Error("needle not found: " + needle.slice(0, 40));
  return haystack.slice(0, i) + insert + haystack.slice(i);
}

function patchTypes(src) {
  let out = src.replace(
    'export type Locale = "ar" | "en";',
    'export type Locale = "ar" | "en" | "tr";'
  );
  out = out.replace(
    "    english: string;",
    "    english: string;\n    turkish: string;"
  );
  out = insertBefore(out, "    page: string;\n  };", ADMIN_EXTRA_KEYS.trimEnd() + "\n    page: string;\n  };");
  // fix double page - the insert was wrong. Let me do cleaner:
  return out;
}

// Fix: insert admin extras before `page: string` in admin block
function patchTypes2(src) {
  let out = src.replace(
    'export type Locale = "ar" | "en";',
    'export type Locale = "ar" | "en" | "tr";'
  );
  out = out.replace(
    "    english: string;",
    "    english: string;\n    turkish: string;"
  );
  out = out.replace(
    /(\n    signOut: string;\n    loading: string;\n)(    page: string;)/,
    `$1${ADMIN_EXTRA_KEYS.trim()}\n$2`
  );
  return out;
}

function patchDict(src, lang, extras, turkishLabel) {
  let out = src;
  if (lang === "en") {
    out = out.replace(
      '    english: "English",',
      '    english: "English",\n    turkish: "Türkçe",'
    );
  } else if (lang === "ar") {
    out = out.replace(
      '    english: "English",',
      '    english: "English",\n    turkish: "Türkçe",'
    );
  }
  out = out.replace(
    /(\n    signOut: "[^"]*",\n    loading: "[^"]*",\n)(    page: )/ ,
    `$1${extras.trim()}\n$2`
  );
  return out;
}

const typesPath = path.join(root, "types.ts");
const enPath = path.join(dictDir, "en.ts");
const arPath = path.join(dictDir, "ar.ts");

fs.writeFileSync(typesPath, patchTypes2(fs.readFileSync(typesPath, "utf8")));
fs.writeFileSync(enPath, patchDict(fs.readFileSync(enPath, "utf8"), "en", ADMIN_EXTRA_EN));
fs.writeFileSync(arPath, patchDict(fs.readFileSync(arPath, "utf8"), "ar", ADMIN_EXTRA_AR));

// Build Turkish dictionary from English with full TR translations map
const TR_MAP = {
  // Will be applied via structured object below
};

// Read en after patch and produce tr by translating known sections via a full replacement file
const enAfter = fs.readFileSync(enPath, "utf8");

// Extract the object body and write Turkish version manually as complete file using translation table
const trCommon = {
  bookNow: "Şimdi Rezerve Et",
  letsGo: "Hadi Başlayalım!",
  startPlanning: "Planlamaya Başla",
  readMore: "Devamını Oku",
  viewAll: "Tümünü Gör",
  search: "Ara",
  loading: "Yükleniyor...",
  save: "Kaydet",
  cancel: "İptal",
  delete: "Sil",
  edit: "Düzenle",
  add: "Ekle",
  publish: "Yayınla",
  draft: "Taslak",
  active: "Aktif",
  featured: "Öne Çıkan",
  from: "Nereden",
  to: "Nereye",
  price: "Fiyat",
  details: "Detaylar",
  enquire: "Teklif Al",
  back: "Geri",
  selectCurrency: "Para Birimi Seç",
  language: "Dil",
  arabic: "العربية",
  english: "English",
  turkish: "Türkçe",
  allRights: "Tüm hakları saklıdır.",
  privacy: "Gizlilik Politikası",
  terms: "Hizmet Şartları",
  sitemap: "Site Haritası",
  days: "Gün",
  day: "Gün",
  viewDetails: "Detayları Gör",
  reviews: "yorum",
  perPerson: "/ kişi",
  startingFrom: "Başlayan fiyatlarla",
  allInclusive: "Her Şey Dahil",
  menu: "Menü",
  reset: "Sıfırla",
  enabled: "Açık",
  disabled: "Kapalı",
};

const trNav = {
  home: "Ana Sayfa",
  holidays: "Türkiye Tatilleri",
  flights: "Uçuşlar",
  visa: "Vize Hizmetleri",
  uaeTours: "Türkiye Günlük Turları",
  turkeyTours: "VIP Günlük Turlar",
  hotels: "Oteller",
  transfers: "Transfer & VIP",
  blog: "Blog",
  contact: "İletişim",
  aiChat: "AI Seyahat Danışmanı",
  about: "Hakkımızda",
  dubai: "Dubai",
  maldives: "Maldivler",
  thailand: "Tayland",
  bali: "Bali",
  singapore: "Singapur",
  istanbul: "İstanbul",
  antalya: "Antalya",
  cappadocia: "Kapadokya",
  trabzon: "Trabzon",
  bursa: "Bursa",
  sapanca: "Sapanca",
  rizeAyder: "Rize & Ayder",
  uaeVisa: "BAE Vizesi",
  schengenVisa: "Schengen Vizesi",
  ukVisa: "İngiltere Vizesi",
  usaVisa: "ABD Vizesi",
  visaChange: "Vize Değişimi",
};

const trSearch = {
  flights: "Uçuşlar",
  holidays: "Tatiller",
  hotels: "Oteller",
  tours: "Turlar",
  insurance: "Sigorta",
  visa: "Vize",
  offers: "Fırsatlar",
  search: "Ara",
  destination: "Destinasyon",
  destinationPlaceholder: "Türkiye şehri (min. 3 harf)",
  from: "Nereden",
  to: "Nereye",
  departure: "Gidiş",
  return: "Dönüş",
  date: "Tarih",
  guests: "Misafirler",
  rooms: "Odalar",
  checkIn: "Giriş",
  checkOut: "Çıkış",
  class: "Kabin sınıfı",
  oneWay: "Tek yön",
  roundTrip: "Gidiş-dönüş",
  multiCity: "Çoklu şehir",
  trustSecure: "Güvenli rezervasyon",
  trustSupport: "7/24 destek",
  trustBestPrice: "En iyi Türkiye fiyatları",
  guestsLabel: "Yolcular",
  noResults: "Eşleşen sonuç yok",
  resultsFor: "Sonuçlar:",
};

const trEnquiry = {
  title: "Ücretsiz Teklif Alın",
  subtitle: "Türkiye seyahatinizi anlatın, ekibimiz kısa sürede dönüş yapsın.",
  name: "Ad soyad",
  namePlaceholder: "Adınız",
  email: "E-posta",
  emailPlaceholder: "ornek@email.com",
  phone: "Telefon / WhatsApp",
  phonePlaceholder: "+90 veya ülke kodu",
  message: "Mesaj",
  messagePlaceholder: "Tarihler, şehirler, otel tercihi…",
  submit: "Talep Gönder",
  submitting: "Gönderiliyor…",
  successTitle: "Talebiniz alındı",
  successBody: "Teşekkürler! Alrayyan ekibimiz yakında sizinle iletişime geçecek.",
  packageLabel: "Paket",
  destinationLabel: "Destinasyon",
};

const trPackageDetail = {
  overview: "Genel bakış",
  itinerary: "Program",
  inclusions: "Dahil",
  exclusions: "Dahil değil",
  features: "Öne çıkanlar",
  rules: "Kurallar ve şartlar",
  tips: "Seyahat ipuçları",
  reviews: "Misafir yorumları",
  map: "Rota haritası",
  bookNow: "Şimdi rezerve et",
  enquire: "Teklif iste",
  days: "Gün",
  nights: "Gece",
  perPerson: "kişi başı",
  privateVip: "Özel VIP araç",
  groupSize: "Grup büyüklüğü",
  from: "Başlayan",
  whatsapp: "WhatsApp rezervasyon",
  emptyItinerary: "Detaylı gün gün program",
  related: "Benzer Türkiye turları",
};

const trChat = {
  title: "AI Seyahat Danışmanı",
  subtitle:
    "Alrayyan Turizm fiyatlarıyla planlayın — oteller, uçuşlar, paketler ve transferler",
  placeholder: "Destinasyon, tarihler ve yolcu sayısını yazın...",
  send: "Gönder",
  whatsappCta: "Rezervasyonu WhatsApp ile tamamla",
  typing: "Yazıyor...",
  quickPlan: "Dubai gezisi planla",
  quickHotelFlight: "Otel + uçuş",
  quickTransfer: "Havalimanı transferi",
  quickMaldives: "Maldivler paketi",
  error: "Danışmana ulaşılamadı. Lütfen tekrar deneyin.",
  attachFile: "Dosya ekle",
  uploadImage: "Görsel yükle",
  removeAttachment: "Kaldır",
  fileTooLarge: "Dosya çok büyük (maks. 8 MB).",
  unsupportedType: "Desteklenmeyen dosya türü. Görsel, PDF veya Word kullanın.",
  analyzingImage: "Görseliniz analiz ediliyor...",
  maxAttachments: "Mesaj başına en fazla 4 dosya ekleyebilirsiniz.",
  online: "Şu an çevrimiçi",
  welcomeHint:
    "Destinasyon sorun, otel teklifi ekran görüntüsü paylaşın veya seyahat belgesi yükleyin — Alrayyan Turizm fiyatlarıyla paket hazırlayayım.",
  dropFiles: "Görselleri veya dosyaları buraya bırakın",
};

const trFooter = {
  tagline:
    "Modern gezginler için unutulmaz yolculuklar. Dünyayı üstün konfor ve lüksle deneyimleyin.",
  explore: "Keşfet",
  destinations: "Destinasyonlar",
  contact: "İletişim",
  holidayPackages: "Tatil Paketleri",
  flightBooking: "Uçuş Rezervasyonu",
  visaServices: "Vize Hizmetleri",
  address: "İstanbul, Türkiye",
};

// Parse ADMIN_EXTRA_TR into object
function parseKvBlock(block) {
  const obj = {};
  const re = /(\w+):\s*"((?:\\.|[^"\\])*)"/g;
  let m;
  while ((m = re.exec(block))) {
    obj[m[1]] = m[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }
  return obj;
}

const adminBaseEn = parseKvBlock(`
    panel: "Admin Panel",
    overview: "Overview",
    content: "Content",
    settings: "Settings",
    dashboard: "Dashboard",
    bookings: "Bookings",
    customers: "Customer management",
    pocketbase: "PocketBase settings",
    flights: "Flights",
    packages: "Packages",
    tours: "Tours",
    visa: "Visa",
    blog: "Articles",
    hotels: "Hotels",
    transfers: "Transfers & VIP",
    contentControl: "Content Control",
    menuVisibility: "Menu / Services Visibility",
    homepageAi: "Visual AI Editor",
    visualAiEditor: "Visual AI Editor",
    aiSettings: "AI Settings",
    contactSettings: "Contact & Social",
    integrations: "Integrations & Tracking",
    viewLiveSite: "View Live Site",
    administrator: "Administrator",
    signOut: "Sign Out",
    loading: "Loading...",
`);

const adminTrBase = {
  panel: "Yönetim Paneli",
  overview: "Genel Bakış",
  content: "İçerik",
  settings: "Ayarlar",
  dashboard: "Kontrol Paneli",
  bookings: "Rezervasyonlar",
  customers: "Müşteri yönetimi",
  pocketbase: "PocketBase ayarları",
  flights: "Uçuşlar",
  packages: "Paketler",
  tours: "Turlar",
  visa: "Vize",
  blog: "Yazılar",
  hotels: "Oteller",
  transfers: "Transfer & VIP",
  contentControl: "İçerik Kontrolü",
  menuVisibility: "Menü / Hizmet Görünürlüğü",
  homepageAi: "Görsel AI Editör",
  visualAiEditor: "Görsel AI Editör",
  aiSettings: "AI Ayarları",
  contactSettings: "İletişim & Sosyal",
  integrations: "Entegrasyonlar & İzleme",
  viewLiveSite: "Canlı Siteyi Gör",
  administrator: "Yönetici",
  signOut: "Çıkış Yap",
  loading: "Yükleniyor...",
  ...parseKvBlock(ADMIN_EXTRA_TR),
  page: "Sayfa",
};

const trBlog = {
  title: "Seyahat Blogu",
  subtitle: "Bir sonraki yolculuğunuz için ipuçları, rehberler ve ilham",
  all: "Tümü",
  published: "Yayında",
  draft: "Taslak",
  newArticle: "Yeni Yazı",
  editArticle: "Yazıyı Düzenle",
  seoTitle: "SEO Başlığı",
  seoDescription: "SEO Açıklaması",
  focusKeyword: "Odak Anahtar Kelime",
  coverImage: "Kapak Görseli",
  category: "Kategori",
  tags: "Etiketler",
  author: "Yazar",
  content: "İçerik",
  publishNow: "Şimdi Yayınla",
  saveDraft: "Taslak Kaydet",
  aiChat: "AI Yazım Asistanı",
  aiPlaceholder: "Bir bölüm, başlık yazmasını veya görsel önermesini isteyin...",
  insertToArticle: "Yazıya ekle",
  noPosts: "Henüz yazı yok",
};

const trHotels = {
  title: "Oteller",
  subtitle: "Konforlu bir konaklama için özenle seçilmiş oteller",
  rooms: "Odalar",
  stars: "Yıldız",
  amenities: "Olanaklar",
  perNight: "gecelik",
  bookRoom: "Oda Rezerve Et",
  bookWhatsApp: "WhatsApp ile Rezerve Et",
  noHotels: "Uygun otel yok",
  from: "Başlayan",
  reviews: "yorum",
  highlights: "Tesis öne çıkanları",
  policies: "Kurallar ve politikalar",
  breakfastIncluded: "Kahvaltı dahil",
  freeCancellation: "Ücretsiz iptal",
  searchPlaceholder: "Otel, mahalle ara...",
  checkIn: "Giriş",
  checkOut: "Çıkış",
  location: "Konum",
  nearby: "Yakındaki yerler",
};

const trTransfers = {
  title: "Transfer & VIP Turlar",
  subtitle: "Lüks araçlar, havalimanı transferleri ve özel VIP turlar",
  airportTransfer: "Havalimanı Transferi",
  vipTours: "VIP Turlar",
  seats: "Koltuk",
  luggage: "Bagaj",
  duration: "Süre",
  bookNow: "Şimdi Rezerve Et",
  noTransfers: "Hizmet bulunamadı",
};

const trAi = {
  title: "Gemini Ayarları",
  subtitle: "API anahtarı, talimatlar ve yazım kurallarını yönetin",
  apiKey: "API Anahtarı",
  model: "Model",
  systemInstructions: "Sistem Talimatları",
  writingRules: "Yazım Kuralları",
  testConnection: "Bağlantıyı Test Et",
  testing: "Test ediliyor...",
  connected: "Başarıyla bağlandı",
  failed: "Bağlantı başarısız",
  saved: "Ayarlar kaydedildi",
};

const trHome = {
  featuredDestination: "Öne Çıkan Destinasyon",
  watchFilm: "Filmi İzle",
  scroll: "Kaydır",
  handpicked: "Sizin İçin Seçildi",
  featuredPackages: "Öne Çıkan Tatil Paketleri",
  curatedDestinations: "Seçilmiş Destinasyonlar",
  destinationsBlurb:
    "Alrayyan ile Türkiye'nin en güzel şehirlerini keşfedin — İstanbul, Antalya, Kapadokya, Trabzon, Bursa, Sapanca ve Ayder. Özel araçlar, özenli paketler ve havalimanı transferleri.",
  packagesCount: "paket",
  viewAllDestinations: "Tüm Destinasyonları Gör",
  flashDealsBadge: "Flaş Fırsatlar",
  flashDealsSubtitle:
    "Bu özel fırsatları kaçırmayın. Sınırlı kontenjan!",
  viewAllDeals: "Tüm Fırsatları Gör",
  offerEndsIn: "Teklifin bitişine:",
  booked: "Rezerve edildi",
  seatsLeft: "kaldı",
  book: "Rezerve Et",
  emailPlaceholder: "E-posta adresinizi girin",
  latestBlog: "Blogdan Son Yazılar",
  viewAllArticles: "Tüm Yazıları Gör",
  ourImpact: "Etkimiz",
  numbersSpeak: "Rakamlar konuşuyor",
  happyTravelers: "Mutlu Gezginler",
  happyTravelersDesc: "Yolculuklarını bize emanet ediyor",
  destinations: "Destinasyonlar",
  destinationsDesc: "Dünyanın dört bir yanı",
  packages: "Paketler",
  packagesDesc: "Özenle hazırlanmış deneyimler",
  yearsExperience: "Yıllık Deneyim",
  yearsExperienceDesc: "Sektörde",
  trustTitle: "Dünya Çapında Gezginlerin Güveni",
  trustSubtitle:
    "Huzurunuz için lisanslı ve sertifikalıyız. Yolculuğunuz bizimle güvende.",
  happyTravelersCount: "+50.000 mutlu gezgin",
  iataCertified: "IATA Sertifikalı",
  licensedAgent: "Lisanslı Acente",
  dubaiTourism: "Dubai Turizm",
  authorizedPartner: "Yetkili Partner",
  verified: "Doğrulanmış",
  secureBooking: "Güvenli Rezervasyon",
  reviewsCount: "2.340 Yorum",
  partnersTitle: "Güvenilir Partnerlerimiz",
  partnersSubtitle: "Dünyanın önde gelen havayolları ve otelleriyle çalışıyoruz",
  partnerHotels: "Partner Oteller",
  airlines: "Havayolları",
  countries: "Ülkeler",
  support247: "Destek",
  testimonials: "Yorumlar",
  testimonialsTitle: "Gezginlerimiz",
  testimonialsHighlight: "hakkımızda ne diyor",
  traveledTo: "Seyahat etti",
  chatWithUs: "Bizimle sohbet edin",
  callNow: "Hemen Ara",
  emailUs: "E-posta Gönder",
};

const trVisaHome = {
  trustBadge: "10.000+ Gezginin Güveni",
  title: "BAE Vize Hizmetleri",
  subtitle:
    "UAE vizenizi sorunsuz hizmetimizle hızlıca alın. Tüm işlemleri biz yönetiyoruz.",
  touristVisa: "BAE Turist Vizesi",
  visaChange: "Vize Değişimi",
  days30: "30 Gün",
  days60: "60 Gün",
  days90: "90 Gün",
  insideUae: "BAE İçinde",
  bestValue: "EN AVANTAJLI",
  applyNow: "Şimdi Başvur",
  explore: "Keşfet",
  worldwideBefore: "Başka ülkeler için vize mi lazım? Biz",
  worldwideHighlight: "dünya çapında vize işliyoruz!",
  processing23: "2-3 İş Günü",
  processing35: "3-5 İş Günü",
  sameDay: "Aynı Gün",
  singleEntry: "Tek Giriş",
  multipleEntry: "Çoklu Giriş",
  valid60: "60 gün geçerli",
  valid90: "90 gün geçerli",
  valid180: "180 gün geçerli",
  fastProcessing: "Hızlı İşlem",
  airportPickup: "Havalimanı Karşılama",
  premiumSupport: "Premium Destek",
  noExitRequired: "Çıkış gerekmez",
  allNationalities: "Tüm uyruklar",
  expressService: "Ekspres Hizmet",
};

const trPackages = {
  amenityHotel: "5 Yıldızlı Otel",
  amenityTransfer: "Havalimanı Transferi",
  amenityBreakfast: "Kahvaltı",
  amenityCityTour: "Şehir Turu",
  amenityWaterVilla: "Su Üstü Villa",
  amenityAllInclusive: "Her Şey Dahil",
  amenitySpa: "Spa Erişimi",
  amenitySnorkeling: "Şnorkel",
  amenityIslandHopping: "Ada Turu",
  amenityTempleTours: "Tapınak Turları",
  amenityLuxuryVillas: "Lüks Villalar",
  amenityCulturalTours: "Kültür Turları",
  amenityYoga: "Yoga Seansları",
  amenityHalfBoard: "Yarım Pansiyon",
  amenityGardens: "Gardens by the Bay",
  amenityUniversal: "Universal Studios",
  amenityPyramidTours: "Piramit Turları",
  amenityNileCruise: "Nil Akşam Yemeği Kruvaziyeri",
  amenityGuide: "Rehber",
};

const trMenuVisibility = {
  title: "Menü / Hizmet Görünürlüğü",
  subtitle:
    "Üst menü ve mobil menüde hangi hizmetlerin görüneceğini açın veya kapatın.",
  saveHint: "Değişiklikler otomatik kaydedilir ve sitede canlı uygulanır.",
  resetDefaults: "Varsayılana sıfırla (tümü görünür)",
};

const trContactSettings = {
  title: "İletişim & Sosyal",
  subtitle:
    "Herkese açık sitede gösterilen müşteri hizmetleri numaralarını, WhatsApp ve sosyal bağlantıları yönetin.",
  saveHint: "Değişiklikleri canlı siteye göndermek için kaydedin.",
  resetDefaults: "Varsayılana sıfırla",
  resetConfirm: "Tüm iletişim ayarları varsayılana sıfırlansın mı?",
  saved: "İletişim ayarları kaydedildi",
  resetDone: "Varsayılanlar geri yüklendi",
  phonesSection: "Telefonlar & WhatsApp",
  whatsappNumber: "WhatsApp iş numarası",
  whatsappHint:
    "Ülke koduyla rakamlar (örn. 971585255484). Yüzen WA ve wa.me bağlantılarında kullanılır.",
  customerPhones: "Müşteri hizmetleri telefonları",
  addPhone: "Ekle",
  callbackPhone: "Geri arama görüntü telefonu (isteğe bağlı)",
  callbackPhoneHint: "Ayarlandığında Geri Arama widget'ında gösterilir.",
  contactSection: "E-posta, adres ve destek saatleri",
  email: "E-posta",
  address: "Kısa adres",
  supportHours: "Destek saatleri",
  supportHoursPlaceholder: "Pzt – Cmt: 09:00 – 21:00",
  socialSection: "Sosyal ağlar",
  socialHint:
    "Bir ağı etkinleştirin ve URL'sini ayarlayın; kenar çubuğu ve alt bilgide görünsün.",
  whatsappSocialNote:
    "WhatsApp etkinse yukarıdaki iş numarasını kullanır.",
  url: "URL",
  handle: "Kullanıcı adı / etiket",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
};

const trIntegrations = {
  title: "Entegrasyonlar & İzleme",
  subtitle:
    "İzleme kimliklerini yönetim panelinden girin — sunucuda ortam değerleri olarak kaydedilir.",
  envOnlyHint:
    "Bu sayfadan kaydetmek birincil yoldur. Değerler sunucuda ve .env.local dosyasında saklanır.",
  vpsSetupTitle: "Kayıt nasıl çalışır",
  vpsSetupBody:
    "Kayıttan sonra sunucu dosyaları hemen güncellenir. Pikseller herkese açık izleme API'si üzerinden yüklenir.",
  vpsStep1: "Kimlikleri Google / Meta / TikTok panellerinden kopyalayın.",
  vpsStep2: "Aşağıya yapıştırın ve “Sunucuya kaydet”e tıklayın.",
  vpsStep3:
    "Yalnızca arayüz isterse sunucuyu yeniden başlatın — diğer NEXT_PUBLIC_* araçları için.",
  noneConfigured:
    "Henüz izleme yapılandırılmadı. Kimlik ekleyene kadar site pikselsiz çalışır.",
  statusLive: "Canlı",
  statusMissing: "Ayarlanmadı",
  envVarLabel: "Ortam değişkeni",
  currentValueLabel: "Güncel değer (maskeli)",
  connectVerify: "Platformda bağla / doğrula",
  gscTitle: "Google Search Console",
  gscHelp: "NEXT_PUBLIC_GSC_VERIFICATION",
  gaTitle: "Google Analytics (GA4)",
  gaHelp: "NEXT_PUBLIC_GA_ID",
  gtmTitle: "Google Tag Manager",
  gtmHelp: "NEXT_PUBLIC_GTM_ID",
  adsTitle: "Google Ads",
  adsHelp: "NEXT_PUBLIC_GOOGLE_ADS_ID",
  fbTitle: "Meta (Facebook) Pixel",
  fbHelp: "NEXT_PUBLIC_META_PIXEL_ID",
  fbAltConnect: "Events Manager (facebook.com)",
  ttTitle: "TikTok Pixel",
  ttHelp: "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
};

const trCallback = {
  getCallback: "Geri Arama İste",
  eta: "~2 dk",
  title: "Geri Arama Talebi",
  subtitle: "2 dakika içinde sizi arayacağız",
  phoneLabel: "Telefon Numaranız",
  phonePlaceholder: "Numaranızı girin",
  benefitsTitle: "Neler alacaksınız:",
  benefit1: "Kişiselleştirilmiş seyahat önerileri",
  benefit2: "İnternette listelenmeyen özel fırsatlar",
  benefit3: "Ücretsiz seyahat planlama desteği",
  submit: "Şimdi Beni Ara",
  connecting: "Bağlanıyor...",
  successTitle: "Sizi Arıyoruz!",
  successBody:
    "Lütfen telefonunuzu hazır tutun. Seyahat uzmanımız sizi şu numaradan arayacak:",
  privacyNote: "Geri arama talep ederek şunu kabul etmiş olursunuz:",
  connectWithUs: "Bizimle bağlantı kurun!",
};

function ser(obj, indent = 2) {
  const pad = " ".repeat(indent);
  const lines = Object.entries(obj).map(([k, v]) => {
    const escaped = String(v)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");
    return `${pad}${k}: "${escaped}",`;
  });
  return lines.join("\n");
}

const trFile = `import type { Dictionary } from "../types";

const tr: Dictionary = {
  common: {
${ser(trCommon, 4)}
  },
  nav: {
${ser(trNav, 4)}
  },
  search: {
${ser(trSearch, 4)}
  },
  enquiry: {
${ser(trEnquiry, 4)}
  },
  packageDetail: {
${ser(trPackageDetail, 4)}
  },
  chat: {
${ser(trChat, 4)}
  },
  footer: {
${ser(trFooter, 4)}
  },
  admin: {
${ser(adminTrBase, 4)}
  },
  blog: {
${ser(trBlog, 4)}
  },
  hotels: {
${ser(trHotels, 4)}
  },
  transfers: {
${ser(trTransfers, 4)}
  },
  ai: {
${ser(trAi, 4)}
  },
  home: {
${ser(trHome, 4)}
  },
  visaHome: {
${ser(trVisaHome, 4)}
  },
  packages: {
${ser(trPackages, 4)}
  },
  menuVisibility: {
${ser(trMenuVisibility, 4)}
  },
  contactSettings: {
${ser(trContactSettings, 4)}
  },
  integrations: {
${ser(trIntegrations, 4)}
  },
  callback: {
${ser(trCallback, 4)}
  },
};

export default tr;
`;

fs.writeFileSync(path.join(dictDir, "tr.ts"), trFile);
console.log("Patched types, en, ar; wrote tr.ts");
console.log("en has turkish?", fs.readFileSync(enPath,"utf8").includes("turkish:"));
console.log("types Locale?", fs.readFileSync(typesPath,"utf8").includes('"tr"'));
console.log("admin welcome?", fs.readFileSync(enPath,"utf8").includes("welcomeSubtitle"));
