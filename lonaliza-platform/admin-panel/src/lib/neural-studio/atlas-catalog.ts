/**
 * أطلس الشاشة 01.
 * الهندسة البصرية تتبع الصورة المرجعية (11 عنقوداً حول النواة).
 * مواصفة docs/screens/01.md تذكر 12 مكوناً؛ الرحلات والفنادق والوكلاء والأتمتة
 * والتكاملات تظهر هنا كأبناء حقيقيين داخل العناقيد المطابقة للصورة، مع الإبقاء على معرفاتها.
 * الحالة غير المربوطة بسجل سيادي تبقى unknown، ولا تُعرض كخدمة سليمة.
 */
import {
  findSovereignSubModule,
  type SubModuleNode,
} from "@/components/admin/automation/hud/brain/data/sovereignDomainGraph";

export type AtlasNodeStatus = "online" | "syncing" | "warning" | "locked" | "unknown";

export interface AtlasLeafDef {
  id: string;
  label: string;
  /** معرف الوحدة في السجل السيادي إن وُجدت. */
  subModuleId?: string;
  /** قراءة حقيقية. الغياب يعني أن التسمية بصرية فقط. */
  readEndpoint?: string;
  screenId: string;
  specComponentId?: string;
}

export interface AtlasDomainDef {
  id: string;
  label: string;
  color: string;
  /** درجات: 0 شرق، عكس عقارب الساعة، والمحور الرأسي للأعلى. */
  angleDeg: number;
  screenId: string;
  leaves: AtlasLeafDef[];
  relatedDomainIds: string[];
}

export interface AtlasLeafView extends AtlasLeafDef {
  status: AtlasNodeStatus;
  agentNameAr?: string;
  httpMethod?: string;
  evidenceRef: string;
  relationType: "contains";
}

export interface AtlasDomainView extends Omit<AtlasDomainDef, "leaves"> {
  leaves: AtlasLeafView[];
  knownCount: number;
  unknownCount: number;
}

export interface AtlasProbe {
  id: string;
  domainId: string;
  collection: string;
  totalItems: number | null;
  freshness: "live" | "unknown" | "error";
  error?: string;
}

