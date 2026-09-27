"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Inbox,
  Trash2,
  AlertTriangle,
  Package,
  Globe,
  MessageSquare,
  Clock,
  CheckCircle2,
  Circle,
  Plane,
  Hotel,
  Car,
  MapPin,
  Phone,
  Mail,
  Database,
  Eye,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  fetchBookings,
  patchBookingStatus,
  removeBooking,
  type Booking,
  type BookingStatus,
  type BookingType,
} from "@/data/bookings";
import { useLocale, dateLocaleTag } from "@/lib/i18n/LocaleProvider";
import { getInitials } from "@/lib/utils";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  EnterpriseModal,
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

const BOOKING_TYPES: Array<BookingType | "all"> = [
  "all",
  "flight",
  "hotel",
  "package",
  "transfer",
  "visa",
  "tour",
  "car",
  "callback",
  "contact",
  "general",
];

const LAST_SEEN_BOOKING_KEY = "alrayyan_admin_last_booking";
const POLL_INTERVAL_MS = 17000;

export default function AdminBookingsPage() {
  const { t, locale } = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<BookingType | "all">("all");
  const [customerFilter, setCustomerFilter] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [pocketbaseConnected, setPocketbaseConnected] = useState(false);
  const [loadError, setLoadError] = useState("");
  const initialLoadDone = useRef(false);
  const lastSeenIdRef = useRef<string | null>(null);

  const typeConfig: Record<
    string,
    { label: string; icon: React.ElementType; color: string }
  > = {
    flight: { label: t.admin.typeFlight, icon: Plane, color: "text-sky-500" },
    hotel: { label: t.admin.typeHotel, icon: Hotel, color: "text-rose-500" },
    package: { label: t.admin.typePackage, icon: Package, color: "text-emerald-500" },
    transfer: { label: t.admin.typeTransfer, icon: Car, color: "text-cyan-500" },
    visa: { label: t.admin.typeVisa, icon: Globe, color: "text-blue-500" },
    tour: { label: t.admin.typeTour, icon: MapPin, color: "text-violet-500" },
    car: { label: t.nav.cars, icon: Car, color: "text-amber-500" },
    callback: { label: t.admin.typeCallback, icon: Phone, color: "text-orange-500" },
    contact: { label: t.admin.typeContact, icon: MessageSquare, color: "text-indigo-500" },
    general: { label: t.admin.typeGeneral, icon: MessageSquare, color: "text-purple-500" },
  };

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const result = await fetchBookings({
      type: typeFilter,
      status: statusFilter,
      customer: customerFilter || undefined,
    });
    setBookings(result.bookings);
    setPocketbaseConnected(Boolean(result.pocketbase));
    setLoadError(result.error || "");
    if (!opts?.silent) setLoading(false);

    const latest = result.bookings[0];
    if (!latest) return;

    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      lastSeenIdRef.current = latest.id;
      if (typeof window !== "undefined") {
        localStorage.setItem(LAST_SEEN_BOOKING_KEY, latest.id);
      }
      return;
    }
  }, [typeFilter, statusFilter, customerFilter]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) setSearchQuery(id);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }

    const poll = async () => {
      const result = await fetchBookings();
      const latest = result.bookings[0];
      if (!latest) return;

      const stored = localStorage.getItem(LAST_SEEN_BOOKING_KEY);
      if (stored && latest.id !== stored && latest.status === "new") {
        localStorage.setItem(LAST_SEEN_BOOKING_KEY, latest.id);
        lastSeenIdRef.current = latest.id;
        void refresh({ silent: true });
      }
    };

    const interval = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [refresh]);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    await patchBookingStatus(id, status);
    await refresh({ silent: true });
  };

  const handleDelete = async (id: string) => {
    await removeBooking(id);
    setDeleteConfirmId(null);
    if (viewBooking?.id === id) setViewBooking(null);
    await refresh({ silent: true });
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q.replace(/^hotel:/, "")) ||
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        (b.packageName || "").toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q);

      const matchesCustomer =
        !customerFilter ||
        b.name.toLowerCase().includes(customerFilter.toLowerCase()) ||
        b.email.toLowerCase().includes(customerFilter.toLowerCase());

      const matchesType = typeFilter === "all" || b.type === typeFilter;
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;

      return matchesSearch && matchesCustomer && matchesType && matchesStatus;
    });
  }, [bookings, searchQuery, customerFilter, typeFilter, statusFilter]);

  const newCount = bookings.filter((b) => b.status === "new").length;
  const inProgressCount = bookings.filter((b) => b.status === "in-progress").length;
  const resolvedCount = bookings.filter((b) => b.status === "resolved").length;

  const columns: ColumnDef<Booking>[] = [
    {
      key: "customer",
      header: "العميل والطلب",
      render: (b) => (
        <div className="flex items-center gap-3 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 text-primary font-bold text-xs border border-primary/20 shadow-xs">
            {getInitials(b.name)}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="font-bold text-foreground truncate max-w-[180px] sm:max-w-xs">
              {b.name}
            </div>
            <div className="text-xs font-mono text-muted-foreground truncate">
              {b.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "الخدمة المطلوبة",
      render: (b) => {
        const typeCfg = typeConfig[b.type] || typeConfig.general;
        const TypeIcon = typeCfg.icon;
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card border border-border/60">
              <TypeIcon size={14} className={typeCfg.color} />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs text-foreground block truncate">
                {typeCfg.label}
              </span>
              {b.packageName && (
                <span className="text-[11px] text-muted-foreground truncate block max-w-[150px]">
                  {b.packageName}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "destination",
      header: "الوجهة / التفاصيل",
      render: (b) => (
        <div className="text-xs text-muted-foreground truncate max-w-[160px]">
          {b.destination || "—"}
        </div>
      ),
    },
    {
      key: "contact",
      header: "التواصل",
      render: (b) => (
        <div className="flex flex-col gap-0.5 text-xs font-mono text-muted-foreground">
          {b.phone ? (
            <a
              href={`tel:${b.phone}`}
              className="text-foreground/90 hover:text-primary transition-colors inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={11} className="text-emerald-500" />
              <span dir="ltr">{b.phone}</span>
            </a>
          ) : (
            <span>—</span>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "تاريخ الطلب",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(b.createdAt).toLocaleDateString(dateLocaleTag(locale), {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "حالة الطلب",
      align: "center",
      render: (b) => (
        <div className="inline-flex" onClick={(e) => e.stopPropagation()}>
          <select
            value={b.status}
            onChange={(e) => void handleStatusChange(b.id, e.target.value as BookingStatus)}
            className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="new">طلب جديد</option>
            <option value="in-progress">قيد المتابعة</option>
            <option value="resolved">مكتمل ومؤكد</option>
          </select>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (b) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => setViewBooking(b)}
            title="عرض التفاصيل"
          >
            <Eye size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
            onClick={() => setDeleteConfirmId(b.id)}
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
          { label: "العمليات والطلبات", href: "/admin/bookings" },
          { label: "إدارة الحجوزات والاستفسارات" },
        ]}
        icon={<Inbox className="h-6 w-6 text-primary" />}
        title={t.admin.bookings || "الحجوزات التشغيلية الشاملة"}
        subtitle="متابعة استفسارات وحجوزات العملاء الفورية لجميع خدمات الطيران والفنادق والسيارات والباقات."
        actions={
          <div className="flex items-center gap-2">
            <EnterpriseStatusBadge
              variant={pocketbaseConnected ? "active" : "warning"}
              label={pocketbaseConnected ? "PocketBase متصل ومزامن" : "قاعدة البيانات المحلية (تخزين مؤقت)"}
              pulse={pocketbaseConnected}
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-border/60 bg-card/60 hover:bg-muted font-semibold text-xs"
              onClick={() => void refresh()}
            >
              تحديث البيانات
            </Button>
          </div>
        }
      />

      {/* PocketBase Warning Alert if Disconnected */}
      {!pocketbaseConnected && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-500 flex items-center justify-between gap-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              قاعدة بيانات PocketBase غير متصلة حالياً. يتم حفظ الطلبات محلياً.{" "}
              <Link href="/admin/pocketbase" className="underline font-bold hover:text-amber-400">
                إعداد الاتصال بقاعدة البيانات
              </Link>
            </span>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          title="إجمالي الحجوزات"
          value={bookings.length}
          subValue="طلب مسجل بالنظام"
          icon={<Inbox className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="الطلبات الجديدة"
          value={newCount}
          subValue="بحاجة للتواصل والمتابعة"
          icon={<Circle className="size-5" />}
          color="rose"
          change={newCount > 0 ? `+${newCount}` : "0"}
          trend={newCount > 0 ? "up" : "neutral"}
        />
        <EnterpriseKpiCard
          title="قيد المعالجة"
          value={inProgressCount}
          subValue="جاري التنسيق مع العميل"
          icon={<Clock className="size-5" />}
          color="amber"
        />
        <EnterpriseKpiCard
          title="الحجوزات المكتملة"
          value={resolvedCount}
          subValue="تم التأكيد وإصدار التذاكر"
          icon={<CheckCircle2 className="size-5" />}
          color="emerald"
        />
      </EnterpriseKpiGrid>

      {/* Filter Bar */}
      <EnterpriseFilterBar
        searchPlaceholder="البحث برقم الطلب، اسم العميل، البريد، أو الهاتف..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        tabs={[
          { id: "all", label: "كافة الحجوزات", count: bookings.length },
          { id: "new", label: "جديدة", count: newCount },
          { id: "in-progress", label: "قيد المتابعة", count: inProgressCount },
          { id: "resolved", label: "مكتملة", count: resolvedCount },
        ]}
        activeTab={statusFilter}
        onTabChange={(id) => setStatusFilter(id as BookingStatus | "all")}
        totalResults={filtered.length}
        filtersSlot={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as BookingType | "all")}
              className="h-9 rounded-xl border border-border/60 bg-background/80 px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">كل الخدمات</option>
              {BOOKING_TYPES.filter((t) => t !== "all").map((t) => (
                <option key={t} value={t}>
                  {typeConfig[t]?.label || t}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Data Table */}
      <EnterpriseDataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        keyField="id"
        isLoading={loading}
        pageSize={12}
        onRowClick={(row) => setViewBooking(row as unknown as Booking)}
        emptyTitle="لا توجد طلبات حجوزات تطابق البحث"
        emptyDescription="لم يتم العثور على أي حجز مطابق للفلاتر المختارة."
      />

      {/* View Booking Details Modal */}
      {viewBooking && (
        <EnterpriseModal
          open={Boolean(viewBooking)}
          onClose={() => setViewBooking(null)}
          title={`تفاصيل الحجز #${viewBooking.id.slice(0, 8)}`}
          subtitle={viewBooking.name}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">تغيير الحالة:</span>
                <select
                  value={viewBooking.status}
                  onChange={(e) => {
                    const next = e.target.value as BookingStatus;
                    void handleStatusChange(viewBooking.id, next);
                    setViewBooking({ ...viewBooking, status: next });
                  }}
                  className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-semibold"
                >
                  <option value="new">طلب جديد</option>
                  <option value="in-progress">قيد المتابعة</option>
                  <option value="resolved">مكتمل ومؤكد</option>
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setViewBooking(null)}
              >
                إغلاق
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/40 border border-border/40 text-xs">
              <div>
                <span className="text-muted-foreground block mb-1">اسم العميل:</span>
                <span className="font-bold text-foreground text-sm">{viewBooking.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">نوع الخدمة:</span>
                <span className="font-bold text-primary text-sm">
                  {typeConfig[viewBooking.type]?.label || viewBooking.type}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">البريد الإلكتروني:</span>
                <a href={`mailto:${viewBooking.email}`} className="font-mono text-foreground hover:underline">
                  {viewBooking.email}
                </a>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">رقم الهاتف:</span>
                <a href={`tel:${viewBooking.phone}`} className="font-mono text-emerald-500 hover:underline">
                  {viewBooking.phone || "—"}
                </a>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">الوجهة:</span>
                <span className="font-semibold text-foreground">{viewBooking.destination || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">تاريخ الإنشاء:</span>
                <span className="tabular-nums text-foreground">
                  {new Date(viewBooking.createdAt).toLocaleString(dateLocaleTag(locale))}
                </span>
              </div>
            </div>

            {viewBooking.packageName && (
              <div className="p-3 rounded-xl bg-card border border-border/50 text-xs">
                <span className="text-muted-foreground block mb-0.5">الباقة / الفندق المرتبط:</span>
                <span className="font-bold text-foreground">{viewBooking.packageName}</span>
              </div>
            )}

            {viewBooking.message && (
              <div className="p-4 rounded-xl bg-card border border-border/50 text-xs space-y-1.5">
                <span className="text-muted-foreground font-semibold block">ملاحظات وطلب العميل:</span>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {viewBooking.message}
                </p>
              </div>
            )}
          </div>
        </EnterpriseModal>
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{t.admin.deleteEnquiry || "تأكيد حذف الحجز"}</DialogTitle>
            <DialogDescription>
              {t.admin.deleteCannotUndo || "سيتم إزالة طلب الحجز نهائياً من قاعدة البيانات ولا يمكن استعادته."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setDeleteConfirmId(null)}>
              {t.common.cancel || "إلغاء"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl font-bold"
              onClick={() => deleteConfirmId && void handleDelete(deleteConfirmId)}
            >
              {t.common.delete || "تأكيد الحذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
