"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Hotel,
  RotateCcw,
  Search,
  AlertTriangle,
  Star,
  Sparkles,
  Building2,
  CheckSquare,
  Square,
  ExternalLink,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import {
  getHotels,
  addHotel,
  updateHotel,
  deleteHotel,
  resetHotels,
} from "@/data/hotels";
import type { Hotel as HotelType, HotelInput } from "@/types/hotel";
import HotelFormModal from "@/components/admin/HotelFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import BulkHotelImporterModal from "@/components/admin/BulkHotelImporterModal";
import HotelSyncDaemonController from "@/components/admin/HotelSyncDaemonController";
import { normalizeImportedHotel } from "@/lib/import-normalize";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AdminHotelsCatalogPage() {
  const { t } = useLocale();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isAiImporterOpen, setIsAiImporterOpen] = useState(false);

  useEffect(() => {
    setHotels(getHotels());
  }, []);

  const refresh = () => {
    const list = getHotels();
    setHotels(list);
    setSelectedHotelIds((prev) => prev.filter((id) => list.some((h) => h.id === id)));
  };

  const handleAdd = (data: HotelInput) => {
    addHotel(data);
    refresh();
  };

  const handleUpdate = (data: HotelInput) => {
    if (editingHotel) {
      updateHotel(editingHotel.id, data);
      setEditingHotel(null);
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
    deleteHotel(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleBulkDelete = () => {
    if (selectedHotelIds.length > 0) {
      selectedHotelIds.forEach((id) => deleteHotel(id));
      setSelectedHotelIds([]);
    } else {
      hotels.forEach((h) => deleteHotel(h.id));
    }
    setShowBulkDeleteConfirm(false);
    refresh();
  };

  const handleReset = () => {
    resetHotels();
    setShowResetConfirm(false);
    setSelectedHotelIds([]);
    refresh();
  };

  const toggleActive = (hotel: HotelType) => {
    updateHotel(hotel.id, { isActive: !hotel.isActive });
    refresh();
  };

  const toggleFeatured = (hotel: HotelType) => {
    updateHotel(hotel.id, { isFeatured: !hotel.isFeatured });
    refresh();
  };

  const toggleSelectAll = () => {
    if (selectedHotelIds.length === filtered.length) {
      setSelectedHotelIds([]);
    } else {
      setSelectedHotelIds(filtered.map((h) => h.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedHotelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePublishBulk = (importedHotels: HotelInput[]) => {
    importedHotels.forEach((item) => {
      addHotel(item);
    });
    refresh();
  };

  // Extract unique cities
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => {
      if (h.city) set.add(h.city.trim());
    });
    return Array.from(set);
  }, [hotels]);

  // Filtered hotels list
  const filtered = useMemo(() => {
    return hotels.filter((h) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        h.nameEn.toLowerCase().includes(q) ||
        h.nameAr.includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.whatsappNumber.includes(q.replace(/\D/g, ""));

      const matchesStar =
        starFilter === "all" ||
        (starFilter === "5" && h.stars >= 5) ||
        (starFilter === "4" && h.stars === 4) ||
        (starFilter === "featured" && h.isFeatured);

      const matchesCity = cityFilter === "all" || h.city.toLowerCase() === cityFilter.toLowerCase();

      return matchesSearch && matchesStar && matchesCity;
    });
  }, [hotels, searchQuery, starFilter, cityFilter]);

  const activeCount = hotels.filter((h) => h.isActive).length;
  const fiveStarCount = hotels.filter((h) => h.stars >= 5).length;

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6" dir="rtl">
      {/* 1. Modern Luxury Header with Aligned Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 text-purple-800 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-purple-600 animate-pulse" />
              الكتالوج الداخلي المستقل
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link
              href="/admin/hotels"
              className="text-xs font-bold text-slate-500 hover:text-purple-700 dark:text-slate-400 inline-flex items-center gap-1 transition-colors"
            >
              <span>مزودو الفنادق والمارك أب</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-purple-900/20">
              <Building2 className="size-5 text-amber-300" />
            </div>
            <span>الكتالوج الداخلي للفنادق (Direct Inventory)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black">
              {hotels.length} فندق
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            إدارة وتخصيص فنادق الوكالة الخاصة، أتمتة هوامش الربح المباشرة، وتحديثات الأسعار اللحظية.
          </p>
        </div>

        {/* Action Buttons Toolbar - Unified & Perfectly Aligned */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingHotel(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 hover:from-purple-800 hover:to-indigo-900 text-white font-extrabold rounded-2xl shadow-md shadow-purple-900/20 transition-all flex items-center gap-2 text-xs active:scale-98"
          >
            <Plus className="size-4 text-amber-300" />
            <span>إضافة فندق جديد</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2.5 border-2 border-purple-300 dark:border-purple-800/60 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-950 dark:text-purple-300 font-black rounded-2xl shadow-2xs transition-all flex items-center gap-2 text-xs"
          >
            <Sparkles className="size-4 text-amber-500" />
            <span className="font-black text-purple-950 dark:text-purple-200">استيراد جماعي بالـ AI</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiImporterOpen((prev) => !prev)}
            className="px-3.5 py-2.5 border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl transition-all flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Sparkles className="size-3.5 text-purple-600 dark:text-purple-400" />
            <span className="font-black text-slate-900 dark:text-white">شات الاستيراد الفردي</span>
            <ChevronDown className={`size-3 text-slate-600 dark:text-slate-300 transition-transform ${isAiImporterOpen ? "rotate-180" : ""}`} />
          </button>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 my-auto hidden sm:block" />

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2.5 border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl transition-all flex items-center gap-1.5 text-xs shadow-2xs"
            title="إعادة ضبط الكتالوج للفنادق الافتراضية"
          >
            <RotateCcw className="size-3.5 text-slate-700 dark:text-slate-300" />
            <span className="font-black text-slate-900 dark:text-white">إعادة ضبط</span>
          </button>

          {hotels.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="px-3.5 py-2.5 border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold rounded-2xl transition-all flex items-center gap-1.5 text-xs"
            >
              <Trash2 className="size-3.5" />
              <span>
                {selectedHotelIds.length > 0
                  ? `حذف المحدد (${selectedHotelIds.length})`
                  : "حذف جماعي للكل"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/60 flex items-center justify-center shrink-0">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي فنادق الكتالوج</p>
            <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{hotels.length}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الفنادق النشطة للعملاء</p>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{activeCount}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center shrink-0">
            <Star className="size-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">فنادق 5 نجوم (VIP Luxury)</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{fiveStarCount}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">المدن والوجهات المغطاة</p>
            <p className="text-xl font-black text-indigo-700 dark:text-indigo-400 tabular-nums">{uniqueCities.length} وجهات</p>
          </div>
        </div>
      </div>

      {/* 3. Autonomous Rate & Inventory Sync Daemon Controller */}
      <HotelSyncDaemonController />

      {/* 4. Collapsible Single AI Importer Section */}
      {isAiImporterOpen && (
        <div className="rounded-3xl border border-purple-200/90 dark:border-purple-800/70 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  شات استيراد فندق منفرد بالذكاء الاصطناعي (AI Chat Importer)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  الصق رابط الفندق من Booking أو Tripadvisor وسيقوم الوكيل باستخراج وتدقيق البيانات والصور فورياً
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiImporterOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="size-4" />
            </button>
          </div>

          <ServiceImportChat
            serviceType="hotel"
            onApply={(data: Record<string, unknown>) => {
              const normalized = normalizeImportedHotel(data);
              handleAdd(normalized);
            }}
          />
        </div>
      )}

      {/* 5. Hotel Catalog Search, Filter & Management Table */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        {/* Search and Quick Filters */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم الفندق (عربي/إنجليزي)، المدينة، أو رقم الواتساب..."
                className="w-full h-11 ps-10 pe-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status and Counters */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                نتائج البحث: {filtered.length} من {hotels.length}
              </span>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            <button
              type="button"
              onClick={() => {
                setStarFilter("all");
                setCityFilter("all");
              }}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                starFilter === "all" && cityFilter === "all"
                  ? "bg-purple-700 text-white shadow-xs font-black"
                  : "border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100"
              }`}
            >
              <span style={{ color: starFilter === "all" && cityFilter === "all" ? "#ffffff" : "#0f172a" }}>
                الكل ({hotels.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStarFilter(starFilter === "5" ? "all" : "5")}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                starFilter === "5"
                  ? "bg-purple-700 text-white shadow-xs font-black"
                  : "border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100"
              }`}
            >
              <Star className="size-3.5 fill-amber-400 text-amber-500 shrink-0" />
              <span
                className="font-bold"
                style={{ color: starFilter === "5" ? "#ffffff" : "#0f172a" }}
              >
                5 نجوم فاخر ({fiveStarCount})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStarFilter(starFilter === "4" ? "all" : "4")}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                starFilter === "4"
                  ? "bg-purple-700 text-white shadow-xs font-black"
                  : "border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100"
              }`}
            >
              <span style={{ color: starFilter === "4" ? "#ffffff" : "#0f172a" }}>4 نجوم</span>
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 my-auto shrink-0" />

            {uniqueCities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCityFilter(cityFilter === c ? "all" : c)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cityFilter === c
                    ? "bg-indigo-700 text-white shadow-xs font-black"
                    : "border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100"
                }`}
              >
                <span style={{ color: cityFilter === c ? "#ffffff" : "#0f172a" }}>{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Bulk Selection Action Banner */}
        {selectedHotelIds.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-purple-900 text-white flex items-center justify-between gap-4 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-xs font-extrabold">
              <CheckSquare className="size-4 text-amber-300" />
              <span>تم تحديد {selectedHotelIds.length} فندق من أصل {filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedHotelIds([])}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                إلغاء التحديد
              </button>
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="size-3.5" />
                <span>حذف الفنادق المحددة ({selectedHotelIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold">
                <th className="p-3.5 text-center w-12">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="p-1 hover:text-purple-700 transition-colors"
                    title="تحديد الكل"
                  >
                    {selectedHotelIds.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="size-4 text-purple-700" />
                    ) : (
                      <Square className="size-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3.5 text-start">الفندق والبيانات</th>
                <th className="p-3.5 text-center">المدينة</th>
                <th className="p-3.5 text-center">التصنيف</th>
                <th className="p-3.5 text-center">الغرف المتاحة</th>
                <th className="p-3.5 text-center">الواتساب المباشر</th>
                <th className="p-3.5 text-center">مميز</th>
                <th className="p-3.5 text-center">نشط للعملاء</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <Building2 className="size-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">لا توجد فنادق تطابق معايير البحث الحالية.</p>
                    <p className="text-xs text-slate-400 mt-1">جرّب مسح البحث أو تغيير فلاتر النجوم والمدن.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((hotel) => {
                  const isSelected = selectedHotelIds.includes(hotel.id);
                  return (
                    <tr
                      key={hotel.id}
                      className={`hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors ${
                        isSelected ? "bg-purple-50/60 dark:bg-purple-950/40" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(hotel.id)}
                          className="p-1 hover:text-purple-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-purple-700" />
                          ) : (
                            <Square className="size-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {hotel.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={hotel.images[0]}
                              alt={hotel.nameAr}
                              className="size-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs no-theme-image"
                            />
                          ) : (
                            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                              <Hotel className="size-5 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-black text-slate-900 dark:text-white truncate max-w-[280px]">
                              {hotel.nameAr || hotel.nameEn}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate max-w-[280px]">
                              {hotel.nameEn}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {hotel.city}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-0.5 text-amber-500 font-bold">
                          <span>{hotel.stars}</span>
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        </div>
                      </td>

                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-mono text-xs">
                          {hotel.rooms?.length || 0} غرف
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {hotel.whatsappNumber || "—"}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(hotel)}
                          className={`p-1.5 rounded-xl transition-all ${
                            hotel.isFeatured
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                              : "text-slate-300 hover:text-slate-500"
                          }`}
                          title={hotel.isFeatured ? "فندق مميز" : "تمييز الفندق"}
                        >
                          <Star className={`size-4 ${hotel.isFeatured ? "fill-amber-400" : ""}`} />
                        </button>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleActive(hotel)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            hotel.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {hotel.isActive ? "نشط" : "معطل"}
                        </button>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHotel(hotel);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors shadow-2xs"
                            title="تعديل الفندق"
                          >
                            <Pencil className="size-4 text-purple-800 dark:text-purple-300" />
                          </button>

                          <Link
                            href={`/hotels/${hotel.slug || hotel.id}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs"
                            title="معاينة في الموقع"
                          >
                            <ExternalLink className="size-4 text-blue-800 dark:text-blue-300" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(hotel.id)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors shadow-2xs"
                            title="حذف الفندق"
                          >
                            <Trash2 className="size-4 text-rose-700 dark:text-rose-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Hotel Form Modal */}
      {isModalOpen && (
        <HotelFormModal
          isOpen={isModalOpen}
          editHotel={editingHotel}
          onSubmit={(data: HotelInput) => {
            if (editingHotel) {
              handleUpdate(data);
            } else {
              handleAdd(data);
            }
            setIsModalOpen(false);
          }}
          onClose={() => {
            setIsModalOpen(false);
            setEditingHotel(null);
          }}
        />
      )}

      {/* Bulk Importer Modal */}
      {isBulkModalOpen && (
        <BulkHotelImporterModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onPublishAll={handlePublishBulk}
        />
      )}

      {/* Single Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">تأكيد حذف الفندق</h3>
                <p className="text-xs text-slate-500">سيتم إزالة الفندق وغرفه وصوره كلياً من الكتالوج الداخلي</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الفندق؟ لن يظهر في نتائج البحث الداخلية بعد الحذف.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50">
                <Trash2 className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">تأكيد الحذف الجماعي</h3>
                <p className="text-xs text-slate-500">
                  {selectedHotelIds.length > 0
                    ? `سيتم حذف ${selectedHotelIds.length} فندق محدد دفعة واحدة`
                    : "سيتم حذف جميع فنادق الكتالوج الداخلي دفعة واحدة"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              تحذير: هذا الإجراء سيقوم بحذف الفنادق المختارة بشكل فوري. يمكنك استعادة الفنادق الافتراضية لاحقاً عبر زر &quot;إعادة ضبط&quot;.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all"
              >
                حذف جماعي فوراً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Defaults Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-700">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50">
                <RotateCcw className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">إعادة ضبط الكتالوج</h3>
                <p className="text-xs text-slate-500">استرجاع الفنادق الافتراضية الـ 24 المعتمدة</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              سيتم استعادة كافة الفنادق والغرف والصور الأصلية للمنصة. هل تود المتابعة؟
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black shadow-md shadow-purple-700/20 transition-all"
              >
                نعم، استعادة الافتراضي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