const DOMAINS: AtlasDomainDef[] = [
  {
    id: "domain.01.overview",
    label: "نظرة عامة",
    color: "#27dff4",
    angleDeg: 90,
    screenId: "19",
    relatedDomainIds: ["domain.01.bookings", "domain.01.finance", "domain.01.ai"],
    leaves: [
      {
        id: "domain.01.overview.leaf.dashboard",
        label: "لوحة المعلومات",
        subModuleId: "sub-sec-dashboard",
        screenId: "19",
      },
    ],
  },
  {
    id: "domain.01.component.1",
    label: "الحجوزات",
    color: "#ffc837",
    angleDeg: 58,
    screenId: "03",
    relatedDomainIds: ["domain.01.component.4", "domain.01.component.10", "domain.01.component.6"],
    leaves: [
      {
        id: "domain.01.component.1.leaf.bookings",
        label: "الحجوزات",
        subModuleId: "sub-flights-bookings",
        screenId: "03",
        specComponentId: "domain.01.component.1",
      },
      {
        id: "domain.01.component.1.leaf.cancellations",
        label: "طلبات الإلغاء",
        subModuleId: "sub-flights-cancellations",
        screenId: "03",
      },
      {
        id: "domain.01.component.1.leaf.reviews",
        label: "تقييمات العملاء الموثقة",
        subModuleId: "sub-crm-reviews",
        readEndpoint: "/api/admin/reviews/agent",
        screenId: "03",
      },
    ],
  },
  {
    id: "domain.01.component.4",
    label: "الخدمات",
    color: "#ff9900",
    angleDeg: 24,
    screenId: "06",
    relatedDomainIds: ["domain.01.component.1", "domain.01.component.10"],
    leaves: [
      {
        id: "domain.01.component.3",
        label: "الفنادق",
        subModuleId: "sub-hotels-main",
        screenId: "05",
        specComponentId: "domain.01.component.3",
      },
      {
        id: "domain.01.component.2",
        label: "الرحلات",
        subModuleId: "sub-flights-core",
        screenId: "04",
        specComponentId: "domain.01.component.2",
      },
      {
        id: "domain.01.component.4.leaf.packages",
        label: "الباقات",
        subModuleId: "sub-packages-main",
        screenId: "06",
      },
      {
        id: "domain.01.component.4.leaf.transfer",
        label: "الترانسفير VIP",
        subModuleId: "sub-transfers-routes",
        screenId: "06",
      },
      {
        id: "domain.01.component.4.leaf.cars",
        label: "تأجير السيارات",
        subModuleId: "sub-transfers-cars",
        screenId: "06",
      },
      {
        id: "domain.01.component.4.leaf.tours",
        label: "الجولات",
        subModuleId: "sub-packages-tours",
        screenId: "06",
      },
      {
        id: "domain.01.component.4.leaf.visas",
        label: "التأشيرات",
        subModuleId: "sub-packages-visa",
        screenId: "06",
      },
    ],
  },
  {
    id: "domain.01.component.5",
    label: "محتوى الموقع",
    color: "#10b981",
    angleDeg: -8,
    screenId: "07",
    relatedDomainIds: ["domain.01.component.7", "domain.01.settings"],
    leaves: [
      {
        id: "domain.01.component.5.leaf.editor",
        label: "محرر بصري AI",
        subModuleId: "sub-cms-branding",
        screenId: "07",
      },
      {
        id: "domain.01.component.5.leaf.pages",
        label: "الصفحات",
        subModuleId: "sub-cms-homepage",
        screenId: "07",
      },
      {
        id: "domain.01.component.5.leaf.articles",
        label: "المقالات",
        subModuleId: "sub-cms-blog",
        readEndpoint: "/api/admin/blog",
        screenId: "07",
      },
      {
        id: "domain.01.component.5.leaf.search",
        label: "تبويبات البحث",
        screenId: "07",
      },
      {
        id: "domain.01.component.5.leaf.web",
        label: "تطبيق الويب",
        subModuleId: "sub-mob-app",
        screenId: "07",
      },
      {
        id: "domain.01.component.5.leaf.mobile",
        label: "تطبيق الجوال",
        subModuleId: "sub-mob-notifications",
        screenId: "07",
      },
    ],
  },
  {
    id: "domain.01.component.6",
    label: "العملاء",
    color: "#c084fc",
    angleDeg: -42,
    screenId: "08",
    relatedDomainIds: ["domain.01.component.1", "domain.01.legal", "domain.01.component.10"],
    leaves: [
      {
        id: "domain.01.component.6.leaf.crm",
        label: "إدارة العملاء",
        subModuleId: "sub-crm-customers",
        readEndpoint: "/api/admin/crm/leads",
        screenId: "08",
      },
      {
        id: "domain.01.component.6.leaf.reviews",
        label: "التقييمات",
        subModuleId: "sub-crm-reviews",
        readEndpoint: "/api/admin/reviews/agent",
        screenId: "08",
      },
      {
        id: "domain.01.component.6.leaf.delete",
        label: "حذف الحسابات",
        screenId: "08",
      },
    ],
  },
  {
    id: "domain.01.component.7",
    label: "التسويق والنشر",
    color: "#38bdf8",
    angleDeg: -78,
    screenId: "09",
    relatedDomainIds: ["domain.01.component.5", "domain.01.component.10"],
    leaves: [
      {
        id: "domain.01.component.7.leaf.accounts",
        label: "الحسابات",
        subModuleId: "sub-pub-ads",
        readEndpoint: "/api/admin/ads",
        screenId: "10",
      },
      {
        id: "domain.01.component.7.leaf.calendar",
        label: "التقويم",
        subModuleId: "sub-pub-engine",
        screenId: "09",
      },
      {
        id: "domain.01.component.7.leaf.content",
        label: "المحتوى",
        subModuleId: "sub-pub-engine",
        screenId: "09",
      },
      {
        id: "domain.01.component.7.leaf.media",
        label: "الوسائط",
        screenId: "09",
      },
      {
        id: "domain.01.component.7.leaf.rss",
        label: "RSS",
        screenId: "09",
      },
      {
        id: "domain.01.component.7.leaf.campaigns",
        label: "الحملات",
        subModuleId: "sub-pub-email",
        readEndpoint: "/api/admin/ads/campaigns",
        screenId: "10",
      },
    ],
  },
  {
    id: "domain.01.ai",
    label: "الذكاء الاصطناعي",
    color: "#f59e0b",
    angleDeg: -118,
    screenId: "11",
    relatedDomainIds: ["domain.01.component.1", "domain.01.settings"],
    leaves: [
      {
        id: "domain.01.component.8",
        label: "غرفة الوكلاء",
        subModuleId: "sub-swarm-war-room",
        screenId: "11",
        specComponentId: "domain.01.component.8",
      },
      {
        id: "domain.01.ai.leaf.studio",
        label: "استوديو الوكلاء",
        subModuleId: "sub-swarm-studio",
        screenId: "11",
      },
      {
        id: "domain.01.ai.leaf.b2b-agent",
        label: "وكيل B2B",
        subModuleId: "sub-swarm-b2b-agent",
        screenId: "11",
      },
      {
        id: "domain.01.ai.leaf.security-agent",
        label: "وكيل الأمن",
        subModuleId: "sub-sec-license",
        screenId: "15",
      },
      {
        id: "domain.01.component.9",
        label: "الأتمتة",
        subModuleId: "sub-auto-hub",
        screenId: "12",
        specComponentId: "domain.01.component.9",
      },
    ],
  },
  {
    id: "domain.01.component.10",
    label: "المالية",
    color: "#22d3ee",
    angleDeg: -155,
    screenId: "13",
    relatedDomainIds: ["domain.01.component.1", "domain.01.component.11", "domain.01.legal"],
    leaves: [
      {
        id: "domain.01.component.10.leaf.pay",
        label: "الدفع",
        subModuleId: "sub-treasury-payments",
        readEndpoint: "/api/admin/payments/catalog",
        screenId: "13",
      },
      {
        id: "domain.01.component.10.leaf.fx",
        label: "العملات",
        subModuleId: "sub-treasury-currencies",
        screenId: "13",
      },
      {
        id: "domain.01.component.10.leaf.invoices",
        label: "الفواتير",
        subModuleId: "sub-treasury-invoices",
        readEndpoint: "/api/admin/finance/overview",
        screenId: "13",
      },
      {
        id: "domain.01.component.10.leaf.wallet",
        label: "محفظة B2B",
        subModuleId: "sub-treasury-wallet",
        screenId: "13",
      },
      {
        id: "domain.01.component.10.leaf.loyalty",
        label: "نقاط الولاء",
        screenId: "13",
      },
    ],
  },
  {
    id: "domain.01.legal",
    label: "الامتثال القانوني",
    color: "#e879f9",
    angleDeg: 168,
    screenId: "15",
    relatedDomainIds: ["domain.01.component.6", "domain.01.component.10", "domain.01.settings"],
    leaves: [
      { id: "domain.01.legal.leaf.identity", label: "الهوية", screenId: "15" },
      { id: "domain.01.legal.leaf.terms", label: "الشروط", screenId: "15" },
      { id: "domain.01.legal.leaf.privacy", label: "الخصوصية", screenId: "15" },
      { id: "domain.01.legal.leaf.gdpr", label: "GDPR", screenId: "15" },
    ],
  },
  {
    id: "domain.01.settings",
    label: "الإعدادات",
    color: "#67e8f9",
    angleDeg: 138,
    screenId: "16",
    relatedDomainIds: ["domain.01.legal", "domain.01.ai"],
    leaves: [
      {
        id: "domain.01.settings.leaf.smtp",
        label: "SMTP",
        readEndpoint: "/api/admin/email-settings",
        screenId: "16",
      },
      {
        id: "domain.01.settings.leaf.search",
        label: "مزودو البحث",
        screenId: "16",
      },
      {
        id: "domain.01.component.12",
        label: "PocketBase",
        subModuleId: "sub-sec-settings",
        readEndpoint: "/api/admin/pocketbase",
        screenId: "16",
        specComponentId: "domain.01.component.12",
      },
      {
        id: "domain.01.settings.leaf.i18n",
        label: "التراجم",
        screenId: "16",
      },
      {
        id: "domain.01.settings.leaf.media",
        label: "الوسائط",
        screenId: "16",
      },
    ],
  },
  {
    id: "domain.01.component.11",
    label: "إعادة البيع",
    color: "#fbbf24",
    angleDeg: 112,
    screenId: "14",
    relatedDomainIds: ["domain.01.component.10", "domain.01.component.1"],
    leaves: [
      {
        id: "domain.01.component.11.leaf.companies",
        label: "الشركات",
        subModuleId: "sub-b2b-companies",
        screenId: "14",
      },
      {
        id: "domain.01.component.11.leaf.whitelabel",
        label: "الوايت ليبل",
        subModuleId: "sub-b2b-whitelabel",
        screenId: "14",
      },
      {
        id: "domain.01.component.11.leaf.subs",
        label: "الاشتراكات",
        screenId: "14",
      },
      {
        id: "domain.01.component.11.leaf.wallets",
        label: "المحافظ",
        subModuleId: "sub-treasury-wallet",
        screenId: "14",
      },
      {
        id: "domain.01.component.11.leaf.domains",
        label: "النطاقات",
        screenId: "14",
      },
      {
        id: "domain.01.component.11.leaf.licenses",
        label: "التراخيص",
        readEndpoint: "/api/admin/resale/licenses",
        screenId: "14",
      },
      {
        id: "domain.01.component.11.leaf.updates",
        label: "التحديثات",
        screenId: "14",
      },
    ],
  },
];

