/* Agent C: copilot pipeline */

export type SectionSourceEntry = {
  type: string;
  labelAr: string;
  files: string[];
  notes?: string;
};

/** Maps homepage section types to the real template / CSS / JS files the agent must read. */
export const HOMEPAGE_SECTION_SOURCE_MAP: SectionSourceEntry[] = [
  {
    type: "hero",
    labelAr: "الهيرو",
    files: [
      "src/components/home/template/HeroSearchSections.tsx",
      "src/components/home/template/HeroPackages.tsx",
      "src/lib/visual-editor/schema.ts",
    ],
  },
  {
    type: "search",
    labelAr: "البحث",
    files: [
      "src/components/home/template/HeroSearchSections.tsx",
      "src/components/search/SearchWidget.tsx",
    ],
    notes: "SearchWidget layout is protected — read only unless the operator explicitly asks to edit it.",
  },
  {
    type: "categories",
    labelAr: "شريط الخدمات",
    files: ["src/components/home/template/ExtraSections.tsx"],
  },
  {
    type: "destinations",
    labelAr: "الوجهات",
    files: ["src/components/home/template/CatalogSections.tsx"],
  },
  {
    type: "packages",
    labelAr: "الباقات",
    files: ["src/components/home/template/CatalogSections.tsx"],
  },
  {
    type: "hotels",
    labelAr: "الفنادق",
    files: ["src/components/home/template/CatalogSections.tsx"],
  },
  {
    type: "cars",
    labelAr: "السيارات",
    files: ["src/components/home/template/CatalogSections.tsx"],
  },
  {
    type: "transfers",
    labelAr: "الترانسفير",
    files: ["src/components/home/template/ExtraSections.tsx"],
  },
  {
    type: "whyUs",
    labelAr: "لماذا نحن",
    files: ["src/components/home/template/StorySections.tsx"],
  },
  {
    type: "stats",
    labelAr: "الإحصائيات",
    files: ["src/components/home/template/StorySections.tsx", "src/components/home/StatsSection.tsx"],
  },
  {
    type: "testimonials",
    labelAr: "آراء العملاء",
    files: ["src/components/home/template/StorySections.tsx"],
  },
  {
    type: "blog",
    labelAr: "المدونة",
    files: ["src/components/home/template/StorySections.tsx", "src/components/home/BlogSection.tsx"],
  },
  {
    type: "newsletter",
    labelAr: "النشرة",
    files: ["src/components/home/template/StorySections.tsx"],
  },
  {
    type: "contact",
    labelAr: "تواصل واطلب اتصالاً",
    files: ["src/components/home/template/ExtraSections.tsx"],
  },
  {
    type: "cta",
    labelAr: "تواصل واطلب اتصالاً",
    files: ["src/components/home/template/ExtraSections.tsx"],
  },
  {
    type: "flashDeals",
    labelAr: "عروض سريعة",
    files: ["src/components/home/template/ExtraSections.tsx"],
  },
  {
    type: "visa",
    labelAr: "التأشيرات",
    files: ["src/components/home/template/ExtraSections.tsx"],
  },
  {
    type: "flightDeals",
    labelAr: "عروض الطيران",
    files: ["src/components/home/template/ExtraSections.tsx", "src/components/home/FlightDealsSection.tsx"],
  },
  {
    type: "vipTours",
    labelAr: "جولات VIP",
    files: ["src/components/home/template/ExtraSections.tsx"],
  },
  {
    type: "trust",
    labelAr: "تحجز بثقة",
    files: [
      "src/components/home/template/ExtraSections.tsx",
      "src/components/ui/TrustBadges.tsx",
    ],
  },
  {
    type: "partners",
    labelAr: "الشركاء",
    files: [
      "src/components/home/template/ExtraSections.tsx",
      "src/components/home/PartnersMarquee.tsx",
    ],
  },
  {
    type: "coupons",
    labelAr: "الكوبونات",
    files: ["src/components/home/template/RewardSections.tsx"],
  },
  {
    type: "points",
    labelAr: "نقاط الولاء",
    files: ["src/components/home/template/RewardSections.tsx"],
  },
  {
    type: "affiliate",
    labelAr: "نظام المسوّقين",
    files: ["src/components/home/template/RewardSections.tsx"],
  },
  {
    type: "banners",
    labelAr: "بطاقات وجهات فاخرة",
    files: ["src/components/home/template/RewardSections.tsx"],
  },
  {
    type: "copilot",
    labelAr: "قسم مخصص من الوكيل",
    files: [
      "src/components/home/template/copilot-sections/",
      "src/lib/builder-agent/copilot-section-library.ts",
      "src/lib/visual-editor/schema.ts",
      "src/components/home/template/render-section.tsx",
    ],
    notes: "Custom sections created from scratch. Rendered live from html/css in settings.",
  },
];

export const SHARED_HOMEPAGE_FILES = [
  "src/components/home/template/render-section.tsx",
  "src/components/home/template/primitives.tsx",
  "src/components/home/template/surfaces.tsx",
  "src/lib/visual-editor/schema.ts",
  "src/app/globals.css",
];

export function resolveSectionSource(query: string): SectionSourceEntry[] {
  const q = query.trim().toLowerCase();
  if (!q || q === "*" || q === "all") return HOMEPAGE_SECTION_SOURCE_MAP;
  const aliases: Record<string, string> = {
    "تحجز بثقة": "trust",
    "book with confidence": "trust",
    الثقة: "trust",
    الشركاء: "partners",
    partners: "partners",
    الهيرو: "hero",
    "شريط الخدمات": "categories",
    "لماذا نحن": "whyUs",
  };
  const mapped = aliases[q] || q;
  return HOMEPAGE_SECTION_SOURCE_MAP.filter(
    (item) =>
      item.type === mapped ||
      item.type.toLowerCase().includes(mapped) ||
      item.labelAr.includes(query.trim()) ||
      item.files.some((file) => file.toLowerCase().includes(mapped))
  );
}
