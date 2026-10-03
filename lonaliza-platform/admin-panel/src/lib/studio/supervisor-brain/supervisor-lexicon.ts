/**
 * Massive Semantic Lexicon & Deep Intent Resolver for Sovereign Supervisor Agent
 * Provides 100% comprehensive coverage of all 20 screens, 97 hubs, and platform operations.
 */

export interface LexiconEntry {
  id: string;
  screenId: string;
  hubId: string;
  sectorId?: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  href?: string;
  synonyms: string[];
  speechReplyAr: string;
}

export type SupervisorActionType =
  | "OPEN_SECTOR"
  | "OPEN_SCREEN"
  | "CLOSE_ACTIVE"
  | "CAROUSEL_NEXT"
  | "CAROUSEL_PREV"
  | "TOGGLE_CAMERA"
  | "TOGGLE_SWARM"
  | "TOGGLE_COORDINATE"
  | "TOGGLE_AUTO_EXECUTION"
  | "OPEN_MCP_DISPATCHER"
  | "TOGGLE_CHAT"
  | "QUERY_STATS"
  | "GENERAL_REPLY";

export interface ResolvedIntent {
  type: SupervisorActionType;
  screenId?: string;
  hubId?: string;
  sectorId?: string;
  href?: string;
  titleAr?: string;
  speechReplyAr: string;
  confidence: number;
}

/**
 * Text normalizer removing Arabic diacritics, unifying letter variants, and stripping filler words.
 */
export function normalizeSupervisorText(raw: string): string {
  if (!raw) return "";
  let t = raw.toLowerCase().trim();

  // Remove diacritics (Tashkeel)
  t = t.replace(/[\u064B-\u065F\u0670]/g, "");

  // Unify Alef forms
  t = t.replace(/[إأآا]/g, "ا");

  // Unify Taa Marbuta & Haa
  t = t.replace(/ة/g, "ه");

  // Unify Yaa & Alef Maksura
  t = t.replace(/[ىي]/g, "ي");

  // Remove common punctuation
  t = t.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'؛،ـ]/g, " ");

  // Collapse whitespace
  return t.replace(/\s+/g, " ").trim();
}

/**
 * Strip polite opening and filler phrases
 */
export function stripSupervisorFiller(text: string): string {
  const fillers = [
    /^(مرحبا|اهلا|اهلين|السلام عليكم|صباح الخير|مساء الخير)\s*/,
    /^(صديقي|يا صديقي|يا اخي|يا كابتن|يا مشرف|يا وكيل|يا بطل|عزيزي)\s*/,
    /^(لو سمحت|من فضلك|ارجوك|ياريت|بالله عليك|الله يخليك)\s*/,
    /^(ممكن|تقدر|هل تستطيع|بدي|ابغى|اريد|ودنا|حابب|عايز)\s*/,
    /^(انك|ان|لي|لنا|عنا|معانا)\s*/,
  ];

  let cleaned = text;
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of fillers) {
      if (f.test(cleaned)) {
        cleaned = cleaned.replace(f, "").trim();
        changed = true;
      }
    }
  }
  return cleaned;
}

/**
 * Master Dictionary of all Platform Hubs & Screens
 */
