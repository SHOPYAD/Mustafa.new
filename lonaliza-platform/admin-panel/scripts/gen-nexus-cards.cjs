#!/usr/bin/env node
/**
 * Generates Nexus deck cards for the 15 PRIMARY GENERAL DOMAIN SECTIONS (Screens 03–16 + Flagship Markets).
 * Strict Rule: ONE card per General Section. No duplicate sub-tab cards!
 * Output: src/lib/studio/nexus/nexus-cards.generated.ts
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src/lib/studio/nexus/nexus-cards.generated.ts");

const TONE_HEX = {
  gold: "#ffd700",
  amber: "#ffb703",
  cyan: "#00e5ff",
  purple: "#818cf8",
  magenta: "#f43f5e",
  emerald: "#10b981",
};

const GENERAL_DOMAIN_CARDS = [
  // 01. FLIGHTS & GDS
  {
    id: "nexus-domain-flights",
    hubId: "flights",
    screenId: "04",
    stationId: "flights.operations",
    titleAr: "رحلات الطيران وموزعو GDS",
    titleEn: "FLIGHTS & GDS",
    category: "تذاكر الطيران والربط العالمي",
    tone: "cyan",
    color: TONE_HEX.cyan,
    domainIcon: "plane",
    href: "/admin/flights",
    metricLabel1: "Daily Searches",
    metricLabel2: "12.6K",
    metricLabel3: "+8.4%",
    description: "محور عمليات وإدارة رحلات الطيران، المطارات، إضافات الرحلة، وموزعو أنظمة GDS",
    quickActionCommand: "عرض محرك رحلات الطيران وإدارة شركات الطيران والمطارات والخدمات الإضافية",
    features: [
      "شركات الطيران",
      "المطارات والوجهات",
      "الخدمات الإضافية",
      "عمليات ما بعد الحجز",
      "طلبات الحجز الواردة"
    ]
  },

  // 02. HOTELS & BED BANKS
  {
    id: "nexus-domain-hotels",
    hubId: "hotels",
    screenId: "05",
    stationId: "hotels.operations",
    titleAr: "الفنادق وبنوك الأسرّة",
    titleEn: "HOTELS & BED BANKS",
    category: "الإقامة وإدارة الغرف",
    tone: "amber",
    color: TONE_HEX.amber,
    domainIcon: "hotel",
    href: "/admin/hotels",
    metricLabel1: "Active Properties",
    metricLabel2: "870",
    metricLabel3: "+6.1%",
    description: "بوابة إدارة الفنادق المعتمدة، بنوك الأسرّة العالمية، أسعار الغرف المباشرة، والمرافق الفندقية",
    quickActionCommand: "فتح بوابة الفنادق الفاخرة وإدارة الغرف وعقود الأسعار وبنوك الأسرّة",
    features: [
      "فنادق المنصة",
      "أنواع الغرف والأسرة",
      "بنوك الأسرّة B2B",
      "عقود الأسعار",
      "المرافق والخدمات"
    ]
  },

  // 03. MARKETS & TRENDS (FLAGSHIP CENTER)
  {
    id: "nexus-domain-markets",
    hubId: "markets",
    screenId: "19",
    stationId: "analytics.markets",
    titleAr: "الأسواق والاتجاهات",
    titleEn: "MARKETS & TRENDS",
    category: "تحليلات الأسواق العالمية",
    tone: "gold",
    color: TONE_HEX.gold,
    domainIcon: "chart",
    href: "/admin/marketing",
    metricLabel1: "Data Points",
    metricLabel2: "51.8K",
    metricLabel3: "+15.6%",
    description: "لوحة الاستشعار الذكية لحركة أسواق السفر العالمية، مؤشرات الأسعار، والاتجاهات التنبؤية",
    quickActionCommand: "تحليل مؤشرات السوق العالمي واتجاهات الأسعار وفرص النمو الحالية",
    features: [
      "رادار حركة السوق اللحظي",
      "تحليل أسعار المنافسين",
      "مؤشرات الطلب الموسمي",
      "تنبؤات سلوك المسافرين",
      "تقارير الفرص الاستثمارية"
    ]
  },

  // 04. BOOKINGS & OPERATIONS
  {
    id: "nexus-domain-bookings",
    hubId: "bookings",
    screenId: "03",
    stationId: "bookings.operations",
    titleAr: "الحجوزات والعمليات",
    titleEn: "BOOKINGS & OPERATIONS",
    category: "إدارة الحجوزات والعمليات",
    tone: "purple",
    color: TONE_HEX.purple,
    domainIcon: "calendar",
    href: "/admin/bookings",
    metricLabel1: "Bookings Today",
    metricLabel2: "347",
    metricLabel3: "+15.0%",
    description: "المركز الموحد لإدارة حجوزات الفنادق، طلبات الاستفسار، الإلغاء، التقييمات، والمدفوعات",
    quickActionCommand: "مراجعة سجلات الحجوزات النشطة وطلبات الاستفسار والمدفوعات اللحظية",
    features: [
      "حجوزات الفنادق",
      "طلبات الحجز",
      "طلبات الإلغاء",
      "التقييمات الموثقة",
      "مدفوعات الحجوزات",
      "حجوزات B2B"
    ]
  },

  // 05. MOBILITY & TOURS
  {
    id: "nexus-domain-mobility",
    hubId: "mobility",
    screenId: "06",
    stationId: "mobility.operations",
    titleAr: "التنقل والجولات والفيزا",
    titleEn: "MOBILITY & TOURS",
    category: "النقل والرحلات السياحية",
    tone: "emerald",
    color: TONE_HEX.emerald,
    domainIcon: "car",
    href: "/admin/cars",
    metricLabel1: "Active Fleet",
    metricLabel2: "24",
    metricLabel3: "+12.4%",
    description: "إدارة أسطول النقل الخاص، السائقين، برامج الرحلات السياحية، والتأشيرات المعتمدة",
    quickActionCommand: "إدارة أسطول سيارات VIP وتتبع رحلات السائقين وجداول الجولات السياحية",
    features: [
      "أسطول السيارات VIP",
      "السائقين والمهمات",
      "خدمات الاستقبال والتوصيل",
      "الجولات السياحية اليومية",
      "التأشيرات السياحية"
    ]
  },

  // 06. CONTENT STUDIO & APPS
  {
    id: "nexus-domain-content",
    hubId: "content",
    screenId: "07",
    stationId: "content.operations",
    titleAr: "استوديو المحتوى والتطبيقات",
    titleEn: "CONTENT STUDIO & APPS",
    category: "المحتوى وواجهات المنصة",
    tone: "cyan",
    color: TONE_HEX.cyan,
    domainIcon: "pen",
    href: "/admin/content",
    metricLabel1: "Published Articles",
    metricLabel2: "142",
    metricLabel3: "+8.0%",
    description: "استوديو صناعة وإدارة المحتوى السياحي، الصفحات التفاعلية، والوسائط المتعددة وSEO",
    quickActionCommand: "فتح استوديو التحرير وإدارة المقالات وصفحات المنصة والوسائط",
    features: [
      "مقالات المدونة السياحية",
      "الصفحات المخصصة",
      "المكتبة والوسائط",
      "تحسين محركات البحث SEO",
      "واجهة الموقع والتطبيقات"
    ]
  },

  // 07. CRM & CUSTOMERS
  {
    id: "nexus-domain-crm",
    hubId: "crm",
    screenId: "08",
    stationId: "crm.operations",
    titleAr: "العملاء وإدارة العلاقات CRM",
    titleEn: "CRM & CUSTOMERS",
    category: "العملاء والخدمات الخاصة",
    tone: "magenta",
    color: TONE_HEX.magenta,
    domainIcon: "users",
    href: "/admin/crm",
    metricLabel1: "Active Customers",
    metricLabel2: "1,248",
    metricLabel3: "+18.2%",
    description: "منظومة إدارة علاقات العملاء، العملاء المحتملين، نقاط الولاء، وخدمة العملاء",
    quickActionCommand: "الاطلاع على ملفات العملاء وتتبع المحادثات وبرامج الولاء",
    features: [
      "سجل العملاء المعتمدين",
      "العملاء المحتملين Leads",
      "محافظ الولاء والنقاط",
      "تذاكر الدعم السريع",
      "سجلات التواصل"
    ]
  },

  // 08. OMNICHANNEL & SOCIAL
  {
    id: "nexus-domain-social",
    hubId: "social",
    screenId: "09",
    stationId: "publishing.operations",
    titleAr: "النشر متعدد القنوات والمجتمع",
    titleEn: "OMNICHANNEL & SOCIAL",
    category: "النشر والتواصل الخارجي",
    tone: "magenta",
    color: TONE_HEX.magenta,
    domainIcon: "share",
    href: "/admin/publishing",
    metricLabel1: "Network Reach",
    metricLabel2: "3.4K",
    metricLabel3: "+9.7%",
    description: "مركز التحكم بالنشر متعدد المنصات، شبكات التواصل الاجتماعي، والرسائل المجدولة",
    quickActionCommand: "جدولة المنشورات ومزامنة القنوات الاجتماعية وخلاصات RSS",
    features: [
      "قنوات النشر الرقمي",
      "المنشورات المجدولة",
      "خلاصات RSS الآلية",
      "تحليلات التفاعل",
      "مجموعات النشر الموحد"
    ]
  },

  // 09. MARKETING & GROWTH
  {
    id: "nexus-domain-marketing",
    hubId: "marketing",
    screenId: "10",
    stationId: "marketing.operations",
    titleAr: "الحملات والتسويق والعمولات",
    titleEn: "MARKETING & GROWTH",
    category: "التسويق ونمو المبيعات",
    tone: "gold",
    color: TONE_HEX.gold,
    domainIcon: "megaphone",
    href: "/admin/marketing",
    metricLabel1: "Campaign Reach",
    metricLabel2: "28.4K",
    metricLabel3: "+11.5%",
    description: "إدارة استراتيجيات التسويق الرقمي، شبكة الأفلييت والعمولات، وكوبونات الخصم الذكية",
    quickActionCommand: "إدارة الحملات التسويقية ومتابعة شبكة المسوقين ونسب العمولات",
    features: [
      "الحملات الإعلانية",
      "شبكة المسوقين والعمولات",
      "كوبونات الخصم والعروض",
      "تتبع الإحالات والزيارات",
      "تقارير العائد التسويقي"
    ]
  },

  // 10. AI AGENT WAR ROOM
  {
    id: "nexus-domain-warroom",
    hubId: "warroom",
    screenId: "11",
    stationId: "warroom.operations",
    titleAr: "غرفة حرب الوكلاء والمعرفة",
    titleEn: "AI AGENT WAR ROOM",
    category: "الذكاء الاصطناعي والتنسيق العصبي",
    tone: "cyan",
    color: TONE_HEX.cyan,
    domainIcon: "brain",
    href: "/admin/agent-war-room",
    metricLabel1: "Active Swarm",
    metricLabel2: "12 Agents",
    metricLabel3: "Optimal",
    description: "غرفة العمليات المركزية للذكاء الاصطناعي، تنسيق أسراب الوكلاء، وإدارة المعرفة الفائقة",
    quickActionCommand: "فتح غرفة التنسيق العصبي ومراقبة قرارات الوكلاء ومصادر المعرفة",
    features: [
      "سرب الوكلاء المستقلين",
      "قاعدة المعرفة المؤسسية",
      "التنسيق العصبي Swarm",
      "نماذج LLM والتوليد",
      "سجلات المداولات اللحظية"
    ]
  },

  // 11. AUTOMATION & WORKFLOWS
  {
    id: "nexus-domain-automation",
    hubId: "automation",
    screenId: "12",
    stationId: "automation.operations",
    titleAr: "استوديو الأتمتة والمهام",
    titleEn: "AUTOMATION & WORKFLOWS",
    category: "الأتمتة وسير العمل الذاتي",
    tone: "purple",
    color: TONE_HEX.purple,
    domainIcon: "workflow",
    href: "/admin/automation",
    metricLabel1: "Automated Tasks",
    metricLabel2: "94.2%",
    metricLabel3: "+4.1%",
    description: "استوديو بناء وتشغيل سلاسل الأتمتة البرمجية، المراقبة الذاتية، وجدولة المهام الحرجة",
    quickActionCommand: "فحص مسارات الأتمتة وجداول المهام الدورية وسجلات التنفيذ",
    features: [
      "مسارات العمل المؤتمتة",
      "المشغلات الذكية Triggers",
      "المهام المجدولة Cron",
      "سجلات التنفيذ اللحظية",
      "أدوات التدقيق الذاتي"
    ]
  },

  // 12. FINANCE & COMMERCE
  {
    id: "nexus-domain-finance",
    hubId: "finance",
    screenId: "13",
    stationId: "finance.operations",
    titleAr: "المالية والفوترة والولاء",
    titleEn: "FINANCE & COMMERCE",
    category: "المالية والفوترة الرقمية",
    tone: "gold",
    color: TONE_HEX.gold,
    domainIcon: "wallet",
    href: "/admin/finance",
    metricLabel1: "Processed Volume",
    metricLabel2: "$84.2K",
    metricLabel3: "+14.8%",
    description: "المنظومة المالية الشاملة، إدارة الفواتير، تسوية بوابات الدفع، وإحصائيات الأرباح",
    quickActionCommand: "استعراض المعاملات المالية المعتمدة والفواتير الرقمية وحركة المحافظ",
    features: [
      "المعاملات المالية المكتملة",
      "الفواتير الضريبية الرقمية",
      "محافظ العملاء الإلكترونية",
      "بوابات الدفع والتحويل",
      "إحصائيات الإيرادات والأرباح"
    ]
  },

  // 13. B2B RESELLER NETWORK
  {
    id: "nexus-domain-resale",
    hubId: "resale",
    screenId: "14",
    stationId: "resale.operations",
    titleAr: "إعادة البيع وشبكة B2B",
    titleEn: "B2B RESELLER NETWORK",
    category: "شبكة التوزيع والموزعين",
    tone: "cyan",
    color: TONE_HEX.cyan,
    domainIcon: "store",
    href: "/admin/resale",
    metricLabel1: "Reseller Partners",
    metricLabel2: "32",
    metricLabel3: "+10.0%",
    description: "منصة إدارة شبكة شركاء إعادة البيع، إصدار التراخيص، وإدارة المتاجر المستقلة Whitelabel",
    quickActionCommand: "إدارة تراخيص الموزعين وشبكات B2B وقوالب العلامة التجارية المخصصة",
    features: [
      "شركات الموزعين المعتمدة",
      "طلبات توزيع B2B",
      "تراخيص المنصة التابعة",
      "قوالب الهوية Whitelabel",
      "إعدادات الربط المخصص"
    ]
  },

  // 14. SECURITY & COMPLIANCE
  {
    id: "nexus-domain-compliance",
    hubId: "compliance",
    screenId: "15",
    stationId: "compliance.operations",
    titleAr: "الامتثال والخصوصية والصلاحيات",
    titleEn: "SECURITY & COMPLIANCE",
    category: "الحماية والامتثال القانوني",
    tone: "magenta",
    color: TONE_HEX.magenta,
    domainIcon: "shield",
    href: "/admin/legal",
    metricLabel1: "Compliance Score",
    metricLabel2: "98.5%",
    metricLabel3: "Secure",
    description: "المركز القانوني والأمني، حماية خصوصية البيانات، مراقبة الجلسات، والامتثال للأنظمة العالمية",
    quickActionCommand: "مراجعة بنود الامتثال القانوني وسجلات الصلاحيات وطلبات خصوصية GDPR",
    features: [
      "البنود والشروط القانونية",
      "الخصوصية وحماية GDPR",
      "هوية وترخيص المنصة",
      "أمن الجلسات والمستخدمين",
      "مؤشر جاهزية الحماية"
    ]
  },

  // 15. SETTINGS & MCP INTEGRATIONS
  {
    id: "nexus-domain-settings",
    hubId: "settings",
    screenId: "16",
    stationId: "settings.operations",
    titleAr: "الإعدادات وتكاملات MCP",
    titleEn: "SETTINGS & MCP INTEGRATIONS",
    category: "النظام والبنية التحتية",
    tone: "purple",
    color: TONE_HEX.purple,
    domainIcon: "settings",
    href: "/admin/settings",
    metricLabel1: "Connected MCPs",
    metricLabel2: "21 Tools",
    metricLabel3: "Active",
    description: "الإعدادات التقنية الشاملة، ربط خوادم MCP، إدارة قواعد البيانات، ومفاتيح التكاملات",
    quickActionCommand: "إدارة خوادم بروتوكول MCP وخادم البريد وقاعدة PocketBase والترجمات",
    features: [
      "خوادم وأدوات بروتوكول MCP",
      "إعدادات خادم البريد SMTP",
      "مزودو خدمات البحث الخارجي",
      "قاعدة بيانات PocketBase",
      "الترجمات متعددة اللغات"
    ]
  }
];

function emit(cards) {
  const body = `/** AUTO-GENERATED — node scripts/gen-nexus-cards.cjs */
import type { DomainIcon, DomainTone } from "@/lib/neural-studio/domain-systems";

export type NexusCardHealth = "OPTIMAL" | "DEGRADED" | "OFFLINE";

export interface NexusHubCard {
  id: string;
  hubId: string;
  screenId: string;
  stationId: string;
  titleAr: string;
  titleEn: string;
  category: string;
  tone: DomainTone;
  color: string;
  domainIcon: DomainIcon;
  href: string;
  metricLabel1: string;
  metricLabel2: string;
  metricLabel3: string;
  description: string;
  quickActionCommand: string;
  features: string[];
}

/** Exactly ${cards.length} distinct primary domain cards (ONE card per General Section). Zero sub-tab duplicates! */
export const NEXUS_HUB_CARDS: NexusHubCard[] = ${JSON.stringify(cards, null, 2)} as NexusHubCard[];

export const NEXUS_CARD_COUNT = ${cards.length};
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body, "utf8");
  console.log(`[gen-nexus-cards] Successfully wrote ${cards.length} PRIMARY DOMAIN cards → ${path.relative(ROOT, OUT)}`);
}

emit(GENERAL_DOMAIN_CARDS);
