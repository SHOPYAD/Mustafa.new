/**
 * Central Platform Feature Matrix (+50 Features)
 * Governs capability availability across Free White Label, Paid Pro White Label, and Lifetime Ownership.
 */

export type PlanType = "whitelabel_free" | "whitelabel_paid" | "ownership";

export type FeatureCategory = {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  nameTr: string;
  iconName: string;
};

export type PlatformFeature = {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  nameFr?: string;
  nameTr?: string;
  descAr: string;
  descEn: string;
  defaultEnabled: Record<PlanType, boolean>;
};

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: "core_engines",
    nameAr: "1. محركات الحجز والتوريد السياحي الحي",
    nameEn: "1. Live Sourcing & Travel Booking Engines",
    nameFr: "1. Moteurs de Réservation et Fourniture Voyage",
    nameTr: "1. Canlı Tedarik ve Seyahat Rezervasyon Motorları",
    iconName: "Plane",
  },
  {
    id: "manual_inventory",
    nameAr: "2. المخزون الداخلي والبرامج والجولات الخاصة",
    nameEn: "2. Custom Manual Inventory & Guided Tours",
    nameFr: "2. Inventaire Manuel, Circuits & Forfaits",
    nameTr: "2. Manuel Envanter, Turlar ve Özel Paketler",
    iconName: "Package",
  },
  {
    id: "ai_swarm",
    nameAr: "3. سرب الذكاء الاصطناعي والتسويق الآلي",
    nameEn: "3. AI Swarm & Autonomous Marketing",
    nameFr: "3. Essaim d'IA et Marketing Autonome",
    nameTr: "3. Yapay Zeka Sürüsü ve Otonom Pazarlama",
    iconName: "Sparkles",
  },
  {
    id: "crm_omnichannel",
    nameAr: "4. أتمتة خدمة العملاء وقنوات التواصل CRM",
    nameEn: "4. Omnichannel CRM & WhatsApp Gateway",
    nameFr: "4. CRM Omnicanal & Passerelle WhatsApp",
    nameTr: "4. Çok Kanallı Müşteri İlişkileri (CRM) ve WhatsApp",
    iconName: "MessageCircle",
  },
  {
    id: "social_community",
    nameAr: "5. المجتمع السياحي التفاعلي وشبكة Nostr",
    nameEn: "5. Traveler Portal & Nostr Social Feed",
    nameFr: "5. Portail Voyageur & Flux Social Nostr",
    nameTr: "5. Gezgin Portalı ve İnteraktif Nostr Topluluğu",
    iconName: "Radio",
  },
  {
    id: "financial_vault",
    nameAr: "6. منظومة الأمان المالي ومكافحة الخسائر",
    nameEn: "6. Financial Safeguards & Anti-Loss Vault",
    nameFr: "6. Sécurité Financière & Coffre Anti-Pertes",
    nameTr: "6. Finansal Güvenlik ve Zarar Önleme Sistemi",
    iconName: "ShieldCheck",
  },
  {
    id: "infrastructure_cms",
    nameAr: "7. البنية التحتية والترخيص والتحكم الكامل",
    nameEn: "7. Infrastructure, License & CMS Control",
    nameFr: "7. Infrastructure, Licence & Contrôle Total",
    nameTr: "7. Altyapı, Lisans ve Tam Kontrol",
    iconName: "Server",
  },
];

