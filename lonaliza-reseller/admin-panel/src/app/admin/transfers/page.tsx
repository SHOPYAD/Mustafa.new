"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Car,
  RotateCcw,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Crown,
  Phone,
} from "lucide-react";
import {
  getTransfers,
  addTransfer,
  updateTransfer,
  deleteTransfer,
  resetTransfers,
} from "@/data/transfers";
import type { TransferService, TransferInput } from "@/types/transfer";
import TransferFormModal from "@/components/admin/TransferFormModal";
import TransfersProviderPanel from "@/components/admin/TransfersProviderPanel";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedTransfer } from "@/lib/import-normalize";
import { type TransferProvider } from "@/lib/transfers-config";
import { buildWhatsAppLink } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";
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

export default function AdminTransfersPage() {
  const { t } = useLocale();
  const [transfers, setTransfers] = useState<TransferService[]>([]);
  const [provider, setProvider] = useState<TransferProvider>("internal");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<TransferService | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    setTransfers(getTransfers());
  }, []);

  const refresh = () => setTransfers(getTransfers());

  const handleAdd = (data: TransferInput) => {
    addTransfer(data);
    refresh();
  };

  const handleUpdate = (data: TransferInput) => {
    if (editing) {
      updateTransfer(editing.id, data);
      setEditing(null);
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    setTransfers((prev) => prev.filter((t) => t.id !== id));
    deleteTransfer(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleReset = () => {
    resetTransfers();
    setShowResetConfirm(false);
    refresh();
  };

  const toggleActive = (item: TransferService) => {
    updateTransfer(item.id, { isActive: !item.isActive });
    refresh();
  };

  const toggleFeatured = (item: TransferService) => {
    updateTransfer(item.id, { isFeatured: !item.isFeatured });
    refresh();
  };

  const filtered = useMemo(() => {
    return transfers.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.titleEn.toLowerCase().includes(q) ||
        t.titleAr.includes(q) ||
        t.vehicleName.toLowerCase().includes(q) ||
        t.type.includes(q) ||
        t.whatsappNumber.includes(q);

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "transfer" && t.type === "transfer") ||
        (typeFilter === "vip_tour" && t.type === "vip_tour");

      return matchesSearch && matchesType;
    });
  }, [transfers, searchQuery, typeFilter]);

  const transferCount = transfers.filter((t) => t.type === "transfer").length;
  const vipCount = transfers.filter((t) => t.type === "vip_tour").length;
  const activeCount = transfers.filter((t) => t.isActive).length;

  const columns: ColumnDef<TransferService>[] = [
    {
      key: "service",
      header: "الخدمة والمسار",
      render: (item) => (
        <div className="flex items-center gap-3 py-1">
          {item.images?.[0] ? (
            <div className="h-11 w-11 rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.images[0]}
                alt={item.titleAr}
                className="h-full w-full object-cover no-theme-image"
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/60 text-muted-foreground">
              <Car size={18} />
            </div>
          )}
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                {item.titleAr || item.titleEn}
              </span>
              {item.isFeatured && (
                <EnterpriseStatusBadge variant="royal" size="sm" label="VIP" />
              )}
            </div>
            <div className="text-xs font-mono text-muted-foreground truncate">{item.titleEn}</div>
          </div>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "نوع المركبة",
      render: (item) => (
        <div className="text-xs font-semibold text-foreground">
          {item.vehicleName}
        </div>
      ),
    },
    {
      key: "type",
      header: "التصنيف",
      align: "center",
      render: (item) => (
        <EnterpriseStatusBadge
          variant={item.type === "vip_tour" ? "royal" : "info"}
          label={item.type === "vip_tour" ? "جولة VIP" : "توصيل مطار"}
        />
      ),
    },
    {
      key: "price",
      header: "السعر",
      sortable: true,
      render: (item) => (
        <span className="font-bold text-sm text-foreground tabular-nums">
          ${item.price}
        </span>
      ),
    },
    {
      key: "whatsapp",
      header: "واتساب السائق",
      render: (item) =>
        item.whatsappNumber ? (
          <a
            href={buildWhatsAppLink(item.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono text-emerald-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone size={12} />
            <span dir="ltr">{item.whatsappNumber}</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground/60">—</span>
        ),
    },
    {
      key: "isActive",
      header: "الحالة",
      align: "center",
      render: (item) => (
        <EnterpriseStatusBadge
          variant={item.isActive ? "active" : "inactive"}
          label={item.isActive ? "نشط" : "معطل"}
          pulse={item.isActive}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => {
              setEditing(item);
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
            onClick={() => setDeleteConfirmId(item.id)}
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
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "محركات السفر", href: "/admin/transfers" },
          { label: "خدمات التوصيل والنقل VIP" },
        ]}
        icon={<Car className="h-6 w-6 text-primary" />}
        title="خدمات التوصيل والنقل الخاص VIP"
        subtitle="إدارة مسارات التوصيل للمطارات والفنادق، أسطول الفانات وسيارات رجال الأعمال، وخدمة السائق الخاص."
        actions={
          provider === "internal" ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-1.5"
                onClick={() => {
                  setEditing(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={15} />
                <span>إضافة خدمة جديدة</span>
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
          ) : undefined
        }
      />

      {/* Provider Selector Panel */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-xl shadow-xs">
        <TransfersProviderPanel onProviderChange={setProvider} />
      </div>

      {provider === "internal" && (
        <>
          {/* AI Import Chat */}
          <ServiceImportChat
            serviceType="transfer"
            onApply={(item) => {
              addTransfer(normalizeImportedTransfer(item) as TransferInput);
              refresh();
            }}
          />

          {/* KPI Grid */}
          <EnterpriseKpiGrid columns={4}>
            <EnterpriseKpiCard
              title="إجمالي خدمات التوصيل"
              value={transfers.length}
              subValue="مسار وسيارة مسجلة"
              icon={<Car className="size-5" />}
              color="purple"
            />
            <EnterpriseKpiCard
              title="توصيل المطارات"
              value={transferCount}
              subValue="مسارات سريعة"
              icon={<ShieldCheck className="size-5" />}
              color="blue"
            />
            <EnterpriseKpiCard
              title="جولات VIP الخاصة"
              value={vipCount}
              subValue="خدمات كبار الشخصيات"
              icon={<Crown className="size-5" />}
              color="amber"
            />
            <EnterpriseKpiCard
              title="المركبات النشطة للطلب"
              value={activeCount}
              subValue="جاهزة للحجز الفوري"
              icon={<Car className="size-5" />}
              color="emerald"
            />
          </EnterpriseKpiGrid>

          {/* Filter Bar */}
          <EnterpriseFilterBar
            searchPlaceholder="البحث باسم الخدمة، نوع المركبة، أو واتساب السائق..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            tabs={[
              { id: "all", label: "كافة الخدمات", count: transfers.length },
              { id: "transfer", label: "توصيل مطار", count: transferCount },
              { id: "vip_tour", label: "جولات VIP", count: vipCount },
            ]}
            activeTab={typeFilter}
            onTabChange={setTypeFilter}
            totalResults={filtered.length}
          />

          {/* Data Table */}
          <EnterpriseDataTable
            columns={columns}
            data={filtered as unknown as Record<string, unknown>[]}
            keyField="id"
            pageSize={10}
            emptyTitle="لا توجد خدمات توصيل مطابقة"
            emptyDescription="يمكنكم تعديل البحث أو إضافة خدمة نقل جديدة الآن."
          />

          {/* Add / Edit Transfer Modal */}
          {isModalOpen && (
            <TransferFormModal
              isOpen={isModalOpen}
              editTransfer={editing}
              onSubmit={(data) => {
                if (editing) {
                  handleUpdate(data);
                } else {
                  handleAdd(data);
                }
                setIsModalOpen(false);
              }}
              onClose={() => {
                setIsModalOpen(false);
                setEditing(null);
              }}
            />
          )}

          {/* Confirm Delete Dialog */}
          <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
            <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>تأكيد حذف خدمة التوصيل</DialogTitle>
                <DialogDescription>
                  سيتم إزالة الخدمة ومسار التوصيل نهائياً من قاعدة البيانات.
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
                <DialogTitle>استعادة الخدمات الافتراضية</DialogTitle>
                <DialogDescription>
                  سيتم استعادة خدمات التوصيل والمركبات المعتمدة للمنصة.
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
        </>
      )}
    </div>
  );
}