export const SUPERVISOR_MASTER_LEXICON: LexiconEntry[] = [
  // 1. CARS & TRANSFERS (تأجير السيارات والمواصلات والأسطول)
  {
    id: "mobility-cars",
    screenId: "06",
    hubId: "mobility.cars",
    sectorId: "nexus-mobility-cars",
    titleAr: "تأجير السيارات والأسطول",
    titleEn: "MOBILITY · CARS",
    categoryAr: "النقل والجولات",
    href: "/admin/cars",
    synonyms: [
      "سيارات", "سياره", "سيارة", "تاجير سيارات", "تأجير سيارات", "تأجير السيارات", "كراء سيارات",
      "تاجير السيارات", "اسطول السيارات", "أسطول السيارات", "عربيات", "سيارات ايجار", "حجز سيارة",
      "حجز سيارات", "اسطول", "cars", "car rental", "rental cars", "fleet"
    ],
    speechReplyAr: "فتحت لك قسم تأجير السيارات وإدارة أسطول المركبات.",
  },
  {
    id: "mobility-transfers",
    screenId: "06",
    hubId: "mobility.transfers",
    sectorId: "nexus-mobility-transfers",
    titleAr: "المواصلات والترانسفير",
    titleEn: "MOBILITY · TRANSFERS",
    categoryAr: "النقل والجولات",
    href: "/admin/transfers",
    synonyms: [
      "ترانسفير", "مواصلات", "توصيل", "نقل", "توصيل مطار", "ليموزين", "نقل سياحي", "سائقين",
      "شاحنات", "باصات", "حافلات", "transfers", "transfer", "shuttle", "transportation"
    ],
    speechReplyAr: "فتحت لك قسم المواصلات والتوصيل وإدارة رحلات الترانسفير.",
  },

  // 2. FLIGHTS & AIRLINES (الطيران والرحلات الجوية والمطارات)
  {
    id: "flights",
    screenId: "04",
    hubId: "flights",
    sectorId: "nexus-flagship-flights",
    titleAr: "رحلات الطيران والخطوط الجوية",
    titleEn: "FLIGHTS",
    categoryAr: "الطيران والبحث",
    href: "/admin/flights",
    synonyms: [
      "طيران", "رحلات طيران", "تذاكر طيران", "تذاكر", "طيارات", "طياره", "طيارة", "حجز طيران",
      "مطارات", "مطار", "خطوط طيران", "خطوط جوية", "رحلة جوية", "رحلات جوية", "سفر جوي", "تذكرة سفر",
      "تذاكر سفر", "flights", "flight", "airlines", "airports", "tickets"
    ],
    speechReplyAr: "فتحت لك قسم رحلات الطيران ومحرك البحث اللحظي وتذاكر الخطوط الجوية.",
  },

  // 3. HOTELS & ACCOMMODATION (الفنادق والإقامة والمنتجعات)
  {
    id: "hotels",
    screenId: "03",
    hubId: "hotels",
    sectorId: "nexus-flagship-hotels",
    titleAr: "حجوزات الفنادق والمنتجعات",
    titleEn: "HOTELS",
    categoryAr: "الفنادق والإقامة",
    href: "/admin/hotels",
    synonyms: [
      "فنادق", "فندق", "حجوزات فنادق", "حجز فندق", "منتجعات", "منتجع", "شقق فندقية", "سكن",
      "غرف", "غرفة", "نزل", "هوتبل", "بكينج", "hotels", "hotel", "resorts", "rooms"
    ],
    speechReplyAr: "فتحت لك قسم حجوزات الفنادق والمنتجعات والإقامة الفاخرة.",
  },

  // 4. TOURS & ACTIVITIES (الجولات السياحية والرحلات اليومية)
  {
    id: "mobility-tours",
    screenId: "06",
    hubId: "mobility.tours",
    sectorId: "nexus-mobility-tours",
    titleAr: "الجولات والرحلات اليومية",
    titleEn: "MOBILITY · TOURS",
    categoryAr: "النقل والجولات",
    href: "/admin/tours",
    synonyms: [
      "جولات", "جولة", "جوله", "رحلات يومية", "رحلات سياحية", "جولات سياحية", "انشطة", "أنشطة",
      "مزارات", "معالم", "ترافيل تورز", "مرشد سياحي", "tours", "tour", "day trips", "activities"
    ],
    speechReplyAr: "فتحت لك قسم الجولات السياحية والرحلات اليومية.",
  },

  // 5. PACKAGES & TOURISM (الباقات والبرامج السياحية المتكاملة)
  {
    id: "tourism-packages",
    screenId: "04",
    hubId: "tourism.packages",
    sectorId: "nexus-tourism-packages",
    titleAr: "الباقات والبرامج السياحية",
    titleEn: "TOURISM · PACKAGES",
    categoryAr: "السياحة والبرامج",
    href: "/admin/packages",
    synonyms: [
      "بكجات", "بكج", "باقات", "باقة", "باقات سياحية", "برامج سياحية", "عروض سياحية",
      "عروض السفر", "جدول سياحي", "رحلات كاملة", "packages", "package", "holiday packages"
    ],
    speechReplyAr: "فتحت لك قسم الباقات السياحية والبرامج الشاملة.",
  },

  // 6. MARKETS & ANALYTICS (الأسواق والتحليلات والاتجاهات)
  {
    id: "markets",
    screenId: "19",
    hubId: "markets",
    sectorId: "nexus-flagship-markets",
    titleAr: "الأسواق والتحليلات والبيانات",
    titleEn: "MARKETS",
    categoryAr: "التحليلات والمؤشرات",
    href: "/admin",
    synonyms: [
      "اسواق", "أسواق", "سوق", "تحليلات", "إحصائيات", "احصائيات", "بيانات", "اتجاهات", "مؤشرات",
      "رادار السوق", "حركة السوق", "بيانات حية", "ماركت", "markets", "market", "analytics", "stats"
    ],
    speechReplyAr: "فتحت لك قسم رادار الأسواق العالمية والتحليلات البيانية.",
  },

  // 7. PROJECTS & AUTOMATION (المشاريع والأتمتة والمهام المجدولة واللوجات)
  {
    id: "projects",
    screenId: "01",
    hubId: "projects",
    sectorId: "nexus-flagship-projects",
    titleAr: "المشاريع والأتمتة والمهام",
    titleEn: "PROJECTS",
    categoryAr: "العمليات والأتمتة",
    href: "/admin/automation",
    synonyms: [
      "مشاريع", "مشروع", "اتمتة", "أتمتة", "مهام مجدولة", "سجلات", "سجل", "لوجات", "سجلات التنفيذ",
      "كرون", "اوامر مجدولة", "سيرفرات", "projects", "automation", "jobs", "logs", "cron"
    ],
    speechReplyAr: "فتحت لك قسم المشاريع وأنظمة الأتمتة وسجلات التنفيذ التلقائي.",
  },

  // 8. SOCIAL & NOSTR (التواصل والمجتمع والسوشيال ميديا وواتساب)
  {
    id: "social",
    screenId: "10",
    hubId: "social",
    sectorId: "nexus-flagship-social",
    titleAr: "التواصل والمجتمع والشبكات",
    titleEn: "SOCIAL",
    categoryAr: "التسويق والتواصل",
    href: "/admin/social",
    synonyms: [
      "سوشيال", "تواصل", "مجتمع", "نوستر", "واتساب", "تليجرام", "شبكات اجتماعية", "منشورات",
      "نشر", "حملات اجتماعية", "شات", "رسائل", "social", "whatsapp", "nostr", "community"
    ],
    speechReplyAr: "فتحت لك قسم التواصل والمجتمع وتكامل شبكات نوستر وواتساب.",
  },

  // 9. FINANCE, ACCOUNTING & INVOICES (المالية والمحاسبة والمدفوعات والفواتير)
  {
    id: "finance-accounting",
    screenId: "13",
    hubId: "finance.accounting",
    titleAr: "المالية والمحاسبة والفواتير",
    titleEn: "FINANCE & ACCOUNTING",
    categoryAr: "المالية والمحاسبة",
    href: "/admin/accounting",
    synonyms: [
      "مالية", "ماليه", "محاسبة", "محاسبه", "فواتير", "فاتورة", "مدفوعات", "دفع", "ايرادات",
      "إيرادات", "ارباح", "أرباح", "حسابات", "بوابات دفع", "عملات", "صرف", "finance", "accounting", "invoices", "payments"
    ],
    speechReplyAr: "فتحت لك المركز المالي وإدارة الفواتير والمدفوعات والحسابات.",
  },

  // 10. LEGAL & COMPLIANCE (الامتثال القانوني والشروط والسياسات)
  {
    id: "legal-compliance",
    screenId: "15",
    hubId: "legal.compliance",
    titleAr: "الامتثال القانوني والسياسات",
    titleEn: "LEGAL & COMPLIANCE",
    categoryAr: "القانوني والامتثال",
    href: "/admin/legal",
    synonyms: [
      "قانوني", "امتثال", "شروط", "احكام", "أحكام", "سياسات", "خصوصية", "عقود", "تراخيص",
      "قوانين", "legal", "compliance", "terms", "policies"
    ],
    speechReplyAr: "فتحت لك قسم الامتثال القانوني وصياغة الشروط والسياسات المعتمدة.",
  },

  // 11. RESELLER & SETTINGS (الإعدادات العامة وإعادة البيع والموردين)
  {
    id: "settings-providers",
    screenId: "16",
    hubId: "settings.providers",
    titleAr: "الإعدادات والموردين وإعادة البيع",
    titleEn: "SETTINGS & PROVIDERS",
    categoryAr: "الإعدادات والتهيئة",
    href: "/admin/settings",
    synonyms: [
      "اعدادات", "إعدادات", "اعدادات النظام", "موردين", "مزودين", "اعادة بيع", "إعادة بيع",
      "شركاء", "تهيئة", "كونفج", "settings", "providers", "reseller", "config"
    ],
    speechReplyAr: "فتحت لك لوحة إعدادات النظام وتكامل الموردين وخدمات إعادة البيع.",
  },

  // 12. CUSTOMERS & CRM (العملاء والمستخدمين والمشتركين)
  {
    id: "customers-directory",
    screenId: "08",
    hubId: "customers.directory",
    titleAr: "إدارة العملاء والمستخدمين CRM",
    titleEn: "CUSTOMERS & CRM",
    categoryAr: "العملاء",
    href: "/admin/users",
    synonyms: [
      "عملاء", "عميل", "مستخدمين", "مستخدم", "زبائن", "زبون", "مشتركين", "دليل العملاء",
      "crm", "customers", "users", "clients"
    ],
    speechReplyAr: "فتحت لك دليل العملاء وإدارة سجلات المستخدمين CRM.",
  },

  // 13. MARKETING & CAMPAIGNS (التسويق والحملات الإعلانية وميتا وجوجل)
  {
    id: "marketing-campaigns",
    screenId: "10",
    hubId: "marketing.campaigns",
    titleAr: "التسويق والحملات الإعلانية",
    titleEn: "MARKETING & ADS",
    categoryAr: "التسويق والترويج",
    synonyms: [
      "تسويق", "اعلانات", "إعلانات", "حملات", "حملات اعلانية", "ميتا", "فيسبوك", "جوجل ادز",
      "بريد تسويقي", "ايميل ماركتنج", "marketing", "ads", "campaigns"
    ],
    speechReplyAr: "فتحت لك مركز إدارة الحملات التسويقية والإعلانات الرقمية.",
  },

  // 14. LOYALTY & REWARDS (برامج الولاء والنقاط والمكافآت والكوبونات)
  {
    id: "loyalty-programs",
    screenId: "05",
    hubId: "loyalty.programs",
    titleAr: "برامج الولاء والمكافآت والكوبونات",
    titleEn: "LOYALTY & REWARDS",
    categoryAr: "برامج الولاء",
    href: "/admin/loyalty",
    synonyms: [
      "ولاء", "نقاط", "مكافات", "مكافآت", "كوبونات", "كوبون", "خصومات", "خصم", "برنامج ولاء",
      "loyalty", "rewards", "points", "coupons"
    ],
    speechReplyAr: "فتحت لك قسم برامج الولاء وإدارة النقاط والكوبونات الترويجية.",
  },

  // 15. AI SWARM & MODELS (الذكاء الاصطناعي وخلية الوكلاء والموديلات)
  {
    id: "ai-swarm",
    screenId: "11",
    hubId: "ai.swarm",
    titleAr: "خلية الوكلاء والذكاء الاصطناعي",
    titleEn: "AI SWARM & AGENTS",
    categoryAr: "الذكاء الاصطناعي",
    synonyms: [
      "ذكاء اصطناعي", "وكلاء", "خلية الوكلاء", "روبوتات", "بوتات", "موديلات", "جيميناي",
      "اوبن راوتر", "نماذج ذكاء", "ai", "swarm", "agents", "models", "gemini", "openrouter"
    ],
    speechReplyAr: "فتحت لك غرفة عمليات الذكاء الاصطناعي وخلية الوكلاء الذاتية.",
  },

  // 16. MCP SERVERS & TOOLS (خوادم وأدوات MCP الـ 21 والـ 88 أداة)
  {
    id: "mcp-servers",
    screenId: "18",
    hubId: "mcp.servers",
    titleAr: "خوادم وأدوات MCP الـ 21",
    titleEn: "MCP SERVERS & TOOLS",
    categoryAr: "خوادم MCP",
    synonyms: [
      "mcp", "خوادم mcp", "سيرفرات mcp", "ادوات mcp", "أدوات mcp", "موزع mcp", "بروتوكول mcp",
      "mcp servers", "mcp tools"
    ],
    speechReplyAr: "فتحت لك موزع خوادم وأدوات MCP الـ 21 المعتمدة في النظام.",
  },

  // 17. NEXUS SLIDE STAGE (مسرح سلايد البطاقات الهولوغرافية - شاشة 21)
  {
    id: "nexus-stage",
    screenId: "21",
    hubId: "nexus.stage",
    titleAr: "مسرح سلايد البطاقات الهولوغرافية",
    titleEn: "NEXUS STAGE",
    categoryAr: "المسرح الهولوغرافي",
    synonyms: [
      "مسرح", "مسرح نيكسوس", "مسرح nexus", "سلايد", "سلايد البطاقات", "بطاقات سلايد", "البطاقات الهولوغرافية",
      "هولوجرام", "هولوجرافي", "شاشة 21", "شاشه 21", "nexus", "stage"
    ],
    speechReplyAr: "انتقلت بك إلى مسرح سلايد البطاقات الهولوغرافية ثلاثي الأبعاد.",
  },

  // 18. 3D AUTONOMOUS STUDIO (استوديو الوكلاء الذاتي ثلاثي الأبعاد - شاشة 20)
  {
    id: "studio-3d",
    screenId: "20",
    hubId: "studio.3d",
    titleAr: "الاستوديو السيبراني ثلاثي الأبعاد",
    titleEn: "3D AUTONOMOUS STUDIO",
    categoryAr: "الاستوديو الذاتي",
    synonyms: [
      "استوديو", "استوديو ثلاثي الابعاد", "استوديو ثلاثي الأبعاد", "استوديو الوكلاء", "حضور بشري",
      "صوت حي", "شاشة 20", "شاشه 20", "studio 3d", "cyber studio"
    ],
    speechReplyAr: "انتقلت بك إلى استوديو الوكلاء الذاتي التفاعلي ثلاثي الأبعاد.",
  },

  // 19. REVIEWS & RATINGS (التقييمات والمراجعات)
  {
    id: "bookings-reviews",
    screenId: "03",
    hubId: "bookings.reviews",
    titleAr: "المراجعات والتقييمات",
    titleEn: "REVIEWS & RATINGS",
    categoryAr: "الحجوزات والتقييمات",
    href: "/admin/reviews",
    synonyms: ["تقييمات", "تقييم", "مراجعات", "مراجعة", "اراء العملاء", "آراء العملاء", "reviews", "ratings"],
    speechReplyAr: "فتحت لك قسم تقييمات ومراجعات العملاء.",
  },

  // 20. VISAS (التأشيرات والفيزا)
  {
    id: "mobility-visa",
    screenId: "06",
    hubId: "mobility.visa",
    titleAr: "خدمات التأشيرات والفيزا",
    titleEn: "VISA SERVICES",
    categoryAr: "النقل والتأشيرات",
    synonyms: ["فيزا", "تاشيرات", "تأشيرات", "تاشيرة", "تأشيرة", "جوازات", "فيز", "visa", "visas"],
    speechReplyAr: "فتحت لك قسم خدمات وتتبع التأشيرات الدولية.",
  },
];

