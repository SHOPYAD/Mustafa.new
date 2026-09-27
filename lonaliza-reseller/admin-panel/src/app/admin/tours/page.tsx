"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  RotateCcw,
  Star,
  Compass,
  Clock,
  DollarSign,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
} from "lucide-react";
import { addTour, updateTour, deleteTour, resetTours, fetchAdminTours, type Tour } from "@/data/tours";
import TourFormModal from "@/components/admin/TourFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedTour } from "@/lib/import-normalize";
import WhiteLabelUpgradeOverlay from "@/components/admin/WhiteLabelUpgradeOverlay";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  type ColumnDef,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [cityFilter, setCityFilter] = useState("all");

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
    if (!editingTour) return;
    updateTour(editingTour.id, data);
    setEditingTour(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteTour(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleReset = () => {
    resetTours();
    setShowResetConfirm(false);
    refresh();
  };

  const cities = useMemo(() => {
    const set = new Set<string>();
    tours.forEach((t) => {
      if (t.location) set.add(t.location);
    });
    return Array.from(set);
  }, [tours]);

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);

      const matchesCity = cityFilter === "all" || t.location === cityFilter;

      return matchesSearch && matchesCity;
    });
  }, [tours, searchQuery, cityFilter]);

  const avgPrice = tours.length > 0 ? Math.round(tours.reduce((sum, t) => sum + t.price, 0) / tours.length) : 0;

  const columns: ColumnDef<Tour>[] = [
    {
      key: "title",
      header: "الجولة والنشاط",
      render: (tour) => (
        <div className="flex items-center gap-3 py-1">
          {tour.images?.[0] ? (
            <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tour.images[0]}
                alt={tour.title}
                className="h-full w-full object-cover no-theme-image"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/60 text-muted-foreground">
              <Compass size={20} />
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <div className="font-bold text-foreground truncate max-w-[220px] sm:max-w-xs">
              {tour.title}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-1">{tour.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "المدينة والمنطقة",
      render: (tour) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <MapPin size={13} className="text-primary shrink-0" />
          <span>{tour.location}</span>
        </div>
      ),
    },
    {
      key: "duration",
      header: "المدة والوقت",
      render: (tour) => (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums font-medium text-foreground">{tour.duration}</span>
          {tour.timeOfDay === "morning" && <Sunrise size={13} className="text-amber-500" title="صباحاً" />}
          {tour.timeOfDay === "afternoon" && <Sunset size={13} className="text-orange-500" title="مساءً" />}
          {tour.timeOfDay === "evening" && <Moon size={13} className="text-indigo-400" title="ليلاً" />}
        </div>
      ),
    },
    {
      key: "price",
      header: "السعر للشخص",
      sortable: true,
      render: (tour) => (
        <span className="font-bold text-sm text-foreground tabular-nums">
          ${tour.price}
        </span>
      ),
    },
    {
      key: "rating",
      header: "التقييم",
      align: "center",
      render: (tour) => (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs tabular-nums">
          <span>{tour.rating || 5}</span>
          <Star className="size-3 fill-amber-500 text-amber-500" />
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (tour) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => {
              setEditingTour(tour);
              setIsModalOpen(true);
            }}
            title="تعديل"
          >
            <Pencil size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
            onClick={() => setDeleteConfirmId(tour.id)}
            title="حذف"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <WhiteLabelUpgradeOverlay moduleName="الجولات والأنشطة">
        <EnterprisePageHeader
          breadcrumbs={[
            { label: "لوحة التحكم", href: "/admin" },
            { label: "محركات السفر", href: "/admin/tours" },
            { label: "الجولات والأنشطة السياحية" },
          ]}
          icon={<Compass className="h-6 w-6 text-primary" />}
          title="الجولات والأنشطة الترفيهية"
          subtitle="إدارة الجولات السياحية اليومية، تذاكر الفعاليات، المعالم التاريخية، والأنشطة البحرية."
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-1.5"
                onClick={() => {
                  setEditingTour(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>إضافة جولة جديدة</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-border/60 bg-card/60 hover:bg-muted font-semibold gap-1.5"
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw size={14} />
                <span>استعادة الافتراضي</span>
              </Button>
            </div>
          }
        />

        {/* AI Import Service Chat */}
        <ServiceImportChat
          serviceType="tour"
          onApply={(data) => {
            const normalized = normalizeImportedTour(data);
            handleAdd(normalized);
          }}
        />

        {/* KPI Grid */}
        <EnterpriseKpiGrid columns={3}>
          <EnterpriseKpiCard
            title="إجمالي الجولات المتاحة"
            value={tours.length}
            subValue="نشاط سياحي معتمد"
            icon={<Compass className="size-5" />}
            color="purple"
          />
          <EnterpriseKpiCard
            title="المدن والوجهات المغطاة"
            value={cities.length}
            subValue="مدينة سياحية"
            icon={<MapPin className="size-5" />}
            color="emerald"
          />
          <EnterpriseKpiCard
            title="متوسط سعر الجولة"
            value={`$${avgPrice}`}
            subValue="للشخص الواحد"
            icon={<DollarSign className="size-5" />}
            color="amber"
          />
        </EnterpriseKpiGrid>

        {/* Filter Bar */}
        <EnterpriseFilterBar
          searchPlaceholder="البحث باسم الجولة، المدينة، أو الوصف..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          totalResults={filtered.length}
          filtersSlot={
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="h-9 rounded-xl border border-border/60 bg-background/80 px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">كل المدن ({cities.length})</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          }
        />

        {/* Data Table */}
        <EnterpriseDataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          keyField="id"
          pageSize={10}
          emptyTitle="لا توجد جولات تطابق البحث"
          emptyDescription="يمكنكم تعديل الفلاتر أو إضافة جولة جديدة إلى المنصة."
        />

        {/* Add / Edit Tour Modal */}
        {isModalOpen && (
          <TourFormModal
            isOpen={isModalOpen}
            editTour={editingTour}
            onSubmit={(data) => {
              if (editingTour) {
                handleUpdate(data);
              } else {
                handleAdd(data);
              }
              setIsModalOpen(false);
            }}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTour(null);
            }}
          />
        )}

        {/* Confirm Delete Dialog */}
        <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>تأكيد حذف الجولة</DialogTitle>
              <DialogDescription>
                سيتم إزالة الجولة والأسعار التابعة لها كلياً من قاعدة البيانات.
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

        {/* Confirm Reset Dialog */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>استعادة الجولات الافتراضية</DialogTitle>
              <DialogDescription>
                سيتم استعادة الجولات والأنشطة الأصلية المعتمدة للمنصة.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowResetConfirm(false)}>
                إلغاء
              </Button>
              <Button type="button" className="rounded-xl bg-primary font-bold" onClick={handleReset}>
                نعم، استعادة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </WhiteLabelUpgradeOverlay>
    </div>
  );
}