function statusFromModule(mod: SubModuleNode | undefined): AtlasNodeStatus {
  if (!mod) return "unknown";
  if (mod.status === "online" || mod.status === "syncing" || mod.status === "warning" || mod.status === "locked") {
    return mod.status;
  }
  return "unknown";
}

export function atlasDomainDefs(): readonly AtlasDomainDef[] {
  return DOMAINS;
}

export function buildAtlasCatalog(): AtlasDomainView[] {
  return DOMAINS.map((domain) => {
    const leaves: AtlasLeafView[] = domain.leaves.map((leaf) => {
      const mod = leaf.subModuleId ? findSovereignSubModule(leaf.subModuleId) : undefined;
      const status = statusFromModule(mod);
      return {
        ...leaf,
        status,
        agentNameAr: mod?.assignedAgent.nameAr,
        httpMethod: mod?.httpMethod,
        readEndpoint: leaf.readEndpoint || mod?.apiEndpoint,
        evidenceRef: mod
          ? `sovereign:${mod.id}`
          : leaf.readEndpoint
            ? `route:${leaf.readEndpoint}`
            : "visual-label-only",
        relationType: "contains",
      };
    });
    return {
      ...domain,
      leaves,
      knownCount: leaves.filter((leaf) => leaf.status !== "unknown").length,
      unknownCount: leaves.filter((leaf) => leaf.status === "unknown").length,
    };
  });
}

export function findAtlasNode(
  catalog: AtlasDomainView[],
  id: string
): { domain: AtlasDomainView; leaf?: AtlasLeafView } | null {
  for (const domain of catalog) {
    if (domain.id === id) return { domain };
    const leaf = domain.leaves.find((item) => item.id === id);
    if (leaf) return { domain, leaf };
  }
  return null;
}

/** مواضع قطبية ثابتة. لا يُعاد توزيع العناقيد عند اختيار عقدة. */
export function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + Math.cos(rad) * radius,
    y: cy - Math.sin(rad) * radius,
  };
}

export function leafAngle(domainAngle: number, index: number, count: number) {
  if (count <= 1) return domainAngle;
  const spread = Math.min(20, (count - 1) * 3.6);
  const step = spread / (count - 1);
  return domainAngle - spread / 2 + index * step;
}
