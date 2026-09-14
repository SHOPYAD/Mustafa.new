import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Bookmark,
  Brain,
  Building2,
  Car,
  Coins,
  CreditCard,
  Database,
  FileText,
  Globe,
  Hotel,
  Image,
  Inbox,
  KeyRound,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  Library,
  Link2,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Menu,
  Newspaper,
  Package,
  Plane,
  Plug,
  Receipt,
  RefreshCw,
  Scale,
  Scan,
  Search,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Timer,
  Ticket,
  Truck,
  Undo2,
  Users,
  Wallet,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";

export type NavGroupId =
  | "overview"
  | "bookings"
  | "inventory"
  | "storefront"
  | "customers"
  | "marketing"
  | "ai_center"
  | "finance"
  | "legal"
  | "system"
  | "resale";

export type NavLeaf = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: "bookings";
  exact?: boolean;
};

export type NavBranch = {
  id: string;
  label: string;
  items: NavLeaf[];
};

export type NavGroup = {
  id: NavGroupId;
  label: string;
  icon: LucideIcon;
  branches: NavBranch[];
};

type AdminCopy = Dictionary["admin"];

export function isNavActive(pathname: string, item: Pick<NavLeaf, "href" | "exact">): boolean {
  const href = item.href.split("#")[0] || item.href;
  if (item.exact || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function flattenNavLeaves(groups: NavGroup[]): NavLeaf[] {
  return groups.flatMap((group) => group.branches.flatMap((branch) => branch.items));
}

export function findCurrentNavLabel(pathname: string, groups: NavGroup[]): string | undefined {
  const matches = flattenNavLeaves(groups).filter((item) => isNavActive(pathname, item));
  matches.sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.label;
}

export function groupIdForPath(pathname: string, groups: NavGroup[]): NavGroupId | null {
  let best: { id: NavGroupId; length: number } | null = null;
  for (const group of groups) {
    for (const branch of group.branches) {
      for (const item of branch.items) {
        if (!isNavActive(pathname, item)) continue;
        const length = item.href.split("#")[0]?.length ?? 0;
        if (!best || length > best.length) best = { id: group.id, length };
      }
    }
  }
  return best?.id ?? null;
}

function leaf(
  id: string,
  label: string,
  href: string,
  icon: LucideIcon,
  extra?: Partial<NavLeaf>
): NavLeaf {
  return { id, label, href, icon, ...extra };
}

export function buildAdminNav(admin: AdminCopy): NavGroup[] {
  const groups: NavGroup[] = [
    // 1. الرئيسية والمؤشرات (Overview & Metrics)
    {
      id: "overview",
      label: admin.overview || "الرئيسية والمؤشرات",
      icon: LayoutDashboard,
      branches: [
        {
          id: "overview-main",
          label: "",
          items: [leaf("dashboard", admin.dashboard || "لوحة المؤشرات العامة", "/admin", LayoutDashboard, { exact: true })],
        },
      ],
    },

    // 2. الحجوزات والعمليات (Bookings & Operations)
    {
      id: "bookings",
      label: admin.bookings || "الحجوزات والعمليات",
      icon: Inbox,
      branches: [
        {
          id: "bookings-main",
          label: "",
          items: [
            leaf("bookings-all", admin.bookings || "جميع الحجوزات", "/admin/bookings", Inbox, { badge: "bookings" }),
            leaf("cancellations", admin.cancellations || "طلبات الإلغاء والاسترداد", "/admin/cancellations", Undo2),
            leaf("customer-reviews", "تقييمات العملاء الموثقة", "/admin/reviews", Star),
          ],
        },
      ],
    },

    // 3. المنتجات والخدمات السياحية (Travel Inventory)
    {
      id: "inventory",
      label: admin.services || "المنتجات والخدمات السياحية",
      icon: Package,
      branches: [
        {
          id: "inventory-hotels-flights",
          label: "الفنادق والطيران والبرامج",
          items: [
            leaf("hotels", "مزودو ومارك أب الفنادق", "/admin/hotels", Hotel, { exact: true }),
            leaf("hotels-catalog", "الكتالوج الداخلي للفنادق", "/admin/hotels/catalog", Building2),
            leaf("hotels-reviews", "تقييمات الفنادق ووكيل تريب أدفايزر", "/admin/reviews", Star),
            leaf("flights", admin.flights || "تذاكر الطيران وموزعو GDS", "/admin/flights", Plane),
            leaf("packages", admin.packages || "الباقات والعروض السياحية", "/admin/packages", Package),
          ],
        },
        {
          id: "inventory-ground-services",
          label: "التنقل والجولات والفيزا",
          items: [
            leaf("transfers", admin.transfers || "المواصلات والاستقبال", "/admin/transfers", Car),
            leaf("cars", admin.cars || "تأجير السيارات", "/admin/cars", Car),
            leaf("tours", admin.tours || "الجولات والرحلات اليومية", "/admin/tours", MapPin),
            leaf("visa", admin.visa || "خدمات التأشيرات", "/admin/visa", FileText),
          ],
        },
      ],
    },

    // 4. المحتوى وواجهة المنصة (Storefront & CMS)
    {
      id: "storefront",
      label: admin.siteContent || "المحتوى وواجهة المنصة",
      icon: LayoutGrid,
      branches: [
        {
          id: "storefront-main",
          label: "",
          items: [
            leaf("homepage", admin.visualAiEditor || "المحرر المرئي الذكي للرئيسية", "/admin/homepage-editor", Scan),
            leaf("pages", admin.pages || "الصفحات الثابتة والمقالات", "/admin/pages", FileText),
            leaf("blog", admin.blog || "المدونة الإخبارية والسياحية", "/admin/blog", Newspaper),
            leaf("content-control", admin.contentControl || "التحكم في ظهور الأقسام", "/admin/content", LayoutGrid),
            leaf("search-tabs", admin.searchTabs || "تبويبات ومحركات البحث", "/admin/search-tabs", Search),
            leaf("pwa", admin.pwaApp || "تطبيق الويب التفاعلي (PWA)", "/admin/pwa", Smartphone),
            leaf("mobile-app", "تطبيق الجوال لوناليزا", "/admin/mobile-app", Smartphone),
          ],
        },
      ],
    },

    // 5. العملاء وحماية البيانات (Customers & GDPR)
    {
      id: "customers",
      label: admin.navCustomers || "العملاء وحماية البيانات",
      icon: Users,
      branches: [
        {
          id: "customers-main",
          label: "",
          items: [
            leaf("customers", admin.customers || "سجل العملاء والمسافرين", "/admin/customers", Users),
            leaf("customer-reviews-mgmt", "تقييمات العملاء والنزلاء الموثقة", "/admin/reviews", Star, {
              description: "اعتماد ومراقبة تقييمات المسافرين ونزلاء الفنادق الحقيقية",
            }),
            leaf("deletion-requests", "طلبات حذف الحسابات ومحو البيانات (GDPR)", "/admin/legal?tab=deletions", ShieldAlert, {
              description: "إدارة طلبات حذف العملاء، فترات الحفظ، والحذف النهائي الجماعي",
            }),
          ],
        },
      ],
    },

    // 6. التسويق والنمو والمجتمع (Marketing & Growth)
    {
      id: "marketing",
      label: admin.marketing || "التسويق والنمو والمجتمع",
      icon: Megaphone,
      branches: [
        {
          id: "marketing-growth",
          label: "الحملات والعروض",
          items: [
            leaf("email-marketing", admin.emailMarketing || "التسويق عبر البريد الإلكتروني", "/admin/email-marketing", Mail),
            leaf("paid-ads", admin.paidAds || "الإعلانات المدفوعة", "/admin/ads", Megaphone),
            leaf("coupons", admin.coupons || "كوبونات الخصم وقسائم الشراء", "/admin/marketing/coupons", Ticket),
            leaf("affiliate", admin.affiliate || "برنامج التسويق بالعمولة (Affiliate)", "/admin/affiliate", BadgePercent),
            leaf("gift-cards", "بطاقات الهدايا", "/admin/gift-cards", Ticket),
          ],
        },
        {
          id: "marketing-social",
          label: "القنوات وشبكات التواصل",
          items: [
            leaf("social-accounts", admin.socialAccounts || "حسابات التواصل الاجتماعي", "/admin/social-accounts", Share2, {
              description: admin.socialAccountsDesc,
            }),
            leaf("social-community", "مجتمع السوشيال ميديا (Nostr)", "/admin/social-community", Share2, {
              description: "إدارة ريلايز النوستر، الفئات السياحية، نقاط المكافآت والمحفظة",
            }),
            leaf("contact", admin.contactSettings || "قنوات التواصل وخدمة العملاء", "/admin/contact-settings", MessageCircle),
          ],
        },
      ],
    },

    // 7. مركز الذكاء الاصطناعي والوكلاء (AI Agents & Studio)
    {
      id: "ai_center",
      label: "الذكاء الاصطناعي والوكلاء",
      icon: Brain,
      branches: [
        {
          id: "ai-agents-hub",
          label: "الوكلاء وغرفة العمليات",
          items: [
            leaf("tripadvisor-reviews-agent", "وكيل تقييمات TripAdvisor والنزلاء", "/admin/reviews", Star, {
              description: "مراقبة وتشغيل وكيل زحف وترجمة وحقن تقييمات تريب أدفايزر",
            }),
            leaf("agent-war-room", "غرفة عمليات الوكلاء (War Room)", "/admin/agent-war-room", Sparkles, {
              description: "مركز التنسيق والنقاش اللحظي بين كافة وكلاء الذكاء الاصطناعي",
            }),
            leaf("b2b-landing-agent", "وكيل B2B لصفحة الهبوط", "/admin/b2b-landing-agent", Building2, {
              description: "إدارة الشات العائم ومحرك الجدوى الاقتصادية للشركات",
            }),
            leaf("builder-agent", admin.builderAgent || "وكيل البناء والمطور الذكي", "/admin/builder-agent", Brain, {
              description: admin.builderAgentDesc,
            }),
          ],
        },
        {
          id: "ai-automation-models",
          label: "الأتمتة والنماذج",
          items: [
            leaf("automation-studio", admin.automationStudio || "استوديو الأتمتة المتقدم", "/admin/automation-studio", Sparkles, {
              description: admin.automationStudioDesc,
            }),
            leaf("automation-hub", admin.automation || "مهام الأتمتة المجدولة", "/admin/automation", Timer, {
              description: admin.automationDesc,
            }),
            leaf("ai-settings", admin.aiSettings || "إعدادات نماذج الذكاء الاصطناعي", "/admin/ai-settings", Sparkles),
            leaf("ai-programs", admin.aiPrograms || "برامج ومهارات الذكاء الاصطناعي", "/admin/ai-programs", Bookmark),
          ],
        },
      ],
    },

    // 8. المالية والفوترة والتجارة (Finance & Commerce)
    {
      id: "finance",
      label: "المالية والفوترة والتجارة",
      icon: CreditCard,
      branches: [
        {
          id: "finance-main",
          label: "",
          items: [
            leaf("payments", admin.payments || "بوابات الدفع الإلكتروني", "/admin/payments", CreditCard, {
              description: admin.paymentsDesc,
            }),
            leaf("currencies", admin.currencies || "العملات وأسعار الصرف", "/admin/currencies", Coins, {
              description: admin.currenciesDesc,
            }),
            leaf("invoices", admin.invoiceTemplates || "قوالب وفواتير الحجوزات", "/admin/invoices", Receipt, {
              description: admin.invoiceTemplatesDesc,
            }),
            leaf("b2b-wallet", "محفظة التوريد والديبوزيت B2B", "/admin/b2b-wallet", Wallet, {
              description: "إدارة رصيد التوريد المركزي، شحن الديبوزيت، ومتابعة خصم تذاكر وحجوزات المنصة",
            }),
            leaf("loyalty-points", admin.loyaltyPoints || "نقاط الولاء والمكافآت", "/admin/marketing/coupons", Ticket, {
              description: admin.couponsDesc,
            }),
          ],
        },
      ],
    },

    // 9. الامتثال القانوني وهوية المنصة (Legal & Identity)
    {
      id: "legal",
      label: "الامتثال القانوني والـ GDPR",
      icon: ShieldCheck,
      branches: [
        {
          id: "legal-main",
          label: "",
          items: [
            leaf("legal-all", "المركز القانوني الموحد والوكيل المشرف", "/admin/legal", ShieldCheck, {
              description: "مركز إدارة الهوية، الشروط، سياسة الخصوصية، وبوابة الـ GDPR وحذف الحسابات",
              exact: true,
            }),
            leaf("legal-identity", "هوية المنصة والاسم القانوني", "/admin/legal?tab=identity", Building2),
            leaf("legal-terms", "شروط الاستخدام وقواعد الطيران", "/admin/legal?tab=terms", Scale),
            leaf("legal-privacy", "سياسة الخصوصية ومعالجة البيانات", "/admin/legal?tab=privacy", FileText),
            leaf("legal-gdpr", "لوائح الـ GDPR وحقوق المسافر", "/admin/legal?tab=gdpr", Lock),
          ],
        },
      ],
    },

    // 10. إعدادات النظام والربط التقني (Settings & System)
    {
      id: "system",
      label: admin.settings || "إعدادات النظام والربط التقني",
      icon: Settings,
      branches: [
        {
          id: "system-main",
          label: "",
          items: [
            leaf("settings-all", admin.allSettings || "لوحة كافة الإعدادات", "/admin/settings", Settings, { exact: true }),
            leaf("smtp", admin.smtpEmail || "خادم البريد (SMTP)", "/admin/email", Mail, { description: admin.smtpEmailDesc }),
            leaf("search-providers", admin.searchProviders || "مزودو البحث والربط الخارجي", "/admin/providers", Plug, {
              description: admin.searchProvidersDesc,
            }),
            leaf("integrations", admin.integrations || "الربط البرمجي والـ Webhooks", "/admin/integrations", Link2, {
              description: admin.integrationsDesc,
            }),
            leaf("pocketbase", admin.pocketbase || "قاعدة بيانات PocketBase", "/admin/pocketbase", Database, {
              description: admin.pocketbaseDesc,
            }),
            leaf("translations", admin.translations || "ترجمات ولغات المنصة", "/admin/translations", Languages, {
              description: admin.translationsDesc,
            }),
            leaf("media-keys", admin.mediaKeys || "مفاتيح وخزائن الوسائط", "/admin/media", Image, {
              description: admin.mediaKeysDesc,
            }),
            leaf("icons", admin.iconLibrary || "مكتبة الأيقونات والرموز", "/admin/icons", Library, {
              description: admin.iconLibraryDesc,
            }),
          ],
        },
      ],
    },

    // 11. منصة التوزيع والشركات التابعة (White-label & Resale)
    {
      id: "resale",
      label: admin.resale || "منصة التوزيع والشركات التابعة",
      icon: Store,
      branches: [
        {
          id: "resale-main",
          label: "",
          items: [
            leaf("resale-overview", admin.resale, "/admin/resale", Store, { exact: true }),
            leaf("resale-whitelabel", "إعدادات وهوامش الوايت ليبل", "/admin/resale/whitelabel", Sparkles),
            leaf("resale-subscriptions", "اشتراكات الشركاء والفوترة", "/admin/resale/subscriptions", CreditCard),
            leaf("resale-wallets", "محافظ الشركاء B2B", "/admin/resale/wallets", Coins),
            leaf("resale-bookings", "سجل حجوزات B2B", "/admin/resale/bookings", Ticket),
            leaf("resale-domains", "طلبات النطاقات المخصصة", "/admin/resale/domains", Globe),
            leaf("resale-companies", admin.resaleCompanies, "/admin/resale/companies", Building2),
            leaf("resale-delivery", admin.resaleDelivery, "/admin/resale/delivery", Truck),
            leaf("resale-licenses", admin.resaleLicenses, "/admin/resale/licenses", KeyRound),
            leaf("resale-updates", admin.resaleUpdates, "/admin/resale/updates", RefreshCw),
            leaf("resale-settings", admin.resaleSettings, "/admin/resale/settings", Settings),
          ],
        },
      ],
    },
  ];

  const isClientInstance = (process.env.NEXT_PUBLIC_DEPLOYMENT_ROLE || "origin") === "client";
  if (isClientInstance) {
    return groups.filter((g) => g.id !== "resale");
  }

  return groups;
}

export function buildSettingsHub(admin: AdminCopy): NavBranch[] {
  return [
    {
      id: "hub-system",
      label: admin.settingsSystem || "النظام والربط وقواعد البيانات",
      items: [
        leaf("search-providers-hub", admin.searchProviders || "مزودو البحث", "/admin/providers", Plug, {
          description: admin.searchProvidersDesc,
        }),
        leaf("int-hub", admin.integrations || "الربط البرمجي", "/admin/integrations", Link2, {
          description: admin.integrationsDesc,
        }),
        leaf("pb-hub", admin.pocketbase || "قاعدة البيانات", "/admin/pocketbase", Database, {
          description: admin.pocketbaseDesc,
        }),
        leaf("media-keys-hub", admin.mediaKeys || "مفاتيح الوسائط", "/admin/media", Image, {
          description: admin.mediaKeysDesc,
        }),
        leaf("icon-lib-hub", admin.iconLibrary || "مكتبة الأيقونات", "/admin/icons", Library, {
          description: admin.iconLibraryDesc,
        }),
      ],
    },
    {
      id: "hub-comms",
      label: admin.settingsMail || "البريد والمراسلات",
      items: [
        leaf("smtp-hub", admin.smtpEmail || "خادم البريد SMTP", "/admin/email", Mail, { description: admin.smtpEmailDesc }),
        leaf("email-mkt-hub", admin.emailMarketing || "التسويق عبر البريد", "/admin/email-marketing", Megaphone, {
          description: admin.emailMarketingDesc,
        }),
        leaf("contact-hub", admin.contactSettings || "إعدادات التواصل", "/admin/contact-settings", Share2, {
          description: admin.contactSettingsDesc,
        }),
      ],
    },
    {
      id: "hub-commerce",
      label: admin.settingsCommerce || "التجارة والمدفوعات والعملات",
      items: [
        leaf("payments-hub", admin.payments || "بوابات الدفع", "/admin/payments", CreditCard, {
          description: admin.paymentsDesc,
        }),
        leaf("currencies-hub", admin.currencies || "العملات وأسعار الصرف", "/admin/currencies", Coins, {
          description: admin.currenciesDesc,
        }),
        leaf("invoices-hub", admin.invoiceTemplates || "قوالب الفواتير", "/admin/invoices", Receipt, {
          description: admin.invoiceTemplatesDesc,
        }),
        leaf("loyalty-hub", admin.loyaltyPoints || "نقاط الولاء", "/admin/marketing/coupons", Ticket, {
          description: admin.couponsDesc,
        }),
      ],
    },
    {
      id: "hub-legal-locale",
      label: "الهوية والامتثال القانوني واللغات",
      items: [
        leaf("legal-hub", "الشروط والخصوصية والـ GDPR وحذف الحسابات", "/admin/legal", ShieldCheck, {
          description: "تخصيص الشروط والخصوصية واللوائح القانونية وهوية الشركة وإدارة طلبات حذف الحسابات",
        }),
        leaf("translations-hub", admin.translations || "ترجمات المنصة", "/admin/translations", Languages, {
          description: admin.translationsDesc,
        }),
        leaf("search-tabs-hub", admin.searchTabs || "تبويبات البحث", "/admin/search-tabs", Search, {
          description: admin.searchTabsDesc,
        }),
        leaf("pwa-hub", admin.pwaApp || "تطبيق الويب PWA", "/admin/pwa", Smartphone, {
          description: admin.pwaDesc,
        }),
      ],
    },
  ];
}
