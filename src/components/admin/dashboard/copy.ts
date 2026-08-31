import type { Locale } from "@/lib/i18n/types";

export type DashboardCopy = {
  title: string;
  subtitle: string;
  live: string;
  pocketbaseOff: string;
  pocketbaseOn: string;
  loadFailed: string;
  bookings: string;
  enquiries: string;
  hotelBookings: string;
  customers: string;
  payments: string;
  paid: string;
  pending: string;
  refunded: string;
  other: string;
  services: string;
  hotels: string;
  ownedHotels: string;
  flights: string;
  packages: string;
  tours: string;
  transfers: string;
  cars: string;
  visa: string;
  pages: string;
  posts: string;
  visits: string;
  uniqueSessions: string;
  uniqueVisitors: string;
  gemini: string;
  geminiFree: string;
  geminiPaid: string;
  geminiToday: string;
  providers: string;
  hotelsProvider: string;
  advisorProvider: string;
  flightsProvider: string;
  liveCalls: string;
  remaining: string;
  limitUnknown: string;
  quotaWarn: string;
  bookingsTrend: string;
  bookingsTrendDesc: string;
  bookingsByType: string;
  bookingsByTypeDesc: string;
  paymentMix: string;
  paymentMixDesc: string;
  servicesMix: string;
  servicesMixDesc: string;
  recentBookings: string;
  noBookings: string;
  noBookingsHint: string;
  customer: string;
  service: string;
  status: string;
  date: string;
  topPages: string;
  topPagesDesc: string;
  noVisits: string;
  noVisitsHint: string;
  audience: string;
  countries: string;
  devices: string;
  geoUnavailable: string;
  geoUnavailableHint: string;
  devicesUnavailable: string;
  devicesUnavailableHint: string;
  visitSource: string;
  catalog: string;
  active: string;
  featured: string;
  published: string;
  new: string;
  inProgress: string;
  resolved: string;
  typeFlight: string;
  typeHotel: string;
  typePackage: string;
  typeTransfer: string;
  typeVisa: string;
  typeTour: string;
  typeCar: string;
  typeCallback: string;
  typeContact: string;
  typeGeneral: string;
  count: string;
  sectionEconomics: string;
  sectionGrowth: string;
  affiliate: string;
  affiliates: string;
  affiliateVisits: string;
  affiliateConversions: string;
  affiliatePaid: string;
  affiliatePending: string;
  rewards: string;
  pointsIssued: string;
  pointsRedeemed: string;
  pointsUsd: string;
  walletBalance: string;
  pendingPoints: string;
  coupons: string;
  couponsCreated: string;
  couponsUsed: string;
  couponsDiscount: string;
  couponsByService: string;
  economics: string;
  economicsHint: string;
  cost: string;
  profit: string;
  clientPaid: string;
  hotelMarkupProfit: string;
  flightMarkupProfit: string;
  estimated: string;
  comingSoon: string;
  generatedAt: string;
  deviceDesktop: string;
  deviceMobile: string;
  deviceTablet: string;
};

