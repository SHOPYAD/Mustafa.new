"use client";

import { useState } from "react";
import {
  Hotel,
  Building2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Percent,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              مزودو ومحركات البحث
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Booking.com · Travel Advisor · Hotel Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Hotel className="text-amber-500 size-7" />
            مزودو الفنادق وإعدادات المارك أب (Hotel Providers & Markups)
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            إدارة مفاتيح الربط الخارجي، حصص RapidAPI، اختيار المزود النشط لنتائج بحث العملاء، وضبط هوامش الربح.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href="/admin/hotels/supply"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-sky-500/40 bg-card hover:bg-muted text-sky-600 dark:text-sky-400 font-bold text-xs shadow-2xs transition-all"
          >
            <ShieldCheck className="size-4" />
            <span>صحة الموردين وقاعدة المحتوى</span>
            <ArrowLeft className="size-3.5" />
          </Link>
          <Link
            href="/admin/hotels/catalog"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Building2 className="size-4" />
            <span>فتح الكتالوج الداخلي للفنادق</span>
            <ArrowLeft className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Card to Manual Internal Catalog */}
      <div className="p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Building2 className="size-6" />
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-card hover:bg-muted text-amber-600 dark:text-amber-400 font-bold text-xs transition-colors shrink-0 shadow-2xs"
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
