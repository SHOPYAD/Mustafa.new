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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full w-fit mb-2">
            <Ticket className="size-3.5" />
            <span>سجل العمليات التشغيلية والمالية B2B</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            سجل حجوزات ومبيعات شبكة التوزيع (B2B Bookings Ledger)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            سجل حي لكافة الحجوزات الصادرة عبر محفظة الشركاء وهوامش ربح المنصة المحصلة لحظياً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/resale"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowRight className="size-4" />
            <span>منصة التوزيع</span>
          </Link>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي حجم مبيعات B2B</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">${totalVolume.toLocaleString()}</span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-bold">مخصومة تلقائياً من محافظ الشركاء</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">صافي أرباح هوامش المنصة (Platform Profit)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">${totalProfit.toLocaleString()}</span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold">فارق سعر المورد المحصل نقدياً فوراً</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">عدد التذاكر والحجوزات المؤكدة</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700 font-mono">{confirmedCount}</span>
            <span className="text-xs text-slate-400">حجز مؤكد</span>
          </div>
          <p className="text-[11px] text-purple-700 font-bold">موزعة بين الطيران والفنادق والمواصلات</p>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="size-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="بحث برقم الحجز أو اسم العميل أو الشريك..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="all">كافة الخدمات (All)</option>
              <option value="flight">طيران فقط (Flights)</option>
              <option value="hotel">فنادق فقط (Hotels)</option>
              <option value="transfer">مواصلات فقط (Transfers)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="all">كافة الحالات</option>
              <option value="confirmed">مؤكد (Confirmed)</option>
              <option value="pending">قيد المعالجة (Pending)</option>
              <option value="cancelled">ملغي (Cancelled)</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-bold">
            عدد النتائج: {filteredBookings.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-slate-400 border-b border-slate-100 uppercase">
              <tr>
                <th className="pb-3 pr-2 font-bold">الخدمة ورقم المرجع</th>
                <th className="pb-3 font-bold">شركة الشريك</th>
                <th className="pb-3 font-bold">اسم المسافر الرئيسي</th>
                <th className="pb-3 font-bold">صافي المورد</th>
                <th className="pb-3 font-bold">هامش المنصة</th>
                <th className="pb-3 font-bold">المخصوم من المحفظة</th>
                <th className="pb-3 font-bold">الحالة والتاريخ</th>
                <th className="pb-3 pl-2 text-left font-bold">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    لا توجد حجوزات مسجلة حتى الآن
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                            b.serviceType === "flight"
                              ? "bg-purple-50 text-purple-700"
                              : b.serviceType === "hotel"
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {b.serviceType === "flight" ? (
                            <Plane className="size-4" />
                          ) : b.serviceType === "hotel" ? (
                            <Hotel className="size-4" />
                          ) : (
                            <Car className="size-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-mono font-black text-slate-900 block">{b.bookingRef}</span>
                          <span className="text-[10px] text-slate-500 uppercase">
                            {b.serviceType === "flight"
                              ? "طيران لوناليزا"
                              : b.serviceType === "hotel"
                              ? "فنادق لوناليزا"
                              : "مواصلات لوناليزا"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-900">{b.companyName}</td>
                    <td className="py-4 text-slate-700">{b.passengerName}</td>
                    <td className="py-4 font-mono text-slate-600">${(b.netSupplierPrice || 0).toFixed(2)}</td>
                    <td className="py-4 font-mono font-bold text-emerald-600">
                      +${(b.markupAmount || 0).toFixed(2)} ({b.markupPercent || 0}%)
                    </td>
                    <td className="py-4 font-mono font-black text-slate-900 text-sm">
                      ${(b.totalWalletDeducted || 0).toFixed(2)}
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                            b.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <CheckCircle2 className="size-3" />
                          <span>{b.status === "confirmed" ? "مؤكد" : "قيد المعالجة"}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(b.createdAt).toLocaleDateString("ar-EG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pl-2 text-left">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer"
                        title="عرض التفاصيل"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                <FileText className="size-5 text-indigo-600" />
                <span>تفاصيل الحجز B2B — {selectedBooking.bookingRef}</span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[11px]">الشركة الشريكة</span>
                <span className="font-bold text-slate-900">{selectedBooking.companyName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">اسم المسافر</span>
                <span className="font-bold text-slate-900">{selectedBooking.passengerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">صافي المورد الخام</span>
                <span className="font-mono font-bold text-slate-700">${selectedBooking.netSupplierPrice} USD</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">هامش ربح لوناليزا</span>
                <span className="font-mono font-bold text-emerald-600">+${selectedBooking.markupAmount} USD</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">إجمالي المخصوم من المحفظة:</span>
                <span className="font-mono font-black text-indigo-700 text-sm">
                  ${selectedBooking.totalWalletDeducted} USD
                </span>
              </div>
            </div>

            {selectedBooking.details && (
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">بيانات التذكرة / القسيمة الإضافية:</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-40">
                  {JSON.stringify(selectedBooking.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