export const ALL_PLATFORM_FEATURES: PlatformFeature[] = [
  // 1. Core Engines
  {
    id: "core_flights_feed",
    categoryId: "core_engines",
    nameAr: "محرك رحلات الطيران المجمع عبر كبرى شبكات GDS العالمية",
    nameEn: "Global Aggregated GDS Flights Engine",
    descAr: "ربط فوري بأكثر من 500 شركة طيران عالمية مع إصدار إلكتروني مباشر وتحديد هوامش ربحك بحرية.",
    descEn: "Live connectivity to +500 global GDS airlines with instant ticketing and flexible markups.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "core_hotels_feed",
    categoryId: "core_engines",
    nameAr: "كتالوج الفنادق والمنتجعات العالمية (+3,000,000 فندق)",
    nameEn: "Global Hotels & Resorts Inventory (+3M Properties)",
    descAr: "أكبر تغذية فندقية مركزية تضم بنوك الأسرة الكبرى مع صور عالية الجودة وتأكيد حجز فوري.",
    descEn: "Extensive bedbank feeds covering over 3 million properties worldwide with instant vouchers.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "core_transfers_feed",
    categoryId: "core_engines",
    nameAr: "محرك التوصيل والمشاوير وخدمات الاستقبال في المطارات",
    nameEn: "Airport Transfers & VIP Chauffeur Dispatch Engine",
    descAr: "تغطية عالمية لتنقلات المطارات والمشاوير الخاصة مع خرائط حية وأسعار موحدة مضمونة.",
    descEn: "Global airport transfer coverage with live tracking, vehicle classes, and fixed pricing.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "core_wallet_deduct",
    categoryId: "core_engines",
    nameAr: "المحفظة الرقمية B2B والخصم التلقائي اللحظي عند الحجز",
    nameEn: "B2B Digital Wallet with Instant Auto-Deduction",
    descAr: "إصدار التذاكر وقسائم الإقامة مباشرة من رصيد المحفظة دون انتظار تحويلات بنكية معطلة.",
    descEn: "Frictionless issuance directly charged against partner wallet balance with zero downtime.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "core_rate_sync_daemon",
    categoryId: "core_engines",
    nameAr: "دايمون المزامنة الدورية للأسعار والتوافر كل 15 دقيقة",
    nameEn: "Autonomous 15-Minute Rate & Availability Sync Daemon",
    descAr: "تحديث لحظي لأسعار المقاعد والغرف الفندقية لمنع فروقات الأسعار أو الحجوزات الملغاة.",
    descEn: "Continuous background sync ensuring published rates match live supplier inventory perfectly.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "core_flight_filters",
    categoryId: "core_engines",
    nameAr: "فلترة متقدمة للرحلات (الوزن والأمتعة، درجات السفر، التوقفات)",
    nameEn: "Advanced Flight Search Filters (Baggage, Cabins, Stops)",
    descAr: "خيارات تصفية احترافية تمنح عميلك تجربة استكشاف تضاهي كبرى منصات الحجز العالمية.",
    descEn: "Rich multi-criteria search filtering for baggage allowance, airlines, and cabin classes.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },

  // 2. Manual Inventory
  {
    id: "manual_packages_builder",
    categoryId: "manual_inventory",
    nameAr: "منشئ الباقات والبرامج السياحية الشاملة (Holiday Packages)",
    nameEn: "Comprehensive Holiday Packages Builder",
    descAr: "إدخال وتخصيص برامجك وعروضك السياحية الخاصة بأسعارك وهوامش ربحك دون أي قيود.",
    descEn: "Build tailor-made multi-day tour packages with custom itineraries and pricing tiers.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "manual_guided_tours",
    categoryId: "manual_inventory",
    nameAr: "إدارة الجولات والرحلات اليومية المخصصة (Custom Day Tours)",
    nameEn: "Custom Guided Day Tours & Excursions Engine",
    descAr: "إضافة الجولات الإرشادية المحلية والأنشطة الترفيهية وحجز المواعيد الصباحية والمسائية.",
    descEn: "Manage local sightseeing excursions, timing schedules, and tour guide assignments.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "manual_private_fleet",
    categoryId: "manual_inventory",
    nameAr: "إدارة أسطول السيارات الخاص وتأجير الليموزين الداخلي",
    nameEn: "Private Vehicle Fleet & Limousine Dispatch Management",
    descAr: "تسجيل سياراتك وسائقي شركتك الخاصة وجدولة رحلاتهم واستقبالاتهم للعملاء.",
    descEn: "Manage your agency-owned vehicle fleet, drivers, fuel tariffs, and private reservations.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "manual_visa_services",
    categoryId: "manual_inventory",
    nameAr: "محرك التأشيرات السياحية وإدارة متطلبات السفر والفيزا",
    nameEn: "Tourist Visa Processing & Consular Documentation Engine",
    descAr: "استقبال طلبات التأشيرات الدولية ورفع الجوازات ومتابعة إجراءات السفارات.",
    descEn: "Intake customer visa applications, upload passport docs, and track consular approvals.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "manual_custom_pricing",
    categoryId: "manual_inventory",
    nameAr: "محرك التسعير والهوامش اليدوية للمخزون الداخلي الخاص",
    nameEn: "Independent Markup & Currency Engine for Private Inventory",
    descAr: "تحكم كامل في تسعير خدماتك الداخلية بعملات متعددة وهوامش ربح مباشرة 100%.",
    descEn: "Set custom profit margins and multi-currency exchange rates on all agency services.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },

  // 3. AI Swarm & Marketing
  {
    id: "ai_swarm_agents",
    categoryId: "ai_swarm",
    nameAr: "سرب متكامل من 6 وكلاء ذكاء اصطناعي متخصصين (AI Swarm)",
    nameEn: "Autonomous 6-Agent AI Swarm Ecosystem",
    descAr: "فريق ذكي متناغم لتحليل الطلبات، صياغة العروض، استيراد الخدمات، ومتابعة التحويلات.",
    descEn: "Specialized multi-agent AI swarm collaborating on sales, customer service, and analytics.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "ai_video_reels_studio",
    categoryId: "ai_swarm",
    nameAr: "استوديو ريلز 4K الترويجي عبر Google Flow MCP",
    nameEn: "Google Flow MCP 4K Travel Video Reels Studio",
    descAr: "توليد مقاطع فيديو ترويجية ساحرة للوجهات بدقة 4K ونشرها تلقائياً لجلب آلاف العملاء.",
    descEn: "Automated cinematic travel reels generator producing high-conversion social videos.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "ai_telegram_autopilot",
    categoryId: "ai_swarm",
    nameAr: "بوت تيليجرام تفاعلي 24/7 لاعتماد نشر الفيديوهات بضغطة زر",
    nameEn: "24/7 Telegram Bot for 1-Click Publishing Approval",
    descAr: "إشعارك فور إنتاج الذكاء الاصطناعي لفيديو جديد مع زر موافقة فوري لنشره في كافة المنصات.",
    descEn: "Interactive Telegram management interface for review, editing, and single-click broadcast.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "ai_social_omnichannel_pub",
    categoryId: "ai_swarm",
    nameAr: "أتمتة النشر الموحد على تيك توك، إنستغرام، فيسبوك، وإكس",
    nameEn: "Multi-Network Social Publisher (TikTok, IG, FB, X)",
    descAr: "نشر محتواك وعروضك السياحية بجدولة ذكية عبر كافة قنوات التواصل الاجتماعي تلقائياً.",
    descEn: "Synchronized auto-posting to all major social channels with trending travel hashtags.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "ai_ads_autopilot",
    categoryId: "ai_swarm",
    nameAr: "طيار آلي لإعلانات Google Ads و Meta Ads لتحقيق أعلى ROAS",
    nameEn: "Google & Meta Ads Budget & ROAS Optimizer Autopilot",
    descAr: "تحسين ميزانيات الإعلانات واستهداف المسافرين ذوي النية العالية للحجز بأقل تكلفة نقرة.",
    descEn: "Automated ad creative generation and bidding optimization maximizing return on ad spend.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "ai_hotel_importer",
    categoryId: "ai_swarm",
    nameAr: "استيراد الفنادق الجماعي بالذكاء الاصطناعي من الروابط مباشرة",
    nameEn: "Bulk AI Hotel Importer Extracting from Live URLs",
    descAr: "إدخال رابط أي فندق ليقوم الذكاء الاصطناعي بسحب الغرف والصور والمرافق وتنسيقها.",
    descEn: "Scrapes and formats hotel data, room tiers, and amenities from any source link instantly.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "ai_luxury_itinerary_builder",
    categoryId: "ai_swarm",
    nameAr: "مولد البرامج السياحية الفاخرة المخصص مع تصدير PDF أنيق",
    nameEn: "AI Luxury Itinerary Creator with Custom PDF Export",
    descAr: "توليد جداول سياحية يومية متقنة ومبهرة للعملاء بضغطة زر وطباعتها بشعار وكالتك.",
    descEn: "Creates polished day-by-day itineraries tailored to traveler tastes with branded PDFs.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "ai_cart_recovery_bot",
    categoryId: "ai_swarm",
    nameAr: "استعادة السلات والحجوزات المتروكة تلقائياً عبر واتساب",
    nameEn: "Automated WhatsApp Abandoned Booking Recovery Bot",
    descAr: "متابعة وتذكير العملاء الذين توقفوا قبل الدفع وإرسال روابط إتمام الحجز لاستعادة 30% من المبيعات.",
    descEn: "Autonomous WhatsApp re-engagement pinging travelers who paused checkout with direct links.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },

  // 4. CRM & WhatsApp
  {
    id: "crm_whatsapp_gateway",
    categoryId: "crm_omnichannel",
    nameAr: "بوابة WhatsApp Baileys مدمجة مجاناً بدون رسوم اشتراك لميتا",
    nameEn: "Built-in WhatsApp Baileys Gateway ($0 Meta Fees)",
    descAr: "ربط رقم واتساب وكالتك عبر كود QR مباشر بدون اشتراكات شهرية أو فواتير ميتا الباهظة.",
    descEn: "Native QR-scanned WhatsApp session eliminating recurring third-party API costs.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "crm_multi_agent_chat",
    categoryId: "crm_omnichannel",
    nameAr: "محادثات فورية حية متعددة الوكلاء (Live Multi-Agent Chat)",
    nameEn: "Live Multi-Agent Customer Support Dashboard",
    descAr: "تمكين فريق خدمة العملاء من الرد على استفسارات المسافرين وتوزيع التذاكر من شاشة موحدة.",
    descEn: "Unified agent inbox routing incoming traveler chats with department tagging.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "crm_instant_voucher_dispatch",
    categoryId: "crm_omnichannel",
    nameAr: "إرسال التذاكر وقسائم الفنادق Vouchers فورياً عبر واتساب",
    nameEn: "Instant E-Ticket & Hotel Voucher Dispatch via WhatsApp",
    descAr: "إرسال ملف الـ PDF ورابط تأكيد الحجز إلى هاتف المسافر فور إتمام عملية الدفع.",
    descEn: "Automated dispatch of boarding passes, vouchers, and directions directly to client phones.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "crm_telegram_admin_alerts",
    categoryId: "crm_omnichannel",
    nameAr: "إشعارات تيليجرام فورية للإدارة عند أي حجز أو استفسار جديد",
    nameEn: "Instant Telegram Admin Alerts for Bookings & Leads",
    descAr: "تنبيه هاتفي فوري للمدير على تطبيق تيليجرام بكل عملية بيع أو استفسار عميل جديد.",
    descEn: "Real-time mobile push notifications sent to management Telegram channels on every conversion.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "crm_phone_otp_login",
    categoryId: "crm_omnichannel",
    nameAr: "رموز التحقق لمرة واحدة (OTP) لتسجيل الدخول السريع بالهاتف",
    nameEn: "Frictionless Phone OTP Login & Verification",
    descAr: "تسجيل دخول آمن وسريع للمسافرين برقم الجوال دون الحاجة لكلمات مرور معقدة.",
    descEn: "Fast passwordless authentication via SMS or WhatsApp OTP tokens for clients.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "crm_custom_inquiries",
    categoryId: "crm_omnichannel",
    nameAr: "نظام إدارة طلبات مخصص للرحلات المخصصة ومجموعات الشركات",
    nameEn: "Custom Group Booking & Corporate RFQ Management",
    descAr: "استقبال طلبات الشركات والمجموعات الكبيرة وإعداد عروض أسعار تفاوضية خاصة.",
    descEn: "Structured pipeline managing bespoke group travel requests and corporate quotes.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "crm_unified_history",
    categoryId: "crm_omnichannel",
    nameAr: "سجل محادثات موحد وتاريخ تواصل كامل لكل عميل ومسافر",
    nameEn: "Unified Customer Communication History & Audit Logs",
    descAr: "أرشيف كامل لكافة مراسلات العميل وحجوزاته السابقة وتفضيلات مقاعده وغرفه.",
    descEn: "Centralized client profile storing historical itineraries, chat logs, and preferences.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "crm_canned_responses",
    categoryId: "crm_omnichannel",
    nameAr: "ردود ذكية جاهزة ومؤتمتة للأسئلة الشائعة وسياسات الإلغاء",
    nameEn: "Smart Canned Responses for FAQs & Cancellation Policies",
    descAr: "إجابات نموذجية فورية للرد على استفسارات الأمتعة وتعديل المواعيد والإلغاء.",
    descEn: "Pre-configured rapid responses streamlining support turnaround for common traveler questions.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },

  // 5. Social Community
  {
    id: "social_traveler_portal",
    categoryId: "social_community",
    nameAr: "لوحة تحكم كاملة للمسافر لإدارة حجوزاته وتحميل تذاكره",
    nameEn: "Customer Self-Service Dashboard with 1-Click Downloads",
    descAr: "بوابة خاصة لكل مسافر لاستعراض تفاصيل رحلته وطباعة تذاكره وإلغاء حجوزاته ذاتياً.",
    descEn: "Client self-service portal for reviewing active vouchers, flight status, and invoices.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "social_traveler_wallet",
    categoryId: "social_community",
    nameAr: "محفظة نقدية رقمية للمسافر مع شحن الرصيد والخصم التلقائي",
    nameEn: "Customer Digital Store Wallet Supporting Cash Top-ups",
    descAr: "توفير رصيد مالي خاص بالعميل في المتجر لشراء خدمات السفر المستقبلية بسرعة.",
    descEn: "End-user digital wallet allowing cash deposits and fast checkout for recurring travelers.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "social_loyalty_points",
    categoryId: "social_community",
    nameAr: "نظام نقاط ولاء ذكي (Loyalty Points) يستبدل بخصومات حية",
    nameEn: "Loyalty Points Engine Redeemable for Checkout Discounts",
    descAr: "مكافأة المسافرين بنقاط عند كل حجز يمكنهم استبدالها برصيد مالي حقيقي أو ترقيات.",
    descEn: "Gamified reward points earned on reservations that turn into instant cash deductions.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "social_nostr_community",
    categoryId: "social_community",
    nameAr: "شبكة تواصل سياحية لا مركزية (Nostr) لنشر تجارب المسافرين",
    nameEn: "Decentralized Nostr Travel Community Feed & Video Reels",
    descAr: "تغذية اجتماعية نابضة تمكّن المسافرين من نشر فيديوهاتهم وتقييماتهم للوجهات وتفاعل الزوار.",
    descEn: "Decentralized social networking feed for traveler video reels, photos, and reviews.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "social_affiliate_program",
    categoryId: "social_community",
    nameAr: "برنامج تسويق بالعمولة (Affiliate) بروابط إحالة فريدة للمسافرين",
    nameEn: "Traveler Referral & Affiliate Network with Custom Links",
    descAr: "تحويل عملائك إلى مسوقين لرحلاتك بروابط إحالة خاصة ونسب عمولات تلقائية.",
    descEn: "Turn regular customers into brand ambassadors with tracked referral links and payouts.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: true, ownership: true },
  },
  {
    id: "social_verified_admin_badge",
    categoryId: "social_community",
    nameAr: "حساب إدارة موثق بتاج رسمي لنشر العروض الحصرية والإعلانات",
    nameEn: "Verified Crown Admin Badge for Official Deal Broadcasts",
    descAr: "علامة توثيق رسمية للمنصة تمنح منشوراتك وعروضك الترويجية ثقة ومصداقية كبرى.",
    descEn: "Official agency badge pinned on feed deals and announcements boosting user trust.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "social_smart_checkout_funnel",
    categoryId: "social_community",
    nameAr: "قمع حجز ذكي من 3 خطوات سلسة وسريعة مع ترقيات إضافية",
    nameEn: "Streamlined 3-Step Booking Funnel with Ancillary Upsells",
    descAr: "مسار حجز متطور وسلس يرفع معدل إتمام الدفع ويقترح خدمات إضافية (أمتعة، مقاعد، تأمين).",
    descEn: "High-conversion checkout experience prompting travelers for ancillaries and insurance.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "social_passport_vault",
    categoryId: "social_community",
    nameAr: "حفظ آمن ومشفّر لبيانات الجوازات لتسريع الحجوزات المستقبلية",
    nameEn: "Encrypted Traveler Passport Vault for 1-Click Rebooking",
    descAr: "حفظ مشفر لبيانات أفراد العائلة والمسافرين لاسترجاعها آلياً عند أي حجز جديد بضغطة واحدة.",
    descEn: "Zero-knowledge passport encryption vault auto-filling traveler details on repeat orders.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },

  // 6. Financial Safeguards
  {
    id: "finance_discount_cap_15",
    categoryId: "financial_vault",
    nameAr: "سقف خصم صارم وإجباري 15% يمنع الخسائر وتراكم الكوبونات",
    nameEn: "Strict 15% Maximum Discount Cap Safeguarding Profits",
    descAr: "خوارزمية أمان تمنع أي كود ترويجي من التسبب في بيع أي خدمة بأقل من تكلفة المورد الحقيقية.",
    descEn: "Hard safety barrier preventing promotional coupons from causing below-cost bookings.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "finance_points_approval_queue",
    categoryId: "financial_vault",
    nameAr: "طابور اعتماد المشرف الإداري لعمليات استبدال النقاط المرتفعة",
    nameEn: "Admin Approval Queue for High-Value Points Redemptions",
    descAr: "مراجعة إدارية تلقائية للعمليات غير الاعتيادية لمنع التلاعب وحماية أرباح الوكالة.",
    descEn: "Fraud-prevention queue holding abnormal reward conversions until manager verification.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "finance_credit_card_gateways",
    categoryId: "financial_vault",
    nameAr: "دعم بوابات الدفع الإلكتروني (مدى، فيزا، ماستركارد، Apple Pay)",
    nameEn: "Multi-Gateway Credit Card Checkout (Visa, MC, Mada, Apple Pay)",
    descAr: "تحصيل مستحقات الحجوزات من عملائك مباشرة بأعلى معايير الأمان 3D Secure.",
    descEn: "Global online payment collection with 3D Secure fraud checks and zero friction.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "finance_bank_transfer_whatsapp",
    categoryId: "financial_vault",
    nameAr: "دعم التحويل البنكي الفوري مع رابط الدفع السريع عبر واتساب",
    nameEn: "Instant Bank Transfer with 1-Click WhatsApp Payment Link",
    descAr: "توفير خيار الحوالة البنكية وتوليد رابط واتساب معتمد لإرسال الإشعار والتأكيد فوراً.",
    descEn: "Bank wire payment instructions bundled with automatic WhatsApp confirmation link.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "finance_qr_tax_invoices",
    categoryId: "financial_vault",
    nameAr: "توليد فواتير ضريبية وقسائم رسمية مزودة برمز QR Code مشفر",
    nameEn: "Official Tax Invoices & Vouchers with Cryptographic QR Code",
    descAr: "فواتير نظامية معتمدة محاسبياً مزودة برقم ضريبي وكود تحقق مشفر لمكافحة التزوير.",
    descEn: "Tax-compliant official invoice generation featuring cryptographically signed QR stamps.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "finance_dynamic_markups",
    categoryId: "financial_vault",
    nameAr: "تحديد هوامش الأرباح الديناميكية (Markups) لكل خدمة ومسار",
    nameEn: "Dynamic Partner Markup Control Engine per Route & Service",
    descAr: "إضافة نسبة أو مبلغ ربحك الخاص على رحلات الطيران أو فنادق معينة لتعظيم المكاسب.",
    descEn: "Granular markup rules configuring profit margins per airline, destination, or supplier.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "finance_cash_guarantee_85",
    categoryId: "financial_vault",
    nameAr: "ضمان تدفق نقدي حقيقي بنسبة 85%+ في كل معاملة حجز",
    nameEn: "Guaranteed 85%+ Cash Collection Ratio on Every Booking",
    descAr: "معمارية مالية مصممة لضمان تحصيل القيمة الفعلية وتجنب تجميد السيولة التشغيلية.",
    descEn: "Optimized working capital flow preventing liquidity dry-up during peak booking seasons.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "finance_detailed_accounting_logs",
    categoryId: "financial_vault",
    nameAr: "تقارير مالية تفصيلية وسجلات تدقيق محاسبية للحجوزات والأرباح",
    nameEn: "Detailed Financial Ledger & Real-Time Net Profit Reports",
    descAr: "كشوفات دورية توضح صافي الإيرادات والأرباح المحققة مع تصدير Excel و PDF.",
    descEn: "Comprehensive financial bookkeeping reporting exact gross profit and margins.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },

  // 7. Infrastructure & CMS
  {
    id: "infra_permanent_license",
    categoryId: "infrastructure_cms",
    nameAr: "ترخيص دومين دائم مشفر ومحمي مدى الحياة دون أي عمولات 0%",
    nameEn: "Single-Domain Permanent Encrypted License (0% Commission)",
    descAr: "امتلاك برمجيات المنصة وترخيص رسمي على نطاقك دون اقتطاع نسب مبيعات أبداً.",
    descEn: "Permanent lifetime software license bound to domain with 0% platform take-rate.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: false, ownership: true },
  },
  {
    id: "infra_dedicated_contabo_vps",
    categoryId: "infrastructure_cms",
    nameAr: "سيرفر Contabo Cloud VPS مخصص عالي الأداء مجاناً لسنة كاملة",
    nameEn: "1-Year Free Dedicated High-Performance Contabo Cloud VPS",
    descAr: "سيرفر خاص ومستقل مع لوحة تحكم aaPanel وصلاحيات Root كاملة لضمان أقصى سرعة واستقلالية.",
    descEn: "Fully independent cloud virtual private server with dedicated resources and root control.",
    defaultEnabled: { whitelabel_free: false, whitelabel_paid: false, ownership: true },
  },
  {
    id: "infra_cloud_free_hosting",
    categoryId: "infrastructure_cms",
    nameAr: "استضافة سحابية مدارة بالكامل على سحابة لوناليزا فائقة السرعة",
    nameEn: "Fully Managed High-Speed Lonaliza Cloud Hosting ($0 Cost)",
    descAr: "تشغيل منصتك فوراً على بنية تحتية سحابية متطورة دون تحمل أي تكاليف سيرفرات أو صيانة.",
    descEn: "Instant launch hosted on enterprise cluster infrastructure with zero server upkeep fees.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: false },
  },
  {
    id: "infra_custom_domain_ai_dns",
    categoryId: "infrastructure_cms",
    nameAr: "ربط دومينك الخاص (Custom Domain) مع مساعد الذكاء الاصطناعي للـ DNS",
    nameEn: "Custom Domain Connection with AI DNS Assistant & Auto SSL",
    descAr: "إطلاق موقعك على نطاقك التجاري (your-agency.com) مع توجيه ذكي وشهادة أمان مجانية.",
    descEn: "Connect your branded domain with automated DNS checking and free Let's Encrypt SSL.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "infra_visual_builder",
    categoryId: "infrastructure_cms",
    nameAr: "محرر بصري متطور بالسحب والإفلات (Visual Page Builder)",
    nameEn: "Visual Drag-and-Drop Page Builder for Dynamic Pages",
    descAr: "تعديل بنرات وعروض ونصوص الصفحة الرئيسية بسهولة تامة دون الحاجة لأي كود برمجي.",
    descEn: "Customize homepage banners, showcases, and sections with intuitive live editing.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "infra_multi_language_20",
    categoryId: "infrastructure_cms",
    nameAr: "دعم متعدد اللغات لأكثر من 20 لغة عالمية مع ترجمة جماعية AI",
    nameEn: "Multi-Language Support for 20+ Languages with AI Translation",
    descAr: "منصة عالمية تتحدث لغة عملائك (عربي، إنجليزي، فرنسي، تركي، ألماني، روسي، إسباني وغيرها).",
    descEn: "Full multilingual localization across 20+ languages powered by automated AI translations.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "infra_full_branding_customization",
    categoryId: "infrastructure_cms",
    nameAr: "تخصيص كامل للهوية البصرية، الألوان، الخطوط، واللوجو بضغطة زر",
    nameEn: "Full Theme Customization: Brand Colors, Typography & Logo",
    descAr: "تطبيق ألوان وكالتك وشعارك ونصوصك لتبدو المنصة كأنها مصممة خصيصاً من الصفر لشركتك.",
    descEn: "Upload your corporate logo and define brand palette tokens applied platform-wide.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
  {
    id: "infra_nightly_cloud_updates",
    categoryId: "infrastructure_cms",
    nameAr: "نسخ احتياطي دوري وتحديثات سحابية ليلية لضمان استمرارية العمل",
    nameEn: "Automated Daily Backups & Nightly Cloud System Updates",
    descAr: "حماية بياناتك وحجوزاتك ووصول أحدث الميزات والتحسينات الأمنية تلقائياً دون أي توقف.",
    descEn: "Continuous security patches, automated snapshots, and uninterrupted uptime guarantees.",
    defaultEnabled: { whitelabel_free: true, whitelabel_paid: true, ownership: true },
  },
];

/**
 * Returns whether a feature is enabled for a specific plan, applying any Super Admin overrides.
 */
export function isFeatureActiveForPlan(
  featureId: string,
  plan: PlanType,
  overrides?: Record<string, Record<string, boolean>>
): boolean {
  if (overrides && overrides[plan] && typeof overrides[plan][featureId] === "boolean") {
    return overrides[plan][featureId];
  }
  const feat = ALL_PLATFORM_FEATURES.find((f) => f.id === featureId);
  if (!feat) return false;
  return feat.defaultEnabled[plan] ?? false;
}
