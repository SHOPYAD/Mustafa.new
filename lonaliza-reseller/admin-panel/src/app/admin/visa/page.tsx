"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  RotateCcw,
  FileText,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  getVisaData,
  addVisaCountry,
  updateVisaCountry,
  deleteVisaCountry,
  resetVisaData,
  type VisaCountry,
} from "@/data/visa";
import VisaFormModal from "@/components/admin/VisaFormModal";
import ServiceImportChat from "@/components/admin/ServiceImportChat";
import { normalizeImportedVisa } from "@/lib/import-normalize";
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

export default function AdminVisaPage() {
  const [visaData, setVisaData] = useState<VisaCountry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<VisaCountry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setVisaData(getVisaData());
  }, []);

  const refresh = () => setVisaData(getVisaData());

  const handleAdd = (data: Omit<VisaCountry, "id">) => {
    addVisaCountry(data);
    refresh();
  };

  const handleUpdate = (data: Omit<VisaCountry, "id">) => {
    if (!editingCountry) return;
    updateVisaCountry(editingCountry.id, data);
    setEditingCountry(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteVisaCountry(id);
    setDeleteConfirmId(null);
    refresh();
  };

  const handleReset = () => {
    resetVisaData();
    setShowResetConfirm(false);
    refresh();
  };

  const filtered = useMemo(() => {
    return visaData.filter(
      (c) =>
        c.countryAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.countryEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visaData, searchQuery]);

  const activeCount = visaData.filter((c) => c.isActive !== false).length;

  const columns: ColumnDef<VisaCountry>[] = [
    {
      key: "country",
      header: "الدولة والوجهة",
      render: (country) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary font-bold text-xs uppercase shadow-xs">
            {country.code}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-foreground truncate">{country.countryAr}</div>
            <div className="text-xs font-mono text-muted-foreground">{country.countryEn}</div>
          </div>
        </div>
      ),
    },
    {
      key: "processingTime",
      header: "مدة المعالجة",
      render: (country) => (
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={13} className="text-amber-500" />
          <span className="font-medium text-foreground">{country.processingTime}</span>
        </div>
      ),
    },
    {
      key: "fee",
      header: "رسوم التأشيرة",
      sortable: true,
      render: (country) => (
        <span className="font-bold text-sm text-foreground tabular-nums">
          ${country.fee}
        </span>
      ),
    },
    {
      key: "requirements",
      header: "المستندات المطلوبة",
      render: (country) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText size={13} className="text-primary" />
          <span>{country.requirements?.length || 0} متطلبات</span>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "الحالة",
      align: "center",
      render: (country) => (
        <EnterpriseStatusBadge
          variant={country.isActive !== false ? "active" : "inactive"}
          label={country.isActive !== false ? "متاحة" : "متوقفة"}
          pulse={country.isActive !== false}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (country) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => {
              setEditingCountry(country);
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
            onClick={() => setDeleteConfirmId(country.id)}
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
          { label: "محركات السفر", href: "/admin/visa" },
          { label: "خدمات ومتطلبات التأشيرات" },
        ]}
        icon={<Globe className="h-6 w-6 text-primary" />}
        title="خدمات ومتطلبات التأشيرات السياحية"
        subtitle="إدارة متطلبات الدول، أوقات المعالجة، الرسوم الحكومية، والوثائق الإلزامية للمسافرين."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-1.5"
              onClick={() => {
                setEditingCountry(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={15} />
              <span>إضافة دولة جديدة</span>
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
        serviceType="visa"
        onApply={(data) => {
          const normalized = normalizeImportedVisa(data);
          handleAdd(normalized);
        }}
      />

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={3}>
        <EnterpriseKpiCard
          title="إجمالي الدول المشمولة"
          value={visaData.length}
          subValue="وجهة حول العالم"
          icon={<Globe className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="التأشيرات النشطة للتقديم"
          value={activeCount}
          subValue="متاحة للمسافرين"
          icon={<CheckCircle2 className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="متوسط مدة الإنجاز"
          value="3-5 أيام"
          subValue="معالجة سريعة"
          icon={<Clock className="size-5" />}
          color="amber"
        />
      </EnterpriseKpiGrid>

      {/* Filter Bar */}
      <EnterpriseFilterBar
        searchPlaceholder="البحث باسم الدولة بالعربية، الإنجليزية، أو رمز الدولة..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        totalResults={filtered.length}
      />

      {/* Data Table */}
      <EnterpriseDataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        keyField="id"
        pageSize={12}
        emptyTitle="لا توجد تأشيرات تطابق البحث"
        emptyDescription="يمكنكم تعديل البحث أو إضافة متطلبات دولة جديدة الآن."
      />

      {/* Add / Edit Visa Modal */}
      {isModalOpen && (
        <VisaFormModal
          isOpen={isModalOpen}
          editCountry={editingCountry}
          onSubmit={(data) => {
            if (editingCountry) {
              handleUpdate(data);
            } else {
              handleAdd(data);
            }
            setIsModalOpen(false);
          }}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCountry(null);
          }}
        />
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>تأكيد حذف متطلبات الدولة</DialogTitle>
            <DialogDescription>
              سيتم إزالة الدولة والوثائق التابعة لها كلياً من قاعدة بيانات التأشيرات.
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
            <DialogTitle>استعادة التأشيرات الافتراضية</DialogTitle>
            <DialogDescription>
              سيتم استعادة قائمة الدول والمتطلبات الأصلية المعتمدة للمنصة.
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
    </div>
  );
}
