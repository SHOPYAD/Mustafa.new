"use client";

import { useState } from "react";
import {
  Hotel,
  Building2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Percent,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import HotelsProviderPanel from "@/components/admin/HotelsProviderPanel";
import type { HotelProvider } from "@/lib/hotels-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AdminHotelsPage() {
  const { t } = useLocale();
  const [catalogProvider, setCatalogProvider] = useState<HotelProvider>("booking");

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8" dir="rtl">
      {/* Executive Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                محركات ومزودو الفنادق
              </span>
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-md">
                Travelport · Hotelbeds · RateHawk · Booking.com
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
              <Hotel className="text-secondary size-7 shrink-0" />
              <span>مزودو الفنادق وإعدادات المارك أب</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-3xl leading-relaxed">
              إدارة مفاتيح الربط الخارجي، حصص وتيليمتري المزودين الحيّين، واختيار محرك البحث النشط وضبط هوامش ربح المنصة.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
            <Link
              href="/admin/hotels/featured"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-98"
            >
              <Sparkles className="size-4" />
              <span>عروض الوجهات المميزة (12 مدينة)</span>
              <ArrowLeft className="size-3.5" />
            </Link>
            <Link
              href="/admin/hotels/supply"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs transition-all"
            >
              <ShieldCheck className="size-4" />
              <span>صحة الموردين</span>
              <ArrowLeft className="size-3.5" />
            </Link>
            <Link
              href="/admin/hotels/catalog"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary hover:brightness-110 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all"
            >
              <Building2 className="size-4" />
              <span>الكتالوج الداخلي</span>
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hotel Inventory & Connectivity Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>مخزون الفنادق الشامل</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">5,954</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <span>498 فندق مختار + 5,456 موردين</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>الموردون الحيّون</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px]">
              4 قنوات
            </span>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">Hotelbeds + 3</div>
          <div className="text-[11px] text-muted-foreground mt-1">RateHawk · Travelport · Seeru</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>متوسط هامش الربح</span>
            <Percent className="size-3.5 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">+12.0%</div>
          <div className="text-[11px] text-primary mt-1 font-medium">مطبق آلياً على نتائج البحث</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>التقييمات الموثقة</span>
            <span className="text-amber-500 text-[10px] font-bold">TripAdvisor</span>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">1,356</div>
          <div className="text-[11px] text-muted-foreground mt-1">متوسط التقييم العام: 9.1 / 10</div>
        </div>
      </div>

      {/* Quick Navigation Card to Manual Internal Catalog */}
      <div className='p-5 rounded-3xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs'>
        <div className="flex items-center gap-3.5">
          <div className='p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0'>
            <Building2 className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              الكتالوج الداخلي المستقل للوكالة
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              تم تخصيص صفحة فرعية مستقلة لإدارة الفنادق اليدوية، أتمتة الأسعار اللحظية، والاستيراد الذكي بالذكاء الاصطناعي مع الحذف الفردي والجماعي.
            </p>
          </div>
        </div>

        <Link
          href="/admin/hotels/catalog"
          className='inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs transition-colors shrink-0 shadow-2xs'
        >
          <span>إدارة الكتالوج الداخلي</span>
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* Hotel Providers Selector (GDS, Live APIs, Direct Bank, Internal) & Markup Rules */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <HotelsProviderPanel onProviderChange={setCatalogProvider} />
      </div>
    </div>
  );
}
