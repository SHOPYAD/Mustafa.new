"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Phone,
  Filter,
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
import { normalizeImportedHotel, cleanHotelDisplayName } from "@/lib/import-normalize";
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

  const filtersScrollRef = useRef<HTMLDivElement>(null);

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

  // Scroll filter pills horizontally (RTL-aware)
  const scrollFilters = (direction: "left" | "right") => {
    if (!filtersScrollRef.current) return;
    const amount = 240;
    const sign = direction === "left" ? -amount : amount;
    filtersScrollRef.current.scrollBy({ left: sign, behavior: "smooth" });
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
      const cleanAr = cleanHotelDisplayName(h.nameAr, h.slug, h.nameEn);
      const cleanEn = cleanHotelDisplayName(h.nameEn, h.slug, cleanAr);
      const matchesSearch =
        !q ||
        cleanEn.toLowerCase().includes(q) ||
        cleanAr.includes(q) ||
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
      {/* 1. Header & Actions Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              الكتالوج الداخلي المستقل
            </span>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/admin/hotels"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <span>مزودو الفنادق والمارك أب</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground flex flex-wrap items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="size-5" />
            </div>
            <span>الكتالوج الداخلي للفنادق المباشرة</span>
            <span dir="ltr" className="text-xs sm:text-sm font-bold text-muted-foreground font-mono">(Direct Inventory)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-foreground text-xs font-bold font-mono">
              {hotels.length} فندق
            </span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            إدارة وتخصيص فنادق الوكالة الخاصة، أتمتة هوامش الربح المباشرة، وتحديثات الأسعار اللحظية.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingHotel(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-primary hover:brightness-110 text-primary-foreground font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center gap-2 text-xs active:scale-98"
          >
            <Plus className="size-4" />
            <span>إضافة فندق جديد</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2.5 border border-border bg-card hover:bg-muted text-foreground font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 text-xs"
          >
            <Sparkles className="size-4 text-primary" />
            <span>استيراد جماعي بالـ AI</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiImporterOpen((prev) => !prev)}
            className="px-3.5 py-2.5 border border-border bg-card hover:bg-muted text-foreground font-semibold rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>شات الاستيراد الفردي</span>
            <ChevronDown className={`size-3 text-muted-foreground transition-transform ${isAiImporterOpen ? "rotate-180" : ""}`} />
          </button>

          <div className="h-5 w-px bg-border my-auto hidden sm:block" />

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2.5 border border-border bg-card hover:bg-muted text-foreground font-semibold rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-2xs"
            title="إعادة ضبط الكتالوج للفنادق الافتراضية"
          >
            <RotateCcw className="size-3.5 text-muted-foreground" />
            <span>إعادة ضبط</span>
          </button>

          {hotels.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="px-3.5 py-2.5 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs"
            >
              <Trash2 className="size-3.5" />
              <span>
                {selectedHotelIds.length > 0
                  ? `حذف المحدد (${selectedHotelIds.length})`
                  : "حذف جماعي"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive Metrics Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">إجمالي فنادق الكتالوج</p>
            <p className="text-xl font-black text-foreground font-mono mt-0.5">{hotels.length}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">الفنادق النشطة للعملاء</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Star className="size-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">فنادق 5 نجوم (VIP)</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">{fiveStarCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">الوجهات المغطاة</p>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">{uniqueCities.length} وجهة</p>
          </div>
        </div>
      </div>

      {/* 3. Autonomous Rate & Inventory Sync Daemon Controller */}
      <HotelSyncDaemonController />

      {/* 4. Collapsible Single AI Importer Section */}
      {isAiImporterOpen && (
        <div className="rounded-2xl border border-primary/20 bg-card p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  شات استيراد فندق منفرد بالذكاء الاصطناعي (AI Chat Importer)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  الصق رابط الفندق من Booking أو Tripadvisor وسيقوم الوكيل باستخراج وتدقيق البيانات والصور فورياً
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiImporterOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
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

      {/* 5. Hotel Catalog Search, Zero-Scroll Filters & Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        {/* Search Bar & Result Counter */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم الفندق (عربي/إنجليزي)، المدينة، أو رقم الهاتف..."
              className="w-full h-10 ps-10 pe-10 rounded-xl border border-input bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-xs font-semibold">
              المطابقة: {filtered.length} من {hotels.length}
            </span>
          </div>
        </div>

        {/* Arrow-Controlled Quick Filter Strip (NO VISIBLE SCROLLBAR) */}
        <div className="relative flex items-center">
          {/* Scroll Chevrons */}
          <button
            type="button"
            onClick={() => scrollFilters("right")}
            className="shrink-0 p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors me-1 z-10"
            title="تمرير لليمين"
          >
            <ChevronRight className="size-4" />
          </button>

          <div
            ref={filtersScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-smooth select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              type="button"
              onClick={() => {
                setStarFilter("all");
                setCityFilter("all");
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                starFilter === "all" && cityFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card hover:bg-muted text-foreground"
              }`}
            >
              الكل ({hotels.length})
            </button>

            <button
              type="button"
              onClick={() => setStarFilter(starFilter === "5" ? "all" : "5")}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                starFilter === "5"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card hover:bg-muted text-foreground"
              }`}
            >
              <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>5 نجوم فاخر ({fiveStarCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStarFilter(starFilter === "4" ? "all" : "4")}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                starFilter === "4"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card hover:bg-muted text-foreground"
              }`}
            >
              4 نجوم
            </button>

            <button
              type="button"
              onClick={() => setStarFilter(starFilter === "featured" ? "all" : "featured")}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                starFilter === "featured"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card hover:bg-muted text-foreground"
              }`}
            >
              <span>المميزة فقط</span>
            </button>

            <div className="h-4 w-px bg-border my-auto shrink-0 mx-1" />

            {uniqueCities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCityFilter(cityFilter === c ? "all" : c)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cityFilter === c
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card hover:bg-muted text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollFilters("left")}
            className="shrink-0 p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ms-1 z-10"
            title="تمرير لليسار"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>

        {/* Floating Bulk Selection Action Banner */}
        {selectedHotelIds.length > 0 && (
          <div className="p-3.5 rounded-xl bg-muted border border-border text-foreground flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <CheckSquare className="size-4 text-primary" />
              <span>تم تحديد {selectedHotelIds.length} فندق من أصل {filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedHotelIds([])}
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
              >
                إلغاء التحديد
              </button>
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="size-3.5" />
                <span>حذف الفنادق المحددة ({selectedHotelIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Table Container (Clean responsive borders, zero-scrollbar styling) */}
        <div className="overflow-x-auto rounded-xl border border-border [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground font-bold">
                <th className="p-3.5 text-center w-12">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="p-1 hover:text-foreground transition-colors"
                    title="تحديد الكل"
                  >
                    {selectedHotelIds.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="size-4 text-primary" />
                    ) : (
                      <Square className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </th>
                <th className="p-3.5 text-start">الفندق والبيانات</th>
                <th className="p-3.5 text-center">المدينة</th>
                <th className="p-3.5 text-center">التصنيف</th>
                <th className="p-3.5 text-center">الغرف</th>
                <th className="p-3.5 text-center">الواتساب المباشر</th>
                <th className="p-3.5 text-center">مميز</th>
                <th className="p-3.5 text-center">الحالة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-muted-foreground">
                    <Building2 className="size-8 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="font-bold text-foreground">لا توجد فنادق تطابق معايير البحث الحالية.</p>
                    <p className="text-xs text-muted-foreground mt-1">جرّب مسح البحث أو تغيير فلاتر النجوم والمدن.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((hotel) => {
                  const isSelected = selectedHotelIds.includes(hotel.id);
                  return (
                    <tr
                      key={hotel.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-muted/70" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(hotel.id)}
                          className="p-1 hover:text-foreground"
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4 text-muted-foreground" />
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
                              className="size-12 rounded-xl object-cover border border-border shrink-0 shadow-2xs no-theme-image"
                            />
                          ) : (
                            <div className="size-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                              <Hotel className="size-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-foreground truncate max-w-[280px]">
                              {cleanHotelDisplayName(hotel.nameAr, hotel.slug, hotel.nameEn)}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[280px]" dir="ltr">
                              {cleanHotelDisplayName(hotel.nameEn, hotel.slug, hotel.nameAr)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-center font-semibold text-foreground">
                        <span className="px-2.5 py-1 rounded-lg bg-muted text-[11px] border border-border">
                          {hotel.city}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1 text-amber-500 font-bold">
                          <span>{hotel.stars}</span>
                          <Star className="size-3.5 fill-amber-500 text-amber-500" />
                        </div>
                      </td>

                      <td className="p-3 text-center font-bold text-foreground">
                        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono text-xs">
                          {hotel.rooms?.length || 0} غرف
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono text-[11px] text-muted-foreground">
                        {hotel.whatsappNumber ? (
                          <a
                            href={`https://wa.me/${hotel.whatsappNumber.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                            dir="ltr"
                          >
                            <Phone className="size-3" />
                            <span>{hotel.whatsappNumber}</span>
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(hotel)}
                          className={`p-1.5 rounded-lg transition-all ${
                            hotel.isFeatured
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title={hotel.isFeatured ? "فندق مميز" : "تمييز الفندق"}
                        >
                          <Star className={`size-4 ${hotel.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                        </button>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleActive(hotel)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            hotel.isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground border border-border"
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
                            className="p-2 rounded-lg bg-card hover:bg-muted text-foreground border border-border transition-colors shadow-2xs"
                            title="تعديل الفندق"
                          >
                            <Pencil className="size-3.5" />
                          </button>

                          <Link
                            href={`/hotels/${hotel.slug || hotel.id}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-card hover:bg-muted text-foreground border border-border transition-colors shadow-2xs"
                            title="معاينة في الموقع"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(hotel.id)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors shadow-2xs"
                            title="حذف الفندق"
                          >
                            <Trash2 className="size-3.5" />
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
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-xl bg-rose-500/10">
                <AlertTriangle className="size-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">تأكيد حذف الفندق</h3>
                <p className="text-xs text-muted-foreground">سيتم إزالة الفندق وغرفه وصوره كلياً من الكتالوج الداخلي</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الفندق؟ لن يظهر في نتائج البحث الداخلية بعد الحذف.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
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
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-xl bg-rose-500/10">
                <Trash2 className="size-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">تأكيد الحذف الجماعي</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedHotelIds.length > 0
                    ? `سيتم حذف ${selectedHotelIds.length} فندق محدد دفعة واحدة`
                    : "سيتم حذف جميع فنادق الكتالوج الداخلي دفعة واحدة"}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              تحذير: هذا الإجراء سيقوم بحذف الفنادق المختارة بشكل فوري. يمكنك استعادة الفنادق الافتراضية لاحقاً عبر زر &quot;إعادة ضبط&quot;.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
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
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-3 rounded-xl bg-primary/10">
                <RotateCcw className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">إعادة ضبط الكتالوج</h3>
                <p className="text-xs text-muted-foreground">استرجاع الفنادق الافتراضية الـ 24 المعتمدة</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              سيتم استعادة كافة الفنادق والغرف والصور الأصلية للمنصة. هل تود المتابعة؟
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-primary hover:brightness-110 text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 transition-all"
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
