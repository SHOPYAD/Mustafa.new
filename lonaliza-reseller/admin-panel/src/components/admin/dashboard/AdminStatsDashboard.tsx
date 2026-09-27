"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  UserCheck,
  ShoppingBag,
  Landmark,
  Share2,
  Bot,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

import { dashboardCopy } from "@/components/admin/dashboard/copy";
import AdminExecutiveCopilot from "@/components/admin/dashboard/AdminExecutiveCopilot";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/date-range-picker";
import { getActiveFlights, getFlights } from "@/data/flights";
import { getPosts } from "@/data/blog";
import { getHotels } from "@/data/hotels";
import { getPackages } from "@/data/packages";
import { getTours } from "@/data/tours";
import { getTransfers } from "@/data/transfers";
import { getVisaData } from "@/data/visa";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types/dashboard-stats";

import { OverviewTab } from "./modules/overview-tab";
import { AnalyticsTab } from "./modules/analytics-tab";
import { CrmTab } from "./modules/crm-tab";
import { EcommerceTab } from "./modules/ecommerce-tab";
import { FinanceTab } from "./modules/finance-tab";
import { AffiliateLoyaltySection } from "./modules/affiliate-loyalty-section";
import { AiInfrastructureSection } from "./modules/ai-infrastructure-section";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" data-slot="dashboard-skeleton">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

