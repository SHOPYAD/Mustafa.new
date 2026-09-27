// src/app/admin/content/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Star,
  Package,
  RotateCcw,
} from "lucide-react";
import { getPackages, updatePackage, resetPackages } from "@/data/packages";
import type { HolidayPackage } from "@/types/package";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import NavVisibilityPanel from "@/components/admin/NavVisibilityPanel";

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
    <div className="admin-page w-full max-w-none min-w-0">
      <NavVisibilityPanel />

      {/* Featured packages */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <LayoutGrid className="text-amber-400" size={24} />
            {t.admin.contentControl}
          </h2>
          <p className="text-muted-foreground mt-1">
            {locale === "ar"
              ? "إدارة الباقات المميزة الظاهرة في الصفحة الرئيسية"
              : "Manage featured packages shown on the homepage"}
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2.5 bg-admin-bg-subtle hover:bg-muted text-admin-text-muted hover:text-admin-text-primary font-medium rounded-xl min-h-11 transition-all flex items-center gap-2 text-sm"
        >
          <RotateCcw size={14} />
          {t.common.reset}
        </button>
      </div>

      <div className="flex items-center gap-6 mb-6 text-sm">
        <span className="text-admin-text-muted">
          {t.admin.packages}:{" "}
          <span className="text-foreground font-semibold">{packages.length}</span>
        </span>
        <span className="text-admin-text-muted">
          {t.common.featured}:{" "}
          <span className="text-amber-400 font-semibold">{featuredCount}</span>
        </span>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
        <Star size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-400/80 text-sm">
          {locale === "ar"
            ? "فعّل مفتاح «مميز» للتحكم بالباقات الظاهرة في قسم باقات العطلات المميزة. تُعرض أول 6 باقات مميزة."
            : 'Toggle Featured to control which packages appear in the homepage "Featured Holiday Packages" section. The first 6 featured packages are displayed.'}
        </p>
      </div>

      <div className="bg-admin-bg-surface border border-admin-border-subtle rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-admin-border-subtle text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">{t.admin.packages}</div>
          <div className="col-span-3">{t.footer.destinations}</div>
          <div className="col-span-2">{t.common.price}</div>
          <div className="col-span-2 text-right">{t.common.featured}</div>
        </div>

        {packages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-muted-foreground text-lg">
              {locale === "ar" ? "لا توجد باقات" : "No packages found"}
            </p>
          </div>
        ) : (
          packages.map((pkg) => {
            const title = tContent(pkg, "title", locale) || pkg.title;
            const dest =
              tContent(pkg, "destination", locale) || pkg.destination;
            const country = tContent(pkg, "country", locale) || pkg.country;
            return (
              <div
                key={pkg.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-admin-border-subtle hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-5 flex items-center gap-3">
                  {pkg.images[0] && (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pkg.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-foreground font-medium text-sm truncate">
                    {title}
                  </p>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="text-muted-foreground text-sm">
                    {dest}, {country}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-amber-400 font-bold text-sm">
                    ${pkg.price.toLocaleString()}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-3">
                  {pkg.isFeatured && (
                    <span className="text-[10px] text-amber-400 font-semibold uppercase hidden sm:block">
                      {t.common.featured}
                    </span>
                  )}
                  <button
                    onClick={() => toggleFeatured(pkg)}
                    className={`w-12 h-6 rounded-full flex items-center transition-all ${
                      pkg.isFeatured
                        ? "bg-amber-500 justify-end"
                        : "bg-admin-bg-subtle justify-start"
                    }`}
                    title={
                      pkg.isFeatured ? t.common.featured : t.common.add
                    }
                  >
                    <div className="w-5 h-5 rounded-full bg-white mx-0.5 shadow-sm" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative bg-slate-900 border border-admin-border-subtle rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-foreground font-bold mb-2">
              {locale === "ar" ? "إعادة للافتراضي؟" : "Reset to Defaults?"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {locale === "ar"
                ? "ستُعاد جميع الباقات لحالة التمييز الافتراضية."
                : "This will restore all packages to their default featured status."}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all"
              >
                {t.common.reset}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-admin-bg-subtle hover:bg-muted text-muted-foreground font-medium rounded-xl transition-all"
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
