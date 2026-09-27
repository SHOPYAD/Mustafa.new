"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  DollarSign,
  CheckCircle2,
  Building2,
  Wallet,
  Hotel,
  Plane,
  Server,
  Compass,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  ChevronLeft,
  Users,
  CreditCard,
  Layers,
  Sparkles,
  Sliders,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";

type DashboardTab = "overview" | "travel_engines" | "resale_network" | "financials";

export function MasterEnterpriseDashboard() {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar" || dir === "rtl";
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Live Travel Engines Status Data
  const engines = [
    {
      id: "hotels",
      title: "محرك الفنادق والكتالوج الموحد",
      subtitle: "Booking.com, TravelAdvisor, المخزون الداخلي",
      status: "active",
      statusLabel: "متصل وحي",
      kpi1: "1,840 فندق نشط",
      kpi2: "14.5% متوسط الهامش",
      href: "/admin/hotels",
      icon: Hotel,
      color: "violet",
    },
    {
      id: "flights",
      title: "محرك الطيران والتذاكر المباشرة",
      subtitle: "SkyScrapper Live API + تغذية التوزيع",
      status: "active",
      statusLabel: "تغذية فورية GDS",
      kpi1: "68 تذكرة اليوم",
      kpi2: "$38,400 مبيعات اليوم",
      href: "/admin/flights",
      icon: Plane,
      color: "emerald",
    },
    {
      id: "resale",
      title: "شبكة الموزعين والوايت ليبل B2B",
      subtitle: "Contabo VPS + سيرفرات التوزيع السحابي",
      status: "active",
      statusLabel: "38 شريك مستقل",
      kpi1: "$184,200 ودائع المحافظ",
      kpi2: "12 سيرفر مدار",
      href: "/admin/resale",
      icon: Server,
      color: "amber",
    },
    {
      id: "packages",
      title: "الباقات السياحية والجولات VIP",
      subtitle: "تركيا، الخليج، أوروبا، والبرامج المتكاملة",
      status: "active",
      statusLabel: "84 برنامج نشط",
      kpi1: "126 جولة معتمدة",
      kpi2: "حجوزات مؤكدة 100%",
      href: "/admin/packages",
      icon: Compass,
      color: "blue",
    },
  ];

  // Recent Live Bookings Stream
  const recentBookings = [
    {
      id: "BK-88491",
      customer: "محمد بن سلطان القحطاني",
      type: "طيران دولي (ذهاب وعودة)",
      route: "الرياض (RUH) ⇄ إسطنبول (IST)",
      amount: "$1,420",
      margin: "+$195",
      status: "confirmed",
      time: "منذ 4 دقائق",
    },
    {
      id: "BK-88490",
      customer: "شركة الأفق للسياحة (وايت ليبل)",
      type: "حجز فندقي 5 نجوم (4 ليالٍ)",
      route: "فندق البوسفور بالاس — جناح ملكي",
      amount: "$2,850",
      margin: "+$340",
      status: "confirmed",
      time: "منذ 12 دقيقة",
    },
    {
      id: "BK-88489",
      customer: "سارة عبد العزيز الشمري",
      type: "باقة سياحية VIP متكاملة",
      route: "برنامج طرابزون وأوزنجول 7 أيام",
      amount: "$3,600",
      margin: "+$580",
      status: "completed",
      time: "منذ 28 دقيقة",
    },
    {
      id: "BK-88488",
      customer: "فهد العتيبي",
      type: "تأجير سيارة مع سائق خاص",
      route: "مرسيدس فيتو VIP — 5 أيام",
      amount: "$850",
      margin: "+$170",
      status: "confirmed",
      time: "منذ 41 دقيقة",
    },
    {
      id: "BK-88487",
      customer: "مؤسسة مدارات السفر (B2B)",
      type: "حجز طيران داخلي وخارجي (مجموعة)",
      route: "جدة ⇄ دبي ⇄ بالي (8 مسافرين)",
      amount: "$6,920",
      margin: "+$890",
      status: "completed",
      time: "منذ ساعة",
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-20 w-full min-w-0" dir={dir}>
      {/* Top Enterprise Command Center Header */}
      <EnterprisePageHeader
        icon={<LayoutDashboard className="size-6" />}
        title={
          isAr
            ? "مركز القيادة والعمليات التنفيذية الشاملة"
            : "Executive Operations & Command Center"
        }
        description={
          isAr
            ? "مراقبة لحظية لمحركات السفر (فنادق، طيران، سيارات، باقات)، شبكة الموزعين والوايت ليبل، والسيولة النقدية."
            : "Real-time monitoring of travel engines (Hotels, Flights, Cars, Packages), B2B Whitelabel network, and financial cashflow."
        }
        badge="Royal Command v3"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>الأنظمة متصلة وتعمل بكفاءة 100%</span>
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 transition-all shadow-sm"
              title="تحديث البيانات اللحظية"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-violet-400" : ""}`} />
              <span>تحديث</span>
            </button>

            <Link
              href="/admin/resale/whitelabel"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/25 transition-all"
            >
              <Sparkles className="size-3.5" />
              <span>مركز التوزيع B2B</span>
            </Link>
          </div>
        }
      />

      {/* Top Core KPIs */}
      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          title="إجمالي مبيعات السفر المحققة"
          value="$428,950"
          subValue="+18.4% نمو المبيعات هذا الشهر"
          change={18.4}
          changeLabel="نمو شهري"
          trend="up"
          icon={<DollarSign className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="حجوزات اليوم المؤكدة"
          value="142 حجز"
          subValue="طيران 68 | فنادق 54 | باقات 20"
          icon={<CheckCircle2 className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="شبكة الموزعين والوايت ليبل"
          value="38 شريك نشط"
          subValue="18 تملك مستقل | 20 وايت ليبل"
          icon={<Building2 className="size-5" />}
          color="amber"
        />
        <EnterpriseKpiCard
          title="رصيد محافظ B2B المودع"
          value="$184,200"
          subValue="ودائع نقدية مؤمنة مسبقة الدفع"
          icon={<Wallet className="size-5" />}
          color="blue"
        />
      </EnterpriseKpiGrid>

      {/* Interactive Tabs Strip */}
      <div className="flex items-center gap-2 p-1.5 bg-card border border-border rounded-2xl overflow-x-auto shadow-sm dark:shadow-md dark:shadow-black/10">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
              : "text-muted-foreground hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30"
          }`}
        >
          النظرة العامة والمحركات الحية
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("travel_engines")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "travel_engines"
              ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
              : "text-muted-foreground hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30"
          }`}
        >
          حالة محركات السفر ومزودي الـ APIs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("resale_network")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "resale_network"
              ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
              : "text-muted-foreground hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30"
          }`}
        >
          شبكة الموزعين والسيرفرات المستقلة
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("financials")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "financials"
              ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
              : "text-muted-foreground hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30"
          }`}
        >
          التدفقات المالية وهوامش الأرباح
        </button>
      </div>

      {/* Main Section 1: Travel Engines Operational Health Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <span>محركات السفر الرئيسية والربط اللحظي</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              متابعة حالة مزودي التغذية العالمية، الكتالوج الداخلي، وهوامش الربح المطبقة
            </p>
          </div>
          <Link
            href="/admin/providers"
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 inline-flex items-center gap-1"
          >
            <span>إدارة كافة المزودين</span>
            <ChevronLeft className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {engines.map((eng) => {
            const Icon = eng.icon;
            return (
              <div
                key={eng.id}
                className="rounded-2xl border border-border bg-card dark:bg-card/70 backdrop-blur-xl p-5 space-y-4 shadow-sm dark:shadow-xl dark:shadow-black/10 hover:border-violet-500/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="size-11 rounded-xl bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/20 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-300">
                    <Icon className="size-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{eng.statusLabel}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-foreground text-sm group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                    {eng.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {eng.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">المؤشر الأساسي</span>
                    <span className="font-bold text-foreground">{eng.kpi1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">الكفاءة والهامش</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{eng.kpi2}</span>
                  </div>
                </div>

                <Link
                  href={eng.href}
                  className="block text-center py-2 rounded-xl text-xs font-bold bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white border border-violet-200 dark:border-violet-800/40 transition-all shadow-xs"
                >
                  فتح لوحة التحكم
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Section 2: Live Bookings & Revenue Stream */}
      <div className="rounded-2xl border border-border bg-card dark:bg-card/70 backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-xl dark:shadow-black/20">
        <div className="p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-400" />
              <span>أحدث الحجوزات والعمليات المباشرة (Live Transaction Journal)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              تدفق الحجوزات الصادرة عن الموقع العام وتطبيقات الموبايل وشبكة الشركاء الموزعين لحظياً
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 transition-all self-start sm:self-center"
          >
            <span>سجل الحجوزات الكامل</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-bold">
              <tr>
                <th className="py-3.5 px-4 text-start">رقم الحجز</th>
                <th className="py-3.5 px-4 text-start">العميل / الشريك B2B</th>
                <th className="py-3.5 px-4 text-start">نوع الخدمة والمسار</th>
                <th className="py-3.5 px-4 text-start">القيمة الإجمالية</th>
                <th className="py-3.5 px-4 text-start">الهامش الصافي</th>
                <th className="py-3.5 px-4 text-start">حالة العملية</th>
                <th className="py-3.5 px-4 text-end">التوقيت اللحظي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-violet-400">
                    {b.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-foreground">{b.customer}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="text-foreground font-medium block">{b.type}</span>
                      <span className="text-[11px] text-muted-foreground">{b.route}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {b.amount}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {b.margin}
                  </td>
                  <td className="py-3.5 px-4">
                    <EnterpriseStatusBadge
                      status={b.status === "completed" ? "completed" : "active"}
                      label={b.status === "completed" ? "مكتمل ومدفوع" : "مؤكد وجارٍ"}
                    />
                  </td>
                  <td className="py-3.5 px-4 text-end text-muted-foreground font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground/60" />
                      <span>{b.time}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Section 3: Quick Action Launchpad */}
      <div className="rounded-2xl border border-border bg-card dark:bg-card/70 backdrop-blur-xl p-6 space-y-4 shadow-sm dark:shadow-xl dark:shadow-black/20">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Sliders className="size-4 text-violet-600 dark:text-violet-400" />
          <span>منصة الإجراءات السريعة (Executive Quick Launchpad)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/hotels"
            className="p-3.5 rounded-xl bg-slate-50/60 hover:bg-violet-50 dark:bg-secondary/50 dark:hover:bg-secondary border border-border hover:border-violet-300 dark:hover:border-violet-500/40 text-center space-y-1.5 transition-all group shadow-xs"
          >
            <Hotel className="size-5 mx-auto text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300">الفنادق والكتالوج</span>
            <span className="text-[10px] text-muted-foreground block">تعديل المارك أب</span>
          </Link>

          <Link
            href="/admin/flights"
            className="p-3.5 rounded-xl bg-slate-50/60 hover:bg-violet-50 dark:bg-secondary/50 dark:hover:bg-secondary border border-border hover:border-violet-300 dark:hover:border-violet-500/40 text-center space-y-1.5 transition-all group shadow-xs"
          >
            <Plane className="size-5 mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300">محرك الطيران</span>
            <span className="text-[10px] text-muted-foreground block">البحث والأسعار</span>
          </Link>

          <Link
            href="/admin/resale/companies"
            className="p-3.5 rounded-xl bg-slate-50/60 hover:bg-violet-50 dark:bg-secondary/50 dark:hover:bg-secondary border border-border hover:border-violet-300 dark:hover:border-violet-500/40 text-center space-y-1.5 transition-all group shadow-xs"
          >
            <Server className="size-5 mx-auto text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300">شركات الموزعين</span>
            <span className="text-[10px] text-muted-foreground block">سيرفرات Contabo</span>
          </Link>

          <Link
            href="/admin/resale/wallets"
            className="p-3.5 rounded-xl bg-slate-50/60 hover:bg-violet-50 dark:bg-secondary/50 dark:hover:bg-secondary border border-border hover:border-violet-300 dark:hover:border-violet-500/40 text-center space-y-1.5 transition-all group shadow-xs"
          >
            <Wallet className="size-5 mx-auto text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300">محافظ B2B</span>
            <span className="text-[10px] text-muted-foreground block">الودائع البنكية</span>
          </Link>

          <Link
            href="/admin/ads"
            className="p-3.5 rounded-xl bg-slate-50/60 hover:bg-violet-50 dark:bg-secondary/50 dark:hover:bg-secondary border border-border hover:border-violet-300 dark:hover:border-violet-500/40 text-center space-y-1.5 transition-all group shadow-xs"
          >
            <Zap className="size-5 mx-auto text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300">إطلاق الإعلانات</span>
            <span className="text-[10px] text-muted-foreground block">Google & Meta</span>
          </Link>

          <Link
            href="/admin/currencies"
            className="p-3.5 rounded-xl bg-slate-50/60 hover:bg-violet-50 dark:bg-secondary/50 dark:hover:bg-secondary border border-border hover:border-violet-300 dark:hover:border-violet-500/40 text-center space-y-1.5 transition-all group shadow-xs"
          >
            <CreditCard className="size-5 mx-auto text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold block text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300">أسعار العملات</span>
            <span className="text-[10px] text-muted-foreground block">هوامش الصرف</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
