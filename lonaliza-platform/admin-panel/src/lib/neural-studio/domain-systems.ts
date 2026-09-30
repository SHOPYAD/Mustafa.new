/**
 * سجل أنظمة المنصة الحقيقية لواجهات الاستوديو 04..16.
 * كل محور = قسم فعلي في لوحة الإدارة (admin-nav) وكل بند = مجموعة PocketBase أو مسار API موجود.
 * لا أسماء توضيحية: أي بند بلا مصدر حقيقي لا يُضاف هنا.
 */

export type DomainTone = "gold" | "cyan" | "magenta" | "green";

export type DomainIcon =
  | "plane" | "hotel" | "building" | "car" | "map" | "package" | "file" | "star" | "users" | "message"
  | "shield" | "trash" | "share" | "calendar" | "pen" | "image" | "chart" | "rss" | "sparkles" | "settings"
  | "megaphone" | "mail" | "ticket" | "percent" | "gift" | "brain" | "orbit" | "timer" | "plug" | "link"
  | "database" | "languages" | "credit" | "coins" | "receipt" | "wallet" | "store" | "globe" | "key"
  | "refresh" | "truck" | "scale" | "lock" | "smartphone" | "layout" | "search" | "bell" | "workflow";

export interface DomainItem {
  label: string;
  collection?: string;
  route?: string;
  href?: string;
}

export interface DomainHub {
  id: string;
  label: string;
  icon: DomainIcon;
  tone: DomainTone;
  href: string;
  agentId?: string;
  keywords: string[];
  items: DomainItem[];
}

export interface DomainScreen {
  screenId: string;
  title: string;
  subtitle: string;
  crumbs: string[];
  core: { label: string; icon: DomainIcon; href: string };
  hubs: DomainHub[];
}

/** مجموعات PocketBase الموجودة فعلًا (جرد 2026-09-29). الخادم يتحقق منها حيًا أيضًا. */
export const KNOWN_COLLECTIONS = new Set([
  "admin_notifications", "affiliate_conversions", "affiliate_profiles", "affiliate_settings", "affiliate_visits",
  "affiliate_withdrawals", "ai_conversations", "ai_programs", "articles", "crm_leads", "customer_reviews", "customers",
  "email_campaigns", "email_recipients", "email_templates", "enquiry_bookings", "financial_transactions", "geo_places",
  "hotel_bookings", "hotel_content_jobs", "hotel_destinations", "hotel_facilities", "hotel_guest_reviews",
  "hotel_identity_reviews", "hotel_images", "hotel_masters", "hotel_pois", "hotel_quotes", "hotel_review_scores",
  "hotel_rooms_content", "hotel_supplier_refs", "loyalty_wallets", "owned_hotels", "owned_rate_snapshots",
  "publish_channel_groups", "publish_channels", "publish_errors", "publish_media", "publish_mentions",
  "publish_notifications", "publish_plugs", "publish_post_comments", "publish_posts", "publish_rss_feeds", "publish_sets",
  "publish_signatures", "publish_tags", "publish_webhooks", "reseller_companies", "reseller_domain_events",
  "reseller_heartbeats", "reseller_licenses", "reseller_orders", "reseller_progress", "reseller_servers",
  "reseller_settings", "reseller_stage_templates", "reseller_subscriptions", "reseller_whitelabel_settings",
  "site_settings", "site_traffic_logs", "users",
]);

const api = (path: string) => `/api/admin/${path}`;