const ar: DashboardCopy = {
  title: "لوحة الإحصائيات",
  subtitle: "أرقام حقيقية من PocketBase والعدادات الحالية — بدون تقديرات.",
  live: "مباشر",
  pocketbaseOff: "PocketBase غير متصل. الحجوزات والعملاء والمدفوعات والزيارات ستظهر عند الربط.",
  pocketbaseOn: "المصدر: PocketBase + عدادات الحصص",
  loadFailed: "تعذّر تحميل الإحصائيات.",
  bookings: "الحجوزات",
  enquiries: "استفسارات",
  hotelBookings: "حجوزات فنادق",
  customers: "العملاء",
  payments: "المدفوعات",
  paid: "مدفوع",
  pending: "قيد الدفع",
  refunded: "مسترد",
  other: "أخرى",
  services: "الخدمات",
  hotels: "فنادق",
  ownedHotels: "فنادق مملوكة",
  flights: "طيران",
  packages: "باقات",
  tours: "جولات",
  transfers: "ترانسفير",
  cars: "سيارات",
  visa: "تأشيرات",
  pages: "صفحات",
  posts: "مقالات",
  visits: "زيارات مسجّلة",
  uniqueSessions: "جلسات",
  uniqueVisitors: "زائرون مميزون",
  gemini: "حصة Gemini",
  geminiFree: "مجاني",
  geminiPaid: "مدفوع",
  geminiToday: "اليوم",
  providers: "حصص المزودين",
  hotelsProvider: "فنادق Booking",
  advisorProvider: "Travel Advisor",
  flightsProvider: "طيران Sky Scrapper",
  liveCalls: "نداءات حية",
  remaining: "متبقٍ",
  limitUnknown: "الحد غير ظاهر من الترويسة بعد",
  quotaWarn: "الحصة منخفضة أو ظهر 429",
  bookingsTrend: "الحجوزات — 14 يوماً",
  bookingsTrendDesc: "تجميع يومي من سجلات الحجوزات والاستفسارات.",
  bookingsByType: "الحجوزات حسب الخدمة",
  bookingsByTypeDesc: "توزيع الأنواع من السجلات الحالية.",
  paymentMix: "حالة المدفوعات",
  paymentMixDesc: "من حجوزات الفنادق المرتبطة بالدفع.",
  servicesMix: "مخزون الخدمات",
  servicesMixDesc: "الكتالوج الحالي + أسطول السيارات والصفحات.",
  recentBookings: "أحدث الحجوزات",
  noBookings: "لا حجوزات بعد",
  noBookingsHint: "ستظهر هنا عند ورود استفسار أو حجز فندق.",
  customer: "العميل",
  service: "الخدمة",
  status: "الحالة",
  date: "التاريخ",
  topPages: "أكثر الصفحات زيارة",
  topPagesDesc: "تجميع خفيف من إشعارات الزيارة المسجّلة.",
  noVisits: "لا زيارات مسجّلة بعد",
  noVisitsHint: "تُحتسب من تتبع الصفحات العامة عند توفره.",
  audience: "الجمهور",
  countries: "البلدان",
  devices: "الأجهزة",
  geoUnavailable: "لا بيانات بلدان بعد",
  geoUnavailableHint: "التتبع الحالي لا يخزّن الدولة. سيُملأ هذا القسم عند تفعيل المصدر الجغرافي — لن تُعرض دول تقديرية.",
  devicesUnavailable: "لا بيانات أجهزة بعد",
  devicesUnavailableHint: "سجل الزيارة لا يحتوي نوع الجهاز. سيُملأ عند حفظ وكيل المستخدم.",
  visitSource: "المصدر: إشعارات الزيارة (مع حدّ تكرار)",
  catalog: "كتالوج",
  active: "نشط",
  featured: "مميز",
  published: "منشور",
  new: "جديد",
  inProgress: "قيد المعالجة",
  resolved: "تم الحل",
  typeFlight: "طيران",
  typeHotel: "فندق",
  typePackage: "باقة",
  typeTransfer: "ترانسفير",
  typeVisa: "تأشيرة",
  typeTour: "جولة",
  typeCar: "سيارة",
  typeCallback: "اتصال",
  typeContact: "تواصل",
  typeGeneral: "عام",
  count: "العدد",
  sectionEconomics: "الاقتصاد",
  sectionGrowth: "النمو والتسويق",
  affiliate: "التسويق بالعمولة",
  affiliates: "مسوّقون",
  affiliateVisits: "زيارات الروابط",
  affiliateConversions: "تحويلات",
  affiliatePaid: "عمولات مدفوعة",
  affiliatePending: "عمولات معلّقة",
  rewards: "نقاط العملاء",
  pointsIssued: "نقاط صادرة",
  pointsRedeemed: "نقاط مستبدلة",
  pointsUsd: "ما يعادل الدولار",
  walletBalance: "أرصدة المحافظ",
  pendingPoints: "نقاط معلّقة",
  coupons: "الكوبونات",
  couponsCreated: "كوبونات منشأة",
  couponsUsed: "مرات الاستخدام",
  couponsDiscount: "إجمالي الخصم",
  couponsByService: "حسب الخدمة",
  economics: "التكلفة والربح",
  economicsHint: "سعر المزود مقابل الربح من المارك أب مقابل ما دفعه العميل — من الحجوزات المدفوعة وقواعد المارك أب الحالية.",
  cost: "تكلفتنا",
  profit: "ربح المارك أب",
  clientPaid: "دفع العميل",
  hotelMarkupProfit: "ربح فنادق",
  flightMarkupProfit: "ربح طيران",
  estimated: "تقديري من قواعد المارك أب",
  comingSoon: "قريباً",
  generatedAt: "آخر تحديث",
  deviceDesktop: "حاسوب",
  deviceMobile: "جوال",
  deviceTablet: "لوحي",
};

