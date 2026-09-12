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
  Hotel,
  Image,
  Inbox,
  KeyRound,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  Library,
  Link2,
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
  Scan,
  Search,
  Settings,
  Share2,
  Smartphone,
  Sparkles,
  Store,
  Timer,
  Ticket,
  Truck,
  Undo2,
  Users,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";

export type NavGroupId =
  | "overview"
  | "bookings"
  | "customers"
  | "services"
  | "marketing"
  | "resale"
  | "system"
  | "settings";

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
  return [
    {
      id: "overview",
      label: admin.overview,
      icon: LayoutDashboard,
      branches: [
        {
          id: "overview-main",
          label: "",
          items: [leaf("dashboard", admin.dashboard, "/admin", LayoutDashboard, { exact: true })],
        },
      ],
    },
    {
      id: "bookings",
      label: admin.bookings,
      icon: Inbox,
      branches: [
        {
          id: "bookings-main",
          label: "",
          items: [
            leaf("bookings-all", admin.bookings, "/admin/bookings", Inbox, { badge: "bookings" }),
            leaf("cancellations", admin.cancellations, "/admin/cancellations", Undo2),
          ],
        },
      ],
    },
    {
      id: "customers",
      label: admin.navCustomers,
      icon: Users,
      branches: [
        {
          id: "customers-main",
          label: "",
          items: [leaf("customers", admin.customers, "/admin/customers", Users)],
        },
      ],
    },
    {
      id: "services",
      label: admin.contentServices,
      icon: Package,
      branches: [
        {
          id: "services-catalog",
          label: admin.services,
          items: [
            leaf("hotels", admin.hotels, "/admin/hotels", Hotel),
            leaf("hotels-markup", admin.hotelsMarkupNav, "/admin/hotels#markup", BadgePercent),
            leaf("flights", admin.flights, "/admin/flights", Plane),
            leaf("packages", admin.packages, "/admin/packages", Package),
            leaf("transfers", admin.transfers, "/admin/transfers", Car),
            leaf("cars", admin.cars, "/admin/cars", Car),
            leaf("tours", admin.tours, "/admin/tours", MapPin),
            leaf("visa", admin.visa, "/admin/visa", FileText),
          ],
        },
        {
          id: "services-content",
          label: admin.siteContent,
          items: [
            leaf("homepage", admin.visualAiEditor, "/admin/homepage-editor", Scan),
            leaf("pages", admin.pages, "/admin/pages", FileText),
            leaf("blog", admin.blog, "/admin/blog", Newspaper),
            leaf("content-control", admin.contentControl, "/admin/content", LayoutGrid),
          ],
        },
      ],
    },
    {
      id: "marketing",
      label: admin.marketing,
      icon: Megaphone,
      branches: [
        {
          id: "marketing-main",
          label: "",
          items: [
            leaf("automation-studio", admin.automationStudio, "/admin/automation-studio", Sparkles, {
              description: admin.automationStudioDesc,
            }),
            leaf("automation-hub", admin.automation, "/admin/automation", Timer, {
              description: admin.automationDesc,
            }),
            leaf("email-marketing", admin.emailMarketing, "/admin/email-marketing", Megaphone),
            leaf("paid-ads", admin.paidAds, "/admin/ads", Megaphone),
            leaf("comms", admin.commsAutomation, "/admin/automation", MessageCircle),
            leaf("coupons", admin.coupons, "/admin/marketing/coupons", Ticket),
            leaf("affiliate", admin.affiliate, "/admin/affiliate", BadgePercent),
            leaf("social-accounts", admin.socialAccounts, "/admin/social-accounts", Share2, {
              description: admin.socialAccountsDesc,
            }),
            leaf("contact", admin.contactSettings, "/admin/contact-settings", Share2),
          ],
        },
      ],
    },
    {
      id: "resale",
      label: admin.resale,
      icon: Store,
      branches: [
        {
          id: "resale-main",
          label: "",
          items: [
            leaf("resale-overview", admin.resale, "/admin/resale", Store, { exact: true }),
            leaf("resale-companies", admin.resaleCompanies, "/admin/resale/companies", Building2),
            leaf("resale-delivery", admin.resaleDelivery, "/admin/resale/delivery", Truck),
            leaf("resale-licenses", admin.resaleLicenses, "/admin/resale/licenses", KeyRound),
            leaf("resale-updates", admin.resaleUpdates, "/admin/resale/updates", RefreshCw),
            leaf("resale-settings", admin.resaleSettings, "/admin/resale/settings", Settings),
          ],
        },
      ],
    },
    {
      id: "system",
      label: admin.system,
      icon: Database,
      branches: [
        {
          id: "system-main",
          label: "",
          items: [
            leaf("search-providers", admin.searchProviders, "/admin/providers", Plug),
            leaf("integrations", admin.integrations, "/admin/integrations", Link2),
            leaf("pocketbase", admin.pocketbase, "/admin/pocketbase", Database),
            leaf("ai-settings", admin.aiSettings, "/admin/ai-settings", Sparkles),
            leaf("ai-programs", admin.aiPrograms, "/admin/ai-programs", Bookmark),
            leaf("builder-agent", admin.builderAgent, "/admin/builder-agent", Brain),
            leaf("automation", admin.automation, "/admin/automation", Timer),
            leaf("media-keys-sys", admin.mediaKeys, "/admin/media", Image),
            leaf("icons", admin.iconLibrary, "/admin/icons", Library),
          ],
        },
      ],
    },
    {
      id: "settings",
      label: admin.settings,
      icon: Settings,
      branches: [
        {
          id: "settings-hub",
          label: "",
          items: [leaf("settings-all", admin.allSettings, "/admin/settings", Settings, { exact: true })],
        },
        {
          id: "settings-mail",
          label: admin.settingsMail,
          items: [
            leaf("smtp", admin.smtpEmail, "/admin/email", Mail, { description: admin.smtpEmailDesc }),
            leaf("email-mkt", admin.emailMarketing, "/admin/email-marketing", Megaphone, {
              description: admin.emailMarketingDesc,
            }),
            leaf("comms-mail", admin.commsAutomation, "/admin/automation", MessageCircle, {
              description: admin.commsAutomationDesc,
            }),
          ],
        },
        {
          id: "settings-commerce",
          label: admin.settingsCommerce,
          items: [
            leaf("payments", admin.payments, "/admin/payments", CreditCard, {
              description: admin.paymentsDesc,
            }),
            leaf("currencies", admin.currencies, "/admin/currencies", Coins, {
              description: admin.currenciesDesc,
            }),
            leaf("loyalty-points", admin.loyaltyPoints, "/admin/marketing/coupons", Ticket, {
              description: admin.couponsDesc,
            }),
            leaf("invoices", admin.invoiceTemplates, "/admin/invoices", Receipt, {
              description: admin.invoiceTemplatesDesc,
            }),
          ],
        },
        {
          id: "settings-locale",
          label: admin.settingsLocale,
          items: [
            leaf("translations", admin.translations, "/admin/translations", Languages, {
              description: admin.translationsDesc,
            }),
          ],
        },
        {
          id: "settings-site",
          label: admin.settingsSite,
          items: [
            leaf("social-accounts-s", admin.socialAccounts, "/admin/social-accounts", Share2, {
              description: admin.socialAccountsDesc,
            }),
            leaf("contact-settings", admin.contactSettings, "/admin/contact-settings", Share2, {
              description: admin.contactSettingsDesc,
            }),
            leaf("menu", admin.menuVisibility, "/admin/content#menu", Menu, {
              description: admin.menuVisibilityDesc,
            }),
            leaf("search-tabs", admin.searchTabs, "/admin/search-tabs", Search, {
              description: admin.searchTabsDesc,
            }),
            leaf("pwa", admin.pwaApp, "/admin/pwa", Smartphone, {
              description: admin.pwaDesc,
            }),
            leaf("content", admin.contentControl, "/admin/content", LayoutGrid, {
              description: admin.contentControlDesc,
            }),
          ],
        },
        {
          id: "settings-system",
          label: admin.settingsSystem,
          items: [
            leaf("search-providers-s", admin.searchProviders, "/admin/providers", Plug, {
              description: admin.searchProvidersDesc,
            }),
            leaf("int", admin.integrations, "/admin/integrations", Link2, {
              description: admin.integrationsDesc,
            }),
            leaf("pb", admin.pocketbase, "/admin/pocketbase", Database, {
              description: admin.pocketbaseDesc,
            }),
            leaf("ai-s", admin.aiSettings, "/admin/ai-settings", Sparkles, {
              description: admin.aiSettingsDesc,
            }),
            leaf("ai-p", admin.aiPrograms, "/admin/ai-programs", Bookmark, {
              description: admin.aiProgramsDesc,
            }),
            leaf("builder-agent-s", admin.builderAgent, "/admin/builder-agent", Brain, {
              description: admin.builderAgentDesc,
            }),
            leaf("automation-s", admin.automation, "/admin/automation", Timer, {
              description: admin.automationDesc,
            }),
            leaf("media-keys", admin.mediaKeys, "/admin/media", Image, {
              description: admin.mediaKeysDesc,
            }),
            leaf("icon-lib", admin.iconLibrary, "/admin/icons", Library, {
              description: admin.iconLibraryDesc,
            }),
          ],
        },
      ],
    },
  ];
}

export function buildSettingsHub(admin: AdminCopy): NavBranch[] {
  return buildAdminNav(admin)
    .find((group) => group.id === "settings")
    ?.branches.filter((branch) => branch.id !== "settings-hub") ?? [];
}
