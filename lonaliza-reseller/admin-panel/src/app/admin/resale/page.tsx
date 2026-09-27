"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Coins,
  DollarSign,
  Globe,
  KeyRound,
  Loader2,
  Plus,
  Radio,
  RefreshCw,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  Truck,
  Users,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";

type OverviewData = {
  stats: {
    totalCompanies: number;
    paidCompanies: number;
    activeLicenses: number;
    onlineInstances: number;
    totalRevenueUsd: number;
  };
  recentCompanies: Array<{
    id: string;
    companyName: string;
    email: string;
    status: string;
    requestedDomain?: string;
    created: string;
  }>;
  recentLicenses: Array<{
    id: string;
    licenseKey: string;
    companyName?: string;
    status: string;
    boundDomain?: string;
    online: boolean;
    created: string;
  }>;
};

export default function ResaleOverviewPage() {
  const { t, dir } = useLocale();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resale/overview", { cache: "no-store" });
      const json = (await res.json()) as { ok?: boolean } & OverviewData;
      if (json?.ok) {
        setData(json);
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">جاري تحميل بيانات منظومة الموزعين...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalCompanies: 0,
    paidCompanies: 0,
    activeLicenses: 0,
    onlineInstances: 0,
    totalRevenueUsd: 0,
  };

  return (
    <div className="space-y-8" dir={dir}>
      <EnterprisePageHeader
        title={t.admin?.resale || "منظومة الموزعين والوايت ليبل (B2B SaaS Hub)"}
        description={t.admin?.resaleDesc || "إدارة التراخيص السحابية للشركاء، السيرفرات المخصصة، محافظ B2B، وحصص الأرباح وهوامش التوزيع."}
        icon={Store}
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الموزعين والوايت ليبل" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-xs font-bold text-foreground backdrop-blur-md transition-all hover:bg-card hover:border-primary/40 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
              تحديث
            </button>
            <Link
              href="/admin/resale/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95"
            >
              <Settings className="h-4 w-4" />
              {t.admin?.resaleSettings || "إعدادات المنظومة"}
            </Link>
          </div>
        }
      />

      <EnterpriseKpiGrid cols={4}>
        <EnterpriseKpiCard
          label="إجمالي الشركات المسجلة"
          value={stats.totalCompanies}
          hint={`${stats.paidCompanies} شركة مفعّلة ومدفوعة`}
          icon={Building2}
          tone="royal"
        />
        <EnterpriseKpiCard
          label="التراخيص النشطة"
          value={stats.activeLicenses}
          hint={`${stats.onlineInstances} منصة متصلة ومباشرة`}
          icon={KeyRound}
          tone="emerald"
        />
        <EnterpriseKpiCard
          label="إجمالي الإيرادات الموزعة"
          value={`$${stats.totalRevenueUsd.toLocaleString()}`}
          hint="من التراخيص والاشتراكات"
          icon={DollarSign}
          tone="amber"
        />
        <EnterpriseKpiCard
          label="سيرفرات العملاء المستقلة"
          value={stats.paidCompanies}
          hint="سيرفر Contabo مخصص للشركاء"
          icon={Server}
          tone="indigo"
        />
      </EnterpriseKpiGrid>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/resale/companies"
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-card/90 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                {t.admin?.resaleCompanies || "شركات الموزعين"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {t.admin?.resaleCompaniesDesc || "سجلات الشركات المشتركة وحالاتها"}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/resale/delivery"
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-card/90 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 shadow-xs">
              <Truck className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors">
                {t.admin?.resaleDelivery || "تسليم المنصات الآلي"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {t.admin?.resaleDeliveryDesc || "إنشاء السيرفرات والنشر الفوري"}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/resale/licenses"
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:bg-card/90 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 shadow-xs">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                {t.admin?.resaleLicenses || "إدارة التراخيص والمفاتيح"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {t.admin?.resaleLicensesDesc || "تجديد المفاتيح والتحقق والربط"}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/resale/updates"
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-card/90 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 shadow-xs">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-cyan-500 transition-colors">
                {t.admin?.resaleUpdates || "تحديثات النظام المركزي"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {t.admin?.resaleUpdatesDesc || "دفع الإصدارات لجميع المستنسخات"}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* White Label & B2B Redistribution Suite Hub */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card/80 via-card/50 to-primary/5 p-6 backdrop-blur-2xl shadow-xl shadow-black/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                منظومة الوايت ليبل ومحافظ B2B (White Label & Redistribution Suite)
              </h2>
              <p className="text-xs text-muted-foreground">
                إدارة هوامش الأرباح التلقائية، إخفاء الموردين، محافظ الشركاء، وسجل الحجوزات الصادرة.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black text-primary bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full w-fit">
            Master Super Admin
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/resale/whitelabel"
            className="group rounded-2xl border border-border/50 bg-background/50 p-4 hover:border-primary/40 hover:bg-card/70 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-xs group-hover:text-primary transition-colors">إعدادات وهوامش الوايت ليبل</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">هوامش الطيران والفنادق والموردين</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/resale/wallets"
            className="group rounded-2xl border border-border/50 bg-background/50 p-4 hover:border-amber-500/40 hover:bg-card/70 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <Coins className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-xs group-hover:text-amber-500 transition-colors">محافظ الشركاء B2B</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">اعتماد التحويلات وسقف 2,000$</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/resale/bookings"
            className="group rounded-2xl border border-border/50 bg-background/50 p-4 hover:border-indigo-500/40 hover:bg-card/70 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Ticket className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-xs group-hover:text-indigo-400 transition-colors">سجل حجوزات B2B</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">مبيعات المحفظة وأرباح المنصة</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/resale/domains"
            className="group rounded-2xl border border-border/50 bg-background/50 p-4 hover:border-emerald-500/40 hover:bg-card/70 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <Globe className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-xs group-hover:text-emerald-400 transition-colors">طلبات النطاقات الخاصة</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">مراجعة DNS وتفعيل شهادات SSL</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Two columns: Recent Companies & Recent Licenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Companies */}
        <div className="rounded-3xl border border-border/50 bg-card/60 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <h2 className="font-bold text-foreground flex items-center gap-2.5 text-sm">
              <div className="size-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
              أحدث الشركات المسجلة
            </h2>
            <Link
              href="/admin/resale/companies"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              عرض الكل
              <ChevronRight className="size-3.5 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border/40">
            {data?.recentCompanies && data.recentCompanies.length > 0 ? (
              data.recentCompanies.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{c.companyName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    {c.requestedDomain && (
                      <p className="text-[11px] text-amber-400 font-mono mt-0.5 truncate">
                        {c.requestedDomain}
                      </p>
                    )}
                  </div>
                  <EnterpriseStatusBadge
                    status={
                      c.status === "active"
                        ? "active"
                        : c.status === "paid"
                        ? "paid"
                        : c.status === "provisioning"
                        ? "pending"
                        : "draft"
                    }
                    size="sm"
                  />
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-xs text-muted-foreground font-medium">
                لا توجد شركات مسجلة بعد. عند تسجيل الشركات من صفحة الشركاء ستظهر هنا.
              </p>
            )}
          </div>
        </div>

        {/* Recent Licenses */}
        <div className="rounded-3xl border border-border/50 bg-card/60 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <h2 className="font-bold text-foreground flex items-center gap-2.5 text-sm">
              <div className="size-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <KeyRound className="h-4 w-4" />
              </div>
              أحدث التراخيص الصادرة
            </h2>
            <Link
              href="/admin/resale/licenses"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              عرض الكل
              <ChevronRight className="size-3.5 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border/40">
            {data?.recentLicenses && data.recentLicenses.length > 0 ? (
              data.recentLicenses.map((l) => (
                <div key={l.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-black text-amber-400 tracking-wider truncate">{l.licenseKey}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {l.companyName || "شركة غير محددة"}
                    </p>
                    {l.boundDomain && (
                      <p className="text-[11px] text-foreground/80 font-mono mt-0.5 flex items-center gap-1.5 truncate">
                        <Globe className="h-3 w-3 text-primary shrink-0" />
                        {l.boundDomain}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EnterpriseStatusBadge
                      status={l.online ? "active" : "inactive"}
                      size="sm"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-xs text-muted-foreground font-medium">
                لا توجد تراخيص مصدرة بعد.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