const en: DashboardCopy = {
  title: "Statistics",
  subtitle: "Live counts from PocketBase and current quota counters — no placeholders.",
  live: "Live",
  pocketbaseOff: "PocketBase is offline. Bookings, customers, payments, and visits appear after it is connected.",
  pocketbaseOn: "Source: PocketBase + quota counters",
  loadFailed: "Could not load statistics.",
  bookings: "Bookings",
  enquiries: "Enquiries",
  hotelBookings: "Hotel bookings",
  customers: "Customers",
  payments: "Payments",
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
  other: "Other",
  services: "Services",
  hotels: "Hotels",
  ownedHotels: "Owned hotels",
  flights: "Flights",
  packages: "Packages",
  tours: "Tours",
  transfers: "Transfers",
  cars: "Cars",
  visa: "Visa",
  pages: "Pages",
  posts: "Articles",
  visits: "Recorded visits",
  uniqueSessions: "Sessions",
  uniqueVisitors: "Distinct visitors",
  gemini: "Gemini quota",
  geminiFree: "Free",
  geminiPaid: "Paid",
  geminiToday: "Today",
  providers: "Provider quotas",
  hotelsProvider: "Hotels · Booking",
  advisorProvider: "Travel Advisor",
  flightsProvider: "Flights · Sky Scrapper",
  liveCalls: "Live calls",
  remaining: "Remaining",
  limitUnknown: "Header limit not seen yet",
  quotaWarn: "Low remaining or 429 seen",
  bookingsTrend: "Bookings — 14 days",
  bookingsTrendDesc: "Daily totals from enquiry and hotel booking records.",
  bookingsByType: "Bookings by service",
  bookingsByTypeDesc: "Type mix from current records.",
  paymentMix: "Payment status",
  paymentMixDesc: "From hotel bookings that have payment fields.",
  servicesMix: "Service inventory",
  servicesMixDesc: "Current catalog plus car fleet and pages.",
  recentBookings: "Latest bookings",
  noBookings: "No bookings yet",
  noBookingsHint: "They will appear when a guest submits an enquiry or hotel booking.",
  customer: "Customer",
  service: "Service",
  status: "Status",
  date: "Date",
  topPages: "Top pages",
  topPagesDesc: "Light aggregation from recorded visit notifications.",
  noVisits: "No recorded visits yet",
  noVisitsHint: "Counted from public-page tracking when it is available.",
  audience: "Audience",
  countries: "Countries",
  devices: "Devices",
  geoUnavailable: "No country data yet",
  geoUnavailableHint: "Current tracking does not store country. This block will fill when geo is enabled — no estimated countries are shown.",
  devicesUnavailable: "No device data yet",
  devicesUnavailableHint: "Visit records do not include device type. This will fill when user-agent is stored.",
  visitSource: "Source: visit notifications (throttled)",
  catalog: "Catalog",
  active: "Active",
  featured: "Featured",
  published: "Published",
  new: "New",
  inProgress: "In progress",
  resolved: "Resolved",
  typeFlight: "Flight",
  typeHotel: "Hotel",
  typePackage: "Package",
  typeTransfer: "Transfer",
  typeVisa: "Visa",
  typeTour: "Tour",
  typeCar: "Car",
  typeCallback: "Callback",
  typeContact: "Contact",
  typeGeneral: "General",
  count: "Count",
  sectionEconomics: "Economics",
  sectionGrowth: "Growth & marketing",
  affiliate: "Affiliate",
  affiliates: "Marketers",
  affiliateVisits: "Referral visits",
  affiliateConversions: "Conversions",
  affiliatePaid: "Paid commissions",
  affiliatePending: "Pending commissions",
  rewards: "Client rewards",
  pointsIssued: "Points issued",
  pointsRedeemed: "Points redeemed",
  pointsUsd: "USD equivalent",
  walletBalance: "Wallet balances",
  pendingPoints: "Pending points",
  coupons: "Coupons",
  couponsCreated: "Coupons created",
  couponsUsed: "Times used",
  couponsDiscount: "Discount given",
  couponsByService: "By service",
  economics: "Cost vs profit",
  economicsHint: "Provider cost versus markup profit versus what the client paid — from paid bookings and current markup rules.",
  cost: "Our cost",
  profit: "Markup profit",
  clientPaid: "Client paid",
  hotelMarkupProfit: "Hotel profit",
  flightMarkupProfit: "Flight profit",
  estimated: "Estimated from current markup rules",
  comingSoon: "Coming soon",
  generatedAt: "Updated",
  deviceDesktop: "Desktop",
  deviceMobile: "Mobile",
  deviceTablet: "Tablet",
};

