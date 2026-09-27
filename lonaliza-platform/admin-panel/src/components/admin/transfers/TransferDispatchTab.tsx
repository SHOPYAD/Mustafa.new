// src/components/admin/transfers/TransferDispatchTab.tsx
"use client";

import React, { useState } from "react";
import {
  Send,
  Search,
  Filter,
  Car,
  Clock,
  User,
  Phone,
  Plane,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  FileText,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface Props {
  bookings: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenAssign: (booking: any) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onChangeStatus: (bookingId: string, status: string) => Promise<void>;
}

export const TransferDispatchTab: React.FC<Props> = ({
  bookings,
  isLoading,
  onRefresh,
  onOpenAssign,
  onCancelBooking,
  onChangeStatus,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = bookings.filter((b) => {
    if (b.serviceType !== "transfer") return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.bookingNumber?.toLowerCase().includes(q) ||
      b.contact?.name?.toLowerCase().includes(q) ||
      b.contact?.phone?.includes(q) ||
      b.legs?.[0]?.fromLabel?.toLowerCase().includes(q) ||
      b.legs?.[0]?.toLabel?.toLowerCase().includes(q) ||
      b.assignment?.driverName?.toLowerCase().includes(q) ||
      b.assignment?.plateNumber?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_assignment":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">في انتظار تعيين سائق</span>;
      case "assigned":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-500 border border-sky-500/30">تم تعيين السائق</span>;
      case "on_the_way":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">السائق في الطريق</span>;
      case "arrived":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-500 border border-purple-500/30">وصل لموقع الاستقبال</span>;
      case "in_progress":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">الرحلة جارية</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">مكتملة بنجاح</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">ملغية</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الحجز، اسم العميل، السائق..."
            className="w-full pr-10 pl-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/50 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {["all", "pending_assignment", "assigned", "in_progress", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "all" ? "الكل" : st === "pending_assignment" ? "في الانتظار" : st === "assigned" ? "معينة" : st === "in_progress" ? "جارية" : st === "completed" ? "مكتملة" : "ملغية"}
            </button>
          ))}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-colors shrink-0"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border/60">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">لا توجد حجوزات نقل مطابقة</h3>
          <p className="text-xs text-muted-foreground">عند حجز عميل لترانسفير ستظهر هنا فوراً في قائمة التوزيع للتعيين اللحظي.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Info & Route */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-foreground px-2.5 py-0.5 rounded-lg bg-muted border border-border/50">
                      {b.bookingNumber}
                    </span>
                    {getStatusBadge(b.status)}
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {b.vehicleClassName || "مرسيدس VIP"}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(b.createdAt).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>

                  {/* Route details */}
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{b.legs?.[0]?.fromLabel || "نقطة الانطلاق"}</span>
                    <span className="text-muted-foreground">←</span>
                    <span>{b.legs?.[0]?.toLabel || "الوجهة"}</span>
                  </div>

                  {/* Guest, passengers, and flight info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-foreground font-semibold">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      {b.contact?.name}
                    </span>
                    <span className="flex items-center gap-1 font-mono" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {b.contact?.phone}
                    </span>
                    {b.flightNumber && (
                      <span className="flex items-center gap-1 text-sky-400 font-mono font-bold bg-sky-500/10 px-2 py-0.5 rounded">
                        <Plane className="w-3.5 h-3.5" />
                        {b.flightNumber}
                      </span>
                    )}
                    <span>الركاب: <strong className="text-foreground">{b.passengers?.adults + (b.passengers?.children || 0)}</strong></span>
                    <span>الحقائب: <strong className="text-foreground">{b.luggage?.large + (b.luggage?.small || 0)}</strong></span>
                    {b.passengerPassports?.length > 0 && (
                      <span className="text-emerald-500 font-semibold">
                        ✓ {b.passengerPassports.length} جوازات سفر مرفوعة
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle: Driver & Assignment */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 min-w-[220px] text-xs space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground">السائق والسيارة المعينة:</div>
                  {b.assignment?.driverName ? (
                    <div>
                      <div className="font-bold text-foreground flex items-center justify-between">
                        <span>{b.assignment.driverName}</span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-background border border-border">
                          {b.assignment.plateNumber}
                        </span>
                      </div>
                      <div className="text-muted-foreground font-mono mt-0.5" dir="ltr">{b.assignment.driverPhone}</div>
                    </div>
                  ) : (
                    <div className="text-amber-500 font-bold py-1">
                      ⚠️ لم يتم تعيين سائق بعد
                    </div>
                  )}
                </div>

                {/* Right: Pricing & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2.5 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-emerald-500 font-mono">
                      ${b.pricing?.total} {b.pricing?.currency || "USD"}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {b.paymentMode === "online_full" ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> مدفوع بالكامل أونلاين
                        </span>
                      ) : b.paymentMode === "deposit_half" ? (
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> تم دفع عربون ${b.pricing?.depositPaid} (متبقي كاش ${b.pricing?.remainingToCollect})
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <Banknote className="w-3 h-3" /> تحصيل كاش كامل عند الوصول (${b.pricing?.total})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAssign(b)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
                    >
                      {b.assignment?.driverName ? "تغيير السائق" : "تعيين سائق"}
                    </button>

                    {b.status !== "cancelled" && b.status !== "completed" && (
                      <button
                        onClick={() => {
                          if (confirm("هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟")) {
                            onCancelBooking(b.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-muted hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="إلغاء الحجز"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
