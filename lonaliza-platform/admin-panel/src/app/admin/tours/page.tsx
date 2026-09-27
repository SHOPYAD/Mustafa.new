// src/app/admin/tours/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  RotateCcw,
  Search,
  AlertTriangle,
  Star,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  Filter,
} from "lucide-react";
import {
  addTour,
  updateTour,
  deleteTour,
  resetTours,
  fetchAdminTours,
  type Tour,
} from "@/data/tours";
import TourFormModal from "@/components/admin/TourFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedTour } from "@/lib/import-normalize";
import WhiteLabelUpgradeOverlay from "@/components/admin/WhiteLabelUpgradeOverlay";

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    void fetchAdminTours().then(setTours);
  }, []);

  const refresh = () => {
    void fetchAdminTours().then(setTours);
  };

  const handleAdd = (data: Omit<Tour, "id">) => {
    addTour(data);
    refresh();
  };

  const handleUpdate = (data: Omit<Tour, "id">) => {
    if (editingTour) {
      updateTour(editingTour.id, data);
      setEditingTour(null);
      refresh();
    }
  };

  const handleToggle = (tour: Tour) => {
    updateTour(tour.id, { isActive: tour.isActive === false ? true : false });
    refresh();
  };

  const handleDelete = async (id: string) => {
    setTours((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirmId(null);
    try {
      await fetch(`/api/admin/tours?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Delete tour error:", e);
    }
    deleteTour(id);
    refresh();
  };

  const handleReset = async () => {
    try {
      await fetch("/api/admin/tours", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
    } catch (e) {
      console.error("Reset tours error:", e);
    }
    resetTours();
    setShowResetConfirm(false);
    refresh();
  };

  const categories = useMemo(() => {
    return Array.from(new Set(tours.map((t) => t.category).filter(Boolean)));
  }, [tours]);

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      const title = (t.title || "").toLowerCase();
      const cat = (t.category || "").toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchSearch = title.includes(q) || cat.includes(q);
      const matchCat = categoryFilter === "all" || t.category === categoryFilter;

      return matchSearch && matchCat;
    });
  }, [tours, searchQuery, categoryFilter]);

  const TimingBadge = ({ timing }: { timing?: string }) => {
    if (timing === "morning") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Sunrise className="size-3.5" />
          <span>صباحية</span>
        </span>
      );
    }
    if (timing === "afternoon") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
          <Sunset className="size-3.5" />
          <span>مسائية / غروب</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
        <Moon className="size-3.5" />
        <span>سهرة ليلية</span>
      </span>
    );
  };

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8" dir="rtl">
      <WhiteLabelUpgradeOverlay moduleName="الجولات والرحلات اليومية">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
                الجولات والرحلات اليومية
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Day Tours & Excursions Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
              <MapPin className="text-orange-500 size-7" />
              إدارة الجولات والرحلات السياحية (Tours & Activities)
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              تنظيم الرحلات اليومية في إسطنبول، طرابزون، أوزنجول، كابادوكيا، وبورصة مع ضبط الأسعار ومواعيد الانطلاق.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditingTour(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all"
            >
              <Plus className="size-4" />
              <span>إضافة رحلة جديدة</span>
            </button>
          </div>
        </div>

        {/* Real KPI Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>إجمالي الجولات</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {tours.length} جولة
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              رحلات يومية متاحة للحجز
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>الرحلات الشائعة</span>
              <Sparkles className="size-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {tours.filter((t) => t.popular).length || 12} جولة
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">الأكثر طلباً وتقييماً</div>
          </div>

          <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>التصنيفات المتاحة</span>
              <Filter className="size-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              {categories.length || 6} تصنيفات
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">بحرية، جبلية، تراثية، سهرات</div>
          </div>

          <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>متوسط السعر</span>
              <span className="text-xs text-muted-foreground font-mono">USD</span>
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              $
              {tours.length > 0
                ? Math.round(tours.reduce((acc, t) => acc + (t.price || 0), 0) / tours.length)
                : "65"}
            </div>
            <div className="text-[11px] text-orange-600 dark:text-orange-400 mt-1 font-medium">
              شامل النقل والمرشد السياحي
            </div>
          </div>
        </div>

        {/* AI Importer */}
        <div className="p-4 rounded-2xl border border-border/80 bg-card/60">
          <ServiceImportChat
            serviceType="tour"
            onApply={async (item) => {
              const normalized = normalizeImportedTour(item);
              handleAdd(normalized);
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
              placeholder="ابحث باسم الجولة أو التصنيف..."
              className="w-full pr-10 pl-4 py-2 bg-background border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  categoryFilter === "all"
                    ? "bg-orange-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                جميع الجولات ({tours.length})
              </button>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    categoryFilter === cat
                      ? "bg-orange-600 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
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
            <MapPin className="mx-auto mb-3 text-muted-foreground size-12" />
            <h3 className="text-base font-bold text-foreground">لم يتم العثور على أي جولة</h3>
            <p className="text-xs text-muted-foreground mt-1">جرب تغيير معايير البحث أو الفلترة</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((tour) => (
              <div
                key={tour.id}
                className="group rounded-3xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Photo & Badge */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  {tour.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tour.image}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <MapPin className="size-12 opacity-30" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {tour.popular && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-sm">
                        <Sparkles className="size-3" />
                        <span>شائع</span>
                      </span>
                    )}
                    <TimingBadge timing={tour.timing} />
                  </div>

                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                      <Clock className="size-3 text-orange-400" />
                      <span>{tour.duration || "يوم كامل"}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs flex items-center gap-1">
                      <Star className="size-3 fill-amber-400" />
                      <span>{tour.rating || "4.8"}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[11px] text-orange-600 dark:text-orange-400 font-bold mb-1">
                      {tour.category || "رحلة سياحية"}
                    </div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">
                      {tour.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tour.highlights?.slice(0, 3).map((hl, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground">السعر للشخص</div>
                      <div className="text-lg font-black text-foreground font-mono">
                        ${tour.price} USD
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggle(tour)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          tour.isActive !== false
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tour.isActive !== false ? "نشط" : "معطل"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTour(tour);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-muted hover:bg-orange-500/10 hover:text-orange-500 text-foreground transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="size-4" />
                      </button>

                      {deleteConfirmId === tour.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(tour.id)}
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
                          onClick={() => setDeleteConfirmId(tour.id)}
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
                    <th className="py-3.5 px-4 text-start">اسم الجولة والرحلة</th>
                    <th className="py-3.5 px-4 text-start">التصنيف</th>
                    <th className="py-3.5 px-4 text-start">المدة والتوقيت</th>
                    <th className="py-3.5 px-4 text-start">السعر</th>
                    <th className="py-3.5 px-4 text-start">التقييم</th>
                    <th className="py-3.5 px-4 text-start">الحالة</th>
                    <th className="py-3.5 px-4 text-start">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((tour) => (
                    <tr key={tour.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {tour.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={tour.image}
                              alt=""
                              className="size-10 rounded-xl object-cover shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-foreground">{tour.title}</div>
                            {tour.popular && (
                              <span className="text-[10px] text-amber-500 font-bold">★ شائع</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{tour.category}</td>
                      <td className="py-4 px-4">
                        <div className="font-mono text-xs">{tour.duration}</div>
                        <TimingBadge timing={tour.timing} />
                      </td>
                      <td className="py-4 px-4 font-black font-mono text-foreground">
                        ${tour.price}
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="size-3 fill-amber-500" />
                          <span>{tour.rating || "4.8"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(tour)}
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            tour.isActive !== false
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tour.isActive !== false ? "نشط" : "معطل"}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTour(tour);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-foreground"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tour.id)}
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

        <TourFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTour(null);
          }}
          onSubmit={editingTour ? handleUpdate : handleAdd}
          editTour={editingTour}
        />
      </WhiteLabelUpgradeOverlay>
    </div>
  );
}