const tr: DashboardCopy = {
  title: "İstatistikler",
  subtitle: "PocketBase ve mevcut kota sayaçlarından gerçek rakamlar — tahmin yok.",
  live: "Canlı",
  pocketbaseOff: "PocketBase bağlı değil. Rezervasyon, müşteri, ödeme ve ziyaretler bağlanınca görünür.",
  pocketbaseOn: "Kaynak: PocketBase + kota sayaçları",
  loadFailed: "İstatistikler yüklenemedi.",
  bookings: "Rezervasyonlar",
  enquiries: "Talepler",
  hotelBookings: "Otel rezervasyonları",
  customers: "Müşteriler",
  payments: "Ödemeler",
  paid: "Ödendi",
  pending: "Bekliyor",
  refunded: "İade",
  other: "Diğer",
  services: "Hizmetler",
  hotels: "Oteller",
  ownedHotels: "Sahip olunan oteller",
  flights: "Uçuşlar",
  packages: "Paketler",
  tours: "Turlar",
  transfers: "Transfer",
  cars: "Araçlar",
  visa: "Vize",
  pages: "Sayfalar",
  posts: "Yazılar",
  visits: "Kayıtlı ziyaretler",
  uniqueSessions: "Oturumlar",
  uniqueVisitors: "Tekil ziyaretçiler",
  gemini: "Gemini kotası",
  geminiFree: "Ücretsiz",
  geminiPaid: "Ücretli",
  geminiToday: "Bugün",
  providers: "Sağlayıcı kotaları",
  hotelsProvider: "Oteller · Booking",
  advisorProvider: "Travel Advisor",
  flightsProvider: "Uçuşlar · Sky Scrapper",
  liveCalls: "Canlı çağrılar",
  remaining: "Kalan",
  limitUnknown: "Başlık limiti henüz görülmedi",
  quotaWarn: "Kota düşük veya 429 görüldü",
  bookingsTrend: "Rezervasyonlar — 14 gün",
  bookingsTrendDesc: "Talep ve otel kayıtlarından günlük toplam.",
  bookingsByType: "Hizmete göre rezervasyon",
  bookingsByTypeDesc: "Mevcut kayıtlardaki tür dağılımı.",
  paymentMix: "Ödeme durumu",
  paymentMixDesc: "Ödeme alanlı otel rezervasyonlarından.",
  servicesMix: "Hizmet envanteri",
  servicesMixDesc: "Mevcut katalog, araç filosu ve sayfalar.",
  recentBookings: "Son rezervasyonlar",
  noBookings: "Henüz rezervasyon yok",
  noBookingsHint: "Misafir talep veya otel rezervasyonu gönderince görünür.",
  customer: "Müşteri",
  service: "Hizmet",
  status: "Durum",
  date: "Tarih",
  topPages: "En çok ziyaret edilen sayfalar",
  topPagesDesc: "Kayıtlı ziyaret bildirimlerinden hafif özet.",
  noVisits: "Kayıtlı ziyaret yok",
  noVisitsHint: "Genel sayfa takibi hazır olunca sayılır.",
  audience: "Kitle",
  countries: "Ülkeler",
  devices: "Cihazlar",
  geoUnavailable: "Ülke verisi yok",
  geoUnavailableHint: "Mevcut takip ülkeyi saklamıyor. Coğrafi kaynak açılınca dolar — tahmini ülke gösterilmez.",
  devicesUnavailable: "Cihaz verisi yok",
  devicesUnavailableHint: "Ziyaret kaydında cihaz türü yok. Kullanıcı aracısı saklanınca dolar.",
  visitSource: "Kaynak: ziyaret bildirimleri (sınırlı)",
  catalog: "Katalog",
  active: "Aktif",
  featured: "Öne çıkan",
  published: "Yayında",
  new: "Yeni",
  inProgress: "İşlemde",
  resolved: "Çözüldü",
  typeFlight: "Uçuş",
  typeHotel: "Otel",
  typePackage: "Paket",
  typeTransfer: "Transfer",
  typeVisa: "Vize",
  typeTour: "Tur",
  typeCar: "Araç",
  typeCallback: "Geri arama",
  typeContact: "İletişim",
  typeGeneral: "Genel",
  count: "Adet",
  sectionEconomics: "Ekonomi",
  sectionGrowth: "Büyüme ve pazarlama",
  affiliate: "Ortaklık",
  affiliates: "Pazarlamacı",
  affiliateVisits: "Referans ziyaretleri",
  affiliateConversions: "Dönüşümler",
  affiliatePaid: "Ödenen komisyon",
  affiliatePending: "Bekleyen komisyon",
  rewards: "Müşteri puanları",
  pointsIssued: "Verilen puan",
  pointsRedeemed: "Kullanılan puan",
  pointsUsd: "USD karşılığı",
  walletBalance: "Cüzdan bakiyeleri",
  pendingPoints: "Bekleyen puan",
  coupons: "Kuponlar",
  couponsCreated: "Oluşturulan kupon",
  couponsUsed: "Kullanım sayısı",
  couponsDiscount: "Verilen indirim",
  couponsByService: "Hizmete göre",
  economics: "Maliyet ve kâr",
  economicsHint: "Sağlayıcı maliyeti, markup kârı ve müşterinin ödediği tutar — ödenmiş rezervasyonlar ve güncel markup kurallarından.",
  cost: "Maliyetimiz",
  profit: "Markup kârı",
  clientPaid: "Müşteri ödedi",
  hotelMarkupProfit: "Otel kârı",
  flightMarkupProfit: "Uçuş kârı",
  estimated: "Güncel markup kurallarından tahmin",
  comingSoon: "Yakında",
  generatedAt: "Güncellendi",
  deviceDesktop: "Masaüstü",
  deviceMobile: "Mobil",
  deviceTablet: "Tablet",
};

export function dashboardCopy(locale: Locale): DashboardCopy {
  switch (locale) {
    case "ar":
      return ar;
    case "tr":
      return tr;
    case "en":
      return en;
    default: {
      const _never: never = locale;
      return _never;
    }
  }
}
