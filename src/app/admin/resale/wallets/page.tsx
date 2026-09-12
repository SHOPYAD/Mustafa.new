"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
  X,
  ExternalLink,
  Unlock,
} from "lucide-react";

type CompanyWallet = {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  domain?: string;
  planType?: string;
  walletBalance: number;
  walletHoldBalance: number;
  minDepositMet: boolean;
};

type PendingDeposit = {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  paymentMethod: "bank_transfer" | "credit_card";
  status: "pending" | "approved" | "rejected" | "held";
  referenceNumber: string;
  bankReceiptUrl?: string;
  createdAt: string;
  holdUntil?: string;
};

export default function ResaleWalletsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyWallet[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Manual Adjustment Modal
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWallet | null>(null);
  const [adjType, setAdjType] = useState<"credit" | "debit">("credit");
  const [adjAmount, setAdjAmount] = useState<number>(100);
  const [adjReason, setAdjReason] = useState("");
  const [adjSubmitting, setAdjSubmitting] = useState(false);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchWalletsData();
  }, []);

  async function fetchWalletsData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resale/wallets");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
        setPendingDeposits(data.pendingDeposits || []);
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "فشل تحميل بيانات المحافظ" });
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveDeposit(txId: string) {
    setActionLoadingId(txId);
    try {
      const res = await fetch("/api/admin/resale/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_bank_deposit", transactionId: txId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل اعتماد الإيداع");
      setNotification({ type: "success", message: "تم اعتماد التحويل وشحن محفظة الشريك فورياً!" });
      fetchWalletsData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "حدث خطأ أثناء الاعتماد" });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRejectDeposit(txId: string) {
    const reason = prompt("يرجى إدخال سبب رفض الإيداع:");
    if (reason === null) return;

    setActionLoadingId(txId);
    try {
      const res = await fetch("/api/admin/resale/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_deposit", transactionId: txId, notes: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل رفض الإيداع");
      setNotification({ type: "success", message: "تم رفض عملية الإيداع وتحديث الحالة" });
      fetchWalletsData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "حدث خطأ أثناء الرفض" });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReleaseHold(txId: string) {
    setActionLoadingId(txId);
    try {
      const res = await fetch("/api/admin/resale/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release_card_hold", transactionId: txId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل فك تعليق الرصيد");
      setNotification({ type: "success", message: "تم فك تعليق الرصيد وإضافته للرصيد المتاح للشركاء!" });
      fetchWalletsData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "حدث خطأ" });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleManualAdjustment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompany) return;
    setAdjSubmitting(true);
    try {
      const res = await fetch("/api/admin/resale/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_adjustment",
          companyId: selectedCompany.id,
          amount: adjType === "credit" ? Math.abs(adjAmount) : -Math.abs(adjAmount),
          notes: adjReason || "تسوية إدارية مباشرة",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تطبيق التسوية");
      setNotification({ type: "success", message: "تم تطبيق التسوية المالية بنجاح!" });
      setAdjModalOpen(false);
      fetchWalletsData();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "فشلت التسوية المالية" });
    } finally {
      setAdjSubmitting(false);
    }
  }

  const filteredCompanies = companies.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.companyName?.toLowerCase().includes(q) ||
      c.contactEmail?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q)
    );
  });

  const totalAvailableAll = companies.reduce((acc, c) => acc + (c.walletBalance || 0), 0);
  const totalHeldAll = companies.reduce((acc, c) => acc + (c.walletHoldBalance || 0), 0);
  const activeCompaniesCount = companies.filter((c) => c.minDepositMet).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full w-fit mb-2">
            <Coins className="size-3.5" />
            <span>إدارة الأرصدة المالية والمحفظة الرقمية B2B</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            محافظ الشركاء B2B والتحويلات البنكية (Partner Wallets Hub)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            مراقبة أرصدة الشركاء، اعتماد التحويلات البنكية، فك تعليق بطاقات الائتمان، وإجراء التسويات المالية.
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
            onClick={fetchWalletsData}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي الأرصدة المتاحة للشركاء</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">${totalAvailableAll.toLocaleString()}</span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">جاهزة لإصدار الحجوزات والتذاكر فورياً</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">الأرصدة المعلقة للبطاقات (Hold)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 font-mono">${totalHeldAll.toLocaleString()}</span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-amber-700 font-bold">في فترة حماية الإلغاء والاحتيال</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500">الشركات المفعلة للحجز (≥ 2,000$)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700 font-mono">
              {activeCompaniesCount} / {companies.length}
            </span>
            <span className="text-xs text-slate-400">شركة</span>
          </div>
          <p className="text-[11px] text-purple-700 font-bold">استوفت سقف الإيداع المسبق المطلوب</p>
        </div>
      </div>

      {/* Pending Bank Transfer Approvals Queue */}
      {pendingDeposits.length > 0 && (
        <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/40 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-amber-600" />
              <h2 className="text-base font-black text-amber-950">
                طلبات إيداع قيد المراجعة والاعتماد ({pendingDeposits.length})
              </h2>
            </div>
            <span className="text-xs text-amber-800 font-bold bg-amber-100 px-3 py-1 rounded-full">
              تحويلات بنكية / بطاقات معلقة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-slate-500 border-b border-amber-200/80">
                <tr>
                  <th className="pb-3 pr-2 font-bold">الشركة</th>
                  <th className="pb-3 font-bold">المبلغ</th>
                  <th className="pb-3 font-bold">طريقة الدفع</th>
                  <th className="pb-3 font-bold">رقم الإشعار / المرجع</th>
                  <th className="pb-3 font-bold">التاريخ</th>
                  <th className="pb-3 pl-2 text-left font-bold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/50">
                {pendingDeposits.map((tx) => (
                  <tr key={tx.id} className="hover:bg-amber-100/50 transition-colors">
                    <td className="py-3 pr-2 font-bold text-slate-900">{tx.companyName || tx.companyId}</td>
                    <td className="py-3 font-mono font-black text-emerald-700">${tx.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-white border border-amber-200 text-amber-900 font-bold text-[11px]">
                        {tx.paymentMethod === "bank_transfer" ? "تحويل بنكي" : "بطاقة ائتمان"}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      {tx.referenceNumber}
                      {tx.bankReceiptUrl && (
                        <a
                          href={tx.bankReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mr-2 inline-flex items-center gap-1 text-purple-700 hover:underline"
                        >
                          <Eye className="size-3" />
                          <span>عرض الإشعار</span>
                        </a>
                      )}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString("ar-EG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 pl-2 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {tx.status === "held" ? (
                          <button
                            onClick={() => handleReleaseHold(tx.id)}
                            disabled={actionLoadingId === tx.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-all cursor-pointer"
                          >
                            <Unlock className="size-3.5" />
                            <span>فك التعليق الآن</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApproveDeposit(tx.id)}
                              disabled={actionLoadingId === tx.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer"
                            >
                              <Check className="size-3.5" />
                              <span>اعتماد وشحن</span>
                            </button>
                            <button
                              onClick={() => handleRejectDeposit(tx.id)}
                              disabled={actionLoadingId === tx.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-all cursor-pointer"
                            >
                              <X className="size-3.5" />
                              <span>رفض</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Companies Wallets Ledger */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">سجل أرصدة ومحافظ الشركات المسجلة</h2>
            <p className="text-xs text-slate-500">
              استعراض كافة الشركاء وإجراء تسويات وإضافات نقدية فورية.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="size-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="بحث بالاسم أو البريد أو النطاق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-slate-400 border-b border-slate-100 uppercase">
              <tr>
                <th className="pb-3 pr-2 font-bold">الشركة والنطاق</th>
                <th className="pb-3 font-bold">نوع الباقة</th>
                <th className="pb-3 font-bold">الرصيد المتاح</th>
                <th className="pb-3 font-bold">الرصيد المعلق</th>
                <th className="pb-3 font-bold">حالة الحجوزات</th>
                <th className="pb-3 pl-2 text-left font-bold">إجراء تسوية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    لا توجد شركات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-2">
                      <div className="space-y-0.5">
                        <span className="font-black text-slate-900 text-sm block">{comp.companyName}</span>
                        <span className="text-[11px] text-slate-500 block">{comp.contactEmail}</span>
                        {comp.domain && (
                          <span className="text-[10px] font-mono text-purple-700">{comp.domain}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        {comp.planType === "whitelabel_free"
                          ? "وايت ليبل مجاني"
                          : comp.planType === "whitelabel_paid"
                          ? "وايت ليبل مدفوع"
                          : "ترخيص تملك دائم"}
                      </span>
                    </td>
                    <td className="py-4 font-mono font-black text-slate-900 text-sm">
                      ${(comp.walletBalance || 0).toLocaleString()}
                    </td>
                    <td className="py-4 font-mono text-amber-700 font-bold">
                      ${(comp.walletHoldBalance || 0).toLocaleString()}
                    </td>
                    <td className="py-4">
                      {comp.minDepositMet ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <CheckCircle2 className="size-3.5" />
                          <span>مفعل للحجز (≥ 2,000$)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <AlertCircle className="size-3.5" />
                          <span>دون السقف المطلوب</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 pl-2 text-left">
                      <button
                        onClick={() => {
                          setSelectedCompany(comp);
                          setAdjType("credit");
                          setAdjAmount(100);
                          setAdjReason("");
                          setAdjModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        <Coins className="size-3.5" />
                        <span>تسوية نقدية</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment Modal */}
      {adjModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                <Coins className="size-5 text-purple-600" />
                <span>تسوية محفظة شريك (Manual Adjustment)</span>
              </div>
              <button
                onClick={() => setAdjModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-950 text-xs space-y-1">
              <p className="font-bold">{selectedCompany.companyName}</p>
              <p className="text-[11px] text-purple-800">
                الرصيد المتاح الحالي: ${(selectedCompany.walletBalance || 0).toLocaleString()} USD
              </p>
            </div>

            <form onSubmit={handleManualAdjustment} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">نوع العملية</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjType("credit")}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      adjType === "credit"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <PlusCircle className="size-4" />
                    <span>إيداع رصيد (Credit)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType("debit")}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      adjType === "debit"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <MinusCircle className="size-4" />
                    <span>خصم رصيد (Debit)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">المبلغ ($ USD)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">سبب التسوية والملاحظات الإدارية</label>
                <textarea
                  rows={2}
                  required
                  placeholder="مثال: تعويض شريك، مكافأة شحن، تسوية حجز يدوي..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAdjModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={adjSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {adjSubmitting && <Loader2 className="size-4 animate-spin" />}
                  <span>تأكيد التسوية المالية</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
