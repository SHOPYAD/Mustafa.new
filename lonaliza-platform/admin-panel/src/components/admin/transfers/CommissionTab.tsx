// src/components/admin/transfers/CommissionTab.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign,
  Building2,
  TrendingUp,
  Receipt,
  FileCheck2,
  CreditCard,
  Banknote,
  Search,
  ExternalLink,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface Props {
  suppliers: any[];
  bookings: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddPayoutVoucher: (data: any) => Promise<void>;
}

export const CommissionTab: React.FC<Props> = ({
  suppliers,
  bookings,
  isLoading,
  onRefresh,
  onAddPayoutVoucher,
}) => {
  const [search, setSearch] = useState("");
  const [selectedSupplierForVoucher, setSelectedSupplierForVoucher] = useState<any | null>(null);
  const [voucherAmount, setVoucherAmount] = useState("");
  const [voucherUrl, setVoucherUrl] = useState("");
  const [voucherNote, setVoucherNote] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial calculations
  const financialStats = useMemo(() => {
    let totalGrossRevenue = 0;
    let totalPlatformCommission = 0;
    let totalSupplierNet = 0;
    let totalCollectedCash = 0;
    let totalPaidOnline = 0;

    bookings.forEach((b) => {
      if (b.status === "cancelled") return;
      const total = Number(b.pricing?.total || 0);
      const commission = Number(b.pricing?.commissionAmount || total * 0.15);
      const net = Number(b.pricing?.supplierNet || total - commission);

      totalGrossRevenue += total;
      totalPlatformCommission += commission;
      totalSupplierNet += net;

      if (b.paymentMode === "cash_arrival") {
        totalCollectedCash += total;
      } else if (b.paymentMode === "online_full") {
        totalPaidOnline += total;
      } else if (b.paymentMode === "deposit_half") {
        totalPaidOnline += Number(b.pricing?.depositPaid || total * 0.5);
        totalCollectedCash += Number(b.pricing?.remainingToCollect || total * 0.5);
      }
    });

    // Total vouchers recorded
    let totalVouchersPaid = 0;
    suppliers.forEach((s) => {
      if (Array.isArray(s.payoutVouchers)) {
        s.payoutVouchers.forEach((v: any) => {
          totalVouchersPaid += Number(v.amount || 0);
        });
      }
    });

    const pendingSettlements = Math.max(0, totalSupplierNet - totalVouchersPaid);

    return {
      totalGrossRevenue,
      totalPlatformCommission,
      totalSupplierNet,
      totalPaidOnline,
      totalCollectedCash,
      totalVouchersPaid,
      pendingSettlements,
    };
  }, [bookings, suppliers]);

  // Per-supplier breakdown
  const supplierFinancials = useMemo(() => {
    return suppliers
      .map((supplier) => {
        const supBookings = bookings.filter(
          (b) => b.assignment?.supplierId === supplier.id && b.status !== "cancelled"
        );
        const completedTrips = supBookings.filter((b) => b.status === "completed").length;
        const gross = supBookings.reduce((sum, b) => sum + Number(b.pricing?.total || 0), 0);
        const commPct = Number(supplier.commissionPct || 15);
        const platformCut = supBookings.reduce(
          (sum, b) => sum + Number(b.pricing?.commissionAmount || Number(b.pricing?.total || 0) * (commPct / 100)),
          0
        );
        const supplierNet = gross - platformCut;

        let totalPaidVouchers = 0;
        if (Array.isArray(supplier.payoutVouchers)) {
          supplier.payoutVouchers.forEach((v: any) => {
            totalPaidVouchers += Number(v.amount || 0);
          });
        }
        const balanceDue = Math.max(0, supplierNet - totalPaidVouchers);

        return {
          ...supplier,
          assignedTripsCount: supBookings.length,
          completedTrips,
          grossRevenue: gross,
          platformCut,
          supplierNet,
          totalPaidVouchers,
          balanceDue,
          vouchers: supplier.payoutVouchers || [],
        };
      })
      .filter((s) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          s.tradeName?.toLowerCase().includes(q) ||
          s.legalName?.toLowerCase().includes(q) ||
          s.contactPhone?.includes(q)
        );
      });
  }, [suppliers, bookings, search]);

  const handleOpenVoucherModal = (supplier: any) => {
    setSelectedSupplierForVoucher(supplier);
    setVoucherAmount(supplier.balanceDue > 0 ? String(supplier.balanceDue) : "");
    setVoucherUrl("");
    setVoucherNote("");
    const now = new Date();
    const prevWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    setWeekStart(prevWeek.toISOString().slice(0, 10));
    setWeekEnd(now.toISOString().slice(0, 10));
  };

  const handleSubmitVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherAmount || !voucherUrl || !selectedSupplierForVoucher) {
      alert("يرجى إدخال المبلغ ورابط سند التحويل");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddPayoutVoucher({
        supplierId: selectedSupplierForVoucher.id,
        amount: Number(voucherAmount),
        currency: "USD",
        weekStart: weekStart || new Date().toISOString().slice(0, 10),
        weekEnd: weekEnd || new Date().toISOString().slice(0, 10),
        voucherUrl: voucherUrl.trim(),
        note: voucherNote.trim() || undefined,
      });
      setSelectedSupplierForVoucher(null);
      setVoucherAmount("");
      setVoucherUrl("");
      setVoucherNote("");
      onRefresh();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حفظ سند التحويل");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Top Financial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-card border border-border/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
              المالية والمحاسبة الآلية
            </span>
            <span className="text-xs text-muted-foreground font-mono">Commission & Payout Ledger</span>
          </div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            عمولات المنصة ومستحقات الشركات الشريكة
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            حساب عمولات منصة لوناليزا بدقة، تدقيق الدفع النقدي مع السائق مقابل الدفع الإلكتروني، وتسجيل سندات التحويل الأسبوعية.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">إجمالي حجم الرحلات</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
            ${financialStats.totalGrossRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground">
            أونلاين: ${financialStats.totalPaidOnline.toLocaleString()} | كاش: ${financialStats.totalCollectedCash.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-emerald-500/30 bg-emerald-500/5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold">عمولة منصة لوناليزا</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
            ${financialStats.totalPlatformCommission.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
            صافي أرباح المنصة من التوصيل والجولات
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">صافي مستحقات الشركات</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
            ${financialStats.totalSupplierNet.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground">
            بعد خصم نسبة العمولة المتفق عليها
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-rose-500/20 bg-rose-500/5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-semibold">أرصدة قيد التسوية</span>
            <Receipt className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-500 font-mono">
            ${financialStats.pendingSettlements.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-500/80 font-medium">
            المستحق دفعه للشركات بالسندات
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">كشف حساب مستحقات الشركات والسائقين</h3>
            <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-bold text-muted-foreground">
              {supplierFinancials.length} شركة مسجلة
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الهاتف..."
              className="w-full pr-9 pl-3 py-1.5 rounded-xl text-xs bg-muted/50 border border-border/60 focus:outline-hidden focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
              <tr>
                <th className="p-3">الشركة / المورد</th>
                <th className="p-3">نموذج التسوية</th>
                <th className="p-3 text-center">نسبة العمولة</th>
                <th className="p-3 text-center">الرحلات المنفذة</th>
                <th className="p-3">إجمالي الإيرادات</th>
                <th className="p-3 text-emerald-600 dark:text-emerald-400">عمولة لوناليزا</th>
                <th className="p-3">صافي المستحق للمورد</th>
                <th className="p-3">المسدد بسندات</th>
                <th className="p-3">الرصيد المتبقي</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {supplierFinancials.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-sans font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                        {s.tradeName.slice(0, 2)}
                      </div>
                      <div>
                        <div>{s.tradeName}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{s.contactPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted border border-border/50 text-foreground">
                      {s.settlementModel === "weekly"
                        ? "أسبوعي"
                        : s.settlementModel === "monthly"
                        ? "شهري"
                        : "لكل رحلة"}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-amber-500">
                    {s.commissionPct}%
                  </td>
                  <td className="p-3 text-center font-bold text-foreground">
                    {s.completedTrips} / {s.assignedTripsCount}
                  </td>
                  <td className="p-3 font-bold text-foreground">
                    ${s.grossRevenue.toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-emerald-500">
                    ${s.platformCut.toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-foreground">
                    ${s.supplierNet.toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-sky-500">
                    ${s.totalPaidVouchers.toLocaleString()}
                  </td>
                  <td className="p-3 font-bold">
                    {s.balanceDue > 0 ? (
                      <span className="text-rose-500">${s.balanceDue.toLocaleString()}</span>
                    ) : (
                      <span className="text-emerald-500">مُسوّى بالكامل ✓</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-sans">
                    <button
                      onClick={() => handleOpenVoucherModal(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إصدار سند تحويل</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Voucher Modal */}
      {selectedSupplierForVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn" dir="rtl">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">
                  تسجيل سند تحويل مالي: {selectedSupplierForVoucher.tradeName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSupplierForVoucher(null)}
                className="w-7 h-7 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitVoucher} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <div className="font-bold">المستحق الحالي للشركة: ${selectedSupplierForVoucher.balanceDue.toLocaleString()} USD</div>
                <div className="text-[11px] mt-0.5">بعد خصم نسبة عمولة المنصة المتفق عليها ({selectedSupplierForVoucher.commissionPct}%).</div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">المبلغ المحول ($ USD) *</label>
                <input
                  type="number"
                  required
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(e.target.value)}
                  placeholder="مثال: 500"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 font-mono text-sm focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">بداية أسبوع التسوية</label>
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">نهاية أسبوع التسوية</label>
                  <input
                    type="date"
                    value={weekEnd}
                    onChange={(e) => setWeekEnd(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">رابط إشعار التحويل البنكي (PDF / صورة) *</label>
                <input
                  type="url"
                  required
                  value={voucherUrl}
                  onChange={(e) => setVoucherUrl(e.target.value)}
                  placeholder="https://... أو /uploads/payouts/receipt-001.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 font-mono text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">ملاحظات محاسبية إضافية</label>
                <textarea
                  rows={2}
                  value={voucherNote}
                  onChange={(e) => setVoucherNote(e.target.value)}
                  placeholder="رقم الحوالة البنكية، اسم المستلم، تفاصيل الحساب..."
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForVoucher(null)}
                  className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "تأكيد وإصدار السند"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