export function AdminStatsDashboard({
  statsEndpoint = "/api/admin/dashboard-stats",
  initialTab = "all",
}: {
  statsEndpoint?: string;
  initialTab?: string;
} = {}) {
  const { locale, dir } = useLocale();
  const copy = dashboardCopy(locale);
  const isAr = locale === "ar" || dir === "rtl";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab || "all");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [range, setRange] = useState<7 | 14>(14);

  const [catalog, setCatalog] = useState({
    hotels: 0,
    hotelsActive: 0,
    flights: 0,
    flightsActive: 0,
    packages: 0,
    packagesFeatured: 0,
    tours: 0,
    toursActive: 0,
    transfers: 0,
    transfersActive: 0,
    visa: 0,
    visaActive: 0,
    posts: 0,
    postsPublished: 0,
  });

  useEffect(() => {
    const hotels = getHotels();
    const flights = getFlights();
    const packages = getPackages();
    const tours = getTours();
    const transfers = getTransfers();
    const visa = getVisaData();
    const posts = getPosts();

    setCatalog({
      hotels: hotels.length,
      hotelsActive: hotels.filter((h) => h.isActive).length,
      flights: flights.length,
      flightsActive: getActiveFlights().length,
      packages: packages.length,
      packagesFeatured: packages.filter((p) => p.isFeatured).length,
      tours: tours.length,
      toursActive: tours.filter((t) => t.isActive !== false).length,
      transfers: transfers.length,
      transfersActive: transfers.filter((t) => t.isActive).length,
      visa: visa.length,
      visaActive: visa.filter((v) => v.isActive !== false).length,
      posts: posts.length,
      postsPublished: posts.filter((p) => p.status === "published").length,
    });
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch(statsEndpoint, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const json = (await res.json()) as { ok?: boolean; stats?: DashboardStats };
      if (!res.ok || !json.stats) {
        throw new Error("bad_response");
      }
      setStats(json.stats);
      setError("");
    } catch {
      setError(copy.loadFailed);
    }
  };

  useEffect(() => {
    void loadStats();
  }, [copy.loadFailed, statsEndpoint]);

  const showCopilot = !statsEndpoint?.includes("/preview");

  const tabsList = useMemo(
    () => [
      {
        id: "all",
        label: isAr ? "الكل (All)" : "All Dashboard",
        badge: isAr ? "شامل" : "Full",
        icon: Layers,
        color: "text-amber-500",
      },
      {
        id: "operations",
        label: isAr ? "العمليات والمخزون" : "Operations & Inventory",
        badge: isAr ? "فنادق وطيران" : "Hotels & Stays",
        icon: ShoppingBag,
        color: "text-purple-500",
      },
      {
        id: "finance",
        label: isAr ? "المالية والسيولة" : "Finance & Treasury",
        badge: isAr ? "بوابات ودفع" : "Payments",
        icon: Landmark,
        color: "text-emerald-500",
      },
      {
        id: "crm",
        label: isAr ? "علاقات العملاء وB2B" : "CRM & B2B Pipeline",
        badge: isAr ? "فرص وشركات" : "Leads",
        icon: UserCheck,
        color: "text-blue-500",
      },
      {
        id: "affiliate",
        label: isAr ? "الأفلييت ونقاط الولاء" : "Affiliate & Loyalty",
        badge: isAr ? "عمولات ومحافظ" : "Rewards",
        icon: Share2,
        color: "text-amber-500",
      },
      {
        id: "ai",
        label: isAr ? "الذكاء الاصطناعي والمزودين" : "AI & Infrastructure",
        badge: "Gemini",
        icon: Bot,
        color: "text-purple-400",
      },
      {
        id: "analytics",
        label: isAr ? "حركة الزوار والتحليلات" : "Visitors & Analytics",
        badge: isAr ? "مباشر" : "Live",
        icon: BarChart3,
        color: "text-cyan-500",
      },
    ],
    [isAr]
  );

  return (
    <AdminPage className="flex flex-col gap-6 pb-16" dir={isAr ? "rtl" : "ltr"} data-enterprise-dashboard="">
      {/* Dashboard Top Header */}
      <AdminPageHeader
        breadcrumb={
          <span>
            {isAr ? "لوحة القيادة التنفيذية" : "Executive Dashboard"}{" "}
            <span className="mx-1 opacity-50">/</span>{" "}
            {isAr ? "مركز العمليات والتحليلات الشامل" : "Enterprise Command Center"}
          </span>
        }
        icon={<LayoutDashboard className="size-5 text-amber-500" />}
        title={
          isAr
            ? "مركز العمليات والتحليلات الشامل (Enterprise Command Center)"
            : "Enterprise Command & Analytics Center"
        }
        description={
          isAr
            ? "لوحة تحكم تنفيذية متطورة توفر مؤشرات لحظية شاملة لكافة الخدمات السياحية والمالية والتقنية"
            : "Live operational and executive dashboard monitoring tourism inventory, payments, CRM, affiliate & AI infrastructure"
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <DateRangePicker />
            <Badge variant="outline" className="gap-1.5 py-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              {copy.live}
            </Badge>
            {stats ? (
              <Badge variant={stats.pocketbase ? "secondary" : "outline"} className="py-1">
                {stats.pocketbase ? copy.pocketbaseOn : copy.pocketbaseOff}
              </Badge>
            ) : null}
            {showCopilot ? (
              <Button
                variant={copilotOpen ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCopilotOpen(!copilotOpen)}
                className="gap-1.5 h-8 text-xs font-medium border-border/80"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                <span>{copilotOpen ? (isAr ? "إخفاء المساعد AI" : "Hide Copilot") : (isAr ? "المساعد الذكي AI" : "AI Copilot")}</span>
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadStats()}
              className="h-8 gap-1 text-xs"
              title={isAr ? "تحديث كافة الإحصائيات" : "Refresh all"}
            >
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        }
      />

      {showCopilot && copilotOpen ? <AdminExecutiveCopilot /> : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{copy.loadFailed}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!error && !stats ? <DashboardSkeleton /> : null}

      {stats ? (
        <div className="flex flex-col gap-6">
          {/* Top Tabs Bar (Styled beautifully with badges, icons & pill buttons) */}
          <div className="border-b border-border/40 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar flex-nowrap py-1">
              {tabsList.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card/70 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive ? "text-primary-foreground" : tab.color)} />
                    <span>{tab.label}</span>
                    {tab.badge ? (
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB: ALL (Renders all sections sequentially in one continuous master view) */}
          {activeTab === "all" && (
            <div className="flex flex-col gap-8">
              {/* 1. Executive KPIs */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-4 text-amber-500" />
                    <h3 className="text-base font-bold text-foreground">
                      {isAr ? "1. المؤشرات التنفيذية وأداء المنصة العام" : "1. Executive KPIs & Platform Performance"}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs font-normal">
                    {isAr ? "محدث لحظياً" : "Real-time Live"}
                  </Badge>
                </div>
                <OverviewTab
                  stats={stats}
                  copy={copy}
                  locale={locale}
                  catalog={catalog}
                  range={range}
                />
              </div>

              {/* 2. Operations & Inventory */}
              <div className="flex flex-col gap-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-purple-500" />
                    <h3 className="text-base font-bold text-foreground">
                      {isAr ? "2. العمليات السياحية، المخزون والحجوزات الحية" : "2. Tourism Operations, Inventory & Orders"}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "فنادق • طيران • بكجات • مواصلات • سيارات • تأشيرات" : "Hotels • Flights • Packages • Transfers • Cars • Visa"}
                  </span>
                </div>
                <EcommerceTab stats={stats} locale={locale} />
              </div>

              {/* 3. Finance & Cashflow */}
              <div className="flex flex-col gap-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="size-4 text-emerald-500" />
                    <h3 className="text-base font-bold text-foreground">
                      {isAr ? "3. الإدارة المالية، البوابات والتدفقات النقدية" : "3. Treasury, Gateways & Cash Flow"}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "إيزيكو • سترايب • الحسابات البنكية • الأرباح الصافية" : "Iyzico • Stripe • Bank Accounts • Net Margins"}
                  </span>
                </div>
                <FinanceTab />
              </div>

              {/* 4. CRM & B2B Pipeline */}
              <div className="flex flex-col gap-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-4 text-blue-500" />
                    <h3 className="text-base font-bold text-foreground">
                      {isAr ? "4. إدارة علاقات العملاء وقمع مبيعات الشركات B2B" : "4. CRM, Leads & Corporate B2B Pipeline"}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "العملاء المحتملون • العقود • خطوط الائتمان" : "Leads • Pipeline • B2B Credit Lines"}
                  </span>
                </div>
                <CrmTab />
              </div>

              {/* 5. Affiliate & Loyalty */}
              <div className="flex flex-col gap-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="size-4 text-amber-500" />
                    <h3 className="text-base font-bold text-foreground">
                      {isAr ? "5. شبكة المسوقين بالعمولة ومحافظ نقاط الولاء" : "5. Affiliate Marketers & Customer Loyalty Wallets"}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "إحالات الروابط • العمولات • النقاط المستبدلة" : "Referrals • Commissions • Point Redemption"}
                  </span>
                </div>
                <AffiliateLoyaltySection stats={stats} locale={locale} />
              </div>

              {/* 6. AI Infrastructure & Providers */}
              <div className="flex flex-col gap-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="size-4 text-purple-500" />
                    <h3 className="text-base font-bold text-foreground">
                      {isAr ? "6. منظومة وكلاء الذكاء الاصطناعي، استهلاك التوكنز والربط مع المزودين" : "6. AI Agents, Gemini Tokens & Global GDS Health"}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "Gemini 2.5 • Hotelbeds • Travelport • RateHawk • Seeru" : "Gemini 2.5 • Hotelbeds • Travelport • RateHawk • Seeru"}
                  </span>
                </div>
                <AiInfrastructureSection locale={locale} />
              </div>

              {/* 7. Live Visitors & Analytics */}
              <div className="flex flex-col gap-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-cyan-500" />
                    <h3 className="text-base font-bold text-foreground">
                      {isAr ? "7. حركة الزوار الحية، مصادر الترافيك وجودة الزيارات" : "7. Live Traffic, Visitor Sources & Quality Metrics"}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "الزوار النشطون • البلدان • المتصفحات • مسارات التحويل" : "Active Users • Geography • Devices • Conversion Funnel"}
                  </span>
                </div>
                <AnalyticsTab />
              </div>
            </div>
          )}

          {/* TAB: OPERATIONS */}
          {activeTab === "operations" && (
            <div className="flex flex-col gap-6">
              <OverviewTab
                stats={stats}
                copy={copy}
                locale={locale}
                catalog={catalog}
                range={range}
              />
              <EcommerceTab stats={stats} locale={locale} />
            </div>
          )}

          {/* TAB: FINANCE */}
          {activeTab === "finance" && (
            <div className="flex flex-col gap-6">
              <FinanceTab />
            </div>
          )}

          {/* TAB: CRM */}
          {activeTab === "crm" && (
            <div className="flex flex-col gap-6">
              <CrmTab />
            </div>
          )}

          {/* TAB: AFFILIATE */}
          {activeTab === "affiliate" && (
            <div className="flex flex-col gap-6">
              <AffiliateLoyaltySection stats={stats} locale={locale} />
            </div>
          )}

          {/* TAB: AI & INFRASTRUCTURE */}
          {activeTab === "ai" && (
            <div className="flex flex-col gap-6">
              <AiInfrastructureSection locale={locale} />
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-6">
              <AnalyticsTab />
            </div>
          )}
        </div>
      ) : null}
    </AdminPage>
  );
}
