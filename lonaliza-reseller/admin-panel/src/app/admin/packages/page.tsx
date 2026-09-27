"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  RotateCcw,
  Star,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Globe2,
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
import WhiteLabelUpgradeOverlay from "@/components/admin/WhiteLabelUpgradeOverlay";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPackagesPage() {
  const { t, locale } = useLocale();
  const [packages, setPackages] = useState<HolidayPackage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<HolidayPackage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [filterTab, setFilterTab] = useState("all");

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

  const featuredCount = packages.filter((p) => p.isFeatured).length;
  const countriesCount = new Set(packages.map((p) => p.country)).size;

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q);

      const matchesTab =
        filterTab === "all" ||
        (filterTab === "featured" && p.isFeatured) ||
        (filterTab === "standard" && !p.isFeatured);

      return matchesSearch && matchesTab;
    });
  }, [packages, searchQuery, filterTab]);

  const columns: ColumnDef<HolidayPackage>[] = [
    {
      key: "title",
      header: "البرنامج السياحي",
      render: (pkg) => (
        <div className="flex items-center gap-3 py-1">
          {pkg.images?.[0] ? (
            <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pkg.images[0]}
                alt={pkg.title}
                className="h-full w-full object-cover no-theme-image"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/60 text-muted-foreground">
              <Package size={20} />
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                {pkg.title}
              </span>
              {pkg.isFeatured && (
                <EnterpriseStatusBadge variant="royal" size="sm" label="مميز" />
              )}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-1">{pkg.overview}</div>
          </div>
        </div>
      ),
    },
    {
      key: "destination",
      header: "الوجهة والدولة",
      render: (pkg) => (
        <div className="flex items-center gap-1.5 text-xs">
          <MapPin size={13} className="text-primary shrink-0" />
          <span className="font-medium text-foreground">{pkg.destination}</span>
          <span className="text-muted-foreground/60">({pkg.country})</span>
        </div>
      ),
    },
    {
      key: "duration",
      header: "المدة",
      align: "center",
      render: (pkg) => (
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <Calendar size={13} />
          <span>{pkg.days} أيام</span>
        </div>
      ),
    },
    {
      key: "price",
      header: "السعر",
      sortable: true,
      render: (pkg) => (
        <span className="font-bold text-sm text-foreground tabular-nums">
          ${pkg.price}
        </span>
      ),
    },
    {
      key: "rating",
      header: "التقييم",
      align: "center",
      render: (pkg) => (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs tabular-nums">
          <span>{pkg.rating || 5}</span>
          <Star className="size-3 fill-amber-500 text-amber-500" />
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (pkg) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => {
              setEditingPkg(pkg);
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
            onClick={() => setDeleteConfirmId(pkg.id)}
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
      <WhiteLabelUpgradeOverlay moduleName="البرامج السياحية">
        <EnterprisePageHeader
          breadcrumbs={[
            { label: "لوحة التحكم", href: "/admin" },
            { label: "محركات السفر", href: "/admin/packages" },
            { label: "البرامج والباقات السياحية" },
          ]}
          icon={<Package className="h-6 w-6 text-primary" />}
          title="البرامج والباقات السياحية المتكاملة"
          subtitle="إدارة الجولات المتكاملة، مسارات الرحلات، الفنادق المشمولة، التسعير والتواريخ المتاحة."
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-1.5"
                onClick={() => {
                  setEditingPkg(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>إضافة باقة جديدة</span>
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

        {/* KPI Grid */}
        <EnterpriseKpiGrid columns={3}>
          <EnterpriseKpiCard
            title="إجمالي الباقات السياحية"
            value={packages.length}
            subValue="برنامج منشور"
            icon={<Package className="size-5" />}
            color="purple"
          />
          <EnterpriseKpiCard
            title="الباقات المميزة للنخبة"
            value={featuredCount}
            subValue="معروضة بالصفحة الأولى"
            icon={<Sparkles className="size-5" />}
            color="amber"
          />
          <EnterpriseKpiCard
            title="الدول والوجهات المغطاة"
            value={countriesCount}
            subValue="وجهة عالمية"
            icon={<Globe2 className="size-5" />}
            color="emerald"
          />
        </EnterpriseKpiGrid>

        {/* Filter Bar */}
        <EnterpriseFilterBar
          searchPlaceholder="البحث باسم الباقة، الوجهة، أو الدولة..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          tabs={[
            { id: "all", label: "كافة الباقات", count: packages.length },
            { id: "featured", label: "المميزة فقط", count: featuredCount },
            { id: "standard", label: "البرامج العادية", count: packages.length - featuredCount },
          ]}
          activeTab={filterTab}
          onTabChange={setFilterTab}
          totalResults={filtered.length}
        />

        {/* Data Table */}
        <EnterpriseDataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          keyField="id"
          pageSize={10}
          emptyTitle="لا توجد باقات تطابق البحث"
          emptyDescription="يمكنكم تعديل الكلمات المدخلة أو إضافة باقة سياحية جديدة الآن."
        />

        {/* Add / Edit Package Modal */}
        {isModalOpen && (
          <PackageFormModal
            isOpen={isModalOpen}
            editPkg={editingPkg}
            onSubmit={(data) => {
              if (editingPkg) {
                handleUpdate(data);
              } else {
                handleAdd(data);
              }
              setIsModalOpen(false);
            }}
            onClose={() => {
              setIsModalOpen(false);
              setEditingPkg(null);
            }}
          />
        )}

        {/* Confirm Delete Dialog */}
        <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>تأكيد حذف البرنامج السياحي</DialogTitle>
              <DialogDescription>
                سيتم إزالة الباقة والمسارات والأسعار التابعة لها كلياً من قاعدة البيانات.
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
              <DialogTitle>استعادة الباقات الافتراضية</DialogTitle>
              <DialogDescription>
                سيتم استعادة الباقات والمسارات الأصلية للمنصة.
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
