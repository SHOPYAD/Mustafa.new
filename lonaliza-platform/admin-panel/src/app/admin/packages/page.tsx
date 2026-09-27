// src/app/admin/packages/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  RotateCcw,
  Search,
  AlertTriangle,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  Percent,
  SlidersHorizontal,
  Car,
  Anchor,
  Camera,
  ShieldCheck,
  Check,
  Save,
} from "lucide-react";
import { deletePackage, resetPackages, savePackages } from "@/data/packages";
import { fetchPublishedPackages } from "@/data/packages-client";
import {
  deleteAdminPackage,
  persistAdminPackage,
  resetAdminPackages,
  syncLocalPackagesToServer,
} from "@/data/packages-admin";
import { type HolidayPackage } from "@/types/package";
import PackageFormModal from "@/components/admin/PackageFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedPackage } from "@/lib/import-normalize";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import WhiteLabelUpgradeOverlay from "@/components/admin/WhiteLabelUpgradeOverlay";

export default function AdminPackagesPage() {
  const { t, locale } = useLocale();
  const [packages, setPackages] = useState<HolidayPackage[]>([]);
  const [activeTab, setActiveTab] = useState<"packages" | "addons">("packages");
  const [addons, setAddons] = useState<any[]>([]);
  const [isSavingAddons, setIsSavingAddons] = useState(false);
  const [addonFeedback, setAddonFeedback] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<HolidayPackage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchAddons = async () => {
    try {
      const res = await fetch("/api/packages/addons");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.addons)) {
          setAddons(data.addons);
        }
      }
    } catch (e) {
      console.error("Failed to load addons:", e);
    }
  };

  const handleSaveAddons = async () => {
    setIsSavingAddons(true);
    try {
      const res = await fetch("/api/packages/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addons }),
      });
      if (res.ok) {
        setAddonFeedback("تم حفظ إعدادات وترقيات الـ VIP بنجاح ✓");
        setTimeout(() => setAddonFeedback(null), 3500);
      }
    } catch {
      setAddonFeedback("فشل في حفظ التغييرات!");
      setTimeout(() => setAddonFeedback(null), 3500);
    } finally {
      setIsSavingAddons(false);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const synced = await syncLocalPackagesToServer();
        setPackages(synced);
      } catch {
        const fallback = await fetchPublishedPackages();
        setPackages(fallback);
      }
    })();
  }, []);

  const refresh = () => {
    void fetchPublishedPackages().then((list) => {
      savePackages(list);
      setPackages(list);
    });
  };

  const handleAdd = async (data: Omit<HolidayPackage, "id">) => {
    await persistAdminPackage({
      ...data,
      isPublished: true,
      createdAt: new Date().toISOString(),
    });
    refresh();
  };

  const handleUpdate = async (data: Omit<HolidayPackage, "id">) => {
    if (!editingPkg) return;
    await persistAdminPackage({ ...editingPkg, ...data, id: editingPkg.id });
    setEditingPkg(null);
    refresh();
  };

  const handleDelete = async (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
    try {
      await deleteAdminPackage(id);
    } catch (e) {
      console.error("Delete package error:", e);
    }
    deletePackage(id);
    refresh();
  };

  const handleReset = async () => {
    try {
      await resetAdminPackages();
    } catch {
      /* keep local reset */
    }
    resetPackages();
    setShowResetConfirm(false);
    refresh();
  };

  const destinations = useMemo(() => {
    return Array.from(new Set(packages.map((p) => p.destination || p.country))).filter(Boolean);
  }, [packages]);

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const title = (tContent(p, "title", locale) || p.title || "").toLowerCase();
      const dest = (tContent(p, "destination", locale) || p.destination || "").toLowerCase();
      const country = (tContent(p, "country", locale) || p.country || "").toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchSearch = title.includes(q) || dest.includes(q) || country.includes(q);
      const matchDest =
        destinationFilter === "all" ||
        p.destination === destinationFilter ||
        p.country === destinationFilter;

      return matchSearch && matchDest;
    });
  }, [packages, searchQuery, destinationFilter, locale]);

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8" dir="rtl">
      <WhiteLabelUpgradeOverlay moduleName="البرامج السياحية">
        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                إدارة البرامج والعروض السياحية
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Turkey Tour Packages & Itineraries
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
              <Package className="text-emerald-500 size-7" />
              البرامج والباقات السياحية (Tour Packages & Bundles)
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              تصميم وإدارة الجداول السياحية المتكاملة شاملة الفنادق، النقل الخاص، الجولات اليومية والإرشاد.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditingPkg(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="size-4" />
              <span>إضافة برنامج سياحي جديد</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "packages"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="size-4" />
            <span>البرامج والباقات السياحية ({packages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("addons");
              if (addons.length === 0) void fetchAddons();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "addons"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-4 text-amber-400" />
            <span>ترقيات وخدمات الـ VIP لمراحل الحجز ({addons.length || 6})</span>
          </button>
        </div>

        {activeTab === "addons" ? (
          <div className="space-y-6">
            {/* VIP Add-ons Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    إدارة ترقيات وخدمات الـ VIP لمراحل الحجز
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    تظهر هذه الخدمات في الخطوة 3 بصفحة إتمام الحجز للعملاء (`/package/book`)، وتتيح للعميل اختيار إضافات رفيعة المستوى لتعزيز رحلته.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {addonFeedback && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    {addonFeedback}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveAddons}
                  disabled={isSavingAddons}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <Save className="size-4" />
                  <span>{isSavingAddons ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
                </button>
              </div>
            </div>

            {/* Addons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addons.map((addon) => {
                const getIcon = () => {
                  switch (addon.icon) {
                    case "car":
                      return <Car className="size-5 text-emerald-500" />;
                    case "yacht":
                      return <Anchor className="size-5 text-blue-500" />;
                    case "camera":
                      return <Camera className="size-5 text-purple-500" />;
                    case "shield":
                      return <ShieldCheck className="size-5 text-teal-500" />;
                    default:
                      return <Sparkles className="size-5 text-amber-500" />;
                  }
                };

                return (
                  <div
                    key={addon.id}
                    className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                          {getIcon()}
                        </div>
                        <div>
                          <span className="text-xs font-mono text-muted-foreground">{addon.id}</span>
                          <h4 className="text-sm font-bold text-foreground">
                            {addon.titleAr}
                          </h4>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs font-medium text-muted-foreground">
                          {addon.isActive !== false ? "نشط" : "معطل"}
                        </span>
                        <input
                          type="checkbox"
                          checked={addon.isActive !== false}
                          onChange={(e) =>
                            setAddons((prev) =>
                              prev.map((a) =>
                                a.id === addon.id ? { ...a, isActive: e.target.checked } : a
                              )
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          عنوان الخدمة (بالعربية)
                        </label>
                        <input
                          type="text"
                          value={addon.titleAr || ""}
                          onChange={(e) =>
                            setAddons((prev) =>
                              prev.map((a) =>
                                a.id === addon.id ? { ...a, titleAr: e.target.value } : a
                              )
                            )
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          السعر (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                          <input
                            type="number"
                            min="0"
                            value={addon.priceUsd ?? 0}
                            onChange={(e) =>
                              setAddons((prev) =>
                                prev.map((a) =>
                                  a.id === addon.id
                                    ? { ...a, priceUsd: Number(e.target.value) || 0 }
                                    : a
                                )
                              )
                            }
                            className="w-full pr-7 pl-3 py-1.5 rounded-lg border border-input bg-background text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        وصف الخدمة ومميزاتها (بالعربية)
                      </label>
                      <textarea
                        rows={2}
                        value={addon.descAr || ""}
                        onChange={(e) =>
                          setAddons((prev) =>
                            prev.map((a) =>
                              a.id === addon.id ? { ...a, descAr: e.target.value } : a
                            )
                          )
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Real KPI Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>إجمالي البرامج</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {packages.length} باقة
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              جداول سياحية متكاملة نشطة
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>الباقات المميزة</span>
              <Sparkles className="size-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {packages.filter((p) => p.isFeatured).length} باقة
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">معروضة في صدارة المنصة</div>
          </div>

          <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>المناطق المغطاة</span>
              <MapPin className="size-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {new Set(packages.map((p) => p.destination)).size} وجهات
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">إسطنبول، طرابزون، كابادوكيا، أنطاليا</div>
          </div>

          <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>متوسط السعر / الفرد</span>
              <Percent className="size-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              $
              {packages.length > 0
                ? Math.round(
                    packages.reduce((acc, p) => acc + (p.price || 0), 0) / packages.length
                  ).toLocaleString()
                : "0"}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              يشمل الإقامة والنقل الخاص
            </div>
          </div>
        </div>

        {/* AI Importer */}
        <div className="p-4 rounded-2xl border border-border/80 bg-card/60">
          <ServiceImportChat
            serviceType="package"
            onApply={async (item) => {
              const normalized = normalizeImportedPackage(item);
              await persistAdminPackage({
                ...normalized,
                isPublished: true,
                isFeatured: normalized.isFeatured !== false,
                createdAt: new Date().toISOString(),
              });
              refresh();
            }}
          />
        </div>

        {/* Search, Filter Pills & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان، الوجهة، أو تفاصيل البرنامج..."
              className="w-full pr-10 pl-4 py-2 bg-background border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
              <button
                type="button"
                onClick={() => setDestinationFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  destinationFilter === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                جميع الوجهات ({packages.length})
              </button>
              {destinations.slice(0, 5).map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setDestinationFilter(dest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    destinationFilter === dest
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>

            <div className="flex items-center p-1 rounded-xl bg-muted border border-border shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="عرض الشبكة"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="عرض الجدول"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content View: Grid or Table */}
        {filtered.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-border bg-card">
            <Package className="mx-auto mb-3 text-muted-foreground size-12" />
            <h3 className="text-base font-bold text-foreground">لم يتم العثور على أي برنامج</h3>
            <p className="text-xs text-muted-foreground mt-1">جرب تغيير معايير البحث أو الفلترة</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pkg) => (
              <div
                key={pkg.id}
                className="group rounded-3xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Photo & Badge */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  {pkg.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pkg.images[0].url}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="size-12 opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {pkg.isFeatured && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-sm">
                        <Sparkles className="size-3" />
                        <span>مميز</span>
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-[11px] flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>{pkg.durationDays} أيام</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                      <MapPin className="size-3 text-emerald-400" />
                      <span>{tContent(pkg, "destination", locale) || pkg.destination}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs flex items-center gap-1">
                      <Star className="size-3 fill-amber-400" />
                      <span>{pkg.rating || "4.9"}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">
                      {tContent(pkg, "title", locale) || pkg.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {tContent(pkg, "description", locale) ||
                        pkg.description ||
                        pkg.amenities?.join(" · ")}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground">السعر للشخص</div>
                      <div className="text-lg font-black text-foreground font-mono">
                        ${pkg.price?.toLocaleString()} USD
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPkg(pkg);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-muted hover:bg-emerald-500/10 hover:text-emerald-500 text-foreground transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="size-4" />
                      </button>

                      {deleteConfirmId === pkg.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(pkg.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                          >
                            تأكيد
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1.5 rounded-lg bg-muted text-xs"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(pkg.id)}
                          className="p-2 rounded-xl bg-muted hover:bg-red-500/10 hover:text-red-500 text-foreground transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="bg-muted/70 text-muted-foreground font-semibold border-b border-border text-[11px] sm:text-xs">
                  <tr>
                    <th className="py-3.5 px-4 text-start">البرنامج السياحي</th>
                    <th className="py-3.5 px-4 text-start">الوجهة والدولة</th>
                    <th className="py-3.5 px-4 text-start">المدة</th>
                    <th className="py-3.5 px-4 text-start">السعر</th>
                    <th className="py-3.5 px-4 text-start">التقييم</th>
                    <th className="py-3.5 px-4 text-start">المزايا</th>
                    <th className="py-3.5 px-4 text-start">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {pkg.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={pkg.images[0].url}
                              alt=""
                              className="size-10 rounded-xl object-cover shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-foreground">
                              {tContent(pkg, "title", locale) || pkg.title}
                            </div>
                            {pkg.isFeatured && (
                              <span className="text-[10px] text-amber-500 font-bold">★ مميز</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {tContent(pkg, "destination", locale) || pkg.destination}
                      </td>
                      <td className="py-4 px-4 font-mono">{pkg.durationDays} أيام</td>
                      <td className="py-4 px-4 font-black font-mono text-foreground">
                        ${pkg.price?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="size-3 fill-amber-500" />
                          <span>{pkg.rating || "4.9"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground max-w-[200px] truncate">
                        {pkg.amenities?.join(", ")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPkg(pkg);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-foreground"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(pkg.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}

        <PackageFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPkg(null);
          }}
          onSubmit={editingPkg ? handleUpdate : handleAdd}
          editPackage={editingPkg}
        />
      </WhiteLabelUpgradeOverlay>
    </div>
  );
}
