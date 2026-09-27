"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Hotel,
  RotateCcw,
  Star,
  Sparkles,
  Building2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  X,
  ChevronDown,
  MoreHorizontal,
  Phone,
  BedDouble,
  ShieldCheck,
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
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  type ColumnDef,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminHotelsCatalogPage({ embedded = false }: { embedded?: boolean }) {
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedHotelKeys, setSelectedHotelKeys] = useState<Set<string | number>>(new Set());
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
    setSelectedHotelKeys((prev) => {
      const next = new Set<string | number>();
      prev.forEach((id) => {
        if (list.some((h) => h.id === id)) next.add(id);
      });
      return next;
    });
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
    if (selectedHotelKeys.size > 0) {
      selectedHotelKeys.forEach((id) => deleteHotel(String(id)));
      setSelectedHotelKeys(new Set());
    } else {
      hotels.forEach((h) => deleteHotel(h.id));
    }
    setShowBulkDeleteConfirm(false);
    refresh();
  };

  const handleReset = () => {
    resetHotels();
    setShowResetConfirm(false);
    setSelectedHotelKeys(new Set());
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
  const fourStarCount = hotels.filter((h) => h.stars === 4).length;
  const featuredCount = hotels.filter((h) => h.isFeatured).length;

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-1.5 transition-all"
        onClick={() => {
          setEditingHotel(null);
          setIsModalOpen(true);
        }}
      >
        <Plus className="size-4" />
        <span>إضافة فندق جديد</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="rounded-xl border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 font-semibold gap-1.5"
        onClick={() => setIsBulkModalOpen(true)}
      >
        <Sparkles className="size-4 text-purple-500" />
        <span>استيراد جماعي بالـ AI</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="rounded-xl border-border/60 bg-card/60 backdrop-blur-md hover:bg-muted font-semibold gap-1.5"
        onClick={() => setIsAiImporterOpen((prev) => !prev)}
      >
        <Sparkles className="size-3.5 text-primary" />
        <span>شات الاستيراد</span>
        <ChevronDown className={`size-3 transition-transform ${isAiImporterOpen ? "rotate-180" : ""}`} />
      </Button>

      <Button
        type="button"
        variant="outline"
        className="rounded-xl border-border/60 bg-card/60 hover:bg-muted font-semibold gap-1.5"
        onClick={() => setShowResetConfirm(true)}
      >
        <RotateCcw className="size-3.5" />
        <span>إعادة ضبط</span>
      </Button>

      {hotels.length > 0 && selectedHotelKeys.size > 0 && (
        <Button
          type="button"
          variant="destructive"
          className="rounded-xl font-semibold gap-1.5 shadow-xs"
          onClick={() => setShowBulkDeleteConfirm(true)}
        >
          <Trash2 className="size-3.5" />
          <span>حذف المحدد ({selectedHotelKeys.size})</span>
        </Button>
      )}
    </div>
  );

  const columns: ColumnDef<HotelType>[] = [
    {
      key: "hotel",
      header: "الفندق والبيانات",
      render: (hotel) => (
        <div className="flex items-center gap-3 py-1">
          {hotel.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hotel.images[0]}
              alt={hotel.nameAr}
              className="h-12 w-12 rounded-xl object-cover border border-border/50 shrink-0 no-theme-image shadow-xs"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/60 text-muted-foreground">
              <Hotel className="size-5" />
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                {hotel.nameAr || hotel.nameEn}
              </span>
              {hotel.isFeatured && (
                <EnterpriseStatusBadge variant="royal" size="sm" label="مميز" />
              )}
            </div>
            <div className="truncate font-mono text-[11px] text-muted-foreground">
              {hotel.nameEn}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "city",
      header: "المدينة والوجهة",
      sortable: true,
      render: (hotel) => (
        <div className="flex items-center gap-1.5 text-xs">
          <MapPin size={13} className="text-primary shrink-0" />
          <span className="font-medium text-foreground">{hotel.city}</span>
        </div>
      ),
    },
    {
      key: "stars",
      header: "التصنيف",
      sortable: true,
      render: (hotel) => (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs tabular-nums">
          <span>{hotel.stars}</span>
          <Star className="size-3 fill-amber-500 text-amber-500" />
        </div>
      ),
    },
    {
      key: "rooms",
      header: "الغرف",
      align: "center",
      render: (hotel) => (
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <BedDouble size={13} />
          <span>{hotel.rooms?.length || 0}</span>
        </div>
      ),
    },
    {
      key: "whatsapp",
      header: "واتساب الحجز",
      render: (hotel) =>
        hotel.whatsappNumber ? (
          <a
            href={`https://wa.me/${hotel.whatsappNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono text-emerald-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone size={12} />
            <span dir="ltr">{hotel.whatsappNumber}</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground/60">—</span>
        ),
    },
    {
      key: "isActive",
      header: "الحالة",
      align: "center",
      render: (hotel) => (
        <EnterpriseStatusBadge
          variant={hotel.isActive ? "active" : "inactive"}
          label={hotel.isActive ? "نشط" : "معطل"}
          pulse={hotel.isActive}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (hotel) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-border/60 backdrop-blur-xl">
            <DropdownMenuItem onClick={() => toggleFeatured(hotel)}>
              {hotel.isFeatured ? "إلغاء التمييز" : "تمييز كفندق مفضل"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleActive(hotel)}>
              {hotel.isActive ? "تعطيل العرض" : "تفعيل الفندق"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingHotel(hotel);
                setIsModalOpen(true);
              }}
            >
              تعديل التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/hotels/${hotel.slug || hotel.id}`} target="_blank" className="flex items-center gap-2">
                <span>معاينة بالموقع</span>
                <ExternalLink size={12} />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteConfirmId(hotel.id)}
            >
              حذف الفندق
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {!embedded && (
        <EnterprisePageHeader
          breadcrumbs={[
            { label: "لوحة التحكم", href: "/admin" },
            { label: "محركات السفر", href: "/admin/hotels" },
            { label: "الكتالوج الداخلي" },
          ]}
          icon={<Building2 className="h-6 w-6 text-primary" />}
          title="الكتالوج الداخلي للفنادق"
          subtitle="إدارة عقود الفنادق المباشرة، فئات الغرف، الأسعار، والمزامنة مع الحسابات الميدانية."
          actions={actionButtons}
        />
      )}

      {embedded && <div className="flex justify-end">{actionButtons}</div>}

      {/* KPI Cards Strip */}
      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          title="إجمالي فنادق الكتالوج"
          value={hotels.length}
          subValue="فندق معتمد بالنظام"
          icon={<Building2 className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="الفنادق النشطة للبيع"
          value={activeCount}
          subValue="متاحة للحجز المباشر"
          icon={<CheckCircle2 className="size-5" />}
          color="emerald"
          change={hotels.length > 0 ? Math.round((activeCount / hotels.length) * 100) : 0}
          changeLabel="نسبة التوفر"
          trend="up"
        />
        <EnterpriseKpiCard
          title="فنادق 5 نجوم فاخرة"
          value={fiveStarCount}
          subValue="تصنيف النخبة الملكية"
          icon={<Star className="size-5" />}
          color="amber"
        />
        <EnterpriseKpiCard
          title="المدن والوجهات"
          value={uniqueCities.length}
          subValue="وجهات سياحية مغطاة"
          icon={<MapPin className="size-5" />}
          color="blue"
        />
      </EnterpriseKpiGrid>

      {/* Live Hotel Sync Daemon Controller */}
      <HotelSyncDaemonController />

      {/* Single AI Import Chat Accordion */}
      {isAiImporterOpen && (
        <Card className="rounded-2xl border-border/50 bg-card/70 backdrop-blur-xl shadow-lg shadow-black/5 overflow-hidden animate-in fade-in">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-border/40 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                <span>شات استيراد فندق منفرد بالذكاء الاصطناعي</span>
              </CardTitle>
              <CardDescription className="text-xs">
                الصقوا رابط الفندق من Booking أو TripAdvisor لاستخراج المواصفات والصور والأسعار تلقائياً.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsAiImporterOpen(false)}
              className="h-8 w-8 rounded-lg"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <ServiceImportChat
              serviceType="hotel"
              onApply={(data: Record<string, unknown>) => {
                const normalized = normalizeImportedHotel(data);
                handleAdd(normalized);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Filter Bar with Segment Tabs and City Dropdown */}
      <EnterpriseFilterBar
        searchPlaceholder="البحث باسم الفندق، المدينة، أو رقم الواتساب..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        tabs={[
          { id: "all", label: "الكل", count: hotels.length },
          { id: "5", label: "5 نجوم", count: fiveStarCount },
          { id: "4", label: "4 نجوم", count: fourStarCount },
          { id: "featured", label: "المميزة", count: featuredCount },
        ]}
        activeTab={starFilter}
        onTabChange={(tabId) => setStarFilter(tabId)}
        totalResults={filtered.length}
        filtersSlot={
          <div className="flex items-center gap-2">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="h-9 rounded-xl border border-border/60 bg-background/80 px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">كل المدن ({uniqueCities.length})</option>
              {uniqueCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Data Table with Batch Selection and Actions */}
      <EnterpriseDataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        keyField="id"
        selectable
        selectedKeys={selectedHotelKeys}
        onSelectionChange={setSelectedHotelKeys}
        pageSize={12}
        batchActions={
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="rounded-xl font-bold gap-1.5"
            onClick={() => setShowBulkDeleteConfirm(true)}
          >
            <Trash2 size={14} />
            <span>حذف ({selectedHotelKeys.size})</span>
          </Button>
        }
        emptyTitle="لا توجد فنادق تطابق معايير البحث"
        emptyDescription="حاولوا تغيير الكلمات الدلالية أو الفلاتر المختارة، أو أضيفوا فندقاً جديداً إلى الكتالوج."
        emptyAction={
          <Button
            type="button"
            className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black gap-1.5"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={15} />
            <span>إضافة فندق الآن</span>
          </Button>
        }
      />

      {/* Add / Edit Hotel Modal */}
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

      {/* AI Bulk Import Modal */}
      {isBulkModalOpen && (
        <BulkHotelImporterModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onPublishAll={handlePublishBulk}
        />
      )}

      {/* Confirm Single Delete Dialog */}
      <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>تأكيد حذف الفندق</DialogTitle>
            <DialogDescription>
              سيتم إزالة الفندق والغرف وكافة الأسعار التابعة له نهائياً من الكتالوج الداخلي.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setDeleteConfirmId(null)}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl font-bold"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Bulk Delete Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف الجماعي</DialogTitle>
            <DialogDescription>
              {selectedHotelKeys.size > 0
                ? `هل أنتم متأكدون من حذف ${selectedHotelKeys.size} فندق محدد؟ لا يمكن التراجع عن هذا الإجراء.`
                : "هل أنتم متأكدون من حذف جميع الفنادق؟"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowBulkDeleteConfirm(false)}>
              إلغاء
            </Button>
            <Button type="button" variant="destructive" className="rounded-xl font-bold" onClick={handleBulkDelete}>
              نعم، حذف الكل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Reset Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>استعادة الكتالوج الافتراضي</DialogTitle>
            <DialogDescription>
              سيتم استعادة الفنادق والغرف المعتمدة للمنصة وإعادة ضبط البيانات الأصلية.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowResetConfirm(false)}>
              إلغاء
            </Button>
            <Button type="button" className="rounded-xl bg-primary font-bold" onClick={handleReset}>
              استعادة الافتراضي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