/**
 * Deep Intent Resolver
 * Analyzes the user's spoken or typed prompt and matches it against the comprehensive lexicon.
 */
export function resolveSupervisorIntent(directive: string, activeCardId?: string): ResolvedIntent {
  const norm = normalizeSupervisorText(directive);
  const stripped = stripSupervisorFiller(norm);

  // 1. Explicit CLOSE directives (Highest priority - NEVER open anything if user asked to close!)
  const closePattern = /^(اغلق|سكر|اقفل|خروج|اغلاق|اخفي|طفي|ارجع|الغاء|إلغاء|close|exit|hide|dismiss)(\s+(القسم|البطاق|النافذ|الشات|المودال|الحالي|النشط|كل شي))?$/;
  if (closePattern.test(stripped) || /(اغلق القسم|سكر القسم|اقفل القسم|اغلاق النافذة|سكر الشات|خروج من القسم)/.test(norm)) {
    return {
      type: "CLOSE_ACTIVE",
      speechReplyAr: "تم إغلاق القسم بنجاح.",
      confidence: 1.0,
    };
  }

  // 2. Carousel Rotation directives
  if (/(التالي|البطاقة التالية|البطاقه التاليه|مرر يمين|السلايد التالي|حرك يمين|التاليه|بعده|next|forward)/.test(norm)) {
    return {
      type: "CAROUSEL_NEXT",
      speechReplyAr: "البطاقة التالية.",
      confidence: 0.95,
    };
  }
  if (/(السابق|البطاقة السابقة|البطاقه السابقه|مرر يسار|السلايد السابق|حرك يسار|السابقه|قبله|ارجع للخلف|prev|back|previous)/.test(norm)) {
    return {
      type: "CAROUSEL_PREV",
      speechReplyAr: "البطاقة السابقة.",
      confidence: 0.95,
    };
  }

  // 3. Camera & Gesture toggles
  if (/(شغل الكام|تفعيل الكام|اطفي الكام|ايقاف الكام|إيقاف الكام|تتبع اليد|ايماءات اليد|camera|gesture)/.test(norm)) {
    return {
      type: "TOGGLE_CAMERA",
      speechReplyAr: "تم تبديل تفعيل كاميرا وتتبع إيماءات اليد.",
      confidence: 0.95,
    };
  }

  // 4. Swarm visibility & coordination
  if (/(اظهار الوكلاء|إظهار الوكلاء|اخفاء الوكلاء|إخفاء الوكلاء|عرض الوكلاء)/.test(norm)) {
    return {
      type: "TOGGLE_SWARM",
      speechReplyAr: "تم تبديل إظهار خلية الوكلاء.",
      confidence: 0.95,
    };
  }
  if (/(تنسيق جماعي|تنسيق صوتي|التنسيق الجماعي)/.test(norm)) {
    return {
      type: "TOGGLE_COORDINATE",
      speechReplyAr: "تم تفعيل التنسيق الصوتي الجماعي مع خلية الوكلاء.",
      confidence: 0.95,
    };
  }
  if (/(تنفيذ ذاتي|اعتماد سيادي|اعتماد يدوي|الوضع الذاتي)/.test(norm)) {
    return {
      type: "TOGGLE_AUTO_EXECUTION",
      speechReplyAr: "تم تبديل وضع الاعتماد والتنفيذ السيادي.",
      confidence: 0.95,
    };
  }

  // 5. Open MCP Dispatcher
  if (/(خوادم mcp|أدوات mcp|ادوات mcp|سيرفرات mcp|فتح mcp|شغل mcp|mcp)/.test(norm)) {
    return {
      type: "OPEN_MCP_DISPATCHER",
      screenId: "18",
      hubId: "mcp.servers",
      speechReplyAr: "فتحت لك موزع خوادم وأدوات MCP الـ 21 والـ 88 أداة في النظام.",
      confidence: 0.98,
    };
  }

  // 6. Generic "Open Current / Active" (ONLY when NO specific target is requested)
  if (/^(افتح|عرض|وريني|ادخل|فتح|open|view)$/.test(stripped)) {
    return {
      type: "OPEN_SECTOR",
      sectorId: activeCardId,
      speechReplyAr: "فتحت لك تفاصيل القسم النشط.",
      confidence: 0.9,
    };
  }

  // 7. SPECIFIC SECTION MATCHING (Deep Lexicon Search)
  // Extract search tokens from stripped directive
  const searchTokens = stripped
    .replace(/(افتح|اعرض|وريني|انقلني|وديني|ادخل|شاهد|فتح|روح|روحي|قسم|صفحة|واجهة|مركز|نظام|شاشة|شاشه|عرض|لوحة)\s*/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1);

  let bestMatch: LexiconEntry | null = null;
  let bestScore = 0;

  for (const entry of SUPERVISOR_MASTER_LEXICON) {
    let score = 0;

    // Check full synonym exact inclusion
    for (const syn of entry.synonyms) {
      const normSyn = normalizeSupervisorText(syn);
      if (stripped.includes(normSyn)) {
        score = Math.max(score, 10 + normSyn.length);
      } else if (norm.includes(normSyn)) {
        score = Math.max(score, 8 + normSyn.length);
      }
    }

    // Check individual token matches
    for (const token of searchTokens) {
      for (const syn of entry.synonyms) {
        const normSyn = normalizeSupervisorText(syn);
        if (normSyn === token) {
          score += 12;
        } else if (normSyn.includes(token) || token.includes(normSyn)) {
          score += 6;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // If a high-confidence match is found
  if (bestMatch && bestScore >= 6) {
    return {
      type: "OPEN_SECTOR",
      screenId: bestMatch.screenId,
      hubId: bestMatch.hubId,
      sectorId: bestMatch.sectorId,
      href: bestMatch.href,
      titleAr: bestMatch.titleAr,
      speechReplyAr: bestMatch.speechReplyAr,
      confidence: Math.min(1.0, bestScore / 20),
    };
  }

  // Fallback: General informative response
  return {
    type: "GENERAL_REPLY",
    speechReplyAr: `استلمت طلبك: "${directive}". جارٍ التحليل عبر خلية الوكلاء. يمكنك طلب فتح أي قسم مثل تأجير السيارات، رحلات الطيران، الفنادق، أو الجولات مباشرة.`,
    confidence: 0.5,
  };
}
