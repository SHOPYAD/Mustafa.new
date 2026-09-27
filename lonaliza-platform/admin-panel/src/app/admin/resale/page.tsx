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
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className='h-8 w-8 animate-spin text-secondary' />
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
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Store className='h-6 w-6 text-secondary' />
            {t.admin.resale}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t.admin.resaleDesc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>تحديث</span>
          </button>
          <Link
            href="/admin/resale/settings"
            className='inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors'
          >
            <Settings className="h-4 w-4" />
            <span>{t.admin.resaleSettings}</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              إجمالي الشركات
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{stats.totalCompanies}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.paidCompanies} شركة قامت بالشراء
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              التراخيص النشطة
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <KeyRound className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{stats.activeLicenses}</p>
          <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1">
            <Radio className="h-3 w-3 animate-pulse" />
            {stats.onlineInstances} موقع متصل الآن
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              إجمالي الإيرادات
            </p>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary'>
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            ${stats.totalRevenueUsd.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">من مبيعات التراخيص والاشتراكات</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              سيرفرات Contabo
            </p>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <Server className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{stats.paidCompanies}</p>
          <p className="mt-1 text-xs text-muted-foreground">سيرفر تم إعداده للعملاء</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/resale/companies"
          className="group rounded-2xl border border-border bg-card/40 p-5 hover:bg-card/80 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground group-hover:bg-secondary group-hover:text-foreground transition-colors'>
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.admin.resaleCompanies}</p>
              <p className="text-xs text-muted-foreground">{t.admin.resaleCompaniesDesc}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/resale/delivery"
          className="group rounded-2xl border border-border bg-card/40 p-5 hover:bg-card/80 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground group-hover:bg-secondary group-hover:text-foreground transition-colors'>
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.admin.resaleDelivery}</p>
              <p className="text-xs text-muted-foreground">{t.admin.resaleDeliveryDesc}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/resale/licenses"
          className="group rounded-2xl border border-border bg-card/40 p-5 hover:bg-card/80 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground group-hover:bg-secondary group-hover:text-foreground transition-colors'>
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.admin.resaleLicenses}</p>
              <p className="text-xs text-muted-foreground">{t.admin.resaleLicensesDesc}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/resale/updates"
          className="group rounded-2xl border border-border bg-card/40 p-5 hover:bg-card/80 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground group-hover:bg-secondary group-hover:text-foreground transition-colors'>
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.admin.resaleUpdates}</p>
              <p className="text-xs text-muted-foreground">{t.admin.resaleUpdatesDesc}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* White Label & B2B Redistribution Suite Hub */}
      <div className='rounded-3xl border-2 border-border/80 bg-gradient-to-br from-purple-50/50 via-white to-amber-50/30 p-6 shadow-sm space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border'>
          <div className="flex items-center gap-2.5">
            <div className='size-9 rounded-xl bg-primary text-foreground flex items-center justify-center shadow-xs'>
              <Sparkles className="size-4" />
            </div>
            <div>
              <h2 className='text-base font-black text-foreground'>
                منظومة الوايت ليبل ومحافظ B2B (White Label & Redistribution Suite)
              </h2>
              <p className='text-xs text-muted-foreground'>
                إدارة هوامش الأرباح التلقائية، إخفاء الموردين، محافظ الشركاء، وسجل الحجوزات الصادرة.
              </p>
            </div>
          </div>
          <span className='text-[11px] font-bold text-primary bg-admin-bg-subtle/80 px-3 py-1 rounded-full w-fit'>
            Master Super Admin
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/resale/whitelabel"
            className='group rounded-2xl border border-border bg-card p-4 hover:border-border hover:shadow-md transition-all'
          >
            <div className="flex items-center gap-3">
              <div className='flex size-9 items-center justify-center rounded-xl bg-admin-bg-subtle text-primary group-hover:bg-primary group-hover:text-foreground transition-colors'>
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className='font-bold text-foreground text-xs'>إعدادات وهوامش الوايت ليبل</p>
                <p className='text-[11px] text-muted-foreground'>هوامش الطيران والفنادق والموردين</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/resale/wallets"
            className='group rounded-2xl border border-border bg-card p-4 hover:border-border hover:shadow-md transition-all'
          >
            <div className="flex items-center gap-3">
              <div className='flex size-9 items-center justify-center rounded-xl bg-amber-50 text-admin-btn-secondary-hover group-hover:bg-secondary group-hover:text-foreground transition-colors'>
                <Coins className="size-4" />
              </div>
              <div>
                <p className='font-bold text-foreground text-xs'>محافظ الشركاء B2B</p>
                <p className='text-[11px] text-muted-foreground'>اعتماد التحويلات وسقف 2,000$</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/resale/bookings"
            className='group rounded-2xl border border-indigo-100 bg-card p-4 hover:border-indigo-300 hover:shadow-md transition-all'
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-foreground transition-colors">
                <Ticket className="size-4" />
              </div>
              <div>
                <p className='font-bold text-foreground text-xs'>سجل حجوزات B2B</p>
                <p className='text-[11px] text-muted-foreground'>مبيعات المحفظة وأرباح المنصة</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/resale/domains"
            className='group rounded-2xl border border-emerald-100 bg-card p-4 hover:border-emerald-300 hover:shadow-md transition-all'
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-foreground transition-colors">
                <Globe className="size-4" />
              </div>
              <div>
                <p className='font-bold text-foreground text-xs'>طلبات النطاقات الخاصة</p>
                <p className='text-[11px] text-muted-foreground'>مراجعة DNS وتفعيل شهادات SSL</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Two columns: Recent Companies & Recent Licenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Companies */}
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Building2 className='h-4 w-4 text-secondary' />
              أحدث الشركات المسجلة
            </h2>
            <Link
              href="/admin/resale/companies"
              className='text-xs font-medium text-secondary hover:text-secondary'
            >
              عرض الكل
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border">
            {data?.recentCompanies && data.recentCompanies.length > 0 ? (
              data.recentCompanies.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{c.companyName}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                    {c.requestedDomain && (
                      <p className='text-[11px] text-secondary/80 font-mono mt-0.5'>
                        {c.requestedDomain}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.status === "active"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : c.status === "paid" || c.status === "provisioning"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                لا توجد شركات مسجلة بعد. عند تسجيل الشركات من صفحة الشركاء ستظهر هنا.
              </p>
            )}
          </div>
        </div>

        {/* Recent Licenses */}
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <KeyRound className='h-4 w-4 text-secondary' />
              أحدث التراخيص الصادرة
            </h2>
            <Link
              href="/admin/resale/licenses"
              className='text-xs font-medium text-secondary hover:text-secondary'
            >
              عرض الكل
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border">
            {data?.recentLicenses && data.recentLicenses.length > 0 ? (
              data.recentLicenses.map((l) => (
                <div key={l.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className='font-mono text-xs font-semibold text-secondary'>{l.licenseKey}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {l.companyName || "شركة غير محددة"}
                    </p>
                    {l.boundDomain && (
                      <p className="text-[11px] text-foreground font-mono mt-0.5 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        {l.boundDomain}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        l.online
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${l.online ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                      {l.online ? "متصل" : "غير متصل"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                لا توجد تراخيص مصدرة بعد.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