export const DOMAIN_SCREENS: DomainScreen[] = [
  {
    screenId: "03",
    title: "الحجوزات والإلغاء والتقييمات",
    subtitle: "الحجوزات والعمليات",
    crumbs: ["الحجوزات", "الحجوزات"],
    core: { label: "الحجوزات", icon: "calendar", href: "/admin/bookings" },
    hubs: [
      { id: "bookings.hotel", label: "حجوزات الفنادق", icon: "hotel", tone: "gold", href: "/admin/bookings", agentId: "sales", keywords: ["حجوزات الفنادق", "حجز فندقي"], items: [
        { label: "الحجوزات", collection: "hotel_bookings" },
        { label: "عروض الأسعار", collection: "hotel_quotes" },
      ] },
      { id: "bookings.enquiries", label: "طلبات الحجز", icon: "ticket", tone: "cyan", href: "/admin/bookings", agentId: "sales", keywords: ["طلبات الحجز", "طلب حجز", "الحجوزات الجديده"], items: [
        { label: "طلبات الاستفسار", collection: "enquiry_bookings" },
        { label: "عدّاد الجديدة", route: api("new-bookings-count") },
      ] },
      { id: "bookings.cancellations", label: "طلبات الإلغاء", icon: "trash", tone: "magenta", href: "/admin/cancellations", keywords: ["الغاء", "طلبات الالغاء", "استرداد"], items: [
        { label: "الطلبات المعلقة", route: api("cancellations") },
        { label: "الحجوزات", collection: "hotel_bookings" },
      ] },
      { id: "bookings.reviews", label: "التقييمات الموثقة", icon: "star", tone: "gold", href: "/admin/reviews", keywords: ["تقييمات موثقه", "تقييم العميل"], items: [
        { label: "تقييمات العملاء", collection: "customer_reviews" },
        { label: "تقييمات النزلاء", collection: "hotel_guest_reviews" },
        { label: "درجات التقييم", collection: "hotel_review_scores" },
      ] },
      { id: "bookings.payments", label: "مدفوعات الحجوزات", icon: "credit", tone: "green", href: "/admin/payments", keywords: ["مدفوعات الحجوزات"], items: [
        { label: "المعاملات", collection: "financial_transactions" },
        { label: "حجوزات iyzico", route: api("iyzico-bookings") },
      ] },
      { id: "bookings.b2b", label: "حجوزات B2B", icon: "store", tone: "cyan", href: "/admin/resale/bookings", agentId: "reseller_network_director", keywords: ["حجوزات b2b"], items: [
        { label: "طلبات الموزعين", collection: "reseller_orders" },
        { label: "واجهة B2B", route: api("resale/b2b-bookings") },
      ] },
    ],
  },
  {
    screenId: "04",
    title: "الرحلات وموزعو GDS",
    subtitle: "تذاكر الطيران وموزعو GDS",
    crumbs: ["الخدمات", "الرحلات"],
    core: { label: "تذاكر الطيران", icon: "plane", href: "/admin/flights" },
    hubs: [
      { id: "flights.settings", label: "إعدادات موزعي GDS", icon: "settings", tone: "cyan", href: "/admin/flights", keywords: ["gds", "موزع", "اعدادات الطيران"], items: [
        { label: "إعدادات الطيران", route: api("flights-settings") },
        { label: "اختبار اتصال الموزع", route: api("flights-connect-test") },
        { label: "مزودو البحث", route: api("providers"), href: "/admin/providers" },
      ] },
      { id: "flights.airlines", label: "شركات الطيران", icon: "plane", tone: "gold", href: "/admin/flights", keywords: ["شركات الطيران", "ناقل"], items: [
        { label: "سجل الناقلين", route: api("airlines") },
      ] },
      { id: "flights.airports", label: "المطارات والوجهات", icon: "map", tone: "cyan", href: "/admin/flights", keywords: ["مطار", "مطارات"], items: [
        { label: "المطارات", route: api("airports") },
        { label: "الأماكن الجغرافية", collection: "geo_places" },
      ] },
      { id: "flights.extras", label: "الخدمات الإضافية", icon: "package", tone: "gold", href: "/admin/flights", keywords: ["حقائب", "خدمات اضافيه", "مقاعد"], items: [
        { label: "إضافات الرحلة", route: api("flight-extras") },
      ] },
      { id: "flights.postops", label: "عمليات ما بعد الحجز", icon: "workflow", tone: "magenta", href: "/admin/flights", agentId: "sales", keywords: ["ما بعد الحجز", "تعديل تذكره", "اصدار"], items: [
        { label: "عمليات ما بعد الإصدار", route: api("flights/post-ops") },
        { label: "طلبات الإلغاء", route: api("cancellations"), href: "/admin/cancellations" },
      ] },
      { id: "flights.requests", label: "طلبات الحجز الواردة", icon: "ticket", tone: "green", href: "/admin/bookings", agentId: "sales", keywords: ["طلبات الحجز", "استفسار"], items: [
        { label: "طلبات الاستفسار", collection: "enquiry_bookings" },
        { label: "عدّاد الحجوزات الجديدة", route: api("new-bookings-count") },
      ] },
    ],
  },
  {
    screenId: "05",
    title: "الفنادق وبنوك الأسرّة",
    subtitle: "منصة عمليات المعرفة المؤسسية",
    crumbs: ["الخدمات", "الفنادق وبنوك الأسرّة"],
    core: { label: "الفنادق", icon: "hotel", href: "/admin/hotels" },
    hubs: [
      { id: "hotels.suppliers", label: "مزودو ومارك أب الفنادق", icon: "plug", tone: "gold", href: "/admin/hotels", keywords: ["مزود", "مارك اب", "بنك اسره", "bedbank"], items: [
        { label: "مراجع الموردين", collection: "hotel_supplier_refs" },
        { label: "إعدادات الفنادق", route: api("hotels-settings") },
        { label: "توريد الفنادق", route: api("hotel-supply"), href: "/admin/hotels/supply" },
      ] },
      { id: "hotels.catalog", label: "الكتالوج الداخلي", icon: "building", tone: "cyan", href: "/admin/hotels/catalog", keywords: ["كتالوج", "غرف", "مرافق"], items: [
        { label: "الفنادق الرئيسية", collection: "hotel_masters" },
        { label: "محتوى الغرف", collection: "hotel_rooms_content" },
        { label: "المرافق", collection: "hotel_facilities" },
        { label: "الصور", collection: "hotel_images" },
      ] },
      { id: "hotels.destinations", label: "الوجهات والمعالم", icon: "map", tone: "cyan", href: "/admin/hotels/catalog", keywords: ["وجهه", "وجهات", "معالم"], items: [
        { label: "الوجهات", collection: "hotel_destinations" },
        { label: "نقاط الاهتمام", collection: "hotel_pois" },
      ] },
      { id: "hotels.bookings", label: "حجوزات الفنادق", icon: "calendar", tone: "gold", href: "/admin/bookings", agentId: "sales", keywords: ["حجز فندق", "حجوزات الفنادق", "عرض سعر"], items: [
        { label: "الحجوزات", collection: "hotel_bookings" },
        { label: "عروض الأسعار", collection: "hotel_quotes" },
      ] },
      { id: "hotels.reviews", label: "تقييمات الفنادق", icon: "star", tone: "magenta", href: "/admin/reviews", keywords: ["تقييمات الفنادق", "تريب ادفايزر", "tripadvisor"], items: [
        { label: "تقييمات النزلاء", collection: "hotel_guest_reviews" },
        { label: "درجات التقييم", collection: "hotel_review_scores" },
        { label: "تقييمات الهوية", collection: "hotel_identity_reviews" },
        { label: "وكيل التقييمات", route: api("reviews/agent") },
      ] },
      { id: "hotels.owned", label: "الفنادق المملوكة", icon: "key", tone: "green", href: "/admin/hotels", keywords: ["فنادق مملوكه", "owned"], items: [
        { label: "الفنادق المملوكة", collection: "owned_hotels" },
        { label: "لقطات الأسعار", collection: "owned_rate_snapshots" },
        { label: "اختبار الربط", route: api("owned-hotels-test") },
      ] },
      { id: "hotels.content", label: "المميزة ومهام المحتوى", icon: "sparkles", tone: "gold", href: "/admin/hotels/featured", keywords: ["فنادق مميزه", "مهام المحتوى"], items: [
        { label: "مهام محتوى الفنادق", collection: "hotel_content_jobs" },
        { label: "مزامنة المميزة", route: api("hotels/featured-sync") },
      ] },
    ],
  },
  {
    screenId: "06",
    title: "النقل والجولات والباقات والتأشيرات",
    subtitle: "التنقل والجولات والفيزا",
    crumbs: ["الخدمات", "التنقل والجولات"],
    core: { label: "الخدمات الأرضية", icon: "package", href: "/admin/packages" },
    hubs: [
      { id: "mobility.packages", label: "الباقات والعروض", icon: "package", tone: "gold", href: "/admin/packages", keywords: ["باقه", "باقات", "عروض سياحيه"], items: [
        { label: "إدارة الباقات", route: api("packages") },
      ] },
      { id: "mobility.transfers", label: "المواصلات والاستقبال", icon: "car", tone: "cyan", href: "/admin/transfers", keywords: ["ترانسفير", "استقبال", "مواصلات"], items: [
        { label: "إعدادات الترانسفير", route: api("transfers-settings") },
      ] },
      { id: "mobility.cars", label: "تأجير السيارات", icon: "car", tone: "cyan", href: "/admin/cars", keywords: ["سياره", "سيارات", "تاجير"], items: [
        { label: "السيارات", route: api("cars") },
        { label: "إعدادات السيارات", route: api("cars-settings") },
      ] },
      { id: "mobility.tours", label: "الجولات اليومية", icon: "map", tone: "gold", href: "/admin/tours", keywords: ["جوله", "جولات"], items: [
        { label: "الجولات", route: api("tours") },
      ] },
      { id: "mobility.visa", label: "خدمات التأشيرات", icon: "file", tone: "magenta", href: "/admin/visa", keywords: ["تاشيره", "فيزا"], items: [
        { label: "صفحة التأشيرات", href: "/admin/visa" },
      ] },
      { id: "mobility.enquiries", label: "طلبات الخدمات", icon: "ticket", tone: "green", href: "/admin/bookings", agentId: "sales", keywords: ["طلبات الخدمات"], items: [
        { label: "طلبات الاستفسار", collection: "enquiry_bookings" },
      ] },
    ],
  },
  {
    screenId: "07",
    title: "محتوى الموقع والتطبيقات",
    subtitle: "المحتوى وواجهة المنصة",
    crumbs: ["المنصة الرقمية", "محتوى الموقع"],
    core: { label: "محتوى الموقع", icon: "file", href: "/admin/pages" },
    hubs: [
      { id: "cms.editor", label: "المحرر المرئي", icon: "pen", tone: "cyan", href: "/admin/homepage-editor", agentId: "ui_ux_architect", keywords: ["المحرر المرئي", "الصفحه الرئيسيه"], items: [
        { label: "قالب الرئيسية", route: api("homepage-template") },
        { label: "السمة", route: api("theme") },
        { label: "الهوية البصرية", route: api("branding"), href: "/admin/branding" },
      ] },
      { id: "cms.pages", label: "الصفحات", icon: "layout", tone: "gold", href: "/admin/pages", keywords: ["صفحات", "صفحه"], items: [
        { label: "الصفحات الثابتة", route: api("pages") },
        { label: "صفحات البنّاء", route: api("builder-pages") },
      ] },
      { id: "cms.blog", label: "المدونة والمقالات", icon: "file", tone: "gold", href: "/admin/blog", agentId: "social", keywords: ["مدونه", "مقال", "مقالات"], items: [
        { label: "المقالات", collection: "articles" },
        { label: "واجهة المدونة", route: api("blog") },
      ] },
      { id: "cms.visibility", label: "ظهور الأقسام", icon: "layout", tone: "cyan", href: "/admin/content", keywords: ["ظهور الاقسام", "اعدادات الموقع"], items: [
        { label: "إعدادات الموقع", collection: "site_settings" },
        { label: "سجل الزيارات", collection: "site_traffic_logs" },
      ] },
      { id: "cms.search", label: "تبويبات البحث", icon: "search", tone: "cyan", href: "/admin/search-tabs", keywords: ["تبويبات البحث", "محرك البحث"], items: [
        { label: "تبويبات البحث", route: api("search-tabs") },
      ] },
      { id: "cms.pwa", label: "تطبيق الويب PWA", icon: "smartphone", tone: "magenta", href: "/admin/pwa", keywords: ["pwa", "تطبيق الويب"], items: [
        { label: "إعدادات PWA", route: api("pwa") },
        { label: "أيقونة التطبيق", route: api("pwa/icon") },
        { label: "اشتراكات الإشعارات", route: api("push/subscribe") },
      ] },
      { id: "cms.mobile", label: "تطبيق الجوال", icon: "smartphone", tone: "green", href: "/admin/mobile-app", agentId: "app_concierge", keywords: ["تطبيق الجوال", "الموبايل"], items: [
        { label: "بناء التطبيق", route: api("mobile-app/build") },
        { label: "إشعارات التطبيق", route: api("mobile-app/notifications") },
        { label: "وكلاء التطبيق", route: api("mobile-app/agents") },
      ] },
      { id: "cms.translations", label: "الترجمات واللغات", icon: "languages", tone: "gold", href: "/admin/translations", keywords: ["ترجمه", "لغات"], items: [
        { label: "الترجمات", route: api("translations") },
        { label: "اللغات", route: api("translations/languages") },
      ] },
    ],
  },
  {
    screenId: "08",
    title: "العملاء وخدمة العملاء",
    subtitle: "العملاء وحماية البيانات",
    crumbs: ["العملاء", "سجل العملاء"],
    core: { label: "سجل العملاء", icon: "users", href: "/admin/customers" },
    hubs: [
      { id: "crm.customers", label: "العملاء والمسافرون", icon: "users", tone: "cyan", href: "/admin/customers", keywords: ["عميل", "عملاء", "مسافر"], items: [
        { label: "العملاء", collection: "customers" },
        { label: "حسابات المستخدمين", collection: "users" },
      ] },
      { id: "crm.leads", label: "العملاء المحتملون", icon: "chart", tone: "gold", href: "/admin/customers", agentId: "sales", keywords: ["عملاء محتملين", "leads"], items: [
        { label: "العملاء المحتملون", collection: "crm_leads" },
        { label: "واجهة CRM", route: api("crm/leads") },
      ] },
      { id: "crm.conversations", label: "المحادثات الذكية", icon: "message", tone: "magenta", href: "/admin/customers", agentId: "site_advisor", keywords: ["محادثات", "محادثه", "شات"], items: [
        { label: "محادثات الذكاء الاصطناعي", collection: "ai_conversations" },
        { label: "رسائل الأتمتة", route: api("automation/messages") },
      ] },
      { id: "crm.reviews", label: "التقييمات الموثقة", icon: "star", tone: "gold", href: "/admin/reviews", keywords: ["تقييمات العملاء", "تقييم موثق"], items: [
        { label: "تقييمات العملاء", collection: "customer_reviews" },
        { label: "تقييمات النزلاء", collection: "hotel_guest_reviews" },
      ] },
      { id: "crm.channels", label: "قنوات التواصل", icon: "share", tone: "cyan", href: "/admin/contact-settings", keywords: ["قنوات التواصل", "واتساب", "دعم"], items: [
        { label: "بيانات التواصل", route: api("site-contact") },
        { label: "قنوات المراسلة", route: api("automation/comms") },
        { label: "ربط واتساب", route: api("automation/whatsapp-qr") },
      ] },
      { id: "crm.notifications", label: "الإشعارات", icon: "bell", tone: "green", href: "/admin", keywords: ["اشعارات", "تنبيهات"], items: [
        { label: "إشعارات الإدارة", collection: "admin_notifications" },
        { label: "واجهة الإشعارات", route: api("notifications") },
      ] },
      { id: "crm.deletions", label: "طلبات حذف الحساب", icon: "trash", tone: "magenta", href: "/admin/legal?tab=deletions", agentId: "chief_security_auditor", keywords: ["حذف الحساب", "gdpr", "محو البيانات"], items: [
        { label: "طلبات الحذف", route: api("legal/deletions") },
      ] },
    ],
  },
  {
    screenId: "09",
    title: "النشر متعدد القنوات والمحتوى",
    subtitle: "منظومة النشر والتواصل الخارجي",
    crumbs: ["التسويق والمحتوى", "النشر"],
    core: { label: "عملية النشر", icon: "share", href: "/admin/publish" },
    hubs: [
      { id: "publish.accounts", label: "الحسابات المرتبطة", icon: "users", tone: "cyan", href: "/admin/social-accounts", keywords: ["حسابات الربط", "oauth", "الحسابات المرتبطه"], items: [
        { label: "القنوات", collection: "publish_channels" },
        { label: "مجموعات القنوات", collection: "publish_channel_groups" },
        { label: "واجهة القنوات", route: api("publish/channels") },
      ] },
      { id: "publish.calendar", label: "التقويم والجدولة", icon: "calendar", tone: "gold", href: "/admin/publish", agentId: "social", keywords: ["جدوله", "تقويم النشر", "منشور"], items: [
        { label: "المنشورات", collection: "publish_posts" },
        { label: "واجهة المنشورات", route: api("publish/posts") },
        { label: "دورة الجدولة", route: api("publish/tick") },
      ] },
      { id: "publish.compose", label: "صانع المحتوى", icon: "pen", tone: "gold", href: "/admin/publish/compose", agentId: "social", keywords: ["صانع المحتوى", "ملحن"], items: [
        { label: "مجموعات النشر", collection: "publish_sets" },
        { label: "التواقيع", collection: "publish_signatures" },
        { label: "الوسوم", collection: "publish_tags" },
      ] },
      { id: "publish.media", label: "مكتبة الوسائط", icon: "image", tone: "magenta", href: "/admin/publish/media", keywords: ["مكتبه الوسائط", "فيديو"], items: [
        { label: "وسائط النشر", collection: "publish_media" },
        { label: "واجهة الوسائط", route: api("publish/media") },
        { label: "توليد الفيديو", route: api("publish/video") },
      ] },
      { id: "publish.analytics", label: "التحليلات والأداء", icon: "chart", tone: "green", href: "/admin/publish/analytics", keywords: ["تحليلات النشر", "تفاعل"], items: [
        { label: "تحليلات القنوات", route: api("publish/analytics") },
        { label: "التعليقات", collection: "publish_post_comments" },
        { label: "الإشارات", collection: "publish_mentions" },
      ] },
      { id: "publish.rss", label: "الأتمتة وRSS", icon: "rss", tone: "magenta", href: "/admin/publish/automations", keywords: ["rss", "خلاصات"], items: [
        { label: "خلاصات RSS", collection: "publish_rss_feeds" },
        { label: "الإضافات", collection: "publish_plugs" },
        { label: "واجهة RSS", route: api("publish/rss") },
      ] },
      { id: "publish.agent", label: "وكيل النشر", icon: "sparkles", tone: "cyan", href: "/admin/publish/agent", agentId: "social", keywords: ["وكيل النشر"], items: [
        { label: "واجهة الوكيل", route: api("publish/agent") },
        { label: "طلب الاعتماد", route: api("publish/request-approval") },
      ] },
      { id: "publish.settings", label: "إعدادات القنوات", icon: "settings", tone: "cyan", href: "/admin/publish/settings", keywords: ["اعدادات النشر", "webhook"], items: [
        { label: "خطافات الويب", collection: "publish_webhooks" },
        { label: "أخطاء النشر", collection: "publish_errors" },
        { label: "إشعارات النشر", collection: "publish_notifications" },
      ] },
    ],
  },
  {
    screenId: "10",
    title: "الحملات والتسويق والعمولات",
    subtitle: "الحملات والإعلانات والنمو",
    crumbs: ["التسويق", "الحملات"],
    core: { label: "النمو والحملات", icon: "megaphone", href: "/admin/ads" },
    hubs: [
      { id: "growth.ads", label: "الإعلانات الممولة", icon: "megaphone", tone: "gold", href: "/admin/ads", agentId: "ads", keywords: ["اعلان", "اعلانات", "ميتا", "جوجل ادز"], items: [
        { label: "الحملات", route: api("ads/campaigns") },
        { label: "التقارير", route: api("ads/report") },
        { label: "إطلاق حملة", route: api("ads/launch") },
      ] },
      { id: "growth.email", label: "التسويق بالبريد", icon: "mail", tone: "cyan", href: "/admin/email-marketing", agentId: "email", keywords: ["بريد", "نشره بريديه", "ايميل"], items: [
        { label: "الحملات البريدية", collection: "email_campaigns" },
        { label: "المستلمون", collection: "email_recipients" },
        { label: "القوالب", collection: "email_templates" },
      ] },
      { id: "growth.affiliate", label: "التسويق بالعمولة", icon: "percent", tone: "magenta", href: "/admin/affiliate", keywords: ["عموله", "افلييت", "مسوق"], items: [
        { label: "المسوقون", collection: "affiliate_profiles" },
        { label: "الزيارات", collection: "affiliate_visits" },
        { label: "التحويلات", collection: "affiliate_conversions" },
        { label: "السحوبات", collection: "affiliate_withdrawals" },
      ] },
      { id: "growth.coupons", label: "الكوبونات والولاء", icon: "ticket", tone: "gold", href: "/admin/marketing/coupons", keywords: ["كوبون", "خصم", "قسيمه"], items: [
        { label: "محافظ الولاء", collection: "loyalty_wallets" },
        { label: "واجهة الولاء", route: api("loyalty") },
      ] },
      { id: "growth.gifts", label: "بطاقات الهدايا", icon: "gift", tone: "green", href: "/admin/gift-cards", keywords: ["بطاقه هديه", "هدايا"], items: [
        { label: "بطاقات الهدايا", route: api("gift-cards") },
      ] },
      { id: "growth.recovery", label: "استرجاع السلات", icon: "refresh", tone: "cyan", href: "/admin/email-marketing", agentId: "sales", keywords: ["سلات متروكه", "استرجاع"], items: [
        { label: "الاسترجاع الآلي", route: api("automation/abandoned-recovery") },
        { label: "المستثنون", route: api("automation/excluded-contacts") },
      ] },
    ],
  },
  {
    screenId: "11",
    title: "غرفة الوكلاء والمعرفة",
    subtitle: "الذكاء الاصطناعي والوكلاء",
    crumbs: ["الذكاء الاصطناعي", "الوكلاء"],
    core: { label: "خلية الوكلاء", icon: "brain", href: "/admin/agent-war-room" },
    hubs: [
      { id: "agents.warroom", label: "غرفة العمليات", icon: "orbit", tone: "cyan", href: "/admin/agent-war-room", keywords: ["غرفه العمليات", "war room", "خليه الوكلاء"], items: [
        { label: "غرفة العمليات", route: api("automation/agent-war-room") },
        { label: "التداول الجماعي", route: api("automation/swarm-deliberate") },
        { label: "بث الوكلاء", route: api("automation/agent-stream") },
      ] },
      { id: "agents.memory", label: "الدماغ الثاني", icon: "brain", tone: "magenta", href: "/admin/agent-studio", keywords: ["الدماغ الثاني", "ذاكره", "معرفه"], items: [
        { label: "بيانات المعرفة", route: api("automation/second-brain-data") },
        { label: "توجيهات المعرفة", route: api("automation/second-brain-directive") },
        { label: "تدريب الوكلاء", route: api("automation/agent-training") },
      ] },
      { id: "agents.programs", label: "برامج الذكاء", icon: "sparkles", tone: "gold", href: "/admin/ai-programs", keywords: ["برامج الذكاء", "مهارات"], items: [
        { label: "البرامج", collection: "ai_programs" },
        { label: "المحادثات", collection: "ai_conversations" },
      ] },
      { id: "agents.models", label: "نماذج الذكاء", icon: "settings", tone: "cyan", href: "/admin/ai-settings", keywords: ["نماذج", "openrouter", "موديل"], items: [
        { label: "إعداد OpenRouter", route: api("openrouter/config") },
        { label: "مزامنة النماذج", route: api("openrouter/sync") },
      ] },
      { id: "agents.builder", label: "وكيل البناء", icon: "workflow", tone: "green", href: "/admin/builder-agent", keywords: ["وكيل البناء", "المطور الذكي"], items: [
        { label: "وكيل البناء", route: api("builder-agent") },
      ] },
      { id: "agents.b2b", label: "وكيل B2B", icon: "building", tone: "gold", href: "/admin/b2b-landing-agent", agentId: "b2b_landing", keywords: ["وكيل b2b", "صفحه الهبوط"], items: [
        { label: "وكيل صفحة الهبوط", route: api("b2b-landing-agent") },
      ] },
      { id: "agents.reviews", label: "وكيل التقييمات", icon: "star", tone: "magenta", href: "/admin/reviews", keywords: ["وكيل التقييمات"], items: [
        { label: "وكيل التقييمات", route: api("reviews/agent") },
      ] },
    ],
  },
  {
    screenId: "12",
    title: "استوديو الأتمتة والتنفيذ",
    subtitle: "الأتمتة والنماذج",
    crumbs: ["الذكاء الاصطناعي", "الأتمتة"],
    core: { label: "محرك الأتمتة", icon: "workflow", href: "/admin/automation-studio" },
    hubs: [
      { id: "auto.jobs", label: "المهام المجدولة", icon: "timer", tone: "gold", href: "/admin/automation", agentId: "sales", keywords: ["مهام مجدوله", "cron"], items: [
        { label: "المهام", route: api("automation/jobs") },
        { label: "تشغيل مهمة", route: api("automation/jobs/[id]/run") },
      ] },
      { id: "auto.logs", label: "سجل التنفيذ", icon: "file", tone: "cyan", href: "/admin/automation", keywords: ["سجل التنفيذ", "سجلات"], items: [
        { label: "سجلات الأتمتة", route: api("automation/logs") },
        { label: "الخط الزمني", route: api("automation/timeline-fallback") },
      ] },
      { id: "auto.mcp", label: "خوادم MCP", icon: "plug", tone: "magenta", href: "/admin/automation-studio", keywords: ["mcp", "ادوات"], items: [
        { label: "الخوادم", route: api("mcp") },
        { label: "استدعاء أداة", route: api("mcp/call") },
        { label: "ربط خادم", route: api("mcp/connect") },
      ] },
      { id: "auto.tools", label: "أدوات لوحة التحكم", icon: "settings", tone: "cyan", href: "/admin/automation-studio", keywords: ["ادوات لوحه التحكم"], items: [
        { label: "أدوات التحكم", route: api("automation/control-panel-tools") },
        { label: "إعدادات الأتمتة", route: api("automation/settings") },
      ] },
      { id: "auto.connections", label: "الاتصالات", icon: "link", tone: "green", href: "/admin/integrations", keywords: ["اتصالات الاتمته"], items: [
        { label: "الاتصالات", route: api("automation/connections") },
        { label: "اختبار القنوات", route: api("automation/comms/test") },
      ] },
      { id: "auto.voice", label: "الصوت والإملاء", icon: "message", tone: "gold", href: "/admin/neural-studio", keywords: ["صوت", "نطق"], items: [
        { label: "توليد الصوت", route: api("automation/voice-tts") },
      ] },
    ],
  },
  {
    screenId: "13",
    title: "المالية والفوترة والولاء",
    subtitle: "المالية والفوترة والتجارة",
    crumbs: ["المالية", "المعاملات"],
    core: { label: "المعاملات المالية", icon: "coins", href: "/admin/payments" },
    hubs: [
      { id: "fin.payments", label: "بوابات الدفع", icon: "credit", tone: "cyan", href: "/admin/payments", keywords: ["بوابات الدفع", "بوابه الدفع", "iyzico"], items: [
        { label: "إعدادات البوابات", route: api("payments/configs") },
        { label: "كتالوج البوابات", route: api("payments/catalog") },
        { label: "حجوزات iyzico", route: api("iyzico-bookings") },
      ] },
      { id: "fin.transactions", label: "المعاملات", icon: "receipt", tone: "gold", href: "/admin/payments", keywords: ["معاملات", "مالي"], items: [
        { label: "المعاملات المالية", collection: "financial_transactions" },
        { label: "النظرة المالية", route: api("finance/overview") },
      ] },
      { id: "fin.invoices", label: "الفواتير", icon: "file", tone: "gold", href: "/admin/invoices", keywords: ["فاتوره", "فواتير", "parasut"], items: [
        { label: "قوالب الفواتير", route: api("invoice-templates") },
        { label: "فواتير Paraşüt", route: api("parasut/invoices") },
        { label: "إصدار فاتورة", route: api("parasut/issue") },
      ] },
      { id: "fin.currencies", label: "العملات والصرف", icon: "coins", tone: "cyan", href: "/admin/currencies", keywords: ["عمله", "عملات", "صرف"], items: [
        { label: "العملات", route: api("currencies") },
      ] },
      { id: "fin.wallet", label: "محفظة التوريد B2B", icon: "wallet", tone: "green", href: "/admin/b2b-wallet", keywords: ["محفظه", "ديبوزيت"], items: [
        { label: "المحفظة", route: api("b2b-wallet") },
      ] },
      { id: "fin.loyalty", label: "نقاط الولاء", icon: "star", tone: "magenta", href: "/admin/marketing/coupons", keywords: ["نقاط الولاء", "مكافات"], items: [
        { label: "محافظ الولاء", collection: "loyalty_wallets" },
        { label: "واجهة الولاء", route: api("loyalty") },
      ] },
      { id: "fin.gifts", label: "بطاقات الهدايا", icon: "gift", tone: "gold", href: "/admin/gift-cards", keywords: ["بطاقات الهدايا"], items: [
        { label: "بطاقات الهدايا", route: api("gift-cards") },
      ] },
    ],
  },
  {
    screenId: "14",
    title: "إعادة البيع وشبكة B2B",
    subtitle: "منصة التوزيع والشركات التابعة",
    crumbs: ["التوزيع", "الشركاء"],
    core: { label: "شبكة الموزعين", icon: "store", href: "/admin/resale" },
    hubs: [
      { id: "b2b.companies", label: "الشركات الشريكة", icon: "building", tone: "cyan", href: "/admin/resale/companies", agentId: "reseller_network_director", keywords: ["شركات", "شريك", "موزع"], items: [
        { label: "الشركات", collection: "reseller_companies" },
        { label: "الطلبات", collection: "reseller_orders" },
        { label: "مراحل التسليم", collection: "reseller_progress" },
      ] },
      { id: "b2b.scraper", label: "رادار الشركات", icon: "map", tone: "gold", href: "/admin/resale/scraper", agentId: "lead_scout", keywords: ["رادار", "خرائط", "استخبارات"], items: [
        { label: "العملاء المحتملون", route: api("resale/scraper/leads") },
        { label: "حملات الرادار", route: api("resale/scraper/campaigns") },
        { label: "مهام الزحف", route: api("resale/scraper/jobs") },
      ] },
      { id: "b2b.whitelabel", label: "الوايت ليبل", icon: "sparkles", tone: "magenta", href: "/admin/resale/whitelabel", keywords: ["وايت ليبل", "white label"], items: [
        { label: "إعدادات الوايت ليبل", collection: "reseller_whitelabel_settings" },
        { label: "واجهة الوايت ليبل", route: api("resale/whitelabel") },
      ] },
      { id: "b2b.subscriptions", label: "الاشتراكات والمحافظ", icon: "wallet", tone: "gold", href: "/admin/resale/subscriptions", keywords: ["اشتراك", "محافظ الشركاء"], items: [
        { label: "الاشتراكات", collection: "reseller_subscriptions" },
        { label: "المحافظ", route: api("resale/wallets") },
        { label: "حجوزات B2B", route: api("resale/b2b-bookings") },
      ] },
      { id: "b2b.domains", label: "النطاقات والخوادم", icon: "globe", tone: "cyan", href: "/admin/resale/domains", keywords: ["نطاق", "دومين", "خادم"], items: [
        { label: "أحداث النطاقات", collection: "reseller_domain_events" },
        { label: "الخوادم", collection: "reseller_servers" },
        { label: "نبض الخوادم", collection: "reseller_heartbeats" },
      ] },
      { id: "b2b.licenses", label: "التراخيص والتحديثات", icon: "key", tone: "green", href: "/admin/resale/licenses", keywords: ["ترخيص", "تراخيص", "تحديثات"], items: [
        { label: "التراخيص", collection: "reseller_licenses" },
        { label: "قوالب المراحل", collection: "reseller_stage_templates" },
        { label: "الإعدادات", collection: "reseller_settings" },
      ] },
    ],
  },
  {
    screenId: "15",
    title: "الامتثال والخصوصية والصلاحيات",
    subtitle: "الامتثال القانوني والـ GDPR",
    crumbs: ["الامتثال", "المركز القانوني"],
    core: { label: "المركز القانوني", icon: "shield", href: "/admin/legal" },
    hubs: [
      { id: "legal.clauses", label: "الشروط والبنود", icon: "scale", tone: "gold", href: "/admin/legal?tab=terms", keywords: ["شروط", "بنود"], items: [
        { label: "البنود القانونية", route: api("legal/clauses") },
        { label: "المستندات", route: api("legal") },
      ] },
      { id: "legal.privacy", label: "الخصوصية وGDPR", icon: "lock", tone: "cyan", href: "/admin/legal?tab=gdpr", agentId: "chief_security_auditor", keywords: ["خصوصيه", "gdpr"], items: [
        { label: "طلبات الحذف", route: api("legal/deletions") },
        { label: "المستشار القانوني", route: api("legal/ai-advisor") },
      ] },
      { id: "legal.identity", label: "هوية المنصة", icon: "building", tone: "cyan", href: "/admin/legal?tab=identity", keywords: ["هويه المنصه", "الاسم القانوني"], items: [
        { label: "الهوية البصرية", route: api("branding") },
        { label: "بيانات التواصل", route: api("site-contact") },
      ] },
      { id: "legal.license", label: "الترخيص والخطة", icon: "key", tone: "gold", href: "/admin/license", keywords: ["ترخيص المنصه", "الخطه"], items: [
        { label: "حالة الترخيص", route: api("license/status") },
        { label: "خطة المستأجر", route: api("tenant-plan") },
      ] },
      { id: "legal.access", label: "الجلسات والصلاحيات", icon: "shield", tone: "magenta", href: "/admin/pocketbase", agentId: "chief_security_auditor", keywords: ["صلاحيات", "جلسه", "امان"], items: [
        { label: "جلسة المشرف", route: api("session") },
        { label: "المستخدمون", collection: "users" },
        { label: "جاهزية المنصة", route: api("platform-readiness") },
      ] },
    ],
  },
  {
    screenId: "16",
    title: "الإعدادات والتكاملات",
    subtitle: "إعدادات النظام والربط التقني",
    crumbs: ["الإعدادات", "التكاملات"],
    core: { label: "إعدادات النظام", icon: "settings", href: "/admin/settings" },
    hubs: [
      { id: "sys.smtp", label: "خادم البريد SMTP", icon: "mail", tone: "cyan", href: "/admin/email", keywords: ["smtp", "خادم البريد"], items: [
        { label: "إعدادات البريد", route: api("email-settings") },
        { label: "سجلات DNS", route: api("email-settings/dns") },
        { label: "اختبار الإرسال", route: api("email-settings/test") },
      ] },
      { id: "sys.providers", label: "مزودو البحث", icon: "plug", tone: "gold", href: "/admin/providers", keywords: ["مزودو البحث"], items: [
        { label: "المزودون", route: api("providers") },
        { label: "اختبار المزود", route: api("providers/test") },
      ] },
      { id: "sys.integrations", label: "الربط وWebhooks", icon: "link", tone: "magenta", href: "/admin/integrations", keywords: ["تكامل", "webhooks", "ربط برمجي"], items: [
        { label: "التكاملات", route: api("integrations") },
        { label: "متغيرات البيئة", route: api("env") },
      ] },
      { id: "sys.database", label: "قاعدة PocketBase", icon: "database", tone: "cyan", href: "/admin/pocketbase", keywords: ["pocketbase", "قاعده البيانات"], items: [
        { label: "حالة القاعدة", route: api("pocketbase") },
        { label: "المشرف الأعلى", route: api("pocketbase/superuser") },
      ] },
      { id: "sys.translations", label: "الترجمات", icon: "languages", tone: "gold", href: "/admin/translations", keywords: ["ترجمات المنصه"], items: [
        { label: "الترجمات", route: api("translations") },
        { label: "ترجمة دفعة", route: api("translations/translate-batch") },
      ] },
      { id: "sys.media", label: "مفاتيح الوسائط", icon: "image", tone: "green", href: "/admin/media", keywords: ["مفاتيح الوسائط", "pexels", "unsplash"], items: [
        { label: "المفاتيح", route: api("media/keys") },
        { label: "Pexels", route: api("media/pexels") },
        { label: "Unsplash", route: api("media/unsplash") },
      ] },
      { id: "sys.icons", label: "الأيقونات والهوية", icon: "layout", tone: "cyan", href: "/admin/icons", keywords: ["ايقونات"], items: [
        { label: "أيقونات الواجهة", route: api("ui-icons") },
        { label: "الهوية البصرية", route: api("branding") },
      ] },
    ],
  },
];

export function domainScreen(screenId: string): DomainScreen | null {
  return DOMAIN_SCREENS.find((s) => s.screenId === screenId) ?? null;
}

export function screenCollections(screen: DomainScreen): string[] {
  const out = new Set<string>();
  for (const hub of screen.hubs) for (const item of hub.items) if (item.collection) out.add(item.collection);
  return [...out];
}

export function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** يطابق نص المهمة مع محور حقيقي ليعرض الوكيل الشبكة التي يعمل عليها. */
export function resolveDomainFocus(text: string): { screenId: string; hubId: string; label: string } | null {
  const t = normalizeArabic(text);
  if (!t) return null;
  let best: { screenId: string; hubId: string; label: string; score: number } | null = null;
  for (const screen of DOMAIN_SCREENS) {
    for (const hub of screen.hubs) {
      const terms = [hub.label, ...hub.keywords].map(normalizeArabic);
      for (const term of terms) {
        if (term.length >= 3 && t.includes(term) && (!best || term.length > best.score)) {
          best = { screenId: screen.screenId, hubId: hub.id, label: hub.label, score: term.length };
        }
      }
    }
  }
  return best ? { screenId: best.screenId, hubId: best.hubId, label: best.label } : null;
}
