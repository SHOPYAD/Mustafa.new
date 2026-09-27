"use client";

import { useState } from "react";
import { 
  BarChart3, 
  CreditCard, 
  Globe, 
  Hotel, 
  Plane, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Wallet as WalletIcon,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  Activity,
  Layers,
  ShoppingBag,
  Server,
  Truck,
  CheckSquare
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Default Dashboard Components
import { MetricCards } from "@/app/admin/dashboard/default/_components/metric-cards";
import { PerformanceOverview } from "@/app/admin/dashboard/default/_components/performance-overview";
import { SubscriberOverview } from "@/app/admin/dashboard/default/_components/subscriber-overview";

// Legacy Finance V1 Components
import { CashFlowOverview } from "@/app/admin/dashboard/(legacy)/finance-v1/_components/cash-flow-overview";
import { CardOverview } from "@/app/admin/dashboard/(legacy)/finance-v1/_components/card-overview";
import { SpendingBreakdown } from "@/app/admin/dashboard/(legacy)/finance-v1/_components/spending-breakdown";
import { IncomeReliability } from "@/app/admin/dashboard/(legacy)/finance-v1/_components/income-reliability";

// Modern Finance Components
import { BalanceDistributionCard } from "@/app/admin/dashboard/finance/_components/balance-distribution-card";
import { Wallet } from "@/app/admin/dashboard/finance/_components/wallet";
import { UpcomingTransactions } from "@/app/admin/dashboard/finance/_components/upcoming-transactions";
import { QuickActions } from "@/app/admin/dashboard/finance/_components/quick-actions";

// CRM Components
import { PipelineActivity } from "@/app/admin/dashboard/crm/_components/pipeline-activity";
import { OpportunitiesSection } from "@/app/admin/dashboard/crm/_components/opportunities-section";
import { TaskReminders } from "@/app/admin/dashboard/crm/_components/task-reminders";

// Analytics Components
import { AnalyticsKpiStrip } from "@/app/admin/dashboard/analytics/_components/analytics-kpi-strip";
import { RealtimeVisitors } from "@/app/admin/dashboard/analytics/_components/realtime-visitors";
import { TrafficQuality } from "@/app/admin/dashboard/analytics/_components/traffic-quality";
import { TopTrafficSources } from "@/app/admin/dashboard/analytics/_components/top-traffic-sources";
import { TopPages } from "@/app/admin/dashboard/analytics/_components/top-pages";

// Productivity Components
import { SummaryCards } from "@/app/admin/dashboard/productivity/_components/summary-cards";
import { TasksSection } from "@/app/admin/dashboard/productivity/_components/tasks-section";
import { ProjectsSection } from "@/app/admin/dashboard/productivity/_components/projects-section";

// E-commerce Components
import { StoreTraffic } from "@/app/admin/dashboard/ecommerce/_components/store-traffic";
import { RecentOrders } from "@/app/admin/dashboard/ecommerce/_components/recent-orders";

// Infrastructure & Logistics Components
import { InfrastructureHeader } from "@/app/admin/dashboard/infrastructure/_components/infrastructure-header";
import { ProjectEnvironments } from "@/app/admin/dashboard/infrastructure/_components/project-environments";
import { infrastructureGroups } from "@/app/admin/dashboard/infrastructure/_components/infrastructure-data";
import { Logistics } from "@/app/admin/dashboard/logistics/_components/logistics";

// Flag icons
import "@/styles/flag-icons/flags.css";

export default function MasterUnifiedDashboard() {
  const [activeTab, setActiveTab] = useState<
    "all" | "crm" | "finance" | "analytics" | "travel" | "operations" | "productivity"
  >("all");

  return (
    <div className="@container/main flex flex-col gap-8 w-full pb-16">
      {/* Executive Header Banner */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              لوحة الإحصائيات الشاملة الموحدة
            </h1>
            <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary bg-primary/5 text-xs font-semibold px-2.5 py-0.5">
              <Sparkles className="size-3.5 animate-pulse" /> Live Unified Analytics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
            منظومة التحكم المركزية: إحصائيات الدخل والنمو، الـ CRM وقمع المبيعات، الخزينة والبطاقات، تحليلات الزيارات، البنية التحتية، وعمليات السفر الحية.
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full xl:w-auto">
          <TabsList className="h-10 bg-muted/60 p-1 flex flex-wrap max-w-full overflow-x-auto">
            <TabsTrigger value="all" className="text-xs font-medium gap-1.5 px-3">
              <Layers className="size-3.5" />
              <span>الداشباورد الشاملة (All-in-One)</span>
            </TabsTrigger>
            <TabsTrigger value="travel" className="text-xs font-medium gap-1.5 px-3">
              <Globe className="size-3.5" />
              <span>عمليات لوناليزا</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="text-xs font-medium gap-1.5 px-3">
              <Users className="size-3.5" />
              <span>الـ CRM والمبيعات</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="text-xs font-medium gap-1.5 px-3">
              <CreditCard className="size-3.5" />
              <span>المالية والبطاقات</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs font-medium gap-1.5 px-3">
              <Activity className="size-3.5" />
              <span>التحليلات والزوار</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="text-xs font-medium gap-1.5 px-3">
              <Server className="size-3.5" />
              <span>البنية واللوجستيات</span>
            </TabsTrigger>
            <TabsTrigger value="productivity" className="text-xs font-medium gap-1.5 px-3">
              <CheckSquare className="size-3.5" />
              <span>الإنتاجية والمتجر</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Row 1: High-Level Metric Cards (Default Dashboard) */}
      <section className="flex flex-col gap-4">
        <MetricCards />
      </section>

      {/* Row 2: Lonaliza Travel Operations Realtime KPIs */}
      {(activeTab === "all" || activeTab === "travel") && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">مؤشرات تشغيل لوناليزا للسياحة والسفر الحية</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-xs border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">حجوزات الفنادق النشطة</CardTitle>
                <Hotel className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">1,842 ليلة</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="size-3" /> +18.4% مقارنة بالشهر السابق
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">تذاكر الطيران الصادرة</CardTitle>
                <Plane className="size-4 text-sky-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">628 تذكرة</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="size-3" /> +12.1% إجمالي مبيعات GDS
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">التدفق المالي لبوابات الدفع</CardTitle>
                <WalletIcon className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">$128,450.00</div>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Iyzico / Stripe / التحويل البنكي
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">صحة المزامنة والأتمتة</CardTitle>
                <ShieldCheck className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">100% مستقرة</div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <CalendarCheck className="size-3" /> Hotelbeds, RateHawk & Travelport
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Row 3: Performance Curve & Cash Flow Overview */}
      {(activeTab === "all" || activeTab === "travel" || activeTab === "finance") && (
        <section className="grid grid-cols-1 gap-6">
          {(activeTab === "all" || activeTab === "travel") && <PerformanceOverview />}
          {(activeTab === "all" || activeTab === "finance") && <CashFlowOverview />}
        </section>
      )}

      {/* Row 4: Analytics Strip, Realtime Visitors & Traffic Quality */}
      {(activeTab === "all" || activeTab === "analytics") && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">تحليلات الزيارات وسلوك المستخدمين (Analytics & Live Traffic)</h2>
          </div>
          <AnalyticsKpiStrip />
          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TrafficQuality />
            </div>
            <div className="xl:col-span-5">
              <RealtimeVisitors />
            </div>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <TopPages />
            </div>
            <div className="xl:col-span-5">
              <TopTrafficSources />
            </div>
          </div>
        </section>
      )}

      {/* Row 5: CRM & Sales Pipeline & Opportunities */}
      {(activeTab === "all" || activeTab === "crm") && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">إدارة العملاء وخط أنابيب المبيعات (CRM & Sales Pipeline)</h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-7 flex flex-col gap-6">
              <PipelineActivity />
              <TaskReminders />
            </div>
            <div className="xl:col-span-5 flex flex-col gap-6">
              <OpportunitiesSection />
            </div>
          </div>
        </section>
      )}

      {/* Row 6: Finance Modern & Legacy Treasury */}
      {(activeTab === "all" || activeTab === "finance") && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">المالية والخزينة والبطاقات الرقمية (Finance & Wallets)</h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-6 flex flex-col gap-6">
              <CardOverview />
              <BalanceDistributionCard />
            </div>
            <div className="xl:col-span-6 flex flex-col gap-6">
              <Wallet />
              <UpcomingTransactions />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SpendingBreakdown />
                <IncomeReliability />
              </div>
              <QuickActions />
            </div>
          </div>
        </section>
      )}

      {/* Row 7: Productivity & Store Operations */}
      {(activeTab === "all" || activeTab === "productivity") && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">الإنتاجية، المهام والمشاريع (Productivity & Projects)</h2>
          </div>
          <SummaryCards />
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-6">
              <TasksSection />
            </div>
            <div className="xl:col-span-6">
              <ProjectsSection />
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-2">
            <div className="xl:col-span-5">
              <StoreTraffic />
            </div>
            <div className="xl:col-span-7">
              <RecentOrders />
            </div>
          </div>
        </section>
      )}

      {/* Row 8: Logistics & Infrastructure */}
      {(activeTab === "all" || activeTab === "operations") && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">البنية التحتية، السيرفرات واللوجستيات (Infrastructure & Logistics)</h2>
          </div>
          <InfrastructureHeader />
          <div className="flex flex-col gap-4">
            {infrastructureGroups.map((group) => (
              <ProjectEnvironments key={group.name} group={group} />
            ))}
          </div>
          <div className="mt-4">
            <Logistics />
          </div>
        </section>
      )}

      {/* Row 9: Master Customers & Subscribers Table */}
      {(activeTab === "all" || activeTab === "travel" || activeTab === "crm") && (
        <section className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">قاعدة العملاء والاشتراكات الشاملة (Subscribers Overview)</h2>
          </div>
          <SubscriberOverview />
        </section>
      )}
    </div>
  );
}
