"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Star,
  Package,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { getPackages, updatePackage, resetPackages } from "@/data/packages";
import type { HolidayPackage } from "@/types/package";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import NavVisibilityPanel from "@/components/admin/NavVisibilityPanel";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
} from "@/components/admin/enterprise";

export default function AdminContentPage() {
  const { t, locale } = useLocale();
  const [packages, setPackages] = useState<HolidayPackage[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setPackages(getPackages());
  }, []);

  const refresh = () => setPackages(getPackages());

  const toggleFeatured = (pkg: HolidayPackage) => {
    updatePackage(pkg.id, { isFeatured: !pkg.isFeatured });
    refresh();
  };

  const handleReset = () => {
    resetPackages();
    setShowResetConfirm(false);
    refresh();
  };

  const featuredCount = packages.filter((p) => p.isFeatured).length;

  return (
    <div className="space-y-8" dir={locale === "ar" ? "rtl" : "ltr"}>
      <EnterprisePageHeader
        icon={LayoutGrid}
        title={t.admin?.contentControl || "إدارة المحتوى والباقات المميزة"}
        description={
          locale === "ar"
            ? "التحكم في ظهور القوائم والباقات السياحية المميزة في الصفحة الرئيسية للمنصة."
            : "Manage menu navigation visibility and featured holiday packages shown on the homepage."
        }
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المحتوى" },
        ]}
        actions={
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground backdrop-blur-md transition-all hover:bg-card hover:border-primary/40 active:scale-95"
          >
            <RotateCcw size={14} />
            <span>{t.common.reset}</span>
          </button>
        }
      />

      <NavVisibilityPanel />

      <EnterpriseKpiGrid cols={2}>
        <EnterpriseKpiCard
          label="إجمالي الباقات السياحية"
          value={packages.length}
          hint="المسجلة في النظام"
          icon={Package}
          tone="royal"
        />
        <EnterpriseKpiCard
          label="الباقات المميزة في الرئيسية"
          value={featuredCount}
          hint="تُعرض الـ 6 باقات الأولى"
          icon={Star}
          tone="amber"
        />
      </EnterpriseKpiGrid>

      <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl flex items-start gap-3">
        <Star size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-amber-300 text-xs font-medium leading-relaxed">
          {locale === "ar"
            ? "فعّل مفتاح «مميز» للتحكم بالباقات الظاهرة في قسم باقات العطلات المميزة في واجهة المتجر. تُعرض أول 6 باقات مميزة تلقائياً."
            : 'Toggle Featured to control which packages appear in the homepage "Featured Holiday Packages" section. The first 6 featured packages are displayed.'}
        </p>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-xl overflow-hidden shadow-lg">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card/90">
          <div className="col-span-5">{t.admin.packages}</div>
          <div className="col-span-3">{t.footer.destinations}</div>
          <div className="col-span-2">{t.common.price}</div>
          <div className="col-span-2 text-left">{t.common.featured}</div>
        </div>

        {packages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm font-medium">
              {locale === "ar" ? "لا توجد باقات" : "No packages found"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {packages.map((pkg) => {
              const title = tContent(pkg, "title", locale) || pkg.title;
              const dest = tContent(pkg, "destination", locale) || pkg.destination;
              const country = tContent(pkg, "country", locale) || pkg.country;
              return (
                <div
                  key={pkg.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-card/90 transition-colors items-center"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    {pkg.images[0] && (
                      <div className="size-10 rounded-xl bg-background overflow-hidden shrink-0 border border-border/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pkg.images[0].url}
                          alt=""
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-foreground font-bold text-sm truncate">
                      {title}
                    </p>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-muted-foreground text-xs font-medium">
                      {dest}, {country}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-amber-400 font-mono font-black text-sm tabular-nums">
                      ${pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    {pkg.isFeatured && (
                      <span className="text-[10px] text-amber-400 font-bold uppercase hidden sm:block">
                        {t.common.featured}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleFeatured(pkg)}
                      className={`w-12 h-6 rounded-full flex items-center transition-all cursor-pointer p-0.5 ${
                        pkg.isFeatured
                          ? "bg-amber-500 justify-end shadow-md shadow-amber-500/20"
                          : "bg-secondary justify-start"
                      }`}
                      title={pkg.isFeatured ? t.common.featured : t.common.add}
                    >
                      <div className="size-5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative bg-card border border-border/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-foreground font-black text-base">
              {locale === "ar" ? "إعادة تعيين الباقات للافتراضي؟" : "Reset to Defaults?"}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {locale === "ar"
                ? "ستُعاد جميع الباقات السياحية لحالة التمييز الافتراضية في النظام."
                : "This will restore all packages to their default featured status."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs rounded-xl transition-all"
              >
                {t.common.reset}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-secondary hover:bg-muted text-muted-foreground font-bold text-xs rounded-xl transition-all"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
