export type TourStep = {
  id: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionTr: string;
  targetSelector?: string;
  iconName: string;
};

export const ADMIN_TOUR_STEPS: TourStep[] = [
  {
    id: "overview",
    titleAr: "مرحباً بك في لوحة تحكم LIOTRIP",
    titleEn: "Welcome to LIOTRIP Admin Panel",
    titleTr: "LIOTRIP Yönetim Paneline Hoş Geldiniz",
    descriptionAr:
      "مركز القيادة الرئيسي لمتابعة إحصائيات الحجوزات والإيرادات والطلبات الواردة لحظة بلحظة.",
    descriptionEn:
      "Your central command hub to track bookings, live revenue, and customer requests in real time.",
    descriptionTr:
      "Rezervasyonları, canlı geliri ve müşteri taleplerini anlık takip edebileceğiniz ana kontrol merkezi.",
    targetSelector: "#admin-nav-dashboard",
    iconName: "LayoutDashboard",
  },
  {
    id: "bookings",
    titleAr: "إدارة الحجوزات والإلغاءات",
    titleEn: "Bookings & Cancellations",
    titleTr: "Rezervasyonlar ve İptaller",
    descriptionAr:
      "تتبع جميع حجوزات الفنادق والطيران والجولات، مع إدارة طلبات الإلغاء ورسوم الاسترجاع المالي بسلاسة.",
    descriptionEn:
      "Manage hotel, flight, and tour bookings with automated cancellation policy fee calculations.",
    descriptionTr:
      "Otel, uçuş ve tur rezervasyonlarını iptal politikaları ve ücret hesaplamalarıyla kolayca yönetin.",
    targetSelector: "#admin-nav-bookings-all",
    iconName: "Inbox",
  },
  {
    id: "customers",
    titleAr: "قاعدة بيانات العملاء والولاء",
    titleEn: "Customers & CRM",
    titleTr: "Müşteriler ve Sadakat Sistemi",
    descriptionAr:
      "ملفات شاملة لكل عميل مع سجل الحجوزات السابقة ومحفظة نقاط المكافآت التلقائية.",
    descriptionEn:
      "Comprehensive traveler profiles, past booking history, and loyalty reward points wallet.",
    descriptionTr:
      "Seyahat geçmişi ve otomatik sadakat puanı cüzdanı içeren kapsamlı müşteri profilleri.",
    targetSelector: "#admin-nav-customers",
    iconName: "Users",
  },
  {
    id: "services",
    titleAr: "محركات البحث والخدمات السياحية",
    titleEn: "Travel Services & Providers",
    titleTr: "Seyahat Hizmetleri ve Sağlayıcılar",
    descriptionAr:
      "إدارة 6 محركات سياحية متكاملة: فنادق عالمية، طيران دولي، باقات وجولات، سيارات وترانسفير، وتأشيرات مع هوامش ربح ديناميكية.",
    descriptionEn:
      "Configure 6 travel services: global hotels, flights, tour packages, car rentals, airport transfers, and visas.",
    descriptionTr:
      "6 entegre seyahat motoru: küresel oteller, uçuşlar, turlar, transferler ve vizeler.",
    targetSelector: "#admin-nav-hotels",
    iconName: "Package",
  },
  {
    id: "content",
    titleAr: "المحرر البصري والصفحات",
    titleEn: "Visual Page Builder & Content",
    titleTr: "Görsel Sayfa Düzenleyici ve İçerik",
    descriptionAr:
      "خصص الصفحة الرئيسية بالسحب والإفلات، وأدر مقالات مدونة السفر والصفحات التعريفية وهويتك البصرية بالكامل.",
    descriptionEn:
      "Drag-and-drop visual homepage builder, SEO travel blog articles, and complete brand theme customization.",
    descriptionTr:
      "Sürükle-bırak ana sayfa düzenleyici, seyahat blogu ve kurumsal tema özelleştirmeleri.",
    targetSelector: "#admin-nav-homepage",
    iconName: "Scan",
  },
  {
    id: "marketing",
    titleAr: "التسويق والأتمتة والعمولة",
    titleEn: "Marketing & Growth Engine",
    titleTr: "Pazarlama ve Otomasyon",
    descriptionAr:
      "أطلق حملات البريد الإلكتروني، اربط بكسلات إعلانات Google و Meta و TikTok، وفعّل نظام التسويق بالعمولة وقسائم التخفيض.",
    descriptionEn:
      "Automated email marketing, ad pixels (Google, Meta, TikTok), affiliate referral commission, and coupon engine.",
    descriptionTr:
      "E-posta pazarlaması, Google/Meta/TikTok reklam pikselleri ve satış ortaklığı sistemi.",
    targetSelector: "#admin-nav-automation-studio",
    iconName: "Megaphone",
  },
  {
    id: "system",
    titleAr: "جناح الذكاء الاصطناعي وقاعدة البيانات",
    titleEn: "AI Suite & PocketBase Database",
    titleTr: "Yapay Zeka ve Veritabanı",
    descriptionAr:
      "توليد برامج سياحية ذكية بالذكاء الاصطناعي مع تصدير PDF فاخر، والتحكم في قاعدة بيانات PocketBase السحابية.",
    descriptionEn:
      "Generate personalized travel itineraries with Gemini AI, export luxury PDFs, and manage PocketBase database.",
    descriptionTr:
      "Yapay zeka ile kişiselleştirilmiş seyahat programları oluşturun ve lüks PDF broşürleri dışa aktarın.",
    targetSelector: "#admin-nav-ai-settings",
    iconName: "Sparkles",
  },
  {
    id: "settings",
    titleAr: "الترجمة الفورية وبوابات الدفع",
    titleEn: "Instant Translations & Payments",
    titleTr: "Anında Çeviri ve Ödemeler",
    descriptionAr:
      "ترجمة فورية لأي لغة بالذكاء الاصطناعي، بوابات دفع iyzico وتحويل بنكي، وتفعيل ترخيص النطاق الرسمي.",
    descriptionEn:
      "Instant AI batch translation into any language, iyzico payment gateway, and domain license activation.",
    descriptionTr:
      "Yapay zeka ile anında dil çevirisi, iyzico ödeme ağ geçidi ve alan adı lisans yönetimi.",
    targetSelector: "#admin-nav-settings-all",
    iconName: "Settings",
  },
];
