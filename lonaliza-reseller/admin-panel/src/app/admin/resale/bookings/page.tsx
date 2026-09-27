"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket,
  ArrowRight,
  Search,
  Filter,
  Plane,
  Hotel,
  Car,
  TrendingUp,
  DollarSign,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  FileText,
} from "lucide-react";
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

type B2BBooking = {
  id: string;
  bookingRef: string;
  companyId: string;
  companyName: string;
  serviceType: "flight" | "hotel" | "transfer";
  passengerName: string;
  passengerEmail?: string;
  netSupplierPrice: number;
  markupAmount: number;
  markupPercent: number;
  totalWalletDeducted: number;
  currency: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
  details?: Record<string, any>;
};

export default function ResaleB2BBookingsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<B2BBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<B2BBooking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resale/b2b-bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.bookingRef?.toLowerCase().includes(q) ||
      b.companyName?.toLowerCase().includes(q) ||
      b.passengerName?.toLowerCase().includes(q);
    const matchService = serviceFilter === "all" || b.serviceType === serviceFilter;
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchService && matchStatus;
  });

  const totalVolume = bookings.reduce((acc, b) => acc + (b.totalWalletDeducted || 0), 0);
  const totalProfit = bookings.reduce((acc, b) => acc + (b.markupAmount || 0), 0);
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  const columns: ColumnDef<B2BBooking>[] = [
    {
      key: "bookingRef",
      title: "رقم الحجز والنوع",
      render: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            {b.serviceType === "flight" && <Plane className="size-4" />}
            {b.serviceType === "hotel" && <Hotel className="size-4" />}
            {b.serviceType === "transfer" && <Car className="size-4" />}
          </div>
          <div>
            <span className="font-mono font-black text-amber-400 text-xs tracking-wide">{b.bookingRef}</span>
            <p className="text-[11px] text-muted-foreground capitalize">{b.serviceType}</p>
          </div>
        </div>
      ),
    },
    {
      key: "companyName",
      title: "الشركة الشريكة (B2B Tenant)",
      render: (b) => (
        <span className="font-bold text-foreground text-xs">{b.companyName}</span>
      ),
    },
    {
      key: "passengerName",
      title: "اسم المسافر",
      render: (b) => (
        <div>
          <p className="font-semibold text-foreground text-xs">{b.passengerName}</p>
          {b.passengerEmail && <p className="text-[10px] text-muted-foreground">{b.passengerEmail}</p>}
        </div>
      ),
    },
    {
      key: "netSupplierPrice",
      title: "سعر المورد الصافي",
      render: (b) => (
        <span className="font-mono text-muted-foreground text-xs tabular-nums">
          ${(b.netSupplierPrice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "markupAmount",
      title: "هامش المنصة",
      render: (b) => (
        <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums">
          +${(b.markupAmount || 0).toLocaleString()} ({b.markupPercent || 0}%)
        </span>
      ),
    },
    {
      key: "totalWalletDeducted",
      title: "المخصوم من المحفظة",
      render: (b) => (
        <span className="font-mono font-black text-foreground text-xs tabular-nums">
          ${(b.totalWalletDeducted || 0).toLocaleString()} USD
        </span>
      ),
    },
    {
      key: "status",
      title: "حالة الحجز",
      render: (b) => (
        <EnterpriseStatusBadge
          status={
            b.status === "confirmed"
              ? "active"
              : b.status === "pending"
              ? "pending"
              : "cancelled"
          }
          label={
            b.status === "confirmed"
              ? "مؤكد ومصدر"
              : b.status === "pending"
              ? "قيد الإصدار"
              : "ملغي"
          }
        />
      ),
    },
    {
      key: "actions",
      title: "التفاصيل",
      align: "left",
      render: (b) => (
        <button
          type="button"
          onClick={() => setSelectedBooking(b)}
          className="p-1.5 rounded-xl bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
          title="عرض التفاصيل"
        >
          <Eye className="size-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <EnterprisePageHeader
        icon={Ticket}
        title="سجل حجوزات ومبيعات شبكة التوزيع (B2B Bookings)"
        description="سجل حي لكافة الحجوزات الصادرة عبر محفظة الشركاء وهوامش ربح المنصة المحصلة لحظياً."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الموزعين", href: "/admin/resale" },
          { label: "حجوزات B2B" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/resale"
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-xs font-bold text-foreground backdrop-blur-md transition-all hover:bg-card hover:border-primary/40 active:scale-95"
            >
              <ArrowRight className="size-4" />
              منصة التوزيع
            </Link>
            <button
              type="button"
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </div>
        }
      />

      <EnterpriseKpiGrid cols={3}>
        <EnterpriseKpiCard
          label="إجمالي حجم مبيعات B2B"
          value={`$${totalVolume.toLocaleString()} USD`}
          hint="مخصومة تلقائياً من محافظ الشركاء"
          icon={TrendingUp}
          tone="royal"
        />
        <EnterpriseKpiCard
          label="صافي أرباح هوامش المنصة"
          value={`$${totalProfit.toLocaleString()} USD`}
          hint="فارق سعر المورد المحصل نقدياً فوراً"
          icon={DollarSign}
          tone="emerald"
        />
        <EnterpriseKpiCard
          label="الحجوزات المؤكدة"
          value={confirmedCount}
          hint="موزعة بين الطيران والفنادق والمواصلات"
          icon={Ticket}
          tone="indigo"
        />
      </EnterpriseKpiGrid>

      <div className="space-y-4">
        <EnterpriseFilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="بحث برقم الحجز، اسم المسافر، أو اسم الشركة..."
          totalResults={filteredBookings.length}
          filterTabs={[
            { id: "all", label: "جميع الخدمات" },
            { id: "flight", label: "طيران" },
            { id: "hotel", label: "فنادق" },
            { id: "transfer", label: "مواصلات" },
          ]}
          activeTab={serviceFilter}
          onTabChange={setServiceFilter}
        />

        <EnterpriseDataTable
          data={filteredBookings}
          columns={columns}
          keyExtractor={(b) => b.id}
          loading={loading}
          emptyTitle="لا توجد حجوزات مطابقة"
          emptyDescription="لم يتم العثور على أي حجز صادر عبر شبكة التوزيع يطابق الفلترة الحالية."
        />
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <EnterpriseModal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`تفاصيل الحجز: ${selectedBooking.bookingRef}`}
          description={`الشركة: ${selectedBooking.companyName} · العميل: ${selectedBooking.passengerName}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-card/60 border border-border/50">
              <div>
                <span className="text-muted-foreground block text-[11px]">النوع:</span>
                <span className="font-bold text-foreground capitalize">{selectedBooking.serviceType}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">الحالة:</span>
                <EnterpriseStatusBadge
                  status={selectedBooking.status === "confirmed" ? "active" : "cancelled"}
                  label={selectedBooking.status === "confirmed" ? "مؤكد" : "ملغي"}
                  size="sm"
                />
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">سعر المورد:</span>
                <span className="font-mono font-bold text-foreground">${selectedBooking.netSupplierPrice}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">ربح المنصة:</span>
                <span className="font-mono font-bold text-emerald-400">+${selectedBooking.markupAmount}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="font-bold text-foreground">إجمالي الخصم من المحفظة:</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  ${selectedBooking.totalWalletDeducted} USD
                </span>
              </div>
            </div>

            {selectedBooking.details && (
              <div className="p-4 rounded-2xl bg-background/50 border border-border/40 font-mono text-[11px] overflow-x-auto text-muted-foreground">
                <pre>{JSON.stringify(selectedBooking.details, null, 2)}</pre>
              </div>
            )}
          </div>
        </EnterpriseModal>
      )}
    </div>
  );
}
